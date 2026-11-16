# Birdspot F3-R13 — Zanglijster, Kramsvogel, Koperwiek

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r13-media-zanglijster-kramsvogel-koperwiek-20261116` · **PR:** #274 · **Base:** PR #273 @ `23d53539`

| Soort | Bronbeeld (origcheck) | Rollen en vlucht | Media-onderzoek | Geluid |
|---|---|---|---|---|
| Zanglijster `sp046` | 3/3 zelfde opname (r = 1,00) | Volwassen, juveniel en vrije vlucht kloppen | Juveniel-auteur gelijkgetrokken met Commons | Geen opname; BLOCKED |
| Kramsvogel `sp047` | 2 × r = 1,00; vlucht diepe uitsnede (r 0,49), zij-aan-zij dezelfde opname | Alle drie kloppen; vrije vlucht tussen kale takken | Juveniel-auteur gelijkgetrokken met Commons | Geen opname; BLOCKED |
| Koperwiek `sp048` | 2 × r ≥ 0,99; opvliegfoto diepe uitsnede, dezelfde opname | Volwassen en juveniel kloppen; opvliegfoto blijft buiten de vluchtrol | Commons-zoektocht vrije vlucht: geen bruikbare kandidaat; niets verzonnen | Geen opname; BLOCKED |

**Lookalikes:** LK-019 Zanglijster–Grote Lijster, LK-020 Koperwiek–Zanglijster, LK-021 Kramsvogel–Koperwiek, LK-022 Zanglijster–Kramsvogel. Alle vier zijn bestaande fotoparen, nu geregistreerd en in beide richtingen getest.

**Geluid:** de audiocheck gaf in F3-R12b voor lijsters geen betrouwbare aanwijzing (validatie 0,60). Er is daarom geen geluidsroute en er is niets gepubliceerd.

**Tests (lokaal):** alle `tests/*.mjs` behalve `test_photo_feedback.mjs` (lokaal geen `sharp`); Python-set; Chromium R12/R13-lookalike, audiostatus, soortaudit. CI: zie PR #274. Toestel en preview: NOT TESTED / BLOCKED.

**Volgende veilige stap:** F3-R14 — Grote Lijster (`sp049`), Roodborst (`sp050`), Zwarte Roodstaart (`sp051`).
