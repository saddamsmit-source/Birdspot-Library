"""F3-R44 Chromium checks for displayed photos, audio and two-way comparisons."""

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
    "sp206": "Strandplevier", "sp217": "Poelruiter", "sp225": "Zwartkopmeeuw",
    "sp146": "Bontbekplevier", "sp147": "Kleine Plevier",
    "sp158": "Groenpootruiter", "sp097": "Kokmeeuw",
}
HERO_CREDITS = {
    "sp206": ("Sylvain Montagner", "CC BY 4.0"),
    "sp217": ("Вячеслав Юсупов", "CC BY 4.0"),
    "sp225": ("MPF", "CC BY-SA 4.0"),
}
PAIRS = (
    ("sp206", "sp146", (
        ("plumage/sp206-winter.webp", "plumage/sp146-winter.webp"),
        ("plumage/sp206-juv.webp", "plumage/sp146-juv.webp"),
    )),
    ("sp206", "sp147", (("sp206.webp", "sp147.webp"),)),
    ("sp217", "sp158", (
        ("sp217.webp", "sp158.webp"),
        ("plumage/sp217-winter.webp", "plumage/sp158-winter.webp"),
        ("plumage/sp217-juv.webp", "plumage/sp158-juv.webp"),
    )),
    ("sp225", "sp097", (("sp225.webp", "sp097.webp"),)),
)
PHOTO_NAMES = {
    "sp206": ("sp206.webp", "plumage/sp206-adult_f.webp", "plumage/sp206-juv.webp",
              "plumage/sp206-winter.webp", "plumage/sp206-flight.webp"),
    "sp217": ("sp217.webp", "plumage/sp217-juv.webp", "plumage/sp217-winter.webp",
              "plumage/sp217-flight.webp"),
    "sp225": ("sp225.webp", "plumage/sp225-winter.webp", "plumage/sp225-flight.webp"),
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
    expect(panel.locator(f"section.sd-flight img[src$='{species_id}-flight.webp']")).to_have_count(1)
    if AUDIO.get(species_id):
        expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    check_audio(panel, AUDIO.get(species_id, []), offline)
    close_sheet(page)


def check_pair(page, own, partner, expected):
    open_recognition(page, own)
    start_panel = open_pair(page, partner)
    card = start_panel.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]").first
    expect(card.locator(".sd-cmp-panel")).to_have_count(len(expected))
    tabs = card.locator("[data-cmp-tab]")
    if len(expected) > 1:
        expect(tabs).to_have_count(len(expected))
    active = card.locator(".sd-cmp-panel:not([hidden])")
    for index, paths in enumerate(expected):
        if len(expected) > 1:
            tabs.nth(index).click()
        expect(active).to_have_count(1)
        check_pictures(active, paths)
        row_count = 1 if paths in (("sp217.webp", "sp158.webp"), ("sp158.webp", "sp217.webp")) else (
            3 if {own, partner} == {"sp225", "sp097"} else 2
        )
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
    for own, partner, expected in PAIRS:
        check_pair(page, own, partner, expected)
        check_pair(page, partner, own, tuple(paths[::-1] for paths in expected))


def assert_precache(page):
    assets = set().union(*OWN_PHOTOS.values())
    assets.update(clip["audio"] for key in HERO_CREDITS for clip in AUDIO.get(key, []))
    assets.update("/assets/species/" + path for _, _, pair in PAIRS for paths in pair for path in paths)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const found = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !found[index]?.ok);
    }""", sorted(assets))
    assert not missing, missing
    print(f"F3-R44: {len(assets)} photo/audio responses pre-cached in a fresh profile", flush=True)


def main():
    assert [len(AUDIO.get(key, [])) for key in HERO_CREDITS] == [4, 2, 0]
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
                    print(f"F3-R44 Chromium {width}px: twelve own photos, 4/2/0 audio, credits, zoom and eight comparison directions", flush=True)
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
                print("F3-R44 Chromium 390px offline: reopen, photos, all comparison tabs and six playable MP3 byte ranges", flush=True)
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
