"""Bouwt src/data/speciesKnowledge.js uit tools/kennisbaseline/knowledge.json en weigert ongeldige profielen.

Validatie (contract v0.1):
- elke soortsleutel bestaat als Birdspot-ID in src/data/species.js;
- elke bewering (summary, keyMarks, caution, critical, similar, detail, voice, basis.size, habitat,
  status, life, discrepancies) heeft een niet-lege tekst en alleen bestaande bronsleutels;
- inhoudelijke beweringen hebben minstens één bron (uitzondering: 'similar' die naar een bestaande
  Birdspot-vergelijking verwijst mag leeg zijn en wordt dan als zodanig getoond);
- betrouwbaarheid is doorslaggevend | ondersteunend | onbetrouwbaar-alleen;
- vs- en similar-ID's bestaan en verwijzen niet naar de soort zelf;
- keyMarks 3–5 stuks;
- doorslaggevend alleen met bronnen van >=2 verschillende uitgevers en een context (regel 10-11-2026);
- biometrie (docs/BIRDSPOT_KWALITEITSNORM.md §1): >=2 uitgevers, display volgt exact uit gemiddelde
  grenzen + afronding en begint met "ca." (KV-13); display gelijk aan size.<field> in species.js (KV-14).
Gebruik: python3 -I tools/kennisbaseline/build_knowledge.py [--check]
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "tools" / "kennisbaseline" / "knowledge.json"
OUT = ROOT / "src" / "data" / "speciesKnowledge.js"
RELIABILITY = {"doorslaggevend", "ondersteunend", "onbetrouwbaar-alleen"}
LIST_FIELDS = ("detail", "voice", "habitat", "status", "life")


BIO_FIELDS = {"length", "wingspan", "weight"}
BIO_UNITS = {"cm", "g"}


def species_ids():
    text = (ROOT / "src" / "data" / "species.js").read_text(encoding="utf-8")
    return set(re.findall(r"id:'(sp\d{3})'", text))


def species_sizes():
    """size-object per ID uit species.js, als {veld: tekst}."""
    text = (ROOT / "src" / "data" / "species.js").read_text(encoding="utf-8")
    out = {}
    for chunk in re.split(r"(?=\{\s*id:'sp\d{3}')", text):
        m = re.match(r"\{\s*id:'(sp\d{3})'", chunk)
        if not m:
            continue
        size = re.search(r"\bsize:\{([^}]*)\}", chunk)
        out[m.group(1)] = dict(re.findall(r"(\w+):'([^']*)'", size.group(1))) if size else {}
    return out


def bio_step(value, unit):
    if unit == "cm":
        return 1 if value < 30 else 5
    if value < 100:
        return 1
    return 10 if value < 1000 else 50


def bio_round(value, unit):
    step = bio_step(value, unit)
    return int((value / step) + 0.5) * step


def bio_display(values, unit):
    """Kwaliteitsnorm §1.1: gemiddelde onder- en bovengrens, afgerond, als 'ca. X–Y unit'."""
    lo = sum(v["min"] for v in values) / len(values)
    hi = sum(v["max"] for v in values) / len(values)
    return f"ca. {bio_round(lo, unit)}–{bio_round(hi, unit)} {unit}"


def validate(data, ids, sizes=None):
    errors = []
    sources = data.get("_sources", {})
    for key, src in sources.items():
        for field in ("label", "url", "edition", "scope", "confirms", "checked", "certainty", "publisher"):
            if not str(src.get(field, "")).strip():
                errors.append(f"bron {key}: veld {field} ontbreekt")

    def claim(sid, where, item, need_source=True, text_field="text"):
        if not isinstance(item, dict) or not str(item.get(text_field, "")).strip():
            errors.append(f"{sid} {where}: lege tekst")
            return
        refs = item.get("sources", [])
        if need_source and not refs:
            errors.append(f"{sid} {where}: bewering zonder bron")
        for ref in refs:
            if ref not in sources:
                errors.append(f"{sid} {where}: onbekende bron {ref}")

    def decisive(sid, where, item):
        # Regel 10-11-2026: doorslaggevend alleen met >=2 bronnen van verschillende uitgevers en een context.
        if item.get("reliability") != "doorslaggevend":
            return
        pubs = {sources.get(r, {}).get("publisher") for r in item.get("sources", [])} - {None}
        if len(pubs) < 2:
            errors.append(f"{sid} {where}: doorslaggevend zonder twee onafhankelijke uitgevers")
        if where.startswith("critical") and not str(item.get("conditions", "")).strip(" —-"):
            errors.append(f"{sid} {where}: doorslaggevend zonder context (conditions)")
        # FQA-04 (10-11-2026): een keyMark heeft geen context- of uitzonderingenveld en mag dus nooit doorslaggevend zijn;
        # een kritisch kenmerk heeft een expliciete diagnostische onderbouwing nodig.
        if where.startswith("keyMarks"):
            errors.append(f"{sid} {where}: doorslaggevend alleen bij een kritisch kenmerk met context, niet bij een veldkenmerk")
        if where.startswith("critical") and not str(item.get("diagnostic", "")).strip():
            errors.append(f"{sid} {where}: doorslaggevend zonder diagnostische onderbouwing (diagnostic)")

    for sid, k in data.items():
        if sid.startswith("_"):
            continue
        if sid not in ids:
            errors.append(f"{sid}: onbekend Birdspot-ID")
            continue
        claim(sid, "summary", k.get("summary"))
        marks = k.get("keyMarks", [])
        if not 3 <= len(marks) <= 5:
            errors.append(f"{sid}: {len(marks)} keyMarks (verwacht 3–5)")
        for i, m in enumerate(marks):
            claim(sid, f"keyMarks[{i}]", m)
            if m.get("reliability") not in RELIABILITY:
                errors.append(f"{sid} keyMarks[{i}]: ongeldige betrouwbaarheid {m.get('reliability')}")
            decisive(sid, f"keyMarks[{i}]", m)
        if k.get("caution") is not None:
            claim(sid, "caution", k["caution"])
        for i, c in enumerate(k.get("critical", [])):
            claim(sid, f"critical[{i}]", c, text_field="this")
            for field in ("feature", "where", "other", "conditions", "exceptions", "supporting"):
                if not str(c.get(field, "")).strip():
                    errors.append(f"{sid} critical[{i}]: veld {field} leeg")
            if c.get("reliability") not in RELIABILITY:
                errors.append(f"{sid} critical[{i}]: ongeldige betrouwbaarheid {c.get('reliability')}")
            decisive(sid, f"critical[{i}]", c)
            for vs in c.get("vs", []):
                if vs not in ids or vs == sid:
                    errors.append(f"{sid} critical[{i}]: ongeldige vergelijkingssoort {vs}")
        for i, s in enumerate(k.get("similar", [])):
            if s.get("id") not in ids or s.get("id") == sid:
                errors.append(f"{sid} similar[{i}]: ongeldige soort {s.get('id')}")
            claim(sid, f"similar[{i}]", s, need_source=False, text_field="why")
        for field in LIST_FIELDS:
            for i, item in enumerate(k.get(field, [])):
                claim(sid, f"{field}[{i}]", item)
        size = k.get("basis", {}).get("size")
        if size:
            claim(sid, "basis.size", size)
        for i, b in enumerate(k.get("basis", {}).get("biometrics", [])):
            where = f"{sid} basis.biometrics[{i}]"
            if b.get("field") not in BIO_FIELDS or b.get("unit") not in BIO_UNITS:
                errors.append(f"{where}: ongeldig veld of eenheid")
                continue
            vals = b.get("values", [])
            bad = [v for v in vals + b.get("excluded", []) if v.get("source") not in sources
                   or not isinstance(v.get("min"), (int, float)) or not isinstance(v.get("max"), (int, float))
                   or v["min"] > v["max"]]
            if bad:
                errors.append(f"{where}: bronwaarde zonder geldige bron of min/max")
                continue
            pubs = {sources[v["source"]].get("publisher") for v in vals}
            if len(vals) < 2 or len(pubs) < 2:
                errors.append(f"{where}: KV-13 minder dan twee uitgevers")
            for x in b.get("excluded", []):
                if not str(x.get("reason", "")).strip():
                    errors.append(f"{where}: KV-13 uitgesloten waarde zonder reden")
            if vals and b.get("display") != bio_display(vals, b["unit"]):
                errors.append(f"{where}: KV-13 display {b.get('display')!r} wijkt af van berekening {bio_display(vals, b['unit'])!r}")
            if sizes is not None and sizes.get(sid, {}).get(b["field"]) != b.get("display"):
                errors.append(f"{where}: KV-14 species.js size.{b['field']} = {sizes.get(sid, {}).get(b['field'])!r}, verwacht {b.get('display')!r}")
        for i, d in enumerate(k.get("discrepancies", [])):
            claim(sid, f"discrepancies[{i}]", d, text_field="source")
    return errors


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    errors = validate(data, species_ids(), species_sizes())
    if errors:
        print("Kennisprofielen ongeldig:\n- " + "\n- ".join(errors))
        sys.exit(1)
    profiles = {sid: k for sid, k in data.items() if not sid.startswith("_")}
    payload = {"sources": data["_sources"], "profiles": profiles}
    js = ("/**\n * Birdspot Library — kennisprofielen per soort (contract v0.1, proef).\n"
          " * GEGENEREERD door tools/kennisbaseline/build_knowledge.py uit tools/kennisbaseline/knowledge.json — niet met de hand wijzigen.\n */\n"
          f"const DATA = {json.dumps(payload, ensure_ascii=False, indent=1)};\n"
          "export const KNOWLEDGE_SOURCES = Object.freeze(DATA.sources);\n"
          "export const KNOWLEDGE = Object.freeze(DATA.profiles);\n")
    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != js:
            print("speciesKnowledge.js loopt niet gelijk met knowledge.json; draai build_knowledge.py")
            sys.exit(1)
        print(f"OK: {len(profiles)} kennisprofielen, {len(data['_sources'])} bronnen, gelijk aan de bron")
        return
    OUT.write_text(js, encoding="utf-8")
    print(f"{OUT.relative_to(ROOT)}: {len(profiles)} kennisprofielen, {len(data['_sources'])} bronnen")


if __name__ == "__main__":
    main()
