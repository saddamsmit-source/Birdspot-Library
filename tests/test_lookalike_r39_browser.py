"""F3-R39 real Chromium: 12 decoded images, 10 registered audio players, reciprocal navigation and offline.

This is a browser-technical test on a fixed PR SHA, not independent ornithology, source rights, or
physical Samsung/PWA validation.
"""
import json
import threading
from playwright.sync_api import expect, sync_playwright
from test_cinematic_wetland import ROOT, Quiet, Server
from test_pilot_offline_new_sighting import boot
from test_plumage_compare_layout import open_species
from test_lookalike_r32_browser import close_sheet, check_credit

FOCUS=(("sp157","Zwarte Ruiter"),("sp158","Groenpootruiter"),("sp159","Bosruiter"))
NAMES={"sp157":"Zwarte Ruiter","sp158":"Groenpootruiter","sp159":"Bosruiter",
       "sp102":"Tureluur","sp217":"Poelruiter","sp156":"Witgat","sp155":"Oeverloper"}
DATA=json.loads((ROOT/"docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json").read_text())
ROWS={r["id"]:r for r in DATA["records"] if r["id"] in {x[0] for x in FOCUS}}
AUDIO=json.loads((ROOT/"assets/species/field-guide-media.json").read_text())["audio"]
SHOTS=ROOT/"tests/screenshots/lookalike_r39"


def open_bird(page,sid):
    open_species(page,NAMES[sid],sid)
    return page.locator("#sdPanel-herkenning")


def check_audio(panel, clips, offline):
    expect(panel.locator("audio")).to_have_count(len(clips))
    expect(panel.locator(".sd-audio-status")).to_contain_text("nog niet onafhankelijk bevestigd")
    credits=panel.locator(".sd-audio-credits")
    expect(credits).to_have_count(1)
    credits.locator("summary").press("Enter")
    for clip in clips:
        expect(credits.locator('a[href="'+clip["source"]+'"]')).to_be_visible()
    values=panel.evaluate("""async (el, offline)=>{
      const result=[];
      for(const audio of el.querySelectorAll('.sd-audio audio')){
        audio.muted=true;
        if(offline){
          const r=await fetch(audio.src,{headers:{Range:'bytes=0-31'}});
          if(r.status!==206||(await r.arrayBuffer()).byteLength!==32)
            throw new Error('Missing offline HTTP 206 for '+audio.src);
        }
        await audio.play();
        await new Promise(resolve=>setTimeout(resolve,160));
        result.push({path:new URL(audio.src).pathname,ok:audio.duration>0 && audio.currentTime>0 && !audio.error});
        audio.pause();
      }
      return result;
    }""",offline)
    assert values==[{"path":x["audio"],"ok":True} for x in clips],values


def check_own(page,sid,offline=False,capture=False):
    panel=open_bird(page,sid)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"),sid
    imgs=panel.locator(".sd-field-photo:not(.sd-similar *) img")
    pictures=imgs.evaluate_all("""async imgs=>{
      for(const img of imgs){img.loading='eager';await img.decode();}
      return imgs.map(img=>({path:new URL(img.src).pathname,ok:img.naturalWidth>0}));
    }""")
    assert all(x["ok"] for x in pictures),(sid,pictures)
    thumb=page.locator("#detailThumb-"+sid+" img")
    assert thumb.evaluate("img=>img.decode().then(()=>img.naturalWidth)")>0
    all_paths=[thumb.evaluate("img=>new URL(img.src).pathname")]+[x["path"] for x in pictures]
    expected=[x["path"] for x in ROWS[sid]["currentAssets"]["imageSlots"]]
    assert len(all_paths)==len(set(all_paths))==len(expected),(sid,all_paths,expected)
    assert set(all_paths)==set(expected),(sid,all_paths,expected)
    flight=panel.locator("section.sd-flight")
    expect(flight.locator(".sd-field-photo")).to_have_count(1)
    flight.locator(".sd-field-photo").first.click()
    viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
    expect(viewer).to_be_visible()
    page.keyboard.press("Escape")
    expect(viewer).to_have_count(0)
    credits={"sp157":("Barry Stewart","CC BY 4.0"),
             "sp158":("Prasan Shrestha","CC BY-SA 4.0"),
             "sp159":("Birds of Gilgit-Baltistan","CC BY-SA 2.0")}
    name,license_name=credits[sid]
    check_credit(flight.locator(".photo-info-frame").first,name,license_name)
    check_audio(panel,AUDIO[sid],offline)
    if capture:
        SHOTS.mkdir(parents=True,exist_ok=True)
        page.locator(".signature-species-detail-overlay").screenshot(path=str(SHOTS/(sid+"_390.png")))
    close_sheet(page)


def compare_partner(page,own,other):
    panel=open_bird(page,own)
    # Some comparison variants are behind the accessible disclosure or tabset.
    for details in panel.locator("details.sd-cmp-more").all():
        if details.locator(f'[data-compare-species="{other}"]').count() and not details.get_attribute("open"):
            details.locator("summary").click()
    buttons=panel.locator(f'[data-compare-species="{other}"]')
    assert buttons.count()>0,(own,other,"missing comparison")
    visible=buttons.locator("visible=true")
    if not visible.count():
        # A tab can hide one of several same-partner cards: activate its tab.
        for card in panel.locator(".sd-cmp-card").all():
            target=card.locator(f'[data-compare-species="{other}"]')
            if target.count() and card.locator(".sd-cmp-tab").count():
                card.locator(".sd-cmp-tab").first.click()
        visible=panel.locator(f'[data-compare-species="{other}"]:visible')
    assert visible.count(),(own,other,"comparison hidden")
    visible.first.click()
    expect(page.locator(f"#detailThumb-{other}")).to_be_visible()
    close_sheet(page)


def smoke(page,offline=False,capture=False):
    for sid,_ in FOCUS:check_own(page,sid,offline,capture)
    for own,other in (("sp157","sp102"),("sp102","sp157"),
                      ("sp158","sp217"),("sp217","sp158"),
                      ("sp159","sp156"),("sp156","sp159")):
        compare_partner(page,own,other)
    assert not page.evaluate("document.documentElement.scrollWidth > innerWidth+2")


def check_precache(page):
    assets={x["path"] for row in ROWS.values() for x in row["currentAssets"]["imageSlots"]}
    assets.update(clip["audio"] for sid,_ in FOCUS for clip in AUDIO[sid])
    page.wait_for_function("() => !!navigator.serviceWorker.controller",timeout=90000)
    missing=page.evaluate("""async paths=>{
      const cache=await caches.open('birdspot-media');
      const rs=await Promise.all(paths.map(path=>cache.match(path)));
      return paths.filter((path,i)=>!rs[i]?.ok);
    }""",sorted(assets))
    assert not missing,f"R39 fresh cache misses: {missing}"
    print(f"R39 fresh cache: {len(assets)} existing focus image/audio assets",flush=True)


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
                        page.on("pageerror",lambda err:errors.append(f"{width}px: {err}"))
                        boot(page,url)
                        smoke(page,capture=(width==390))
                        print(f"R39 Chromium {width}px: 12 photo decodes, 10 audio players, comparison navigation PASS",flush=True)
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
                    page.on("pageerror",lambda err:errors.append("offline "+str(err)))
                    boot(page,url)
                    assert page.evaluate("!navigator.onLine && !!navigator.serviceWorker.controller")
                    smoke(page,offline=True)
                    print("R39 Chromium 390px OFFLINE: 12 photos, 10 players and reciprocal partners PASS",flush=True)
                finally:ctx.close()
                assert not errors,errors
            finally:browser.close()
        server.shutdown()


if __name__=="__main__":
    main()
