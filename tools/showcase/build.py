"""Bouwt src/features/home/showcaseData.js uit tools/showcase/species.json + assets/showcase/credits.json.

Volgorde: eerst de eerste soort van elke groep, dan de tweede, zodat opeenvolgende foto's uit een andere groep komen.
Alleen soorten met een opgeslagen foto komen in de diashow. Idempotent; CI controleert dit.
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
    groups = [(key, label) for key, label, _ in spec["groups"]]
    birds = []
    for round_ in range(max(len(b) for _, _, b in spec["groups"])):
        for key, label, members in spec["groups"]:
            if round_ >= len(members):
                continue
            sid, nl, latin, pose, *_ = members[round_]
            c = credits.get(sid)
            if not c or not (ROOT / "assets" / "showcase" / f"{sid}.webp").exists():
                continue
            birds.append({"id": sid, "group": key, "groupLabel": label, "nl": nl, "latin": latin, "pose": pose,
                          "image": f"/assets/showcase/{sid}.webp", "width": c["width"], "height": c["height"],
                          "author": c["author"], "license": c["license"], "source": c["source"]})
    OUT.write_text(
        "/**\n * GEGENEREERD door tools/showcase/build.py — niet met de hand wijzigen.\n"
        " * Diashow: bijzondere Nederlandse soorten met lokale foto's (Wikimedia Commons, maker en licentie per foto).\n */\n"
        f"export const SHOWCASE_GROUPS = Object.freeze({json.dumps(groups, ensure_ascii=False)});\n"
        f"export const SHOWCASE_BIRDS = Object.freeze({json.dumps(birds, ensure_ascii=False, indent=1)});\n",
        encoding="utf-8")
    print(f"{len(birds)} vogels in de diashow → {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
