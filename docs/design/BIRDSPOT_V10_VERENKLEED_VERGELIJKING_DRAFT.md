# Birdspot · fotovergelijking Verenkleed — S1 UX-pilot R10

**Datum:** 13 november 2026 · **Status:** DRAFT / onafhankelijke QA nodig · **Fase:** S1, niet publiceren.

## Designbrief: kleinere nuttige kernverbetering

**Gebruiker:** vogelliefhebber die op mobiel naast de hoofdfoto het mannetje, vrouwtje, juveniel en waar toepasselijk het echte vluchtbeeld wil vergelijken.

**Probleem:** de bestaande verticale groep `Verenkleed` in `src/features/species/detailSections.js` / `styles/species.css` plaatst de kleedkaarten onder elkaar. Het oog moet heen en weer scrollen om kruin, snavel en kleed te vergelijken. De vergelijkingssectie **Lijkt op** tussen *verschillende soorten* is al functioneel; die is niet hetzelfde als kleedvergelijking binnen één soort en blijft behouden.

**Doel:** op een 360–430px telefoonscherm duidelijker **tegelijk** twee beschikbare, verschillende kleedfoto's kunnen zien. Houd labels, beschrijving en vergroting bereikbaar, bron/licentie/credits beschikbaar en de gebruiker weg van foutief gevulde rollen.

**Non-goals:** nieuwe vogelfoto's, AI-gegenereerde dieren, nieuw geslacht of juvenielenleeftijd afleiden, een geforceerde vluchtfoto, wijzigen van gidsbronnen, een heel nieuwe galerijrouter, accounts, backend, livegang. Een enkele foto/hero-verwijzing is géén twee-fotovergelijking.

## UX-scope en gemaakte keuzes

1. Behoud alle bestaande Birdspot-thema-tokens en de bestaande soortdetailtab `Herkenning`. Alleen wanneer **minstens twee afzonderlijke bestaande niet-vluchtfoto's** in de kleedgroepen staan, activeert de Verenkleed-lijst `data-layout="compare"`.
2. Toon dan de kleedrollen in **twee rustige kaarten naast elkaar**. Rolnaam bovenaan, foto direct daaronder, bijschrift/verschiltekst daarna. De foto's blijven zonder crop (`object-fit:contain`), bron-/licentie-info en fotozoom gebruiken dezelfde mechanismen.
3. Een soort met slechts één aanwezige kleedfoto en een hoofdfotoverwijzing houdt de **bestaande verticale weergave**. Voorbeeld Kleine Bonte Specht `sp017`: mannelijke hoofdfoto boven, vrouwelijk beeld onder Verenkleed, geen extra juveniel/echte vluchtclaim.
4. Zwarte Specht `sp018` is de **visuele proefsoort**: verschillende volwassen mannetjes-, vrouwtjes- en juveniel-kopdetailbeelden naast elkaar, de bestaande echte vluchtfoto in de afzonderlijke sectie In vlucht. Dit verandert **niet** de eerder voorwaardelijke foto-oordelen: vrouwtje perspectief/500px, juveniel enkel kopdetail en gedeeltelijk afgesneden vlucht.
5. Focus en bediening blijven toegankelijk via de **bestaande foto-knop**. Bij 360/390/430/1280 mag geen horizontale pagina-overloop ontstaan. Op iedere echte bronfoto blijft zoomen/sluiten mogelijk.
6. Geen tweede bronbestand, ontdubbeling via bron/afbeeldings-ID blijft conform `tests/test_guide_poses.mjs`. Het fotosjabloon verandert niet het aantal foto's, de brongegevens of soortdeterminatielabels.

## Capability fit, afhankelijkheid en risico

- **HERGEBRUIKEN:** bestaande `plumageCard`, `guidePlumageGroups`, `fieldPhoto`, fotozoom, broninformatie, CSS-variabelen en bestaande CI.
- **AANPASSEN:** alleen kleedlijst-layout en fotovolgorde voor vergelijkbare rolgroepen.
- **NIEUW:** één beperkte CSS-modus plus een Playwright-screenshottest op vier viewports.
- **NIET TOEPASSEN:** backend/native rewrite, nieuwe fotoimport, async media-generation.

**Risico's:** kleinere beeldweergave op smalle schermen (ondervangen met zoom en juiste foto zonder crop); lange onderschriften (tekst blijft leesbaar na beeld en breekt af zonder verborgen data); oude `APP_VERSION` 1.27.7 in onuitgebrachte featurebranch (bij latere release opnieuw unieke cacheversie en serviceworker-upgrade testen). Het is geen nieuw productie-/publiek checkpoint.

## Acceptatietests en statusgrens

- **Regels/bron:** Node `tests/test_guide_poses.mjs` controleert juiste role-conditional, 'foto eerst', vlucht en anti-duplicaat.
- **Browser/UX:** `tests/test_plumage_compare_layout.py` test op 360/390/430/1280: rolkaarten in dezelfde rij, twee CSS-gridkolommen, gedecodeerde echte lokale WebP's, geen dubbele foto, geen overflow, zoom opent/sluit, negatieve guard voor sp017. Screenshotevidence op 390px.
- **Bestaande regressie:** oude soort-, vlucht-, fotocredit- en navigatietests moeten bij PR-triggers doorgaan. Test vorm én bediening; GitHub-green is alleen het geteste Chromium-/codebewijs.
- **Fysiek toestel:** AND-01..09 uit PR #169 nog NOT TESTED; niet afleiden uit screenshots. Bij klachten over fotoverhouding eerst op echte mobiele weergave reproduceren.

**Herstel en bronbehoud:** alleen een aparte QA-/featurebranch bovenop PR #174, commit `e0908e7d659ac6053753320546ddd30f644c267f`. PR sluiten laat bestaande `main` (`5bf67043`), review (`21ce9060`) en releasekandidaat v1.27.7 (`83c11744`) onaangetast. Geen binaire vogelbeelden of bronregisters wijzigen, geen persoonlijk localStorage/IDB raakt de test.

**Kosten-/opschalingsregister:** bestaande GitHub Actions / Playwright, gratis/betaald afhankelijk van actuele accountquota; werkelijke minuten/kosten en stoplimieten UNKNOWN; bij limiet lokaal gericht testen, geen betaald plan of publicatie zonder eigenaarbesluit.

**Kennisdelta:** hergebruik Handbook §2.1–2.6, CAP-BIRD-012/015 en L-019/L-062. Nieuw productdetail in app-PR, géén extra algemene norm. Document-DRAFT ≠ app-PASS of publieke release.
