# Birdspot UX-03R — herstel soorttellingen, BirdNET-verificatie en CSV-export (DRAFT)

Status: KLAAR VOOR ONAFHANKELIJKE QA (claim VRIJGEGEVEN na deze commit) · eigenaarbesluit PR #363 comment 7173278596 (alleen bouw- en testtoestemming) ·
BirdNET-beleid optie A (comment 7172540560) · release HOLD
Branch `claude/birdspot-ux03r-herstel-20261125` · PR #364 (concept) · base `01e5c2e` (PR #363, claim VRIJGEGEVEN)
Checkpoints: start `a2b4133` · A `0ab618c` · B `056b6d3` · C `ba1cbc3` · dossier = head van deze PR (SHA in de overdracht)

Scope: uitsluitend H1, M1 en M3 uit de eindgebruikersreview. Geen redesign, geen nieuwe functies, geen datamigratie,
geen normdocumenten, geen deployment.

## A — H1: één betekenis voor 'soorten'

Regel: een getal dat in de app **"soorten"** heet zonder toevoeging, volgt de centrale telregel `countsForList`
(nu in `sightings/evidence.js`, met `speciesTally`; `profile/stats.js` geeft door). Een ruw soortaantal heet altijd
**"geregistreerd"**. Waarnemingsaantallen blijven ruwe registraties.

| Plek | Voor (`01e5c2e`) | Na |
|---|---|---|
| Home, tegel Soorten | alle geregistreerde soorten | soorten op je lijst |
| Inzichten, jaar | 'Vogelsoorten' ruw; top 5 en cumulatieve lijn ruw | 'Soorten op jaarlijst' = Profiel-jaarlijst; top 5 en lijn alleen lijstsoorten; uitleg met aantal niet-meetellende en geregistreerde soorten |
| Soortgids | 'Waargenomen' en teller bij elke registratie | 'Waargenomen' alleen lijstsoorten; anders 'Geregistreerd, telt niet mee' |
| Dagboek | 'Vogelsoorten' ruw | 'Soorten op je lijst' |
| Profiel › Overzicht | 'N soorten' ruw, naast 'N soorten op je lijst' | 'N soorten geregistreerd' |
| Profiel › Topplekken | 'N soorten' ruw (K7-contract: waar je kijkt) | ruw behouden, label 'soorten geregistreerd' |
| Kaart › plekkaartje | 'N soorten' ruw | ruw behouden (locatiegegevens), label 'soorten geregistreerd', kop 'Geregistreerde soorten hier' |
| Profiel › Mijn lijsten (soorten, jaarlijst, nieuw) | telregel | ongewijzigd |

Voor- en nameting (zelfde fictieve dataset, `test_ux03r_a_tellingen.py`, alle combinaties: eigen herkenning, BirdNET/Merlin
suggestie en zelf gecontroleerd, historisch controle onbekend, mogelijk, zonder bron):

| Teller | Voor | Na | Referentie telregel |
|---|---|---|---|
| Home Soorten | 10 | 6 | 6 |
| Profiel soorten op je lijst | 6 | 6 | 6 |
| Profiel overzicht | '10 soorten' | '10 soorten geregistreerd' | 10 geregistreerd |
| Jaarlijst 2026 (Profiel) | 4 | 4 | 4 |
| Inzichten 2026 | 8 | 4 + uitleg '4 … tellen niet mee · geregistreerd 8' | 4 |
| Inzichten top 5 | Merel, Boomkruiper, Fuut, Graspieper, IJsvogel | Fuut, Koolmees, Merel, Siberische Sprinkhaanzanger | lijstsoorten |
| Inzichten 2025 | 2 | 1 + uitleg | 1 |
| Soortgids teller | 10/597 | 6/597 | 6 |
| Gids Boomkruiper/Roodborst/IJsvogel/Graspieper | Waargenomen | Geregistreerd, telt niet mee | niet op lijst |
| Dagboek | 10 Vogelsoorten | 6 Soorten op je lijst | 6 |
| Plekkaartje Amstelpark | '3 soorten' | '3 soorten geregistreerd' | ruw |

Tegenproef: zelfde test op `01e5c2e` = **2/9** (A2–A8 FAIL); op de nieuwe code **9/9**.
Data: geen enkele waarneming gewijzigd (A9; enige verschil is de bestaande 2B-plekkoppeling bij een kaartbezoek).

## B — M1: oude BirdNET-waarneming bewust zelf controleren

- Detail van een record met 'Controle onbekend': uitleg *"Of je die zelf controleerde, is niet vastgelegd; daarom telt ze niet
  mee in je lijsten."* en knop **Identificatie zelf controleren** (44 px, alleen bij deze status).
- Dialoog: wat BirdNET voorstelde (met score), waarom de waarneming niet meetelt, dat eigen controle geen onafhankelijke
  wetenschappelijke verificatie is en dat de BirdNET-suggestie als bewijs bewaard blijft. **Eigen controle vastleggen** is pas
  te kiezen na het aanvinken van *"Ik heb [soort] zelf gecontroleerd"*. Annuleer, Escape en browser-terug wijzigen niets.
- Bevestigen schrijft alleen `identificationSource: 'birdnet'` en `birdnetVerification: 'checked'` (via `normalizeEvidence`,
  onder het herstelslot en alleen als het record nog 'controle onbekend' is). `soundSuggestion`, zekerheid, soort, datum,
  plek en notities blijven gelijk; andere records byte-gelijk.
- Openen, Bewerken → Annuleren en Bewerken → 'Eigen herkenning' laten staan → Opslaan bevestigen **niets** (status blijft,
  telt niet). Het formulier zegt nu: *"Alleen opslaan verandert dat niet."*
- Rand: zonder gehoorde waarnemingswijze verwijst de dialoog naar Bewerken; geen schrijfactie.
- Werkt offline; ZIP bevat de controlevelden en het bewijs; terugzetten in een leeg profiel geeft dezelfde status.

`test_ux03r_b_zelfcontrole.py` **9/9**. Tegenproef op `01e5c2e`: faalt bij B1 (knop bestaat niet).

## C — M3: CSV

Kleinste veilige oplossing binnen het bestaande contract: **zelfde 13 kolommen en volgorde**; `zekerheid` blijft de opgeslagen
waarde; `waarnemingswijze` krijgt, net als de bestaande regels '(BirdNET, suggestie)' en '(Merlin, zelf gecontroleerd)', de
markering **'(BirdNET, controle onbekend)'**. Zonder vastgelegde waarnemingswijze alleen de markering (geen verzonnen 'gehoord').
Geen nieuwe kolom. Birdspot leest zelf geen CSV in; waarneming.nl-import koppelt kolommen handmatig (exportCsv-kop), dus de
kolomkoppeling blijft gelijk.

Oud vs nieuw op dezelfde 13 records: **2 van 14 regels anders, alleen de cel `waarnemingswijze`**:

```
OUD   2025-05-01,,Merel,,1,zeker,gehoord,,,,,,s06
NIEUW 2025-05-01,,Merel,,1,zeker,"gehoord (BirdNET, controle onbekend)",,,,,,s06
OUD   2025-06-01,,Zanglijster,,1,zeker,,,,,,,e1
NIEUW 2025-06-01,,Zanglijster,,1,zeker,"(BirdNET, controle onbekend)",,,,,,e1
```

`test_ux03r_c_csv.py` **6/6** (BOM, kolomkop, alle herkenningen, datum, coördinaten, quoting, formule-injectie, na eigen
controle '(BirdNET, zelf gecontroleerd)', opslag byte-gelijk na CSV en ZIP, ZIP-roundtrip identiek). Tegenproef op `01e5c2e`:
C2 en C4 FAIL.

## Testaanpassingen (bedoeld, geen versoepeling)

- `test_profile_backup.py`, `test_map_k4.py`: ruw soortaantal heet nu 'soorten geregistreerd'.
- `test_ux03b_verificatie.py` V8: CSV markeert 'controle onbekend' (eigenaarbesluit 7173278596) in plaats van 'zoals voorheen'.

## Regressie en bewijs

| Laag | Status |
|---|---|
| Code | VERIFIED |
| CI | zie overdracht (exacte SHA) |
| CI op `ba1cbc3` (code-checkpoint C) | VERIFIED — 47/47 success, waaronder de nieuwe job `ux03r` |
| Lokale browser | VERIFIED — UX-03R A 9/9 · B 9/9 · C 6/6; tegenproef op `01e5c2e`: A 2/9, B faalt bij B1, C faalt op C2/C4. Alle 186 workflowsuites lokaal: 182 PASS (2 na solo-herhaling: `release_upgrade`, `startup_splash`, belasting bij parallel draaien); 4 alleen sandbox en groen in CI: `feature_reconciliation` F06/F07 (BirdNET-CDN, kaarttegels), `r2b_herstelslot` (Chromium-crash, ook op base), `guide_photos` (time-out), `test_photo_feedback.mjs` (sharp) |
| Beveiligde Vercel-preview | NOT TESTED (geen preview zonder aparte vrijgave) |
| Fysiek Android-toestel | NOT TESTED |

## Risico's

1. Bestaande gebruikers zien lagere soortaantallen op Home, Inzichten, Dagboek en gids (gewenst volgens optie A; data blijft).
2. Wie de CSV automatisch op exacte tekst 'gehoord' filtert, ziet bij oude BirdNET-records nu een langere cel (zelfde patroon als bestaande BirdNET/Merlin-regels).
3. Toestel en TalkBack niet getest; servicewerkerversie niet opgehoogd (bij releasebundeling).
