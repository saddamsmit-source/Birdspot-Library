# Birdspot H8-herstel en Vercel-meetpreview (DRAFT)

Status: RONDE 1–2 VERIFIED · RONDE 3–4 BLOCKED (geen Vercel-toegang) · eigenaarbesluit optie A (24-11-2026 21:19)
Base `0885b56` (PR #358, op #357 `87bcdf9`) · herstel-SHA `383f9f5` · PR #359

## Ronde 1 — R2B H8

**Waarom CI faalde en lokaal niet.** H8 is een timingfout, geen testisolatieprobleem: elke H-stap start met een gewist profiel en een herladen pagina.
De CI-uitkomst op `87bcdf9` was `('Plas Noord', '', 'pl_b', 'Rietkraag Zuid', 'Rietkraag Zuid')`: de getypte naam bestond voor de app nooit.
Op `a702a72` (17:38) en `c164b20`/`b67f37d`/`a8ccc8f` slaagde dezelfde test; tussen `a702a72` en `87bcdf9` veranderde alleen `soundSession.js` (niet in deze route).

**Oorzaak (VERIFIED).** `openSpeciesPicker` zet bij openen een focustimer van 120 ms naar het zoekveld. Wordt binnen die tijd een soort gekozen, dan:
1. sluit de kiezer (verwijdering na 300 ms) en vult het formulier de soort in;
2. vuurt de timer alsnog: focus naar het zoekveld van de sluitende kiezer, daarna naar `<body>`;
3. tekst die de gebruiker al in Locatie typte, komt niet in het veld; bij de pinkeuze overschrijft de automatische naam het lege veld.
Op een tragere runner valt de 120 ms precies in Playwrights `fill`. Bij echte gebruikers: na een snelle soortkeuze en direct tikken in Locatie springt de focus weg en gaan toetsaanslagen verloren.

Deterministische reproductie (`tests/test_r2b_h8_picker_focus.py`) op `87bcdf9`-code: F1 focus `['sightLocation', 'spPickerSearch', 'BODY']`, waarde `''`; F2 geeft exact de CI-uitkomst `('Plas Noord', '', 'pl_b', 'Rietkraag Zuid', 'Rietkraag Zuid')`.

**Herstel (kleinste wijziging).** `src/features/sightings/speciesPicker.js`: timer bewaren en wissen bij sluiten (+5/−1 regels). Kiezer open laten: zoekveld krijgt nog steeds automatisch focus (F3).
Geen testverwachting gewijzigd. Nieuwe test F1–F4 + CI-stap die bewijst dat F1/F2 op `87bcdf9` falen. APP_VERSION niet verhoogd: appcode is network-first in de serviceworker (zelfde werkwijze als #357).

| Bewijs op `383f9f5` | Uitkomst |
|---|---|
| CI r2b: Herstel 2B P1–P4 (H7 + H8) · H8-focustest F1–F4 · F1/F2 falen op 87bcdf9 | PASS (push- en PR-run) |
| Lokaal (deployset-server, alleen `.vercelignore`-bestanden): r2b-qa-herstel 8/8, h8-picker-focus 4/4, r2b-places-env-zip, r05-gps-race, pilot-cross-profile-zip, r3-zip-herstel, pilot-offline-new-sighting, navigation-recovery, sighting-merlin-pins, r3-audio, species-groups-az, android-media-preflight, map-k4, mobile-editorial | PASS |
| feature-reconciliation lokaal | 12 PASS, F06 (BirdNET-model) en F07 (kaarttegels) FAIL: externe hosts geblokkeerd in sandbox; CI-run op deze SHA PASS |
| phase-d lokaal | FAIL D-03… ook op base `0885b56`; verouderde test, in geen workflow |
| Node-suite | 56/57; `test_photo_feedback.mjs` faalt alleen in deze omgeving (ook eerder) |

Bestaande waarnemingen, plekken en media: alle routes draaien op wegwerpprofielen; ZIP-export/-herstel en kruisprofielherstel PASS, geen dataverlies in de tests.

## Ronde 2 — deployset op dezelfde SHA

| Git-boom `383f9f5` | Bestanden | Bytes |
|---|---|---|
| Zonder `.vercelignore` | 2.150 | 213.394.445 |
| Met `.vercelignore` | 778 | 97.373.746 |
| Verschil | −1.372 | −116.020.699 (−54,4%) |

`tests/test_vercelignore_runtime.mjs` PASS (770 gebruikte bestanden binnen de set). 22 browsersuites + `tests/preview_qa.py --local` (PASS 42/42, 320/390/430 px) draaiden tegen een server die alleen de deployset levert; enige verzoek buiten de set: `/favicon.ico` (bestaat niet in de repo, ook nu 404).

## Ronde 3 — meetpreview: BLOCKED, niet gedeployd

- Vercel-API vanuit Claude: 403 op team `smittoe` (`GET /v9/projects/birdspot-f2-24-private-preview`, 24-11 21:20). Geen omweg, geen tweede poging via andere route.
- Geen Vercel-CLI of token in deze sessie; installatie van Vercel-pakketten eerder geweigerd; sandbox bereikt `*.vercel.app` niet.
- Daardoor niet controleerbaar: projectinstellingen, SSO-status, opslagstand, toepassing van `.vercelignore` door de deploymethode.
- Gevolg: 0 deployments gemaakt. Deploymentgrootte en Deployment Storage vóór/na: UNKNOWN.

## Ronde 4 — preview-QA op echte deployment: BLOCKED

Scripts klaar (`tests/preview_qa.py`, `tools/preview/check_deployment.mjs`, `.github/workflows/preview-qa.yml`). Zonder deployment en toegang: lagen 1–4 en 12 op Vercel BLOCKED; lokaal op dezelfde deployset PASS.

Kleinste route met de bestaande ChatGPT-koppeling, zonder extra secrets: ChatGPT (leesrechten op team Smittoe) deployt één preview van `383f9f5` naar `birdspot-f2-24-private-preview` via een methode die `.vercelignore` toepast (Vercel-CLI of Git-ref), met `gitSha=383f9f5…` als metadata, en leest deployment-ID, SHA, READY en bestandsoverzicht terug. Browsercontrole van de beveiligde URL vraagt geautoriseerde browsertoegang (eigenaar zelf, of een agent met bypass-secret).
