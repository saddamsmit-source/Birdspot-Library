"""Licence policy and branch guard of tools/media/commons_intake.py (no network)."""
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("intake", ROOT / "tools/media/commons_intake.py")
intake = importlib.util.module_from_spec(spec)
spec.loader.exec_module(intake)

for ok in ["CC BY 2.0", "CC BY-SA 4.0", "CC BY-SA 3.0", "CC0", "Public domain", "CC BY 4.0"]:
    assert intake.license_ok(ok), ok
for bad in ["CC BY-NC 4.0", "CC BY-NC-SA 4.0", "CC BY-ND 2.0", "All rights reserved", "", "GFDL"]:
    assert not intake.license_ok(bad), bad
assert "BirdspotLibrary-media-intake" in intake.UA and "github.com" in intake.UA
workflow = (ROOT / ".github/workflows/media-intake.yml").read_text(encoding="utf-8")
assert "main|preview/*|release/*" in workflow and "qa/birdspot-f3-*-media-*" in workflow
print("MEDIA INTAKE POLICY PASS: NC/ND/unknown refused, identifiable User-Agent, protected branches refused")
