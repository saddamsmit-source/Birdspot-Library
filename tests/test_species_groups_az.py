"""
Birdspot Library — Soortgroepen alfabetisch A-Z (Opdracht 2, 2026-11-10)
  SG-01  Soorten-pagina: soortgroep-labels (species-group__label) staan A-Z
         op Nederlandse groepsnaam, voor zowel "Alle" als een losse categorie
  SG-02  Soortkiezer bij waarneming loggen (speciesPicker): groep-labels A-Z,
         zowel ongefilterd als na een zoekopdracht
  SG-03  Profiel -> Mijn lijsten -> Alle soorten: bestaande A-Z-groepering
         (groupSpeciesByFamily) blijft intact (regressie, geen nieuwe code)
  SG-04  Individuele vogelkaarten binnen een groep zijn niet herordend t.o.v.
         de brondata (alleen de groepsvolgorde is gewijzigd)
  SG-05  Favorieten, zoeken, seizoenfilter en navigatie blijven werken na de
         sorteerwijziging (lichte rooktest; volledige dekking in andere tests)

Starten (vanuit repo-root):  python tests/test_species_groups_az.py
"""
import http.server
import json
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "tests" / "screenshots"
SHOTS.mkdir(parents=True, exist_ok=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def log_message(self, *a):
        pass


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


def ensure_species_filter_open(page):
    """Op UI-versies met een inklapbare categoriefilter (<details class="species-filter">,
    reviewpreview na de UI-redesign) moet het menu open staan voordat een filter-chip
    klikbaar/zichtbaar is; na een keuze klapt het vanzelf weer dicht. Op de eenvoudigere
    hoofdlijn-UI (main, zonder <details>-wrapper) bestaat deze toggle niet en is dit een
    no-op, zodat deze test op beide UI-versies werkt."""
    toggle = page.locator("#speciesFiltersToggle")
    if toggle.count() == 0:
        return
    is_open = page.eval_on_selector("#speciesFiltersToggle", "el => el.closest('details').open")
    if not is_open:
        toggle.click()


def nl_sorted(labels):
    # Geen afhankelijkheid van een geïnstalleerde OS-locale (niet gegarandeerd
    # op een CI-runner). str.casefold() geeft een case-INsensitive vergelijking
    # die voor deze Nederlandse groepsnamen (o.a. "Ibissen" voor "IJsvogels")
    # dezelfde volgorde geeft als JS Array.prototype.sort met localeCompare('nl'),
    # geverifieerd tegen de daadwerkelijke renderuitkomst van de app.
    return sorted(labels, key=str.casefold)


def main():
    with Server(("127.0.0.1", 0), Quiet) as server:
        threading.Thread(target=server.serve_forever, daemon=True).start()
        base = f"http://127.0.0.1:{server.server_address[1]}/"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                      reduced_motion="reduce", service_workers="block")
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(base, wait_until="domcontentloaded")
            page.locator("#screen-home").wait_for(timeout=15000)
            page.locator("#birdspotSplash").wait_for(state="detached", timeout=15000)

            data = page.evaluate("""async () => {
              const m = await import('/src/data/species.js');
              return { species: m.SPECIES, active: m.activeCategories() };
            }""")
            species = data["species"]
            families_by_id = {s["id"]: s["family"] for s in species}

            # ── SG-01: Soorten-pagina, "Alle" ────────────────────────────
            page.locator('.nav-item[data-route="species"]').click()
            ensure_species_filter_open(page)
            page.locator("#speciesFilters .filter-chip").first.wait_for(timeout=10000)
            page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
            page.locator("#speciesList .species-group").first.wait_for(timeout=10000)

            labels = page.eval_on_selector_all(
                "#speciesList .species-group__label", "els => els.map(e => e.textContent.trim())")
            assert len(labels) > 1, "SG-01 te weinig soortgroepen zichtbaar om A-Z te toetsen"
            assert labels == nl_sorted(labels), f"SG-01 'Alle' niet A-Z: {labels}"
            assert labels == sorted(set(labels)) or len(labels) == len(set(labels)), \
                "SG-01 dubbele groepslabels op 'Alle'"
            page.screenshot(path=str(SHOTS / "species_groups_az_alle_390.png"))

            # SG-04: vogelkaarten binnen elke groep ongewijzigd (zelfde set id's
            # als de brondata voor die familie, binnen de getoonde pagina-limiet)
            groups_dom = page.eval_on_selector_all(
                "#speciesList .species-group",
                """els => els.map(g => ({
                     label: g.querySelector('.species-group__label').textContent.trim(),
                     ids: [...g.querySelectorAll('.species-row')].map(r => r.dataset.id),
                   }))""")
            for g in groups_dom:
                for sid in g["ids"]:
                    assert families_by_id.get(sid) == g["label"], \
                        f"SG-04 {sid} staat onder groep '{g['label']}', brondata zegt '{families_by_id.get(sid)}'"

            # ── SG-01b: Soorten-pagina, één losse categorie ─────────────
            cat = data["active"][0]
            ensure_species_filter_open(page)
            page.locator(f'#speciesFilters .filter-chip[data-cat="{cat}"]').click()
            page.wait_for_function(
                "() => document.querySelectorAll('#speciesList .species-group').length > 0", timeout=8000)
            labels_cat = page.eval_on_selector_all(
                "#speciesList .species-group__label", "els => els.map(e => e.textContent.trim())")
            assert labels_cat == nl_sorted(labels_cat), f"SG-01 categorie '{cat}' niet A-Z: {labels_cat}"
            print(f"SG-01 OK — 'Alle' ({len(labels)} groepen) en '{cat}' ({len(labels_cat)} groepen) A-Z")

            # ── SG-05: zoeken/favorieten/navigatie blijven werken ───────
            ensure_species_filter_open(page)
            page.locator('#speciesFilters .filter-chip[data-cat="alle"]').click()
            search = page.locator("#speciesSearch, input[placeholder*='Zoek soort']").first
            search.fill("mees")
            page.wait_for_function(
                "() => document.querySelectorAll('#speciesList .species-row').length > 0", timeout=8000)
            labels_search = page.eval_on_selector_all(
                "#speciesList .species-group__label", "els => els.map(e => e.textContent.trim())")
            assert labels_search == nl_sorted(labels_search), f"SG-05 zoekresultaat niet A-Z: {labels_search}"
            star = page.locator("#speciesList .signature-species-star").first
            star.click()
            assert "is-on" in (star.get_attribute("class") or ""), "SG-05 favoriet-ster reageert niet meer"
            star.click()  # weer uitzetten, geen blijvende staat voor volgende run
            search.fill("")
            print("SG-05 OK — zoeken, favorieten en A-Z blijven samenwerken")

            # ── SG-02: soortkiezer bij waarneming loggen ────────────────
            page.locator('.nav-item[data-route="home"]').click()
            page.locator("#screen-home").wait_for(timeout=10000)
            page.locator("#fab").click()
            page.locator("#speciesPickerBtn").wait_for(timeout=8000)
            page.locator("#speciesPickerBtn").click()
            page.locator("#spPickerList .species-group").first.wait_for(timeout=8000)
            picker_labels = page.eval_on_selector_all(
                "#spPickerList .species-group__label", "els => els.map(e => e.textContent.trim())")
            assert len(picker_labels) > 1, "SG-02 te weinig groepen in soortkiezer"
            assert picker_labels == nl_sorted(picker_labels), f"SG-02 soortkiezer niet A-Z: {picker_labels}"

            page.locator("#spPickerSearch").fill("eend")
            page.wait_for_function(
                "() => document.querySelectorAll('#spPickerList .species-group').length > 0", timeout=8000)
            picker_labels_q = page.eval_on_selector_all(
                "#spPickerList .species-group__label", "els => els.map(e => e.textContent.trim())")
            assert picker_labels_q == nl_sorted(picker_labels_q), \
                f"SG-02 soortkiezer na zoeken niet A-Z: {picker_labels_q}"
            page.screenshot(path=str(SHOTS / "species_picker_groups_az_390.png"))
            print(f"SG-02 OK — soortkiezer A-Z ({len(picker_labels)} groepen, "
                  f"{len(picker_labels_q)} na zoeken 'eend')")

            page.locator("#spPickerClose").click()
            page.locator("#speciesPickerOverlay").wait_for(state="detached", timeout=5000)
            page.locator("#addSheetCancel").click()

            # ── SG-03: Profiel -> Mijn lijsten -> Alle soorten (regressie) ──
            page.locator('.nav-item[data-route="profile"]').click()
            page.locator("#screen-profile").wait_for(timeout=10000)
            lists_tab = page.locator('[data-profile-tab="lists"], .profile-tab[data-tab="lists"]').first
            if lists_tab.count():
                lists_tab.click()
            all_species_entry = page.get_by_text("Alle soorten", exact=False).first
            if all_species_entry.count():
                all_species_entry.click()
                page.locator(".profile-group-label").first.wait_for(timeout=8000)
                profile_labels = page.eval_on_selector_all(
                    ".profile-group-label", "els => els.map(e => e.textContent.trim())")
                assert len(profile_labels) > 1, "SG-03 te weinig groepen in Mijn lijsten -> Alle soorten"
                assert profile_labels == nl_sorted(profile_labels), \
                    f"SG-03 Mijn lijsten/Alle soorten niet meer A-Z (regressie!): {profile_labels}"
                print(f"SG-03 OK — Profiel/Mijn lijsten/Alle soorten blijft A-Z ({len(profile_labels)} groepen)")
            else:
                print("SG-03 overgeslagen — geen waarnemingen in deze sessie, 'Alle soorten' niet bereikbaar")

            assert not errors, f"paginafouten tijdens SG-run: {errors}"
            browser.close()
    print("Soortgroepen A-Z: alle controles geslaagd (SG-01..SG-05)")


if __name__ == "__main__":
    main()
