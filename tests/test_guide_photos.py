"""Browser integration: local guide images, uncropped layout, failure and offline cache."""
import json,threading
from playwright.sync_api import sync_playwright
from test_cinematic_wetland import Server,Quiet,ROOT

def main():
 photos=json.loads((ROOT/'assets/species/credits.json').read_text())
 guide_media=json.loads((ROOT/'assets/species/field-guide-media.json').read_text())
 variants=[v['image'] for cards in guide_media['plumage'].values() for v in cards.values() if 'image' in v]
 clips=[clip['audio'] for entries in guide_media['audio'].values() for clip in entries]
 poses=[v['image'] for cards in guide_media.get('poses', {}).values() for v in cards]
 images=[v['image'] for v in photos.values()] + variants + poses
 hero_paths=guide_media.get('heroes', {})
 by_path={v['image']:v for entries in guide_media['poses'].values() for v in entries}
 by_path.update({v['image']:v for cards in guide_media['plumage'].values() for v in cards.values() if 'image' in v})
 pictured_species={**photos, **{sid:by_path[path] for sid,path in hero_paths.items() if sid not in photos}}
 with Server(('127.0.0.1',0),Quiet) as server:
  threading.Thread(target=server.serve_forever,daemon=True).start()
  url=f'http://127.0.0.1:{server.server_address[1]}/'
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   for width in (390,1365):
    ctx=browser.new_context(viewport={'width':width,'height':844},service_workers='block')
    p=ctx.new_page();p.goto(url);p.locator('#birdspotSplashSkip').click()
    p.locator('[data-nav="species"]').click() if p.locator('[data-nav="species"]').count() else p.get_by_role('button',name='Soorten',exact=True).click()
    assert p.locator('#speciesFilters [data-cat="alle"]').get_attribute('aria-pressed') == 'true'
    for sid,photo in pictured_species.items():
     p.locator('#speciesSearch').fill(photo['nl'])
     row=p.locator(f'.species-row[data-id="{sid}"]');row.wait_for()
     if sid in photos:
      thumb=row.locator('.species-guide-thumb img')
      assert thumb.get_attribute('src')==photo['image']
      assert thumb.evaluate('(i)=>getComputedStyle(i).objectFit')=='contain'
     row.click()
     hero=p.locator(f'#detailThumb-{sid} img')
     p.wait_for_function('(id)=>{const i=document.querySelector("#detailThumb-"+id+" img");return i&&i.complete&&i.naturalWidth>0}',arg=sid)
     assert hero.get_attribute('src')==hero_paths.get(sid, photo['image']), (sid, hero.get_attribute('src'), photo['image'])
     assert hero.evaluate('(i)=>getComputedStyle(i).objectFit')=='contain'
     credit=p.locator(f'#detailThumb-{sid} .photo-info')
     assert credit.locator('summary').is_visible()
     assert not credit.locator('.photo-info__panel').is_visible()
     if sid == 'sp045':
      credit.locator('summary').click()
      shown=by_path.get(hero_paths.get(sid), photo)  # sinds de bronaudit van 9-11 heeft sp045 een aparte hoofdfoto
      assert credit.get_by_role('link', name='Open fotobron').get_attribute('href') == shown['source']
      assert shown['author'] in credit.inner_text()
      p.keyboard.press('Escape')
      assert not credit.locator('.photo-info__panel').is_visible()
     if sid == 'sp173':
      gallery=p.locator('[data-plumage="adult_f"] .sd-plumage-gallery')
      sitting=gallery.locator('img[src$="-female-rest.webp"]')
      flight=gallery.locator('img[src$="-adult_f.webp"]')
      sitting.evaluate('i => i.decode()')
      flight.evaluate('i => i.decode()')
      a,b=sitting.bounding_box(),flight.bounding_box()
      if width > 390:
       assert abs(a['y']-b['y']) < 2 and abs(a['x']-b['x']) > 30
      else:
       assert abs(a['x']-b['x']) < 2 and abs(a['y']-b['y']) > 50
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
   p.wait_for_function('''async urls=>{const c=await caches.open('birdspot-media');return (await Promise.all(urls.map(u=>c.match(u)))).every(Boolean)}''',arg=images+clips,timeout=90000)
   p.wait_for_function('()=>!!navigator.serviceWorker.controller')
   ctx.set_offline(True)
   results=p.evaluate('''async urls=>Promise.all(urls.map(u=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.naturalWidth>0);i.onerror=()=>resolve(false);i.src=u})))''',images)
   assert all(results);print(f'PASS {len(images)} photos decode offline after precache',flush=True)
   audio_results=p.evaluate('''async urls=>{
     const audio=new AudioContext();
     const results=await Promise.all(urls.map(async url=>{
       const res=await fetch(url,{headers:{Range:'bytes=0-31'}});
       const full=await fetch(url);
       const decoded=await audio.decodeAudioData(await full.arrayBuffer());
       return res.status===206 && (await res.arrayBuffer()).byteLength===32 && decoded.duration>0;
     }));
     await audio.close();
     return results;
   }''',clips)
   assert all(audio_results);print(f'PASS {len(clips)} field recordings decode and respond to offline range requests',flush=True)

   # A first installation must also boot and open a guide photo after an offline reload.
   p.reload(wait_until='domcontentloaded')
   p.locator('#birdspotSplashSkip').click()
   p.get_by_role('button',name='Soorten',exact=True).click()
   assert p.locator('#speciesFilters [data-cat="alle"]').get_attribute('aria-pressed') == 'true'
   sid='sp057'  # Fitis heeft zowel een lokale gidsfoto als een soortkaart.
   photo=photos[sid]
   p.locator('#speciesSearch').fill(photo['nl'])
   p.locator(f'.species-row[data-id="{sid}"]').click()
   p.wait_for_function('(id)=>{const i=document.querySelector("#detailThumb-"+id+" img");return i&&i.complete&&i.naturalWidth>0}',arg=sid)
   p.get_by_label('Zang van Fitis').evaluate('el => el.play()')
   p.wait_for_function("document.querySelector('.sd-audio audio').currentTime > 0.15")
   p.get_by_role('tab',name='Waar',exact=True).click()
   p.locator('.sd-distribution-map').wait_for()
   assert p.locator('.sd-distribution-marks circle').count() >= 3
   assert p.get_by_role('columnheader', name='Openbare meldingen per vak').is_visible()
   print('PASS offline reload, species search, guide photo, playback and distribution',sid,flush=True)
   browser.close()
if __name__=='__main__':main()
