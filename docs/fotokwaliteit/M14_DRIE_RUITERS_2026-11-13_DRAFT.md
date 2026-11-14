# Birdspot M14 · eerste beoordeling van drie ruiters

**Datum:** 13 november 2026 · **Document:** DRAFT / FIRST PASS (PARTIALLY TESTED) · **Fysieke Android-pilot:** NOT TESTED · **Live:** NO-GO.

**Scope:** `sp157` Zwarte Ruiter, `sp158` Groenpootruiter, `sp159` Bosruiter — precies **drie soorten**, vier reeds opgeslagen foto's per soort. **Base:** PR #178 `07e3ffe513a0ed097b1b85e15dc783af96c46858`. Geen wijzigingen aan bestaande foto-, audiobestanden, soortidentificatie, individuele sekse-/leeftijdslabels of credits.

## 1. Volgorde volgens eigenaarbesluit

1. Eerst de huidige **140 soorten met gidsfoto's** in kleine batches een eerlijke eerste beoordeling geven, met onopgeloste bron-, leeftijd-, kennis- en fotokwaliteitsvragen expliciet genoteerd.
2. Zodra alle 140 een eerste beoordeling hebben: **alle 140 opnieuw volledig verifiëren**, foto voor foto, kennisclaim voor kennisclaim, inclusief original-license-historie, geslacht/leeftijd, echte vlucht, vergelijkingen, biometrie, ontbrekende foto's en herstelbaarheids-/browserbewijs.
3. Pas ná die complete tweede fase de nog niet behandelde soorten buiten deze 140 oppakken. Geen automatische uitbreiding, merge of publicatie.

De canonieke aangescherpte `soortaudit-status.json` blijft op **100/140 geauditeerd (15 VERIFIED, 85 PARTIALLY TESTED) en 40 nog NOT TESTED**. Dit is bewust **niet gelijk aan** de nieuwe, afzonderlijk bijgehouden *eerste-beoordeling-voortgang*. Het eerste-beoordelingregister `F1_VOORTGANG_TOT_140.json` telt 100 reeds in het canonieke register behandelde soorten plus 5 uit M12/M13 en deze 3 uit M14 = **108/140** zodra deze batch is vastgelegd; dus **32 nog te behandelen** vóór de volledige tweede controle. Het register promoot geen oorspronkelijke rechten, kennisprofielen of officiële VERIFIED-status.

## 2. Visuele beoordeling van de twaalf bestaande WebP's

Alle onderstaande originele **lokale Birdspot-bestanden zijn daadwerkelijk individueel geopend**. Oordelen betreffen herkenbaarheid van wat op de lokale beelden zichtbaar is. Zelfs een herkenbare vogel met een bestaand juveniellabel is daarmee niet onafhankelijk op exacte leeftijd bevestigd.

| Soort | Rol | Lokaal Birdspot-beeld | Wat daadwerkelijk zichtbaar is | Uitkomst eerste beeldbeoordeling |
|---|---|---|---|---|
| Zwarte Ruiter (`sp157`) | Hoofdfoto / broedkleed | [`sp157.webp`](../../assets/species/sp157.webp) | Donkere, vrijwel roetzwarte vogel met witte spikkels op de vleugeldekveren; volledige zijaanblik, snavel scherp en poten deels tussen vegetatie. | GOED · soort/rol visueel passend |
| Zwarte Ruiter (`sp157`) | Winterkleed | [`sp157-winter.webp`](../../assets/species/plumage/sp157-winter.webp) | Lichte grijswitte borst en buik, witte wenkbrauw, lange fijne snavel met rood aan de basis en rood-oranje poot; vogel duidelijk herkenbaar. | GOED · precieze leeftijd open |
| Zwarte Ruiter (`sp157`) | Juveniel | [`sp157-juv.webp`](../../assets/species/plumage/sp157-juv.webp) | Donkere fijn gebandeerde borst en flanken, lang fijn snavelprofiel en rode poot; zichtbare kenmerken ondersteunen een jong kleed, oorspronkelijke leeftijdsaanduiding niet onafhankelijk geverifieerd. | BRUIKBAAR · juvenielenleeftijd open |
| Zwarte Ruiter (`sp157`) | In vlucht | [`sp157-flight.webp`](../../assets/species/plumage/sp157-flight.webp) | Vrij boven water vliegende vogel met lange vleugels en een opvallende witte rug-/stuitpartij, donkere kop en lange snavel; ruim voldoende herkenning. | GOED · vrije vlucht zichtbaar |
| Groenpootruiter (`sp158`) | Hoofdfoto / broedkleed | [`sp158.webp`](../../assets/species/sp158.webp) | Vrijstaande vogel met lange grijsgroene poten, donkerder rugtekening en stevige snavel die licht opgewipt lijkt; kop en bouw herkenbaar. | GOED · vorm herkenbaar |
| Groenpootruiter (`sp158`) | Winterkleed | [`sp158-winter.webp`](../../assets/species/plumage/sp158-winter.webp) | Volledige vogel met lichte kop/onderzijde en groenachtige poten, snavel vrij in beeld. Zichtbaar © Joseph Morlan-watermerk rechtsonder: laten staan; premium alternatief wenselijk. | GOED · watermerk als verbeterwens |
| Groenpootruiter (`sp158`) | Juveniel / eerstejaars | [`sp158-juv.webp`](../../assets/species/plumage/sp158-juv.webp) | Zittende vogel op ondiep water met zichtbare bruinachtige vleugeldekveren en lichte randen; poten zijn op dit beeld niet te beoordelen. Leeftijd berust op geregistreerde annotatie, geen eigen tweede bron. | VOORWAARDELIJK voor volledige herkenning · poten niet zichtbaar |
| Groenpootruiter (`sp158`) | In vlucht | [`sp158-flight.webp`](../../assets/species/plumage/sp158-flight.webp) | Bovenzij-/zijaanzicht van een echt vrij vliegende vogel met uitgespreide vleugels, lange snavel en achter de staart uitstekende poten; volledige vogel herkenbaar. | GOED · vrije vlucht zichtbaar |
| Bosruiter (`sp159`) | Hoofdfoto / broedkleed | [`sp159.webp`](../../assets/species/sp159.webp) | Vrij scherpe vogel met sterk wit gevlekte donkere rug, borststreepjes en relatief dunne snavel; staat op sparrentakken. Duidelijke soortkenmerken, maar atypische achtergrond. | GOED · bruikbare bestaande foto |
| Bosruiter (`sp159`) | Winterkleed | [`sp159-winter.webp`](../../assets/species/plumage/sp159-winter.webp) | Groot en duidelijk zijaanzicht van grijzebruin gevlekte vogel, lichtere onderzijde en lange geelachtige poten op natte oever. | GOED · juiste vergelijkingshoek |
| Bosruiter (`sp159`) | Juveniel | [`sp159-juv.webp`](../../assets/species/plumage/sp159-juv.webp) | Slank vogeltje op slikrand met duidelijk beige veerranden, lange wenkbrauw en gele poten; beeld is beduidend zachter en de vogel neemt weinig oppervlak in. | BRUIKBAAR · scherper alternatief wenselijk en leeftijd open |
| Bosruiter (`sp159`) | In vlucht | [`sp159-flight.webp`](../../assets/species/plumage/sp159-flight.webp) | Echte vrije vlucht, lichte gevlekte ondervleugel en geelachtige poten achter lichaam; goed onderscheid met Witgat met donkerdere ondervleugel. | GOED · vrije vlucht zichtbaar |

**Controlegrenzen:** alle drie hebben een bestaande `breeding.reuseGuidePhoto` die verwijst naar de hoofdfoto en **geen tweede onafhankelijke rol-foto toevoegt**; `Juveniel` en `Winterkleed` zijn wél eigen beelden. Hun bestaande vluchtbeelden tonen daadwerkelijke vrije vlucht. Geen geslacht van een individuele vogel uit alleen een onverschillend kleed afgeleid. **Duidelijk in beeld is geen automatische publicatierechten-PASS.**

## 3. Oorspronkelijke bronregistratie en rechten

Deze tabel bevat de **reeds in Birdspot vermelde** fotopagina's, auteur, licentie en licentie-URL. De originele iNaturalist-fotopagina's waren via de huidige bronbrowser niet rechtstreeks toegankelijk. Ook de twee Commons-bestandspagina's konden niet op volledige huidige licentiegeschiedenis worden geopend. Daarom zijn actuele bronlicenties en directe originele beeldidentiteit **niet onafhankelijk opnieuw VERIFIED**. Registratie ≠ toestemming voor herpublicatie.

| Soort | Positie | Geregistreerde originele bron | Geregistreerde maker/licentie |
|---|---|---|---|
| Zwarte Ruiter | Hoofdfoto / broedkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/121189174) | Jan Ebr & Ivana Ebrová · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Zwarte Ruiter | Winterkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/603401014) | Cameron Findlay · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Zwarte Ruiter | Juveniel | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/722959312) | Phil James · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Zwarte Ruiter | In vlucht | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/711147296) | Barry Stewart · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Groenpootruiter | Hoofdfoto / broedkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/198450766) | Pål A. Olsvik · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Groenpootruiter | Winterkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/475334386) | Joseph Morlan · CC BY-SA 4.0 · [licentie-URL](https://creativecommons.org/licenses/by-sa/4.0/) |
| Groenpootruiter | Juveniel / eerstejaars | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/168627338) | Se Lena · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Groenpootruiter | In vlucht | [Oorspronkelijke geregistreerde fotopagina](https://commons.wikimedia.org/wiki/File:The_Common_Greenshank.jpg) | Prasan Shrestha · CC BY-SA 4.0 · [licentie-URL](https://creativecommons.org/licenses/by-sa/4.0/) |
| Bosruiter | Hoofdfoto / broedkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/121189166) | Jan Ebr & Ivana Ebrová · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Bosruiter | Winterkleed | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/365421308) | Afsar Nayakkan · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Bosruiter | Juveniel | [Oorspronkelijke geregistreerde fotopagina](https://www.inaturalist.org/photos/555542627) | Ian Ballam · CC BY 4.0 · [licentie-URL](https://creativecommons.org/licenses/by/4.0/) |
| Bosruiter | In vlucht | [Oorspronkelijke geregistreerde fotopagina](https://commons.wikimedia.org/wiki/File:Wood_Sandpiper_(Tringa_glareola)_(53879706937),_crop.jpg) | Birds of Gilgit-Baltistan · CC BY-SA 2.0 · [licentie-URL](https://creativecommons.org/licenses/by-sa/2.0/) |

De twaalf WebP's worden daarnaast automatisch gecontroleerd op geldige RIFF/WebP-structuur, unieke binaire inhoud en origineel-bron-URL, ontbreken van EXIF/XMP-chunks, bestaande rolmetadata en geen duplicatie van het hoofdfotobestand in de kleedgalerij. **SHA-256-uniciteit bewijst geen perceptuele niet-dubbelheid of de match met het originele uploadbeeld.**

## 4. Determinatieverschillen (overkoepelende soortbronnen)

| Soort | Goed onderbouwde kenmerken | Vergelijking |
|---|---|---|
| Zwarte Ruiter | Vrijwel zwart broedkleed, witte rugwig in vlucht, lange fijne deels rode snavel en rode poten buiten prachtkleed | Versus **Tureluur**: die heeft een opvallende witte vleugelachterrand, die bij Zwarte Ruiter ontbreekt |
| Groenpootruiter | Relatief forse bouw, groengrijze poten, stevige licht opgewipte snavel, witte rugwig in vlucht | Versus **Poelruiter**: duidelijk fijnere en rechtere snavel, slankere bouw |
| Bosruiter | Lange lichte wenkbrauw, geelgroene poten, lichtgevlekte bovenzijde en lichte ondervleugel | Versus **Witgat**: ondervleugel van Witgat donkerder en contrastrijkere witte stuit |

**Onafhankelijke soortenbronnen:** [Vogelbescherming Zwarte Ruiter](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zwarte-ruiter), [Groenpootruiter](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/groenpootruiter), [Bosruiter](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/bosruiter) en [Witgat](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/witgat). Waar relevant aanvullend ondersteund door Vogelwacht Uden en Vogelskijken. **Dit zijn algemene soortbeschrijvingen, niet bewijs voor de determinatie van de concrete originele foto's.**

## 5. Onzekerheden, ontbrekende rollen en verbeterwensen

### Zwarte Ruiter (`sp157`)

**Ontbreekt of onzeker:** Geen nieuw seksueel rolbeeld; man/vrouw niet uit dit fotomateriaal bewezen.

- Origineel iNaturalist-bewijs van kleedleeftijd (juv/winter) en licentie per foto opnieuw controleren.
- Vergelijking met Tureluur: witte vleugelachterrand bij Tureluur ontbreekt bij Zwarte Ruiter; niet op elk stilstaand beeld aantoonbaar.

### Groenpootruiter (`sp158`)

**Ontbreekt of onzeker:** Geen afzonderlijk bewezen mannetjes- of vrouwtjesportret.

- Geregistreerd label 'juveniel/eerstejaars' uit originele waarneming onafhankelijk bevestigen.
- Echte poten/snavelvorm bij juveniel vergelijken met Poelruiter; huidige foto toont poten niet.
- De watermerktekst van Joseph Morlan niet verwijderen of onzichtbaar maken; controleer oorspronkelijke gebruikersvoorwaarden.

### Bosruiter (`sp159`)

**Ontbreekt of onzeker:** Geen zeker op geslacht geïdentificeerde aparte man/vrouwfoto's.

- Originele bronnotitie bij juveniel en alle actuele iNaturalist-licenties verifiëren.
- Leg bij herkenningsvergelijking met Witgat uit dat bruine rugvlekjes op zichzelf niet doorslaggevend zijn.

### Collectiebrede gaten van deze drie soorten

- `tools/kennisbaseline/knowledge.json` heeft **voor geen van deze drie soorten een volledig kennisprofiel**; uitgebreide inhouds- en 2-uitgeverscontrole is nadrukkelijk onderdeel van de *latere tweede verificatie*, niet fictief PASS.
- Er zijn **geen betrouwbaar onafhankelijk gedetermineerde aparte mannetje- en vrouwtjesportretten** voor deze drie; geen herlabeling op basis van het broedkleed. Het ontbreken blijft OPEN.
- Indien de geregistreerde juvenielenleeftijd of fotolicentie niet uit de originele bron bevestigd kan worden, behoud de bestaande foto en registreer `REVIEW REQUIRED` / `PARTIALLY TESTED`; zoek niet automatisch een willekeurige vervanging om een slot te vullen.
- Echte Android/PWA-/offline update-/tweede-toestelrestore blijven buiten deze batch; bestaande browser-CI bewijst geen fysieke telefoon.
- Eventuele aandachtspunten in de oorspronkelijke data van de drie gidskaarten blijven eerst in het auditrapport; geen stille massa-update van 597 soortregels.

## 6. QA en bewijsverwachting

- **Nieuwe code:** `tests/test_m14_three_waders_first_pass.py` en `.github/workflows/m14-three-waders-qa.yml`. Validator controleert de eerste-beoordelingteller, 12 bestaande WebP-binaries, metadata en rol-onderscheid en de echte Android-breedte 360/390px in Chromium; alle drie vluchtfoto's en de aanwezige vergelijking met Tureluur, Poelruiter of Witgat moeten decodeerbaar/bereikbaar zijn. Fotozoom via toetsenbord en geen horizontale overflow.
- **Geen appcode of nieuwe vogelmedia:** uitsluitend registratiedocumenten en tests op de eigen QA-branch. Bestaande eerdere regressies blijven geldig voor hun oorspronkelijke commit. De nieuwe CI krijgt zijn eigen te bewijzen HEAD.
- **Bewijscategorieën:** visuele lokale review (deze ronde); technische CI (af te wachten); oorspronkelijke bronlicenties (NOT TESTED); onafhankelijke individuele leeftijd/geslacht (NOT TESTED); volledig kennisprofiel (NOT TESTED); gehele 9-punts soortaudit (NOT TESTED); Android hardware (NOT TESTED).
- **Risico bij batches:** GitHub Action onbedoeld meerdere brede runs, lange gestapelde PR's, generator/broncode-divergentie of gewijzigde HEAD. Bewaar één exacte SHA en log, stop bij write-conflict. Geen uitgaven of nieuwe betaalde tools.

## 7. Checkpoint / herstel / kennisdelta

**Vóór deze ronde laatst bewezen:** PR #178 `07e3ffe513a0ed097b1b85e15dc783af96c46858` (M13 technische CI PASS; document-only head). De M14-PR is zelfstandig sluitbaar; er worden geen gegevens op `main`, publieke preview of oude PR's geschreven. Fallback = concept-PR sluiten en terug naar #178. Er bestaat geen behoefte aan een app-/user-datamigratie of media-rollback.

**Wat wel werkt:** kleine batch, twaalf daadwerkelijke foto's afzonderlijk bekeken, rollen/pose niet automatisch uit bestandsnamen afgeleid, bestaande soortgids gebruikt voor determinatie. **Wat nog niet werkt/bewijs mist:** oorspronkelijke herpublicatierechten en leeftijdsetiketten konden niet per bron worden bevestigd; de volledige kennisprofielen ontbreken. **Oorzaak:** bronnen niet rechtstreeks toegankelijk en latere fase expliciet nog niet gestart. **Preventie:** aparte fase-1-voortgang, bron-evidence niet inflateren, tweede audit na 140. Hergebruik de bestaande Birdspot kwaliteitsnorm §1–§4 en CAP-BIRD-012/015; geen nieuwe algemene normbron.

**Kosten:** bestaande GitHub en Playwright; werkelijk verbruik, limieten en kosten UNKNOWN. 
**Eindoordeel voor deze fase:** FIRST PASS geregistreerd met openstaande punten; **geen enkele soort in deze batch als volledige VERIFIED geclaimd**. Document-DRAFT ≠ app-release-PASS.
