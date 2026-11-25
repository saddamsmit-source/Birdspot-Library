#!/usr/bin/env python3
"""UX-02C (25-11-2026): Mijn waarnemingen bereikbaar en vogelplekken herkenbaar.

P1  Home: 'Alle waarnemingen' zichtbaar en opent de lijst
P2  Kaart: lijstknop met zichtbare tekst, ≥ 44 px, opent de lijst; kaartbalk zonder overloop op 320 px
P3  Soortkaart: 'Bekijk in Mijn waarnemingen (n)' opent de lijst met soortfilter; filter wissen toont alles
P4  Profiel: ingang bovenaan opent de lijst
P5  geen zesde navigatietab
P6  plekken herkenbaar in kaartje en detail: benoemd, automatisch, alleen GPS, alleen plaatsnaam
P7  automatische plek benoemen: lege naam geweigerd, annuleren, bewaren; alleen naam + nameOrigin van die plek wijzigen
P8  hergebruiken en terugvinden: bekende automatische plek in formulier herkenbaar; zoeken op de nieuwe naam
P9  nieuwe plekken: zonder plaatsnaam nameOrigin 'auto' (vooraf gemeld), met plaatsnaam 'user'
P10 offline benoemen
P11 zonder GPS-toestemming: alleen plaatsnaam, geen plek gemaakt; detail 'zonder pin'
P12 bestaande plekgegevens niet stil aangepast (oude plekken krijgen geen nameOrigin door bekijken)
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, shown_ids, boot, rows, stored_places  # noqa: E402
from test_ux01c_vervolg import gps_script  # noqa: E402

RESULTS = []


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def place(page, pid):
    return next((p for p in stored_places(page) if p['id'] == pid), None)


def open_card(page, sid):
    page.locator(f'.sight-card[data-id="{sid}"]').click()
    page.locator('#detailSightingSheet.open').wait_for(timeout=10000)


def close_detail(page):
    page.locator('#detailClose').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)


def summary_where(page):
    return page.locator('#detailSightingSheet .detail-summary__row--where').inner_text().replace('\n', ' ')


def open_form(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="seen"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)
    page.locator('#speciesPickerBtn').click()
    page.locator('#spPickerSearch').fill('huismus')
    page.locator('#spPickerList .species-row[data-id="sp043"]').click()
    page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)


def save_form(page):
    page.locator('#addSheetSubmit').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
    page.wait_for_timeout(300)


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(width=390, granted=True):
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
            ctx.add_init_script(gps_script(granted))
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            seed(page, base)
            return ctx, page, errors

        ctx, page, errors = context()
        places_before = {p['id']: p for p in stored_places(page)}

        # ── P6 herkenbare plekken (vóór het eerste kaartbezoek: daarna krijgt elke pin een plek, migratie 2B) ──
        go_sightings(page)
        cards = {sid: page.locator(f'.sight-card[data-id="{sid}"] .sight-card__place').evaluate('e => [e.className, e.innerText]')
                 for sid in ('s01', 's02', 's04', 's03')}
        details = {}
        for sid in ('s01', 's02', 's04', 's03'):
            open_card(page, sid)
            details[sid] = summary_where(page)
            close_detail(page)
        check('P6', 'plekken herkenbaar: benoemd, automatisch, alleen GPS, alleen plaatsnaam (kaartje en detail)',
              'named' in cards['s01'][0] and 'auto' in cards['s02'][0] and cards['s04'][1].strip() == 'Alleen GPS' and 'text' in cards['s03'][0]
              and details['s01'] == 'Waar Amstelpark' and 'automatische naam' in details['s02'] and 'Geef een naam' in details['s02']
              and 'Alleen GPS-coördinaten' in details['s04'] and 'zonder pin' in details['s03']
              and 'Geef een naam' not in details['s01'] + details['s04'] + details['s03'], details)

        # ── P1 Home ──────────────────────────────────────────────────
        page.evaluate("async () => { const app = await import('/src/app.js'); app.navigate('home', { force: true }); }")
        link = page.locator('#allSightingsBtn')
        link.wait_for(timeout=8000)
        link_text = link.inner_text().strip()
        link.click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        check('P1', "Home: 'Alle waarnemingen' zichtbaar en opent de lijst", link_text == 'Alle waarnemingen', link_text)

        # ── P5 geen zesde tab ────────────────────────────────────────
        tabs = page.locator('#app-nav .nav-item').evaluate_all('els => els.map(e => e.dataset.route)')
        check('P5', 'geen zesde navigatietab (4 tabs + centrale +)', tabs == ['home', 'species', 'map', 'profile'], tabs)

        # ── P2 kaart ─────────────────────────────────────────────────
        page.locator('.nav-item[data-route="map"]').click()
        btn = page.locator('#explorerSightingsBtn')
        btn.wait_for(timeout=10000)
        box = btn.bounding_box()
        label = btn.inner_text().strip()
        btn.click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        check('P2', 'kaart: lijstknop met tekst, ≥ 44 px, opent de lijst', label == 'Lijst' and round(box['height']) >= 44 and round(box['width']) >= 44,
              (label, round(box['width']), round(box['height'])))

        # ── P4 profiel ───────────────────────────────────────────────
        page.locator('.nav-item[data-route="profile"]').click()
        page.locator('#profileOpenSightings').click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        check('P4', 'profiel: ingang bovenaan opent de lijst', page.locator('#screen-sightings').count() == 1)

        # ── P3 soortkaart ────────────────────────────────────────────
        page.evaluate("""async () => { sessionStorage.setItem('birdspot-open-species', 'sp045');
          const app = await import('/src/app.js'); app.navigate('species', { force: true }); }""")
        page.locator('#sdTab-mijn').click(timeout=15000)
        all_btn = page.locator('#sdAllSightings')
        all_btn.wait_for(timeout=8000)
        btn_text = all_btn.inner_text()
        all_btn.click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        page.wait_for_timeout(300)
        merel = sorted(shown_ids(page))
        chip = page.locator('#sightingsChips').inner_text()
        page.locator('#sightingsChips [data-chip^="species"]').click()
        page.wait_for_timeout(300)
        check('P3', "soortkaart: 'Bekijk in Mijn waarnemingen (3)' opent lijst met soortfilter; wissen toont alles",
              btn_text == 'Bekijk in Mijn waarnemingen (3)' and merel == ['s01', 's04', 's06'] and 'Soort: Merel' in chip
              and len(shown_ids(page)) == 9 and not errors, (btn_text, merel))

        # ── P7 automatische plek benoemen ────────────────────────────
        sightings_before = json.dumps(rows(page), sort_keys=True)
        open_card(page, 's02')
        page.locator('#detailPlaceRename').click()
        page.locator('#detailPlaceForm button[type="submit"]').click()
        empty_refused = place(page, 'pl_auto')['name'] == 'Plek 2' and page.locator('#detailPlaceForm').is_visible()
        page.locator('#detailPlaceCancel').click()
        cancelled = page.locator('#detailPlaceForm').is_hidden() and place(page, 'pl_auto')['name'] == 'Plek 2'
        page.locator('#detailPlaceRename').click()
        page.locator('#detailPlaceInput').fill('Vijverrand')
        page.locator('#detailPlaceForm button[type="submit"]').click()
        page.wait_for_function("() => document.querySelector('#detailSightingSheet .detail-summary__row--where dd').textContent.trim() === 'Vijverrand'", timeout=8000)
        close_detail(page)
        renamed = place(page, 'pl_auto')
        others_same = all(place(page, pid) == places_before[pid] for pid in ('pl_named', 'pl_auto_new'))
        card_text = page.locator('.sight-card[data-id="s02"]').inner_text()
        check('P7', 'automatische plek benoemen: leeg geweigerd, annuleren, bewaren; alleen naam en herkomst van die plek gewijzigd',
              empty_refused and cancelled and renamed['name'] == 'Vijverrand' and renamed['nameOrigin'] == 'user'
              and (renamed['lat'], renamed['lon']) == (places_before['pl_auto']['lat'], places_before['pl_auto']['lon'])
              and others_same and json.dumps(rows(page), sort_keys=True) == sightings_before and 'Vijverrand' in card_text and not errors,
              renamed)

        # ── P8 hergebruiken en terugvinden ───────────────────────────
        page.evaluate("window.__gpsPos = [52.10012, 5.10011]")    # vlak bij 'Plek 3' (automatisch)
        open_form(page)
        page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('Bekende plek')", timeout=8000)
        hint = page.locator('#coordsHint').inner_text()
        save_form(page)
        new = rows(page)[-1]
        go_sightings(page)
        page.locator('#sightingsSearch').fill('vijverrand')
        page.wait_for_timeout(350)
        found = sorted(shown_ids(page))
        page.locator('#sightingsSearch').fill('')
        check('P8', 'hergebruik: bekende automatische plek herkenbaar en gekoppeld; zoeken vindt de nieuwe plaatsnaam',
              'Bekende plek: Plek 3 (automatische naam)' in hint and new['placeId'] == 'pl_auto_new' and found == ['s02'], hint)

        # ── P9 nieuwe plekken ────────────────────────────────────────
        page.evaluate("window.__gpsPos = [51.70, 4.60]")
        open_form(page)
        page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('Nieuwe plek')", timeout=8000)
        hint_auto = page.locator('#coordsHint').inner_text()
        save_form(page)
        auto_place = place(page, rows(page)[-1]['placeId'])
        page.evaluate("window.__gpsPos = [51.40, 4.30]")
        open_form(page)
        page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('Nieuwe plek')", timeout=8000)
        page.locator('#sightLocation').fill('Duinpan')
        save_form(page)
        user_place = place(page, rows(page)[-1]['placeId'])
        check('P9', "nieuwe plekken: zonder plaatsnaam 'auto' (vooraf gemeld), met plaatsnaam 'user'",
              'krijgt een automatische naam' in hint_auto and auto_place['name'].startswith('Plek ') and auto_place['nameOrigin'] == 'auto'
              and user_place['name'] == 'Duinpan' and user_place['nameOrigin'] == 'user', (auto_place, user_place))

        # ── P12 bestaande plekgegevens niet stil aangepast ───────────
        legacy_named = place(page, 'pl_named')
        check('P12', 'bestaande plekken niet stil aangepast: oude plek zonder nameOrigin blijft zo, ook na bekijken en hergebruik',
              legacy_named == places_before['pl_named'] and 'nameOrigin' not in legacy_named
              and place(page, 'pl_auto_new') == places_before['pl_auto_new'], legacy_named)

        # ── P10 offline benoemen ─────────────────────────────────────
        go_sightings(page)
        ctx.set_offline(True)
        sid = rows(page)[-2]['id']   # waarneming op de nieuwe automatische plek
        open_card(page, sid)
        page.locator('#detailPlaceRename').click()
        page.locator('#detailPlaceInput').fill('Zandpad')
        page.locator('#detailPlaceForm button[type="submit"]').click()
        page.wait_for_function("() => document.querySelector('#detailSightingSheet .detail-summary__row--where dd').textContent.trim() === 'Zandpad'", timeout=8000)
        close_detail(page)
        check('P10', 'offline benoemen', place(page, auto_place['id'])['name'] == 'Zandpad' and not errors)
        ctx.set_offline(False)
        ctx.close()

        # ── P11 zonder GPS-toestemming ───────────────────────────────
        ctx, page, errors = context(granted=False)
        n_places = len(stored_places(page))
        open_form(page)
        page.wait_for_timeout(800)
        hint = page.locator('#coordsHint').inner_text()
        page.locator('#sightLocation').fill('Balkon')
        save_form(page)
        rec = rows(page)[-1]
        go_sightings(page)
        open_card(page, rec['id'])
        where = summary_where(page)
        close_detail(page)
        check('P11', "zonder GPS: alleen plaatsnaam, geen plek gemaakt, detail 'zonder pin'",
              'Nog geen pin' in hint and rec['placeId'] is None and rec['lat'] is None and len(stored_places(page)) == n_places
              and 'Balkon' in where and 'zonder pin' in where and not errors, where)

        # kaartbalk op 320 px (P2 vervolg)
        ctx.close()
        ctx, page, errors = context(width=320)
        page.locator('.nav-item[data-route="map"]').click()
        page.locator('#explorerSightingsBtn').wait_for(timeout=10000)
        page.wait_for_timeout(500)
        page.screenshot(path='/tmp/ux02c_map_320.png')
        bar = page.evaluate("""() => { const t = document.querySelector('.map-topbar'); const b = document.querySelector('#explorerSightingsBtn').getBoundingClientRect();
          return { overflow: t.scrollWidth > t.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth, right: b.right, w: innerWidth }; }""")
        RESULTS[[c for c, _ in RESULTS].index('P2')] = ('P2', RESULTS[[c for c, _ in RESULTS].index('P2')][1] and not bar['overflow'] and bar['right'] <= bar['w'])
        print(f"P2 vervolg 320 px kaartbalk {'PASS' if not bar['overflow'] and bar['right'] <= bar['w'] else 'FAIL'} — {bar}")
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-02C: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 12 else 0)


if __name__ == '__main__':
    main()
