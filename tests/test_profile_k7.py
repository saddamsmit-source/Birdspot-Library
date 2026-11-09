"""
Birdspot Library — K7: profieltab met lijsten, CSV-export en snelinstellingen
  K7-01  rekenregels: telregel (mogelijk en ongecontroleerde Merlin tellen niet), soortenlijst, jaarlijsten,
         nieuwe soorten, topplekken (vaste plek op naam, anders vrije plaatsnaam)
  K7-02  profiel toont lijsttegels, nieuwe soorten van dit jaar, jaarlijsten en uitleg over onzekere waarnemingen
  K7-03  volledige soortenlijst wordt pas bij openen opgebouwd; tik op een soort opent de soortpagina
  K7-04  topplek met vaste plek opent de kaart op die plek
  K7-05  CSV-export: één download, BOM, kopregel, zes decimalen, quotes en geen formule-injectie
  K7-06  standaard kaartlaag wordt bewaard en gebruikt door de kaart
  K7-07  back-upherinnering 7 / 30 dagen / uit stuurt de melding en blijft bewaard na herladen
  K7-08  geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_profile_k7.py
"""
import csv
import datetime as dt
import http.server
import io
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
Y = dt.date.today().year
PLACES = [
    {"id": "pl_hut", "name": "Kijkhut Lauwersmeer", "lat": 53.371, "lon": 6.201, "createdAt": "x", "updatedAt": "x"},
    {"id": "pl_tuin", "name": "Achtertuin", "lat": 52.10, "lon": 5.10, "createdAt": "x", "updatedAt": "x"},
]
ROWS = [
    # Merel: vorig jaar eerst gezien → op de lijst, niet nieuw dit jaar
    {"id": "k1", "speciesId": "sp045", "speciesName": "Merel", "date": f"{Y - 1}-06-01", "placeId": "pl_tuin", "lat": 52.1, "lon": 5.1, "observationMethod": "seen"},
    {"id": "k2", "speciesId": "sp045", "speciesName": "Merel", "date": f"{Y}-02-03", "placeId": "pl_tuin", "lat": 52.1, "lon": 5.1, "observationMethod": "seen"},
    # Roerdomp en Rietgors: nieuw dit jaar
    {"id": "k3", "speciesId": "sp243", "speciesName": "Roerdomp", "date": f"{Y}-04-02", "placeId": "pl_hut", "lat": 53.371, "lon": 6.201,
     "observationMethod": "heard", "count": 2, "pinAccuracyM": 12.4, "notes": "Boemend, \"ver\" weg, riet"},
    {"id": "k4", "speciesId": "sp118", "speciesName": "Rietgors", "date": f"{Y}-04-20", "placeId": "pl_hut", "lat": 53.371, "lon": 6.201, "observationMethod": "seen",
     "notes": "=HYPERLINK(\"x\")"},
    {"id": "k5", "speciesId": "sp118", "speciesName": "Rietgors", "date": f"{Y}-05-01", "placeId": "pl_hut", "lat": 53.371, "lon": 6.201, "observationMethod": "seen"},
    # Telt niet: mogelijk en ongecontroleerde Merlin-suggestie
    {"id": "k6", "speciesId": "sp252", "speciesName": "Zeearend", "date": f"{Y}-05-11", "certainty": "possible", "locationName": "Dijk", "lat": 53.0, "lon": 6.0},
    {"id": "k7", "speciesId": "sp019", "speciesName": "Groene Specht", "date": f"{Y}-05-12", "observationMethod": "heard",
     "identificationSource": "merlin", "merlinVerification": "suggested", "locationName": "Dijk"},
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
            p.evaluate("([rows, places]) => { localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({count:1, certainty:'certain', photoIds:[], ...r}))}));"
                       "localStorage.setItem('birdspot-places', JSON.stringify({schemaVersion:1, places}));"
                       "localStorage.removeItem('birdspot-settings'); localStorage.removeItem('birdspot-map-layer'); }", [ROWS, PLACES])

            u = p.evaluate("""async (y) => { const m = await import('/src/features/profile/stats.js');
              const raw = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
              const places = JSON.parse(localStorage.getItem('birdspot-places')).places;
              const l = m.profileLists(raw, {places, now: new Date(y, 5, 1)});
              return {list: l.list.map(r => [r.speciesId, r.count]), year: l.yearSpecies, years: l.years,
                      fresh: l.newThisYear.map(r => r.speciesId), top: l.top.map(t => [t.name, t.sightings, t.species, t.placeId]),
                      skipped: l.skipped,
                      checked: m.countsForList({speciesId:'x', identificationSource:'merlin', merlinVerification:'checked'})}; }""", Y)
            assert u["list"] == [["sp118", 2], ["sp243", 1], ["sp045", 2]], u["list"]
            assert u["year"] == 3 and u["years"] == [{"year": str(Y), "species": 3}, {"year": str(Y - 1), "species": 1}], u
            assert u["fresh"] == ["sp118", "sp243"], u["fresh"]
            assert u["top"] == [["Kijkhut Lauwersmeer", 3, 2, "pl_hut"], ["Dijk", 2, 2, None], ["Achtertuin", 2, 1, "pl_tuin"]], u["top"]
            assert u["skipped"] == 2 and u["checked"] is True, u
            print("K7-01 OK — rekenregels")

            def open_profile():
                p.locator('.nav-item[data-route="profile"]').click()
                p.locator("#backupStatus").wait_for(timeout=8000)

            open_profile()
            overview = p.eval_on_selector_all("#overviewHeading + .profile-stats .profile-stat", "els => els.map(e => e.innerText.replace(/\\s+/g,' ').trim())")
            assert "3 plekken" in overview, overview  # zelfde telling als Topplekken
            tiles = p.locator(".profile-stats--lists .profile-stat").all_inner_texts()
            assert [t.split("\n")[0] for t in tiles] == ["3", "3", "2"], tiles
            assert f"jaarlijst {Y}" in tiles[1] and f"nieuw in {Y}" in tiles[2], tiles
            new_names = p.locator(".profile-subtitle:has-text('Nieuwe soorten') + .profile-list .profile-row__name").all_inner_texts()
            assert new_names == ["Rietgors", "Roerdomp"], new_names
            years = p.locator(".profile-years tbody tr").all_inner_texts()
            assert [r.split()[0] for r in years] == [str(Y), str(Y - 1)], years
            assert "2 onzekere waarnemingen tellen niet mee" in p.locator(".profile-note").inner_text()
            p.screenshot(path=str(SHOTS / "profile_k7_lists_390.png"), full_page=True)
            print("K7-02 OK — lijsten in het profiel")

            all_list = p.locator("#profileAllSpecies .profile-list")
            assert all_list.locator("li").count() == 0
            p.locator("#profileAllSpecies summary").click()
            all_list.locator("li").first.wait_for(timeout=3000)
            assert all_list.locator("li").count() == 3
            all_list.locator('[data-open-species="sp045"]').click()
            p.locator(".sd-tabs").wait_for(timeout=8000)
            assert "Merel" in p.locator(".signature-species-detail-overlay").inner_text()
            p.locator(".signature-species-detail-close").click()
            p.locator(".signature-species-detail-overlay").wait_for(state="detached", timeout=5000)
            print("K7-03 OK — soortenlijst lui opgebouwd; tik opent soort")

            open_profile()
            p.locator('.profile-list--places [data-open-place="pl_hut"]').click()
            p.locator("#mapDetailSheet.open").wait_for(timeout=10000)
            assert p.locator("#mapSheetName").inner_text() == "Kijkhut Lauwersmeer"
            p.locator("#mapSheetClose").click()
            print("K7-04 OK — topplek opent de kaart")

            open_profile()
            downloads = []
            p.on("download", lambda d: downloads.append(d))
            with p.expect_download() as dl:
                p.locator("#btnCsv").click()
            p.wait_for_timeout(500)
            assert len(downloads) == 1, len(downloads)
            raw = Path(dl.value.path()).read_bytes()
            assert raw.startswith(b"\xef\xbb\xbf"), raw[:5]
            assert dl.value.suggested_filename.startswith("birdspot-waarnemingen-") and dl.value.suggested_filename.endswith(".csv")
            rows = list(csv.reader(io.StringIO(raw[3:].decode("utf-8"))))
            assert rows[0][:5] == ["datum", "tijd", "soort", "wetenschappelijke_naam", "aantal"], rows[0]
            assert len(rows) == 1 + len(ROWS), len(rows)
            hdr = rows[0]
            by_id = {r[hdr.index("birdspot_id")]: dict(zip(hdr, r)) for r in rows[1:]}
            r3 = by_id["k3"]
            assert r3["soort"] == "Roerdomp" and r3["wetenschappelijke_naam"] == "Botaurus stellaris", r3
            assert r3["aantal"] == "2" and r3["breedtegraad"] == "53.371000" and r3["nauwkeurigheid_m"] == "12", r3
            assert r3["notities"] == 'Boemend, "ver" weg, riet' and r3["plek"] == "Kijkhut Lauwersmeer", r3
            assert by_id["k4"]["notities"].startswith("'="), by_id["k4"]
            assert by_id["k7"]["waarnemingswijze"] == "gehoord (Merlin, suggestie)" and by_id["k6"]["zekerheid"] == "mogelijk"
            assert rows[1][0] == f"{Y - 1}-06-01"  # oudste eerst
            print("K7-05 OK — CSV-export")

            assert p.locator('[data-layer="kaart"]').get_attribute("aria-checked") == "true"
            p.locator('[data-layer="luchtfoto"]').click()
            assert p.evaluate("localStorage.getItem('birdspot-map-layer')") == "luchtfoto"
            p.evaluate("() => { window.__birdspotMapTest.tiles = []; }")
            p.locator('.nav-item[data-route="map"]').click()
            p.wait_for_function("() => window.__birdspotMapTest?.map && (window.__birdspotMapTest.tiles||[]).length", timeout=10000)
            tiles_now = p.evaluate("() => window.__birdspotMapTest.tiles")
            assert "pdok" in tiles_now[-1], tiles_now  # luchtfoto bovenop; OSM blijft eronder buiten NL
            print("K7-06 OK — standaard kaartlaag")

            ten_days = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=10)).isoformat()
            p.evaluate("(d) => localStorage.setItem('birdspot-backup-status', JSON.stringify({lastBackup: d, sightingCount: %d}))" % len(ROWS), ten_days)
            open_profile()
            warn = p.locator("#backupStatus .backup-status__warn")
            assert p.locator('[data-reminder="30"]').get_attribute("aria-checked") == "true" and warn.count() == 0
            p.locator('[data-reminder="7"]').click()
            assert warn.count() == 1 and "10 dagen oud" in warn.inner_text()
            p.locator('[data-reminder="0"]').click()
            assert warn.count() == 0
            p.reload(wait_until="domcontentloaded")
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            open_profile()
            assert p.locator('[data-reminder="0"]').get_attribute("aria-checked") == "true"
            assert p.locator('[data-layer="luchtfoto"]').get_attribute("aria-checked") == "true"
            p.locator("#settingsHeading").scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS / "profile_k7_settings_390.png"))
            print("K7-07 OK — back-upherinnering")

            overflow = p.evaluate("() => document.documentElement.scrollWidth - document.documentElement.clientWidth")
            assert overflow <= 0, overflow
            assert not errors, errors
            print("K7-08 OK — geen paginafouten, geen horizontale scroll")
            browser.close()
    print("Profiel K7: alle controles geslaagd")


if __name__ == "__main__":
    main()
