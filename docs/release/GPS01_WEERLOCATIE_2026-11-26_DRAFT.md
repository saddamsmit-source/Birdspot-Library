# GPS-01 — Live GPS voor weer en zon (DRAFT, 26-11-2026)

Status: concept · PR #368 · base `3644487` (PR #367, 1.27.34) · Release **HOLD** · geen deployment, merge of publicatie.

## Aanleiding en eis
Eigenaar, beveiligde Samsung-preview 1.27.34: onder Weercondities stond "Amsterdam (standaardlocatie)".

Nieuwe harde producteis: zolang GPS beschikbaar is en er locatietoestemming is, gebruikt de app de actuele GPS-positie en niet een vaste standaardstad. Dit geldt voor weer en alle functies die de actuele positie nodig hebben. Het geldt niet voor historische waarnemingen, handmatige pins of opgeslagen plekken.

## Bewezen oorzaak (code + lokale Chromium op `3644487`)
`getLocation()` in `src/features/home/view.js`:
- vroeg de positie op met `{ timeout: 5000 }`;
- viel bij **elke** fout terug op Amsterdam (52.3676, 4.9041), ook bij een time-out of geen signaal terwijl toestemming wél verleend was;
- `weatherPlace()` noemde dat altijd "geen locatietoestemming".

Lokale proef met verleende toestemming en een gesimuleerde time-out of geen signaal: "Amsterdam (standaardlocatie) · geen locatietoestemming", een weerverzoek voor Amsterdam, en de zonkaart "52.37°N, 4.90°E".

Verder:
- Zon en weer deden elk een eigen locatieaanvraag (twee keer 5 s).
- Er was geen verversing bij hervatten.
- Elk Home-bezoek deed een nieuw weerverzoek.
- De zonkaart toonde coördinaten.
- De kaartknop 'mijn locatie' faalde stil.

Of de Samsung een time-out kreeg of geen toestemming had voor de preview-origin, is **UNKNOWN**: er is geen toestellog. Beide routes gaven hetzelfde misleidende resultaat.

## Correctie
| Situatie | Nu |
|---|---|
| GPS + toestemming | Actuele positie voor weer en zon, één gedeelde aanvraag (`src/services/location.js`), time-out 15 s, geen hoge nauwkeurigheid, hergebruik ≤ 2 min |
| Hervatten na ≥ 10 min | Nieuwe positie (geen hergebruik) en zo nodig nieuw weer |
| Verplaatst | Ander ± 1 km-vak → nieuw weerverzoek; zelfde vak binnen 15 min → weer uit geheugen |
| Tijdelijke fout (time-out/geen signaal) | Laatst bekende positie (< 24 u), zichtbaar als "Laatst bekende locatie · niet actueel · GPS van hh:mm" |
| Geen toestemming of ingetrokken | Laatst bekende positie wordt vergeten; melding "Birdspot heeft geen toegang tot je locatie…" |
| Geen bruikbare positie | Geen weer voor een verzonnen stad; melding met reden + **GPS opnieuw proberen** / **Kies zelf een plek**; zon: "Zonstijden volgen zodra je locatie bekend is" |
| Zelf gekozen plek | Kaartkiezer met eigen teksten; weer en zon als "Zelf gekozen plek · zelf gekozen, geen GPS". Zodra GPS werkt, gaat GPS voor. |
| Kaart 'mijn locatie' mislukt | Waarschuwing in plaats van stil falen |

Privacy en batterij:
- Geen `watchPosition`, geen achtergrondlocatie, geen externe overdracht behalve het bestaande weerverzoek (nu met afgeronde coördinaten).
- Opgeslagen posities alleen op het toestel, afgerond op 2 decimalen (± 1 km).
- Weer en zon tonen geen coördinaten.

Ongewijzigd: waarnemingen (R05 auto-GPS, handmatige pins), geluidssessie, opgeslagen plekken, cache-architectuur en opslag. Wel toegevoegd: `src/services/location.js` in de app-shell van `sw.js`, nodig voor offline starten. Versie blijft 1.27.34; een nieuwe preview vraagt een hoger nummer (eigenaarbesluit).

## Bewijs
| Laag | Status |
|---|---|
| Code | VERIFIED: `location.js` (nieuw), `home/view.js`, `weatherFormat.js`, `pinPicker.js` (optionele teksten), `map/view.js` (melding), `dashboard.css`, `sw.js` (app-shell) |
| Lokale browser | VERIFIED: `tests/test_gps01_weerlocatie.py` G1–G14. G3/G4 zijn simulatie; Playwright-geolocatie is een vaste testpositie. |
| Tegenproef | VERIFIED: G1, G2 en G9 falen op `3644487` |
| CI | workflow `gps01-weerlocatie-qa.yml`, inclusief tegenproef |
| Beveiligde preview / Samsung (echte GPS, toestemmingsprompt, hervatten) | NOT TESTED |

Bewuste testwijzigingen (eigenaareis vervangt WEE-01 C3):
- `test_fot_wee_ux.py` C3;
- `test_fot_wee_units.mjs`;
- `test_ux03c_afwerking.py` en `test_cinematic_wetland.py` krijgen een vaste testpositie met toestemming.

Regressievangst: `test_r2b_places_env_zip.py` Z5 (offline na herstel) faalde eerst. Oorzaak: de nieuwe module ontbrak in de app-shell. Hersteld; G14 bewaakt dit voortaan voor de hele modulegraaf.

## Integratie 1.27.35 · 26 november 2026

[Concept-PR #370](https://github.com/saddamsmit-source/Birdspot-Library/pull/370), basis `f857bfda41b4b2f1134e7dd1dd407b606e0b909a`. De inhoud hierboven beschrijft GPS-01 op #368.

- G15 toont dat een handmatig gekozen plaats bij volle opslag voor de sessie beschikbaar blijft voor weer en zon. De UI vermeldt tijdens die sessie dat de plek tijdelijk is.
- G16 toont dat kies/annuleer en GPS-herstel werken als Open-Meteo onbereikbaar is en GPS ontbreekt. Beide tests falen op #368 en slagen op de geïntegreerde kandidaat.
- De kaartkiezer gebruikt bij online gebruik externe kaarttegels. Het bestaande Open-Meteo-verzoek blijft afgerond op twee decimalen.
- De lokale Chromium-upgrade vanaf het 1.27.34-codecheckpoint slaagt 9/9. De geladen bytes van Home, locatie, vergelijkingen en soortkennis zijn gecontroleerd na de updateknop en bij offline heropening. Samsung en livebewijs staan open. Release HOLD.
