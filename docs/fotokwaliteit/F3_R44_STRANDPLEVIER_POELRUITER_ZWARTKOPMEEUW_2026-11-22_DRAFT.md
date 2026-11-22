# Birdspot F3-R44 · eerste inhoudscontrole en browserverificatie

22 november 2026 · **PARTIALLY TESTED** · [concept-PR #346](https://github.com/saddamsmit-source/Birdspot-Library/pull/346) · **RELEASE HOLD**

De eigenaar schreef ‘ga verder’ na de terugmelding van R43. Dit besluit laat de gemelde punten voor Gekraagde Roodstaart, Wilde Zwaan en Zomertaling open en geeft de werkvolgorde voor R44 vrij. Het is per soort vastgelegd in het [bestaande F3-register](F3_140_HERCONTROLE_V0.1_DRAFT.json), met een link naar [het eigenaarbesluit bij R43](https://github.com/saddamsmit-source/Birdspot-Library/pull/345#issuecomment-7080115728). Werkbasis was R43 `cb047909b1ec93dc6d61a40df4af5203b6f6b5f4`, met vrijgegeven schrijver en 3/3 geslaagde CI-workflows.

Strandplevier `sp206`, Poelruiter `sp217` en Zwartkopmeeuw `sp225` zijn de volgende drie soorten in de bestaande volgorde. Hun levende F3-fotoinventaris bevat nu de beelden uit de soortkaarten. De 140 historische auditobjecten zijn behouden. **132/140 inhoudelijk bekeken, 8 te starten, 0 volledige F3-PASS.**

## Soortkaarten en resterende inhoudelijke keuzes

| Soort | Getoetst | Open vóór afzonderlijke aftekening |
| --- | --- | --- |
| Strandplevier `sp206` | Op de vijf bestaande beelden zijn de lichte borst met zijvlekken, de donkere snavel/poten of de lichte vleugelstreep bij vrije vlucht passend zichtbaar. iNaturalist-documentatie ondersteunt Adult/Male, Adult/Female en Juvenile op de betreffende beelden. Broedkleed staat naast Kleine Plevier `sp147`, winter- en jeugdkleed naast Bontbekplevier `sp146`, in beide richtingen. | De winterfoto toont een bleek kleed zonder individuele leeftijds-/sekseannotatie. Bij bruine vogels helpen borsttekening en pootkleur samen, met beperkt onderscheid in ongunstig licht. Vier lokale roep- en zangvoorbeelden spelen technisch af. De Xeno-canto-bronnen, geluidstypen en actuele herpublicatierechten staan open. |
| Poelruiter `sp217` | Vier bestaande gidsfoto’s, waaronder het brongeannoteerde juveniel. Het profiel toont de fijne, rechte snavel en lange poten. Broed-, winter- en jeugdkleed staan naast Groenpootruiter `sp158` in beide richtingen. Twee lokale roepvoorbeelden komen overeen met de originele iNaturalist-opnamen. | Leeftijd en sekse waar niet individueel aangetoond, onafhankelijke luister-/rechtenaftekening, passend wederkerig vluchtfotopaar en precieze seizoensformulering. Bepaal de soort bij twijfel met het dunne snavelprofiel en lichaamsverhoudingen. Schijnbare grootte en pootkleur kunnen door perspectief en licht vertekenen. |
| Zwartkopmeeuw `sp225` | Drie Commons-beelden. De hoofdfoto toont volwassen broedkleed met diepzwarte kap en rode snavel. De winterfoto toont een donkere oogveeg. Vergelijking met Kokmeeuw `sp097` werkt in beide richtingen. Het vrije-vluchtbestand komt uit een bron met het label niet-broedkleed. | De leeftijd op de vluchtfoto is OPEN. Het beeld is ongeschikt om op zichzelf de witte volwassen slagpennen als onderscheid te bewijzen. Voor veldvergelijking zijn een passend adult-vluchtpaar en een juvenielenpaar open. Er is geen lokale gidsclip. |

### Gelezen soortbronnen

- **Strandplevier.** Vogelbescherming bevestigt zijborstvlekken, donkere poten en 15–17 cm lengte bij 42–45 cm spanwijdte. Sovon plaatst de hoofdaanwezigheid in april–september en het belangrijkste broedgebied in de Delta. De app toont maart–september en gebruikt het oudere geslacht `Charadrius`. Sovon en iNaturalist tonen `Anarhynchus alexandrinus`. Taxonomie en presentatie van de maanden blijven een redactionele keuze. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/strandplevier) · [Plevieren vergelijken](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-kleine-plevier-vs-bontbekplevier-vs-strandplevier) · [Sovon](https://stats.sovon.nl/stats/soort/4770)
- **Poelruiter.** Vogelbescherming ondersteunt het fijne snavelprofiel en 22–26 cm lengte bij 55–59 cm spanwijdte. Sovon meldt maart–oktober, vooral de tweede helft van april en juli–augustus. De app toont april–september. De exacte scheiding tussen hoofdseizoen en uiterste maanden blijft OPEN. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/poelruiter) · [Sovon](https://stats.sovon.nl/stats/soort/5470)
- **Zwartkopmeeuw.** Vogelbescherming onderbouwt het leeftijdsafhankelijke onderscheid met Kokmeeuw, de rode snavel, zwarte kap in broedkleed en witte slagpennen bij volwassen vogels. Sovon beschrijft ook donker in de vleugeltoppen bij sommige subadulten. Het appbereik 37–40 cm bij 94–102 cm komt overeen met Vogelbescherming. Gewichten voor de drie soorten en onafhankelijke verificatie per foto blijven OPEN. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwartkopmeeuw) · [Sovon](https://stats.sovon.nl/stats/soort/5750)

**ANWB NOT TESTED voor alle drie.** De gecontroleerde openbare fragmenten bevatten geen leesbare soortpassage voor deze drie. De notities steunen op de daadwerkelijk gelezen soortbronnen.

## Bronbeelden en audio

De twaalf originele fotobestanden zijn rechtstreeks opgehaald en met de lokale WebP’s vergeleken. Alle vier Commons-bestanden komen overeen met de SHA-1 die Commons opgeeft. De makers en bronlicenties zijn per record gelezen. Voor de sterkere uitsneden is de positie en schaal verfijnd. De uitkomst bewijst dezelfde opname. Foto-, rol- en rechtenaftekening blijven afzonderlijk.

| Gidsfoto | Primaire bron en licentielabel | Beeldovereenkomst r |
| --- | --- | --- |
| `sp206.webp` | [Sylvain Montagner](https://www.inaturalist.org/photos/485435922) · CC BY 4.0 | 1,000 |
| `sp206-adult_f.webp` | [Katerina Kalogerini](https://www.inaturalist.org/photos/268541114) · CC BY 4.0 | 1,000 |
| `sp206-juv.webp` | [SteveM4560](https://www.inaturalist.org/photos/565748384) · CC BY 4.0 · uitsnede | 0,9953 |
| `sp206-winter.webp` | [Paulo Caseirito](https://www.inaturalist.org/photos/258130184) · CC0 | 1,000 |
| `sp206-flight.webp` | [Forest Botial-Jarvis](https://www.inaturalist.org/photos/180206774) · CC BY 4.0 · uitsnede | 0,9961 |
| `sp217.webp` | [Вячеслав Юсупов](https://www.inaturalist.org/photos/103339289) · CC BY 4.0 | 1,000 |
| `sp217-juv.webp` | [Вячеслав Юсупов](https://www.inaturalist.org/photos/28427341) · CC BY 4.0 · uitsnede | 0,9916 |
| `sp217-winter.webp` | [Marian Read](https://www.inaturalist.org/photos/246809118) · CC0 | 1,000 |
| `sp217-flight.webp` | [Ron Knight](https://commons.wikimedia.org/wiki/File:Marsh_Sandpiper_(Tringa_stagnatilis)_(8079446361).jpg) · CC BY 2.0 | 1,000 |
| `sp225.webp` | [MPF](https://commons.wikimedia.org/wiki/File:2019-04-17_Ichthyaetus_melanocephalus,_Gosforth_Park,_Northumberland_2.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp225-winter.webp` | [MPF](https://commons.wikimedia.org/wiki/File:2022-01-24_Ichthyaetus_melanocephalus,_Killingworth_Lake,_Northumberland_1.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp225-flight.webp` | [Charles J. Sharp](https://commons.wikimedia.org/wiki/File:Mediterranean_gull_(Ichthyaetus_melanocephalus)_non_breeding_in_flight_Vadu.jpg) · CC BY-SA 4.0 · uitsnede | 0,9777 |

| Poelruiter-bron | Brontaxon en licentielabel | Technische bestandsmatch |
| --- | --- | --- |
| [iNaturalist 1958314](https://www.inaturalist.org/observations/362457845) | Tringa stagnatilis · CC0 | 4,893 s, correlatie 0,9995 |
| [iNaturalist 1766672](https://www.inaturalist.org/observations/338563142) | Tringa stagnatilis · Sam Hambly · CC BY | 8,748 s, correlatie 0,9980 |

Golfvormen zijn vergeleken na decodering naar 8 kHz mono. Herkenning van het geluidstype en controle op achtergrondsoorten vragen een onafhankelijke luisterbeoordeling. De vier Strandplevierbestanden zijn lokaal volledig decodeerbaar. Broncontrole kon niet worden voltooid voor [XC730589](https://xeno-canto.org/730589), [XC820173](https://xeno-canto.org/820173), [XC817939](https://xeno-canto.org/817939) en [XC817932](https://xeno-canto.org/817932).

## Technisch bewijs en overdracht

- **Chromium VERIFIED** op 320/360/390 px voor eigen gidsfoto’s, hoofdfotocredits, zoom en terug, zeven fotopanelen in acht navigatierichtingen en zes bestaande audio-elementen. Dezelfde route slaagde offline na heropening vanuit een vers profiel op 390 px. Elk audiobestand gaf een HTTP 206-bereik. [Gerichte R44-run op `1d6fbb6`](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/45030023739)
- **Inhoud PARTIALLY TESTED.** Bronbestanden, veldkenmerken, technische bediening en volledige onafhankelijke verificatie hebben eigen bewijsstatus. Samsung/PWA, owner-preview en productie **NOT TESTED**. Branchbescherming UNKNOWN. Host-SYNC niet aangetoond.
- Vóór een eventuele R45 worden de hierboven gemelde R44-punten aan de eigenaar voorgelegd voor nader onderzoek, gerichte verbetering of voorlopig doorgaan.

**EINDMARKERING — F3-R44 · 132/140 BEKEKEN · 8 TE STARTEN · 0 VOLLEDIGE F3-PASS · RELEASE HOLD**
