#!/usr/bin/env python3
"""UX-01C (25-11-2026): sneller meerdere vogels vastleggen, zonder verkeerde gegevens over te nemen.

V1  1 vogel: na opslaan korte bevestiging met Bekijk waarneming / Nog één toevoegen / sluiten; Bekijk opent detail
V2  3 vogels via "Nog één toevoegen": datum en plek zichtbaar overgenomen; tijd, soort, aantal, zekerheid, media leeg;
    één plek, drie records
V3  recente soorten bovenaan de kiezer (nieuwste eerst), verborgen tijdens zoeken; zoeken op NL, EN en wetenschappelijk
V4  vervolg op dezelfde plek: geen automatische GPS over de overgenomen plek heen
V5  handmatig andere plek: "Wis plek" leegt plek en pin, geen automatische GPS; eigen plaatsnaam wordt bewaard
V6  geen GPS: vervolg neemt alleen de datum over; formulier werkt
V7  terug/annuleren/hervatten in een vervolgformulier: keuzedialoog, concept bewaart overgenomen plek
V8  dubbelklik op Opslaan: precies één record en één bevestiging
V9  trage opslag: knop 'Opslaan…' en geblokkeerd, geen dubbel record; daarna bevestiging
V10 offline: vervolg toevoegen en opslaan werkt
V11 320/390/430 px: bevestiging en overnamemelding binnen beeld, knoppen ≥ 44 px, geen horizontale overloop
"""
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_pilot_offline_new_sighting import Quiet, Server  # noqa: E402
from test_feature_reconciliation import boot, rows  # noqa: E402
from test_sighting_merlin_pins import choose_pin  # noqa: E402

RESULTS = []
GPS = (52.1001, 5.1002)
PLACES = "() => JSON.parse(localStorage.getItem('birdspot-places') || '{\"places\":[]}').places.length"
HOLD = """(() => {
  const origTx = IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction = function (...args) {
    const tx = origTx.apply(this, args);
    const stores = [].concat(args[0]);
    if (window.__holdPhotosMs && stores.includes('photos') && args[1] === 'readwrite') {
      let handler = null;
      Object.defineProperty(tx, 'oncomplete', { configurable: true, get: () => handler,
        set: fn => { handler = fn; tx.addEventListener('complete', e => setTimeout(() => fn && fn.call(tx, e), window.__holdPhotosMs)); } });
    }
    return tx;
  };
})();"""


def gps_script(granted):
    return f"""(() => {{
  const q = navigator.permissions.query.bind(navigator.permissions);
  navigator.permissions.query = d => d && d.name === 'geolocation' ? Promise.resolve({{ state: '{'granted' if granted else 'denied'}' }}) : q(d);
  window.__gpsCalls = 0;
  navigator.geolocation.getCurrentPosition = (ok, err) => {{ window.__gpsCalls++;
    {'const [la, lo] = window.__gpsPos || [%s, %s]; setTimeout(() => ok({ coords: { latitude: la, longitude: lo, accuracy: 8 } }), 80);' % GPS if granted else 'setTimeout(() => err && err({ code: 1 }), 30);'} }};
}})();"""


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def open_new(page):
    page.locator('#fab').click()
    page.locator('[data-quick-action="seen"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)


def pick(page, query, sid):
    page.locator('#speciesPickerBtn').click()
    page.locator('#spPickerSearch').fill(query)
    page.locator(f'#spPickerList .species-row[data-id="{sid}"]').click()
    page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)


def save(page):
    page.locator('#addSheetSubmit').click()
    page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
    page.locator('#savedActions').wait_for(timeout=5000)


def again(page):
    page.locator('#savedActions [data-saved-action="again"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)


def form_values(page):
    return page.evaluate("""() => ({ date: document.querySelector('#sightDate').value, time: document.querySelector('#sightTime').value,
      species: document.querySelector('#speciesPickerBtn .species-picker-btn__name')?.textContent || null,
      count: document.querySelector('#sightCount').value,
      certainty: document.querySelector('#certaintyGroup input:checked')?.value || null,
      media: document.querySelectorAll('#addSightingSheet .media-thumb').length,
      location: document.querySelector('#sightLocation').value,
      hint: document.querySelector('#coordsHint')?.innerText || '',
      note: document.querySelector('#sightReuseNote')?.innerText || null })""")


def main():
    server = Server(('127.0.0.1', 0), Quiet)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_address[1]}/'
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(granted=True, width=390):
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
            ctx.add_init_script(gps_script(granted))
            ctx.add_init_script(HOLD)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            return ctx, page, errors

        # ── V1 + V2 + V3 + V4 ────────────────────────────────────────
        ctx, page, errors = context()
        open_new(page)
        page.wait_for_function(f"document.querySelector('#coordsHint')?.textContent.includes('{str(GPS[0])[:5]}')", timeout=8000)
        page.locator('#sightDate').fill('2026-11-20')
        page.locator('#sightTime').fill('08:15')
        pick(page, 'merel', 'sp045')
        save(page)
        bar = page.locator('#savedActions')
        bar_text = bar.inner_text()
        buttons = bar.locator('button').evaluate_all("els => els.map(e => e.getAttribute('aria-label') || e.textContent.trim())")
        page.locator('#savedActions [data-saved-action="view"]').click()
        page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
        detail_ok = 'Merel' in page.locator('#detailSightingSheet').inner_text()
        page.locator('#detailClose').click()
        page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        check('V1', '1 vogel: bevestiging met Bekijk / Nog één / sluiten; Bekijk opent de waarneming',
              'Merel opgeslagen' in bar_text and buttons == ['Bekijk waarneming', 'Nog één toevoegen', 'Melding sluiten']
              and detail_ok and page.locator('#savedActions').count() == 0, buttons)

        # tweede en derde vogel via de bevestiging na opslaan
        open_new(page)  # derde route: + opent gewoon een nieuw formulier (geen overname)
        plain = form_values(page)
        page.locator('#addSheetCancel').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        first = rows(page)[0]
        open_new(page)
        pick(page, 'koolmees', 'sp029')
        page.locator('#sightDate').fill('2026-11-20')
        page.locator('#sightTime').fill('08:20')
        save(page)
        page.evaluate('window.__gpsPos = [51.5, 4.4]')   # gebruiker is intussen elders: GPS mag de overgenomen plek niet vervangen
        again(page)
        v2 = form_values(page)
        page.wait_for_timeout(1200)
        hint_later = form_values(page)['hint']
        page.locator('#speciesPickerBtn').click()
        recent = page.locator('#spPickerRecent [data-recent-id]').evaluate_all('els => els.map(e => e.textContent)')
        page.locator('#spPickerSearch').fill('robin')
        hidden_while_search = page.locator('#spPickerRecent').is_hidden()
        en = page.locator('#spPickerList .species-row[data-id="sp050"]').count() == 1
        page.locator('#spPickerSearch').fill('erithacus')
        sci = page.locator('#spPickerList .species-row[data-id="sp050"]').count() == 1
        page.locator('#spPickerSearch').fill('roodb')
        nl = page.locator('#spPickerList .species-row[data-id="sp050"]').count() == 1
        page.locator('#spPickerSearch').fill('')
        page.locator('#spPickerRecent [data-recent-id="sp045"]').click()
        page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
        chosen = page.locator('#speciesPickerBtn').inner_text()
        save(page)
        again(page)
        pick(page, 'roodb', 'sp050')
        save(page)
        r = rows(page)
        last3 = r[-3:]
        check('V2', '3 vogels via Nog één: datum en plek zichtbaar overgenomen, rest leeg; één plek, drie records',
              v2['note'] and 'datum 20 nov' in v2['note'] and 'plek' in v2['note'] and v2['date'] == '2026-11-20'
              and v2['time'] == '' and v2['species'] is None and v2['count'] == '1' and v2['certainty'] == 'certain' and v2['media'] == 0
              and len({x['placeId'] for x in r}) == 1 and page.evaluate(PLACES) == 1
              and [x['speciesName'] for x in last3] == ['Koolmees', 'Merel', 'Roodborst']
              and all(x['date'] == '2026-11-20' for x in last3) and not last3[1].get('time') and not errors
              and plain['note'] is None and plain['date'] != '2026-11-20',
              f"melding='{v2['note']}'")
        check('V3', 'recente soorten bovenaan (nieuwste eerst), verborgen tijdens zoeken; zoeken NL/EN/wetenschappelijk',
              recent[:2] == ['Koolmees', 'Merel'] and hidden_while_search and en and sci and nl and 'Merel' in chosen, recent)
        check('V4', 'vervolg op dezelfde plek: geen automatische GPS over de overgenomen plek',
              str(GPS[0])[:5] in hint_later and '51.5' not in hint_later and first['placeId'] == last3[-1]['placeId'],
              hint_later)

        # ── V5 handmatig andere plek ─────────────────────────────────
        again_btn = page.locator('#savedActions [data-saved-action="again"]')
        again_btn.click()
        page.locator('#addSightingSheet.open').wait_for(timeout=9000)
        page.locator('#sightReuseClearPlace').click()
        page.wait_for_timeout(1200)
        cleared = form_values(page)
        page.locator('#sightLocation').fill('Ander bos')
        pick(page, 'roodb', 'sp050')
        save(page)
        v5 = rows(page)[-1]
        check('V5', 'Wis plek: plek en pin leeg, geen automatische GPS; eigen plaatsnaam bewaard zonder coördinaten',
              cleared['location'] == '' and 'plek' not in (cleared['note'] or '') and '📍' not in cleared['hint']
              and v5['locationName'] == 'Ander bos' and v5['lat'] is None and v5['placeId'] is None and not errors,
              f"melding={cleared['note']!r} hint={cleared['hint']!r} record={ {k: v5.get(k) for k in ('locationName', 'lat', 'placeId')} } fouten={errors[:1]}")

        # ── V8 dubbelklik ────────────────────────────────────────────
        page.locator('#savedActions [data-saved-action="close"]').click()
        n = len(rows(page))
        open_new(page)
        pick(page, 'merel', 'sp045')
        page.locator('#addSheetSubmit').dblclick()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.wait_for_timeout(500)
        check('V8', 'dubbelklik op Opslaan: één record, één bevestiging',
              len(rows(page)) == n + 1 and page.locator('#savedActions').count() == 1)

        # ── V9 trage opslag ──────────────────────────────────────────
        again(page)
        pick(page, 'koolmees', 'sp029')
        page.evaluate('window.__holdPhotosMs = 1500')
        page.locator('#addSheetSubmit').click()
        page.wait_for_timeout(200)
        busy = page.locator('#addSheetSubmit').evaluate("b => ({ disabled: b.disabled, text: b.textContent.trim() })")
        page.locator('#addSheetSubmit').click(force=True)
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        page.locator('#savedActions').wait_for(timeout=5000)
        page.evaluate('window.__holdPhotosMs = 0')
        check('V9', 'trage opslag: Opslaan… en geblokkeerd, geen dubbel record, daarna bevestiging',
              busy == {'disabled': True, 'text': 'Opslaan…'} and len(rows(page)) == n + 2, busy)

        # ── V7 terug/annuleren/hervatten in vervolgformulier ─────────
        again(page)
        start7 = form_values(page)
        reused_loc = start7['location']
        pick(page, 'merel', 'sp045')
        page.wait_for_timeout(600)
        page.go_back()
        page.locator('#sightingLeaveDialog').get_by_role('button', name='Concept bewaren en sluiten').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        open_new(page)
        page.locator('#sightingDraftDialog').get_by_role('button', name='Concept hervatten').click()
        page.wait_for_timeout(300)
        resumed = form_values(page)
        page.locator('#addSheetCancel').click()
        page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        check('V7', 'terug in vervolgformulier: keuzedialoog; concept bewaart overgenomen plek en datum; verwerpen ruimt op',
              resumed['species'] == 'Merel' and resumed['location'] == reused_loc and resumed['date'] == start7['date'] and resumed['hint'] == start7['hint']
              and page.evaluate("() => localStorage.getItem('birdspot-sighting-drafts')") is None and not errors,
              f"hervat={resumed} verwacht={reused_loc} concept={page.evaluate('() => localStorage.getItem(`birdspot-sighting-drafts`)')} fouten={errors[:1]}")

        # ── V10 offline ──────────────────────────────────────────────
        ctx.set_offline(True)
        open_new(page)
        pick(page, 'merel', 'sp045')
        save(page)
        again(page)
        pick(page, 'koolmees', 'sp029')
        save(page)
        check('V10', 'offline: vervolg toevoegen en opslaan', rows(page)[-1]['speciesName'] == 'Koolmees'
              and rows(page)[-1]['placeId'] == rows(page)[-2]['placeId'] and not errors)
        ctx.close()

        # ── V6 geen GPS ──────────────────────────────────────────────
        ctx, page, errors = context(granted=False)
        open_new(page)
        pick(page, 'merel', 'sp045')
        save(page)
        again(page)
        v6 = form_values(page)
        pick(page, 'koolmees', 'sp029')
        save(page)
        r = rows(page)
        check('V6', 'geen GPS: vervolg neemt alleen de datum over; opslaan werkt zonder plek',
              v6['note'] and 'datum' in v6['note'] and 'plek' not in v6['note'] and len(r) == 2 and r[1]['lat'] is None and not errors,
              v6['note'])
        ctx.close()

        # ── V11 breedtes ─────────────────────────────────────────────
        layout = {}
        for width in (320, 390, 430):
            ctx, page, errors = context(width=width)
            open_new(page)
            choose_pin(page, 52.2, 5.2)
            pick(page, 'merel', 'sp045')
            save(page)
            bar = page.evaluate("""() => { const b = document.querySelector('#savedActions').getBoundingClientRect();
              const btns = [...document.querySelectorAll('#savedActions button')].map(e => e.getBoundingClientRect());
              return { inView: b.left >= 0 && b.right <= innerWidth && b.top >= 0, minH: Math.min(...btns.map(r => r.height)),
                       minW: Math.min(...btns.map(r => r.width)), overflow: document.documentElement.scrollWidth > innerWidth }; }""")
            again(page)
            note = page.evaluate("""() => { const n = document.querySelector('#sightReuseNote').getBoundingClientRect();
              const c = document.querySelector('#addSheetContent'); return { inView: n.left >= 0 && n.right <= innerWidth,
              overflow: c.scrollWidth > c.clientWidth }; }""")
            page.screenshot(path=f'/tmp/ux01c_{width}.png')
            layout[width] = (bar, note)
            ctx.close()
        check('V11', '320/390/430: bevestiging en overnamemelding in beeld, knoppen ≥ 44 px, geen overloop',
              all(b['inView'] and b['minH'] >= 44 and b['minW'] >= 44 and not b['overflow'] and n['inView'] and not n['overflow']
                  for b, n in layout.values()), {w: (b['minH'], b['inView'], n['inView']) for w, (b, n) in layout.items()})
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-01C: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 11 else 0)


if __name__ == '__main__':
    main()
