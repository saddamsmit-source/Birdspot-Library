"""Bouwt src/features/home/showcaseData.js uit tools/showcase/species.json + assets/showcase/credits.json.

De bestaande reeks blijft op dezelfde posities. De aanvulling loopt erna per groep.
Een aanvulling heeft altijd een lokaal bestand en individuele credits. CI controleert de uitvoer.
Starten:  python tools/showcase/build.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = ROOT / "tools" / "showcase" / "species.json"
CREDITS = ROOT / "assets" / "showcase" / "credits.json"
OUT = ROOT / "src" / "features" / "home" / "showcaseData.js"


def main():
    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.exists() else {}
    groups = {key: label for key, label, _ in spec["groups"]}
    original = [
        (key, members[index])
        for index in range(max(len(members) for _, _, members in spec["groups"]))
        for key, _, members in spec["groups"]
        if index < len(members)
    ]
    additions = [(member["group"], member) for member in spec.get("extra", [])]
    birds = []
    for key, member in original + additions:
        species_id = member["id"]
        credit = credits.get(species_id, {})
        image = credit.get("image", f"/assets/showcase/{species_id}.webp")
        if not credit or not (ROOT / image.lstrip("/")).is_file():
            if "group" in member:
                raise ValueError(f"Foto of credits ontbreken voor {species_id}")
            continue
        birds.append({
            "id": species_id, "group": key, "groupLabel": groups[key], "nl": member["nl"],
            "latin": member["latin"], "pose": member["pose"], "image": image,
            "width": credit["width"], "height": credit["height"],
            "author": credit["author"], "license": credit["license"], "source": credit["source"],
            "file": credit["file"],
            "modifications": credit.get("modifications", "Verkleind waar nodig en omgezet naar WebP"),
            **{field: member[field] for field in ("info", "focusX") if field in member},
            **({"licenseUrl": credit["licenseUrl"]} if credit.get("licenseUrl") else {}),
        })
    OUT.write_text(
        "/**\n * GEGENEREERD door tools/showcase/build.py — niet met de hand wijzigen.\n"
        " * Diashow: bijzondere Nederlandse soorten met lokale foto's (Wikimedia Commons, maker en licentie per foto).\n */\n"
        f"export const SHOWCASE_GROUPS = Object.freeze({json.dumps(list(groups.items()), ensure_ascii=False)});\n"
        f"export const SHOWCASE_BIRDS = Object.freeze({json.dumps(birds, ensure_ascii=False, indent=1)});\n",
        encoding="utf-8")
    print(f"{len(birds)} vogels in de diashow → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
