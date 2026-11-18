"""Ronde 2B — levenscyclus van de blokkademarkering (grafsteen) na hertest van #298 (8400e24).

Twee tabbladen in één profiel, met Web Locks. Tab A leest bewust een VEROUDERDE plekstand uit
localStorage (bevroren); tab B werkt op de echte stand. Na elke actie worden de werkelijk opgeslagen
plekken, foto's, grafstenen en veiligheidskopie gecontroleerd.

G1  import van alleen geziene soorten in tab A (oude stand met P) wist de grafsteen van P niet; foto voor P geweigerd
G1b import in tab A met een omgevingsfoto naar P (zonder P zelf) → geweigerd vóór schrijven, data identiek
G2  P eerder geslaagd verwijderd; tab A (oude stand) zet een ándere import terug die terecht wordt geweigerd
    → grafsteen van P blijft, foto voor P geweigerd
G3  onderbreking na opslaan grafsteen en vóór verwijderen plek; herimport van dezelfde ZIP herstelt de plek:
    grafsteen weg, veiligheidskopie gelijk, geen dubbele plekken/foto's, foto voor P weer mogelijk

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: G1, G1b, G2, G3 falen op 8400e24).
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
from test_r2b_p1_rest import export_zip  # noqa: E402
from test_r2b_p1_slot import STALE  # noqa: E402

APP_ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent)
RESULTS = []

STATE_JS = """async () => {
  const raw = k => Storage.prototype.getItem.call(localStorage, k);
  const places = (JSON.parse(raw('birdspot-places') || 'null')?.places || []).map(p => p.id).sort();
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise(ok => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); });
  const guard = await import('/src/data/dataLock.js');
  const tombs = [];
  for (const id of ['pl_a', 'pl_b', 'pl_q']) if (await guard.isPlaceRemoved(id)) tombs.push(id);
  return { places, placesRaw: raw('birdspot-places'), safety: raw('birdspot-safety-copy'), seen: raw('birdspot-seen-species'),
    media: all.map(p => [p.id, p.kind || null, p.placeId || null]).sort(), tombs };
}"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(APP_ROOT), **k)

    def log_message(self, *_):
        pass


def variant(src, edit, keep_files=()):
    zin = zipfile.ZipFile(io.BytesIO(src))
    data = json.loads(zin.read('gegevens.json'))
    edit(data)
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('gegevens.json', json.dumps(data))
        for name in zin.namelist():
            if name != 'gegevens.json' and any(k in name for k in keep_files):
                z.writestr(name, zin.read(name))
    return out.getvalue()


def tabs(browser, url):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for script in (INIT, HOLD, STALE):
        ctx.add_init_script(script)
    a, b = ctx.new_page(), ctx.new_page()
    boot(b, url); boot(a, url)
    return ctx, a, b


def freeze(page):
    page.evaluate("() => { window.__stalePlaces = Storage.prototype.getItem.call(localStorage, 'birdspot-places'); }")


def zip_payload(name, data):
    return {"name": name, "mimeType": "application/zip", "buffer": data}


def env_add_from_stale_tab(a):
    open_place(a, 'pl_b')
    status = add_env(a, [{"name": "p.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    close_place(a)
    return status


def orphans(state):
    return [m[0] for m in state['media'] if m[1] == 'place-env' and m[2] not in state['places']]


def run(browser, url, zpath):
    z = zpath.read_bytes()
    meta = json.loads(zipfile.ZipFile(io.BytesIO(z)).read('gegevens.json'))
    env_b = next(m for m in meta['mediaMeta'] if m.get('kind') == 'place-env' and m['placeId'] == 'pl_b')
    z_seen = variant(z, lambda d: d.update(sightings=[], photoIds=[], mediaMeta=[], places=[], seenSpecies=['sp001', 'sp002']))
    z_env_p = variant(z, lambda d: d.update(sightings=[], photoIds=[env_b['id']], mediaMeta=[env_b], places=[], seenSpecies=[]),
                      keep_files=(env_b['id'],))
    z_q = variant(z, lambda d: d.update(sightings=[], photoIds=[], mediaMeta=[], seenSpecies=[],
                                        places=[{"id": "pl_q", "name": "Kwelder Q", "lat": 52.31, "lon": 5.41,
                                                 "createdAt": "2026-06-05T10:00:00.000Z", "updatedAt": "2026-06-05T10:00:00.000Z"}]))

    for step in (lambda: g1(browser, url, zpath, z_seen, z_env_p), lambda: g2(browser, url, zpath, z_q), lambda: g3(browser, url, zpath)):
        try:
            step()
        except Exception as error:
            import traceback
            RESULTS.append(('ERR', False))
            print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
            print(''.join(traceback.format_exc().splitlines(True)[-6:]), flush=True)


def g1(browser, url, zpath, z_seen, z_env_p):
    ctx, a, b = tabs(browser, url)
    profile(b); assert try_import(b, str(zpath))
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    freeze(a)                                   # tab A blijft P (pl_b) zien
    toast = restore_via_ui(b)
    s1 = b.evaluate(STATE_JS)
    profile(a)
    imported_seen = try_import(a, zip_payload('alleen-soorten.zip', z_seen))
    s2 = b.evaluate(STATE_JS)
    status = env_add_from_stale_tab(a)
    s3 = b.evaluate(STATE_JS)
    check('G1', 'import van alleen geziene soorten (tab A, oude stand) wist grafsteen van P niet; foto voor P geweigerd',
          'Teruggezet' in toast and 'pl_b' in s1['tombs'] and imported_seen and 'pl_b' in s2['tombs'] and
          'pl_b' not in s3['places'] and 'opgeslagen op dit toestel' not in status and not orphans(s3),
          f"grafstenen na terugzetten={s1['tombs']} na import={s2['tombs']} status='{status}' wees={orphans(s3)}")
    before = b.evaluate(STATE_JS)
    a.wait_for_timeout(1800)  # profiel herrendert 1,5 s na de vorige import
    a.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    a.locator('#btnImport').wait_for(state='visible', timeout=10000)
    a.wait_for_timeout(300)
    confirmed = try_import(a, zip_payload('foto-naar-p.zip', z_env_p))
    after = b.evaluate(STATE_JS)
    check('G1b', 'import met omgevingsfoto naar P (zonder P) in tab A → geweigerd vóór schrijven, data identiek',
          not confirmed and after == before and not orphans(after) and 'pl_b' in after['tombs'],
          f"bevestigd={confirmed} wees={orphans(after)} gelijk={after == before}")
    ctx.close()


def g2(browser, url, zpath, z_q):
    ctx, a, b = tabs(browser, url)
    profile(b); assert try_import(b, str(zpath))
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    freeze(a)                                   # tab A blijft pl_a/pl_b zien
    assert 'Teruggezet' in restore_via_ui(b)    # P eerder geslaagd verwijderd → grafsteen
    s1 = b.evaluate(STATE_JS)
    profile(b); assert try_import(b, zip_payload('q.zip', z_q))   # nieuwe veiligheidskopie (zonder P)
    b.evaluate("""async () => {
      const env = await import('/src/data/placeEnv.js');
      const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
      await env.addEnvPhotos('pl_q', [new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'q.jpg', { type: 'image/jpeg' })]);
    }""")
    s2 = b.evaluate(STATE_JS)
    toast = restore_via_ui(a)                   # tab A (oude stand met P) → terecht geweigerd
    s3 = b.evaluate(STATE_JS)
    status = env_add_from_stale_tab(a)
    s4 = b.evaluate(STATE_JS)
    check('G2', 'geweigerde terugzetactie (tab A, oude stand) laat eerdere grafsteen van P intact; foto voor P geweigerd',
          'pl_b' in s1['tombs'] and 'Terugzetten kan niet' in toast and 'pl_b' in s3['tombs'] and
          s3['safety'] == s2['safety'] and s3['places'] == s2['places'] and 'opgeslagen op dit toestel' not in status and not orphans(s4),
          f"grafstenen voor={s2['tombs']} na weigering={s3['tombs']} toast='{toast[:60]}' status='{status}' wees={orphans(s4)}")
    ctx.close()


def g3(browser, url, zpath):
    ctx, a, b = tabs(browser, url)
    profile(b); assert try_import(b, str(zpath))
    a.reload(wait_until='domcontentloaded'); boot(a, url)
    freeze(a)
    # Onderbreking: Terugzetten heeft de grafsteen opgeslagen, maar is gestopt vóór het verwijderen.
    b.evaluate("() => import('/src/data/dataLock.js').then(g => g.markPlacesRemoved(['pl_b']))")
    s1 = b.evaluate(STATE_JS)
    profile(a)
    try_import(a, str(zpath))                   # herimport dezelfde ZIP
    s2 = b.evaluate(STATE_JS)
    status = env_add_from_stale_tab(a)
    s3 = b.evaluate(STATE_JS)
    added = [m for m in s3['media'] if m not in s2['media']]
    check('G3', 'herimport na onderbreking herstelt P: grafsteen weg, veiligheidskopie gelijk, geen dubbelen, foto weer mogelijk',
          s1['tombs'] == ['pl_b'] and 'pl_b' in s1['places'] and s2['tombs'] == [] and s2['safety'] == s1['safety'] and
          s2['places'] == s1['places'] and s2['media'] == s1['media'] and 'opgeslagen op dit toestel' in status and
          len(added) == 1 and added[0][2] == 'pl_b' and not orphans(s3),
          f"grafstenen {s1['tombs']}→{s2['tombs']} veiligheidskopie_gelijk={s2['safety'] == s1['safety']} "
          f"plekken {s1['places']}→{s2['places']} media_gelijk={s2['media'] == s1['media']} status='{status}'")
    ctx.close()


def main():
    print(f"APP_ROOT={APP_ROOT}", flush=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-graf-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            zpath = export_zip(browser, url, tmp)
            run(browser, url, zpath)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    total = max(len(RESULTS), 4)
    print(f"R2B-GRAFSTEEN {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
