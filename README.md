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

## Snel waarnemen via de centrale + knop en Merlin — eigenaarbesluit 15 november 2026

**Gewenste kern-UX (op de geïntegreerde releasebranch technisch geïmplementeerd; geïntegreerde CI en fysieke praktijkproef zijn nog releasegates):** achter de bestaande centrale **+ / Waarnemen**-knop komt een duidelijke tweekeuze: **`Vogel gezien / waarneming toevoegen`** of **`Geluid herkennen met Merlin`**. De eerste keuze opent zonder Merlin de huidige Birdspot-waarnemingsroute; de tweede laat de gebruiker Merlin Bird ID als **gratis externe herkenningshulp** gebruiken en daarna via dezelfde Birdspot-formulier-/kaartpinroute een soort **zelf bevestigen en registreren**. Dit moet op het hoofdscherm direct werken en mag de bestaande appbrede + functie, datum/locatie, Gezien/Gehoord/Beide, persoonlijke kaart, offline opslag, ZIP-herstel, terugnavigatie of bronstatus niet verstoren.

**Bewijsgrens:** de huidige code heeft al `seen/heard/both`, `identificationSource=merlin`, handmatige `merlinVerification` en `openPinPicker`, en de geïntegreerde + knop toont nu de twee keuzes **Vogel gezien** / **Geluid herkennen** met afzonderlijke herkenbare pictogrammen, en de huidige waarnemingsbestandskiezer accepteert **foto/video, geen audio**. Merlin ondersteunt bestandsdelen/importeren; een **officieel automatische resultaat-API, direct openen naar Sound ID of terugkeer met soort-ID naar Birdspot** is niet aangetoond. Ontwerp daarom eerst **veilige handmatige terugkeer/soortkeuze**, met expliciete status `suggestie` tegenover `zelf gecontroleerd`. Alleen een daadwerkelijk **geziene** vogel mag als `Gezien` worden geteld; na uitsluitend gehoord geluid blijft het `Gehoord`. Een privépin komt uitsluitend van Birdspot/GPS/gebruikerskeuze, niet uit Merlin.

De gratis externe Merlin-route wordt **niet achter een paywall geplaatst**. Een later zelfstandig, commercieel gelicentieerd Birdspot Sound Plus is een ander kandidaatproduct. **Uitvoering in aparte kleine, toetsbare batches** na remote writer-/HEAD-check en actuele F2-afweging; geen koppeling, opname-import of release claimen vóór fysieke Android/iOS- en offline/restoretests. [Uitwerking en acceptatiecriteria: Birdspot + / Merlin Snelwaarnemen v0.1 DRAFT](docs/roadmap/BIRDSPOT_PLUS_MERLIN_SNELWAARNEMEN_V0.1_DRAFT.md).

## Veldluistermodus — meerdere vogels beluisteren en gezamenlijk registreren (15 november 2026)

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
