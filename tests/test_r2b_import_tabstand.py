"""Ronde 2B — ZIP-import vanuit een tabblad met een oude plekstand (na hertest #299 @ 20019e1).

Tab A leest een bewust VEROUDERDE plekstand (bevroren localStorage.getItem); tab B slaat plek Q met
omgevingsfoto op. Na elke actie worden plekken, foto's, grafstenen en veiligheidskopie (werkelijke
opslag) gecontroleerd.

T1  reguliere import in tab A (ZIP met andere plek R) terwijl B open is → veilige stop vóór bevestiging, alles identiek
T2  B opent en slaat Q op vlak voordat de import schrijft (A staat al op 'Samenvoegen') → stop, alles identiek
T3  herimport dezelfde ZIP na onderbreking (grafsteen P) terwijl B Q heeft opgeslagen → stop, alles identiek
T4  na sluiten van B: dezelfde herimport → P weer bruikbaar, veiligheidskopie exact gelijk, Q + foto intact, geen dubbelen
T5  reguliere import met actuele stand (één tabblad) → veiligheidskopie bevat Q; Terugzetten → toestand vóór import incl. Q
T6  zonder Web Locks → import stopt vóór bevestiging, alles identiek

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: T1, T2, T3 verliezen Q op 20019e1).
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
from test_r2b_places_env_zip import INIT, open_place, close_place, add_env, jpeg_with_exif, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402
from test_r2b_p1_rest import export_zip, NO_LOCKS  # noqa: E402
from test_r2b_p1_slot import STALE  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent)
RESULTS = []
IDS = ['pl_a', 'pl_b', 'pl_q', 'pl_r']

STATE_JS = """async ids => {
  const raw = k => Storage.prototype.getItem.call(localStorage, k);
  const places = (JSON.parse(raw('birdspot-places') || 'null')?.places || []).map(p => p.id).sort();
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise(ok => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); });
  const guard = await import('/src/data/dataLock.js');
  const tombs = [];
  for (const id of ids) if (await guard.isPlaceRemoved(id)) tombs.push(id);
  return { places, placesRaw: raw('birdspot-places'), sightings: raw('birdspot-sightings'), seen: raw('birdspot-seen-species'),
    safety: raw('birdspot-safety-copy'), media: all.map(p => [p.id, p.kind || null, p.placeId || null]).sort(), tombs };
}"""
SAVE_Q = """async () => {
  // Tab B slaat plek Q op (zoals de app: plekkenlijst + omgevingsfoto bij Q).
  const raw = JSON.parse(localStorage.getItem('birdspot-places') || '{"schemaVersion":1,"places":[]}');
  raw.places.push({ id: 'pl_q', name: 'Kwelder Q', lat: 52.31, lon: 5.41, createdAt: '2026-11-18T10:00:00.000Z', updatedAt: '2026-11-18T10:00:00.000Z' });
  localStorage.setItem('birdspot-places', JSON.stringify(raw));
  const env = await import('/src/data/placeEnv.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  await env.addEnvPhotos('pl_q', [new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'q.jpg', { type: 'image/jpeg' })]);
}"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(APP_ROOT), **k)

    def log_message(self, *_):
        pass


def ctx_for(browser, locks=True):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    if not locks:
        ctx.add_init_script(NO_LOCKS)
    for script in (INIT, HOLD, STALE):
        ctx.add_init_script(script)
    return ctx


def state(page):
    return page.evaluate(STATE_JS, IDS)


def freeze(page):
    page.evaluate("() => { window.__stalePlaces = Storage.prototype.getItem.call(localStorage, 'birdspot-places'); }")


def orphans(s):
    return [m[0] for m in s['media'] if m[2] and m[2] not in s['places']]


def q_intact(s):
    return 'pl_q' in s['places'] and any(m[1] == 'place-env' and m[2] == 'pl_q' for m in s['media'])


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


def setup_two_tabs(browser, url, zpath):
    """B importeert de ZIP (A nog niet open); daarna opent A met een bevroren (oude) plekstand."""
    ctx = ctx_for(browser)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); profile(b)
    assert try_import(b, str(zpath))
    boot(a, url); freeze(a)
    return ctx, a, b


def toasts(page):
    return page.evaluate("() => window.__toasts.slice(-3).join(' | ')")


def run(browser, url, zpath):
    z_r = zip_with_place_r(zpath.read_bytes())

    # T1
    ctx, a, b = setup_two_tabs(browser, url, zpath)
    b.evaluate(SAVE_Q)
    before = state(b)
    profile(a)
    confirmed = try_import(a, payload('r.zip', z_r))
    after = state(b)
    check('T1', 'reguliere import in tab A met oude stand terwijl B open is → veilige stop, alles identiek',
          after == before and q_intact(after) and not orphans(after),
          f"bevestigd={confirmed} plekken={after['places']} Q_intact={q_intact(after)} wees={orphans(after)} melding='{toasts(a)[-140:]}'")
    ctx.close()

    # T2: A staat al op 'Samenvoegen'; B opent en slaat Q op vlak vóór het schrijven
    ctx = ctx_for(browser)
    a, b = ctx.new_page(), ctx.new_page()
    boot(a, url); profile(a)
    assert try_import(a, str(zpath))
    a.wait_for_timeout(1800)
    a.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    a.locator('#btnImport').wait_for(state='visible', timeout=10000)
    a.locator('#importFile').set_input_files(payload('r.zip', z_r))
    a.locator('#confirmOverlay').wait_for(state='visible', timeout=15000)
    freeze(a)                     # A ziet Q straks niet
    boot(b, url); b.evaluate(SAVE_Q)
    before = state(b)
    a.locator('#confirmOk').click()
    a.wait_for_function("() => !document.querySelector('#btnImport').disabled", timeout=20000)
    after = state(b)
    check('T2', 'ander tabblad slaat Q op vlak vóór het schrijven → stop, alles identiek',
          after == before and q_intact(after) and not orphans(after),
          f"plekken={after['places']} Q_intact={q_intact(after)} wees={orphans(after)} melding='{toasts(a)[-140:]}'")
    ctx.close()

    # T3 + T4: herimport na onderbreking
    ctx, a, b = setup_two_tabs(browser, url, zpath)
    b.evaluate("() => import('/src/data/dataLock.js').then(g => g.markPlacesRemoved(['pl_b']))")  # onderbreking
    b.evaluate(SAVE_Q)
    before = state(b)
    profile(a)
    confirmed = try_import(a, str(zpath))
    after = state(b)
    check('T3', 'herimport na onderbreking terwijl B Q heeft opgeslagen → stop, alles identiek (grafsteen P blijft)',
          after == before and q_intact(after) and 'pl_b' in after['tombs'] and not orphans(after),
          f"bevestigd={confirmed} plekken={after['places']} grafstenen={after['tombs']} Q_intact={q_intact(after)} wees={orphans(after)}")
    b.close()
    a.evaluate("() => { window.__stalePlaces = undefined; }")   # B dicht: A's stand is de actuele
    before = state(a)
    a.wait_for_timeout(1800)
    a.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    a.locator('#btnImport').wait_for(state='visible', timeout=10000)
    try_import(a, str(zpath))
    after = state(a)
    open_place(a, 'pl_b')
    status = add_env(a, [{"name": "p.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    close_place(a)
    final = state(a)
    check('T4', 'zelfde herimport met alleen A open → P bruikbaar, veiligheidskopie exact gelijk, Q intact, geen dubbelen',
          after['tombs'] == [] and after['safety'] == before['safety'] and after['places'] == before['places'] and
          after['media'] == before['media'] and q_intact(after) and 'opgeslagen op dit toestel' in status and not orphans(final),
          f"grafstenen {before['tombs']}→{after['tombs']} veiligheidskopie_gelijk={after['safety'] == before['safety']} status='{status}'")
    ctx.close()

    # T5: reguliere import met actuele stand; veiligheidskopie en Terugzetten
    ctx = ctx_for(browser)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); profile(b)
    assert try_import(b, str(zpath))
    b.evaluate(SAVE_Q)
    b.close()
    boot(a, url)
    before = state(a)
    profile(a)
    ok_import = try_import(a, payload('r.zip', z_r))
    after = state(a)
    safety_places = sorted(p['id'] for p in (json.loads(json.loads(after['safety'])['storage']['birdspot-places'])['places']))
    toast = restore_via_ui(a)
    restored = state(a)
    check('T5', 'import met actuele stand: veiligheidskopie bevat Q; Terugzetten → toestand vóór import incl. Q + foto',
          ok_import and 'pl_r' in after['places'] and q_intact(after) and safety_places == before['places'] and 'pl_q' in safety_places and
          'Teruggezet' in toast and restored['places'] == before['places'] and restored['media'] == before['media'] and
          q_intact(restored) and not orphans(restored),
          f"veiligheidskopie={safety_places} na_terugzetten={restored['places']} toast='{toast}'")
    ctx.close()

    # T6: zonder Web Locks
    ctx = ctx_for(browser, locks=False)
    p = ctx.new_page(); boot(p, url)
    before = state(p)
    profile(p)
    confirmed = try_import(p, str(zpath))
    after = state(p)
    check('T6', 'zonder Web Locks: import stopt vóór bevestiging, alles identiek',
          not confirmed and after == before, f"bevestigd={confirmed} melding='{toasts(p)[-140:]}'")
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-tab-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            zpath = export_zip(browser, url, tmp)
            try:
                run(browser, url, zpath)
            except Exception as error:
                import traceback
                RESULTS.append(('ERR', False))
                print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
                print(''.join(traceback.format_exc().splitlines(True)[-5:]), flush=True)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    total = max(len(RESULTS), 6)
    print(f"R2B-IMPORT-TABSTAND {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
