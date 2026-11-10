"""Voortgangsregister kennisbaseline per Birdspot-ID + batchplan.

Leest docs/kennisbaseline/coverage.json (uit coverage.mjs) en tools/kennisbaseline/knowledge.json en
schrijft docs/kennisbaseline/tracker.json en docs/kennisbaseline/KENNIS_TRACKER.md.

Statussen volgen het projectvocabulaire: VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED.
Een profiel dat Claude zelf tegen bronnen heeft gecontroleerd is NIET 'VERIFIED' voor inhoud: de
inhoudelijke QA blijft NOT TESTED tot een onafhankelijke controle (ChatGPT/eigenaar) is vastgelegd.

Gebruik: python3 -I tools/kennisbaseline/build_tracker.py --sha <commit> [--date YYYY-MM-DD]
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs" / "kennisbaseline"
FREQ = {"algemeen": 0, "vrij-algemeen": 1, "schaars": 2, "zeldzaam": 3, "zeer-zeldzaam": 4, None: 4}
BATCH = 12
# Onafhankelijke reviews worden hier vastgelegd (ID -> {status, door, datum, notitie}); nu nog leeg.
REVIEWS = DOCS / "reviews.json"


def missing(r, k):
    out = []
    if not r["A"]["sizeSourced"] and not (k and k.get("basis", {}).get("size")):
        out.append("A maten zonder bron")
    if r["B"]["fieldmarksChars"] < 80 and not k:
        out.append("B veldkenmerken kort")
    if "adult_f" not in r["B"]["plumageFields"]:
        out.append("B vrouwtje-tekst")
    if "juv" not in r["B"]["plumageFields"]:
        out.append("B juveniel-tekst")
    if not r["C"]["criticalMarks"]:
        out.append("C kritische kenmerken")
    if not r["D"]["comparisons"] and not (k and k.get("similar")):
        out.append("D vergelijkingen")
    if not r["E"]["voiceText"] and not (k and k.get("voice")):
        out.append("E zang/roep")
    if not r["E"]["audioClips"]:
        out.append("E audio")
    if not r["G"]["diet"] and not (k and k.get("life")):
        out.append("G leefwijze")
    if not (k and k.get("status")):
        out.append("H status met bron")
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sha", required=True)
    ap.add_argument("--date", default="2026-11-10")
    a = ap.parse_args()
    cov = json.loads((DOCS / "coverage.json").read_text(encoding="utf-8"))
    know = json.loads((ROOT / "tools" / "kennisbaseline" / "knowledge.json").read_text(encoding="utf-8"))
    reviews = json.loads(REVIEWS.read_text(encoding="utf-8")) if REVIEWS.exists() else {}
    rows = {r["id"]: r for r in cov["rows"]}
    done = {k for k in know if not k.startswith("_")}

    # Batch 01: vergelijkingspartners van de proefsoorten (maakt de proefparen compleet).
    partners = []
    for sid in sorted(done):
        k = know[sid]
        for pid in [x["id"] for x in k.get("similar", [])] + [v for c in k.get("critical", []) for v in c.get("vs", [])]:
            if pid not in done and pid not in partners and rows[pid]["B"]["photos"]:
                partners.append(pid)
    rest = [r for r in cov["rows"] if r["id"] not in done and r["id"] not in partners]
    # Eigenaarsbesluit 10-11-2026: eerst alle soorten met gidsfoto's, pas daarna de rest.
    rest.sort(key=lambda r: (not r["B"]["photos"], r["compact"], FREQ.get(r["H"]["frequency"], 4), r["family"], r["nameNL"]))
    order = partners + [r["id"] for r in rest]
    batches = {}
    for i, sid in enumerate(order):
        batches[sid] = f"K{i // BATCH + 1:02d}"

    out = []
    for r in sorted(cov["rows"], key=lambda r: r["id"]):
        sid = r["id"]
        k = know.get(sid)
        rv = reviews.get(sid)
        entry = {
            "id": sid, "nameNL": r["nameNL"], "family": r["family"], "compact": r["compact"],
            "frequency": r["H"]["frequency"], "level": r["level"],
            "missing": missing(r, k),
            "criticalChecked": len(k["critical"]) if k else 0,
            "similar": [x["id"] for x in k.get("similar", [])] if k else r["D"]["partners"],
            "openQuestions": k.get("open", []) if k else [],
            "discrepancies": len(k.get("discrepancies", [])) if k else 0,
            "sourceStatus": (f"bron per bewering, {len(_refs(k))} bron(nen), gecontroleerd door Claude {a.date}"
                             if k else ("deels: guideReview" if r["sources"]["guideReview"] else "geen bron per soort")),
            "contentQA": (rv["status"] if rv else "NOT TESTED") if k else "NOT TESTED",
            "uiStatus": "VERIFIED (helpertest 390/1280 px, Chromium)" if k else "n.v.t. (geen profiel; bestaande kaart ongewijzigd)",
            "sha": a.sha if k else None,
            "lastCheck": a.date if k else None,
            "batch": None if k else batches[sid],
            "next": ("onafhankelijke inhoudelijke QA + open punten afhandelen" if k and not rv
                     else "profiel opstellen volgens contract v0.1" if not k else "bijhouden"),
        }
        out.append(entry)

    (DOCS / "tracker.json").write_text(json.dumps({"generatedFor": a.sha, "date": a.date, "batchSize": BATCH,
                                                    "rows": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    by_batch = {}
    for e in out:
        if e["batch"]:
            by_batch.setdefault(e["batch"], []).append(e)
    L = ["# Birdspot — voortgangsregister kennisbaseline", "",
         f"Gegenereerd door `tools/kennisbaseline/build_tracker.py` voor commit `{a.sha}` op {a.date}. Bron: `coverage.json` + `knowledge.json`"
         + (" + `reviews.json`." if REVIEWS.exists() else "."), "",
         "Statussen: VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED. Inhoudelijke QA staat op NOT TESTED tot een onafhankelijke controle is vastgelegd in `docs/kennisbaseline/reviews.json`.", "",
         f"**Stand:** {len(done)} van {len(out)} soorten met kennisprofiel · {len(out) - len(done)} te gaan in {len(by_batch)} batches van max. {BATCH}.", "",
         "## Proefsoorten (kennisprofiel v0.1)", "",
         "| ID | Soort | Kritisch | Vergelijkbaar | Verschillen | Open vragen | Bronstatus | Inhoud-QA | UI/browser | SHA | Laatste controle | Volgende actie |",
         "|---|---|---|---|---|---|---|---|---|---|---|---|"]
    for e in out:
        if e["batch"] is None:
            L.append(f"| {e['id']} | {e['nameNL']} | {e['criticalChecked']} | {', '.join(e['similar']) or '—'} | {e['discrepancies']} | "
                     f"{len(e['openQuestions'])} | {e['sourceStatus']} | {e['contentQA']} | {e['uiStatus']} | `{e['sha']}` | {e['lastCheck']} | {e['next']} |")
    L += ["", "## Batchplan", "",
          "Volgorde (eigenaarsbesluit 10-11-2026): eerst alle soorten mét gidsfoto — K01 = vergelijkingspartners met foto van de profielsoorten, "
          "daarna de overige fotosoorten op frequentie en familie. Soorten zonder foto pas na akkoord van de eigenaar op de fotocollectie; "
          "compacte soorten als laatste (profielomvang is een eigenaarsbesluit).", "",
          "| Batch | Soorten | Families | Frequentie |", "|---|---|---|---|"]
    for b, es in sorted(by_batch.items()):
        fams = sorted({e["family"] for e in es})
        freqs = sorted({str(e["frequency"]) for e in es})
        L.append(f"| {b} | {', '.join(e['id'] + ' ' + e['nameNL'] for e in es)} | {', '.join(fams)} | {', '.join(freqs)} |")
    L += ["", "## Register per soort (alle 597)", "",
          "| ID | Soort | Niv. | Batch | Ontbreekt | Vergelijkbaar | Bronstatus | Inhoud-QA | Volgende actie |", "|---|---|---|---|---|---|---|---|---|"]
    for e in out:
        L.append(f"| {e['id']} | {e['nameNL']}{' (compact)' if e['compact'] else ''} | {e['level']} | {e['batch'] or 'proef'} | "
                 f"{'; '.join(e['missing']) or '—'} | {', '.join(e['similar']) or '—'} | {e['sourceStatus']} | {e['contentQA']} | {e['next']} |")
    (DOCS / "KENNIS_TRACKER.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"tracker: {len(done)} profielen, {len(out) - len(done)} open, {len(by_batch)} batches")


def _refs(k):
    refs = set()

    def walk(x):
        if isinstance(x, dict):
            for r in x.get("sources", []) or []:
                refs.add(r)
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
    walk(k)
    return refs


if __name__ == "__main__":
    main()
