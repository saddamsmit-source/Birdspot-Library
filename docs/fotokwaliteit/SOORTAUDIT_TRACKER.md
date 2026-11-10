# Birdspot — soortaudit van de collectie met foto's

Gegenereerd door `tools/fotokwaliteit/build_soortaudit_tracker.py` · status voor commit `dd5da6b` · 2026-11-10.
Statussen: VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED. Een geautomatiseerde rendercontrole telt **niet** als visuele of inhoudelijke controle.

## Overzicht (eindeisen 1–9)

| # | Meting | Stand |
|---|---|---|
| 1 | Soorten met bestaande gidsfoto's | 134 |
| 2 | Afzonderlijk (aangescherpt) gecontroleerd | 11 (M1) |
| 3 | Technisch correct (laden, volgorde, offline-bron, beoordeling = kaart) | 11 van 11 |
| 4a | Visueel VERIFIED (Claude, beeld per foto) | 9 van 11 |
| 4b | Inhoud (kennisprofiel) VERIFIED | 0 van 11 — alle profielen hebben nog open punten |
| 4c | Onafhankelijk beoordeeld (ChatGPT) | 0 — NOT TESTED |
| 5 | Correcties doorgevoerd (in gecontroleerde soorten) | 13; plus collectiebrede vluchtcontrole: 16 uit de vluchtrol, 8 gearchiveerd |
| 6 | Afgekeurde vluchtfoto's | 24 (tabel hieronder) |
| 7 | Ontbrekende foto-/kennisonderdelen | 18 fotoposities in gecontroleerde soorten; 123 fotosoorten zonder kennisprofiel |
| 8 | Kritische kenmerken niet doorslaggevend onderbouwd | 32 (tabel hieronder) |
| 9 | Open bron-/licentieproblemen | 0 in gecontroleerde soorten; collectiebreed blijft het eerder gemelde punt '22 afbeeldingen buiten de bronaudit' open |

Eindoordeel per gecontroleerde soort: PARTIALLY TESTED 11.

## Gecontroleerde soorten

### sp066 Boomkruiper — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp066.webp` | Hoofdfoto | Boomkruiper tegen stam; gestreepte bruine rug, gebogen snavel, steunstaart. | niet vast te stellen | matig: vogel klein in beeld en wat zacht; vleugelband (kritisch kenmerk) niet scherp | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Jan Matthies |

- **Correcties:** geen
- **Ontbreekt:** In vlucht; Juveniel; Hoofdfoto waarop het vleugelbandpatroon leesbaar is
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 6 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Roep, Zang, Vleugelbandpatroon, Alula, Flanken en wenkbrauw, Snavel en achternagel; open: Nederlandse status en aantallen niet opnieuw gecontroleerd (Sovon/Vogelbescherming).; Roep en zang van de Taigaboomkruiper nog uit een bron beschrijven.; Hoofdfoto toont de vleugelband niet scherp; soortbepaling van die foto steunt op bronmetadata (fotobaseline batch 01).; Volledige tekst van het British Birds-artikel niet gelezen.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Boomkruiper en Taigaboomkruiper zijn op deze foto niet zelfstandig te onderscheiden; soortbepaling steunt op de bron (Commons-titel 'Gartenbaumläufer').
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp057 Fitis — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp057.webp` | Hoofdfoto | Zingende Fitis op tak; lichte poten, geelwitte onderzijde, lange handpenprojectie. | zingend, dus waarschijnlijk mannetje; niet als zodanig gelabeld | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |

- **Correcties:** FQA-04: zang alleen doorslaggevend bij een typisch, volledig lied; gemengde zang als open punt.
- **Ontbreekt:** In vlucht; Juveniel (gelere najaarsvogel)
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 5 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Handpenprojectie, Kop, Poten, Seizoen; open: Spanwijdte en gewicht niet opnieuw gecontroleerd.; Verschil met Iberische Tjiftjaf alleen als waarschuwing opgenomen.; Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp056 Tjiftjaf — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp056.webp` | Hoofdfoto | Tjiftjaf op dunne tak; donkere poten, korte handpenprojectie. | niet vast te stellen | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp056-flight.webp` | Overige herkenningsfoto's (was: In vlucht) | Fladderend tussen rietstengels met gespreide vleugels; contact met stengels niet uit te sluiten. | niet vastgesteld | goed | uit-rol | opvliegen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Falco2022 |

- **Correcties:** Uit 'In vlucht' gehaald: valt onder de klasse opvliegen/tussen planten (mijlpaal 1).; FQA-04: zang alleen doorslaggevend bij een typisch, volledig lied; gemengde zang als open punt.
- **Ontbreekt:** In vlucht; Juveniel/najaarsvogel
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 5 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Handpenprojectie, Staartbeweging, Poten, Seizoen; open: Spanwijdte en gewicht niet opnieuw gecontroleerd.; Iberische Tjiftjaf heeft nog geen eigen vergelijking.; Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Eerdere uitslag:** Fotobaseline batch 01 gaf VERIFIED met deze foto als vluchtfoto; vervallen.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp003 Holenduif — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp003.webp` | Hoofdfoto | Holenduif in gras, zijaanzicht; groen glanzende halsvlek, korte zwarte vleugelstrepen, donker oog. | volwassen-ogend; geslacht niet op kleed | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Chris Cant from Cumbria, UK |
| `sp003-flight.webp` | Overige herkenningsfoto's (was: In vlucht) | Vogel zet af vanaf de grond; poten raken nog de grond. Vleugelpatroon wel zichtbaar. | niet vastgesteld | matig: 485 px, zacht | uit-rol | opvliegen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Åsa Berndtsson |

- **Correcties:** Opvliegende foto uit 'In vlucht' (eigenaarsmelding) — label 'Opvliegend vanaf de grond' (vluchtcontrole ronde 1).; Veldkenmerken en kleedtekst: "zwarte vleugelpunten" → geen wit in hals/vleugel, twee korte zwarte vleugelstrepen, brede zwarte staartband (VB_HOLEN, RSPB_SD).; Zang: "oe-oe-oe steeds sneller" → eentonige reeks tweelettergrepige roepen (VB_HVH).; Lengte 30–33 → 28–32 cm; broedduur 16–18 → 16–17 dagen; nestjongen 27–28 → ca. 24 dagen (VB_HOLEN).
- **Ontbreekt:** In vlucht (geen echte vluchtfoto); Juveniel
- **Geslacht:** Geslachten gelijk; geen Mannetje/Vrouwtje-vakken (bron: VB_HOLEN).
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Stuit; open: Geen goede vluchtfoto: de vorige 'vluchtfoto' toonde een opvliegende vogel en is uit de vluchtrol gehaald (positie ontbreekt).; Geen gidsfoto van een juveniel.; Kleedvariatie van stadsduiven maakt de stuit niet doorslaggevend.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Eerdere uitslag:** Fotobaseline batch 01 gaf VERIFIED inclusief de opvliegende vluchtfoto; die uitslag is vervallen.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp002 Houtduif — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp002.webp` | Hoofdfoto | Volwassen Houtduif zittend op paal, zijaanzicht; witte halsvlek, lichte iris, roze borst. | volwassen (halsvlek, lichte iris); geslacht niet op kleed | goed: scherp, vogel groot in beeld | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Stephan Sprinz |
| `sp002-flight.webp` | In vlucht | Vrij in de lucht, frontaal van onderen; vleugels gespreid, witte vleugelrand zichtbaar. | niet vastgesteld (neutraal label) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Stefan Berndtsson |

- **Correcties:** FQA-04: kritisch kenmerk 'Halsvlek en iris' gesplitst; 'Witte halsvlek' (alleen volwassen) blijft doorslaggevend, iris alleen ondersteunend.
- **Ontbreekt:** Juveniel (zonder halsvlek, wel vleugelband); Vluchtfoto van boven met volledige witte vleugelband (wenselijk)
- **Geslacht:** Geslachten gelijk; geen Mannetje/Vrouwtje-vakken (bron: VB_HOUT).
- **Kennisprofiel:** 2 kritische kenmerken (2 doorslaggevend); niet doorslaggevend: —; open: Juveniel- en vluchtvergelijking met Stadsduif nog niet uit een Nederlandse bron uitgewerkt.; Geen gidsfoto van een juveniel (positie ontbreekt).; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp004 Turkse Tortel — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp004.webp` | Hoofdfoto | Turkse Tortel op sparrentop tegen blauwe lucht; zwarte halsband, rood oog. | volwassen (scherpe halsband); geslacht niet vast te stellen | voldoende: scherp, maar vogel vrij klein in beeld | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Jakub Hałun |
| `sp004-flight.webp` | In vlucht | Vrij in de lucht, zijaanzicht van onderen; staartpatroon (donkere basis, witte eindrand) zichtbaar. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Florian Pépellin |

- **Correcties:** Broedsels per jaar 3–5 → 2–5 (VB_TT).; FQA-04: tweede onafhankelijke bron voor de Zomertortel-kant (eBird, birdspot.co.uk) en uitzondering voor juvenielen zonder halstekening.
- **Ontbreekt:** Juveniel (zonder of met vage halsband); Hoofdfoto met grotere vogel (wenselijk)
- **Geslacht:** Geslacht vaak niet op kleed te bepalen (BZ_CD); geen geslachtsvakken.
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Staart in vlucht; open: Onderscheid met Lachduif (ontsnapte vogels) nog uit een bron uitwerken.; Spanwijdte en gewicht niet in de geraadpleegde Nederlandse bron.; Geen gidsfoto van een juveniel; hoofdfoto toont de vogel vrij klein in beeld.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp005 Buizerd — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp005-male-rest.webp` | Hoofdfoto | Lichte Buizerd op kabel, frontaal; donkere iris, gestreepte borst. Watermerk van de maker in beeld. | volwassen (donkere iris; bron: Life Stage Adult). Bron noemt 'Male', maar geslacht niet op kleed te zien: terecht zonder geslachtslabel. | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY SA · (c) Gianluca Congi🪶🦆🌲, some rights reserved (CC BY-SA) |
| `sp005.webp` | Overige herkenningsfoto's | Donker gekleurde Buizerd op tak; laat de kleedvariatie zien. | niet vastgesteld | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp005-juv.webp` | In vlucht (Juveniel) | Jonge Buizerd zweeft vrij met volledig gespreide vleugels, van onderen; lichte iris, gelijkmatig gebandeerde staart. | juveniel (bron: iNaturalist Life Stage Juvenile; lichte iris consistent); label Juveniel blijft in de vluchtsectie | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) rober025, some rights reserved (CC BY) |
| `sp005-adult_m.webp` | In vlucht (Volwassen) | Vrij in de lucht van onderen; brede vleugels, gebandeerde staart met donkerder eindband. | volwassen (bron: Life Stage Adult); kaart toont geen geslacht ondanks registersleutel adult_m | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Roy Lowry, some rights reserved (CC BY) |
| `sp005-male-flight.webp` | In vlucht | Donkere Buizerd vrij in de lucht, schuin van onderen. | volwassen volgens bron (Life Stage Adult); niet uit beeld te bevestigen | matig: licht onscherp, vogel klein; toont wel de donkere variant. Voorlopige status zichtbaar in de kaart; vervanging gewenst | voorwaardelijk | vlucht · voorwaardelijk | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY SA · (c) Simone Bocca, some rights reserved (CC BY-SA) |
| `sp005-female-flight.webp` | In vlucht | Lichte Buizerd vrij in de lucht van onderen; brede donkere achterrand van de vleugel. | volwassen (bron: Life Stage Adult; donkere achterrand consistent) | voldoende | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY SA · (c) Simone Bocca, some rights reserved (CC BY-SA) |

- **Correcties:** FQA-01: juveniele foto toont echte vlucht maar stond zonder vluchtlabel onder Juveniel. Nu flight:true, één keer onder In vlucht met label Juveniel; de Juveniel-kaart verwijst ernaar.
- **Ontbreekt:** Definitieve (scherpe) donkere Buizerd in vlucht
- **Geslacht:** Geslacht niet op kleed te zien; alle foto's zonder geslachtslabel (bronaudit 09-11).
- **Kennisprofiel:** 6 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kop, Vleugelhouding en -slag, Staart, Iris, Kleur, Geluid; open: Onderscheid met Ruigpootbuizerd uit een bron uitwerken.; Leefgebied niet opnieuw gecontroleerd.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Registersleutels 'adult_m' en bestandsnamen 'male/female' suggereren geslacht; de kaart toont dat niet. Hernoemen is cosmetisch en niet uitgevoerd.; ChatGPT-QA markeerde de Buizerd als REVIEW REQUIRED tot het rolconflict juveniel/vlucht is opgelost; opgelost in deze herstelronde, onafhankelijke hercontrole open.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp006 Sperwer — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp006-hero-male.webp` | Hoofdfoto | Volwassen mannetje op stronk met geheven vleugels; blauwgrijze bovendelen, oranje wangen en flanken. | volwassen mannetje (bron: 'Male'; kleed bevestigt) | goed; vleugels bedekken deel van de rug | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 c6bec5e043…), CC BY 2.0 · caroline legg |
| `sp006.webp` | Mannetje | Volwassen mannetje zittend, zijaanzicht; blauwgrijze rug, roestkleurige onderzijde. | volwassen mannetje (bron: 'Male Sparrowhawk'; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-adult_f.webp` | Vrouwtje | Vrouwtje met gespreide vleugels op stronk; grijsbruine bovendelen, fijn gebandeerde borst, witte wenkbrauw. | volwassen vrouwtje (bron: 'Female Sparrowhawk'; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-juv.webp` | Juveniel | Jonge Sperwer op gras; bruine bovendelen, grove bruine dwarsbandering. | juveniel (bron: 'Female Juvenile Sparrowhawk') | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-flight.webp` | In vlucht | Vrij in de lucht van onderen; korte brede vleugels, gebandeerde staart met rechte hoeken, roestige onderzijde. | niet vastgesteld op de kaart (neutraal label) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |

- **Correcties:** geen
- **Ontbreekt:** Vrouwtje in vlucht (wenselijk)
- **Geslacht:** Geslachten verschillen duidelijk (VB_SPERWER_MV); mannetje en vrouwtje getoond met bronbevestiging.
- **Kennisprofiel:** 6 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Staartpunt, Kop en vleugels in vlucht, Vliegstijl, Roep, Grootte; open: Leeftijdsbepaling in vlucht nog uit een bron beschrijven.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp021 Ekster — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp021.webp` | Hoofdfoto | Ekster op tak; zwart-wit kleed, glanzende staart en blauwe vleugelglans. | volwassen-ogend; geslachten gelijk | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp021-flight.webp` | In vlucht | Vrij in de lucht boven water; gespreide zwart-witte vleugels met witte handvleugel, lange staart. Geen contact met de steen rechtsonder. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |

- **Correcties:** Lengte 44–46 → 46–50 cm; broedduur 17–18 → 17–24 dagen; nestjongen 24–30 → 22–30 dagen (VB_EKSTER).
- **Ontbreekt:** Juveniel (kortere staart)
- **Geslacht:** Geslachten gelijk; geen geslachtsvakken.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kleedpatroon en staart; open: Juveniel kleed en leefgebied niet opnieuw gecontroleerd tegen een bron.; Vergelijking met Gaai is bestaande Birdspot-inhoud, niet opnieuw gecontroleerd.; Kleedpatroon is in Nederland vrijwel onmiskenbaar, maar staat op "Helpt" tot een tweede, onafhankelijke bron is vastgelegd (regel doorslaggevend, 10-11-2026).; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp094 Zilvermeeuw — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp094.webp` | Hoofdfoto | Volwassen Zilvermeeuw op ijs; grijze mantel, witte kop, roze poten, zwarte vleugelpunten. | volwassen (adult kleed) | voldoende: scherp, vogel vrij klein in beeld | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Stephan Sprinz |
| `sp094-flight.webp` | In vlucht | Volwassen vogel vrij in de lucht boven zee; lichtgrijze bovenvleugel, zwarte vleugelpunten met witte vlekken. | volwassen; geslacht niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |

- **Correcties:** Lengte 54–60 → 55–67 cm; spanwijdte 123–148 → 125–155 cm (VB_ZILV).
- **Ontbreekt:** Juveniel / eerste kalenderjaar; Onvolwassen kleden (leeftijdsreeks)
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 3 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Pootkleur, Tertials eerstejaars, Leeftijd; open: Snavel- en oogkleur per leeftijd uit een bron beschrijven.; Onderscheid met Pontische Meeuw uitwerken.; Kopstreping in winterkleed is in de bron alleen als foto te zien.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp008 Torenvalk — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `dd5da6b` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp008-hero-male.webp` | Hoofdfoto | Mannetje op boogvormige paal, schuin frontaal; grijze kop, roodbruine gevlekte rug. | volwassen mannetje (bron: 'Male Common Kestrel'; kleed bevestigt) | voldoende: scherp, vogel middelgroot in beeld | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 9041286b8d…), CC BY 4.0 · Marie-Lan Taÿ Pamart |
| `sp008.webp` | Mannetje | Mannetje op boomstam, zijaanzicht; grijze kop en staart, roestbruine rug met vlekken. | mannetje (kleed: grijze kop en staart) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Jakub Hałun |
| `sp008-adult_f.webp` | Vrouwtje | Vrouwtje op tak; bruine kop, gevlekte borst, gebandeerde staart. | vrouwtje (bron: 'female'; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp008-juv.webp` | Juveniel | Jonge Torenvalk op tak; bruine kop en rug, gestreepte borst. | juveniel volgens bron ('Juvenile'); visueel lastig van vrouwtje te scheiden | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · caroline legg |
| `sp008-male-flight.webp` | In vlucht (Mannetje) | Vrij in de lucht van onderen; spitse vleugels, grijze ongebandeerde staart met brede zwarte eindband. | mannetje: visueel (grijze ongebandeerde staart met zwarte eindband); bron noemt geen geslacht | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Zeynel Cebeci |
| `sp008-flight.webp` | In vlucht (biddend) | Biddend, frontaal van onderen; gespreide vleugels en waaierstaart. | niet vastgesteld (neutraal label) | goed | goedgekeurd | bidden · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Rolf Dietrich Brecher from Germany |

- **Correcties:** geen
- **Ontbreekt:** niets
- **Geslacht:** Geslachten verschillen (VB_TOREN, EB_KES); mannetje en vrouwtje getoond.
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Silhouet en jachtgedrag; open: Juveniel kleed en het onderscheid juveniel/vrouwtje uit een bron beschrijven.; Uitgewerkte vergelijking met Boomvalk en Smelleken ontbreekt.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Geslacht van de mannetje-vluchtfoto steunt op beeldkenmerken, niet op de bron (REVIEW REQUIRED voor onafhankelijke bevestiging).
- **Volgende actie:** Onafhankelijke review (ChatGPT)

## Afgekeurde vluchtfoto's (collectiebreed)

| Soort | Bestand | Uitslag | Klasse | Reden |
|---|---|---|---|---|
| sp003 Holenduif | `sp003-flight.webp` | uit-rol | opvliegen | Poten raken nog de grond; vogel zet af. Ook laag opgelost (485 px). |
| sp017 Kleine Bonte Specht | `sp017-flight.webp` | uit-rol | opvliegen | Zet af van de stam bij de nestholte; staart nog tegen de bast. |
| sp025 Kauw | `sp025-flight.webp` | uit-rol | landen | Frontale landingsnadering met poten naar voren en gespreide staart. |
| sp031 Matkop | `sp031-flight.webp` | uit-rol | opvliegen | Poten naar beneden vlak boven de sneeuw: afzetten of neerstrijken. |
| sp032 Glanskop | `sp032-flight.webp` | archief | opvliegen | Zet af van een tak; onscherp, alleen silhouet. Geen bruikbare vervangende rol. |
| sp033 Kuifmees | `sp033-flight.webp` | uit-rol | grond | Staat met de poten op de sneeuw met geheven vleugels. |
| sp034 Staartmees | `sp034-flight.webp` | archief | opvliegen | Duikt van een tak weg; onscherp en ongebruikelijke houding. |
| sp042 Roodmus | `sp042-flight.webp` | archief | opvliegen | Sterk onscherp bij een tak; vermoedelijk afzetten. |
| sp045 Merel | `sp045-flight.webp` | uit-rol | landen | Poten naar voren gestrekt: landingshouding. |
| sp048 Koperwiek | `sp048-flight.webp` | uit-rol | opvliegen | Tussen planten met half geopende vleugels; niet vrij in de lucht. |
| sp049 Grote Lijster | `sp049-flight.webp` | archief | vlucht | FQA-02 hercontrole 10-11-2026 (drie vragen: in vlucht? / scherp en groot genoeg? / geschikt als definitieve gidsfoto?): in vlucht ja, maar sterk bewegingsonscherp: vleugeltekening niet bruikbaar voor determinatie. Duidelijk ongeschikt als gidsbeeld; uit de kaart, herkomst en bestand bewaard. Vluchtpositie ontbreekt. |
| sp050 Roodborst | `sp050-flight.webp` | uit-rol | opvliegen | Tussen besneeuwde takken; niet vrij in de lucht. |
| sp051 Zwarte Roodstaart | `sp051-flight.webp` | archief | vlucht | 291x177 px en onscherp; kenmerken niet bruikbaar. |
| sp053 Roodborsttapuit | `sp053-flight.webp` | archief | vlucht | Zeer onscherp; soort niet uit het beeld zelf te bevestigen. |
| sp056 Tjiftjaf | `sp056-flight.webp` | uit-rol | opvliegen | Mijlpaal 1 (aangescherpt): fladderend tussen rietstengels valt onder de eigen klasse "opvliegen / tussen planten"; contact met de stengels niet uit te sluiten. Uit "In vlucht"; vluchtpositie geregistreerd als ontbrekend. |
| sp058 Fluiter | `sp058-flight.webp` | uit-rol | landen | Fladdert met uitgestrekte poten vlak bij blad: neerstrijken, geen vrije vlucht. |
| sp061 Grasmus | `sp061-flight.webp` | archief | vlucht | Vlek zonder bruikbare kenmerken; soort niet uit het beeld te bevestigen. |
| sp069 Gele Kwikstaart | `sp069-flight.webp` | uit-rol | landen | Poten uitgestrekt naar de paal; neerstrijken. |
| sp110 Rietzanger | `sp110-flight.webp` | uit-rol | opvliegen | Tussen takken van een struik met bewogen vleugels; niet vrij in de lucht. |
| sp118 Rietgors | `sp118-flight.webp` | archief | vlucht | Luchtgedragen, maar bewegingsonscherp; kenmerken niet bruikbaar. |
| sp173 Bruine Kiekendief | `sp173-juv.webp` | uit-rol | landen | Strijkt met hangende poten neer in het riet; geen vrije vlucht. |
| sp178 Gekraagde Roodstaart | `sp178-flight.webp` | uit-rol | opvliegen | FQA-02 hercontrole 10-11-2026 (drie vragen: in vlucht? / scherp en groot genoeg? / geschikt als definitieve gidsfoto?): luchtgedragen, maar poten hangen en takken vlakbij: vermoedelijk kort na het afzetten; korrelig. Vluchtstatus niet uit dit ene frame te bewijzen (REVIEW REQUIRED); daarom niet in de definitieve vluchtrol. Vluchtpositie ontbreekt. |
| sp251 Grauwe Kiekendief | `sp251-adult_f.webp` | uit-rol | landen | Vleugels hoog opgeslagen, poten omlaag: neerstrijken/remmen, geen herkenbare vlieghouding. |
| sp251 Grauwe Kiekendief | `sp251-juv.webp` | uit-rol | landen | Landt boven gras met uitgestrekte poten. |

## Kritische kenmerken die (nog) niet doorslaggevend zijn

| Soort | Kenmerk |
|---|---|
| sp003 Holenduif | Stuit |
| sp004 Turkse Tortel | Staart in vlucht |
| sp005 Buizerd | Kop |
| sp005 Buizerd | Vleugelhouding en -slag |
| sp005 Buizerd | Staart |
| sp005 Buizerd | Iris |
| sp005 Buizerd | Kleur |
| sp005 Buizerd | Geluid |
| sp006 Sperwer | Staartpunt |
| sp006 Sperwer | Kop en vleugels in vlucht |
| sp006 Sperwer | Vliegstijl |
| sp006 Sperwer | Roep |
| sp006 Sperwer | Grootte |
| sp008 Torenvalk | Silhouet en jachtgedrag |
| sp021 Ekster | Kleedpatroon en staart |
| sp056 Tjiftjaf | Handpenprojectie |
| sp056 Tjiftjaf | Staartbeweging |
| sp056 Tjiftjaf | Poten |
| sp056 Tjiftjaf | Seizoen |
| sp057 Fitis | Handpenprojectie |
| sp057 Fitis | Kop |
| sp057 Fitis | Poten |
| sp057 Fitis | Seizoen |
| sp066 Boomkruiper | Roep |
| sp066 Boomkruiper | Zang |
| sp066 Boomkruiper | Vleugelbandpatroon |
| sp066 Boomkruiper | Alula |
| sp066 Boomkruiper | Flanken en wenkbrauw |
| sp066 Boomkruiper | Snavel en achternagel |
| sp094 Zilvermeeuw | Pootkleur |
| sp094 Zilvermeeuw | Tertials eerstejaars |
| sp094 Zilvermeeuw | Leeftijd |

## Nog niet aangescherpt gecontroleerd

Deze soorten renderen technisch, maar zijn **niet** foto voor foto opnieuw beoordeeld. Eerdere uitslagen (fotobaseline batch 01) gelden niet automatisch.

sp104 Aalscholver, sp065 Boomklever, sp067 Taigaboomkruiper, sp058 Fluiter, sp128 Bergeend, sp129 Krakeend, sp092 Kuifeend, sp090 Slobeend, sp130 Smient, sp132 Tafeleend, sp089 Wilde Eend, sp091 Wintertaling, sp188 Zomertaling, sp105 Fazant, sp106 Patrijs, sp077 Fuut, sp086 Grauwe Gans, sp141 Gierzwaluw, sp117 Geelgors, sp118 Rietgors, sp063 Goudhaantje, sp064 Vuurgoudhaan, sp249 Blauwe Kiekendief, sp173 Bruine Kiekendief, sp251 Grauwe Kiekendief, sp007 Havik, sp253 Ruigpootbuizerd, sp250 Steppekiekendief, sp248 Wespendief, sp054 Heggenmus, sp075 IJsvogel, sp262 Grauwe Klauwier, sp143 Kluut, sp026 Gaai, sp025 Kauw, sp022 Zwarte Kraai, sp069 Gele Kwikstaart, sp288 Grote Gele Kwikstaart, sp068 Witte Kwikstaart, sp070 Veldleeuwerik, sp049 Grote Lijster, sp048 Koperwiek, sp047 Kramsvogel, sp045 Merel, sp046 Zanglijster, sp164 Grote Mantelmeeuw, sp095 Kleine Mantelmeeuw, sp097 Kokmeeuw, sp096 Stormmeeuw, sp225 Zwartkopmeeuw, sp032 Glanskop, sp029 Koolmees, sp033 Kuifmees, sp031 Matkop, sp030 Pimpelmees, sp174 Zwarte Mees, sp043 Huismus, sp044 Ringmus, sp170 Ooievaar, sp072 Graspieper, sp146 Bontbekplevier, sp145 Goudplevier, sp099 Kievit, sp147 Kleine Plevier, sp206 Strandplevier, sp144 Zilverplevier, sp078 Meerkoet, sp079 Waterhoen, sp081 Blauwe Reiger, sp083 Grote Zilverreiger, sp082 Kleine Zilverreiger, sp245 Koereiger, sp085 Kwak, sp084 Purperreiger, sp108 Grote Karekiet, sp110 Rietzanger, sp098 Scholekster, sp159 Bosruiter, sp152 Drieteenstrandloper, sp158 Groenpootruiter, sp101 Grutto, sp155 Oeverloper, sp217 Poelruiter, sp150 Steenloper, sp102 Tureluur, sp156 Witgat, sp100 Wulp, sp157 Zwarte Ruiter, sp019 Groene Specht, sp016 Grote Bonte Specht, sp017 Kleine Bonte Specht, sp020 Middelste Bonte Specht, sp018 Zwarte Specht, sp282 Roze Spreeuw, sp112 Spreeuw, sp034 Staartmees, sp167 Grote Stern, sp166 Noordse Stern, sp165 Visdief, sp009 Slechtvalk, sp041 Appelvink, sp040 Goudvink, sp036 Groenling, sp039 Kneu, sp037 Putter, sp042 Roodmus, sp038 Sijs, sp035 Vink, sp177 Bonte Vliegenvanger, sp178 Gekraagde Roodstaart, sp176 Grauwe Vliegenvanger, sp050 Roodborst, sp053 Roodborsttapuit, sp051 Zwarte Roodstaart, sp113 Wielewaal, sp055 Winterkoning, sp061 Grasmus, sp060 Tuinfluiter, sp059 Zwartkop, sp114 Boerenzwaluw, sp115 Huiszwaluw, sp116 Oeverzwaluw, sp126 Knobbelzwaan

