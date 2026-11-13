#!/usr/bin/env python3
"""Birdspot Android-camera PREPARATION: real JPEG and failed photo retry.

The test runs in mobile-emulated Chromium on localhost. It does NOT use
a real Android device, camera, permission chooser, USB port or public host.
The successful file follows the actual app file input, decode, IndexedDB,
save and offline reopen paths; the invalid image must not lose form state.
"""
import io
import threading
from PIL import Image
from playwright.sync_api import sync_playwright

from test_pilot_offline_new_sighting import Quiet, Server, boot, check_real_photo


MARKER = "BIRDSPOT-ANDROID-JPEG-PRECHECK-20261113"
PLACE = "Fictieve camerafototest zonder GPS"


def jpeg_fixture():
    """JPEG with EXIF orientation, like a test phone photo; no real GPS/private data."""
    with Image.new("RGB", (64, 48), (37, 91, 163)) as image:
        exif = Image.Exif()
        exif[274] = 6  # Orientation: rotated 90 degrees
        exif[270] = "BIRDSPOT_TEST_ONLY"
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=92, exif=exif)
    data = buffer.getvalue()
    with Image.open(io.BytesIO(data)) as check:
        check.load()
        assert check.format == "JPEG" and check.size == (64, 48)
        assert check.getexif().get(274) == 6
    return data


def saved_records(page):
    return page.evaluate("""marker => {
        const raw = localStorage.getItem('birdspot-sightings');
        const records = raw ? (JSON.parse(raw).sightings || []) : [];
        return records.filter(s => s && s.notes === marker);
    }""", MARKER)


def main():
    jpeg = jpeg_fixture()
    with Server(("127.0.0.1", 0), Quiet) as srv:
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{srv.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(
                viewport={"width": 390, "height": 844},
                is_mobile=True, has_touch=True, reduced_motion="reduce",
                service_workers="allow",
            )
            errors = []
            try:
                page = ctx.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                page.evaluate("async () => { await navigator.serviceWorker.ready; }")
                if not page.evaluate("!!navigator.serviceWorker.controller"):
                    page.reload(wait_until="domcontentloaded")
                    page.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
                page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=60000)
                print("CAM-01 PASS — genuine app serviceworker active on local secure origin")

                page.close()
                ctx.set_offline(True)
                page = ctx.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine")
                page.locator("#fab").click()
                page.locator("#addSightingSheet").wait_for(state="visible", timeout=15000)
                page.locator("#speciesPickerBtn").click()
                page.locator("#spPickerSearch").fill("Koolmees")
                page.locator('#spPickerList .species-row').filter(
                    has=page.locator('.species-row__name', has_text="Koolmees")
                ).first.click()
                page.locator("#speciesPickerOverlay").wait_for(state="detached", timeout=12000)
                page.locator("#sightLocation").fill(PLACE)
                page.locator("#sightingMore summary").click()
                page.locator("#sightNotes").fill(MARKER)

                # An invalid image should be rejected by the *real* decode path,
                # not silently accepted as if the phone selected a valid picture.
                bad = b"NOT_A_REAL_JPEG_BIRDSPOT_TEST"
                page.locator("#sightingMediaInput").set_input_files({
                    "name": "corrupt-camera.jpg",
                    "mimeType": "image/jpeg",
                    "buffer": bad,
                })
                page.wait_for_function("""() => {
                    const p = document.querySelector('#sightingMediaStatus');
                    return p && p.textContent.includes('corrupt-camera.jpg');
                }""", timeout=15000)
                assert "Kan niet worden geopend" in page.locator("#sightingMediaStatus").inner_text()
                assert page.locator("#addSightingSheet").is_visible()
                assert page.locator("#sightNotes").input_value() == MARKER
                assert page.locator("#sightLocation").input_value() == PLACE
                assert page.locator("#addSheetSubmit").is_enabled()
                assert not saved_records(page), "Failed image caused unexpected persisted sighting"
                assert page.locator("#addSightingSheet .media-thumb").count() == 0
                print("CAM-02 PASS — unreadable JPEG rejected, input and prior data preserved offline")

                # Retry with a valid JPEG bearing EXIF orientation. Only the actual
                # app's upload & photo-storage APIs may write this record.
                page.locator("#sightingMediaInput").set_input_files({
                    "name": "android-camera-test.jpg",
                    "mimeType": "image/jpeg",
                    "buffer": jpeg,
                })
                page.wait_for_function("""() => {
                    const images = [...document.querySelectorAll('#addSightingSheet .media-thumb img')];
                    return images.some(img => img.complete && img.naturalWidth > 0);
                }""", timeout=16000)
                assert page.locator("#sightNotes").input_value() == MARKER
                assert page.locator("#sightLocation").input_value() == PLACE
                assert page.locator("#addSheetSubmit").is_enabled()
                print("CAM-03 PASS — valid EXIF-orientated JPEG preview decodes; fields survive retry")

                page.locator("#addSheetSubmit").click()
                page.locator("#addSightingSheet").wait_for(state="detached", timeout=20000)
                rows = saved_records(page)
                assert len(rows) == 1 and len(rows[0].get("photoIds", [])) == 1, rows
                sighting_id = rows[0]["id"]
                photo_id = rows[0]["photoIds"][0]
                result = check_real_photo(page, photo_id)
                assert result and result["bytes"] == list(jpeg)
                assert result["type"] == "image/jpeg"
                assert result["sightingId"] == sighting_id
                assert result["width"] > 0 and result["height"] > 0
                print("CAM-04 PASS — JPEG and EXIF bytes saved unchanged into IndexedDB")

                page.close()
                page = ctx.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine")
                rows = saved_records(page)
                assert len(rows) == 1 and rows[0]["id"] == sighting_id
                photo = check_real_photo(page, photo_id)
                assert photo and photo["bytes"] == list(jpeg)
                page.evaluate("""async () => {
                    const app = await import('/src/app.js');
                    app.navigate('sightings');
                }""")
                card = page.locator(f'.sight-card[data-id="{sighting_id}"]')
                card.wait_for(state="visible", timeout=12000)
                page.wait_for_function("""id => {
                    const card = document.querySelector('.sight-card[data-id="' + id + '"]');
                    return !!card && [...card.querySelectorAll('img')].some(
                        img => img.complete && img.naturalWidth > 0);
                }""", arg=sighting_id, timeout=18000)
                card.click()
                page.locator("#detailSightingSheet").wait_for(state="visible", timeout=12000)
                assert MARKER in page.locator("#detailSightingSheet").inner_text()
                print("CAM-05 PASS — after close and offline reopen, record and JPEG decode in real UI")
                assert not errors, errors
                print("CAM-06 PASS — no unexpected JavaScript page errors")
            finally:
                ctx.close()
                browser.close()
        srv.shutdown()


if __name__ == "__main__":
    main()
