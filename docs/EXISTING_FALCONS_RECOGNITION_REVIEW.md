# Bestaande gidsvogels — Torenvalk en Slechtvalk

Datum: 2026-11-06. Status: DRAFT / PARTIALLY TESTED. Geen merge of productieakkoord.

## Scope en overdracht

De eigenaar vraagt verrijking van vogels die al een gidsfoto hebben: betrouwbare verschillen tussen geslachten en leeftijden, vergelijkbare soorten, opnamen en herkenningsfoto's in zit en vlucht. Deze eerste afzonderlijke batch behandelt **sp008 Torenvalk en sp009 Slechtvalk**. Dit is geen claim dat alle bestaande gidsvogels gereed zijn.

- Repository: `saddamsmit-source/Birdspot-Library`.
- Eigen writer-branch: `feat/existing-falcons-recognition`.
- Exacte uitgangsversie: `feat/field-guide-phase-18` op `35e11549d9d80e99981eb20c636de243fb75b00c` (PR #38).
- Geobserveerde main: `5bf67043e830e977749f0ee593cf9f41f0e2822b`.
- Ander gesprek: steltlopers, volgende batch fase 19. Geen van die soortrecords is hier gewijzigd.
- PR richt zich op fase 18 om uitsluitend deze delta te tonen. Voor latere integratie eerst de actuele andere branch ophalen; gedeelde registers samenvoegen, generators opnieuw draaien en een nieuwe unieke SW-versie kiezen. Niet de registers van deze branch over die van de andere writer kopiëren.
- De definitieve commit-SHA staat in de PR en is reproduceerbaar via `git rev-parse feat/existing-falcons-recognition`. Deze notitie hoort bij de commit die haar toevoegt.

Toegepaste projectbasis: Projectinstructies v2.6 FINAL, App Development Handbook v2.8 FINAL, APP-System-Index v3.1 FINAL en App Capability Catalogus v1.0 FINAL. Er is in deze repository geen app-README aangetroffen. Deze gerichte functiekaart/handover vult de bestaande repositoryreviews aan; centrale projectdocumenten zijn niet gewijzigd of als gesynchroniseerd geclaimd.

## Gebouwd en inhoudelijk gecontroleerd

Beide vogels hadden al een lokale hoofdfoto. Die blijft behouden. Een optioneel blok **Zittend en in vlucht** voegt maximaal twee aanvullende kijkwijzen met concrete kenmerken toe. Bestaande beelden worden hergebruikt. De afbeeldingen tonen de originele uitsnede en openen in de bestaande fotoviewer.

| Soort | Kleed/beeld | Geluid | Vergelijkingen |
|---|---|---|---|
| Torenvalk | Bestaande man; nieuwe vrouw en juveniel; nieuw biddend vluchtbeeld | Paarroep en roep volwassen man | Slechtvalk volwassen/juveniel; juveniele Sperwer |
| Slechtvalk | Bestaande adult in vlucht; nieuw zitbeeld en juveniel | Een geluidsvoorbeeld met beperkte bronmetadata | Torenvalk volwassen/juveniel; juveniele Havik |

Netto: vijf nieuwe WebP-bestanden, drie lokale MP3-opnamen, vier vergelijkingsrecords (in beide richtingen beschikbaar), twee houdingsblokken. Bron, maker, licentie, wijzigingen en controle staan per asset in `assets/species/field-guide-media.json`. Geen synthetische vogelbeelden.

Slechtvalken hebben geen kunstmatig afzonderlijke man/vrouw-kleedkaarten: het volwassen kleed wordt gedeeld getoond, met het grootteverschil en de onzekerheid van geslachtsbepaling in de tekst. Het zitbeeld heeft een expliciet door de fotograaf beschreven volwassen vrouwtje van **calidus uit India**; de herkomst/ondersoort staat zichtbaar in de kaart. Het juveniele beeld komt uit Californië, eveneens expliciet vermeld. Deze beelden zijn niet als Nederlandse ondersoortbewijzen gepresenteerd. Geen onbewezen jaarling-, winter- of broedkleedfoto toegevoegd.

## Bronnen per gegeven

Alle pagina's en gebruikte mediabeschrijvingen zijn op 2026-11-06 opgehaald. Nederlandse teksten zijn eigen syntheses; de foto's en opnamen komen uit afzonderlijk gelicentieerde Commons-bestanden.

| Gegevens | Gecontroleerde bron |
|---|---|
| Torenvalk: formaat, habitat, broedmaanden, legsel, broed-/nestduur, gedrag | [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/torenvalk) |
| Torenvalk: kleed, geslachtsverschil, indicatief gemiddeld gewicht | [Naturalis](https://bris.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/nsr_taxon.php?cat=TAB_DESCRIPTION&epi=147&id=112269) en [RSPB](https://www.rspb.org.uk/birds-and-wildlife/kestrel) |
| Slechtvalk: formaat, leefgebied, broeden, gedrag, wintergasten | [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/slechtvalk) |
| Slechtvalk: adult/juveniel, geslachtsverschil, indicatief gemiddeld gewicht | [Naturalis](https://bris.linnaeus.naturalis.nl/linnaeus_ng/app/views/species/nsr_taxon.php?cat=TAB_DESCRIPTION&epi=147&id=112274) en [RSPB](https://www.rspb.org.uk/birds-and-wildlife/peregrine-falcon) |
| Vergelijkingen: Sperwer en Havik | [Sperwer](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/sperwer), [Havik](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/havik) en bovenstaande valkenbronnen |
| Mediasoort, leeftijd/geslacht waar bekend, auteur en gebruikslicentie | Individuele Commons-bron-URL's in het mediaregister; zichtbare kenmerken gecontroleerd |

Broedgegevens zijn bijgewerkt in `tools/species/species_life.json` en gegenereerd naar `src/data/speciesLife.js`. Fototips zijn praktische redactietips onder Waar, geen wetenschappelijk gemeten cameravoorschriften. Gidsbronnen staan ook op de soortkaarten.

## Functiekaart / capabilitydelta

| Bestaande capability | Delta en ingang | Fout-, herstel- en datagedrag |
|---|---|---|
| CAP-BIRD-012 — gids/herkenning | Soorten → soort → Herkenning: twee houdingsbeelden, vier vergelijkingen en passende kleedfoto's. Waar: vind- en fototips. Leefwijze: geactualiseerde broedgegevens. | Geen poses-data betekent geen leeg blok. Vergelijkingsknop opent de andere soortkaart. |
| CAP-BIRD-015 — media | Afbeelding aanklikken → bestaande viewer → sluiten. Drie extra bedienbare audiospelers met credits. | Bestaande fouttekst bij ontbrekende foto; één opname tegelijk. Geen nieuwe upload-, verwijder-, import- of exportflow. |
| CAP-BIRD-040 — lokale gidsmedia | Optioneel `poses` in mediaregister → build.py → GUIDE_POSES → renderer; bestaande SW-mediacache neemt de extra beelden mee. | Cacheversie `1.17.11-falcons-recognition-1`. Offline blijft afhankelijk van geslaagde eerste download en bewaarde opslag. Alleen de cache-inventaris is in deze sessie gecontroleerd; echt offline gedrag vereist browser-/toestelbewijs. |

Geen nieuwe route, formulier, filter of opslagkey. Geen migratie, wijziging van waarnemingen of eigen foto's. Alle 595 overige soortrecords zijn programmatisch gelijk vergeleken met de basis; de twee doelrecords behouden hun overige velden. Backup/herstelcode is niet gewijzigd.

## Validatie en grenzen

| Bewijslaag | Status | Waarneming |
|---|---|---|
| Bronnen en media | VERIFIED binnen bron-/visuele controle | Individuele taxa, auteurs/licenties en zichtbare kleden gecontroleerd; alle vijf beelden laden/decoderen, alle drie MP3's decoderen met ffmpeg. Geen onafhankelijke ornitholoog. |
| Generator/contract | VERIFIED | `build.py` en `build_life.py` reproduceerbaar; `guide_coverage.mjs --summary`, `test_guide_poses.mjs`, syntax en `git diff --check` slagen. Buiten-scope soortrecords gelijk. |
| Desktopbrowser | VERIFIED voor genoemde flows | Beide kaarten geopend; afbeeldingen vergroot/gesloten; alle drie clips daadwerkelijk gestart. Torenvalk clip 1 pauzeert zodra clip 2 speelt. Vergelijking opent juiste Slechtvalk-kaart. |
| Mobiele browserbreedte | VERIFIED voor genoemde flows | 390 × 844 iframe: foto-overzicht, vergroten/sluiten, brontekst en fototip onder Waar zichtbaar. Geen fysieke Androidtest. |
| Ontbrekende foto en herstel | VERIFIED | Alleen in de wegwerp-preview fout pad gezet: bericht ‘Deze foto is nu niet beschikbaar.’; normale code teruggezet en beeld daarna opnieuw geladen. |
| CI / uitgebreide browserregressie | NOT TESTED op moment van deze notitie | Workflow bevat poses in bestaande beeld-/offline-inventaris en voert het nieuwe contract uit. Actuele CI-uitkomst raadplegen op de PR. Lokale Python-Playwrightsuite niet gestart: deze werkomgeving gebruikt de beheerde browser. |
| Offline playback / herstart | NOT TESTED in deze sessie | Geen claim op basis van alleen code of mediadecode. |
| Eigenaar, fysiek toestel, onafhankelijk Claude-review, productie | NOT TESTED | Apart te beoordelen. Geen merge of livegang uitgevoerd. |

Screenshots: [mobiel zit/vlucht](evidence/falcons-poses-mobile-20261106.jpg) en [geluid/vergelijking](evidence/falcons-audio-comparison-mobile-20261106.jpg). Geen algemeen app-PASS.

## Kennisdelta en volgende stap

- **L-019 / L-016 — media en soortbewijs:** oorspronkelijke zittende Slechtvalk was technisch geldig maar te klein in mobiel beeld. Oorzaak: te veel omgeving in de bronfoto. Vervangen door een duidelijke portretfoto; houdingfoto's krijgen 160 px beeldhoogte met contain. Ondersoort/herkomst zichtbaar gemaakt. Een twijfelachtige XC750854-opname (bron beschreef slechts formaat als een Slechtvalk) is afgewezen. Hergebruik: controleer het zichtbare determinatiekenmerk op mobiel, plus bronidentiteit; een bestandsnaam alleen is geen bewijs.
- **L-039 — gids versus eigen data:** nieuwe poses blijven referentiecontent, los van persoonlijke foto's/waarnemingen. Bestaande viewer, credits en cachemechanismen hergebruikt.
- **L-077 — bewijsniveaus:** de eerste implementatie gebruikte `photographyTip` terwijl de echte renderer `photoTip` leest. Een data-objecttest alleen ontdekte dit niet. In de browser ontbrak de tip, waarna veldnaam en gerichte rendertest zijn gecorrigeerd. Hergebruik: controleer de daadwerkelijke gebruikerroute en zichtbare inhoud.
- Geen nieuwe algemene learning-ID of parallelle norm gemaakt. Bovenstaande voegt appbewijs aan bestaande learnings toe.

Volgende stap: onafhankelijke review van deze twee kaarten en integratiecoördinatie met fase 19. Daarna verder met bestaande foto-soorten zonder uitgebreide inhoud; begin een nieuwe batch pas na actuele branches/soortdekking te controleren. De houdingsstructuur is herbruikbaar voor andere roofvogels; voor zangvogels alleen een tweede beeld toevoegen als het een werkelijk aanvullend herkenningskenmerk toont.
