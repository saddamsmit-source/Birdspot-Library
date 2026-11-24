"""Bepaalt of een media-intakeverzoek ffmpeg nodig heeft (F3-REV2-R03c, eigenaarbesluit 24-11-2026).

ffmpeg is alleen nodig voor audioverwerking:
  - audiocheck: decodeert opnamen (tools/media/audio_check.py);
  - import: alleen als het manifest minstens één item met kind "audio" bevat
    (commons_intake.convert_audio); een uitsluitend fotografische import heeft het niet nodig.
discover en origcheck gebruiken alleen de Commons-/iNaturalist-API en Pillow.

Onbekende modus, ontbrekend of onleesbaar importmanifest: fout (fail closed), nooit stil overslaan.

Gebruik in GitHub Actions:  python tools/media/needs_ffmpeg.py tools/media/requests/current.json
schrijft  ffmpeg=true|false  naar $GITHUB_OUTPUT (en naar stdout).
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NO_AUDIO_MODES = {"discover", "origcheck"}


def needs_ffmpeg(request: dict, root: Path = ROOT) -> bool:
    mode = request.get("mode")
    if mode == "audiocheck":
        return True
    if mode in NO_AUDIO_MODES:
        return False
    if mode == "import":
        manifest = json.loads((root / request["manifest"]).read_text(encoding="utf-8"))
        items = manifest.get("items")
        if not isinstance(items, list):
            raise ValueError("Importmanifest zonder items-lijst: " + request["manifest"])
        return any(item.get("kind") == "audio" for item in items)
    raise ValueError(f"Onbekende modus: {mode!r}")


def main(argv: list[str]) -> int:
    request = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    value = "true" if needs_ffmpeg(request) else "false"
    out = os.environ.get("GITHUB_OUTPUT")
    if out:
        with open(out, "a", encoding="utf-8") as fh:
            fh.write(f"ffmpeg={value}\n")
    print(f"mode={request.get('mode')} ffmpeg={value}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
