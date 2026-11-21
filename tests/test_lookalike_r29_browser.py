"""R29 visual test: adult-female Fazant/Patrijs pair, jaarling vs flight and audio.
Chromium browser only; no independent biological or acoustic approval.
"""
import threading
from playwright.sync_api import expect, sync_playwright
import test_lookalike_r22_browser as prior
from test_pilot_offline_new_sighting import ROOT,Quiet,Server,boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import open_pair

SHOTS=ROOT/'tests/screenshots/lookalike_r29'
prior.SHOTS=SHOTS

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
                    p.on('pageerror',lambda err:errors.append(f'{width}px: {err}'))
                    boot(p,url)
                    for name,sid,partner in [('Fazant','sp105','sp106'),('Patrijs','sp106','sp105')]:
                        open_species(p,name,sid)
                        panel=open_pair(p,partner)
                        card=panel.locator('xpath=ancestor::div[contains(@class,"sd-cmp-card")]').first
                        assert card.locator('.sd-cmp-panel').count()==1
                        images=card.locator('.sd-cmp-panel:visible .sd-cmp-who .sd-field-photo img')
                        paths=images.evaluate_all('els=>els.map(el=>el.getAttribute("src"))')
                        assert len(paths)==2 and any('sp105-adult_f.webp' in x for x in paths) and any('sp106-adult_f.webp' in x for x in paths),(name,paths)
                        pair=card.locator('.sd-cmp-panel').first
                        imginfo=pair.evaluate("""async el=>{
                          const a=[...el.querySelectorAll('.sd-cmp-who .sd-field-photo img')];
                          for (const img of a){img.loading='eager';await img.decode();}
                          return a.map(img=>({natural:img.naturalWidth,x:img.getBoundingClientRect().x,right:img.getBoundingClientRect().right,y:img.getBoundingClientRect().y,width:img.getBoundingClientRect().width}));
                        }""")
                        assert len(imginfo)==2 and all(x['natural']>0 for x in imginfo),imginfo
                        assert abs(imginfo[0]['y']-imginfo[1]['y'])<7 and abs(imginfo[0]['width']-imginfo[1]['width'])<7,imginfo
                        assert imginfo[1]['x']>=imginfo[0]['right']-1,imginfo
                        assert pair.locator('.sd-cmp-row').count()>=2
                        pair.locator('.sd-field-photo').first.click()
                        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_be_visible()
                        p.keyboard.press('Escape')
                        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_have_count(0)
                        if width==390:
                            SHOTS.mkdir(parents=True,exist_ok=True)
                            pair.scroll_into_view_if_needed()
                            p.screenshot(path=str(SHOTS/f'{sid}_{partner}_female.png'))
                        prior.close(p)
                    open_species(p,'Aalscholver','sp104')
                    panel=p.locator('#sdPanel-herkenning')
                    yearling=panel.locator('[data-plumage="jaarling"]')
                    expect(yearling).to_be_visible()
                    assert yearling.locator('img[src*="sp104-jaarling.webp"]').count()==1
                    assert p.locator('section.sd-flight img[src*="sp104-jaarling.webp"]').count()==0
                    assert p.locator('section.sd-flight img[src*="sp104-flight.webp"]').count()==1
                    expect(panel.locator('.sd-audio-status')).to_contain_text('nog niet onafhankelijk bevestigd')
                    sounds=panel.locator('.sd-audio audio')
                    assert sounds.count()==1
                    playback=panel.evaluate("""async el=>{
                      const a=el.querySelector('.sd-audio audio');
                      a.muted=true;a.load();
                      if(a.readyState<1)await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=()=>no(Error('audio metadata'));setTimeout(()=>no(Error('timeout')),8000);});
                      await a.play();await new Promise(ok=>setTimeout(ok,180));
                      const out={duration:a.duration,progress:a.currentTime>0};
                      a.pause();return out;
                    }""")
                    assert playback['duration']>0 and playback['progress'],playback
                    if width==390:
                        yearling.scroll_into_view_if_needed()
                        p.screenshot(path=str(SHOTS/'sp104_jaarling_not_flight.png'))
                    prior.close(p)
                    for name,sid in [('Fazant','sp105'),('Patrijs','sp106')]:
                        open_species(p,name,sid)
                        assert p.locator('#sdPanel-herkenning .sd-audio audio').count()==0
                        if sid=='sp106':
                            assert p.locator('section.sd-flight img[src*="sp106-flight.webp"]').count()==1
                        prior.close(p)
                    assert not p.evaluate('document.documentElement.scrollWidth>innerWidth+2')
                    assert not errors,errors
                    print(f'R29-BROWSER {width}px PASS: both female comparison directions, image decode, zoom/back, standing yearling vs flight, one technical audio playback.',flush=True)
                    ctx.close()
            finally:
                browser.close()
        server.shutdown()
    print('R29-BROWSER PASS: no physical Samsung, original-species or auditory certification.',flush=True)

if __name__=='__main__':
    main()
