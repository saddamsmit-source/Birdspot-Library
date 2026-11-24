"""F3-REV2-R03c: ffmpeg alleen bij audioverwerking in de media-intake (geen netwerk, geen runner nodig).

Controleert per modus de uitkomst van tools/media/needs_ffmpeg.py en dat de workflow ffmpeg uitsluitend
achter die uitkomst installeert, met de branchbeveiliging en overige afhankelijkheden ongewijzigd."""
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("needs_ffmpeg", ROOT / "tools/media/needs_ffmpeg.py")
nf = importlib.util.module_from_spec(spec)
spec.loader.exec_module(nf)

with tempfile.TemporaryDirectory() as tmp:
    tmp = Path(tmp)
    def manifest(name, items):
        (tmp / name).write_text(json.dumps({"date": "2026-11-24", "items": items}), encoding="utf-8")
        return name
    photo = manifest("photo.json", [{"kind": "pose", "title": "File:A.jpg"}, {"kind": "plumage", "title": "File:B.jpg"}])
    audio = manifest("audio.json", [{"kind": "audio", "title": "File:C.ogg"}])
    mixed = manifest("mixed.json", [{"kind": "pose", "title": "File:A.jpg"}, {"kind": "audio", "title": "File:C.ogg"}])
    (tmp / "broken.json").write_text('{"date": "x"}', encoding="utf-8")
    cases = {
        ("discover", None): False, ("origcheck", None): False, ("audiocheck", None): True,
        ("import", photo): False, ("import", audio): True, ("import", mixed): True,
    }
    for (mode, man), want in cases.items():
        got = nf.needs_ffmpeg({"mode": mode, "manifest": man or "x.json"}, tmp)
        assert got is want, (mode, man, got)
    for bad in ({"mode": "unknown"}, {"mode": "import", "manifest": "missing.json"}, {"mode": "import", "manifest": "broken.json"}, {}):
        try:
            nf.needs_ffmpeg(bad, tmp)
        except (ValueError, FileNotFoundError, KeyError):
            continue
        raise AssertionError("niet geweigerd: " + json.dumps(bad))
    # CLI schrijft ffmpeg=true|false naar $GITHUB_OUTPUT
    req = tmp / "req.json"; out = tmp / "gh_out"
    for mode, want in (("origcheck", "false"), ("audiocheck", "true")):
        req.write_text(json.dumps({"mode": mode, "manifest": "x.json"}), encoding="utf-8"); out.write_text("")
        subprocess.run([sys.executable, "-I", str(ROOT / "tools/media/needs_ffmpeg.py"), str(req)], check=True,
                       env={**os.environ, "GITHUB_OUTPUT": str(out)}, capture_output=True)
        assert out.read_text().strip() == f"ffmpeg={want}", out.read_text()

# Werkelijke verzoeken in de repo: foto-origcheck en de R03b-iNaturalist-herkansing hebben geen ffmpeg nodig.
assert nf.needs_ffmpeg({"mode": "origcheck", "manifest": "tools/media/origcheck_2026-11-24_rev2_r03b_inat.json"}) is False

wf = (ROOT / ".github/workflows/media-intake.yml").read_text(encoding="utf-8")
steps = re.split(r"\n      - ", wf)
ff_steps = [s for s in steps if "apt-get install" in s and "ffmpeg" in s]
assert len(ff_steps) == 1, "precies één ffmpeg-installatiestap"
assert "if: steps.deps.outputs.ffmpeg == 'true'" in ff_steps[0], "ffmpeg-installatie moet voorwaardelijk zijn"
assert "id: deps" in wf and "tools/media/needs_ffmpeg.py tools/media/requests/current.json" in wf
assert wf.index("id: deps") < wf.index("apt-get install"), "behoefte wordt vóór de installatie bepaald"
assert "python -m pip install pillow==11.0.0 numpy==2.1.3 matplotlib==3.9.2" in wf, "overige afhankelijkheden blijven"
assert "main|preview/*|release/*" in wf and "qa/birdspot-f3-*-media-*" in wf and "contents: write" in wf, "beveiliging ongewijzigd"
assert "timeout-minutes: 20" in wf
print("MEDIA INTAKE DEPS PASS: ffmpeg alleen bij audiocheck en import met audio; discover/origcheck/foto-import zonder; onbekend = fout; workflow voorwaardelijk")
