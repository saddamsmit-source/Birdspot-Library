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

def tag(f, who): f["author"] = who; return f
A = lambda s, who=None: tag(ac.features(song(3500, 900, seed=s)), who or f"opnemer-A{s}")   # "soort A": 3,5-4,4 kHz
B = lambda s, who=None: tag(ac.features(song(7200, -1500, seed=s)), who or f"opnemer-B{s}") # "soort B": dalend 6-7 kHz
refs = {"spA": [A(1), A(2)], "spB": [B(3), B(4)]}
ok = ac.judge(A(5), refs, "spA"); assert ok["consistent"], ok
wrong = ac.judge(B(6), refs, "spA"); assert not wrong["consistent"] and "marge" in wrong["reason"], wrong
noisy = ac.judge(tag(ac.features(song(3500, 900, noise=0.25, seed=8)), "x"), refs, "spA"); assert not noisy["consistent"], noisy
silent = ac.judge(tag(ac.features(0.001 * rng.standard_normal(ac.SR * 10).astype(np.float32)), "x"), refs, "spA"); assert not silent["consistent"]
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
C = lambda s, who=None: tag(ac.features(song(5200, 600, seed=s)), who or f"opnemer-C{s}")
three = {"spA": refs["spA"], "spB": refs["spB"], "spC": [C(11)]}
assert ac.judge(A(5), three, "spA", ["spB"])["consistent"], "irrelevant species C must not block when not a confuser"
assert not ac.judge(A(5), three, "spA", ["spB", "spC"])["consistent"], "listed confuser with 1 reference must block"
assert not ac.judge(A(5), three, "spA", ["spD"])["consistent"], "listed confuser without references must block"
print("AUDIO CONFUSER LIST PASS: only knowledge-profile confusers count, each needs 2 references")

# F3-R12b (review 16-11 17:19): independence, validation, evidence ceiling
assert ok["evidenceLevel"].startswith("PARTIALLY TESTED") and "VERIFIED" not in ok["evidenceLevel"].replace("PARTIALLY TESTED", ""), ok
same = ac.judge(A(5), {"spA": [A(1, "Jan"), A(2, "Jan"), A(3, "jan ")], "spB": refs["spB"]}, "spA")
assert not same["consistent"] and "referenties" in same["reason"], ("same recordist counted as independent", same)
selfref = ac.judge(A(5, "Piet"), {"spA": [A(1, "Piet"), A(2)], "spB": refs["spB"]}, "spA", cand_author="Piet")
assert not selfref["consistent"], ("candidate recordist must not supply own reference", selfref)
mislabeled = ac.judge(A(5), {"spA": refs["spA"], "spB": [A(6), A(7)]}, "spA")
assert not mislabeled["consistent"] and "onderscheiden" in mislabeled["reason"], ("indistinguishable references must block", mislabeled)
mixed_conf = ac.judge(A(5), {"spA": refs["spA"], "spB": [B(3), A(8)]}, "spA")
assert not mixed_conf["consistent"], ("confuser references contaminated with own species must block", mixed_conf)
tone = np.sin(2 * np.pi * 3900 * np.arange(ac.SR * 12) / ac.SR).astype(np.float32) * 0.3
t = ac.judge(tag(ac.features(tone), "x"), refs, "spA")
assert (not t["consistent"]) or t["evidenceLevel"].startswith("PARTIALLY TESTED"), t
assert not any(ac.judge(f, refs, "spA").get("evidenceLevel", "").startswith("VERIFIED") for f in (A(9), B(9), tag(ac.features(tone), "y"))), "audiocheck may never yield VERIFIED"
print("AUDIO INDEPENDENCE PASS: same recordist, candidate recordist, indistinguishable or contaminated references refused; ceiling PARTIALLY TESTED", "tone:", t.get("reason"))
