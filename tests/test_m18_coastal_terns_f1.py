#!/usr/bin/env python3
"""M18 first-pass F1 QA. Three actual existing WebPs; source and mobile UI.

NO independent original-JPEG/pixel/license, individual age/sex, complete F2,
Android device or production release proof can be derived from this test.
"""
import hashlib
import json
import threading
from playwright.sync_api import expect, sync_playwright

from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp153": {
        "nl": "Bonte Strandloper",
        "latin": "Calidris alpina",
        "hero": "/assets/species/sp153.webp",
        "flightHero": False,
        "similar": "Drieteenstrandloper",
    },
    "sp166": {
        "nl": "Noordse Stern",
        "latin": "Sterna paradisaea",
        "hero": "/assets/species/plumage/sp166-adult.webp",
        "flightHero": True,
        "similar": "Visdief",
    },
    "sp167": {
        "nl": "Grote Stern",
        "latin": "Thalasseus sandvicensis",
        "hero": "/assets/species/plumage/sp167-adult.webp",
        "flightHero": True,
        "similar": "Visdief",
    },
}
REPORT = ROOT / "docs/fotokwaliteit/M18_STRANDLOPER_STERNS_2026-11-13_DRAFT.md"


def data(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def check_f1():
    official = data("docs/fotokwaliteit/soortaudit-status.json")
    ledger = data("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    rows = official["species"]
    assert len(rows) == 140
    audited = {x["id"] for x in rows if x["audited"]}
    pending = {x["id"] for x in rows if not x["audited"]}
    assert len(audited) == ledger["_meta"]["baselineAudited"] == 100
    assert len(pending) == ledger["_meta"]["expectedCanonicalUnreviewed"] == 40
    entries = ledger["additionalFirstPass"]
    ids = [x["id"] for x in entries]
    assert len(entries) >= 20 and len(ids) == len(set(ids))
    assert set(ids) <= pending
    assert {x["id"] for x in entries if x["batch"] == "M18"} == set(BIRDS)
    assert {x["batch"] for x in entries} >= {"M12","M13","M14","M15","M16","M17","M18"}
    reviewed = len(audited) + len(entries)
    assert reviewed >= 120 and reviewed == ledger["_meta"]["expectedFirstPass"]
    assert ledger["_meta"]["expectedRemaining"] == 140 - reviewed
    assert "reverify ALL 140" in ledger["_meta"]["nextGate"]
    for x in entries:
        assert x["status"] == "PARTIALLY TESTED"
        assert x["originalRights"] == "NOT TESTED"
        assert x["independentSexAge"] == "NOT TESTED"
        assert x["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT / x["reviewDocument"]).is_file()
    assert REPORT.is_file()
    print(f"M18 F1 PASS: 100 canonical + {len(entries)} supplemental = {reviewed}/140, {140-reviewed} open")


def webp_hash(relative):
    raw = (ROOT / relative.lstrip("/")).read_bytes()
    assert raw[:4] == b"RIFF" and raw[8:12] == b"WEBP", relative
    assert int.from_bytes(raw[4:8],"little") + 8 == len(raw), relative
    parts, i = [], 12
    while i + 8 <= len(raw):
        code = raw[i:i+4]
        n = int.from_bytes(raw[i+4:i+8],"little")
        parts.append(code)
        i += 8 + n + (n & 1)
    assert i == len(raw), relative
    assert b"EXIF" not in parts and b"XMP " not in parts, relative
    return hashlib.sha256(raw).hexdigest()


def check_images_and_roles():
    credits = data("assets/species/credits.json")
    media = data("assets/species/field-guide-media.json")
    knowledge = data("tools/kennisbaseline/knowledge.json")
    official = data("docs/fotokwaliteit/soortaudit-status.json")
    digests, sources = set(), set()
    for sid, bird in BIRDS.items():
        row = next(x for x in official["species"] if x["id"] == sid)
        assert row["audited"] is False and row["verdict"] == "NOT TESTED"
        assert sid not in knowledge, "Full F2 knowledge profiles not yet written"
        if bird["flightHero"]:
            assert sid not in credits, "Both terns have one registered hero image, not a second file"
            assert media["heroes"][sid] == bird["hero"]
            item = media["plumage"][sid]["breeding"]
            assert item["flight"] is True and item["flightReview"]
            assert set(media["plumage"][sid]) == {"breeding"}
            assert not media["poses"].get(sid), "No second independent flight photo"
        else:
            assert sid in credits
            item = credits[sid]
            assert not media["plumage"].get(sid)
            assert not media["poses"].get(sid)
        assert item["image"] == bird["hero"]
        assert item["nl"] == bird["nl"] and item["latin"] == bird["latin"]
        assert all(item.get(k) for k in ("author", "source", "license", "licenseUrl", "alt"))
        assert item["source"].startswith("https://commons.wikimedia.org/wiki/File:")
        assert item["license"].startswith("CC BY-SA ")
        assert item.get("sex") not in ("male", "female")
        assert item.get("age") != "juvenile"
        digest = webp_hash(item["image"])
        source = item["source"].lower().rstrip("/")
        assert digest not in digests and source not in sources
        digests.add(digest)
        sources.add(source)
        print(f"M18 {sid} PHOTO PASS: 1 true WebP; flight-as-hero={bird['flightHero']} without invented second asset")
    assert len(digests) == len(sources) == 3
    print("M18 ASSETS PASS: 3 distinct binaries and 3 registered original URLs; actual original pixel comparison OPEN")


def browser():
    errors=[]
    with Server(("127.0.0.1",0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for sid,bird in BIRDS.items():
                        context=browser.new_context(
                            viewport={"width":width,"height":844},
                            reduced_motion="reduce",
                            service_workers="block"
                        )
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda e:errors.append(str(e)))
                            boot(page,url)
                            open_species(page,bird["nl"],sid)
                            hero=page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            h=hero.locator("img").evaluate("""async img=>{
                                if (!img.getAttribute('src') && img.dataset.src)
                                    img.src=img.dataset.src;
                                await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc, alt:img.alt};
                            }""")
                            assert h["ok"] and h["alt"] and h["src"].endswith(bird["hero"]), (sid,h)
                            panel=page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            assert bird["similar"] in panel.inner_text(), (sid,"comparison missing")
                            # A flight-as-hero must not be duplicated as a second
                            # file in the same species' plumage/flight galleries.
                            own_repeat=panel.locator(".sd-field-photo img").evaluate_all(
                                """(imgs,path)=>imgs.filter(x=>
                                  (x.currentSrc||x.getAttribute('src')||'').endsWith(path)).length""",
                                bird["hero"]
                            )
                            assert own_repeat == 0, (sid,"same photo rendered twice",own_repeat)
                            flight_panels=panel.locator("section.sd-flight").count()
                            assert flight_panels <= 1, (sid,"duplicate flight sections")
                            if bird["flightHero"]:
                                print(f"M18 UX-OBSERVED {sid} {width}px: hero is real flight; separate flight section={flight_panels}")
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (sid,width,"horizontal overflow")
                            hero.click()
                            viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors,errors
                            print(f"M18 {sid} BROWSER-{width} PASS: true hero, comparison, zoom, no duplicate image/overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__=="__main__":
    check_f1()
    check_images_and_roles()
    browser()
    print("M18 first-pass browser/assets done; source rights/age/complete F2/device/publication still open")
