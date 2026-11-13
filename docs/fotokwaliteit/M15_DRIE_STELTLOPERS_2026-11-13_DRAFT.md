# Birdspot Library — M15 onafhankelijke fotoinspectie, drie soorten

**Datum:** 13 november 2026  
**Status:** DRAFT / PARTIALLY TESTED — alleen-lezen fotoinspectie; **geen** inhoudelijke, rechten-, CI-, toestellen- of release-PASS  
**Soorten:** `sp155` Oeverloper (*Actitis hypoleucos*); `sp156` Witgat (*Tringa ochropus*); `sp217` Poelruiter (*Tringa stagnatilis*)  
**Bronrepository:** `saddamsmit-source/Birdspot-Library`  
**Exact geïnspecteerde SHA:** `ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026` (PR #179, concept, open; M15 nog niet geïmplementeerd)  
**Laatste bewezen hoofdbranch:** `main 5bf67043e830e977749f0ee593cf9f41f0e2822b`.  
**Actuele telling vóór M15:** F1 108/140; canonieke negenpunts-audit 100/140. **Deze DRAFT verandert beide tellingen niet.**

## 1. Onderzoeksaanpak, bewijsgrens en norm

- De **12 werkelijk gebruikte Birdspot-WebP's** zijn vanaf de exacte PR-head met de GitHub-connector als bestand geopend en visueel bekeken. Niet slechts thumbnails, titels of bestandenlijsten.
- De actuele `assets/species/credits.json` en `assets/species/field-guide-media.json` zijn voor alle twaalf posities gelezen. Elk van de 12 beeldbestanden heeft een **andere Git-blob-SHA**, en de beelden zijn zichtbaar van elkaar verschillend. Dit bewijst **niet** dat upstream-originelen en crops nooit gelijk zijn; daarvoor is bronbeeldhash plus perceptuele controle nodig.
- De geregistreerde iNaturalist- en Wikimedia Commons-bestandspagina's waren via de beschikbare externe bronbrowser **niet volledig toegankelijk**. Geregistreerde maker/licentie ≠ onafhankelijke vaststelling van actuele rechten, bestandversie of individuele leeftijd.
- Soortkenmerken zijn getoetst aan drie rechtstreeks gelezen Vogelbescherming-soortpagina's. Deze onafhankelijke ornithologische **soortbeschrijvingen** ondersteunen herkenning van de soort, maar bewijzen geen identiteit of leeftijd van het individuele oorspronkelijke bestand.
- De vastgestelde norm [`docs/BIRDSPOT_KWALITEITSNORM.md`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/docs/BIRDSPOT_KWALITEITSNORM.md) vereist één bronvaste foto per rol, werkelijke vlucht en géén verzonnen man/vrouw-labels. Bij nauwelijks te onderscheiden geslachten hoort een neutrale aanduiding. **Vier werkelijk verschillende, voorlopig bruikbare foto's zijn beter dan vijf kunstmatig gelabelde of dubbele foto's.**

## 2. Bevindingen per soort en beeld

De links hieronder openen de **werkelijke lokale Birdspot-image** op de onderzochte SHA. Vermelde originele bronnen/licenties komen uit de **appregistratie**, niet uit een nieuwe onafhankelijke originele-licentiecontrole.

### 2.1 Oeverloper · sp155 · *Actitis hypoleucos*

| Rol | Birdspot-bestand | Geregistreerde originele bron / licentie | Eigen visuele inspectie en volgende actie |
|---|---|---|---|
| Hoofdfoto | [`sp155.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/sp155.webp) | [iNaturalist 56953995](https://www.inaturalist.org/photos/56953995); Константин Селивёрстов; CC BY 4.0 | **SOORTBEELD PLAUSIBEL / ESTHETISCHE WENS:** duidelijke gehele vogel, witte inkeping langs borst bij vleugelboeg, middellange rechte snavel, bruine bovenzijde. Zichtbaar ingebakken cursief fotografenwatermerk linksonder. Niet automatisch verwijderen; eerst rechtmatig alternatief controleren. |
| Winterkleed | [`sp155-winter.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp155-winter.webp) | [iNaturalist 617218276](https://www.inaturalist.org/photos/617218276); rashidchan; CC BY 4.0 | **GOEDE DETAILKWALITEIT:** grote herkenbare vogel en duidelijke witte borstinkeping. Individuele winterkleed-datering alleen uit geregistreerde waarneming, nog niet onafhankelijk bevestigd. |
| Juveniel | [`sp155-juv.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp155-juv.webp) | [iNaturalist 85106472](https://www.inaturalist.org/photos/85106472); Дарья Орлова; CC BY 4.0 | **VOORWAARDELIJK VOOR LEEFTIJD:** volledige vogel aanwezig; klein beeld, subtiele juveniele vleugelveren en eventuele leeftijdsmarkeringen zijn onvoldoende overtuigend voor onafhankelijke leeftijdsclaim. Betere bevestiging/beeld wenselijk. |
| In vlucht | [`sp155-flight.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp155-flight.webp) | [Commons NZ7 7499](https://commons.wikimedia.org/wiki/File:NZ7_7499_(52887647148).jpg); Bengt Nyman; CC BY-SA 2.0 | **VISUEEL ECHTE VLUCHT:** vrij vliegende vogel, volledige vleugel met duidelijke witte streep; geschikt als herkenningsbeeld. Werkelijke originele licentiehistorie nog open. Geen mannetjesclaim. |

**Vergelijking:** korte poten, wit dat bij de zijborst omhoogloopt en de witte vleugelstreep ondersteunen Oeverloper versus Witgat/Bosruiter. Bron: [Vogelbescherming — Oeverloper](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/oeverloper).

### 2.2 Witgat · sp156 · *Tringa ochropus*

| Rol | Birdspot-bestand | Geregistreerde originele bron / licentie | Eigen visuele inspectie en volgende actie |
|---|---|---|---|
| Hoofdfoto | [`sp156.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/sp156.webp) | [iNaturalist 246109837](https://www.inaturalist.org/photos/246109837); Daniel Benák; CC BY 4.0 | **SOORTBEELD PLAUSIBEL:** donkere bovenzijde met lichte spikkels, opvallende oogring, witte buik. Vogel relatief klein maar herkenbaar. Klein in beeld is volgens norm geen automatische afkeur. |
| Winterkleed | [`sp156-winter.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp156-winter.webp) | [iNaturalist 604589887](https://www.inaturalist.org/photos/604589887); Paulo Caseirito; CC0 | **GOEDE HERKENNINGSFOTO:** close-up, donkere bovenzijde, grote witte buik en donkere oogring; registratie noemt december/Portugal maar individueel winterkleed nog apart bevestigen. |
| Juveniel | [`sp156-juv.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp156-juv.webp) | [iNaturalist 556521052](https://www.inaturalist.org/photos/556521052); Dominic Best; CC0 | **BELANGRIJK GAT:** slechts 371×197 px volgens bronregister; zeer onscherp/silhouetachtig. De zichtbare vogel laat juveniele veertekening en zeker leeftijdsverschil niet betrouwbaar beoordelen. Niet als onafhankelijke juvenielen-verificatie markeren; zoek een scherpere bronbevestigde foto, behoud huidige bron tot veilige vervanging. |
| In vlucht | [`sp156-flight.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp156-flight.webp) | [Commons Green sandpiper flying](https://commons.wikimedia.org/wiki/File:Green_sandpiper_flying.jpg); Prasan Shrestha; CC BY-SA 4.0 | **STERK VLUCHTBEELD:** uitgespreide donkere vleugels plus grote witte stuit/staartbasis, precies de relevante herkenningskenmerken. Geen geslachtsclaim. Originele licentie en exacte bronbeeldmatch open. |

**Vergelijking:** witte stuit in combinatie met donkere ondervleugels helpt Witgat te onderscheiden van Bosruiter; laat een dergelijk contrast op de vergelijkingskaart nadrukkelijk zichtbaar. Bron: [Vogelbescherming — Witgat](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/witgat).

### 2.3 Poelruiter · sp217 · *Tringa stagnatilis*

| Rol | Birdspot-bestand | Geregistreerde originele bron / licentie | Eigen visuele inspectie en volgende actie |
|---|---|---|---|
| Hoofdfoto | [`sp217.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/sp217.webp) | [iNaturalist 103339289](https://www.inaturalist.org/photos/103339289); Вячеслав Юсупов; CC BY 4.0 | **SOORTBEELD PLAUSIBEL:** fijne rechte snavel, slanke bouw, redelijk zichtbare lange poten; twijg door achtergrond en voorgrond maar vogel goed te volgen. Kwaliteit bruikbaar. |
| Winterkleed | [`sp217-winter.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp217-winter.webp) | [iNaturalist 246809118](https://www.inaturalist.org/photos/246809118); Marian Read; CC0 | **GOED BEELD:** bleke bovenzijde, fijne rechte naaldvormige snavel, lange poten, volledig herkenbaar. Externe foto-individuele leeftijd en kleeddatum nog controleren. |
| Juveniel | [`sp217-juv.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp217-juv.webp) | [iNaturalist 28427341](https://www.inaturalist.org/photos/28427341); Вячеслав Юсупов; CC BY 4.0 | **BRUIKBAAR ALS BEELD:** licht gerande veren zichtbaar, slanke vogel. Niet automatisch bewezen juveniel zonder oorspronkelijke waarnemingsannotatie/verificatie. |
| In vlucht | [`sp217-flight.webp`](https://github.com/saddamsmit-source/Birdspot-Library/blob/ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026/assets/species/plumage/sp217-flight.webp) | [Commons Marsh Sandpiper](https://commons.wikimedia.org/wiki/File:Marsh_Sandpiper_(Tringa_stagnatilis)_(8079446361).jpg); Ron Knight; CC BY 2.0 | **VISUEEL ECHTE VLUCHT:** vogel vrij in lucht, lange uitstekende poten, dunne snavel en lichte rugwig. De individuele originele beeld- en rechtenmatch blijft nog open. |

**Vergelijking:** ten opzichte van Groenpootruiter: slankere bouw, langere poten in verhouding en zeer dunne niet-opgewipte snavel. Bron: [Vogelbescherming — Poelruiter](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/poelruiter).

## 3. Register- en UI-check in deze onafhankelijke ronde

- **12/12 exacte huidige WebP's** vanuit GitHub ontvangen en daadwerkelijk geopend: 4 per soort. Alle 12 zijn visueel verschillend en elk bestand heeft een andere Git-blob-SHA. Een bronpagina of blob-SHA is **geen** bewijs van perceptuele uniciteit tegen externe crops of originele fotoversies.
- Voor elk van deze soorten bevat de registratie **hoofdfoto + winterkleed + juveniel + één echte vluchtfoto**. De `breeding.reuseGuidePhoto`-relatie verwijst naar bestaande hoofdmedia, niet naar een tweede onafhankelijk beeld.
- **Man/vrouw**: de gecontroleerde huidige bestanden bevatten **geen onafhankelijk bevestigd afzonderlijk geslachtslabel**; de kwaliteitsnorm verbiedt die te verzinnen. Geen kunstmatige vijfde foto toevoegen.
- **Niet uitgevoerd in deze ronde:** opstarten van de echte Birdspot-UI, zoomviewer, 320/360/390px vergelijking, keyboard, Playwright, CI, PWA, Android, herstel/backup en serviceworker-update. Dit is uitsluitend asset- en secundaire soortbronneninspectie. Geen claim van browser-PASS.
- **Niet uitgevoerd / door bronbeperking geblokkeerd:** oorspronkelijke iNaturalist- en Commons-uploadbestanden rechtstreeks ophalen, binaire hash-match tegen origineel, actuele licentiehistorie, officiële individuele leeftijds-/geslachtsannotaties, zelfstandig primair kennisprofiel en volledige negenpunts-audit.

## 4. Advies voor M15-implementatie en tests

1. Maak **alleen op een eigen featurebranch** vanaf exact gecontroleerde PR #179-head een kleine M15-PR, nadat een eventuele andere writer op die branch uitgesloten is. Voorkom stale-base en dubbele uitvoering.
2. Vergelijk de 12 bron-URL's en per-bestand geregistreerde CC-licenties met de werkelijk originele Commons-/iNaturalist-bestandspagina zodra ze toegankelijk zijn. Verwerp niet-verifieerbare leeftijdsclaims; laat die OPEN.
3. Voer een kleine, herhaalbare Python/Node/WebP + Playwright-controle uit op 360/390 px, inclusief exacte bronrollen, status van fotozoom/teruggaan, hoofdbeeld, echte vlucht, deduplicatie en soortvergelijkingen. Zorg dat harde teller-asserties uit oudere M14-tests **niet stukgaan** wanneer F1 wordt uitgebreid; generaliseer de telinvariant vóór toevoeging van M15.
4. Zodra een M15-test op een exacte SHA groen is en dit verslag binnen de repo staat, voeg deze drie **als F1 PARTIALLY TESTED** toe aan `docs/fotokwaliteit/F1_VOORTGANG_TOT_140.json` en controleer **111/140 F1, 29 nog zonder eerste beoordeling**, terwijl canoniek **100/140** blijft. Nooit volledige F2- of rechten-PASS afleiden.
5. Bewaar de huidige foto's; zoek vervanging eerst voor de onscherpe Witgat-juveniel, daarna indien geschikt een beter Oeverloper-juveniel of watermarkvrije hero. Gebruik geen ongetoetste iNaturalist/Commons-foto's en geen dubbele/crop-varianten.
6. **Geen merge, GitHub Pages, Vercel of livegang** zonder eigenaarbesluit. Geen volledige publicatiecontrole geclaimd.

## 5. Signaal, risico, checkpoint

**Signaal:** de originele fotopagina's blijven in deze runtime ontoegankelijk en de bestaande M14-CI-test heeft hardcoded F1-totalen van 108/140.  
**Risico:** onterecht licentie- of leeftijds-PASS, plus een CI-regressie door het simpel verhogen van de F1-teller.  
**Maatregel:** status scheiden, bronbewijs open laten, F1 pas na tests veranderen en de 12 huidige media behouden.  
**Laatst bewezen remote checkpoint:** PR #179, head `ca6e5c5e1d2ebe6ab6864a0c82d4784ff9ebb026`; M14 2/2 geregistreerde workflowruns `completed/success`. `main` `5bf67043`, ongewijzigd.  
**Herstelroute:** deze inspectie is read-only; de remote repository is niet gewijzigd. Start vervolg opnieuw read-only op de bewezen head; update niets vanaf een onbekende of verouderde basis.

## 6. Leerpunten en overdracht

**WEL:** binaire Birdspot-beelden zelf zien, versievaste media- en creditregistratie vergelijken, individueel herkenbare kenmerken toetsen aan Vogelbescherming, ontbrekende kennis en originelen expliciet open laten.  
**NIET:** vijf rollen forceren zonder seksebewijs, een wazige juvenielfoto als bevestigd bestempelen, de officiële soortaudit optellen bij ongeteste F1, of upstream-licenties uit bronmetadata als onafhankelijk bewezen rapporteren.  
**Vervolg:** M15-implementatie/test of volledig brononderzoek via een omgeving die de originele bestanden wel kan openen. Alleen hierna een nieuwe F1-checkpoint voortgang claimen.  
**Independence-grens:** ChatGPT heeft de twaalf daadwerkelijke, huidige Birdspot WebP's onafhankelijk visueel bekeken; geen onafhankelijke ornitholoog, juridische licentiecontrole of fysiek toestel.  

**Einde DRAFT.**