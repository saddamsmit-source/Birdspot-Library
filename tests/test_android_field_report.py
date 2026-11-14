"""Pure stdlib gate tests — never imply a physical Android run."""
from pathlib import Path
import json
import importlib.util
import tempfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("pilot", ROOT / "tools/pilot/android_field_report.py")
pilot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pilot)

BASE = "a" * 40
base = pilot.template(BASE)
assert pilot.validate(base) == []
assert pilot.gate(base)[0] == "PARTIALLY_TESTED"

wrong = pilot.template(BASE)
wrong["origin"] = "https://birdspot-library.vercel.app/"
assert any("origin" in s for s in pilot.validate(wrong))

wrong = pilot.template(BASE)
wrong["test_data_only"] = False
assert any("test_data_only" in s for s in pilot.validate(wrong))

wrong = pilot.template(BASE)
wrong["source_sha"] = "abc"
assert any("source_sha" in s for s in pilot.validate(wrong))

wrong = pilot.template(BASE)
wrong["tests"]["AND-02"]["status"] = "PASS"
assert any("AND-02" in s for s in pilot.validate(wrong))

for id in pilot.REQUIRED_S1:
    base["tests"][id]["status"] = "PASS"
    base["tests"][id]["observed"] = "Observer reported this scenario on a physical test phone."
    base["tests"][id]["evidence_ids"] = ["LOCAL-EXAMPLE"]
assert pilot.validate(base) == []
assert pilot.gate(base)[0] == "REVIEW_REQUIRED", "Self-report cannot be an independent PASS"
base["tests"]["AND-08"]["status"] = "BLOCKED"
assert pilot.gate(base)[0] == "BLOCKED_REPORTED"
base["tests"]["AND-08"]["status"] = "FAIL"
assert pilot.gate(base)[0] == "FAIL_REPORTED"

with tempfile.TemporaryDirectory() as temp:
    outfile = Path(temp) / "manual.json"
    assert pilot.main(["--new", str(outfile)]) == 0
    assert outfile.is_file()
    assert pilot.main(["--new", str(outfile)]) == 2
    assert pilot.main(["--new", str(ROOT / "private-report.json")]) == 2
    report = json.loads(outfile.read_text(encoding="utf-8"))
    report["source_sha"] = BASE
    outfile.write_text(json.dumps(report), encoding="utf-8")
    assert pilot.main(["--validate", str(outfile)]) == 0

print("PASS Android evidence schema, unsupported PASS guard, no-overwrite, private-only path, gate distinctions")
