# Birdspot F3-R39 · Zwarte Ruiter, Groenpootruiter en Bosruiter

**DRAFT · PARTIALLY TESTED · 22 november 2026 · [PR #339](https://github.com/saddamsmit-source/Birdspot-Library/pull/339).** Basis: R38 [PR #338](https://github.com/saddamsmit-source/Birdspot-Library/pull/338), commit `641a24f88ac7d0b76aa6843bec82b017eca2dc5c` (3/3 GitHub-workflows succesvol, writerclaim vrijgegeven). F3-registratie gaat van **114/140** naar **117/140 inhoudelijk bekeken, 23 te starten, 0 FULL PASS**. Alleen `sp157`, `sp158`, `sp159` krijgen een nieuwe F3-inhoudsreview; de 140 historische auditobjecten blijven intact.

## 1. Individuele lokale beeldcontrole

De twaalf al aanwezige WebP-foto’s zijn op dezelfde R38 Git-tree één voor één geopend en visueel beoordeeld op soortvorm, zichtbare kleedkenmerken, vluchtpose, beeldkwaliteit en impliciete leeftijd/geslachtsclaims. **Bewijsgrens:** Git-blobhash en zichtbare beelden bewijzen uitsluitend de lokale toestand; de originele opname, maker/licentie en eventuele bewerking moeten onafhankelijk aan de lokale afbeelding worden gematcht. Een URL, Research-grade-label of historisch `reviewed` bewijst niet automatisch correcte leeftijd of herpublicatie.

| Soort en foto-rol | Lokaal pad | Git-blob SHA-1 van rechtstreeks bekeken lokale WebP | Bestaande primaire bronvermelding en licentiemetadata — NIET hernieuwd vrijgegeven |
|---|---|---|---|
| Zwarte Ruiter · Hoofd | `/assets/species/sp157.webp` | `e8a42385c4f9bc8e8d1820b3cbcc0ddcce505d90` | [bron](https://www.inaturalist.org/photos/121189174) · Jan Ebr & Ivana Ebrová · CC BY 4.0 |
| Zwarte Ruiter · Juveniel | `/assets/species/plumage/sp157-juv.webp` | `511e6d043a553f4ee754c9efdcff6fb22e78f6b4` | [bron](https://www.inaturalist.org/photos/722959312) · Phil James · CC BY 4.0 |
| Zwarte Ruiter · Winter | `/assets/species/plumage/sp157-winter.webp` | `97e6aa36c333857084991913485ade669b570c46` | [bron](https://www.inaturalist.org/photos/603401014) · Cameron Findlay · CC BY 4.0 |
| Zwarte Ruiter · Vlucht | `/assets/species/plumage/sp157-flight.webp` | `39a4896659211f9850ec1ecbdedc8c8c1d6059e1` | [bron](https://www.inaturalist.org/photos/711147296) · Barry Stewart · CC BY 4.0 |
| Groenpootruiter · Hoofd | `/assets/species/sp158.webp` | `21e9c57233621c8c5ee366e418ca1dddd6ce0d6a` | [bron](https://www.inaturalist.org/photos/198450766) · Pål A. Olsvik · CC BY 4.0 |
| Groenpootruiter · Juveniel | `/assets/species/plumage/sp158-juv.webp` | `eeadde3e16dc5fc2dd4e6b4f398be6e0e0869122` | [bron](https://www.inaturalist.org/photos/168627338) · Se Lena · CC BY 4.0 |
| Groenpootruiter · Winter | `/assets/species/plumage/sp158-winter.webp` | `95824f564d2acc9af77ad3d6a0f769f75a5e54fc` | [bron](https://www.inaturalist.org/photos/475334386) · Joseph Morlan · CC BY-SA 4.0 |
| Groenpootruiter · Vlucht | `/assets/species/plumage/sp158-flight.webp` | `e176aaadf5427182e4fe8ae14e7d144cae5d18f9` | [bron](https://commons.wikimedia.org/wiki/File:The_Common_Greenshank.jpg) · Prasan Shrestha · CC BY-SA 4.0 |
| Bosruiter · Hoofd | `/assets/species/sp159.webp` | `84f9a3825c606246873901a53b35490f83d2a685` | [bron](https://www.inaturalist.org/photos/121189166) · Jan Ebr & Ivana Ebrová · CC BY 4.0 |
| Bosruiter · Juveniel | `/assets/species/plumage/sp159-juv.webp` | `68cd51f8b8a927aebcb104df3a69bba1f462cde4` | [bron](https://www.inaturalist.org/photos/555542627) · Ian Ballam · CC BY 4.0 |
| Bosruiter · Winter | `/assets/species/plumage/sp159-winter.webp` | `c08cdd077c8d8f811429ff54b02ef5dbaefc2444` | [bron](https://www.inaturalist.org/photos/365421308) · Afsar Nayakkan · CC BY 4.0 |
| Bosruiter · Vlucht | `/assets/species/plumage/sp159-flight.webp` | `e0924ddb37eea48910eb492d44d9160773b5604d` | [bron](https://commons.wikimedia.org/wiki/File:Wood_Sandpiper_(Tringa_glareola)_(53879706937),_crop.jpg) · Birds of Gilgit-Baltistan · CC BY-SA 2.0 |

**Zwarte Ruiter · `sp157`.** De hoofdfoto laat een grotendeels zwarte vogel in vermoedelijk broedkleed zien met lange donkere snavel en rood aan snavelbasis. Het winterbeeld is lichter met opvallend lange roodachtige poten; de bronvermelding noemt december. Het als juveniel geregistreerde beeld toont dicht getekende onderzijde en een langere, fijne snavel, zonder zelfstandige leeftijdsmeting. De vluchtfoto toont de vogel werkelijk los in vlucht met gespreide vleugels; de witte rug-/stuitwig is niet vanuit iedere hoek duidelijk te onderscheiden. Zelfstandige soort-/geslachts-/leeftijdscontrole per origineel blijft OPEN. Vergelijk in de gids met Tureluur in broed-, winter- en jeugdkleed. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-ruiter).

**Groenpootruiter · `sp158`.** Hoofdfoto: forse ruiter met lange grijsgroene poten en stevige snavel, in het zijaanzicht slechts licht opwaarts buigend. Winterbeeld: lichtere buik/kop en grijsbruinere rug; makerwatermerk zichtbaar in het bestand, de credit blijft apart verplicht. Het als juveniel geregistreerde beeld heeft duidelijk lichtgerande bruine vleugeldekveren maar de bronregistratie beschrijft een **eerstejaars vogel in november** met resterende juveniele veren. Dat rechtvaardigt niet zonder nadere kleedsleutel een volledig puur juveniel kleedlabel. De vrije vlucht toont de vogel met neerwaartse vleugels en fijne tekening; de witte rugwig en pootvorm moeten per beeldhoek worden beoordeeld. Groenpootruiter–Poelruiter in drie kleedrollen bestaat als vergelijking; het complete op pose/leeftijd passende fotopaar is niet onafhankelijk vrijgegeven. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groenpootruiter) · [vergelijkingsartikel](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-groenpootruiter-vs-poelruiter).

**Bosruiter · `sp159`.** Hoofdfoto toont gedetailleerde lichte rugvlekken, lichte wenkbrauwstreep en langere geelgroene poten. De winterfoto toont de zandbruine rug, lichte vlekken en blekere borst; het als juveniel geregistreerde beeld toont een jonge-vogelachtige bovenzijde en slanke bouw, maar exacte leeftijd volgt uit oorspronkelijke annotatie. Vluchtfoto is een echte vrije vlucht met een lichte gevlekte ondervleugel; de zichtbaarheid van poten en stuit hangt van uitsnede en kijkhoek af. Bestaande vergelijkingen met Witgat (broed/winter/juveniel) en Oeverloper (juveniel) vereisen leeftijdsgelijke foto’s; **de bestaande sterk onscherpe Witgat-juvenielenfoto uit R38 blijft ONGESCHIKT voor een definitief vergelijkingspaar**. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bosruiter).

## 2. Kritische biometrie- en seizoenspunten

**Bosruiter-spanwijdteconflict (bestaande appwaarde niet gewijzigd):** `src/data/species.js` vermeldt `36–40 cm`; Vogelbescherming vermeldt `54–57 cm` en [Zootierliste](https://www.zootierliste.de/en/index.php?art=50901284&familie=21508&klasse=2&ordnung=215) eveneens `54–57 cm`. Dit is een materieel onopgelost data-/determinatiekwaliteitsprobleem, geen gewone afgeronde variatie. De kwaliteitsnorm v1.7 vereist twee **vergelijkbare, verschillende uitgevers**, meetdefinitie-/ondersoortcheck en de vastgelegde afronding; het oorspronkelijke getal en de berekening in het kennisprofiel zijn nog niet herleid. Daarom geen stille aanpassing van de appwaarde en geen VERIFIED biometrie.

Zwarte Ruiter `29–32 cm` / `61–67 cm` en Groenpootruiter `30–35 cm` / `68–70 cm` liggen binnen de direct geraadpleegde Vogelbescherming-soortbeschrijvingen; hun tweede uitgever, gewichten en formattering blijven afzonderlijk te toetsen. Sovon documenteert Zwarte Ruiter als doortrekker met kleine winteraantallen (voorjaars- en najaarspiek), Groenpootruiter als doortrekker met kleine winteraantallen, en Bosruiter met zeer incidentele historische Nederlandse broedgevallen. De bestaande app-seizoensfilters en statusvelden zijn niet gewijzigd, omdat veldvoorkomen, beste kijkmaanden, officiële broedstatus en uitgestorven/teruggekeerde broedgevallen aparte definities zijn. [Sovon Zwarte Ruiter](https://stats.sovon.nl/stats/soort/5450) · [Sovon Groenpootruiter](https://stats.sovon.nl/stats/soort/5480) · [Sovon Bosruiter](https://stats.sovon.nl/stats/soort/5540).

**Open kennisgates:** geen daadwerkelijk gelezen ANWB-soortpassages, geen gekwantificeerde Nederlandse eBird-analyse met meldingsbias, geen onafhankelijke vakdeterminatie en geen second-publisher-rekenbewijs voor alle overige maatbanden. Geen maatband als VOLLEDIG VERIFIED publiceren.

## 3. Geluid — tien reeds geregistreerde lokale opnamen

De gids- en audioregisters bevatten **10 bestaande clips: 3 Zwarte Ruiter, 3 Groenpootruiter, 4 Bosruiter**. Hier zijn uitsluitend bestaande labels, links en auteurs/licenties gecontroleerd. De primaire Xeno-canto-pagina's bleken bij een representatieve webproef niet bereikbaar; na die bronfout is het rechten-/luisterdeel geparkeerd. Geen download, vervanging, nieuwe licentieclaim, gehooronderzoek of volledige originele PCM-match uitgevoerd. De gerichte Chromium-regressie kan uitsluitend de daadwerkelijke technische audioafspeelroute en offline cache bewijzen.

| Soort · geregistreerde rol | Lokaal audiopad | Oorspronkelijke ID, bestaande maker/licentie (NIET opnieuw afgetekend) |
|---|---|---|
| Zwarte Ruiter · Vluchtroep | `/assets/species/audio/sp157-flight-call.mp3` | [XC947276](https://xeno-canto.org/947276) · Tim Vochten · CC BY-SA 4.0 |
| Zwarte Ruiter · Vluchtroep, tweede voorbeeld | `/assets/species/audio/sp157-flight-call-alt.mp3` | [XC929268](https://xeno-canto.org/929268) · Jochem Verweij · CC BY-SA 4.0 |
| Zwarte Ruiter · Nachtelijke vluchtroep | `/assets/species/audio/sp157-night-flight-call.mp3` | [XC1192286](https://xeno-canto.org/1192286) · Noé Ferrari · CC BY 4.0 |
| Groenpootruiter · Contact- en vluchtroep | `/assets/species/audio/sp158-flight-call.mp3` | [XC826147](https://xeno-canto.org/826147) · Jochem verweij · CC BY-SA 4.0 |
| Groenpootruiter · Zang en roep | `/assets/species/audio/sp158-song-and-call.mp3` | [XC991736](https://xeno-canto.org/991736) · Pascal Christe · CC BY-SA 4.0 |
| Groenpootruiter · Nachtelijke vluchtroep | `/assets/species/audio/sp158-night-flight-call.mp3` | [XC1180337](https://xeno-canto.org/1180337) · Noé Ferrari · CC BY 4.0 |
| Bosruiter · Roep | `/assets/species/audio/sp159-call.mp3` | [XC487833](https://xeno-canto.org/487833) · Pascal Christe · CC BY-SA 4.0 |
| Bosruiter · Vluchtroep | `/assets/species/audio/sp159-flight-call.mp3` | [XC1175422](https://xeno-canto.org/1175422) · Dermot Breen · CC BY-SA 4.0 |
| Bosruiter · Nachtelijke vluchtroep | `/assets/species/audio/sp159-night-flight-call.mp3` | [XC630022](https://xeno-canto.org/630022) · Jens Loose · CC BY-SA 4.0 |
| Bosruiter · Alarmroep | `/assets/species/audio/sp159-alarm-call.mp3` | [XC1157158](https://xeno-canto.org/1157158) · Teet Sirotkin · CC BY-SA 4.0 |

Geen MP3 is op basis van een werkende bestandslink of manifestlabel zelfstandig herkend als de genoemde soort of zang-/roepvariant. Xeno-canto-licentie, commerciële rechten en verplichte zichtbare toeschrijving blijven **NOT TESTED**.

## 4. F3- en regressiegates

Bij dit checkpoint worden alleen drie voorheen NOT STARTED rijen als **IN CONTENT REVIEW / OPEN POINTS** gemarkeerd. Elke foto heeft exact één eigen rol en per soort blijft de hoofdfoto vóór kleed- en vluchtgroepen staan. Niet-gecontroleerde fotovergelijkingsparen krijgen geen FULL PASS. Geen veranderingen aan bestaande gidsafbeeldingen, originele audio, soortdata, gebruikersdata, cache- of serviceworkerversies.

Gerichte CI: behoud 140-id volgorde en historisch 101 oude audits, exacte 12 Git-blobhashes, 10 audiobestanden, 18 F3-checkvelden per rij, de bekende vorige R35–R38 regressies, 0 FULL PASS en aangetoonde brononzekerheden. Browser: Chromium op 320/360/390 px, eigen afbeeldingen en credits, afzonderlijke vluchtsecties, bestaande vergelijking met paren in beide richtingen, afspeelbaar geluid, heropenen van detail en op 390 px verse cache plus offline heropening. Deze plannen tellen pas als **VERIFIED** wanneer de GitHub CI-run op dezelfde SHA daadwerkelijk slaagt.

**Nog OPEN/NOT TESTED:** tweede onafhankelijke vogelkundige review en licentieaftekening; fotobron-pixelvergelijking; ANWB/eBird; fysieke Samsung-PWA-installatie, GPS, camera, microfoon en update; ZIP-herstel op tweede toestel; toegangsbeveiligde interactieve R39-preview en productie. SYNC-CHECK blijft NOT SYNCHRONIZED wegens verschil Index v3.13 / Veldhandboek v0.9 en onbekende daadwerkelijke ChatGPT-/Claude-bronvelden. Branchbescherming UNKNOWN; RELEASE HOLD.

De volgende nog niet gestarte F3-rijen na R39 zijn **Grote Mantelmeeuw `sp164`, Visdief `sp165` en Noordse Stern `sp166`**. Nieuwe ronde pas na remote CI, writerclaim- en PR-basecontrole op de laatste R39-SHA.

**EINDMARKERING — F3-R39 · 117/140 · 23 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
