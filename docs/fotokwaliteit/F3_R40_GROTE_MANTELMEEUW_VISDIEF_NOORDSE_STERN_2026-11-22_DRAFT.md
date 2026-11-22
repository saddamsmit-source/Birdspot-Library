# Birdspot F3-R40 · Grote Mantelmeeuw, Visdief en Noordse Stern

**DRAFT · PARTIALLY TESTED · 22 november 2026 · [PR #340](https://github.com/saddamsmit-source/Birdspot-Library/pull/340).** Basis: F3-R39 [PR #339](https://github.com/saddamsmit-source/Birdspot-Library/pull/339) op `59206b11574e8d792170652f43545d2d134a457a` (3/3 CI success, writerclaim VRIJGEGEVEN). Nieuwe inhoudsstand na deze ronde: **120/140 beoordeeld, 20 te starten, 0 FULL PASS**. Alleen sp164, sp165, sp166 worden in F3 van NOT STARTED naar IN CONTENT REVIEW gezet. De 140 historische auditrecords worden niet herschreven.

## 1. Zes bestaande gidsbeelden werkelijk bekeken

De zes actuele lokale WebP-bestanden zijn op de basis-SHA via de GitHub-connector afzonderlijk geopend en direct visueel geïnspecteerd. De Git-blob-SHA-1 identificeert de lokale bytes. Een lokale blik is géén onafhankelijke pixelsgewijze vergelijking met het bronorigineel, noch bewijs dat elke geslachts-, leeftijds- of licentieclaim volledig juist is.

| Soort / rol | Lokaal bestand · Git-blob-SHA1 | Waargenomen kenmerken, grens |
|---|---|---|
| Grote Mantelmeeuw sp164 · Hoofdfoto volwassen, geslacht niet vastgesteld | `sp164-adult.webp` · `2eff0d271f0f5e86c3dda174966c593c9e4eb41c` | Zeer forse meeuw in rust, roze poten, grote gele snavel met rode vlek, bijna zwarte mantel. Maker benoemt soort/kleding; geen onafhankelijke mannelijkheidsclaim. |
| Grote Mantelmeeuw sp164 · Vrije vlucht | `sp164-flight.webp` · `6b10e543af169a18ac8c19bf5ec5c0e5648b1ee5` | Vrije vlucht boven zee, donkere brede vleugels en forse gele snavel. Leeftijd buiten de bronbeschrijving niet geclaimd. |
| Visdief sp165 · Hoofdfoto broedkleed, in rust | `sp165-adult.webp` · `2d4a787a6ff55eb4b8e026d1474458b69b26bdab` | Rustbeeld zwarte kap, rode poten, oranjerode snavel met donkere punt. Geen betrouwbaar geslachtslabel. |
| Visdief sp165 · Juveniel, bronannotatie | `sp165-juv.webp` · `7c83e4e77c68990f226da2490bc06f517821d84e` | Op paal, licht voorhoofd, donker achterhoofd, beige/bruin getekende bovendelen. Bij iNaturalist staat een historisch Juvenile-label; oorspronkelijke fotopagina en leeftijdsdeterminatie opnieuw openen blijft nodig. |
| Visdief sp165 · Vrije vlucht | `sp165-flight.webp` · `a744945e78faac38e19de74100dba732ce8a416e` | Echte vlucht, zwarte kap, lange oranjerode snavel met donkere punt en donkere buitenste handpennen; lichtval beïnvloedt het vleugelcontrast. |
| Noordse Stern sp166 · **Enige gidsfoto, tevens hoofdfoto én vrije vlucht** | `sp166-adult.webp` · `f73cece92fb2d0d36f33753c5994e9f6e609d471` | In vlucht met visje in snavel, korte rode snavel, blekere doorschijnende handpennen en lange staartpennen. Niet ook een onafhankelijke staande broedkleedfoto; geslacht niet zichtbaar. Hetzelfde bestand mag niet als twee verschillende foto's worden geteld. |

**Missende rollen:** Grote Mantelmeeuw heeft geen afzonderlijke juveniel-, winter- of gelijkwaardige vluchtvergelijkingsfoto; Visdief mist een afzonderlijke winterfoto; Noordse Stern mist naast de ene vlucht-/hoofdfoto afzonderlijke rust-, juveniel- en winterbeelden. Geen nieuwe beelden gedownload of verzonnen.

## 2. Bronbestanden, maker en rechten

| Lokale foto | Oorspronkelijke geregistreerde bron | Maker en geregistreerde licentie |
|---|---|---|
| `sp164-adult.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Great_black-backed_gull_(Larus_marinus)_2026_02.jpg) | TRinaud · CC BY 4.0 |
| `sp164-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Great_black-backed_gull_(Larus_marinus)_in_flight_Moher.jpg) | Charles J. Sharp · CC BY-SA 4.0 |
| `sp165-adult.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Common_tern_(Sterna_hirundo).jpg) | Charles J. Sharp · CC BY-SA 4.0 |
| `sp165-juv.webp` | [iNaturalist](https://www.inaturalist.org/photos/731112915) | Dave · CC BY 4.0 |
| `sp165-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Common_tern_(Sterna_hirundo)_in_flight_Ramsviklandet_2.jpg) | Charles J. Sharp · CC BY-SA 4.0 |
| `sp166-adult.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Arctic_tern_(Sterna_paradisaea)_with_eel_Blonduos.jpg) | Charles J. Sharp · CC BY-SA 4.0 |

**Primaire bronpeiling R40:** de Commons-pagina van `Common tern (Sterna hirundo).jpg` is geopend. Ze vermeldt Charles J. Sharp en CC BY-SA 4.0, en vereist naamsvermelding, licentielink, bewerkingsvermelding en een toepasselijke ShareAlike-licentie voor aanpassingen. Andere vier Commons-bestandspagina's leverden bij de oorspronkelijke URL Cache miss; individuele iNaturalist-fotobron is niet nieuw volledig geopend. Bestaande credits/licenties staan dus geregistreerd maar **niet allemaal primair opnieuw geverifieerd**. Er is geen originele foto-pixelmatch geclaimd. Geschikte bron en zichtbaar auteursrecht zijn afzonderlijke gates.

## 3. Soortverwarring — één veilig tekstpaar, één bestaand rustfotopaar

**LK-083, Visdief–Noordse Stern:** de oorspronkelijke vergelijking noemde herkenningskenmerken maar kon in `comparisonImages()` niet met twee gelijkwaardige rustbeelden renderen: `sp165` is bij `breeding` in rust, `sp166` bij `breeding` uitsluitend vliegend. Een enkel gemengd rust-/vluchtpaar is niet vergelijkbaar. De bestaande tekst is daarom wederzijds toegankelijk gemaakt als `reciprocalText: true` en beide `photoMissing: true`. Dit is een gerichte UX-correctie en een **TEXT ONLY / MISSING_VERIFIED_PAIR**, geen gefingeerde foto-PASS. Kenmerken: Visdief gemiddeld langere oranjerode snavel met vaak donkere punt, langere poten en donkerdere buitenste handpennen; Noordse Stern kortere vaak geheel rode snavel, zeer korte poten, lichtere doorschijnende handpennen en lange staartpennen. Leeftijd, licht en positie kunnen variëren. [Vogelbescherming Visdief](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/visdief) · [Noordse Stern](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/noordse-stern) · [Veldvergelijking](https://www.vogelbescherming.nl/actueel/bericht/verschillen-tussen-de-noordse-dief).

**LK-084, Grote Mantelmeeuw–Kleine Mantelmeeuw:** de bestaande zij-aan-zij rustfoto's tonen roze versus gele poten en verschil in bouw en snavel. Het bestaande gidsbeeld van Kleine Mantelmeeuw `sp095.webp` is afzonderlijk geopend: gele poten en donkergrijze mantel zijn goed zichtbaar. LK-084 is **REGISTERED_PAIR_PENDING_F3_ORIGINAL** tot beide individuele bronbeelden, copyright, kijkhoek en volwassen kleed onafhankelijk bevestigd zijn. [Vogelbescherming Grote Mantelmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grote-mantelmeeuw) · [Kleine Mantelmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-mantelmeeuw).

De bestaande Visdief–Grote Stern-vergelijking blijft codehistorie; haar individuele fotogate en daadwerkelijke gebruikerstoegang krijgen afzonderlijke regressie, geen automatische FULL PASS.

## 4. Biometrie, Nederlandse status en audio

**Grote Mantelmeeuw: onopgelost bronverschil**: Birdspot `61–74 cm` lichaamslengte / `144–166 cm` spanwijdte; Vogelbescherming `68–79 cm` / `152–167 cm`. Dit is een materiële herleidingsvraag, geen reden om zonder tweede vergelijkbare uitgever de maatvelden te overschrijven. Voor Visdief bevestigt Vogelbescherming bestaande `32–39 cm` / `72–83 cm`; Noordse Stern heeft bij Vogelbescherming `33–36 cm` / `76–85 cm` tegenover app `33–35 cm` / `75–85 cm`. Ook bij deze kleine afwijking blijft §1 biometrie v1.7 met bron-, meetdefinitie- en afrondingsbewijs gelden.

Status: Grote Mantelmeeuw is jaarrond aanwezig en een schaarse Nederlandse broedvogel; Visdief en Noordse Stern zijn zomergasten/trekkers. Vogelbescherming geeft voor 2025 aantallen van 125–135 broedparen Grote Mantelmeeuw en 18.500–19.750 Visdief, maar deze momentopnames zijn niet als nieuwe apptrend geïmporteerd. Nederlandse Sovon-trends, actuele Rode-Lijst- en eBird-waarnemingsbias moeten specifiek opnieuw worden gecontroleerd. [Vogelbescherming Grote Mantelmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grote-mantelmeeuw) · [Visdief](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/visdief) · [Noordse Stern](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/noordse-stern).

**Audio:** alle drie soorten hebben `0` lokale gidsclips volgens `field-guide-media.json`, `guideMedia.js` en de 140-audiotracker. Zang/roep, bronsoort, licentie, rol, credits, speler en offline geluid voor deze drie soorten blijven **BLOCKED/NOT TESTED**. Geen audio uit externe apps overgenomen of vals gelabeld. De browserproef moet het ontbreken van de audiosecties correct afbeelden.

## 5. Bewijs, privacy en release

Voor deze DRAFT geldt: zes foto's rechtstreeks visueel gecontroleerd, bronmetadata gedeeltelijk herverifieerbaar, genoemde verschillen inhoudelijk vergeleken; geen expert-HUMAN REVIEW of originele pixelmatch. Nodige technische testlaag op dezelfde PR-SHA: F3-140 teller/140 originele IDs en historische audit, juiste zes beeldblobs en resterende 20 soorten, sp166 één werkelijk foto-item, geen audio-players, twee vergelijkingsrichtingen voor text-only LK-083 en foto LK-084, credits, zoom, 320/360/390 px en op 390 px online→offline heropenen met verse cache.

Open blijven: exacte oorspronkelijke afbeeldingsrechten/ondersoorten/leeftijden, ANWB-soortpassages, Sovon/eBird-datacontrole, fysieke Samsung-PWA en GPS/camera/microfoon, back-up/herstel op tweede telefoon, effectieve activering projectinstructies, branchbescherming en veilige preview. **SYNC-CHECK NOT SYNCHRONIZED**: Index v3.13 FINAL verwijst naar Veldhandboek v0.8, beschikbare bijlage is v0.9; werkelijke ChatGPT/Claude-hostinstellingen UNKNOWN. Geen nieuwe betaaldiensten of backend.

Volgende drie nog niet gestarte F3-soorten na deze batch: **Grote Stern `sp167`, Ooievaar `sp170`, Bruine Kiekendief `sp173`**.

**EINDMARKERING — F3-R40 · 120/140 · 20 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
