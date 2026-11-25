#!/usr/bin/env python3
"""UX-03B (25-11-2026): één begrijpelijke herkenningsstatus, overal gelijk, zonder misleiding.

V1  lijst: Eigen herkenning (rustig, geen extra label), BirdNET/Merlin · suggestie (amber, geen 'Zeker'),
    BirdNET/Merlin · zelf gecontroleerd (blauw), Controle onbekend (amber), bron niet vastgelegd (geen label)
V2  detail: hetzelfde label + korte toelichting; eigen controle ≠ wetenschappelijke verificatie; tegenstrijdig 'zeker' gemeld
V3  kaart (plekkaartje): dezelfde labels bij de waarnemingen van die plek
V4  soortkaart (tab Waarnemingen): dezelfde labels + scheiding van gidsinformatie
V5  profiel en statistiek: suggesties zonder controle en 'controle onbekend' tellen niet; uitleg met dezelfde woorden
V6  filter Herkenning gebruikt dezelfde termen (Controle onbekend · Bron niet vastgelegd)
V7  geen misleidend vinkje: geen ✓/✔ bij een status; geen 'Zeker' bij een ongecontroleerde suggestie (lijst, detail, kaart, soortkaart)
V8  historische records niet gewijzigd: herkennings- en zekerheidsvelden van alle records gelijk na alle schermen
    (kaart koppelt alleen-GPS-pins aan een plek: bestaande migratie 2B); CSV toont het oude record zoals voorheen
V9  oud record herstellen door bewust bewerken (BirdNET + zelf gecontroleerd) → telt weer mee; geen stille omzetting
V10 donker thema: statuslabels contrast ≥ 4,5:1
"""
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, boot, rows, SIGHTINGS, PLACES, rec  # noqa: E402
from test_ux02a_zoeken import CONTRAST  # noqa: E402
from test_explorer_species_cluster import LEAFLET_STUB  # noqa: E402

RESULTS = []
EXTRA = [rec('m2', 'sp050', 'Roodborst', '2026-06-20', observationMethod='heard', identificationSource='merlin',
             merlinVerification='checked', certainty='certain', placeId='pl_named', lat=52.3301, lon=4.8901)]
EXPECT = {'s01': None, 's03': 'Merlin · suggestie', 's04': 'BirdNET · suggestie', 's05': 'BirdNET · zelf gecontroleerd',
          's06': 'Controle onbekend', 's07': None, 's08': 'BirdNET · suggestie', 'm2': 'Merlin · zelf gecontroleerd'}
WARN = {'s03', 's04', 's06', 's08'}


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def storage(page):
    return page.evaluate("() => ({ s: localStorage.getItem('birdspot-sightings'), p: localStorage.getItem('birdspot-places') })")


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(dark=False):
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True,
                                      has_touch=True, color_scheme='dark' if dark else 'light')
            ctx.add_init_script(LEAFLET_STUB)   # kaart zonder netwerk (zelfde stub als de kaarttests)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            seed(page, base, SIGHTINGS + EXTRA, PLACES)
            return ctx, page, errors

        ctx, page, errors = context()
        before = storage(page)
        go_sightings(page)

        # ── V1 lijst ─────────────────────────────────────────────────
        cards = page.evaluate("""ids => Object.fromEntries(ids.map(id => { const c = document.querySelector(`.sight-card[data-id="${id}"]`);
          const p = c.querySelector('.sighting-status-pill'); return [id, { pill: p ? p.innerText.trim() : null,
          warn: p ? p.classList.contains('is-unchecked') : null, icon: p?.querySelector('svg')?.dataset.icon || null,
          zeker: !!c.querySelector('.sight-certainty--certain'), text: c.innerText }]; }))""", list(EXPECT))
        v1 = {k: (v['pill'], v['warn']) for k, v in cards.items()}
        check('V1', 'lijst: één label per status, amber bij suggestie/onbekend, geen Zeker bij ongecontroleerd, schildicoon',
              all(cards[k]['pill'] == EXPECT[k] for k in EXPECT) and all(cards[k]['warn'] == (k in WARN) for k in EXPECT if EXPECT[k])
              and not any(cards[k]['zeker'] for k in WARN) and all(cards[k]['icon'] == 'shield' for k in EXPECT if EXPECT[k]), v1)

        # ── V2 detail ────────────────────────────────────────────────
        details = {}
        for sid in EXPECT:
            page.locator(f'.sight-card[data-id="{sid}"]').click()
            page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
            details[sid] = {'status': page.locator('#detailSightingSheet .detail-field--status .detail-status').inner_text().strip(),
                            'summary': page.locator('#detailSightingSheet .detail-summary').inner_text(),
                            'text': page.locator('#detailSightingSheet').inner_text()}
            page.locator('#detailClose').click()
            page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        label_of = lambda k: EXPECT[k] or ('Eigen herkenning' if k == 's01' else 'Bron niet vastgelegd')
        check('V2', 'detail: zelfde label + toelichting; eigen controle ≠ wetenschappelijke verificatie; tegenstrijdig gemeld',
              all(details[k]['status'] == label_of(k) for k in EXPECT)
              and 'geen onafhankelijke wetenschappelijke verificatie' in details['s05']['text'] and 'geen onafhankelijke wetenschappelijke verificatie' in details['m2']['text']
              and 'Of je die zelf controleerde, is niet vastgelegd' in details['s06']['text'] and 'eigen controle niet vastgelegd' in details['s06']['summary']
              and 'telt daarom niet mee' in details['s08']['text'] and all('Zeker' not in details[k]['summary'] for k in WARN),
              {k: v['status'] for k, v in details.items()})

        # ── V3 kaart (plekkaartje) ───────────────────────────────────
        page.evaluate("""async () => { sessionStorage.setItem('birdspot-map-place', 'pl_named'); const a = await import('/src/app.js'); a.navigate('map', { force: true }); }""")
        page.locator('#mapSheetBody .place-sightings').wait_for(timeout=15000)
        map_rows = page.locator('#mapSheetBody .place-sightings li').all_inner_texts()
        joined = ' | '.join(r.replace('\n', ' ') for r in map_rows)
        check('V3', 'kaart: plekkaartje toont dezelfde statuslabels (Amstelpark: eigen herkenning, BirdNET/Merlin zelf gecontroleerd)',
              'BirdNET · zelf gecontroleerd' in joined and 'Merlin · zelf gecontroleerd' in joined and 'suggestie' not in joined
              and sum('Merel' in r for r in map_rows) == 1, joined)

        # ── V4 soortkaart ────────────────────────────────────────────
        page.evaluate("""async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }""")
        page.locator('#sdTab-mijn').click(timeout=15000)
        page.locator('#speciesDetailSightings .signature-species-sighting').first.wait_for(timeout=8000)
        sp_rows = page.locator('#speciesDetailSightings .signature-species-sighting').all_inner_texts()
        note = page.locator('.sd-mine-note').inner_text()
        sp = ' | '.join(r.replace('\n', ' ') for r in sp_rows)
        check('V4', 'soortkaart: dezelfde labels (Eigen herkenning, BirdNET · suggestie, Controle onbekend) + scheiding van gidsinformatie',
              'Eigen herkenning' in sp and 'BirdNET · suggestie' in sp and 'Controle onbekend' in sp and 'staat los van de gidsinformatie' in note, sp)
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)

        # ── V5 profiel en statistiek ─────────────────────────────────
        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        page.locator('#profileSkippedNote').wait_for(timeout=10000)
        skipped = page.locator('#profileSkippedNote').inner_text()
        counts = page.evaluate("""async () => { const s = await import('/src/features/profile/stats.js'); const sp = await import('/src/data/species.js');
          const list = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
          const l = s.profileLists(list, { speciesById: new Map(sp.SPECIES.map(x => [x.id, x])) });
          return { species: l.list.map(r => r.name).sort(), skipped: l.skipped }; }""")
        check('V5', "profiel: suggesties zonder controle en 'controle onbekend' tellen niet; uitleg met dezelfde woorden",
              counts['skipped'] == 4 and 'Boomkruiper' not in counts['species'] and 'Roodborst' in counts['species']
              and 'Merel' in counts['species'] and skipped.startswith('4 onzekere waarnemingen tellen niet mee')
              and 'controle onbekend' in skipped and 'BirdNET of Merlin zonder eigen controle' in skipped and 'blijven bewaard' in skipped, (counts, skipped))

        # ── V6 filter ────────────────────────────────────────────────
        go_sightings(page)
        page.locator('#sightingsFilterBtn').click()
        opts = page.locator('.sightings-filter-option[data-group="source"]').all_inner_texts()
        page.locator('#sightingsFilterBtn').click()
        check('V6', 'filter Herkenning: dezelfde termen', [o.replace('✓', '').strip() for o in opts] ==
              ['Eigen herkenning', 'BirdNET', 'Merlin', 'Controle onbekend', 'Bron niet vastgelegd'], opts)

        # ── V7 geen misleidend vinkje ────────────────────────────────
        ticks = page.evaluate("""() => [...document.querySelectorAll('#sightingCards, .sighting-status-pill')].some(e => /[✓✔☑]/.test(e.innerText))""")
        all_text = ' '.join(d['text'] for d in details.values()) + joined + sp
        check('V7', "geen ✓/✔ bij een status; nergens 'Zeker' bij een ongecontroleerde suggestie",
              not ticks and not any(ch in all_text for ch in '✓✔☑') and not any(cards[k]['zeker'] for k in WARN))

        # ── V8 historische records ongewijzigd ───────────────────────
        after = storage(page)
        EVID = ('identificationSource', 'merlinVerification', 'birdnetVerification', 'certainty', 'soundSuggestion', 'observationMethod', 'speciesId', 'date')
        ev = lambda raw: {r['id']: {k: r.get(k) for k in EVID} for r in json.loads(raw)['sightings']}
        csv = page.evaluate("""async () => { const c = await import('/src/features/profile/exportCsv.js');
          return c.sightingsToCsv(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings); }""")
        legacy_line = next(line for line in csv.splitlines() if '2025-05-01' in line)
        check('V8', 'historische records ongewijzigd: herkennings- en zekerheidsvelden gelijk na alle schermen; CSV toont oud record zoals voorheen',
              ev(before['s']) == ev(after['s']) and 'Merel' in legacy_line and 'BirdNET' not in legacy_line and not errors, legacy_line)

        # ── V9 bewust bewerken ───────────────────────────────────────
        go_sightings(page)
        page.locator('.sight-card[data-id="s06"]').click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        page.locator('#detailEdit').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.wait_for_timeout(300)
        if page.locator('#sightSourceGroup').is_hidden():
            page.locator('#sightingMore summary').click()
        page.locator('#addSheetContent').get_by_role('radio', name='BirdNET-suggestie').check()
        page.locator('#sightBirdnetChecked').check()
        page.locator('#certaintyGroup input[value="certain"]').check(force=True)
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.wait_for_timeout(400)
        rec6 = next(r for r in rows(page) if r['id'] == 's06')
        pill = page.locator('.sight-card[data-id="s06"] .sighting-status-pill').inner_text().strip()
        counted = page.evaluate("""async () => { const s = await import('/src/features/profile/stats.js');
          return s.countsForList(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.find(x => x.id === 's06')); }""")
        others = {r['id']: r for r in json.loads(after['s'])['sightings'] if r['id'] != 's06'}
        now = {r['id']: r for r in rows(page) if r['id'] != 's06'}
        check('V9', 'oud record bewust bewerken → BirdNET · zelf gecontroleerd, telt weer mee; andere records onaangeroerd',
              rec6['identificationSource'] == 'birdnet' and rec6['birdnetVerification'] == 'checked' and rec6['soundSuggestion']
              and pill == 'BirdNET · zelf gecontroleerd' and counted and others == now and not errors, (pill, counted))
        ctx.close()

        # ── V10 donker thema ─────────────────────────────────────────
        ctx, page, errors = context(dark=True)
        go_sightings(page)
        ratios = page.evaluate(CONTRAST, '.sighting-status-pill, .sight-certainty')
        page.locator('.sight-card[data-id="s05"]').click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        ratios += page.evaluate(CONTRAST, '.detail-status, .detail-sure')
        page.screenshot(path='/tmp/ux03b_dark_detail.png')
        low = [r for r in ratios if r[1] < 4.5]
        check('V10', 'donker thema: statuslabels contrast ≥ 4,5:1', not low and len(ratios) >= 8, low or f'{len(ratios)} labels, min {min(r[1] for r in ratios)}')
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03B: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 10 else 0)


if __name__ == '__main__':
    main()
