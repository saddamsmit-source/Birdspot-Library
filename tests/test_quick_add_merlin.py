"""Real Chromium sound recording with a virtual microphone and private map pins."""
from datetime import datetime, timezone
import threading

from playwright.sync_api import expect, sync_playwright

from test_cinematic_wetland import OUT, Server, Quiet

BIRDS = ['Merel', 'Koolmees', 'Pimpelmees', 'Fitis', 'Tjiftjaf', 'Wielewaal']
DATE = datetime(2026, 11, 15, 13, 42, tzinfo=timezone.utc)


def open_sound(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="sound"]').click()
    sheet = page.get_by_role('dialog', name='Geluid herkennen')
    expect(sheet).to_be_visible()
    assert 'merlin' not in sheet.inner_text().lower()
    assert sheet.locator('a[href]').count() == 0
    return sheet


def rows(page):
    return page.evaluate("""() => JSON.parse(localStorage.getItem('birdspot-sightings') || '{}').sightings || []""")


def add_species(sheet, birds):
    for name in birds:
        sheet.get_by_role('searchbox').fill(name)
        sheet.get_by_role('button', name=name, exact=True).click()
        expect(sheet.get_by_role('checkbox', name=name, exact=True)).to_be_checked()


def check(page, width):
    page.locator('#birdspotSplashSkip').click()
    page.locator('#fab').click()
    page.get_by_role('dialog').get_by_role('button', name='Waarneming toevoegen').click()
    expect(page.locator('#quickAddSheet')).to_have_count(0)
    expect(page.locator('#addSightingSheet')).to_be_visible()
    expect(page.locator('input[name="observationMethod"]:checked')).to_have_value('seen')
    expect(page.locator('input[name="observationMethod"][value="heard"]')).to_be_visible()
    page.locator('#addSheetCancel').click()

    sheet = open_sound(page)
    expect(sheet.locator('#soundSave')).to_be_disabled()
    assert sheet.evaluate('el => el.scrollWidth <= el.clientWidth + 1')
    sheet.get_by_role('button', name='Terug naar keuzes').click()
    expect(page.get_by_role('heading', name='Wat wil je vastleggen?')).to_be_visible()
    page.locator('[data-quick-action="sound"]').click()
    page.keyboard.press('Escape')
    expect(page.locator('#quickAddSheet')).to_have_count(0)
    assert page.evaluate("document.activeElement?.id === 'fab'")
    assert not rows(page)

    sheet = open_sound(page)
    sheet.get_by_role('button', name='Start opname').click()
    expect(sheet.get_by_role('button', name='Stop opname')).to_be_enabled()
    sheet.get_by_role('button', name='Sluiten').click()
    expect(sheet).to_have_count(0)
    page.wait_for_function("window.testStream.getAudioTracks().every(track => track.readyState === 'ended')")
    assert not rows(page)

    sheet = open_sound(page)
    sheet.get_by_role('button', name='Start opname').click()
    expect(sheet.get_by_role('button', name='Stop opname')).to_be_enabled()
    expect(sheet.locator('#soundPosition')).to_contain_text('51.92440, 4.47770')
    expect(sheet.locator('#soundDate')).to_have_value('2026-11-15')
    expect(sheet.locator('#soundTime')).to_have_value('14:42')
    expect(sheet.locator('#soundElapsed')).to_have_text('00:01')
    sheet.get_by_role('button', name='Stop opname').click()
    clip = sheet.locator('#soundPlayback')
    expect(clip).to_be_visible()
    clip.evaluate('audio => audio.play()')
    expect(clip).to_have_js_property('paused', False)
    page.wait_for_function("window.testStream.getAudioTracks().every(track => track.readyState === 'ended')")
    add_species(sheet, BIRDS)
    if width == 390:
        sheet.screenshot(path=str(OUT / 'sound_session_390.png'))
    sheet.get_by_role('searchbox').fill('Merel')
    expect(sheet.get_by_role('button', name='Merel', exact=True)).to_have_count(0)
    sheet.get_by_role('searchbox').fill('')
    use = BIRDS if width == 390 else BIRDS[:3]
    for name in BIRDS[len(use):]:
        sheet.get_by_role('checkbox', name=name, exact=True).uncheck()
    sheet.get_by_text('Details toevoegen', exact=True).click()
    sheet.get_by_label('Pleknaam').fill('Testplek aan het water')
    sheet.get_by_label('Notitie voor deze vogels').fill('Samen gehoord tijdens de opname')
    expect(sheet.locator('#soundSave')).to_have_text(f'Pin {len(use)} waarnemingen')

    # A single failed store write must leave the whole group in the draft.
    page.evaluate("""() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) {
        if (key === 'birdspot-sightings') {
          Storage.prototype.setItem = original;
          throw new DOMException('Testopslag vol', 'QuotaExceededError');
        }
        return original.call(this, key, value);
      };
    }""")
    sheet.locator('#soundSave').click()
    expect(sheet.locator('#soundSaveState')).to_contain_text('Opslaan mislukt')
    expect(sheet.locator('#soundSave')).to_be_enabled()
    assert not rows(page)
    page.locator('#soundSave').click()
    expect(sheet).to_have_count(0)
    expect(page.locator('#mapSheetName')).to_have_text('Testplek aan het water', timeout=15000)
    expect(page.locator('.place-sightings button')).to_have_count(len(use))
    stored = rows(page)
    assert {item['speciesName'] for item in stored} == set(use), stored
    assert len({item['id'] for item in stored}) == len(use)
    assert len({item['soundSessionId'] for item in stored}) == 1
    assert all(item['date'] == '2026-11-15' and item['time'] == '14:42' and
               item['lat'] == 51.9244 and item['lon'] == 4.4777 and
               item['locationName'] == 'Testplek aan het water' and item['count'] == 1 and
               item['observationMethod'] == 'heard' and item['identificationSource'] == 'self' and
               item['merlinVerification'] is None and item['notes'] == 'Samen gehoord tijdens de opname'
               for item in stored), stored
    page.reload(wait_until='domcontentloaded')
    page.locator('#birdspotSplash').wait_for(state='detached', timeout=15000)
    assert len(rows(page)) == len(use)

    # Denied microphone and denied GPS leave the manual selection and map picker usable.
    page.evaluate("""() => {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('denied', 'NotAllowedError'); };
      navigator.geolocation.getCurrentPosition = (_, fail) => fail({code: 1});
    }""")
    sheet = open_sound(page)
    sheet.get_by_role('button', name='Start opname').click()
    expect(sheet.locator('#soundCaptureState')).to_contain_text('geen toestemming')
    add_species(sheet, ['Buizerd', 'Roodborst'])
    if width == 320:
        sheet.get_by_role('checkbox', name='Roodborst').uncheck()
    sheet.get_by_role('button', name='Gebruik mijn locatie').click()
    expect(sheet.locator('#soundPosition')).to_contain_text('GPS is niet beschikbaar')
    expect(sheet.locator('#soundSave')).to_be_disabled()
    sheet.get_by_role('button', name='Kies plek op kaart').click()
    page.locator('#pinLat').fill('52.1')
    page.locator('#pinLon').fill('5.1')
    page.locator('#pinConfirm').click()
    expect(sheet.locator('#soundPosition')).to_contain_text('52.10000, 5.10000')
    sheet.locator('#soundSave').click()
    expect(sheet).to_have_count(0)
    expected = 1 if width == 320 else 2
    assert len([item for item in rows(page) if item['lat'] == 52.1 and item['lon'] == 5.1]) == expected
    print(f'PASS {width}px: playback, GPS, {len(use)} species with storage retry, and {expected} species with manual pin', flush=True)


def main():
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=[
                '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
            ])
            for width in (320, 390):
                ctx = browser.new_context(viewport={'width': width, 'height': 844},
                                          timezone_id='Europe/Amsterdam', reduced_motion='reduce',
                                          geolocation={'latitude': 51.9244, 'longitude': 4.4777, 'accuracy': 8},
                                          permissions=['microphone', 'geolocation'], service_workers='block')
                ctx.add_init_script("""(() => {
                  const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
                  navigator.mediaDevices.getUserMedia = async constraints => {
                    const stream = await original(constraints);
                    window.testStream = stream;
                    return stream;
                  };
                })();""")
                ctx.route('**/*', lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
                page = ctx.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.clock.set_fixed_time(DATE)
                page.goto(url, wait_until='domcontentloaded')
                check(page, width)
                assert not errors, errors
                ctx.close()
            browser.close()


if __name__ == '__main__':
    main()
