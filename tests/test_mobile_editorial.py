"""Birdspot mobile field QA + editorial species + living habitat.
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
      p.locator('.featured-birds h2').wait_for(timeout=14000)
      assert p.locator('.featured-birds__photo').count()==1
      assert p.locator('#featuredBirdCredit').get_attribute('href').startswith("https://commons.wikimedia.org/wiki/File:")
      assert "Wisselt elke minuut" in p.locator(".featured-birds").inner_text()
      assert p.locator('#featuredBirdTheme option').count()==9
      p.locator('#featuredBirdTheme').select_option('kleur')
      assert p.locator('#featuredBirdName').inner_text() in ('Wielewaal','Scharrelaar','Bijeneter')
      assert p.locator('#featuredBirdLatin').inner_text() in ('Oriolus oriolus','Coracias garrulus','Merops apiaster')
      assert len(p.locator('#featuredBirdWhere').inner_text())>25
      before=p.locator('#featuredBirdName').inner_text()
      p.locator('#featuredNext').click()
      assert p.locator('#featuredBirdName').inner_text()!=before
      current=p.evaluate("""async()=> {
        const m=await import('/src/features/home/specialBirds.js');
        return {
          total:m.FEATURED_BIRDS.length,
          themes:m.BIRD_THEMES.length,
          current:m.birdAtTime('zang',0).id,
          future:m.birdAtTime('zang',60_000).id,
          cycle:m.birdAtTime('zang',120_000).id,
          delay:m.nextSlideDelay(63000)
        };
      }""")
      assert current=={"total":16,"themes":9,"current":"wielewaal","future":"nachtegaal","cycle":"wielewaal","delay":57000},current
      wallclock=p.evaluate("""async()=>{
        const m=await import('/src/features/home/specialBirds.js');
        const start=105123;
        return {first:m.birdAtTime('zang',start,start).id,
          stillFirst:m.birdAtTime('zang',start+59999,start).id,
          next:m.birdAtTime('zang',start+60000,start).id,
          delay:m.nextSlideDelay(start+14000,start),
          colourful:m.birdsForTheme('kleur').map(x=>x.nl)};
      }""")
      assert wallclock["first"]==wallclock["stillFirst"]=="wielewaal"
      assert wallclock["next"]=="nachtegaal" and wallclock["delay"]==46000
      assert wallclock["colourful"]==["Wielewaal","Scharrelaar","Bijeneter"]
      # Wikimedia photos are third-party: report actual network availability
      # separately from the deterministic slideshow timing/metadata checks.
      try:
        p.wait_for_function("""() => {
          const img=document.getElementById('featuredBirdImage');
          return !!img&&img.complete&&img.naturalWidth>0;
        }""",timeout=10000)
        print("PHOTO_NETWORK_CHECK: image loaded")
      except Exception:
        print("PHOTO_NETWORK_CHECK: external image not available in CI, CSS fallback shown")
      photo_catalog=p.evaluate("""async () => {
        const {FEATURED_BIRDS}=await import('/src/features/home/specialBirds.js');
        return Promise.all(FEATURED_BIRDS.map(b => new Promise(resolve => {
          const image=new Image();
          let settled=false;
          const finish=(ok,reason) => {
            if(settled)return;
            settled=true;
            clearTimeout(timeout);
            resolve({id:b.id,ok,reason});
          };
          const timeout=setTimeout(()=>finish(false,'timeout'),9000);
          image.onload=()=>finish(image.naturalWidth>0,'loaded');
          image.onerror=()=>finish(false,'network/error');
          image.src=b.image;
        })));
      }""")
      failed=[a for a in photo_catalog if not a["ok"]]
      print("PHOTO_CATALOGUE_CHECK:",photo_catalog,flush=True)
      print("PHOTO_CATALOGUE_FAILED:",failed,flush=True)
      capture(p,'mobile_editorial_390.png')

      # Ambient visual should be local CSS, pausable and absent of autoplay media.
      p.locator('#livingHabitat').scroll_into_view_if_needed()
      p.locator('#habitatMotionToggle').click()
      assert p.locator('#livingHabitat').evaluate("(e)=>e.classList.contains('is-paused')")
      assert p.locator('#habitatMotionToggle').get_attribute("aria-pressed")=="true"
      assert p.locator('#livingHabitat video').count()==0
      capture(p,'mobile_living_habitat_390.png')

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
