"""
Birdspot Library — QA Round 2 Point 2
IndexedDB blob-regressietests via Playwright + page.evaluate() IDB-harness.

Aanpak:
  1. Laad de app (DB-schema wordt aangemaakt door app bij eerste getDB()-aanroep).
  2. Injecteer synthetische Blob-records via page.evaluate() ná pagina-idle.
  3. Navigeer via nav-klikken zodat renderHome() vers wordt aangeroepen.

Scenarios:
  IDB-4  Thumbnail recentList: blob-URL aanwezig bij DOM-placement (niet vroeg revoked)
  IDB-7  URL-lifecycle: getPhotoUrl geeft null terug voor record zonder blob
  SHOWCASE-1  Home-showcase (CAP-BIRD-006) rendert een vogel na verse load
  SHOWCASE-2  Showcase overleeft snelle tabwissel x3 zonder crash

Uitgefaseerd op 10-11-2026 (zie PR "fix/retire-orphaned-slideshow"):
  IDB-1, IDB-2, IDB-3, IDB-5, IDB-6 testten de persoonlijke-foto-diashow
  (#slideshowInner/#slideshowDots/.slideshow__slide/.slideshow__dot/.slideshow__empty).
  Die markup is sinds commit 2b910c2 (05-11-2026) niet meer aanwezig: #slideshow
  werd hergebruikt voor de nieuwe curated showcase (CAP-BIRD-006, featuredCarousel.js).
  initSlideshow()/goToSlide() bleven als dode code staan — stil, geen crash, geen
  functionaliteit — en zijn in dezelfde PR verwijderd (Projecteigenaar koos Optie A:
  weesfunctie + verouderde tests opruimen, niet herbouwen). IDB-2 en IDB-3 slaagden
  daardoor al stilzwijgend vals-positief (0 slides == 0 dots). IDB-4 en IDB-7 testen
  een ongerelateerd mechanisme (recente-waarnemingenlijst resp. getPhotoUrl) en blijven
  ongewijzigd. SHOWCASE-1/2 hergebruiken dezelfde navigatiestress als de uitgefaseerde
  IDB-5/IDB-6, nu gericht op de functie die daadwerkelijk op die plek staat.
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

    # ── SHOWCASE-1: Home-showcase toont een vogel na verse load ──────────────
    print("\n[SHOWCASE-1] Home-showcase (CAP-BIRD-006): naam + foto na verse load")
    fresh_home(page)
    go_to_home(page)

    try:
        page.wait_for_selector('#featuredBirdName', timeout=5000)
        debug_sc1 = page.evaluate("""
            () => {
                const stage = document.querySelector('#slideshow');
                const name  = document.querySelector('#featuredBirdName');
                const img   = document.querySelector('#featuredBirdImage');
                return {
                    name: name ? name.textContent.trim() : '',
                    imgSrc: img ? img.src : '',
                    hasPhotoClass: stage ? stage.classList.contains('has-photo') : false,
                };
            }
        """)
        if debug_sc1["name"] and debug_sc1["imgSrc"]:
            log("SHOWCASE-1: naam+foto aanwezig na verse load", "PASS",
                f"{debug_sc1['name']} | has-photo={debug_sc1['hasPhotoClass']}")
        else:
            log("SHOWCASE-1: naam+foto aanwezig na verse load", "FAIL", f"debug: {debug_sc1}")
    except Exception as e:
        log("SHOWCASE-1: naam+foto aanwezig na verse load", "FAIL", f"Timeout: {e}")

    # ── SHOWCASE-2: Snelle tabwissel ×3 — showcase blijft stabiel ────────────
    print("\n[SHOWCASE-2] Snelle tabwissel ×3: geen crash, showcase blijft tonen")
    for _ in range(3):
        page.locator('.nav-item[data-route="species"]').click()
        page.wait_for_timeout(150)
        page.locator('.nav-item[data-route="home"]').click()
        page.wait_for_timeout(200)

    page.wait_for_timeout(500)
    errs_sc2 = console_errors(page)
    has_name = page.locator('#featuredBirdName').count() > 0 and \
        (page.locator('#featuredBirdName').text_content() or '').strip() != ''
    if not errs_sc2 and has_name:
        log("SHOWCASE-2: 3× tabwissel crashvrij + showcase toont vogel", "PASS")
    elif errs_sc2:
        log("SHOWCASE-2: geen JS-crash na 3× tabwissel", "FAIL", f"errors: {errs_sc2[:120]}")
    else:
        log("SHOWCASE-2: showcase toont vogel na 3× tabwissel", "FAIL")

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
