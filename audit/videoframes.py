import json, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from source_audit import match, load_cv, pair, UA  # noqa: E402
H = Path(__file__).resolve().parent; out = H / "videoframes"; out.mkdir(exist_ok=True)
items = json.loads((H / "videoframes.json").read_text()); res = []
for it in items:
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|sha1", "titles": it["title"]})
    p = next(iter(json.loads(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=UA), timeout=40).read())["query"]["pages"].values()))
    url = p["imageinfo"][0]["url"]; vid = out / "v.webm"
    vid.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120).read())
    best = None
    for dt in (-0.2, -0.1, 0, 0.1, 0.2):
        f = out / "f.png"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(max(0, it["t"] + dt)), "-i", str(vid), "-frames:v", "1", str(f)], check=True)
        m = match(load_cv(f), load_cv(Path("app") / it["image"].lstrip("/")))
        if not best or m["inliers"] > best[1]["inliers"]: best = (dt, m, f.read_bytes())
    (out / "best.png").write_bytes(best[2])
    pair(load_cv(out / "best.png"), load_cv(Path("app") / it["image"].lstrip("/")), out / (Path(it["image"]).stem + ".jpg"), f"{it['title']} @ {it['t']}s (+{best[0]})")
    res.append({"image": it["image"], "title": it["title"], "t": it["t"], "offset": best[0], "match": best[1], "sha1": p["imageinfo"][0]["sha1"]})
    vid.unlink()
(out / "results.json").write_text(json.dumps(res, indent=1))
