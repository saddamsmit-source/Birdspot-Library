"""
Birdspot Library — Fase I6: tab 'Alle' en seizoensfilter
  I6-01  maanden-parser: bereiken, meerdere delen, over de jaarwisseling, onregelmatig
  I6-02  seizoenkeuze: max. twee aangrenzende seizoenen (ook herfst + winter)
  I6-03  overgangsperiodes: winter–lente = feb+mrt, herfst–winter = nov+dec
  I6-04  UI: tab 'Alle' + seizoen(en) tonen precies de soorten die in die periode voorkomen
         (onafhankelijk nagerekend in Python), teller en uitleg kloppen
  I6-06  optie 'Zonder jaarrondvogels' (>= 10 maanden) verbergt die soorten en is weer uit te zetten
  I6-05  geen paginafouten; screenshot 390 px

Starten (vanuit repo-root):  python tests/test_season_filter.py
"""
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']
SEASON = {'winter': [11, 0, 1], 'lente': [2, 3, 4], 'zomer': [5, 6, 7], 'herfst': [8, 9, 10]}


def months_of(s):
    out = set()
    if not s or s == '-':
        return out
    for part in s.split(','):
        a, _, b = part.strip().partition('-')
        i, j = MONTHS.index(a), MONTHS.index(b or a)
        m = i
        while True:
            out.add(m)
            if m == j:
                break
            m = (m + 1) % 12
    return out


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
            ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                      reduced_motion="reduce", service_workers="block")
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(f"http://127.0.0.1:{server.server_address[1]}/", wait_until="domcontentloaded")
            p.locator("#screen-home").wait_for(timeout=15000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            r = p.evaluate("""async () => {
              const s = await import('/src/data/seasons.js');
              const set = x => [...s.monthSet(x)].sort((a,b)=>a-b);
              return {
                wrap: set('okt-mrt'), multi: set('apr-mei,aug-sep'), one: set('mei'), none: set('-'),
                t1: s.toggleSeason([], 'winter'), t2: s.toggleSeason(['winter'], 'lente'),
                t3: s.toggleSeason(['winter'], 'zomer'), t4: s.toggleSeason(['herfst'], 'winter'),
                t5: s.toggleSeason(['winter','lente'], 'zomer'), t6: s.toggleSeason(['winter','lente'], 'lente'),
                p1: s.seasonPeriod(['winter','lente']), p2: s.seasonPeriod(['winter','herfst']),
                p3: s.seasonPeriod(['zomer']),
              };
            }""")
            assert r["wrap"] == [0, 1, 2, 9, 10, 11], r["wrap"]
            assert r["multi"] == [3, 4, 7, 8] and r["one"] == [4] and r["none"] == [], r
            print("I6-01 OK — maanden-parser")
            assert r["t1"] == ["winter"] and r["t2"] == ["winter", "lente"], r
            assert r["t3"] == ["zomer"], f"niet-aangrenzend moet vervangen: {r['t3']}"
            assert set(r["t4"]) == {"herfst", "winter"}, r["t4"]
            assert r["t5"] == ["zomer"] and r["t6"] == ["winter"], r
            print("I6-02 OK — seizoenkeuze")
            assert r["p1"]["months"] == [1, 2] and r["p1"]["label"] == "Winter–lente", r["p1"]
            assert r["p2"]["months"] == [10, 11] and r["p2"]["label"] == "Herfst–winter", r["p2"]
            assert r["p3"]["months"] == [5, 6, 7], r["p3"]
            print("I6-03 OK — overgangsperiodes")

            species = p.evaluate("async () => (await import('/src/data/species.js')).SPECIES.map(({id, months, category, regions}) => ({id, months, category, regions}))")

            def expected(months):
                return {s["id"] for s in species if months_of(s["months"]) & set(months)}

            p.locator('.nav-item[data-route="species"]').click()
            tabs = p.eval_on_selector_all("#speciesFilters .filter-chip[data-cat]", "els => els.map(e => e.dataset.cat)")
            assert tabs[0] == "alle", f"I6-04 eerste tab {tabs[0]}"
            assert p.locator('#speciesFilters .filter-chip.active').get_attribute("data-cat") == "standvogel"
            p.locator("#speciesFiltersToggle").click()
            p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
            season_toggle = p.locator("#seizoenFiltersToggle")
            season_toggle.click()
            assert p.locator("#seasonHideYearRound").is_hidden(), "I6-06 optie zichtbaar zonder seizoen"
            season_toggle.click()
            assert f"/{len(species)} soorten waargenomen" in p.locator("#speciesSub").inner_text()

            def check(clicks, months, label):
                season_toggle.click()
                for c in clicks:
                    p.locator(f'.filter-chip--seizoen[data-season="{c}"]').click()
                season_toggle.click()
                exp = expected(months)
                p.wait_for_function("(t) => document.querySelector('#seasonHint').textContent.startsWith(t)", arg=label, timeout=8000)
                hint = p.locator("#seasonHint").inner_text()
                assert f"· {len(exp)} soorten" in hint, f"I6-04 {label}: {hint} verwacht {len(exp)}"
                if p.locator("#speciesShowAll").count():
                    p.locator("#speciesShowAll").click()
                rows = set(p.eval_on_selector_all("#speciesList .species-row", "els => els.map(e => e.dataset.id)"))
                assert rows == exp, f"I6-04 {label}: {len(rows)} rijen, verschil {len(rows ^ exp)}"
                print(f"I6-04 OK — {label.rstrip(':')} {len(exp)} soorten")

            check(["winter"], SEASON["winter"], "Winter:")
            # I6-06: optie "Zonder jaarrondvogels" (>= 10 maanden aanwezig) aan en weer uit
            winter = expected(SEASON["winter"])
            yearround = {s["id"] for s in species if len(months_of(s["months"])) >= 10}
            season_toggle.click()
            p.locator("#seasonHideYearRound").click()
            season_toggle.click()
            p.wait_for_function("() => document.querySelector('#seasonHint').textContent.includes('zonder jaarrondvogels')", timeout=8000)
            if p.locator("#speciesShowAll").count():
                p.locator("#speciesShowAll").click()
            rows = set(p.eval_on_selector_all("#speciesList .species-row", "els => els.map(e => e.dataset.id)"))
            assert rows == winter - yearround and rows, f"I6-06 {len(rows)} vs {len(winter - yearround)}"
            assert f"· {len(winter - yearround)} soorten" in p.locator("#seasonHint").inner_text()
            p.screenshot(path=str(SHOTS / "species_i6_no_yearround_390.png"))
            season_toggle.click()
            p.locator("#seasonHideYearRound").click()
            season_toggle.click()
            p.wait_for_function("(n) => document.querySelector('#seasonHint').textContent.includes('· ' + n + ' soorten')", arg=len(winter), timeout=8000)
            print(f"I6-06 OK — winter zonder jaarrondvogels: {len(winter - yearround)} van {len(winter)}, optie weer uit")
            check(["lente"], [1, 2], "Winter–lente:")
            p.screenshot(path=str(SHOTS / "species_i6_season_390.png"))
            check(["zomer"], SEASON["zomer"], "Zomer:")
            check(["herfst"], [7, 8], "Zomer–herfst:")
            pressed = p.eval_on_selector_all('.filter-chip--seizoen[aria-pressed="true"]', "els => els.map(e => e.dataset.season)")
            assert pressed == ["zomer", "herfst"], pressed
            season_toggle.click()
            p.locator('.filter-chip--seizoen[data-season="zomer"]').click()
            p.locator('.filter-chip--seizoen[data-season="herfst"]').click()
            assert p.locator("#seasonHint").is_hidden()

            # Switching menus keeps the other selections and combines all three filters.
            p.locator("#speciesFiltersToggle").click()
            assert p.locator("#seizoenFilters").is_hidden()
            p.locator('#speciesFilters [data-cat="trekvogel"]').click()
            p.locator("#gebiedFiltersToggle").click()
            p.locator('#gebiedFilters [data-region="bos"]').click()
            season_toggle.click()
            p.locator('[data-season="lente"]').click()
            p.locator('[data-season="zomer"]').click()
            p.keyboard.press("Escape")
            assert p.locator("#seizoenFilters").is_hidden()
            assert "Lente–zomer" in season_toggle.inner_text()
            assert "Trekvogels" in p.locator("#speciesFiltersToggle").inner_text()
            assert "Bos" in p.locator("#gebiedFiltersToggle").inner_text()
            exp = expected([4, 5]) & {s["id"] for s in species if s["category"] == "trekvogel" and "bos" in s["regions"]}
            rows = set(p.eval_on_selector_all("#speciesList .species-row", "els => els.map(e => e.dataset.id)"))
            assert rows and rows == exp, f"Gecombineerde filters: {rows} vs {exp}"
            assert not errors, f"I6-05 paginafouten: {errors}"
            print("I6-05 OK — geen paginafouten")
            browser.close()
    print("Fase I6: alle controles geslaagd")


if __name__ == "__main__":
    main()
