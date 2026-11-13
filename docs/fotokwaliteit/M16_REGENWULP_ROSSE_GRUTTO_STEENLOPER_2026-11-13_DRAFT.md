# Birdspot Library — M16, eerste onafhankelijke fotobeoordeling van 3 kuststeltlopers

**Datum:** 13 november 2026 · **Status:** DRAFT / PARTIALLY TESTED · **Scope:** F1 eerste visuele soort-/bronreview, geen volledige negenpunts-/F2-/release-PASS.

**Soorten:** Regenwulp \`sp148\` (*Numenius phaeopus*), Rosse Grutto \`sp149\` (*Limosa lapponica*), Steenloper \`sp150\` (*Arenaria interpres*).

**Basis/visueel gecontroleerde repository-HEAD:** M15 PR #180, \`e5bfb1ad874f1aa383fcc17db6073407e733f9f7\`. **Oudere onveranderde checkpoints:** \`main 5bf67043e830e977749f0ee593cf9f41f0e2822b\`; publieke review-branch \`21ce9060f789103cfbba98fa78f6b53f4b9cea5b\` (1.27.6). M16 wordt uitsluitend op een nieuwe QA-branch voorgesteld. Geen publicatie.

## 1. Werkelijke foto-inventaris en onafhankelijke kijkcontrole

De vier **werkelijk geregistreerde lokale Birdspot-WebP's** zijn als binaire bestanden via de GitHub-connector op deze SHA geopend, visueel beoordeeld, en hebben verschillende Git-blob-SHA's. Dit zijn GEEN screenshots of andere foto's van internet. De originele Commons-bestandspagina's zijn afzonderlijk in de openbare browser gelezen. Daarop kloppen soortnaam, maker en CC-licentietype met de huidige Birdspot-bronregistratie. Een exacte originele JPEG ↔ lokale, soms verkleinde/bijgesneden WebP pixel-/perceptuele overeenkomst is **NIET** met een zelfstandige origineel-download bewezen. Copyrightconformiteit van alle uiteindelijke afgeleiden/vermeldingen moet bij F2 opnieuw worden getoetst.

| Soort / rol | Exacte lokale foto op M15 HEAD | Origineel: auteur en geregistreerde licentie | Visueel oordeel / bronbewijs |
|---|---|---|---|
| Regenwulp · hoofdfoto | [sp148.webp](https://github.com/saddamsmit-source/Birdspot-Library/blob/e5bfb1ad874f1aa383fcc17db6073407e733f9f7/assets/species/sp148.webp) · Git blob \`f49b6219ebeb12600a4274e751ae21585bcfcec3\` | [Commons: Whimbrel Dalvikurbyggd](https://commons.wikimedia.org/wiki/File:Whimbrel_(Numenius_phaeopus)_Dalvikurbyggd.jpg) · Charles J. Sharp · CC BY-SA 4.0 | **DUIDELIJK:** gehele vogel op steen, naar beneden gebogen snavel, lichte middenkruinstreep/donkere kopstrepen; geschikt als hoofdfoto. Geslacht/leeftijd niet uit deze foto afgeleid. |
| Rosse Grutto · hoofdfoto | [sp149.webp](https://github.com/saddamsmit-source/Birdspot-Library/blob/e5bfb1ad874f1aa383fcc17db6073407e733f9f7/assets/species/sp149.webp) · \`fdb6746e373e58e419c3bacc8c17b234e90faf18\` | [Commons: Bar-tailed Godwit](https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit_(Limosa_lapponica).jpg) · Ron Knight · CC BY 2.0; origineel 960×640 | **DUIDELIJK:** staande slanke steltloper in warm roestbruin kleed, lange iets opgewipte snavel; goede hoofdrol. De opname alléén bewijst geen individueel geslacht, leeftijd of ondersoort. |
| Steenloper · hoofdfoto | [sp150.webp](https://github.com/saddamsmit-source/Birdspot-Library/blob/e5bfb1ad874f1aa383fcc17db6073407e733f9f7/assets/species/sp150.webp) · \`9059e5cdb00a89af937e28754e23c0dc2489efe0\` | [Commons: Tournepierre à collier Thyna010](https://commons.wikimedia.org/wiki/File:Tournepierre_%C3%A0_collier_Thyna010.jpg) · El Golli Mohamed · CC BY-SA 4.0 | **STERK:** scherp volbeeld in zomers ogend bont kleed, korte oranje poten, korte rechte snavel, kop/borstcontrast. Foto toont geen zelfstandig bewezen mannetje. |
| Steenloper · In vlucht | [sp150-flight.webp](https://github.com/saddamsmit-source/Birdspot-Library/blob/e5bfb1ad874f1aa383fcc17db6073407e733f9f7/assets/species/plumage/sp150-flight.webp) · \`2fe4df95883943bca54779e374fb269368e4a83b\` | [Commons: Ruddy turnstone in flight, non-breeding](https://commons.wikimedia.org/wiki/File:Ruddy_turnstone_(Arenaria_interpres)_in_flight_non-breeding.jpg) · Charles J. Sharp · CC BY-SA 4.0 | **WERKELIJKE VLUCHT:** vrij boven water, een geheven uitgespreide vleugel, contrasterend zwart-wit in vleugel/rug/staart, snavel duidelijk. Origineel omschrijft *non-breeding*, niet mannetje. Lokale metadata vermeldt bijsnijden van een 1280px-weergave: afgeleide licentie en credit in F2 controleren. |

**Uniciteit:** de vier Git-blob-SHA's zijn afzonderlijk en de beelden visueel niet identiek. Ook de vier geregistreerde originele Commons-URL's verschillen. Dit controleert alleen deze vier gepresenteerde bestanden, **niet** alle hergebruikte crops in de hele gids of de originele JPEG-binaryhash.

**Ontbrekende foto-posities:** \`assets/species/field-guide-media.json\` heeft voor deze drie **geen** \`plumage\`-items. \`poses.sp150\` bevat één echte flight-registratie; Regenwulp en Rosse Grutto hebben daar geen vluchtfoto. Ook afzonderlijke man-, vrouw- en juvenielenbeelden ontbreken voor deze drie. Geen onterechte vijf-foto-compleetclaim, geen fictieve geslachtslabels en geen hergebruikte hoofdfoto als nieuwe beeldbron. Een eenvoudige fotoverwijzing naar de hero is niet hetzelfde als een extra foto.

## 2. Ornithologische feitencontrole — F1, geen volledig kennisprofiel

Vergelijking met afzonderlijk gelezen soortpagina's van Vogelbescherming Nederland:
- [Regenwulp](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/regenwulp): kleinere wulp, sterk getekende kop, kortere gebogen snavel; NL vooral doortrekker. \`src/data/species.js\`: lengte 40–46 cm, spanwijdte 76–89 cm, overeenkomst met deze bron. Bestaande vaste vergelijking **Wulp versus Regenwulp** is in \`guideComparisons.js\` aanwezig.
- [Rosse Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rosse-grutto): langere licht opgewipte snavel, geen brede witte vleugelstreep, gebandeerde staart; NL doortrekker/wintergast. Geregistreerde lengte 37–41 en spanwijdte 70–80 cm komen overeen. Bestaande vaste vergelijking **Grutto versus Rosse Grutto** is aanwezig. Foto laat geen individuele seksedeterminatie met bronbewijs zien.
- [Steenloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/steenloper): oranje poten, korte snavel, zwart/wit/roestbruin; opvallende witte vleugel-/stuittekening in vlucht. Geregistreerd 21–25 cm tegen 21–26 cm bij Vogelbescherming: klein natuurlijk verschil, geen inhoudelijke blokkade volgens kwaliteitsnorm §1. **Geen** vaste Steenloper-specifieke vergelijking in \`guideComparisons.js\`; mogelijke toevoeging later beoordelen.

**Kwaliteitswens / tekstprecisie:** \`plumage.adult_m\` in \`src/data/species.js\` bevat bij Regenwulp algemene soortkenmerken en bij Steenloper enkel 'Oranje poten' (niet man-specifiek). Dit is **niet** genoeg bewijs voor een mannetjesportret. In fase F2 beoordelen of de tekstrollen neutraler moeten worden weergegeven; bron-/generatorcontract respecteren en niet stilzwijgend de taxonomie of soortgegevens aanpassen.

**Kennisstatus:** de drie \`sp148/sp149/sp150\` hebben op de gecontroleerde basis nog **geen** volledig eigen \`tools/kennisbaseline/knowledge.json\`-kennisprofiel. Land-/seizoen-/biometrieregels zijn alleen steekproefsgewijs bekeken. Geen encyclopedische F2-PASS of onafhankelijke ornithologische eindkeuring.

## 3. Testcontract, status en releasegrens

M16-test \`tests/test_m16_sparse_coastal_waders.py\` en bijbehorende CI-workflow controleren op de **uiteindelijke QA-SHA**: precies deze 4 WebP-binaries en unieke bronnen, RIFF/WEBP, EXIF/XMP-vrije top-level chunkstructuur, geen nieuwe persoons-/kleedlabels, 140 canonieke soorten en ongewijzigde officiële audit 100, F1-telling **114/140** als en alleen als deze batch is opgenomen, plus werkelijke Chromium-UI op 360/390px: hero laadt, fotozoom/Escape, Steenloper vlucht los van hero, afwezigheid van verzonnen fotogalerij, relevante bestaande vergelijkingen en geen horizontale overflow.

- **F1-status:** PARTIALLY TESTED voor M16. De extra drie tellen als eerste beoordeling; de officiële 9-puntsstatus blijft 100/140 (niet allemaal VERIFIED). Bij opname: 114/140 F1 en 26 nog zonder eerste beurt.
- **Bronrechten:** oorspronkelijke vier Commons-pagina's zelfstandig gelezen en maker/licentiepatroon bevestigd. Exacte originele pixels, complete individuele leeftijd-/seksebijschriften en volledige afgeleide licentie-/creditpresentatie **NOT TESTED**. F1-json houdt daarom \`originalRights: NOT TESTED\`.
- **UI/CI:** alleen VERIFIED wanneer de nieuwe workflow op de eigen definitieve HEAD \`completed/success\` meldt. Tot dat moment NOT TESTED; een groen resultaat toetst géén biologische of juridische eindkwaliteit.
- **Fysiek toestel:** Android/iOS, geïnstalleerde PWA, echte camera/locatie, offline opslag/herstel en productie in deze M16-ronde **NOT TESTED**.
- **Bronbehoud:** nul nieuwe/gecorrigeerde binaire foto's, geen app-/knowledge-/serviceworker-wijziging, geen private waarnemingen aangeraakt.
- **Release:** geen merge naar \`main\` of publieke review, geen Vercel/GitHub Pages-deploy of livegang. Releasegate blijft NO-GO voor deze conceptbatch.

## 4. Vervolg en herstel

**F1:** na M16 nog 26 van de oorspronkelijke 140 individueel eerste-beoordelen, batches maximaal drie soorten. Eerst F1 140/140, daarna **alle 140 volledig opnieuw F2 verifiëren**, pas daarna buiten de 140 uitbreiden. Volgende soortkeuze op basis van de canonieke tracker (géén handmatige verzonnen telling).

**Verbeterwensen:** (1) passende open-gelicentieerde vluchtfoto's voor Regenwulp/Rosse Grutto zoeken en werkelijk verifiëren; (2) per soort man/vrouw/juveniel alleen tonen als individueel vaststelbaar; (3) Steenlopervergelijking als UX-kandidaat; (4) F2 bronbeeld/crop/rechten/credit én datum; (5) mannetjestekst-precisie. Geen fotovervanging zonder betere bron en gecontroleerde rechten.

**SIGNAAL → RISICO → MAATREGEL → CHECKPOINT:** lange gestapelde PR-keten en open bewijs voor lokale↔originele beeldmatch → onterechte PASS of overschrijven van andermans branch → alleen eigen nieuwe QA-branch, oorspronkelijke foto's intact, restpunten expliciet → terugval: sluit de nieuwe M16-PR; M15 PR #180 op \`e5bfb1ad874f1aa383fcc17db6073407e733f9f7\` blijft beschikbaar.

**Learning:** WEL: exacte huidige media bekijken, originele Commons-licentie per bestand lezen, sparse fotodekking eerlijk als onvolledig registreren. NIET: ontbrekende rollen vullen met synthetische geslachtsclaims; bronmetadata of groene browser-UI gelijkstellen aan originele JPEG-match, F2 of release. Bestaande \`docs/BIRDSPOT_KWALITEITSNORM.md\` is leidend; geen dubbel normboek.

**Onafhankelijkheidsgrens:** ChatGPT heeft deze vier lokale Birdspot-WebP's zelf visueel beoordeeld en de vier publieke Commons-pagina's plus Vogelbescherming geraadpleegd. Er is geen apart ornitholoog, binaire originelen-hashcheck, fysieke toestelpiloottest of juridische eindbeoordeling.
