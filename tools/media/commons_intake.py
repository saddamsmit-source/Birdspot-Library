#!/usr/bin/env python3
"""Birdspot media-intake via Wikimedia Commons (build-time only, run in GitHub Actions).

Waarom: de Claude-runtime mag geen externe mediahosts bereiken (egress-policy, proxy 403).
GitHub Actions-runners wel. Dit script omzeilt geen blokkade: het gebruikt de officiële
Commons-API met een herkenbare User-Agent, sequentiële verzoeken en maxlag.

Twee modi, beide gestuurd door een JSON-manifest in de repo (review-spoor in Git):

  discover  Zoekt per zoekopdracht kandidaten, filtert op vrije licenties die commercieel
            hergebruik toestaan (CC0, publiek domein, CC BY, CC BY-SA; nooit NC/ND),
            schrijft metadata + kleine voorvertoningen (alleen foto's) naar --out.
            Kandidaten zijn GEEN goedgekeurde gidsmedia.

  import    Importeert uitsluitend expliciet geselecteerde bestanden met vastgepinde
            SHA-1 van het origineel. Controleert opnieuw licentie, auteur en SHA-1,
            weigert overschrijven, strip metadata (foto) of zet om naar mono MP3 (audio)
            en registreert in assets/species/field-guide-media.json met bronvermelding.

Gebruik:
  python tools/media/commons_intake.py discover tools/media/intake_queries_2026-11-16.json --out docs/media-intake/2026-11-16
  python tools/media/commons_intake.py import tools/media/intake_selection_2026-11-16.json
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
API = "https://commons.wikimedia.org/w/api.php"
UA = ("BirdspotLibrary-media-intake/1.0 "
      "(https://github.com/saddamsmit-source/Birdspot-Library; build-time license-checked import)")
REGISTRY = ROOT / "assets/species/field-guide-media.json"
ALLOWED = re.compile(r"^(CC0|CC0 1\.0|Public domain|PD|CC BY(-SA)? \d(\.\d)?( [A-Za-z\-]+)?)$", re.I)
FORBIDDEN = re.compile(r"\b(NC|ND)\b|noncommercial|no ?deriv", re.I)
MAX_BYTES = 25_000_000
# Alleen deze mediamappen mogen door de intake worden beschreven (padbewaking).
ALLOWED_DIRS = {"image": ("assets/species/plumage/",), "audio": ("assets/species/audio/",)}
ALLOWED_EXT = {"image": ".webp", "audio": ".mp3"}


class IntakeError(ValueError):
    """Een manifestregel voldoet niet aan bron-, licentie-, pad- of reviewregels."""


def norm_name(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "")).strip().casefold()


_CREDIT_KEYS = {"author": "author", "recordist": "recordist", "copyright holder": "copyrightHolder",
                "copyright_holder": "copyrightHolder", "copyrightholder": "copyrightHolder"}


def credit_fields(wikitext: str) -> dict:
    """R19-QA: losse makervelden uit de bestandspagina (bv. geluidssjablonen met recordist en copyright holder
    naast een leeg Artist-veld). Alleen expliciet benoemde parameters; niets afleiden of samenvoegen."""
    out = {}
    for m in re.finditer(r"^\s*\|\s*([A-Za-z_ ]+?)\s*=\s*(.*?)\s*$", wikitext or "", re.M):
        key = _CREDIT_KEYS.get(m.group(1).strip().casefold())
        if not key or key in out:
            continue
        val = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", m.group(2))   # [[link|naam]] -> naam
        val = re.sub(r"\{\{[^{}]*\}\}|<[^>]+>|'{2,}", "", val)
        val = re.sub(r"\s+", " ", val).strip(" .;,")
        if val:
            out[key] = val[:160]
    return out


def safe_dest(asset: str, kind: str) -> Path:
    """Uitvoerpad moet binnen de toegestane mediamap blijven, juiste extensie hebben en nog niet bestaan."""
    media = "audio" if kind == "audio" else "image"
    rel = (asset or "").lstrip("/")
    if ".." in Path(rel).parts or "\\" in rel:
        raise IntakeError("Pad met '..' of backslash: " + asset)
    dest = (ROOT / rel).resolve()
    root = ROOT.resolve()
    # Vergelijking op directorygrenzen (QA 16-11): een siblingmap als plumage-extra/ telt niet als plumage/.
    if not any(dest != (root / d).resolve() and dest.is_relative_to((root / d).resolve()) for d in ALLOWED_DIRS[media]):
        raise IntakeError(f"Uitvoerpad buiten toegestane mediamap: {asset}")
    if dest.suffix != ALLOWED_EXT[media]:
        raise IntakeError(f"Onjuiste extensie voor {media}: {asset}")
    if dest.exists():
        raise IntakeError("Weiger overschrijven: " + asset)
    return dest


def check_item(e: dict, info: dict | None) -> None:
    """Controleert één manifestregel tegen de actuele Commons-metadata, zonder netwerk."""
    if not info:
        raise IntakeError("Niet gevonden op Commons: " + e.get("title", "?"))
    if info["sha1"] != e["sha1"]:
        raise IntakeError(f"SHA-1 gewijzigd voor {e['title']}: {info['sha1']} != {e['sha1']}")
    if not license_ok(info["license"]) or info["license"] != e["license"]:
        raise IntakeError(f"Licentie afwijkend voor {e['title']}: {info['license']}")
    if norm_name(info["author"]) != norm_name(e["author"]):
        raise IntakeError(f"Auteur wijkt af van Commons voor {e['title']}: {info['author']!r} != {e['author']!r}")
    if e["kind"] == "audio":
        heard = e.get("listened") or {}
        if all(heard.get(k) for k in ("by", "date", "species", "soundType", "quality")):
            return
        audiocheck_ok(e, info)


def audiocheck_ok(e: dict, info: dict) -> None:
    """Alternatief voor menselijk luisteren (protocol docs/media-intake/AUDIOCHECK_PROTOCOL.md): het audiocheck-rapport
    moet voor exact dit bestand (SHA-1) een consistent oordeel bevatten met dezelfde soort en geluidsoort, plus een
    vastgelegde visuele spectrogramcontrole. Anders weigeren."""
    ac = e.get("audiocheck") or {}
    if not (ac.get("report") and ac.get("judgement") and ac.get("visual") and ac.get("soundType")):
        raise IntakeError("Audio pas importeren na menselijke luistercontrole of volledige audiocheck: " + e["title"])
    path = (ROOT / ac["report"]).resolve()
    if not path.is_relative_to((ROOT / "docs/media-intake").resolve()) or not path.is_file():
        raise IntakeError("Audiocheck-rapport ontbreekt of staat buiten docs/media-intake: " + ac["report"])
    rep = json.loads(path.read_text(encoding="utf-8"))
    j = next((x for x in rep.get("judgements", []) if x.get("id") == ac["judgement"]), None)
    rec = next((x for x in rep.get("recordings", []) if x.get("id") == ac["judgement"]), None)
    if not j or not rec or not j.get("consistent"):
        raise IntakeError("Audiocheck niet consistent voor " + ac["judgement"])
    if rec.get("sha1") != info["sha1"] or j.get("speciesId") != e["speciesId"] or j.get("soundType") != ac["soundType"]:
        raise IntakeError("Audiocheck hoort bij een ander bestand, andere soort of geluidsoort: " + ac["judgement"])
    frag = rec.get("fragment") or {}
    if abs(float(frag.get("start", -1)) - float(e.get("start", 0))) > 0.05 or abs(float(frag.get("seconds", -1)) - float(e.get("seconds", 30))) > 0.15:
        raise IntakeError("Gecontroleerd fragment wijkt af van het te publiceren fragment: " + ac["judgement"])
    if not str(j.get("evidenceLevel", "")).startswith("PARTIALLY TESTED"):
        raise IntakeError("Audiocheck-rapport zonder bewijsplafond (oud formaat): opnieuw controleren: " + ac["judgement"])
    if str((e.get("register") or {}).get("verification", "")).startswith("VERIFIED"):
        raise IntakeError("Audiocheck is geen soortverificatie: registreer hooguit PARTIALLY TESTED: " + e["title"])


def get(url: str, params: dict | None = None, binary: bool = False):
    if params:
        url = url + "?" + urllib.parse.urlencode({**params, "format": "json", "maxlag": "5"})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                raise RuntimeError("Bestand groter dan limiet")
            time.sleep(1.0)  # beleefd, sequentieel
            return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:  # 429/503: korte, begrensde wachttijd
            if e.code in (429, 503) and attempt < 2:
                time.sleep(10 * (attempt + 1))
                continue
            raise
    raise RuntimeError("Onbereikbaar: " + url)


def clean(value: str | None, limit: int = 400) -> str:
    text = re.sub(r"<[^>]+>", " ", html.unescape(value or ""))
    return re.sub(r"\s+", " ", text).strip()[:limit]


def https_license_url(url: str) -> str:
    """Commons levert soms http://creativecommons.org/...; het register eist https (zelfde document)."""
    return re.sub(r"^http://(creativecommons\.org/)", r"https://\1", (url or "").strip())


def license_ok(short: str) -> bool:
    short = (short or "").strip()
    return bool(ALLOWED.match(short)) and not FORBIDDEN.search(short)


def imageinfo(titles: list[str], thumb: int | None = None) -> dict:
    params = {"action": "query", "titles": "|".join(titles), "prop": "imageinfo|categories|revisions",
              "iiprop": "url|sha1|size|mime|extmetadata", "cllimit": "max", "clshow": "!hidden",
              "rvprop": "content", "rvslots": "main"}
    if thumb:
        params["iiurlwidth"] = str(thumb)
    pages = get(API, params)["query"]["pages"].values()
    out = {}
    for page in pages:
        if "imageinfo" not in page:
            continue
        ii = page["imageinfo"][0]
        meta = ii.get("extmetadata", {})
        m = lambda k: (meta.get(k) or {}).get("value")
        out[page["title"]] = {
            "title": page["title"],
            "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(page["title"].replace(" ", "_"), safe=":/(),"),
            "url": ii["url"], "thumb": ii.get("thumburl"), "sha1": ii["sha1"], "size": ii["size"],
            "width": ii.get("width"), "height": ii.get("height"), "mime": ii["mime"],
            "duration": ii.get("duration"),
            "license": clean(m("LicenseShortName"), 60), "licenseUrl": https_license_url(clean(m("LicenseUrl"), 200)),
            "author": clean(m("Artist"), 160), "credit": clean(m("Credit"), 200),
            "description": clean(m("ImageDescription")), "date": clean(m("DateTimeOriginal"), 40),
            "categories": [c["title"].removeprefix("Category:") for c in page.get("categories", [])][:15],
        }
        rev = (page.get("revisions") or [{}])[0]
        wikitext = ((rev.get("slots") or {}).get("main") or {}).get("*") or rev.get("*") or ""
        out[page["title"]]["creditFields"] = credit_fields(wikitext)
    return out


def discover(manifest: Path, out: Path) -> None:
    spec = json.loads(manifest.read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    report = {"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "userAgent": UA,
              "licensePolicy": "CC0 / publiek domein / CC BY / CC BY-SA; NC en ND uitgesloten",
              "status": "CANDIDATES ONLY - niet goedgekeurd, niet in de app", "queries": []}
    for q in spec["queries"]:
        search = q["search"] + (" filetype:audio" if q["kind"] == "audio" else " filetype:bitmap")
        res = get(API, {"action": "query", "list": "search", "srnamespace": "6",
                        "srsearch": search, "srlimit": str(q.get("limit", 12))})
        titles = [s["title"] for s in res["query"]["search"]]
        infos = imageinfo(titles, thumb=None if q["kind"] == "audio" else q.get("thumb", 360)) if titles else {}
        kept, rejected = [], []
        for t in titles:
            info = infos.get(t)
            if not info:
                continue
            (kept if license_ok(info["license"]) else rejected).append(info)
        for i, info in enumerate(kept[: q.get("keep", 6)]):
            if info.get("thumb"):
                name = f"{q['id']}_{i + 1:02d}.jpg"
                (out / name).write_bytes(get(info["thumb"], binary=True))
                info["preview"] = name
        report["queries"].append({"id": q["id"], "speciesId": q["speciesId"], "role": q["role"],
                                  "kind": q["kind"], "search": search,
                                  "candidates": kept[: q.get("keep", 6)],
                                  "rejectedForLicense": [{"title": r["title"], "license": r["license"]} for r in rejected]})
    (out / "candidates.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("discover:", sum(len(q["candidates"]) for q in report["queries"]), "kandidaten")


def crop_box(size: tuple[int, int], crop: list[float] | None) -> tuple[int, int, int, int] | None:
    """Uitsnede als fracties [x0, y0, x1, y1]; alleen geldig binnen het beeld en minimaal 20 % per zijde."""
    if not crop:
        return None
    x0, y0, x1, y1 = crop
    if not (0 <= x0 < x1 <= 1 and 0 <= y0 < y1 <= 1) or x1 - x0 < 0.2 or y1 - y0 < 0.2:
        raise IntakeError(f"Ongeldige uitsnede: {crop}")
    w, h = size
    return round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h)


def convert_image(data: bytes, dest: Path, crop: list[float] | None = None) -> tuple[int, int]:
    from PIL import Image, ImageOps
    img = Image.open(io.BytesIO(data))
    img.load()
    img = ImageOps.exif_transpose(img).convert("RGB")
    box = crop_box(img.size, crop)
    if box:
        img = img.crop(box)
    img.thumbnail((1400, 1400))
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=85, method=6)
    raw = dest.read_bytes()
    for marker in (b"EXIF", b"XMP ", b"GPSInfo"):
        if marker in raw:
            raise RuntimeError("Metadata niet verwijderd: " + dest.name)
    return img.size


def convert_audio(data: bytes, dest: Path, start: float, seconds: float) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix=".src") as src:
        src.write(data)
        src.flush()
        subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-ss", str(start), "-t", str(seconds),
                        "-i", src.name, "-map_metadata", "-1", "-ac", "1", "-ar", "44100", "-b:a", "96k", str(dest)],
                       check=True)
    if dest.stat().st_size < 5000:
        raise RuntimeError("Audio te klein na conversie: " + dest.name)


def do_import(manifest: Path) -> None:
    spec = json.loads(manifest.read_text(encoding="utf-8"))
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    infos = imageinfo([e["title"] for e in spec["items"]])
    log = []
    for e in spec["items"]:
        info = infos.get(e["title"])
        check_item(e, info)
        dest = safe_dest(e["asset"], e["kind"])
        data = get(info["url"], binary=True)
        if hashlib.sha1(data).hexdigest() != e["sha1"]:
            sys.exit("Download-SHA-1 klopt niet: " + e["title"])
        entry = {k: v for k, v in e["register"].items()}
        entry.update({"file": info["title"].removeprefix("File:"), "author": e["author"], "license": info["license"],
                      "licenseUrl": info["licenseUrl"], "source": info["page"], "showSourceLink": True,
                      "sourceSha1": e["sha1"], "reviewed": spec["date"], "intake": "tools/media/commons_intake.py (GitHub Actions)"})
        sid, kind, role = e["speciesId"], e["kind"], e["role"]
        if kind == "audio":
            convert_audio(data, dest, e.get("start", 0), e.get("seconds", 30))
            entry["audio"] = e["asset"]
            entry["modifications"] = f"Fragment {e.get('start', 0)}–{e.get('start', 0) + e.get('seconds', 30)} s, omgezet naar MP3 (mono, 96 kbit/s), metadata verwijderd"
            registry["audio"].setdefault(sid, []).append(entry)
        else:
            w, h = convert_image(data, dest, e.get("crop"))
            mod = ("Uitsnede rond de vogel (fracties " + ", ".join(f"{v:.2f}" for v in e["crop"]) + "), " if e.get("crop")
                   else "Zonder uitsnede, ")
            entry.update({"image": e["asset"], "width": w, "height": h,
                          "modifications": mod + "verkleind tot max. 1400 px en omgezet naar WebP zonder EXIF/GPS/XMP"})
            if kind == "plumage":
                slot = registry["plumage"].setdefault(sid, {})
                if slot.get(role):
                    sys.exit(f"Rol {sid}/{role} is al gevuld; weiger vervanging")
                slot[role] = entry
            else:  # pose (bijv. vlucht)
                registry["poses"].setdefault(sid, []).append(entry)
        out = dest.read_bytes()
        log.append({"asset": e["asset"], "bytes": len(out), "sha256": hashlib.sha256(out).hexdigest(),
                    "sourceSha1": e["sha1"], "license": info["license"], "author": e["author"]})
    REGISTRY.write_text(json.dumps(registry, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (manifest.parent / (manifest.stem + "_result.json")).write_text(json.dumps(log, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    subprocess.run([sys.executable, str(ROOT / "tools/species/build.py")], check=True)
    print("import:", len(log), "bestanden")


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("discover", "import"):
        sys.exit(__doc__)
    if sys.argv[1] == "discover":
        out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else ROOT / "docs/media-intake"
        discover(Path(sys.argv[2]), out)
    else:
        do_import(Path(sys.argv[2]))
