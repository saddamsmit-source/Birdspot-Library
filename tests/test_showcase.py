"""
Birdspot Library — F: diashow op de startpagina
  F-01  50 vogels: 15 groepen bijzondere soorten; elke foto lokaal aanwezig met maker, licentie en Commons-bron
  F-02  opeenvolgende vogels komen uit een andere groep
  F-03  advance(): na 30 s de volgende vogel, rest-tijd blijft staan, loopt rond aan het eind
  F-04  hervatten: opgeslagen positie (vogel 6, 20 s) → na 10 s zichtbare tijd vogel 7;
        verborgen app telt niet door; na opnieuw openen verder waar hij was
  F-05  bijschrift: groep, Nederlandse en Latijnse naam, herkenning, aanwezigheid, maker en licentie; foto geladen
  F-06  geen verzoeken naar Wikimedia, geen paginafouten; screenshot 390 px

Starten (vanuit repo-root):  python tests/test_showcase.py
"""
import http.server
import json
import re
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
SPEC = json.loads((ROOT / "tools" / "showcase" / "species.json").read_text(encoding="utf-8"))
CREDITS = json.loads((ROOT / "assets" / "showcase" / "credits.json").read_text(encoding="utf-8"))
LICENSE = re.compile(r"^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)$")


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
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="no-preference", service_workers="block")
            p = ctx.new_page()
            errors, external = [], []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.on("request", lambda r: external.append(r.url) if "wikimedia" in r.url else None)
            # opgeslagen positie vóór de app start (eenmalig per tabblad)
            ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1');"
                                " localStorage.setItem('birdspot-showcase-position', JSON.stringify({index: 5, elapsed: 20000})); }")
            p.clock.install()
            p.goto(url, wait_until="domcontentloaded")
            p.clock.run_for(6000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            birds = p.evaluate("async () => (await import('/src/features/home/specialBirds.js')).FEATURED_BIRDS")
            groups = SPEC["groups"]
            assert len(groups) == 15 and all(len(g[2]) >= 2 for g in groups), "F-01 15 groepen, elk minstens 2"
            assert sum(len(g[2]) for g in groups) == 50 and len(birds) == 50, f"F-01 {len(birds)} vogels met foto"
            assert len({b["id"] for b in birds}) == 50, "F-01 dubbele soort"
            for b in birds:
                c = CREDITS[b["id"]]
                assert (ROOT / b["image"].lstrip("/")).is_file(), b["image"]
                assert b["author"] and b["author"] == c["author"] and LICENSE.match(b["license"]), b
                assert b["source"].startswith("https://commons.wikimedia.org/wiki/File:"), b
            compact_ids = set(p.evaluate("async () => (await import('/src/data/species.js')).SPECIES.filter(s => s.compact).map(s => s.id)"))
            for b in birds:
                assert b["id"] not in compact_ids or b.get("info"), f"F-01 {b['nl']}: dwaalgast zonder herkenningstekst"
            print("F-01 OK — 50 lokale foto's met maker, licentie en herkenning")

            assert all(birds[i]["group"] != birds[(i + 1) % len(birds)]["group"] for i in range(len(birds))), "F-02"
            print("F-02 OK — afwisselende groepen")

            adv = p.evaluate("""async () => { const m = await import('/src/features/home/specialBirds.js');
              return [m.advance({index:0,elapsed:0}, 29999), m.advance({index:0,elapsed:0}, 30000),
                      m.advance({index:3,elapsed:25000}, 10000), m.advance({index:49,elapsed:0}, 30000, 50)]; }""")
            assert adv == [{"index": 0, "elapsed": 29999}, {"index": 1, "elapsed": 0},
                           {"index": 4, "elapsed": 5000}, {"index": 0, "elapsed": 0}], adv
            print("F-03 OK — advance()")

            shown = lambda: p.locator("#slideshow").get_attribute("data-bird-id")  # noqa: E731
            p.locator("#slideshow[data-bird-id]").wait_for(timeout=8000)
            # 20 s + ~6 s opstart; vogel 5 tot 30 s, dan vogel 6
            start_id = shown()
            assert start_id in (birds[5]["id"], birds[6]["id"]), (start_id, birds[5]["id"])
            p.clock.run_for(12000)
            assert shown() == birds[6]["id"], ("F-04 na 30 s", shown())
            p.evaluate("() => { Object.defineProperty(document, 'hidden', {configurable:true, get:()=>true});"
                       " document.dispatchEvent(new Event('visibilitychange')); }")
            saved = p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-showcase-position'))")
            assert saved["index"] == 6, saved
            p.clock.run_for(10 * 60 * 1000)
            p.evaluate("() => { Object.defineProperty(document, 'hidden', {configurable:true, get:()=>false});"
                       " document.dispatchEvent(new Event('visibilitychange')); }")
            p.clock.run_for(1000)
            assert shown() == birds[6]["id"], ("F-04 telde op de achtergrond door", shown())
            p.reload(wait_until="domcontentloaded")
            p.clock.run_for(6000)
            p.locator("#slideshow[data-bird-id]").wait_for(timeout=8000)
            assert shown() == birds[6]["id"], ("F-04 hervat niet", shown())
            print("F-04 OK — hervat waar hij was, telt niet op de achtergrond")

            before_pause = shown()
            toggle = p.locator("#featuredBirdMotion")
            toggle.click()
            assert toggle.get_attribute("aria-pressed") == "true"
            p.clock.run_for(32000)
            assert shown() == before_pause, "F-04 handmatig pauzeren"
            toggle.click()
            p.emulate_media(reduced_motion="reduce")
            toggle.wait_for(state="hidden")
            p.clock.run_for(32000)
            assert shown() == before_pause, "F-04 respecteer minder beweging"

            cur = next(b for b in birds if b["id"] == shown())
            cap = p.locator("#slideshow .featured-birds__caption")
            assert p.locator("#featuredBirdGroup").inner_text().strip().lower() == cur["groupLabel"].lower()
            assert p.locator("#featuredBirdName").inner_text() == cur["nl"]
            assert p.locator("#featuredBirdLatin").inner_text() == cur["latin"]
            cap.locator("summary").click()
            assert p.locator("#featuredBirdWhere").inner_text().startswith("Herkenning: ")
            assert p.locator("#featuredBirdPresence").inner_text().startswith("In Nederland: ")
            credit = p.locator("#featuredBirdCredit")
            credit_info = credit.get_by_text("Maker:", exact=False)
            assert not credit_info.is_visible()
            cap.locator("summary").click()
            p.emulate_media(reduced_motion="no-preference")
            toggle.click()  # Resume the manually paused slideshow.
            info_trigger = credit.get_by_label("Foto-informatie", exact=True)
            info_trigger.click()
            assert credit_info.is_visible() and cur["author"] in credit_info.inner_text()
            assert cur["license"] in credit.inner_text()
            assert credit.get_by_role("link", name="Open fotobron").get_attribute("href") == cur["source"]
            p.clock.run_for(32000)
            assert shown() == cur["id"], "De fotobron moet bij de zichtbare vogel blijven"
            p.keyboard.press("Escape")
            assert not credit_info.is_visible()
            assert info_trigger.evaluate("(el) => document.activeElement === el")
            p.wait_for_function("() => document.querySelector('#featuredBirdImage').naturalWidth > 0", timeout=8000)
            assert cap.is_visible()
            p.screenshot(path=str(SHOTS / "showcase_f_390.png"))
            vg = p.evaluate("async () => { const m = await import('/src/features/home/featuredCarousel.js');"
                            " const b = (await import('/src/features/home/specialBirds.js')).FEATURED_BIRDS.find(x => x.id === 'sp463');"
                            " return m.birdInfo(b); }")
            assert vg["recognition"].startswith("Herkenning: Enorme zandbruine gier"), vg
            print("F-05 OK — bijschrift en foto:", cur["nl"], "· Vale Gier met eigen herkenningstekst")

            assert not external, f"F-06 externe verzoeken: {external[:3]}"
            assert not errors, f"F-06 paginafouten: {errors}"
            print("F-06 OK — geen Wikimedia-verzoeken, geen paginafouten")
            browser.close()
    print("Fase F: alle controles geslaagd")


if __name__ == "__main__":
    main()
