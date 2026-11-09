#!/usr/bin/env python3
"""Birdspot bronaudit gidsfoto's (build-time, alleen in GitHub Actions).

Per foto in manifest.json:
  1. bronpagina opvragen (Wikimedia Commons API of iNaturalist API): maker, licentie, titel,
     beschrijving, categorieën, taxon en annotaties (geslacht / levensfase);
  2. bronbeeld downloaden en met het app-beeld vergelijken (ORB + RANSAC, ook gespiegeld):
     zelfde opname, uitsnede-aandeel, spiegeling;
  3. soort, maker, licentie en geslacht/leeftijd uit de bron naast de app-gegevens zetten.
Schrijft results.json en, voor gemarkeerde of afwijkende foto's, een zij-aan-zij-beeld.
Leest geen app-code; verandert niets aan de app.
"""
from __future__ import annotations
import html, io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageOps, ImageDraw

HERE = Path(__file__).resolve().parent
APP = Path(sys.argv[1] if len(sys.argv) > 1 else "app")
OUT = HERE / "out"; (OUT / "pairs").mkdir(parents=True, exist_ok=True)
UA = {"User-Agent": "BirdspotLibrary-source-audit/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}

def get(url, binary=False, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                data = r.read()
                return data if binary else json.loads(data.decode("utf-8"))
        except Exception as e:  # noqa: BLE001
            if i == tries - 1: raise
            time.sleep(2 + 3 * i)

def text(v):
    v = re.sub(r"<[^>]+>", " ", html.unescape(str(v or "")))
    return re.sub(r"\s+", " ", v).strip()

SEX = [("female", r"\b(female|femelle|weibchen|vrouwtje|hembra|femmina|samice|♀|hen)\b"),
       ("male", r"\b(male|mâle|male|männchen|mannetje|macho|maschio|samec|♂|drake|cock)\b")]
AGE = [("juvenile", r"\b(juvenile|juv\.?|juvénile|jungvogel|jong|juveniel|immature|first[- ]year|1st[- ]year|1cy|2cy|young)\b"),
       ("chick", r"\b(chick|chicks|pullus|nestling|duckling|gosling|küken|kuiken|pull)\b"),
       ("adult", r"\b(adult|adulte|adulto|volwassen|altvogel)\b")]

def classify(blob):
    b = blob.lower()
    sex = [k for k, rx in SEX if re.search(rx, b)]
    if "female" in sex and "male" in sex and not re.search(r"\bmale\b(?!.*female)", b): pass
    age = [k for k, rx in AGE if re.search(rx, b)]
    return sex, age

def commons(items):
    titles = {it["image"]: "File:" + urllib.parse.unquote(it["source"].split("/wiki/File:")[1]).replace("_", " ") for it in items}
    meta = {}
    ts = list(set(titles.values()))
    for i in range(0, len(ts), 40):
        q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo|categories", "cllimit": "max",
                                    "iiprop": "url|size|sha1|extmetadata", "iiurlwidth": "1280", "titles": "|".join(ts[i:i + 40])})
        data = get("https://commons.wikimedia.org/w/api.php?" + q)
        norm = {n["to"]: n["from"] for n in data["query"].get("normalized", [])}
        for p in data["query"]["pages"].values():
            t = norm.get(p["title"], p["title"])
            if "imageinfo" not in p: meta[t] = {"missing": True}; continue
            ii = p["imageinfo"][0]; em = ii.get("extmetadata", {})
            meta[t] = {"title": p["title"], "author": text(em.get("Artist", {}).get("value")), "license": text(em.get("LicenseShortName", {}).get("value")),
                       "description": text(em.get("ImageDescription", {}).get("value"))[:1500], "objectName": text(em.get("ObjectName", {}).get("value")),
                       "categories": [c["title"].replace("Category:", "") for c in p.get("categories", [])],
                       "width": ii.get("width"), "height": ii.get("height"), "sha1": ii.get("sha1"), "thumb": ii.get("thumburl") or ii.get("url")}
        time.sleep(1)
    return {img: meta.get(t, {"missing": True}) for img, t in titles.items()}

def inat(it):
    pid = re.search(r"/photos/(\d+)", it["source"]).group(1)
    obs = None
    try:
        r = get(f"https://api.inaturalist.org/v1/observations?photo_id={pid}&per_page=1")
        obs = (r.get("results") or [None])[0]
    except Exception:  # noqa: BLE001
        obs = None
    if not obs:
        page = get(f"https://www.inaturalist.org/photos/{pid}.json") if False else None
        raise RuntimeError(f"Geen observatie voor iNaturalist-foto {pid}")
    ph = next((p for p in obs.get("photos", []) if str(p.get("id")) == pid), {})
    ann = [f"{a.get('controlled_attribute', {}).get('label')}: {a.get('controlled_value', {}).get('label')}" for a in obs.get("annotations", [])]
    url = (ph.get("url") or "").replace("square", "large")
    time.sleep(1.2)
    return {"title": f"iNaturalist {obs.get('id')}", "observation": f"https://www.inaturalist.org/observations/{obs.get('id')}",
            "author": text(ph.get("attribution")), "license": (ph.get("license_code") or "").upper(),
            "taxon": (obs.get("taxon") or {}).get("name"), "taxonCommon": (obs.get("taxon") or {}).get("preferred_common_name"),
            "qualityGrade": obs.get("quality_grade"), "annotations": ann, "description": text(obs.get("description"))[:800],
            "thumb": url}

def load_cv(data_or_path):
    if isinstance(data_or_path, (bytes, bytearray)):
        im = Image.open(io.BytesIO(data_or_path))
    else:
        im = Image.open(data_or_path)
    im = ImageOps.exif_transpose(im).convert("RGB")
    return im

orb = cv2.ORB_create(3000)
bf = cv2.BFMatcher(cv2.NORM_HAMMING)
def match(src_im, app_im):
    def prep(im):
        g = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY); s = 1000 / max(g.shape)
        return cv2.resize(g, None, fx=s, fy=s) if s < 1 else g, (s if s < 1 else 1)
    gs, ss = prep(src_im); ga, sa = prep(app_im)
    best = {"inliers": 0}
    for mirror in (False, True):
        gb = cv2.flip(ga, 1) if mirror else ga
        k1, d1 = orb.detectAndCompute(gs, None); k2, d2 = orb.detectAndCompute(gb, None)
        if d1 is None or d2 is None: continue
        good = [m for m, n in (x for x in bf.knnMatch(d2, d1, k=2) if len(x) == 2) if m.distance < 0.75 * n.distance]
        if len(good) < 10: continue
        a = np.float32([k2[m.queryIdx].pt for m in good]); b = np.float32([k1[m.trainIdx].pt for m in good])
        M, mask = cv2.estimateAffinePartial2D(a, b, method=cv2.RANSAC, ransacReprojThreshold=5)
        inl = int(mask.sum()) if mask is not None else 0
        if inl > best["inliers"] and M is not None:
            h, w = gb.shape
            corners = cv2.transform(np.float32([[[0, 0], [w, 0], [w, h], [0, h]]]), M)[0]
            area = cv2.contourArea(corners) / (gs.shape[0] * gs.shape[1])
            best = {"inliers": inl, "mirror": mirror, "scale": round(float(np.hypot(M[0, 0], M[0, 1])), 3), "areaOfSource": round(float(area), 3)}
    return best

def pair(src_im, app_im, path, caption):
    h = 520
    a = src_im.copy(); a.thumbnail((900, h)); b = app_im.copy(); b.thumbnail((900, h))
    c = Image.new("RGB", (a.width + b.width + 30, max(a.height, b.height) + 46), "white")
    c.paste(a, (0, 40)); c.paste(b, (a.width + 30, 40))
    ImageDraw.Draw(c).text((6, 6), caption[:220], fill="black")
    ImageDraw.Draw(c).text((6, 22), "links: bron  |  rechts: app", fill="darkred")
    c.save(path, quality=82)

def norm_author(s):
    return set(w for w in re.findall(r"[a-zà-ÿ0-9]+", (s or "").lower()) if len(w) > 2 and w not in {"the", "from", "own", "work", "uploaded", "photo", "via", "flickr", "inaturalist", "rights", "reserved", "some"})

def norm_lic(s):
    s = (s or "").upper().replace("-", " ").replace("PUBLIC DOMAIN", "PD")
    s = re.sub(r"\s+", " ", s).strip()
    return s.replace("CC0 1.0", "CC0").replace("CC 0", "CC0")

def main():
    items = json.loads((HERE / "manifest.json").read_text())
    only = set(sys.argv[2].split(",")) if len(sys.argv) > 2 and sys.argv[2] else None
    if only: items = [i for i in items if i["species"] in only or i["image"] in only]
    shard = sys.argv[3] if len(sys.argv) > 3 else ""
    if shard:
        k, n = map(int, shard.split("/")); items = items[k::n]
    cm = commons([i for i in items if "commons.wikimedia.org" in i["source"]])
    results = []
    for n, it in enumerate(items, 1):
        r = {"image": it["image"], "species": it["species"], "latin": it["latin"], "app": {k: it.get(k) for k in ("author", "license", "sex", "age", "flight", "label")}, "source": it["source"]}
        try:
            src = cm[it["image"]] if it["image"] in cm else inat(it)
            r["src"] = src
            if src.get("missing"): raise RuntimeError("bron bestaat niet (meer)")
            blob = " ".join([src.get("title", ""), src.get("objectName", ""), src.get("description", ""), " ".join(src.get("categories", [])), " ".join(src.get("annotations", []))])
            genus, sp = it["latin"].split()[:2]
            r["speciesInSource"] = bool(re.search(rf"{genus}[ _]{sp}", blob, re.I) or (src.get("taxon") or "").lower().startswith(it["latin"].lower()))
            r["sourceTaxon"] = src.get("taxon")
            r["sourceSex"], r["sourceAge"] = classify(blob)
            r["authorMatch"] = bool(norm_author(it["author"]) & norm_author(src.get("author")))
            r["licenseMatch"] = norm_lic(it["license"]) == norm_lic(src.get("license"))
            data = get(src["thumb"], binary=True)
            s_im = load_cv(data); a_im = load_cv(APP / it["image"].lstrip("/"))
            r["match"] = match(s_im, a_im)
            r["sameShot"] = r["match"]["inliers"] >= 25
            issues = []
            if not r["speciesInSource"]: issues.append("soort niet in bron")
            if not r["authorMatch"]: issues.append("maker wijkt af")
            if not r["licenseMatch"]: issues.append("licentie wijkt af")
            if not r["sameShot"]: issues.append("bronbeeld niet herkend")
            if it.get("sex") and it["sex"] not in r["sourceSex"]: issues.append(f"geslacht {it['sex']} niet in bron")
            if it.get("age") and it["age"] not in ("adult",) and it["age"] not in r["sourceAge"]: issues.append(f"leeftijd {it['age']} niet in bron")
            if r["match"].get("mirror"): issues.append("gespiegeld")
            r["issues"] = issues
            if it.get("flagged") or issues:
                fn = it["image"].split("/")[-1].replace(".webp", ".jpg")
                pair(s_im, a_im, OUT / "pairs" / fn, f"{it['species']} {it['nl']} · app: {it.get('label') or ''} sex={it.get('sex')} age={it.get('age')} · bron: {src.get('title', '')[:90]}")
                r["pair"] = f"pairs/{fn}"
        except Exception as e:  # noqa: BLE001
            r["error"] = f"{type(e).__name__}: {e}"[:300]
        results.append(r)
        print(n, it["image"], r.get("issues", r.get("error")), flush=True)
        if n % 10 == 0:
            (OUT / f"results{('-' + shard.replace('/', 'of')) if shard else ''}.json").write_text(json.dumps(results, indent=1, ensure_ascii=False))
    (OUT / f"results{('-' + shard.replace('/', 'of')) if shard else ''}.json").write_text(json.dumps(results, indent=1, ensure_ascii=False))
    print("klaar", len(results), "fouten", sum("error" in r for r in results), "met afwijking", sum(bool(r.get("issues")) for r in results))

if __name__ == "__main__":
    main()
