"""
Birdspot Library — Kaart K5: zoeken op plek en alles aan elkaar koppelen
  K5-01  zoeken op plaatsnaam ('kijkhut') toont alleen die plek; lijst '1 plek'
  K5-02  zoeken op vogel ('roerdomp') toont alle plekken waar hij gepind is (2), kaart zoomt naar beide;
         tik op een plek opent het plekkaartje
  K5-03  plekkaartje: 'Soorten hier'; tik op een soort opent de soortpagina
  K5-04  soortpagina, tab Waar: plekken uit de vaste plekken (naam van de plek); tik opent de kaart op die plek
  K5-05  geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_map_k5.py
"""
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
PLACES = [
    {"id": "pl_hut", "name": "Kijkhut Lauwersmeer", "lat": 53.371, "lon": 6.201, "createdAt": "2026-01-01", "updatedAt": "2026-01-01"},
    {"id": "pl_ovp", "name": "Oostvaardersplassen", "lat": 52.45, "lon": 5.35, "createdAt": "2026-01-01", "updatedAt": "2026-01-01"},
    {"id": "pl_tuin", "name": "Achtertuin", "lat": 52.10, "lon": 5.10, "createdAt": "2026-01-01", "updatedAt": "2026-01-01"},
]
ROWS = [
    {"id": "a1", "speciesId": "sp243", "speciesName": "Roerdomp", "observationMethod": "heard", "lat": 53.371, "lon": 6.201, "placeId": "pl_hut", "date": "2026-04-12", "locationName": "oude naam"},
    {"id": "a2", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "seen", "lat": 53.371, "lon": 6.201, "placeId": "pl_hut", "date": "2026-04-12"},
    {"id": "a3", "speciesId": "sp243", "speciesName": "Roerdomp", "observationMethod": "both", "lat": 52.45, "lon": 5.35, "placeId": "pl_ovp", "date": "2026-05-02"},
    {"id": "a4", "speciesId": "sp045", "speciesName": "Merel", "observationMethod": "seen", "lat": 52.10, "lon": 5.10, "placeId": "pl_tuin", "date": "2026-05-03"},
]


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
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", service_workers="block")
            ctx.add_init_script(LEAFLET_STUB)
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(f"http://127.0.0.1:{server.server_address[1]}/", wait_until="domcontentloaded")
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            p.evaluate("([rows, places]) => { localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({...r, count:1, photoIds:[]}))}));"
                       "localStorage.setItem('birdspot-places', JSON.stringify({schemaVersion:1, places})); }", [ROWS, PLACES])

            def open_map():
                p.locator('.nav-item[data-route="map"]').click()
                p.wait_for_function("() => window.__birdspotMapTest?.map && document.getElementById('mapCount')?.textContent !== 'laden…'", timeout=10000)

            open_map()
            p.locator("#mapSpeciesSearch").fill("kijkhut")
            assert p.locator("#mapCount").inner_text() == "2 van 4 pins"
            res = p.locator("#mapSearchResults")
            assert res.is_visible() and res.locator("h3").inner_text().lower() == "1 plek"
            assert res.locator("b").all_inner_texts() == ["Kijkhut Lauwersmeer"]
            print("K5-01 OK — zoeken op plaatsnaam")

            p.locator("#mapSpeciesSearch").fill("roerdomp")
            assert p.locator("#mapCount").inner_text() == "2 van 4 pins"
            assert sorted(res.locator("b").all_inner_texts()) == ["Kijkhut Lauwersmeer", "Oostvaardersplassen"]
            fitted = p.evaluate("() => window.__birdspotMapTest.fitted")
            assert sorted(map(tuple, fitted)) == [(52.45, 5.35), (53.371, 6.201)], fitted
            p.screenshot(path=str(SHOTS / "map_k5_search_390.png"))
            res.locator('[data-place="pl_ovp"]').click()
            p.locator("#mapDetailSheet.open").wait_for(timeout=5000)
            p.locator(".place-stats").wait_for(timeout=5000)
            assert p.locator("#mapSheetName").inner_text() == "Oostvaardersplassen"
            assert res.is_hidden()
            print("K5-02 OK — vogel zoeken toont alle plekken; tik opent de plek")

            p.locator("#mapSheetClose").click()
            p.locator("#mapSpeciesSearch").fill("")
            p.evaluate("() => window.__birdspotMapTest.markers.find(m => m.birdspotPlace.id === 'pl_hut').events.click()")
            p.locator(".place-species").wait_for(timeout=5000)
            chips = p.locator(".place-species__chip").all_inner_texts()
            assert [c.split()[0] for c in chips] == ["Rietgors", "Roerdomp"], chips
            p.screenshot(path=str(SHOTS / "map_k5_place_species_390.png"))
            p.locator('.place-species__chip[data-species="sp243"]').click()
            p.locator(".sd-tabs").wait_for(timeout=8000)
            assert "Roerdomp" in p.locator(".signature-species-detail-overlay, .sd-tabs").first.evaluate("e => e.closest('[role=dialog], .signature-species-detail-overlay')?.innerText || document.body.innerText")
            print("K5-03 OK — van plek naar soort")

            p.locator('[data-sd-tab="waar"]').click()
            p.locator("#sdPanel-waar .sd-place-link").first.wait_for(timeout=8000)
            names = p.eval_on_selector_all("#sdPanel-waar .sd-place-link span", "els => els.map(e => e.innerText)")
            assert sorted(names) == ["Kijkhut Lauwersmeer", "Oostvaardersplassen"], names
            p.screenshot(path=str(SHOTS / "map_k5_species_where_390.png"))
            p.locator('#sdPanel-waar [data-place-id="pl_hut"]').click()
            p.locator("#mapDetailSheet.open").wait_for(timeout=10000)
            p.locator(".place-stats").wait_for(timeout=5000)
            assert p.locator("#mapSheetName").inner_text() == "Kijkhut Lauwersmeer"
            print("K5-04 OK — van soort naar plek op de kaart")

            assert not errors, errors
            print("K5-05 OK — geen paginafouten")
            browser.close()
    print("Kaart K5: alle controles geslaagd")


if __name__ == "__main__":
    main()
