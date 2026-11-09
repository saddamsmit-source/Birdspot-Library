"""
Birdspot Library — Kaart K6: seizoenswolken, klikbare legenda, bijzondere waarnemingen, beste maanden
  K6-01  rekenregels: seizoen per datum, maandhistogram, beste maanden (≥ 75% van max), wolkstraal groeit en is begrensd
  K6-02  wolken: per plek een wolk per seizoen met waarnemingen, in de seizoenskleur; uit te zetten
  K6-03  legenda 'Gehoord' is een filter (incl. Merlin); nogmaals tikken zet hem uit
  K6-04  seizoenslegenda filtert pins én wolken; meerdere seizoenen tegelijk
  K6-05  ★ bijzondere waarneming (zeldzaam, dwaalgast, Rode Lijst) op de pin; filter 'alleen bijzonder'
  K6-06  periode 'dit jaar' en 'Wis filters' zet alles terug
  K6-07  plekkaartje toont beste maanden; geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_map_k6.py
"""
import datetime as dt
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
Y = dt.date.today().year
PLACES = [
    {"id": "pl_a", "name": "Lauwersmeer", "lat": 53.37, "lon": 6.20, "createdAt": "x", "updatedAt": "x"},
    {"id": "pl_b", "name": "Achtertuin", "lat": 52.10, "lon": 5.10, "createdAt": "x", "updatedAt": "x"},
]
ROWS = [  # Lauwersmeer: lente 3x (apr 2, mei 1), winter 1x; Achtertuin: zomer 1x, vorig jaar
    {"id": "r1", "speciesId": "sp243", "speciesName": "Roerdomp", "observationMethod": "heard", "placeId": "pl_a", "lat": 53.37, "lon": 6.20, "date": f"{Y}-04-02"},
    {"id": "r2", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "seen", "placeId": "pl_a", "lat": 53.37, "lon": 6.20, "date": f"{Y}-04-20"},
    {"id": "r3", "speciesId": "sp252", "speciesName": "Zeearend", "observationMethod": "both", "placeId": "pl_a", "lat": 53.37, "lon": 6.20, "date": f"{Y}-05-11"},
    {"id": "r4", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "heard", "identificationSource": "merlin", "merlinVerification": "suggested", "placeId": "pl_a", "lat": 53.37, "lon": 6.20, "date": f"{Y}-01-15"},
    {"id": "r5", "speciesId": "sp045", "speciesName": "Merel", "observationMethod": "seen", "placeId": "pl_b", "lat": 52.10, "lon": 5.10, "date": f"{Y - 1}-07-01"},
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

            u = p.evaluate("""async () => { const m = await import('/src/features/map/insights.js');
              const rows = [{date:'2026-04-02'},{date:'2026-04-20'},{date:'2026-05-11'},{date:'2026-01-15'}];
              return {s: ['2026-12-01','2026-03-01','2026-06-30','2026-11-30','x'].map(m.seasonOf),
                h: m.monthHistogram(rows), b: m.bestMonths(m.monthHistogram(rows)),
                r: [m.cloudRadiusPx(1), m.cloudRadiusPx(4), m.cloudRadiusPx(1000)]}; }""")
            assert u["s"] == ["winter", "lente", "zomer", "herfst", None], u
            assert u["h"] == [1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0] and u["b"] == [3], u
            assert u["r"][0] < u["r"][1] and u["r"][2] == 64, u
            print("K6-01 OK — rekenregels")

            p.locator('.nav-item[data-route="map"]').click()
            p.wait_for_function("() => window.__birdspotMapTest?.map && document.getElementById('mapCount')?.textContent !== 'laden…'", timeout=10000)
            clouds = lambda: p.evaluate("() => (window.__birdspotMapTest.clouds||[]).map(c => [c.className.split('--')[1], c.ll[0]])")  # noqa: E731
            assert sorted(clouds()) == [["lente", 53.37], ["winter", 53.37], ["zomer", 52.1]], clouds()
            col = p.evaluate("() => window.__birdspotMapTest.clouds.find(c => c.className.endsWith('lente')).fillColor")
            assert col == "#7AC74F", col
            p.evaluate("() => window.__birdspotMapTest.map.setZoom(16)")
            p.screenshot(path=str(SHOTS / "map_k6_clouds_390.png"))
            p.locator("#mapFilterBtn").click()
            p.locator("#mapCloudsToggle").uncheck()
            assert clouds() == [] and p.locator(".map-legend--seasons").is_hidden()
            p.locator("#mapCloudsToggle").check()
            assert len(clouds()) == 3
            p.locator("#leafletMap").dispatch_event("pointerdown")
            print("K6-02 OK — seizoenswolken, aan/uit")

            p.locator('[data-legend="heard"]').click()
            assert p.locator('[data-legend="heard"]').get_attribute("aria-pressed") == "true"
            assert p.locator("#mapCount").inner_text() == "2 van 5 pins", p.locator("#mapCount").inner_text()
            assert p.locator("#mapFilterDot").is_visible()
            p.locator('[data-legend="heard"]').click()
            assert p.locator("#mapCount").inner_text() == "5 pins"
            print("K6-03 OK — legenda 'Gehoord' filtert (incl. Merlin)")

            p.locator('[data-season="lente"]').click()
            assert p.locator("#mapCount").inner_text() == "3 van 5 pins"
            assert [c[0] for c in clouds()] == ["lente"]
            p.locator('[data-season="zomer"]').click()
            assert p.locator("#mapCount").inner_text() == "4 van 5 pins"
            assert sorted(c[0] for c in clouds()) == ["lente", "zomer"]
            p.screenshot(path=str(SHOTS / "map_k6_legend_filter_390.png"))
            p.locator('[data-season="lente"]').click(); p.locator('[data-season="zomer"]').click()
            assert p.locator("#mapCount").inner_text() == "5 pins"
            print("K6-04 OK — seizoenslegenda filtert pins en wolken")

            star = p.locator(".mock-bird-marker .bird-pin--notable")
            assert star.count() == 1 and star.locator(".bird-pin-star").count() == 1
            p.locator("#mapFilterBtn").click()
            p.locator("#mapNotableToggle").check()
            assert p.locator("#mapCount").inner_text() == "2 van 5 pins"  # Roerdomp + Zeearend
            p.locator("#mapNotableToggle").uncheck()
            print("K6-05 OK — ★ bijzondere waarnemingen")

            p.locator("#mapPeriodSelect").select_option("year")
            assert p.locator("#mapCount").inner_text() == "4 van 5 pins"
            p.locator('[data-legend="seen"]').evaluate("e => e.click()")
            p.locator("#mapClearFilters").click()
            assert p.locator("#mapCount").inner_text() == "5 pins" and p.locator("#mapPeriodSelect").input_value() == "all"
            assert p.locator('[aria-pressed="true"][data-legend], [aria-pressed="true"][data-season]').count() == 0
            p.locator("#leafletMap").dispatch_event("pointerdown")
            print("K6-06 OK — periode en alles wissen")

            p.evaluate("() => window.__birdspotMapTest.markers.find(m => m.birdspotPlace.id === 'pl_a').events.click()")
            p.locator(".place-months").wait_for(timeout=5000)
            assert p.locator(".place-month.is-best").count() == 1
            assert p.locator(".place-months__caption").inner_text() == "Beste maanden: apr"
            p.locator(".place-months").scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS / "map_k6_best_months_390.png"))
            assert not errors, errors
            print("K6-07 OK — beste maanden; geen paginafouten")
            browser.close()
    print("Kaart K6: alle controles geslaagd")


if __name__ == "__main__":
    main()
