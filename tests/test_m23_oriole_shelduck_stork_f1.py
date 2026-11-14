#!/usr/bin/env python3
"""Birdspot M23 F1 technical checks for 3 species and 8 actual local WebPs.

Checks existing source-to-app roles, duplicate boundaries, browser rendering and
progress. It does NOT certify individual original-photo/JPEG/WebP pixel matching,
copyright/derivative licenses, age or sex beyond source registrations, F2
knowledge, physical device, user data, preview or production.
"""
import hashlib
import json
import threading
from playwright.sync_api import expect, sync_playwright
from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp113": {
        "name": "Wielewaal", "latin": "Oriolus oriolus",
        "hero": "/assets/showcase/sp113.webp",
        "flight": "/assets/species/plumage/sp113-flight.webp",
        "count": 2,
    },
    "sp128": {
        "name": "Bergeend", "latin": "Tadorna tadorna",
        "hero": "/assets/species/sp128.webp",
        "flights": [
            "/assets/species/plumage/sp128-flight.webp",
            "/assets/species/plumage/sp128-female-review.webp",
        ],
        "chick": "/assets/species/plumage/sp128-juv.webp",
        "juvenile": "/assets/species/plumage/sp128-juv-grown.webp",
        "count": 5,
    },
    "sp170": {
        "name": "Ooievaar", "latin": "Ciconia ciconia",
        "hero": "/assets/species/sp170.webp", "count": 1,
    },
}

REPORT = ROOT / "docs/fotokwaliteit/M23_WIELEWAAL_BERGEEND_OOIEVAAR_2026-11-14_DRAFT.md"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check_progress_and_policy():
    canon = read("docs/fotokwaliteit/soortaudit-status.json")
    index = read("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    norm = (ROOT / "docs/BIRDSPOT_KWALITEITSNORM.md").read_text(encoding="utf-8")
    assert len(canon["species"]) == 140
    previously = {x["id"] for x in canon["species"] if x["audited"]}
    pending = {x["id"] for x in canon["species"] if not x["audited"]}
    assert len(previously) == index["_meta"]["baselineAudited"] == 100
    assert len(pending) == index["_meta"]["expectedCanonicalUnreviewed"] == 40
    f1 = index["additionalFirstPass"]
    ids = [x["id"] for x in f1]
    assert len(f1) >= 35 and len(ids) == len(set(ids))
    assert set(ids) <= pending
    assert {x["id"] for x in f1 if x["batch"] == "M23"} == set(BIRDS)
    assert {x["batch"] for x in f1} >= {
        "M12","M13","M14","M15","M16","M17",
        "M18","M19","M20","M21","M22","M23"
    }
    count = len(previously) + len(f1)
    assert count >= 135 and count == index["_meta"]["expectedFirstPass"]
    assert index["_meta"]["expectedRemaining"] == 140 - count
    assert "reverify ALL 140" in index["_meta"]["nextGate"]
    assert {x["id"]: x["photosSeen"] for x in f1 if x["batch"]=="M23"} == {
        sid:b["count"] for sid,b in BIRDS.items()
    }
    for item in f1:
        assert item["status"] == "PARTIALLY TESTED"
        assert item["originalRights"] == "NOT TESTED"
        assert item["independentSexAge"] == "NOT TESTED"
        assert item["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / item["reviewDocument"]).is_file()
    assert REPORT.is_file()
    assert "| Versie | 1.2 · 14-11-2026 |" in norm
    for old_rule in ('- **Klein in beeld mag.**','- **Echte vlucht voor "In vlucht".**',
                     "- **Geen verzonnen geslachtslabels.**",
                     "- **Een ontbrekende positie blijft open.**",
                     "- **Extra foto's mogen**",
                     "- **Gerichte vervanging of aanvulling**",
                     "- **Verbeterwensen registreren.**"):
        assert old_rule in norm
    assert "**Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.**" in norm
    for x in ("1. soortidentiteit;", "2. leeftijd en geslacht",
              "3. werkelijke houding", "4. herkomst en fotograaf;",
              "5. licentie en herpublicatierechten;", "6. voldoende kwaliteit"):
        assert x in norm
    print(f"M23 F1 PASS: {count}/140 initial, {140-count} open, canon 100/140 untouched; all original photo rules retained")


def webp_digest(path):
    raw = (ROOT / path.lstrip("/")).read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", path
    assert int.from_bytes(raw[4:8], "little") + 8 == len(raw), path
    chunks, off = [], 12
    while off + 8 <= len(raw):
        fourcc = raw[off:off+4]
        size = int.from_bytes(raw[off+4:off+8],"little")
        chunks.append(fourcc)
        off += 8 + size + (size & 1)
    assert off == len(raw), path
    assert b"EXIF" not in chunks and b"XMP " not in chunks
    return hashlib.sha256(raw).hexdigest()


def check_local_media():
    credits = read("assets/species/credits.json")
    media = read("assets/species/field-guide-media.json")
    canonical = read("docs/fotokwaliteit/soortaudit-status.json")
    knowledge = read("tools/kennisbaseline/knowledge.json")
    digests, sources = {}, {}
    for sid,bird in BIRDS.items():
        status = next(x for x in canonical["species"] if x["id"]==sid)
        assert not status["audited"] and status["verdict"] == "NOT TESTED"
        assert sid not in knowledge, "F2 knowledge profiles are separate"
        cr = credits[sid]
        assert cr["nl"] == bird["name"] and cr["latin"] == bird["latin"]
        assert cr["image"] == bird["hero"]
        assert not media["heroes"].get(sid)
        assert not media["plumage"].get(sid) or (
            sid == "sp128" and
            media["plumage"][sid]["adult_m"]["reuseGuidePhoto"] is True and
            set(media["plumage"][sid]) == {"adult_m"}
        )
        poses = media["poses"].get(sid, [])
        if sid == "sp113":
            assert len(poses) == 1
            assert cr["sex"] == "male"
            assert poses[0]["image"] == bird["flight"] and poses[0]["flight"] is True
            assert poses[0]["sex"] == "male" and poses[0]["flightReview"].startswith("goedgekeurd")
        elif sid == "sp128":
            assert len(poses) == 4
            assert cr["sex"] == "male"
            assert sum(bool(x.get("flight")) for x in poses) == 2
            man = next(x for x in poses if x.get("flight") and x["image"]==bird["flights"][0])
            female = next(x for x in poses if x.get("flight") and x["image"]==bird["flights"][1])
            assert female["sex"] == "female" and female["flightReview"].startswith("goedgekeurd")
            assert man.get("sex") not in ("male","female")  # do not overstate neutral flight
            chick = next(x for x in poses if x.get("age") == "chick")
            juvenile = next(x for x in poses if x.get("age") == "juvenile")
            assert chick["image"] == bird["chick"] and chick["flight"] is False
            assert juvenile["image"] == bird["juvenile"] and juvenile["flight"] is False
            assert chick["image"] != juvenile["image"]
            assert "Public domain" == chick["license"]
        else:
            assert sid == "sp170"
            assert cr["flight"] is True
            assert poses == [], "Ooievaar hero flight must not be falsely duplicated as another photo"
            assert cr.get("sex") not in ("male","female")
        entries = [cr] + poses
        assert len(entries) == bird["count"]
        for record in entries:
            assert record["nl"] == bird["name"] and record["latin"] == bird["latin"]
            assert all(record.get(k) for k in ("image","author","license","licenseUrl","source","alt"))
            assert record["source"].startswith("https://")
            assert record["licenseUrl"].startswith("https://creativecommons.org/")
            assert record["image"].startswith("/assets/")
            sha = webp_digest(record["image"])
            src = record["source"].rstrip("/").lower()
            assert sha not in digests, ("Duplicate local image binary", sid)
            assert src not in sources, ("Duplicate original source URL", sid)
            digests[sha] = record["image"]
            sources[src] = record["image"]
        print(f"M23 {sid} MEDIA PASS: {len(entries)} different WebPs, correct sex/chick/juvenile/flight roles")
    assert len(digests) == len(sources) == 8
    print("M23 PHOTO PASS: eight genuine unique local WebPs, source registration, metadata-free chunks; origin JPEG/image-rights F2 OPEN")


def browser_checks():
    errors = []
    with Server(("127.0.0.1",0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for sid,bird in BIRDS.items():
                        context=browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce",service_workers="block"
                        )
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda e:errors.append(str(e)))
                            boot(page,url)
                            open_species(page,bird["name"],sid)
                            hero=page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            h=hero.locator("img").evaluate("""async img=>{
                                if(!img.getAttribute('src') && img.dataset.src)img.src=img.dataset.src;
                                await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert h["ok"] and h["alt"] and h["src"].endswith(bird["hero"]), (sid,h)
                            panel=page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            # Never count a source metadata reference as a second image.
                            shown=panel.locator(".sd-field-photo img").evaluate_all(
                                """imgs=>imgs.map(img=>img.currentSrc||img.getAttribute('src'))"""
                            )
                            assert not any(src.endswith(bird["hero"]) for src in shown), (
                                sid, "Duplicate flight/hero photograph visible in gallery"
                            )
                            if sid == "sp113":
                                flights=panel.locator("section.sd-flight .sd-field-photo img")
                                expect(flights).to_have_count(1)
                                f=flights.first.evaluate("""async img=>{
                                    img.loading='eager';await img.decode();
                                    return {ok:img.complete&&img.naturalWidth>0,
                                            src:img.currentSrc,alt:img.alt};
                                }""")
                                assert f["ok"] and f["alt"] and f["src"].endswith(bird["flight"])
                            if sid == "sp128":
                                flights=panel.locator("section.sd-flight .sd-field-photo img")
                                expect(flights).to_have_count(2)
                                observed = flights.evaluate_all("""imgs=>imgs.map(img=>img.getAttribute('src'))""")
                                assert all(any(src.endswith(path) for src in observed) for path in bird["flights"]), (sid,observed)
                                juv=panel.locator(".sd-plumage[data-plumage='juv'] .sd-field-photo img")
                                expect(juv).to_have_count(1)
                                assert juv.get_attribute("src").endswith(bird["juvenile"])
                                poses=panel.locator("section.sd-poses .sd-field-photo img")
                                # Donspulletjes must be discoverable without lying about their age.
                                assert any((src or "").endswith(bird["chick"]) for src in poses.evaluate_all(
                                    """imgs=>imgs.map(img=>img.getAttribute('src'))"""
                                )), (sid,"chick photo missing in behavior section")
                            if sid == "sp170":
                                assert not any(src.endswith(bird["hero"]) for src in shown)
                                print(f"M23 UX sp170 {width}px: only one flight hero, no fabricated distinct flight asset")
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (sid,width,"horizontal overflow")
                            hero.click()
                            dialog=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(dialog).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(dialog).to_have_count(0)
                            assert not errors, errors
                            print(f"M23 {sid} BROWSER-{width} PASS: hero decode, correct roles, zoom/Escape, no duplicate or overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    check_progress_and_policy()
    check_local_media()
    browser_checks()
    print("M23 F1 technical checks complete; no original-image rights, F2, real device, release or production PASS")
