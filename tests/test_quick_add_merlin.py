"""Real Chromium: + seen vs Merlin/manual heard, cancel/back, small screens, no fake auto-ID."""
import threading
from playwright.sync_api import sync_playwright
from test_cinematic_wetland import Server, Quiet

def check(page, width):
    page.goto(page.context._base_url) if False else None
    page.locator('#birdspotSplashSkip').click()
    page.locator('#fab').click()
    assert page.locator('#quickAddSheet[role="dialog"]').count() == 0
    assert page.locator('#quickAddSheet [role="dialog"]').is_visible()
    assert page.get_by_role('button',name='Vogel gezien').is_visible()
    assert page.get_by_role('button',name='Geluid herkennen').is_visible()
    page.locator('[data-quick-action="seen"]').click()
    assert page.locator('#quickAddSheet').count() == 0
    assert page.locator('#addSightingSheet').is_visible()
    assert page.locator('input[name="observationMethod"]:checked').input_value() == 'seen'
    assert page.locator('input[name="identificationSource"]:checked').input_value() == 'self'
    page.locator('#addSheetCancel').click()
    page.locator('#fab').click()
    page.locator('[data-quick-action="sound"]').click()
    link=page.get_by_role('link',name='Merlin Bird ID (officiële website)')
    assert link.get_attribute('href') == 'https://merlin.allaboutbirds.org/'
    assert link.get_attribute('rel') == 'noopener noreferrer'
    page.locator('[data-quick-action="back"]').click()
    assert page.locator('[data-quick-action="seen"]').is_visible()
    page.locator('[data-quick-action="sound"]').click()
    page.locator('[data-quick-action="merlin"]').click()
    assert page.locator('input[name="observationMethod"]:checked').input_value() == 'heard'
    assert page.locator('input[name="identificationSource"]:checked').input_value() == 'merlin'
    assert page.get_by_text('Een suggestie van Merlin is niet automatisch').is_visible()
    page.locator('#addSheetCancel').click()
    page.locator('#fab').click()
    page.locator('[data-quick-action="sound"]').click()
    page.locator('[data-quick-action="heard"]').click()
    assert page.locator('input[name="observationMethod"]:checked').input_value() == 'heard'
    assert page.locator('input[name="identificationSource"]:checked').input_value() == 'self'
    page.locator('#addSheetCancel').click()
    page.locator('#fab').click()
    page.keyboard.press('Escape')
    assert page.locator('#quickAddSheet').count() == 0
    assert page.evaluate("document.activeElement?.id === 'fab'")
    assert page.evaluate('document.documentElement.scrollWidth<=window.innerWidth+2')
    print('PASS quick + choices, manual Merlin, heard evidence, escape and no overflow',width,flush=True)

def main():
    with Server(('127.0.0.1',0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            for width in (320,390):
                ctx=browser.new_context(viewport={'width':width,'height':844},service_workers='block')
                page=ctx.new_page()
                errors=[]
                page.on('pageerror',lambda err: errors.append(str(err)))
                page.goto(url)
                check(page,width)
                assert not errors,errors
                ctx.close()
            browser.close()

if __name__=='__main__':main()
