"""F3-R13b: path checks of the media intake on directory boundaries (QA finding 16-11 19:54).
Sibling directories with the same prefix (plumage-extra, media-intake-x) must be refused."""
import json, shutil, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools" / "media"))
import commons_intake as intake

def refused(fn, text):
    try:
        fn()
    except intake.IntakeError as err:
        assert text.lower() in str(err).lower(), (text, str(err)); return
    raise AssertionError("Not refused: " + text)

# 1. output paths
for bad, why in [("/assets/species/plumage-extra/x.webp", "buiten toegestane mediamap"),
                 ("/assets/species/plumageX/x.webp", "buiten toegestane mediamap"),
                 ("/assets/species/audio-old/x.mp3", "buiten toegestane mediamap"),
                 ("/assets/species/plumage/../plumage-extra/x.webp", "'..'"),
                 ("/assets/species/plumage", "buiten toegestane mediamap"),
                 (str(intake.ROOT / "assets/species/plumage-extra/x.webp"), "buiten toegestane mediamap"),
                 ("/etc/x.webp", "buiten toegestane mediamap"),
                 ("/assets/species/plumage/x.png", "extensie"),
                 ("/assets/species/plumage/sp039-juv.webp", "overschrijven")]:
    kind = "audio" if "audio" in bad else "pose"
    refused(lambda b=bad, k=kind: intake.safe_dest(b, k), why)
assert intake.safe_dest("/assets/species/plumage/sp999-ok.webp", "pose").parent == (intake.ROOT / "assets/species/plumage").resolve()
assert intake.safe_dest("/assets/species/plumage/sub/sp999-ok.webp", "pose").name == "sp999-ok.webp"
assert intake.safe_dest("/assets/species/audio/sp999-ok.mp3", "audio").suffix == ".mp3"

# 2. audiocheck report path: sibling of docs/media-intake must be refused even if the report is valid
sib = intake.ROOT / "docs/media-intake-evil"; sib.mkdir(exist_ok=True)
rep = {"recordings": [{"id": "x", "sha1": "a" * 40, "fragment": {"start": 0, "seconds": 6.2}}],
       "judgements": [{"id": "x", "speciesId": "sp043", "soundType": "call", "consistent": True, "evidenceLevel": "PARTIALLY TESTED (akoestische aanwijzing)"}]}
(sib / "r.json").write_text(json.dumps(rep))
info = {"title": "File:X", "sha1": "a" * 40, "license": "CC0", "author": "A"}
item = {"title": "File:X", "sha1": "a" * 40, "license": "CC0", "author": "A", "kind": "audio", "speciesId": "sp043", "start": 0, "seconds": 6.2,
        "register": {"verification": "NOT TESTED"}, "audiocheck": {"report": "docs/media-intake-evil/r.json", "judgement": "x", "visual": "v", "soundType": "call"}}
try:
    refused(lambda: intake.check_item(item, info), "buiten docs/media-intake")
    refused(lambda: intake.check_item({**item, "audiocheck": {**item["audiocheck"], "report": "docs/media-intake/../media-intake-evil/r.json"}}, info), "buiten docs/media-intake")
    refused(lambda: intake.check_item({**item, "audiocheck": {**item["audiocheck"], "report": str(sib / "r.json")}}, info), "buiten docs/media-intake")
finally:
    shutil.rmtree(sib)
print("MEDIA PATH BOUNDARY PASS: sibling dirs, '..', absolute paths, directory itself, wrong extension, overwrite and sibling report dirs refused; nested allowed")
