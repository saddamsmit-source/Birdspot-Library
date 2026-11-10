"""Beeldinventaris (FQA-01, 10-11-2026): één visuele beeldtypebepaling per geregistreerde gidsfoto, ongeacht metadata.

Waarom: de vluchtcontrole keek alleen naar foto's met flight:true. Een echte vluchtfoto zonder dat label (Buizerd-juveniel,
Bruine Kiekendief-vrouwtje, Ruigpootbuizerd-juveniel) bleef zo onzichtbaar. Deze inventaris legt per bestand vast wat het
beeld werkelijk toont, gekoppeld aan de SHA-1 van het bestand: wijzigt het beeld, dan moet de beoordeling opnieuw.

Bron van de beoordeling:
- foto's in docs/fotokwaliteit/vluchtcontrole.json: de daar vastgelegde klasse (vlucht/bidden/zweven/landen/opvliegen/…);
- alle overige foto's: beeldinspectie op contactsheets (17 vellen à 16 foto's, 330 px) door Claude op 10-11-2026,
  met vergroting bij twijfel; standaardklasse 'stilstaand' (zittend, staand, zwemmend, wadend), afwijkingen hieronder.

Gebruik: python3 -I tools/fotokwaliteit/build_beeldinventaris.py   (herschrijft docs/fotokwaliteit/beeldinventaris.json;
bestaande beoordelingen blijven, alleen nieuwe of gewijzigde bestanden krijgen status 'te beoordelen').
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "fotokwaliteit" / "beeldinventaris.json"
FLIGHT = json.loads((ROOT / "docs" / "fotokwaliteit" / "vluchtcontrole.json").read_text(encoding="utf-8"))["assets"]

# Afwijkingen van 'stilstaand' en kwaliteitspunten uit de contactsheetinspectie van 10-11-2026 (niet-vluchtfoto's).
REVIEW = {
    "/assets/species/plumage/sp006-adult_f.webp": ("vleugels-strekken", "Zit op stronk met gespreide vleugels; geen vlucht.", None),
    "/assets/species/plumage/sp006-hero-male.webp": ("vleugels-strekken", "Zit op stronk met geheven vleugels; geen vlucht.", None),
    "/assets/species/plumage/sp104-jaarling.webp": ("vleugels-strekken", "Staat met gespreide vleugels te drogen; geen vlucht.", None),
    "/assets/species/plumage/sp083-juv.webp": ("stilstaand", "Juvenielen op het nest; één met geheven vleugels, niet vliegend.", None),
    "/assets/species/sp043.webp": ("stilstaand", "Vrouwtje Huismus; sterke groen/gele kleurzweem.", "kwaliteit: kleurzweem"),
    "/assets/species/plumage/sp129-juv.webp": ("stilstaand", "Close-up van een eend in een onnatuurlijke setting (vermoedelijk in de hand).", "REVIEW REQUIRED: setting en leeftijd"),
    "/assets/species/plumage/sp145-juv.webp": ("stilstaand", "Juveniele Goudplevier; tekst van de maker in het beeld.", "kwaliteit: tekst in beeld"),
    "/assets/species/plumage/sp156-juv.webp": ("stilstaand", "Klein en onscherp.", "kwaliteit: onscherp"),
    "/assets/species/plumage/sp206-winter.webp": ("stilstaand", "Vogel zeer klein in beeld.", "kwaliteit: klein in beeld"),
    "/assets/species/plumage/sp249-male-rest.webp": ("stilstaand", "Op de grond; onscherp.", "kwaliteit: onscherp"),
    "/assets/species/plumage/sp288-adult.webp": ("stilstaand", "Vogel klein in beeld.", "kwaliteit: klein in beeld"),
}
AIRBORNE = {"vlucht", "bidden", "zweven"}


def registered():
    """Alle geregistreerde (niet-gearchiveerde) gidsfoto's uit credits.json en field-guide-media.json."""
    imgs = {}
    credits = json.loads((ROOT / "assets/species/credits.json").read_text(encoding="utf-8"))
    for sid, p in credits.items():
        if isinstance(p, dict) and p.get("image"):
            imgs.setdefault(p["image"], []).append(f"{sid} GUIDE_PHOTOS")
    media = json.loads((ROOT / "assets/species/field-guide-media.json").read_text(encoding="utf-8"))
    for sid, cards in media.get("plumage", {}).items():
        for key, p in cards.items():
            if p.get("image"):
                imgs.setdefault(p["image"], []).append(f"{sid} GUIDE_PLUMAGE.{key}")
    for sid, poses in media.get("poses", {}).items():
        for i, p in enumerate(poses):
            if p.get("image"):
                imgs.setdefault(p["image"], []).append(f"{sid} GUIDE_POSES[{i}]")
    for sid, p in media.get("heroes", {}).items():
        if isinstance(p, dict) and p.get("image"):
            imgs.setdefault(p["image"], []).append(f"{sid} GUIDE_HEROES")
    return imgs


def sha1(img):
    return hashlib.sha1((ROOT / img.lstrip("/")).read_bytes()).hexdigest()


def main():
    old = json.loads(OUT.read_text(encoding="utf-8"))["images"] if OUT.exists() else {}
    out = {}
    for img, refs in sorted(registered().items()):
        h = sha1(img)
        if img in FLIGHT:
            f = FLIGHT[img]
            entry = {"class": f["class"], "airborne": f["class"] in AIRBORNE, "source": "vluchtcontrole", "decision": f["decision"],
                     "note": f["reason"][:160]}
        elif img in REVIEW:
            cls, note, flag = REVIEW[img]
            entry = {"class": cls, "airborne": cls in AIRBORNE, "source": "contactsheet 10-11-2026", "note": note}
            if flag:
                entry["flag"] = flag
        else:
            entry = {"class": "stilstaand", "airborne": False, "source": "contactsheet 10-11-2026", "note": ""}
        prev = old.get(img)
        if prev and prev.get("sha1") != h:
            entry = {"class": "te beoordelen", "airborne": None, "source": "bestand gewijzigd sinds beoordeling", "note": ""}
        out[img] = {"refs": refs, "sha1": h, **entry}
    data = {"_meta": {"date": "2026-11-10", "reviewer": "Claude (Opus 5.5) — contactsheets en vergrotingen; geen onafhankelijke certificering",
                      "classes": sorted({e["class"] for e in out.values()}),
                      "rule": "airborne (vlucht/bidden/zweven) ⇔ flight:true in het register; elk getoond beeld heeft een beoordeling met actuele SHA-1."},
            "images": out}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    from collections import Counter
    print(len(out), dict(Counter(e["class"] for e in out.values())))


if __name__ == "__main__":
    main()
