# Birdspot 1.27.31 — openbare reviewversie (GitHub Pages)

**Datum:** 17 november 2026 · **Route:** `preview/birdspot-review` → https://saddamsmit-source.github.io/Birdspot-Library/ · **Vorige openbare versie:** 1.27.6 (`21ce906`)
**Kandidaat:** keten #281 → #284–#287 → #288 → #289, code-SHA `eab2ca1` + deze releasenotitie · **Eigenaarbesluit:** "live zetten" 17-11-2026 15:13, zonder vrijstelling van gates.

## Nieuw t.o.v. 1.27.6
- **PWA-installatie (#279/#281):** gecorrigeerde iconen en manifest, installatie-/updategedrag 1.27.31.
- **Gids en foto's (F2/F3-R01…R20):** 60 van 140 soorten individueel tegen het bronbeeld gecontroleerd; twijfelachtige foto's teruggetrokken met behoud van bron (o.a. Vuurgoudhaan-, Boomkruiper-, Gele Kwikstaart- en IJsvogel-juveniel); neutrale labels waar geslacht niet bewezen is.
- **Soortvergelijkingen:** nieuwe en gecontroleerde dubbelgangerpanelen (o.a. boomkruipers, kwikstaarten, goudhaantjes, grasmussen), in beide richtingen.
- **Kennisprofielen:** Vogelbescherming- en Sovon-status/trends, bronverschillen zichtbaar.
- **Waarnemingen:** handmatige pins, Merlin-bewijs, foto/video, ZIP-back-up en -herstel, terugnavigatie (bestaande functies, regressie getest).
- **Media-audit:** Commons-auteurs alleen bij herleidbare vormen gelijk.

## Buiten deze release
- Fotonorm v1.8 (#282, DRAFT) en Samsung-startkaart (#283, docs).
- Productierelease naar `main` (zie §Productie).
- Persoonlijke fotofeedback-API (alleen Vercel-previewomgeving; op Pages niet actief).

## Gates
- CI op de exacte publicatie-SHA via de release-PR naar `preview/birdspot-review`.
- RU-matrix (upgrade + gegevensbehoud + offline): basis `21ce906` (1.27.6) en `5bf6704` (1.14.0).
- Niet getest (blijft open): fysieke Samsung/Android-installatie en -update, GPS, microfoon, camera, ZIP-herstel op tweede toestel.

## Productie (`main`)
HOLD: `main` wordt nergens geserveerd en de productiecriteria (fysieke toesteltests, privacy-/hostingchecks) zijn niet gehaald.

## Terugval
Revert-PR naar `preview/birdspot-review` met de boom van `21ce906` (1.27.6). Nooit force-push; gebruikersdata op toestellen blijft staan.

## Feature-reconciliatie 1.27.31 (17-11-2026)

**Doel:** per afspraak tonen of die gebouwd, gepubliceerd, functioneel getest en door de eigenaar geaccepteerd is. Vijf afzonderlijke bewijsvelden; het ene veld bewijst het andere niet.
**Gepubliceerd:** https://saddamsmit-source.github.io/Birdspot-Library/ · `preview/birdspot-review` = `0f9f631` · APP_VERSION 1.27.31.
**Functionele test:** `tests/test_feature_reconciliation.py` tegen de **live URL** op een GitHub-runner (run 44111958995, 14/14 PASS). Chromium, 390 px, virtuele microfoon met de Merel-zang uit de gids (`sp045-song.mp3`) en vaste GPS 51.9244, 4.4777. Dezelfde test lokaal op `0f9f631`: alle routes PASS behalve de BirdNET-suggestie (de sandbox blokkeert de modeldownload).
**Niet bewezen door deze test:** echt toestel, echte microfoon, GPS of camera, scherm-wake-lock, achtergrondgedrag, installatie op de Samsung.

Legenda: ✔ = ja, met bewijs · ✘ = nee · ◐ = gedeeltelijk · — = niet van toepassing. "Getest" betekent een echte knop, een zichtbare uitkomst en opgeslagen data in Chromium. Het is geen toestel-PASS.

| # | Afspraak (bron) | AFSPRAAK | GEBOUWD (PR/SHA) | GEPUBLICEERD 1.27.31 | FUNCTIONEEL GETEST | EIGENAAR GEACCEPTEERD | Vindplaats | Ontbreekt / wijkt af |
|---|---|---|---|---|---|---|---|---|
| R01 | Centrale + met twee keuzes (eigenaarbesluit 15-11) | ✔ | ✔ #258/#248 → keten → `0f9f631` | ✔ | ✔ live F02 | ✘ | Ronde + rechtsonder → "Waarneming toevoegen" / "Geluid herkennen" | Tweede keuze is lokale BirdNET-herkenning; geen Merlin-keuze (zie R07) |
| R02 | Geluid herkennen: opnemen, geluidsniveau-tijdbalk, suggesties lokaal, nooit automatisch zeker (README 1.27.20) | ✔ | ✔ | ✔ | ◐ live F05/F06: Merel-opname → "Mogelijk gehoord: Merel"; tijdbalk met geluid; terugluisteren | ✘ | + → Geluid herkennen → Start/Stop opname | Echte microfoon, wake-lock en stop bij achtergrondwissel NOT TESTED; eerste herkenning downloadt ca. 82 MB |
| R03 | Meerdere bevestigde soorten in één keer als losse Gehoord-waarnemingen | ✔ | ✔ | ✔ | ✔ live F05: 2 records `heard` (sp045, sp029) | ✘ | Geluidsblad → soorten aanvinken → "Pin 2 waarnemingen" | — |
| R04 | Opnametijdlijn | ✔ | ✔ | ✔ | ◐ tijdbalk `data-has-sound=true`; de suggestie toont een tijdstip ("Suggestie · 00:00") | ✘ | Geluidsblad | Geen aparte tijdlijn per detectie; alleen tijdbalk plus tijdstip per suggestie |
| R05 | Datum, tijd en GPS automatisch bij openen | ✔ | ◐ | ✔ | ◐ Geluid: datum en GPS automatisch (lat/lon opgeslagen). Handmatig: datum automatisch, GPS pas na knop "GPS" of pin | ✘ | Formulier "Waarneming toevoegen" | **Afwijking:** de handmatige route vult GPS niet automatisch in ("Nog geen pin gekozen"). Eigenaarbesluit nodig |
| R06 | Bestaande plek binnen 50 m hergebruiken; bij twijfel zelf kiezen | ✔ | ✔ | ✔ | ◐ lokaal: "Bestaande pin · Reconciliatietest"; CI `test_quick_add_merlin.py` | ✘ | Geluidsblad → positie | Live meting toonde alleen "Plek bepalen…" |
| R07 | Gratis externe Merlin-handoff achter + (eigenaarbesluit 15-11) | ✔ | ✘ (alleen handmatige velden `identificationSource=merlin` en `merlinVerification`) | ✘ | ✘ | ✘ | Niet bereikbaar | **Afwijking:** vervangen door lokale BirdNET; het geluidsblad bevat bewust geen Merlin-link |
| R08 | Eigen opnames (bv. Merlin-WAV) toevoegen | ✔ | ◐ per **plek** (kaart → plek → media, accepteert audio) | ✔ | ◐ CI-kaarttests; niet in de live-matrix | ✘ | Kaart → vaste plek → "+ Foto, video of geluid" | **Afwijking:** niet per waarneming (accepteert alleen foto/video) of per soort |
| R09 | Hotspots op startscherm | ✔ | ✔ #261 | ✔ | ✔ live F07 | ✘ | Start → "Mijn hotspots" | — |
| R10 | Gidsfoto's per soort, vaste volgorde, alleen geverifieerd (baseline 10-11, fotoprioriteit 16/17-11) | ✔ | ◐ 60/140 in F3 gecontroleerd | ✔ | ✔ live F08: gidsfoto Merel gedecodeerd | ◐ ontwerp akkoord 10-11; werkende set ✘ | Soorten → soort → Herkenning | 80 soorten NOT STARTED; vlucht/juveniel vaak open; 4 juvenielen bewust teruggetrokken |
| R11 | Dubbelgangers vergelijken (symmetrisch, beide richtingen) | ✔ | ✔ F3-R09…R20 | ✔ | ✔ live F09 (Boomkruiper ↔ Taigaboomkruiper) | ✘ | Soortkaart → Herkenning → vergelijking | Onafhankelijke tweede review open |
| R12 | Foto zoomen en terug | ✔ | ✔ | ✔ | ✔ live F08 | ✘ | Tik op gidsfoto → Escape/terug | — |
| R13 | App-brede zoekfunctie | ✔ | ✔ | ✔ | ✔ live F10 | ✘ | Start → zoekveld | — |
| R14 | Waarnemingen blijven bewaard | ✔ | ✔ | ✔ | ✔ live F11 (na herladen) | ✘ | Profiel / kaart / soortkaart | — |
| R15 | Offline werken (behalve kaarttegels) | ✔ | ✔ | ✔ | ◐ live F12: offline herladen en soortkaart openen (Chromium) | ✘ | — | Toestel offline NOT TESTED |
| R16 | ZIP-back-up en -herstel | ✔ | ✔ | ✔ | ◐ BR-01..07 lokaal op dezelfde boom; niet in de live-matrix | ✘ | Profiel → back-up | Tweede toestel NOT TESTED; geluidsconcepten vallen niet onder de ZIP (gedocumenteerd) |
| R17 | Update-melding en bijwerkknop | ✔ | ✔ | ✔ | ◐ G-04 en RU-matrix lokaal (1.27.6 → 1.27.31) | ✘ | Toast "Nieuwe versie · Nu laden" | Live-update op een geïnstalleerde PWA NOT TESTED |
| R18 | Versie zichtbaar voor controle (preview-afspraak 15-11) | ✔ | ◐ | ✔ | ◐ live: `sw.js` = 1.27.31 | ✘ | Profiel → versie | **Afwijking:** bij eerste bezoek toont het profiel "Versie onbekend · offline-modus nog niet actief" |
| R19 | Kaart: vrijwel schermvullend, vaste middenpin, kleuren per methode, clusters, plekken | ✔ | ✔ K1–K6 | ✔ | ◐ CI K-tests; niet in de live-matrix | ◐ ontwerp akkoord | Kaart | — |
| R20 | Startscherm-diashow: 50 bijzondere vogels, elke 30 s, hervat | ✔ | ✔ `featuredCarousel` | ✔ | ✘ niet gemeten | ◐ foto's door eigenaar gekozen | Start | 30 s en hervatten in deze ronde NOT TESTED |
| R21 | Soortdatabase en kennis per soort | ✔ | ✔ 623 soorten, 107 kennisprofielen | ✔ | ◐ via F08–F10 | ✘ | Soorten | Kennis nog niet voor alle soorten |
| R22 | Eigen foto als persoonlijke gidsfoto | ✔ | ✔ | ✔ | ◐ `test_personal_guide.py` lokaal | ✘ | Soortkaart → eigen foto | Toestelcamera NOT TESTED |
| R23 | Foto-inzending en feedback naar beheer | ✔ | ◐ alleen Vercel-previewomgeving | ✘ niet actief op Pages | ✘ | ✘ | — | Niet beschikbaar in de gepubliceerde app |
| R24 | Installeren op de Samsung via de vaste link | ✔ | ✔ PWA 1.27.31 | ✔ | ✘ | ✘ | Chrome → Toevoegen aan startscherm | Fysieke installatie, update en offline NOT TESTED |
| R25 | Veldluistermodus | ✔ (later) | ✘ | ✘ | — | — | — | Bewust later |
| R26 | waarneming.nl-koppeling | ✔ (later) | ✘ | ✘ | — | — | — | Wacht op API-toestemming |
| R27 | Eigenaar-app | ✔ (nu niet) | ✘ | ✘ | — | — | — | Besluit 15-11: nu niet bouwen |

**Nog niet vrijgegeven (wel ontwikkeld):** fotonorm v1.8 (#282, DRAFT); Samsung-startkaart (#283, docs); foto-inzending en feedback-API (alleen Vercel); `main` (productie, HOLD).

**Eigenaarakkoord:** van geen enkele werkende functie in 1.27.31 is een expliciet eigenaarakkoord vastgelegd. Ontwerpakkoorden van 10-11 (fotovolgorde en kaart) en de gekozen diashowfoto's zijn akkoorden op het ontwerp, niet op de werkende functie.

**Onafhankelijke review:** ChatGPT beoordeelt dezelfde SHA `0f9f631` read-only, met deze tabel en run 44111958995 als startpunt.
