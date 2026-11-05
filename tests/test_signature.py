"""Phase 1 browser regression. Isolated synthetic sightings; no production data."""
from __future__ import annotations
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)

class QuietServer(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass

class TCPServer(socketserver.TCPServer):
    allow_reuse_address = True

def main():
    with TCPServer(("127.0.0.1", 0), QuietServer) as server:
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width":390, "height":844},
                                          reduced_motion="reduce", service_workers="block")
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(f"http://127.0.0.1:{server.server_address[1]}/",
                      wait_until="domcontentloaded")
            page.locator("#featuredBirdName").wait_for(timeout=12000)
            assert page.locator("#featuredBirdName").inner_text().strip() != ""
            assert page.locator("#statsRow .stat-tile").count()==4
            page.screenshot(path=str(SHOTS / "signature_home_390.png"), full_page=True)

            page.locator("#stat-photos").click()
            page.locator(".signature-media h1").wait_for()
            page.locator('[data-media-filter="video"]').click()
            assert page.locator('[data-media-filter="video"]').get_attribute("aria-pressed") == "true"
            page.screenshot(path=str(SHOTS / "signature_media_390.png"), full_page=True)

            page.locator('.nav-item[data-route="home"]').click()
            page.locator("#homeMoreFeatures summary").click()
            page.locator('#homeMoreFeatures [data-signature-route="journal"]').click()
            page.locator(".signature-journal h1").wait_for()
            page.locator(".signature-milestone").first.wait_for(timeout=8000)
            assert page.locator(".signature-milestone").count() == 4
            page.screenshot(path=str(SHOTS / "signature_journal_390.png"), full_page=True)

            # Journal must read canonical user data, not invent a separate store.
            page.evaluate("""() => localStorage.setItem('birdspot-sightings', JSON.stringify({
              schemaVersion: 2, sightings: [{
                id:'signature-qa-1', speciesId:'parus-major', speciesName:'Koolmees',
                date:'2026-10-28', locationName:'Testbos', notes:'Herfst',
                photoIds:[], count:1
              }]
            }))""")
            page.locator('.nav-item[data-route="home"]').click()
            page.locator("#homeMoreFeatures summary").click()
            page.locator('#homeMoreFeatures [data-signature-route="journal"]').click()
            page.locator("#journalTimeline [data-journal-id='signature-qa-1']").wait_for(timeout=10000)
            assert "Koolmees" in page.locator("#journalTimeline").inner_text()
            assert page.evaluate("""() => JSON.parse(
              localStorage.getItem('birdspot-sightings')).sightings[0].id
            """) == "signature-qa-1"

            # IndexedDB media test: one real Blob linked to canonical sighting.
            page.evaluate("""async () => {
              const db = await new Promise((resolve,reject) => {
                const req = indexedDB.open('birdspot-library',1);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
              });
              const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="green"/></svg>';
              const blob = new Blob([picture], {type:'image/svg+xml'});
              await new Promise((resolve,reject) => {
                const tx = db.transaction('photos','readwrite');
                tx.objectStore('photos').put({
                  id:'signature-photo-1',sightingId:'signature-qa-1',
                  speciesId:'parus-major',type:'image/svg+xml',blob,
                  filename:'test.svg'
                });
                tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
              });
              db.close();
              const store = JSON.parse(localStorage.getItem('birdspot-sightings'));
              store.sightings[0].photoIds = ['signature-photo-1'];
              localStorage.setItem('birdspot-sightings', JSON.stringify(store));
            }""")
            page.locator('.nav-item[data-route="home"]').click()
            page.locator("#stat-photos").click()
            page.locator(".signature-media-frame img").first.wait_for(timeout=10000)
            assert page.locator(".signature-media-tile").count() == 1
            page.wait_for_function("""() => {
              const im = document.querySelector('.signature-media-frame img');
              return !!im && im.complete && im.naturalWidth > 0;
            }""", timeout=10000)
            assert page.locator("#mediaCount").inner_text() == "1 bestand"
            page.screenshot(path=str(SHOTS / "signature_media_with_blob_390.png"), full_page=True)

            page.locator('.nav-item[data-route="map"]').click()
            page.locator("#explorerSightingsBtn").wait_for(timeout=10000)
            assert page.locator(".map-topbar #explorerSightingsBtn").count() == 1  # K1: lijstknop in de kaartbalk
            page.screenshot(path=str(SHOTS / "signature_map_390.png"), full_page=True)
            rect = page.locator("#explorerSightingsBtn").bounding_box()
            assert rect is not None and rect["y"] >= 0 and rect["y"] + rect["height"] < 844 - 64, f"Explorer CTA outside viewport: {rect}"
            page.locator("#explorerSightingsBtn").click()
            page.locator("#sightingsList").wait_for(timeout=10000)
            page.locator('.nav-item[data-route="home"]').click()
            for width in (360,390,430):
                page.set_viewport_size({"width":width,"height":844})
                assert page.locator(".signature-home-intro").is_visible()
                assert page.locator("#fab").is_visible()
            assert not errors, str(errors)
            print("PASS: Signature navigation, responsive layouts and data preservation")
            context.close()
            browser.close()
        server.shutdown()

if __name__ == "__main__":
    main()
