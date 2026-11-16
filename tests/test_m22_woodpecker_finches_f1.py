#!/usr/bin/env python3
"""M22 initial F1: Middelste Bonte Specht, Kneu, Roodmus.

Checks seven real local WebP binaries, source registration, role boundaries,
mobile Chromium and dynamic F1 ledger. No complete independent original
license/JPEG match, sex/age/knowledge F2, physical-device or release proof.
"""
import hashlib
import json
import threading

from playwright.sync_api import expect, sync_playwright
from birdspot_f1_progress import historical_audit_status
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp020": {
        "name": "Middelste Bonte Specht",
        "latin": "Dendrocoptes medius",
        "hero": "/assets/species/plumage/sp020-male.webp",
        "others": [
            "/assets/species/sp020.webp",
            "/assets/species/plumage/sp020-pose.webp",
        ],
        "flight": "/assets/species/plumage/sp020-flight.webp",
        "comparison": "Grote Bonte Specht",
        "registeredUnique": 4,
    },
    "sp039": {
        "name": "Kneu",
        "latin": "Linaria cannabina",
        "hero": "/assets/species/sp039.webp",
        "others": [],
        "flight": "/assets/species/plumage/sp039-flight.webp",
        "comparison": None,
        "registeredUnique": 2,
    },
    "sp042": {
        "name": "Roodmus",
        "latin": "Carpodacus erythrinus",
        "hero": "/assets/showcase/sp042.webp",
        "others": [],
        "flight": None,
        "comparison": None,
        "registeredUnique": 1,
    },
}
REPORT = ROOT / "docs/fotokwaliteit/M22_SPECHT_EN_TWEE_VINKEN_2026-11-14_DRAFT.md"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def validate_f1_policy():
    norm = (ROOT / "docs/BIRDSPOT_KWALITEITSNORM.md").read_text(encoding="utf-8")
    assert "| Versie | 1.7 · 16-11-2026 |" in norm, "Latest lookalike rule must remain current"
    assert "| 1.6 | 15-11-2026 |" in norm, "Historical v1.6 must be preserved"
    assert "### 3.4 Kritieke dubbelgangers" in norm, "Photo-and-text rule must remain present"
    assert "| 1.5 | 14-11-2026 |" in norm, "The previous 1.5 decision must remain in history"
    assert "Eigenaarbesluit 15-11-2026 — alleen complete vergelijkingsfotoparen tonen" in norm, (
        "Owner global no-empty-comparison policy must be present")
    assert "| 1.4 | 14-11-2026 |" in norm, "Earlier source-verification policy must remain in history"
    assert "**Toon geen bronvermeldingen waar dat niet verplicht is.**" in norm
    assert "**Verplichte attributies behouden:**" in norm
    assert "| 1.3 | 14-11-2026 |" in norm, "V1.3 historical owner decision must remain"
    assert "### 2.1 Voorkeursbronnen voor soortherkenning" in norm
    assert "Start met Vogelbescherming Nederland en de ANWB-vogelgids" in norm
    assert "Alle zes controles uit §3.2 blijven verplicht" in norm
    assert "| 1.2 | 14-11-2026 |" in norm, "Previous photo norm history must remain intact"
    assert "**Kleine vogels: herkenbare rustfoto's vóór een moeilijke vluchtfoto" in norm
    assert "De zes controles van §3.2 blijven voor **elke wél geplaatste foto** verplicht." in norm
    assert "**Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.**" in norm
    for old_rule in (
        "- **Klein in beeld mag.**",
        '- **Echte vlucht voor "In vlucht".**',
        "- **Geen verzonnen geslachtslabels.**",
        "- **Een ontbrekende positie blijft open.**",
        "- **Extra foto's mogen**",
        "- **Gerichte vervanging of aanvulling**",
        "- **Verbeterwensen registreren.**",
    ):
        assert old_rule in norm
    for source_check in (
        "1. soortidentiteit;", "2. leeftijd en geslacht",
        "3. werkelijke houding", "4. herkomst en fotograaf;",
        "5. licentie en herpublicatierechten;", "6. voldoende kwaliteit",
    ):
        assert source_check in norm
    canonical = load("docs/fotokwaliteit/soortaudit-status.json")
    f1 = load("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    assert len(canonical["species"]) == 140
    audited, pending = historical_audit_status(canonical["species"], f1)
    entries = f1["additionalFirstPass"]
    unique_ids = [r["id"] for r in entries]
    assert len(entries) >= 32 and len(set(unique_ids)) == len(unique_ids)
    assert set(unique_ids) <= pending
    assert {r["id"] for r in entries if r["batch"] == "M22"} == set(BIRDS)
    assert {r["batch"] for r in entries} >= {
        "M12","M13","M14","M15","M16","M17","M18","M19","M20","M21","M22"
    }
    progress = len(audited) + len(entries)
    assert progress >= 132
    assert progress == f1["_meta"]["expectedFirstPass"]
    assert f1["_meta"]["expectedRemaining"] == 140 - progress
    assert "reverify ALL 140" in f1["_meta"]["nextGate"]
    for item in entries:
        assert item["status"] == "PARTIALLY TESTED"
        assert item["originalRights"] == "NOT TESTED"
        assert item["independentSexAge"] == "NOT TESTED"
        assert item["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / item["reviewDocument"]).is_file()
    assert REPORT.is_file()
    assert {r["id"]:r["photosSeen"] for r in entries if r["batch"]=="M22"} == {
        sid:b["registeredUnique"] for sid,b in BIRDS.items()
    }
    print(f"M22 F1 PASS: {progress}/140, {140-progress} open; seven previous photo rules preserved")


def fingerprint(path):
    raw = (ROOT / path.lstrip("/")).read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", path
    assert int.from_bytes(raw[4:8], "little") + 8 == len(raw), path
    chunks, off = [], 12
    while off + 8 <= len(raw):
        code = raw[off:off+4]
        size = int.from_bytes(raw[off+4:off+8], "little")
        chunks.append(code)
        off += 8 + size + (size & 1)
    assert off == len(raw), path
    assert b"EXIF" not in chunks and b"XMP " not in chunks, path
    return hashlib.sha256(raw).hexdigest()


def validate_bird_media():
    credits = load("assets/species/credits.json")
    media = load("assets/species/field-guide-media.json")
    canonical = load("docs/fotokwaliteit/soortaudit-status.json")
    knowledge = load("tools/kennisbaseline/knowledge.json")
    seen_sha, seen_sources = {}, {}
    for sid,bird in BIRDS.items():
        status = next(x for x in canonical["species"] if x["id"] == sid)
        if sid == "sp020":
            assert status["audited"] and status["verdict"] == "PARTIALLY TESTED"
            assert sid in knowledge
            assert {asset["image"] for asset in status["assets"]} == {
                bird["hero"], *bird["others"], bird["flight"],
            }
        else:
            assert not status["audited"] and status["verdict"] == "NOT TESTED"
            if sid in ("sp039", "sp042"):
                # F3-R10 (Kneu) and F3-R11 (Roodmus, 16-11-2026) added sourced knowledge profiles; the historical F1 audit status stays untouched.
                assert sid in knowledge and knowledge[sid]["caution"]["sources"], "F3 knowledge profile must stay sourced"
            else:
                assert sid not in knowledge
        cr = credits[sid]
        poses = media["poses"].get(sid, [])
        variants = media["plumage"].get(sid, {})
        assert cr["nl"] == bird["name"] and cr["latin"] == bird["latin"]

        if sid == "sp020":
            # One original asset appears in both credits and one pose.
            assert media["heroes"][sid] == bird["hero"]
            assert set(variants.keys()) == {"adult_m"}
            adult = variants["adult_m"]
            assert adult["image"] == bird["hero"]
            assert adult.get("sex") not in ("male","female")
            assert "zonder geslachtslabel" in adult["sexNote"]
            assert adult["age"] == "adult"
            assert len(poses) == 3
            assert sorted(p["image"] for p in poses if not p.get("flight")) == sorted(bird["others"])
            flight = next(p for p in poses if p.get("flight"))
            assert flight["image"] == bird["flight"] and flight["flightReview"].startswith("goedgekeurd")
            assert cr["image"] == poses[0]["image"] == "/assets/species/sp020.webp"
            assert cr["source"] == poses[0]["source"]
            all_records = [cr, adult] + poses
        elif sid == "sp039":
            # Historical M22 state: hero + conditional flight. F3-R10-media may add ONLY the verified
            # female and juvenile kleden from the Commons intake, each with pinned original SHA-1.
            assert not media["heroes"].get(sid)
            assert set(variants) <= {"adult_f", "juv"}
            for role, variant in variants.items():
                assert variant["intake"].startswith("tools/media/commons_intake.py"), role
                assert len(variant["sourceSha1"]) == 40 and variant["sex" if role == "adult_f" else "age"]
            assert cr["image"] == bird["hero"] and cr["sex"] == "male"
            assert len(poses) == 1
            flight = poses[0]
            assert flight["image"] == bird["flight"] and flight["flight"] is True
            assert "voorwaardelijk" in flight["flightReview"]
            assert "Vervanging met hoge prioriteit" in flight["flightReview"]
            assert len(cr["source"]) > 0 and cr["author"] == "Joe Pell"
            all_records = [cr, flight] + [variants[r] for r in sorted(variants)]
        else:
            assert sid == "sp042"
            assert not variants and not poses and not media["heroes"].get(sid)
            assert cr["image"] == bird["hero"] and cr["sex"] == "male"
            all_records = [cr]
        unique_files = {}
        for item in all_records:
            path = item["image"]
            assert item["nl"] == bird["name"] and item["latin"] == bird["latin"]
            assert all(item.get(key) for key in ("image","author","license","source","licenseUrl","alt"))
            assert item["source"].startswith("https://")
            assert item["licenseUrl"].startswith("https://creativecommons.org/licenses/")
            if path in unique_files:
                # Only the sp020 old portrait may be referenced twice.
                assert sid == "sp020" and path == "/assets/species/sp020.webp"
                assert unique_files[path]["source"] == item["source"]
                continue
            unique_files[path] = item
        extra = len(variants) if sid == "sp039" else 0  # F3-R10-media additions
        assert len(unique_files) == bird["registeredUnique"] + extra, (sid, list(unique_files))
        for path,item in unique_files.items():
            digest = fingerprint(path)
            original = item["source"].lower().rstrip("/")
            assert digest not in seen_sha, (sid, path, "duplicate source WebP binary")
            assert original not in seen_sources, (sid, path, "duplicate original source")
            seen_sha[digest] = path
            seen_sources[original] = path
        print(f"M22 {sid} MEDIA PASS: {len(unique_files)} distinct WebPs; correct hero/flight/portrait/sex policy")
    expected = 7 + len(load("assets/species/field-guide-media.json")["plumage"].get("sp039", {}))
    assert len(seen_sha) == len(seen_sources) == expected
    print(f"M22 PHOTO PASS: {expected} unique local WebPs (7 historical + F3-R10-media); external original pixel match and rights still open")


def mobile_ui():
    errors = []
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width in (360, 390):
                    for sid,bird in BIRDS.items():
                        ctx = browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce", service_workers="block",
                        )
                        try:
                            page = ctx.new_page()
                            page.on("pageerror", lambda err: errors.append(str(err)))
                            boot(page, url)
                            open_species(page, bird["name"], sid)
                            hero = page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            h = hero.locator("img").evaluate("""async img=>{
                               if(!img.getAttribute('src')&&img.dataset.src) img.src=img.dataset.src;
                               await img.decode();
                               return {ok:img.complete&&img.naturalWidth>0,
                                       src:img.currentSrc, alt:img.alt};
                            }""")
                            assert h["ok"] and h["alt"] and h["src"].endswith(bird["hero"]), (sid,h)
                            panel = page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            others = panel.locator("section.sd-poses .sd-field-photo img")
                            expect(others).to_have_count(len(bird["others"]))
                            for path in bird["others"]:
                                found = others.evaluate_all("""(imgs, path)=>
                                  imgs.filter(i => (i.currentSrc||i.getAttribute('src')||'').endsWith(path)).length
                                """, path)
                                assert found == 1, (sid,path,found)
                            flight = panel.locator("section.sd-flight .sd-field-photo img")
                            expect(flight).to_have_count(1 if bird["flight"] else 0)
                            if bird["flight"]:
                                details=flight.evaluate("""async img=>{
                                  img.loading='eager'; await img.decode();
                                  return {ok:img.complete&&img.naturalWidth>0,
                                          src:img.currentSrc,alt:img.alt};
                                }""")
                                assert details["ok"] and details["alt"] and details["src"].endswith(bird["flight"])
                                assert details["src"]!=h["src"]
                            if bird["comparison"]:
                                assert bird["comparison"] in panel.inner_text(), (sid,"known comparison missing")
                            assert not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"), (sid,width)
                            hero.click()
                            viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors, errors
                            print(f"M22 {sid} {width}px BROWSER PASS: true hero/role files, zoom/Escape and comparison if present")
                        finally:
                            ctx.close()
            finally:
                browser.close()
        server.shutdown()


if __name__=="__main__":
    validate_f1_policy()
    validate_bird_media()
    mobile_ui()
    print("M22 F1 checked; full photo/original-license/F2/Android/live evidence not established")
