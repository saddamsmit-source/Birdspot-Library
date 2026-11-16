"""Birdspot audio-check (F3-R11b, 16-11-2026): akoestische controle zonder menselijk luisteren.

Draait in GitHub Actions (de Claude-runtime kan Wikimedia niet bereiken). Per opname:
  - origineel downloaden en SHA-1 tegen Commons controleren;
  - decoderen (ffmpeg, mono 22,05 kHz, max. 60 s);
  - spectrogram-PNG (eerste 20 s, 0-12 kHz) voor visuele beoordeling;
  - kenmerken: gemiddeld spectraal profiel (48 log-banden 1-11 kHz) en histogram van de dominante frequentie
    over actieve frames, SNR, dominante frequentie p10/p50/p90, elementen per seconde, beste fragment van 10 s;
  - gelijkenis van elke kandidaat met referentie-opnamen (andere opnemers) per soort en geluidsoort.

Beslisregel (bewust streng, zie docs/media-intake/AUDIOCHECK_PROTOCOL.md): een kandidaat is akoestisch
consistent als (1) de gemiddelde gelijkenis met referenties van de eigen soort hoger is dan met elke
verwarringssoort, met een marge van minstens MARGIN, (2) SNR >= MIN_SNR dB en (3) het beste fragment
minstens MIN_ACTIVE actief is. Dit is één bewijslijn; publicatie vraagt daarnaast bronlabel en visuele
spectrogramcontrole. Geen machine-learningmodel (BirdNET heeft een NC-licentie en is bewust niet gebruikt).

Gebruik: python tools/media/audio_check.py <manifest.json> --out <map>
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

SR = 22050
N_FFT = 1024
HOP = 256
BANDS = np.geomspace(1000, 11000, 49)
MARGIN = 0.05
MIN_SNR = 15.0
MIN_ACTIVE = 0.25
MIN_REFS = 2
MIXED = ('calls and song', 'call and song', 'songs and calls', 'song and call', 'calls and songs')


def decode(data: bytes, seconds: float = 60.0) -> np.ndarray:
    out = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-i", "pipe:0", "-t", str(seconds),
                          "-ac", "1", "-ar", str(SR), "-f", "s16le", "pipe:1"], input=data, capture_output=True, check=True)
    return np.frombuffer(out.stdout, dtype="<i2").astype(np.float32) / 32768.0


def spectrogram(x: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    if len(x) < N_FFT:
        x = np.pad(x, (0, N_FFT - len(x)))
    frames = np.lib.stride_tricks.sliding_window_view(x, N_FFT)[::HOP] * np.hanning(N_FFT)
    mag = np.abs(np.fft.rfft(frames, axis=1)) + 1e-10
    return 20 * np.log10(mag), np.fft.rfftfreq(N_FFT, 1 / SR)


def features(x: np.ndarray) -> dict:
    db, freqs = spectrogram(x)
    sel = (freqs >= BANDS[0]) & (freqs < BANDS[-1])
    db, f = db[:, sel], freqs[sel]
    idx = np.clip(np.digitize(f, BANDS) - 1, 0, len(BANDS) - 2)
    bands = np.stack([db[:, idx == b].mean(axis=1) if np.any(idx == b) else np.full(len(db), -200.0)
                      for b in range(len(BANDS) - 1)], axis=1)
    floor = np.percentile(bands, 20, axis=0)
    excess = (bands - floor).max(axis=1)
    active = excess > 10.0
    frac = float(active.mean()) if len(active) else 0.0
    if active.sum() < 5:
        return {"activeFraction": frac, "usable": False}
    prof = (bands[active] - floor).mean(axis=0)
    prof = (prof - prof.mean()) / (prof.std() + 1e-9)
    dom = f[db[active].argmax(axis=1)]
    hist = np.histogram(dom, bins=BANDS)[0].astype(float)
    hist /= hist.sum() + 1e-9
    onsets = int(np.sum(np.diff(active.astype(int)) == 1))
    secs = len(x) / SR
    win = int(10 * SR / HOP)
    if len(active) > win:
        cs = np.convolve(active.astype(float), np.ones(win), "valid")
        start = int(cs.argmax())
        best = {"start": round(start * HOP / SR, 1), "seconds": 10.0, "active": round(float(cs.max() / win), 2)}
    else:
        best = {"start": 0.0, "seconds": round(secs, 1), "active": round(frac, 2)}
    snr = float(np.median(excess[active]))
    return {"usable": True, "seconds": round(secs, 1), "activeFraction": round(frac, 3), "snrDb": round(snr, 1),
            "domHz": [int(np.percentile(dom, q)) for q in (10, 50, 90)], "elementsPerSecond": round(onsets / secs, 2),
            "bestFragment": best, "profile": [round(float(v), 4) for v in prof],
            "domHist": [round(float(v), 4) for v in hist]}


def similarity(a: dict, b: dict) -> float:
    pa, pb = np.array(a["profile"]), np.array(b["profile"])
    ha, hb = np.array(a["domHist"]), np.array(b["domHist"])
    cos = lambda u, v: float(u @ v / (np.linalg.norm(u) * np.linalg.norm(v) + 1e-9))
    return round(0.5 * cos(pa, pb) + 0.5 * cos(ha, hb), 4)


def judge(cand: dict, refs: dict[str, list[dict]], own: str) -> dict:
    """refs: soort-ID -> referentiekenmerken (zelfde geluidsoort, andere opnemers). Pure functie voor tests."""
    if not cand.get("usable"):
        return {"consistent": False, "reason": "te weinig actief geluid"}
    means = {sid: round(float(np.mean([similarity(cand, r) for r in rs])), 4) for sid, rs in refs.items() if rs}
    if own not in means:
        return {"consistent": False, "reason": "geen referentie van de eigen soort", "means": means}
    if len(refs[own]) < MIN_REFS:
        return {"consistent": False, "reason": f"minder dan {MIN_REFS} referenties van de eigen soort", "means": means}
    thin = sorted(k for k, rs in refs.items() if k != own and len(rs) < MIN_REFS)
    if thin:
        return {"consistent": False, "reason": "verwarringssoort onvoldoende referenties: " + ", ".join(thin), "means": means}
    others = {k: v for k, v in means.items() if k != own}
    margin = round(means[own] - max(others.values()), 4) if others else None
    reasons = []
    if margin is None:
        reasons.append("geen verwarringssoort om tegen te toetsen")
    elif margin < MARGIN:
        reasons.append(f"marge {margin} < {MARGIN}")
    if cand["snrDb"] < MIN_SNR:
        reasons.append(f"SNR {cand['snrDb']} dB < {MIN_SNR}")
    if cand["bestFragment"]["active"] < MIN_ACTIVE:
        reasons.append("beste fragment te weinig actief")
    return {"consistent": not reasons, "means": means, "margin": margin, "reason": "; ".join(reasons) or "ok"}


def reference_ok(info: dict, sci_names: list[str], sound_type: str) -> bool:
    """Referentie alleen bij exacte wetenschappelijke naam in titel of categorie (geen verwante soorten zoals
    Andean Siskin) en, als de bron een type noemt (xeno-canto: 'Type: song'), het juiste geluidstype."""
    hay = " ".join([info.get("title", "")] + info.get("categories", [])).casefold()
    if not sci_names or not any(n.casefold() in hay for n in sci_names):
        return False
    desc = (info.get("description") or "").casefold()
    if any(x in desc for x in MIXED):
        return False  # gemengde opname (zang én roep): niet als referentie voor één geluidsoort
    m = __import__("re").search(r"type:\s*([a-z ,/-]+)", desc)
    if m:
        kinds = m.group(1)
        if sound_type == "song" and "song" not in kinds:
            return False
        if sound_type == "call" and "call" not in kinds:
            return False
        if "song" in kinds and "call" in kinds:
            return False  # gemengd type: niet als referentie voor één geluidsoort
    return True


def plot(x: np.ndarray, path: Path, title: str) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    db, freqs = spectrogram(x[: 20 * SR])
    keep = freqs <= 12000
    fig, ax = plt.subplots(figsize=(10, 3.2), dpi=90)
    t = np.arange(db.shape[0]) * HOP / SR
    ax.imshow(db[:, keep].T, origin="lower", aspect="auto", cmap="magma",
              extent=[0, t[-1] if len(t) else 1, 0, 12], vmin=np.percentile(db, 30), vmax=db.max())
    ax.set_xlabel("s"); ax.set_ylabel("kHz"); ax.set_title(title[:110], fontsize=9)
    fig.tight_layout(); fig.savefig(path); plt.close(fig)


def run(manifest: Path, out: Path) -> None:
    sys.path.insert(0, str(Path(__file__).parent))
    import commons_intake as ci
    spec = json.loads(manifest.read_text(encoding="utf-8"))
    out.mkdir(parents=True, exist_ok=True)
    items = []
    for e in spec["items"]:
        if "search" in e:
            res = ci.get(ci.API, {"action": "query", "list": "search", "srnamespace": "6",
                                  "srsearch": e["search"] + " filetype:audio", "srlimit": "15"})
            titles = [s["title"] for s in res["query"]["search"]]
            infos = ci.imageinfo(titles) if titles else {}
            excl = {ci.norm_name(a) for a in e.get("excludeAuthors", [])}
            excl_t = set(e.get("excludeTitles", []))
            picked = [i for t in titles if (i := infos.get(t)) and ci.license_ok(i["license"])
                      and ci.norm_name(i["author"]) not in excl and t not in excl_t
                      and reference_ok(i, e.get("sciNames", []), e.get("soundType", ""))][: e.get("pick", 2)]
            for n, info in enumerate(picked):
                items.append({**{k: v for k, v in e.items() if k not in ("search", "pick")},
                              "id": f"{e['id']}_{n + 1}", "title": info["title"], "info": info})
        else:
            items.append(e)
    titles = [i["title"] for i in items if "info" not in i]
    infos = ci.imageinfo(titles) if titles else {}
    report = {"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "protocol": __doc__.strip().splitlines()[0],
              "rule": {"margin": MARGIN, "minSnrDb": MIN_SNR, "minActive": MIN_ACTIVE}, "recordings": [], "judgements": []}
    feats = {}
    for i in items:
        info = i.get("info") or infos.get(i["title"])
        rec = {k: i.get(k) for k in ("id", "speciesId", "role", "soundType", "title")}
        if not info:
            rec["error"] = "niet gevonden"; report["recordings"].append(rec); continue
        rec.update({k: info[k] for k in ("page", "sha1", "license", "author", "description", "duration")})
        if i.get("sha1") and i["sha1"] != info["sha1"]:
            rec["error"] = "SHA-1 afwijkend"; report["recordings"].append(rec); continue
        if not ci.license_ok(info["license"]):
            rec["error"] = "licentie niet toegestaan"; report["recordings"].append(rec); continue
        data = ci.get(info["url"], binary=True)
        import hashlib
        if hashlib.sha1(data).hexdigest() != info["sha1"]:
            rec["error"] = "download-SHA-1 afwijkend"; report["recordings"].append(rec); continue
        x = decode(data)
        f = features(x)
        png = f"{i['id']}.png"
        plot(x, out / png, f"{i['id']} · {i.get('speciesId')} · {i.get('role')} · {info['author']}")
        rec.update({"spectrogram": png, "features": {k: v for k, v in f.items() if k not in ("profile", "domHist")}})
        feats[i["id"]] = (rec, f)
        report["recordings"].append(rec)
    for cid, (rec, f) in feats.items():
        if rec["role"] != "candidate":
            continue
        refs = {sid: [] for sid in {r["speciesId"] for r, _ in feats.values() if r["role"] == "candidate"}}
        seen = {}
        for rid, (r2, f2) in feats.items():
            if (r2["role"] == "reference" and r2["soundType"] == rec["soundType"] and f2.get("usable")
                    and r2["sha1"] not in seen.setdefault(r2["speciesId"], set())):
                seen[r2["speciesId"]].add(r2["sha1"])
                refs.setdefault(r2["speciesId"], []).append(f2)
        report["judgements"].append({"id": cid, "speciesId": rec["speciesId"], "soundType": rec["soundType"],
                                     **judge(f, refs, rec["speciesId"])})
    (out / "audiocheck.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("audiocheck:", len(report["recordings"]), "opnamen,", len(report["judgements"]), "oordelen")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    out = Path(sys.argv[sys.argv.index("--out") + 1]) if "--out" in sys.argv else Path("docs/media-intake/audiocheck")
    run(Path(sys.argv[1]), out)
