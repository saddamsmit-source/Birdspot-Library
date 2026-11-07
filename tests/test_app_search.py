"""Browser checks for the app-wide search and its destinations."""
import threading

from playwright.sync_api import expect, sync_playwright

from test_cinematic_wetland import Quiet, Server
from test_explorer_species_cluster import LEAFLET_STUB


def run_search(page):
    page.locator('[data-route="home"]').click()
    page.locator('#homeSearchTrigger').click()
    expect(page.locator('#homeSearch')).to_be_focused()
    return page.locator('#homeSearch')


def choose(page, group, name):
    section = page.locator('.app-search-results section').filter(
        has=page.get_by_role('heading', name=group, exact=True)
    )
    section.get_by_role('button', name=name).first.click()


def main():
    with Server(('127.0.0.1', 0), Quiet) as server, sync_playwright() as playwright:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        browser = playwright.chromium.launch()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        context = browser.new_context(viewport={'width': 320, 'height': 760}, is_mobile=True, has_touch=True)
        context.add_init_script(LEAFLET_STUB)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url)
        page.locator('#birdspotSplashSkip').click()
        trigger = page.locator('#homeSearchTrigger')
        logo = page.locator('.app-header__logo')
        header = page.locator('.app-header')
        bar, branding, frame = trigger.bounding_box(), logo.bounding_box(), header.bounding_box()
        assert abs(bar['height'] - 38) < .5 and bar['width'] >= frame['width'] - 36, (bar, branding, frame)
        assert bar['y'] > branding['y'] + branding['height']

        field = run_search(page)
        dialog = page.locator('#appSearchDialog')
        assert dialog.bounding_box() == {'x': 0, 'y': 0, 'width': 320, 'height': 760}
        field.fill('zqgeenresultaat')
        expect(dialog.get_by_role('status')).to_contain_text('Geen resultaten')
        page.keyboard.press('Escape')
        expect(dialog).to_be_hidden()
        expect(trigger).to_be_focused()
        run_search(page)
        page.go_back()
        expect(dialog).to_be_hidden()
        expect(trigger).to_be_visible()

        awaitable_fixture = """async () => {
          const { savePhoto } = await import('/src/data/db.js');
          const { addSighting } = await import('/src/data/sightings.js');
          const { savePlaces } = await import('/src/data/places.js');
          savePlaces([{ id: 'test-hut', name: 'Kijkhut Élan', lat: 52.2, lon: 5.2 }]);
          const record = await addSighting({
            id: 'test-observation', speciesId: 'sp045', speciesName: 'Merel', date: '2026-11-01',
            locationName: 'Kijkhut Élan', notes: 'Testnotitie ochtend', lat: 52.2, lon: 5.2,
            placeId: 'test-hut', photoIds: ['test-foto']
          });
          const response = await fetch('/assets/species/sp045.webp');
          await savePhoto({ id: 'test-foto', filename: 'merel-ochtend.webp',
            blob: await response.blob(), type: 'image/webp', sightingId: record.id });
          await savePhoto({ id: 'test-audio', filename: 'hut-geluid.wav',
            blob: new Blob(['test'], { type: 'audio/wav' }), placeId: 'test-hut' });
          const data = JSON.parse(localStorage.getItem('birdspot-sightings'));
          data.sightings.push(null);
          localStorage.setItem('birdspot-sightings', JSON.stringify(data));
        }"""
        page.evaluate(awaitable_fixture)

        run_search(page).fill('turdus merula')
        choose(page, 'Vogelsoorten', 'Merel Turdus merula')
        expect(page.locator('.signature-species-detail-overlay')).to_contain_text('Merel')
        page.locator('.signature-species-detail-close').click()

        run_search(page).fill('kijkhut elan')
        choose(page, 'Kaart en plekken', 'Kijkhut Élan Open op de kaart')
        expect(page.locator('#mapSheetName')).to_have_text('Kijkhut Élan')
        expect(page.locator('#mapDetailSheet.open')).to_be_visible()
        page.locator('#mapSheetClose').click()
        run_search(page).fill('kaartfilters')
        choose(page, 'Functies', 'Kaartfilters')
        expect(page.locator('#mapFilterPanel')).to_be_visible()

        run_search(page).fill('testnotitie ochtend')
        choose(page, 'Waarnemingen', 'Merel Kijkhut Élan')
        expect(page.locator('#detailSightingSheet')).to_contain_text('Testnotitie ochtend')
        page.locator('#detailClose').click()
        expect(page.locator('#detailSightingSheet')).to_have_count(0)

        run_search(page).fill('merel-ochtend.webp')
        choose(page, 'Media', 'merel-ochtend.webp')
        expect(page.get_by_role('dialog', name='Fotoweergave')).to_be_visible()
        page.get_by_role('button', name='Foto sluiten').click()

        run_search(page).fill('hut-geluid.wav')
        choose(page, 'Media', 'hut-geluid.wav')
        expect(page.locator('#mapSheetName')).to_have_text('Kijkhut Élan')
        expect(page.locator('[data-place-media-id="test-audio"]')).to_be_focused()
        page.locator('#mapSheetClose').click()

        field = run_search(page)
        field.fill('backup herstellen')
        field.press('Enter')
        expect(page.locator('#backupHeading')).to_be_focused()
        expect(page.locator('#confirmOverlay')).to_be_hidden()

        run_search(page).fill('waarneming toevoegen')
        choose(page, 'Functies', 'Waarneming toevoegen')
        expect(page.locator('#addSightingSheet')).to_be_visible()
        page.locator('#addSheetCancel').click()
        expect(page.locator('#addSightingSheet')).to_have_count(0)

        page.wait_for_function('() => !!navigator.serviceWorker.controller', timeout=90000)
        context.set_offline(True)
        page.reload(wait_until='domcontentloaded')
        page.locator('#birdspotSplashSkip').click()
        run_search(page).fill('Koperwiek')
        choose(page, 'Vogelsoorten', 'Koperwiek Turdus iliacus')
        expect(page.locator('.signature-species-detail-overlay')).to_contain_text('Koperwiek')
        assert not errors, errors
        browser.close()
    print('VERIFIED app-brede zoekbalk, navigatie naar alle resultaatgroepen en offline soortzoeken')


if __name__ == '__main__':
    main()
