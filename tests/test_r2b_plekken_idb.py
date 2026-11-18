"""Ronde 2B-afronding — betrouwbare plekkenopslag (IndexedDB leidend), na hertest #300 @ 03bf663.

Tab A leest een VEROUDERDE plekstand (bevroren localStorage.getItem, zoals bij een tabblad in een
ander browserproces); tab B slaat plek Q met omgevingsfoto op via de echte app-functies. Na elke
actie wordt de werkelijke opslag gecontroleerd (plekken uit IndexedDB als die store bestaat, anders
localStorage; foto's; grafstenen; veiligheidskopie).

I1  reguliere import in A; B sloeg Q op en sloot vóórdat A de actuele stand zag
    → Q + foto behouden, geen dubbelen, geen foto zonder plek, veiligheidskopie bevat Q
I2  reguliere import in A; B slaat Q op NA de laatste tabbladcontrole van A (vóór het schrijven)
    → idem
I3  ongewijzigde herimport na onderbreking (grafsteen P); B sloeg Q op en sloot vóórdat A het zag
    → Q + foto behouden, P hersteld, veiligheidskopie exact gelijk
I4  ongewijzigde herimport na onderbreking; B slaat Q op na de laatste tabbladcontrole → idem
I5  Terugzetten na I1 → exact de plekken van vóór de import (incl. Q), R weg met grafsteen, foto Q intact
M1  upgrade van bestaande lokale gegevens (echte 03bf663-app: plekken in localStorage, omgevingsfoto,
    grafsteen in 'birdspot-guard') → zelfde plek-ID's en records, fotokoppeling, grafsteen, geen dubbelen
M2  herhaald starten (2× herladen) → identiek, geen dubbelen
M3  onderbroken migratie (upgrade-transactie afgebroken) → niets gewijzigd, database blijft v1;
    volgende start voltooit de migratie zonder dubbelen
M4  afgebroken import-schrijfactie (plek wegschrijven faalt in de transactie) → plekken, foto's, grafstenen,
    localStorage en veiligheidskopie identiek
M5  afgebroken Terugzetten (foto verwijderen faalt in de transactie) → alles identiek, geen nieuwe grafsteen

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: I1–I4 verliezen Q op 03bf663).
BIRDSPOT_OLD_ROOT=<checkout van 03bf663> is nodig voor M1–M3 (de oude app maakt de uitgangsgegevens).
"""
import http.server
import io
import json
import os
import sys
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402
from test_r2b_p1_rest import export_zip  # noqa: E402
from test_r2b_p1_slot import STALE  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
OLD_ROOT = Path(os.environ['BIRDSPOT_OLD_ROOT']).resolve() if os.environ.get('BIRDSPOT_OLD_ROOT') else None
RUN_MIGRATION = OLD_ROOT is not None and OLD_ROOT != APP_ROOT
RESULTS = []
IDS = ['pl_a', 'pl_b', 'pl_r', 'pl_x']
SERVE = {'root': APP_ROOT}

# Laat de laatste tabbladcontrole (n-de navigator.locks.query na het 'wapenen') wachten op de test.
GATE = """(() => {
  if (!navigator.locks) return;
  const query = navigator.locks.query.bind(navigator.locks);
  window.__gate = { armed: 0, calls: 0, hit: false, open: null };
  navigator.locks.query = async (...args) => {
    const result = await query(...args);
    const gate = window.__gate;
    if (gate.armed) {
      gate.calls++;
      if (gate.calls === gate.armed) { gate.hit = true; await new Promise(resolve => { gate.open = resolve; }); }
    }
    return result;
  };
})();"""
# M3/M4/M5: gerichte opslagfouten binnen een transactie.
FAULTS = """(() => {
  const put = IDBObjectStore.prototype.put, add = IDBObjectStore.prototype.add, del = IDBObjectStore.prototype.delete;
  IDBObjectStore.prototype.put = function (...args) {
    if (this.name === 'places' && this.transaction.mode === 'versionchange' && localStorage.getItem('__abortUpgrade') === '1') {
      // Zolang de vlag staat, breekt elke upgradepoging af (ook een nieuwe poging in dezelfde pagina).
      this.transaction.abort();
      throw new DOMException('test: upgrade onderbroken', 'AbortError');
    }
    if (this.name === 'places' && this.transaction.mode === 'readwrite' && window.__failPlacePut) throw new DOMException('test: opslag vol', 'QuotaExceededError');
    return put.apply(this, args);
  };
  IDBObjectStore.prototype.add = function (...args) {
    if (this.name === 'photos' && window.__failPhotoAdd) throw new DOMException('test: opslag vol', 'QuotaExceededError');
    return add.apply(this, args);
  };
  IDBObjectStore.prototype.delete = function (...args) {
    if (this.name === 'photos' && window.__failPhotoDelete) throw new DOMException('test: verwijderen mislukt', 'UnknownError');
    return del.apply(this, args);
  };
})();"""

STATE_JS = """async ids => {
  const raw = k => Storage.prototype.getItem.call(localStorage, k);
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = (store) => new Promise((ok, no) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const idb = db.objectStoreNames.contains('places');
  const placeRows = idb ? await all('places') : (JSON.parse(raw('birdspot-places') || 'null')?.places || []);
  const photos = await all('photos');
  const guard = await import('/src/data/dataLock.js');
  const tombs = [];
  for (const id of ids) if (await guard.isPlaceRemoved(id)) tombs.push(id);
  return {
    source: idb ? 'indexeddb' : 'localStorage',
    places: placeRows.map(p => p.id).sort(),
    placeRows: placeRows.slice().sort((a, b) => a.id < b.id ? -1 : 1),
    sightings: raw('birdspot-sightings'), seen: raw('birdspot-seen-species'), safety: raw('birdspot-safety-copy'),
    media: photos.map(p => [p.id, p.kind || null, p.placeId || null]).sort(), tombs };
}"""
# Tab B slaat plek Q op met de echte app-functies (nieuw: transactie in IndexedDB; 03bf663: localStorage).
# Plek Q opslaan (geen datalock, zoals de app) en de omgevingsfoto STARTEN; die wacht in de app op de
# datalock en wordt met SAVE_Q_DONE afgewacht (anders zou de test een eigen wachtlus maken).
SAVE_Q_START = """async () => {
  const m = await import('/src/data/places.js');
  const spec = { placeId: null, name: 'Kwelder Q', lat: 52.31, lon: 5.41 };
  const place = m.resolvePlaceForSave ? (await m.resolvePlaceForSave(spec)).place : m.addPlace(spec);
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  const file = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'q.jpg', { type: 'image/jpeg' });
  window.__qPhoto = env.addEnvPhotos(place.id, [file]).then(() => 'ok', e => e.name + ': ' + e.message);
  return place.id;
}"""
SAVE_Q_DONE = "() => window.__qPhoto"
SAVE_Q = """async () => { const id = await (""" + SAVE_Q_START + """)(); const r = await window.__qPhoto; if (r !== 'ok') throw new Error(r); return id; }"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(SERVE['root']), **k)

    def log_message(self, *_):
        pass

    def end_headers(self):
        # M1–M3 wisselen de app-code op dezelfde origin: nooit een oude module uit de HTTP-cache.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


def new_ctx(browser):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for script in (INIT, HOLD, STALE, GATE, FAULTS):
        ctx.add_init_script(script)
    return ctx


def state(page, extra=()):
    return page.evaluate(STATE_JS, IDS + list(extra))


def freeze(page):
    page.evaluate("() => { window.__stalePlaces = Storage.prototype.getItem.call(localStorage, 'birdspot-places'); }")


def payload(name, data):
    return {"name": name, "mimeType": "application/zip", "buffer": data}


def zip_with_place_r(src):
    zin = zipfile.ZipFile(io.BytesIO(src))
    data = json.loads(zin.read('gegevens.json'))
    data.update(sightings=[], photoIds=[], mediaMeta=[], seenSpecies=[],
                places=[{"id": "pl_r", "name": "Rietland R", "lat": 52.41, "lon": 5.51,
                         "createdAt": "2026-06-06T10:00:00.000Z", "updatedAt": "2026-06-06T10:00:00.000Z"}])
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('gegevens.json', json.dumps(data))
    return out.getvalue()


def fresh_profile(page):
    page.wait_for_timeout(1800)  # profiel herrendert 1,5 s na een import
    page.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    page.locator('#btnImport').wait_for(state='visible', timeout=10000)
    page.wait_for_timeout(300)


def q_ok(s, qid):
    env_q = [m for m in s['media'] if m[1] == 'place-env' and m[2] == qid]
    return s['places'].count(qid) == 1 and len(env_q) == 1


def problems(s):
    ids = [p['id'] for p in s['placeRows']]
    dup_ids = sorted({i for i in ids if ids.count(i) > 1})
    coords = [(round(p['lat'], 6), round(p['lon'], 6)) for p in s['placeRows']]
    dup_coords = len(coords) - len(set(coords))
    media_ids = [m[0] for m in s['media']]
    orphans = [m[0] for m in s['media'] if m[2] and m[2] not in s['places']]
    return {'dubbele_ids': dup_ids, 'dubbele_coords': dup_coords, 'dubbele_media': len(media_ids) - len(set(media_ids)), 'wees': orphans}


def clean(s):
    return problems(s) == {'dubbele_ids': [], 'dubbele_coords': 0, 'dubbele_media': 0, 'wees': []}


def safety_places(s):
    if not s['safety']:
        return None
    copy = json.loads(s['safety'])
    if isinstance(copy.get('places'), list):
        return sorted(p['id'] for p in copy['places'])
    raw = (copy.get('storage') or {}).get('birdspot-places')
    return sorted(p['id'] for p in json.loads(raw)['places']) if raw else []


def import_gated(a, data, on_gate):
    """Start een import in A; laat de laatste tabbladcontrole slagen en houd daarna vast tot on_gate() klaar is.
    on_gate() geeft een afrondfunctie terug die ná het vrijgeven van A wordt aangeroepen."""
    a.evaluate("() => { window.__gate.armed = 3; window.__gate.calls = 0; window.__gate.hit = false; }")
    a.locator('#importFile').set_input_files(data)
    a.locator('#confirmOverlay').wait_for(state='visible', timeout=15000)
    a.locator('#confirmOk').click()
    a.wait_for_function("() => window.__gate.hit", timeout=20000)
    finish = on_gate()
    a.evaluate("() => { window.__gate.armed = 0; window.__gate.open(); }")
    a.wait_for_function("() => !document.querySelector('#btnImport').disabled", timeout=30000)
    return finish()


def save_q_in_new_tab(ctx, url):
    b = ctx.new_page()
    boot(b, url)
    qid = b.evaluate(SAVE_Q)
    b.close()
    return qid


def start_q_in_new_tab(ctx, url):
    """B opent en slaat plek Q op; de omgevingsfoto loopt nog (wacht op de datalock van A)."""
    b = ctx.new_page()
    boot(b, url)
    qid = b.evaluate(SAVE_Q_START)
    def done():
        photo = b.evaluate(SAVE_Q_DONE)
        b.close()
        return photo
    return qid, done


def run_imports(browser, url, zpath):
    z_r = zip_with_place_r(zpath.read_bytes())

    # I1 (+ I5): B slaat Q op en sluit vóórdat A de actuele stand ziet; daarna reguliere import in A
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    freeze(a)                                    # A blijft de stand zonder Q zien
    qid = save_q_in_new_tab(ctx, url)
    truth = state(a, [qid])                      # werkelijke stand vóór de import (met Q)
    fresh_profile(a)
    ok = try_import(a, payload('r.zip', z_r))
    after = state(a, [qid])
    sp = safety_places(after)
    check('I1', 'reguliere import, B sloot vóórdat A Q zag → Q + foto behouden, geen dubbelen/wees, veiligheidskopie bevat Q',
          ok and q_ok(after, qid) and 'pl_r' in after['places'] and clean(after) and sp == truth['places'] and qid in (sp or []),
          f"bron={after['source']} plekken={after['places']} veiligheidskopie={sp} {problems(after)}")
    toast = restore_via_ui(a)
    restored = state(a, [qid])
    check('I5', 'Terugzetten na I1 → plekken van vóór de import (incl. Q), R weg met grafsteen, foto Q intact',
          'Teruggezet' in toast and restored['places'] == truth['places'] and q_ok(restored, qid) and
          restored['media'] == truth['media'] and 'pl_r' in restored['tombs'] and restored['safety'] is None and clean(restored),
          f"plekken={restored['places']} grafstenen={restored['tombs']} toast='{toast[:60]}' {problems(restored)}")
    ctx.close()

    # I2: B slaat Q op NA de laatste tabbladcontrole van A
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    freeze(a)
    fresh_profile(a)
    box = {}
    def during():
        box['qid'], done = start_q_in_new_tab(ctx, url)
        box['truth'] = state(a, [box['qid']])        # Q staat opgeslagen; A heeft zijn laatste controle al gehad
        return done
    photo = import_gated(a, payload('r.zip', z_r), during)
    qid = box['qid']
    after = state(a, [qid])
    sp = safety_places(after)
    check('I2', 'reguliere import, B slaat Q op na de laatste tabbladcontrole → Q + foto behouden, geen dubbelen/wees, veiligheidskopie bevat Q',
          photo == 'ok' and q_ok(after, qid) and 'pl_r' in after['places'] and clean(after) and qid in (sp or []) and sp == box['truth']['places'],
          f"bron={after['source']} plekken={after['places']} veiligheidskopie={sp} fotoQ='{photo}' {problems(after)}")
    ctx.close()

    # I3: ongewijzigde herimport na onderbreking; B sloot vóórdat A Q zag
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    a.evaluate("() => import('/src/data/dataLock.js').then(g => g.markPlacesRemoved(['pl_b']))")   # onderbreking
    freeze(a)
    qid = save_q_in_new_tab(ctx, url)
    before = state(a, [qid])
    fresh_profile(a)
    try_import(a, str(zpath))
    after = state(a, [qid])
    check('I3', 'ongewijzigde herimport na onderbreking, B sloot vóórdat A Q zag → Q + foto behouden, P hersteld, veiligheidskopie exact gelijk',
          q_ok(after, qid) and 'pl_b' in after['places'] and 'pl_b' not in after['tombs'] and
          after['safety'] == before['safety'] and after['media'] == before['media'] and after['places'] == before['places'] and clean(after),
          f"bron={after['source']} plekken={after['places']} grafstenen {before['tombs']}→{after['tombs']} "
          f"veiligheidskopie_gelijk={after['safety'] == before['safety']} {problems(after)}")
    ctx.close()

    # I4: ongewijzigde herimport na onderbreking; B slaat Q op na de laatste tabbladcontrole
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    a.evaluate("() => import('/src/data/dataLock.js').then(g => g.markPlacesRemoved(['pl_b']))")
    freeze(a)
    fresh_profile(a)
    box = {}
    def during4():
        box['qid'], done = start_q_in_new_tab(ctx, url)
        box['before'] = state(a, [box['qid']])
        return done
    photo = import_gated(a, str(zpath), during4)
    qid, before = box['qid'], box['before']
    after = state(a, [qid])
    # Q's foto kwam pas na de import (wachtte op de datalock): vergelijk media zonder die ene foto.
    after_cmp = dict(after, media=[m for m in after['media'] if m[2] != qid])
    before = dict(before, media=[m for m in before['media'] if m[2] != qid])
    check('I4', 'ongewijzigde herimport na onderbreking, B slaat Q op na de laatste controle → Q + foto behouden, P hersteld, veiligheidskopie exact gelijk',
          photo == 'ok' and after_cmp['media'] == before['media'] and q_ok(after, qid) and 'pl_b' in after['places'] and 'pl_b' not in after['tombs'] and
          after['safety'] == before['safety'] and after['places'] == before['places'] and clean(after),
          f"bron={after['source']} plekken={after['places']} grafstenen {before['tombs']}→{after['tombs']} "
          f"veiligheidskopie_gelijk={after['safety'] == before['safety']} fotoQ='{photo}' {problems(after)}")
    ctx.close()

    # M4: afgebroken import-schrijfactie (foto-opslag faalt binnen de transactie)
    ctx = new_ctx(browser)
    a = ctx.new_page(); boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    qid = a.evaluate(SAVE_Q)
    a.evaluate("() => import('/src/data/dataLock.js').then(g => g.markPlacesRemoved(['pl_b']))")
    before = state(a, [qid])
    ls_before = a.evaluate("() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))")
    fresh_profile(a)
    a.evaluate("() => { window.__failPlacePut = true; }")   # plek R wegschrijven faalt binnen de transactie
    try_import(a, payload('r.zip', z_r))
    a.evaluate("() => { window.__failPlacePut = false; }")
    after = state(a, [qid])
    ls_after = a.evaluate("() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))")
    melding = a.evaluate("() => (window.__toasts || []).slice(-2).join(' | ')")
    check('M4', 'afgebroken import-schrijfactie → plekken, foto\'s, grafstenen, localStorage en veiligheidskopie identiek',
          after == before and ls_after == ls_before and 'pl_b' in after['tombs'],
          f"gelijk={after == before} ls_gelijk={ls_after == ls_before} melding='{melding[-160:]}'")

    # M5: afgebroken Terugzetten (foto verwijderen faalt binnen de transactie)
    fresh_profile(a)
    assert try_import(a, payload('r.zip', z_r))      # veiligheidskopie + R
    # Een geïmporteerd media-ID afdwingen zodat Terugzetten echt een foto moet verwijderen (en daar faalt).
    a.evaluate("""() => { const copy = JSON.parse(localStorage.getItem('birdspot-safety-copy'));
      copy.importedMediaIds = ['bestaat-niet-m5']; localStorage.setItem('birdspot-safety-copy', JSON.stringify(copy)); }""")
    before = state(a, [qid])
    ls_before = a.evaluate("() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))")
    a.evaluate("() => { window.__failPhotoDelete = true; }")
    out = a.evaluate("""async () => {
      const backup = await import('/src/storage/backup.js');
      try { await backup.restoreFromSafetyCopy(); return 'teruggezet'; } catch (e) { return 'fout: ' + e.message; }
    }""")
    a.evaluate("() => { window.__failPhotoDelete = false; }")
    after = state(a, [qid])
    ls_after = a.evaluate("() => JSON.stringify(Object.keys(localStorage).sort().map(k => [k, localStorage.getItem(k)]))")
    check('M5', 'afgebroken Terugzetten → plekken, foto\'s, localStorage identiek, geen nieuwe grafsteen',
          out.startswith('fout') and after == before and ls_after == ls_before and
          'pl_r' not in after['tombs'] and 'pl_r' in after['places'],
          f"uitkomst='{out[:80]}' gelijk={after == before} grafstenen={after['tombs']} "
          f"verschil={[k for k in after if after[k] != before.get(k)]} ls_gelijk={ls_after == ls_before}")
    ctx.close()


OLD_SEED = """async () => {
  // Echte 03bf663-app: plekken in localStorage, waarneming met plek, omgevingsfoto, grafsteen in birdspot-guard.
  const places = [
    { id: 'pl_a', name: 'Oostvaardersplassen', lat: 52.45, lon: 5.36, createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
    { id: 'pl_b', name: 'Lauwersmeer', lat: 53.38, lon: 6.21, createdAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-03T08:00:00.000Z', extraVeld: 'blijft' },
    { id: 'pl_b', name: 'Lauwersmeer (dubbel)', lat: 53.38, lon: 6.21, createdAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-02T08:00:00.000Z' },
  ];
  localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places }));
  const s = JSON.parse(localStorage.getItem('birdspot-sightings') || '{"schemaVersion":1,"sightings":[]}');
  s.sightings.push({ id: 'mig_s1', speciesId: 'sp045', speciesName: 'Merel', date: '2026-05-01', lat: 52.45, lon: 5.36, placeId: 'pl_a', createdAt: '2026-05-01T08:00:00.000Z' });
  localStorage.setItem('birdspot-sightings', JSON.stringify(s));
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  await env.addEnvPhotos('pl_a', [new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'a.jpg', { type: 'image/jpeg' })]);
  await (await import('/src/data/dataLock.js')).markPlacesRemoved(['pl_x']);
  const { getDB } = await import('/src/data/db.js');
  return { version: (await getDB()).version };
}"""
MIG_STATE = """async () => {
  const raw = k => localStorage.getItem(k);
  const dbs = indexedDB.databases ? (await indexedDB.databases()).map(d => [d.name, d.version]) : [];
  const info = await new Promise(ok => { const r = indexedDB.open('birdspot-library'); r.onsuccess = () => ok(r.result); });
  const stores = [...info.objectStoreNames].sort();
  const all = s => stores.includes(s) ? new Promise(ok => { const r = info.transaction(s).objectStore(s).getAll(); r.onsuccess = () => ok(r.result); }) : Promise.resolve(null);
  const out = { version: info.version, stores, places: await all('places'), tombs: await all('placeTombstones'),
    media: (await all('photos')).map(p => [p.id, p.kind || null, p.placeId || null]).sort(),
    sightings: raw('birdspot-sightings'), mirror: raw('birdspot-places'), dbs };
  info.close();
  return out;
}"""


def links(raw):
    # Koppeling waarneming → plek (het waarnemingenschema zelf migreert de app los hiervan, v1→v2).
    return sorted((x['id'], x.get('placeId')) for x in (json.loads(raw or 'null') or {}).get('sightings', []))


def run_migration(browser, url):
    # M1: upgrade vanaf echte bestaande gegevens van de vorige versie (03bf663)
    SERVE['root'] = OLD_ROOT
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    ctx.add_init_script(FAULTS)
    p = ctx.new_page(); boot(p, url)
    seeded = p.evaluate(OLD_SEED)
    old = p.evaluate(MIG_STATE)
    first = {}                                   # eerste exemplaar per ID wint (dubbel ID in oude gegevens)
    for pl in json.loads(old['mirror'])['places']:
        first.setdefault(pl['id'], pl)
    SERVE['root'] = APP_ROOT
    p.reload(wait_until='domcontentloaded'); boot(p, url)
    p.wait_for_timeout(800)
    m1 = p.evaluate(MIG_STATE)
    rows = {pl['id']: pl for pl in m1['places']}
    check('M1', 'upgrade van bestaande lokale gegevens → zelfde plek-ID\'s en records, fotokoppeling, grafsteen, geen dubbelen',
          seeded['version'] == 1 and m1['version'] == 3 and sorted(rows) == ['pl_a', 'pl_b'] and len(m1['places']) == 2 and
          rows == first and m1['media'] == old['media'] and ['pl_a'] == [m[2] for m in m1['media'] if m[1] == 'place-env'] and
          [t['id'] for t in m1['tombs']] == ['pl_x'] and links(m1['sightings']) == links(old['sightings']) == [('mig_s1', 'pl_a')] and
          sorted(pl['id'] for pl in json.loads(m1['mirror'])['places']) == ['pl_a', 'pl_b'],
          f"versie {seeded['version']}→{m1['version']} plekken={sorted(rows)} records_gelijk={rows == first} "
          f"grafstenen={[t['id'] for t in m1['tombs']]} media_gelijk={m1['media'] == old['media']} "
          f"koppelingen={links(m1['sightings'])}")

    # M2: herhaald starten
    for _ in range(2):
        p.reload(wait_until='domcontentloaded'); boot(p, url)
    p.wait_for_timeout(800)
    m2 = p.evaluate(MIG_STATE)
    check('M2', 'herhaald starten (2× herladen) → identiek, geen dubbelen',
          m2['places'] == m1['places'] and m2['tombs'] == m1['tombs'] and m2['media'] == m1['media'] and m2['sightings'] == m1['sightings'],
          f"plekken={[pl['id'] for pl in m2['places']]}")
    ctx.close()

    # M3: onderbroken migratie, daarna hervat
    SERVE['root'] = OLD_ROOT
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    ctx.add_init_script(FAULTS)
    p = ctx.new_page(); boot(p, url)
    p.evaluate(OLD_SEED)
    old = p.evaluate(MIG_STATE)
    p.evaluate("() => localStorage.setItem('__abortUpgrade', '1')")
    SERVE['root'] = APP_ROOT
    p.reload(wait_until='domcontentloaded'); boot(p, url)          # app start ondanks afgebroken upgrade
    p.wait_for_timeout(800)
    broken = p.evaluate(MIG_STATE)
    started = p.locator('#fab').is_visible()
    p.evaluate("() => localStorage.removeItem('__abortUpgrade')")      # oorzaak weg: volgende start
    old_cmp = dict(old); broken_cmp = dict(broken)
    p.reload(wait_until='domcontentloaded'); boot(p, url)
    p.wait_for_timeout(800)
    resumed = p.evaluate(MIG_STATE)
    first = {}
    for pl in json.loads(old['mirror'])['places']:
        first.setdefault(pl['id'], pl)
    check('M3', 'onderbroken migratie → niets gewijzigd (v1), app start; volgende start voltooit zonder dubbelen',
          broken['version'] == 1 and 'places' not in broken['stores'] and broken['mirror'] == old['mirror'] and
          broken['media'] == old['media'] and links(broken['sightings']) == links(old['sightings']) and started and
          resumed['version'] == 3 and {pl['id']: pl for pl in resumed['places']} == first and len(resumed['places']) == 2 and
          [t['id'] for t in resumed['tombs']] == ['pl_x'] and resumed['media'] == old['media'],
          f"na_afbreken versie={broken['version']} stores={broken['stores']} spiegel_gelijk={broken['mirror'] == old['mirror']} media_gelijk={broken['media'] == old['media']} app_gestart={started} "
          f"hervat versie={resumed['version']} plekken={[pl['id'] for pl in resumed['places']]}")
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT} OLD_ROOT={OLD_ROOT} migratietests={'ja' if RUN_MIGRATION else 'nee'}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-idb-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            only = os.environ.get('R2B_IDB_ONLY')      # lokaal sneller itereren: 'import' of 'migratie'
            steps = [] if only == 'migratie' else [lambda: run_imports(browser, url, export_zip(browser, url, tmp))]
            if RUN_MIGRATION and only != 'import':
                steps.append(lambda: run_migration(browser, url))
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
    passed = sum(1 for _, ok in RESULTS if ok)
    only = os.environ.get('R2B_IDB_ONLY')
    total = max(len(RESULTS), (0 if only == 'migratie' else 7) + (3 if RUN_MIGRATION and only != 'import' else 0))
    print(f"R2B-PLEKKEN-IDB {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
