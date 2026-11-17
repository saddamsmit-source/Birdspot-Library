#!/usr/bin/env python3
"""M13 source-conservative photo QA for Little Ringed and Kentish Plovers.

Read-only analysis of the 9 currently stored local WebPs and their declared
source metadata, plus real Chromium render on 360/390 px. This does NOT
independently validate original iNaturalist age/sex, licenses or live URLs.
No new photo import, source claim promotion, user storage or deployment.
"""
from __future__ import annotations

import hashlib
import json
import threading
from pathlib import Path

from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp147": {"name": "Kleine Plevier", "latin": "Charadrius dubius",
              "roles": ["juv", "winter"], "male_hero": False},
    "sp206": {"name": "Strandplevier", "latin": "Charadrius alexandrinus",
              "roles": ["adult_f", "juv", "winter"], "male_hero": True},
}


def media_inventory() -> dict:
    registry = json.loads(
        (ROOT / "assets/species/field-guide-media.json").read_text("utf-8")
    )
    credits = json.loads(
        (ROOT / "assets/species/credits.json").read_text("utf-8")
    )
    status = json.loads(
        (ROOT / "docs/fotokwaliteit/soortaudit-status.json").read_text("utf-8")
    )
    return {"registry": registry, "credits": credits, "status": status}


def verify_bytes_and_registration(data: dict) -> None:
    registry, credits, status = (
        data["registry"], data["credits"], data["status"],
    )
    seen_digests: dict[str, tuple[str, str]] = {}
    seen_source_urls: dict[str, tuple[str, str]] = {}
    total = 0
    for species_id, bird in BIRDS.items():
        audit = next(item for item in status["species"] if item["id"] == species_id)
        assert audit["audited"] is False, "Do not silently promote official audit counts"
        pictures = [("Hoofdfoto", credits[species_id])]
        for slot in bird["roles"]:
            pictures.append((slot, registry["plumage"][species_id][slot]))
        flights = [pose for pose in registry["poses"][species_id]
                   if pose.get("flight") is True]
        assert len(flights) == 1, (species_id, "one registered true-flight slot")
        pictures.append(("In vlucht", flights[0]))

        if bird["male_hero"]:
            assert credits[species_id].get("sex") == "male", (
                species_id, "source registry currently asserts male hero; separate proof open"
            )
            assert registry["plumage"][species_id]["adult_m"]["reuseGuidePhoto"] is True
        else:
            assert not credits[species_id].get("sex")
            assert registry["plumage"][species_id]["breeding"]["reuseGuidePhoto"] is True

        for slot, photo in pictures:
            assert photo.get("nl") == bird["name"], (species_id, slot, "wrong Dutch species")
            assert photo.get("latin") == bird["latin"], (
                species_id, slot, "wrong scientific species"
            )
            for field in ("image", "source", "author", "license", "licenseUrl", "alt"):
                assert photo.get(field), (species_id, slot, field)
            assert photo["source"].startswith("https://"), (species_id, slot)
            assert photo["licenseUrl"].startswith("https://"), (species_id, slot)
            if slot == "In vlucht":
                assert photo.get("flight") is True and photo.get("flightReview"), (
                    species_id, "flight classification must be recorded"
                )
            else:
                assert not photo.get("flight"), (species_id, slot)

            filepath = ROOT / photo["image"].lstrip("/")
            assert filepath.is_file(), (species_id, slot, filepath)
            content = filepath.read_bytes()
            assert content[:4] == b"RIFF" and content[8:12] == b"WEBP", (
                species_id, slot, "invalid WebP"
            )
            assert int.from_bytes(content[4:8], "little") + 8 == len(content)
            # Parse only top-level WebP chunks. EXIF/XMP must not ride along
            # with the offline-bundled guide images.
            cursor, chunks = 12, []
            while cursor + 8 <= len(content):
                chunk = content[cursor:cursor + 4]
                length = int.from_bytes(content[cursor + 4:cursor + 8], "little")
                chunks.append(chunk)
                cursor += 8 + length + (length & 1)
            assert cursor == len(content) and b"EXIF" not in chunks and b"XMP " not in chunks, (
                species_id, slot, "media metadata exposure or invalid chunk"
            )

            digest = hashlib.sha256(content).hexdigest()
            assert digest not in seen_digests, (
                species_id, slot, "duplicate WebP bytes:", seen_digests.get(digest)
            )
            seen_digests[digest] = (species_id, slot)
            normalized_source = photo["source"].rstrip("/")
            assert normalized_source not in seen_source_urls, (
                species_id, slot, "same original source in two positions"
            )
            seen_source_urls[normalized_source] = (species_id, slot)
            total += 1

        print(f"M13 {species_id} REGISTER PASS - {len(pictures)} unique images, role metadata, "
              "RIFF chunks and no embedded EXIF/XMP; original source/license still unverified")
    assert total == 9 and len(seen_digests) == len(seen_source_urls) == 9


def inspect_ui_on(browser, url: str, width: int, data: dict, errors: list[str]) -> None:
    context = browser.new_context(
        viewport={"width": width, "height": 844},
        reduced_motion="reduce", service_workers="block",
    )
    try:
        page = context.new_page()
        page.on("pageerror", lambda e: errors.append(f"{width}px: {e}"))
        boot(page, url)
        for species_id, bird in BIRDS.items():
            open_species(page, bird["name"], species_id)
            panel = page.locator("#sdPanel-herkenning")
            grid = panel.locator('.sd-plumage-list[data-layout="compare"]')
            expect(grid).to_have_count(1)
            actual_roles = grid.locator(":scope > .sd-plumage").evaluate_all(
                "els => els.map(e => e.dataset.plumage)"
            )
            assert actual_roles == bird["roles"], (
                species_id, width, "unexpected sex/season/juvenile role ordering", actual_roles
            )
            assert grid.locator('[data-plumage="adult_m"]').count() == 0, (
                species_id, "do not duplicate hero as false second male card"
            )
            imgs = grid.locator(".sd-field-photo img")
            expect(imgs).to_have_count(len(bird["roles"]))
            decoded = imgs.evaluate_all("""async images => {
              for (const img of images) {
                img.loading = 'eager'; await img.decode();
              }
              return images.map(i => ({
                ok: i.complete && i.naturalWidth > 0,
                alt: i.getAttribute('alt'), src: i.currentSrc,
              }));
            }""")
            assert all(x["ok"] and x["alt"] for x in decoded), (
                species_id, width, decoded
            )
            assert len({x["src"] for x in decoded}) == len(decoded), (
                species_id, width, "duplicate local role photos"
            )
            # The male hero of sp206 belongs above this gallery; its
            # reference must not be mistaken for a second distinct male photo.
            if bird["male_hero"]:
                assert panel.locator(
                    'details.sd-plumage-other [data-plumage="adult_m"]'
                ).count() >= 1, "Male hero reference missing from text-only roles"
            flight_section = panel.locator("section.sd-flight")
            expect(flight_section).to_have_count(1)
            flight_img = flight_section.locator(".sd-field-photo img")
            expect(flight_img).to_have_count(1)
            f = flight_img.evaluate("""async img => {
              img.loading = 'eager'; await img.decode();
              return {ok: img.complete && img.naturalWidth > 0, src: img.currentSrc};
            }""")
            assert f["ok"] and f["src"] not in {x["src"] for x in decoded}, (
                species_id, width, "true-flight source missing/duplicated"
            )
            assert grid.locator("details.photo-info").count() == len(decoded), (
                species_id, width, "each role needs its own source credits"
            )
            # Connected app comparison must still include Bontbekplevier.
            assert "Bontbekplevier" in panel.inner_text(), (
                species_id, "comparison with Bontbekplevier disappeared"
            )
            assert page.evaluate(
                "() => document.documentElement.scrollWidth <= innerWidth + 2"
            ), (species_id, width, "page overflow")
            assert not errors, errors
            print(f"M13 {species_id} UI-{width} PASS - decoded individual plumages, "
                  "one separate flight, similar-species comparison and no overflow")
            # Close the detail overlay before opening the next species.
            page.locator(".signature-species-detail-close").click()
            page.locator(".signature-species-detail-overlay").wait_for(
                state="detached", timeout=12000
            )
    finally:
        context.close()


def main() -> None:
    data = media_inventory()
    verify_bytes_and_registration(data)
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width in (360, 390):
                    inspect_ui_on(browser, url, width, data, errors)
                assert not errors, errors
            finally:
                browser.close()
        server.shutdown()
    print("M13 TECHNICAL PASS - 9 local image files & roles checked; "
          "individual rights/age/sex and real Android remain OPEN")


if __name__ == "__main__":
    main()
