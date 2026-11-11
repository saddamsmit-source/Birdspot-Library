# Birdspot Library — releasebewijs en terugvalplan 1.27.0

**Status:** RELEASE CANDIDATE / REVIEW REQUIRED. Dit document is een controlelijst en bewijsregister, **geen** productie-PASS.
**Opgesteld:** 11 november 2026, ChatGPT (overnamecontrole op eigen QA-branch).
**Releasebron:** PR [#128](https://github.com/saddamsmit-source/Birdspot-Library/pull/128), `release/birdspot-1.27.0`, uitgangscommit `9d4b727698ede7237ba4c2607fb62e3c1155d384`.
**Huidige vrijgegeven `main`:** `5bf67043e830e977749f0ee593cf9f41f0e2822b` (1.14.0).
**Huidige Pages-reviewbron:** `preview/birdspot-review`, `659cbb8bc3c4c54a7d6ae7a5fe499319de309d88` bij laatste controle.
**QA-aanvulling:** `.github/workflows/release-upgrade-qa.yml` op branch `qa/release-1.27-upgrade-gates-20261111`. De definitieve kandidaat-SHA moet opnieuw worden vastgelegd zodra deze QA-PR is geïntegreerd.

## 1. Scope en risico

De kandidaat combineert de bestaande onafhankelijke GitHub-overdrachten: fotoverificatie, K7-profiel, sorteeraanpassingen, nieuwe foto- en vluchtrollen, kennisprofielen (23 van 597), de M1/M2-beeldinspectie (23 van 134 gefotografeerde soorten), de Birdspot-kwaliteitsnorm, README en serviceworker-upgradefix. Broncodegeschiedenis en tracker blijven op GitHub. Niet alle oude open PR's mogen afzonderlijk opnieuw worden gemerged.

**Expliciet nog geen inhoudelijke FINAL:** 111 gefotografeerde soorten hebben geen nieuwe afzonderlijke soortaudit; 463 soorten hebben nog geen gidsfoto; alle 23 kennisprofielen bevatten open punten. Fotomedia/geslacht/leeftijd worden niet als volledig ornithologisch gecertificeerd geclaimd.

**Hoofdrisico:** de overgang vanaf de oude actieve service worker van 1.14.0 naar 1.27.0 kon oude en nieuwe JavaScript-modules mengen, met een kapotte start. De kandidaat bevat een aangepaste `sw.js` en een browsergebaseerde upgradeproef. Deze proef moet met een echte oude worker op dezelfde origin aantoonbaar slagen vóór livegang.

## 2. Bewijsregister — per concrete kandidaat-SHA aanvullen

| Gate | Verwacht scenario | Status bij aanmaken QA-PR | Concreet bewijs nodig |
|---|---|---|---|
| G01 GitHub regressie | Bestaande 14 PR-workflows op kandidaat | **VERIFIED** op `9d4b727` (14/14), opnieuw draaien na integratie | GitHub Actions per nieuwe SHA |
| G02 RU 1.14.0 | Echt upgraden vanaf `5bf6704` op dezelfde origin (RU-01..07) | **NOT TESTED in CI** op release-SHA | Nieuwe workflow `Birdspot Release Upgrade Gate` + log-artifact |
| G03 RU Pages | Echt upgraden vanaf de oude Pages-review-SHA `659cbb8` | **NOT TESTED in CI** op release-SHA | Tweede baseline in dezelfde matrix |
| G04 Gebruikersdata | localStorage, onbekende velden, IndexedDB/blobs byte-gelijk, waarnemingen terugvindbaar | **NOT TESTED in nieuwe QA-CI**, maakt deel uit van RU-test | Logs RU-03..05 plus eventueel backup/herstelproef |
| G05 Offline | Serviceworker update, offline herstart, gidsfoto geladen; media-cache behouden | **NOT TESTED in nieuwe QA-CI**, RU-06 dekt een beperkte browserroute | RU-06 en aparte offline-/back-upcontroles |
| G06 Backup/herstel | Export, verwijderen op testprofiel, herstel en gebundelde media; corrupt bestand | **NOT TESTED als releasebrede proef** | Reproduceerbare browser-run met geldige, oude en ongeldige export |
| G07 Privacy en rechten | Publieke build geen secrets/private locatie, assets bron/licentie/credits | **PARTIALLY TESTED** in eerdere media-audits; productie-eindcontrole ontbreekt | Public review van buildbestanden en rechtenregister |
| G08 Compatibiliteit toestel | Eigenaar Android/telefoon, Browser Terug, camera/mediadelen, installatie | **NOT TESTED — REAL DEVICE REQUIRED** | Fysieke toestelrapportage; geen CI-vervanging |
| G09 Publieke publicatie | Pages toont exact kandidaat-SHA en primaire routes op HTTPS | **NOT TESTED** voor 1.27.0 | Pages workflow/deploy + daadwerkelijke openbare smoke test |
| G10 Officiële host | Productiehost, domein, privacy/verantwoordelijkheid en terugval vastgesteld | **BLOCKED — host niet formeel vastgesteld** | Bewuste hostkeuze; Vercel bewust uit |

**Claimgrens:** een groene bestaande 14/14-run is niet het bewijs van RU-01..07. Een lokale test is niet automatisch een CI-run. Een Pages-review is nog geen officiële productie-PASS.

## 2A. Geobserveerde CI-uitkomst — 11 november 2026

**VERIFIED voor RU-01..RU-07 op de QA-kandidaat:** GitHub Actions-run [#43028619333](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43028619333), head `3272db72e5366b7023e9a7999425ccae6e2ff5bf` (PR #129, met **ongewijzigde 1.27.0-appcode** van `9d4b727`). Beide matrixjobs geslaagd; logs rechtstreeks door ChatGPT gelezen:

| Upgradebasis | Geobserveerde bewijzen | Status |
|---|---|---|
| `5bf6704` / 1.14.0 | RU-01 seed 7 localStorage-sleutels en 1 IndexedDB-blob; RU-02 1.27.0 actief na één herlaadbeurt, daarna drie foutvrije herlaadbeurten; RU-03 zes gebruikerssleutels byte-gelijk; RU-04 blob en extra velden gelijk; RU-05 waarneming via profiel en soortkaart; RU-06 offline kaart+foto; RU-07 geen paginafouten | **VERIFIED / PASS in Chromium CI** |
| `659cbb8` / 1.21.0-review | Zelfde beproevingen; RU-02 gebruikte de bestaande updateknop en schakelde na twee herlaadbeurten door naar 1.27.0; drie extra herlaadbeurten foutvrij | **VERIFIED / PASS in Chromium CI** |

De afzonderlijke push-run [#43028561824](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43028561824) herhaalde beide tests met dezelfde positieve uitkomst. Dit bewijs geldt voor de op de QA-branch geteste **1.27.0-code**, niet voor een al gepubliceerde website.

**Statusupdate op G02–G05:** G02 en G03 zijn **VERIFIED** (CI, beide baselines). G04 is **PARTIALLY TESTED** (de beschreven voorbeeld-LocalStorage- en één IndexedDB-blob, **niet** een volledige export/herstelmatrix). G05 is **PARTIALLY TESTED** (offline herstart en één gidsfoto in Chromium, **niet** op een fysiek toestel of alle mediasoorten). G06–G10 blijven conform de open gate-matrix hierboven. Een full release-PASS wordt hier nadrukkelijk niet geclaimd.

## 2B. Geobserveerde back-up/hersteltest — 11 november 2026

**VERIFIED voor de uitgevoerde BR-01..BR-07-scenario's:** [CI-run #43029814713](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43029814713), kandidaat `9c43379a16957d76684fe8e253459ec0c87fe14f` met ongewijzigde 1.27.0-appcode. GitHub-logs rechtstreeks gelezen; de nieuwe `tests/test_release_backup_roundtrip.py` liep via de echte profiel-UI in Chromium (fictieve data, geïsoleerd testprofiel).

- BR-01/02: eigen waarneming met onbekend veld, locatie en gekoppelde IndexedDB-foto werd geëxporteerd naar geldig ZIP; byte-inhoud van de foto en referenties gecontroleerd.
- BR-03: corrupte ZIP geweigerd zonder data te wijzigen en handmatig geannuleerde valide import eveneens zonder mutatie.
- BR-04: herimport via de UI gaf waarneming, onbekend veld, locatie, metadata en **exacte foto-bytes** terug.
- BR-05: dezelfde ZIP opnieuw importeren veroorzaakte geen dubbel waarnemingsrecord.
- BR-06: de veiligheidskopie zette het testprofiel terug naar de toestand vóór de import en verwijderde importmedia.
- BR-07: geen browserpaginafouten. Daarnaast slaagde de bestaande `tests/test_profile_backup.py` (B-01..06).

**Statusupdate G06:** `PARTIALLY TESTED` wordt gehandhaafd ondanks **BR-01..BR-07 PASS**, omdat oudere externe back-upformaten, alle mediavarianten, storage failure-injectie en echte toestellen nog niet afzonderlijk zijn getest. Het bewijs toont de huidige export/import-/rollbackroute, niet iedere mogelijke migratie. De beide RU-upgradematrixjobs bleven op deze code-SHA eveneens geslaagd.

## 3. Upgradeproef RU-01 t/m RU-07

De toegevoegde workflow gebruikt `actions/checkout@v4` met `fetch-depth: 0`; de test archiveert **exact** de oude commit en serveert daarna de kandidaat vanaf hetzelfde lokale adres met een echt geregistreerde service worker. Bij elke baseline draait een geïsoleerde Playwright Chromium-context met fictieve waarnemingen, onbekende sleutels/velden en een fotoblob.

- **RU-01:** oude app start en bewaart representatieve localStorage/IndexedDB.
- **RU-02:** nieuwe versie en service worker activeren zonder oude modulemix.
- **RU-03:** bestaande lokale sleutels en onbekende velden behouden.
- **RU-04:** IndexedDB-foto, metadata en blobinhoud blijven gelijk.
- **RU-05:** bestaande waarneming terugzien in profiel/soortkaart.
- **RU-06:** offline herstart, gidskaart en foto werken.
- **RU-07:** geen onverwachte paginafouten.

Reproductie vanuit repo-root na volledige git-fetch:
```bash
python -m pip install -r tests/requirements.txt
python -m playwright install --with-deps chromium
python tests/test_release_upgrade.py --base 5bf67043e830e977749f0ee593cf9f41f0e2822b
python tests/test_release_upgrade.py --base 659cbb8bc3c4c54a7d6ae7a5fe499319de309d88
```
De GitHub-matrix voert beide proeven afzonderlijk uit en bewaart logs, óók wanneer een controle faalt. Draai geen tests tegen echte persoonlijke gegevens of op productie.

## 4. Veilig publicatiepad

1. Controleer actuele `main`/`preview`/PR #128 HEAD, basis, reviewer, andere actieve writer en alle CI vóór integratie.
2. Integreer uitsluitend gecontroleerde aanvullingen op een reproduceerbare releasekandidaat; **één SHA voor alle releasegates**. Registreer alle afhankelijke PR's. Geen blind sluiten of mergen van de historische PR-backlog.
3. Draai bestaande regressie én de nieuwe RU-matrix, plus toepasselijke storage-backup/herstel-/privacy-/offlinecontroles. Elke ontbrekende gate blijft zichtbaar `NOT TESTED` of `BLOCKED`.
4. Publiceer de gecontroleerde kandidaat via de bestaande `preview/birdspot-review` → GitHub Pages-route, met alleen fictieve testdata. Bevestig deployment-SHA en test de URL https://saddamsmit-source.github.io/Birdspot-Library/ in een frisse sessie.
5. Merge naar `main` en verklaar officiële productie-livegang **alleen wanneer** de toepasselijke productiecriteria zijn voldaan. Eigenaar gaf live-GO op 10 november 2026, **geen vrijstelling van gates**. De huidige Pages-branchbron wordt niet vanzelf `main`.
6. Neem na deployment een nieuw manifest met finale SHA, status, URL, release- en testbewijzen op. Laat open inhoudspunten en toestelstatus expliciet staan.

## 5. Terugval zonder dataverlies

- **Herleidbare codebasis:** voormalige productiecommit `5bf67043`, laatst bevestigde Pages-review `659cbb8`, kandidaat `9d4b727`. Controleer de werkelijk uitgegeven SHA direct vóór rollback.
- **Rollback code:** herstel uitsluitend de vorige geteste **code** via een controleerbare revert-PR/deployment. Gebruik nooit `git push --force` of het verwijderen van gebruikersdata.
- **Gebruikersdata:** localStorage/IndexedDB blijven op het toestel; wis nooit origin-data, browseropslag of permanente `birdspot-media` cache om een UI-probleem op te lossen. Een code-rollback kan onveilig zijn bij toekomstige schemamigraties; bewijs vooraf op een geïsoleerde kopie dat oude code de nieuwere gebruikersdata veilig kan openen.
- **Service worker:** test oude/nieuwe worker en cache-activatie na rollback afzonderlijk; code op server terugzetten is niet automatisch een herstel van de actieve client-worker.
- **Fout na release:** zet verdere promotie stil, bewaar deployment- en browserlogs, identificeer betrokken SHA en voer een reproduceerbare rollbackproef uit op testdata vóór hersteladvies aan echte gebruikers.
- **Controle na herstel:** app start, waarnemingen/plaatsen/fotoblobs behouden, terugnavigatie, nieuwe opslag en offline herstart; registreer nog open bevindingen.

## 6. Open releasebesluiten

- Productiehost versus publieke reviewhost nog niet formeel vastgelegd; Vercel is bewust gedeactiveerd voor ontwikkeling.
- Fysiek Android-/iOS-toestel niet getest.
- Nog niet alle vogelsoorten/fotoposities inhoudelijk geverifieerd. Dat verhindert een claim over complete gidsdekking, ook als een tussenrelease van de app na gates wel wordt vrijgegeven.
- De eigenaar kan de site beoordelen op de preview-URL. **Een werkende preview bevestigt niet de complete releasegate.**

**Documentbeheer:** bijgehouden als DRAFT/REVIEW in een eigen QA-PR. Na feitelijke CI/deployment moeten statussen en exacte finale SHA's worden bijgewerkt; dit document is geen zelfstandige releaseautorisatie.
