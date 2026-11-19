"""Ronde 3/4 — R08: eigen geluidsopname per waarneming (mobiel Chromium, echte UI-route).

Synthetische privédata. De WAV is een echte PCM-opname (zoals een Merlin-export) met vaste bytes;
de controles vergelijken SHA-256 van de originele bytes met wat de app bewaart, exporteert en herstelt.

R3-01  nieuwe waarneming + WAV via de formulierknop → opgeslagen, originele bytes, gekoppeld, geen soort/plek
R3-02  app sluiten, OFFLINE heropenen (service worker) → detail → opname speelt af
R3-03  bestaande waarneming → Bewerken → opname toevoegen (MP3 als ffmpeg beschikbaar, anders WAV)
R3-04  na heropenen via Bewerken verwijderen → koppeling én bestand weg
R3-05  Annuleren na verwijderen + toevoegen → waarneming en opslag ongewijzigd
R3-06  ongeldige bestanden (kapotte WAV, tekst, FLAC) → geweigerd met melding, niets opgeslagen
R3-07  quotumfout bij het wegschrijven → melding, invoer + opname blijven klaarstaan, geen los bestand
R3-08  afgebroken opslag (waarneming schrijven faalt na media) → geen los bestand; daarna lukt opslaan
R3-09  scheiding: niet in mediabibliotheek, zoekindex, soortmedia, plekmedia of fotogalerij
R3-10  ZIP → schoon browserprofiel: bytes + koppeling + mediaMeta gelijk; daar offline afspelen
R3-11  Terugzetten in dat profiel: geïmporteerde opname weg, vooraf bestaande opname behouden en speelbaar
R3-12  oude ZIP (1.27.31, vóór 2B) blijft importeerbaar; geen audio verzonnen
"""
import hashlib
import http.server
import io
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import threading
import wave
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
FIXTURE = Path(__file__).resolve().parent / 'fixtures' / 'backup_pre_r2b_1.27.31_fb59085.zip'
RESULTS = []


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def log_message(self, *_):
        pass


def make_wav(seconds=1.5, freq=2400, rate=22050):
    out = io.BytesIO()
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        frames = b''.join(struct.pack('<h', int(9000 * math.sin(2 * math.pi * (freq + 400 * math.sin(i / 900)) * i / rate)))
                          for i in range(int(seconds * rate)))
        w.writeframes(frames)
    return out.getvalue()


def make_mp3(wav_bytes, tmp):
    if not shutil.which('ffmpeg'):
        return None
    src, dst = Path(tmp) / 'in.wav', Path(tmp) / 'out.mp3'
    src.write_bytes(wav_bytes)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(src), '-codec:a', 'libmp3lame', '-b:a', '64k', str(dst)], check=True)
    return dst.read_bytes()


sha = lambda b: hashlib.sha256(b).hexdigest()  # noqa: E731

SIGHTINGS = "() => JSON.parse(localStorage.getItem('birdspot-sightings') || '{\"sightings\":[]}').sightings"
RECORDS = """async () => {
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise(r => { const q = db.transaction('photos').objectStore('photos').getAll(); q.onsuccess = () => r(q.result); });
  const out = [];
  for (const p of all) {
    const buf = p.blob ? await p.blob.arrayBuffer() : new ArrayBuffer(0);
    const hex = [...new Uint8Array(await crypto.subtle.digest('SHA-256', buf))].map(x => x.toString(16).padStart(2, '0')).join('');
    out.push({ id: p.id, kind: p.kind || null, type: p.type || null, sightingId: p.sightingId || null,
      speciesId: p.speciesId || null, placeId: p.placeId || null, filename: p.filename || null, sha: hex, size: buf.byteLength });
  }
  return out.sort((a, b) => a.id < b.id ? -1 : 1);
}"""
PLAY = """async () => {
  const players = [...document.querySelectorAll('#detailSightingSheet .detail-audio__player')];
  const out = [];
  for (const p of players) {
    try {
      if (p.readyState < 1) await new Promise((ok, no) => { p.onloadedmetadata = ok; p.onerror = () => no(new Error('laadfout')); setTimeout(() => no(new Error('timeout')), 8000); });
      await p.play();
      await new Promise((ok, no) => { const t = setTimeout(() => no(new Error('speelt niet')), 8000); p.ontimeupdate = () => { if (p.currentTime > 0.2) { clearTimeout(t); ok(); } }; });
      p.pause();
      out.push({ ok: true, duration: Math.round(p.duration * 10) / 10, src: p.src.slice(0, 5) });
    } catch (e) { out.push({ ok: false, error: e.message }); }
  }
  return out;
}"""


def open_new_form(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="seen"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)
    page.locator('#speciesPickerBtn').click()
    page.locator('#spPickerList .species-row[data-id="sp001"]').click()
    page.locator('#speciesPickerBtn .species-picker-btn__name').wait_for(timeout=8000)


def add_audio(page, files, expect_items):
    page.locator('#sightingAudioInput').set_input_files(files)
    page.wait_for_function("n => document.querySelectorAll('#audioAttachList .sighting-audio-item').length === n && "
                           "!document.querySelector('#addSheetSubmit').disabled", arg=expect_items, timeout=15000)


def save(page):
    page.locator('#addSheetSubmit').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)


def open_detail(page, sid):
    page.locator('.nav-item[data-route="map"]').click()
    page.locator('#explorerSightingsBtn').click()
    page.locator('#sightingCards').wait_for(timeout=12000)
    page.locator(f'.sight-card[data-id="{sid}"]').click()
    page.locator('#detailSightingSheet.open').wait_for(timeout=10000)


def close_detail(page):
    page.locator('#detailClose').click()
    page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)


def edit_from_detail(page, sid):
    open_detail(page, sid)
    page.locator('#detailEdit').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=10000)
    page.wait_for_function("() => !document.querySelector('#audioAttachList [data-lazy-audio]') || "
                           "[...document.querySelectorAll('#audioAttachList [data-lazy-audio]')].every(e => e.textContent !== 'Opname laden…')", timeout=8000)


def audio_records(recs):
    return [r for r in recs if r['kind'] == 'sighting-audio']


def run(browser, url, tmp):
    wav = make_wav()
    wav2 = make_wav(seconds=1.0, freq=1800)
    mp3 = make_mp3(wav2, tmp)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                              reduced_motion='reduce', service_workers='allow', accept_downloads=True)
    for s in (INIT, HOLD):
        ctx.add_init_script(s)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    boot(page, url)
    page.evaluate("async () => { await navigator.serviceWorker.ready; }")
    if not page.evaluate("!!navigator.serviceWorker.controller"):
        page.reload(wait_until='domcontentloaded'); boot(page, url)
    page.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)

    # R3-01
    open_new_form(page)
    page.locator('#sightLocation').fill('Testvijver (fictief)')
    add_audio(page, [{"name": "merlin-export.wav", "mimeType": "audio/x-wav", "buffer": wav}], 1)
    preview = page.evaluate("() => !!document.querySelector('#audioAttachList audio.sighting-audio-item__player')")
    save(page)
    s1 = page.evaluate(SIGHTINGS)[-1]
    recs = page.evaluate(RECORDS)
    a1 = [r for r in recs if r['id'] in (s1.get('audioIds') or [])]
    check('R3-01', 'nieuwe waarneming + Merlin-WAV via formulier → originele bytes, gekoppeld, zonder soort/plek',
          preview and len(a1) == 1 and a1[0]['sha'] == sha(wav) and a1[0]['kind'] == 'sighting-audio' and a1[0]['sightingId'] == s1['id']
          and a1[0]['speciesId'] is None and a1[0]['placeId'] is None and a1[0]['type'] == 'audio/wav' and s1.get('photoIds') == [],
          f"audioIds={s1.get('audioIds')} sha_gelijk={bool(a1) and a1[0]['sha'] == sha(wav)} type={a1[0]['type'] if a1 else None}")

    # R3-02: offline heropenen en afspelen
    page.close()
    ctx.set_offline(True)
    page = ctx.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
    boot(page, url)
    offline = page.evaluate('!navigator.onLine')
    open_detail(page, s1['id'])
    played = page.evaluate(PLAY)
    gallery = page.locator('#detailSightingSheet .detail-media__item').count()
    close_detail(page)
    ctx.set_offline(False)
    check('R3-02', 'app offline heropenen → waarnemingsdetail speelt de opname af',
          offline and len(played) == 1 and played[0]['ok'] and abs(played[0]['duration'] - 1.5) < 0.2 and gallery == 0,
          f"offline={offline} afspelen={played} fotogalerij={gallery}")

    # R3-03: toevoegen aan een bestaande waarneming
    open_new_form(page); save(page)
    s2 = page.evaluate(SIGHTINGS)[-1]
    edit_from_detail(page, s2['id'])
    second = {"name": "merlin-2.mp3", "mimeType": "audio/mpeg", "buffer": mp3} if mp3 else {"name": "merlin-2.wav", "mimeType": "audio/wav", "buffer": wav2}
    add_audio(page, [second], 1)
    save(page)
    s2b = next(s for s in page.evaluate(SIGHTINGS) if s['id'] == s2['id'])
    recs = page.evaluate(RECORDS)
    a2 = [r for r in recs if r['id'] in (s2b.get('audioIds') or [])]
    open_detail(page, s2['id']); played2 = page.evaluate(PLAY); close_detail(page)
    check('R3-03', f"bestaande waarneming → opname toevoegen ({'MP3' if mp3 else 'WAV; MP3 NOT TESTED (geen ffmpeg)'}) → opgeslagen en speelbaar",
          len(a2) == 1 and a2[0]['sha'] == sha(second['buffer']) and played2 and played2[0]['ok'] and s2b['speciesId'] == s2['speciesId'],
          f"audioIds={s2b.get('audioIds')} type={a2[0]['type'] if a2 else None} afspelen={played2}")

    # R3-05: annuleren (vóór R3-04, op waarneming 1)
    before_s = page.evaluate(SIGHTINGS); before_r = page.evaluate(RECORDS)
    edit_from_detail(page, s1['id'])
    page.locator('#audioAttachList .sighting-audio-item__del[data-audioid]').first.click()
    add_audio(page, [{"name": "extra.wav", "mimeType": "audio/wav", "buffer": wav2}], 1)
    page.locator('#addSheetCancel').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
    page.wait_for_timeout(300)
    check('R3-05', 'Annuleren na verwijderen + toevoegen → waarneming en opgeslagen opnamen ongewijzigd',
          page.evaluate(SIGHTINGS) == before_s and page.evaluate(RECORDS) == before_r)

    # R3-04: verwijderen na heropenen
    page.reload(wait_until='domcontentloaded'); boot(page, url)
    edit_from_detail(page, s1['id'])
    page.locator('#audioAttachList .sighting-audio-item__del[data-audioid]').first.click()
    save(page)
    s1b = next(s for s in page.evaluate(SIGHTINGS) if s['id'] == s1['id'])
    gone = not any(r['id'] == a1[0]['id'] for r in page.evaluate(RECORDS))
    open_detail(page, s1['id']); players = page.locator('#detailSightingSheet .detail-audio').count(); close_detail(page)
    check('R3-04', 'na heropenen via Bewerken verwijderen → koppeling en bestand weg, detail zonder opname',
          s1b.get('audioIds') == [] and gone and players == 0, f"audioIds={s1b.get('audioIds')} bestand_weg={gone}")

    # R3-06: ongeldige bestanden
    count_before = len(page.evaluate(RECORDS))
    open_new_form(page)
    page.locator('#sightLocation').fill('Ongeldig-test')
    page.locator('#sightingAudioInput').set_input_files([
        {"name": "kapot.wav", "mimeType": "audio/wav", "buffer": b'RIFF\x00\x00\x00\x00WAVEnietecht' * 20},
        {"name": "notities.txt", "mimeType": "text/plain", "buffer": b'geen geluid'},
        {"name": "opname.flac", "mimeType": "audio/flac", "buffer": wav},
    ])
    page.wait_for_function("() => /Niet toegevoegd/.test(document.querySelector('#sightingAudioStatus').textContent)", timeout=15000)
    msg = page.locator('#sightingAudioStatus').inner_text()
    items = page.locator('#audioAttachList .sighting-audio-item').count()
    kept = page.locator('#sightLocation').input_value()
    save(page)
    s6 = page.evaluate(SIGHTINGS)[-1]
    check('R3-06', 'ongeldige bestanden → geweigerd met melding, invoer blijft, niets opgeslagen',
          items == 0 and all(n in msg for n in ('kapot.wav', 'notities.txt', 'opname.flac')) and kept == 'Ongeldig-test'
          and (s6.get('audioIds') or []) == [] and len(page.evaluate(RECORDS)) == count_before, f"melding='{msg[:120]}'")

    # R3-07: quotumfout bij het wegschrijven van de opname
    before_s = page.evaluate(SIGHTINGS); before_r = page.evaluate(RECORDS)
    open_new_form(page)
    page.locator('#sightLocation').fill('Quotum-test')
    add_audio(page, [{"name": "quotum.wav", "mimeType": "audio/wav", "buffer": wav}], 1)
    page.evaluate("""() => { const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (v, ...r) { if (v && v.kind === 'sighting-audio') throw new DOMException('QA quota', 'QuotaExceededError'); return put.call(this, v, ...r); };
      window.__undoQuota = () => { IDBObjectStore.prototype.put = put; }; }""")
    page.locator('#addSheetSubmit').click()
    page.wait_for_function("() => (window.__toasts || []).some(t => t.includes('Opslaan mislukt'))", timeout=10000)
    still = page.locator('#addSightingSheet').is_visible() and page.locator('#audioAttachList .sighting-audio-item').count() == 1 \
        and page.locator('#sightLocation').input_value() == 'Quotum-test'
    unchanged = page.evaluate(SIGHTINGS) == before_s and page.evaluate(RECORDS) == before_r
    page.evaluate("() => window.__undoQuota()")
    save(page)
    s7 = page.evaluate(SIGHTINGS)[-1]
    ok7 = len([r for r in page.evaluate(RECORDS) if r['id'] in (s7.get('audioIds') or []) and r['sha'] == sha(wav)]) == 1
    check('R3-07', 'quotumfout → melding, invoer + opname blijven klaar, niets weggeschreven; daarna opslaan lukt',
          still and unchanged and ok7, f"klaar={still} ongewijzigd={unchanged} daarna={ok7}")

    # R3-08: waarneming schrijven faalt nadat de opname al in IndexedDB stond
    before_s = page.evaluate(SIGHTINGS); before_r = page.evaluate(RECORDS)
    open_new_form(page)
    add_audio(page, [{"name": "afgebroken.wav", "mimeType": "audio/wav", "buffer": wav2}], 1)
    page.evaluate("""() => { const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { if (k === 'birdspot-sightings') { Storage.prototype.setItem = set; throw new DOMException('QA', 'QuotaExceededError'); } return set.call(this, k, v); }; }""")
    page.locator('#addSheetSubmit').click()
    page.wait_for_function("() => (window.__toasts || []).filter(t => t.includes('Opslaan mislukt')).length >= 2", timeout=10000)
    no_orphan = page.evaluate(RECORDS) == before_r and page.evaluate(SIGHTINGS) == before_s
    still = page.locator('#audioAttachList .sighting-audio-item').count() == 1
    save(page)
    s8 = page.evaluate(SIGHTINGS)[-1]
    ok8 = len(s8.get('audioIds') or []) == 1
    check('R3-08', 'afgebroken opslag na de opname → geen los bestand, geen verwijzing; daarna lukt opslaan',
          no_orphan and still and ok8, f"geen_wees={no_orphan} klaar={still} daarna={ok8}")

    # R3-09: scheiding van andere media
    sep = page.evaluate("""async () => {
      const db = await import('/src/data/db.js');
      const meta = await db.getMediaMetadata();
      const species = await db.getPhotosBySpecies('sp001');
      const audioIds = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.flatMap(s => s.audioIds || []);
      return { meta: meta.filter(m => audioIds.includes(m.id)).length, species: species.filter(p => audioIds.includes(p.id)).length, audio: audioIds.length };
    }""")
    # Mediabibliotheek echt openen: er staan foto's/video's (R3-03 had geen); audio mag er niet in.
    page.evaluate("() => import('/src/app.js').then(m => m.navigate('media', { force: true }))")
    page.wait_for_timeout(2000)
    lib = page.evaluate("""ids => ({ audioTags: document.querySelectorAll('main audio, #app audio').length,
      ids: ids.filter(id => document.body.innerHTML.includes(id)).length })""",
      page.evaluate("() => JSON.parse(localStorage.getItem('birdspot-sightings')).sightings.flatMap(s => s.audioIds || [])"))
    lib = lib['audioTags'] + lib['ids']
    check('R3-09', 'scheiding: niet in zoekindex, soortmedia of mediabibliotheek',
          sep['audio'] >= 3 and sep['meta'] == 0 and sep['species'] == 0 and lib == 0, f"{sep} audio_in_bibliotheek={lib}")

    # R3-10: export → schoon profiel
    profile(page)
    with page.expect_download(timeout=30000) as dl:
        page.locator('#btnExport').click()
    zpath = Path(tmp) / 'r3.zip'; dl.value.save_as(zpath)
    src_sightings = page.evaluate(SIGHTINGS)
    src_audio = {r['id']: r for r in audio_records(page.evaluate(RECORDS))}
    z = zipfile.ZipFile(zpath)
    data = json.loads(z.read('gegevens.json'))
    zip_ok = all(sha(z.read(f"photos/{aid}.{ 'wav' if r['type'] == 'audio/wav' else 'mp3' }")) == r['sha'] for aid, r in src_audio.items())
    meta_ok = all(any(m['id'] == aid and m.get('kind') == 'sighting-audio' and m.get('sightingId') == r['sightingId'] for m in data['mediaMeta'])
                  for aid, r in src_audio.items()) and set(src_audio) <= set(data['photoIds'])
    page.close(); ctx.close()

    clean = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, reduced_motion='reduce', service_workers='block')
    for s in (INIT, HOLD):
        clean.add_init_script(s)
    b = clean.new_page(); b.on('pageerror', lambda e: errors.append(str(e)))
    boot(b, url)
    # Vooraf bestaande eigen opname in dit profiel (voor R3-11)
    open_new_form(b)
    add_audio(b, [{"name": "eigen-b.wav", "mimeType": "audio/wav", "buffer": wav2}], 1)
    save(b)
    own = b.evaluate(SIGHTINGS)[-1]
    pre_s = b.evaluate(SIGHTINGS); pre_r = b.evaluate(RECORDS)
    profile(b)
    imported = try_import(b, str(zpath))
    got = {r['id']: r for r in audio_records(b.evaluate(RECORDS))}
    got_s = {s['id']: s for s in b.evaluate(SIGHTINGS)}
    same = all(aid in got and got[aid]['sha'] == r['sha'] and got[aid]['sightingId'] == r['sightingId'] and got[aid]['kind'] == 'sighting-audio'
               for aid, r in src_audio.items())
    links = all(got_s.get(s['id'], {}).get('audioIds') == s.get('audioIds') for s in src_sightings if s.get('audioIds'))
    target = next(s for s in src_sightings if s.get('audioIds'))
    b.wait_for_timeout(1800)
    open_detail(b, target['id']); close_detail(b)          # app-modules online geladen (schoon profiel zonder SW)
    clean.set_offline(True)
    open_detail(b, target['id']); played_b = b.evaluate(PLAY); close_detail(b)
    clean.set_offline(False)
    check('R3-10', 'ZIP → schoon profiel: originele bytes, koppeling en mediaMeta gelijk; offline afspelen',
          imported and zip_ok and meta_ok and same and links and played_b and all(p['ok'] for p in played_b),
          f"zip_bytes={zip_ok} meta={meta_ok} bytes_na_import={same} koppeling={links} afspelen={played_b}")

    # R3-11: Terugzetten
    toast = restore_via_ui(b)
    post_s = b.evaluate(SIGHTINGS); post_r = b.evaluate(RECORDS)
    open_detail(b, own['id']); played_own = b.evaluate(PLAY); close_detail(b)
    check('R3-11', 'Terugzetten → geïmporteerde opnamen weg, vooraf bestaande opname behouden en speelbaar',
          'Teruggezet' in toast and post_s == pre_s and post_r == pre_r and not (set(src_audio) & {r['id'] for r in post_r})
          and played_own and played_own[0]['ok'],
          f"toast='{toast[:40]}' waarnemingen_gelijk={post_s == pre_s} opslag_gelijk={post_r == pre_r} eigen_afspelen={played_own}")
    clean.close()

    # R3-12: oude ZIP
    old = browser.new_context(viewport={"width": 390, "height": 844}, service_workers='block')
    for s in (INIT, HOLD):
        old.add_init_script(s)
    o = old.new_page(); boot(o, url); profile(o)
    ok_old = try_import(o, str(FIXTURE))
    recs_old = o.evaluate(RECORDS)
    check('R3-12', 'oude ZIP (1.27.31) importeerbaar; foto\'s intact, geen audio verzonnen',
          ok_old and len(recs_old) > 0 and not audio_records(recs_old) and all(not s.get('audioIds') for s in o.evaluate(SIGHTINGS)),
          f"import={ok_old} media={len(recs_old)}")
    old.close()
    if errors:
        print('pagina-fouten:', errors[:5], flush=True)


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r3-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True, args=['--autoplay-policy=no-user-gesture-required'])
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
    total = max(len(RESULTS), 12)
    print(f"R3-AUDIO {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
