"""
Birdspot Library — releasegate: upgrade van de vorige productieversie naar de releasekandidaat.

Bewijst dat bestaande gebruikersgegevens een update overleven. Dezelfde origin serveert eerst de
basisversie (standaard `main` = 5bf6704, Release 1.14.0) en daarna de werkkopie (releasekandidaat).
De service worker van de basisversie wordt dus echt vervangen.

  RU-01  Basisversie start; testgegevens in localStorage en IndexedDB vastgelegd. Onbekende velden
         en een foto-blob horen erbij.
  RU-02  Na omschakelen draait de nieuwe versie (sw.js en #appVersion = APP_VERSION van de werkkopie).
  RU-03  Iedere bestaande localStorage-sleutel is byte-gelijk; geen sleutel verdwenen.
  RU-04  IndexedDB-foto's onveranderd (id, velden, blob-inhoud).
  RU-05  De waarnemingen zijn zichtbaar in de nieuwe UI (profielteller en soortkaart).
  RU-06  Offline herladen na de update: app start, soortkaart opent en de gidsfoto is gedecodeerd.
  RU-07  Geen paginafouten.

Starten (vanuit repo-root, volledige git-historie nodig):
  python3 tests/test_release_upgrade.py [--base <git-ref>]
"""
import http.server
import io
import re
import subprocess
import sys
import tarfile
import tempfile
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
BASE_REF = sys.argv[sys.argv.index("--base") + 1] if "--base" in sys.argv else "5bf6704"
NEW_VERSION = re.search(r"const APP_VERSION = '([^']+)'", (ROOT / "sw.js").read_text(encoding="utf-8")).group(1)
SERVE = {"dir": None}

SEED_LS = {
    "birdspot-sightings": {"schemaVersion": 2, "sightings": [
        {"id": "ru1", "speciesId": "sp045", "speciesName": "Merel", "date": "2026-05-03", "time": "07:40",
         "locationName": "Lauwersmeer", "lat": 53.38, "lon": 6.21, "count": 2, "photoIds": ["ruf1"],
         "notes": "Zingend op dak", "futureField": {"keep": True, "n": 7}},
        {"id": "ru2", "speciesId": "sp118", "speciesName": "Rietgors", "date": "2026-04-12",
         "locationName": "Oostvaardersplassen", "count": 1, "photoIds": []},
    ]},
    "birdspot-places": [{"id": "plc1", "name": "Lauwersmeer", "lat": 53.38, "lon": 6.21, "custom": "bewaar mij"}],
    "birdspot-seen-species": ["sp045", "sp118"],
    "birdspot-map-layer": "satelliet",
    "birdspot-welcome-seen": "1",
    "birdspot-onbekende-toekomstsleutel": {"x": 1},
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=SERVE["dir"], **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def extract_base(dest):
    data = subprocess.run(["git", "archive", "--format=tar", BASE_REF], cwd=ROOT, check=True, capture_output=True).stdout
    with tarfile.open(fileobj=io.BytesIO(data)) as tar:
        tar.extractall(dest, filter="data")


def snapshot(p):
    return p.evaluate("""async () => {
        const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
        const db = await new Promise((res, rej) => { const r = indexedDB.open('birdspot-library'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
        const rows = await new Promise((res, rej) => { const q = db.transaction('photos').objectStore('photos').getAll(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
        const photos = [];
        for (const r of rows) { const { blob, ...rest } = r; photos.push({ ...rest, blobText: blob ? await blob.text() : null, blobType: blob?.type }); }
        db.close();
        return { ls, photos: photos.sort((a, b) => a.id.localeCompare(b.id)) };
    }""")


def wait_ready(p):
    p.locator("#birdspotSplash").wait_for(state="detached", timeout=20000)


def open_card(page, base, name, sid):
    page.goto(base, wait_until="domcontentloaded")
    wait_ready(page)
    page.locator('.nav-item[data-route="species"]').click()
    if page.locator('#speciesFiltersToggle').count():
        page.locator('#speciesFiltersToggle').click()
    page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
    page.locator('#speciesSearch').fill(name)
    page.locator(f'.species-row[data-id="{sid}"] .species-row__body').click()
    page.locator('.sd-tabs').wait_for(timeout=8000)


def main():
    errors = []
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / "base"
        base.mkdir()
        extract_base(base)
        base_version = re.search(r"const APP_VERSION = '([^']+)'", (base / "sw.js").read_text(encoding="utf-8")).group(1)
        SERVE["dir"] = str(base)
        srv = Server(("127.0.0.1", 0), Handler)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{srv.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            ctx = browser.new_context(viewport={"width": 390, "height": 844})
            p = ctx.new_page()
            p.on("pageerror", lambda e: errors.append(str(e)))
            p.goto(url, wait_until="domcontentloaded")
            wait_ready(p)
            p.evaluate("""async (seed) => {
                for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
                const db = await new Promise((res, rej) => { const r = indexedDB.open('birdspot-library', 1);
                  r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('photos')) { const s = d.createObjectStore('photos', { keyPath: 'id' }); s.createIndex('by_species','speciesId'); s.createIndex('by_sighting','sightingId'); } };
                  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
                await new Promise((res, rej) => { const tx = db.transaction('photos', 'readwrite');
                  tx.objectStore('photos').put({ id: 'ruf1', blob: new Blob(['merel-foto-bytes-1234567890'], { type: 'image/jpeg' }), type: 'image/jpeg',
                    filename: 'merel.jpg', speciesId: 'sp045', sightingId: 'ru1', addedAt: 1762300000000, extraVeld: 'blijft' });
                  tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
                db.close();
            }""", SEED_LS)
            p.reload(wait_until="domcontentloaded")
            wait_ready(p)
            p.wait_for_timeout(1500)
            before = snapshot(p)
            assert set(SEED_LS) <= set(before["ls"]) and before["photos"][0]["id"] == "ruf1", "RU-01 seed niet vastgelegd"
            print(f"RU-01 OK — basisversie {base_version} ({BASE_REF}) met {len(before['ls'])} localStorage-sleutels en {len(before['photos'])} foto")

            # Omschakelen naar de releasekandidaat op dezelfde origin.
            SERVE["dir"] = str(ROOT)
            seen = None
            used_button = False
            for attempt in range(8):
                p.reload(wait_until="domcontentloaded")
                wait_ready(p)
                p.wait_for_timeout(2500)
                sw_text = p.evaluate("() => fetch('sw.js', {cache: 'no-store'}).then(r => r.text())")
                p.locator('.nav-item[data-route="profile"]').click()
                p.wait_for_function("() => { const e = document.querySelector('#appVersion'); return e && !e.textContent.includes('ophalen'); }", timeout=15000)
                seen = p.locator("#appVersion").inner_text()
                if NEW_VERSION in seen and f"'{NEW_VERSION}'" in sw_text:
                    break
                # Basis >= 1.18.0: de wachtende versie wordt via de updateknop toegepast (zoals de gebruiker doet).
                upd = p.locator("#appUpdate")
                if upd.count() and upd.is_visible():
                    used_button = True
                    with p.expect_navigation(timeout=20000):
                        upd.click()
                    wait_ready(p)
                    continue
                p.locator('.nav-item[data-route="home"]').click()
            assert NEW_VERSION in (seen or ""), f"RU-02 nieuwe versie niet actief na update: {seen!r}"
            for _ in range(3):
                p.reload(wait_until="domcontentloaded")
                p.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)
            assert not errors, f"RU-02 paginafouten na herladen: {errors}"
            print(f"RU-02 OK — na {attempt + 1} herlaadbeurt(en){' en de updateknop' if used_button else ''} actief: {seen}; daarna 3× herladen zonder fouten")

            after = snapshot(p)
            for k, v in before["ls"].items():
                assert k in after["ls"], f"RU-03 sleutel {k} verdwenen"
                if k in SEED_LS:
                    assert after["ls"][k] == v, f"RU-03 sleutel {k} gewijzigd:\n{v}\n→\n{after['ls'][k]}"
            new_keys = sorted(set(after["ls"]) - set(before["ls"]))
            print(f"RU-03 OK — {len(SEED_LS)} gebruikerssleutels byte-gelijk (incl. onbekende velden/sleutel); nieuw toegevoegd door de app: {new_keys or 'geen'}")
            assert after["photos"] == before["photos"], f"RU-04 foto's gewijzigd: {before['photos']} → {after['photos']}"
            print("RU-04 OK — IndexedDB-foto onveranderd (velden, extraVeld en blob-inhoud)")

            profile_text = p.locator("body").inner_text()
            assert re.search(r"\b2\b", profile_text), "RU-05 profiel toont de 2 waarnemingen niet"
            open_card(p, url, "Merel", "sp045")
            p.locator('[data-sd-tab="mijn"]').click()
            p.wait_for_timeout(600)
            card = p.locator("#speciesDetailSightings").inner_text()
            assert "Lauwersmeer" in card, "RU-05 soortkaart Merel toont de bestaande waarneming niet"
            print("RU-05 OK — profiel en soortkaart Merel tonen de bestaande waarnemingen")

            ctx.set_offline(True)
            open_card(p, url, "Zilvermeeuw", "sp094")
            p.wait_for_function("""() => [...document.querySelectorAll('img')].some(i => /sp094/.test(i.currentSrc || i.src) && i.complete && i.naturalWidth > 0)""", timeout=10000)
            assert snapshot(p)["ls"]["birdspot-sightings"] == before["ls"]["birdspot-sightings"], "RU-06 data offline anders"
            print("RU-06 OK — offline gestart na update; soortkaart Zilvermeeuw met gedecodeerde gidsfoto; gegevens gelijk")

            # RU-08 (1.27.7 release candidate): validate that new post-1.27.6 media,
            # not present in the old review revision, is physically precached
            # and decodes OFFLINE. Also prove two changed JS modules are the
            # exact current candidate bytes (not stale 1.27.6 code).
            if NEW_VERSION == "1.27.7":
                import hashlib
                new_media = [
                    "/assets/species/plumage/sp082-portrait.webp",
                    "/assets/species/plumage/sp084-juv-europa.webp",
                ]
                registry = (ROOT / "assets/species/field-guide-media.json").read_text(encoding="utf-8")
                for media_path in new_media:
                    assert media_path in registry and (ROOT / media_path.lstrip("/")).is_file(), (
                        f"RU-08 new guide image not registered: {media_path}"
                    )
                media_result = p.evaluate("""async paths => {
                    const mediaCache = await caches.open('birdspot-media');
                    const checked = [];
                    for (const path of paths) {
                        const cached = await mediaCache.match(path);
                        const img = new Image();
                        img.src = path;
                        let error = null;
                        try { await img.decode(); } catch (e) { error = String(e); }
                        checked.push({path, cached: !!cached?.ok,
                                      decoded: !error && img.complete && img.naturalWidth > 0,
                                      width: img.naturalWidth, height: img.naturalHeight, error});
                    }
                    return checked;
                }""", new_media)
                assert all(item["cached"] and item["decoded"] for item in media_result), (
                    f"RU-08 new guide images unavailable offline: {media_result}"
                )
                modules = ["src/data/speciesKnowledge.js", "src/features/species/guideMedia.js"]
                module_result = p.evaluate("""async paths => {
                    const result = [];
                    for (const path of paths) {
                        const response = await fetch('/' + path);
                        if (!response.ok) throw new Error('Missing offline module: ' + path);
                        const bytes = await response.arrayBuffer();
                        const digest = await crypto.subtle.digest('SHA-256', bytes);
                        const sha = Array.from(new Uint8Array(digest))
                          .map(b => b.toString(16).padStart(2, '0')).join('');
                        result.push({path, sha});
                    }
                    return result;
                }""", modules)
                for item in module_result:
                    expected = hashlib.sha256((ROOT / item["path"]).read_bytes()).hexdigest()
                    assert item["sha"] == expected, (
                        f"RU-08 stale/mismatched module {item['path']}: {item['sha']} != {expected}"
                    )
                print("RU-08 OK — twee nieuwe gids-WebP's vooraf gecachet en gedecodeerd offline; "
                      "twee veranderde modules byte-identiek aan deze releasekandidaat")
            ctx.set_offline(False)
            browser.close()
        srv.shutdown()
    assert not errors, f"RU-07 paginafouten: {errors}"
    print("RU-07 OK — geen paginafouten")
    print(f"Releasegate upgrade {BASE_REF} → {NEW_VERSION}: RU-01..07 PASS" +
          (" + RU-08 PASS (new offline images and exact JS)" if NEW_VERSION == "1.27.7" else ""))


if __name__ == "__main__":
    main()
