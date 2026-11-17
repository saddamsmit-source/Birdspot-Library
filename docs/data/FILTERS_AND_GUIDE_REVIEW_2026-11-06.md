# Birdspot · Filtercorrecties en gidsronde 1

6 november 2026 · voortzetting van [de filteraudit](FILTERAUDIT_2026-11-06.md). Baseline db09fba. Reviewversie 1.15.3-guide-review.

## Filtercorrecties

- Status leest zowel de hoofdstatus als de geregistreerde tweede rol. De teller gebruikt dezelfde selectie. Een resultaat dat via zijn tweede rol wordt getoond, krijgt het label Ook gevolgd door die rol. De categorie Doortrekkers sluit aan op de naam in de bronlijst. Nederland is de geografische scope.
- Heide en Duinen vragen een eigen tag. Struweel heeft een aparte keuze. Water & moeras omvat open water en oevers, moerassen, rietland en rivieren. Polder alleen telt daar niet mee. De habitatfilters tonen getagde leefgebieden en zijn daarmee afhankelijk van de dekking van die tags.
- Aanwezigheidsmaanden gelden voor de soort als geheel. Status vertelt welke rol de soort in Nederland heeft. Een soort die ook wintergast is, kan hier in een andere periode als broedvogel aanwezig zijn. Het filter geeft geen individuele trefkans en de maandbalk toont geen piekmaanden.
- De vier maandcorrecties zijn Wintertaling en Tjiftjaf naar jaarrond met duidelijke nuance over het seizoen, Fitis naar maart–september en Boerenzwaluw naar maart–oktober. De winter van de Pallas’ boszanger staat open voor controle op gevalsniveau. Losse meldingen zijn onvoldoende voor automatische verruiming.

| Soort(en) | Bron en wijziging |
|---|---|
| [Wintertaling][wintertaling] | Jaarrond en schaarse broedvogel. Ondiep water en begroeide rivieren. [Sovon][wintertaling-sovon] geeft de seizoenspiek en broedduur. |
| [Tjiftjaf][tjiftjaf] | Zomergast met terugkerende overwintering in zachte winters volgens [Sovon][tjiftjaf-sovon]. De Noord-Europese hoofdtrek blijft een ander patroon dan de Nederlandse wintergroep. |
| [Fitis][fitis], [Boerenzwaluw][boerenzwaluw] | Eerste reguliere aankomst in maart. Zie [Sovon Fitis][fitis-sovon] en [Vogelbescherming vogeltrektijd][vogeltrektijd]. Tweede rol Doortrekker. Fitis krijgt ook moeras en agrarisch. |
| [Rietzanger][rietzanger], [Rietgors][rietgors] | Natte duinvalleien bij Rietzanger en natte heide, rietsloten en kwelders bij Rietgors. Rietzanger krijgt de tweede rol Doortrekker. |
| [Zwarte roodstaart][roodstaart], [Blauwe reiger][reiger] | Agrarisch bij moderne boerderijen voor Zwarte roodstaart. Stedelijk en tweede rol Wintergast voor Blauwe reiger. Bergrotsen vallen buiten het Nederlandse leefgebied van Zwarte roodstaart. |
| [Kleine mantelmeeuw][mantel], [Stormmeeuw][storm], [Kokmeeuw][kok] | Bron benoemt duinbroedplaatsen. Kleine mantelmeeuw ook bij waterrijke graslanden en op gebouwen. Stormmeeuw langs rivieren. Kokmeeuw ook bij zoet water en moerassen. |
| [Grutto][grutto], [Brandgans][brand], [Bergeend][berg], [Kluut][kluut] | Natte graslanden en ondiepe verzamelplaatsen bij Grutto, moeras en rivier bij Brandgans, duin en rivieroevers bij Bergeend en ondiep water en agrarisch terrein bij Kluut. |
| [Ruigpootbuizerd][ruig], [IJsgors][ijs], [Sneeuwgors][sneeuw] | Open heide bij Ruigpootbuizerd. De zeereep onderbouwt duinvoorkomen voor beide gorzen. Sneeuwgors krijgt de tweede rol Doortrekker. |

Er zijn zestien soorten met aangepaste gebiedstags. Bij de overige soorten blijft het oude bronmateriaal zichtbaar, maar de te ruime afleidingen zijn vervallen. Daardoor kan een soort met een nog ontbrekende directe tag in een gebiedsselectie ontbreken. Het juiste vervolg is de overgebleven kandidaten per soort bronmatig nalopen, met prioriteit voor regelmatige soorten. De registratie bevat 118 tweede statussen. Die zijn niet allemaal extern nagekeken in deze ronde.

## Gidskaarten

Koolmees, Merel, Roodborst, Tjiftjaf, Fitis, Wintertaling, Rietzanger en Rietgors kregen een beknopte revisie van veldkenmerken, het onderbouwde verenkleed, geluid, leefgebied, voedsel, gedrag, broeden en trek. Het bronregister staat per soort in de gidsdata en is zichtbaar bij Herkenning en Leefwijze. Bij de acht nagekeken kaarten verschijnen alleen nagekeken maten. Leeftijds- of geslachtskenmerken zonder bewijs worden niet ingevuld. Het ontbreken van een afzonderlijk vrouwtjesveld leidt nergens meer tot een gelijkheidslabel. Voor soorten buiten deze ronde staat op de gidskaart dat broncontrole nog volgt.

[Vogelbescherming Koolmees][koolmees] geeft bijvoorbeeld een bredere buikstreep bij de man en doorgaans 8–13 eieren. De noordelijke overwinteraars onderbouwen ook Wintergast als tweede rol. [Vogelbescherming Roodborst][roodborst] onderbouwt vergelijkbaar uiterlijk bij man en vrouw. Bij Wintertaling gaat 25–30 dagen bij de jongen over vliegvlug worden. Als nestvlieders verblijven ze niet zo lang in het nest.

## Controle en hergebruik

- 597 soort-ID’s en wetenschappelijke koppelingen identiek aan de baseline. 967.140 combinatietoetsen voor status, gebied, losse en aangrenzende seizoenen en de jaarrondoptie. Geen afwijkingen ten opzichte van de nieuwe regels.
- Mobiele browserweergave 390 px. Merel via de tweede rol gevonden met de juiste badge en teller. Wintertaling vindbaar bij Wintergasten, Water & moeras en Zomer. Leefwijze toont jaarrond, vliegvlug worden en de bronlinks. Fysiek toestel apart beoordelen.
- Functiekaart CAP-BIRD-010, CAP-BIRD-011 en CAP-BIRD-012. Bestaande learnings L-040, L-075 en L-077. Eén regel voor resultaten en teller, expliciete bronvelden en tests die een concrete verkeerde match kunnen detecteren. Een technische controle kan kloppen bij een biologisch onjuiste dataset. Houd inhoudelijke dekking apart.
- De doelwaarde van 90% over alle soorten en filters is nog niet vastgesteld. Waarnemingsgegevens 2021–2025 uit de audit dienen als signaal, naast de ecologische bron per soort.

[wintertaling]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wintertaling
[wintertaling-sovon]: https://stats.sovon.nl/stats/soort/1840/?language=dutch
[tjiftjaf]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/tjiftjaf
[tjiftjaf-sovon]: https://stats.sovon.nl/stats/soort/13110
[fitis]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/fitis
[fitis-sovon]: https://stats.sovon.nl/stats/soort/13120
[boerenzwaluw]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/boerenzwaluw
[vogeltrektijd]: https://www.vogelbescherming.nl/actueel/bericht/voorjaar-vogeltrektijd
[rietzanger]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietzanger
[rietgors]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietgors
[roodstaart]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-roodstaart
[reiger]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/blauwe-reiger
[mantel]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-mantelmeeuw
[storm]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/stormmeeuw
[kok]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kokmeeuw
[grutto]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/grutto
[brand]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/brandgans
[berg]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bergeend
[kluut]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kluut
[ruig]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ruigpootbuizerd
[ijs]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ijsgors
[sneeuw]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/sneeuwgors
[koolmees]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/koolmees
[roodborst]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/roodborst
