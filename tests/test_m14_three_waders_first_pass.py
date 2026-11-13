#!/usr/bin/env python3
"""Birdspot M14: first-pass image and browser QA for three wader species.

This is an INITIAL review only. Source links/CC metadata and individual
juvenile age labels are not independently verified by browser-render tests.
The canonical 9-point SOORTAUDIT status remains untouched.
"""
import hashlib
import json
import threading
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SPECIES = {
    "sp157": ("Zwarte Ruiter", "Tringa erythropus", "Tureluur"),
    "sp158": ("Groenpootruiter", "Tringa nebularia", "Poelruiter"),
    "sp159": ("Bosruiter", "Tringa glareola", "Witgat"),
}
FIRST_PASS = ROOT / "docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json"


def read_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def first_pass_progress():
    status = read_json("docs/fotokwaliteit/soortaudit-status.json")
    ledger = json.loads(FIRST_PASS.read_text(encoding="utf-8"))
    rows = status["species"]
    assert len(rows) == 140
    audited = {row["id"] for row in rows if row["audited"]}
    pending = {row["id"] for row in rows if not row["audited"]}
    assert len(audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(pending) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    entries = ledger["additionalFirstPass"]
    additional = [item["id"] for item in entries]
    assert len(additional) == ledger["_meta"]["expectedFirstPass"] - len(audited) and len(set(additional)) == len(additional)
    assert set(additional).issubset(pending), (
        "FIRST PASS must never duplicate a canonically audited species"
    )
    assert {"M12","M13","M14"}.issubset({e["batch"] for e in entries})
    assert {e["id"] for e in entries if e["batch"] == "M14"} == set(SPECIES)
    for item in entries:
        assert item["status"] == "PARTIALLY TESTED"
        assert item["originalRights"] == "NOT TESTED"
        assert item["independentSexAge"] == "NOT TESTED"
        assert item["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / item["reviewDocument"]).is_file()
        assert item["photosSeen"] >= 1
    first_pass_count = len(audited) + len(additional)
    assert first_pass_count == ledger["_meta"]["expectedFirstPass"]
    assert 140 - first_pass_count == ledger["_meta"]["expectedRemaining"]
    assert "reverify ALL 140" in ledger["_meta"]["nextGate"]
    print(f"M14 F1-PROGRESS PASS: {len(audited)} canonical audits + {len(additional)} separate first passes = {first_pass_count}/140 initially reviewed, {140-first_pass_count} remaining; full 9-point status unchanged")


def check_assets():
    credits = read_json("assets/species/credits.json")
    media = read_json("assets/species/field-guide-media.json")
    knowledge = read_json("tools/kennisbaseline/knowledge.json")
    official = read_json("docs/fotokwaliteit/soortaudit-status.json")
    seen_hashes, seen_sources = {}, {}
    for bird_id, (dutch, latin, similar) in SPECIES.items():
        entry = next(x for x in official["species"] if x["id"] == bird_id)
        assert entry["audited"] is False and entry["verdict"] == "NOT TESTED"
        # The second verification pass must complete a whole knowledge profile.
        assert bird_id not in knowledge, (
            bird_id, "a new knowledge profile would require new review status"
        )
        plumages = media["plumage"][bird_id]
        assert plumages["breeding"]["reuseGuidePhoto"] is True
        assert "adult_f" not in plumages, (
            bird_id, "don't invent sex where plumage is not diagnostic"
        )
        recorded_flights = [p for p in media["poses"][bird_id]
                            if p.get("flight") is True]
        assert len(recorded_flights) == 1
        files = [
            ("Hoofdfoto", credits[bird_id]),
            ("winter", plumages["winter"]),
            ("juv", plumages["juv"]),
            ("In vlucht", recorded_flights[0])
        ]
        for role, item in files:
            assert item["nl"] == dutch and item["latin"] == latin, (
                bird_id, role, "species identification mismatch in registry"
            )
            assert all(item.get(v) for v in
                       ("image", "author", "license", "licenseUrl", "source", "alt")), (
                bird_id, role, "incomplete recorded source credits"
            )
            assert item["source"].startswith("https://")
            assert item["licenseUrl"].startswith("https://")
            if role == "In vlucht":
                assert item.get("flight") is True and item.get("flightReview"), (
                    bird_id, "registered flight pose must be explicitly reviewed"
                )
            else:
                assert item.get("flight") is not True
            path = ROOT / item["image"].lstrip("/")
            data = path.read_bytes()
            assert data[:4] == b"RIFF" and data[8:12] == b"WEBP", (bird_id,role)
            assert int.from_bytes(data[4:8],"little") + 8 == len(data)
            # Detect EXIF/XMP at WebP RIFF top level; no source GPS metadata.
            chunks, offset = [], 12
            while offset + 8 <= len(data):
                chunk = data[offset:offset+4]
                length = int.from_bytes(data[offset+4:offset+8],"little")
                chunks.append(chunk)
                offset += 8 + length + (length & 1)
            assert offset == len(data)
            assert b"EXIF" not in chunks and b"XMP " not in chunks
            digest = hashlib.sha256(data).hexdigest()
            assert digest not in seen_hashes, (
                "Duplicate photo binary", seen_hashes.get(digest), (bird_id, role)
            )
            seen_hashes[digest] = (bird_id, role)
            source = item["source"].rstrip("/").lower()
            assert source not in seen_sources, (
                "Duplicate original source", seen_sources.get(source), (bird_id, role)
            )
            seen_sources[source] = (bird_id, role)
            assert item.get("sex") not in ("male", "female"), (
                bird_id, "Do not promote a photo into an unsupported sex role"
            )
        print(f"M14 {bird_id} ASSETS PASS: 4 different source-registered WebPs, "
              "genuine flight tag, no EXIF/XMP, official NOT TESTED preserved")
    assert len(seen_hashes) == len(seen_sources) == 12
    print("M14 ASSET-SET PASS: 12 unique registered photo binaries, "
          "original license / age not independently reverified")


def check_browser():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for bird_id,(dutch,latin,similar) in SPECIES.items():
                        context=browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce",service_workers="block"
                        )
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda e:errors.append(str(e)))
                            boot(page,url)
                            open_species(page,dutch,bird_id)
                            panel=page.locator("#sdPanel-herkenning")
                            grid=panel.locator('.sd-plumage-list[data-layout="compare"]')
                            expect(grid).to_have_count(1)
                            roles=grid.locator(":scope > .sd-plumage").evaluate_all(
                                "els => els.map(el => el.dataset.plumage)"
                            )
                            assert roles == ["juv","winter"],(bird_id,width,roles)
                            # We only have two separate non-flight plumage images.
                            assert grid.locator('[data-plumage="adult_m"]').count()==0
                            assert grid.locator('[data-plumage="adult_f"]').count()==0
                            photos=grid.locator(".sd-field-photo img")
                            expect(photos).to_have_count(2)
                            result=photos.evaluate_all("""async els => {
                              for(const img of els) {
                                img.loading='eager'; await img.decode();
                              }
                              return els.map(img=>({
                                ok:img.complete&&img.naturalWidth>0,
                                src:img.currentSrc, alt:img.getAttribute('alt')
                              }));
                            }""")
                            assert all(a["ok"] and a["alt"] for a in result),(bird_id,result)
                            assert len({a["src"] for a in result})==2
                            expect(grid.locator("details.photo-info")).to_have_count(2)
                            flight=panel.locator("section.sd-flight")
                            expect(flight).to_have_count(1)
                            flight_picture=flight.locator(".sd-field-photo img")
                            expect(flight_picture).to_have_count(1)
                            photo=flight_picture.evaluate("""async img=>{
                                img.loading='eager'; await img.decode();
                                return {ok:img.complete && img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert photo["ok"] and photo["alt"] and photo["src"] not in {
                                a["src"] for a in result
                            },(bird_id,photo)
                            assert similar in panel.inner_text(), (
                                bird_id, "existing similar-species comparisons disappeared"
                            )
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ),(bird_id,width,"horizontal overflow")
                            first=grid.locator("button.sd-field-photo").first
                            first.focus()
                            page.keyboard.press("Enter")
                            viewer=page.get_by_role("dialog", name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors,errors
                            print(f"M14 {bird_id} BROWSER-{width} PASS: winter/juv, "
                                  "real separate flight, related species and working zoom")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__=="__main__":
    first_pass_progress()
    check_assets()
    check_browser()
    print("M14 BROWSER/ASSET QA done; current F1 count validated against ledger. Original image rights, juvenile ages and knowledge verification remain open.")
