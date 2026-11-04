"""Birdspot field observations: manual pins and Merlin sound evidence.
Synthetic private data only; validates independent records, media and backup.
"""
from __future__ import annotations
import http.server, socketserver, threading, tempfile, zipfile, json, base64
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/"tests"/"screenshots"
SHOTS.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
    def log_message(self,*a):pass
class Server(socketserver.TCPServer):allow_reuse_address=True

def select_species(page):
    page.locator("#speciesPickerBtn").click()
    page.locator('#spPickerList .species-row[data-id="sp001"]').click()
    page.locator("#speciesPickerBtn .species-picker-btn__name").wait_for(timeout=8000)
    assert "Stadsduif" in page.locator("#speciesPickerBtn").inner_text()

def choose_pin(page,lat,lon):
    page.locator("#sightPinBtn").click()
    page.locator("#pinLat").wait_for(timeout=9000)
    page.locator("#pinLat").fill(str(lat))
    page.locator("#pinLon").fill(str(lon))
    assert page.locator("#pinConfirm").is_enabled()
    page.locator("#pinConfirm").click()
    page.locator("#pinLocationMap").wait_for(state="detached",timeout=9000)
    assert str(lat)[:4] in page.locator("#coordsHint").inner_text()

def save(page):
    page.locator("#addSheetSubmit").click()
    page.locator("#addSightingSheet").wait_for(state="detached",timeout=12000)
    return page.evaluate("""() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings""")

def seed_media_files(page):
    # Generate a real local WebM clip, attach with a separate image through
    # the exact HTML file-input control users would use on their phone.
    page.evaluate("""async () => {
      const svg='<svg xmlns="http://www.w3.org/2000/svg" width="80" height="60"><rect width="80" height="60" fill="green"/></svg>';
      const canvas=document.createElement('canvas');
      canvas.width=80;canvas.height=60;
      canvas.getContext('2d').fillRect(0,0,80,60);
      const stream=canvas.captureStream(10),parts=[];
      const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
      const done=new Promise(resolve=>recorder.onstop=resolve);
      recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
      recorder.start();await new Promise(resolve=>setTimeout(resolve,800));
      recorder.stop();await done;stream.getTracks().forEach(x=>x.stop());
      const transfer=new DataTransfer();
      transfer.items.add(new File([svg],'brabant.svg',{type:'image/svg+xml'}));
      transfer.items.add(new File(parts,'brabant.webm',{type:'video/webm'}));
      const input=document.getElementById('sightingMediaInput');
      input.files=transfer.files;
      input.dispatchEvent(new Event('change',{bubbles:true}));
    }""")
    page.locator("#mediaAttachRow .media-thumb").first.wait_for(timeout=8000)
    inputs=page.evaluate("""() => ({
      fileCount:document.getElementById('sightingMediaInput').files.length,
      visibleThumbs:document.querySelectorAll('#mediaAttachRow .media-thumb').length
    })""")
    assert inputs=={"fileCount":2,"visibleThumbs":2},inputs

def main():
    with Server(("127.0.0.1",0),Handler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            context=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce",
                                        service_workers="block",accept_downloads=True)
            page=context.new_page();errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            page.goto("http://127.0.0.1:"+str(server.server_address[1])+"/",wait_until="domcontentloaded")
            page.locator("#fab").click()
            page.locator("#addSightingSheet.open").wait_for(timeout=9000)
            select_species(page)
            page.locator('#sightSourceGroup input[value="merlin"]').check()
            assert page.locator('#sightMethodGroup input[value="heard"]').is_checked()
            assert page.locator('#certaintyGroup input[value="possible"]').is_checked()
            assert page.locator("#sightMerlinChecked").is_visible()
            page.locator("#sightLocation").fill("Brabant testpark")
            choose_pin(page,51.59,5.09)
            seed_media_files(page)
            page.screenshot(path=str(SHOTS/"sighting_merlin_form_390.png"),animations="disabled")
            first=save(page)
            assert len(first)==1
            heard=first[0]
            assert heard["observationMethod"]=="heard" and heard["identificationSource"]=="merlin"
            assert heard["merlinVerification"]=="suggested" and heard["certainty"]=="possible"
            assert heard["locationName"]=="Brabant testpark"
            assert abs(heard["lat"]-51.59)<0.0001 and abs(heard["lon"]-5.09)<0.0001
            assert len(heard["photoIds"])==2,heard
            assert not page.evaluate("""() => JSON.parse(localStorage.getItem('birdspot-seen-species')||'[]').includes('sp001')""")
            files=page.evaluate("""async ids=>{
              const {getPhoto}=await import('/src/data/db.js');
              return await Promise.all(ids.map(async id=>{
                const p=await getPhoto(id);return {id,type:p.type,size:p.blob.size,sightingId:p.sightingId};
              }));
            }""",heard["photoIds"])
            assert {f["type"] for f in files}=={"image/svg+xml","video/webm"}
            assert all(f["sightingId"]==heard["id"] for f in files),files

            # Another observation of the very same species, now seen in Limburg.
            page.locator("#fab").click()
            select_species(page)
            page.locator("#sightLocation").fill("Limburg testbos")
            choose_pin(page,50.95,5.83)
            page.screenshot(path=str(SHOTS/"sighting_manual_pin_390.png"),animations="disabled")
            all_records=save(page)
            assert len(all_records)==2
            seen=next(x for x in all_records if x["id"]!=heard["id"])
            assert seen["observationMethod"]=="seen" and seen["identificationSource"]=="self"
            assert seen["lat"]!=heard["lat"] and seen["lon"]!=heard["lon"]
            assert seen["locationName"]=="Limburg testbos" and seen["photoIds"]==[]
            assert page.evaluate("""() => JSON.parse(localStorage.getItem('birdspot-seen-species')||'[]').includes('sp001')""")

            # Third sighting must not toggle the seen species OFF.
            page.locator("#fab").click()
            select_species(page)
            third=save(page)
            assert len(third)==3
            assert page.evaluate("""() => JSON.parse(localStorage.getItem('birdspot-seen-species')||'[]').includes('sp001')""")

            # Old records without an observationMethod remain unlabeled, not falsely "seen".
            page.evaluate("""() => {
              const s=JSON.parse(localStorage.getItem('birdspot-sightings'));
              s.sightings.push({id:'legacy',speciesId:'sp001',speciesName:'Stadsduif',
                date:'2026-10-20',locationName:'Oude invoer',photoIds:[]});
              localStorage.setItem('birdspot-sightings',JSON.stringify(s));
            }""")
            page.locator('.nav-item[data-route="sightings"]').click()
            page.locator("#sightingCards").wait_for(timeout=11000)
            assert page.locator('.sight-card[data-id="'+heard["id"]+'"] .sighting-merlin-pill').count()==1
            assert page.locator('.sight-card[data-id="'+heard["id"]+'"] .sighting-observed-pill').count()==1
            assert page.locator('.sight-card[data-id="legacy"] .sighting-observed-pill').count()==0

            # Separate geolocated pins on Explorer Map, no publicly shared data.
            page.locator('.nav-item[data-route="map"]').click()
            page.locator("#mapAddPinBtn").wait_for(timeout=11000)
            page.wait_for_function("() => document.getElementById('mapCount')?.textContent !== 'laden…'",timeout=13000)
            assert "2 van 4 pins" in page.locator("#mapCount").inner_text()
            page.screenshot(path=str(SHOTS/"sighting_explorer_pins_390.png"),animations="disabled")
            page.locator("#mapAddPinBtn").click()
            if page.locator("#pinLocationMap").count():
                page.locator("#pinLat").fill("51.48")
                page.locator("#pinLon").fill("5.46")
                page.locator("#pinConfirm").click()
                page.locator("#addSightingSheet").wait_for(timeout=11000)
                assert "51.48" in page.locator("#coordsHint").inner_text()
                page.locator("#addSheetCancel").click()
            else:
                # Leaflet mode: click map to start a brand-new pre-pinned record.
                page.locator("#leafletMap").click(position={"x":180,"y":170})
                page.locator("#addSightingSheet").wait_for(timeout=11000)
                assert "📍" in page.locator("#coordsHint").inner_text()
                page.locator("#addSheetCancel").click()

            # Existing ZIP backup must retain evidence and separate media links.
            with tempfile.TemporaryDirectory() as folder:
                with page.expect_download(timeout=17000) as result:
                    page.evaluate("""async () => {
                      const {exportBackup}=await import('/src/storage/backup.js');
                      await exportBackup();
                    }""")
                archive=Path(folder)/"backup.zip"
                result.value.save_as(str(archive))
                with zipfile.ZipFile(archive) as z:
                    data=json.loads(z.read("gegevens.json"))
                    names=z.namelist()
                    for mid in heard["photoIds"]:
                        assert any(name.startswith("photos/"+mid+".") for name in names), names
                    assert any(name.endswith(".webm") for name in names), names
                    assert any(name.endswith(".svg") for name in names), names
                restored=next(x for x in data["sightings"] if x["id"]==heard["id"])
                assert restored["identificationSource"]=="merlin"
                assert restored["observationMethod"]=="heard"
                assert len(restored["photoIds"])==2
                # Remove both synthetic media from IDB and prove ZIP restore brings them back.
                page.evaluate("""async ids=>{
                  const {getDB}=await import('/src/data/db.js');
                  const db=await getDB();
                  await new Promise((resolve,reject)=>{
                    const tx=db.transaction('photos','readwrite');
                    ids.forEach(id=>tx.objectStore('photos').delete(id));
                    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
                  });
                }""",heard["photoIds"])
                encoded=base64.b64encode(archive.read_bytes()).decode("ascii")
                page.evaluate("""async encoded=>{
                  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
                  const {importBackup}=await import('/src/storage/backup.js');
                  await importBackup(new File([bytes],'birdspot-check.zip',{type:'application/zip'}));
                }""",encoded)
                media=page.evaluate("""async ids=>{
                  const {getPhoto}=await import('/src/data/db.js');
                  return Promise.all(ids.map(async id=>{
                    const x=await getPhoto(id);return {type:x?.type,size:x?.blob?.size};
                  }));
                }""",heard["photoIds"])
                assert {m["type"] for m in media}=={"image/svg+xml","video/webm"},media
                assert all(m["size"]>0 for m in media),media
            assert not errors,errors
            print("PASS: pin seen/heard, Merlin pending, unique sightings, image/video, backup and legacy")
            context.close();browser.close()
        server.shutdown()
if __name__=="__main__":main()
