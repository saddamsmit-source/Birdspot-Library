"""
Birdspot Library — soortaudit in de browser (eigenaarseis 10-11-2026)

Voor iedere soort in docs/fotokwaliteit/soortaudit/M*.json, op 390 px (Chromium):
  SAB-01  Elke eigen foto op de kaart laadt echt (img.complete en naturalWidth > 0).
  SAB-02  De set getoonde eigen foto's is exact de set visueel beoordeelde foto's (niets extra, niets kwijt).
  SAB-03  Geen eigen foto twee keer op de kaart.
  SAB-04  Volgorde: Hoofdfoto boven Verenkleed boven In vlucht boven Overige; secties visueel in die volgorde.
  SAB-05  In "In vlucht" staan alleen foto's met een goedgekeurde/voorwaardelijke vluchtbeoordeling;
          uit-rol-foto's staan er niet in. Negatief: Holenduif sp003 en Tjiftjaf sp056 hebben géén "In vlucht".
  SAB-06  Kaartlabels tonen geen geslacht bij soorten waarvan de audit zegt dat geslacht niet op kleed te zien is.
  SAB-07  Zoomviewer opent en sluit op de hoofdfoto.
  SAB-08  Volledige kaart als screenshot; uitslag per soort in docs/fotokwaliteit/soortaudit/browser.json.
  SAB-09  FQA-03: precies één vergelijkingssectie "Lijkt op" (geen losse kop "Vluchtvergelijking"); één kaart per
          gelijkende soort met kleed- en vluchtvergelijking als tabbladen; geen dubbele foto's; navigatieknoppen werken.
          Screenshots van de sectie op 390 px (Holenduif, Sperwer, Buizerd, Zilvermeeuw) en 1280 px (Sperwer).
Offline-beschikbaarheid van alle getoonde foto's wordt gedekt door tests/test_guide_photos.py (precache + offline decode).

Starten (vanuit repo-root):  python tests/test_soortaudit_browser.py
"""
import http.server
import json
import re
import subprocess
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
AUDIT_DIR = ROOT / "docs" / "fotokwaliteit" / "soortaudit"
SHOTS = ROOT / "tests" / "screenshots" / "soortaudit"
SHOTS.mkdir(parents=True, exist_ok=True)
(SHOTS / ".gitignore").write_text("*\n", encoding="utf-8")
FLIGHT = json.loads((ROOT / "docs" / "fotokwaliteit" / "vluchtcontrole.json").read_text(encoding="utf-8"))["assets"]
ORDER = ["Hoofdfoto", "Verenkleed", "In vlucht", "Overige herkenningsfoto's"]
SEX_WORDS = ("Mannetje", "Vrouwtje")


def batches():
    out = {}
    for f in sorted(AUDIT_DIR.glob("M*.json")):
        b = json.loads(f.read_text(encoding="utf-8"))
        for sid, s in b["species"].items():
            out[sid] = s
    return out


def names():
    res = subprocess.run(["node", "--input-type=module", "-e",
                          "import { SPECIES } from './src/data/species.js'; console.log(JSON.stringify(Object.fromEntries(SPECIES.map(s => [s.id, s.nameNL]))))"],
                         cwd=ROOT, capture_output=True, text=True, check=True)
    return json.loads(res.stdout)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


COLLECT = """() => {
  const sheet = document.querySelector('.signature-species-detail-sheet');
  const panel = document.querySelector('#sdPanel-herkenning');
  const out = [];
  const hero = sheet.querySelector('.sd-hero-photo img, .sd-hero img');
  if (hero) out.push({section: 'Hoofdfoto', src: new URL(hero.currentSrc || hero.src).pathname, ok: hero.complete && hero.naturalWidth > 0, top: hero.getBoundingClientRect().top, label: ''});
  const sectionOf = el => {
    const fl = el.closest('section[aria-label]');
    if (fl) return fl.getAttribute('aria-label').replace(/\u2019/g, "'");
    const heads = [...panel.querySelectorAll('.sd-h')].filter(h => h.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    return heads.length ? heads[heads.length - 1].textContent.replace(/\u2019/g, "'") : '?';
  };
  for (const btn of panel.querySelectorAll('[data-guide-image]')) {
    const img = btn.querySelector('img');
    if (!img) continue;
    const card = btn.closest('.sd-plumage, .sd-compare-card');
    out.push({section: sectionOf(btn), src: new URL(img.currentSrc || img.src).pathname, ok: img.complete && img.naturalWidth > 0,
              top: btn.getBoundingClientRect().top, label: card ? (card.querySelector('strong')?.textContent || '') : (btn.closest('figure')?.querySelector('figcaption')?.textContent || '')});
  }
  return out;
}"""


def main():
    audit = batches()
    nm = names()
    results = {}
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce", service_workers="block")
            p = ctx.new_page()
            errors = []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(base, wait_until="domcontentloaded")
            p.locator("#screen-home").wait_for(timeout=15000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            for sid, entry in audit.items():
                name = nm[sid]
                p.locator('.nav-item[data-route="species"]').click()
                if p.locator('#speciesFiltersToggle').count():
                    p.locator('#speciesFiltersToggle').click()
                p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
                p.locator('#speciesSearch').fill(name)
                p.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
                p.locator('.sd-tabs').wait_for(timeout=8000)
                # Alle lazy-afbeeldingen laden voordat we meten.
                p.evaluate("""async () => { for (const img of document.querySelectorAll('.signature-species-detail-sheet img')) { img.loading = 'eager'; try { await img.decode(); } catch (e) {} } }""")
                shots = p.evaluate(COLLECT)
                own = [x for x in shots if x["section"] in ORDER]
                srcs = [x["src"] for x in own]
                judged = set(entry["assets"])
                # SAB-01..03
                assert all(x["ok"] for x in own), f"SAB-01 {sid}: foto laadt niet: {[x['src'] for x in own if not x['ok']]}"
                assert set(srcs) == judged, f"SAB-02 {sid}: getoond {sorted(set(srcs))} != beoordeeld {sorted(judged)}"
                assert len(srcs) == len(set(srcs)), f"SAB-03 {sid}: dubbele foto"
                # SAB-04
                firsts = [min(x["top"] for x in own if x["section"] == sec) for sec in ORDER if any(x["section"] == sec for x in own)]
                order = [sec for sec in ORDER if any(x["section"] == sec for x in own)]
                assert firsts == sorted(firsts), f"SAB-04 {sid}: secties niet in volgorde {list(zip(order, firsts))}"
                # SAB-05
                fl = [x["src"] for x in own if x["section"] == "In vlucht"]
                for s in fl:
                    assert FLIGHT.get(s, {}).get("decision") in ("goedgekeurd", "voorwaardelijk"), f"SAB-05 {sid}: {s} in In vlucht zonder goedkeuring"
                    assert entry["assets"][s]["verdict"] != "uit-rol", f"SAB-05 {sid}: uit-rol-foto in In vlucht"
                if sid in ("sp003", "sp056"):
                    assert not fl, f"SAB-05 {sid}: mag geen In vlucht-foto meer hebben"
                # SAB-06
                if "niet op kleed" in entry.get("sexPolicy", "") or "gelijk" in entry.get("sexPolicy", ""):
                    bad = [x for x in own if any(w in x["label"] for w in SEX_WORDS)]
                    assert not bad, f"SAB-06 {sid}: geslachtslabel bij soort zonder zichtbaar geslachtsverschil: {bad}"
                # SAB-07
                hero = p.locator(".sd-hero-photo").first
                if hero.count():
                    hero.click()
                    zoom = p.get_by_role("dialog", name="Vogelfoto bekijken")
                    expect(zoom).to_have_count(1)
                    p.keyboard.press("Escape")
                    expect(zoom).to_have_count(0)
                # SAB-08
                p.evaluate("""() => { for (const sel of ['.signature-species-detail-overlay', '.signature-species-detail-sheet']) {
                  const el = document.querySelector(sel); if (!el) continue;
                  Object.assign(el.style, {position: 'static', height: 'auto', maxHeight: 'none', overflow: 'visible', inset: 'auto'}); } }""")
                p.screenshot(path=str(SHOTS / f"{sid}_390_kaart.png"), full_page=True)
                results[sid] = {"ok": True, "viewport": "390x844 Chromium (Playwright)", "photos": len(own),
                                "sections": order, "flight": fl, "checks": "SAB-01..07"}
                print(f"{sid} {name}: {len(own)} foto's geladen, secties {order}, vlucht {len(fl)}")
                p.goto(base, wait_until="domcontentloaded")
                p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            # SAB-09 — één vergelijkingssectie (FQA-03)
            def similar_section(page, name, sid, tag):
                open_card(page, name, sid)
                sec = page.locator('#sdPanel-herkenning section.sd-similar')
                expect(sec).to_have_count(1)
                assert page.locator('#sdPanel-herkenning .sd-h', has_text=re.compile(r'^Vluchtvergelijking$')).count() == 0, f"SAB-09 {sid}: losse kop Vluchtvergelijking"
                # Eén kaart per gelijkende soort: geen partnernaam op twee kaarten (kleed + vlucht zijn tabbladen).
                partners = sec.locator('.sd-cmp-card').evaluate_all(
                    "cards => cards.map(c => [...c.querySelectorAll('.sd-cmp-who strong')].map(s => s.textContent).filter((n, i, a) => a.indexOf(n) === i))")
                names = [n for names_ in partners for n in names_[1:]]
                assert len(names) == len(set(names)), f"SAB-09 {sid}: soort op meer dan één kaart: {names}"
                # Vluchttabblad tonen waar het bestaat, zodat ook die vergelijking in het screenshot staat.
                flight_tab = sec.locator('.sd-cmp-tab', has_text=re.compile(r'^In vlucht')).first
                if flight_tab.count():
                    flight_tab.evaluate("el => { const d = el.closest('details'); if (d) d.open = true; }")
                    flight_tab.click()
                for d in sec.locator('details.sd-cmp-more').all():
                    d.evaluate("el => el.open = true")
                loaded = sec.locator('img').evaluate_all("""async els => { const out = []; for (const e of els) { e.loading = 'eager';
                  try { await e.decode(); } catch (x) {} out.push([e.getAttribute('src'), e.naturalWidth > 0]); } return out; }""")
                assert all(ok for _, ok in loaded), f"SAB-09 {sid}: vergelijkingsfoto laadt niet: {[s for s, ok in loaded if not ok]}"
                srcs = [s for s, _ in loaded]
                assert len(srcs) == len(set(srcs)), f"SAB-09 {sid}: dubbele foto in Lijkt op"
                # Vaste hoogte van de sheet tijdelijk opheffen (zoals SAB-08), anders knipt de scrollcontainer de sectie af.
                page.evaluate("""() => { for (const sel of ['.signature-species-detail-overlay', '.signature-species-detail-sheet']) {
                  const el = document.querySelector(sel); if (!el) continue;
                  Object.assign(el.style, {position: 'static', height: 'auto', maxHeight: 'none', overflow: 'visible', inset: 'auto'}); } }""")
                page.screenshot(path=str(SHOTS / f"{sid}_{tag}_lijkt-op.png"), full_page=True,
                                clip=sec.bounding_box() and {**sec.bounding_box(), "x": 0, "width": page.viewport_size["width"]})
                return sec

            def open_card(page, name, sid):
                page.goto(base, wait_until="domcontentloaded")
                page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
                page.locator('.nav-item[data-route="species"]').click()
                if page.locator('#speciesFiltersToggle').count():
                    page.locator('#speciesFiltersToggle').click()
                page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
                page.locator('#speciesSearch').fill(name)
                page.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
                page.locator('.sd-tabs').wait_for(timeout=8000)

            for name, sid in [("Holenduif", "sp003"), ("Sperwer", "sp006"), ("Buizerd", "sp005"), ("Zilvermeeuw", "sp094"),
                              ("Havik", "sp007"), ("Wespendief", "sp248"), ("Taigaboomkruiper", "sp067"), ("Ruigpootbuizerd", "sp253"),
                              ("Gele Kwikstaart", "sp069"), ("IJsvogel", "sp075"), ("Patrijs", "sp106"),
                              ("Boerenzwaluw", "sp114"), ("Huiszwaluw", "sp115"), ("Geelgors", "sp117")]:
                similar_section(p, name, sid, "390")
                open_card(p, name, sid)
                sec = p.locator('#sdPanel-herkenning section.sd-similar')
                btn = sec.locator('[data-compare-species]').first
                btn.scroll_into_view_if_needed()
                target = btn.get_attribute('data-compare-species')
                btn.click()
                expect(p.locator('.signature-species-detail-overlay')).to_have_count(1)
                expect(p.locator(f'.signature-species-detail-sheet [data-kb], .signature-species-detail-sheet h2')).not_to_have_count(0)
                results.setdefault(sid, {})["lijktOp"] = "SAB-09 OK (390 px)"
                print(f"SAB-09 {sid} {name}: één sectie Lijkt op, geen dubbele foto's, knop naar {target} werkt")
            dctx = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce", service_workers="block")
            dp = dctx.new_page()
            dp.on("pageerror", lambda e: errors.append(str(e)))
            for name, sid in [("Sperwer", "sp006"), ("Wespendief", "sp248")]:
                similar_section(dp, name, sid, "1280")
                results.setdefault(sid, {})["lijktOpDesktop"] = "SAB-09 OK (1280 px)"
            dctx.close()
            print("SAB-09 OK — Sperwer en Wespendief ook op 1280 px")

            assert not errors, f"paginafouten: {errors}"
            browser.close()
    head = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, capture_output=True, text=True).stdout.strip()
    dirty = bool(subprocess.run(["git", "status", "--porcelain", "--", "src", "assets", "styles", "sw.js", "index.html"],
                                cwd=ROOT, capture_output=True, text=True).stdout.strip())
    (AUDIT_DIR / "browser.json").write_text(json.dumps({"testedOn": head + (" + lokale wijzigingen" if dirty else ""), "date": "2026-11-10",
                                                        "species": results}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Soortaudit browser: {len(results)} soorten geslaagd (SAB-01..SAB-09)")


if __name__ == "__main__":
    main()
