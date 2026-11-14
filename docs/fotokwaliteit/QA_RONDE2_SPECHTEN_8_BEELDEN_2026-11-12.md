# Birdspot QA ronde 2 — onafhankelijke herbeoordeling twee spechten (8 gidsbeelden)

**Peildatum:** 2026-11-12 · **Broncommit (beelden):** `5fffd6953f162bb0d7c388e96038b91c821d2472` (PR #167 vóór deze QA-documentatie) · **Status:** PARTIALLY TESTED / REVIEW.  
**Reviewer:** ChatGPT GPT-6. Deze nieuwe controle is gescheiden van M10's eerdere registratietekst, maar **niet** van een onafhankelijke menselijke ornitholoog of eigenaar. **Scope:** uitsluitend sp017 en sp018; geen andere foto-/soortmutatie.

## Wat echt is beoordeeld

- Acht daadwerkelijke **GitHub-WebP-binaries** in deze commit afzonderlijk geopend als visuele beelden, niet uitsluitend bestandsnamen of metadata.
- De acht GitHub blob-SHA's vergeleken: alle verschillend. Ook de volledige base64-byte-inhoud onderling vergeleken; **nul exacte binaire duplicaten**. Dit is **niet** hetzelfde als perceptuele duplicaatdetectie, controle tegen originele Wikimedia-bytes of bewijs voor andere vogels.
- De actieve bronregistratie `assets/species/field-guide-media.json` en hoofdfoto's `assets/species/credits.json` gecontroleerd op rol en herkomst.
- Afzonderlijke oorspronkelijke Commons-bestandspagina's gelezen voor: sp017 mannetje (Carlini), vrouwtje (Sharp) en nestholtebeeld (blondinrikard); sp018 huidige hoofdfoto (xulescu_g), vrouwtje (Eichler), vlucht (Mosbacher) en juveniel kopdetail (Kurlapski). De andere sp018-mannetjesfoto van Frank Vassen was in de eerdere M10-bronaudit geregistreerd; deze ronde is geen onafhankelijke oorspronkelijke bytecontrole daarvan.
- Visuele indruk = eigen zichtcontrole; biologische zekerheid blijft **niet onafhankelijk vastgesteld**. Geen claim van nieuwe rechten voor niet-gelezen bronnen.

## Alle acht beelden — vastgelegde waarneming (bestaande inhoud behouden)

| Soort/beeld | Werkelijk zichtbaar | QA-uitkomst |
|---|---|---|
| sp017 `assets/species/sp017.webp` (hero) | Mannetje met rode kruin, boomstam en bes; vogel duidelijk en grotendeels in beeld | Behoud hero; geschikt als herkenningsbeeld, oorspronkelijke geslachtsclaim ondersteund door Commons-bijschrift |
| sp017 `assets/species/plumage/sp017-female.webp` | Vrouwtje zonder rode kruin op tak, dwarsbandering rug zichtbaar | Behoud; redelijke vergelijkingsfoto |
| sp017 `assets/species/plumage/sp017-flight.webp` | Vleugels uitgespreid vlak tegen stam/nestholte; geen schone losstaande, gehele vrije vlucht | **Niet** in vrije vluchtrol promoveren; houden als context/opvliegen |
| sp018 `assets/showcase/sp018.webp` (hero) | Groot, redelijk scherp, mannetje tegen stam, rode kruin en lange snavel zichtbaar | Behoud als hero |
| sp018 `assets/species/plumage/sp018-hero-male.webp` | Tweede, duidelijk andere mannetjesopname; vogel aanzienlijk kleiner in beeld | Behoud één keer onder Mannetje, niet als tweede hoofdbeeld |
| sp018 `assets/species/plumage/sp018-female-single.webp` | Vrouwtje voornamelijk van achteren, beperkte kopdetails en deels storende voorgrond | **Voorwaardelijk**: 500×661; originele hogere resolutie kan zoombaarheid verbeteren, maar géén beter standpunt of ander kleed tonen |
| sp018 `assets/species/plumage/sp018-flight.webp` | Echte vrije vlucht, uitgespreide vleugel, maar lijf/staart bij onderrand deels afgesneden | **Voorwaardelijk**: vlucht correct, betere complete vluchtfoto gewenst |
| sp018 `assets/species/plumage/sp018-juv-review.webp` | Scherp kopdetail; geen volledige juveniele vogel te zien | Alleen als **kopdetail**; juveniele lichaamsfoto blijft ontbreken, leeftijd berust mede op origineel Commons-bijschrift |

## Actuele registers/rollen

- sp017 mist een betrouwbaar volledig **juvenielenportret** en een foto van de **hele vogel in onmiskenbaar vrije vlucht**. In het actuele register heeft het nestholtebeeld `flight: false`; dat is terecht.
- sp018 heeft wel een bestaande vluchtfoto met `flight: true`, maar **geen volledig gekadreerd optimaal vluchtbeeld**; de juvenielenfoto is alleen kopdetail.
- De hogere-resolutie Commons-foto van Eichler heeft **dezelfde opname/compositie** als de huidige lokale 500px-afgeleide. Geen basis om een verbetering van de hoek/afbeeldingsinhoud te claimen.
- De acht lokale WebP's zijn onderling visueel duidelijk andere opnamen/uitsneden; dit is een beperkte eigen visuele review, geen objectief perceptueel similarity-onderzoek op originele bronbestanden.
- De publicatievoorwaarden voor CC BY-SA vragen **naam, bron, licentie, wijziging en ShareAlike waar van toepassing**. Originele bronspecifieke wensen apart behandelen; geen aanwijzing dat alleen een informatietegeltje altijd voldoende is. Onbekende rechten worden niet gepromoveerd.

## Extern gecontroleerde bestandspagina's (geen foto's gekopieerd)

- https://commons.wikimedia.org/wiki/File:Picchio_rosso_minore_con_mora_di_gelso.jpg — Maurizio Carlini, CC BY-SA 4.0, mannetje
- https://commons.wikimedia.org/wiki/File:Lesser-spotted_woodpecker_(Dryobates_minor_hortorum)_female.jpg — Charles J. Sharp, CC BY-SA 4.0
- https://commons.wikimedia.org/wiki/File:Lesser_spotted_woodpecker_(f),_Dryobates_minor,_Mindre_hackspett.jpg — blondinrikard, CC BY 2.0; bestandsinformatie op zichzelf geen vrijevluchtbewijs
- https://commons.wikimedia.org/wiki/File:Dryocopus_martius,_Perersberg,_Brasov,_Romania_0_(cropped).jpg — xulescu_g, CC BY-SA 2.0
- https://commons.wikimedia.org/wiki/File:2016.08.27.-15-Viernheimer_Heide-Viernheim--Schwarzspecht-Weibchen.jpg — Andreas Eichler, CC BY-SA 4.0; oorspronkelijk 2196×2901 en GPS/EXIF
- https://commons.wikimedia.org/wiki/File:Schwarzspecht_(Dryocopus_martius).jpg — Janus Mosbacher, CC BY-SA 4.0
- https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg — Philippe Kurlapski; huidige paginalicentie CC BY 1.0, historische upload bevat afwijkende sjabloontekst: apart controleren bij hergebruik

## Regressietest en vervolg

De extra `QA-SPECHTEN-BYTES` in `tests/test_guide_poses.mjs` controleert **actuele WebP-bytes** met SHA-256, naast bestaande image-path/source-URL checks. Dit vangt identieke bestanden onder verschillende bestandsnamen op voor de twee soorten; perceptuele bijna-dubbelen en andere soorten blijven buiten deze assertie. De CI-uitkomst op de nieuwe head moet opnieuw worden gecontroleerd.

Vervolgvolgorde: (1) nieuwe exacte SHA en GitHub Actions PASS, (2) originele Eichler-JPEG daadwerkelijk ophalen en tegen Commons SHA-1 controleren waar netwerk beschikbaar, (3) eigen staging + echte bronpixel-/cropvergelijking en EXIF-check, (4) **alleen na review** afzonderlijke kleine media-PR, (5) mobiele 390px + echte Android: herkennen, vergelijken, zoom, terug, offline heropenen. Voor sp017 geen Getty/Woodland Trust-media importeren zonder aantoonbare licentie voor dit gebruik.

**Niet gedaan:** geen bronfoto's toegevoegd, vervangen, gecropt of verwijderd; geen wijzigen van `main`, Vercel, GitHub Pages of openbare app. **Bronbehoud:** originele foto-assets, M10, credits, metadata en gebruikeropslag zijn onaangeroerd. **Herstel:** eigen QA-branch/PR sluiten; oudercheckpoint PR #166 SHA `77864a316c0b028542388904515a9792e11af0ca`. **Kennisdelta:** bestaande bron-/fotoregel en regressielearnings aangesterkt; geen nieuwe generieke norm nodig.
