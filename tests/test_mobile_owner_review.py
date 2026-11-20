"""Reproduce the Home image and the field guide contrast review in Chromium."""
import threading

from playwright.sync_api import expect, sync_playwright

from test_species_detail import LEAFLET_STUB, Quiet, Server, SHOTS


def contrast(node, background=None, text_edge=False):
    return node.evaluate(r"""(el, {background, text_edge}) => {
      const luminance = color => {
        const rgb = color.match(/[\d.]+/g).slice(0, 3).map(n => Number(n) / 255);
        return rgb.map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
          .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
      };
      const a = luminance(getComputedStyle(el).color);
      const b = luminance(text_edge ? getComputedStyle(el).webkitTextStrokeColor
        : getComputedStyle(background ? el.closest(background) : el).backgroundColor);
      return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
    }""", {'background': background, 'text_edge': text_edge})


def open_species(page, name, sid):
    page.locator('.nav-item[data-route="species"]').click()
    page.locator('#speciesSearch').fill(name)
    page.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    card = page.get_by_role('dialog', name=name, exact=True)
    expect(card).to_be_visible()
    return card


def close_species(card):
    card.get_by_role('button', name='Sluit soortdetail').click()
    expect(card).to_be_hidden()


def check_photo_pair(photos):
    expect(photos).to_have_count(2)
    result = photos.evaluate_all("""nodes => {
      const [first, second] = nodes.map(node => node.getBoundingClientRect());
      const parent = nodes[0].parentElement.getBoundingClientRect();
      return Math.abs(first.top - second.top) <= 1 && first.right <= second.left &&
        Math.abs(first.width - second.width) <= 1 && Math.abs(parent.right - second.right) <= 1;
    }""")
    assert result, 'Both photos must fill the same row'


def check_recognition_media(page):
    buzzard = open_species(page, 'Buizerd', 'sp005')
    flight = buzzard.get_by_role('region', name='In vlucht')
    flight_pair = flight.locator('[data-plumage="neutral"] .sd-plumage-photo')
    for width in (320, 390, 430, 1280):
        page.set_viewport_size({'width': width, 'height': 844})
        check_photo_pair(flight_pair)
        assert abs(flight_pair.last.bounding_box()['x'] + flight_pair.last.bounding_box()['width'] -
                   flight.bounding_box()['x'] - flight.bounding_box()['width']) < 12
    page.set_viewport_size({'width': 390, 'height': 844})
    flight_pair.last.locator('.sd-field-photo').click()
    viewer = page.get_by_role('dialog', name='Vogelfoto bekijken')
    expect(viewer).to_be_visible()
    page.keyboard.press('Escape')
    expect(viewer).to_be_hidden()
    flight.locator('[data-plumage="neutral"]').screenshot(path=str(SHOTS / 'mobile_owner_buizerd_flight_390.png'))

    sounds = buzzard.locator('#sdVoice')
    rows = sounds.locator('.sd-audio')
    expect(rows.locator('strong')).to_have_text(['Roep', 'Alarmroep', 'Roep, tweede voorbeeld'])
    expect(rows.locator('audio[controls]')).to_have_count(3)
    expect(rows.locator('p:visible, .sd-media-credit')).to_have_count(0)
    credits = sounds.locator('.sd-audio-credits > summary')
    expect(credits).to_have_attribute('aria-label', 'Informatie en bronvermelding bij deze geluidsopnamen')
    byline = sounds.get_by_text('Benoît Van Hecke', exact=False)
    voice_description = sounds.locator('[data-kb-voice]')
    expect(byline).to_be_hidden()
    expect(voice_description).to_be_hidden()
    credits.focus()
    page.keyboard.press('Enter')
    expect(byline).to_be_visible()
    expect(voice_description).to_be_visible()
    expect(sounds.get_by_role('link', name='CC BY-SA 3.0')).to_have_count(1)
    expect(sounds.get_by_role('link', name='Bron', exact=True)).to_have_count(3)
    page.keyboard.press('Enter')
    expect(byline).to_be_hidden()
    first = rows.nth(0).locator('audio')
    second = rows.nth(1).locator('audio')
    first.evaluate('audio => audio.play()')
    expect(first).to_have_js_property('paused', False)
    second.evaluate('audio => audio.play()')
    expect(first).to_have_js_property('paused', True)
    expect(second).to_have_js_property('paused', False)
    sounds.screenshot(path=str(SHOTS / 'mobile_owner_buizerd_audio_390.png'))
    close_species(buzzard)

    for name, sid, selector in (
        ('Kleine Bonte Specht', 'sp017', '[data-plumage="adult_f"] .sd-plumage-photo'),
        ('Merel', 'sp045', '[data-layout="compare"] > [data-plumage="adult_m"] .sd-plumage-photo'),
        ('Kuifmees', 'sp033', '.sd-poses .sd-compare-card'),
    ):
        card = open_species(page, name, sid)
        check_photo_pair(card.locator(selector))
        close_species(card)


def main():
    with Server(("127.0.0.1", 0), Quiet) as server, sync_playwright() as pw:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        browser = pw.chromium.launch()
        context = browser.new_context(viewport={'width': 390, 'height': 844}, color_scheme='dark',
                                      reduced_motion='reduce', service_workers='block')
        context.add_init_script(LEAFLET_STUB)
        page = context.new_page()
        page.goto(base, wait_until='domcontentloaded')
        page.locator('#birdspotSplash').wait_for(state='detached', timeout=15000)
        catalogue = page.evaluate(r"""async () => {
          const { SPECIES } = await import('/src/data/species.js');
          const { guideHeroPhoto, recognitionPanel, wherePanel } = await import('/src/features/species/detailSections.js');
          const known = new Map();
          const invalid = [];
          const missing = [];
          for (const species of SPECIES) {
            const markup = recognitionPanel(species, null, true);
            const slots = [...markup.matchAll(/data-guide-slot="([^"]+)"/g)].map(match => match[1]);
            if (!slots.some(slot => slot.startsWith('flight-')) || slots.length !== new Set(slots).size) {
              invalid.push(species.id);
            }
            if (!guideHeroPhoto(species.id)) missing.push([species.nameNL, species.id, slots.includes('flight-neutral')]);
            for (const [, icon, label] of wherePanel(species).matchAll(/class="sd-habitat"><svg[^>]*data-icon="([^"]+)"[^>]*>.*?<\/svg>([^<]+)<\/span>/g)) {
              known.set(label, icon);
            }
          }
          const preferred = ['sp182', 'sp459'];
          const empty = missing.filter(([, , neutral]) => neutral);
          const sample = [...empty.filter(([, id]) => preferred.includes(id)),
                          ...empty.filter(([, id]) => !preferred.includes(id))]
            .slice(0, 2).map(([name, id]) => [name, id]);
          return { species: SPECIES.length, missing: missing.length, sample, habitats: [...known], invalid };
        }""")
        assert catalogue['species'] > 0, catalogue
        assert not catalogue['invalid'], catalogue
        assert len(catalogue['habitats']) == 14, catalogue
        assert len({icon for _, icon in catalogue['habitats']}) == 14, catalogue
        print(f"Gidsbrede controle geslaagd: {catalogue['species']} soorten, "
              f"{catalogue['missing']} zonder gidsfoto en 14 verschillende leefgebiediconen.")
        page.evaluate("""async () => {
          const { FEATURED_BIRDS, POSITION_KEY } = await import('/src/features/home/specialBirds.js');
          const index = FEATURED_BIRDS.findIndex(b => b.nl === 'Wielewaal');
          localStorage.setItem(POSITION_KEY, JSON.stringify({ index, elapsed: 0 }));
        }""")
        page.reload(wait_until='domcontentloaded')
        page.locator('#birdspotSplash').wait_for(state='detached', timeout=15000)
        hero = page.locator('#slideshow')
        expect(hero.locator('h2')).to_have_text('Wielewaal')
        hero.locator('img').evaluate('img => img.decode()')
        cta = hero.get_by_role('button', name='Bekijk soortkaart', exact=False)

        for width in (320, 360, 390, 430, 1280):
            page.set_viewport_size({'width': width, 'height': 844})
            result = hero.evaluate("""el => {
              const caption = el.querySelector('.featured-birds__caption');
              const identification = el.querySelector('.featured-birds__identification');
              const photo = el.querySelector('#featuredBirdImage');
              const rect = photo.getBoundingClientRect();
              const action = el.querySelector('[data-featured-species]');
              const actionRect = action.getBoundingClientRect();
              const notes = el.querySelector('.field-featured-notes');
              const translucent = node => {
                const alpha = Number(getComputedStyle(node).backgroundColor.split(',')[3]?.trim().replace(')', ''));
                return alpha > 0 && alpha < .5;
              };
              return {
                photoBehindAction: rect.bottom >= actionRect.bottom && rect.left <= actionRect.left &&
                  rect.right >= actionRect.right && rect.bottom >= notes.getBoundingClientRect().bottom,
                transparentCaption: getComputedStyle(caption).backgroundColor === 'rgba(0, 0, 0, 0)',
                transparentIdentification: [identification, identification.querySelector('.featured-birds__group')]
                  .every(node => getComputedStyle(node).backgroundColor === 'rgba(0, 0, 0, 0)'),
                transparentControls: translucent(action) && translucent(notes),
                readableEdges: [identification.querySelector('h2'), action, notes.querySelector('summary')]
                  .every(node => parseFloat(getComputedStyle(node).webkitTextStrokeWidth) > 0),
                noPhotoFilter: getComputedStyle(photo).filter === 'none' && getComputedStyle(photo).maskImage === 'none',
                noCaptionShade: getComputedStyle(caption, '::before').content === 'none' &&
                  getComputedStyle(caption).backgroundImage === 'none' &&
                  getComputedStyle(photo.parentElement, '::before').content === 'none',
                noPageOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
              };
            }""")
            assert all(result.values()), (width, result)
            assert contrast(cta, text_edge=True) >= 4.5
            assert contrast(hero.locator('h2'), text_edge=True) >= 4.5
            if width == 390:
                hero.screenshot(path=str(SHOTS / 'mobile_owner_hero_390.png'))

        page.set_viewport_size({'width': 390, 'height': 844})
        info = hero.get_by_text('Veldkenmerken', exact=True)
        info.focus()
        page.keyboard.press('Enter')
        expect(hero.locator('#featuredBirdWhere')).to_be_visible()
        notes = hero.locator('.field-featured-notes')
        for width in (320, 360, 390, 430, 1280):
            page.set_viewport_size({'width': width, 'height': 844})
            spacing = notes.evaluate("""el => {
              const panel = el.getBoundingClientRect();
              const title = el.querySelector('summary').getBoundingClientRect();
              const where = el.querySelector('#featuredBirdWhere').getBoundingClientRect();
              const presence = el.querySelector('#featuredBirdPresence').getBoundingClientRect();
              const rows = [...el.querySelectorAll('.field-featured-fact:not([hidden])')].map(row => row.getBoundingClientRect());
              const gaps = rows.slice(1).map((row, i) => row.top - rows[i].bottom);
              const icons = [...el.querySelectorAll('.field-featured-fact:not([hidden]) .field-featured-fact__icon')].length;
              return {
                inset: Math.min(where.left - panel.left, presence.left - panel.left,
                  panel.right - where.right, panel.right - presence.right),
                aligned: Math.abs(where.left - presence.left) <= 1,
                titleHeight: title.height,
                titleGap: where.top - title.bottom,
                rows: rows.length,
                icons,
                gaps,
                bottom: panel.bottom - presence.bottom,
              };
            }""")
            assert spacing['inset'] >= 12 and spacing['aligned'], (width, spacing)
            assert spacing['titleHeight'] >= 44 and 6 <= spacing['titleGap'] <= 14, (width, spacing)
            assert spacing['rows'] >= 3 and spacing['icons'] == spacing['rows'], (width, spacing)
            assert all(0 <= gap <= 16 for gap in spacing['gaps']) and spacing['bottom'] >= 12, (width, spacing)
            assert contrast(hero.locator('#featuredBirdWhere'), text_edge=True) >= 4.5
            if width == 390:
                notes.screenshot(path=str(SHOTS / 'mobile_owner_fieldnotes_390.png'))
        page.set_viewport_size({'width': 390, 'height': 844})
        page.keyboard.press('Enter')
        expect(hero.locator('#featuredBirdWhere')).to_be_hidden()
        cta.click()
        close_species(page.get_by_role('dialog', name='Wielewaal', exact=True))

        flute = open_species(page, 'Fluiter', 'sp058')
        intro = flute.locator('.signature-species-detail-intro')
        names = intro.locator('.signature-species-detail-names')
        expect(names.locator('em')).to_have_text('Phylloscopus sibilatrix')
        expect(names.locator('[lang="en"]')).to_have_text('Wood Warbler')
        gallery = flute.get_by_role('region', name='Eigen vogelfoto’s')
        media = gallery.get_by_role('button', name='Open Media Studio')
        expect(gallery.get_by_text('Nog geen foto bij een waarneming.')).to_be_visible()
        for width in (320, 390, 430):
            page.set_viewport_size({'width': width, 'height': 844})
            assert intro.bounding_box()['height'] < 120
            assert gallery.bounding_box()['height'] < 95
            assert media.bounding_box()['height'] >= 44
            assert intro.evaluate("el => getComputedStyle(el).boxShadow === 'none'")
        page.set_viewport_size({'width': 390, 'height': 844})
        intro.screenshot(path=str(SHOTS / 'mobile_owner_species_intro_390.png'))
        gallery.screenshot(path=str(SHOTS / 'mobile_owner_species_photos_390.png'))
        media.click()
        expect(page.get_by_role('heading', name='Wildlife Media Studio')).to_be_visible()

        check_recognition_media(page)

        dove = open_species(page, 'Holenduif', 'sp003')
        tip = dove.get_by_text('Tip: Vergelijk de vleugeltekening en de staart.', exact=False).first
        expect(tip).to_be_visible()
        themes = ['dark', 'light', '']
        for theme in themes:
            page.locator('html').evaluate('(html, theme) => html.dataset.theme = theme', theme)
            assert contrast(tip) >= 4.5
        tip.screenshot(path=str(SHOTS / 'mobile_owner_comparison_390.png'))
        close_species(dove)

        harrier = open_species(page, 'Steppekiekendief', 'sp250')
        helps = harrier.get_by_text('Helpt', exact=True).first
        warning = harrier.locator('.kb-caution')
        expect(helps).to_be_visible()
        expect(warning).to_be_visible()
        for theme in themes:
            page.locator('html').evaluate('(html, theme) => html.dataset.theme = theme', theme)
            assert contrast(helps) >= 4.5
            assert contrast(warning) >= 4.5
        harrier.locator('.kb-quick').screenshot(path=str(SHOTS / 'mobile_owner_knowledge_390.png'))
        harrier.get_by_role('tab', name='Waar', exact=True).click()
        field = harrier.locator('.sd-habitat', has_text='Boerenland')
        heath = harrier.locator('.sd-habitat', has_text='Heide')
        expect(field.locator('svg[data-icon="field"]')).to_be_visible()
        expect(heath.locator('svg[data-icon="heath"]')).to_be_visible()
        assert field.locator('svg path').first.get_attribute('d') != heath.locator('svg path').first.get_attribute('d')
        assert contrast(field.locator('svg'), '.sd-habitat') >= 3
        assert contrast(heath.locator('svg'), '.sd-habitat') >= 3
        expect(harrier.get_by_role('tab', name='Waarnemingen').locator('[data-icon="observations"]')).to_have_count(1)
        harrier.locator('.sd-habitats').screenshot(path=str(SHOTS / 'mobile_owner_habitat_390.png'))
        close_species(harrier)

        for name, sid in catalogue['sample']:
            card = open_species(page, name, sid)
            expect(card.locator('[data-guide-slot="hero"] .species-guide-photo')).to_have_count(0)
            for slot in ('hero', 'flight-neutral'):
                card.locator(f'[data-guide-slot="{slot}"] .sd-guide-action').click()
                editor = page.locator('.sd-guide-editor[open]')
                expect(editor.get_by_role('button', name='Gebruik in mijn gids')).to_be_visible()
                expect(editor.get_by_text('Foto voorstellen aan de beheerder', exact=True)).to_be_visible()
                editor.get_by_role('button', name='Sluit fotovenster').click()
                expect(editor).to_have_count(0)
            close_species(card)

        if catalogue['sample']:
            name, sid = catalogue['sample'][0]
            await_fixture = """async ({sid, name}) => {
              const { guideHeroPhoto } = await import('/src/features/species/detailSections.js');
              const { savePhoto } = await import('/src/data/db.js');
              const { addSighting } = await import('/src/data/sightings.js');
              const blob = await (await fetch(guideHeroPhoto('sp002').image)).blob();
              await savePhoto({ id: 'compact-photo-fixture', blob, speciesId: sid, sightingId: 'compact-sighting-fixture' });
              await addSighting({ id: 'compact-sighting-fixture', speciesId: sid, speciesName: name,
                date: '2026-11-15', photoIds: ['compact-photo-fixture'] });
            }"""
            page.evaluate(await_fixture, {'sid': sid, 'name': name})
            card = open_species(page, name, sid)
            expect(card.locator('#speciesDetailPhotos img')).to_have_count(1)
            expect(card.locator('[data-guide-slot="hero"] .sd-guide-stock img')).to_be_visible()
            card.locator('[data-guide-slot="hero"] .sd-guide-action').click()
            editor = page.locator('.sd-guide-editor[open]')
            expect(editor.get_by_role('button', name='Gebruik in mijn gids')).to_be_visible()
            editor.get_by_role('button', name='Sluit fotovenster').click()
            gallery_photo = card.get_by_role('button', name=f'Bekijk foto 1 van {name}')
            gallery_photo.click()
            viewer = page.get_by_role('dialog', name='Vogelfoto bekijken')
            expect(viewer).to_be_visible()
            page.keyboard.press('Escape')
            expect(viewer).to_be_hidden()
            close_species(card)

        page.get_by_role('button', name='Waarneming toevoegen', exact=True).click()
        page.locator('[data-quick-action="seen"]').click()
        methods = page.locator('#sightMethodGroup')
        expect(methods.locator('[data-icon="eye"]')).to_have_count(1)
        expect(methods.locator('[data-icon="heard"]')).to_have_count(1)
        expect(methods.locator('[data-icon="both"]')).to_have_count(1)
        browser.close()
        print('Mobiele hoofdfoto 320–430 px, desktop 1280 px, contrast en herkenbare iconen gecontroleerd.')


if __name__ == '__main__':
    main()
