"""Werk de statusvelden in src/data/species.js bij vanuit docs/data/vogellijst-nederland.json.

Gebruik (vanuit repo-root):  python tools/species/apply_status.py

Per bestaande soort (gekoppeld op wetenschappelijke naam) worden gezet:
  category, statusExtra, months, frequency, breeding, redList en de leesbare tekst `status`.
Andere velden en de ID's blijven ongemoeid. Het script is idempotent.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src" / "data" / "species.js"
DATA = ROOT / "docs" / "data" / "vogellijst-nederland.json"

CATEGORY = {
    "Standvogel": "standvogel", "Zomergast": "zomergast", "Wintergast": "wintergast",
    "Doortrekker": "trekvogel", "Schaarse gast": "schaarsegast", "Dwaalgast": "dwaalgast",
    "Exoot": "exoot", "Ontsnapt": "ontsnapt", "Historisch": "historisch",
}
FREQ = {"Algemeen": "algemeen", "Vrij algemeen": "vrij-algemeen", "Schaars": "schaars",
        "Zeldzaam": "zeldzaam", "Zeer zeldzaam": "zeer-zeldzaam", "-": None}
BREEDING = {"Ja": "ja", "Incidenteel": "incidenteel", "Verdwenen": "verdwenen", "Nee": "nee"}
MONTHS = {"jan": "januari", "feb": "februari", "mrt": "maart", "apr": "april", "mei": "mei", "jun": "juni",
          "jul": "juli", "aug": "augustus", "sep": "september", "okt": "oktober", "nov": "november", "dec": "december"}


def js(v):
    return "null" if v is None else "'" + str(v).replace("\\", "\\\\").replace("'", "\\'") + "'"


def months_text(m):
    if m == "jan-dec":
        return "jaarrond"
    if m in ("", "-"):
        return "onregelmatig"
    return ", ".join("–".join(MONTHS.get(x, x) for x in part.split("-")) for part in m.split(","))


def status_text(r):
    t = r["status"]
    if r["extra"]:
        t += ", ook " + r["extra"].lower()
    return f"{t} · {months_text(r['maanden'])}"


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))["species"]
    by_sci = {r["sci"]: r for r in data}
    text = SRC.read_text(encoding="utf-8")
    block = re.compile(r"(\{ id:'sp\d+',.*?\n\s*distribution:.*?)(status:'(?:[^'\\]|\\.)*')(?:,\s*statusExtra:.*?)?( \},)", re.S)
    seen, missing = 0, []

    def fix(m):
        nonlocal seen
        body = m.group(1)
        sci = re.search(r"nameSci:'([^']*)'", body).group(1)
        r = by_sci.get(sci)
        if not r:
            missing.append(sci)
            return m.group(0)
        seen += 1
        body = re.sub(r"category:'[a-z]+'", f"category:'{CATEGORY[r['status']]}'", body, count=1)
        fields = (f"status:{js(status_text(r))},\n    statusExtra:{js(CATEGORY.get(r['extra']))}, "
                  f"months:{js(r['maanden'])}, frequency:{js(FREQ[r['frequentie']])}, "
                  f"breeding:{js(BREEDING[r['broedvogel']])}, redList:{js(r['rode_lijst'] or None)}")
        return body + fields + m.group(3)

    out = block.sub(fix, text)
    if missing:
        sys.exit(f"Geen bronregel voor: {missing}")
    SRC.write_text(out, encoding="utf-8")
    print(f"{seen} soorten bijgewerkt")


if __name__ == "__main__":
    main()
