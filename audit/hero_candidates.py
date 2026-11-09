#!/usr/bin/env python3
"""Kandidaten voor een aparte hoofdfoto (bevestigd volwassen mannetje) per soort, alleen Wikimedia Commons.

Filter: vrije licentie (CC0, PD, CC BY, CC BY-SA), langste zijde >= 1200 px, 'male' in titel/beschrijving/categorie,
geen vrouw/juveniel/gevangenschap/museum/in de hand/nest, wetenschappelijke naam aanwezig, niet al in gebruik.
Schrijft candidates.json en per soort een contactsheet met genummerde kandidaten. Beslist niets: keuze volgt na visuele controle.
"""
from __future__ import annotations
import html, io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

HERE = Path(__file__).resolve().parent
OUT = HERE / "out_heroes"; (OUT / "sheets").mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "BirdspotLibrary-photo-review/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}
OK_LIC = re.compile(r"^(CC0|Public domain|PD|CC BY(-SA)? [1-4]\.0)", re.I)
BAD = re.compile(r"\b(female|femelle|weibchen|juvenile|juv|immature|young|chick|nest|egg|captive|captivity|zoo|tierpark|vogelpark|aviary|museum|specimen|taxidermy|mounted|stuffed|skin|in hand|ringing|ringed|beringung|rehab|rescue|dead|road ?kill|hybrid|leucistic|drawing|illustration|painting|stamp)\b", re.I)
MALE = re.compile(r"\b(male|mâle|männchen|mannetje|macho|maschio|drake|♂)\b", re.I)

def get(url, binary=False):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                d = r.read(); return d if binary else json.loads(d)
        except Exception:  # noqa: BLE001
            if i == 3: raise
            time.sleep(3 + 3 * i)

def text(v):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html.unescape(str(v or "")))).strip()

def search(latin, used):
    titles = []
    for q in (f'"{latin}" male', f'{latin} male adult', f'incategory:"{latin}" male'):
        p = urllib.parse.urlencode({"action": "query", "format": "json", "list": "search", "srnamespace": 6, "srlimit": 50, "srsearch": q + " filetype:bitmap"})
        titles += [s["title"] for s in get("https://commons.wikimedia.org/w/api.php?" + p)["query"]["search"]]
        time.sleep(0.6)
    titles = list(dict.fromkeys(titles))
    out = []
    for i in range(0, len(titles), 40):
        p = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo|categories", "cllimit": "max",
                                    "iiprop": "url|size|sha1|extmetadata|mime", "iiurlwidth": 900, "titles": "|".join(titles[i:i + 40])})
        for pg in get("https://commons.wikimedia.org/w/api.php?" + p)["query"]["pages"].values():
            ii = (pg.get("imageinfo") or [None])[0]
            if not ii or ii.get("mime") not in ("image/jpeg", "image/png", "image/webp"): continue
            em = ii.get("extmetadata", {}); cats = [c["title"][9:] for c in pg.get("categories", [])]
            lic = text(em.get("LicenseShortName", {}).get("value"))
            desc = text(em.get("ImageDescription", {}).get("value"))[:1200]
            blob = " ".join([pg["title"], desc, " ".join(cats)])
            src = "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(pg["title"].replace(" ", "_"))
            reasons = []
            if not OK_LIC.search(lic): reasons.append("licentie " + lic)
            if max(ii["width"], ii["height"]) < 1200: reasons.append("te klein")
            if not MALE.search(blob): reasons.append("geen 'male'")
            if BAD.search(blob): reasons.append("uitgesloten: " + BAD.search(blob).group(0))
            if not re.search(latin.replace(" ", "[ _]"), blob, re.I): reasons.append("naam ontbreekt")
            if src in used or pg["title"].replace("File:", "").replace(" ", "_") in used: reasons.append("al in gebruik")
            if reasons: continue
            q = 2 if any("Quality images" in c or "Featured pictures" in c for c in cats) else 1 if any("Valued images" in c for c in cats) else 0
            out.append({"title": pg["title"], "source": src, "author": text(em.get("Artist", {}).get("value")), "license": lic,
                        "licenseUrl": text(em.get("LicenseUrl", {}).get("value")), "width": ii["width"], "height": ii["height"],
                        "sha1": ii["sha1"], "original": ii["url"], "thumb": ii.get("thumburl"), "description": desc[:400],
                        "categories": cats[:15], "quality": q})
        time.sleep(0.6)
    out.sort(key=lambda c: (-c["quality"], -min(c["width"], c["height"])))
    return out[:8]

def sheet(sid, nl, cands):
    tiles = []
    for n, c in enumerate(cands, 1):
        im = ImageOps.exif_transpose(Image.open(io.BytesIO(get(c["thumb"], binary=True)))).convert("RGB")
        im.thumbnail((440, 330)); t = Image.new("RGB", (450, 372), "white"); t.paste(im, (5, 5))
        d = ImageDraw.Draw(t); d.text((5, 338), f"#{n} {c['license']} {c['width']}x{c['height']} q{c['quality']}", fill="black"); d.text((5, 354), c["title"][5:70], fill="darkred")
        tiles.append(t); time.sleep(0.4)
    if not tiles: return
    cols = 4; rows = (len(tiles) + cols - 1) // cols
    s = Image.new("RGB", (cols * 450, rows * 372 + 24), "white"); ImageDraw.Draw(s).text((6, 6), f"{sid} {nl}", fill="black")
    for i, t in enumerate(tiles): s.paste(t, ((i % cols) * 450, 24 + (i // cols) * 372))
    s.save(OUT / "sheets" / f"{sid}.jpg", quality=80)

def main():
    species = json.loads((HERE / "hero_species.json").read_text())
    used = set(json.loads((HERE / "used_sources.json").read_text()))
    res = {}
    for sp in species:
        try:
            c = search(sp["latin"], used); res[sp["id"]] = c; sheet(sp["id"], sp["nl"], c)
            print(sp["id"], len(c), flush=True)
        except Exception as e:  # noqa: BLE001
            res[sp["id"]] = {"error": str(e)[:200]}; print(sp["id"], "FOUT", e, flush=True)
    (OUT / "candidates.json").write_text(json.dumps(res, indent=1, ensure_ascii=False))

if __name__ == "__main__":
    main()
