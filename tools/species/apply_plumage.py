"""Normaliseer het verenkleed in src/data/species.js en voeg seizoenskleed toe.

Gebruik (vanuit repo-root):  python tools/species/apply_plumage.py

plumage = { adult_m, adult_f, juv, jaarling, breeding, winter, eclipse }
  breeding = broedkleed (zomerkleed), winter = winterkleed, eclipse = eclipskleed (eenden).
Bron voor seizoenskleed: tools/species/seasonal_plumage.json (sleutel = wetenschappelijke naam).
Het script is idempotent.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src" / "data" / "species.js"
SEASONAL = json.loads((ROOT / "tools" / "species" / "seasonal_plumage.json").read_text(encoding="utf-8"))
KEYS = ["adult_m", "adult_f", "juv", "jaarling", "breeding", "winter", "eclipse"]


def js(v):
    return "null" if v is None else "'" + str(v).replace("\\", "\\\\").replace("'", "\\'") + "'"


def literal_end(text, start):
    """Index na de bij `start` ('{') horende sluitaccolade; houdt rekening met strings."""
    depth, i, quote = 0, start, None
    while i < len(text):
        c = text[i]
        if quote:
            if c == "\\":
                i += 2
                continue
            if c == quote:
                quote = None
        elif c in "'\"":
            quote = c
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError("onafgesloten plumage-literal")


def parse_value(src):
    """Minimale parser voor de plumage-literal: strings, null en geneste {adult_m:'...'}."""
    src = src.strip()
    if src == "null":
        return None
    if src.startswith("'"):
        out, i = [], 1
        while src[i] != "'":
            if src[i] == "\\":
                out.append(src[i + 1]); i += 2
            else:
                out.append(src[i]); i += 1
        return "".join(out)
    if src.startswith("{"):
        return parse_object(src)
    raise ValueError(src[:40])


def parse_object(src):
    body = src.strip()[1:-1]
    obj, i = {}, 0
    while i < len(body):
        m = re.match(r"\s*,?\s*([a-z_]+)\s*:\s*", body[i:])
        if not m:
            break
        key = m.group(1)
        i += m.end()
        if body[i] == "'":
            j = i + 1
            while body[j] != "'":
                j += 2 if body[j] == "\\" else 1
            obj[key] = parse_value(body[i:j + 1]); i = j + 1
        elif body[i] == "{":
            j = literal_end(body, i)
            obj[key] = parse_value(body[i:j]); i = j
        else:
            m2 = re.match(r"null", body[i:])
            obj[key] = None; i += m2.end()
    return obj


def strip_seasonal(text):
    parts = [p.strip() for p in (text or "").split(";")]
    keep = [p for p in parts if p and not re.match(r"(?i)^(zomer|winter|broedkleed)\s*:", p)]
    return "; ".join(keep) if keep else None


def normalise(sci, p):
    out = {k: p.get(k) for k in KEYS}
    b = p.get("breeding")
    if isinstance(b, dict):
        out["breeding"] = b.get("adult_m")
    elif isinstance(b, str) and b.lower().startswith("eclips"):
        out["breeding"], out["eclipse"] = None, b
    extra = SEASONAL.get(sci, {})
    for k in ("breeding", "winter", "eclipse"):
        if extra.get(k):
            out[k] = extra[k]
    if extra.get("breeding") and extra.get("winter") and re.search(r"(?i)(zomer|winter)\s*:", out["adult_m"] or ""):
        out["adult_m"] = strip_seasonal(out["adult_m"]) or "Verschilt per seizoen: zie broedkleed en winterkleed"
    for k in KEYS:
        if isinstance(out[k], str) and out[k]:
            out[k] = out[k][0].upper() + out[k][1:]
    return out


def main():
    text = SRC.read_text(encoding="utf-8")
    pos, changed, done = 0, 0, set()
    while True:
        m = re.compile(r"nameSci:'((?:[^'\\]|\\.)*)'").search(text, pos)
        if not m:
            break
        sci = m.group(1)
        pm = re.compile(r"plumage:(\{|null)").search(text, m.end())
        nxt = re.compile(r"\{ id:'sp\d+'").search(text, m.end())
        if not pm or (nxt and pm.start() > nxt.start()) or pm.group(1) == "null":
            pos = m.end()
            continue
        start = pm.start() + len("plumage:")
        end = literal_end(text, start)
        old = text[start:end]
        new_obj = normalise(sci, parse_object(old))
        new = "{ " + ", ".join(f"{k}:{js(new_obj[k])}" for k in KEYS) + " }"
        if new != old:
            text = text[:start] + new + text[end:]
            changed += 1
        done.add(sci)
        pos = start + len(new)
    missing = [k for k in SEASONAL if not k.startswith("_") and k not in done]
    if missing:
        raise SystemExit(f"Seizoenskleed voor onbekende soorten: {missing}")
    SRC.write_text(text, encoding="utf-8")
    print(f"{changed} verenkleed-records bijgewerkt, {len(done)} soorten met verenkleed")


if __name__ == "__main__":
    main()
