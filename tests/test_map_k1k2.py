"""
Birdspot Library — Kaart K1/K2
  K1-01  kaart over (bijna) het hele scherm: knoppen bedekken samen ≤ 15% van de kaart
  K1-02  filters in een uitklappaneel: standaard dicht, open via filterknop, punt bij actief filter, tik op kaart sluit
  K1-03  luchtfoto (PDOK) aan/uit; keuze blijft na herladen bewaard
  K2-01  nauwkeurigheid: ±47 m op zoom 13, ±3 m op zoom 17, grens 50 m
  K2-02  '+ Pin waarneming': vaste pin precies in het kaartmidden; plaatsen pas mogelijk na inzoomen
  K2-03  kaart verschuiven verandert de coördinaten; 'Plaats hier' opent het formulier met plek en ±meters
  K2-04  annuleren zet alles terug; een gewone tik op de kaart maakt geen waarneming
  K2-05  pinkiezer in het formulier werkt ook met de vaste pin (ingezoomd, met ±meters)
  K2-06  waarneming opslaan bewaart pinAccuracyM; geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_map_k1k2.py
"""
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
ROWS = [
    {"id": "m1", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "seen", "lat": 52.40, "lon": 5.30},
    {"id": "m2", "speciesId": "sp045", "speciesName": "Merel", "observationMethod": "heard", "lat": 52.10, "lon": 5.10},
]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def rect(p, sel):
    return p.evaluate(f"() => {{ const r = document.querySelector('{sel}').getBoundingClientRect();"
                      " return {x:r.x,y:r.y,w:r.width,h:r.height}; }")


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", service_workers="block")
            ctx.add_init_script(LEAFLET_STUB)
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(url, wait_until="domcontentloaded")
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            p.evaluate("(rows) => localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({...r, date:'2026-05-01', count:1, photoIds:[]}))}))", ROWS)

            def open_map():
                p.locator('.nav-item[data-route="map"]').click()
                p.wait_for_function("() => window.__birdspotMapTest?.map && document.getElementById('mapCount')?.textContent !== 'laden…'", timeout=10000)

            open_map()
            mp = rect(p, "#leafletMap")
            covered = 0
            for sel in (".map-topbar", "#mapCount", ".map-side-controls", "#mapAddPinBtn"):
                r = rect(p, sel)
                covered += r["w"] * r["h"]
            share = covered / (mp["w"] * mp["h"])
            assert share <= 0.15, f"K1-01 knoppen bedekken {share:.0%} van de kaart"
            assert rect(p, ".map-topbar")["h"] <= 50
            p.screenshot(path=str(SHOTS / "map_k1_390.png"))
            print(f"K1-01 OK — knoppen bedekken {share:.0%} van de kaart")

            assert p.locator("#mapFilterPanel").is_hidden()
            p.locator("#mapFilterBtn").click()
            assert p.locator("#mapFilterPanel").is_visible() and p.locator("#mapFilterBtn").get_attribute("aria-expanded") == "true"
            assert p.locator("#mapFilterDot").is_hidden()
            p.locator("#mapStatusSelect").select_option("seen")
            assert p.locator("#mapFilterDot").is_visible()
            p.screenshot(path=str(SHOTS / "map_k1_filters_390.png"))
            p.locator("#leafletMap").dispatch_event("pointerdown")
            assert p.locator("#mapFilterPanel").is_hidden()
            p.locator("#mapFilterBtn").click()
            p.locator("#mapClearFilters").click()
            p.locator("#leafletMap").dispatch_event("pointerdown")
            print("K1-02 OK — filterpaneel")

            tiles = lambda: p.evaluate("() => window.__birdspotMapTest.tiles || []")  # noqa: E731
            assert any("openstreetmap" in t for t in tiles()) and not any("pdok" in t for t in tiles())
            p.locator("#mapLayerBtn").click()
            assert any("service.pdok.nl" in t for t in tiles()) and p.locator("#mapLayerBtn").get_attribute("aria-pressed") == "true"
            p.locator('.nav-item[data-route="home"]').click()
            open_map()
            assert any("service.pdok.nl" in t for t in tiles()), "K1-03 keuze niet bewaard"
            p.locator("#mapLayerBtn").click()
            assert not any("pdok" in t for t in tiles())
            print("K1-03 OK — luchtfoto aan/uit en bewaard")

            acc = p.evaluate("async () => { const m = await import('/src/features/map/centerPin.js');"
                             " return [m.pinAccuracyM(52.15,13), m.pinAccuracyM(52.15,17), m.pinAccuracyM(52.15,21), m.MAX_PIN_ACCURACY_M, m.accuracyLabel(1200)]; }")
            assert acc[0] == 47 and acc[1] == 3 and acc[2] == 1 and acc[3] == 50 and acc[4] == "±1,2 km", acc
            print("K2-01 OK — nauwkeurigheid", acc)

            assert p.locator("#mapCenterPin").is_hidden()
            p.locator("#mapAddPinBtn").click()
            assert p.locator("#mapCenterPin").is_visible() and p.locator("#mapPinPanel").is_visible()
            assert p.locator("#mapAddPinBtn").is_hidden() and p.locator(".map-topbar").is_hidden()
            pin, mp = rect(p, "#mapCenterPin"), rect(p, "#leafletMap")
            assert abs(pin["x"] + pin["w"] / 2 - (mp["x"] + mp["w"] / 2)) <= 1 and abs(pin["y"] + pin["h"] / 2 - (mp["y"] + mp["h"] / 2)) <= 1, (pin, mp)
            p.evaluate("() => window.__birdspotMapTest.map.setZoom(8)")
            assert p.locator("#mapPinConfirm").is_disabled()
            assert "Zoom verder in" in p.locator("#mapPinHint").inner_text()
            p.evaluate("() => window.__birdspotMapTest.map.setView([52.3, 4.9], 17)")
            assert p.locator("#mapPinConfirm").is_enabled()
            assert p.locator("#mapPinAccuracy").inner_text() == "±3 m"
            print("K2-02 OK — vaste pin in het midden; plaatsen na inzoomen")

            assert p.locator("#mapPinCoords").inner_text() == "52.300000, 4.900000"
            p.evaluate("() => window.__birdspotMapTest.map.setView([52.312345, 4.912345], 19)")
            assert p.locator("#mapPinCoords").inner_text() == "52.312345, 4.912345"
            assert p.locator("#mapPinAccuracy").inner_text() == "±1 m"
            p.screenshot(path=str(SHOTS / "map_k2_pin_390.png"))
            p.locator("#mapPinConfirm").click()
            p.locator("#addSightingSheet").wait_for(timeout=8000)
            hint = p.locator("#coordsHint").inner_text()
            assert "52.31235, 4.91235" in hint and "±1 m" in hint, hint
            print("K2-03 OK — coördinaten volgen de kaart; formulier met plek en ±1 m")

            p.locator("#speciesPickerBtn").click()
            p.locator('#spPickerList .species-row[data-id="sp118"]').click()
            p.locator("#addSheetSubmit").click()
            p.locator("#addSightingSheet").wait_for(state="detached", timeout=12000)
            saved = p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.at(-1)")
            assert saved["pinAccuracyM"] == 1 and abs(saved["lat"] - 52.312345) < 1e-6, saved
            print("K2-06 OK — pinAccuracyM bewaard:", saved["pinAccuracyM"])

            open_map()
            p.locator("#mapAddPinBtn").click()
            p.locator("#mapPinCancel").click()
            assert p.locator("#mapCenterPin").is_hidden() and p.locator("#mapPinPanel").is_hidden() and p.locator("#mapAddPinBtn").is_visible()
            p.locator("#leafletMap").click(position={"x": 200, "y": 400})
            assert p.locator("#addSightingSheet").count() == 0
            print("K2-04 OK — annuleren; gewone tik maakt geen waarneming")

            p.locator("#fab").click()
            p.locator("#addSightingSheet").wait_for(timeout=8000)
            p.locator("#sightPinBtn").click()
            p.locator("#pinCenterPin").wait_for(state="visible", timeout=8000)
            assert p.locator("#pinConfirm").is_disabled()
            p.evaluate("() => window.__birdspotMapTest.map.setView([53.37, 6.2], 18)")
            assert p.locator("#pinConfirm").is_enabled()
            assert p.locator("#pinLat").input_value() == "53.370000"
            p.wait_for_timeout(400)
            assert p.evaluate("() => getComputedStyle(document.querySelector('#pinConfirm')).opacity") == "1"
            p.screenshot(path=str(SHOTS / "map_k2_picker_390.png"))
            p.locator("#pinConfirm").click()
            hint = p.locator("#coordsHint").inner_text()
            assert "53.37000, 6.20000" in hint and "±" in hint, hint
            p.locator("#addSheetCancel").click()
            print("K2-05 OK — pinkiezer met vaste pin:", hint.strip())

            assert not errors, f"paginafouten: {errors}"
            print("K2-06 OK — geen paginafouten")
            browser.close()
    print("Kaart K1/K2: alle controles geslaagd")


if __name__ == "__main__":
    main()
