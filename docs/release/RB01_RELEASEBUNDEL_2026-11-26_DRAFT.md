# Birdspot RB-01 — releasebundel (DRAFT)

Status: KLAAR VOOR ONAFHANKELIJKE QA (claim VRIJGEGEVEN na de laatste commit) · eigenaarakkoord 26-11-2026: uitsluitend
releasebundel voorbereiden en testen · release HOLD
Branch `claude/birdspot-releasebundel-rb01-20261126` · concept-PR #365 · base `521fba8` (PR #364; QA comment 7186160524)
Checkpoints: start `5712244` · A `d5a17eb` (appcode-kandidaat 1.27.33) · B/C documentatie (head in de PR-overdracht)

Scope: RC-B1 versie en cache-identiteit, RC-B2 README, releasenotities. Geen functionele wijziging, geen deployment, geen merge.

## A — versie en offline-update (RC-B1)

- Conventie: elke kandidaat krijgt de volgende patchversie (1.27.31 → 1.27.32); 1.27.33 komt op geen enkele remote branch voor.
- Enige wijziging in appcode: `sw.js` `APP_VERSION` 1.27.32 → **1.27.33**. `APP_CACHE` (`birdspot-app-v1.27.33`) en Profiel › Over de app
  volgen daaruit. Precache, installatie, activatie, opruimen van oude app-caches en de mediacache zijn ongewijzigd.
- `tests/test_rb01_upgrade.py` (Chromium, lokaal): **9/9 PASS** — echte SW-upgrade 1.27.32 (`521fba8`) → 1.27.33 op dezelfde origin
  met fictieve waarnemingen (eigen, BirdNET/Merlin suggestie en zelf gecontroleerd, controle onbekend, zonder bron), foto, audio,
  plekken, concept en mediacache. localStorage byte-gelijk, IndexedDB-blobs en plekkenstore gelijk, alleen de nieuwe app-cache over,
  mediacache bewaard, concept hervatbaar, offline herstart met lijst/detail/gidsfoto, schone installatie offline bruikbaar.
- Tegenproef op `521fba8` (1.27.32 → 1.27.32): U1 FAIL — de versies zijn niet te onderscheiden (RC-B1).
- Bestaande releasegate `tests/test_release_upgrade.py` 5bf6704 (1.14.0) → 1.27.33: RU-01..07 PASS.
- Echte upgrade op het toestel of op een beveiligde preview: **NOT TESTED** (geen deployment zonder eigenaarakkoord).

## B — README (RC-B2)

Nieuwe bovenste sectie *Werkstand Birdspot — releasekandidaat 1.27.33* met appcode-SHA, UX-01/02/03/03R, eigenaarbesluit optie A,
telregel (meetellend versus geregistreerd), status BirdNET/Merlin, versie/offline en open gates. De vorige werkstand (19-11) staat
ongewijzigd eronder als historisch; het F3-checkpoint (R47) heeft een eigen kop en is inhoudelijk ongewijzigd. Producteisen
(Identiteit, Scope, Data, Offline) zijn niet aangepast.

## C — releasenotities

`docs/release/RELEASE_1.27.33_CANDIDATE.md` volgens de bestaande `_CANDIDATE`-conventie: SHA-tabel, gebruikerswijzigingen,
verificatieregel, statistieken (met expliciet: lager aantal meetellende soorten ≠ verwijderde waarnemingen), CSV-compatibiliteit,
offline/cache, open gates, beperkingen, terugval en herstel.

## Open gates

RC-B3 branchbescherming (beheerdersweergave 26-11: `protected=false`, geen regels of rulesets) · beveiligde preview · Android/TalkBack ·
echte Merlin-overdracht · eigenaarbesluit `zet live`. M2 blijft bekend UX-punt, geen blokkade.
