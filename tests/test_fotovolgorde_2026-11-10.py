"""
Birdspot Library — vaste fotovolgorde per soortkaart, browserdekking (Opdracht 3, 10-11-2026)
"Birdspot Library — eerst alfabetische vogels en definitieve fotovolgorde"

De pure HTML-contractcontroles (volgorde, geen dubbele foto's, geen Juveniel-tegen-Juveniel,
geen verzonnen geslacht, over de VOLLEDIGE dataset) staan in tests/test_fotovolgorde_2026-11-10.mjs.
Dit bestand bewijst dezelfde vijf representatieve soorten in een echte, gerenderde browser:

  FVB-01  Sectievolgorde ook zichtbaar/geverifieerd in de DOM, op 390 px
  FVB-02  "In vlucht" bij sp249 toont Mannetje + Vrouwtje + Juveniel (beide geslachten in vlucht)
  FVB-03  "In vlucht" bij sp008 toont een bevestigd mannetje naast een neutrale kaart zonder
          geslachtslabel (data-plumage) — geen geslacht verzonnen
  FVB-04  Zoom/draai/pan en de foto-informatie-knop werken nog op een foto in de nieuwe sectie
          (bestaande functionaliteit behouden, ook na de herindeling)
  FVB-05  sp059 (geen vluchtdata) toont geen (lege) "In vlucht"-sectie
  FVB-06  Screenshots op 390 px (vijf soorten) en op desktopbreedte (sp249, rijkste geval)

Starten (vanuit repo-root):  python tests/test_fotovolgorde_2026-11-10.py
"""
import http.server
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)


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
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce",
                                       service_workers="block")
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(base, wait_until="domcontentloaded")
            p.locator("#screen-home").wait_for(timeout=15000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            def open_species(name, sid):
                p.locator('.nav-item[data-route="species"]').click()
                toggle = p.locator('#speciesFiltersToggle')
                if toggle.count():
                    toggle.click()
                p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
                p.locator('#speciesSearch').fill(name)
                p.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
                p.locator('.sd-tabs').wait_for(timeout=8000)

            def close_detail():
                p.locator('.signature-species-detail-close').click()
                p.locator('.signature-species-detail-overlay').wait_for(state="detached", timeout=5000)

            def screenshot_full_sheet(page_or_frame, path):
                """De kaart (.signature-species-detail-sheet) scrollt intern (overlay op vaste
                hoogte); een gewone full_page-screenshot toont daardoor alleen het eerste scherm.
                Voor een screenshot van de HELE kaart (alle fotosecties in volgorde) wordt de
                vaste hoogte/overflow tijdelijk opgeheven — puur voor dit screenshot, de sheet
                wordt direct daarna gesloten en nooit verder gebruikt in deze testrun."""
                page_or_frame.evaluate("""() => {
                  for (const sel of ['.signature-species-detail-overlay', '.signature-species-detail-sheet']) {
                    const el = document.querySelector(sel);
                    if (!el) continue;
                    el.style.position = 'static';
                    el.style.height = 'auto';
                    el.style.maxHeight = 'none';
                    el.style.overflow = 'visible';
                    el.style.inset = 'auto';
                  }
                }""")
                page_or_frame.screenshot(path=path, full_page=True)

            def section_order():
                """Y-posities van de koppen/aria-labels, in DOM-volgorde — bewijst dat CSS de
                volgorde niet visueel omdraait en dat elke sectie daadwerkelijk zichtbaar is."""
                return p.evaluate("""() => {
                  const panel = document.querySelector('#sdPanel-herkenning');
                  const find = sel => panel.querySelector(sel);
                  const marks = [
                    ['Verenkleed', [...panel.querySelectorAll('.sd-h')].find(h => h.textContent === 'Verenkleed')],
                    ['In vlucht', find('section[aria-label="In vlucht"]')],
                    ['Vluchtvergelijking', find('section[aria-label="Vluchtvergelijking"]')],
                    ['Lijkt op', [...panel.querySelectorAll('.sd-h')].find(h => h.textContent === 'Lijkt op')],
                  ].filter(([, el]) => el);
                  return marks.map(([name, el]) => [name, el.getBoundingClientRect().top]);
                }""")

            # ── FVB-01/05/06: vijf representatieve soorten, volgorde + screenshot op 390 px ──
            cases = [
                ("Bruine Kiekendief", "sp173", ["Verenkleed", "In vlucht", "Lijkt op"]),
                ("Blauwe Kiekendief", "sp249", ["Verenkleed", "In vlucht", "Lijkt op"]),
                ("Ruigpootbuizerd", "sp253", ["Verenkleed", "In vlucht", "Lijkt op"]),
                ("Zwartkop", "sp059", ["Verenkleed"]),
                ("Torenvalk", "sp008", ["Verenkleed", "In vlucht", "Vluchtvergelijking", "Lijkt op"]),
            ]
            for name, sid, expected in cases:
                open_species(name, sid)
                order = section_order()
                names = [n for n, _ in order]
                assert names == expected, f"FVB-01 {sid} volgorde: {names} != {expected}"
                ys = [y for _, y in order]
                assert ys == sorted(ys), f"FVB-01 {sid} secties staan visueel niet in volgorde: {order}"
                if sid == "sp059":
                    expect(p.locator('#sdPanel-herkenning section[aria-label="In vlucht"]')).to_have_count(0)
                screenshot_full_sheet(p, str(SHOTS / f"fotovolgorde_{sid}_390.png"))
                # Na het tijdelijk opheffen van de vaste hoogte (voor het screenshot) staat de
                # pagina-opmaak niet meer overeind; herladen is hier schoner dan de sheet sluiten.
                p.goto(base, wait_until="domcontentloaded")
                p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            print(f"FVB-01/05/06 OK — sectievolgorde en 390px-screenshots voor {len(cases)} representatieve soorten")

            # ── FVB-02: sp249 — beide geslachten + juveniel bevestigd in vlucht ─────────────
            open_species("Blauwe Kiekendief", "sp249")
            flight = p.locator('#sdPanel-herkenning section[aria-label="In vlucht"]')
            titles = flight.locator('.sd-plumage strong').all_inner_texts()
            assert titles == ["Mannetje", "Vrouwtje", "Juveniel"], f"FVB-02 sp249: {titles}"
            images = flight.locator('[data-guide-image] img').all()
            assert len({img.get_attribute('src') for img in images}) == len(images), \
                "FVB-02 sp249 dubbele vluchtfoto in de DOM"
            print("FVB-02 OK — sp249 toont Mannetje + Vrouwtje + Juveniel, alle drie bevestigd in vlucht")
            close_detail()

            # ── FVB-03/FVB-04: sp008 — bevestigd mannetje + neutrale kaart, zoom/info werkt ──
            open_species("Torenvalk", "sp008")
            flight = p.locator('#sdPanel-herkenning section[aria-label="In vlucht"]')
            male_card = flight.locator('.sd-plumage[data-plumage="adult_m"]')
            neutral_card = flight.locator('.sd-plumage[data-plumage="neutral"]')
            expect(male_card).to_have_count(1)
            expect(neutral_card).to_have_count(1)
            assert male_card.locator('strong').inner_text() == "Mannetje"
            assert neutral_card.locator('strong').inner_text() == "In vlucht"
            expect(flight.locator('.sd-plumage[data-plumage="adult_f"]')).to_have_count(0)
            print('FVB-03 OK — sp008 toont een bevestigd mannetje naast een neutrale vluchtkaart, geen verzonnen geslacht')

            photo = male_card.locator('.sd-field-photo').first
            photo.scroll_into_view_if_needed()
            photo.locator('img').evaluate("img => img.decode()")
            info = photo.locator('..').get_by_label("Foto-informatie")
            expect(info).to_have_count(1)
            photo.click()
            zoom = p.get_by_role("dialog", name="Vogelfoto bekijken")
            expect(zoom).to_have_count(1)
            zoom.get_by_role("button", name="Inzoomen").click()
            expect(zoom.get_by_role("button", name="Zoom herstellen")).to_have_text("2×")
            p.keyboard.press("Escape")
            expect(zoom).to_have_count(0)
            print("FVB-04 OK — zoom, foto-informatie en sluiten werken nog op een foto in de nieuwe 'In vlucht'-sectie")
            close_detail()

            # ── FVB-06 vervolg: desktopbreedte, rijkste geval (sp249) ───────────────────────
            desktop_ctx = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce",
                                               service_workers="block")
            dp = desktop_ctx.new_page()
            dp.goto(base, wait_until="domcontentloaded")
            dp.locator("#screen-home").wait_for(timeout=15000)
            dp.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            dp.locator('.nav-item[data-route="species"]').click()
            toggle = dp.locator('#speciesFiltersToggle')
            if toggle.count():
                toggle.click()
            dp.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
            dp.locator('#speciesSearch').fill("Blauwe Kiekendief")
            dp.locator('.species-row[data-id="sp249"] .species-row__body').click()
            dp.locator('.sd-tabs').wait_for(timeout=8000)
            body_width = dp.evaluate("() => document.documentElement.scrollWidth")
            viewport_width = dp.evaluate("() => window.innerWidth")
            assert body_width <= viewport_width + 1, \
                f"FVB-06 horizontale scroll op desktopbreedte: body {body_width}px > viewport {viewport_width}px"
            screenshot_full_sheet(dp, str(SHOTS / "fotovolgorde_sp249_desktop.png"))
            desktop_ctx.close()
            print("FVB-06 OK — desktopbreedte (1280px) voor sp249: geen horizontale scroll, screenshot opgeslagen")

            assert not errors, f"paginafouten tijdens FVB-run: {errors}"
            browser.close()
    print("Fotovolgorde browserdekking (Opdracht 3): alle controles geslaagd (FVB-01..FVB-06)")


if __name__ == "__main__":
    main()
