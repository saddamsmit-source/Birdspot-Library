"""
Birdspot Library — Kaart K4: vaste plekken
  K4-01  migratie: waarnemingen met exact dezelfde coördinaten → één plek; eigen lat/lon onveranderd;
         bestaande placeId blijft; idempotent (tweede keer geen nieuwe plekken)
  K4-02  kaart: één pin per plek; plek met gezien + gehoord = oranje met teller 2
  K4-03  plekkaartje: naam, 2 soorten / 2 bezoeken / 2 waarnemingen, lijst; tik opent de waarneming
  K4-04  pin binnen 50 m → vraag 'Je bent bij …'; 'Deze plek gebruiken' koppelt de plek, eigen pin blijft bewaard
  K4-05  'Nieuwe plek' → bij opslaan een nieuwe plek; pin verder dan 50 m → geen vraag
  K4-06  '+ Waarneming hier' vult plek in zonder vraag; naam wijzigen blijft bewaard
  K4-07  foto en geluid (WAV) toevoegen aan een plek; zichtbaar als afbeelding en speler
  K4-08  back-up bevat plekken, plek-media en geluid; herstellen in een lege app zet alles terug
  K4-09  geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_map_k4.py
"""
import base64
import http.server
import struct
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
HUT = (53.371000, 6.201000)  # 'Kijkhut' — twee waarnemingen op exact dezelfde pin
ROWS = [
    {"id": "w1", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "seen", "lat": HUT[0], "lon": HUT[1], "date": "2026-04-12", "locationName": "Kijkhut Lauwersmeer"},
    {"id": "w2", "speciesId": "sp243", "speciesName": "Roerdomp", "observationMethod": "heard", "lat": HUT[0], "lon": HUT[1], "date": "2026-05-02"},
    {"id": "w3", "speciesId": "sp045", "speciesName": "Merel", "observationMethod": "seen", "lat": 52.10, "lon": 5.10, "date": "2026-05-03"},
    {"id": "w4", "speciesId": "sp050", "speciesName": "Roodborst", "observationMethod": "seen", "date": "2026-05-04"},
]


def wav_bytes(seconds=0.2, rate=8000):
    n = int(seconds * rate)
    data = b"\x80" * n
    return b"RIFF" + struct.pack("<I", 36 + n) + b"WAVEfmt " + struct.pack("<IHHIIHH", 16, 1, 1, rate, rate, 1, 8) + b"data" + struct.pack("<I", n) + data


PNG = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce",
                                      service_workers="block", accept_downloads=True)
            ctx.add_init_script(LEAFLET_STUB)
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(url, wait_until="domcontentloaded")
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            p.evaluate("(rows) => { localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({...r, count:1, photoIds:[]}))})); localStorage.removeItem('birdspot-places'); }", ROWS)
            stored = lambda: p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings")  # noqa: E731
            places = lambda: p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-places')||'{\"places\":[]}').places")  # noqa: E731

            def open_map():
                p.locator('.nav-item[data-route="map"]').click()
                p.wait_for_function("() => window.__birdspotMapTest?.map && document.getElementById('mapCount')?.textContent !== 'laden…'", timeout=10000)

            # K4-01
            open_map()
            pl, ss = places(), {s["id"]: s for s in stored()}
            assert len(pl) == 2, pl
            hut = next(x for x in pl if abs(x["lat"] - HUT[0]) < 1e-9)
            assert hut["name"] == "Kijkhut Lauwersmeer", hut
            assert ss["w1"]["placeId"] == ss["w2"]["placeId"] == hut["id"]
            assert ss["w3"]["placeId"] != hut["id"] and "placeId" not in ss["w4"]
            assert ss["w1"]["lat"] == HUT[0] and ss["w3"]["lon"] == 5.10
            p.evaluate("async () => (await import('/src/data/places.js')).ensurePlaces()")
            assert len(places()) == 2
            print("K4-01 OK — 2 plekken uit 3 gepinde waarnemingen; idempotent")

            # K4-02
            p.evaluate("() => window.__birdspotMapTest.map.setZoom(16)")
            assert p.locator(".mock-bird-marker .bird-pin").count() == 2
            hut_pin = p.locator(".bird-pin--status-both")
            assert hut_pin.count() == 1 and hut_pin.locator(".bird-pin-count").inner_text() == "2"
            assert p.locator("#mapCount").inner_text() == "3 van 4 pins"
            p.screenshot(path=str(SHOTS / "map_k4_places_390.png"))
            print("K4-02 OK — één pin per plek, Kijkhut oranje met 2")

            # K4-03
            p.evaluate("() => window.__birdspotMapTest.markers.find(m => m.birdspotRecords.length === 2).events.click()")
            p.locator("#mapDetailSheet.open").wait_for(timeout=5000)
            p.locator(".place-stats").wait_for(timeout=5000)
            assert p.locator("#mapSheetName").inner_text() == "Kijkhut Lauwersmeer"
            stats = p.eval_on_selector_all(".place-stat", "els => els.map(e => e.innerText.replace(/\\s+/g,' ').trim())")
            assert stats == ["2 soorten", "2 bezoeken", "2 waarnemingen"], stats
            names = p.eval_on_selector_all(".place-sightings b", "els => els.map(e => e.innerText)")
            assert names == ["Roerdomp", "Rietgors"], names
            p.screenshot(path=str(SHOTS / "map_k4_place_sheet_390.png"))
            p.locator('.place-sightings [data-sighting="w2"]').click()
            p.locator("#detailSightingSheet").wait_for(timeout=5000)
            p.locator("#detailClose").click()
            p.locator("#detailSightingSheet").wait_for(state="detached", timeout=5000)
            print("K4-03 OK — plekkaartje met statistiek en lijst")

            # K4-04: pin 22 m van de kijkhut
            open_map()
            p.locator("#mapAddPinBtn").click()
            p.evaluate(f"() => window.__birdspotMapTest.map.setView([{HUT[0] + 0.0002}, {HUT[1]}], 18)")
            p.locator("#mapPinConfirm").click()
            prompt = p.locator(".place-prompt")
            prompt.wait_for(timeout=5000)
            assert "Kijkhut Lauwersmeer" in prompt.inner_text() and "22 m" in prompt.inner_text(), prompt.inner_text()
            p.screenshot(path=str(SHOTS / "map_k4_prompt_390.png"))
            p.locator("#placePromptUse").click()
            assert "Plek: Kijkhut Lauwersmeer" in p.locator("#coordsHint").inner_text()
            assert p.locator("#sightLocation").input_value() == "Kijkhut Lauwersmeer"
            p.locator("#speciesPickerBtn").click()
            p.locator('#spPickerList .species-row[data-id="sp252"]').click()
            p.locator("#addSheetSubmit").click()
            p.locator("#addSightingSheet").wait_for(state="detached", timeout=12000)
            new = stored()[-1]
            assert new["placeId"] == hut["id"] and abs(new["lat"] - (HUT[0] + 0.0002)) < 1e-9, new
            assert len(places()) == 2
            print("K4-04 OK — bestaande plek hergebruikt; eigen pin bewaard")

            # K4-05: weer binnen 50 m, maar 'Nieuwe plek'; en een pin ver weg zonder vraag
            open_map()
            p.locator("#mapAddPinBtn").click()
            p.evaluate(f"() => window.__birdspotMapTest.map.setView([{HUT[0] - 0.0003}, {HUT[1]}], 18)")
            p.locator("#mapPinConfirm").click()
            p.locator("#placePromptNew").click()
            assert "Nieuwe plek" in p.locator("#coordsHint").inner_text()
            p.locator("#speciesPickerBtn").click()
            p.locator('#spPickerList .species-row[data-id="sp009"]').click()
            p.locator("#addSheetSubmit").click()
            p.locator("#addSightingSheet").wait_for(state="detached", timeout=12000)
            assert len(places()) == 3 and stored()[-1]["placeId"] not in (hut["id"],)
            open_map()
            p.locator("#mapAddPinBtn").click()
            p.evaluate("() => window.__birdspotMapTest.map.setView([51.0, 4.0], 18)")
            p.locator("#mapPinConfirm").click()
            p.locator("#addSightingSheet").wait_for(timeout=5000)
            p.wait_for_timeout(300)
            assert p.locator(".place-prompt").count() == 0
            p.locator("#addSheetCancel").click()
            p.locator("#addSightingSheet").wait_for(state="detached", timeout=5000)
            print("K4-05 OK — nieuwe plek op verzoek; ver weg geen vraag")

            # K4-06
            open_map()
            p.evaluate(f"() => window.__birdspotMapTest.markers.find(m => m.birdspotPlace.id === '{hut['id']}').events.click()")
            p.locator("#placeAddSighting").wait_for(timeout=5000)
            p.locator("#placeRename").click()
            p.locator("#placeRenameInput").fill("Kijkhut Ezumakeeg")
            p.locator("#placeRenameSave").click()
            assert p.locator("#mapSheetName").inner_text() == "Kijkhut Ezumakeeg"
            assert next(x for x in places() if x["id"] == hut["id"])["name"] == "Kijkhut Ezumakeeg"
            p.locator("#placeAddSighting").click()
            p.locator("#addSightingSheet").wait_for(timeout=5000)
            p.wait_for_timeout(300)
            assert p.locator(".place-prompt").count() == 0
            assert "Plek: Kijkhut Ezumakeeg" in p.locator("#coordsHint").inner_text()
            p.locator("#addSheetCancel").click()
            p.locator("#addSightingSheet").wait_for(state="detached", timeout=5000)
            print("K4-06 OK — waarneming hier zonder vraag; naam gewijzigd")

            # K4-07
            p.evaluate(f"() => window.__birdspotMapTest.markers.find(m => m.birdspotPlace.id === '{hut['id']}').events.click()")
            p.locator("#placeMediaInput").wait_for(state="attached", timeout=5000)
            p.locator("#placeMediaInput").set_input_files([
                {"name": "kijkhut.png", "mimeType": "image/png", "buffer": PNG},
                {"name": "roerdomp-merlin.wav", "mimeType": "audio/wav", "buffer": wav_bytes()},
            ])
            p.locator("#placeMedia audio").wait_for(timeout=8000)
            assert p.locator("#placeMedia img.place-media__thumb").count() == 1
            assert "roerdomp-merlin.wav" in p.locator(".place-media__audio figcaption").inner_text()
            p.screenshot(path=str(SHOTS / "map_k4_media_390.png"))
            p.locator("#mapSheetClose").click()
            print("K4-07 OK — foto en geluid bij de plek")

            # K4-08: back-up en herstel in een lege app
            with p.expect_download(timeout=15000) as dl:
                p.evaluate("async () => (await import('/src/storage/backup.js')).exportBackup()")
            zip_b64 = base64.b64encode(Path(dl.value.path()).read_bytes()).decode()
            before = {"places": places(), "sightings": stored()}
            p.evaluate("""async () => {
              localStorage.removeItem('birdspot-places'); localStorage.removeItem('birdspot-sightings');
              const {getDB} = await import('/src/data/db.js'); const db = await getDB();
              await new Promise(r => { const tx = db.transaction('photos','readwrite'); tx.objectStore('photos').clear(); tx.oncomplete = r; });
            }""")
            p.evaluate("""async (b64) => {
              const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
              const m = await import('/src/storage/backup.js');
              await m.importBackup(new File([bytes], 'b.zip', {type:'application/zip'}));
            }""", zip_b64)
            assert places() == before["places"], "K4-08 plekken"
            assert [s.get("placeId") for s in stored()] == [s.get("placeId") for s in before["sightings"]]
            media = p.evaluate(f"async () => (await (await import('/src/data/db.js')).getMediaByPlace('{hut['id']}')).map(m => [m.filename, m.type, m.blob.size])")
            assert sorted(m[1] for m in media) == ["audio/wav", "image/png"], media
            assert all(m[2] > 0 for m in media)
            print("K4-08 OK — back-up en herstel:", media)

            assert not errors, f"K4-09 paginafouten: {errors}"
            print("K4-09 OK — geen paginafouten")
            browser.close()
    print("Kaart K4: alle controles geslaagd")


if __name__ == "__main__":
    main()
