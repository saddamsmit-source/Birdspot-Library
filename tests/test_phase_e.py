"""
Birdspot Library — Fase E QA Tests
Playwright tests voor de kaartfunctionaliteit:

  E-01: Kaart-scherm laadt zonder console-errors
  E-02: Navigatie naar kaart werkt via nav-item
  E-03: Leaflet map container is aanwezig (#leafletMap)
  E-04: Lege state getoond als er geen GPS-waarnemingen zijn (.map-no-gps)
  E-05: Marker aanwezig voor waarneming met GPS (CDN-afhankelijk, skip als offline)
  E-06: Cluster bij meerdere nabije markers (CDN-afhankelijk)
  E-07: Tik op marker opent detail sheet (CDN-afhankelijk)
  E-08: Detail sheet toont correcte soort (CDN-afhankelijk)
  E-09: "Volledige waarneming bekijken" knop aanwezig in sheet (CDN-afhankelijk)
  E-10: Pinsteller toont juiste aantallen GPS / totaal
  E-11: Locatie-knop aanwezig (#mapLocateBtn)
  E-12: Kaartscherm na hernavigatie nog steeds aanwezig
  E-13: Waarnemingen zonder GPS niet in pinsteller (teller toont 0)
  E-14: Geen horizontale overflow op 390px
  E-15: Screenshots 360/390/430px

Methodiek: HTTP server (http.server) op poort 8805 om CORS-problemen met
file://-protocol te omzeilen. CDN-afhankelijke Leaflet-tests worden geskipt
wanneer het CDN niet bereikbaar is in de testomgeving.
"""

import http.server
import json
import threading
import time
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

# ── Configuratie ─────────────────────────────────────────────────────────────
REPO     = Path(__file__).resolve().parent.parent
SHOTS    = REPO / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
PORT     = 8805
BASE_URL = f"http://127.0.0.1:{PORT}/"

# ── HTTP Server (zelfde patroon als test_phase_d.py) ─────────────────────────
class _Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(REPO), **kw)
    def log_message(self, *_):
        pass

def _start_server():
    srv = http.server.HTTPServer(("127.0.0.1", PORT), _Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    time.sleep(0.3)
    return srv

# ── Test-sightings fixtures ──────────────────────────────────────────────────
SIGHTING_WITH_GPS = {
    "id": "e-test-01",
    "speciesId": 1,
    "speciesName": "Fuut",
    "date": "2024-04-01",
    "lat": 52.3702,
    "lon": 4.8952,
    "locationName": "Amsterdam",
    "notes": "Testnotitie kaart",
    "count": 1,
    "media": [],
    "createdAt": "2024-04-01T10:00:00.000Z",
    "updatedAt": "2024-04-01T10:00:00.000Z",
}

SIGHTING_WITHOUT_GPS = {
    "id": "e-test-02",
    "speciesId": 2,
    "speciesName": "Blauwe Reiger",
    "date": "2024-04-02",
    "lat": None,
    "lon": None,
    "locationName": "Rotterdam",
    "notes": "",
    "count": 1,
    "media": [],
    "createdAt": "2024-04-02T10:00:00.000Z",
    "updatedAt": "2024-04-02T10:00:00.000Z",
}

SIGHTING_GPS_2 = {
    "id": "e-test-03",
    "speciesId": 3,
    "speciesName": "Aalscholver",
    "date": "2024-04-03",
    "lat": 52.3710,
    "lon": 4.8960,
    "locationName": "Amsterdam Noord",
    "notes": "",
    "count": 2,
    "media": [],
    "createdAt": "2024-04-03T10:00:00.000Z",
    "updatedAt": "2024-04-03T10:00:00.000Z",
}

# ── Helpers ──────────────────────────────────────────────────────────────────
STORAGE_KEY = "birdspot-sightings"

def _seed(page, sightings):
    """Seed localStorage met fixture-data en reload."""
    store = {"schemaVersion": 2, "sightings": sightings}
    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(400)
    page.evaluate(
        "(args) => localStorage.setItem(args.key, JSON.stringify(args.val))",
        {"key": STORAGE_KEY, "val": store},
    )
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(600)

def _go_map(page):
    """Navigeer naar de kaartweergave."""
    page.evaluate("() => document.querySelector('[data-route=\"map\"]')?.click()")
    page.wait_for_timeout(1200)

def _leaflet_loaded(page) -> bool:
    """True als Leaflet zijn JS en CSS vanuit CDN heeft geladen."""
    return page.evaluate("() => !!(window.L && window.L.map)")

def _skip_if_no_leaflet(page):
    if not _leaflet_loaded(page):
        import pytest
        pytest.skip("Leaflet CDN niet bereikbaar in testomgeving")

# ── Tests ─────────────────────────────────────────────────────────────────────

RESULTS = {}

def run_tests():
    server = _start_server()
    passed = failed = skipped = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="nl-NL",
            geolocation={"latitude": 52.37, "longitude": 4.89},
            permissions=["geolocation"],
        )

        def new_page():
            pg = ctx.new_page()
            return pg

        # ── E-01 ──────────────────────────────────────────────────────────
        def test_e01():
            pg = new_page()
            errors = []
            pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.close()
            relevant = [e for e in errors
                        if not any(x in e.lower() for x in ["leaflet", "net::err", "tunnel", "cors", "cdnjs"])]
            assert not relevant, f"Onverwachte console-errors: {relevant}"

        # ── E-02 ──────────────────────────────────────────────────────────
        def test_e02():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            el = pg.query_selector("#mapScreen")
            pg.close()
            assert el is not None, "#mapScreen niet gevonden na navigatie"

        # ── E-03 ──────────────────────────────────────────────────────────
        def test_e03():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            el = pg.query_selector("#leafletMap")
            pg.close()
            assert el is not None, "#leafletMap container ontbreekt"

        # ── E-04 ──────────────────────────────────────────────────────────
        def test_e04():
            pg = new_page()
            _seed(pg, [SIGHTING_WITHOUT_GPS])
            _go_map(pg)
            el = pg.query_selector(".map-no-gps")
            pg.close()
            assert el is not None, ".map-no-gps ontbreekt bij nul GPS-waarnemingen"

        # ── E-05 (CDN) ────────────────────────────────────────────────────
        def test_e05():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.wait_for_timeout(3000)  # geef CDN tijd
            if not _leaflet_loaded(pg):
                pg.close()
                return "SKIP: Leaflet CDN niet bereikbaar"
            found = pg.query_selector(".bird-pin, .bird-cluster")
            pg.close()
            assert found is not None, "Geen bird-pin of cluster gevonden"

        # ── E-06 (CDN) ────────────────────────────────────────────────────
        def test_e06():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS, SIGHTING_GPS_2])
            _go_map(pg)
            pg.wait_for_timeout(3000)
            if not _leaflet_loaded(pg):
                pg.close()
                return "SKIP: Leaflet CDN niet bereikbaar"
            cluster = pg.query_selector(".bird-cluster")
            pins    = pg.query_selector_all(".bird-pin")
            pg.close()
            assert cluster is not None or len(pins) == 2, \
                "Geen cluster of 2 pins voor 2 nabije waarnemingen"

        # ── E-07 (CDN) ────────────────────────────────────────────────────
        def test_e07():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.wait_for_timeout(3000)
            if not _leaflet_loaded(pg):
                pg.close()
                return "SKIP: Leaflet CDN niet bereikbaar"
            pg.evaluate("() => document.querySelector('.bird-pin')?.click()")
            pg.wait_for_timeout(500)
            sheet = pg.query_selector("#mapDetailSheet.open")
            pg.close()
            assert sheet is not None, "Detail sheet niet open na klik op marker"

        # ── E-08 (CDN) ────────────────────────────────────────────────────
        def test_e08():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.wait_for_timeout(3000)
            if not _leaflet_loaded(pg):
                pg.close()
                return "SKIP: Leaflet CDN niet bereikbaar"
            pg.evaluate("() => document.querySelector('.bird-pin')?.click()")
            pg.wait_for_timeout(500)
            name_el = pg.query_selector("#mapSheetName")
            text    = (name_el.text_content() or "") if name_el else ""
            pg.close()
            assert name_el is not None, "#mapSheetName ontbreekt"
            assert "Fuut" in text, f"Soort onjuist in sheet: '{text}'"

        # ── E-09 (CDN) ────────────────────────────────────────────────────
        def test_e09():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.wait_for_timeout(3000)
            if not _leaflet_loaded(pg):
                pg.close()
                return "SKIP: Leaflet CDN niet bereikbaar"
            pg.evaluate("() => document.querySelector('.bird-pin')?.click()")
            pg.wait_for_timeout(500)
            btn = pg.query_selector(".map-sheet-detail-btn")
            pg.close()
            assert btn is not None, ".map-sheet-detail-btn ontbreekt"

        # ── E-10 ──────────────────────────────────────────────────────────
        def test_e10():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS, SIGHTING_WITHOUT_GPS])
            _go_map(pg)
            el   = pg.query_selector("#mapCount")
            text = (el.text_content() or "") if el else ""
            pg.close()
            assert el is not None, "#mapCount ontbreekt"
            assert "1" in text, f"Verwacht '1' in pinsteller: '{text}'"
            assert "2" in text, f"Verwacht '2' (totaal) in pinsteller: '{text}'"

        # ── E-11 ──────────────────────────────────────────────────────────
        def test_e11():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            el = pg.query_selector("#mapLocateBtn")
            pg.close()
            assert el is not None, "#mapLocateBtn ontbreekt op kaartscherm"

        # ── E-12 ──────────────────────────────────────────────────────────
        def test_e12():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            pg.evaluate("() => document.querySelector('[data-route=\"home\"]')?.click()")
            pg.wait_for_timeout(400)
            _go_map(pg)
            el = pg.query_selector("#mapScreen")
            pg.close()
            assert el is not None, "#mapScreen ontbreekt na her-navigatie"

        # ── E-13 ──────────────────────────────────────────────────────────
        def test_e13():
            pg = new_page()
            _seed(pg, [SIGHTING_WITHOUT_GPS])
            _go_map(pg)
            el   = pg.query_selector("#mapCount")
            text = (el.text_content() or "") if el else ""
            pg.close()
            assert el is not None, "#mapCount ontbreekt"
            assert "0" in text, f"Verwacht '0' bij nul GPS-waarnemingen: '{text}'"

        # ── E-14 ──────────────────────────────────────────────────────────
        def test_e14():
            pg = new_page()
            _seed(pg, [SIGHTING_WITH_GPS])
            _go_map(pg)
            overflow = pg.evaluate("""() => {
                const el = document.querySelector('.map-screen') ||
                           document.getElementById('main-view');
                return el ? el.scrollWidth > el.clientWidth + 2 : false;
            }""")
            pg.close()
            assert not overflow, "Horizontale overflow op kaartscherm (390px)"

        # ── E-15 Screenshots ──────────────────────────────────────────────
        def test_e15():
            for w in [360, 390, 430]:
                pg = ctx.new_page()
                pg.set_viewport_size({"width": w, "height": 844})
                _seed(pg, [SIGHTING_WITH_GPS, SIGHTING_WITHOUT_GPS])
                _go_map(pg)
                pg.wait_for_timeout(500)
                path = SHOTS / f"phase_e_map_{w}px.png"
                pg.screenshot(path=str(path), full_page=False)
                pg.close()
                assert path.exists(), f"Screenshot ontbreekt: {path}"

        # ── Runner ────────────────────────────────────────────────────────
        tests = [
            ("E-01", "Kaart laadt zonder errors",               test_e01),
            ("E-02", "Navigatie naar #mapScreen",               test_e02),
            ("E-03", "#leafletMap container aanwezig",          test_e03),
            ("E-04", "Lege state bij geen GPS (.map-no-gps)",   test_e04),
            ("E-05", "Marker aanwezig met GPS [CDN]",           test_e05),
            ("E-06", "Cluster bij 2 nabije markers [CDN]",      test_e06),
            ("E-07", "Tik marker → sheet open [CDN]",           test_e07),
            ("E-08", "Sheet toont soort 'Fuut' [CDN]",          test_e08),
            ("E-09", "Detail-knop aanwezig in sheet [CDN]",     test_e09),
            ("E-10", "Pinsteller: 1 van 2 pins",                test_e10),
            ("E-11", "#mapLocateBtn aanwezig",                  test_e11),
            ("E-12", "Kaartscherm na her-navigatie",            test_e12),
            ("E-13", "Pinsteller: 0 bij geen GPS",              test_e13),
            ("E-14", "Geen overflow 390px",                     test_e14),
            ("E-15", "Screenshots 360/390/430px",               test_e15),
        ]

        for code, label, fn in tests:
            try:
                result = fn()
                if isinstance(result, str) and result.startswith("SKIP"):
                    print(f"  SKIP  {code} — {label}  ({result[5:]})")
                    skipped += 1
                    RESULTS[code] = "SKIP"
                else:
                    print(f"  PASS  {code} — {label}")
                    passed += 1
                    RESULTS[code] = "PASS"
            except AssertionError as e:
                print(f"  FAIL  {code} — {label}")
                print(f"        {e}")
                failed += 1
                RESULTS[code] = f"FAIL: {e}"
            except Exception as e:
                print(f"  FAIL  {code} — {label}")
                print(f"        {type(e).__name__}: {e}")
                failed += 1
                RESULTS[code] = f"FAIL: {e}"

        ctx.close()
        browser.close()

    server.shutdown()
    return passed, failed, skipped


if __name__ == "__main__":
    print("\nBirdspot Library — Fase E kaartfunctionaliteit\n")
    p, f, s = run_tests()
    total = p + f + s
    print(f"\n{'='*55}")
    print(f"  Resultaat: {p} PASS · {f} FAIL · {s} SKIP  (totaal {total})")
    print(f"{'='*55}\n")
    sys.exit(0 if f == 0 else 1)
