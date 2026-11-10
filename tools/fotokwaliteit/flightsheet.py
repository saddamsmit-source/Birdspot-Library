"""Raster van alle als vlucht gemarkeerde gidsfoto's voor de strenge vluchtcontrole.

Leest een audit-JSON (tools/fotobaseline/audit.mjs) en maakt pagina's van 3x4 tegels met
volgnummer, Birdspot-ID, soortnaam, registry-sleutel, geslachtslabel en pixelmaat.
Gebruik: python3 -I tools/fotokwaliteit/flightsheet.py <audit.json> <uitmap>
Schrijft ook <uitmap>/index.json (volgnummer -> asset) zodat de beoordeling herleidbaar is.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
TILE, COLS, ROWS = 420, 3, 4
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)


def main():
    audit = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    items = []
    for r in sorted(audit["rows"], key=lambda r: (r["family"], r["nameNL"])):
        for m in r["media"]:
            if m["flight"]:
                items.append({"n": len(items) + 1, "id": r["id"], "nameNL": r["nameNL"], "family": r["family"],
                              "from": m["from"], "sex": m["sex"], "age": m["age"], "label": m["label"],
                              "image": m["image"], "file": m["file"], "source": m["source"]})
    (out / "index.json").write_text(json.dumps(items, ensure_ascii=False, indent=1), encoding="utf-8")
    per = COLS * ROWS
    for page in range(0, len(items), per):
        chunk = items[page:page + per]
        sheet = Image.new("RGB", (COLS * (TILE + 8), ROWS * (TILE * 3 // 4 + 40)), (230, 230, 230))
        for i, it in enumerate(chunk):
            im = Image.open(ROOT / it["image"].lstrip("/")).convert("RGB")
            w, h = im.size
            im.thumbnail((TILE, TILE * 3 // 4))
            x = (i % COLS) * (TILE + 8)
            y = (i // COLS) * (TILE * 3 // 4 + 40)
            sheet.paste(im, (x, y + 38))
            d = ImageDraw.Draw(sheet)
            d.text((x + 2, y + 2), f"#{it['n']} {it['id']} {it['nameNL']} {w}x{h}", fill="black", font=F)
            d.text((x + 2, y + 20), f"{it['from']} sex={it['sex']} {it['label']}"[:58], fill=(80, 80, 80), font=F)
        sheet.save(out / f"vlucht-{page // per + 1:02d}.jpg", quality=82)
    print(len(items), "vluchtfoto's,", -(-len(items) // per), "pagina's")


if __name__ == "__main__":
    main()
