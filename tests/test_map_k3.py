"""
Birdspot Library — Kaart K3: kleuren per waarneming
  K3-01  kleurafspraak: gezien blauw #2F7DE1, gehoord geel #F2C230 (ook Merlin), beide oranje #F07A26
  K3-02  ingezoomd: elke waarneming een eigen druppelpin in de juiste kleur; punt onderaan = exacte plek
  K3-03  uitgezoomd: één groepje met kleurring in de juiste verhouding (2 gezien, 1 gehoord, 1 beide = 50/25/25 %)
  K3-04  legenda met kleur én woord; geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_map_k3.py
"""
import http.server
import re
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
ROWS = [
    {"id": "c1", "speciesId": "sp118", "speciesName": "Rietgors", "observationMethod": "seen", "lat": 52.40, "lon": 5.30},
    {"id": "c2", "speciesId": "sp045", "speciesName": "Merel", "observationMethod": "seen", "lat": 52.41, "lon": 5.31},
    {"id": "c3", "speciesId": "sp046", "speciesName": "Zanglijster", "observationMethod": "heard", "lat": 52.42, "lon": 5.29},
    {"id": "c4", "speciesId": "sp050", "speciesName": "Roodborst", "observationMethod": "both", "lat": 52.39, "lon": 5.32},
]
COLORS = {"seen": "rgb(47, 125, 225)", "heard": "rgb(242, 194, 48)", "both": "rgb(240, 122, 38)"}


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
            p.evaluate("(rows) => localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({...r, date:'2026-05-01', count:1, photoIds:[]}))}))", ROWS)

            st = p.evaluate("async () => (await import('/src/features/map/visualization.js')).MAP_STATUS")
            assert st["seen"]["color"] == "#2F7DE1" and st["heard"]["color"] == "#F2C230"
            assert st["both"]["color"] == "#F07A26" and st["merlin"]["color"] == "#F2C230", st
            print("K3-01 OK — blauw / geel / oranje")

            p.locator('.nav-item[data-route="map"]').click()
            p.wait_for_function("() => window.__birdspotMapTest?.map && window.__birdspotMapTest.renderCount > 0", timeout=10000)

            p.evaluate("() => window.__birdspotMapTest.map.setZoom(16)")
            assert p.locator(".mock-bird-marker .bird-pin").count() == 4
            for status, rgb in COLORS.items():
                pins = p.locator(f".bird-pin--status-{status}")
                assert pins.count() == (2 if status == "seen" else 1), status
                assert pins.first.evaluate("e => getComputedStyle(e).color") == rgb, status
                assert pins.first.locator("svg.bird-pin-shape").count() == 1
            anchors = p.evaluate("() => window.__birdspotMapTest.markers.map(m => m.options.icon.iconAnchor)")
            assert all(a == [15, 39] for a in anchors), anchors
            p.screenshot(path=str(SHOTS / "map_k3_pins_390.png"))
            print("K3-02 OK — 4 druppelpins in de juiste kleur, punt = plek")

            p.evaluate("() => window.__birdspotMapTest.map.setZoom(8)")
            ring = p.locator(".bird-cluster-ring")
            assert ring.count() == 1 and p.locator(".bird-cluster-core strong").inner_text() == "4"
            style = ring.get_attribute("style")
            stops = re.findall(r"(#[0-9A-F]{6}) ([\d.]+)% ([\d.]+)%", style)
            share = {c: round(float(b) - float(a)) for c, a, b in stops}
            assert share == {"#2F7DE1": 50, "#F07A26": 25, "#F2C230": 25}, style
            p.screenshot(path=str(SHOTS / "map_k3_cluster_390.png"))
            print("K3-03 OK — groepje met ring 50/25/25 %")

            legend = p.locator(".map-legend").first.inner_text().split()
            assert legend == ["Gezien", "Gehoord", "Beide"], legend
            dots = p.eval_on_selector_all(".map-meta .map-legend__dot", "els => els.map(e => getComputedStyle(e).backgroundColor)")
            assert dots == [COLORS["seen"], COLORS["heard"], COLORS["both"]], dots
            assert not errors, errors
            print("K3-04 OK — legenda, geen paginafouten")
            browser.close()
    print("Kaart K3: alle controles geslaagd")


if __name__ == "__main__":
    main()
