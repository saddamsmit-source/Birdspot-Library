"""Birdspot mobile field QA + autonomous bird spotlight + cinematic wetland.
Synthetic isolated browser state. All observations created through the real form.
No personal photos, locations or credentials are accessed.
"""
from __future__ import annotations
import http.server,socketserver,threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/'tests'/'screenshots'
SHOTS.mkdir(parents=True,exist_ok=True)
class ServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

def capture(p,name):
    p.screenshot(path=str(SHOTS/name),animations="disabled")

def main():
  with Server(("127.0.0.1",0),ServerHandler) as srv:
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    with sync_playwright() as pw:
      browser=pw.chromium.launch(headless=True)
      context=browser.new_context(viewport={"width":390,"height":844},
                                  reduced_motion="reduce",service_workers="block")
      p=context.new_page()
      errors=[]
      p.on("pageerror",lambda e:errors.append(str(e)))
      p.goto("http://127.0.0.1:"+str(srv.server_address[1])+"/",wait_until="domcontentloaded")
      p.locator('#birdspotSplashSkip').click()
      p.locator('#featuredBirdName').wait_for(timeout=14000)
      assert p.locator("#featuredBirdName").inner_text().strip()
      assert p.locator("#featuredBirdLatin").inner_text().strip()
      assert "Herkenning:" in p.locator("#featuredBirdWhere").inner_text()
      assert p.locator("#featuredBirdTheme").count()==0
      assert p.locator("#featuredPrev").count()==0
      assert p.locator("#featuredNext").count()==0
      assert p.locator("#featuredBirdPosition").count()==0
      assert "Wisselt elke minuut" not in p.locator("#slideshow").inner_text()
      assert p.locator(".featured-birds__caption").is_visible()

      # Curated references and 50+ database-derived additions, in a stable
      # randomized mixed sequence. No browsing UI is exposed to visitors.
      current=p.evaluate("""async()=> {
        const m=await import('/src/features/home/specialBirds.js');
        const x=m.shuffledBirds(123456),y=m.shuffledBirds(123456);
        return {
          total:m.FEATURED_BIRDS.length,
          unique:new Set(m.FEATURED_BIRDS.map(b=>b.latin)).size,
          themes:m.BIRD_THEMES.length,
          sameOrder:x.map(b=>b.id).join('|')===y.map(b=>b.id).join('|'),
          variedOrder:x.some((b,i)=>b.id!==m.FEATURED_BIRDS[i].id),
          song0:m.birdAtTime('zang',0).id,
          song1:m.birdAtTime('zang',60000).id,
          delay:m.nextSlideDelay(63000)
        };
      }""")
      assert current["total"]>=50,current
      assert current["unique"]==current["total"],current
      assert current["sameOrder"] and current["variedOrder"],current
      assert current["song0"]=="wielewaal" and current["song1"]=="nachtegaal",current
      assert current["delay"]==57000
      wallclock=p.evaluate("""async()=>{
        const m=await import('/src/features/home/specialBirds.js');
        const origin=105123;
        return {
          first:m.birdAtTime('zang',origin,origin).id,
          stillFirst:m.birdAtTime('zang',origin+59999,origin).id,
          next:m.birdAtTime('zang',origin+60000,origin).id,
          delay:m.nextSlideDelay(origin+14000,origin)
        };
      }""")
      assert wallclock["first"]==wallclock["stillFirst"]=="wielewaal"
      assert wallclock["next"]=="nachtegaal" and wallclock["delay"]==46000

      # This checks all fixed Commons source files, not the additional lazy
      # API candidates (which do not have a hardcoded guess at a file name).
      photo_catalog=p.evaluate("""async () => {
        const {FEATURED_BIRDS}=await import('/src/features/home/specialBirds.js');
        return Promise.all(FEATURED_BIRDS.filter(b=>!!b.image).map(b=>new Promise(resolve=>{
          const img=new Image();let done=false;
          const finish=(ok)=>{if(done)return;done=true;clearTimeout(timer);resolve({id:b.id,ok})};
          const timer=setTimeout(()=>finish(false),8500);
          img.onload=()=>finish(img.naturalWidth>0);
          img.onerror=()=>finish(false);
          img.src=b.image;
        })));
      }""")
      print("CURATED_IMAGE_CHECK:",photo_catalog,flush=True)
      capture(p,'mobile_editorial_390.png')

      # Lower dashboard uses one immersive moving 9:16 plate instead of a
      # separate Living Habitat card. Stats and text remain their own layer.
      assert p.locator("#livingHabitat").count()==0
      assert p.locator("#habitatMotionSection").count()==0
      assert p.locator("#ambientWetland").count()==1
      assert p.locator("#ambientWetlandVideo").count()==1
      assert p.locator("#ambientWetland .dash-section").count()==4
      assert p.locator("#statsRow button.stat-tile").count()==4
      p.locator("#ambientWetland").scroll_into_view_if_needed()
      assert p.locator("#ambientWetland .ambient-wetland__illustration").count()==1
      p.locator("#ambientWetlandToggle").click()
      assert p.locator("#ambientWetland").evaluate("(el)=>el.classList.contains('is-paused')")
      assert p.locator("#ambientWetlandToggle").get_attribute("aria-pressed")=="true"
      assert p.locator("#ambientWetland video").get_attribute("muted") is not None
      capture(p,'mobile_cinematic_wetland_390.png')

      # New sheet: navigation and actions must remain within the viewport.
      p.locator('#fab').click()
      p.locator('#addSightingSheet.open').wait_for(timeout=9000)
      for width in (320,360,390,430):
        p.set_viewport_size({"width":width,"height":844})
        dialog=p.locator('#addSightingSheet .sheet')
        assert dialog.is_visible()
        bounds=dialog.bounding_box()
        assert bounds['x']>=-1 and bounds['x']+bounds['width']<=width+1,(width,bounds)
        assert bounds['y']>=-1 and bounds['y']+bounds['height']<=845,(width,bounds)
        assert p.evaluate("""() => {
          const sheet=document.querySelector('#addSightingSheet .sheet');
          const content=document.querySelector('#addSheetContent');
          const footer=document.querySelector('#addSightingSheet .sheet__footer');
          const box=sheet.getBoundingClientRect(), foot=footer.getBoundingClientRect();
          return content.scrollWidth<=content.clientWidth+2 &&
                 foot.bottom<=window.innerHeight+2 &&
                 foot.left>=-1 && foot.right<=window.innerWidth+1 &&
                 document.documentElement.scrollWidth<=window.innerWidth+2;
        }"""),"Overflow or footer issue at "+str(width)
        assert p.locator('#sightMethodGroup input[value="heard"]').count()==1
        assert p.locator('#addSheetSubmit').is_visible()
        capture(p,f'mobile_sighting_form_{width}.png')
      p.locator('#addSheetCancel').click()
      p.locator('#addSightingSheet').wait_for(state='detached',timeout=5000)

      # Species detail now offers the exact observation methods, not merely
      # a legacy seen toggle. A quick click preselects species + method.
      p.locator('.nav-item[data-route="species"]').click()
      p.locator('.species-row[data-id="sp001"] .species-row__body').first.click()
      p.locator('.signature-species-methods').wait_for(timeout=9000)
      assert p.locator('.signature-species-methods button').count()==4
      capture(p,'mobile_species_methods_390.png')
      p.locator('[data-species-observe="merlin"]').click()
      p.locator('#addSightingSheet.open').wait_for(timeout=9000)
      assert "Stadsduif" in p.locator('#speciesPickerBtn').inner_text()
      assert p.locator('#sightMethodGroup input[value="heard"]').is_checked()
      assert p.locator('#sightSourceGroup input[value="merlin"]').is_checked()
      assert p.locator('#certaintyGroup input[value="possible"]').is_checked()
      assert p.locator('#sightMerlinChecked').is_visible()
      p.locator('#sightLocation').fill("Testveld zonder GPS")
      p.locator('#addSheetSubmit').click()
      p.locator('#addSightingSheet').wait_for(state='detached',timeout=12000)
      rows=p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings")
      assert len(rows)==1 and rows[0]['speciesId']=='sp001',rows
      assert rows[0]['observationMethod']=='heard' and rows[0]['identificationSource']=='merlin',rows
      assert rows[0]['merlinVerification']=='suggested',rows
      assert rows[0]['lat'] is None and rows[0]['lon'] is None,rows

      # Existing FAB stays a normal observation (regression).
      p.locator('#fab').click()
      p.locator('#addSightingSheet.open').wait_for(timeout=9000)
      assert p.locator('#sightMethodGroup input[value="seen"]').is_checked()
      p.locator('#addSheetCancel').click()

      # Final page should not be wider than mobile viewport.
      for width in (320,360,390,430):
        p.set_viewport_size({"width":width,"height":844})
        assert p.locator('.signature-species-hero').is_visible()
        assert p.evaluate("() => document.documentElement.scrollWidth<=window.innerWidth+2"),width
      assert not errors,errors
      print("PASS: 60-second categorized bird showcase, species quick modes, mobile form bounds, ambient pause")
      context.close();browser.close()
    srv.shutdown()
if __name__=='__main__':main()
