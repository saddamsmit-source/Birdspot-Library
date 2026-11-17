#!/usr/bin/env python3
"""One-off verified Wikimedia image import, only for sp018 juvenile.

No source URL is fetched at app runtime. This script is a build-time tool,
restricted to the exact reviewed Wikimedia Commons file and SHA-1.
"""
from __future__ import annotations
import hashlib
import io
import json
from pathlib import Path
import urllib.request
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
FILE = "Dryocopus_martius_03.jpg"
URL = "https://upload.wikimedia.org/wikipedia/commons/9/9e/" + FILE
SOURCE_PAGE = "https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg"
SHA1 = "d0d3ff3ba4e7905e88b00a44dae51cc259bdedca"
ASSET = ROOT / "assets/species/plumage/sp018-juv-review.webp"
REGISTRY = ROOT / "assets/species/field-guide-media.json"

def fetch_verified_source():
    request = urllib.request.Request(
        URL, headers={"User-Agent": "BirdspotLibrary-photo-rights-review/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}
    )
    with urllib.request.urlopen(request, timeout=35) as resp:
        if resp.status != 200:
            raise RuntimeError(f"Commons HTTP {resp.status}")
        data = resp.read(8_000_001)
    if not 30_000 < len(data) < 8_000_001:
        raise RuntimeError("Unexpected original image size")
    digest = hashlib.sha1(data).hexdigest()
    if digest != SHA1:
        raise RuntimeError(f"Original Commons image checksum differs: {digest} != {SHA1}")
    photo = Image.open(io.BytesIO(data))
    photo.load()
    if photo.format != "JPEG" or photo.size != (1000, 550):
        raise RuntimeError(f"Unexpected original photo: {photo.format} {photo.size}")
    return photo

def main():
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    original = registry.get("poses", {}).get("sp018", [])
    if any(p.get("age") == "juvenile" for p in original):
        raise RuntimeError("sp018 juvenile role already filled; no overwrite allowed")
    if ASSET.exists():
        raise RuntimeError("Existing output at sp018-juv-review.webp; refusing replacement")
    photo = fetch_verified_source()
    # Explicitly remove ALL EXIF, GPS, ICC, XMP and file-history metadata.
    sanitized = ImageOps.exif_transpose(photo).convert("RGB")
    ASSET.parent.mkdir(parents=True, exist_ok=True)
    sanitized.save(ASSET, "WEBP", quality=85, method=6)
    with Image.open(ASSET) as chk:
        chk.load()
        if chk.format != "WEBP" or chk.size != (1000, 550):
            raise RuntimeError("Invalid converted image")
        for sensitive in ("exif", "xmp", "gps", "icc_profile"):
            if sensitive in chk.info:
                raise RuntimeError(f"Metadata not stripped: {sensitive}")
    output = ASSET.read_bytes()
    if b"EXIF" in output or b"XMP " in output or b"GPSInfo" in output:
        raise RuntimeError("Sensitive metadata chunk detected in output")

    registry["poses"].setdefault("sp018", []).append({
      "file": "Dryocopus martius 03.jpg",
      "label": "Juveniel — kopdetail",
      "nl": "Zwarte Specht",
      "latin": "Dryocopus martius",
      "age": "juvenile",
      "flight": False,
      "note": "Close-up van de kop van een jonge Zwarte Specht. Geschikt als detail voor het jeugdkleed; geen volledig vogelportret.",
      "author": "Philippe Kurlapski",
      "license": "CC BY 1.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/1.0/",
      "source": SOURCE_PAGE,
      "alt": "Kopdetail van een jonge Zwarte Specht met lichte snavel, donkere oogpartij en rode kruin.",
      "modifications": "Originele JPEG omgezet naar WebP, zonder uitsnede en zonder EXIF/GPS/XMP.",
      "reviewed": "2026-11-09",
      "verificationSource": SOURCE_PAGE,
      "visualCheck": "De originele Commons-beschrijving identificeert dit portret expliciet als juveniel (pic noir juvénile). Het beeld toont de kop met lichte snavel, donkere veren en rode kruin. Exacte sekse wordt niet geclaimd.",
      "width": 1000,
      "height": 550,
      "image": "/assets/species/plumage/sp018-juv-review.webp",
      "sourceSha1": SHA1,
    })
    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Verified local-only sp018 juvenile import: {ASSET.relative_to(ROOT)}, {len(output)} bytes, SHA-256 {hashlib.sha256(output).hexdigest()}")

if __name__ == "__main__":
    main()
