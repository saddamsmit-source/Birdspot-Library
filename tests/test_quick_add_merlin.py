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
    # Ronde 4: de optionele Merlin-dubbelcheck staat ingeklapt in het geluidsblad (R07); geen links naar buiten.
    assert not sheet.locator('#soundMerlin').evaluate('details => details.open')
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
    expect(sheet.locator('#soundMoment')).to_have_text('15-11-2026 · 14:42')
    expect(sheet.locator('#soundPosition')).to_contain_text('51.92440, 4.47770')
    expect(sheet.locator('#soundDate')).to_be_hidden()
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
    expect(sheet.locator('#soundElapsed')).to_have_text('00:01')
    # Nieuwe eigenaarregel: een opname kan niet stil verdwijnen of automatisch blijvend worden opgeslagen.
    sheet.get_by_role('button', name='Sluiten').click()
    expect(sheet).to_be_visible()
    # AS-01: sluiten tijdens opname toont een zichtbare sluitvraag (opname loopt door tot de gebruiker kiest).
    expect(sheet.locator('#soundExitTitle')).to_have_text('De opname loopt nog')
    sheet.locator('[data-sound-exit="resume"]').click()
    sheet.locator('#soundRecord').click()
    expect(sheet.locator('#soundPlayback')).to_be_visible()
    sheet.get_by_role('button', name='Sluiten').click()
    expect(sheet.locator('#soundExitPrompt')).to_be_visible()
    sheet.locator('[data-sound-exit="keep"]').click()
    expect(sheet).to_have_count(0)
    page.wait_for_function("window.testStream.getAudioTracks().every(track => track.readyState === 'ended')")
    assert not rows(page)

    sheet = open_sound(page)
    expect(sheet.locator('#soundDraftState')).to_have_text('Bewaarde sessie geopend.')
    expect(sheet.locator('#soundPlayback')).to_be_visible()
    sheet.get_by_role('button', name='Verwijder sessie').click()
    sheet.get_by_role('button', name='Start opname').click()
    expect(sheet.get_by_role('button', name='Stop opname')).to_be_enabled()
    expect(sheet.locator('#soundPosition')).to_contain_text('51.92440, 4.47770')
    expect(sheet.locator('#soundDate')).to_have_value('2026-11-15')
    expect(sheet.locator('#soundTime')).to_have_value('14:42')
    expect(sheet.locator('#soundElapsed')).to_have_text('00:01')
    expect(sheet.locator('#soundWaveform')).to_be_visible()
    expect(sheet.locator('#soundWaveform')).to_have_attribute('data-has-sound', 'true')
    expect(sheet.locator('#soundRecognitionState')).to_contain_text('niet beschikbaar')
    sheet.get_by_role('button', name='Stop opname').click()
    clip = sheet.locator('#soundPlayback')
    expect(clip).to_be_visible()
    clip.evaluate('audio => audio.play()')
    expect(clip).to_have_js_property('paused', False)
    page.wait_for_function("window.testStream.getAudioTracks().every(track => track.readyState === 'ended')")
    # Voor deze vervolgronde kiest de gebruiker bewust voor Bewaar concept.
    # Zonder die actie mag de opname na herladen niet automatisch terugkomen.
    sheet.locator('#soundSaveDraft').click()
    expect(sheet.locator('#soundDraftState')).to_have_text('Concept bewust bewaard op dit toestel.')
    add_species(sheet, BIRDS)
    if width == 390:
        sheet.screenshot(path=str(OUT / 'sound_session_390.png'))
    sheet.get_by_role('searchbox').fill('Merel')
    expect(sheet.get_by_role('button', name='Merel', exact=True)).to_have_count(0)
    sheet.get_by_role('searchbox').fill('')
    use = BIRDS if width == 390 else BIRDS[:3]
    for name in BIRDS[len(use):]:
        sheet.get_by_role('checkbox', name=name, exact=True).uncheck()
    expect(sheet.locator('#soundDraftState')).to_have_text('Concept bewust bewaard op dit toestel.')
    page.reload(wait_until='domcontentloaded')
    page.locator('#birdspotSplash').wait_for(state='detached', timeout=15000)
    sheet = open_sound(page)
    expect(sheet.locator('#soundDraftState')).to_have_text('Bewaarde sessie geopend.')
    expect(sheet.locator('#soundPlayback')).to_be_visible()
    expect(sheet.locator('#soundWaveform')).to_have_attribute('data-has-sound', 'true')
    for name in use:
        expect(sheet.get_by_role('checkbox', name=name, exact=True)).to_be_checked()
    for name in BIRDS[len(use):]:
        expect(sheet.get_by_role('checkbox', name=name, exact=True)).not_to_be_checked()
    sheet.get_by_text('Details aanpassen', exact=True).click()
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
        sheet.get_by_role('checkbox', name='Roodborst', exact=True).uncheck()
    sheet.get_by_text('Details aanpassen', exact=True).click()
    sheet.get_by_role('button', name='Gebruik mijn locatie').click()
    expect(sheet.locator('#soundPosition')).to_contain_text('GPS is niet beschikbaar')
    expect(sheet.locator('#soundSave')).to_be_disabled()
    expect(sheet.locator('#soundSaveHint')).to_contain_text('Kies een kaartpin')
    expect(sheet.locator('#soundPlaceFix')).to_be_visible()
    sheet.locator('#soundPlaceFix').click()
    page.locator('#pinLat').fill('52.1')
    page.locator('#pinLon').fill('5.1')
    page.locator('#pinConfirm').click()
    expect(sheet.locator('#soundPosition')).to_contain_text('52.10000, 5.10000')
    sheet.locator('#soundSave').click()
    expect(sheet).to_have_count(0)
    expected = 1 if width == 320 else 2
    assert len([item for item in rows(page) if item['lat'] == 52.1 and item['lon'] == 5.1]) == expected
    print(f'PASS {width}px: waveform, restored audio and choices, GPS, {len(use)} species with storage retry, and {expected} species with manual pin', flush=True)


def check_existing_pins(page):
    page.locator('#birdspotSplashSkip').click()
    page.evaluate("""() => localStorage.setItem('birdspot-sightings', JSON.stringify({
      schemaVersion: 2, sightings: [{id: 'legacy-pin', speciesId: 'sp045', speciesName: 'Merel',
        date: '2026-11-14', lat: 51.92454, lon: 4.4777, locationName: 'Vijverpad', photoIds: []}]
    }))""")
    page.clock.set_fixed_time(DATE)
    sheet = open_sound(page)
    expect(sheet.locator('#soundPosition')).to_have_text('Bestaande pin · Vijverpad')
    expect(sheet.locator('#soundMoment')).to_have_text('15-11-2026 · 14:42')
    expect(sheet.locator('#soundPlaceOptions')).to_be_hidden()
    page.clock.set_fixed_time(DATE.replace(minute=43))
    sheet.get_by_role('button', name='Start opname').click()
    expect(sheet.locator('#soundMoment')).to_have_text('15-11-2026 · 14:43')
    expect(sheet.locator('#soundElapsed')).to_have_text('00:01')
    sheet.get_by_role('button', name='Stop opname').click()
    add_species(sheet, ['Fitis', 'Tjiftjaf'])
    expect(sheet.locator('#soundPosition')).to_have_text('Bestaande pin · Vijverpad')
    sheet.locator('#soundSave').click()
    expect(page.locator('#mapSheetName')).to_have_text('Vijverpad', timeout=15000)
    expect(page.locator('.place-sightings button')).to_have_count(3)
    items = rows(page)
    assert len(items) == 3 and len({item['placeId'] for item in items}) == 1, items
    new_items = [item for item in items if item['id'] != 'legacy-pin']
    assert all(item['lat'] == 51.9244 and item['time'] == '14:43' for item in new_items), new_items
    page.locator('#mapSheetClose').click()

    page.evaluate("""() => {
      const key = 'birdspot-places';
      const data = JSON.parse(localStorage.getItem(key));
      data.places.push({id: 'opposite-bank', name: 'Overkant', lat: 51.92425, lon: 4.4777});
      localStorage.setItem(key, JSON.stringify(data));
    }""")
    sheet = open_sound(page)
    expect(sheet.locator('#soundPosition')).to_contain_text('Kies een kaartpin')
    expect(sheet.get_by_role('button', name='Vijverpad', exact=False)).to_be_visible()
    add_species(sheet, ['Buizerd'])
    expect(sheet.locator('#soundSave')).to_be_disabled()
    sheet.get_by_role('button', name='Overkant', exact=False).click()
    expect(sheet.locator('#soundPosition')).to_have_text('Bestaande pin · Overkant')
    sheet.locator('#soundSave').click()
    expect(page.locator('#mapSheetName')).to_have_text('Overkant', timeout=15000)
    expect(page.locator('.place-sightings button')).to_have_count(1)
    assert next(item for item in rows(page) if item['speciesName'] == 'Buizerd')['placeId'] == 'opposite-bank'
    assert page.evaluate("JSON.parse(localStorage.getItem('birdspot-places')).places.length") == 2
    page.locator('#mapSheetClose').click()

    sheet = open_sound(page)
    expect(sheet.locator('#soundPosition')).to_contain_text('Kies een kaartpin')
    add_species(sheet, ['Pimpelmees'])
    sheet.get_by_role('button', name='Gebruik een nieuwe pin').click()
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
    assert page.evaluate("JSON.parse(localStorage.getItem('birdspot-places')).places.length") == 2
    sheet.locator('#soundSave').click()
    # Opslaan is sinds de 2B-afronding asynchroon (IndexedDB): wacht tot de sessie echt dicht is, anders
    # telt de test nog het plekkaartje van de vorige opslag (Overkant, ook 1 waarneming).
    expect(sheet).to_have_count(0, timeout=15000)
    expect(page.locator('.place-sightings button')).to_have_count(1, timeout=15000)
    assert page.evaluate("JSON.parse(localStorage.getItem('birdspot-places')).places.length") == 3
    print('PASS: automatic moment + GPS, shifted GPS at a legacy pin, explicit pin choice and new-pin rollback', flush=True)


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
                if width == 390:
                    # Leeg profiel: sinds de 2B-afronding staan plekken in IndexedDB, dus die ook wissen.
                    page.evaluate("""() => { localStorage.clear(); return new Promise((ok, no) => {
                      const r = indexedDB.deleteDatabase('birdspot-library'); r.onsuccess = () => ok(); r.onerror = () => no(r.error); }); }""")
                    page.reload(wait_until='domcontentloaded')
                    check_existing_pins(page)
                assert not errors, errors
                ctx.close()
            browser.close()


if __name__ == '__main__':
    main()
