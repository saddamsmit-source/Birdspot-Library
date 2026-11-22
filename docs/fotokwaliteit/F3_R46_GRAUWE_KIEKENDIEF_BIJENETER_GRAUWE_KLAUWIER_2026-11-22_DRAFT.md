# Birdspot F3-R46 · inhoudscontrole en browserverificatie

22 november 2026 · **PARTIALLY TESTED** · [concept-PR #348](https://github.com/saddamsmit-source/Birdspot-Library/pull/348) · **RELEASE HOLD**

De eigenaar schreef ‘ga verder’ na de terugmelding van R45. Dit geeft de werkvolgorde vrij met behoud van de gemelde punten bij Koereiger, Blauwe Kiekendief en Steppekiekendief. Het [eigenaarbesluit op #347](https://github.com/saddamsmit-source/Birdspot-Library/pull/347#issuecomment-7080701186) staat per soort in het [bestaande F3-register](F3_140_HERCONTROLE_V0.1_DRAFT.json). De basis is R45 `521cc29952e35ceccb2784b8e4358d10a4917bd3`, met vrijgegeven schrijver en 3/3 geslaagde CI-workflows.

De volgende drie registerrijen zijn Grauwe Kiekendief `sp251`, Bijeneter `sp257` en Grauwe Klauwier `sp262`. De twee laatste hadden ieder al een hoofdfoto in de app. Die beelden staan nu in het register. Alle 140 historische auditobjecten zijn behouden. **138/140 bekeken · 2 te starten · 0 volledige F3-PASS.**

## Soortbevindingen en open punten

| Soort | Getoetst | Open |
| --- | --- | --- |
| Grauwe Kiekendief `sp251` | Vier bronbeelden. Op het vluchtbeeld van de man is de donkere band over de armvleugel zichtbaar. De bron beschrijft een opvliegende vrouw en benoemt het andere beeld als juveniel. Het opgeslagen rolbesluit behandelt het juvenielenbeeld als landing. De browser toont alleen het mannenbeeld onder vrije vlucht. Het mannenpaar met Steppekiekendief is in beide richtingen gecontroleerd. Blauwe en Bruine Kiekendief hebben vanuit hun soortkaart een tekstlink naar Grauwe. | Vrije-vluchtbeeld voor vrouw en juveniel, de bijbehorende paren met Steppekiekendief, passende wederkerigheid met Blauwe en Bruine, ANWB, onafhankelijke aftekening van leeftijd en fotorechten, gidsaudio. |
| Bijeneter `sp257` | Eén soortportret met gele keel, blauwgroene onderzijde, oogstreep en gebogen snavel. De fotovergelijking met IJsvogel werkt in beide richtingen. De bron bevestigt de soort. | Sovon meldt jaarlijks broeden sinds 2010. De huidige gids zegt incidenteel broeden. Die broedstatus vraagt inhoudelijke correctie of bronverduidelijking. Sekse van het portret, zelfstandig jeugd- en vluchtmateriaal, ANWB en gidsaudio blijven open. |
| Grauwe Klauwier `sp262` | Eén bronportret uit de showcase. Het toont het mannetjestype met grijze kop, zwart masker en kastanjebruine rug. De soortkaart en broncredits werken via de gewone zoekroute. Vogelbescherming geeft Rode Lijst Bedreigd. | Afzonderlijke foto’s van vrouw en juveniel, passend vergelijkingsbeeld, vluchtbeeld en gidsaudio. De leeftijd van het mannetjesportret en de ANWB-passage zijn nog open. |

### Maatvoering en Nederlandse status

- **Grauwe Kiekendief.** Vogelbescherming geeft 39–49 cm lengte en 102–123 cm spanwijdte. De app geeft circa 40–50 cm en 100–115 cm. Sovon vermeldt doortrek vanaf half april en tot eind september. De app toont mei–augustus. Hoofdseizoen, uiterste maanden, maatbereiken en gewicht staan open voor redactionele bronkeuze. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grauwe-kiekendief) · [Sovon](https://stats.sovon.nl/stats/soort/2630) · [BTO vergelijking van kiekendieven](https://www.bto.org/learn/skills/bird-identification/videos/harriers)
- **Bijeneter.** Vogelbescherming geeft 25–29 cm en 36–40 cm. De app toont 27–29 cm inclusief staart en 36–40 cm. Sovon meldt waarnemingen vrijwel uitsluitend tussen eind april en half oktober, met de meeste in mei en begin juni. De app toont mei–september. Broedstatus, lengteconventie, gewicht en het onderscheid tussen hoofdseizoen en waarnemingsvenster blijven open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bijeneter) · [Sovon](https://stats.sovon.nl/stats/soort/8400)
- **Grauwe Klauwier.** Lengte 16–18 cm komt overeen met Vogelbescherming. Sovon beschrijft aankomst meestal vanaf half mei en wegtrek die half september grotendeels voorbij is. De app toont mei–augustus. Spanwijdte, gewicht en de interpretatie van het seizoenslabel blijven open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grauwe-klauwier) · [Sovon](https://stats.sovon.nl/stats/soort/15150)

**ANWB NOT TESTED.** De geraadpleegde openbare inkijkfragmenten leverden geen leesbare soortpassage voor deze drie soorten op.

## Bronbeelden

Zes foto's zijn vergeleken met rechtstreeks opgehaalde Commons-originelen. Alle zes downloads matchen de opgegeven Commons SHA-1. De beeldmatch bevestigt dezelfde opname. Individuele leeftijdsbepaling, rolbeoordeling en onafhankelijke rechtenaftekening blijven open waar vermeld.

| Gidsfoto | Primaire bron | Beeldovereenkomst r |
| --- | --- | --- |
| `sp251-portrait.webp` | [Hari K Patibanda](https://commons.wikimedia.org/wiki/File:A_Montagu%27s_Harrier_male_roosting_for_the_night_%2850971610728%29.jpg) · CC BY 2.0 | 1,000 |
| `sp251-adult_f.webp` | [Hari K Patibanda](https://commons.wikimedia.org/wiki/File:A_Montagu%27s_Harrier_Taking_Flight_%2851621854680%29.jpg) · CC BY 2.0 | 1,000 |
| `sp251-juv.webp` | [Rodrigo de Almeida from Marco de Canaveses, Portugal](https://commons.wikimedia.org/wiki/File:Circus_pygargus_juvenile_flight.jpg) · CC BY 2.0 | 1,000 |
| `sp251.webp` | [Hari K Patibanda](https://commons.wikimedia.org/wiki/File:Beautiful_Montagu%27s_Harrier_in_Flight_%2851042548717%29.jpg) · CC BY 2.0 | 1,000 |
| `sp257.webp` | [Charles J. Sharp](https://commons.wikimedia.org/wiki/File:European_bee-eater_%28Merops_apiaster%29.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp262.webp` | [Бусел В.А.](https://commons.wikimedia.org/wiki/File:Lanius_collurio_%D1%81%D0%BE%D1%80%D0%BE%D0%BF%D1%83%D0%B4_%D1%81%D1%96%D1%80%D0%B8%D0%B9.jpg) · CC BY-SA 4.0 | 1,000 |

## Technische dekking

- Alle drie kaarten hebben **geen lokale gidsclip**. De browser toont hierbij geen lege speler of losse geluidscredits. Luister- en audioherpublicatiebeoordeling blijven open.
- **Chromium VERIFIED** op 320, 360 en 390 px voor zoeken, de zes gidsfoto’s, hoofdfotocredits, zoomen en terug. Twee fotoparen zijn in beide richtingen getoetst. Twee tekstlinks zijn getoetst. Offline is dezelfde route heropend op 390 px. De eerste proef vergeleek een absoluut testadres met een relatief pad. De bijgewerkte assertie toetst het exacte bestandspad. [Gerichte R46-proef](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/45034414520)
- **Inhoud PARTIALLY TESTED.** Samsung/PWA, owner-preview en productie **NOT TESTED**. Branchbescherming UNKNOWN. Host-SYNC niet aangetoond. Voor R47 staat de eigenaarbeslissing over de hier gemelde punten open. De laatste twee registerrijen zijn Roze Spreeuw en Grote Gele Kwikstaart.

**EINDMARKERING — F3-R46 · 138/140 BEKEKEN · 2 TE STARTEN · 0 VOLLEDIGE F3-PASS · RELEASE HOLD**
