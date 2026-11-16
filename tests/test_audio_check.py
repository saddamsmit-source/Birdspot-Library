"""Audio-check (F3-R11b): synthetic positive and negative cases for the acoustic consistency rule.
Proves the rule logic only; real recordings are judged in GitHub Actions (docs/media-intake/*/audiocheck.json)."""
import sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools" / "media"))
import audio_check as ac

rng = np.random.default_rng(7)
def song(f0, sweep, seconds=12, noise=0.003, seed=0):
    r = np.random.default_rng(seed); t = np.arange(int(seconds * ac.SR)) / ac.SR
    x = noise * r.standard_normal(len(t))
    for start in np.arange(0.3, seconds - 0.3, 0.45):
        m = (t >= start) & (t < start + 0.18); tt = t[m] - start
        x[m] += 0.3 * np.sin(2 * np.pi * (f0 * tt + sweep * tt ** 2 / 0.36))
    return x.astype(np.float32)

A = lambda s: ac.features(song(3500, 900, seed=s))   # "soort A": elementen rond 3,5-4,4 kHz
B = lambda s: ac.features(song(7200, -1500, seed=s)) # "soort B": dalende elementen rond 6-7 kHz
refs = {"spA": [A(1), A(2)], "spB": [B(3), B(4)]}
ok = ac.judge(A(5), refs, "spA"); assert ok["consistent"], ok
wrong = ac.judge(B(6), refs, "spA"); assert not wrong["consistent"] and "marge" in wrong["reason"], wrong
noisy = ac.judge(ac.features(song(3500, 900, noise=0.25, seed=8)), refs, "spA"); assert not noisy["consistent"], noisy
silent = ac.judge(ac.features(0.001 * rng.standard_normal(ac.SR * 10).astype(np.float32)), refs, "spA"); assert not silent["consistent"]
noref = ac.judge(A(9), {"spB": refs["spB"]}, "spA"); assert not noref["consistent"] and "eigen soort" in noref["reason"]
alone = ac.judge(A(9), {"spA": refs["spA"]}, "spA"); assert not alone["consistent"] and "verwarringssoort" in alone["reason"]
print("AUDIO CHECK PASS: own species accepted; wrong species, noisy, silent, missing reference and missing confuser refused")

# Reference selection: exact species and sound type only
ok_ref = {"title": "File:Spinus spinus - Eurasian Siskin XC1.mp3", "categories": [], "description": "Common name: Eurasian Siskin Type: song"}
assert ac.reference_ok(ok_ref, ["Spinus spinus", "Carduelis spinus"], "song")
assert not ac.reference_ok({**ok_ref, "title": "File:Spinus spinescens - Andean Siskin XC2.mp3"}, ["Spinus spinus"], "song")
assert not ac.reference_ok({**ok_ref, "title": "File:Bird Call - Muro, Spain.mp3"}, ["Linaria cannabina"], "call")
assert not ac.reference_ok(ok_ref, ["Spinus spinus"], "call"), "song file must not serve as call reference"
assert not ac.reference_ok({**ok_ref, "description": "Type: call, song"}, ["Spinus spinus"], "song"), "mixed type refused"
assert ac.reference_ok({**ok_ref, "title": "File:Carduelis spinus.ogg", "description": "Song of Eurasian Siskin"}, ["Spinus spinus", "Carduelis spinus"], "song")
print("AUDIO REFERENCE SELECTION PASS: related species, unidentified file, wrong and mixed sound type refused")
single = ac.judge(A(5), {"spA": [A(1)], "spB": refs["spB"]}, "spA"); assert not single["consistent"] and "referenties" in single["reason"], single
assert not ac.reference_ok({**ok_ref, "description": "Calls and songs of Eurasian Siskins"}, ["Spinus spinus"], "song")
print("AUDIO MIN-REFERENCES PASS: single reference and mixed calls/songs recording refused")
thin = ac.judge(A(5), {"spA": refs["spA"], "spB": [B(3)]}, "spA"); assert not thin["consistent"] and "verwarringssoort" in thin["reason"], thin
empty = ac.judge(A(5), {"spA": refs["spA"], "spB": []}, "spA"); assert not empty["consistent"], empty
print("AUDIO CONFUSER COVERAGE PASS: confuser with <2 references refused")
