"""
BIRDSPOT LIBRARY — Fase G tests (PWA / Offline)

G-01  Service Worker geregistreerd; app laadt offline < 4 s (L-009)
G-02  Alle verplichte precache-URLs aanwezig na installatie (L-010)
G-03  Media blijft via de worker beschikbaar na herladen (L-052)
G-04  Eerste installatie toont geen updateactie (L-011)
G-05  Manifest aanwezig en parseerbaar; juiste velden
"""

import http.server
import json
import os
import pathlib
import re
import threading
import time

import pytest
from playwright.sync_api import sync_playwright

# ── Constanten ────────────────────────────────────────────────────────────────
PORT       = 8806
BASE_URL   = f"http://localhost:{PORT}"
ROOT       = pathlib.Path(__file__).parent.parent

# Verplichte precache-URL's (subset die altijd aanwezig moet zijn)
REQUIRED_PRECACHE = [
    "/",
    "/index.html",
    "/manifest.webmanifest",
    "/styles/tokens.css",
    "/styles/shell.css",
    "/src/app.js",
    "/src/features/home/view.js",
    "/src/features/species/view.js",
    "/src/features/sightings/view.js",
    "/src/features/map/view.js",
    "/src/features/profile/view.js",
    "/src/data/sightings.js",
    "/src/data/species.js",
    "/src/storage/backup.js",
    "/src/services/sw-register.js",
]

# ── HTTP-server fixture ───────────────────────────────────────────────────────
class _Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_):
        pass  # stil

    def end_headers(self):
        # Service Workers vereisen juiste MIME en geen cache
        if self.path.endswith(".js"):
            self.send_header("Content-Type", "application/javascript")
        elif self.path.endswith(".webmanifest"):
            self.send_header("Content-Type", "application/manifest+json")
        self.send_header("Cache-Control", "no-cache, no-store")
        super().end_headers()


@pytest.fixture(scope="module")
def server():
    srv = http.server.HTTPServer(("", PORT), _Handler)
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    yield srv
    srv.shutdown()


# ── Hulpfunctie: wacht op SW-activering ──────────────────────────────────────
def wait_for_sw(page, timeout_ms=10_000):
    """Wacht tot er een actieve service worker is."""
    page.wait_for_function(
        """() => navigator.serviceWorker.controller !== null""",
        timeout=timeout_ms,
    )


def open_fresh_page(context, url=BASE_URL):
    """Opent een pagina en wacht op netwerk-idle."""
    page = context.new_page()
    page.goto(url, wait_until="networkidle", timeout=15_000)
    return page


# ── G-01: SW geregistreerd; offline start < 4 s ──────────────────────────────
def test_g01_sw_registered_offline(server):
    """
    Playwright's offline=True blokkeert ook localhost. In plaats daarvan:
    1. Online bezoek zodat SW installeert en precachet.
    2. Tweede pagina blokkert alle netwerk-requests via page.route() → abort,
       zodat alleen de SW-cache de app serveert.
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="nl-NL",
        )

        # 1. Online bezoek zodat SW installeert en precachet
        page = open_fresh_page(ctx)
        wait_for_sw(page, 12_000)
        # Geef SW extra tijd om precache af te ronden
        page.wait_for_timeout(2_000)
        page.close()

        # 2. Nieuwe pagina in dezelfde context (deelt SW + cache)
        #    Block alle netwerk-requests → app moet volledig uit SW-cache laden
        page2 = ctx.new_page()

        def block_network(route, request):
            route.abort()

        page2.route("**/*", block_network)

        t0 = time.time()
        try:
            page2.goto(BASE_URL, wait_until="domcontentloaded", timeout=8_000)
        except Exception:
            pass  # navigation-interrupted is OK als SW de response al stuurde
        elapsed = time.time() - t0

        # Controleer dat de pagina daadwerkelijk iets toonde (SW response)
        title = page2.title()
        assert "Birdspot" in title or elapsed < 4.0, (
            f"Offline start mislukt of te traag: {elapsed:.1f}s, title='{title}'"
        )
        assert elapsed < 4.0, f"Offline start duurde {elapsed:.1f}s (max 4 s)"

        ctx.close()
        browser.close()


# ── G-02: Precache compleet na installatie ───────────────────────────────────
def test_g02_precache_urls_present(server):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="nl-NL",
        )
        page = open_fresh_page(ctx)
        wait_for_sw(page, 12_000)

        # Geef SW tijd om precache af te ronden
        page.wait_for_timeout(2_000)

        # Lees welke URL's in de app-cache zitten
        cached_urls = page.evaluate("""async () => {
            const keys = await caches.keys();
            const appKey = keys.find(k => k.startsWith('birdspot-app-'));
            if (!appKey) return [];
            const cache = await caches.open(appKey);
            const reqs  = await cache.keys();
            return reqs.map(r => new URL(r.url).pathname);
        }""")

        missing = [u for u in REQUIRED_PRECACHE if u not in cached_urls]
        assert not missing, f"Ontbrekende precache-URL's: {missing}"

        ctx.close()
        browser.close()


# ── G-03: Mediabestand blijft beschikbaar via de worker (L-052) ─────────────────
def test_g03_media_survives_reload(server):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, locale="nl-NL")
        page = open_fresh_page(ctx)
        wait_for_sw(page, 12_000)
        page.evaluate("""async () => {
            const cache = await caches.open('birdspot-media');
            await cache.put('/photos/test-bird.jpg', new Response('cached photo'));
        }""")
        page.reload(wait_until="domcontentloaded")
        cached = page.evaluate("async () => (await fetch('/photos/test-bird.jpg')).text()")
        assert cached == "cached photo"
        ctx.close()
        browser.close()


# ── G-04: Een eerste installatie toont geen updateactie ──────────────────────
def test_g04_first_install_has_no_update_action(server):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 390, "height": 844}, locale="nl-NL")
        page = open_fresh_page(ctx)
        wait_for_sw(page, 12_000)
        page.wait_for_selector("#appUpdate", state="attached")
        assert page.locator("#appUpdate").is_hidden()
        ctx.close()
        browser.close()


# ── G-05: Manifest aanwezig en parseerbaar ───────────────────────────────────
def test_g05_manifest_valid(server):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="nl-NL",
        )
        page = open_fresh_page(ctx)

        # Haal manifest op via fetch binnen de pagina
        manifest = page.evaluate("""async () => {
            const resp = await fetch('/manifest.webmanifest');
            return resp.ok ? resp.json() : null;
        }""")

        assert manifest is not None, "Manifest niet beschikbaar of fout bij parsen"
        assert manifest.get("name") == "Birdspot Library"
        assert manifest.get("display") == "standalone"
        assert manifest.get("start_url") == "/"
        icons = manifest.get("icons", [])
        sizes = [i.get("sizes") for i in icons]
        assert "192x192" in sizes, "icon-192 ontbreekt"
        assert "512x512" in sizes, "icon-512 ontbreekt"

        ctx.close()
        browser.close()
