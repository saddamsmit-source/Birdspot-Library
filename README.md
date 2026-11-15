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

**Tellers expliciet gescheiden houden:** `docs/fotokwaliteit/soortaudit-status.json` en `SOORTAUDIT_TRACKER.md` zijn de canonieke negenpunts-audit; zij melden momenteel 101/140. Het aparte, bewijsgebonden **eerste-beoordelingregister** `docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json` telt al behandelde overige soorten uit M12 en later zonder de canonieke status onterecht te veranderen. De actuele F1-teller komt uit die registercontrole, niet uit losse chatclaims. Een volledige onafhankelijke F2-PASS volgt pas in F2.

**Hervatten in F2.** Zie [F2-voortgang](docs/fotokwaliteit/F2_VOORTGANG_TOT_140.md) voor per soort uitgevoerde hercontroles, bewijs, open punten en het volgende batchcheckpoint. Een technische scan over 140 kaarten telt niet als 140 handmatige controles.

**Kleine-zangvogelfoto’s (eigenaarbesluit 14-11-2026).** Herkenbare rust-/kleedfoto's op een tak of ondergrond én vergelijkingen krijgen voorrang op moeilijk bruikbare vluchtfoto's. Ontbrekende vluchtfoto = uitgesteld fotoonderzoek, niet automatisch batchblokkade; een bestaande goede vrije-vluchtfoto blijft. Geen concessie aan soortidentiteit, leeftijd/geslacht, originele beeldinspectie, broncredits of herpublicatierechten voor daadwerkelijk getoonde foto's. De norm staat uitsluitend in `docs/BIRDSPOT_KWALITEITSNORM.md` §3.3; concrete restpunten staan in `docs/fotokwaliteit/F2_OPEN_PUNTEN_REGISTER_2026-11-14.md`.

**Voorkeursreferenties voor gevonden foto’s en soorttekst (eigenaarverduidelijking 14-11-2026).** Bij de beoordeling van een elders gevonden gidsfoto of een geschreven herkenningsbeschrijving gaan **Vogelbescherming Nederland en ANWB-vogelgids** voor wanneer de relevante soortinformatie feitelijk toegankelijk is. Gebruik die kenmerken om de *kandidaatfoto* te toetsen; Birdspot hoeft hun eigen afbeeldingen niet over te nemen. ANWB-soortinhoud van de boekgids was in deze sessie **NOT TESTED**; de winkelvermelding alleen is geen soortbewijs. Kloppen soort, geslacht/leeftijd, gedrag of cruciale kenmerken niet aantoonbaar, raadpleeg andere bevoegde bronnen en laat het onzekere label open. Fotoherkomst en herpublicatierechten blijven afzonderlijke vereisten; Sovon/CDNA blijven voor hun eigen soortstatistiek en formele status voorgaan. **De regel staat uitsluitend in** `docs/BIRDSPOT_KWALITEITSNORM.md` §2.1 (v1.4), en de nog niet gemaakte bewijzen in het F2-openpuntenregister.

**Bronvermeldingen in de app (eigenaarbesluit 14-11-2026).** De openbare soortgids toont geen optionele bronlijst bij vogelherkenning, vergelijkingen of kennisprofielen. De bron-URL's, oorspronkelijke maatwaarden en QA-bewijzen blijven volledig intern opgeslagen. Verplichte maker-, licentie-, fotobron-, audio- en kaartdata-attributies blijven bereikbaar; broninformatie verbergen geeft nooit recht een onbewezen foto te publiceren. Eén normhouder: `docs/BIRDSPOT_KWALITEITSNORM.md` §2.2 (v1.5).

**Fotovergelijking (14-11-2026).** Een vergelijking onder ‘Lijkt op’ toont beide vogels naast elkaar, ook op mobiel, en mag passende gidsfoto’s hergebruiken. De eigen hoofd-, kleed- en vluchtsecties blijven vrij van dubbele opnamen. De herkenningstest controleert expliciet twee volwassen en twee juveniele vluchtfoto’s bij Buizerd en Ruigpootbuizerd, twee rustfoto’s bij Fitis en Tjiftjaf en het openlaten van een ontbrekende foto. Zie de fotonorm §3.3.

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

## Eigen gidsfoto’s en fotovoorstellen

Een vogelaar kan op de soortkaart via **Eigen foto** zelfgemaakte beelden toevoegen aan de hoofdfoto, een getoond kleed of een vluchtrol. De ingreep is per slot en zichtbaar op dit toestel. **Herstel standaardfoto** verwijdert de voorkeur. De bestaande voorraadfoto en verplichte credits blijven beschikbaar. De app bewaart de verkleinde JPEG zonder originele bestandsnaam of camerametadata in de bestaande IndexedDB-mediaopslag. ZIP-back-ups nemen de foto mee en kunnen die terugzetten naar een leeg profiel. Persoonlijke gidsfoto’s zijn geen waarnemingen, worden niet gedeeld met andere gebruikers en verschijnen niet als bronfoto in vergelijkingen.

Via **Foto voorstellen aan de beheerder** kiest de maker bewust voor insturen. Het voorstel bevat de soort, het beelddoel, de opgeschoonde foto en een optionele toelichting. Er is geen automatische overdracht van accountgegevens, waarnemingen, GPS of contactinfo. Een voorstel wordt pas bevestigd na een succesvolle opslagreactie. Bij een onzekere ontvangst kan de gebruiker opnieuw proberen met dezelfde melding-ID of het fotovoorstel als bestand downloaden. Insturen geeft toestemming voor beoordeling. Publicatie blijft een afzonderlijke beslissing over determinatie en rechten.

De afzonderlijke, mobiel bruikbare beoordelingsweergave staat op `feedback-inbox.html`. Voor de afgeschermde preview gebruikt `/api/photo-feedback` een private Vercel Blob-store in Parijs. De API is uitsluitend ingeschakeld in de previewomgeving. Lijst en foto’s vereisen de versleuteld geconfigureerde `BIRDSPOT_FEEDBACK_OWNER_KEY`; leestoegang en cachegedrag worden apart getest. De sleutel is uitsluitend beschikbaar in de instellingen van het beschermde previewproject. De beheerder kan ook een gedownload voorstel openen zonder server. Een voorstel wijzigt nooit automatisch de centrale gids. De volledige eigenaarapp en publieke ontvangst blijven aan de bestaande releasegates onderworpen.

**Kosten en herstel.** De preview controleert een grens van 40 voorstellen en een invoergrens van 2,1 MB per bericht. De werkelijke verbruiksstand blijft afzonderlijk te meten. De privéopslag draait in het bestaande previewproject. Bij ontoereikend tegoed kan de gebruiker een voorstel downloaden en de beheerder het bestand openen. Herstel van de appcode via de basis-PR. Voor lokale beelden bieden de slotreset en ZIP-back-up de herstelroute.

## Mobiele review van hoofdfoto, contrast en iconen

De startfoto vult de kaart tot onder **Bekijk soortkaart** en **Veldkenmerken**. De naam, groep, wetenschappelijke naam en acties zitten op compacte bosgroene leesvlakken boven de foto. De foto zelf heeft geen verduisterend verloop, vervaagde rand of kleurfilter. Op een klein scherm snijdt de Home-uitsnede de foto bij. **Vergroot foto** toont het volledige beeld met de bijbehorende maker en licentie.

De tip bij een vergelijking en het label **Helpt** gebruiken dezelfde bosgroene leesstijl. **Let op** is een inhoudelijke determinatiewaarschuwing en krijgt een warm amberkleurig kader. Kleurparen voor tekst en achtergrond zijn als tokens vastgelegd voor licht, donker en systeemthema. De regressietest opent precies Wielewaal, Holenduif en Steppekiekendief en controleert de foto tot onder de actie, het contrast en de habitatpictogrammen op mobiel.

De pictogramcontrole omvat hoofdnavigatie, Home, soortdetail en leefgebied, waarnemingsformulier en -lijst, kaart, profiel, dagboek, inzichten, media, film en feedback. Boerenland, Heide, Polder, Kust, Wad en Moeras krijgen afzonderlijke pictogrammen. Waarnemingen krijgen een klembord, locaties een kaartpin, film een filmstrook en het dagboek een open boek. In formulier, lijst en kaart verwijzen oog, oor, gecombineerd pictogram en geluidsgolf naar dezelfde zicht- en geluidsbetekenissen. De woorden bij de pictogrammen blijven zichtbaar. Herstelpunt en testbewijs staan in de bijbehorende concept-PR.
