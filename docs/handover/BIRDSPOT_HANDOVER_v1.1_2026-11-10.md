# Birdspot Library — Handover v1.1 FINAL (gespreksscan, PR-register en fotobaseline)

**Status:** FINAL overdrachtsdocument, 10-11-2026 ~15:00 CET. Opvolger van *Birdspot_Handover_Fotobaseline_v1.0_FINAL* (10-11-2026, blijft als herstelpunt in het project en in PR #123). Zelfstandig leesbaar: een nieuw gesprek heeft alleen dit document en de GitHub-repository nodig.
**Opgesteld door:** Claude (Opus 5.5) op verzoek van Kevin Smit (Project Owner). **Onafhankelijkheidsgrens:** eigen document-QA, geen onafhankelijke ChatGPT-review, geen app-PASS, geen productieakkoord.
**Toegang tot geschiedenis:** dit gesprek (drie rondes vandaag), de projectbronnen en de live GitHub-repository. Oudere gesprekken (ChatGPT en eerdere Claude-sessies) zijn alleen via hun sporen in commits, PR's en documenten gebruikt; niets is daaruit aangevuld op aanname.

---

## 1. Projectstatus in één oogopslag

| Laag | Stand (gemeten 10-11-2026) | Betekenis |
|---|---|---|
| `main` | `5bf67043e830e977749f0ee593cf9f41f0e2822b` — release 1.14.0 (#33, 05-11) | **Laatst vrijgegeven versie.** Geen enkele open PR zit in main. |
| Productie | Volgens Roadmap v1.3: publieke service worker levert `1.14.0-map-k5-links` op `birdspot-library.vercel.app`. Niet opnieuw geopend in deze sessie. | Historische Vercel-productie; tijdens ontwikkeling niet aanraken (eigenaarbesluit). |
| `preview/birdspot-review` | `659cbb8bc3c4c54a7d6ae7a5fe499319de309d88` (= PR #118 head) | Gezamenlijke reviewbranch; bron van GitHub Pages sinds 10-11 07:24. Bevat alle gestapelde gids-, foto-, UI-, K6/K7- en herstelrondes tot en met #119. |
| GitHub Pages | Deployment `7677720621` op `659cbb8`, status success, `https://saddamsmit-source.github.io/Birdspot-Library/` | Toont nog de **oude** Soorten-indeling (geen A-Z per groep, geen vaste fotovolgorde). |
| Open front | #121 → #122 → #124 (A-Z + fotovolgorde + FV-08), #125 (docs/tracker/register/handover) | Niet in preview, niet in main. |
| Open PR's | **92** (89 + #123, #124, #125) | Zie §5 en `docs/github/PR_REGISTER_2026-11-10.md`. |

**Ontwerpbaseline (eigenaarbesluit 10-11-2026, akkoord herhaald in de afsluitopdracht):** soortgroepen A-Z, vogels binnen de groep A-Z op Nederlandse naam, en per kaart: hoofdfoto → mannetje → vrouwtje → juveniel → in vlucht → vergelijkingen (§8).

## 2. Besluit, implementatie, test en vrijgave — strikt gescheiden

| Onderwerp | Eigenaarbesluit | Geïmplementeerd (waar) | Getest | In preview/Pages | Vrijgegeven (main) |
|---|---|---|---|---|---|
| Soortgroepen A-Z (Soorten-pagina, soortkiezer) | Ja, 10-11 | #120 (base main) en #121 (base preview) | SG-01..SG-05 lokaal; CI 8/8 en 10/10 | Nee | Nee |
| Vogels A-Z binnen groep + vaste fotovolgorde | Ja, 10-11 | #122 (op #121) | SG-06/07, FV-01..07 (Node, 597 soorten), FVB-01..06 (browser, 5 soorten); CI 10/10 | Nee | Nee |
| Lege kleedkaart verwijst naar hoofdfoto (FV-08) | Valt onder baseline §6.B | #124 (op #122), vandaag | FV-08 + negatieve controle (12 soorten faalden zonder fix); FVB opnieuw groen; CI 9/9 | Nee | Nee |
| A-Z in Profiel → Mijn lijsten → Alle soorten (K7) | Ja (K7) | `ee8025b` | In #118-keten | **Ja** | Nee |
| Weeskode persoonlijke-foto-diashow opruimen (Optie A) | Ja, 10-11 | #119 | IDB/SHOWCASE 5/5, CI 8/8 | **Ja** (merge `659cbb8`) | Nee |
| K6 kaartinzichten, K7 profiel/CSV | Eerder | #34, #115 | CI per PR (historisch) | **Ja** | Nee |
| 39 vluchtfotorondes, kleedfoto's, bronaudit 367 foto's | Eerder | #35–#116 (gestapeld) | Historisch CI + `GUIDE_SOURCE_AUDIT_2026-11-09` | **Ja** | Nee |
| Back-up/navigatie/update-beveiliging | Eerder | #47/#50 opnieuw geïntegreerd via `cc1730f` | Testuitbreidingen van #47/#50 niet meegekomen | **Ja** (code) | Nee |
| Geen Vercel tijdens ontwikkeling | Ja, 08/09-11 | `b8035da` + `vercel.json git.deploymentEnabled:false` | Vercel-instellingen gecontroleerd op 08-11 (historisch) | Ja | Nee |
| Bronnenregister v1.2 | Blijft DRAFT/REVIEW | Projectdocument | — | n.v.t. | n.v.t. |
| Fotobaseline-audit | Ja: eerst bestaande foto's, dan nieuwe | #125, batch 01 (19 soorten) | Zie §9 | n.v.t. (docs) | Nee |

## 3. Eigenaarbesluiten (geldend)

1. **Ontwerpbaseline** A-Z + fotovolgorde voor alle soorten (10-11).
2. **Volgorde van werk:** eerst alle bestaande foto's per soort controleren en veilig aantoonbare fouten corrigeren; onzekerheden registreren zonder iets te verzinnen; pas daarna nieuwe fotobatches.
3. **Optie A** voor de weeskode-diashow (uitgevoerd, #119).
4. **Bronnenregister** blijft DRAFT/REVIEW tot onafhankelijke Final QA en eigenaarbesluit.
5. **Rolverdeling:** Claude primaire bouwer; ChatGPT onafhankelijke QA/UX/kleine fixes, overname alleen na controle van remote HEAD, PR-base, actieve schrijver en CI. Eén schrijver per branch.
6. **Vaste grenzen:** geen Vercel; geen betaalde diensten zonder akkoord; geen merge naar `main` of `preview/birdspot-review` zonder expliciete toestemming; geen livegang zonder "zet live"; geen PR's massaal sluiten zonder akkoord op het opruimvoorstel; geen verlies van code of historie; geen nieuwe fotobatches vóór de baseline klaar is.
7. **Open eigenaarbesluiten:** (a) akkoord op het opruimvoorstel §6; (b) merge #121→#122→#124 in preview (verandert Pages); (c) gedrag "In vlucht" als de hoofdfoto de enige vluchtfoto is (§10, 7 soorten); (d) repo-instelling `homepage` wijst nog naar Vercel.

## 4. Geldende documentversies

| Document | Versie/status | Actie deze ronde |
|---|---|---|
| APP-System-Index | v3.7 FINAL (statusupdate 10-11, vijfde ronde) | Birdspot-rij en versiekaart gecorrigeerd (Samenwerkingsprotocol v1.3; #40/#41 staan wél open; 92 PR's) |
| Projectinstructies | v2.9 FINAL | Gelezen; ongewijzigd |
| App Builder Projectveld | v2.9 FINAL | Vergeleken met het werkelijke Project Instructions-veld (via `Projects.project_info`): **inhoudelijk gelijk**, alleen typografische aanhalingstekens verschillen |
| App Development Handbook | v2.13 FINAL | Gelezen (§0–§6A, L-001–L-079); ongewijzigd. Twee learningkandidaten in Addendum §8.6 ter gecontroleerde review |
| Capability Catalogus | v1.3 FINAL | Aanvulling 10-11 (b) staat in Addendum §8.4 (CAP-BIRD-001/003/006/012/015/037–040) |
| README-checklist | v0.3 FINAL | Gelezen; ongewijzigd |
| Samenwerkingsprotocol | v1.3 FINAL (v1.2 herstelpunt) | Gelezen; ongewijzigd. §3.5-controle uitgevoerd |
| App-System Addendum 2026-11-10 | FINAL, nu met §8 | §4 gecorrigeerd (instructieveld wél leesbaar), §8 toegevoegd |
| Birdspot Roadmap | v1.3 FINAL (PDF) | Niet redigeerbaar. Achterhaald op twee punten: Vercel als host (§3) en "vluchtfoto vóór man/vrouw/juveniel" (fase 1). Eigenaarbesluiten gaan voor. |
| Birdspot Bronnenregister | v1.2 DRAFT/REVIEW | Ongewijzigd; onafhankelijke Final QA open |
| Handover fotobaseline | **v1.1 FINAL (dit document)**; v1.0 FINAL herstelpunt | Nieuw |
| App-README (repo) | Alleen in PR #117 (09-11), niet in preview/main | Verouderd (hosting, baseline ontbreekt); actualiseren is open actie |
| Repo-audits | `docs/GUIDE_EXISTING_PHOTO_AUDIT.md`, `docs/GUIDE_SOURCE_AUDIT_2026-11-09.md` + `docs/evidence/*.json`, `docs/BIRDSPOT_GITHUB_ONLY_HANDOVER.md` (in preview) | Gedateerd bewijs; de bronaudit wordt hergebruikt als rechtenbasis (§9) |

## 5. GitHub-checkpoints

| Ref | SHA | Opmerking |
|---|---|---|
| `main` | `5bf67043e830e977749f0ee593cf9f41f0e2822b` | 1.14.0 |
| `preview/birdspot-review` / #118 | `659cbb8bc3c4c54a7d6ae7a5fe499319de309d88` | CI 16/16; Pages-bron |
| #119 `fix/retire-orphaned-slideshow` | `698189cb22bedbd7661e0d0f9cee785e3b6a38b3` | In preview |
| #120 `feat/soortgroepen-az-sortering` → main | `2956552be3ee2d51128ad61bdcef551252bdf473` | Dubbel spoor van #121 |
| #121 `integratie/soortgroepen-az-review` → preview | `e670221a997f879b5859bbe7a1d2dfb380276a30` | CI 10/10 |
| #122 `feat/fotovolgorde-en-naam-az` → #121-keten | `de4ef309490f0156b6e51dea1a478acac28eb344` | CI 10/10 |
| #124 `fix/fotovolgorde-heroref` → #122 (draft) | `53eb772cbc413bd49e457e64442a3e1dca9a98c9` | CI 9/9 |
| #123 `docs/handover-fotobaseline-2026-11-10` → main | `6b1939af01790e60a01cf5ad3c1a045a621f3b8b` | Handover v1.0 in repo (andere sessie) |
| #125 `docs/fotobaseline-tracker` → main (draft) | head na deze ronde, zie PR | Tracker, auditscripts, PR-register, deze handover |

**PR-register:** `docs/github/PR_REGISTER_2026-11-10.md` (92 PR's, per PR source/target, head/base, datum, onderwerp, CI, aanwezigheid in preview en main, opvolgers, klasse A–E, onderbouwing en advies). Verdeling: **A 6** (#117, #120, #121, #122, #124, #125) · **B 75** (inhoud aantoonbaar in preview) · **C 8** (#49, #52, #90, #94, #97, #100, #109, #123) · **D 2** (#45, #50) · **E 1** (#118).

**Waarom 92 open:** gestapelde PR's per ronde die via de reviewbranch zijn samengevoegd in plaats van via main; meerdere releasekandidaten naast elkaar; een zijstapel (#91–#108) is opnieuw toegepast in plaats van gemerged (inhoud 88–99% letterlijk aanwezig, maar geen ancestor); 84 PR's staan als draft.

**Pages-impact:** direct bij merge alleen PR's met base `preview/birdspot-review` (#121, #122, en #124 via #122). PR's naar main raken Pages pas als de Pages-bron terug naar main gaat. Docs-only PR's: geen impact zolang Pages op preview staat. De Pages-instelling zelf is niet leesbaar via deze sessie; de bron is afgeleid uit de deployments.

## 6. Opruimvoorstel (niet uitgevoerd, wacht op akkoord)

| Stap | Actie | PR's | Voorwaarde |
|---|---|---|---|
| 1 | Integreren in preview | #121 → #122 → #124 | Akkoord (Pages verandert) |
| 2 | Open houden als releasekandidaat | #118 | Merge pas na "zet live" |
| 3 | Open houden (docs) | #125; #117 na actualisatie | — |
| 4 | Sluiten als vervangen | #90, #94, #97, #100, #109, #52; #123 na akkoord op #125 | Akkoord op dit voorstel |
| 5 | Restcontrole, daarna sluiten | #45 (Home-snelknoppen), #50 (GPS-callback/update-wacht/twee tabs tegen `test_navigation_recovery.py`), #47 (testuitbreiding back-up), #49 | Restpunt afgevinkt |
| 6 | Sluiten als verwerkt | Alle overige klasse B, #119, #120 | Na merge #118 in main |
| 7 | Branches opruimen | Heads van gesloten PR's | Eerst tag `archive/pr-NNN` op elke head-SHA |

## 7. Wat wel en niet in de reviewpreview staat

- **Wel (659cbb8):** gidsfoto's van 134 soorten (597 soorten in de dataset), 39 vluchtfotorondes, kleedfoto's, bronaudit-correcties, fotoviewer/zoom, app-brede zoekbalk, Veldschrift-UI, K6 kaartinzichten, K7 profiel/CSV met A-Z profiellijst, back-up/navigatie/update-herintegratie, splash/subpad-fix, weeskode-diashow verwijderd, Vercel-deployments uitgeschakeld.
- **Niet:** A-Z op Soorten-pagina en soortkiezer, A-Z binnen groep, vaste fotovolgorde, FV-08, fotobaseline-tracker, deze handover, app-README.

## 8. Definitieve ontwerpbaseline

**Sortering:** soortgroepen A-Z; binnen iedere groep de Nederlandse vogelnamen A-Z; ook in de soortkiezer. Implementatie `localeCompare('nl')`; Python-tests met `str.casefold`. Referentie-implementatie `src/features/profile/stats.js` (`groupSpeciesByFamily`).

**Fotovolgorde per kaart:** 1 hoofdfoto · 2 mannetje · 3 vrouwtje · 4 juveniel · 5 in vlucht · 6 vergelijkingen. Hoofdfoto bij voorkeur bevestigd adult mannetje; in vlucht bij voorkeur bevestigd mannetje, en beide geslachten als beide bevestigd zijn. Geen dubbele opname op één kaart (verwijzing naar de hoofdfoto in plaats van herhaling, FV-08). Geen juveniel-tegen-juvenielvergelijkingen (data blijft bewaard). Geen geforceerde geslachtssplitsing. Broed-, winter-, eclips- en jaarlingkleed staan binnen Verenkleed ná juveniel; "Overige herkenningsfoto's" (neutrale stilstaande foto's) staat tussen In vlucht en de vergelijkingen.

**Implementatie:** `recognitionPanel()` in `src/features/species/detailSections.js` (post-processing; `guidePlumageGroups()` en `GUIDE_COMPARISONS` ongewijzigd). De renderer is op 597 soorten getest; dat bewijst de volgorde, niet dat iedere foto inhoudelijk juist is.

## 9. Eerste uitvoeringsopdracht nieuw gesprek: bestaande foto's per vogel controleren

**Stand:** batch 01 (Aalscholvers t/m Eenden, 19 soorten) is **al uitgevoerd** in dit gesprek en staat in `docs/fotobaseline/FOTOBASELINE_TRACKER.md` op #125: 11 VERIFIED, 8 PARTIALLY TESTED (technisch 19/0, visueel 13/6, bron/rechten 14/5). Niet opnieuw doen, tenzij de render-commit of mediadata inmiddels veranderd is (dan alleen opnieuw meten, review hergebruiken).

**Batchplan (soortgroep A-Z, soort A-Z, grenzen op soortgroep):**

| Batch | Soorten | Soortgroepen |
|---|---|---|
| 01 | 19 | Aalscholvers t/m Eenden — **klaar** |
| 02 | 20 | Fazanten t/m IJsvogels (incl. alle 9 Haviken) |
| 03 | 15 | Klauwieren t/m Lijsters |
| 04 | 16 | Meeuwen t/m Piepers |
| 05 | 17 | Plevieren t/m Scholeksters |
| 06 | 19 | Snippen t/m Staartmezen |
| 07 | 20 | Sterns t/m Wielewalen |
| 08 | 8 | Winterkoningen t/m Zwanen |

Totaal 134 soorten met ≥1 gidsfoto op `659cbb8` en `de4ef30` (identieke mediadata); `main` heeft er 0. Bij aanvang opnieuw meten.

**Werkwijze per batch**
1. Meet op de actuele render-commit: `node tools/fotobaseline/audit.mjs <checkout> audit.json` en `python3 -I tools/fotobaseline/imagecheck.py <checkout> audit.json images.json --sheets <map> --ids <ids>`.
2. Bekijk iedere contactsheet zelf; zoom in waar geslacht, leeftijd of soort van één kenmerk afhangt. Vergelijk met `docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json` (annotaties geslacht/levensfase, zelfde opname, licentie) en `tools/species/verified_heroes_2026-11-09.json`.
3. Leg per soort het record vast in `docs/fotobaseline/reviews/batch-NN.json` en bouw de tracker: `python3 -I tools/fotobaseline/build_tracker.py ...`.
4. **Corrigeer veilig aantoonbare fouten** op een eigen branch gestapeld op #124 (bijv. `fix/fotobaseline-batch-NN`), met test of screenshot als bewijs. Wijzig geen bron, licentie of ID; verwijder geen foto.
5. Commit en push per batch; werk #125 bij.

**Bekende correcties klaar voor de volgende ronde (veilig aantoonbaar):**
- **sp128 Bergeend:** `sp128-flight.webp` staat als geslacht onbekend, maar toont de grote rode snavelknobbel van het adulte mannetje. Correctie: `sex: "male"` (label "Mannetje in vlucht"), via de registry-bron (`tools/species/*` → `field-guide-media.json`/`guideMedia.js`, CI controleert `git diff` na `build.py`). Gevolg: In vlucht toont mannetje vóór vrouwtje.
- **sp173 Bruine Kiekendief (batch 02):** onder Verenkleed > Vrouwtje staat een foto die eruitziet als vlucht maar niet als vlucht is gemarkeerd. Eerst visueel bevestigen, dan `flight: true`.

**Auditdatamodel — één record per vogel** (`reviews/batch-NN.json` + gemeten data):

| Veld | Bron |
|---|---|
| `id`, `nameNL`, `nameSci`, `family` | `src/data/species.js` |
| `renderSha`, `mediaSha` | Gemeten commit |
| `hero` (bestand, herkomst, geschiktheid) | audit + visueel |
| `male`, `female`, `adult` (gedeeld kleed), `juv` | gerenderde slots + visueel |
| `flight[]` (bestand, bevestigd geslacht) | registry + visueel + bronannotatie |
| `comparisons` (aantal, verborgen juv-juv) | `GUIDE_COMPARISONS` |
| `order` (§8, afwijkingen) | `audit.mjs` |
| `duplicates` (exact, dHash ≤ 6, registry-hergebruik) | `audit.mjs` + `imagecheck.py` |
| `labels` (onjuist/onzeker, voorgestelde correctie) | visueel + bron |
| `credits` (maker, bron-URL, licentie) | registry + bronaudit |
| `loadable` (decode, afmetingen) | `imagecheck.py` |
| `offline` (in precachebron van `sw.js`) | `audit.mjs` |
| `missing` + `replacement` | visueel |
| `technical`, `visual`, `rights`, `status` (slechtste van drie) | VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED |
| `action` | vervolgactie |

**Acceptatiecriteria hele baseline**
- Alle soorten met ≥1 gidsfoto (actuele telling) hebben een record met de drie statussen en een exacte SHA.
- Iedere conclusie over beeldinhoud steunt op een zelf bekeken foto; bestandsnaam of label alleen is onvoldoende.
- Geen bestaande foto, bron, label of ID verwijderd; correcties herleidbaar per soort.
- Onzeker geslacht of leeftijd blijft open met reden.
- Resultaat per batch gecommit en gepusht vóór het einde van de batch.
- Pas na afronding en eigenaarbeoordeling: nieuwe fotobatches.

**Stopcondities:** twijfel die niet uit foto of bron is op te lossen (veld open laten); fout buiten de fotoscope (bijvoorbeeld verkeerde soort, ontbrekende licentie) — melden en registreren; elke merge naar main/preview of livegang — eerst toestemming.

## 10. Tests, QA-punten en beperkingen

| Punt | Status | Bewijs en vervolg |
|---|---|---|
| A-Z beide niveaus (Soorten, soortkiezer) | VERIFIED op testniveau (branch) | SG-01..07, CI; niet in preview |
| Fotovolgorde dataset | VERIFIED op render-niveau | FV-01..08 over 597 soorten; `audit.mjs`: 0 afwijkingen over 134 soorten op `53eb772` |
| Fotovolgorde browser | PARTIALLY TESTED | FVB-01..06 op 5 soorten, 390 px + desktop |
| `test_fotovolgorde_2026-11-10.*` in CI | NOT TESTED in CI | Staat in geen workflow; toevoegen aan `guide-photos-qa.yml` |
| Hoofdfoto = enige vluchtfoto | PARTIALLY TESTED | **7 soorten gevonden:** sp081 Blauwe Reiger, sp082 Kleine Zilverreiger, sp116 Oeverzwaluw, sp141 Gierzwaluw, sp166 Noordse Stern, sp167 Grote Stern, sp170 Ooievaar. Kaart toont geen "In vlucht"-sectie en "Volwassen: zie hoofdfoto". Gedrag gemeten, gewenst gedrag = eigenaarbesluit (3c). |
| Geslacht-/leeftijdslabels | PARTIALLY TESTED | Batch 01 klaar; sp128 correctie klaar; sp173 te bevestigen |
| Dubbele beelden | VERIFIED (134 soorten) | 0 kaartduplicaten, 0 dHash-paren ≤ 6; 7 soorten met registry-hergebruik van hetzelfde bestand (één keer getoond) |
| Fotorechten | PARTIALLY TESTED | Bronaudit 09-11 dekt 367 foto's; **22 gidsbeelden vallen erbuiten:** 20 hoofdfoto's uit de hero-import (Commons-bron, licentie en SHA-1 van het origineel vastgelegd, geen same-shot-check) en 2 juveniel-foto's (`sp078-juv-grown`, `sp128-juv-grown`, alleen commitbericht/registry) |
| Geluidsrechten | PARTIALLY TESTED | 120 clips voor 59 soorten, alle met maker en licentie in de registry; geen onafhankelijke bronaudit zoals bij foto's |
| Offline/service worker | PARTIALLY TESTED | Code-niveau: alle gidsbeelden in de precachebron (`credits.json`/`field-guide-media.json`). Browser-offline in deze sessie NOT TESTED; historisch PR #111: 374 offline decodeerbare verwijzingen |
| `tests/test_phase_d.py` | NOT RE-TESTED deze ronde | Eerder 18/27 en 22/27 failures op schone basis (zelfde dag) → flakiness, apart te onderzoeken |
| Fout- en herstelroutes waarnemingen/opslag | PARTIALLY TESTED | #78-mediaopslag in preview; testuitbreiding #47 (back-up) en `test_app_recovery.py` (#50) niet in preview (D-punten) |
| Fysiek Android/iOS, geïnstalleerde PWA | NOT TESTED — REAL DEVICE REQUIRED | Ongewijzigd |
| Productie | NOT TESTED | Niet geopend |

**Vals-positieve tests en procesfouten uit deze lijn (learnings):** IDB-2/3 slaagden op 0 slides = 0 dots; SHOWCASE-1/2 toetsten alleen niet-lege `src` (gecorrigeerd met `naturalWidth > 0` en negatieve controle); FV-tests draaien niet in CI; vluchtsplitsing liet afgeleide `heroRef` staan (FV-08); een opnieuw toegepaste PR-stapel lijkt "niet verwerkt" bij alleen ancestry-controle; PR-titel #118 "A-Z soortenlijst" verwijst naar de K7-profiellijst, niet naar de Soorten-pagina; sessie-git-identiteit "Kevin Smit" op agentcommits (gebruik `-c user.name=Claude`).

## 11. Actieve schrijver en overdracht

- **Actieve schrijver bij afsluiting: geen.** Laatste schrijver: Claude op #124 (`fix/fotovolgorde-heroref`) en #125 (`docs/fotobaseline-tracker`).
- Niet verwijderen: alle branches uit het register; in het bijzonder #118–#125.
- Vóór iedere hervatting: remote heads van `main`, `preview/birdspot-review`, #121, #122, #124, #125 opnieuw ophalen; open PR's opnieuw tellen; controleren of iemand (Kevin, ChatGPT, andere sessie) sindsdien schreef.

## 12. Open document- en QA-acties

1. Eigenaarbesluiten §3.7 (a–d).
2. App-README (#117) actualiseren met baseline, GitHub-only/geen Vercel, Pages-preview en README-checklist v0.3 §1–§5; daarna in de reviewbranch opnemen.
3. `test_fotovolgorde_2026-11-10.mjs` toevoegen aan CI.
4. Restcontroles #45/#47/#50 (opruimstap 5).
5. Bronnenregister v1.2: onafhankelijke ChatGPT Final QA.
6. Onafhankelijke ChatGPT-review op #124 en op het PR-register.
7. Repo-instelling `homepage` (Vercel-URL) — eigenaarsactie.
8. `test_phase_d.py`-flakiness apart onderzoeken.

## 13. Reproduceerbare commando's en paden

```bash
git clone https://github.com/saddamsmit-source/Birdspot-Library.git && cd Birdspot-Library
git fetch --depth=1000 origin "+refs/pull/*/head:refs/pr/*" "+refs/heads/*:refs/remotes/origin/*"
git log -1 --format="%H %ci" origin/main; git log -1 --format="%H %ci" origin/preview/birdspot-review
gh api --paginate "repos/saddamsmit-source/Birdspot-Library/pulls?state=open&per_page=100" --jq 'length'   # gh pr list werkt niet via de proxy
gh api "repos/saddamsmit-source/Birdspot-Library/deployments?per_page=3" --jq '.[]|"\(.sha[0:7]) \(.ref) \(.environment)"'
# PR-register opnieuw opbouwen (vanaf branch docs/fotobaseline-tracker)
python3 -I tools/github/pr_analyze.py . open.json register.json
python3 -I tools/github/pr_build_register.py register.json docs/github/PR_REGISTER_<datum>.md
# Fotobaseline op een render-commit
git worktree add ../audit <sha>
node tools/fotobaseline/audit.mjs ../audit /tmp/audit.json
python3 -I tools/fotobaseline/imagecheck.py ../audit /tmp/audit.json /tmp/images.json --sheets /tmp/sheets --ids sp105,sp106
python3 -I tools/fotobaseline/build_tracker.py /tmp/audit.json /tmp/images.json docs/fotobaseline/reviews docs/fotobaseline/FOTOBASELINE_TRACKER.md <render-sha> <media-sha>
# Tests
node tests/test_fotovolgorde_2026-11-10.mjs && python3 tests/test_fotovolgorde_2026-11-10.py
node tests/test_guide_poses.mjs && node tests/test_guide_photo_verification.mjs
```

Paden: `src/data/species.js` · `src/features/species/{view.js,detailSections.js,guidePhotos.js,guideMedia.js,guideComparisons.js}` · `src/features/sightings/speciesPicker.js` · `src/features/profile/stats.js` · `sw.js` · `assets/species/{credits.json,field-guide-media.json}` · `docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json` · `tools/species/verified_heroes_2026-11-09.json` · `tools/fotobaseline/*` · `tools/github/*` · `docs/fotobaseline/*` · `docs/github/*`.

## 14. Kopieerklare startprompt

```
Je werkt aan Birdspot Library (https://github.com/saddamsmit-source/Birdspot-Library)
in het project "App Creator". Lees eerst het projectdocument
"claude/Birdspot_Handover_Fotobaseline_v1.1_FINAL.md" volledig (repo-kopie:
docs/handover/BIRDSPOT_HANDOVER_v1.1_2026-11-10.md op branch docs/fotobaseline-tracker).

Zonder mijn expliciete toestemming NIET: mergen naar main of preview/birdspot-review,
livegang, PR's sluiten, Vercel gebruiken, betaalde diensten gebruiken, nieuwe fotobatches.

Volgorde:
1. Controleer de actuele GitHub-stand: heads van main, preview/birdspot-review, #121,
   #122, #124 en #125; aantal open PR's (gh api, niet gh pr list); Pages-deployments.
   Vergelijk met §5 van de handover en meld elk verschil (andere schrijver?) vóór je schrijft.
2. Meet de fotodekking opnieuw op de actuele render-commit (tools/fotobaseline/audit.mjs).
3. Ga verder met de fotobaseline vanaf batch 02 (Fazanten t/m IJsvogels, 20 soorten).
   Batch 01 is klaar; niet opnieuw doen tenzij de media veranderd zijn. Bekijk iedere foto
   zelf, gebruik de bronaudit van 09-11 voor rechten en annotaties, vul per soort het
   record met technische, visuele en bron/rechtenstatus en de exacte SHA.
4. Corrigeer veilig aantoonbare fouten op een eigen branch gestapeld op #124, te beginnen
   met sp128 (vluchtfoto = mannetje) en de sp173-bevinding; registreer onzekerheden.
5. Commit en push na iedere batch; werk de tracker op #125 bij.
6. Rapporteer na iedere batch kort in het Nederlands: gecontroleerd, gecorrigeerd, open.
```

## 15. Document-QA van deze ronde

- Elk feit over GitHub is in deze sessie opnieuw gemeten (heads, PR's, CI, deployments, inhoud).
- Gereviseerde projectdocumenten: Index v3.7 (statusupdate), Addendum 2026-11-10 (§4-correctie, §8). Alle bestaande inhoud behouden; alleen gemarkeerde correcties en toevoegingen.
- Niet geverifieerd: de Pages-instelling zelf (API geblokkeerd), productie, fysieke toestellen.
- Onafhankelijke review: open.
