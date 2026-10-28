"""
Birdspot Library — Fase D QA Tests
Playwright tests voor de sighting-workflow (v2 schema):
  D-01 t/m D-20: functionele tests
  D-21 t/m D-23: screenshots op 360/390/430px (D11)
  D-24 t/m D-27: data-integriteitsregressies (ChatGPT review Issues 1–3)
    D-24: migratie behoudt onbekende/toekomstige velden (Issue 1)
    D-25: opslagfout propagatie — UI toont foutmelding, formulier niet gesloten (Issue 3)
    D-26: veilige media-opslagvolgorde — foto pas verwijderd NA record-opslag (Issue 2)
    D-27: cancel tijdens edit — geen persistente wijzigingen

Testmethodiek (Issue 4) — herziene documentatie na onderzoek:
  Playwright's locator.click() werkt normaal ook op elementen die NA het laden van
  de pagina dynamisch worden toegevoegd; het framework auto-waits tot het element
  zichtbaar en interacteerbaar is.

  Geconstateerd in de praktijk (addSheet-workflow):
    - Wanneer het .sheet-overlay element aanwezig is én zichtbaar, werkt
      locator.click(force=True) betrouwbaar.
    - page.evaluate('() => el?.click()') werkt als alternatief en omzeilt
      mogelijke CSS-zichtbaarheids/pointer-events-checks.
    - De oorzaak van eerdere instabiliteit was timing: de sheet-overlay wordt
      asynchroon aan document.body toegevoegd. Een korte wait_for_timeout of
      wait_for_selector stabiliseert locator-gebaseerde clicks.

  Conclusie: page.evaluate() is NIET inherent noodzakelijk voor dynamisch
  toegevoegde overlays; het is een werkende alternatieve aanpak. In deze tests
  wordt page.evaluate() gebruikt bij submit/edit/delete knoppen in sheets als
  extra verdediging tegen timing-races en CSS-geblokkeerde pointer-events.
  Bij nieuwe tests wordt wait_for_selector + locator.click(force=True) eerst
  overwogen, met page.evaluate() als fallback bij gebleken technische reden.

Starten (vanuit repo-root):
  python tests/test_phase_d.py
"""

import http.server
import json
import threading
import time
import sys
from datetime import date
from pathlib import Path

from playwright.sync_api import sync_playwright

# ── Pad + server ────────────────────────────────────────────────────────────────
REPO     = Path(__file__).resolve().parent.parent
SHOTS    = REPO / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)
PORT     = 8804
BASE_URL = f"http://127.0.0.1:{PORT}/"
ISO_TODAY = date.today().isoformat()

class _Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(REPO), **kw)
    def log_message(self, *_):
        pass

_srv = http.server.HTTPServer(("127.0.0.1", PORT), _Handler)
threading.Thread(target=_srv.serve_forever, daemon=True).start()
time.sleep(0.3)

# ── Test-data helpers ────────────────────────────────────────────────────────────
def _v2_sighting(sid, **kwargs):
    s = {
        "id": sid,
        "speciesId": "parus-major",
        "speciesName": "Koolmees",
        "date": ISO_TODAY,
        "time": "10:30",
        "count": 2,
        "certainty": "certain",
        "locationName": f"Locatie {sid}",
        "lat": None,
        "lon": None,
        "habitat": "bos",
        "behavior": "zingend",
        "weather": "zonnig",
        "notes": f"Notitie {sid}",
        "photoIds": [],
        "createdAt": "2026-10-26T10:00:00.000Z",
    }
    s.update(kwargs)
    return s

def _set_ls(page, sightings, schema_version=2):
    store = {"schemaVersion": schema_version, "sightings": sightings}
    page.evaluate(
        "(d) => localStorage.setItem('birdspot-sightings', JSON.stringify(d))",
        store,
    )

def _get_ls_sightings(page):
    raw = page.evaluate(
        "() => JSON.parse(localStorage.getItem('birdspot-sightings') || '{}')"
    )
    return raw.get("sightings", [])

def _fresh(page):
    """Hard reload met lege localStorage – stap 0 voor elke test."""
    page.evaluate("() => localStorage.clear()")
    page.reload(wait_until="networkidle")
    page.wait_for_timeout(700)

def _close_sheet(page):
    """Sluit een open sheet via Escape."""
    page.keyboard.press("Escape")
    page.wait_for_timeout(400)

def _go_sightings(page):
    """Navigeer naar waarnemingen via JS-module (geen sightings nav-item in HTML)."""
    page.evaluate("""async () => {
        const mod = await import('/src/app.js');
        mod.navigate('sightings');
    }""")
    page.wait_for_timeout(800)

def _go_home(page):
    page.locator('.nav-item[data-route="home"]').click(force=True)
    page.wait_for_timeout(500)

def _open_fab(page):
    page.locator('#fab').click(force=True)
    page.wait_for_timeout(600)

def _sheet_click(sheet_locator, selector):
    """Klik op element binnen een sheet-locator met force=True."""
    sheet_locator.locator(selector).click(force=True)

def _sheet_click_first(sheet_locator, selector):
    """Klik op EERSTE element binnen een sheet-locator met force=True."""
    sheet_locator.locator(selector).first.click(force=True)

# ── Resultatenlijst ─────────────────────────────────────────────────────────────
results = []

def log(name, status, detail=""):
    results.append((name, status, detail))
    icon = "✓" if status == "PASS" else "✗"
    print(f"  {icon} {status:4s} | {name}" + (f"\n              {detail}" if detail else ""))

# ── Tests ────────────────────────────────────────────────────────────────────────
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    ctx_br  = browser.new_context(viewport={"width": 390, "height": 844})
    page    = ctx_br.new_page()

    js_errors = []
    page.on("pageerror", lambda e: js_errors.append(str(e)))

    page.goto(BASE_URL, wait_until="networkidle")
    page.wait_for_timeout(800)

    print("\n=== Birdspot Library — Fase D QA ===\n")

    # ── D-01: App laadt zonder errors ───────────────────────────────────────────
    print("--- D-01 ---")
    try:
        if js_errors:
            log("D-01 App laadt zonder errors", "FAIL", str(js_errors[:2]))
        else:
            log("D-01 App laadt zonder errors", "PASS")
    except Exception as e:
        log("D-01 App laadt zonder errors", "FAIL", str(e))

    # ── D-02: Waarnemingen-scherm rendert ───────────────────────────────────────
    print("--- D-02 ---")
    try:
        _fresh(page)
        _go_sightings(page)
        page.wait_for_selector('.page-header', timeout=4000)
        title = page.locator('.page-header .page-header__title').first.inner_text()
        if "Waarneming" in title:
            log("D-02 Sightings scherm rendert", "PASS")
        else:
            log("D-02 Sightings scherm rendert", "FAIL", f"title={title}")
    except Exception as e:
        log("D-02 Sightings scherm rendert", "FAIL", str(e))

    # ── D-03: FAB opent add-sighting sheet ──────────────────────────────────────
    print("--- D-03 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet', timeout=4000)
        title = page.locator('#addSightingSheet .sheet__title').first.inner_text()
        if "Nieuwe waarneming" in title:
            log("D-03 FAB opent add-sheet", "PASS")
        else:
            log("D-03 FAB opent add-sheet", "FAIL", f"title={title}")
        _close_sheet(page)
    except Exception as e:
        log("D-03 FAB opent add-sheet", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-04: Soort-veld is verplicht ───────────────────────────────────────────
    print("--- D-04 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet', timeout=4000)
        # Submit zonder soort → sheet blijft open (force=True om nav-interceptor te omzeilen)
        page.locator('#addSightingSheet #addSheetSubmit').first.click(force=True)
        page.wait_for_timeout(500)
        still_open = page.locator('#addSightingSheet').count() > 0
        if still_open:
            log("D-04 Soort verplicht (sheet blijft open)", "PASS")
        else:
            log("D-04 Soort verplicht (sheet blijft open)", "FAIL", "sheet gesloten zonder soort")
        _close_sheet(page)
    except Exception as e:
        log("D-04 Soort verplicht (sheet blijft open)", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-05: Datum-veld staat standaard op vandaag ─────────────────────────────
    print("--- D-05 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #sightDate', timeout=4000)
        date_val = page.locator('#addSightingSheet #sightDate').first.input_value()
        if date_val == ISO_TODAY:
            log("D-05 Datum default = vandaag", "PASS")
        else:
            log("D-05 Datum default = vandaag", "FAIL", f"val={date_val}")
        _close_sheet(page)
    except Exception as e:
        log("D-05 Datum default = vandaag", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-06: Tijd-veld optioneel ───────────────────────────────────────────────
    print("--- D-06 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #sightTime', timeout=4000)
        time_el = page.locator('#addSightingSheet #sightTime').first
        empty = time_el.input_value() == ''
        time_el.fill("09:30")
        filled = time_el.input_value() == "09:30"
        if empty and filled:
            log("D-06 Tijd optioneel + accepteert HH:MM", "PASS")
        else:
            log("D-06 Tijd optioneel + accepteert HH:MM", "FAIL", f"empty={empty}, filled={filled}")
        _close_sheet(page)
    except Exception as e:
        log("D-06 Tijd optioneel + accepteert HH:MM", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-07: Aantal default 1, min=1 ───────────────────────────────────────────
    print("--- D-07 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #sightCount', timeout=4000)
        count_el  = page.locator('#addSightingSheet #sightCount').first
        count_val = count_el.input_value()
        count_min = count_el.get_attribute('min')
        if count_val == "1" and count_min == "1":
            log("D-07 Aantal default=1, min=1", "PASS")
        else:
            log("D-07 Aantal default=1, min=1", "FAIL", f"val={count_val}, min={count_min}")
        _close_sheet(page)
    except Exception as e:
        log("D-07 Aantal default=1, min=1", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-08: Zekerheid toggle ───────────────────────────────────────────────────
    print("--- D-08 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #certaintyGroup', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        active_start = sheet.locator('.certainty-option--active').count()
        val_start    = sheet.locator('.certainty-option--active input').first.get_attribute('value')
        # Dispatch change event op radio input (force=True triggert geen change event op radio)
        page.evaluate("""() => {
            const input = document.querySelector('#addSightingSheet input[value="probable"]');
            if (input) { input.checked = true; input.dispatchEvent(new Event('change', {bubbles: true})); }
        }""")
        page.wait_for_timeout(200)
        active_after = sheet.locator('.certainty-option--active').count()
        val_after    = sheet.locator('.certainty-option--active input').first.get_attribute('value')

        if active_start == 1 and val_start == 'certain' and active_after == 1 and val_after == 'probable':
            log("D-08 Zekerheid toggle (één actief)", "PASS")
        else:
            log("D-08 Zekerheid toggle (één actief)", "FAIL",
                f"before={val_start}×{active_start}, after={val_after}×{active_after}")
        _close_sheet(page)
    except Exception as e:
        log("D-08 Zekerheid toggle (één actief)", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-09: Habitat chip single-select + deselect ─────────────────────────────
    print("--- D-09 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #habitatChips', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        page.evaluate('() => { const c = document.querySelector(\'#habitatChips .chip[data-value="bos"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        c1 = sheet.locator('#habitatChips .chip--active').count()
        v1 = sheet.locator('#habitatChips .chip--active').first.get_attribute('data-value')

        # Deselect
        page.evaluate('() => { const c = document.querySelector(\'#habitatChips .chip[data-value="bos"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        c2 = sheet.locator('#habitatChips .chip--active').count()

        # Switch
        page.evaluate('() => { const c = document.querySelector(\'#habitatChips .chip[data-value="water"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        page.evaluate('() => { const c = document.querySelector(\'#habitatChips .chip[data-value="stad"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        c3 = sheet.locator('#habitatChips .chip--active').count()
        v3 = sheet.locator('#habitatChips .chip--active').first.get_attribute('data-value')

        if c1 == 1 and v1 == 'bos' and c2 == 0 and c3 == 1 and v3 == 'stad':
            log("D-09 Habitat chip single-select + deselect", "PASS")
        else:
            log("D-09 Habitat chip single-select + deselect", "FAIL",
                f"c1={c1},{v1}  c2={c2}  c3={c3},{v3}")
        _close_sheet(page)
    except Exception as e:
        log("D-09 Habitat chip single-select + deselect", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-10: Gedrag chip ───────────────────────────────────────────────────────
    print("--- D-10 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #behaviorChips', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        page.evaluate('() => { const c = document.querySelector(\'#behaviorChips .chip[data-value="zingend"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        page.evaluate('() => { const c = document.querySelector(\'#behaviorChips .chip[data-value="vliegend"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        c = sheet.locator('#behaviorChips .chip--active').count()
        v = sheet.locator('#behaviorChips .chip--active').first.get_attribute('data-value')

        if c == 1 and v == 'vliegend':
            log("D-10 Gedrag chip single-select", "PASS")
        else:
            log("D-10 Gedrag chip single-select", "FAIL", f"count={c}, val={v}")
        _close_sheet(page)
    except Exception as e:
        log("D-10 Gedrag chip single-select", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-11: Weer chip ─────────────────────────────────────────────────────────
    print("--- D-11 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #weatherChips', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        page.evaluate('() => { const c = document.querySelector(\'#weatherChips .chip[data-value="regen"]\'); if(c) c.click(); }')
        page.wait_for_timeout(150)
        c = sheet.locator('#weatherChips .chip--active').count()
        v = sheet.locator('#weatherChips .chip--active').first.get_attribute('data-value')

        if c == 1 and v == 'regen':
            log("D-11 Weer chip single-select", "PASS")
        else:
            log("D-11 Weer chip single-select", "FAIL", f"count={c}, val={v}")
        _close_sheet(page)
    except Exception as e:
        log("D-11 Weer chip single-select", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-12: Notities textarea ─────────────────────────────────────────────────
    print("--- D-12 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet #sightNotes', timeout=4000)
        notes_el = page.locator('#addSightingSheet #sightNotes').first
        notes_el.fill("Test notitie Birdspot Fase D")
        val = notes_el.input_value()
        if val == "Test notitie Birdspot Fase D":
            log("D-12 Notities textarea accepteert tekst", "PASS")
        else:
            log("D-12 Notities textarea accepteert tekst", "FAIL", f"val={val}")
        _close_sheet(page)
    except Exception as e:
        log("D-12 Notities textarea accepteert tekst", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-13: Save persisteert v2-velden ────────────────────────────────────────
    print("--- D-13 ---")
    sid13 = None
    try:
        _fresh(page)
        _go_sightings(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        # Kies soort via picker (via evaluate zodat click altijd event triggert)
        page.evaluate('() => { const b = document.querySelector("#speciesPickerBtn"); if(b) b.click(); }')
        page.wait_for_selector('#spPickerSearch', timeout=5000)
        page.wait_for_timeout(300)
        # Zoek eerste resultaat in species picker
        page.locator('#spPickerSearch').fill("Kool")
        page.wait_for_timeout(600)
        # Wacht op species-row en klik via evaluate (buiten viewport)
        page.wait_for_selector('.species-row', timeout=5000)
        page.evaluate('() => { const r = document.querySelector(".species-row"); if(r) r.click(); }')
        page.wait_for_timeout(800)

        # Heropen sheet-scoped locator na picker sluiten
        sheet = page.locator('#addSightingSheet').first
        sheet.locator('#sightTime').first.fill("14:00")
        sheet.locator('#sightCount').first.fill("3")
        page.evaluate("""() => {
            const input = document.querySelector('#addSightingSheet input[value="probable"]');
            if (input) { input.checked = true; input.dispatchEvent(new Event('change', {bubbles: true})); }
        }""")
        page.wait_for_timeout(100)
        page.evaluate('() => { const c = document.querySelector(\'#habitatChips .chip[data-value="water"]\'); if(c) c.click(); }')
        page.wait_for_timeout(100)
        page.evaluate('() => { const c = document.querySelector(\'#behaviorChips .chip[data-value="foeragerend"]\'); if(c) c.click(); }')
        page.wait_for_timeout(100)
        page.evaluate('() => { const c = document.querySelector(\'#weatherChips .chip[data-value="bewolkt"]\'); if(c) c.click(); }')
        page.wait_for_timeout(100)
        sheet.locator('#sightNotes').first.fill("v2-test automatisch")

        before_count = len(_get_ls_sightings(page))
        page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
        page.wait_for_timeout(1200)

        sightings = _get_ls_sightings(page)
        after_count = len(sightings)

        if after_count <= before_count:
            log("D-13 Save persisteert v2-velden", "FAIL", "geen nieuwe sighting in localStorage")
        else:
            s = sightings[-1]
            sid13 = s.get('id')
            checks = {
                "time":      s.get("time") == "14:00",
                "count":     s.get("count") == 3,
                "certainty": s.get("certainty") == "probable",
                "habitat":   s.get("habitat") == "water",
                "behavior":  s.get("behavior") == "foeragerend",
                "weather":   s.get("weather") == "bewolkt",
                "notes":     s.get("notes") == "v2-test automatisch",
            }
            failed = [k for k, v in checks.items() if not v]
            if not failed:
                log("D-13 Save persisteert v2-velden", "PASS")
            else:
                vals = {k: s.get(k) for k in failed}
                log("D-13 Save persisteert v2-velden", "FAIL", f"fout: {failed} → {vals}")
    except Exception as e:
        log("D-13 Save persisteert v2-velden", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-14: Sightings-lijst toont kaartje na save ──────────────────────────────
    print("--- D-14 ---")
    try:
        # D-13 heeft sighting opgeslagen → navigeer naar sightings
        _go_sightings(page)
        page.wait_for_timeout(500)
        page.wait_for_selector('.sight-card', timeout=4000)
        cards = page.locator('.sight-card').count()
        name  = page.locator('.sight-card__name').first.inner_text()
        if cards >= 1 and ("Koolmees" in name or "kool" in name.lower()):
            log("D-14 Sightings lijst refresh na save", "PASS")
        else:
            log("D-14 Sightings lijst refresh na save", "FAIL",
                f"cards={cards}, name={name}")
    except Exception as e:
        log("D-14 Sightings lijst refresh na save", "FAIL", str(e))

    # ── D-15: Home refresh na save vanuit home ──────────────────────────────────
    print("--- D-15 ---")
    try:
        _fresh(page)
        _go_home(page)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet', timeout=4000)
        sheet = page.locator('#addSightingSheet').first

        page.evaluate('() => { const b = document.querySelector("#speciesPickerBtn"); if(b) b.click(); }')
        page.wait_for_selector('#spPickerSearch', timeout=5000)
        page.wait_for_timeout(300)
        page.locator('#spPickerSearch').fill("Kool")
        page.wait_for_timeout(600)
        page.wait_for_selector('.species-row', timeout=5000)
        page.evaluate('() => { const r = document.querySelector(".species-row"); if(r) r.click(); }')
        page.wait_for_timeout(800)

        before = len(_get_ls_sightings(page))
        page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
        page.wait_for_timeout(1200)

        after = len(_get_ls_sightings(page))
        # Na save vanuit home moet home-scherm actief zijn
        home_active = page.locator('#screen-home').count() > 0
        if after > before and home_active:
            log("D-15 Home refresh na save (FAB vanaf home)", "PASS")
        else:
            log("D-15 Home refresh na save (FAB vanaf home)", "FAIL",
                f"saved={after>before}, home_active={home_active}")
    except Exception as e:
        log("D-15 Home refresh na save (FAB vanaf home)", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-16: Detail sheet toont alle v2-velden ──────────────────────────────────
    print("--- D-16 ---")
    sid16 = "d16-test"
    try:
        _fresh(page)
        _set_ls(page, [_v2_sighting(sid16, time="08:15", count=4,
                                    certainty="possible", habitat="kust",
                                    behavior="vliegend", weather="wind",
                                    notes="v2 detail test")])
        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)
        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(700)

        page.wait_for_selector('#detailSightingSheet', timeout=4000)
        content = page.locator('#detailSheetContent').inner_text()

        ok_time    = "08:15" in content
        ok_count   = "4" in content
        ok_badge   = page.locator('.certainty-badge').count() > 0
        ok_chips   = page.locator('.detail-chip-row').count() > 0

        if ok_time and ok_count and ok_badge and ok_chips:
            log("D-16 Detail sheet toont v2-velden", "PASS")
        else:
            log("D-16 Detail sheet toont v2-velden", "FAIL",
                f"time={ok_time}, count={ok_count}, badge={ok_badge}, chips={ok_chips}")
        # Sluit sheet
        page.locator('#detailClose').click(force=True)
        page.wait_for_timeout(400)
    except Exception as e:
        log("D-16 Detail sheet toont v2-velden", "FAIL", str(e))
        try:
            page.locator('#detailClose').click(force=True)
            page.wait_for_timeout(300)
        except: pass

    # ── D-17: Detail → Bewerken opent edit-form ───────────────────────────────
    print("--- D-17 ---")
    try:
        # Sluit alle nog-open sheets (van vorige tests) via evaluate
        page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
        page.wait_for_timeout(200)
        # Hergebruik sid16 data die nog in localStorage staat
        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)
        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(600)
        page.wait_for_selector('#detailSightingSheet', timeout=4000)
        page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
        page.wait_for_timeout(1000)

        edit_open = page.locator('#addSightingSheet').count() > 0
        if edit_open:
            log("D-17 Bewerken opent edit-form", "PASS")
        else:
            log("D-17 Bewerken opent edit-form", "FAIL", "geen addSightingSheet")
        _close_sheet(page)
    except Exception as e:
        log("D-17 Bewerken opent edit-form", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-18: Edit-form is pre-ingevuld ─────────────────────────────────────────
    print("--- D-18 ---")
    try:
        page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
        page.wait_for_timeout(200)
        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)
        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(600)
        page.wait_for_selector('#detailSightingSheet', timeout=4000)
        page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
        page.wait_for_timeout(1000)

        sheet = page.locator('#addSightingSheet').first
        date_val  = sheet.locator('#sightDate').first.input_value()
        time_val  = sheet.locator('#sightTime').first.input_value()
        count_val = sheet.locator('#sightCount').first.input_value()

        if date_val == ISO_TODAY and time_val == "08:15" and count_val == "4":
            log("D-18 Edit-form vooringevuld", "PASS")
        else:
            log("D-18 Edit-form vooringevuld", "FAIL",
                f"date={date_val}, time={time_val}, count={count_val}")
        _close_sheet(page)
    except Exception as e:
        log("D-18 Edit-form vooringevuld", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-19: Edit save → bijgewerkt, geen duplicaat ─────────────────────────────
    print("--- D-19 ---")
    try:
        page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
        page.wait_for_timeout(200)
        before_count = len(_get_ls_sightings(page))

        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)
        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(600)
        page.wait_for_selector('#detailSightingSheet', timeout=4000)
        page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
        page.wait_for_timeout(1000)

        page.wait_for_selector('#addSightingSheet', timeout=5000)
        sheet = page.locator('#addSightingSheet').first
        sheet.locator('#sightNotes').first.fill("Bewerkt via D-19 test")
        page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
        page.wait_for_timeout(1200)

        sightings = _get_ls_sightings(page)
        after_count = len(sightings)
        updated = next((x for x in sightings if x.get('id') == sid16), None)

        if (after_count == before_count
                and updated
                and updated.get('notes') == "Bewerkt via D-19 test"):
            log("D-19 Edit save: bijgewerkt, geen duplicaat", "PASS")
        else:
            log("D-19 Edit save: bijgewerkt, geen duplicaat", "FAIL",
                f"before={before_count}, after={after_count}, "
                f"notes={updated.get('notes') if updated else 'niet gevonden'}")
    except Exception as e:
        log("D-19 Edit save: bijgewerkt, geen duplicaat", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    # ── D-20: Verwijder met async confirm, geen browser confirm() ────────────────
    print("--- D-20 ---")
    try:
        _fresh(page)
        sid20 = "d20-del"
        _set_ls(page, [_v2_sighting(sid20)])
        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)

        dialog_fired = []
        page.on("dialog", lambda d: (dialog_fired.append(d.type), d.dismiss()))

        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(600)
        page.wait_for_selector('#detailDelete', timeout=4000)
        page.evaluate('() => { document.querySelector("#detailDelete")?.click(); }')
        page.wait_for_timeout(800)

        # Eigen confirm-overlay moet verschijnen
        confirm_visible = page.locator('.confirm-overlay').count() > 0
        if not confirm_visible:
            log("D-20 Async confirm-dialoog opent", "FAIL", "confirm-overlay niet gevonden")
        else:
            page.locator('.confirm-ok').click(force=True)
            page.wait_for_timeout(800)

            left = _get_ls_sightings(page)
            deleted = sid20 not in [x.get('id') for x in left]
            no_browser = len(dialog_fired) == 0

            if deleted and no_browser:
                log("D-20 Verwijder: async confirm, geen browser confirm", "PASS")
            else:
                log("D-20 Verwijder: async confirm, geen browser confirm", "FAIL",
                    f"deleted={deleted}, browser_dialogs={dialog_fired}")
    except Exception as e:
        log("D-20 Verwijder: async confirm, geen browser confirm", "FAIL", str(e))

    # ────────────────────────────────────────────────────────────────────────────
    # D-21 t/m D-23: Screenshots 360 / 390 / 430 px  (D11)
    # ────────────────────────────────────────────────────────────────────────────
    print("\n--- D-21 t/m D-23: Screenshots ---")

    for idx, width in enumerate([360, 390, 430]):
        test_id = f"D-{21+idx}"
        try:
            sc = browser.new_context(viewport={"width": width, "height": 844})
            sp = sc.new_page()
            sp.goto(BASE_URL, wait_until="networkidle")
            sp.wait_for_timeout(600)
            # Injecteer testdata
            _set_ls(sp, [_v2_sighting(f"shot-{width}")])
            sp.reload(wait_until="networkidle")
            sp.wait_for_timeout(600)

            # Screenshot: sightings-lijst (geen sightings nav-item → JS-module)
            sp.evaluate("""async () => {
                const mod = await import('/src/app.js');
                mod.navigate('sightings');
            }""")
            sp.wait_for_timeout(800)
            sp.screenshot(path=str(SHOTS / f"phase_d_sightings_{width}px.png"))

            # Screenshot: add-form open
            sp.locator('#fab').click(force=True)
            sp.wait_for_timeout(600)
            sp.screenshot(path=str(SHOTS / f"phase_d_addform_{width}px.png"))

            # Sluit form, open detail
            sp.keyboard.press("Escape")
            sp.wait_for_timeout(400)
            sp.locator('.sight-card').first.click(force=True)
            sp.wait_for_timeout(700)
            sp.screenshot(path=str(SHOTS / f"phase_d_detail_{width}px.png"))

            sc.close()
            log(f"{test_id} Screenshots {width}px (lijst + form + detail)", "PASS")
        except Exception as e:
            log(f"{test_id} Screenshots {width}px", "FAIL", str(e))
            try: sc.close()
            except: pass

    # ════════════════════════════════════════════════════════════════════════════
    # D-24 t/m D-27: Data-integriteitsregressies (ChatGPT review Issues 1–3)
    # ════════════════════════════════════════════════════════════════════════════
    print("\n--- D-24 t/m D-27: Data-integriteitsregressies ---")

    # ── D-24: Migratie behoudt onbekende velden ──────────────────────────────────
    # Regressiontest voor Issue 1: migrateSighting() mag onbekende/toekomstige
    # velden NOOIT weggooien (spread-patroon vereist).
    print("--- D-24 ---")
    try:
        _fresh(page)
        # Stel een v1-sighting in met een extra onbekend veld 'futureField'
        v1_with_unknown = {
            "id": "d24-migrate",
            "speciesId": "parus-major",
            "speciesName": "Koolmees",
            "date": ISO_TODAY,
            "lat": None,
            "lon": None,
            "locationName": "Migratie test",
            "notes": "v1 met onbekend veld",
            "photoIds": [],
            "createdAt": "2026-01-01T10:00:00.000Z",
            "futureField": "bewaar-mij",          # onbekend veld dat bewaard moet blijven
            "anotherUnknown": {"nested": True},   # ook geneste waarden
        }
        page.evaluate(
            "(d) => localStorage.setItem('birdspot-sightings', JSON.stringify(d))",
            {"schemaVersion": 1, "sightings": [v1_with_unknown]}
        )
        # Navigeer naar sightings → triggert getSightings() → voert migratie uit
        _go_sightings(page)
        page.wait_for_timeout(600)

        # Lees de gemigregeerde data terug
        migrated = _get_ls_sightings(page)
        if not migrated:
            log("D-24 Migratie behoudt onbekende velden", "FAIL", "geen sightings na migratie")
        else:
            s = migrated[0]
            future_ok   = s.get("futureField") == "bewaar-mij"
            another_ok  = isinstance(s.get("anotherUnknown"), dict)
            v2_fields   = all(k in s for k in ["time", "count", "certainty", "habitat"])
            v1_fields   = s.get("notes") == "v1 met onbekend veld"

            if future_ok and another_ok and v2_fields and v1_fields:
                log("D-24 Migratie behoudt onbekende velden", "PASS")
            else:
                log("D-24 Migratie behoudt onbekende velden", "FAIL",
                    f"futureField={s.get('futureField')!r}, "
                    f"anotherUnknown={s.get('anotherUnknown')!r}, "
                    f"v2_fields={v2_fields}, v1_fields={v1_fields}")
    except Exception as e:
        log("D-24 Migratie behoudt onbekende velden", "FAIL", str(e))

    # ── D-25: Opslagfout propagatie — volledige data-integriteitstest ──────────────
    # Regressiontest voor Issue 3: saveSightings() gooit bij fout (geen try/catch);
    # addSighting() propagates de throw; addSheet.js vangt dit op in de catch-blok
    # en toont een foutmelding. Het formulier blijft open, niets wordt opgeslagen.
    #
    # Vereisten (ChatGPT review round 2):
    #   1. Formulier aantoonbaar geldig vóór submit
    #   2. Foutinjectie aantoonbaar geactiveerd (niet alleen ingesteld)
    #   3. UI toont relevante foutmelding (toast)
    #   4. Formulier is NIET gesloten als succes
    #   5. Originele opslagdata ongewijzigd na mislukte opslag
    #   6. Test ontvangt GEEN PASS als injectie nooit werd uitgevoerd
    print("--- D-25 ---")
    try:
        _fresh(page)

        # Stap 0: Zet een bekende sighting in localStorage als "originele data"
        # die na de mislukte opslag intact moet zijn.
        sid25_orig = "d25-original"
        _set_ls(page, [_v2_sighting(sid25_orig, notes="origineel d25")])

        # Stap 1: Open add-sheet en vul verplichte velden in om geldig formulier te maken
        _go_sightings(page)
        page.wait_for_timeout(400)
        _open_fab(page)
        page.wait_for_selector('#addSightingSheet', timeout=5000)
        page.wait_for_timeout(300)

        sheet = page.locator('#addSightingSheet').first

        # Selecteer een soort (verplicht — zonder soort blokkeert de submit zelf).
        # De echte picker-knop heet #speciesPickerBtn; klikken opent speciesPicker-sheet.
        # Na opening klikken we het eerste .species-row element (via data-id attribuut).
        page.evaluate("() => { document.querySelector('#speciesPickerBtn')?.click(); }")
        # Wacht op de picker-sheet list
        page.wait_for_selector('#spPickerList .species-row', timeout=5000)
        page.wait_for_timeout(200)
        # Klik het eerste soort-rij item
        page.evaluate("""() => {
            const row = document.querySelector('#spPickerList .species-row');
            if (row) row.click();
        }""")
        # Wacht tot picker gesloten is en formulier ververst is (speciesId ingesteld in _state)
        page.wait_for_timeout(800)

        # Vul datum in (verplicht veld — gebruik today, trigger change event)
        page.evaluate(f"() => {{ const d = document.querySelector('#sightDate'); if(d) {{ d.value = '{ISO_TODAY}'; d.dispatchEvent(new Event('change', {{bubbles:true}})); }} }}")
        page.wait_for_timeout(200)

        # Verifieer dat soort daadwerkelijk geselecteerd is (placeholder mag niet meer zichtbaar zijn)
        species_selected = page.evaluate("""() => {
            const placeholder = document.querySelector('.species-picker-btn__placeholder');
            const name_el     = document.querySelector('.species-picker-btn__name');
            return !placeholder && !!name_el && name_el.textContent.trim().length > 0;
        }""")
        if not species_selected:
            log("D-25 Opslagfout: foutinjectie geactiveerd", "FAIL",
                "Soort kon niet worden geselecteerd via speciesPicker UI — formulier blijft ongeldig")
            try: _close_sheet(page)
            except: pass
            raise Exception("species not selected")

        # Stap 2: Installeer foutinjectie MET activatie-teller
        page.evaluate("""() => {
            window.__injectionCount  = 0;
            window.__origSetItem     = localStorage.setItem.bind(localStorage);
            localStorage.setItem = function(key, value) {
                if (key === 'birdspot-sightings') {
                    window.__injectionCount++;          // bewijs dat injectie geraakt werd
                    const err = new DOMException('Simulated QuotaExceededError', 'QuotaExceededError');
                    err.name = 'QuotaExceededError';
                    throw err;
                }
                window.__origSetItem(key, value);       // overige sleutels normaal
            };
        }""")

        # Stap 3: Submit het formulier
        page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
        page.wait_for_timeout(1500)  # geef async catch-blok tijd

        # Stap 4: Lees injectie-activatie bewijs
        injection_count = page.evaluate("() => window.__injectionCount || 0")

        # Herstel localStorage altijd vóór verdere assertions
        page.evaluate("() => { if(window.__origSetItem) localStorage.setItem = window.__origSetItem; }")

        # Als injectie_count == 0: de submit bereikte de opslaan-route nooit
        # (formulier was waarschijnlijk ongeldig — dat is een andere fout, geen PASS)
        if injection_count == 0:
            # Lees toast om te zien welke guard sloeg
            toast_text_guard = ""
            try:
                toast_text_guard = page.locator('.toast').first.inner_text()
            except Exception:
                pass
            log("D-25 Opslagfout: foutinjectie geactiveerd", "FAIL",
                f"injection_count=0 — injectie werd nooit geraakt; "
                f"toast={toast_text_guard!r} (formulier waarschijnlijk ongeldig of submit niet bereikt)")
            try: _close_sheet(page)
            except: pass
        else:
            # Stap 5: Injectie was actief — nu de volledige assertions
            toast_text = ""
            try:
                toast_text = page.locator('.toast').first.inner_text()
            except Exception:
                pass

            # 5a: UI toont relevante foutmelding
            has_error_msg = (
                "mislukt" in toast_text.lower() or
                "fout"    in toast_text.lower() or
                "opnieuw" in toast_text.lower() or
                "error"   in toast_text.lower()
            )

            # 5b: Geen succes-toast
            no_success_toast = (
                "toegevoegd" not in toast_text.lower() and
                "opgeslagen" not in toast_text.lower() and
                "bijgewerkt" not in toast_text.lower()
            )

            # 5c: Formulier is NIET als succes gesloten — sheet moet nog zichtbaar zijn
            sheet_still_open = page.locator('#addSightingSheet').count() > 0

            # 5d: Originele data intact — exact één sighting (de originele), geen nieuwe
            sightings_after = _get_ls_sightings(page)
            orig_intact = any(x.get("id") == sid25_orig for x in sightings_after)
            no_new_stored = not any(x.get("id") != sid25_orig for x in sightings_after)

            all_pass = (
                has_error_msg and
                no_success_toast and
                sheet_still_open and
                orig_intact and
                no_new_stored
            )

            if all_pass:
                log("D-25 Opslagfout: foutmelding, formulier open, data intact", "PASS",
                    f"injection_count={injection_count}, toast={toast_text!r}")
            else:
                log("D-25 Opslagfout: foutmelding, formulier open, data intact", "FAIL",
                    f"injection_count={injection_count}, "
                    f"has_error_msg={has_error_msg}, "
                    f"no_success_toast={no_success_toast}, "
                    f"sheet_still_open={sheet_still_open}, "
                    f"orig_intact={orig_intact}, "
                    f"no_new_stored={no_new_stored}, "
                    f"toast={toast_text!r}, "
                    f"sightings_after_count={len(sightings_after)}")

            try: _close_sheet(page)
            except: pass

    except Exception as e:
        log("D-25 Opslagfout: foutmelding, formulier open, data intact", "FAIL", str(e))
        # Zorg dat localStorage hersteld is ook bij exception
        try: page.evaluate("() => { if(window.__origSetItem) localStorage.setItem = window.__origSetItem; }")
        except: pass
        try: _close_sheet(page)
        except: pass

    # ── D-26: Delete-before-save regressie — echte IDB Blob, failure + success path ─
    # Regressiontest voor Issue 2: bij edit MAG een foto pas worden verwijderd uit
    # IndexedDB NADAT het localStorage-record succesvol is bijgewerkt.
    #
    # Vereisten (ChatGPT review round 2):
    #   A. Maak een echte Blob in IndexedDB gekoppeld aan een bestaande sighting
    #   B. Open sighting in editmodus
    #   C. Markeer die foto voor verwijdering in de UI
    #   D. FAILURE PATH: forceer opslagfout tijdens save van gewijzigd record
    #      → origineel sighting-record ongewijzigd
    #      → originele Blob aanwezig en leesbaar in IDB
    #   E. SUCCESS PATH: sla succesvol op
    #      → foto pas verwijderd NA bevestigde record-opslag
    #      → photoIds correct bijgewerkt (foto verwijderd uit lijst)
    #      → bewijs via operationele volgorde-log
    print("--- D-26 ---")
    try:
        page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
        page.wait_for_timeout(200)

        sid26    = "d26-order"
        photo_id = "d26-real-photo-blob"

        _fresh(page)

        # A. Maak een echte Blob in IndexedDB gekoppeld aan de sighting
        # We gebruiken de bestaande db.js API via page.evaluate
        page.evaluate(f"""async () => {{
            const {{ savePhoto }} = await import('/src/data/db.js');
            // Maak een kleine PNG-achtige Blob (1x1 pixel GIF als testdata)
            const gifData = new Uint8Array([
                71,73,70,56,57,97,1,0,1,0,128,0,0,255,0,0,0,0,0,33,249,4,0,0,0,0,0,44,
                0,0,0,0,1,0,1,0,0,2,2,68,1,0,59
            ]);
            const blob = new Blob([gifData], {{ type: 'image/gif' }});
            await savePhoto({{
                id:         '{photo_id}',
                blob:       blob,
                type:       'image/gif',
                filename:   'test-d26.gif',
                speciesId:  'parus-major',
                sightingId: '{sid26}',
                addedAt:    new Date().toISOString(),
            }});
        }}""")
        page.wait_for_timeout(400)

        # Controleer dat de Blob daadwerkelijk in IDB staat
        blob_stored = page.evaluate(f"""async () => {{
            const {{ getPhoto }} = await import('/src/data/db.js');
            const rec = await getPhoto('{photo_id}');
            return rec !== null && rec.blob instanceof Blob && rec.blob.size > 0;
        }}""")
        if not blob_stored:
            log("D-26 Delete-before-save: setup IDB Blob", "FAIL",
                "Blob kon niet worden opgeslagen in IDB — test setup mislukt")
        else:
            # Stel sighting in met de echte photo_id
            _set_ls(page, [_v2_sighting(sid26,
                                        notes="origineel d26",
                                        photoIds=[photo_id])])
            _go_sightings(page)
            page.wait_for_selector('.sight-card', timeout=4000)

            # ── D-26 DEEL D: FAILURE PATH ────────────────────────────────────────
            # Open detail → edit → markeer foto voor verwijdering → forceer opslagfout
            page.locator('.sight-card').first.click(force=True)
            page.wait_for_timeout(600)
            page.wait_for_selector('#detailSightingSheet', timeout=4000)
            page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
            page.wait_for_timeout(1000)
            page.wait_for_selector('#addSightingSheet', timeout=5000)
            page.wait_for_timeout(400)

            # C. Markeer de foto voor verwijdering via de delete-knop in de sheet
            # De knop heeft data-photoid attribuut
            photo_del_clicked = page.evaluate(f"""() => {{
                const btn = document.querySelector('.media-thumb__del[data-photoid="{photo_id}"]');
                if (btn) {{ btn.click(); return true; }}
                return false;
            }}""")
            page.wait_for_timeout(500)

            if not photo_del_clicked:
                log("D-26 Delete-before-save: foto markeren failure path", "FAIL",
                    f"Verwijderknop voor photo_id={photo_id!r} niet gevonden in edit-sheet")
            else:
                # Installeer foutinjectie MET activatie-teller EN volgorde-log
                page.evaluate("""() => {
                    window.__d26_ops = [];
                    window.__injectionCount26 = 0;
                    window.__origSetItem26 = localStorage.setItem.bind(localStorage);
                    localStorage.setItem = function(key, value) {
                        if (key === 'birdspot-sightings') {
                            window.__injectionCount26++;
                            window.__d26_ops.push('localStorage.setItem→THROW');
                            const err = new DOMException('Simulated QuotaExceededError', 'QuotaExceededError');
                            err.name = 'QuotaExceededError';
                            throw err;
                        }
                        window.__origSetItem26(key, value);
                    };

                    // Instrumenteer deletePhoto om volgorde bij te houden
                    const origModule = window.__d26_deletePatched;
                    if (!origModule) {
                        window.__d26_deletePatched = true;
                        // Patch via Proxy op het IDB object — alternatief: we lezen de ops-log achteraf
                    }
                }""")

                # Submit (de save zal falen door de injectie)
                page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
                page.wait_for_timeout(1500)

                injection_count26 = page.evaluate("() => window.__injectionCount26 || 0")
                # Herstel localStorage
                page.evaluate("() => { if(window.__origSetItem26) localStorage.setItem = window.__origSetItem26; }")

                if injection_count26 == 0:
                    log("D-26 Delete-before-save: failure path injectie geactiveerd", "FAIL",
                        "injection_count=0 — injectie bereikte de opslaanroute niet")
                else:
                    # D. Controleer failure path: record ongewijzigd + Blob leesbaar
                    sightings_after_fail = _get_ls_sightings(page)
                    orig_record = next((x for x in sightings_after_fail if x.get('id') == sid26), None)

                    record_unchanged = (
                        orig_record is not None and
                        orig_record.get('notes') == 'origineel d26' and
                        photo_id in (orig_record.get('photoIds') or [])
                    )

                    blob_still_readable = page.evaluate(f"""async () => {{
                        const {{ getPhoto }} = await import('/src/data/db.js');
                        const rec = await getPhoto('{photo_id}');
                        if (!rec) return false;
                        try {{
                            const blob = rec.blob instanceof Blob ? rec.blob : new Blob([rec.blob], {{type: rec.type}});
                            return blob.size > 0;
                        }} catch(e) {{ return false; }}
                    }}""")

                    if record_unchanged and blob_still_readable:
                        log("D-26 Delete-before-save: failure path OK (record+blob intact)", "PASS",
                            f"injection_count={injection_count26}, "
                            f"record.notes={orig_record.get('notes')!r}, "
                            f"photoIds={orig_record.get('photoIds')!r}, "
                            f"blob_still_readable={blob_still_readable}")
                    else:
                        log("D-26 Delete-before-save: failure path OK (record+blob intact)", "FAIL",
                            f"injection_count={injection_count26}, "
                            f"record_unchanged={record_unchanged}, "
                            f"blob_still_readable={blob_still_readable}, "
                            f"record={orig_record!r}")

                    try: _close_sheet(page)
                    except: pass

                    # ── D-26 DEEL E: SUCCESS PATH ─────────────────────────────────
                    # Heropen edit, markeer foto voor verwijdering, sla succesvol op
                    # en controleer volgorde: foto verwijderd NADAT record is opgeslagen
                    page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
                    page.wait_for_timeout(200)

                    # Vernieuw pagina — reset alles (localStorage is ongewijzigd door de gefaalde save)
                    page.reload(wait_until="networkidle")
                    page.wait_for_timeout(800)
                    _go_sightings(page)
                    page.wait_for_selector('.sight-card', timeout=4000)

                    # Installeer VOLGORDE-INSTRUMENTATIE (geen injectie — laat save slagen)
                    page.evaluate(f"""async () => {{
                        window.__d26_success_ops = [];

                        // Patch localStorage.setItem om succes-save te loggen
                        const origSet = localStorage.setItem.bind(localStorage);
                        localStorage.setItem = function(key, value) {{
                            if (key === 'birdspot-sightings') {{
                                window.__d26_success_ops.push('localStorage.save');
                            }}
                            return origSet(key, value);
                        }};

                        // Patch db.deletePhoto om delete-moment te loggen
                        const dbMod = await import('/src/data/db.js');
                        const origDelete = dbMod.deletePhoto;
                        // We kunnen de geëxporteerde functie niet direct patchen (ES modules zijn read-only)
                        // In plaats daarvan monitoren we de IndexedDB transacties via het IDB object
                        const origOpen = indexedDB.open.bind(indexedDB);
                        // Alternatieve aanpak: patch de objectStore.delete methode
                        const proto = IDBObjectStore.prototype;
                        const origObjDelete = proto.delete;
                        proto.delete = function(key) {{
                            if (this.name === 'photos') {{
                                window.__d26_success_ops.push('IDB.photos.delete:' + key);
                            }}
                            return origObjDelete.call(this, key);
                        }};
                    }}""")
                    page.wait_for_timeout(300)

                    # Open detail → edit
                    page.locator('.sight-card').first.click(force=True)
                    page.wait_for_timeout(600)
                    page.wait_for_selector('#detailSightingSheet', timeout=4000)
                    page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
                    page.wait_for_timeout(1000)
                    page.wait_for_selector('#addSightingSheet', timeout=5000)
                    page.wait_for_timeout(400)

                    # Markeer foto voor verwijdering
                    photo_del_clicked2 = page.evaluate(f"""() => {{
                        const btn = document.querySelector('.media-thumb__del[data-photoid="{photo_id}"]');
                        if (btn) {{ btn.click(); return true; }}
                        return false;
                    }}""")
                    page.wait_for_timeout(500)

                    if not photo_del_clicked2:
                        log("D-26 Delete-before-save: success path volgorde", "FAIL",
                            f"Verwijderknop niet gevonden bij success path (photo_id={photo_id!r})")
                    else:
                        # Submit — laat save slagen
                        page.evaluate('() => { document.querySelector("#addSheetSubmit")?.click(); }')
                        page.wait_for_timeout(1800)  # geef async IDB-delete tijd

                        # Herstel IDBObjectStore.prototype.delete patch
                        page.evaluate("""() => {
                            // Patch was alleen voor logging; restore is niet strict noodzakelijk
                            // maar we ruimen op voor testizolatie
                            if (window.__origSetItem26b) localStorage.setItem = window.__origSetItem26b;
                        }""")

                        # Lees volgorde-log
                        ops_log = page.evaluate("() => window.__d26_success_ops || []")

                        # E. Controleer success path
                        sightings_after_ok = _get_ls_sightings(page)
                        updated_rec = next((x for x in sightings_after_ok if x.get('id') == sid26), None)

                        # foto verwijderd uit photoIds na succesvolle save
                        photo_removed_from_record = (
                            updated_rec is not None and
                            photo_id not in (updated_rec.get('photoIds') or [])
                        )

                        # Blob verwijderd uit IDB na succesvolle save
                        blob_deleted_from_idb = page.evaluate(f"""async () => {{
                            const {{ getPhoto }} = await import('/src/data/db.js');
                            const rec = await getPhoto('{photo_id}');
                            return rec === null;
                        }}""")

                        # Volgorde: localStorage.save moet VOOR IDB.photos.delete komen
                        save_idx   = next((i for i, op in enumerate(ops_log) if op == 'localStorage.save'), None)
                        delete_idx = next((i for i, op in enumerate(ops_log) if 'IDB.photos.delete' in op), None)

                        correct_order = (
                            save_idx   is not None and
                            delete_idx is not None and
                            save_idx < delete_idx
                        )

                        all_success = (
                            photo_removed_from_record and
                            blob_deleted_from_idb and
                            correct_order
                        )

                        if all_success:
                            log("D-26 Delete-before-save: success path volgorde correct", "PASS",
                                f"ops_log={ops_log}, "
                                f"save_idx={save_idx}, delete_idx={delete_idx}, "
                                f"photoIds={updated_rec.get('photoIds')!r}")
                        else:
                            log("D-26 Delete-before-save: success path volgorde correct", "FAIL",
                                f"photo_removed_from_record={photo_removed_from_record}, "
                                f"blob_deleted_from_idb={blob_deleted_from_idb}, "
                                f"correct_order={correct_order}, "
                                f"ops_log={ops_log}, "
                                f"save_idx={save_idx}, delete_idx={delete_idx}, "
                                f"updated_rec={updated_rec!r}")

    except Exception as e:
        log("D-26 Delete-before-save regressie", "FAIL", str(e))
        try: page.evaluate("() => { if(window.__origSetItem26) localStorage.setItem = window.__origSetItem26; }")
        except: pass
        try: _close_sheet(page)
        except: pass

    # ── D-27: Cancel tijdens edit — geen persistente wijzigingen ────────────────
    # Regressiontest: na cancel van een edit-form mag de originele sighting
    # ongewijzigd zijn in localStorage.
    print("--- D-27 ---")
    try:
        page.evaluate("() => { document.querySelectorAll('.sheet-overlay').forEach(el => el.remove()); }")
        page.wait_for_timeout(200)

        sid27 = "d27-cancel"
        _fresh(page)
        _set_ls(page, [_v2_sighting(sid27, notes="origineel cancel test", count=3)])
        _go_sightings(page)
        page.wait_for_selector('.sight-card', timeout=4000)

        # Open detail → edit
        page.locator('.sight-card').first.click(force=True)
        page.wait_for_timeout(600)
        page.wait_for_selector('#detailSightingSheet', timeout=4000)
        page.evaluate('() => { document.querySelector("#detailEdit")?.click(); }')
        page.wait_for_timeout(1000)

        # Wijzig het veld maar cancel (Escape) zonder op te slaan
        page.wait_for_selector('#addSightingSheet', timeout=5000)
        sheet = page.locator('#addSightingSheet').first
        sheet.locator('#sightNotes').first.fill("NIET OPGESLAGEN")
        page.keyboard.press("Escape")
        page.wait_for_timeout(600)

        # Originele sighting moet ongewijzigd zijn
        sightings = _get_ls_sightings(page)
        original = next((x for x in sightings if x.get('id') == sid27), None)

        if original is None:
            log("D-27 Cancel edit: origineel ongewijzigd", "FAIL", "sighting niet gevonden na cancel")
        else:
            notes_ok = original.get("notes") == "origineel cancel test"
            count_ok = original.get("count") == 3
            if notes_ok and count_ok:
                log("D-27 Cancel edit: origineel ongewijzigd", "PASS")
            else:
                log("D-27 Cancel edit: origineel ongewijzigd", "FAIL",
                    f"notes={original.get('notes')!r}, count={original.get('count')!r}")
    except Exception as e:
        log("D-27 Cancel edit: origineel ongewijzigd", "FAIL", str(e))
        try: _close_sheet(page)
        except: pass

    browser.close()

# ── Samenvatting ────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("Fase D QA — Resultaten")
print("="*60)
total  = len(results)
passed = sum(1 for _, s, _ in results if s == "PASS")
failed = total - passed

for name, status, detail in results:
    icon = "✓" if status == "PASS" else "✗"
    line = f"  {icon} {status:4s} | {name}"
    if detail:
        line += f"\n              {detail}"
    print(line)

print("="*60)
print(f"  Totaal: {total}  |  PASS: {passed}  |  FAIL: {failed}")
print("="*60)

shots_list = sorted(SHOTS.glob("phase_d_*.png"))
if shots_list:
    print(f"\n  Screenshots ({len(shots_list)} bestanden):")
    for p in shots_list:
        print(f"    {p.name}")

_srv.shutdown()
sys.exit(0 if failed == 0 else 1)
