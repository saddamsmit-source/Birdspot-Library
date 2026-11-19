"""R21: real mobile cards, reverse text links, existing photo pairs, zoom/back and audio status.
Chromium evidence only; no physical Samsung/PWA/offline or auditory species verification.
"""
import threading
from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species
from test_lookalike_r20_browser import check_pair, text_only

SHOTS = ROOT / 'tests/screenshots/lookalike_r21'

def close(p):
    p.locator('.signature-species-detail-close').click()
    p.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=12000)

def main():
    errors=[]
    with Server(('127.0.0.1',0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url=f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            try:
                for width in (320,360,390):
                    ctx=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce',service_workers='block')
                    p=ctx.new_page();p.on('pageerror',lambda e: errors.append(str(e)))
                    boot(p,url)
                    for name,sid,partner in [('IJsvogel','sp075','sp257'),('Bijeneter','sp257','sp075'),('Graspieper','sp072','sp070'),('Veldleeuwerik','sp070','sp072')]:
                        check_pair(p,width,name,sid,partner,'R21')
                    for name,sid,needles,hidden in [
                        ('Graspieper','sp072',['boompieper','flank'],['sp073']),
                        ('Boompieper','sp073',['graspieper','flank'],['sp072']),
                        ('Fuut','sp077',['roodhalsfuut','snavel'],['sp195']),
                        ('Roodhalsfuut','sp195',['fuut','snavel'],['sp077'])]:
                        text_only(p,name,sid,needles,hidden)
                    for name,sid in [('Graspieper','sp072'),('IJsvogel','sp075'),('Fuut','sp077')]:
                        open_species(p,name,sid)
                        panel=p.locator('#sdPanel-herkenning')
                        assert panel.locator('img[src$="sp075-juv-review.webp"]').count()==0
                        assert not p.evaluate('document.documentElement.scrollWidth > innerWidth+2')
                        if sid=='sp077':
                            status=panel.locator('.sd-audio-status')
                            expect(status).to_contain_text('nog niet onafhankelijk bevestigd')
                            panel.locator('.sd-audio-credits > summary').focus()
                            p.keyboard.press('Enter')
                            expect(panel.locator('.sd-audio-state',has_text='Niet gecontroleerd').first).to_be_visible()
                        if width==390:
                            SHOTS.mkdir(parents=True,exist_ok=True)
                            panel.screenshot(path=str(SHOTS / f'{sid}_{width}.png'))
                        close(p)
                    assert not errors,errors
                    ctx.close()
                print('LOOKALIKE-R21-BROWSER PASS: 320/360/390 px, four photo directions, four text directions, three cards and honest Fuut audio status.',flush=True)
            finally:browser.close()
        server.shutdown()

if __name__=='__main__':main()
