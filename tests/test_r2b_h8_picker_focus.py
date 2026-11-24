#!/usr/bin/env python3
"""R2B H8-oorzaak — soortkiezer pakt na sluiten de focus van het volgende veld (PR #359).

Oorzaak (CI-flake H8 op 87bcdf9): openSpeciesPicker zet bij openen een focustimer van 120 ms
naar het zoekveld. Werd binnen die tijd een soort gekozen, dan ging de focus 120 ms later alsnog
naar het zoekveld van de sluitende kiezer en daarna naar <body>. Tekst die de gebruiker (of de
test) intussen in Locatie typte, verdween. De automatische plaatsnaam overschreef daarna het lege veld.

Deterministisch, zonder de bestaande H7/H8-verwachtingen te wijzigen:
  F1  snel kiezen: Locatie houdt de focus 500 ms lang; getypte tekst komt in Locatie.
  F2  dezelfde getypte naam blijft bij Plas Noord → Andere plek → Rietkraag Zuid, opgeslagen + heropend (H8-route).
  F3  kiezer langer open: het zoekveld krijgt nog steeds automatisch focus (gedrag behouden).
  F4  Escape/Sluiten zonder keuze: geen focusdiefstal na sluiten.
"""
import functools
import http.server
import os
import sys
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(os.environ.get('BIRDSPOT_APP_ROOT', Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_feature_reconciliation import boot  # noqa: E402
from test_r2b_places_env_zip import PLACE_A, PLACE_B, north, open_add, reset_profile, wait_hint  # noqa: E402
from test_r2b_qa_herstel import new_ctx, reopen_name  # noqa: E402
from test_r05_gps_race import save  # noqa: E402

RESULTS = []


def check(code, name, ok, detail=''):
    RESULTS.append((code, ok))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + detail if detail else ''}", flush=True)


FAST_PICK = """async () => {
  document.querySelector('#speciesPickerBtn').click();
  await new Promise(r => requestAnimationFrame(r));
  document.querySelector('#spPickerList .species-row[data-id="sp001"]').click();
  await new Promise(r => requestAnimationFrame(r));
  const loc = document.querySelector('#sightLocation');
  loc.focus();
  const seen = new Set();
  const t0 = performance.now();
  while (performance.now() - t0 < 500) {
    await new Promise(r => setTimeout(r, 10));
    const a = document.activeElement; seen.add(a ? (a.id || a.tagName) : 'null');
  }
  return [...seen];
}"""


def main():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT))
    handler.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{srv.server_address[1]}/'
    lat, lon = north(-60)
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        ctx = new_ctx(browser); page = ctx.new_page(); boot(page, url)

        reset_profile(page, url, [PLACE_A, PLACE_B], {"lat": lat, "lon": lon, "acc": 5})
        open_add(page); wait_hint(page, '2 bekende plekken')
        seen = page.evaluate(FAST_PICK)
        page.keyboard.type('Mijn kijkhut')
        typed = page.locator('#sightLocation').input_value()
        check('F1', 'snel kiezen: Locatie houdt focus en getypte tekst',
              seen == ['sightLocation'] and typed == 'Mijn kijkhut', f'focus={seen} waarde={typed!r}')

        page.locator('#coordsHint [data-place-choice="pl_a"]').click()
        wait_hint(page, 'Bekende plek: Plas Noord')
        mid = page.locator('#sightLocation').input_value()
        page.locator('#coordsHint [data-place-change]').click()
        after_change = page.locator('#sightLocation').input_value()
        page.locator('#coordsHint [data-place-choice="pl_b"]').click()
        wait_hint(page, 'Bekende plek: Rietkraag Zuid')
        r = save(page)
        reopened = reopen_name(page, r['id'])
        res = (mid, after_change, r['placeId'], r['locationName'], reopened)
        check('F2', 'zelf getypte naam blijft na snelle soortkeuze (opgeslagen + heropend)',
              res == ('Mijn kijkhut', 'Mijn kijkhut', 'pl_b', 'Mijn kijkhut', 'Mijn kijkhut'), str(res))

        reset_profile(page, url, [PLACE_A], {"lat": lat, "lon": lon, "acc": 5})
        open_add(page)
        page.locator('#speciesPickerBtn').click()
        page.wait_for_timeout(400)
        active = page.evaluate("document.activeElement?.id")
        check('F3', 'kiezer open: zoekveld krijgt automatisch focus', active == 'spPickerSearch', str(active))
        page.locator('#spPickerList .species-row[data-id="sp001"]').click()
        page.locator('#speciesPickerBtn .species-picker-btn__name').wait_for(timeout=8000)

        page.wait_for_function("() => !document.querySelector('#spPickerSearch')", timeout=5000)  # vorige kiezer weg
        page.evaluate("""async () => { document.querySelector('#speciesPickerBtn').click();
          await new Promise(r => requestAnimationFrame(r)); document.querySelector('#spPickerClose').click(); }""")
        page.locator('#sightLocation').focus()
        page.wait_for_timeout(500)
        active = page.evaluate("document.activeElement?.id")
        check('F4', 'sluiten zonder keuze: geen focusdiefstal', active == 'sightLocation', str(active))
        browser.close()
    srv.shutdown()
    passed = sum(ok for _, ok in RESULTS)
    print(f"R2B-H8-PICKER-FOCUS {'PASS' if passed == len(RESULTS) else 'FAIL'}: {passed}/{len(RESULTS)}")
    sys.exit(0 if passed == len(RESULTS) else 1)


if __name__ == '__main__':
    main()
