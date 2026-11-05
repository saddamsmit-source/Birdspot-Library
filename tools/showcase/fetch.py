"""Diashowfoto's: kandidaten ophalen en gekozen foto's lokaal opslaan (draait in GitHub Actions).

Stap 1 (geen selection.json-keuze voor een soort): zoekt per soort tot 8 kandidaten op Wikimedia Commons
  (eerst Featured/Quality images, aangevuld met gewone zoekresultaten), alleen CC0/PD/CC BY(-SA),
  en schrijft tools/showcase/candidates/<id>.json + <id>.jpg (genummerd overzichtsvel).
Stap 2 (keuze in tools/showcase/selection.json): downloadt de gekozen file op 1600 px breed,
  slaat op als assets/showcase/<id>.webp en schrijft assets/showcase/credits.json (maker, licentie, bron).
Idempotent: bestaande bestanden worden niet opnieuw opgehaald.
"""
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
HERE = ROOT / "tools" / "showcase"
CAND = HERE / "candidates"
ASSETS = ROOT / "assets" / "showcase"
UA = "BirdspotLibrary/1.0 (https://github.com/saddamsmit-source/Birdspot-Library; showcase photo selection)"
API = "https://commons.wikimedia.org/w/api.php"
OK_LICENSE = re.compile(r"^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)$", re.I)
POSE_WORDS = {"vlucht": "flight", "tak": "", "natuurlijk": ""}


def get(url, binary=False):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
            return data if binary else json.loads(data)
        except Exception as e:  # noqa: BLE001
            print("retry", attempt, url[:120], e, file=sys.stderr)
            time.sleep(3 + attempt * 5)
    raise RuntimeError(url)


def text(html):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", html or ""))).strip()


def author(html):
    """Makersnaam zonder upload-/toolteksten van Commons."""
    a = re.split(r"\s+(?:This file|This image|Uploaded|uploaded by|derivative work)", text(html))[0]
    return a.strip(" ,;-")[:80] or "Wikimedia Commons"


def search(q, limit=20):
    params = {"action": "query", "format": "json", "generator": "search", "gsrsearch": q, "gsrnamespace": "6",
              "gsrlimit": str(limit), "prop": "imageinfo", "iiprop": "url|mime|size|extmetadata", "iiurlwidth": "480"}
    data = get(API + "?" + urllib.parse.urlencode(params))
    pages = sorted((data.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    out = []
    for p in pages:
        info = (p.get("imageinfo") or [{}])[0]
        if info.get("mime") not in ("image/jpeg", "image/png", "image/webp"):
            continue
        meta = info.get("extmetadata", {})
        lic = text(meta.get("LicenseShortName", {}).get("value"))
        if not OK_LICENSE.match(lic):
            continue
        if info.get("width", 0) < 1600:
            continue
        if re.search(r"MHNT|\begg|eggs|museum|specimen|skull|stamp", p["title"], re.I):
            continue  # eieren, museumstukken en postzegels zijn geen vogel in zijn natuurlijke gedrag
        out.append({"file": p["title"].removeprefix("File:"), "thumb": info["thumburl"], "width": info["width"],
                    "height": info["height"], "license": lic, "author": author(meta.get("Artist", {}).get("value")),
                    "source": info["descriptionurl"],
                    "description": text(meta.get("ImageDescription", {}).get("value"))[:200]})
    return out


def candidates(latin, pose, extra=(), aliases=()):
    word = POSE_WORDS[pose]
    seen, out = set(), []
    queries = list(extra) + [f'"{latin}" {word} incategory:Featured_pictures_on_Wikimedia_Commons',
               f'"{latin}" {word} incategory:Quality_images',
               f'"{latin}" incategory:Quality_images', f'"{latin}" {word}']
    for q in queries:
        for c in search(q.replace("  ", " ")):
            hay = (c["file"] + " " + c["description"]).lower()
            if c["file"] not in seen and any(n.lower() in hay for n in (latin, *aliases)):
                seen.add(c["file"])
                out.append(c)
        if len(out) >= 12:
            break
    return out[:12]


def sheet(sid, cands):
    tiles = []
    for i, c in enumerate(cands, 1):
        im = Image.open(io.BytesIO(get(c["thumb"], binary=True))).convert("RGB")
        im = ImageOps.contain(im, (480, 360))
        tile = Image.new("RGB", (480, 390), "white")
        tile.paste(im, ((480 - im.width) // 2, 30))
        ImageDraw.Draw(tile).text((8, 6), f"{i}. {c['file'][:62]}", fill="black")
        tiles.append(tile)
        time.sleep(0.5)
    if not tiles:
        return
    cols = 2
    rows = (len(tiles) + 1) // cols
    out = Image.new("RGB", (cols * 480, rows * 390), "#ddd")
    for i, t in enumerate(tiles):
        out.paste(t, ((i % cols) * 480, (i // cols) * 390))
    out.save(CAND / f"{sid}.jpg", quality=82)


def download(sid, file):
    params = {"action": "query", "format": "json", "titles": "File:" + file, "prop": "imageinfo",
              "iiprop": "url|extmetadata", "iiurlwidth": "1600"}
    page = next(iter(get(API + "?" + urllib.parse.urlencode(params))["query"]["pages"].values()))
    info = page["imageinfo"][0]
    meta = info["extmetadata"]
    im = Image.open(io.BytesIO(get(info["thumburl"], binary=True)))
    im = ImageOps.exif_transpose(im).convert("RGB")
    im.thumbnail((1600, 1600))
    im.save(ASSETS / f"{sid}.webp", "WEBP", quality=80, method=6)
    return {"file": file, "author": author(meta.get("Artist", {}).get("value")),
            "license": text(meta.get("LicenseShortName", {}).get("value")),
            "source": info["descriptionurl"], "width": im.width, "height": im.height}


def main():
    spec = json.loads((HERE / "species.json").read_text(encoding="utf-8"))
    sel_path = HERE / "selection.json"
    selection = json.loads(sel_path.read_text(encoding="utf-8")) if sel_path.exists() else {}
    CAND.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)
    credits_path = ASSETS / "credits.json"
    credits = json.loads(credits_path.read_text(encoding="utf-8")) if credits_path.exists() else {}
    for _key, _label, birds in spec["groups"]:
        for b in birds:
            sid, nl, latin, pose = b["id"], b["nl"], b["latin"], b["pose"]
            chosen = selection.get(sid)
            if chosen:
                if credits.get(sid, {}).get("file") != chosen or not (ASSETS / f"{sid}.webp").exists():
                    credits[sid] = download(sid, chosen)
                    print("foto", sid, nl, chosen)
                continue
            if (CAND / f"{sid}.json").exists():
                continue
            cands = candidates(latin, pose, b.get("queries", ()), b.get("aliases", ()))
            (CAND / f"{sid}.json").write_text(json.dumps(cands, ensure_ascii=False, indent=1), encoding="utf-8")
            sheet(sid, cands)
            print("kandidaten", sid, nl, len(cands))
    credits_path.write_text(json.dumps(dict(sorted(credits.items())), ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
