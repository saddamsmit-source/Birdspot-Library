"""Herstel 2B — twee open P1-paden na hertest van #296 (d92d803).

P1 omgevingsfoto zonder Web Locks (navigator.locks uitgeschakeld)
  (slot P1, 18-11: zonder Web Locks stopt Terugzetten altijd vóór de eerste wijziging)
  L1  één tabblad, Terugzetten tijdens toevoegen → Terugzetten stopt veilig, foto bij plek, data intact
  L2  één tabblad, Terugzetten op het moment van schrijven → idem
  L3  twee tabbladen (UI), overlap → Terugzetten stopt zichtbaar, 0 wees
  L4  twee tabbladen (UI), toevoegen eerst → Terugzetten stopt, data identiek
  L5  met Web Locks: zelfde volgorde als L1 blijft veilig (bestaande route)
  L6  twee tabbladen: Terugzetten stopt veilig; toevoegen daarna gewoon, 0 wees
P2 ZIP-medialijst
  K1  v2 zonder photoIds én zonder fotobestand → geweigerd vóór bevestiging, bestaande data intact
  K2  oudere ZIP zonder photoIds met mediaMeta-verwijzing zonder bestand → geweigerd, data intact
  K3  geldige v2-ZIP → volledig hersteld (3 omgevingsfoto's, relaties)
  K4  geldige oudere ZIP zonder photoIds (fb59085-export zonder lijst) → hersteld incl. K4-plekmedia
  K5  echte oudere export fb59085 → hersteld

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: L1/L3/K1/K2 falen op d92d803).
"""
import base64
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
from test_r2b_places_env_zip import (INIT, OLD_ZIP, stored, open_place, env_records, add_env, jpeg_with_exif,  # noqa: E402
                                     profile, try_import, seed_source, SNAPSHOT_JS)
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent)
RESULTS = []
# Web Locks uit; alleen de testopzet mag ze tijdelijk aanzetten (window.__locksForSetup) om via een import een
# veiligheidskopie te maken — die staat voor een kopie van vóór deze browsersituatie.
NO_LOCKS = """(() => {
  const real = Object.getOwnPropertyDescriptor(Navigator.prototype, 'locks').get;
  Object.defineProperty(Navigator.prototype, 'locks', { configurable: true, get() { return window.__locksForSetup ? real.call(this) : undefined; } });
})();"""


def import_with_setup_locks(page, path):
    page.evaluate("() => { window.__locksForSetup = true; }")
    ok = try_import(page, path)
    page.evaluate("() => { window.__locksForSetup = false; }")
    return ok
HOOKS = """(() => {
  // Signaal zodra de foto-opslag wordt gelezen (getAll) of een omgevingsfoto wordt geschreven (put).
  const bc = new BroadcastChannel('r2b-p1-rest');
  window.__bc = bc;
  bc.onmessage = e => { if (e.data === 'photos-read' && window.__releaseOnRemoteRead) { window.__releaseOnRemoteRead = false; window.__holdBlob = false; window.__releaseBlob?.(); } };
  // Hold op de LAATSTE asynchrone stap van de thumbnail: na vrijgeven loopt toevoegen tot de opslag
  // uitsluitend via microtasks, dus deterministisch vóór de volgende IDB-callback van Terugzetten.
  const convert = OffscreenCanvas.prototype.convertToBlob;
  OffscreenCanvas.prototype.convertToBlob = async function (...args) {
    const blob = await convert.apply(this, args);
    if (window.__holdBlob) {
      window.__blobHeld = true;
      await new Promise(resolve => { window.__releaseBlob = resolve; });
    }
    return blob;
  };
  const getAll = IDBObjectStore.prototype.getAll;
  IDBObjectStore.prototype.getAll = function (...args) {
    const req = getAll.apply(this, args);
    if (this.name === 'photos' && window.__restoreReading) { window.__restoreReading = false; bc.postMessage('photos-read'); window.__onPhotosRead?.(); }
    return req;
  };
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, ...rest) {
    const req = put.call(this, value, ...rest);
    if (value && value.kind === 'place-env' && window.__onEnvPut) { const f = window.__onEnvPut; window.__onEnvPut = null; f(); }
    return req;
  };
})();"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(APP_ROOT), **k)

    def log_message(self, *_):
        pass


def ctx_for(browser, locks):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block', accept_downloads=True)
    if not locks:
        ctx.add_init_script(NO_LOCKS)
    for script in (INIT, HOLD, HOOKS):
        ctx.add_init_script(script)
    return ctx


def export_zip(browser, url, tmp):
    ctx = ctx_for(browser, True); page = ctx.new_page(); boot(page, url)
    seed_source(page); profile(page)
    with page.expect_download(timeout=20000) as dl:
        page.locator('#btnExport').click()
    path = Path(tmp) / 'bron.zip'; dl.value.save_as(path); ctx.close()
    return path


SINGLE_TAB = """async order => {
  const env = await import('/src/data/placeEnv.js');
  const backup = await import('/src/storage/backup.js');
  const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
  const file = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'r.jpg', { type: 'image/jpeg' });
  let restore = null;
  if (order === 'restore-first') {
    window.__holdBlob = true;
    window.__onPhotosRead = () => { window.__holdBlob = false; window.__releaseBlob?.(); };
  } else {
    window.__onEnvPut = () => { restore = backup.restoreFromSafetyCopy().then(() => 'teruggezet', e => 'geweigerd: ' + e.message); };
  }
  const adding = env.addEnvPhotos('pl_b', [file]).then(() => 'opgeslagen', e => e.name + ': ' + e.message);
  if (order === 'restore-first') {
    while (!window.__blobHeld) await new Promise(r => setTimeout(r, 5));
    window.__restoreReading = true; // vanaf hier: de eerstvolgende lezing van de foto-opslag is die van Terugzetten
    restore = backup.restoreFromSafetyCopy().then(() => 'teruggezet', e => 'geweigerd: ' + e.message);
    restore.finally(() => { window.__holdBlob = false; window.__releaseBlob?.(); }); // veilige stop leest de opslag niet
  }
  const addOutcome = await adding;
  while (!restore) await new Promise(r => setTimeout(r, 5));
  const restoreOutcome = await restore;
  const places = (JSON.parse(localStorage.getItem('birdspot-places') || 'null')?.places || []).map(p => p.id);
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise(ok => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); });
  const env_ = all.filter(x => x.kind === 'place-env');
  return { addOutcome, restoreOutcome, places, env: env_.length, orphans: env_.filter(x => !places.includes(x.placeId)).length };
}"""


def single_tab(browser, url, zpath, locks, order):
    ctx = ctx_for(browser, locks); p = ctx.new_page(); boot(p, url)
    profile(p); assert import_with_setup_locks(p, str(zpath))
    assert p.evaluate("() => !!navigator.locks") == locks
    before = p.evaluate(SNAPSHOT_JS)
    res = p.evaluate(SINGLE_TAB, order)
    after = p.evaluate(SNAPSHOT_JS)
    ctx.close()
    return res, before, after


def p1(browser, url, zpath):
    # Slot P1 (18-11): zonder Web Locks stopt Terugzetten altijd vóór de eerste wijziging.
    unsupported = 'geweigerd: Terugzetten wordt in deze browser niet veilig ondersteund'
    for code, order in (('L1', 'restore-first'), ('L2', 'add-first')):
        res, before, after = single_tab(browser, url, zpath, False, order)
        kept = after['ls'] == {**before['ls']} and set(m[0] for m in before['media']) <= set(m[0] for m in after['media'])
        check(code, f'zonder Web Locks, één tabblad, {order}: Terugzetten stopt veilig, foto bij plek, data intact, 0 wees',
              res['restoreOutcome'].startswith(unsupported) and res['addOutcome'] == 'opgeslagen' and
              'pl_b' in res['places'] and res['orphans'] == 0 and kept, str(res))

    for code, order in (('L3', 'restore-first'), ('L4', 'add-first')):
        ctx = ctx_for(browser, False)
        a, b = ctx.new_page(), ctx.new_page()
        boot(b, url); profile(b); assert import_with_setup_locks(b, str(zpath))
        boot(a, url)
        assert not a.evaluate("() => !!navigator.locks")
        open_place(a, 'pl_b')
        if order == 'restore-first':
            a.evaluate("() => { window.__holdBlob = true; window.__releaseOnRemoteRead = true; }")
            a.locator('#placeEnvInput').set_input_files([{"name": "race.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
            a.wait_for_function("() => window.__blobHeld === true", timeout=10000)
            b.evaluate("() => { window.__restoreReading = true; }")
            toast = restore_via_ui(b)
            # Stopt Terugzetten veilig (ander tabblad bezig), dan leest het de foto-opslag niet: zelf vrijgeven.
            a.evaluate("() => { window.__holdBlob = false; window.__releaseBlob?.(); }")
            a.wait_for_function("() => !document.querySelector('#placeEnvAdd').disabled", timeout=15000)
            status = a.locator('#placeEnvStatus').inner_text()
            places = [p['id'] for p in stored(a)['places']]
            b_places = [p['id'] for p in stored(b)['places']]
            orphans = [r['id'] for r in env_records(a) if r['placeId'] not in places or r['placeId'] not in b_places]
            safe_stop = 'niet veilig ondersteund' in toast and 'opgeslagen op dit toestel' in status and 'pl_b' in places and 'pl_b' in b_places
            add_fails = 'Teruggezet' in toast and ('bestaat niet meer' in status or 'ander Birdspot-tabblad' in status)
            check(code, 'zonder Web Locks, twee tabbladen, overlap → Terugzetten stopt zichtbaar vóór wijziging (of toevoegen faalt), 0 wees',
                  (safe_stop or add_fails) and not orphans, f"toast='{toast}' status='{status}' wees={orphans}")
        else:
            msg = add_env(a, [{"name": "eerst.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
            before = b.evaluate(SNAPSHOT_JS)
            toast = restore_via_ui(b)
            after = b.evaluate(SNAPSHOT_JS)
            check(code, 'zonder Web Locks, twee tabbladen, toevoegen wint → Terugzetten stopt veilig, data identiek',
                  'opgeslagen' in msg and 'niet veilig ondersteund' in toast and before == after, f"status='{msg}' toast='{toast}'")
        ctx.close()

    # L6: direct na geslaagd Terugzetten in tab B voegt tab A toe (localStorage-propagatievenster) → nooit wees
    ctx = ctx_for(browser, False)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); profile(b); assert import_with_setup_locks(b, str(zpath))
    boot(a, url); open_place(a, 'pl_b')
    toast = restore_via_ui(b)
    status = add_env(a, [{"name": "direct.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    a.wait_for_timeout(500)
    places = [p['id'] for p in stored(b)['places']]
    orphans = [r['id'] for r in env_records(b) if r['placeId'] not in places]
    check('L6', 'zonder Web Locks, twee tabbladen: Terugzetten stopt veilig, daarna toevoegen gewoon, 0 wees',
          'niet veilig ondersteund' in toast and 'opgeslagen op dit toestel' in status and 'pl_b' in places and not orphans,
          f"toast='{toast}' status='{status}' wees={orphans}")
    ctx.close()

    res, _, _ = single_tab(browser, url, zpath, True, 'restore-first')
    check('L5', 'met Web Locks (bestaande route): Terugzetten wint → fout, 0 wees',
          res['restoreOutcome'] == 'teruggezet' and res['addOutcome'].startswith('PlaceGoneError') and res['orphans'] == 0, str(res))


def rebuild(src, mutate_json=None, drop=()):
    zin = zipfile.ZipFile(io.BytesIO(src))
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        for name in zin.namelist():
            if any(d in name for d in drop):
                continue
            data = zin.read(name)
            if name == 'gegevens.json' and mutate_json:
                d = json.loads(data); mutate_json(d); data = json.dumps(d).encode()
            z.writestr(name, data)
    return out.getvalue()


def validate(page, payload):
    return page.evaluate("""async b64 => {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const { validateBackupFile } = await import('/src/storage/backup.js');
      return validateBackupFile(new File([bytes], 'x.zip', { type: 'application/zip' }));
    }""", base64.b64encode(payload).decode())


def p2(browser, url, zpath):
    valid_v2 = zpath.read_bytes()
    env_id = next(m['id'] for m in json.loads(zipfile.ZipFile(io.BytesIO(valid_v2)).read('gegevens.json'))['mediaMeta'] if m.get('kind') == 'place-env')
    damaged = rebuild(valid_v2, lambda d: d.pop('photoIds'), drop=(env_id,))
    old = OLD_ZIP.read_bytes()
    old_without_list = rebuild(old, lambda d: d.pop('photoIds', None))
    old_missing_meta_file = rebuild(old, lambda d: d.pop('photoIds', None), drop=('pm_old_k4',))

    for code, name, payload in (('K1', 'v2 zonder photoIds én zonder fotobestand', damaged),
                                ('K2', 'oudere ZIP zonder photoIds, mediaMeta-verwijzing zonder bestand', old_missing_meta_file)):
        ctx = ctx_for(browser, True); p = ctx.new_page(); boot(p, url)
        seed_source(p)
        before = p.evaluate(SNAPSHOT_JS)
        v = validate(p, payload)
        profile(p)
        confirmed = try_import(p, {"name": f"{code}.zip", "mimeType": "application/zip", "buffer": payload})
        after = p.evaluate(SNAPSHOT_JS)
        check(code, f'{name} → geweigerd vóór bevestiging, data intact', v.get('valid') is False and not confirmed and before == after,
              f"validate={v} bevestiging={confirmed}")
        ctx.close()

    cases = (('K3', 'geldige v2-ZIP volledig hersteld', valid_v2, lambda r: r['env'] == 3 and r['places'] == ['pl_a', 'pl_b'] and r['linked']),
             ('K4', 'geldige oudere ZIP zonder photoIds hersteld incl. K4-plekmedia', old_without_list,
              lambda r: {'old_f1', 'pm_old_k4'} <= set(r['media']) and r['places'] == ['pl_old_a']),
             ('K5', 'echte oudere export fb59085 hersteld', old,
              lambda r: {'old_f1', 'pm_old_k4'} <= set(r['media']) and r['places'] == ['pl_old_a']))
    for code, name, payload, ok in cases:
        ctx = ctx_for(browser, True); p = ctx.new_page(); boot(p, url); profile(p)
        v = validate(p, payload)
        confirmed = try_import(p, {"name": f"{code}.zip", "mimeType": "application/zip", "buffer": payload})
        snap = p.evaluate(SNAPSHOT_JS)
        st = stored(p)
        places = sorted(x['id'] for x in st['places'])
        r = {'media': [m[0] for m in snap['media']], 'env': sum(1 for m in snap['media'] if m[1] == 'place-env'), 'places': places,
             'linked': all(m[2] in places for m in snap['media'] if m[1] == 'place-env')}
        check(code, name, v.get('valid') is True and confirmed and ok(r), f"validate={v} r={r}")
        ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-p1-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            zpath = export_zip(browser, url, tmp)
            for step in (lambda: p1(browser, url, zpath), lambda: p2(browser, url, zpath)):
                try:
                    step()
                except Exception as error:
                    RESULTS.append(('ERR', False))
                    print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    print(f"R2B-P1-REST {'PASS' if passed == len(RESULTS) else 'FAIL'}: {passed}/{len(RESULTS)}")
    sys.exit(0 if passed == len(RESULTS) else 1)


if __name__ == '__main__':
    main()
