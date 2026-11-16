"""F3-R12b: honest recording status on the species card (Chromium 360/390 px, keyboard, accessible text).
Structural browser proof only; no physical phone or screen-reader product claim."""
import threading
from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import Quiet, Server, boot
from test_plumage_compare_layout import open_species

CASES = [('Huismus', 'sp043', 'Niet gecontroleerd'), ('Merel', 'sp045', 'Niet gecontroleerd')]

def main():
    errors = []
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            try:
                for width in (360, 390):
                    ctx = browser.new_context(viewport={'width': width, 'height': 844}, reduced_motion='reduce', service_workers='block')
                    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
                    boot(p, url)
                    for name, sid, needle in CASES:
                        open_species(p, name, sid)
                        panel = p.locator('#sdPanel-herkenning')
                        status = panel.locator('.sd-audio-status')
                        expect(status).to_be_visible()
                        expect(status).to_contain_text('nog niet onafhankelijk bevestigd')
                        box = status.bounding_box(); assert box and box['width'] <= width, box
                        # status precedes the players in reading order (screen readers read it first)
                        order = panel.evaluate("el => { const s = el.querySelector('.sd-audio-status'), a = el.querySelector('.sd-audio');"
                                               " return !!(s && a && (s.compareDocumentPosition(a) & Node.DOCUMENT_POSITION_FOLLOWING)); }")
                        assert order, 'status must come before the players'
                        summary = panel.locator('.sd-audio-credits > summary')
                        summary.focus(); p.keyboard.press('Enter')
                        state = panel.locator('.sd-audio-state', has_text=needle)
                        expect(state.first).to_be_visible()
                        assert not p.evaluate('document.documentElement.scrollWidth > innerWidth+2'), f'{width}px overflow'
                        p.locator('.signature-species-detail-close').click()
                        p.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=12000)
                        print(f'AUDIO-STATUS {width}px {name}: visible status, keyboard-opened per-clip "{needle}" PASS', flush=True)
                    assert not errors, errors
                    ctx.close()
                print('AUDIO-STATUS-BROWSER PASS: honest recording status visible, before players, keyboard-reachable details, no overflow', flush=True)
            finally:
                browser.close()
        server.shutdown()

if __name__ == '__main__':
    main()
