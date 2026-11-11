"""Bouwt docs/fotokwaliteit/SOORTAUDIT_TRACKER.md uit docs/fotokwaliteit/soortaudit-status.json
(gegenereerd door tools/fotokwaliteit/soortaudit.mjs --write) en docs/fotokwaliteit/vluchtcontrole.json.

Gebruik: python3 -I tools/fotokwaliteit/build_soortaudit_tracker.py
"""
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs" / "fotokwaliteit"


def main():
    st = json.loads((DOCS / "soortaudit-status.json").read_text(encoding="utf-8"))
    fl = json.loads((DOCS / "vluchtcontrole.json").read_text(encoding="utf-8"))["assets"]
    rows = st["species"]
    aud = [r for r in rows if r["audited"]]
    todo = [r for r in rows if not r["audited"]]
    c = lambda f: sum(1 for r in aud if f(r))
    corrections = sum(len(r["corrections"]) for r in aud)
    rejected = [(v["id"], v["nameNL"], k.split("/")[-1], v["decision"], v["class"], v["reason"]) for k, v in fl.items() if v["decision"] in ("uit-rol", "archief")]
    weak = [(r["id"], r["nameNL"], f) for r in aud if r["knowledge"].get("profile") for f in r["knowledge"]["notDecisive"]]
    rights = [(r["id"], a["image"].split("/")[-1], a["rights"]["note"]) for r in aud for a in r["assets"] if a["rights"]["status"] != "VERIFIED"]
    L = ["# Birdspot — soortaudit van de collectie met foto's", "",
         f"Gegenereerd door `tools/fotokwaliteit/build_soortaudit_tracker.py` · status voor commit `{st['sha']}` · {st['generated']}.",
         "Statussen: VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED. Een geautomatiseerde rendercontrole telt **niet** als visuele of inhoudelijke controle.",
         "Beoordeeld volgens `docs/BIRDSPOT_KWALITEITSNORM.md` (biometrie §1, herkenning §2, foto §3). Verbeterwensen zijn voor de latere beoordeling door de eigenaar en blokkeren de batch niet.", "",
         "## Overzicht (eindeisen 1–9)", "", "| # | Meting | Stand |", "|---|---|---|",
         f"| 1 | Soorten met bestaande gidsfoto's | {len(rows)} |",
         f"| 2 | Afzonderlijk (aangescherpt) gecontroleerd | {len(aud)} ({', '.join(sorted({r['batch'] for r in aud}))}) |",
         f"| 3 | Technisch correct (laden, volgorde, offline-bron, beoordeling = kaart) | {c(lambda r: r['status']['technical'] == 'VERIFIED')} van {len(aud)} |",
         f"| 4a | Visueel VERIFIED (beeld per foto) | {c(lambda r: r['status']['visual'] == 'VERIFIED')} van {len(aud)} |",
         f"| 4b | Inhoud (kennisprofiel) VERIFIED | {c(lambda r: r['status']['knowledge'] == 'VERIFIED')} van {len(aud)} — alle profielen hebben nog open punten |",
         f"| 4c | Onafhankelijk beoordeeld (ChatGPT) | 0 — NOT TESTED |",
         f"| 5 | Correcties doorgevoerd (in gecontroleerde soorten) | {corrections}; plus collectiebrede vluchtcontrole: {sum(1 for v in fl.values() if v['decision']=='uit-rol')} uit de vluchtrol, {sum(1 for v in fl.values() if v['decision']=='archief')} gearchiveerd |",
         f"| 6 | Afgekeurde vluchtfoto's | {len(rejected)} (tabel hieronder) |",
         f"| 7 | Ontbrekende foto-/kennisonderdelen | {sum(len(r['missing']) for r in aud)} fotoposities in gecontroleerde soorten; {sum(1 for r in rows if not (r.get('knowledge') or {}).get('profile'))} fotosoorten zonder kennisprofiel |",
         f"| 8 | Kritische kenmerken niet doorslaggevend onderbouwd | {len(weak)} (tabel hieronder) |",
         f"| 9 | Open bron-/licentieproblemen | {len(rights)} in gecontroleerde soorten; collectiebreed blijft het eerder gemelde punt '22 afbeeldingen buiten de bronaudit' open |",
         "", "Eindoordeel per gecontroleerde soort: " + ", ".join(f"{k} {v}" for k, v in Counter(r["verdict"] for r in aud).items()) + ".", "",
         "## Gecontroleerde soorten", ""]
    for r in sorted(aud, key=lambda r: (r["family"], r["nameNL"])):
        s = r["status"]
        L += [f"### {r['id']} {r['nameNL']} — {r['verdict']}", "",
              f"Batch {r['batch']} · {r['date']} · SHA `{r['sha']}` · technisch {s['technical']} · visueel {s['visual']} · rechten {s['rights']} · kennis {s['knowledge']} · browser {s['browser']} · onafhankelijk {s['independent']}", "",
              "| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |", "|---|---|---|---|---|---|---|---|"]
        for a in r["assets"]:
            f = a["flight"]
            L.append(f"| `{a['image'].split('/')[-1]}` | {a['role']} | {a['content']} | {a['sexAge']} | {a['quality']} | {a['verdict']} | "
                     f"{(f['class'] + ' · ' + f['decision']) if f else '—'} | {a['rights']['status']}: {a['rights']['note']} |")
        k = r["knowledge"]
        browser = r["browser"]
        browser_text = f"{browser['viewport']} · {browser['checks']}" if browser else "NOT TESTED"
        L += ["", f"- **Correcties:** {'; '.join(r['corrections']) or 'geen'}",
              f"- **Ontbreekt:** {'; '.join(r['missing']) or 'niets'}",
              f"- **Verbeterwensen (eigenaar beoordeelt later):** {'; '.join(r.get('wishes') or []) or '—'}",
              f"- **Geslacht:** {r['sexPolicy']}",
              f"- **Kennisprofiel:** " + (f"{k['critical']} kritische kenmerken ({k['decisive']} doorslaggevend); niet doorslaggevend: {', '.join(k['notDecisive']) or '—'}; open: {'; '.join(k['open']) or '—'}; resterende dataverschillen: {k['discrepancies']}" if k.get("profile") else "ontbreekt"),
              f"- **Browser:** {browser_text}",
              f"- **Onzeker:** {'; '.join(r['uncertain']) or '—'}"]
        if r.get("previous"):
            L.append(f"- **Eerdere uitslag:** {r['previous']}")
        L += [f"- **Volgende actie:** {r['next']}", ""]
    L += ["## Afgekeurde vluchtfoto's (collectiebreed)", "", "| Soort | Bestand | Uitslag | Klasse | Reden |", "|---|---|---|---|---|"]
    L += [f"| {i} {n} | `{f}` | {d} | {cl} | {why} |" for i, n, f, d, cl, why in sorted(rejected)]
    L += ["", "## Kritische kenmerken die (nog) niet doorslaggevend zijn", "", "| Soort | Kenmerk |", "|---|---|"]
    L += [f"| {i} {n} | {f} |" for i, n, f in weak]
    L += ["", "## Nog niet aangescherpt gecontroleerd", "",
          "Deze soorten renderen technisch, maar zijn **niet** foto voor foto opnieuw beoordeeld. Eerdere uitslagen (fotobaseline batch 01) gelden niet automatisch.", "",
          ", ".join(f"{r['id']} {r['nameNL']}" for r in sorted(todo, key=lambda r: (r['family'], r['nameNL']))), ""]
    (DOCS / "SOORTAUDIT_TRACKER.md").write_text("\n".join(L) + "\n", encoding="utf-8")
    print(f"tracker: {len(aud)} gecontroleerd, {len(todo)} open, {len(rejected)} afgekeurde vluchtfoto's")


if __name__ == "__main__":
    main()
