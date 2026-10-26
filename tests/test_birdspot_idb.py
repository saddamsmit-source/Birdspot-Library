"""
Birdspot Library — QA Round 2 Point 2
IndexedDB blob-regressietests via Playwright + page.evaluate() IDB-harness.

Aanpak:
  1. Laad de app (DB-schema wordt aangemaakt door app bij eerste getDB()-aanroep).
  2. Injecteer synthetische Blob-records via page.evaluate() ná pagina-idle.
  3. Navigeer via nav-klikken zodat renderHome() vers wordt aangeroepen.

Scenarios:
  IDB-1  Één foto: slideshow laadt blob-URL (src starts with blob:)
  IDB-2  Meerdere foto's: slides == dots (pre-filter invariant)
  IDB-3  Ontbrekende blob (record zonder .blob): geen crash, slides==dots
  IDB-4  Thumbnail recentList: blob-URL aanwezig bij DOM-placement (niet vroeg revoked)
  IDB-5  Herlaad (Home→Soorten→Home): slideshow herstart zonder crash
  IDB-6  Snelle tabwissel x3: geen JS-crash, diashow correct na terugkeer
  IDB-7  URL-lifecycle: getPhotoUrl geeft null terug voor record zonder blob
"""

import http.server
import threading
import time
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

REPO     = str(Path(__file__).resolve().parent.parent)   # <repo-root>, geen hardcoded pad
PORT     = 8801
BASE_URL = f"http://127.0.0.1:{PORT}/"
ISO_NOW  = time.strftime("%Y-%m")

results = []

def log(name, status, detail=""):
    results.append((name, status, detail))
    icon = "✓" if status == "PASS" else "✗"
    print(f"  {icon} {status:4s} | {name}")
    if detail:
        print(f"              {detail}")

# ── HTTP-server ─────────────────────────────────────────────────────────────
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=REPO, **kwargs)
    def log_message(self, *a): pass

server = http.server.HTTPServer(("127.0.0.1", PORT), Handler)
t = threading.Thread(target=server.serve_forever, daemon=True)
t.start()
time.sleep(0.3)
print(f"[IDB-tests] Server: {BASE_URL}")

# ── Kleine grijze 2×2 PNG als base64 (geldige image/png blob) ────────────────
TINY_PNG_B64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAADklEQVQI12NgYGD4DwABBAEAWjR/GQAAAABJRU5ErkJggg=="

# ── IDB inject-helper (JS, draait in browser) ────────────────────────────────
# Schrijft records rechtstreeks in de 'photos' objectStore.
# sightingIds: lijst van id-strings die elk een geldige PNG-blob krijgen.
# extra_no_blob: voeg één record toe zonder .blob veld.
IDB_INJECT = """
async ({ sightingIds, extraNoBlobId, b64 }) => {
  const DB_NAME = 'birdspot-library';

  // Open de bestaande DB (mag al open zijn door de app)
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

  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i=0;i<bin.length;i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'image/png' });

  const tx    = db.transaction('photos', 'readwrite');
  const store = tx.objectStore('photos');

  for (const id of sightingIds) {
    store.put({ id, blob, filename: `${id}.png` });
  }
  if (extraNoBlobId) {
    store.put({ id: extraNoBlobId, filename: 'no-blob.png' });
    // Geen .blob veld!
  }

  await new Promise((res, rej) => {
    tx.oncomplete = res;
    tx.onerror    = e => rej(e.target.error);
  });
  db.close();
  return sightingIds.length + (extraNoBlobId ? 1 : 0);
}
"""

def make_sighting(sid, photo_id=None, lat=None, lon=None):
    s = {
        "id": sid,
        "speciesId": "parus-major",
        "speciesName": "Koolmees",
        "date": ISO_NOW + "-15",
        "locationName": "Testlocatie",
    }
    if photo_id:
        s["photoIds"] = [photo_id]
    if lat is not None:
        s["lat"] = lat; s["lon"] = lon
    return s

def set_ls(page, sightings):
    """Schrijf sightings naar localStorage in het schema dat getSightings() verwacht:
    { schemaVersion: 1, sightings: [...] }
    """
    store = {"schemaVersion": 1, "sightings": sightings}
    page.evaluate(
        "(data) => localStorage.setItem('birdspot-sightings', JSON.stringify(data))",
        store
    )

def inject_idb(page, ids, extra_no_blob=None):
    """Injecteer foto-records in IDB via page.evaluate."""
    return page.evaluate(
        IDB_INJECT,
        {"b64": TINY_PNG_B64, "sightingIds": ids, "extraNoBlobId": extra_no_blob}
    )

def go_to_species(page):
    page.locator('.nav-item[data-route="species"]').click()
    page.wait_for_timeout(400)

def go_to_home(page):
    page.locator('.nav-item[data-route="home"]').click()
    page.wait_for_timeout(2500)  # ruim genoeg voor IDB async loads

def fresh_home(page):
    """Wis state, ga naar species, dan home (zodat renderHome() vers draait)."""
    page.evaluate("localStorage.clear()")
    go_to_species(page)
    page.wait_for_timeout(200)

def console_errors(page):
    return page.evaluate("(window.__errs||[]).join('\\n')")

# ── Tests ─────────────────────────────────────────────────────────────────────
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx_br  = browser.new_context(viewport={"width": 390, "height": 844})
    page    = ctx_br.new_page()

    # Vang console-errors op
    page.add_init_script("window.__errs = []; window.onerror = (m,s,l,c,e) => window.__errs.push(m);")

    # Initiële lading — zorg dat DB-schema bestaat
    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(1000)
    print("App geladen. Start IDB-injectietests.\n")

    # ── IDB-1: Één foto — slideshow laadt blob-URL ────────────────────────────
    print("[IDB-1] Één foto: diashow toont <img src='blob:…'>")
    fresh_home(page)
    s1 = [make_sighting("s1", photo_id="p1")]
    set_ls(page, s1)
    injected = inject_idb(page, ["p1"])
    go_to_home(page)

    try:
        # Diashow-slides gebruiken backgroundImage (CSS), niet <img>.
        # Wacht tot er minstens één slide met een backgroundImage is.
        page.wait_for_selector('.slideshow__slide', timeout=5000)
        # Haal backgroundImage op van de eerste slide
        bg = page.evaluate("""
            () => {
                const s = document.querySelector('.slideshow__slide');
                return s ? s.style.backgroundImage : '';
            }
        """)
        if "blob:" in bg:
            log("IDB-1: slideshow slide backgroundImage=blob:", "PASS", bg[:60])
        else:
            empty = page.locator('.slideshow__empty').is_visible()
            log("IDB-1: slideshow slide backgroundImage=blob:", "FAIL",
                f"bg='{bg[:80]}', empty={empty}")
    except Exception as e:
        debug = page.evaluate("""
            () => ({
                inner: !!document.querySelector('.slideshow__inner'),
                slides: document.querySelectorAll('.slideshow__slide').length,
                empty: !!document.querySelector('.slideshow__empty'),
            })
        """)
        log("IDB-1: slideshow slide backgroundImage=blob:", "FAIL",
            f"Timeout — debug: {debug}")

    # ── IDB-2: Meerdere foto's — slides == dots ───────────────────────────────
    print("\n[IDB-2] Meerdere foto's: slides == dots")
    fresh_home(page)
    s2 = [make_sighting(f"s2-{i}", photo_id=f"p2-{i}") for i in range(3)]
    set_ls(page, s2)
    inject_idb(page, [f"p2-{i}" for i in range(3)])
    go_to_home(page)

    slides = page.locator('.slideshow__slide').count()
    dots   = page.locator('.slideshow__dot').count()
    if slides == dots:
        log(f"IDB-2: slides({slides}) == dots({dots})", "PASS")
    else:
        log(f"IDB-2: slides({slides}) == dots({dots})", "FAIL",
            "Pre-filter invariant geschonden")

    # ── IDB-3: Ontbrekende blob — geen crash, slides==dots ───────────────────
    print("\n[IDB-3] Ontbrekende blob: geen crash, slides==dots")
    fresh_home(page)
    s3 = [make_sighting("s3-valid", photo_id="p3-valid"),
          make_sighting("s3-bad",   photo_id="p3-no-blob")]
    set_ls(page, s3)
    inject_idb(page, ["p3-valid"], extra_no_blob="p3-no-blob")
    go_to_home(page)

    slides3 = page.locator('.slideshow__slide').count()
    dots3   = page.locator('.slideshow__dot').count()
    errs3   = console_errors(page)
    if slides3 == dots3 and not errs3:
        log(f"IDB-3: slides({slides3})==dots({dots3}), geen JS-errors", "PASS")
    elif errs3:
        log("IDB-3: geen JS-errors", "FAIL", f"errors: {errs3[:120]}")
    else:
        log(f"IDB-3: slides({slides3})==dots({dots3})", "FAIL",
            "Pre-filter invariant geschonden met ontbrekende blob")

    # ── IDB-4: Thumbnail recentList — blob-URL bij DOM-placement ─────────────
    print("\n[IDB-4] Thumbnail recente lijst: src=blob: bij DOM-placement")
    fresh_home(page)
    set_ls(page, [make_sighting("s4", photo_id="p4")])
    inject_idb(page, ["p4"])
    go_to_home(page)
    page.wait_for_timeout(500)  # extra wachten op async IDB-loads

    try:
        # Wacht tot er minstens één recent-item in de DOM staat
        page.wait_for_selector('.recent-item', timeout=5000)
        # Check: heeft het eerste item een thumb img met blob:-src?
        debug4 = page.evaluate("""
            () => {
                const thumbImgs = [...document.querySelectorAll('.recent-item__thumb img')];
                const thumbEmpty = [...document.querySelectorAll('.recent-item__thumb--empty')];
                return {
                    recentItems: document.querySelectorAll('.recent-item').length,
                    thumbImgs: thumbImgs.length,
                    thumbEmptyDivs: thumbEmpty.length,
                    firstSrc: thumbImgs[0] ? thumbImgs[0].src.slice(0,60) : null,
                };
            }
        """)
        first_src = debug4.get("firstSrc") or ""
        if first_src.startswith("blob:"):
            log("IDB-4: thumbnail img src=blob: bij DOM-placement", "PASS", first_src[:50])
        elif debug4.get("thumbEmptyDivs", 0) > 0:
            # Geen blob in IDB — lege thumb is OK, maar meldt het
            log("IDB-4: thumbnail img src=blob: bij DOM-placement", "FAIL",
                f"Geen blob gevonden voor foto (empty thumb) — debug: {debug4}")
        else:
            log("IDB-4: thumbnail img src=blob: bij DOM-placement", "FAIL",
                f"debug: {debug4}")
    except Exception as e:
        debug4b = page.evaluate("""
            () => ({
                recentItems: document.querySelectorAll('.recent-item').length,
                ls: !!localStorage.getItem('birdspot-sightings'),
            })
        """)
        log("IDB-4: thumbnail img src=blob: bij DOM-placement", "FAIL",
            f"Timeout — debug: {debug4b}")

    # ── IDB-5: Home→Soorten→Home — slideshow herstart zonder crash ───────────
    print("\n[IDB-5] Home→Soorten→Home: slideshow herstart, geen crash")
    fresh_home(page)
    s5 = [make_sighting(f"s5-{i}", photo_id=f"p5-{i}") for i in range(2)]
    set_ls(page, s5)
    inject_idb(page, [f"p5-{i}" for i in range(2)])
    go_to_home(page)
    # Nu wisselen
    go_to_species(page)
    go_to_home(page)

    errs5 = console_errors(page)
    has_ss = page.locator('.slideshow__inner, .slideshow__empty').count() > 0
    if not errs5 and has_ss:
        log("IDB-5: Home→Soorten→Home crashvrij + diashow aanwezig", "PASS")
    elif errs5:
        log("IDB-5: geen JS-crash", "FAIL", f"errors: {errs5[:120]}")
    else:
        log("IDB-5: diashow aanwezig na herstart", "FAIL")

    # ── IDB-6: Snelle tabwissel ×3 — geen crash ───────────────────────────────
    print("\n[IDB-6] Snelle tabwissel ×3: geen crash, diashow stabiel")
    fresh_home(page)
    s6 = [make_sighting(f"s6-{i}", photo_id=f"p6-{i}") for i in range(2)]
    set_ls(page, s6)
    inject_idb(page, [f"p6-{i}" for i in range(2)])
    go_to_home(page)

    for _ in range(3):
        page.locator('.nav-item[data-route="species"]').click()
        page.wait_for_timeout(150)
        page.locator('.nav-item[data-route="home"]').click()
        page.wait_for_timeout(200)

    page.wait_for_timeout(1000)
    errs6 = console_errors(page)
    has_ss6 = page.locator('.slideshow__inner, .slideshow__empty').count() > 0
    if not errs6 and has_ss6:
        log("IDB-6: 3× tabwissel crashvrij + diashow aanwezig", "PASS")
    elif errs6:
        log("IDB-6: geen JS-crash na 3× tabwissel", "FAIL", f"errors: {errs6[:120]}")
    else:
        log("IDB-6: diashow aanwezig na 3× tabwissel", "FAIL")

    # ── IDB-7: getPhotoUrl geeft null voor record zonder blob ─────────────────
    print("\n[IDB-7] getPhotoUrl(record zonder .blob) retourneert null")
    # Test de util-functie direct in de browser via dynamische import
    result7 = page.evaluate("""
        async () => {
            try {
                const mod = await import('/src/utils/photoUrl.js');
                const url = mod.getPhotoUrl({ id: 'test', filename: 'x.png' });
                return { url, ok: url === null };
            } catch(e) {
                return { url: null, ok: false, err: e.message };
            }
        }
    """)
    if result7.get("ok"):
        log("IDB-7: getPhotoUrl(no-blob) === null", "PASS")
    else:
        log("IDB-7: getPhotoUrl(no-blob) === null", "FAIL",
            f"returned: {result7.get('url')}, err: {result7.get('err','')}")

    ctx_br.close()
    browser.close()
    server.shutdown()

# ── Samenvatting ──────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("QA Round 2 Point 2 — IDB blob regressietests")
print("="*60)
passed  = sum(1 for _,s,_ in results if s=="PASS")
failed  = sum(1 for _,s,_ in results if s=="FAIL")
total   = len(results)
print(f"Totaal: {total} | PASS: {passed} | FAIL: {failed}")
print()
for name, status, detail in results:
    icon = "✓" if status=="PASS" else "✗"
    print(f"  {icon} {status:4s} | {name}")
    if detail:
        print(f"              {detail}")
print()
if failed:
    sys.exit(1)
