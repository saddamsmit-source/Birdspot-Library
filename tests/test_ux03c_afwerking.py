#!/usr/bin/env python3
"""UX-03C (25-11-2026): kleuren, afwerking en toegankelijkheid — geen herontwerp.

C1 soortkiezer: titel en Sluiten los van de rand, op één regel, Sluiten ≥ 44×44, dialoog en zoekveld benoemd (320/390/430)
C2 tikdoelen ≥ 44×44 op Home, soortengids, lijst, kaart (legenda, filterpaneel, plekkaartje), detail, formulier, kiezer, profiel;
   kaartlegenda zichtbaar compact (K1-01 ≤ 20 %), tikrand 44 via ::after — gemeten met elementFromPoint
C3 meldingen: één laag met vaste toon (info/succes/waarschuwing/fout), eigen teken per toon, fout als alert,
   tekst loopt door op 320; echte route: 'Kies eerst een soort' = waarschuwing, 'Waarneming bijgewerkt' = succes
C4 geen dubbele uitleg in het detail: herkenningsuitleg één keer; tegenstrijdige 'zeker' in één zin
C5 contrast licht én donker ≥ 4,5:1 (groot ≥ 3:1) op 7 schermen, soortkaart, detail, formulier, kiezer en meldingen
C6 schermlezer: elke zichtbare knop, link en invoer heeft een naam
C7 kleur nooit het enige signaal: status, legenda en melding hebben tekst of teken
C8 geen horizontale overloop op 320/390/430
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from ux02_fixtures import start_server, seed, go_sightings, boot, SIGHTINGS, PLACES  # noqa: E402
from test_explorer_species_cluster import LEAFLET_STUB  # noqa: E402

RESULTS = []
SCREENS = ['home', 'species', 'sightings', 'map', 'profile', 'journal', 'insights']

SMALL = """root => [...(document.querySelector(root) || document.body).querySelectorAll('button, a[href], input:not([type=hidden]), select, summary, [role=button], [role=tab]')]
  .filter(e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    if (!r.width || !r.height || cs.visibility === 'hidden' || e.closest('[hidden], .leaflet-container')) return false;
    if (['radio', 'checkbox', 'file'].includes(e.type) || e.classList.contains('visually-hidden')) return false;   // label is het doel
    if (e.tagName === 'A' && e.closest('p, small, figcaption, .photo-info, [class*=credit], [class*=attribution]')) return false;   // inline tekstlink (WCAG 2.5.8 uitzondering)
    // onzichtbare tikrand via ::after (bijv. het zoekveld in de kop: 38 zichtbaar + 2×3 rand = 44)
    const a = getComputedStyle(e, '::after'); const ext = v => a.content !== 'none' && a.position === 'absolute' ? Math.max(0, -parseFloat(v) || 0) : 0;
    return r.width + ext(a.left) + ext(a.right) < 43.5 || r.height + ext(a.top) + ext(a.bottom) < 43.5; })
  .map(e => { const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}#${e.id}.${[...e.classList].join('.')} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 18)}" ${Math.round(r.width)}x${Math.round(r.height)}`; })"""

SWEEP = """root => { const out = [];
  const parse = c => { const m = (c.match(/[\\d.]+/g) || [0, 0, 0, 0]).map(Number); return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
  const L = rgb => .2126 * lin(rgb[0]) + .7152 * lin(rgb[1]) + .0722 * lin(rgb[2]);
  const bgOf = el => { for (let n = el; n; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.backgroundImage !== 'none') return null; const p = parse(cs.backgroundColor); if (p.a > .85) return p.rgb; } return [255, 255, 255]; };
  const walker = document.createTreeWalker(document.querySelector(root) || document.body, NodeFilter.SHOW_TEXT); const seen = new Set();
  while (walker.nextNode()) { const el = walker.currentNode.parentElement; if (!walker.currentNode.textContent.trim() || seen.has(el)) continue; seen.add(el);
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!r.width || !r.height || cs.visibility === 'hidden' || +cs.opacity === 0 || el.closest('[hidden], .visually-hidden, .sr-only, .leaflet-container, .toast:not(.show)')) continue;
    const bg = bgOf(el); if (!bg) continue; const fg = parse(cs.color); if (fg.a < .5) continue;
    const a = L(fg.rgb), b = L(bg), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const size = parseFloat(cs.fontSize), need = (size >= 24 || (+cs.fontWeight >= 700 && size >= 18.66)) ? 3 : 4.5;
    if (ratio < need) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${walker.currentNode.textContent.trim().slice(0, 24)}" ${ratio.toFixed(2)}`); }
  return out; }"""

NONAME = """root => [...(document.querySelector(root) || document.body).querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=tab]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && !e.closest('[hidden], .leaflet-container'); })
  .filter(e => !(e.getAttribute('aria-label') || (e.getAttribute('aria-labelledby') || '').split(' ').map(i => document.getElementById(i)?.textContent || '').join('').trim()
    || e.textContent.trim() || e.title || (e.labels && [...e.labels].map(l => l.textContent).join('').trim()) || e.closest('label')?.textContent.trim()))
  .map(e => `${e.tagName.toLowerCase()}#${e.id}.${[...e.classList].join('.')}`)"""

OVERFLOW = "() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - innerWidth"


def check(code, name, ok, detail=''):
    RESULTS.append((code, bool(ok)))
    print(f"{code} {name} {'PASS' if ok else 'FAIL'}{' — ' + str(detail) if detail != '' else ''}", flush=True)


def nav(page, route, wait=1300):
    page.evaluate(f"async () => {{ const a = await import('/src/app.js'); a.navigate('{route}', {{ force: true }}); }}")
    page.wait_for_timeout(wait)


def open_form(page):
    go_sightings(page)
    page.locator('#fab').click()
    page.locator('[data-quick-action="seen"]').click()
    page.locator('#addSightingSheet.open').wait_for(timeout=9000)
    page.wait_for_timeout(300)


def main():
    server, base = start_server()
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)

        def context(width=390, dark=False):
            # GPS-01: zonkaart toont alleen met een echte positie; vaste testpositie met toestemming (bewuste testwijziging).
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, timezone_id='Europe/Amsterdam', is_mobile=True,
                                      has_touch=True, color_scheme='dark' if dark else 'light',
                                      geolocation={'latitude': 51.92, 'longitude': 4.47}, permissions=['geolocation'])
            ctx.add_init_script(LEAFLET_STUB)
            # zonkaart altijd tonen (SunCalc komt van een CDN): vaste tijden, zelfde rendering als in CI
            ctx.add_init_script("""window.SunCalc = { getTimes: d => { const t = h => { const x = new Date(d); x.setHours(h, 0, 0, 0); return x; };
              return { sunrise: t(8), sunset: t(17), goldenHourEnd: t(9), goldenHour: t(16) }; } };""")
            page = ctx.new_page()
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            boot(page, base)
            seed(page, base, SIGHTINGS, PLACES)
            return ctx, page, errors

        # ── C1 soortkiezer + C8 overloop, per breedte ────────────────
        c1, c8 = {}, {}
        for width in (320, 390, 430):
            ctx, page, errors = context(width)
            over = {}
            for r in SCREENS:
                nav(page, r)
                over[r] = page.evaluate(OVERFLOW)
            open_form(page)
            page.locator('#speciesPickerBtn').click()
            page.locator('#speciesPickerOverlay #spPickerClose').wait_for(timeout=8000)
            page.wait_for_timeout(450)
            geo = page.evaluate("""() => { const ov = document.querySelector('#speciesPickerOverlay'); const s = ov.querySelector('.sheet').getBoundingClientRect();
              const t = ov.querySelector('.sheet__title').getBoundingClientRect(), c = ov.querySelector('#spPickerClose').getBoundingClientRect();
              const dlg = ov.querySelector('[role=dialog]'); const lab = document.getElementById(dlg.getAttribute('aria-labelledby'))?.textContent;
              return { left: Math.round(t.left - s.left), right: Math.round(s.right - c.right), w: Math.round(c.width), h: Math.round(c.height),
                sameRow: t.top < c.bottom && c.top < t.bottom, name: ov.querySelector('#spPickerClose').getAttribute('aria-label'), dialog: lab,
                search: ov.querySelector('#spPickerSearch').getAttribute('aria-label') }; }""")
            page.locator('#spPickerClose').click()
            page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
            back = page.locator('#addSightingSheet.open').count() == 1
            over['form'] = page.evaluate(OVERFLOW)
            c1[width] = (geo, back)
            c8[width] = {k: v for k, v in over.items() if v > 0}
            if width == 390:
                page.screenshot(path='/tmp/ux03c_form_390.png')
            ctx.close()
        check('C1', 'soortkiezer: titel en Sluiten ≥ 12 px van de rand, op één regel, Sluiten ≥ 44×44, dialoog/zoekveld benoemd; sluiten → formulier',
              all(g['left'] >= 12 and g['right'] >= 12 and g['w'] >= 44 and g['h'] >= 44 and g['sameRow'] and g['name'] == 'Soortkeuze sluiten'
                  and g['dialog'] == 'Kies soort' and g['search'] == 'Zoek soort' and back for g, back in c1.values()),
              {w: (g['left'], g['right'], f"{g['w']}x{g['h']}") for w, (g, _) in c1.items()})

        # ── C2–C7 op 390, licht ──────────────────────────────────────
        ctx, page, errors = context()
        small, noname, contrast = {}, {}, {}
        for r in SCREENS:
            nav(page, r)
            small[r], noname[r], contrast[r] = page.evaluate(SMALL, 'body'), page.evaluate(NONAME, 'body'), page.evaluate(SWEEP, 'body')
            if r == 'home':
                page.locator('#sunSection .sun-location').wait_for(timeout=8000)
                contrast['home-zonkaart'] = page.evaluate(SWEEP, '#sunSection')
        # kaart: filterpaneel en plekkaartje
        nav(page, 'map', 1500)
        legend = page.evaluate("() => [...document.querySelectorAll('.map-legend button')].map(b => b.textContent.trim())")
        legend_hit = page.evaluate("""() => [...document.querySelectorAll('.map-legend button')].every(b => { const r = b.getBoundingClientRect(), x = r.left + r.width / 2;
          const at = y => document.elementFromPoint(x, y)?.closest('.map-legend button') === b; return r.width >= 44 && at(r.top - 5) && at(r.bottom + 5); })""")
        page.locator('#mapFilterBtn').click()
        page.wait_for_timeout(400)
        small['kaartfilter'], noname['kaartfilter'] = page.evaluate(SMALL, '#mapFilterPanel'), page.evaluate(NONAME, '#mapFilterPanel')
        page.evaluate("async () => { sessionStorage.setItem('birdspot-map-place', 'pl_named'); const a = await import('/src/app.js'); a.navigate('map', { force: true }); }")
        page.locator('#mapSheetBody .place-sightings').wait_for(timeout=15000)
        small['plekkaartje'], noname['plekkaartje'] = page.evaluate(SMALL, '#mapDetailSheet'), page.evaluate(NONAME, '#mapDetailSheet')
        # soortkaart
        page.evaluate("async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }")
        page.locator('#sdTab-mijn').wait_for(timeout=15000)
        contrast['soortkaart'] = page.evaluate(SWEEP, '.sheet-overlay')
        page.keyboard.press('Escape')
        page.wait_for_timeout(300)
        # detail: uitleg één keer
        go_sightings(page)
        texts = {}
        for sid in ('s04', 's06', 's08'):
            page.locator(f'.sight-card[data-id="{sid}"]').click()
            page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
            texts[sid] = (page.locator('#detailSightingSheet').inner_text(), page.locator('#detailSightingSheet .detail-summary').inner_text())
            if sid == 's06':
                small['detail'], noname['detail'], contrast['detail'] = (page.evaluate(SMALL, '#detailSightingSheet'), page.evaluate(NONAME, '#detailSightingSheet'),
                                                                         page.evaluate(SWEEP, '#detailSightingSheet'))
            page.locator('#detailClose').click()
            page.locator('#detailSightingSheet').wait_for(state='detached', timeout=8000)
        # formulier + kiezer + echte meldingen
        open_form(page)
        if page.locator('#sightingMore summary').count():
            page.locator('#sightingMore summary').click()
        small['formulier'], noname['formulier'], contrast['formulier'] = (page.evaluate(SMALL, '#addSightingSheet'), page.evaluate(NONAME, '#addSightingSheet'),
                                                                          page.evaluate(SWEEP, '#addSightingSheet'))
        page.locator('#addSheetSubmit').click()
        page.wait_for_timeout(300)
        warn_real = page.evaluate("() => { const t = document.querySelector('.toast.show:not(.app-update)'); return t && [t.dataset.tone, t.getAttribute('role'), t.textContent]; }")
        page.locator('#speciesPickerBtn').click()
        page.locator('#spPickerClose').wait_for(timeout=8000)
        small['kiezer'], noname['kiezer'], contrast['kiezer'] = (page.evaluate(SMALL, '#speciesPickerOverlay'), page.evaluate(NONAME, '#speciesPickerOverlay'),
                                                                  page.evaluate(SWEEP, '#speciesPickerOverlay'))
        page.locator('#spPickerClose').click()
        page.locator('#speciesPickerOverlay').wait_for(state='detached', timeout=8000)
        page.locator('#addSheetCancel').click()
        page.wait_for_timeout(400)
        if page.locator('#sightingLeaveDialog').count():
            page.locator('#sightingLeaveDialog').get_by_role('button', name='Wijzigingen verwerpen').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=8000)
        go_sightings(page)
        page.locator('.sight-card[data-id="s01"]').click()
        page.locator('#detailEdit').click()
        page.locator('#addSightingSheet.open').wait_for(timeout=8000)
        page.locator('#sightNotes').fill('UX-03C bewerking')
        page.locator('#addSheetSubmit').click()
        page.locator('#addSightingSheet').wait_for(state='detached', timeout=15000)
        success_real = page.evaluate("() => { const t = document.querySelector('.toast.show:not(.app-update)'); return t && [t.dataset.tone, t.getAttribute('role'), t.textContent]; }")
        ctx.close()

        bad_small = {k: v for k, v in small.items() if v}
        check('C2', 'tikdoelen ≥ 44×44 op alle schermen, kaartfilter, plekkaartje, detail, formulier en kiezer; kaartlegenda raakt ook 5 px boven/onder',
              not bad_small and legend_hit, bad_small or f'{len(small)} gebieden, legenda-tikrand {legend_hit}')

        # ── C3 + C5 meldingen en contrast, licht en donker ───────────
        tones = {}
        for dark in (False, True):
            ctx, page, errors2 = context(320, dark=dark)
            nav(page, 'sightings')
            for tone in ('info', 'success', 'warn', 'error'):
                page.evaluate("t => window.__birdspot.toast('Proefmelding met een wat langere tekst die op een smal scherm moet doorlopen', t)", tone)
                page.wait_for_timeout(260)
                tones[(dark, tone)] = page.evaluate("""() => { const t = document.querySelector('.toast.show:not(.app-update)'); const r = t.getBoundingClientRect();
                  return { tone: t.dataset.tone, role: t.getAttribute('role'), mark: getComputedStyle(t, '::before').content, fits: r.left >= 0 && r.right <= innerWidth && t.scrollWidth <= t.clientWidth + 1,
                    lines: Math.round(r.height / parseFloat(getComputedStyle(t).lineHeight)) }; }""")
                tones[(dark, tone)]['contrast'] = page.evaluate(SWEEP, '.toast.show:not(.app-update)')
            if dark:
                for r in SCREENS:
                    nav(page, r)
                    contrast[f'donker-{r}'] = page.evaluate(SWEEP, 'body')
                go_sightings(page)
                page.locator('.sight-card[data-id="s06"]').click()
                page.locator('#detailSightingSheet.open').wait_for(timeout=8000)
                contrast['donker-detail'] = page.evaluate(SWEEP, '#detailSightingSheet')
                page.locator('#detailClose').click()
                page.wait_for_timeout(300)
                page.evaluate("async () => { sessionStorage.setItem('birdspot-open-species', 'sp045'); const a = await import('/src/app.js'); a.navigate('species', { force: true }); }")
                page.locator('#sdTab-mijn').wait_for(timeout=15000)
                contrast['donker-soortkaart'] = page.evaluate(SWEEP, '.sheet-overlay')
                page.screenshot(path='/tmp/ux03c_dark_species.png')
            errors += errors2
            ctx.close()
        marks = {t: tones[(False, t)]['mark'] for t in ('info', 'success', 'warn', 'error')}
        check('C3', 'meldingen: vaste toon met eigen teken, fout als alert, past op 320 (licht en donker); echte route waarschuwing/succes',
              all(v['tone'] == k[1] and v['fits'] and v['lines'] >= 2 for k, v in tones.items())
              and all(tones[(d, 'error')]['role'] == 'alert' and tones[(d, 'info')]['role'] == 'status' for d in (False, True))
              and len(set(marks.values())) == 4 and all(m not in ('none', 'normal', '') for m in marks.values())
              and warn_real and warn_real[0] == 'warn' and 'Kies eerst een soort' in warn_real[2]
              and success_real and success_real[0] == 'success' and 'bijgewerkt' in success_real[2], (marks, warn_real, success_real))

        t04, s04 = texts['s04']
        t06, s06 = texts['s06']
        check('C4', 'geen dubbele uitleg in het detail: herkenningsuitleg één keer; kop toont alleen het label',
              t04.count('eigen controle is nog niet vastgelegd') == 1 and 'niet zelf gecontroleerd' not in s04 and 'BirdNET · suggestie' in s04
              and t06.count('Of je die zelf controleerde') == 1 and 'eigen controle is niet vastgelegd' in t06 and 'niet zelf gecontroleerd' not in t06,
              s04.replace('\n', ' | '))

        toast_low = {f"{'donker' if d else 'licht'}-{t}": v['contrast'] for (d, t), v in tones.items() if v['contrast']}
        bad_contrast = {k: v for k, v in contrast.items() if v}
        bad_contrast.update(toast_low)
        check('C5', 'contrast ≥ 4,5:1 (groot ≥ 3:1) licht en donker: 7 schermen, soortkaart, detail, formulier, kiezer, meldingen',
              not bad_contrast and len(contrast) >= 19, bad_contrast or f'{len(contrast)} gebieden + 8 meldingen')

        bad_names = {k: v for k, v in noname.items() if v}
        check('C6', 'schermlezer: elke zichtbare knop, link en invoer heeft een naam', not bad_names, bad_names or f'{len(noname)} gebieden')

        check('C7', 'kleur nooit het enige signaal: legenda met woorden, meldingen met teken, status met tekst',
              legend[:3] == ['Gezien', 'Gehoord', 'Beide'] and all(legend) and len(set(marks.values())) == 4
              and 'BirdNET · suggestie' in s04, legend)

        bad_over = {w: v for w, v in c8.items() if v}
        check('C8', 'geen horizontale overloop op 320/390/430 (7 schermen + formulier)', not bad_over, bad_over or '24 schermen')
        if errors:
            print('pageerrors:', errors[:3])
        browser.close()
    server.shutdown()
    failed = [c for c, ok in RESULTS if not ok]
    print(f"UX-03C: {len(RESULTS) - len(failed)}/{len(RESULTS)} PASS{' — FAIL: ' + ', '.join(failed) if failed else ''}")
    sys.exit(1 if failed or len(RESULTS) < 8 or errors else 0)


if __name__ == '__main__':
    main()
