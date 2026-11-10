"""Past de strenge vluchtcontrole (docs/fotokwaliteit/vluchtcontrole.json) toe op assets/species/field-guide-media.json.

- uit-rol  -> flight=false, nieuw label/notitie, reden in `flightReview`. Het asset blijft op de kaart:
              met geslacht/leeftijd in de kleedkaart, anders onder "Overige herkenningsfoto's".
- archief  -> verwijderd uit `poses`/`plumage` en met volledige herkomst bewaard onder `retired[<id>]`
              (niet getoond, niet gecachet; het bestand blijft in de repo).
- goedgekeurd/voorwaardelijk -> geen wijziging in de getoonde rol; uitslag in `flightReview`.
Idempotent. Draai daarna tools/species/build.py.
Gebruik: python3 -I tools/fotokwaliteit/apply_flight_review.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REVIEW = ROOT / "docs" / "fotokwaliteit" / "vluchtcontrole.json"
MEDIA = ROOT / "assets" / "species" / "field-guide-media.json"


def main():
    review = json.loads(REVIEW.read_text(encoding="utf-8"))
    media = json.loads(MEDIA.read_text(encoding="utf-8"))
    date = review["_meta"]["date"]
    retired = media.setdefault("retired", {})
    changed = {"uit-rol": 0, "archief": 0, "gemarkeerd": 0}
    for image, r in review["assets"].items():
        tag = f"{r['decision']} {date}: {r['reason']}"
        hit = None
        for sid, cards in media["plumage"].items():
            for key, p in cards.items():
                if p.get("image") == image:
                    hit = ("plumage", sid, key, p)
        for sid, poses in media["poses"].items():
            for i, p in enumerate(poses):
                if p.get("image") == image:
                    hit = ("poses", sid, i, p)
        if hit is None:
            if any(p.get("image") == image for lst in retired.values() for p in lst):
                continue  # al gearchiveerd
            # Hoofdfoto's uit credits.json (GUIDE_PHOTOS) worden hier niet gewijzigd.
            continue
        sec, sid, key, p = hit
        p["flightReview"] = tag
        if r["decision"] == "uit-rol":
            p["flight"] = False
            p["label"] = r["newLabel"]
            if r.get("newNote"):
                p["note"] = r["newNote"]
            changed["uit-rol"] += 1
        elif r["decision"] == "archief":
            entry = dict(p, retiredOn=date, retiredReason=r["reason"], retiredFrom=f"{sec}.{sid}.{key}")
            retired.setdefault(sid, []).append(entry)
            if sec == "poses":
                media["poses"][sid].pop(key)
                if not media["poses"][sid]:
                    del media["poses"][sid]
            else:
                del media["plumage"][sid][key]
            changed["archief"] += 1
        else:
            changed["gemarkeerd"] += 1
    MEDIA.write_text(json.dumps(media, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(changed)


if __name__ == "__main__":
    main()
