"""
Birdspot Library — Fase I1: soortdata en status
  I1-01  geen enkel soort-ID van main verdwijnt (waarnemingen verwijzen ernaar)
  I1-02  unieke ID's en unieke wetenschappelijke namen
  I1-03  gecorrigeerde naamkoppelingen (Glanskop, Matkop, Krooneend) en Curruca
  I1-04  statusvelden per soort geldig en gelijk aan de bron docs/data/vogellijst-nederland.json
  I1-05  soortenlijst toont alleen categorieën met soorten; elke tab rendert zijn soorten
  I1-06  geen paginafouten; screenshots 390 px

Starten (vanuit repo-root):  python tests/test_species_data.py
"""
import http.server
import json
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
FIXTURE = json.loads((ROOT / "tests" / "fixtures" / "species_ids_main_a54e21e.json").read_text())["ids"]
SOURCE = json.loads((ROOT / "docs" / "data" / "vogellijst-nederland.json").read_text(encoding="utf-8"))["species"]

CATEGORY = {"Standvogel": "standvogel", "Zomergast": "zomergast", "Wintergast": "wintergast",
            "Doortrekker": "trekvogel", "Schaarse gast": "schaarsegast", "Dwaalgast": "dwaalgast",
            "Exoot": "exoot", "Ontsnapt": "ontsnapt", "Historisch": "historisch"}
FREQ = {"Algemeen": "algemeen", "Vrij algemeen": "vrij-algemeen", "Schaars": "schaars",
        "Zeldzaam": "zeldzaam", "Zeer zeldzaam": "zeer-zeldzaam"}
BREEDING = {"Ja": "ja", "Incidenteel": "incidenteel", "Verdwenen": "verdwenen", "Nee": "nee"}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def check_data(species, labels, active):
    ids = [s["id"] for s in species]
    missing = [i for i in FIXTURE if i not in ids]
    assert not missing, f"I1-01 verdwenen ID's: {missing}"
    assert len(ids) == len(set(ids)), "I1-02 dubbele ID's"
    scis = [s["nameSci"] for s in species]
    assert len(scis) == len(set(scis)), "I1-02 dubbele wetenschappelijke namen"

    by_nl = {s["nameNL"]: s for s in species}
    expected = {"Glanskop": ("Poecile palustris", "Marsh Tit"),
                "Matkop": ("Poecile montanus", "Willow Tit"),
                "Krooneend": ("Netta rufina", "Red-crested Pochard"),
                "Grasmus": ("Curruca communis", None),
                "Braamsluiper": ("Curruca curruca", None)}
    for nl, (sci, en) in expected.items():
        assert by_nl[nl]["nameSci"] == sci, f"I1-03 {nl}: {by_nl[nl]['nameSci']} != {sci}"
        if en:
            assert by_nl[nl]["nameEN"] == en, f"I1-03 {nl}: {by_nl[nl]['nameEN']} != {en}"

    src = {r["sci"]: r for r in SOURCE}
    for s in species:
        r = src.get(s["nameSci"])
        assert r, f"I1-04 {s['nameNL']} ({s['nameSci']}) ontbreekt in de bron"
        assert s["nameNL"] in (r["nl"], "Canadese Gans", "Goudhaantje"), f"I1-04 naam {s['nameNL']} vs bron {r['nl']}"
        assert s["category"] == CATEGORY[r["status"]], f"I1-04 {s['nameNL']}: {s['category']} vs {r['status']}"
        assert s["category"] in labels, f"I1-04 {s['nameNL']}: categorie zonder label"
        assert s["statusExtra"] == CATEGORY.get(r["extra"]), f"I1-04 {s['nameNL']} statusExtra"
        assert s["months"] == r["maanden"], f"I1-04 {s['nameNL']} months"
        assert s["frequency"] == FREQ.get(r["frequentie"]), f"I1-04 {s['nameNL']} frequency"
        assert s["breeding"] == BREEDING[r["broedvogel"]], f"I1-04 {s['nameNL']} breeding"
        assert s["redList"] == (r["rode_lijst"] or None), f"I1-04 {s['nameNL']} redList"
        assert s["status"].startswith(r["status"]), f"I1-04 {s['nameNL']} status-tekst"

    counts = {}
    for s in species:
        counts[s["category"]] = counts.get(s["category"], 0) + 1
    assert active == [k for k in labels if counts.get(k)], f"I1-05 actieve categorieën {active}"
    return counts


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                      reduced_motion="reduce", service_workers="block")
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(base, wait_until="domcontentloaded")
            p.locator("#screen-home").wait_for(timeout=15000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            data = p.evaluate("""async () => {
              const m = await import('/src/data/species.js');
              return { species: m.SPECIES, labels: Object.keys(m.CATEGORY_LABELS), active: m.activeCategories() };
            }""")
            counts = check_data(data["species"], data["labels"], data["active"])
            print("I1-01..04 OK —", len(data["species"]), "soorten", counts)

            p.locator('.nav-item[data-route="species"]').click()
            p.locator("#speciesFilters .filter-chip").first.wait_for(timeout=10000)
            tabs = p.eval_on_selector_all("#speciesFilters .filter-chip[data-cat]", "els => els.map(e => e.dataset.cat)")
            assert tabs == data["active"], f"I1-05 tabs {tabs} != {data['active']}"
            for cat in tabs:
                p.locator(f'#speciesFilters .filter-chip[data-cat="{cat}"]').click()
                ids = [s["id"] for s in data["species"] if s["category"] == cat]
                p.wait_for_function(
                    """(ids) => { const rows=[...document.querySelectorAll('#speciesList .species-row')];
                       return rows.length > 0 && rows.every(r => ids.includes(r.dataset.id)); }""",
                    arg=ids, timeout=8000)
                rows = p.eval_on_selector_all("#speciesList .species-row", "els => els.map(e => e.dataset.id)")
                assert rows and set(rows) <= set(ids), f"I1-05 tab {cat} toont verkeerde soorten"
                if cat in ("standvogel", "zomergast", "exoot"):
                    p.screenshot(path=str(SHOTS / f"species_i1_{cat}_390.png"))
            print("I1-05 OK — tabs:", tabs)

            assert not errors, f"I1-06 paginafouten: {errors}"
            print("I1-06 OK — geen paginafouten")
            browser.close()
    print("Fase I1: alle controles geslaagd")


if __name__ == "__main__":
    main()
