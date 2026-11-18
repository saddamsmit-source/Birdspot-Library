"""Correctieronde 2B/4 na QA van #302 — herstelslot voor andere tabbladen (P1) en onzekere plekken (P2).

P1 (tabblad A crasht echt — alleen zijn rendererproces wordt beëindigd — na de localStorage-wijzigingen
en vóór de IndexedDB-commit; tabblad B leeft door en slaat via de gewone route een waarneming op):
C1  import; B opende NA de laatste aanwezigheidscontrole van A; B's opslag start terwijl A nog loopt
    → B wacht, A wordt teruggerold, B's waarneming blijft; na 2× heropenen: toestand vóór + B, consistent
C2  Terugzetten; B was al open; zelfde → toestand vóór Terugzetten + B, veiligheidskopie intact
C3  favoriet aanpassen in B op de halve stand → geweigerd met melding, niets gewijzigd; na herstel lukt het
C4  een schrijver zonder herstelslot (oudere versie) bouwde op de halve stand → herstel voegt samen:
    zijn waarneming blijft, de onderbroken import is weg, geen ontbrekende foto's
P2:
D1  grafsteenovername afgebroken; echte foto-opslag (kaart) bij verouderde plek X → geweigerd met melding;
    na heropenen: migratie voltooid, X weg, geen foto zonder plek, andere grafsteen actief
D2  echte v2-database (#301 @ 66673393) met conflict: X (geen koppeling) en Y (met omgevingsfoto) hebben
    een grafsteen → na upgrade X weg, Y bereikbaar met foto, grafsteen P blijft actief
D3  v2-database waarin P eerder geldig via ZIP is hersteld → na upgrade en herstart blijft P bruikbaar
    (foto lukt), grafsteen X blijft actief

Omgeving: BIRDSPOT_APP_ROOT (te testen commit, standaard deze checkout), BIRDSPOT_OLD_ROOT (03bf663:
maakt birdspot-guard-gegevens), BIRDSPOT_V2_ROOT (66673393: maakt een echte v2-database).
"""
import http.server
import json
import os
import signal
import sys
import tempfile
import threading
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD  # noqa: E402
from test_r2b_p1_rest import export_zip  # noqa: E402
from test_r2b_plekken_idb import GATE  # noqa: E402
from test_r2b_grafsteen import open_place, add_env, close_place, jpeg_with_exif  # noqa: E402
import test_r2b_crashherstel as ch  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
OLD_ROOT = Path(os.environ['BIRDSPOT_OLD_ROOT']).resolve() if os.environ.get('BIRDSPOT_OLD_ROOT') else None
V2_ROOT = Path(os.environ['BIRDSPOT_V2_ROOT']).resolve() if os.environ.get('BIRDSPOT_V2_ROOT') else None
SERVE = ch.SERVE
SERVE['root'] = APP_ROOT
ch.APP_ROOT = APP_ROOT
RESULTS = []
BROWSER = {}

SAVE_B = """async id => {
  const m = await import('/src/data/sightings.js');
  window.__bSave = m.addSightings([{ id, speciesId: 'sp045', speciesName: 'Merel', date: '2026-11-18',
    createdAt: new Date().toISOString(), photoIds: [] }]).then(() => 'ok', e => (e.name || 'Error') + ': ' + e.message);
  return true;
}"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


def new_ctx(browser):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for script in (INIT, HOLD, ch.CRASH_HOOKS, GATE):
        ctx.add_init_script(script)
    return ctx


def renderer_pids():
    info = BROWSER['cdp'].send('SystemInfo.getProcessInfo')
    return {p['id'] for p in info['processInfo'] if p.get('type') == 'renderer'}


def open_tab(ctx, url):
    """Opent een app-tabblad en geeft (pagina, pids van zijn renderer)."""
    before = renderer_pids()
    page = ctx.new_page()
    boot(page, url)
    return page, renderer_pids() - before


def crash_only(page, keep_pids):
    """Alleen tabblad A hard beëindigen (SIGKILL); de renderer van B blijft leven."""
    crashed = []
    page.on('crash', lambda _: crashed.append(True))
    victims = renderer_pids() - keep_pids
    for pid in victims:
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
    assert crashed, f'tabblad A niet gecrasht (pids={sorted(victims)})'


def b_ids(s):
    rows = (json.loads(s['ls']['birdspot-sightings'] or 'null') or {}).get('sightings', [])
    return sorted(r['id'] for r in rows)


def without(s, sid):
    """Toestand zonder de waarneming van B (om met 'vóór' te vergelijken)."""
    out = json.loads(json.dumps(ch.core(s)))
    raw = json.loads(out['ls']['birdspot-sightings'] or 'null')
    if raw:
        raw['sightings'] = [r for r in raw['sightings'] if r['id'] != sid]
        out['ls']['birdspot-sightings'] = raw['sightings']
    return out


def norm(s):
    out = json.loads(json.dumps(ch.core(s)))
    raw = json.loads(out['ls']['birdspot-sightings'] or 'null')
    out['ls']['birdspot-sightings'] = raw['sightings'] if raw else None
    return out


def reopen_twice(ctx, url):
    states = []
    for _ in range(2):
        ch.reopen(ctx, url)
        states.append(ch.probe(ctx, url))
    return states


def run_p1(browser, url, zpath):
    z2 = ch.remap_zip(zpath.read_bytes(), '_z2')

    # C1: import; B opent ná de laatste aanwezigheidscontrole
    ctx, a = ch.baseline(browser, url, zpath)
    before = ch.probe(ctx, url)
    a.evaluate("() => { window.__gate.armed = 3; window.__gate.calls = 0; window.__gate.hit = false; window.__holdBeforeCommit = true; }")
    a.locator('#importFile').set_input_files(ch.payload('z2.zip', z2))
    a.locator('#confirmOverlay').wait_for(state='visible', timeout=15000)
    a.locator('#confirmOk').click()
    a.wait_for_function("() => window.__gate.hit", timeout=20000)
    b, b_pids = open_tab(ctx, url)                    # opent na de laatste controle
    a.evaluate("() => { window.__gate.armed = 0; window.__gate.open(); }")
    held = None
    try:
        a.wait_for_function("() => !!window.__held", timeout=20000)
        held = a.evaluate("() => window.__held")
    except Exception:
        pass
    b.evaluate(SAVE_B, 'b_c1')                         # gewone opslagroute, terwijl A nog loopt
    b.wait_for_timeout(1500)
    waited = b.evaluate("() => window.__bSave && Promise.race([window.__bSave, new Promise(r => setTimeout(() => r('wacht'), 50))])")
    crash_only(a, b_pids)
    saved = b.evaluate("() => window.__bSave")
    b.close()
    states = reopen_twice(ctx, url)
    s = states[-1]
    ok = (held == 'voor-commit' and saved == 'ok' and 'b_c1' in b_ids(s) and without(s, 'b_c1') == norm(before) and
          states[0] == states[1] and ch.ok_consistent(s) and s['pending'] is None and s['journal'] in (0, None))
    check('C1', 'import, B opent na laatste controle en slaat op tijdens onderbroken import → vóór-toestand + B, consistent na 2× heropenen',
          ok, f"vastgehouden={held} B_wachtte={waited} B={saved} B_bewaard={'b_c1' in b_ids(s)} rest_gelijk={without(s, 'b_c1') == norm(before)} "
              f"stabiel={states[0] == states[1]} {ch.consistent(s)}")
    ctx.close()

    # C2 + C3: Terugzetten; B al open
    ctx, a = ch.baseline(browser, url, zpath)
    assert try_import(a, ch.payload('z2.zip', z2))
    a.wait_for_timeout(500)
    b, b_pids = open_tab(ctx, url)
    before = ch.probe(ctx, url)
    held = ch.start_restore_held(a, '__holdBeforeCommit')
    b.evaluate(SAVE_B, 'b_c2')
    b.wait_for_timeout(1500)
    waited = b.evaluate("() => Promise.race([window.__bSave, new Promise(r => setTimeout(() => r('wacht'), 50))])")
    crash_only(a, b_pids)
    saved = b.evaluate("() => window.__bSave")
    b.close()
    states = reopen_twice(ctx, url)
    s = states[-1]
    s_cmp = s
    ok = (held == 'voor-commit' and saved == 'ok' and 'b_c2' in b_ids(s) and without(s_cmp, 'b_c2') == norm(before) and
          s['ls']['birdspot-safety-copy'] == before['ls']['birdspot-safety-copy'] and states[0] == states[1] and ch.ok_consistent(s))
    check('C2', 'Terugzetten, B al open slaat op tijdens onderbroken Terugzetten → vóór-toestand + B, veiligheidskopie intact, consistent',
          ok, f"vastgehouden={held} B_wachtte={waited} B={saved} B_bewaard={'b_c2' in b_ids(s)} rest_gelijk={without(s_cmp, 'b_c2') == norm(before)} "
              f"veiligheidskopie_gelijk={s['ls']['birdspot-safety-copy'] == before['ls']['birdspot-safety-copy']} {ch.consistent(s)}")
    ctx.close()

    # C3: synchrone schrijver (favoriet) in B op de halve stand, vóór iemand herstelt
    ctx, a = ch.baseline(browser, url, zpath)
    assert try_import(a, ch.payload('z2.zip', z2))
    a.wait_for_timeout(500)
    b, b_pids = open_tab(ctx, url)
    held = ch.start_restore_held(a, '__holdBeforeCommit')
    crash_only(a, b_pids)
    fav = b.evaluate("""async () => {
      const c = await import('/src/storage/collections.js');
      const pending = localStorage.getItem('birdspot-op-pending') !== null;
      try { c.setCollectionItem('species', 'sp_c3_test', true); return { pending, uitkomst: 'opgeslagen' }; }
      catch (e) { return { pending, uitkomst: e.name, melding: e.message }; }
    }""")
    try:
        b.wait_for_function("() => localStorage.getItem('birdspot-op-pending') === null", timeout=15000)
    except Exception:
        pass
    mid = ch.probe(ctx, url)
    retry = b.evaluate("async () => { const c = await import('/src/storage/collections.js'); try { c.setCollectionItem('species', 'sp_c3_test', true); return 'ok'; } catch (e) { return e.name; } }")
    toasts = b.evaluate("() => (window.__toasts || []).join(' | ')")
    b.close()
    states = reopen_twice(ctx, url)
    s = states[-1]
    fav_final = json.loads(s['ls']['birdspot-favorite-species'] or '[]')
    check('C3', 'favoriet in B op de halve stand → geweigerd met melding, niets gewijzigd; na herstel lukt het',
          held == 'voor-commit' and fav.get('pending') is True and fav.get('uitkomst') == 'RecoveryPendingError' and
          'sp_c3_test' not in (mid['ls']['birdspot-favorite-species'] or '') and retry == 'ok' and 'sp_c3_test' in fav_final and
          'onderbroken herstelactie' in toasts and ch.ok_consistent(s),
          f"markering={fav.get('pending')} uitkomst={fav.get('uitkomst')} na_herstel={retry} melding={'onderbroken herstelactie' in toasts} {ch.consistent(s)}")
    ctx.close()

    # C4: schrijver zonder herstelslot bouwt voort op de halve stand
    ctx, a = ch.baseline(browser, url, zpath)
    before = ch.probe(ctx, url)
    held = ch.start_import_held(a, ch.payload('z2.zip', z2), '__holdBeforeCommit')
    ch.crash(ctx, a)
    probe_page = ctx.new_page()
    probe_page.goto(url + '__probe__')
    probe_page.evaluate("""() => { const raw = JSON.parse(localStorage.getItem('birdspot-sightings'));
      raw.sightings.push({ id: 'b_c4', speciesId: 'sp045', speciesName: 'Merel', date: '2026-11-18', photoIds: [] });
      localStorage.setItem('birdspot-sightings', JSON.stringify(raw)); }""")
    probe_page.close()
    states = reopen_twice(ctx, url)
    s = states[-1]
    ok = held == 'voor-commit' and 'b_c4' in b_ids(s) and without(s, 'b_c4') == norm(before) and states[0] == states[1] and ch.ok_consistent(s)
    check('C4', 'schrijver zonder herstelslot op de halve stand → samengevoegd: zijn waarneming blijft, onderbroken import weg, geen ontbrekende foto',
          ok, f"vastgehouden={held} bewaard={'b_c4' in b_ids(s)} rest_gelijk={without(s, 'b_c4') == norm(before)} {ch.consistent(s)}")
    ctx.close()


OLD_SEED = """async () => {
  const places = [
    { id: 'pl_a', name: 'Oostvaardersplassen', lat: 52.45, lon: 5.36, createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
    { id: 'pl_x', name: 'Oude plek X', lat: 52.0, lon: 5.0, createdAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-02T08:00:00.000Z' },
    { id: 'pl_y', name: 'Oude plek Y', lat: 52.2, lon: 5.2, createdAt: '2026-05-02T08:00:00.000Z', updatedAt: '2026-05-02T08:00:00.000Z' },
  ];
  localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places }));
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  const jpg = async n => new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], n, { type: 'image/jpeg' });
  await env.addEnvPhotos('pl_a', [await jpg('a.jpg')]);
  await env.addEnvPhotos('pl_y', [await jpg('y.jpg')]);
  await (await import('/src/data/dataLock.js')).markPlacesRemoved(['pl_b', 'pl_x', 'pl_y']);
}"""


def seeded(browser, url):
    SERVE['root'] = OLD_ROOT
    ctx = new_ctx(browser)
    p = ctx.new_page(); boot(p, url)
    p.evaluate(OLD_SEED)
    p.close()
    SERVE['root'] = APP_ROOT
    return ctx


def env_photos(s, place):
    return [p[0] for p in s['photos'] if p[1] == 'place-env' and p[2] == place]


def run_p2(browser, url):
    # D1: afgebroken overname + echte foto-opslag bij verouderde plek X
    ctx = seeded(browser, url)
    a = ctx.new_page()
    a.goto(url + '__probe__'); a.evaluate("() => localStorage.setItem('__abortGuardMig', '1')")
    boot(a, url)
    visible = a.evaluate("async () => (await import('/src/data/places.js')).loadPlaces().map(p => p.id).sort()")
    status = ''
    if 'pl_x' in visible:
        open_place(a, 'pl_x')
        status = add_env(a, [{"name": "x.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
        close_place(a)
    broken = ch.probe(ctx, url)
    a.evaluate("() => localStorage.removeItem('__abortGuardMig')")
    for _ in range(2):
        a.reload(wait_until='domcontentloaded'); boot(a, url)
    a.wait_for_timeout(500)
    done = ch.probe(ctx, url)
    to_p = a.evaluate(ch.ENV_ADD, 'pl_b')
    refused = 'Plekken worden nog bijgewerkt' in status and not env_photos(broken, 'pl_x')
    check('D1', 'grafsteenovername afgebroken: foto bij verouderde plek X geweigerd met melding; na heropenen X weg, geen wees, andere grafstenen actief',
          refused and 'pl_x' not in ch.place_ids(done) and ch.ok_consistent(done) and {'pl_b', 'pl_x'} <= set(done['tombs']) and
          not to_p.startswith('ok') and env_photos(done, 'pl_y') == env_photos(broken, 'pl_y') != [],
          f"zichtbaar={visible} melding='{status[:70]}' plekken_na={ch.place_ids(done)} grafstenen={done['tombs']} "
          f"fotoY={len(env_photos(done, 'pl_y'))} fotoP={to_p[:30]} {ch.consistent(done)}")
    ctx.close()

    if not V2_ROOT:
        return
    # D2: echte v2-database (#301) met conflict X (geen koppeling) en Y (omgevingsfoto)
    ctx = seeded(browser, url)
    SERVE['root'] = V2_ROOT
    a = ctx.new_page(); boot(a, url); a.wait_for_timeout(800)
    v2 = ch.probe(ctx, url)
    SERVE['root'] = APP_ROOT
    a.reload(wait_until='domcontentloaded'); boot(a, url); a.wait_for_timeout(800)
    s = ch.probe(ctx, url)
    y_reach = a.evaluate("async () => (await (await import('/src/data/placeEnv.js')).getEnvPhotos('pl_y')).length")
    y_add = a.evaluate(ch.ENV_ADD, 'pl_y')
    conflict = {'pl_x', 'pl_y'} <= set(ch.place_ids(v2)) and {'pl_x', 'pl_y'} <= set(v2['tombs'])
    check('D2', 'v2-database met conflict → X (zonder koppeling) weg, Y met foto bereikbaar en bruikbaar, grafstenen P en X actief',
          conflict and ch.place_ids(s) == ['pl_a', 'pl_y'] and 'pl_y' not in s['tombs'] and {'pl_b', 'pl_x'} <= set(s['tombs']) and
          y_reach >= 1 and y_add == 'ok' and ch.ok_consistent(s),
          f"v2: plekken={ch.place_ids(v2)} grafstenen={v2['tombs']} → plekken={ch.place_ids(s)} grafstenen={s['tombs']} "
          f"fotoY_bereikbaar={y_reach} nieuweFotoY={y_add[:30]}")
    ctx.close()

    # D3: v2-database met eerder geldig via ZIP hersteld P
    ctx = seeded(browser, url)
    SERVE['root'] = V2_ROOT
    a = ctx.new_page(); boot(a, url); profile(a); a.wait_for_timeout(1200)
    imported = try_import(a, ch.payload('p.zip', ch.zip_with_p()))
    first = a.evaluate(ch.ENV_ADD, 'pl_b')
    SERVE['root'] = APP_ROOT
    results = []
    for _ in range(2):                                  # upgrade en herstart
        a.reload(wait_until='domcontentloaded'); boot(a, url)
        results.append(a.evaluate(ch.ENV_ADD, 'pl_b'))
    removed = a.evaluate(ch.REMOVED, ['pl_b', 'pl_x'])
    s = ch.probe(ctx, url)
    check('D3', 'v2-database met geldig via ZIP hersteld P → na upgrade en herstart blijft P bruikbaar; grafsteen X actief',
          imported and first == 'ok' and results == ['ok', 'ok'] and removed == ['pl_x'] and len(env_photos(s, 'pl_b')) == 3 and ch.ok_consistent(s),
          f"import={imported} v2_foto={first} na_upgrade={results} grafstenen={removed} fotosP={len(env_photos(s, 'pl_b'))}")
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT} OLD_ROOT={OLD_ROOT} V2_ROOT={V2_ROOT}", flush=True)
    only = os.environ.get('R2B_SLOT_ONLY')
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-slot-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), ch.Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            BROWSER['cdp'] = ch.BROWSER['cdp'] = browser.new_browser_cdp_session()
            ch.new_ctx = new_ctx            # zelfde haken (incl. GATE) voor de hergebruikte hulpfuncties
            steps = []
            if only != 'p2':
                steps.append(lambda: run_p1(browser, url, export_zip(browser, url, tmp)))
            if OLD_ROOT and only != 'p1':
                steps.append(lambda: run_p2(browser, url))
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
    expected = (0 if only == 'p2' else 4) + ((1 + (2 if V2_ROOT else 0)) if OLD_ROOT and only != 'p1' else 0)
    passed = sum(1 for _, ok in RESULTS if ok)
    total = max(len(RESULTS), expected)
    print(f"R2B-HERSTELSLOT {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
