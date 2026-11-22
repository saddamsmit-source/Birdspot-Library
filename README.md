# Birdspot Library

Persoonlijke bibliotheek van vogelwaarnemingen — App 002 in Kevins App Development
Handbook. Kickoff-baseline per App Kickoff Gate (Handbook §1.3); vastgelegd
retroactief, na reeds afgeronde en nog openstaande featurewerk, zodat de
baseline alsnog klopt met de werkelijke stand van de app.

## Werkstand Birdspot — kandidaat na vier rondes

**Peildatum** 19 november 2026. De kandidaat staat op `ed810ae8de34bccc26e6f759a3e815323f893a95`. GitHub Pages toont de openbare reviewversie **1.27.31** op `0f9f631`. De kandidaat heeft hetzelfde versienummer. [Kandidaatbewijs en open toestelproeven](docs/release/RELEASE_1.27.31.md#kandidaat-na-vier-rondes)

- **Waarneming toevoegen.** Het formulier haalt GPS automatisch op als locatietoestemming al is verleend. Een handmatige pin of het wissen van de locatie heeft voorrang op een laat GPS-antwoord.
- **Vaste plekken.** De zoekstraal staat standaard op 250 m en kan op 100, 250 of 500 m. Eén kandidaat en een bekende nauwkeurigheid van maximaal 50 m geven een voorselectie met de optie **Aparte spot**. Bij meerdere kandidaten of onzekerheid kiest de gebruiker zelf. Elke waarneming bewaart haar eigen datum, tijd en coördinaten.
- **Omgevingsfoto’s en ZIP.** Privé-omgevingsfoto’s horen bij een plek en gaan mee in een eigen ZIP-export. IndexedDB is leidend voor plekken. ZIP-import vereist Web Locks en één open Birdspot-venster. **Terugzetten** vereist Web Locks. De kaart wacht op herstel en stelt automatische plektoewijzing uit zolang de plekmigratie onzeker is.
- **Opname bij een waarneming.** Via **+ Geluidsopname** voeg je een bestand toe, bijvoorbeeld een Merlin-WAV. De eigen opname is afspeelbaar in het waarnemingsdetail. Een ZIP-back-up bewaart het oorspronkelijke bestand en de koppeling.
- **Geluid herkennen.** Via **+ → Geluid herkennen** open je de BirdNET-route. Het blok **Controleer met Merlin** biedt delen op een geschikte browser en uitleg voor handmatig openen. Birdspot bewaart eerst het bijgewerkte concept en geeft alleen de WAV door aan het systeemdeelmenu. Je legt per gekozen soort vast wat Merlin voorstelde, wat je zelf controleerde en of je de vogel ook zag. [Bediening en bewijsgrenzen](docs/roadmap/BIRDSPOT_PLUS_MERLIN_SNELWAARNEMEN_V0.1_DRAFT.md#huidige-kandidaat)
- **Versie.** Het profiel toont de appversie en de offline-status afzonderlijk.

**Vervolg volgens eigenaarbesluit.** F3-R24 heeft Kwak, Grauwe Gans en Wilde Eend inhoudelijk opnieuw bekeken: **72/140, 0 volledig afgetekend**. De actuele Kwak-fotoinventaris is hersteld van nul naar drie bestaande beelden, zonder nieuwe foto’s. Lengtes volgen de afgesproken bronmethode; Kolgans-tekst werkt wederkerig en de vrouwtjesvergelijking Wilde Eend/Krakeend heeft expliciete verschillen. Na alle 140 volgen brede praktijktests, inclusief Samsung/PWA en Merlin; daarna fotoaanvulling bij goede resultaten. Release **HOLD**. [R24-broncontrole en open punten](docs/fotokwaliteit/F3_R24_KWAK_GRAUWE_GANS_WILDE_EEND_2026-11-20_DRAFT.md) · [De Visdief als aanvullende bron](docs/bronnen/VISDIEF_VOGELGIDSEN_BRONNOTITIE_2026-11-19.md)

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
  waarneming.

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
  [releasenotities voor 1.27.31](docs/release/RELEASE_1.27.31.md) (vorige: [1.27.6](docs/release/RELEASE_1.27.6.md)).
  **Feature-reconciliatie** (afspraak ↔ gebouwd ↔ gepubliceerd ↔ getest ↔ geaccepteerd): [§ Feature-reconciliatie 1.27.31](docs/release/RELEASE_1.27.31.md#feature-reconciliatie-1-27-31-17-11-2026).
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

**Aanvullend eigenaarbesluit 22 november 2026 — conceptrevisie v1.10, nog niet geactiveerd.** Voor de huidige F3-herbeoordeling (laatst bewezen R41: 123/140 inhoudelijk bekeken, 17 te starten, 0 F3 FULL PASS) is de **foto de belangrijkste snelle determinatiehulp**. Een minder goede of ontbrekende foto vraagt bijzonder nauwkeurige, brongedragen tekst, met name over verwarringssoorten. Vogelbescherming Nederland en de **daadwerkelijk gelezen** ANWB-soortpassage zijn leidende herkenningsreferenties; als de ANWB-passage ontbreekt, vermeld dat als `NOT TESTED`, zonder schijnverificatie. Bijkomende vakbronnen en Sovon dienen hun specifieke bewijsdoel. **De eigenaar krijgt vóór een volgende F3-batch ieder materieel inhoudelijk of fotografisch gat te zien en beslist expliciet: dieper zoeken, gericht verbeteren of voorlopig doorgaan met geregistreerd open punt.** Een eigenaarbesluit over werkvolgorde geeft geen inhoudelijke, rechten- of release-PASS. Eerst de eerste beoordeling van alle 140 voltooien; de tweede diepgaande controle met eigenaar-fotoreview start **pas als de eigenaar de appfase voldoende afgerond vindt en die ronde expliciet vrijgeeft**; bestaande 123 dossiers en oude F1/F2-bewijzen blijven intact. De volledige procedure en beslisregistratie staan uitsluitend in **[kwaliteitsnorm v1.10 DRAFT §§2.3 en 3.5](docs/BIRDSPOT_KWALITEITSNORM.md)** in [de aparte document-PR](https://github.com/saddamsmit-source/Birdspot-Library/pull/343). Tot eigenaar-QA/vrijgave en bronactivering is **v1.7 de geldende norm**. Geen productie-, preview-, appcode- of mediamutatie door dit documentbesluit.

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

### Interactieve app-preview en eigenaarreview — 15 november 2026

**Eigenaarbesluit / Birdspot-werkafspraak.** Bij iedere relevante zichtbare of functionele update ontvangt de eigenaar een **direct te openen, werkende Birdspot-app-preview** in dezelfde compacte kaart-/knopvorm als de door de eigenaar goedgekeurde ChatGPT-weergave **'Birdspot Library — Open app-preview'**. Geen losse screenshot als vervanging van echte bediening. Een reviewlink moet aantoonbaar naar de **geteste, actuele kandidaat-SHA** verwijzen; noem daarnaast appversie, gewijzigde functies/soorten en teststatus. Een verouderde publieke preview is **geen** bewijs van de nieuwste wijzigingen; documentatie-only werk hoeft niet als nieuw appdeployment te worden voorgesteld.

- Test zo mogelijk op een **afgeschermde staging-preview** met onafhankelijke toegangscontrole en geïsoleerde test-/gebruikersdata; controleer de URL en SHA vóór aanbieden. Kan een passende interactieve preview niet worden gemaakt of geopend: meld **BLOCKED / NOT TESTED**, toon de bestaande preview uitsluitend met het expliciete label **oudere versie**, en lever niet enkel screenshots als equivalent.
- Bij review test de eigenaar zelf de volledige route **openen → zoeken/navigeren → betreffende vogel/feature → foto/vergelijking/handeling → terug/annuleren → waar relevant opslaan/heropenen**. CI en screenshots zijn aanvullend bewijs, geen vervanging van eigenaarreview/fysieke toesteltest.
- Verzamel opmerkingen direct per **soort-ID, foto-/rolslot, feature, versie/SHA, verwachte en feitelijke uitkomst**. Koppel correcties aan één issue/PR, herstel herhaalbare gedeelde componenten of regels op één plek en hertest relevante gevallen. Zo hoeven eerder behandelde soorten **niet van vooraf aan opnieuw**; laat dezelfde geteste verbetering ook gelden voor latere soorten en controleer bestaande soorten met gerichte regressie. Bestaande bron-, rechten- en volledigheidsgates blijven staan.
- Een tussentijdse wijziging kan een nieuwe **reviewkandidaat** opleveren zonder volledige F1/F2-rondes opnieuw te doen, maar de **geïntegreerde releasegate** blijft vereist voor publieke release. De eigenaar beoordeelt het werkende resultaat; geen automatische merge/livegang.
- Deze afspraak is specifiek Birdspot-reviewgedrag en werkt de algemene previewregel (Handbook L-068 / §§3.12, 4.11) uit, zonder een tweede algemene norm te maken.


## Toekomstige eigenaarapp / hoofdapp — pas na volwassen gebruikerskern

**Vastgelegd eigenaarbesluit 15 november 2026:** **nu niet ontwikkelen en nu niet koppelen**. Zodra de huidige Birdspot-gebruikersapp volgens de eigenaar redelijk af en stabiel is, volgt een **aparte kickoff** voor een persoonlijke **eigenaarapp**. Die start als een **volwaardige kopie van de dan geteste gebruikersapp**: dezelfde vogelgids, kaarten, waarnemingen, media, collecties, navigatie, uitstraling en alle overige gebruikersfuncties, **plus** afzonderlijke beheermogelijkheden. Geen los dashboard dat de gebruikersfunctionaliteit vervangt.

Beheerkandidaten: feedback ontvangen en opvolgen; positieve/negatieve feedback in tabellen/diagrammen en trends; contact bij toestemming; bug-/verbeterregister per soort/versie; privacybewuste gebruiksstatistieken; moderatie van community-bijdragen; overzicht van optionele landenpakketten (o.a. Frankrijk/Duitsland); later prijzen, aankopen, omzet, kosten en restituties; campagnes, aanbiedingen en opt-in pushmeldingen; release-/incident-/hersteloverzicht. Niet elk voorstel is al goedgekeurd als uitvoeringsscope: kies later een kleine feedbackbeheerroute als eerste pilot. Accounts, datakoppelingen, providerkeuze en betaalfunctionaliteit blijven **OPEN** tot de latere fase.

De eigenaarapp mag **niet** automatisch privéwaarnemingen, exacte GPS of originele klantfoto's inzien. Scheid eigenaarrechten van gebruikersrechten; bij toekomstige gedeelde data zijn server-side A/B-autorisatie, auditlogs, privacy, herstel, moderatie en kosten harde gates. Ontwerp een onderhoudbare manier om gebruikersfuncties later consistent te houden, maar kies **nu geen technische app-/codekoppeling**.

**Uitwerking en backlog (DRAFT, geen code of release):** [Toekomstige Birdspot-eigenaarapp v0.1](docs/roadmap/BIRDSPOT_EIGENAARAPP_VISIE_V0.1_DRAFT.md).

## Eigen gidsfoto's, bijdragen en betaalde extra's — richting 15 november 2026

**De persoonlijke fotovervanging en vrijwillige foto-inzending zijn technisch opgenomen in de afgeschermde 1.27.11-releasekandidaat, nog niet publiek of fysiek getest:** gebruikers moeten later **voor zichzelf** een eigen foto kunnen kiezen voor een bestaande gidspositie (hoofdfoto, mannetje, vrouwtje, juveniel of vlucht waar toepasselijk) zonder de officiële gidsbron, overige gebruikersmedia of andermans weergave te veranderen. `Herstel originele foto` blijft mogelijk. Een gebruiker moet bovendien **afzonderlijk, vrijwillig** een eigen betere foto kunnen aanbieden aan Birdspot voor beoordeling; geen automatische upload van privéfoto's, locatie of EXIF. Soort, leeftijd, geslacht, rechten, credit en echte vlucht worden vóór centrale publicatie beoordeeld volgens `docs/BIRDSPOT_KWALITEITSNORM.md`. Een niet-gecontroleerde privéfoto krijgt geen officiële kwaliteitsclaim.

**Toekomstkandidaten:** eerlijk punten-/bedanksysteem voor daadwerkelijk goedgekeurde/gepubliceerde, originele inzendingen, mogelijk inwisselbaar voor korting of een gratis land-/mediapakket; aparte betaalde geavanceerde diashow- en filmtemplates/renderopties; mogelijk betaalde geïntegreerde Merlin-achtige **geluidsherkenning met eigen rechtmatig gelicentieerde technologie**. Geen punten voor ruwe uploadvolumes of positieve appreviews. Bestaande gratis Media/Film Studio-, waarnemings-, ZIP-/restore- en Merlin-bestandsdeelroutes niet stilzwijgend beperken. De exacte free/Plus-afbakening, techniek, licenties, terugkerende kosten, beloningswaarden, prijzen, betaalprovider en startfase zijn **OPEN/CANDIDATE**.

**Volgorde:** huidige F2-vogelcontrole en S1-kernroute eerst; daarna eventueel een kleine offline privéfoto-override; inzendingen pas met veilige ontvangst/moderatie; betalingen en beloningen uitsluitend bij latere S4-gates en eigenaarbesluit. De toekomstige eigenaarapp blijft **niet gestart/niet gekoppeld** en krijgt pas later beheer van inzendingen en beloningen bovenop een volledige gebruikersapp-kopie.

**Uitwerking (DRAFT, geen appwijziging):** [Eigen foto's, bijdrages, beloningen en Media/Sound Plus v0.1](docs/roadmap/BIRDSPOT_EIGEN_FOTOS_BIJDRAGEN_BELONINGEN_MEDIA_PLUS_V0.1_DRAFT.md). Eerdere LOCKS voor gidsbijdragen en credits blijven ongewijzigd; alleen nieuwe productwensen zijn toegevoegd.

## Actuele geluidsroute — releasekandidaat 1.27.20 (15-11-2026, nog niet vrijgegeven)

**Geïntegreerde ontwikkelroute:** de bestaande `+` biedt twee concrete keuzes: **Waarneming toevoegen** (bestaande handmatige waarneming) en **Geluid herkennen** (opnamesessie). De geluidsessie neemt na uitdrukkelijke microfoontoestemming op, toont een realtime geluidsniveau-tijdbalk, vraagt tijdens de actieve opname een scherm-wake-lock aan en stopt bij achtergrondwissel. BirdNET Live V3.0 stelt lokaal mogelijke vogels voor; **suggesties worden nooit automatisch zekere waarnemingen**. De gebruiker kan zelf soorten toevoegen, voorstellen selecteren, terugluisteren en één of meerdere bevestigde soorten als afzonderlijke **Gehoord**-waarnemingen opslaan.

**Automatische metadata en kaart:** datum, tijd en GPS worden bij openen ingevuld en gaan voor nieuwe opnamen uit van het werkelijke opnamemoment. Een eenduidig bestaande plek binnen 50 meter wordt hergebruikt met behoud van de per-waarneming gemeten coördinaten; bij meerdere kandidaatpinnen of GPS-onzekerheid moet de gebruiker kiezen. Alle waarden blijven in het detailscherm te corrigeren. Bewaarproblemen mogen geen nieuwe losse kaartpin achterlaten en houden het heropenbare lokale concept intact.

**Kosten, offline en herstel:** model en ONNX Runtime worden bij eerste herkenning extern gedownload (circa 82 MB; werkelijk mobiel verkeer/accuverbruik UNKNOWN). Zonder model/netwerk blijft opnemen, tijdbalk en handmatige soortkeuze bruikbaar. Het **losse concept met audio blijft op dit toestel** en valt **niet automatisch** onder ZIP-back-up van gepinde waarnemingen; de gepinde waarnemingen zelf wel. Dit is een expliciet open herstelpunt voor toekomstig productgebruik; behandel een opgeslagen concept niet als exporteerbaar archief. Privé-audio/GPS wordt niet door Birdspot naar de herkenner verstuurd; de modelbestanden worden gedownload. Modellicentie en broncommit staan in het [Veldluistermodus-dossier](docs/roadmap/BIRDSPOT_VELDLUISTERMODUS_V0.1_DRAFT_2026-11-15.md). De eerdere gratis externe Merlin-handoff blijft als ontwerpbesluit vastgelegd en is **niet gelijk aan** het lokale BirdNET-model.

**Bewijsstatus:** featurecode samengevoegd op eigen releasebranch vanuit PR #258 en #248, nog geen aantoonbaar geverifieerde gezamenlijke release-SHA voor toestel/ZIP/offline/live. Android/iOS-microfoon/GPS, echte PWA-update, tweede-toestel ZIP-herstel, rechten en onafhankelijke UI-/fotocontrole blijven afzonderlijke releasechecks. Oudere plannen hieronder zijn historisch en vormen geen bewijs van een extra actuele functie. Herstelpunten: bestaande reviewbranch `preview/birdspot-review` op `21ce9060`, `main` op `5bf67043`; controleer deze exact opnieuw vóór publicatie.

## Historisch besluit — Snel waarnemen via de centrale + knop en Merlin — eigenaarbesluit 15 november 2026

**Gewenste kern-UX (op de geïntegreerde releasebranch technisch geïmplementeerd; geïntegreerde CI en fysieke praktijkproef zijn nog releasegates):** achter de bestaande centrale **+ / Waarnemen**-knop komt een duidelijke tweekeuze: **`Vogel gezien / waarneming toevoegen`** of **`Geluid herkennen met Merlin`**. De eerste keuze opent zonder Merlin de huidige Birdspot-waarnemingsroute; de tweede laat de gebruiker Merlin Bird ID als **gratis externe herkenningshulp** gebruiken en daarna via dezelfde Birdspot-formulier-/kaartpinroute een soort **zelf bevestigen en registreren**. Dit moet op het hoofdscherm direct werken en mag de bestaande appbrede + functie, datum/locatie, Gezien/Gehoord/Beide, persoonlijke kaart, offline opslag, ZIP-herstel, terugnavigatie of bronstatus niet verstoren.

**Bewijsgrens:** de huidige code heeft al `seen/heard/both`, `identificationSource=merlin`, handmatige `merlinVerification` en `openPinPicker`, en de geïntegreerde + knop toont nu de twee keuzes **Vogel gezien** / **Geluid herkennen** met afzonderlijke herkenbare pictogrammen, en de huidige waarnemingsbestandskiezer accepteert **foto/video, geen audio**. Merlin ondersteunt bestandsdelen/importeren; een **officieel automatische resultaat-API, direct openen naar Sound ID of terugkeer met soort-ID naar Birdspot** is niet aangetoond. Ontwerp daarom eerst **veilige handmatige terugkeer/soortkeuze**, met expliciete status `suggestie` tegenover `zelf gecontroleerd`. Alleen een daadwerkelijk **geziene** vogel mag als `Gezien` worden geteld; na uitsluitend gehoord geluid blijft het `Gehoord`. Een privépin komt uitsluitend van Birdspot/GPS/gebruikerskeuze, niet uit Merlin.

De gratis externe Merlin-route wordt **niet achter een paywall geplaatst**. Een later zelfstandig, commercieel gelicentieerd Birdspot Sound Plus is een ander kandidaatproduct. **Uitvoering in aparte kleine, toetsbare batches** na remote writer-/HEAD-check en actuele F2-afweging; geen koppeling, opname-import of release claimen vóór fysieke Android/iOS- en offline/restoretests. [Uitwerking en acceptatiecriteria: Birdspot + / Merlin Snelwaarnemen v0.1 DRAFT](docs/roadmap/BIRDSPOT_PLUS_MERLIN_SNELWAARNEMEN_V0.1_DRAFT.md).

## Historische ontwerpbrief — Veldluistermodus (15 november 2026)

**Eigenaarwens geregistreerd — later te bouwen, NOT TESTED.** Birdspot moet uiteindelijk een **Veldluistermodus** hebben: telefoon bewust op luisteren zetten, automatisch **meerdere mogelijke vogelsoorten tijdens één sessie** verzamelen, eerdere detecties van dezelfde soort samenvoegen, soorten markeren als **nog niet geregistreerd** of **wel gehoord maar nog niet gezien**, en de **zelf bevestigde** soorten gezamenlijk via bestaande Birdspot-waarnemingen als afzonderlijke privérecords op de kaart pinnen. Herkende geluiden bewijzen **niet** dat de vogel visueel is gezien of hoeveel individuele vogels aanwezig zijn. Alle microfoondetecties blijven suggesties tot de gebruiker ze controleert. Doorlopende luistermodus start alleen na expliciete toestemming, is stopbaar, geeft een hoor-/zichtbare sessiestatus en deelt geen GPS met andere gebruikers.

**Technische grens:** de bestaande vogelgids heeft volgens een gedateerde PR #236-broncontrole **120 geregistreerde audio-items voor 59 soorten**, maar die voorbeelden zijn **geen herkenningsmodel**. Media-/modelrechten moeten afzonderlijk worden getoetst. BirdNET Live is een *onderzoeksoptie* met voor specifieke inbegrepen modelgewichten Apache-2.0; andere BirdNET-modellen zoals BirdNET-Analyzer zijn CC BY-NC-SA en niet automatisch commercieel inzetbaar. De huidige offline-first PWA kan op het **zichtbare scherm** een lokale microfoon-/modelproef krijgen, maar **achtergrondluisteren met het scherm uit is NOT PROVEN** en kan een andere architectuur vergen. Geen server/native rewrite of gekocht model zonder noodzaak, bewijs en eigenaarbesluit.

**UX-volgorde:** de eerder afgesproken snelle **tweekeuze achter +** blijft. Een toekomstige Veldluistermodus kan als vervolgkeuze in de geluidstak worden gepresenteerd; de definitieve schermstructuur volgt uit een aparte design-/toestelproef. De bestaande visuele waarnemingsroute en gratis Merlin-handoff mogen niet worden vertraagd of achter Premium verdwijnen. Batches van maximaal drie soorten voor geluids-/mediaonderzoek, bestaande foto-F2 en kernroute eerst. **Uitwerking:** [Veldluistermodus v0.1 DRAFT](docs/roadmap/BIRDSPOT_VELDLUISTERMODUS_V0.1_DRAFT_2026-11-15.md), met bron-/modelresearch, status, offlinegrenzen, privacy, hersteltests, kosten en acceptatiecriteria.


## Audio- en eBird-controle voor de eerste 140 soorten (eigenaarbesluit 15 november 2026)

Naast de F2-fotocontrole geldt voortaan per soort ook bronvast **geluids- en verspreidingsonderzoek**. Bij iedere nog open F2-batch worden aanwezige zang en roep, correcte soort en geluidsrol, bron/licentie/commercieel/offline hergebruik, werkelijke appweergave en passende **eBird**-waarnemingen/seizoensinformatie gecontroleerd. De eerste 84 eerder opgepakte soorten worden **gericht nagecontroleerd**, zonder hun fotografie opnieuw vanaf nul te doen. Eerst de bestaande 140 tot een afzonderlijk bewijsbaar inhoudelijk niveau; pas daarna de andere soorten 141–597.

**Peilpunt 15-11-2026:** het gidsregister kent 120 audio-items bij 59 van deze 140 soorten, **81 hebben geen opname**; 84 soorten hebben F2-fotowerk, waarvan 40 met geluidsregistratie en 44 zonder. Telling is **geen onafhankelijke geluid-, licentie- of offline-PASS**. [Audittracker](docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json) en [eBird/Sovon/ANWB-werkprotocol](docs/audio/BIRDSPOT_EBIRD_SOVON_AUDIO_BRONPROTOCOL_V0.1_DRAFT.md) zijn de vindplaatsen. Vogelbescherming en daadwerkelijk gelezen ANWB-soortpassages blijven eerste herkenningsreferenties, Sovon voor Nederlandse status en verspreiding, eBird als aanvullende actuele internationale waarnemings-/seizoensbron, en Macaulay voor te toetsen geluiden. Zonder afzonderlijk recht **geen** Macaulay/eBird-gegevensbestanden of beschermde bronmedia commercieel herpubliceren.

**Pilot:** maximaal drie soorten Merel, Tjiftjaf en Fitis; geregistreerde zang en roep met juiste bron en rechten controleren, Chrome offline afspelen testen, vervolgens modellicentie en herkenningsprestatie gescheiden op echte telefoon testen. Een bestaand geluidsfragment is niet hetzelfde als een automatisch herkennend model. Onzekere soort of vergunning blijft expliciet open; nooit vervangen door een gok.

## F3-herijking van de eerste 140 — eigenaarbesluit 15 november 2026

### Uitvoeringsprecisering · UI/UX eerst, praktijkproef later (eigenaar 15 november 2026)

**Nieuwe actuele werkvolgorde:** behandel in kleine batches van maximaal **3 vogelsoorten** eerst de **feitelijke gidsinhoud, beelden, kloppende kleed-/vliegrollen, geluiden waar een juiste gelicentieerde opname is, vergelijkingen en mobiele UI/UX**. Controleer originele herkomst en noodzakelijke maker-/licentierechten vóór publieke media. Een ontbrekende passende media-opname krijgt een afzonderlijk open punt en **blokkeert niet** het beoordelen van de volgende soorten binnen de 140. Goede eerdere foto's en gegevens hergebruiken; geen herhaling vanaf nul zonder specifieke reden.

De **praktische, brede functionele tests** (echte Android/iOS, microfoon/Merlin/BirdNET, grote offline/ZIP-restore, update/rollback en eindrelease) vinden **later als geïntegreerde ronde** plaats, nadat inhoud en UI/UX van deze 140 zijn uitgewerkt. Kleine lokale/CI-checks blijven nodig na codewijzigingen om regressie of dataverlies vroeg te ontdekken. De bedoeling is centrale fixes eenmaal te maken en op alle soorten toe te passen; een definitieve garantie dat alle latere bugs in één ronde herstelbaar zijn kan niet worden gegeven. **CONTENT REVIEWED / OPEN** ≠ **CONTENT COMPLETE** ≠ **APP-RELEASE PASS**. Ontbrekende rechten of daadwerkelijke foutieve soort kunnen niet met een uitgestelde test worden weggestreept.

**UI-bronregel:** gewone vogel-, foto- en geluidskaarten tonen geen lange bronlijst, MP3-bestandsnamen of herhaalde makersnamen. **ⓘ** is het vaste, toetsenbordtoegankelijke informatiepunt waar **maker, individuele bron, licentie en bewerking** te vinden zijn. Een licentie of fotograaf die uitdrukkelijk een credit permanent zichtbaar verlangt vormt de noodzakelijke uitzondering. De volledige bewijsregistratie blijft ongewijzigd volgens kwaliteitsnorm §2.2. De aparte UX-bron-ⓘ-PR #250 heeft twee gerichte CI-PASS-controles, maar mag pas als onderdeel van de F3-app geclaimd worden op één later geïntegreerde geteste SHA.

**R02 gestart:** na Houtduif/Holenduif/Turkse Tortel nu **Buizerd, Wespendief en Ruigpootbuizerd**; 6 + 4 + 4 daadwerkelijk bestaande foto's visueel nagekeken. Nieuwe Buizerd-hoofdfoto gebruikt een al geregistreerde natuurlijke boomtakfoto met CC BY 4.0 en maakt niets aan foto's kwijt. De lopende aparte F3-teller en foto-/audio-status staan in [F3-R02 drie roofvogels](docs/fotokwaliteit/F3_R02_DRIE_ROOFVOGELS_2026-11-15_DRAFT.md).

**F3-R03 inhoudelijk beoordeeld:** Sperwer, Havik en Torenvalk. 17 bestaande foto’s visueel nagekeken en zeven bestaande opnamen vergeleken met de oorspronkelijke geluidsbestanden. De mobiele fotoparen zijn gecontroleerd. De [F3-R03-bevindingen](docs/fotokwaliteit/F3_R03_SPERWER_HAVIK_TORENVALK_2026-11-15_DRAFT.md) vermelden de ontbrekende foto’s en broncontroles. Stand: 9/140 inhoudelijk beoordeeld, 131 te starten, 0 volledig afgetekend. Geïntegreerde basis: PR #252.

**F3-R04 inhoudelijk beoordeeld:** Slechtvalk, Grote Bonte Specht en Kleine Bonte Specht. Een brongecontroleerde foto van de jonge Slechtvalk in vrije vlucht is toegevoegd. De geluidsuitleg onderscheidt roep en roffel. Nederlandse status en trends zijn bijgewerkt tegen Sovon. [F3-R04-bevindingen](docs/fotokwaliteit/F3_R04_SLECHTVALK_EN_BONTE_SPECHTEN_2026-11-15_DRAFT.md). Stand: 12/140 inhoudelijk beoordeeld, 128 te starten, 0 volledig afgetekend.

**F3-R05 inhoudelijk beoordeeld:** Zwarte Specht, Groene Specht en Middelste Bonte Specht. Scherpere versie van de vrouwtjesfoto van Zwarte Specht, aparte lachende roep bij Groene Specht en brononderbouwde Nederlandse status voor alle drie. [F3-R05-bevindingen](docs/fotokwaliteit/F3_R05_DRIE_SPECHTEN_2026-11-15_DRAFT.md). Stand: 15/140 inhoudelijk beoordeeld, 125 te starten, 0 volledig afgetekend.

**F3-R06 inhoudelijk beoordeeld:** Ekster, Zwarte Kraai en Kauw. Alle drie hebben een brongecontroleerde juvenielenfoto en een eerste eigen roepopname. Kauw heeft een afzonderlijke vrije-vluchtfoto en een rust- en vluchtvergelijking met Zwarte Kraai. [F3-R06-bevindingen](docs/fotokwaliteit/F3_R06_EKSTER_KRAAI_KAUW_2026-11-15_DRAFT.md). Stand: 18/140 inhoudelijk beoordeeld, 122 te starten, 0 volledig afgetekend.

**F3-R07 inhoudelijk beoordeeld:** Gaai, Koolmees en Pimpelmees. Nieuwe juvenielenfoto voor de Gaai, vier extra zang- en roepopnamen, een apart juvenielentabblad voor de twee mezen en bijgewerkte Sovon-status. [F3-R07-bevindingen](docs/fotokwaliteit/F3_R07_GAAI_EN_MEZEN_2026-11-15_DRAFT.md). Stand: 21/140 inhoudelijk beoordeeld, 119 te starten, 0 volledig afgetekend.

**F3-R08 — individuele inhoudsinspectie (16 november 2026):** Matkop (`sp031`), Glanskop (`sp032`) en Kuifmees (`sp033`). Alle tien *huidige lokale WebP-rollen* afzonderlijk visueel bekeken, de bestaande gidsinformatie tegenover Vogelbescherming gelezen; géén nieuw fotobestand of geluidsfragment geplaatst. De Matkop/Glanskop-verwarring vraagt betere kop-/snavelfoto's en afzonderlijke contactroepen; de Kuifmees verdient een echte roep en onafhankelijke leeftijd-/flightbevestiging. Originele fotograafbestanden, individual mediarechten, audiowaveforms, ANWB-passage, browser- en fysieke toets blijven open. [F3-R08-dossier](docs/fotokwaliteit/F3_R08_MATKOP_GLANSKOP_KUIFMEES_2026-11-16_DRAFT.md). Stand: **24/140 inhoudelijk bekeken, 116 niet gestart, 0 volledige F3-PASS**.

**Nieuwe eigenaarregel — soortdubbelgangers (16 november 2026).** Bij soorten die sterk op elkaar lijken zijn **duidelijke echte foto's én brongedragen onderscheidende tekst** vereist, met aandacht voor vrouwtjes, juvenielen, seizoen en ondersoorten. Complete fotoparen onder 'Lijkt op' blijven tweezijdig en rolzuiver; bij ontbrekende foto blijft de waarschuwing in de herkenningstekst zichtbaar maar het onvolledige fotopaneel verborgen. Eén register houdt per paar bewijzen en open punten bij. **Enige normhouder**: [Birdspot-kwaliteitsnorm v1.7 §3.4](docs/BIRDSPOT_KWALITEITSNORM.md); [toepassings- en dubbelgangersregister](docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json). Dit geldt vanaf nu voor elke F3-batch, niet slechts deze drie vogels.

**F3-R09 — individuele inhoudsinspectie (16 november 2026):** Staartmees (`sp034`), Vink (`sp035`) en Groenling (`sp036`). Elf bestaande lokale foto's daadwerkelijk geopend. Vink–Huismus-vrouwtjesvergelijking verduidelijkt, volwassen mannetjes Groenling–Sijs als extra rustfotopaar toegevoegd, en Vink–Keep/Staartmees-witkopvariant met expliciete onzekerheid beschreven. **Geen fotopaar gefingeerd voor Keep (`sp181`) en geen nieuwe media geïmporteerd.** Groenling mist nog een gelicenseerde eigen zang/roep. Originele externe fotobytes, audio, onafhankelijke rechten/ANWB en fysieke pilottest blijven open. [F3-R09-bron- en fotodossier](docs/fotokwaliteit/F3_R09_STAARTMEES_VINK_GROENLING_2026-11-16_DRAFT.md). Stand: **27/140 inhoudelijk bekeken, 113 niet gestart, 0 volledige F3-PASS**. Technische wijzigingen uitsluitend op de nieuwe reviewbranch; live/public review `main` en `preview/birdspot-review` zijn niet bijgesteld.

**F3-R10 — individuele inhoudsinspectie (16 november 2026):** Putter (`sp037`), Sijs (`sp038`) en Kneu (`sp039`). Elf bestaande lokale foto's geopend; nieuw brongedragen kennisprofiel voor de Kneu met dubbelgangers Frater, barmsijzen en Roodmus; Sijs-waarschuwing aangevuld met Europese kanarie; statusafwijking Kneu ('Standvogel' in de canonieke vogellijst tegenover overwintering in Zuidwest-Europa volgens Vogelbescherming) als open punt geregistreerd. Fotoparen alleen waar beide foto's bestaan (Putter–Sijs, Kneu–Roodmus); Frater, barmsijs en Europese kanarie alleen als tekst. Geen nieuwe foto's of geluid: media-import was in deze sessie geblokkeerd. Open: foto's vrouwtje/juveniel Kneu, zang/roep voor alle drie, hercontrole vluchtfoto's. [F3-R10-bevindingen](docs/fotokwaliteit/F3_R10_PUTTER_SIJS_KNEU_2026-11-16_DRAFT.md). Stand: **30/140 inhoudelijk bekeken, 110 te starten, 0 volledig afgetekend.**

**F3-R10b-media (16 november 2026):** media-intake aangescherpt (auteur tegen Commons-metadata, padbewaking, nooit overschrijven, audio pas na menselijke luistercontrole; negatieve tests). Putter kreeg een extra vrije-vluchtfoto (Holger Uwe Schmitt, CC BY-SA 4.0), **voorwaardelijk** wegens sterke kleurbewerking; de bestaande vluchtfoto blijft. De Sijs-vluchtfoto bleek een landing en staat nu onder Verenkleed; vluchtparen met de Sijs worden niet meer als fotopaar getoond. Audiokandidaten staan ongehoord en ongepubliceerd in `docs/media-intake/`. [F3-R10b-bevindingen](docs/fotokwaliteit/F3_R10b_MEDIA_2026-11-16_DRAFT.md).

**F3-R11 (16 november 2026):** Goudvink (`sp040`), Appelvink (`sp041`) en Roodmus (`sp042`). Negen bestaande lokale foto's geopend; rollen kloppen, Goudvink-vluchtfoto is echte vrije vlucht, Appelvink-vluchtfoto blijft voorwaardelijk (klein). Nieuw brongedragen kennisprofiel voor de Roodmus; fotoparen Goudvink–Vink, Appelvink–Vink en Kneu–Roodmus, Grauwe Gors alleen als tekst. Open: Roodmus vrouwtje/juveniel/vlucht, zang/roep voor alle drie. [F3-R11-bevindingen](docs/fotokwaliteit/F3_R11_GOUDVINK_APPELVINK_ROODMUS_2026-11-16_DRAFT.md). Stand: **33/140 inhoudelijk bekeken, 107 te starten, 0 volledig afgetekend.**

**F3-R12 (16 november 2026):** Huismus, Ringmus, Merel. Alle 14 getoonde foto's tegen het bronbeeld gecontroleerd (nieuwe origcheck-route). Ringmus-vluchtfoto bleek een luchtgevecht → uit de vluchtrol, echte vrije-vluchtfoto toegevoegd. Audio volgens het nieuwe audiocheck-protocol: Merel-zang bevestigd, Huismus-roep toegevoegd (niet door mens beluisterd), overige niet gepubliceerd. [F3-R12-bevindingen](docs/fotokwaliteit/F3_R12_HUISMUS_RINGMUS_MEREL_2026-11-16_DRAFT.md) · [audiocheck-protocol](docs/media-intake/AUDIOCHECK_PROTOCOL.md). Stand: **36/140 inhoudelijk bekeken, 104 te starten, 0 volledig afgetekend.**

**F3-R12b (16 november 2026):** audiocontrole herzien na onafhankelijke review. De spectrale maat bleek de soorten niet betrouwbaar te onderscheiden. Alle opnamen staan op "alleen bronlabel" en de soortkaart toont dat zichtbaar. **F3-R13:** Zanglijster, Kramsvogel en Koperwiek; alle 9 foto's tegen het bronbeeld gecontroleerd, 2 auteursnotaties gecorrigeerd, vrije-vluchtfoto Koperwiek niet gevonden (open). [F3-R13-bevindingen](docs/fotokwaliteit/F3_R13_ZANGLIJSTER_KRAMSVOGEL_KOPERWIEK_2026-11-16_DRAFT.md). Stand: **39/140 inhoudelijk bekeken, 101 te starten, 0 volledig afgetekend.**

**F3-R13b/R14 (16 november 2026):** audioprotocol v0.2 (automatische check nooit VERIFIED) en padcontrole van de media-import op directorygrenzen. Grote Lijster, Roodborst en Zwarte Roodstaart: alle 8 foto's tegen het bronbeeld gecontroleerd, 3 auteursnotaties gecorrigeerd; vrije-vluchtfoto's gezocht maar niet gevonden (open). [F3-R14-bevindingen](docs/fotokwaliteit/F3_R14_GROTELIJSTER_ROODBORST_ZWARTEROODSTAART_2026-11-16_DRAFT.md). Stand: **42/140 inhoudelijk bekeken, 98 te starten, 0 volledig afgetekend.**

**F3-R15 (16 november 2026):** Roodborsttapuit, Heggenmus, Winterkoning. Alle 7 foto's tegen het bronbeeld gecontroleerd; juvenielenfoto Heggenmus toegevoegd; Heggenmus-lengte gecorrigeerd naar ca. 13–15 cm (twee uitgevers); vergelijking Heggenmus–Ringmus toegevoegd; drie bronverschillen (status/trend) vastgelegd; eBird BLOCKED (botcontrole). [F3-R15-bevindingen](docs/fotokwaliteit/F3_R15_ROODBORSTTAPUIT_HEGGENMUS_WINTERKONING_2026-11-16_DRAFT.md). Stand: **45/140 inhoudelijk bekeken, 95 te starten, 0 volledig afgetekend.**

**F3-R16 (16 november 2026):** Tjiftjaf, Fitis, Fluiter. 5 foto's tegen het bronbeeld en 4 opnamen op rechten gecontroleerd (geluid blijft alleen bronlabel); nieuw kennisprofiel Fluiter met drie open bronverschillen; geen vlucht- of juvenielenfoto die aan de norm voldoet. [F3-R16-bevindingen](docs/fotokwaliteit/F3_R16_TJIFTJAF_FITIS_FLUITER_2026-11-16_DRAFT.md). Stand: **48/140 inhoudelijk bekeken, 92 te starten, 0 volledig afgetekend.**

**F3-R17 (17 november 2026):** Zwartkop, Tuinfluiter, Grasmus volgens de fotoprioriteit voor kleine zangvogels. 8 foto's tegen het bronbeeld; nieuw kennisprofiel Tuinfluiter met neutrale volwassen foto; twee juvenielen voor onafhankelijke beoordeling. [F3-R17-bevindingen](docs/fotokwaliteit/F3_R17_ZWARTKOP_TUINFLUITER_GRASMUS_2026-11-17_DRAFT.md). Stand: **51/140 inhoudelijk bekeken, 89 te starten, 0 volledig afgetekend.**

**F3-R18 (17 november 2026):** Braamsluiper, Goudhaantje, Vuurgoudhaan. 8 foto's tegen het bronbeeld; nieuw kennisprofiel Braamsluiper; Goudhaantje-label "Vrouwtje" en Vuurgoudhaan-juveniel voor onafhankelijke beoordeling; getoetste uitzonderingsregel voor ontbrekende optionele foto's. [F3-R18-bevindingen](docs/fotokwaliteit/F3_R18_BRAAMSLUIPER_GOUDHAANTJE_VUURGOUDHAAN_2026-11-17_DRAFT.md). Stand: **54/140 inhoudelijk bekeken, 86 te starten, 0 volledig afgetekend.**

**F3-R19 (17 november 2026):** Boomklever, Boomkruiper, Taigaboomkruiper. 8 foto's tegen het bronbeeld; Boomkruiper-juveniel niet vrijgegeven (soort niet bewijsbaar); nieuwe dubbelgangers Boomkruiper–Taigaboomkruiper en Boomklever–Boomkruiper. Eerder: QA-fix F3-R18 (Vuurgoudhaan-juveniel en juvenielenpaar verborgen, Goudhaantje neutraal gelabeld). [F3-R19-bevindingen](docs/fotokwaliteit/F3_R19_BOOMKLEVER_BOOMKRUIPER_TAIGABOOMKRUIPER_2026-11-17_DRAFT.md). Stand: **57/140 inhoudelijk bekeken, 83 te starten, 0 volledig afgetekend.**

**F3-R20 (17 november 2026):** Witte Kwikstaart, Gele Kwikstaart, Veldleeuwerik. 8 foto's tegen het bronbeeld; Gele Kwikstaart-juveniel niet vrijgegeven; dubbelgangers Witte–Gele Kwikstaart en Veldleeuwerik–Graspieper. Media-audit: Commons-auteurs alleen bij herleidbare vormen gelijk (Flickr-/accountachtervoegsel, recordist + copyright holder). [F3-R20-bevindingen](docs/fotokwaliteit/F3_R20_WITTE_GELE_KWIKSTAART_VELDLEEUWERIK_2026-11-17_DRAFT.md). Stand: **60/140 inhoudelijk bekeken, 80 te starten, 0 volledig afgetekend.**
 Deze documentatie-only inhoudsronde is **geen extra appdeployment**; de werkende 1.27.21-hotspotpreview hoort bij PR #261 op de oudere app-SHA.


De eigenaar wil **opnieuw controleren vanaf de eerste van de bestaande 140 vogelsoorten** totdat de kaarten daadwerkelijk voldoen aan **alle laatst bevestigde afspraken**. **Geen nieuwe foto-/geluidsuitbreidingen voor soorten buiten deze 140**, inclusief bestaande soorten 141–597, vóórdat de eerste groep volledig volgens het bijgewerkte bewijscontract is afgetekend. Dit verbiedt geen correctie van een kritieke bug elders, maar stelt de inhoudelijke groeivolgorde vast.

**Herijking ≠ eerdere successen weggooien.** Behoud de bestaande F1/F2-bron- en auditregistraties, originele media, credits en historie. De oude F2-teller **84/140 opgepakt**, eerdere 101 `audited:true` en 15 oude `VERIFIED` zijn historische bewijsstanden, **geen nieuwe F3-FULL PASS**. Begin de nieuwe afzonderlijke F3-gate bij **0/140 volledig opnieuw afgetekend**, en doorloop de soorten vanaf `sp002` in kleine, onafhankelijke batches van maximaal drie; recheck eerder bewezen onderdelen alleen waar de bron/regel, vergelijkingsfoto, rechten of gebruikersweergave dat vereist.

**Alle relevante controles per soort:** herkomst/licentie/daadwerkelijke soort en rol van originele foto's, hoofdfoto/kleden/vlucht, correcte man/vrouw/juveniel-evidentie, complete twee-fotopaar-vergelijkingen, compacte foto's naast elkaar, rustig zang-/roepblok (met verplichte credits bereikbaar), audio herkomst/soort/rol/recht en offline speler, Vogelbescherming en werkelijk gelezen ANWB-passage, biometrie, Sovon en eBird met waarnemingsbias, persoonlijke vervangfoto/feedback, echte mobiele schermroute, bronnenbehoud en onafhankelijke hercontrole. Geen verkeerd zang-/roepfragment, veronderstelde toestemming of denkbeeldig geslachts-/leeftijdsetiket om een kaart compleet te verklaren; biologische niet-toepasselijkheid kan alleen met onderbouwd en controleerbaar uitzonderingsbesluit.

**Status en vindplaats:** [F3-140 nieuwe checklist](docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json), [eerste batch sp002/003/004](docs/fotokwaliteit/F3_R01_DUIVEN_HERCONTROLE_2026-11-15_DRAFT.md) en bestaand [geluids-/eBird-protocol](docs/audio/BIRDSPOT_EBIRD_SOVON_AUDIO_BRONPROTOCOL_V0.1_DRAFT.md). **F3-R01 (Houtduif, Holenduif, Turkse Tortel) is IN REVIEW / BLOCKED** omdat geluidsopnamen ontbreken en bron-/UX-/toestelbewijzen openstaan. PR #241 (foto's naast elkaar, één rustige audio-creditsuitklap) en PR #244 (Home-afstanden) zijn niet onderdeel van de geïntegreerde kandidaat-PR #242; voeg niet stilzwijgend losse CI-scores samen tot één app-PASS. Dat is een integratie-/preview- en releasegate.

**Releasegrens:** document- en F3-register-PASS of een groene CI betekent nog niet dat de actuele kandidaten publiek live zijn. Openbare review 1.27.6 blijft een andere SHA; werkelijke Android/PWA, offline/dataherstel, publicatierechten, beveiligde feedback/backend en gebruikersreview vallen onder de bestaande releasegates. `main`, preview en gebruikersdata worden niet zonder afzonderlijke gecontroleerde release gemuteerd.

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

De startfoto vult de kaart tot onder **Bekijk soortkaart** en **Veldkenmerken**. Naam, groep en wetenschappelijke naam staan rechtstreeks op het beeld. Een donkere letterrand houdt de tekst leesbaar. De knoppen laten het beeld doorschijnen. Op een klein scherm snijdt de Home-uitsnede de foto bij. **Vergroot foto** toont het volledige beeld met de bijbehorende maker en licentie.

De gedeelde soortkaart gebruikt een compacte kop met de vogelfamilie, Nederlandse naam en een regel voor de wetenschappelijke en Engelse naam. **Media Studio** staat naast **Eigen vogelfoto’s**. Als een waarnemingsfoto de lege hoofdfoto invult, blijft de knop voor een persoonlijke gidsfoto bereikbaar.

De tip bij een vergelijking en het label **Helpt** gebruiken dezelfde bosgroene leesstijl. **Let op** is een inhoudelijke determinatiewaarschuwing en krijgt een warm amberkleurig kader. Kleurparen voor tekst en achtergrond zijn als tokens vastgelegd voor licht, donker en systeemthema. De regressietest opent precies Wielewaal, Holenduif en Steppekiekendief en controleert de foto tot onder de actie, het contrast en de habitatpictogrammen op mobiel.

De pictogramcontrole omvat hoofdnavigatie, Home, soortdetail en leefgebied, waarnemingsformulier en -lijst, kaart, profiel, dagboek, inzichten, media, film en feedback. Boerenland, Heide, Polder, Kust, Wad en Moeras krijgen afzonderlijke pictogrammen. Waarnemingen krijgen een klembord, locaties een kaartpin, film een filmstrook en het dagboek een open boek. In formulier, lijst en kaart verwijzen oog, oor, gecombineerd pictogram en geluidsgolf naar dezelfde zicht- en geluidsbetekenissen. De woorden bij de pictogrammen blijven zichtbaar. Herstelpunt en testbewijs staan in de bijbehorende concept-PR.

### Vervolg voor soorten zonder gidsfoto

Beoordeel per soort de eerste gidsfoto en de volledige mobiele ervaring in dezelfde review. Controleer soort, kleed, houding, maker, licentie, zichtbare credits en beeldkwaliteit. Open vervolgens de soortkaart in licht en donker thema, toets contrast, leefgebiediconen en eventuele complete fotovergelijkingen. Zorg dat de gebruiker open fotosecties kan vullen, een gidsfoto voor zichzelf kan vervangen, de standaardfoto kan herstellen en de ZIP naar een tweede profiel kan terugzetten. Test de vrijwillige foto-inzending afzonderlijk van lokaal opslaan, inclusief foutmelding en ontvangst in de afgeschermde inbox. Bewijs ieder deel op de gebruikte commit en lever de mobiele preview bij dezelfde batch.
