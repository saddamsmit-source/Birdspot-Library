# Tuin-/zangvogelfoto’s batch 01 en heldere sfeerlaag

05-11-2026 — PREVIEW, geen livegang. Basis: 89a3884 (PR #35), main 5bf67043. Claude blijft writer voor kaart/PR #34. Alle kaartbestanden ongewijzigd.

## Wijziging en aanleiding
De vorige videodimming was door de eigenaar afgewezen: te donker. Er waren twee stapelende bewerkingen: saturatie/helderheid/contrast op het video-element en een zwarte verlooplaag (38–83% opacity). Videofilter nu `none`, verlooplaag 10–32%. Widgetachtergronden behouden contrast. Geen nieuw Artlist-bestand of kosten. Learning-evidence L-062: afspelen bewijst nog geen gewenste creatieve kwaliteit.

Zes lokale WebP-bestanden toegevoegd voor koolmees, pimpelmees, vink, huismus, merel en roodborst; vier bestaande showcasebeelden hergebruikt voor wielewaal, grauwe klauwier, roodmus en roze spreeuw. Niet alle 50 beelden automatisch als geverifieerd verklaard. Alle tien aan stabiele soort-ID's gekoppeld; bron, fotograaf, licentie, bewerking, visuele herkenningskenmerken en datum in assets/species/credits.json. tools/species/build.py genereert de runtimekaart. Afbeeldingen laden uitsluitend van dezelfde app, niet van Commons. Credit-/licentielinks zijn bronvermelding, geen beeldafhankelijkheid.

## Functiekaartdelta
- CAP-BIRD-007: videofilter verwijderd en overlay verminderd; pauze/hervatten blijft.
- Bestaande gidslijst/soortdetail: lokale gidsfoto in lijst en detail, volledige foto via contain, geen titeloverlap. Eigen waarnemingsfoto’s blijven in eigen galerij; gidsbeelden niet als persoonlijke waarneming of media geteld.
- CAP-BIRD-040: nieuwe metadata-module in app-precache, zes nieuwe bestanden vooraf in bestaande mediacache na succesvolle online installatie. Geen garantie bij afgebroken eerste download of gewiste browseropslag.
- CAP-BIRD-045: aanvraagroute en conceptbericht in docs/research/waarneming-access-request.md; geen integratie gebouwd.

## Fotocontrole / learning L-019 en L-016
Bronmetadata opgehaald via Wikimedia Commons imageinfo en vergeleken met wetenschappelijke appnaam; beeld visueel beoordeeld op herkenningskenmerken, volledige vogel en natuurlijke context. Onder zoekresultaten voor huismus zat Passer montanus (ringmus); afgewezen op metadata én zwarte wangvlek. Nestkast-/nestfoto, juveniele roodborst zonder typische borst, en afgesneden portret niet als hoofdbeeld gekozen. De gekozen vrouwelijke huismus zit op een zonnebloem. De gekozen beelden tonen niet alle geslachten/leeftijden; toekomstige batch kan aanvullende herkenningsbeelden bevatten. Geen onafhankelijke ornitholoogreview geclaimd.

## QA
- VERIFIED: 10 IDs en Nederlandse/wetenschappelijke namen exact gecontroleerd tegen soortendata; 10 lokale WebP’s decodeerbaar, afmetingen en licenties aanwezig.
- VERIFIED: alle tien soortdetails geopend via zoeken in browser; elke foto geladen van lokale app-path en computed object-fit contain.
- VERIFIED: video in browser geladen, readyState 4, filter none, pauzeren/hervatten werkt; nieuwe sfeerlaag visueel bekeken.
- PARTIALLY TESTED: fysieke mobiele beoordeling nog door eigenaar; offline/herstel en algemene regressies via CI afzonderlijk rapporteren.
- Onafhankelijkheidsgrens: implementatie en review door dezelfde assistent. Geen document-FINAL of productie-PASS.

## Hergebruik en vervolg
Gebruik metadata + visuele verificatie + stabiele soort-ID, nooit zoekresultaatpositie als bewijs. Behoud volledige uitsnede in thumbnails en hero. Volgende groep pas na previewfeedback. Feedback/eigenaarbeheer blijven voorbereiding, openbare release en push zijn uitgesteld. Eerdere roadmapkeuze 76→62% is vervangen door deze eigenaarcorrectie.

## Mobiele QA-correctie
De nieuwe browsertest vond bij een staande foto (huismus) dat CSS-grid de afbeelding hoger maakte dan het vaste fotovak: 500 px beeld in 405 px vak. Hierdoor kon de onderkant alsnog worden afgesneden ondanks contain. Gereproduceerd in een 390 px browserframe. Opgelost door het gidsfotovak als block met begrensde beeldhoogte te renderen. De oorspronkelijke niet-overlappen-eis blijft behouden; test leest geometrie nu in één DOM-snapshot. Aanvullend bewijs bij L-016/L-019.

## Batch 02 — zes aanvullende tuin-/zangvogels
sp036 Groenling, sp046 Zanglijster, sp054 Heggenmus, sp055 Winterkoning, sp065 Boomklever en sp112 Spreeuw. Bronbeelden opnieuw via Commons API gecontroleerd op naam, auteur en passende licentie, lokaal opgeslagen als WebP; geen crop of externe image-src. Herkenningskenmerken vergeleken met zes Vogelbescherming-soortpagina's; URL en observatie per beeld in credits.json. Ongeveer 725 KiB extra beeldbestanden. Eén hoofdbeeld toont niet alle geslachten, leeftijden of seizoenskleden.

L-019/L-016 uitbreiding: controleer zowel metadata als het zichtbare beeld. Voor boomklever viel de tuinornamentfoto af als minder natuurlijke context; gekozen rots met korstmos. Geen nestbeeld of vogel half achter gras gekozen. Winterkoning toont bronverschil in geslachtsnaam: Vogelbescherming Nannus, Commons/app Troglodytes; identiteit vastgelegd bij stabiele sp055, geen ongecontroleerde datamigratie. Betrouwbare inhoudsbron verleent geen fotorechten (colofon Vogelbescherming). Deze beelden zijn Commons-beelden, geen Vogelbescherming-beelden.

Capabiltydelta: bestaande gidsfoto-capability en CAP-BIRD-015/040 uitgebreid, geen nieuw bedieningspatroon. Browser-/offline-test leest alle registerrecords dynamisch; geen vast aantal van tien als dekkingsbewijs.

## Batch 03 — 2026-11-06
Vier aanvullende lokale gidsbeelden: sp034 Staartmees, sp037 Putter, sp044 Ringmus en sp051 Zwarte Roodstaart. Commons identiteit/licentie opgehaald en de zichtbare kenmerken vergeleken met de vier Vogelbescherming-soortpagina’s. Volledige uitsnede, 1600 px maximum, WebP. Register totaal twintig gidssoorten; geen vaste testdekking op aantal. Zwarte roodstaart toont expliciet vrouwtje op rots; ringmus met zwarte wangvlek in groene buitenomgeving op een rand, niet met voedsel uit een mensenhand. Bron/licentie en verificatie-URL per asset in credits.json. L-019/L-016: geslacht, ondersoort en broncontext controleren, niet alleen Nederlandse zoekterm.

## Batch 04 — 2026-11-06

Elf lokale gidsfoto’s toegevoegd. Houtduif (sp002), Turkse Tortel (sp004), Grote Bonte Specht (sp016), Ekster (sp021), Zwarte Kraai (sp022), Kauw (sp025), Gaai (sp026), Tjiftjaf (sp056), Fitis (sp057), Zwartkop (sp059) en Witte Kwikstaart (sp068). In totaal heeft de gids 31 soorten met een hoofdbeeld. De elf nieuwe WebP’s gebruiken samen ongeveer 1,61 MiB.

Commons-licentie, auteur en soortmetadata gecontroleerd. Zichtbare herkenningskenmerken zijn per foto vergeleken met de gelinkte Vogelbescherming-pagina. Hoofdfoto’s hebben de volledige uitsnede van het bronbestand. Grote bonte specht toont een vrouwtje en Zwartkop een mannetje. Bij Fitis viel een ringfoto in de hand af. Bij Witte kwikstaart is een Europese vogel op Spiekeroog gekozen. Foto’s voor Tjiftjaf en Fitis tonen kenmerken die bij vergelijking helpen, maar een veldidentificatie kan ook zang of roep vereisen. Fotobewijs en credits staan per soort in assets/species/credits.json.

## Ontbrekende onderdelen bij de ronde

- Fotodekking is 31 van 597. Inhoudelijk nagekeken gidskaarten blijven acht. Wintertaling, Rietzanger en Rietgors zijn de resterende inhoudelijk nagekeken kaarten zonder foto en vormen een logische volgende groep.
- Eén hoofdbeeld per soort geeft beperkte dekking voor man, vrouw, jonge vogels en seizoenskleden. Prioriteit hebben moeilijk te onderscheiden soorten en groepen waarbij het uiterlijk sterk wisselt.
- Voor de 245 soorten zonder gebiedstag en de 264 zonder vaste maandreeks is vervolgcontrole per soort nodig. Onregelmatige gasten kunnen terecht buiten een filter vallen. De gewenste inhoudelijke nauwkeurigheid is nog niet breed gemeten.
- Alle gidsbeelden worden nu bij installatie geladen. Bij uitbreiding tot honderden beelden zijn kleine lijstfoto’s en downloadbare offline groepen het onderzoeken waard. Foto’s lokaal houden blijft de afspraak.
- Technische audit vond vier appmodules die niet expliciet werden opgehaald bij installatie. Ze staan nu in de app-cache. Ook kan een app-afbeelding uit die cache worden gelezen als de mediacache het bestand nog niet heeft. De fototest controleert nu offline herstart, zoeken en openen van een gidsfoto. Dit staat los van externe kaarttegels en een onvoltooide installatie.

CAP-BIRD-012/015/040. L-016/L-019: register, licentie en soortmatch per foto toetsen. L-022/L-052: check offline na een herstart, inclusief de benodigde appcode, en onderscheid app-cache van beeldcache. Onafhankelijke determinatie en fysiek toestel staan apart.

## Maandbalk en legenda — 2026-11-06

De rand rond november volgde de toestelmaand. Die automatische markering is verwijderd. De hoofdcategorie bepaalt de kleur van de bekende aanwezigheidsmaanden. Zomergast is oker, wintergast blauw, standvogel groen, doortrekker petrol en schaarse gast of dwaalgast paars. Andere statussen krijgen een eigen grijs label. Zonder maandvenster blijven de cellen neutraal. Een roze streep markeert gedocumenteerde broedmaanden zonder de kleur van de soortstatus te vervangen. De legenda en schermlezertekst beschrijven de codering. De balk stelt aanwezigheid en broedperiode voor, geen trefkans.

De nieuwe optionele broedmaanden staan in tools/species/species_life.json. Negen soorten hebben een brononderbouwde periode. De maanden zijn op maandniveau afgerond en een soort kan slechts een deel van de maand broeden.

| Soort | Markering | Bron |
|---|---|---|
| Koolmees | April–juni | [Sovon, eileg][koolmees-sovon] |
| Merel | Maart–juli | [Vogelbescherming][merel-vbn] |
| Roodborst | April–juli | [Vogelbescherming][roodborst-vbn] |
| Tjiftjaf | April–juni | [Vogelbescherming][tjiftjaf-vbn] |
| Fitis | April–juni | [Vogelbescherming, start eind april][fitis-vbn] en [Sovon, eileg mei–juni][fitis-sovon] |
| Wintertaling | April–juli | [Vogelbescherming][wintertaling-vbn] |
| Rietzanger | April–juni | [Vogelbescherming][rietzanger-vbn] |
| Boerenzwaluw | Mei–augustus | [Vogelbescherming][boerenzwaluw-vbn] |
| Rietgors | April–juli | [Vogelbescherming][rietgors-vbn] |

Broedgegevens van Boerenzwaluw zijn bijgewerkt volgens dezelfde bron. Bij andere soorten verschijnt een broedstreep zodra hun maanden zijn nagekeken. CAP-BIRD-011/012 en L-019/L-040. Aanwezigheidsstatus en broedperiode als afzonderlijke gegevens bewaren.

[koolmees-sovon]: https://stats.sovon.nl/stats/soort/14640
[merel-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/merel
[roodborst-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/roodborst
[tjiftjaf-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/tjiftjaf
[fitis-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/fitis
[fitis-sovon]: https://stats.sovon.nl/stats/soort/13120
[wintertaling-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wintertaling
[rietzanger-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietzanger
[boerenzwaluw-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/boerenzwaluw
[rietgors-vbn]: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/rietgors

## Leesbaarheid maandlegenda

De eigenaar vond de donkere kleuren te vergelijkbaar. Standvogel behoudt het bestaande groen en broedmaanden houden de roze streep. Zomergasten krijgen helder goudgeel, wintergasten kobaltblauw, doortrekkers terracotta en schaarse gasten en dwaalgasten lichtlila. De kleurvakjes in de legenda zijn vergroot van 9 naar 14 px. Donkere letters op goudgeel en lila en witte letters op de donkere kleuren geven minimaal 5,93:1 tekstcontrast.

Bij bekende broedmaanden staat de periode ook in tekst direct onder de balk. Daardoor is de informatie ook zonder kleurherkenning leesbaar. De bronmaanden en de dekking van negen soorten blijven gelijk. CAP-BIRD-011/012 en L-019. Bij kleine kleurstaaltjes helpt verschil in helderheid naast verschil in tint.
