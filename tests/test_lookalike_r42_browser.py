"""F3-R42: Chromium technical media, comparison and offline checks.
Does not certify original-photo rights, biological age/sex, ANWB or physical Samsung.
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

NAMES={
 "sp174":"Zwarte Mees","sp176":"Grauwe Vliegenvanger","sp177":"Bonte Vliegenvanger",
 "sp029":"Koolmees","sp034":"Staartmees"
}
FOCUS=("sp174","sp176","sp177")
ROWS={r["id"]:r for r in json.loads(
 (ROOT/"docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text()
)["records"] if r["id"] in FOCUS}
SHOTS=ROOT/"tests/screenshots/lookalike_r42"
CREDITS={"sp174":("Alexis Lours","CC BY 4.0"),
         "sp176":("Бусел В.А.","CC BY-SA 4.0"),
         "sp177":("Ron Knight","CC BY 2.0")}

def open_bird(page,sid):
    open_species(page,NAMES[sid],sid)
    return page.locator("#sdPanel-herkenning")

def check_own(page,sid,capture=False):
    panel=open_bird(page,sid)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2"),sid
    expect(panel.locator("audio,.sd-audio-credits")).to_have_count(0)
    thumbs=panel.locator(".sd-field-photo:not(.sd-similar *) img")
    pictures=thumbs.evaluate_all("""async imgs=>{
        for(const i of imgs){i.loading='eager';await i.decode();}
        return imgs.map(i=>({path:new URL(i.src).pathname,ok:i.naturalWidth>0}));
    }""")
    assert all(x["ok"] for x in pictures),(sid,pictures)
    hero=page.locator("#detailThumb-"+sid)
    thumb=hero.locator("img")
    assert thumb.evaluate("i=>i.decode().then(()=>i.naturalWidth)")>0
    paths=[thumb.evaluate("i=>new URL(i.src).pathname")]+[x["path"] for x in pictures]
    expected=[x["path"] for x in ROWS[sid]["currentAssets"]["imageSlots"]]
    assert len(paths)==len(set(paths))==len(expected),(sid,paths,expected)
    assert set(paths)==set(expected),(sid,paths,expected)
    check_credit(hero,*CREDITS[sid])
    hero.get_by_role("button",name="Vergroot hoofdfoto").click()
    viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    flight=panel.locator("section.sd-flight")
    expect(flight.locator(".sd-field-photo")).to_have_count(1)
    flight.locator(".sd-field-photo").first.click()
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    if sid=="sp174":
        # Historical photographic condition is still OPEN; do not conflate technical decode with image quality.
        assert "voorwaardelijk" in ROWS[sid]["F3"]["findings"][-3].lower() or any(
            "onscherp" in v.lower() for v in ROWS[sid]["F3"]["findings"])
    if capture:
        SHOTS.mkdir(parents=True,exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(
          path=str(SHOTS/(sid+"_390.png")))
    close_sheet(page)

def pair(page,own,partner):
    open_bird(page,own)
    panel=open_pair(page,partner)
    images=panel.locator(".sd-cmp-who .sd-field-photo img")
    expect(images).to_have_count(2)
    decoded=images.evaluate_all("""async imgs=>{
      for(const img of imgs){img.loading='eager';await img.decode();}
      return imgs.map(i=>({url:new URL(i.src).pathname,ok:i.naturalWidth>0}));
    }""")
    assert all(x["ok"] for x in decoded),decoded
    assert decoded[0]["url"]!=decoded[1]["url"],(own,partner)
    assert panel.evaluate("el=>el.scrollWidth <= el.clientWidth + 2")
    panel.locator(f'[data-compare-species="{partner}"]').first.click()
    expect(page.locator(f"#detailThumb-{partner}")).to_be_visible()
    close_sheet(page)

def smoke(page,capture=False):
    for sid in FOCUS: check_own(page,sid,capture)
    for own,partner in (("sp176","sp177"),("sp177","sp176"),
                        ("sp174","sp029"),("sp029","sp174")):
        pair(page,own,partner)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth+2")

def check_precache(page):
    photos={slot["path"] for r in ROWS.values() for slot in r["currentAssets"]["imageSlots"]}
    photos.update(["/assets/species/sp029.webp","/assets/species/sp034.webp"])
    page.wait_for_function("() => !!navigator.serviceWorker.controller",timeout=90000)
    missing=page.evaluate("""async paths=>{
      const cache=await caches.open('birdspot-media');
      const got=await Promise.all(paths.map(p=>cache.match(p)));
      return paths.filter((p,i)=>!got[i]?.ok);
    }""",sorted(photos))
    assert not missing,f"R42 cold-cache misses: {missing}"
    print(f"R42 offline precache: {len(photos)} photos",flush=True)

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
                        page.on("pageerror",lambda e:errors.append(str(e)))
                        boot(page,url)
                        smoke(page,capture=(width==390))
                        print(f"R42 Chromium {width}px: 10 photo decodes, 0 audio, own zoom, 2-way pairs/back PASS",flush=True)
                    finally:ctx.close()
                ctx=browser.new_context(viewport={"width":390,"height":844},
                    is_mobile=True,has_touch=True,reduced_motion="reduce",service_workers="allow")
                try:
                    page=ctx.new_page()
                    boot(page,url)
                    check_precache(page)
                    page.close()
                    ctx.set_offline(True)
                    page=ctx.new_page()
                    page.on("pageerror",lambda e:errors.append("offline "+str(e)))
                    boot(page,url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page)
                    print("R42 Chromium 390px offline reopen: photo bytes, panels, comparisons, back PASS",flush=True)
                finally:ctx.close()
                assert not errors,errors
            finally:browser.close()
        server.shutdown()

if __name__=="__main__":
    main()
