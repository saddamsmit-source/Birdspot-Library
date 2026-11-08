"""Phase 4 Film Studio: real local media, storyboard and downloadable video.
Tests run in an isolated browser profile against synthetic bird records.
"""
import http.server, socketserver, tempfile, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots";SHOTS.mkdir(parents=True,exist_ok=True)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kw):super().__init__(*args,directory=str(ROOT),**kw)
    def log_message(self,*a):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

def capture(p,name):
    p.locator("#main-view").evaluate("(el)=>el.scrollTop=0")
    p.screenshot(path=str(SHOTS/name),animations="disabled")

def main():
    with Server(("127.0.0.1",0),Handler) as srv:
        threading.Thread(target=srv.serve_forever,daemon=True).start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            ctx=browser.new_context(viewport={"width":390,"height":844},
                                    reduced_motion="reduce",service_workers="block",
                                    accept_downloads=True)
            p=ctx.new_page();errors=[]
            p.on("pageerror",lambda err:errors.append(str(err)))
            p.goto("http://127.0.0.1:"+str(srv.server_address[1])+"/",wait_until="domcontentloaded")
            p.locator("#homeMoreFeatures summary").click()
            p.locator('#homeMoreFeatures [data-signature-route="film"]').click()
            p.locator(".film-studio-empty").wait_for(timeout=10000)
            assert p.locator("#filmEditor").is_hidden()
            assert "Kies mijn beelden" in p.locator("#filmEmptyState").inner_text()
            assert p.locator("#filmEstimate").inner_text()=="—"
            capture(p,"phase4_empty_390.png")
            p.locator('#filmEmptyState [data-film-route="media"]').click()
            p.locator(".signature-media-v2").wait_for(timeout=10000)

            # Put one real picture and one playable synthetic video into canonical IDB.
            fixture=p.evaluate("""async () => {
              const {getDB}=await import('/src/data/db.js'),db=await getDB();
              const svg='<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#1c765a"/><circle cx="178" cy="81" r="46" fill="#e9b773"/></svg>';
              const image=new Blob([svg],{type:'image/svg+xml'});
              const c=document.createElement('canvas');
              c.width=320;c.height=200;
              const draw=c.getContext('2d');
              draw.fillStyle='#205b55';draw.fillRect(0,0,320,200);
              draw.fillStyle='#dab67c';draw.fillRect(130,60,50,60);
              const stream=c.captureStream(12),chunks=[];
              const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
              const done=new Promise(resolve=>{recorder.onstop=resolve});
              recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
              recorder.start();
              await new Promise(resolve=>setTimeout(resolve,900));
              recorder.stop();await done;
              stream.getTracks().forEach(x=>x.stop());
              const video=new Blob(chunks,{type:'video/webm'});
              await new Promise((resolve,reject)=>{
                const tx=db.transaction('photos','readwrite');
                tx.objectStore('photos').put({id:'p4-photo',blob:image,
                  type:'image/svg+xml',filename:'bird.svg',
                  sightingId:'p4-a',speciesId:'sp001'});
                tx.objectStore('photos').put({id:'p4-video',blob:video,
                  type:'video/webm',filename:'bird.webm',
                  sightingId:'p4-b',speciesId:'sp002'});
                tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
              });
              localStorage.setItem('birdspot-sightings',JSON.stringify({schemaVersion:2,
                sightings:[
                {id:'p4-a',speciesId:'sp001',speciesName:'Stadsduif',date:'2026-10-30',
                 locationName:'Testbos',photoIds:['p4-photo'],count:1},
                {id:'p4-b',speciesId:'sp002',speciesName:'Houtduif',date:'2026-10-31',
                 locationName:'Testmeer',photoIds:['p4-video'],count:1}]}));
              localStorage.setItem('birdspot-film-selection',
                JSON.stringify(['p4-photo','p4-video']));
              return {imageBytes:image.size,videoBytes:video.size};
            }""")
            assert fixture["imageBytes"]>100
            assert fixture["videoBytes"]>500,fixture
            p.locator('.nav-item[data-route="home"]').click()
            p.locator("#homeMoreFeatures summary").click()
            p.locator('#homeMoreFeatures [data-signature-route="film"]').click()
            p.locator(".film-studio-shot").first.wait_for(timeout=10000)
            assert p.locator(".film-studio-shot").count()==2
            assert p.locator("#filmSelectedCount").inner_text()=="2"
            assert p.locator("#filmPreview img").count()==1
            p.locator("#filmPreview .film-studio-photo").click()
            zoom = p.get_by_role("dialog", name="Vogelfoto bekijken")
            zoom.get_by_role("button", name="Inzoomen").click()
            assert zoom.get_by_role("button", name="Zoom herstellen").inner_text() == "2×"
            p.keyboard.press("Escape")
            zoom.wait_for(state="detached")
            assert p.locator("#filmExport").is_enabled()
            capture(p,"phase4_storyboard_390.png")
            p.locator('[data-film-move="0"][data-direction="1"]').click()
            assert p.evaluate("() => JSON.parse(localStorage.getItem('birdspot-film-selection'))[0]")=="p4-video"
            p.locator('[data-film-aspect="portrait"]').click()
            assert p.locator("#filmPreview").evaluate("(el)=>el.classList.contains('is-portrait')")
            p.locator('[data-film-seconds="5"]').click()
            assert "15 sec" in p.locator("#filmEstimate").inner_text()
            p.locator('[data-film-seconds="3"]').click()
            p.locator('[data-film-aspect="landscape"]').click()
            p.locator("#filmTitle").fill("Birdspot Mijn Vogelverhaal")
            p.locator('[data-film-step="1"]').click()
            assert p.locator("#filmPreview").count()==1

            # Export must produce real encoded video and a working download action.
            p.locator("#filmExport").click()
            p.wait_for_function("""() => {
              const result=document.getElementById('filmResult');
              const text=document.getElementById('filmMessage')?.textContent||'';
              return (!!result&&!result.hidden)||/mislukt|geannuleerd|niet ondersteund/i.test(text);
            }""",timeout=35000)
            assert p.locator("#filmResult").is_visible(), (p.locator("#filmMessage").inner_text()+" | Stap: "+p.locator("#filmProgressLabel").inner_text())
            result=p.evaluate("""async () => {
              const link=document.getElementById('filmDownload');
              const res=await fetch(link.href);
              const data=await res.blob();
              return {mime:data.type,size:data.size,name:link.download,
                      selected:JSON.parse(localStorage.getItem('birdspot-film-selection'))};
            }""")
            assert result["size"]>5000,result
            assert result["mime"] in ("video/webm","video/mp4"),result
            assert result["name"].endswith((".webm",".mp4")),result
            assert result["selected"]==["p4-video","p4-photo"]
            p.wait_for_function("""() => {
              const video=document.getElementById('filmResultVideo');
              return !!video && video.readyState>=1 && video.videoWidth>0 && video.videoHeight>0;
            }""",timeout=15000)
            p.locator("#filmResult").scroll_into_view_if_needed()
            p.screenshot(path=str(SHOTS/"phase4_result_visible_390.png"),animations="disabled")
            capture(p,"phase4_export_ready_390.png")
            with tempfile.TemporaryDirectory() as d:
                with p.expect_download(timeout=15000) as dl:
                    p.locator("#filmDownload").click()
                dest=Path(d)/result["name"]
                dl.value.save_as(str(dest))
                assert dest.stat().st_size>5000

            # Original source records and image/video blobs remain untouched.
            state=p.evaluate("""async () => {
              const {getPhoto}=await import('/src/data/db.js');
              const a=await getPhoto('p4-photo'),b=await getPhoto('p4-video');
              const sightings=JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
              return {photoSize:a.blob.size,videoSize:b.blob.size,sightings:sightings.length};
            }""")
            assert state=={"photoSize":fixture["imageBytes"],
                           "videoSize":fixture["videoBytes"],"sightings":2}
            for width in (360,390,430):
                p.set_viewport_size({"width":width,"height":844})
                assert p.locator("#filmDownload").is_visible()
                capture(p,f"phase4_{width}.png")
            p.locator("#filmBackToMedia").click()
            p.locator("#mediaOpenFilmStudio").wait_for()
            assert not errors,errors
            print("PASS: Film Studio real picture/video, reorder, export, download, preserved source")
            ctx.close();browser.close()
        srv.shutdown()

if __name__=="__main__":main()
