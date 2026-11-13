# Birdspot M12 — drie plevieren: visuele bron- en kwaliteitsreview

**Datum:** 13 november 2026 · **Status:** DRAFT / PARTIALLY TESTED · **Bron:** PR #177 · **Fysiek Android:** NOT TESTED · **Publicatie:** NO-GO.

## 1. Scope en bewijsgrens
Drie eerder **niet** afzonderlijk geaudite soorten: **Zilverplevier (sp144), Goudplevier (sp145), Bontbekplevier (sp146)**. Deze ronde bekijkt de **12 werkelijke lokale WebP-bestanden** (hoofdfoto, winter, juveniel, vlucht per soort) individueel en vergelijkt zichtbare kenmerken met de bestaande gidsbronnen en actuele Vogelbescherming-artikelen. Geen nieuwe foto's of artistieke bewerking, geen geslacht afleiden uit broedkleed, geen geforceerde man-/vrouw-/vluchtrollen, en geen persoonlijke gegevens.

**Bronbasis:** vorige onafhankelijke foto-UX-checkpoint PR #176 SHA `d653c5c9398918b41640a68a742c36fa9fad8e05`. Bestaande `main` `5bf67043` en review `21ce9060` blijven ongewijzigd. Deze M12-branch is één schrijver, geen merge of live.

**Belangrijke statusgrens:** `docs/fotokwaliteit/soortaudit-status.json` en `SOORTAUDIT_TRACKER.md` markeren deze drie nog als **NOT TESTED** voor de **volledige aangescherpte soortaudit**. Deze beperkte M12-voorreview mag de officiële teller 100/140 **niet** verhogen: originele iNaturalist-pagina's/licenties, leeftijdscertificering en volledige kennisaudit zijn nog open. Foto's kunnen wel visueel bruikbaar zijn onder §3.3 van `BIRDSPOT_KWALITEITSNORM.md`.

## 2. Twaalf eigen WebP's — feitelijk geopend, per foto beoordeeld

De foto, maker, licentie en bronlocatie in onderstaande tabel zijn overgenomen uit het **huidige Birdspot-register**; zij zijn **geen nieuwe onafhankelijk geverifieerde rechtenverklaring**.

| Soort | Rol in Birdspot | Lokaal bestand | Geregistreerde fotograaf en licentie | Eigen waarneming en kwaliteitsuitkomst |
|---|---|---|---|---|
| Zilverplevier (sp144) | Hoofdfoto | [`sp144.webp`](../../../assets/species/sp144.webp) | William Stephens · CC BY 4.0 | Volledige vogel in contrastrijk broedkleed op kiezelstrand. Zwarte onderzijde, zilvergrijze rug en lichte zijbaan zichtbaar; vogel voldoende herkenbaar, niet de hele foto vullend. |
| Zilverplevier (sp144) | Winterkleed | [`sp144-winter.webp`](../../../assets/species/plumage/sp144-winter.webp) | Shane Austin · CC BY 4.0 | Volledige grijsgespikkelde vogel op keien; lichte buik en forse snavel redelijk zichtbaar. Goede vergelijking met de broedfoto. |
| Zilverplevier (sp144) | Juveniel | [`sp144-juv.webp`](../../../assets/species/plumage/sp144-juv.webp) | Scott Harris · CC BY 4.0 | Volledige jonge-achtig getekende vogel op strand, fijne lichte dekveervlekken; leeftijd nog afhankelijk van oorspronkelijk iNaturalist-bijschrift. |
| Zilverplevier (sp144) | In vlucht | [`sp144-flight.webp`](../../../assets/species/plumage/sp144-flight.webp) | Donald Macauley · CC BY-SA 2.0 | Vrij vliegend, zwarte okselveertjes duidelijk zichtbaar onder de geheven vleugel; contrast met Goudplevier bruikbaar. |
| Goudplevier (sp145) | Hoofdfoto | [`sp145.webp`](../../../assets/species/sp145.webp) | Andrea Battisti · CC BY 4.0 | Grote, scherpe vogel met goudgespikkelde bovenzijde, zwarte onderzijde en witte zijbaan. Foto bevat zichtbaar ingebrand © Andrea Battisti / hybridwildlife.com bovenaan; herkenning bruikbaar, esthetische verbetering wenselijk. |
| Goudplevier (sp145) | Winterkleed | [`sp145-winter.webp`](../../../assets/species/plumage/sp145-winter.webp) | Jonas Kraft · CC BY 4.0 | Bruingoud gespikkelde vogel met lichte buik tussen stenen, volledige vogel zichtbaar; achtergrond is druk en de foto oogt zachter dan de hoofdfoto. |
| Goudplevier (sp145) | Juveniel | [`sp145-juv.webp`](../../../assets/species/plumage/sp145-juv.webp) | Eva Uzdilova · CC BY 4.0 | Volledige vogel op groen gras; grote ingebakken Tsjechische tekst met 'juv.' en datum linksonder. Vogel zelf niet afgedekt; voor premium galerie liever schoon alternatief met herleidbare rechten. |
| Goudplevier (sp145) | In vlucht | [`sp145-flight.webp`](../../../assets/species/plumage/sp145-flight.webp) | Hobbyfotowiki · CC0 | Vrije vlucht van boven/zij, fraaie goudgele bovenvleugel. Witte ondervleugel/okselveren zelf niet zichtbaar; de geregistreerde uitleg is hier expliciet gecorrigeerd. |
| Bontbekplevier (sp146) | Hoofdfoto | [`sp146.webp`](../../../assets/species/sp146.webp) | Charles J. Sharp · CC BY-SA 4.0 | Zeer duidelijk zijaanzicht, complete vogel, zwarte borstband, oranje snavelbasis en poten. Geschikt herkenningsbeeld; geslacht niet apart bewezen. |
| Bontbekplevier (sp146) | Winterkleed | [`sp146-winter.webp`](../../../assets/species/plumage/sp146-winter.webp) | Paulo Caseirito · CC0 | Volledige vogel aan waterlijn in december; donkere borstband blijft vrij sterk. Kalenderdatum bewijst op zichzelf geen individueel winterkleed; origineel bijschrift en leeftijd nog apart controleren. |
| Bontbekplevier (sp146) | Juveniel | [`sp146-juv.webp`](../../../assets/species/plumage/sp146-juv.webp) | Stephen M. · CC BY-SA 4.0 | Bruin getekende vogel met kop- en borstband, volledige vogel bijna geheel zichtbaar; leeftijdsrol aannemelijk volgens registratielabel, origineel leeftijdsbewijs nog te controleren. |
| Bontbekplevier (sp146) | In vlucht | [`sp146-flight.webp`](../../../assets/species/plumage/sp146-flight.webp) | Arnstein Rønning · CC BY-SA 4.0 | Vrij vliegende vogel boven water, volledige vleugels/staart en witte vleugelstrepen zichtbaar; bruikbaar voor onderscheid van Kleine Plevier. |

**Visueel oordeel:** alle twaalf foto's tonen verschillende beelden en bieden bruikbare herkenningsinformatie binnen hun eigen doel; Goudplevier kent duidelijke esthetische verbeterwensen. Een klein afgebeelde vogel is volgens norm §3.3 géén automatische afkeur als de kenmerken zichtbaar blijven. Bij **alle drie** de soorten is het geslacht van deze afbeeldingen **niet onafhankelijk aangetoond**. Geen nieuwe man-/vrouwlabels.

## 3. Bron, determinatie en controleerbaarheid

- **Zilverplevier (Pluvialis squatarola):** groter en grijzer dan Goudplevier; **zwarte okselveren** zijn in vlucht onderscheidend. Die zijn op de lokale vluchtfoto te zien. Bronnen: [Vogelbescherming soortkaart](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zilverplevier) en [vergelijkingsartikel](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-goudplevier-vs-zilverplevier).
- **Goudplevier (Pluvialis apricaria):** goudgespikkelde rug; **witte oksels** volgens bron, maar **niet afleesbaar op de aanwezige, meer dorsale vluchtfoto**. Daarom uitsluitend de foto-toelichting in `assets/species/field-guide-media.json` aangescherpt en met de bijbehorende generator-output `src/features/species/guideMedia.js` gelijkgetrokken. De bestaande vluchtfoto blijft staan. Bronnen: [Vogelbescherming soortkaart](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/goudplevier) en [vergelijkingsartikel](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-goudplevier-vs-zilverplevier).
- **Bontbekplevier (Charadrius hiaticula):** brede borstband, oranje poten en snavelbasis in broedkleed, opvallende **witte vleugelstreep** in vlucht. In de bestaande foto's te zien. Bron: [Vogelbescherming](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bontbekplevier). Individuele `winter`-foto: genomen in december maar zichtbaar vrij contrastrijke koptekening; winterkleed-ID niet enkel uit datum afleiden.

### Oorspronkelijke rechten: wat wel/niet is bewezen

- De twaalf lokale WebP's bevatten volgens de eigen controle verschillende geregistreerde afbeeldingspaden, unieke SHA-256-binaries en unieke bron-URL's. Iedere registratie noemt maker, fotobron, licentie en licentie-URL. **Geen EXIF/XMP-chunks** werden gevonden in de gecontroleerde WebP's.
- De opgegeven originele iNaturalist-fotopagina's waren via de beschikbare externe broncontrole **niet toegankelijk**. De originele licentie, actuele bronmetadata en exacte relatie tussen origineel en getoonde WebP zijn daarom niet onafhankelijk opnieuw bewezen.
- Wikimedia Commons bevat wel aanvullende index-/soortinformatie over de geregistreerde Bontbekplevier-hoofdfoto, maar dat vervangt niet de controle van **elke afzonderlijke oorspronkelijke upload en diens licentiehistorie**.
- Herpublicatierisico blijft OPEN totdat alle relevante originele bestandspagina's, auteursvoorwaarden, eventuele ShareAlike-bepalingen en vereiste credits aan de volledige pagina zijn getoetst. Geen bron/licentieclaim promoveren door alleen een gevuld JSON-veld.

## 4. Concrete verbeterwensen en open posities

1. **Goudplevier-hoofdfoto:** zichtbaar fotografenwatermerk in de foto. Beeld bruikbaar voor herkenning, maar voor de gewenste premium-ervaring een schoner alternatief met bewezen rechten zoeken. **Niet** stil bijsnijden om ©-markering te verwijderen; zorg altijd voor correcte attributie.
2. **Goudplevier-juveniel:** grote tekst-overlay linksonder. Vogel wordt niet afgedekt, maar een nieuwe bron- en leeftijdsgeverifieerde foto zonder tekst heeft voorkeur.
3. **Goudplevier-vlucht:** een aanvullend, echt vrij vliegend **ondervleugelbeeld** zoeken waarop de **witte oksels zichtbaar** zijn. De bestaande vluchtfoto is correct qua vlieghouding, maar bewijst dit doorslaggevende kenmerk niet.
4. **Bontbekplevier-winterkleed:** bronbijschrift en aantoonbaar kleed apart controleren; een decemberopname alleen is onvoldoende bewijs van alle leeftijds-/kleedkenmerken.
5. **Geslacht:** man/vrouw-portretten ontbreken als **zeker** geïdentificeerde geslachtsbeelden bij deze drie; geen fictieve rol vullen. De `breeding.reuseGuidePhoto`-verwijzing toont de hoofdfoto niet dubbel; `winter` en `juv` leveren twee verschillende fotografische rollen.
6. **Onafhankelijke vogel- en rechtenaudit:** bronidentiteit, individuele juvenielenleeftijd, de 9 eindcriteria van de aangescherpte audit, 2-uitgevers-onderbouwing voor eventuele maatcorrecties en een echte toestelreview blijven OPEN.

## 5. Technische checks en foutgeschiedenis

- Nieuwe `tests/test_m12_plover_source_roles.py` test op precies drie soorten: 12 originele **lokale WebP-binaries**, unieke paden/hashes, foto-metadata, geen EXIF/XMP, gerelateerde rolvelden, echte twee-foto-vergelijking op 390px, afzonderlijke decodeerbare vluchtfoto en geen horizontale overflow. Dit is **browser-/assetcontrole**, geen bewijs van licentiepermissie.
- Eerste gerichte M12-run ontdekte **testfout**: het script verwachtte winter vóór juveniel, maar Birdspot's vaste volgorde is **Juveniel vóór Winterkleed**. De originele app bleef gelijk; de test werd aan het productcontract aangepast en herbeproefd.
- Na de ene Goudplevier-toelichtingswijziging faalden brede checks omdat `guideMedia.js` nog afweek van het bronregister. De gegeneerde JavaScript-kopie is afzonderlijk **op dezelfde eigen branch** bijgewerkt. Nieuwe hertest op exacte SHA is vereist om broncode/manifest overeen te laten komen.
- **CI-uitkomst per finale SHA:** controleer de actuele GitHub-workflowresultaten onder PR #177 en rapporteer de uitkomst van M12 plus alle opnieuw getriggerde regressies. Geen voorbarig technisch PASS in dit rapport.
- De huidige ontwikkelbranch gebruikt nog niet-gepubliceerde cacheversie **1.27.7**. Voor een toekomstige geïntegreerde release is een **nieuwe unieke cacheversie en 1.27.7→nieuw-upgradegate** verplicht.

## 6. Herstel, kosten en kennisdelta

**Laatst bewezen oud checkpoint:** PR #176 `d653c5c9398918b41640a68a742c36fa9fad8e05`; bestaande v1.27.7-releasekandidaat PR #171 `83c117447126b705cae1899f71e66d070a6084b9`. Bij falende M12-branch: eigen concept-PR sluiten, hercontroleer de exacte HEAD; main/review ongewijzigd. Geen automatische mediadownload, -verwijdering of user-datareset. 

**Kostenregister:** alleen bestaande GitHub Actions en Playwright; feitelijke kosten, minuten en limieten UNKNOWN. Eén batch van drie soorten, geen betaalde bron. **Kennisdelta:** extra onderscheid tussen *waar determinatiekenmerk* en *wat op de gekozen gidsfoto werkelijk zichtbaar is*, plus correcte bron→generator-continuïteit, valt onder bestaande L-019/L-062 en CAP-BIRD-012/015; geen nieuwe generieke norm of aparte capability.

**Eindstatus:** FOTO'S VISUEEL BEOORDEELD / BRONRECHTEN PARTIALLY TESTED / VOLLEDIGE SOORTAUDIT NOT TESTED / FYSIEK ANDROID NOT TESTED / PRODUCTIE NO-GO.
