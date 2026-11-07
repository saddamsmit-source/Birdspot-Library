"""
Birdspot Library — B: profiel en back-up
  B-01  bij openen van Profiel staat er geen dialoog open (lege 'Back-up herstellen'-dialoog bleef zichtbaar)
  B-02  overzicht: waarnemingen, soorten, plekken en foto's kloppen met de opgeslagen waarnemingen
  B-03  nog geen back-up + waarnemingen → herinnering; na 'Bewaren' status 'Laatste back-up' en geen herinnering
  B-04  nieuwe waarneming na de back-up → '1 nieuwe waarneming sinds de laatste back-up'
  B-05  versie komt uit sw.js (APP_VERSION); zonder service worker 'Versie onbekend'
  B-06  geen paginafouten; screenshot 390 px
  B-07  oudere ZIP, dubbele import, veiligheidskopie en foutpaden

Starten (vanuit repo-root):  python tests/test_profile_backup.py
"""
import base64
import http.server
import io
import json
import re
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
APP_VERSION = re.search(r"const APP_VERSION = '([^']+)'", (ROOT / "sw.js").read_text(encoding="utf-8")).group(1)
SIGHTINGS = [
    {"id": "p1", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-04-12", "locationName": "Oostvaardersplassen", "photoIds": ["f1", "f2"]},
    {"id": "p2", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-05-02", "locationName": "Oostvaardersplassen", "photoIds": []},
    {"id": "p3", "speciesId": "sp045", "speciesName": "Merel", "date": "2026-05-03", "locationName": "Lauwersmeer", "photoIds": ["f3"]},
]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def boot(ctx, url, rows=None):
    p = ctx.new_page()
    errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.goto(url, wait_until="domcontentloaded")
    p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
    if rows is not None:
        p.evaluate("(rows) => { localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                   "sightings: rows.map(r => ({count:1, ...r}))})); localStorage.removeItem('birdspot-backup-status'); }", rows)
    return p, errors


def open_profile(p):
    p.locator('.nav-item[data-route="profile"]').click()
    p.locator("#backupStatus").wait_for(timeout=8000)
    p.wait_for_timeout(300)


def make_archive(data, media=None):
    target = io.BytesIO()
    with zipfile.ZipFile(target, "w") as package:
        package.writestr("gegevens.json", json.dumps({"format": "birdspot-backup", **data}))
        for path, contents in (media or {}).items():
            package.writestr(f"photos/{path}", contents)
    return base64.b64encode(target.getvalue()).decode("ascii")


def check_restore(page):
    old = "2026-03-01T12:00:00Z"
    recent = "2026-05-01T12:00:00Z"
    local = {"id": "kept", "speciesName": "Merel", "date": "2026-01-01",
             "updatedAt": recent, "notes": "lokale wijziging", "photoIds": [],
             "certainty": "certain", "futureField": "behouden"}
    place = {"id": "site", "name": "Eigen plek", "lat": 52, "lon": 5, "updatedAt": recent}
    incoming = {"id": "new", "speciesName": "<b>Letterlijk</b>", "date": "2026-01-01",
                "locationName": "<i>Testplek</i>", "photoIds": ["picture"]}
    archive = make_archive({
        "schemaVersion": 1,
        "sightings": [{**local, "notes": "oude wijziging", "updatedAt": old,
                       "certainty": "possible", "photoIds": ["removed"]}, incoming],
        "places": [{**place, "name": "Oude naam", "updatedAt": old}],
        "seenSpecies": ["sp045"],
        "collections": {"species": ["sp045"], "film": ["picture"]},
        "photoIds": ["picture", "audio", "removed"],
        "mediaMeta": [{"id": "audio", "placeId": "site", "type": "audio/wav"}],
    }, {"picture.png": b"photo", "audio.wav": b"audio", "removed.png": b"old"})
    newer = make_archive({"sightings": [{**local, "updatedAt": "2026-06-01T12:00:00Z",
                                          "notes": "nieuw uit ZIP", "certainty": "possible",
                                          "futureField": "behouden"}]})
    undated = make_archive({"sightings": [{"id": "kept", "notes": "zonder datum", "photoIds": []}]})
    missing = make_archive({"sightings": [incoming], "photoIds": ["picture"]})

    page.evaluate("""async ({ local, place, archive, newer, undated, missing }) => {
      const { importBackup } = await import('/src/storage/backup.js');
      const { getPhoto } = await import('/src/data/db.js');
      const file = encoded => new File(
        [Uint8Array.from(atob(encoded), char => char.charCodeAt(0))], 'birdspot.zip');
      const check = (ok, label) => { if (!ok) throw new Error(label); };
      const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
      const keys = ['birdspot-sightings', 'birdspot-places', 'birdspot-seen-species',
        'birdspot-favorite-species', 'birdspot-film-selection', 'birdspot-safety-copy'];
      write(keys[0], { schemaVersion: 2, sightings: [local] });
      write(keys[1], { schemaVersion: 1, places: [place] });
      write(keys[2], ['sp118']);
      const original = keys.map(key => localStorage.getItem(key));
      const unchanged = () => keys.every((key, i) => localStorage.getItem(key) === original[i]);
      const mustReject = async (encoded, label) => {
        let failed = false;
        try { await importBackup(file(encoded)); } catch (_) { failed = true; }
        check(failed && unchanged() && !(await getPhoto('picture')) && !(await getPhoto('audio')), label);
      };

      await mustReject(missing, 'Ontbrekende media veranderen niets');

      const setItem = Storage.prototype.setItem;
      for (const key of [keys[5], keys[3]]) {
        Storage.prototype.setItem = function(name, value) {
          if (name === key) throw new DOMException('Testopslag vol', 'QuotaExceededError');
          return setItem.call(this, name, value);
        };
        try { await mustReject(archive, 'Quota-fout herstelt gegevens en media: ' + key); }
        finally { Storage.prototype.setItem = setItem; }
      }

      const add = IDBObjectStore.prototype.add;
      IDBObjectStore.prototype.add = function(item) {
        if (item.id === 'audio') return add.call(this, { id: 'picture' });
        return add.call(this, item);
      };
      try { await mustReject(archive, 'Een afgebroken IDB-transactie verandert niets'); }
      finally { IDBObjectStore.prototype.add = add; }

      await importBackup(file(archive));
      const merged = JSON.parse(localStorage.getItem(keys[0])).sightings;
      check(JSON.stringify(merged[0]) === JSON.stringify(local), 'Oudere ZIP overschrijft geen lokale data');
      check(merged.length === 2 && merged[1].id === 'new', 'Nieuw legacy-record toegevoegd');
      check(JSON.parse(localStorage.getItem(keys[1])).places[0].name === place.name, 'Nieuwere plek behouden');
      check(localStorage.getItem(keys[2]) === '["sp118","sp045"]', 'Gezien is additief');
      check(localStorage.getItem(keys[3]) === '["sp045"]', 'Favoriet is hersteld');
      check(localStorage.getItem(keys[4]) === '["picture"]', 'Filmselectie is hersteld');
      check((await getPhoto('audio')).placeId === 'site', 'Plekgeluid behoudt koppeling');
      check(!(await getPhoto('removed')), 'Gewiste bijlage keert niet terug uit oud record');

      const safety = localStorage.getItem(keys[5]);
      await importBackup(file(archive));
      check(localStorage.getItem(keys[5]) === safety, 'Opnieuw importeren behoudt het herstelpunt');
      check(JSON.parse(localStorage.getItem(keys[0])).sightings.length === 2, 'Geen dubbele waarneming');
    }""", {"local": local, "place": place, "archive": archive, "newer": newer,
            "undated": undated, "missing": missing})

    page.locator('.nav-item[data-route="home"]').click()
    page.get_by_text("<b>Letterlijk</b>", exact=True).wait_for()
    assert "<i>Testplek</i>" in page.locator("#recentList").inner_text()
    assert page.locator("#recentList .recent-item__name b").count() == 0

    page.evaluate("""async ({ newer, undated, local }) => {
      const { importBackup, restoreFromSafetyCopy } = await import('/src/storage/backup.js');
      const { getPhoto } = await import('/src/data/db.js');
      const file = encoded => new File(
        [Uint8Array.from(atob(encoded), char => char.charCodeAt(0))], 'birdspot.zip');
      const key = 'birdspot-sightings';
      const rows = () => JSON.parse(localStorage.getItem(key)).sightings;
      await restoreFromSafetyCopy();
      if (rows().length !== 1 || JSON.stringify(rows()[0]) !== JSON.stringify(local) ||
          await getPhoto('picture') || await getPhoto('audio') ||
          localStorage.getItem('birdspot-seen-species') !== '["sp118"]' ||
          localStorage.getItem('birdspot-favorite-species') !== null ||
          localStorage.getItem('birdspot-film-selection') !== null) {
        throw new Error('Terugzetten herstelt waarnemingen, selecties en media');
      }
      await importBackup(file(undated));
      if (rows()[0].notes !== local.notes) throw new Error('Ontbrekende datum mag lokale tekst niet overschrijven');
      await importBackup(file(newer));
      if (rows()[0].notes !== 'nieuw uit ZIP' || rows()[0].certainty !== 'certain') {
        throw new Error('Recentere ZIP en behoud van zekerheid');
      }
    }""", {"newer": newer, "undated": undated, "local": local})
    ui_archive = make_archive({"sightings": [
        {"id": "ui-restore", "speciesName": "Testvogel", "date": "2026-01-01"},
    ]})
    open_profile(page)
    page.locator("#importFile").set_input_files({
        "name": "birdspot.zip", "mimeType": "application/zip",
        "buffer": base64.b64decode(ui_archive),
    })
    page.locator("#confirmOk").click()
    page.wait_for_function("""() => JSON.parse(localStorage.getItem('birdspot-sightings'))
        .sightings.some(row => row.id === 'ui-restore')""")
    page.wait_for_function("() => !document.querySelector('#restoreCard').classList.contains('profile-card--hidden')")
    print("B-07 OK — veilige merge, media, fouten en terugzetten")


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce",
                                      service_workers="block", accept_downloads=True)
            p, errors = boot(ctx, url, SIGHTINGS)
            p.evaluate("""async rows => {
                const { savePhoto } = await import('/src/data/db.js');
                for (const row of rows) for (const id of row.photoIds) {
                    await savePhoto({ id, sightingId: row.id, blob: new Blob(['test'], {type:'image/png'}),
                        type:'image/png', filename:id + '.png' });
                }
            }""", SIGHTINGS)
            open_profile(p)

            assert p.locator("#confirmOverlay").is_hidden(), "B-01 dialoog staat open bij openen"
            top = p.evaluate("() => document.elementFromPoint(195, 420)?.closest('#confirmOverlay') ? 'overlay' : 'page'")
            assert top == "page", "B-01 overlay ligt over de pagina"
            print("B-01 OK — geen dialoog bij openen")

            stats = p.eval_on_selector_all(".profile-stat", "els => els.map(e => e.innerText.replace(/\\s+/g,' ').trim())")
            assert stats == ["3 waarnemingen", "2 soorten", "2 plekken", "3 foto's"], stats
            print("B-02 OK — overzicht:", stats)

            warn = p.locator("#backupStatus .backup-status__warn")
            assert warn.count() == 1 and "3 waarnemingen" in warn.inner_text(), "B-03 herinnering zonder back-up"
            p.screenshot(path=str(SHOTS / "profile_b_390.png"), full_page=True)
            p.evaluate("() => localStorage.setItem('birdspot-seen-species', JSON.stringify(['sp118']))")
            with p.expect_download(timeout=15000) as dl:
                p.locator("#btnExport").click()
            assert dl.value.suggested_filename.endswith(".zip"), dl.value.suggested_filename
            with zipfile.ZipFile(dl.value.path()) as exported:
                assert json.loads(exported.read("gegevens.json"))["seenSpecies"] == ["sp118"]
            p.locator("#backupStatus .backup-status__label").wait_for(timeout=8000)
            assert p.locator("#backupStatus .backup-status__warn").count() == 0
            print("B-03 OK — herinnering, back-up gemaakt:", dl.value.suggested_filename)

            p.evaluate("() => { const d = JSON.parse(localStorage.getItem('birdspot-sightings'));"
                       " d.sightings.push({id:'p4', speciesId:'sp045', speciesName:'Merel', date:'2026-06-01', count:1, photoIds:[]});"
                       " localStorage.setItem('birdspot-sightings', JSON.stringify(d)); }")
            p.locator('.nav-item[data-route="home"]').click()
            open_profile(p)
            assert "1 nieuwe waarneming sinds" in p.locator("#backupStatus").inner_text()
            print("B-04 OK — nieuwe waarneming na back-up gemeld")

            p.wait_for_function("() => !document.querySelector('#appVersion').textContent.includes('ophalen')")
            assert p.locator("#appVersion").inner_text().startswith("Versie onbekend")
            assert not errors, f"B-06 paginafouten: {errors}"
            ctx.close()

            restore_ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                              reduced_motion="reduce", service_workers="block")
            restore_page, restore_errors = boot(restore_ctx, url)
            restore_page.locator('.nav-item[data-route="species"]').click()
            check_restore(restore_page)
            assert not restore_errors, restore_errors
            restore_ctx.close()

            ctx2 = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
            p2, errors2 = boot(ctx2, url, [])
            p2.evaluate("() => navigator.serviceWorker.ready")
            open_profile(p2)
            p2.wait_for_function("() => !document.querySelector('#appVersion').textContent.includes('ophalen')")
            txt = p2.locator("#appVersion").inner_text()
            assert txt == f"Versie {APP_VERSION} · werkt offline", txt
            assert p2.locator(".profile-stat").count() == 0 and p2.locator(".profile-empty").count() == 1
            assert "Nog geen back-up nodig" in p2.locator("#backupStatus").inner_text()
            print("B-05 OK —", txt)
            assert not errors2, f"B-06 paginafouten: {errors2}"
            print("B-06 OK — geen paginafouten")
            browser.close()
    print("Fase B: alle controles geslaagd")


if __name__ == "__main__":
    main()
