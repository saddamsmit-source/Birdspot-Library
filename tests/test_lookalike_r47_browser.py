"""F3-R47 browser checks for the existing guide photos and wagtail comparison."""

import threading

from playwright.sync_api import expect, sync_playwright

from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, check_geometry, close_sheet
from test_lookalike_r46_browser import AUDIO, close_zoom
from test_pilot_offline_new_sighting import Quiet, Server, boot
from test_plumage_compare_layout import open_species

NAMES = {"sp282": "Roze Spreeuw", "sp288": "Grote Gele Kwikstaart", "sp069": "Gele Kwikstaart"}
HEROES = {
    "sp282": ("/assets/showcase/sp282.webp", "Hari K Patibanda", "CC BY 2.0"),
    "sp288": ("/assets/species/plumage/sp288-adult.webp", "Nikola Veljković", "CC BY-SA 4.0"),
    "sp069": ("/assets/species/sp069.webp", "Stephan Sprinz", "CC BY-SA 4.0"),
}
FLIGHTS = {
    "sp282": ("/assets/species/plumage/sp282-flight.webp", "Kudaibergen Amirekul", "CC BY-SA 4.0"),
    "sp288": ("/assets/species/plumage/sp288-flight.webp", "Jiro Iguchi", "CC BY 4.0"),
}


def check_photos(page, species_id):
    open_species(page, NAMES[species_id], species_id)
    panel = page.locator("#sdPanel-herkenning")
    hero = page.locator(f"#detailThumb-{species_id}")
    flight = panel.locator(".sd-flight .photo-info-frame")
    pictures = panel.locator(".sd-field-photo:not(.sd-similar *) img").or_(hero.locator("img"))
    assets = pictures.evaluate_all("""async images => {
        for (const image of images) { image.loading = 'eager'; await image.decode(); }
        return images.map(image => new URL(image.src).pathname);
    }""")
    assert assets == [HEROES[species_id][0], FLIGHTS[species_id][0]], (species_id, assets)
    expect(flight).to_have_count(1)
    check_credit(hero, *HEROES[species_id][1:])
    check_credit(flight, *FLIGHTS[species_id][1:])
    close_zoom(page, hero.get_by_role("button", name="Vergroot hoofdfoto"))
    close_zoom(page, flight.locator(".sd-field-photo"))
    expect(panel.locator("audio, .sd-audio-credits")).to_have_count(0)
    if species_id == "sp282":
        expect(panel).to_contain_text("snavel")
        expect(panel.locator('.sd-cmp-panel:has([data-compare-species="sp112"])')).to_have_count(0)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2")
    close_sheet(page)


def check_wagtails(page, own, other):
    open_species(page, NAMES[own], own)
    pair = open_pair(page, other)
    assert pair.get_attribute("data-cmp-flight") is None
    check_geometry(pair, [HEROES[side][0] for side in (own, other)])
    for index, side in enumerate((own, other)):
        check_credit(pair.locator(".photo-info-frame").nth(index), *HEROES[side][1:])
    expect(pair).to_contain_text("Grijze mantel")
    expect(pair).to_contain_text("donkere poten")
    close_zoom(page, pair.locator(".sd-field-photo").first)
    pair.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)
    expect(page.locator("#speciesSearch")).to_be_visible()


def smoke(page):
    for species_id in FLIGHTS:
        check_photos(page, species_id)
    check_wagtails(page, "sp288", "sp069")
    check_wagtails(page, "sp069", "sp288")


def wait_for_media(page):
    paths = [asset[0] for asset in (*HEROES.values(), *FLIGHTS.values())]
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const responses = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !responses[index]?.ok);
    }""", paths)
    assert not missing, missing


def main():
    assert all(not AUDIO.get(species_id) for species_id in FLIGHTS)
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
                    print(f"F3-R47 Chromium {width}px: four photos, credits, no empty audio, two comparison directions")
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
                print("F3-R47 Chromium 390px offline: first-install cache, reopen and both species")
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
