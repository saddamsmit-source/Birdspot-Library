#!/usr/bin/env python3
"""Birdspot S1 Android evidence form. Does not communicate with or modify a device.

Manual, privacy-preserving evidence intake only. A reported PASS is never
considered an independently VERIFIED physical-device PASS by this tool.
"""
from __future__ import annotations

import argparse
from collections import Counter
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
SCHEMA = "birdspot-android-s1-v1"
TESTS = {
    "AND-01": "Eerste start vanaf localhost op fysieke Android; serviceworker actief",
    "AND-02": "Nieuwe waarneming met echte testfoto opslaan, app sluiten en terugvinden",
    "AND-03": "Vliegtuigstand: bestaande waarneming, afbeelding en gids offline terugvinden",
    "AND-04": "In vliegtuigstand nieuwe waarneming met testfoto opslaan en na heropening terugvinden",
    "AND-05": "Android Terug, soortkiezer en formulier annuleren zonder fout of gegevensverlies",
    "AND-06": "GPS-toestemming weigeren en waarneming zonder GPS opslaan",
    "AND-07": "ZIP-export; corrupte import en annuleren wijzigen bestaande data niet",
    "AND-08": "ZIP op schoon tweede toestel herstellen en geen dubbele records bij herimport",
    "AND-09": "Daglicht, zoom, tikdoelen en geïnstalleerde PWA op doeltoestel",
    "AND-10": "Echte release-update vanaf 1.27.6 naar unieke volgende cacheversie",
}
REQUIRED_S1 = tuple(k for k in TESTS if k != "AND-10")
STATUSES = {"NOT_TESTED", "PASS", "FAIL", "BLOCKED"}
SHA_RE = re.compile(r"^[0-9a-f]{40}$")


def git_head() -> str | None:
    try:
        proc = subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=ROOT, text=True,
            capture_output=True, timeout=5, check=True,
        )
        head = proc.stdout.strip().lower()
        return head if SHA_RE.fullmatch(head) else None
    except (FileNotFoundError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None


def template(sha: str | None = None) -> dict:
    return {
        "schema": SCHEMA,
        "source_sha": sha or "FILL_EXACT_40_CHAR_COMMIT_SHA",
        "date_utc": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "device": {"type": "physical_android", "model": "", "android_version": "", "browser": "Chrome", "browser_version": ""},
        "origin": "http://localhost:8765/",
        "test_data_only": True,
        "tests": {k: {"status": "NOT_TESTED", "observed": "", "evidence_ids": []} for k in TESTS},
        "review": {"independent_reviewer": "", "reviewed_at_utc": "", "decision": "NOT_TESTED"},
    }


def validate(report: object) -> list[str]:
    errors: list[str] = []
    if not isinstance(report, dict):
        return ["Root must be a JSON object"]
    if report.get("schema") != SCHEMA:
        errors.append(f"schema must be {SCHEMA}")
    if not SHA_RE.fullmatch(str(report.get("source_sha", ""))):
        errors.append("source_sha must be the complete 40-character lowercase commit SHA")
    if report.get("test_data_only") is not True:
        errors.append("test_data_only must be true; never collect personal sightings in public evidence")
    if report.get("origin") not in ("http://localhost:8765/", "http://127.0.0.1:8765/"):
        errors.append("origin must be the isolated localhost:8765 test origin")
    device = report.get("device")
    if not isinstance(device, dict) or device.get("type") != "physical_android":
        errors.append("device.type must be physical_android")
    else:
        for key in ("model", "android_version", "browser", "browser_version"):
            if not isinstance(device.get(key), str):
                errors.append(f"device.{key} must be a string")
    tests = report.get("tests")
    if not isinstance(tests, dict):
        return errors + ["tests must be a JSON object"]
    for test_id in TESTS:
        t = tests.get(test_id)
        if not isinstance(t, dict):
            errors.append(f"missing test {test_id}")
            continue
        status = t.get("status")
        if status not in STATUSES:
            errors.append(f"{test_id}.status must be one of {sorted(STATUSES)}")
        obs = t.get("observed")
        evidence = t.get("evidence_ids")
        if not isinstance(obs, str) or not isinstance(evidence, list) or not all(
            isinstance(e, str) and 0 < len(e) <= 80 for e in evidence
        ):
            errors.append(f"{test_id}.observed must be string, evidence_ids list of short strings")
        elif status == "PASS" and (len(obs.strip()) < 20 or not evidence):
            errors.append(f"{test_id}: claimed PASS requires a useful observation and local evidence ID")
        if isinstance(evidence, list) and any("/" in e or "\\" in e or "://" in e for e in evidence if isinstance(e, str)):
            errors.append(f"{test_id}: evidence_ids must be short local references, not paths or URLs")
    extra = set(tests) - set(TESTS)
    if extra:
        errors.append("unknown test IDs: " + ", ".join(sorted(extra)))
    review = report.get("review")
    if not isinstance(review, dict) or review.get("decision") not in {"NOT_TESTED", "REVIEW_REQUIRED", "FAIL", "BLOCKED", "PASS"}:
        errors.append("review.decision must be an explicit review state")
    return errors


def gate(report: dict) -> tuple[str, dict[str, int]]:
    tests = report.get("tests", {})
    statuses = [tests.get(k, {}).get("status", "NOT_TESTED") for k in REQUIRED_S1]
    counts = dict(Counter(statuses))
    if "FAIL" in statuses:
        return "FAIL_REPORTED", counts
    if "BLOCKED" in statuses:
        return "BLOCKED_REPORTED", counts
    if "NOT_TESTED" in statuses:
        return "PARTIALLY_TESTED", counts
    return "REVIEW_REQUIRED", counts


def preflight() -> None:
    print("Birdspot S1 Android pilot — READ-ONLY local preflight")
    print("Repository:", ROOT)
    print("HEAD:", git_head() or "UNKNOWN (no git checkout)")
    sw = ROOT / "sw.js"
    if sw.is_file():
        match = re.search(r"const APP_VERSION = '([^']+)'", sw.read_text(encoding="utf-8"))
        print("App/cache version:", match.group(1) if match else "UNKNOWN")
    else:
        print("App/cache version: UNKNOWN (sw.js missing)")
    print("adb available:", bool(shutil.which("adb")))
    print("No phone, application, GitHub branch or production data was modified.")
    print("Manual commands after your own USB-debugging setup:")
    print("  Terminal A (repository root): python -m http.server 8765 --bind 127.0.0.1")
    print("  Terminal B: adb devices")
    print("  Terminal B: adb reverse tcp:8765 tcp:8765")
    print("  Android Chrome: http://localhost:8765/")
    print("Disconnect USB and turn off Wi-Fi/mobile data for the truly offline phase.")


def main(argv: list[str] | None = None) -> int:
    cli = argparse.ArgumentParser(description=__doc__)
    group = cli.add_mutually_exclusive_group(required=True)
    group.add_argument("--preflight", action="store_true", help="Print local non-mutating setup checks")
    group.add_argument("--new", metavar="OUTSIDE_REPO.json", help="Create a private starter report")
    group.add_argument("--validate", metavar="REPORT.json", help="Inspect self-reported evidence structure")
    args = cli.parse_args(argv)
    if args.preflight:
        preflight()
        return 0
    path = Path(args.new or args.validate).expanduser().resolve()
    if path == ROOT or ROOT in path.parents:
        print("REFUSED: physical-device reports must remain outside this public repository", file=sys.stderr)
        return 2
    if args.new:
        if path.exists():
            print("REFUSED: never overwrite an existing report", file=sys.stderr)
            return 2
        if not path.parent.is_dir():
            print("Parent directory does not exist; create a private directory first", file=sys.stderr)
            return 2
        import os
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd, "w", encoding="utf-8") as out:
            json.dump(template(git_head()), out, indent=2, ensure_ascii=False)
            out.write("\n")
        print("Private template created:", path)
        print("No tests are marked PASS. Never commit this report to a public repo.")
        return 0
    try:
        report = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as err:
        print(f"Invalid/unreadable report: {err}", file=sys.stderr)
        return 2
    errors = validate(report)
    if errors:
        for e in errors:
            print("ERROR:", e, file=sys.stderr)
        return 2
    status, counts = gate(report)
    print("Reported coverage:", counts)
    print("S1 physical gate:", status)
    print("IMPORTANT: statuses are self-reported. Independent device review is required;")
    print("this validator never certifies an Android PASS or permits production release.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
