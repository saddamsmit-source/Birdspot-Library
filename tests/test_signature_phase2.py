"""Birdspot Phase 2 smoke checks: independent browser profile."""
import http.server
import tempfile
import zipfile
import json
import base64
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True,exist_ok=True)

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
            p.locator('#birdspotSplashSkip').click()
            p.locator('#birdspotSplash').wait_for(state='detached')
            p.locator('#stat-photos').click()
            p.locator('#mediaFirstSighting').click()
            p.locator('#addSightingSheet').wait_for()
            p.locator('#addSheetCancel').click()
            assert p.locator('#mediaFirstSighting').is_visible()
            p.evaluate("""async () => {
              const {getDB}=await import('/src/data/db.js');
              const db=await getDB();
              const svg='<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="green"/></svg>';
              const blob=new Blob([svg],{type:'image/svg+xml'});
              await new Promise((resolve,reject)=>{
                const tx=db.transaction('photos','readwrite');
                tx.objectStore('photos').put({id:'test-media-1',
                  speciesId:'sp002',sightingId:'test-sighting-1',blob,
                  type:'image/svg+xml',filename:'test.svg'});
                tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
              });
              localStorage.setItem('birdspot-sightings',JSON.stringify({schemaVersion:2,
                sightings:[{id:'test-sighting-1',speciesId:'sp002',
                  speciesName:'Houtduif',date:'2026-10-28',
                  locationName:'Testpark',photoIds:['test-media-1'],count:1}]}));
            }""")
            p.locator('.nav-item[data-route="species"]').click()
            p.locator(".signature-species-hero").wait_for()
            assert p.locator(".species-row").count()>0
            p.locator(".species-row[data-id='sp002'] [data-species-fav]").click()
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-favorite-species')).includes('sp002')")
            p.locator("#speciesOnlyFavorites").click()
            assert p.locator(".species-row").count()==1
            p.evaluate("() => document.getElementById('main-view').scrollTo(0,0)")
            p.screenshot(path=str(SHOTS/"phase2_species_overview_390.png"),full_page=True,animations="disabled")
            row = p.locator(".species-row[data-id='sp002'] .species-row__name")
            row.focus()
            row.press("Enter")
            p.locator(".signature-species-detail-overlay").wait_for()
            p.locator(".signature-species-photo-tile").first.wait_for(timeout=8000)
            assert "Houtduif" in p.locator(".signature-species-detail-intro").inner_text()
            p.screenshot(path=str(SHOTS/"phase2_species_detail_390.png"),full_page=True,animations="disabled")
            p.keyboard.press("Escape")
            p.locator(".signature-species-detail-overlay").wait_for(state="detached")
            assert row.evaluate("(node) => document.activeElement === node")
            assert p.locator("#speciesOnlyFavorites").get_attribute("aria-pressed") == "false"
            assert p.locator(".species-row").count() > 1
            p.locator('.nav-item[data-route="home"]').click()
            p.locator("#stat-photos").click()
            p.locator(".signature-media-v2").wait_for()
            p.locator(".signature-media-tile").first.wait_for(timeout=8000)
            p.locator('#mediaSearch').fill('Geen bestaande testplek')
            p.locator('#mediaReset').click()
            assert p.locator('#mediaSearch').input_value() == ''
            favorite = p.locator('[data-media-fav="test-media-1"]')
            favorite.focus()
            favorite.press('Space')
            assert favorite.evaluate("(node) => document.activeElement === node")
            p.locator('[data-media-film="test-media-1"]').click()
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-favorite-media')).includes('test-media-1')")
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-film-selection')).includes('test-media-1')")
            p.evaluate("() => document.getElementById('main-view').scrollTo(0,0)")
            p.screenshot(path=str(SHOTS/"phase2_media_390.png"),full_page=True,animations="disabled")
            assert p.locator("#mediaSearch").count()==1
            assert p.locator('[data-media-filter="favorites"]').count()==1
            assert p.locator('[data-media-filter="film"]').count()==1
            with tempfile.TemporaryDirectory() as work:
                with p.expect_download(timeout=18000) as out:
                    p.evaluate("""async () => {
                        const b=await import('/src/storage/backup.js');
                        await b.exportBackup();
                    }""")
                path=Path(work)/"birdspot.zip"
                out.value.save_as(str(path))
                with zipfile.ZipFile(path) as package:
                    payload=json.loads(package.read("gegevens.json"))
                assert "sp002" in payload["collections"]["species"]
                assert "test-media-1" in payload["collections"]["media"]
                assert "test-media-1" in payload["collections"]["film"]
                assert payload["sightings"][0]["id"]=="test-sighting-1"
                p.evaluate("""() => {
                    localStorage.removeItem('birdspot-favorite-species');
                    localStorage.removeItem('birdspot-favorite-media');
                    localStorage.removeItem('birdspot-film-selection');
                }""")
                encoded=base64.b64encode(path.read_bytes()).decode("ascii")
                p.evaluate("""async encoded => {
                    const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
                    const file=new File([bytes],'birdspot.zip',{type:'application/zip'});
                    const b=await import('/src/storage/backup.js');
                    await b.importBackup(file);
                }""",encoded)
                for key,item in [('birdspot-favorite-species','sp002'),
                                 ('birdspot-favorite-media','test-media-1'),
                                 ('birdspot-film-selection','test-media-1')]:
                    assert p.evaluate("(pair)=>JSON.parse(localStorage.getItem(pair[0])||'[]').includes(pair[1])",[key,item]),key
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
