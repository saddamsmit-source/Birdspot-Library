"""Browser integration: local guide images, uncropped layout, failure and offline cache."""
import json,threading
from playwright.sync_api import sync_playwright
from test_cinematic_wetland import Server,Quiet,ROOT

def main():
 photos=json.loads((ROOT/'assets/species/credits.json').read_text())
 with Server(('127.0.0.1',0),Quiet) as server:
  threading.Thread(target=server.serve_forever,daemon=True).start()
  url=f'http://127.0.0.1:{server.server_address[1]}/'
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   for width in (390,1365):
    ctx=browser.new_context(viewport={'width':width,'height':844},service_workers='block')
    p=ctx.new_page();p.goto(url);p.locator('#birdspotSplashSkip').click()
    p.locator('[data-nav="species"]').click() if p.locator('[data-nav="species"]').count() else p.get_by_role('button',name='Soorten',exact=True).click()
    p.locator('#speciesFiltersToggle').click()
    p.locator('#speciesFilters').get_by_role('button',name='Alle',exact=True).click()
    for sid,photo in photos.items():
     p.locator('#speciesSearch').fill(photo['nl'])
     row=p.locator(f'.species-row[data-id="{sid}"]');row.wait_for();row.click()
     hero=p.locator(f'#detailThumb-{sid} img')
     p.wait_for_function('(id)=>{const i=document.querySelector("#detailThumb-"+id+" img");return i&&i.complete&&i.naturalWidth>0}',arg=sid)
     assert hero.get_attribute('src')==photo['image']
     assert hero.evaluate('(i)=>getComputedStyle(i).objectFit')=='contain'
     assert p.locator('.species-guide-credit').is_visible()
     # The title must not obscure the photo.
     geometry=p.evaluate('''(id)=>{const i=document.querySelector('#detailThumb-'+id+' img').getBoundingClientRect();const t=document.querySelector('.signature-species-detail-intro').getBoundingClientRect();return {imageBottom:i.bottom,titleTop:t.top}}''',sid)
     assert geometry['titleTop'] >= geometry['imageBottom'], (width,sid,geometry)
     p.get_by_role('button',name='Sluit soortdetail',exact=True).click()
     p.locator('.signature-species-detail-overlay').wait_for(state='detached')
    # Explicit broken-photo state, no unrelated external fallback image.
    ctx.route('**/assets/species/sp029.webp',lambda route:route.abort())
    p.locator('#speciesSearch').fill('Koolmees');p.locator('.species-row[data-id="sp029"]').click()
    p.get_by_text('Gidsfoto niet beschikbaar',exact=True).wait_for()
    ctx.close();print('PASS guide display and failure',width,flush=True)
   ctx=browser.new_context();p=ctx.new_page();p.goto(url)
   # Wait for actual precached media, not merely SW registration.
   p.wait_for_function('''async urls=>{const c=await caches.open('birdspot-media');return (await Promise.all(urls.map(u=>c.match(u)))).every(Boolean)}''',arg=[v['image'] for v in photos.values()],timeout=90000)
   p.wait_for_function('()=>!!navigator.serviceWorker.controller')
   ctx.set_offline(True)
   results=p.evaluate('''async urls=>Promise.all(urls.map(u=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth>0);i.onerror=()=>resolve(false);i.src=u})))''',[v['image'] for v in photos.values()])
   assert all(results);print(f'PASS {len(photos)} photos decode offline after precache',flush=True)
   browser.close()
if __name__=='__main__':main()
