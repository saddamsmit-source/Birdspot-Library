#!/usr/bin/env python3
"""M12 read-only independent 3-species plover photo-role and image-quality QA.

Tests the actual current WebP binaries and the real Browser DOM. It does NOT
independently establish the original photographer's license or ornithological
age/sex determination; all source-page verification requires separate evidence.
No source or guide assets are modified by this test.
"""
import hashlib
import json
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright, expect
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

TRIO = {
    "sp144": {"name": "Zilverplevier", "sci": "Pluvialis squatarola"},
    "sp145": {"name": "Goudplevier", "sci": "Pluvialis apricaria"},
    "sp146": {"name": "Bontbekplevier", "sci": "Charadrius hiaticula"},
}


def assets_for(id_, credits, guide):
    main = credits[id_]
    photos = [("Hoofdfoto", main)]
    for role in ("winter", "juv"):
        photos.append((role, guide["plumage"][id_][role]))
    flight = [photo for photo in guide["poses"][id_] if photo.get("flight") is True]
    assert len(flight) == 1, f"{id_}: expected exactly one registered real free-flight asset"
    photos.append(("In vlucht", flight[0]))
    return photos


def check_original_files():
    guide = json.loads((ROOT / "assets/species/field-guide-media.json").read_text(encoding="utf8"))
    credits = json.loads((ROOT / "assets/species/credits.json").read_text(encoding="utf8"))
    all_digests = {}
    all_sources = {}
    for id_, info in TRIO.items():
        files = assets_for(id_, credits, guide)
        assert guide["plumage"][id_]["breeding"].get("reuseGuidePhoto") is True, id_
        for role, photo in files:
            assert photo["latin"] == info["sci"], (id_, role)
            assert photo["nl"] == info["name"], (id_, role)
            assert all(photo.get(field) for field in ("author", "source", "license", "licenseUrl", "alt")), (id_, role)
            assert photo["source"].startswith(("https://www.inaturalist.org/photos/", "https://commons.wikimedia.org/wiki/File:")), (id_, role)
            path = ROOT / photo["image"].lstrip("/")
            assert path.is_file(), (id_, role, path)
            data = path.read_bytes()
            assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", (id_, role)
            assert int.from_bytes(data[4:8], "little") + 8 == len(data), (id_, role)
            # Container-level metadata, including source GPS, must not be shipped.
            off = 12
            chunks = []
            while off + 8 <= len(data):
                chunk = data[off:off+4]
                chunks.append(chunk)
                length = int.from_bytes(data[off+4:off+8], "little")
                off += 8 + length + (length & 1)
            assert off == len(data), (id_, role, "corrupt WebP chunks")
            assert not any(ch in chunks for ch in (b"EXIF", b"XMP ")), (id_, role, chunks)
            digest = hashlib.sha256(data).hexdigest()
            assert digest not in all_digests, f"Identical binary photos: {all_digests.get(digest)} and {(id_, role)}"
            all_digests[digest] = (id_, role)
            src = photo["source"].replace("http://", "https://").rstrip("/")
            assert src not in all_sources, f"Same original source in two photo slots: {all_sources.get(src)} and {(id_, role)}"
            all_sources[src] = (id_, role)
            if role == "In vlucht":
                assert photo["flight"] is True and "flightReview" in photo, (id_, role)
            else:
                assert not photo.get("flight"), (id_, role)
        assert not any(p.get("sex") in ("male", "female") for _, p in files), (
            id_, "Do not invent sex from breeding plumage"
        )
        print(f"M12 {id_} SOURCE-CONTRACT PASS: 4 distinct WebPs, roles, credits metadata, no EXIF/XMP")
    assert len(all_digests) == 12 and len(all_sources) == 12
    # These runtime registration checks do not certify linked original pages or CC relicensing.
    print("M12 CONTRACT PASS — 12 unique local bytes and source URL entries; original source-page license NOT VERIFIED")


def check_browser():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            try:
                for id_, info in TRIO.items():
                    ctx = browser.new_context(
                        viewport={"width": 390, "height": 844},
                        reduced_motion="reduce", service_workers="block",
                    )
                    try:
                        page = ctx.new_page()
                        page.on("pageerror", lambda e: errors.append(str(e)))
                        boot(page, url)
                        open_species(page, info["name"], id_)
                        panel = page.locator("#sdPanel-herkenning")
                        two = panel.locator('.sd-plumage-list[data-layout="compare"]')
                        expect(two).to_have_count(1)
                        actual = two.locator(":scope > .sd-plumage").evaluate_all(
                            "els => els.map(e => e.dataset.plumage)"
                        )
                        assert actual == ["winter", "juv"], (id_, actual)
                        # Do not misrepresent the adult breeding hero as a male.
                        assert two.locator('[data-plumage="adult_m"]').count() == 0, id_
                        imgs = two.locator(".sd-field-photo img")
                        expect(imgs).to_have_count(2)
                        decode = imgs.evaluate_all("""async images => {
                          for (const img of images) {
                            img.loading='eager'; await img.decode();
                          }
                          return images.map(i => ({ok: i.complete && i.naturalWidth > 0,
                                alt:i.alt, source:i.currentSrc}));
                        }""")
                        assert all(p["ok"] and p["alt"].strip() for p in decode), (id_, decode)
                        assert len({p["source"] for p in decode}) == 2, (id_, "duplicated role image")
                        assert two.locator("details.photo-info").count() == 2, id_
                        flight = panel.locator("section.sd-flight")
                        expect(flight).to_have_count(1)
                        flight_img = flight.locator(".sd-field-photo img")
                        expect(flight_img).to_have_count(1)
                        flight_check = flight_img.evaluate("""async img => {
                          img.loading='eager'; await img.decode();
                          return {src:img.currentSrc,ok:img.complete&&img.naturalWidth>0};
                        }""")
                        assert flight_check["ok"], (id_, "flight image not decoded")
                        assert flight_check["src"] not in {p["source"] for p in decode}
                        assert panel.locator("details.sd-plumage-other").count() >= 1
                        overflow = page.evaluate(
                            "() => document.documentElement.scrollWidth - window.innerWidth"
                        )
                        assert overflow <= 2, (id_, overflow)
                        assert not errors, errors
                        print(f"M12 {id_} UI PASS — winter/juvenile two-up, true flight separate, real decode, no duplicate/overflow")
                    finally:
                        ctx.close()
            finally:
                browser.close()
        server.shutdown()


def main():
    check_original_files()
    check_browser()
    print("M12 PARTIAL PASS — all 3 species runtime/bytes verified; actual license pages + age/sex independent certification OPEN")


if __name__ == "__main__":
    main()
