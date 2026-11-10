"""
Birdspot Library — kennisbaseline proef, browserdekking (contract v0.1, 10-11-2026)

  KBB-01  Alle 8 proefsoorten op 390 px: "Snel herkennen" zichtbaar met kritisch kenmerk en
          betrouwbaarheidslabels, vóór de Verenkleed-kop; geen horizontale scroll.
  KBB-02  Niveau 2 is standaard ingeklapt; een accordion opent en sluit met klik én toetsenbord.
  KBB-03  Eén vergelijkingsplek: geen chips in Niveau 1; vergelijkingsknop navigeert heen en terug;
          extra gelijkende soort zonder eigen kaart staat onder "Lijkt op" en navigeert.
  KBB-04  Tab Leefwijze toont het kennisprofiel met gelinkte bronnen (target=_blank, rel=noopener).
  KBB-05  Soort zonder profiel (Merel sp037... gekozen via de data) toont geen kb-onderdelen en
          behoudt de bestaande veldkenmerken-callout.
  KBB-06  Bestaande functies: hoofdfoto opent de zoomviewer, audio-element aanwezig waar het al
          was, tabwissel werkt, sluiten werkt.
  KBB-07  Desktop 1280 px: geen horizontale scroll; kritische kaart in 2 kolommen.
  KBB-08  Screenshots: eerste scherm + volledige kaart op 390 px voor alle proefsoorten,
          desktop voor drie soorten. Geen paginafouten.

Starten (vanuit repo-root):  python tests/test_kennisbaseline_browser.py
"""
import http.server
import json
import re
import subprocess
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots" / "kennisbaseline"
SHOTS.mkdir(parents=True, exist_ok=True)
# Volledige screenshots (±16 MB) zijn CI-artefact, geen repo-inhoud; een selectie staat in docs/kennisbaseline/screenshots/.
(SHOTS / ".gitignore").write_text("*\n", encoding="utf-8")

PILOT = [("Ekster", "sp021"), ("Fitis", "sp057"), ("Tjiftjaf", "sp056"), ("Boomkruiper", "sp066"),
         ("Torenvalk", "sp008"), ("Zilvermeeuw", "sp094"), ("Sperwer", "sp006"), ("Buizerd", "sp005")]
DESKTOP = ["sp057", "sp006", "sp094"]


def species_without_profile():
    """Eerste soort mét foto en fieldmarks maar zónder kennisprofiel, uit de data zelf."""
    out = subprocess.run(["node", "--input-type=module", "-e", """
      import { SPECIES } from './src/data/species.js';
      import { KNOWLEDGE } from './src/data/speciesKnowledge.js';
      import { GUIDE_PHOTOS } from './src/features/species/guidePhotos.js';
      const s = SPECIES.find(x => !KNOWLEDGE[x.id] && GUIDE_PHOTOS[x.id] && x.fieldmarks && !x.compact);
      console.log(JSON.stringify([s.nameNL, s.id]));
    """], cwd=ROOT, capture_output=True, text=True, check=True)
    return tuple(json.loads(out.stdout))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def boot(page, base, first=False):
    page.goto(base, wait_until="domcontentloaded")
    if first:
        page.locator("#screen-home").wait_for(timeout=15000)
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)


def open_species(p, name, sid):
    p.locator('.nav-item[data-route="species"]').click()
    toggle = p.locator('#speciesFiltersToggle')
    if toggle.count():
        toggle.click()
    p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
    p.locator('#speciesSearch').fill(name)
    p.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    p.locator('.sd-tabs').wait_for(timeout=8000)


def no_hscroll(p, label):
    sw, vw = p.evaluate("() => [document.documentElement.scrollWidth, window.innerWidth]")
    assert sw <= vw + 1, f"{label}: horizontale scroll ({sw}px > {vw}px)"


def full_sheet(p, path):
    """Zelfde techniek als test_fotovolgorde_2026-11-10.py: vaste hoogte tijdelijk opheffen voor
    een screenshot van de hele kaart; daarna wordt de pagina herladen."""
    p.evaluate("""() => {
      for (const sel of ['.signature-species-detail-overlay', '.signature-species-detail-sheet']) {
        const el = document.querySelector(sel); if (!el) continue;
        Object.assign(el.style, {position: 'static', height: 'auto', maxHeight: 'none', overflow: 'visible', inset: 'auto'});
      }
    }""")
    p.screenshot(path=str(path), full_page=True)


def main():
    plain_name, plain_id = species_without_profile()
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
            boot(p, base, first=True)

            # ── KBB-01 / KBB-08: alle proefsoorten op 390 px ─────────────────────────
            offsets = {}
            for name, sid in PILOT:
                open_species(p, name, sid)
                panel = p.locator("#sdPanel-herkenning")
                quick = panel.locator('section.kb-quick')
                expect(quick).to_have_count(1)
                expect(quick).to_have_attribute("data-kb", sid)
                crit = quick.locator("[data-kb-critical]")
                expect(crit).to_be_visible()
                assert quick.locator(".kb-rel").count() >= 3, f"KBB-01 {sid}: betrouwbaarheidslabels ontbreken"
                ys = p.evaluate("""() => {
                  const panel = document.querySelector('#sdPanel-herkenning');
                  const h = [...panel.querySelectorAll('.sd-h')].find(x => x.textContent === 'Verenkleed');
                  const q = panel.querySelector('.kb-quick');
                  return [q.getBoundingClientRect().top, h ? h.getBoundingClientRect().top : null];
                }""")
                if ys[1] is not None:
                    assert ys[0] < ys[1], f"KBB-01 {sid}: Snel herkennen staat niet vóór Verenkleed {ys}"
                no_hscroll(p, f"KBB-01 {sid}")
                # Eerste scherm van de Herkenning-tab: tab in beeld scrollen en screenshot
                p.locator(".sd-tabs").scroll_into_view_if_needed()
                p.locator(".sd-tabs").evaluate("el => el.scrollIntoView({block: 'start'})")
                crit_bottom, limit = p.evaluate("""() => {
                  const nav = document.querySelector('#app-nav');
                  const limit = nav ? nav.getBoundingClientRect().top : window.innerHeight;
                  return [document.querySelector('[data-kb-critical]').getBoundingClientRect().bottom, limit];
                }""")
                offsets[sid] = round(crit_bottom)
                assert crit_bottom <= limit, f"KBB-01 {sid}: kritisch kenmerk valt buiten het eerste scherm ({crit_bottom} > {limit})"
                p.screenshot(path=str(SHOTS / f"{sid}_390_eerste-scherm.png"))
                # Volledige kaart met de kritische kenmerken opengeklapt
                panel.locator('details[data-kb-section="kritisch"] > summary').click()
                full_sheet(p, SHOTS / f"{sid}_390_volledig.png")
                boot(p, base)
            print("KBB-01 OK — 8 proefsoorten: Snel herkennen + kritisch kenmerk zichtbaar vóór Verenkleed, geen horizontale scroll")
            print("        onderkant kritisch kenmerk (px vanaf boven, tab bovenaan):", offsets)

            # ── KBB-02: accordions ──────────────────────────────────────────────────
            open_species(p, "Fitis", "sp057")
            details = p.locator('#sdPanel-herkenning details.kb-acc')
            assert details.count() >= 3, "KBB-02 Niveau 2 (kritisch, herkenning, geslacht/leeftijd) ontbreekt"
            for i in range(details.count()):
                assert details.nth(i).evaluate("d => d.open") is False, "KBB-02 accordion standaard open"
            acc = p.locator('#sdPanel-herkenning details[data-kb-section="kritisch"]')
            acc.locator("summary").click()
            assert acc.evaluate("d => d.open") is True
            expect(acc.locator(".kb-crit-card").first).to_be_visible()
            acc.locator("summary").click()
            assert acc.evaluate("d => d.open") is False
            geluid = p.locator('#sdPanel-herkenning details[data-kb-section="herkenning"] > summary')
            geluid.focus()
            p.keyboard.press("Enter")
            assert geluid.evaluate("s => s.parentElement.open") is True, "KBB-02 toetsenbord opent accordion niet"
            print("KBB-02 OK — Niveau 2 standaard ingeklapt; opent/sluit met klik en Enter")

            # ── KBB-03: chip-navigatie heen en terug ────────────────────────────────
            expect(p.locator('#sdPanel-herkenning .kb-quick [data-compare-species]')).to_have_count(0)
            chip = p.locator('#sdPanel-herkenning .sd-cmp-card [data-compare-species="sp056"]').first
            chip.scroll_into_view_if_needed()
            chip.click()
            expect(p.locator(".signature-species-detail-sheet h2")).to_have_text("Tjiftjaf")
            expect(p.locator('#sdPanel-herkenning .kb-quick')).to_have_attribute("data-kb", "sp056")
            back = p.locator('#sdPanel-herkenning .sd-cmp-card [data-compare-species="sp057"]').first
            back.scroll_into_view_if_needed()
            back.click()
            expect(p.locator(".signature-species-detail-sheet h2")).to_have_text("Fitis")
            expect(p.locator(".signature-species-detail-overlay")).to_have_count(1)
            print("KBB-03 OK — geen chips in Niveau 1; vergelijkingsknop Fitis → Tjiftjaf → Fitis, precies één open kaart")

            # KBB-03b: extra gelijkende soort zonder eigen vergelijkingskaart (Zilvermeeuw → Geelpootmeeuw)
            p.locator(".signature-species-detail-close").click()
            expect(p.locator(".signature-species-detail-overlay")).to_have_count(0)
            open_species(p, "Zilvermeeuw", "sp094")
            extra = p.locator('#sdPanel-herkenning [data-kb-similar] [data-compare-species="sp226"]')
            expect(extra).to_have_count(1)
            p.locator('#sdPanel-herkenning [data-kb-similar]').scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS / "sp094_390_lijkt-op.png"))
            extra.click()
            expect(p.locator(".signature-species-detail-sheet h2")).to_have_text("Geelpootmeeuw")
            p.locator(".signature-species-detail-close").click()
            expect(p.locator(".signature-species-detail-overlay")).to_have_count(0)
            open_species(p, "Fitis", "sp057")
            print("KBB-03b OK — Zilvermeeuw: Geelpootmeeuw onder Lijkt op, navigeert")

            # ── KBB-04: Leefwijze-tab, bronnen ──────────────────────────────────────
            p.locator("#sdTab-status").click()
            prof = p.locator('#sdPanel-status section[aria-label="Kennisprofiel"]')
            expect(prof).to_be_visible()
            prof.locator('details[data-kb-section="bronnen"] > summary').click()
            links = prof.locator(".kb-sources a")
            assert links.count() >= 2
            for i in range(links.count()):
                a = links.nth(i)
                assert re.match(r"^https://", a.get_attribute("href"))
                assert a.get_attribute("target") == "_blank" and "noopener" in a.get_attribute("rel")
            expect(prof.locator(".kb-review")).to_contain_text("onafhankelijke controle nog open")
            p.locator("#sdTab-waar").click()
            expect(p.locator('#sdPanel-waar details[data-kb-section="leefgebied"]')).to_have_count(1)
            p.locator("#sdTab-herkenning").click()
            expect(p.locator("#sdPanel-herkenning")).to_be_visible()
            print(f"KBB-04 OK — Leefwijze toont kennisprofiel met {links.count()} gelinkte bronnen; tabwissel werkt")

            # ── KBB-06: bestaande functies op een proefsoort ────────────────────────
            hero = p.locator(".sd-hero-photo")
            if hero.count():
                hero.click()
                zoom = p.get_by_role("dialog", name="Vogelfoto bekijken")
                expect(zoom).to_have_count(1)
                p.keyboard.press("Escape")
                expect(zoom).to_have_count(0)
            audio = p.locator("#sdPanel-herkenning audio")
            clips = audio.count()
            p.wait_for_timeout(500)  # na het asynchroon laden van speciesLife
            expect(p.locator("#sdVoice [data-kb-voice]")).to_have_count(1)
            assert p.locator("#sdVoice h3.sd-h").count() == 1, "KBB-06 dubbele kop Zang en roep"
            assert clips == 2, f"KBB-06 Fitis: verwacht 2 bestaande geluidsfragmenten, kreeg {audio.count()}"
            for i in range(audio.count()):
                src = audio.nth(i).get_attribute("src")
                rel = re.sub(r"^https?://[^/]+/", "", src).split("?")[0].lstrip("./")
                assert (ROOT / rel).exists(), f"KBB-06 audiobestand ontbreekt: {src}"
            p.locator(".signature-species-detail-close").click()
            expect(p.locator(".signature-species-detail-overlay")).to_have_count(0)
            print(f"KBB-06 OK — hoofdfoto-zoom, Escape en sluiten werken ({clips} bestaande geluidsfragmenten met bestand aanwezig)")

            # ── KBB-05: soort zonder profiel ───────────────────────────────────────
            open_species(p, plain_name, plain_id)
            expect(p.locator(".signature-species-detail-sheet [class*='kb-']")).to_have_count(0)
            expect(p.locator("#sdPanel-herkenning .sd-callout, #sdPanel-herkenning [class*='callout']").first).to_be_visible()
            p.screenshot(path=str(SHOTS / f"{plain_id}_390_zonder-profiel.png"))
            print(f"KBB-05 OK — {plain_name} ({plain_id}) zonder profiel: geen kb-onderdelen, veldkenmerken blijven")

            # ── KBB-07 / KBB-08: desktop ───────────────────────────────────────────
            dctx = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce",
                                       service_workers="block")
            dp = dctx.new_page()
            dp.on("pageerror", lambda e: errors.append(str(e)))
            for i, sid in enumerate(DESKTOP):
                name = dict((s, n) for n, s in PILOT)[sid]
                boot(dp, base, first=(i == 0))
                open_species(dp, name, sid)
                no_hscroll(dp, f"KBB-07 {sid}")
                dp.locator(".sd-tabs").evaluate("el => el.scrollIntoView({block: 'start'})")
                dp.screenshot(path=str(SHOTS / f"{sid}_1280_eerste-scherm.png"))
                acc = dp.locator('#sdPanel-herkenning details[data-kb-section="kritisch"]')
                acc.locator("summary").click()
                cols = dp.locator(".kb-crit-card dl").first.evaluate(
                    "dl => getComputedStyle(dl).gridTemplateColumns.split(' ').length")
                assert cols == 2, f"KBB-07 {sid}: kritische kaart heeft {cols} kolommen op desktop"
                acc.scroll_into_view_if_needed()
                dp.screenshot(path=str(SHOTS / f"{sid}_1280_kritisch-open.png"))
                full_sheet(dp, SHOTS / f"{sid}_1280_volledig.png")
            dctx.close()
            print(f"KBB-07 OK — desktop 1280 px voor {', '.join(DESKTOP)}: geen horizontale scroll, 2 kolommen")

            assert not errors, f"paginafouten: {errors}"
            browser.close()
    print("Kennisbaseline browserdekking: alle controles geslaagd (KBB-01..KBB-08)")


if __name__ == "__main__":
    main()
