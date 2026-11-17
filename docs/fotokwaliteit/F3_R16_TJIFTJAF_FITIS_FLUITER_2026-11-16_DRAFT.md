# Birdspot F3-R16 — Tjiftjaf, Fitis, Fluiter

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r16-media-tjiftjaf-fitis-fluiter-20261116` · **PR:** #280 · **Base:** PR #278 @ `6cc6fa00`
**Parallel spoor:** PR #279 (PWA-iconen, ChatGPT, claim VRIJGEGEVEN) niet aangeraakt; `sw.js` bewust ongewijzigd om een versieconflict te voorkomen.

## Bronnen (16-11-2026)

| Bron | Status |
|---|---|
| Vogelbescherming | Tjiftjaf, Fitis, Fluiter gelezen |
| Sovon | 13110, 13120, 13080 gelezen |
| Commons | origcheck 5 foto's + 4 opnamen (metadata); discover vlucht/juveniel |
| Blasco-Zumeta & Heinze | NIET geopend: de PDF-aanvragen vroegen eigenaargoedkeuring terwijl de eigenaar afwezig was; niet herhaald |
| eBird | BLOCKED (botcontrole, R15); niet opnieuw geprobeerd om dezelfde reden |
| ANWB-vogelgids | NOT TESTED |

## Uitkomst

| Soort | Foto's | Geluid | Gecorrigeerd / toegevoegd | Open |
|---|---|---|---|---|
| Tjiftjaf `sp056` | 2/2 zelfde opname; rechten gelijk | zang + roep: rechten VERIFIED, soort/type alleen bronlabel | Sovon als bron bij trend | vlucht, juveniel; biometrie 1 uitgever |
| Fitis `sp057` | 1/1; rechten gelijk | idem | Sovon als bron bij trend | juveniele kandidaat in review; vlucht; biometrie |
| Fluiter `sp058` | 2/2 (fladderfoto uitsnede r = 0,777, visueel gelijk; blijft buiten vluchtrol) | geen | **nieuw kennisprofiel** (VBN + Sovon, niets doorslaggevend) | 3 bronverschillen (lengte, maanden, "afnemend"); vlucht, juveniel, geluid |

**Dubbelgangers:** LK-030 Tjiftjaf–Fitis, LK-031 Fitis–Fluiter, LK-032 Tjiftjaf–Fluiter; bestaande vergelijkingsteksten kloppen met Vogelbescherming; Chromium beide richtingen.

**Tooling:** `orig_check.py` kan nu opnamen meenemen (alleen herkomst en rechten, nooit soortbewijs); test uitgebreid. M20-guard versmald: een kennisprofiel mag alleen bestaan na F3-review (negatieve test faalt correct).

**R15-QA:** status Roodborsttapuit en trends Heggenmus/Winterkoning uitgewerkt in het [openpuntenregister](F2_OPEN_PUNTEN_REGISTER_2026-11-14.md); statuscorrectie voorgesteld, niet toegepast.

**Volgende veilige stap:** F3-R17 — Zwartkop (`sp059`), Tuinfluiter (`sp060`), Grasmus (`sp061`).
