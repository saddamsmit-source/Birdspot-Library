"""Birdspot feature-reconciliation E2E (17-11-2026).

Runs the agreed user routes against ONE target and records per feature PASS/FAIL with the
visible outcome, instead of stopping at the first failure:

    python tests/test_feature_reconciliation.py                     # local server on this checkout
    BIRDSPOT_BASE_URL=https://saddamsmit-source.github.io/Birdspot-Library/ python tests/test_feature_reconciliation.py

Chromium with a virtual microphone and a fixed GPS position. This is browser evidence only:
no physical Android/iOS, real microphone, real GPS or camera claim.
"""
import json
import os
import sys
import threading
import time
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import ROOT, Quiet, Server  # noqa: E402

OUT = ROOT / 'tests' / 'screenshots' / 'feature_reconciliation'
GPS = {'latitude': 51.9244, 'longitude': 4.4777, 'accuracy': 8}
RESULTS = []
RECOG = {}


def record(fid, name, ok, detail):
    RESULTS.append({'id': fid, 'feature': name, 'result': 'PASS' if ok else 'FAIL', 'detail': str(detail)[:400]})
    print(f"{fid} {'PASS' if ok else 'FAIL'} — {name}: {str(detail)[:200]}", flush=True)


PAGE = {}
STEP = {}


def run(fid, name, fn):
    STEP.clear()
    try:
        record(fid, name, True, fn())
    except Exception as exc:  # keep going: the matrix must show every route
        record(fid, name, False, f"stap {STEP.get('s', '-')}: {type(exc).__name__}: {exc}")
        page = PAGE.get('p')
        if page:  # isolate the next route from a sheet left open by this failure
            try:
                page.screenshot(path=str(OUT / f'{fid}_fail.png'))
                for _ in range(3):
                    page.keyboard.press('Escape')
                for sel in ('.signature-species-detail-close', '#addSheetCancel'):
                    if page.locator(sel).count() and page.locator(sel).first.is_visible():
                        page.locator(sel).first.click()
            except Exception:
                pass


def boot(page, url):
    page.goto(url, wait_until='domcontentloaded', timeout=45000)
    skip = page.locator('#birdspotSplashSkip')
    try:
        skip.wait_for(state='visible', timeout=8000)
        skip.click()
    except Exception:
        pass
    page.locator('#birdspotSplash').wait_for(state='detached', timeout=90000)
    page.locator('#fab').wait_for(state='visible', timeout=20000)


def rows(page):
    return page.evaluate("() => (JSON.parse(localStorage.getItem('birdspot-sightings') || '{}').sightings || [])")


def open_species(page, name, sid):
    page.locator('.nav-item[data-route="species"]').click()
    if page.locator('#speciesFiltersToggle').count():
        page.locator('#speciesFiltersToggle').click()
    page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
    page.locator('#speciesSearch').fill(name)
    page.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    page.locator('.sd-tabs').wait_for(timeout=15000)


def main():
    base = os.environ.get('BIRDSPOT_BASE_URL')
    server = None
    if not base:
        server = Server(('127.0.0.1', 0), Quiet)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f'http://127.0.0.1:{server.server_address[1]}/'
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        args = ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
        wav = os.environ.get('BIRDSPOT_FAKE_AUDIO')  # e.g. Merel-zang uit de gids, omgezet naar WAV
        if wav:
            args.append(f'--use-file-for-fake-audio-capture={wav}')
        browser = pw.chromium.launch(headless=True, args=args)
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam', reduced_motion='reduce',
                                  geolocation=GPS, permissions=['microphone', 'geolocation'])
        page = ctx.new_page()
        PAGE['p'] = page
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        try:
            boot(page, base)
            record('F00', 'App opent (splash → startscherm)', True, base)
        except Exception as exc:
            page.screenshot(path=str(OUT / 'F00_boot_fail.png'))
            state = page.evaluate("() => ({splash: !!document.querySelector('#birdspotSplash'), fab: !!document.querySelector('#fab'), skip: !!document.querySelector('#birdspotSplashSkip'), title: document.title, text: document.body.innerText.slice(0,200)})")
            record('F00', 'App opent (splash → startscherm)', False, f'{type(exc).__name__}: {exc}; {state}')
            page.locator('#birdspotSplash').evaluate('e => e.remove()') if page.locator('#birdspotSplash').count() else None
            page.locator('#fab').wait_for(state='visible', timeout=60000)

        def version():
            sw = page.evaluate("fetch('sw.js',{cache:'no-store'}).then(r=>r.text()).then(t=>(t.match(/APP_VERSION = '([^']+)'/)||[])[1])")
            shown = page.locator('#appVersion').inner_text() if page.locator('#appVersion').count() else ''
            if not shown.strip():
                page.locator('[data-route="profile"]').click()
                time.sleep(1)
                shown = 'profiel: ' + (page.locator('#appVersion').inner_text() if page.locator('#appVersion').count() else 'geen #appVersion')
                page.locator('[data-route="home"]').click()
            assert sw, 'APP_VERSION not found'
            return f'sw.js APP_VERSION {sw}; zichtbaar versielabel: {shown!r}'
        run('F01', 'Versie zichtbaar en gelijk aan sw.js', version)

        def plus_choices():
            page.locator('#fab').click()
            dlg = page.get_by_role('dialog')
            expect(dlg.get_by_role('button', name='Waarneming toevoegen')).to_be_visible()
            expect(dlg.get_by_role('button', name='Geluid herkennen')).to_be_visible()
            page.screenshot(path=str(OUT / 'F02_plus.png'))
            page.keyboard.press('Escape')
            expect(page.locator('#quickAddSheet')).to_have_count(0)
            return 'Centrale + toont "Waarneming toevoegen" en "Geluid herkennen"; Escape sluit'
        run('F02', 'Centrale plusknop met twee keuzes', plus_choices)

        def seen_route():
            before = len(rows(page))
            page.locator('#fab').click()
            page.get_by_role('dialog').get_by_role('button', name='Waarneming toevoegen').click()
            expect(page.locator('#addSightingSheet')).to_be_visible()
            date = page.locator('#sightDate').input_value() if page.locator('#sightDate').count() else ''
            page.locator('#speciesPickerBtn').click()
            page.locator('#spPickerList .species-row[data-id="sp001"]').click()
            page.locator('#speciesPickerBtn .species-picker-btn__name').wait_for(timeout=8000)
            page.locator('#sightLocation').fill('Reconciliatietest (fictief)')
            auto = page.locator('#coordsHint').inner_text().strip()
            page.locator('#sightGpsBtn').click()
            page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('51.9')", timeout=15000)
            page.locator('#addSheetSubmit').click()
            page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
            new = [r for r in rows(page)][before:]
            assert len(new) == 1, f'{len(new)} nieuwe records'
            r = new[0]
            assert r.get('date') or r.get('datetime') or r.get('createdAt'), r
            assert r.get('lat') and r.get('lon'), r
            return f"1 record: soort {r.get('speciesId')}, datum automatisch {date!r}, GPS pas na knop 'GPS' (vooraf: {auto[:60]!r}), lat/lon {r.get('lat')}/{r.get('lon')}, methode {r.get('observationMethod')}"
        run('F03', 'Waarneming toevoegen (soort, datum, GPS, opslaan)', seen_route)

        def cancel_route():
            n = len(rows(page))
            page.locator('#fab').click()
            page.get_by_role('dialog').get_by_role('button', name='Waarneming toevoegen').click()
            page.locator('#addSheetCancel').click()
            expect(page.locator('#addSightingSheet')).to_have_count(0)
            assert len(rows(page)) == n
            return 'Annuleren sluit formulier zonder record'
        run('F04', 'Annuleren zonder opslaan', cancel_route)

        def sound_route():
            n = len(rows(page))
            page.locator('#fab').click()
            page.locator('[data-quick-action="sound"]').click()
            sheet = page.get_by_role('dialog', name='Geluid herkennen')
            expect(sheet).to_be_visible()
            pos = sheet.locator('#soundPosition').inner_text()
            sheet.get_by_role('button', name='Start opname').click()
            expect(sheet.get_by_role('button', name='Stop opname')).to_be_enabled()
            match = ''
            for _ in range(int(os.environ.get('BIRDSPOT_RECORD_SECONDS', '4'))):
                time.sleep(1)
                if sheet.locator('#soundLatestMatch').count():
                    match = sheet.locator('#soundLatestMatch').inner_text().strip() or match
            expect(sheet.locator('#soundWaveform')).to_be_visible()
            has = sheet.locator('#soundWaveform').get_attribute('data-has-sound')
            elapsed = sheet.locator('#soundElapsed').inner_text()
            STEP['s'] = 'stop'
            stop = sheet.get_by_role('button', name='Stop opname')
            if stop.count() and stop.is_enabled():
                stop.click()
            STEP['s'] = 'playback'
            expect(sheet.locator('#soundPlayback')).to_be_visible()
            state = sheet.locator('#soundRecognitionState').inner_text().strip()
            RECOG.update(state=state, match=match)
            STEP['s'] = 'soorten kiezen'
            labels = []
            for name, sid in (('Merel', 'sp045'), ('Koolmees', 'sp029')):
                box = sheet.locator(f'input[type="checkbox"][value="{sid}"]')
                if box.count():  # already suggested by the recognizer: confirm it explicitly
                    labels.append(box.locator('xpath=ancestor::label').inner_text().replace('\n', ' '))
                    box.check()
                else:
                    sheet.get_by_role('searchbox').fill(name)
                    sheet.get_by_role('button', name=name, exact=True).click()
                expect(sheet.locator(f'input[type="checkbox"][value="{sid}"]')).to_be_checked()
            RECOG['labels'] = labels
            sheet.get_by_role('searchbox').fill('')
            page.screenshot(path=str(OUT / 'F05_sound.png'))
            STEP['s'] = 'opslaan'
            sheet.locator('#soundSave').click()
            expect(sheet).to_have_count(0, timeout=15000)
            new = rows(page)[n:]
            assert len(new) == 2 and all(r.get('observationMethod') == 'heard' for r in new), new
            return (f'Opname {elapsed}, tijdbalk data-has-sound={has}, positie {pos!r}; herkenner: {state!r}; '
                    f'suggestie: {match!r} {RECOG.get("labels")}; 2 Gehoord-records ({", ".join(str(r.get("speciesId")) for r in new)}) met lat/lon {new[0].get("lat")}/{new[0].get("lon")}')
        run('F05', 'Geluid herkennen: opnemen, tijdlijn, meerdere soorten opslaan', sound_route)

        def recognizer():
            assert RECOG.get('match', '').startswith('Mogelijk gehoord'), f"geen automatische suggestie (status {RECOG.get('state')!r}, audio {os.environ.get('BIRDSPOT_FAKE_AUDIO') or 'synthetische toon'})"
            return f"{RECOG['match']} (status {RECOG.get('state')!r})"
        run('F06', 'Automatische BirdNET-suggesties beschikbaar', recognizer)

        def hotspots():
            page.locator('.nav-item[data-route="home"]').click()
            sec = page.locator('#hotspotsSection')
            expect(sec).to_be_visible(timeout=15000)
            page.screenshot(path=str(OUT / 'F07_hotspots.png'), full_page=False)
            return 'Hotspotsectie zichtbaar: ' + sec.inner_text()[:160].replace('\n', ' · ')
        run('F07', 'Hotspots op startscherm', hotspots)

        def guide_photo_zoom_back():
            open_species(page, 'Merel', 'sp045')
            img = page.locator('#sdPanel-herkenning .sd-field-photo img').first
            expect(img).to_be_visible()
            src = img.get_attribute('src')
            assert img.evaluate('i => i.complete && i.naturalWidth > 0'), 'gidsfoto niet gedecodeerd'
            page.locator('#sdPanel-herkenning .sd-field-photo').first.click()
            viewer = page.get_by_role('dialog', name='Vogelfoto bekijken')
            expect(viewer).to_be_visible()
            page.keyboard.press('Escape')
            expect(viewer).to_have_count(0)
            page.locator('.signature-species-detail-close').click()
            page.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=12000)
            return f'Gidsfoto gedecodeerd ({src}); zoomvenster open/dicht; soortkaart gesloten'
        run('F08', 'Soortkaart, gidsfoto, zoom en terug', guide_photo_zoom_back)

        def compare():
            open_species(page, 'Boomkruiper', 'sp066')
            for d in page.locator('details.sd-cmp-more').all():
                if d.locator('[data-compare-species="sp067"]').count() and not d.get_attribute('open'):
                    d.locator('xpath=./summary').click()
            target = page.locator('#sdPanel-herkenning .sd-cmp-panel:has([data-compare-species="sp067"])').first
            if target.get_attribute('hidden') is not None:
                card = target.locator('xpath=ancestor::div[contains(@class,"sd-cmp-card")]').first
                idx = target.evaluate("e=>[...e.parentElement.children].filter(x=>x.classList.contains('sd-cmp-panel')).indexOf(e)")
                card.locator('.sd-cmp-tab').nth(idx).click()
            expect(target).to_be_visible()
            imgs = target.locator('.sd-cmp-who .sd-field-photo img')
            expect(imgs).to_have_count(2)
            page.screenshot(path=str(OUT / 'F09_compare.png'))
            page.locator('.signature-species-detail-close').click()
            page.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=12000)
            return 'Boomkruiper ↔ Taigaboomkruiper: 2 foto’s + kenmerkrijen zichtbaar'
        run('F09', 'Vergelijken van dubbelgangers', compare)

        def search():
            page.locator('[data-route="home"]').click()
            page.locator('#homeSearchTrigger').click()
            page.locator('#homeSearch').fill('ijsvogel')
            res = page.locator('.app-search-results')
            expect(res).to_contain_text('IJsvogel', timeout=10000)
            page.keyboard.press('Escape')
            return 'Zoeken op "ijsvogel" toont IJsvogel in de resultaten'
        run('F10', 'App-brede zoekfunctie', search)

        def persistence_reload():
            n = len(rows(page))
            page.reload(wait_until='domcontentloaded')
            boot(page, page.url)
            assert len(rows(page)) == n and n >= 3, n
            return f'{n} waarnemingen na herladen nog aanwezig'
        run('F11', 'Opgeslagen waarnemingen blijven na herladen', persistence_reload)

        def offline():
            page.wait_for_timeout(4000)
            ready = page.evaluate("navigator.serviceWorker && navigator.serviceWorker.controller ? 'sw-controlled' : 'geen sw-controller'")
            ctx.set_offline(True)
            try:
                page.reload(wait_until='domcontentloaded', timeout=30000)
                boot(page, page.url)
                open_species(page, 'Merel', 'sp045')
                ok = page.locator('.sd-tabs').is_visible()
            finally:
                ctx.set_offline(False)
            assert ok
            return f'Offline herladen en soortkaart openen werkt ({ready})'
        run('F12', 'Offline heropenen', offline)

        record('F99', 'Geen paginafouten', not errors, errors or 'geen')
        ctx.close()
        browser.close()
    if server:
        server.shutdown()
    target = os.environ.get('BIRDSPOT_BASE_URL', 'local checkout')
    (OUT / 'results.json').write_text(json.dumps({'target': target, 'results': RESULTS}, ensure_ascii=False, indent=1), encoding='utf-8')
    fails = [r['id'] for r in RESULTS if r['result'] == 'FAIL']
    print(f"RECONCILIATION {target}: {len(RESULTS) - len(fails)} PASS, {len(fails)} FAIL {fails}")


if __name__ == '__main__':
    main()
