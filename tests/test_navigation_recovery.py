"""User regressions: retained record, repeated species, browser Back, page pinch scope."""
import threading,json,io,zipfile
from playwright.sync_api import sync_playwright,expect
from test_cinematic_wetland import Server,Quiet,ROOT
from test_explorer_species_cluster import LEAFLET_STUB

def main():
 with Server(('127.0.0.1',0),Quiet) as srv:
  threading.Thread(target=srv.serve_forever,daemon=True).start()
  with sync_playwright() as pw:
   browser=pw.chromium.launch()
   ctx=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block')
   # Match the DOM class installed by real Leaflet, without simulating pinch itself.
   ctx.add_init_script(LEAFLET_STUB.replace('map:(el,opts)=>{',"map:(el,opts)=>{el.classList.add('leaflet-container');"))
   p=ctx.new_page();errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
   p.goto(f'http://127.0.0.1:{srv.server_address[1]}/');p.locator('#birdspotSplashSkip').click()
   # Existing data can include an incomplete entry. Merely opening the guide must not rewrite it.
   raw=json.dumps({'schemaVersion':2,'custom':'keep','sightings':[None,{'id':'test-existing','speciesId':'sp055','date':'2026-11-01','observationMethod':'heard','photoIds':[],'unknownField':42}]})
   p.evaluate('(raw)=>localStorage.setItem("birdspot-sightings",raw)',raw)
   p.locator('[data-route="species"]').click();p.locator('#speciesSearch').fill('Winterkoning')
   p.locator('.species-row[data-id="sp055"] .species-row__body').click()
   p.locator('[data-sd-tab="mijn"]').click()
   p.locator('.signature-species-sighting').wait_for()
   assert 'Gehoord' in p.locator('.signature-species-sighting').inner_text()
   assert p.evaluate('localStorage.getItem("birdspot-sightings")')==raw
   p.go_back();p.locator('.signature-species-detail-overlay').wait_for(state='detached')
   assert p.locator('#screen-species').is_visible()
   # Nested picker Back closes only the top layer; form values survive.
   p.locator('#fab').click();p.locator('#sightLocation').fill('Terugtest')
   p.locator('#speciesPickerBtn').click();p.go_back()
   p.locator('#speciesPickerOverlay').wait_for(state='detached')
   assert p.locator('#addSightingSheet').is_visible()
   assert p.locator('#sightLocation').input_value()=='Terugtest'
   p.go_back();p.locator('#addSightingSheet').wait_for(state='detached')
   assert p.locator('#screen-species').is_visible()
   # Remove only our malformed fixture, not through application code; test valid navigation too.
   p.evaluate('''()=>{const s=JSON.parse(localStorage.getItem('birdspot-sightings'));s.sightings=s.sightings.filter(Boolean);localStorage.setItem('birdspot-sightings',JSON.stringify(s));}''')
   p.locator('[data-route="profile"]').click()
   expect(p.locator('#appVersion')).not_to_have_text('versie ophalen…')
   backup=io.BytesIO()
   with zipfile.ZipFile(backup,'w',compression=zipfile.ZIP_STORED) as z:
    z.writestr('gegevens.json',json.dumps({'format':'birdspot-backup','schemaVersion':2,'sightings':[],'photoIds':[]}))
   p.locator('#importFile').set_input_files({'name':'cancel-check.zip','mimeType':'application/zip','buffer':backup.getvalue()})
   p.locator('#confirmOverlay').wait_for()
   before=p.evaluate('localStorage.getItem("birdspot-sightings")')
   p.go_back();p.locator('#confirmOverlay').wait_for(state='hidden')
   assert p.locator('#screen-profile').is_visible()
   assert p.evaluate('localStorage.getItem("birdspot-sightings")')==before
   p.go_back();p.locator('#screen-species').wait_for()
   assert p.locator('#speciesSearch').input_value()=='Winterkoning'
   p.go_back();p.locator('#screen-home').wait_for()
   p.go_forward();p.locator('#screen-species').wait_for()
   # Native page pinch is blocked outside Leaflet, while events reach map handling.
   p.locator('[data-route="map"]').click();p.locator('.leaflet-container').wait_for()
   result=p.evaluate('''()=>{
    const dispatch=target=>{const e=new Event('touchmove',{bubbles:true,cancelable:true});Object.defineProperty(e,'touches',{value:[{},{}]});target.dispatchEvent(e);return e.defaultPrevented;};
    return {page:dispatch(document.body),map:dispatch(document.querySelector('.leaflet-container'))};
   }''')
   assert result=={'page':True,'map':False},result
   assert 'maximum-scale=1' in p.locator('meta[name="viewport"]').get_attribute('content')
   p.locator('#mapAddPinBtn').click();p.locator('#mapPinPanel').wait_for();p.go_back()
   assert p.locator('#mapPinPanel').is_hidden() and p.locator('#screen-map').is_visible()
   assert not errors,errors
   print('PASS: retained malformed record safe, same-record evidence, nested Back, route Back/Forward, page/map gesture boundary')
   browser.close()
if __name__=='__main__':main()
