#!/usr/bin/env python3
"""Birdspot M20 F1: Fluiter, Tuinfluiter, Braamsluiper.

Verify four actual local WebP binaries, source/role registration, one
non-free-flight Fluiter pose, real 360/390px UI, plus the add-only juvenile
policy (all seven previously existing photographic rules stay in force).
This is NOT independent original-JPEG/rights, sex/juvenile or F2 proof.
"""
import hashlib
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

SPECIES = {
    "sp058": {
        "name": "Fluiter",
        "latin": "Phylloscopus sibilatrix",
        "hero": "/assets/species/sp058.webp",
        "pose": "/assets/species/plumage/sp058-flight.webp",
        "similar": None,
    },
    "sp060": {
        "name": "Tuinfluiter",
        "latin": "Sylvia borin",
        "hero": "/assets/species/sp060.webp",
        "pose": None,
        "similar": "Zwartkop",
    },
    "sp062": {
        "name": "Braamsluiper",
        "latin": "Curruca curruca",
        "hero": "/assets/species/sp062.webp",
        "pose": None,
        "similar": "Grasmus",
    },
}
REPORT = ROOT / "docs/fotokwaliteit/M20_DRIE_ZANGVOGELS_2026-11-14_DRAFT.md"


def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check_existing_policy_preserved():
    norm = (ROOT / "docs/BIRDSPOT_KWALITEITSNORM.md").read_text(encoding="utf-8")
    assert "| Versie | 1.2 · 14-11-2026 |" in norm
    assert "| 1.0 | 10-11-2026 |" in norm
    assert "| 1.1 | 13-11-2026 |" in norm
    # These seven existing 1.0 rules must NOT be silently replaced by
    # the newer foot-specific exception for juveniles.
    previous = (
        "- **Klein in beeld mag.**",
        '- **Echte vlucht voor "In vlucht".**',
        "- **Geen verzonnen geslachtslabels.**",
        "- **Een ontbrekende positie blijft open.**",
        "- **Extra foto's mogen**",
        "- **Gerichte vervanging of aanvulling**",
        "- **Verbeterwensen registreren.**",
    )
    assert all(p in norm for p in previous), "An original photographic rule was removed"
    for proof in ("1. soortidentiteit;", "2. leeftijd en geslacht", "3. werkelijke houding",
                  "4. herkomst en fotograaf;", "5. licentie en herpublicatierechten;",
                  "6. voldoende kwaliteit"):
        assert proof in norm, ("Original six-point verification weakened", proof)
    assert "**Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.**" in norm
    assert "**Onzichtbare poten op zichzelf zijn geen STOP of afkeurreden.**" in norm
    assert "Alle bestaande regels uit §§1–4 blijven ongewijzigd" in norm
    assert "geen vrijstelling" not in norm.lower() or "geen" in norm.lower()
    print("M20 NORM PASS: all seven older photo rules and six checks preserved; juvenile exception additive")


def check_f1():
    official = load("docs/fotokwaliteit/soortaudit-status.json")
    ledger = load("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    assert len(official["species"]) == 140
    audited = {x["id"] for x in official["species"] if x["audited"]}
    unreviewed = {x["id"] for x in official["species"] if not x["audited"]}
    assert len(audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(unreviewed) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    additional = ledger["additionalFirstPass"]
    ids = [x["id"] for x in additional]
    assert len(additional) >= 26 and len(ids) == len(set(ids))
    assert set(ids) <= unreviewed
    assert {x["id"] for x in additional if x["batch"] == "M20"} == set(SPECIES)
    assert {x["batch"] for x in additional} >= {
        "M12","M13","M14","M15","M16","M17","M18","M19","M20"
    }
    count = len(audited) + len(additional)
    assert count >= 126 and count == ledger["_meta"]["expectedFirstPass"]
    assert ledger["_meta"]["expectedRemaining"] == 140 - count
    assert "reverify ALL 140" in ledger["_meta"]["nextGate"]
    for item in additional:
        assert item["status"] == "PARTIALLY TESTED"
        assert item["originalRights"] == "NOT TESTED"
        assert item["independentSexAge"] == "NOT TESTED"
        assert item["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / item["reviewDocument"]).is_file()
    assert REPORT.is_file()
    assert {x["id"]:x["photosSeen"] for x in additional if x["batch"]=="M20"} == {
        "sp058":2,"sp060":1,"sp062":1
    }
    print(f"M20 F1 PASS: {count}/140 initial reviews, {140-count} open; official audit still 100/140")


def fingerprint(path):
    raw = (ROOT / path.lstrip("/")).read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", path
    assert int.from_bytes(raw[4:8],"little") + 8 == len(raw), path
    chunks, p = [], 12
    while p + 8 <= len(raw):
        typ = raw[p:p+4]
        n = int.from_bytes(raw[p+4:p+8],"little")
        chunks.append(typ)
        p += 8 + n + (n & 1)
    assert p == len(raw), (path, "RIFF chunk mismatch")
    assert b"EXIF" not in chunks and b"XMP " not in chunks, path
    return hashlib.sha256(raw).hexdigest()


def check_assets():
    credits = load("assets/species/credits.json")
    media = load("assets/species/field-guide-media.json")
    knowledge = load("tools/kennisbaseline/knowledge.json")
    official = load("docs/fotokwaliteit/soortaudit-status.json")
    hashes, sources = {}, {}
    for bird_id, info in SPECIES.items():
        record = next(x for x in official["species"] if x["id"] == bird_id)
        assert record["audited"] is False and record["verdict"] == "NOT TESTED"
        assert bird_id not in knowledge, "Full knowledge F2 remains separate"
        hero = credits[bird_id]
        assert hero["nl"] == info["name"] and hero["latin"] == info["latin"]
        assert hero["image"] == info["hero"]
        assert not media["plumage"].get(bird_id), "Do not invent juvenile or sex photos"
        assert not media["heroes"].get(bird_id), "No alternate hero asset"
        poses = media["poses"].get(bird_id, [])
        expected = 1 if bird_id == "sp058" else 0
        assert len(poses) == expected
        files = [hero]
        if bird_id == "sp058":
            pose = poses[0]
            assert pose["image"] == info["pose"]
            assert pose.get("flight") is False and "geen vrije vlucht" in pose["flightReview"]
            assert pose["label"] == "Fladderend bij blad"
            assert "fladderend" in pose["alt"].lower()
            assert "in vlucht" not in pose["alt"].lower()
            assert "fladderend" in pose["visualCheck"].lower()
            assert pose["author"] == "Andrey Gulivanov"
            assert pose["source"].startswith("https://commons.wikimedia.org/wiki/File:")
            files.append(pose)
        for item in files:
            assert item["nl"] == info["name"] and item["latin"] == info["latin"]
            assert all(item.get(k) for k in ("image","source","author","license","licenseUrl","alt"))
            assert item["source"].startswith("https://commons.wikimedia.org/wiki/File:")
            assert item["licenseUrl"].startswith("https://creativecommons.org/licenses/")
            assert item.get("sex") not in ("male","female")
            assert item.get("age") not in ("juvenile",)
            digest = fingerprint(item["image"])
            assert digest not in hashes, ("binary duplicate",item["image"],hashes.get(digest))
            hashes[digest] = item["image"]
            origin = item["source"].rstrip("/").lower()
            assert origin not in sources, ("source reused",item["image"],sources.get(origin))
            sources[origin] = item["image"]
        print(f"M20 {bird_id} MEDIA PASS: {len(files)} distinct local WebP(s), correct source and role")
    assert len(hashes) == len(sources) == 4
    print("M20 FOUR PHOTOS PASS: unique registered local binary/URL, no metadata; exact original-image/derivative licensing OPEN")


def check_real_mobile_browser():
    errors = []
    with Server(("127.0.0.1",0), Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for bird_id,bird in SPECIES.items():
                        context=browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce",service_workers="block"
                        )
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda err:errors.append(str(err)))
                            boot(page,url)
                            open_species(page,bird["name"],bird_id)
                            hero=page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            h=hero.locator("img").evaluate("""async img=>{
                                if (!img.getAttribute('src') && img.dataset.src)
                                    img.src=img.dataset.src;
                                await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert h["ok"] and h["alt"] and h["src"].endswith(bird["hero"]), (bird_id,h)
                            panel=page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            expect(panel.locator("section.sd-flight")).to_have_count(0)
                            if bird["pose"]:
                                pose=panel.locator("section.sd-poses .sd-field-photo img")
                                expect(pose).to_have_count(1)
                                v=pose.evaluate("""async img=>{
                                    img.loading='eager'; await img.decode();
                                    return {ok:img.complete&&img.naturalWidth>0,
                                            src:img.currentSrc,alt:img.alt};
                                }""")
                                assert v["ok"] and v["alt"] and "fladderend" in v["alt"].lower()
                                assert v["src"].endswith(bird["pose"])
                                assert v["src"] != h["src"], (bird_id, "not a duplicate")
                            else:
                                expect(panel.locator("section.sd-poses")).to_have_count(0)
                            if bird["similar"]:
                                assert bird["similar"] in panel.inner_text(), (bird_id, "existing comparison missing")
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (bird_id,width,"horizontal overflow")
                            hero.click()
                            viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors, errors
                            print(f"M20 {bird_id} BROWSER-{width} PASS: decoded hero, true pose roles, zoom/Escape, no fake flight or overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    check_existing_policy_preserved()
    check_f1()
    check_assets()
    check_real_mobile_browser()
    print("M20 technical F1 complete: juvenile policy additive; F2/original pixel/rights/physical device/release NOT TESTED")
