"""Browsercontrole voor terugnavigatie, handmatige pin, offlinebasis en updates."""
import http.server
import re
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parent.parent
WORKER = (ROOT / "sw.js").read_text(encoding="utf-8")
VERSION = re.search(r"const APP_VERSION = '([^']+)'", WORKER).group(1)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *_):
        pass

    def copyfile(self, source, output):
        try:
            super().copyfile(source, output)
        except ConnectionError:
            pass  # Chromium annuleert nog lopende precacheverzoeken bij de opzettelijke 404.

    def do_GET(self):
        if self.path.startswith("/assets/showcase/") and self.path.endswith(".webp"):
            self.server.showcase_requests.append(self.path)
        if self.path == "/sw.js":
            body = WORKER.replace(VERSION, self.server.version).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/javascript")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == self.server.missing:
            self.send_error(404)
        else:
            super().do_GET()


def nav(page, name):
    page.locator(f'.nav-item[data-route="{name}"]').click()


def open_page(context, url):
    page = context.new_page()
    page.goto(url, wait_until="domcontentloaded")
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
    return page


def block_external(context):
    context.route("**/*", lambda route: route.continue_()
                  if route.request.url.startswith("http://127.0.0.1:") else route.abort())


def test_navigation_and_location(browser, url):
    context = browser.new_context(viewport={"width": 390, "height": 844},
                                  reduced_motion="reduce", service_workers="block")
    block_external(context)
    context.add_init_script("""
      navigator.geolocation.getCurrentPosition = success => { window.deliverGPS = success; };
    """)
    page = open_page(context, url)
    nav(page, "species")
    page.locator('[data-cat="alle"]').click()
    page.locator("#speciesSearch").fill("e")
    expect(page.locator(".species-row").first).to_be_visible()
    page.locator("#main-view").evaluate("el => el.scrollTop = 810")
    old_scroll = page.locator("#main-view").evaluate("el => el.scrollTop")
    assert old_scroll > 500
    nav(page, "map")
    expect(page.locator(".map-offline-notice")).to_be_visible()
    page.locator("#mapSpeciesSearch").fill("Merel")

    page.locator("#fab").click()
    expect(page.locator("#addSightingSheet")).to_have_class(re.compile(r"\bopen\b"))
    page.locator("#sightLocation").fill("Mijn eigen plek")
    page.locator("#sightPinBtn").click()
    expect(page.locator("#pinLat")).to_be_visible()
    page.evaluate("history.back()")
    expect(page.locator(".manual-pin-dialog")).to_have_count(0)
    expect(page.locator("#sightLocation")).to_have_value("Mijn eigen plek")
    page.wait_for_function("history.state?.route === 'map'")

    page.locator("#sightGpsBtn").click()
    page.locator("#sightPinBtn").click()
    expect(page.locator("#pinMapStatus")).to_contain_text("niet beschikbaar")
    page.locator("#pinLat").fill("51.59")
    page.locator("#pinLon").fill("5.09")
    page.locator("#pinConfirm").click()
    expect(page.locator("#coordsHint")).to_contain_text("51.59000, 5.09000")
    page.evaluate("deliverGPS({ coords: { latitude: 52.8, longitude: 4.7, accuracy: 9 } })")
    expect(page.locator("#coordsHint")).to_contain_text("51.59000, 5.09000")
    expect(page.locator("#sightLocation")).to_have_value("Mijn eigen plek")

    page.evaluate("history.back()")
    expect(page.locator("#addSightingSheet")).to_have_count(0)
    page.wait_for_function("history.state?.route === 'map'")
    page.evaluate("history.back()")
    expect(page.locator("#speciesSearch")).to_have_value("e")
    expect(page.locator('[data-cat="alle"]')).to_have_attribute("aria-selected", "true")
    page.wait_for_function("top => Math.abs(document.querySelector('#main-view').scrollTop - top) < 2",
                           arg=old_scroll)
    page.evaluate("history.forward()")
    expect(page.locator("#mapSpeciesSearch")).to_have_value("Merel")

    # Bereik dezelfde handmatige invoer vanaf de kaart zelf.
    expect(page.locator(".map-offline-notice")).to_be_visible()
    page.locator("#mapAddPinBtn").click()
    expect(page.locator("#pinLat")).to_be_visible()
    page.locator("#pinLat").fill("52.1")
    page.locator("#pinLon").fill("5.1")
    page.locator("#pinConfirm").click()
    expect(page.locator("#coordsHint")).to_contain_text("52.10000, 5.10000")
    context.close()
    print("OK — bovenste dialoog, terug/vooruit, selectie, scroll, offline pin, late GPS")


def test_cache_and_update(browser, url, server):
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    block_external(context)
    page = open_page(context, url)
    page.wait_for_function("navigator.serviceWorker.controller !== null")
    nav(page, "profile")
    expect(page.locator("#appVersion")).to_have_text(f"Versie {VERSION} · basis offline beschikbaar")
    expect(page.locator("#appUpdate")).to_be_hidden()

    # Een missend codebestand mag geen groene status krijgen.
    deleted = page.evaluate("""async version => {
      const cache = await caches.open('birdspot-app-v' + version);
      return cache.delete('/src/data/db.js');
    }""", VERSION)
    assert deleted
    nav(page, "home")
    nav(page, "profile")
    expect(page.locator("#appVersion")).to_have_text(f"Versie {VERSION} · offlinebasis onvolledig")

    other = open_page(context, url)
    other.wait_for_function("navigator.serviceWorker.controller !== null")
    other.locator("#fab").click()
    other.locator("#sightLocation").fill("Andere tab")
    page.locator("#fab").click()
    page.locator("#sightLocation").fill("Nog niet opgeslagen")

    server.version = VERSION + "-broken"
    server.missing = "/src/data/db.js"
    page.evaluate("""async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      const discarded = new Promise(resolve => reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'redundant') resolve(true);
          if (worker.state === 'installed') resolve(false);
        });
      }, { once: true }));
      await reg.update();
      const timedOut = new Promise(resolve => setTimeout(() => resolve(false), 15000));
      if (!await Promise.race([discarded, timedOut])) {
        throw new Error('Incomplete worker did not fail installation');
      }
    }""")
    expect(page.locator("#appUpdate")).to_be_hidden()
    assert page.evaluate("navigator.serviceWorker.controller.state") == "activated"

    server.missing = None
    page.evaluate("""async () => {
      const cache = await caches.open('birdspot-media');
      await cache.put('/photos/test-bird.jpg', new Response('cached photo'));
    }""")
    server.showcase_requests.clear()
    server.version = VERSION + "-update"
    page.evaluate("async () => (await navigator.serviceWorker.getRegistration()).update()")
    expect(page.locator("#appUpdate")).to_be_visible(timeout=15000)
    # Tijdens de modal ligt de actie buiten bereik. Ook een directe klik wordt afgewezen.
    page.locator("#appUpdate").evaluate("button => button.click()")
    expect(page.locator("#appUpdate")).to_contain_text("Rond je invoer af")
    expect(page.locator("#sightLocation")).to_have_value("Nog niet opgeslagen")
    page.locator("#addSheetCancel").click()
    expect(page.locator("#addSightingSheet")).to_have_count(0)

    with page.expect_event("domcontentloaded"):
        page.locator("#appUpdate").click()
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
    expect(page.locator("#appVersion")).to_have_text(f"Versie {server.version} · basis offline beschikbaar")
    expect(other.locator("#sightLocation")).to_have_value("Andere tab")
    expect(other.locator("#appUpdate")).to_be_visible()
    assert not server.showcase_requests, server.showcase_requests
    cached = page.evaluate("async () => (await fetch('/photos/test-bird.jpg')).text()")
    assert cached == "cached photo"

    context.set_offline(True)
    page.reload(wait_until="domcontentloaded")
    page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
    nav(page, "home")
    expect(page.locator("#screen-home")).to_be_visible()
    page.locator("#fab").click()
    page.locator("#sightPinBtn").click()
    expect(page.locator("#pinLat")).to_be_visible()
    context.close()
    print("OK — volledige/incomplete cache, mislukte installatie, wachtende update, mediacache, andere tab, offline herlaad")


def main():
    with http.server.ThreadingHTTPServer(("127.0.0.1", 0), Handler) as server:
        server.version, server.missing = VERSION, None
        server.showcase_requests = []
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_port}/"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            test_navigation_and_location(browser, url)
            test_cache_and_update(browser, url, server)
            browser.close()


if __name__ == "__main__":
    main()
