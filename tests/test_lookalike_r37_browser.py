"""F3-R37: three shorebirds, real decoded media, reciprocal text and fresh offline reopen.

Browser evidence only; not independent source-image rights, species-expert or physical Samsung QA.
"""
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import close_sheet, check_credit

FOCUS = (
    ("sp149", "Rosse Grutto"),
    ("sp150", "Steenloper"),
    ("sp152", "Drieteenstrandloper"),
)
NAMES = {"sp149": "Rosse Grutto", "sp150": "Steenloper",
         "sp152": "Drieteenstrandloper", "sp146": "Bontbekplevier",
         "sp101": "Grutto", "sp153": "Bonte Strandloper"}
REGISTER = json.loads((ROOT / "docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text())
ROWS = {r["id"]: r for r in REGISTER["records"] if r["id"] in {x[0] for x in FOCUS}}
SHOTS = ROOT / "tests/screenshots/lookalike_r37"


def open_bird(page, sid):
    open_species(page, NAMES[sid], sid)
    return page.locator("#sdPanel-herkenning")


def check_own(page, sid, capture=False):
    panel = open_bird(page, sid)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"), sid
    expect(panel.locator("audio, .sd-audio-credits")).to_have_count(0)
    images = panel.locator(".sd-field-photo:not(.sd-similar *) img")
    paths = images.evaluate_all("""async imgs => {
      for (const img of imgs) { img.loading='eager'; await img.decode(); }
      return imgs.map(img => ({path:new URL(img.src).pathname, ready:img.naturalWidth>0}));
    }""")
    assert all(x["ready"] for x in paths), paths
    hero = page.locator(f"#detailThumb-{sid} img")
    assert hero.evaluate("img => img.decode().then(()=>img.naturalWidth)") > 0
    image_paths = [hero.evaluate("img => new URL(img.src).pathname")] + [x["path"] for x in paths]
    expected = [s["path"] for s in ROWS[sid]["currentAssets"]["imageSlots"]]
    assert len(image_paths) == len(set(image_paths)) == len(expected), (sid,image_paths,expected)
    assert set(image_paths) == set(expected), (sid,image_paths,expected)
    assert len(ROWS[sid]["currentAssets"]["existingAudioPaths"]) == 0

    if sid in ("sp150", "sp152"):
        flight = panel.locator("section.sd-flight")
        expect(flight.locator(".sd-field-photo img")).to_have_count(1)
        flight.locator(".sd-field-photo").first.click()
        viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
        expect(viewer).to_be_visible()
        page.keyboard.press("Escape")
        expect(viewer).to_have_count(0)
        if sid == "sp150":
            check_credit(flight.locator(".photo-info-frame").first, "Charles J. Sharp", "CC BY-SA 4.0")
        else:
            check_credit(flight.locator(".photo-info-frame").first, "Dominic Sherony", "CC BY-SA 2.0")
            expect(panel.locator("section.sd-flight")).to_contain_text("onvolwassen vogels")
    else:
        expect(panel.locator("section.sd-flight")).to_have_count(0)

    if capture:
        SHOTS.mkdir(parents=True, exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(
            path=str(SHOTS / f"{sid}_390.png"))
    close_sheet(page)


def check_text_only(page, own, other):
    panel = open_bird(page, own)
    expect(panel.locator(f'.sd-cmp-panel [data-compare-species="{other}"]')).to_have_count(0)
    link = panel.locator(f'.sd-similar [data-compare-species="{other}"]')
    expect(link).to_be_visible()
    expect(link.locator("xpath=..")).to_contain_text("snavel")
    link.click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_existing_pair(page, own, other):
    open_bird(page, own)
    panel = open_pair(page, other)
    expect(panel).to_be_visible()
    expect(panel.locator(f'[data-compare-species="{other}"]')).to_have_count(1)
    close_sheet(page)


def smoke(page, capture=False):
    for sid,_ in FOCUS:
        check_own(page, sid, capture)
    for own,other in (("sp150","sp146"),("sp146","sp150")):
        check_text_only(page, own, other)
    for own,other in (("sp149","sp101"),("sp101","sp149"),
                      ("sp152","sp153"),("sp153","sp152")):
        check_existing_pair(page, own, other)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2")


def check_precache(page):
    paths = sorted({slot["path"] for row in ROWS.values()
                    for slot in row["currentAssets"]["imageSlots"]})
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    missing = page.evaluate("""async paths => {
        const cache=await caches.open('birdspot-media');
        const values=await Promise.all(paths.map(p=>cache.match(p)));
        return paths.filter((p,i)=>!values[i]?.ok);
    }""",paths)
    assert not missing, f"R37 fresh media cache misses: {missing}"
    print(f"R37: {len(paths)} existing guide images in fresh offline cache",flush=True)


def main():
    errors=[]
    with Server(("127.0.0.1",0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            try:
                for width in (320,360,390):
                    ctx=browser.new_context(viewport={"width":width,"height":844},
                                            reduced_motion="reduce",service_workers="block")
                    try:
                        page=ctx.new_page()
                        page.on("pageerror",lambda err: errors.append(str(err)))
                        boot(page,url)
                        smoke(page, capture=(width==390))
                        print(f"R37 Chromium {width}px: 6 photos decoded, zoom/credits/partners/no-audio PASS",flush=True)
                    finally: ctx.close()
                ctx=browser.new_context(viewport={"width":390,"height":844},is_mobile=True,
                                        has_touch=True,reduced_motion="reduce",service_workers="allow")
                try:
                    page=ctx.new_page()
                    boot(page,url)
                    check_precache(page)
                    page.close()
                    ctx.set_offline(True)
                    page=ctx.new_page()
                    page.on("pageerror",lambda err: errors.append("offline: "+str(err)))
                    boot(page,url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page)
                    print("R37 Chromium 390px OFFLINE: reopen, photo decode, reciprocal pairs and navigation PASS",flush=True)
                finally: ctx.close()
                assert not errors, errors
            finally: browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
