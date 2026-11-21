# Birdspot F3-R27 — Kokmeeuw, Scholekster en Kievit
**DRAFT / PARTIALLY TESTED · 21 november 2026 · PR #325**

## 1 · Uitvoering en herstelbasis
Vrijgegeven R26 (PR #324) op `6b9ec43a1b80acb6b2d992ee9d2adceadf19528e`; op dezelfde SHA waren de R26-, 140-soorten- en kennisbaseline-/browserworkflows alle drie success. Deze eigen R27-branch houdt de andere branches en writerclaims intact. De huidige app-README, Birdspot-kwaliteitsnorm v1.7 FINAL, Projectinstructies v2.14 FINAL en Handbook v2.18 FINAL blijven leidend; concept v1.9 op #315 is geen geactiveerde kwaliteitsnorm. Birdspot Veldhandboek v0.9 FINAL geeft aanvullend veld- en bronkader.

**R27-uitkomst na registratie:** 81/140 inhoudelijk bekeken, 59 nog niet gestart, 0 volledig F3-PASS. Alleen de drie soortrecords sp097, sp098, sp099 worden als inhoudelijk bekeken gemarkeerd. `CONTENT REVIEWED` is nadrukkelijk niet `CONTENT COMPLETE`, en historische soortaudit-oordelen zijn geen nieuwe onafhankelijke F3-goedkeuring.

**Geen nieuwe gidsfoto-/geluidsbytes**, geen app-/opslag-/PWA-codewijziging, geen productie-, preview- of publieke deploy. De eigenaar heeft bevestigd dat privéschermen werken; **installatie/download op Samsung-startscherm blijft OPEN**.

## 2 · Spoorbare inventariscorrectie — sp097 Kokmeeuw
De eerdere F3-baseline bevatte `historic.oldAssetCount=0`, `historic.audited=false` en een lege `currentAssets.imageSlots`. De historische nul blijft onaangeroerd: zij is bewijs over de **oude** negenpuntsaudit en niet over de huidige lokale media.

Daartegenover bevat F2-31 reeds drie geregistreerde bronbeelden, en alle drie **bestaan op de gecontroleerde R26-tree en zijn deze ronde daadwerkelijk visueel geopend**. Het nieuwe actuele F3-slotregister is hersteld naar:
1. **Hoofdfoto / broedkleed** — `/assets/species/sp097.webp`: volwassen Kokmeeuw met chocoladebruine kopkap, rode snavel, lichte bovenzijde; F2-bron Alexis Lours, **CC BY 4.0**.
2. **Verenkleed / winter** — `/assets/species/plumage/sp097-winter.webp`: witte kop met donkere oorvlek en rode poten; F2-bron Bartosz MORĄG, **CC BY-SA 3.0**.
3. **In vlucht / broedkleed** — `/assets/species/plumage/sp097-flight.webp`: vogel geheel los van de ondergrond met gespreide vleugels, bruine kap, lichte vleugelvoorrand; F2-bron Charles J. Sharp, **CC BY-SA 3.0**.

De **F2-SHA-256 per bestand** en het werkelijke gallery-pad worden in een gerichte R27-test afgedwongen. Een nieuwe originele brondownload/origineel↔WebP-pixelmatch of onafhankelijke soort-/rechtenbeoordeling is **niet** uitgevoerd; het oude F2-oordeel `originalPageRead:true` blijft historisch. Het bestaande eigen audioslot blijft leeg; geen gefingeerde roep of audio-PASS.

De actuele Vogelbescherming-passage [Kokmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kokmeeuw) is opnieuw gelezen: bruine broedkap en oorvlek in winter, witte voorvleugel; dit onderbouwt de **algemene herkenningsrol**, niet automatisch de licentie of identiteit van ieder afzonderlijk fotobestand. De soort heeft in deze baseline geen `knowledge.json`-profiel. De bestaande brongetrouwe `src/data/species.js`-velden blijven bruikbaar; een compleet nieuw kennisprofiel wordt niet verzonnen.

**Vergelijkingen:** bestaand Kokmeeuw versus Zwartkopmeeuw in broedkleed blijft bestaan waar een passend fotovergelijkscontract feitelijk geldig is. Stormmeeuw heeft geen gecontroleerde winterfoto: vergelijking Kokmeeuw/Stormmeeuw blijft **tekstgericht**, geen geforceerd fotopaar. De originele Zwartkopmeeuw-pagina was in F2-31 niet heropend; dit blijft open.

## 3 · sp098 Scholekster — 3 bestaande beelden
1. `/assets/species/sp098.webp`: volwassen vogel, lange rechte oranjerode snavel, zwart-witte borst en rug, roze poten; geslacht niet afgeleid. F2: **Hobbyfotowiki, CC0**, oorspronkelijke pagina toen gelezen.
2. `/assets/species/plumage/sp098-juv.webp`: jong kleed met bruinige bovendelen, witte buik en donkere snavelpunt. F2: **Andrey Gulivanov, CC BY 2.0**; oorspronkelijke bestandspagina in F2-31 **niet** opnieuw bereikbaar. Jeugdannotatie blijft historisch en behoeft onafhankelijke leeftijdsverificatie.
3. `/assets/species/plumage/sp098-flight.webp`: vrije vlucht boven water met gespreide vleugels, witte onderzijde en lange snavel. F2: **Charles J. Sharp, CC BY-SA 4.0**; oudere ORB/RANSAC-match, geen heropende bronpagina in R27.

[Vogelbescherming Scholekster](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/scholekster) ondersteunt de lange snavel, roze poten en witte vleugelbaan; een winterse keelband is niet exclusief een juveniel kenmerk. De bestaande **Scholekster versus Kluut**-vergelijking houdt de duidelijke rechte/oranjerode tegenover omhooggebogen/donkere snavel, passend bij de getoonde foto's. Sekse kan niet veilig op een losse opname worden toegewezen.

**Bestaand biometrisch verschil:** Birdspot toont spanwijdte **80–86 cm**; de geraadpleegde Vogelbescherming-passage noemt **72–83 cm**. Het bestaande kennisprofiel bevat dit expliciet als `discrepancies`; er is geen tweede onafhankelijke, vergelijkbare waarde vastgesteld. Dus **geen nieuwe band of stille bronreconciliatie**. Er is geen soortaudio geregistreerd; volledige audio-/rechtenaftekening blijft OPEN.

## 4 · sp099 Kievit — 5 bestaande beelden
1. `/assets/species/plumage/sp099-adult_m.webp` — herleidbaar volwassen mannetje in broedkleed volgens de **historische Audubon/Commons-bronketen**, met lange kuif en donkere keel. Oude soortaudit `VERIFIED` blijft historisch bewijs, niet nieuw F3-PASS.
2. `/assets/species/plumage/sp099-adult_f.webp` — voorovergebogen baltsende Kievit; historisch door fotograaf als vrouw gemarkeerd. Sekse **niet** opnieuw onafhankelijk gedetermineerd. Bron Charles J. Sharp, CC BY-SA 4.0.
3. `/assets/species/plumage/sp099-juv.webp` — kortere kuif, bruine bovendelen met brede lichte veerranden; historisch bronlabel juveniel, geslacht niet bepaald. Bron Charles J. Sharp CC BY-SA 4.0.
4. `/assets/species/plumage/sp099-flight.webp` — twee echte vliegende vogels, brede afgeronde vleugels, bij één zicht op bovenzijde en bij de ander witte buik/donkere borst; **geen geslachtslabel per vluchtvogel**. Bron Charles J. Sharp, CC BY-SA 4.0.
5. `/assets/species/sp099.webp` — extra herkenningsfoto van volwassenachtige Kievit tussen gras, kuif en groene glans zichtbaar; geslacht niet onderbouwd. Bron El Golli Mohamed CC BY-SA 4.0 volgens oude soortaudit.

[Vogelbescherming Kievit](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kievit) bevestigt kuif, metaalkleurige bovenzijde, brede vleugels, verschillen bij man/vrouw die buiten broedseizoen vervagen, en beschreven lengte/spanwijdte 28–31 cm / 82–87 cm. Huidige appbanden **ca. 28–30** en **ca. 80–85 cm** blijven behouden als bestaande afgeronde indicatie met historisch bronbewijs. De oude onjuiste kleinere spanwijdte is al volgens het eerdere dossier gecorrigeerd; geen dubbele wijziging.

**Kievit/Zilverplevier**: kuif en groen-paarse rug verschillen van grijsgetekende bovenzijde zonder kuif, maar het bestaande twee-fotopaar moet aan de echte beeldrol en eerdere rechtenchecks blijven voldoen. Eigen oud `VERIFIED` in soortaudit is geen onafhankelijk R27-eindbewijs. Kievit heeft geen geregistreerd audioslot: bronbeschreven baltsroep ≠ een aanwezig afspeelbaar geluid.

## 5 · Samenvattende bewijslagen
| Controle | Status op R27 | Wat nog ontbreekt |
|---|---|---|
| 11 bestaande lokale app-WebP's direct geopend | PARTIALLY TESTED | onafhankelijke leeftijd/soort/sex/pose, originele pixels |
| Kokmeeuw F3 0→3 actuele inventaris; historisch 0 bewaard | Verificatie in CI vereist | live galerij gelijk aan register, 3 F2-bytehashes |
| Maker/CC/status uit F2/historische media | PARTIALLY TESTED | actuele oorspronkelijke pagina, wijzigingsvoorwaarden en verplichte zichtbare credits afzonderlijk |
| Bestaande lookalike-tekst en echte fotoparen | PARTIALLY TESTED | Stormmeeuw winterpaar niet beschikbaar; partnerbron Zwartkopmeeuw open |
| Geluid op deze 3 soorten | NOT TESTED / 0 geregistreerd | geen originele audio, geen kunstmatige audio-PASS |
| Kennis en biometriemethode | PARTIALLY TESTED | Scholekster spanwijdteverschil open; geen nieuwe cijfers of dubbele norm |
| Node/regressie, CI, Chromium/zoom/terug | NOT TESTED op R27 bij documentcheckpoint | gerichte en brede run op exact head/merge-tree |
| Fysiek Samsung, offline, ZIP, echt Merlin | NOT TESTED op R27 | gebruiker meldt installatie/download nog OPEN |
| Onafhankelijke foto-/rechten-/akoestische beoordeling | NOT TESTED | echte onafhankelijke review vóór FULL PASS |

**Bronnen:** [F2-31](F2_31_BRON_EN_LIMIETEN.json), [historische soortaudit](soortaudit-status.json), `assets/species/field-guide-media.json`, `tools/kennisbaseline/knowledge.json`, de drie gelezen Vogelbescherming-soortpassages en dit F3-dossier. ANWB-editie en pagina's **NOT TESTED**; geen ongezien boek als letterlijk geraadpleegd gepresenteerd.

## 6 · Vervolg en overdracht
Registreer precies sp097, sp098, sp099 als **F3-R27 inhoudelijk bekeken**; de eerdere 137 records blijven ongewijzigd. Test dat de oude nul en oude VERDICT zijn bewaard, media ongewijzigd, F3-registratie overeenkomt met werkelijke galerij, gemiste audio nog ontbreekt, de vorige R25/R26 bij groei van de teller groen blijven en de nieuwe inhoudelijke registratie niet tot een fictieve volledige PASS leidt.

Release HOLD. Geen merge, publicatie, hostmigratie, accounts of betaalde functies. Na een controleerbare R27-handoff volgt in de 140-volgorde **sp100 Wulp, sp101 Grutto en sp102 Tureluur** als mogelijke volgende batch.

EINDMARKERING — F3-R27 CONTENT REVIEW · 81/140 · 0 FULL PASS · GEEN PUBLIEKE RELEASE
