# Informatiegids en gedeelde waarnemingen — 2026-11-05

Status: implementatie, QA-resultaten via PR35 Actions; geen productieakkoord.
Basis: 0dbd877, main 5bf67043. Claude PR34 en kaartbestanden ongemoeid.

## Eigenaarbesluit en functiekaart
Vogellijst is informatie. Geen handmatig gezien, favoriet of invoerknoppen in soortdetail. Invoer via bestaande globale Waarnemen-knop of kaart. Favoriet in de lijst blijft een bladwijzer; selectie staat apart onder Bewaarde vogels, boven biologische filters. Bestaande bladwijzers blijven behouden.

Gidsstatus en teller lezen nu dezelfde waarnemingsrecords als kaart en overzicht. Eigen tab toont alle waarnemingen en gekoppelde foto's, plaatsnaam of coördinaten, datum, gezien/gehoord/beide en identificatiebron. Beide telt bij gezien én gehoord. Oud record zonder methode blijft onbekend. Doorklik opent de oorspronkelijke waarneming; na wijzigen/verwijderen ververst de gids. Media zonder gekoppelde waarneming wordt niet als eigen soortfoto gebruikt. Video blijft toegankelijk via het waarnemingsdetail, fotogalerij toont afbeeldingen.

## Learning en hergebruik
Probleem: handmatig gezien, automatisch gezien en echte waarnemingen waren verschillende waarheden. Oorzaak: aparte opslagkey naast de records. Fix: afgeleide gidsstatus, geen tweede schrijfpad. Oude key en onbekende recordvelden niet verwijderd of geconverteerd naar verzonnen waarnemingen. Hergebruik: catalogus/detail is een projectie van de transactierecords; bladwijzers zijn een afzonderlijke voorkeur, geen bewijs van waarneming. Aanvulling op L-039 (vaste versus gebruikersdata), L-040 (afgeleide data), L-073 (referenties/media), L-076 (lifecycle) en L-077 (bewijsniveaus), geen nieuwe parallelle algemene norm.

Tests die voorheen snelle invoer vanuit soortdetail of aparte seen-key eisten zijn gericht aangepast aan dit expliciete nieuwe eigenaarbesluit. Behoud van media, GPS, Merlin, backup/herstel en mobiele overflow-eisen blijft vereist. Integratiecontrole leest echte via formulier opgeslagen waarnemingen terug in gids en kaart. Leafletdekking en fysiek toestel afzonderlijk beoordelen; geen multi-device cloudsync gebouwd.

## Vogelbescherming als bron
Voorkeursbron voor inhoudelijke controle: https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids . Leg per gecontroleerd gegeven soortpagina, datum en claim vast; deze voorkeur betekent niet dat alle huidige appteksten al opnieuw geverifieerd zijn.
Colofon https://www.vogelbescherming.nl/colofon op 2026-11-05 gecontroleerd: foto's, illustraties en bewegend beeld mogen niet worden overgenomen. Artikelen alleen met expliciete toestemming; dit omvat geen beelden. Gebruik hun foto’s dus niet zonder afzonderlijke rechten. Bestaande lokale gelicentieerde foto's blijven de afbeeldingsbron. Inhoudelijke betrouwbaarheid is geen hergebruiklicentie.

## Catalogusdelta voor eerstvolgende gecontroleerde release
- CAP-BIRD-009–012: informatielijst/detail en filters behouden; waarnemingen zijn nu bron van status/teller, methode en locaties.
- CAP-BIRD-013: gezien-toggle verwijderd; lijstbladwijzer en aparte bewaarsectie blijven, detailfavoriet verwijderd.
- CAP-BIRD-014: vier soortdetail-invoersnelkoppelingen ingetrokken op eigenaarverzoek; centrale invoer CAP-BIRD-017 en kaart blijven.
- CAP-BIRD-015/020: gekoppelde foto's en originele waarneming openen; herladen na edit/delete.
Deze delta staat in de repository; centrale projectdocumenten en projectinstellingen zijn hiermee niet automatisch gesynchroniseerd.

## QA-bewijs informatiewijziging
3355400: gerichte CI Mobile Editorial, Observation Evidence & Pins (inclusief nieuwe gidsasserties, foto/video en ZIP-herstel), guide photos en bestaande afzonderlijke maptests geslaagd. Browser op 390 px: handmatig Houtduif gehoord ingevoerd via Waarnemen, daarna gids Gezien 0 / Gehoord 1 met dezelfde locatie. Species-data-suite vond achtergebleven tellertekstverwachting ‘soorten gezien’; testtekst volgt expliciet gewijzigd productcontract ‘waargenomen’. Volledige suite opnieuw controleren op definitieve commit. Geen fysiek toestel of onafhankelijke reviewer.

## Mobiele filterbediening — 2026-11-06

CAP-BIRD-010 en CAP-BIRD-011. De eigenaar vond de filterknoppen te klein. Een gedeelde minimumhoogte maakt ze 34 px hoog, tegenover 27 px op de vorige preview. De drie rijen gebruiken samen 21 px extra hoogte. De rijen passen bij viewportbreedtes 360, 390 en 430 px, met horizontaal scrollen binnen de rijen waar nodig. Daarom blijven de filters direct bedienbaar als knoppen.

Browsercontrole op 390 px. Trekvogels gaf 32 soorten. Bos beperkte dit tot drie. Lente en Zomer bleven tegelijk geselecteerd en de overgangsperiode toonde die drie soorten. Winter gaf een lege lijst. Na deselecteren van gebied en seizoen keerden de 32 trekvogels terug. Fysieke bediening is niet getest. De cacheversie is verhoogd om de aangepaste stijl ook voor geïnstalleerde exemplaren op te halen.

Hergebruik volgens L-075 en L-077. Meet de hoogte en controleer de lijst na echte interacties voordat een compacte filterbediening wordt vervangen.

De eigenaar koos vervolgens drie dropdowns naast elkaar. Versie 1.15.2 toont Status, Gebied en Seizoen met de actieve keuze in de knop. Status en Gebied sluiten bij selectie. Het seizoensmenu blijft open om twee aangrenzende seizoenen te kunnen kiezen en bevat de optie Zonder jaarrondvogels. Openen van een ander menu, buiten het menu klikken, Escape en browser-Terug sluiten het menu. De combinatieregels blijven in de bestaande filterfuncties.

Browsercontrole op 360, 390 en 430 px. De rij met knoppen meet gesloten 52 px, tegenover 127 px voor de drie vergrote rijen. De knoppen zijn 44 px hoog. Trekvogels, Bos en Lente–zomer leveren samen drie soorten op. Keuzes blijven behouden na Escape. De eerste browser-Terug sluit het menu op Soorten en de volgende gaat terug naar Home. Geautomatiseerde tests volgen de nieuwe ingang en controleren ook de gecombineerde resultaten. Fysiek toestel vraagt aparte controle.

De eerste CI-ronde vond een foto-integratietest die nog rechtstreeks de oude tab Alle zocht. Ook die test opent nu eerst Status en kiest daarna Alle. De controles op weergave, beeldfouten en offline beschikbaarheid blijven behouden.

## Veldherkenning en broedgedrag — 2026-11-06

- CAP-BIRD-012. Herkenning vergelijkt acht vaak verwarde soortenparen in beide richtingen. Ieder paar noemt concrete kenmerken en verwijst per soort naar de gecontroleerde Vogelbescherming-soortpagina. Een soortkaart opent vanuit de vergelijking. Alleen foto's van het beschreven kleed horen bij een vergelijking die over sekse, leeftijd of seizoen gaat.
- CAP-BIRD-015 en CAP-BIRD-040. Herkenning toont afspeelbare referentieopnamen van Fitis, Tjiftjaf, Merel en Vink, telkens met zang en een benoemde roep. De bestanden komen van Wikimedia Commons en zijn lokaal gebundeld. Maker, licentie, bron en bewerking staan in het mediaregister en bij de speler. De speler stopt bij een ander geluid of bij het verlaten van Herkenning. De media-cache bewaart hele clips, zodat bereikverzoeken uit de lokale opname kunnen worden bediend.
- CAP-BIRD-017, CAP-BIRD-020 en CAP-BIRD-012. Gedrag kan nestmateriaal dragen, voedsel naar het nest brengen of uitgevlogen jongen gezien vastleggen. De bestaande optionele gedragswaarde wordt getoond op de waarneming en onder Mijn waarnemingen bij de soort. De ZIP-back-up gebruikt hetzelfde veld. De keuzes zijn in gewone taal, geïnspireerd op [Sovon Broedvogelmonitoring](https://pub.sovon.nl/static/publicaties/Handleiding-BMP-en-kolonievogels-2024-LR.pdf). Het zijn persoonlijke notities en geen automatisch afgeleide broedcodes.
- L-019, L-039 en L-077. Gebruik één geredigeerd soortenpaar voor beide soortkaarten en registreer aanvullend beeld en geluid bij de exacte soort, opname of het kleed. Houd die broninhoud gescheiden van eigen gedrag. Toets zowel navigatie, playback en offline toegang als het opslaan en terugvinden van eigen gedrag.

### Fotobatch 09

Vijf extra soorten hebben een hoofdfoto in de gids. Zwartkopmeeuw heeft een nieuwe lokale foto en Slechtvalk, Purperreiger, Kwak en Grote Karekiet gebruiken bestaande diashowbeelden. Tien aparte kleedfoto's en zeven verwijzingen naar hoofdfoto’s leveren zeventien geïllustreerde kleedkaarten op bij acht soorten. Bij alle acht vergelijkingen staan nu twee lokale foto's. Leeftijd, geslacht of seizoen moet overeenkomen waar het onderscheid daarvan afhangt. De jonge Grote Bonte Specht en de twee volwassen meeuwen in broedkleed zijn expliciete regressievoorbeelden.

De fotoselectie combineert Commons-metadata en visuele herkenningspunten uit de gelinkte soortkaarten. De foto’s worden zonder extra uitsnede getoond. De bestanden, lokale paden, credits en de versie van de cache zijn gecontroleerd via de gids- en foto-integratietests. Fysieke mobiele bediening vraagt afzonderlijke controle.

### Fotobatch 10 · kiekendieven

- CAP-BIRD-012, CAP-BIRD-015 en L-019. Bruine, Blauwe, Grauwe en Steppekiekendief hebben elk beeld van man, vrouw en juveniel, en acht nieuwe vergelijkingen gebruiken het passende kleed. Bij lastig te scheiden bruine vogels benoemt de gids kijkhoek, meerdere kenmerken en de grens van herkenning. Foto’s zijn lokaal, met het juiste taxon en kleed in de bronmetadata en een visuele controle. Twee foto's gebruiken geannoteerde research-grade waarnemingen en een licentie op de afzonderlijke iNaturalist-fotopagina. Vergelijkbare Amerikaanse of Oostelijke kiekendieven zijn afgewezen.
- Vogelbescherming is de bron voor maten, broedgegevens en algemene veldkenmerken. Vogelskijken en Naturalis vullen de vleugel- en kopdetails aan. De toepasselijke pagina’s staan op de soortkaarten. Sovon bevestigt incidentele Nederlandse broedgevallen van Steppekiekendief. Die status staat in de bronlijst en de gids toont geen vast Nederlands maandbereik bij deze soort.
- CAP-BIRD-040. Bruine en Blauwe hebben elk een lokale roep met herkomst en licentie in het register. Het fragment van de Blauwe is een bevestigde bedelroep van een vrouwtje in vlucht. Voor Grauwe en Steppe leverden de gecontroleerde geluidsbronnen in deze ronde geen licentie op die bij de beoogde distributie past. Daarom blijft hun geluidsbeschrijving de beschikbare gidsinhoud.

### Gefaseerde dekking

`node tools/species/guide_coverage.mjs` geeft voor elk van de 597 soort-ID’s de gedocumenteerde broncontrole, hoofd- en kleedfoto’s, opnamen en vergelijkingen. Voeg `--summary` toe voor de totalen. De controles koppelen vergelijkingsfoto’s aan het gevraagde kleed en toetsen lokale bestanden en credits. Een lege kolom geeft een open punt of een inhoudelijk niet-toepasselijk kleed aan. Een gedocumenteerde review is de afgebakende controle van de gelinkte velden en bronnen. Werk per soortgroep, geef eerst voorrang aan verwarringssoorten en houd ontbrekend of onvoldoende gelicentieerd materiaal zichtbaar in de dekking. Onderscheid bij verdere groei offline getest materiaal en nog te toetsen omvang van de download.
