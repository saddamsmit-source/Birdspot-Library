"""
Release 1.27.0 — echte back-up-/herstelroute via gebruikers-UI (Chromium, fictieve data).

BR-01: waarneming + extra onbekend veld + gekoppelde IDB-foto exporteren naar ZIP.
BR-02: ZIP bevat de juiste metadata en exact dezelfde bytes.
BR-03: eerst data verwijderen; ongeldig ZIP-bestand en annuleren veranderen niets.
BR-04: valide import via profiel, waarneming/plek/foto terug en onbekend veld behouden.
BR-05: zelfde ZIP herhalen veroorzaakt geen dubbel record of media.
BR-06: veiligheidsterugzetting naar de toestand vóór import verwijdert geïmporteerde media.
BR-07: geen onverwachte browserpaginafouten.

Test bewust alleen de actuele export-/importroute; historische externe ZIP-varianten en
fysieke toestellen vereisen aparte bewijsregels.
"""
import http.server
import json
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
IMAGE_BYTES = b"birdspot-fake-jpeg-backup-2026-11-11"
SIGHTING = {
    "id": "br-1", "speciesId": "sp045", "speciesName": "Merel",
    "date": "2026-05-03", "count": 1, "locationName": "Lauwersmeer",
    "photoIds": ["br-photo"], "certainty": "certain",
    "futureField": {"keep": True, "marker": "BR"},
}
PLACE = {
    "id": "br-place", "name": "Lauwersmeer", "lat": 53.38, "lon": 6.21,
    "createdAt": "2026-05-03T09:00:00Z", "updatedAt": "2026-05-03T09:00:00Z",
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def ready(p):
    p.locator("#birdspotSplash").wait_for(state="detached", timeout=20000)


def profile(p):
    p.locator('.nav-item[data-route="profile"]').click()
    p.locator("#btnExport").wait_for(timeout=10000)


def sample(p):
    return p.evaluate("""async () => {
      const raw = localStorage.getItem('birdspot-sightings');
      const places = localStorage.getItem('birdspot-places');
      const m = await import('/src/data/db.js');
      const db = await m.getDB();
      const photo = await new Promise((res, rej) => {
        const r = db.transaction('photos').objectStore('photos').get('br-photo');
        r.onsuccess = () => res(r.result || null);
        r.onerror = () => rej(r.error);
      });
      return {
        sighting: raw ? JSON.parse(raw).sightings?.find(s => s.id === 'br-1') : null,
        places: places ? JSON.parse(places).places : null,
        photo: photo ? {
          id: photo.id, filename: photo.filename, speciesId: photo.speciesId,
          sightingId: photo.sightingId, bytes: await photo.blob.text(),
          type: photo.blob.type
        } : null
      };
    }""")


def main():
    with tempfile.TemporaryDirectory() as tmp, Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        backup_file = Path(tmp) / "birdspot-test.zip"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                reduced_motion="reduce", service_workers="block", accept_downloads=True,
            )
            p = context.new_page()
            errors = []
            p.on("pageerror", lambda err: errors.append(str(err)))
            p.goto(url, wait_until="domcontentloaded")
            ready(p)

            # Echte opslagmodules, géén stub of monkeypatch van de back-upfunctie.
            p.evaluate("""async (payload) => {
              localStorage.setItem('birdspot-sightings', JSON.stringify({
                schemaVersion: 2, sightings: [payload.sighting]
              }));
              localStorage.setItem('birdspot-places', JSON.stringify({
                schemaVersion: 1, places: [payload.place]
              }));
              const m = await import('/src/data/db.js');
              const bytes = new TextEncoder().encode(payload.content);
              await m.savePhoto({
                id: 'br-photo', blob: new Blob([bytes], {type:'image/jpeg'}),
                type: 'image/jpeg', filename:'br.jpg',
                speciesId: 'sp045', sightingId: 'br-1', addedAt: 1762300000000,
                unknownPhotoField: 'preserve-if-supported'
              });
            }""", {"sighting": SIGHTING, "place": PLACE, "content": IMAGE_BYTES.decode("ascii")})
            seed = sample(p)
            assert seed["sighting"]["futureField"] == SIGHTING["futureField"]
            assert seed["photo"]["bytes"] == IMAGE_BYTES.decode()
            print("BR-01 OK — waarneming, onbekend veld, plek en IDB-foto vastgelegd")

            profile(p)
            with p.expect_download(timeout=15000) as dl:
                p.locator("#btnExport").click()
            dl.value.save_as(str(backup_file))
            with zipfile.ZipFile(backup_file) as z:
                data = json.loads(z.read("gegevens.json"))
                assert data["format"] == "birdspot-backup"
                assert data["sightings"][0]["futureField"] == SIGHTING["futureField"]
                assert z.read("photos/br-photo.jpg") == IMAGE_BYTES
                assert data["photoIds"] == ["br-photo"]
                assert data["places"][0]["id"] == "br-place"
            print("BR-02 OK — geëxporteerde ZIP bevat waarneming, plek, gekoppelde foto en exacte bytes")

            # Wis uitsluitend het geïsoleerde testprofiel, nooit echte gebruikersdata.
            p.evaluate("""async () => {
              localStorage.removeItem('birdspot-sightings');
              localStorage.removeItem('birdspot-places');
              const m = await import('/src/data/db.js'), db = await m.getDB();
              await new Promise((res, rej) => {
                const tx = db.transaction('photos','readwrite');
                tx.objectStore('photos').delete('br-photo');
                tx.oncomplete = res; tx.onerror = () => rej(tx.error);
              });
            }""")
            assert sample(p)["photo"] is None
            assert sample(p)["sighting"] is None

            # Ongeldig archief: geen bevestiging, geen schrijven.
            p.locator("#importFile").set_input_files({
                "name": "corrupt.zip", "mimeType": "application/zip", "buffer": b"bad-zip"
            })
            p.wait_for_function("() => !document.querySelector('#btnImport').disabled")
            assert p.locator("#confirmOverlay").is_hidden()
            assert sample(p)["sighting"] is None and sample(p)["photo"] is None
            print("BR-03a OK — corrupte ZIP geweigerd zonder gegevens te wijzigen")

            # Annuleren van een valide import: eveneens geen mutatie.
            p.locator("#importFile").set_input_files(str(backup_file))
            p.locator("#confirmOverlay").wait_for(state="visible", timeout=12000)
            p.locator("#confirmCancel").click()
            p.locator("#confirmOverlay").wait_for(state="hidden")
            assert sample(p)["sighting"] is None and sample(p)["photo"] is None
            print("BR-03b OK — bevestigingsdialoog geannuleerd, gegevens ongewijzigd")

            p.locator("#importFile").set_input_files(str(backup_file))
            p.locator("#confirmOverlay").wait_for(state="visible", timeout=12000)
            p.locator("#confirmOk").click()
            p.wait_for_function("""() => {
              const d = JSON.parse(localStorage.getItem('birdspot-sightings') || '{}');
              return d.sightings?.some(s => s.id === 'br-1');
            }""", timeout=15000)
            after = sample(p)
            assert after["sighting"]["futureField"] == SIGHTING["futureField"]
            assert after["photo"] is not None and after["photo"]["bytes"] == IMAGE_BYTES.decode()
            assert after["photo"]["sightingId"] == "br-1"
            assert any(q["id"] == "br-place" for q in after["places"])
            print("BR-04 OK — echte UI-import herstelt waarneming, ongekend veld, plek en fotoblobbytes")

            # Herhaalde import mag niet dubbeltellen.
            p.locator("#importFile").set_input_files(str(backup_file))
            p.locator("#confirmOverlay").wait_for(state="visible", timeout=12000)
            p.locator("#confirmOk").click()
            p.wait_for_function("() => !document.querySelector('#btnImport').disabled")
            assert sample(p)["sighting"] is not None
            count = p.evaluate("""() =>
              JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.filter(s => s.id === 'br-1').length""")
            assert count == 1
            print("BR-05 OK — zelfde ZIP opnieuw importeren maakt geen dubbel record")

            # Herstel veiligheidskopie die de app vóór import heeft vastgelegd.
            p.goto(url, wait_until="domcontentloaded")
            ready(p)
            profile(p)
            p.locator("#restoreCard:not(.profile-card--hidden)").wait_for(timeout=10000)
            p.locator("#btnRestore").click()
            p.locator("#confirmOverlay").wait_for(state="visible", timeout=8000)
            p.locator("#confirmOk").click()
            p.wait_for_function("() => !localStorage.getItem('birdspot-sightings')", timeout=15000)
            final = sample(p)
            assert final["sighting"] is None and final["photo"] is None
            print("BR-06 OK — veiligheidskopie zet terug naar lege toestand en verwijdert importmedia")

            assert not errors, f"BR-07 browserpaginafouten: {errors}"
            print("BR-07 OK — geen paginafouten")
            context.close()
            browser.close()
        server.shutdown()
    print("Release backup/restore BR-01..BR-07: alle controles geslaagd")


if __name__ == "__main__":
    main()
