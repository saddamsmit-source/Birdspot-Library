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
  H4-03  kiekendieven vergelijken bevestigde vluchtkleden; incidenteel broeden houdt eigen status
  H4-04  jonge Sperwer en Havik tonen juiste borsttekening, kleedfoto en benoemde roepen
  H4-05  Buizerd vergelijkt jonge en volwassen vogels zonder volwassen Buizerd een geslacht toe te kennen
  H4-06  witte reigers vergelijken het juiste kleed, met eigen broedmaanden en veldopnamen
  H4-07  talingen vergelijken man, vrouw, juveniel en eclipskleed, met lokale roepen
  H4-08  kleine plevieren vergelijken broedkleed, winterkleed en juveniel; broedkalender volgt de eileg
  H4-09  Goudplevier en Zilverplevier vergelijken drie kleden; optionele fotografietip bij leefgebied
  H4-10  Witgat en Bosruiter vergelijken drie kleden; doortrek en incidenteel broeden blijven onderscheiden
  H4-11  Vijf steltlopers tonen acht vergelijkingen, fotografeertips en Nederlandse broedmaanden

Fotohergebruik is toegestaan onder Lijkt op. Hoofdfoto, verenkleed en vluchtsectie worden op unieke opnamen getest.

Starten (vanuit repo-root):  python tests/test_species_detail.py
"""
import http.server
import json
import re
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from test_explorer_species_cluster import LEAFLET_STUB  # offline Leaflet-stub, net als de kaarttests

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
LIFE_SRC = json.loads((ROOT / "tools" / "species" / "species_life.json").read_text(encoding="utf-8"))
KNOWLEDGE_SRC = json.loads((ROOT / "tools" / "kennisbaseline" / "knowledge.json").read_text(encoding="utf-8"))
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

            def assert_distribution_palette(label):
                figure = p.locator('#sdPanel-waar .sd-distribution')
                colors = ['rgb(243, 199, 68)', 'rgb(238, 152, 42)', 'rgb(223, 96, 38)', 'rgb(200, 61, 55)']
                read_colors = "els => els.map(el => getComputedStyle(el).fill)"
                assert figure.locator('.sd-distribution-legend svg circle').evaluate_all(read_colors) == colors
                marks = figure.locator('.sd-distribution-marks circle')
                bands = marks.evaluate_all("els => els.map(el => Number(el.dataset.band))")
                assert marks.evaluate_all(read_colors) == [colors[band] for band in bands]
                assert figure.get_by_text(f'Hoofdstatus: {label}', exact=True).is_visible()

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
            marks = distribution.locator('.sd-distribution-marks circle')
            actual = marks.evaluate_all("els => els.map(e => Number(e.dataset.band))")
            counts = p.evaluate("""async () => {
                const { DISTRIBUTION } = await import('/src/data/speciesDistribution.js');
                return DISTRIBUTION.sp118[1].map(([, count]) => count);
            }""")
            expected = [0 if n < 25 else 1 if n < 100 else 2 if n < 500 else 3 for n in counts]
            assert actual == expected and len(set(actual)) >= 2, (actual, expected)
            legend = distribution.get_by_role('table')
            assert legend.get_by_role('columnheader', name='Openbare meldingen per vak').is_visible()
            rows = legend.get_by_role('row').all_text_contents()
            assert all(value in row for value, row in zip(
                ['Openbare meldingen', '0–4', '5–24', '25–99', '100–499', '500 of meer'], rows, strict=True
            )), rows
            assert 'Ook in een leeg vak kan de soort voorkomen' in distribution.inner_text()
            symbols = legend.locator('svg circle').evaluate_all(
                "els => els.map(e => Number(e.getAttribute('r')))"
            )
            assert symbols == sorted(set(symbols))
            assert marks.evaluate_all(
                "els => els.map(e => Number(e.getAttribute('r')))"
            ) == [symbols[band] for band in actual]
            assert_distribution_palette('Standvogel')
            assert "Rietgors" in distribution.locator('.sd-distribution-map').get_attribute('aria-label')
            assert "2020–2025" in distribution.inner_text()
            assert distribution.get_by_role('link', name='eBird via GBIF').get_attribute('href') == "https://doi.org/10.15468/aomfnb"
            assert distribution.locator('.sd-distribution-map').bounding_box()["width"] <= 390
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
            assert any(c.startswith("Eclipskleed") for c in cards) and "Mannetje" in cards and "Vrouwtje" in cards, cards
            assert not any("Man en vrouw" in c for c in cards), cards
            close_detail()

            open_species("Roodborst", "sp050")
            assert p.locator('#sdPanel-herkenning .sd-badge').filter(has_text="Man en vrouw lijken op elkaar").count() == 1
            assert p.locator("#sdPanel-herkenning .sd-source, #sdPanel-herkenning .kb-src").count() == 0
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
            voice = p.locator('#sdPanel-herkenning [data-kb-voice] li')
            expected_voice = KNOWLEDGE_SRC[me["id"]]["voice"]
            assert expected_voice, "H3-02 geen brongeverifieerde zangtekst voor Merel"
            expect(voice).to_have_count(len(expected_voice))
            for i, entry in enumerate(expected_voice):
                expect(voice.nth(i)).to_contain_text(entry["text"])
                assert entry["sources"], "H3-02 bronbewijs moet wel in kennisdata blijven"
                expect(voice.nth(i).locator(".kb-src")).to_have_count(0)
            expect(p.locator('#sdPanel-herkenning .sd-voice')).to_have_count(0)
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
            assert_distribution_palette('Zomergast')
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

            def assert_photo_once(path):
                photo = p.locator(f'.signature-species-detail-sheet [data-guide-image$="{path}"] img')
                own = p.locator(f'.signature-species-detail-sheet [data-guide-image$="{path}"]:not(.sd-similar *) img')
                if own.count():
                    expect(own).to_have_count(1)
                else:
                    assert photo.count(), f"Foto ontbreekt: {path}"
                target = own.first if own.count() else photo.first
                target.scroll_into_view_if_needed()
                target.evaluate("img => img.decode()")

            def check_comparison_photo(photo, thorough=False):
                photo = photo.first
                photo.scroll_into_view_if_needed()
                image = photo.locator('img')
                image.evaluate("img => img.decode()")
                assert image.bounding_box()["height"] > 92
                frame = photo.locator('..')
                info = frame.get_by_label("Foto-informatie")
                info_box = info.bounding_box()
                marker = info.locator('span').bounding_box()
                frame_box = frame.bounding_box()
                assert info_box["width"] >= 44 and marker["width"] <= 26
                assert abs(info_box["x"] + info_box["width"] - frame_box["x"] - frame_box["width"]) < 2
                photo.click()
                zoom = p.get_by_role("dialog", name="Vogelfoto bekijken")
                plus = zoom.get_by_role("button", name="Inzoomen")
                minus = zoom.get_by_role("button", name="Uitzoomen")
                indicator = zoom.get_by_role("button", name="Zoom herstellen")
                expect(minus).to_be_disabled()
                plus.click()
                plus.click()
                expect(indicator).to_have_text("4×")
                expect(plus).to_be_disabled()
                if thorough:
                    # Draaien en pannen op schaal — gedeeld met elke andere .sd-field-photo, hier eenmalig volledig getest
                    # (verving de verwijderde "Kleden vergelijken"-accordion, die dit eerder als enige test afdekte).
                    viewed = zoom.locator('img')
                    zoom.get_by_role('button', name='Draai rechtsom').click()
                    assert 'rotate(90deg)' in viewed.get_attribute('style')
                    expect(indicator).to_have_text('4×')
                    viewport = zoom.locator('.sd-photo-viewport')
                    box = viewport.bounding_box()
                    x, y = box['x'] + box['width'] / 2, box['y'] + box['height'] / 2
                    old_scroll = viewport.evaluate('el => [el.scrollLeft, el.scrollTop]')
                    p.mouse.move(x, y)
                    p.mouse.down()
                    p.mouse.move(x - 40, y - 35, steps=5)
                    p.mouse.up()
                    assert viewport.evaluate('el => [el.scrollLeft, el.scrollTop]') != old_scroll
                    expect(indicator).to_have_text('4×')
                    zoom.get_by_role('button', name='Draai linksom').click()
                    assert 'rotate(0deg)' in viewed.get_attribute('style')
                    expect(indicator).to_have_text('4×')
                minus.click()
                expect(indicator).to_have_text("2×")
                minus.click()
                expect(indicator).to_have_text("1×")
                p.keyboard.press("Escape")
                expect(zoom).to_have_count(0)
                expect(photo).to_be_focused()

            def cmp_card(name, flight=False):
                """De ene .sd-cmp-card binnen 'Lijkt op' waarin `name` als andere soort voorkomt. Sinds FQA-03 staan kleed-
                en vluchtvergelijking van dezelfde soort als tabbladen in die ene kaart; flight=True opent het tabblad
                "In vlucht" (als er meerdere tabbladen zijn)."""
                card = p.locator('#sdPanel-herkenning section.sd-similar .sd-cmp-card').filter(
                    has=p.locator('.sd-cmp-who strong', has_text=re.compile(rf'^{re.escape(name)}$')))
                assert card.count() == 1, f"{name}: verwacht precies één vergelijkingskaart, kreeg {card.count()}"
                card.evaluate("el => { for (let d = el.closest('details'); d; d = d.parentElement.closest('details')) d.open = true; }")
                tabs = card.locator('.sd-cmp-tab')
                if tabs.count():
                    want = tabs.filter(has_text=re.compile(r'^In vlucht')) if flight else tabs.filter(has_text=re.compile(r'^(?!In vlucht)'))
                    if want.count():
                        want.first.click()
                return card

            def cmp_tab(card, label):
                card.locator('.sd-cmp-tab', has_text=re.compile(rf'^{re.escape(label)}$')).click()
                panel = card.locator('.sd-cmp-panel:visible')
                panel.wait_for(state="visible", timeout=4000)
                return panel

            def assert_photo_pair(panel, files, in_flight=False):
                pictures = panel.locator('.sd-cmp-head .sd-field-photo')
                expect(pictures).to_have_count(2)
                boxes = []
                for picture, file in zip(pictures.all(), files):
                    expect(picture).to_have_attribute("data-guide-image", re.compile(re.escape("/" + file) + "$"))
                    picture.scroll_into_view_if_needed()
                    picture.locator('img').evaluate("image => image.decode()")
                    boxes.append(picture.bounding_box())
                    expect(picture.locator('..').get_by_label("Foto-informatie")).to_have_count(1)
                left, right = boxes
                assert left["x"] + left["width"] <= right["x"], boxes
                assert abs(left["width"] - right["width"]) < 2, boxes
                assert abs(left["y"] - right["y"]) < 2, boxes
                assert left["x"] >= 0 and right["x"] + right["width"] <= p.viewport_size["width"], boxes
                assert (panel.get_attribute("data-cmp-flight") is not None) == in_flight

            open_species("Houtduif", "sp002")
            stock_dove_card = cmp_card("Holenduif", flight=True)
            stock_dove_panel = stock_dove_card.locator('.sd-cmp-panel:visible')
            assert_photo_pair(stock_dove_panel, ["sp002-flight-wingband.webp", "sp003-flight-open-sky.webp"], in_flight=True)
            check_comparison_photo(stock_dove_panel.locator('.sd-field-photo').last)
            expect(stock_dove_panel.get_by_text("Nog geen foto", exact=True)).to_have_count(0)
            expect(stock_dove_card.locator('.sd-cmp-panel:visible .sd-compare-open')).to_have_text(re.compile(r"Open Holenduif"))
            expect(p.locator('#sdPanel-herkenning section.sd-similar .sd-cmp-more > summary'))\
                .to_have_text("Nog 1 soort: Turkse Tortel")
            turtle_dove_card = cmp_card("Turkse Tortel", flight=True)
            check_comparison_photo(turtle_dove_card.locator('.sd-cmp-panel:visible .sd-field-photo'))
            close_detail()

            open_species("Fitis", "sp057")
            card = cmp_card("Tjiftjaf")
            whos = card.locator('.sd-cmp-panel:visible .sd-cmp-who')
            assert whos.locator('strong').all_text_contents() == ["Fitis", "Tjiftjaf"]
            assert card.get_by_role("link", name="Vogelbescherming").count() == 0
            expect(card.locator(".sd-cmp-foot .sd-compare-open")).to_have_count(1)
            assert_photo_pair(card.locator(".sd-cmp-panel:visible"), ["sp057.webp", "sp056.webp"])
            photo = p.get_by_role("button", name="Vergroot hoofdfoto")
            photo.scroll_into_view_if_needed()
            photo.locator('img').evaluate("img => img.decode()")
            photo.click()
            zoomed = p.locator('.signature-lightbox img')
            zoomed.evaluate("img => img.decode()")
            expect(zoomed).to_be_visible()
            initial = zoomed.bounding_box()["width"]
            p.get_by_role("button", name="Inzoomen", exact=True).click()
            p.wait_for_function("width => document.querySelector('.signature-lightbox img').getBoundingClientRect().width > width", arg=initial)
            p.get_by_role("button", name="Zoom herstellen").click()
            p.wait_for_function("width => Math.abs(document.querySelector('.signature-lightbox img').getBoundingClientRect().width - width) < 2", arg=initial)
            p.keyboard.press("Escape")
            expect(p.locator('.signature-lightbox')).to_have_count(0)
            expect(photo).to_be_focused()
            audio = p.get_by_label("Zang van Fitis")
            audio.evaluate("el => el.play()")
            p.wait_for_function("document.querySelector('.sd-audio audio').currentTime > 0.15")
            p.get_by_label("Roep van Fitis").evaluate("el => el.play()")
            assert audio.evaluate("el => el.paused")
            tab("status")
            assert p.get_by_label("Roep van Fitis").evaluate("el => el.paused")
            tab("herkenning")
            card.get_by_role("button", name="Open Tjiftjaf").click()
            assert p.get_by_role("dialog", name="Tjiftjaf", exact=True).count() == 1
            reverse_whos = cmp_card("Fitis").locator('.sd-cmp-panel:visible .sd-cmp-who')
            assert reverse_whos.locator('strong').all_text_contents() == ["Tjiftjaf", "Fitis"]
            close_detail()
            print("H4-01 OK — Fitis/Tjiftjaf: vergelijkingskaart, foto vergroten, navigatie en afspelen van zang en roep")

            open_species("Grote Bonte Specht", "sp016")
            # De nieuwere vluchtvergelijking staat vóór de vergelijkingen per kleed.
            specht_own = cmp_card("Middelste Bonte Specht").locator('.sd-cmp-panel:visible .sd-cmp-who').first
            assert specht_own.locator('small').inner_text() == "Juveniel"
            assert_photo_once("/assets/species/plumage/sp016-juv.webp")
            close_detail()
            open_species("Kokmeeuw", "sp097")
            gull_panel = cmp_card("Zwartkopmeeuw").locator('.sd-cmp-panel:visible')
            assert gull_panel.locator('.sd-cmp-who small').all_text_contents() == ["Broedkleed", "Broedkleed"]
            assert_photo_once("/assets/species/sp097.webp")
            assert_photo_once("/assets/species/sp225.webp")
            winter = p.locator('.sd-plumage').filter(has_text="Winterkleed")
            # src is sinds de subpad-fix een opgeloste absolute URL (assetUrl.js), geen
            # ruw root-relatief pad meer — vergelijk daarom op het einde van de waarde.
            assert winter.locator('img').get_attribute("src").endswith("/assets/species/plumage/sp097-winter.webp")
            close_detail()
            open_species("Wilde Eend", "sp089")
            eclipse = p.locator('.sd-plumage').filter(has_text="Eclipskleed")
            assert eclipse.locator('img').get_attribute("src").endswith("/assets/species/plumage/sp089-eclipse.webp")
            close_detail()
            print("H4-02 OK — jonge specht (vergelijkingskaart), Kokmeeuw/Zwartkopmeeuw in broedkleed, Wilde Eend in eclipskleed")

            open_species("Bruine Kiekendief", "sp173")
            harrier_card = cmp_card("Blauwe Kiekendief")
            for label, blue_path, brown_path in (
                ("Mannetje", "/assets/species/sp249.webp", "/assets/species/plumage/sp173-male-2.webp"),
                ("Vrouwtje", "/assets/species/plumage/sp249-adult_f.webp", "/assets/species/plumage/sp173-adult_f.webp"),
            ):
                panel = cmp_tab(harrier_card, f"In vlucht · {label}")
                assert panel.locator('.sd-cmp-who small').all_text_contents() == [f"{label} in vlucht"] * 2
                assert_photo_pair(panel, [brown_path.rsplit("/", 1)[-1], blue_path.rsplit("/", 1)[-1]], in_flight=True)
                assert_photo_once(blue_path)
                assert_photo_once(brown_path)
                check_comparison_photo(panel.locator('.sd-field-photo'), thorough=(label == "Mannetje"))
            # Een landende Bruine Kiekendief vormt geen paar met een vrij vliegende Blauwe.
            expect(harrier_card.locator('.sd-cmp-tab', has_text=re.compile(r'^Juveniel$'))).to_have_count(0)
            flight_section = p.locator('#sdPanel-herkenning section[aria-label="In vlucht"]')
            expect(flight_section).to_have_count(1)
            # Vluchtcontrole 10-11-2026: de juveniele foto toont een neerstrijkende vogel (landen) en staat daarom
            # niet meer in "In vlucht" maar in de Juveniel-kaart; zichtbaar gebleven, niet verwijderd.
            expect(flight_section.locator('[data-guide-image$="sp173-juv.webp"]')).to_have_count(0)
            expect(p.locator('#sdPanel-herkenning [data-plumage="juv"] [data-guide-image$="sp173-juv.webp"]')).to_have_count(1)
            rest = p.locator('[data-plumage="adult_f"] .sd-field-photo').filter(has=p.locator('img[src$="sp173-female-rest.webp"]'))
            expect(p.locator('[data-plumage="adult_f"] .sd-field-photo')).to_have_count(2)
            assert rest.locator('..').get_by_label("Foto-informatie").count() == 1
            check_comparison_photo(rest)
            assert p.get_by_label("Roep van Bruine Kiekendief").count() == 1
            close_detail()
            open_species("Steppekiekendief", "sp250")
            blue_card = cmp_card("Blauwe Kiekendief", flight=True)
            for label, steppe, blue in (
                ("Mannetje", "sp250.webp", "sp249.webp"),
                ("Vrouwtje", "sp250-adult_f.webp", "sp249-adult_f.webp"),
                ("Juveniel", "sp250-juv.webp", "sp249-juv.webp"),
            ):
                panel = cmp_tab(blue_card, f"In vlucht · {label}")
                assert panel.locator('.sd-cmp-who small').all_text_contents() == [f"{label} in vlucht"] * 2
                assert_photo_pair(panel, [steppe, blue], in_flight=True)
            grauwe_card = cmp_card("Grauwe Kiekendief", flight=True)
            grauwe_panel = cmp_tab(grauwe_card, "In vlucht · Mannetje")
            assert_photo_pair(grauwe_panel, ["sp250.webp", "sp251.webp"], in_flight=True)
            female_panel = cmp_tab(grauwe_card, "In vlucht · Vrouwtje")
            expect(female_panel.get_by_text("Nog geen passende vluchtfoto", exact=True)).to_have_count(1)
            expect(female_panel.locator('[data-guide-image$="sp251-adult_f.webp"]')).to_have_count(0)
            tab("status")
            assert p.get_by_text("Incidentele broedgevallen in Nederland.", exact=True).is_visible()
            p.get_by_text("Incidentele broedgevallen in Nederland, onder meer in 2017 en 2019", exact=True).wait_for()
            assert p.locator('#sdPanel-status .sd-month-breeding').count() == 0
            close_detail()
            print("H4-03 OK — Bruine/Blauwe Kiekendief per kleed (tabs, met foto-rotatie en -pan); Steppekiekendief zonder vaste broedmaanden")

            open_species("Slechtvalk", "sp009")
            kestrel_card = cmp_card("Torenvalk")
            young_falcons = cmp_tab(kestrel_card, "Juveniel")
            assert_photo_pair(young_falcons, ["sp009-juv.webp", "sp008-juv.webp"])
            flying_falcons = cmp_tab(kestrel_card, "In vlucht · Volwassen")
            assert_photo_pair(flying_falcons, ["sp009-male-flight.webp", "sp008-male-flight.webp"], in_flight=True)
            assert_photo_once("/assets/showcase/sp009.webp")
            close_detail()

            open_species("Sperwer", "sp006")
            hawk_card = cmp_card("Havik")
            young_hawks = cmp_tab(hawk_card, "Juveniel")
            assert_photo_pair(young_hawks, ["sp006-juv.webp", "sp007-juv.webp"])
            hawk_females = cmp_tab(hawk_card, "Vrouwtje")
            expect(hawk_females.get_by_text("Nog geen passende foto", exact=True)).to_have_count(1)
            assert_photo_once("/assets/species/plumage/sp006-juv.webp")
            flight_section = p.locator('#sdPanel-herkenning section.sd-similar')
            assert flight_section.evaluate(
                "el => Boolean(el.compareDocumentPosition(document.querySelector('.sd-plumage-list')) & Node.DOCUMENT_POSITION_PRECEDING)")
            flight_hawk_panel = cmp_card("Havik", flight=True).locator('.sd-cmp-panel:visible')
            assert flight_hawk_panel.locator('.sd-cmp-who strong').all_text_contents() == ["Sperwer", "Havik"]
            expect(flight_section.locator('.sd-cmp-more > summary')).to_have_text("Nog 1 soort: Torenvalk")
            flight_falcon_panel = cmp_card("Torenvalk", flight=True).locator('.sd-cmp-panel:visible')
            assert flight_falcon_panel.locator('.sd-cmp-who strong').all_text_contents() == ["Sperwer", "Torenvalk"]
            for sid in ("sp006", "sp007", "sp008"):
                assert_photo_once(f"/assets/species/plumage/{sid}-flight.webp")
            sparrow_in_flight = p.locator('#sdPanel-herkenning section[aria-label="In vlucht"]')
            expect(sparrow_in_flight.get_by_text("Mannetje in vlucht", exact=True)).to_have_count(1)
            assert p.get_by_label("Roep vrouwtje van Sperwer").count() == 1
            flight_hawk_panel.get_by_role("button", name="Open Havik").click()
            assert p.get_by_role("dialog", name="Havik", exact=True).count() == 1
            assert p.get_by_label("Alarmroep vrouwtje van Havik").count() == 1
            assert p.get_by_label("Bedelroep jong van Havik").count() == 1
            close_detail()
            print("H4-04 OK — jonge Sperwer/Havik (tab Juveniel, juiste borsttekening), vluchtvergelijking met Havik en Torenvalk")

            open_species("Torenvalk", "sp008")
            text_comparisons = p.locator('#sdPanel-herkenning .kb-similar')
            expect(text_comparisons.get_by_text("Boomvalk: lange spitse vleugels", exact=False)).to_be_visible()
            expect(text_comparisons.get_by_text("Smelleken: brede vleugelbasis", exact=False)).to_be_visible()
            expect(text_comparisons.locator('img')).to_have_count(0)
            text_comparisons.get_by_role("button", name="Open Boomvalk").click()
            expect(p.get_by_role("dialog", name="Boomvalk", exact=True)).to_be_visible()
            close_detail()

            open_species("Buizerd", "sp005")
            dark = p.locator('.sd-flight [data-guide-image$="sp005-flight-dark.webp"] img')
            expect(dark).to_have_count(1)
            dark.scroll_into_view_if_needed()
            dark.evaluate("img => img.decode()")
            expect(p.locator('[data-guide-image$="sp005-male-flight.webp"]')).to_have_count(0)
            regular_cards = p.locator('#sdPanel-herkenning section.sd-similar .sd-cmp-card')
            assert regular_cards.count() == 2
            rough_card = cmp_card("Ruigpootbuizerd")
            for width in (360, 390, 430):
                p.set_viewport_size({"width": width, "height": 844})
                adult_panel = cmp_tab(rough_card, "In vlucht · Volwassen")
                assert adult_panel.locator('.sd-cmp-who small').all_text_contents() == ["Volwassen in vlucht", "Vrouwtje in vlucht"]
                assert_photo_pair(adult_panel, ["sp005-adult_m.webp", "sp253.webp"], in_flight=True)
                if width == 390:
                    adult_panel.screenshot(path=str(SHOTS / "species_i_buizerd_ruigpoot_volwassen_390.png"))
                young_panel = cmp_tab(rough_card, "In vlucht · Juveniel")
                assert_photo_pair(young_panel, ["sp005-juv.webp", "sp253-juv.webp"], in_flight=True)
                if width == 390:
                    young_panel.screenshot(path=str(SHOTS / "species_i_buizerd_ruigpoot_juveniel_390.png"))
            p.set_viewport_size({"width": 390, "height": 844})
            check_comparison_photo(young_panel.locator('.sd-field-photo').last)
            assert_photo_once("/assets/species/plumage/sp005-adult_m.webp")
            assert_photo_once("/assets/species/plumage/sp005-juv.webp")
            honey_card = cmp_card("Wespendief")
            female_honey = cmp_tab(honey_card, "In vlucht · Wespendief-vrouwtje")
            assert_photo_pair(female_honey, ["sp005-adult_m.webp", "sp248-adult_f.webp"], in_flight=True)
            young_honey = cmp_tab(honey_card, "In vlucht · Juveniel")
            assert_photo_pair(young_honey, ["sp005-juv.webp", "sp248-juv.webp"], in_flight=True)
            assert p.get_by_label("Alarmroep van Buizerd").count() == 1
            young_honey.get_by_role("button", name="Open Wespendief").click()
            assert p.get_by_role("dialog", name="Wespendief", exact=True).count() == 1
            assert p.get_by_label("Vluchtroep van Wespendief").count() == 1
            close_detail()
            print("H4-05 OK — Buizerd, Ruigpootbuizerd en Wespendief, vluchtparen naast elkaar op 360/390/430 px")

            open_species("Kleine Zilverreiger", "sp082")
            heron_card = cmp_card("Grote Zilverreiger")
            breeding_panel = cmp_tab(heron_card, "Broedkleed")
            assert breeding_panel.locator('.sd-cmp-who small').all_text_contents() == ["Broedkleed", "Broedkleed"]
            for path in ("/assets/species/plumage/sp082-breeding.webp", "/assets/species/plumage/sp083-breeding.webp"):
                assert_photo_once(path)
            cattle_card = cmp_card("Koereiger")
            assert_photo_pair(cmp_tab(cattle_card, "Juveniel"), ["sp082-juv.webp", "sp245-juv.webp"])
            assert p.get_by_label("Vluchtroep van Kleine Zilverreiger").count() == 1
            p.get_by_role('tab', name='Leefwijze', exact=True).click()
            assert p.locator('.sd-month-breeding .is-breeding').count() == 2
            expect(p.get_by_text('Gebruikelijke broedperiode · mei, juni', exact=True)).to_be_visible()
            p.get_by_role('tab', name='Herkenning', exact=True).click()
            cattle_card.get_by_role("button", name="Open Koereiger").click()
            assert p.get_by_role("dialog", name="Koereiger", exact=True).count() == 1
            assert p.get_by_label("Roepen bij de kolonie van Koereiger").count() == 1
            p.get_by_role('tab', name='Leefwijze', exact=True).click()
            expect(p.get_by_text('Gebruikelijke broedperiode · april, mei, juni', exact=True)).to_be_visible()
            close_detail()
            print("H4-06 OK — witte reigers per kleed (tabs), bronfoto's, roepen en broedmaanden")

            open_species("Wintertaling", "sp091")
            teal_card = cmp_card("Zomertaling")
            assert_photo_pair(cmp_tab(teal_card, "Juveniel"), ["sp091-juv.webp", "sp188-juv.webp"])
            assert_photo_once("/assets/species/plumage/sp091-juv.webp")
            for label, plumage in [('Mannetje', 'adult_m'), ('Vrouwtje', 'adult_f'), ('Eclipskleed', 'eclipse')]:
                teal_panel = cmp_tab(teal_card, label)
                assert teal_panel.locator('.sd-cmp-who small').all_text_contents() == [label, label]
                expected_garganey = '/assets/species/sp188.webp' if plumage == 'adult_m' else f'/assets/species/plumage/sp188-{plumage}.webp'
                assert_photo_once(f'/assets/species/plumage/sp091-{plumage}.webp')
                if plumage == 'eclipse':
                    expect(teal_panel.get_by_text("Nog geen passende foto", exact=True)).to_have_count(1)
                else:
                    assert_photo_once(expected_garganey)
            assert p.get_by_label('Vluchtroep bij Rotterdam van Wintertaling').count() == 1
            p.get_by_role('tab', name='Leefwijze', exact=True).click()
            months = p.get_by_text('Gebruikelijke broedperiode · april, mei, juni, juli', exact=True)
            expect(months).to_be_visible()
            p.get_by_role('tab', name='Herkenning', exact=True).click()
            teal_panel.get_by_role('button', name='Open Zomertaling').click()
            assert p.get_by_role('dialog', name='Zomertaling', exact=True).count() == 1
            assert p.get_by_label('Ratel van het mannetje van Zomertaling').count() == 1
            p.get_by_role('tab', name='Leefwijze', exact=True).click()
            expect(months).to_be_visible()
            close_detail()
            print("H4-07 OK — talingen per kleed (4 tabs), lokale roepen en broedmaanden")

            open_species("Bontbekplevier", "sp146")
            expect(p.get_by_label("Nachtelijke vluchtroep van Bontbekplevier")).to_have_count(1)
            little_plover_card = cmp_card("Kleine Plevier")
            assert_photo_pair(cmp_tab(little_plover_card, "Juveniel"), ["sp146-juv.webp", "sp147-juv.webp"])
            assert_photo_once("/assets/species/plumage/sp146-juv.webp")
            kentish_plover_card = cmp_card("Strandplevier")
            assert_photo_pair(cmp_tab(kentish_plover_card, "Juveniel"), ["sp146-juv.webp", "sp206-juv.webp"])
            winter_panel = cmp_tab(kentish_plover_card, 'Winterkleed')
            assert winter_panel.locator('.sd-cmp-who small').all_text_contents() == ["Winterkleed", "Winterkleed"]
            for path in ("/assets/species/plumage/sp146-winter.webp", "/assets/species/plumage/sp206-winter.webp"):
                assert_photo_once(path)
            little_plover_card.locator(".sd-cmp-panel:visible").get_by_role("button", name="Open Kleine Plevier").click()
            expect(p.get_by_label("Zang en vluchtroep van Kleine Plevier")).to_have_count(1)
            breeding_panel2 = cmp_card("Strandplevier").locator('.sd-cmp-panel:visible')
            assert breeding_panel2.locator('.sd-cmp-who small').all_text_contents() == ["Broedkleed", "Mannetje"]
            breeding_panel2.get_by_role("button", name="Open Strandplevier").click()
            expect(p.get_by_label("Alarmroep van Strandplevier")).to_have_count(1)
            expect(p.locator('.sd-plumage img[src$="sp206-adult_f.webp"]')).to_have_count(1)
            tab("status")
            expect(p.get_by_text('Gebruikelijke broedperiode · mei', exact=True)).to_be_visible()
            expect(p.get_by_text('Jongen vliegvlug', exact=True)).to_be_visible()
            assert p.locator('.sd-month-breeding .is-breeding').count() == 1
            close_detail()
            print("H4-08 OK — plevieren per kleed (tabs), bronfoto's, roepen en broedmaanden")

            open_species("Goudplevier", "sp145")
            plover_card = cmp_card("Zilverplevier")
            assert_photo_pair(cmp_tab(plover_card, "Juveniel"), ["sp145-juv.webp", "sp144-juv.webp"])
            assert_photo_once("/assets/species/plumage/sp145-juv.webp")
            plover_panel = None
            for label, suffix in [("Broedkleed", ""), ("Winterkleed", "-winter")]:
                plover_panel = cmp_tab(plover_card, label)
                assert plover_panel.locator('.sd-cmp-who small').all_text_contents() == [label, label]
                for sid in ("sp145", "sp144"):
                    folder = "/assets/species/plumage" if suffix else "/assets/species"
                    assert_photo_once(f"{folder}/{sid}{suffix}.webp")
            plover_panel.get_by_role("button", name="Open Zilverplevier").click()
            expect(p.get_by_label("Nachtelijke vluchtroep van Zilverplevier")).to_have_count(1)
            tab("waar")
            expect(p.locator(".sd-photo-tip")).to_contain_text("1/2000 s")
            expect(p.get_by_role("heading", name="Leefgebied")).to_be_visible()
            tab("status")
            expect(p.locator(".sd-month-breeding .is-breeding")).to_have_count(0)
            close_detail()
            open_species("Merel", "sp045")
            tab("waar")
            expect(p.locator(".sd-photo-tip")).to_have_count(0)
            close_detail()
            print("H4-09 OK — Goudplevier/Zilverplevier in drie kleden (tabs) en fotografietip bij geselecteerde soorten")

            open_species("Witgat", "sp156")
            sandpiper_card = cmp_card("Bosruiter")
            assert_photo_pair(cmp_tab(sandpiper_card, "Juveniel"), ["sp156-juv.webp", "sp159-juv.webp"])
            assert_photo_once("/assets/species/plumage/sp156-juv.webp")
            sandpiper_panel = None
            for label, suffix in [("Broedkleed", ""), ("Winterkleed", "-winter")]:
                sandpiper_panel = cmp_tab(sandpiper_card, label)
                for sid in ("sp156", "sp159"):
                    folder = "/assets/species/plumage" if suffix else "/assets/species"
                    assert_photo_once(f"{folder}/{sid}{suffix}.webp")
            expect(p.locator(".sd-audio audio")).to_have_count(4)
            tab("status")
            expect(p.get_by_text("Jaarrond in Nederland", exact=True)).to_be_visible()
            expect(p.locator(".sd-month-breeding")).to_have_count(0)
            tab("herkenning")
            sandpiper_panel.get_by_role("button", name="Open Bosruiter").click()
            expect(p.locator(".sd-audio audio")).to_have_count(4)
            tab("status")
            expect(p.get_by_text("Incidentele broedgevallen in Nederland.", exact=True)).to_be_visible()
            expect(p.get_by_text("Doorgaans mei tot half juli in het reguliere broedgebied", exact=True)).to_be_visible()
            expect(p.locator(".sd-month-breeding")).to_have_count(0)
            tab("waar")
            expect(p.locator(".sd-photo-tip")).to_contain_text("lange wenkbrauw")
            close_detail()
            print("H4-10 OK — Witgat/Bosruiter per kleed (tabs), vier roepen per soort en afzonderlijke Nederlandse broedstatus")

            waders = [
                ("Tureluur", "sp102", 4, "Zwarte Ruiter", "april, mei, juni, juli"),
                ("Zwarte Ruiter", "sp157", 3, "Tureluur", None),
                ("Groenpootruiter", "sp158", 3, "Poelruiter", None),
                ("Poelruiter", "sp217", 2, "Groenpootruiter", None),
                ("Oeverloper", "sp155", 3, None, "mei, juni"),
            ]
            for name, sid, recording_count, partner, breeding_months in waders:
                open_species(name, sid)
                expect(p.locator(".sd-audio audio")).to_have_count(recording_count)
                assert_photo_once(f"/assets/species/{sid}.webp")
                alternate = "breeding" if sid == "sp102" else "winter"
                assert_photo_once(f"/assets/species/plumage/{sid}-{alternate}.webp")
                assert_photo_once(f"/assets/species/plumage/{sid}-juv.webp")
                if partner:
                    wader_card = cmp_card(partner)
                    partner_id = {"sp102": "sp157", "sp157": "sp102", "sp158": "sp217", "sp217": "sp158"}[sid]
                    assert_photo_pair(cmp_tab(wader_card, "Juveniel"), [f"{sid}-juv.webp", f"{partner_id}-juv.webp"])
                    for label in ("Broedkleed", "Winterkleed"):
                        wader_panel = cmp_tab(wader_card, label)
                        for picture in wader_panel.locator("img").all():
                            picture.scroll_into_view_if_needed()
                            picture.evaluate("img => img.decode()")
                else:
                    assert_photo_pair(cmp_card("Witgat").locator('.sd-cmp-panel:visible'), ["sp155-winter.webp", "sp156-winter.webp"])
                    assert_photo_pair(cmp_card("Bosruiter").locator('.sd-cmp-panel:visible'), ["sp155-juv.webp", "sp159-juv.webp"])
                tab("waar")
                expect(p.locator(".sd-photo-tip")).to_be_visible()
                tab("status")
                if breeding_months:
                    expect(p.get_by_text(f"Gebruikelijke broedperiode · {breeding_months}", exact=True)).to_be_visible()
                    expect(p.locator(".sd-month-breeding .is-breeding")).to_have_count(len(breeding_months.split(", ")))
                else:
                    expect(p.locator(".sd-month-breeding")).to_have_count(0)
                close_detail()
            print("H4-11 OK — vijf steltlopers, kleedfoto’s en opnamen, vergelijkingskaarten met tabs, twee broedlijnen")

            assert not errors, f"H2-08 paginafouten: {errors}"
            print("H2-08 OK — geen paginafouten")
            browser.close()
    print("H2–H4: alle controles geslaagd")


if __name__ == "__main__":
    main()
