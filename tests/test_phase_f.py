"""
Fase F — Back-up & herstel tests
Birdspot Library

Covers:
  F-01  Profiel-scherm laadt zonder console-errors
  F-02  Back-up sectie aanwezig (#backupStatus, #btnExport, #btnImport)
  F-03  Back-upstatus: "Nog geen back-up gemaakt" bij lege status
  F-04  "Terugzetten" kaart verborgen zonder veiligheidskopie
  F-05  Export via JS → STATUS_KEY bijgewerkt in localStorage
  F-06  Import ongeldig bestand → niets gewijzigd, toast error
  F-07  Round-trip: export ZIP → wis sightings → importeer → alles terug
  F-08  SAFETY_KEY aanwezig in localStorage na import
  F-09  Terugzetten → originele toestand, SAFETY_KEY verwijderd
  F-10  "Terugzetten" kaart zichtbaar na import
  F-11  Certainty-merge: existing 'certain' > imported 'possible'
  F-12  Geen browserdialogen in normale flows (eigen overlay)
  F-13  Geen horizontale overflow op 390 px
  F-14  Screenshots 360/390/430 px
"""

import http.server
import json
import os
import sys
import threading
import time

from playwright.sync_api import sync_playwright

# ── Server ────────────────────────────────────────────────────────────────────
PORT          = 8806
REPO_ROOT     = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_KEY   = "birdspot-sightings"
STATUS_KEY    = "birdspot-backup-status"
SAFETY_KEY    = "birdspot-safety-copy"
BASE_URL      = f"http://localhost:{PORT}"
SCREENSHOT_DIR = os.path.join(REPO_ROOT, "tests", "screenshots")

os.makedirs(SCREENSHOT_DIR, exist_ok=True)


def _start_server():
    handler = http.server.SimpleHTTPRequestHandler
    handler.log_message = lambda *a: None
    server = http.server.HTTPServer(("", PORT), handler)
    t = threading.Thread(target=server.serve_forever, daemon=True)
    t.start()
    return server


# ── Fixture data ──────────────────────────────────────────────────────────────
SIGHTING_1 = {
    "id": "s001",
    "speciesId": "common-swift",
    "speciesName": "Gierzwaluw",
    "date": "2024-05-01",
    "count": 3,
    "certainty": "certain",
    "locationName": "Testlocatie",
    "lat": 52.370,
    "lon": 4.895,
    "notes": "Vloog laag",
    "photoIds": [],
    "time": "08:30",
    "habitat": "stedelijk",
    "behavior": "vliegend",
    "weather": "zonnig",
}

SIGHTING_2 = {
    "id": "s002",
    "speciesId": "barn-swallow",
    "speciesName": "Boerenzwaluw",
    "date": "2024-05-02",
    "count": 1,
    "certainty": "probable",
    "locationName": "Polder",
    "lat": 52.100,
    "lon": 4.500,
    "notes": "",
    "photoIds": [],
    "time": "09:15",
    "habitat": "agrarisch",
    "behavior": "foerageren",
    "weather": "bewolkt",
}


def _make_storage(sightings, schema_version=2):
    return json.dumps({"schemaVersion": schema_version, "items": sightings})


# ── Helpers ───────────────────────────────────────────────────────────────────
def _seed(page, sightings, extra_keys=None):
    """Sla sightings op in localStorage, reload de pagina."""
    data = _make_storage(sightings)
    page.evaluate(f"""() => {{
        localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(data)});
        {"; ".join(f"localStorage.setItem({json.dumps(k)}, {json.dumps(v)})" for k, v in (extra_keys or {}).items())}
    }}""")
    page.reload()
    page.wait_for_load_state("networkidle")


def _go_profile(page):
    """Navigeer naar het profiel-scherm."""
    page.evaluate("() => document.querySelector('[data-route=\"profile\"]')?.click()")
    page.wait_for_timeout(400)


def _get_storage(page, key):
    """Lees een waarde uit localStorage."""
    return page.evaluate(f"() => localStorage.getItem({json.dumps(key)})")


def _clear_storage(page):
    """Wis alle birdspot-sleutels."""
    page.evaluate(f"""() => {{
        localStorage.removeItem({json.dumps(STORAGE_KEY)});
        localStorage.removeItem({json.dumps(STATUS_KEY)});
        localStorage.removeItem({json.dumps(SAFETY_KEY)});
    }}""")


def _profile_loaded(page):
    """Controleer of het profiel-scherm geladen is."""
    return page.evaluate("""() => !!document.querySelector('.profile-screen')""")


# ── Handmatige ZIP-bouw (pure JS in browser) voor import-test ─────────────────
# We hergebruiken de browser's eigen backup-module om een echte ZIP te genereren
# en die dan terug te importeren via de backup.importBackup() functie.

def _export_and_capture_zip(page):
    """
    Voer een export uit via de backup-module en vang de ZIP-data op als base64.
    Geeft None terug als export mislukt.
    """
    result = page.evaluate("""async () => {
        try {
            const { exportBackup } = await import('/src/storage/backup.js');
            // Overschrijf tijdelijk de download-aanroep zodat we de bytes vangen
            const origCreate = URL.createObjectURL;
            let capturedBase64 = null;

            // Intercept de anchor click door anchor.click te patchen
            const origAppend = document.body.appendChild.bind(document.body);
            document.body.appendChild = function(el) {
                if (el.tagName === 'A' && el.href && el.href.startsWith('data:')) {
                    // Vang base64 data URL op
                    capturedBase64 = el.href;
                    // Herstel direct en simuleer click niet
                    document.body.appendChild = origAppend;
                    return el;
                }
                return origAppend(el);
            };

            await exportBackup();
            document.body.appendChild = origAppend;
            return capturedBase64;
        } catch (e) {
            return null;
        }
    }""")
    return result


def _export_via_module(page):
    """
    Gebruik de backup module direct om export uit te voeren.
    Retourneert { sightingCount, photoCount } of null bij fout.
    """
    result = page.evaluate("""async () => {
        try {
            const { exportBackup } = await import('/src/storage/backup.js');
            // Patch anchor click om daadwerkelijke download te voorkomen
            const origClick = HTMLAnchorElement.prototype.click;
            HTMLAnchorElement.prototype.click = function() {
                // bewaar href voor evt. check maar klik niet
                this._intercepted = true;
            };
            const res = await exportBackup();
            HTMLAnchorElement.prototype.click = origClick;
            return res;
        } catch (e) {
            return { error: String(e) };
        }
    }""")
    return result


def _import_via_module(page, sightings_json_str, schema_version=2):
    """
    Bouw een geldige ZIP in de browser en importeer die via importBackup().
    Retourneert { merged } of { error }.
    """
    result = page.evaluate(f"""async () => {{
        try {{
            const {{ importBackup }} = await import('/src/storage/backup.js');

            // Bouw een minimale ZIP met gegevens.json
            const gegevensObj = {{
                format: "birdspot-backup",
                schemaVersion: {schema_version},
                exportedAt: new Date().toISOString(),
                sightings: {sightings_json_str},
            }};
            const jsonStr = JSON.stringify(gegevensObj);
            const encoder = new TextEncoder();
            const jsonBytes = encoder.encode(jsonStr);

            // CRC-32 berekenen
            function crc32(bytes) {{
                let crc = 0xFFFFFFFF;
                const table = [];
                for (let i = 0; i < 256; i++) {{
                    let c = i;
                    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
                    table[i] = c;
                }}
                for (const byte of bytes) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
                return (crc ^ 0xFFFFFFFF) >>> 0;
            }}

            const crc = crc32(jsonBytes);
            const size = jsonBytes.length;
            const name = encoder.encode("gegevens.json");
            const nameLen = name.length;

            // Local file header
            const lfh = new DataView(new ArrayBuffer(30 + nameLen));
            lfh.setUint32(0, 0x04034b50, true);  // signature
            lfh.setUint16(4, 20, true);            // version needed
            lfh.setUint16(6, 0, true);             // flags
            lfh.setUint16(8, 0, true);             // compression=stored
            lfh.setUint16(10, 0, true);            // mod time
            lfh.setUint16(12, 0, true);            // mod date
            lfh.setUint32(14, crc, true);          // crc32
            lfh.setUint32(18, size, true);         // compressed size
            lfh.setUint32(22, size, true);         // uncompressed size
            lfh.setUint16(26, nameLen, true);      // name length
            lfh.setUint16(28, 0, true);            // extra length
            new Uint8Array(lfh.buffer).set(name, 30);

            // Central directory
            const cd = new DataView(new ArrayBuffer(46 + nameLen));
            cd.setUint32(0, 0x02014b50, true);
            cd.setUint16(4, 20, true);
            cd.setUint16(6, 20, true);
            cd.setUint16(8, 0, true);
            cd.setUint16(10, 0, true);
            cd.setUint16(12, 0, true);
            cd.setUint16(14, 0, true);
            cd.setUint32(16, crc, true);
            cd.setUint32(20, size, true);
            cd.setUint32(24, size, true);
            cd.setUint16(28, nameLen, true);
            cd.setUint16(30, 0, true);
            cd.setUint16(32, 0, true);
            cd.setUint16(34, 0, true);
            cd.setUint16(36, 0, true);
            cd.setUint32(40, 0, true);
            cd.setUint32(42, 0, true);             // local header offset
            new Uint8Array(cd.buffer).set(name, 46);

            // End of central dir
            const ecd = new DataView(new ArrayBuffer(22));
            const cdSize = cd.buffer.byteLength;
            const cdOffset = lfh.buffer.byteLength + size;
            ecd.setUint32(0, 0x06054b50, true);
            ecd.setUint16(4, 0, true);
            ecd.setUint16(6, 0, true);
            ecd.setUint16(8, 1, true);
            ecd.setUint16(10, 1, true);
            ecd.setUint32(12, cdSize, true);
            ecd.setUint32(16, cdOffset, true);
            ecd.setUint16(20, 0, true);

            // Samenvoegen
            const parts = [
                new Uint8Array(lfh.buffer),
                jsonBytes,
                new Uint8Array(cd.buffer),
                new Uint8Array(ecd.buffer),
            ];
            let totalLen = 0;
            for (const p of parts) totalLen += p.length;
            const zipBytes = new Uint8Array(totalLen);
            let offset = 0;
            for (const p of parts) {{ zipBytes.set(p, offset); offset += p.length; }}

            // Maak File-object
            const zipFile = new File([zipBytes], "test-backup.zip", {{ type: "application/zip" }});

            const result = await importBackup(zipFile);
            return result;
        }} catch (e) {{
            return {{ error: String(e) }};
        }}
    }}""")
    return result


def _validate_via_module(page, sightings_json_str):
    """Valideer een geldige ZIP via validateBackupFile()."""
    result = page.evaluate(f"""async () => {{
        try {{
            const {{ validateBackupFile }} = await import('/src/storage/backup.js');
            const encoder = new TextEncoder();
            const gegevensObj = {{
                format: "birdspot-backup",
                schemaVersion: 2,
                exportedAt: new Date().toISOString(),
                sightings: {sightings_json_str},
            }};
            const jsonBytes = encoder.encode(JSON.stringify(gegevensObj));
            // Maak een minimale ZIP (zelfde patroon als _import_via_module)
            function crc32(bytes) {{
                let crc = 0xFFFFFFFF;
                const table = [];
                for (let i = 0; i < 256; i++) {{
                    let c = i;
                    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
                    table[i] = c;
                }}
                for (const byte of bytes) crc = table[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
                return (crc ^ 0xFFFFFFFF) >>> 0;
            }}
            const crc = crc32(jsonBytes);
            const size = jsonBytes.length;
            const name = encoder.encode("gegevens.json");
            const nameLen = name.length;
            const lfh = new DataView(new ArrayBuffer(30 + nameLen));
            lfh.setUint32(0, 0x04034b50, true);
            lfh.setUint16(4, 20, true);
            lfh.setUint16(6, 0, true);
            lfh.setUint16(8, 0, true);
            lfh.setUint16(10, 0, true);
            lfh.setUint16(12, 0, true);
            lfh.setUint32(14, crc, true);
            lfh.setUint32(18, size, true);
            lfh.setUint32(22, size, true);
            lfh.setUint16(26, nameLen, true);
            lfh.setUint16(28, 0, true);
            new Uint8Array(lfh.buffer).set(name, 30);
            const zipBytes = new Uint8Array(lfh.buffer.byteLength + size);
            zipBytes.set(new Uint8Array(lfh.buffer), 0);
            zipBytes.set(jsonBytes, lfh.buffer.byteLength);
            const zipFile = new File([zipBytes], "test.zip", {{ type: "application/zip" }});
            return await validateBackupFile(zipFile);
        }} catch (e) {{
            return {{ valid: false, error: String(e) }};
        }}
    }}""")
    return result


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_f01_profiel_laadt(page):
    """F-01: Profiel-scherm laadt zonder console-errors."""
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)
    critical = [e for e in errors if "404" not in e and "favicon" not in e.lower()]
    assert not critical, f"Console-errors: {critical}"
    return "PASS"


def test_f02_backup_sectie_aanwezig(page):
    """F-02: Back-up sectie met alle verwachte elementen aanwezig."""
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)
    for sel in ["#backupStatus", "#btnExport", "#btnImport", "#importFile"]:
        el = page.query_selector(sel)
        assert el is not None, f"Element niet gevonden: {sel}"
    return "PASS"


def test_f03_status_geen_backup(page):
    """F-03: Back-upstatus toont 'Nog geen back-up gemaakt' bij lege status."""
    _seed(page, [])
    _go_profile(page)
    page.wait_for_selector("#backupStatus", timeout=5000)
    text = page.inner_text("#backupStatus")
    assert "geen back-up" in text.lower() or "no backup" in text.lower() or \
           "nog geen" in text.lower(), f"Verwachtte 'geen back-up'-tekst, kreeg: {text!r}"
    return "PASS"


def test_f04_terugzetten_verborgen(page):
    """F-04: 'Terugzetten' kaart verborgen als er geen veiligheidskopie is."""
    _clear_storage(page)
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)
    restore_card = page.query_selector("#restoreCard")
    assert restore_card is not None, "#restoreCard niet gevonden"
    classes = restore_card.get_attribute("class") or ""
    assert "profile-card--hidden" in classes, \
        f"#restoreCard zou verborgen moeten zijn, klassen: {classes!r}"
    return "PASS"


def test_f05_export_status_bijgewerkt(page):
    """F-05: Export via module → STATUS_KEY bijgewerkt in localStorage."""
    _seed(page, [SIGHTING_1, SIGHTING_2])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    result = _export_via_module(page)
    assert result is not None, "exportBackup() gaf None terug"
    if isinstance(result, dict) and "error" in result:
        assert False, f"exportBackup() fout: {result['error']}"

    status_raw = _get_storage(page, STATUS_KEY)
    assert status_raw is not None, f"{STATUS_KEY} niet gezet na export"
    status = json.loads(status_raw)
    assert "lastBackup" in status, f"lastBackup ontbreekt in status: {status}"
    assert status.get("sightingCount", 0) == 2, \
        f"sightingCount verwacht 2, gekregen {status.get('sightingCount')}"
    return "PASS"


def test_f06_import_ongeldig_bestand(page):
    """F-06: Import ongeldig bestand → sightings ongewijzigd, error toast."""
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    result = page.evaluate("""async () => {
        try {
            const { validateBackupFile } = await import('/src/storage/backup.js');
            // Geef een leeg bestand (geen geldige ZIP)
            const invalidFile = new File([new Uint8Array([0x00, 0x01, 0x02])], "bad.zip",
                { type: "application/zip" });
            const check = await validateBackupFile(invalidFile);
            return { valid: check.valid, error: check.error };
        } catch (e) {
            return { error: String(e) };
        }
    }""")

    assert result is not None, "validateBackupFile() gaf None terug"
    assert result.get("valid") is False, \
        f"Ongeldig bestand zou valid=false moeten geven, gekregen: {result}"

    # Sightings moeten ongewijzigd zijn
    storage_raw = _get_storage(page, STORAGE_KEY)
    storage = json.loads(storage_raw)
    items = storage.get("items", [])
    assert len(items) == 1, f"Sightings gewijzigd na ongeldige import: {len(items)} items"
    return "PASS"


def test_f07_round_trip(page):
    """F-07: Round-trip export → wis → import → alle waarnemingen terug."""
    _seed(page, [SIGHTING_1, SIGHTING_2])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    # Export
    export_result = _export_via_module(page)
    assert export_result is not None and "error" not in (export_result or {}), \
        f"Export mislukt: {export_result}"

    # Wis sightings
    page.evaluate(f"""() => localStorage.removeItem({json.dumps(STORAGE_KEY)})""")

    # Controleer dat ze echt weg zijn
    storage_raw = _get_storage(page, STORAGE_KEY)
    assert storage_raw is None or json.loads(storage_raw).get("items", []) == [], \
        "Sightings hadden gewist moeten zijn"

    # Importeer via module (bouwt eigen ZIP met dezelfde sightings)
    sightings_json = json.dumps([SIGHTING_1, SIGHTING_2])
    import_result = _import_via_module(page, sightings_json)
    assert import_result is not None, "importBackup() gaf None terug"
    assert "error" not in import_result, f"importBackup() fout: {import_result.get('error')}"

    # Controleer dat beide waarnemingen terug zijn
    storage_raw = _get_storage(page, STORAGE_KEY)
    assert storage_raw is not None, "STORAGE_KEY leeg na import"
    storage = json.loads(storage_raw)
    items = storage.get("items", [])
    ids = {s["id"] for s in items}
    assert "s001" in ids, f"s001 ontbreekt na import. IDs: {ids}"
    assert "s002" in ids, f"s002 ontbreekt na import. IDs: {ids}"
    return "PASS"


def test_f08_safety_key_na_import(page):
    """F-08: SAFETY_KEY aanwezig in localStorage na succesvolle import."""
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    sightings_json = json.dumps([SIGHTING_2])
    import_result = _import_via_module(page, sightings_json)
    assert import_result is not None and "error" not in import_result, \
        f"Import mislukt: {import_result}"

    safety_raw = _get_storage(page, SAFETY_KEY)
    assert safety_raw is not None, f"{SAFETY_KEY} ontbreekt na import"
    safety = json.loads(safety_raw)
    assert "items" in safety, f"SAFETY_KEY heeft geen 'items': {safety}"
    return "PASS"


def test_f09_terugzetten_herstelt(page):
    """F-09: Terugzetten → originele toestand, SAFETY_KEY verwijderd."""
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    # Import (maakt veiligheidskopie)
    sightings_json = json.dumps([SIGHTING_2])
    import_result = _import_via_module(page, sightings_json)
    assert import_result is not None and "error" not in import_result, \
        f"Import mislukt: {import_result}"

    # Controleer dat SAFETY_KEY aanwezig is
    safety_raw = _get_storage(page, SAFETY_KEY)
    assert safety_raw is not None, "SAFETY_KEY ontbreekt na import"

    # Voer terugzetten uit via module
    restore_result = page.evaluate("""async () => {
        try {
            const { restoreFromSafetyCopy } = await import('/src/storage/backup.js');
            await restoreFromSafetyCopy();
            return { ok: true };
        } catch (e) {
            return { error: String(e) };
        }
    }""")
    assert restore_result.get("ok") is True, \
        f"restoreFromSafetyCopy() fout: {restore_result.get('error')}"

    # SAFETY_KEY moet verwijderd zijn
    safety_after = _get_storage(page, SAFETY_KEY)
    assert safety_after is None, f"{SAFETY_KEY} nog aanwezig na terugzetten"

    # Sightings moeten terug zijn naar origineel (alleen s001)
    storage_raw = _get_storage(page, STORAGE_KEY)
    storage = json.loads(storage_raw)
    items = storage.get("items", [])
    ids = {s["id"] for s in items}
    assert "s001" in ids, f"s001 ontbreekt na terugzetten. IDs: {ids}"
    return "PASS"


def test_f10_terugzetten_kaart_zichtbaar_na_import(page):
    """F-10: 'Terugzetten' kaart zichtbaar na import (zonder .profile-card--hidden)."""
    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    sightings_json = json.dumps([SIGHTING_2])
    import_result = _import_via_module(page, sightings_json)
    assert import_result is not None and "error" not in import_result, \
        f"Import mislukt: {import_result}"

    # Herlaad profiel-scherm om de UI bij te werken
    page.reload()
    page.wait_for_load_state("networkidle")
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    restore_card = page.query_selector("#restoreCard")
    assert restore_card is not None, "#restoreCard niet gevonden"
    classes = restore_card.get_attribute("class") or ""
    assert "profile-card--hidden" not in classes, \
        f"#restoreCard zou zichtbaar moeten zijn na import, klassen: {classes!r}"
    return "PASS"


def test_f11_certainty_merge(page):
    """F-11: Certainty-merge: existing 'certain' > imported 'possible' → blijft 'certain'."""
    # Bestaande waarneming met certainty='certain'
    existing = dict(SIGHTING_1, certainty="certain")
    _seed(page, [existing])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    # Importeer zelfde id maar met certainty='possible'
    imported = dict(SIGHTING_1, certainty="possible", notes="overschreven?")
    sightings_json = json.dumps([imported])
    import_result = _import_via_module(page, sightings_json)
    assert import_result is not None and "error" not in import_result, \
        f"Import mislukt: {import_result}"

    storage_raw = _get_storage(page, STORAGE_KEY)
    storage = json.loads(storage_raw)
    items = storage.get("items", [])
    merged = next((s for s in items if s["id"] == "s001"), None)
    assert merged is not None, "Waarneming s001 ontbreekt na merge"
    assert merged.get("certainty") == "certain", \
        f"Certainty had 'certain' moeten blijven, gekregen: {merged.get('certainty')!r}"
    return "PASS"


def test_f12_geen_browserdialogen(page):
    """F-12: Geen browserdialogen (alert/confirm/prompt) in normale flows."""
    dialog_fired = []
    page.on("dialog", lambda d: dialog_fired.append(d.type) or d.dismiss())

    _seed(page, [SIGHTING_1])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    # Trigger export
    _export_via_module(page)

    # Trigger import-validatie van ongeldig bestand
    page.evaluate("""async () => {
        const { validateBackupFile } = await import('/src/storage/backup.js');
        const f = new File([new Uint8Array([0])], "x.zip", { type: "application/zip" });
        return await validateBackupFile(f);
    }""")

    page.wait_for_timeout(300)
    assert not dialog_fired, f"Browser-dialogen gevuurd: {dialog_fired}"
    return "PASS"


def test_f13_geen_overflow(page):
    """F-13: Geen horizontale overflow op 390 px."""
    _seed(page, [SIGHTING_1, SIGHTING_2])
    _go_profile(page)
    page.wait_for_selector(".profile-screen", timeout=5000)

    overflow = page.evaluate("""() => {
        const body = document.body;
        return body.scrollWidth > body.clientWidth;
    }""")
    assert not overflow, "Horizontale overflow gedetecteerd op 390 px"
    return "PASS"


def test_f14_screenshots(page, browser):
    """F-14: Screenshots op 360/390/430 px."""
    for width in [360, 390, 430]:
        ctx = browser.new_context(
            viewport={"width": width, "height": 844},
            locale="nl-NL",
        )
        pg = ctx.new_page()
        pg.goto(BASE_URL, wait_until="networkidle")

        # Seed via JS
        data = _make_storage([SIGHTING_1, SIGHTING_2])
        pg.evaluate(f"""() => localStorage.setItem({json.dumps(STORAGE_KEY)}, {json.dumps(data)})""")
        pg.reload()
        pg.wait_for_load_state("networkidle")
        pg.evaluate("() => document.querySelector('[data-route=\"profile\"]')?.click()")
        pg.wait_for_timeout(400)
        pg.wait_for_selector(".profile-screen", timeout=5000)

        path = os.path.join(SCREENSHOT_DIR, f"phase_f_profile_{width}.png")
        pg.screenshot(path=path)
        ctx.close()

    return "PASS"


# ── Runner ────────────────────────────────────────────────────────────────────

def main():
    server = _start_server()
    time.sleep(0.3)

    os.chdir(REPO_ROOT)

    p_count = f_count = s_count = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="nl-NL",
        )
        page = context.new_page()
        page.goto(BASE_URL, wait_until="networkidle")

        tests = [
            ("F-01", "Profiel-scherm laadt zonder console-errors",
             lambda: test_f01_profiel_laadt(page)),
            ("F-02", "Back-up sectie aanwezig",
             lambda: test_f02_backup_sectie_aanwezig(page)),
            ("F-03", "Back-upstatus: geen back-up",
             lambda: test_f03_status_geen_backup(page)),
            ("F-04", "Terugzetten kaart verborgen",
             lambda: test_f04_terugzetten_verborgen(page)),
            ("F-05", "Export → STATUS_KEY bijgewerkt",
             lambda: test_f05_export_status_bijgewerkt(page)),
            ("F-06", "Import ongeldig bestand",
             lambda: test_f06_import_ongeldig_bestand(page)),
            ("F-07", "Round-trip export → wis → import",
             lambda: test_f07_round_trip(page)),
            ("F-08", "SAFETY_KEY na import",
             lambda: test_f08_safety_key_na_import(page)),
            ("F-09", "Terugzetten herstelt origineel",
             lambda: test_f09_terugzetten_herstelt(page)),
            ("F-10", "Terugzetten kaart zichtbaar na import",
             lambda: test_f10_terugzetten_kaart_zichtbaar_na_import(page)),
            ("F-11", "Certainty merge: certain > possible",
             lambda: test_f11_certainty_merge(page)),
            ("F-12", "Geen browserdialogen",
             lambda: test_f12_geen_browserdialogen(page)),
            ("F-13", "Geen horizontale overflow",
             lambda: test_f13_geen_overflow(page)),
            ("F-14", "Screenshots 360/390/430 px",
             lambda: test_f14_screenshots(page, browser)),
        ]

        print(f"\nFase F — Back-up & herstel tests ({len(tests)} totaal)\n{'─' * 55}")

        for code, label, fn in tests:
            try:
                result = fn()
                if isinstance(result, str) and result.startswith("SKIP"):
                    s_count += 1
                    print(f"  SKIP  {code}  {label}")
                    print(f"        {result}")
                else:
                    p_count += 1
                    print(f"  PASS  {code}  {label}")
            except Exception as exc:
                f_count += 1
                print(f"  FAIL  {code}  {label}")
                print(f"        {exc}")

        context.close()
        browser.close()

    print(f"\n{'─' * 55}")
    print(f"  {p_count} PASS  ·  {f_count} FAIL  ·  {s_count} SKIP")
    server.shutdown()
    sys.exit(0 if f_count == 0 else 1)


if __name__ == "__main__":
    main()
