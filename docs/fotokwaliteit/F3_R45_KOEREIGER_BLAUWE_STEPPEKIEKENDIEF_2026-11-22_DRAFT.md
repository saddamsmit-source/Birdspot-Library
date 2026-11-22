# Birdspot F3-R45 · eerste inhoudscontrole en browserverificatie

22 november 2026 · **PARTIALLY TESTED** · [concept-PR #347](https://github.com/saddamsmit-source/Birdspot-Library/pull/347) · **RELEASE HOLD**

De eigenaar schreef ‘ga verder’ na de terugmelding van R44. Dit geeft de werkvolgorde vrij met behoud van de gemelde open punten bij Strandplevier, Poelruiter en Zwartkopmeeuw. Het [eigenaarbesluit op #346](https://github.com/saddamsmit-source/Birdspot-Library/pull/346#issuecomment-7080302707) is per soort vastgelegd in het [bestaande F3-register](F3_140_HERCONTROLE_V0.1_DRAFT.json). Basis was R44 `202aa991d8e52548082e697269ef328d31c4b619` met vrijgegeven schrijver en 3/3 geslaagde CI-workflows.

De volgende drie bestaande registerrijen zijn Koereiger `sp245`, Blauwe Kiekendief `sp249` en Steppekiekendief `sp250`. Bij Koereiger was de actuele fotoinventaris leeg terwijl de gids vijf foto's toont. Die beelden staan nu in het register. Alle historische auditobjecten zijn behouden. **135/140 bekeken, 5 te starten, 0 volledige F3-PASS.**

## Soortbevindingen en open punten

| Soort | Beeld en veldherkenning | Open |
| --- | --- | --- |
| Koereiger `sp245` | Vijf oorspronkelijke beelden gematcht. De bronfoto van het juveniel heeft een leeftijdsannotatie en toont een donkere, korte snavel. Bron foto 116157768 noemt Adult. Het broedbeeld toont oranjegele sierveren. De drie bestaande rustvergelijkingen met Kleine en Grote Zilverreiger werken in beide richtingen. Kijk bij jonge vogels ook naar de verhoudingen van snavel, hals en poten. | Afzonderlijke rol- en rechtenaftekening, ANWB, actuele verificatie van drie Xeno-canto-bronnen en luistertoets. Het geslacht van de winter- en vluchtvogel staat open. De taxonomische naamgeving en het label ‘standvogel’ vragen redactionele afweging. |
| Blauwe Kiekendief `sp249` | Vijf oorspronkelijke beelden gematcht, inclusief de uitsnede van het rustportret. De zij- en onderaanzichten tonen bij de betreffende beelden brede vleugels, zwarte vleugelpunten, stuit of bandering. Commons benoemt een vrouw en een juveniele vrouw op afzonderlijke foto’s. Drie wederkerige vluchtpanelen met Steppekiekendief en twee met Bruine Kiekendief `sp173` zijn getoetst. Bij Grauwe Kiekendief `sp251` is vanuit de Blauwe een tekstlink aanwezig. | Individuele kleed- en rechtencontrole, wederkerig fotopaar en retourverwijzing met Grauwe, juvenielenpaar met Bruine, ANWB en maatbereiken. Originele audio-download geblokkeerd met HTTP 429. Onafhankelijke herkenning van soort en bedelroep blijft OPEN. |
| Steppekiekendief `sp250` | Vijf oorspronkelijke beelden gematcht. De mannenbeelden ondersteunen het bleke kleed en het beperkte zwarte veld aan de vleugelpunt. Bron 626654808 vermeldt Adult/Female. De juvenielenfoto toont warme onderdelen en bandering, met nog onbesliste leeftijd. De drie vluchtpanelen met Blauwe en het ene mannenpaneel met Grauwe werken in beide richtingen. | Zelfstandige leeftijdsbevestiging van de juvenielenfoto, vergelijkbare vrouwtjes- en juvenielenparen met Grauwe, onafhankelijke rechtencontrole en ANWB. Een lichte halsring en een donkere boa moeten samen met ondervleugel, kijkhoek en kleed worden beoordeeld. Er is geen lokale gidsclip. |

### Gelezen soortbronnen

- **Koereiger.** Vogelbescherming geeft 45–56 cm en 88–96 cm, gelijk aan de app. Sovon ondersteunt waarnemingen in alle maanden en een eerste succesvol broedgeval in 2021. De gelezen jaarbronnen ondersteunen jaarlijks broeden van 2021 tot en met 2025. Sovon en iNaturalist gebruiken `Ardea ibis`, de app `Bubulcus ibis`. Gewicht en redactionele naamkeuze staan open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/koereiger) · [Sovon soortpagina](https://stats.sovon.nl/stats/soort/1110) · [Sovon jaargegevens](https://sovon.nl/actueel/nieuwsberichten/zeldzame-broedvogels-2024)
- **Blauwe Kiekendief.** Vogelbescherming geeft 42–50 cm en 100–121 cm. De app toont circa 45–50 cm en 100–120 cm. De gelezen bronnen ondersteunen breedte, zwarte punten, witte stuit en bandering als combinatie, met aandacht voor kleed en kijkhoek. Sovon ondersteunt wintervoorkomen en zeer schaars broeden. Exacte maatpresentatie, gewichten en individuele kleedbeoordeling blijven open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/blauwe-kiekendief) · [Sovon](https://stats.sovon.nl/stats/soort/2610)
- **Steppekiekendief.** Vogelbescherming geeft 40–48 cm en 100–121 cm. De app toont circa 40–50 cm en 95–110 cm. Sovon vermeldt doortrek van eind maart tot begin mei en eind augustus tot in november. De app toont april–mei en augustus–oktober. Hoofdvenster, uiterste maanden, maten en gewichten blijven redactionele punten. Bij ringstaarten kan een enkele kleur of halsring onvoldoende onderscheid geven. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/steppekiekendief) · [Sovon](https://stats.sovon.nl/stats/soort/2620) · [Forsman, Dutch Birding 17(2), pp. 41–54](https://www.dutchbirding.nl/journal/pdf/DB_1995_17_2.pdf)

**ANWB NOT TESTED voor alle drie.** De geraadpleegde openbare inkijkfragmenten leverden geen leesbare soortpassage voor deze drie op.

## Verifieerbare fotobronnen

Vijftien originele beelden zijn rechtstreeks opgehaald en vergeleken met de gidsfoto. Bij de tien Commons-bestanden klopt de SHA-1 met Commons. Voor het uitgesneden rustbeeld van Blauwe Kiekendief is de positie- en schaalvergelijking verfijnd. De beeldmatch bevestigt dezelfde opname. Onafhankelijke inhouds- en herpublicatieaftekening blijft open.

| Gidsfoto | Primaire bron | Beeldovereenkomst r |
| --- | --- | --- |
| `sp245.webp` | [Bernard DUPONT from FRANCE](https://commons.wikimedia.org/wiki/File:Cattle_Egrets_%28Bubulcus_ibis%29_%2826473504731%29.jpg) · CC BY-SA 2.0 | 0,999 |
| `sp245-juv.webp` | [Zac Peterson](https://www.inaturalist.org/photos/113155242) · CC BY 4.0 | 1,000 |
| `sp245-breeding.webp` | [Charles J. Sharp](https://commons.wikimedia.org/wiki/File:Cattle_egret_%28Bubulcus_ibis%29_summer_plumage_Cyprus.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp245-winter.webp` | [Andrea Mologni](https://www.inaturalist.org/photos/116157768) · CC BY-SA 4.0 | 1,000 |
| `sp245-flight.webp` | [Derek Bakken](https://commons.wikimedia.org/wiki/File:Cattle_Egret_%28Bubulcus_ibis%29_-in_flight.jpg) · CC BY 2.0 | 1,000 |
| `sp249-hero-male.webp` | [Maurice.dekens](https://commons.wikimedia.org/wiki/File%3ABlauwe_kiekendief_masc.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp249-male-rest.webp` | [Sofia Voynovskaya](https://www.inaturalist.org/photos/728343078) · CC BY 4.0 | 0,9974 |
| `sp249.webp` | [caroline legg](https://commons.wikimedia.org/wiki/File:Hen_Harrier_-_Male.jpg) · CC BY 2.0 | 0,999 |
| `sp249-adult_f.webp` | [Maurice.dekens](https://commons.wikimedia.org/wiki/File:Blauwe_kiekendief_fem.jpg) · CC BY-SA 4.0 | 1,000 |
| `sp249-juv.webp` | [Rob Zweers](https://commons.wikimedia.org/wiki/File:Blauwe_Kiekendief.jpg) · CC BY 2.0 | 1,000 |
| `sp250-hero-male.webp` | [Luiz Lapa from Oeiras, Portugal](https://commons.wikimedia.org/wiki/File%3ATartaranh%C3%A3o-_p%C3%A1lido%2C_macho%2C_Pallid_Harrier%2C_male_%2849237959991%29.jpg) · CC BY 2.0 | 1,000 |
| `sp250-male-rest.webp` | [Jan Ebr & Ivana Ebrová](https://www.inaturalist.org/photos/506883636) · CC BY 4.0 | 1,000 |
| `sp250.webp` | [Hari K Patibanda](https://commons.wikimedia.org/wiki/File:A_male_Pallid_Harrier_flying_away_from_us_early_morning_%2850536689517%29.jpg) · CC BY 2.0 | 0,999 |
| `sp250-adult_f.webp` | [Tejas M](https://www.inaturalist.org/photos/626654808) · CC BY 4.0 | 1,000 |
| `sp250-juv.webp` | [Bogomaz Mykhailo](https://commons.wikimedia.org/wiki/File:%D0%9B%D1%83%D0%BD%D1%8C_%D1%81%D1%82%D0%B5%D0%BF%D0%BE%D0%B2%D0%B8%D0%B9_Circus_macrourus,_%D0%BD%D0%B0_%D0%BE._%D0%94%D0%B6%D0%B0%D1%80%D0%B8%D0%BB%D0%B3%D0%B0%D1%87.jpg) · CC BY-SA 4.0 | 1,000 |

## Geluid en technische dekking

- Koereiger. Drie bestaande MP3’s zijn lokaal gedecodeerd en in Chromium afgespeeld. Xeno-canto gaf bij [XC1088515](https://xeno-canto.org/1088515), [XC1088511](https://xeno-canto.org/1088511) en [XC1080059](https://xeno-canto.org/1080059) toegang geweigerd. Brontaxon, luisterbeoordeling en actuele licentie blijven bij de afzonderlijke clips OPEN.
- Blauwe Kiekendief. De [bronpagina van XC558933](https://commons.wikimedia.org/wiki/File:Circus_cyaneus_-_Hen_Harrier_XC558933.mp3) toont Benoît Van Hecke, CC BY-SA 4.0 en bronlabels voor bedelroep, vrouw en vluchtroep. Het lokale fragment van circa 22,05 s decodeert en speelt af. De download van de 28,55 s lange bron kreeg HTTP 429. Bestandsmatch en onafhankelijke luister- en herpublicatiecontrole blijven OPEN.
- Steppekiekendief. Correcte afwezigheid van een lokale speler getest. Een betrouwbare eigen gidsclip blijft OPEN.
- **Chromium VERIFIED** op 320/360/390 px voor de vijftien gidsfoto’s, hoofdfotocredits, zoom en terug. Negen fotoparen over vijf soortcombinaties zijn in beide richtingen getoetst. Blauwe → Grauwe heeft een geteste tekstlink. Dezelfde route slaagde na offline heropening op 390 px. Alle vier aanwezige opnamen kregen offline HTTP 206. [Gerichte R45-run op `07d0c5c`](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/45031316266)
- **Inhoud PARTIALLY TESTED.** Toestel, owner-preview en productie **NOT TESTED**. Branchbescherming UNKNOWN. Host-SYNC niet aangetoond. Voor R46 staat de afzonderlijke eigenaarbeslissing over de gemelde R45-punten open.

**EINDMARKERING — F3-R45 · 135/140 BEKEKEN · 5 TE STARTEN · 0 VOLLEDIGE F3-PASS · RELEASE HOLD**
