# Birdspot F3-R38 · Bonte Strandloper, Oeverloper en Witgat

**DRAFT · PARTIALLY TESTED · 22 november 2026 · [PR #338](https://github.com/saddamsmit-source/Birdspot-Library/pull/338).**

Basis: R37-herstel [PR #337](https://github.com/saddamsmit-source/Birdspot-Library/pull/337) op `81c8a48ece7d6c1f24a179b3ac4403ef49ed35d3`. Inhoudsronde R38 raakt uitsluitend F3-registerrijen `sp153`, `sp155`, `sp156`; bij afronding **114/140 inhoudelijk bekeken, 26 te starten, 0 FULL PASS**. De eerdere 140 historische auditrecords blijven ongewijzigd. F3-status is niet gelijk aan definitieve soortdeterminatie, licentievrijgave, toestelsucces of release.

## 1. Beeldcontrole — bestaande lokale gidsbestanden

Negen in de repo aanwezige WebP-bestanden zijn één voor één via GitHub opgehaald en visueel beoordeeld op weergegeven veldkenmerken, leeftijdspretentie, houding en leesbaarheid. De SHA-1 hieronder is **Git's blob-SHA** voor het lokale bestand, niet een onafhankelijke bron-pixelmatch. Mogelijk fotograaf en licentie staan in het bestaande gidsmanifest. Zonder primaire broncontrole mogen de hier getoonde rollen niet FULL VERIFIED worden.

| Soort/rol | Lokaal beeld · Git-blob SHA-1 | Visuele waarneming en beperking |
|---|---|---|
| Bonte Strandloper `sp153` · hoofdfoto | `sp153.webp` · `19462df1bebd20a61937321ed0ca839c4119d02a` | Grijsbruin winter-/niet-broedkleed aan oever, lange snavel zichtbaar aan punt omlaaggebogen. Geen foto van zwarte buikvlek in broedkleed, juveniel of vlucht in deze kaart. Geen leeftijds-/geslachtsclaim. |
| Oeverloper `sp155` · hoofdfoto | `sp155.webp` · `809bf705591c104973fec0babb782d0a1216bf92` | Vogel op stronk, witte inkeping langs vleugelboeg, vrij lange staart, korte poten. Makerwatermerk zit in het beeld; creditmetadata afzonderlijk bewaren. |
| Oeverloper · winter | `sp155-winter.webp` · `f58c9e3245c3758f7f93857a46660f5997cc8bf2` | Egale donkere bovenzijde, witte inkeping zichtbaar, zijaanzicht. Winterrol gebaseerd op bronregistratie/fotodatum, geen zelfstandig verenonderzoek. |
| Oeverloper · juveniel | `sp155-juv.webp` · `88d27391f6c239f277bc4c4cee4d90894f0bc943` | Kleine uitgesneden foto (500 × 341), vogel en borstzijde zichtbaar, fijne jeugdveertjes nauwelijks betrouwbaar te beoordelen. Historische leeftijdsannotatie vereist controle van originele opname. |
| Oeverloper · vlucht | `sp155-flight.webp` · `08e567cf65548b3f7d7075ee72afda334634ce1b` | Vrije vlucht boven water, witte vleugelstreep zichtbaar. Leeftijd/geslacht niet bepaalbaar uit dit beeld. |
| Witgat `sp156` · hoofdfoto | `sp156.webp` · `af50ccbd8bb18a99365c32529e7f4024b2b885c3` | Donkere gespikkelde bovenzijde, lichte onderzijde, donkere borst en opvallende oogring; vleugels dicht. Geen geslachtszekerheid. |
| Witgat · winter | `sp156-winter.webp` · `0c5931256ddb3f69e923220833e59de135cf7e7d` | Relatief effen donkere rug, opvallende overgang naar witte buik, op paal. Kleedrol vooral gebaseerd op opnamedatum en manifest. |
| Witgat · juveniel | `sp156-juv.webp` · `7d0df8476aa49e8fd3f2c7262ad663ae745653a9` | **Aantoonbaar kwaliteitsgat:** zeer klein (371 × 197; lokale WebP circa 2 KB) en sterk onscherp. Individuele veerranden en leeftijd zijn hiermee niet overtuigend te inspecteren; huidige jeugd-/vergelijkingsclaim mag niet als foto-PASS gelden. Foto voorlopig behouden voor bronhistorie en vervangingsonderzoek; niet fictief verbeteren. |
| Witgat · vlucht | `sp156-flight.webp` · `7f3b5d5913796e791b05181f2d179dfac77617d7` | Duidelijke vrije vlucht met witte stuit en vrijwel donker getekende vleugels; herkenningswaarde aanwezig. Leeftijd/geslacht niet afzonderlijk bevestigd. |

**Beheergrens:** geen foto vervangen, verplaatsen of verwijderen zonder een gecontroleerd alternatief of expliciete gebruikerskeuze. De slechte `sp156`-juvenielenfoto is een concreet kwaliteits-/UX-onderzoekspunt, niet een reden om alle andere soorten te blokkeren.

## 2. Herkomst en licentiestatus — registratie versus geverifieerde bron

| Beeld | Bestaande primaire bronregistratie | Maker, licentie in manifest; geen nieuwe rechten-PASS |
|---|---|---|
| `sp153.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Dunlin_%28Calidris_alpina%29_non_breeding_Marken.jpg) | Charles J. Sharp · CC BY-SA 4.0 |
| `sp155.webp` | [iNaturalist](https://www.inaturalist.org/photos/56953995) | Константин Селивёрстов · CC BY 4.0 |
| `sp155-winter.webp` | [iNaturalist](https://www.inaturalist.org/photos/617218276) | rashidchan · CC BY 4.0 |
| `sp155-juv.webp` | [iNaturalist](https://www.inaturalist.org/photos/85106472) | Дарья Орлова · CC BY 4.0 |
| `sp155-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:NZ7_7499_(52887647148).jpg) | Bengt Nyman · CC BY-SA 2.0 |
| `sp156.webp` | [iNaturalist](https://www.inaturalist.org/photos/246109837) | Daniel Benák · CC BY 4.0 |
| `sp156-winter.webp` | [iNaturalist](https://www.inaturalist.org/photos/604589887) | Paulo Caseirito · CC0 |
| `sp156-juv.webp` | [iNaturalist](https://www.inaturalist.org/photos/556521052) | Dominic Best · CC0 volgens register |
| `sp156-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Green_sandpiper_flying.jpg) | Prasan Shrestha · CC BY-SA 4.0 |

Alle negen credits zijn op repository-meta-niveau herleid. **Open:** actuele primaire licentie en maker per opname controleren, WebP/origineel pixelmatch, alle vereiste zichtbare credits, wijzigingen/crops en zelfstandige determinatie van soort/kleed/sekse. Bestaande licentievelden zijn geen volledige herpublicatievrijgave.

## 3. Vergelijkingen, biometrie en status

- **Bonte Strandloper en Drieteenstrandloper:** het bestaande `LK-082`-rustpaar gebruikt de winterbeelden en onderscheidt de langere licht neerwaartsgebogen snavel van Bonte Strandloper tegenover de rechtere en meestal kortere van Drieteenstrandloper. Geen afgetekend broed-, juveniel- of vluchtfotopaar. In prachtkleed Bonte Strandloper donkere buikvlek. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bonte-strandloper).
- **Oeverloper en Witgat:** bestaand winterfotopaar beschrijft bij Oeverloper de witte inkeping tussen zijborst en vleugelboeg en bij Witgat donkere borst/witte buik, in vlucht witte stuit en donkere ondervleugels. Dit zijn verschillende veldkenmerken; één afbeelding bewijst geen soort. Beeldvergelijking in beide richtingen en bron-/kleedmatching in Chromium toetsen. [Vogelbescherming Oeverloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/oeverloper) · [Vogelbescherming Witgat](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/witgat).
- **Witgat en Bosruiter:** bestaande broed/winter/jeugdparen en beschreven verschillen in donkere ondervleugels, lichte stuit en wenkbrauw bestaan. De Witgat-juvenielenfoto maakt het leeftijdsbeeld niet zelfstandig bewijsbaar; een gelijkwaardig kwalitatief beeld is open. [BTO Green Sandpiper](https://www.bto.org/learn/about-birds/birdfacts/green-sandpiper) · [Naturalis Birds of Europe](https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/taxon.php?id=130629).

**Biometrieconflict Witgat `sp156`.** De app vermeldt spanwijdte `39–44 cm`, net als de Bird of Poole Harbour-gids (die dit als "wingspan" labelt). Vogelbescherming vermeldt **57–61 cm**. Onafhankelijke publicaties geven eveneens 57–61 cm, maar de onderliggende meetdefinities en herkomst zijn niet volledig gereconcilieerd. De kwaliteitsnorm vraagt passende vergelijkbare definities en twee uitgevers; deze discrepantie is daarom **OPEN**, zonder willekeurige omzetting van `39–44` naar een nieuw `ca.`-bereik. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/witgat) · [Birds of Poole Harbour ID guide](https://cdn-asset-stl-2.airsquare.com/birdsofpooleharbour/library/idguidefinal.pdf) · [Madeira Birdwatching](https://www.madeirabirds.com/green-sandpiper-tringa-ochropus).

**Nederlandse status:** Bonte Strandloper is zeer talrijk als doortrekker/wintergast maar historisch met Rode-Lijststatus Verdwenen als broedvogel; één broedpaar in 2025 staat op Vogelbescherming. Deze twee uitspraken moeten als verschillende contexten blijven bestaan. Oeverloper is zeer schaarse broedvogel en doortrekker; Witgat doortrekker en wintergast, geen reguliere Nederlandse broedvogel. De bestaande per-soort statusvelden zijn niet stilzwijgend overschreven. Sovon-bronnen: [Bonte Strandloper](https://stats.sovon.nl/stats/soort/5120) · [Oeverloper](https://stats.sovon.nl/stats/soort/5560) · [Witgat](https://stats.sovon.nl/stats/soort/5530).

## 4. Audio · zeven geregistreerde clips, geen aftekening

In de huidige mediaregistratie is Bonte Strandloper zonder lokale gidsaudio. Oeverloper heeft drie en Witgat vier lokale MP3-bestanden. Onderstaande gegevens zijn **Bestaande metadata**; er is in deze ronde geen bronopname gedownload, gehoord of op PCM/bestandsrechten vergeleken.

| Soort | Opnamebestand · oorspronkelijke ID | Manifestmaker / -licentie |
|---|---|---|
| Oeverloper · Baltszang | `sp155-song.mp3` · [XC901773](https://xeno-canto.org/901773) | Jochem verweij · CC BY-SA 4.0 |
| Oeverloper · Vluchtroep | `sp155-flight-call.mp3` · [XC432214](https://xeno-canto.org/432214) | Joost van Bruggen · CC BY-SA 4.0 |
| Oeverloper · Nachtelijke vluchtroep | `sp155-night-flight-call.mp3` · [XC1166974](https://xeno-canto.org/1166974) | marc1981 · CC BY 4.0 |
| Witgat · Roep | `sp156-call.mp3` · [XC490350](https://xeno-canto.org/490350) | Pascal Christe · CC BY-SA 4.0 |
| Witgat · Vluchtroep | `sp156-flight-call.mp3` · [XC951957](https://xeno-canto.org/951957) | Amadeo A. Pombo Eirín · CC BY-SA 4.0 |
| Witgat · Nachtelijke vluchtroep | `sp156-night-flight-call.mp3` · [XC432903](https://xeno-canto.org/432903) | Joost van Bruggen · CC BY-SA 4.0 |
| Witgat · Alarmroep | `sp156-alarm-call.mp3` · [XC791817](https://xeno-canto.org/791817) | Jochem verweij · CC BY-SA 4.0 |

De actualiteit van de primaire Xeno-canto-licentie, het werkelijk opgenomen dier, de precieze geluidsrol, hoorbare kwaliteit, oorspronkelijke byteherkomst en menselijke luisterreview zijn **NOT TESTED**. Technische decodering/afspelen en offline cache horen afzonderlijk bij de gerichte CI- en browserlaag. Een werkende MP3 is geen soort- of rechtenbewijs.

## 5. Tests, veiligheid en volgende stap

- R38 Node-contract: exact negen geregistreerde lokale beelden met bytes > 1 kB waar toepasselijk; `sp156-juv.webp` vormt bewust een gedocumenteerde **uitzondering in de bestandsgrootte**, geen geveinsde kwaliteit. Zeven reeds geregistreerde audiobestanden, alle F3- en historische audits behouden, geen automatische FULL PASS.
- Chromium 320/360/390: drie soortkaarten, eigen foto's, credits, vluchtbeeld, bestaande vergelijkingen in beide richtingen, sluiten/terug, zoom, audio-elementen en, op 390 px, offline heropenen inclusief media. Technische successen worden alleen aan de daadwerkelijk geteste SHA gekoppeld.
- **OPEN:** echte Samsung-PWA-installatie en update, GPS/microfoon/camera op toestel, back-up en herstel naar tweede toestel, ANWB-soortpassages, Nederlandse eBird/bias, onafhankelijk ornithologisch oordeel en licentieaftekening, actuele publicatierechten. Beschermde en onzekere locaties blijven uitsluitend privé. Er wordt geen publieke deling toegevoegd.
- **SYNC-CHECK:** Index v3.13 noemt Veldhandboek v0.8; beschikbare bijlage is v0.9. Hostveldbewijs voor ChatGPT/Claude blijft UNKNOWN. Geen SYNCHRONIZED-claim, geen productie- of preview-PASS.

Na R38 volgen volgens register **Zwarte Ruiter `sp157`, Groenpootruiter `sp158` en Bosruiter `sp159`**. Eerst de CI en writerclaim van R38 op dezelfde SHA afronden, dan opnieuw read-only beginnen.

**EINDMARKERING — F3-R38 · 114/140 · 26 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
