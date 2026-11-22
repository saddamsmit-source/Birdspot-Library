"""F3-R43 Chromium checks for displayed photos, audio and two-way comparisons."""

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
    "sp178": "Gekraagde Roodstaart", "sp187": "Wilde Zwaan", "sp188": "Zomertaling",
    "sp051": "Zwarte Roodstaart", "sp126": "Knobbelzwaan", "sp091": "Wintertaling",
}
HERO_CREDITS = {
    "sp178": ("Jerzy Strzelecki", "CC BY-SA 3.0"),
    "sp187": ("Andrew Lee", "Public domain"),
    "sp188": ("YedidyaPopper", "CC BY 4.0"),
}
PAIRS = (
    ("sp178", "sp051", (
        ("sp178.webp", "plumage/sp051-hero-male.webp"),
        ("plumage/sp178-adult_f.webp", "sp051.webp"),
    )),
    ("sp187", "sp126", (("sp187.webp", "sp126.webp"),)),
    ("sp188", "sp091", (
        ("sp188.webp", "plumage/sp091-adult_m.webp"),
        ("plumage/sp188-adult_f.webp", "plumage/sp091-adult_f.webp"),
        ("plumage/sp188-juv.webp", "plumage/sp091-juv.webp"),
    )),
)
REGISTER = json.loads(
    (ROOT / "docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text()
)
OWN_PHOTOS = {
    row["id"]: {slot["path"] for slot in row["currentAssets"]["imageSlots"]}
    for row in REGISTER["records"] if row["id"] in HERO_CREDITS
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
    if species_id == "sp178":
        expect(panel.locator("section.sd-poses img[src$='sp178-flight.webp']")).to_have_count(1)
        expect(panel.locator("section.sd-flight img[src$='sp178-flight.webp']")).to_have_count(0)
    if species_id == "sp188":
        expect(panel.locator("section.sd-flight [data-plumage='eclipse'] img[src$='sp188-eclipse.webp']")).to_have_count(1)
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
        assert 2 <= active.locator(".sd-cmp-row").count() <= 3, (own, partner, paths)
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
    assets.update(clip["audio"] for clip in AUDIO["sp188"])
    assets.update("/assets/species/" + path for _, _, pair in PAIRS for paths in pair for path in paths)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const found = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, index) => !found[index]?.ok);
    }""", sorted(assets))
    assert not missing, missing
    print(f"F3-R43: {len(assets)} photo/audio responses pre-cached in a fresh profile", flush=True)


def main():
    assert {key: len(photos) for key, photos in OWN_PHOTOS.items()} == {"sp178": 4, "sp187": 1, "sp188": 5}
    assert [len(AUDIO.get(key, [])) for key in HERO_CREDITS] == [0, 0, 3]
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
                    print(f"F3-R43 Chromium {width}px: ten own photos, 0/0/3 audio, credits, zoom and six comparison directions", flush=True)
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
                print("F3-R43 Chromium 390px offline: reopen, photos, all comparison tabs and three playable MP3 byte ranges", flush=True)
        server.shutdown()
    assert not errors, errors


if __name__ == "__main__":
    main()
