"""R30 Chromium: restore actual current guide media, preserve non-flight vs conditional flight.
Only browser behaviour/technical image decode is tested, not image rights or independent species confirmation.
"""
import threading
from playwright.sync_api import expect,sync_playwright
from test_pilot_offline_new_sighting import ROOT,Quiet,Server,boot
from test_plumage_compare_layout import open_species

SHOTS=ROOT/'tests/screenshots/lookalike_r30'

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
                    for name,sid,hero,other in [
                        ('Grote Karekiet','sp108','sp108.webp','sp108-flight.webp'),
                        ('Rietzanger','sp110','sp110.webp','sp110-flight.webp'),
                        ('Spreeuw','sp112','sp112-hero-male.webp','sp112-flight.webp')
                    ]:
                        open_species(p,name,sid)
                        panel=p.locator('#sdPanel-herkenning')
                        sheet=p.locator('.signature-species-detail-sheet')
                        expect(sheet.locator(f'img[src*="{hero}"]').first).to_be_visible()
                        if sid=='sp108':
                            assert panel.locator('section.sd-flight img[src*="sp108-flight.webp"]').count()==1,'Conditional but genuine flight image must remain in flight section'
                            assert panel.locator('section.sd-poses img[src*="sp108-flight.webp"]').count()==0
                        elif sid=='sp110':
                            assert panel.locator('section.sd-flight img[src*="sp110-flight.webp"]').count()==0,'Branch takeoff must never become free-flight photo'
                            assert panel.locator('section.sd-poses img[src*="sp110-flight.webp"]').count()==1,'Keep existing takeoff photo under other identification pictures'
                        else:
                            assert panel.locator('section.sd-flight img[src*="sp112-flight.webp"]').count()==1
                            assert panel.locator('[data-plumage="adult_f"] img[src*="sp112-adult_f.webp"]').count()==1
                            assert panel.locator('[data-plumage="juv"] img[src*="sp112-juv.webp"]').count()==1
                        assert panel.locator('.sd-audio audio').count()==0,'No source audio exists; avoid false availability'
                        pics=sheet.locator('img[src*="sp108"], img[src*="sp110"], img[src*="sp112"]')
                        info=pics.evaluate_all("""async els=>{
                            const items=[];
                            for(const img of els){img.loading='eager';try{await img.decode()}catch(e){}items.push({src:img.getAttribute('src'),ok:img.complete&&img.naturalWidth>0});}
                            return items;
                        }""")
                        assert info and all(i['ok'] for i in info),info
                        assert not p.evaluate('document.documentElement.scrollWidth>innerWidth+2'),'Horizontal overflow at '+name
                        zoom=sheet.locator('.sd-field-photo').first
                        zoom.click()
                        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_be_visible()
                        p.keyboard.press('Escape')
                        expect(p.get_by_role('dialog',name='Vogelfoto bekijken')).to_have_count(0)
                        if width==390:
                            SHOTS.mkdir(parents=True,exist_ok=True)
                            panel.scroll_into_view_if_needed()
                            p.screenshot(path=str(SHOTS/f'{sid}_guide.png'))
                        sheet.locator('.signature-species-detail-close').click()
                        expect(p.locator('.signature-species-detail-overlay')).to_have_count(0)
                    assert not errors,errors
                    ctx.close()
                    print(f'R30-BROWSER {width}px PASS: 3 species images decode, Grote Karekiet conditional flight, Rietzanger no false flight, Spreeuw plumage, zoom/back.',flush=True)
            finally:browser.close()
        server.shutdown()
    print('R30-BROWSER PASS: no original-image licensing, field device or independent ornithological review claimed.',flush=True)

if __name__=='__main__':
    main()
