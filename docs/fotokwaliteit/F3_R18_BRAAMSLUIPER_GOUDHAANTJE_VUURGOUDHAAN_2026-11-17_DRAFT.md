# Birdspot F3-R18 — Braamsluiper, Goudhaantje, Vuurgoudhaan

**Datum:** 17 november 2026 · **Status:** DRAFT / PARTIALLY TESTED · **PR:** #285 · **Base:** PR #284 (F3-R17) · DRAFT-norm #282 niet inbegrepen
**Fotoprioriteit:** eigenaarbesluit 16/17-11 (DRAFT §3.5): hoofdfoto → m/v of neutraal "Volwassen" → symmetrische vergelijkingen; vlucht en juveniel niet geforceerd.

| Bron | Status |
|---|---|
| Vogelbescherming | Braamsluiper, Goudhaan, Vuurgoudhaan gelezen (17-11) |
| Sovon | 12740, 13140, 13150 gelezen |
| Commons / iNaturalist | origcheck 8 foto's + 3 opnamen: alle foto's dezelfde opname (r = 1,00); Commons-rechten actueel; iNaturalist-rechten alleen register |
| eBird / ANWB | BLOCKED / NOT TESTED |

| Soort | Foto's | Rollen | Toegevoegd | Open |
|---|---|---|---|---|
| Braamsluiper `sp062` | 1/1 | neutrale "Volwassen" klopt (grijze kruin, donkere oorstreek, witte keel) | kennisprofiel (VBN + Sovon) | lengte één uitgever; trend VBN vs Sovon |
| Goudhaantje `sp063` | 4/4 | hoofdfoto en juveniel kloppen; vrouwtjesfoto neutraal "Volwassen" (QA-fix) | Sovon-status, trendverschil | geslacht alleen bronclaim |
| Vuurgoudhaan `sp064` | 3 bekeken, 2 getoond | mannetje klopt (oranje middenkruin, witte wenkbrauw, zwarte oogstreep) | Sovon-status | juveniel niet vrijgegeven (QA-fix) |

**Dubbelgangers:** LK-036 Grasmus–Braamsluiper nu aan beide kanten bronbeeld-gecontroleerd; LK-037 Braamsluiper–Tuinfluiter; LK-038 Goudhaan–Vuurgoudhaan (kop, volwassen); LK-039 juvenielenfotopaneel verborgen (QA-fix). Chromium 320/360/390 in beide richtingen.

**QA-fix (onafhankelijke QA ChatGPT, 17-11):**
- Vuurgoudhaan-juveniel `sp064-juv.webp` niet vrijgegeven: naar `retired.sp064` (bestand, bron, licentieclaim, historie bewaard); niet in gids of precache.
- LK-039 juvenielenfotopaneel verborgen (`photoMissing` op beide vogels); LK-038 volwassen paar behouden; tekstwaarschuwingen in kennisprofielen behouden. Negatieve regressietest in `tests/test_guide_poses.mjs` en `tests/test_lookalike_r18.mjs`.
- Goudhaantje `sp063-adult-f.webp`: label "Vrouwtje" → neutraal "Volwassen"; bronclaim fotograaf bewaard als `sourceSexClaim` + `sexNote`. Bron geslachtsbepaling: Ringers' DigiGuide (Ottenby) — oranje vaak bedekt door geel, veren moeten gescheiden worden.

**Uitzonderingsregel:** `tests/f3_plumage_rule.mjs` vervangt de R17-regel; vijf gevallen in `tests/test_f3_plumage_rule.mjs` (compleet PASS, optionele rol met reden PASS, hoofdfoto mist FAIL, te korte reden FAIL, niet-bronbeeldgecontroleerde foto FAIL) plus fladderen ≠ vrije vlucht. Gebruikt in de rebaseline voor R17 en R18.

**Gate:** geen FULL PASS: audio (bronlabel), onafhankelijke review, toestel en twee open beeldbeoordelingen.

**Volgende:** F3-R19 — `sp065`–`sp067`.
