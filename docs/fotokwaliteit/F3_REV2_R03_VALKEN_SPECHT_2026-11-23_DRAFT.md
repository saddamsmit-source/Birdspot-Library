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

## F3-REV2-R03b — eigenaarbesluit B (24-11-2026)

- Eigenaarbesluit: chat 24-11-2026 07:39 CET — B voor sp008, sp009, sp016; Slechtvalk met gericht fotoonderzoek. Geen FULL PASS, geen nieuwe optie C, R04 niet starten.
- Writer: claim op PR #353 opnieuw ACTIEF (comment 7124166865) vanaf 9c6ecd3; geen nieuwe branch nodig (zelfde concept-PR, geen andere schrijver).
- Alle nieuwe tekst komt uit bestaande, gebronde claims in `knowledge.json` (VB_TOREN, BZ_TOREN, EB_KES, VB_SPERWER, VB_HVS, VB_SLECHT, VB_HAVIK, VB_BOOMVALK, VB_SMELLEKEN, VB_GBS, VB_GBS_MBS, VB_MBS, VB_KLEINE_BONTE_SPECHT). Die bronnen zijn in REV2 niet herlezen: tekst blijft PARTIALLY TESTED.

| Soort | Uitgevoerd |
|---|---|
| Torenvalk | G3 "Let op" herschreven (jongen lijken sterk op vrouwtjes; leeftijdskenmerken en onzekerheid behouden). G4: kritische kaarten vs. Sperwer en vs. Slechtvalk; Boomvalk/Smelleken-kaart aangevuld; gelabelde rijen op beide Slechtvalk-paren; Lijkt-op-teksten inhoudelijk |
| Slechtvalk | G4: kritische kaarten vs. Havik, Torenvalk, Smelleken; Boomvalk-kaart aangescherpt; nieuw paar Slechtvalk–Havik volwassen in vlucht (Commons-foto met bevestigde rechten tegen bewezen Havik-mannetje) met rijen. G7: gericht onderzoek (11 zoekopdrachten, `docs/media-intake/2026-11-24/discover-rev2-r03b`): geen kandidaat aantoonbaar beter → niets vervangen of verwijderd; beste Europese kandidaten voor eigenaarkeuze (Toscane volwassen vlucht; Brandon Marsh juveniel vlucht; Noordwijk volwassen op nestkast). G8: iNaturalist-controle met openbare fallbackroutes (`orig_check.py`), uitkomst in het register |
| Grote Bonte Specht | G9: Middelste-foto in juveniel-paar → "Volwassen" (Commons noemt male, geslacht niet zichtbaar). G10: nieuwe paren volwassen Grote–Middelste en vrouwtjes Grote–Kleine; gelabelde rijen op alle paren incl. vlucht; kritische kaarten onderstaart/flanken en rood op de kop. G11: "Bron noemt…" vervangen. G12: vluchtfoto op volle resolutie herbeoordeeld — schoudervlek, vleugelstippen, nekvlek en onderstaart scherp; bijschrift klopt; R03-oordeel (verkleind beeld) ingetrokken |

- Gelabelde rijen vervangen in de weergave de vrije kenmerktekst van een paar; per paar gecontroleerd dat er geen inhoud wegvalt (vleugelvorm, "lijkt op vrouwtje", licht gezicht en de fotonotitie Middelste zijn in rijen of tip opgenomen).
- Soortverwarring: LK-106 (Grote–Middelste volwassen), LK-107 (Grote–Kleine vrouwtjes), LK-108 (Slechtvalk–Havik volwassen vlucht); LK-100/101/102/105 bijgewerkt; LK-001…LK-105 behouden.
- Render-diff t.o.v. 9c6ecd3: alleen sp007, sp008, sp009, sp016, sp017, sp020 (partnerkaarten door gedeelde vergelijkingen, bedoeld).
- Vogelbescherming: hostprompt 24-11 ~07:45 onbeantwoord → NOT TESTED, niet herhaald. ANWB NOT TESTED. Audio niet beluisterd.
- G8 BLOCKED: de fallbackroutes zijn gebouwd en getest (`tests/test_orig_check.py`), maar media-intake-run 45345440099 hing twee keer 20 min in `apt-get` (ffmpeg) op de GitHub-runner (pip slaagde). Eén veilige herhaling gebruikt; iNaturalist-licenties (sp009 ×2, sp007 mannetje-vlucht) blijven PARTIALLY TESTED. Eigenaaractie: later opnieuw starten, of akkoord om ffmpeg alleen in audiomodus te installeren.

## F3-REV2-R03c — eigenaarbesluit R03b-QA (24-11-2026 09:53)

- Toestemming: GBS-fotokwaliteit nauwkeuriger, ffmpeg alleen bij audio, één G8-heruitvoering, visuele vergelijking van drie Slechtvalk-kandidaten. Geen import, geen vervanging, geen R04.
- Writer: claim #353 ACTIEF 09:58 (comment 7126709921). Oude runs op `feat/birdspot-m4-k03-phase-4` (gesloten PR #140, laatste commit 11-11) zijn geen concurrerende schrijver.

| Onderdeel | Uitkomst |
|---|---|
| ffmpeg | `tools/media/needs_ffmpeg.py` + voorwaardelijke stap in `media-intake.yml`: ffmpeg alleen bij `audiocheck` en `import` met audio-items; `discover`, `origcheck` en foto-import zonder; onbekende modus of kapot importmanifest = fout. Branchbeveiliging, rechten, pip-afhankelijkheden en time-out ongewijzigd. Test `tests/test_media_intake_deps.py` (6 modi/varianten, 4 weigeringen, CLI-uitvoer, workflowstructuur). Op de runner: run 45360468665 sloeg de ffmpeg-stap over en slaagde |
| G8 iNaturalist | één heruitvoering (run 45360468665): originelen bereikbaar via open-data (sp009 juveniel r=1,0; sp009 volwassen en sp007 uitsneden), maar v1-, v2- en `.json`-route gaven 404 voor alle drie de foto-ID's → licentie, attributie en waarnemingscontext niet verkregen; PARTIALLY TESTED (niet meer BLOCKED), geen verdere retries |
| GBS-vluchtfoto | origineel 3389×2259 op volle resolutie (`origcheck-rev2-r03c/sp016-flight_full_crop.jpg`, SHA-1 gelijk): kop, rode nekvlek, witte schoudervlek, rug en rode onderstaart scherp; vleugel grotendeels bewegingsonscherp. Totale kwaliteit PARTIALLY TESTED; vluchtcontrole `voorwaardelijk`, vervanging gewenst; bijschrift "Voorlopige foto: beperkte scherpte…" met alleen scherpe kenmerken; oude beoordeling in `reviewHistory`, `history` en `qualityHistory`. Vergelijkingsteksten ontlenen geen vleugeldetails aan de foto |
| Slechtvalk-kandidaten | origineel + bronpagina via `kind: candidate` (geen import): 1 Toscane volwassen in vlucht → **beter en geschikt als vervanging** van `sp009-male-flight` (volledig silhouet, rechten bevestigd, Europees; minder scherp, prooi in klauwen) — voorstel, niet uitgevoerd; 2 Brandon Marsh juveniel → niet beter (tegenlicht, zacht); 3 Noordwijk volwassen → niet beter (klein, zacht, deels afgedekt) |

- Render-diff t.o.v. 6950244: alleen sp016 (bijschrift) en sp020 (alt-tekst van dezelfde foto in de vergelijking).

## F3-REV2-R03d — eigenaarbesluit R03c-QA (24-11-2026 12:16)

- SYNC-CHECK (alleen Claude-kant, 24-11 12:20): Index v3.14 FINAL, Handbook v2.18 FINAL, Projectinstructies v2.14 FINAL, Veldhandboek v0.10 FINAL in de projectbronnen; oudere versies alleen onder `archief/` als HISTORISCH_NIET_ACTIEF. Op deze branch is `docs/BIRDSPOT_KWALITEITSNORM.md` v1.10 FINAL (via #350). README noemt de tweede F3-ronde nog niet (open documentatiepunt). Gezamenlijke SYNCHRONIZED: NOT TESTED (ChatGPT-kant niet door Claude te controleren).
- **GBS-vluchtfoto:** soortaudit M2 `verdict` goedgekeurd (10-11-2026) → `voorwaardelijk`, gelijk aan de vluchtcontrole; `verdictHistory` en `qualityHistory` bewaren het oorspronkelijke besluit. Foto, bijschrift, bron en rechten ongewijzigd; scherpere vluchtfoto OPEN. De gedateerde momentopname `soortaudit-status.json` (sha 2e20f1d) is historisch en niet herschreven. Nieuwe test: elke voorwaardelijke vluchtfoto heeft in de soortaudit ook `voorwaardelijk`.
- **Slechtvalk, Toscane-kandidaat (niet actief):** volwassen, volledig silhouet van onderen, kap/baardstreep/tekening scherp op 100 %; rechten VERIFIED (eigen werk, CC BY-SA 4.0, SHA-1 4c8acd03… gelijk); herkomst alleen uit bestandsnaam (PARTIALLY TESTED); ondersoort en geslacht onbekend. Huidige foto is groter en scherper maar met half gevouwen vleugels en onbevestigde licentie. Meerwaarde vooral in het paar Torenvalk–Slechtvalk (zelfde kijkhoek); beperkt in Slechtvalk–Havik. Reviewblad: `docs/media-intake/2026-11-24/origcheck-rev2-r03c/R03d_Slechtvalk_vlucht_huidig_vs_Toscane_REVIEW.jpg`. Definitief fotobesluit bij de eigenaar.
- **G8:** run 45360468665 vastgelegd per foto (bereikbaar origineel, identiteit, 404-routes, ontbrekende gegevens, geregistreerde claim CC BY 4.0). Status PARTIALLY TESTED; geen nieuwe iNaturalist-aanroepen.
- Render-diff t.o.v. 93e9500: geen enkele kaart gewijzigd.
