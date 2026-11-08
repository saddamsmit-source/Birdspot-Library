# Birdspot · Audit Status, Gebied en Seizoen

6 november 2026 · eerste inhoudelijke ronde. Getoetste appversie 1.15.2-filter-menus, commit `cadb99e5e15c51cbfb912d8040d84b6c0b5ab810`, PR #35. Scope Nederland. De gebruikersinterface noemt ook Benelux, terwijl de bronlijst Nederland als scope heeft.

## Resultaten

| Controle | Uitkomst | Bewijslaag |
|---|---|---|
| Soorten aan de bron koppelen | 597 van 597 uniek en op wetenschappelijke naam gekoppeld. Hoofdstatus, tweede status en maandstring komen overeen. De andere 26 regels uit de lijst van 623 zijn onbevestigde soorten en blijven buiten de app. | VERIFIED · code en brondata |
| Filteruitvoer volgens de huidige regels | 859.680 soortbeslissingen gecontroleerd. Alle uitkomsten kwamen overeen met de onafhankelijk uitgeschreven regels voor 10 statuskeuzes, 8 gebiedskeuzes, 9 periodes, en de jaarrondoptie aan of uit. | VERIFIED · lokale helpercontrole |
| Biologische juistheid | 25 soortpagina’s geraadpleegd voor status of habitat en 44 soorten doorgerekend op waarnemingsmaanden. Enkele duidelijke gaten in filterdekking en brondata. | PARTIALLY TESTED · eerste bronronde |
| Nauwkeurigheid van 90% over alle filters | Nog niet vastgesteld. Het testresultaat van de filtercode en de maanddekking in een geselecteerde proefgroep meten iets anders. | NOT TESTED · representatieve bronsteekproef ontbreekt |

De 9 periodes bestaan uit geen seizoen, 4 losse seizoenen en 4 overgangen van twee aangrenzende seizoenen. Voor overgangen is een soort zichtbaar bij aanwezigheid in minstens één van de twee overgangsmaanden. Maandreeksen rond de jaarwisseling en losse maanden zijn geldig. De optie Zonder jaarrondvogels gebruikt bij actieve periode aanwezigheid in minimaal tien maanden als grens. De automatische suites voor de getoetste appversie staan 12/12 groen. Deze suites toetsen functionaliteit en interne consistentie.

## Gevonden afwijkingen

| Onderdeel | Bevinding | Consequentie en vervolg |
|---|---|---|
| Status | 112 ingevulde tweede statussen tellen niet mee. Dit zijn 56 keer Wintergast, 34 keer Doortrekker, 11 keer Standvogel, 10 keer Zomergast en één keer Dwaalgast. | Merel en Roodborst staan als extra Wintergast in de data maar verschijnen daar niet. Keep ontbreekt bij Trekvogels ondanks extra Doortrekker. Als beide statussen mee moeten tellen, dezelfde regel gebruiken voor resultaten en teller. Bij combinatie met Seizoen onderscheid maken tussen totale aanwezigheid en de periode van de afzonderlijke rol. |
| Statuslabel | Trekvogels gebruikt de broncategorie Doortrekker. | Zomergasten kunnen eveneens trekvogels zijn. Doortrekkers is de preciezere aanduiding voor die specifieke rol. |
| Heide | 31 van de 69 resultaten komen uitsluitend via de tag Struweel. | Struikrijk bos, park of oeverruigte kan onterecht als Heide verschijnen. Bij een correctie eerst expliciete, onderbouwde heidetags toevoegen waar die horen, onder meer bij natte heide voor Rietgors. |
| Duinen | 134 van 160 resultaten hebben geen expliciete duintag. Ze komen via Kust of Struweel mee. | Kust en duinen zijn deels overlappende habitats. Open zee, kwelders en bosstruweel onderbouwen geen duinvoorkomen. Rietzanger komt volgens Vogelbescherming wél voor in natte duinvalleien en verdient een expliciete tag. |
| Water & moeras | 41 van 179 resultaten komen alleen via Polder. | Water en moeras in een polder zijn relevante habitats voor sommige vogels. Een open landbouwpolder alleen zegt weinig over watergebonden voorkomen. |
| Gebied ontbreekt | Alle 243 dwaalgasten en beide historische soorten hebben geen habitattags. | Een gebiedskeuze sluit ze allemaal uit. Dat is een dekkingsgrens. Voeg voor deze groepen alleen Nederlandse habitat toe waar de bronnen structureel genoeg bewijs bieden. |
| Periode ontbreekt | 264 records hebben geen regulier maandvenster. Daaronder 226 dwaalgasten, 33 ontsnapte soorten, twee historische, twee schaarse gasten en één exoot. | Een seizoenskeuze sluit die records uit. Bij een onregelmatige gast is dit een verdedigbare standaard. Flamingo, Kuifleeuwerik en Huiskraai apart beoordelen. |
| Extra tag | Rotsen komt één keer voor bij Zwarte roodstaart en valt buiten de gebiedsgroepen. | Vogelbescherming noemt voor Nederland bebouwing en moderne boerderijen. Agrarisch mist als Nederlands filterlabel. De natuurlijke bergbiotoop is context buiten Nederland. |

## Broncontrole per soort

Vogelbescherming levert de ecologische context. De maanden zijn apart vergeleken met de openbare Nederlandse waarnemingsaggregaten van Observation.org, waar beschikbaar. De tabel markeert uitkomsten per gecontroleerd gegeven. Een passende hoofdindeling onderbouwt de overige velden niet automatisch.

| Soort | Bronbevinding voor de filters |
|---|---|
| [Rietgors][rietgors] | Nat habitat klopt. De bron noemt ook boerenland met rietsloten, kwelders en natte heide. Expliciete tags verdienen controle. |
| [Rietzanger][rietzanger] | Riet en moeras passen. Natte duinvalleien zijn expliciet onderbouwd. Algemene heide volgt nu indirect uit Struweel. |
| [Staartmees][staartmees] | Jaarrond, bos en park/tuin passen. Struweel alleen is geen bewijs voor heide of duinen. |
| [Roodborst][roodborst] | Bos en bebouwd groen passen. Wintergast en doortrek zijn gedocumenteerd. De tweede status telt nu niet mee in het filter. |
| [Merel][merel] | Jaarrond, bebouwd groen en bos passen. Wintergast en doortrek zijn gedocumenteerd. De tweede status telt nu niet mee in het filter. |
| [Keep][keep] | Wintergast én doortrekker. Akkers bij bosranden, beukenbos en park zijn onderbouwd. Oktober–april dekt 97,6% van de meldingen. Zeer schaarse aanwezigheid daarbuiten is mogelijk. |
| [Wintertaling][wintertaling] | Vogelbescherming noemt jaarrond en een Nederlandse broedpopulatie. De huidige periode augustus–april laat de soort bij Zomer geheel weg. Mei–juli heeft meldingen in alle vijf jaren. Winterpiek en zomerpresentie apart houden. |
| [Tjiftjaf][tjiftjaf] | Bos, struweel en bebouwd groen passen. Maart–oktober sluit winter uit, terwijl [Sovon][sovon-tjiftjaf] overwintering bij zacht weer beschrijft. Ook meldingen in wintermaanden in alle vijf jaren. |
| [Zwartkop][zwartkop] | Bos, struweel en stedelijk groen passen. Bron noemt ook wintergast, terwijl maart–oktober winter uitsluit. Proefdata geven 1,8% buiten het huidige venster. |
| [Zwarte roodstaart][zwarte-roodstaart] | Stedelijk klopt. Moderne boerderijen ondersteunen aanvullend Agrarisch. Bijna 5% van de meldingen valt in de uitgesloten wintermaanden. Winterstatus apart wegen. |
| [Ooievaar][ooievaar] | Vochtige weilanden en uiterwaarden passen. Gedeeltelijke wegtrek maakt Zomergast en aanwezigheid in alle seizoenen verenigbaar. |
| [Gierzwaluw][gierzwaluw] | Stedelijk past. April–augustus omvat 99,1% van de meldingen. September komt als uitloop voor. |
| [Boerenzwaluw][boerenzwaluw] | Erven met schuren en foerageren bij water passen. April–oktober omvat 97,8%, met vooral extra meldingen in maart. |
| [Grutto][grutto] | Veenweide en nat grasland passen. Terugkomst vanaf februari is beschreven. Februari–augustus omvat 96,3%. |
| [Huismus][huismus] | Jaarrond en vooral bebouwing met tuinen en erven onderbouwd. |
| [Blauwe reiger][blauwe-reiger] | Ondiep water en grasland kloppen. Ook bebouwd gebied komt expliciet voor. Stedelijk mist als tag. |
| [Fitis][fitis] | Heide, bos en struweel passen. Moeras en boerenland worden ook genoemd. April–september omvat 94,3%, met maartmeldingen in elk van de vijf jaren. |
| [Witte kwikstaart][witte-kwikstaart] | Open cultuurlandschap, oevers en bebouwing passen. Februari–november omvat 97,1%. De overige meldingen bewijzen geen standvogelpopulatie op zichzelf. |
| [IJsvogel][ijsvogel] | Jaarrond en visrijke wateren onderbouwd. Park en tuin in de bron verwijzen naar geschikt water in die omgeving. |
| [Ruigpootbuizerd][ruigpootbuizerd] | Wintergast en oktober–april onderbouwd. Open duin en akkers passen. Grote heidevelden worden ook genoemd maar Heide mist. |
| [Kuifduiker][kuifduiker] | Oktober–april en vooral beschutte kustwateren passen. Binnenlandse meren zijn secundair. 95,8% valt in de ingestelde maanden. |
| [IJsgors][ijsgors] | Kustgebieden en stoppelakkers passen. Wintergast én doortrekker. Broedhabitat toendra is geen Nederlandse heidetag. |
| [Sneeuwgors][sneeuwgors] | Open kust is onderbouwd. Vogelbescherming noemt wintergast én doortrekker; de tweede status is leeg. Oktober–maart omvat 96,9%. |
| [Kleine mantelmeeuw][kleine-mantelmeeuw] | Kust, duinen en ook stedelijke broedlocaties onderbouwd. Wegtrekkende broedvogels en wintergasten kunnen samen jaarrond aanwezigheid opleveren. |
| [Pallas’ boszanger][pallas-boszanger] | Vogelbescherming legt de nadruk op najaar en kust. Oktober–november omvat 42,2% van de meldingen. Buiten het venster komen in elk van vijf jaren meldingen voor. Aanvullende toets op overwinteraars, herhaalde meldingen en gevalsniveau nodig. |

## Waarnemingsvergelijking

Directe toegang tot Waarneming.nl gaf een toegangsblokkade. De vergelijking gebruikt de eigen [Observation.org-publicatie bij GBIF][gbif], DOI 10.15468/5nilie. [NL BIF][nlbif] beschrijft de verbinding met Waarneming.nl en uitbreiding van de publicatie. Datasetmetadata gaven 3 november 2026 als publicatiedatum en CC BY-NC 4.0 als licentie. Gebruik hier is analyse voor de audit. Bij eventueel hergebruik van brondata in de app moet de licentie afzonderlijk worden beoordeeld.

Per soort de wetenschappelijke naam vergeleken met de soortnaam in het antwoord. De aanvraag gebruikt de publieke GBIF Occurrence API met `datasetKey=8a863029-f435-446a-821e-275f4f641165`, `country=NL`, `year=2021,2025`, `occurrenceStatus=PRESENT`, `scientificName`, `facet=month`, `facetLimit=12` en `limit=1`. In alle 44 queries sloot de som van de twaalf maandtotalen aan op het resultaat. Eerste proefopvraag gebruikte de standaardlimiet van tien facetwaarden. Daarom is de uiteindelijke proefset opnieuw opgehaald met twaalf maandwaarden.

Gecontroleerde app-ID’s in de maandproefgroep. sp002, sp029, sp030, sp034, sp035, sp037, sp039, sp043, sp044, sp045, sp046, sp050, sp051, sp053, sp056, sp057, sp059, sp063, sp065, sp068, sp075, sp081, sp089, sp091, sp095, sp101, sp104, sp110, sp114, sp117, sp118, sp141, sp143, sp170, sp181, sp194, sp218, sp225, sp253, sp277, sp287, sp301, sp302 en sp316.

De proefgroep is gericht geselecteerd op bekende soorten en verdachte vensters. Van 18 soorten met een beperkt maandvenster behalen 17 minstens 90% dekking van de gemelde records. De overige 26 soorten hebben al alle twaalf maanden en leveren met deze maat geen bewijs tegen een te ruime periode. Waarnemingen zijn losse meldingen met wisselende inspanning, mogelijke herhaling van dezelfde vogel en een mix van validatiestatussen. De percentages meten meldingen binnen een gekozen venster. Ze meten geen trefkans, unieke individuen, permanente aanwezigheid, habitatvoorkeur of totale juistheid van de filters.

## Voorgestelde meetlat voor de volgende ronde

- Stel per groep vooraf een steekproef samen van reguliere soorten, schaarse en onregelmatige gasten en exoten. Beoordeel per soort zowel relevante als onjuiste matches in Status, Gebied en Seizoen. Leg bron, datum en beslisreden vast.
- Meet per filtergroep het aandeel terechte getoonde koppelingen én het aandeel van de onderbouwde koppelingen dat vindbaar is. Behandel onbekend apart. Zo kan een ruim jaarrond- of gebiedslabel de score niet kunstmatig verhogen.
- Geef maandvensters betekenis als normaal verwacht voorkomen en beschrijf pieken, kleinere reguliere groepen en incidentele gevallen afzonderlijk. Gebruik een opvallend aggregaat als signaal voor broncontrole.
- Hergebruik voor CAP-BIRD-010 en CAP-BIRD-011. Leg naast de afgeleide dataset vast welke habitats en periodes zijn onderbouwd. Houd codeconsistentie, onafhankelijke broncontrole en waarnemingsdekking apart. Koppeling met L-040 en L-077.

[gbif]: https://www.gbif.org/dataset/8a863029-f435-446a-821e-275f4f641165
[nlbif]: https://www.nlbif.nl/waarneming-nl-verduurzamen-en-ontsluiten-naar-gbif/
[sovon-tjiftjaf]: https://stats.sovon.nl/stats/soort/13110
[rietgors]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietgors
[rietzanger]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietzanger
[staartmees]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/staartmees
[roodborst]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/roodborst
[merel]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/merel
[keep]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/keep
[wintertaling]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wintertaling
[tjiftjaf]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/tjiftjaf
[zwartkop]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwartkop
[zwarte-roodstaart]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-roodstaart
[ooievaar]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ooievaar
[gierzwaluw]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/gierzwaluw
[boerenzwaluw]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/boerenzwaluw
[grutto]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grutto
[huismus]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/huismus
[blauwe-reiger]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/blauwe-reiger
[fitis]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/fitis
[witte-kwikstaart]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/witte-kwikstaart
[ijsvogel]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ijsvogel
[ruigpootbuizerd]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ruigpootbuizerd
[kuifduiker]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kuifduiker
[ijsgors]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ijsgors
[sneeuwgors]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/sneeuwgors
[kleine-mantelmeeuw]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-mantelmeeuw
[pallas-boszanger]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/pallas-boszanger
