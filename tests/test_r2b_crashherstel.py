"""Herstelronde 2B/4 — crashbestendige import/Terugzetten (P1) en eenmalige grafsteenovername (P2).

Onderbreking = echte renderer-crash (CDP Page.crash): de oude appcontext kan geen afbreek- of
rollbackhandler meer uitvoeren. Daarna heropenen met dezelfde opslag. De volledige toestand
(waarnemingen, lijsten, veiligheidskopie, plekken, grafstenen, foto's + koppelingen) wordt gelezen
via een kale pagina op dezelfde origin (geen appcode, dus geen herstel tijdens het meten).

A1  import: crash NA de localStorage-wijzigingen, VÓÓR de IndexedDB-commit → exact de toestand vóór
A2  import: crash direct NA de commit (vóór het opruimen) → exact de vastgelegde toestand erna
A3  na A1 en A2: nogmaals 2× heropenen → ongewijzigd, geen journaal/markering over
B1  Terugzetten: crash vóór de commit → exact de toestand vóór Terugzetten
B2  Terugzetten: crash direct na de commit → exact de toestand erna
B3  na B1 en B2: 2× heropenen → ongewijzigd
G4  migratie: oude grafsteen (birdspot-guard) + verouderde localStorage-plek X → X niet zichtbaar, grafstenen P en X
G5  geldige ZIP-herimport van P → foto, heropenen, nog een foto lukt; grafsteen X blijft actief (foto naar X geweigerd)
G6  onderbroken grafsteenovername → niets half; volgende start voltooit, eenmalig
G7  twee tabbladen starten tegelijk → één consistente overname; na herstel van P blijft P in beide bruikbaar

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: A1 B1 G4 G5 falen op 66673393).
BIRDSPOT_OLD_ROOT=<checkout 03bf663> is nodig voor G4–G7 (maakt de birdspot-guard-gegevens met de echte oude app).
"""
import http.server
import io
import json
import os
import signal
import sys
import time
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD  # noqa: E402
from test_r2b_p1_rest import export_zip  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
OLD_ROOT = Path(os.environ['BIRDSPOT_OLD_ROOT']).resolve() if os.environ.get('BIRDSPOT_OLD_ROOT') else None
SERVE = {'root': APP_ROOT}
RESULTS = []
DATA_KEYS = ['birdspot-sightings', 'birdspot-seen-species', 'birdspot-favorite-species',
             'birdspot-favorite-media', 'birdspot-film-selection', 'birdspot-safety-copy']

CRASH_HOOKS = """(() => {
  // Vasthouden op een exact punt, zodat de test de renderer daar kan laten crashen.
  const keys = %s;
  const set = Storage.prototype.setItem, rm = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { const r = set.call(this, k, v); if (window.__holdBeforeCommit && keys.includes(k)) window.__lsWritten = true; return r; };
  Storage.prototype.removeItem = function (k) { const r = rm.call(this, k); if (window.__holdBeforeCommit && keys.includes(k)) window.__lsWritten = true; return r; };
  const put = IDBObjectStore.prototype.put, del = IDBObjectStore.prototype.delete;
  const spin = store => { const r = store.count(); r.onsuccess = () => spin(store); };
  IDBObjectStore.prototype.put = function (...args) {
    // VÓÓR de commit: localStorage is al gewijzigd, de hoofdtransactie staat nog open.
    if (window.__holdBeforeCommit && window.__lsWritten && !window.__held && this.name === 'places' && this.transaction.mode === 'readwrite') {
      const r = put.apply(this, args); window.__held = 'voor-commit'; spin(this); return r;
    }
    if (this.name === 'meta' && this.transaction.mode === 'readwrite' && localStorage.getItem('__abortGuardMig') === '1') {
      this.transaction.abort(); throw new DOMException('test: overname onderbroken', 'AbortError');
    }
    return put.apply(this, args);
  };
  IDBObjectStore.prototype.delete = function (...args) {
    // DIRECT NA de commit: het journaal opruimen wordt niet meer uitgevoerd.
    if (window.__holdAfterCommit && !window.__held && this.name === 'opJournal') { window.__held = 'na-commit'; spin(this); return this.count(); }
    return del.apply(this, args);
  };
})();""" % json.dumps(DATA_KEYS)

PROBE_JS = """async ({ keys, journal }) => {
  const ls = Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)]));
  const db = await new Promise((ok, no) => { const r = indexedDB.open('birdspot-library'); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const names = [...db.objectStoreNames];
  const all = s => names.includes(s) ? new Promise((ok, no) => { const r = db.transaction(s).objectStore(s).getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); }) : Promise.resolve([]);
  const places = names.includes('places') ? (await all('places')) : (JSON.parse(localStorage.getItem('birdspot-places') || 'null')?.places || []);
  const out = {
    ls, places: places.map(p => JSON.stringify(p)).sort(), tombs: (await all('placeTombstones')).map(t => t.id).sort(),
    photos: (await all('photos')).map(p => [p.id, p.kind || null, p.placeId || null, p.sightingId || null, p.blob ? p.blob.size : null]).sort(),
    journal: journal ? (await all('opJournal')).length : null, pending: localStorage.getItem('birdspot-op-pending'),
  };
  db.close();
  return out;
}"""
ENV_ADD = """async placeId => {
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  const file = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'g.jpg', { type: 'image/jpeg' });
  try { await env.addEnvPhotos(placeId, [file]); return 'ok'; } catch (e) { return e.name + ': ' + e.message; }
}"""
REMOVED = "async ids => { const g = await import('/src/data/dataLock.js'); const out = []; for (const id of ids) if (await g.isPlaceRemoved(id)) out.push(id); return out; }"


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(SERVE['root']), **k)

    def log_message(self, *_):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def new_ctx(browser):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for script in (INIT, HOLD, CRASH_HOOKS):
        ctx.add_init_script(script)
    return ctx


def probe(ctx, url, journal=True):
    step(f'meten journaal={journal}')
    p = ctx.new_page()
    p.goto(url + '__probe__', wait_until='domcontentloaded')
    s = p.evaluate(PROBE_JS, {'keys': DATA_KEYS, 'journal': journal})
    p.close()
    return s


def core(s):
    return {k: s[k] for k in ('ls', 'places', 'tombs', 'photos')}


def consistent(s):
    photo_ids = {p[0] for p in s['photos']}
    place_ids = [json.loads(p)['id'] for p in s['places']]
    sightings = (json.loads(s['ls']['birdspot-sightings'] or 'null') or {}).get('sightings', [])
    dangling = sorted({pid for x in sightings for pid in (x.get('photoIds') or []) if pid not in photo_ids})
    orphans = sorted(p[0] for p in s['photos'] if p[1] == 'place-env' and p[2] not in place_ids)
    return {'ontbrekende_fotos': dangling, 'wees': orphans, 'dubbele_plekken': len(place_ids) - len(set(place_ids))}


def ok_consistent(s):
    return consistent(s) == {'ontbrekende_fotos': [], 'wees': [], 'dubbele_plekken': 0}


def step(msg):
    if os.environ.get('R2B_CRASH_TRACE'):
        print('  · ' + msg, flush=True)


BROWSER = {}


def crash(ctx, page):
    """Echte crash: alle rendererprocessen hard beëindigen (SIGKILL); er loopt geen JS meer."""
    step('crash')
    crashed = []
    page.on('crash', lambda _: crashed.append(True))
    info = BROWSER['cdp'].send('SystemInfo.getProcessInfo')
    pids = [p['id'] for p in info['processInfo'] if p.get('type') == 'renderer']
    for pid in pids:
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
    for _ in range(50):
        if crashed:
            break
        time.sleep(0.1)
    try:
        page.close()
    except Exception:
        pass
    assert crashed, f'renderer niet gecrasht (pids={pids})'



def reopen(ctx, url):
    step('heropenen')
    p = ctx.new_page()
    boot(p, url)
    p.wait_for_timeout(500)
    p.close()


def remap_zip(src, suffix):
    """Zelfde back-up met nieuwe ID's: nieuwe waarnemingen, foto's (+ koppelingen), plek R en een soort."""
    zin = zipfile.ZipFile(io.BytesIO(src))
    data = json.loads(zin.read('gegevens.json'))
    ren = lambda i: i + suffix  # noqa: E731
    for s in data['sightings']:
        s['id'] = ren(s['id'])
        s['photoIds'] = [ren(i) for i in s.get('photoIds') or []]
    data['photoIds'] = [ren(i) for i in data.get('photoIds') or []]
    for m in data.get('mediaMeta') or []:
        m['id'] = ren(m['id'])
        if m.get('sightingId'):
            m['sightingId'] = ren(m['sightingId'])
    data['places'] = (data.get('places') or []) + [{"id": "pl_r", "name": "Rietland R", "lat": 52.41, "lon": 5.51,
                                                    "createdAt": "2026-06-06T10:00:00.000Z", "updatedAt": "2026-06-06T10:00:00.000Z"}]
    data['seenSpecies'] = sorted(set((data.get('seenSpecies') or []) + ['sp150']))
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('gegevens.json', json.dumps(data))
        for name in zin.namelist():
            if name.startswith('photos/'):
                stem, ext = name[len('photos/'):].rsplit('.', 1)
                z.writestr(f'photos/{ren(stem)}.{ext}', zin.read(name))
    return out.getvalue()


def payload(name, data):
    return {"name": name, "mimeType": "application/zip", "buffer": data}


def fresh_profile(page):
    page.wait_for_timeout(1800)
    page.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    page.locator('#btnImport').wait_for(state='visible', timeout=10000)
    page.wait_for_timeout(300)


def start_import_held(page, data, flag):
    step('import starten ' + flag)
    page.evaluate(f"() => {{ window.{flag} = true; }}")
    page.locator('#importFile').set_input_files(data)
    page.locator('#confirmOverlay').wait_for(state='visible', timeout=15000)
    page.locator('#confirmOk').click()
    try:
        page.wait_for_function("() => !!window.__held", timeout=20000)
        return page.evaluate("() => window.__held")
    except Exception:
        return None


def start_restore_held(page, flag):
    page.evaluate(f"""() => {{ window.{flag} = true;
      import('/src/storage/backup.js').then(b => {{ window.__restore = b.restoreFromSafetyCopy().then(() => 'ok', e => 'fout: ' + e.message); }}); }}""")
    try:
        page.wait_for_function("() => !!window.__held", timeout=20000)
        return page.evaluate("() => window.__held")
    except Exception:
        return None


def baseline(browser, url, zpath):
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    fresh_profile(a)
    return ctx, a


def run_crash(browser, url, zpath):
    z2 = remap_zip(zpath.read_bytes(), '_z2')
    after_states = []

    # A1: import, crash vóór de commit
    ctx, a = baseline(browser, url, zpath)
    before = probe(ctx, url)
    held = start_import_held(a, payload('z2.zip', z2), '__holdBeforeCommit')
    crash(ctx, a)
    mid = probe(ctx, url)          # kale pagina, vóór heropenen: bewijs van de halve toestand na de crash
    reopen(ctx, url)
    s = probe(ctx, url)
    half = mid['ls'] != before['ls']
    check('A1', 'import: crash na localStorage, vóór de commit → na heropenen exact de toestand vóór de import',
          held == 'voor-commit' and half and core(s) == core(before) and ok_consistent(s) and s['journal'] in (0, None) and s['pending'] is None,
          f"vastgehouden={held} na_crash_half={half} ({consistent(mid)}) gelijk={core(s) == core(before)} "
          f"verschil={[k for k in core(s) if core(s)[k] != core(before)[k]]} {consistent(s)}")
    after_states.append((ctx, s))

    # A2: import, crash direct na de commit
    ctx2, a = baseline(browser, url, zpath)
    held = start_import_held(a, payload('z2.zip', z2), '__holdAfterCommit')
    expected = probe(ctx2, url, journal=False) if held else None
    crash(ctx2, a)
    mid = probe(ctx2, url)
    reopen(ctx2, url)
    s = probe(ctx2, url)
    complete = bool(expected) and 'pl_r' in ''.join(expected['places']) and any(p[0].endswith('_z2') for p in expected['photos'])
    check('A2', 'import: crash direct na de commit → na heropenen exact de volledig vastgelegde toestand erna',
          held == 'na-commit' and complete and core(s) == core(expected) and ok_consistent(s) and s['journal'] == 0 and s['pending'] is None,
          f"vastgehouden={held} journaal_na_crash={mid['journal']} volledig={complete} gelijk={bool(expected) and core(s) == core(expected)} {consistent(s)}")
    after_states.append((ctx2, s))

    # A3: herhaald heropenen
    stable = True
    for c, s0 in after_states:
        for _ in range(2):
            reopen(c, url)
        s1 = probe(c, url)
        stable = stable and core(s1) == core(s0) and s1['pending'] is None and s1['journal'] in (0, None)
    check('A3', 'na A1/A2 nogmaals 2× heropenen → ongewijzigd, geen journaal of markering over', stable)
    for c, _ in after_states:
        c.close()

    # B1/B2: Terugzetten na een volledig geslaagde import van z2
    restore_states = []
    for code, flag, want in (('B1', '__holdBeforeCommit', 'voor-commit'), ('B2', '__holdAfterCommit', 'na-commit')):
        ctx, a = baseline(browser, url, zpath)
        assert try_import(a, payload('z2.zip', z2))
        a.wait_for_timeout(500)
        before = probe(ctx, url)
        held = start_restore_held(a, flag)
        expected = probe(ctx, url, journal=False) if held == 'na-commit' else before
        crash(ctx, a)
        mid = probe(ctx, url)
        reopen(ctx, url)
        s = probe(ctx, url)
        if code == 'B1':
            check('B1', 'Terugzetten: crash vóór de commit → na heropenen exact de toestand vóór Terugzetten (incl. veiligheidskopie)',
                  held == want and mid['ls'] != before['ls'] and core(s) == core(before) and before['ls']['birdspot-safety-copy'] is not None and ok_consistent(s) and s['pending'] is None,
                  f"vastgehouden={held} na_crash_half={mid['ls'] != before['ls']} ({consistent(mid)}) gelijk={core(s) == core(before)} verschil={[k for k in core(s) if core(s)[k] != core(before)[k]]} {consistent(s)}")
        else:
            undone = expected['ls']['birdspot-safety-copy'] is None and not any(p[0].endswith('_z2') for p in expected['photos'])
            check('B2', 'Terugzetten: crash direct na de commit → na heropenen exact de toestand erna',
                  held == want and undone and core(s) == core(expected) and ok_consistent(s) and s['journal'] == 0 and s['pending'] is None,
                  f"vastgehouden={held} teruggezet={undone} gelijk={core(s) == core(expected)} {consistent(s)}")
        restore_states.append((ctx, s))
    stable = True
    for c, s0 in restore_states:
        for _ in range(2):
            reopen(c, url)
        s1 = probe(c, url)
        stable = stable and core(s1) == core(s0) and s1['pending'] is None
        c.close()
    check('B3', 'na B1/B2 nogmaals 2× heropenen → ongewijzigd', stable)


OLD_SEED = """async () => {
  // Echte 03bf663-app: plekken in localStorage (X verouderd), grafstenen P en X in birdspot-guard.
  const places = [
    { id: 'pl_a', name: 'Oostvaardersplassen', lat: 52.45, lon: 5.36, createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
    { id: 'pl_x', name: 'Oude plek X', lat: 52.0, lon: 5.0, createdAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-02T08:00:00.000Z' },
  ];
  localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places }));
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  await env.addEnvPhotos('pl_a', [new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'a.jpg', { type: 'image/jpeg' })]);
  await (await import('/src/data/dataLock.js')).markPlacesRemoved(['pl_b', 'pl_x']);
}"""
P_PLACE = {"id": "pl_b", "name": "Lauwersmeer", "lat": 53.38, "lon": 6.21,
           "createdAt": "2026-05-02T08:00:00.000Z", "updatedAt": "2026-05-03T08:00:00.000Z"}


def zip_with_p():
    data = {"format": "birdspot-backup", "backupVersion": 2, "schemaVersion": 2, "exportedAt": "2026-11-18T12:00:00.000Z",
            "sightings": [], "places": [P_PLACE], "photoIds": [], "mediaMeta": [], "seenSpecies": []}
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('gegevens.json', json.dumps(data))
    return out.getvalue()


def seeded_old_ctx(browser, url):
    SERVE['root'] = OLD_ROOT
    ctx = new_ctx(browser)
    p = ctx.new_page(); boot(p, url)
    p.evaluate(OLD_SEED)
    p.close()
    SERVE['root'] = APP_ROOT
    return ctx


def place_ids(s):
    return sorted(json.loads(p)['id'] for p in s['places'])


def env_count(s, place):
    return len([p for p in s['photos'] if p[1] == 'place-env' and p[2] == place])


def run_guard(browser, url):
    # G4 + G5
    ctx = seeded_old_ctx(browser, url)
    a = ctx.new_page(); boot(a, url)
    s = probe(ctx, url)
    check('G4', 'migratie: oude grafsteen gaat vóór verouderde localStorage-plek X; grafstenen P en X; foto A behouden',
          place_ids(s) == ['pl_a'] and s['tombs'] == ['pl_b', 'pl_x'] and env_count(s, 'pl_a') == 1,
          f"plekken={place_ids(s)} grafstenen={s['tombs']} fotoA={env_count(s, 'pl_a')}")
    profile(a)
    imported = try_import(a, payload('p.zip', zip_with_p()))
    first = a.evaluate(ENV_ADD, 'pl_b')
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    second = a.evaluate(ENV_ADD, 'pl_b')
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    removed = a.evaluate(REMOVED, ['pl_b', 'pl_x'])
    to_x = a.evaluate(ENV_ADD, 'pl_x')
    s = probe(ctx, url)
    check('G5', 'geldige herimport van P → foto, heropenen, nog een foto lukt; grafsteen X blijft actief',
          imported and first == 'ok' and second == 'ok' and removed == ['pl_x'] and 'pl_b' in place_ids(s) and
          env_count(s, 'pl_b') == 2 and env_count(s, 'pl_a') == 1 and not to_x.startswith('ok') and 'pl_x' in s['tombs'],
          f"import={imported} foto1={first} foto2_na_heropenen={second[:70]} grafstenen={removed} fotoX={to_x[:40]} fotosP={env_count(s, 'pl_b')}")
    ctx.close()

    # G6: onderbroken overname, daarna opnieuw
    ctx = seeded_old_ctx(browser, url)
    a = ctx.new_page()
    a.goto(url + '__probe__'); a.evaluate("() => localStorage.setItem('__abortGuardMig', '1')")
    boot(a, url)
    broken = probe(ctx, url)
    meta_broken = a.evaluate("async () => { const db = await (await import('/src/data/db.js')).getDB(); return db.objectStoreNames.contains('meta') ? await new Promise(ok => { const r = db.transaction('meta').objectStore('meta').get('guardTombstones'); r.onsuccess = () => ok(!!r.result); }) : null; }")
    a.evaluate("() => localStorage.removeItem('__abortGuardMig')")
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    done = probe(ctx, url)
    check('G6', 'onderbroken grafsteenovername → geen halve overname; volgende start voltooit eenmalig',
          meta_broken is False and broken['tombs'] == [] and done['tombs'] == ['pl_b', 'pl_x'] and place_ids(done) == ['pl_a'],
          f"na_onderbreking grafstenen={broken['tombs']} markering={meta_broken} → grafstenen={done['tombs']} plekken={place_ids(done)}")
    ctx.close()

    # G7: twee tabbladen starten tegelijk
    ctx = seeded_old_ctx(browser, url)
    a, b = ctx.new_page(), ctx.new_page()
    a.goto(url, wait_until='commit'); b.goto(url, wait_until='commit')
    boot(a, url); boot(b, url)
    both = probe(ctx, url)
    b.close()
    profile(a)
    a.wait_for_timeout(1200)
    imported = try_import(a, payload('p.zip', zip_with_p()))
    photo_a = a.evaluate(ENV_ADD, 'pl_b')
    b = ctx.new_page(); boot(b, url)
    removed_b = b.evaluate(REMOVED, ['pl_b', 'pl_x'])
    photo_b = b.evaluate(ENV_ADD, 'pl_b')
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    removed_a = a.evaluate(REMOVED, ['pl_b', 'pl_x'])
    s = probe(ctx, url)
    check('G7', 'twee tabbladen tegelijk → één consistente overname; na herstel van P blijft P in beide bruikbaar, X geblokkeerd',
          both['tombs'] == ['pl_b', 'pl_x'] and place_ids(both) == ['pl_a'] and imported and photo_a == 'ok' and photo_b == 'ok' and
          removed_a == removed_b == ['pl_x'] and env_count(s, 'pl_b') == 2,
          f"start grafstenen={both['tombs']} plekken={place_ids(both)} import={imported} fotoA={photo_a[:40]} fotoB={photo_b[:40]} grafstenen B={removed_b} A={removed_a}")
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT} OLD_ROOT={OLD_ROOT}", flush=True)
    only = os.environ.get('R2B_CRASH_ONLY')
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-crash-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            BROWSER['cdp'] = browser.new_browser_cdp_session()
            steps = []
            if only != 'grafsteen':
                steps.append(lambda: run_crash(browser, url, export_zip(browser, url, tmp)))
            if OLD_ROOT and only != 'crash':
                steps.append(lambda: run_guard(browser, url))
            for step in steps:
                try:
                    step()
                except Exception as error:
                    import traceback
                    RESULTS.append(('ERR', False))
                    print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
                    print(''.join(traceback.format_exc().splitlines(True)[-5:]), flush=True)
                finally:
                    SERVE['root'] = APP_ROOT
            browser.close()
        server.shutdown()
    expected = (0 if only == 'grafsteen' else 6) + (4 if OLD_ROOT and only != 'crash' else 0)
    passed = sum(1 for _, ok in RESULTS if ok)
    total = max(len(RESULTS), expected)
    print(f"R2B-CRASHHERSTEL {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
