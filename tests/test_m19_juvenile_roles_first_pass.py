#!/usr/bin/env python3
"""M19 F1: three photographed species with juvenile plumage and proportional QA.

A cropped or unseen foot is NOT an automatic defect when relevant juvenile
fieldmarks are visible and original identity/age/rights are verified. This test
only proves local assets, registers and browser behavior, not those legal,
original-image or biological facts. See Birdspot quality norm §3.2/3.3.
"""
import hashlib
import json
import threading
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

from test_pilot_offline_new_sighting import ROOT, Quiet, Server, boot
from test_plumage_compare_layout import open_species

BIRDS = {
    "sp019": {"nl": "Groene Specht", "latin": "Picus viridis",
              "hero": "/assets/species/plumage/sp019-hero-male.webp",
              "juv": "/assets/species/plumage/sp019-juv.webp",
              "flight": "/assets/species/plumage/sp019-flight.webp",
              "similar": "Zwarte Specht", "unique_count": 5},
    "sp085": {"nl": "Kwak", "latin": "Nycticorax nycticorax",
              "hero": "/assets/showcase/sp085.webp",
              "juv": "/assets/species/plumage/sp085-juv.webp",
              "flight": "/assets/species/plumage/sp085-flight.webp",
              "similar": "Blauwe Reiger", "unique_count": 3},
    "sp245": {"nl": "Koereiger", "latin": "Bubulcus ibis",
              "hero": "/assets/species/sp245.webp",
              "juv": "/assets/species/plumage/sp245-juv.webp",
              "flight": "/assets/species/plumage/sp245-flight.webp",
              "similar": "Kleine Zilverreiger", "unique_count": 5},
}
REPORT = ROOT / "docs/fotokwaliteit/M19_DRIE_JUVENIELEN_EN_FOTOKWALITEIT_2026-11-13_DRAFT.md"


def read(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def test_policy_and_progress():
    norm = (ROOT / "docs/BIRDSPOT_KWALITEITSNORM.md").read_text(encoding="utf-8")
    assert "Versie | 1.1 · 13-11-2026" in norm
    assert "pootzichtbaarheid" not in norm.lower() or "pootzichtbaarheid is geen" in norm.lower()
    assert "**Specifiek bij een juveniel mogen de poten ontbreken**" in norm
    assert "**Ontbrekende poten zijn op zichzelf nooit een afkeur- of stopreden.**" in norm
    assert "oorspronkelijke individuele foto" in norm
    assert "PARTIALLY TESTED / open" in norm
    assert "afwezig" not in REPORT.read_text(encoding="utf-8").split("## 1.")[0].lower()

    # Synthetic decision CONTRACT only: this does NOT adjudicate any bird.
    # Feet are intentionally not an input to the decision.
    def eligible_for_new_publication(visible_diagnostic, age_source_verified, rights_verified, local_image_matched):
        return all((visible_diagnostic, age_source_verified, rights_verified, local_image_matched))
    assert eligible_for_new_publication(True, True, True, True)  # even with feet absent
    assert not eligible_for_new_publication(False, True, True, True)
    assert not eligible_for_new_publication(True, False, True, True)
    assert not eligible_for_new_publication(True, True, False, True)
    assert not eligible_for_new_publication(True, True, True, False)
    print("M19 POLICY-ONLY PASS: feet are not mandatory; age, visibility, verified source/rights and original match remain mandatory")

    canon = read("docs/fotokwaliteit/soortaudit-status.json")
    f1 = read("docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json")
    assert len(canon["species"]) == 140
    audited = {x["id"] for x in canon["species"] if x["audited"]}
    pending = {x["id"] for x in canon["species"] if not x["audited"]}
    assert len(audited) == f1["_meta"]["baselineAudited"] == 100
    assert len(pending) == f1["_meta"]["expectedCanonicalUnreviewed"] == 40
    entries = f1["additionalFirstPass"]
    ids = [x["id"] for x in entries]
    assert len(entries) >= 23 and len(set(ids)) == len(ids)
    assert set(ids) <= pending
    assert {x["id"] for x in entries if x["batch"] == "M19"} == set(BIRDS)
    assert {x["batch"] for x in entries} >= {"M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19"}
    total = len(audited) + len(entries)
    assert total >= 123 and total == f1["_meta"]["expectedFirstPass"]
    assert f1["_meta"]["expectedRemaining"] == 140-total
    assert "reverify ALL 140" in f1["_meta"]["nextGate"]
    assert REPORT.is_file()
    for e in entries:
        assert e["status"] == "PARTIALLY TESTED"
        assert e["originalRights"] == "NOT TESTED"
        assert e["independentSexAge"] == "NOT TESTED"
        assert e["fullKnowledgeReview"] == "NOT TESTED"
        assert (ROOT/e["reviewDocument"]).is_file()
    assert {x["id"]:x["photosSeen"] for x in entries if x["batch"]=="M19"} == {
        k:v["unique_count"] for k,v in BIRDS.items()}
    print(f"M19 F1 PASS: {total}/140 initial reviews, {140-total} remaining; 100 canonical audits not promoted")


def webp_digest(path):
    file = ROOT/path.lstrip("/")
    content = file.read_bytes()
    assert content[:4] == b"RIFF" and content[8:12] == b"WEBP", path
    assert int.from_bytes(content[4:8],"little")+8 == len(content), path
    chunks,offset=[],12
    while offset+8 <= len(content):
        kind=content[offset:offset+4]
        size=int.from_bytes(content[offset+4:offset+8],"little")
        chunks.append(kind)
        offset+=8+size+(size&1)
    assert offset == len(content), path
    assert b"EXIF" not in chunks and b"XMP " not in chunks, path
    return hashlib.sha256(content).hexdigest()


def test_real_registered_media():
    credits=read("assets/species/credits.json")
    media=read("assets/species/field-guide-media.json")
    knowledge=read("tools/kennisbaseline/knowledge.json")
    canonical=read("docs/fotokwaliteit/soortaudit-status.json")
    by_path={}
    by_source={}
    for sid,bird in BIRDS.items():
        entry=next(x for x in canonical["species"] if x["id"]==sid)
        assert not entry["audited"] and entry["verdict"]=="NOT TESTED"
        assert sid not in knowledge, "F2 knowledge is a separate review"
        assert credits[sid]["nl"]==bird["nl"] and credits[sid]["latin"]==bird["latin"]
        assert media["plumage"][sid]["juv"]["image"]==bird["juv"]
        assert media["plumage"][sid]["juv"].get("sex") not in ("male","female")
        if sid=="sp019":
            assert media["heroes"][sid]==bird["hero"]
            assert media["plumage"][sid]["adult_f"]["sex"]=="female"
            assert media["plumage"][sid]["adult_m"]["reuseGuidePhoto"] is True
        elif sid=="sp085":
            assert media["plumage"][sid]["adult_m"]["reuseGuidePhoto"] is True
        else:
            assert media["plumage"][sid]["adult_m"]["reuseGuidePhoto"] is True
            assert {"breeding","winter","juv","adult_m"} <= set(media["plumage"][sid])

        entries=[credits[sid]]
        entries.extend(
            item for item in media["plumage"][sid].values()
            if isinstance(item,dict) and item.get("image")
        )
        entries.extend(media["poses"].get(sid,[]))
        files={}
        for item in entries:
            photo=item.get("image")
            if not photo:
                continue
            assert item["nl"]==bird["nl"] and item["latin"]==bird["latin"]
            assert all(item.get(k) for k in ("image","source","author","license","licenseUrl","alt"))
            assert item["source"].startswith("https://")
            assert item["licenseUrl"].startswith("https://")
            if photo in files:
                # Exactly one recorded source can appear twice as a reference:
                # sp019.webp in both credits and one pose. Never count it twice.
                assert sid=="sp019" and photo=="/assets/species/sp019.webp"
                assert item["source"]==files[photo]["source"]
            else:
                files[photo]=item
        assert len(files)==bird["unique_count"], (sid, files.keys())

        for path,item in files.items():
            digest=webp_digest(path)
            assert digest not in by_path, ("Duplicated image bytes across 3 species",path,by_path.get(digest))
            by_path[digest]=path
            source=item["source"].lower().rstrip("/")
            assert source not in by_source, ("Same original photo source reused",sid,path,by_source.get(source))
            by_source[source]=(sid,path)

        flights=[p for p in media["poses"].get(sid,[]) if p.get("flight")]
        assert len(flights)==1
        assert flights[0]["image"]==bird["flight"]
        assert flights[0]["flightReview"]
        assert bird["hero"] != bird["juv"] != bird["flight"]
        print(f"M19 {sid} MEDIA PASS: {len(files)} unique local source-linked WebPs, separate juveniel and flight")
    assert len(by_path)==len(by_source)==sum(x["unique_count"] for x in BIRDS.values())==13
    gp=media["plumage"]["sp019"]["juv"]
    assert gp["author"]=="Hans Hillewaert" and gp["license"]=="CC BY-SA 3.0"
    assert gp["source"].endswith("Picus_viridis_(juvenile).jpg")
    assert media["plumage"]["sp085"]["juv"]["author"]=="Matteo Sorrentino"
    assert media["plumage"]["sp245"]["juv"]["source"]=="https://www.inaturalist.org/photos/113155242"
    # The following are registered metadata, NOT proofs of current origin rights.
    print("M19 MEDIA PASS: 13 valid unique WebPs; original exact-image and all licenses remain F2 NOT TESTED")


def test_actual_mobile_cards():
    errors=[]
    with Server(("127.0.0.1",0),Quiet) as server:
        threading.Thread(target=server.serve_forever,daemon=True).start()
        url=f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            try:
                for width in (360,390):
                    for sid,bird in BIRDS.items():
                        context=browser.new_context(viewport={"width":width,"height":844},
                                                    reduced_motion="reduce",service_workers="block")
                        try:
                            page=context.new_page()
                            page.on("pageerror",lambda e:errors.append(str(e)))
                            boot(page,url)
                            open_species(page,bird["nl"],sid)
                            hero=page.locator("button.sd-hero-photo").first
                            expect(hero).to_have_count(1)
                            hero.scroll_into_view_if_needed()
                            img=hero.locator("img").evaluate("""async img=>{
                                if (!img.getAttribute('src') && img.dataset.src) img.src=img.dataset.src;
                                await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert img["ok"] and img["alt"] and img["src"].endswith(bird["hero"]),(sid,"hero",img)
                            panel=page.locator("#sdPanel-herkenning")
                            expect(panel).to_have_count(1)
                            juv=panel.locator(".sd-plumage[data-plumage='juv'] .sd-field-photo img")
                            expect(juv).to_have_count(1)
                            actual=juv.evaluate("""async img=>{
                                img.loading='eager';await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert actual["ok"] and actual["alt"] and actual["src"].endswith(bird["juv"]), (sid,"juv",actual)
                            flight=panel.locator("section.sd-flight .sd-field-photo img")
                            expect(flight).to_have_count(1)
                            f=flight.evaluate("""async img=>{
                                img.loading='eager';await img.decode();
                                return {ok:img.complete&&img.naturalWidth>0,
                                        src:img.currentSrc,alt:img.alt};
                            }""")
                            assert f["ok"] and f["alt"] and f["src"].endswith(bird["flight"]), (sid,"flight",f)
                            assert len({img["src"],actual["src"],f["src"]})==3
                            if sid=="sp085":
                                # Current intentional design suppresses juvenile-to-juvenile
                                # comparisons to keep the screen compact. The original
                                # Kwak/Blauwe-Reiger comparison must remain in source;
                                # it is not proof of a visible comparison card.
                                comparison_source = (ROOT / "src/features/species/guideComparisons.js").read_text(encoding="utf-8")
                                renderer = (ROOT / "src/features/species/detailSections.js").read_text(encoding="utf-8")
                                assert "Kwak en Blauwe Reiger · jonge vogels" in comparison_source
                                assert "if (focal.plumage === 'juv' && partner.plumage === 'juv') continue;" in renderer
                                visibly_compared = "Blauwe Reiger" in panel.inner_text()
                                print(f"M19 UX-OBSERVED sp085 {width}px: juvenile pair preserved in source; visible card={visibly_compared} under intentional suppression")
                            else:
                                assert bird["similar"] in panel.inner_text(), (sid,"visible comparison missing")
                            assert not page.evaluate(
                                "document.documentElement.scrollWidth > innerWidth + 2"
                            ), (sid,width,"horizontal overflow")
                            # Zoom a real juvenile photo, not just the hero.
                            button=juv.locator("xpath=ancestor::button[@data-guide-image]")
                            expect(button).to_have_count(1)
                            button.click()
                            viewer=page.get_by_role("dialog",name="Vogelfoto bekijken")
                            expect(viewer).to_have_count(1)
                            page.keyboard.press("Escape")
                            expect(viewer).to_have_count(0)
                            assert not errors, errors
                            print(f"M19 {sid} BROWSER-{width} PASS: decoded hero, juvenile and separate real flight, role source and zoom; no overflow")
                        finally:
                            context.close()
            finally:
                browser.close()
        server.shutdown()


if __name__ == "__main__":
    test_policy_and_progress()
    test_real_registered_media()
    test_actual_mobile_cards()
    print("M19 F1 technical QA complete; no original-image rights, all juvenile ages, physical Android or live PASS")
