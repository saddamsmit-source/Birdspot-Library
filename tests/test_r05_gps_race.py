"""R05 GPS-race (eigenaarbesluit 17-11, ChatGPT-QA #292): een handmatige locatiehandeling wint altijd
van een automatische GPS-meting die later binnenkomt.

Vertraagde Permissions API en geolocation via init-script; Chromium 390 px. Scenario's:
  G1 normaal: toestemming 'granted' → GPS automatisch ingevuld, waarneming bewaard met lat/lon
  G2 late toestemming + pin: pin gekozen terwijl toestemmingscheck loopt → pin blijft
  G3 late GPS + pin: pin bevestigd vóór GPS-antwoord → pin blijft (de oorspronkelijke race)
  G4 wissen: pin gekozen en gewist terwijl GPS loopt → blijft leeg
  G5 picker open en geannuleerd terwijl GPS binnenkomt → geen stille overschrijving achter de picker
  G6 geweigerd: 'denied' → geen GPS, geen prompt, opslaan met alleen plaatsnaam werkt
  G7 annuleren terwijl GPS loopt → geen record, geen paginafout
"""
import sys
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import Quiet, Server  # noqa: E402
from test_sighting_merlin_pins import choose_pin  # noqa: E402
from test_feature_reconciliation import boot, rows  # noqa: E402

AUTO = (52.1001, 5.1002)
PIN = (51.5, 4.5)


def init_script(permission, perm_delay, gps_delay):
    return f"""
(() => {{
  const q = navigator.permissions && navigator.permissions.query.bind(navigator.permissions);
  if (navigator.permissions) navigator.permissions.query = (d) => d && d.name === 'geolocation'
    ? new Promise(r => setTimeout(() => r({{ state: '{permission}' }}), {perm_delay})) : q(d);
  window.__gpsCalls = 0;
  navigator.geolocation.getCurrentPosition = (ok, err) => {{
    window.__gpsCalls++;
    if ('{permission}' === 'denied') {{ setTimeout(() => err && err({{ code: 1 }}), 50); return; }}
    setTimeout(() => ok({{ coords: {{ latitude: {AUTO[0]}, longitude: {AUTO[1]}, accuracy: 9 }} }}), {gps_delay});
  }};
}})();"""


def open_sheet(page):
    page.locator('#fab').click()
    page.get_by_role('dialog').get_by_role('button', name='Waarneming toevoegen').click()
    expect(page.locator('#addSightingSheet')).to_be_visible()


def pick_species(page):
    page.locator('#speciesPickerBtn').click()
    page.locator('#spPickerList .species-row[data-id="sp001"]').click()
    page.locator('#speciesPickerBtn .species-picker-btn__name').wait_for(timeout=8000)


def save(page):
    before = len(rows(page))
    page.locator('#addSheetSubmit').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=12000)
    new = rows(page)[before:]
    assert len(new) == 1, new
    return new[0]


def main():
    server = Server(('127.0.0.1', 0), Quiet)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def scenario(name, permission, perm_delay, gps_delay, fn):
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam')
            ctx.add_init_script(init_script(permission, perm_delay, gps_delay))
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            detail = fn(page)
            assert not errors, errors
            print(f'{name} PASS — {detail}', flush=True)
            ctx.close()

        def g1(page):
            open_sheet(page)
            page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('52.10')", timeout=8000)
            pick_species(page)
            r = save(page)
            assert (r['lat'], r['lon']) == AUTO, r
            return f"auto-GPS bewaard {r['lat']}/{r['lon']}"
        scenario('G1 normaal', 'granted', 0, 200, g1)

        def g2(page):
            open_sheet(page)
            choose_pin(page, *PIN)  # toestemmingscheck (1,5 s) loopt nog
            page.wait_for_timeout(3500)
            pick_species(page)
            r = save(page)
            assert (r['lat'], r['lon']) == PIN, r
            return f"pin {r['lat']}/{r['lon']} na late toestemming"
        scenario('G2 late toestemming + pin', 'granted', 1500, 300, g2)

        def g3(page):
            open_sheet(page)
            page.wait_for_function('window.__gpsCalls > 0', timeout=5000)  # GPS-verzoek loopt
            choose_pin(page, *PIN)
            page.wait_for_timeout(4000)  # GPS-antwoord komt binnen ná de pin
            assert '51.5' in page.locator('#coordsHint').inner_text()
            pick_species(page)
            r = save(page)
            assert (r['lat'], r['lon']) == PIN, r
            return f"pin {r['lat']}/{r['lon']} blijft na laat GPS-antwoord"
        scenario('G3 late GPS + pin', 'granted', 0, 2500, g3)

        def g3b(page):
            # ChatGPT-QA #292: picker open → toestemming komt binnen → auto-GPS start → pin bevestigd → laat GPS-antwoord
            open_sheet(page)
            page.locator('#sightPinBtn').click()
            page.locator('#pinLat').wait_for(timeout=9000)
            page.wait_for_timeout(1600)  # toestemming (1 s) is nu binnen terwijl de picker open staat
            page.locator('#pinLat').fill(str(PIN[0]))
            page.locator('#pinLon').fill(str(PIN[1]))
            page.locator('#pinConfirm').click()
            page.locator('#pinLocationMap').wait_for(state='detached', timeout=9000)
            page.wait_for_timeout(3500)  # eventueel GPS-antwoord komt ná de bevestigde pin
            pick_species(page)
            r = save(page)
            assert (r['lat'], r['lon']) == PIN, r
            return f"pin {r['lat']}/{r['lon']} blijft (picker open tijdens toestemming)"
        scenario('G3b picker + late toestemming + late GPS', 'granted', 1000, 2500, g3b)

        def g4(page):
            open_sheet(page)
            page.wait_for_function('window.__gpsCalls > 0', timeout=5000)
            choose_pin(page, *PIN)
            page.locator('#sightClearPin').click()
            page.wait_for_timeout(4000)
            hint = page.locator('#coordsHint').inner_text()
            assert 'Nog geen pin' in hint, hint
            pick_species(page)
            page.locator('#sightLocation').fill('Alleen plaatsnaam')
            r = save(page)
            assert r.get('lat') is None and r.get('lon') is None, r
            return 'gewiste pin blijft leeg na laat GPS-antwoord'
        scenario('G4 wissen', 'granted', 0, 2500, g4)

        def g5(page):
            open_sheet(page)
            page.wait_for_function('window.__gpsCalls > 0', timeout=5000)
            page.locator('#sightPinBtn').click()
            page.locator('#pinLat').wait_for(timeout=9000)
            page.wait_for_timeout(3500)  # GPS-antwoord komt binnen terwijl de picker open is
            page.keyboard.press('Escape')
            page.locator('#pinLocationMap').wait_for(state='detached', timeout=9000)
            hint = page.locator('#coordsHint').inner_text()
            assert '52.10' not in hint, hint
            return f'geen stille overschrijving achter de picker ({hint[:40]!r})'
        scenario('G5 picker open/annuleren', 'granted', 0, 2500, g5)

        def g6(page):
            calls = page.evaluate('window.__gpsCalls')
            open_sheet(page)
            page.wait_for_timeout(1500)
            assert page.evaluate('window.__gpsCalls') == calls, 'formulier vraagt GPS zonder toestemming'
            pick_species(page)
            page.locator('#sightLocation').fill('Zonder GPS')
            r = save(page)
            assert r.get('lat') is None and r.get('locationName') == 'Zonder GPS', r
            return 'geen GPS-verzoek, opslaan met plaatsnaam werkt'
        scenario('G6 geweigerd', 'denied', 0, 100, g6)

        def g7(page):
            n = len(rows(page))
            open_sheet(page)
            page.wait_for_function('window.__gpsCalls > 0', timeout=5000)
            page.locator('#addSheetCancel').click()
            expect(page.locator('#addSightingSheet')).to_have_count(0)
            page.wait_for_timeout(3000)
            assert len(rows(page)) == n
            return 'annuleren tijdens GPS: geen record, geen fout'
        scenario('G7 annuleren', 'granted', 0, 2000, g7)

        browser.close()
    server.shutdown()
    print('R05 GPS-RACE PASS: G1–G7 incl. G3b')


if __name__ == '__main__':
    main()
