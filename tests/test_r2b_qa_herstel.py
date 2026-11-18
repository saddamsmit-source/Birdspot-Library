"""Herstel 2B na onafhankelijke QA (#295 @ c2b63a0): regressietests voor P1, P2, P3 en P4.

H1  P1 twee tabbladen: toevoegen wacht op thumbnail, 'Terugzetten' wint → begrijpelijke fout, geen foto
H2  P1 twee tabbladen: toevoegen wint → 'Terugzetten' weigert veilig, data ongewijzigd
H3  P1 één tabblad (module): zelfde race als H1 → PlaceGoneError, geen foto
H4  P2 ZIP v2 met omgevingsfoto in mediaMeta maar niet in photoIds → geweigerd vóór bevestiging, data intact
H5  P3 formulier: ±50,0 m koppelt automatisch; ±50,4 m en onbekend alleen keuze
H6  P3 geluidsessie: ±50,0 m koppelt automatisch; ±50,4 m en onbekend alleen keuze
H7  P4 automatische naam volgt: Plas Noord → Andere plek → Rietkraag Zuid; opgeslagen + heropend
H8  P4 zelf getypte naam blijft bij dezelfde wissel; opgeslagen + heropend

BIRDSPOT_APP_ROOT=<checkout> laat dezelfde tests een andere commit testen (bewijs dat ze op c2b63a0 falen).
Starten (repo-root):  python tests/test_r2b_qa_herstel.py
"""
import functools
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
from test_r2b_places_env_zip import (INIT, PLACE_A, PLACE_B, north, seed_places, stored, open_add, pick_species,  # noqa: E402
                                     save, wait_hint, reset_profile, open_place, close_place, env_records, add_env,
                                     jpeg_with_exif, profile, try_import, seed_source, SNAPSHOT_JS)

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent)
RESULTS = []
HOLD = """(() => {
  // Laat de thumbnailbewerking wachten tot de test hem vrijgeeft (H1/H3).
  const orig = globalThis.createImageBitmap;
  globalThis.createImageBitmap = async (...args) => {
    if (window.__holdThumb) {
      window.__thumbHeld = true;
      await new Promise(resolve => { window.__releaseThumb = resolve; });
    }
    return orig(...args);
  };
  // Alle toasts vastleggen (een latere toast kan een eerdere direct vervangen).
  window.__toasts = [];
  new MutationObserver(() => document.querySelectorAll('.toast, #profileToast').forEach(t => {
    if (t.__last !== t.textContent) { t.__last = t.textContent; window.__toasts.push(t.textContent); }
  })).observe(document, { childList: true, subtree: true, characterData: true });
})();"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(APP_ROOT), **k)

    def log_message(self, *_):
        pass


def new_ctx(browser, **kw):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block', accept_downloads=True, **kw)
    ctx.add_init_script(INIT)
    ctx.add_init_script(HOLD)
    return ctx


def export_zip(browser, url, tmp):
    ctx = new_ctx(browser); page = ctx.new_page(); boot(page, url)
    seed_source(page)
    profile(page)
    with page.expect_download(timeout=20000) as dl:
        page.locator('#btnExport').click()
    path = Path(tmp) / 'bron.zip'; dl.value.save_as(path); ctx.close()
    return path


def restore_via_ui(page):
    page.wait_for_timeout(1800)  # profiel herrendert 1,5 s na import
    page.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    page.locator('#btnRestore').wait_for(state='visible', timeout=10000)
    page.locator('#btnRestore').click()
    page.locator('#confirmOk').click()
    page.wait_for_function("() => window.__toasts.some(t => /Teruggezet|Terugzetten mislukt/.test(t))", timeout=15000)
    return page.evaluate("() => window.__toasts.filter(t => /Teruggezet|Terugzetten/.test(t)).pop()")


def p1(browser, url, zpath):
    # H1: tab A houdt toevoegen vast op de thumbnail; tab B zet terug; daarna gaat A door.
    ctx = new_ctx(browser)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); profile(b)
    assert try_import(b, str(zpath))
    boot(a, url)
    open_place(a, 'pl_b')
    a.evaluate("() => { window.__holdThumb = true; }")
    a.locator('#placeEnvInput').set_input_files([{"name": "race.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    a.wait_for_function("() => window.__thumbHeld === true", timeout=10000)
    toast = restore_via_ui(b)
    a.evaluate("() => window.__releaseThumb()")
    a.wait_for_function("() => !document.querySelector('#placeEnvAdd').disabled", timeout=15000)
    status = a.locator('#placeEnvStatus').inner_text()
    places = [p['id'] for p in stored(a)['places']]
    orphan = [r for r in env_records(a) if r['placeId'] not in places]
    check('H1', "twee tabbladen, 'Terugzetten' wint: fout zichtbaar, geen foto zonder plek",
          'Teruggezet' in toast and 'pl_b' not in places and not orphan and 'bestaat niet meer' in status,
          f"toast='{toast}' status='{status}' plekken={places} wees={[r['id'] for r in orphan]}")
    ctx.close()

    # H2: toevoegen wint; daarna weigert 'Terugzetten' en verandert niets.
    ctx = new_ctx(browser)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); profile(b)
    assert try_import(b, str(zpath))
    boot(a, url)
    open_place(a, 'pl_b')
    msg = add_env(a, [{"name": "eerst.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    before = b.evaluate(SNAPSHOT_JS)
    toast = restore_via_ui(b)
    after = b.evaluate(SNAPSHOT_JS)
    check('H2', "twee tabbladen, toevoegen wint: 'Terugzetten' weigert veilig, data identiek",
          'opgeslagen' in msg and 'Terugzetten kan niet' in toast and before == after, f"status='{msg}' toast='{toast}'")
    ctx.close()

    # H3: zelfde race in één tabblad op moduleniveau (gelijke volgorde als H1)
    ctx = new_ctx(browser)
    p = ctx.new_page(); boot(p, url); profile(p)
    assert try_import(p, str(zpath))
    res = p.evaluate("""async () => {
      const env = await import('/src/data/placeEnv.js');
      const backup = await import('/src/storage/backup.js');
      const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
      const file = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'r.jpg', { type: 'image/jpeg' });
      window.__holdThumb = true;
      const adding = env.addEnvPhotos('pl_b', [file]).then(() => 'opgeslagen', e => e.name + ': ' + e.message);
      while (!window.__thumbHeld) await new Promise(r => setTimeout(r, 10));
      await backup.restoreFromSafetyCopy();
      window.__holdThumb = false; window.__releaseThumb();
      const outcome = await adding;
      const places = (JSON.parse(localStorage.getItem('birdspot-places') || 'null')?.places || []).map(p => p.id);
      const { getDB } = await import('/src/data/db.js');
      const db = await getDB();
      const all = await new Promise(ok => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); });
      return { outcome, orphans: all.filter(x => x.kind === 'place-env' && !places.includes(x.placeId)).length };
    }""")
    check('H3', 'één tabblad: toevoegen na Terugzetten → PlaceGoneError, geen wees-foto',
          res['outcome'].startswith('PlaceGoneError') and res['orphans'] == 0, str(res))
    ctx.close()


def p2(browser, url, zpath):
    data_bytes = zpath.read_bytes()
    zin = zipfile.ZipFile(io.BytesIO(data_bytes))
    meta = json.loads(zin.read('gegevens.json'))
    env_id = next(m['id'] for m in meta['mediaMeta'] if m.get('kind') == 'place-env')
    meta['photoIds'] = [i for i in meta['photoIds'] if i != env_id]
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        for name in zin.namelist():
            z.writestr(name, json.dumps(meta).encode() if name == 'gegevens.json' else zin.read(name))
    ctx = new_ctx(browser); p = ctx.new_page(); boot(p, url)
    seed_source(p)  # bestaand profiel met gegevens
    before = p.evaluate(SNAPSHOT_JS)
    check_js = p.evaluate("""async b64 => {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const { validateBackupFile } = await import('/src/storage/backup.js');
      return validateBackupFile(new File([bytes], 'inconsistent.zip', { type: 'application/zip' }));
    }""", __import__('base64').b64encode(out.getvalue()).decode())
    profile(p)
    confirmed = try_import(p, {"name": "inconsistent.zip", "mimeType": "application/zip", "buffer": out.getvalue()})
    after = p.evaluate(SNAPSHOT_JS)
    check('H4', 'ZIP v2: omgevingsfoto in mediaMeta maar niet in photoIds → geweigerd vóór bevestiging, data intact',
          check_js.get('valid') is False and not confirmed and before == after, f"validate={check_js} bevestiging={confirmed}")
    ctx.close()


def p3_form(browser, url):
    ctx = new_ctx(browser); page = ctx.new_page(); boot(page, url)
    lat, lon = north(120)
    out = {}
    for label, acc in (('50.0', 50.0), ('50.4', 50.4), ('onbekend', None)):
        reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": acc})
        open_add(page); pick_species(page)
        wait_hint(page, '52.20108')
        page.wait_for_timeout(250)
        linked = page.locator('#coordsHint [data-place-state="linked"]').count() == 1
        offered = page.locator('#coordsHint [data-place-choice="pl_a"]').count() == 1
        hint = page.locator('#coordsHint').inner_text()
        r = save(page)
        out[label] = (linked, offered, r['placeId'] == 'pl_a', hint.replace('\n', ' '))
    ok = out['50.0'][:3] == (True, False, True) and out['50.4'][:3] == (False, True, False) and out['onbekend'][:3] == (False, True, False) \
        and '50,4 m' in out['50.4'][3]
    check('H5', 'formulier: ±50,0 m automatisch; ±50,4 m en onbekend alleen keuze', ok, str({k: v[:3] for k, v in out.items()}))
    ctx.close()


def p3_sound(browser, url):
    ctx = new_ctx(browser); page = ctx.new_page(); boot(page, url)
    lat, lon = north(120)
    out = {}
    for label, acc in (('50.0', 50.0), ('50.4', 50.4), ('onbekend', None)):
        reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": acc})
        page.evaluate("() => { for (const k of Object.keys(localStorage)) if (/sound/i.test(k) && /draft|sessie|session/i.test(k)) localStorage.removeItem(k); }")
        page.locator('#fab').click()
        page.locator('[data-quick-action="sound"]').click()
        page.wait_for_function("() => /Bestaande pin|Kies een kaartpin|Nieuwe pin|onnauwkeurig/.test(document.querySelector('#soundPosition')?.textContent || '')", timeout=12000)
        status = page.locator('#soundPosition').inner_text()
        options = page.locator('#soundPlaceOptions [data-sound-place="pl_a"]').count()
        out[label] = ('Bestaande pin · Plas Noord' in status, options == 1, status)
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
        page.reload(wait_until='domcontentloaded'); boot(page, url)
    ok = out['50.0'][:2] == (True, False) and out['50.4'][:2] == (False, True) and out['onbekend'][:2] == (False, True)
    check('H6', 'geluidsessie: ±50,0 m automatisch; ±50,4 m en onbekend alleen keuze', ok, str(out))
    ctx.close()


def reopen_name(page, sighting_id):
    page.evaluate("""async id => {
      const row = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.find(s => s.id === id);
      const { openDetailSheet } = await import('/src/features/sightings/detailSheet.js');
      await openDetailSheet(row);
    }""", sighting_id)
    page.get_by_role('button', name='Bewerken').first.click()
    page.locator('#addSightingSheet').wait_for(state='visible', timeout=10000)
    value = page.locator('#sightLocation').input_value()
    page.locator('#addSheetCancel').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
    return value


def p4(browser, url):
    ctx = new_ctx(browser); page = ctx.new_page(); boot(page, url)
    lat, lon = north(-60)
    results = {}
    for label, typed in (('H7', None), ('H8', 'Mijn kijkhut')):
        reset_profile(page, url, [PLACE_A, PLACE_B], {"lat": lat, "lon": lon, "acc": 5})
        open_add(page); pick_species(page)
        wait_hint(page, '2 bekende plekken')
        if typed:
            page.locator('#sightLocation').fill(typed)
        page.locator('#coordsHint [data-place-choice="pl_a"]').click()
        wait_hint(page, 'Bekende plek: Plas Noord')
        mid = page.locator('#sightLocation').input_value()
        page.locator('#coordsHint [data-place-change]').click()
        after_change = page.locator('#sightLocation').input_value()
        page.locator('#coordsHint [data-place-choice="pl_b"]').click()
        wait_hint(page, 'Bekende plek: Rietkraag Zuid')
        r = save(page)
        reopened = reopen_name(page, r['id'])
        results[label] = (mid, after_change, r['placeId'], r['locationName'], reopened)
    h7, h8 = results['H7'], results['H8']
    check('H7', 'automatische naam volgt gekozen plek (opgeslagen + heropend)',
          h7[0] == 'Plas Noord' and h7[1] == '' and h7[2] == 'pl_b' and h7[3] == 'Rietkraag Zuid' and h7[4] == 'Rietkraag Zuid', str(h7))
    check('H8', 'zelf getypte naam blijft (opgeslagen + heropend)',
          h8[0] == h8[1] == 'Mijn kijkhut' and h8[2] == 'pl_b' and h8[3] == 'Mijn kijkhut' and h8[4] == 'Mijn kijkhut', str(h8))
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-qa-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            zpath = export_zip(browser, url, tmp)
            for step in (lambda: p1(browser, url, zpath), lambda: p2(browser, url, zpath),
                         lambda: p3_form(browser, url), lambda: p3_sound(browser, url), lambda: p4(browser, url)):
                try:
                    step()
                except Exception as error:  # een vastgelopen stap telt als FAIL, de rest loopt door
                    RESULTS.append(('ERR', False))
                    print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    print(f"R2B-QA-HERSTEL {'PASS' if passed == len(RESULTS) else 'FAIL'}: {passed}/{len(RESULTS)}")
    sys.exit(0 if passed == len(RESULTS) else 1)


if __name__ == '__main__':
    main()
