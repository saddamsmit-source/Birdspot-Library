"""Slot P1 ronde 2B — Terugzetten ↔ omgevingsfoto over twee tabbladen (deterministisch).

Tab A voegt een omgevingsfoto toe aan een geïmporteerde plek; de thumbnail staat stil op de laatste
asynchrone stap. Tab B kiest 'Terugzetten' via de UI. Tab A leest daarna een VEROUDERDE plekstand uit
localStorage (bevroren vóór Terugzetten) en gaat door met opslaan.

S1  zonder Web Locks, BroadcastChannel VERTRAAGD (5 s), Terugzetten eerst
S2  zonder Web Locks, BroadcastChannel VERTRAAGD, toevoegen eerst
S3  zonder Web Locks, BroadcastChannel ONTBREEKT, Terugzetten eerst
S4  zonder Web Locks, BroadcastChannel ONTBREEKT, toevoegen eerst
S5  MET Web Locks, verouderde localStorage, Terugzetten eerst → toevoegen geweigerd, 0 wees
S6  MET Web Locks, toevoegen eerst → Terugzetten weigert, data identiek
S7  grafstenen: weg na geweigerd Terugzetten, gezet na Terugzetten, weg na nieuwe import
Eis overal: 0 foto's zonder plek. Bij een veilige stop: plekken, waarnemingen, veiligheidskopie en
bestaande media exact gelijk (alleen de bewust toegevoegde foto erbij).

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: S1, S3 en S5 falen op 4e1931d).
"""
import http.server
import os
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, open_place, jpeg_with_exif, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402
from test_r2b_p1_rest import NO_LOCKS, export_zip  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent)
RESULTS = []

STALE = """(() => {
  // Verouderde plekstand: zolang __stalePlaces gezet is, leest dit tabblad die waarde.
  const getItem = Storage.prototype.getItem;
  Storage.prototype.getItem = function (key) {
    if (key === 'birdspot-places' && typeof window.__stalePlaces === 'string') return window.__stalePlaces;
    return getItem.call(this, key);
  };
})();"""
DELAY_BC = """(() => {
  // Elk BroadcastChannel-bericht van/naar dit tabblad komt 5 s later aan.
  const Orig = BroadcastChannel;
  class Delayed extends Orig {
    postMessage(msg) { setTimeout(() => super.postMessage(msg), 5000); }
    set onmessage(fn) { super.onmessage = fn ? e => setTimeout(() => fn(e), 5000) : null; }
    get onmessage() { return super.onmessage; }
  }
  window.BroadcastChannel = Delayed;
})();"""
NO_BC = "delete window.BroadcastChannel; window.BroadcastChannel = undefined;"

STATE_JS = """async () => {
  const keys = ['birdspot-sightings', 'birdspot-places', 'birdspot-safety-copy'];
  const raw = Object.fromEntries(keys.map(k => [k, Storage.prototype.getItem.call(localStorage, k)]));
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise(ok => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); });
  return { raw, media: all.map(p => [p.id, p.kind || null, p.placeId || null]).sort() };
}"""
REAL_PLACES_JS = "() => (JSON.parse(Storage.prototype.getItem.call(localStorage, 'birdspot-places') || 'null')?.places || []).map(p => p.id)"


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(APP_ROOT), **k)

    def log_message(self, *_):
        pass


def scenario(browser, url, zpath, code, name, locks, bc, order):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    if not locks:
        ctx.add_init_script(NO_LOCKS)
    if bc == 'missing':
        ctx.add_init_script(NO_BC)
    for script in (INIT, HOLD, STALE):
        ctx.add_init_script(script)
    a, b = ctx.new_page(), ctx.new_page()
    if bc == 'delayed':
        a.add_init_script(DELAY_BC)
    boot(b, url); profile(b)
    assert try_import(b, str(zpath))
    boot(a, url)
    assert a.evaluate("() => !!navigator.locks") == locks
    open_place(a, 'pl_b')
    before = b.evaluate(STATE_JS)

    if order == 'restore-first':
        # Thumbnail stil op de laatste stap; localStorage van A bevroren op de stand vóór Terugzetten.
        a.evaluate("""() => {
          window.__stalePlaces = Storage.prototype.getItem.call(localStorage, 'birdspot-places');
          window.__holdBlob = true;
          const c = OffscreenCanvas.prototype.convertToBlob;
          if (!window.__holdInstalled) {
            window.__holdInstalled = true;
            OffscreenCanvas.prototype.convertToBlob = async function (...args) {
              const blob = await c.apply(this, args);
              if (window.__holdBlob) { window.__blobHeld = true; await new Promise(r => { window.__releaseBlob = r; }); }
              return blob;
            };
          }
        }""")
        a.locator('#placeEnvInput').set_input_files([{"name": "race.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
        a.wait_for_function("() => window.__blobHeld === true", timeout=10000)
        toast = restore_via_ui(b)
        a.evaluate("() => { window.__holdBlob = false; window.__releaseBlob?.(); }")
        a.wait_for_function("() => !document.querySelector('#placeEnvAdd').disabled", timeout=20000)
        status = a.locator('#placeEnvStatus').inner_text()
        a.evaluate("() => { window.__stalePlaces = undefined; }")
    else:
        a.locator('#placeEnvInput').set_input_files([{"name": "eerst.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
        a.wait_for_function("() => !document.querySelector('#placeEnvAdd').disabled && /opgeslagen|mislukt|bestaat/.test(document.querySelector('#placeEnvStatus').textContent)", timeout=20000)
        status = a.locator('#placeEnvStatus').inner_text()
        before = b.evaluate(STATE_JS)
        toast = restore_via_ui(b)

    b.wait_for_timeout(300)
    after = b.evaluate(STATE_JS)
    places = b.evaluate(REAL_PLACES_JS)
    orphans = [m[0] for m in after['media'] if m[1] == 'place-env' and m[2] not in places]
    added = [m for m in after['media'] if m not in before['media']]
    stopped = 'Teruggezet' not in toast
    if stopped:
        # Veilige stop: plekken, waarnemingen, veiligheidskopie en bestaande media exact gelijk.
        intact = after['raw'] == before['raw'] and [m for m in after['media'] if m not in added] == before['media']
        ok = not orphans and intact and 'opgeslagen op dit toestel' in status
    else:
        # Terugzetten doorgegaan: toevoegen moet zichtbaar geweigerd zijn.
        ok = not orphans and 'opgeslagen op dit toestel' not in status and 'pl_b' not in places
    check(code, name, ok, f"toast='{toast}' status='{status}' wees={orphans} veilige_stop={stopped}")
    ctx.close()


def tombstones(browser, url, zpath):
    """S7: grafstenen blokkeren nooit een plek die (weer) bestaat."""
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for script in (INIT, HOLD):
        ctx.add_init_script(script)
    p = ctx.new_page(); boot(p, url); profile(p)
    assert try_import(p, str(zpath))
    res = p.evaluate("""async () => {
      const env = await import('/src/data/placeEnv.js');
      const backup = await import('/src/storage/backup.js');
      const guard = await import('/src/data/dataLock.js');
      const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
      const file = async n => new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], n, { type: 'image/jpeg' });
      const out = {};
      await env.addEnvPhotos('pl_b', [await file('a.jpg')]);                       // blokkeert Terugzetten
      out.refused = await backup.restoreFromSafetyCopy().then(() => 'teruggezet', e => e.message.slice(0, 40));
      out.tombAfterRefusal = await guard.isPlaceRemoved('pl_b');
      out.addAfterRefusal = await env.addEnvPhotos('pl_b', [await file('b.jpg')]).then(() => 'opgeslagen', e => e.name);
      for (const ph of [...await env.getEnvPhotos('pl_a'), ...await env.getEnvPhotos('pl_b')]) {
        if (ph.filename === 'a.jpg' || ph.filename === 'b.jpg') await env.deleteEnvPhoto(ph.id);
      }
      out.restored = await backup.restoreFromSafetyCopy().then(() => 'teruggezet', e => e.message.slice(0, 60));
      out.tombAfterRestore = await guard.isPlaceRemoved('pl_b');
      return out;
    }""")
    assert try_import(p, str(zpath))
    after_import = p.evaluate("() => import('/src/data/dataLock.js').then(g => g.isPlaceRemoved('pl_b'))")
    added = p.evaluate("""async () => {
      const env = await import('/src/data/placeEnv.js');
      const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
      const f = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'c.jpg', { type: 'image/jpeg' });
      return env.addEnvPhotos('pl_b', [f]).then(() => 'opgeslagen', e => e.name);
    }""")
    ctx.close()
    check('S7', 'grafsteen: weg na geweigerd Terugzetten, gezet na Terugzetten, weg na nieuwe import (toevoegen werkt weer)',
          res['refused'].startswith('Terugzetten kan niet') and res['tombAfterRefusal'] is False and res['addAfterRefusal'] == 'opgeslagen'
          and res['restored'] == 'teruggezet' and res['tombAfterRestore'] is True and after_import is False and added == 'opgeslagen',
          f"{res} na_import={after_import} toevoegen={added}")


def main():
    print(f"APP_ROOT={APP_ROOT}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-slot-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            zpath = export_zip(browser, url, tmp)
            for args in (('S1', 'zonder locks, BroadcastChannel vertraagd, Terugzetten eerst, oude localStorage → 0 wees', False, 'delayed', 'restore-first'),
                         ('S2', 'zonder locks, BroadcastChannel vertraagd, toevoegen eerst → 0 wees, data intact', False, 'delayed', 'add-first'),
                         ('S3', 'zonder locks, BroadcastChannel ontbreekt, Terugzetten eerst, oude localStorage → 0 wees', False, 'missing', 'restore-first'),
                         ('S4', 'zonder locks, BroadcastChannel ontbreekt, toevoegen eerst → 0 wees, data intact', False, 'missing', 'add-first'),
                         ('S5', 'met Web Locks, oude localStorage, Terugzetten eerst → toevoegen geweigerd, 0 wees', True, 'normal', 'restore-first'),
                         ('S6', 'met Web Locks, toevoegen eerst → Terugzetten weigert, data intact', True, 'normal', 'add-first')):
                try:
                    scenario(browser, url, zpath, *args)
                except Exception as error:
                    RESULTS.append((args[0], False))
                    print(f"{args[0]} STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
            try:
                tombstones(browser, url, zpath)
            except Exception as error:
                RESULTS.append(('S7', False))
                print(f"S7 STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    print(f"R2B-P1-SLOT {'PASS' if passed == len(RESULTS) else 'FAIL'}: {passed}/{len(RESULTS)}")
    sys.exit(0 if passed == len(RESULTS) else 1)


if __name__ == '__main__':
    main()
