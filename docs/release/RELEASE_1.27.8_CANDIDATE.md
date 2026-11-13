# Birdspot Library · 1.27.8 gecombineerde releasekandidaat

**Datum:** 13 november 2026  
**Doel:** de laatste bestaande app- en gidswerkzaamheden als één bronvaste, testbare kandidaat voorbereiden voor gecontroleerde review en daarna eventuele productie.  
**Status:** CANDIDATE / DRAFT — PRE-RELEASE BLOCKED; geen publicatie of versie-PASS uit documentatie alleen.  
**Eigenaarbesluit:** gebruiker heeft op 13 november 2026 expliciet **"Zet live en ga verder"** gegeven. Dit vervult owner-autorisatie maar heft bestaande technische, privacy-, rechten- en herstelgates niet op.

## 1. Reconciliatie en betrokken omgevingen

| Doel | SHA/versie bij preflight | Status |
|---|---|---|
| Productiebranch `main` | `5bf67043e830e977749f0ee593cf9f41f0e2822b` · 1.14.0 | Ongewijzigd; production live-HTTP direct niet onafhankelijk bereikbaar via controletool |
| Publieke reviewbron `preview/birdspot-review` | `21ce9060f789103cfbba98fa78f6b53f4b9cea5b` · 1.27.6 | Ongewijzigd; publieke URL direct niet onafhankelijk geopend |
| Laatste QA-/gidsbranch | PR #182, `965f1d37bd05856ae5bb99c1fdeab604137de7ca` · 1.27.7 | 18/18 GitHub-workflows SUCCESS op exact deze SHA; concept, niet gemerged |
| Nieuwe kandidaat | `qa/birdspot-release-candidate-1.27.8-20261113` | Eigen branch en PR; finale HEAD en tests pas na de laatste write als voltooid rapporteren |

**Integriteit:** GitHub compare `preview/birdspot-review` → PR #182 toont 107 opeenvolgende commits met zero behind. PR #171 1.27.7 is een voorouder van #182 (70 commits vooruit). Geen rebase of force-push op bestaande branches. Oorspronkelijke media, user-data en bron-/soortaudit blijven intact.

## 2. Kleinste noodzakelijke releaseaanpassing

- `sw.js`: alleen `APP_VERSION` **1.27.7 → 1.27.8** om een nieuwe PWA-cache-identiteit voor de na 1.27.7 gewijzigde gidsinformatie af te dwingen. De bestaande 1.27.6-review blijft als upgradebron volledig behouden.
- `tests/test_release_upgrade.py`: RU-08 blijft voortaan voor alle versies **vanaf 1.27.7** gelden. Deze test bewaakt bestaande lokale opslag- en fotobytes, offline-heropenen en twee toegevoegde media plus twee modules tegen stale-cache. De poort wordt dus niet meer onbedoeld overgeslagen wanneer het versienummer verandert.
- `README.md`: eigenaarautorisatie en ontbrekende gates expliciet geregistreerd. Geen nieuwe dependency/backend, geen gewijzigde mediabytes, geen verandering aan dataformaten of opslagkeys.
- Geen deployment totdat de relevante releasegates PASS zijn.

## 3. Releasematrix — vereiste bewijsvoering

| Gate | Vereiste proef en onafhankelijkheid | Status bij start |
|---|---|---|
| Integreer één SHA, actuele basis en actieve writer | GitHub PR-base/head/checks; alleen deze kandidaatbranch schrijven | PARTIALLY TESTED (basis bekend, actieve externe schrijver niet onafhankelijk observeerbaar) |
| CI, kennis, foto’s, media en UX | Eén definitieve SHA met alle relevante workflows completed/success en zero pending | NOT TESTED op nieuwe kandidaat |
| Gebruikersdata behouden | RU-01..08 op echte serviceworker-upgrade 1.14/1.27.5/1.27.6 → 1.27.8, LS en IDB/ZIP plus offline nieuwe invoer | NOT TESTED op nieuwe kandidaat |
| Eigenlijke toestelpraktijk | Fysieke Android PWA: install/open, camera/bestand, GPS-denied/allowed, Opslaan/heropenen, Back, offline nieuwe invoer, update naar 1.27.8 | NOT TESTED; deze chat heeft geen toegang tot het fysieke toestel |
| Herstel over apparaatgrens | ZIP-back-up en herstel met foto op tweede schoon toestel en stop/herstel bij fout | NOT TESTED; gescheiden browsercontext = simulatie, geen tweede toestel |
| Beeldrechten/content | Oorspronkelijk bestand/licentie per gidsfoto, credit/afgeleiden, leeftijd/geslacht en herkenningsclaims; openbare herpublicatie toegestaan | PARTIALLY TESTED; F1 117/140, 23 open; F2 van alle 140 open |
| Hosting/privacy/operations | Vercel/Pages providerconfig, omgevingsregels/secrets, directe URL, HTTPS, commerciële voorwaarden, actuele Usage/cost stop, rollback | PARTIALLY TESTED/UNKNOWN; directe HTTP niet bevestigd |
| Preview-/productiepublicatie | Bovenstaande gates, bruikbaar reviewbeeld, owner `live`, geobserveerde deploy, postrelease browser en versie | **BLOCKED** tot gates zijn voldaan |

**Geautoriseerde maar nog niet uitgevoerde acties:** `main`/productie deploy en openbare review-branch vervangen. Veiligheidsgrens: geen directe push naar `main`, geen automatische of experimentele merge, geen force-push, geen stilzwijgende aanname dat fysieke-toesteltests of bronrechten door groene CI zijn bewezen.

## 4. Rollback, gegevens en signalen

- **Laatste bewezen codebasis:** publieke review 1.27.6 op `21ce9060`; productiebranch op `5bf67043`. Nieuwe kandidaat mag gesloten worden zonder een bestaande branch te veranderen.
- **Bij latere echte rollback:** een **nieuwe** cache-identiteit gebruiken om SW-updatecorrectheid te behouden; rechtstreeks terugzetten van oude code met identieke cachekey kan oude modules/serverassets mengen. Code-rollback herstelt geen verdwenen privéwaarnemingen.
- **Privégegevens:** waarnemingen, localStorage/IndexedDB en back-ups zijn eigendom van de gebruiker; nooit wissen om het updaten te forceren. Alleen synthetische fixtures in CI.
- **SIGNAAL:** 107 commits achter openbare review, fysieke toestel-/bronrechten niet bewezen, externe URL niet betrouwbaar bereikbaar → **RISICO:** user-data verlies, nieuwe versie niet installeerbaar of onrechtmatige publieke gidsbeelden → **MAATREGEL:** kandidaat geïsoleerd, upgradeproeven, rechts-/toestelgate expliciet blokkeren → **CHECKPOINT:** PR #182 `965f1d37` en publieke review `21ce9060`, beide onaangeroerd.

## 5. Kennisdelta en vervolg

**WEL:** bij elke media- of gidswijziging die een bestaande PWA-cache kan raken een **nieuwe unieke versie** en echte upgradeproef vanaf de laatst publiek gebruikte versie; inspecteer IDB/LS en offline media/JS-bytes op één SHA. **NIET:** groene losse foto-PR’s als release-PASS rekenen, of een `if version == 1.27.7`-test onbedoeld laten verdwijnen bij de volgende cachebump. Hergebruik Handbook L-026/L-027/L-068/L-069 en Birdspot-norm; geen tweede regelboek.

**Volgorde:** gates/proef kandidaat; alleen na PASS release via review/preview en productie met rollbackbewaking. F1 wordt los, in maximaal 3 soorten per batch, vervolgd totdat 140/140 eerste beoordelingen zijn gemaakt; pas dan volledige F2-herverificatie van alle 140. Geen nieuwe soorten buiten deze groep in F1.

**Actualiteit:** release/README moeten na een echte merge en geobserveerde deploy opnieuw worden bijgewerkt. Dit bestand alleen is geen bewijs van publicatie of synchronisatie.
