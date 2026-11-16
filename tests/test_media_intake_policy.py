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

# --- Negative import checks (no network): author, licence, SHA-1, paths, overwrite, audio review ---
def expect_fail(fn, text):
    try:
        fn()
    except intake.IntakeError as err:
        assert text.lower() in str(err).lower(), (text, str(err))
        return
    raise AssertionError("Not refused: " + text)

info = {"title": "File:X.jpg", "sha1": "a" * 40, "license": "CC BY-SA 4.0", "author": "Holger Uwe Schmitt"}
good = {"title": "File:X.jpg", "sha1": "a" * 40, "license": "CC BY-SA 4.0", "author": "Holger  Uwe Schmitt", "kind": "pose"}
intake.check_item(good, info)  # whitespace-insensitive author match passes
expect_fail(lambda: intake.check_item({**good, "author": "Iemand Anders"}, info), "Auteur wijkt af")
expect_fail(lambda: intake.check_item({**good, "license": "CC BY 2.0"}, info), "Licentie afwijkend")
expect_fail(lambda: intake.check_item({**good, "sha1": "b" * 40}, info), "SHA-1 gewijzigd")
expect_fail(lambda: intake.check_item(good, None), "Niet gevonden")
expect_fail(lambda: intake.check_item({**good, "kind": "audio"}, info), "luistercontrole")
heard = {"by": "Kevin", "date": "2026-11-17", "species": "ja", "soundType": "zang", "quality": "goed"}
intake.check_item({**good, "kind": "audio", "listened": heard}, info)
expect_fail(lambda: intake.safe_dest("/assets/species/plumage/../../sw.js", "pose"), "'..'")
expect_fail(lambda: intake.safe_dest("/src/features/x.webp", "pose"), "buiten toegestane mediamap")
expect_fail(lambda: intake.safe_dest("/assets/species/sp037.webp", "pose"), "buiten toegestane mediamap")
expect_fail(lambda: intake.safe_dest("/assets/species/plumage/new.png", "pose"), "extensie")
expect_fail(lambda: intake.safe_dest("/assets/species/audio/new.webp", "audio"), "extensie")
expect_fail(lambda: intake.safe_dest("/assets/species/plumage/sp039-juv.webp", "plumage"), "overschrijven")
assert intake.safe_dest("/assets/species/plumage/sp999-test-not-present.webp", "pose").name == "sp999-test-not-present.webp"
assert intake.safe_dest("/assets/species/audio/sp999-test-not-present.mp3", "audio").suffix == ".mp3"
print("MEDIA INTAKE NEGATIVE PASS: wrong author/licence/SHA-1, missing file, unheard audio, traversal, outside dir, wrong extension, overwrite all refused")
