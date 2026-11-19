"""Ronde 4/4 — optionele Merlin-dubbelcheck binnen Geluid herkennen (mobiel Chromium, 390 px).

Echte opname met een virtuele microfoon; de handoff naar Merlin is GESIMULEERD met een vervanging van de
officiële Web Share API (navigator.canShare/share). Dit bewijst Birdspots kant van de route, niet de echte
appwisseling naar Merlin op Android/iOS (NOT TESTED zonder toestel).

M1  + houdt twee keuzes → opnemen → delen (alleen een WAV, geen plek of tekst; concept met datum, tijd en plek
    vóór het delen bewaard) → appwisseling → terug → Merlin-soort aanvinken → opslaan. Daarna: Gehoord ·
    Merlin-suggestie · Mogelijk, oorspronkelijke datum/tijd/plek. Na heropenen terug te vinden; concept opgeruimd.
M2  Herstel na afsluiten (herladen): het concept opent opnieuw, met de oorspronkelijke datum en tijd, ook als de
    klok verder loopt. Daarna Gezien en gehoord + zelf gecontroleerd → Zeker. Bijlage via het R08-model: dezelfde
    WAV-bytes als gedeeld, offline afspelen, ZIP herstelt in schoon profiel.
M3  Verschil: BirdNET stelt Merel voor, Merlin geeft Zanglijster → de melding toont het verschil; de gebruiker
    pint alleen Zanglijster; de BirdNET-suggestie wordt niet opgeslagen.
M4  Overeenstemming: BirdNET en Merlin noemen Merel → melding; opgeslagen met de bron Merlin en de BirdNET-suggestie.
M5  Delen geannuleerd (bv. geen Merlin in het deelmenu) → melding, niets opgeslagen, concept blijft; verder zonder
    Merlin → eigen herkenning, Zeker.
M6  Geen deelfunctie in de browser → geen deelknop, handmatige route zichtbaar; Merlin zelf gebruikt → bron Merlin.
M7  Offline: opnemen, delen, opslaan en heropenen in de app werken zonder netwerk (herladen zonder netwerk vraagt de
    service worker; die is hier geblokkeerd en apart getest in PILOT-01..04).
M8  Microfoon en GPS geweigerd → geen opname/deelknop; handmatige Merlin-route + kaartpin → opgeslagen.
M9  Opnieuw proberen na een opslagfout: geen losse opname na de fout; daarna precies 1 waarneming, 1 pin en 1 opname.
    Bijlage bij meerdere soorten is uitgeschakeld met uitleg.
"""
import hashlib
import http.server
import struct
import sys
import tempfile
import threading
from datetime import datetime, timedelta, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
import test_r3_audio as r3  # noqa: E402
import test_r3_zip_herstel as rz  # noqa: E402
import test_r3_vervolg as rv  # noqa: E402

RESULTS = []
DATE = datetime(2026, 11, 15, 13, 42, tzinfo=timezone.utc)    # 14:42 in Amsterdam
GPS = {'latitude': 51.9244, 'longitude': 4.4777, 'accuracy': 8}
SHARE_STUB = """(() => {
  window.__share = { mode: 'ok', calls: [] };      // ok | abort | none
  const hex = buf => [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
  const readDraft = () => new Promise(res => {
    const r = indexedDB.open('birdspot-sound-drafts', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('sessions');
    r.onsuccess = () => { const db = r.result; const g = db.transaction('sessions').objectStore('sessions').get('current');
      g.onsuccess = () => { res(g.result || null); db.close(); }; g.onerror = () => { res(null); db.close(); }; };
    r.onerror = () => res(null);
  });
  Object.defineProperty(navigator, 'canShare', { configurable: true,
    value: data => window.__share.mode !== 'none' && Array.isArray(data?.files) && data.files.length > 0 && data.files.every(f => f instanceof File) });
  Object.defineProperty(navigator, 'share', { configurable: true, value: async data => {
    if (window.__share.mode === 'none') throw new TypeError('niet beschikbaar');
    const draft = await readDraft();
    const file = data.files[0], buf = await file.arrayBuffer();
    window.__share.calls.push({ keys: Object.keys(data).sort(), name: file.name, type: file.type, size: buf.byteLength,
      head: [...new Uint8Array(buf.slice(0, 44))], sha: hex(await crypto.subtle.digest('SHA-256', buf)),
      draft: draft && { date: draft.date, time: draft.time, coordinates: draft.coordinates, clip: !!draft.clip } });
    if (window.__share.mode === 'abort') throw new DOMException('Share canceled', 'AbortError');
  } });
  const gum = navigator.mediaDevices?.getUserMedia?.bind(navigator.mediaDevices);
  if (gum) navigator.mediaDevices.getUserMedia = async c => (window.testStream = await gum(c));
})();"""
APP_SWITCH = """hidden => {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => hidden ? 'hidden' : 'visible' });
  document.dispatchEvent(new Event('visibilitychange'));
}"""
PLACES = "async () => { const m = await import('/src/data/places.js'); await m.ensurePlaces(); return m.loadPlaces().length; }"
SEED_DRAFT = """async ({ wav, candidates }) => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('birdspot-sound-drafts', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('sessions'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise((res, rej) => { const t = db.transaction('sessions', 'readwrite');
    t.objectStore('sessions').put({ id: crypto.randomUUID(), clip: new Blob([new Uint8Array(wav)], { type: 'audio/wav' }), seconds: 3,
      levels: [0.2, 0.5, 0.3], candidates, coordinates: { lat: 51.9244, lon: 4.4777, pinAccuracyM: 8, accuracyExactM: 8 },
      positionOrigin: 'GPS', placeChoice: null, date: '2026-11-15', time: '14:42', name: '', notes: '' }, 'current');
    t.oncomplete = res; t.onerror = () => rej(t.error); });
  db.close();
}"""
DRAFT_EXISTS = """() => new Promise(res => { const r = indexedDB.open('birdspot-sound-drafts', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('sessions');
  r.onsuccess = () => { const g = r.result.transaction('sessions').objectStore('sessions').get('current');
    g.onsuccess = () => { res(!!g.result); r.result.close(); }; }; })"""
FAIL_ONCE = """() => { const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function (key, value) {
    if (key === 'birdspot-sightings') { Storage.prototype.setItem = original; throw new DOMException('Testopslag vol', 'QuotaExceededError'); }
    return original.call(this, key, value); }; }"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


def context(browser, url, offline=False, gps=True):
    ctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True,
                              timezone_id='Europe/Amsterdam', reduced_motion='reduce', service_workers='block',
                              accept_downloads=True, geolocation=GPS if gps else None,
                              permissions=['microphone', 'geolocation'] if gps else ['microphone'])
    ctx.add_init_script(SHARE_STUB)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.clock.set_fixed_time(DATE)
    boot(page, url)
    if offline:
        ctx.set_offline(True)
    return ctx, page, errors


def open_sound(page):
    page.locator('#fab').click()
    choices = page.locator('#quickAddOptions [data-quick-action]').all_inner_texts()
    page.locator('[data-quick-action="sound"]').click()
    page.locator('#soundRecord').wait_for(timeout=10000)
    page.wait_for_function("() => !document.querySelector('#quickAddOptions').inert", timeout=10000)
    return choices


def record(page):
    page.locator('#soundRecord').click()
    page.wait_for_function("() => document.querySelector('#soundElapsed').textContent >= '00:02'", timeout=15000)
    page.locator('#soundRecord').click()
    page.locator('#soundPlayback').wait_for(state='visible', timeout=15000)
    page.wait_for_function("() => document.querySelector('#soundDraftState').textContent.includes('bewaard op dit toestel')", timeout=15000)


def open_merlin(page):
    if not page.evaluate("() => document.querySelector('#soundMerlin').open"):
        page.locator('#soundMerlin > summary').click()


def wav_ready(page):
    page.wait_for_function("() => /alleen het geluid|niet beschikbaar|niet als WAV|Neem eerst/.test(document.querySelector('#soundMerlinShareNote').textContent)", timeout=20000)
    return page.locator('#soundMerlinShareNote').inner_text()


def add_species(page, name):
    page.locator('#soundSpeciesSearch').fill(name)
    page.get_by_role('button', name=name, exact=True).click()


def tick(page, label):
    page.get_by_role('checkbox', name=label, exact=True).check()


def pin(page):
    page.locator('#soundSave').click()
    page.locator('#quickAddSheet').wait_for(state='detached', timeout=15000)
    # Opslaan navigeert naar de kaart en opent het plekkaartje; sluit dat, anders vangt het volgende klikken af.
    page.locator('#mapSheetName').wait_for(timeout=15000)
    page.locator('#mapSheetClose').click()
    page.locator('#mapOverlay.visible').wait_for(state='detached', timeout=10000)


def rows(page):
    return page.evaluate(r3.SIGHTINGS)


def wav_header_ok(head, size):
    b = bytes(head)
    fmt = struct.unpack('<HHIIHH', b[20:36])
    return (b[0:4] == b'RIFF' and b[8:16] == b'WAVEfmt ' and b[36:40] == b'data' and fmt == (1, 1, 44100, 88200, 2, 16)
            and struct.unpack('<I', b[40:44])[0] == size - 44 and struct.unpack('<I', b[4:8])[0] == size - 8)


def detail_text(page, sid):
    r3.open_detail(page, sid)
    text = page.locator('#detailSightingSheet').inner_text()
    r3.close_detail(page)
    return text


def run(browser, url, tmp):
    # ── M1 ──────────────────────────────────────────────────────────────────
    ctx, p, errors = context(browser, url)
    choices = open_sound(p)
    birdnet_ui = all(p.locator(sel).count() == 1 for sel in ('#soundRecord', '#soundWaveform', '#soundPlayback', '#soundSpeciesSearch'))
    collapsed = not p.evaluate("() => document.querySelector('#soundMerlin').open")
    record(p)
    open_merlin(p)
    note = wav_ready(p)
    p.locator('#soundMerlinShare').click()
    p.wait_for_function("() => /Opname gedeeld/.test(document.querySelector('#soundMerlinState').textContent)", timeout=10000)
    call = p.evaluate("() => window.__share.calls[0]")
    p.evaluate(APP_SWITCH, True)
    p.clock.set_fixed_time(DATE + timedelta(minutes=25))
    p.evaluate(APP_SWITCH, False)
    back = p.locator('#soundMerlinState').inner_text()
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Merel')
    tick(p, 'Merel: Merlin gaf deze soort')
    compare = p.locator('#soundMerlinCompare').inner_text()
    pin(p)
    r = rows(p)
    s = r[0] if len(r) == 1 else {}
    p.reload(wait_until='domcontentloaded'); boot(p, url)
    text = detail_text(p, s.get('id', '-')) if s else ''
    open_sound(p)
    restored = p.locator('#soundDraftState').inner_text()
    places = p.evaluate(PLACES)
    ctx.close()
    check('M1', '+ twee keuzes → opnemen → WAV delen (concept eerst bewaard) → terug → Merlin-soort → Gehoord · Merlin-suggestie · Mogelijk; terug te vinden',
          choices == ['Waarneming toevoegen\nKies een soort en plaats een pin', 'Geluid herkennen\nNeem op, BirdNET stelt voor, optioneel Merlin']
          and birdnet_ui and collapsed and 'alleen het geluid' in note
          and call and call['keys'] == ['files'] and call['name'] == 'birdspot-opname.wav' and call['type'] == 'audio/wav'
          and wav_header_ok(call['head'], call['size'])
          and call['draft'] == {'date': '2026-11-15', 'time': '14:42', 'coordinates': {'lat': 51.9244, 'lon': 4.4777, 'pinAccuracyM': 8, 'accuracyExactM': 8}, 'clip': True}
          and 'Terug uit Merlin' in back and compare == 'BirdNET had geen suggestie. Merlin: Merel.'
          and s.get('speciesName') == 'Merel' and s.get('observationMethod') == 'heard' and s.get('identificationSource') == 'merlin'
          and s.get('merlinVerification') == 'suggested' and s.get('certainty') == 'possible'
          and s.get('date') == '2026-11-15' and s.get('time') == '14:42' and s.get('lat') == 51.9244 and s.get('lon') == 4.4777
          and not s.get('audioIds') and 'Merlin Sound ID · suggestie' in text and 'Gehoord' in text
          and restored == '' and places == 1 and not errors,
          f"keuzes={len(choices)} deel={call and {k: call[k] for k in ('keys', 'name', 'type', 'size')}} concept_bij_delen={call and call['draft']} "
          f"terug='{back[:40]}' vergelijking='{compare}' opgeslagen={ {k: s.get(k) for k in ('observationMethod', 'identificationSource', 'merlinVerification', 'certainty', 'date', 'time')} } "
          f"rijen={len(r)} plekken={places} concept_na='{restored}' fouten={errors[:1]}")

    # ── M2 ──────────────────────────────────────────────────────────────────
    ctx, p, errors = context(browser, url)
    open_sound(p); record(p); open_merlin(p); wav_ready(p)
    p.locator('#soundMerlinShare').click()
    p.wait_for_function("() => window.__share.calls.length === 1", timeout=10000)
    shared_sha = p.evaluate("() => window.__share.calls[0].sha")
    p.clock.set_fixed_time(DATE + timedelta(minutes=40))
    p.reload(wait_until='domcontentloaded'); boot(p, url)             # Birdspot werd afgesloten tijdens Merlin
    open_sound(p)
    p.wait_for_function("() => document.querySelector('#soundDraftState').textContent === 'Bewaarde sessie geopend.'", timeout=10000)
    reopened = (p.locator('#soundPlayback').is_visible(), p.evaluate("() => document.querySelector('#soundMerlin').open"),
                p.locator('#soundDate').input_value(), p.locator('#soundTime').input_value())
    wav_ready(p)
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Roodborst')
    tick(p, 'Roodborst: Merlin gaf deze soort')
    tick(p, 'Roodborst: ook gezien')
    tick(p, 'Ik heb de Merlin-suggestie zelf gecontroleerd (geluid of voorbeelden vergeleken)')
    tick(p, 'Bewaar de opname bij de waarneming')
    pin(p)
    s = rows(p)[0]
    ids, recs = rz.audio_of(p, s['id'])
    places = p.evaluate(PLACES)
    text = detail_text(p, s['id'])
    ctx.set_offline(True)
    played = rz.play(p, s['id'])
    ctx.set_offline(False)
    zp = rz.export(p, Path(tmp) / 'm2.zip')
    ctx.close()
    clean_ok, clean_detail = rv.clean_check(browser, url, zp, s['id'], [shared_sha])
    check('M2', 'herstel na afsluiten met oorspronkelijke datum/tijd → Gezien en gehoord, zelf gecontroleerd; WAV-bijlage = gedeelde bytes, offline, ZIP schoon',
          reopened == (True, True, '2026-11-15', '14:42') and s['observationMethod'] == 'both' and s['identificationSource'] == 'merlin'
          and s['merlinVerification'] == 'checked' and s['certainty'] == 'certain' and s['time'] == '14:42'
          and len(ids) == 1 and recs[0] and recs[0]['kind'] == 'sighting-audio' and recs[0]['type'] == 'audio/wav' and recs[0]['sha'] == shared_sha
          and places == 1 and 'Gezien en gehoord' in text and 'zelf gecontroleerd' in text
          and played and played[0]['ok'] and clean_ok and not errors,
          f"tekst_ok={'Gezien en gehoord' in text and 'zelf gecontroleerd' in text} plekken={places} fouten={errors[:1]} heropend={reopened} opgeslagen={ {k: s.get(k) for k in ('observationMethod', 'merlinVerification', 'certainty', 'time')} } "
          f"opname={'gelijk' if recs and recs[0] and recs[0]['sha'] == shared_sha else 'ANDERS'} offline={played} | schoon: {clean_detail}")

    # ── M3 + M4: BirdNET-suggestie (concept met BirdNET-kandidaat, zoals de app het zelf bewaart) ─────────
    ctx, p, errors = context(browser, url)
    seed = {'wav': list(r3.make_wav(seconds=2, freq=2000)), 'candidates': [['sp045', {'checked': False, 'match': {'score': 0.81, 'second': 3}}]]}
    p.evaluate(SEED_DRAFT, seed)
    open_sound(p); open_merlin(p)
    suggested = p.locator('#soundSelection').inner_text()
    merel_unchecked = not p.get_by_role('checkbox', name='Merel BirdNET-suggestie · 00:03', exact=True).is_checked()
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Zanglijster')
    tick(p, 'Zanglijster: Merlin gaf deze soort')
    diff = p.locator('#soundMerlinCompare').inner_text()
    pin(p)
    r = rows(p)
    check('M3', 'verschil BirdNET (Merel) ↔ Merlin (Zanglijster) zichtbaar; gebruiker pint alleen Zanglijster; suggestie niet opgeslagen',
          'BirdNET-suggestie' in suggested and merel_unchecked and 'Verschil' in diff and 'alleen Merlin: Zanglijster' in diff
          and 'alleen BirdNET: Merel' in diff and len(r) == 1 and r[0]['speciesName'] == 'Zanglijster'
          and r[0]['identificationSource'] == 'merlin' and r[0]['certainty'] == 'possible' and 'soundSuggestion' not in r[0],
          f"melding='{diff}' rijen={[x['speciesName'] for x in r]}")
    p.evaluate(SEED_DRAFT, seed)
    open_sound(p); open_merlin(p)
    p.get_by_role('checkbox', name='Merel BirdNET-suggestie · 00:03', exact=True).check()
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    tick(p, 'Merel: Merlin gaf deze soort')
    same = p.locator('#soundMerlinCompare').inner_text()
    pin(p)
    m = next((x for x in rows(p) if x['speciesName'] == 'Merel'), {})
    ctx.close()
    check('M4', 'overeenstemming BirdNET en Merlin (Merel) → melding; bron Merlin-suggestie + BirdNET-suggestie bewaard',
          same == 'Overeenstemming: BirdNET en Merlin noemen Merel.' and m.get('identificationSource') == 'merlin'
          and m.get('merlinVerification') == 'suggested' and m.get('certainty') == 'possible'
          and (m.get('soundSuggestion') or {}).get('model') == 'BirdNET+ V3.0' and not errors,
          f"melding='{same}' opgeslagen={ {k: m.get(k) for k in ('identificationSource', 'merlinVerification', 'certainty')} }")

    # ── M5: delen geannuleerd ───────────────────────────────────────────────
    ctx, p, errors = context(browser, url)
    p.evaluate("() => { window.__share.mode = 'abort'; }")
    open_sound(p); record(p); open_merlin(p); wav_ready(p)
    p.locator('#soundMerlinShare').click()
    p.wait_for_function("() => /geannuleerd/.test(document.querySelector('#soundMerlinState').textContent)", timeout=10000)
    cancel_msg = p.locator('#soundMerlinState').inner_text()
    nothing = not rows(p) and p.evaluate(DRAFT_EXISTS)
    p.locator('#addSheetCancel').click()
    open_sound(p)
    kept = p.locator('#soundDraftState').inner_text()
    add_species(p, 'Merel')
    pin(p)
    s = rows(p)[0]
    ctx.close()
    check('M5', 'delen geannuleerd → melding, niets opgeslagen, concept blijft; verder zonder Merlin → eigen herkenning',
          'geannuleerd' in cancel_msg and nothing and kept == 'Bewaarde sessie geopend.' and s['identificationSource'] == 'self'
          and s['merlinVerification'] is None and s['observationMethod'] == 'heard' and s['certainty'] == 'certain' and not errors,
          f"melding='{cancel_msg}' concept='{kept}' bron={s['identificationSource']}")

    # ── M6: geen deelfunctie ────────────────────────────────────────────────
    ctx, p, errors = context(browser, url)
    p.evaluate("() => { window.__share.mode = 'none'; }")
    open_sound(p); record(p); open_merlin(p)
    note = wav_ready(p)
    hidden = p.locator('#soundMerlinShare').is_hidden()
    p.locator('.sound-merlin__manual > summary').click()
    manual = p.locator('.sound-merlin__manual').inner_text()
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Winterkoning')
    tick(p, 'Winterkoning: Merlin gaf deze soort')
    pin(p)
    s = rows(p)[0]
    ctx.close()
    check('M6', 'geen deelfunctie → geen deelknop, handmatige Merlin-route; Merlin zelf gebruikt → bron Merlin',
          hidden and 'niet beschikbaar' in note and 'Geluid herkennen' in manual and 'Sound ID' in manual
          and s['identificationSource'] == 'merlin' and s['merlinVerification'] == 'suggested' and not errors,
          f"knop_verborgen={hidden} melding='{note}'")

    # ── M7: offline ─────────────────────────────────────────────────────────
    ctx, p, errors = context(browser, url)
    p.locator('.nav-item[data-route="map"]').click()             # zonder service worker: kaartmodules eerst online laden
    p.locator('#explorerSightingsBtn').click()
    p.wait_for_timeout(1500)
    p.locator('.nav-item[data-route="home"]').click()
    ctx.set_offline(True)
    open_sound(p); record(p); open_merlin(p); wav_ready(p)
    p.locator('#soundMerlinShare').click()
    p.wait_for_function("() => window.__share.calls.length === 1", timeout=10000)
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Merel')
    tick(p, 'Merel: Merlin gaf deze soort')
    pin(p)
    r = rows(p)
    text = detail_text(p, r[0]['id']) if r else ''             # heropenen in de app, nog steeds offline
    ctx.set_offline(False)
    p.reload(wait_until='domcontentloaded'); boot(p, url)
    after = rows(p)
    ctx.close()
    check('M7', 'offline: opnemen, delen, opslaan en offline heropenen in de app; daarna bewaard na herladen',
          len(r) == 1 and r[0]['identificationSource'] == 'merlin' and 'Merlin Sound ID · suggestie' in text and len(after) == 1 and not errors,
          f"rijen={len(r)} detail_offline={'Merlin' in text} na_herladen={len(after)} fouten={errors[:1]}")

    # ── M8: microfoon en GPS geweigerd ──────────────────────────────────────
    ctx, p, errors = context(browser, url, gps=False)
    p.evaluate("""() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('denied', 'NotAllowedError'); };
      navigator.geolocation.getCurrentPosition = (_, fail) => fail({ code: 1 }); }""")
    open_sound(p)
    p.locator('#soundRecord').click()
    p.wait_for_function("() => /geen toestemming/.test(document.querySelector('#soundCaptureState').textContent)", timeout=10000)
    open_merlin(p)
    note = wav_ready(p)
    no_share = p.locator('#soundMerlinShare').is_hidden() and p.locator('#soundAttachField').is_hidden()
    tick(p, 'Ik heb Merlin gebruikt voor deze vogels')
    add_species(p, 'Merel')
    tick(p, 'Merel: Merlin gaf deze soort')
    p.get_by_text('Details aanpassen', exact=True).click()
    p.get_by_role('button', name='Kies plek op kaart').click()
    p.locator('#pinLat').fill('52.1'); p.locator('#pinLon').fill('5.1'); p.locator('#pinConfirm').click()
    pin(p)
    s = rows(p)[0]
    ctx.close()
    check('M8', 'microfoon en GPS geweigerd → geen deelknop; handmatige Merlin-route + kaartpin → opgeslagen',
          no_share and 'Neem eerst op' in note and s['identificationSource'] == 'merlin' and s['lat'] == 52.1 and s['lon'] == 5.1 and not errors,
          f"melding='{note[:60]}' pin={s['lat']},{s['lon']}")

    # ── M9: opnieuw proberen zonder dubbelingen; bijlage bij meerdere soorten uit ─
    ctx, p, errors = context(browser, url)
    open_sound(p); record(p); open_merlin(p); wav_ready(p)
    add_species(p, 'Merel'); add_species(p, 'Roodborst')
    multi = (p.locator('#soundAttach').is_disabled(), p.locator('#soundAttachNote').inner_text())
    p.get_by_role('checkbox', name='Roodborst', exact=True).uncheck()
    tick(p, 'Bewaar de opname bij de waarneming')
    p.evaluate(FAIL_ONCE)
    p.locator('#soundSave').click()
    p.wait_for_function("() => /Opslaan mislukt/.test(document.querySelector('#soundSaveState').textContent)", timeout=10000)
    after_fail = (len(rows(p)), len(r3.audio_records(p.evaluate(r3.RECORDS))))
    pin(p)
    r = rows(p)
    recs = r3.audio_records(p.evaluate(r3.RECORDS))
    places = p.evaluate(PLACES)
    open_sound(p)
    fresh = p.locator('#soundDraftState').inner_text()
    ctx.close()
    check('M9', 'opslagfout → geen losse opname; opnieuw → precies 1 waarneming, 1 pin, 1 opname; bijlage bij meerdere soorten uit',
          multi[0] and 'Bewerken' in multi[1] and after_fail == (0, 0) and len(r) == 1 and len(recs) == 1
          and r[0].get('audioIds') == [recs[0]['id']] and places == 1 and fresh == '' and not errors,
          f"meerdere_soorten={multi[0]} na_fout={after_fail} rijen={len(r)} opnamen={len(recs)} plekken={places} concept='{fresh}'")


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r4-') as tmp:
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
    total = max(len(RESULTS), 9)
    print(f"R4-MERLIN {'PASS' if passed == total else 'FAIL'}: {passed}/{total}  (handoff gesimuleerd; echte appwisseling NOT TESTED)")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
