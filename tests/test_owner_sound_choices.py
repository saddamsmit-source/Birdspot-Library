#!/usr/bin/env python3
"""Owner UX sound decisions on real local Chromium: no implicit draft, explicit species / both, ZIP recovery.
This checks the frontend, fake microphone and separate browser profiles; physical Samsung NOT TESTED.
"""
import json
import threading
import tempfile
import zipfile
from pathlib import Path

from playwright.sync_api import expect, sync_playwright
from test_quick_add_merlin import Server, Quiet, open_sound, add_species, rows, DATE
from test_r2b_places_env_zip import profile, try_import

# Read the true IndexedDB state, including Blob byte lengths, without using UI counts as a proxy.
MEDIA = """async () => {
 const db = await (await import('/src/data/db.js')).getDB();
 return await new Promise((resolve, reject) => {
   const req = db.transaction('photos','readonly').objectStore('photos').getAll();
   req.onsuccess = () => resolve(req.result.map(p => ({
     id:p.id, kind:p.kind, personalSpecies:p.personalSpecies === true, sightingId:p.sightingId ?? null,
     speciesId:p.speciesId ?? null, bytes:p.blob?.size ?? 0
   })));
   req.onerror = () => reject(req.error);
 });
}"""
DRAFT = """async () => {
  const db = await new Promise((resolve, reject) => {
    const r = indexedDB.open('birdspot-sound-drafts', 1);
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
    r.onupgradeneeded = () => r.result.createObjectStore('sessions');
  });
  return await new Promise((resolve, reject) => {
    const req = db.transaction('sessions').objectStore('sessions').get('current');
    req.onsuccess = () => resolve(req.result ? { id: req.result.id, bytes: req.result.clip?.size } : null);
    req.onerror = () => reject(req.error);
  });
}"""


def capture(page):
    sheet = open_sound(page)
    record = sheet.locator('#soundRecord')
    assert record.count() == 1, 'Er mag precies één Start/Stop-knop zijn'
    rect = record.bounding_box()
    assert rect and rect['y'] >= 400 and rect['y'] + rect['height'] <= 844, ('niet binnen duimbereik', rect)
    record.click()
    expect(record).to_have_text('Stop opname')
    expect(sheet.locator('#soundElapsed')).to_have_text('00:01', timeout=15000)
    record.click()
    expect(sheet.locator('#soundPlayback')).to_be_visible(timeout=15000)
    expect(record).to_have_text('Opname gestopt')
    assert page.evaluate(DRAFT) is None, 'Stop opname mag niet automatisch permanent concept bewaren'
    return sheet


def context(browser, url):
    ctx = browser.new_context(viewport={'width':390,'height':844},
        timezone_id='Europe/Amsterdam', reduced_motion='reduce',
        geolocation={'latitude':51.9244,'longitude':4.4777,'accuracy':8},
        permissions=['microphone','geolocation'], service_workers='block', accept_downloads=True)
    page = ctx.new_page()
    page.clock.set_fixed_time(DATE)
    page.goto(url, wait_until='domcontentloaded')
    page.locator('#birdspotSplashSkip').click()
    return ctx, page


def run():
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw, tempfile.TemporaryDirectory() as td:
            browser = pw.chromium.launch(headless=True, args=[
                '--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'
            ])
            ctx, page = context(browser, url)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))

            # S01: nothing persists after stop unless user chooses.
            sheet = capture(page)
            sheet.get_by_role('button', name='Sluiten').click()
            expect(sheet.locator('#soundExitPrompt')).to_be_visible()
            sheet.locator('[data-sound-exit="continue"]').click()
            expect(sheet.locator('#soundExitPrompt')).to_be_hidden()
            sheet.get_by_role('button', name='Sluiten').click()
            sheet.locator('[data-sound-exit="discard"]').click()
            expect(sheet).to_have_count(0)
            assert page.evaluate(DRAFT) is None and not rows(page)
            print('S01 PASS — Stop = vluchtig; expliciet verwijderen laat geen concept of waarneming achter', flush=True)

            # S02: save to personal species without inventing a dated sighting.
            sheet = capture(page)
            add_species(sheet, ['Merel'])
            expect(sheet.locator('#soundAttachSpecies')).to_be_visible(timeout=25000)
            sheet.locator('#soundAttachSpecies').check()
            expect(sheet.locator('#soundVerify')).to_be_visible()
            expect(sheet.locator('#soundSave')).to_be_disabled()
            sheet.locator('#soundVerify').check()
            expect(sheet.locator('#soundSave')).to_have_text('Bewaar bij mijn soortgeluiden')
            sheet.locator('#soundSave').click()
            expect(sheet).to_have_count(0)
            assert not rows(page), 'Soort-only mag geen fictieve waarneming maken'
            record_list = [r for r in page.evaluate(MEDIA) if r['personalSpecies']]
            assert len(record_list)==1 and record_list[0]['speciesId']=='sp045' and record_list[0]['sightingId'] is None
            assert record_list[0]['bytes']>44
            audio_id=record_list[0]['id']
            page.locator('.nav-item[data-route="species"]').click()
            page.locator('#speciesSearch').fill('Merel')
            page.locator('.species-row[data-id="sp045"] .species-row__body').click()
            card=page.get_by_role('dialog', name='Merel', exact=True)
            expect(card.locator('#speciesOwnAudioSection')).to_be_visible()
            expect(card.locator('#speciesOwnAudioList audio[controls]')).to_have_count(1)
            card.get_by_role('button', name='Sluit soortdetail').click()
            print('S02 PASS — persoonlijke Merelopname zonder waarneming, terugvindbaar in soortkaart', flush=True)

            # S03: export personal species media + restore into fresh, unrelated browser profile.
            profile(page)
            zip_file=Path(td)/'persoonlijke-vogels.zip'
            with page.expect_download(timeout=35000) as ev:
                page.locator('#btnExport').click()
            ev.value.save_as(str(zip_file))
            with zipfile.ZipFile(zip_file) as z:
                data=json.loads(z.read('gegevens.json'))
                own=[m for m in data['mediaMeta'] if m.get('personalSpecies')]
                assert len(own)==1 and own[0]['id']==audio_id and own[0]['speciesId']=='sp045'
                assert own[0].get('sightingId') is None
                sound_paths=[x for x in z.namelist() if audio_id in x]
                assert len(sound_paths)==1 and len(z.read(sound_paths[0]))>44
                source_bytes=z.read(sound_paths[0])
            ctx2,page2=context(browser,url)
            profile(page2)
            assert try_import(page2,str(zip_file))
            page2.wait_for_timeout(500)
            copied=[r for r in page2.evaluate(MEDIA) if r['personalSpecies']]
            assert len(copied)==1 and copied[0]['id']==audio_id and copied[0]['bytes']==len(source_bytes)
            assert not rows(page2)
            print('S03 PASS — ZIP bevat privésoortopname; schoon tweede profiel herstelt de relatie en bytes',flush=True)
            ctx2.close()

            # S04: both destinations refer to one existing blob, not duplicates.
            page.locator('.nav-item[data-route="home"]').click()
            sheet=capture(page)
            add_species(sheet,['Koolmees'])
            expect(sheet.locator('#soundAttach')).to_be_visible(timeout=25000)
            sheet.locator('#soundAttach').check()
            sheet.locator('#soundAttachSpecies').check()
            sheet.locator('#soundVerify').check()
            expect(sheet.locator('#soundSave')).to_have_text('Bewaar bij waarneming én soort')
            sheet.locator('#soundSave').click()
            expect(sheet).to_have_count(0)
            recent=rows(page)
            assert len(recent)==1 and recent[0]['speciesId']=='sp029'
            both_id=recent[0]['audioIds'][0]
            found=[r for r in page.evaluate(MEDIA) if r['id']==both_id]
            assert len(found)==1 and found[0]['speciesId']=='sp029' and found[0]['sightingId']==recent[0]['id']
            print('S04 PASS — beide bestemmingen verwijzen naar één audio-blob',flush=True)

            assert not errors,errors
            ctx.close()
            browser.close()


if __name__=='__main__':
    run()
