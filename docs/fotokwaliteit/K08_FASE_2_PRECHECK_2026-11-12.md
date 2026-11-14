# Birdspot · K08 fase 2 — precheck bestaande spechten

Datum: 12 november 2026 · Basis: PR #162, commit `8bde1236d54a3d4545d01d6e93c7071614fca350`
Status: PRECHECK / PARTIALLY TESTED — geen afgeronde soortaudit, geen nieuw beeld of release.

## Vervolgvolgorde

| Soort | Bestaand in het gidsregister | Volgende visuele en inhoudelijke controle |
|---|---|---|
| Kleine Bonte Specht (`sp017`) | Hoofdfoto, expliciete vrouwtjesfoto en opname bij nestholte die bewust **niet** als vrije vlucht is gelabeld. Mannetje gebruikt hoofdbeeldverwijzing. | Beoordeel kwaliteit van hoofdbeeld, controleer taxon/geslacht/kleed, zoek onafhankelijk bewijs voor ontbrekende juveniel en echte vrije vlucht. Vergelijk met middelste en grote bonte specht. |
| Zwarte Specht (`sp018`) | Hoofdfoto, vrouwtje, juveniel en een als vlucht gelabelde opname. | Controleer elke daadwerkelijke afbeelding, vooral rode koptekening, de vluchtstatus, bronbestand/licentie en vergelijking met andere spechten. |
| Groene Specht (`sp019`) | Hoofdfoto, vrouwtje, juveniel en een als vlucht gelabeld vrouwtje. | Controleer kwaliteit, rode versus zwarte baardstreep, sterk gevlekt juvenielkleed en vrije vlucht; kijk of alle kaarten elk beeld maximaal één keer tonen. |

Vogelbescherming Nederland beschrijft bij de Groene Specht de rode tekening onder het oog van het mannetje tegenover de zwarte tekening van het vrouwtje en het sterk gevlekte juvenielkleed. Dit is een controlepunt, geen zelfstandige verificatie van de specifieke foto’s. Bron: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groene-specht

## Gerichte metadatafix op afzonderlijke QA-branch

- Eén foto van het vrouwtje Groene Specht (`sp019-female-ground.webp`) stond zowel als `plumage.adult_f` als los `poses`-item geregistreerd met dezelfde Commons-bron.
- Het dubbele `poses`-item is verwijderd; het label ‘Op de grond’ en de bijbehorende uitleg zijn behouden bij `adult_f`.
- Het originele bestand, de bron, fotograaf en licentie blijven ongewijzigd.
- Een regressieassertie in `tests/test_guide_poses.mjs` controleert de actieve metadata op exact gelijke bestands- en bronverwijzingen. Dit vangt **geen** visueel vrijwel identieke verschillende opnamen op. De UI had al eigen deduplicatie.
- Geen soort is door deze metadatafix op VERIFIED gezet. De tracker blijft 98/140 gecontroleerd; 42 open.

## Bewijs en grenzen

Code-/bronmetadata-read op PR #162: VERIFIED. Invariantcontrole vóór de write in de gekoppelde GitHub-omgeving: VERIFIED. Lokale Node-suite in de runtime: NOT TESTED (repository niet lokaal beschikbaar). GitHub CI na commit: afzonderlijk controleren. Echte foto-inspectie, Android en onafhankelijke biologische determinatie voor deze drie soorten: NOT TESTED.

Volgende bouwronde: voltooi de drie soortaudits op een eigen featurebranch met visuele inspectie, rechten- en herkomstdossier, kennisprofielen, bronverschillen, foto-rollen, screenshots, offlinecontrole en exact uitvoerbare tests; maak pas na bewijs een nieuwe tellerstand. Claude is de voorkeursbouwer voor de volledige media-/kennisbatch, ChatGPT verricht onafhankelijke eindreview.
