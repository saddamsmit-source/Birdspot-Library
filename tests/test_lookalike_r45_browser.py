"""F3-R45 Chromium checks for displayed photos, audio and two-way comparisons."""

import json
import threading

from playwright.sync_api import expect, sync_playwright

from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, close_sheet
from test_lookalike_r34_browser import check_pictures
from test_lookalike_r38_browser import check_audio
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

NAMES = {
    "sp245": "Koereiger", "sp249": "Blauwe Kiekendief", "sp250": "Steppekiekendief",
    "sp082": "Kleine Zilverreiger", "sp083": "Grote Zilverreiger",
    "sp173": "Bruine Kiekendief", "sp251": "Grauwe Kiekendief",
}
HERO_CREDITS = {
    "sp245": ("Bernard DUPONT from FRANCE", "CC BY-SA 2.0"),
    "sp249": ("Maurice.dekens", "CC BY-SA 4.0"),
    "sp250": ("Luiz Lapa from Oeiras, Portugal", "CC BY 2.0"),
}
# Per tab: exact own and partner photo, number of visible comparison rows.
PAIRS = (
    ("sp245", "sp082", False, (
        ("plumage/sp245-winter.webp", "plumage/sp082-winter.webp", 2),
        ("plumage/sp245-juv.webp", "plumage/sp082-juv.webp", 2),
    )),
    ("sp245", "sp083", False, (("plumage/sp245-winter.webp", "sp083.webp", 2),)),
    ("sp249", "sp250", True, (
        ("sp249.webp", "sp250.webp", 2),
        ("plumage/sp249-adult_f.webp", "plumage/sp250-adult_f.webp", 2),
        ("plumage/sp249-juv.webp", "plumage/sp250-juv.webp", 2),
    )),
    ("sp249", "sp173", True, (
        ("sp249.webp", "plumage/sp173-male-2.webp", 2),
        ("plumage/sp249-adult_f.webp", "plumage/sp173-adult_f.webp", 3),
    )),
    ("sp250", "sp251", True, (("sp250.webp", "sp251.webp", 2),)),
)
PHOTO_NAMES = {
    "sp245": ("sp245.webp", "plumage/sp245-juv.webp", "plumage/sp245-breeding.webp",
              "plumage/sp245-winter.webp", "plumage/sp245-flight.webp"),
    "sp249": ("plumage/sp249-hero-male.webp", "plumage/sp249-male-rest.webp", "sp249.webp",
              "plumage/sp249-adult_f.webp", "plumage/sp249-juv.webp"),
    "sp250": ("plumage/sp250-hero-male.webp", "plumage/sp250-male-rest.webp", "sp250.webp",
              "plumage/sp250-adult_f.webp", "plumage/sp250-juv.webp"),
}
OWN_PHOTOS = {
    species_id: {"/assets/species/" + name for name in names}
    for species_id, names in PHOTO_NAMES.items()
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
    flight_photo = "sp245-flight.webp" if species_id == "sp245" else f"{species_id}.webp"
    expect(panel.locator(f"section.sd-flight img[src$='{flight_photo}']")).to_have_count(1)
    if AUDIO.get(species_id):
        expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    check_audio(panel, AUDIO.get(species_id, []), offline)
    close_sheet(page)


def check_pair(page, own, partner, in_flight, expected):
    open_recognition(page, own)
    start_panel = open_pair(page, partner)
    card = start_panel.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]").first
    expect(card.locator(".sd-cmp-panel")).to_have_count(len(expected))
    tabs = card.locator("[data-cmp-tab]")
    if len(expected) > 1:
        expect(tabs).to_have_count(len(expected))
    active = card.locator(".sd-cmp-panel:not([hidden])")
    for index, (own_path, partner_path, row_count) in enumerate(expected):
        if len(expected) > 1:
            tabs.nth(index).click()
        expect(active).to_have_count(1)
        check_pictures(active, (own_path, partner_path))
        assert (active.get_attribute("data-cmp-flight") is not None) == in_flight
        expect(active.locator(".sd-cmp-row")).to_have_count(row_count)
        close_zoom(page, active.locator(".sd-cmp-who .sd-field-photo").first)
        expect(active).to_be_visible()
    active.locator(f'[data-compare-species="{partner}"]').click()
    expect(page.locator(f"#detailThumb-{partner}")).to_be_visible()
    close_sheet(page)
    expect(page.locator("#speciesSearch")).to_be_visible()


def smoke(page, offline=False):
    for species_id in HERO_CREDITS:
        check_own_card(page, species_id, offline)
    for own, partner, in_flight, expected in PAIRS:
        check_pair(page, own, partner, in_flight, expected)
        check_pair(page, partner, own, in_flight, tuple((b, a, n) for a, b, n in expected))
    panel = open_recognition(page, "sp249")
    target = '[data-compare-species="sp251"]'
    expect(panel.locator(f".sd-cmp-panel {target}")).to_have_count(0)
    link = panel.locator(f".sd-similar {target}")
    expect(link).to_be_visible()
    link.click()
    expect(page.locator("#detailThumb-sp251")).to_be_visible()
    close_sheet(page)


def assert_precache(page):
    assets = set().union(*OWN_PHOTOS.values())
    assets.update(clip["audio"] for key in HERO_CREDITS for clip in AUDIO.get(key, []))
    assets.update("/assets/species/" + path for _, _, _, pair in PAIRS for a, b, _ in pair for path in (a, b))
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const found = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !found[index]?.ok);
    }""", sorted(assets))
    assert not missing, missing
    print(f"F3-R45: {len(assets)} photo/audio responses pre-cached in a fresh profile", flush=True)


def main():
    assert [len(AUDIO.get(key, [])) for key in HERO_CREDITS] == [3, 1, 0]
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
                    print(f"F3-R45 Chromium {width}px: fifteen own photos, 3/1/0 audio, credits, zoom, ten comparison directions and text fallback", flush=True)
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
                print("F3-R45 Chromium 390px offline: reopen, photos, all comparison tabs and four playable MP3 byte ranges", flush=True)
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
