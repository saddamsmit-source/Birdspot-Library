# Birdspot R11 — onafhankelijke QA op verenkleed-UX (PR #175)

**Peildatum:** 13 november 2026 · **Status:** DRAFT / AUTOMATED QA VERIFIED · **Fysiek Android:** NOT TESTED.  
**Geteste bron- en test-SHA:** `8fa44f1ee46093d7416f3be58312fa08f50b8ea9`.  
**Beoordeelde featurebasis:** PR #175 `8b6a91bb5547582b6feb1ee99af397b2f4078741`.  
**CI:** [Birdspot Independent Plumage Accessibility QA, run 43448450995](https://github.com/saddamsmit-source/Birdspot-Library/actions/runs/43448450995) **completed/success**.

## Waarom deze controle
De nieuwe PR #175 laat fotogevulde kleedrollen (o.a. mannetje, vrouwtje, juveniel) onder `Herkenning → Verenkleed` naast elkaar zien, met de bestaande fotozoom en foto-informatie. Een eerdere 4-viewport-test van de feature was geslaagd; de onafhankelijke controle richt zich op een **nog smaller scherm van 320px**, feitelijke toetsenbordbediening en de credits per foto. Geen vervanging of duplicatie van de bestaande UI.

## Werkelijk gemeten

| Test | Feitelijke browserhandeling op bestaande Zwarte Specht-gidsbeelden | Status |
|---|---|---|
| R11-320A / 390A | Drie datagestuurde, werkelijk decodeerbare rolkaarten `adult_m`, `adult_f`, `juv`; verschillende afbeeldingspaden, beschrijvende alt/aria-labels, geen horizontale scrolloverflow | PASS |
| R11-320B / 390B | Foto-knop krijgt toetsenbordfocus; `Enter` opent de echte fotozoom, `Escape` sluit zonder de gids te verlaten | PASS |
| R11-320C / 390C | Foto-infoknop is met toetsenbord te openen/sluiten; maker en licentie met bruikbare HTTPS-links blijven bereikbaar | PASS |
| R11-320D / 390D | Uitklapper met volledige identificatiekenmerken is bereikbaar met `Enter`, blijft niet onterecht verloren | PASS |

**Bronbehoud:** geen vogels, foto's, manifesten, licenties, opslagkeys, bronlinks of overige appmodules veranderd. De test gebruikt de echte reeds aanwezige WebP's; geen nieuwe afbeelding, gerenderd substituut of externe bronasset toegevoegd.

## Grenzen
- Dit is **Chromium-/Playwright-evidence** op 320 en 390 pixels, niet een volledig handmatige accessibility-audit, echte TalkBack-/VoiceOver-test, Android/PWA-test, fysieke cameratoegang of persoonlijke gebruikerservaring.
- De oorspronkelijke fotoaudit op sp018 blijft gelden: de vrouwtjesfoto heeft perspectief-/resolutiebeperkingen, de juveniel is een **kopdetail** en de echte vluchtfoto is niet geheel optimaal gekadreerd. Een verbeterde layout verandert die inhoudelijke status niet.
- Kleine Bonte Specht sp017 mag in de bestaande feature-QA geen niet-bestaande tweede fotogevulde rol of vrij vluchtbeeld claimen. Die negatieve check wordt door PR #175 uitgevoerd, niet in deze aanvullende 320px-test opnieuw.
- De bestaande 1.27.7-releasekandidaat in PR #171 bleef byte-ongewijzigd. Een volgende publieke uitrol moet een **nieuwe, unieke cacheversie** krijgen en opnieuw dezelfde SW-upgrade- en regressiegates doorlopen. Geen fysiek Android-PASS en geen toestemming voor publicatie.

## Kennisdelta, herstel en risico
- **Wel:** onafhankelijke toetsenbord-/narrow-screen-vorm- én functietest; bron- en credittoegang aangetoond voor de geteste kleedrollen.
- **Niet:** fysieke pilot, volledige ornithologische check van alle 597 soorten, eigenaarsoordeel over het visuele ontwerp, productiecheck.
- **Risico:** kleinere foto's op 320px en nog onvolledig bronmateriaal. `object-fit: contain`, bestaand zoommechanisme en uitklappers zijn in browser gecontroleerd; subjectieve leesbaarheid op toestel nog niet.
- **Herstel:** sluit de eigen concept-PR #176; feature-PR #175 `8b6a91bb` blijft ongewijzigd. Geen media-/gebruikersdatamigratie nodig.
- **Kosten:** bestaande GitHub CI; werkelijke kosten/minuten UNKNOWN.
- **Vervolg:** behoud een enkele schrijver per branch; visuele ownerreview op een 390px screenshot zodra fysiek gebruik wordt opgepakt. Werk daarna in proefbatches van maximaal drie soorten de open foto- en kennisgaten af, met bron/licentie en geslacht-/leeftijd-/vluchtrollen afzonderlijk gecontroleerd.

**Document-DRAFT ≠ app-PASS. Deze aanvullende test is technisch VERIFIED; publicatie NO-GO.**
