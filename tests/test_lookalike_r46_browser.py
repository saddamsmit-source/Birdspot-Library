"""F3-R46 Chromium photo, comparison and offline checks."""

import json
import threading

from playwright.sync_api import expect, sync_playwright

from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, close_sheet
from test_lookalike_r38_browser import check_audio
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

NAMES = {
    "sp251": "Grauwe Kiekendief", "sp257": "Bijeneter", "sp262": "Grauwe Klauwier",
    "sp250": "Steppekiekendief", "sp075": "IJsvogel",
    "sp173": "Bruine Kiekendief", "sp249": "Blauwe Kiekendief",
}
HERO_CREDITS = {
    "sp251": ("Hari K Patibanda", "CC BY 2.0"),
    "sp257": ("Charles J. Sharp", "CC BY-SA 4.0"),
    "sp262": ("Бусел В.А.", "CC BY-SA 4.0"),
}
PAIRS = (
    ("sp251", "sp250", True, ("/assets/species/sp251.webp", "/assets/species/sp250.webp"), 2),
    ("sp257", "sp075", False, ("/assets/species/sp257.webp", "/assets/showcase/sp075.webp"), 3),
)
OWN_PHOTOS = {
    "sp251": {
        "/assets/species/plumage/sp251-portrait.webp",
        "/assets/species/plumage/sp251-adult_f.webp",
        "/assets/species/plumage/sp251-juv.webp",
        "/assets/species/sp251.webp",
    },
    "sp257": {"/assets/species/sp257.webp"},
    "sp262": {"/assets/showcase/sp262.webp"},
}
AUDIO = json.loads((ROOT / "assets/species/field-guide-media.json").read_text())["audio"]


def open_recognition(page, species_id):
    open_species(page, NAMES[species_id], species_id)
    return page.locator("#sdPanel-herkenning")


def close_zoom(page, button):
    button.click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)


def check_own_card(page, species_id, offline):
    panel = open_recognition(page, species_id)
    hero = page.locator(f"#detailThumb-{species_id}")
    pictures = panel.locator(".sd-field-photo:not(.sd-similar *) img").or_(hero.locator("img"))
    paths = pictures.evaluate_all("""async images => {
        for (const image of images) {
            image.loading = 'eager';
            await image.decode();
            if (!image.naturalWidth) throw new Error('No decoded photo: ' + image.src);
        }
        return images.map(image => new URL(image.src).pathname);
    }""")
    expected = OWN_PHOTOS[species_id]
    assert set(paths) == expected and len(paths) == len(expected), (species_id, paths, expected)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 2"), species_id

    check_credit(hero, *HERO_CREDITS[species_id])
    close_zoom(page, hero.get_by_role("button", name="Vergroot hoofdfoto"))
    in_flight = panel.locator("section.sd-flight img")
    if species_id == "sp251":
        expect(in_flight).to_have_count(1)
        assert in_flight.evaluate("image => new URL(image.src).pathname") == "/assets/species/sp251.webp"
    else:
        expect(in_flight).to_have_count(0)
    if species_id == "sp262":
        expect(panel.locator(".sd-cmp-panel")).to_have_count(0)
    check_audio(panel, [], offline)
    close_sheet(page)


def check_pair(page, own, partner, in_flight, expected, rows):
    open_recognition(page, own)
    panel = open_pair(page, partner)
    assert (panel.get_attribute("data-cmp-flight") is not None) == in_flight
    expect(panel.locator(".sd-cmp-row")).to_have_count(rows)
    pictures = panel.locator(".sd-cmp-who .sd-field-photo img")
    expect(pictures).to_have_count(2)
    measured = pictures.evaluate_all("""async images => {
        for (const image of images) { image.loading = 'eager'; await image.decode(); }
        return images.map(image => {
            const r = image.getBoundingClientRect();
            return {path: new URL(image.src).pathname, x: r.left, right: r.right, y: r.top, width: r.width};
        });
    }""")
    assert tuple(pic["path"] for pic in measured) == expected, measured
    left, right = measured
    assert right["x"] >= left["right"] - 1 and abs(left["y"] - right["y"]) <= 7, measured
    assert abs(left["width"] - right["width"]) < 7, measured
    assert panel.evaluate("node => node.scrollWidth <= node.clientWidth + 2")
    close_zoom(page, panel.locator(".sd-cmp-who .sd-field-photo").first)
    panel.locator(f'[data-compare-species="{partner}"]').click()
    expect(page.locator(f"#detailThumb-{partner}")).to_be_visible()
    close_sheet(page)
    expect(page.locator("#speciesSearch")).to_be_visible()


def smoke(page, offline=False):
    for species_id in OWN_PHOTOS:
        check_own_card(page, species_id, offline)
    for own, partner, in_flight, paths, rows in PAIRS:
        check_pair(page, own, partner, in_flight, paths, rows)
        check_pair(page, partner, own, in_flight, paths[::-1], rows)
    target = '[data-compare-species="sp251"]'
    for species_id in ("sp249", "sp173"):
        panel = open_recognition(page, species_id)
        expect(panel.locator(f".sd-cmp-panel {target}")).to_have_count(0)
        link = panel.locator(f".sd-similar {target}")
        expect(link).to_be_visible()
        link.click()
        expect(page.locator("#detailThumb-sp251")).to_be_visible()
        close_sheet(page)


def assert_precache(page):
    assets = set().union(*OWN_PHOTOS.values())
    assets.update(path for _, _, _, paths, _ in PAIRS for path in paths)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const found = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !found[index]?.ok);
    }""", sorted(assets))
    assert not missing, missing
    print(f"F3-R46: {len(assets)} photo/audio responses pre-cached in a fresh profile", flush=True)


def main():
    assert all(not AUDIO.get(species_id) for species_id in OWN_PHOTOS)
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
                    print(f"F3-R46 Chromium {width}px: six own photos, credits, zoom, four photo directions, two text links and no empty audio player", flush=True)
            with browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                     has_touch=True, reduced_motion="reduce") as context:
                page = context.new_page()
                boot(page, url)
                assert_precache(page)
                page.close()
                context.set_offline(True)
                page = context.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                smoke(page, offline=True)
                print("F3-R46 Chromium 390px offline: reopen, six own photos, four photo directions and two text links", flush=True)
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
