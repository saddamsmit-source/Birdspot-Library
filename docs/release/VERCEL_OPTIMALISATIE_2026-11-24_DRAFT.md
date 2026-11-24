# Birdspot Vercel-optimalisatieproef (DRAFT)

Status: RONDE 1–3 UITGEVOERD · eigenaarakkoord 24-11-2026 (gecontroleerde optimalisatieproef) · PR #358 · base `87bcdf9` (PR #357)
Geen Vercel-deployment, verwijdering of instellingswijziging. Normdocumenten (Handbook, Index, Projectinstructies, README, Veldhandboek) ongewijzigd.

## Ronde 1 — deploymentinhoud

**Maatregel:** `.vercelignore` als toelatingslijst in de vorm van het Vercel-voorbeeld (`/*`, daarna `!naam`).
Toegelaten: `index.html`, `feedback-inbox.html`, `manifest.webmanifest`, `sw.js`, `icons/`, `styles/`, `src/`, `assets/`, `api/`, `package.json`, `package-lock.json`, `vercel.json`.
Uitgesloten: `docs/`, `tests/`, `tools/`, `.github/`, `README.md`.

| Meting (git-boom op deze branch) | Bestanden | Bytes |
|---|---|---|
| Zonder `.vercelignore` (alles behalve Vercel-standaarduitsluitingen) | 2.141 | 213.356.660 |
| Met `.vercelignore` | 778 | 97.373.509 |
| Verschil per nieuwe deployment | −1.363 | −115.983.151 (−54,4%) |

Uitsplitsing uitgesloten (git-boom): `docs/` 82,1 MB (waarvan `docs/media-intake/` 66 MB) · `tests/` 16,6 MB · `tools/` 17,0 MB · `.github/` 0,2 MB · `README.md` 0,06 MB.
Een agentwerkkopie met lokale testartefacten (git-genegeerde screenshots, `__pycache__`) was 313 MB; of de Vercel-CLI `.gitignore` volgt, is UNKNOWN. De toelatingslijst sluit ook die artefacten uit.

**Waarom veilig**
- `tests/test_vercelignore_runtime.mjs` (CI: `vercel-deployset-qa.yml`): alle HTML-verwijzingen, serviceworker-precache, manifesticonen, statische en dynamische JS-imports (src, api) en 770 lokale foto-, audio-, credit- en datapaden bestaan en liggen binnen de toelatingslijst; geen runtimebestand laadt iets uit `docs/`, `tests/` of `tools/` (alleen bronvermeldingen/commentaar als tekst); een nieuw item in de hoofdmap laat de test falen tot er bewust is gekozen. Negatieve proef: zonder `!styles` faalt de test.
- Uitsluitingsset dubbel berekend: eigen evaluatie en git's gitignore-implementatie (`git ls-files -i --exclude-from=.vercelignore`) geven identiek 778 bestanden / 97.373.509 bytes. De exacte Vercel-CLI-uploadlijst is niet gedraaid (installatie van `@vercel/client` in deze sessie geweigerd) → PARTIALLY TESTED.
- Browserbewijs vanaf precies de deployset: een lokale server die alles buiten de toelatingslijst met 404 beantwoordt en logt. 12 bestaande Playwright-suites (Chrome, mobiel 320–430 px), zie tabel.

| Suite (deployset-server) | Uitkomst | Verzoeken buiten deployset |
|---|---|---|
| kennisbaseline-browser, f3-rev2-r01-browser (incl. offline), pilot-offline-new-sighting, audio-status-browser, plumage-keyboard-credits, app-search, home-hotspots | PASS | alleen `/favicon.ico` (bestaat ook nu niet; ongewijzigd 404) |
| pilot-cross-profile-zip, r3-zip-herstel, r2b-places-env-zip (27/27), r2b-qa-herstel (8/8, H8 PASS) | PASS | alleen `/favicon.ico` |
| species-detail | FAIL bij H2-05 (kaartzoekveld) — identiek zonder deployset-server; Leaflet-CDN is in deze sandbox niet bereikbaar. CI op `87bcdf9`: PASS | alleen `/favicon.ico` |
| guide-photos | NOT TESTED lokaal (hing zonder uitvoer, afgebroken na 10 min); valt onder CI `guide-photos-qa.yml` | — |

Geen enkel verzoek naar een bestaand bestand buiten de deployset; geen persoonlijke opslag gewijzigd (alleen wegwerpprofielen).

**Opslagbesparing:** per nieuwe deployment −116 MB (VERIFIED op git-boom). Besparing in de Vercel-meter: UNKNOWN tot één nieuwe preview is gemaakt en in Vercel *Resources* en *Usage* is vergeleken.

**Resterende risico's**
1. `.vercelignore` werkt bij uploads via Vercel-CLI (en volgens de documentatie bij het deploymentproces). Uploadt een connector of API zelf een bestandenlijst, dan geldt de lijst mogelijk niet → deploymethode ChatGPT/Vercel UNKNOWN.
2. Nieuw runtimebestand in de hoofdmap → CI-test faalt (bedoeld).
3. Lokale proef vervangt geen echte Vercel-preview.

## Ronde 2 — preview-QA-standaard

| Laag | Hulpmiddel | Status nu |
|---|---|---|
| 1–3 GitHub-SHA ↔ gedeployde SHA, READY | `tools/preview/check_deployment.mjs` (Vercel-API, alleen lezen) | BLOCKED: geen token/teamtoegang (403 op team Smittoe) |
| 4 Geautoriseerde toegang | `tests/preview_qa.py --url` met `VERCEL_AUTOMATION_BYPASS_SECRET` | BLOCKED: sandbox bereikt `*.vercel.app` niet; geen secret |
| 5–7, 9–10 Home, navigatie, soortdetail, foto's, credits, Snel herkennen, Lijkt op, Let op, audio, sluiten/heropenen, offline, fouten, overloop | `tests/preview_qa.py` | lokaal op exacte deployset: PASS 42/42 + 3 INFO (externe CDN/weer onbereikbaar), Chrome 320/390/430 px |
| 8 Gewijzigde gebruikersfuncties | gerichte bestaande tests van de wijziging, zelfde SHA | per wijziging |
| Toestel en eigenaarreview | eigenaar | NOT TESTED |

Handmatige workflow `preview-qa.yml` (workflow_dispatch: preview-URL + SHA) draait laag 1–10 in GitHub Actions en bewaart het rapport. PASS alleen als SHA-controle én browserrapport PASS zijn. Vercel READY of een link zonder browserrapport geeft nooit preview-PASS. Eigenaaractie: repo-secrets `VERCEL_AUTOMATION_BYPASS_SECRET`, `VERCEL_TOKEN` (leesrechten), `VERCEL_TEAM_ID`. SSO blijft aan.

Vaste route: wijziging op branch met writerclaim → gerichte lokale tests + CI groen op SHA → één preview per reviewcheckpoint (`vercel deploy --meta gitSha=<SHA>`) → workflow `preview-qa.yml` → één link met bewijsniveau per laag in de PR → vorig werkend checkpoint blijft herstelpunt.

Eigenaarpreview nu verantwoord: NEE voor `87bcdf9`-lijn zolang CI r2b (H8) op die SHA rood is en de previewlagen 1–4 BLOCKED zijn.

## Ronde 3 — retentie en opschoning (niets geactiveerd of verwijderd)

Deploymentlijst: BLOCKED (Vercel-API 403, team `smittoe`). Classificatie daarom per regel; invullen zodra de lijst leesbaar is.

| Klasse | Regel |
|---|---|
| KEEP | Huidige productiedeployment birdspot-library en de direct vorige (enige Hobby-rollbackdoel); laatste preview per open PR (#355, #357, #358 na eerste preview); deployments met alias of domein; laatste werkende deployment van birdspot-f2-24-private-preview (feedback-API + private Blob) |
| DELETE CANDIDATE | Previews van achterhaalde tussen-SHA's ouder dan het laatste reviewcheckpoint; ERROR/CANCELED; dubbele previews van dezelfde SHA |
| UNKNOWN | Deployments zonder SHA-metadata of alias; project `the-headquarters-fade-culture-demo` (ander domein, eigenaarbesluit) |

Per aspect: previewlink → 410 na verwijdering, herstel binnen de herstelperiode · rollback → Hobby alleen naar direct vorige productie · GitHub-herleidbaarheid → Vercel post geen deployments/statussen naar GitHub (Git-deploys uit), dus alleen via `--meta gitSha` · domeinen/aliassen → verwijderen breekt alias-URL's; aliassen zijn uitzondering op retentie · bescherming → Vercel Authentication blijft aan; bypass alleen als secret · opslag → Blob-opslag van de feedback-API staat los van deployments.

Retentievoorstel (niet geactiveerd), per project:
- birdspot-library: Canceled 1 week · Errored 1 week · Pre-Production 2 weken · Production 1 maand (standaard). De laatste 3 deployments blijven altijd.
- birdspot-f2-24-private-preview: standaard laten tot de deploymentlijst bekend is (UNKNOWN).
- Builds vermijden: Git-deploys blijven uit (`git.deploymentEnabled: false`, VERIFIED); geen deploy voor document- of cosmetisch werk; één preview per checkpoint.

## Bestaande blocker (R2B H8)

CI `r2b` op `87bcdf9` (run 45451088807): H8 "zelf getypte naam blijft" FAIL. Op deze branch is geen appcode gewijzigd; lokaal op de deployset-server H8 PASS (8/8). Oorzaak van de CI-fout: UNKNOWN (vermoedelijk timing; niet bewezen). Niet hersteld: niet nodig voor deze proef; foutregistratie op #357 blijft.
