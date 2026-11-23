"""F3-REV2-R01b browser checks: Houtduif–Holenduif rest pair, hidden unequal flight pair, max. 3 quick cues."""

import threading

from playwright.sync_api import expect, sync_playwright

from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, close_sheet
from test_pilot_offline_new_sighting import Quiet, Server, boot
from test_plumage_compare_layout import open_species

NAMES = {"sp002": "Houtduif", "sp003": "Holenduif", "sp004": "Turkse Tortel",
         "sp005": "Buizerd", "sp006": "Sperwer", "sp007": "Havik"}
HEROES = {
    "sp002": ("/assets/species/sp002.webp", "Stephan Sprinz", "CC BY 4.0"),
    "sp003": ("/assets/species/sp003.webp", "Chris Cant from Cumbria, UK", "CC BY 2.0"),
}
PRIMARY = {
    "sp002": ["Witte halsvlek, alleen bij volwassen vogels.", "Lichte iris bij volwassen vogels."],
    "sp003": ["Groen glanzende halsvlek.", "Donker oog."],
    "sp004": ["Donkerrode iris bij volwassenen, bruin bij juvenielen.", "Driedelig koeren, makkelijk na te fluiten."],
    # F3-REV2-R02 (eigenaarbesluit C 23-11-2026 16:56)
    "sp005": ["Brede kop die weinig uitsteekt; brede vleugels; vrij korte staart.", "Zweeft met de vleugels in een ondiepe V."],
    "sp006": ["Staart met recht afgesneden hoeken; bij de Havik is de staartpunt afgerond.", "Korte, rechthoekige vleugels en een kleine kop die weinig uitsteekt."],
    "sp007": ["Kop steekt in vlucht ver uit; zware borst.", "Afgeronde staartpunt."],
}
MORE = {"sp002": 2, "sp003": 2, "sp004": 2, "sp005": 3, "sp006": 3, "sp007": 2}


def check_quick(page, species_id):
    quick = page.locator(f'#sdPanel-herkenning .kb-quick[data-kb="{species_id}"]')
    expect(quick.locator("[data-kb-critical]")).to_have_count(1)
    primary = quick.locator(":scope > ul.kb-marks > li.kb-mark")
    expect(primary).to_have_count(2)  # kritisch kenmerk + 2 = max. 3 primaire punten
    for index, text in enumerate(PRIMARY[species_id]):
        expect(primary.nth(index)).to_contain_text(text)
    more = quick.locator("details[data-kb-more-marks]")
    expect(more).to_have_count(1)
    assert more.get_attribute("open") is None, "extra kenmerken staan standaard ingeklapt"
    summary = more.locator("summary")
    assert summary.bounding_box()["height"] >= 44
    summary.focus()
    page.keyboard.press("Enter")
    expect(more.locator("li.kb-mark")).to_have_count(MORE[species_id])
    expect(more.locator("li.kb-mark").first).to_be_visible()
    page.keyboard.press("Enter")


def check_geometry(panel, expected_paths, rows):
    pictures = panel.locator(".sd-cmp-who .sd-field-photo img")
    expect(pictures).to_have_count(2)
    measured = pictures.evaluate_all("""async imgs => {
      for (const img of imgs) { img.loading = 'eager'; await img.decode(); }
      return imgs.map(img => { const r = img.getBoundingClientRect();
        return {path: new URL(img.src).pathname, x: r.left, right: r.right, y: r.top, width: r.width, decoded: img.naturalWidth > 0}; });
    }""")
    assert [item["path"] for item in measured] == expected_paths, measured
    left, right = measured
    assert left["decoded"] and right["decoded"]
    assert right["x"] >= left["right"] - 1 and abs(left["y"] - right["y"]) <= 7, measured
    assert abs(left["width"] - right["width"]) < 7, measured
    assert panel.evaluate("el => el.scrollWidth <= el.clientWidth + 2")
    expect(panel.locator(".sd-cmp-row")).to_have_count(rows)


def check_rest_pair(page, own, other):
    pair = open_pair(page, other)
    assert pair.get_attribute("data-cmp-flight") is None
    check_geometry(pair, [HEROES[own][0], HEROES[other][0]], 3)  # hals, oog, gevouwen vleugel
    for index, side in enumerate((own, other)):
        check_credit(pair.locator(".photo-info-frame").nth(index), *HEROES[side][1:])
    expect(pair).to_contain_text("Gevouwen vleugel")
    card = pair.locator('xpath=ancestor::div[contains(@class,"sd-cmp-card")]').first
    expect(card.locator(".sd-cmp-panel[data-cmp-flight]")).to_have_count(0)
    expect(page.locator("#sdPanel-herkenning section.sd-similar")).not_to_contain_text("Nog geen")


def check_havik_r02c(page):
    """F3-REV2-R02c: algemene Havik-vluchtfoto uit de gids; mannetje blijft; terug en heropenen."""
    for attempt in range(2):  # openen en opnieuw openen
        open_species(page, NAMES["sp007"], "sp007")
        panel = page.locator("#sdPanel-herkenning")
        expect(panel.locator('[data-guide-image$="/sp007-flight.webp"]')).to_have_count(0)
        own = panel.locator('section.sd-flight [data-guide-image$="/sp007-male-flight.webp"] img')
        expect(own).to_have_count(1)
        expect(panel.locator('section.sd-flight [data-guide-image$="/sp007-adult_f.webp"] img')).to_have_count(1)
        flights = panel.locator(".sd-cmp-panel[data-cmp-flight] img").evaluate_all(
            "imgs => imgs.map(i => new URL(i.src).pathname)")
        assert "/assets/species/plumage/sp007-male-flight.webp" in flights, flights
        assert "/assets/species/plumage/sp006-flight.webp" in flights and "/assets/species/plumage/sp008-flight.webp" in flights, flights
        frame = panel.locator('[data-guide-image$="/sp007-male-flight.webp"]').first.locator(
            "xpath=ancestor::*[contains(@class,'photo-info-frame')][1]")
        if frame.count():
            check_credit(frame, "Вячеслав Юсупов", "CC BY 4.0")
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
        if attempt == 0:
            page.go_back()  # terugnavigatie sluit eerst het soortblad
            expect(page.locator(".signature-species-detail-overlay")).to_have_count(0)
        else:
            close_sheet(page)


def smoke(page):
    for own, other in (("sp002", "sp003"), ("sp003", "sp002")):
        open_species(page, NAMES[own], own)
        check_quick(page, own)
        check_rest_pair(page, own, other)
        flights = page.locator("#sdPanel-herkenning .sd-cmp-panel[data-cmp-flight] img")
        paths = flights.evaluate_all("imgs => imgs.map(i => new URL(i.src).pathname)")
        assert not ("/assets/species/plumage/sp002-flight-wingband.webp" in paths and
                    "/assets/species/plumage/sp003-flight-open-sky.webp" in paths), paths
        assert "/assets/species/plumage/sp004-flight.webp" in paths, paths
        if own == "sp003":
            own_flight = page.locator('#sdPanel-herkenning section.sd-flight img')
            expect(own_flight).to_have_count(1)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
        close_sheet(page)
    check_havik_r02c(page)
    for species_id in ("sp004", "sp005", "sp006", "sp007"):
        open_species(page, NAMES[species_id], species_id)
        check_quick(page, species_id)
        # De uitgebreide herkenning en kritische verschillen blijven beschikbaar (niets verwijderd).
        expect(page.locator("#sdPanel-herkenning section.sd-similar")).to_have_count(1)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
        close_sheet(page)


def wait_for_media(page):
    paths = [HEROES["sp002"][0], HEROES["sp003"][0], "/assets/species/plumage/sp004-flight.webp"]
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const responses = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !responses[index]?.ok);
    }""", paths)
    assert not missing, missing


def main():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as runner, runner.chromium.launch() as browser:
            for width in (320, 360, 390):
                with browser.new_context(viewport={"width": width, "height": 844},
                                         service_workers="block", reduced_motion="reduce") as context:
                    page = context.new_page()
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    boot(page, url)
                    smoke(page)
                    print(f"F3-REV2 Chromium {width}px: R01b rest pair both directions, no unequal flight pair; max. 3 quick cues on 6 species; R02c Havik flight photo retired (open, back, reopen)")
            with browser.new_context(viewport={"width": 390, "height": 844},
                                     is_mobile=True, has_touch=True, reduced_motion="reduce") as context:
                page = context.new_page()
                boot(page, url)
                wait_for_media(page)
                page.close()
                context.set_offline(True)
                page = context.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                smoke(page)
                print("F3-REV2 Chromium 390px offline: cached heroes, rest pair, quick panels and R02c Havik card")
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
