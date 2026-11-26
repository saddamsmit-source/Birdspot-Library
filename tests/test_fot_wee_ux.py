#!/usr/bin/env python3
"""FOT-01, FOT-02, WEE-01 (PR #360, eigenaarakkoord 24-11-2026).

FOT-01 swipen tussen kleedfoto's in dezelfde fotokijker
  A1  groep met 3+ foto's: start bij aangetikte foto, rol + "1 van N", credits horen bij de foto
  A2  volgende/vorige-knoppen, randen uitgeschakeld, schermlezerlabels
  A3  swipe (touch en muis) bij 1× wisselt; terug-swipen werkt
  A4  ingezoomd: horizontaal slepen verschuift, wisselt niet; pijltoetsen wisselen niet
  A5  draaien wordt per foto teruggezet; pijltoetsen wisselen bij 1×
  A6  sluiten: focus op de laatst getoonde foto, scrollpositie soortkaart gelijk; opnieuw openen werkt
  A7  fotoaantallen: 0 (geen kijker), 1 (geen galerij), 2 en 3+ (galerij)
  A8  320/390/430 px: pijlen, teller en zoomknoppen binnen beeld, geen overloop
  A9  offline: na eerdere weergave blijven bladeren en zoomen werken
FOT-02 meerdere hoofdfoto's
  B1  zonder lijst: één hoofdfoto, geen teller, geen galerij (huidige weergave)
  B2  lijst met 2 extra: teller 1/3, kijker 3 foto's met vastgelegde rol en eigen credits; extra's pas geladen bij openen
  B3  lijst met 1 extra: 1/2; ongeldige/dubbele/vreemde paden genegeerd
  B4  kapotte foto-URL in de reeks: foutmelding, bladeren blijft werken
WEE-01 windrichting en locatie
  C1  windrichting uit API (45° → "wind uit NO (45°)"), aanvraag bevat wind_direction_10m, pijl verborgen voor schermlezer
  C2  locatie: eigen plek binnen 3 km → "Bij <plek>"; anders "Je huidige omgeving"; nooit coördinaten
  C3  geen GPS-toestemming → geen standaardstad, eerlijke melding (GPS-01, 26-11-2026; was "Amsterdam (standaardlocatie)")
  C4  ontbrekende richting/velden: geen verzonnen richting, "—" en "Wind onbekend"
  C5  Open-Meteo onbereikbaar of offline: bestaande foutmelding
  C6  grenswaarden 0/11/12/349/359/360 via de app-module
  C7  320 px: geen overloop in de weerkaart
"""
import functools
import http.server
import json
import os
import re
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parents[1])
sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot, open_species  # noqa: E402

RESULTS = []
WEATHER = 'https://api.open-meteo.com/v1/forecast?*'


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def state(page):
    return page.evaluate("""() => {
      const v = document.querySelector('.sd-photo-viewer'); if (!v) return null;
      const img = v.querySelector('.sd-photo-frame img');
      return { gallery: v.classList.contains('is-gallery'), src: img?.getAttribute('src')?.split('/').pop(),
        label: v.querySelector('.sd-photo-caption strong')?.textContent || null,
        count: v.querySelector('.sd-photo-caption span')?.textContent || null,
        zoom: v.querySelector('[data-zoom="reset"]').textContent, rotate: img?.style.transform || '',
        maker: (v.querySelector(':scope > .photo-info .photo-info__panel')?.textContent.match(/Maker: ([^\\n]+)/) || [])[1]?.trim() || null,
        prev: v.querySelector('[data-step="-1"]')?.getAttribute('aria-label') || null,
        next: v.querySelector('[data-step="1"]')?.getAttribute('aria-label') || null,
        prevDisabled: v.querySelector('[data-step="-1"]')?.disabled ?? null, nextDisabled: v.querySelector('[data-step="1"]')?.disabled ?? null,
        live: v.querySelector('.sd-photo-caption')?.getAttribute('aria-live') || null,
        scrollLeft: v.querySelector('.sd-photo-viewport').scrollLeft };
    }""")


def wait_img(page):
    page.wait_for_function("() => { const i = document.querySelector('.sd-photo-viewer .sd-photo-frame img'); return i && (i.hasAttribute('style') || i.hidden); }", timeout=15000)


def group_info(page, min_count):
    """Eerste zichtbare fotogroep met minstens min_count foto's: [{src, maker}] en index in de pagina."""
    return page.evaluate("""min => {
      const scopes = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list, .signature-species-detail-overlay .sd-compare-grid, .signature-species-detail-overlay .sd-cmp-panel')];
      for (const [i, scope] of scopes.entries()) {
        const btns = [...scope.querySelectorAll('[data-guide-image]')].filter(b => b.getClientRects().length);
        if (btns.length >= min) return { scope: i, items: btns.map(b => ({ src: b.dataset.guideImage.split('/').pop(),
          maker: (b.parentElement.querySelector('.photo-info .photo-info__panel')?.textContent.match(/Maker: ([^\\n]+)/) || [])[1]?.trim() || null })) };
      }
      return null; }""", min_count)


SCROLLS = "() => [...document.querySelectorAll('.signature-species-detail-overlay, .signature-species-detail-sheet, .signature-species-detail-sheet .sheet__content')].map(e => Math.round(e.scrollTop))"


def scroll_to_group_photo(page, scope_index, photo_index):
    page.evaluate("""([s, p]) => {
      const scope = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list, .signature-species-detail-overlay .sd-compare-grid, .signature-species-detail-overlay .sd-cmp-panel')][s];
      const btn = [...scope.querySelectorAll('[data-guide-image]')].filter(b => b.getClientRects().length)[p];
      btn.scrollIntoView({block: 'center'}); }""", [scope_index, photo_index])
    page.wait_for_timeout(150)


def click_group_photo(page, scope_index, photo_index):
    scroll_to_group_photo(page, scope_index, photo_index)
    page.evaluate("""([s, p]) => {
      const scope = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list, .signature-species-detail-overlay .sd-compare-grid, .signature-species-detail-overlay .sd-cmp-panel')][s];
      [...scope.querySelectorAll('[data-guide-image]')].filter(b => b.getClientRects().length)[p].click(); }""", [scope_index, photo_index])
    page.locator('.sd-photo-viewer').wait_for(timeout=10000)
    wait_img(page)


def touch_swipe(cdp, x0, y0, x1, y1, steps=8):
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
    for i in range(1, steps + 1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / steps, 'y': y0 + (y1 - y0) * i / steps}]})
    cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})


def viewer_box(page):
    return page.locator('.sd-photo-viewport').bounding_box()


def close_species(page):
    page.locator('.signature-species-detail-close').click()
    page.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=8000)


def fot01(page, cdp, width):
    open_species(page, 'Merel', 'sp045')
    g3 = group_info(page, 3)
    if not g3:
        check(f'A1@{width}', 'groep met 3+ foto\'s gevonden', False, 'geen groep')
        return
    scroll_to_group_photo(page, g3['scope'], 1)
    sheet_scroll_before = page.evaluate(SCROLLS)
    click_group_photo(page, g3['scope'], 1)
    n = len(g3['items'])
    st = state(page)
    check(f'A1@{width}', 'start bij aangetikte foto, rol + teller, credits van deze foto',
          st['gallery'] and st['src'] == g3['items'][1]['src'] and st['count'] == f'2 van {n}' and st['label'] and st['maker'] == g3['items'][1]['maker'] and st['live'] == 'polite', st)
    page.locator('.sd-photo-viewer [data-step="-1"]').click(); wait_img(page)
    a = state(page)
    page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    b = state(page)
    check(f'A2@{width}', 'knoppen bladeren; eerste/laatste uitgeschakeld; labels noemen de buurfoto',
          a['src'] == g3['items'][0]['src'] and a['prevDisabled'] and a['count'] == f'1 van {n}' and 'eerste' in a['prev']
          and b['src'] == g3['items'][2]['src'] and b['maker'] == g3['items'][2]['maker'] and b['count'] == f'3 van {n}'
          and (b['nextDisabled'] == (n == 3)), {'a': a, 'b': b})
    # A3: swipe naar rechts (vorige) en links (volgende), touch en muis.
    box = viewer_box(page)
    cy = box['y'] + box['height'] / 2
    touch_swipe(cdp, box['x'] + box['width'] * 0.75, cy, box['x'] + box['width'] * 0.2, cy + 6)  # links: volgende? we staan op 3
    after_left = state(page)
    touch_swipe(cdp, box['x'] + box['width'] * 0.2, cy, box['x'] + box['width'] * 0.8, cy - 4)  # rechts: vorige
    wait_img(page); back = state(page)
    page.mouse.move(box['x'] + box['width'] * 0.8, cy); page.mouse.down(); page.mouse.move(box['x'] + box['width'] * 0.25, cy, steps=6); page.mouse.up()
    wait_img(page); mouse_next = state(page)
    expected_left = g3['items'][3]['src'] if n > 3 else g3['items'][2]['src']
    check(f'A3@{width}', 'touch- en muisswipe bij 1×: links volgende, rechts vorige',
          after_left['src'] == expected_left and back['src'] == (g3['items'][2]['src'] if n > 3 else g3['items'][1]['src'])
          and mouse_next['src'] == (g3['items'][3]['src'] if n > 3 else g3['items'][2]['src']),
          {'left': after_left['src'], 'back': back['src'], 'mouse': mouse_next['src']})
    # A4: ingezoomd: slepen = verschuiven, geen wissel; pijltoets geen wissel.
    page.locator('.sd-photo-viewer [data-zoom="in"]').click()
    page.locator('.sd-photo-viewer [data-zoom="in"]').click()  # 4×: in elke beeldverhouding verschuifbaar
    page.wait_for_function("() => document.querySelector('.sd-photo-viewport').classList.contains('is-zoomed')")
    z0 = state(page)
    z0['pos'] = page.evaluate("() => { const v = document.querySelector('.sd-photo-viewport'); return [Math.round(v.scrollLeft), Math.round(v.scrollTop)]; }")
    page.mouse.move(box['x'] + box['width'] * 0.7, cy + 60); page.mouse.down(); page.mouse.move(box['x'] + box['width'] * 0.2, cy - 60, steps=8); page.mouse.up()
    z1pos = page.evaluate("() => { const v = document.querySelector('.sd-photo-viewport'); return [Math.round(v.scrollLeft), Math.round(v.scrollTop)]; }")
    touch_swipe(cdp, box['x'] + box['width'] * 0.3, cy, box['x'] + box['width'] * 0.85, cy)
    page.keyboard.press('ArrowLeft')
    page.wait_for_timeout(200)
    z1 = state(page)
    check(f'A4@{width}', 'ingezoomd: slepen verschuift, geen fotowissel (muis, touch, pijl)',
          z1['src'] == z0['src'] and z1['zoom'] == '4×' and z1pos != z0['pos'], {'voor': z0['pos'], 'na': z1pos, 'src': (z0['src'], z1['src'])})
    # A5: terug naar 1×, draaien, pijltoets → volgende foto met draaiing en zoom terug op begin.
    page.locator('.sd-photo-viewer [data-zoom="reset"]').click()
    page.locator('.sd-photo-viewer [data-turn="1"]').click()
    turned = state(page)['rotate']
    page.locator('.sd-photo-viewport').focus()
    page.keyboard.press('ArrowLeft'); wait_img(page)
    k = state(page)
    check(f'A5@{width}', 'draaiing per foto terug; pijltoets wisselt bij 1×',
          'rotate(90deg)' in turned and 'rotate(0deg)' in k['rotate'] and k['zoom'] == '1×' and k['src'] != z1['src'], {'turned': turned, 'k': k['rotate'], 'src': k['src']})
    # A8: lay-out op deze breedte.
    lay = page.evaluate("""() => { const v = document.querySelector('.sd-photo-viewer'); const W = innerWidth;
      const inside = el => { const r = el.getBoundingClientRect(); return r.left >= -1 && r.right <= W + 1 && r.width > 0; };
      return { steps: [...v.querySelectorAll('[data-step]')].every(inside), caption: inside(v.querySelector('.sd-photo-caption')),
        zoom: [...v.querySelectorAll('.sd-photo-zoom button')].every(inside), overflow: document.documentElement.scrollWidth - W,
        stepSize: [...v.querySelectorAll('[data-step]')].map(b => Math.round(b.getBoundingClientRect().width)) }; }""")
    check(f'A8@{width}', 'pijlen, teller en zoomknoppen binnen beeld, geen overloop, doelen ≥44 px',
          lay['steps'] and lay['caption'] and lay['zoom'] and lay['overflow'] <= 1 and min(lay['stepSize']) >= 44, lay)
    # A6: sluiten → focus op de laatst getoonde foto, scrollpositie gelijk; opnieuw openen.
    shown = state(page)['src']
    page.locator('.sd-photo-viewer .signature-lightbox-close').click()
    page.locator('.sd-photo-viewer').wait_for(state='detached')
    focus = page.evaluate("() => document.activeElement?.dataset?.guideImage?.split('/').pop() || null")
    sheet_scroll_after = page.evaluate(SCROLLS)
    click_group_photo(page, g3['scope'], 0)
    re_open = state(page)
    page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    check(f'A6@{width}', 'sluiten: focus op laatst getoonde foto, scrollpositie gelijk; opnieuw openen bij foto 1',
          focus == shown and sheet_scroll_after == sheet_scroll_before and re_open['src'] == g3['items'][0]['src'],
          {'focus': focus, 'shown': shown, 'scroll': [sheet_scroll_before, sheet_scroll_after]})
    close_species(page)


def fot01_counts(page):
    out = {}
    # 0 foto's: soort zonder gidsfoto.
    open_species(page, 'Stadsduif', 'sp001')
    out['0'] = page.locator('.signature-species-detail-overlay [data-guide-image]').count()
    close_species(page)
    # 1 foto in groep → geen galerij.
    open_species(page, 'Houtduif', 'sp002')
    single = page.evaluate("""() => { const b = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list [data-guide-image]')].filter(x => x.getClientRects().length);
      const lists = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list')].map(l => [...l.querySelectorAll('[data-guide-image]')].filter(x => x.getClientRects().length).length);
      if (!b.length) return null; b[0].scrollIntoView({block:'center'}); b[0].click(); return lists; }""")
    if single is not None:
        page.locator('.sd-photo-viewer').wait_for(); wait_img(page)
        st = state(page)
        out['1'] = (single, st['gallery'], st['count'])
        page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    close_species(page)
    # 2 foto's: eerste soort met een groep van precies 2.
    for name, sid in (('Torenvalk', 'sp008'), ('Sperwer', 'sp006'), ('Havik', 'sp007'), ('Kuifeend', 'sp092')):
        open_species(page, name, sid)
        two = page.evaluate("""() => { const scopes = [...document.querySelectorAll('.signature-species-detail-overlay .sd-plumage-list, .signature-species-detail-overlay .sd-compare-grid, .signature-species-detail-overlay .sd-cmp-panel')];
          return scopes.findIndex(s => [...s.querySelectorAll('[data-guide-image]')].filter(b => b.getClientRects().length).length === 2); }""")
        if two >= 0:
            click_group_photo(page, two, 0)
            st = state(page)
            out['2'] = (sid, st['gallery'], st['count'])
            page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
            close_species(page)
            break
        close_species(page)
    check('A7', 'fotoaantallen: 0 geen kijker, 1 zonder galerij, 2 als galerij "1 van 2"',
          out.get('0') == 0 and out.get('1') and out['1'][1] is False and out['1'][2] is None
          and out.get('2') and out['2'][1] is True and out['2'][2] == '1 van 2', out)


def fot02(page):
    open_species(page, 'Groene Specht', 'sp019')
    b1 = page.evaluate("() => ({count: document.querySelectorAll('.signature-species-detail-overlay .sd-hero-count').length, extras: document.querySelectorAll('[data-hero-extra]').length})")
    page.locator('.signature-species-detail-overlay .sd-hero-photo').click(); page.locator('.sd-photo-viewer').wait_for(); wait_img(page)
    s1 = state(page)
    page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    close_species(page)
    check('B1', 'zonder lijst: één hoofdfoto, geen teller, geen galerij', b1 == {'count': 0, 'extras': 0} and s1['gallery'] is False, (b1, s1['gallery']))

    page.evaluate("""async () => { const m = await import('/src/features/species/guideHeroSets.js');
      m.GUIDE_HERO_SETS.sp019 = ['/assets/species/plumage/sp019-female-ground.webp', '/assets/species/plumage/sp019-flight.webp']; }""")
    performance_before = page.evaluate("() => performance.getEntriesByType('resource').filter(e => /sp019-(female-ground|flight)/.test(e.name)).length")
    open_species(page, 'Groene Specht', 'sp019')
    page.wait_for_timeout(400)
    hero_badge = page.locator('.signature-species-detail-overlay .sd-hero-count').inner_text()
    loaded_early = page.evaluate("""() => [...document.querySelectorAll('.signature-species-detail-hero img')].map(i => i.currentSrc.split('/').pop())""")
    page.locator('.signature-species-detail-overlay .sd-hero-photo').click(); page.locator('.sd-photo-viewer').wait_for(); wait_img(page)
    seq = [state(page)]
    for _ in range(2):
        page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page); seq.append(state(page))
    page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    expected = [('sp019-hero-male.webp', 'Mannetje'), ('sp019-female-ground.webp', 'Vrouwtje'), ('sp019-flight.webp', 'Vrouwtje · in vlucht')]
    makers = [x['maker'] for x in seq]
    check('B2', 'teller 1/3; kijker 3 foto\'s met vastgelegde rol en eigen credits; extra\'s niet vooraf geladen',
          hero_badge == '1/3' and [(x['src'], x['label']) for x in seq] == expected and all(makers) and len(set(makers)) >= 2
          and [x['count'] for x in seq] == ['1 van 3', '2 van 3', '3 van 3'] and not any('female-ground' in s or 'sp019-flight' in s for s in loaded_early),
          {'badge': hero_badge, 'seq': [(x['src'], x['label'], x['maker']) for x in seq], 'early': loaded_early, 'perfBefore': performance_before})
    close_species(page)

    page.evaluate("""async () => { const m = await import('/src/features/species/guideHeroSets.js');
      m.GUIDE_HERO_SETS.sp019 = ['/assets/species/plumage/sp019-hero-male.webp', '/assets/species/sp045.webp', '/nope.webp',
        '/assets/species/plumage/sp019-juv.webp', '/assets/species/plumage/sp019-juv.webp']; }""")
    open_species(page, 'Groene Specht', 'sp019')
    badge = page.locator('.signature-species-detail-overlay .sd-hero-count').inner_text()
    page.locator('.signature-species-detail-overlay .sd-hero-photo').click(); page.locator('.sd-photo-viewer').wait_for(); wait_img(page)
    page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    s2 = state(page)
    page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    close_species(page)
    check('B3', '1 geldige extra → 1/2; dubbele, vreemde soort en onbekende paden genegeerd',
          badge == '1/2' and s2['src'] == 'sp019-juv.webp' and s2['label'] == 'Juveniel' and s2['count'] == '2 van 2', (badge, s2['src'], s2['label']))
    page.evaluate("async () => { const m = await import('/src/features/species/guideHeroSets.js'); delete m.GUIDE_HERO_SETS.sp019; }")

    page.evaluate("""async () => { const {openPhotoViewer} = await import('/src/utils/photoViewer.js');
      window.__closeTestViewer = openPhotoViewer({ url: '/assets/species/sp045.webp', alt: 'x', items: [
        {url: '/assets/species/does-not-exist.webp', alt: 'kapot', label: 'Kapot'},
        {url: '/assets/species/sp045.webp', alt: 'Merel', label: 'Merel'}] }); }""")
    page.wait_for_selector('.sd-photo-viewer .sd-photo-error')
    err = page.locator('.sd-photo-viewer .sd-photo-error').inner_text()
    page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    s3 = state(page)
    page.evaluate("() => window.__closeTestViewer()")
    check('B4', 'kapotte foto-URL: melding, bladeren naar volgende werkt', 'niet beschikbaar' in err and s3['src'] == 'sp045.webp', (err, s3['src']))


def home_weather(browser, url, *, geo, places, payload=None, status=200, abort=False, width=390):
    ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True,
                              reduced_motion='reduce', service_workers='block',
                              geolocation=geo, permissions=['geolocation'] if geo else [])
    page = ctx.new_page()
    requests = []

    def handle(route):
        requests.append(route.request.url)
        if abort:
            return route.abort()
        return route.fulfill(status=status, json=payload if payload is not None else {})
    page.route(WEATHER, handle)
    if places:
        page.add_init_script("localStorage.setItem('birdspot-places', JSON.stringify({schemaVersion: 1, places: " + json.dumps(places) + "}));")
    boot(page, url)
    sec = page.locator('#weatherSection')
    sec.scroll_into_view_if_needed()
    page.wait_for_function("() => document.querySelector('#weatherSection .weather-card, #weatherSection .dash-section__error')", timeout=20000)
    info = page.evaluate("""() => { const s = document.querySelector('#weatherSection');
      const card = s.querySelector('.weather-card');
      return { text: (card || s).innerText, place: card?.querySelector('.weather-place')?.innerText || null,
        wind: card?.querySelector('.weather-wind')?.innerText || null, windAria: card?.querySelector('.weather-wind')?.getAttribute('aria-label') || null,
        arrowHidden: card?.querySelector('.weather-wind-arrow')?.getAttribute('aria-hidden') || null,
        error: s.querySelector('.dash-section__error')?.innerText || null,
        overflow: card ? Math.max(...[...card.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - card.getBoundingClientRect().right : 0 }; }""")
    info['requests'] = requests
    ctx.close()
    return info


def wee01(browser, url):
    full = {'current': {'temperature_2m': 7.4, 'apparent_temperature': 4.1, 'weather_code': 3, 'wind_speed_10m': 5,
                        'wind_direction_10m': 45, 'relative_humidity_2m': 81, 'is_day': 1}}
    geo = {'latitude': 51.9200, 'longitude': 4.4700}
    plas = [{'id': 'pl_w', 'name': 'Kralingse Plas', 'lat': 51.9285, 'lon': 4.5110, 'createdAt': '2026-05-01T08:00:00.000Z', 'updatedAt': '2026-05-01T08:00:00.000Z'}]
    a = home_weather(browser, url, geo=geo, places=plas, payload=full)
    coord = re.search(r'\d{1,2}[.,]\d{2,}\s*°?\s*[NOE]', a['text'] or '')
    check('C1', 'windrichting uit API: "wind uit NO (45°)", aanvraag met wind_direction_10m, pijl verborgen',
          a['wind'] and 'wind uit NO (45°)' in a['wind'] and 'uit het noordoosten' in (a['windAria'] or '') and a['arrowHidden'] == 'true'
          and a['requests'] and 'wind_direction_10m' in a['requests'][0], a)
    far = home_weather(browser, url, geo={'latitude': 52.09, 'longitude': 5.12}, places=plas, payload=full)
    check('C2', 'locatie: eigen plek binnen 3 km → "Bij Kralingse Plas"; anders "Je huidige omgeving"; geen coördinaten',
          a['place'] and 'Bij Kralingse Plas' in a['place'] and 'actueel weer' in a['place'] and far['place'] and 'Je huidige omgeving' in far['place']
          and not coord and not re.search(r'\d{1,2}[.,]\d{2,}', (a['place'] or '') + (far['place'] or '')), (a['place'], far['place']))
    no_gps = home_weather(browser, url, geo=None, places=plas, payload=full)
    # GPS-01 (26-11-2026, eigenaareis live GPS): bewuste testwijziging — geen weer voor een standaardstad.
    check('C3', 'geen GPS-toestemming → geen standaardstad, melding "geen toegang tot je locatie", geen weerverzoek',
          no_gps['place'] is None and 'Amsterdam' not in (no_gps['text'] or '') and 'geen toegang tot je locatie' in (no_gps['text'] or '')
          and not no_gps['requests'], (no_gps['place'], (no_gps['text'] or '')[:120]))
    missing_dir = home_weather(browser, url, geo=geo, places=[], payload={'current': {**full['current'], 'wind_direction_10m': None}})
    missing_all = home_weather(browser, url, geo=geo, places=[], payload={'current': {'weather_code': 2}})
    check('C4', 'ontbrekende richting/velden: geen verzonnen richting; "—" en "Wind onbekend"',
          missing_dir['wind'] and 'wind uit' not in missing_dir['wind'] and '5 m/s' in missing_dir['wind']
          and missing_all['wind'] == '💨 Wind onbekend' and '—' in missing_all['text'] and 'undefined' not in missing_all['text'] and 'NaN' not in missing_all['text'],
          (missing_dir['wind'], missing_all['wind'], missing_all['text'][:120]))
    down = home_weather(browser, url, geo=geo, places=[], status=503, payload={'error': True})
    offline = home_weather(browser, url, geo=geo, places=[], abort=True)
    check('C5', 'Open-Meteo onbereikbaar/offline: bestaande foutmelding', down['error'] == 'Weer niet beschikbaar' and offline['error'] == 'Weer niet beschikbaar',
          (down['error'], offline['error']))
    narrow = home_weather(browser, url, geo=geo, places=[{**plas[0], 'name': 'Een heel lange eigen plaatsnaam bij de Kralingse Plas Noordoever'}], payload=full, width=320)
    check('C7', '320 px: lange plaatsnaam en windregel zonder overloop', narrow['overflow'] <= 1 and 'wind uit NO' in (narrow['wind'] or ''), narrow['overflow'])


def wee01_bounds(page):
    r = page.evaluate("""async () => { const m = await import('/src/features/home/weatherFormat.js');
      return [0, 11, 12, 33, 34, 45, 90, 180, 270, 348, 349, 359, 360, -10, 405].map(d => [d, m.compassPoint(d)?.abbr, m.compassPoint(d)?.deg]); }""")
    want = {0: 'N', 11: 'N', 12: 'NNO', 33: 'NNO', 34: 'NO', 45: 'NO', 90: 'O', 180: 'Z', 270: 'W', 348: 'NNW', 349: 'N', 359: 'N', 360: 'N', -10: 'N', 405: 'NO'}
    check('C6', 'grenswaarden kompas (16 punten, Nederlands)', all(want[d] == a for d, a, _ in r) and dict((d, g) for d, _, g in r)[-10] == 350, r)


def offline_viewer(browser, url):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce', service_workers='allow')
    page = ctx.new_page()
    boot(page, url)
    page.wait_for_function("async () => !!(await navigator.serviceWorker.ready)", timeout=30000)
    page.reload(wait_until='domcontentloaded'); boot(page, url)
    open_species(page, 'Merel', 'sp045')
    g = group_info(page, 3)
    click_group_photo(page, g['scope'], 0)
    for _ in range(len(g['items']) - 1):
        page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    page.keyboard.press('Escape'); page.locator('.sd-photo-viewer').wait_for(state='detached')
    close_species(page)
    ctx.set_offline(True)
    page.reload(wait_until='domcontentloaded'); boot(page, url)
    open_species(page, 'Merel', 'sp045')
    click_group_photo(page, g['scope'], 0)
    page.locator('.sd-photo-viewer [data-step="1"]').click(); wait_img(page)
    page.locator('.sd-photo-viewer [data-zoom="in"]').click()
    st = state(page)
    ok = st['src'] == g['items'][1]['src'] and st['zoom'] == '2×' and page.locator('.sd-photo-viewer .sd-photo-error').count() == 0
    check('A9', 'offline: bladeren en zoomen blijven werken na eerdere weergave', ok, st)
    ctx.close()


def main():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{srv.server_address[1]}/'
    errors = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        for width in (320, 390, 430):
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True, reduced_motion='reduce', service_workers='block')
            page = ctx.new_page()
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.route(WEATHER, lambda route: route.fulfill(json={'current': {'temperature_2m': 6, 'weather_code': 3, 'wind_speed_10m': 2, 'wind_direction_10m': 200, 'relative_humidity_2m': 80, 'is_day': 1}}))
            boot(page, url)
            cdp = ctx.new_cdp_session(page)
            fot01(page, cdp, width)
            if width == 390:
                fot01_counts(page)
                fot02(page)
                wee01_bounds(page)
            ctx.close()
        offline_viewer(browser, url)
        wee01(browser, url)
        browser.close()
    srv.shutdown()
    check('Z1', 'geen paginafouten', not errors, errors[:3])
    passed = sum(ok for _, ok in RESULTS)
    print(f"FOT-WEE-UX {'PASS' if passed == len(RESULTS) else 'FAIL'}: {passed}/{len(RESULTS)}")
    sys.exit(0 if passed == len(RESULTS) else 1)


if __name__ == '__main__':
    main()
