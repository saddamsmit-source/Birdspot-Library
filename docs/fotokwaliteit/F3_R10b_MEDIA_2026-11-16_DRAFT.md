# Birdspot F3-R10b-media — Putter-vluchtfoto, Sijs uit de vluchtrol, strengere intake

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r10b-media-putter-sijs-20261116` · **PR:** #268 (concept) · **Base:** PR #267 @ `41666b43` (niet gewijzigd)
**Schrijver:** Claude, plus workflowcommit `c1d39254` van `github-actions[bot]` (intake-run 43885061767) onder dezelfde claim.
**Normen:** Handbook v2.17 FINAL, Projectinstructies v2.13 FINAL, Index v3.12 FINAL, Veldhandboek v0.7 FINAL, kwaliteitsnorm v1.7 (§3.3 vrije vlucht, §3.4 fotoparen).

## 1. Wat is onderzocht en verbeterd

| Punt | Uitkomst | Bewijs | Status |
|---|---|---|---|
| **Intake: auteurscontrole** | Auteur uit het manifest moet gelijk zijn aan de Commons-auteur (`Artist`, opgeschoond; witruimte/hoofdletters genegeerd). Afwijking = weigering. | `check_item()` in `tools/media/commons_intake.py`; negatieve test met foute auteur | VERIFIED (code + test) |
| **Intake: padbewaking** | Uitvoer alleen in `assets/species/plumage/` (WebP) of `assets/species/audio/` (MP3); `..`, backslash, andere map of verkeerde extensie geweigerd. | `safe_dest()`; negatieve tests traversal, buiten map, extensie | VERIFIED (code + test) |
| **Intake: niet overschrijven** | Bestaand bestand = weigering (bleef zo; nu ook getest). | Negatieve test op `sp039-juv.webp` | VERIFIED |
| **Intake: audio pas na luisteren** | Audio-import vereist een `listened`-blok (wie, datum, soort, geluidsoort, kwaliteit). Zonder: weigering. | Negatieve test ongehoorde audio | VERIFIED |
| **Putter extra vluchtfoto** | Geïmporteerd: *Ist es der Niedernhaller Distelfink…* (Holger Uwe Schmitt, CC BY-SA 4.0, bron-SHA-1 `1c5eb195…`). Auteur, licentie en SHA-1 tegen Commons-metadata gecontroleerd door de workflow; pixelvergelijking met de Commons-miniatuur: gemiddeld verschil 0,9 (andere opname: 62,8). Visueel: soort zeker, vrij in de lucht zonder ondergrond. **Maar** poten hangen omlaag en sterke HDR-bewerking geeft een oranje kleurzweem → **voorwaardelijk**, kaart toont "Voorlopige foto", vervanging gewenst. Bestaande vluchtfoto blijft. | `vluchtcontrole.json` n=153, `beeldinventaris.json`, `GUIDE_SOURCE_AUDIT_2026-11-16_F3_R10b.json`, M5-audit | PARTIALLY TESTED (geen tweede beoordelaar) |
| **Sijs vluchtfoto** | Hercontrole: fotograaf beschrijft "comes in to land"; beeld toont geheven vleugels en naar voren gestrekte poten met gespreide tenen. Faalt de vrije-vluchtregel. **Uit de vluchtrol** naar Verenkleed (Mannetje) met label "Mannetje bij het neerstrijken". Bestand, herkomst en eerdere beoordeling (`history`) behouden. Geen vervanging verzonnen. | `vluchtcontrole.json` (uit-rol, landen, kleed), M7-audit, `flightReview` in `field-guide-media.json` | VERIFIED (regeltoepassing) |
| **Fotoparen §3.4** | Putter–Sijs en Groenling–Sijs in vlucht staan nu als `photoMissing` (vluchtcontrole 16-11): niet meer als fotopaar getoond, kenmerken in het register behouden. Rustparen Putter–Sijs (mannetjes, juvenielen) blijven. | VC-06, `test_guide_poses.mjs` | VERIFIED |

## 2. Audio — kandidaten, niets gepubliceerd

Alle kandidaten staan in `docs/media-intake/2026-11-16/audio_candidates_r10.json` met status `CANDIDATE_UNHEARD`. Geen enkele opname staat in de app.

| Soort | Bedoeld | Kandidaat | Licentie | Status |
|---|---|---|---|---|
| Putter | zang | XC489911 (Commons-mp3) | CC BY-SA 4.0 | ongehoord |
| Putter | roep | XC503634 (Commons-mp3) | CC BY-SA 4.0 | ongehoord |
| Sijs | zang | *Carduelis spinus.ogg* | CC BY-SA 3.0 | ongehoord |
| Sijs | roep | XC539301 (Commons-mp3) | CC BY-SA 4.0 | ongehoord |
| Kneu | zang | *Carduelis cannabina singing.flac* | CC BY-SA 4.0 | ongehoord |
| Kneu | roep | — | — | **geen kandidaat gevonden** |

Volgende stap: eigenaar (of aangewezen persoon) luistert per kandidaat en vult soort, geluidsoort en kwaliteit in; pas daarna kan de intake importeren.

## 3. Nog ontbrekend

- Sijs: echte vrije-vluchtfoto (bij voorkeur mannetje, zijaanzicht).
- Putter: vluchtfoto met natuurlijke kleuren (vervanging voor de voorwaardelijke).
- Zang en roep voor Putter, Sijs en Kneu (luistercontrole open; Kneu-roep zonder kandidaat).
- Tweede onafhankelijke beoordeling van beide vluchtbesluiten.

## 4. Tests die werkelijk draaiden (lokaal, 16-11-2026)

Alle `tests/*.mjs` geslaagd behalve `test_photo_feedback.mjs` (ontbrekend pakket `sharp` lokaal; zelfde op de base). Python: `test_media_intake_policy.py` (incl. nieuwe negatieve tests), `test_m22`, `test_m20`, `test_species_detail.py`, `test_kennisbaseline_validator.py`. Chromium: `test_lookalike_r09_browser.py`, `test_lookalike_r10_browser.py`, `test_kennisbaseline_browser.py`, `test_soortaudit_browser.py`. Generatoren idempotent (`build.py`, trackerbuild). CI: zie PR #268. Toestel en interactieve preview: **NOT TESTED / BLOCKED** (geen preview voor feature-branches; geen oudere versie als actueel getoond).

## 5. Volgende veilige stap

F3-R11 (Goudvink `sp040`, Appelvink `sp041`, Roodmus `sp042`) op een nieuwe branch vanaf de head van deze branch, met eigen concept-PR en writerclaim.
