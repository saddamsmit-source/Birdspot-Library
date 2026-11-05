"""Birdspot premium 5-second splash screen QA.

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
    sw=(ROOT/"sw.js").read_text(encoding="utf-8")
    assert "/assets/birdspot-ijsvogel-splash.avif" in sw
    assert "/src/services/startup-splash.js" in sw
    assert "/styles/startup-splash.css" in sw

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

            # Next page load: skip on tap, without corrupting saved sightings.
            page.evaluate("""() => localStorage.setItem('birdspot-sightings',JSON.stringify({
                schemaVersion:2,
                sightings:[{id:'splash-test',speciesName:'Koolmees',
                 speciesId:'sp001',date:'2026-11-04',locationName:'Testbos',photoIds:[]}]
            }))""")
            page.reload(wait_until="domcontentloaded")
            page.locator("#birdspotSplash").wait_for(state="visible",timeout=5000)
            page.locator("#screen-home").wait_for(timeout=7000)
            page.locator("#birdspotSplashSkip").click()
            page.locator("#birdspotSplash").wait_for(state="detached",timeout=2400)
            assert page.evaluate("""() => JSON.parse(
                localStorage.getItem('birdspot-sightings')).sightings[0].id
            """)=="splash-test"
            page.locator(".nav-item[data-route='map']").click()
            assert page.locator("#mapScreen").count()==1
            assert page.locator("#birdspotSplash").count()==0
            assert not errors, errors
            print("PASS: exact image, app-ready, five-second display, skip, no data loss")
            context.close()
            browser.close()
        server.shutdown()

if __name__=="__main__":
    main()
