# Birdspot F3-R11 — Goudvink, Appelvink, Roodmus

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED
**Branch:** `qa/birdspot-f3-r11-goudvink-appelvink-roodmus-20261116` · **PR:** #269 (concept) · **Base:** PR #268 @ `f132afb4` (niet gewijzigd)
**Normen:** Handbook v2.17 FINAL, Projectinstructies v2.13 FINAL, Index v3.12 FINAL, Veldhandboek v0.7 FINAL, kwaliteitsnorm v1.7 (§3.3 vrije vlucht, §3.4 alleen complete fotoparen).

## 1. Onderzocht en verbeterd

| Soort | Foto's geopend | Bevinding | Verbetering |
|---|---|---|---|
| Goudvink `sp040` | 4 (mannetje, vrouwtje, juveniel, vlucht) | Alle rollen passen bij de zichtbare kenmerken. Vluchtbeeld is echte vrije vlucht met zichtbare witte stuit. | F3-record; lookalikepaar LK-013 Goudvink–Vink (♂ en ♀ in rust) geregistreerd. |
| Appelvink `sp041` | 4 (mannetje, vrouwtje, juveniel, vlucht) | Kleden passen. Vluchtbeeld echt maar 330 px: blijft voorwaardelijk ("Voorlopige foto"). | F3-record; LK-014 Appelvink–Vink (♂, ♀, juv in rust). Geen vluchtpaar. |
| Roodmus `sp042` | 1 (mannetje, showcase) | Past bij de soort. Gearchiveerde onscherpe opvliegfoto blijft gearchiveerd. F3-register miste de getoonde foto. | Beeldpositie + blob-SHA; **nieuw brongedragen kennisprofiel** (Vogelbescherming soortpagina en twee berichten, RSPB); LK-012 nu ook Roodmus-focus; LK-015 Roodmus–Grauwe Gors alleen tekst. |

Fotoparen alleen waar beide foto's bestaan (§3.4). Grauwe Gors heeft geen gidsfoto: tekstwaarschuwing in het Roodmus-profiel, geen fotopaneel.

## 2. Nog ontbrekend

- Roodmus: foto's van vrouwtje, juveniel en vrije vlucht (niet verzonnen).
- Appelvink: scherpere, grotere vrije-vluchtfoto.
- Zang en roep voor alle drie (geen opnames; intake vereist eerst menselijke luistercontrole).
- Actuele Sovon-aantallen Roodmus (het Vogelbeschermingsbericht over aantallen is van circa 2018), biometrie met twee uitgevers, ANWB, eBird.
- Bronoriginelen van de bestaande foto's niet opnieuw vergeleken; tweede beoordelaar open.

## 3. Tests die werkelijk draaiden (lokaal)

Alle `tests/*.mjs` geslaagd behalve `test_photo_feedback.mjs` (lokaal ontbreekt `sharp`; ook op de base). Nieuw: `test_lookalike_r11.mjs`, `test_lookalike_r11_browser.py` (Chromium 320/360/390 px, beide richtingen, zoom en terug, Grauwe Gors verborgen). Rebaseline met elfde blok (33/140). Python: M20, M22 (pin bijgewerkt voor het Roodmus-profiel), soortdata, detail, kennisvalidator, intakebeleid. Chromium: R10-lookalike, kennisbaseline, soortaudit. Toestel en interactieve preview: **NOT TESTED / BLOCKED**.

## 4. Volgende veilige stap

F3-R12 met de volgende drie soorten uit de vaste volgorde, op een nieuwe branch vanaf de head van deze branch.
