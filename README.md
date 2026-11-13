# Birdspot Library

Persoonlijke bibliotheek van vogelwaarnemingen — App 002 in Kevins App Development
Handbook. Kickoff-baseline per App Kickoff Gate (Handbook §1.3); vastgelegd
retroactief, na reeds afgeronde en nog openstaande featurewerk, zodat de
baseline alsnog klopt met de werkelijke stand van de app.

## Identiteit

- **App**: Birdspot Library (App 002)
- **Repository**: `saddamsmit-source/Birdspot-Library`
- **Eigenaar**: Kevin Smit (Project Owner)
- **Status**: in actieve ontwikkeling. `main` staat op Release 1.14.0 (zoeken op
  plek en koppelingen, K5). Een groot aantal verdere features (kaart-inzichten
  K6, profiel/export K7, uitgebreide gidsfoto-audit) staat als losse, op elkaar
  gestapelde pull requests klaar en is nog niet naar `main` gemerged.

## Probleem en gebruiker

Eén gebruiker (Kevin) legt zijn eigen vogelwaarnemingen vast: welke soort, waar,
wanneer, hoe (gezien/gehoord), en met welk bewijs (foto, geluidsopname). De app
vervangt losse foto's/notities door één overzichtelijke, doorzoekbare, offline
werkende bibliotheek, met een ingebouwde veldgids van Nederlandse vogelsoorten
als naslagwerk erbij.

## Primaire taken

1. Een waarneming vastleggen: soort, plek (kaart), moment, methode (gezien/
   gehoord), en optioneel foto's of een geluidsopname.
2. Terugvinden wat eerder is waargenomen: per soort, per plek, op de kaart, of
   via het profiel (lijsten, statistieken, CSV-export).
3. Een soort opzoeken in de veldgids: herkenning (kleden, vergelijking met
   gelijkende soorten), leefwijze, waar en wanneer, zang/roep.

## Scope

**MUST**

- Offline bruikbaar: waarnemingen vastleggen, bekijken en doorzoeken zonder
  internet.
- Eigen waarnemingen zijn gebruikersdata; de ingebouwde soorten- en gidsdata is
  alleen-lezen en wordt nooit door een update overschreven (Handbook §3.3).
- Eén back-up- en één herstelactie die alle opslag dekt (Handbook §3.5).
- Elke claim in de gids (foto, kenmerk, verspreiding) is herleidbaar naar een
  bron; niets wordt verzonnen (Handbook §1.1/L-018/L-019).

**SHOULD**

- Kaart met plekken, clustering en filters (seizoen, status, bijzondere
  waarnemingen).
- Profiel met lijsten, statistieken en CSV-export van eigen waarnemingen.
- Eigen geluidsopnamen (bijvoorbeeld via Merlin geëxporteerd) toevoegen per
  soort.

**MAY**

- Waarnemingen later delen met waarneming.nl via een API.
- Online gaan zodra er een reden is voor functies die een server nodig hebben
  (delen, sync tussen toestellen).

**Non-goals (eerste releases)**

- Geen account, geen login, geen meerdere gebruikers.
- Geen automatische verzending van waarnemingen naar externe diensten.
- Geen automatische verwijdering van data (dubbele foto's e.d. worden hoogstens
  voorgesteld, nooit automatisch verwijderd — Handbook §1.1).

## Data

- **Eigen waarnemingen** (`src/data/sightings.js`, `src/data/places.js`) en
  **media** (`src/data/db.js`, IndexedDB) zijn gebruikersdata: lokaal, op het
  eigen toestel, eigendom van Kevin.
- **Soortendatabase** (`src/data/species.js`, 597 Nederlandse vogelsoorten) is
  vaste, alleen-lezen inhoud. Bron en methode staan in
  `docs/data/METHODE.md` en `docs/data/vogellijst-nederland.json` (CSNA/CDNA-
  soortenlijst, Sovon-broedvogelatlassen, Rode Lijst 2016); statusvelden worden
  nooit met de hand aangepast, alleen via `tools/species/apply_status.py`.
- **Gidsfoto's** (hoofdfoto, mannetje/vrouwtje/juveniel/vlucht per soort) zijn
  foto's van derden met bron, auteur, licentie en SHA-1 per bestand,
  vastgelegd bij import (zie de bronaudit-commits en `tests/
  test_guide_photo_verification.mjs`).
- **Gevoeligheid**: laag. Geen persoonsgegevens van anderen; de enige
  gebruikersdata is Kevins eigen waarnemingen en media, lokaal op zijn eigen
  toestel.
- **Omvang**: bescheiden (tekst + een beperkt aantal eigen foto's/
  geluidsopnamen per waarneming); de gidsfoto's zijn het grootste mediadeel
  van de app.

## Offline / netwerk

- Offline-first: de app-shell (HTML/CSS/JS) en de volledige soorten- en
  gidsdata zijn lokaal beschikbaar via een service worker (`sw.js`,
  network-first met ~3 s time-out, aparte media-cache die releases overleeft —
  Handbook §3.6).
- Alleen de kaart heeft een netwerkafhankelijkheid: Leaflet + MarkerCluster en
  de kaartlagen worden van cdnjs geladen; zonder netwerk werkt de rest van de
  app door, de kaart zelf niet.
- Suncalc (voor zonsopkomst/-ondergang-achtige berekeningen bij seizoenslogica)
  wordt ook van cdnjs geladen.

## Doelplatformen

- Mobiel eerst, basis-viewport 390 px (ook getest op 360/430 px), one-hand use.
- Primair een PWA in de mobiele browser; nog niet op een echt toestel
  gecontroleerd — **NOT TESTED — REAL DEVICE REQUIRED** voor installatie,
  camera/foto-upload en geluidsopname-import op een echt toestel.
- Automatische testen draaien in headless Chromium (Playwright) via CI; een
  volledige browser-supportmatrix is nog niet vastgelegd.

## Architectuur / stack

- **Vanilla JS ES-modules, geen framework, geen build-stap** (geen
  `package.json`): past bij een offline-first, single-user PWA zonder server
  (Handbook §3.1, zelfde basisrichting als case 001).
- Structuur volgt de modulestandaard uit Handbook §3.2: `core/` (impliciet via
  `src/app.js` en routering), `src/data/` (opslag en vaste data), `src/
  features/<naam>/` (view + logica per scherm/domein: map, profile, sightings,
  species), `styles/`, `tests/`, `tools/species/` (databuild- en
  auditscripts).
- Persistentie: eigen waarnemingen/instellingen in `localStorage`/
  `src/data/settings.js`, media (foto's) in IndexedDB via `src/data/db.js`.
- Kaart: Leaflet.js + Leaflet.markercluster (CDN).
- **Alternatief overwogen**: geen — een server-backed stack (Handbook-
  referentie Next.js/Supabase/Vercel) is bewust niet gekozen omdat er geen
  meerdere gebruikers, rollen of gedeelde data zijn; een statische PWA dekt
  alle MUST-eisen met de minste beheerlast en zonder vendor lock-in.

## Externe afhankelijkheden

- **CDN (alleen online nodig)**: cdnjs — Leaflet, Leaflet.markercluster,
  Suncalc.
- **Openbare reviewversie**: [Birdspot op GitHub Pages](https://saddamsmit-source.github.io/Birdspot-Library/)
  wordt gepubliceerd vanaf `preview/birdspot-review`. De appversie komt uit
  `APP_VERSION` in `sw.js`. Vercel Git-deploys zijn uitgeschakeld. Zie de
  [releasenotities voor 1.27.6](docs/release/RELEASE_1.27.6.md).
- **Geen accounts, geen betaalde diensten, geen eigen backend.**
- Fotobronnen voor de gids: diverse, per foto vastgelegd met auteur, licentie
  en bron-SHA-1 (zie de bronaudit-commits in de git-historie).

## Risico's

- **Data-integriteit van de gids**: gidsfoto's en kenmerken moeten herleidbaar
  blijven naar hun bron; bewaakt door `tests/test_guide_photo_verification.mjs`
  en `tools/species/guide_coverage.mjs`, maar blijft een doorlopend
  aandachtspunt bij elke nieuwe foto-import.
- **Branch-sprawl**: er staat een lange keten van op elkaar gestapelde open
  pull requests (tientallen) die nog niet naar `main` zijn gemerged. Dat werkt
  zolang de keten lineair en op elkaar aangesloten blijft; het risico is dat
  een PR per ongeluk op een verkeerde of verouderde basis terechtkomt. Zie
  Handbook §1.7/§1.7A voor het synchronisatiecontract hiervoor.
- **Geen echte-toestel-tests**: functionaliteit is alleen in headless
  Chromium gecontroleerd; installatiegedrag, camera-opname en
  geluidsbestand-import op een echt toestel zijn nog niet bevestigd.
- **Online gaan**: zodra de app online gaat (ook alleen als preview) komt er
  een nieuw risico bij: wie de link kan zien, en dat Kevins eigen
  waarnemingen-testdata niet per ongeluk als "echt" wordt gelezen. Tot nu toe
  bewust vermeden; alleen op Kevins expliciete verzoek.
- **Geen vendor lock-in**: vanilla JS zonder framework/build-stap houdt dit
  risico laag.

## Succescriteria (eerste bruikbare release)

- Een waarneming vastleggen (soort, plek, moment, methode, optioneel foto/
  geluid) kost op een telefoon enkele tikken, geen omwegen.
- Terugvinden van een eerdere waarneming werkt vanuit minstens drie plekken in
  de app: soortkaart, kaart, en profiel/lijsten.
- De app werkt volledig offline voor alles behalve de kaart zelf.
- Een back-up maken en diezelfde back-up herstellen levert exact dezelfde data
  op (round-trip getest).
- Geen enkele foto, kenmerk of claim in de gids is verzonnen; alles is
  herleidbaar naar een bron.

## Reviewmethode

- Automatische controles: Playwright-gebaseerde Python- en Node-testsuites in
  `tests/` (controleer de actuele inventaris in `tests/`), uitgevoerd via `python tests/<bestand>.py`
  respectievelijk `node tests/<bestand>.mjs`; CI draait relevante suites per PR
  op basis van gewijzigde paden (`.github/workflows/*.yml`).
- Visuele controle: screenshots op 390 px (`tests/screenshots/`), bijgewerkt
  per relevante testrun.
- Livegang vereist Kevins expliciete "zet live" en groene releasecontroles.
  Wijzigingen voor de openbare reviewversie gaan via een release-PR naar
  `preview/birdspot-review`. Een release naar `main` heeft eigen productiecriteria.

## Draaien en testen

```bash
# Lokaal bekijken: open index.html via een lokale webserver (geen build-stap)
python3 -m http.server 8000   # en open http://localhost:8000

# Testen (Python/Playwright)
python3 -m pip install -r tests/requirements.txt
python3 -m playwright install --with-deps chromium
python3 tests/test_species_detail.py       # voorbeeld; zie tests/ voor alle suites

# Testen (Node)
node tests/test_guide_poses.mjs            # voorbeeld; zie tests/ voor alle suites

# Soortendata bijwerken vanuit de bron
python3 tools/species/apply_status.py
```

## Actuele S1-releasekandidaat — 13 november 2026 (GEEN publicatie)

- **Actuele ontwikkelfase:** S1 praktijkpilot; een ontwikkelbatch of CI-PASS is geen productie-PASS.
- **Baselines:** `main` `5bf67043e830e977749f0ee593cf9f41f0e2822b` en bestaande reviewbranch `21ce9060f789103cfbba98fa78f6b53f4b9cea5b` blijven behouden.
- **Nieuwe kandidaat:** op afzonderlijke QA-branch met **`APP_VERSION = '1.27.7'`**, alleen voor niet-gepubliceerde integratietesten; exacte eind-SHA, CI en owner-besluit vastleggen in `docs/release/RELEASE_1.27.7_CANDIDATE.md`.
- **Verplichte releaseproef:** echte 1.27.6-review → 1.27.7 serviceworker-upgrade op dezelfde origin, exacte lokale gebruikersdata/IDB behouden, nieuwe media en JS offline beschikbaar, plus bestaande 1.14/1.27.5 regressies.
- **Nog niet vrijgegeven:** fysieke Android/PWA, camerabestandskiezer, tweede toestel ZIP-herstel, latere release/privacy/hostingchecks. Geen merge, GitHub Pages-update of Vercel-deploy.
- **Herstel:** huidige publieke review `21ce9060` als code-/cachebaseline behouden. Een code-rollback wist of herstelt geen gebruikersgegevens: ZIP-back-up en herstel zijn afzonderlijke acties.

### Kostenregister — S1 basis, bewijs- en beslisgrenzen

| Provider / onderdeel | Gratis of betaald | Laag/normaal/piek en werkelijke kosten | Waarschuwing/stop | Fallback |
|---|---|---|---|---|
| GitHub repository en Actions | Bestaand account; actuele quota/voorwaarden opnieuw controleren | Gebruik en daadwerkelijke kosten **UNKNOWN** | Waarschuw bij naderend account-/CI-limiet; betaalupgrade alleen na eigenaarbesluit; harde drempel **UNKNOWN** | Tests lokaal uitvoeren en CI-batches verkleinen |
| Lokale Python/Playwright/Chromium/Node | Bestaande open tooling | Werkelijke tijd/kosten **UNKNOWN**, geen eigen abonnementsclaim | Vermijd dubbele runs, grote media-batches of onbegrensde herpogingen | Kleinste gerichte test plus vastgezette bron-SHA |
| Vercel / publieke app | `git.deploymentEnabled = false` in deze kandidaat | Huidige werkelijke hostingkosten/voorwaarden **UNKNOWN** | Geen wijziging van abonnement of deployment zonder eigenaarbesluit | Offline localhost/PWA-test in S1 |
| Kaarttegels en externe bronnen/CDN | Licentie, quota en commercieel gebruik per bron controleren | Bedragen en pieklast **UNKNOWN** | Externe verzoeken beperken; geen herpublicatie zonder rechten | Kaart offline begrensd; eigen logboek en gecachete gids blijven bruikbaar |

Deelcategorieën en drempels worden vóór een betaalde dienst of schaalfase vanuit echte Usage-gegevens ingevuld. Geen omzet- of kostenbesparingsclaim zonder meting.

## Vogelfoto-audit: volgorde vastgesteld op 13 november 2026

Op eigenaarbesluit geldt deze uitvoeringsvolgorde voor de **140 soorten met bestaande gidsfoto's**:

1. **Fase F1:** eerst alle 140 soorten een **individuele eerste beoordeling** geven, in afzonderlijk toetsbare batches van maximaal drie soorten. Foto's openen, identiteit/rol/vlucht en bronregistratie beoordelen; open punten, ontbrekende rollen en verbeterwensen vastleggen. Een eerste beoordeling kan PARTIALLY TESTED blijven.
2. **Fase F2:** zodra alle 140 aan bod kwamen, **alle 140 opnieuw volledig en onafhankelijk verifiëren** tegen `docs/BIRDSPOT_KWALITEITSNORM.md`: originele fotograaf/licentie/herpublicatierechten, soortidentiteit, individuele leeftijd/geslacht, vlucht, kwaliteit, kennisclaims, biometrie, vergelijking, source-to-app-continuïteit en browserbediening. Niets op VERIFIED promoveren zonder bijbehorend bewijs.
3. **Daarna pas** nieuwe of overige nog niet behandelde soorten buiten deze 140 oppakken. Geen voortijdige brede fotoimport of publieke release.

**Tellers expliciet gescheiden houden:** `docs/fotokwaliteit/soortaudit-status.json` en `SOORTAUDIT_TRACKER.md` zijn de canonieke negenpunts-audit; zij melden momenteel 100/140. Het aparte, bewijsgebonden **eerste-beoordelingregister** `docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json` telt al behandelde overige soorten uit M12 en later zonder de canonieke status onterecht te veranderen. De actuele F1-teller komt uit die registercontrole, niet uit losse chatclaims. Een volledige onafhankelijke F2-PASS volgt pas in F2.

De fysieke Android-praktijkpilot is door de eigenaar uitgesteld en blijft NOT TESTED; geen merge, GitHub Pages-/Vercel-deploy of livegang zonder apart eigenaarbesluit.

## Afwijkingen van het Handbook

Geen bekende afwijkingen op dit moment.

## Openstaand

- Deze README is retroactief toegevoegd (de Kickoff Gate liep achter de
  featurewerk aan); een cross-document sync-controle tussen deze README, de
  Index en de werkelijke repo-status (Handbook §4.11) is nog niet apart
  uitgevoerd.
- Supportmatrix (browsers/toestellen, Handbook §4.5) nog niet vastgelegd.
- Definitieve productiehosting en de fysieke toesteltest staan open.

## Releasekandidaat 1.27.8 — eigenaar vraagt live (13 november 2026)

- **Live-instructie:** eigenaar gaf expliciet 'Zet live en ga verder'; daarmee is de **autorisatievoorwaarde** ingevuld, niet automatisch de technische releasegates.
- **Kandidaat:** aparte `qa/birdspot-release-candidate-1.27.8-20261113` vanaf M17 `965f1d37bd05856ae5bb99c1fdeab604137de7ca`; gerichte nieuwe `APP_VERSION = '1.27.8'`. Ook de originele 1.27.6-review wordt in upgradeproeven meegenomen. In de RU-08-test blijven bronmedia en actuele modules bij latere kandidaatversies verplicht; niet alleen voor exacte 1.27.7.
- **Publicatiecontract:** één samenhangende kandidaat en CI op één SHA vóór merge naar `preview/birdspot-review`; daarna praktijkpilot. `main`/productie pas na verplichte gates. Geen Vercel-deploy (auto-Git-deploys zijn uitgeschakeld) of merge als de gates niet gehaald zijn.
- **Open harde gaten:** echte Android/PWA-installatie, GPS/camera/Back/offline/update, ZIP-herstel op tweede toestel, totale fotorechten/licentie-/broncontrole en actuele hosting-/privacy-/kostencheck zijn nog niet bewezen. F1 staat op 117/140, canonieke negenpunts-audit op 100/140, F2 nog niet voltooid. Overblijvende autorisatie alleen is geen release-PASS.
- **Herstel:** `preview/birdspot-review` op `21ce9060f789103cfbba98fa78f6b53f4b9cea5b`, `main` op `5bf67043e830e977749f0ee593cf9f41f0e2822b` als laatste gecontroleerde bestaande branches. Code-rollback wist geen lokale IDB/waarnemingen; afzonderlijke ZIP-herstelcontrole vereist.
- **Bewijs/status:** zie `docs/release/RELEASE_1.27.8_CANDIDATE.md`; werkelijke CI-minuten, hostingkosten, fysiek-toestelresultaat en onafhankelijke mediarechten blijven UNKNOWN/NOT TESTED tot feitelijke controle.
