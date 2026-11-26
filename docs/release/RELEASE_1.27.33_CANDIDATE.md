# Birdspot 1.27.34 — geïntegreerde releasekandidaat (opvolger van 1.27.33)

**Status:** REVIEW / NOT LIVE · **Release HOLD** · eigenaar beslist over preview, toesteltest en `zet live`.
**Eigenaarakkoord:** 26 november 2026: releasebundel 1.27.33 (RB-01, PR #365); AS-01-reparatie (PR #366, ChatGPT-codecontrole akkoord als ontwikkelcheckpoint); versie 1.27.34 voorbereiden (RB-02). Geen deployment, geen merge.
**Writer:** Claude op `claude/birdspot-release-1.27.34-20261126`, concept-PR #367. Dit document bevat ook de notities van 1.27.33; wat hieronder over 1.27.33 staat, geldt ongewijzigd voor 1.27.34 tenzij anders vermeld.

## Nieuw in 1.27.34 — AS-01 geluidsopnamemenu altijd te verlaten

- **Melding:** eigenaar op Samsung, beveiligde preview 1.27.33 (`dpl_Hu14Bh8zD121gDFxnZ8qin8FSyus`, `3a03c84`): "de app liep vast bij opname menu die ik wilde sluiten" ([comment 7188449804](https://github.com/saddamsmit-source/Birdspot-Library/pull/365#issuecomment-7188449804)).
- **Oorzaak (lokaal bewezen):** tijdens een opname blokkeerde elke sluitroute (Sluiten, Android-terug, Escape, tik buiten, Terug naar keuzes) met alleen een statusregel bovenaan, vaak buiten beeld. Latent (gesimuleerd): een hangende microfoonstart of uitblijvend stop-signaal hield de gebruiker permanent vast. Of dit exact het Samsung-voorval was: UNKNOWN.
- **Nu:** sluiten tijdens opnemen toont **De opname loopt nog** met Stop opname / Doorgaan met opnemen; na stoppen volgt *Opname wordt afgerond…* en de bestaande keuze verder bewerken / concept bewaren / verwijderen. Sluiten tijdens het starten van de microfoon mag direct (een late microfoon wordt meteen vrijgegeven). Blijft het stop-signaal uit, dan rondt Birdspot na 5 s zelf af: met geluid volgt de keuze, zonder geluid "Probeer het opnieuw". Geen microfoon, timer of wake-lock blijft actief.
- **Ongewijzigd:** geen automatische conceptopslag, geen BirdNET-verificatie, geen wijziging aan bestaande waarnemingen, geen opslag- of cachewijziging.
- **Open:** de echte Samsung-hertest (sluiten tijdens opnemen, stoppen en afronden; terug en annuleren) op een nieuwe beveiligde preview van exact 1.27.34. [AS-01-dossier](AS01_AUDIOSLUITEN_2026-11-26_DRAFT.md)

| | SHA | Toelichting |
|---|---|---|
| Productie `main` | `5bf67043e830e977749f0ee593cf9f41f0e2822b` | Release 1.14.0; voorouder van de kandidaat (fast-forward mogelijk, 1.039 commits verder) |
| Openbare review | `0f9f631a73500b84219ade48e965c8d458496bb3` | GitHub Pages 1.27.31; voorouder van de kandidaat |
| Basis RB-01 | `521fba89b455e4a8b38078be92436197f11efabc` | PR #364 (UX-03R), 1.27.32; onafhankelijke QA [comment 7186160524](https://github.com/saddamsmit-source/Birdspot-Library/pull/364#issuecomment-7186160524) |
| Kandidaat 1.27.33 | `3a03c84b98de4d5e6c3709a5202273e3bd775e65` | PR #365 (appcode `d5a17eb`); als beveiligde preview uitgerold op 26-11-2026; AS-01-melding |
| AS-01 | `ca9e38898da354920cb7bf9e60b56043b8465f8e` | PR #366: reparatie geluidsopnamemenu |
| **Appcode-kandidaat 1.27.34** | **`e438bfc449f70ac2965ed581d6843927146a68b1`** | RB-02A: `APP_VERSION` 1.27.34; daarna alleen documentatie en CI in PR #367 |
| Head PR #367 | zie PR-overdracht | README, deze notities en RB-02-workflow; geen appcode |

Keten (concept-PR's): #354 → #355 (#356 gemerged) → #357 → #358 → #359 → #360 → #361 → #362 → #363 → #364 → #365 → #366 → #367.

## Wat verandert voor de gebruiker (t.o.v. de openbare review 1.27.31)

- **Snel vastleggen (UX-01).** Concepten bij onderbreken of weggaan, met de keuze verder bewerken, bewaren of verwerpen. **Nog één toevoegen** neemt geen soort, zekerheid, aantal of media over; recente soorten bovenaan de soortkiezer.
- **Terugvinden en beheren (UX-02).** Zoeken op soort, plek, datum en notitie en combineerbare filters (waarnemingswijze, media, zekerheid, herkenning) in Mijn waarnemingen; terug naar dezelfde lijst, filters en scrollpositie; automatische plekken een naam geven.
- **Navigatie en betrouwbaarheid (UX-03).** Home: Ontdekken · Waarnemen · Mijn collectie. Eén herkenningsstatus in lijst, detail, kaart, soortkaart, filter en profiel. Vaste meldingsvormen, tikdoelen ≥ 44 px, contrast ≥ 4,5:1 in licht en donker.
- **Tellingen, zelfcontrole en CSV (UX-03R).** Zie hieronder.
- **Geluidsopnamemenu altijd te verlaten (AS-01, 1.27.34).** Zie boven.
- Daarnaast uit de keten: fotokijker met swipen en zoomen (FOT-01), hoofdfotoreeks (FOT-02, per soort nog niet vrijgegeven), windrichting en locatie op de weerkaart (WEE-01), plekken- en herstelslotverbeteringen (R2B), Vercel-toelatingslijst (`.vercelignore`).

## BirdNET-verificatieregel (eigenaarbesluit optie A)

BirdNET en Merlin **stellen alleen voor**. Een waarneming telt als soort op je lijst bij *Eigen herkenning*, *BirdNET/Merlin · zelf gecontroleerd* of een oud record zonder vastgelegde bron, en niet bij zekerheid *mogelijk*, een ongecontroleerde suggestie of *Controle onbekend*. Historische BirdNET-suggesties waarvan de eigen controle onbekend is, blijven ongewijzigd bewaard en tellen pas mee na **Identificatie zelf controleren** (knop in het detail + aangevinkte bevestiging). Dan wijzigen alleen de herkenningsbron en de controlestatus; de oorspronkelijke BirdNET-suggestie blijft als bewijs. Alleen bewerken of opnieuw opslaan bevestigt niets. Zelf gecontroleerd is geen onafhankelijke wetenschappelijke verificatie.

## Verandering in soortenstatistieken

"Soorten" zonder toevoeging = soorten op je lijst (centrale telregel), op Home, in Profiel › Mijn lijsten, jaarlijsten, nieuwe soorten, Inzichten (aantal, cumulatieve lijn, top 5), Dagboek en de soortgids ('Waargenomen' en teller). Een ruw soortaantal heet **"geregistreerd"** (Profiel › Overzicht, Topplekken, plekkaartje). Inzichten legt het verschil per jaar uit.

**Een lager aantal meetellende soorten betekent niet dat er waarnemingen zijn verwijderd.** Alle waarnemingen blijven bewaard en zichtbaar in Mijn waarnemingen, de kaart, de CSV en de ZIP-back-up.

Voorbeeld (fictieve testset uit `tests/test_ux03r_a_tellingen.py`): Home 10 → 6 soorten · Inzichten 2026 8 → 4 (met uitleg "4 tellen niet mee · 8 geregistreerd") · soortgids 10 → 6 'Waargenomen' · Profiel-overzicht "10 soorten" → "10 soorten geregistreerd".

## CSV-compatibiliteit

Dezelfde 13 kolommen in dezelfde volgorde, UTF-8 met BOM, RFC 4180-quotes en bescherming tegen formule-injectie. `zekerheid` blijft de opgeslagen waarde. In `waarnemingswijze` staat de herkenning tussen haakjes, zoals al bij BirdNET en Merlin; nieuw is alleen de markering voor oude records:

```
OUD   2025-05-01,,Merel,,1,zeker,gehoord,,,,,,s06
NIEUW 2025-05-01,,Merel,,1,zeker,"gehoord (BirdNET, controle onbekend)",,,,,,s06
```

Zonder vastgelegde waarnemingswijze staat alleen '(BirdNET, controle onbekend)'. Wie in een spreadsheet op exact de tekst 'gehoord' filtert, ziet bij zulke records een langere cel. Birdspot leest zelf geen CSV in; de ZIP-back-up is ongewijzigd.

## Offline- en cachegedrag

- `sw.js` is de enige versiebron: `APP_VERSION = '1.27.34'` → app-cache `birdspot-app-v1.27.34`. Profiel › Over de app toont "Versie 1.27.34 · basis offline beschikbaar". 1.27.33 is als preview uitgerold; de reparatie krijgt daarom een eigen, hoger nummer.
- App-shell network-first (± 3 s), media media-first. Bij activeren worden alleen oude `birdspot-app-*`-caches verwijderd; `birdspot-media` blijft.
- Een bestaande installatie ziet de nieuwe versie na herladen of via de updateknop. Geen wijziging aan cache- of opslagarchitectuur; geen datamigratie.
- **Bewijs 1.27.34 (Chromium, lokaal, 26-11-2026):** `tests/test_rb01_upgrade.py --base 3a03c84` — upgrade 1.27.33 → 1.27.34 op dezelfde origin U1–U9 PASS (waarnemingen, plekken, concept, foto- en audioblob, alleen app-cache v1.27.34 over, mediacache bewaard, offline herstart, schone installatie). Aanvullend lokaal: een via de app bewaard geluidsconcept (`birdspot-sound-drafts`, 28 kB) blijft na de upgrade byte-gelijk, opent als 'Bewaarde sessie geopend.' en is via de nieuwe sluitvraag te verwijderen. CI: workflow `rb02-versie-qa.yml`.
- **Bewijs 1.27.33 (Chromium, lokaal):** `tests/test_rb01_upgrade.py` — upgrade 1.27.32 (`521fba8`) → 1.27.33 op dezelfde origin: waarnemingen (alle herkenningssoorten), plekken, concept, gezien-lijst byte-gelijk; foto- en audioblob en plekkenstore onveranderd; alleen de nieuwe app-cache over, mediacache bewaard; offline herstart met lijst, detail en gidsfoto; schone installatie offline bruikbaar. Bestaande releasegate `tests/test_release_upgrade.py` 5bf6704 (1.14.0) → 1.27.33: RU-01..07 PASS.

## Open releasegates

| Gate | Status |
|---|---|
| CI op de exacte head van PR #367 | zie PR-overdracht (CI-groen is geen release-PASS) |
| Onafhankelijke QA op de nieuwe head | OPEN |
| Beveiligde preview 1.27.33 (`dpl_Hu14Bh8zD121gDFxnZ8qin8FSyus`) | Uitgevoerd door eigenaar; AS-01-melding, daarna gerepareerd |
| Beveiligde preview op exact 1.27.34 (versie zichtbaar, upgrade vanaf de 1.27.33-installatie) | NOT TESTED — apart eigenaarakkoord nodig |
| Samsung-hertest AS-01 (sluiten tijdens opnemen, stoppen en afronden; terug, annuleren) | OPEN |
| Fysiek Android/PWA (Samsung) met TalkBack, GPS, camera, microfoon, ZIP via bestandskiezer | NOT TESTED |
| Echte Merlin-overdracht en BirdNET-model op toestel | NOT TESTED |
| Branchbescherming `main` (RC-B3) | Met beheerdersrechten gelezen op 26-11-2026: `protected=false`, geen regels of rulesets. Eigenaaractie vóór merge |
| Eigenaarbesluit `zet live` / `live` | OPEN |

## Bekende beperkingen

- **M2:** soortkaart → tab Waarnemingen → waarneming openen → sluiten brengt je terug op de gidslijst (2 extra tikken). Bestond al vóór UX-01; geen releaseblokkade.
- Benamingen 'Mijn collectie' / 'Mijn waarnemingen' / 'Bibliotheek' en enkele Engelse koppen in Dagboek en Inzichten.
- BirdNET-model en ONNX Runtime worden extern geladen; offline niet gegarandeerd. Handmatig vastleggen werkt altijd.
- Niet-gepinde audioconcepten (`birdspot-sound-drafts`) zitten niet in de ZIP.
- F3: 140/140 bekeken, 0 volledige F3-PASS; tweede F3-ronde alleen op eigenaarbesluit.

## Terugval en herstel

- **Code:** zolang niet gepubliceerd blijft `main` op `5bf6704` en de openbare review op `0f9f631`. Terugval naar de vorige kandidaat = `3a03c84` (1.27.33, zonder AS-01) of `521fba8` (1.27.32); een teruggezette build krijgt een eigen, hoger versienummer (zie Service worker). Publiceren gaat alleen via gecontroleerde SHA na `zet live`; vastleggen: publicatie-SHA, datum, origin en terugval-SHA.
- **Gegevens:** een code-rollback herstelt geen lokale opslag. Maak vóór een echte update een ZIP-back-up met minstens één foto en controleer die door terug te zetten in een tweede profiel. Een ZIP-import maakt eerst een veiligheidskopie van de huidige gegevens; **Terugzetten** zet die terug.
- **Service worker:** na terugval naar een oudere versie ziet de browser een gewijzigde `sw.js` en activeert die; de mediacache blijft. Een terugvalversie moet een **eigen, hoger** versienummer krijgen (nooit hetzelfde nummer als een eerder uitgerolde build).
- **Tellingen:** een lager soortaantal na update is verwacht (telregel). Per oud record herstelbaar via **Identificatie zelf controleren**; er is niets te herstellen aan de opgeslagen waarnemingen.
