# Birdspot UX-02 — waarnemingen zoeken, terugvinden en beheren (DRAFT)

Status: KLAAR VOOR ONAFHANKELIJKE QA · eigenaarakkoord 25-11-2026 (UX-02 ontwikkelen en testen) · release HOLD
Branch `claude/birdspot-ux02-waarnemingen-20261125` · PR #362 (concept) · base PR #361 `807d8f0` (UX-01)
Checkpoints: UX-02A `ecf53ab` · UX-02B `06339f5` · UX-02C `e713085` · dossier = head van deze PR (SHA in de overdracht)

Buiten scope en niet gedaan: UX-03, F3-soortenronde, soortinformatie, mediarechten, verificatienormen, backend,
betaalde dienst, Vercel-deployments, `.vercelignore`, normdocumenten, opschoning/retentie, merge, publicatie, livegang.

## UX-02A — zoeken en filteren

| Onderdeel | Uitvoering |
|---|---|
| Eén zoeklogica | `sightingQuery.js` (pure functies). De globale zoekfunctie gebruikt nu dezelfde normalisatie en zoektermen per waarneming (`normalizeSearch`, `sightingTerms`); geen tweede index of tegenstrijdige regels. |
| Zoeken | NL, Engelse en wetenschappelijke soortnaam; gekoppelde plek en plaatsnaam; datum (`2026-06-12`, `12-06-2026`, `12 juni 2026`, `jun 2026`, jaar); periodewoorden: vandaag, gisteren, deze/vorige week, deze/vorige maand, dit/vorig jaar. Alle woorden moeten passen. Getallen van 1–2 cijfers alleen als heel getal ("Plek 2" vindt niet elke datum met een 2). |
| Filters | Knop **Filters** met vier groepen: Waarneming (Gezien, Gehoord, Gezien en gehoord) · Media (Met foto of video, Met geluid) · Zekerheid (Zeker, Waarschijnlijk, Mogelijk) · Herkenning (Eigen herkenning, BirdNET, Merlin, Niet vastgelegd). Binnen een groep OF, tussen groepen EN. Direct effect, geen bevestigingsstap. |
| Overzicht | Actieve zoekopdracht en filters als verwijderbare chips, aantal op de filterknop, "x van y waarnemingen" in `role=status`. Lege uitkomst: "Geen waarnemingen gevonden" + **Wis filters**. |
| Verificatie | Filter op opgeslagen bewijsvelden. 'Zeker' toont geen niet zelf gecontroleerde BirdNET- of Merlin-suggestie, ook niet als zekerheid tegenstrijdig op 'zeker' staat. Oude records met een BirdNET-suggestie maar bron 'self' (controle niet vastgelegd) en records zonder bron vallen onder **Niet vastgelegd**, niet onder Eigen herkenning. Data ongewijzigd. |
| Weergavestand | Zoekopdracht, filters en open/dicht van het paneel alleen in `sessionStorage` (`birdspot-sightings-view`): niet in waarnemingen, CSV of ZIP. |

Bewijs: `test_ux02_query.mjs` 47 asserties PASS (incl. 5000 records in ±17 ms); `test_ux02a_zoeken.py` Z1–Z11 **11/11 PASS**
(zoeken, combineren, verificatie, media, leeg, oude records, 1500 records, 320/390/430, toetsenbord/schermlezer,
donker thema, globale zoekfunctie).

## UX-02B — bekijken en beheren

| Onderdeel | Uitvoering |
|---|---|
| Kaartje | Soort (+aantal), datum, plek (benoemd · *automatische naam* · *Alleen GPS*), waarnemingswijze, zekerheid of suggestiestatus, aantal foto's/video's en opnamen. Zonder foto één neutraal lijnicoon (geen soortemoji die op een soortafbeelding lijkt). Kaartje bereikbaar met toetsenbord (Enter/spatie). |
| Kleur | Informatie blauw (waarnemingswijze), onzekerheid en ongecontroleerde suggestie amber, zeker groen; altijd met tekst. |
| Detail | Samenvatting bovenaan: wanneer, waar (met soort plek), hoe zeker (met suggestiestatus), welk bewijs. Kop en randen opgemaakt (ontbraken ook op `b0acce0`); sluitknop met icoon en tekst, 44 px hoog. Dubbele Zekerheid/Locatie-velden weg; GPS-pin apart. |
| Terugnavigatie | Na bekijken, bewerken, opslaan, annuleren en verwijderen blijven zoekopdracht, filters en scrollpositie; focus terug op het bewerkte kaartje. Via een ander scherm en browser-terug komt alles terug (`app.js` zet de bewaarde scrollpositie terug nadat een async scherm is opgebouwd). |
| Gegevensbehoud | Bestaande bewerkroute ongewijzigd: foto's, opnamen, pin, plek, verificatie en BirdNET-suggestiedata blijven (W4). |

Bewijs: `test_ux02b_beheer.py` W1–W11 **11/11 PASS**.

## UX-02C — bereikbaarheid en vogelplekken

| Ingang | Uitvoering (geen zesde tab) |
|---|---|
| Home | Link in sectie Mijn waarnemingen heet nu **Alle waarnemingen** (was "Alles"). |
| Kaart | Bestaande lijstknop toont **Lijst** naast het icoon vanaf 360 px; op 320 px alleen icoon zodat het zoekveld leesbaar blijft (schermlezerlabel blijft). |
| Soortkaart | Tab Mijn: **Bekijk in Mijn waarnemingen (n)** opent de lijst met soortfilter-chip. |
| Profiel | Knop **Mijn waarnemingen** onder het overzicht. |

| Plek | Weergave |
|---|---|
| Zelf benoemd | Naam |
| Automatisch ("Plek 3") | Naam + *automatische naam* + **Geef een naam** (detail) |
| Alleen GPS-coördinaten | *Alleen GPS* / "Alleen GPS-coördinaten" + coördinaten |
| Alleen plaatsnaam | Naam + "zonder pin" |
| Bestaande gekoppelde plek in het formulier | "Bekende plek: Plek 3 (automatische naam)" |

Benoemen gebruikt het bestaande `renamePlace`: alleen naam en `nameOrigin` van die plek wijzigen; coördinaten, koppelingen
en waarnemingen niet. Nieuwe plekken krijgen `nameOrigin` (`auto` zonder plaatsnaam, anders `user`). Bestaande plekken
krijgen het veld niet; hun herkomst wordt alleen bij weergave afgeleid uit de naam (`Plek n`, `Naamloze plek`).
Het formulier meldt vooraf dat een nieuwe plek zonder Locatie een automatische naam krijgt.

Let op: een waarneming met alleen GPS krijgt bij het eerste kaartbezoek een automatische plek via de bestaande
migratie uit ronde 2B. Dat gedrag is niet gewijzigd; daarna is die plek als *automatische naam* te benoemen.

Bewijs: `test_ux02c_bereik_plekken.py` P1–P12 **12/12 PASS**.

## Regressie (lokaal, Chromium)

PASS: ux01a/b/c, pilot_offline_new_sighting (opslaan/heropenen, offline), r4_merlin, quick_add_merlin, r05_gps_race,
sighting_merlin_pins, r2b_places_env_zip, r2b_qa_herstel, r2b_crashherstel, map_k1k2/k4/k6, signature, signature_phase2/3,
explorer_species_cluster, mobile_editorial, profile_k7, app_search, r3_audio, r3_vervolg, r3_leesfout, r3_restpunten,
r3_zip_herstel, android_media_preflight, pilot_cross_profile_zip, profile_backup, release_backup_roundtrip,
navigation_recovery, **fot_wee_ux (fotozoom/swipe + weerkaart)**; node 59/60.

Vooraf bestaand en ongewijzigd: `test_photo_feedback.mjs` (pakket `sharp` ontbreekt), feature_reconciliation F06/F07
(sandbox zonder BirdNET-model/kaarttegels), `test_phase_d.py` (verouderd, niet in CI).

## Bewijslagen

| Laag | Status |
|---|---|
| Code | VERIFIED (lokale tests hierboven) |
| CI | zie PR #362 (workflow `ux02-waarnemingen-qa.yml` + bestaande workflows) |
| Lokale browser | VERIFIED — Chromium 320/390/430, licht en donker |
| Beveiligde Vercel-preview | NOT TESTED — geen deployment (opdracht: geen onnodige deployments; Vercel-team geeft Claude 403) |
| Fysiek Android-toestel | NOT TESTED |

## Risico's

1. 'Zeker' in het filter is strenger dan de bestaande telregel: oude BirdNET-suggesties met bron 'self' tellen nog wel mee in lijsten/statistiek (UX-01B-besluit: niet stil omzetten). Bewust zichtbaar als "BirdNET · controle onbekend".
2. Weergavestand per sessie: een PWA die lang openblijft, toont de laatste filters. Altijd zichtbaar als chips met **Wis filters**.
3. Grote lijsten worden volledig opgebouwd (1500 records ±1,3 s eerste weergave lokaal); virtualisatie is niet gebouwd.
4. Kop van de soortkiezer (titel/Sluiten tegen de rand, ook op `b0acce0`) valt buiten UX-02 en is niet aangepast.
