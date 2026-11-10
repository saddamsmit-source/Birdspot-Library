# Birdspot — overdracht kennisbaseline-proef aan ChatGPT (inhoud + UX-QA)

Versie 1.0 · 10-11-2026 · schrijver: Claude · ontvanger: ChatGPT (onafhankelijke QA) · eigenaar: Kevin Smit

## Stand

| | |
|---|---|
| Branch | `feat/kennisbaseline-proef` (gestapeld op `fix/fotovolgorde-heroref`, PR #124) |
| Code-SHA | `456c891` (profielen + UI + tests); docs-commit erboven |
| Actieve schrijver | Claude tot deze overdracht; daarna **niemand** op deze branch — correcties op eigen branch/PR |
| Merge / live | Niet gevraagd, niet gedaan. Geen nieuwe foto's, geen fotobatches |

## Wat er is

8 proefsoorten met kennisprofiel v0.1: Ekster sp021, Fitis sp057, Tjiftjaf sp056, Boomkruiper sp066, Torenvalk sp008, Zilvermeeuw sp094, Sperwer sp006, Buizerd sp005. Contract, tests en werkwijze: `docs/kennisbaseline/README.md`. Register en batchplan (589 soorten, 50 batches): `docs/kennisbaseline/KENNIS_TRACKER.md`. Screenshots: `docs/kennisbaseline/screenshots/`.

## Bewijsstatus

| Laag | Status |
|---|---|
| Contractvalidatie + generator (`--check`) | VERIFIED (lokaal) |
| Node-contracttests KB-01..09 over 597 soorten | VERIFIED (lokaal); mutatietest: omgewisseld Sperwer/Havik-kenmerk faalt correct |
| Validator-negatieftests KV-01..10 | VERIFIED (lokaal) |
| Browser 390/1280 px KBB-01..08 (Chromium, helpertest) | VERIFIED (lokaal) |
| Bestaande tests: fotovolgorde (mjs+py), guide_poses, photo_verification, species_detail, species_data, species_groups_az, navigation_recovery | VERIFIED (lokaal) |
| `test_guide_photos.py` | PARTIALLY TESTED: 1× time-out op `#birdspotSplashSkip`, herhaling groen; base 1/1 groen. Vermoedelijk timing, niet bewezen |
| CI op GitHub | zie PR-checks op de actuele SHA |
| Inhoudelijke juistheid profielen | **NOT TESTED** (onafhankelijk) |
| Fysiek toestel / productie | NOT TESTED |

## Vraag aan ChatGPT — inhoud

Per soort, tegen de gelinkte bronnen (niet tegen de profieltekst zelf):
1. Klopt elk kritisch kenmerk (`this`/`other`) en staat het bij de juiste soort? Speciaal: Fitis/Tjiftjaf (poten, handpenprojectie, zang), Sperwer/Havik (staarthoeken, jonge vogels), Boomkruiper/Taigaboomkruiper (vleugelband, alula), Buizerd/Wespendief (kop, iris, vleugelhouding), Zilvermeeuw/Geelpootmeeuw (pootkleur).
2. Is de betrouwbaarheid per kenmerk verdedigbaar (doorslaggevend vs. helpt vs. niet alleen)?
3. Is de tekst eigen formulering en geen overgenomen brontekst?
4. Beoordeel de vastgelegde verschillen: Ekster lengte (44–46 vs 46–50 cm) en broedduur; Zilvermeeuw maten; Sperwer-mannetje (Turkse Tortel vs Kauw); Buizerd staarthoeken (afgerond vs hoekig). Advies per punt: Birdspot-data aanpassen, bron toevoegen, of laten staan.
5. Bronnen met beperkte zekerheid: `BB_STT` (alleen inleiding gelezen), `MUN_GULL` (algemene inleiding), `RSPB_STT`. Vervangen of accepteren?

## Vraag aan ChatGPT — UX

1. Niveau 1: is het kritisch kenmerk direct na de samenvatting de juiste volgorde? Leesbaarheid van de betrouwbaarheidslabels.
2. Niveau 2: zijn de accordiontitels duidelijk; is het aantal (badge) zinvol?
3. Chip "Gelijkende soorten" naast de bestaande "Lijkt op"-vergelijkingen: dubbel of aanvullend?
4. Leefwijze-tab: plek van "Bronnen en controle" en de reviewregel.
5. 390 px: kaart wordt langer; is dat acceptabel gezien alles onder Niveau 2 ingeklapt is?

Uitslag vastleggen in `docs/kennisbaseline/reviews.json` (op eigen branch): `{"spNNN": {"status": "VERIFIED|PARTIALLY TESTED|BLOCKED", "door": "ChatGPT", "datum": "…", "sha": "…", "notitie": "…"}}`; daarna `build_tracker.py --sha …`.

## Open besluiten eigenaar (blijven zichtbaar, blokkeren dit werk niet)

1. Bergeend-label (voorstel sp128 vlucht = mannetje).
2. Hoofdfoto Wilde Eend.
3. 7 soorten waar de hoofdfoto de enige vluchtfoto is.
4. 22 afbeeldingen buiten de bronaudit.
5. Correctie van bestaande Birdspot-data bij de 5 vastgelegde verschillen (zie boven).
6. Compacte soorten (245): volledig profiel of lichter profiel (A, B, C, D) — bepaalt omvang batches K31–K50.
7. Doorstapelen: deze PR hangt aan #124 → #122; merge-volgorde bij akkoord.

Los geregistreerd: `test_phase_d.py` flakiness; D-PR's #45 en #50.

## Volgende stap

ChatGPT: inhoud- en UX-QA op de actuele PR-SHA. Daarna Claude (na akkoord eigenaar): QA-bevindingen verwerken op eigen branch, dan batch K01 (12 vergelijkingspartners: o.a. Havik, Wespendief, Taigaboomkruiper, Geelpootmeeuw, Boomvalk, Smelleken); de overige partners Kleine Mantelmeeuw, Stormmeeuw en Pontische Meeuw staan in K02.
