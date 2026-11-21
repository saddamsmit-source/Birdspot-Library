"""F3-R35: both directions, mobile widths, source credits and offline playback."""
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_credit, close_sheet
from test_lookalike_r34_browser import check_pictures
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species

NAMES = {
    "sp098": "Scholekster", "sp099": "Kievit", "sp143": "Kluut",
    "sp144": "Zilverplevier", "sp145": "Goudplevier", "sp205": "Steltkluut",
}
FOCUS = ("sp143", "sp144", "sp145")
REGISTER = ROOT / "docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json"
ROWS = {row["id"]: row["currentAssets"] for row in json.loads(REGISTER.read_text())["records"]
        if row["id"] in FOCUS}
MEDIA = json.loads((ROOT / "assets/species/field-guide-media.json").read_text())["audio"]
SHOTS = ROOT / "tests/screenshots/lookalike_r35"


def open_bird(page, sid):
    open_species(page, NAMES[sid], sid)
    return page.locator("#sdPanel-herkenning")


def zoom(page, panel):
    button = panel.locator(".sd-cmp-who .sd-field-photo").first
    button.click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)


def open_partner(page, panel, other):
    panel.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_plovers(page, own, other, capture):
    open_bird(page, own)
    first = open_pair(page, other)
    card = first.locator("xpath=ancestor::div[contains(@class,'sd-cmp-card')]")
    expect(card.locator(".sd-cmp-tab")).to_have_count(3)
    for title, template in (("Broedkleed", "{sid}.webp"),
                            ("Winterkleed", "plumage/{sid}-winter.webp"),
                            ("Juveniel", "plumage/{sid}-juv.webp")):
        tab = card.get_by_role("button", name=title, exact=True)
        tab.click()
        expect(tab).to_have_attribute("aria-selected", "true")
        active = card.locator(".sd-cmp-panel:visible")
        expect(active.locator(".sd-cmp-row")).to_have_count(2)
        expect(card.locator("[data-cmp-flight]")).to_have_count(0)
        check_pictures(active, [template.format(sid=sid) for sid in (own, other)])
        if title == "Broedkleed":
            check_credit(active.locator(".photo-info-frame").nth((own, other).index("sp144")),
                         "William Stephens", "CC BY 4.0")
            zoom(page, active)
        elif title == "Winterkleed":
            expect(active).to_contain_text("Zilverplevier zwarte oksels en Goudplevier lichte oksels")
        else:
            expect(active).to_contain_text("Gele spikkels komen bij beide voor")
        if capture:
            SHOTS.mkdir(parents=True, exist_ok=True)
            active.screenshot(path=str(SHOTS / f"{own}-{other}-{title}.png"))
    open_partner(page, card.locator(".sd-cmp-panel:visible"), other)


def check_pair(page, own, other, paths):
    open_bird(page, own)
    panel = open_pair(page, other)
    check_pictures(panel, paths)
    if "sp099" in (own, other):
        check_credit(panel.locator(".photo-info-frame").nth((own, other).index("sp099")),
                     "Andreas Trepte, www.avi-fauna.info", "CC BY-SA 2.5")
    else:
        expect(panel).to_contain_text("Dun, donker en omhooggebogen")
    zoom(page, panel)
    open_partner(page, panel, other)


def check_stilt(page):
    for own, other in (("sp143", "sp205"), ("sp205", "sp143")):
        recognition = open_bird(page, own)
        expect(recognition.locator(f'.sd-cmp-panel [data-compare-species="{other}"]')).to_have_count(0)
        link = recognition.locator(f'.sd-similar [data-compare-species="{other}"]')
        expect(link.locator("xpath=..")).to_contain_text("uitzonderlijk lange rozerode poten")
        link.click()
        expect(page.locator(f'#sdPanel-herkenning .sd-similar [data-compare-species="{own}"]')).to_be_visible()
        close_sheet(page)


def check_audio(panel, clips, offline):
    expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    credits = panel.locator(".sd-audio-credits")
    credits.locator("summary").press("Enter")
    expect(credits.locator(".sd-audio-state", has_text="Gedeeltelijk gecontroleerd")).to_have_count(len(clips))
    for clip in clips:
        expect(credits.locator(f'a[href="{clip["source"]}"]')).to_be_visible()
    playback = panel.evaluate("""async (el, offline) => {
      const results = [];
      for (const clip of el.querySelectorAll('.sd-audio audio')) {
        clip.muted = true;
        if (offline) {
          const range = await fetch(clip.src, {headers:{Range:'bytes=0-31'}});
          if (range.status !== 206 || (await range.arrayBuffer()).byteLength !== 32) {
            throw new Error('Expected cached HTTP 206 byte range');
          }
        }
        await clip.play();
        await new Promise(resolve => setTimeout(resolve, 170));
        results.push({path:new URL(clip.src).pathname, playing:clip.duration > 4 && clip.currentTime > 0 && !clip.error});
        clip.pause();
      }
      return results;
    }""", offline)
    assert playback == [{"path": clip["audio"], "playing": True} for clip in clips], playback


def check_own_media(page, offline):
    for sid in FOCUS:
        panel = open_bird(page, sid)
        images = panel.locator(".sd-field-photo:not(.sd-similar *) img")
        paths = images.evaluate_all("""async list => {
          for (const img of list) { img.loading='eager'; await img.decode(); }
          return list.map(img => new URL(img.src).pathname);
        }""")
        hero = page.locator(f"#detailThumb-{sid} img")
        decoded_width = hero.evaluate("img => img.decode().then(() => img.naturalWidth)")
        assert decoded_width > 0
        paths.insert(0, hero.evaluate("img => new URL(img.src).pathname"))
        assert len(paths) == len(set(paths))
        assert set(paths) == {slot["path"] for slot in ROWS[sid]["imageSlots"]}
        flight = panel.locator("section.sd-flight")
        expect(flight.locator("img")).to_have_count(1)
        if sid == "sp143":
            expect(panel.locator("audio, .sd-audio-credits")).to_have_count(0)
        else:
            check_audio(panel, MEDIA[sid], offline)
        close_sheet(page)


def smoke(page, capture=False, offline=False):
    check_plovers(page, "sp144", "sp145", capture)
    check_plovers(page, "sp145", "sp144", capture)
    for a, b, left, right in (("sp143", "sp098", "sp143-hero-review.webp", "sp098.webp"),
                             ("sp144", "sp099", "sp144.webp", "plumage/sp099-adult_m.webp")):
        check_pair(page, a, b, (left, right))
        check_pair(page, b, a, (right, left))
    check_stilt(page)
    check_own_media(page, offline)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")


def check_precache(page):
    assets = {slot["path"] for row in ROWS.values() for slot in row["imageSlots"]}
    assets.update(path for row in ROWS.values() for path in row["existingAudioPaths"])
    assets.update(("/assets/species/sp098.webp", "/assets/species/plumage/sp099-adult_m.webp"))
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
      const cache = await caches.open('birdspot-media');
      const responses = await Promise.all(paths.map(path => cache.match(path)));
      return paths.filter((path, i) => !responses[i]?.ok);
    }""", sorted(assets))
    assert not missing, f"Fresh install missed R35 assets: {missing}"
    print(f"R35 fresh install: {len(assets)} photo and audio files in the media cache.")


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
                    try:
                        page = ctx.new_page()
                        page.on("pageerror", lambda error: errors.append(str(error)))
                        boot(page, url)
                        smoke(page, capture=width == 390)
                        print(f"R35 Chromium {width}px: roles, reciprocal pairs, zoom, credits and six clip playbacks.")
                    finally:
                        ctx.close()
                ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                          has_touch=True, reduced_motion="reduce", service_workers="allow")
                try:
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
                    print("R35 Chromium 390px offline: guide reopened, photos decoded and six clips played from HTTP 206.")
                finally:
                    ctx.close()
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
