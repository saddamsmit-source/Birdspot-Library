#!/usr/bin/env python3
"""RB-01A (26-11-2026): echte service-worker-upgrade 1.27.32 → releasekandidaat op dezelfde origin.

Dezelfde lokale origin serveert eerst de vorige kandidaat (git-ref `521fba8`, APP_VERSION 1.27.32) en daarna de werkkopie.
Alle gegevens zijn fictief en worden door de oude versie in de opslag gezet.

U1  basisversie draait als 1.27.32: Profiel › Over de app, app-cache birdspot-app-v1.27.32, mediacache met testitem
U2  na omschakelen is de nieuwe versie actief (sw.js én Profiel tonen APP_VERSION van de werkkopie)
U3  gebruikersgegevens in localStorage byte-gelijk: waarnemingen (eigen, BirdNET/Merlin suggestie en zelf gecontroleerd,
    historisch 'controle onbekend', zonder bron), plekken, concepten, gezien-lijst
U4  IndexedDB onveranderd: foto- en audioblobs (inhoud, velden) en plekkenstore
U5  caches: alleen de nieuwe app-cache blijft over; mediacache en het testitem blijven bewaard
U6  nieuwe UI toont de bestaande gegevens: statuslabels, telregel (5 soorten op je lijst); concept van de oude versie hervat
    met soort en plek, daarna weer bewaard
U7  offline herladen na de update: app start op de nieuwe versie, lijst en detail openen, soortkaart met gedecodeerde gidsfoto
U8  schone installatie van de kandidaat: precache compleet ('basis offline beschikbaar'), daarna offline starten werkt
U9  geen paginafouten
"""
import http.server
import io
import json
import re
import subprocess
import sys
import tarfile
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'tests'))
from ux02_fixtures import SIGHTINGS, PLACES  # noqa: E402

BASE_REF = sys.argv[sys.argv.index('--base') + 1] if '--base' in sys.argv else '521fba8'
NEW_VERSION = re.search(r"const APP_VERSION = '([^']+)'", (ROOT / 'sw.js').read_text(encoding='utf-8')).group(1)
SERVE = {'dir': None}
RESULTS = []

DATA = [dict(s, photoIds=(['rbf1'] if s['id'] == 's01' else []), audioIds=(['rba1'] if s['id'] == 's05' else [])) for s in SIGHTINGS]
# concept in het echte UX-01-formaat (sightingDraft.js): één 'new'-concept, alleen gegevensvelden
DRAFTS = {'new': {'key': 'new', 'savedAt': '2026-11-25T10:00:00.000Z', 'baseUpdatedAt': None, 'pendingPhotos': 0, 'pendingAudio': 0,
                  'fields': {'speciesId': 'sp075', 'speciesName': 'IJsvogel', 'date': '2026-11-25', 'count': 1, 'certainty': 'certain',
                             'observationMethod': 'seen', 'identificationSource': 'self', 'locationName': 'Conceptplek RB-01', 'notes': 'concept'}}}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=SERVE['dir'], **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def extract(ref, dest):
    data = subprocess.run(['git', 'archive', '--format=tar', ref], cwd=ROOT, check=True, capture_output=True).stdout
    with tarfile.open(fileobj=io.BytesIO(data)) as tar:
        tar.extractall(dest, filter='data')


def wait_ready(p):
    p.locator('#birdspotSplash').wait_for(state='detached', timeout=20000)


def version_text(p):
    p.locator('.nav-item[data-route="profile"]').click()
    p.wait_for_function("() => { const e = document.querySelector('#appVersion'); return e && !/ophalen/.test(e.textContent); }", timeout=15000)
    return p.locator('#appVersion').inner_text()


SNAP = """async () => {
  const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
  const db = await new Promise((res, rej) => { const r = indexedDB.open('birdspot-library'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const all = async store => db.objectStoreNames.contains(store) ? await new Promise((res, rej) => { const q = db.transaction(store).objectStore(store).getAll(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }) : null;
  const media = [];
  for (const r of (await all('photos')) || []) { const { blob, ...rest } = r; media.push({ ...rest, blobText: blob ? await blob.text() : null, blobType: blob?.type }); }
  const places = await all('places');
  db.close();
  const keys = await caches.keys();
  const mc = await caches.open('birdspot-media');
  const probe = await mc.match('/__rb01-mediaprobe');
  return { ls, media: media.sort((a, b) => a.id.localeCompare(b.id)), places: (places || []).sort((a, b) => a.id.localeCompare(b.id)),
           caches: keys.sort(), probe: probe ? await probe.text() : null };
}"""

SEED = """async ({ sightings, places, drafts }) => {
  localStorage.setItem('birdspot-sightings', JSON.stringify({ schemaVersion: 2, sightings }));
  localStorage.setItem('birdspot-places', JSON.stringify({ places }));
  localStorage.setItem('birdspot-sighting-drafts', JSON.stringify(drafts));
  localStorage.setItem('birdspot-seen-species', JSON.stringify(['sp045', 'sp029']));
  localStorage.setItem('birdspot-welcome-seen', '1');
  const db = await new Promise((res, rej) => { const r = indexedDB.open('birdspot-library'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise((res, rej) => { const tx = db.transaction(['photos', 'places'], 'readwrite');
    tx.objectStore('photos').put({ id: 'rbf1', blob: new Blob(['rb01-foto-bytes'], { type: 'image/jpeg' }), type: 'image/jpeg', filename: 'merel.jpg',
      speciesId: 'sp045', sightingId: 's01', addedAt: 1764100000000 });
    tx.objectStore('photos').put({ id: 'rba1', kind: 'sighting-audio', blob: new Blob(['rb01-audio-bytes'], { type: 'audio/webm' }), type: 'audio/webm',
      filename: 'zang.webm', size: 16, sightingId: 's05', addedAt: 1764100000001 });
    for (const p of places) tx.objectStore('places').put(p);
    tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
  const mc = await caches.open('birdspot-media');
  await mc.put('/__rb01-mediaprobe', new Response('mediacache-blijft', { headers: { 'Content-Type': 'text/plain' } }));
}"""


def main():
    errors = []
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / 'base'
        base.mkdir()
        extract(BASE_REF, base)
        base_version = re.search(r"const APP_VERSION = '([^']+)'", (base / 'sw.js').read_text(encoding='utf-8')).group(1)
        SERVE['dir'] = str(base)
        srv = Server(('127.0.0.1', 0), Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{srv.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Europe/Amsterdam')
            p = ctx.new_page()
            p.on('pageerror', lambda e: errors.append(str(e)))
            p.goto(url, wait_until='domcontentloaded')
            wait_ready(p)
            p.evaluate(SEED, {'sightings': DATA, 'places': PLACES, 'drafts': DRAFTS})
            p.reload(wait_until='domcontentloaded')
            wait_ready(p)
            p.wait_for_timeout(1500)
            v_old = version_text(p)
            before = p.evaluate(SNAP)
            check('U1', f'basisversie {base_version} ({BASE_REF}) actief met app-cache en mediacache-testitem',
                  base_version != NEW_VERSION and base_version in v_old and f'birdspot-app-v{base_version}' in before['caches']
                  and before['probe'] == 'mediacache-blijft' and len(json.loads(before['ls']['birdspot-sightings'])['sightings']) == len(DATA),
                  (v_old, before['caches']))

            # ── omschakelen naar de werkkopie op dezelfde origin ──────
            SERVE['dir'] = str(ROOT)
            seen, used_button, attempt = None, False, 0
            for attempt in range(8):
                p.reload(wait_until='domcontentloaded')
                wait_ready(p)
                p.wait_for_timeout(2500)
                sw_text = p.evaluate("() => fetch('sw.js', {cache: 'no-store'}).then(r => r.text())")
                seen = version_text(p)
                if NEW_VERSION in seen and f"'{NEW_VERSION}'" in sw_text:
                    break
                upd = p.locator('#appUpdate')
                if upd.count() and upd.is_visible():
                    used_button = True
                    with p.expect_navigation(timeout=20000):
                        upd.click()
                    wait_ready(p)
                    continue
                p.locator('.nav-item[data-route="home"]').click()
            check('U2', f'nieuwe versie {NEW_VERSION} actief op dezelfde origin', NEW_VERSION in (seen or ''),
                  f"{seen} na {attempt + 1} herlaadbeurt(en){' en de updateknop' if used_button else ''}")
            p.wait_for_timeout(1500)
            after = p.evaluate(SNAP)

            user_keys = ['birdspot-sightings', 'birdspot-places', 'birdspot-sighting-drafts', 'birdspot-seen-species']
            changed = [k for k in user_keys if before['ls'].get(k) != after['ls'].get(k)]
            gone = sorted(set(before['ls']) - set(after['ls']))
            check('U3', 'localStorage: waarnemingen (alle herkenningssoorten), plekken, concepten en gezien-lijst byte-gelijk; geen sleutel verdwenen',
                  not changed and not gone, {'gewijzigd': changed, 'verdwenen': gone})
            check('U4', 'IndexedDB: foto- en audioblob en plekkenstore onveranderd',
                  after['media'] == before['media'] and len(after['media']) == 2 and after['places'] == before['places'],
                  [m['id'] for m in after['media']])
            app_caches = [c for c in after['caches'] if c.startswith('birdspot-app-')]
            check('U5', 'caches: alleen birdspot-app-v' + NEW_VERSION + ' over; mediacache en testitem bewaard',
                  app_caches == [f'birdspot-app-v{NEW_VERSION}'] and 'birdspot-media' in after['caches'] and after['probe'] == 'mediacache-blijft',
                  after['caches'])

            # ── U6 nieuwe UI met bestaande gegevens ───────────────────
            p.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('sightings', { force: true }); }")
            p.locator('#sightingCards .sight-card').first.wait_for(timeout=10000)
            pills = p.evaluate("() => Object.fromEntries([...document.querySelectorAll('.sight-card')].map(c => [c.dataset.id, c.querySelector('.sighting-status-pill')?.textContent.trim() || null]))")
            p.locator('#fab').click()
            p.locator('[data-quick-action="seen"]').click()
            resume = p.get_by_role('button', name='Concept hervatten')
            resume.wait_for(timeout=10000)
            resume.click()
            p.locator('#addSightingSheet.open').wait_for(timeout=10000)
            p.wait_for_timeout(500)
            drafts_ui = p.locator('#speciesPickerBtn').inner_text() + ' | ' + p.locator('#sightLocation').input_value()
            p.locator('#addSheetCancel').click()
            p.wait_for_timeout(500)
            if p.locator('#sightingLeaveDialog').count():
                p.locator('#sightingLeaveDialog').get_by_role('button', name=re.compile('Concept bewaren')).click()
            p.locator('#addSightingSheet').wait_for(state='detached', timeout=10000)
            p.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('profile', { force: true }); }")
            p.wait_for_timeout(1200)
            lists = ' | '.join(p.eval_on_selector_all('.profile-stats--lists .profile-stat', "els => els.map(e => e.innerText.replace(/\\s+/g, ' '))"))
            check('U6', "nieuwe UI: 'Controle onbekend' / 'BirdNET · zelf gecontroleerd', 5 soorten op je lijst, concept zichtbaar",
                  pills.get('s06') == 'Controle onbekend' and pills.get('s05') == 'BirdNET · zelf gecontroleerd' and pills.get('s04') == 'BirdNET · suggestie'
                  and '5 soorten op je lijst' in lists and 'IJsvogel' in drafts_ui and 'Conceptplek RB-01' in drafts_ui, (pills.get('s06'), pills.get('s05'), lists, drafts_ui))

            # ── U7 offline na de update ───────────────────────────────
            ctx.set_offline(True)
            p.reload(wait_until='domcontentloaded')
            wait_ready(p)
            v_off = version_text(p)
            p.evaluate("async () => { const a = await import('/src/app.js'); a.navigate('sightings', { force: true }); }")
            p.locator('#sightingCards .sight-card').first.wait_for(timeout=10000)
            n_cards = p.locator('#sightingCards .sight-card').count()
            p.locator('.sight-card[data-id="s06"]').click()
            p.locator('#detailSightingSheet.open').wait_for(timeout=8000)
            detail_ok = 'Controle onbekend' in p.locator('#detailSightingSheet').inner_text()
            p.locator('#detailClose').click()
            p.evaluate("async () => { sessionStorage.setItem('birdspot-open-species', 'sp094'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }")
            img_ok = True
            try:
                p.wait_for_function("() => [...document.querySelectorAll('img')].some(i => /sp094/.test(i.currentSrc || i.src) && i.complete && i.naturalWidth > 0)", timeout=12000)
            except Exception:
                img_ok = False
            same_off = p.evaluate("() => localStorage.getItem('birdspot-sightings')") == before['ls']['birdspot-sightings']
            ctx.set_offline(False)
            check('U7', f'offline na update: start op {NEW_VERSION}, {len(DATA)} kaarten, detail en gidsfoto, gegevens gelijk',
                  NEW_VERSION in v_off and n_cards == len(DATA) and detail_ok and img_ok and same_off, (v_off, n_cards, detail_ok, img_ok))
            ctx.close()

            # ── U8 schone installatie ─────────────────────────────────
            ctx2 = browser.new_context(viewport={'width': 390, 'height': 844})
            p2 = ctx2.new_page()
            p2.on('pageerror', lambda e: errors.append(str(e)))
            p2.goto(url, wait_until='domcontentloaded')
            wait_ready(p2)
            p2.wait_for_function("async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active); }", timeout=20000)
            v_clean = ''
            for _ in range(10):
                v_clean = version_text(p2)
                if 'basis offline beschikbaar' in v_clean:
                    break
                p2.wait_for_timeout(1500)
                p2.locator('.nav-item[data-route="home"]').click()
            ctx2.set_offline(True)
            p2.reload(wait_until='domcontentloaded')
            wait_ready(p2)
            v_clean_off = version_text(p2)
            caches2 = p2.evaluate("() => caches.keys()")
            ctx2.close()
            check('U8', "schone installatie: 'Versie " + NEW_VERSION + " · basis offline beschikbaar', daarna offline starten",
                  f'Versie {NEW_VERSION} · basis offline beschikbaar' in v_clean and NEW_VERSION in v_clean_off
                  and f'birdspot-app-v{NEW_VERSION}' in caches2, (v_clean, v_clean_off))
            browser.close()
        srv.shutdown()
    check('U9', 'geen paginafouten', not errors, errors[:3])
    failed = [c for c, ok in RESULTS if not ok]
    print(f"RB-01 upgrade {BASE_REF} → {NEW_VERSION}: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 9 else 0)


if __name__ == '__main__':
    main()
