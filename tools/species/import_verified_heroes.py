#!/usr/bin/env python3
"""Eenmalige import van geverifieerde hoofdfoto's (Wikimedia Commons), alleen build-time.

Lijst: tools/species/verified_heroes_2026-11-09.json (bestand, SHA-1, maker, licentie, bron; visueel gekozen).
Per foto: via de Commons-API controleren dat de huidige bestandsversie exact de beoordeelde SHA-1 heeft, daarna de
door Wikimedia van díe versie gemaakte afbeelding van 1600 px ophalen (het origineel van 5–45 MB wordt door
Wikimedia sterk gedoseerd), EXIF-oriëntatie toepassen en als WebP opslaan zonder EXIF/GPS/XMP/ICC.
"""
from __future__ import annotations
import hashlib, io, json, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
LIST = ROOT / "tools/species/verified_heroes_2026-11-09.json"
UA = {"User-Agent": "BirdspotLibrary-photo-rights-review/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}

def fetch(url):
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read(60_000_001)
        except Exception:  # noqa: BLE001
            if i == 4: raise
            time.sleep(30 * (i + 1))

def main():
    items = json.loads(LIST.read_text())
    rep_path = ROOT / "docs/evidence/verified_heroes_import_2026-11-09.json"
    report = json.loads(rep_path.read_text()) if rep_path.exists() else []
    done = {r["target"] for r in report if "sha1" in r}
    report = [r for r in report if "sha1" in r]
    for it in items:
        out = ROOT / it["target"].lstrip("/")
        if it["target"] in done and out.exists(): continue
        try:
            one(it, out, report)
        except Exception as e:  # noqa: BLE001
            report.append({"target": it["target"], "error": f"{type(e).__name__}: {e}"[:300]})
        time.sleep(4)
    rep_path.parent.mkdir(parents=True, exist_ok=True)
    rep_path.write_text(json.dumps(report, indent=1))
    print("geïmporteerd", sum("sha1" in r for r in report), "fouten", sum("error" in r for r in report))

def one(it, out, report):
        if out.exists(): raise RuntimeError(f"Bestaat al zonder rapport: {out}")
        q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "sha1|size|url",
                                    "iiurlwidth": 1600, "titles": it["title"]})
        page = next(iter(json.loads(fetch("https://commons.wikimedia.org/w/api.php?" + q))["query"]["pages"].values()))
        info = page["imageinfo"][0]
        if info["sha1"] != it["sha1"]: raise RuntimeError(f"Bestandsversie gewijzigd sinds beoordeling: {it['title']}")
        if (info["width"], info["height"]) != (it["width"], it["height"]): raise RuntimeError(f"Afmeting gewijzigd: {it['title']}")
        data = fetch(info["thumburl"])
        digest = info["sha1"]
        im = Image.open(io.BytesIO(data)); im.load()
        im = ImageOps.exif_transpose(im).convert("RGB"); im.info = {}
        im.thumbnail((1600, 1600), Image.LANCZOS)
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, "WEBP", quality=84, method=6)
        with Image.open(out) as chk:
            chk.load()
            for k in ("exif", "xmp", "icc_profile"):
                if k in chk.info: raise RuntimeError(f"Metadata niet verwijderd: {k}")
            report.append({"target": it["target"], "sha1": digest, "size": list(chk.size)})

if __name__ == "__main__":
    main()
