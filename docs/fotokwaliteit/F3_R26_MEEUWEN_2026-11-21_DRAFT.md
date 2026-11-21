# F3-R26 — Zilvermeeuw, Kleine Mantelmeeuw en Stormmeeuw
**DRAFT / PARTIALLY TESTED · 21 november 2026 · PR #324**

## 1. Checkpoint, schrijfgrens en teller
- Vorige vrijgegeven R25 (PR #323) `d070ba4e6a9c880c535ae57681b3531dbf8c1497`; R25 omvat Slobeend/Wintertaling/Kuifeend. R25 gerichte content- en cohort-QA groen. Onafhankelijke expert en fysieke toesteltesten zijn daar nog open.
- R26 eigen branch `qa/birdspot-f3-r26-meeuwen-20261121-gpt6`; bestaande andere writers, PR #318, de eigenaarstest #322 en publieke review blijven onaangeroerd.
- Na controle/registratie: **78/140 inhoudelijk bekeken, 62 niet gestart, 0 volledige F3-PASS**. Dit is een *inhoudelijk bezoek*, geen aftekening van foto-originelen, mediarechten, vogelgeluid, bronvolledigheid of uitrol.
- Sluit iedere ronde met CI op de exacte R26-SHA, afzonderlijk van de Samsung-installatie/download die nog OPEN is.
- Actieve norm: app-README, Birdspot kwaliteitsnorm v1.7 FINAL; v1.9 op #315 concept. Index v3.13 FINAL, Handbook v2.18 FINAL, Projectinstructies v2.14 FINAL, Birdspot Veldhandboek v0.9 FINAL.

## 2. Zes rechtstreeks bekeken bestaande app-WebP's
Visuele beoordeling betreft exact de bestanden in de R25-basistree: **2 beelden per soort**. Dit bewijst wat het beeld zelf toont, niet het matchen van bronorigineel, sekse-/leeftijdsbetrouwbaarheid, publicatierecht of onafhankelijk ornithologisch oordeel. De F2-beeldaudit blijft als historisch bewijs bewaard.

### sp094 Zilvermeeuw — 2 bestaande beelden, 0 geluid
- `/assets/species/sp094.webp`: volwassen meeuw in rust op ijs, witte kop en onderzijde, **lichte grijze mantel, roze poot, gele snavel** en zwarte vleugeltoppen. Fotograaf Stephan Sprinz; CC BY-SA 4.0 (bronregister F2-30).
- `/assets/species/plumage/sp094-flight.webp`: vogel over open zee, vleugels gespreid, lichtgrijze bovenvleugel en zwarte top met witte vlekken; **vrij vluchtbeeld**. Andreas Trepte; CC BY-SA 2.5 (F2-30). Het dossier bevat een afzonderlijk **verzoek om hergebruik te melden**; releasebeoordeling van dat verzoek staat open, en bestaande zichtbare credits blijven behouden.
- Volwassen vergelijking: [Vogelbescherming Zilvermeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/zilvermeeuw) beschrijft de lichtgrijze bovendelen en roze poten. Pootkleur is geen absolute soortgarantie, zeker bij varianten en afwijkend licht.
- **Open:** geen controleerbaar eerste-winterfoto-paar met Kleine Mantelmeeuw; bij jonge vogels kunnen tertials helpen, maar volwassen vergelijkingsbeelden mogen niet als eerstejaarsvoorbeelden worden gepresenteerd. Bron-/originaalmatch en onafhankelijke leeftijdscontrole blijven open.

### sp095 Kleine Mantelmeeuw — 2 bestaande beelden, 0 geluid
- `/assets/species/sp095.webp`: volwassen meeuw op zand, **donkergrijze mantel en gele poten**. Stephan Sprinz; CC BY 4.0 (F2-30).
- `/assets/species/plumage/sp095-flight.webp`: duidelijke volwassen vrije vlucht met sterk donkere geheven bovenvleugel, witte onderzijde; vanuit deze hoek **poten nauwelijks zichtbaar**. Charles J. Sharp; CC BY-SA 4.0 (F2-30).
- [Vogelbescherming Kleine Mantelmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kleine-mantelmeeuw): donkere mantel/gele poten bij volwassen kleed; geen soortbesluit op één kenmerk. De donkere ondervleugels en tertials zijn vooral relevant bij eerstejaarsvogels, maar die beeldrol ontbreekt in deze bestaande twee foto's.
- De bestaande `ca. 50–65 cm` en `ca. 130–140 cm` zijn de gedocumenteerde **afgeronde middenbanden uit verschillende uitgevers**, niet de biologische totaalspreiding. Geen herberekening of nieuwe bronclaim in R26.
- **Open:** geschikt vergelijkbaar eerste-winterpaar Zilvermeeuw/Kleine Mantelmeeuw, originele bronbestanden en onafhankelijke determinatie; geen nieuw beeld in de app gezet.

### sp096 Stormmeeuw — 2 bestaande beelden, 0 geluid
- `/assets/species/sp096.webp`: volwassen vogel op steen met relatief slanke gele snavel, donkere iris, **geelgroene poten**, lichtgrijze mantel. Charles J. Sharp; CC BY-SA 4.0 (F2-31).
- `/assets/species/plumage/sp096-flight.webp`: volwassen vogel in duidelijk vrij vluchtbeeld van onderaf met gespreide vleugels, zwarte vleugeltoppen en witte vlekjes; Charles J. Sharp CC BY-SA 4.0 (F2-31). Specifieke handpente en leeftijd niet op eigen beeldinspectie alleen opnieuw afgetekend.
- [Vogelbescherming Stormmeeuw](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/stormmeeuw) noemt slankere snavel en donkere iris versus Zilvermeeuw, en geelgroene poten. Dat blijft ondersteunend in combinatie met formaat en passend kleed.
- **Bronverschil maat:** Vogelbescherming geeft voor lengte een bovengrens van 60 cm; in het bestaande kennisprofiel staat `ca. 40–45 cm` op twee andere uitgevers, met de 60 als uitgesloten uitschieter mét reden. Dit is bestaand gedocumenteerd bewijs; geen stille herberekening of algemene '60 is altijd fout'-regel.
- **Open:** nog geen passend gecontroleerd **winterkleedfoto-paar Stormmeeuw/Kokmeeuw**; ontbrekende jonge kleden en geen geregistreerde soortaudio. De bestaande audit laat dit open, dus niet aanvullen met een misleidende vergelijkingsfoto.

## 3. Rondebewijs, attributie en expliciete open punten
- Historische maker/licentie/oorsprong en eerdere pagina-inspectie: `docs/fotokwaliteit/F2_30_BRON_EN_LIMIETEN.json` voor sp094/sp095 en `docs/fotokwaliteit/F2_31_BRON_EN_LIMIETEN.json` voor sp096. Alle zes F2-vermeldingen vermelden `originalPageRead:true` **op het toenmalige controlemoment**, niet als nieuwe R26-freshness.
- Mediacontract: `assets/species/field-guide-media.json` heeft voor elke soort één vluchtfoto met bestaande bron/licentie/credit. Geen nieuw geluid voor deze drie in het assets-register. Controle van oorspronkelijk audiobestand = NIET VAN TOEPASSING (bestand ontbreekt), niet PASS.
- Bestaande kennisprofielen onder `tools/kennisbaseline/knowledge.json` en door generator gemaakte `src/data/speciesKnowledge.js` blijven ongewijzigd. Nieuwe inhoudelijke uitspraken in dit dossier komen uit gelezen Vogelbescherming-pagina's en directe visuele lokale WebP's; oude F2-rechteninformatie blijft als *historische metadata* geregistreerd.
- Geen foto's van eerste-winterkleed, geen ongecontroleerde vertalingen van bestaande adult-foto's naar juveniel. Per locatie geen beschermde GPS-gegevens gedeeld.

| Laag | Status | Open / beperking |
|---|---|---|
| Zes lokale focusfoto's visueel geopend | PARTIALLY TESTED | oorsprongs-pixelmatch, onafhankelijke determinatie |
| F2 maker/licentie-register gecontroleerd | PARTIALLY TESTED | actuele licentie-/credit-/herpublicatievoorwaarden per origineel |
| Volwassen soortpaar Zilvermeeuw/Kleine Mantelmeeuw | PARTIALLY TESTED | geschikte eerste-winterfoto's ontbreken |
| Stormmeeuw/Zilvermeeuw versus Kokmeeuw | PARTIALLY TESTED | correcte winterkleedfotoparen ontbreken |
| Soortaudio | NOT TESTED / 0 geregistreerd | geen bestand of bron om te beluisteren; nooit succes claimen |
| Registratie van 140 soorten | te controleren via R26-CI | 78 bekeken; 0 FULL PASS |
| Preview, zoom, back, offline, GPS, ZIP, PWA-update | NOT TESTED op R26-SHA | eerdere PR-bewijzen horen bij andere SHA |
| Onafhankelijk soort- en mediarechtenoordeel | NOT TESTED | deskundige/bronrechthercontrole |
| Samsung-installatie/download | OPEN | eigenaar heeft enkel werken van de privéschermen bevestigd |

## 4. Volgende handeling en releasegrens
Voer op de exacte PR #324 SHA de 140-teller, beeldhash-/bron-inventaris en eerdere R25/R24 regressies uit. Bij CI-falen kleinste regressie oplossen, niet historisch bewijs of gates wegschrijven. Op een volgende, eigen branch staan Kokmeeuw `sp097`, Scholekster `sp098`, Kievit `sp099` volgens de ongewijzigde 140-volgorde. R26 heeft geen nieuwe fotobestanden, geen nieuwe audio, geen opslagwijziging en geen nieuwe kosten.

**Release HOLD.** Niets mergen of publiceren zonder de afgesproken afzonderlijke gates en expliciete eigenaarvrijgave.

EINDMARKERING — F3-R26 INHOUDSREVIEW · 78/140 · 0 FULL PASS
