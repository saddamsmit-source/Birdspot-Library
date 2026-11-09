#!/usr/bin/env python3
"""Eenmalige import van geverifieerde hoofdfoto's (Wikimedia Commons), alleen build-time.

Lijst: tools/species/verified_heroes_2026-11-09.json (bestand, SHA-1, maker, licentie, bron; visueel gekozen).
Per foto: origineel downloaden, SHA-1 tegen de lijst controleren, EXIF-oriëntatie toepassen, verkleinen tot
max. 1600 px zonder uitsnede, als WebP opslaan zonder EXIF/GPS/XMP/ICC. Weigert te overschrijven.
"""
from __future__ import annotations
import hashlib, io, json, time, urllib.request
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
            time.sleep(10 * (i + 1))

def main():
    items = json.loads(LIST.read_text())
    report = []
    for it in items:
        out = ROOT / it["target"].lstrip("/")
        if out.exists(): raise RuntimeError(f"Bestaat al: {out}")
        data = fetch(it["original"])
        digest = hashlib.sha1(data).hexdigest()
        if digest != it["sha1"]: raise RuntimeError(f"SHA-1 wijkt af voor {it['title']}: {digest}")
        im = Image.open(io.BytesIO(data)); im.load()
        if im.size != (it["width"], it["height"]): raise RuntimeError(f"Afmeting wijkt af voor {it['title']}: {im.size}")
        im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((1600, 1600), Image.LANCZOS)
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, "WEBP", quality=84, method=6)
        with Image.open(out) as chk:
            chk.load()
            for k in ("exif", "xmp", "icc_profile"):
                if k in chk.info: raise RuntimeError(f"Metadata niet verwijderd: {k}")
            report.append({"target": it["target"], "sha1": digest, "size": list(chk.size)})
        time.sleep(2)
    (ROOT / "docs/evidence").mkdir(parents=True, exist_ok=True)
    (ROOT / "docs/evidence/verified_heroes_import_2026-11-09.json").write_text(json.dumps(report, indent=1))
    print("geïmporteerd", len(report))

if __name__ == "__main__":
    main()
