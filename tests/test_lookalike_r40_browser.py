"""F3-R40: verify genuine guide media, missing-audio truth, reciprocal field text,
adult gull photo comparisons, and offline reopen in Chromium. Not physical Samsung or
ornithological/licensing approval.
"""
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import open_pair
from test_lookalike_r32_browser import close_sheet, check_credit
from test_lookalike_r34_browser import check_pictures

NAMES={"sp164":"Grote Mantelmeeuw","sp165":"Visdief","sp166":"Noordse Stern",
       "sp095":"Kleine Mantelmeeuw"}
FOCUS=("sp164","sp165","sp166")
ROWS={x["id"]:x for x in json.loads(
    (ROOT/"docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text())["records"]
    if x["id"] in FOCUS}
SHOTS=ROOT/"tests/screenshots/lookalike_r40"


def open_bird(page,sid):
    open_species(page,NAMES[sid],sid)
    return page.locator("#sdPanel-herkenning")


def check_own(page,sid,capture=False):
    panel=open_bird(page,sid)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth+2"),sid
    expect(panel.locator("audio,.sd-audio-credits")).to_have_count(0)
    photos=panel.locator(".sd-field-photo:not(.sd-similar *) img")
    inspected=photos.evaluate_all("""async imgs=>{
      for(const img of imgs){img.loading='eager'; await img.decode();}
      return imgs.map(i=>({path:new URL(i.src).pathname,ok:i.naturalWidth>0}));
    }""")
    assert all(x["ok"] for x in inspected),(sid,inspected)
    thumb=page.locator(f"#detailThumb-{sid} img")
    assert thumb.evaluate("img=>img.decode().then(()=>img.naturalWidth)")>0
    paths=[thumb.evaluate("img=>new URL(img.src).pathname")]+[x["path"] for x in inspected]
    expected=[x["path"] for x in ROWS[sid]["currentAssets"]["imageSlots"]]
    assert len(paths)==len(set(paths))==len(expected),(sid,paths,expected)
    assert set(paths)==set(expected),(sid,paths,expected)
    flight=panel.locator("section.sd-flight")
    if sid=="sp166":
        # The ONLY registered Arctic Tern image is the flight HERO.
        assert thumb.evaluate("img=>new URL(img.src).pathname")=="/assets/species/plumage/sp166-adult.webp"
        expect(flight.locator(".sd-field-photo")).to_have_count(0)
        assert len(paths)==1
    else:
        expect(flight.locator(".sd-field-photo")).to_have_count(1)
        flight.locator(".sd-field-photo").first.click()
        viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
        expect(viewer).to_be_visible()
        page.keyboard.press("Escape")
        expect(viewer).to_have_count(0)
        if sid=="sp164":
            check_credit(flight.locator(".photo-info-frame").first,"Charles J. Sharp","CC BY-SA 4.0")
        else:
            check_credit(flight.locator(".photo-info-frame").first,"Charles J. Sharp","CC BY-SA 4.0")
    if capture:
        SHOTS.mkdir(parents=True,exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(
            path=str(SHOTS/(sid+"_390.png")))
    close_sheet(page)


def check_gull_pair(page,own,other):
    open_bird(page,own)
    panel=open_pair(page,other)
    paths=["plumage/sp164-adult.webp" if id=="sp164" else "sp095.webp"
           for id in (own,other)]
    check_pictures(panel,paths)
    expect(panel.locator(".sd-cmp-row")).to_have_count(3)
    panel.locator(f'[data-compare-species="{other}"]').click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def check_tern_text(page,own,other):
    panel=open_bird(page,own)
    expect(panel.locator(f'.sd-cmp-panel [data-compare-species="{other}"]')).to_have_count(0)
    link=panel.locator(f'.sd-similar [data-compare-species="{other}"]')
    expect(link).to_be_visible()
    expect(link.locator("xpath=..")).to_contain_text("snavel")
    link.click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def smoke(page,capture=False):
    for id in FOCUS:check_own(page,id,capture)
    check_gull_pair(page,"sp164","sp095")
    check_gull_pair(page,"sp095","sp164")
    check_tern_text(page,"sp165","sp166")
    check_tern_text(page,"sp166","sp165")
    assert not page.evaluate("document.documentElement.scrollWidth>innerWidth+2")


def check_precache(page):
    paths={slot["path"] for row in ROWS.values() for slot in row["currentAssets"]["imageSlots"]}
    paths.add("/assets/species/sp095.webp")
    page.wait_for_function("() => !!navigator.serviceWorker.controller",timeout=90000)
    missing=page.evaluate("""async paths=>{
      const cache=await caches.open('birdspot-media');
      const responses=await Promise.all(paths.map(path=>cache.match(path)));
      return paths.filter((path,i)=>!responses[i]?.ok);
    }""",sorted(paths))
    assert not missing,f"R40 missing fresh media cache: {missing}"
    print(f"R40 fresh media cache: {len(paths)} distinct guide/comparison photos",flush=True)


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
                        page.on("pageerror",lambda e:errors.append(f"{width}: {e}"))
                        boot(page,url)
                        smoke(page,capture=(width==390))
                        print(f"R40 Chromium {width}px: six images, no audio, gull photos, tern texts, zoom and back PASS",flush=True)
                    finally:ctx.close()
                ctx=browser.new_context(viewport={"width":390,"height":844},is_mobile=True,
                     has_touch=True,reduced_motion="reduce",service_workers="allow")
                try:
                    page=ctx.new_page()
                    boot(page,url)
                    check_precache(page)
                    page.close()
                    ctx.set_offline(True)
                    page=ctx.new_page()
                    page.on("pageerror",lambda e:errors.append(f"offline: {e}"))
                    boot(page,url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page)
                    print("R40 Chromium 390px OFFLINE: actual photos, reciprocal navigation and no phantom audio PASS",flush=True)
                finally:ctx.close()
                assert not errors,errors
            finally:browser.close()
        server.shutdown()


if __name__=="__main__":
    main()
