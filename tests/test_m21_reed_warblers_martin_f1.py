#!/usr/bin/env python3
"""M21 initial F1 QA, six real bird images, exact roles and browser behavior.

This does NOT certify the original JPEG↔WebP pixel match, complete derivative
licenses, individual sex/age, full knowledge review, Android device or release.
"""
import hashlib
import json
import threading

from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp108": {
        "name": "Grote Karekiet", "latin": "Acrocephalus arundinaceus",
        "hero": "/assets/showcase/sp108.webp",
        "other": "/assets/species/plumage/sp108-flight.webp",
        "role": "conditional_flight", "similar": None,
    },
    "sp110": {
        "name": "Rietzanger", "latin": "Acrocephalus schoenobaenus",
        "hero": "/assets/species/sp110.webp",
        "other": "/assets/species/plumage/sp110-flight.webp",
        "role": "takeoff_pose", "similar": None,
    },
    "sp116": {
        "name": "Oeverzwaluw", "latin": "Riparia riparia",
        "hero": "/assets/species/plumage/sp116-flight.webp",
        "other": "/assets/species/plumage/sp116-nestwand.webp",
        "role": "flight_is_hero", "similar": "Huiszwaluw",
    },
}
REPORT = ROOT / "docs/fotokwaliteit/M21_RIETVOGELS_OEVERZWALUW_2026-11-14_DRAFT.md"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check_f1_and_original_rules():
    canon = read("docs/fotokwaliteit/soortaudit-status.json")
    ledger = read("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    norm = (ROOT / "docs/BIRDSPOT_KWALITEITSNORM.md").read_text(encoding="utf-8")
    assert "| Versie | 1.2 · 14-11-2026 |" in norm
    assert "**Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.**" in norm
    for prior in ('- **Klein in beeld mag.**',
                  '- **Echte vlucht voor "In vlucht".**',
                  '- **Geen verzonnen geslachtslabels.**',
                  '- **Een ontbrekende positie blijft open.**',
                  "- **Extra foto's mogen**",
                  "- **Gerichte vervanging of aanvulling**",
                  "- **Verbeterwensen registreren.**"):
        assert prior in norm, ("Original rule removed", prior)
    for required in ("1. soortidentiteit;","2. leeftijd en geslacht","3. werkelijke houding",
                     "4. herkomst en fotograaf;","5. licentie en herpublicatierechten;",
                     "6. voldoende kwaliteit"):
        assert required in norm
    assert len(canon["species"]) == 140
    audited = {x["id"] for x in canon["species"] if x["audited"]}
    pending = {x["id"] for x in canon["species"] if not x["audited"]}
    assert len(audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(pending) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    added = ledger["additionalFirstPass"]
    ids = [x["id"] for x in added]
    assert len(added) >= 29 and len(ids) == len(set(ids))
    assert set(ids) <= pending
    assert {x["id"] for x in added if x["batch"] == "M21"} == set(BIRDS)
    assert {x["batch"] for x in added} >= {
        "M12","M13","M14","M15","M16","M17","M18","M19","M20","M21"
    }
    count = len(audited) + len(added)
    assert count >= 129 and count == ledger["_meta"]["expectedFirstPass"]
    assert ledger["_meta"]["expectedRemaining"] == 140 - count
    assert "reverify ALL 140" in ledger["_meta"]["nextGate"]
    for x in added:
        assert x["status"] == "PARTIALLY TESTED"
        assert x["originalRights"] == "NOT TESTED"
        assert x["independentSexAge"] == "NOT TESTED"
        assert x["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / x["reviewDocument"]).exists()
    assert REPORT.is_file()
    assert {x["id"]: x["photosSeen"] for x in added if x["batch"] == "M21"} == {
        "sp108":2,"sp110":2,"sp116":2
    }
    print(f"M21 F1 PASS: {count}/140 initial reviews, {140-count} remaining; official 9-point audit still 100/140")


def webp_sha(path):
    blob = (ROOT / path.lstrip("/")).read_bytes()
    assert blob[:4] == b"RIFF" and blob[8:12] == b"WEBP", path
    assert int.from_bytes(blob[4:8], "little") + 8 == len(blob), path
    codes, p = [], 12
    while p + 8 <= len(blob):
        code, length = blob[p:p+4], int.from_bytes(blob[p+4:p+8],"little")
        codes.append(code)
        p += 8 + length + (length & 1)
    assert p == len(blob), path
    assert b"EXIF" not in codes and b"XMP " not in codes
    return hashlib.sha256(blob).hexdigest()


def check_registered_six_local_images():
    credits = read("assets/species/credits.json")
    media = read("assets/species/field-guide-media.json")
    knowledge = read("tools/kennisbaseline/knowledge.json")
    canon = read("docs/fotokwaliteit/soortaudit-status.json")
    hashes = set()
    sources = set()
    for sid,bird in BIRDS.items():
        c = next(x for x in canon["species"] if x["id"] == sid)
        assert c["audited"] is False and c["verdict"] == "NOT TESTED"
        assert sid not in knowledge, "Full F2 knowledge profile is still open"
        poses = media["poses"][sid]
        assert len(poses) == (2 if sid == "sp116" else 1)
        assert not media["plumage"].get(sid), "No invented age/sex photo"
        if sid == "sp116":
            assert sid not in credits
            assert media["heroes"][sid] == bird["hero"]
            assert sum(bool(x.get("flight")) for x in poses) == 1
            flight = next(x for x in poses if x.get("flight"))
            nest = next(x for x in poses if not x.get("flight"))
            assert flight["image"] == bird["hero"] and flight["flightReview"].startswith("goedgekeurd")
            assert nest["image"] == bird["other"] and nest["label"] == "Bij de nestwand"
            records = [flight,nest]
        else:
            assert credits[sid]["image"] == bird["hero"]
            assert not media["heroes"].get(sid)
            pose = poses[0]
            assert pose["image"] == bird["other"]
            if sid == "sp108":
                assert pose["flight"] is True
                assert "voorwaardelijk" in pose["flightReview"]
                assert "Vervanging gewenst" in pose["flightReview"]
                assert pose["source"] == "https://www.inaturalist.org/photos/747529794"
            else:
                assert pose["flight"] is False
                assert "niet vrij in de lucht" in pose["flightReview"]
                assert "opvliegend" in pose["alt"].lower()
                assert "opvliegend" in pose["visualCheck"].lower()
                assert "vrije vlucht" not in pose["alt"].lower()
            records = [credits[sid],pose]

        for item in records:
            assert item["image"].startswith("/assets/")
            assert item["nl"] == bird["name"] and item["latin"] == bird["latin"]
            assert all(item.get(k) for k in ("source","author","license","licenseUrl","image","alt"))
            assert item["source"].startswith("https://")
            assert item["licenseUrl"].startswith("https://creativecommons.org/licenses/")
            assert item.get("sex") not in ("male","female")
            assert item.get("age") != "juvenile"
            digest = webp_sha(item["image"])
            source = item["source"].lower().rstrip("/")
            assert digest not in hashes, (sid, "reused binary", item["image"])
            assert source not in sources, (sid, "reused source", item["source"])
            hashes.add(digest)
            sources.add(source)
        print(f"M21 {sid} MEDIA PASS: 2 distinct local WebPs, roles={bird['role']}")
    assert len(hashes) == len(sources) == 6
    print("M21 MEDIA PASS: six actual unique local WebPs, no top-level EXIF/XMP; original-JPEG-to-WebP match NOT PROVEN")


def browser_test():
    errors = []
    with Server(("127.0.0.1",0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for sid,bird in BIRDS.items():
                        context=browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce",service_workers="block"
                        )
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda err:errors.append(str(err)))
                            boot(page,url)
                            open_species(page,bird["name"],sid)
                            hero=page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            h=hero.locator("img").evaluate("""async img=>{
                                if (!img.getAttribute('src') && img.dataset.src) img.src=img.dataset.src;
                                await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert h["ok"] and h["alt"] and h["src"].endswith(bird["hero"]), (sid,h)
                            panel=page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            other = panel.locator("section.sd-flight .sd-field-photo img") if sid=="sp108" else panel.locator("section.sd-poses .sd-field-photo img")
                            expect(other).to_have_count(1)
                            o=other.evaluate("""async img=>{
                                img.loading='eager';await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert o["ok"] and o["alt"] and o["src"].endswith(bird["other"]), (sid,o)
                            assert o["src"] != h["src"]
                            if sid=="sp110":
                                expect(panel.locator("section.sd-flight")).to_have_count(0)
                                assert "opvliegend" in o["alt"].lower()
                            if sid=="sp116":
                                # A flight that is already the hero may NOT be displayed as a
                                # second independent image, regardless of section CSS.
                                repeated=panel.locator(".sd-field-photo img").evaluate_all(
                                    """(imgs,path)=>imgs.filter(img=>
                                       (img.currentSrc||img.getAttribute('src')||'').endsWith(path)).length""",
                                    bird["hero"])
                                assert repeated == 0, (sid,"hero reused in gallery",repeated)
                                assert bird["similar"] in panel.inner_text(), (sid,"comparison lost")
                                print(f"M21 UX-OBSERVED sp116 {width}px: real flight is hero, no duplicate flight card")
                            if sid=="sp108":
                                assert "In vlucht" in panel.inner_text()
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (sid,width,"horizontal overflow")
                            hero.click()
                            modal=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(modal).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(modal).to_have_count(0)
                            assert not errors, errors
                            print(f"M21 {sid} {width}px BROWSER PASS: decoded hero/second photo, true roles, zoom/Escape, no overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    check_f1_and_original_rules()
    check_registered_six_local_images()
    browser_test()
    print("M21 F1 technical tests done; independent complete rights, age/sex, F2, device, release NOT TESTED")
