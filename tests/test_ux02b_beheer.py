#!/usr/bin/env python3
"""UX-02B (25-11-2026): waarnemingen bekijken en beheren zonder zoekcontext of gegevens te verliezen.

W1  kaartje: soort, datum, plek, methode, zekerheid/suggestie, media; neutraal vogelicoon zonder foto; echte foto als thumbnail
W2  detail: wat, wanneer, waar, hoe zeker, welk bewijs; sluitknop ≥ 44×44; Bewerken zichtbaar
W3  zoeken → openen → bewerken → opslaan → terug: zoekopdracht, filters en scrollpositie blijven; kaartje bijgewerkt
W4  bewerken behoudt foto, geluid, pin, plek, verificatie en BirdNET-suggestiedata
W5  annuleren bewerken: niets gewijzigd, zoekcontext blijft
W6  verwijderen: Annuleer houdt alles; bevestigen verwijdert; zoekcontext en scrollpositie blijven
W7  offline: openen, bewerken en opslaan
W8  opslagfout bij bewerken: melding, invoer blijft, record ongewijzigd; daarna verwerpen → lijst intact
W9  weg naar Home en browser-terug: zoekopdracht, filters en scrollpositie terug
W10 browser-terug met detail open sluit alleen het detail
W11 320/430: lange soortnaam in detailkop zonder overloop, sluitknop ≥ 44 px
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, shown_ids, boot, rows, SIGHTINGS, PLACES  # noqa: E402
from test_pilot_offline_new_sighting import IMAGE  # noqa: E402
import test_r3_audio as r3  # noqa: E402

RESULTS = []
KEEP = ('photoIds', 'audioIds', 'lat', 'lon', 'placeId', 'pinAccuracyM', 'identificationSource', 'birdnetVerification',
        'merlinVerification', 'certainty', 'observationMethod', 'soundSuggestion', 'speciesId', 'date', 'count')
FILLER = [{**SIGHTINGS[1], 'id': f'f{i:02d}', 'date': f'2026-0{1 + i % 5}-{10 + i % 18}', 'placeId': None, 'lat': None, 'lon': None,
           'audioIds': [], 'locationName': f'Vulplek {i}', 'speciesId': 'sp043', 'speciesName': 'Huismus',
           'observationMethod': ['seen', 'heard'][i % 2]} for i in range(36)]


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def by_id(page, sid):
    return next((r for r in rows(page) if r['id'] == sid), None)


def state(page):
    return page.evaluate("""() => ({ query: document.querySelector('#sightingsSearch')?.value,
      pressed: [...document.querySelectorAll('.sightings-filter-option[aria-pressed="true"]')].map(b => b.dataset.value).sort(),
      scroll: Math.round(document.getElementById('main-view').scrollTop),
      result: document.querySelector('#sightingsResult')?.textContent })""")


def scroll_to(page, sid):
    page.evaluate("""sid => { const main = document.getElementById('main-view'); const card = document.querySelector(`.sight-card[data-id="${sid}"]`);
      main.scrollTo({ top: card.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop - 200, behavior: 'instant' }); }""", sid)
    page.wait_for_timeout(300)
    return page.evaluate("() => Math.round(document.getElementById('main-view').scrollTop)")


def open_card(page, sid):
    page.locator(f'.sight-card[data-id="{sid}"]').click()
    page.locator('#detailSightingSheet.open').wait_for(timeout=10000)


def close_detail(page):
    page.locator('#detailClose').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)


def edit(page):
    page.locator('#detailEdit').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=10000)
    page.wait_for_timeout(400)


def notes(page, text):
    if page.locator('#sightNotes').is_hidden():
        page.locator('#sightingMore summary').click()
    page.locator('#sightNotes').fill(text)


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(width=390):
            ctx = browser.new_context(viewport={'width': width, 'height': 760}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            seed(page, base, SIGHTINGS + FILLER, PLACES)
            return ctx, page, errors

        ctx, page, errors = context()
        # echte waarneming met foto en geluid via het formulier
        page.locator('#fab').click()
        page.locator('[data-quick-action="seen"]').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=9000)
        page.locator('#speciesPickerBtn').click()
        page.locator('#spPickerSearch').fill('tjiftjaf')
        page.locator('#spPickerList .species-row[data-id="sp056"]').click()
        page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
        page.locator('#sightingMediaInput').set_input_files({'name': 'w.png', 'mimeType': 'image/png', 'buffer': IMAGE})
        page.wait_for_function("() => document.querySelectorAll('#addSightingSheet .media-thumb').length === 1 && !document.querySelector('#addSheetSubmit').disabled", timeout=15000)
        r3.add_audio(page, [{'name': 'zang.wav', 'mimeType': 'audio/wav', 'buffer': r3.make_wav()}], 1)
        page.locator('#sightLocation').fill('Bosrand')
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        media_rec = next(r for r in rows(page) if r['speciesId'] == 'sp056')
        go_sightings(page)

        # ── W1 kaartje ───────────────────────────────────────────────
        card = page.locator(f'.sight-card[data-id="{media_rec["id"]}"]')
        page.wait_for_function("""id => [...document.querySelectorAll(`.sight-card[data-id="${id}"] img`)].some(i => i.complete && i.naturalWidth > 0)""",
                               arg=media_rec['id'], timeout=10000)
        info = page.evaluate("""() => { const c = id => document.querySelector(`.sight-card[data-id="${id}"]`);
          return { merel: c('s01').innerText, koolmees: c('s02').innerText, merelPlaceholder: !!c('s01').querySelector('.sight-card__placeholder svg'),
            emoji: /[\\u{1F300}-\\u{1FAFF}]/u.test(document.querySelector('#sightingCards').innerText),
            boom: c('s08').innerText, gps: c('s04').innerText }; }""")
        media_text = card.inner_text()
        check('W1', 'kaartje: soort, datum, plek, methode, zekerheid/suggestie, media; neutraal icoon; echte thumbnail',
              all(x in info['merel'] for x in ('Merel', 'Amstelpark', 'Gezien', 'Zeker', '2')) and 'Plek 2' in info['koolmees']
              and 'Waarschijnlijk' in info['koolmees'] and 'Gehoord' in info['koolmees'] and info['merelPlaceholder'] and not info['emoji']
              and 'BirdNET · suggestie' in info['boom'] and 'Zeker' not in info['boom'] and 'Alleen GPS' in info['gps']
              and 'Tjiftjaf' in media_text and 'Bosrand' in media_text, info)

        # ── W2 detail ────────────────────────────────────────────────
        open_card(page, media_rec['id'])
        summary = page.locator('#detailSightingSheet .detail-summary').inner_text()
        close_box = page.locator('#detailClose').bounding_box()
        edit_box = page.locator('#detailEdit').bounding_box()
        close_detail(page)
        open_card(page, 's08')
        summary_boom = page.locator('#detailSightingSheet .detail-summary').inner_text()
        close_detail(page)
        check('W2', 'detail: wanneer, waar, hoe zeker, bewijs; sluitknop ≥ 44×44, Bewerken zichtbaar',
              'Bosrand' in summary and '1 foto of video' in summary and '1 geluidsopname' in summary and 'Zeker' in summary
              and 'BirdNET · suggestie' in summary_boom and 'Zeker' not in summary_boom and 'Plek 3' in summary_boom and 'automatische naam' in summary_boom
              and round(close_box['width']) >= 44 and round(close_box['height']) >= 44 and round(edit_box['height']) >= 44,
              {'close': (close_box['width'], close_box['height']), 'boom': summary_boom.replace('\n', ' | ')})

        # ── W3 zoeken → openen → bewerken → opslaan → terug ─────────
        page.locator('#sightingsFilterBtn').click()
        page.locator('.sightings-filter-option[data-value="heard"]').click()
        page.locator('#sightingsFilterBtn').click()
        page.locator('#sightingsSearch').fill('huismus')
        page.wait_for_timeout(350)
        target = shown_ids(page)[10]
        before_scroll = scroll_to(page, target)
        before = state(page)
        open_card(page, target)
        edit(page)
        notes(page, 'Bewerkt via zoeken')
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.wait_for_timeout(500)
        after = state(page)
        focused = page.evaluate("() => document.activeElement?.dataset?.id")
        check('W3', 'zoeken → openen → bewerken → opslaan → terug: zoekopdracht, filters, scroll en focus blijven',
              before['query'] == after['query'] == 'huismus' and before['pressed'] == after['pressed'] == ['heard']
              and before_scroll > 150 and abs(after['scroll'] - before_scroll) <= 4 and focused == target
              and by_id(page, target)['notes'] == 'Bewerkt via zoeken' and before['result'] == after['result'] and not errors,
              {'voor': before, 'na': after, 'focus': focused})

        # ── W4 bewerken behoudt media, pin, plek en verificatie ──────
        page.locator('#sightingsClearAll').first.click()
        page.wait_for_timeout(300)
        snap = {sid: {k: by_id(page, sid).get(k) for k in KEEP} for sid in (media_rec['id'], 's05')}
        for sid in (media_rec['id'], 's05'):
            open_card(page, sid)
            edit(page)
            notes(page, f'Notitie {sid}')
            page.locator('#addSheetSubmit').click()
            page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
            page.wait_for_timeout(300)
        kept = {sid: {k: by_id(page, sid).get(k) for k in KEEP} for sid in snap}
        media_ok = page.evaluate("""async ids => { const db = await import('/src/data/db.js');
          return (await Promise.all(ids.map(id => db.getPhoto(id)))).every(p => p && p.blob && p.blob.size > 0); }""",
                                 kept[media_rec['id']]['photoIds'] + kept[media_rec['id']]['audioIds'])
        check('W4', 'bewerken behoudt foto, geluid, pin, plek, verificatie en BirdNET-suggestiedata',
              kept == snap and media_ok and len(kept[media_rec['id']]['photoIds']) == 1 and len(kept[media_rec['id']]['audioIds']) == 1,
              [k for sid in snap for k in KEEP if snap[sid][k] != kept[sid][k]])

        # ── W5 annuleren bewerken ────────────────────────────────────
        page.locator('#sightingsSearch').fill('merel')
        page.wait_for_timeout(350)
        before = state(page)
        orig = by_id(page, 's01')
        open_card(page, 's01')
        edit(page)
        page.locator('#sightLocation').fill('Iets anders')
        page.locator('#addSheetCancel').click()
        page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        check('W5', 'annuleren bewerken: record identiek, zoekcontext blijft',
              by_id(page, 's01') == orig and state(page)['query'] == before['query'] and state(page)['result'] == before['result'])

        # ── W6 verwijderen met bevestiging ───────────────────────────
        page.locator('#sightingsSearch').fill('')
        page.wait_for_timeout(350)
        target = shown_ids(page)[14]
        scroll = scroll_to(page, target)
        n = len(rows(page))
        open_card(page, target)
        page.locator('#detailDelete').click()
        page.locator('.confirm-overlay .confirm-cancel').click()
        still = by_id(page, target) is not None and page.locator('#detailSightingSheet.open').count() == 1
        page.locator('#detailDelete').click()
        page.locator('.confirm-overlay .confirm-ok').click()
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        page.wait_for_timeout(400)
        after = state(page)
        check('W6', 'verwijderen: Annuleer houdt alles, bevestigen verwijdert; lijst en scroll blijven',
              still and by_id(page, target) is None and len(rows(page)) == n - 1 and target not in shown_ids(page)
              and abs(after['scroll'] - scroll) <= 4 and after['result'] == f'{n - 1} waarnemingen', after)

        # ── W8 opslagfout bij bewerken ───────────────────────────────
        orig = by_id(page, 's02')
        open_card(page, 's02')
        edit(page)
        page.locator('#sightLocation').fill('Foutplek')
        page.evaluate("""() => { window.__origSet = Storage.prototype.setItem;
          Storage.prototype.setItem = function (k, v) { if (k === 'birdspot-sightings') throw new DOMException('vol', 'QuotaExceededError');
            return window.__origSet.call(this, k, v); }; }""")
        page.locator('#addSheetSubmit').click()
        page.wait_for_function("() => !document.querySelector('#addSheetSubmit').disabled", timeout=8000)
        toast = page.locator('.toast:not(.app-update)').inner_text()
        open_after_error = page.locator('#addSightingSheet.open').count() == 1 and page.locator('#sightLocation').input_value() == 'Foutplek'
        page.evaluate("() => { Storage.prototype.setItem = window.__origSet; }")
        page.locator('#addSheetCancel').click()
        page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        check('W8', 'opslagfout bij bewerken: melding, invoer blijft, record ongewijzigd; verwerpen laat lijst intact',
              'mislukt' in toast and open_after_error and by_id(page, 's02') == orig and page.locator('#sightingCards .sight-card').count() == len(rows(page)),
              toast)

        # ── W9 weg en browser-terug ──────────────────────────────────
        page.locator('#sightingsFilterBtn').click() if page.locator('#sightingsFilterPanel').is_hidden() else None
        page.locator('.sightings-filter-option[data-value="seen"]').click()
        page.locator('#sightingsFilterBtn').click()
        page.locator('#sightingsSearch').fill('huismus')
        page.wait_for_timeout(350)
        scroll = scroll_to(page, shown_ids(page)[-1])
        before = state(page)
        page.locator('.nav-item[data-route="home"]').click()
        page.locator('#screen-home').wait_for(timeout=8000)
        page.go_back()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        page.wait_for_timeout(500)
        after = state(page)
        check('W9', 'naar Home en browser-terug: zoekopdracht, filters en scrollpositie terug',
              after['query'] == 'huismus' and after['pressed'] == ['seen'] and abs(after['scroll'] - scroll) <= 4 and scroll > 0
              and after['result'] == before['result'], {'voor': before, 'na': after})

        # ── W10 terug met detail open ────────────────────────────────
        sid = shown_ids(page)[0]
        open_card(page, sid)
        page.go_back()
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        check('W10', 'browser-terug met detail open sluit alleen het detail; zoekcontext blijft',
              page.locator('#screen-sightings').count() == 1 and state(page)['query'] == 'huismus' and not errors, errors[:1])
        ctx.close()

        # ── W7 offline ───────────────────────────────────────────────
        ctx, page, errors = context()
        go_sightings(page)
        ctx.set_offline(True)
        open_card(page, 's03')
        edit(page)
        notes(page, 'Offline bewerkt')
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.wait_for_timeout(300)
        rec = by_id(page, 's03')
        check('W7', 'offline: openen, bewerken en opslaan; Merlin-status ongewijzigd',
              rec['notes'] == 'Offline bewerkt' and rec['merlinVerification'] == 'suggested' and rec['certainty'] == 'possible' and not errors)
        ctx.set_offline(False)
        ctx.close()

        # ── W11 breedtes detailkop ───────────────────────────────────
        res = {}
        for width in (320, 430):
            ctx, page, errors = context(width=width)
            go_sightings(page)
            open_card(page, 's09')
            page.wait_for_timeout(400)
            page.screenshot(path=f'/tmp/ux02b_detail_{width}.png')
            res[width] = page.evaluate("""() => { const h = document.querySelector('#detailSightingSheet .sheet__header');
              const c = document.querySelector('#detailClose').getBoundingClientRect();
              return { overflow: h.scrollWidth > h.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth,
                       close: [Math.round(c.width), Math.round(c.height)], inView: c.right <= innerWidth }; }""")
            ctx.close()
        check('W11', '320/430: lange soortnaam zonder overloop in detailkop, sluitknop ≥ 44 px en in beeld',
              all(not v['overflow'] and min(v['close']) >= 44 and v['inView'] for v in res.values()), res)
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-02B: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 11 else 0)


if __name__ == '__main__':
    main()
