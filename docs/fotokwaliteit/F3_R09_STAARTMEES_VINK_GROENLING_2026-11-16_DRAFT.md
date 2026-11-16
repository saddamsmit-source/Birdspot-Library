# Birdspot F3-R09 — Staartmees, Vink en Groenling

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED, geen F3 full-PASS · **3 van 140 vaste soorten**  
**Base:** `84657b88f49f9e24c16d4b0a7d987fd1c4ea93a9` (F3-R08), eigen branch `qa/birdspot-f3-r09-staartmees-vink-groenling-20261116`.  
**Eerste toepassing eigenaarregel:** `docs/BIRDSPOT_KWALITEITSNORM.md` §3.4, versie 1.7: **sterk gelijkende vogels zowel met goede fotoparen als inhoudelijk onderscheidende tekst helpen determineren**. Eventuele onvolledige fotoparen blijven verborgen.

## Gebruikersprobleem, kernroute en non-goals

Een vogelaar moet bij een bruine vinkachtige niet op alleen de kleur gokken; foto's van hetzelfde kleed en in vergelijkbaar zijaanzicht, mét een compacte kenmerkenmatrix, helpen de soort te bevestigen. De kernroute is `Soorten → Vink of Groenling → Herkenning → Lijkt op → Vrouwtje → twee naast elkaar geplaatste rustfoto's → andere soort openen`. Bij twijfel geen zekere soortclaim. Geen nieuwe server, AI-foto, media-aankoop of accounts; bestaand opslag- en privacygedrag ongewijzigd.

## Werkelijk bekeken lokale afbeeldingen

In deze ronde zijn **alle elf bestaande WebP-bestanden** (2 + 5 + 4) op de exacte repo-branch daadwerkelijk geopend. Deze controle is **geen** onafhankelijk oordeel over de originele geüploade JPEG's, herpublicatievoorwaarden, leeftijdsbevestiging of gekwalificeerde ornithologische determinatie. Er is geen asset toegevoegd, vervangen of herlabeld.

| ID | Bestaande foto / rol | Wat in het lokale beeld zichtbaar is | Open |
|---|---|---|---|
| `sp034` Staartmees | `sp034.webp` · volwassen hoofdfoto | Vogel volledig, extreem lange staart, klein snaveltje, donkere zijkopstrepen, wit gezicht | Kopvariant/witkop niet automatisch als ondersoort benoemen; exacte fotograafbron per bestand recheck |
| `sp034` | `sp034-juv.webp` | Juvenielachtig bruin/donker zijgezicht en zeer lange staart; lokale afbeelding scherp | Leeftijd en bronbestandsidentiteit onafhankelijk recheck |
| `sp035` Vink | `sp035-hero-male.webp` · mannetje | Grijze kop, warme borst, lichte vleugelonderdelen | Jaargetijde/broedkleed bron controleren |
| `sp035` | `sp035.webp` · mannetje | Witte vleugelstrepen en blauwgrijze kop, warmbruin/oranje onderzijde | Origineel, licentie, bewerkingen per afbeelding |
| `sp035` | `sp035-adult_f.webp` · vrouwtje | Duidelijk witte vleugelstrepen, grijsbruin kleed; hele vogel zichtbaar, goed zijaanzicht | Bronvrouw bevestigd in bestaande metadata, onafhankelijke beeld-/rechtenreview nog open |
| `sp035` | `sp035-juv-review.webp` · juveniel | Bruin jonge-vogelkleed en lichte vleugelstrepen; oorspronkelijke bron-/leeftijdslabel recheck | Niet hetzelfde als een adult-f vergelijking presenteren |
| `sp035` | `sp035-flight.webp` | Vleugels gespreid, poten uitgestoken; mogelijk opstijgmoment | **Vrije vlucht niet opnieuw bewezen**; bestaande rol niet promoveren zonder de originele bron |
| `sp036` Groenling | `sp036.webp` · volwassen mannetje | Olijfgroene vogel, gele slagpenranden, stevige brede snavel | Bronrechten/origineel |
| `sp036` | `sp036-adult_f.webp` · vrouwtje | Groengrijs/bruin, stevige brede kegelvormige snavel, duidelijke gele vleugelrand; zijaanzicht | Bronvrouw en individuele rechten uit bestaande metadata behouden, onafhankelijke hercontrole open |
| `sp036` | `sp036-juv.webp` | Duidelijk gestreepte borst en dikkere snavel, geel langs vleugel | Vergelijkbaar met volwassen vrouwtje? Nee, separate rol |
| `sp036` | `sp036-flight.webp` | Gespreide vleugels en hangende poten, gele vleugeltekening | **Vrije vlucht niet opnieuw bewezen**; bron/houding apart beoordelen |

Bestaande oorspronkelijke metadata blijven in `assets/species/field-guide-media.json`, `assets/species/credits.json` en `src/features/species/guidePhotos.js`. F3-register bewaart de Git blob-SHA van elk beoordeeld lokaal bestand. Er is geen nieuwe foto geïmporteerd; bestaande foto-/bronrechten zijn niet door deze ronde verruimd.

## F3-R09 verwarringsmatrix — verplicht beeld + tekst samen

**Vink ↔ Groenling (vooral vrouwtjes):** nieuwe rustvergelijking `sp035 adult_f` naast `sp036 adult_f`. Deze twee bestaande bestanden zijn afzonderlijk geopend, beide tonen de vogel in zijaanzicht met de vleugel en snavel voldoende zichtbaar. De gegevens zijn als volwassen vrouwtje met fotograaf/bron/licentie geregistreerd. De UI mag het fotopaar alleen tonen zolang beide assetcontracten slagen.

| Kenmerk | Vrouwtje Vink | Vrouwtje Groenling | Betrouwbaarheid |
|---|---|---|---|
| Gevouwen vleugel | Twee lichte, doorgaans witte banden | Duidelijk geel langs de slagpennen, geen twee witte vinkbanden | Sterk **in combinatie** met snavel/profiel |
| Snavel | Compacte, minder zware kegelsnavel | Brede, krachtige kegelsnavel | Ondersteunend; beeldhoek telt |
| Kleur | Vaak grijsbruin | Doffer groengrijs, gele vleugel-/staartdelen | Belichting varieert; kleur **niet alleen** beslissend |

**Andere belangrijke verwarringspartners:**
- Vinkvrouw ↔ Huismusvrouw `sp043` (lichte vleugelstrepen, gedrag) en winterse Vink ↔ Keep `sp181` (Birdspot-ID in de actuele soortenlijst gecontroleerd; seizoens-/kleedvergelijking nog open).
- Groenlingvrouw/juveniel ↔ Sijs `sp038` (forsere snavel en bouw, gele vleugel; juveniele Groenling kan gestreept zijn). Bestaande `Sijs en Groenling · vrouwtje`-vergelijking behouden.
- Staartmees `sp034`: de zeer lange staart biedt de beste eerste herkenning. Een opvallend wit gezicht mag **niet op zichzelf** worden vertaald naar ondersoort Witkopstaartmees, omdat gewone Staartmezen ook een zeer witte kop kunnen hebben. Bron + kenmerken + geografische context nodig. Bestaande `Staartmees en Zwarte Mees`-vergelijking behouden.

## Audio, landschap en verspreiding

- Staartmees: één geregistreerd `sp034-sound.mp3` met label **Geluidsvoorbeeld**, bronopname XC114614; precies zang of roep is in de bestaande bron niet vastgesteld. **Niet hernoemen tot zekere contactroep.** Formele geluidsaudit open.
- Vink: `sp035-song.mp3` (Zang) en `sp035-call.mp3` (Roep) aanwezig. Onafhankelijke luistertest, matching met originele audiobestanden en rechtencontrole open.
- Groenling: **geen** opgenomen gidsaudio in de huidige `field-guide-media.json`; roep en zang zijn prioritaire kandidaten maar mogen niet worden verzonnen of uit niet-commercieel materiaal gekopieerd.
- Sovon NL-status, eBird-bias/seizoen en biometrische berekening blijven F3 `NOT TESTED` tenzij per soort werkelijk bron/venster getoetst. Aanwezigheid in de oude dataset is géén nieuwe F3-VERIFIED.

## Geraadpleegde inhoudsbronnen (individuele mediarechten afzonderlijk)

1. Vogelbescherming Staartmees — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/staartmees (lange staart; gewone en witkoppige variatie)
2. Vogelbescherming Vink — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/vink (twee lichte vleugelstrepen, vrouwtje-misidentificatie, zang)
3. Vogelbescherming Groenling — https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groenling (groene/groengrijze vormen, geel langs vleugel en buitenstaart, stevige snavel)
4. RSPB kleine bruine vogels — https://www.rspb.org.uk/birds-and-wildlife/identifying-birds/small-brown-birds-you-might-see-in-your-garden (vrouwelijk/juveniel Vink vs Groenling)
5. Vogelbescherming Vink ↔ Keep — https://www.vogelbescherming.nl/tuinvogeltelling/herkenningstips/?tip=3
6. Vogelbescherming Groenling ↔ Sijs — https://www.vogelbescherming.nl/tuinvogeltelling/herkenningstips/?tip=7

**ANWB-vogelgids** niet rechtstreeks ingezien; de bekende verwijzing naar ANWB is daarom niet als nieuwe brongeteste individuele foto-/soortcontrole geteld. Niet-verplichte bronlinks blijven achter de schermen; individuele foto-/audiocredits blijven bereikbaar.

## Test, open gates en herstel

- Geautomatiseerde test: beide vrouwfoto's exact zichtbaar in `recognitionPanel(sp035/sp036)` bij elkaar, bron/licenties aanwezig, beide navigatierichtingen, drie ondersteunende tekstkenmerken, geen vluchtfoto voor rustpaar; oorspronkelijke overige paren intact.
- Browser test bij 320/360/390 px en echte telefoon, toetsenbord, zoom, credits, offline media, foto- en ZIP-herstel nog afzonderlijk aftekenen. Een Node-renderassertie alleen is geen UX- of foto-PASS.
- F3-R09 inspectie betekent **27/140 inhoudelijk bekeken, 113 nog niet gestart, 0 volledig onafhankelijk F3-PASS**. Kwaliteitsnorm versie 1.7; 3 soorten per batch. Code-/PR-release blijft separaat van publieke livegang.
- **Rollback:** sluit de F3-R09-PR; basis `84657b88` blijft ongewijzigd. Bestaande review `21ce9060`, `main` `5bf67043` eveneens. Writer alleen eigen branch; geen data/media verwijderd.

