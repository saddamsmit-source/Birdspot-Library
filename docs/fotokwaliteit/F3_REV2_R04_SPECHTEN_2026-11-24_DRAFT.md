# F3-REV2-R04 — Kleine Bonte Specht, Zwarte Specht, Groene Specht (DRAFT)

Status: REVIEWED / OWNER GATE OPEN · Datum 24-11-2026 · PR #354 · base 4a430e6 (R03d-checkpoint)
Reviewer: Claude (Opus 5.5, Claude Code cloud) — eigen beoordeling, geen onafhankelijke review.
Norm: Birdspot Kwaliteitsnorm v1.10 FINAL; eigenaarbesluit 24-11-2026 12:16 CET.
Register: `F3_140_HERCONTROLE_V0.1_DRAFT.json` (records sp017–sp019, batch F3-REV2-R04), `SOORTVERWARRING_REGISTER_V0.1_DRAFT.json` (LK-109…LK-111).
Bewijs: `docs/media-intake/2026-11-24/origcheck-rev2-r04/` (Commons-API, SHA-1, zelfde-opnamecontrole, 100%-uitsneden), `docs/media-intake/2026-11-24/review-rev2-r04/` (contactbladen en kaartschermafbeeldingen 390 px).

## Bronnen
| Bron | Status |
|---|---|
| Vogelbescherming (soortpagina's) | NOT TESTED — WebFetch-hostprompt 24-11 ~12:50 onbeantwoord; niet herhaald, geen omweg |
| ANWB Vogelgids van Europa (2023) | NOT TESTED — geen rechtmatig exemplaar beschikbaar |
| Commons-bestandspagina's (14 foto's, 6 audio) | VERIFIED via API, behalve sp018-juv-review (auteur/beschrijving leeg) en sp018-flight-call (gebruikersnaam toegevoegd) → PARTIALLY TESTED |
| Audio (6 clips) | PARTIALLY TESTED — niet menselijk beluisterd |

## Kleine Bonte Specht (sp017)
- Foto's: hoofdfoto mannetje Italië 2024 scherp maar sterk versleten/bevlekt, warme tinten, rug grotendeels verborgen (weinig representatief); vrouwtje Hongarije 2019 goed; "vlucht" is afzet bij nestholte, terecht als Verenkleed (Vrouwtje) getoond. Geen juveniel, geen echte vrije vlucht.
- Rechten: alle drie VERIFIED (auteur, licentie, SHA-1, zelfde opname).
- Snel herkennen: onderstaart + rode kruin mannetje (quickPrimary [2,3]) onder kritisch kenmerk rugbandering; formaat niet als enig kenmerk.
- Lijkt op: Grote Bonte Specht — mannetjes en vrouwtjes met gelabelde rijen (Rug, Rood op de kop, Onderstaart en formaat); Middelste — één fotopaar zonder rijen, rollabel toont de paartitel "Kleine of middelste bonte specht?" i.p.v. kleed (UI-fout, aantoonbaar), Middelste-foto zonder kleedlabel. LK-109 geregistreerd.
- Open: G1, G2, G5, G14 hoofdfoto, G15 juveniel/vlucht, G16 paar Kleine–Middelste.
- Advies: **B** — rijen + rollabel Kleine–Middelste herstellen, hoofdfotokandidaat (typisch mannetje met zichtbare rugbandering) als niet-actief voorstel onderzoeken.

## Zwarte Specht (sp018)
- Foto's: hoofdfoto mannetje Roemenië 2015 zeer goed; mannetje bosbodem Brussel (klein in beeld); vrouwtje Hessen goed; juveniel alleen kopdetail; vlucht Baden-Württemberg bruikbaar (uitsnede zelfde opname).
- Rechten: VERIFIED behalve juv-review (Commons-API leeg; auteur uit controle 09-11 blijft) en vluchtroep (gebruikersnaam) → PARTIALLY TESTED.
- Snel herkennen: geheel zwart/groot + rood op de kop man/vrouw (quickPrimary [0,2]).
- Lijkt op: Groene Specht in rust (mannetjes) en vlucht — fotoparen gelijkwaardig, tekst in vrije zinnen zonder gelabelde rijen; één kritische kaart. LK-110/LK-111.
- Open: G1, G2, G5, G17 juveniel/rechten, G18 geen roffel-opname, G19 rijen en overige verwarring.
- Advies: **B** — gelabelde rijen Zwarte–Groene (beide richtingen), roffel als materiaalgat registreren.

## Groene Specht (sp019)
- Foto's: hoofdfoto mannetje Kew 2014 (rode kern baardstreep op volle resolutie), zijaanzicht Franconville 2022, vrouwtje op de grond 2017, juveniel Kampenhout 2008, vrouwtje in vrije vlucht 2023 — alle goed en rolcorrect.
- Rechten: alle vijf VERIFIED.
- Snel herkennen: groene rug + rode kruin, oogmasker + baardstreep (quickPrimary [0,1]) onder kritisch kenmerk stuit/vlucht.
- Lijkt op: Zwarte Specht (rust, vlucht) zonder rijen; Wielewaal alleen tekst (LK-060); Grijskopspecht (sp482) niet vergeleken: geen profiel, foto's of gebronde claim (BLOCKED/NOT TESTED). Geen "Let op"-tekst en lege similar-lijst.
- Open: G1, G2, G5, G20 Grijskopspecht, G21 rijen/Let op.
- Advies: **B** — rijen Zwarte–Groene, Let op (vrouwtje/juveniel, tegenlicht); Grijskopspecht alleen na bronlezing.

## Gemeenschappelijk
- quickPrimary: alleen R04-soorten (max. 2 van 4 kenmerken zichtbaar, rest onder Meer kenmerken). Render-diff t.o.v. 4a430e6: alleen sp017, sp018, sp019 (597 kaarten).
- Geen foto's geïmporteerd, vervangen of verwijderd; geen nieuwe iNaturalist-aanroepen.
- Privacy: geen locatie- of nestgegevens in de kaarttekst.
- Geen FULL PASS; eigenaarspoort A/B/C per soort open.

## R04b · uitvoering eigenaarbesluit

**26-11-2026 · lokale kandidaat · Release HOLD.** De tekst hierboven bewaart de R04-controle van 24-11. Het [eigenaarbesluit op #354](https://github.com/saddamsmit-source/Birdspot-Library/pull/354#issuecomment-7134854859) geeft B voor sp017–sp019 en NEE voor Toscane. REV2 blijft op 12/140 herbeoordeeld, 12 vastgelegde besluiten, 0 afgesloten soortreviews en 0 volledige F3-PASS. Historische F3-inhoudsronde blijft 140/140. Een eigenaarbesluit verandert de inhoudelijke bewijsstatus niet.

- **sp017 Kleine Bonte Specht.** Bij de Middelste Bonte Specht is het fotolabel Volwassen. De rijen tonen rug/schouder, onderstaart en koptekening op beide kaarten. De volwassen leeftijd is eerder geregistreerd in het fotorecord. De bron noemt voor die foto een mannetje, maar de veldgids gebruikt het algemene volwassen label wegens het geringe zichtbare geslachtsverschil. De huidige sp017-hoofdfoto blijft actief. Het origineel van een alternatief uit Polen toont kop en gevouwen vleugel duidelijker, maar de dwarsbanden op de rug blijven grotendeels buiten beeld. Dit beeld blijft een afgewezen vervangingsoptie voor deze rol. Een passend alternatief en definitieve herpublicatiecontrole staan open. Juveniel en vrije vlucht ontbreken. [Kleine Bonte Specht](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-bonte-specht) · [Middelste Bonte Specht](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/middelste-bonte-specht) · [Hoofdfotokandidaat](https://commons.wikimedia.org/wiki/File:Lesser_spotted_woodpecker_(50274168577).jpg)
- **sp018 Zwarte Specht.** Rust- en vluchtvergelijking met sp019 bevatten gelabelde rijen in beide richtingen. Het juveniele kopdetail staat bij Philippe Kurlapski, CC BY 1.0. De fotograaf noemt de vogel juveniel. Zelfstandige leeftijdsdiagnose van het kopdetail blijft open. De Vluchtroep staat bij SanoAK, Alexander Kürthy, CC BY-SA 4.0. De Engelse en Slowaakse tekst geven verschillende jaren. De lokale clips decodeerden, menselijke beluistering en lokaal roffelbewijs blijven open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-specht) · [Juveniel](https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg) · [Vluchtroep](https://commons.wikimedia.org/wiki/File:Black_woodpecker_Dryocopus_martius,_flying_call.ogg)
- **sp019 Groene Specht.** Let op beschrijft het gevlekte jeugdkleed, de baardstreep van volwassen vogels en het verlies van herkenningskleur bij tegenlicht. Naturalis bevestigt voor Grijskopspecht een grotendeels grijze kop zonder breed zwart masker. Het volledige paar en beeldbewijs blijven open. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groene-specht) · [Naturalis](https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/nsr_taxon.php?cat=TAB_DESCRIPTION&id=130774)
- **sp009 Slechtvalk.** Toscane staat op afgewezen. Het eerdere voorstel en bronaudit blijven als geschiedenis herleidbaar. R05 is niet geopend. De iNaturalist-rechten uit G8 en representatieve Europese beelden blijven open.
- **Bewijsgrens.** Voor twaalf REV2-soorten is de gelezen herkenningspassage van Vogelbescherming met datum, directe link en bevinding geregistreerd. ANWB-soortpassages en menselijke audiobeoordeling blijven NOT TESTED waar bewijs ontbreekt. Van de spechten zijn 13 foto-items en 6 audio-items in de bestaande stukken teruggevonden, lokaal op bytes of decodeerbaarheid gecontroleerd. De oude vermelding van 14 foto's is bewaard in het historische gedeelte.

## Bronaanvulling op de drie R04b-soorten

**26 november 2026 · Beoordeling van bestaande open punten · Release HOLD.** De referentiebuild is de lokale R04b-variant op de GitHub-head van #369. Aanvullend brononderzoek en controle van bronbestanden voor sp017, sp018 en sp019. De conclusies hieronder zijn toegevoegd aan het bestaande F3-register. De gids zelf bevat de reeds goedgekeurde beelden en audio.

| Soort | Nieuw bewijs | Open |
|---|---|---|
| sp017 Kleine Bonte Specht | Vier originele foto’s visueel naast de huidige hoofdfoto beoordeeld. Het Duitse mannetje van Simon Mannweiler toont de rode kruin en dwarsbandering op de rug duidelijker dan de huidige hoofdfoto. Op originele grootte is de opname zacht en de vogel is relatief smal in het kader. Bruikbaar als kandidaat voor het rugkenmerk, geen beslissing over hoofdfoto. De eerder bekeken Poolse foto blijft bruikbaar voor kop en zijaanzicht. | G14 representatieve, scherpe hoofdfoto die goed werkt op mobiel. G15 juvenielbeeld en aantoonbaar vrije vlucht. |
| sp018 Zwarte Specht | De leeftijdsgids van Blasco-Zumeta en Heinze geeft zwakkere kruinkleur en doffer zwart als steun, plus een sterker leeftijdskenmerk aan de buitenste handpen. Op het bestaande kopdetail is de handpen niet zichtbaar. De bron benoemt het beeld als juveniel. De apart gevonden roffel is een Ogg van 4,18 seconden met broncredit en volledige technische decode. | G17 zelfstandige leeftijdstoets. G18 roffel bestaat als kandidaat, menselijke herkenning van soort, geluidstype en bruikbaarheid van de clip nog NOT TESTED. |
| sp019 Groene Specht | Naturalis en BirdLife Oostenrijk dragen het verschil tussen de volwassen mannetjes. Grijskopspecht heeft een grotendeels grijze kop met een kleine rode voorhoofdvlek en smalle baardstreep. Groene Specht heeft een rode kruin en een breder zwart oogmasker. Drie Europese foto’s van Grijskopspecht zijn bekeken. De Duitse profielopname toont de kopkenmerken het duidelijkst, bij een voerplek. | G20 kandidaatvergelijking voor volwassen mannetjes in rust. Het afgebeelde perspectief verschilt van het huidige Groene Specht-portret. Gelijkwaardigheid en volledige veldgids-/fotocontrole staan open. |

### Bronherkomst en vervolg per punt

- **G14 sp017.** Simon Mannweiler, eigen werk, 7 april 2023, Duitsland, originele JPEG 1300 × 878, Commons-credit CC BY-SA 4.0. SHA-256 `a035107faef78daa6d6cd41cdd8135462c23012a996465735bd6a7c0349589a2`. De drie extra originelen van TRinaud, RaunoK en Andrey Gulivanov leverden respectievelijk een vogel die klein in beeld staat, bruikbare schuin-zijdelingse steun voor rug/vleugel en een duidelijk kop-/vleugelaanzicht waarbij de rug deels wegvalt. Bij een toekomstige uitsnede horen de broncredit, licentielink en bewerkingsmelding. [Mannweiler](https://commons.wikimedia.org/wiki/File:Dryobates_minor_(Kleinspecht)_2023-04-07_(01).jpg) · [TRinaud](https://commons.wikimedia.org/wiki/File:Lesser_spotted_woodpecker_(Dryobates_minor)_2021.jpg) · [RaunoK](https://commons.wikimedia.org/wiki/File:The_lesser_spotted_woodpecker_(Dryobates_minor)_-_V%C3%A4ike-kirjur%C3%A4hn.jpg) · [Gulivanov](https://commons.wikimedia.org/wiki/File:Male_lesser_spotted_woodpecker_(51946390422).jpg)
- **G17 sp018.** Het bestaande lokale beeld blijft een zichtbaar kopdetail met bronleeftijd. Het leeftijdsdocument benadrukt patroon en lengte van de buitenste handpen. Lichtval en kleurweergave beperken beoordeling van de kruintint op één beeld. Geen leeftijds-PASS op deze vergelijking. [Leeftijdsgids](https://blascozumeta.wimbitek.com/specie_files/08630_ENG_Dryocopus_martius_aranzadi.pdf) · [Originele fotopagina](https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg)
- **G18 sp018.** Commons beschrijft de opname als roffel van een vrouwtje Zwarte Specht in Slowakije en vermeldt SanoAK, Alexander Kürthy, CC BY-SA 4.0. De originele Ogg is volledig gedecodeerd met FFmpeg. Vorbis, 44.100 Hz, 2 kanalen, 4,179592 seconden. SHA-256 `39a773323052b89c5dfecc175edbe4e4ac4c68e4acd4b48af0adbf17578babfb`. Het fragment verwijst naar Xeno-canto 311605. Die pagina was bij deze check niet uitleesbaar. Bronmetadata en decodeerbaarheid zijn bewijs voor de kandidaat. De akoestische determinatie en bruikbaarheid blijven open. [Commons-opname](https://commons.wikimedia.org/wiki/File:Black_woodpecker_Dryocopus_martius_female_drumming.ogg) · [Xeno-canto-record](https://xeno-canto.org/311605)
- **G20 sp019 ↔ sp482.** De Duitse opname van Boschfoto (CC BY-SA 3.0) geeft duidelijk zijaanzicht van een mannetje. SHA-256 `c3ba09cba98edbd2b00b9cf9800658a051bf1817154f4a815a9bee9fd72dcbbb`. De Finse opname van Alpo Roikola (CC BY 3.0) toont de rug goed, met de kop omhoog en minder compleet zichtbaar. De Belgische opname van Frank Vassen (CC BY 2.0) heeft sterker schaduwcontrast en onderaanzicht. De twee onderzochte beelden van Imran Shah uit Pakistan zijn voor een Europese gidsvergelijking afgevallen. Gebruik in vergelijking eerst oogmasker en verdeling van rood. Tel formaat zonder referentie of groen in tegenlicht alleen als zwakke steun. [Naturalis](https://birds-europe.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/nsr_taxon.php?cat=TAB_DESCRIPTION&id=130774) · [BirdLife Oostenrijk en Umweltbundesamt, p. 486](https://www.umweltbundesamt.at/fileadmin/site/themen/naturschutz/band_1_vogelarten.pdf) · [Duits beeld](https://commons.wikimedia.org/wiki/File:Grauspecht_HB-01.jpg) · [Fins beeld](https://commons.wikimedia.org/wiki/File:Harmaap%C3%A4%C3%A4tikka_koiras.jpg) · [Belgisch beeld](https://commons.wikimedia.org/wiki/File:Picus_canus,_Rocherath_1.jpg)

De ANWB-passage blijft voor alle drie NOT TESTED. De reguliere editie vermeldt de spechten in de inhoudsopgave. De soorttekst was via de gecontroleerde openbare route niet beschikbaar. De luxe inkijkroute gaf bij deze controle een toegangs- of ophaalfout. Geen claim over de inhoud van dat fragment op basis van deze fout. [ANWB uitgever](https://www.kosmosuitgevers.nl/boek/anwb-vogelgids-van-europa/)

Teller blijft 140/140 inhoudelijk bekeken, 12/140 herbeoordeeld, 0 volledige F3-PASS. F3-R05 is niet geopend. De eigenaar kan de volgende inhoudelijke stap baseren op daadwerkelijke ANWB-pagina’s, een menselijke luistercontrole en een beslissing over verdere beeldselectie.
