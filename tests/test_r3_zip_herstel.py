"""Correctieronde 3/4 na QA van R08 — audio in ZIP en Terugzetten (mobiel Chromium, echte UI-route).

Z1  P1: twee geldige Birdspot-exports van dezelfde waarneming (opname A, later B) → import van de
    nieuwere ZIP in profiel A → nieuwe export importeert volledig in een schoon profiel (koppeling,
    SHA-256, offline afspelen); Terugzetten in A herstelt A met originele bytes en ruimt alleen B op
Z2  P1: eigen opname A → andere ZIP importeren → A via Bewerken verwijderen → Terugzetten herstelt
    koppeling + bestand A; daarna export → schoon profiel volledig (koppeling, SHA-256, offline)
Z3  reeds incomplete veiligheidskopie (opname ontbreekt) → Terugzetten stopt vóór de eerste wijziging
    met duidelijke melding; waarnemingen, media en veiligheidskopie onveranderd
Z4  P2: ZIP met geldige CRC en tekstbytes als WAV → geweigerd in de voorcontrole (vóór bevestiging)
Z5  P2: ZIP die hetzelfde bestand als audio én als foto aan verschillende waarnemingen koppelt →
    geweigerd in de voorcontrole
Z6  oudere ZIP's en plekmedia: K4-plekgeluid (audio bij een plek) en een 1.27.31-ZIP blijven importeerbaar

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: Z1 Z2 Z4 Z5 falen op 92a00f6).
"""
import hashlib
import http.server
import io
import json
import os
import sys
import tempfile
import threading
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import INIT, profile, try_import  # noqa: E402
from test_r2b_qa_herstel import HOLD, restore_via_ui  # noqa: E402
import test_r3_audio as r3  # noqa: E402

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
FIXTURE = Path(__file__).resolve().parent / 'fixtures' / 'backup_pre_r2b_1.27.31_fb59085.zip'
RESULTS = []
sha = lambda b: hashlib.sha256(b).hexdigest()  # noqa: E731
STATE = """async () => ({ sightings: localStorage.getItem('birdspot-sightings'), safety: localStorage.getItem('birdspot-safety-copy') })"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def log_message(self, *_):
        pass


def new_profile(browser, url):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                              reduced_motion='reduce', service_workers='block', accept_downloads=True)
    for s in (INIT, HOLD):
        ctx.add_init_script(s)
    page = ctx.new_page()
    boot(page, url)
    return ctx, page


def export(page, path):
    profile(page)
    page.wait_for_timeout(300)
    with page.expect_download(timeout=30000) as dl:
        page.locator('#btnExport').click()
    dl.value.save_as(path)
    return path


def import_zip(page, path):
    profile(page)
    page.wait_for_timeout(1800)   # profiel herrendert na een eerdere import
    page.evaluate("() => import('/src/app.js').then(m => m.navigate('profile', { force: true }))")
    page.locator('#btnImport').wait_for(state='visible', timeout=10000)
    ok = try_import(page, path if isinstance(path, dict) else str(path))
    page.wait_for_timeout(500)
    return ok


def audio_of(page, sid):
    s = next((x for x in page.evaluate(r3.SIGHTINGS) if x['id'] == sid), None)
    ids = (s or {}).get('audioIds') or []
    recs = {r['id']: r for r in page.evaluate(r3.RECORDS)}
    return ids, [recs.get(i) for i in ids]


def play(page, sid):
    r3.open_detail(page, sid)
    out = page.evaluate(r3.PLAY)
    r3.close_detail(page)
    return out


def verify_clean(browser, url, zpath, sid, want_sha, offline=True):
    """Schoon profiel: importeer de export en controleer waarneming, koppeling, SHA-256 en afspelen."""
    ctx, p = new_profile(browser, url)
    ok = import_zip(p, zpath)
    ids, recs = audio_of(p, sid)
    played = None
    if ok and ids:
        p.wait_for_timeout(1800)
        r3.open_detail(p, sid); r3.close_detail(p)   # modules online geladen
        if offline:
            ctx.set_offline(True)
        played = play(p, sid)
        ctx.set_offline(False)
    msg = p.evaluate("() => (window.__toasts || []).slice(-1)[0] || ''")
    ctx.close()
    good = ok and len(ids) == 1 and recs[0] and recs[0]['sha'] == want_sha and recs[0]['sightingId'] == sid and played and played[0]['ok']
    return good, f"import={ok} audioIds={ids} sha_gelijk={bool(recs and recs[0] and recs[0]['sha'] == want_sha)} afspelen={played} melding='{msg[:90]}'"


def run(browser, url, tmp):
    wav_a = r3.make_wav(seconds=1.5, freq=2400)
    wav_b = r3.make_wav(seconds=1.0, freq=1500)
    wav_c = r3.make_wav(seconds=1.2, freq=3100)

    # ── Z1: twee exports van dezelfde waarneming ─────────────────────────────
    ctx_a, a = new_profile(browser, url)
    r3.open_new_form(a); r3.add_audio(a, [{"name": "opname-A.wav", "mimeType": "audio/wav", "buffer": wav_a}], 1); r3.save(a)
    sid = a.evaluate(r3.SIGHTINGS)[-1]['id']
    e1 = export(a, Path(tmp) / 'e1.zip')
    ctx_x, x = new_profile(browser, url)                       # tweede toestel: zelfde waarneming, nieuwere opname B
    assert import_zip(x, e1)
    r3.edit_from_detail(x, sid)
    x.locator('#audioAttachList .sighting-audio-item__del[data-audioid]').first.click()
    r3.add_audio(x, [{"name": "opname-B.wav", "mimeType": "audio/wav", "buffer": wav_b}], 1)
    r3.save(x)
    e2 = export(x, Path(tmp) / 'e2.zip')
    ctx_x.close()
    assert import_zip(a, e2)                                    # nieuwere ZIP wint
    ids_after, recs_after = audio_of(a, sid)
    a_kept = any(r['sha'] == sha(wav_a) for r in a.evaluate(r3.RECORDS))   # nodig voor Terugzetten
    e3 = export(a, Path(tmp) / 'e3.zip')
    clean_ok, clean_detail = verify_clean(browser, url, e3, sid, sha(wav_b))
    toast = restore_via_ui(a)
    ids_rest, recs_rest = audio_of(a, sid)
    all_rest = a.evaluate(r3.RECORDS)
    b_gone = not any(r['sha'] == sha(wav_b) for r in all_rest)
    played_a = play(a, sid)
    e4 = export(a, Path(tmp) / 'e4.zip')
    clean4_ok, clean4_detail = verify_clean(browser, url, e4, sid, sha(wav_a))
    ctx_a.close()
    check('Z1', 'twee exports van dezelfde waarneming → nieuwe export herstelt volledig in schoon profiel; Terugzetten herstelt A, ruimt alleen B op',
          len(recs_after) == 1 and recs_after[0]['sha'] == sha(wav_b) and a_kept and clean_ok and 'Teruggezet' in toast and
          len(recs_rest) == 1 and recs_rest[0] and recs_rest[0]['sha'] == sha(wav_a) and b_gone and played_a and played_a[0]['ok'] and clean4_ok,
          f"na_import={[r and r['sha'][:8] for r in recs_after]} A_bewaard={a_kept} schoon(e3): {clean_detail} | terugzetten='{toast[:30]}' "
          f"A_terug={bool(recs_rest and recs_rest[0] and recs_rest[0]['sha'] == sha(wav_a))} B_weg={b_gone} | schoon(e4): {clean4_detail}")

    # ── Z2: vooraf bestaande opname via Bewerken verwijderd, daarna Terugzetten ──
    ctx_o, o = new_profile(browser, url)                       # bron voor 'een andere ZIP'
    r3.open_new_form(o); r3.add_audio(o, [{"name": "ander.wav", "mimeType": "audio/wav", "buffer": wav_c}], 1); r3.save(o)
    other = export(o, Path(tmp) / 'other.zip')
    ctx_o.close()
    ctx_b, b = new_profile(browser, url)
    r3.open_new_form(b); r3.add_audio(b, [{"name": "eigen-A.wav", "mimeType": "audio/wav", "buffer": wav_a}], 1); r3.save(b)
    sid_b = b.evaluate(r3.SIGHTINGS)[-1]['id']
    assert import_zip(b, other)
    r3.edit_from_detail(b, sid_b)
    b.locator('#audioAttachList .sighting-audio-item__del[data-audioid]').first.click()
    r3.save(b)
    toast = restore_via_ui(b)
    ids2, recs2 = audio_of(b, sid_b)
    safety_gone = b.evaluate(STATE)['safety'] is None
    other_gone = not any(r['sha'] == sha(wav_c) for r in b.evaluate(r3.RECORDS))
    played2 = play(b, sid_b) if recs2 and recs2[0] else None
    e5 = export(b, Path(tmp) / 'e5.zip') if recs2 and recs2[0] else None
    clean5_ok, clean5_detail = verify_clean(browser, url, e5, sid_b, sha(wav_a)) if e5 else (False, 'geen export')
    ctx_b.close()
    check('Z2', 'eigen opname → andere ZIP → via Bewerken verwijderd → Terugzetten herstelt koppeling + originele bytes; export herstelt in schoon profiel',
          'Teruggezet' in toast and len(ids2) == 1 and recs2[0] and recs2[0]['sha'] == sha(wav_a) and safety_gone and other_gone and
          played2 and played2[0]['ok'] and clean5_ok,
          f"toast='{toast[:40]}' audioIds={ids2} bestand={'aanwezig' if recs2 and recs2[0] else 'ONTBREEKT'} geïmporteerd_weg={other_gone} | schoon: {clean5_detail}")

    # ── Z3: al incomplete veiligheidskopie ────────────────────────────────────
    ctx_c, c = new_profile(browser, url)
    r3.open_new_form(c); r3.add_audio(c, [{"name": "eigen.wav", "mimeType": "audio/wav", "buffer": wav_a}], 1); r3.save(c)
    sid_c = c.evaluate(r3.SIGHTINGS)[-1]['id']
    assert import_zip(c, other)
    own_id = audio_of(c, sid_c)[0][0]
    c.evaluate("async id => { const db = await import('/src/data/db.js'); await db.deletePhoto(id); }", own_id)   # opname verdwenen
    before = (c.evaluate(STATE), c.evaluate(r3.RECORDS))
    toast = restore_via_ui(c)
    after = (c.evaluate(STATE), c.evaluate(r3.RECORDS))
    ctx_c.close()
    check('Z3', 'incomplete veiligheidskopie → Terugzetten stopt vóór de eerste wijziging met duidelijke melding; alles onveranderd',
          'ontbreekt' in toast and 'niets gewijzigd' in toast.lower() and after == before and before[0]['safety'] is not None,
          f"melding='{toast[:150]}' ongewijzigd={after == before}")

    # ── Z4 + Z5: ongeldige audio in de voorcontrole ───────────────────────────
    src = zipfile.ZipFile(e1)
    data = json.loads(src.read('gegevens.json'))
    audio_id = data['sightings'][0]['audioIds'][0]

    def rebuild(mutate_data=None, replace=None):
        d = json.loads(json.dumps(data))
        if mutate_data:
            mutate_data(d)
        out = io.BytesIO()
        with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as z:   # zipfile schrijft geldige CRC's
            z.writestr('gegevens.json', json.dumps(d))
            for name in src.namelist():
                if name.startswith('photos/'):
                    z.writestr(name, replace.get(name, src.read(name)) if replace else src.read(name))
            for name, content in (replace or {}).items():
                if name not in src.namelist():
                    z.writestr(name, content)
        return out.getvalue()

    text_wav = rebuild(replace={f'photos/{audio_id}.wav': b'Dit is geen geluid, alleen tekst.\n' * 40})

    def double_use(d):
        twin = json.loads(json.dumps(d['sightings'][0]))
        twin['id'] = 'tweede-waarneming'; twin['audioIds'] = []; twin['photoIds'] = [audio_id]
        d['sightings'].append(twin)
    both = rebuild(double_use)
    for code, label, payload in (('Z4', 'tekstbytes als WAV (geldige CRC)', text_wav),
                                 ('Z5', 'zelfde bestand als audio én foto bij verschillende waarnemingen', both)):
        ctx_v, v = new_profile(browser, url)
        r3.open_new_form(v); r3.save(v)
        before = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        profile(v)
        v.locator('#importFile').set_input_files({"name": f"{code}.zip", "mimeType": "application/zip", "buffer": payload})
        v.wait_for_function("() => !document.querySelector('#btnImport').disabled || !!document.querySelector('#confirmOverlay:not([hidden])')", timeout=15000)
        confirm = v.locator('#confirmOverlay').is_visible()
        if confirm:
            v.locator('#confirmOk').click()
            v.wait_for_function("() => !document.querySelector('#btnImport').disabled", timeout=20000)
        msg = ' | '.join(v.evaluate("() => (window.__toasts || []).slice(-2)"))
        after = (v.evaluate(STATE), v.evaluate(r3.RECORDS))
        ctx_v.close()
        check(code, f'{label} → geweigerd in de voorcontrole, opslag gelijk, begrijpelijke melding',
              not confirm and after == before and 'geluidsopname' in msg.lower(),
              f"bevestiging_getoond={confirm} opslag_gelijk={after == before} melding='{msg[-150:]}'")

    # ── Z6: oudere ZIP's en plekmedia (K4-plekgeluid) ─────────────────────────
    ctx_k, k = new_profile(browser, url)
    place_zip = io.BytesIO()
    with zipfile.ZipFile(place_zip, 'w', zipfile.ZIP_STORED) as z:
        z.writestr('gegevens.json', json.dumps({
            "format": "birdspot-backup", "backupVersion": 2, "schemaVersion": 2, "exportedAt": "2026-11-01T10:00:00.000Z",
            "sightings": [], "places": [{"id": "pl_k4", "name": "Vijver K4", "lat": 52.1, "lon": 5.1,
                                         "createdAt": "2026-10-01T10:00:00.000Z", "updatedAt": "2026-10-01T10:00:00.000Z"}],
            "photoIds": ["k4-geluid"],
            "mediaMeta": [{"id": "k4-geluid", "type": "audio/wav", "filename": "plek.wav", "placeId": "pl_k4", "sightingId": None, "speciesId": None}],
            "seenSpecies": []}))
        z.writestr('photos/k4-geluid.wav', wav_c)
    k4 = import_zip(k, {"name": "k4.zip", "mimeType": "application/zip", "buffer": place_zip.getvalue()})
    k4_rec = next((r for r in k.evaluate(r3.RECORDS) if r['id'] == 'k4-geluid'), None)
    old = import_zip(k, FIXTURE)
    ctx_k.close()
    check('Z6', 'plekgeluid (K4) en oude 1.27.31-ZIP blijven importeerbaar',
          k4 and k4_rec and k4_rec['placeId'] == 'pl_k4' and k4_rec['kind'] is None and k4_rec['sha'] == sha(wav_c) and old,
          f"k4={k4} record={k4_rec and {kk: k4_rec[kk] for kk in ('kind', 'placeId')}} oud={old}")


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r3z-') as tmp:
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
    total = max(len(RESULTS), 6)
    print(f"R3-ZIP-HERSTEL {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
