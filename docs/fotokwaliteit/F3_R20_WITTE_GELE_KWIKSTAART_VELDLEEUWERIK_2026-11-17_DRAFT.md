# Birdspot F3-R20 — Witte Kwikstaart, Gele Kwikstaart, Veldleeuwerik (+ R19-QA media-auteurs)

**Datum:** 17 november 2026 · **Status:** DRAFT / PARTIALLY TESTED · **PR:** #287 · **Base:** PR #286 @ `dde16fa6` · DRAFT-norm #282 niet inbegrepen

## R19-QA — auteurcontrole Commons
- `tools/media/orig_check.py::author_match`: alleen herleidbare vormen tellen als gelijk — `exact`; Flickr-import `naam from Plaats`; accountachtervoegsel `naam (…)`; bij leeg Artist-veld alleen expliciete paginavelden `recordist` (+ `copyright holder`), ook via `{{Information field|name=…|value=…}}`. Leeg, gedeeltelijk of afwijkend = False. Positieve en negatieve tests in `tests/test_orig_check.py`.
- Bewijs (origcheck-r20/r20c): `sp065-head-down`, `sp066-juv-fed` → flickr-location-suffix (`[flickr-profiel hedera.baltica] from Wrocław, Poland`); `sp065-flight` → account-suffix; `sp067-call` → Recordist Aubrey John Williams + Copyright Holder The British Library Board, CC BY-SA 4.0, VRT 2015111010010706 (opname Frensham Great Pond, Surrey). Alleen mediarechten; soort en geluidstype niet VERIFIED.
- Geen auteursnaam in het register gewijzigd.

## F3-R20
| Bron | Status |
|---|---|
| Vogelbescherming | Witte Kwikstaart, Gele Kwikstaart, Veldleeuwerik gelezen (17-11) |
| Sovon | 10201 (Witte Kwikstaart; 10200 is een indexpagina), 10171, 9760 gelezen |
| Tweede uitgever | Naturalis Birds of Europe (zoeksnippets): 18 / 16,5 / 18 cm; ondersoorten Gele Kwikstaart, yarrellii |
| Commons / iNaturalist | origcheck 8 foto's: alle dezelfde opname; Commons exact; iNaturalist-rechten alleen register |
| eBird / ANWB | BLOCKED / NOT TESTED |

| Soort | Foto's | Rollen | Wijziging | Open |
|---|---|---|---|---|
| Witte Kwikstaart `sp068` | 2/2 | broedkleed nominaat alba (grijze rug), echte vrije vlucht | VBN-aantallen, Sovon-trend | juveniel niet gezocht |
| Gele Kwikstaart `sp069` | 4 bekeken, 3 getoond | mannetje nominaat flava; vrouwtje past bij Naturalis; landende foto blijft "Landend" | juveniel **niet vrijgegeven** → `retired.sp069`; trend-bronverschil (perioden) | iNaturalist-rechten vrouwtje; ondersoort vrouwtje |
| Veldleeuwerik `sp070` | 2/2 | rustfoto en echte zangvlucht kloppen | Sovon-trend, Rode Lijst gevoelig | Kuif-/Boomleeuwerik niet uitgewerkt |

**Dubbelgangers:** LK-042 Witte–Gele Kwikstaart (volwassen; juvenielenpaar blijft tekst-only), LK-043 Veldleeuwerik–Graspieper (rust en vlucht). Chromium 320/360/390, zoom, terug, beide richtingen.

**Volgende:** F3-R21 — `sp071`–`sp073`.
