"""Bouwt src/data/speciesLife.js uit tools/species/species_life.json (idempotent).

Bron per soort: broedperiode, nest, eieren, broedduur, nestjongen, broedsels, voedsel, gedrag, trek, zang/roep.
Nooit met de hand in speciesLife.js werken; pas de JSON aan en draai:  python tools/species/build_life.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "tools" / "species" / "species_life.json"
OUT = ROOT / "src" / "data" / "speciesLife.js"
BREED = ("period", "nest", "eggs", "incubation", "fledging", "broods")
MONTH_KEYS = frozenset("jan feb mrt apr mei jun jul aug sep okt nov dec".split())


def calendar_months(entry):
    if entry.get("months"):
        return entry["months"]
    # Gebruik alleen eenduidige bereiken. Tekst zoals "Vanaf eind april"
    # heeft een expliciet ingevulde eindmaand nodig.
    endpoints = [part.strip() for part in entry["period"].lower().replace("–", "-").split("-")]
    if len(endpoints) == 2 and all(month in MONTH_KEYS for month in endpoints):
        return "-".join(endpoints)
    return None


def main():
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    life = {}
    for sid, e in raw.items():
        if sid.startswith("_"):
            continue
        breeding = {k: e[k] for k in BREED} if e.get("period") else None
        if breeding:
            if e.get("fledgingLabel"):
                breeding["fledgingLabel"] = e["fledgingLabel"]
            months = calendar_months(e)
            if months:
                breeding["months"] = months
        life[sid] = {"breeding": breeding, "diet": e["diet"], "behaviour": e["behaviour"],
                     "migration": e["migration"], "voice": e["voice"]}
    body = json.dumps(life, ensure_ascii=False, indent=1)
    OUT.write_text(
        "/**\n * Birdspot Library — leefwijze per soort (H3): broeden, voedsel, gedrag, trek, zang en roep.\n"
        " * GEGENEREERD door tools/species/build_life.py uit tools/species/species_life.json — niet met de hand wijzigen.\n"
        f" * {raw.get('_bron', '')}\n */\n"
        f"export const LIFE = Object.freeze({body});\n", encoding="utf-8")
    print(f"{len(life)} soorten → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
