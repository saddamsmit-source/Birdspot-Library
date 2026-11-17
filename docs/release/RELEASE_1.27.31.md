# Birdspot 1.27.31 — openbare reviewversie (GitHub Pages)

**Datum:** 17 november 2026 · **Route:** `preview/birdspot-review` → https://saddamsmit-source.github.io/Birdspot-Library/ · **Vorige openbare versie:** 1.27.6 (`21ce906`)
**Kandidaat:** keten #281 → #284–#287 → #288 → #289, code-SHA `eab2ca1` + deze releasenotitie · **Eigenaarbesluit:** "live zetten" 17-11-2026 15:13, zonder vrijstelling van gates.

## Nieuw t.o.v. 1.27.6
- **PWA-installatie (#279/#281):** gecorrigeerde iconen en manifest, installatie-/updategedrag 1.27.31.
- **Gids en foto's (F2/F3-R01…R20):** 60 van 140 soorten individueel tegen het bronbeeld gecontroleerd; twijfelachtige foto's teruggetrokken met behoud van bron (o.a. Vuurgoudhaan-, Boomkruiper-, Gele Kwikstaart- en IJsvogel-juveniel); neutrale labels waar geslacht niet bewezen is.
- **Soortvergelijkingen:** nieuwe en gecontroleerde dubbelgangerpanelen (o.a. boomkruipers, kwikstaarten, goudhaantjes, grasmussen), in beide richtingen.
- **Kennisprofielen:** Vogelbescherming- en Sovon-status/trends, bronverschillen zichtbaar.
- **Waarnemingen:** handmatige pins, Merlin-bewijs, foto/video, ZIP-back-up en -herstel, terugnavigatie (bestaande functies, regressie getest).
- **Media-audit:** Commons-auteurs alleen bij herleidbare vormen gelijk.

## Buiten deze release
- Fotonorm v1.8 (#282, DRAFT) en Samsung-startkaart (#283, docs).
- Productierelease naar `main` (zie §Productie).
- Persoonlijke fotofeedback-API (alleen Vercel-previewomgeving; op Pages niet actief).

## Gates
- CI op de exacte publicatie-SHA via de release-PR naar `preview/birdspot-review`.
- RU-matrix (upgrade + gegevensbehoud + offline): basis `21ce906` (1.27.6) en `5bf6704` (1.14.0).
- Niet getest (blijft open): fysieke Samsung/Android-installatie en -update, GPS, microfoon, camera, ZIP-herstel op tweede toestel.

## Productie (`main`)
HOLD: `main` wordt nergens geserveerd en de productiecriteria (fysieke toesteltests, privacy-/hostingchecks) zijn niet gehaald.

## Terugval
Revert-PR naar `preview/birdspot-review` met de boom van `21ce906` (1.27.6). Nooit force-push; gebruikersdata op toestellen blijft staan.
