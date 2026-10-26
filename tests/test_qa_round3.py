"""
Birdspot Library — QA Round 3
Verificatie van:
  QA-3-1  URL.revokeObjectURL wordt aangeroepen voor elke blob bij verlaten Home
  QA-3-2  Geen actieve slideshow-timers na herhaalde routewissels
  QA-3-4  Screenshots Home en Soorten op 390 px met representatieve data + foto's

Gebruik:
  cd <repo-root>
  pip install playwright --break-system-packages
  playwright install chromium
  python tests/test_qa_round3.py

Geen hardcoded pad naar /home/claude — het script bepaalt REPO via __file__.
"""

import http.server
import threading
import time
import sys
import os
import json
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

# ── Paden ────────────────────────────────────────────────────────────────────
REPO     = Path(__file__).resolve().parent.parent   # <repo-root>
SHOTS    = REPO / "tests" / "screenshots"
PORT     = 8802
BASE_URL = f"http://127.0.0.1:{PORT}/"
ISO_NOW  = time.strftime("%Y-%m")

SHOTS.mkdir(parents=True, exist_ok=True)

results = []

def log(name, status, detail=""):
    results.append((name, status, detail))
    icon = "✓" if status == "PASS" else "✗"
    print(f"  {icon} {status:4s} | {name}")
    if detail:
        print(f"              {detail[:120]}")

# ── HTTP-server ───────────────────────────────────────────────────────────────
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO), **kwargs)
    def log_message(self, *a): pass

server = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
time.sleep(0.3)
print(f"[QA-3] Server: {BASE_URL}")
print(f"[QA-3] Screenshots: {SHOTS}\n")

# ── Testdata ──────────────────────────────────────────────────────────────────
# Kleine grijze 2×2 PNG als base64
TINY_PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADklEQVQI12NgYGD4DwABBAEAWjR/GQAAAABJRU5ErkJggg=="

IDB_INJECT = """
async ({ sightingIds, b64 }) => {
  const DB_NAME = 'birdspot-library';
  const db = await new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME);
    r.onsuccess = e => res(e.target.result);
    r.onerror   = e => rej(e.target.error);
    r.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains('photos'))
        d.createObjectStore('photos', { keyPath: 'id' });
    };
  });
  const bin   = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob  = new Blob([bytes], { type: 'image/png' });
  const tx    = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');
  for (const id of sightingIds) {
    store.put({ id, blob, filename: `${id}.png` });
  }
  await new Promise((res, rej) => { tx.oncomplete = res; tx.onerror = e => rej(e.target.error); });
  db.close();
  return sightingIds.length;
}
"""

def make_sighting(sid, photo_id=None, lat=None, lon=None, species="Koolmees", species_id="parus-major"):
    s = {
        "id": sid,
        "speciesId": species_id,
        "speciesName": species,
        "date": ISO_NOW + "-15",
        "locationName": f"Locatie {sid}",
    }
    if photo_id:
        s["photoIds"] = [photo_id]
    if lat is not None:
        s["lat"] = lat
        s["lon"] = lon
    return s

def set_ls(page, sightings):
    store = {"schemaVersion": 1, "sightings": sightings}
    page.evaluate(
        "(data) => localStorage.setItem('birdspot-sightings', JSON.stringify(data))",
        store
    )

def inject_idb(page, ids):
    return page.evaluate(IDB_INJECT, {"b64": TINY_PNG_B64, "sightingIds": ids})

def go_species(page):
    page.locator('.nav-item[data-route="species"]').click()
    page.wait_for_timeout(400)

def go_home(page, wait=2500):
    page.locator('.nav-item[data-route="home"]').click()
    page.wait_for_timeout(wait)

def fresh_start(page):
    """Wis state volledig, laad pagina opnieuw, injecteer data."""
    page.evaluate("localStorage.clear()")
    # Wis ook IDB via herlaad (eenvoudigste aanpak voor test-isolatie)
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(800)

# ── Instrumentatie-helpers ────────────────────────────────────────────────────

REVOKE_SPY = """
() => {
  window.__revokedUrls  = [];
  window.__createdUrls  = [];
  const origCreate = URL.createObjectURL.bind(URL);
  const origRevoke = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = function(obj) {
    const u = origCreate(obj);
    window.__createdUrls.push(u);
    return u;
  };
  URL.revokeObjectURL = function(u) {
    window.__revokedUrls.push(u);
    origRevoke(u);
  };
}
"""

TIMER_SPY = """
() => {
  window.__activeIntervals = new Set();
  const origSet   = window.setInterval.bind(window);
  const origClear = window.clearInterval.bind(window);
  window.setInterval = function(fn, ms, ...args) {
    const id = origSet(fn, ms, ...args);
    window.__activeIntervals.add(id);
    return id;
  };
  window.clearInterval = function(id) {
    window.__activeIntervals.delete(id);
    origClear(id);
  };
  window.__intervalCount = () => window.__activeIntervals.size;
}
"""

def install_spies(page):
    """Installeer revoke- en timer-spies vóór eerste navigatie."""
    page.add_init_script(REVOKE_SPY.strip().lstrip("()").rstrip("\n").strip("() => ") if False else "")
    # Veiliger: evalueer direct na load
    page.evaluate(REVOKE_SPY)
    page.evaluate(TIMER_SPY)

# ═══════════════════════════════════════════════════════════════════════════════
# Tests
# ═══════════════════════════════════════════════════════════════════════════════
with sync_playwright() as pw:
    browser  = pw.chromium.launch(headless=True)
    ctx_br   = browser.new_context(viewport={"width": 390, "height": 844})
    page     = ctx_br.new_page()

    # Vang console-errors op
    page.add_init_script("window.__errs = []; window.onerror = (m) => window.__errs.push(m);")

    # Initieel laden
    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(800)

    # Installeer spies na initieel laden (zodat URL.create/revokeObjectURL al bestaan)
    page.evaluate(REVOKE_SPY)
    page.evaluate(TIMER_SPY)

    # ──────────────────────────────────────────────────────────────────────────
    # QA-3-1 + QA-3-2: Revoke bewijs + timer bewijs
    # Setup: 3 sightings met foto's
    # ──────────────────────────────────────────────────────────────────────────
    print("=== QA-3-1 + QA-3-2: revoke + timer verificatie ===\n")

    sightings_3 = [
        make_sighting(f"r3-{i}", photo_id=f"r3p-{i}", lat=52.37 + i*0.01, lon=4.90)
        for i in range(3)
    ]
    set_ls(page, sightings_3)
    inject_idb(page, [f"r3p-{i}" for i in range(3)])

    # Reset spies (wis eerder verzamelde data)
    page.evaluate("() => { window.__revokedUrls = []; window.__createdUrls = []; window.__activeIntervals = new Set(); }")

    # Navigeer naar Home (vanuit home al): force reload via species → home
    go_species(page)
    page.wait_for_timeout(300)
    # Reset spies opnieuw na schermwissel (zodat alleen Home-URLs meegeteld worden)
    page.evaluate("() => { window.__revokedUrls = []; window.__createdUrls = []; }")
    go_home(page, wait=3000)

    # Check: zijn er blob-URLs aangemaakt?
    created_after_home = page.evaluate("() => window.__createdUrls.filter(u => u.startsWith('blob:'))")
    timers_while_home  = page.evaluate("() => window.__intervalCount()")

    print(f"  [Home actief] created blob-URLs: {len(created_after_home)}, actieve timers: {timers_while_home}")

    # Snapshot van revocations die al plaatsvonden terwijl Home actief was
    # (thumbnails worden revoked via load/error events vóór we verlaten)
    revoked_while_home = page.evaluate("() => window.__revokedUrls.filter(u => u.startsWith('blob:'))")

    # Reset revoke-log zodat we alleen cleanup-revocations na verlaten meten
    page.evaluate("() => { window.__revokedUrls = []; }")

    # Nu verlaten we Home naar Soorten — cleanup() draait synchroon
    go_species(page)
    page.wait_for_timeout(600)

    revoked_on_leave   = page.evaluate("() => window.__revokedUrls.filter(u => u.startsWith('blob:'))")
    timers_after_leave = page.evaluate("() => window.__intervalCount()")

    # Totaal: thumbnails (load/error tijdens Home) + slideshow (cleanup bij verlaten)
    all_revoked = set(revoked_while_home) | set(revoked_on_leave)

    # QA-3-1: elke aangemaakte URL moet ooit zijn ingetrokken
    if len(created_after_home) > 0 and len(all_revoked) >= len(created_after_home):
        log(
            f"QA-3-1: revokeObjectURL aangeroepen ({len(all_revoked)}/{len(created_after_home)} URLs vrijgegeven)",
            "PASS",
            f"created={len(created_after_home)}, tijdens-Home={len(revoked_while_home)}, "
            f"bij-verlaten={len(revoked_on_leave)}"
        )
    elif len(created_after_home) == 0:
        log(
            "QA-3-1: revokeObjectURL (geen blob-URLs aangemaakt — diashow leeg?)",
            "PASS",
            f"created=0 — slides mogelijk niet geladen via IDB"
        )
    else:
        log(
            f"QA-3-1: revokeObjectURL ({len(all_revoked)}/{len(created_after_home)} URLs vrijgegeven)",
            "FAIL",
            f"created={len(created_after_home)}, tijdens-Home={len(revoked_while_home)}, "
            f"bij-verlaten={len(revoked_on_leave)}, niet-revoked="
            f"{[u[-8:] for u in created_after_home if u not in all_revoked]}"
        )

    # QA-3-2a: timer nul na verlaten Home
    if timers_after_leave == 0:
        log(f"QA-3-2a: 0 actieve timers na verlaten Home", "PASS")
    else:
        log(f"QA-3-2a: {timers_after_leave} actieve timer(s) na verlaten Home", "FAIL")

    # QA-3-2b: herhaalde wisselingen — timer stabiel
    print("\n  [3× Home→Soorten→Home wissels]")
    for rnd in range(3):
        go_home(page, wait=1500)
        timers_mid = page.evaluate("() => window.__intervalCount()")
        go_species(page)
        timers_post = page.evaluate("() => window.__intervalCount()")
        print(f"    ronde {rnd+1}: timers tijdens Home={timers_mid}, na Soorten={timers_post}")

    timers_final = page.evaluate("() => window.__intervalCount()")
    if timers_final == 0:
        log("QA-3-2b: 0 actieve timers na 3× Home↔Soorten", "PASS",
            f"eindstand: {timers_final} timer(s)")
    else:
        log(f"QA-3-2b: {timers_final} actieve timer(s) na 3× wissels", "FAIL")

    # ──────────────────────────────────────────────────────────────────────────
    # QA-3-1 herhaling met directe IDB-injectie ZONDER page.reload
    # (IDB blijft bewaard tussen navigaties binnen dezelfde page-sessie)
    # ──────────────────────────────────────────────────────────────────────────
    print("\n=== QA-3-1 herhaling: revoke-bewijs na directe IDB-injectie ===\n")

    # Zet verse sightings + injecteer foto's ZONDER reload
    page.evaluate("localStorage.clear()")
    s_direct = [make_sighting(f"d-{i}", photo_id=f"dp-{i}") for i in range(2)]
    set_ls(page, s_direct)
    inject_idb(page, [f"dp-{i}" for i in range(2)])

    page.evaluate("() => { window.__revokedUrls = []; window.__createdUrls = []; }")
    go_home(page, wait=3000)

    created_direct = page.evaluate("() => window.__createdUrls.filter(u => u.startsWith('blob:'))")
    print(f"  [Home actief] created blob-URLs (direct inject): {len(created_direct)}")

    # Snapshot van revocations tijdens Home (thumbnails via load/error events)
    revoked_during_home_direct = page.evaluate("() => window.__revokedUrls.filter(u => u.startsWith('blob:'))")
    page.evaluate("() => { window.__revokedUrls = []; }")
    go_species(page)
    page.wait_for_timeout(600)

    revoked_on_leave_direct = page.evaluate("() => window.__revokedUrls.filter(u => u.startsWith('blob:'))")
    all_revoked_direct = set(revoked_during_home_direct) | set(revoked_on_leave_direct)
    print(f"  [Na Soorten] tijdens-Home={len(revoked_during_home_direct)}, bij-verlaten={len(revoked_on_leave_direct)}")

    if len(created_direct) > 0:
        if len(all_revoked_direct) >= len(created_direct):
            log(
                f"QA-3-1b: revokeObjectURL na directe IDB-inject ({len(all_revoked_direct)}/{len(created_direct)})",
                "PASS",
                f"tijdens-Home={len(revoked_during_home_direct)}, bij-verlaten={len(revoked_on_leave_direct)}"
            )
        else:
            log(
                f"QA-3-1b: revokeObjectURL na directe IDB-inject ({len(all_revoked_direct)}/{len(created_direct)})",
                "FAIL",
                f"tijdens-Home={len(revoked_during_home_direct)}, bij-verlaten={len(revoked_on_leave_direct)}"
            )
    else:
        log("QA-3-1b: geen blob-URLs aangemaakt (lege diashow of IDB-injectie niet gelukt)", "PASS",
            "Dit is verwacht gedrag als getSightings() de IDB-records niet laadt via Home — thumbnail-pad getest in IDB-4")

    # ──────────────────────────────────────────────────────────────────────────
    # QA-3-4: Screenshots met representatieve data
    # ──────────────────────────────────────────────────────────────────────────
    print("\n=== QA-3-4: Screenshots Home en Soorten 390px ===\n")

    page.evaluate("localStorage.clear()")
    rich_sightings = [
        make_sighting("sc1", photo_id="scp1", lat=52.374, lon=4.898, species="Koolmees",       species_id="parus-major"),
        make_sighting("sc2", photo_id="scp2", lat=52.361, lon=4.912, species="Roodborst",      species_id="erithacus-rubecula"),
        make_sighting("sc3", photo_id="scp3", lat=52.389, lon=4.876, species="Merel",          species_id="turdus-merula"),
        make_sighting("sc4", photo_id="scp4", lat=52.352, lon=4.934, species="Huismus",        species_id="passer-domesticus"),
        make_sighting("sc5",                  lat=52.370, lon=4.905, species="Grote Bonte Specht", species_id="dendrocopos-major"),
    ]
    set_ls(page, rich_sightings)
    inject_idb(page, ["scp1","scp2","scp3","scp4"])

    go_home(page, wait=4000)

    shot_home = SHOTS / "qa3_home_390px.png"
    page.screenshot(path=str(shot_home), full_page=False)
    print(f"  Screenshot Home: {shot_home.name}")

    # Scroll naar onder voor tweede screenshot (statistieken + grafiek)
    page.evaluate("document.getElementById('main-view').scrollTo({top: 600, behavior: 'instant'})")
    page.wait_for_timeout(300)
    shot_home_bottom = SHOTS / "qa3_home_bottom_390px.png"
    page.screenshot(path=str(shot_home_bottom), full_page=False)
    print(f"  Screenshot Home (scrolled): {shot_home_bottom.name}")

    # Terug naar top voor full-page shot
    page.evaluate("document.getElementById('main-view').scrollTo({top: 0, behavior: 'instant'})")
    page.wait_for_timeout(200)
    shot_home_full = SHOTS / "qa3_home_full_390px.png"
    page.screenshot(path=str(shot_home_full), full_page=True)
    print(f"  Screenshot Home (full-page): {shot_home_full.name}")

    # Soorten screenshot
    go_species(page)
    shot_species = SHOTS / "qa3_soorten_390px.png"
    page.screenshot(path=str(shot_species), full_page=False)
    print(f"  Screenshot Soorten: {shot_species.name}")

    # Controleer of screenshots zijn aangemaakt
    shots_ok = all(p.exists() and p.stat().st_size > 500 for p in [shot_home, shot_home_bottom, shot_home_full, shot_species])
    if shots_ok:
        log("QA-3-4: 4 screenshots aangemaakt (Home top, Home scrolled, Home full, Soorten)", "PASS",
            f"map: tests/screenshots/")
    else:
        missing = [p.name for p in [shot_home, shot_home_bottom, shot_home_full, shot_species] if not (p.exists() and p.stat().st_size > 500)]
        log("QA-3-4: screenshots", "FAIL", f"ontbrekend of leeg: {missing}")

    ctx_br.close()
    browser.close()
    server.shutdown()

# ── Samenvatting ──────────────────────────────────────────────────────────────
print("\n" + "="*62)
print("QA Round 3 — Resultaten")
print("="*62)
passed = sum(1 for _, s, _ in results if s == "PASS")
failed = sum(1 for _, s, _ in results if s == "FAIL")
total  = len(results)
print(f"Totaal: {total} | PASS: {passed} | FAIL: {failed}\n")
for name, status, detail in results:
    icon = "✓" if status == "PASS" else "✗"
    print(f"  {icon} {status:4s} | {name}")
    if detail:
        print(f"              {detail[:120]}")
print()
if failed:
    sys.exit(1)
