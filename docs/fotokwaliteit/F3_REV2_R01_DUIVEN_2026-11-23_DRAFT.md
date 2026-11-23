# F3-REV2-R01 — tweede verificatieronde · Houtduif, Holenduif, Turkse Tortel

| | |
|---|---|
| Ronde | **F3-REV2-R01** (tweede F3-verificatieronde; niet te verwarren met eerste-ronde F3-R01…R47) |
| Datum | 23-11-2026 |
| Norm | Birdspot Kwaliteitsnorm v1.10 FINAL (`docs/BIRDSPOT_KWALITEITSNORM.md`) |
| Basis | PR #350 · `claude/birdspot-kwaliteitsnorm-v110-op-r47-20261123` @ `e6aa20e061e42d81de62a4df706f4a004bb06576` |
| Werk-PR | #351 · `claude/birdspot-f3-rev2-r01-duiven-20261123` |
| Eigenaarbesluit | Start tweede verificatieronde 140 soorten, 23-11-2026 |
| Beoordelaar | Claude (Opus 5.5) — eigen beoordeling, **geen** onafhankelijke review |
| Status | **EIGENAARBESLUIT B UITGEVOERD (F3-REV2-R01b) · ONAFHANKELIJKE QA OPEN** — geen volgende batch vóór QA en eigenaarbesluit |

Eerste-rondegegevens (F3-R01…R47, 140/140 inhoudelijk bekeken, 0 FULL F3-PASS) blijven ongewijzigd. Registratie per soort: `F3_140_HERCONTROLE_V0.1_DRAFT.json` → `records[].F3.secondReview`; samenvatting → `secondReview` (los van `counts`).

## Wat in deze ronde werkelijk is gedaan

| Controle | Uitgevoerd | Status |
|---|---|---|
| 9 getoonde foto's op volle resolutie geopend en beoordeeld | ja, alle 9 | zie per soort |
| Blob-SHA per fotoslot vastgelegd | ja | VERIFIED |
| Kaarttekst (Snel herkennen, Herkenning, Lijkt op, kritische verschillen) gerenderd uit de code en gelezen | ja | PARTIALLY TESTED |
| Tekst getoetst aan geregistreerde bronnen in `knowledge.json` `_sources` | ja (eerste-rondelezingen 10/14-11) | PARTIALLY TESTED |
| Vogelbescherming directe soortpagina opnieuw gelezen | **nee** — WebFetch vraagt eigenaartoestemming; niet beantwoord | NOT TESTED |
| ANWB Vogelgids van Europa (3e herz. druk 2023, ISBN 9789043930253), soortpassage | **nee** — geen rechtmatig toegankelijk exemplaar | NOT TESTED |
| Oorspronkelijke bron-/licentiepagina's van de 9 foto's opnieuw geopend | **nee** — zelfde toestemmingsblokkade | NOT TESTED |
| Vergelijkingen in beide richtingen (paneel aanwezig op beide kaarten) | ja | VERIFIED (aanwezigheid) |
| Dubbelgangerregister (LK-paren) | gecontroleerd: geen duivenparen geregistreerd | open |
| Lokaal gidsaudio | 0/3 | BLOCKED (checkpoint 75/140 ongewijzigd) |
| UI-wijziging | geen | browsertest niet nodig |

## Reviewkaarten

### sp002 · Houtduif · *Columba palumbus*

| Foto (rol) | Bron · maker · licentie | Oordeel |
|---|---|---|
| Hoofdfoto `assets/species/sp002.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Ringeltaube_auf_Norderney_03.jpg) · Stephan Sprinz · CC BY 4.0 | Uitstekend: halsvlek, lichte iris, roze borst, witte vleugelrand. Geen sourceSha1 vastgelegd. |
| In vlucht `plumage/sp002-flight-wingband.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Pigeon_ramier_2_(49863738256).jpg) · Pierre-Marie Epiney · CC BY-SA 2.0 | Echte vlucht, vleugelband en halsvlek zichtbaar; onderbelicht, oogt bijna zwart. |
| Juveniel `plumage/sp002-juv.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Columba_palumbus_(juvenile).JPG) · Roland Gromes · CC BY-SA 4.0 | Aannemelijk juveniel (geen halsvlek, donker oog); iets zacht. |

Tekst: inhoudelijk consistent met geregistreerde bronnen. Snel herkennen toont 5 aanknopingspunten (1 kritisch + 4 Helpt); v1.10 vraagt max. 3. Spanwijdte/gewicht zonder ca.-band (niet blokkerend).

### sp003 · Holenduif · *Columba oenas*

| Foto (rol) | Bron · maker · licentie | Oordeel |
|---|---|---|
| Hoofdfoto `assets/species/sp003.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Columba_oenas1.jpg) · Chris Cant · CC BY 2.0 | Goed: donker oog, groene halsglans, korte zwarte strepen. Geen sourceSha1 vastgelegd. |
| Juveniel `plumage/sp003-juv.webp` | [iNaturalist 725640198](https://www.inaturalist.org/photos/725640198) · Paul Lewis · CC BY 4.0 | Goed en scherp; leeftijd uit waarnemingsannotatie. |
| In vlucht `plumage/sp003-flight-open-sky.webp` | [iNaturalist 757637556](https://www.inaturalist.org/photos/757637556) · andygpos · CC BY 4.0 | **Zwak**: vooral ondervleugel (oogt licht), 680×595 px; kernkenmerk bovenvleugel nauwelijks zichtbaar. |

Tekst: consistent. Snel herkennen 5 aanknopingspunten. Juveniel-tekst kort. Biometrie zonder ca.-band.

### sp004 · Turkse Tortel · *Streptopelia decaocto*

| Foto (rol) | Bron · maker · licentie | Oordeel |
|---|---|---|
| Hoofdfoto `plumage/sp004-adult-crop.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Sierp%C3%B3wka_zwyczajna_w_R%C5%BCuchowie_w_wojew%C3%B3dztwie_%C5%9Bwi%C4%99tokrzyskim,_20250421_0903_4128.jpg) · Jakub Hałun · CC BY 4.0 | Goed: halsband, rood oog, egale bovendelen. |
| In vlucht `plumage/sp004-flight.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Tourterelle_turque_en_vol_pr%C3%A8s_de_Chamb%C3%A9ry_(avril_2020).JPG) · Florian Pépellin · CC BY-SA 4.0 | Goed: staart van onderen (zwarte basis, witte eindrand), halsband. Geen sourceSha1 vastgelegd. |
| Juveniel `plumage/sp004-juv.webp` | [Commons](https://commons.wikimedia.org/wiki/File:Streptopelia_decaocto_juvenile_2.jpg) · Kreuzschnabel · CC BY-SA 3.0 | Goed: geen halsband, bruinig oog. |

Tekst: consistent. Snel herkennen 5 aanknopingspunten. Zomertortel en Lachduif alleen als tekst (terecht, geen fotopaar in cohort).

## Materiële tekortkomingen (eigenaarspoort)

| ID | Soorten | Tekortkoming | Kleinste veilige verbetering |
|---|---|---|---|
| G1 | sp002–004 | ANWB-soortpassage NOT TESTED | Eigenaar levert rechtmatig exemplaar/scan van de 3 passages, of besluit C |
| G2 | sp002–004 | Vogelbescherming + 9 fotobronpagina's niet hergelezen in REV2 | Eigenaar geeft in de chat toestemming voor de leesacties; daarna opnieuw lezen |
| G3 | sp002, sp003, sp004 | 3 foto's zonder vastgelegde sourceSha1/sourceAudit (hoofdfoto's sp002/sp003, vlucht sp004) | Na G2: originelen openen, SHA-1 en licentie vastleggen |
| G4 | alle kaarten | Snel herkennen toont tot 5 aanknopingspunten; v1.10 max. 3 primaire | Besluit eigenaar: top-3 tonen, rest inklapbaar (UI-wijziging, alle soorten) |
| G5 | sp002↔sp003 | Kritisch paar Houtduif–Holenduif: geen gelijkwaardig fotopaar (onder vs. opzij); geen rustpaar | Rustpaar toevoegen met de twee bestaande hoofdfoto's (geen import); later betere Holenduif-vluchtfoto |
| G6 | sp002–004 | Geen LK-paren in dubbelgangerregister (§3.4.6) | 4 LK-registraties toevoegen (data, geen UI) |
| G7 | sp002–004 | Geen lokaal gidsaudio | Ongewijzigd open (75/140) |

Niet-materieel, wel geregistreerd: W1 vluchtfoto Houtduif onderbelicht; W2 biometrie zonder ca.-band (sp002 spanwijdte/gewicht, sp003 alle drie, sp004 lengte).

## Eigenaarbesluit

| Soort | Besluit | Datum | Verwijzing | Resterende bewijsstatus |
|---|---|---|---|---|
| sp002 | **B — gericht verbeteren** | 23-11-2026 15:28 | chat + PR #351 (R01b) | ANWB NOT TESTED, VB niet hergelezen, audio OPEN, vluchtfoto onderbelicht (wens), onafhankelijke QA |
| sp003 | **B — gericht verbeteren** | 23-11-2026 15:28 | chat + PR #351 (R01b) | idem + geen gelijkwaardige vrije-vluchtfoto, iNaturalist-licentie niet via API hergelezen |
| sp004 | **B — gericht verbeteren** | 23-11-2026 15:28 | chat + PR #351 (R01b) | idem + auteursvorm juveniel (Kreuzschnabel) |

Optie C is **niet** verleend voor ANWB of audio: die blijven `NOT TESTED` respectievelijk `OPEN`.

## F3-REV2-R01b — uitvoering besluit B (23-11-2026)

| # | Opdracht | Uitgevoerd | Status |
|---|---|---|---|
| 1 | Remote/claim | head `be2dc8f` ongewijzigd, nieuwe claim (comment 7104068281); geen ChatGPT-QA-comment op #351 aangetroffen | VERIFIED |
| 2 | Rustpaar Houtduif–Holenduif | Nieuwe vergelijking `Houtduif en Holenduif · in rust` met beide bestaande hoofdfoto's (volwassen, zijaanzicht); rijen hals / oog / gevouwen vleugel uit gebronde claims; beide richtingen met credits | VERIFIED (code + browser), onafhankelijke review open |
| 3 | Zwakke Holenduif-vluchtfoto | `discover` (3 zoekopdrachten): 1 echte kandidaat (*Skogsduva Stock Dove*, Åsa Berndtsson, CC BY 2.0) — landend/opvliegend, klein, onscherp → **niet beter**, niet geïmporteerd. Vluchtpaar Houtduif–Holenduif verborgen via `pairHidden` (beide foto's bestaan, paar niet gelijkwaardig); eigen vluchtfoto en paar met Turkse Tortel blijven | VERIFIED |
| 4 | sourceSha1/sourceAudit + bronpagina's | `origcheck` via `media-intake` (GitHub-runner, Commons-API/iNaturalist open-data): 9/9 originelen; sp002-hoofdfoto `f102a9ca…`, sp003-hoofdfoto `cdc04d81…`, sp004-vlucht `04effd85…` vastgelegd; 6 Commons-foto's auteur+licentie gelijk; sp004-hoofdfoto uitsnede visueel bevestigd (r 0,857); sp004-juveniel auteursvorm wijkt af; 2 iNaturalist-foto's zelfde opname, licentie niet via API | zie register per foto |
| 5 | Dubbelgangerregister | LK-091 Houtduif–Holenduif, LK-092 Holenduif–Stadsduif, LK-093 Turkse Tortel–Zomertortel, LK-094 Turkse Tortel–Lachduif; LK-001…090 ongewijzigd | PARTIALLY TESTED |
| 6 | Snel herkennen max. 3 | Impact `quickPanel()` onderzocht: 108 profielen gebruiken hem. Optioneel, gevalideerd veld `quickPrimary` (1–2 keyMarks) → kritisch kenmerk + 2 primair; rest ingeklapt onder "Meer kenmerken". Render van alle 597 soorten vergeleken met basis: **alleen sp002–sp004 veranderen** | VERIFIED |
| 7 | Toekomstbestendige test | `test_f3_rev2_r01.mjs`: digest eerste ronde; ANWB VERIFIED alleen met titel/auteurs/editie/geldig ISBN/pagina/leesdatum; audio alleen met bron/licentie en menselijke luistercontrole; FULL PASS alleen bij alle lagen VERIFIED + onafhankelijke review + 0 open gaten + eigenaarbesluit. Mutatietest: 7/7 nep-situaties afgevangen, 2/2 legitieme toekomstige situaties geaccepteerd | VERIFIED |
| 8 | Besluit registreren | `secondReview.ownerDecision` per soort: B, datum, verwijzing, resterende punten | VERIFIED |

Vogelbescherming: WebFetch-toestemming opnieuw gevraagd (~15:40) en niet beantwoord; geen omweg gebruikt → `NOT TESTED` in REV2.

Aangepaste bestaande tests (gedrag gewijzigd door besluit B, geen versoepeling): `test_soortaudit.mjs` SA-07 (vluchtpaar Holenduif–Houtduif moet nu **ontbreken**, rustpaar en paar met Turkse Tortel aanwezig), `test_species_detail.py` (rustpaar i.p.v. vluchtpaar), `test_mobile_owner_review.py` (contrast van de eerst zichtbare Holenduif-tip), `test_lookalike_r09.mjs` (setvergelijking focussoorten gesorteerd; positionele R09–R17-controles ongewijzigd).

## Tests

- `tests/test_f3_rev2_r01.mjs` (nieuw): eerste ronde onaangetast, tweede-rondetelling los van `counts`, volgorde en batchgrens, foto-blob-SHA's, geen FULL PASS, ANWB alleen NOT TESTED zonder boekbewijs, eigenaarbesluit niet vooringevuld. Mutatietest: nep-FULL PASS, nep-ANWB en vermenging met `counts` worden alle drie afgevangen.
- `tests/test_f3_140_unified_rebaseline.mjs`, `tests/test_audio_140_contract.mjs`, `tests/test_kennisbaseline.mjs`, `tests/test_f3_plumage_rule.mjs`: PASS lokaal.
- CI: `.github/workflows/f3-rev2-qa.yml`.

**EINDMARKERING — F3-REV2-R01/R01b · DUIVEN · BESLUIT B UITGEVOERD · ONAFHANKELIJKE QA OPEN · GEEN MERGE · GEEN LIVE**
