# F3-REV2-R03 — tweede verificatieronde · Torenvalk, Slechtvalk, Grote Bonte Specht

| | |
|---|---|
| Ronde | **F3-REV2-R03** (seq 7–9) |
| Datum | 23-11-2026 |
| Norm | Birdspot Kwaliteitsnorm v1.10 FINAL |
| Basis | R02c-checkpoint `ad514b0f298a9143586311a9c079bc26370b71aa` (PR #352) · werk-PR #353 |
| Eigenaarbesluit | 23-11-2026 22:10: R02b-QA geaccepteerd; Havik-vluchtfoto uit de gids (R02c); start R03; quickPrimary alleen op R03-soorten; eigenaarspoort per vogel |
| Beoordelaar | Claude (Opus 5.5) — eigen beoordeling, geen onafhankelijke review |
| Status | **BEOORDEELD · EIGENAARSPOORT OPEN (3/3)** — geen verbetering en geen R04 zonder eigenaarbesluit |

Registratie: `F3_140_HERCONTROLE_V0.1_DRAFT.json` → `records[sp008, sp009, sp016].F3.secondReview` en `secondReview.batches[2]`; tellers tweede ronde 9/140 herbeoordeeld, 3 poorten open, 6 besluiten, 0 FULL PASS. Eerste ronde ongewijzigd (digest `98b75cae…`).

## Uitgevoerd

| Controle | Uitkomst |
|---|---|
| 17 foto's op volle resolutie bekeken | per foto in het register (visueel, identiteit, kwaliteit, rol) |
| origcheck (media-intake, GitHub-runner) | 17/17 originelen gevonden: 16 zelfde opname automatisch, 1 uitsnede visueel bevestigd (Slechtvalk vlucht, r=0,659); 15 Commons-foto's auteur + licentie gelijk + SHA-1 + herkomstcontext; 2 iNaturalist-foto's: licentie-API 404 → registerwaarde, PARTIALLY TESTED |
| 5 geluidsclips | rechten via Commons: 4 exact, 1 auteur met toegevoegde gebruikersnaam (roffel GBS); niemand heeft soort/type beluisterd |
| Vogelbescherming | WebFetch-toestemming gevraagd (~23:00), hostprompt onbeantwoord → NOT TESTED, niet opnieuw geprobeerd |
| ANWB | NOT TESTED (geen exemplaar) |
| quickPrimary | sp008 [bidden, lange staart], sp009 [bouw/vleugels/staart, kleed volwassen/jong], sp016 [witte schoudervlekken, rode onderkant]; render 597 soorten: alleen sp008, sp009, sp016 anders |
| Soortverwarring | LK-100 Torenvalk–Slechtvalk, LK-101 GBS–Middelste, LK-102 GBS–Kleine (fotoparen); LK-103 Torenvalk–Boomvalk, LK-104 Torenvalk–Smelleken, LK-105 Slechtvalk–Boomvalk (alleen tekst, geen gidsfoto's); LK-098/099 mediaOpen bijgewerkt |
| Vergelijkingen | alle bestaande fotoparen en kritische kaarten behouden (`test_f3_rev2_r03.mjs`) |

## Herkomst foto's (Commons-context, intern)

| Soort | Foto | Herkomst |
|---|---|---|
| Torenvalk | hoofdfoto / mannetje / vrouwtje / juveniel / mannetje-vlucht / biddend | Frankrijk / Polen / Frankrijk / Schotland / Turkije / onbekend |
| Slechtvalk | hoofdfoto / juveniel / vlucht / vlucht / rust / juveniel-vlucht | India / Californië / onbekend / onbekend (iNat) / India (calidus) / onbekend (iNat) |
| Grote Bonte Specht | hoofdfoto / mannetje / vrouwtje / juveniel / vlucht | Schotland / Drenthe / Duitsland / Rusland / Schotland |

## Materiële tekortkomingen (eigenaarspoort)

| ID | Soort | Tekortkoming | Kleinste veilige verbetering |
|---|---|---|---|
| G3 | Torenvalk | "Let op": jeugdkleed "in de geraadpleegde bron niet beschreven", terwijl de kaart een juveniel toont en de leeftijdsdetail het beschrijft | Zin vervangen door bestaande claim: juveniel lijkt op vrouwtje; kop/staart alleen geeft weinig zekerheid |
| G4 | Torenvalk, Slechtvalk | Geen kritische kaart vs. Sperwer/Slechtvalk (Torenvalk) en Havik/Torenvalk/Smelleken (Slechtvalk); Torenvalk–Slechtvalk-paren zonder gelabelde rijen | Kritische kaarten en rijen uit bestaande vergelijkingsclaims (bouw, staart, baardstreep, jachtwijze) |
| G7 | Slechtvalk | Geen enkele foto aantoonbaar Europees; juveniel donker Noord-Amerikaans type | Gerichte zoektocht Commons naar Europese volwassen + juveniel (alleen met akkoord; geen brede import) |
| G8 | Slechtvalk | 2 iNaturalist-licenties niet herbevestigd | Andere iNaturalist-route of vervangen |
| G9 | Grote Bonte Specht | Rollabel Middelste-foto in juveniel-paar toont "Grote of middelste bonte specht?" | `plumage: 'adult_m'` op sp020 in dat paar → label "Mannetje" |
| G10 | Grote Bonte Specht | Paren zonder gelabelde rijen; geen volwassen paar met Middelste; geen vrouwtjespaar met Kleine; kritische kaarten missen onderstaart/flanken | Rijen (kop/nek, onderstaart, rug/flanken) en paren uit bestaande foto's (sp020-male, sp017-female, sp016.webp) |
| G11 | Grote Bonte Specht | Publieke tekst "Bron noemt volwassen vogels 'normaal gesproken' makkelijk" | Herformuleren zonder "bron" |
| G12 | Grote Bonte Specht | Vluchtfoto bewegingsonscherp; bijschrift overschat zichtbaarheid schoudervlek | Bijschrift corrigeren; betere vluchtfoto later |
| G5/G13 | alle drie | Audio niet menselijk beluisterd; Slechtvalk-clip zonder roeptype/herkomst; roffel-auteur met gebruikersnaam | Beluisteren door eigenaar/deskundige; credit gelijktrekken |
| G6 | Torenvalk, Slechtvalk | Boomvalk/Smelleken alleen tekst (geen gidsfoto's) | Pas bij F3 van sp260/sp261 |
| G1/G2 | alle drie | ANWB en Vogelbescherming NOT TESTED | ANWB-exemplaar; WebFetch-prompt beantwoorden |

## Tests

`test_f3_rev2_r01.mjs` (9 records, digest, quickPrimary alleen in gecontroleerde batch), nieuw `test_f3_rev2_r03.mjs` (bestaande paren en kritische kaarten behouden, LK-100…105, poort open), `test_f3_rev2_r02_compare.mjs` (quickPrimary laat alle kenmerken staan — nu ook R03), `test_f3_rev2_r01_browser.py` (9 soorten, 320/360/390 + offline, R02c Havik), lookalike R09–R17, node-suite 53/54 (`test_photo_feedback`: lokaal `sharp` ontbreekt, ook op basis), species_detail, kennisbaseline_browser, mobile_owner_review, plumage_compare_layout PASS. Toestel, preview, productie: NOT TESTED.
