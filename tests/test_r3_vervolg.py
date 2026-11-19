"""Vervolgcorrectie ronde 3/4 na QA van #305 — open bewerkformulier en afgebroken WAV (mobiel Chromium).

V1  P1: waarneming met opname A1; nieuwere ZIP (B1) geïmporteerd; tabblad B opent Bewerken; tabblad A
    kiest Terugzetten; B wijzigt alleen de notitie en slaat op → koppeling A1 blijft (originele bytes),
    na heropenen gelijk, ZIP-export lukt en herstelt in een schoon profiel met A1 en offline afspelen
V2  P1: zelfde, maar B voegt expliciet opname C toe → eerste Opslaan: melding, invoer blijft, opslag
    ongewijzigd; tweede Opslaan → A1 + C, beide bestaande bestanden van deze waarneming; export herstelt schoon
V3  P2: ZIP (geldige CRC) met WAV van alleen de 44-byte header → geweigerd in de voorcontrole, niets gewijzigd
V4  P2: ZIP (geldige CRC) met WAV met gedeeltelijke audio → idem
V5  geldige WAV met extra blokken (LIST met opvulbyte, afsluitend id3-blok) → via formulier geaccepteerd en
    speelbaar; ZIP naar schoon profiel met gelijke bytes
V6  formulier: afgebroken WAV (alleen header, gedeeltelijk) → geweigerd met melding, niets opgeslagen

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: V1 V2 V3 V4 falen op 08197dc).
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
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402
import test_r3_audio as r3  # noqa: E402
import test_r3_zip_herstel as rz  # noqa: E402

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
rz.ROOT = ROOT
RESULTS = []
sha = lambda b: hashlib.sha256(b).hexdigest()  # noqa: E731
STATE = "() => ({ s: localStorage.getItem('birdspot-sightings'), safety: localStorage.getItem('birdspot-safety-copy') })"


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


def wav_with_extra_chunks(wav):
    fmt, data = wav[12:36], wav[36:]
    lst = b'LIST' + struct.pack('<I', 5) + b'INFOx' + b'\x00'            # oneven blok + opvulbyte
    trail = b'id3 ' + struct.pack('<I', 4) + b'abcd'                     # blok ná data
    body = b'WAVE' + fmt + lst + data + trail
    return b'RIFF' + struct.pack('<I', len(body)) + body


def setup_conflict(browser, url, tmp, tag):
    """Profiel A: waarneming S met A1; nieuwere export (B1) geïmporteerd. Geeft (ctx, a, sid, A1, B1)."""
    wav_a1 = r3.make_wav(seconds=1.5, freq=2400)
    wav_b1 = r3.make_wav(seconds=1.0, freq=1500)
    ctx, a = rz.new_profile(browser, url)
    r3.open_new_form(a); r3.add_audio(a, [{"name": "A1.wav", "mimeType": "audio/wav", "buffer": wav_a1}], 1); r3.save(a)
    sid = a.evaluate(r3.SIGHTINGS)[-1]['id']
    e1 = rz.export(a, Path(tmp) / f'{tag}-e1.zip')
    cx, x = rz.new_profile(browser, url)
    assert rz.import_zip(x, e1)
    r3.edit_from_detail(x, sid)
    x.locator('#audioAttachList .sighting-audio-item__del[data-audioid]').first.click()
    r3.add_audio(x, [{"name": "B1.wav", "mimeType": "audio/wav", "buffer": wav_b1}], 1)
    r3.save(x)
    e2 = rz.export(x, Path(tmp) / f'{tag}-e2.zip')
    cx.close()
    assert rz.import_zip(a, e2)
    return ctx, a, sid, wav_a1, wav_b1


def open_second_tab_edit(ctx, url, sid):
    b = ctx.new_page()
    boot(b, url)
    r3.edit_from_detail(b, sid)
    b.evaluate("() => { document.querySelector('#sightingMore').open = true; }")   # in Bewerken standaard open
    return b


def records_of(page, sid):
    s = next(x for x in page.evaluate(r3.SIGHTINGS) if x['id'] == sid)
    recs = {r['id']: r for r in page.evaluate(r3.RECORDS)}
    return s, [recs.get(i) for i in s.get('audioIds') or []]


def clean_check(browser, url, zpath, sid, want):
    ctx, p = rz.new_profile(browser, url)
    ok = rz.import_zip(p, zpath)
    s, recs = records_of(p, sid) if ok else ({}, [])
    played = []
    if ok and recs:
        p.wait_for_timeout(1800)
        r3.open_detail(p, sid); r3.close_detail(p)
        ctx.set_offline(True)
        played = rz.play(p, sid)
        ctx.set_offline(False)
    msg = p.evaluate("() => (window.__toasts || []).slice(-1)[0] || ''")
    ctx.close()
    good = ok and sorted(r['sha'] for r in recs if r) == sorted(want) and len(recs) == len(want) and all(r and r['sightingId'] == sid for r in recs) \
        and played and all(x['ok'] for x in played)
    return good, f"import={ok} bytes={'gelijk' if ok and sorted(r['sha'] for r in recs if r) == sorted(want) else 'ANDERS'} afspelen={len([x for x in played if x['ok']])}/{len(want)} melding='{msg[:80]}'"


def try_export(page, path):
    try:
        return rz.export(page, path), ''
    except Exception:
        return None, page.evaluate("() => (window.__toasts || []).slice(-1)[0] || ''")


def run(browser, url, tmp):
    # V1: alleen notitie in het open formulier
    ctx, a, sid, wav_a1, wav_b1 = setup_conflict(browser, url, tmp, 'v1')
    b = open_second_tab_edit(ctx, url, sid)
    toast = restore_via_ui(a)
    b.locator('#sightNotes').fill('Alleen de notitie aangepast')
    r3.save(b)
    s, recs = records_of(b, sid)
    b.reload(wait_until='domcontentloaded'); boot(b, url)
    s2, recs2 = records_of(b, sid)
    zpath, err = try_export(b, Path(tmp) / 'v1-export.zip')
    clean_ok, clean_detail = clean_check(browser, url, zpath, sid, [sha(wav_a1)]) if zpath else (False, f"export mislukt: '{err[:90]}'")
    ctx.close()
    check('V1', 'open formulier, alleen notitie, na Terugzetten in ander tabblad → koppeling A1 blijft, export herstelt schoon',
          'Teruggezet' in toast and s.get('notes') == 'Alleen de notitie aangepast' and len(recs) == 1 and recs[0] and recs[0]['sha'] == sha(wav_a1)
          and s2 == s and recs2 == recs and clean_ok,
          f"audio={[r and r['sha'][:8] for r in recs]} (A1={sha(wav_a1)[:8]}) na_heropenen_gelijk={s2 == s} | schoon: {clean_detail}")

    # V2: expliciete audiowijziging conflicteert
    ctx, a, sid, wav_a1, wav_b1 = setup_conflict(browser, url, tmp, 'v2')
    wav_c = r3.make_wav(seconds=1.2, freq=3100)
    b = open_second_tab_edit(ctx, url, sid)
    r3.add_audio(b, [{"name": "C.wav", "mimeType": "audio/wav", "buffer": wav_c}], 2)
    b.locator('#sightNotes').fill('Met nieuwe opname C')
    restore_via_ui(a)
    before = (b.evaluate(STATE), b.evaluate(r3.RECORDS))
    b.locator('#addSheetSubmit').click()
    b.wait_for_timeout(2500)
    still_open = b.locator('#addSightingSheet').is_visible()
    status = b.locator('#sightingAudioStatus').inner_text() if still_open else ''
    kept = still_open and b.locator('#sightNotes').input_value() == 'Met nieuwe opname C' and \
        b.locator('#audioAttachList .sighting-audio-item[data-audiotemp]').count() == 1
    after_first = (b.evaluate(STATE), b.evaluate(r3.RECORDS))
    unchanged = after_first == before
    if still_open:
        r3.save(b)
    s, recs = records_of(b, sid)
    shas = sorted(r['sha'] for r in recs if r)
    zpath, err = try_export(b, Path(tmp) / 'v2-export.zip')
    clean_ok, clean_detail = clean_check(browser, url, zpath, sid, [sha(wav_a1), sha(wav_c)]) if zpath else (False, f"export mislukt: '{err[:90]}'")
    ctx.close()
    check('V2', 'expliciete audiowijziging conflicteert → melding, invoer blijft, niets opgeslagen; opnieuw opslaan → A1 + C, export herstelt schoon',
          still_open and 'intussen gewijzigd' in status and kept and unchanged and shas == sorted([sha(wav_a1), sha(wav_c)]) and
          all(r and r['sightingId'] == sid for r in recs) and clean_ok,
          f"eerste_opslaan: open={still_open} melding='{status[:60]}' invoer_bewaard={kept} opslag_ongewijzigd={unchanged} | "
          f"daarna={[x[:8] for x in shas]} | schoon: {clean_detail}")

    # V3/V4: afgebroken WAV in ZIP
    src_ctx, src = rz.new_profile(browser, url)
    good_wav = r3.make_wav(seconds=1.5, freq=2400)
    r3.open_new_form(src); r3.add_audio(src, [{"name": "goed.wav", "mimeType": "audio/wav", "buffer": good_wav}], 1); r3.save(src)
    base_zip = rz.export(src, Path(tmp) / 'base.zip')
    src_ctx.close()
    z = zipfile.ZipFile(base_zip)
    aid = json.loads(z.read('gegevens.json'))['sightings'][0]['audioIds'][0]

    def with_audio(raw):
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as w:     # geldige CRC
            for name in z.namelist():
                w.writestr(name, raw if name == f'photos/{aid}.wav' else z.read(name))
        return out.getvalue()
    for code, label, raw in (('V3', 'WAV met alleen de 44-byte header', good_wav[:44]),
                             ('V4', 'WAV met gedeeltelijke audio', good_wav[:44 + 1000])):
        cv, v = rz.new_profile(browser, url)
        r3.open_new_form(v); r3.save(v)
        before = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        profile(v)
        v.locator('#importFile').set_input_files({"name": f"{code}.zip", "mimeType": "application/zip", "buffer": with_audio(raw)})
        v.wait_for_function("() => !document.querySelector('#btnImport').disabled || !!document.querySelector('#confirmOverlay:not([hidden])')", timeout=15000)
        confirm = v.locator('#confirmOverlay').is_visible()
        if confirm:
            v.locator('#confirmOk').click()
            v.wait_for_function("() => !document.querySelector('#btnImport').disabled", timeout=20000)
        msg = (v.evaluate("() => (window.__toasts || []).slice(-1)[0] || ''"))
        after = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        cv.close()
        check(code, f'ZIP (geldige CRC) met {label} → geweigerd in de voorcontrole, geen bevestiging, niets gewijzigd',
              not confirm and after == before and 'afgebroken' in msg, f"bevestiging={confirm} ongewijzigd={after == before} melding='{msg[:140]}'")

    # V5: geldige WAV met extra blokken
    extra = wav_with_extra_chunks(good_wav)
    ce, e = rz.new_profile(browser, url)
    r3.open_new_form(e); r3.add_audio(e, [{"name": "merlin-extra.wav", "mimeType": "audio/wav", "buffer": extra}], 1); r3.save(e)
    sid5 = e.evaluate(r3.SIGHTINGS)[-1]['id']
    played = rz.play(e, sid5)
    zp = rz.export(e, Path(tmp) / 'v5.zip')
    ce.close()
    clean_ok, clean_detail = clean_check(browser, url, zp, sid5, [sha(extra)])
    check('V5', 'geldige WAV met extra blokken en opvulbyte → formulier accepteert, speelt af, ZIP herstelt schoon met gelijke bytes',
          played and played[0]['ok'] and clean_ok, f"afspelen={played} | schoon: {clean_detail}")

    # V6: afgebroken WAV via het formulier
    cf, f = rz.new_profile(browser, url)
    before = f.evaluate(r3.RECORDS)
    r3.open_new_form(f)
    f.locator('#sightingAudioInput').set_input_files([
        {"name": "alleen-header.wav", "mimeType": "audio/wav", "buffer": good_wav[:44]},
        {"name": "half.wav", "mimeType": "audio/wav", "buffer": good_wav[:44 + 1000]},
    ])
    f.wait_for_function("() => /Niet toegevoegd/.test(document.querySelector('#sightingAudioStatus').textContent)", timeout=15000)
    msg = f.locator('#sightingAudioStatus').inner_text()
    items = f.locator('#audioAttachList .sighting-audio-item').count()
    r3.save(f)
    after = f.evaluate(r3.RECORDS)
    s6 = f.evaluate(r3.SIGHTINGS)[-1]
    cf.close()
    check('V6', 'formulier: afgebroken WAV (alleen header, gedeeltelijk) → geweigerd met melding, niets opgeslagen',
          items == 0 and 'alleen-header.wav' in msg and 'half.wav' in msg and 'afgebroken' in msg and after == before and not s6.get('audioIds'),
          f"items={items} melding='{msg[:120]}'")


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r3v-') as tmp:
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
    total = max(len(RESULTS), 6)
    print(f"R3-VERVOLG {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
