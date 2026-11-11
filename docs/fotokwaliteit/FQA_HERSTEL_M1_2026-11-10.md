# Herstel mijlpaal M1 na onafhankelijke ChatGPT-QA

QA-basis: PR #127, comment 6776090974 op `956b6cf`. Herstelcommit `dd5da6b` (code, data, tests); dit document en de tracker staan in de docs-commit erboven. Schrijver: Claude. Er is niets gemerged en niets live gezet.

## FQA-01 — echte vluchtfoto's zonder vluchtlabel

**Methode.** Alle 381 geregistreerde gidsfoto's zijn bekeken, ongeacht hun metadata of bestandsnaam:
- de 122 foto's mét vluchtlabel uit de bestaande vluchtcontrole;
- de 260 foto's zonder vluchtlabel op 17 contactsheets (16 foto's per vel, 330 px), met vergroting bij twijfel.

Per bestand staat de beoordeling met SHA-1 in `docs/fotokwaliteit/beeldinventaris.json`. Wijzigt het beeldbestand, dan faalt VC-07 tot er opnieuw is beoordeeld.

| Soort | Bestand | Waarneming | Correctie | Bewijs | Nieuwe status |
|---|---|---|---|---|---|
| Buizerd sp005 | `sp005-juv.webp` | Zweeft vrij met volledig gespreide vleugels | `flight:true`; één keer onder In vlucht als **Juveniel**; Juveniel-kaart verwijst ernaar | Beeld; iNaturalist 89145381 "Life Stage: Juvenile" (bronaudit 09-11) | goedgekeurd |
| Bruine Kiekendief sp173 | `sp173-adult_f.webp` | Vliegt vrij, vleugels volledig gestrekt | `flight:true`; onder In vlucht als **Vrouwtje**; Vrouwtje-kaart houdt de zittende foto | Beeld; Commons "Circus aeruginosus female …" (bronaudit 09-11) | goedgekeurd |
| Ruigpootbuizerd sp253 | `sp253-juv.webp` | Vrij in de lucht, vleugels en staart gespreid (zelf gevonden in de inventaris) | `flight:true`; onder In vlucht als **Juveniel**; Juveniel-kaart verwijst ernaar | Beeld; iNaturalist 70044579 "Life Stage: Juvenile" | goedgekeurd |

Geen andere foto zonder vluchtlabel toont een vrije vlucht. Wel genoteerd, zonder roloverdracht:
- **Vleugels gestrekt, zittend:** Sperwer-vrouwtje, Sperwer-hoofdfoto, jonge Aalscholver.
- **Kwaliteitspunten voor latere batches:**
  - Huismus-hoofdfoto: kleurzweem;
  - Goudplevier-juveniel: tekst in beeld;
  - Witgat-juveniel en Blauwe Kiekendief-rustfoto: onscherp;
  - Strandplevier-winterkleed en Grote Gele Kwikstaart: vogel klein in beeld;
  - Krakeend-juveniel: onnatuurlijke setting, vermoedelijk in de hand (REVIEW REQUIRED).
- **Geslacht en leeftijd:** de inventaris is een beeldtype-controle. De volledige geslachts- en leeftijdscontrole per foto gebeurt per soortbatch (M2 en verder); de 123 nog niet gecontroleerde soorten staan op NOT TESTED.

## FQA-02 — acht voorwaardelijke vluchtfoto's

| Soort | Bestand | In vlucht? | Scherp en groot genoeg? | Definitief geschikt? | Besluit | Vervanging |
|---|---|---|---|---|---|---|
| Patrijs | `sp106-flight` | ja | nee (450 px, zacht) | nee | voorlopig zichtbaar met status | gewenst |
| Buizerd | `sp005-male-flight` | ja | matig (licht onscherp, klein) | nee | voorlopig; toont wel de donkere variant | gewenst |
| Grote Lijster | `sp049-flight` | ja | nee (sterk bewogen) | nee | **gearchiveerd**, herkomst en bestand bewaard; vluchtpositie ontbreekt | nodig |
| Zwarte Mees | `sp174-flight` | ja | matig (kop scherp, vleugels bewogen) | nee | voorlopig | gewenst |
| Grote Karekiet | `sp108-flight` | ja | matig | nee | voorlopig | gewenst |
| Appelvink | `sp041-flight` | ja | matig (330 px, kenmerken zichtbaar) | nee | voorlopig | gewenst |
| Kneu | `sp039-flight` | ja | nee (vogels klein) | nee | voorlopig | hoge prioriteit |
| Gekraagde Roodstaart | `sp178-flight` | luchtgedragen, maar poten hangen en takken vlakbij | nee (korrelig) | nee | **uit de vluchtrol** (getoond als "Vliegend vlak bij takken"); REVIEW REQUIRED; vluchtpositie ontbreekt | nodig |

Voorlopige foto's tonen in de kaart "Voorlopige foto: beperkte scherpte." vóór de bestaande toelichting. Ze tellen nooit als VERIFIED.

## FQA-03 — één sectie "Lijkt op"

- Er is één sectie met **één kaart per gelijkende soort**. Kleed- en vluchtvergelijking van dezelfde soort staan als tabbladen in die kaart, bijvoorbeeld Sperwer–Havik: Mannetje · Vrouwtje · In vlucht.
- Een soort met alleen een vluchtvergelijking krijgt een eigen kaart.
- Daarna volgen de gelijkende soorten uit het kennisprofiel zonder eigen kaart.
- Onderaan staat **Kritische determinatieverschillen**, uitklapbaar.
- De losse sectie "Vluchtvergelijking" is verdwenen. Alle vergelijkingsdata zijn behouden.
- Screenshots: `soortaudit/screenshots/{sp003,sp006,sp005,sp094}_390_lijkt-op.jpg` en `sp006_1280_lijkt-op.jpg`.

## FQA-04 — doorslaggevend

| Wijziging | Waarom |
|---|---|
| 7 veldkenmerken (Niveau 1) van Doorslaggevend naar Helpt | Een veldkenmerk heeft geen context- of uitzonderingenveld; doorslaggevend kan alleen bij een kritisch kenmerk met context. |
| Houtduif "Halsvlek en iris" gesplitst: Witte halsvlek doorslaggevend (alleen volwassen), iris alleen ondersteunend | De lichte iris steunde op één uitgever. |
| Turkse Tortel–Zomertortel: eBird en birdspot.co.uk toegevoegd; uitzondering voor juvenielen | De Zomertortel-kant steunde op één uitgever. Juvenielen van beide soorten missen de halstekening. |
| Fitis/Tjiftjaf zang alleen doorslaggevend bij een typisch, volledig lied; gemengde zang als open punt | Uitzondering expliciet. |
| Validator: doorslaggevend vereist ≥2 uitgevers, context **en** een diagnostische onderbouwing; vaste beoordeelde lijst (8 kenmerken) in `docs/kennisbaseline/doorslaggevend-review.json` | Een nieuwe of opgewaardeerde claim faalt tot hij beoordeeld is. |

Beoordeeld als doorslaggevend (8 kenmerken):
- Fitis en Tjiftjaf: zang;
- Torenvalk: geslacht (volwassen);
- Sperwer: onderzijde jonge vogels;
- Houtduif: witte vleugelband en witte halsvlek;
- Holenduif: geen wit in de vleugel;
- Turkse Tortel: hals en bovendelen (volwassen).

Zilvermeeuw-pootkleur blijft "Helpt". Alle open punten blijven open.

## Tests (lokaal, Chromium/Playwright, Node 22; CI zie PR)

| Test | SHA | Uitkomst |
|---|---|---|
| `test_vluchtcontrole.mjs` VC-01..08 | `dd5da6b` | geslaagd (incl. 6 negatieve VC-07-gevallen) |
| `test_soortaudit.mjs` SA-01..07 | `dd5da6b` | geslaagd |
| `test_kennisbaseline.mjs` KB-01..10 | `dd5da6b` | geslaagd |
| `test_kennisbaseline_validator.py` KV-01..12 | `dd5da6b` | geslaagd |
| `test_soortaudit_browser.py` SAB-01..09 (390 + 1280 px) | `dd5da6b` | geslaagd; `browser.json` testedOn `dd5da6b` |
| `test_fotovolgorde_2026-11-10` (mjs + py), `test_guide_poses`, `test_guide_photo_verification` | `dd5da6b` (lokaal vóór commit, zelfde code) | geslaagd |
| `test_species_detail.py` H2–H4, `test_kennisbaseline_browser.py` KBB-01..08 | idem | geslaagd |
| `test_guide_photos.py` (389 foto's offline na precache, zoom/credits) | idem | geslaagd |
| `test_species_data.py`, `test_navigation_recovery.py`, `test_sighting_merlin_pins.py` | idem | geslaagd |

**Aangepaste testverwachtingen**, alle door de eigenaarsbesluiten FQA-01 en FQA-03:
- FV-01, FVB-01 en VC-03: vluchtvergelijking als tabblad binnen "Lijkt op";
- FV-07: sp173 en sp253 hebben extra vluchtrollen;
- test_guide_photos: het vrouwtje van sp173 staat niet meer naast de zittende foto;
- test_species_detail: de kaartzoeker gebruikt de ene kaart per soort.

Geen enkele test is versoepeld; elke aanpassing eist de strengere of nieuwe uitkomst.
