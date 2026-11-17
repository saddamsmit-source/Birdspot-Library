# Birdspot — releasebeslismatrix geïntegreerde kandidaat (16-11-2026)

**Status:** voorbereiding, geen publicatie. Livegang alleen na expliciete opdracht van de eigenaar ("zet live" / "live").

## 1. Integratietoestand (read-only, 16-11-2026 ±21:00)

| Onderdeel | Feit | Bewijs |
|---|---|---|
| `main` | `5bf67043`; zit volledig in de F3-keten | `git merge-base --is-ancestor` |
| `preview/birdspot-review` | `21ce9060`; zit volledig in de F3-keten | idem |
| PR #259/#260 (release 1.27.20, `7f33e116`) | open en mergebaar, maar **verouderd**: de F3-keten bevat ze volledig plus 106 commits | idem |
| Kandidaat | F3-head `5dcbdc02` (APP_VERSION 1.27.29) + R14b; 683 commits / 1367 bestanden voor op `main`, incl. `src/data/db.js` en `settings.js` | `git rev-list`, `git diff --stat` |
| Gestapelde keten | 21 open concept-PR's #246–#276 (+ #277), alle claims VRIJGEGEVEN | GitHub API |
| Branchbescherming `main` | **geen** (API: "Branch not protected") → required CI niet afgedwongen | `GET branches/main/protection` |
| Interactieve preview | **BLOCKED**: Vercel-teamscope "smittoe" niet geautoriseerd voor deze sessie (403); feature-branches hebben geen preview | Vercel-API |
| Rollback | `main` = `5bf67043` is het herstelpunt; een fast-forward naar de kandidaat blijft terug te zetten via een revert-PR of redeploy van `5bf67043` (niet geoefend) | — |

**Conclusie integratieroute:** #259/#260 zijn geen geldige route meer. Een nieuwe integratie-PR van de F3-head naar `main` (fast-forward) is technisch mogelijk, maar nog niet aangemaakt: zonder preview en toesteltests mag hij niet als releasekandidaat gelden.

## 2. Beslismatrix

| Gate | Status | Gevolg |
|---|---|---|
| Code/unit/negatief op kandidaat-SHA | PASS (CI 38/38 op `5dcbdc02`) | — |
| Chromium-regressie (gids, lookalikes, audiostatus, soortaudit, idb-showcase) | PASS in CI | — |
| Gegevensbehoud bestaande waarnemingen (IndexedDB-migratie `db.js`) bij upgrade vanaf productie | **NOT TESTED** op de geserveerde productieversie | harde gate |
| Interactieve preview van exact deze SHA | **BLOCKED** | harde gate |
| Fysiek Android/PWA: installatie, offline, microfoon, GPS, ZIP-export/-herstel | **NOT TESTED** | harde gate |
| Schermlezer (TalkBack) | NOT TESTED | — |
| Branchbescherming/required CI | ontbreekt | risico |
| Vogelcontent | 42/140 bekeken, 0 volledig geverifieerd; geluid alleen bronlabel (zichtbaar gemeld) | content mag mee als hij eerlijk gelabeld is |

## 3. Advies: **HOLD**

Drie harde gates ontbreken: preview van de exacte SHA, gegevensbehoud bij upgrade en fysieke toesteltests. "PASS MET VOORWAARDEN" is niet toegestaan omdat de gate voor gegevensbescherming niet getest is.

**Wat de HOLD opheft (in volgorde):**
1. Vercel-teamtoegang autoriseren, of een andere preview-route aanwijzen; daarna een preview van de exacte kandidaat-SHA.
2. Upgradetest: productieversie met testwaarnemingen → kandidaat → waarnemingen, foto's en instellingen intact; ZIP-export en -herstel.
3. Android-PWA: installeren, offline openen, GPS, microfoon, terug-navigatie.
4. Integratie-PR naar `main` met deze SHA; daarna "zet live", publicatie en controle na release (geserveerde SHA, kernroute, offline, herstel).

---

## 4. Actualisatie 16-11-2026 ±22:45 (release-spoor, los van het F3-werk)

| Onderdeel | Feit | Bewijs |
|---|---|---|
| Laatst bewezen kandidaat | `af7d100f` (R14b, CI 2/2 groen); R15-head op PR #278 is pas kandidaat na groene CI op exact die SHA | GitHub check-runs |
| Herstelpunt | `main` = `5bf67043` (ongewijzigd) | `GET branches/main` |
| Branchbescherming `main` | nog steeds **geen** ("Branch not protected", `protected=false`) | `GET branches/main/protection` |
| Vercel-route uit §3 punt 1 | **vervalt**: botst met de staande eigenaarsregel (9-11-2026) dat Birdspot nooit aan Vercel wordt gekoppeld | eigenaarbesluit |
| GitHub Pages (`preview/birdspot-review`) | openbaar, dus **geen afgeschermde preview**; bovendien op oude SHA `21ce9060` | README, Git |
| Geschikte veilige previewroute | De bestaande lokale launcher `tools/pilot/Start-BirdspotAndroidPilot.ps1` pint een branch op een exacte SHA, draait op `localhost` zonder deploy of GitHub-writes, en kan optioneel via USB een Android-toestel koppelen. Hij staat nog gepind op 1.27.7 (`83c11744`). | broncode launcher, CI-workflow `windows-pilot-launcher-qa.yml` |

**Gewijzigd advies voor §3 punt 1:** de pin van de launcher in een aparte release-PR bijwerken naar de kandidaat-SHA (na groene CI), dan lokaal op Windows starten en via USB op Android openen. Dat dekt preview, upgradetest en de fysieke toesteltest in één lokale sessie, zonder hosting. Preview-gate blijft **NOT TESTED** tot die sessie heeft plaatsgevonden.

**Advies blijft HOLD.** Openstaande harde gates ongewijzigd: interactieve preview van de exacte SHA, upgrade met gegevensbehoud, fysieke Android/PWA-test; daarnaast branchbescherming/required CI en één geïntegreerde regressie op één SHA. Geen merge of livegang zonder "zet live".
