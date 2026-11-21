"""F3-R34 comparison routes, neutral flight roles and online/offline audio."""
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, close_sheet
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species

NAMES = {
    "sp092": "Kuifeend", "sp093": "Krooneend", "sp114": "Boerenzwaluw",
    "sp115": "Huiszwaluw", "sp129": "Krakeend", "sp130": "Smient",
    "sp132": "Tafeleend", "sp141": "Gierzwaluw", "sp381": "Vale Gierzwaluw",
}
PAIRS = (
    ("sp130", "sp132", "plumage/sp130-adult-f.webp", "plumage/sp132-adult_f.webp", "Aflopend voorhoofd"),
    ("sp130", "sp129", "plumage/sp130-adult-f.webp", "plumage/sp129-adult_f.webp", "steen"),
    ("sp141", "sp114", "plumage/sp141-flight.webp", "plumage/sp114-flight.webp", "Jonge Boerenzwaluwen"),
    ("sp141", "sp115", "plumage/sp141-flight.webp", "plumage/sp115-flight.webp", "wegdraait"),
)
TEXT_PAIRS = (("sp132", "sp093", "rode snavel"), ("sp141", "sp381", "oogmasker"))
FOCUS = ("sp130", "sp132", "sp141")
SOUNDS = ("/assets/species/audio/sp132-a1.mp3", "/assets/species/audio/sp132-a2.mp3")
SHOTS = ROOT / "tests/screenshots/lookalike_r34"


def open_bird(page, sid):
    open_species(page, NAMES[sid], sid)
    return page.locator("#sdPanel-herkenning")


def check_pictures(panel, paths):
    images = panel.locator(".sd-cmp-who .sd-field-photo img")
    expect(images).to_have_count(2)
    measured = images.evaluate_all("""async items => {
      for (const img of items) { img.loading='eager'; await img.decode(); }
      return items.map(img => {
        const r = img.getBoundingClientRect();
        return {path:new URL(img.src).pathname, left:r.left, right:r.right, width:r.width, y:r.top};
      });
    }""")
    assert [item["path"] for item in measured] == ["/assets/species/" + path for path in paths]
    left, right = measured
    assert right["left"] >= left["right"] - 1 and abs(left["y"] - right["y"]) <= 7, measured
    assert abs(right["width"] - left["width"]) < 7, measured
    assert panel.evaluate("el => el.scrollWidth <= el.clientWidth + 2")


def check_pair(page, own, other, paths, wording, capture):
    open_bird(page, own)
    panel = open_pair(page, other)
    check_pictures(panel, paths)
    expect(panel).to_contain_text(wording)
    expect(panel.locator(".sd-cmp-row")).to_have_count(2)
    if own == "sp141" or other == "sp141":
        expect(panel).to_have_attribute("data-cmp-flight", "")
    if (own, other) == ("sp130", "sp132"):
        check_credit(panel.locator(".photo-info-frame").first, "Daniel106", "CC BY 4.0")
        check_credit(panel.locator(".photo-info-frame").nth(1), "Klamul", "CC BY-SA 4.0")
    panel.locator(".sd-field-photo").first.click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    if capture:
        SHOTS.mkdir(parents=True, exist_ok=True)
        panel.screenshot(path=str(SHOTS / f"{own}-{other}.png"))
    panel.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_pochard_tabs(page, own, other):
    open_bird(page, own)
    panel = open_pair(page, other)
    card = panel.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]")
    expect(card.locator(".sd-cmp-tab")).to_have_count(3)
    for tab, pattern in (("Mannetje", "{sid}.webp"), ("Vrouwtje", "plumage/{sid}-adult_f.webp"),
                         ("In vlucht · Mannetje", "plumage/{sid}-flight.webp")):
        card.get_by_role("button", name=tab, exact=True).click()
        active = card.locator(".sd-cmp-panel:visible")
        check_pictures(active, [pattern.format(sid=sid) for sid in (own, other)])
        if tab == "Vrouwtje":
            tufted_credit = active.locator(".photo-info-frame").nth((own, other).index("sp092"))
            check_credit(tufted_credit, "© Hans Hillewaert", "CC BY-SA 3.0")
    card.locator(".sd-cmp-panel:visible [data-compare-species]").click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_text_pair(page, own, other, wording):
    panel = open_bird(page, own)
    expect(panel.locator(f'.sd-cmp-panel [data-compare-species="{other}"]')).to_have_count(0)
    link = panel.locator(f'.sd-similar [data-compare-species="{other}"]')
    expect(link.locator("xpath=..")).to_contain_text(wording)
    link.click()
    expect(page.locator(f'#sdPanel-herkenning .sd-similar [data-compare-species="{own}"]')).to_be_visible()
    close_sheet(page)


def check_local_media(page, offline):
    for sid in FOCUS:
        panel = open_bird(page, sid)
        photos = panel.locator(".sd-field-photo:not(.sd-similar *) img")
        expect(photos).to_have_count(2 if sid == "sp141" else 3)
        image_urls = photos.evaluate_all("""async images => {
          for (const img of images) { img.loading='eager'; await img.decode(); }
          return images.map(img => img.getAttribute('src'));
        }""")
        hero = page.locator(f"#detailThumb-{sid} img")
        expect(hero).to_be_visible()
        decoded_width = hero.evaluate("img => img.decode().then(() => img.naturalWidth)")
        assert decoded_width > 0 and hero.get_attribute("src") not in image_urls
        assert len(image_urls) == len(set(image_urls))
        if sid == "sp130":
            check_credit(page.locator("#detailThumb-sp130"), "Andreas Trepte, www.avi-fauna.info", "CC BY-SA 2.5")
        if sid == "sp141":
            expect(panel.locator('[data-plumage="adult"] .sd-hero-ref')).to_be_visible()
            expect(panel.locator('[data-plumage="adult_m"]')).to_have_count(0)
            expect(panel.locator("section.sd-flight img")).to_have_count(1)
        if sid == "sp132":
            check_audio(panel, offline)
        else:
            expect(panel.locator("audio")).to_have_count(0)
        close_sheet(page)


def check_audio(panel, offline):
    expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    info = panel.locator(".sd-audio-credits")
    info.locator("summary").press("Enter")
    expect(info.locator(".sd-audio-state", has_text="Niet gecontroleerd")).to_have_count(2)
    expect(info.locator('a[href="https://xeno-canto.org/991857"]')).to_be_visible()
    expect(info.locator('a[href="https://xeno-canto.org/990310"]')).to_be_visible()
    proof = panel.evaluate("""async (el, offline) => {
      const results = [];
      for (const clip of el.querySelectorAll('.sd-audio audio')) {
        clip.muted = true;
        if (offline) {
          const range = await fetch(clip.src, {headers:{Range:'bytes=0-31'}});
          if (range.status !== 206 || (await range.arrayBuffer()).byteLength !== 32) {
            throw new Error('Expected cached 206 byte range');
          }
        }
        await clip.play();
        await new Promise(resolve => setTimeout(resolve, 170));
        results.push(clip.duration > 9 && clip.currentTime > 0 && !clip.error);
        clip.pause();
      }
      return results;
    }""", offline)
    assert proof == [True, True]


def smoke(page, capture=False, offline=False):
    for a, b, left, right, wording in PAIRS:
        check_pair(page, a, b, (left, right), wording, capture)
        check_pair(page, b, a, (right, left), wording, capture)
    check_pochard_tabs(page, "sp092", "sp132")
    check_pochard_tabs(page, "sp132", "sp092")
    for a, b, wording in TEXT_PAIRS:
        check_text_pair(page, a, b, wording)
        check_text_pair(page, b, a, wording)
    check_local_media(page, offline)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")


def check_precache(page):
    path = ROOT / "docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json"
    rows = json.loads(path.read_text(encoding="utf-8"))["records"]
    assets = {slot["path"] for row in rows if row["id"] in FOCUS
              for slot in row["currentAssets"]["imageSlots"]}
    assets.update("/assets/species/" + path for a, b, left, right, text in PAIRS for path in (left, right))
    assets.update("/assets/species/" + path for path in
                  ("sp092.webp", "plumage/sp092-adult_f.webp", "plumage/sp092-flight.webp"))
    assets.update(SOUNDS)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
      const cache = await caches.open('birdspot-media');
      const responses = await Promise.all(paths.map(path => cache.match(path)));
      return paths.filter((path, i) => !responses[i]?.ok);
    }""", sorted(assets))
    assert not missing, f"Fresh install missed R34 media: {missing}"
    print(f"R34 fresh install: {len(assets)} required photos and clips precached.", flush=True)


def main():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch()
            try:
                for width in (320, 360, 390):
                    ctx = browser.new_context(viewport={"width": width, "height": 844},
                                              reduced_motion="reduce", service_workers="block")
                    page = ctx.new_page()
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    boot(page, url)
                    smoke(page, capture=width == 390)
                    ctx.close()
                    print(f"R34 Chromium {width}px: reciprocal pairs, flight roles, attribution and two clip playbacks.", flush=True)
                ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                          has_touch=True, reduced_motion="reduce", service_workers="allow")
                page = ctx.new_page()
                boot(page, url)
                check_precache(page)
                page.close()
                ctx.set_offline(True)
                page = ctx.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                smoke(page, offline=True)
                ctx.close()
                print("R34 Chromium 390px offline: guide and comparisons reopened; both clips played from HTTP 206.", flush=True)
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
