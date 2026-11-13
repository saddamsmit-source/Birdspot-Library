#!/usr/bin/env python3
"""Birdspot S1 R10: visual sex/age plumage comparison, 360/390/430/1280.

Real local Chromium + existing species data; no new bird photos, no stubs,
no public deployment, no user data. Physical Android is NOT TESTED.
"""
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot

SHOTS = ROOT / "tests/screenshots/plumage_compare"


def open_species(p, name, sid):
    p.locator('.nav-item[data-route="species"]').click()
    if p.locator("#speciesFiltersToggle").count():
        p.locator("#speciesFiltersToggle").click()
    p.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
    p.locator("#speciesSearch").fill(name)
    p.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    p.locator(".sd-tabs").wait_for(timeout=12000)


def run_one(browser, base, width, errors):
    context = browser.new_context(
        viewport={"width": width, "height": 844},
        reduced_motion="reduce",
        service_workers="block",
    )
    try:
        p = context.new_page()
        p.on("pageerror", lambda error: errors.append(f"{width}px: {error}"))
        boot(p, base)
        open_species(p, "Zwarte Specht", "sp018")
        grid = p.locator('#sdPanel-herkenning .sd-plumage-list[data-layout="compare"]')
        expect(grid).to_have_count(1)
        expect(grid.locator('[data-plumage="adult_m"]')).to_have_count(1)
        expect(grid.locator('[data-plumage="adult_f"]')).to_have_count(1)
        expect(grid.locator('[data-plumage="juv"]')).to_have_count(1)
        assert p.locator('#sdPanel-herkenning section.sd-flight').count() == 1
        # Images must genuinely decode; an img src or an image count is not sufficient.
        decoded = grid.evaluate("""async el => {
          const pictures = [...el.querySelectorAll('.sd-field-photo img')];
          for (const img of pictures) {
            img.loading = 'eager';
            try { await img.decode(); } catch (e) {}
          }
          return pictures.map(img => ({
            src: img.getAttribute('src'),
            ok: img.complete && img.naturalWidth > 0
          }));
        }""")
        assert len(decoded) >= 3 and all(item["ok"] for item in decoded), decoded
        layout = grid.evaluate("""el => {
          const male = el.querySelector('[data-plumage="adult_m"]').getBoundingClientRect();
          const female = el.querySelector('[data-plumage="adult_f"]').getBoundingClientRect();
          const styles = getComputedStyle(el);
          const photos = [...el.querySelectorAll('[data-guide-image]')];
          return {
            cols: styles.gridTemplateColumns.split(' ').filter(Boolean).length,
            male: {x: male.x, y: male.y, right: male.right, width: male.width},
            female: {x: female.x, y: female.y, right: female.right, width: female.width},
            scrollWidth: el.scrollWidth, clientWidth: el.clientWidth,
            exactImageCount: photos.length,
            uniqueImageCount: new Set(photos.map(p => p.dataset.guideImage)).size,
          };
        }""")
        assert layout["cols"] == 2, layout
        assert abs(layout["female"]["y"] - layout["male"]["y"]) < 5, layout
        assert layout["female"]["x"] > layout["male"]["x"], layout
        if layout["scrollWidth"] > layout["clientWidth"] + 2:
            offenders = grid.evaluate("""el => {
              const boundary = el.getBoundingClientRect().right;
              return [...el.querySelectorAll('*')].map(n => {
                const b = n.getBoundingClientRect();
                return {tag:n.tagName, className: String(n.className?.baseVal || n.className || '').slice(0, 90),
                        right: Math.round(b.right), width:Math.round(b.width)};
              }).filter(n => n.right > boundary + 2).slice(0, 14);
            }""")
            raise AssertionError(f"Grid overflow: {layout}; offending elements: {offenders}")
        assert layout["exactImageCount"] == layout["uniqueImageCount"], layout
        assert not p.evaluate("document.documentElement.scrollWidth > innerWidth + 2"), (
            f"{width}px horizontal page overflow"
        )
        # Real zoom UI and Escape must remain functional after visual CSS changes.
        photo_button = grid.locator(".sd-field-photo").first
        expect(photo_button).to_be_visible()
        photo_button.click()
        viewer = p.get_by_role("dialog", name="Vogelfoto bekijken")
        expect(viewer).to_have_count(1)
        p.keyboard.press("Escape")
        expect(viewer).to_have_count(0)
        expect(grid).to_be_visible()
        if width == 390:
            SHOTS.mkdir(parents=True, exist_ok=True)
            grid.screenshot(path=str(SHOTS / "sp018_plumage_comparison_390.png"))
            p.locator(".signature-species-detail-close").click()
            p.locator(".signature-species-detail-overlay").wait_for(state="detached")
            open_species(p, "Kleine Bonte Specht", "sp017")
            # One actual role image plus hero reference must NOT claim a two-photo comparison.
            assert p.locator('#sdPanel-herkenning .sd-plumage-list[data-layout="compare"]').count() == 0
            expect(p.locator('#sdPanel-herkenning [data-plumage="adult_f"] .sd-field-photo')).to_have_count(1)
            assert p.locator('#sdPanel-herkenning section.sd-flight').count() == 0
            print("R10 NEGATIVE PASS — sp017 does not fabricate male/flight/juvenile compare")
        print(f"R10 {width}px PASS — 2-up male/female; {len(decoded)} decoded photos, zoom and no overflow")
    finally:
        context.close()


def main():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            try:
                for width in (360, 390, 430, 1280):
                    run_one(browser, url, width, errors)
                assert not errors, errors
                print("R10 PASS — 4 viewports, real guide images, roles, zoom, negative role gating")
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    main()
