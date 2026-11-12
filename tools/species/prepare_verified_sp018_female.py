#!/usr/bin/env python3
"""Safe source-locked staging of the Black Woodpecker female photograph.
--check makes NO network calls or writes. --prepare DIR verifies the exact
Commons original and creates a WebP OUTSIDE the repository for human review.
No automatic changes to public guide media, registry, tests or application.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
META = ROOT / "docs/fotokwaliteit/sp018_female_candidate.json"
REG = ROOT / "assets/species/field-guide-media.json"
SHA1 = "26a9ab628423781a7b6d9ee99f1c134d748665fc"
UA = "BirdspotLibrary-source-audit/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"

def candidate():
    return json.loads(META.read_text(encoding="utf-8"))

def validate_metadata(m):
    expected = {
        "species": "sp018", "role": "adult_f",
        "status": "PENDING_ORIGINAL_BYTES_AND_VISUAL_REVIEW",
        "author": "Andreas Eichler", "license": "CC BY-SA 4.0",
        "sourceSha1": SHA1, "sourceBytes": 5869311,
        "originalWidth": 2196, "originalHeight": 2901,
        "currentLocalPath": "assets/species/plumage/sp018-female-single.webp",
    }
    for key, val in expected.items():
        if m.get(key) != val:
            raise ValueError("Source manifest mismatch: " + key)
    if not m["sourcePage"].startswith("https://commons.wikimedia.org/wiki/File:"):
        raise ValueError("Unknown original source host")
    if m["photoTitle"] != "File:2016.08.27.-15-Viernheimer Heide-Viernheim--Schwarzspecht-Weibchen.jpg":
        raise ValueError("Different original image title")
    if m["licenseUrl"] != "https://creativecommons.org/licenses/by-sa/4.0/":
        raise ValueError("Different license link")

def validate_local(m):
    reg = json.loads(REG.read_text(encoding="utf-8"))
    image = reg["plumage"]["sp018"]["adult_f"]
    for key, expected in [
        ("image", "/" + m["currentLocalPath"]), ("source", m["sourcePage"]),
        ("author", m["author"]), ("license", m["license"]),
        ("width", m["currentLocalWidth"]), ("height", m["currentLocalHeight"]),
    ]:
        if image.get(key) != expected:
            raise ValueError("Existing photo record changed: " + key)
    raw = (ROOT / m["currentLocalPath"]).read_bytes()
    if raw[:4] != b"RIFF" or raw[8:12] != b"WEBP":
        raise ValueError("Existing image not WebP")

def validate_api(info, m):
    for key, expected in [
        ("sha1", m["sourceSha1"]), ("size", m["sourceBytes"]),
        ("width", m["originalWidth"]), ("height", m["originalHeight"]),
    ]:
        if info.get(key) != expected:
            raise ValueError("Original Commons revision changed: " + key)
    if not info.get("url", "").startswith("https://upload.wikimedia.org/wikipedia/commons/"):
        raise ValueError("Unexpected download host")

def download(url, limit):
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=35) as response:
        if response.status != 200:
            raise RuntimeError("HTTP status " + str(response.status))
        raw = response.read(limit + 1)
    if len(raw) > limit:
        raise ValueError("Source exceeds size limit")
    return raw

def fetch_original(m):
    query = urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "iiprop": "sha1|size|url", "titles": m["photoTitle"],
    })
    api = json.loads(download("https://commons.wikimedia.org/w/api.php?" + query, 1_000_000))
    pages = api.get("query", {}).get("pages", {})
    if len(pages) != 1:
        raise ValueError("Commons result not unique")
    info = next(iter(pages.values())).get("imageinfo", [None])[0]
    if not isinstance(info, dict):
        raise ValueError("Commons imageinfo absent")
    validate_api(info, m)
    original = download(info["url"], m["sourceBytes"] + 1024)
    if len(original) != m["sourceBytes"]:
        raise ValueError("Original byte count differs")
    if hashlib.sha1(original).hexdigest() != m["sourceSha1"]:
        raise ValueError("Original bytes do not match verified SHA-1")
    return original

def prepare(directory, m):
    dest = Path(directory).expanduser().resolve()
    if dest == ROOT or ROOT in dest.parents:
        raise ValueError("Preparation must occur outside the repository")
    if dest.exists():
        raise FileExistsError("Never overwrite staging directory")
    raw = fetch_original(m)
    try:
        from PIL import Image, ImageOps
    except ImportError as exc:
        raise RuntimeError("Pillow required for explicit photo preparation") from exc
    source = Image.open(io.BytesIO(raw))
    source.load()
    if source.format != "JPEG" or source.size != (m["originalWidth"], m["originalHeight"]):
        raise ValueError("Decoded source is not expected JPEG")
    im = ImageOps.exif_transpose(source).convert("RGB")
    im.info.clear()
    im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
    if min(im.size) <= min(m["currentLocalWidth"], m["currentLocalHeight"]):
        raise ValueError("No real resolution improvement")
    dest.mkdir(parents=True, exist_ok=False)
    path = dest / m["stagingOutputName"]
    try:
        im.save(path, "WEBP", quality=85, method=6)
        with Image.open(path) as check:
            check.load()
            if check.format != "WEBP" or check.size != im.size:
                raise ValueError("Prepared WebP invalid")
            if any(k in check.info for k in ("exif", "gps", "xmp", "icc_profile")):
                raise ValueError("Metadata retained")
        bytes_out = path.read_bytes()
        if any(marker in bytes_out for marker in (b"EXIF", b"XMP ", b"GPSInfo")):
            raise ValueError("Potential sensitive metadata in output")
        report = {
            "status": "PREPARED_NOT_VISUALLY_APPROVED",
            "species": m["species"], "role": m["role"],
            "sourceSha1": m["sourceSha1"],
            "webpSha256": hashlib.sha256(bytes_out).hexdigest(),
            "size": list(im.size), "author": m["author"],
            "license": m["license"], "source": m["sourcePage"],
            "transform": "EXIF transpose, resize max 1600, WebP recompression, metadata stripped",
            "next": "Manual image, licensing, source and duplicate review; then separate app PR"
        }
        (dest / "review-manifest.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(report, indent=2))
    except Exception:
        path.unlink(missing_ok=True)
        (dest / "review-manifest.json").unlink(missing_ok=True)
        dest.rmdir()
        raise

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--check", action="store_true")
    p.add_argument("--prepare", metavar="STAGING_DIR")
    a = p.parse_args()
    if a.check == bool(a.prepare):
        p.error("Provide exactly one of --check or --prepare")
    m = candidate()
    validate_metadata(m)
    validate_local(m)
    if a.check:
        print("PASS metadata/preflight only; original bytes and visual import NOT TESTED")
    else:
        prepare(a.prepare, m)

if __name__ == "__main__":
    main()
