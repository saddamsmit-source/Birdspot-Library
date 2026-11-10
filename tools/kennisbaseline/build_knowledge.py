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
- doorslaggevend alleen met bronnen van >=2 verschillende uitgevers en een context (regel 10-11-2026).
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


def species_ids():
    text = (ROOT / "src" / "data" / "species.js").read_text(encoding="utf-8")
    return set(re.findall(r"id:'(sp\d{3})'", text))


def validate(data, ids):
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
        for i, d in enumerate(k.get("discrepancies", [])):
            claim(sid, f"discrepancies[{i}]", d, text_field="source")
    return errors


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    errors = validate(data, species_ids())
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
