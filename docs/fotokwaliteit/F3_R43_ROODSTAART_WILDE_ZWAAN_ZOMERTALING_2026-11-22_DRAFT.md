# Birdspot F3-R43 · inhoudscontrole en vervolgverificatie

22 november 2026 · **PARTIALLY TESTED** · [concept-PR #345](https://github.com/saddamsmit-source/Birdspot-Library/pull/345) · **RELEASE HOLD**

## Eigenaarbesluit en werkbasis

De eigenaar koos op 22 november optie C voor de gemelde R42-punten over Zwarte Mees `sp174`, Grauwe Vliegenvanger `sp176` en Bonte Vliegenvanger `sp177`. Het [letterlijke eigenaarbesluit](https://github.com/saddamsmit-source/Birdspot-Library/pull/344#issuecomment-7079680036) staat in PR #344 en per soort in het [bestaande F3-register](F3_140_HERCONTROLE_V0.1_DRAFT.json). Het staat toe om R43 te starten met behoud van de geregistreerde R42-lacunes, bewijsstatus en release-HOLD.

De R43-branch is gestart vanaf R42-head `afa23cd696a4c8aa635ecd8e507f9c60519019c2` met vrijgegeven writerclaim en 3/3 geslaagde R42-workflows op die SHA. De eerste inhoudscontrole omvat de drie soorten hieronder. De F3-teller staat op **129/140 inhoudelijk bekeken, 11 te starten, 0 volledige F3-PASS**. Appcode, gidsmediabytes en historische soortaudits vallen buiten deze registerrevisie.

## Eerste bevindingen per soort

| Soort | Lokaal beeld en veldherkenning | Materiële lacunes |
| --- | --- | --- |
| Gekraagde Roodstaart `sp178` | Vier afbeeldingen visueel bekeken. De hoofdfoto toont wit voorhoofd, zwarte keel en oranje borst. Het vrouwtjesbeeld toont een warme lichte onderzijde en het jeugdbeeld een gespikkeld kleed. De opname bij de takken toont een luchtgedragen vogel met hangende poten en blijft in de overige herkenningsfoto’s. | De historische vermelding van een scherp vrij-vluchtbeeld is een ontbrekend beeld, zoals expliciet vermeld in de oude audit en de bestaande fotometadata. LK-024 bevat twee wederkerige rustpanelen met Zwarte Roodstaart `sp051`, voor volwassen mannetjes en vrouwtjes. De rode staart onderscheidt de twee soorten niet. Bij bruine vogels vraagt het verschil in onderzijde goed licht en aanvullende kenmerken. Onafhankelijke rolcontrole, passende jeugdvergelijking, definitieve vrije vlucht en lokale zang/roep staan open. |
| Wilde Zwaan `sp187` | Eén bestaande hoofdfoto toont wit volwassen kleed, lange rechte hals en geel op de snavel. Deze foto kwam wel uit de gidsrendering en ontbrak in de oude auditinventaris. De actuele foto is in het F3-register opgenomen met de historische auditstatus intact. LK-064 heeft een wederkerig rustpaneel met Knobbelzwaan `sp126`. | Een gericht snavelzijaanzicht met Kleine Zwaan `sp127`, passend jeugd- en vluchtbeeld, en lokale roep/vluchtroep staan open. Vergelijk bij volwassenen de positie van de gele snavelwig ten opzichte van het neusgat. Gebruik die adultregel niet zelfstandig bij een grijsbruine jonge zwaan. Vogelbescherming geeft 145–160 cm lengte en 205–275 cm spanwijdte. De app geeft 140–160 en 205–235 cm. Bronbereik en gewicht vragen vervolgverificatie. |
| Zomertaling `sp188` | Vijf afbeeldingen visueel bekeken. Twee volwassen mannetjesbeelden laten de witte oogboog zien. De bruine rustfoto’s tonen delen van oogstreep en lichte keel. De vluchtopname toont een bruine vogel in vrije vlucht. De app toont de foto onder In vlucht met het kleedlabel Eclipskleed. Bij bruine vogels helpen koptekening, keel en bij een goed zijaanzicht de staartzijde. De vleugelkenmerken vragen een bruikbare vluchthoek. | Er zijn drie wederkerige rustpanelen met Wintertaling `sp091`. Het eclipsvergelijkingspaneel met verschillende houdingen verschijnt niet in de renderuitvoer. Passend fotopaar, onafhankelijke leeftijds- en eclipsbepaling en volledige rechtencontrole staan open. De drie bestaande opnamen XC903512, XC786511 en XC903822 vragen afzonderlijke controle van identiteit, luisterkwaliteit, rol, achtergrondgeluid en herpublicatie. |

De tien lokale Git-blob-SHA’s staan per soort bij de bevindingen in het F3-register. De eerste inspectie toetste de HTML-weergave. De onderstaande vervolgcontrole voegt bewijs uit Chromium toe.

## Bronnen en bewijs bij de eerste controle

| Soort | Geraadpleegd | Bewijsgrens |
| --- | --- | --- |
| Gekraagde Roodstaart | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/gekraagde-roodstaart), [vergelijking met Zwarte Roodstaart](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-zwarte-roodstaart-vs-gekraagde-roodstaart), [Sovon](https://stats.sovon.nl/stats/soort/11220), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:Phoenicurus_phoenicurus_07%28js%29%2C_Lodz_%28Poland%29.jpg) | Volwassen kenmerken en Nederlandse broedcontext getoetst. Commons vermeldt Jerzy Strzelecki en CC BY-SA 3.0. iNaturalist-foto’s, specifieke leeftijdsannotaties en originele pixelvergelijkingen staan open. |
| Wilde Zwaan | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wilde-zwaan), [Kleine Zwaan](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-zwaan), [Sovon](https://stats.sovon.nl/stats/soort/1540), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:WhooperSwan1.jpg) | Volwassen snaveltekening en wintergastperiode getoetst. Commons vermeldt Andrew Lee en een vrijgave in het publieke domein. Gecontroleerde vergelijking met de oorspronkelijke fotobytes, onafhankelijke rol- en rechtencontrole staan open. |
| Zomertaling | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zomertaling), [Wintertaling](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wintertaling), [Sovon](https://stats.sovon.nl/stats/soort/1910), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:Garganey%2C_Israel.jpg) | Hoofdkenmerken en Nederlandse seizoenscontext getoetst. Commons vermeldt YedidyaPopper en CC BY 4.0 voor de hoofdopname. De vier overige originele bestanden en de opnamen zijn in deze startcontrole niet afzonderlijk afgetekend. |

Bij de eerste controle waren alle drie ANWB-soortpassages NOT TESTED. De vervolgcontrole voegt de gelezen passage voor Wilde Zwaan toe.

## Vervolgcontrole op 22 november 2026

### Herkomst van de tien gidsfoto’s

Alle tien onbewerkte bronbestanden zijn opgehaald en naast de lokale WebP getoond. Voor zeven Commons-bestanden komt de SHA-1 van het gedownloade origineel overeen met de waarde die Commons opgeeft. De twee uitsneden zijn ook met een fijnere schaal- en positiezoeking getoetst. De correlatie meet de overeenkomst van de opname. Individuele kleed- en publicatieaftekening volgt apart.

| Lokale foto | Origineel en bronvermelding | Beeldvergelijking r |
| --- | --- | --- |
| `sp178.webp` | [Jerzy Strzelecki](https://commons.wikimedia.org/wiki/File:Phoenicurus_phoenicurus_07%28js%29%2C_Lodz_%28Poland%29.jpg) · CC BY-SA 3.0 | 1,000 |
| `sp178-adult_f.webp` | [Сергей Неклюдов](https://www.inaturalist.org/photos/686068567) · CC BY 4.0 · [annotaties Adult en Female](https://www.inaturalist.org/observations/375299471) | 1,000 |
| `sp178-juv.webp` | [Сергей Неклюдов](https://www.inaturalist.org/photos/686068572) · CC BY 4.0 · [annotatie Juvenile](https://www.inaturalist.org/observations/375299473) | 1,000 |
| `sp178-flight.webp` | [Paolo Zucca](https://www.inaturalist.org/photos/50225292) · CC BY 4.0 · uitsnede. Vogel bij takken, vrij-vluchtrol blijft OPEN. | 0,9949 |
| `sp187.webp` | [Andrew Lee](https://commons.wikimedia.org/wiki/File:WhooperSwan1.jpg) · publiek domein · uitsnede | 0,9940 |
| `sp188-hero-male.webp` | [YedidyaPopper](https://commons.wikimedia.org/wiki/File:Garganey%2C_Israel.jpg) · CC BY 4.0 | 1,000 |
| `sp188.webp` | [Charles J. Sharp](https://commons.wikimedia.org/wiki/File:Garganey_(Spatula_querquedula)_male.jpg) · CC BY-SA 4.0 | 0,999 |
| `sp188-adult_f.webp` | [michael clarke stuff](https://commons.wikimedia.org/wiki/File:Garganey_04f_(3225295980).jpg) · CC BY-SA 2.0 | 1,000 |
| `sp188-juv.webp` | [Stefan Berndtsson](https://commons.wikimedia.org/wiki/File:Anas_querquedula,_Slottsskogen,_G%C3%B6teborg,_Sweden_1.jpg) · CC BY 2.0 · fotograaf noemt juveniel | 1,000 |
| `sp188-eclipse.webp` | [Frankie Chu from Hong Kong香港](https://commons.wikimedia.org/wiki/File:Anas_querquedula,_Hong_Kong_1.jpg) · CC BY-SA 2.0 · bron noemt mannetje in eclipskleed in vlucht | 1,000 |

Bij beide foto's van Сергей Неклюдов staat op de iNaturalist-pagina ook een Copyright-veld met ‘SAN Studio’. Wie achter die naam zit en hoe die zich verhoudt tot de publieke licentieverklaring blijft OPEN voor onafhankelijke rechtenaftekening. [Leeftijdssleutel Gekraagde Roodstaart](https://www.blascozumeta.com/specie_files/11220_ENG_Phoenicurus_phoenicurus_aranzadi.pdf) en [leeftijds- en kleedsleutel Zomertaling](https://blascozumeta.com/specie_files/01910_ENG_Spatula_querquedula_aranzadi.pdf) geven aanvullende kenmerken. Alleen kenmerken die in de getoonde hoek zichtbaar zijn dragen de individuele fotoverificatie.

### ANWB-soortpassages en maatvoering

**Wilde Zwaan · bronlezing VERIFIED.** Lars Svensson met Killian Mullarney en Dan Zetterström, *Vogels — De grote ANWB Vogelgids van Europa*, luxe uitgave van de derde editie, ISBN 9789043935142, zwanspread pp. 14–15. Het gelezen fragment ondersteunt de volwassen snavelwig en beschrijft waarom de volwassen kleurregel onvoldoende is bij jonge zwanen. De appwaarden **140–160 cm lengte en 205–235 cm spanwijdte** komen overeen met ANWB. Vogelbescherming publiceert **145–160 cm en 205–275 cm**. Het verschil is een bronkeuze. Gewicht en verdere maatverificatie staan open. [ANWB-uitgeversfragment](https://www.kosmosuitgevers.nl/wp-content/uploads/2024/11/9789043935142_fragm.pdf) · [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wilde-zwaan) · [BTO](https://www.bto.org/learn/skills/bird-identification/videos/wild-swans)

**Gekraagde Roodstaart en Zomertaling · ANWB NOT TESTED.** De geraadpleegde openbare fragmenten gaven voor deze twee geen leesbare soortpassage. Gelezen Vogelbescherming-, Sovon- en specialistische referenties staan bij de soortrecords.

### Browser, audio en open punten

- **Chromium VERIFIED** op 320, 360 en 390 px voor de tien eigen foto's, hoofdfotocredits, zoom en terug, alle zes richtingen van de bestaande vergelijkingen en drie afspeelbare audiobestanden. Op 390 px is dezelfde route offline doorlopen na heropening vanuit een vers profiel met serviceworker. De drie MP3’s zijn lokaal volledig gedecodeerd en gaven in Chromium offline HTTP 206. [Gerichte R43-run op `6dfcbe1`](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/45028555130)
- **Audioherkomst BLOCKED.** De directe broncontrole voor [XC903512](https://xeno-canto.org/903512), [XC786511](https://xeno-canto.org/786511) en [XC903822](https://xeno-canto.org/903822) liep vast op toegang of onbereikbaarheid. Lokaal afspelen en geregistreerde bronlinks zijn gecontroleerd. Onafhankelijke luisterbeoordeling, soort, geluidstype, originele bronbytes en actuele bronlicentie blijven OPEN. Gekraagde Roodstaart en Wilde Zwaan hebben nog geen geregistreerde clip.
- **Vergelijkingen PARTIALLY TESTED.** Het Kleine Zwaan-paneel mist een eigen gidsfoto voor de partner. Een geschikt zijaanzicht van de snavel en afzonderlijke jeugdvergelijking blijven OPEN. Voor Zomertaling blijft een passend eclipsfotopaar met dezelfde houding OPEN. De bestaande complete panelen voor alle drie hebben technische dekking.
- **Samsung/PWA, owner-preview en productie NOT TESTED.** Onafhankelijke inhouds- en rechtenreview OPEN. SYNC-CHECK voor hostvelden en documentactivering is niet aangetoond. Branchbescherming UNKNOWN.
- Vervolg binnen R43 kan de ontbrekende ANWB-bronnen en onafhankelijke media-inspectie behandelen. Voor een volgende inhoudelijke batch is een apart eigenaarbesluit over de gemelde R43-punten vereist.

**EINDMARKERING — F3-R43 · 129/140 BEKEKEN · 11 TE STARTEN · 0 VOLLEDIGE F3-PASS · RELEASE HOLD**
