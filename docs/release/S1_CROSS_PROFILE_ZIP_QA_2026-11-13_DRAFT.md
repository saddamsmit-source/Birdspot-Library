# Birdspot S1 · ZIP-herstel over twee gescheiden browserprofielen — QA ronde 7

**Datum:** 13 november 2026 · **Status:** DRAFT / AUTOMATED CHROMIUM VERIFIED · **Fysieke Android-apparaten:** NOT TESTED.  
**Base:** PR #171 `83c117447126b705cae1899f71e66d070a6084b9` (niet-gepubliceerde 1.27.7-releasekandidaat).  
**Eerste code-SHA:** `d940573cc1eea57f609e4b00f652a0c0f169281e` · **Gecorrigeerde test-SHA met PASS:** `d25f24587d06a79e4660e17777d878dd3727e035`.

## Doel en bronbehoud

De al bestaande `BR-01..07` controleerde een ZIP-back-up met vernietigen/herstellen binnen één browserprofiel. De nieuwe `CROSS-01..08` gaat verder: twee gelijktijdige **strikt gescheiden Playwright BrowserContexts**, eigen localStorage, IndexedDB en serviceworker-cache. Gegevens worden uitsluitend overgedragen via het echte ZIP-bestand en de bestaande gebruikersinterface.

Dit is nadrukkelijk **geen** echte tweede telefoon, Android-bestandskiezer, kabeloverdracht, iOS-compatibiliteit of Cloud/Drive-sync. Alle records, plaatsen en foto's zijn fictief; geen GPS/EXIF, persoonlijke mediabestanden, echte waarnemingen of live deployments. Appcode, opgeslagen vogelbeelden en bronmetadata blijven byte-ongewijzigd.

## Werkelijk uitgevoerd

[GitHub Actions-run 43384160299](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43384160299) · 1/1 job **completed/success** op `d25f24587d06a79e4660e17777d878dd3727e035`.

| Test | Echte handeling | Resultaat |
|---|---|---|
| CROSS-01 | Via FAB, soortkiezer, bestandsinput en Opslaan één fictieve waarneming met decodeerbare PNG creëren in profiel A | PASS |
| CROSS-02 | ZIP via profiel-UI downloaden; originele PNG-bytes en doelbewust toegevoegd onbekend toekomstveld bevestigen | PASS |
| CROSS-03 | Onafhankelijk profiel B openen met **nul** waarnemingen en nul IDB-foto's | PASS |
| CROSS-04 | Ongeldig archief en geannuleerde valide import wijzigen de lege bestemming niet | PASS |
| CROSS-05 | ZIP via echte UI in profiel B herstellen; record-ID, locatie, onbekend veld en exacte PNG-bytes behouden | PASS |
| CROSS-06 | Profiel B sluiten, netwerk uit, nieuwe pagina offline; record, thumbnail, detail en IDB-beeld herladen | PASS |
| CROSS-07 | Dezelfde ZIP in profiel B opnieuw importeren; nul extra waarnemingen of media | PASS |
| CROSS-08 | Veiligheidskopie terugzetten naar de oorspronkelijke **lege** profiel-B-toestand; geïmporteerde foto verdwijnt, profiel A blijft intact | PASS |

Geen onverwachte JavaScript-paginafouten in de geteste source-/destinationpagina's.

## Mislukte eerste test: zorgvuldig gereproduceerd en gecorrigeerd

De [eerste CI-run 43383896998](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43383896998) had CROSS-01..07 PASS maar CROSS-08 **FAIL**. De oorspronkelijke test verwachtte dat 'Terugzetten' na een **tweede, identieke import** de eerdere geïmporteerde gegevens zou bewaren.

Codecontrole `src/storage/backup.js` (regels 514–525) toont echter dat een herhaalde import **zonder enige wijziging** bewust meteen terugkeert en de oudere veiligheidskopie **intact laat**. De veiligheidskopie is gemaakt vóór de **eerste** import, toen het doelprofiel nog leeg was. `restoreFromSafetyCopy` (regels 529–550) hoort die eerste import en gekoppelde media dus te verwijderen. De bestaande BR-06-test toetste dezelfde regel.

**Oorzaak:** een fout criterium in de nieuwe test, niet een bewezen defect in Birdspot.  
**Fix:** voor CROSS-08 eerst inhoudelijk vaststellen dat de veiligheidskopie van vóór de eerste import is behouden (leeg `birdspot-sightings`, media-ID in `importedMediaIds`), daarna via de echte herstelknop bevestigen dat het doelprofiel leeg is, de foto weg is, de veiligheidskopie is opgeheven én het bronprofiel ongewijzigd blijft.  
**Hertest:** 8/8 PASS op `d25f2458`. Acceptatiegrens is niet verzwakt; die is hersteld naar de reeds gedocumenteerde productsemantiek.

## Integratie- en releasegrens

- Eerdere PR #171 `83c11744`: 13/13 CI-workflows PASS inclusief SW-upgrade 1.27.6 → 1.27.7. De nieuwe cross-profielcontrole wijzigt die kandidaat niet.
- Deze QA-PR voegt een test en workflow toe; testlog met fictieve gegevens, **geen ZIP of persoonlijk bewijs** als GitHub-artifact.
- De echte fysieke S1-gate uit PR #169 (Android-camera/-Back/-GPS/-installatie, tweede schoon toestel, echte ZIP-overdracht, daglicht) blijft **NOT TESTED**.
- Hosting, accountrechten, licenties, echte kosten/quota en productiebeleid blijven afzonderlijke releasegates; **geen merge, Pages-preview, Vercel of livegang**.

## Risico / herstel / volgende stap

- Laatste bewezen voorouder: releasekandidaat PR #171 `83c117447126b705cae1899f71e66d070a6084b9`; nieuwe werkbranch behoudt die commit.
- Bij bezwaar of nieuwe fout: sluit alleen de nieuwe QA-PR; geen datamigratie of code-/productierollback nodig. Bewaar fysieke privé test-ZIP **buiten GitHub**.
- **Volgende toets:** door eigenaar uitgevoerde AND-08 echte tweede Android-import vanaf een fysiek apparaat, met bron/uitkomst/evidence apart en onafhankelijk beoordeeld. Zonder bewijs blijft die hardware-gate BLOCKED/NOT TESTED.
- Werkelijke kosten GitHub Actions/runtime: UNKNOWN. Eén gerichte CI-run per codewijziging; geen volledige regressiebatch nodig voor alleen tekst-/testwijzigingen.
- **Learningdelta:** testverwachtingen voor restore/no-op import moeten terug te voeren zijn op het geldende appcontract én bestaand BR-06-bewijs. Hergebruik van bestaande herstelregels; geen nieuwe algemene learning-ID zonder verdere noodzaak.

**Documentstatus DRAFT is geen app-PASS. S1-browsertransfer technisch VERIFIED; fysieke tweede-toesteltransfer NOT TESTED. Publicatie NO-GO.**
