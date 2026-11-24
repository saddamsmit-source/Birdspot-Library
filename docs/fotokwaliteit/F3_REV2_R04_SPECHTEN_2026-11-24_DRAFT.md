# F3-REV2-R04 — Kleine Bonte Specht, Zwarte Specht, Groene Specht (DRAFT)

Status: REVIEWED / OWNER GATE OPEN · Datum 24-11-2026 · PR #354 · base 4a430e6 (R03d-checkpoint)
Reviewer: Claude (Opus 5.5, Claude Code cloud) — eigen beoordeling, geen onafhankelijke review.
Norm: Birdspot Kwaliteitsnorm v1.10 FINAL; eigenaarbesluit 24-11-2026 12:16 CET.
Register: `F3_140_HERCONTROLE_V0.1_DRAFT.json` (records sp017–sp019, batch F3-REV2-R04), `SOORTVERWARRING_REGISTER_V0.1_DRAFT.json` (LK-109…LK-111).
Bewijs: `docs/media-intake/2026-11-24/origcheck-rev2-r04/` (Commons-API, SHA-1, zelfde-opnamecontrole, 100%-uitsneden), `docs/media-intake/2026-11-24/review-rev2-r04/` (contactbladen en kaartschermafbeeldingen 390 px).

## Bronnen
| Bron | Status |
|---|---|
| Vogelbescherming (soortpagina's) | NOT TESTED — WebFetch-hostprompt 24-11 ~12:50 onbeantwoord; niet herhaald, geen omweg |
| ANWB Vogelgids van Europa (2023) | NOT TESTED — geen rechtmatig exemplaar beschikbaar |
| Commons-bestandspagina's (14 foto's, 6 audio) | VERIFIED via API, behalve sp018-juv-review (auteur/beschrijving leeg) en sp018-flight-call (gebruikersnaam toegevoegd) → PARTIALLY TESTED |
| Audio (6 clips) | PARTIALLY TESTED — niet menselijk beluisterd |

## Kleine Bonte Specht (sp017)
- Foto's: hoofdfoto mannetje Italië 2024 scherp maar sterk versleten/bevlekt, warme tinten, rug grotendeels verborgen (weinig representatief); vrouwtje Hongarije 2019 goed; "vlucht" is afzet bij nestholte, terecht als Verenkleed (Vrouwtje) getoond. Geen juveniel, geen echte vrije vlucht.
- Rechten: alle drie VERIFIED (auteur, licentie, SHA-1, zelfde opname).
- Snel herkennen: onderstaart + rode kruin mannetje (quickPrimary [2,3]) onder kritisch kenmerk rugbandering; formaat niet als enig kenmerk.
- Lijkt op: Grote Bonte Specht — mannetjes en vrouwtjes met gelabelde rijen (Rug, Rood op de kop, Onderstaart en formaat); Middelste — één fotopaar zonder rijen, rollabel toont de paartitel "Kleine of middelste bonte specht?" i.p.v. kleed (UI-fout, aantoonbaar), Middelste-foto zonder kleedlabel. LK-109 geregistreerd.
- Open: G1, G2, G5, G14 hoofdfoto, G15 juveniel/vlucht, G16 paar Kleine–Middelste.
- Advies: **B** — rijen + rollabel Kleine–Middelste herstellen, hoofdfotokandidaat (typisch mannetje met zichtbare rugbandering) als niet-actief voorstel onderzoeken.

## Zwarte Specht (sp018)
- Foto's: hoofdfoto mannetje Roemenië 2015 zeer goed; mannetje bosbodem Brussel (klein in beeld); vrouwtje Hessen goed; juveniel alleen kopdetail; vlucht Baden-Württemberg bruikbaar (uitsnede zelfde opname).
- Rechten: VERIFIED behalve juv-review (Commons-API leeg; auteur uit controle 09-11 blijft) en vluchtroep (gebruikersnaam) → PARTIALLY TESTED.
- Snel herkennen: geheel zwart/groot + rood op de kop man/vrouw (quickPrimary [0,2]).
- Lijkt op: Groene Specht in rust (mannetjes) en vlucht — fotoparen gelijkwaardig, tekst in vrije zinnen zonder gelabelde rijen; één kritische kaart. LK-110/LK-111.
- Open: G1, G2, G5, G17 juveniel/rechten, G18 geen roffel-opname, G19 rijen en overige verwarring.
- Advies: **B** — gelabelde rijen Zwarte–Groene (beide richtingen), roffel als materiaalgat registreren.

## Groene Specht (sp019)
- Foto's: hoofdfoto mannetje Kew 2014 (rode kern baardstreep op volle resolutie), zijaanzicht Franconville 2022, vrouwtje op de grond 2017, juveniel Kampenhout 2008, vrouwtje in vrije vlucht 2023 — alle goed en rolcorrect.
- Rechten: alle vijf VERIFIED.
- Snel herkennen: groene rug + rode kruin, oogmasker + baardstreep (quickPrimary [0,1]) onder kritisch kenmerk stuit/vlucht.
- Lijkt op: Zwarte Specht (rust, vlucht) zonder rijen; Wielewaal alleen tekst (LK-060); Grijskopspecht (sp482) niet vergeleken: geen profiel, foto's of gebronde claim (BLOCKED/NOT TESTED). Geen "Let op"-tekst en lege similar-lijst.
- Open: G1, G2, G5, G20 Grijskopspecht, G21 rijen/Let op.
- Advies: **B** — rijen Zwarte–Groene, Let op (vrouwtje/juveniel, tegenlicht); Grijskopspecht alleen na bronlezing.

## Gemeenschappelijk
- quickPrimary: alleen R04-soorten (max. 2 van 4 kenmerken zichtbaar, rest onder Meer kenmerken). Render-diff t.o.v. 4a430e6: alleen sp017, sp018, sp019 (597 kaarten).
- Geen foto's geïmporteerd, vervangen of verwijderd; geen nieuwe iNaturalist-aanroepen.
- Privacy: geen locatie- of nestgegevens in de kaarttekst.
- Geen FULL PASS; eigenaarspoort A/B/C per soort open.
