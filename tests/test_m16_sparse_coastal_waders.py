#!/usr/bin/env python3
"""M16 initial (F1) audit of three partially photographed coastal waders.

This is not a substitute for original-image binary matching, F2 biology,
source-license/legal evaluation, a physical-device test, or an app release.
"""
import hashlib
import json
import threading
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SPECIES = {
    "sp148": ("Regenwulp", "Numenius phaeopus", "Wulp"),
    "sp149": ("Rosse Grutto", "Limosa lapponica", "Grutto"),
    "sp150": ("Steenloper", "Arenaria interpres", None),
}
F1 = ROOT / "docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json"
REPORT = ROOT / "docs/fotokwaliteit/M16_REGENWULP_ROSSE_GRUTTO_STEENLOPER_2026-11-13_DRAFT.md"


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def test_f1_count_and_authority():
    official = read_json("docs/fotokwaliteit/soortaudit-status.json")
    ledger = json.loads(F1.read_text(encoding="utf-8"))
    rows = official["species"]
    assert len(rows) == 140, "Canonical scope must stay at 140"
    audited = {x["id"] for x in rows if x["audited"]}
    pending = {x["id"] for x in rows if not x["audited"]}
    assert len(audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(pending) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    items = ledger["additionalFirstPass"]
    ids = [x["id"] for x in items]
    assert len(set(ids)) == len(ids), "No duplicated first-pass species"
    assert set(ids).issubset(pending), "Do not re-add audited species"
    assert {x["id"] for x in items if x["batch"] == "M16"} == set(SPECIES)
    assert len(items) == 14, "11 preexisting additional + 3 M16"
    assert len(audited) + len(items) == ledger["_meta"]["expectedFirstPass"] == 114
    assert ledger["_meta"]["expectedRemaining"] == 26
    assert "reverify ALL 140" in ledger["_meta"]["nextGate"]
    for entry in items:
        assert entry["status"] == "PARTIALLY TESTED"
        assert entry["originalRights"] == "NOT TESTED"
        assert entry["independentSexAge"] == "NOT TESTED"
        assert entry["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / entry["reviewDocument"]).exists()
    assert "PARTIALLY TESTED" in REPORT.read_text(encoding="utf-8")
    print("M16 F1 PASS: 100 canonical + 14 supplemental = 114/140, 26 open; canonical unchanged")


def webp_fingerprint(relative_path):
    file = ROOT / relative_path.lstrip("/")
    data = file.read_bytes()
    assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", relative_path
    assert int.from_bytes(data[4:8], "little") + 8 == len(data), relative_path
    chunks, pos = [], 12
    while pos + 8 <= len(data):
        code = data[pos:pos+4]
        n = int.from_bytes(data[pos+4:pos+8], "little")
        chunks.append(code)
        pos += 8 + n + (n % 2)
    assert pos == len(data), relative_path
    assert b"EXIF" not in chunks and b"XMP " not in chunks, relative_path
    return hashlib.sha256(data).hexdigest()


def test_four_actual_local_images_and_sparse_roles():
    credits = read_json("assets/species/credits.json")
    media = read_json("assets/species/field-guide-media.json")
    official = read_json("docs/fotokwaliteit/soortaudit-status.json")
    knowledge = read_json("tools/kennisbaseline/knowledge.json")
    hashes, sources = [], []
    for sid, (name, scientific, _) in SPECIES.items():
        status = next(x for x in official["species"] if x["id"] == sid)
        assert not status["audited"] and status["verdict"] == "NOT TESTED"
        assert sid not in knowledge, "Full biology profile would be a separate review"
        assert sid not in media["plumage"], "No unverified male/female/juvenile media should be added"
        hero = credits[sid]
        assert hero["nl"] == name and hero["latin"] == scientific
        assert hero["image"] == f"/assets/species/{sid}.webp"
        assert all(hero.get(k) for k in ("author", "license", "source", "image", "alt"))
        assert hero["source"].startswith("https://commons.wikimedia.org/wiki/File:")
        hashes.append(webp_fingerprint(hero["image"]))
        sources.append(hero["source"].lower())
        flight = [x for x in media["poses"].get(sid, []) if x.get("flight")]
        if sid == "sp150":
            assert len(flight) == 1
            item = flight[0]
            assert item["image"] == "/assets/species/plumage/sp150-flight.webp"
            assert item["nl"] == name and item["latin"] == scientific
            assert item["flightReview"] and item["license"] == "CC BY-SA 4.0"
            assert "non-breeding" in item["file"].lower()
            hashes.append(webp_fingerprint(item["image"]))
            sources.append(item["source"].lower())
        else:
            assert not flight, "Do not pretend an unsupported flight photograph exists"
        print(f"M16 {sid} source/data PASS: {1 + len(flight)} real photo(s), correct sparse roles")
    assert len(hashes) == len(sources) == 4
    assert len(set(hashes)) == len(set(sources)) == 4
    print("M16 PHOTO PASS: 4 separate local WebP files; original-pixel/perceptual match NOT PROVEN")


def test_real_mobile_browser():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width in (360, 390):
                    for sid, (name, _, comparison) in SPECIES.items():
                        context = browser.new_context(
                            viewport={"width": width, "height": 844},
                            reduced_motion="reduce", service_workers="block"
                        )
                        try:
                            page = context.new_page()
                            page.on("pageerror", lambda err: errors.append(str(err)))
                            boot(page, url)
                            open_species(page, name, sid)
                            hero = page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            info = hero.locator("img").evaluate("""async img => {
                                if (!img.getAttribute('src') && img.dataset.src) {
                                  img.src = img.dataset.src;
                                }
                                await img.decode();
                                return {
                                  ok: img.complete && img.naturalWidth > 0,
                                  src: img.currentSrc, alt: img.alt
                                };
                            }""")
                            assert info["ok"] and info["alt"] and f"{sid}.webp" in info["src"], (sid, info)
                            panel = page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            assert panel.locator(".sd-plumage-gallery img").count() == 0, (
                                sid, "Do not show invented plumage photographs"
                            )
                            flight = panel.locator("section.sd-flight .sd-field-photo img")
                            if sid == "sp150":
                                expect(flight).to_have_count(1)
                                f = flight.evaluate("""async img => {
                                    img.loading = 'eager';
                                    await img.decode();
                                    return {ok: img.complete && img.naturalWidth > 0,
                                            src: img.currentSrc, alt: img.alt};
                                }""")
                                assert f["ok"] and f["alt"] and "sp150-flight.webp" in f["src"]
                                assert f["src"] != info["src"]
                            else:
                                expect(flight).to_have_count(0)
                            if comparison:
                                assert comparison in panel.inner_text(), (sid, "existing comparison missing")
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (sid, width, "horizontal overflow")
                            hero.click()
                            viewer = page.get_by_role("dialog", name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors, errors
                            print(f"M16 {sid} {width}px UI PASS: hero decode/zoom, "
                                  f"{'flight' if sid == 'sp150' else 'no fabricated flight'}, no overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    test_f1_count_and_authority()
    test_four_actual_local_images_and_sparse_roles()
    test_real_mobile_browser()
    print("M16 done — F1 114/140; no F2, origin-byte rights, device or production PASS")
