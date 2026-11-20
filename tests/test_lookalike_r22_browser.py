"""R22: actual paired images in every existing tab, mobile navigation and technical audio.
Chromium only; playback is not independent auditory species determination.
"""
import threading
from playwright.sync_api import expect,sync_playwright
from test_pilot_offline_new_sighting import ROOT,Quiet,Server,boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import open_pair,text_only

SHOTS=ROOT/'tests/screenshots/lookalike_r22'

def close(p):
    p.locator('.signature-species-detail-close').click()
    p.locator('.signature-species-detail-overlay').wait_for(state='detached',timeout=12000)

def paired(p,width,name,sid,other,expected):
    open_species(p,name,sid)
    target=open_pair(p,other)
    card=target.locator('xpath=ancestor::div[contains(@class,"sd-cmp-card")]').first
    panels=card.locator('.sd-cmp-panel')
    assert panels.count()==expected,(name,other,panels.count())
    for index in range(expected):
        if expected>1:card.locator('.sd-cmp-tab').nth(index).click()
        panel=panels.nth(index);expect(panel).to_be_visible()
        photos=panel.evaluate('''async el=>{
          const imgs=[...el.querySelectorAll('.sd-cmp-who .sd-field-photo img')];
          for(const img of imgs){img.loading='eager';await img.decode();}
          return imgs.map(img=>{const r=img.getBoundingClientRect();return {ok:img.complete&&img.naturalWidth>0,x:r.x,y:r.y,right:r.right,width:r.width};});
        }''')
        assert len(photos)==2 and all(x['ok'] for x in photos),photos
        a,b=photos;assert abs(a['y']-b['y'])<7 and b['x']>=a['right']-1 and abs(a['width']-b['width'])<7,photos
        assert not p.evaluate('document.documentElement.scrollWidth>innerWidth+2')
        assert panel.locator('.sd-cmp-row').count()>=2
        panel.locator('.sd-field-photo').first.click()
        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_be_visible()
        p.keyboard.press('Escape')
        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_have_count(0)
        expect(panel).to_be_visible()
        if width==390:
            panel.scroll_into_view_if_needed()
            SHOTS.mkdir(parents=True,exist_ok=True)
            # Capture the real viewport; long modal-element screenshots contain blank regions.
            p.screenshot(path=str(SHOTS/f'{sid}_{other}_tab{index}.png'))
    close(p)

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
                    p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));boot(p,url)
                    for args in [('Meerkoet','sp078','sp079',2),('Waterhoen','sp079','sp078',2),('Blauwe Reiger','sp081','sp084',3),('Purperreiger','sp084','sp081',3),('Blauwe Reiger','sp081','sp085',2),('Kwak','sp085','sp081',2)]:
                        paired(p,width,*args)
                    for name,sid,other,othername in [('Waterhoen','sp079','sp080','Waterral'),('Waterral','sp080','sp079','Waterhoen')]:
                        text_only(p,name,sid,['snavel','flank'],[other])
                        open_species(p,name,sid)
                        p.locator(f'#sdPanel-herkenning [data-compare-species="{other}"]').first.click()
                        expect(p.locator('.signature-species-detail-sheet h2')).to_have_text(othername)
                        p.locator(f'#sdPanel-herkenning [data-compare-species="{sid}"]').first.click()
                        expect(p.locator('.signature-species-detail-sheet h2')).to_have_text(name);close(p)
                    for name,sid in [('Meerkoet','sp078'),('Waterhoen','sp079'),('Blauwe Reiger','sp081')]:
                        open_species(p,name,sid);panel=p.locator('#sdPanel-herkenning')
                        expect(panel.locator('.sd-audio-status')).to_contain_text('nog niet onafhankelijk bevestigd')
                        panel.locator('.sd-audio-credits > summary').focus();p.keyboard.press('Enter')
                        expect(panel.locator('.sd-audio-state',has_text='Niet gecontroleerd')).to_have_count(2)
                        playback=panel.evaluate('''async el=>{
                          const out=[];
                          for(const a of el.querySelectorAll('.sd-audio audio')){
                            a.muted=true;a.load();
                            if(a.readyState<1) await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=()=>no(Error('audio metadata'));setTimeout(()=>no(Error('audio timeout')),8000);});
                            await a.play();await new Promise(ok=>setTimeout(ok,180));
                            out.push({duration:a.duration,advanced:a.currentTime>0,src:a.getAttribute('src')});a.pause();
                          }return out;
                        }''')
                        assert len(playback)==2 and all(x['duration']>0 and x['advanced'] for x in playback),playback
                        if width==390:
                            panel.locator('.sd-audio-status').scroll_into_view_if_needed()
                            p.screenshot(path=str(SHOTS/f'{sid}_audio.png'))
                        close(p)
                    assert not errors,errors
                    ctx.close()
                    print(f'R22-BROWSER {width}px PASS: 14 photo tabs, reciprocal text navigation, zoom/back and six technical audio playbacks.',flush=True)
            finally:browser.close()
        server.shutdown()
    print('R22-BROWSER PASS; physical phone/offline and independent auditory verification NOT TESTED.',flush=True)

if __name__=='__main__':main()
