# Birdspot 1.27.20 — geïntegreerde releasekandidaat

**Status:** REVIEW / NOT LIVE · **Risico:** hoog vanwege opname, PWA-update en persoonsgebonden waarnemingen.  
**Eigenaarbesluit:** 15 november 2026: bestaande updates na herstel van de releasecontroles live zetten. Dat akkoord is geen automatisch testbewijs.  
**Writer:** ChatGPT op afzonderlijke branch `release/birdspot-integrated-1-27-20-20261115`.  
**Bron-HANDOFF:** vogelgids + Kuifeend/Topper uit PR #258 (`30767d84beeab71c5fbe1a97ac46251ad3dabbf8`) en opname/GPS uit PR #248 (`e302730914483d386b66b26090ad4f0fe006b84d`); gedeelde oudercommit `c51abf8c59774ffe73e3738c71dc0026c5fb1864`.

## Wat in deze integratie is opgenomen

- Volledige F3-gidsstapel t/m R07, kaart/navigatie/Home-design, beeldbronnen, ⓘ-attributie en de twee Kuifeend/Topper-tekst- en foto-gatecontroles blijven van PR #258 behouden.
- Alle 15 **niet-conflicterende** opnamebestanden uit de #248-delta op exact dezelfde versie toegevoegd: `src/app.js`, `src/data/places.js`, `src/data/sightings.js`, `src/features/sightings/quickAdd.js`, de zeven nieuwe geluidsmodules, `styles/sightings.css`, audio-workflow en tests, en de bestaande Veldluistermodus-brief.
- Bij de acht op beide lijnen gewijzigde bestanden worden de **nieuwere F3-UI** en foto-/audiocredits behouden. `src/features/home/view.js`, `styles/field-experience.css`, `src/features/species/detailSections.js`, `styles/species.css` en UI-tests hadden de benodigde structuur al of hebben inmiddels een recentere variant. De oude #248-versies zouden die verbeteringen overschrijven.
- `sw.js` heeft releaseversie `1.27.20` en precacht nu zeven lokale geluidsmodules. De herkenningsengine en modelgewichten blijven extern en offline niet gegarandeerd; handmatige geluidsregistratie is de terugval.
- README expliciteert de geluidsroute, de 50-meterregel voor een bestaande pin, lokale audio-concepten en ontbrekend ZIP-herstel van zo'n ongepind concept.

## Pre-release toetsmatrix

| Gate | Concrete handeling/test | Bewijsstatus |
|---|---|---|
| G1 | Alle relevante GitHub Actions en soorten-/media-/plumage-/kennistests op **exact deze integratie-SHA** | PENDING |
| G2 | Audio: microfoon afwijzen, starten/stoppen, tijdbalk/stilte, zoeken, zelf bevestigen, meerdere soorten, opslagfout/nieuwe pin rollback/duidelijke herpoging | PENDING · tests `test_quick_add_merlin.py` |
| G3 | PWA update vanaf bestaande review `21ce9060` naar 1.27.20 op dezelfde origin: JS/media/cacheversie, geen gebruikersdata verloren; offline na heropening | PENDING |
| G4 | Privacy: geen publieke GPS, geen ongeautoriseerde externe geluidsupload, juiste media-attributie, veilige sessie | PENDING |
| G5 | Test ZIP back-up met foto + waarneming en restore in een tweede profiel/toestel; toon expliciet dat een niet-gepind audioconcept tijdelijk/lokaal is | PENDING |
| G6 | Gedocumenteerde foto-/soortidentiteit, geen vals compleet Topper-fotopaar, onafhankelijke rechten- en determinatiecheck | DEELS · voor Topper ontbreken gecontroleerde media |
| G7 | Fysiek Android/PWA met echte microfoon en GPS; zo nodig iOS-platformcheck en daglicht/klein scherm | NOT TESTED — externe praktijkpiloot nodig |
| G8 | Afgeschermde preview op deze SHA: openen, invoeren, bewaren/heropenen, terug, fouten, toegankelijke broninfo en echte runtime | PENDING |
| G9 | Rechten/cost voor extern BirdNET Live V3.0 model en ONNX Runtime, quota/hosting en fallback beoordeeld | PENDING |
| G10 | Owner `zet live` / `live`, gecontroleerde publicatie SHA, live-check en rollback | Akkoord voor publicatie **na** gates; uitvoering PENDING |

**Geen gate-PASS op basis van oude PR-CI of alleen document-FINAL.** App-publicatie eerst naar het gekozen, beveiligde preview-/reviewkanaal wanneer dat toegestaan is; productie/ `main` alleen na passende afzonderlijke gates. Releasewoord alleen na SHA en live-URL.

## Rollback en databehoud

- Laat `main` op `5bf67043e830e977749f0ee593cf9f41f0e2822b` en de bestaande publieke review `preview/birdspot-review` op `21ce9060f789103cfbba98fa78f6b53f4b9cea5b` staan zolang niet aantoonbaar gepubliceerd.
- Code-rollback betekent niet automatisch herstel van lokaal gewijzigde opslag. Vóór echte update ZIP-back-up maken/valideren met minstens één foto; restore op tweede profiel.
- Niet-gepinde audioconcepten worden in IndexedDB `birdspot-sound-drafts` gehouden; deze opslag zit niet in de huidige ZIP en kan bij browser-/toestelverlies verloren gaan. Niet voorstellen dat ZIP dit dekt.
- Bewaar voor iedere publicatie de uitrol-SHA, testen, datum, gewenste origin en terugval-SHA. Geen automatische Vercel-Git deploy: publieke GitHub Pages review wordt volgens README van `preview/birdspot-review` gepubliceerd.

## Volgende inhoudsronde

F3-R08 voor maximaal drie opeenvolgende bestaande gidssoorten op basis van het actuele F3-register, **na** release-integraal checkpoint. De 140 contentcontroles en alle open bron-/foto- en audiorechten worden niet stilzwijgend als voltooid beschouwd; 21/140 inhoudelijk bekeken bij F3-R07, 0 volledig afgetekend.
