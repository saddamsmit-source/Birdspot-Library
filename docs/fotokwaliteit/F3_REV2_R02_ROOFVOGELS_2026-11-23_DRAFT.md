# F3-REV2-R02 — tweede verificatieronde · Buizerd, Sperwer, Havik

| | |
|---|---|
| Ronde | **F3-REV2-R02** |
| Datum | 23-11-2026 |
| Norm | Birdspot Kwaliteitsnorm v1.10 FINAL |
| Basis | PR #351 @ `3dd7badf79b66950af35d8abf6a699c5a05d29c4` · werk-PR #352 |
| Eigenaarbesluit | 23-11-2026 16:56: R01b-QA geaccepteerd; C (beperkt) voor ANWB/audio sp002–sp004; bronlezing toegestaan; quickPrimary per batch; start R02 |
| Beoordelaar | Claude (Opus 5.5) — eigen beoordeling, geen onafhankelijke review |
| Status | **SECOND REVIEW RECORDED · EIGENAARSPOORT OPEN** — geen R03 zonder eigenaarbesluit |

Registratie: `F3_140_HERCONTROLE_V0.1_DRAFT.json` → `records[sp005–sp007].F3.secondReview` en `secondReview.batches[1]`. Eerste ronde ongewijzigd (digest `98b75cae…`).

## R01b administratief afgerond

`sp002–sp004.secondReview.ownerDecision`: besluit B (15:28) behouden + `additional` C (16:56) uitsluitend voor ANWB-passage en lokaal gidsaudio (alleen werkvolgorde; ANWB `NOT TESTED`, audio `OPEN`, geen FULL PASS). `qaReviews`: technische QA ChatGPT op `3dd7bad` door eigenaar geaccepteerd (geen PR-comment aangetroffen); biologische/foto-/rechten-/toestelbewijs behoudt eigen status. Aandachtspunten (Holenduif-vlucht, TT-uitsnede, TT-juveniel-auteur, iNaturalist-licenties, Vogelbescherming) staan in `remainingOpen`.

## Uitgevoerd in R02

| Controle | Uitkomst |
|---|---|
| 17 foto's op volle resolutie bekeken | zie reviewkaarten |
| origcheck (media-intake, GitHub-runner) | 17/17 originelen: 15 zelfde opname automatisch, 2 uitsnede visueel bevestigd; 11 Commons-foto's auteur+licentie gelijk + SHA-1 + herkomstcontext; 6 iNaturalist-foto's: licentie-API gaf 404 → registerwaarde |
| 8 geluidsclips | 7 Commons: auteur+licentie gelijk; 1 xeno-canto: NOT TESTED; niemand heeft soort/type beluisterd |
| Vogelbescherming | WebFetch-toestemming gevraagd (~17:05), hostprompt onbeantwoord → NOT TESTED |
| ANWB | NOT TESTED (geen exemplaar) |
| quickPrimary | sp005 [bouw, V-houding], sp006 [staartpunt, vleugels/kop], sp007 [kop/borst, staartpunt]; render 597 soorten: alleen sp005–sp007 anders |
| origcheck-tool | additief: Commons-herkomstcontext + iNaturalist-licentie-API (geen claim bij fout); unittest zonder netwerk |

## Materiële tekortkomingen (eigenaarspoort)

| ID | Soort | Tekortkoming | Kleinste veilige verbetering |
|---|---|---|---|
| G3 | Buizerd | Volwassen vluchtparen met Wespendief (2×) en Ruigpootbuizerd: Buizerd van boven, partner van onderen; tekst gaat over onderzijde | Bestaande "Volwassen in vlucht, van onderen" (Simone Bocca) als Buizerd-foto in die drie paren |
| G4 | Buizerd, Havik | Bronnamen in publieke tekst ("Vogelbescherming: afgerond; BirdGuides: hoekig"; "iNaturalist-waarneming 19176694") — §2.2 | Herformuleren zonder bronnaam; brondetail blijft intern |
| G8 | Sperwer | Detailtekst mannetje: "bruinoranje **gestreepte** onderzijde" spreekt doorslaggevend kenmerk (altijd dwarsgebandeerd) tegen | "dwarsgebandeerde"; brontekst VB herlezen zodra mogelijk |
| G9 | Havik (+Sperwer, Torenvalk-paar) | Algemene vluchtfoto (Ken Billington 2010): herkomst onbekend (Euraziatische vs. Amerikaanse Havik), leeftijd onduidelijk, tegenlicht, 800×450; gebruikt in vluchtparen | In vluchtparen vervangen door bestaande "Mannetje in vlucht"; algemene foto verder onderzoeken of uit de rol halen |
| G6 | alle drie | Geen LK-registraties (Buizerd–Wespendief, Buizerd–Ruigpootbuizerd, Sperwer–Havik, Sperwer–Torenvalk, Havik–Slechtvalk) | LK-095… toevoegen (data, geen UI) |
| G5 | alle drie | Audio aanwezig maar soort/type niet menselijk beluisterd; Buizerd-alarmclip 0,84 s; xeno-canto-rechten niet hercontroleerd | Beluisteren door eigenaar/deskundige of korte clip vervangen |
| G1/G2 | alle drie | ANWB en Vogelbescherming NOT TESTED | ANWB-exemplaar; WebFetch-prompt beantwoorden |
| G7 | Buizerd, Havik | iNaturalist-licenties niet herbevestigd (API 404); herkomst Havik-vrouwtje (mogelijk Japanse ondersoort) | Andere iNaturalist-route (waarneming-API) |

Niet-materieel/wens: Buizerd-rustfoto lichte vorm met watermerk en kabel; Buizerd juveniel in rust; Sperwer vrouwtje in vrije vlucht; Havik vrouwtje in rust.

## Tests

`test_f3_rev2_r01.mjs` (6 records, digest, quickPrimary alleen in gecontroleerde batch — mutatie afgevangen), `test_f3_rev2_r01_browser.py` (6 soorten, 320/360/390 + offline), `test_orig_check.py` (+ inat_rights), node-suite 51/52 (`test_photo_feedback` faalt ook op basis: `sharp` ontbreekt lokaal), browserregressies species_detail (1 lokale niet-verklaarde fout, daarna 2/2 PASS), kennisbaseline_browser, mobile_owner_review, plumage_compare_layout PASS.

**EINDMARKERING — F3-REV2-R02 · ROOFVOGELS · EIGENAARSPOORT OPEN · GEEN MERGE · GEEN LIVE**
