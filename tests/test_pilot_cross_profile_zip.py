#!/usr/bin/env python3
"""S1 CROSS-01..08: full ZIP transfer between two genuinely isolated browser profiles.

This simulates distinct devices (separate Playwright BrowserContexts), but it is
NOT an Android-to-Android physical transfer. Source record and PNG are created
via the real app UI; ZIP is exported, then imported through the UI in a clean
profile, preserved on offline reopen and tested for idempotence/rollback.
No deployment or genuine user data.
"""
import http.server
import io
import json
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright
from test_pilot_offline_new_sighting import IMAGE, check_real_photo

ROOT = Path(__file__).resolve().parents[1]
MARKER = "BIRDSPOT-CROSS-PROFILE-ZIP-20261113"
PLACE = "Fictieve veldplek cross-profile"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def log_message(self, *args):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def start(page, url):
    page.goto(url, wait_until="domcontentloaded", timeout=30000)
    skip = page.locator("#birdspotSplashSkip")
    if skip.count() and skip.is_visible():
        skip.click()
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
    page.locator("#fab").wait_for(state="visible", timeout=15000)


def current(page):
    return page.evaluate("""() => {
      const raw = localStorage.getItem('birdspot-sightings');
      const rows = raw ? JSON.parse(raw).sightings || [] : [];
      return rows.filter(row => row && row.notes === 'BIRDSPOT-CROSS-PROFILE-ZIP-20261113');
    }""")


def count_photos(page):
    return page.evaluate("""async () => {
      const { getDB } = await import('/src/data/db.js');
      const db = await getDB();
      return await new Promise((resolve, reject) => {
        const req = db.transaction('photos').objectStore('photos').getAllKeys();
        req.onsuccess = () => resolve(req.result.length);
        req.onerror = () => reject(req.error);
      });
    }""")


def profile(page):
    page.locator('.nav-item[data-route="profile"]').click()
    page.locator("#btnExport").wait_for(timeout=12000)


def select_species(page):
    page.locator("#speciesPickerBtn").click()
    page.locator("#spPickerSearch").fill("Koolmees")
    page.locator('#spPickerList .species-row').filter(
        has=page.locator('.species-row__name', has_text="Koolmees")
    ).first.click()
    page.locator("#speciesPickerOverlay").wait_for(state="detached", timeout=12000)


def import_archive(page, path):
    page.locator("#importFile").set_input_files(str(path))
    page.locator("#confirmOverlay").wait_for(state="visible", timeout=20000)
    page.locator("#confirmOk").click()
    page.wait_for_function("""() => {
        const raw = localStorage.getItem('birdspot-sightings');
        return raw && JSON.parse(raw).sightings?.some(s =>
          s?.notes === 'BIRDSPOT-CROSS-PROFILE-ZIP-20261113');
    }""", timeout=20000)
    page.wait_for_function(
        "() => !!document.querySelector('#btnImport') && !document.querySelector('#btnImport').disabled",
        timeout=15000,
    )


def main():
    with tempfile.TemporaryDirectory(prefix="birdspot-cross-zip-") as tmp, Server(
        ("127.0.0.1", 0), Quiet
    ) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        dest_zip = Path(tmp) / "source-to-clean-context.zip"
        errors = []
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            opts = dict(
                viewport={"width": 390, "height": 844},
                is_mobile=True, has_touch=True, reduced_motion="reduce",
                accept_downloads=True, service_workers="allow",
            )
            source_context = browser.new_context(**opts)
            dest_context = browser.new_context(**opts)
            try:
                # CROSS-01 — source: actual entry & decoded image via app UI.
                source = source_context.new_page()
                source.on("pageerror", lambda error: errors.append("source: " + str(error)))
                start(source, url)
                source.locator("#fab").click()
                source.locator("#addSightingSheet").wait_for(state="visible")
                select_species(source)
                source.locator("#sightLocation").fill(PLACE)
                source.locator("#sightingMore summary").click()
                source.locator("#sightNotes").fill(MARKER)
                source.locator("#sightingMediaInput").set_input_files(
                    {"name": "cross-profile.png", "mimeType": "image/png", "buffer": IMAGE}
                )
                source.wait_for_function("""() => [...document.querySelectorAll(
                  '#addSightingSheet .media-thumb img'
                )].some(img => img.complete && img.naturalWidth === 24)""", timeout=20000)
                source.locator("#addSheetSubmit").click()
                source.locator("#addSightingSheet").wait_for(state="detached", timeout=18000)
                created = current(source)
                assert len(created) == 1 and len(created[0]["photoIds"]) == 1, created
                row = created[0]
                photo_id = row["photoIds"][0]
                photo = check_real_photo(source, photo_id)
                assert photo is not None and photo["bytes"] == list(IMAGE)
                print("CROSS-01 PASS — source UI stored a real decoded PNG and sighting")

                # CROSS-02 — real ZIP export with original bytes and unknown fields.
                # Unknown record metadata is injected *after* authentic creation to
                # verify forward-compatibility, not to simulate an app save.
                source.evaluate("""id => {
                  const key = 'birdspot-sightings';
                  const data = JSON.parse(localStorage.getItem(key));
                  const item = data.sightings.find(s => s.id === id);
                  item.futureField = {keep: true, schema: 88};
                  localStorage.setItem(key, JSON.stringify(data));
                }""", row["id"])
                profile(source)
                with source.expect_download(timeout=20000) as item:
                    source.locator("#btnExport").click()
                item.value.save_as(str(dest_zip))
                with zipfile.ZipFile(dest_zip) as archive:
                    meta = json.loads(archive.read("gegevens.json"))
                    found = next(s for s in meta["sightings"] if s["id"] == row["id"])
                    assert found["futureField"] == {"keep": True, "schema": 88}
                    assert photo_id in meta["photoIds"]
                    photo_files = [s for s in archive.namelist() if s.startswith("photos/")]
                    assert len(photo_files) == 1 and archive.read(photo_files[0]) == IMAGE
                print("CROSS-02 PASS — ZIP stores exact photo bytes and unknown sighting fields")

                # CROSS-03 — distinct, empty browser context before transfer.
                destination = dest_context.new_page()
                destination.on("pageerror", lambda error: errors.append("destination: " + str(error)))
                start(destination, url)
                assert destination.evaluate(
                    "() => !localStorage.getItem('birdspot-sightings')"
                ), "Destination must start without source localStorage"
                assert not current(destination) and count_photos(destination) == 0
                assert source_context is not dest_context
                print("CROSS-03 PASS — separate browser profile starts with zero records/photos")

                # CROSS-04 — corrupt archive and cancel do not mutate clean destination.
                profile(destination)
                destination.locator("#importFile").set_input_files({
                    "name": "invalid.zip", "mimeType": "application/zip",
                    "buffer": b"bad-zip"
                })
                destination.wait_for_function("() => !document.querySelector('#btnImport').disabled")
                assert destination.locator("#confirmOverlay").is_hidden()
                assert not current(destination) and count_photos(destination) == 0
                destination.locator("#importFile").set_input_files(str(dest_zip))
                destination.locator("#confirmOverlay").wait_for(state="visible")
                destination.locator("#confirmCancel").click()
                destination.locator("#confirmOverlay").wait_for(state="hidden")
                assert not current(destination) and count_photos(destination) == 0
                print("CROSS-04 PASS — invalid ZIP + cancel preserve empty second profile")

                # CROSS-05 — import in destination and cross-profile field/byte equality.
                import_archive(destination, dest_zip)
                rows = current(destination)
                assert len(rows) == 1 and rows[0]["id"] == row["id"]
                assert rows[0]["futureField"] == {"keep": True, "schema": 88}
                assert rows[0]["locationName"] == PLACE
                assert rows[0]["photoIds"] == [photo_id]
                imported_photo = check_real_photo(destination, photo_id)
                assert imported_photo and imported_photo["bytes"] == photo["bytes"]
                assert imported_photo["sightingId"] == row["id"]
                assert count_photos(destination) == 1
                print("CROSS-05 PASS — clean destination restored exact IDB PNG and all sighting fields")

                # CROSS-06 — source remains independent; new context reopen fully offline.
                assert len(current(source)) == 1
                assert count_photos(source) == 1
                destination.evaluate("() => navigator.serviceWorker.ready")
                if not destination.evaluate("!!navigator.serviceWorker.controller"):
                    destination.reload(wait_until="domcontentloaded")
                    destination.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
                destination.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
                destination.close()
                dest_context.set_offline(True)
                destination = dest_context.new_page()
                destination.on("pageerror", lambda error: errors.append("dest-offline: " + str(error)))
                start(destination, url)
                assert not destination.evaluate("navigator.onLine")
                records = current(destination)
                assert len(records) == 1 and records[0]["id"] == row["id"]
                restored_blob = check_real_photo(destination, photo_id)
                assert restored_blob and restored_blob["bytes"] == photo["bytes"]
                destination.evaluate("""async () => {
                  const app = await import('/src/app.js');
                  app.navigate('sightings');
                }""")
                card = destination.locator(f'.sight-card[data-id="{row["id"]}"]')
                card.wait_for(state="visible", timeout=12000)
                destination.wait_for_function("""id => {
                  const c = document.querySelector('.sight-card[data-id="' + id + '"]');
                  return !!c && [...c.querySelectorAll('img')].some(
                    img => img.complete && img.naturalWidth === 24
                  );
                }""", arg=row["id"], timeout=12000)
                card.click()
                destination.locator("#detailSightingSheet").wait_for(state="visible")
                assert MARKER in destination.locator("#detailSightingSheet").inner_text()
                print("CROSS-06 PASS — second isolated profile reopened offline and decoded restored image")

                # CROSS-07 — reimport must not duplicate sighting or binary.
                dest_context.set_offline(False)
                destination.locator("#detailClose").click()
                profile(destination)
                import_archive(destination, dest_zip)
                assert len(current(destination)) == 1 and count_photos(destination) == 1
                print("CROSS-07 PASS — repeated ZIP import creates no duplicate record or photo")

                # CROSS-08 — safety restore on destination only.
                destination.reload(wait_until="domcontentloaded")
                destination.locator("#birdspotSplash").wait_for(state="detached", timeout=25000)
                profile(destination)
                destination.locator("#restoreCard:not(.profile-card--hidden)").wait_for()
                destination.locator("#btnRestore").click()
                destination.locator("#confirmOverlay").wait_for(state="visible")
                destination.locator("#confirmOk").click()
                destination.wait_for_function(
                    "() => !document.querySelector('#btnRestore').disabled", timeout=15000
                )
                assert len(current(destination)) == 1 and count_photos(destination) == 1, (
                    "Rollback after duplicate import should preserve pre-import data"
                )
                assert len(current(source)) == 1 and count_photos(source) == 1
                assert not errors, errors
                print("CROSS-08 PASS — destination rollback preserves pre-duplicate data; source untouched")
                print("S1 CROSS-01..08 PASS (simulated second device only; physical second device NOT TESTED)")
            finally:
                source_context.close()
                dest_context.close()
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
