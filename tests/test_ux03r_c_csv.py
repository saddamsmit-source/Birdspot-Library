#!/usr/bin/env python3
"""UX-03R-C (25-11-2026): CSV maakt historische 'controle onbekend' zichtbaar zonder formaatmigratie.

Gekozen kleinste veilige oplossing (eigenaarbesluit 7173278596): zelfde 13 kolommen in dezelfde volgorde; 'zekerheid' blijft
de opgeslagen waarde; de herkenning staat zoals al bij BirdNET/Merlin tussen haakjes achter 'waarnemingswijze'.

C1  kolomkop byte-gelijk aan het bestaande contract (13 kolommen, zelfde volgorde) en UTF-8 met BOM
C2  per herkenning: eigen 'gezien' · Merlin '(Merlin, suggestie)' · BirdNET '(BirdNET, suggestie)' / '(BirdNET, zelf gecontroleerd)' ·
    Merlin '(Merlin, zelf gecontroleerd)' · historisch '(BirdNET, controle onbekend)' met zekerheid 'zeker' behouden
    (zonder vastgelegde waarnemingswijze alleen de markering, geen verzonnen 'gehoord') ·
    record zonder bron: lege waarnemingswijze, zekerheid behouden
C3  alle waarnemingen aanwezig; datum JJJJ-MM-DD; coördinaten 6 decimalen; komma/aanhalingsteken/regeleinde correct gequote;
    formule-injectie geneutraliseerd
C4  alleen de waarnemingswijze van 'controle onbekend'-records wijkt af van het oude formaat (rest van elke regel gelijk)
C5  na bewuste eigen controle (UX-03R-B) wordt de regel '(BirdNET, zelf gecontroleerd)'
C6  geen stille conversie: opslag byte-gelijk na CSV- en ZIP-export; ZIP terugzetten in leeg profiel geeft identieke records
"""
import csv
import io
import json
import sys
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, boot, go_sightings, rows, SIGHTINGS, PLACES, rec  # noqa: E402
import re  # noqa: E402
from test_explorer_species_cluster import LEAFLET_STUB  # noqa: E402

RESULTS = []
OLD_COLUMNS = ['datum', 'tijd', 'soort', 'wetenschappelijke_naam', 'aantal', 'zekerheid', 'waarnemingswijze',
               'breedtegraad', 'lengtegraad', 'nauwkeurigheid_m', 'plek', 'notities', 'birdspot_id']   # contract op 01e5c2e
CLEAN = [dict(x, photoIds=[], audioIds=[]) for x in SIGHTINGS]
EXTRA = [
    rec('m2', 'sp077', 'Fuut', '2026-07-01', observationMethod='heard', identificationSource='merlin', merlinVerification='checked',
        certainty='certain', lat=52.123456789, lon=4.98765, pinAccuracyM=7.6, notes='Riep, "twee keer", bij de steiger\nlaat'),
    rec('f1', 'sp029', 'Koolmees', '2026-07-02', observationMethod='seen', identificationSource='self', merlinVerification=None,
        certainty='certain', notes='=SOM(1;2)', locationName='+31 tuin'),
    # historisch zonder vastgelegde waarnemingswijze: CSV mag geen 'gehoord' verzinnen
    rec('e1', 'sp046', 'Zanglijster', '2025-06-01', observationMethod=None, identificationSource='self', merlinVerification=None,
        certainty='certain', soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.4, 'second': 4}),
]


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def download(page, sel):
    with page.expect_download(timeout=30000) as dl:
        page.locator(sel).click()
    return open(dl.value.path(), 'rb').read()


def parse(raw):
    text = raw.decode('utf-8')
    bom = text.startswith('﻿')
    rdr = list(csv.reader(io.StringIO(text.lstrip('﻿'))))
    return bom, rdr[0], {r[-1]: dict(zip(rdr[0], r)) for r in rdr[1:]}, rdr


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
        seed(page, base, CLEAN + EXTRA, PLACES)
        before = page.evaluate("() => localStorage.getItem('birdspot-sightings')")
        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        page.locator('#btnCsv').wait_for(timeout=10000)
        raw = download(page, '#btnCsv')
        bom, head, by, table = parse(raw)
        check('C1', 'kolomkop gelijk aan bestaand contract (13 kolommen, zelfde volgorde), UTF-8 met BOM', bom and head == OLD_COLUMNS, head)

        w = {k: (v['waarnemingswijze'], v['zekerheid']) for k, v in by.items()}
        expect = {'s01': ('gezien', 'zeker'), 's03': ('gezien en gehoord (Merlin, suggestie)', 'mogelijk'), 's04': ('gehoord (BirdNET, suggestie)', 'mogelijk'),
                  's05': ('gehoord (BirdNET, zelf gecontroleerd)', 'zeker'), 's06': ('gehoord (BirdNET, controle onbekend)', 'zeker'),
                  's07': ('', 'zeker'), 's08': ('gehoord (BirdNET, suggestie)', 'zeker'), 'm2': ('gehoord (Merlin, zelf gecontroleerd)', 'zeker'),
                  'f1': ('gezien', 'zeker'), 'e1': ('(BirdNET, controle onbekend)', 'zeker')}
        check('C2', "per herkenning juiste markering; historisch '(BirdNET, controle onbekend)' met opgeslagen zekerheid 'zeker'",
              all(w.get(k) == v for k, v in expect.items()), {k: w.get(k) for k in expect if w.get(k) != expect[k]} or 'alle 10 juist')

        recs = {r['id']: r for r in json.loads(before)['sightings']}
        line_m2 = next(l for l in raw.decode('utf-8').splitlines() if 'Riep' in l)
        check('C3', 'alle waarnemingen, datums JJJJ-MM-DD, 6 decimalen, quoting en formule-injectie correct',
              set(by) == set(recs) and len(table) - 1 == len(recs) and all(len(v['datum']) == 10 and v['datum'][4] == '-' for v in by.values())
              and by['m2']['breedtegraad'] == '52.123457' and by['m2']['lengtegraad'] == '4.987650' and by['m2']['nauwkeurigheid_m'] == '8'
              and by['m2']['notities'] == 'Riep, "twee keer", bij de steiger\nlaat' and line_m2.startswith('2026-07-01')
              and by['f1']['notities'] == "'=SOM(1;2)" and by['f1']['plek'] == "'+31 tuin", (by['m2']['notities'], by['f1']['notities'], by['f1']['plek']))

        # C4: oude formaat nabootsen = zelfde regel, maar zonder markering bij controle onbekend
        legacy = {i for i, r in recs.items() if r.get('identificationSource') == 'self' and r.get('soundSuggestion')}
        diffs = {}
        for i, v in by.items():
            old = dict(v)
            if i in legacy:
                old['waarnemingswijze'] = re.sub(r'\s?\(BirdNET, controle onbekend\)', '', old['waarnemingswijze'])
            changed = [k for k in OLD_COLUMNS if old[k] != v[k]]
            if changed:
                diffs[i] = changed
        check('C4', "alleen 'waarnemingswijze' van controle-onbekend-records wijkt af; elke andere cel gelijk aan het oude formaat",
              legacy == {'s06', 'e1'} and diffs == {'s06': ['waarnemingswijze'], 'e1': ['waarnemingswijze']}, diffs)

        after_csv = page.evaluate("() => localStorage.getItem('birdspot-sightings')")
        zip_raw = download(page, '#btnExport')
        after_zip = page.evaluate("() => localStorage.getItem('birdspot-sightings')")
        g = json.loads(zipfile.ZipFile(io.BytesIO(zip_raw)).read('gegevens.json'))
        ctx2 = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        p2 = ctx2.new_page(); boot(p2, base); seed(p2, base, [], PLACES)
        p2.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        p2.locator('#importFile').set_input_files({'name': 'birdspot.zip', 'mimeType': 'application/zip', 'buffer': zip_raw})
        p2.locator('#confirmOverlay').wait_for(state='visible', timeout=12000)
        p2.locator('#confirmOk').click()
        p2.wait_for_function("() => (JSON.parse(localStorage.getItem('birdspot-sightings') || '{}').sightings || []).length > 0", timeout=15000)
        p2.wait_for_timeout(400)
        restored = {r['id']: r for r in rows(p2)}
        ctx2.close()
        same = all(restored.get(i) == r for i, r in recs.items())

        # C5 na bewuste eigen controle
        go_sightings(page)
        page.locator('.sight-card[data-id="s06"]').click(); page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        page.locator('#detailSelfCheck').click(); page.locator('#selfCheckConfirm').check(); page.locator('#selfCheckOk').click()
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        page.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
        page.locator('#btnCsv').wait_for(timeout=10000)
        _, _, by2, _ = parse(download(page, '#btnCsv'))
        check('C5', "na bewuste eigen controle: '(BirdNET, zelf gecontroleerd)', zekerheid ongewijzigd",
              by2['s06']['waarnemingswijze'] == 'gehoord (BirdNET, zelf gecontroleerd)' and by2['s06']['zekerheid'] == 'zeker', by2['s06']['waarnemingswijze'])

        check('C6', 'geen stille conversie: opslag gelijk na CSV en ZIP; ZIP bevat de ruwe velden; terugzetten geeft identieke records',
              before == after_csv == after_zip and same and len(restored) == len(recs)
              and next(x for x in g['sightings'] if x['id'] == 's06').get('soundSuggestion') and not errors, (len(restored), errors[:2]))
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03R-C: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 6 else 0)


if __name__ == '__main__':
    main()
