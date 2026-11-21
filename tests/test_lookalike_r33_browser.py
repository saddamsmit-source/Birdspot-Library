"""Focused comparison, wildlife media and audio regressions for F3-R33."""
import re
import threading

from playwright.sync_api import expect, sync_playwright
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import check_geometry, close_sheet
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SHOTS = ROOT / "tests/screenshots/lookalike_r33"
NAMES = {
    "sp126": "Knobbelzwaan", "sp127": "Kleine Zwaan", "sp128": "Bergeend",
    "sp129": "Krakeend", "sp187": "Wilde Zwaan", "sp089": "Wilde Eend",
    "sp130": "Smient", "sp327": "Muskuseend",
}
PAIR_PHOTOS = {
    "sp126": "sp126.webp", "sp187": "sp187.webp",
    "sp089": "plumage/sp089-adult_f.webp", "sp129": "plumage/sp129-adult_f.webp",
    "sp130": "plumage/sp130-adult-f.webp",
}
PAIRS = (("sp126", "sp187"), ("sp089", "sp129"), ("sp130", "sp129"))
TEXT_PAIRS = (("sp126", "sp127"), ("sp128", "sp327"))
SOUND_COUNTS = {"sp126": 1, "sp128": 2, "sp129": 1}
FLIGHT_COUNTS = {"sp126": 1, "sp128": 2, "sp129": 1}
SOUNDS = [
    f"/assets/species/audio/{sid}-a{i}.mp3"
    for sid, count in SOUND_COUNTS.items() for i in range(1, count + 1)
]


def open_bird(page, sid):
    open_species(page, NAMES[sid], sid)
    return page.locator("#sdPanel-herkenning")


def save(locator, tag):
    SHOTS.mkdir(parents=True, exist_ok=True)
    locator.screenshot(path=str(SHOTS / f"{tag}.png"))


def check_pair(page, own, other, capture):
    open_bird(page, own)
    panel = open_pair(page, other)
    check_geometry(panel, ["/assets/species/" + PAIR_PHOTOS[sid] for sid in (own, other)])
    if "sp126" in (own, other):
        expect(panel).to_contain_text("voorbij het neusgat")
        expect(panel).to_contain_text("grijsbruin")
    elif "sp089" in (own, other):
        expect(panel).to_contain_text("kunnen overlappen")
        expect(panel).to_contain_text("Spiegel bij geopende vleugel")
    else:
        expect(panel).to_contain_text("steen")
    panel.locator(".sd-field-photo").first.click()
    viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    if capture:
        save(panel, f"{own}-{other}-vergelijking")
    panel.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_text_pair(page, own, other):
    panel = open_bird(page, own)
    expect(panel.locator(f'.sd-cmp-panel [data-compare-species="{other}"]')).to_have_count(0)
    link = panel.locator(f'.sd-similar [data-compare-species="{other}"]')
    expect(link).to_be_visible()
    expect(link.locator("xpath=..")).to_contain_text(
        re.compile("knobbel|basisvlek|kastanjebruine|rode wratten", re.IGNORECASE))
    link.click()
    expect(page.locator(f'#sdPanel-herkenning .sd-similar [data-compare-species="{own}"]')).to_be_visible()
    close_sheet(page)


def check_own_media(page, sid, capture, offline):
    panel = open_bird(page, sid)
    own_images = panel.locator(".sd-field-photo:not(.sd-similar *) img")
    expect(own_images).to_have_count(4)
    paths = own_images.evaluate_all("""async images => {
      for (const image of images) { image.loading='eager'; await image.decode(); }
      return images.map(image => image.getAttribute('src'));
    }""")
    hero = page.locator(f"#detailThumb-{sid} img")
    expect(hero).to_be_visible()
    assert hero.get_attribute("src") not in paths and len(paths) == len(set(paths))
    expect(panel.locator("section.sd-flight img")).to_have_count(FLIGHT_COUNTS[sid])
    if sid == "sp128":
        expect(panel.locator(".sd-plumage[data-plumage='juv'] img")).to_have_attribute(
            "src", re.compile("sp128-juv-grown.webp$"))
        expect(panel.locator("section.sd-poses")).to_contain_text("Donsjongen")
        expect(panel.locator("section.sd-poses img[src$='sp128-juv.webp']")).to_have_count(1)
        expect(panel.locator("section.sd-flight")).to_contain_text("Vrouwtje")
        expect(panel.locator("section.sd-flight")).not_to_contain_text("Bij deze man")
    expect(panel.locator(".sd-audio audio")).to_have_count(SOUND_COUNTS[sid])
    expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    info = panel.locator(".sd-audio-credits")
    info.locator("summary").focus()
    page.keyboard.press("Enter")
    expect(info.locator(".sd-audio-state", has_text="Gedeeltelijk gecontroleerd")).to_have_count(SOUND_COUNTS[sid])
    expect(info.get_by_role("link", name="Bron", exact=True)).to_have_count(SOUND_COUNTS[sid])
    expect(info.get_by_role("link", name="Bron", exact=True).first).to_have_attribute(
        "href", re.compile(r"^https://commons.wikimedia.org/wiki/File:"))
    if sid == "sp126":
        expect(info).to_contain_text("Alexander Kürthy")
        expect(info.get_by_role("link", name="CC BY-SA 3.0", exact=True)).to_have_attribute(
            "href", "https://creativecommons.org/licenses/by-sa/3.0/")
        if capture:
            save(info, "sp126-audiocredit")
    if sid == "sp128":
        expect(info).to_contain_text("Zang · bronlabel")
    sounds = panel.evaluate("""async (el, offline) => {
      const results = [];
      for (const audio of el.querySelectorAll('.sd-audio audio')) {
        audio.muted = true;
        if (offline) {
          const part = await fetch(audio.src, {headers: {Range: 'bytes=0-31'}});
          if (part.status !== 206 || (await part.arrayBuffer()).byteLength !== 32) {
            throw Error('Cached audio byte range unavailable');
          }
        }
        await audio.play();
        await new Promise(resolve => setTimeout(resolve, 170));
        results.push({duration: audio.duration, advanced: audio.currentTime > 0, error: audio.error});
        audio.pause();
      }
      return results;
    }""", offline)
    assert len(sounds) == SOUND_COUNTS[sid]
    assert all(item["duration"] > 10 and item["advanced"] and item["error"] is None for item in sounds), sounds
    close_sheet(page)


def smoke(page, capture=False, offline=False):
    for own, other in PAIRS:
        check_pair(page, own, other, capture)
        check_pair(page, other, own, capture)
    for own, other in TEXT_PAIRS:
        check_text_pair(page, own, other)
        check_text_pair(page, other, own)
    for sid in SOUND_COUNTS:
        check_own_media(page, sid, capture, offline)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")


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
                    page.on("pageerror", lambda error: errors.append(str(error)))
                    boot(page, url)
                    smoke(page, capture=width == 390)
                    context.close()
                    print(f"R33 Chromium {width}px: paired and fallback navigation, life stages, credits, four audio playbacks.", flush=True)
                context = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True,
                                              has_touch=True, reduced_motion="reduce", service_workers="allow")
                page = context.new_page()
                boot(page, url)
                page.wait_for_function("""async paths => {
                  const cache = await caches.open('birdspot-media');
                  return !!navigator.serviceWorker.controller &&
                    (await Promise.all(paths.map(path => cache.match(path)))).every(Boolean);
                }""", arg=SOUNDS, timeout=90000)
                page.close()
                context.set_offline(True)
                page = context.new_page()
                page.on("pageerror", lambda error: errors.append(str(error)))
                boot(page, url)
                assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                smoke(page, offline=True)
                context.close()
                print("R33 Chromium 390px offline: cached reopening, photos, and four actual playbacks with HTTP 206 byte ranges.", flush=True)
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
