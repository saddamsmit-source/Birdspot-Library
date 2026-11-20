"""R23: responsive real photo comparisons and no retired California image in UI."""
import threading
from playwright.sync_api import expect,sync_playwright
import test_lookalike_r22_browser as prior
from test_pilot_offline_new_sighting import ROOT,Quiet,Server,boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import text_only
SHOTS=ROOT/'tests/screenshots/lookalike_r23'
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
                    p=ctx.new_page();p.on('pageerror',lambda e:errors.append(str(e)));boot(p,url)
                    for args in [('Kleine Zilverreiger','sp082','sp083',3),('Grote Zilverreiger','sp083','sp082',3),('Grote Zilverreiger','sp083','sp081',1),('Blauwe Reiger','sp081','sp083',1),('Purperreiger','sp084','sp081',3),('Blauwe Reiger','sp081','sp084',3),('Purperreiger','sp084','sp085',1),('Kwak','sp085','sp084',1)]:prior.paired(p,width,*args)
                    for name,sid,other,othername in [('Kleine Zilverreiger','sp082','sp245','Koereiger'),('Grote Zilverreiger','sp083','sp245','Koereiger'),('Koereiger','sp245','sp082','Kleine Zilverreiger'),('Koereiger','sp245','sp083','Grote Zilverreiger'),('Purperreiger','sp084','sp243','Roerdomp'),('Roerdomp','sp243','sp084','Purperreiger')]:
                        text_only(p,name,sid,['hals'],[other]);open_species(p,name,sid)
                        p.locator(f'#sdPanel-herkenning [data-compare-species="{other}"]').first.click()
                        expect(p.locator('.signature-species-detail-sheet h2')).to_have_text(othername)
                        p.locator(f'#sdPanel-herkenning [data-compare-species="{sid}"]').first.click()
                        expect(p.locator('.signature-species-detail-sheet h2')).to_have_text(name);prior.close(p)
                    for name,sid,count in [('Kleine Zilverreiger','sp082',1),('Grote Zilverreiger','sp083',2),('Purperreiger','sp084',2)]:
                        open_species(p,name,sid);panel=p.locator('#sdPanel-herkenning')
                        expect(panel.locator('img[src*="sp083-juv.webp"]')).to_have_count(0)
                        expect(panel.locator('.sd-audio-status')).to_contain_text('nog niet onafhankelijk bevestigd')
                        panel.locator('.sd-audio-credits > summary').focus();p.keyboard.press('Enter')
                        expect(panel.locator('.sd-audio-state',has_text='Niet gecontroleerd')).to_have_count(count)
                        playback=panel.evaluate('''async el=>{const out=[];for(const a of el.querySelectorAll('.sd-audio audio')){a.muted=true;a.load();if(a.readyState<1) await new Promise((ok,no)=>{a.onloadedmetadata=ok;a.onerror=()=>no(Error('audio metadata'));setTimeout(()=>no(Error('audio timeout')),8000);});await a.play();await new Promise(ok=>setTimeout(ok,180));out.push({duration:a.duration,advanced:a.currentTime>0});a.pause();}return out;}''')
                        assert len(playback)==count and all(x['duration']>0 and x['advanced'] for x in playback),playback
                        if width==390:
                            SHOTS.mkdir(parents=True,exist_ok=True);panel.locator('.sd-audio-status').scroll_into_view_if_needed();p.screenshot(path=str(SHOTS/f'{sid}_audio.png'))
                        prior.close(p)
                    assert not errors,errors;ctx.close()
                    print(f'R23-BROWSER {width}px PASS: 16 photo tabs, six text navigation directions, zoom/back, five technical audio playbacks, retired juvenile absent.',flush=True)
            finally:browser.close()
        server.shutdown()
    print('R23-BROWSER PASS; physical phone/offline and independent auditory verification NOT TESTED.',flush=True)
if __name__=='__main__':main()
