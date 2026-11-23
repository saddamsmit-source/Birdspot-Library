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
| Status | **SECOND REVIEW RECORDED · EIGENAARSPOORT OPEN** — geen volgende batch zonder eigenaarbesluit (§2.3.C) |

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
| sp002 | OPEN | — | PR #351 | zie G1–G7 |
| sp003 | OPEN | — | PR #351 | zie G1–G7 |
| sp004 | OPEN | — | PR #351 | zie G1–G4, G6, G7 |

## Tests

- `tests/test_f3_rev2_r01.mjs` (nieuw): eerste ronde onaangetast, tweede-rondetelling los van `counts`, volgorde en batchgrens, foto-blob-SHA's, geen FULL PASS, ANWB alleen NOT TESTED zonder boekbewijs, eigenaarbesluit niet vooringevuld. Mutatietest: nep-FULL PASS, nep-ANWB en vermenging met `counts` worden alle drie afgevangen.
- `tests/test_f3_140_unified_rebaseline.mjs`, `tests/test_audio_140_contract.mjs`, `tests/test_kennisbaseline.mjs`, `tests/test_f3_plumage_rule.mjs`: PASS lokaal.
- CI: `.github/workflows/f3-rev2-qa.yml`.

**EINDMARKERING — F3-REV2-R01 · DUIVEN · EIGENAARSPOORT OPEN · GEEN MERGE · GEEN LIVE**
