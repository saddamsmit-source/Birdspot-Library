"""
Birdspot Library — B: profiel en back-up
  B-01  bij openen van Profiel staat er geen dialoog open (lege 'Back-up herstellen'-dialoog bleef zichtbaar)
  B-02  overzicht: waarnemingen, soorten, plekken en foto's kloppen met de opgeslagen waarnemingen
  B-03  nog geen back-up + waarnemingen → herinnering; na 'Bewaren' status 'Laatste back-up' en geen herinnering
  B-04  nieuwe waarneming na de back-up → '1 nieuwe waarneming sinds de laatste back-up'
  B-05  versie komt uit sw.js (APP_VERSION); zonder service worker 'Versie onbekend'
  B-06  geen paginafouten; screenshot 390 px

Starten (vanuit repo-root):  python tests/test_profile_backup.py
"""
import http.server
import re
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
APP_VERSION = re.search(r"const APP_VERSION = '([^']+)'", (ROOT / "sw.js").read_text(encoding="utf-8")).group(1)
SIGHTINGS = [
    {"id": "p1", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-04-12", "locationName": "Oostvaardersplassen", "photoIds": ["f1", "f2"]},
    {"id": "p2", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-05-02", "locationName": "Oostvaardersplassen", "photoIds": []},
    {"id": "p3", "speciesId": "sp045", "speciesName": "Merel", "date": "2026-05-03", "locationName": "Lauwersmeer", "photoIds": ["f3"]},
]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def boot(ctx, url, rows=None):
    p = ctx.new_page()
    errors = []
    p.on("pageerror", lambda e: errors.append(str(e)))
    p.goto(url, wait_until="domcontentloaded")
    p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
    if rows is not None:
        p.evaluate("(rows) => { localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,"
                   "sightings: rows.map(r => ({count:1, ...r}))})); localStorage.removeItem('birdspot-backup-status'); }", rows)
    return p, errors


def open_profile(p):
    p.locator('.nav-item[data-route="profile"]').click()
    p.locator("#backupStatus").wait_for(timeout=8000)
    p.wait_for_timeout(300)


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce",
                                      service_workers="block", accept_downloads=True)
            p, errors = boot(ctx, url, SIGHTINGS)
            open_profile(p)

            assert p.locator("#confirmOverlay").is_hidden(), "B-01 dialoog staat open bij openen"
            top = p.evaluate("() => document.elementFromPoint(195, 420)?.closest('#confirmOverlay') ? 'overlay' : 'page'")
            assert top == "page", "B-01 overlay ligt over de pagina"
            print("B-01 OK — geen dialoog bij openen")

            stats = p.eval_on_selector_all(".profile-stat", "els => els.map(e => e.innerText.replace(/\\s+/g,' ').trim())")
            assert stats == ["3 waarnemingen", "2 soorten", "2 plekken", "3 foto's"], stats
            print("B-02 OK — overzicht:", stats)

            warn = p.locator("#backupStatus .backup-status__warn")
            assert warn.count() == 1 and "3 waarnemingen" in warn.inner_text(), "B-03 herinnering zonder back-up"
            p.screenshot(path=str(SHOTS / "profile_b_390.png"), full_page=True)
            with p.expect_download(timeout=15000) as dl:
                p.locator("#btnExport").click()
            assert dl.value.suggested_filename.endswith(".zip"), dl.value.suggested_filename
            p.locator("#backupStatus .backup-status__label").wait_for(timeout=8000)
            assert p.locator("#backupStatus .backup-status__warn").count() == 0
            print("B-03 OK — herinnering, back-up gemaakt:", dl.value.suggested_filename)

            p.evaluate("() => { const d = JSON.parse(localStorage.getItem('birdspot-sightings'));"
                       " d.sightings.push({id:'p4', speciesId:'sp045', speciesName:'Merel', date:'2026-06-01', count:1, photoIds:[]});"
                       " localStorage.setItem('birdspot-sightings', JSON.stringify(d)); }")
            p.locator('.nav-item[data-route="home"]').click()
            open_profile(p)
            assert "1 nieuwe waarneming sinds" in p.locator("#backupStatus").inner_text()
            print("B-04 OK — nieuwe waarneming na back-up gemeld")

            p.wait_for_function("() => !document.querySelector('#appVersion').textContent.includes('ophalen')")
            assert p.locator("#appVersion").inner_text().startswith("Versie onbekend")
            assert not errors, f"B-06 paginafouten: {errors}"
            ctx.close()

            ctx2 = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
            p2, errors2 = boot(ctx2, url, [])
            p2.wait_for_function("navigator.serviceWorker.controller !== null")
            open_profile(p2)
            p2.wait_for_function("() => !document.querySelector('#appVersion').textContent.includes('ophalen')")
            txt = p2.locator("#appVersion").inner_text()
            assert txt == f"Versie {APP_VERSION} · basis offline beschikbaar", txt
            assert p2.locator(".profile-stat").count() == 0 and p2.locator(".profile-empty").count() == 1
            assert "Nog geen back-up nodig" in p2.locator("#backupStatus").inner_text()
            print("B-05 OK —", txt)
            assert not errors2, f"B-06 paginafouten: {errors2}"
            print("B-06 OK — geen paginafouten")
            browser.close()
    print("Fase B: alle controles geslaagd")


if __name__ == "__main__":
    main()
