# Birdspot — kennisbaseline en kennisprofiel v0.1

Status: **proef** · 8 van 597 soorten · branch `feat/kennisbaseline-proef` · eerste profielcommit `456c891` · 10-11-2026.
Inhoudelijke status van alle profielen: **NOT TESTED** (onafhankelijk). Broncontrole door Claude is geen inhoudelijke QA.

## 1. Bestanden

| Pad | Rol |
|---|---|
| `tools/kennisbaseline/knowledge.json` | Bron van waarheid: `_contract`, `_sources`, één profiel per Birdspot-ID |
| `tools/kennisbaseline/build_knowledge.py` | Valideert en genereert `src/data/speciesKnowledge.js`; `--check` in CI |
| `src/data/speciesKnowledge.js` | Gegenereerd, niet met de hand wijzigen |
| `src/features/species/knowledgeSections.js` | Weergave Niveau 1 en Niveau 2 |
| `tools/kennisbaseline/coverage.mjs` | Dekkingsmatrix → `coverage.json`, `DEKKINGSMATRIX.md` |
| `tools/kennisbaseline/build_tracker.py` | Voortgangsregister + batchplan → `tracker.json`, `KENNIS_TRACKER.md` |
| `docs/kennisbaseline/reviews.json` | (nog aan te maken) onafhankelijke reviewuitslag per ID |
| `docs/kennisbaseline/screenshots/` | Selectie bewijs 390 px en 1280 px |

## 2. Datacontract (compact)

Profielsleutel = bestaand Birdspot-ID (`spNNN`). Elke bewering is `{text, sources[]}`; `sources` verwijst naar `_sources`.

| Sectie | Veld | Inhoud | Verplicht |
|---|---|---|---|
| A Basis | `basis.size` | maten met bron | nee |
| B Herkenning | `summary` | 1–2 zinnen, eigen tekst | ja |
| | `keyMarks[]` | 3–5 kenmerken + `reliability` | ja |
| | `caution` | waarschuwing voor de valkuil | nee |
| | `detail[]` | `topic`: bouw, kleed, gedrag, variatie, geslacht, leeftijd, vlucht | nee |
| C Kritisch | `critical[]` | `feature, where, this, other, vs[], reliability, conditions, exceptions, supporting, sources` | ≥1 |
| D Vergelijken | `similar[]` | `{id, why, sources}`; lege `sources` = bestaande Birdspot-vergelijking, zo getoond | nee |
| E Geluid | `voice[]` | `kind`: zang, roep, alarm, vlucht | nee |
| F Leefgebied | `habitat[]` | `kind`: voorkeur, nederland, jacht | nee |
| G Leefwijze | `life[]` | `kind`: voedsel, broeden, nest, trek | nee |
| H Status | `status[]` | `kind`: voorkomen, aantal, trend, rodelijst, bescherming | nee |
| Controle | `discrepancies[]` | `{field, app, source, sources}`: verschil met bestaande Birdspot-data, **niet** stil gecorrigeerd | nee |
| | `open[]` | wat nog niet uit een bron is vastgesteld | nee |

`reliability`: `doorslaggevend` (UI "Doorslaggevend") · `ondersteunend` ("Helpt") · `onbetrouwbaar-alleen` ("Niet alleen op vertrouwen").

Bron (`_sources.KEY`): `label, url (https), edition, scope, confirms, checked (YYYY-MM-DD), certainty`.

Validator weigert: onbekend ID, bewering zonder bron, onbekende bronsleutel, ongeldige betrouwbaarheid, `vs`/`similar` naar zichzelf of onbestaand ID, <3 of >5 keyMarks, leeg verplicht veld in `critical`, onvolledige bron, handmatig gewijzigde gegenereerde module.

Regels: eigen tekst, geen brontekst kopiëren; ontbrekend = weglaten of in `open`, nooit verzinnen; verschil met bestaande data → `discrepancies`, eigenaar beslist over correctie.

## 3. Weergave

- **Niveau 1 "Snel herkennen"** (tab Herkenning, onder de maten, vóór Verenkleed): samenvatting → kritisch kenmerk (met vergelijkingssoort en betrouwbaarheid) → 3–5 veldkenmerken → gelijkende soorten (chips, navigeren naar partner) → let op.
- **Niveau 2** als ingeklapte `<details>`: Herkenning "Determinatie in detail" (alle kritische kenmerken, uitgebreide herkenning, man/vrouw/juveniel, vlucht, zang en roep, vergelijkbare soorten) · Leefwijze "Kennisprofiel" (status, leefwijze, bronnen en controle met verschillen en open punten) · Waar "Leefgebied in detail".
- Fotovolgorde blijft Hoofdfoto → Mannetje → Vrouwtje → Juveniel → In vlucht → Vergelijkingen.
- Soorten zonder profiel: kaart ongewijzigd (getest over alle 589).

## 4. Werkwijze per batch

1. Batch uit `KENNIS_TRACKER.md` nemen (12 soorten, één familiecluster).
2. Per soort ≥1 primaire NL-bron (Vogelbescherming/Sovon) + determinatiebron voor elk kritisch kenmerk; bron eerst in `_sources`.
3. Profiel schrijven; verschillen met bestaande data in `discrepancies`; gaten in `open`.
4. `python3 -I tools/kennisbaseline/build_knowledge.py` → `node tests/test_kennisbaseline.mjs` → fixture toevoegen in KB-04 voor elk nieuw verwisselbaar paar → `python tests/test_kennisbaseline_browser.py` (proefsoortenlijst uitbreiden indien representatief).
5. `coverage.mjs` + `build_tracker.py --sha <commit>`; commit; ChatGPT-QA op die SHA; uitslag in `reviews.json`.

## 5. Tests

| Test | Dekt |
|---|---|
| `tests/test_kennisbaseline.mjs` | KB-01..09: ID's, bron per bewering (171), geldige vergelijkings-ID's, 12 anti-verwisselfixtures + 4 paren, Niveau 1 vóór foto's, Niveau 2 ingeklapt, bronnen gelinkt, 589 soorten zonder kb-markup, 597 renderen, negatieve scenario's, precache |
| `tests/test_kennisbaseline_validator.py` | KV-01..10: validator weigert 13 ongeldige varianten; `--check` vangt handwijziging |
| `tests/test_kennisbaseline_browser.py` | KBB-01..08: 390 px + 1280 px, kritisch kenmerk binnen eerste scherm, accordion klik/Enter, chipnavigatie heen/terug, bronlinks, zoom/audio/tabs/sluiten, soort zonder profiel, geen horizontale scroll, geen paginafouten |
| `.github/workflows/kennisbaseline-qa.yml` | alle bovenstaande + bestaande foto/volgorde-contracten |

## 6. Capabilityregistratie (delta, voor de catalogus)

- **CAP-BIRD-012 Soortkaart/gids** — nieuw: kennisprofiel per soort met Niveau 1/2, betrouwbaarheidslabels, kritische kenmerken, bron per bewering, verschillen- en open-lijst. Knoppen: chip "Gelijkende soorten" (navigeert), accordions (klik/Enter). Geen opslag, geen gebruikersdata, offline via precache.
- **CAP-BIRD-015 Vergelijken** — nieuw: kritische kenmerken met `vs`-soort en "Vergelijkbare soorten" met reden; navigatie via bestaande `data-compare-species`.
- **Tooling** — contractvalidator + generator, dekkingsmatrix, voortgangsregister, anti-verwisselfixtures. Herbruikbaar voor elke app met gegenereerde, bronvermelde inhoud.
- Learning (kandidaat): een nieuwe kop die een bestaande teststring bevat (`>Lijkt op<`) breekt indexOf-gebaseerde volgordetests; nieuwe UI-labels uniek kiezen in plaats van tests aanpassen.

## 7. App-README

De app-README bestaat alleen in open PR #117 en niet op deze base. Toe te voegen regel zodra die PR landt: *"Kennisprofielen: zie `docs/kennisbaseline/README.md`; bron `tools/kennisbaseline/knowledge.json`, nooit `src/data/speciesKnowledge.js` met de hand wijzigen."*
