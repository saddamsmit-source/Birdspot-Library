#!/usr/bin/env python3
"""Birdspot M17: F1 first visual/source check for 3 gulls (8 local photos).

Tests the exact source/media roles and real 360/390px Chromium interface.
Does NOT certify original-JPEG/converted-WebP identity, independent age,
all derivative image rights, full species biology or physical devices.
"""
import hashlib
import json
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SPECIES = {
    "sp097": {
        "name": "Kokmeeuw",
        "latin": "Chroicocephalus ridibundus",
        "hero": "/assets/species/sp097.webp",
        "winter": "/assets/species/plumage/sp097-winter.webp",
        "flight": "/assets/species/plumage/sp097-flight.webp",
        "similar": "Zwartkopmeeuw",
    },
    "sp164": {
        "name": "Grote Mantelmeeuw",
        "latin": "Larus marinus",
        "hero": "/assets/species/plumage/sp164-adult.webp",
        "winter": None,
        "flight": "/assets/species/plumage/sp164-flight.webp",
        "similar": "Kleine Mantelmeeuw",
    },
    "sp225": {
        "name": "Zwartkopmeeuw",
        "latin": "Ichthyaetus melanocephalus",
        "hero": "/assets/species/sp225.webp",
        "winter": "/assets/species/plumage/sp225-winter.webp",
        "flight": "/assets/species/plumage/sp225-flight.webp",
        "similar": "Kokmeeuw",
    },
}
DOC = "docs/fotokwaliteit/M17_DRIE_MEEUWEN_2026-11-13_DRAFT.md"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check_progress():
    official = load("docs/fotokwaliteit/soortaudit-status.json")
    first = load("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    assert len(official["species"]) == 140
    audited = {x["id"] for x in official["species"] if x["audited"]}
    pending = {x["id"] for x in official["species"] if not x["audited"]}
    assert len(audited) == first["_meta"]["baselineAudited"] == 100
    assert len(pending) == first["_meta"]["expectedCanonicalUnreviewed"] == 40
    additional = first["additionalFirstPass"]
    ids = [x["id"] for x in additional]
    assert len(additional) == 17 and len(set(ids)) == len(ids)
    assert set(ids) <= pending and not (set(ids) & audited)
    assert {x["batch"] for x in additional} >= {"M12", "M13", "M14", "M15", "M16", "M17"}
    assert {x["id"] for x in additional if x["batch"] == "M17"} == set(SPECIES)
    assert len(audited) + len(additional) == first["_meta"]["expectedFirstPass"] == 117
    assert first["_meta"]["expectedRemaining"] == 23
    assert "reverify ALL 140" in first["_meta"]["nextGate"]
    for entry in additional:
        assert entry["status"] == "PARTIALLY TESTED"
        assert entry["originalRights"] == "NOT TESTED"
        assert entry["independentSexAge"] == "NOT TESTED"
        assert entry["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / entry["reviewDocument"]).is_file()
    assert (ROOT / DOC).is_file()
    print("M17 F1-PROGRESS PASS: 100 official audited + 17 first-pass = 117/140; 23 open")


def webp_sha(path):
    data = (ROOT / path.lstrip("/")).read_bytes()
    assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", path
    assert len(data) == int.from_bytes(data[4:8], "little") + 8, path
    codes, off = [], 12
    while off + 8 <= len(data):
        code = data[off:off+4]
        n = int.from_bytes(data[off+4:off+8], "little")
        codes.append(code)
        off += 8 + n + (n % 2)
    assert off == len(data), (path, off, len(data))
    assert b"EXIF" not in codes and b"XMP " not in codes, path
    return hashlib.sha256(data).hexdigest()


def check_source_and_local_media():
    credits = load("assets/species/credits.json")
    media = load("assets/species/field-guide-media.json")
    knowledge = load("tools/kennisbaseline/knowledge.json")
    original = load("docs/fotokwaliteit/soortaudit-status.json")
    hashes = {}
    sources = {}
    total = 0

    for bird_id, bird in SPECIES.items():
        row = next(x for x in original["species"] if x["id"] == bird_id)
        assert row["audited"] is False and row["verdict"] == "NOT TESTED"
        assert bird_id not in knowledge, "Full F2 knowledge review not done"
        variants = media["plumage"][bird_id]
        poses = media["poses"][bird_id]
        assert len(poses) == 1 and poses[0].get("flight") is True
        if bird_id == "sp164":
            assert bird_id not in credits, "Hero uses registered adult plumage variant"
            assert media["heroes"][bird_id] == bird["hero"]
            assert variants.keys() == {"adult_m"}
            assert variants["adult_m"].get("sex") not in ("male", "female")
            records = [variants["adult_m"], poses[0]]
        else:
            assert bird_id in credits
            assert variants["breeding"]["reuseGuidePhoto"] is True
            assert variants["winter"]["image"] == bird["winter"]
            records = [credits[bird_id], variants["winter"], poses[0]]
        assert records[0]["image"] == bird["hero"]
        assert records[-1]["image"] == bird["flight"]
        assert "adult_f" not in variants and "juv" not in variants, (
            bird_id, "Do not fabricate absent female/juvenile photos"
        )
        for item in records:
            assert item["nl"] == bird["name"] and item["latin"] == bird["latin"]
            assert all(item.get(k) for k in
                       ("image", "source", "author", "license", "licenseUrl", "alt"))
            assert item["source"].startswith("https://commons.wikimedia.org/wiki/File:")
            assert item["licenseUrl"].startswith("https://creativecommons.org/licenses/")
            assert item.get("sex") not in ("male", "female") and item.get("age") not in ("juvenile",)
            image_path = item["image"]
            digest = webp_sha(image_path)
            assert digest not in hashes, ("Duplicate image binary", bird_id, image_path, hashes.get(digest))
            hashes[digest] = (bird_id, image_path)
            source = item["source"].rstrip("/").lower()
            assert source not in sources, ("Duplicate source URL", bird_id, image_path, sources.get(source))
            sources[source] = (bird_id, image_path)
            total += 1
        flight = poses[0]
        assert flight["flightReview"] and flight["flight"] is True
        assert flight["image"] != records[0]["image"]
        if bird_id == "sp225":
            assert "non_breeding_in_flight" in flight["source"]
            assert "volwassen" not in (flight["note"] + flight["alt"] + flight["visualCheck"]).lower(), (
                "Unsupported individual adult age label must not recur"
            )
            assert "leeftijd" in flight["note"].lower()
            assert "staartband" in flight["note"].lower()
            assert flight["author"] == "Charles J. Sharp"
            assert flight["license"] == "CC BY-SA 4.0"
        print(f"M17 {bird_id} MEDIA PASS: {len(records)} registered real WebPs and distinct roles")

    assert total == len(hashes) == len(sources) == 8
    print("M17 8/8 PHOTO-ASSETS PASS: unique binary SHA256 + Commons URL, valid metadata-free WebP")
    print("M17 ORIGINAL LICENSING LIMIT: 5 Commons pages read; byte match/all derivative rights NOT PROVEN")


def mobile_browser():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width in (360, 390):
                    for bird_id, bird in SPECIES.items():
                        ctx = browser.new_context(
                            viewport={"width": width, "height": 844},
                            reduced_motion="reduce",
                            service_workers="block",
                        )
                        try:
                            page = ctx.new_page()
                            page.on("pageerror", lambda error: errors.append(str(error)))
                            boot(page, url)
                            open_species(page, bird["name"], bird_id)
                            hero = page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            hero_img = hero.locator("img").evaluate("""async img => {
                                if (!img.src && img.dataset.src) img.src = img.dataset.src;
                                if (!img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src;
                                await img.decode();
                                return {ok: img.complete && img.naturalWidth > 0,
                                        src: img.currentSrc, alt: img.alt};
                            }""")
                            assert hero_img["ok"] and hero_img["alt"]
                            assert hero_img["src"].endswith(bird["hero"]), (bird_id, hero_img)
                            panel = page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            standalone = panel.locator(".sd-plumage-gallery img").evaluate_all("""imgs =>
                              imgs.filter(img => !img.closest('section.sd-flight'))
                                  .map(img => img.getAttribute('src'))
                            """)
                            if bird["winter"]:
                                assert len(standalone) == 1 and standalone[0].endswith(bird["winter"]), (
                                    bird_id, standalone
                                )
                            else:
                                assert standalone == [], (bird_id, "No duplicate hero or fake winter image")
                            flight_area = panel.locator("section.sd-flight")
                            expect(flight_area).to_have_count(1)
                            flight_image = flight_area.locator(".sd-field-photo img")
                            expect(flight_image).to_have_count(1)
                            flight = flight_image.evaluate("""async img => {
                                img.loading = 'eager';
                                await img.decode();
                                return {ok: img.complete && img.naturalWidth > 0,
                                        src: img.currentSrc, alt: img.alt};
                            }""")
                            assert flight["ok"] and flight["alt"] and flight["src"].endswith(bird["flight"])
                            assert flight["src"] != hero_img["src"]
                            if bird_id == "sp225":
                                assert "volwassen" not in flight_area.inner_text().lower(), (
                                    bird_id, "Adult sex/age not sourced for this original flight file"
                                )
                            if bird_id == "sp164":
                                # Source slot named adult_m is not an individual male claim.
                                # Photo is reused as hero and referenced (not duplicated) below.
                                assert "Foto: de hoofdfoto bovenaan deze kaart" in panel.inner_text()
                            assert bird["similar"] in panel.inner_text(), (bird_id, "Comparison missing")
                            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"), (
                                bird_id, width, "Horizontal overflow"
                            )
                            hero.click()
                            viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors, errors
                            print(f"M17 {bird_id} BROWSER-{width} PASS: hero/flight + "
                                  f"{'winter photo' if bird['winter'] else 'adult hero reference'}, "
                                  "comparison, zoom/Escape, no overflow")
                        finally:
                            ctx.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    check_progress()
    check_source_and_local_media()
    mobile_browser()
    print("M17 complete technical first-pass checks; not original-license/F2/physical-device/release PASS")
