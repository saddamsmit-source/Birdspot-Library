"""Birdspot Home hotspot regression: GPS pins have a geographic preview plus readable offline fallback.

This Chromium test intentionally blocks external map/CDN requests. It checks Home never
returns the previous unlabelled SVG dot and always gives a useful place-card/map route.
It does NOT claim OpenStreetMap tiles or real-device GPS have been physically verified.
"""
import json
import threading
from playwright.sync_api import sync_playwright, expect
from test_cinematic_wetland import Server, Quiet, OUT

ROWS = [
    {"id":"home-hotspot-1","speciesId":"sp045","speciesName":"Merel","locationName":"Vijverpad",
     "lat":51.92440,"lon":4.47770,"placeId":"plaats-a","date":"2026-11-16","time":"10:25",
     "observationMethod":"seen","count":1,"photoIds":[],"certainty":"certain"},
    {"id":"home-hotspot-2","speciesId":"sp029","speciesName":"Koolmees","locationName":"Vijverpad",
     "lat":51.92443,"lon":4.47774,"placeId":"plaats-a","date":"2026-11-16","time":"10:26",
     "observationMethod":"heard","count":1,"photoIds":[],"certainty":"certain"},
    {"id":"home-hotspot-3","speciesId":"sp092","speciesName":"Kuifeend","locationName":"Overkant",
     "lat":51.92444,"lon":4.47771,"placeId":"plaats-b","date":"2026-11-16","time":"10:27",
     "observationMethod":"seen","count":1,"photoIds":[],"certainty":"certain"},
]
ONE = [ROWS[0]]

def ready(page):
    skip = page.locator('#birdspotSplashSkip')
    if skip.count() and skip.is_visible(): skip.click()
    page.locator('#birdspotSplash').wait_for(state="detached",timeout=25000)

def seed(page, data):
    page.evaluate("rows => localStorage.setItem('birdspot-sightings', JSON.stringify({schemaVersion:2,sightings:rows}))",data)
    page.reload(wait_until="domcontentloaded")
    ready(page)

def main():
    with Server(('127.0.0.1', 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url=f'http://127.0.0.1:{server.server_address[1]}/'
        with sync_playwright() as pw:
            browser=pw.chromium.launch()
            for width in (320,390):
                ctx=browser.new_context(viewport={"width":width,"height":844},reduced_motion="reduce",service_workers="block")
                ctx.route('**/*',lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
                page=ctx.new_page()
                errors=[]
                page.on('pageerror',lambda error: errors.append(str(error)))
                page.goto(url,wait_until="domcontentloaded")
                ready(page)
                seed(page,ONE)
                section=page.locator('#hotspotsSection')
                preview=section.locator('#homeHotspotMap')
                expect(preview).to_be_visible()
                expect(section.locator('.hotspot-place')).to_have_count(1)
                expect(section.locator('.hotspot-meta')).to_contain_text('1 locatie')
                expect(section.locator('.hotspot-meta')).to_contain_text('1 waarneming')
                expect(section.locator('.hotspot-place')).to_contain_text('Vijverpad')
                expect(section.locator('.hotspot-place')).to_contain_text('Merel')
                assert preview.evaluate("node => node.tagName") == 'DIV'
                assert section.locator('svg.hotspot-map').count() == 0, 'Old unlabeled SVG-dot map still visible'
                preview.scroll_into_view_if_needed()
                expect(section.locator('#hotspotMapStatus')).to_contain_text('je opgeslagen locaties staan hieronder',timeout=16000)
                assert section.evaluate('el => el.scrollWidth <= el.clientWidth+2')
                assert json.loads(page.evaluate("localStorage.getItem('birdspot-sightings')"))['sightings']==ONE
                if width == 390: section.screenshot(path=str(OUT / 'home_hotspots_offline_390.png'))
                section.locator('.hotspot-place').first.click()
                expect(page.locator('#screen-map')).to_be_visible()
                page.locator('.nav-item[data-route="home"]').click()
                expect(page.locator('#hotspotsSection .hotspot-place')).to_have_count(1)
                assert not errors,errors
                ctx.close()

            ctx=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce",service_workers="block")
            ctx.route('**/*',lambda route: route.continue_() if route.request.url.startswith(url) else route.abort())
            page=ctx.new_page()
            page.goto(url,wait_until="domcontentloaded")
            ready(page)
            seed(page,ROWS)
            section=page.locator('#hotspotsSection')
            expect(section.locator('.hotspot-place')).to_have_count(2)
            expect(section.locator('.hotspot-meta')).to_contain_text('2 locaties')
            expect(section.locator('.hotspot-meta')).to_contain_text('3 waarnemingen')
            expect(section.locator('.hotspot-place').first).to_contain_text('2')
            expect(section.locator('.hotspot-place').nth(1)).to_contain_text('Overkant')
            assert section.evaluate('el => el.scrollWidth <= el.clientWidth+2')
            ctx.close()
            browser.close()
        server.shutdown()
    print('HOTSPOT-BROWSER PASS: 320/390 px, 1 and 2 distinct locations, offline place list, route and persistence',flush=True)

if __name__=='__main__':
    main()
