"""R08 P1 na QA van #307 — één mislukt audioleesverzoek mag geen opname loskoppelen (mobiel Chromium).

L1  Waarneming met twee opnamen; Bewerken, alleen de notitie. Het leesverzoek van één opname faalt
    asynchroon, het andere slaagt. De fout loopt via de normale IndexedDB-foutafhandeling: het
    error-event gaat naar request → transactie → database, en de transactie wordt alleen afgebroken
    als niemand het event annuleert (preventDefault). Zo staat het in de standaardactie van de spec
    ("fire an error event"). Er is geen onvoorwaardelijke abort().
    Verwacht: niets opgeslagen (notitie, beide koppelingen en beide bestanden gelijk), de nieuwe notitie
    blijft in het formulier met melding, opnieuw opslaan lukt, en de ZIP in een schoon profiel bevat
    beide koppelingen met originele bytes.
L2  Onderscheid blijft: een geslaagde lezing die bevestigt dat één van de twee bestanden ontbreekt →
    die koppeling vervalt, de andere blijft, de notitie wordt opgeslagen en de export lukt.

Waarom geëmuleerd: Chromium biedt vanuit een pagina geen asynchrone leesfout die preventDefault respecteert.
Een echt ontbrekend verpakkingsbestand geeft NotReadableError, maar Chromium breekt die transactie altijd af,
ook met preventDefault. Een synthetisch error-event bereikt de transactie wel, maar zonder standaardactie.

BIRDSPOT_APP_ROOT=<checkout> test een andere commit (bewijs: L1 faalt op a5e0918).
"""
import hashlib
import http.server
import os
import sys
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import test_r3_audio as r3  # noqa: E402
import test_r3_zip_herstel as rz  # noqa: E402
import test_r3_vervolg as rv  # noqa: E402

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT') or Path(__file__).resolve().parent.parent).resolve()
rz.ROOT = ROOT
RESULTS = []
sha = lambda b: hashlib.sha256(b).hexdigest()  # noqa: E731
STATE = "() => ({ s: localStorage.getItem('birdspot-sightings'), safety: localStorage.getItem('birdspot-safety-copy') })"
FAIL_ONE_READ = """(() => { const get = IDBObjectStore.prototype.get;
  IDBObjectStore.prototype.get = function (...args) {
    const request = get.apply(this, args);
    if (window.__failAudioRead && this.name === 'photos' && this.transaction.mode === 'readonly' && args[0] === window.__failAudioRead) {
      window.__failAudioRead = null; window.__readFailed = { fired: false };
      request.addEventListener('success', event => {            // vóór de onsuccess van de app (eerder geregistreerd)
        event.stopImmediatePropagation();                         // dit verzoek levert géén resultaat
        const error = new DOMException('Gesimuleerde leesfout', 'UnknownError');
        Object.defineProperty(request, 'error', { value: error, configurable: true });
        Object.defineProperty(request, 'result', { get() { throw new DOMException('Geen resultaat', 'InvalidStateError'); }, configurable: true });
        const errorEvent = new Event('error', { bubbles: true, cancelable: true });
        const notCancelled = request.dispatchEvent(errorEvent);   // request → transactie → database
        window.__readFailed = { fired: true, cancelled: !notCancelled, aborted: false };
        if (notCancelled) {                                       // standaardactie van de spec
          try { request.transaction.abort(); window.__readFailed.aborted = true; } catch (_) {}
        }
      });
    }
    return request;
  }; })();"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


def two_audio_sighting(browser, url):
    ctx, p = rz.new_profile(browser, url)
    p.context.add_init_script(FAIL_ONE_READ)
    p.reload(wait_until='domcontentloaded'); rz.boot(p, url)
    wa, wb = r3.make_wav(seconds=1.5, freq=2400), r3.make_wav(seconds=1.2, freq=1300)
    r3.open_new_form(p)
    r3.add_audio(p, [{"name": "A.wav", "mimeType": "audio/wav", "buffer": wa},
                     {"name": "B.wav", "mimeType": "audio/wav", "buffer": wb}], 2)
    p.evaluate("() => { document.querySelector('#sightingMore').open = true; }")
    p.locator('#sightNotes').fill('Oude notitie')
    r3.save(p)
    s = p.evaluate(r3.SIGHTINGS)[-1]
    return ctx, p, s['id'], s['audioIds'], [sha(wa), sha(wb)]


def edit_note(p, sid, text):
    r3.edit_from_detail(p, sid)
    p.evaluate("() => { document.querySelector('#sightingMore').open = true; }")
    p.locator('#sightNotes').fill(text)


def run(browser, url, tmp):
    # L1
    ctx, p, sid, aids, shas = two_audio_sighting(browser, url)
    edit_note(p, sid, 'Nieuwe notitie na leesfout')
    before = (p.evaluate(STATE), p.evaluate(r3.RECORDS))
    p.evaluate("id => { window.__failAudioRead = id; }", aids[1])
    p.locator('#addSheetSubmit').click()
    p.wait_for_timeout(2500)
    fail = p.evaluate("() => window.__readFailed || null")
    open_ = p.locator('#addSightingSheet').is_visible()
    status = p.locator('#sightingAudioStatus').inner_text() if open_ else ''
    kept = open_ and p.locator('#sightNotes').input_value() == 'Nieuwe notitie na leesfout'
    unchanged = (p.evaluate(STATE), p.evaluate(r3.RECORDS)) == before
    s_mid, recs_mid = rv.records_of(p, sid)
    first = (f"leesfout={fail} open={open_} invoer={kept} melding='{status[:60]}' ongewijzigd={unchanged} "
             f"opgeslagen: notitie='{s_mid.get('notes')}' koppelingen={len(s_mid.get('audioIds') or [])}/2 "
             f"bestanden={sum(1 for r in recs_mid if r)}/2")
    if open_:
        r3.save(p)
    s, recs = rv.records_of(p, sid)
    zp = rz.export(p, Path(tmp) / 'l1.zip')
    ctx.close()
    clean_ok, clean_detail = rv.clean_check(browser, url, zp, sid, shas)
    check('L1', 'één van twee leesverzoeken faalt asynchroon → niets opgeslagen, invoer + melding; opnieuw opslaan lukt; ZIP schoon met beide opnamen',
          bool(fail and fail['fired']) and open_ and kept and 'niet worden gelezen' in status and unchanged
          and s_mid.get('notes') == 'Oude notitie' and s_mid.get('audioIds') == aids
          and s.get('notes') == 'Nieuwe notitie na leesfout' and s.get('audioIds') == aids
          and sorted(r['sha'] for r in recs if r) == sorted(shas) and clean_ok,
          f"{first} | daarna: notitie='{s.get('notes')}' koppelingen={len(s.get('audioIds') or [])}/2 | schoon: {clean_detail}")

    # L2
    ctx, p, sid, aids, shas = two_audio_sighting(browser, url)
    p.evaluate("async id => (await import('/src/data/db.js')).deletePhoto(id)", aids[1])
    edit_note(p, sid, 'Eén bestand ontbrak')
    r3.save(p)
    s, recs = rv.records_of(p, sid)
    zp, err = rv.try_export(p, Path(tmp) / 'l2.zip')
    ctx.close()
    check('L2', 'geslaagde lezing bevestigt dat één bestand ontbreekt → alleen die koppeling vervalt, notitie opgeslagen, export lukt',
          s.get('audioIds') == [aids[0]] and s.get('notes') == 'Eén bestand ontbrak' and recs and recs[0] and recs[0]['sha'] == shas[0] and zp is not None,
          f"audioIds={len(s.get('audioIds') or [])}/1 export={'ok' if zp else err[:80]}")


def main():
    with tempfile.TemporaryDirectory(prefix='birdspot-r3l-') as tmp:
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
    total = max(len(RESULTS), 2)
    print(f"R3-LEESFOUT {'PASS' if passed == total else 'FAIL'}: {passed}/{total}")
    sys.exit(0 if passed == total else 1)


if __name__ == '__main__':
    main()
