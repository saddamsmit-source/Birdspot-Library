"""Birdspot Phase 2 smoke checks: independent browser profile."""
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args): pass
class Server(socketserver.TCPServer):
    allow_reuse_address=True

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            ctx=browser.new_context(viewport={"width":390,"height":844},
                                    reduced_motion="reduce",service_workers="block")
            p=ctx.new_page()
            errors=[]
            p.on("pageerror",lambda err:errors.append(str(err)))
            p.goto("http://127.0.0.1:"+str(server.server_address[1])+"/")
            p.evaluate("""async () => {
              const {getDB}=await import('/src/data/db.js');
              const db=await getDB();
              const svg='<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="green"/></svg>';
              const blob=new Blob([svg],{type:'image/svg+xml'});
              await new Promise((resolve,reject)=>{
                const tx=db.transaction('photos','readwrite');
                tx.objectStore('photos').put({id:'test-media-1',
                  speciesId:'sp001',sightingId:'test-sighting-1',blob,
                  type:'image/svg+xml',filename:'test.svg'});
                tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
              });
              localStorage.setItem('birdspot-sightings',JSON.stringify({schemaVersion:2,
                sightings:[{id:'test-sighting-1',speciesId:'sp001',
                  speciesName:'Stadsduif',date:'2026-10-28',
                  locationName:'Testpark',photoIds:['test-media-1'],count:1}]}));
            }""")
            p.locator('.nav-item[data-route="species"]').click()
            p.locator(".signature-species-hero").wait_for()
            assert p.locator(".species-row").count()>0
            p.locator(".species-row[data-id='sp001'] [data-species-fav]").click()
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-favorite-species')).includes('sp001')")
            p.locator("#speciesOnlyFavorites").click()
            assert p.locator(".species-row").count()==1
            p.locator(".species-row[data-id='sp001'] .species-row__body").click()
            p.locator(".signature-species-detail-overlay").wait_for()
            p.locator(".signature-species-photo-tile").first.wait_for(timeout=8000)
            assert "Stadsduif" in p.locator(".signature-species-detail-intro").inner_text()
            p.locator(".signature-species-detail-close").click()
            p.locator('.nav-item[data-route="home"]').click()
            p.locator('[data-signature-route="media"]').click()
            p.locator(".signature-media-v2").wait_for()
            p.locator(".signature-media-tile").first.wait_for(timeout=8000)
            p.locator('[data-media-fav="test-media-1"]').click()
            p.locator('[data-media-film="test-media-1"]').click()
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-favorite-media')).includes('test-media-1')")
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-film-selection')).includes('test-media-1')")
            assert p.locator("#mediaSearch").count()==1
            assert p.locator('[data-media-filter="favorites"]').count()==1
            assert p.locator('[data-media-filter="film"]').count()==1
            for width in (360,390,430):
                p.set_viewport_size({"width":width,"height":844})
                assert p.locator(".signature-media-v2").is_visible()
            assert not errors,errors
            print("PASS: Species & Media smoke, favorites and responsive")
            ctx.close()
            browser.close()
        server.shutdown()

if __name__=="__main__":
    main()
