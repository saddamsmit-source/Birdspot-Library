"""
Birdspot Library — F: foto van de dag op de startpagina
  F-01  100 vogels in 15 groepen; eigen lokale opnamen voor Home met maker, licentie en Commons-bron
  F-02  opeenvolgende vogels komen uit een andere groep
  F-03  alle foto's komen één keer langs per 100 kalenderdagen
  F-04  dezelfde foto gedurende de dag, ook na heropenen; wissel om lokale middernacht
  F-05  bijschrift: groep, Nederlandse en Latijnse naam, herkenning, aanwezigheid, maker en licentie; foto geladen
  F-06  geen verzoeken naar Wikimedia, geen paginafouten; screenshot 390 px

Starten (vanuit repo-root):  python tests/test_showcase.py
"""
import http.server
import hashlib
import json
import re
import threading
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import unquote

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
SPEC = json.loads((ROOT / "tools" / "showcase" / "species.json").read_text(encoding="utf-8"))
CREDITS = json.loads((ROOT / "assets" / "showcase" / "credits.json").read_text(encoding="utf-8"))
LICENSE = re.compile(r"^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)$")


def photo_reference(value):
    title = unquote(value).split("/wiki/")[-1].replace("_", " ").strip().casefold()
    return title.removeprefix("file:")


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
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, timezone_id="Europe/Amsterdam",
                                      reduced_motion="reduce", service_workers="block")
            p = ctx.new_page()
            errors, external = [], []
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.on("request", lambda r: external.append(r.url) if "wikimedia" in r.url else None)
            # Oude installaties kunnen nog een opgeslagen diashowpositie hebben.
            ctx.add_init_script("if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1');"
                                " localStorage.setItem('birdspot-showcase-position', JSON.stringify({index: 5, elapsed: 20000})); }")
            p.clock.install(time=datetime(2026, 11, 28, 18, tzinfo=timezone.utc))
            p.goto(url, wait_until="domcontentloaded")
            p.clock.run_for(6000)
            p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            birds = p.evaluate("async () => (await import('/src/features/home/specialBirds.js')).FEATURED_BIRDS")
            groups = SPEC["groups"]
            assert len(groups) == 15 and all(len(g[2]) >= 2 for g in groups), "F-01 15 groepen, elk minstens 2"
            assert sum(len(g[2]) for g in groups) == 50 and len(SPEC["extra"]) == 50 and len(birds) == 100
            assert len({b["id"] for b in birds}) == 100, "F-01 dubbele soort"
            assert {b["group"] for b in birds[50:]} == {g[0] for g in groups}, "F-01 elke groep heeft aanvullingen"
            assert len({b["image"] for b in birds}) == 100, "F-01 dubbel fotopad"
            assert len({photo_reference(b["source"]) for b in birds}) == 100, "F-01 dubbele bronopname"
            guide = p.evaluate("""async () => {
              const { GUIDE_PHOTOS } = await import('/src/features/species/guidePhotos.js');
              const { GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } = await import('/src/features/species/guideMedia.js');
              return {
                photos: [...Object.values(GUIDE_PHOTOS), ...Object.values(GUIDE_PLUMAGE).flatMap(Object.values),
                         ...Object.values(GUIDE_POSES).flat()],
                heroPaths: Object.values(GUIDE_HEROES)
              };
            }""")
            guide_references = {photo_reference(photo[field]) for photo in guide["photos"]
                                for field in ("file", "source") if photo.get(field)}
            guide_paths = {photo["image"] for photo in guide["photos"] if photo.get("image")} | set(guide["heroPaths"])
            guide_hashes = {hashlib.sha256(path.read_bytes()).digest() for name in guide_paths
                            if (path := ROOT / name.lstrip("/")).is_file()}
            for b in birds:
                c = CREDITS[b["id"]]
                path = ROOT / b["image"].lstrip("/")
                assert b["image"].startswith("/assets/showcase/") and path.is_file(), b["image"]
                assert b["image"] not in guide_paths and hashlib.sha256(path.read_bytes()).digest() not in guide_hashes, b["id"]
                assert all(photo_reference(b[field]) not in guide_references for field in ("file", "source")), b["id"]
                assert b["author"] and b["author"] == c["author"] and LICENSE.match(b["license"]), b
                assert unquote(b["source"]).startswith("https://commons.wikimedia.org/wiki/File:"), b
            compact_ids = set(p.evaluate("async () => (await import('/src/data/species.js')).SPECIES.filter(s => s.compact).map(s => s.id)"))
            for b in birds:
                assert b["id"] not in compact_ids or b.get("info"), f"F-01 {b['nl']}: dwaalgast zonder herkenningstekst"
            print("F-01 OK — 100 eigen Home-foto's met maker, licentie en herkenning, zonder overlap met soortkaarten")

            assert all(birds[i]["group"] != birds[(i + 1) % len(birds)]["group"] for i in range(len(birds))), "F-02"
            print("F-02 OK — afwisselende groepen")

            cycle = p.evaluate("""async () => {
              const { featuredBirdForDate } = await import('/src/features/home/specialBirds.js');
              return Array.from({length:101}, (_, i) => featuredBirdForDate(new Date(2026, 9, 20 + i)).id);
            }""")
            assert len(set(cycle[:100])) == 100 and cycle[0] == cycle[-1], cycle
            print("F-03 OK — 100 kalenderdagen, ook over de overgang naar wintertijd")

            shown = lambda: p.locator("#slideshow").get_attribute("data-bird-id")  # noqa: E731
            p.locator("#slideshow[data-bird-id]").wait_for(timeout=8000)
            start_id = shown()
            expected = p.evaluate("""async () => {
              const {featuredBirdForDate} = await import('/src/features/home/specialBirds.js');
              return [featuredBirdForDate(new Date(2026, 10, 28)).id, featuredBirdForDate(new Date(2026, 10, 29)).id];
            }""")
            assert start_id == expected[0], (start_id, expected)
            p.clock.fast_forward(10 * 60 * 1000)
            assert shown() == start_id, ("F-04 dezelfde dag", shown())
            p.reload(wait_until="domcontentloaded")
            p.clock.run_for(6000)
            p.locator("#slideshow[data-bird-id]").wait_for(timeout=8000)
            assert shown() == start_id, ("F-04 heropenen op dezelfde dag", shown())
            assert p.locator("#featuredBirdMotion, .home-featured-progress").count() == 0

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
            zoom_trigger = p.locator('#featuredBirdZoom')
            zoom_trigger.click()
            viewer = p.get_by_role("dialog", name="Vogelfoto bekijken")
            viewer.get_by_role("button", name="Inzoomen").click()
            assert viewer.get_by_role("button", name="Zoom herstellen").inner_text() == "2×"
            local_midnight = datetime(2026, 11, 28, 22, 59, 55, tzinfo=timezone.utc)
            p.clock.set_system_time(local_midnight)
            p.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))")
            p.clock.run_for(6000)
            assert shown() == cur["id"], "De foto blijft staan zolang de zoomviewer open is"
            p.keyboard.press("Escape")
            viewer.wait_for(state="detached")
            assert zoom_trigger.evaluate("(el) => document.activeElement === el")
            assert shown() == expected[1], ("F-04 wissel na middernacht", shown(), expected)
            print("F-04 OK — heropenen op dezelfde dag en wisselen rond lokale middernacht")
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
