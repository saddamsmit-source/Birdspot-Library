#!/usr/bin/env python3
"""GPS-01 (26-11-2026): Home gebruikt live GPS voor weer en zon; nooit een standaardstad.

Eigenaarmelding Samsung-preview 1.27.34: onder Weercondities stond "Amsterdam (standaardlocatie)".
Oorzaak in 3a03c84/3644487: getLocation() viel bij ELKE fout (ook time-out van 5 s bij verleende toestemming)
terug op Amsterdam en noemde dat "geen locatietoestemming"; zon en weer vroegen elk apart een positie op.

Lokale Chromium. Playwright-geolocatie = echte browser-API met een vaste testpositie; time-out en
'geen signaal' zijn SIMULATIE via een stub op getCurrentPosition. Geen fysieke GPS: Samsung NOT TESTED.
G1  toestemming + GPS: weer en zon voor de GPS-positie, één locatieaanvraag, geen hoge nauwkeurigheid/watch
G2  toestemming geweigerd: geen weer voor een verzonnen stad, eerlijke reden, knoppen, zon wacht
G3  [simulatie] time-out zonder eerdere positie: 'niet te bepalen', geen weerverzoek
G4  [simulatie] time-out met laatst bekende positie (< 24 u): gebruikt, gemarkeerd 'niet actueel · GPS van hh:mm'
G5  laatst bekende positie ouder dan 24 u wordt niet gebruikt
G6  geweigerd met opgeslagen laatst bekende positie: positie vergeten
G7  zelf een plek kiezen (kaartkiezer met eigen teksten): weer en zon voor die plek, als 'zelf gekozen' benoemd
G8  GPS weer beschikbaar na handmatige plek: 'GPS opnieuw proberen' → actuele GPS gaat voor
G9  weer-cache: terug naar Home binnen 15 min = geen nieuw weerverzoek; hervatten na ≥ 10 min en verplaatst → nieuwe positie en weer
G10 weer-API offline: bestaande melding, zon blijft werken
G11 320/390/430 px: melding en knoppen zonder overloop, knoppen ≥ 44 px
G15 handmatige locatie blijft voor weer en zon beschikbaar als de opslag vol is
G16 bij uitval van de weerservice blijven de locatieknoppen werken en herstelt weer na GPS-retry
G17 toetsenbordfocus blijft in de kaartkiezer; browser-Terug laat de onopgeslagen keuze vervallen
G18 een routewissel ruimt de kaartkiezer op; een late bevestiging kan de weerlocatie niet opslaan
G13 kaart 'mijn locatie' zonder toestemming: melding in plaats van stil falen
G14 offline: elke vanuit src/app.js geïmporteerde module (statisch en dynamisch) staat in de app-shell van sw.js
G12 privacy: nergens coördinaten in weer/zon; weerverzoek met afgeronde coördinaten; opslag afgerond op 2 decimalen
Tegenproef: G1 faalt op 3644487 (zonkaart toont coördinaten) en G2 faalt (toont Amsterdam).
"""
import json
import pathlib
import re
import threading
import time

from playwright.sync_api import expect, sync_playwright

from test_cinematic_wetland import Server, Quiet
from test_feature_reconciliation import boot
from test_explorer_species_cluster import LEAFLET_STUB

RESULTS = []
WEATHER = 'https://api.open-meteo.com/v1/forecast?*'
PAYLOAD = {'current': {'temperature_2m': 6.2, 'apparent_temperature': 3.9, 'weather_code': 2, 'wind_speed_10m': 4,
                       'wind_direction_10m': 220, 'relative_humidity_2m': 85, 'is_day': 1}}
GPS = {'latitude': 51.9237, 'longitude': 4.4703}  # fictieve testpositie (Rotterdam)
SUN = """window.SunCalc = { getTimes: d => { const t = h => { const x = new Date(d); x.setHours(h, 0, 0, 0); return x; };
  return { sunrise: t(8), sunset: t(17), goldenHourEnd: t(9), goldenHour: t(16) }; } };"""
GEO = """(() => {
  const G = window.__geo = { mode: 'real', calls: [], watch: 0 };
  const geo = navigator.geolocation, real = geo.getCurrentPosition.bind(geo), realWatch = geo.watchPosition.bind(geo);
  geo.getCurrentPosition = (ok, fail, opts) => {
    G.calls.push(opts || null);
    if (G.mode === 'timeout') return setTimeout(() => fail({ code: 3, message: 'Timeout' }), 50);
    if (G.mode === 'unavailable') return setTimeout(() => fail({ code: 2, message: 'Unavailable' }), 50);
    return real(ok, fail, opts);
  };
  geo.watchPosition = (...a) => { G.watch++; return realWatch(...a); };
})();"""
COORD = re.compile(r'\d{1,2}[.,]\d{2,}\s*°')


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def home(browser, url, *, geo=None, mode='real', storage=None, width=390, places=None):
    ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True,
                              reduced_motion='reduce', service_workers='block', timezone_id='Europe/Amsterdam',
                              geolocation=geo, permissions=['geolocation'] if geo else [])
    ctx.add_init_script(SUN)
    ctx.add_init_script(LEAFLET_STUB)
    ctx.add_init_script(GEO)
    ctx.add_init_script(f"window.__geo.mode = {json.dumps(mode)};")
    for key, value in (storage or {}).items():
        ctx.add_init_script(f"if (!sessionStorage.getItem('seeded-{key}')) {{ localStorage.setItem({json.dumps(key)}, {json.dumps(json.dumps(value))}); sessionStorage.setItem('seeded-{key}', '1'); }}")
    if places:
        ctx.add_init_script("localStorage.setItem('birdspot-places', JSON.stringify({schemaVersion: 1, places: " + json.dumps(places) + "}));")
    page = ctx.new_page()
    page.weather_requests = []
    page.errors = []
    page.on('pageerror', lambda e: page.errors.append(str(e)))

    def handle(route):
        page.weather_requests.append(route.request.url)
        if getattr(page, 'weather_down', False):
            return route.abort()
        return route.fulfill(status=200, json=PAYLOAD)
    page.route(WEATHER, handle)
    boot(page, url)
    settle(page)
    return ctx, page


def settle(page):
    page.locator('#weatherSection').scroll_into_view_if_needed()
    page.wait_for_function("""() => document.querySelector('#weatherSection .weather-card, #weatherSection .dash-section__error')
      && document.querySelector('#sunSection .sun-card, #sunSection .dash-section__error')""", timeout=25000)


def info(page):
    return page.evaluate("""() => { const w = document.querySelector('#weatherSection'), s = document.querySelector('#sunSection');
      const btn = [...w.querySelectorAll('[data-location-action]')].map(b => ({ a: b.dataset.locationAction, h: b.getBoundingClientRect().height,
        w: b.getBoundingClientRect().width, r: b.getBoundingClientRect().right }));
      const card = w.querySelector('.weather-card');
      return { weather: w.innerText, sun: s.innerText, place: w.querySelector('.weather-place')?.innerText || null,
        kind: w.querySelector('.weather-place')?.dataset.locationKind || null,
        reason: w.querySelector('[data-location-reason]')?.dataset.locationReason || null,
        sunPlace: s.querySelector('.sun-location')?.innerText || null, sunKind: s.querySelector('.sun-location')?.dataset.locationKind || null,
        sunNote: s.querySelector('.sun-nolocation')?.innerText || null, error: w.querySelector('.dash-section__error')?.innerText || null,
        buttons: btn, overflow: card ? Math.max(0, ...[...card.querySelectorAll('*')].map(e => e.getBoundingClientRect().right)) - card.getBoundingClientRect().right : 0,
        geoCalls: window.__geo.calls, watch: window.__geo.watch,
        last: localStorage.getItem('birdspot-last-location'), manual: localStorage.getItem('birdspot-weather-location') }; }""")


def latlon(url):
    m = re.search(r'latitude=([-\d.]+)&longitude=([-\d.]+)', url)
    return (float(m.group(1)), float(m.group(2))) if m else None


def no_amsterdam(i):
    return 'Amsterdam' not in (i['weather'] + i['sun'])


def shell_coverage():
    """Statische module-graaf vanaf src/app.js; elke lokale import moet in de precachelijst van sw.js staan,
    anders start de app offline niet (GPS-01-regressie: nieuwe src/services/location.js ontbrak)."""
    root = pathlib.Path(__file__).resolve().parents[1]
    shell = set(re.findall(r"'((?:src|data)/[^']+\.js)'", (root / 'sw.js').read_text(encoding='utf-8')))
    static = re.compile(r"""^\s*(?:import|export)\s[^;]*?from\s*['"](\.{1,2}/[^'"]+)['"]|^\s*import\s*['"](\.{1,2}/[^'"]+)['"]""", re.M)
    dynamic = re.compile(r"""import\(\s*['"](\.{1,2}/[^'"]+)['"]\s*\)""")
    seen, stack, missing = set(), ['src/app.js'], []
    while stack:
        rel = stack.pop()
        if rel in seen:
            continue
        seen.add(rel)
        text = (root / rel).read_text(encoding='utf-8')
        specs = [m.group(1) or m.group(2) for m in static.finditer(text)] + [m.group(1) for m in dynamic.finditer(text)]
        for spec in specs:
            target = (root / rel).parent.joinpath(spec).resolve().relative_to(root).as_posix()
            if target not in shell:
                missing.append(f'{target} (uit {rel})')
            stack.append(target)
    return len(seen), sorted(set(missing))


def choose_manual_location(page):
    page.locator('[data-location-action="pick"]').click()
    dialog = page.get_by_role('dialog', name='Kies een plek voor weer en zon')
    dialog.locator('#pinLat').fill('52.15612')
    dialog.locator('#pinLon').fill('5.38763')
    dialog.locator('#pinConfirm').click()
    expect(dialog).to_have_count(0)
    settle(page)


def check_manual_location_recovery(browser, url):
    context, page = home(browser, url)
    try:
        page.evaluate("""() => {
            const save = Storage.prototype.setItem;
            Storage.prototype.setItem = function (key, value) {
                if (key === 'birdspot-weather-location') {
                    throw new DOMException('Quota exceeded', 'QuotaExceededError');
                }
                return save.call(this, key, value);
            };
        }""")
        choose_manual_location(page)
        current = info(page)
        check(
            'G15', 'handmatige plek werkt in de sessie bij volle opslag',
            current['kind'] == current['sunKind'] == 'manual'
            and 'alleen deze sessie' in (current['place'] or '')
            and 'alleen deze sessie' in (current['sunPlace'] or '')
            and current['manual'] is None
            and bool(page.weather_requests) and latlon(page.weather_requests[-1]) == (52.16, 5.39),
            (current['place'], current['sunPlace'], current['manual']),
        )
    finally:
        context.close()

    context, page = home(browser, url)
    try:
        page.weather_down = True
        choose_manual_location(page)
        failure = info(page)
        controls = [button['a'] for button in failure['buttons']]
        usable = (
            failure['error'] == 'Weer niet beschikbaar'
            and failure['sunKind'] == 'manual'
            and controls == ['retry', 'pick']
        )
        if usable:
            page.locator('[data-location-action="pick"]').click()
            dialog = page.get_by_role('dialog', name='Kies een plek voor weer en zon')
            expect(dialog).to_be_visible()
            page.keyboard.press('Escape')
            expect(dialog).to_have_count(0)
            assert info(page)['manual'] == failure['manual']
            context.set_geolocation(GPS)
            context.grant_permissions(['geolocation'])
            page.weather_down = False
            page.locator('[data-location-action="retry"]').click()
            settle(page)
            current = info(page)
            usable = (
                current['kind'] == current['sunKind'] == 'gps'
                and not current['buttons']
                and latlon(page.weather_requests[-1]) == (51.92, 4.47)
            )
        check('G16', 'locatiekeuze, annuleren en GPS-herstel na uitval van de weerservice',
              usable, (failure['error'], failure['sunKind'], controls))
    finally:
        context.close()


def check_manual_location_navigation(browser, url):
    context, page = home(browser, url)
    try:
        pick = page.locator('[data-location-action="pick"]')
        pick.click()
        dialog = page.get_by_role('dialog', name='Kies een plek voor weer en zon')
        cancel = dialog.locator('#pinCancel')
        lat = dialog.locator('#pinLat')
        lon = dialog.locator('#pinLon')
        confirm = dialog.locator('#pinConfirm')
        expect(cancel).to_be_focused()
        page.keyboard.press('Shift+Tab')
        wraps_with_empty_input = lon.evaluate('(el) => el === document.activeElement')
        lat.fill('52.15612')
        lon.fill('5.38763')
        expect(confirm).to_be_enabled()
        confirm.focus()
        page.keyboard.press('Tab')
        wraps_forward = cancel.evaluate('(el) => el === document.activeElement')
        cancel.focus()
        page.keyboard.press('Shift+Tab')
        wraps_backward = confirm.evaluate('(el) => el === document.activeElement')
        page.evaluate('history.back()')
        expect(dialog).to_have_count(0)
        expect(page.locator('#screen-home')).to_be_visible()
        check('G17', 'Tab en Shift+Tab blijven in de kiezer; Terug sluit zonder opslag',
              wraps_with_empty_input and wraps_forward and wraps_backward
              and pick.evaluate('(el) => el === document.activeElement')
              and info(page)['manual'] is None and not page.weather_requests,
              (wraps_with_empty_input, wraps_forward, wraps_backward))

        pick.click()
        lat.fill('52.15612')
        lon.fill('5.38763')
        expect(confirm).to_be_enabled()
        was_removed = confirm.evaluate("""async (button) => {
            const { navigate } = await import('/src/app.js');
            navigate('species');
            button.click();
            return !button.isConnected;
        }""")
        expect(page.locator('#screen-species')).to_be_visible()
        check('G18', 'routewissel ruimt kaartkiezer op; late bevestiging schrijft geen weerlocatie',
              was_removed and dialog.count() == 0 and page.evaluate("localStorage.getItem('birdspot-weather-location')") is None
              and not page.weather_requests)
    finally:
        context.close()


def run():
    modules, missing = shell_coverage()
    check('G14', 'offline: alle vanuit src/app.js geïmporteerde modules staan in de app-shell van sw.js', modules > 40 and not missing,
          {'modules': modules, 'ontbreekt': missing})
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            b = pw.chromium.launch(headless=True)
            now_ms = int(time.time() * 1000)

            # G1 toestemming + GPS
            ctx, p = home(b, url, geo=GPS)
            i = info(p)
            req = latlon(p.weather_requests[0]) if p.weather_requests else None
            check('G1', 'GPS: weer en zon voor de GPS-positie, één gedeelde aanvraag, geen hoge nauwkeurigheid of watch',
                  i['kind'] == 'gps' and 'Je huidige omgeving' in (i['place'] or '') and i['sunKind'] == 'gps' and 'Je huidige omgeving' in (i['sunPlace'] or '')
                  and req == (51.92, 4.47) and len(p.weather_requests) == 1 and len(i['geoCalls']) == 1
                  and i['geoCalls'][0].get('enableHighAccuracy') is False and i['watch'] == 0 and no_amsterdam(i) and not i['buttons'],
                  {'place': i['place'], 'sun': i['sunPlace'], 'req': req, 'calls': i['geoCalls']})
            stored = json.loads(i['last'] or 'null')
            g12a = stored and stored['lat'] == 51.92 and stored['lon'] == 4.47 and not COORD.search(i['weather'] + i['sun']) \
                and not re.search(r'\d{1,2}[.,]\d{3,}', i['weather'] + i['sun'])
            # G9 cache + hervatten
            p.locator('.nav-item[data-route="species"]').click(); p.wait_for_timeout(400)
            p.locator('.nav-item[data-route="home"]').click(); settle(p)
            cached = len(p.weather_requests) == 1
            ctx.set_geolocation({'latitude': 52.0907, 'longitude': 5.1214})  # ± 35 km verplaatst
            p.evaluate("Date.now = (orig => () => orig() + 11 * 60 * 1000)(Date.now); document.dispatchEvent(new Event('visibilitychange'))")
            p.wait_for_function("() => window.__geo.calls.length >= 3", timeout=15000)
            settle(p); p.wait_for_timeout(500)
            moved = latlon(p.weather_requests[-1]) if p.weather_requests else None
            check('G9', 'weer-cache binnen 15 min; hervatten na ≥ 10 min en verplaatst → nieuwe positie en nieuw weer',
                  cached and moved == (52.09, 5.12) and len(p.weather_requests) == 2, {'requests': p.weather_requests, 'moved': moved})
            g12_errors = list(p.errors)
            ctx.close()

            # G2 geweigerd
            ctx, p = home(b, url, geo=None)
            i = info(p)
            check('G2', 'geweigerd: geen weer voor een verzonnen stad, eerlijke reden, twee knoppen, zon wacht',
                  i['reason'] == 'denied' and 'geen toegang tot je locatie' in i['weather'] and not p.weather_requests and no_amsterdam(i)
                  and [x['a'] for x in i['buttons']] == ['retry', 'pick'] and i['sunNote'] and 'locatie bekend' in i['sunNote'],
                  {'weather': i['weather'][:160], 'sun': i['sunNote'], 'requests': p.weather_requests})

            # G7 zelf een plek kiezen
            p.locator('[data-location-action="pick"]').click()
            dlg = p.get_by_role('dialog', name='Kies een plek voor weer en zon')
            expect(dlg).to_be_visible()
            expect(dlg.locator('#pinClear')).to_be_hidden()
            dlg.locator('#pinLat').fill('52.15612'); dlg.locator('#pinLon').fill('5.38763')
            dlg.locator('#pinConfirm').click()
            expect(dlg).to_have_count(0)
            settle(p); p.wait_for_timeout(300)
            i = info(p)
            manual = json.loads(i['manual'] or 'null')
            check('G7', 'zelf gekozen plek: weer en zon daarvoor, benoemd als zelf gekozen, opgeslagen afgerond',
                  i['kind'] == 'manual' and 'Zelf gekozen plek' in (i['place'] or '') and 'zelf gekozen, geen GPS' in (i['place'] or '')
                  and i['sunKind'] == 'manual' and latlon(p.weather_requests[-1]) == (52.16, 5.39) and manual and manual['lat'] == 52.16
                  and [x['a'] for x in i['buttons']] == ['retry', 'pick'] and no_amsterdam(i), {'place': i['place'], 'manual': manual})

            # G8 GPS weer beschikbaar → gaat voor
            ctx.grant_permissions(['geolocation']); ctx.set_geolocation(GPS)
            p.locator('[data-location-action="retry"]').click()
            p.wait_for_function("() => document.querySelector('#weatherSection .weather-place')?.dataset.locationKind === 'gps'", timeout=15000)
            i = info(p)
            check('G8', 'GPS na handmatige plek: "GPS opnieuw proberen" → actuele GPS gaat voor, knoppen weg',
                  'Je huidige omgeving' in (i['place'] or '') and latlon(p.weather_requests[-1]) == (51.92, 4.47) and not i['buttons']
                  and i['geoCalls'][-1].get('maximumAge') == 0, i['place'])
            g12_errors += p.errors
            ctx.close()

            # G3 time-out zonder eerdere positie (simulatie)
            ctx, p = home(b, url, geo=GPS, mode='timeout')
            i = info(p)
            check('G3', '[simulatie] time-out zonder eerdere positie: "niet te bepalen", geen weerverzoek, geen stad',
                  i['reason'] == 'timeout' and 'niet te bepalen' in i['weather'] and not p.weather_requests and no_amsterdam(i), i['weather'][:120])
            ctx.close()

            # G4 time-out met laatst bekende positie (simulatie)
            ten = now_ms - 40 * 60 * 1000
            ctx, p = home(b, url, geo=GPS, mode='unavailable', storage={'birdspot-last-location': {'lat': 51.44, 'lon': 5.47, 'at': ten}})
            i = info(p)
            check('G4', '[simulatie] geen signaal met laatst bekende positie: gebruikt en gemarkeerd "niet actueel · GPS van hh:mm"',
                  i['kind'] == 'last' and 'Laatst bekende locatie' in (i['place'] or '') and re.search(r'niet actueel · GPS van \d\d:\d\d', i['place'] or '')
                  and latlon(p.weather_requests[0]) == (51.44, 5.47) and 'niet actueel' in (i['sunPlace'] or '') and [x['a'] for x in i['buttons']] == ['retry', 'pick'],
                  (i['place'], i['sunPlace']))
            ctx.close()

            # G5 te oude laatst bekende positie
            ctx, p = home(b, url, geo=GPS, mode='timeout', storage={'birdspot-last-location': {'lat': 51.44, 'lon': 5.47, 'at': now_ms - 25 * 3600 * 1000}})
            i = info(p)
            check('G5', 'laatst bekende positie ouder dan 24 u niet gebruikt', i['reason'] == 'timeout' and not p.weather_requests, i['weather'][:80])
            ctx.close()

            # G6 geweigerd vergeet laatst bekende positie
            ctx, p = home(b, url, geo=None, storage={'birdspot-last-location': {'lat': 51.44, 'lon': 5.47, 'at': now_ms - 60000}})
            i = info(p)
            # G13 kaart: locatieknop zonder toestemming meldt het probleem
            p.locator('.nav-item[data-route="map"]').click()
            p.locator('#mapLocateBtn').wait_for(state='visible', timeout=15000)
            p.locator('#mapLocateBtn').click()
            toast = p.locator('.toast.show:not(.app-update)')
            expect(toast).to_contain_text('Geen toegang tot je locatie', timeout=8000)
            check('G13', "kaart 'mijn locatie' zonder toestemming: waarschuwing i.p.v. stil falen", toast.get_attribute('data-tone') == 'warn', toast.inner_text())
            check('G6', 'geweigerd/ingetrokken: laatst bekende positie vergeten en niet gebruikt', i['reason'] == 'denied' and i['last'] is None and not p.weather_requests,
                  i['last'])
            ctx.close()

            # G10 weer-API offline
            ctx, p = home(b, url, geo=GPS)
            ctx.close()
            ctx2 = b.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', geolocation=GPS, permissions=['geolocation'])
            ctx2.add_init_script(SUN); ctx2.add_init_script(GEO)
            p = ctx2.new_page(); p.route(WEATHER, lambda r: r.abort())
            boot(p, url); settle(p)
            i = info(p)
            check('G10', 'weer-API onbereikbaar: "Weer niet beschikbaar", zon blijft voor GPS-positie', i['error'] == 'Weer niet beschikbaar' and i['sunKind'] == 'gps',
                  (i['error'], i['sunPlace']))
            ctx2.close()

            # G11 breedtes
            sizes = {}
            for width in (320, 390, 430):
                ctx, p = home(b, url, geo=None, width=width)
                i = info(p)
                sizes[width] = (round(i['overflow'], 1), [round(x['h']) for x in i['buttons']], max([x['r'] for x in i['buttons']] or [0]) <= width)
                if width == 390:
                    p.locator('#weatherSection').screenshot(path='tests/screenshots/gps01_geen_locatie_390.png')
                ctx.close()
            check('G11', '320/390/430 px: geen overloop, knoppen ≥ 44 px binnen beeld',
                  all(o <= 1 and all(h >= 44 for h in hs) and inside for o, hs, inside in sizes.values()), sizes)

            check('G12', 'privacy: geen coördinaten in weer/zon, weerverzoek en opslag afgerond, geen paginafouten', g12a and not g12_errors, g12_errors)
            check_manual_location_recovery(b, url)
            check_manual_location_navigation(b, url)
            b.close()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"GPS-01: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL ' + str(failed) if failed else ''}")
    raise SystemExit(1 if failed else 0)


if __name__ == '__main__':
    run()
