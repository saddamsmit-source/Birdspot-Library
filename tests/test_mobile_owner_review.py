"""Reproduce the Home image and the field guide contrast review in Chromium."""
import threading

from playwright.sync_api import expect, sync_playwright

from test_species_detail import LEAFLET_STUB, Quiet, Server, SHOTS


def contrast(node, background=None):
    return node.evaluate(r"""(el, background) => {
      const luminance = color => {
        const rgb = color.match(/[\d.]+/g).slice(0, 3).map(n => Number(n) / 255);
        return rgb.map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4)
          .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
      };
      const a = luminance(getComputedStyle(el).color);
      const b = luminance(getComputedStyle(background ? el.closest(background) : el).backgroundColor);
      return (Math.max(a,b) + 0.05) / (Math.min(a,b) + 0.05);
    }""", background)


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
              const photo = el.querySelector('#featuredBirdImage');
              const rect = photo.getBoundingClientRect();
              const action = el.querySelector('[data-featured-species]').getBoundingClientRect();
              return {
                photoBehindAction: rect.bottom >= action.bottom && rect.left <= action.left && rect.right >= action.right,
                transparentCaption: getComputedStyle(caption).backgroundColor === 'rgba(0, 0, 0, 0)',
                noPhotoFilter: getComputedStyle(photo).filter === 'none' && getComputedStyle(photo).maskImage === 'none',
                noCaptionShade: getComputedStyle(caption, '::before').content === 'none' &&
                  getComputedStyle(caption).backgroundImage === 'none' &&
                  getComputedStyle(photo.parentElement, '::before').content === 'none',
                noPageOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
              };
            }""")
            assert all(result.values()), (width, result)
            assert contrast(cta) >= 4.5
            if width == 390:
                hero.screenshot(path=str(SHOTS / 'mobile_owner_hero_390.png'))

        page.set_viewport_size({'width': 390, 'height': 844})
        info = hero.get_by_text('Veldkenmerken', exact=True)
        info.click()
        expect(hero.locator('#featuredBirdWhere')).to_be_visible()
        assert contrast(hero.locator('#featuredBirdWhere'), 'details') >= 4.5
        info.click()
        cta.click()
        close_species(page.get_by_role('dialog', name='Wielewaal', exact=True))

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

        page.get_by_role('button', name='Waarneming toevoegen', exact=True).click()
        methods = page.locator('#sightMethodGroup')
        expect(methods.locator('[data-icon="eye"]')).to_have_count(1)
        expect(methods.locator('[data-icon="heard"]')).to_have_count(1)
        expect(methods.locator('[data-icon="both"]')).to_have_count(1)
        browser.close()
        print('Mobiele hoofdfoto 320–430 px, desktop 1280 px, contrast en herkenbare iconen gecontroleerd.')


if __name__ == '__main__':
    main()
