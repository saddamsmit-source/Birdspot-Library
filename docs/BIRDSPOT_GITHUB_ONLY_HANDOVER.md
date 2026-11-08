# Birdspot · GitHub-only ontwikkeling en fotoronde-overdracht

**Checkpoint:** 8 november 2026 · eigenarenbesluit: ontwikkel zonder Vercel tot expliciet nieuw besluit · **Status:** lopende featurebranch, geen release.

## Afwijking van eerdere hostingafspraak
De Project Owner heeft besloten dat ontwikkeling, foto-audits, broncontrole, tests en review voorlopig volledig via GitHub en lokale tools lopen. Dit heeft voorrang boven de oudere Vercel-hostingafspraak uit de Birdspot-roadmap. Gebruik Vercel niet voor automatische preview- of productiedeployments. De bestaande gehoste productie en het Vercel-project worden niet verwijderd of gewijzigd als onderdeel van de fotowerkrondes. Voor opnieuw online testen, publiceren, livezetten of een betaald Vercel-abonnement is een afzonderlijk eigenaarbesluit nodig.

**Uitgevoerde stopmaatregel (beheer):** Vercel-project `birdspot-library` accepteerde op 8 november 2026 `previewDeploymentsDisabled: true` en `commandForIgnoringBuildStep: "exit 0"`. In `vercel.json` staat aanvullend `git.deploymentEnabled: false`, zodat het beleid duurzaam in GitHub kan worden beheerd. De wijzigingen zijn geen bewijs dat een volgende push daadwerkelijk niet deployt: controleer de Vercel-deploymentgeschiedenis zonder een build uit te lokken. Handmatige deploys zijn in deze ontwikkelfase eveneens niet toegestaan zonder opdracht.

## Vastgelegd GitHub-startpunt
- Repo: [saddamsmit-source/Birdspot-Library](https://github.com/saddamsmit-source/Birdspot-Library)
- Ongewijzigde productie-/main-baseline bij hervatting: `5bf67043e830e977749f0ee593cf9f41f0e2822b`.
- [PR #109](https://github.com/saddamsmit-source/Birdspot-Library/pull/109) op `557db8a909318bba7d84dcd5f93a6a96c14e439a`: gecombineerde UI en vluchtfotowerk; base `main`.
- [PR #110](https://github.com/saddamsmit-source/Birdspot-Library/pull/110) op `5d1f474fc4c726873b2aa0a2ef22fb16f966ed44`: kleedgroepen; base PR #109.
- [PR #111](https://github.com/saddamsmit-source/Birdspot-Library/pull/111) op `a6e432f4a92ca6ea1679631fe98446defe7e21fd`: eerste nieuwe brongecontroleerde fotogroep en viewer; base PR #110.
- Deze branch is gebaseerd op de exacte head van PR #111. Geen bestaande bron of eerdere featurebranch wordt teruggezet; één schrijver per branch.

## Productcontract foto's
Mannetje, vrouwtje en juveniel zijn drie onderscheiden rubrieken. Zittend en vliegend mogen samen in de **correcte** rubriek, ook met meerdere foto's naast elkaar. Hoofdfoto is één goed herkenbare soortfoto, voorkeur voor bevestigd mannetje als dat beeld beschikbaar en geschikt is, maar nooit een foutief of geforceerd geslachtslabel. Vergelijkingen volgen **onder** de rubrieken. Alle getoonde gidsbeelden zijn individueel te openen, te vergroten (1×/2×/4×), te draaien en na vergroting te verschuiven. Credits, oorspronkelijke bron, licentie, bewerking en broncontrole blijven bewaard. Onzekere leeftijd of sekse blijft ongelabeld. Geen onrechtmatige of rechten-onzekere nieuwe foto publiceren.

## Laatste bewezen telstand
Volgens PR #111 en de bijbehorende audit zijn de **39 vluchtfotorondes afgerond**; de nacontrole van bestaande kleedfoto's is gestart. Eerste groep: **11 nieuwe foto's** bij Vink, Huismus, Roodborst, Roodborsttapuit, IJsvogel, Wilde Eend, Kuifeend en Bergeend. **25 van 134** soorten met bestaande gidsfoto hebben alle drie de rollen ingevuld. **109** soorten hebben minstens één rol open (de eerdere opdracht sprak nog van 116 vóór deze groep). Alle 11 gefotografeerde roofvogelkaarten hebben de drie rubrieken. **Zwarte Specht:** de mannelijke hoofdfoto bestaat al, juveniel is nog open; niet onnodig een mannetje vervangen.

De nieuwe ontwikkelhulp `node tools/species/guide_coverage.mjs --open-photo-roles` genereert uit de actuele bronbestanden een deterministische JSON-lijst van de open rollen, met soort, aanwezig/ontbrekend per rubriek en hoofdfoto. De bestaande `--summary`-uitvoer blijft ongewijzigd. Begin elke volgende fotobatch met deze actuele lijst en controleer de lijst opnieuw na iedere batch; leg bron, licentie en dubbele veldkenmerken vast. Vul bij voorkeur drie soorten per fase in, zonder productiepublish; daarna komen pas de vogels zonder enige gidsfoto.

## QA en bewijsgrens
- PR #111 rapporteert VERIFIED voor Chromium (390 en 1365 px), 374 offline decodeerbare geregistreerde fotoverwijzingen, 120 audiobestanden en gedeelde fotoviewer met geëmuleerde touchbediening. Dit is historisch PR-bewijs, **geen nieuw uitgevoerde test** van deze branch.
- Voor de offline queue: uit te voeren `node tools/species/guide_coverage.mjs --open-photo-roles`, `node tools/species/guide_coverage.mjs --summary`, `node tests/test_guide_poses.mjs` en de relevante GitHub CI. Vergelijk openrol-aantal tegen huidige assets.
- Fysieke Android-/iOS-bediening, nieuwe waarnemingen offline opslaan, ZIP-herstel op een tweede toestel, offline kaarttegels en productie-update blijven **NOT TESTED** in deze overdracht.
- Deze ronde voert géén fotodownloads, bronverificaties van nieuwe beelden of volledige toestelfunctionaliteitstest uit; open rollen blijven dus echt open.

## Handover en volgende stap
1. Controleer vóór elk vervolg de head van deze PR, PR #111, PR-base, eventuele andere agent en de GitHub CI.
2. Pak de eerstvolgende maximaal drie soorten met open rubrieken uit `--open-photo-roles`. Dubbelcheck soort/geslacht/leeftijd, beeldinhoud, maker, licentie en geografische relevantie vóór lokaal toevoegen; breng geen onbevestigde URL/asset in de app.
3. Werk `assets/species/field-guide-media.json`, de gegenereerde gidsmodule, bijbehorende lokale bestanden en audit/testen samen bij. Bewaar bestaande media en onbekende data.
4. Controleer lokale klik/zoom/draai/sleepbediening, credits, geen dubbele foto's, offline laden en de bijdrage aan de dekking. Leg concrete resultaten als VERIFIED/PARTIALLY TESTED/NOT TESTED/BLOCKED vast.
5. Bewaar iedere fase in een eigen GitHub commit/PR (of vervolgstapel). Niet mergen of publiceren zonder expliciete vrijgave.

**Learning/Capability:** CAP-BIRD-012 (soortdetail), CAP-BIRD-015 (gidsmedia), CAP-BIRD-040 (offline/update). Bestaande Handbook-learnings voor assetrechten, offlinecaching, checkpoints en single-writer hergebruiken; geen nieuwe generieke learning zonder nieuw bewijs.
