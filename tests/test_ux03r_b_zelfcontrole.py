#!/usr/bin/env python3
"""UX-03R-B (25-11-2026): oude BirdNET-waarneming met 'Controle onbekend' alleen bewust laten meetellen.

Record s06 (Merel, 2025, bron 'self' + bewaarde soundSuggestion, zekerheid 'zeker') = Controle onbekend, telt niet.

B1  detail legt uit waarom (controle niet vastgelegd) en dat ze niet meetelt; knop 'Identificatie zelf controleren' ≥ 44 hoog;
    knop alleen bij 'Controle onbekend' (niet bij eigen herkenning, BirdNET-suggestie of zelf gecontroleerd)
B2  openen zonder wijziging, Bewerken → Annuleren, en Bewerken → 'Eigen herkenning' laten staan → Opslaan:
    status blijft 'Controle onbekend', telt niet, record (op updatedAt na bij opslaan) ongewijzigd; formulier zegt dat alleen opslaan niets verandert
B3  dialoog: uitleg + 'geen onafhankelijke wetenschappelijke verificatie' + 'blijft als bewijs bewaard'; 'Eigen controle vastleggen'
    uitgeschakeld tot de bevestiging is aangevinkt; Annuleer en Escape wijzigen niets; focus terug op de knop
B4  bewust bevestigen → succesmelding; record: identificationSource 'birdnet', birdnetVerification 'checked', soundSuggestion
    byte-gelijk, zekerheid/datum/soort/plek/notities ongewijzigd; andere records byte-gelijk
B5  heropenen: lijst, detail en soortkaart tonen 'BirdNET · zelf gecontroleerd' met eigen-controle-uitleg; knop weg
B6  telling: jaarlijst 2025 van 1 naar 2 (Merel telt nu mee); Inzichten 2025 = 2 en geen uitgesloten soort meer
B7  ZIP-back-up bevat de nieuwe controlevelden en het bewijs; terugzetten in een leeg profiel geeft dezelfde status
B8  offline: zelfde handeling werkt zonder netwerk
B9  rand: oud record zonder geluidsgebonden waarnemingswijze → dialoog verwijst naar Bewerken, geen schrijfactie
"""
import io
import json
import sys
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, boot, go_sightings, rows, SIGHTINGS, PLACES, rec  # noqa: E402
from test_explorer_species_cluster import LEAFLET_STUB  # noqa: E402

RESULTS = []
CLEAN = [dict(x, photoIds=[], audioIds=[]) for x in SIGHTINGS]   # zonder losse mediaverwijzingen, zodat een ZIP kan
EDGE = rec('e1', 'sp046', 'Zanglijster', '2025-06-01', observationMethod=None, identificationSource='self', merlinVerification=None,
           certainty='certain', soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.4, 'second': 4})


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def by_id(page):
    return {r['id']: r for r in rows(page)}


def counts(page, sid):
    return page.evaluate("""async id => { const s = await import('/src/features/profile/stats.js');
      return s.countsForList(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.find(x => x.id === id)); }""", sid)


def open_detail(page, sid):
    go_sightings(page)
    page.locator(f'.sight-card[data-id="{sid}"]').click()
    page.locator('#detailSightingSheet.open').wait_for(timeout=8000)


def close_detail(page):
    page.locator('#detailClose').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)


def toast(page):
    page.wait_for_timeout(200)
    return page.evaluate("() => { const t = document.querySelector('.toast.show:not(.app-update)'); return t && [t.dataset.tone, t.textContent]; }")


def selfcheck(page, sid):
    open_detail(page, sid)
    page.locator('#detailSelfCheck').click()
    page.locator('.selfcheck-dialog').wait_for(timeout=5000)
    page.locator('#selfCheckConfirm').check()
    page.locator('#selfCheckOk').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
    return toast(page)


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True, accept_downloads=True)
        ctx.add_init_script(LEAFLET_STUB)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        boot(page, base)
        seed(page, base, CLEAN + [EDGE], PLACES)
        start = by_id(page)

        # ── B1 uitleg en knop ────────────────────────────────────────
        open_detail(page, 's06')
        field = page.locator('#detailSightingSheet .detail-field--status').inner_text()
        btn = page.locator('#detailSelfCheck').bounding_box()
        close_detail(page)
        others = {}
        for sid in ('s01', 's04', 's05', 's03'):
            open_detail(page, sid)
            others[sid] = page.locator('#detailSelfCheck').count()
            close_detail(page)
        check('B1', "uitleg 'niet vastgelegd … telt niet mee' + knop ≥ 44 alleen bij Controle onbekend",
              'Controle onbekend' in field and 'is niet vastgelegd; daarom telt ze niet mee' in field and btn and btn['height'] >= 44
              and not any(others.values()), (field.replace('\n', ' | '), btn and round(btn['height']), others))

        # ── B2 geen stille bevestiging ───────────────────────────────
        open_detail(page, 's06'); close_detail(page)
        same_open = by_id(page)['s06'] == start['s06']
        open_detail(page, 's06')
        page.locator('#detailEdit').click(); page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#addSheetCancel').click(); page.wait_for_timeout(500)
        if page.locator('#sightingLeaveDialog').count():
            page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        same_cancel = by_id(page)['s06'] == start['s06']
        open_detail(page, 's06')
        page.locator('#detailEdit').click(); page.locator('#addSightingSheet.open').wait_for(timeout=8000); page.wait_for_timeout(300)
        if page.locator('#sightSourceGroup').is_hidden():
            page.locator('#sightingMore summary').click()
        legacy_note = page.locator('.sighting-birdnet-legacy').inner_text()
        eigen = page.locator('#addSheetContent').get_by_role('radio', name='Eigen herkenning')
        preselected = eigen.is_checked()
        eigen.check()
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        after_save = by_id(page)['s06']
        diff = sorted(k for k in set(after_save) | set(start['s06']) if after_save.get(k) != start['s06'].get(k))
        # bestaande normalisatie bij opslaan via het formulier: lege velden (None/ontbrekend → '') tellen niet als wijziging
        diff = [k for k in diff if not (k != 'updatedAt' and not after_save.get(k) and not start['s06'].get(k))]
        evid = all(after_save.get(k) == start['s06'].get(k) for k in ('identificationSource', 'birdnetVerification', 'merlinVerification', 'soundSuggestion', 'certainty'))
        go_sightings(page)
        pill = page.locator('.sight-card[data-id="s06"] .sighting-status-pill').inner_text().strip()
        check('B2', "openen / annuleren / opslaan met 'Eigen herkenning' bevestigt niets; formulier zegt dat",
              same_open and same_cancel and preselected and evid and set(diff) <= {'updatedAt'} and pill == 'Controle onbekend' and not counts(page, 's06')
              and 'Alleen opslaan verandert dat niet' in legacy_note, (diff, pill, legacy_note))
        base_s06 = by_id(page)['s06']

        # ── B3 dialoog ───────────────────────────────────────────────
        open_detail(page, 's06')
        page.locator('#detailSelfCheck').click()
        page.locator('.selfcheck-dialog').wait_for(timeout=5000)
        text = page.locator('.selfcheck-dialog').inner_text()
        disabled_first = page.locator('#selfCheckOk').is_disabled()
        focus_box = page.evaluate("() => document.activeElement?.id")
        page.locator('.selfcheck-dialog .confirm-cancel').click()
        page.wait_for_timeout(200)
        focus_back = page.evaluate("() => document.activeElement?.id")
        page.locator('#detailSelfCheck').click(); page.locator('.selfcheck-dialog').wait_for()
        page.locator('#selfCheckConfirm').check(); page.locator('#selfCheckConfirm').uncheck()
        disabled_again = page.locator('#selfCheckOk').is_disabled()
        page.keyboard.press('Escape'); page.wait_for_timeout(250)
        detail_still = page.locator('#detailSightingSheet.open').count() == 1 and page.locator('.selfcheck-dialog').count() == 0
        close_detail(page)
        check('B3', 'dialoog legt uit, knop pas actief na aanvinken; Annuleer/Escape wijzigen niets; focus correct',
              'geen onafhankelijke wetenschappelijke verificatie' in text and 'blijft als bewijs bewaard' in text and 'Ik heb Merel zelf gecontroleerd' in text
              and disabled_first and disabled_again and focus_box == 'selfCheckConfirm' and focus_back == 'detailSelfCheck' and detail_still
              and by_id(page)['s06'] == base_s06, (focus_box, focus_back, detail_still))

        # ── B4 bewust bevestigen ─────────────────────────────────────
        before_all = by_id(page)
        msg = selfcheck(page, 's06')
        now = by_id(page)
        s6 = now['s06']
        changed = sorted(k for k in set(s6) | set(before_all['s06']) if s6.get(k) != before_all['s06'].get(k))
        untouched = all(now[i] == before_all[i] for i in before_all if i != 's06')
        check('B4', "bevestigen → BirdNET · zelf gecontroleerd; soundSuggestion, zekerheid, soort, datum ongewijzigd; rest byte-gelijk",
              msg and msg[0] == 'success' and 'telt nu mee' in msg[1] and s6['identificationSource'] == 'birdnet' and s6['birdnetVerification'] == 'checked'
              and s6['soundSuggestion'] == before_all['s06']['soundSuggestion'] and set(changed) <= {'identificationSource', 'birdnetVerification', 'merlinVerification', 'updatedAt'}
              and untouched, (msg, changed))

        # ── B5 heropenen ─────────────────────────────────────────────
        go_sightings(page)
        pill = page.locator('.sight-card[data-id="s06"] .sighting-status-pill').inner_text().strip()
        open_detail(page, 's06')
        field = page.locator('#detailSightingSheet .detail-field--status').inner_text()
        no_btn = page.locator('#detailSelfCheck').count() == 0
        close_detail(page)
        page.evaluate("async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }")
        page.locator('#sdTab-mijn').click(timeout=15000)
        mine = ' | '.join(page.locator('#speciesDetailSightings .signature-species-sighting').all_inner_texts())
        page.keyboard.press('Escape'); page.wait_for_timeout(300)
        check('B5', "heropenen: lijst, detail en soortkaart 'BirdNET · zelf gecontroleerd', uitleg eigen controle, knop weg",
              pill == 'BirdNET · zelf gecontroleerd' and 'BirdNET · zelf gecontroleerd' in field and 'geen onafhankelijke wetenschappelijke verificatie' in field
              and no_btn and mine.count('BirdNET · zelf gecontroleerd') >= 1, (pill, field.replace('\n', ' | ')))

        # ── B6 tellingen ─────────────────────────────────────────────
        yl = page.evaluate("""async () => { const s = await import('/src/features/profile/stats.js'); const a = await import('/src/features/insights/analytics.js');
          const all = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings; const y = s.yearLists(all).find(x => x.year === '2025');
          const i = a.calculateInsights(all, 2025); return [y && y.species, i.speciesCount, i.uncountedSpeciesCount]; }""")
        check('B6', 'telling volgt: jaarlijst 2025 van 1 naar 2 (Zanglijster + Merel), Inzichten 2025 = 2, niets meer uitgesloten',
              yl == [2, 2, 0], yl)

        # ── B7 ZIP en terugzetten ────────────────────────────────────
        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        page.locator('#btnExport').wait_for(timeout=10000)
        with page.expect_download(timeout=30000) as dl:
            page.locator('#btnExport').click()
        raw = open(dl.value.path(), 'rb').read()
        g = json.loads(zipfile.ZipFile(io.BytesIO(raw)).read('gegevens.json'))
        z6 = next(x for x in g['sightings'] if x['id'] == 's06')
        ze = next(x for x in g['sightings'] if x['id'] == 'e1')
        ctx2 = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        p2 = ctx2.new_page(); boot(p2, base); seed(p2, base, [], PLACES)
        p2.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        p2.locator('#importFile').set_input_files({'name': 'birdspot.zip', 'mimeType': 'application/zip', 'buffer': raw})
        p2.locator('#confirmOverlay').wait_for(state='visible', timeout=12000)
        p2.locator('#confirmOk').click()
        p2.wait_for_function("() => (JSON.parse(localStorage.getItem('birdspot-sightings') || '{}').sightings || []).length > 0", timeout=15000)
        p2.wait_for_timeout(500)
        r2 = {r['id']: r for r in rows(p2)}
        restored = r2.get('s06', {})
        lbl = p2.evaluate("async () => { const e = await import('/src/features/sightings/evidence.js'); return e.verificationStatus(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.find(x => x.id === 's06')).label; }") if restored else None
        ctx2.close()
        check('B7', 'ZIP bevat controlevelden + bewijs; terugzetten in leeg profiel geeft dezelfde status',
              z6['identificationSource'] == 'birdnet' and z6['birdnetVerification'] == 'checked' and z6['soundSuggestion'] == s6['soundSuggestion']
              and ze['identificationSource'] == 'self' and ze.get('soundSuggestion') and restored.get('birdnetVerification') == 'checked'
              and lbl == 'BirdNET · zelf gecontroleerd', (lbl, len(r2)))

        # ── B8 offline ───────────────────────────────────────────────
        seed(page, base, CLEAN + [EDGE], PLACES)
        ctx.set_offline(True)
        msg_off = selfcheck(page, 's06')
        off = by_id(page)['s06']
        ctx.set_offline(False)
        check('B8', 'offline: zelfde handeling slaagt zonder netwerk', msg_off and msg_off[0] == 'success' and off['birdnetVerification'] == 'checked', msg_off)

        # ── B9 rand: geen geluidsgebonden waarnemingswijze ──────────
        before_e1 = by_id(page)['e1']
        open_detail(page, 'e1')
        page.locator('#detailSelfCheck').click(); page.locator('.selfcheck-dialog').wait_for()
        edge_text = page.locator('.selfcheck-dialog').inner_text()
        edge_ok_btn = page.locator('#selfCheckOk').count()
        page.locator('.selfcheck-dialog .confirm-cancel').click(); page.wait_for_timeout(200)
        close_detail(page)
        check('B9', 'oud record zonder gehoorde waarnemingswijze: dialoog verwijst naar Bewerken, geen schrijfactie',
              'Leg eerst bij Bewerken vast' in edge_text and edge_ok_btn == 0 and by_id(page)['e1'] == before_e1 and not errors, (edge_ok_btn, errors[:2]))
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03R-B: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 9 else 0)


if __name__ == '__main__':
    main()
