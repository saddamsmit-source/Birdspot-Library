# Birdspot Library — Fotobaseline-tracker (Fase 3-C/3-D)

Hervatbaar per-soortregister van de controle van bestaande gidsfoto's tegen de ontwerpbaseline (handover v1.0 §6–§8). Gegenereerd door `tools/fotobaseline/build_tracker.py`; niet met de hand bewerken — pas `docs/fotobaseline/reviews/batch-NN.json` aan en genereer opnieuw.

## Stand

| Meting | Waarde |
|---|---|
| Laatst gecontroleerde render-commit | `53eb772cbc413bd49e457e64442a3e1dca9a98c9` |
| Gemeten mediadata (identiek op `preview/birdspot-review` 659cbb8) | `de4ef309490f0156b6e51dea1a478acac28eb344` |
| Totaal soorten | 597 |
| Soorten met ≥1 gidsfoto | 134 |
| Soorten zonder gidsfoto | 463 |
| Volledig gecontroleerde soortkaarten (VERIFIED) | 11 |
| PARTIALLY TESTED / NOT TESTED / BLOCKED | 8 / 115 / 0 |
| Gecontroleerde soorten — technisch: VERIFIED / PARTIALLY / NOT TESTED / BLOCKED | 19 / 0 / 0 / 0 |
| Gecontroleerde soorten — visueel: VERIFIED / PARTIALLY / NOT TESTED / BLOCKED | 13 / 6 / 0 / 0 |
| Gecontroleerde soorten — bron/rechten: VERIFIED / PARTIALLY / NOT TESTED / BLOCKED | 14 / 5 / 0 / 0 |
| Gecontroleerde soorten met openstaande issues | 8: sp066, sp067, sp128, sp129, sp092, sp089, sp091, sp188 |
| Ontbrekend (van 134) — hoofdfoto / mannetje / vrouwtje / juveniel / vlucht | 0 / 18 / 36 / 88 / 17 |
| Bron-/licentieproblemen (ontbrekend veld of Latijnse naam wijkt af) | 0 |
| Niet in offline-precachelijst (sw.js) | 0 |
| Gedetecteerde duplicaten op de kaart (zelfde pad 2x getoond of dHash ≤ 6) | 0 |
| Registry-hergebruik zelfde bestand (één keer getoond, geen kaartduplicaat) | 7: sp008, sp009, sp019, sp020, sp031, sp032, sp033 |
| Benodigde kwaliteitsvervangingen (uit reviews) | 6: sp066, sp003, sp129, sp130, sp091, sp188 |

Mannetje/vrouwtje "ontbreekt" telt alleen bij soorten met verschillend kleed; bij gelijke geslachten is dat n.v.t. Een hoofdfotoverwijzing telt als gevuld.

## Bewijsgrenzen

- **Code/render** (VERIFIED-basis): `recognitionPanel()` en `guideHeroPhoto()` uit de checkout zelf, in Node gerenderd; volgordecontrole per sectie en kleedslot.
- **Beeld**: alle bestanden gedecodeerd (Pillow), afmetingen gemeten, dHash over alle eigen beelden per soort.
- **Visueel**: contactsheets per soort bekeken door Claude; geslacht/leeftijd alleen bevestigd waar het kenmerk zichtbaar is. Geen onafhankelijke ornithologische certificering.
- **Bron/rechten**: koppeling aan `docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json` (367 foto's, zelfde opname via ORB+RANSAC, maker, licentie, iNaturalist-annotaties) of `tools/species/verified_heroes_2026-11-09.json`. Licentieconformiteit, geen juridisch oordeel.
- **Offline**: alleen gecontroleerd dat het pad in `credits.json`/`field-guide-media.json` staat (precachebron van `sw.js`). Browser-offline en fysiek toestel: NOT TESTED.
- Status geldt voor de render-commit hierboven. Correcties die alleen op een ongemergede PR staan, staan bij de soort vermeld.

## Batch 01 — Aalscholvers t/m Eenden (eerste 19 gefotografeerde soorten in volgorde soortgroep A-Z, soort A-Z)

Beoordeeld 2026-11-10 · Claude (Opus 5.5), visuele controle via contactsheets en uitsneden; geen onafhankelijke ornithologische certificering.

### sp104 Aalscholver — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp104 |
| 2 | Naam | Aalscholver · *Phalacrocorax carbo* |
| 3 | Soortgroep | Aalscholvers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp104.webp` (GUIDE_PHOTOS) — Geschikt: adult in broedkleed (witte dijvlek, kuif), volledig in beeld. Geslachten gelijk. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp104-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 0 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Jaarling-label consistent met lichte onderzijde. Vluchtfoto bruinig, terecht zonder geslacht/leeftijd. |
| 11 | Maker/bron/licentie | sp104.webp: MPF · CC BY-SA 4.0; sp104-jaarling.webp: Andreas Trepte, www.avi-fauna.info · CC BY-SA 2.5; sp104-flight.webp: Charles J. Sharp · CC BY-SA 3.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 3/3 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel (pas uitgevlogen) ontbreekt; jaarling staat apart. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. Fase 2: juveniel zoeken. |

### sp065 Boomklever — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp065 |
| 2 | Naam | Boomklever · *Sitta europaea* |
| 3 | Soortgroep | Boomklevers · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp065.webp` (GUIDE_PHOTOS) — Geschikt: scherp, volledig, typerend. Geslacht niet betrouwbaar vast te stellen (subtiel flankverschil) — niet geforceerd. |
| 5 | Mannetje / vrouwtje / juveniel | M nee · V nee · Juv nee |
| 6 | Vluchtfoto's | sp065-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto terecht neutraal. |
| 11 | Maker/bron/licentie | sp065.webp: Chme82 · CC BY-SA 4.0; sp065-flight.webp: C. Robiller / naturlichter.de · CC BY-SA 3.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Mannetje, Vrouwtje en Juveniel als bevestigde foto ontbreken. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. Fase 2: bevestigd mannetje/vrouwtje en juveniel zoeken. |

### sp066 Boomkruiper — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp066 |
| 2 | Naam | Boomkruiper · *Certhia brachydactyla* |
| 3 | Soortgroep | Boomkruipers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp066.webp` (GUIDE_PHOTOS) — Bruikbaar maar klein in beeld en wat zacht. Boomkruiper/Taigaboomkruiper is op foto niet zelfstandig te onderscheiden; beeld consistent met bron (bruinige flanken). |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | — |
| 7 | Vergelijkingen | 2 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Geen geslachts-/leeftijdslabels. |
| 11 | Maker/bron/licentie | sp066.webp: Jan Matthies · CC BY-SA 4.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 1/1 beelden laden. Matig: vogel klein in kader. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vluchtfoto en juveniel ontbreken; geslachten gelijk. Vervanging: hoofdfoto (vogel klein, zacht) |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Soort-ID steunt op bronmetadata, niet op eigen visuele bevestiging. Fase 2: scherpere hoofdfoto overwegen. |

### sp067 Taigaboomkruiper — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp067 |
| 2 | Naam | Taigaboomkruiper · *Certhia familiaris* |
| 3 | Soortgroep | Boomkruipers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp067.webp` (GUIDE_PHOTOS) — Geschikt: scherp, witte onderzijde, steunstaart. Soort-ID op foto niet zelfstandig te bevestigen t.o.v. Boomkruiper; consistent met bron. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | — |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Geen. |
| 11 | Maker/bron/licentie | sp067.webp: Bengt Nyman from Vaxholm, Sweden · CC BY 2.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 1/1 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vluchtfoto en juveniel ontbreken. |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Soort-ID steunt op bronmetadata. Fase 2: vlucht/juveniel. |

### sp057 Fitis — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp057 |
| 2 | Naam | Fitis · *Phylloscopus trochilus* |
| 3 | Soortgroep | Boszangers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp057.webp` (GUIDE_PHOTOS) — Geschikt: scherp, lichte poten zichtbaar (onderscheid Tjiftjaf). |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | — |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Geen. |
| 11 | Maker/bron/licentie | sp057.webp: Andreas Trepte · CC BY-SA 2.5 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 1/1 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vluchtfoto en juveniel ontbreken. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. Fase 2: vlucht/juveniel. |

### sp058 Fluiter — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp058 |
| 2 | Naam | Fluiter · *Phylloscopus sibilatrix* |
| 3 | Soortgroep | Boszangers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp058.webp` (GUIDE_PHOTOS) — Geschikt: scherp, gele keel/wenkbrauw. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp058-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 0 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto (biddend) terecht neutraal; kop eerder groengeel dan uitgesproken geel, past bij soort. |
| 11 | Maker/bron/licentie | sp058.webp: Mike Duchstein · CC BY-SA 4.0; sp058-flight.webp: Andrey Gulivanov · CC BY 2.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel ontbreekt. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. |

### sp056 Tjiftjaf — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp056 |
| 2 | Naam | Tjiftjaf · *Phylloscopus collybita* |
| 3 | Soortgroep | Boszangers · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp056.webp` (GUIDE_PHOTOS) — Geschikt: scherp, donkere poten zichtbaar. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp056-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto terecht neutraal. |
| 11 | Maker/bron/licentie | sp056.webp: Alexis Lours · CC BY 4.0; sp056-flight.webp: Falco2022 · CC BY-SA 4.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Hoofdfoto goed; vluchtfoto bewegingsonscherp maar herkenbaar. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel ontbreekt. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. |

### sp003 Holenduif — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp003 |
| 2 | Naam | Holenduif · *Columba oenas* |
| 3 | Soortgroep | Duiven · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp003.webp` (GUIDE_PHOTOS) — Geschikt: scherp, groene halsvlek, korte vleugelstrepen. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp003-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Vluchtvergelijking |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto terecht neutraal. |
| 11 | Maker/bron/licentie | sp003.webp: Chris Cant from Cumbria, UK · CC BY 2.0; sp003-flight.webp: Åsa Berndtsson · CC BY 2.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Vluchtfoto laag van resolutie (485x325), zacht, vogel vlak bij de grond (opvliegend). Korte zijde < 500 px: sp003-flight.webp 485×325. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel ontbreekt. Vervanging: vluchtfoto (485×325, zacht) |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Fase 2: vluchtfoto vervangen door scherpere, hogere resolutie. |

### sp002 Houtduif — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp002 |
| 2 | Naam | Houtduif · *Columba palumbus* |
| 3 | Soortgroep | Duiven · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp002.webp` (GUIDE_PHOTOS) — Geschikt: scherp, witte halsvlek. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp002-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Vluchtvergelijking |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto terecht neutraal. |
| 11 | Maker/bron/licentie | sp002.webp: Stephan Sprinz · CC BY 4.0; sp002-flight.webp: Stefan Berndtsson · CC BY 2.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel ontbreekt. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. |

### sp004 Turkse Tortel — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp004 |
| 2 | Naam | Turkse Tortel · *Streptopelia decaocto* |
| 3 | Soortgroep | Duiven · geslachten gelijk (kaart "Volwassen") |
| 4 | Hoofdfoto + geschiktheid | `sp004.webp` (GUIDE_PHOTOS) — Geschikt: volledig, zwarte nekband zichtbaar. |
| 5 | Mannetje / vrouwtje / juveniel | M n.v.t. · V n.v.t. · Volwassen ja · Juv nee |
| 6 | Vluchtfoto's | sp004-flight.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Vluchtvergelijking |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vluchtfoto terecht neutraal. |
| 11 | Maker/bron/licentie | sp004.webp: Jakub Hałun · CC BY 4.0; sp004-flight.webp: Florian Pépellin · CC BY-SA 4.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 2/2 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel ontbreekt. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. |

### sp128 Bergeend — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten PARTIALLY TESTED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp128 |
| 2 | Naam | Bergeend · *Tadorna tadorna* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp128.webp` (GUIDE_PHOTOS) — Geschikt maar niet ideaal: bevestigd mannetje (snavelknobbel zichtbaar in uitsnede), kop deels omlaag (foeragerend). |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V nee · Juv ja |
| 6 | Vluchtfoto's | sp128-flight.webp (geslacht niet vastgesteld); sp128-female-review.webp (female) |
| 7 | Vergelijkingen | 0 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Overige herkenningsfoto's |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | AFWIJKING: vluchtfoto sp128-flight.webp staat neutraal, maar toont een grote rode snavelknobbel = kenmerk adult mannetje; visualCheck noemt de knobbel zelf ook. Voorstel: sex=male. Niet toegepast — eigenaarbesluit. Bronaudit: geen geslachtswoorden in de bron van deze foto. |
| 11 | Maker/bron/licentie | sp128.webp: Charles J. Sharp · CC BY-SA 4.0; sp128-flight.webp: Marton Berntsen · CC BY-SA 4.0; sp128-female-review.webp: Charles J. Sharp · CC BY-SA 4.0; sp128-juv.webp: Daniel Holl (Herunumen) · Public domain; sp128-juv-grown.webp: Andrey Gulivanov · CC BY 2.0 — **PARTIALLY TESTED**: sp128-juv-grown.webp heeft geen record in de bronaudit van 09-11 (toegevoegd in f03b636; bron en licentie alleen in commitbericht en registry). |
| 12 | Kwaliteit + laadbaarheid | 5/5 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vrouwtje stilstaand ontbreekt (alleen vrouwtje in vlucht). |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Labelcorrectie sp128-flight → mannetje na akkoord; daarna toont 'In vlucht' Mannetje vóór Vrouwtje. Fase 2: vrouwtje stilstaand. |

### sp129 Krakeend — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten PARTIALLY TESTED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp129 |
| 2 | Naam | Krakeend · *Mareca strepera* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp129-hero-male.webp` (GUIDE_HEROES) — Geschikt: bevestigd mannetje, scherp. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv ja |
| 6 | Vluchtfoto's | sp129-flight.webp (male) |
| 7 | Vergelijkingen | 2 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Juveniel-foto is in de hand (ringonderzoek), close-up kop; soort/leeftijd niet zelfstandig te bevestigen, steunt op USFWS-bron. |
| 11 | Maker/bron/licentie | sp129.webp: Luiz Lapa from Oeiras, Portugal · CC BY 2.0; sp129-adult_f.webp: Andrey Gulivanov · CC BY 2.0; sp129-juv.webp: Rebecca Fabbri / USFWS · Public domain; sp129-flight.webp: Luiz Lapa · CC BY 2.0; sp129-hero-male.webp: Rhododendrites · CC BY-SA 4.0 — **PARTIALLY TESTED**: Hoofdfoto sp129-hero-male.webp is na de bronaudit geïmporteerd (tools/species/verified_heroes_2026-11-09.json: Commons-bestand, maker, licentie en SHA-1 van het origineel); geen same-shot-vergelijking. |
| 12 | Kwaliteit + laadbaarheid | 5/5 beelden laden. Juveniel: geen normaal veldbeeld. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vrouwtje in vlucht ontbreekt. Vervanging: juveniel (foto in de hand, geen veldbeeld) |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Fase 2: juveniel vervangen door veldfoto. |

### sp092 Kuifeend — PARTIALLY TESTED (technisch VERIFIED · visueel VERIFIED · bron/rechten PARTIALLY TESTED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp092 |
| 2 | Naam | Kuifeend · *Aythya fuligula* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp092-hero-male.webp` (GUIDE_HEROES) — Geschikt: bevestigd mannetje, kuif, geel oog. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv ja |
| 6 | Vluchtfoto's | sp092-flight.webp (male) |
| 7 | Vergelijkingen | 2 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Mannetje, vrouwtje, juveniel en mannetje-in-vlucht visueel consistent. |
| 11 | Maker/bron/licentie | sp092.webp: Dr. Raju Kasambe · CC BY-SA 4.0; sp092-adult_f.webp: Hans Hillewaert · CC BY-SA 3.0; sp092-flight.webp: Imran Shah / Birds of Gilgit-Baltistan · CC BY-SA 2.0; sp092-juv-review.webp: Tsyganov Sergey · CC BY-SA 4.0; sp092-hero-male.webp: Alexis Lours · CC BY 4.0 — **PARTIALLY TESTED**: Hoofdfoto sp092-hero-male.webp: idem, na de bronaudit geïmporteerd; geen same-shot-vergelijking. |
| 12 | Kwaliteit + laadbaarheid | 5/5 beelden laden. Goed; vluchtfoto heeft fotografennaam als watermerk in beeld. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vrouwtje in vlucht ontbreekt. |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Geen correctie. Watermerk: geen licentieprobleem vastgesteld, wel cosmetisch. |

### sp090 Slobeend — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp090 |
| 2 | Naam | Slobeend · *Spatula clypeata* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp090.webp` (GUIDE_PHOTOS) — Geschikt: bevestigd mannetje, scherp. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv nee |
| 6 | Vluchtfoto's | sp090-flight.webp (male) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vrouwtje en mannetje-in-vlucht consistent. |
| 11 | Maker/bron/licentie | sp090.webp: Alexis Lours · CC BY 4.0; sp090-adult_f.webp: Andreas Trepte, www.avi-fauna.info · CC BY-SA 2.5; sp090-flight.webp: Frank Schulenburg · CC BY-SA 4.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 3/3 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel en vrouwtje in vlucht ontbreken. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772. Op de4ef30 (#122 zonder #124) bleef de Mannetje-kaart leeg; gecorrigeerd in #124.) — Volgorde gecorrigeerd in PR #124: Mannetje-kaart verwees niet naar hoofdfoto. |

### sp130 Smient — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp130 |
| 2 | Naam | Smient · *Mareca penelope* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp130.webp` (GUIDE_PHOTOS) — Geschikt: bevestigd mannetje, volledig. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv nee |
| 6 | Vluchtfoto's | sp130-flight.webp (male) |
| 7 | Vergelijkingen | 1 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vrouwtje en mannetje-in-vlucht consistent. |
| 11 | Maker/bron/licentie | sp130.webp: Andreas Trepte · CC BY-SA 2.5; sp130-adult-f.webp: Daniel106 · CC BY 4.0; sp130-flight.webp: Imran Shah · CC BY-SA 2.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 3/3 beelden laden. Vluchtfoto: vogel klein in kader, watermerk in beeld. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel en vrouwtje in vlucht ontbreken. Vervanging: vluchtfoto (vogel klein, watermerk) |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772. Op de4ef30 (#122 zonder #124) bleef de Mannetje-kaart leeg; gecorrigeerd in #124.) — Volgorde gecorrigeerd in PR #124. Fase 2: grotere vluchtfoto overwegen. |

### sp132 Tafeleend — VERIFIED (technisch VERIFIED · visueel VERIFIED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp132 |
| 2 | Naam | Tafeleend · *Aythya ferina* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp132.webp` (GUIDE_PHOTOS) — Geschikt: bevestigd mannetje. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv nee |
| 6 | Vluchtfoto's | sp132-flight.webp (male) |
| 7 | Vergelijkingen | 2 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vrouwtje en mannetje-in-vlucht consistent. |
| 11 | Maker/bron/licentie | sp132.webp: Alexis Lours · CC BY 4.0; sp132-adult_f.webp: Klamul · CC BY-SA 4.0; sp132-flight.webp: Charles J. Sharp · CC BY-SA 4.0 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 3/3 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Juveniel en vrouwtje in vlucht ontbreken. |
| 15 | Teststatus + vervolgactie | **VERIFIED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772. Op de4ef30 (#122 zonder #124) bleef de Mannetje-kaart leeg; gecorrigeerd in #124.) — Volgorde gecorrigeerd in PR #124. |

### sp089 Wilde Eend — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten VERIFIED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp089 |
| 2 | Naam | Wilde Eend · *Anas platyrhynchos* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp089.webp` (GUIDE_PHOTOS) — AFWIJKING van baseline-voorkeur: hoofdfoto is een paar (mannetje + vrouwtje), geen solo bevestigd mannetje. Er is geen stilstaande mannetjesfoto om naar te wisselen. |
| 5 | Mannetje / vrouwtje / juveniel | M nee · V ja · Juv ja |
| 6 | Vluchtfoto's | sp089-flight.webp (male) |
| 7 | Vergelijkingen | 2 entries |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Vrouwtje, eclipskleed en mannetje-in-vlucht consistent. 'Juvenielen' (2 vogels) plausibel, leeftijd steunt op bron. |
| 11 | Maker/bron/licentie | sp089.webp: This picture was realized by Richard Bartz by using a Canon EF 70-300mm f/4-5.6  · CC BY-SA 2.5; sp089-adult_f.webp: Roshan Kumar Ban · CC BY-SA 4.0; sp089-eclipse.webp: Mihael Grmek · CC BY-SA 3.0; sp089-flight.webp: VJAnderson · CC BY-SA 4.0; sp089-juv-review.webp: Marie-Lan Nguyen / Wikimedia Commons · CC BY 2.5 — **VERIFIED**: Alle beelden in de bronaudit van 09-11: zelfde opname, maker en licentie overeenkomend. |
| 12 | Kwaliteit + laadbaarheid | 5/5 beelden laden. Goed. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Mannetje stilstaand (solo) ontbreekt; vrouwtje in vlucht ontbreekt. |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Fase 2: solo adult mannetje als hoofdfoto zoeken; paarfoto dan naar 'Overige'. |

### sp091 Wintertaling — PARTIALLY TESTED (technisch VERIFIED · visueel PARTIALLY TESTED · bron/rechten PARTIALLY TESTED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp091 |
| 2 | Naam | Wintertaling · *Anas crecca* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp091-hero-male.webp` (GUIDE_HEROES) — Geschikt: bevestigd mannetje, scherp. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv ja |
| 6 | Vluchtfoto's | sp091-flight.webp (male) |
| 7 | Vergelijkingen | 4 entries, waarvan 1 juv-juv verborgen |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Overige herkenningsfoto's → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Juveniel-foto visueel ambigu (bruine kop met roodbruine zweem, groene spiegel), maar de bron (iNaturalist, research grade) annoteert Life Stage: Juvenile en Sex: Male; label daarmee onderbouwd. Eigen visuele bevestiging niet mogelijk. |
| 11 | Maker/bron/licentie | sp091.webp: gailhampshire from Cradley, Malvern, U.K · CC BY 2.0; sp091-adult_m.webp: Koshy Koshy from Faridabad, Haryana, India · CC BY 2.0; sp091-adult_f.webp: Frank Vassen from Brussels, Belgium · CC BY 2.0; sp091-juv.webp: Se Lena · CC BY 4.0; sp091-eclipse.webp: Roy Lowry · CC BY 4.0; sp091-flight.webp: Ferran Pestaña · CC BY-SA 2.0; sp091-hero-male.webp: Charles J. Sharp · CC BY-SA 4.0 — **PARTIALLY TESTED**: Hoofdfoto sp091-hero-male.webp: idem; geen same-shot-vergelijking. Licentie "CC BY" (iNaturalist) = CC BY 4.0 volgens bronaudit. |
| 12 | Kwaliteit + laadbaarheid | 7/7 beelden laden. Juveniel 500x335, aan de kleine kant. Korte zijde < 500 px: sp091-juv.webp 500×335. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Vrouwtje in vlucht ontbreekt. Vervanging: juveniel (ambigu, 500×335) |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Fase 2: duidelijkere juveniel overwegen. |

### sp188 Zomertaling — PARTIALLY TESTED (technisch VERIFIED · visueel VERIFIED · bron/rechten PARTIALLY TESTED)

| # | Veld | Bevinding |
|---|---|---|
| 1 | Soort-ID | sp188 |
| 2 | Naam | Zomertaling · *Spatula querquedula* |
| 3 | Soortgroep | Eenden · geslachten verschillen |
| 4 | Hoofdfoto + geschiktheid | `sp188-hero-male.webp` (GUIDE_HEROES) — Geschikt: bevestigd mannetje, witte wenkbrauwstreep. |
| 5 | Mannetje / vrouwtje / juveniel | M ja · V ja · Juv ja |
| 6 | Vluchtfoto's | sp188-eclipse.webp (geslacht niet vastgesteld) |
| 7 | Vergelijkingen | 4 entries, waarvan 1 juv-juv verborgen |
| 8 | Volgorde (§6.B) | conform: Hoofdfoto → Verenkleed → In vlucht → Lijkt op |
| 9 | Duplicaten | geen (exact en dHash) |
| 10 | Geslacht-/leeftijdslabels | Eclipskleed-in-vlucht consistent (bruine kop, blauwgrijze voorvleugel). |
| 11 | Maker/bron/licentie | sp188.webp: Charles J. Sharp · CC BY-SA 4.0; sp188-adult_f.webp: michael clarke stuff · CC BY-SA 2.0; sp188-juv.webp: Stefan Berndtsson · CC BY 2.0; sp188-eclipse.webp: Frankie Chu from Hong Kong香港 · CC BY-SA 2.0; sp188-hero-male.webp: YedidyaPopper · CC BY 4.0 — **PARTIALLY TESTED**: Hoofdfoto sp188-hero-male.webp: idem; geen same-shot-vergelijking. |
| 12 | Kwaliteit + laadbaarheid | 5/5 beelden laden. Vrouwtje-foto zacht en klein in kader. |
| 13 | Offline | alle beelden in precachebron (code-niveau) |
| 14 | Ontbrekend / vervanging | Mannetje (broedkleed) in vlucht ontbreekt. Vervanging: vrouwtje (zacht, klein in kader) |
| 15 | Teststatus + vervolgactie | **PARTIALLY TESTED** (technisch VERIFIED: Laden, volgorde, offline-precachebron en credits gecontroleerd op 53eb772.) — Fase 2: scherpere vrouwtje-foto. |

## Bevindingen buiten de huidige batch

- **sp173** (Haviken (batch 2), NOT TESTED): Browser-screenshot (390 px): onder Verenkleed > Vrouwtje staat een foto van een vogel met gespreide vleugels tegen blauwe lucht, die er als vluchtfoto uitziet maar niet als flight gemarkeerd is. Hoort mogelijk in 'In vlucht'.

## Alle soorten met foto — status

| Soortgroep | ID | Soort | Status | Technisch | Visueel | Bron/rechten | Batch |
|---|---|---|---|---|---|---|---|
| Aalscholvers | sp104 | Aalscholver | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Boomklevers | sp065 | Boomklever | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Boomkruipers | sp066 | Boomkruiper | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | VERIFIED | 01 |
| Boomkruipers | sp067 | Taigaboomkruiper | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | VERIFIED | 01 |
| Boszangers | sp057 | Fitis | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Boszangers | sp058 | Fluiter | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Boszangers | sp056 | Tjiftjaf | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Duiven | sp003 | Holenduif | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Duiven | sp002 | Houtduif | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Duiven | sp004 | Turkse Tortel | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Eenden | sp128 | Bergeend | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | PARTIALLY TESTED | 01 |
| Eenden | sp129 | Krakeend | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | PARTIALLY TESTED | 01 |
| Eenden | sp092 | Kuifeend | PARTIALLY TESTED | VERIFIED | VERIFIED | PARTIALLY TESTED | 01 |
| Eenden | sp090 | Slobeend | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Eenden | sp130 | Smient | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Eenden | sp132 | Tafeleend | VERIFIED | VERIFIED | VERIFIED | VERIFIED | 01 |
| Eenden | sp089 | Wilde Eend | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | VERIFIED | 01 |
| Eenden | sp091 | Wintertaling | PARTIALLY TESTED | VERIFIED | PARTIALLY TESTED | PARTIALLY TESTED | 01 |
| Eenden | sp188 | Zomertaling | PARTIALLY TESTED | VERIFIED | VERIFIED | PARTIALLY TESTED | 01 |
| Fazanten | sp105 | Fazant | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Fazanten | sp106 | Patrijs | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Futen | sp077 | Fuut | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Ganzen | sp086 | Grauwe Gans | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Gierzwaluwen | sp141 | Gierzwaluw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Gorzen | sp117 | Geelgors | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Gorzen | sp118 | Rietgors | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Goudhaantjes | sp063 | Goudhaantje | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Goudhaantjes | sp064 | Vuurgoudhaan | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp249 | Blauwe Kiekendief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp173 | Bruine Kiekendief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp005 | Buizerd | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp251 | Grauwe Kiekendief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp007 | Havik | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp253 | Ruigpootbuizerd | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp006 | Sperwer | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp250 | Steppekiekendief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Haviken | sp248 | Wespendief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Heggenmus | sp054 | Heggenmus | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| IJsvogels | sp075 | IJsvogel | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Klauwieren | sp262 | Grauwe Klauwier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kluten | sp143 | Kluut | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kraaien | sp021 | Ekster | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kraaien | sp026 | Gaai | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kraaien | sp025 | Kauw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kraaien | sp022 | Zwarte Kraai | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kwikstaarten | sp069 | Gele Kwikstaart | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kwikstaarten | sp288 | Grote Gele Kwikstaart | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Kwikstaarten | sp068 | Witte Kwikstaart | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Leeuweriken | sp070 | Veldleeuwerik | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Lijsters | sp049 | Grote Lijster | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Lijsters | sp048 | Koperwiek | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Lijsters | sp047 | Kramsvogel | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Lijsters | sp045 | Merel | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Lijsters | sp046 | Zanglijster | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp164 | Grote Mantelmeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp095 | Kleine Mantelmeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp097 | Kokmeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp096 | Stormmeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp094 | Zilvermeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Meeuwen | sp225 | Zwartkopmeeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp032 | Glanskop | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp029 | Koolmees | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp033 | Kuifmees | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp031 | Matkop | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp030 | Pimpelmees | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mezen | sp174 | Zwarte Mees | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mussen | sp043 | Huismus | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Mussen | sp044 | Ringmus | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Ooievaars | sp170 | Ooievaar | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Piepers | sp072 | Graspieper | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp146 | Bontbekplevier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp145 | Goudplevier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp099 | Kievit | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp147 | Kleine Plevier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp206 | Strandplevier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Plevieren | sp144 | Zilverplevier | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Rallen | sp078 | Meerkoet | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Rallen | sp079 | Waterhoen | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp081 | Blauwe Reiger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp083 | Grote Zilverreiger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp082 | Kleine Zilverreiger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp245 | Koereiger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp085 | Kwak | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Reigers | sp084 | Purperreiger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Rietvogels | sp108 | Grote Karekiet | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Rietvogels | sp110 | Rietzanger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Scholeksters | sp098 | Scholekster | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp159 | Bosruiter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp152 | Drieteenstrandloper | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp158 | Groenpootruiter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp101 | Grutto | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp155 | Oeverloper | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp217 | Poelruiter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp150 | Steenloper | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp102 | Tureluur | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp156 | Witgat | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp100 | Wulp | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Snippen | sp157 | Zwarte Ruiter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spechten | sp019 | Groene Specht | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spechten | sp016 | Grote Bonte Specht | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spechten | sp017 | Kleine Bonte Specht | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spechten | sp020 | Middelste Bonte Specht | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spechten | sp018 | Zwarte Specht | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spreeuwen | sp282 | Roze Spreeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Spreeuwen | sp112 | Spreeuw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Staartmezen | sp034 | Staartmees | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Sterns | sp167 | Grote Stern | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Sterns | sp166 | Noordse Stern | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Sterns | sp165 | Visdief | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Valken | sp009 | Slechtvalk | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Valken | sp008 | Torenvalk | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp041 | Appelvink | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp040 | Goudvink | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp036 | Groenling | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp039 | Kneu | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp037 | Putter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp042 | Roodmus | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp038 | Sijs | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vinken | sp035 | Vink | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp177 | Bonte Vliegenvanger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp178 | Gekraagde Roodstaart | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp176 | Grauwe Vliegenvanger | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp050 | Roodborst | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp053 | Roodborsttapuit | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Vliegenvangers | sp051 | Zwarte Roodstaart | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Wielewalen | sp113 | Wielewaal | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Winterkoningen | sp055 | Winterkoning | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zangers | sp061 | Grasmus | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zangers | sp060 | Tuinfluiter | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zangers | sp059 | Zwartkop | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zwaluwen | sp114 | Boerenzwaluw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zwaluwen | sp115 | Huiszwaluw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zwaluwen | sp116 | Oeverzwaluw | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |
| Zwanen | sp126 | Knobbelzwaan | NOT TESTED | NOT TESTED | NOT TESTED | NOT TESTED | — |

## Reproduceren

```bash
# 1. checkout van de te meten commit (bijv. als worktree)
git worktree add ../audit <sha>
# 2. meten
node tools/fotobaseline/audit.mjs ../audit /tmp/audit.json
python3 -I tools/fotobaseline/imagecheck.py ../audit /tmp/audit.json /tmp/images.json --sheets /tmp/sheets --ids sp104,sp065
# 3. tracker opnieuw opbouwen
python3 -I tools/fotobaseline/build_tracker.py /tmp/audit.json /tmp/images.json docs/fotobaseline/reviews docs/fotobaseline/FOTOBASELINE_TRACKER.md <render-sha> <media-sha>
```

Sortering in deze tabel gebruikt `str.casefold` als benadering van `localeCompare('nl')`; de batchvolgorde zelf is bepaald met `localeCompare('nl')` in Node.
