# Birdspot UX-01 — veilig en snel waarnemingen vastleggen (DRAFT)

Status: KLAAR VOOR ONAFHANKELIJKE QA · eigenaarakkoord 25-11-2026 10:10 (alleen UX-01) · release HOLD
Branch `claude/birdspot-ux01-vastleggen-20261125` · PR #361 (concept) · base `b0acce0` (PR #360)
Checkpoints: UX-01A `13f05cc` · UX-01B `7de9036` · UX-01C = head van deze PR (SHA in de PR-overdracht)

Buiten scope en niet gedaan: UX-02/UX-03, F3-soortenronde, soortteksten, nieuwe foto's/geluid, backend of betaalde
dienst, Vercel-deployments, `.vercelignore`, normdocumenten, merge, publicatie, livegang.

## UX-01A — geen dataverlies

| Onderdeel | Uitvoering |
|---|---|
| Concept | `sightingDraft.js`: eigen sleutel `birdspot-sighting-drafts`, één concept per doel (`new`, `edit:<id>`). Niet in waarnemingen, lijst, CSV of ZIP (`DATA_KEYS` ongewijzigd). |
| Opslagmoment | 400 ms na elke invoer, direct bij `pagehide`/`visibilitychange`, en na een opslagfout. Automatische GPS telt niet als wijziging. |
| Sluitroutes | Annuleer, tik ernaast, greep, Escape, browser-/Android-terug → één `requestClose`. Leeg of ongewijzigd: direct dicht. Gewijzigd: **Verder bewerken** (veilige standaard; Escape/terug kiezen deze) · **Concept bewaren en sluiten** · **Wijzigingen verwerpen**. |
| Hervatten | Bij openen: *Concept hervatten* · *Concept verwijderen* · *Sluiten, concept bewaren*. Hervatten stopt lopende automatische GPS. |
| Conflicten | Bewerkconcept onthoudt `updatedAt`; is de waarneming sindsdien gewijzigd, dan "Verouderd concept": nooit toegepast. Hervat bewerkconcept wordt bij opslaan opnieuw tegen `updatedAt` gecontroleerd. |
| Media | Nieuw gekozen foto's/opnamen gaan **niet** mee in een concept. Dat staat in de dialoog, de toast, het hervataanbod en na hervatten. Bestaande media en records blijven onaangeroerd tot opslaan. |

Bewijs (lokaal Chromium, `test_ux01a_concept.py`): D1 tik ernaast · D2 Escape · D3 terug · D4 herladen (concept niet in
opslag/lijst/export) · D5 leeg en alleen-auto-GPS sluiten · D6 verwerpen · D7 bewerken→annuleren origineel identiek,
bewerkconcept, verouderd concept · D8 opslagfout · D9 offline · D10 media eerlijk — **10/10 PASS**.
Checkpoint UX-01A: geen open dataverlies- of herstelblokkade.

## UX-01B — betrouwbare BirdNET-verificatie

Analyse vooraf (b0acce0): een gekozen BirdNET-kandidaat werd opgeslagen als `identificationSource: 'self'`,
`certainty: 'certain'` plus `soundSuggestion` — dus als *eigen herkenning, zeker*. Bewezen met een probe: oud
`self/certain`, nieuw `birdnet/suggested/possible`.

| Onderdeel | Uitvoering |
|---|---|
| Model | Bron `birdnet` + apart veld `birdnetVerification` (`suggested`/`checked`). `normalizeEvidence` geeft het veld altijd terug (samenvoegen wist een oude controle). BirdNET vereist gehoord. |
| Standaard | Gekozen BirdNET-soort = suggestie, **Mogelijk**. Alleen het expliciete vak *Zelf gecontroleerd* maakt Zeker. Merlin heeft voorrang; het BirdNET-vak is dan verborgen. Zelf toegevoegde soorten blijven eigen herkenning. |
| Labels | `BirdNET · suggestie` · `Zelf gecontroleerd` · `Merlin · suggestie` · `Merlin · zelf gecontroleerd` · `Eigen herkenning`. Overal de zin "Eigen controle; geen onafhankelijke wetenschappelijke verificatie." Geen vinkje of "bevestigd". |
| Paden | geluidssessie, bewerken (bron + controlevak; suggestie + Zeker geweigerd), lijst, detail, soortkaart/kaart (via `sourceLabel`), telregel, CSV, ZIP (velden blijven via `migrateSighting`), concepten. |
| Oude data | Niet omgezet. `self` + `soundSuggestion` toont in detail en formulier dat er een BirdNET-suggestie bewaard is en dat eigen controle toen niet is vastgelegd; telregel ongewijzigd. |
| Tegenstrijdig | suggestie + Zeker: zichtbaar gemeld en niet meegeteld; BirdNET bij alleen gezien: niet opslaanbaar tot de gebruiker kiest. Niets stil gewijzigd. |

Bewijs: `test_ux01b_birdnet.mjs` 32 asserties PASS, **faalt op b0acce0** (bron `birdnet` bestaat daar niet);
`test_ux01b_birdnet.py` N1–N10 **10/10 PASS** (zonder/met controle, meerdere kandidaten, geen suggestie, Merlin,
bewerken, oude records, ZIP export→import, offline, tegenstrijdig).

## UX-01C — sneller meerdere vogels

| Onderdeel | Uitvoering |
|---|---|
| Na opslaan | Niet-modale melding bovenaan: "<soort> opgeslagen" · **Bekijk waarneming** · **Nog één toevoegen** · sluiten. Verdwijnt na 8 s (langer alleen bij toetsenbordfocus) en bij elke tik elders; ligt onder elke sheet. Bewerken houdt de bestaande toast. |
| Overname | Alleen datum en plek (pin, plek-ID, plaatsnaam), zichtbaar: "Overgenomen van vorige waarneming: datum · plek" met **Wis plek**. Nooit soort, tijd, aantal, zekerheid, bron of media. Alleen binnen 30 min na opslaan. |
| Locatie | Overgenomen plek wint: geen automatische GPS. Na *Wis plek* ook geen automatische GPS (bewuste keuze; GPS-knop blijft). |
| Recente soorten | Tot 6 chips bovenaan de bestaande kiezer, nieuwste eerst; verborgen tijdens zoeken. Zoeken NL/EN/wetenschappelijk ongewijzigd. |
| Rust | Geen nieuwe velden in het formulier; extra opties blijven achter *Meer details*. |

Bewijs: `test_ux01c_vervolg.py` V1–V12 **12/12 PASS** (1 en 3 vogels, recent, zelfde plek, andere plek, geen GPS,
terug/annuleren/hervatten, dubbelklik, trage opslag, offline, 320/390/430, melding blokkeert niets).

CI-bevinding en herstel (`43daf2a`): `r3_zip_herstel` Z2 faalde omdat de melding de kaartknop *Waarnemingen*
afdekte en bij muisaanwijzer bleef staan. Herstel: tik elders sluit de melding, pauze alleen bij toetsenbordfocus,
tekstvlak laat tikken door (V12). Daarna lokaal Z1–Z6 PASS.

### Meting voor/na (zelfde meetmethode als UX-00, lokaal Chromium 390 px, vers profiel)

| Scenario | b0acce0 handelingen / schermwissels | UX-01 handelingen / schermwissels |
|---|---|---|
| 1 vogel | 6 / 3 | 6 / 3 (ongewijzigd) |
| 3 vogels, zelfde plek | 18 / 9 | **16 / 7** |
| 3 vogels, eerder gekozen soorten | 18 / 9 | **13 / 7** |

Winst komt uit *Nog één toevoegen* (vervangt + en keuze) en recente soorten (vervangt typen en kiezen in de lijst).

## Regressie

Lokaal PASS (na laatste wijziging opnieuw: ux01a/b/c, r3_audio, r3_zip_herstel, r2b_places_env_zip, navigation_recovery): navigation_recovery, r3_audio (12/12), r3_leesfout, r3_vervolg, r3_restpunten, r3_zip_herstel,
r4_merlin, quick_add_merlin, sighting_merlin_pins, r05_gps_race, r2b_qa_herstel, r2b_places_env_zip,
pilot_offline_new_sighting, pilot_cross_profile_zip, android_media_preflight, map_k1k2, map_k4, map_k6,
mobile_editorial, explorer_species_cluster, profile_k7, species_groups_az, app_search, signature_phase2,
**fot_wee_ux (FOT zoom/swipe + weerkaart PR #360)**; node 58/59.

Bestaande testaanpassingen (bedoelde gedragswijziging, asserties ongewijzigd): `test_r3_audio.py` R3-05 en
`test_navigation_recovery.py` krijgen een expliciete stap *Wijzigingen verwerpen* na Annuleer/terug op een gewijzigd
formulier.

Vooraf bestaand, ook op b0acce0: feature_reconciliation F06/F07 (geen BirdNET-model/kaarttegels in de sandbox),
`test_phase_d.py` (verouderde FAB-route, niet in CI), `test_photo_feedback.mjs` (pakket `sharp` ontbreekt).
Waarneming buiten scope: kop van de soortkiezer (titel en Sluiten) staat links tegen de rand, ook op b0acce0.

## Bewijslagen

| Laag | Status |
|---|---|
| Code | VERIFIED (lokale tests hierboven) |
| CI | zie PR #361 (workflow `ux01-vastleggen-qa.yml`) |
| Lokale browser | VERIFIED — Chromium 320/390/430 |
| Vercel-preview | NOT TESTED — bewust geen deployment (opdracht), Vercel-team geeft Claude 403 |
| Fysiek toestel | NOT TESTED — Android-terugknop alleen via browser-terug gesimuleerd |

## Risico's

1. Concepten in localStorage: bij een volle opslag meldt de app dat bewaren mislukte en blijft het formulier open; niet op toestel getest.
2. Nieuw gekozen media gaan niet mee in een concept (bewuste keuze; eerlijk gemeld). Media in concepten vergt IndexedDB-opslag van blobs: apart besluit.
3. De melding na opslaan ligt bovenaan, over de paginakop; ze verdwijnt na 8 s of met ×.
