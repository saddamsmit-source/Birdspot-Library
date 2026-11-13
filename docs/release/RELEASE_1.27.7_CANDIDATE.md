# Birdspot 1.27.7 — geïsoleerde releasekandidaat (NIET PUBLICEREN)

**Datum:** 13 november 2026 · **Status:** CANDIDATE / DRAFT / RELEASEGATE BLOCKED · **Fase:** S1 eigen praktijkpilot.

## A. Doel en bevroren input

Dezelfde appcode, inhoud en binaire gidsbeelden blijven behouden uit PR #170, `f67338c00e0b2fc02414afc3566563ab2862c5bd`. Deze kandidaat verandert voor runtime uitsluitend `sw.js`: `APP_VERSION` van **1.27.6** naar **1.27.7**. Verder worden testcode, testmatrix, app-README en release-notities aangepast; géén vogelidentiteit of persoonlijk opslagrecord wordt gewijzigd.

**Eerdere gepubliceerde reviewbron** (uitgangspunt voor update): `preview/birdspot-review` `21ce9060f789103cfbba98fa78f6b53f4b9cea5b` met `APP_VERSION = '1.27.6'`. **main:** `5bf67043e830e977749f0ee593cf9f41f0e2822b` (`1.14.0-map-k5-links`). Beide branches **niet overschrijven**.

## B. Releaseblokker uit integratieaudit en oplossing in deze kandidaat

`docs/release/BIRDSPOT_R5_INTEGRATIEAUDIT_2026-11-13_DRAFT.md` beschrijft C-01: verschillende gidsmedia en modules met gelijk gebleven `APP_VERSION 1.27.6`, waardoor oude serviceworker-caches op een geïnstalleerde PWA niet betrouwbaar vernieuwen. **Voor deze niet-gepubliceerde kandidaat** is de cache-key nu uniek: `birdspot-app-v1.27.7`. Dit lost de versie-identiteit op papier/code op; **niet** zonder de onderstaande echte tests.

**Nieuw testbewijs vereist op exact dezelfde HEAD:**
- `tests/test_release_upgrade.py` gebruikt de échte oude serviceworker op dezelfde lokale HTTP-origin, wisselt serverbron en wacht op de nieuwe registratie/activatie. RU-01..07 controleren localStorage (incl. onbekende sleutels/velden), IndexedDB-fotobytes, zichtbaar terugvinden en offline-opstart na de update.
- **RU-08 (nieuw):** twee afbeeldingen die nog niet in de 1.27.6-review zaten (`/assets/species/plumage/sp082-portrait.webp`, `/assets/species/plumage/sp084-juv-europa.webp`) moeten op de nieuwe versie uit de mediacache decodeerbaar zijn terwijl het netwerk uit staat. `speciesKnowledge.js` en `guideMedia.js` moeten offline byte-identiek zijn aan de nieuwe kandidaat; een oude module wordt geweigerd.
- Testmatrix: oude `main` 1.14.0, review 1.27.5 en direct de review 1.27.6. De **1.27.6 → 1.27.7**-route is beslissend voor blokkade C-01.
- De bestaande offline-nieuwe-waarneming, ZIP-herstel, nav-back, foto-, vlucht-, bron-, kennis- en soorttests worden op deze HEAD in CI uitgevoerd waar getriggerd.

## C. Nog openstaande releasegates (NO-GO tot onafhankelijk bewijs)

| Gate | Status vóór nieuwe CI | Voorwaarde |
|---|---|---|
| Enige gedeelde reviewhistorie | PASS — read-only Git-ancestry op oudercheckpoint | Head/base na alle writes herbevestigen |
| Nieuwe `APP_VERSION` | Code aangepast; **nieuwe CI nog NOT TESTED** | CI/SW check op exacte kandidaat-SHA |
| RU-01..08 vanaf 1.27.6 | **NOT TESTED op deze kandidaat** | Echte Chromium-PWA-upgrade, offline nieuw beeld en exact nieuwe modules |
| ZIP/offline nieuwe waarneming/terug | Oude CI PASS op PR #168; nieuw SHA te toetsen | PILOT-01..04 en BR-01..07 + navigatie op releasekandidaat |
| Andere gids-/bronregressies | Oudere SHAs geslaagd | CI op nieuwe SHA, bewijs apart bewaren |
| Fysieke Android en tweede-toestelrestore | NOT TESTED | Pilot AND-01..09 uit PR #169, privé bewijs, onafhankelijk beoordelen |
| Productie-/privacyscan/hosting/gebruikskosten | PARTIALLY TESTED/UNKNOWN | Credentials/gegevens/licenties, kosten/stoplimieten, herstel |
| Previewdeploy, merge en live | **BLOCKED** | Afzonderlijk eigenaarbesluit na toepasselijke gates |

**NIET doen:** automatisch mergen, `preview/birdspot-review` bijwerken, Vercel aanzetten, appgegevens verwijderen, in productie publiceren of een foto zonder licentie opnieuw importeren.

## D. Rollback en data-integriteit

1. **Code:** de nieuwe testbranch/PR bij afkeuring sluiten; basis PR #170 `f67338c0` behouden. Gepubliceerde reviewbranch blijft `21ce9060`. Alleen bij latere echte release: altijd eigen nieuwe cacheversie voor eventuele rollback.
2. **Persoonlijke data:** lokale IndexedDB en localStorage nooit verwijderen tijdens een code-rollback. ZIP-back-up is een apart, expliciet geteste herstelroute.
3. **Media:** originele binaire bestanden, bronregisters en fotoaudit ongemoeid; de test-PNG is synthetisch en wordt enkel in geïsoleerde browserstorage gemaakt.
4. **Onbekende actuele schrijvers:** geen writer op Claude-branche of main; enige writer van deze kandidaat is ChatGPT op eigen branch. Bij HEAD-/CI-drift eerst opnieuw inspecteren.

## E. Kennis, kosten en onafhankelijkheidsgrens

- **Bewezen ouder checkpoint:** PR #168 `12a985f34604e905c2199521736c5e1b1c5767f4` met 4/4 eigen QA-jobs PASS; PR #169 `c5d7c620` alleen Android-bewijsvalidator PASS.
- **Historische review:** 15 workflows PASS op `21ce9060`; dit telt niet als huidige release-PASS.
- **Nieuwe HEAD en CI:** wordt na de test exact toegevoegd; geen voorbarige SUCCESS-claim.
- **Kosten:** GitHub Actions/extra minuten onbekend (UNKNOWN), geen nieuwe betaalde dienst.
- **Learnings:** L-026/L-027/L-069, Handbook §3.6 en §4.11; niet dezelfde algemene regel opnieuw schrijven.
- **Onafhankelijkheid:** GitHub-CI en code-analyse toetsbaar, fysieke Android-, echte gebruikersdata- en onafhankelijke ornithologische review NIET TESTED. Documentstatus FINAL/DRAFT is nooit app-PASS.

**Besluit:** 1.27.7 is uitsluitend een niet-gepubliceerde releasekandidaat. Zonder alle vereiste gates: NO-GO.
