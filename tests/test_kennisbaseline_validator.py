"""
Birdspot Library — negatieve tests voor de kennisprofiel-validator (contract v0.1).

Bewijst dat tools/kennisbaseline/build_knowledge.py ongeldige profielen weigert in plaats van ze
stil door te laten. Elke case muteert een kopie van knowledge.json en verwacht een specifieke fout.

  KV-01  geldige bron passeert (0 fouten)
  KV-02  onbekend Birdspot-ID
  KV-03  bewering zonder bron
  KV-04  onbekende bronsleutel
  KV-05  ongeldige betrouwbaarheid
  KV-06  vergelijking met zichzelf / niet-bestaand ID
  KV-07  te weinig of te veel keyMarks
  KV-08  leeg verplicht veld in kritisch kenmerk
  KV-09  bron zonder URL/controledatum
  KV-10  --check detecteert een handmatig gewijzigde speciesKnowledge.js
  KV-11  'doorslaggevend' met bronnen van maar één uitgever, of bron zonder uitgever, wordt geweigerd
  KV-12  FQA-04: veldkenmerk (keyMark) nooit doorslaggevend; kritisch kenmerk doorslaggevend vereist diagnostische onderbouwing
  KV-13  biometrie (kwaliteitsnorm §1): <2 uitgevers, afwijkende circa-band, uitgesloten waarde zonder reden
  KV-14  circa-band wijkt af van de getoonde maat in species.js

Starten (vanuit repo-root):  python3 tests/test_kennisbaseline_validator.py
"""
import copy
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("build_knowledge", ROOT / "tools" / "kennisbaseline" / "build_knowledge.py")
bk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bk)

BASE = json.loads((ROOT / "tools" / "kennisbaseline" / "knowledge.json").read_text(encoding="utf-8"))
IDS = bk.species_ids()
FIRST = next(k for k in BASE if not k.startswith("_"))


SIZES = bk.species_sizes()


def errors_after(mutate, sizes=None):
    data = copy.deepcopy(BASE)
    mutate(data)
    return bk.validate(data, IDS, sizes or SIZES)


def expect(case, mutate, needle):
    errs = errors_after(mutate)
    assert any(needle in e for e in errs), f"{case}: verwachtte fout met '{needle}', kreeg {errs}"
    print(f"{case} OK — geweigerd: {next(e for e in errs if needle in e)}")


def main():
    assert bk.validate(copy.deepcopy(BASE), IDS, SIZES) == [], "KV-01 huidige bron is ongeldig"
    print("KV-01 OK — huidige knowledge.json is geldig")

    expect("KV-02", lambda d: d.__setitem__("sp999", copy.deepcopy(d[FIRST])), "onbekend Birdspot-ID")
    expect("KV-03", lambda d: d[FIRST]["keyMarks"][0].__setitem__("sources", []), "bewering zonder bron")
    expect("KV-03b", lambda d: d[FIRST]["critical"][0].__setitem__("sources", []), "bewering zonder bron")
    expect("KV-04", lambda d: d[FIRST]["summary"].__setitem__("sources", ["BESTAAT_NIET"]), "onbekende bron BESTAAT_NIET")
    expect("KV-05", lambda d: d[FIRST]["critical"][0].__setitem__("reliability", "zeker"), "ongeldige betrouwbaarheid")
    expect("KV-06", lambda d: d[FIRST]["critical"][0].__setitem__("vs", [FIRST]), "ongeldige vergelijkingssoort")
    expect("KV-06b", lambda d: d[FIRST]["similar"].append({"id": "sp999", "why": "x", "sources": []}), "ongeldige soort sp999")
    expect("KV-07", lambda d: d[FIRST].__setitem__("keyMarks", d[FIRST]["keyMarks"][:2]), "keyMarks (verwacht 3–5)")
    expect("KV-07b", lambda d: d[FIRST].__setitem__("keyMarks", d[FIRST]["keyMarks"] * 2), "keyMarks (verwacht 3–5)")
    expect("KV-08", lambda d: d[FIRST]["critical"][0].__setitem__("exceptions", " "), "veld exceptions leeg")
    first_src = next(iter(BASE["_sources"]))
    expect("KV-09", lambda d: d["_sources"][first_src].__setitem__("url", ""), "veld url ontbreekt")
    expect("KV-09b", lambda d: d["_sources"][first_src].pop("checked"), "veld checked ontbreekt")

    def one_publisher(d):
        c = next(c for k, v in d.items() if not k.startswith("_") for c in v["critical"] if c["reliability"] == "doorslaggevend")
        c["sources"] = c["sources"][:1]
    expect("KV-11", one_publisher, "doorslaggevend zonder twee onafhankelijke uitgevers")
    expect("KV-11b", lambda d: d["_sources"][first_src].pop("publisher"), "veld publisher ontbreekt")

    # KV-12 (FQA-04): veldkenmerk nooit doorslaggevend; kritisch kenmerk doorslaggevend vereist diagnostische onderbouwing.
    def km_decisive(d):
        d["sp002"]["keyMarks"][0]["reliability"] = "doorslaggevend"
    expect("KV-12", km_decisive, "niet bij een veldkenmerk")
    def no_diag(d):
        c = next(c for c in d["sp002"]["critical"] if c["reliability"] == "doorslaggevend")
        c.pop("diagnostic", None)
    expect("KV-12b", no_diag, "zonder diagnostische onderbouwing")

    # KV-13/14: biometrie volgens kwaliteitsnorm §1.
    assert bk.bio_display([{"min": 124, "max": 127}, {"min": 135, "max": 150}], "cm") == "ca. 130–140 cm"
    assert bk.bio_display([{"min": 15, "max": 17}, {"min": 16, "max": 18}], "cm") == "ca. 16–18 cm"
    assert bk.bio_display([{"min": 620, "max": 1000}, {"min": 550, "max": 1100}], "g") == "ca. 590–1050 g"
    print("KV-13 OK — afronding: 5 cm vanaf 30 cm, 1 cm eronder, 10 g / 50 g")
    bio = lambda d: d["sp095"]["basis"]["biometrics"][1]
    expect("KV-13", lambda d: bio(d)["values"].pop(), "KV-13 minder dan twee uitgevers")
    expect("KV-13b", lambda d: bio(d)["values"][1].__setitem__("source", "VB_KMM"), "KV-13 minder dan twee uitgevers")
    expect("KV-13c", lambda d: bio(d).__setitem__("display", "124–150 cm"), "KV-13 display")
    expect("KV-13d", lambda d: d["sp096"]["basis"]["biometrics"][0]["excluded"][0].__setitem__("reason", ""), "uitgesloten waarde zonder reden")
    sizes = copy.deepcopy(SIZES); sizes["sp095"]["wingspan"] = "117–134 cm"
    errs = errors_after(lambda d: None, sizes)
    assert any("KV-14" in e for e in errs), f"KV-14 niet gedetecteerd: {errs}"
    print(f"KV-14 OK — geweigerd: {next(e for e in errs if 'KV-14' in e)}")

    # KV-10: --check in een tijdelijke kopie van de relevante bestanden
    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        for rel in ("tools/kennisbaseline/build_knowledge.py", "tools/kennisbaseline/knowledge.json",
                    "src/data/species.js", "src/data/speciesKnowledge.js"):
            (t / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(ROOT / rel, t / rel)
        script = t / "tools" / "kennisbaseline" / "build_knowledge.py"
        ok = subprocess.run([sys.executable, "-I", str(script), "--check"], capture_output=True, text=True)
        assert ok.returncode == 0, f"KV-10 schone kopie faalt: {ok.stdout}"
        out = t / "src" / "data" / "speciesKnowledge.js"
        out.write_text(out.read_text(encoding="utf-8").replace("Doorslaggevend", "Doorslaggevend!", 1) + "// hand\n", encoding="utf-8")
        bad = subprocess.run([sys.executable, "-I", str(script), "--check"], capture_output=True, text=True)
        assert bad.returncode == 1 and "loopt niet gelijk" in bad.stdout, f"KV-10 handwijziging niet gedetecteerd: {bad.stdout}"
    print("KV-10 OK — --check weigert een handmatig gewijzigde speciesKnowledge.js")
    print("Kennisprofiel-validator: alle negatieve controles geslaagd (KV-01..KV-14)")


if __name__ == "__main__":
    main()
