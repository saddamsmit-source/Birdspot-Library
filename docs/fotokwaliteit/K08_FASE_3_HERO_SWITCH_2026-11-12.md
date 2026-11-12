# Birdspot K08 — Correctie van hoofdfoto Zwarte Specht (sp018)
Datum: 12 november 2026 · kwaliteitsronde 2 · concept voor review
Basis: `00dfbde615f81f3c2be7587d674f8eb17b2a177c` · Scope: alleen `sp017` en `sp018`, met wijziging van uitsluitend `sp018`-hoofdfoto.

## Controleerbare beslissing

De al bestaande, goed leesbare mannetjesfoto `/assets/showcase/sp018.webp` is gekozen als hoofdfoto van Zwarte Specht. Het eerder als hoofdfoto gebruikte portret `/assets/species/plumage/sp018-hero-male.webp` blijft als **afzonderlijk mannetjesbeeld** zichtbaar onder Verenkleed. De beide opnamen hebben verschillende fotografen, locaties en bron-URL's. Beide bestanden blijven ongewijzigd en worden niet gekopieerd of verwijderd.

| | Voor wijziging | Na wijziging |
|---|---|---|
| Hoofdfoto | `sp018-hero-male.webp` (Frank Vassen) | `assets/showcase/sp018.webp` (xulescu_g) |
| Mannetje-galerij | `assets/showcase/sp018.webp` | `sp018-hero-male.webp` |
| Vrouwtje | `sp018-female-single.webp` | gelijk |
| Juveniel | `sp018-juv-review.webp` (alleen kopdetail) | gelijk |
| Vrije vlucht | `sp018-flight.webp` | gelijk |

## Herkomst en rechten

- Nieuwe zichtbare hoofdfoto: `https://commons.wikimedia.org/wiki/File:Dryocopus_martius,_Perersberg,_Brasov,_Romania_0_(cropped).jpg`; auteur **xulescu_g**, **CC BY-SA 2.0**. De Commons-bron bevat het oorspronkelijke beeld, publicatie- en cropgeschiedenis en de licentie. De huidige lokale WebP is eerder via `assets/species/credits.json` herleid en visueel geopend. Verwerking of bestandsinhoud niet aangepast.
- Oudere mannetjesfoto: `https://commons.wikimedia.org/wiki/File:Black_Woodpecker_(Dryocopus_martius),_Parc_de_Woluw%C3%A9,_Brussels_1.jpg`; auteur **Frank Vassen**, **CC BY 2.0** volgens de bestaande 9-11 bronimport en de Commons-categorie/latere hergebruikkreditering. De geregistreerde import-SHA-1 `305a08246ecd575f7e8546ccfd240ecca70581bd` blijft behouden. Het oorspronkelijke importregister `verified_heroes_2026-11-09.json` wordt niet met terugwerkende kracht herschreven.
- Vrouwtje: `https://commons.wikimedia.org/wiki/File:2016.08.27.-15-Viernheimer_Heide-Viernheim--Schwarzspecht-Weibchen.jpg`; auteur **Andreas Eichler**, **CC BY-SA 4.0**. De oorspronkelijke foto bestaat op 2196×2901 px. De huidige lokale 500×661-versie is onvoldoende scherp voor alle details; er is in deze ronde **geen** nieuwe verwerking uitgevoerd en geen ongeverifieerde hogere-resolutie aangeboden.
- Juveniel: huidige Commons-bestandspagina `https://commons.wikimedia.org/wiki/File:Dryocopus_martius_03.jpg` vermeldt **CC BY 1.0**, auteurschap Philippe Kurlapski en 'Pic noir juvénile'. De uploadgeschiedenis bevat eveneens een ouder licentiesjabloon. De bestaande credit blijft gelijk; een rechtmatige herpublicatiecheck is nodig bij eventuele verdere commerciële toepassing.

## Test- en publicatiecontract

- Exacte nieuwe `GUIDE_HEROES.sp018` moet verwijzen naar de al bestaande `GUIDE_PHOTOS.sp018.image`; het register en de gegenereerde module moeten volledig gelijk blijven.
- Geen herhaling van de hoofdfoto onder Verenkleed; het oude portret moet precies één keer in de mannetje-galerij voorkomen. De historische V-05-test blijft de oude importbron, SHA-1, fotograaf en licentie controleren en krijgt een **gerichte uitzondering alleen voor sp018** met strengere actuele rolcontrole; er is geen algemene versoepeling.
- De eerdere bron, foto's en gebruikersdata blijven behouden. Volledige soorten-`soortaudit` en de onafhankelijke biologische review blijven open: `98/140` is geen nieuw PASS; `sp017` en `sp018` hebben wel een kennisprofiel. De lokale Android- en werkelijk offline toestelproeven zijn NOT TESTED.
- Geen merge naar `main`, geen nieuwe GitHub Pages-publicatie en geen Vercel-deploy zonder eigenaarbesluit.

## Reproductie / checkpoint

Test via `node tests/test_guide_poses.mjs` en `node tests/test_guide_photo_verification.mjs`; CI-workflows moeten op de exacte nieuwe head aantonen dat beide tests en de relevante browser-, bron- en offlinecontracten werkelijk draaien. Voor een screenshot op 390 px: vergelijk de Zwarte Specht-herkenningskaart vóór/na, met credits, zoom en 'Verenkleed'. De fysieke telefoon blijft een afzonderlijke testlaag.

**Kennisdelta:** bestaande foto krijgt een andere zichtbare rol zonder binaire duplicatie of beeldverlies. De sleutel naar de nieuwe hoofdfoto mag niet in een archief worden hernoemd; test de rolwissel en de historische import apart.
