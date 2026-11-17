"""Maak een ZIP-fixture met de exportcode van een oude Birdspot-commit (hier fb59085 = 1.27.31-lijn)."""
import functools, http.server, sys, threading
from playwright.sync_api import sync_playwright
root, out = sys.argv[1], sys.argv[2]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv = http.server.ThreadingHTTPServer(("127.0.0.1",0), functools.partial(Q, directory=root))
threading.Thread(target=srv.serve_forever, daemon=True).start()
url=f"http://127.0.0.1:{srv.server_address[1]}/"
with sync_playwright() as pw:
    b=pw.chromium.launch(); c=b.new_context(service_workers="block", accept_downloads=True); p=c.new_page()
    p.goto(url); p.locator("#birdspotSplash").wait_for(state="detached", timeout=30000)
    p.evaluate("""async () => {
      localStorage.setItem('birdspot-places', JSON.stringify({schemaVersion:1, places:[
        {id:'pl_old_a', name:'Oude Plas', lat:52.30001, lon:5.60002, createdAt:'2026-05-01T08:00:00.000Z', updatedAt:'2026-05-01T08:00:00.000Z'}]}));
      localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2, sightings:[
        {id:'old_s1', speciesId:'sp045', speciesName:'Merel', date:'2026-05-01', time:'08:15', count:1, certainty:'certain',
         lat:52.30011, lon:5.60012, pinAccuracyM:6, placeId:'pl_old_a', locationName:'Oude Plas', photoIds:['old_f1'],
         notes:'BIRDSPOT-PRE-R2B-FIXTURE', createdAt:'2026-05-01T08:16:00.000Z', updatedAt:'2026-05-01T08:16:00.000Z'}]}));
      const c = document.createElement('canvas'); c.width = 24; c.height = 16;
      const g = c.getContext('2d'); g.fillStyle = '#2a6'; g.fillRect(0,0,24,16);
      const png = await new Promise(r => c.toBlob(r, 'image/png'));
      const { savePhoto } = await import('/src/data/db.js');
      await savePhoto({ id:'old_f1', blob:png, type:'image/png', filename:'merel.png', speciesId:'sp045', sightingId:'old_s1', addedAt:'2026-05-01T08:16:00.000Z' });
      g.fillStyle = '#c84'; g.fillRect(0,0,24,16);
      const png2 = await new Promise(r => c.toBlob(r, 'image/png'));
      await savePhoto({ id:'pm_old_k4', blob:png2, type:'image/png', filename:'plek.png', speciesId:null, sightingId:null, placeId:'pl_old_a', addedAt:'2026-05-02T09:00:00.000Z' });
    }""")
    p.locator('.nav-item[data-route="profile"]').click(); p.locator("#btnExport").wait_for()
    with p.expect_download() as dl: p.locator("#btnExport").click()
    dl.value.save_as(out); b.close()
print("fixture", out)
