#!/usr/bin/env python3
"""UX-01A (25-11-2026): geen dataverlies bij sluiten van het waarnemingsformulier.

D1  tik naast het formulier met invoer → keuzedialoog; "Verder bewerken" houdt alles intact
D2  Escape met invoer → keuzedialoog; nogmaals Escape = veilige keuze (verder bewerken)
D3  browser-/Android-terug met invoer → keuzedialoog; nogmaals terug = verder bewerken
D4  herladen tijdens invullen → concept bewaard; nooit in lijst, waarnemingenopslag of export; hervatten herstelt velden
D5  leeg of ongewijzigd sluiten (ook met alleen automatische GPS) → direct dicht, geen dialoog, geen concept
D6  "Wijzigingen verwerpen" → dicht, geen concept, geen waarneming
D7  bewerken → wijzigen → annuleren/verwerpen: origineel identiek; bewerkconcept hervatbaar; verouderd concept nooit toegepast
D8  opslagfout → formulier open, invoer intact, concept bewaard; na herstel opslaan → concept weg
D9  offline: concept bewaren, hervatten en opslaan werken zonder netwerk
D10 media: dialoog en hervatten zeggen eerlijk dat nieuw gekozen foto/geluid niet in het concept zit; geen blob in concept
"""
import json
import re
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import Quiet, Server  # noqa: E402
from test_feature_reconciliation import boot, rows  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
RESULTS = []
DRAFT_KEY = 'birdspot-sighting-drafts'
from test_pilot_offline_new_sighting import IMAGE as PNG  # noqa: E402


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def drafts(page):
    return page.evaluate(f"() => JSON.parse(localStorage.getItem('{DRAFT_KEY}') || '{{}}')")


def open_new(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="seen"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)


def pick(page, sid='sp001'):
    page.locator('#speciesPickerBtn').click()
    page.locator(f'#spPickerList .species-row[data-id="{sid}"]').click()
    page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)


def fill_basic(page, place='Proefplek D'):
    pick(page)
    page.locator('#sightLocation').fill(place)
    page.wait_for_timeout(600)   # debounce concept (400 ms)


def leave_dialog(page):
    dlg = page.locator('#sightingLeaveDialog')
    dlg.wait_for(timeout=5000)
    return dlg


def go_sightings(page):
    page.evaluate("async () => { const app = await import('/src/app.js'); app.navigate('sightings', { force: true }); }")
    page.wait_for_timeout(600)


def sheet_open(page):
    return page.locator('#addSightingSheet.open').count() == 1 and not page.evaluate(
        "() => document.getElementById('addSightingSheet')?.inert")


def closed(page):
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=6000)
    return True


def main():
    server = Server(('127.0.0.1', 0), Quiet)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(gps=False):
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam')
            if gps:
                ctx.add_init_script("""(() => {
                  const q = navigator.permissions.query.bind(navigator.permissions);
                  navigator.permissions.query = d => d && d.name === 'geolocation' ? Promise.resolve({ state: 'granted' }) : q(d);
                  navigator.geolocation.getCurrentPosition = ok => setTimeout(() => ok({ coords: { latitude: 52.1, longitude: 5.1, accuracy: 8 } }), 100);
                })();""")
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            return ctx, page, errors

        # ── D1 tik naast het formulier ───────────────────────────────
        ctx, page, errors = context()
        open_new(page)
        fill_basic(page)
        page.mouse.click(195, 20)   # boven de sheet: overlay zelf
        dlg = leave_dialog(page)
        labels = dlg.locator('button').all_inner_texts()
        focus = page.evaluate("() => document.activeElement?.textContent")
        dlg.get_by_role('button', name='Verder bewerken').click()
        intact = page.locator('#sightLocation').input_value() == 'Proefplek D' and 'Stadsduif' in page.locator('#speciesPickerBtn').inner_text()
        check('D1', 'tik naast formulier: keuzedialoog, verder bewerken houdt invoer',
              labels == ['Verder bewerken', 'Concept bewaren en sluiten', 'Wijzigingen verwerpen'] and focus == 'Verder bewerken'
              and sheet_open(page) and intact and page.evaluate("() => document.getElementById('sightingLeaveDialog') === null"),
              f'knoppen={labels}, focus={focus}')

        # ── D2 Escape ────────────────────────────────────────────────
        page.locator('#sightLocation').focus()
        page.keyboard.press('Escape')
        leave_dialog(page)
        page.keyboard.press('Escape')
        page.wait_for_timeout(200)
        check('D2', 'Escape: keuzedialoog; tweede Escape = verder bewerken',
              sheet_open(page) and page.locator('#sightingLeaveDialog').count() == 0
              and page.locator('#sightLocation').input_value() == 'Proefplek D')

        # ── D3 browser-terug ─────────────────────────────────────────
        url_before = page.url
        page.go_back()
        leave_dialog(page)
        page.go_back()
        page.wait_for_timeout(300)
        check('D3', 'browser-terug: keuzedialoog; tweede terug = verder bewerken',
              sheet_open(page) and page.locator('#sightingLeaveDialog').count() == 0
              and page.locator('#sightLocation').input_value() == 'Proefplek D',
              f'url {url_before} → {page.url}')

        # ── D4 herladen ──────────────────────────────────────────────
        page.locator('#sightingMore summary').click()
        page.locator('#sightNotes').fill('Concepttekst D4')
        page.wait_for_timeout(600)
        page.reload()
        boot(page, base) if page.locator('#fab').count() == 0 else None
        page.locator('#fab').wait_for(state='visible', timeout=20000)
        stored_draft = drafts(page).get('new', {})
        in_rows = len(rows(page))
        go_sightings(page)
        list_text = page.locator('#app').inner_text()
        export = page.evaluate("async () => (await import('/src/data/sightings.js')).exportData()")
        backup_src = (ROOT / 'src/storage/backup.js').read_text(encoding='utf-8')
        backup_keys = re.search(r'const DATA_KEYS = \[([^\]]*)\]', backup_src).group(1)
        open_new(page)
        dlg = page.locator('#sightingDraftDialog')
        dlg.wait_for(timeout=5000)
        draft_text = dlg.inner_text()
        dlg.get_by_role('button', name='Concept hervatten').click()
        page.wait_for_timeout(300)
        restored = (page.locator('#sightLocation').input_value(), page.locator('#sightNotes').input_value(),
                    page.locator('#speciesPickerBtn').inner_text().strip())
        check('D4', 'herladen: concept bewaard, nergens als waarneming zichtbaar, hervatten herstelt velden',
              stored_draft.get('fields', {}).get('notes') == 'Concepttekst D4' and in_rows == 0
              and 'Concepttekst' not in list_text and 'Concepttekst' not in json.dumps(export)
              and 'DRAFT' not in backup_keys and DRAFT_KEY not in backup_src
              and 'Stadsduif' in draft_text and restored[0] == 'Proefplek D' and restored[1] == 'Concepttekst D4' and 'Stadsduif' in restored[2],
              f'rijen={in_rows}, hervat={restored}, backupsleutels={backup_keys}')

        # ── D6 verwerpen (vervolg op hervat concept) ─────────────────
        page.locator('#addSheetCancel').click()
        leave_dialog(page).get_by_role('button', name='Wijzigingen verwerpen').click()
        closed(page)
        check('D6', 'verwerpen: dicht, geen concept, geen waarneming',
              'new' not in drafts(page) and len(rows(page)) == 0 and not errors, errors or '')
        ctx.close()

        # ── D5 leeg / ongewijzigd sluiten, ook met automatische GPS ──
        ctx, page, errors = context(gps=True)
        open_new(page)
        page.locator('#addSheetCancel').click()
        empty_closed = closed(page) and page.locator('#sightingLeaveDialog').count() == 0
        open_new(page)
        page.wait_for_function("document.querySelector('#coordsHint')?.textContent.includes('52.1')", timeout=8000)
        page.locator('#sightingMore summary').click()   # alleen openklappen: geen gegevenswijziging
        page.locator('#addSheetCancel').click()
        gps_closed = closed(page) and page.locator('#sightingLeaveDialog').count() == 0
        open_new(page)
        page.mouse.click(195, 20)
        backdrop_closed = closed(page)
        check('D5', 'leeg/ongewijzigd (ook alleen auto-GPS, details open) sluit direct, geen concept',
              empty_closed and gps_closed and backdrop_closed and drafts(page) == {} and not errors, errors or '')

        # ── D9 offline ───────────────────────────────────────────────
        ctx.set_offline(True)
        open_new(page)
        fill_basic(page, 'Offline plek')
        page.locator('#addSheetCancel').click()
        leave_dialog(page).get_by_role('button', name='Concept bewaren en sluiten').click()
        closed(page)
        saved_draft = drafts(page).get('new', {}).get('fields', {}).get('locationName')
        open_new(page)
        page.locator('#sightingDraftDialog').get_by_role('button', name='Concept hervatten').click()
        page.locator('#addSheetSubmit').click()
        closed(page)
        r = rows(page)
        check('D9', 'offline: concept bewaren, hervatten en opslaan zonder netwerk',
              saved_draft == 'Offline plek' and len(r) == 1 and r[0]['locationName'] == 'Offline plek' and drafts(page) == {},
              f'record={r[0]["speciesName"] if r else None}')
        ctx.set_offline(False)
        ctx.close()

        # ── D7 bewerken: origineel intact, bewerkconcept, verouderd concept ──
        ctx, page, errors = context()
        open_new(page)
        fill_basic(page, 'Origineel')
        page.locator('#addSheetSubmit').click()
        closed(page)
        original = rows(page)[0]

        def open_edit():
            go_sightings(page)
            page.locator(f'.sight-card[data-id="{original["id"]}"]').click()
            page.locator('#detailEdit').click()

        open_edit()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#sightNotes').fill('Gewijzigd maar verworpen')
        page.locator('#addSheetCancel').click()
        leave_dialog(page).get_by_role('button', name='Wijzigingen verwerpen').click()
        closed(page)
        after_discard = rows(page)[0]
        # bewerkconcept bewaren en hervatten
        open_edit()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#sightNotes').fill('Bewerkconcept')
        page.locator('#addSheetCancel').click()
        leave_dialog(page).get_by_role('button', name='Concept bewaren en sluiten').click()
        closed(page)
        key = f"edit:{original['id']}"
        has_edit_draft = drafts(page).get(key, {}).get('fields', {}).get('notes') == 'Bewerkconcept'
        untouched = rows(page)[0] == original
        open_edit()
        page.locator('#sightingDraftDialog').get_by_role('button', name='Concept hervatten').click()
        resumed_notes = page.locator('#sightNotes').input_value()
        page.locator('#addSheetCancel').click()
        leave_dialog(page).get_by_role('button', name='Concept bewaren en sluiten').click()
        closed(page)
        # waarneming intussen elders gewijzigd → concept verouderd, nooit toegepast
        page.evaluate("""async id => { const m = await import('/src/data/sightings.js');
          await new Promise(r => setTimeout(r, 20)); await m.updateSighting(id, { count: 4 }); }""", original['id'])
        changed = rows(page)[0]
        open_edit()
        dlg = page.locator('#sightingDraftDialog')
        dlg.wait_for(timeout=5000)
        stale_title = dlg.locator('.confirm-dialog__title').inner_text()
        dlg.get_by_role('button', name='Sluiten, concept bewaren').click()
        closed(page)
        stale_kept = rows(page)[0] == changed and changed['count'] == 4 and changed.get('notes') in (None, '')
        open_edit()
        page.locator('#sightingDraftDialog').get_by_role('button', name='Concept verwijderen en bewerken').click()
        page.wait_for_timeout(200)
        fresh_notes = page.locator('#sightNotes').input_value()
        page.locator('#addSheetCancel').click()
        closed(page)
        check('D7', 'bewerken→verwerpen: origineel identiek; bewerkconcept hervatbaar; verouderd concept nooit toegepast',
              after_discard == original and has_edit_draft and untouched and resumed_notes == 'Bewerkconcept'
              and stale_title == 'Verouderd concept' and stale_kept and fresh_notes == '' and key not in drafts(page)
              and not errors, f'stale={stale_title}, verse notitie="{fresh_notes}"')
        ctx.close()

        # ── D8 opslagfout ────────────────────────────────────────────
        ctx, page, errors = context()
        open_new(page)
        fill_basic(page, 'Foutplek')
        page.evaluate("""() => { window.__origSet = Storage.prototype.setItem;
          Storage.prototype.setItem = function (k, v) { if (k === 'birdspot-sightings') throw new DOMException('vol', 'QuotaExceededError');
            return window.__origSet.call(this, k, v); }; }""")
        page.locator('#addSheetSubmit').click()
        page.wait_for_function("() => !document.querySelector('#addSheetSubmit').disabled", timeout=8000)
        still = sheet_open(page) and page.locator('#sightLocation').input_value() == 'Foutplek'
        draft_after_error = drafts(page).get('new', {}).get('fields', {}).get('locationName')
        no_row = len(rows(page)) == 0
        page.evaluate("() => { Storage.prototype.setItem = window.__origSet; }")
        page.locator('#addSheetSubmit').click()
        closed(page)
        check('D8', 'opslagfout: formulier open, invoer en concept intact; daarna opslaan ruimt concept op',
              still and draft_after_error == 'Foutplek' and no_row and len(rows(page)) == 1 and drafts(page) == {},
              f'concept na fout={draft_after_error}')
        errors.clear()

        # ── D10 media in concept ─────────────────────────────────────
        open_new(page)
        pick(page)
        page.locator('#sightingMediaInput').set_input_files({'name': 'd10.png', 'mimeType': 'image/png', 'buffer': PNG})
        page.wait_for_function("() => document.querySelectorAll('#addSightingSheet .media-thumb').length === 1 && !document.querySelector('#addSheetSubmit').disabled", timeout=15000)
        page.locator('#addSheetCancel').click()
        dlg = leave_dialog(page)
        note = dlg.inner_text()
        dlg.get_by_role('button', name='Concept bewaren en sluiten').click()
        closed(page)
        toast = page.locator('.toast:not(.app-update)').inner_text()
        raw = page.evaluate(f"() => localStorage.getItem('{DRAFT_KEY}')")
        d = drafts(page)['new']
        open_new(page)
        offer = page.locator('#sightingDraftDialog').inner_text()
        page.locator('#sightingDraftDialog').get_by_role('button', name='Concept hervatten').click()
        page.wait_for_timeout(300)
        status = page.locator('#sightingMediaStatus').inner_text()
        thumbs = page.locator('#addSightingSheet .media-thumb').count()
        check('D10', 'media: eerlijke melding in dialoog, toast, aanbod en na hervatten; geen bestand in concept',
              'gaan niet mee' in note and 'zonder de nieuw gekozen media' in toast and d['pendingPhotos'] == 1
              and 'zitten niet in het concept' in offer and 'opnieuw' in status and thumbs == 0
              and 'blob' not in raw.lower() and 'data:' not in raw and not errors,
              f'melding="{note.splitlines()[-4] if note else ""}", status="{status}"')
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-01A: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
