"""Chromium checks for the three F3-R31 cards and their source-backed comparisons."""
import threading

from playwright.sync_api import expect, sync_playwright
from test_lookalike_r20_browser import open_pair
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SHOTS = ROOT / "tests/screenshots/lookalike_r31"
SWALLOWS = (("Boerenzwaluw", "sp114", "sp115"), ("Huiszwaluw", "sp115", "sp114"))
PHOTO_SUFFIXES = (
    ("Volwassen", "-hero-male.webp", "-hero-adult.webp"),
    ("Juveniel", "-juv.webp", "-juv.webp"),
    ("In vlucht", "-flight.webp", "-flight.webp"),
)


def close_sheet(page):
    page.locator(".signature-species-detail-close").click()
    expect(page.locator(".signature-species-detail-overlay")).to_have_count(0)


def assert_text_pair(panel, other):
    selector = f'[data-compare-species="{other}"]'
    expect(panel.locator(f".sd-cmp-panel {selector}")).to_have_count(0)
    expect(panel.locator(selector)).to_be_visible()


def assert_no_audio(panel):
    expect(panel.locator("audio, .sd-audio-credits")).to_have_count(0)


def assert_author_and_source(frame, author):
    info = frame.locator("details.photo-info")
    expect(info.locator("summary")).to_be_visible()
    info.locator("summary").click()
    expect(info.locator(".photo-info__panel")).to_contain_text(author)
    expect(info.get_by_role("link", name="Open fotobron")).to_be_visible()
    expect(info.get_by_role("link", name="CC BY", exact=False)).to_be_visible()
    info.locator("summary").click()


def check_swallow(page, case, width, capture):
    name, bird, other = case
    open_species(page, name, bird)
    recognition = page.locator("#sdPanel-herkenning")
    assert_no_audio(recognition)
    if bird == "sp115":
        sand_martin = open_pair(page, "sp116")
        expect(sand_martin).to_have_attribute("data-cmp-flight", "")
        expect(sand_martin).to_contain_text("vaag grijs getekend")
    visible = open_pair(page, other)
    card = visible.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]")
    expect(card.locator(".sd-cmp-tab")).to_have_count(3)

    for label, swallow, martin in PHOTO_SUFFIXES:
        card.get_by_role("button", name=label, exact=True).click()
        panel = card.locator(".sd-cmp-panel:visible")
        expect(panel).to_have_count(1)
        for title in panel.locator(".sd-cmp-who small").all_inner_texts():
            assert " en " not in title, (name, label, title)
        photos = panel.locator(".sd-cmp-who .sd-field-photo img").evaluate_all("""async imgs => {
            for (const img of imgs) { img.loading = 'eager'; await img.decode(); }
            return imgs.map(img => {
                const box = img.getBoundingClientRect();
                return {path: new URL(img.src).pathname, width: box.width, left: box.left,
                        top: box.top, right: box.right, decoded: img.naturalWidth > 0};
            });
        }""")
        expected = ["/assets/species/plumage/sp114" + swallow, "/assets/species/plumage/sp115" + martin]
        if bird == "sp115":
            expected.reverse()
        assert [photo["path"] for photo in photos] == expected, (name, label, photos)
        left, right = photos
        assert left["decoded"] and right["decoded"]
        assert right["left"] >= left["right"] - 1 and abs(left["top"] - right["top"]) <= 7, photos
        assert abs(left["width"] - right["width"]) <= 7, photos
        assert panel.evaluate("el => el.scrollWidth <= el.clientWidth + 2"), (name, label, width)
        expect(panel.locator(".sd-cmp-row")).to_have_count(3 if label == "In vlucht" else 2)
        if label == "In vlucht":
            expect(panel).to_have_attribute("data-cmp-flight", "")
            expect(panel).to_contain_text("Opvallend wit")
        if label == "Volwassen":
            expect(panel.locator(".sd-cmp-who small").nth(1 if bird == "sp114" else 0)).to_have_text("Volwassen")
            assert_author_and_source(panel.locator(".photo-info-frame").first, "SteveM4560")
            panel.locator(".sd-field-photo").first.click()
            viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
            expect(viewer).to_be_visible()
            page.keyboard.press("Escape")
            expect(viewer).to_have_count(0)
            expect(panel).to_be_visible()
        if capture:
            SHOTS.mkdir(parents=True, exist_ok=True)
            panel.screenshot(path=str(SHOTS / f"{bird}-{label.lower().replace(' ', '-')}.png"))

    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")
    close_sheet(page)


def check_oriole(page):
    open_species(page, "Wielewaal", "sp113")
    panel = page.locator("#sdPanel-herkenning")
    assert_no_audio(panel)
    assert_text_pair(panel, "sp019")
    expect(panel).to_contain_text("fijn gestreept")
    expect(panel.locator("section.sd-flight img[src$='sp113-flight.webp']")).to_have_count(1)
    expect(panel.locator("img[src$='sp113-flight.webp']")).to_have_count(1)
    hero = page.locator("#detailThumb-sp113")
    expect(hero.locator("img[src$='/assets/showcase/sp113.webp']")).to_be_visible()
    assert_author_and_source(hero, "dog_funtom")
    close_sheet(page)


def check_offline(browser, url, errors):
    context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                  has_touch=True, reduced_motion="reduce", service_workers="allow")
    page = context.new_page()
    boot(page, url)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    page.close()
    context.set_offline(True)
    page = context.new_page()
    page.on("pageerror", lambda error: errors.append(f"offline: {error}"))
    boot(page, url)
    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
    for case in SWALLOWS:
        check_swallow(page, case, 390, capture=False)
    check_oriole(page)
    context.close()
    print("R31 Chromium 390 px offline: reopened and decoded comparisons and guide photos.", flush=True)


def main():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            try:
                for width in (320, 360, 390):
                    context = browser.new_context(viewport={"width": width, "height": 844},
                                                  reduced_motion="reduce", service_workers="block")
                    page = context.new_page()
                    page.on("pageerror", lambda error: errors.append(f"{width}px: {error}"))
                    boot(page, url)
                    for case in SWALLOWS:
                        check_swallow(page, case, width, capture=width == 390)
                    check_oriole(page)
                    context.close()
                    print(f"R31 Chromium {width}px: pair roles, layout, credits, zoom and back.", flush=True)
                check_offline(browser, url, errors)
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
