"""Restcorrecties ronde 3/4 na QA van #306 — leesfout en WAV-framegrootte (mobiel Chromium).

W1  P1: Bewerken, alleen notitie; de IndexedDB-leestransactie van de opnamen wordt afgebroken →
    niets opgeslagen (waarneming + opname gelijk), formulier open met notitie en melding;
    opnieuw Opslaan lukt met koppeling intact; ZIP herstelt in schoon profiel met gelijke audiobytes
W2  geslaagde leesactie bevestigt dat het bestand ontbreekt → bestaande afhandeling: koppeling niet
    opnieuw opgeslagen, notitie opgeslagen, export lukt
W3  P2: 16-bit mono PCM met blockAlign=1 en één audiobyte → geweigerd vóór bevestiging, bij directe
    import en in het formulier; opslag ongewijzigd
W4  geldige WAV met precies één frame → voorcontrole en import accepteren, bytes gelijk
W5  WAV met één byte + RIFF-opvulbyte (16-bit: geen volledig frame) → geweigerd vóór bevestiging en bij directe import
W6  geldige 8-bit WAV met oneven data + opvulbyte en een LIST-blok → geaccepteerd, bytes gelijk
W7  geldige lange WAV (> 1 MB, formulier leest alleen het begin) → formulier accepteert, speelt af, ZIP schoon gelijk

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: W1 W3 W3f falen op eb084c8; W5 werd al geweigerd).
"""
import hashlib
import http.server
import io
import json
import os
import struct
import sys
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_r2b_places_env_zip import profile  # noqa: E402
import test_r3_audio as r3  # noqa: E402
import test_r3_zip_herstel as rz  # noqa: E402
import test_r3_vervolg as rv  # noqa: E402

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
rz.ROOT = ROOT
RESULTS = []
sha = lambda b: hashlib.sha256(b).hexdigest()  # noqa: E731
STATE = "() => ({ s: localStorage.getItem('birdspot-sightings'), safety: localStorage.getItem('birdspot-safety-copy') })"
# Breekt de eerstvolgende alleen-lezen-transactie op een opname (au_…) af (zoals QA deed).
ABORT_READ = """(() => { const get = IDBObjectStore.prototype.get;
  IDBObjectStore.prototype.get = function (...args) {
    const request = get.apply(this, args);
    if (window.__abortAudioRead && this.name === 'photos' && this.transaction.mode === 'readonly' && String(args[0]).startsWith('au_')) {
      window.__abortAudioRead = false; window.__readAborted = true;
      try { this.transaction.abort(); } catch (_) {}
    }
    return request;
  }; })();"""
DIRECT_IMPORT = """async bytes => { const b = await import('/src/storage/backup.js');
  try { await b.importBackup(new File([new Uint8Array(bytes)], 'direct.zip', { type: 'application/zip' })); return 'geimporteerd'; }
  catch (e) { return 'fout: ' + e.message; } }"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


def wav(fmt_code=1, ch=1, rate=8000, bits=16, align=None, data=b'', extra_before=b''):
    align = ch * bits // 8 if align is None else align
    fmt = b'fmt ' + struct.pack('<IHHIIHH', 16, fmt_code, ch, rate, rate * align, align, bits)
    d = b'data' + struct.pack('<I', len(data)) + data + (b'\x00' if len(data) % 2 else b'')
    body = b'WAVE' + fmt + extra_before + d
    return b'RIFF' + struct.pack('<I', len(body)) + body


def profile_with_audio(browser, url, audio=None, name='A.wav'):
    ctx, p = rz.new_profile(browser, url)
    p.context.add_init_script(ABORT_READ)
    p.reload(wait_until='domcontentloaded'); rz.boot(p, url)
    audio = audio or r3.make_wav(seconds=1.5, freq=2400)
    r3.open_new_form(p); r3.add_audio(p, [{"name": name, "mimeType": "audio/wav", "buffer": audio}], 1); r3.save(p)
    return ctx, p, p.evaluate(r3.SIGHTINGS)[-1]['id'], audio


def run(browser, url, tmp):
    # W1: leesfout tijdens Bewerken
    ctx, p, sid, wav_a = profile_with_audio(browser, url)
    r3.edit_from_detail(p, sid)
    p.evaluate("() => { document.querySelector('#sightingMore').open = true; }")
    p.locator('#sightNotes').fill('Notitie na leesfout')
    before = (p.evaluate(STATE), p.evaluate(r3.RECORDS))
    p.evaluate("() => { window.__abortAudioRead = true; }")
    p.locator('#addSheetSubmit').click()
    p.wait_for_timeout(2500)
    aborted = p.evaluate("() => !!window.__readAborted")
    open_ = p.locator('#addSightingSheet').is_visible()
    status = p.locator('#sightingAudioStatus').inner_text() if open_ else ''
    kept = open_ and p.locator('#sightNotes').input_value() == 'Notitie na leesfout'
    unchanged = (p.evaluate(STATE), p.evaluate(r3.RECORDS)) == before
    if open_:
        r3.save(p)
    s, recs = rv.records_of(p, sid)
    zp = rz.export(p, Path(tmp) / 'w1.zip')
    ctx.close()
    clean_ok, clean_detail = rv.clean_check(browser, url, zp, sid, [sha(wav_a)])
    check('W1', 'leesfout bij alleen-notitie → niets opgeslagen, invoer + melding; opnieuw opslaan behoudt koppeling; ZIP schoon gelijk',
          aborted and open_ and kept and 'niet worden gelezen' in status and unchanged and s.get('notes') == 'Notitie na leesfout'
          and len(recs) == 1 and recs[0] and recs[0]['sha'] == sha(wav_a) and clean_ok,
          f"afgebroken={aborted} open={open_} invoer={kept} melding='{status[:60]}' ongewijzigd={unchanged} "
          f"daarna_audio={[r and r['sha'][:8] for r in recs]} | schoon: {clean_detail}")

    # W2: geslaagde lezing bevestigt ontbrekend bestand
    ctx, p, sid, wav_a = profile_with_audio(browser, url)
    aid = p.evaluate(r3.SIGHTINGS)[-1]['audioIds'][0]
    p.evaluate("async id => (await import('/src/data/db.js')).deletePhoto(id)", aid)
    r3.edit_from_detail(p, sid)
    p.evaluate("() => { document.querySelector('#sightingMore').open = true; }")
    p.locator('#sightNotes').fill('Bestand ontbrak')
    r3.save(p)
    s = next(x for x in p.evaluate(r3.SIGHTINGS) if x['id'] == sid)
    zp, err = rv.try_export(p, Path(tmp) / 'w2.zip')
    ctx.close()
    check('W2', 'geslaagde lezing: bestand ontbreekt → koppeling niet opnieuw opgeslagen, notitie wel, export lukt',
          s.get('audioIds') == [] and s.get('notes') == 'Bestand ontbrak' and zp is not None,
          f"audioIds={s.get('audioIds')} export={'ok' if zp else err[:80]}")

    # Basis-ZIP met één opname, om bytes te vervangen (geldige CRC via zipfile)
    ctx, p, sid, _ = profile_with_audio(browser, url)
    base = rz.export(p, Path(tmp) / 'base.zip')
    ctx.close()
    z = zipfile.ZipFile(base)
    aid = json.loads(z.read('gegevens.json'))['sightings'][0]['audioIds'][0]

    def zip_with(raw):
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as w:
            for name in z.namelist():
                w.writestr(name, raw if name == f'photos/{aid}.wav' else z.read(name))
        return out.getvalue()

    def precheck_and_direct(payload):
        cv, v = rz.new_profile(browser, url)
        r3.open_new_form(v); r3.save(v)
        before = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        profile(v)
        v.locator('#importFile').set_input_files({"name": "w.zip", "mimeType": "application/zip", "buffer": payload})
        v.wait_for_function("() => !document.querySelector('#btnImport').disabled || !!document.querySelector('#confirmOverlay:not([hidden])')", timeout=15000)
        confirm = v.locator('#confirmOverlay').is_visible()
        if confirm:
            v.locator('#confirmCancel').click() if v.locator('#confirmCancel').count() else v.keyboard.press('Escape')
            v.wait_for_timeout(500)
        msg = v.evaluate("() => (window.__toasts || []).slice(-1)[0] || ''")
        mid = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        direct = v.evaluate(DIRECT_IMPORT, list(payload))
        after = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        recs = {r['id']: r for r in after[1]}
        cv.close()
        return {'confirm': confirm, 'msg': msg, 'pre_same': mid == before, 'direct': direct, 'direct_same': after == before,
                'stored_sha': recs.get(aid, {}).get('sha')}

    for code, label, raw, accept in (
        ('W3', '16-bit mono PCM met blockAlign=1 en één audiobyte', wav(bits=16, align=1, data=b'\x01'), False),
        ('W4', 'geldige WAV met precies één frame', wav(bits=16, data=b'\x01\x02'), True),
        ('W5', '16-bit WAV met één byte + RIFF-opvulbyte (geen volledig frame)', wav(bits=16, data=b'\x01'), False),
        ('W6', 'geldige 8-bit WAV, oneven data + opvulbyte en LIST-blok', wav(bits=8, data=b'\x10\x20\x30',
                                                                            extra_before=b'LIST' + struct.pack('<I', 5) + b'INFOx\x00'), True),
    ):
        r = precheck_and_direct(zip_with(raw))
        if accept:
            ok = r['confirm'] and r['direct'] == 'geimporteerd' and r['stored_sha'] == sha(raw)
        else:
            ok = not r['confirm'] and r['pre_same'] and r['direct'].startswith('fout') and r['direct_same'] and 'geluidsopname' in (r['msg'] + r['direct']).lower()
        check(code, f"{label} → {'geaccepteerd in voorcontrole en import, bytes gelijk' if accept else 'geweigerd vóór bevestiging én bij directe import, opslag ongewijzigd'}",
              ok, f"bevestiging={r['confirm']} voorcontrole_melding='{r['msg'][-110:]}' direct='{r['direct'][:110]}'")

    # W3 (formulier): dezelfde controle bij bestandsselectie
    cf, f = rz.new_profile(browser, url)
    r3.open_new_form(f)
    f.locator('#sightingAudioInput').set_input_files([{"name": "geen-frame.wav", "mimeType": "audio/wav", "buffer": wav(bits=16, align=1, data=b'\x01')}])
    f.wait_for_function("() => /Niet toegevoegd/.test(document.querySelector('#sightingAudioStatus').textContent) || !!document.querySelector('.sighting-audio-item[data-audiotemp]')", timeout=15000)
    f.wait_for_timeout(300)
    fmsg = f.locator('#sightingAudioStatus').inner_text()
    attached = f.locator('.sighting-audio-item[data-audiotemp]').count()
    cf.close()
    check('W3f', 'formulier: WAV met onjuiste framegrootte → geweigerd met reden', 'framegrootte' in fmsg and attached == 0, f"melding='{fmsg[:120]}' toegevoegd={attached}")

    # W7: lange WAV via formulier (leest alleen het begin)
    long_wav = r3.make_wav(seconds=60, freq=2000)
    ctx, p, sid7, _ = profile_with_audio(browser, url, audio=long_wav, name='lang.wav')
    played = rz.play(p, sid7)
    zp = rz.export(p, Path(tmp) / 'w7.zip')
    ctx.close()
    clean_ok, clean_detail = rv.clean_check(browser, url, zp, sid7, [sha(long_wav)])
    check('W7', f'geldige lange WAV ({len(long_wav) // 1024} kB) → formulier accepteert en speelt af, ZIP schoon gelijk',
          played and played[0]['ok'] and clean_ok, f"afspelen={played} | schoon: {clean_detail}")


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r3w-') as tmp:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), rz.Handler)
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
    total = max(len(RESULTS), 8)
    print(f"R3-RESTPUNTEN {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
