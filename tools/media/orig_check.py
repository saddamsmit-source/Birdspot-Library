"""Birdspot origcheck (F3-R12, 16-11-2026): bestaande gidsfoto's vergelijken met het oorspronkelijke bronbeeld.

Draait in GitHub Actions (de Claude-runtime kan Wikimedia/iNaturalist niet bereiken). Per foto:
  - Commons: actuele metadata (auteur, licentie, SHA-1 origineel) + miniatuur van 800 px;
    iNaturalist: open-data-origineel via expliciete URL (metadata blijft uit het register);
  - pixelvergelijking (grijswaarden, 128 px breed) van lokale WebP met het bronbeeld, plus de beste uitsnede-
    positie als de verhouding afwijkt (lokale uitsnede binnen het origineel);
  - zij-aan-zij-JPG (bron | lokaal) voor visuele controle door Claude.

Beslisregel: zelfde opname als de Pearson-correlatie van de grijswaarden >= SAME_MIN_R bij gelijke verhouding of in
de best passende uitsnede (een vaste pixelverschilgrens bleek bij contrastarme beelden niet onderscheidend). Daaronder:
NOT VERIFIED (visueel beoordelen). Rechten: auteur en
licentie uit Commons moeten gelijk zijn aan het register (genormaliseerd).

Gebruik: python tools/media/orig_check.py <manifest.json> --out <map>
"""
from __future__ import annotations

import io
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SAME_MIN_R = 0.90


def diff(a, b) -> float:
    """Negatieve Pearson-correlatie (lager = beter), zodat de zoeklus het minimum kan nemen."""
    import numpy as np
    x, y = np.asarray(a, dtype=float).ravel(), np.asarray(b, dtype=float).ravel()
    x, y = x - x.mean(), y - y.mean()
    return -float(x @ y / (np.sqrt((x @ x) * (y @ y)) + 1e-9))


def compare(src_img, local_img) -> dict:
    """Pure functie (PIL-beelden in). Geeft verschil bij gelijke verhouding of in de best passende uitsnede."""
    from PIL import Image
    s, l = src_img.convert("L"), local_img.convert("L")
    rs, rl = s.width / s.height, l.width / l.height
    W = 128
    if abs(rs - rl) / rs < 0.02:
        h = max(1, round(W / rs))
        return {"mode": "full", "r": round(-diff(s.resize((W, h)), l.resize((W, h))), 3)}
    # lokale foto is een uitsnede: schaal de bron zo dat de lokale korte zijde past en zoek de beste positie
    lw = 96; lh = max(1, round(lw / rl))
    best = None
    for frac in (1.0, 0.9, 0.8, 0.7, 0.6, 0.5):
        if rl < rs:  # lokaal smaller: hoogte bepaalt
            sh = round(lh / frac); sw = round(sh * rs)
        else:
            sw = round(lw / frac); sh = round(sw / rs)
        if sw < lw or sh < lh:
            continue
        big = s.resize((sw, sh)); small = l.resize((lw, lh))
        step = max(1, min(sw - lw, sh - lh) // 12 or 1)
        for x in range(0, sw - lw + 1, step):
            for y in range(0, sh - lh + 1, step):
                d = diff(big.crop((x, y, x + lw, y + lh)), small)
                if best is None or d < best[0]:
                    best = (d, frac, x / sw, y / sh)
    if best is None:
        return {"mode": "crop", "r": None}
    return {"mode": "crop", "r": round(-best[0], 3), "scale": best[1], "offset": [round(best[2], 3), round(best[3], 3)]}


def author_match(info: dict, register: str, norm) -> tuple[bool, str]:
    """R19-QA: auteur van Commons tegen het register. Alleen herleidbare, vaste vormen tellen als gelijk:
    exact; Flickr-import 'naam from Plaats'; accountachtervoegsel 'naam (…)'; of — bij een leeg Artist-veld —
    expliciete recordist (+ copyright holder) uit de bestandspagina. Leeg of afwijkend blijft False."""
    reg = norm(register or "")
    if not reg:
        return False, "register-empty"
    art = norm(info.get("author") or "")
    if art:
        if art == reg:
            return True, "exact"
        m = re.fullmatch(r"(.+?) from [^()/]+", art)
        if m and norm(m.group(1)) == reg:
            return True, "flickr-location-suffix"
        m = re.fullmatch(r"(.+?)\s*\([^()]+\)", art)
        if m and norm(m.group(1)) == reg:
            return True, "account-suffix"
        return False, "different"
    cf = info.get("creditFields") or {}
    rec, holder = norm(cf.get("recordist") or cf.get("author") or ""), norm(cf.get("copyrightHolder") or "")
    if rec and holder and reg == f"{rec} / {holder}":
        return True, "recordist+copyright-holder"
    if rec and not holder and reg == rec:
        return True, "recordist"
    return False, "commons-author-empty"


def audio_record(e: dict, info: dict | None, norm) -> dict:
    """F3-R16: alleen herkomst en rechten van een gepubliceerde opname (bronlabel). Geen soort- of
    geluidstypebewijs: audioprotocol v0.2 laat dit hoogstens 'alleen bronlabel' zijn; nooit sameShot/VERIFIED."""
    rec = {k: e.get(k) for k in ("speciesId", "audio", "title", "author", "license")}
    rec["kind"] = "audio"
    if not info:
        rec["error"] = "niet gevonden op Commons"
        return rec
    rec["commons"] = {k: info.get(k) for k in ("page", "sha1", "license", "author", "duration", "mime", "creditFields", "pageParams", "creditLines")}
    ok, rule = author_match(info, e.get("author", ""), norm)
    rec["authorRule"] = rule
    rec["rightsMatch"] = ok and norm(info.get("license", "")) == norm(e.get("license", ""))
    rec["evidenceCeiling"] = "bronlabel en rechten; geen soortverificatie"
    return rec


INAT_LICENSES = {"cc0": "CC0", "cc-by": "CC BY 4.0", "cc-by-sa": "CC BY-SA 4.0"}


INAT_ROUTES = (  # F3-REV2-R03b: openbare routes in volgorde; de gebruikte route wordt vastgelegd
    "https://api.inaturalist.org/v1/photos/{id}",
    "https://api.inaturalist.org/v2/photos/{id}?fields=all",
    "https://www.inaturalist.org/photos/{id}.json",
)


def _inat_photo(res):
    """Pak de foto uit een API- of paginaresultaat (v1/v2: results[0]; .json: het object zelf)."""
    if isinstance(res, dict) and isinstance(res.get("results"), list):
        return res["results"][0] if res["results"] else None
    return res if isinstance(res, dict) else None


def inat_rights(ci, e: dict) -> dict:
    """F3-REV2-R02/R03b: licentie en naamsvermelding van een iNaturalist-foto via openbare routes.
    Alleen CC0 / CC BY / CC BY-SA tellen; NC/ND of onbekend geeft rightsMatch False. Auteur moet in de attributie staan.
    Waarnemingscontext (plaats, datum, taxon) wordt alleen gelezen, nooit als rechtenbewijs gebruikt."""
    pid, errors = int(e["inatPhotoId"]), []
    for route in INAT_ROUTES:
        url = route.format(id=pid)
        try:
            photo = _inat_photo(ci.get(url))
        except Exception as err:  # route onbereikbaar: volgende proberen, niets claimen
            errors.append(f"{url.split('?')[0]}: {str(err)[:80]}"); continue
        if not photo or not (photo.get("license_code") or photo.get("attribution")):
            errors.append(f"{url.split('?')[0]}: geen licentiegegevens"); continue
        code, attribution = photo.get("license_code") or "", photo.get("attribution") or ""
        lic = INAT_LICENSES.get(code)
        same = bool(lic) and lic == e.get("license") and (e.get("author") or "").casefold() in attribution.casefold()
        out = {"inat": {"route": url.split("?")[0], "licenseCode": code, "license": lic, "attribution": attribution[:200]}, "rightsMatch": same}
        obs = [o.get("id") if isinstance(o, dict) else o for o in (photo.get("observations") or photo.get("observation_ids") or [])]
        if obs and obs[0]:
            try:
                o = ci.get(f"https://api.inaturalist.org/v1/observations/{int(obs[0])}")["results"][0]
                out["inat"]["observation"] = {"id": o.get("id"), "placeGuess": o.get("place_guess"), "observedOn": o.get("observed_on"),
                                              "taxon": (o.get("taxon") or {}).get("name"), "qualityGrade": o.get("quality_grade")}
            except Exception as err:
                out["inat"]["observationError"] = str(err)[:120]
        if errors:
            out["inat"]["triedFirst"] = errors
        return out
    return {"inat": {"error": "; ".join(errors)[:300]}, "rightsMatch": None}


def full_crop(ci, info: dict, crop, out: Path, stem: str) -> dict:
    """F3-REV2-R03c: origineel downloaden (SHA-1 tegen Commons), een uitsnede op volle resolutie en een overzicht
    opslaan voor visuele beoordeling. Alleen reviewmateriaal: niets wordt in de app gezet."""
    import hashlib
    from PIL import Image, ImageOps
    data = ci.get(info["url"], binary=True)
    rec = {"originalBytes": len(data), "sha1Verified": hashlib.sha1(data).hexdigest() == info.get("sha1")}
    img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    rec["originalSize"] = [img.width, img.height]
    box = ci.crop_box(img.size, crop) if crop else None
    if box:
        img.crop(box).save(out / f"{stem}_full_crop.jpg", quality=92)
        rec["fullCrop"] = {"file": f"{stem}_full_crop.jpg", "box": list(box), "note": "uitsnede op oorspronkelijke resolutie, niet verkleind"}
    ov = img.copy(); ov.thumbnail((1400, 1400)); ov.save(out / f"{stem}_overview.jpg", quality=85)
    rec["overview"] = f"{stem}_overview.jpg"
    return rec


def candidate_record(ci, e: dict, info: dict | None, out: Path) -> dict:
    """F3-REV2-R03c: kandidaat zonder lokaal bestand - bronpagina-metadata en origineel op volle resolutie."""
    rec = {k: e.get(k) for k in ("id", "speciesId", "title", "proposedRole")}
    rec["kind"] = "candidate"
    if not info:
        rec["error"] = "niet gevonden op Commons"; return rec
    rec["commons"] = {k: info.get(k) for k in ("page", "sha1", "license", "licenseUrl", "author", "credit", "width", "height", "creditFields", "pageParams")}
    rec["commonsContext"] = {k: info.get(k) for k in ("description", "date", "categories")}
    rec["licenseAllowed"] = ci.license_ok(info.get("license", ""))
    try:
        rec.update(full_crop(ci, info, e.get("fullCrop"), out, e["id"]))
    except Exception as err:
        rec["error"] = str(err)[:200]
    return rec


def run(manifest: Path, out: Path) -> None:
    sys.path.insert(0, str(Path(__file__).parent))
    import commons_intake as ci
    from PIL import Image
    spec = json.loads(manifest.read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    titles = [e["title"] for e in spec["items"] if e.get("title")]
    infos = {}
    for k in range(0, len(titles), 20):
        infos.update(ci.imageinfo(titles[k:k + 20], thumb=800))
    report = {"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "rule": {"sameMinR": SAME_MIN_R}, "items": []}
    for e in spec["items"]:
        if e.get("kind") == "audio":
            report["items"].append(audio_record(e, infos.get(e["title"]), ci.norm_name))
            continue
        if e.get("kind") == "candidate":
            report["items"].append(candidate_record(ci, e, infos.get(e["title"]), out))
            continue
        rec = {k: e.get(k) for k in ("speciesId", "image", "title", "author", "license")}
        local = Image.open(ROOT / e["image"].lstrip("/"))
        rec["localSize"] = list(local.size)
        try:
            if e.get("title"):
                info = infos.get(e["title"])
                if not info:
                    rec["error"] = "niet gevonden op Commons"; report["items"].append(rec); continue
                rec["commons"] = {k: info.get(k) for k in ("page", "sha1", "license", "author", "width", "height", "creditFields")}
                # F3-REV2-R02: herkomstcontext (beschrijving, opnamedatum, categorieën) voor soort/regio-controle.
                rec["commonsContext"] = {k: info.get(k) for k in ("description", "date", "categories")}
                ok, rule = author_match(info, e.get("author", ""), ci.norm_name)
                rec["authorRule"] = rule
                rec["rightsMatch"] = ok and ci.norm_name(info["license"]) == ci.norm_name(e.get("license", ""))
                data = ci.get(info["thumb"], binary=True)
            else:
                data = None
                for url in e["urls"]:
                    try:
                        data = ci.get(url, binary=True); rec["sourceUrl"] = url; break
                    except Exception as err:  # volgende extensie proberen
                        rec.setdefault("urlErrors", []).append(f"{url}: {err}")
                if data is None:
                    rec["error"] = "bron niet bereikbaar"; report["items"].append(rec); continue
                rec["rightsMatch"] = None  # metadata niet via API; register blijft bron
                if e.get("inatPhotoId"):
                    rec.update(inat_rights(ci, e))
            src = Image.open(io.BytesIO(data)); src.load()
            rec["sourceSize"] = [src.width, src.height]
            rec.update(compare(src, local))
            r = rec.get("r")
            rec["sameShot"] = r is not None and r >= SAME_MIN_R
            name = Path(e["image"]).stem + "_vs_source.jpg"
            h = 360
            a = src.convert("RGB"); a.thumbnail((640, h)); b = local.convert("RGB"); b.thumbnail((640, h))
            sheet = Image.new("RGB", (a.width + b.width + 8, max(a.height, b.height)), "white")
            sheet.paste(a, (0, 0)); sheet.paste(b, (a.width + 8, 0)); sheet.save(out / name, quality=82)
            rec["sideBySide"] = name
            if e.get("fullCrop") and e.get("title"):
                rec.update(full_crop(ci, infos[e["title"]], e["fullCrop"], out, Path(e["image"]).stem))
        except Exception as err:
            rec["error"] = str(err)[:200]
        report["items"].append(rec)
    (out / "origcheck.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("origcheck:", len(report["items"]), "foto's,", sum(1 for i in report["items"] if i.get("sameShot")), "zelfde opname")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else ROOT / "docs/media-intake/origcheck"
    run(Path(sys.argv[1]), out)
