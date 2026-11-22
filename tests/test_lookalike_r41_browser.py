"""F3-R41 mobile guide and offline media regression in Chromium."""
import json
import re
import threading

from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import close_sheet, check_credit
from test_lookalike_r34_browser import check_pictures
from test_lookalike_r38_browser import check_audio
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species

NAMES = {
    "sp167": "Grote Stern", "sp170": "Ooievaar", "sp173": "Bruine Kiekendief",
    "sp165": "Visdief", "sp241": "Zwarte Ooievaar", "sp142": "Kraanvogel",
    "sp249": "Blauwe Kiekendief",
}
FOCUS = ("sp167", "sp170", "sp173")
ROWS = {row["id"]: row for row in json.loads(
    (ROOT / "docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text()
)["records"] if row["id"] in FOCUS}
AUDIO = json.loads((ROOT / "assets/species/field-guide-media.json").read_text())["audio"]
HERO_CREDITS = {
    "sp167": ("Andreas Trepte", "CC BY-SA 2.5"),
    "sp170": ("Carlos Delgado", "CC BY-SA 3.0"),
    "sp173": ("Stephan Sprinz", "CC BY 4.0"),
}
ADULT_PAIRS = (
    ("plumage/sp173-male-2.webp", "sp249.webp"),
    ("plumage/sp173-adult_f.webp", "plumage/sp249-adult_f.webp"),
)
SHOTS = ROOT / "tests/screenshots/lookalike_r41"


def open_bird(page, species_id):
    open_species(page, NAMES[species_id], species_id)
    return page.locator("#sdPanel-herkenning")


def check_own(page, species_id, capture, offline):
    panel = open_bird(page, species_id)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"), species_id
    pictures = panel.locator(".sd-field-photo:not(.sd-similar *) img")
    paths = pictures.evaluate_all("""async images => {
        for (const image of images) {
            image.loading = 'eager';
            await image.decode();
            if (!image.naturalWidth) throw new Error('Guide photo did not decode');
        }
        return images.map(image => new URL(image.src).pathname);
    }""")
    hero = page.locator(f"#detailThumb-{species_id}")
    thumb = hero.locator("img")
    assert thumb.evaluate("image => image.decode().then(() => image.naturalWidth)") > 0
    paths.append(thumb.evaluate("image => new URL(image.src).pathname"))
    expected = [slot["path"] for slot in ROWS[species_id]["currentAssets"]["imageSlots"]]
    assert set(paths) == set(expected) and len(paths) == len(expected), (species_id, paths, expected)

    check_credit(hero, *HERO_CREDITS[species_id])
    hero.get_by_role("button", name="Vergroot hoofdfoto").click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    if species_id == "sp173":
        expect(panel.locator("section.sd-flight img[src$='sp173-juv.webp']")).to_have_count(0)
        juvenile = panel.locator(".photo-info-frame:has(img[src$='sp173-juv.webp'])")
        check_credit(juvenile, "Codrin Bucur", "CC BY 4.0")
    check_audio(panel, AUDIO.get(species_id, []), offline)
    if species_id == "sp173":
        expect(panel.locator(".sd-audio-credits")).to_contain_text("Sternanita2")
        expect(panel.locator(".sd-audio-credits").get_by_role("link", name="CC BY-SA 4.0")).to_be_visible()
    if capture:
        SHOTS.mkdir(parents=True, exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(path=str(SHOTS / f"{species_id}_390.png"))
    close_sheet(page)


def check_harrier_pair(page, own, partner):
    open_bird(page, own)
    panel = open_pair(page, partner)
    card = panel.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]").first
    expect(card.locator(".sd-cmp-panel")).to_have_count(2)
    expect(card.locator("img[src$='sp173-juv.webp'],img[src$='sp249-juv.webp']")).to_have_count(0)
    for index, paths in enumerate(ADULT_PAIRS):
        name = re.compile("Mannetje" if index == 0 else "Vrouwtje", re.I)
        card.locator("[data-cmp-tab]").filter(has_text=name).click()
        active = card.locator(".sd-cmp-panel:not([hidden])")
        expect(active).to_have_attribute("data-cmp-flight", "")
        check_pictures(active, paths if own == "sp173" else paths[::-1])
        assert active.evaluate("node => node.scrollWidth <= node.clientWidth + 2")
    expect(active).to_contain_text("jonge vogels")
    active.locator(f'[data-compare-species="{partner}"]').click()
    expect(page.locator(f"#detailThumb-{partner}")).to_be_visible()
    close_sheet(page)


def check_text_pair(page, own, partner, clue):
    panel = open_bird(page, own)
    expect(panel.locator(f'.sd-cmp-panel [data-compare-species="{partner}"]')).to_have_count(0)
    link = panel.locator(f'.sd-similar [data-compare-species="{partner}"]')
    expect(link).to_be_visible()
    expect(link.locator("xpath=..")).to_contain_text(clue)
    link.click()
    expect(page.locator(f"#detailThumb-{partner}")).to_be_visible()
    close_sheet(page)


def smoke(page, capture=False, offline=False):
    for species_id in FOCUS:
        check_own(page, species_id, capture, offline)
    check_harrier_pair(page, "sp173", "sp249")
    check_harrier_pair(page, "sp249", "sp173")
    for a, b, clue in (
        ("sp167", "sp165", "gele punt"),
        ("sp170", "sp241", "hals"),
        ("sp170", "sp142", "trompetgeluid"),
    ):
        check_text_pair(page, a, b, clue)
        check_text_pair(page, b, a, clue)


def check_precache(page):
    paths = {slot["path"] for row in ROWS.values() for slot in row["currentAssets"]["imageSlots"]}
    paths.update("/assets/species/" + path for pair in ADULT_PAIRS for path in pair)
    paths.update(clip["audio"] for clip in AUDIO["sp173"])
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache = await caches.open('birdspot-media');
        const entries = await Promise.all(paths.map(path => cache.match(path)));
        return paths.filter((_, i) => !entries[i]?.ok);
    }""", sorted(paths))
    assert not missing, missing
    print(f"R41 fresh cache: {len(paths)} verified photo and audio responses", flush=True)


def main():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as runner:
            browser = runner.chromium.launch()
            try:
                for width in (320, 360, 390):
                    context = browser.new_context(viewport={"width": width, "height": 844},
                                                  reduced_motion="reduce", service_workers="block")
                    try:
                        page = context.new_page()
                        page.on("pageerror", lambda err: errors.append(str(err)))
                        boot(page, url)
                        smoke(page, capture=width == 390)
                        print(f"R41 Chromium {width}px: photos, credits, zoom, pairs and audio PASS", flush=True)
                    finally:
                        context.close()
                context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                              has_touch=True, reduced_motion="reduce", service_workers="allow")
                try:
                    page = context.new_page()
                    boot(page, url)
                    check_precache(page)
                    page.close()
                    context.set_offline(True)
                    page = context.new_page()
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    boot(page, url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page, offline=True)
                    print("R41 Chromium 390px OFFLINE: actual photos, pairs and MP3 HTTP 206 playback PASS", flush=True)
                finally:
                    context.close()
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
