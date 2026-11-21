"""R32 role, attribution and navigation checks on fresh Chromium profiles."""
import re
import threading

from playwright.sync_api import expect, sync_playwright
from test_lookalike_r20_browser import open_pair
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SHOTS = ROOT / "tests/screenshots/lookalike_r32"
SWALLOWS = (("Oeverzwaluw", "sp116", "sp115"), ("Huiszwaluw", "sp115", "sp116"))
BUNTINGS = (("Geelgors", "sp117", "sp118"), ("Rietgors", "sp118", "sp117"))


def close_sheet(page):
    page.locator(".signature-species-detail-close").click()
    expect(page.locator(".signature-species-detail-overlay")).to_have_count(0)


def check_geometry(panel, expected_paths):
    pictures = panel.locator(".sd-cmp-who .sd-field-photo img")
    expect(pictures).to_have_count(2)
    measured = pictures.evaluate_all("""async imgs => {
      for (const img of imgs) { img.loading = 'eager'; await img.decode(); }
      return imgs.map(img => {
        const r = img.getBoundingClientRect();
        return {path: new URL(img.src).pathname, x:r.left, right:r.right, y:r.top,
          width:r.width, decoded:img.naturalWidth>0};
      });
    }""")
    assert [item["path"] for item in measured] == expected_paths, measured
    left, right = measured
    assert left["decoded"] and right["decoded"]
    assert right["x"] >= left["right"] - 1 and abs(left["y"] - right["y"]) <= 7, measured
    assert abs(left["width"] - right["width"]) < 7, measured
    assert panel.evaluate("el => el.scrollWidth <= el.clientWidth + 2")
    expect(panel.locator(".sd-cmp-row")).to_have_count(2)


def check_credit(frame, maker, license_name):
    info = frame.locator("details.photo-info")
    info.locator("summary").click()
    expect(info.locator(".photo-info__panel")).to_contain_text(maker)
    expect(info.get_by_role("link", name=license_name, exact=True)).to_be_visible()
    expect(info.get_by_role("link", name="Open fotobron")).to_be_visible()
    expect(info.locator(".photo-info__panel")).to_contain_text("Bewerking")
    info.locator("summary").click()


def screenshot(panel, name):
    SHOTS.mkdir(parents=True, exist_ok=True)
    panel.screenshot(path=str(SHOTS / f"{name}.png"))


def check_swallow(page, case, capture):
    name, sid, other = case
    open_species(page, name, sid)
    recognition = page.locator("#sdPanel-herkenning")
    expect(recognition.locator("audio, .sd-audio-credits")).to_have_count(0)
    if sid == "sp116":
        expect(page.locator("#detailThumb-sp116 img[src$='sp116-flight.webp']")).to_be_visible()
        expect(recognition.locator("section.sd-flight img[src$='sp116-flight.webp']")).to_have_count(0)
        expect(recognition.locator("section.sd-poses img[src$='sp116-nestwand.webp']")).to_have_count(1)
    panel = open_pair(page, other)
    expect(panel).to_have_attribute("data-cmp-flight", "")
    paths = [f"/assets/species/plumage/{item}-flight.webp" for item in (sid, other)]
    check_geometry(panel, paths)
    expect(panel).to_contain_text("vaag grijs getekend")
    expect(panel).to_contain_text("witte stuit")
    credits = {"sp116": "Joe M. Devereux", "sp115": "Billy Lindblom"}
    for index, item in enumerate((sid, other)):
        check_credit(panel.locator(".photo-info-frame").nth(index), credits[item], "CC BY 2.0")
    panel.locator(".sd-field-photo").first.click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    if capture:
        screenshot(panel, f"{sid}-{other}-vlucht")
    panel.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_bunting(page, case, capture):
    name, sid, other = case
    open_species(page, name, sid)
    recognition = page.locator("#sdPanel-herkenning")
    expect(recognition.locator("audio, .sd-audio-credits")).to_have_count(0)
    if sid == "sp118":
        expect(page.locator("#detailThumb-sp118 img")).to_have_attribute("alt", re.compile("winterkleed"))
        expect(recognition.locator("img[src$='sp118-flight.webp']")).to_have_count(0)
    panel = open_pair(page, other)
    card = panel.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]")
    expect(card.locator(".sd-cmp-tab")).to_have_count(2)
    check_geometry(panel, [f"/assets/species/{item}.webp" for item in (sid, other)])
    expect(panel).to_contain_text("winterkleed")
    if capture:
        screenshot(panel, f"{sid}-{other}-man")
    card.get_by_role("button", name="Vrouwtje", exact=True).click()
    female = card.locator(".sd-cmp-panel:visible")
    check_geometry(female, [f"/assets/species/plumage/{item}-adult_f.webp" for item in (sid, other)])
    expect(female).to_contain_text("wenkbrauw")
    if capture:
        screenshot(female, f"{sid}-{other}-vrouw")
    close_sheet(page)


def smoke(page, width, capture):
    for case in SWALLOWS:
        check_swallow(page, case, capture)
    for case in BUNTINGS:
        check_bunting(page, case, capture)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"), width


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
    smoke(page, 390, capture=False)
    context.close()
    print("R32 Chromium 390 px offline: cached reopening, paired media and actual partner navigation.", flush=True)


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
                    smoke(page, width, capture=width == 390)
                    context.close()
                    print(f"R32 Chromium {width} px: pair roles, photo credits, zoom and partner navigation.", flush=True)
                check_offline(browser, url, errors)
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
