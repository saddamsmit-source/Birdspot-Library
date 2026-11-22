# Birdspot F3-R43 · eerste inhoudscontrole

22 november 2026 · **PARTIALLY TESTED** · [concept-PR #345](https://github.com/saddamsmit-source/Birdspot-Library/pull/345) · **RELEASE HOLD**

## Eigenaarbesluit en werkbasis

De eigenaar koos op 22 november optie C voor de gemelde R42-punten over Zwarte Mees `sp174`, Grauwe Vliegenvanger `sp176` en Bonte Vliegenvanger `sp177`. Het [letterlijke eigenaarbesluit](https://github.com/saddamsmit-source/Birdspot-Library/pull/344#issuecomment-7079680036) staat in PR #344 en per soort in het [bestaande F3-register](F3_140_HERCONTROLE_V0.1_DRAFT.json). Het staat toe om R43 te starten met behoud van de geregistreerde R42-lacunes, bewijsstatus en release-HOLD.

De R43-branch is gestart vanaf R42-head `afa23cd696a4c8aa635ecd8e507f9c60519019c2` met vrijgegeven writerclaim en 3/3 geslaagde R42-workflows op die SHA. De eerste inhoudscontrole omvat de drie soorten hieronder. De F3-teller staat op **129/140 inhoudelijk bekeken, 11 te starten, 0 volledige F3-PASS**. Appcode, gidsmediabytes en historische soortaudits vallen buiten deze registerrevisie.

## Eerste bevindingen per soort

| Soort | Lokaal beeld en veldherkenning | Materiële lacunes |
| --- | --- | --- |
| Gekraagde Roodstaart `sp178` | Vier afbeeldingen visueel bekeken. De hoofdfoto toont wit voorhoofd, zwarte keel en oranje borst. Het vrouwtjesbeeld toont een warme lichte onderzijde en het jeugdbeeld een gespikkeld kleed. De opname bij de takken toont een luchtgedragen vogel met hangende poten en blijft in de overige herkenningsfoto’s. | De historische vermelding van een scherp vrij-vluchtbeeld is een ontbrekend beeld, zoals expliciet vermeld in de oude audit en de bestaande fotometadata. LK-024 bevat twee wederkerige rustpanelen met Zwarte Roodstaart `sp051`, voor volwassen mannetjes en vrouwtjes. De rode staart onderscheidt de twee soorten niet. Bij bruine vogels vraagt het verschil in onderzijde goed licht en aanvullende kenmerken. Onafhankelijke rolcontrole, passende jeugdvergelijking, definitieve vrije vlucht en lokale zang/roep staan open. |
| Wilde Zwaan `sp187` | Eén bestaande hoofdfoto toont wit volwassen kleed, lange rechte hals en geel op de snavel. Deze foto kwam wel uit de gidsrendering en ontbrak in de oude auditinventaris. De actuele foto is in het F3-register opgenomen met de historische auditstatus intact. LK-064 heeft een wederkerig rustpaneel met Knobbelzwaan `sp126`. | Een gericht snavelzijaanzicht met Kleine Zwaan `sp127`, passend jeugd- en vluchtbeeld, en lokale roep/vluchtroep staan open. Vergelijk bij volwassenen de positie van de gele snavelwig ten opzichte van het neusgat. Gebruik die adultregel niet zelfstandig bij een grijsbruine jonge zwaan. Vogelbescherming geeft 145–160 cm lengte en 205–275 cm spanwijdte. De app geeft 140–160 en 205–235 cm. Bronbereik en gewicht vragen vervolgverificatie. |
| Zomertaling `sp188` | Vijf afbeeldingen visueel bekeken. Twee volwassen mannetjesbeelden laten de witte oogboog zien. De bruine rustfoto’s tonen delen van oogstreep en lichte keel. De vluchtopname toont een bruine vogel in vrije vlucht en staat onder Verenkleed. Bij bruine vogels helpen koptekening, keel en bij een goed zijaanzicht de staartzijde. De vleugelkenmerken vragen een bruikbare vluchthoek. | Er zijn drie wederkerige rustpanelen met Wintertaling `sp091`. Het eclipsvergelijkingspaneel met verschillende houdingen verschijnt niet in de renderuitvoer. Passend fotopaar, onafhankelijke leeftijds- en eclipsbepaling en volledige rechtencontrole staan open. De drie bestaande opnamen XC903512, XC786511 en XC903822 vragen afzonderlijke controle van identiteit, luisterkwaliteit, rol, achtergrondgeluid en herpublicatie. |

De tien lokale Git-blob-SHA’s staan per soort bij de bevindingen in het F3-register. De fotovergelijkingen zijn aan de HTML-weergave van de soortkaart getoetst. De fysieke beeldvergelijkbaarheid, zoom- en offlinebediening vragen apart browserbewijs.

## Geraadpleegde bronpagina’s op 22 november 2026

| Soort | Geraadpleegd | Bewijsgrens |
| --- | --- | --- |
| Gekraagde Roodstaart | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/gekraagde-roodstaart), [vergelijking met Zwarte Roodstaart](https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-zwarte-roodstaart-vs-gekraagde-roodstaart), [Sovon](https://stats.sovon.nl/stats/soort/11220), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:Phoenicurus_phoenicurus_07%28js%29%2C_Lodz_%28Poland%29.jpg) | Volwassen kenmerken en Nederlandse broedcontext getoetst. Commons vermeldt Jerzy Strzelecki en CC BY-SA 3.0. iNaturalist-foto’s, specifieke leeftijdsannotaties en originele pixelvergelijkingen staan open. |
| Wilde Zwaan | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wilde-zwaan), [Kleine Zwaan](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-zwaan), [Sovon](https://stats.sovon.nl/stats/soort/1540), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:WhooperSwan1.jpg) | Volwassen snaveltekening en wintergastperiode getoetst. Commons vermeldt Andrew Lee en een vrijgave in het publieke domein. Gecontroleerde vergelijking met de oorspronkelijke fotobytes, onafhankelijke rol- en rechtencontrole staan open. |
| Zomertaling | [Vogelbescherming soortpagina](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zomertaling), [Wintertaling](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wintertaling), [Sovon](https://stats.sovon.nl/stats/soort/1910), [Commons-hoofdfoto](https://commons.wikimedia.org/wiki/File:Garganey%2C_Israel.jpg) | Hoofdkenmerken en Nederlandse seizoenscontext getoetst. Commons vermeldt YedidyaPopper en CC BY 4.0 voor de hoofdopname. De vier overige originele bestanden en de opnamen zijn in deze startcontrole niet afzonderlijk afgetekend. |

**ANWB Vogelgids van Europa, alle drie soorten — NOT TESTED.** Er is geen rechtmatig leesbare soortpassage voor deze startcontrole beschikbaar gevonden. Editie, ISBN en pagina van daadwerkelijk gelezen soortpassages staan daarom open. De gelezen Vogelbescherming- en Sovon-pagina’s onderbouwen alleen de vastgelegde soortclaims.

## Bewijs en hervatten

- **Inhoud PARTIALLY TESTED.** De eerste bron-, beeld- en renderinspectie is vastgelegd. Dubbelgangers, originele media, rechten en onafhankelijke tweede review houden hun open status.
- **Gerichte Chromium-toets BLOCKED.** De lokale Chromium-start stopte vóór uitvoering met `socket() failed: Operation not permitted`. Gerichte viewport-, zoom-, audio- en offlineproeven blijven open.
- **Samsung/PWA, owner-preview en productie NOT TESTED.** De release blijft **HOLD**. SYNC-CHECK voor hostvelden en documentactivering is niet aangetoond. Branchbescherming UNKNOWN.
- Hervat op de vastgelegde PR-head met gericht bewijs voor de open media- en vergelijkingsvragen. De gemelde R43-lacunes vereisen een eigen eigenaarbesluit vóór een volgende inhoudelijke batch.

**EINDMARKERING — F3-R43 · 129/140 BEKEKEN · 11 TE STARTEN · 0 VOLLEDIGE F3-PASS · RELEASE HOLD**
