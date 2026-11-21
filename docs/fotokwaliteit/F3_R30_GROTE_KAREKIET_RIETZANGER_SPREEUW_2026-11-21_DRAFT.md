# Birdspot F3-R30 — Grote Karekiet, Rietzanger en Spreeuw
**DRAFT / PARTIALLY TESTED · 21 november 2026 · PR #328**

## 1. Startpunt, betekenis van de teller en writergrens

R30 is een afzonderlijke branch vanaf vrijgegeven PR #327, head `39e8c261b8a50ea6b3c9f5d07ca900c423cde1a9`. Op die exacte head slaagden de drie noodzakelijke R29-workflows (gerichte Node+Chromium, kennisbaseline/browser en 140-cohort). Andere brede workflows tellen niet als soort-FULL-PASS en blijven apart.

**Na R30-registratie: 90/140 inhoudelijk bekeken, 50 NOT STARTED en 0 FULL PASS.** De drie focussoorten `sp108`, `sp110`, `sp112` worden als inhoudelijk bezocht geregistreerd. De 137 overige F3-rijen blijven exact gelijk. De twee historische nulwaarden `historic.oldAssetCount=0` en `historic.audited=false` voor sp108/sp110 zijn **niet fout**: dit is de oude negenpunts-audit, niet de actuele beeldinventaris. De nul blijft bewaard en de `currentAssets.imageSlots` worden naar de werkelijk bestaande kaartbeelden gereconcilieerd.

Alle negen lokale app-WebP's zijn op de R29-basistree **rechtstreeks als pixels geopend**. Het lezen van deze lokale beelden en de metadata bewijst geen huidige pixelovereenkomst met het bronorigineel, geen onafhankelijke soort-/kleed-/seksevalidatie en geen complete actuele rechtenrecheck. Geen nieuwe media of backend.

## 2. Grootte en bron van de huidige beelden

### sp108 — Grote Karekiet (actueel 2 beelden, historisch 0)

| Rol op de appkaart | Pad | Git blob SHA-1 |
|---|---|---|
| Hoofdfoto | `/assets/showcase/sp108.webp` | `aab77a5b109b6cc3e65670c17a79a417c69dfcd9` |
| In vlucht — **voorwaardelijk** | `/assets/species/plumage/sp108-flight.webp` | `cc77338228b820f351259cc726d407d2282157fc` |

- Hoofdfoto: grote bruine rietvogel vast aan een rietstengel, lichte wenkbrauw, zware snavel (de snavel wordt deels door de stengel afgedekt). Oude broncredit Eugene Stolyarov, Commons CC BY-SA 4.0 via `assets/species/credits.json`. Geen geslachtslabel toekennen.
- Bestaande vluchtfoto: vogel duidelijk los in de lucht, zijaanzicht met opgeheven vleugels, lichte wenkbrauw en forse snavel. Het beeld is **724×543 en zichtbaar zacht**. Historische bron iNaturalist foto `747529794`, Ángel Marcos Luengo Bello, CC BY 4.0 volgens het register. `flight:true` mag behouden blijven als pose, maar `flightReview` blijft letterlijk **voorwaardelijk / niet definitief**. Geen nieuwe finale foto-PASS; er is geen andere vervangende foto geïmporteerd.
- De eerdere F3-nul ontkende niet het bestaan van deze twee werkelijk geregistreerde assets; geen oude bewijsregel verwijderen.
- Vogelbescherming [Grote Karekiet](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grote-karekiet) beschrijft grotere bouw, stevige snavel en opvallender wenkbrauw dan Kleine Karekiet `sp109`. Vergelijking alleen bij voldoende soort-, beeld- en licentiebewijs; het ontbreken van een volledige kennisbaseline voor `sp108` is een **open contentgat**, niet een reden om zonder bron een profiel te creëren.
- Geen geregistreerde lokale zang/roep: de liedbeschrijving op Vogelbescherming is geen herpublicatielicentie of opgeslagen geluid. Geen geluids-PASS.

### sp110 — Rietzanger (actueel 2 beelden, historisch 0)

| Rol op de appkaart | Pad | Git blob SHA-1 |
|---|---|---|
| Hoofdfoto | `/assets/species/sp110.webp` | `5008b929f93623bde84234f7cdd3a61821597b0f` |
| Overige herkenningsfoto — **opvliegend tussen takken** | `/assets/species/plumage/sp110-flight.webp` | `5f13b186962bac8190a5f734d2056b279f14084b` |

- Hoofdfoto: vogel op tak met duidelijke witte wenkbrauw en donkere kruin-/rugtekening, zijdelings zichtbaar. Bron Commons `Sedge warbler (Acrocephalus schoenobaenus) 2.jpg`, Charles J. Sharp, CC BY-SA 4.0. De bestands-/bronpagina is opnieuw tekstueel geopend en noemt Otmoor RSPB Reserve. Geen originele JPEG→app-WebP pixelmatch opnieuw uitgevoerd.
- De tweede opname heet technisch `sp110-flight.webp`, maar de soortmediaregistratie is nadrukkelijk `flight:false`, `flightReview:"uit-rol"`. De vogel beweegt **tussen struiktakken** met uitgeslagen vleugels. Dit is geen bewezen vrije vlucht; deze afbeelding blijft onder Overige herkenningsfoto's en wordt niet door de bestandsnaam naar de In-vluchtsectie gepromoveerd. Het Commons-origineel `Phragmite des Joncs - Envol.jpg` kon nu niet betrouwbaar opnieuw worden opgehaald; historische broncredits Dominique Armange, CC BY-SA 4.0 onveranderd.
- Vogelbescherming [Rietzanger](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietzanger) beschrijft lichtgele wenkbrauw en donker gestreepte rug en kop. Anders dan de vrij egaal bruine Kleine Karekiet is de tekening veel contrastrijker; verschillen op foto combineren, bij twijfel zang naast kleed. Het ontbreken van een volledig kennisprofiel voor sp110 blijft open.
- Geen lokaal geregistreerde zang, roep of vluchtroep. Ontbrekende vrije-vluchtfoto niet aanvullen met een opvliegbeeld of een foto van een andere soort.

### sp112 — Spreeuw (5 bestaande beelden, historisch 5)

| Rol op de appkaart | Pad | Git blob SHA-1 |
|---|---|---|
| Hoofdfoto — man volgens bron | `/assets/species/plumage/sp112-hero-male.webp` | `78af86b57c29d6928734b63bcb1f2da6ef86550c` |
| Volwassen vrouwtje volgens bron | `/assets/species/plumage/sp112-adult_f.webp` | `9fa69a95d9e7800b88ab5ccdcd60ff38abfb5f8b` |
| Juveniel volgens bron | `/assets/species/plumage/sp112-juv.webp` | `bdd13d263dff84b531cea61bf5d4e14243af3311` |
| In vlucht | `/assets/species/plumage/sp112-flight.webp` | `2ff77c446528cdb5ae0b7db5a9e346379bf43a07` |
| Overig volwassen portret | `/assets/species/sp112.webp` | `7bfca1fa0a620d6da1e1cee5faa6b92312b1fbd5` |

- Hero: glanzend zwart/groen verenpak met gele snavel; bronfotograaf Charles J. Sharp noemt dit exemplaar mannetje in broedkleed in Marken (CC BY-SA 4.0). De foto toont snavel en iris, maar nieuwe onafhankelijke individuele seksecontrole blijft open.
- Vrouw: duidelijk gevlekte zwarte vogel op boomwortel met lichtgele snavelbasis. Oude maker hedera.baltica, CC BY-SA 2.0; bron benoemt vrouw, maar **spikkelaantal alleen is geen geslachtsbewijs**.
- Juveniel: egale grijsbruine kop en donkere snavel, geslacht neutraal; maker Charles J. Sharp CC BY-SA 4.0. Bronannotatie juveniel historisch, geen nieuwe onafhankelijke leeftijdsdeterminatie.
- Vlucht: vrije lucht, spitse gespreide vleugels, korte staart; auteur Ralf Hüsges, CC BY 2.0; bestaande fotobewerking als Commons-uitsnede blijft expliciet gedocumenteerd. Geen sekseclaim uit deze hoek.
- Oud portret: volwassentype met glanzend kleed, gele snavel, op tak, historisch fotograaf Rhododendrites CC BY-SA 4.0; dit beeld is geen extra juveniel of seksebevestiging. De huidige gallery heeft vijf verschillende bestanden, niet vijf noodzakelijke nieuwe fotografische rollen.
- De vergelijking **Spreeuw/Merel `sp045`** bestaat reeds en draait om korte vs langere staart, metaalglans en oogring in passend licht. Vogelbescherming [Spreeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/spreeuw) bevestigt het bruine jonge kleed en de wisselende snavelkleur. Eén spikkel of een zwarte silhouetfoto is geen zekerheid.
- Geen geregistreerd geluid ondanks de bestaande bronbeschrijving van zang en imitatie; niet op beschikbaarheid van siteplayer aftekenen.

## 3. Herkomst, expliciete open lacunes en mediarecht
- `assets/species/credits.json` en `assets/species/field-guide-media.json` zijn de bestaande maker/licentie/aanpassingsregisters. Sp108 en sp110 hadden in de **oude** `soortaudit-status.json` geen negenpuntsbeoordeling; de actuele 2+2 foto's zijn in `GUIDE_PHOTOS`/`GUIDE_POSES` zichtbaar. Beide registraties blijven gescheiden.
- Feitelijk nieuw bekeken bronmateriaal: VBN Grote Karekiet, Kleine Karekiet, Rietzanger, Spreeuw (inhoudelijke soortbeschrijvingen), Commons Rietzanger-hoofdfoto (maker/CC BY-SA). Niet alle originele foto-URLs werden opnieuw geopend; iNaturalist sp108-vluchtbron was niet toegankelijk en Commons Rietzanger-opvliegbron gaf geen betrouwbare respons. Bronnen **geparkeerd**, geen verzonnen rechtenbewijs.
- Geen bronmateriaal uit een niet-ingeziene ANWB-editie. Sovon-cijfers en gebieden worden niet als vers gecontroleerde claims toegevoegd. Geen persoonlijke of gevoelige locatie uit bronmetadata in Birdspot vrijgegeven.
- De originele negen lokale Git blobs en alle bestaande broncredits blijven ongemoeid. Vervang een bron met onzekere rechten nooit zonder oorspronkelijk bestand, hergebruikrecht, credit en onafhankelijke inhoudsreview.
- Een **volledig inhoudsprofiel** en bijbehorende soortvergelijkingen voor sp108/sp110 ontbreken nog in de kennisgenerator. Bij deze ronde worden ze als open inhoudstekort geregistreerd. Geen lege fotoparen of profielen zonder volledige onderbouwing inschakelen.

## 4. Controle per laag

| Check | R30 | Nog open |
|---|---|---|
| Negen bestaande app-WebP's daadwerkelijk openen | PARTIALLY TESTED | onafhankelijke soort-, origineel- en leeftijdshercontrole |
| Actuele inventaris 0→2, 0→2, 5→5 en historisch nul bewaren | geregistreerd; test volgt | F3-teller, andere 137 records onveranderd |
| Vlucht-/opvliegrollen | PARTIALLY TESTED | sp108 voorlopig 724×543; sp110 hoort niet bij vrije vlucht |
| Audio | NOT TESTED | 0 lokale opnamen, geen onafhankelijke auditieve soort-/rol-PASS |
| Kennis / lookalikes | PARTIALLY TESTED | sp108/sp110 volledige bron- en tekstprofielen ontbreken; merel/spreeuw bestaande paar |
| Licentie / bronpixel | PARTIALLY TESTED | Commons deels heropend, bronorigineel match niet afgerond |
| Browser 320/360/390, scherm, zoom/terug | NOT TESTED op deze R30 SHA | gerichte CI vereist |
| Samsung/PWA, opslag, offline, ZIP, Merlin, publicatie | NOT TESTED | andere eigenaarspreview is geen nieuw device-bewijs |
| Soort FULL PASS | **0** | onafhankelijke inhoud-/audio-/rechten-/toestelgates |

**Geen merge, GitHub Pages-publicatie, Vercel-deploy, backend, creditsupgrade of livegang.** De eigenaar bevestigde alleen dat eerdere privétestschermen werken; installeren/downloaden blijft OPEN.

EINDMARKERING — F3-R30 INHOUDELIJKE REVIEW · 90/140 · 0 FULL PASS · RELEASE HOLD
