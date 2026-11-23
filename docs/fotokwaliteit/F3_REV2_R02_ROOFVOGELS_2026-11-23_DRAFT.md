# F3-REV2-R02 — tweede verificatieronde · Buizerd, Sperwer, Havik

| | |
|---|---|
| Ronde | **F3-REV2-R02** |
| Datum | 23-11-2026 |
| Norm | Birdspot Kwaliteitsnorm v1.10 FINAL |
| Basis | PR #351 @ `3dd7badf79b66950af35d8abf6a699c5a05d29c4` · werk-PR #352 |
| Eigenaarbesluit | 23-11-2026 16:56: R01b-QA geaccepteerd; C (beperkt) voor ANWB/audio sp002–sp004; bronlezing toegestaan; quickPrimary per batch; start R02 |
| Beoordelaar | Claude (Opus 5.5) — eigen beoordeling, geen onafhankelijke review |
| Status | **EIGENAARBESLUIT B + BEPERKT C UITGEVOERD (F3-REV2-R02b) · ONAFHANKELIJKE QA OPEN** — geen R03 zonder eigenaarbesluit |

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

## F3-REV2-R02b — uitvoering eigenaarbesluit B (23-11-2026 18:56)

Besluit: B voor sp005, sp006, sp007; beperkt C alleen voor ANWB en audio (werkvolgorde; ANWB `NOT TESTED`, audio `PARTIALLY TESTED`/`OPEN`, geen FULL PASS). **Harde eigenaarregel:** vergelijkingen zo uitgebreid mogelijk in tekst en verdedigbare foto; `quickPrimary` is alleen de compacte bovenkant en vervangt de vergelijking nooit.

| Soort | Aangepast | Vergelijking in tekst | Vergelijking in foto |
|---|---|---|---|
| Buizerd | G4: bronnamen uit "Let op" (verschil staarthoeken blijft intern in `discrepancies`); G6: LK-095, LK-096 | Gelabelde rijen: Wespendief-man (kop/staart/vleugelhouding), Wespendief-vrouw (kop/staart/ondervleugel), Ruigpootbuizerd (staartbasis/polsvlek en buik/valkuil); 7 kritische kaarten behouden | G3: alle drie volwassen vluchtparen nu met bestaande Buizerd **van onderen** (`sp005-female-flight`), titel "Volwassen in vlucht" behouden; bovenaanzicht blijft alleen eigen vluchtfoto |
| Sperwer | G8: mannetje "bruinoranje **dwarsgebandeerde** onderzijde"; G6: LK-097, LK-098 | Rijen voor mannetjes (kop/onderzijde/bouw), juvenielen (borst/staartpunt/kop), vlucht met Havik en Torenvalk (kop en vleugels/staart/vliegstijl), juveniel Torenvalk (borst/vleugels/jachtwijze); kritische kaarten 6 → 8 (vrouwtjes-bouw, jachtwijze vs. Torenvalk) | G9: vluchtpaar met Havik nu Sperwer-mannetje tegen bewezen Havik-mannetje |
| Havik | G9: algemene vluchtfoto niet meer als vergelijkingsfoto; bijschrift zonder onbewezen leeftijdsclaim; G4: waarnemingsnummer naar intern veld `sexEvidence`; similar-teksten zonder "de bron"; G6: LK-097, LK-099 | Kritische kaarten 3 → 9 (gespiegelde Sperwer-kaarten: staartpunt, vleugels en heupen, vliegstijl, roep, vrouwtjes-bouw; jonge Slechtvalk); rijen voor Slechtvalk (kop/vleugels en staart/valkuil) | Vluchtparen met Sperwer en Torenvalk nu met bewezen Havik-mannetje |

Alle nieuwe tekst komt uit claims die al met bronsleutel in de kennisprofielen of bestaande vergelijkingen stonden; geen nieuwe feiten.

**Code:** `comparisonPhoto()` vindt een expliciet gekozen foto zonder geslachtsrol ook naast een kleedsleutel (achteraan in de kandidatenlijst; rolfilter ongewijzigd). Render van 597 soorten t.o.v. `bf1eb09`: alleen sp005, sp006, sp007 en de partnerkaarten sp008, sp009, sp248, sp253 (dezelfde paren in omgekeerde richting) veranderen; de 18 bestaande foto+kleedcombinaties blijven gelijk.

**Tests:** nieuw `test_f3_rev2_r02_compare.mjs` (quickPrimary laat alle kenmerken en kritische kaarten staan; 16 paarrichtingen met rijen; afgewezen foto's niet terug; Sperwer↔Havik wederkerig; geen bronnamen) — mutatietest 4/4 afgevangen. Aangepast aan besluit B: `test_species_detail.py` (Buizerd- en Havik-vergelijkingsfoto's), `test_fotovolgorde_2026-11-10.mjs` (Buizerd van onderen). Node 52/53 (`test_photo_feedback`: `sharp` lokaal afwezig, ook op basis), browser 6/6 PASS lokaal.

**Blijft open:** ANWB (3), Vogelbescherming (3), audio niet menselijk beluisterd (3; Buizerd-alarm 0,84 s; xeno-canto-rechten), iNaturalist-licenties (Buizerd 4, Havik 2), Havik algemene vluchtfoto nog op de kaart (herkomst/leeftijd; eigenaarkeuze behouden of uit de rol), rustpaar vrouwtjes Sperwer–Havik ontbreekt, Buizerd vluchtfoto van onderen klein in beeld, wensen (rustfoto watermerk, juveniel in rust, vrouwtje in vlucht/rust), onafhankelijke biologische/fotoreview.

**EINDMARKERING — F3-REV2-R02/R02b · ROOFVOGELS · BESLUIT B + BEPERKT C UITGEVOERD · ONAFHANKELIJKE QA OPEN · GEEN MERGE · GEEN LIVE**
