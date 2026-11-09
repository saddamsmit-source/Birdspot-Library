#!/usr/bin/env python3
"""Download + verify + strip de 2 gekozen juveniele foto's (Meerkoet, Bergeend). Schrijft WebP's naar audit/juv_import/."""
from __future__ import annotations
import io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

HERE = Path(__file__).resolve().parent
OUT = HERE / "juv_import"; OUT.mkdir(exist_ok=True)
UA = {"User-Agent": "BirdspotLibrary-photo-rights-review/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}

def fetch(url):
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read(60_000_001)
        except Exception:  # noqa: BLE001
            if i == 4: raise
            time.sleep(10 * (i + 1))

def main():
    items = json.loads((HERE / "juv_picks.json").read_text())
    report = []
    for it in items:
        q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "sha1|size|url",
                                    "iiurlwidth": 1600, "titles": it["title"]})
        page = next(iter(json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + q))["query"]["pages"].values()))
        info = page["imageinfo"][0]
        if info["sha1"] != it["sha1"]:
            report.append({"target": it["target"], "error": f"Bestandsversie gewijzigd sinds beoordeling: {it['title']}"}); continue
        if (info["width"], info["height"]) != (it["width"], it["height"]):
            report.append({"target": it["target"], "error": f"Afmeting gewijzigd: {it['title']}"}); continue
        data = fetch(info["thumburl"])
        im = Image.open(io.BytesIO(data)); im.load()
        im = ImageOps.exif_transpose(im).convert("RGB"); im.info = {}
        im.thumbnail((1600, 1600), Image.LANCZOS)
        out = OUT / Path(it["target"]).name
        im.save(out, "WEBP", quality=84, method=6)
        with Image.open(out) as chk:
            chk.load()
            for k in ("exif", "xmp", "icc_profile"):
                if k in chk.info: raise RuntimeError(f"Metadata niet verwijderd: {k}")
        report.append({"target": it["target"], "sha1": info["sha1"], "size": list(Image.open(out).size), "file": out.name})
        time.sleep(2)
    (OUT / "report.json").write_text(json.dumps(report, indent=1, ensure_ascii=False))
    print(json.dumps(report, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
