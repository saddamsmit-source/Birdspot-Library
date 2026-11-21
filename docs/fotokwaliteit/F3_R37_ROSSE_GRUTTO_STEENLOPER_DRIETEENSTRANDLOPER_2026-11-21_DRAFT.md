# Birdspot F3-R37 · Rosse Grutto, Steenloper en Drieteenstrandloper

**DRAFT · PARTIALLY TESTED · 21 november 2026 · [PR #335](https://github.com/saddamsmit-source/Birdspot-Library/pull/335)**

Basis: vrijgegeven F3-R36 [#334](https://github.com/saddamsmit-source/Birdspot-Library/pull/334) `73c04e3f78d050a9b66809ca32c9af1a9180190c`. De F3-teller gaat van 108 naar **111/140 inhoudelijk beoordeeld, 29 NOT STARTED, 0 FULL PASS**. Alleen `sp149`, `sp150`, `sp152` worden in R37 herbeoordeeld. Historische F1/F2-registraties blijven intact.

## 1. Directe beoordeling van de zes bestaande gidsbeelden

Alle zes **lokale** WebP-afbeeldingen zijn via de GitHub-connector geopend en visueel bekeken op herkenbaar onderwerp, houding, zichtbare determinatiekenmerken en beeldkwaliteit. Deze controle is een eerste individuele visuele beoordeling, **geen** onafhankelijke ornithologische expertvalidatie, geen pixelvergelijking met het bronorigineel en geen nieuwe licentievrijgave.

| Soort en rol | Bestaande lokale afbeelding | Visuele observatie en onzekerheid | Git-blob SHA-1 |
|---|---|---|---|
| Rosse Grutto · hoofdfoto | `/assets/species/sp149.webp` | Volledig zijaanzicht in ondiep water, herkenbaar lange licht opgewipte snavel en roodbruine hals/borst. Geslacht niet uit bron vastgesteld; geen passend Grutto-fotopaar of vluchtbeeld. | `fdb6746e373e58e419c3bacc8c17b234e90faf18` |
| Steenloper · hoofdfoto | `/assets/species/sp150.webp` | Stilstaande vogel op rots, korte snavel, zwart-witte koptekening en kastanjebruine vleugeldekveren. Geen seksespecifiek etiket rechtvaardigen. | `9059e5cdb00a89af937e28754e23c0dc2489efe0` |
| Steenloper · vrije vlucht | `/assets/species/plumage/sp150-flight.webp` | Vliegende vogel boven water, geheven vleugel met contrastrijk wit en donkere uiteinden. Het bronbestand benoemt **niet-broedkleed**, niet leeftijd of geslacht. | `2fe4df95883943bca54779e374fb269368e4a83b` |
| Drieteenstrandloper · hoofdfoto | `/assets/species/sp152.webp` | Bleekgrijze/witte vogel op strand, korte donkere snavel, zwartachtige poten. Winter-/niet-broedkleedachtige kenmerken; geen individuele leeftijdsclaim. | `6c6066f48eac3cc17cfdca910669d836c43295d7` |
| Drieteenstrandloper · juveniel | `/assets/species/plumage/sp152-juv.webp` | Contrastrijke witgerande donkere bovenzijde, jonge-vogelachtige veertekening; historische bronannotatie `Juvenile`. iNaturalist-fotopagina niet rechtstreeks heropend: definitieve leeftijd en rechten nog OPEN. | `e9a9cdcc8ac5157e1fce2030752a674b35fdbb2a` |
| Drieteenstrandloper · groep in vlucht | `/assets/species/plumage/sp152-flight.webp` | Meerdere vogels werkelijk vrij boven water in vlucht; witte vleugelstrepen zichtbaar. Commons-bron beschrijft *immatures in fall*. Individuele leeftijden niet alsnog afgetekend. | `751436696af1a01ac1809eecb108f7ca94d87ab8` |

Geen gidsmedia zijn gedupliceerd of verwijderd. Er zijn geen nieuwe foto- of audiobytes toegevoegd. `assets/species/field-guide-media.json` en het daarvan gegenereerde `src/features/species/guideMedia.js` kregen één gerichte correctie: de oude onjuiste zin "De leeftijd staat niet in de bron" bij het vluchtbeeld van `sp152` is vervangen door "De bron noemt onvolwassen vogels in de herfst; leeftijd per afzonderlijke vogel is niet zelfstandig afgetekend." De [oorspronkelijke Commons-bron](https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_(3972936394).jpg) benoemt immers **immatures in fall**.

## 2. Individuele fotobronnen en gebruiksrechten

De oorspronkelijke bronpagina’s van **vijf Commons-afbeeldingen** zijn gelezen op soortomschrijving, fotograaf en licentie; de zesde iNaturalist-pagina was niet toegankelijk. Voor de vijf gelezen Commons-bronnen komen maker en licentie overeen met de Birdspot-registratie. Hun vermelde Creative Commons-voorwaarden vereisen passende credit, licentielink en bewerkingsvermelding, en bij BY-SA ook toepasselijke share-alike-behandeling van de aanpassing. Het blijft noodzakelijk om het precieze lokale bestand aan het origineel te matchen; de visuele bron-pixelcontrole en een afzonderlijke controle van de app-creditweergave zijn hier nog niet uitgevoerd.

| Lokale rol | Primaire bron | Maker / op bron gelezen licentie | Controle |
|---|---|---|---|
| `sp149.webp` | [Commons Rosse Grutto](https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit_%28Limosa_lapponica%29.jpg) | Ron Knight · CC BY 2.0 | bronmetadata gelezen; pixelmatch open |
| `sp150.webp` | [Commons Steenloper](https://commons.wikimedia.org/wiki/File:Tournepierre_%C3%A0_collier_Thyna010.jpg) | El Golli Mohamed · CC BY-SA 4.0 | bronmetadata gelezen; pixelmatch open |
| `sp150-flight.webp` | [Commons Steenloper in niet-broedkleed in vlucht](https://commons.wikimedia.org/wiki/File:Ruddy_turnstone_(Arenaria_interpres)_in_flight_non-breeding.jpg) | Charles J. Sharp · CC BY-SA 4.0 | bronmetadata/pose gelezen; pixelmatch open |
| `sp152.webp` | [Commons Westkapelle](https://commons.wikimedia.org/wiki/File:Sanderling_Westkapelle_02.jpg) | Stephan Sprinz · CC BY 4.0 | bronmetadata gelezen; pixelmatch open |
| `sp152-juv.webp` | [iNaturalist foto 25120626](https://www.inaturalist.org/photos/25120626) | carnifex · CC BY 4.0 volgens bestaand register | primaire bron/licentie **niet opnieuw toegankelijk**, open |
| `sp152-flight.webp` | [Commons vluchtgroep](https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_(3972936394).jpg) | Dominic Sherony · CC BY-SA 2.0 | bronmeta en leeftijdsgroep gelezen; pixelmatch open |

Let op: de Commons-fotopagina van Steenloper in vlucht benoemt een niet-broedvogel boven water bij Madagascar; het lokale beeld mag niet zonder extra bewijs als een volwassen mannetje in broedkleed worden gebruikt. De Drieteenstrandloper-juv-foto heeft zonder toegankelijk oorspronkelijk iNaturalist-record geen volledig herbevestigde rechtenstatus.

## 3. Herkenningsinformatie, soortverwarring en leeftijd

- **Rosse Grutto · `sp149`:** compacte bouw, licht opgewipte snavel en gebandeerde staart; in vlucht geen brede witte vleugelstreep zoals Grutto. Het bestaande [Grutto–Rosse Grutto-tekstpaar](../..//src/features/species/guideComparisons.js) noemt beide richtingen. Het huidige Rosse-hoofdbeeld toont zijaanzicht maar niet de staart en vleugels in vlucht. Apart, gelijkwaardig fotopaar bij de vergelijking ontbreekt. [Vogelbescherming Rosse Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rosse-grutto) · [Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grutto).
- **Steenloper · `sp150`:** contrastrijk kop-/borstpatroon, korte donkere snavel en oranje poten; jonge of wintervogels zijn minder roodbruin. In vlucht sterke witte patronen. De Vogelbescherming-gids noemt Bontbekplevier als mogelijke vergelijkingssoort. Nieuwe `LK-080` toont aan beide kanten **uitsluitend herkenningstekst** voor Steenloper en Bontbekplevier. `photoMissing: true` blokkeert een onterecht gelijkwaardig fotopaar; latere bron- en beeldreview blijft open. [Vogelbescherming Steenloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/steenloper) · [Bontbekplevier](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bontbekplevier).
- **Drieteenstrandloper · `sp152`:** korte vrijwel rechte donkere snavel, zwarte poten, in winter zeer licht; ontbrekende achterteen is alleen bij passend zicht te beoordelen. In de reeds bestaande vergelijking met Bonte Strandloper is snavelvorm relevant. Er is nog geen gelijkwaardig winter-fotopaar. Drieteen-juveniel heeft een historisch label en zichtbaar lichte veerranden, maar geen onafhankelijke tweede leeftijdsdeterminatie. [Vogelbescherming Drieteenstrandloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/drieteenstrandloper) · [Bonte Strandloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bonte-strandloper).

Een veldherkenningskenmerk wordt niet op zichzelf "doorslaggevend" genoemd zonder de vereiste onderbouwde omstandigheden en onafhankelijke bronnen. De twee tekstparen zijn **PARTIALLY TESTED** totdat de soort, foto’s, bijpassend kleed en echte UI in beide richtingen zijn bewezen.

## 4. Audio, biometrie, Sovon, eBird, privacy

**Geen van deze drie soorten heeft een bestaande lokale gidsopname** in de actuele `field-guide-media.json` of `AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json`. Zang/roep, herkomst, licentie, hoorbare soortidentiteit en offline audio blijven BLOCKED/NOT TESTED. Er zijn geen audiobestanden uit een onduidelijke of uitsluitend niet-commerciële bron toegevoegd.

- [Sovon Rosse Grutto](https://stats.sovon.nl/stats/soort/5340): jaarrond niet-broedvogel; aantallen pieken bij de trek. De appstatus wintergast/doortrekker, `jan-dec` wordt daarom behouden.
- [Sovon Steenloper](https://stats.sovon.nl/stats/soort/5610): Nederland vooral niet-broedtijd, met piek in trekseizoenen; geen bewezen broedgeval. De appstatus wintergast/doortrekker, `jan-dec` wordt behouden.
- [Sovon Drieteenstrandloper](https://stats.sovon.nl/stats/soort/4970): wintergast en doortrekker aan Nederlandse kust. De soortkaart geeft al een `ca.`-lengte met Vogelbescherming en RSPB als historische twee-uitgeversbasis; herberekening niet nodig zonder nieuwe bronwaarden.

ANWB-soortpassages, de individuele tweede onafhankelijke biometrie- en kennisreview, actuele Nederlandse eBird-vergelijking/waarnemingsbias en menselijke vakvalidatie zijn **OPEN**. Bewaar de bestaande aantallen, soortstatussen en taxonomie zolang nieuw bewijs niet voldoende is. Exacte privé-waarnemingslocaties en gevoelige bijlagen blijven privé; deze ronde voegt geen publieke deelfunctie toe.

## 5. Testcontract, herstelpunt en volgende stap

De nieuwe Node-test controleert de zes lokale media-bestanden en Git-blob-SHA's, het `sp152`-bronbijschrift, bestaande wederzijdse vergelijkingen en `LK-080` zonder fake fotopaar. Gerichte Chromium-proeven moeten de drie kaarten en broncredits op 320/360/390 px inspecteren, afbeeldingszoom en navigatie controleren en de foto's zonder audio bij offline heropening decoderen. De bestaande opslag-/herstel-, media-, kaarten- en eerdere F3-regressies mogen niet verslechteren.

**Bewijsgrens:** CI is code- en browserbewijs op de concrete PR-SHA; onafhankelijk ornithologisch oordeel, exacte originele pixel- en licentiecheck, fysieke Samsung PWA-installatie, GPS/camera/microfoon, echte Merlin-handoff, ZIP-herstel op een tweede toestel, preview/productie blijven afzonderlijk OPEN. Geen FULL PASS of live zonder apart eigenaarbesluit.

Volgende eerste drie NOT STARTED na R37: **Bonte Strandloper `sp153`, Oeverloper `sp155`, Witgat `sp156`**.

**EINDMARKERING — F3-R37 · 111/140 · 29 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
