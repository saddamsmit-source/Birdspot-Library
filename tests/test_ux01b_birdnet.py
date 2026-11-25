#!/usr/bin/env python3
"""UX-01B (25-11-2026): BirdNET-suggestie is geen bevestiging; eigen controle is expliciet en apart.

N1  BirdNET-suggestie zonder controle → bron birdnet, suggestie, Mogelijk; suggestiedata bewaard; lijst/detail
    'BirdNET · suggestie'; telt niet mee
N2  met 'Zelf gecontroleerd' → birdnet/checked, Zeker; detail 'Zelf gecontroleerd' + 'geen onafhankelijke
    wetenschappelijke verificatie'; telt mee
N3  meerdere kandidaten: per soort eigen status; zelf toegevoegde soort = eigen herkenning
N4  geen suggestie (alleen zelf gekozen) → eigen herkenning, Zeker, geen soundSuggestion
N5  Merlin: suggestie en zelfcontrole; Merlin heeft voorrang op BirdNET bij dezelfde soort; BirdNET-controle verborgen
N6  opslaan/heropenen/bewerken: formulier toont bron en controle; controle aan → zeker; naar eigen herkenning →
    birdnetVerification weg, soundSuggestion blijft; suggestie + Zeker wordt geweigerd
N7  oude records (bron self + soundSuggestion): niet omgezet, detail 'Controle onbekend' met uitleg; telt sinds UX-03B niet mee
N8  export/import ZIP: bron, controle, zekerheid en suggestiedata identiek in een nieuw profiel
N9  offline: BirdNET-suggestie opslaan werkt zonder netwerk met dezelfde status
N10 tegenstrijdige combinaties (birdnet+zeker+niet gecontroleerd; birdnet+alleen gezien): zichtbaar gemeld,
    niet meegeteld, niet stil gewijzigd
"""
import json
import sys
import tempfile
import threading
import http.server
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import test_r3_audio as r3  # noqa: E402
import test_r3_zip_herstel as rz  # noqa: E402
from test_r4_merlin import (context, SEED_DRAFT, open_sound, open_merlin, tick, add_species, pin, rows,  # noqa: E402
                            detail_text)

RESULTS = []
MEREL, ROODBORST = 'sp045', 'sp050'
COUNTS = "async () => { const s = await import('/src/features/profile/stats.js'); return Object.fromEntries(" \
         "JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.map(r => [r.speciesName + '|' + r.id.slice(-5), s.countsForList(r)])); }"


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def seed(page, cands):
    wav = list(r3.make_wav(seconds=2, freq=2000))
    page.evaluate(SEED_DRAFT, {'wav': wav, 'candidates': [[sid, {'checked': False, 'match': {'score': sc, 'second': sec}}]
                                                          for sid, sc, sec in cands]})
    open_sound(page)


def pick(page, name, sec):
    page.get_by_role('checkbox', name=f'{name} BirdNET-suggestie · 00:0{sec}', exact=True).check()


def card_text(page, sid):
    r3.open_detail(page, sid)   # opent via kaartlijst; lijstkaart is dan zichtbaar geweest
    page.locator('#detailClose').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
    return page.locator(f'.sight-card[data-id="{sid}"]').inner_text()


def keyset(r):
    return {k: r.get(k) for k in ('identificationSource', 'birdnetVerification', 'merlinVerification', 'certainty', 'observationMethod')}


def run(browser, url, tmp):
    # ── N1 + N3 + N4: meerdere kandidaten, zonder controle, plus een eigen soort ──
    ctx, p, errors = context(browser, url)
    seed(p, [(MEREL, 0.81, 3), (ROODBORST, 0.64, 5)])
    pick(p, 'Merel', 3)
    pick(p, 'Roodborst', 5)
    tick(p, 'Roodborst: BirdNET-suggestie zelf gecontroleerd')
    add_species(p, 'Koolmees')
    pin(p)
    r = {x['speciesName']: x for x in rows(p)}
    merel, rood, kool = r.get('Merel', {}), r.get('Roodborst', {}), r.get('Koolmees', {})
    text = detail_text(p, merel['id'])
    card = card_text(p, merel['id'])
    counts = p.evaluate(COUNTS)
    check('N1', 'BirdNET zonder controle: birdnet/suggestie/Mogelijk, suggestiedata bewaard, label suggestie, telt niet',
          keyset(merel) == {'identificationSource': 'birdnet', 'birdnetVerification': 'suggested', 'merlinVerification': None,
                            'certainty': 'possible', 'observationMethod': 'heard'}
          and merel.get('soundSuggestion', {}).get('model') == 'BirdNET+ V3.0' and merel['soundSuggestion'].get('score') == 0.81
          and 'BirdNET · suggestie' in text and 'eigen controle is nog niet vastgelegd' in text and 'BirdNET · suggestie' in card
          and counts.get('Merel|' + merel['id'][-5:]) is False and 'bevestigd' not in (text + card).replace('niet bevestigd', ''),
          keyset(merel))
    text_r = detail_text(p, rood['id'])
    check('N2', 'BirdNET met eigen controle: birdnet/checked/Zeker, detail zegt geen wetenschappelijke verificatie, telt mee',
          keyset(rood) == {'identificationSource': 'birdnet', 'birdnetVerification': 'checked', 'merlinVerification': None,
                           'certainty': 'certain', 'observationMethod': 'heard'}
          and 'BirdNET · zelf gecontroleerd' in text_r and 'geen onafhankelijke wetenschappelijke verificatie' in text_r
          and counts.get('Roodborst|' + rood['id'][-5:]) is True, keyset(rood))
    check('N3', 'meerdere kandidaten: eigen status per soort',
          merel.get('birdnetVerification') == 'suggested' and rood.get('birdnetVerification') == 'checked' and len(r) == 3)
    check('N4', 'zelf toegevoegde soort zonder suggestie: eigen herkenning, Zeker, geen soundSuggestion',
          keyset(kool) == {'identificationSource': 'self', 'birdnetVerification': None, 'merlinVerification': None,
                           'certainty': 'certain', 'observationMethod': 'heard'} and 'soundSuggestion' not in kool, keyset(kool))

    # ── N6: bewerken ──
    r3.edit_from_detail(p, merel['id'])
    form = p.locator('#addSheetContent')
    radio = form.get_by_role('radio', name='BirdNET-suggestie')
    form_ok = radio.is_checked() and not p.locator('#sightBirdnetChecked').is_checked() and 'geen bevestiging' in form.inner_text()
    p.locator('#certaintyGroup input[value="certain"]').check(force=True)
    p.locator('#addSheetSubmit').click()
    p.wait_for_timeout(400)
    refused = p.locator('#addSightingSheet.open').count() == 1 and 'BirdNET-suggestie is niet automatisch zeker' in p.locator('.toast:not(.app-update)').inner_text()
    p.locator('#sightBirdnetChecked').check()
    r3.save(p)
    m2 = next(x for x in rows(p) if x['id'] == merel['id'])
    r3.edit_from_detail(p, merel['id'])
    p.locator('#addSheetContent').get_by_role('radio', name='Eigen herkenning').check()
    r3.save(p)
    m3 = next(x for x in rows(p) if x['id'] == merel['id'])
    check('N6', 'bewerken: bron/controle zichtbaar, suggestie+Zeker geweigerd, controle → zeker; eigen herkenning wist controle, suggestiedata blijft',
          form_ok and refused and m2['birdnetVerification'] == 'checked' and m2['certainty'] == 'certain'
          and m3['identificationSource'] == 'self' and m3['birdnetVerification'] is None
          and m3.get('soundSuggestion', {}).get('score') == 0.81 and not errors,
          f"na controle={keyset(m2)} na eigen={keyset(m3)}")

    # ── N8: export/import ZIP ──
    before = {x['id']: x for x in rows(p)}
    zpath = rz.export(p, str(Path(tmp) / 'ux01b.zip'))
    ctx.close()
    ctx2, q = rz.new_profile(browser, url)
    rz.import_zip(q, zpath)
    after = {x['id']: x for x in q.evaluate(r3.SIGHTINGS)}
    fields = ('identificationSource', 'birdnetVerification', 'merlinVerification', 'certainty', 'soundSuggestion', 'observationMethod')
    same = set(after) == set(before) and all({k: before[i].get(k) for k in fields} == {k: after[i].get(k) for k in fields} for i in before)
    check('N8', 'ZIP export → import nieuw profiel: bron, controle, zekerheid en suggestiedata identiek', same,
          f"{len(after)} records")
    ctx2.close()

    # ── N5: Merlin, voorrang en verborgen BirdNET-controle ──
    ctx, p, errors = context(browser, url)
    seed(p, [(MEREL, 0.81, 3)])
    open_merlin(p)
    pick(p, 'Merel', 3)
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    bn_visible_before = p.get_by_role('checkbox', name='Merel: BirdNET-suggestie zelf gecontroleerd', exact=True).is_visible()
    tick(p, 'Merel: Merlin gaf deze soort')
    bn_hidden = not p.get_by_role('checkbox', name='Merel: BirdNET-suggestie zelf gecontroleerd', exact=True).is_visible()
    add_species(p, 'Roodborst')
    tick(p, 'Roodborst: Merlin gaf deze soort')
    tick(p, 'Roodborst: Merlin-suggestie zelf gecontroleerd')
    pin(p)
    r = {x['speciesName']: x for x in rows(p)}
    check('N5', 'Merlin-suggestie en -zelfcontrole; Merlin heeft voorrang op BirdNET; BirdNET-controle dan verborgen',
          bn_visible_before and bn_hidden
          and keyset(r['Merel']) == {'identificationSource': 'merlin', 'birdnetVerification': None, 'merlinVerification': 'suggested',
                                     'certainty': 'possible', 'observationMethod': 'heard'}
          and r['Merel'].get('soundSuggestion', {}).get('model') == 'BirdNET+ V3.0'
          and r['Roodborst']['merlinVerification'] == 'checked' and r['Roodborst']['certainty'] == 'certain' and not errors,
          f"Merel={keyset(r['Merel'])}")
    ctx.close()

    # ── N9: offline ──
    ctx, p, errors = context(browser, url, offline=True)
    seed(p, [(MEREL, 0.7, 4)])
    pick(p, 'Merel', 4)
    pin(p)
    m = rows(p)[0]
    check('N9', 'offline: BirdNET-suggestie opgeslagen als suggestie/Mogelijk',
          m['identificationSource'] == 'birdnet' and m['birdnetVerification'] == 'suggested' and m['certainty'] == 'possible' and not errors)
    ctx.close()

    # ── N7 + N10: oude en tegenstrijdige records ──
    ctx, p, errors = context(browser, url)
    base = {'speciesId': MEREL, 'speciesName': 'Merel', 'date': '2026-11-01', 'time': '08:00', 'count': 1, 'photoIds': [],
            'lat': None, 'lon': None, 'createdAt': '2026-11-01T08:00:00.000Z', 'updatedAt': '2026-11-01T08:00:00.000Z',
            'soundSuggestion': {'model': 'BirdNET+ V3.0', 'score': 0.7, 'second': 2}}
    recs = [
        {**base, 'id': 'legacy-1', 'observationMethod': 'heard', 'identificationSource': 'self', 'merlinVerification': None, 'certainty': 'certain'},
        {**base, 'id': 'conflict-1', 'observationMethod': 'heard', 'identificationSource': 'birdnet', 'birdnetVerification': 'suggested', 'certainty': 'certain'},
        {**base, 'id': 'conflict-2', 'observationMethod': 'seen', 'identificationSource': 'birdnet', 'birdnetVerification': 'checked', 'certainty': 'certain'},
    ]
    p.evaluate("""recs => { localStorage.setItem('birdspot-sightings', JSON.stringify({ version: 2, sightings: recs })); }""", recs)
    p.reload()
    rz.boot(p, url)
    stored_before = {x['id']: x for x in rows(p)}
    t_legacy = detail_text(p, 'legacy-1')
    t_conf = detail_text(p, 'conflict-1')
    counts = p.evaluate(COUNTS)
    r3.edit_from_detail(p, 'legacy-1')
    legacy_form = p.locator('#addSheetContent').inner_text()
    legacy_radio = p.locator('#addSheetContent').get_by_role('radio', name='Eigen herkenning').is_checked()
    p.locator('#addSheetCancel').click()
    p.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
    r3.edit_from_detail(p, 'conflict-2')
    p.locator('#addSheetSubmit').click()
    p.wait_for_timeout(400)
    conflict_refused = p.locator('#addSightingSheet.open').count() == 1 and 'gehoorde' in p.locator('.toast:not(.app-update)').inner_text()
    p.locator('#addSheetCancel').click()
    if p.locator('#sightingLeaveDialog').count():
        p.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
    p.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
    stored_after = {x['id']: x for x in rows(p)}
    unchanged = all(json.dumps(stored_after[i], sort_keys=True) == json.dumps(stored_before[i], sort_keys=True) for i in stored_before)
    check('N7', 'oud record (self + BirdNET-suggestie): niet omgezet, Controle onbekend met uitleg in detail en formulier, telt niet mee (UX-03B)',
          unchanged and stored_after['legacy-1']['identificationSource'] == 'self' and 'oudere waarneming' in t_legacy
          and 'Controle onbekend' in t_legacy and legacy_radio and 'BirdNET-suggestie bewaard' in legacy_form
          and counts.get('Merel|acy-1') is False and not errors, f"tellen={counts}")
    check('N10', 'tegenstrijdig: suggestie+Zeker gemeld en niet geteld; BirdNET bij alleen gezien niet opslaanbaar; niets stil gewijzigd',
          'niet zelf gecontroleerd' in t_conf and counts.get('Merel|ict-1') is False and conflict_refused and unchanged,
          f"tellen={counts}")
    ctx.close()


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-ux01b-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), rz.Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream',
                                                              '--autoplay-policy=no-user-gesture-required'])
            try:
                run(browser, url, tmp)
            except Exception as error:
                import traceback
                RESULTS.append(('ERR', False))
                print(f"STAP-FOUT {type(error).__name__}: {str(error)[:300]}", flush=True)
                print(''.join(traceback.format_exc().splitlines(True)[-6:]), flush=True)
            browser.close()
        server.shutdown()
    passed = sum(1 for _, ok in RESULTS if ok)
    total = max(len(RESULTS), 10)
    print(f"UX-01B: {passed}/{total} {'PASS' if passed == total else 'FAIL'}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
