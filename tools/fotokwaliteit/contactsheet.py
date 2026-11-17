"""Contactsheet per soort voor visuele fotokwaliteitscontrole.

Leest een audit-JSON (tools/fotobaseline/audit.mjs) en maakt per soort één JPG met elk getoond beeld
(hoofdfoto, kleden, vlucht, overige poses) op leesbare grootte, met rol, registry-sleutel en
pixelmaat. Vergelijkingsfoto's van andere soorten worden niet herhaald (die hebben hun eigen sheet).

Gebruik: python3 -I tools/fotokwaliteit/contactsheet.py <audit.json> <uitmap> sp001 sp002 ...
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
TILE = 560


def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def main():
    audit = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    out = Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    want = set(sys.argv[3:])
    f = font(15)
    for r in audit["rows"]:
        if want and r["id"] not in want:
            continue
        tiles = []
        if r["heroImage"]:
            tiles.append(("HOOFDFOTO", r["heroFrom"], r["heroImage"]))
        for m in r["media"]:
            if m["image"] == r["heroImage"]:
                continue
            role = ("VLUCHT " if m["flight"] else "") + (m["from"].split(".")[-1] if "PLUMAGE" in m["from"] else m["label"] or m["from"])
            tiles.append((role, f"{m['from']} sex={m['sex']} age={m['age']}", m["image"]))
        imgs = []
        for role, sub, path in tiles:
            p = ROOT / path.lstrip("/")
            try:
                im = Image.open(p).convert("RGB")
            except Exception as e:  # noqa: BLE001 — ontbrekend/defect bestand is zelf een bevinding
                im = Image.new("RGB", (TILE, 300), (200, 40, 40))
                sub += f" FOUT {e}"
            w, h = im.size
            im.thumbnail((TILE, TILE))
            canvas = Image.new("RGB", (TILE, im.size[1] + 44), "white")
            canvas.paste(im, (0, 44))
            d = ImageDraw.Draw(canvas)
            d.text((4, 2), f"{role} · {w}x{h}", fill="black", font=f)
            d.text((4, 22), f"{sub} · {Path(path).name}"[:70], fill=(90, 90, 90), font=f)
            imgs.append(canvas)
        cols = 2
        rows = [imgs[i:i + cols] for i in range(0, len(imgs), cols)]
        H = sum(max(c.size[1] for c in row) for row in rows) + 40
        sheet = Image.new("RGB", (TILE * cols + 10, H), (235, 235, 235))
        ImageDraw.Draw(sheet).text((6, 8), f"{r['id']} {r['nameNL']} ({r['nameSci']}) · {r['family']}", fill="black", font=font(20))
        y = 40
        for row in rows:
            x = 0
            for c in row:
                sheet.paste(c, (x, y))
                x += TILE + 10
            y += max(c.size[1] for c in row)
        sheet.save(out / f"{r['id']}.jpg", quality=80)
        print(r["id"], len(imgs), "beelden")


if __name__ == "__main__":
    main()
