# Birdspot — overdracht soortaudit mijlpaal 1 aan ChatGPT (onafhankelijke review)

Versie 1.0 · 10-11-2026 · schrijver: Claude · reviewer: ChatGPT · eigenaar: Kevin Smit

## Stand

| | |
|---|---|
| PR | #127 `feat/fotokwaliteit-collectie` → base `feat/kennisbaseline-proef` (#126) → #124 → #122 |
| Te reviewen SHA | `71dbd95` (code, data, tests); docs-commit erboven bevat tracker en bewijs |
| Actieve schrijver | Claude tot deze overdracht; daarna niemand op deze branch. Correcties op een eigen branch/PR |
| Merge / live | Niet gevraagd, niet gedaan. Geen nieuwe media toegevoegd |

## Wat er gedaan is

1. **Vluchtcontrole collectiebreed** (`c6348c8`): alle 144 als vlucht gemarkeerde foto's beoordeeld in klassen vlucht/bidden/zweven/landen/opvliegen/vleugels-strekken/grond. In mijlpaal 1 aangescherpt: Tjiftjaf (fladderend tussen riet) ook uit de vluchtrol. Totaal 15 uit de vluchtrol + 7 gearchiveerd = 22 afgekeurd. Register: `docs/fotokwaliteit/vluchtcontrole.json` (met historie).
2. **Eén vergelijkingsplek** (`e6d5f2c`): "Gelijkende soorten" opgegaan in "Lijkt op"; geen vergelijkingsdata verwijderd.
3. **Soortaudit M1** (`71dbd95`): Houtduif, Holenduif, Turkse Tortel + Ekster, Fitis, Tjiftjaf, Boomkruiper, Torenvalk, Zilvermeeuw, Sperwer, Buizerd. 31 foto's, elk met rol, beeldinhoud, geslacht/leeftijd + bewijs, kwaliteit en uitslag (`docs/fotokwaliteit/soortaudit/M1.json`). Overzicht: `docs/fotokwaliteit/SOORTAUDIT_TRACKER.md`.
4. **Kennisprofielen** Houtduif, Holenduif, Turkse Tortel toegevoegd (nu 11). Onderbouwde datacorrecties doorgevoerd (zie tracker per soort).

## Bewijsstatus

| Laag | Status |
|---|---|
| Visuele beoordeling per foto (Claude) | 10 VERIFIED, 1 PARTIALLY TESTED (Torenvalk: geslacht vluchtfoto alleen visueel) |
| Technisch (laden, volgorde, offline-bron, beoordeling = kaart) | VERIFIED 11/11 |
| Rechten (bronaudit 09-11 of geverifieerde import) | VERIFIED 31/31 foto's |
| Browser 390 px (Chromium, SAB-01..08) | VERIFIED 11/11 op `71dbd95` |
| Offline (precache + decode, test_guide_photos) | VERIFIED lokaal (390 foto's); eerste run 1× splash-time-out, herhaling groen |
| Kennisprofielen | PARTIALLY TESTED (alle 11 hebben open punten) |
| Onafhankelijke review | **NOT TESTED** — dit is de vraag |
| Fysiek toestel / productie | NOT TESTED |
| Eindoordeel per soort | 11 × PARTIALLY TESTED (geen enkele soort heeft een volledige foto-set) |
| Overige 123 fotosoorten | NOT TESTED (renderen technisch, maar niet foto voor foto opnieuw beoordeeld) |

## Vragen aan ChatGPT

**Foto's** (gebruik de screenshots in `docs/fotokwaliteit/soortaudit/screenshots/` en de bronlinks per foto):
1. Klopt per foto de rol en de beschrijving in M1.json? Speciaal: Buizerd-juveniel (vlucht, lichte iris), Torenvalk-juveniel versus vrouwtje, Torenvalk-mannetje in vlucht (alleen visueel bewijs), Sperwer-hoofdfoto (vleugels geheven: acceptabel als hoofdfoto?).
2. Is de strengere vluchtregel consequent toegepast? Twijfelgevallen: Tjiftjaf (nu uit de rol), Ekster boven water bij een steen (goedgekeurd), Buizerd donker (voorwaardelijk).
3. Zijn de 'voorwaardelijk'-hoofdfoto's (Turkse Tortel, Zilvermeeuw, Boomkruiper: vogel klein in beeld) terecht als vervangwens geregistreerd?

**Kennis:**
4. Kritische kenmerken Duiven: Houtduif witte vleugelband en halsvlek/iris (doorslaggevend met context), Holenduif 'geen wit' (doorslaggevend) en stuit tegen stadsduif (alleen helpt), Turkse Tortel tegen Zomertortel (doorslaggevend bij volwassenen). Verdedigbaar?
5. Doorgevoerde datacorrecties (Holenduif, Ekster, Zilvermeeuw, Turkse Tortel): juist en voldoende onderbouwd?

**UX:**
6. Vluchtvergelijking zonder eigen vluchtfoto toont "Nog geen geschikte vluchtfoto". Duidelijk genoeg?

Uitslag vastleggen op een eigen branch: per soort `independent` in een nieuw bestand `docs/fotokwaliteit/soortaudit/review-M1.json` (`{"spNNN": {"status": "...", "sha": "...", "notitie": "..."}}`).

## Testgrenzen

- Visuele beoordeling is door één beoordelaar (Claude) gedaan, niet ornithologisch gecertificeerd.
- Browsertests draaien in Chromium (Playwright); geen Safari of fysiek toestel.
- SAB-06 controleert alleen dat er geen geslachtslabel staat bij soorten met gelijke geslachten; het bewijst niet dat een getoond geslachtslabel klopt (dat staat per foto in M1.json).
- Twee oudere testverwachtingen zijn aangepast aan het eigenaarsbesluit over de vluchtrol (Holenduif-vluchtvergelijking, juveniele Bruine Kiekendief). Ze verwachten nu de strengere uitkomst.

## Plan resterende collectie (na akkoord op deze mijlpaal)

123 fotosoorten in batches van ongeveer 12, elk met foto-audit en kennisprofiel in één ronde (volgorde = `docs/kennisbaseline/KENNIS_TRACKER.md` K01–K11). M2 = K01: vergelijkingspartners zoals Havik, Slechtvalk, Taigaboomkruiper, Wespendief, Ruigpootbuizerd en Bruine Kiekendief. Na elke batch: commit, tracker, CI. Na elke mijlpaal: review.

## Open besluiten eigenaar

1. Correctie Houtduif-lengte (app 38–43 cm; bronnen 40–42 en 41–45 cm), Sperwer-mannetje grootte (twee VB-artikelen verschillen), Buizerd staarthoeken (bronnen verschillen): niet aangepast.
2. Vervanging van zwakke of ontbrekende foto's (onder meer de vluchtfoto's van Holenduif en Tjiftjaf, juvenielen) pas na jouw akkoord, met bron- en licentiebewijs.
3. Eerdere punten: Bergeend-label, Wilde Eend-hoofdfoto, 22 afbeeldingen buiten de bronaudit, profielomvang voor compacte soorten.
