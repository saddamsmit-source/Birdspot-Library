import json, urllib.parse, urllib.request
from pathlib import Path
H = Path(__file__).resolve().parent; out = H / "wikitext"; out.mkdir(exist_ok=True)
UA = {"User-Agent": "BirdspotLibrary-source-audit/1.0 (GitHub: saddamsmit-source/Birdspot-Library)"}
for t in json.loads((H / "wikitext_titles.json").read_text()):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "revisions", "rvprop": "content", "rvslots": "main", "titles": t})
    d = json.loads(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + q, headers=UA), timeout=40).read())
    p = next(iter(d["query"]["pages"].values()))
    txt = p.get("revisions", [{}])[0].get("slots", {}).get("main", {}).get("*", "MISSING")
    (out / (t.replace("File:", "").replace("/", "_") + ".txt")).write_text(txt)
