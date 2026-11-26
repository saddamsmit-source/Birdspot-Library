# AS-01 — Audio-sluitbug geluidsopnamemenu (DRAFT, 26-11-2026)

Status: concept · PR #366 · base `3a03c84` (PR #365, 1.27.33) · Release **HOLD** · geen deployment, merge of publicatie.

## Aanleiding
Eigenaar op Samsung (beveiligde preview `dpl_Hu14Bh8zD121gDFxnZ8qin8FSyus`, `3a03c84`): "de app liep vast bij opname menu die ik wilde sluiten" (comment 7188449804 op #365).

## Reproductie (AS-01A, lokale Chromium, nep-microfoon + echte MediaRecorder)
1. Home → + → Geluid herkennen → Start opname.
2. Scrol een stukje naar beneden (of gebruik "Terug naar keuzes" onderaan).
3. Tik Sluiten, Android-/browser-terug, Escape, buiten het menu of Terug naar keuzes.

Verwacht: duidelijke keuze om te stoppen en daarna te bewaren of te verwijderen.
Werkelijk op `3a03c84`: elke sluitroute wordt geblokkeerd. De enige reactie is de statusregel "Stop eerst de opname met de knop onderin." bovenaan het blad. Die staat buiten beeld zodra je gescrold bent, en bij "Terug naar keuzes" altijd. Voor de gebruiker gebeurt er niets, wat oogt als vastlopen. Reproductie 10/10 routes.

Daarnaast, als **simulatie** (stub):
- Blijft `getUserMedia` openstaan, of blijft het `stop`-event van MediaRecorder uit, dan zijn alle sluitroutes permanent geblokkeerd.
- De opnameknop is in die toestand uitgeschakeld, terwijl de tekst zegt dat je met die knop moet stoppen.
- Bij een ontbrekend stop-event blijft ook elke volgende geluidssessie inert tot herladen.

Klein: na "Verder bewerken" ging de focus naar een uitgeschakelde knop, waardoor de focus verdween en Escape niet meer werkte.

Oorzaak:
- Bewezen in code en browser: `requestExit()` blokkeerde tijdens `recording`/`starting`/`finishing` met alleen een statusregel en geen zichtbare keuze. Er was geen uitweg bij een hangende microfoonstart of afronding.
- Wat er precies op de Samsung gebeurde, is **UNKNOWN**: er is geen toestellog.

Ernst: HOOG. Het raakt de kernroute geluid, zonder zichtbare uitweg.

## Reparatie (AS-01B)

| Toestand | Nieuw gedrag bij sluiten (alle routes) |
|---|---|
| Microfoon wordt gestart | Sluiten mag direct; een late microfoon wordt meteen vrijgegeven (niets opgenomen) |
| Opname loopt | Zichtbare vraag "De opname loopt nog" met **Stop opname** / **Doorgaan met opnemen**; opname loopt door tot de gebruiker kiest |
| Afronden | "Opname wordt afgerond…", daarna automatisch de keuze |
| Opname gestopt | Ongewijzigd: Verder bewerken / Bewaar concept / Verwijder opname |
| Stop-event blijft uit | Na 5 s rondt Birdspot zelf af. Met geluid volgt de keuze. Zonder geluid: "De opname kon niet worden afgerond. Probeer het opnieuw." De knop is dan weer actief en sluiten mag. Komt het echte event later alsnog met geluid, dan wordt die opname alsnog getoond. |

- De sluitvraag valt niet achter de vaste kop of de vaste opnamebalk (`scroll-margin`).
- Na stoppen en na "Verder bewerken" blijft de focus in het menu.
- Na sluiten blijven er geen actieve microfoon, MediaRecorder, timer of wake-lock over.

Ongewijzigd:
- geen automatische conceptopslag;
- geen BirdNET-verificatie;
- geen wijziging aan bestaande waarnemingen;
- geen backend.

Versie blijft `1.27.33`. Een versieverhoging bij een volgende preview of release is een eigenaarbesluit.

## Bewijs

| Laag | Status |
|---|---|
| Code | VERIFIED: `soundSession.js`, `sightings.css` |
| Lokale browser | VERIFIED: `tests/test_as01_audiosluiten.py` T1–T8 (8/8, 3x stabiel). T3–T5 zijn simulatie. |
| Tegenproef | VERIFIED: dezelfde test faalt op `3a03c84` bij T1 |
| CI | `as01-audiosluiten-qa.yml`, inclusief tegenproef |
| Beveiligde preview | NOT TESTED (geen deployment) |
| Fysieke Samsung, microfoon, BirdNET, Merlin op toestel | NOT TESTED |

Regressie lokaal PASS:
- geluid: quick_add_merlin (bewuste testaanpassing: sluitvraag i.p.v. statusregel), owner_sound_choices, r4_merlin, ux01b_birdnet (py en mjs), r2b_qa_herstel;
- UX-01/02/03/03R: alle suites;
- rb01_upgrade 9/9, release_upgrade, app_search, startup_splash, ux02_query.

## Open risico's
- Echte oorzaak op de Samsung is UNKNOWN. Eigenaar-hertest op het toestel is nodig.
- De watchdog van 5 s is niet op een toestel gemeten.
- De versie is gelijk aan de vorige preview, dus een hertest moet de SHA controleren.
