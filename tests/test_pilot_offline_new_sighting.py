#!/usr/bin/env python3
"""Birdspot S1 pilot: add a *new* sighting and real PNG through the UI while offline.

Evidence boundaries: Chromium 390x844 mobile/touch, local origin + real
service worker + IndexedDB/localStorage. NOT a physical Android/iOS test.
Never uses actual user data, external network or a public deployment.
"""
import base64
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
# Actual decoded 24x16 RGB PNG; checked independently with Pillow.
IMAGE = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAABgAAAAQCAIAAACDRijCAAAAHElEQVR4nGMUzAtloAZgooopowaNGjRq0Ag2CAATIAD0/KH1kgAAAABJRU5ErkJggg=="
)
NOTE = "BIRDSPOT-PILOT-OFFLINE-NEW-SAVE-20261112"
SHOTS = ROOT / "tests/screenshots/pilot_core"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def boot(page, url):
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    skip = page.locator("#birdspotSplashSkip")
    if skip.count() and skip.is_visible():
        skip.click()
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
    page.locator("#fab").wait_for(state="visible", timeout=15000)


def stored(page):
    return page.evaluate("""() => {
      const raw = localStorage.getItem('birdspot-sightings');
      const all = raw ? JSON.parse(raw).sightings || [] : [];
      return all.filter(s => s && s.notes === 'BIRDSPOT-PILOT-OFFLINE-NEW-SAVE-20261112');
    }""")


def check_real_photo(page, photo_id):
    return page.evaluate("""async id => {
      const { getPhoto } = await import('/src/data/db.js');
      const photo = await getPhoto(id);
      if (!photo || !(photo.blob instanceof Blob)) return null;
      const img = await createImageBitmap(photo.blob);
      const result = {
        id: photo.id, sightingId: photo.sightingId,
        bytes: Array.from(new Uint8Array(await photo.blob.arrayBuffer())),
        width: img.width, height: img.height, type: photo.blob.type
      };
      img.close();
      return result;
    }""", photo_id)


def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        errors = []
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True, has_touch=True, reduced_motion="reduce",
                accept_downloads=True, service_workers="allow",
            )
            page = context.new_page()
            page.on("pageerror", lambda e: errors.append(str(e)))
            try:
                # PILOT-01: actually install & control app via service worker.
                boot(page, url)
                page.evaluate("""async () => {
                  await navigator.serviceWorker.ready;
                }""")
                if not page.evaluate("!!navigator.serviceWorker.controller"):
                    page.reload(wait_until="domcontentloaded")
                    skip = page.locator("#birdspotSplashSkip")
                    if skip.count() and skip.is_visible():
                        skip.click()
                    page.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
                page.wait_for_function(
                    "() => !!navigator.serviceWorker.controller", timeout=90000
                )
                cache_state = page.evaluate("""async () => {
                    const names = await caches.keys();
                    const active = names.find(n => n.startsWith('birdspot-app-v'));
                    const cache = active ? await caches.open(active) : null;
                    return {active, shell: !!(cache && await cache.match(new URL('./', location).href))};
                }""")
                assert cache_state["active"] and cache_state["shell"], cache_state
                print("PILOT-01 PASS — installed controlling SW with actual precached shell")

                # PILOT-02: close app, reopen *offline*, then use actual add form.
                page.close()
                context.set_offline(True)
                page = context.new_page()
                page.on("pageerror", lambda e: errors.append(str(e)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine")
                page.locator("#fab").click()
                page.locator("#addSightingSheet").wait_for(state="visible", timeout=12000)
                page.locator("#speciesPickerBtn").click()
                page.locator("#spPickerSearch").fill("Koolmees")
                page.locator('#spPickerList .species-row').filter(
                    has=page.locator('.species-row__name', has_text="Koolmees")
                ).first.click()
                page.locator("#speciesPickerOverlay").wait_for(state="detached", timeout=10000)
                assert page.locator("#addSightingSheet").is_visible()
                page.locator("#sightLocation").fill("Testlocatie offline (fictief)")
                page.locator("#sightNotes").fill(NOTE)

                # An actual File is selected; app itself decodes and stores it.
                page.locator("#sightingMediaInput").set_input_files({
                    "name": "pilot-offline.png", "mimeType": "image/png", "buffer": IMAGE
                })
                page.wait_for_function("""() => [...document.querySelectorAll(
                    '#addSightingSheet .media-thumb img'
                )].some(i => i.complete && i.naturalWidth === 24)""", timeout=20000)
                assert page.locator("#addSheetSubmit").is_enabled()
                assert not stored(page), "Unexpected existing pilot fixture"
                page.locator("#addSheetSubmit").click()
                page.locator("#addSightingSheet").wait_for(state="detached", timeout=20000)
                rows = stored(page)
                assert len(rows) == 1 and len(rows[0].get("photoIds", [])) == 1, rows
                sighting_id, photo_id = rows[0]["id"], rows[0]["photoIds"][0]
                assert rows[0]["locationName"] == "Testlocatie offline (fictief)"
                stored_photo = check_real_photo(page, photo_id)
                assert stored_photo is not None and stored_photo["sightingId"] == sighting_id
                assert stored_photo["bytes"] == list(IMAGE), "IDB photo bytes changed"
                assert (stored_photo["width"], stored_photo["height"], stored_photo["type"]) == (
                    24, 16, "image/png"
                ), stored_photo
                print("PILOT-02 PASS — actual offline UI Save wrote exactly one sighting + decodable IDB PNG")

                # PILOT-03: closing and reopening offline must leave *both* layers
                # present and the record visible through the real sights page.
                page.close()
                page = context.new_page()
                page.on("pageerror", lambda e: errors.append(str(e)))
                boot(page, url)
                reread = stored(page)
                assert len(reread) == 1 and reread[0]["id"] == sighting_id
                again = check_real_photo(page, photo_id)
                assert again is not None and again["bytes"] == list(IMAGE)
                page.evaluate("""async () => {
                  const app = await import('/src/app.js');
                  app.navigate('sightings');
                }""")
                card = page.locator(f'.sight-card[data-id="{sighting_id}"]')
                card.wait_for(state="visible", timeout=15000)
                assert "Koolmees" in card.inner_text()
                page.wait_for_function("""id => {
                  const card = document.querySelector('.sight-card[data-id="' + id + '"]');
                  const images = card ? [...card.querySelectorAll('img')] : [];
                  return images.some(i => i.complete && i.naturalWidth === 24);
                }""", sighting_id, timeout=15000)
                card.click()
                page.locator("#detailSightingSheet").wait_for(state="visible", timeout=12000)
                assert NOTE in page.locator("#detailSightingSheet").inner_text()
                page.screenshot(path=str(SHOTS / "offline_new_sighting_390.png"), full_page=True)
                print("PILOT-03 PASS — offline new tab, sighting + decoded thumbnail + detail")
                assert not errors, f"PILOT-04 page JS errors: {errors}"
                print("PILOT-04 PASS — no unexpected page JS errors")
            finally:
                context.close()
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
