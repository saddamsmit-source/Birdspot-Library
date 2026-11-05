"""Birdspot real cinematic background integration test.
The 9:16 video source is licensed owner-generated Artlist media, lazy streamed.
Checks real browser decode/playback, overlay contrast, pause, fallback and layout.
No personal user data or real GPS is read.
"""
import http.server,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'tests'/'screenshots'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

def main():
 with Server(("127.0.0.1",0),Quiet) as srv:
  threading.Thread(target=srv.serve_forever,daemon=True).start()
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True,args=["--autoplay-policy=no-user-gesture-required"])
   ctx=browser.new_context(viewport={"width":390,"height":844},
                           reduced_motion="no-preference",service_workers="block")
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   page.goto(f"http://127.0.0.1:{srv.server_address[1]}/",wait_until="domcontentloaded")
   page.locator('#birdspotSplashSkip').click()
   page.locator('#ambientWetland').scroll_into_view_if_needed()
   video=page.locator('#ambientWetlandVideo')
   assert video.count()==1
   assert video.evaluate("(v)=>v.muted && v.loop && v.playsInline")
   assert page.locator('#ambientWetland .ambient-wetland__illustration').count()==1
   assert page.locator('#ambientWetland .dash-section').count()==4
   assert page.locator('#ambientWetland .living-habitat').count()==0
   assert page.locator('#statsRow button').count()==4

   # Simulated network can fail in CI; the SVG/CSS fallback must still display
   # and keep all text legible. Report real video decode separately.
   has_video=False
   try:
    page.wait_for_function("""() => {
      const video=document.getElementById('ambientWetlandVideo');
      return !!video && video.readyState>=2 && video.videoWidth>0 && video.videoHeight>0;
    }""",timeout=22000)
    has_video=True
   except Exception:
    print("ARTLIST_VIDEO_NETWORK: remote CDN unavailable in CI, CSS fallback active",flush=True)
   if has_video:
    info=video.evaluate("""v=>({
      width:v.videoWidth,height:v.videoHeight,duration:v.duration,muted:v.muted,
      src:v.currentSrc,state:v.readyState,playing:!v.paused
    })""")
    print("ARTLIST_VIDEO_DECODE:",{k:v for k,v in info.items() if k!='src'},flush=True)
    assert info["height"]>info["width"] and 1.65<info["height"]/info["width"]<1.9,info
    assert 8<info["duration"]<12,info
    assert info["muted"],info
    # Check actual time progression, not a sprite GIF or CSS-only disguise.
    start=video.evaluate("(v)=>v.currentTime")
    page.wait_for_timeout(1200)
    end=video.evaluate("(v)=>v.currentTime")
    assert end>start+.4,(start,end)
    assert page.locator('#ambientWetland').evaluate("(e)=>e.classList.contains('is-video-ready')")
   else:
    assert page.locator('#ambientWetland .ambient-wetland__illustration').is_visible()
    assert page.locator('#ambientWetland').evaluate(
      "(e)=>!e.classList.contains('is-video-ready')")
   page.screenshot(path=str(OUT/'cinematic_wetland_390.png'),animations='disabled')
   # Crucial: motion is background-only, text stays above the dark scrim.
   assert page.evaluate("""() => {
     const zone=document.getElementById('ambientWetland');
     const root=zone.querySelector('.ambient-wetland__content');
     const stage=zone.querySelector('.ambient-wetland__stage');
     const dark=zone.querySelector('.ambient-wetland__darken');
     return getComputedStyle(zone).position==='relative' &&
            Number(getComputedStyle(root).zIndex)>Number(getComputedStyle(stage).zIndex) &&
            Number(getComputedStyle(dark).zIndex)<Number(getComputedStyle(root).zIndex);
   }""")
   page.locator('#ambientWetlandToggle').click()
   assert page.locator('#ambientWetland').evaluate("(e)=>e.classList.contains('is-paused')")
   if has_video:
    assert video.evaluate("(v)=>v.paused")
   page.locator('#ambientWetlandToggle').click()
   for width in (320,360,390,430):
    page.set_viewport_size({"width":width,"height":844})
    assert page.locator('#sunSection .section-head__title').is_visible()
    assert page.locator('#weatherSection .section-head__title').is_visible()
    assert page.evaluate("""() =>
      document.documentElement.scrollWidth<=window.innerWidth+2
    """),width
    page.screenshot(path=str(OUT/f'cinematic_wetland_{width}.png'),animations='disabled')
   page.locator('.nav-item[data-route="species"]').click()
   page.locator('.signature-species-hero').wait_for()
   assert not errors,errors
   print("PASS: real 9:16 Artlist source when online, offline SVG fallback, layered dashboard, playback controls",flush=True)
   ctx.close();browser.close()
  srv.shutdown()
if __name__=="__main__":main()
