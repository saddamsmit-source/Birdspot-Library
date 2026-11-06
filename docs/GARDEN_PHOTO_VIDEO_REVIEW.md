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
