# Bestaande fotovogels — vijftien bosvogels

Datum: 2026-11-06. Status: DRAFT / PARTIALLY TESTED. Geen merge of productieakkoord.

## Scope en overdracht

Vervolg op de bestaande valken: de eigenaar vraagt zoveel mogelijk al afgebeelde soorten in één ronde te verrijken en een deelbare preview te leveren. Deze ronde behandelt uitsluitend sp016–020, sp030–034 en sp063–067. De hoofdfoto's blijven behouden. Netto **15 bronreviews, 13 nieuwe foto’s, 22 opnamen, 8 nieuwe en 2 bijgewerkte vergelijkingen, 5 aanvullende beeldblokken**.

- Repository: `saddamsmit-source/Birdspot-Library`.
- Writer-branch: `feat/existing-forestbirds-recognition`.
- Exacte basis en beoogde PR-base: `feat/existing-falcons-recognition` op `7fbbb4472996973e9a2fbf8649715bb111761b9b` (PR #39).
- Geobserveerde main: `5bf67043e830e977749f0ee593cf9f41f0e2822b`. Fase 19 staat bij laatste controle nog op `35e11549d9d80e99981eb20c636de243fb75b00c`; die andere writer werkt aan steltlopers. Open PR’s #34–39 gecontroleerd; geen daarvan gewijzigd door deze batch.
- Eén repositorywriter. Drie afgebakende onderzoekstaken leverden alleen tijdelijke bron-/mediavoorstellen; integratie en QA bij de writer. Dit is geen onafhankelijke Claude-review.
- Definitieve SHA en Vercel-preview staan in de PR; reproduceer via `git rev-parse feat/existing-forestbirds-recognition`. De Vercel Git-koppeling maakt een preview van de featurebranch; geen productiepromotie.
- Bij latere integratie eerst actuele branches ophalen, bronregisters per soort combineren, generators opnieuw uitvoeren en een unieke SW-versie behouden. Geen complete registers van de ene writer over die van de andere kopiëren.

Toegepaste basis: Projectinstructies v2.6 FINAL, Handbook v2.8 FINAL, Index v3.1 FINAL en Capability Catalogus v1.0 FINAL. Geen app-README aangetroffen. Centrale projectdocumenten zijn niet gewijzigd of als gesynchroniseerd geclaimd.

## Inhoud en media

Alle kaarten krijgen herkenningskenmerken, relevante kleden/leeftijdsgrenzen, leefwijze, broedgegevens, vindplaatsen, fotografietip en klikbare bronnen. Geen geslacht of seizoenskleed toegewezen zonder onderbouwing. Bij sterk gelijkende geslachten wordt een gedeelde volwassenkaart gebruikt.

| Soort | Nieuwe foto’s | Nieuwe audio | Belangrijkste aanvulling |
|---|---:|---:|---|
| Grote Bonte Specht | 1 | 2 | Man naast bestaande vrouw/juveniel; roep en roffel; grote/kleine/middelste vergelijken |
| Kleine Bonte Specht | 1 | 2 | Vrouw naast bestaande man; roep en roffel; geen onjuiste gele wenkbrauw |
| Zwarte Specht | 1 | 2 | Vrouw; zitroep en vluchtroep; rechte in plaats van golvende vlucht |
| Groene Specht | 2 | 1 | Vrouw op gras en juveniel; snorstreep en jeugdstippeling; opname is alarmroep |
| Middelste Bonte Specht | 2 | 1 | Foeragerend en volwassen man; roze onderstaart/flankstrepen; alarmroep |
| Pimpelmees | 1 | 1 | Gele jonge wangen; gedeeld volwassenkleed; zang |
| Matkop | 1 | 1 | Zit- en vluchtbeeld; zang; gecombineerde kenmerken tegenover Glanskop |
| Glanskop | 1 | 1 | Vooraanzicht en zang; snavelbasis, roep en jeugdonzekerheid |
| Kuifmees | 1 | 1 | Kop/kuif van tweede kant; jeugdkenmerken; opname expliciet zang |
| Staartmees | 1 | 1 | Juveniel met donkere wangen; geluidstype niet nader gespecificeerd |
| Goudhaantje | 1 | 1 | Juveniel zonder gekleurde kruinstreep; roep; verborgen oranje bij man |
| Vuurgoudhaan | 0 | 2 | Zang en roep correct gelabeld; koptekening tegenover Goudhaantje |
| Boomklever | 0 | 2 | Zang en Nederlandse roep; achterflanken en kop-omlaaggedrag |
| Boomkruiper | 0 | 2 | Zang/roep; meerdere determinatiekenmerken en onzeker broedduurbereik |
| Taigaboomkruiper | 0 | 2 | Zang/roep; Nederlandse broedvorm macrodactyla tegenover noordelijke familiaris |

De oorspronkelijke hoofdbeelden zijn niet automatisch als man/vrouw gelabeld. Zwarte Specht houdt daarom een neutrale hoofdfoto, ook al is rood op de kruin zichtbaar. De middelste volwassenkaart noemt gedeelde kenmerken; de nieuwe fotograafbevestigde man blijft herkenbaar in de alttekst. Matkop-vluchtfoto komt uit Finland en is geen bewijs voor Nederlands ondersoortkleed.

De beeldsectie heet **Herkenning in beeld** bij kijkhoeken/gedrag en **Zittend en in vlucht** wanneer een vluchtbeeld aanwezig is. Alle foto’s behouden hun bronuitsnede en openen in de bestaande viewer. De twee aanvullende foto’s van zwarte vrouw en middelste man zijn 500 px breed, niet opgeschaald. Voor Glanskop is de extra frontfoto een houdingaanvulling; zij bewijst niet het kleine snavelvlekje.

De bronbank beperkte downloads met HTTP 429. Na de aangegeven wachttijd kwamen nog negen clips en één jeugdfoto binnen. Bij een nieuwe 429 zijn downloads gestopt. Acht resterende kandidaten staan in [de mediawachtrij](data/existing-forestbirds-media-backlog.json), zonder actieve appverwijzingen. Voor Vuurgoudhaan, Boomklever en beide boomkruipers is nog geen extra foto opgenomen. Niet alle leeftijden hebben al een foto; spechtenvluchtbeelden blijven open.

## Bronnen en inhoudelijke keuzes

Bronlinks staan per soort in `src/data/species.js` (`guideReview.sources`) en bij iedere foto/opname in `assets/species/field-guide-media.json`. De bronbestanden voor leefwijze staan in `tools/species/species_life.json`. Nederlandse teksten zijn eigen syntheses.

- Vogelbescherming: herkenning, Nederlandse leefgebieden, broeden en trek voor alle vijftien soorten. Aanvullingen uit Naturalis, RSPB en BTO; gespecialiseerde leeftijd-/geslachtskenmerken uit Blasco-Zumeta & Heinze/Aranzadi. Boomkruipers daarnaast NABU, BUND, BirdWatch Ireland en het ornithologische soorthoofdstuk Vogelwelt Sachsen-Anhalt.
- Pimpelmees blijft eind maart–juli volgens de bron. Matkop en Glanskop hebben alleen een onderbouwde starttijd; geen eindmaand uit nestduur afgeleid. De kalender toont daarvoor geen verzonnen gesloten bereik.
- Groene Specht: 4–6 eieren en 14–15 dagen broeden. Zwarte Specht: 24–31 nestdagen en rechte slagvlucht. Kleine Bonte Specht: 5–6 eieren en 21–25 nestdagen. Maten buiten de gecontroleerde `dimensions` zijn behouden maar niet als geverifieerd weergegeven.
- Boomkruiper: Vogelbescherming geeft 17–18 broeddagen, het ornithologische hoofdstuk 13–15. Beide bereiken worden expliciet als bronverschil genoemd; geen zelfbedacht exact getal. Het hoofdstuk was via geïndexeerde primaire passage beschikbaar; volledige PDF-download gaf 503.
- Taigaboomkruiper: kaart is op soortniveau Certhia familiaris. Broedvorm macrodactyla en noordelijke trek-/wintergasten worden onderscheiden in tekst; centrale statusvelden blijven intact.
- Commons-bestandnamen waren niet altijd gelijk aan het geluidstype in de beschrijving. Vuurgoudhaan en Boomkruiper zijn op bron-Type als zang/roep gelabeld. Kuifmees is zang. Staartmees blijft “Geluidsvoorbeeld”. Roffelen is geen zang. Bij de Nederlandse Boomkleverroep wordt Goudhaantje op de achtergrond vermeld.
- De audiotaxa en geluidstypen zijn bronmatig gecontroleerd; alle bestanden technisch gedecodeerd. Dit is geen onafhankelijke auditieve determinatie of ornithologisch expertcertificaat.

## Functiekaart / capabilitydelta

| Capability | Gewijzigde gebruikerroute | Fout-, herstel- en datagedrag |
|---|---|---|
| CAP-BIRD-012 — soortgids | Soorten → soort → Herkenning: kleden, bronlinks, vergelijkingen en optionele kijkhoeken. Leefwijze: gecorrigeerde gegevens. Waar: 15 fototips. | Bestaande vergelijkingsknop opent verwante kaart; geen data betekent geen leeg beeldblok. |
| CAP-BIRD-015 — media | Klik op aanvullende foto → viewer → sluiten; 22 extra audiospelers met credits. | Bestaande foutmeldingen en één-opname-tegelijk blijven hergebruikt. Geen nieuwe upload-/verwijderflow. |
| CAP-BIRD-040 — gids offline | Extra lokale bestanden in bestaande mediaregisters en SW-mediacache; versie `1.17.12-forestbirds-recognition-2`. | Offline vereist eerst geslaagde download en behouden browseropslag. Geen algemene claim van volledig offline op basis van alleen lokale bestanden. |

Geen nieuwe route, filter, formulier, opslagkey of migratie. Geen wijziging aan eigen foto’s, waarnemingen, backup/herstel of centrale soortstatus. Alle **582 overige soorten** zijn programmatisch vergeleken met de basis en gelijk; overige velden van doelsoorten en buiten-scope leefwijze/media behouden.

## Bewijs en grenzen bij deze commit

| Laag | Status | Bewijs |
|---|---|---|
| Bron-/beeldcontrole | VERIFIED binnen genoemde grenzen | Bronidentiteit, licenties en zichtbare kleden gecontroleerd; 13 beelden decoderen en afmetingen kloppen. |
| Audiofilecontrole | VERIFIED technisch | Alle 22 MP3’s volledig met ffmpeg gedecodeerd; correcte metadata-typekoppeling. Geen onafhankelijke luisterdeterminatie. |
| Generator/contract | VERIFIED | build.py/build_life.py; plumage/status-normalisaties laten species.js bytegelijk; coverage en poses-rendercontract slagen; syntax en diff-check. |
| Mobiele browser 390×844 | VERIFIED voor genoemde flows | Alle 15 kaarten geopend; bronnen, kleden en fototips zichtbaar. Leefwijze op bosvogels bekeken, inclusief ondersoorttekst en bronverschil. Matkopvluchtfoto, Zwarte-Spechtvrouw en Goudhaantjejuveniel vergroot/gesloten. Vergelijkingen Grote→Kleine Bonte en Goudhaantje→Vuurgoudhaan openen juist. |
| Audio bediening | VERIFIED voor steekproef | Acht clips werkelijk gestart: grote bonte roep/roffel, kleine bonte roep/roffel, zwarte vlucht-/zitroep, vuurgoudhaan zang/roep. Voortlopende tijd waargenomen; tweede speler pauzeert eerste. |
| Desktop/regressie/offline | NOT TESTED op moment van commit | Bestaande CI test alle geregistreerde media op laden, offline decode en audio-Range, plus desktop/mobile layout en appregressies. Definitieve resultaten en preview-SHA worden op de PR bijgewerkt. |
| Fysiek Android, eigenaaracceptatie, onafhankelijke Claude-review, productie | NOT TESTED | Geen app-PASS, merge of livegang. |

Bewijsbeeld: [juveniele Goudhaan in mobiele viewer](evidence/forestbirds-goldcrest-mobile-20261106.jpg). Een initiële controle op de letterlijke tekst `VOEDSEL` miste het werkelijk getoonde `Voedsel`; de DOM opnieuw gelezen en de daadwerkelijke gegevens bevestigd. Geen appcode of acceptatie-eis aangepast om die controlescriptfout te verbergen.

## Kennisdelta en vervolg

- **L-019 / L-016:** bestandsnaam, bron-Type en geluidslabel kunnen verschillen. Oorzaak: voorlopige kandidaatsleutels/bronbenaming. Fix: bron-Type vóór lokale bestandsnaam en UI-label gecontroleerd; bron en precieze grenzen in register. Hergebruik bij iedere audiobatch.
- **L-019:** betrouwbare bronmetadata is geen download- of visueel bewijs. Kandidaten door rate limit apart gehouden; pas na succesvolle download/inspectie opgenomen. Onvoldoende beelden blijven open.
- **L-077:** de gedeelde preview maakte een te algemeen bijschrift bij de Groene Specht zichtbaar (geslacht onbekend naast een bronbevestigde mannenkaart). Gecorrigeerd naar concrete houdingkenmerken; cacheversie vernieuwd.
- **L-077:** bronvoorstellen gebruikten soms `reviewed` in plaats van `date`, arrays als maandbereik en andere vergelijkingsschema’s. Fix vóór integratie: canoniek schema, bestaande generators en echte soortkaarten. Geen alternatieve parallelle appstructuur gemaakt.
- **L-039 / L-077:** gedeelde volwassenkaarten voorkomen geforceerde sekseclaims. Geografische variatie en bronconflicten worden zichtbaar uitgelegd; referentiemedia blijven los van gebruikersdata.
- Functiekaart hierboven bijgewerkt binnen bestaande capability-ID’s; geen nieuwe algemene learning-ID’s of normrevisie nodig.

Volgende stap: beoordeel deze preview en voeg bij een volgende bronronde de ontbrekende foto’s/geluidstypen uit de wachtrij toe. Coördineer integratie met fase 19 en de voorgaande PR-keten; niet direct naar main samenvoegen.
