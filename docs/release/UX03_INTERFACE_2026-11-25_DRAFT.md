# Birdspot UX-03 — intuïtieve navigatie, professionele interface en betrouwbare verificatie (DRAFT)

Status: KLAAR VOOR ONAFHANKELIJKE QA · eigenaarakkoord 25-11-2026 (uitsluitend UX-03 ontwikkelen en testen) · release HOLD
Branch `claude/birdspot-ux03-interface-20261125` · PR #363 (concept) · base PR #362 `fc5986d` (UX-02, claim VRIJGEGEVEN)
Checkpoints: UX-03A `272a4f2` · UX-03B `f7b9157` · UX-03C + kernroute `49d4203` · CI-bevindingen hersteld + dossier = head van deze PR (SHA in de overdracht)

Richting C: buiten snel en eenvoudig, thuis een uitgebreide bibliotheek. Eén app, geen modi, geen extra tabbladen.

Buiten scope en niet gedaan: F3-soortenronde, wijziging van inhoudelijke verificatienormen, nieuwe foto's of audio, backend,
betaalde dienst, Vercel-deployments, `.vercelignore`, normdocumenten, opschoning/retentie, datamigratie, merge, publicatie, livegang.
UX-01 en UX-02 niet opnieuw gebouwd; alleen hun tests op de nieuwe UX-03B-termen gezet (zie §Testaanpassingen).

## UX-03A — navigatie en iconen

| Onderdeel | Uitvoering |
|---|---|
| Kernactiviteiten | Home toont onder de zoekbalk drie knoppen: **Ontdekken** (vogel → soortengids) · **Waarnemen** (verrekijker, opent dezelfde keuze als de centrale +) · **Mijn collectie** (lijst → Mijn waarnemingen). Bestaande routes, geen extra tab. |
| Iconen | Nieuw: verrekijker (waarnemen), vergrootglas (zoeken). Vogel = soortengids, overal hetzelfde lijnicoon in plaats van soortemoji (recent, soortrijen, kiezer, kaartplek, detailfallback). Schild = herkenning/betrouwbaarheid. Bestaand: kaartpin, geluidsgolf, foto, boek. Onduidelijke iconen hebben een kort label. |
| Soortengids | Soortkaart heeft knop **Mijn waarnemingen** (naar de lijst). |
| Profiel | Bovenaan **Snel naar**: Back-up & herstel · Instellingen (scrolt en zet focus op de kop). |
| Kaart | Getoetst, voldoende: zoeken, Filters, Lijst, + Pin waarneming, plek bekijken, waarnemingen openen. |

Bewijs: `test_ux03a_navigatie.py` N1–N11 **11/11 PASS** (kernactiviteiten, iconen, terug, focus, lege toestanden, 320/390/430).

## UX-03B — verificatiestatus

Eén bron: `evidence.js` `verificationStatus(record)` → label, toon, toelichting, telt-mee. Lijst, detail, kaart, soortkaart,
filter en profiel gebruiken alleen deze functie.

| Opgeslagen gegevens | Label | Toon | Telt mee |
|---|---|---|---|
| `identificationSource: self` | Eigen herkenning (in de lijst geen extra label) | neutraal | ja |
| BirdNET, niet gecontroleerd | BirdNET · suggestie | amber | nee |
| BirdNET, `birdnetVerification: checked` | BirdNET · zelf gecontroleerd | blauw | ja |
| Merlin, niet gecontroleerd | Merlin · suggestie | amber | nee |
| Merlin, `merlinVerification: checked` | Merlin · zelf gecontroleerd | blauw | ja |
| Oud record: bron `self` + bewaarde BirdNET-suggestie | Controle onbekend | amber | **nee** (was ja) |
| Geen bron vastgelegd | Bron niet vastgelegd (in de lijst geen label) | neutraal | ja (ongewijzigd) |

Regels: BirdNET/Merlin stellen alleen voor; zelf controleren is een bewuste keuze bij Bewerken; een ongecontroleerde suggestie
toont nooit 'Zeker' (ook niet als zekerheid tegenstrijdig op 'zeker' staat: het detail meldt dat in één zin); geen vinkje bij
een status (schildicoon); 'zelf gecontroleerd' vermeldt dat het geen wetenschappelijke verificatie is; de soortkaart zegt dat
eigen waarnemingen los staan van de gidsinformatie.

**Historische telling — kleinste veilige oplossing (eigenaarbesluit gevraagd).** Oude records met een bewaarde BirdNET-suggestie
en bron `self` telden mee als eigen herkenning, terwijl niet vastligt of de gebruiker de suggestie controleerde. Dat is
aantoonbaar misleidend. Oplossing: alleen de **telregel** (`profile/stats.js countsForList`) volgt nu `verificationStatus().counts`.
Gevolgen getoetst:
- records: niet gewijzigd (opslag gelijk na alle schermen; V8);
- CSV: ongewijzigd van vorm; methodekolom ongewijzigd;
- ZIP/back-up/herstel: ongewijzigd (zelfde data, roundtrip-tests groen);
- profiel: zulke records vallen onder "… onzekere waarnemingen tellen niet mee: zekerheid ‘mogelijk’, een suggestie van BirdNET of
  Merlin zonder eigen controle, of ‘controle onbekend’. De waarnemingen zelf blijven bewaard.";
- herstel door de gebruiker: Bewerken → BirdNET-suggestie + zelf gecontroleerd → telt weer mee (V9). Geen automatische omzetting.

Filter **Herkenning** (UX-02) gesplitst: Eigen herkenning · BirdNET · Merlin · **Controle onbekend** · **Bron niet vastgelegd**
(was één groep 'Niet vastgelegd').

Bewijs: `test_ux03b_verificatie.py` V1–V10 **10/10 PASS** (lijst, detail, kaart, soortkaart, profiel, filter, geen vinkje,
historische records ongewijzigd + CSV, bewust bewerken, donker contrast min. 9,65:1).

## UX-03C — kleuren en afwerking

| Onderdeel | Voor | Na |
|---|---|---|
| Soortkiezer-kop | titel en "Sluiten" (43×16) tegen de rand | 15 px marge, titel als kop, Sluiten 97×44 met kruisje, dialoog `aria-labelledby`, zoekveld `aria-label` |
| Kaartlegenda/-filters | 26 hoog | zichtbaar 32, tikdoel 44 via onzichtbare rand (6 px boven/onder, rijen 12 px uit elkaar); schakelaars en periode 44. Een volle 44 gaf in CI K1-01 FAIL (knoppen 21 % van de kaart, norm ≤ 20 %); nu 18 % |
| Overige tikdoelen | 30–41 | ≥ 44: plekkaartje-chips, formulierchips, verwijderknop, bewegingsknop Home, soortnamen, kiezer-zoekveld, Dagboek/Inzichten-knoppen, selecties en segmenten |
| Meldingen | twee systemen (boven groen zonder type; profiel-fallback onder met `nowrap` en 3:1-rood); `window.__birdspot.toast` bestond niet → mislukte plekhernoeming op de kaart bleef **stil** | één laag met toon: info (i) · succes (✓, bosgroen, alleen na geslaagde actie) · waarschuwing (!, amber) · fout (×, rood, `role=alert`); tekst loopt door op 320; alle ±45 meldingen getypeerd |
| Dubbele uitleg | detail: kop "BirdNET · suggestie · niet zelf gecontroleerd" + veld met dezelfde uitleg | kop alleen label, uitleg één keer bij Herkenning; tegenstrijdigheidszin klopt ook voor 'controle onbekend' |
| Contrast licht | verwijderknop 3,0:1; goudlabels Dagboek/Inzichten 1,7–3,0:1 | `--danger-ink` 6,4:1; `--gold-ink` 5,6:1 |
| Contrast donker | middengroene tekst soortgids (Toon alle soorten, + Eigen foto, Kenmerken, i) 2,6:1 | `--icon-ink` (licht gelijk, donker leesbaar) |
| Zonkaart Home | coördinaten `--muted` op donkere achtergrond 2,4:1 (CI-bevinding; SunCalc-CDN is in de sandbox onbereikbaar) | lichte tint, ≥ 4,5:1; test laadt nu een vaste SunCalc-stub zodat de kaart altijd wordt gemeten |

Kleurrollen: bosgroen = merk/primair · blauw = informatie (zelf gecontroleerd) · amber = waarschuwing, onzekerheid, ongecontroleerde
suggestie · neutraal · succesgroen alleen in een succesmelding. Kleur is nooit het enige signaal (tekst, teken of icoon).
Geen herontwerp: alleen maat, contrast en meldingsvorm. Het kopzoekveld (38 zichtbaar, 44 met bestaande onzichtbare tikrand) blijft.

Bewijs: `test_ux03c_afwerking.py` C1–C8 **8/8 PASS**: kiezerkop 320/390/430 · tikdoelen in 12 gebieden + legenda-tikrand via `elementFromPoint` · meldingen licht/donker
+ echte route ('Kies eerst een soort' = waarschuwing, 'Waarneming bijgewerkt' = succes) · geen dubbele uitleg · contrast in 20 gebieden
+ 8 meldingen (7 schermen licht en donker, zonkaart, soortkaart, detail, formulier, kiezer) · namen voor schermlezers · kleur niet alleen ·
geen horizontale overloop (24 schermen).

## Integrale kernroute

`test_ux03_kernroute.py` K1–K9 **9/9 PASS** vanaf een lege app: openen → Ontdekken → zoeken 'merel' → soortkaart (herkennen) →
Waarnemen → Gezien → soort kiezen → plek/zekerheid/notitie → opslaan (één record, Eigen herkenning) → herladen (ongewijzigd) →
terugvinden via notitie → bewerken (succestoon) → opnieuw controleren in detail, soortkaart en profiel. Geen paginafouten.

## Integrale regressie (lokaal, sandbox)

| Set | Resultaat |
|---|---|
| Python-suites uit alle workflows (124) | 121 PASS (na de legendawijziging opnieuw: `map_k1k2` K1-01 18 %, `map_k3`, `map_k4`, `explorer_species_cluster` PASS) · 3 sandbox: `feature_reconciliation` F06/F07 (BirdNET-CDN en kaarttegels onbereikbaar; bekend), `r2b_herstelslot` (Chromium "Target crashed", identiek op base `fc5986d`), `guide_photos` (zie overdracht) |
| Node-suites (58) | 57 PASS · `test_photo_feedback.mjs` vereist `sharp` (CI installeert; bekend) |
| Dekking | UX-01 concepten · BirdNET/Merlin · Nog één + recente soorten · UX-02 zoeken/filters/scrollherstel · automatische/benoemde plekken · GPS en pin · foto's en audio · FOT-01/02 · WEE-01 · offline · CSV/ZIP/back-up/herstel · annuleren en browser-terug · privacy · fout-, lege en onderbroken toestanden |

## Testaanpassingen (bedoeld, geen versoepeling)

- `test_ux01b_birdnet.mjs/.py`, `test_r4_merlin.py`, `test_ux02_query.mjs`, `test_ux02a_zoeken.py`: nieuwe labels
  ('BirdNET · zelf gecontroleerd', 'Merlin · suggestie', 'Controle onbekend'); oud record telt niet mee; filter gesplitst.
- `test_ux02b_beheer.py` W2: detailkop toont 'BirdNET · suggestie' en geen 'Zeker' (uitleg staat nu één keer in het veld).
- `test_ux01b_birdnet.py` N10: tegenstrijdigheidszin 'eigen controle is niet vastgelegd … telt daarom niet mee'.

## Bewijslagen

| Laag | Status |
|---|---|
| Code | VERIFIED (head van deze PR) |
| CI | zie overdracht (exacte SHA) |
| Lokale browser (Playwright, Chromium) | VERIFIED voor UX-03A/B/C, kernroute en regressie hierboven |
| Beveiligde Vercel-preview | NOT TESTED (geen deployment per wijziging) |
| Fysiek Android-toestel | NOT TESTED |

## Risico's

1. Telregel 'controle onbekend' → profieltotalen kunnen voor bestaande gebruikers dalen. Data blijft; herstelbaar via Bewerken. Eigenaarbesluit.
2. Toestel: tikdoelen, donkere modus en meldingen zijn alleen in Chromium gemeten; schermlezer (TalkBack) niet getest.
3. Servicewerker-versie niet opgehoogd (zoals UX-01/02); gebeurt bij releasebundeling, anders kan een toestel oude CSS houden.
