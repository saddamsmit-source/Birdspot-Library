#!/usr/bin/env python3
"""Offline positive staging smoke test using SYNTHETIC JPEG only.

No HTTP, Wikimedia downloads, repo writes or changes to guide media.
Tests transformation behavior, NOT original photo identity/quality.
"""
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "sp018_preflight", ROOT / "tools/species/prepare_verified_sp018_female.py"
)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
meta = mod.candidate()
mod.validate_metadata(meta)
mod.validate_local(meta)

with Image.new("RGB", (meta["originalWidth"], meta["originalHeight"]), (59, 86, 79)) as img:
    exif = Image.Exif()
    exif[270] = "BIRDSPOT_PRIVATE_EXIF_TEST_SENTINEL"
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88, exif=exif)
    synthetic = buf.getvalue()
assert b"BIRDSPOT_PRIVATE_EXIF_TEST_SENTINEL" in synthetic

original_fetch = mod.fetch_original
mod.fetch_original = lambda _m: synthetic
old_media = (ROOT / meta["currentLocalPath"]).read_bytes()
old_registry = mod.REG.read_bytes()
try:
    with tempfile.TemporaryDirectory(prefix="birdspot-sp018-positive-") as tmp:
        target = Path(tmp) / "candidate"
        mod.prepare(target, meta)
        image_path = target / meta["stagingOutputName"]
        manifest_path = target / "review-manifest.json"
        output = image_path.read_bytes()
        review = json.loads(manifest_path.read_text(encoding="utf-8"))
        assert review["status"] == "PREPARED_NOT_VISUALLY_APPROVED"
        assert review["sourceSha1"] == meta["sourceSha1"]
        assert review["webpSha256"] == hashlib.sha256(output).hexdigest()
        assert review["role"] == "adult_f" and review["species"] == "sp018"
        assert b"BIRDSPOT_PRIVATE_EXIF_TEST_SENTINEL" not in output
        with Image.open(image_path) as prepared:
            prepared.load()
            assert prepared.format == "WEBP"
            assert prepared.width <= 1600 and prepared.height <= 1600
            assert min(prepared.size) > min(meta["currentLocalWidth"], meta["currentLocalHeight"])
            assert not prepared.getexif()
            assert "exif" not in prepared.info
        try:
            mod.prepare(target, meta)
        except FileExistsError:
            pass
        else:
            raise AssertionError("Existing staging directory should not be overwritten")
        assert image_path.read_bytes() == output

        mod.fetch_original = lambda _m: b"corrupt, non-JPEG fixture"
        broken_target = Path(tmp) / "invalid-input"
        try:
            mod.prepare(broken_target, meta)
        except (OSError, ValueError, SyntaxError):
            pass
        else:
            raise AssertionError("Corrupt JPEG should be rejected")
        assert not broken_target.exists()
finally:
    mod.fetch_original = original_fetch

assert (ROOT / meta["currentLocalPath"]).read_bytes() == old_media
assert mod.REG.read_bytes() == old_registry
print("PASS offline synthetic staging, stripped metadata, no overwrite, corrupt JPEG; existing media unchanged")
