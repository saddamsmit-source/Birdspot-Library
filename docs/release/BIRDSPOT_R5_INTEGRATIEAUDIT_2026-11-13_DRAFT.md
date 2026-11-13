# Birdspot · integratieaudit vóór release — ronde 5/6

**Datum:** 13 november 2026 · **Status:** REVIEW / READ-ONLY ANALYSE · **Releasegate:** BLOCKED · **Publicatie:** NIET geautoriseerd.  
**Basis van deze audit:** PR #169, `c5d7c62021363a23362e1f570c0f12f1c6d4334c`; geen appcode, gidsfoto, gebruikersdata of eerdere branch gewijzigd. **Writer van deze audit:** ChatGPT op afzonderlijke docs-/QA-branch; andere actieve schrijvers zijn niet onafhankelijk vast te stellen.

## 1. Feitelijke GitHub-toestand (vastgepinde SHA's)

| Rol | Referentie | HEAD | Bewijsgrens |
|---|---|---|---|
| Productiecodebasis | `main` | `5bf67043e830e977749f0ee593cf9f41f0e2822b` | Bestaande versie 1.14.0-map-k5-links; geen nieuw merge-/deploybewijs |
| Bestaande publieke reviewbron | `preview/birdspot-review`, PR #118 | `21ce9060f789103cfbba98fa78f6b53f4b9cea5b` | SW `1.27.6`; GitHub Pages-status zelf niet live/functioneel herbeproefd |
| Historische releasebasis | PR #128 `release/birdspot-1.27.0` | `9d4b727698ede7237ba4c2607fb62e3c1155d384` | Achterhaald als eindkandidaat door vervolgwerk |
| Historische upgrade-QA | PR #129 | `14b3eb5e106a2eaae461ec831c8e5baa770df893` | Bewijs bij oudere bron, niet automatisch actuele release |
| Offline-kernroute | PR #168 | `12a985f34604e905c2199521736c5e1b1c5767f4` | Vier CI-jobs PASS op deze SHA |
| Android-testvoorbereiding | PR #169 | `c5d7c62021363a23362e1f570c0f12f1c6d4334c` | Één schema-/privacytest PASS, fysieke Android NIET uitgevoerd |

Bij inspectie stonden **minstens 100 PR's open** (zoeklimiet = 100, dus geen bewering dat precies 100 openstaan). PR #169 → #168 → #167 → #166 → #165 → #164 → #163 → #162 vormen een rechtstreeks gestapelde laatste keten; een eerdere K07-/K06-reeks vormt de voorouders daarvan. Geen parallelle writer-write uitgevoerd.

## 2. Integratie/ancestry: positieve uitkomst, maar nog geen release-PASS

Remote GitHub Compare bevestigt:

- `main` → PR #169: **ahead 275, behind 0**, merge-base exact main `5bf67043`. De compare-tool leverde maximaal **300** bestandsregels; dit is geen betrouwbare totaaltelling van alle wijzigingen sinds main.
- `preview/birdspot-review` → PR #169: **ahead 31, behind 0**, merge-base exact `21ce9060`. Precies **52** extra gewijzigde/toegevoegde bestanden: 3 workflows, 9 assets, 24 docs, 4 `src`-bestanden, 9 tests en 3 tools.
- PR #128 → PR #169: **ahead 101, behind 0**; PR #128 is een voorouder.
- PR #168 → PR #169: **ahead 4, behind 0**, uitsluitend vier Android-pilotdocumentatie/test/CI-bestanden. Geen nieuwe appcode of binaire media tussen die twee checkpoints.
- PR #128 → `preview/birdspot-review`: **ahead 70, behind 0**. Er is dus één lineaire overerving in deze checkpoints. **Dit is een Git-ancestrycheck, niet een echte merge-, conflictoplossings-, toestel- of productieproef.**

**Integratieadvies:** géén afzonderlijke oude PR #128 of alle open feature-PR's blind in main mergen. Kies later één vastgezette eind-SHA en controleer de actuele situatie opnieuw. Losse groene checks niet optellen tot één app-PASS.

## 3. Kritieke cacheversiedrift — RELEASEBLOCKER C-01

**Direct gecontroleerde feiten:**
1. `sw.js` op review `21ce9060` en PR #169 heeft dezelfde blob SHA `5b23135d1dad7fb94638ef1d968161619a74bff1` en dezelfde `APP_VERSION = '1.27.6'`.
2. Er zijn **31 nieuwe commits**, inclusief wijzigingen aan `assets/species/field-guide-media.json`, **acht nieuwe lokale WebP's**, `src/data/species.js`, `src/data/speciesKnowledge.js`, `src/features/species/guideComparisons.js` en `src/features/species/guideMedia.js`.
3. De huidige serviceworker serveert `PRECACHE_URLS` vanuit de bestaande app-cache, gebruikt cache-first voor afbeeldingen/audio en behoudt `birdspot-media` over releases. De gidsmedia-precache draait tijdens de `install`-event; reeds aanwezige media worden niet automatisch opnieuw gehaald.

**Risico (uit de code afgeleid; niet als waargenomen toestelbug geclaimd):** publicatie van nieuwere broncode onder dezelfde serviceworker-bytes/cacheversie kan eerder geïnstalleerde PWA's op de oude modules en media houden. Oude en nieuwe bronbestanden of missende offline foto's kunnen tot inconsistente weergave leiden. De geslaagde upgradeproeven **1.14.0 → 1.27.6** en **1.27.5 → 1.27.6** bewijzen **niet** een upgrade **1.27.6 → volgende versie**.

**Maatregel:** bevries een nieuwe review-/releasekandidaat vanaf exact gecontroleerde head op een **nieuwe eigen branch**; kies pas daar een unieke volgende `APP_VERSION`/cache, behoud bron/asset-manifesten; test daarna de werkelijke serviceworker-overgang vanaf `21ce9060` (1.27.6) plus relevante historische baselines met identieke browserorigin en gebruikersdata. Controleer óók niet-nieuwe versleutelde media, offline gids, wijzigende foto, oude fotoblob en back-up. Zonder bewijs: **BLOCKED**, geen previewdeploy/publicatie.

## 4. Bestaand CI- en runtimebewijs — exact scheiden

| Commit | Wat door GitHub Actions is geslaagd | Wat dit níét bewijst |
|---|---|---|
| `21ce9060` (review) | 15 workflows COMPLETED/SUCCESS inclusief navigatie, media, kennis, gids en upgrade | Nieuwere 31 commits; echte telefoon |
| `12a985f` (#168) | [S1 Pilot Core Offline QA #43314906934](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43314906934), 4 jobs: echte UI offline nieuw opslaan, ZIP-herstel, navigatie, upgrades 1.14 en 1.27.5 | Android hardware; upgrade vanaf review 1.27.6 |
| `c5d7c620` (#169) | [Android Evidence QA #43374428178](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43374428178): 1 job PASS | Fysieke Android-test, nieuwe gecombineerde regressie of release |
| `9d4b727` (#128) | Historische releasechecks geslaagd op oude kandidaat | Huidige app- en mediacontent |

Het resultaat van PR #168 geldt als technisch browserbewijs voor dezelfde appcode die in PR #169 is geërfd (PR #169 verandert alleen vier docs-/QA-bestanden). Een **releasegate op PR #169** is daarmee niet opnieuw integraal bewezen.

## 5. Cross-document en scopebevindingen

- **App-README** op PR #169 noemt nog '24 bestanden' bij tests, terwijl `tests/` bij huidige commit 40 Python- en 6 Node-testscripts bevat (plus 3 overige items). Werk exacte actuele testaanpak/referenties gecontroleerd bij op een releasebranch, geen stille vervanging van geschiedenis.
- De S1-fase, provider-/toolkostenkaart (gratis/betaald, klein/normaal/piek, werkelijk bedrag, waarschuwing/stoplimiet en fallback) en operationele grenzen zijn in Birdspot Veldhandboek v0.5/Handbook §1B nader uitgewerkt; app-README heeft deze nog niet als actuele projectspecifieke status/registratie.
- `docs/release/RELEASE_1.27.6.md` is **historisch juist voor de 1.27.6-review**, met destijds 86/140 individueel gecontroleerde fotosoorten, niet een releasebewijs voor de nieuwere QA-teller van 100/140. **Niet historisch overschrijven**; maak een eigen notitie voor de nieuwe kandidaat.
- `vercel.json` op kandidaat bevat `git.deploymentEnabled=false`. Dit verklaart géén live-/toestelstatus en vervangt de GitHub Pages-/hostingkeuze niet. Geen Vercel-deploy aanzetten.
- Index v3.10 FINAL verwijst naar **Projectinstructies v2.12 FINAL**, maar in deze sessie is alleen **v2.11 FINAL** als werkelijk beschikbaar bestand aangetroffen. Activering/bronplaatsing **UNKNOWN**, geen inhoud van v2.12 veronderstellen.
- Open mediarechten, 40 soorten nog niet afzonderlijk geaudit, ontbreken van originele hoge-resolutiefoto en perceptuele bijna-dubbelen blijven aparte dossiers. Geen claim dat licenties en veldinhoud van alle vogelkaarten onafhankelijk PASS zijn.
- GitHub-repo is publiek; plaats nooit persoonlijke waarnemingen/GPS/ZIP/fysieke toestelrapporten als bestanden of workflowartifacts in deze repo.

## 6. Gate-overzicht en exact vervolg

| Gate | Status op 13-11-2026 | Vereiste volgende stap |
|---|---|---|
| Git-ancestry en base/head controle | **PASS** read-only | Reconfirm voordat writer/releasebranch start |
| Nieuwe appcode + gidsdata alle bestanden | **PARTIALLY TESTED** | Eén samenhangende releasebranch en regressiematrix op nieuwe exacte SHA |
| App-cache/versie | **FAIL releasevoorwaarde** (zelfde 1.27.6 op verschillende codebases) | Unieke nieuwe SW/cacheversie + echte upgrade 1.27.6→nieuw |
| Oude opgeslagen gegevens + ZIP | **PASS browser** op PR #168; toestel **NOT TESTED** | Android/second-device proef + herhaal na definitieve release-SHA |
| Fysieke Android-invoer/Back/GPS/installatie | **NOT TESTED** | AND-01..09 uit PR #169, privé evidence, onafhankelijke review |
| Privacy, huidige hosting, herstel/rollback | **PARTIALLY TESTED** | Pre-releasecheck, kosten-/toegangsbewijs, code-/datarollback apart |
| Release-/merge-/publieke livegoedkeuring | **BLOCKED** | Eerst overige gates, daarna uitdrukkelijk eigenaarbesluit |

### Voorstel ronde 6/6 (geen impliciet akkoord voor publicatie)

1. Controleer nogmaals remote HEAD, PR-chain, actieve schrijver en open CI.
2. Maak op eigen branch één **niet-gepubliceerde releasekandidaat** bovenop geteste apphead, met nieuwe unieke SW-versie en per asset intacte herkomst. Geen los mergen van oudere PR's.
3. Draai bestaande geïntegreerde regressies op exact dezelfde nieuwe SHA, plus een echte 1.27.6→nieuwe-versie SW/browserproef op dezelfde origin (data, foto, gids en offline), foutpaden en ZIP.
4. Voltooi waar mogelijk fysieke Android-test uit PR #169. Bij ontbrekende fysieke toesteltoegang blijft de gate NOT TESTED/BLOCKED en de kandidaat review-only.
5. Maak release-notities inclusief code-/dataherstel, register, kosten, onafhankelijke QA en SHA; pas README/Index alleen na afstemming op de bewezen bron aan.
6. **Geen merge, GitHub Pages-preview, Vercel, publieke release of live** zonder de relevante gates en het afzonderlijke expliciete eigenaarbesluit.

## 7. Laatst bewezen checkpoint, herstel en kennisdelta

- Bestaande (vóór deze document-PR) QA-head: `c5d7c62021363a23362e1f570c0f12f1c6d4334c`; huidige reviewbasis: `21ce9060f789103cfbba98fa78f6b53f4b9cea5b`; `main`: `5bf67043e830e977749f0ee593cf9f41f0e2822b`.
- **Herstelroute:** sluit alleen deze nieuwe document-PR bij afwijzing; geen rollback nodig in bestaande app-branches. Een code-rollback mag gebruikersdata nooit wissen of als vervanging van ZIP-herstel worden gepresenteerd.
- **Wel:** gereconstrueerde lineaire Git-ancestry, separate CI-bewijslagen, echte cacheversie-/bronvergelijking. **Niet:** losse PR's blind samenvoegen, oude releasebewijs hergebruiken als nieuwe releasegate, cacheversies hergebruiken.
- **Oorzaak:** releasewerk is doorgegroeid bovenop een bestaande 1.27.6-review zonder nieuwe releaseversie; géén bewezen runtimeincident en géén nieuwe productiebehandeling.
- **Kennisdelta:** bestaande L-026, L-027, L-069, Handbook §§1.6/1.7A/3.6/4.11 en CAP-BIRD-040 bevestigd; **geen nieuwe algemene norm-ID**. Werkelijke toolminuten/hostingkosten UNKNOWN. Onafhankelijkheidsgrens: GitHub-code/CI read-only beoordeeld; geen fysieke toestel-, browser-release- of ornithologische tweede-review in deze ronde.

**Documentstatus REVIEW ≠ app-PASS. RELEASE: NO-GO.**
