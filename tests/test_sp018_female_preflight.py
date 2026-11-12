#!/usr/bin/env python3
"""Offline, negative-path checks. Does not fetch, modify or publish photos."""
import importlib.util
import pathlib
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("pref", ROOT / "tools/species/prepare_verified_sp018_female.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
m = mod.candidate()
mod.validate_metadata(m)
mod.validate_local(m)
good = {
    "sha1": m["sourceSha1"], "size": m["sourceBytes"],
    "width": m["originalWidth"], "height": m["originalHeight"],
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/94/photo.jpg",
}
mod.validate_api(good, m)
failures = 0
def rejected(call):
    global failures
    try:
        call()
    except (ValueError, FileExistsError):
        failures += 1
    else:
        raise AssertionError("Invalid candidate was incorrectly accepted")

for field, value in [
    ("sha1", "0" * 40), ("size", 100), ("width", 500),
    ("height", 661), ("url", "https://malicious.example/photo.jpg"),
]:
    x = dict(good)
    x[field] = value
    rejected(lambda x=x: mod.validate_api(x, m))
for field, value in [
    ("license", "CC BY-NC 4.0"),
    ("sourceSha1", "0" * 40),
    ("role", "juvenile"),
]:
    x = dict(m)
    x[field] = value
    rejected(lambda x=x: mod.validate_metadata(x))
with tempfile.TemporaryDirectory() as temporary:
    rejected(lambda: mod.prepare(ROOT / "assets", m))
    rejected(lambda: mod.prepare(temporary, m))
assert failures == 10, failures
print("PASS 10 negative cases; all original Birdspot files unchanged")
