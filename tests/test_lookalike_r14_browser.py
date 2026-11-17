"""F3-R14 (Grote Lijster, Roodborst, Zwarte Roodstaart): paired real, decoded lookalike photos + text on 320/360/390px.
Structural UI/browser proof only. No independent original-photo rights or physical phone claim.
"""
import threading
from pathlib import Path
from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SHOTS = ROOT / 'tests' / 'screenshots' / 'lookalike_r14'
CASES = [
    ('Grote Lijster', 'sp049', 'sp046', 'volwassen'),
    ('Roodborst', 'sp050', 'sp053', 'juvenielen'),
    ('Zwarte Roodstaart', 'sp051', 'sp178', 'mannetjes/vrouwtjes'),
]

def open_pair(p, other):
    # Other comparison groups may take precedence and put this pair inside
    # the accessible 'Nog X soorten' disclosure. Open it, not a hidden DOM stub.
    for details in p.locator('details.sd-cmp-more').all():
        if details.locator(f'[data-compare-species="{other}"]').count() and not details.get_attribute('open'):
            details.locator('xpath=./summary').click()
    target=p.locator(f'#sdPanel-herkenning .sd-cmp-panel:has([data-compare-species="{other}"])').first
    expect(target).to_have_count(1)
    if target.get_attribute('hidden') is not None:
        card=target.locator('xpath=ancestor::div[contains(@class,"sd-cmp-card")]').first
        index=target.evaluate("""element => [...element.parentElement.children].filter(x=>x.classList.contains('sd-cmp-panel')).indexOf(element)""")
        card.locator('.sd-cmp-tab').nth(index).click()
    expect(target).to_be_visible()
    return target

def check_pair(p, width, name, sid, partner, label):
    open_species(p, name, sid)
    target=open_pair(p, partner)
    images=target.locator('.sd-cmp-who .sd-field-photo img')
    expect(images).to_have_count(2)
    measurements=target.evaluate("""async el => {
      const imgs=[...el.querySelectorAll('.sd-cmp-who .sd-field-photo img')];
      for(const img of imgs) {
        img.loading='eager';
        try { await img.decode(); } catch (err) {}
      }
      const photos=imgs.map(img=>{
        const r=img.getBoundingClientRect();
        return {x:r.x,y:r.y,right:r.right,width:r.width,
          src:img.getAttribute('src'),ok:img.complete&&img.naturalWidth>0};
      });
      return {photos,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth};
    }""")
    first,second=measurements['photos']
    # Roodmus uses its registered showcase image (/assets/showcase/); any local registered asset is valid.
    assert all(x['ok'] and ('/assets/species/' in x['src'] or '/assets/showcase/' in x['src']) for x in (first,second)),measurements
    assert abs(first['y']-second['y']) <= 7,measurements
    assert second['x'] >= first['right'] - 1,measurements
    assert abs(first['width']-second['width']) < 7,measurements
    assert measurements['scrollWidth'] <= measurements['clientWidth']+2,measurements
    assert not p.evaluate('document.documentElement.scrollWidth > innerWidth+2'),f'{width}px page overflow'
    assert target.locator('.sd-cmp-row').count()>=2, 'Show readable differences, not merely pictures'
    button=target.locator('.sd-cmp-who .sd-field-photo').first
    button.click()
    viewer=p.get_by_role('dialog',name='Vogelfoto bekijken')
    expect(viewer).to_be_visible()
    p.keyboard.press('Escape')
    expect(viewer).to_have_count(0)
    expect(target).to_be_visible()
    if width==390 and sid in ['sp049','sp050','sp051']:
        SHOTS.mkdir(parents=True, exist_ok=True)
        target.screenshot(path=str(SHOTS / f'{sid}_{partner}_{width}.png'))
    p.locator('.signature-species-detail-close').click()
    p.locator('.signature-species-detail-overlay').wait_for(state='detached',timeout=12000)
    print(f'LOOKALIKE-BROWSER {width}px {name}: two decoded side-by-side images, differences, zoom, back PASS',flush=True)

def text_only(p, name, sid, needles, hidden):
    open_species(p, name, sid)
    text=p.locator('#sdPanel-herkenning').inner_text().lower()
    for needle in needles:
        assert needle in text, f'{name}: visible caution text must mention {needle}'
    for other in hidden:
        assert p.locator(f'#sdPanel-herkenning .sd-cmp-panel:has([data-compare-species="{other}"])').count()==0, f'{name}: incomplete photo pair {other} must stay hidden'
    p.locator('.signature-species-detail-close').click()
    p.locator('.signature-species-detail-overlay').wait_for(state='detached',timeout=12000)

def main():
    errors=[]
    with Server(('127.0.0.1',0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            try:
                for width in (320,360,390):
                    ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',service_workers='block')
                    p=ctx.new_page()
                    p.on('pageerror',lambda err: errors.append(f'{width}px {err}'))
                    boot(p,url)
                    for name,sid,partner,label in CASES:
                        check_pair(p,width,name,sid,partner,label)
                    assert not errors,errors
                    ctx.close()
                print('LOOKALIKE-R14-BROWSER PASS: Grote Lijster/Zanglijster, Roodborst/Roodborsttapuit, Zwarte/Gekraagde Roodstaart pairs, zoom/back',flush=True)
            finally: browser.close()
        server.shutdown()

if __name__=='__main__': main()
