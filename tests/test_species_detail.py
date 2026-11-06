"""
Birdspot Library — H2–H4: soortdetail met tabbladen
  H2-01  data: verenkleed heeft één schema; elk seizoenskleed uit tools/species/seasonal_plumage.json staat in de app
  H2-02  detail opent met 4 tabs; Herkenning zichtbaar, rest verborgen; wisselen werkt (aria-selected + hidden)
  H2-03  Herkenning: maten-tegels, broed- en winterkleed (Kokmeeuw), eclipskleed (Wilde Eend),
         alleen bronvermelde overeenkomsten tussen man en vrouw
  H2-04  Seizoen: maandbalk gelijk aan de maanden van de soort; Rode Lijst-tegel alleen als de soort erop staat
  H2-05  Waar: lokale soortkaart en leefgebieden apart van eigen plekken; 'Toon op de kaart' filtert op de soort
  H2-06  Waarnemingen: aantal, plekken, eerste en laatste datum kloppen met de opgeslagen waarnemingen
  H2-07  compacte dwaalgast: melding 'beschrijving volgt', geen verenkleed
  H2-08  geen paginafouten; screenshots 390 px per tab
  H3-01  data: elke uitgewerkte inheemse soort (stand-, zomer-, winter-, trekvogel, schaarse gast) heeft leefwijze;
         broedblok precies bij soorten die in NL (soms) broeden; JS gelijk aan tools/species/species_life.json
  H3-02  tab heet 'Leefwijze'; broedtegels, nest, voedsel/gedrag/trek en zang en roep staan gelijk aan de bron (Merel)
  H3-03  soort zonder leefwijze (exoot/ontsnapt) toont 'volgen nog'; niet-broedende wintergast (Rotgans) toont
         voedsel/gedrag/trek en zang maar geen broedblok
  H3-04  kalender neemt ook de broedtekst over (Pimpelmees); lijn onder de juiste maanden in beide thema's
  H4-01  soortvergelijking en lokale opnamen, inclusief openen foto en wisselen naar verwante soort
  H4-02  vergelijking toont het juiste kleed en Verenkleed heeft lokale winter-, broed- en ruifoto's

Starten (vanuit repo-root):  python tests/test_species_detail.py
"""
import http.server
import json
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB  # offline Leaflet-stub, net als de kaarttests

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
LIFE_SRC = json.loads((ROOT / "tools" / "species" / "species_life.json").read_text(encoding="utf-8"))
SEASONAL = json.loads((ROOT / "tools" / "species" / "seasonal_plumage.json").read_text(encoding="utf-8"))
MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
SIGHTINGS = [
    {"id": "a1", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-04-12", "locationName": "Oostvaardersplassen", "lat": 52.45, "lon": 5.35},
    {"id": "a2", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-05-02", "locationName": "Oostvaardersplassen", "lat": 52.45, "lon": 5.35},
    {"id": "a3", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2025-10-20", "locationName": "Lauwersmeer", "lat": 53.37, "lon": 6.2},
]


def month_count(m):
    if not m or m == '-':
        return 0
    out = set()
    for part in m.split(','):
        a, _, b = part.partition('-')
        i, j = MONTHS.index(a), MONTHS.index(b or a)
        k = i
        while True:
            out.add(k)
            if k == j:
                break
            k = (k + 1) % 12
    return len(out)


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
            p.locator("#screen-home").wait_for(timeout=15000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            p.evaluate("(rows) => localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                       "sightings: rows.map(r => ({...r, count:1, photoIds:[]}))}))", SIGHTINGS)

            species = p.evaluate("async () => (await import('/src/data/species.js')).SPECIES")
            by_sci = {s["nameSci"]: s for s in species}
            keys = {"adult_m", "adult_f", "juv", "jaarling", "breeding", "winter", "eclipse"}
            for s in species:
                if s.get("compact"):
                    assert s["plumage"] is None, s["nameNL"]
                    continue
                assert set(s["plumage"]) == keys, f"H2-01 schema {s['nameNL']}: {sorted(s['plumage'])}"
                assert all(v is None or isinstance(v, str) for v in s["plumage"].values()), s["nameNL"]
            for sci, entry in SEASONAL.items():
                if sci.startswith("_"):
                    continue
                for k, v in entry.items():
                    assert by_sci[sci]["plumage"][k] == v, f"H2-01 {sci} {k}"
            n_b = sum(1 for s in species if s.get("plumage") and s["plumage"]["breeding"])
            print(f"H2-01 OK — verenkleedschema; {n_b} soorten met broedkleed")

            def open_species(name, sid):
                p.locator('.nav-item[data-route="species"]').click()
                p.locator('#speciesFiltersToggle').click()
                p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
                p.locator('#speciesSearch').fill(name)
                p.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
                p.locator('.sd-tabs').wait_for(timeout=8000)

            def close_detail():
                p.locator('.signature-species-detail-close').click()
                p.locator('.signature-species-detail-overlay').wait_for(state="detached", timeout=5000)

            def tab(key):
                p.locator(f'[data-sd-tab="{key}"]').click()
                p.locator(f'#sdPanel-{key}').wait_for(state="visible", timeout=4000)

            def assert_distribution_palette(kind, label):
                figure = p.locator('#sdPanel-waar .sd-distribution')
                assert figure.get_attribute('data-month-kind') == kind
                swatch = p.locator(f'.sd-month-legend [data-month-kind="{kind}"] span')
                expected = swatch.evaluate('el => getComputedStyle(el).backgroundColor')
                assert figure.locator('.sd-distribution-cloud').evaluate('el => getComputedStyle(el).fill') == expected
                key = figure.locator('.sd-distribution-key')
                assert label in key.inner_text()
                assert key.locator('span').evaluate('el => getComputedStyle(el).backgroundColor') == expected

            # Rietgors: eigen waarnemingen
            rg = next(s for s in species if s["id"] == "sp118")
            open_species("Rietgors", "sp118")
            tabs = p.eval_on_selector_all('[data-sd-tab]', 'els => els.map(e => e.dataset.sdTab)')
            assert tabs == ["herkenning", "status", "waar", "mijn"], tabs
            hidden = p.eval_on_selector_all('.sd-panel', 'els => els.map(e => e.hidden)')
            assert hidden == [False, True, True, True], hidden
            tab("status")
            assert p.locator('[data-sd-tab="status"]').get_attribute("aria-selected") == "true"
            assert p.locator('#sdPanel-herkenning').is_hidden()
            print("H2-02 OK — tabs en wisselen")

            assert p.locator('#sdPanel-status .sd-month.is-on').count() == month_count(rg["months"])
            p.locator('#sdPanel-status .sd-month-breeding .is-breeding').first.wait_for(timeout=5000)
            assert p.locator('#sdPanel-status .sd-month-breeding .is-breeding').count() == 4
            assert p.locator('#sdPanel-status .sd-months').get_attribute('data-month-kind') == 'standvogel'
            assert p.locator('#sdPanel-status .sd-month.is-now').count() == 0
            assert "Broedperiode" in p.locator('#sdPanel-status .sd-month-legend').inner_text()
            assert p.locator('#sdPanel-status .sd-tile').filter(has_text="Rode Lijst").count() == (1 if rg["redList"] else 0)
            p.screenshot(path=str(SHOTS / "species_h2_seizoen_390.png"))

            tab("waar")
            p.locator('#sdShowOnMap').wait_for(timeout=8000)
            places = p.eval_on_selector_all('#sdPanel-waar .sd-places li', 'els => els.map(e => e.innerText.replace(/\\s+/g," ").trim())')
            assert places == ["Oostvaardersplassen 2×", "Lauwersmeer 1×"], places
            assert p.locator('#sdPanel-waar .sd-habitat').count() == len(rg["regions"])
            distribution = p.locator('#sdPanel-waar .sd-distribution')
            assert distribution.locator('.sd-distribution-cloud rect').count() >= 3
            assert_distribution_palette('standvogel', 'Standvogel')
            assert "Rietgors" in distribution.locator('svg').get_attribute('aria-label')
            assert "2020–2025" in distribution.inner_text()
            assert distribution.get_by_role('link', name='eBird via GBIF').get_attribute('href') == "https://doi.org/10.15468/aomfnb"
            assert distribution.locator('svg').bounding_box()["width"] <= 390
            p.screenshot(path=str(SHOTS / "species_h2_waar_390.png"))

            tab("mijn")
            tiles = p.eval_on_selector_all('#sdMineStats .sd-tile', 'els => els.map(e => e.innerText.replace(/\\s+/g," ").trim())')
            assert tiles[0].endswith("3") and tiles[1].endswith("2"), tiles
            assert any("20 okt 2025" in t for t in tiles) and any("2 mei 2026" in t for t in tiles), tiles
            assert any("Wijze onbekend" in t and t.endswith("3") for t in tiles), tiles
            print("H2-06 OK — eigen waarnemingen:", tiles)
            p.screenshot(path=str(SHOTS / "species_h2_waarnemingen_390.png"))

            tab("waar")
            p.locator('#sdShowOnMap').click()
            p.locator('#mapSpeciesSearch').wait_for(timeout=10000)
            assert p.locator('#mapSpeciesSearch').input_value() == "Rietgors"
            print("H2-05 OK — plekken en 'Toon op de kaart'")

            # Kokmeeuw: broed- en winterkleed. Een leeg vrouwtjesveld bewijst geen gelijkheid.
            ko = next(s for s in species if s["nameNL"] == "Kokmeeuw")
            open_species("Kokmeeuw", ko["id"])
            cards = p.eval_on_selector_all('#sdPanel-herkenning .sd-plumage strong', 'els => els.map(e => e.innerText)')
            assert any(c.startswith("Broedkleed") for c in cards) and any(c.startswith("Winterkleed") for c in cards), cards
            assert not any("Man en vrouw" in c for c in cards), cards
            assert p.locator('#sdPanel-herkenning .sd-tile').count() == 3
            p.screenshot(path=str(SHOTS / "species_h2_herkenning_390.png"))
            tab("status")
            assert p.locator('#sdPanel-status .sd-tile').filter(has_text="Rode Lijst").count() == (1 if ko["redList"] else 0)
            close_detail()

            # Wilde Eend: eclipskleed; man en vrouw verschillend
            we = next(s for s in species if s["nameNL"] == "Wilde Eend")
            open_species("Wilde Eend", we["id"])
            cards = p.eval_on_selector_all('#sdPanel-herkenning .sd-plumage strong', 'els => els.map(e => e.innerText)')
            assert any(c.startswith("Eclipskleed") for c in cards) and "Man" in cards and "Vrouw" in cards, cards
            assert not any("Man en vrouw" in c for c in cards), cards
            close_detail()

            open_species("Roodborst", "sp050")
            assert p.locator('#sdPanel-herkenning .sd-badge').filter(has_text="Man en vrouw lijken op elkaar").count() == 1
            assert p.locator('#sdPanel-herkenning .sd-source a').get_attribute("href").endswith("/roodborst")
            assert p.locator('#sdPanel-herkenning .sd-tile').count() == 1
            close_detail()

            # Grutto: Rode Lijst-tegel
            gr = next(s for s in species if s["nameNL"] == "Grutto")
            assert gr["redList"], "testdata: Grutto staat op de Rode Lijst"
            open_species("Grutto", gr["id"])
            tab("status")
            assert p.locator('#sdPanel-status .sd-tile').filter(has_text="Rode Lijst").count() == 1
            close_detail()
            print("H2-03/04 OK — verenkleed per seizoen, maandbalk, Rode Lijst")

            # Compacte dwaalgast
            dg = next(s for s in species if s.get("compact") and s["category"] == "dwaalgast")
            open_species(dg["nameNL"], dg["id"])
            assert p.locator('#sdPanel-herkenning .sd-note').count() == 1
            assert p.locator('#sdPanel-herkenning .sd-plumage').count() == 0
            tab("waar")
            assert p.locator('#sdPanel-waar .sd-distribution-map').count() == 0
            assert p.get_by_text("Voor deze soort is geen onderbouwde verspreidingskaart beschikbaar.").is_visible()
            close_detail()
            print("H2-07 OK — compacte dwaalgast:", dg["nameNL"])

            # H3 — leefwijze
            life = p.evaluate("async () => (await import('/src/data/speciesLife.js')).LIFE")
            native = ("standvogel", "zomergast", "wintergast", "trekvogel", "schaarsegast")
            targets = [s for s in species if s["category"] in native and not s.get("compact")]
            missing = [s["id"] for s in targets if s["id"] not in life]
            assert not missing, f"H3-01 zonder leefwijze: {missing}"
            for s in targets:
                sid, e, src = s["id"], life[s["id"]], LIFE_SRC[s["id"]]
                for k in ("diet", "behaviour", "migration", "voice"):
                    assert e[k] and e[k] == src[k], f"H3-01 {sid} {k}"
                b = e["breeding"]
                if s["breeding"] in ("ja", "incidenteel"):
                    assert b and all(b[k] and b[k] == src[k] for k in ("period", "nest", "eggs", "incubation", "fledging", "broods")), f"H3-01 {sid} broeden"
                    start, _, end = src["period"].partition("–")
                    expected_months = src.get("months")
                    if not expected_months and start in MONTHS and end in MONTHS:
                        expected_months = f"{start}-{end}"
                    assert b.get("months") == expected_months, f"H3-04 {sid} kalenderbereik"
                else:
                    assert b is None, f"H3-01 {sid} broedblok bij niet-broedvogel"
            assert set(life) == {s["id"] for s in targets}, "H3-01 leefwijze voor onbekende soort"
            print(f"H3-01 OK — leefwijze voor {len(targets)} inheemse soorten")

            me = next(s for s in species if s["nameNL"] == "Merel")
            ml = life[me["id"]]
            open_species("Merel", me["id"])
            assert p.locator('[data-sd-tab="status"]').inner_text().strip() == "Leefwijze"
            p.locator('#sdPanel-herkenning .sd-voice').wait_for(timeout=5000)
            assert p.locator('#sdPanel-herkenning .sd-voice p').inner_text() == ml["voice"]
            tab("status")
            vals = p.eval_on_selector_all('#sdPanel-status .sd-breed .sd-tile__value', 'els => els.map(e => e.innerText)')
            b = ml["breeding"]
            assert vals == [b["period"], b["eggs"], b["incubation"], b["fledging"], b["broods"]], vals
            facts = p.eval_on_selector_all('#sdPanel-status .sd-fact p', 'els => els.map(e => e.innerText)')
            assert facts == [ml["diet"], ml["behaviour"], ml["migration"]], facts
            assert p.locator('#sdPanel-status .sd-note').count() == 0
            p.screenshot(path=str(SHOTS / "species_h3_leefwijze_390.png"), full_page=False)
            p.locator('#sdPanel-status .sd-facts').scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS / "species_h3_leefwijze_feiten_390.png"))
            close_detail()
            print("H3-02 OK — Leefwijze-tab en zang en roep (Merel)")

            # Summer presence and a sourced breeding period remain separate.
            open_species("Boerenzwaluw", "sp114")
            tab("status")
            strip = p.locator('#sdPanel-status .sd-month-breeding')
            strip.wait_for(timeout=5000)
            bar = p.locator('#sdPanel-status .sd-months')
            assert bar.get_attribute('data-month-kind') == 'zomergast'
            assert bar.locator('.sd-month.is-on').count() == 8
            assert strip.locator('span').count() == 12
            assert strip.locator('span').evaluate_all(
                "els => els.map((el, i) => el.classList.contains('is-breeding') ? i : -1).filter(i => i >= 0)"
            ) == [4, 5, 6, 7]
            first = strip.locator('span').nth(4).bounding_box()
            may = bar.locator('span').nth(4).bounding_box()
            assert abs(first["x"] - may["x"]) < 1
            assert 0 < first["y"] - (may["y"] + may["height"]) <= 6
            assert bar.locator('.sd-month[title="november"]').get_attribute('class') == 'sd-month'
            tab("waar")
            assert_distribution_palette('zomergast', 'Zomergast')
            close_detail()

            # The Pimpelmees used to have breeding text but no line in its year-round calendar.
            open_species("Pimpelmees", "sp030")
            tab("status")
            strip = p.locator('#sdPanel-status .sd-month-breeding')
            bar = p.locator('#sdPanel-status .sd-months')
            strip.wait_for(timeout=5000)
            assert bar.locator('.is-on').count() == 12
            assert strip.locator('span').evaluate_all(
                "els => els.flatMap((el, i) => el.classList.contains('is-breeding') ? [i] : [])"
            ) == [2, 3, 4, 5, 6]
            assert "maart, april, mei, juni, juli" in bar.get_attribute('aria-label')
            first = strip.locator('.is-breeding').first
            last = strip.locator('.is-breeding').last
            march, july = [bar.locator('span').nth(i).bounding_box() for i in (2, 6)]
            start, end = first.bounding_box(), last.bounding_box()
            assert abs(start["x"] - march["x"]) < 1
            assert abs(end["x"] + end["width"] - july["x"] - july["width"]) < 1
            assert start["y"] - (march["y"] + march["height"]) == 2
            legend_line = p.locator('#sdPanel-status .sd-month-legend [data-month-kind="broed"] span')
            for theme, red in (("light", "rgb(201, 37, 45)"), ("dark", "rgb(255, 85, 72)")):
                p.evaluate("(theme) => document.documentElement.dataset.theme = theme", theme)
                expect(first).to_have_css("background-color", red)
                expect(legend_line).to_have_css("background-color", red)
            p.evaluate("delete document.documentElement.dataset.theme")
            close_detail()
            print("H3-04 OK — Pimpelmees maart–juli, rode lijn en legenda in beide thema's")

            ex = next(s for s in species if s["category"] in ("exoot", "ontsnapt") and s["id"] not in life and not s.get("compact"))
            open_species(ex["nameNL"], ex["id"])
            tab("status")
            assert p.locator('#sdPanel-status .sd-note').count() == 1
            assert p.locator('#sdPanel-status .sd-breed').count() == 0
            assert p.locator('#sdPanel-herkenning .sd-voice').count() == 0
            close_detail()
            rg = next(s for s in species if s["nameNL"] == "Rotgans")
            assert rg["breeding"] == "nee", "testdata: Rotgans broedt niet in NL"
            open_species("Rotgans", rg["id"])
            p.locator('#sdPanel-herkenning .sd-voice').wait_for(timeout=5000)
            tab("status")
            assert p.locator('#sdPanel-status .sd-breed').count() == 0
            assert p.locator('#sdPanel-status .sd-fact').count() == 3
            assert p.locator('#sdPanel-status .sd-months').get_attribute('data-month-kind') == 'wintergast'
            assert p.locator('#sdPanel-status .sd-month-breeding').count() == 0
            assert p.locator('#sdPanel-status .sd-note').count() == 0
            p.locator('#sdPanel-status .sd-facts').scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS / "species_h3_rotgans_390.png"))
            close_detail()
            print("H3-03 OK — zonder leefwijze:", ex["nameNL"], "· niet-broedvogel Rotgans zonder broedblok")

            open_species("Fitis", "sp057")
            cards = p.locator('#sdPanel-herkenning .sd-compare-card')
            assert cards.locator('strong').all_text_contents() == ["Fitis", "Tjiftjaf"]
            assert cards.get_by_role("link", name="Vogelbescherming").count() == 2
            photo = cards.first.get_by_role("button", name="Vergroot foto:", exact=False)
            photo.scroll_into_view_if_needed()
            photo.locator('img').evaluate("img => img.decode()")
            photo.click()
            p.locator('.signature-lightbox img').evaluate("img => img.decode()")
            p.keyboard.press("Escape")
            assert p.locator('.signature-lightbox').count() == 0
            assert photo.evaluate("el => document.activeElement === el")
            audio = p.get_by_label("Zang van Fitis")
            audio.evaluate("el => el.play()")
            p.wait_for_function("document.querySelector('.sd-audio audio').currentTime > 0.15")
            p.get_by_label("Roep van Fitis").evaluate("el => el.play()")
            assert audio.evaluate("el => el.paused")
            tab("status")
            assert p.get_by_label("Roep van Fitis").evaluate("el => el.paused")
            tab("herkenning")
            cards.last.get_by_role("button", name="Open soortkaart Tjiftjaf").click()
            assert p.get_by_role("dialog", name="Tjiftjaf", exact=True).count() == 1
            assert cards.locator('strong').all_text_contents() == ["Tjiftjaf", "Fitis"]
            close_detail()
            print("H4-01 OK — Fitis/Tjiftjaf, foto vergroten, navigatie en afspelen van zang en roep")

            open_species("Grote Bonte Specht", "sp016")
            juvenile = p.locator('#sdPanel-herkenning .sd-compare-card').first
            assert "Juveniel" in juvenile.inner_text()
            assert juvenile.locator('img').get_attribute("src") == "/assets/species/plumage/sp016-juv.webp"
            close_detail()
            open_species("Kokmeeuw", "sp097")
            pair = p.locator('#sdPanel-herkenning .sd-compare-card')
            assert pair.locator('strong').all_text_contents() == ["Kokmeeuw", "Zwartkopmeeuw"]
            for card in pair.all():
                assert card.locator('.sd-badge').inner_text() == "Broedkleed"
                card.locator('img').scroll_into_view_if_needed()
                card.locator('img').evaluate("img => img.decode()")
            winter = p.locator('.sd-plumage').filter(has_text="Winterkleed")
            assert winter.locator('img').get_attribute("src") == "/assets/species/plumage/sp097-winter.webp"
            close_detail()
            open_species("Wilde Eend", "sp089")
            eclipse = p.locator('.sd-plumage').filter(has_text="Eclipskleed")
            assert eclipse.locator('img').get_attribute("src") == "/assets/species/plumage/sp089-eclipse.webp"
            close_detail()
            print("H4-02 OK — jonge specht, twee meeuwen in broedkleed en de Wilde Eend in eclipskleed")

            assert not errors, f"H2-08 paginafouten: {errors}"
            print("H2-08 OK — geen paginafouten")
            browser.close()
    print("H2–H4: alle controles geslaagd")


if __name__ == "__main__":
    main()
