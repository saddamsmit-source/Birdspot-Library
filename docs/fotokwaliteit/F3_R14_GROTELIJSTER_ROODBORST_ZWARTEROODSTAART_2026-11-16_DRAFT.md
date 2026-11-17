# Birdspot F3-R14 — Grote Lijster, Roodborst, Zwarte Roodstaart

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r14-media-grotelijster-roodborst-zwarteroodstaart-20261116` · **PR:** #276 · **Base:** PR #275 @ `dc356f2a`

| Soort | Bronbeeld (origcheck) | Rollen | Rechten | Vrije vlucht | Sovon |
|---|---|---|---|---|---|
| Grote Lijster `sp049` | 2/2 zelfde opname (r = 1,00) | Volwassen en juveniel juist | Juveniel stond als Flickr-naam "treehouse1977"; nu "Jim Champion from Southampton, UK" (Commons) | Ontbreekt; Commons-zoektocht zonder kandidaat | Rapport 2025: bij de soorten met de laagste index |
| Roodborst `sp050` | 3/3 (r ≥ 0,999) | Volwassen en juveniel juist; opvliegfoto blijft buiten de vluchtrol | Opvliegfoto-auteur gelijk aan Commons gemaakt | Ontbreekt; kandidaten waren opvliegen met poten op een paal en een gevecht | Soortpagina niet bereikt: NOT TESTED |
| Zwarte Roodstaart `sp051` | 3/3 (r = 1,00) | Mannetje, vrouwtje en juveniel juist | Mannetje-auteur gelijk aan Commons gemaakt | Ontbreekt; enige kandidaat 291 px en onscherp | 14.000–22.000 broedparen (2018–2020), sinds 1990 geen significante verandering |

**Lookalikes:** LK-019 heeft nu ook Grote Lijster als focus; nieuw zijn LK-023 Roodborst–Roodborsttapuit en LK-024 Zwarte–Gekraagde Roodstaart. Alle drie zijn bestaande fotoparen, in beide richtingen getest.

**Geluid:** geen opnamen; BLOCKED. Volgens protocol v0.2 is er geen betrouwbare automatische route. **eBird:** niet geraadpleegd (NOT TESTED). **ANWB-gids:** niet beschikbaar (NOT TESTED).

**Tests (lokaal):** alle `tests/*.mjs` behalve `test_photo_feedback.mjs` (lokaal geen `sharp`); Python-set; Chromium R13/R14-lookalike, audiostatus, soortaudit. CI: zie PR #276. Toestel en preview: NOT TESTED / BLOCKED.

**Volgende veilige stap:** F3-R15 — Roodborsttapuit (`sp053`), Heggenmus (`sp054`), Winterkoning (`sp055`). (`sp052` staat niet in de open F3-reeks.)
