# Birdspot — soortaudit van de collectie met foto's

Gegenereerd door `tools/fotokwaliteit/build_soortaudit_tracker.py` · status voor commit `181688362b2b385e47939e8761586d0288259ede` · 2026-11-11.
Statussen: VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED. Een geautomatiseerde rendercontrole telt **niet** als visuele of inhoudelijke controle.
Beoordeeld volgens `docs/BIRDSPOT_KWALITEITSNORM.md` (biometrie §1, herkenning §2, foto §3). Verbeterwensen zijn voor de latere beoordeling door de eigenaar en blokkeren de batch niet.

## Overzicht (eindeisen 1–9)

| # | Meting | Stand |
|---|---|---|
| 1 | Soorten met bestaande gidsfoto's | 134 |
| 2 | Afzonderlijk (aangescherpt) gecontroleerd | 50 (M1, M2, M3, M4, M5) |
| 3 | Technisch correct (laden, volgorde, offline-bron, beoordeling = kaart) | 50 van 50 |
| 4a | Visueel VERIFIED (beeld per foto) | 45 van 50 |
| 4b | Inhoud (kennisprofiel) VERIFIED | 16 van 50 — alle profielen hebben nog open punten |
| 4c | Onafhankelijk beoordeeld (ChatGPT) | 0 — NOT TESTED |
| 5 | Correcties doorgevoerd (in gecontroleerde soorten) | 52; plus collectiebrede vluchtcontrole: 17 uit de vluchtrol, 8 gearchiveerd |
| 6 | Afgekeurde vluchtfoto's | 25 (tabel hieronder) |
| 7 | Ontbrekende foto-/kennisonderdelen | 47 fotoposities in gecontroleerde soorten; 84 fotosoorten zonder kennisprofiel |
| 8 | Kritische kenmerken niet doorslaggevend onderbouwd | 80 (tabel hieronder) |
| 9 | Open bron-/licentieproblemen | 0 in gecontroleerde soorten; collectiebreed blijft het eerder gemelde punt '22 afbeeldingen buiten de bronaudit' open |

Eindoordeel per gecontroleerde soort: PARTIALLY TESTED 35, VERIFIED 15.

## Gecontroleerde soorten

### sp104 Aalscholver — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp104.webp` | Hoofdfoto | Volwassen Aalscholver op kade; geschubd kleed, witte wang, kuifveren. | volwassen (bron: adult) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · MPF |
| `sp104-jaarling.webp` | Jaarling | Onvolwassen vogel met lichte onderzijde, staat met gespreide vleugels te drogen. | onvolwassen (bron: 'immature') | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |
| `sp104-flight.webp` | In vlucht | Vrij in de lucht van opzij; lange hals gestrekt. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Charles J. Sharp |

- **Correcties:** geen
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Broedkleed; open: Juveniel/onvolwassen kleed niet uit een bron beschreven; de jaarlingfoto steunt op de Commons-bron ('immature').; Onderscheid met Kuifaalscholver uit een bron uitwerken.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp065 Boomklever — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp065.webp` | Hoofdfoto | Boomklever op rots; blauwgrijze rug, zwarte oogstreep, warme onderzijde. | niet vast te stellen | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Chme82 |
| `sp065-flight.webp` | In vlucht | Vrij in de lucht met volledig gespreide vleugels en staart; poten tegen de buik (vergroot gecontroleerd, geen landingshouding). | niet vastgesteld | goed (640 px) | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · C. Robiller / naturlichter.de ( Hyla meridionalis ) |

- **Correcties:** geen
- **Ontbreekt:** Juveniel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachtsverschil klein; geen geslachtsvakken.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kleur en gedrag; open: Broedduur en nestjongenduur niet in de geraadpleegde bron; Birdspot-waarden niet opnieuw gecontroleerd.; Geen gidsfoto van een juveniel.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp066 Boomkruiper — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp066.webp` | Hoofdfoto | Boomkruiper tegen stam; gestreepte bruine rug, gebogen snavel, steunstaart. | niet vast te stellen | matig: vogel klein in beeld en wat zacht; vleugelband (kritisch kenmerk) niet scherp | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Jan Matthies |

- **Correcties:** geen
- **Ontbreekt:** In vlucht; Juveniel; Hoofdfoto waarop het vleugelbandpatroon leesbaar is
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 6 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Roep, Zang, Vleugelbandpatroon, Alula, Flanken en wenkbrauw, Snavel en achternagel; open: Nederlandse status en aantallen niet opnieuw gecontroleerd (Sovon/Vogelbescherming).; Roep en zang van de Taigaboomkruiper nog uit een bron beschrijven.; Hoofdfoto toont de vleugelband niet scherp; soortbepaling van die foto steunt op bronmetadata (fotobaseline batch 01).; Volledige tekst van het British Birds-artikel niet gelezen.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Boomkruiper en Taigaboomkruiper zijn op deze foto niet zelfstandig te onderscheiden; soortbepaling steunt op de bron (Commons-titel 'Gartenbaumläufer').
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp067 Taigaboomkruiper — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp067.webp` | Hoofdfoto | Boomkruiper tegen dennenstam; witte onderdelen en flanken, duidelijke witte wenkbrauw. | niet vast te stellen | goed; vleugelpatroon (kritisch kenmerk) slecht zichtbaar | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Bengt Nyman from Vaxholm, Sweden |

- **Correcties:** geen
- **Ontbreekt:** In vlucht; Juveniel; Foto waarop het vleugelbandpatroon leesbaar is
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 3 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Vleugelbandpatroon, Zang en roep, Flanken en wenkbrauw; open: De hoofdfoto laat het vleugelpatroon niet goed zien; soortbepaling steunt op de bron (Commons, Certhia familiaris).; Welke vorm (nominaat of kortsnavel) de hoofdfoto toont, is niet uit de bron vast te stellen.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Soortbepaling steunt op de bron (Commons, Certhia familiaris); witte flanken en wenkbrauw passen, maar het vleugelpatroon is niet te beoordelen (REVIEW REQUIRED voor onafhankelijke bevestiging).
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp057 Fitis — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp057.webp` | Hoofdfoto | Zingende Fitis op tak; lichte poten, geelwitte onderzijde, lange handpenprojectie. | zingend, dus waarschijnlijk mannetje; niet als zodanig gelabeld | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |

- **Correcties:** FQA-04: zang alleen doorslaggevend bij een typisch, volledig lied; gemengde zang als open punt.
- **Ontbreekt:** In vlucht; Juveniel (gelere najaarsvogel)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 5 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Handpenprojectie, Kop, Poten, Seizoen; open: Spanwijdte en gewicht niet opnieuw gecontroleerd.; Verschil met Iberische Tjiftjaf alleen als waarschuwing opgenomen.; Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp056 Tjiftjaf — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp056.webp` | Hoofdfoto | Tjiftjaf op dunne tak; donkere poten, korte handpenprojectie. | niet vast te stellen | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp056-flight.webp` | Overige herkenningsfoto's (was: In vlucht) | Fladderend tussen rietstengels met gespreide vleugels; contact met stengels niet uit te sluiten. | niet vastgesteld | goed | uit-rol | opvliegen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Falco2022 |

- **Correcties:** Uit 'In vlucht' gehaald: valt onder de klasse opvliegen/tussen planten (mijlpaal 1).; FQA-04: zang alleen doorslaggevend bij een typisch, volledig lied; gemengde zang als open punt.
- **Ontbreekt:** In vlucht; Juveniel/najaarsvogel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 5 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Handpenprojectie, Staartbeweging, Poten, Seizoen; open: Spanwijdte en gewicht niet opnieuw gecontroleerd.; Iberische Tjiftjaf heeft nog geen eigen vergelijking.; Gemengde zang (vogels die elementen van beide soorten zingen) is in de geraadpleegde bronnen niet uitgewerkt; zang blijft doorslaggevend alleen bij een typisch, volledig lied.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Eerdere uitslag:** Fotobaseline batch 01 gaf VERIFIED met deze foto als vluchtfoto; vervallen.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp003 Holenduif — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp003.webp` | Hoofdfoto | Holenduif in gras, zijaanzicht; groen glanzende halsvlek, korte zwarte vleugelstrepen, donker oog. | volwassen-ogend; geslacht niet op kleed | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Chris Cant from Cumbria, UK |
| `sp003-flight.webp` | Overige herkenningsfoto's (was: In vlucht) | Vogel zet af vanaf de grond; poten raken nog de grond. Vleugelpatroon wel zichtbaar. | niet vastgesteld | matig: 485 px, zacht | uit-rol | opvliegen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Åsa Berndtsson |

- **Correcties:** Opvliegende foto uit 'In vlucht' (eigenaarsmelding) — label 'Opvliegend vanaf de grond' (vluchtcontrole ronde 1).; Veldkenmerken en kleedtekst: "zwarte vleugelpunten" → geen wit in hals/vleugel, twee korte zwarte vleugelstrepen, brede zwarte staartband (VB_HOLEN, RSPB_SD).; Zang: "oe-oe-oe steeds sneller" → eentonige reeks tweelettergrepige roepen (VB_HVH).; Lengte 30–33 → 28–32 cm; broedduur 16–18 → 16–17 dagen; nestjongen 27–28 → ca. 24 dagen (VB_HOLEN).
- **Ontbreekt:** In vlucht (geen echte vluchtfoto); Juveniel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk; geen Mannetje/Vrouwtje-vakken (bron: VB_HOLEN).
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Stuit; open: Geen goede vluchtfoto: de vorige 'vluchtfoto' toonde een opvliegende vogel en is uit de vluchtrol gehaald (positie ontbreekt).; Geen gidsfoto van een juveniel.; Kleedvariatie van stadsduiven maakt de stuit niet doorslaggevend.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Eerdere uitslag:** Fotobaseline batch 01 gaf VERIFIED inclusief de opvliegende vluchtfoto; die uitslag is vervallen.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp002 Houtduif — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp002.webp` | Hoofdfoto | Volwassen Houtduif zittend op paal, zijaanzicht; witte halsvlek, lichte iris, roze borst. | volwassen (halsvlek, lichte iris); geslacht niet op kleed | goed: scherp, vogel groot in beeld | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Stephan Sprinz |
| `sp002-flight.webp` | In vlucht | Vrij in de lucht, frontaal van onderen; vleugels gespreid, witte vleugelrand zichtbaar. | niet vastgesteld (neutraal label) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Stefan Berndtsson |

- **Correcties:** FQA-04: kritisch kenmerk 'Halsvlek en iris' gesplitst; 'Witte halsvlek' (alleen volwassen) blijft doorslaggevend, iris alleen ondersteunend.
- **Ontbreekt:** Juveniel (zonder halsvlek, wel vleugelband); Vluchtfoto van boven met volledige witte vleugelband (wenselijk)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk; geen Mannetje/Vrouwtje-vakken (bron: VB_HOUT).
- **Kennisprofiel:** 2 kritische kenmerken (2 doorslaggevend); niet doorslaggevend: —; open: Juveniel- en vluchtvergelijking met Stadsduif nog niet uit een Nederlandse bron uitgewerkt.; Geen gidsfoto van een juveniel (positie ontbreekt).; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp004 Turkse Tortel — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp004.webp` | Hoofdfoto | Turkse Tortel op sparrentop tegen blauwe lucht; zwarte halsband, rood oog. | volwassen (scherpe halsband); geslacht niet vast te stellen | voldoende: scherp, maar vogel vrij klein in beeld | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Jakub Hałun |
| `sp004-flight.webp` | In vlucht | Vrij in de lucht, zijaanzicht van onderen; staartpatroon (donkere basis, witte eindrand) zichtbaar. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Florian Pépellin |

- **Correcties:** Broedsels per jaar 3–5 → 2–5 (VB_TT).; FQA-04: tweede onafhankelijke bron voor de Zomertortel-kant (eBird, birdspot.co.uk) en uitzondering voor juvenielen zonder halstekening.
- **Ontbreekt:** Juveniel (zonder of met vage halsband); Hoofdfoto met grotere vogel (wenselijk)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslacht vaak niet op kleed te bepalen (BZ_CD); geen geslachtsvakken.
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Staart in vlucht; open: Onderscheid met Lachduif (ontsnapte vogels) nog uit een bron uitwerken.; Spanwijdte en gewicht niet in de geraadpleegde Nederlandse bron.; Geen gidsfoto van een juveniel; hoofdfoto toont de vogel vrij klein in beeld.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp089 Wilde Eend — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `7640bab7427054eeeeef30a9856dc82fcda7ddba` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp089.webp` | Hoofdfoto | Wilde-Eend-paar op de oever. De groene kop van het mannetje en het bruine kleed van het vrouwtje zijn zichtbaar. | Commons identificeert het beeld als een paar. Herkenbare geslachtskenmerken zichtbaar. | Twee vogels duidelijk zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · This picture was realized by Richard Bartz by using a Canon EF 70-300mm f/4-5.6 IS USM Lens |
| `sp089-adult_f.webp` | Verenkleed (Vrouwtje) | Zwemmend vrouwtje met bruin getekend kleed en oranje met donkere snavel. | Fotograaf noemt een vrouwtje. | Geschikt voor vrouwtjeskleed en snavel. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Roshan Kumar Ban |
| `sp089-juv-review.webp` | Verenkleed (Juvenielen) | Twee jonge Wilde Eenden met bruin getekend kleed. | Bron bevestigt twee jonge vogels. De Engelse en Franse tekst verschillen over geslacht. | Geschikt om jeugdkleed te tonen. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.5 · Marie-Lan Nguyen |
| `sp089-eclipse.webp` | Verenkleed (Eclipskleed, voorlopig) | Bruin verenkleed met een gele snavel. Dat past bij een woerd in eclipskleed. | De Engelse en Sloveense bronbijschriften spreken elkaar tegen over het geslacht. | Scherp beeld, kleedlabel voorlopig. | review | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Mihael Grmek |
| `sp089-flight.webp` | Verenkleed (Mannetje) | Woerd met geheven vleugels en poten omlaag. Dat past bij een landingshouding. | Groene kop en geelachtige snavel bevestigen een mannetje in prachtkleed. | Goed bruikbaar voor prachtkleed. | uit-rol | landen · uit-rol | VERIFIED: bronaudit 2026-11-11: zelfde opname (originele JPEG opnieuw gedownload en vergeleken na verkleinen; licentie uit de bronaudit van 09-11), CC BY-SA 4.0 · VJAnderson |
| `sp089-free-flight.webp` | In vlucht (Mannetje) | Vrij in de lucht, met voorwaarts gestrekte hals en ingetrokken poten. | Fotobron noemt een woerd. Groene kop, gele snavel en witte halsring zijn zichtbaar. | Duidelijk silhouet en herkenningsdetails. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van de originele Commons-JPEG), CC BY-SA 4.0 · Bert de Tilly |

- **Correcties:** De eerdere vluchtfoto is bij Mannetje geplaatst vanwege de neerhangende poten. Een aparte, brongeverifieerde vrije-vluchtfoto is toegevoegd.; Eclipsfoto zichtbaar gemarkeerd als voorlopig. Het juvenielenlabel noemt alleen de leeftijd.; Vergelijking met Krakeend legt uit wanneer de vleugelspiegel zichtbaar en bruikbaar is.
- **Ontbreekt:** Eenduidig bevestigde eclipsfoto
- **Verbeterwensen (eigenaar beoordeelt later):** Individueel rustportret van een mannetje in prachtkleed als extra hoofdbeeldkandidaat.
- **Geslacht:** Geslacht alleen vermeld waar bron en beeld dit dragen. De twee juvenielen worden zonder geslacht aangeduid.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Vleugelspiegel bij bruine vogels; open: De Commons-beschrijvingen spreken elkaar tegen over het geslacht op de vermoedelijke eclipsfoto. Het beeld staat daarom als voorlopig vermeld.; Bij de juvenielenfoto bevestigen de bronbeschrijvingen jonge vogels, maar verschillen ze over het geslacht. Het fotolabel vermeldt alleen de leeftijd.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** REVIEW REQUIRED: de Engelse en Sloveense bijschriften bij het vermoedelijke eclipskleed geven een verschillend geslacht.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp091 Wintertaling — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `70c4f3fec7508812ab9bb0b50833b52706ce4720` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp091-hero-male.webp` | Hoofdfoto | Zwemmende woerd met kastanjebruine kop, groen oogveld en gele staartzijde. | Bron noemt een mannetje. Zichtbaar prachtkleed. | Duidelijk zijaanzicht. | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 ed2eefdff8…), CC BY-SA 4.0 · Charles J. Sharp |
| `sp091-adult_m.webp` | Verenkleed (Mannetje) | Een andere woerd in prachtkleed met goed zichtbare flankstreep. | Bron noemt een mannetje. Kop en flank ondersteunen het label. | De flankstreep is duidelijker dan op de hoofdfoto. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Koshy Koshy from Faridabad, Haryana, India |
| `sp091-adult_f.webp` | Verenkleed (Vrouwtje) | Bruin gevlekt kleed, relatief egale kop en lichte staartzijde. | Fotograaf benoemt een vrouwtje. | Duidelijke soort- en kleedkenmerken. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Frank Vassen from Brussels, Belgium |
| `sp091-juv.webp` | Verenkleed (Juveniel) | Bruine jonge vogel met groene vleugelspiegel. | iNaturalist-annotatie Juvenile in de bronaudit van 9 november. Geen geslachtslabel. | Kleine uitsnede. Kop en vleugeltekening zijn zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Se Lena, some rights reserved (CC BY) |
| `sp091-eclipse.webp` | Verenkleed (Overgang naar eclipskleed) | Bruin getekende vogel met resterende groene kopveren. | Fotobeschrijving vermeldt een ruiend mannetje. Beeld ondersteunt overgangskleed. | Herkenbaar voorbeeld van de overgang. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Roy Lowry, some rights reserved (CC BY) |
| `sp091-flight.webp` | In vlucht (Mannetje) | Vrije vlucht met open vleugels, groene spiegel en groen oogveld. | Kop en vleugeltekening bevestigen een woerd in prachtkleed. | Helder beeld van spiegel en silhouet. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Ferran Pestaña from Barcelona, España |
| `sp091.webp` | Overige herkenningsfoto's | Mannetje in prachtkleed en bruine Wintertaling op ondiep water. | Mannetje herkenbaar. Bruine vogel vermeld zonder afzonderlijk leeftijdslabel. | Bruikbaar zij-aan-zijbeeld. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · gailhampshire from Cradley, Malvern, U.K |

- **Correcties:** De ruifoto vermeldt overgang naar eclipskleed. Het juveniel staat zonder geslachtslabel.; De vergelijking met Zomertaling legt de combinatie van kop, staartzijde en vleugel uit.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Vervang de kleine juvenielenfoto als een scherper bronbeeld met bevestigde leeftijd beschikbaar komt.
- **Geslacht:** De kaart vermeldt geslacht waar bron en verenkleed dat ondersteunen. Het juveniel blijft zonder geslachtslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kop, staartzijde en bovenvleugel bij bruine vogels; open: De iNaturalist-waarnemingen bij jeugdkleed en rui konden op 11 november niet opnieuw worden geopend. De foto-identiteit en annotaties uit de bronaudit van 9 november zijn hergebruikt. De jeugdfoto krijgt geen geslachtslabel.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** De twee iNaturalist-pagina’s waren op 11 november niet opnieuw bereikbaar. Eerder vastgelegd bronbewijs is gebruikt.
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp105 Fazant — VERIFIED

Batch M3 · 2026-11-11 · SHA `70c4f3fec7508812ab9bb0b50833b52706ce4720` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp105.webp` | Hoofdfoto | Haan met rode huid rond het oog, glanzende kop, witte halsring en lange staart. | Kenmerken bevestigen een mannetje. | Hele vogel zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC0 · Romzig |
| `sp105-adult_f.webp` | Verenkleed (Vrouwtje) | Vrouwtje Fazant op Texel, met donkere vlekken op het bruine kleed en een lange gebandeerde staart. | Fotograaf benoemt een vrouwtje. Bruin kleed en lange staart ondersteunen het label. | Scherp genoeg om tekening en staartvorm te zien. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van de originele Commons-JPEG), CC0 1.0 · Bj.schoenmakers |
| `sp105-juv.webp` | Verenkleed (Juveniel) | Jonge Fazant in Finland, met een bruin gevlekt kleed en een nog korte staart. | Fotograaf benoemt een jonge Fazant. Geslacht onbekend. | Korte staart en tekening goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van de originele Commons-JPEG), CC0 1.0 · Estormiz |
| `sp105-flight.webp` | In vlucht (Mannetje) | Vrije vlucht met gespreide, afgeronde vleugels en lange staart. | Rode huid rond het oog, halsring en kleed bevestigen het mannetje. | Zijaanzicht van de vogel uit South Dakota. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), Public domain · U.S. Fish and Wildlife Service Headquarters |

- **Correcties:** Vrouwtjesfoto van Texel en juvenielenfoto uit Finland toegevoegd. Vergelijking met Patrijs gebruikt staart en lichaamsbouw.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Haan en hen waar bron en kenmerken overeenstemmen. Juveniel zonder geslachtslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Staartlengte en bouw bij bruine vogels; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp077 Fuut — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `7640bab7427054eeeeef30a9856dc82fcda7ddba` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp077.webp` | Hoofdfoto | Zwemmende Fuut in prachtkleed. De lange hals, spitse snavel en roodbruine kraag zijn zichtbaar. | Geslacht niet benoemd door de bron. | Helder zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp077-juv.webp` | Verenkleed (Juveniel) | Zwemmende jonge Fuut met zwart-wit gestreepte kop en hals. | Fotograaf noemt het dier juveniel. Geslacht onbekend. | Heldere leeftijdskenmerken. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |

- **Correcties:** Wintervergelijking met Roodhalsfuut toegevoegd met aandacht voor halsdikte en snavelbasis.
- **Ontbreekt:** Geverifieerde vrije-vluchtfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Mannetje en vrouwtje hebben gelijkend kleed. De hoofdfoto behoudt een neutraal label.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel en hals in winterkleed; open: Een geverifieerde vluchtfoto ontbreekt. De volwassen hoofdfoto heeft een neutraal geslachtslabel.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp086 Grauwe Gans — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `7640bab7427054eeeeef30a9856dc82fcda7ddba` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp086.webp` | Hoofdfoto | Grauwe Gans op gras. Stevige oranje snavel, roze poten en grijsbruine veren zichtbaar. | Geslacht niet benoemd door de bron. | Gehele vogel en herkenningsdetails goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Diliff |
| `sp086-flight.webp` | In vlucht | Grauwe Gans vrij in de lucht, met gestrekte hals en achterwaarts gehouden poten. | Geslacht niet benoemd door de bron. | Heldere vleugelvorm en snavel. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp086-juv.webp` | Overige herkenningsfoto’s (Donsjong) | Jonge Grauwe Gans met duidelijk dons en beginnende veerontwikkeling. | Bron noemt jong dier. Beeld toont donskleed. Geslacht onbekend. | Geschikt als voorbeeld van donskleed. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Tuxyso |

- **Correcties:** Vergelijking met Kolgans behandelt het ontbreken van kol en buikstrepen bij jonge Kolganzen.
- **Ontbreekt:** Afzonderlijke foto van een ouder juveniel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De bestaande beelden behouden neutrale labels. Het donsjong heeft een afzonderlijk leeftijdslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel, kol en buik; open: De jonge vogel op de kaart is een donsjong. Een afzonderlijke foto van een ouder juveniel ontbreekt.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp141 Gierzwaluw — VERIFIED

Batch M3 · 2026-11-11 · SHA `70c4f3fec7508812ab9bb0b50833b52706ce4720` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp141-adult.webp` | Hoofdfoto | Vrije vlucht van onderaf met donker silhouet en lange sikkelvleugels. | Fotograaf benoemt de soort. Geslacht en exacte leeftijd onbekend. | Goed overzicht van het typische silhouet. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp141-juv.webp` | Verenkleed (Juveniel) | Juveniele Gierzwaluw tijdens opvang na redding, met lichte veerranden op kop en vleugels. | Fotograaf benoemt een juveniel. Lichte veerranden zichtbaar. Geslacht onbekend. | Detailfoto uit opvang. De context staat bij de foto. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van de originele Commons-JPEG), CC BY 4.0 · Marie-Lan Taÿ Pamart |
| `sp141-flight.webp` | In vlucht | Gierzwaluw in vrije vlucht, met lange, smalle vleugels en een gespreide gevorkte staart. | De bron bevestigt soort en vlucht. Leeftijd en geslacht onbekend. | Andere opname en kijkhoek dan de hoofdfoto. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van de originele Commons-JPEG), CC BY 4.0 · Alexis Lours |

- **Correcties:** Een juvenielenfoto met expliciete opvangcontext en een afzonderlijke vrije-vluchtfoto toegevoegd. De kaart benoemt overeenkomend verenkleed bij mannetje en vrouwtje.; Herkenningsprofiel vergelijkt Gierzwaluw met Boerenzwaluw en Huiszwaluw.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Een duidelijk juveniel in een natuurlijke situatie als aanvullende foto, zodra leeftijd, bron en licentie bevestigd zijn.
- **Geslacht:** Neutrale labels. De geslachten hebben hetzelfde verenkleed.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Vleugelvorm, onderzijde en staart in vlucht; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** De fotograaf vermeldt bij beide vluchtfoto’s geen exacte leeftijd.
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp063 Goudhaantje — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `ae8b8a4daeeb3e89cde4523ea05f33e14fe8b44f` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp063.webp` | Hoofdfoto | Scherp zijaanzicht op een tak. Het donkere oog, de lichte vleugelstrepen en de gele kruinstreep zijn zichtbaar. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Gezicht en vleugeltekening zijn goed leesbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp063-juv.webp` | Verenkleed (Juveniel) | Jonge vogel op een naaldboomtak. De opvallende gekleurde kruinstreep ontbreekt. | Bron noemt de vogel juveniel. Geslacht niet vermeld. | Goed bruikbaar voor vergelijking met het volwassen kleed. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Silmethule |
| `sp063-flight.webp` | In vlucht | Vrij in de lucht tussen takken. De bron vermeldt de Oost-Aziatische ondersoort japonensis. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Bewegingsonscherpte beperkt de herkenningsdetails. | voorwaardelijk | vlucht · voorwaardelijk | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Alpsdake |

- **Correcties:** Vluchtfoto blijft in de vluchtsectie met de aanduiding Voorlopige foto. De ondersoort staat zichtbaar in het bijschrift.; Kennisprofiel vergelijkt het gezicht met Vuurgoudhaan en vermeldt de beperking van een gele kruin voor geslachtsbepaling.
- **Ontbreekt:** Afzonderlijke mannetjesfoto; Afzonderlijke vrouwtjesfoto; Scherpe Europese vluchtfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Oranje kan bij mannetjes verborgen zijn. De hoofdfoto en de vluchtfoto krijgen zonder bronbewijs een neutraal label.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Wenkbrauw en oogstreep; open: De hoofdfoto heeft geen bevestigd geslachtslabel. Afzonderlijke mannetjes- en vrouwtjesfoto’s en een scherpere Europese vluchtfoto ontbreken.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** De fotograaf van de hoofdfoto noemt geen geslacht. De zichtbare gele kruin is onvoldoende voor het label Vrouwtje.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp173 Bruine Kiekendief — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp173-hero-male.webp` | Hoofdfoto | Mannetje in vlucht van onderen; lichte ondervleugel met zwarte punten, roestbruine buik. | volwassen mannetje (bron: 'Männliche Rohrweihe') | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: geverifieerde import 09-11 (SHA-1 c07a256fef…), CC BY 4.0 · Stephan Sprinz |
| `sp173-female-rest.webp` | Vrouwtje | Vrouwtje op tak in wilg; donkerbruin met roomwitte kop, gele poten. | vrouwtje (bron: Weibchen; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Andreas Eichler |
| `sp173-juv.webp` | Juveniel (landend, niet in vlucht) | Jonge vogel strijkt met hangende poten neer in riet. | juveniel (iNaturalist: Life Stage Juvenile) | voldoende | goedgekeurd | landen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Codrin Bucur, some rights reserved (CC BY) |
| `sp173-male-2.webp` | In vlucht (Mannetje) | Vrij in de lucht; grijze armpennen, zwarte punten, roestbruine buik. | mannetje (kleed: grijze vleugels en staart) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: geverifieerde import 09-11 (SHA-1 064e8f9728…), CC BY-SA 4.0 · Charles J. Sharp |
| `sp173-adult_f.webp` | In vlucht (Vrouwtje) | Vrouwtje vliegt vrij; donkerbruin met roomwitte kop. | vrouwtje (bron: 'female'; kleed bevestigt) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC0 · Matti Virtala |
| `sp173.webp` | In vlucht | Vrij in de lucht van opzij; bruine vogel. | bron noemt 'adult male', maar grijze vleugelvelden ontbreken op het beeld: terecht zonder geslachtslabel (bronaudit 09-11) | goed; watermerk maker | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Hari K Patibanda |

- **Correcties:** FQA-01 (eerder in deze PR): vrouwtje in vlucht naar In vlucht met label Vrouwtje.
- **Ontbreekt:** Mannetje zittend
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen duidelijk (VB_BRK); labels door beeld en bron bevestigd.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Silhouet en vleugelhouding, Geslacht en leeftijd; open: Hoofdfoto is een vluchtfoto (eigenaarsbesluit 'hoofdfoto als enige vluchtfoto' open).; Geen zittende foto van een mannetje.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Hoofdfoto is een vluchtfoto (open eigenaarsbesluit over hoofdfoto's die vluchtfoto zijn).
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp005 Buizerd — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

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
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslacht niet op kleed te zien; alle foto's zonder geslachtslabel (bronaudit 09-11).
- **Kennisprofiel:** 6 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kop, Vleugelhouding en -slag, Staart, Iris, Kleur, Geluid; open: Onderscheid met Ruigpootbuizerd uit een bron uitwerken.; Leefgebied niet opnieuw gecontroleerd.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Registersleutels 'adult_m' en bestandsnamen 'male/female' suggereren geslacht; de kaart toont dat niet. Hernoemen is cosmetisch en niet uitgevoerd.; ChatGPT-QA markeerde de Buizerd als REVIEW REQUIRED tot het rolconflict juveniel/vlucht is opgelost; opgelost in deze herstelronde, onafhankelijke hercontrole open.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp007 Havik — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp007-hero-male.webp` | Hoofdfoto | Volwassen Havik in naaldboom; donkergrijze rug, fijn gebandeerde borst, oranjerood oog, lichte wenkbrauw. | volwassen (bron: 'Male northern goshawk'); geslacht niet als label getoond op de hoofdfoto | goed | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 7d6ecbe1e4…), CC BY 2.0 · Andrey Gulivanov |
| `sp007.webp` | Mannetje | Volwassen Havik op tak tegen lichte lucht; grijs, fijn dwars gebandeerd. | mannetje (bron: 'Male northern goshawk'; kleed past bij volwassen vogel) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Andrey Gulivanov |
| `sp007-juv.webp` | Juveniel | Jonge Havik op tak; bruin van boven, onderzijde in de lengte gestreept. | juveniel (bron: 'Juvenile northern goshawk'; lengtestrepen bevestigen) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Andrey Gulivanov |
| `sp007-male-flight.webp` | In vlucht (Mannetje) | Vrij in de lucht van opzij-onder; grijs gebandeerd, witte onderstaartdekveren. | mannetje (iNaturalist: Sex Male) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Вячеслав Юсупов, some rights reserved (CC BY) |
| `sp007-adult_f.webp` | In vlucht (Vrouwtje) | Vrij in de lucht van onderen; brede vleugels, gebandeerde onderzijde, afgeronde staart. | volwassen vrouwtje (iNaturalist: Life Stage Adult, Sex Female) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) WATANABE Hitoshi 渡辺仁, some rights reserved (CC BY) |
| `sp007-flight.webp` | In vlucht | Vrij in de lucht van opzij; bruinig met lengtestrepen onder — oogt als jonge vogel. | niet vastgesteld; lijkt juveniel, bron zegt het niet (REVIEW REQUIRED, label blijft neutraal) | voldoende: vogel klein in beeld | review | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Ken Billington |

- **Correcties:** geen
- **Ontbreekt:** Vrouwtje zittend (alleen in vlucht aanwezig; Vrouwtje-kaart verwijst naar In vlucht)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen vooral in grootte; labels Mannetje/Vrouwtje steunen op de foto-bron.
- **Kennisprofiel:** 3 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Kop en staart in vlucht, Grootte; open: Geslachtsverschil in kleed niet uit een bron vastgelegd; Birdspot-labels Mannetje/Vrouwtje steunen op de foto-bron (Commons/iNaturalist).; Neutrale vluchtfoto (sp007-flight) lijkt een jonge vogel; leeftijd niet uit de bron vast te stellen (REVIEW REQUIRED).; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Neutrale vluchtfoto oogt juveniel; leeftijd niet uit de bron vast te stellen (REVIEW REQUIRED).
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp253 Ruigpootbuizerd — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `11c3751aecaabc37b41feb23fd364fe3298ce1dd` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp253-male-rest.webp` | Hoofdfoto | Ruigpootbuizerd op paal in sneeuwlandschap; lichte kop, donkere flanken/buik. | iNaturalist: Male; geen label op de hoofdfoto | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Spencer Hurt, some rights reserved (CC BY) |
| `sp253-male-flight.webp` | In vlucht (Mannetje) | Vrij in de lucht met zicht op donkere borst en gevlekte vleugels. De staart is gedeeltelijk zichtbaar. | Mannetje volgens de vastgelegde iNaturalist-annotatie. Houding en uitsnede beperken de zelfstandige controle van de volledige staartbandering. | voldoende: licht zacht | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY SA · (c) psweet, some rights reserved (CC BY-SA) |
| `sp253.webp` | In vlucht (Vrouwtje) | Vrij in de lucht van onderen; lichte kop, donker buikschild, witte staartbasis met één brede eindband. | vrouwtje (bron: 'female'; buikschild en één eindband passen bij VB_BVR) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · dfaulder |
| `sp253-juv.webp` | In vlucht (Juveniel) | Jonge vogel vrij in de lucht; gespreide vleugels en staart. | juveniel (iNaturalist: Life Stage Juvenile) | goed; watermerk maker | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Radek Ošlejšek, some rights reserved (CC BY) |

- **Correcties:** FQA-01 (eerder in deze PR): juveniel in vlucht naar In vlucht met label Juveniel.; 11-11-2026: vier eigen foto’s onafhankelijk visueel herbekeken. Verschil tussen lichte vrouwtjes en juvenielen in het kennisprofiel als ondersteunend beschreven met Europese en Noord-Amerikaanse bronnen.
- **Ontbreekt:** Afzonderlijke rustfoto van vrouwtje; Afzonderlijke rustfoto van juveniel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De kleden kunnen in de buik- en staarttekening verschillen en deels overlappen. Foto-annotaties en waarneembare kenmerken worden samen gelezen.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Staartcontrast, Geslacht en leeftijd; open: De drie iNaturalist-bronpagina’s konden tijdens de hercontrole niet opnieuw worden geopend. De fotolabels steunen op het vastgelegde bronbewijs van 9 november en zijn niet opnieuw tegen de oorspronkelijke annotaties bevestigd.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** De drie iNaturalist-foto’s zijn gekoppeld aan de geverifieerde opname en annotaties uit de bronaudit van 9 november. De actuele primaire fotopagina’s en waarnemingen waren bij de hercontrole niet bereikbaar.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp006 Sperwer — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp006-hero-male.webp` | Hoofdfoto | Volwassen mannetje op stronk met geheven vleugels; blauwgrijze bovendelen, oranje wangen en flanken. | volwassen mannetje (bron: 'Male'; kleed bevestigt) | goed; vleugels bedekken deel van de rug | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 c6bec5e043…), CC BY 2.0 · caroline legg |
| `sp006.webp` | Mannetje | Volwassen mannetje zittend, zijaanzicht; blauwgrijze rug, roestkleurige onderzijde. | volwassen mannetje (bron: 'Male Sparrowhawk'; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-adult_f.webp` | Vrouwtje | Vrouwtje met gespreide vleugels op stronk; grijsbruine bovendelen, fijn gebandeerde borst, witte wenkbrauw. | volwassen vrouwtje (bron: 'Female Sparrowhawk'; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-juv.webp` | Juveniel | Jonge Sperwer op gras; bruine bovendelen, grove bruine dwarsbandering. | juveniel (bron: 'Female Juvenile Sparrowhawk') | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp006-flight.webp` | In vlucht | Vrij in de lucht van onderen; korte brede vleugels, gebandeerde staart met rechte hoeken, roestige onderzijde. | niet vastgesteld op de kaart (neutraal label) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |

- **Correcties:** geen
- **Ontbreekt:** Vrouwtje in vlucht (wenselijk)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen duidelijk (VB_SPERWER_MV); mannetje en vrouwtje getoond met bronbevestiging.
- **Kennisprofiel:** 6 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Staartpunt, Kop en vleugels in vlucht, Vliegstijl, Roep, Grootte; open: Leeftijdsbepaling in vlucht nog uit een bron beschrijven.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp248 Wespendief — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp248.webp` | Hoofdfoto | Wespendief in vlucht van onderen; smalle kop, staart met brede banden, gebandeerde ondervleugel. | volwassen mannetje volgens iNaturalist (Adult, Male); geen label op de hoofdfoto | goed; watermerk maker | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY SA · (c) Gianluca Congi🪶🦆🌲, some rights reserved (CC BY-SA) |
| `sp248-male-rest.webp` | Mannetje | Wespendief zittend in boom; grijsbruine kop, geel-oranje oog. | volwassen mannetje (iNaturalist: Adult, Male) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Павел Кунгуров, some rights reserved (CC BY) |
| `sp248-adult_f.webp` | In vlucht (Vrouwtje) | Vrij in de lucht van onderen; bruin gebandeerd, staartbanden zichtbaar. | volwassen vrouwtje (iNaturalist: Adult, Female) | matig: vogel klein in beeld | voorwaardelijk | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Donald Davesne, some rights reserved (CC BY) |
| `sp248-juv.webp` | In vlucht (Juveniel) | Jonge Wespendief vrij in de lucht van onderen; bruine onderzijde. | juveniel (bron: 'Juvenile honey buzzard') | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Andrey Gulivanov |

- **Correcties:** geen
- **Ontbreekt:** Vrouwtje zittend; Scherpere/grotere vrouwtje-vluchtfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen; labels steunen op iNaturalist-annotaties.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kop en staart, Vleugelhouding; open: Geslachtskenmerken (grijze kop man, oogkleur) nog uit een tweede bron vastleggen.; Vrouwtje in vlucht klein in beeld; vervanging gewenst.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Geslachtskenmerken van Wespendief nog niet uit een tweede bron vastgelegd (zie kennisprofiel).
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp054 Heggenmus — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `11c3751aecaabc37b41feb23fd364fe3298ce1dd` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp054.webp` | Hoofdfoto | Heggenmus in zijaanzicht op een tak. De fijne spitse snavel en bruin gestreepte rug zijn zichtbaar. | Fotobron bevestigt de soort. Leeftijd en geslacht zijn niet expliciet geannoteerd. | Scherp beeld met vrij zicht op de kop en snavel. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC0 · Hobbyfotowiki Camera location 51° 10′ 43.32″ N, 7° 00′ 23.65″ E View this and other nearby images on: OpenStreetMap 51.178700; 7.006570 |

- **Correcties:** Bronprofiel met het snavelverschil ten opzichte van Huismus en het leeftijdsvoorbehoud bij de grijze kop en borst.
- **Ontbreekt:** Afzonderlijke juvenielenfoto; Vrije-vluchtfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten zijn uiterlijk gelijkend. De kaart houdt de hoofdfoto neutraal.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel en kop; open: Een afzonderlijke juvenielenfoto, een vrije-vluchtfoto en een eigen geluidsopname voor de gids ontbreken.; resterende dataverschillen: 1
- **Browser:** NOT TESTED
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp021 Ekster — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp021.webp` | Hoofdfoto | Ekster op tak; zwart-wit kleed, glanzende staart en blauwe vleugelglans. | volwassen-ogend; geslachten gelijk | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp021-flight.webp` | In vlucht | Vrij in de lucht boven water; gespreide zwart-witte vleugels met witte handvleugel, lange staart. Geen contact met de steen rechtsonder. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |

- **Correcties:** Lengte 44–46 → 46–50 cm; broedduur 17–18 → 17–24 dagen; nestjongen 24–30 → 22–30 dagen (VB_EKSTER).
- **Ontbreekt:** Juveniel (kortere staart)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk; geen geslachtsvakken.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kleedpatroon en staart; open: Juveniel kleed en leefgebied niet opnieuw gecontroleerd tegen een bron.; Vergelijking met Gaai is bestaande Birdspot-inhoud, niet opnieuw gecontroleerd.; Kleedpatroon is in Nederland vrijwel onmiskenbaar, maar staat op "Helpt" tot een tweede, onafhankelijke bron is vastgelegd (regel doorslaggevend, 10-11-2026).; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp026 Gaai — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp026.webp` | Hoofdfoto | Gaai op tak met eikel; blauw vleugelveld en baardstreep. | niet vast te stellen | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Hwbund |
| `sp026-flight.webp` | In vlucht | Vrij in de lucht laag boven grasland; blauw-zwart gebandeerde vleugels, witte stuit; poten ingetrokken. | niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Giles Laurent |

- **Correcties:** Maten en broedgegevens naar de bron: lengte 32–36 cm, spanwijdte 50–60 cm, 5–7 eieren, broedduur 16–21 dagen, nestjongen 19–21 dagen (VB_GAAI).
- **Ontbreekt:** Juveniel
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk; geen geslachtsvakken.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kleedpatroon; open: Juveniel kleed niet uit een bron beschreven; geen gidsfoto van een juveniel.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp025 Kauw — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `11c3751aecaabc37b41feb23fd364fe3298ce1dd` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp025.webp` | Hoofdfoto | Kauw in zijaanzicht op een tak. Lichte iris, grijze nek en de korte donkere snavel zijn zichtbaar. | Fotobron bevestigt de soort. Leeftijd en geslacht zijn niet expliciet geannoteerd. | Scherpe, goed leesbare kop. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp025-flight.webp` | Overige herkenningsfoto’s (landingshouding) | Frontaal beeld met uitgespreide staart en vooruitgestoken poten tussen takken. | Leeftijd en geslacht zijn niet bevestigd door de fotobron. | Bruikbaar als aanvullende herkenningsfoto. | uit-rol | landen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · hedera.baltica from Wrocław, Poland |

- **Correcties:** De bestaande landingsfoto blijft buiten In vlucht. Het kennisprofiel maakt het leeftijdsvoorbehoud bij oogkleur expliciet.
- **Ontbreekt:** Afzonderlijke juvenielenfoto; Vrije-vluchtfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten zijn uiterlijk gelijkend. De kaart houdt beide foto’s neutraal.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Iris en achterhoofd; open: Een afzonderlijke juvenielenfoto, een vrije-vluchtfoto en een eigen geluidsopname voor de gids ontbreken.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** De fotobron noemt het beeld in algemene zin “in flight”. De zichtbare poten en houding ondersteunen de specifiekere Birdspot-indeling als landingshouding.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp022 Zwarte Kraai — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `11c3751aecaabc37b41feb23fd364fe3298ce1dd` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp022.webp` | Hoofdfoto | Zwarte kraai in zijaanzicht op een tak. De krachtige snavel, kop en het zwarte kleed zijn zichtbaar. | Leeftijd en geslacht zijn niet bevestigd door de fotobron. | Scherp zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp022-flight.webp` | In vlucht | Vogel vrij in de lucht met gespreide vleugels. De foto en bronbeschrijving tonen dezelfde vluchtrol. | Leeftijd en geslacht zijn niet bevestigd door de fotobron. | Bruikbaar voor silhouet en vleugelvorm. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Marie-Lan Taÿ Pamart |

- **Correcties:** Bronprofiel met vergelijking met Roek en Kauw. De snavelbasis is bij jonge Roeken geen betrouwbaar enkelvoudig onderscheid.; Lengte en spanwijdte als indicatieve band berekend met Vogelbescherming en RSPB.
- **Ontbreekt:** Afzonderlijke juvenielenfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten zijn uiterlijk gelijkend. De kaart houdt deze foto’s neutraal.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavelbasis; open: Een afzonderlijke juvenielenfoto en een eigen geluidsopname voor de gids ontbreken.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp068 Witte Kwikstaart — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `ae8b8a4daeeb3e89cde4523ea05f33e14fe8b44f` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp068.webp` | Hoofdfoto | Vogel op een tak met zwart-witte kop, donkere keel en lange staart. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Scherp portret met herkenbare kop en staart. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Stephan Sprinz |
| `sp068-flight.webp` | In vlucht | Vrij in de lucht. Gespreide vleugels en lichte buitenste staartveren zijn zichtbaar. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Bruikbaar voor het vluchtbeeld. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Tranceliner |

- **Correcties:** De vergelijking met Rouwkwikstaart let op rug, stuit en flanken samen en benoemt variatie naar leeftijd, geslacht en seizoen.; Prachtkleed van het vrouwtje omschreven via de begrenzing van de koptekening.
- **Ontbreekt:** Afzonderlijke mannetjesfoto; Afzonderlijke vrouwtjesfoto; Afzonderlijke juvenielenfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De koptekening kan verschillen per kleed. De twee foto’s behouden neutrale labels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Rug, stuit en flanken; open: Afzonderlijke mannetjes-, vrouwtjes- en juvenielenfoto’s en lokale gidsaudio ontbreken. De bestaande foto’s krijgen geen nieuw leeftijds- of geslachtslabel.; resterende dataverschillen: 0
- **Browser:** NOT TESTED
- **Onzeker:** De vluchtfoto bevestigt de soort en de vluchtrol. De ondersoort is bij deze opname niet geverifieerd.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp070 Veldleeuwerik — PARTIALLY TESTED

Batch M3 · 2026-11-11 · SHA `ae8b8a4daeeb3e89cde4523ea05f33e14fe8b44f` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser NOT TESTED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp070.webp` | Hoofdfoto | Zijaanzicht op gras met voedsel in de snavel. Streping van borst en rug is zichtbaar. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Bruikbaar voor bouw en kleed. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · User:Diliff |
| `sp070-flight.webp` | In vlucht | Vrije vlucht van opzij met geheven vleugels en duidelijk silhouet. | Geen geslacht of exacte leeftijd bevestigd door de fotobron. | Bruikbaar voor het vluchtbeeld. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |

- **Correcties:** Kennisprofiel vergelijkt staart en vleugelvorm met Boomleeuwerik.; Broedduur en nestjongenperiode volgen Sovon. De oude kaart toonde dagen tot vliegvlug onder Jongen in nest.
- **Ontbreekt:** Afzonderlijke juvenielenfoto
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De bestaande foto’s blijven neutraal bij gebrek aan bevestigde geslachtslabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Staart en vleugels in vlucht; open: Een afzonderlijke juvenielenfoto en lokale gidsaudio ontbreken. De bestaande foto’s bevestigen geen geslacht.; resterende dataverschillen: 1
- **Browser:** NOT TESTED
- **Onzeker:** Sovon noemt 11 dagen in het nest. Vogelbescherming noemt circa 8 dagen. De bronafwijking staat in het kennisprofiel.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp048 Koperwiek — PARTIALLY TESTED

Batch M4 · 2026-11-11 · SHA `7cdfd22b58495a91552ef3f1cfa61906a11f5760` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp048.webp` | Hoofdfoto | Koperwiek met lichte wenkbrauw, gestreepte borst en roestrode flank. | Geslacht onbekend. | Herkenbaar zijaanzicht van kop en flank. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |
| `sp048-juv.webp` | Verenkleed (Juveniel) | Jonge Koperwiek met lichte wenkbrauwstreep, gevlekte borst en lichte veerpunten. | iNaturalist Research Grade met annotatie Juvenile. Geslacht onbekend. | Kop, borst en vleugeldekveren zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele JPEG zonder uitsnede), CC BY 4.0 · Pyry Liedes |
| `sp048-flight.webp` | Overige herkenningsfoto's (Opvliegend tussen planten) | Vogel tussen de vegetatie met uitgestrekte vleugels en neerhangende poten. | Geslacht en exacte leeftijd onbekend. | Bruikbaar voor houding en ondervleugel. Vrije vlucht onvoldoende overtuigend door de opstijghouding en de vegetatie. | uit-rol | opvliegen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Lucas Golden |

- **Correcties:** Juvenielenfoto en vergelijking met Zanglijster toegevoegd. De Nederlandse broedstatus is gecorrigeerd. Het kennisprofiel legt de grens van het Sovon-territoriumbewijs vast.
- **Ontbreekt:** Geverifieerde, goed herkenbare foto in vrije vlucht.
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Verenkleed van beide geslachten gelijk. Neutrale fotolabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Wenkbrauw en kleur onder de vleugel; open: —; resterende dataverschillen: 2
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik, broedstatus en afwezigheid van een Nederlandse broedkalender
- **Onzeker:** De bestaande opname toont opvliegen tussen planten. Ze blijft in de aanvullende sectie.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp047 Kramsvogel — VERIFIED

Batch M4 · 2026-11-11 · SHA `ffa1c97b6f736b1c6f5df5cfd4f3fcfd5b0748d7` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp047.webp` | Hoofdfoto | Kramsvogel op de grond, met grijze kop, warmbruine mantel en gevlekte borst. | Geslacht onbekend. | Goed zijaanzicht van kop, mantel en borst. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Frankie Fouganthin |
| `sp047-juv.webp` | Verenkleed (Juveniel) | Juveniele Kramsvogel met gevlekte borst, bruingrijze kop en minder sterk contrast tussen kop en rug. | De fotograaf benoemt een juveniel. Geslacht onbekend. | Voldoende detail op kop en borst. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 2.0 · hedera.baltica |
| `sp047-flight.webp` | In vlucht | Vogel los van ondergrond en takken, met gespreide vleugels en lichte ondervleugeldekveren. | Geslacht en exacte leeftijd onbekend. | Vleugels zichtbaar. Takken maken de achtergrond druk. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Hangsna |

- **Correcties:** Brongeverifieerd juveniel toegevoegd. Vergelijking met Koperwiek toont kop en flank. De vluchtvergelijking met Zanglijster gebruikt ondervleugeldekveren.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geen geslacht vastgesteld. Veldfoto’s tonen de fijne veerdetails onvoldoende.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kop, stuit en ondervleugel; open: —; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp045 Merel — PARTIALLY TESTED

Batch M4 · 2026-11-11 · SHA `ffa1c97b6f736b1c6f5df5cfd4f3fcfd5b0748d7` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp045-hero-male.webp` | Hoofdfoto | Merel op de grond met zwart kleed en geel-oranje snavel. | Fotograaf benoemt een mannetje. Snavel en kleed ondersteunen dat. | Scherp zijaanzicht. | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 461e691ba6…), CC BY 2.0 · Luiz Lapa from Oeiras, Portugal |
| `sp045.webp` | Verenkleed (Mannetje) | Mannetje op gras, met zichtbare oogring, snavel en staart. | Kleed, snavel en oogring bevestigen het mannetje. | Duidelijke kop en staart. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |
| `sp045-flight.webp` | Verenkleed (Mannetje, landend) | Mannetje met open vleugels en vooruit gestrekte poten. | Zwart kleed, geelachtige snavel en oogring. | Bruikbaar voor kleed en landingshouding. | uit-rol | landen · uit-rol | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Bengt Nyman from Vaxholm, Sweden |
| `sp045-adult_f.webp` | Verenkleed (Vrouwtje) | Vrouwtje op een tak met donkerbruin kleed en lichter getekende borst. | Fotograaf benoemt een vrouwtje. Bruin kleed ondersteunt dit. | Borsttekening goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Rupdeb |
| `sp045-juv.webp` | Verenkleed (Juveniel) | Bruin jong met lichte en roestkleurige spikkels op het verenkleed. | Brondossier 9 november vermeldt juveniel. Geslacht onbekend. | Kleed op kop, borst en rug herkenbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · hedera.baltica from Wrocław, Poland |
| `sp045-free-flight.webp` | In vlucht (Mannetje, voorlopig) | Merel in vrije vlucht met de vleugels omlaag. Uitsnede van de bovenste vogel. | Commons categoriseert het beeld als mannetje. Kleed en snavel ondersteunen dat. | De staart is deels afgedekt. Bewegingsonscherpte beperkt het vleugeldetail. | voorwaardelijk | vlucht · voorwaardelijk | VERIFIED: bronaudit 2026-11-11: zelfde opname (uitsnede uit originele Commons-JPEG, daarna WebP), CC0 1.0 · Alf Beard |

- **Correcties:** Aparte voorlopige vrije-vluchtfoto toegevoegd. De landingsopname blijft in de kleedgroep. De bruine Merel wordt met Zanglijster vergeleken.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Scherpe vrije-vluchtfoto met de staart en vleugels volledig zichtbaar.
- **Geslacht:** Mannetje en vrouwtje waar bron en beeld dat dragen. Het juveniel blijft zonder geslachtslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Borstgrondkleur en staart bij bruine vogels; open: De vluchtopname is echt, maar de staart is deels afgedekt en de vleugels zijn niet overal scherp. De foto staat als voorlopig.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** De nieuwe vluchtfoto is bruikbaar als voorlopig voorbeeld, met beperkte zichtbaarheid van de staart en bewegingsonscherpte.
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp046 Zanglijster — VERIFIED

Batch M4 · 2026-11-11 · SHA `ffa1c97b6f736b1c6f5df5cfd4f3fcfd5b0748d7` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp046.webp` | Hoofdfoto | Lijster op een tak met bruine bovendelen en donkere vlekken op een lichte onderzijde. | Geslacht onbekend. | Borsttekening en vleugel goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |
| `sp046-juv.webp` | Verenkleed (Juveniel) | Juveniele Zanglijster met lichte tekening op de bovenzijde en een gevlekte borst. | De fotograaf benoemt een juveniel. Geslacht onbekend. | Voldoende detail in rug en vleugeldekveren. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY 2.0 · Frank Vassen |
| `sp046-flight.webp` | In vlucht | Zanglijster vrij in de lucht met uitgespreide vleugels en warm gekleurde ondervleugeldekveren. | Geslacht en exacte leeftijd onbekend. | Herkenbare borsttekening en ondervleugelkleur. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Mark Kilner |

- **Correcties:** Brongeverifieerd juveniel toegevoegd. De vergelijkingen tonen verschillen met Grote Lijster, Merel en Kramsvogel.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De geslachten hebben gelijk verenkleed. Neutrale fotolabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Borstvlekken en ondervleugeldekveren; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp095 Kleine Mantelmeeuw — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp095.webp` | Hoofdfoto | Volwassen Kleine Mantelmeeuw op strand; donkergrijze mantel, gele poten. | volwassen | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Stephan Sprinz |
| `sp095-flight.webp` | In vlucht | Volwassen vogel vrij in de lucht; donkere bovenvleugel, zwarte vleugelpunten. | volwassen; geslacht niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |

- **Correcties:** geen
- **Ontbreekt:** Juveniel / onvolwassen kleden
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Mantel en poten (volwassen), Tertials eerstejaars; open: Spanwijdte in de bron lijkt onvolledig; tweede bron nodig voordat de Birdspot-waarde wordt aangepast.; Geen foto's van onvolwassen kleden.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp096 Stormmeeuw — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp096.webp` | Hoofdfoto | Volwassen Stormmeeuw op steen; donker oog, gele dunne snavel, geelgroene poten. | volwassen (bron: adult breeding) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp096-flight.webp` | In vlucht | Volwassen vogel vrij in de lucht van onderen; zwarte vleugelpunten. | volwassen (bron: adult breeding) | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |

- **Correcties:** geen
- **Ontbreekt:** Juveniel / onvolwassen kleden
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel, oog en poten; open: Lengte-bovengrens in de bron lijkt een fout; tweede bron nodig.; Geen foto's van onvolwassen kleden.; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp094 Zilvermeeuw — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp094.webp` | Hoofdfoto | Volwassen Zilvermeeuw op ijs; grijze mantel, witte kop, roze poten, zwarte vleugelpunten. | volwassen (adult kleed) | voldoende: scherp, vogel vrij klein in beeld | voorwaardelijk | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Stephan Sprinz |
| `sp094-flight.webp` | In vlucht | Volwassen vogel vrij in de lucht boven zee; lichtgrijze bovenvleugel, zwarte vleugelpunten met witte vlekken. | volwassen; geslacht niet vastgesteld | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.5 · Andreas Trepte |

- **Correcties:** Lengte 54–60 → 55–67 cm; spanwijdte 123–148 → 125–155 cm (VB_ZILV).
- **Ontbreekt:** Juveniel / eerste kalenderjaar; Onvolwassen kleden (leeftijdsreeks)
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten gelijk.
- **Kennisprofiel:** 3 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Pootkleur, Tertials eerstejaars, Leeftijd; open: Snavel- en oogkleur per leeftijd uit een bron beschrijven.; Onderscheid met Pontische Meeuw uitwerken.; Kopstreping in winterkleed is in de bron alleen als foto te zien.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review; ontbrekende/zwakke foto-posities later gecontroleerd aanvullen

### sp029 Koolmees — VERIFIED

Batch M4 · 2026-11-11 · SHA `635d78a2eae05c63bfbb43f8d9a5dc1d550c7fde` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp029-adult_m.webp` | Hoofdfoto (Mannetje) | Mannetje Koolmees met zwarte kop, witte wang en brede donkere buikstreep. | Fotograaf vermeldt een mannetje. Brede buikstreep zichtbaar. | Herkenbare kop en onderzijde. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 4.0 · Charles J. Sharp |
| `sp029-adult_f.webp` | Verenkleed (Vrouwtje) | Vrouwtje Koolmees met witte wangen en een smalle, onderbroken donkere buikstreep. | Fotograaf vermeldt een vrouwtje. Smalle, onderbroken buikstreep zichtbaar. | Vooraanzicht toont de streep goed. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 4.0 · Evas-naturfotografie |
| `sp029-juv.webp` | Verenkleed (Juveniel) | Juveniele Koolmees met doffe kap, lichte wang en lichte mondhoek. | Fotograaf vermeldt een juveniel. Geslacht onbekend. | Scherpe kop en mondhoek. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY 2.0 · caroline legg |
| `sp029-flight.webp` | In vlucht | Vrij in de lucht met uitgespreide vleugel. Zwarte kop, lichte wang en gele onderzijde zichtbaar. | Geen betrouwbaar geslachts- of leeftijdslabel bij deze kijkhoek. | Goed voor herkenning van vleugel en lichaam. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Holger Uwe Schmitt |
| `sp029.webp` | Overige herkenningsfoto's | Koolmees zijwaarts op een tak, met gele buik, witte wang en lichte vleugelstreep. | Geslacht niet vastgesteld op deze foto. | Aanvullend zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Rhododendrites |

- **Correcties:** Brongeverifieerd mannetje als hoofdfoto, met verwijzing vanuit Mannetje. Vrouwtje en juveniel toegevoegd. Oud hoofdbeeld blijft als aanvullend portret.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Volwassen geslachtslabels alleen als bron en zichtbaar buikpatroon overeenstemmen. Vluchtfoto en juveniel zonder geslachtslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kap, oogstreek en middenstreep; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp030 Pimpelmees — VERIFIED

Batch M4 · 2026-11-11 · SHA `635d78a2eae05c63bfbb43f8d9a5dc1d550c7fde` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp030.webp` | Hoofdfoto | Pimpelmees op een twijg, met blauwe kruin, witte wangen en donkere oogstreep. | Volwassen kleed als herkenningsvoorbeeld. Geslacht onbekend. | Helder zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp030-juv2.webp` | Verenkleed (Juveniel) | Jonge Pimpelmees met bleekgele wang en doffe blauwgrijze kruin. | Fotograaf noemt een juveniel. Geslacht onbekend. | Kop goed zichtbaar, kleine vogel in staand beeld. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |
| `sp030-flight.webp` | In vlucht | Vrij in de lucht met gespreide staart en vleugels. Blauwe bovenzijde en oogstreep zichtbaar. | Geslacht onbekend. | Vleugels en staart zichtbaar van bovenaf. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Joe Dyer from Buckhurst Hill, England |

- **Correcties:** Jeugdfoto voorzien van zichtbare aanwijzing bij wang en kruin. De bestaande neutrale foto-indeling blijft bruikbaar.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** De kenmerken voor beide geslachten overlappen. Op deze beelden is het geslacht niet op kleed vastgesteld.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Koptekening en onderzijde; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp043 Huismus — VERIFIED

Batch M4 · 2026-11-11 · SHA `635d78a2eae05c63bfbb43f8d9a5dc1d550c7fde` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp043-hero-male.webp` | Hoofdfoto (Mannetje) | Rustend mannetje met grijze kruin, kastanjebruine zijkant van de kop en zwarte bef. | De bron benoemt een mannetje. Kruin en bef ondersteunen dat. | Kop, bef en bouw zichtbaar. | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 95f79228d7…), CC BY-SA 4.0 · Charles J. Sharp |
| `sp043-adult_m.webp` | Verenkleed (Mannetje) | Mannetje op een bloesemtak, met zwarte bef en bruin getekende vleugel. | Koptekening en donkere bef passen bij een mannetje. | Duidelijke vleugeltekening vanuit een andere kijkhoek. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp043.webp` | Verenkleed (Vrouwtje) | Bruine Huismus op een tak met lichte wenkbrauwstreep en kegelvormige snavel. | De fotograaf benoemt een vrouwtje. Bruin kleed en wenkbrauw ondersteunen het label. | Bruikbaar kopaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Ermell |
| `sp043-juv-review.webp` | Verenkleed (Juveniel) | Scherpe voorgrondvogel in jeugdkleed. Een tweede mus staat onscherp op de achtergrond. | Fotograaf benoemt een juveniel. Het geslacht van de voorgrondvogel is onbekend. | Kleed van de voorgrondvogel is goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp043-flight.webp` | In vlucht (Mannetje) | Huismus in vrije vlucht, met open vleugels, gespreide staart en donkere bef. | Grijze kruin en zwarte bef bevestigen een mannetje. | Vlucht en borsttekening duidelijk zichtbaar. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Mildeep |

- **Correcties:** Jeugdfoto benoemt nu de voorgrondvogel. Herkenningsprofiel onderbouwt de vergelijking met Ringmus en Vink.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Mannetje en vrouwtje waar bron en beeld dat dragen. Juveniel zonder geslachtslabel.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kruin en afzonderlijke wangvlek, Vleugelstrepen bij bruine vogels; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp072 Graspieper — VERIFIED

Batch M4 · 2026-11-11 · SHA `7cdfd22b58495a91552ef3f1cfa61906a11f5760` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp072.webp` | Hoofdfoto | Graspieper in zit met lichte oogring, slanke snavel en duidelijke streping. | Geslacht onbekend. | Goed zicht op de kop en het kleed. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp072-juv.webp` | Verenkleed (Juveniel) | Jonge Graspieper met lichte veerranden en gestreepte borst. | Fotograaf benoemt juveniel. Geslacht onbekend. | Scherp beeld van kop, borst en vleugeldekveren. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele JPEG zonder uitsnede), CC BY 2.0 · caroline legg |
| `sp072-flight.webp` | In vlucht | Graspieper in vrije vlucht boven heide met uitgespreide vleugels. | Geslacht en exacte leeftijd onbekend. | Genoeg ruimte rond de vogel en zicht op de vluchthouding. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |

- **Correcties:** Juvenielenfoto toegevoegd. Vergelijking met Boompieper legt flankstreping, achternagel en geluid uit. De partner heeft nog geen foto in de gids.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Geverifieerde Boompieperfoto bij de vergelijking.
- **Geslacht:** Verenkleed van beide geslachten gelijk. Neutrale fotolabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Flankstrepen, snavel en achternagel; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp099 Kievit — VERIFIED

Batch M4 · 2026-11-11 · SHA `c1c0f11ab367f35c4efc483ad986a6e726154651` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp099-adult_m.webp` | Hoofdfoto (Mannetje) | Kievit in broedkleed met lange kuif, donkere keel en groen-paarse rugglans. | Audubon benoemt dezelfde opname als volwassen mannetje in broedkleed. | Hele vogel scherp in rustig zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 2.5 · Andreas Trepte |
| `sp099-adult_f.webp` | Verenkleed (Vrouwtje) | Baltsend Kievitvrouwtje in voorovergebogen houding bij Marken. | De fotograaf benoemt een vrouwtje. | Het volledige lijf, de kuif en de baltspositie zijn zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 4.0 · Charles J. Sharp |
| `sp099-juv.webp` | Verenkleed (Juveniel) | Jonge Kievit met korte kuif en lichte randen aan rug- en vleugelveren. | Commons categoriseert de opname als juveniel. Geslacht onbekend. | Scherp zijaanzicht met kop, rug en veerranden. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 4.0 · Charles J. Sharp |
| `sp099-flight.webp` | In vlucht | Twee Kieviten vrij in de lucht, met brede afgeronde vleugels en zichtbaar zwart-wit contrast. | Geslacht per vogel niet vastgesteld. | Vrije vlucht duidelijk, rug- en buikzijde afzonderlijk zichtbaar. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp099.webp` | Overige herkenningsfoto's | Kievit in laag gras met lange kuif, witte buik en groene rugglans. | Geslacht onbekend. | Aanvullend zijaanzicht met lange kuif. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · El Golli Mohamed |

- **Correcties:** Mannetje als hoofdfoto. Vrouwtje en juveniel toegevoegd. Vergelijking met Zilverplevier toegevoegd. Spanwijdte gecorrigeerd volgens twee bronnen.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachtslabels alleen bij het mannetje en vrouwtje met bronbewijs. Vluchtbeeld zonder geslachtslabel.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Kuif en rugtekening; open: —; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en toepasselijke maten/labels
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp078 Meerkoet — VERIFIED

Batch M4 · 2026-11-11 · SHA `7cdfd22b58495a91552ef3f1cfa61906a11f5760` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp078.webp` | Hoofdfoto | Volwassen Meerkoet met donker kleed, witte snavel en wit voorhoofdsschild. | Volwassen kleed. Geslacht onbekend. | Snavel, schild en rode iris zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp078-juv-grown.webp` | Verenkleed (Juveniel) | Grijsbruine Meerkoet met lichte keel en wangen en een klein voorhoofdsschild. | Fotograaf benoemt juveniel. Geslacht onbekend. | Kop en lichte veerpartijen goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe pixelvergelijking na schalen van originele Commons-JPEG naar de WebP-afmetingen), CC BY 4.0 · Alexis Lours |
| `sp078-flight.webp` | In vlucht | Meerkoet vrij in de lucht boven het water, met de poten naar achteren. | Geslacht onbekend. | Vluchthouding en donkere lichaamsbouw zichtbaar. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Luiz Lapa from Oeiras, Portugal |
| `sp078-juv.webp` | Overige herkenningsfoto's (Donsjong) | Donsjong met rood-oranje kop en donker dons. | Kleed van een donsjong. Geslacht onbekend. | Kopkleuren en dons goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |

- **Correcties:** Tekst van de juvenielenkaart verwijst naar het afgebeelde oudere jong. Het donsjong heeft een eigen label en verwijst naar het latere kleed.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Verenkleed gelijk. De grootte van het voorhoofdsschild overlapt tussen de geslachten.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel en voorhoofdsschild; open: —; resterende dataverschillen: 1
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, juiste vluchtrol, zoomen/sluiten, vergelijkingskaart en doorklik
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp079 Waterhoen — VERIFIED

Batch M4 · 2026-11-11 · SHA `c1c0f11ab367f35c4efc483ad986a6e726154651` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp079.webp` | Hoofdfoto | Volwassen Waterhoen aan de oever met rood schild, gele snavelpunt en witte flanktekening. | Volwassen kleed. Geslacht onbekend. | Hele vogel goed zichtbaar, inclusief tenen en onderstaart. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Alexis Lours |
| `sp079-juv.webp` | Verenkleed (Juveniel) | Bruin jong Waterhoen zwemmend, met lichte keel en witte flanktekening. | Bron benoemt juveniel. Geslacht onbekend. | Kop en flank voldoende zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Charles J. Sharp |
| `sp079-flight.webp` | In vlucht | Jong Waterhoen vrij boven water, met vleugels uitgespreid en poten naar achteren. | Bruinig jeugdkleed volgens eerder bronbewijs. Geslacht onbekend. | Vlieghouding en flank zichtbaar, vogel relatief klein in beeld. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Imran Shah from Islamabad, Pakistan |

- **Correcties:** Bronprofiel en vergelijking op snavel- en flanktekening aangevuld. Bestaande drie foto’s beoordeeld.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Verenkleed van beide geslachten gelijk. Neutrale fotolabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel en witte tekening; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en toepasselijke maten/labels
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp081 Blauwe Reiger — VERIFIED

Batch M4 · 2026-11-11 · SHA `c1c0f11ab367f35c4efc483ad986a6e726154651` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp081-portrait.webp` | Hoofdfoto | Volwassen Blauwe Reiger staand in ondiep water, met dolksnavel, lange poten en lichte hals. | Volwassen kleed. Geslacht onbekend. | Hele vogel in zijaanzicht met duidelijk profiel. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 3.0 · Charles J. Sharp |
| `sp081-juv.webp` | Verenkleed (Juveniel) | Jonge Blauwe Reiger met donkere kruin en grijzere kop zonder lange sierveren. | Jeugdkleed in eerder bronbewijs. Geslacht onbekend. | Kop en snavel zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Ralf Hüsges |
| `sp081.webp` | In vlucht | Blauwe Reiger vrij in de lucht boven water met uitgespreide vleugels en de poten naar achteren. | Geslacht onbekend. | Hele vogel zichtbaar. De relatief gestrekte hals is op de kaart toegelicht. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC0 · Dinkum |

- **Correcties:** Staande hoofdfoto toegevoegd. De bestaande vrije-vluchtfoto staat nu één keer in In vlucht. Vergelijking met Purperreiger gebruikt nu het zijportret.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Verenkleed van beide geslachten gelijk. Neutrale fotolabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Bouw en halskleur; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en toepasselijke maten/labels
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp016 Grote Bonte Specht — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp016-hero-male.webp` | Hoofdfoto | Mannetje op tak; rode nekvlek, witte schoudervlekken, rode onderstaart. | volwassen mannetje (rode nekvlek) | goed | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 eb15a906da…), CC BY 2.0 · caroline legg |
| `sp016-male.webp` | Mannetje | Mannetje op stronk; rode nekvlek zichtbaar. | mannetje (rode nekvlek; bron noemt male) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp016.webp` | Vrouwtje | Specht tegen stam met prooi; zwarte nek zonder rood. | vrouwtje (geen rood op de kop; bron 'Weibchen') | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Andreas Eichler |
| `sp016-juv.webp` | Juveniel | Jonge specht tegen berk; volledig rode kruin. | juveniel (rood petje; bron juvenile) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Andrey Gulivanov |
| `sp016-flight.webp` | In vlucht | Vliegend met voedsel in de snavel; witte schoudervlekken zichtbaar. | niet vastgesteld | voldoende: licht bewogen vleugels | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · caroline legg |

- **Correcties:** geen
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen (rode nekvlek man); labels door beeld bevestigd.
- **Kennisprofiel:** 2 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Koppatroon, Grootte en rug; open: Spanwijdte niet in de geraadpleegde bron; Birdspot-waarde (34–39 cm) niet opnieuw gecontroleerd.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp009 Slechtvalk — PARTIALLY TESTED

Batch M2 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp009-male-rest.webp` | Hoofdfoto | Volwassen Slechtvalk staand op de grond; kopkap, baardstreep, gebandeerde flanken. | volwassen; bron noemt 'male' maar geslachten alleen in grootte verschillend — geen geslachtslabel | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Sumeet Moghe |
| `sp009-juv.webp` | Juveniel | Jonge Slechtvalk op rots; bruin, gestreept van onderen. | juveniel (bron: Commons-categorie juvenile; kleed bevestigt) | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Teddy Llovet |
| `sp009.webp` | In vlucht (Volwassen) | Vrij in de lucht van opzij; spitse vleugels, gebandeerde onderzijde. | volwassen-ogend; geslacht niet vastgesteld | goed; watermerk maker in beeld | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · john581 |
| `sp009-male-flight.webp` | In vlucht | Vrij in de lucht van onderen; vleugels gespreid. | volwassen (iNaturalist: Adult, Male); terecht zonder geslachtslabel | goed | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY · (c) Jonathan Tollin, some rights reserved (CC BY) |
| `sp009-perched.webp` | Overige herkenningsfoto's (Volwassen in rust) | Volwassen frontaal op rots; witte borst, baardstreep, gebandeerde flanken. | volwassen (bron: 'female adult'); geen geslachtslabel | goed | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Dhairya dixit |

- **Correcties:** geen
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten alleen in grootte verschillend (VB_SLECHT); geen geslachtslabels.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Bouw en kopkap; open: Onderscheid met Boomvalk en Smelleken nog uit een bron uitwerken.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Dezelfde opname staat twee keer in het register (GUIDE_PHOTOS /assets/showcase/sp009.webp en POSES[1] /assets/species/sp009.webp) en wordt één keer getoond; opschonen is cosmetisch.
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp008 Torenvalk — PARTIALLY TESTED

Batch M1 · 2026-11-10 · SHA `61ad1e3` · technisch VERIFIED · visueel PARTIALLY TESTED · rechten VERIFIED · kennis PARTIALLY TESTED · browser VERIFIED · onafhankelijk NOT TESTED

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
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachten verschillen (VB_TOREN, EB_KES); mannetje en vrouwtje getoond.
- **Kennisprofiel:** 2 kritische kenmerken (1 doorslaggevend); niet doorslaggevend: Silhouet en jachtgedrag; open: Juveniel kleed en het onderscheid juveniel/vrouwtje uit een bron beschrijven.; Uitgewerkte vergelijking met Boomvalk en Smelleken ontbreekt.; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium (Playwright) · SAB-01..07
- **Onzeker:** Geslacht van de mannetje-vluchtfoto steunt op beeldkenmerken, niet op de bron (REVIEW REQUIRED voor onafhankelijke bevestiging).
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp036 Groenling — VERIFIED

Batch M5 · 2026-11-11 · SHA `181688362b2b385e47939e8761586d0288259ede` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp036.webp` | Hoofdfoto (Mannetje) | Groenling op een tak, met geelgroen kleed en stevige, lichte snavel. | Fotograaf benoemt een mannetje. Kleed ondersteunt het label. | Gehele vogel goed zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Martin Kunz |
| `sp036-adult_f.webp` | Verenkleed (Vrouwtje) | Grijsgroene Groenling met dikke snavel en gedempte gele vleugelrand. | Fotograaf benoemt een vrouwtje. | Scherp zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 3.0 · Francis C. Franklin |
| `sp036-juv.webp` | Verenkleed (Juveniel) | Jonge Groenling met duidelijke streping op borst en buik, gele vleugelrand en stevige snavel. | Fotograaf benoemt een juveniel. Geslacht onbekend. | Kop, snavel en borst in beeld. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY 2.0 · Luiz Lapa from Oeiras, Portugal |
| `sp036-flight.webp` | In vlucht | Groenling vrij in de lucht, met gele randen aan de buitenste vleugelpennen. | Geslacht en precieze leeftijd niet vastgesteld. | Vleugel, staart en snavel goed zichtbaar. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Bengt Nyman from Vaxholm, Sweden |

- **Correcties:** Mannetje op bestaande hoofdfoto bevestigd. Vrouwtje en juveniel toegevoegd. Vergelijking met Sijs aangevuld.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** —
- **Geslacht:** Geslachtslabels bij foto’s met bronbewijs. De vluchtfoto blijft neutraal.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Snavel, bouw en plaats van het geel; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en geslachts- en leeftijdslabels
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp037 Putter — VERIFIED

Batch M5 · 2026-11-11 · SHA `181688362b2b385e47939e8761586d0288259ede` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp037-adult_m.webp` | Hoofdfoto (Mannetje) | Putter met rood masker, brede gele vleugelband en zwart-witte kop. | Fotograaf benoemt mannetje. Rood reikt achter het oog. | Goed beeld van kop en gevouwen vleugel. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 3.0 · Charles J. Sharp |
| `sp037-adult_f.webp` | Verenkleed (Vrouwtje) | Volwassen Putter op een draad met relatief beperkt rood masker en gele vleugelband. | De oorspronkelijke bestandsnaam van de fotograaf vermeldt femmina (vrouwtje). | Het kopaanzicht is schuin van voren. Fijne geslachtskenmerken zijn minder duidelijk. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY-SA 3.0 · Francesco Canu |
| `sp037-juv.webp` | Verenkleed (Juveniel) | Jonge Putter met grijsbruine kop, gele vleugelband en donkere borsttekening. | Fotograaf benoemt juveniel. Geslacht onbekend. | Borst en gevouwen vleugel zijn zichtbaar. | goedgekeurd | — | VERIFIED: bronaudit 2026-11-11: zelfde opname (directe WebP-conversie van originele Commons-JPEG), CC BY 2.0 · caroline legg |
| `sp037-flight.webp` | In vlucht | Putter vrij in de lucht met open vleugel en brede gele vleugelband. | Geslacht niet vastgesteld. | Vlieghouding en vleugeltekening duidelijk. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 2.0 · Bengt Nyman from Vaxholm, Sweden |
| `sp037.webp` | Overige herkenningsfoto's | Volwassen Putter op een tak met brede gele vleugelband en rood gezicht. | Volwassen kleed. Geslacht onbekend. | Aanvullend zijportret met lichte snavel. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 3.0 · Francis C. Franklin |

- **Correcties:** Mannetje, vrouwtje en juveniel met bronvermelding toegevoegd. Vrije vlucht behouden. Vluchtvergelijking met Sijs toegevoegd.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Een vrouwtjesfoto in zuiver zijaanzicht voor een directere vergelijking van kop en vleugel.
- **Geslacht:** Geslachtslabels volgen de fotobron. Maskeromvang overlapt en is op zichzelf geen zekere bepaling.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Vleugelband en koptekening; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en geslachts- en leeftijdslabels
- **Onzeker:** —
- **Volgende actie:** Onafhankelijke review (ChatGPT)

### sp035 Vink — VERIFIED

Batch M5 · 2026-11-11 · SHA `181688362b2b385e47939e8761586d0288259ede` · technisch VERIFIED · visueel VERIFIED · rechten VERIFIED · kennis VERIFIED · browser VERIFIED · onafhankelijk NOT TESTED

| Foto | Rol | Beeldinhoud | Geslacht/leeftijd | Kwaliteit | Uitslag | Vlucht | Rechten |
|---|---|---|---|---|---|---|---|
| `sp035-hero-male.webp` | Hoofdfoto (Mannetje) | Mannetje op een tak, met blauwgrijze kop, rozige borst en lichte vleugelstreep. | Fotobron benoemt mannetje. Kop en borst ondersteunen het label. | Rustig zijaanzicht. | goedgekeurd | — | VERIFIED: geverifieerde import 09-11 (SHA-1 04c9fd7979…), CC BY-SA 4.0 · Charles J. Sharp |
| `sp035.webp` | Verenkleed (Mannetje) | Tweede opname van een mannetje op een tak met rozerode borst en blauwgrijze kruin. | Mannetje volgens eerder bron- en beeldbewijs. | Onderscheidende opname met meer zicht op de rug en staart. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 3.0 · Martin Kunz |
| `sp035-adult_f.webp` | Verenkleed (Vrouwtje) | Grijsbruine Vink met witte vleugelstrepen en witte buitenste staartveren. | Fotograaf benoemt een vrouwtje in Drenthe. | Kop en flank in zijaanzicht. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY-SA 4.0 · Charles J. Sharp |
| `sp035-juv-review.webp` | Verenkleed (Juveniel) | Bruine juveniele Vink met lichte vleugelstrepen en lichte mondhoek. | Fotograaf benoemt een juveniel. Geslacht onbekend. | Goed zichtbaar op korte vegetatie. | goedgekeurd | — | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 4.0 · Marie-Lan Taÿ Pamart |
| `sp035-flight.webp` | In vlucht (Mannetje) | Mannetje in vrije vlucht. Blauwe kruin, rozerode borst en lichte vleugeltekening zichtbaar. | Roze borst en blauwgrijze kop ondersteunen het mannelijke kleed. | Volledige vogel vrij in de lucht. | goedgekeurd | vlucht · goedgekeurd | VERIFIED: bronaudit 09-11: zelfde opname (ORB+RANSAC tegen bronbeeld), CC BY 2.0 · Mark Medcalf |

- **Correcties:** Fotoverdeling bevestigd. Herkenning, maatbanden en vergelijking met Huismus en Keep onderbouwd.
- **Ontbreekt:** niets
- **Verbeterwensen (eigenaar beoordeelt later):** Geverifieerde gidsfoto van Keep bij de vergelijking.
- **Geslacht:** Volwassen man en vrouw zijn verschillend van kleed. Geslacht van het jong blijft onbekend.
- **Kennisprofiel:** 1 kritische kenmerken (0 doorslaggevend); niet doorslaggevend: Vleugelstrepen en borsttekening; open: —; resterende dataverschillen: 0
- **Browser:** 390x844 Chromium 145 (Playwright) · Foto decode, exacte auditset, fotovolgorde, geen duplicaten, vluchtrol, zoom, doorklik en geslachts- en leeftijdslabels
- **Onzeker:** —
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
| sp089 Wilde Eend | `sp089-flight.webp` | uit-rol | landen | Luchtgedragen met uitgestrekte poten omlaag, passend bij landingshouding. Vrije vlucht is niet bevestigd voor dit beeld. |
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
| sp007 Havik | Kop en staart in vlucht |
| sp007 Havik | Grootte |
| sp008 Torenvalk | Silhouet en jachtgedrag |
| sp009 Slechtvalk | Bouw en kopkap |
| sp016 Grote Bonte Specht | Koppatroon |
| sp016 Grote Bonte Specht | Grootte en rug |
| sp021 Ekster | Kleedpatroon en staart |
| sp022 Zwarte Kraai | Snavelbasis |
| sp025 Kauw | Iris en achterhoofd |
| sp026 Gaai | Kleedpatroon |
| sp029 Koolmees | Kap, oogstreek en middenstreep |
| sp030 Pimpelmees | Koptekening en onderzijde |
| sp035 Vink | Vleugelstrepen en borsttekening |
| sp036 Groenling | Snavel, bouw en plaats van het geel |
| sp037 Putter | Vleugelband en koptekening |
| sp043 Huismus | Kruin en afzonderlijke wangvlek |
| sp043 Huismus | Vleugelstrepen bij bruine vogels |
| sp045 Merel | Borstgrondkleur en staart bij bruine vogels |
| sp046 Zanglijster | Borstvlekken en ondervleugeldekveren |
| sp047 Kramsvogel | Kop, stuit en ondervleugel |
| sp048 Koperwiek | Wenkbrauw en kleur onder de vleugel |
| sp054 Heggenmus | Snavel en kop |
| sp056 Tjiftjaf | Handpenprojectie |
| sp056 Tjiftjaf | Staartbeweging |
| sp056 Tjiftjaf | Poten |
| sp056 Tjiftjaf | Seizoen |
| sp057 Fitis | Handpenprojectie |
| sp057 Fitis | Kop |
| sp057 Fitis | Poten |
| sp057 Fitis | Seizoen |
| sp063 Goudhaantje | Wenkbrauw en oogstreep |
| sp065 Boomklever | Kleur en gedrag |
| sp066 Boomkruiper | Roep |
| sp066 Boomkruiper | Zang |
| sp066 Boomkruiper | Vleugelbandpatroon |
| sp066 Boomkruiper | Alula |
| sp066 Boomkruiper | Flanken en wenkbrauw |
| sp066 Boomkruiper | Snavel en achternagel |
| sp067 Taigaboomkruiper | Vleugelbandpatroon |
| sp067 Taigaboomkruiper | Zang en roep |
| sp067 Taigaboomkruiper | Flanken en wenkbrauw |
| sp068 Witte Kwikstaart | Rug, stuit en flanken |
| sp070 Veldleeuwerik | Staart en vleugels in vlucht |
| sp072 Graspieper | Flankstrepen, snavel en achternagel |
| sp077 Fuut | Snavel en hals in winterkleed |
| sp078 Meerkoet | Snavel en voorhoofdsschild |
| sp079 Waterhoen | Snavel en witte tekening |
| sp081 Blauwe Reiger | Bouw en halskleur |
| sp086 Grauwe Gans | Snavel, kol en buik |
| sp089 Wilde Eend | Vleugelspiegel bij bruine vogels |
| sp091 Wintertaling | Kop, staartzijde en bovenvleugel bij bruine vogels |
| sp094 Zilvermeeuw | Pootkleur |
| sp094 Zilvermeeuw | Tertials eerstejaars |
| sp094 Zilvermeeuw | Leeftijd |
| sp095 Kleine Mantelmeeuw | Mantel en poten (volwassen) |
| sp095 Kleine Mantelmeeuw | Tertials eerstejaars |
| sp096 Stormmeeuw | Snavel, oog en poten |
| sp099 Kievit | Kuif en rugtekening |
| sp104 Aalscholver | Broedkleed |
| sp105 Fazant | Staartlengte en bouw bij bruine vogels |
| sp141 Gierzwaluw | Vleugelvorm, onderzijde en staart in vlucht |
| sp173 Bruine Kiekendief | Silhouet en vleugelhouding |
| sp173 Bruine Kiekendief | Geslacht en leeftijd |
| sp248 Wespendief | Kop en staart |
| sp248 Wespendief | Vleugelhouding |
| sp253 Ruigpootbuizerd | Staartcontrast |
| sp253 Ruigpootbuizerd | Geslacht en leeftijd |

## Nog niet aangescherpt gecontroleerd

Deze soorten renderen technisch, maar zijn **niet** foto voor foto opnieuw beoordeeld. Eerdere uitslagen (fotobaseline batch 01) gelden niet automatisch.

sp058 Fluiter, sp128 Bergeend, sp129 Krakeend, sp092 Kuifeend, sp090 Slobeend, sp130 Smient, sp132 Tafeleend, sp188 Zomertaling, sp106 Patrijs, sp117 Geelgors, sp118 Rietgors, sp064 Vuurgoudhaan, sp249 Blauwe Kiekendief, sp251 Grauwe Kiekendief, sp250 Steppekiekendief, sp075 IJsvogel, sp262 Grauwe Klauwier, sp143 Kluut, sp069 Gele Kwikstaart, sp288 Grote Gele Kwikstaart, sp049 Grote Lijster, sp164 Grote Mantelmeeuw, sp097 Kokmeeuw, sp225 Zwartkopmeeuw, sp032 Glanskop, sp033 Kuifmees, sp031 Matkop, sp174 Zwarte Mees, sp044 Ringmus, sp170 Ooievaar, sp146 Bontbekplevier, sp145 Goudplevier, sp147 Kleine Plevier, sp206 Strandplevier, sp144 Zilverplevier, sp083 Grote Zilverreiger, sp082 Kleine Zilverreiger, sp245 Koereiger, sp085 Kwak, sp084 Purperreiger, sp108 Grote Karekiet, sp110 Rietzanger, sp098 Scholekster, sp159 Bosruiter, sp152 Drieteenstrandloper, sp158 Groenpootruiter, sp101 Grutto, sp155 Oeverloper, sp217 Poelruiter, sp150 Steenloper, sp102 Tureluur, sp156 Witgat, sp100 Wulp, sp157 Zwarte Ruiter, sp019 Groene Specht, sp017 Kleine Bonte Specht, sp020 Middelste Bonte Specht, sp018 Zwarte Specht, sp282 Roze Spreeuw, sp112 Spreeuw, sp034 Staartmees, sp167 Grote Stern, sp166 Noordse Stern, sp165 Visdief, sp041 Appelvink, sp040 Goudvink, sp039 Kneu, sp042 Roodmus, sp038 Sijs, sp177 Bonte Vliegenvanger, sp178 Gekraagde Roodstaart, sp176 Grauwe Vliegenvanger, sp050 Roodborst, sp053 Roodborsttapuit, sp051 Zwarte Roodstaart, sp113 Wielewaal, sp055 Winterkoning, sp061 Grasmus, sp060 Tuinfluiter, sp059 Zwartkop, sp114 Boerenzwaluw, sp115 Huiszwaluw, sp116 Oeverzwaluw, sp126 Knobbelzwaan

