# Birdspot F3-R37 · Rosse Grutto, Steenloper en Drieteenstrandloper

**DRAFT · PARTIALLY TESTED · 21 november 2026 · [PR #335](https://github.com/saddamsmit-source/Birdspot-Library/pull/335)**

Basis: vrijgegeven F3-R36 [#334](https://github.com/saddamsmit-source/Birdspot-Library/pull/334) `73c04e3f78d050a9b66809ca32c9af1a9180190c`. De F3-teller gaat van 108 naar **111/140 inhoudelijk beoordeeld, 29 NOT STARTED, 0 FULL PASS**. Alleen `sp149`, `sp150`, `sp152` worden in R37 herbeoordeeld. Historische F1/F2-registraties blijven intact.

## 1. Directe beoordeling van de zes bestaande gidsbeelden

Alle zes **lokale** WebP-afbeeldingen zijn via de GitHub-connector geopend en visueel bekeken op herkenbaar onderwerp, houding, zichtbare determinatiekenmerken en beeldkwaliteit. Deze controle is een eerste individuele visuele beoordeling, **geen** onafhankelijke ornithologische expertvalidatie, geen pixelvergelijking met het bronorigineel en geen nieuwe licentievrijgave.

| Soort en rol | Bestaande lokale afbeelding | Visuele observatie en onzekerheid | Git-blob SHA-1 |
|---|---|---|---|
| Rosse Grutto · hoofdfoto | `/assets/species/sp149.webp` | Volledig zijaanzicht in ondiep water, herkenbaar lange licht opgewipte snavel en roodbruine hals/borst. Geslacht niet uit bron vastgesteld; zichtbaar snavelpaar met Grutto, vluchtbeeld open. | `fdb6746e373e58e419c3bacc8c17b234e90faf18` |
| Steenloper · hoofdfoto | `/assets/species/sp150.webp` | Stilstaande vogel op rots, korte snavel, zwart-witte koptekening en kastanjebruine vleugeldekveren. Geen seksespecifiek etiket rechtvaardigen. | `9059e5cdb00a89af937e28754e23c0dc2489efe0` |
| Steenloper · vrije vlucht | `/assets/species/plumage/sp150-flight.webp` | Vliegende vogel boven water, geheven vleugel met contrastrijk wit en donkere uiteinden. Het bronbestand benoemt **niet-broedkleed**, niet leeftijd of geslacht. | `2fe4df95883943bca54779e374fb269368e4a83b` |
| Drieteenstrandloper · hoofdfoto | `/assets/species/sp152.webp` | Bleekgrijze/witte vogel op strand, korte donkere snavel, zwartachtige poten. Winter-/niet-broedkleedachtige kenmerken; geen individuele leeftijdsclaim. | `6c6066f48eac3cc17cfdca910669d836c43295d7` |
| Drieteenstrandloper · juveniel | `/assets/species/plumage/sp152-juv.webp` | Contrastrijke witgerande donkere bovenzijde, jonge-vogelachtige veertekening; historische bronannotatie `Juvenile`. De tweede technische controle heeft het individuele iNaturalist-origineel en de juvenielenannotatie geopend. Onafhankelijke vakaftekening blijft open. | `e9a9cdcc8ac5157e1fce2030752a674b35fdbb2a` |
| Drieteenstrandloper · groep in vlucht | `/assets/species/plumage/sp152-flight.webp` | Meerdere vogels werkelijk vrij boven water in vlucht; witte vleugelstrepen zichtbaar. Commons-bron beschrijft *immatures in fall*. Individuele leeftijden niet alsnog afgetekend. | `751436696af1a01ac1809eecb108f7ca94d87ab8` |

Geen gidsmedia zijn gedupliceerd of verwijderd. Er zijn geen nieuwe foto- of audiobytes toegevoegd. `assets/species/field-guide-media.json` en het daarvan gegenereerde `src/features/species/guideMedia.js` kregen één gerichte correctie: de oude onjuiste zin "De leeftijd staat niet in de bron" bij het vluchtbeeld van `sp152` is vervangen door "De bron noemt onvolwassen vogels in de herfst; leeftijd per afzonderlijke vogel is niet zelfstandig afgetekend." De [oorspronkelijke Commons-bron](https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_(3972936394).jpg) benoemt immers **immatures in fall**.

## 2. Individuele fotobronnen en gebruiksrechten

Bij de eerste review waren vijf Commons-fotobronnen toegankelijk. In de tweede technische review zijn alle zes originelen opgehaald en visueel vergeleken met de appbestanden. Vijf Commons-originelen kwamen overeen met hun bron-SHA-1. De iNaturalist-foto en [waarneming 16659229](https://www.inaturalist.org/observations/16659229) bevestigen foto-ID, maker, CC BY 4.0, soort en Juvenile-annotatie. Herpublicatie en volledige onafhankelijke vak- en rechtenaftekening blijven open.

| Lokale rol | Primaire bron | Maker / op bron gelezen licentie | Controle |
|---|---|---|---|
| `sp149.webp` | [Commons Rosse Grutto](https://commons.wikimedia.org/wiki/File:Bar-tailed_Godwit_%28Limosa_lapponica%29.jpg) | Ron Knight · CC BY 2.0 | origineel en bronmetadata gematcht |
| `sp150.webp` | [Commons Steenloper](https://commons.wikimedia.org/wiki/File:Tournepierre_%C3%A0_collier_Thyna010.jpg) | El Golli Mohamed · CC BY-SA 4.0 | origineel en bronmetadata gematcht |
| `sp150-flight.webp` | [Commons Steenloper in niet-broedkleed in vlucht](https://commons.wikimedia.org/wiki/File:Ruddy_turnstone_(Arenaria_interpres)_in_flight_non-breeding.jpg) | Charles J. Sharp · CC BY-SA 4.0 | bronmetadata en uitsnede gematcht |
| `sp152.webp` | [Commons Westkapelle](https://commons.wikimedia.org/wiki/File:Sanderling_Westkapelle_02.jpg) | Stephan Sprinz · CC BY 4.0 | origineel en bronmetadata gematcht |
| `sp152-juv.webp` | [iNaturalist foto 25120626](https://www.inaturalist.org/photos/25120626) | carnifex · CC BY 4.0 | foto, waarneming, bronlicentie en Juvenile-annotatie gecontroleerd |
| `sp152-flight.webp` | [Commons vluchtgroep](https://commons.wikimedia.org/wiki/File:Sanderling_(Calidris_alba)_(3972936394).jpg) | Dominic Sherony · CC BY-SA 2.0 | origineel en bronbenoemde leeftijdsgroep gematcht |

De Steenloper-vluchtbron specificeert niet-broedkleed. De juvenielenrol van Drieteenstrandloper steunt op de bronannotatie en de lichte veerranden. De Commons-vluchtgroep krijgt een neutraal groepslabel.

| Appbeeld | SHA-256 bronbestand | Beeldcorrelatie |
|---|---|---|
| sp149.webp | `30ef1bd1dedcb2da29e5566f6864543e0000ce6e9c0fa22d58fa31b8045f599a` | 0.99956 |
| sp150.webp | `1feb3e9061b70b60646cb0bf22001693a1ab92725c7a6ed8b1238b0c66472923` | 0.99973 |
| sp150-flight.webp | `6b4c337eea5b6eb966fb2b996bcd8595dbae336ba8ddafed3e48958326114cb2` | 0.99773 |
| sp152.webp | `2bb353eb75227ff799e0461edf7dc6acf26f8104d140922921c97fae0ba6d92b` | 0.99986 |
| sp152-juv.webp | `429971e7fc2540d380e4300e85440168143b79665b0a83abe6f9597d63caac4a` | 0.99976 |
| sp152-flight.webp | `640d7354119ac42d82c1dcae0cc447a18ef21a29038d60e63f4e2bc2f27e4b3f` | 0.99975 |

De beelden zijn na schaling vergeleken op genormaliseerde luminantie. Alleen de Steenloper-vluchtfoto is uitgelijnd op een uitsnede. Ook de gebruikte Grutto- en Bonte Strandloper-bronfoto’s zijn onafhankelijk gematcht.

## 3. Herkenningsinformatie, soortverwarring en leeftijd

- **Rosse Grutto · `sp149`:** compacte bouw, licht opgewipte snavel en gebandeerde staart; in vlucht geen brede witte vleugelstreep zoals Grutto. Het bestaande [Grutto–Rosse Grutto-rustpaar](../../src/features/species/guideComparisons.js) in LK-081 noemt beide richtingen. Het huidige Rosse-hoofdbeeld toont zijaanzicht maar niet de staart en vleugels in vlucht. Het getoonde rustpaar ondersteunt de snavelvorm. Een passend vluchtpaar ontbreekt. [Vogelbescherming Rosse Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rosse-grutto) · [Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grutto).
- **Steenloper · `sp150`:** contrastrijk kop-/borstpatroon, korte donkere snavel en oranje poten; jonge of wintervogels zijn minder roodbruin. In vlucht sterke witte patronen. De Vogelbescherming-gids noemt Bontbekplevier als mogelijke vergelijkingssoort. Nieuwe `LK-080` toont aan beide kanten **uitsluitend herkenningstekst** voor Steenloper en Bontbekplevier. `photoMissing: true` blokkeert een onterecht gelijkwaardig fotopaar; latere bron- en beeldreview blijft open. [Vogelbescherming Steenloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/steenloper) · [Bontbekplevier](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bontbekplevier).
- **Drieteenstrandloper · `sp152`:** korte vrijwel rechte donkere snavel, zwarte poten, in winter zeer licht; ontbrekende achterteen is alleen bij passend zicht te beoordelen. In de reeds bestaande vergelijking met Bonte Strandloper is snavelvorm relevant. LK-082 legt het aanwezige rustpaar vast. Bonte Strandloper is bronbenoemd in niet-broedkleed. De precieze fase van het bleke Drieteenstrandloper-hoofdbeeld staat open. Drieteen-juveniel heeft een historisch label en zichtbaar lichte veerranden, maar geen onafhankelijke tweede leeftijdsdeterminatie. [Vogelbescherming Drieteenstrandloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/drieteenstrandloper) · [Bonte Strandloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bonte-strandloper).

Een veldherkenningskenmerk wordt niet op zichzelf "doorslaggevend" genoemd zonder de vereiste onderbouwde omstandigheden en onafhankelijke bronnen. De twee bestaande fotoparen blijven **PARTIALLY TESTED**. De bijgewerkte LK-080-tekst gebruikt snavelvorm en kleur. Een relatief langere Bontbekplevier-snavel wordt niet als verschil gebruikt. [Bontbekplevier-meetreeks](https://www.tandfonline.com/doi/pdf/10.1080/03078698.2007.9674358) · [Steenloper-meetreeks](https://absa.asn.au/wp-content/uploads/2022/02/Ruddy-Turnstone-BIH2-NZ.pdf)

## 4. Audio, biometrie, Sovon, eBird, privacy

**Geen van deze drie soorten heeft een bestaande lokale gidsopname** in de actuele `field-guide-media.json` of `AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json`. Zang/roep, herkomst, licentie, hoorbare soortidentiteit en offline audio blijven BLOCKED/NOT TESTED. Er zijn geen audiobestanden uit een onduidelijke of uitsluitend niet-commerciële bron toegevoegd.

- [Sovon Rosse Grutto](https://stats.sovon.nl/stats/soort/5340): jaarrond niet-broedvogel; aantallen pieken bij de trek. De appstatus wintergast/doortrekker, `jan-dec` wordt daarom behouden.
- [Sovon Steenloper](https://stats.sovon.nl/stats/soort/5610): Nederland vooral niet-broedtijd, met piek in trekseizoenen; geen bewezen broedgeval. De appstatus wintergast/doortrekker, `jan-dec` wordt behouden.
- [Sovon Drieteenstrandloper](https://stats.sovon.nl/stats/soort/4970): wintergast en doortrekker aan Nederlandse kust. De soortkaart geeft al een `ca.`-lengte met Vogelbescherming en RSPB als historische twee-uitgeversbasis; herberekening niet nodig zonder nieuwe bronwaarden.

ANWB-soortpassages, de individuele tweede onafhankelijke biometrie- en kennisreview, actuele Nederlandse eBird-vergelijking/waarnemingsbias en menselijke vakvalidatie zijn **OPEN**. Bewaar de bestaande aantallen, soortstatussen en taxonomie zolang nieuw bewijs niet voldoende is. Exacte privé-waarnemingslocaties en gevoelige bijlagen blijven privé; deze ronde voegt geen publieke deelfunctie toe.

## 5. Testcontract, herstelpunt en volgende stap

De Node-regressies controleren de levende tellers zonder het F3-totaal aan één ronde vast te zetten. De centrale vergelijkingsvalidator controleert de drie registerparen. De R37-test controleert de zes lokale media-bestanden en Git-blob-SHA's, het `sp152`-bronbijschrift, bestaande wederzijdse vergelijkingen en `LK-080` zonder fake fotopaar. Gerichte Chromium-proeven moeten de drie kaarten en broncredits op 320/360/390 px inspecteren, afbeeldingszoom en navigatie controleren en de foto's zonder audio bij offline heropening decoderen. De bestaande opslag-/herstel-, media-, kaarten- en eerdere F3-regressies mogen niet verslechteren.

**Bewijsgrens:** CI is code- en browserbewijs op de concrete PR-SHA; onafhankelijk ornithologisch oordeel, volledige rechtenaftekening, fysieke Samsung PWA-installatie, GPS/camera/microfoon, echte Merlin-handoff, ZIP-herstel op een tweede toestel, preview/productie blijven afzonderlijk OPEN. Geen FULL PASS of live zonder apart eigenaarbesluit.

Volgende eerste drie NOT STARTED na R37: **Bonte Strandloper `sp153`, Oeverloper `sp155`, Witgat `sp156`**.

**EINDMARKERING — F3-R37 · 111/140 · 29 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
