#!/usr/bin/env python3
"""Birdspot preview-QA — één vaste browsercontrole voor Claude en ChatGPT (PR #358).

Draait tegen een willekeurige basis-URL: een lokale server van exact de Vercel-deployset
(`--local`) of een beveiligde Vercel-preview (`--url`). Geen deployment, geen schrijfactie
op de host; testdata blijft in een wegwerp-browserprofiel.

Bewijslagen die dit script NIET dekt en apart gemeld moeten worden:
- GitHub-SHA ↔ gedeployde SHA en READY: tools/preview/check_deployment.mjs (Vercel-API);
- gewijzigde gebruikersfuncties: de gerichte bestaande tests van die wijziging;
- fysiek toestel en eigenaarreview.

Toegang tot een beveiligde preview loopt alleen via Protection Bypass for Automation
(header `x-vercel-protection-bypass` uit omgevingsvariabele VERCEL_AUTOMATION_BYPASS_SECRET).
Ontbreekt die of opent de URL een inlogpagina, dan is de uitkomst BLOCKED — nooit PASS.

Gebruik:
  python3 tests/preview_qa.py --local [--widths 320,390,430]
  VERCEL_AUTOMATION_BYPASS_SECRET=... python3 tests/preview_qa.py --url https://<preview>.vercel.app/
Uitvoer: JSON-rapport (stdout en --report) met per controle PASS/FAIL/BLOCKED; exitcode 0 alleen bij PASS.
"""
import argparse
import http.server
import json
import os
import re
import sys
import threading
import urllib.parse
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ALLOW = {l[1:].strip() for l in (ROOT / '.vercelignore').read_text().splitlines() if l.startswith('!')}
SPECIES = ('Grote Bonte Specht', 'sp016')  # heeft Snel herkennen, Lijkt op, Let op, kleedfoto's en audio
NAV = ('species', 'map', 'profile', 'home')


class DeploySetHandler(http.server.SimpleHTTPRequestHandler):
    """Serveert alleen de .vercelignore-toelatingslijst; al het andere is 404 (zoals op Vercel)."""

    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def send_head(self):
        first = urllib.parse.unquote(urllib.parse.urlsplit(self.path).path.lstrip('/').split('/')[0])
        if first and first not in ALLOW:
            self.send_error(404, 'not in deploy set')
            return None
        return super().send_head()

    def log_message(self, *a):
        pass


def repo_app_version():
    return re.search(r"const APP_VERSION = '([^']+)'", (ROOT / 'sw.js').read_text()).group(1)


def run(base, widths, secret, launch):
    report = {'base': base, 'expectedAppVersion': repo_app_version(), 'widths': widths, 'checks': []}

    def add(name, ok, detail=''):
        report['checks'].append({'check': name, 'result': ok if isinstance(ok, str) else ('PASS' if ok else 'FAIL'), 'detail': detail})

    origin = urllib.parse.urlsplit(base).netloc
    headers = {'x-vercel-protection-bypass': secret, 'x-vercel-set-bypass-cookie': 'true'} if secret else {}
    with sync_playwright() as pw:
        browser = pw.chromium.launch(**launch)
        for width in widths:
            ctx = browser.new_context(viewport={'width': width, 'height': 844}, is_mobile=True, has_touch=True,
                                      reduced_motion='reduce', service_workers='allow', extra_http_headers=headers)
            page = ctx.new_page()
            errors, failed = [], []
            page.on('pageerror', lambda e: errors.append(str(e)))
            external = []
            # 'Failed to load resource' staat al in response/requestfailed hieronder, met URL.
            page.on('console', lambda m: m.type == 'error' and not m.text.startswith('Failed to load resource') and errors.append(m.text))
            page.on('response', lambda r: r.status >= 400 and not r.url.endswith('/favicon.ico')
                    and (failed if urllib.parse.urlsplit(r.url).netloc == origin else external).append(f'{r.status} {r.url[:120]}'))
            # ERR_ABORTED = door de pagina zelf afgebroken (bijv. audio-preload bij sluiten), geen serverfout.
            page.on('requestfailed', lambda r: r.failure != 'net::ERR_ABORTED' and (failed if urllib.parse.urlsplit(r.url).netloc == origin else external)
                    .append(f'{r.failure} {r.url[:120]}'))
            w = f'{width}px'
            # 1. Toegang: echte app, geen inlog- of foutpagina.
            try:
                resp = page.goto(base, wait_until='domcontentloaded', timeout=45000)
            except Exception as e:  # noqa: BLE001 — netwerk/proxy van de testomgeving bereikt de host niet
                add(f'{w} toegang', 'BLOCKED', f'host niet bereikbaar vanuit deze testomgeving: {str(e).splitlines()[0][:160]}')
                ctx.close()
                continue
            landed = urllib.parse.urlsplit(page.url).netloc
            if landed != origin or (resp and resp.status in (401, 403)):
                add(f'{w} toegang', 'BLOCKED', f'status {resp and resp.status}, beland op {page.url[:80]} — geautoriseerde toegang ontbreekt')
                ctx.close()
                continue
            try:
                skip = page.locator('#birdspotSplashSkip')
                if skip.count() and skip.is_visible():
                    skip.click()
                page.locator('#birdspotSplash').wait_for(state='detached', timeout=30000)
                page.locator('#fab').wait_for(state='visible', timeout=20000)
                add(f'{w} Home start', True)
            except Exception as e:  # noqa: BLE001 — elk startprobleem is een FAIL met reden
                add(f'{w} Home start', False, repr(e)[:200])
                ctx.close()
                continue
            # 2. Versie van de geserveerde serviceworker = versie op de geteste SHA.
            sw = page.evaluate("async () => (await (await fetch('sw.js', {cache: 'no-store'})).text()).match(/APP_VERSION = '([^']+)'/)?.[1]")
            add(f'{w} appversie', sw == report['expectedAppVersion'], f'geserveerd {sw}, repo {report["expectedAppVersion"]}')
            # 3. Navigatie over alle hoofdtabbladen en terug naar Home.
            nav_ok = []
            for route in NAV:
                page.locator(f'.nav-item[data-route="{route}"]').first.click()
                page.wait_for_timeout(400)
                nav_ok.append(page.locator(f'.nav-item[data-route="{route}"]').first.get_attribute('aria-current') in ('page', 'true')
                              or route in page.url)
            add(f'{w} navigatie', all(nav_ok), dict(zip(NAV, nav_ok)))
            # 4. Soortdetail: hoofdfoto geladen, credits, Snel herkennen, Lijkt op, Let op, audio.
            page.locator('.nav-item[data-route="species"]').first.click()
            if page.locator('#speciesFiltersToggle').count():
                page.locator('#speciesFiltersToggle').click()
            page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
            page.locator('#speciesSearch').fill(SPECIES[0])
            page.locator(f'.species-row[data-id="{SPECIES[1]}"] .species-row__body').click()
            page.locator('.sd-tabs').wait_for(timeout=15000)
            imgs = page.evaluate("""async () => { const out = [];
              for (const i of document.querySelectorAll('.signature-species-detail-overlay img')) {
                i.loading = 'eager'; try { await i.decode(); } catch (e) {}
                out.push([i.currentSrc.split('/').pop(), i.naturalWidth]); }
              return out; }""")
            broken = [n for n, wd in imgs if not wd]
            add(f'{w} gidsfoto\'s laden', bool(imgs) and not broken, f'{len(imgs)} beelden, kapot: {broken[:5]}')
            panel = page.locator('#sdPanel-herkenning')
            add(f'{w} Snel herkennen', panel.locator('.kb-quick').count() == 1)
            add(f'{w} Lijkt op', panel.locator('.sd-similar').count() == 1 and panel.locator('.sd-cmp-card').count() >= 1)
            add(f'{w} Let op', panel.locator('.kb-caution').count() >= 1)
            info = page.locator('.signature-species-detail-overlay details.photo-info').first
            if info.count():
                info.locator('summary').click()
                add(f'{w} credits', info.locator('.photo-info__panel a[href^="https://"]').count() >= 1)
            else:
                add(f'{w} credits', False, 'geen fotoinformatie gevonden')
            audio = page.evaluate("""async () => { const a = document.querySelector('.signature-species-detail-overlay audio source, .signature-species-detail-overlay audio');
              const src = a && (a.src || a.getAttribute('src')); if (!src) return null;
              const r = await fetch(src, {method: 'HEAD'}); return [src.split('/').pop(), r.status]; }""")
            add(f'{w} audio bereikbaar', bool(audio) and audio[1] == 200, audio)
            overflow = page.evaluate('document.documentElement.scrollWidth - document.documentElement.clientWidth')
            add(f'{w} geen horizontale overloop', overflow <= 1, f'{overflow}px')
            # 5. Terug/sluiten en heropenen.
            page.locator('.signature-species-detail-close').click()
            page.locator('.signature-species-detail-overlay').wait_for(state='detached', timeout=10000)
            page.locator(f'.species-row[data-id="{SPECIES[1]}"] .species-row__body').click()
            reopened = page.locator('.sd-tabs').wait_for(timeout=10000) is None
            page.locator('.signature-species-detail-close').click()
            add(f'{w} sluiten en heropenen', reopened)
            # 6. Offline: na serviceworker-installatie start de app zonder netwerk.
            ready = page.evaluate("""async () => { if (!('serviceWorker' in navigator)) return false;
              const r = await Promise.race([navigator.serviceWorker.ready, new Promise(x => setTimeout(() => x(null), 20000))]);
              return !!r; }""")
            page.wait_for_timeout(1500)
            ctx.set_offline(True)
            try:
                page.reload(wait_until='domcontentloaded', timeout=30000)
                page.locator('#fab').wait_for(state='visible', timeout=20000)
                add(f'{w} offline herstart', ready, 'serviceworker actief' if ready else 'serviceworker niet gereed')
            except Exception as e:  # noqa: BLE001
                add(f'{w} offline herstart', False, repr(e)[:160])
            ctx.set_offline(False)
            # 7. Fouten.
            add(f'{w} geen paginafouten', not errors, errors[:5])
            add(f'{w} geen mislukte verzoeken (eigen origin)', not failed, failed[:8])
            # Externe diensten (kaarttegels, CDN, weer, geluidsmodel) zijn geen deel van de deployset;
            # melden, niet als FAIL tellen. Offline-fase veroorzaakt hier ook verwachte fouten.
            add(f'{w} externe verzoeken', 'INFO', sorted({e.split(' ', 1)[1].split('/')[2] for e in external if ' ' in e and '//' in e})[:10])
            ctx.close()
        browser.close()
    results = {c['result'] for c in report['checks']} - {'INFO'}
    report['outcome'] = 'BLOCKED' if 'BLOCKED' in results else ('FAIL' if 'FAIL' in results else 'PASS')
    return report


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument('--url')
    g.add_argument('--local', action='store_true', help='serveer exact de .vercelignore-deployset lokaal')
    ap.add_argument('--widths', default='320,390,430')
    ap.add_argument('--report')
    ap.add_argument('--channel', help='bijv. chrome voor een systeembrowser')
    a = ap.parse_args()
    widths = [int(x) for x in a.widths.split(',')]
    launch = {'headless': True, **({'channel': a.channel} if a.channel else {})}
    secret = os.environ.get('VERCEL_AUTOMATION_BYPASS_SECRET', '')
    if a.local:
        with http.server.ThreadingHTTPServer(('127.0.0.1', 0), DeploySetHandler) as srv:
            threading.Thread(target=srv.serve_forever, daemon=True).start()
            report = run(f'http://127.0.0.1:{srv.server_address[1]}/', widths, '', launch)
            report['environment'] = 'lokaal: exacte .vercelignore-deployset (geen Vercel)'
            srv.shutdown()
    else:
        report = run(a.url if a.url.endswith('/') else a.url + '/', widths, secret, launch)
        report['environment'] = 'Vercel-preview' + ('' if secret else ' zonder bypass-secret')
    text = json.dumps(report, ensure_ascii=False, indent=1)
    print(text)
    if a.report:
        Path(a.report).write_text(text)
    sys.exit(0 if report['outcome'] == 'PASS' else (2 if report['outcome'] == 'BLOCKED' else 1))


if __name__ == '__main__':
    main()
