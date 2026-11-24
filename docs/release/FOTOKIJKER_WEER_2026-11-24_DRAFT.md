# Birdspot FOT-01, FOT-02, WEE-01 (DRAFT)

Status: GEBOUWD EN LOKAAL/CI GETEST · eigenaarakkoord 24-11-2026 23:06 (ontwikkeling, geen merge/livegang) · base `ec85e05` (PR #359) · PR #360
Geen F3-inhoudsronde, geen nieuwe of gewijzigde foto's, geen soortkenmerken, geen normdocumenten. `.vercelignore` ongewijzigd.
De drie eigenaarsscreenshots zaten niet bij de opdracht; gebouwd op de bestaande UI.

## FOT-01 — swipen tussen kleedfoto's (bestaande `src/utils/photoViewer.js`)
- Dezelfde kijker krijgt een galerijmodus via `items` (2 of meer). Zonder `items` werkt de kijker exact als voorheen (kaart, media, film, waarnemingen, eigen foto's).
- Groep = de zichtbare gidsfoto's in hetzelfde blok: Verenkleed, In vlucht, Overige herkenningsfoto's, één vergelijkingspaar (Lijkt op), of de hoofdfotoreeks. Verborgen tabs en ingeklapte delen tellen niet mee.
- Rol + teller ("Mannetje, landend · 2 van 4") uit bestaande kaarttekst; vorige/volgende (44 px) met labels die de buurfoto noemen; aria-live; pijltoetsen.
- Swipe (touch/muis, ≥48 px, overwegend horizontaal, ≤0,9 s) wisselt alleen bij 1×. Ingezoomd: slepen verschuift, pijltoetsen scrollen, geen wissel. Zoom en draaiing gaan per foto terug naar begin.
- Credits: per foto wordt de eigen fotoinformatie getoond. Sluiten: focus op de laatst getoonde foto, scrollpositie ongewijzigd.

## FOT-02 — meerdere hoofdfoto's (mechanisme, standaard uit)
- `src/features/species/guideHeroSets.js`: lijst per soort, **bewust leeg**. Vullen alleen na eigenaarbesluit per soort.
- `guideHeroPhotos()` accepteert alleen bestaande, gecrediteerde gidsfoto's van dezelfde soort; dubbele, vreemde en onbekende paden worden genegeerd; maximaal 3.
- Kaart: rustige teller "1/3" rechtsonder; extra foto's worden pas geladen als de kijker opent. Eén foto: huidige weergave.
- Labels alleen uit vastgelegde velden (geslacht, leeftijd, vlucht, label).
- Let op bij invullen: een extra hoofdfoto blijft ook in zijn kleedgroep staan (zelfde opname op twee plekken), zoals nu niet met de hoofdfoto gebeurt.

## WEE-01 — windrichting en locatie
- Open-Meteo-aanvraag uitgebreid met `wind_direction_10m`. Weergave: "💨 5 m/s · wind uit NO (45°)" + kleine pijl (wijst waar de wind naartoe waait, verborgen voor schermlezer). Schermlezer: "Wind 5 m/s uit het noordoosten, 45 graden".
- 16-puntskompas (N, NNO, NO, ONO, O, OZO, ZO, ZZO, Z, ZZW, ZW, WZW, W, WNW, NW, NNW); graden eerst afgerond zodat punt en getal kloppen. Geen richting → geen richting getoond; geen snelheid → "Wind onbekend"; ontbrekende temperatuur → "—".
- Locatie zonder coördinaten en zonder nieuwe dienst: eigen opgeslagen plek binnen 3 km → "📍 Bij <plek> — actueel weer · eigen plek"; anders "Je huidige omgeving · GPS"; zonder toestemming "Amsterdam (standaardlocatie) · geen locatietoestemming" (de bestaande terugval).
- Bestaand (niet gewijzigd): de zonkaart toont al coördinaten met 2 decimalen (±1 km).

## QA op deze branch (lokaal, deployset-server, Chromium mobiel)
| Bewijs | Uitkomst |
|---|---|
| `tests/test_fot_wee_ux.py` A1–A9 (320/390/430), B1–B4, C1–C7, Z1 | PASS 35/35 |
| `tests/test_fot_wee_units.mjs` | PASS |
| Regressie: personal-guide, signature 1–4, plumage-compare-layout, plumage-keyboard-credits, kennisbaseline, f3-rev2-r01, cinematic-wetland, m22, soortaudit, home-hotspots, showcase, map-k4/k5, pilot-offline, cross-profile-zip, navigation-recovery, app-search, r2b-places-env-zip, species-detail, audio-status, profile-backup | PASS |
| fotovolgorde-2026-11-10 | FAIL FVB-01 (sp059 Lijkt op) — identiek op base `ec85e05`, buiten scope |
| Node-suite | 57/58; `test_photo_feedback.mjs` faalt alleen in deze omgeving |
| Deployset (`.vercelignore`) | PASS, nieuwe modules in precache en binnen de set |

Screenshots: `docs/media-intake/2026-11-24/fot-wee/`. Vercel-preview: niet gemaakt (opslagmeter niet gecontroleerd; Claude heeft geen Vercel-toegang). Toestel: NOT TESTED.
