"""Birdspot one-time kingfisher welcome QA.

Checks that the exact locally committed kingfisher image loads, the home route
initializes behind it, automatic dismissal happens after approximately 5 s,
and Skip dismisses early without deleting or changing observation data.
"""
from __future__ import annotations
import hashlib
import http.server
import socketserver
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
IMAGE=ROOT/"assets"/"birdspot-ijsvogel-splash.avif"
SHOTS=ROOT/"tests"/"screenshots"
SHOTS.mkdir(parents=True,exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):
        pass

class Server(socketserver.TCPServer):
    allow_reuse_address=True

def main():
    assert IMAGE.exists(), "The original image asset must be committed into GitHub."
    original=IMAGE.read_bytes()
    assert len(original)==21449, f"Unexpected optimized image size: {len(original)}"
    assert hashlib.sha256(original).hexdigest()=="78a7930e4f4101e03461f9429426555294327b207281a8673374032712ad335a"
    assert b"ftypavif" in original[:80]
    # Offline PWA must store the real binary asset and startup controller.
    # sw.js builds every precache URL as SCOPE_PATH + <scope-relative path>
    # (see atScope()/PRECACHE_PATHS), so the entries are stored WITHOUT a
    # leading slash — a hosting subpath such as GitHub Pages' own
    # "/Birdspot-Library/" prepends to that relative path at runtime. A
    # literal "/assets/..." check here would test the pre-subpath-fix
    # format, not what the file actually precaches now.
    sw=(ROOT/"sw.js").read_text(encoding="utf-8")
    assert "'assets/birdspot-ijsvogel-splash.avif'" in sw
    assert "'src/services/startup-splash.js'" in sw
    assert "'styles/startup-splash.css'" in sw

    with Server(("127.0.0.1",0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch(headless=True)
            context=browser.new_context(viewport={"width":390,"height":844},
                                       reduced_motion="reduce",service_workers="block")
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda e:errors.append(str(e)))
            start=f"http://127.0.0.1:{server.server_address[1]}/"
            page.goto(start,wait_until="domcontentloaded")
            page.locator("#birdspotSplash").wait_for(state="visible",timeout=5000)
            page.locator("#screen-home").wait_for(timeout=7500)
            page.wait_for_function("""() => {
                const img=document.querySelector('#birdspotSplash img');
                return img && img.complete && img.naturalWidth>=600 && img.naturalHeight>=1000;
            }""",timeout=6000)
            assert page.locator("#birdspotSplash").is_visible()
            assert page.locator("#birdspotSplashSkip").is_visible()
            assert page.locator("#birdspotSplash").get_attribute("aria-modal")=="true"
            page.screenshot(path=str(SHOTS/"birdspot_startup_splash_390.png"),animations="disabled")
            # The splash must not disappear after only one or two seconds.
            page.wait_for_timeout(2300)
            assert page.locator("#birdspotSplash").is_visible()
            page.locator("#birdspotSplash").wait_for(state="detached",timeout=6000)
            assert page.locator("#screen-home").is_visible()
            assert not errors, errors

            # Returning users see Home immediately and keep their saved sightings.
            page.evaluate("""() => localStorage.setItem('birdspot-sightings',JSON.stringify({
                schemaVersion:2,
                sightings:[{id:'splash-test',speciesName:'Koolmees',
                 speciesId:'sp001',date:'2026-11-04',locationName:'Testbos',photoIds:[]}]
            }))""")
            page.reload(wait_until="domcontentloaded")
            page.locator("#screen-home").wait_for(timeout=7000)
            assert page.locator("#birdspotSplash").count()==0
            assert page.evaluate("""() => JSON.parse(
                localStorage.getItem('birdspot-sightings')).sightings[0].id
            """)=="splash-test"
            page.evaluate("localStorage.removeItem('birdspot-welcome-seen')")
            page.reload(wait_until="domcontentloaded")
            page.locator("#birdspotSplashSkip").click()
            page.locator("#birdspotSplash").wait_for(state="detached",timeout=2400)
            assert page.evaluate("localStorage.getItem('birdspot-welcome-seen')")=="1"
            page.locator(".nav-item[data-route='map']").click()
            assert page.locator("#mapScreen").count()==1
            assert page.locator("#birdspotSplash").count()==0
            assert not errors, errors
            print("PASS: exact image, app-ready, five-second welcome, fast return, skip and data preservation")
            context.close()
            browser.close()
        server.shutdown()

class SubpathHandler(http.server.SimpleHTTPRequestHandler):
    """Serves the repo only under a project subpath (as GitHub Pages does:
    https://<user>.github.io/Birdspot-Library/), so that anything which
    secretly still resolves against the domain root (a stray absolute
    "/assets/..." reference) 404s here even though it would work when
    served from "/". Proves the splash precache is genuinely subpath-safe
    instead of only ever having been tested from the root (L-065-style
    gap: upload/commit success is not proof; the actual resolved path is).
    """
    PREFIX="/Birdspot-Library"
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def log_message(self,*args):
        pass
    def translate_path(self,path):
        clean=path.split("?",1)[0].split("#",1)[0]
        if clean==self.PREFIX:
            clean=self.PREFIX+"/"
        if not clean.startswith(self.PREFIX+"/"):
            return str(ROOT/"__outside_simulated_subpath__")
        return super().translate_path(clean[len(self.PREFIX):])

def subpath_offline_check():
    """Herbevestigt vanaf een echte subpad-serving (niet de domeinroot)
    dat de startsplash-foto, -CSS en -JS daadwerkelijk gecachet worden en
    offline laden. Faalt zonder de SCOPE_PATH/atScope-fix in sw.js, dus
    bewaakt de echte eis (werkt ook op een subpad), niet alleen de
    letterlijke precache-string."""
    with Server(("127.0.0.1",0),SubpathHandler) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        base=f"http://127.0.0.1:{server.server_address[1]}{SubpathHandler.PREFIX}/"
        with sync_playwright() as playwright:
            browser=playwright.chromium.launch(headless=True)
            context=browser.new_context(viewport={"width":390,"height":844},
                                       reduced_motion="reduce")
            # 1) Online bezoek op het subpad zodat de SW installeert en
            #    zijn eigen precache (incl. de splashfoto) afrondt.
            page=context.new_page()
            page.goto(base,wait_until="domcontentloaded")
            page.wait_for_function(
                "() => navigator.serviceWorker.controller !== null",timeout=12000)
            page.wait_for_timeout(2000)

            cached_paths=page.evaluate("""async () => {
                const keys = await caches.keys();
                const appKey = keys.find(k => k.startsWith('birdspot-app-'));
                if (!appKey) return [];
                const cache = await caches.open(appKey);
                const reqs = await cache.keys();
                return reqs.map(r => new URL(r.url).pathname);
            }""")
            prefix=SubpathHandler.PREFIX
            required=[prefix+"/assets/birdspot-ijsvogel-splash.avif",
                      prefix+"/src/services/startup-splash.js",
                      prefix+"/styles/startup-splash.css"]
            missing=[p for p in required if p not in cached_paths]
            assert not missing, (
                f"Niet gecachet onder subpad {prefix}: {missing}; "
                f"wel gecacht: {sorted(p for p in cached_paths if 'splash' in p)}")
            # Dit eerste bezoek heeft de welkomstsplash al gezien en
            # gesloten; wis die voorkeur zodat de offline herlaadtest
            # hieronder de splash (en dus de gecachete foto) opnieuw toont,
            # net als een eerste gebruiker zonder netwerk zou meemaken.
            page.evaluate("localStorage.removeItem('birdspot-welcome-seen')")
            page.close()

            # 2) Nieuwe pagina in dezelfde context (deelt SW + caches),
            #    met elk netwerkverzoek geblokkeerd: Playwright's eigen
            #    offline=True blokkeert ook localhost (zie test_phase_g.py),
            #    dus route().abort() is hier de juiste manier om een echte
            #    offline-start te simuleren.
            offline_errors=[]
            page2=context.new_page()
            page2.on("pageerror",lambda e:offline_errors.append(str(e)))
            page2.route("**/*",lambda route,request:route.abort())
            try:
                page2.goto(base,wait_until="domcontentloaded",timeout=8000)
            except Exception:
                pass  # een afgebroken navigatie is oké zodra de SW zelf al antwoordde
            page2.locator("#birdspotSplash").wait_for(state="visible",timeout=5000)
            page2.wait_for_function("""() => {
                const img=document.querySelector('#birdspotSplash img');
                return img && img.complete && img.naturalWidth>=600 && img.naturalHeight>=1000;
            }""",timeout=6000)
            assert not offline_errors, offline_errors
            context.close()
            browser.close()
        server.shutdown()
    print(f"PASS: splashfoto/CSS/JS gecachet en laden offline vanaf subpad {SubpathHandler.PREFIX}/")

if __name__=="__main__":
    main()
    subpath_offline_check()
