#!/usr/bin/env python3
"""UX-03R-A (25-11-2026): één betekenis voor 'soorten' in de hele app (eigenaarbesluit optie A + 7173278596).

Dataset (fictief, ux02-fixture + 3 extra): eigen herkenning, Merlin/BirdNET suggestie en zelf gecontroleerd,
historisch 'controle onbekend', 'mogelijk', record zonder bron. Verwachte aantallen staan vast in deze test,
zodat dezelfde test op de oude SHA (01e5c2e) aantoonbaar faalt (tegenproef).

  alle jaren : 6 soorten op je lijst (Merel, Koolmees, Zanglijster, Huismus, Siberische Sprinkhaanzanger, Fuut)
               10 geregistreerd (+ Roodborst, Boomkruiper alleen suggestie · IJsvogel controle onbekend · Graspieper mogelijk)
  2026       : 4 op de jaarlijst (Merel, Koolmees, Siberische, Fuut) · 8 geregistreerd · 4 tellen niet mee
  2025       : 1 (Zanglijster) · 2 geregistreerd (Merel alleen 'controle onbekend')

A1  centrale bron: speciesTally/countsForList geven de vaste aantallen
A2  Home-tegel 'Soorten' = 6
A3  Profiel: 'soorten op je lijst' 6 · overzicht '10 soorten geregistreerd' (ruw, gelabeld) · jaarlijst 4 · nieuw in 2026 volgt de lijst
A4  Inzichten 2026: 'Soorten op jaarlijst' 4, uitleg noemt 4 niet-meetellende en 8 geregistreerde, top 5 alleen lijstsoorten
    (geen Boomkruiper/Roodborst/IJsvogel/Graspieper), cumulatieve soortlijn eindigt op 4; 2025: 1 met uitleg
A5  Soortgids: teller 6 waargenomen; Merel/Fuut 'Waargenomen'; Boomkruiper/Roodborst/IJsvogel/Graspieper
    'Geregistreerd, telt niet mee'; Bonte Kraai zonder status
A6  Dagboek: 'Soorten op je lijst' 6 naast 12 waarnemingen (ruw)
A7  Kaart, plekkaartje Amstelpark (ruwe plekgegevens): '3 soorten geregistreerd', 3 waarnemingen; IJsvogel staat
    in de waarnemingen met 'Controle onbekend'; geen ongelabeld soortaantal
A8  Profiel › Topplekken (ruw, K7-contract): Amstelpark 3 waarnemingen · 3 soorten geregistreerd
A9  geen datawijziging (alle velden gelijk; enige uitzondering de bestaande 2B-plekkoppeling bij een kaartbezoek),
    geen paginafouten; 320 px zonder overloop
"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, boot, SIGHTINGS, PLACES, rec  # noqa: E402
from test_explorer_species_cluster import LEAFLET_STUB  # noqa: E402

RESULTS = []
EXTRA = [
    rec('x1', 'sp077', 'Fuut', '2026-07-01', observationMethod='heard', identificationSource='merlin', merlinVerification='checked',
        certainty='certain', locationName='Plas'),
    rec('x2', 'sp075', 'IJsvogel', '2026-08-01', observationMethod='heard', identificationSource='self', merlinVerification=None,
        certainty='certain', placeId='pl_named', lat=52.3301, lon=4.8901, soundSuggestion={'model': 'BirdNET+ V3.0', 'score': 0.5, 'second': 1}),
    rec('x3', 'sp072', 'Graspieper', '2026-08-02', observationMethod='seen', identificationSource='self', merlinVerification=None,
        certainty='possible', locationName='Weiland'),
]
DATA = SIGHTINGS + EXTRA
UNCOUNTED = ['Boomkruiper', 'Roodborst', 'IJsvogel', 'Graspieper']


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def nav(page, route, wait=1400):
    page.evaluate(f"async () => {{ const a = await import('/src/app.js'); a.navigate('{route}', {{ force: true }}); }}")
    page.wait_for_timeout(wait)


def num(text):
    m = re.search(r'\d+', text or '')
    return int(m.group()) if m else None


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
        ctx.add_init_script(LEAFLET_STUB)
        page = ctx.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        boot(page, base)
        seed(page, base, DATA, PLACES)
        before = page.evaluate("() => localStorage.getItem('birdspot-sightings')")

        # referentie via countsForList (bestaat ook op de oude SHA, zodat de tegenproef volledig kan draaien)
        ref = page.evaluate("""async () => { const st = await import('/src/features/profile/stats.js');
          const all = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
          const t = y => { const rows = (y ? all.filter(s => String(s.date).startsWith(y)) : all).filter(s => s.speciesId);
            return [new Set(rows.filter(st.countsForList).map(s => s.speciesId)).size, new Set(rows.map(s => s.speciesId)).size]; };
          return { all: t(), y2026: t('2026'), y2025: t('2025') }; }""")
        check('A1', 'centrale telregel: 6/10 alle jaren · 4/8 in 2026 · 1/2 in 2025', ref == {'all': [6, 10], 'y2026': [4, 8], 'y2025': [1, 2]}, ref)

        nav(page, 'home', 1800)
        home = page.evaluate("() => document.querySelector('#stat-species .stat-tile__value')?.textContent")
        if home is None:
            home = page.evaluate("() => { const t = [...document.querySelectorAll('.stat-tile, [class*=stat]')].find(e => /Soorten/.test(e.innerText)); return t && t.innerText; }")
        check('A2', "Home-tegel 'Soorten' = 6 (soorten op je lijst)", num(home) == 6, home)

        nav(page, 'profile', 1600)
        prof = page.evaluate("""() => ({ overview: [...document.querySelectorAll('#overviewHeading ~ .profile-stats .profile-stat')].map(e => e.innerText.replace(/\\s+/g, ' ')),
          lists: [...document.querySelectorAll('.profile-stats--lists .profile-stat')].map(e => e.innerText.replace(/\\s+/g, ' ')),
          places: [...document.querySelectorAll('.profile-list--places .profile-row')].map(e => e.innerText.replace(/\\s+/g, ' ')) })""")
        lists = ' | '.join(prof['lists'])
        check('A3', "Profiel: 6 soorten op je lijst · overzicht '10 soorten geregistreerd' · jaarlijst 2026 = 4",
              '6 soorten op je lijst' in lists and '4 jaarlijst 2026' in lists and '10 soorten geregistreerd' in prof['overview']
              and not any(re.fullmatch(r'\d+ soorten?', o) for o in prof['overview']), prof)

        nav(page, 'insights', 1800)
        ins = page.evaluate("""() => ({ kpi: [...document.querySelectorAll('.phase3-kpi')].map(e => e.innerText.replace(/\\s+/g, ' ')),
          note: document.getElementById('insightsUncounted')?.innerText || '', top: [...document.querySelectorAll('.phase3-top-species strong')].map(e => e.textContent) })""")
        months = page.evaluate("""async () => { const a = await import('/src/features/insights/analytics.js');
          const st = a.calculateInsights(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings, 2026);
          const st25 = a.calculateInsights(JSON.parse(localStorage.getItem('birdspot-sightings')).sightings, 2025);
          return { last: st.months[11].uniqueSpecies, total: st.total, y25: [st25.speciesCount, st25.uncountedSpeciesCount, st25.registeredSpeciesCount] }; }""")
        page.select_option('#insightsYear', '2025')
        page.wait_for_timeout(600)
        note25 = page.evaluate("() => document.getElementById('insightsUncounted')?.innerText || ''")
        kpi = ' | '.join(ins['kpi'])
        check('A4', 'Inzichten: 2026 = 4 op jaarlijst + uitleg (4 niet mee, 8 geregistreerd), top 5 alleen lijstsoorten, lijn eindigt op 4; 2025 = 1 + uitleg',
              '4 Soorten op jaarlijst' in kpi and ins['note'].startswith('4 soorten zijn alleen geregistreerd') and 'Geregistreerde soorten in 2026: 8' in ins['note']
              and set(ins['top']) <= {'Merel', 'Koolmees', 'Siberische Sprinkhaanzanger', 'Fuut'} and len(ins['top']) == 4
              and months['last'] == 4 and months['y25'] == [1, 1, 2] and note25.startswith('1 soort is alleen geregistreerd'), (ins, months, note25))

        nav(page, 'species', 1400)
        counter = page.locator('#speciesSub').inner_text()
        status = {}
        for q, sid in (('merel', 'sp045'), ('fuut', 'sp077'), ('boomkruiper', 'sp066'), ('roodborst', 'sp050'), ('ijsvogel', 'sp075'),
                       ('graspieper', 'sp072'), ('bonte kraai', None)):
            page.locator('#speciesSearch').fill(q)
            page.wait_for_timeout(350)
            row = page.locator(f'.species-row[data-id="{sid}"]') if sid else page.locator('.species-row').first
            status[q] = row.locator('.species-observation-status').inner_text()
        page.locator('#speciesSearch').fill('')
        check('A5', "Soortgids: teller 6, 'Waargenomen' alleen voor lijstsoorten, anders 'Geregistreerd, telt niet mee'",
              num(counter.split('·')[1]) == 6 and status['merel'] == status['fuut'] == 'Waargenomen'
              and all(status[q] == 'Geregistreerd, telt niet mee' for q in ('boomkruiper', 'roodborst', 'ijsvogel', 'graspieper'))
              and status['bonte kraai'] == '', (counter, status))

        nav(page, 'journal', 1600)
        jr = page.evaluate("() => [...document.querySelectorAll('.phase3-journal-milestone')].map(e => e.innerText.replace(/\\s+/g, ' '))")
        check('A6', "Dagboek: '6 Soorten op je lijst' naast 12 waarnemingen (ruw)", '6 Soorten op je lijst' in jr and '12 Waarnemingen' in jr, jr)

        page.evaluate("async () => { sessionStorage.setItem('birdspot-map-place', 'pl_named'); const a = await import('/src/app.js'); a.navigate('map', { force: true }); }")
        page.locator('#mapSheetBody .place-stats').wait_for(timeout=15000)
        pst = page.eval_on_selector_all('.place-stat', "els => els.map(e => e.innerText.replace(/\\s+/g, ' '))")
        prow = ' | '.join(r.replace('\n', ' ') for r in page.locator('#mapSheetBody .place-sightings li').all_inner_texts())
        check('A7', "Kaart Amstelpark: '3 soorten geregistreerd', 3 waarnemingen; IJsvogel zichtbaar met Controle onbekend",
              pst[0] == '3 soorten geregistreerd' and page.locator('#mapSheetBody .place-h', has_text='Geregistreerde soorten hier').count() == 1 and '3 waarnemingen' in pst and 'IJsvogel' in prow and 'Controle onbekend' in prow, (pst, prow))

        top = next((p for p in prof['places'] if 'Amstelpark' in p), '')
        check('A8', 'Topplekken: Amstelpark 3 waarnemingen · 3 soorten geregistreerd', '3 waarnemingen · 3 soorten geregistreerd' in top
              and all('geregistreerd' in p for p in prof['places']), prof['places'])

        page.set_viewport_size({'width': 320, 'height': 700})
        over = {}
        for r in ('home', 'profile', 'insights', 'species', 'journal'):
            nav(page, r, 1200)
            over[r] = page.evaluate("() => document.documentElement.scrollWidth - innerWidth")
        page.screenshot(path='/tmp/ux03r_a_insights_320.png')
        after = page.evaluate("() => localStorage.getItem('birdspot-sightings')")
        b, a = ({r['id']: r for r in json.loads(x)['sightings']} for x in (before, after))
        diff = {i: sorted(k for k in set(b[i]) | set(a[i]) if b[i].get(k) != a[i].get(k)) for i in b if b[i] != a[i]}
        # Bestaande migratie 2B: een kaartbezoek koppelt een waarneming met alleen een GPS-pin aan een plek (placeId van leeg naar id).
        # Alles daarbuiten, ook alle herkennings- en zekerheidsvelden, moet byte-gelijk blijven.
        only_2b = all(keys == ['placeId'] and b[i].get('placeId') is None and a[i].get('placeId') for i, keys in diff.items())
        check('A9', 'geen datawijziging (alleen bestaande 2B-plekkoppeling bij kaartbezoek), geen paginafouten, geen overloop op 320',
              only_2b and len(diff) <= 1 and not errors and not any(over.values()), (over, errors[:2], diff))
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03R-A: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 9 else 0)


if __name__ == '__main__':
    main()
