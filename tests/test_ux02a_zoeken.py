#!/usr/bin/env python3
"""UX-02A (25-11-2026): zoeken en filteren in Mijn waarnemingen.

Z1  zoeken: NL, wetenschappelijk, EN, gekoppelde plek, plaatsnaam, datum, periode; resultaatteller "x van y"
Z2  filters combineren (OF binnen groep, EN tussen groepen), chips en teller, chip verwijderen
Z3  verificatie: 'Zeker' zonder ongecontroleerde/oude suggesties; 'Niet vastgelegd' voor oude records
Z4  media: met foto of video / met geluid
Z5  lege uitkomst: duidelijke melding + Wis filters herstelt alles
Z6  oude records (zonder methode/bron, oude BirdNET-suggestie) tonen zonder fout en zonder verzonnen status
Z7  grote lijst (1500 records): eerste weergave en filteren snel genoeg, juiste telling
Z8  320/360/390/430: geen horizontale overloop, aanraakdoelen ≥ 44 px, periode volledig leesbaar
Z9  toetsenbord en schermlezer: Tab naar kaartje, Enter opent; resultaat in role=status; filterknop aria-expanded
Z10 donker thema: tekstcontrast van zoekveld, chips en statuslabels ≥ 4,5:1
Z11 globale zoekfunctie gebruikt dezelfde logica: vindt waarneming op plek en datum
Z12 plek, soort, halfjaar en seizoen combineren, onthouden en wissen
"""
from datetime import datetime
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, shown_ids, boot, SIGHTINGS  # noqa: E402

RESULTS = []
ALL = sorted(s['id'] for s in SIGHTINGS)
CONTRAST = """sel => [...document.querySelectorAll(sel)].filter(e => e.offsetParent).map(e => {
  const lum = c => { const m = c.match(/[\\d.]+/g).map(Number); const a = m.length > 3 ? m[3] : 1;
    return [m.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }), a]; };
  const bgOf = el => { for (let n = el; n; n = n.parentElement) { const c = getComputedStyle(n).backgroundColor; const [, a] = lum(c); if (a > .5) return c; } return 'rgb(255,255,255)'; };
  const [f] = lum(getComputedStyle(e).color), [b] = lum(bgOf(e));
  const L = v => .2126 * v[0] + .7152 * v[1] + .0722 * v[2];
  const r = (Math.max(L(f), L(b)) + .05) / (Math.min(L(f), L(b)) + .05);
  return [e.className || e.tagName, Math.round(r * 100) / 100];
})"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def search(page, text):
    page.locator('#sightingsSearch').fill(text)
    page.wait_for_timeout(350)
    return sorted(shown_ids(page))


def toggle(page, value):
    if page.locator('#sightingsFilterPanel').is_hidden():
        page.locator('#sightingsFilterBtn').click()
    page.locator(f'.sightings-filter-option[data-value="{value}"]').click()
    page.wait_for_timeout(250)
    return sorted(shown_ids(page))


def result_text(page):
    return page.locator('#sightingsResult').inner_text()


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(width=390, dark=False):
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, timezone_id='Europe/Amsterdam',
                                      is_mobile=True, has_touch=True, color_scheme='dark' if dark else 'light')
            page = ctx.new_page()
            page.clock.set_fixed_time(datetime.fromisoformat('2026-11-27T12:00:00+01:00'))
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            seed(page, base)
            go_sightings(page)
            return ctx, page, errors

        ctx, page, errors = context()
        # ── Z1 zoeken ────────────────────────────────────────────────
        found = {q: search(page, q) for q in ('merel', 'turdus merula', 'blackbird', 'amstelpark', 'achtertuin',
                                                 'plek 2', '12-06-2026', 'juni 2026', 'vandaag', 'gisteren', 'merel juni')}
        count = result_text(page)
        chip = page.locator('#sightingsChips').inner_text()
        check('Z1', 'zoeken op NL/wetenschappelijk/EN, plek, plaatsnaam, datum en periode; teller x van y',
              found['merel'] == ['s01', 's04', 's06'] and found['turdus merula'] == found['merel'] and found['blackbird'] == found['merel']
              and found['amstelpark'] == ['s01', 's05'] and found['achtertuin'] == ['s03'] and found['plek 2'] == ['s02']
              and found['12-06-2026'] == ['s03'] and found['juni 2026'] == ['s03', 's04', 's08'] and found['vandaag'] == ['s01']
              and found['gisteren'] == ['s02'] and found['merel juni'] == ['s04'] and count == '1 van 9 waarnemingen'
              and '“merel juni”' in chip and not errors, {k: v for k, v in found.items() if len(v) < 4})
        search(page, '')

        # ── Z2 filters combineren ────────────────────────────────────
        heard = toggle(page, 'heard')
        heard_bn = toggle(page, 'birdnet')
        heard_bn_certain = toggle(page, 'certain')
        badge = page.locator('#sightingsFilterCount').inner_text()
        pressed = page.locator('.sightings-filter-option[aria-pressed="true"]').count()
        chips = page.locator('#sightingsChips .sightings-chip').all_inner_texts()
        page.locator('#sightingsChips [data-chip="certainty:certain"]').click()
        page.wait_for_timeout(250)
        after_chip = sorted(shown_ids(page))
        check('Z2', 'filters combineren: OF binnen groep, EN tussen groepen; badge, chips, chip verwijderen',
              heard == ['s02', 's04', 's05', 's06', 's08', 's09'] and heard_bn == ['s04', 's05', 's08'] and heard_bn_certain == ['s05']
              and badge == '3' and pressed == 3 and len(chips) == 4 and after_chip == heard_bn
              and page.locator('#sightingsFilterBtn').get_attribute('aria-label') == 'Filters, 2 actief', chips)
        page.locator('#sightingsClearAll').click()
        page.wait_for_timeout(250)

        # ── Z12 primaire filters ────────────────────────────────────
        primary = {'Plek': 'place:pl_named', 'Vogelsoort': 'sp045', 'Periode': '6m', 'Seizoen': 'herfst'}
        for label, value in primary.items():
            page.get_by_label(label, exact=True).select_option(value)
        filtered = sorted(shown_ids(page))
        badge = page.locator('#sightingsFilterCount').inner_text()
        go_sightings(page)
        restored = {label: page.get_by_label(label, exact=True).input_value() for label in primary}
        page.get_by_label('Seizoen', exact=True).select_option('winter')
        empty_primary = 'Geen waarnemingen gevonden' in page.locator('#sightingsList').inner_text()
        page.locator('#sightingsList #sightingsClearAll').click()
        check('Z12', 'plek, vogelsoort, halfjaar en seizoen combineren, onthouden en wissen',
              filtered == ['s01'] and badge == '4' and restored == primary and empty_primary
              and sorted(shown_ids(page)) == ALL
              and all(page.get_by_label(label, exact=True).input_value() == '' for label in primary))

        # ── Z3 verificatie ───────────────────────────────────────────
        certain = toggle(page, 'certain')
        toggle(page, 'certain')
        unknown = toggle(page, 'unknown')
        toggle(page, 'unknown')
        unrecorded = toggle(page, 'unrecorded')
        toggle(page, 'unrecorded')
        own = toggle(page, 'self')
        toggle(page, 'self')
        legacy_card = page.locator('.sight-card[data-id="s06"]').inner_text()
        contra_card = page.locator('.sight-card[data-id="s08"]').inner_text()
        check('Z3', "verificatie: 'Zeker' zonder ongecontroleerde/oude suggesties; oude records onder 'Niet vastgelegd'",
              certain == ['s01', 's05', 's07', 's09'] and unknown == ['s06'] and unrecorded == ['s07'] and own == ['s01', 's02', 's09']
              and 'Controle onbekend' in legacy_card and 'Zeker' not in legacy_card
              and 'BirdNET · suggestie' in contra_card and 'Zeker' not in contra_card, [certain, unknown, own])

        # ── Z4 media ─────────────────────────────────────────────────
        photo = toggle(page, 'photo')
        both_media = toggle(page, 'audio')
        toggle(page, 'photo')
        audio = sorted(shown_ids(page))
        toggle(page, 'audio')
        check('Z4', 'media: met foto of video / met geluid / beide (OF)',
              photo == ['s01'] and audio == ['s02'] and both_media == ['s01', 's02'])

        # ── Z5 lege uitkomst ─────────────────────────────────────────
        toggle(page, 'seen')
        empty = search(page, 'boomkruiper')
        msg = page.locator('#sightingsList').inner_text()
        page.locator('#sightingsList #sightingsClearAll').click()
        page.wait_for_timeout(300)
        check('Z5', 'lege uitkomst: duidelijke melding, Wis filters herstelt zoekveld en filters',
              empty == [] and 'Geen waarnemingen gevonden' in msg and result_text(page) == '9 waarnemingen'
              and sorted(shown_ids(page)) == ALL and page.locator('#sightingsSearch').input_value() == ''
              and page.locator('.sightings-filter-option[aria-pressed="true"]').count() == 0)

        # ── Z6 oude records ──────────────────────────────────────────
        old = page.locator('.sight-card[data-id="s07"]')
        old_text = old.inner_text()
        old_pills = old.locator('.sighting-observed-pill, .sighting-merlin-pill').count()
        old.click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        detail = page.locator('#detailSightingSheet').inner_text()
        page.locator('#detailClose').click()
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        check('Z6', 'oud record zonder methode/bron: kaart en detail zonder fout, geen verzonnen methode of bron',
              'Huismus' in old_text and '×4' in old_text and 'Stationsplein' in old_text and old_pills == 0
              and 'Huismus' in detail and not errors, old_text.replace('\n', ' | '))

        # ── Z9 toetsenbord en schermlezer ────────────────────────────
        page.locator('#sightingsSearch').focus()
        panel_state = 'false' if page.locator('#sightingsFilterPanel').is_hidden() else 'true'
        roles = page.evaluate("""() => ({ result: document.querySelector('#sightingsResult').getAttribute('role'),
          expanded: document.querySelector('#sightingsFilterBtn').getAttribute('aria-expanded'),
          label: document.querySelector('label[for="sightingsSearch"]')?.textContent,
          card: document.querySelector('.sight-card').getAttribute('role') + '/' + document.querySelector('.sight-card').tabIndex })""")
        page.locator('.sight-card').first.focus()
        page.keyboard.press('Enter')
        opened = page.locator('#detailSightingSheet.open').count() == 1 or page.locator('#detailSightingSheet').wait_for(timeout=5000) is None
        page.keyboard.press('Escape')
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        check('Z9', 'toetsenbord en schermlezer: kaartje met Enter, role=status, aria-expanded, label',
              opened and roles == {'result': 'status', 'expanded': panel_state, 'label': 'Zoek in je waarnemingen', 'card': 'button/0'}, roles)

        # ── Z11 globale zoekfunctie ──────────────────────────────────
        page.evaluate("async () => { const app = await import('/src/app.js'); app.navigate('home', { force: true }); }")
        page.locator('#homeSearchTrigger').click()
        page.locator('#homeSearch').fill('achtertuin')
        page.wait_for_timeout(500)
        global_text = page.locator('.app-search-results').inner_text()
        page.locator('#homeSearch').fill('12-06-2026')
        page.wait_for_timeout(500)
        global_date = page.locator('.app-search-results').inner_text()
        check('Z11', 'globale zoekfunctie: zelfde zoektermen (plaatsnaam en datum dd-mm-jjjj)',
              'Roodborst' in global_text and 'Roodborst' in global_date and not errors, global_date[:80].replace('\n', ' | '))
        ctx.close()

        # ── Z7 grote lijst ───────────────────────────────────────────
        ctx, page, errors = context()
        page.evaluate("""() => { const base = JSON.parse(localStorage.getItem('birdspot-sightings'));
          const species = [['sp045','Merel'],['sp029','Koolmees'],['sp050','Roodborst'],['sp046','Zanglijster'],['sp043','Huismus']];
          const out = [];
          for (let i = 0; i < 1500; i++) { const [id, name] = species[i % 5];
            out.push({ id: 'big' + i, speciesId: id, speciesName: name, date: `2025-${String(1 + i % 12).padStart(2,'0')}-${String(1 + i % 28).padStart(2,'0')}`,
              count: 1, photoIds: [], audioIds: [], observationMethod: ['seen','heard','both'][i % 3], identificationSource: 'self',
              merlinVerification: null, certainty: 'certain', locationName: 'Plas ' + (i % 40), lat: null, lon: null, placeId: null,
              createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }); }
          localStorage.setItem('birdspot-sightings', JSON.stringify({ ...base, sightings: out })); }""")
        page.reload(wait_until='domcontentloaded')
        boot(page, base)
        t0 = time.perf_counter()
        go_sightings(page)
        first_ms = (time.perf_counter() - t0) * 1000
        n_all = page.locator('#sightingCards .sight-card').count()
        t0 = time.perf_counter()
        page.locator('#sightingsSearch').fill('koolmees plas 7')
        page.wait_for_function("document.querySelector('#sightingsResult').textContent.startsWith('') && document.querySelectorAll('#sightingCards .sight-card').length < 300", timeout=5000)
        filter_ms = (time.perf_counter() - t0) * 1000
        res = result_text(page)
        check('Z7', 'grote lijst (1500): weergave en zoeken snel, telling klopt',
              n_all == 1500 and first_ms < 4000 and filter_ms < 1500 and res.endswith('van 1500 waarnemingen') and not errors,
              f'eerste weergave {first_ms:.0f} ms, zoeken {filter_ms:.0f} ms, {res}')
        ctx.close()

        # ── Z8 breedtes ──────────────────────────────────────────────
        layout = {}
        for width in (320, 360, 390, 430):
            ctx, page, errors = context(width=width)
            page.locator('#sightingsFilterBtn').click()
            page.locator('.sightings-filter-option[data-value="heard"]').click()
            page.get_by_label('Periode', exact=True).select_option('6m')
            page.locator('#sightingsSearch').fill('natuurgebied')
            page.wait_for_timeout(350)
            page.screenshot(path=f'/tmp/ux02a_{width}.png', full_page=False)
            layout[width] = page.evaluate("""() => {
              const tooSmall = [...document.querySelectorAll('#sightingsTools button, #sightingsTools select, #sightingsSearch, .sight-card')]
                .filter(e => e.offsetParent).map(e => e.getBoundingClientRect()).filter(r => r.height < 44 || r.width < 44).length;
              const place = document.querySelector('.sight-card__place-name');
              const period = document.getElementById('sightingsFilter-period');
              const style = getComputedStyle(period);
              const canvas = document.createElement('canvas').getContext('2d');
              canvas.font = style.font;
              const periodFits = canvas.measureText(period.selectedOptions[0].text).width <=
                period.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 20;
              return { overflow: document.documentElement.scrollWidth > innerWidth, tooSmall,
                periodFits,
                ellipsis: place ? place.scrollWidth > place.clientWidth && getComputedStyle(place).textOverflow === 'ellipsis' : null,
                inView: [...document.querySelectorAll('#sightingsTools *')].filter(e => e.offsetParent).every(e => e.getBoundingClientRect().right <= innerWidth + .5) };
            }""")
            ctx.close()
        check('Z8', '320/360/390/430: periode leesbaar, geen overloop, aanraakdoelen ≥ 44 px',
              all(not v['overflow'] and v['tooSmall'] == 0 and v['inView'] and v['ellipsis'] and v['periodFits']
                  for v in layout.values()), layout)

        # ── Z10 donker thema ─────────────────────────────────────────
        ctx, page, errors = context(dark=True)
        page.locator('#sightingsFilterBtn').click()
        page.locator('.sightings-filter-option[data-value="certain"]').click()
        page.locator('.sightings-filter-option[data-value="certain"]').click()
        page.wait_for_timeout(200)
        page.screenshot(path='/tmp/ux02a_dark.png')
        ratios = page.evaluate(CONTRAST, '#sightingsSearch, .sightings-filter-option, .sightings-filter-btn, .sight-card__name, .sight-card__meta, .sighting-observed-pill, .sighting-merlin-pill, .sight-certainty, .sightings-result')
        low = [r for r in ratios if r[1] < 4.5]
        check('Z10', 'donker thema: contrast ≥ 4,5:1 voor zoekveld, filters, kaarttekst en labels', not low and len(ratios) > 10,
              low[:4] or f'{len(ratios)} elementen, min {min(r[1] for r in ratios)}')
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-02A: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 12 else 0)


if __name__ == '__main__':
    main()
