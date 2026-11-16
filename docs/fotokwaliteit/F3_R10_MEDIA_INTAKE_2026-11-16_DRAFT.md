# Birdspot F3-R10-media — media-import: oorzaak, gekozen route en eerste aanvulling

**Datum:** 16 november 2026 · **Status:** DRAFT / PARTIALLY TESTED  
**Branch:** `qa/birdspot-f3-r10-media-putter-sijs-kneu-20261116` · **PR:** #267 (concept) · **Base:** PR #266 @ `6e6d14ea` (niet gewijzigd)  
**Schrijver:** Claude, plus door Claude gestarte workflowcommits van `github-actions[bot]` op deze branch.

## 1. Waarom de import vanuit de Claude-omgeving 403 gaf

| Laag | Bevinding | Bewijs | Status |
|---|---|---|---|
| **Claude-runtime (egress-policy)** | Uitgaand verkeer gaat via een policy-proxy met een allowlist (o.a. GitHub en pakketregisters). `commons.wikimedia.org`, `upload.wikimedia.org`, `xeno-canto.org` staan er niet op. De proxy weigert de CONNECT zelf; de verbinding bereikt Wikimedia nooit. | Proxystatus 16-11 14:41: `connect_rejected`, *gateway answered 403 to CONNECT*, host `commons.wikimedia.org:443`. README van de proxy: 403 = host niet toegestaan, niet omzeilen. | **VERIFIED (oorzaak)** |
| **Externe bron (Wikimedia)** | Geen blokkade waargenomen. Commons vraagt een herkenbare User-Agent, beleefde verzoeken en respecteert `maxlag`; dat is ingebouwd. | Intake in GitHub Actions: zoeken en downloaden geslaagd (runs op `04b80277`, `328294aa`). | VERIFIED (route werkt) |
| **Toegangsrechten (GitHub)** | Pushen en PR's werken. `workflow_dispatch` via API kan niet: de workflow staat niet op de standaardbranch (404), en die wordt niet gewijzigd. Daarom start de intake via een verzoekbestand (push-trigger). | API 404 op dispatch; push-trigger geslaagd. | VERIFIED |
| **Xeno-canto rechtstreeks** | Niet gebruikt: veel opnamen zijn CC BY-NC(-SA) (niet commercieel), en de huidige API vraagt een sleutel. Xeno-canto-opnamen die op Commons staan, hebben daar een vrije licentie. | Bronprotocol audio §1; kandidatenlijst. | NOT TESTED (bewust) |

Geen blokkade is omzeild: de Claude-runtime haalt nog steeds niets van Wikimedia op. Het ophalen gebeurt op een GitHub-runner, onder de voorwaarden van Commons.

## 2. Gekozen route: Commons-intake in GitHub Actions

- **Tool:** `tools/media/commons_intake.py` (gebaseerd op de bestaande verificatie-importscripts zoals `import_verified_sp018_juvenile.py`).
- **Workflow:** `.github/workflows/media-intake.yml`, alleen op `qa/birdspot-f3-*-media-*`. `main`, `preview/*` en `release/*` worden geweigerd. Gestart door `tools/media/requests/current.json` te pushen. Workflowcommits starten geen nieuwe run.
- **Twee stappen met een reviewmoment ertussen:**
  1. *discover* — zoekt per rol, filtert licenties (CC0, publiek domein, CC BY, CC BY-SA; **NC en ND uitgesloten**), schrijft metadata en kleine voorvertoningen naar `docs/media-intake/2026-11-16/`. Kandidaten zijn geen gidsmedia.
  2. *import* — alleen bestanden uit een selectiemanifest in Git, met vastgepinde SHA-1 van het origineel en verwachte licentie. Opnieuw gecontroleerd tijdens import; weigert overschrijven; foto naar WebP ≤1400 px zonder EXIF/GPS/XMP; audio naar mono MP3 met fragmentgrenzen en verwijderde metadata. Registratie met auteur, licentie, licentie-URL, bronpagina en origineel-SHA-1, daarna `tools/species/build.py`.
- **Bewaking:** `tests/test_media_intake_r10.mjs` (bytes, licentie, credits, metadata, zichtbaar op de kaart; mutatie met NC-licentie wordt gevangen) en `tests/test_media_intake_policy.py` (licentiebeleid, User-Agent, branchbewaking).

## 3. Uitgevoerd: kleinste aanvulling (Kneu)

| Rol | Bestand | Origineel (Commons) | Licentie | Controle |
|---|---|---|---|---|
| Vrouwtje | `/assets/species/plumage/sp039-adult_f.webp` | *Linnet (Linaria cannabina) female.jpg* — Charles J. Sharp, Otmoor RSPB Reserve | CC BY-SA 4.0 | SHA-1 `2622240c…` gelijk bij import; visueel: gestreept, grijze snavel, geen rood |
| Juveniel | `/assets/species/plumage/sp039-juv.webp` | *Linnet Linaria cannabina, juvenile, Prees Heath, Shropshire 1.jpg* — gailhampshire | CC BY 2.0 | SHA-1 `2bd25240…` gelijk; visueel: vers gestreept kleed, geen rood |

Geslacht en leeftijd volgen het fotograaflabel en de zichtbare kenmerken (PARTIALLY TESTED). Bestaande Kneu-foto's zijn behouden. LK-009 (Frater) en LK-011 (barmsijs) blijven fotoloos: van Frater en barmsijzen is nog geen gecontroleerde foto geregistreerd.

## 4. Herstelplan voor de overige media (nog niet uitgevoerd)

| Punt | Kandidaat uit discover | Voorstel | Wat nog nodig is |
|---|---|---|---|
| Putter vluchtfoto | `sp037_flight_03`: *Ist es der Niedernhaller Distelfink…* (Holger Uwe Schmitt, CC BY-SA 4.0), vrije vlucht | Als **extra** vluchtfoto toevoegen; bestaande behouden tot tweede oordeel | Selectie pinnen, import, inventarisregel `vlucht`/`airborne:true` |
| Sijs vluchtfoto | Bestaande foto: Commons-beschrijving zegt letterlijk *"comes in to land"* | Volgens §3.3 hoort landen niet in "In vlucht"; voorstel: naar `retired` met reden | Eigenaarbevestiging (bestaande foto uit beeld halen). Geen bruikbare vervanger: overige kandidaten waren dode vogels |
| Kneu vluchtfoto | Alleen silhouetten of zittende vogels | Bestaande voorwaardelijke foto laten staan; §3.3 (kleine vogels) maakt vlucht niet verplicht | Later gericht zoeken |
| Putter zang en roep | Zang XC489911 (Hannu Varkki, CC BY-SA 4.0, *Type: song*); roep XC503634 (Jochem Verweij, CC BY-SA 4.0, *calls*) | Import als `REGISTERED_UNVERIFIED` | Akoestische controle door een mens (soort, rol, stoorgeluid); dat kan Claude niet |
| Sijs zang en roep | Roep XC539301 (Benoît Van Hecke, CC BY-SA 4.0, *Type: call*); zang *Carduelis spinus.ogg* (Arkhipov, CC BY-SA 3.0) | Idem | Idem |
| Kneu zang en roep | Zang *Carduelis cannabina singing.flac* (Nefronus, CC BY-SA 4.0, 8,5 s); **geen** roepkandidaat | Zang importeren; roep MISSING laten | Gericht zoeken naar roep; akoestische controle |

Alle audiovoorstellen gaan pas naar de app na een menselijke luistercontrole of een expliciet eigenaarbesluit om ze als `REGISTERED_UNVERIFIED` met zichtbare onzekerheid te tonen. Geen gesimuleerde of verkeerd gelabelde opname.

## 5. Bewijs en grenzen

- Zoek- en importruns in GitHub Actions: VERIFIED. Kandidaten en manifesten staan in Git.
- Lokale tests (`test_media_intake_r10.mjs`, beleidstest, vluchtcontrole, rebaseline, R09/R10, soortdetail, soortaudit- en kennisbrowsertests): PASS.
- Rechten: Commons-licentie en origineel-SHA-1 bij import gecontroleerd; geen juridische certificering.
- Fysiek toestel, offline/PWA-update, productie: NOT TESTED. Geen merge of livegang.
