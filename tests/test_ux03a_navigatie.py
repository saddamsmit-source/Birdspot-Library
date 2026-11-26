#!/usr/bin/env python3
"""UX-03A (25-11-2026): drie kernactiviteiten zonder uitleg bereikbaar; herkenbare iconen met labels.

N1  Home: Ontdekken · Waarnemen · Mijn collectie boven de vouw (320/390/430), icoon + woord, ≥ 44 px
N2  Ontdekken → soortengids; Waarnemen → keuze waarneming/geluid (zelfde als centrale +); Mijn collectie → lijst
N3  browser-terug vanaf elk doel brengt je naar Home; focus en scherm kloppen
N4  soortengids: zoeken, Mijn waarnemingen en soortdetail met tabbladen (herkenning/vergelijken, mijn waarnemingen) direct zichtbaar
N5  formulier: soort, hoe waargenomen, datum, locatie en Opslaan zonder scrollen; uitgebreide opties ingeklapt
N6  kaart: zoeken, Lijst (waarnemingen) en '+ Pin waarneming' als drie herkenbare, gelabelde bedieningen
N7  profiel: snelkoppelingen naar Back-up & herstel en Instellingen verplaatsen de focus naar die sectie
N8  iconen: één lijnstijl; geen soortemoji als placeholder (soortengids, kiezer, formulier, Home, kaart); iconen passen bij functie
N9  lege toestand (vers profiel): Home toont kernacties; Mijn collectie toont lege staat met + uitleg
N10 320/390/430: geen horizontale overloop op Home, Soorten, Kaart, Profiel, Mijn waarnemingen; navigatie ≥ 44 px
N11 toetsenbord: Tab bereikt de kernacties, Enter op Ontdekken navigeert, focus zichtbaar
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, boot  # noqa: E402

RESULTS = []
EMOJI = r"/[\u{1F300}-\u{1FAFF}\u{1F54A}]/u"


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def nav(page, route):
    page.evaluate(f"async () => {{ const a = await import('/src/app.js'); a.navigate('{route}', {{ force: true }}); }}")
    page.locator(f'#screen-{route}').wait_for(timeout=10000)
    page.wait_for_timeout(700)


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(width=390, fresh=False):
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True, has_touch=True)
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            if not fresh:
                seed(page, base)
            return ctx, page, errors

        # ── N1 + N10 per breedte ─────────────────────────────────────
        layout = {}
        for width in (320, 390, 430):
            ctx, page, errors = context(width)
            nav(page, 'home')
            core = page.evaluate("""() => [...document.querySelectorAll('.home-core-action')].map(b => { const r = b.getBoundingClientRect();
              return { text: b.innerText.replace(/\\s+/g, ' ').trim(), icon: b.querySelector('svg')?.dataset.icon, h: Math.round(r.height),
                       w: Math.round(r.width), bottom: Math.round(r.bottom), clipped: [...b.querySelectorAll('span')].some(s => s.scrollWidth > s.clientWidth + 1) }; })""")
            overflow = {}
            for route in ('home', 'species', 'map', 'profile', 'sightings'):
                nav(page, route)
                overflow[route] = page.evaluate("() => document.documentElement.scrollWidth > innerWidth || document.getElementById('main-view').scrollWidth > innerWidth + 1")
            navs = page.evaluate("() => [...document.querySelectorAll('#app-nav .nav-item, #fab')].map(b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))")
            layout[width] = (core, overflow, navs)
            if width == 390:
                page.screenshot(path='/tmp/ux03a_home_390.png')
            ctx.close()
        c390 = layout[390][0]
        check('N1', 'Home: Ontdekken · Waarnemen · Mijn collectie boven de vouw, icoon + woord, ≥ 44 px, niet afgekapt',
              all([c['text'] for c in v[0]] == ['Ontdekken', 'Waarnemen', 'Mijn collectie'] and all(c['h'] >= 44 and c['bottom'] < 300 and not c['clipped'] for c in v[0])
                  for v in layout.values()) and [c['icon'] for c in c390] == ['binoculars', 'eye', 'observations'],
              {w: [(c['text'], c['h'], c['bottom'], c['clipped']) for c in v[0]] for w, v in layout.items()})
        check('N10', '320/390/430: geen horizontale overloop op 5 schermen; navigatie en + ≥ 44 px',
              all(not any(v[1].values()) and min(v[2]) >= 44 for v in layout.values()), {w: (v[1], v[2]) for w, v in layout.items()})

        # ── N2 + N3 kernroutes en terug ──────────────────────────────
        ctx, page, errors = context()
        nav(page, 'home')
        res = {}
        page.locator('.home-core-action', has_text='Ontdekken').click()
        page.locator('#screen-species').wait_for(timeout=8000)
        res['ontdekken'] = page.locator('#screen-species').count() == 1
        page.go_back()
        page.locator('#screen-home').wait_for(timeout=8000)
        res['terug1'] = page.locator('.home-core-action').count() == 3
        page.locator('#homeCoreObserve').click()
        dialog = page.locator('[data-quick-action="seen"]')
        dialog.wait_for(timeout=8000)
        res['waarnemen'] = page.locator('[data-quick-action]').count() >= 2
        page.go_back()
        page.wait_for_timeout(500)
        res['terug2'] = page.locator('[data-quick-action="seen"]').count() == 0 and page.locator('#screen-home').count() == 1
        page.locator('.home-core-action', has_text='Mijn collectie').click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        res['collectie'] = page.locator('#sightingsSearch').is_visible()
        page.go_back()
        page.locator('#screen-home').wait_for(timeout=8000)
        res['terug3'] = page.locator('.home-core-action').count() == 3
        check('N2', 'kernroutes: Ontdekken → gids, Waarnemen → keuze, Mijn collectie → lijst met zoeken',
              res['ontdekken'] and res['waarnemen'] and res['collectie'] and not errors, res)
        check('N3', 'browser-terug vanaf elk doel naar Home (keuzevenster sluit eerst)', res['terug1'] and res['terug2'] and res['terug3'], res)

        # ── N4 soortengids ───────────────────────────────────────────
        nav(page, 'species')
        guide = page.evaluate("""() => ({ search: !!document.querySelector('#screen-species input[type="search"], #screen-species input'),
          mine: document.querySelector('#speciesOpenSightings')?.innerText.trim() })""")
        page.evaluate("""async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }""")
        page.locator('.sd-tabs').wait_for(timeout=12000)
        tabs = page.locator('.sd-tabs [role="tab"]').all_inner_texts()
        has_mine_tab = page.locator('#sdTab-mijn').count() == 1   # eigen waarnemingen van deze soort
        page.keyboard.press('Escape')
        page.wait_for_timeout(400)
        nav(page, 'species')
        page.locator('#speciesOpenSightings').click()
        page.locator('#screen-sightings #sightingCards').wait_for(timeout=8000)
        check('N4', 'soortengids: zoekveld, Mijn waarnemingen en soortdetail met tabbladen direct zichtbaar',
              guide['search'] and guide['mine'] == 'Mijn waarnemingen' and len(tabs) >= 3 and 'Waarnemingen' in tabs and has_mine_tab, (guide, tabs))

        # ── N5 formulier ─────────────────────────────────────────────
        page.locator('#fab').click()
        page.locator('[data-quick-action="seen"]').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.wait_for_timeout(500)
        form = page.evaluate("""() => { const vis = sel => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= innerHeight && r.height > 0; };
          return { soort: vis('#speciesPickerBtn'), methode: vis('#sightMethodGroup'), datum: vis('#sightDate'), locatie: vis('#sightLocation'),
                   opslaan: vis('#addSheetSubmit'), meer: document.querySelector('#sightingMore')?.open === false }; }""")
        page.locator('#addSheetCancel').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        check('N5', 'formulier: kernvelden en Opslaan zonder scrollen; Meer details ingeklapt', all(form.values()), form)

        # ── N6 kaart ─────────────────────────────────────────────────
        nav(page, 'map')
        mapc = page.evaluate("""() => ({ search: document.querySelector('#mapSearch, .map-topbar input')?.getAttribute('aria-label'),
          list: document.querySelector('#explorerSightingsBtn')?.innerText.trim(), listLabel: document.querySelector('#explorerSightingsBtn')?.getAttribute('aria-label'),
          pin: document.querySelector('#mapAddPinBtn')?.innerText.trim(), filter: document.querySelector('#mapFilterBtn')?.getAttribute('aria-label') })""")
        check('N6', 'kaart: zoeken, Lijst (waarnemingen) en + Pin waarneming zijn drie herkenbare, gelabelde bedieningen',
              mapc['search'] and mapc['list'] == 'Lijst' and 'waarnemingen' in mapc['listLabel'] and mapc['pin'] == '+ Pin waarneming' and mapc['filter'] == 'Filters', mapc)

        # ── N7 profiel ───────────────────────────────────────────────
        nav(page, 'profile')
        jumps = page.locator('[data-profile-jump]').all_inner_texts()
        page.locator('[data-profile-jump="backupHeading"]').click()
        page.wait_for_timeout(400)
        f1 = page.evaluate("() => document.activeElement?.id")
        page.locator('[data-profile-jump="settingsHeading"]').click() if page.locator('[data-profile-jump="settingsHeading"]').is_visible() else page.evaluate("() => document.querySelector('[data-profile-jump=\"settingsHeading\"]').click()")
        page.wait_for_timeout(400)
        f2 = page.evaluate("() => document.activeElement?.id")
        check('N7', 'profiel: snelkoppelingen naar Back-up & herstel en Instellingen verplaatsen focus', jumps == ['Back-up & herstel', 'Instellingen']
              and f1 == 'backupHeading' and f2 == 'settingsHeading', (jumps, f1, f2))

        # ── N8 iconen ────────────────────────────────────────────────
        emoji = {}
        nav(page, 'species')
        emoji['soorten'] = page.evaluate(f"() => {EMOJI}.test(document.querySelector('#screen-species').innerText)")
        nav(page, 'home')
        page.wait_for_timeout(800)
        emoji['home'] = page.evaluate(f"() => {EMOJI}.test(document.querySelector('#recentList')?.innerText || '')")
        nav(page, 'map')
        emoji['kaart'] = page.evaluate(f"() => {EMOJI}.test(document.querySelector('#mapSheetIcon')?.innerText || '')")
        page.locator('#fab').click()
        page.locator('[data-quick-action="seen"]').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#speciesPickerBtn').click()
        page.locator('#spPickerList .species-row').first.wait_for(timeout=8000)
        emoji['kiezer'] = page.evaluate(f"() => {EMOJI}.test(document.querySelector('#spPickerList').innerText)")
        page.locator('#spPickerList .species-row[data-id="sp045"]').click()
        page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
        emoji['formulier'] = page.evaluate(f"() => {EMOJI}.test(document.querySelector('#speciesPickerBtn').innerText)")
        icons = page.evaluate("""() => ({ quick: null, nav: [...document.querySelectorAll('#app-nav .nav-item')].map(b => b.innerText.trim()) })""")
        page.locator('#addSheetCancel').click()
        if page.locator('#sightingLeaveDialog').count():
            page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        check('N8', 'iconen: geen soortemoji als placeholder; navigatie met woorden', not any(emoji.values())
              and icons['nav'] == ['Home', 'Soorten', 'Kaart', 'Profiel'] and not errors, (emoji, icons['nav']))
        ctx.close()

        # ── N9 lege toestand ─────────────────────────────────────────
        ctx, page, errors = context(fresh=True)
        page.evaluate("() => { localStorage.removeItem('birdspot-sightings'); }")
        page.reload(wait_until='domcontentloaded')
        boot(page, base)
        nav(page, 'home')
        core = page.locator('.home-core-action').count()
        page.locator('.home-core-action', has_text='Mijn collectie').click()
        page.locator('#screen-sightings #sightingsList').wait_for(timeout=8000)
        page.wait_for_timeout(400)
        empty = page.locator('#sightingsList').inner_text()
        tools_hidden = page.locator('#sightingsTools').is_hidden()
        check('N9', 'lege toestand: kernacties zichtbaar; Mijn collectie toont lege staat met + uitleg, geen lege filterbalk',
              core == 3 and 'Nog geen waarnemingen' in empty and '+' in empty and tools_hidden and not errors, empty.replace('\n', ' '))

        # ── N11 toetsenbord ──────────────────────────────────────────
        nav(page, 'home')
        reached = None
        for _ in range(12):
            page.keyboard.press('Tab')
            cls = page.evaluate("() => document.activeElement?.className || ''")
            if 'home-core-action' in cls:
                reached = page.evaluate("() => document.activeElement.innerText.trim()")
                break
        outline = page.evaluate("() => getComputedStyle(document.activeElement).outlineStyle")
        page.keyboard.press('Enter')
        page.wait_for_timeout(700)
        check('N11', 'toetsenbord: Tab bereikt Ontdekken, focus zichtbaar, Enter navigeert',
              reached == 'Ontdekken' and outline != 'none' and page.locator('#screen-species').count() == 1, (reached, outline))
        ctx.close()
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03A: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 11 else 0)


if __name__ == '__main__':
    main()
