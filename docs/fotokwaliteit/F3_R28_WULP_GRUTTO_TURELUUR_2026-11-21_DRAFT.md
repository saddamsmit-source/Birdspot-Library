# Birdspot F3-R28 — Wulp, Grutto en Tureluur
**DRAFT / PARTIALLY TESTED · 21 november 2026 · PR #326**

## 1. Herstelbasis en exacte betekenis van voortgang
Basis is de vrijgegeven R27-head `13626c03ae827f1cf41c5179088b589fbd8723aa` op PR #325. R27 heeft 3/3 workflows success op dezelfde SHA, 81/140 soorten inhoudelijk bekeken, 59 NOT STARTED en 0 FULL PASS. Nieuwe R28-spoor start bij dezelfde R27-inhoud en houdt alle eerdere soortrecords en externe branches intact.

**Resultaat na F3-registratie: 84/140 inhoudelijk bekeken, 56 NOT STARTED, 0 FULL PASS.** Alleen sp100, sp101 en sp102 worden in dit nieuwe spoor inhoudelijk bekeken. F3-review is geen onafhankelijke determinatie, geen bevestiging van actuele herpublicatierechten, geen browser-/Samsung-test, geen wijziging van bestaande appversie.

Normhouder blijft de app-README en Birdspot kwaliteitsnorm **v1.7 FINAL**; v1.9 op PR #315 is nog concept. Index v3.13, Projectinstructies v2.14, Handbook v2.18 en Birdspot Veldhandboek v0.9 zijn de gebruikte algemene en domeinbronnen. Bronlabels en eerdere audits worden bewaard, niet als nieuwe bronlezing of onafhankelijk bewijs hernoemd.

## 2. Elf feitelijk geopende bestaande app-WebP's
Elk van de 11 huidige lokale WebP-bestanden is rechtstreeks via de GitHub-blob van de R27-basistree als beeld geopend, individueel bekeken en onderscheiden naar inhoud en rol. Dit is **directe lokale beeldinspectie**, niet herverificatie van ieder origineel, maker, licentie, bron-URL, individueel seksebewijs of opnieuw berekende bron-WebP pixelovereenkomst.

### Wulp — sp100 (3 beelden, 0 geregistreerde geluidsbestanden)
- `/assets/species/sp100.webp`: rustvogel in ondiep water, lange neerwaarts gekromde snavel, sterk gebandeerde bruinige bovendelen en lange poten. Uit alleen dit beeld geen leeftijd of sekse vaststellen.
- `/assets/species/plumage/sp100-juv.webp`: duidelijk **jong, deels donzig exemplaar** met opvallend kortere snavel in gras. Foto is als juveniel geregistreerd via de eerdere iNaturalist-bronannotatie (Jo Roberts, CC BY 4.0); R28 heeft de oorspronkelijke annotatie/waarneming niet opnieuw extern bevestigd. Jongensnavel niet als volwassen standaardkenmerk of bewijs van Regenwulp presenteren.
- `/assets/species/plumage/sp100-flight.webp`: vogel werkelijk los in vrije vlucht boven water met lang gekromde snavel en gespreide lichte ondervleugel; historische maker Charles J. Sharp, CC BY-SA 4.0. De zichtbare vliegpose is bruikbaar als lokale beeldbeschrijving; onafhankelijke soort- en bronmatch blijven open.
- Vergelijking met **Regenwulp sp148**: een combinatie van koptekening, snavelvorm, proporties en eventueel roep is nodig. De kortere snavel van een jonge Wulp is een waarschuwing tegen determinatie met uitsluitend snavellengte. De bestaande vergelijkingsdefinition/kennisbron wordt niet aangepast.
- In het oude F3-register staat een verschil tussen de lengtebereiken van Vogelbescherming en Naturalis. Dat wordt niet stil gelijkgetrokken; bestaande circa-spanband en ruwe bronwaarden blijven bewaard.
- **Gidsaudio ontbreekt.** De beschrijving van roep en balts in het kennisprofiel is tekst, geen werkelijk audiobestand en geen audio-PASS.

### Grutto — sp101 (4 beelden, 0 geregistreerde geluidsbestanden)
- `/assets/species/plumage/sp101-hero-male.webp`: lange rechte/tamelijk rechte snavel en bruin-grijze steltloper in ondiep water. De metadata noemt **mannetje broedkleed** op gezag van fotograaf Charles J. Sharp, CC BY-SA 4.0. De zichtbare foto toont geen vanzelfsprekend helder oranje prachtkleed. Dat is **geen bewijs van een foutieve bron of geslacht**, maar de exacte kleed-, sekse- en datumclaim blijft afhankelijk van de originele individuele bron en een ornithologische beoordeling. De bestaande bronrol wordt niet zonder bewijs gewijzigd.
- `/assets/species/sp101.webp`: rustvogel in gras, lange rechtlijnige snavel, warme hals en gebandeerde onderzijde. Geen automatische individuele vrouwtjes- of broedstatusclaim.
- `/assets/species/plumage/sp101-juv.webp`: bruine vogel foeragerend in ondiep water met warme hals en lichte bovendelranden. De jonge leeftijd komt uit de historische iNaturalist-annotatie (Phil James, CC BY 4.0) en is niet opnieuw onafhankelijk bevestigd.
- `/assets/species/plumage/sp101-flight.webp`: duidelijke vluchtfoto met brede witte vleugelbanen, zwarte staartband en poten zichtbaar achter de staart. Historisch maker Hans Hillewaert, CC BY-SA 4.0. De geregistreerde crop/bewerking blijft in de bronmetadata staan.
- Vergelijking met **Rosse Grutto sp149**: vleugelstreep en staartpatroon alleen beoordelen wanneer geschikte kijkhoek; tegenovergestelde snavelvorm is context, geen absoluut enkelvoudig bewijs. Vrouwtjesfoto's die historisch onvoldoende individueel seksebewijs hadden, worden niet alsnog als bevestigd gepresenteerd.
- Een verschil in lengtebereiken was in eerdere controle genoteerd. R28 verwerkt dit niet tot een nieuwe indicatieve band zonder twee actuele vergelijkbare onafhankelijke bronnen.
- **Geen lokale roep/zang**, ook al heeft de gids een brongebonden beschrijving van de herkenbare grut-to-roep.

### Tureluur — sp102 (4 beelden, 4 geregistreerde audiofragmenten)
- `/assets/species/sp102.webp`: rustvogel met oranjerode poten en rode snavelbasis die overgaat in donkerder punt; veel bruingrijze bovenzijde en lichte onderzijde. Geen automatisch seksebewijs.
- `/assets/species/plumage/sp102-breeding.webp`: vogel met rood-oranje poten op een paal, in mei door iNaturalist-fotograaf Clare Edwards vastgelegd en als broedkleed geregistreerd (CC BY 4.0). Exacte kleedfase is op basis van alleen de lokale pixels en kalenderdatum niet zelfstandig ornithologisch bewezen.
- `/assets/species/plumage/sp102-juv.webp`: duidelijk kleinere/bruine jonge-vogelpresentatie op donkere ondergrond; historische iNaturalist-annotatie Juvenile, Stefan Haag CC BY 4.0, niet opnieuw individueel extern bevestigd. De foto is klein (558×480), beeldkwaliteit/zoom op fysiek toestel nog open.
- `/assets/species/plumage/sp102-flight.webp`: vrije vlucht, brede witte vleugelachterrand, donkerdere vleugeldelen en oranjerode uitgestrekte poten. Foto is **Tringa totanus robusta, IJslandse ondersoort** volgens de originele geregistreerde bestandsnaam en beschrijving; dit mag niet zonder context de Nederlandse ondersoort of alle populaties vertegenwoordigen. Historische auteur Charles J. Sharp, CC BY-SA 4.0.
- Bestaande vergelijking met **Zwarte Ruiter sp157** houdt context: witte vleugelachterrand in vlucht, snavelvorm en seizoenskleed combineren. Geen onverwisselbaar enkelvoudig soortbewijs uit één verendetail.
- Vier audiometadatarecords: **baltszang** (Pascal Christe, Terschelling, CC BY-SA 4.0), **alarm/contactroep** (Camille Vacher, Frankrijk, CC BY 4.0), **vluchtroep** (Noé Ferrari, Frankrijk, CC BY 4.0), **nachtelijke vluchtroep** (Jochem Verweij, Bergschenhoek, CC BY-SA 4.0). Dit zijn bestaande bronregistraties; originele opnamen, daadwerkelijke soortidentificatie en afgescheiden geluidsrol niet opnieuw zelfstandig beluisterd. Laat de geografische recording-context behouden; eerste technische afspeeltest op exacte R28-SHA nog open.

## 3. Direct geraadpleegde brondragers en grenzen
- `assets/species/field-guide-media.json`: bestaande bestandsidentiteiten, maker/licentie, bijsnijden/omzetten, soortrollen en opnamebronnen. Alle 11 appbeelden bestaan volgens directe GitHub-beeldopening; geen nieuwe media geïmporteerd of hernoemd.
- `tools/kennisbaseline/knowledge.json`: `sp100` Wulp (Regenwulpverschil en uitzonderingen bij jongen), `sp101` Grutto (Rosse Grutto en vleugel-/staarttekening), `sp102` Tureluur (Zwarte Ruiter en witte vleugelachterrand), met bestaande bron-ID's.
- `docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json`: huidige 140-ID-volgorde, historische rechtenstatus en eerdere opmerkingen. Alle drie de focusrijen stonden op NOT STARTED. Geen nieuw bewijs uit een niet-geopende ANWB-uitgave, ontoegankelijke iNaturalist/Commons-oorsprong, niet beluisterde audio of ongelezen PDF.
- Relevante reeds geregistreerde referentiepagina's: [Vogelbescherming Wulp](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wulp), [Grutto](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grutto), [Tureluur](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/tureluur). Deze links zijn hier verwijzingen naar eerder geregistreerde kennisbronnen, **geen claim dat ze in R28 opnieuw live zijn geopend**.
- ANWB-editie/pagina's, oorspronkelijke media-bytes, onafhankelijke maker-/licentie-/copyright-update, onafhankelijke ornithologische en auditieve aftekening **NOT TESTED**.

## 4. QA en release-status
| Laag | R28 stand | Bewijsgrens |
|---|---|---|
| Lokale beelden 3+4+4 gezien | PARTIALLY TESTED | 11 beelden individueel visueel geïnspecteerd, origineel/identiteit/licentie niet opnieuw bewezen |
| Media-/audiometadata | PARTIALLY TESTED | 4 Tureluur-opnamen geregistreerd, 0 Wulp/Grutto, geen akoestische rol-/soort-PASS |
| Bronclaims, lookalikes | PARTIALLY TESTED | bestaande kennisbron/vergelijkingsdata bekeken; nieuwe origineelbroncontrole open |
| F3 cohort en 84/140 | NOT TESTED bij inhoudscheckpoint | 140 en regressies via CI op exact R28-head controleren |
| Responsive, zoom/back, offline, ZIP, privacy, PWA | NOT TESTED op R28 SHA | aparte browser/toestel-gates |
| Fysieke Samsung-installatie/download | OPEN | eigenaar heeft alleen werkende privétestschermen op andere SHA bevestigd |
| Onafhankelijk inhoud/geluid/rechten | NOT TESTED | geen volledige F3 PASS |

Geen effect op appcode, gebruikersdata, `main`, Vercel, GitHub Pages, deployment of media. De bestaande 140-soortenvolgorde blijft canoniek. Na R28 is de voorgestelde R29-batch de eerstvolgende drie NOT STARTED rijen, pas na nieuw Git-/writer-/CI-checkpoint.

**Release HOLD. Geen merge, publicatie of kostenwijziging.**

EINDMARKERING — F3-R28 INHOUDELIJK BEKEKEN · 84/140 · 0 FULL PASS
