"""Birdspot F3-R38: real nine-photo UI and seven registered clips, mobile online/offline.
Technical Chromium evidence only; no independent media rights/ornithological or Samsung-PWA PASS.
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

FOCUS=(("sp153","Bonte Strandloper"),("sp155","Oeverloper"),("sp156","Witgat"))
NAMES={"sp153":"Bonte Strandloper","sp155":"Oeverloper","sp156":"Witgat",
       "sp152":"Drieteenstrandloper","sp159":"Bosruiter"}
REGISTER=json.loads((ROOT/"docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text())
ROWS={r["id"]:r for r in REGISTER["records"] if r["id"] in {x[0] for x in FOCUS}}
AUDIO=json.loads((ROOT/"assets/species/field-guide-media.json").read_text())["audio"]
SHOTS=ROOT/"tests/screenshots/lookalike_r38"


def open_bird(page,id):
    open_species(page,NAMES[id],id)
    return page.locator("#sdPanel-herkenning")


def check_audio(panel, clips, offline):
    expect(panel.locator("audio")).to_have_count(len(clips))
    # All labels/rights remain metadata until a separate original-audio/listening audit.
    if not clips:
        expect(panel.locator("audio, .sd-audio-credits")).to_have_count(0)
        return
    credits=panel.locator(".sd-audio-credits")
    expect(credits).to_have_count(1)
    credits.locator("summary").press("Enter")
    for clip in clips:
        expect(credits.locator('a[href="'+clip["source"]+'"]')).to_be_visible()
    values=panel.evaluate("""async (el, isOffline) => {
      const results=[];
      for (const audio of el.querySelectorAll('.sd-audio audio')){
        audio.muted=true;
        if(isOffline){
          const part=await fetch(audio.src,{headers:{Range:'bytes=0-31'}});
          if(part.status!==206||(await part.arrayBuffer()).byteLength!==32)
             throw new Error('Cached byte range 206 expected for '+audio.src);
        }
        await audio.play();
        await new Promise(resolve=>setTimeout(resolve,180));
        results.push({path:new URL(audio.src).pathname,ok:audio.duration>1 && audio.currentTime>0 && !audio.error});
        audio.pause();
      }
      return results;
    }""",offline)
    assert values==[{"path":clip["audio"],"ok":True} for clip in clips],values


def check_own(page,id,capture=False,offline=False):
    panel=open_bird(page,id)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth+2"),id
    imgs=panel.locator(".sd-field-photo:not(.sd-similar *) img")
    found=imgs.evaluate_all("""async imgs=>{
      for(const img of imgs){ img.loading='eager'; await img.decode(); }
      return imgs.map(img=>({path:new URL(img.src).pathname,ok:img.naturalWidth>0}));
    }""")
    assert all(x["ok"] for x in found),found
    hero=page.locator("#detailThumb-"+id+" img")
    assert hero.evaluate("img=>img.decode().then(()=>img.naturalWidth)")>0
    paths=[hero.evaluate("img=>new URL(img.src).pathname")]+[x["path"] for x in found]
    expected=[x["path"] for x in ROWS[id]["currentAssets"]["imageSlots"]]
    assert len(paths)==len(set(paths))==len(expected),(id,paths,expected)
    assert set(paths)==set(expected),(id,paths,expected)
    flight=panel.locator("section.sd-flight")
    if id=="sp153":
        expect(flight.locator(".sd-field-photo")).to_have_count(0)
    else:
        expect(flight.locator(".sd-field-photo")).to_have_count(1)
        flight.locator(".sd-field-photo").first.click()
        zoom=page.get_by_role("dialog",name="Vogelfoto bekijken")
        expect(zoom).to_be_visible()
        page.keyboard.press("Escape")
        expect(zoom).to_have_count(0)
        maker="Bengt Nyman" if id=="sp155" else "Prasan Shrestha"
        license="CC BY-SA 2.0" if id=="sp155" else "CC BY-SA 4.0"
        check_credit(flight.locator(".photo-info-frame").first,maker,license)
    check_audio(panel,AUDIO.get(id,[]),offline)
    if capture:
        SHOTS.mkdir(parents=True,exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(path=str(SHOTS/(id+"_390.png")))
    close_sheet(page)


def check_pair(page,id,partner,images):
    open_bird(page,id)
    panel=open_pair(page,partner)
    check_pictures(panel,images)
    panel.locator('[data-compare-species="'+partner+'"]').click()
    expect(page.locator("#detailThumb-"+partner)).to_be_visible()
    close_sheet(page)


def smoke(page,capture=False,offline=False):
    for id,_ in FOCUS:
        check_own(page,id,capture,offline)
    # Existing same-season/rest comparisons retain different, decoded, side-by-side images.
    for a,b,paths in (
       ("sp153","sp152",["sp153.webp","sp152.webp"]),
       ("sp152","sp153",["sp152.webp","sp153.webp"]),
       ("sp155","sp156",["plumage/sp155-winter.webp","plumage/sp156-winter.webp"]),
       ("sp156","sp155",["plumage/sp156-winter.webp","plumage/sp155-winter.webp"])):
        check_pair(page,a,b,paths)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth+2")


def check_precache(page):
    assets={v["path"] for row in ROWS.values() for v in row["currentAssets"]["imageSlots"]}
    for clips in (AUDIO.get(id,[]) for id,_ in FOCUS):
        assets.update(c["audio"] for c in clips)
    assets.add("/assets/species/sp152.webp")
    page.wait_for_function("() => !!navigator.serviceWorker.controller",timeout=90000)
    missing=page.evaluate("""async paths=>{
      const cache=await caches.open('birdspot-media');
      const responses=await Promise.all(paths.map(p=>cache.match(p)));
      return paths.filter((p,i)=>!responses[i]?.ok);
    }""",sorted(assets))
    assert not missing,f"R38 fresh media cache missing: {missing}"
    print("R38 fresh media precache: "+str(len(assets))+" image/audio assets",flush=True)


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
                        page.on("pageerror",lambda err:errors.append(f"{width}px {err}"))
                        boot(page,url)
                        smoke(page,capture=(width==390))
                        print(f"R38 Chromium {width}px: 9 photos, 7 players, pairs, zoom, credits PASS",flush=True)
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
                    page.on("pageerror",lambda err:errors.append("offline: "+str(err)))
                    boot(page,url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page,offline=True)
                    print("R38 Chromium 390px OFFLINE: photo/clip decode, pair navigation and reopen PASS",flush=True)
                finally:ctx.close()
                assert not errors,errors
            finally:browser.close()
        server.shutdown()


if __name__=="__main__":
    main()
