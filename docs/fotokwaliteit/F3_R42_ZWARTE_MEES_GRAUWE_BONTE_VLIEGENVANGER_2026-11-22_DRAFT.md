# Birdspot F3-R42 · Zwarte Mees, Grauwe Vliegenvanger en Bonte Vliegenvanger

**DRAFT · 22 november 2026 · PARTIALLY TESTED · [PR #344](https://github.com/saddamsmit-source/Birdspot-Library/pull/344)**

Basis is de vrijgegeven R41-commit `326665c796f9a2a8a74a4abfd37d0a8ae1f15b37` (30/30 CI SUCCESS) van [PR #342](https://github.com/saddamsmit-source/Birdspot-Library/pull/342). Nieuwe F3-inhoudstelling na deze drie soorten: **126/140 individueel bekeken, 14 NOT STARTED, 0 FULL PASS**. Oudere F1/F2-historie blijft intact.

**Eigenaarpoort tussen R41 en R42:** de eigenaar antwoordde op 22 november 2026 **‘ga verder’** direct op de vraag om optie C voor de drie concreet gemelde R41-lacunes. Registratie: eigenaar kiest **VOORLOPIG DOORGAAN MET OPEN PUNTEN** voor uitsluitend sp167 Grote Stern, sp170 Ooievaar en sp173 Bruine Kiekendief. Dit is een voortgangsbesluit; geen bewijs over soort, originele beelden, audio, rechten of release en geen algemeen akkoord voor latere batches. Het F3-register bewaart de keuze in de drie R41-records met verwijzing naar [R41 PR #342](https://github.com/saddamsmit-source/Birdspot-Library/pull/342) en het opvolgende gesprek.

## Zes-ogenbeeldcontrole van tien bestaande gidsfoto's

Alle tien bestaande lokale WebP's zijn individueel op de R41-codeboom via de GitHub-connector geopend en bekeken. Controle omvat leesbare soortkenmerken, beelddetail, rol, vluchtstatus en de aanwezigheid van een echte gidsfoto. Beeldkwaliteit en identificatie van het lokale bestand zijn **PARTIALLY TESTED**; geen volledige pixelmatch met bronorigineel voor alle tien, geen onafhankelijke veldexpertreview. De derde kolom is Git-blob-SHA1 van de werkelijk geopende bytes, niet de bron-SHA.

| Soort / slot | Eigen bestaand Birdspot-bestand | Git-blob SHA-1 | Maker/licentie uit bestaand manifest, niet allemaal zelfstandig primair herbevestigd |
|---|---|---|---|
| Zwarte Mees · Hoofdfoto | `/assets/species/sp174.webp` | `3d38ef07d3b0e044b69ada46f457c07a144762da` | [bron](https://commons.wikimedia.org/wiki/File:Coal_Tit_2026_03_23.jpg) · Alexis Lours · CC BY 4.0 |
| Zwarte Mees · Juveniel, bronlabel | `/assets/species/plumage/sp174-juv.webp` | `51630c5bf687baaf9f7c899469f57c6232e29837` | [bron](https://www.inaturalist.org/photos/690152866) · euqirneto · CC BY 4.0 |
| Zwarte Mees · Vrije vlucht, rol apart te toetsen | `/assets/species/plumage/sp174-flight.webp` | `d61f9303c591640bfcd652c5c557f92babd14a8b` | [bron](https://www.inaturalist.org/photos/176460220) · euqirneto · CC BY 4.0 |
| Grauwe Vliegenvanger · Hoofdfoto | `/assets/species/sp176.webp` | `45995e02ba09e881c067e6c9d4229af7c7f4d2b2` | [bron](https://commons.wikimedia.org/wiki/File:Muscicapa_striata_%D0%BC%D1%83%D1%85%D0%BE%D0%BB%D0%BE%D0%B2%D0%BA%D0%B0_%D1%81%D1%96%D1%80%D0%B0.jpg) · Бусел В.А. · CC BY-SA 4.0 |
| Grauwe Vliegenvanger · Juveniel, bronlabel | `/assets/species/plumage/sp176-juv.webp` | `52b2d42b0cb76cd218b8655790ce4d3c45dd3ea4` | [bron](https://www.inaturalist.org/photos/561527545) · Andrejus Gaidamavičius · CC BY 4.0 |
| Grauwe Vliegenvanger · Vrije vlucht, rol apart te toetsen | `/assets/species/plumage/sp176-flight.webp` | `aa405401d501b28dbd83875b84d927c05aa76769` | [bron](https://commons.wikimedia.org/wiki/File:Muscicapa_striata_-_Spotted_Flycatcher_05.jpg) · Zeynel Cebeci · CC BY-SA 4.0 |
| Bonte Vliegenvanger · Hoofdfoto | `/assets/species/sp177.webp` | `6ec0f4340daab4b143178f5e64990a99f51a369b` | [bron](https://commons.wikimedia.org/wiki/File:Ficedula_hypoleuca_Sussex_1.jpg) · Ron Knight from Seaford, East Sussex, United Kingdom · CC BY 2.0 |
| Bonte Vliegenvanger · Vrouwtje, bronlabel | `/assets/species/plumage/sp177-adult_f.webp` | `16cf0a5890a7b3aee91472a9ecbcd7798ca9cf3a` | [bron](https://commons.wikimedia.org/wiki/File:Ficedula_hypoleuca-F-Iski_morost.jpg) · Jernej Polajnar · CC BY-SA 4.0 |
| Bonte Vliegenvanger · Juveniel, bronlabel | `/assets/species/plumage/sp177-juv.webp` | `293fab07a03544773af4eed1ad7fcefc346c0f19` | [bron](https://www.inaturalist.org/photos/695650368) · Andrei Orekhov · CC BY 4.0 |
| Bonte Vliegenvanger · Vrije vlucht, rol apart te toetsen | `/assets/species/plumage/sp177-flight.webp` | `ed5e130bc12fdb8e79649d4d1afa6c5df090797e` | [bron](https://www.inaturalist.org/photos/735032492) · carabus123 · CC BY 4.0 |

### sp174 — Zwarte Mees (Periparus ater)

- **Hoofdfoto:** scherp en bruikbaar rustbeeld van een kleine mees, zwarte kop, lichte wang en twee witte vleugelbanden. De witte nekvlek ligt in dit zijaanzicht deels achter de kop: daarom mag een gebruiker niet uitsluitend op de zichtbaar gemaakte nekvlek worden gestuurd.
- **Juveniel:** op een tak, gelige wang en minder contrastrijk kopje. Leeftijdscategorie uit een geregistreerde iNaturalist-waarneming, maar oorspronkelijke bronannotatie, feitelijke levensfase en gebruiksrechten niet onafhankelijk voor R42 opnieuw herlezen. De lokaal getoonde vogel blijft PARTIALLY TESTED.
- **Vlucht:** **materieel beeldkwaliteitsgat.** Een vogel is daadwerkelijk los vliegend met witte wang, maar beide vleugels zijn sterk bewogen/onscherp. De bronmetadata zegt `flightReview: voorwaardelijk ... niet definitief` terwijl een oude auditbevinding 'definitieve scherpe foto' vermeldt. De foto is onvoldoende voor betrouwbaar afzonderlijk herkennen aan vleugeldetails; niet automatisch goedkeuren en niet zonder eigen besluit vervangen. **Aanbevolen optie:** gericht zoeken naar een scherper, rechtengecontroleerd echt vrije-vluchtbeeld, zonder voortgang bij andere soorten stilzwijgend op VERIFIED te zetten.
- **Lijkt op:** de bestaande Zwarte Mees–Koolmees-vergelijking heeft drie korte onderscheidingspunten: lichte nekvlek, twee tegenover één vleugelband en bleke onderzijde zonder zwarte middenstreep; Staartmees heeft sterk verlengde staart. Een brongetrouw zelfstandig tekstverschil blijft noodzakelijk als fotohoek de nek niet laat zien. [Vogelbescherming Zwarte Mees](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-mees) · [Sovon](https://stats.sovon.nl/stats/soort/14610) · [Blasco-Zumeta leeftijd/kleed](https://www.blascozumeta.com/specie_files/1461_Periparus_ater_E.pdf) (nog niet primair gelezen).

### sp176 — Grauwe Vliegenvanger (Muscicapa striata)

- **Hoofdfoto:** scherp volwassen/sekse-neutraal zijaanzicht op een tak met fijne streepjes op keel/kruin en gedekte grijsbruine bovendelen. Mannetje/vrouwtje in de veldpraktijk op deze foto niet onderscheidbaar.
- **Juveniel:** jeugdige vlekken op bovenkant en gevouwen vleugel zichtbaar, maar takken/naalden verbergen delen van de vogel en de bronlevensfase moet onafhankelijk worden herbevestigd. Geen ander leeftijds- of geslachtslabel verzinnen.
- **Vlucht:** echte vrije vlucht in zijaanzicht met lange staart en geheven vleugel, voldoende herkenbaar. Bronmetadata herleidbaar naar Zeynel Cebeci, [Commons](https://commons.wikimedia.org/wiki/File:Muscicapa_striata_-_Spotted_Flycatcher_05.jpg), CC BY-SA 4.0. De primaire Commons-pagina bevestigt maker, `Muscicapa striata` en CC BY-SA 4.0; bronlicentie vereist maker, licentielink, wijzigingsvermelding en toepasselijke ShareAlike voor wijzigingen.
- **Lijkt op Bonte Vliegenvanger:** compacte herkenningstekst moet de fijne borst-/kruinstreping en minder contrastrijke gevouwen vleugel van Grauwe vergelijken met het lichte vleugelveld van Bonte; in het Nederlandse broedgebied is Bonte mannetje niet altijd zwart-wit en kan vrouwtje bruiner zijn. Alleen een zwart-wit mannetjesfoto als maatstaf is onvoldoende voor vrouwtjes. Huidige volwassen hero-paar blijft historisch registered/pending independent source and age pairing. [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grauwe-vliegenvanger) · [Sovon Grauwe Vliegenvanger](https://stats.sovon.nl/stats/soort/13350).

### sp177 — Bonte Vliegenvanger (Ficedula hypoleuca)

- **Mannetje/hoofdfoto:** zit op een tak, duidelijk donker hoofd/rug en wit vleugelveld/voorhoofd. Relatief grove foto maar voldoende herkenbare kleurverdeling voor deze brongebonden mannetjesrol; exacte sekse/kleed onafhankelijk te onderbouwen. De soort kent ook bruine/grauwe volwassen mannetjes.
- **Vrouwtje:** herkenbaar bruin bovendeel en licht vleugelveld op gevouwen vleugel, in rust op tak. [Commons vrouwelijke bron](https://commons.wikimedia.org/wiki/File:Ficedula_hypoleuca-F-Iski_morost.jpg) bevestigt maker Jernej Polajnar; lokale rechtenregistratie CC BY-SA 4.0. Individuele originele pixels/crop en concrete sekseherkomst blijven als aparte bewijsvraag.
- **Juveniel:** gevlekte kop en borst/bovendelen, witte vleugelvelden; geschikt voor zichtbare jeugdkenmerken mits de oorspronkelijke iNaturalist-levensfase correct geregistreerd blijkt. Bronidentiteit/licentie opnieuw voor R42 niet volledig geverifieerd.
- **Vlucht:** frontale vogel in vrije vlucht, geopende vleugels, maar sterke tegenlicht- en bewegingscontrastverschillen; geschikt als vluchtpositie, niet als primaire uitleg van de belangrijke witte vleugelvlek bij alle leeftijden of van sekse. Het veldkenmerk moet ook in de onafhankelijke rusttekst beschikbaar zijn.
- **Cruciale vergelijking:** Grauwe tegenover Bonte Vliegenvanger in beide richtingen: borst-/kruinstreping tegenover witte vleugelvelden; **de getoonde volwassen mannelijke Bonte hoeft niet representatief te zijn voor een bruine vrouwelijke of mannelijke Bonte**. Voor goed kleedgelijkwaardige vrouwelijke vergelijking is een afzonderlijk beeld-/brononderzoekspunt nodig. [Vogelbescherming Bonte Vliegenvanger](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bonte-vliegenvanger) · [Sovon](https://stats.sovon.nl/stats/soort/13490).

## Primaire bron- en rechtencontrole

- **Direct opnieuw gelezen:** Vogelbescherming [Zwarte Mees](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-mees), [Grauwe Vliegenvanger](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grauwe-vliegenvanger), [Bonte Vliegenvanger](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bonte-vliegenvanger); directe soortwaarneming 22-11-2026. Voor Nederlandse trend/status is de betreffende Sovon-soortpagina afzonderlijk gelezen; bij Grauwe Vliegenvanger vermeldt Sovon een langetermijnafname maar een recente 12-jaarstoename, te behandelen als verschillende perioden, niet verwarren. Geen nieuwe app-trendwaarde geïmporteerd.
- **Oorspronkelijke Commons metadata op specifieke pagina's primair opnieuw gelezen:** [Zwarte Mees hoofd](https://commons.wikimedia.org/wiki/File:Coal_Tit_2026_03_23.jpg) Alexis Lours CC BY 4.0; [Grauwe Vliegenvanger vlucht](https://commons.wikimedia.org/wiki/File:Muscicapa_striata_-_Spotted_Flycatcher_05.jpg) Zeynel Cebeci CC BY-SA 4.0; [Bonte Vliegenvanger vrouwtje](https://commons.wikimedia.org/wiki/File:Ficedula_hypoleuca-F-Iski_morost.jpg) Jernej Polajnar CC BY-SA 4.0. Overige Commons- en iNaturalist-fotopagina's en originele beeldbytes zijn **niet individueel volledig geverifieerd**, en er is dus geen compleet origineel→WebP/pixel-/rechtenbewijs op deze nieuwe ronde.
- **ANWB Vogelgids van Europa:** voor `sp174`, `sp176`, `sp177` zijn boekeditie, ISBN, specifieke soortpassage en paginanummer niet daadwerkelijk gelezen: **NOT TESTED**, niet vervangen door een verkooppagina of niet-rechtmatig gekopieerde tekst. Je kunt een rechtmatige editie/passage aanleveren of voorlopig aanvullend onafhankelijk onderzoek toestaan; er is geen automatische aankoop.
- **Vogelskijken.nl/Mijn Vogelvinder:** mogelijke ondersteunende bronnen met afzonderlijke bewijsrol, niet automatisch gelijk aan daadwerkelijk ingeziene soortclaim of zelfstandige mediarechten. Concrete relevante soortpassages voor deze ronde niet geverifieerd.
- **eBird NL en bias:** NOT TESTED; habitat en aanwezigheid mogen geen absolute kans- of seizoensgarantie worden. De wetenschappelijke soortnamen, de huidige Nederlandse soortstatussen en biometrische `ca.`-banden zijn niet zonder passend tweede-uitgeversbewijs overschreven.

## Geluidsregistratie en privacy

Voor alle drie soorten staan **nul lokale gids-MP3's** in `field-guide-media.json`, `guideMedia.js` en `AUDIO_140_AUDIT_REGISTER`. Zang-/roepsoort, individuele oorsprong, bronlicentie, WAV/PCM-vergelijking en offline audiospeler blijven BLOCKED of NOT TESTED. Geen geluidsbestanden verzonnen, gedownload of aan een extern recht gekoppeld. Onzekere privélocaties en foto-EXIF worden niet openbaar gemaakt; de ronde wijzigt geen gebruikersgegevens.

## Eigenaarspoort §2.3 — R42-materiële lacunes

Nieuwe open punten worden **vóór R43** aan de eigenaar zichtbaar gemaakt; R41 akkoord C biedt hiervoor geen voorafgaande vrijstelling.

| Gat | Bewijs en gevolg | Minimaal vervolg |
|---|---|---|
| sp174 vlucht: onscherpe vleugels en tegenstrijdige oude auditclaim | Geschiktheid als *definitieve* vluchtfoto onvoldoende; werkelijke vluchtstatus wel zichtbaar | Brongetrouw scherper vluchtbeeld zoeken of voorlopig alleen rol voorwaardelijk houden |
| sp176 Grauwe juveniel: gedeeltelijk bedekt en origineel/age niet onafhankelijk herlezen | Onderzijde en enkele leeftijdskenmerken zijn beperkt te controleren | Bron/rol gericht valideren of voorlopige expliciete onzekerheid behouden |
| sp177 Bonte Vliegenvanger: rustfoto vrouwtje plus zwart-wit mannetje, maar geen gelijkwaardig vrouwelijk dubbelgangerfotopaar | Snelle verwarring met Grauwe Vliegenvanger bij bruine vorm; bestaande tekst onderscheidt veldkenmerken, maar beeld blijft incompleet voor alle kleden | Extra rust- en kleedgelijkwaardig foto-onderzoek plus rechtencheck of met zichtbare waarschuwing voorlopig verder |
| alle 3: ontbrekende gidsaudio en ANWB-boekpassages | Zang/roep, leeftijdscontext en onafhankelijke kennis verificatie onvolledig | Alleen rechtmatige bronnen zoeken; geen aankoop zonder akkoord; voorlopig NOT TESTED |

**Voorstel:** eerst de inhoudelijke R42-beoordeling en CI als `PARTIALLY TESTED` afronden. Daarna mag uitsluitend de eigenaar voor deze nieuwe gaten kiezen uit (a) nader zoeken, (b) eerst de foto/tekst gericht verbeteren, (c) voorlopig verder met open punten. Iedere keuze blijft onderscheiden van juridische of ornithologische FULL PASS. Het volgende F3-batchstartpunt sp178 / sp187 / sp188 blijft zonder dat besluit **HOLD**.

## Technische en releasegrenzen

R42-soorten worden als `IN CONTENT REVIEW / OPEN POINTS` geregistreerd; er volgt geen “CONTENT COMPLETE”. Er geldt R42-code-/Chromium-testbewijs op één onveranderde SHA (mobiel 320/360/390, echte gidsafbeeldingen, complete fotoparen, zoom en terug, geen vals geluid, verse offline cache). **Fysieke Samsung PWA, camera/microfoon/GPS, eigenaarreview op exacte preview en ZIP-herstel op tweede toestel zijn NOT TESTED.** Index v3.13 FINAL wijst naar Veldhandboek v0.8, huidige bijlage is v0.9; daadwerkelijk actieve ChatGPT-/Claude-projectvelden UNKNOWN, dus SYNC-CHECK NOT SYNCHRONIZED. De v1.10 FINAL-documentnorm is nog niet gemergd uit docs-PR #343; dit dossier past haar inhouds- en beslisregels toe zonder automatische bronactivatie. Geen merge of livegang.

**EINDMARKERING — F3-R42 · 126/140 · 14 TE STARTEN · 0 FULL PASS · RELEASE HOLD**
