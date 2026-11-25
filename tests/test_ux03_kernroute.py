#!/usr/bin/env python3
"""UX-03 integrale kernroute (25-11-2026), van een lege app tot opnieuw controleren:

K1 app openen: Home toont Ontdekken · Waarnemen · Mijn collectie
K2 vogel zoeken: Ontdekken → soortengids → zoeken op 'merel' → soortkaart open
K3 herkennen: soortkaart toont gidsinformatie; tab Waarnemingen is nog leeg; terug naar de gids
K4 waarneming toevoegen: Waarnemen → Gezien → soort kiezen via zoeken → plek, zekerheid, notitie
K5 opslaan: melding met succestoon; kaart in Mijn waarnemingen met 'Eigen herkenning' (geen extra label)
K6 heropenen: app herladen → waarneming staat er nog, ongewijzigd
K7 terugvinden: zoeken op notitie in Mijn waarnemingen → precies deze kaart
K8 bewerken: zekerheid naar 'waarschijnlijk', notitie aanvullen → succestoon 'Waarneming bijgewerkt'
K9 opnieuw controleren: detail toont nieuwe zekerheid en notitie; soortkaart-tab Waarnemingen en profieltelling volgen;
   geen paginafouten, één record, geen dubbele opslag
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, boot, go_sightings, rows  # noqa: E402

RESULTS = []
NOTE = 'Kernroute UX-03 zang op de schoorsteen'


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def toast(page):
    page.wait_for_timeout(250)
    return page.evaluate("() => { const t = document.querySelector('.toast.show:not(.app-update)'); return t ? [t.dataset.tone, t.textContent] : null; }")


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        boot(page, base)
        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('home', { force: true }); }")
        page.locator('.home-core-actions').wait_for(timeout=15000)

        core = page.locator('.home-core-action').all_inner_texts()
        check('K1', 'app openen: drie kernactiviteiten op Home', [c.strip() for c in core] == ['Ontdekken', 'Waarnemen', 'Mijn collectie'], core)

        page.locator('.home-core-action', has_text='Ontdekken').click()
        page.locator('#speciesSearch').wait_for(timeout=10000)
        page.locator('#speciesSearch').fill('merel')
        page.wait_for_timeout(500)
        page.locator('.species-row[data-id="sp045"] .species-row__name').click()
        page.locator('#sdTab-mijn').wait_for(timeout=10000)
        title = page.locator('.signature-species-detail-sheet h2, .signature-species-detail-sheet .sd-title').first.inner_text()
        check('K2', "vogel zoeken: 'merel' → soortkaart Merel", 'Merel' in title, title)

        guide = page.locator('.signature-species-detail-sheet').inner_text()
        page.locator('#sdTab-mijn').click()
        page.wait_for_timeout(300)
        empty_mine = page.locator('#speciesDetailSightings .signature-species-sighting').count() == 0
        page.keyboard.press('Escape')
        page.wait_for_timeout(500)
        check('K3', 'herkennen: gidsinformatie zichtbaar, eigen waarnemingen nog leeg, terug naar de gids',
              len(guide) > 200 and empty_mine and page.locator('.signature-species-detail-sheet').count() == 0
              and page.locator('#speciesSearch').is_visible(), len(guide))

        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('home', { force: true }); }")
        page.locator('#homeCoreObserve').click()
        page.locator('[data-quick-action="seen"]').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=9000)
        page.locator('#speciesPickerBtn').click()
        page.locator('#spPickerSearch').fill('merel')
        page.wait_for_timeout(300)
        page.locator('#spPickerList .species-row[data-id="sp045"]').click()
        page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
        page.locator('#sightLocation').fill('Tuin Kernroute')
        page.locator('#certaintyGroup input[value="certain"]').check(force=True)
        if page.locator('#sightNotes').is_hidden():
            page.locator('#sightingMore summary').click()
        page.locator('#sightNotes').fill(NOTE)
        picked = page.locator('#speciesPickerBtn').inner_text()
        check('K4', 'waarneming toevoegen: via Waarnemen → Gezien, soort gekozen, plek/zekerheid/notitie ingevuld', 'Merel' in picked, picked.replace('\n', ' '))

        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.wait_for_timeout(500)
        stored = rows(page)
        rec = stored[0] if len(stored) == 1 else {}
        go_sightings(page)
        card = page.locator(f'.sight-card[data-id="{rec.get("id")}"]')
        check('K5', 'opslaan: één record, kaart in Mijn waarnemingen, eigen herkenning zonder extra label, niet als suggestie',
              len(stored) == 1 and rec.get('speciesId') == 'sp045' and rec.get('certainty') == 'certain' and rec.get('notes') == NOTE
              and card.count() == 1 and card.locator('.sighting-status-pill').count() == 0, {k: rec.get(k) for k in ('speciesId', 'certainty', 'identificationSource')})

        before = json.dumps(rows(page), sort_keys=True)
        page.reload()
        page.locator('#fab').wait_for(state='visible', timeout=20000)
        after = json.dumps(rows(page), sort_keys=True)
        go_sightings(page)
        check('K6', 'heropenen: na herladen staat de waarneming er nog, ongewijzigd', before == after and page.locator('.sight-card').count() == 1)

        page.locator('#sightingsSearch').fill('schoorsteen')
        page.wait_for_timeout(400)
        found = page.locator('.sight-card').evaluate_all("cs => cs.map(c => c.dataset.id)")
        check('K7', 'terugvinden: zoeken op notitie geeft precies deze kaart', found == [rec.get('id')], found)

        page.locator(f'.sight-card[data-id="{rec.get("id")}"]').click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        page.locator('#detailEdit').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#certaintyGroup input[value="probable"]').check(force=True)
        if page.locator('#sightNotes').is_hidden():
            page.locator('#sightingMore summary').click()
        page.locator('#sightNotes').fill(NOTE + ' — tweede keer gehoord')
        page.locator('#addSheetSubmit').click()
        msg = toast(page)
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        check('K8', "bewerken: zekerheid en notitie gewijzigd, succestoon 'Waarneming bijgewerkt'", msg and msg[0] == 'success' and 'bijgewerkt' in msg[1], msg)

        page.wait_for_timeout(500)
        final = rows(page)
        go_sightings(page)
        page.locator('#sightingsSearch').fill('')
        page.wait_for_timeout(300)
        page.locator(f'.sight-card[data-id="{rec.get("id")}"]').click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        detail = page.locator('#detailSightingSheet').inner_text()
        page.locator('#detailClose').click()
        page.wait_for_timeout(300)
        page.evaluate("async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }")
        page.locator('#sdTab-mijn').click(timeout=15000)
        mine = page.locator('#speciesDetailSightings .signature-species-sighting').all_inner_texts()
        page.keyboard.press('Escape')
        counted = page.evaluate("""async () => { const s = await import('/src/features/profile/stats.js'); const sp = await import('/src/data/species.js');
          const list = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
          return s.profileLists(list, { speciesById: new Map(sp.SPECIES.map(x => [x.id, x])) }).list.map(r => r.name); }""")
        check('K9', 'opnieuw controleren: detail, soortkaart en profiel tonen de bewerking; één record, geen paginafouten',
              len(final) == 1 and final[0]['certainty'] == 'probable' and final[0]['notes'].endswith('tweede keer gehoord')
              and 'Waarschijnlijk' in detail and 'tweede keer gehoord' in detail and len(mine) == 1 and 'Eigen herkenning' in mine[0]
              and counted == ['Merel'] and not errors, (mine, counted, errors[:2]))
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03 kernroute: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 9 else 0)


if __name__ == '__main__':
    main()
