"""
Birdspot Library — Fase D QA Tests
Playwright tests voor de sighting-workflow (v2 schema):
  D-01 t/m D-20: functionele tests
  D-21 t/m D-23: screenshots op 360/390/430px (D11)

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
        sheet.locator('#addSheetSubmit').first.click(force=True)
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
        page.locator('#addSightingSheet #addSheetSubmit').first.click(force=True)
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
        page.locator('#detailEdit').first.click(force=True)
        page.wait_for_timeout(700)

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
        page.locator('#detailEdit').first.click(force=True)
        page.wait_for_timeout(700)

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
        page.locator('#detailEdit').first.click(force=True)
        page.wait_for_timeout(700)

        sheet = page.locator('#addSightingSheet').first
        sheet.locator('#sightNotes').first.fill("Bewerkt via D-19 test")
        sheet.locator('#addSheetSubmit').first.click(force=True)
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
        page.locator('#detailDelete').first.click(force=True)
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
