"""Ronde 2B (Chromium, 390 px): plekconsolidatie, privé-omgevingsfoto's per plek en ZIP-herstel.

C  consolidatie   C1 één plek + nauwkeurige GPS → zelfde placeId inline, eigen lat/lon/datum/tijd
                  C2 'Aparte spot' → nieuwe plek    C3 GPS ±80 m → nooit automatisch, wel aanbod
                  C4 twee plekken → compacte keuze  C5 twee plekken → bewust aparte spot
                  C6 getypte pin (nauwkeurigheid onbekend) → alleen aanbod
                  C7 oud aanbod nooit toegepast na nieuwe pin   C8 straal 100 m → geen aanbod
                  C9 kaart: één plekkaartje met beide waarnemingen, plekken nooit samengevoegd
E  omgevingsfoto  E1 toevoegen (thumb zonder EXIF, gescheiden van vogelmedia)  E2 herladen
                  E3 toelichting  E4 zoomen  E5 terug (knop, Escape, browser-terug)
                  E6 annuleren (bestandskiezer, verwijderen)  E7 opslagfout  E8 ongeldig bestand
                  E9 verwijderen
R  race           R1 toelichting-opslaan tegelijk met verwijderen: foto blijft weg
                  R1-mutant: dezelfde test met de naïeve (lees-dan-schrijf) code MOET falen
Z  ZIP            Z1 export (backupVersion 2, env-metadata, geen thumbs)  Z2 herstel op schoon profiel + relaties
                  Z3 ongeldige ZIP's laten bestaande data intact  Z4 oude ZIP (fb59085) blijft werken
                  Z5 offline heropenen na herstel + offline omgevingsfoto toevoegen  Z6 herimport zonder dubbelen

Starten (vanuit repo-root):  python tests/test_r2b_places_env_zip.py
"""
import hashlib
import io
import json
import re
import sys
import tempfile
import threading
import zipfile
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import Quiet, Server  # noqa: E402
from test_feature_reconciliation import boot  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests/screenshots/r2b"
OLD_ZIP = ROOT / "tests/fixtures/backup_pre_r2b_1.27.31_fb59085.zip"
M_LAT = 111194.93  # meter per graad breedte (zelfde aardstraal als places.js)
BASE = (52.20000, 5.30000)
PLACE_A = {"id": "pl_a", "name": "Plas Noord", "lat": BASE[0], "lon": BASE[1]}
PLACE_B = {"id": "pl_b", "name": "Rietkraag Zuid", "lat": BASE[0] - 180 / M_LAT, "lon": BASE[1]}
RESULTS = []


def north(m):
    return round(BASE[0] + m / M_LAT, 7), BASE[1]


def check(code, name, ok, detail=""):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)
    if not ok:
        raise AssertionError(f"{code} {name}: {detail}")


INIT = """
(() => {
  window.__gps = null;           // {lat, lon, acc}; null = geen GPS-antwoord
  const q = navigator.permissions && navigator.permissions.query.bind(navigator.permissions);
  if (navigator.permissions) navigator.permissions.query = d => d && d.name === 'geolocation'
    ? Promise.resolve({ state: window.__gps ? 'granted' : 'prompt' }) : q(d);
  navigator.geolocation.getCurrentPosition = (ok, err) => {
    const g = window.__gps;
    if (!g) { setTimeout(() => err && err({ code: 1 }), 20); return; }
    setTimeout(() => ok({ coords: { latitude: g.lat, longitude: g.lon, accuracy: g.acc } }), 60);
  };
  // E7: gesimuleerde opslagfout voor omgevingsfoto's (quota/IDB-fout)
  const put = IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put = function (value, ...rest) {
    if (window.__failEnvPut && value && value.kind === 'place-env') throw new DOMException('Quota (test)', 'QuotaExceededError');
    return put.call(this, value, ...rest);
  };
})();"""


def seed_places(page, places, gps=None):
    page.evaluate("""([places, gps]) => {
      localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places: places.map(p => ({
        createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z', ...p })) }));
      window.__gps = gps;
    }""", [places, gps])


def stored(page):
    return page.evaluate("""() => ({
      sightings: (JSON.parse(localStorage.getItem('birdspot-sightings') || '{}').sightings || []),
      places: (JSON.parse(localStorage.getItem('birdspot-places') || 'null')?.places || []),
    })""")


def open_add(page):
    page.locator('#fab').click()
    page.get_by_role('dialog').get_by_role('button', name='Waarneming toevoegen').click()
    page.locator('#addSightingSheet').wait_for(state='visible', timeout=12000)


def pick_species(page):
    page.locator('#speciesPickerBtn').click()
    page.locator('#spPickerList .species-row[data-id="sp001"]').click()
    page.locator('#speciesPickerBtn .species-picker-btn__name').wait_for(timeout=8000)


def typed_pin(page, lat, lon):
    page.locator('#sightPinBtn').click()
    page.locator('#pinLat').wait_for(timeout=9000)
    page.locator('#pinLat').fill(str(lat))
    page.locator('#pinLon').fill(str(lon))
    page.locator('#pinConfirm').click()
    page.locator('#pinLocationMap').wait_for(state='detached', timeout=9000)


def save(page):
    before = len(stored(page)["sightings"])
    page.locator('#addSheetSubmit').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=12000)
    rows = stored(page)["sightings"]
    assert len(rows) == before + 1, (before, len(rows))
    return rows[-1]


def no_modal(page):
    return page.locator('.place-prompt').count() == 0 and page.evaluate(
        "() => [...document.querySelectorAll('[aria-modal=true]')].filter(d => d.getClientRects().length && !d.closest('[hidden],[inert]') && (!d.closest('.sheet-overlay') || d.closest('.sheet-overlay.open')))"
        ".every(d => d.closest('#addSightingSheet'))")


def wait_hint(page, text):
    try:
        page.wait_for_function("t => (document.querySelector('#coordsHint')?.innerText || '').includes(t)", arg=text, timeout=9000)
    except Exception as error:
        hint = page.locator('#coordsHint').inner_text() if page.locator('#coordsHint').count() else '(geen hint)'
        raise AssertionError(f"hint bevat '{text}' niet: {hint!r}") from error


def reset_profile(page, url, places, gps):
    page.evaluate("() => { localStorage.clear(); indexedDB.deleteDatabase('birdspot-library'); }")
    page.reload(wait_until='domcontentloaded')
    boot(page, url)
    seed_places(page, places, gps)


# ── Consolidatie ─────────────────────────────────────────────────────────────
def consolidation(page, url):
    lat, lon = north(120)
    reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 9})
    open_add(page); pick_species(page)
    wait_hint(page, 'Bekende plek: Plas Noord')
    page.locator('#sightDate').fill('2026-06-03')
    page.locator('#sightTime').fill('06:41')
    page.locator('#sightTime').dispatch_event('change')
    ok_modal = no_modal(page)
    page.screenshot(path=str(SHOTS / 'c1_inline_390.png'))
    r = save(page)
    st = stored(page)
    check('C1', 'één plek + GPS ±9 m → zelfde placeId inline', ok_modal and r['placeId'] == 'pl_a' and
          abs(r['lat'] - lat) < 1e-9 and abs(r['lon'] - lon) < 1e-9 and r['date'] == '2026-06-03' and
          r['time'] == '06:41' and r['pinAccuracyM'] == 9 and len(st['places']) == 1,
          f"modal-vrij={ok_modal} acc={r['pinAccuracyM']} placeId={r['placeId']} lat/lon={r['lat']},{r['lon']} (verwacht {lat},{lon}) {r['date']} {r['time']} plekken={len(st['places'])}")

    open_add(page); pick_species(page)
    wait_hint(page, 'Bekende plek: Plas Noord')
    page.locator('#coordsHint [data-place-separate]').click()
    wait_hint(page, 'Aparte spot')
    r = save(page); st = stored(page)
    check('C2', "'Aparte spot' → nieuwe plek, bestaande plek ongewijzigd", r['placeId'] not in (None, 'pl_a') and
          len(st['places']) == 2 and next(p for p in st['places'] if p['id'] == 'pl_a')['lat'] == PLACE_A['lat'],
          f"placeId={r['placeId']}")

    reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 80})
    open_add(page); pick_species(page)
    wait_hint(page, 'Niet automatisch gekoppeld: positie ±80 m')
    offered = page.locator('#coordsHint [data-place-choice="pl_a"]').count() == 1
    r1 = save(page)
    reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 80})
    open_add(page); pick_species(page)
    wait_hint(page, 'Niet automatisch')
    page.locator('#coordsHint [data-place-choice="pl_a"]').click()
    wait_hint(page, 'Bekende plek: Plas Noord')
    r2 = save(page)
    check('C3', 'GPS ±80 m → nooit automatisch; aanbod koppelt pas na tik', offered and r1['placeId'] != 'pl_a' and
          r2['placeId'] == 'pl_a' and r2['pinAccuracyM'] == 80, f"zonder tik={r1['placeId']} met tik={r2['placeId']}")

    lat2, lon2 = north(-60)
    reset_profile(page, url, [PLACE_A, PLACE_B], {"lat": lat2, "lon": lon2, "acc": 5})
    open_add(page); pick_species(page)
    wait_hint(page, '2 bekende plekken binnen 250 m')
    choices = page.locator('#coordsHint [data-place-choice]').all_inner_texts()
    linked_before = page.locator('#coordsHint [data-place-state="linked"]').count()
    page.screenshot(path=str(SHOTS / 'c4_keuze_390.png'))
    page.locator('#coordsHint [data-place-choice="pl_b"]').click()
    wait_hint(page, 'Bekende plek: Rietkraag Zuid')
    r = save(page)
    check('C4', 'twee plekken → compacte keuze, niets automatisch', len(choices) == 2 and linked_before == 0 and
          choices[0].startswith('Plas Noord') and r['placeId'] == 'pl_b' and abs(r['lat'] - lat2) < 1e-9,
          f"keuzes={choices} gekozen={r['placeId']}")

    open_add(page); pick_species(page)
    wait_hint(page, '2 bekende plekken')
    page.locator('#coordsHint .place-offer [data-place-separate]').click()
    wait_hint(page, 'Aparte spot')
    r = save(page); st = stored(page)
    check('C5', 'twee plekken → bewust aparte spot', r['placeId'] not in ('pl_a', 'pl_b') and len(st['places']) == 3)

    reset_profile(page, url, [PLACE_A], None)
    open_add(page); pick_species(page)
    tl, tn = north(40)
    typed_pin(page, tl, tn)
    wait_hint(page, 'nauwkeurigheid onbekend')
    r = save(page)
    check('C6', 'getypte pin (onbekende nauwkeurigheid) → alleen aanbod', r['placeId'] != 'pl_a' and r['pinAccuracyM'] is None)

    reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 9})
    open_add(page); pick_species(page)
    wait_hint(page, 'Bekende plek: Plas Noord')
    typed_pin(page, 51.0, 4.0)
    wait_hint(page, 'Nieuwe plek')
    stale = page.locator('#coordsHint [data-place-choice], #coordsHint [data-place-state="linked"]').count()
    r = save(page)
    check('C7', 'oude koppeling vervalt bij nieuwe pin (ver weg)', stale == 0 and r['placeId'] != 'pl_a' and r['lat'] == 51.0,
          f"placeId={r['placeId']}")

    reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 9})
    page.evaluate("() => localStorage.setItem('birdspot-settings', JSON.stringify({ placeRadiusM: 100 }))")
    open_add(page); pick_species(page)
    wait_hint(page, 'Nieuwe plek')
    page.wait_for_timeout(300)
    offered = page.locator('#coordsHint [data-place-choice], #coordsHint [data-place-state="linked"]').count()
    r = save(page)
    check('C8', 'straal 100 m: plek op 120 m wordt niet aangeboden', r['placeId'] != 'pl_a' and offered == 0)

    # C9: twee waarnemingen op dezelfde plek → één plekkaartje; plekken nooit samengevoegd
    reset_profile(page, url, [PLACE_A, PLACE_B], {"lat": lat, "lon": lon, "acc": 7})
    for _ in range(2):
        open_add(page); pick_species(page)
        wait_hint(page, 'Bekende plek: Plas Noord')
        save(page)
    open_place(page, 'pl_a')
    n_rows = page.locator('#mapSheetBody .place-sightings li').count()
    st = stored(page)
    check('C9', 'kaart: één plek met beide waarnemingen; plekken niet samengevoegd',
          n_rows == 2 and len(st['places']) == 2 and {p['id'] for p in st['places']} == {'pl_a', 'pl_b'},
          f"rijen={n_rows} plekken={[p['id'] for p in st['places']]}")
    close_place(page)


# ── Omgevingsfoto's ──────────────────────────────────────────────────────────
def jpeg_with_exif(color=(30, 120, 80)):
    img = Image.new('RGB', (640, 480), color)
    exif = Image.Exif()
    exif[0x010F] = 'BirdspotTestCam'      # Make
    exif[0x0110] = 'R2B-EXIF-MARKER'      # Model
    buf = io.BytesIO()
    img.save(buf, 'JPEG', exif=exif.tobytes(), quality=85)
    return buf.getvalue()


def open_place(page, place_id):
    page.evaluate("id => import('/src/app.js').then(m => m.navigate('map', { force: true, target: { placeId: id } }))", place_id)
    page.locator('#mapDetailSheet.open').wait_for(timeout=20000)
    page.locator('#placeEnvAdd').wait_for(timeout=10000)


def close_place(page):
    if page.locator('#mapDetailSheet.open').count():
        page.locator('#mapSheetClose').click()
        page.wait_for_function("() => !document.querySelector('#mapDetailSheet.open')")


def env_records(page, place_id=None):
    return page.evaluate("""async pid => {
      const { getDB } = await import('/src/data/db.js');
      const db = await getDB();
      const all = await new Promise((ok, no) => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
      const out = [];
      for (const p of all.filter(p => p.kind === 'place-env' && (!pid || p.placeId === pid))) {
        const t = p.thumb instanceof Blob ? new Uint8Array(await p.thumb.arrayBuffer()) : null;
        const o = new Uint8Array(await p.blob.arrayBuffer());
        const has = (b, s) => !!b && new TextDecoder('latin1').decode(b).includes(s);
        out.push({ id: p.id, placeId: p.placeId, caption: p.caption, type: p.type, sightingId: p.sightingId, speciesId: p.speciesId,
          thumbBytes: t ? t.length : 0, thumbExif: has(t, 'Exif') || has(t, 'R2B-EXIF-MARKER'),
          origExif: has(o, 'R2B-EXIF-MARKER'), origHash: Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', o))).map(x => x.toString(16).padStart(2, '0')).join('') });
      }
      return out;
    }""", place_id)


def add_env(page, payloads):
    page.locator('#placeEnvInput').set_input_files(payloads)
    page.wait_for_function("() => !document.querySelector('#placeEnvAdd').disabled && !/opslaan…/i.test(document.querySelector('#placeEnvStatus').textContent)", timeout=15000)
    return page.locator('#placeEnvStatus').inner_text()


def env_photos(page, url):
    reset_profile(page, url, [PLACE_A, PLACE_B], None)
    page.evaluate("""async () => {
      const { savePhoto } = await import('/src/data/db.js');
      const c = document.createElement('canvas'); c.width = 8; c.height = 8; c.getContext('2d').fillRect(0, 0, 8, 8);
      const png = await new Promise(r => c.toBlob(r, 'image/png'));
      await savePhoto({ id: 'pm_k4', blob: png, type: 'image/png', filename: 'k4.png', speciesId: null, sightingId: null, placeId: 'pl_a', addedAt: '2026-05-01T00:00:00Z' });
    }""")
    open_place(page, 'pl_a')
    msg = add_env(page, [{"name": "omgeving.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif()}])
    recs = env_records(page, 'pl_a')
    sep = page.evaluate("""async () => {
      const db = await import('/src/data/db.js');
      const meta = await db.getMediaMetadata(); const k4 = await db.getMediaByPlace('pl_a');
      return { meta: meta.map(m => m.id), k4: k4.map(m => m.id) };
    }""")
    grid = page.locator('#placeEnvGrid [data-env-id]').count()
    page.screenshot(path=str(SHOTS / 'e1_omgevingsfoto_390.png'))
    check('E1', 'omgevingsfoto toevoegen: lokaal, thumb zonder EXIF, gescheiden van vogelmedia',
          'opgeslagen' in msg and grid == 1 and len(recs) == 1 and recs[0]['placeId'] == 'pl_a' and
          recs[0]['thumbBytes'] > 0 and not recs[0]['thumbExif'] and recs[0]['origExif'] and
          recs[0]['sightingId'] is None and recs[0]['speciesId'] is None and
          recs[0]['id'] not in sep['meta'] and sep['k4'] == ['pm_k4'],
          f"status='{msg}' thumbExif={recs[0]['thumbExif'] if recs else '-'} mediaMeta={sep}")
    env_id = recs[0]['id']

    page.reload(wait_until='domcontentloaded'); boot(page, url)
    open_place(page, 'pl_a')
    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').wait_for(timeout=8000)
    check('E2', 'na herladen nog aanwezig', len(env_records(page, 'pl_a')) == 1 and len(env_records(page, 'pl_b')) == 0)

    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.locator('#placeEnvCaption').fill('Rietkraag links van het bankje')
    page.locator('#placeEnvCaptionSave').click()
    page.wait_for_function("() => /bewaard/.test(document.querySelector('#placeEnvStatus').textContent)")
    page.locator('#placeEnvBack').click()
    page.reload(wait_until='domcontentloaded'); boot(page, url)
    open_place(page, 'pl_a')
    cap_tile = page.locator(f'#placeEnvGrid [data-env-id="{env_id}"] .place-env__cap').inner_text()
    check('E3', 'toelichting bewaard na herladen', env_records(page, 'pl_a')[0]['caption'] == 'Rietkraag links van het bankje'
          and 'Rietkraag' in cap_tile)

    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.locator('#placeEnvZoom').click()
    viewer = page.locator('.sd-photo-viewer')
    viewer.wait_for(timeout=5000)
    page.locator('.sd-photo-viewer [data-zoom="in"]').click()
    page.wait_for_function("() => document.querySelector('.sd-photo-viewer .sd-photo-viewport')?.classList.contains('is-zoomed')", timeout=5000)
    zoomed = True
    page.keyboard.press('Escape')
    viewer.wait_for(state='detached', timeout=5000)
    still_detail = page.locator('#placeEnvDetail').is_visible()
    check('E4', 'bekijken/zoomen; Escape sluit alleen de viewer', zoomed and still_detail, f"zoom={zoomed}")

    page.keyboard.press('Escape')
    esc_back = page.locator('#placeEnvDetail').is_hidden() and page.locator('#mapDetailSheet.open').count() == 1
    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.go_back()
    page.wait_for_function("() => document.querySelector('#placeEnvDetail')?.hidden === true", timeout=5000)
    hist_back = page.locator('#mapDetailSheet.open').count() == 1
    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.locator('#placeEnvBack').click()
    btn_back = page.locator('#placeEnvDetail').is_hidden() and page.locator('#placeEnvGrid').is_visible()
    check('E5', 'terug: Escape, browser-terug en knop gaan naar de plek, niet uit het kaartje',
          esc_back and hist_back and btn_back, f"esc={esc_back} browser={hist_back} knop={btn_back}")

    page.locator('#placeEnvInput').set_input_files([])
    no_change = len(env_records(page)) == 1
    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.locator('#placeEnvDelete').click()
    page.locator('#placeEnvDeleteCancel').click()
    kept = page.locator('#placeEnvConfirm').is_hidden() and len(env_records(page)) == 1
    page.locator('#placeEnvBack').click()
    check('E6', 'annuleren (bestandskiezer leeg, verwijderen annuleren) verandert niets', no_change and kept)

    page.evaluate("() => { window.__failEnvPut = true; }")
    msg = add_env(page, [{"name": "twee.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif((200, 40, 40))}])
    page.evaluate("() => { window.__failEnvPut = false; }")
    check('E7', 'opslagfout: duidelijke melding, niets gewijzigd', 'mislukt' in msg and len(env_records(page)) == 1, msg)

    msg = add_env(page, [{"name": "notitie.txt", "mimeType": "text/plain", "buffer": b"geen foto"},
                         {"name": "foto.heic", "mimeType": "image/heic", "buffer": b"\x00\x00\x00\x18ftypheic"}])
    check('E8', 'ongeldig/HEIC-bestand geweigerd, niets opgeslagen', 'Geen bruikbare foto' in msg and len(env_records(page)) == 1, msg)

    page.locator(f'#placeEnvGrid [data-env-id="{env_id}"]').click()
    page.locator('#placeEnvDelete').click()
    page.locator('#placeEnvDeleteYes').click()
    page.wait_for_function("() => /verwijderd/.test(document.querySelector('#placeEnvStatus').textContent)")
    check('E9', 'verwijderen na bevestiging', len(env_records(page)) == 0 and page.locator('#placeEnvGrid [data-env-id]').count() == 0)
    close_place(page)


# ── Race ─────────────────────────────────────────────────────────────────────
RACE_JS = """async () => {
  localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places: [{ id: 'pl_r', name: 'R', lat: 52, lon: 5 }] }));
  const env = await import('/src/data/placeEnv.js');
  const { getPhoto } = await import('/src/data/db.js');
  const c = document.createElement('canvas'); c.width = 16; c.height = 16; c.getContext('2d').fillRect(0, 0, 16, 16);
  const file = new File([await new Promise(r => c.toBlob(r, 'image/jpeg'))], 'r.jpg', { type: 'image/jpeg' });
  const { added } = await env.addEnvPhotos('pl_r', [file]);
  const id = added[0].id;
  const pending = env.updateEnvCaption(id, 'gelijktijdig');   // niet afwachten: gebruiker tikt Bewaar…
  await env.deleteEnvPhoto(id);                               // …en direct daarna Verwijderen
  await pending.catch(() => {});
  return { resurrected: !!(await getPhoto(id)) };
}"""

# Naïeve variant (de bug die de fix voorkomt): lezen en schrijven in twee transacties.
MUTANT = """export function updateEnvCaption(id, caption) {
  return (async () => {
    const db = await getDB();
    const rec = await new Promise((ok, no) => {
      const r = db.transaction('photos').objectStore('photos').get(id);
      r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error);
    });
    if (!rec) return null;
    const next = { ...rec, caption: cleanCaption(caption), updatedAt: new Date().toISOString() };
    await changePhotos({ put: [next] });
    return next;
  })();
}"""


def race(browser, url):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    page = ctx.new_page(); boot(page, url)
    fixed = page.evaluate(RACE_JS)
    ctx.close()
    check('R1', 'toelichting opslaan tijdens verwijderen: foto komt niet terug', not fixed['resurrected'], str(fixed))

    src = (ROOT / 'src/data/placeEnv.js').read_text(encoding='utf-8')
    mutated, n = re.subn(r"export function updateEnvCaption\(id, caption\) \{\n  return updateEnvRecord\(id, \(\) => \(\{ caption: cleanCaption\(caption\) \}\)\);\n\}", MUTANT, src)
    assert n == 1, 'mutatiepunt niet gevonden'
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    ctx.route('**/src/data/placeEnv.js', lambda route: route.fulfill(status=200, content_type='text/javascript', body=mutated))
    page = ctx.new_page(); boot(page, url)
    mutant = page.evaluate(RACE_JS)
    ctx.close()
    check('R1-mutant', 'zonder fix faalt de racetest aantoonbaar (foto kwam terug)', mutant['resurrected'], str(mutant))


# ── ZIP ──────────────────────────────────────────────────────────────────────
SNAPSHOT_JS = """async () => {
  const keys = ['birdspot-sightings', 'birdspot-places', 'birdspot-seen-species'];
  const ls = Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)]));
  const { getDB } = await import('/src/data/db.js');
  const db = await getDB();
  const all = await new Promise((ok, no) => { const r = db.transaction('photos').objectStore('photos').getAll(); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
  const media = [];
  for (const p of all.sort((a, b) => a.id.localeCompare(b.id))) {
    const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await p.blob.arrayBuffer()))).map(x => x.toString(16).padStart(2, '0')).join('');
    media.push([p.id, p.kind || null, p.placeId || null, p.sightingId || null, p.caption ?? null, h]);
  }
  return { ls, media };
}"""


def seed_source(page):
    page.evaluate("""async () => {
      localStorage.setItem('birdspot-places', JSON.stringify({ schemaVersion: 1, places: [
        { id: 'pl_a', name: 'Plas Noord', lat: 52.2, lon: 5.3, createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' },
        { id: 'pl_b', name: 'Rietkraag Zuid', lat: 52.1984, lon: 5.3, createdAt: '2026-05-01T08:00:00.000Z', updatedAt: '2026-05-01T08:00:00.000Z' }] }));
      localStorage.setItem('birdspot-sightings', JSON.stringify({ schemaVersion: 2, sightings: [
        { id: 'z_s1', speciesId: 'sp045', speciesName: 'Merel', date: '2026-06-01', time: '07:05', count: 1, certainty: 'certain',
          lat: 52.2009, lon: 5.3001, pinAccuracyM: 8, placeId: 'pl_a', locationName: 'Plas Noord', photoIds: ['z_f1'],
          notes: 'R2B-ZIP', createdAt: '2026-06-01T07:06:00.000Z', updatedAt: '2026-06-01T07:06:00.000Z' },
        { id: 'z_s2', speciesId: 'sp118', speciesName: 'Rietgors', date: '2026-06-02', time: '18:20', count: 2, certainty: 'probable',
          lat: 52.1985, lon: 5.3002, pinAccuracyM: 12, placeId: 'pl_b', locationName: 'Rietkraag Zuid', photoIds: [],
          notes: 'R2B-ZIP', createdAt: '2026-06-02T18:21:00.000Z', updatedAt: '2026-06-02T18:21:00.000Z' }] }));
      const { savePhoto } = await import('/src/data/db.js');
      const env = await import('/src/data/placeEnv.js');
      const c = document.createElement('canvas'); c.width = 40; c.height = 30; const g = c.getContext('2d');
      const blob = async (col, type) => { g.fillStyle = col; g.fillRect(0, 0, 40, 30); return new Promise(r => c.toBlob(r, type)); };
      await savePhoto({ id: 'z_f1', blob: await blob('#226', 'image/png'), type: 'image/png', filename: 'merel.png', speciesId: 'sp045', sightingId: 'z_s1', addedAt: '2026-06-01T07:06:00.000Z' });
      await savePhoto({ id: 'z_k4', blob: await blob('#842', 'image/png'), type: 'image/png', filename: 'k4.png', speciesId: null, sightingId: null, placeId: 'pl_a', addedAt: '2026-06-01T07:06:00.000Z' });
      const f = async (col, name) => new File([await blob(col, 'image/jpeg')], name, { type: 'image/jpeg' });
      const a = await env.addEnvPhotos('pl_a', [await f('#3a7', 'a1.jpg'), await f('#7a3', 'a2.jpg')]);
      const b = await env.addEnvPhotos('pl_b', [await f('#a37', 'b1.jpg')]);
      await env.updateEnvCaption(a.added[0].id, 'Uitkijkpunt bij de dijk');
      return { a: a.added.map(x => x.id), b: b.added.map(x => x.id) };
    }""")


def profile(page):
    page.locator('.nav-item[data-route="profile"]').click()
    page.locator('#btnExport').wait_for(timeout=10000)


def try_import(page, payload):
    """Probeer een import; geeft True als er een bevestiging verscheen (en is bevestigd)."""
    page.locator('#importFile').set_input_files(payload)
    page.wait_for_function("() => !document.querySelector('#btnImport').disabled || !!document.querySelector('#confirmOverlay:not([hidden])')", timeout=15000)
    if page.locator('#confirmOverlay').is_visible():
        page.locator('#confirmOk').click()
        page.wait_for_function("() => !document.querySelector('#btnImport').disabled", timeout=20000)
        return True
    return False


def rezip(src_bytes, mutate_json=None, drop=None, corrupt=None):
    zin = zipfile.ZipFile(io.BytesIO(src_bytes))
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_STORED) as zout:
        for name in zin.namelist():
            if drop and re.search(drop, name):
                continue
            data = zin.read(name)
            if name == 'gegevens.json' and mutate_json:
                d = json.loads(data); mutate_json(d); data = json.dumps(d).encode()
            zout.writestr(name, data)
    b = bytearray(out.getvalue())
    if corrupt:
        i = b.find(corrupt)
        b[i] ^= 0xFF
    return bytes(b)


def zip_suite(browser, url, tmp):
    src_ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block", accept_downloads=True)
    src = src_ctx.new_page(); errors = []
    src.on('pageerror', lambda e: errors.append('src: ' + str(e)))
    boot(src, url)
    ids = seed_source(src)
    before_src = src.evaluate(SNAPSHOT_JS)
    profile(src)
    with src.expect_download(timeout=20000) as dl:
        src.locator('#btnExport').click()
    zpath = Path(tmp) / 'r2b.zip'; dl.value.save_as(zpath)
    zbytes = zpath.read_bytes()
    z = zipfile.ZipFile(io.BytesIO(zbytes)); data = json.loads(z.read('gegevens.json'))
    env_meta = [m for m in data['mediaMeta'] if m.get('kind') == 'place-env']
    names = z.namelist()
    check('Z1', 'export: backupVersion 2, plekken + 3 omgevingsfoto\'s met relatie/toelichting, geen thumbs',
          data.get('backupVersion') == 2 and len(data['places']) == 2 and len(env_meta) == 3 and
          any(m['caption'] == 'Uitkijkpunt bij de dijk' for m in env_meta) and
          all(f"photos/{m['id']}.jpg" in names for m in env_meta) and not any('thumb' in n for n in names),
          f"bestanden={len(names)} env={len(env_meta)}")

    dst_ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="allow", accept_downloads=True)
    dst = dst_ctx.new_page(); dst.on('pageerror', lambda e: errors.append('dst: ' + str(e)))
    boot(dst, url)
    empty = dst.evaluate(SNAPSHOT_JS)
    assert empty['media'] == [] and empty['ls']['birdspot-sightings'] is None
    profile(dst)
    confirmed = try_import(dst, str(zpath))
    after = dst.evaluate(SNAPSHOT_JS)
    st = stored(dst)
    rel = dst.evaluate("""async () => {
      const places = new Set((JSON.parse(localStorage.getItem('birdspot-places')).places).map(p => p.id));
      const rows = JSON.parse(localStorage.getItem('birdspot-sightings')).sightings;
      const env = await import('/src/data/placeEnv.js');
      const a = await env.getEnvPhotos('pl_a'), b = await env.getEnvPhotos('pl_b');
      return { sightingPlaces: rows.every(s => places.has(s.placeId)), a: a.length, b: b.length,
        envPlacesKnown: [...a, ...b].every(p => places.has(p.placeId)), caption: a.map(p => p.caption).filter(Boolean) };
    }""")
    s1 = next(s for s in st['sightings'] if s['id'] == 'z_s1')
    check('Z2', 'herstel op schoon tweede profiel: alles + relaties, bytes gelijk',
          confirmed and after['media'] == before_src['media'] and rel['sightingPlaces'] and rel['envPlacesKnown'] and
          rel['a'] == 2 and rel['b'] == 1 and rel['caption'] == ['Uitkijkpunt bij de dijk'] and
          s1['lat'] == 52.2009 and s1['time'] == '07:05' and s1['placeId'] == 'pl_a',
          f"rel={rel} media-gelijk={after['media'] == before_src['media']}")

    # Z3: ongeldige ZIP's op een profiel MET data → niets verandert
    base_snap = dst.evaluate(SNAPSHOT_JS)
    first_env = env_meta[0]['id']
    variants = {
        'geen zip': b'PK-nep',
        'crc-fout': rezip(zbytes, corrupt=b'Uitkijkpunt'),
        'onbekende plek': rezip(zbytes, mutate_json=lambda d: [m.update(placeId='pl_bestaat_niet') for m in d['mediaMeta'] if m['id'] == first_env]),
        'ontbrekend mediabestand': rezip(zbytes, drop=re.escape(first_env)),
        'nieuwere versie': rezip(zbytes, mutate_json=lambda d: d.update(backupVersion=99)),
        'ongeldige plek': rezip(zbytes, mutate_json=lambda d: d['places'].append({'id': 'pl_x', 'lat': 'noord', 'lon': 5})),
        'env aan waarneming': rezip(zbytes, mutate_json=lambda d: [m.update(sightingId='z_s1') for m in d['mediaMeta'] if m['id'] == first_env]),
    }
    outcome = {}
    for label, payload in variants.items():
        confirmed = try_import(dst, {"name": f"{label}.zip", "mimeType": "application/zip", "buffer": payload})
        outcome[label] = (confirmed, dst.evaluate(SNAPSHOT_JS) == base_snap)
    check('Z3', 'ongeldige ZIP\'s: geen bevestiging, bestaande data identiek',
          all(not c and same for c, same in outcome.values()), str(outcome))

    old_ctx = browser.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    old = old_ctx.new_page(); old.on('pageerror', lambda e: errors.append('old: ' + str(e)))
    boot(old, url)
    seed_source(old)  # bestaand profiel met omgevingsfoto's
    env_before = len(env_records(old))
    profile(old)
    ok_old = try_import(old, str(OLD_ZIP))
    st = stored(old)
    snap = old.evaluate(SNAPSHOT_JS)
    media_ids = [m[0] for m in snap['media']]
    old_row = next((s for s in st['sightings'] if s['id'] == 'old_s1'), {})
    check('Z4', 'oude ZIP (export fb59085/1.27.31) blijft werken; eigen omgevingsfoto\'s blijven',
          ok_old and old_row.get('placeId') == 'pl_old_a' and old_row.get('time') == '08:15' and
          any(p['id'] == 'pl_old_a' for p in st['places']) and 'old_f1' in media_ids and 'pm_old_k4' in media_ids and
          len(env_records(old)) == env_before == 3 and
          next(m for m in snap['media'] if m[0] == 'pm_old_k4')[1] is None,
          f"bevestigd={ok_old} env={env_before}->{len(env_records(old))}")
    old_ctx.close()

    # Z5: offline heropenen na herstel (SW-gestuurd), omgevingsfoto's zichtbaar, offline toevoegen
    dst.evaluate("() => navigator.serviceWorker.ready")
    if not dst.evaluate("!!navigator.serviceWorker.controller"):
        dst.reload(wait_until='domcontentloaded'); boot(dst, url)
    dst.wait_for_function("() => !!navigator.serviceWorker.controller", timeout=90000)
    dst.close()
    dst_ctx.set_offline(True)
    dst = dst_ctx.new_page(); dst.on('pageerror', lambda e: errors.append('dst-offline: ' + str(e)))
    boot(dst, url)
    offline = not dst.evaluate('navigator.onLine')
    open_place(dst, 'pl_a')
    dst.locator('#placeEnvGrid [data-env-id]').first.wait_for(timeout=10000)
    shown = dst.locator('#placeEnvGrid [data-env-id]').count()
    decoded = dst.evaluate("() => Promise.all([...document.querySelectorAll('#placeEnvGrid img')].map(i => i.decode().then(() => i.naturalWidth > 0)))")
    msg = add_env(dst, [{"name": "offline.jpg", "mimeType": "image/jpeg", "buffer": jpeg_with_exif((10, 10, 200))}])
    thumbs = [r['thumbBytes'] > 0 for r in env_records(dst, 'pl_a')]
    dst.screenshot(path=str(SHOTS / 'z5_offline_na_herstel_390.png'))
    check('Z5', 'offline heropenen na herstel: omgevingsfoto\'s zichtbaar, offline toevoegen werkt, thumbs hersteld',
          offline and shown == 2 and all(decoded) and 'opgeslagen' in msg and len(thumbs) == 3 and all(thumbs),
          f"offline={offline} getoond={shown} status='{msg}' thumbs={thumbs}")
    close_place(dst)
    dst_ctx.set_offline(False)

    profile(dst)
    snap1 = dst.evaluate(SNAPSHOT_JS)
    try_import(dst, str(zpath))
    snap2 = dst.evaluate(SNAPSHOT_JS)
    check('Z6', 'herimport van dezelfde ZIP: geen dubbelen', snap1 == snap2 and len(snap2['media']) == 6,
          f"media={len(snap2['media'])}")
    src_ctx.close(); dst_ctx.close()
    if errors:
        raise AssertionError(f"paginafouten: {errors}")


def main():
    SHOTS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='birdspot-r2b-') as tmp, Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                                      reduced_motion='reduce', service_workers='block')
            ctx.add_init_script(INIT)
            page = ctx.new_page(); errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, url)
            consolidation(page, url)
            env_photos(page, url)
            if errors:
                raise AssertionError(f"paginafouten: {errors}")
            ctx.close()
            race(browser, url)
            zip_suite(browser, url, tmp)
            browser.close()
    print(f"R2B CHROMIUM PASS: {sum(1 for _, ok in RESULTS if ok)}/{len(RESULTS)}")


if __name__ == '__main__':
    main()
