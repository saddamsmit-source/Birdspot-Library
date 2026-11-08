# Verspreidingskaart per soort

In **Soorten → vogel → Waar** staat de openbare soortkaart boven **Jouw plekken**. De soortkaart is een lokale, statische SVG. **Toon op de kaart** en de plekknoppen blijven de persoonlijke kaart openen, gefilterd op soort of plek. De gids vraagt bij het tekenen geen locatie op en verstuurt geen persoonlijke waarnemingen.

## Herkomst en afbakening

- Waarnemingen uit **EOD – eBird Observation Dataset**, Imani et al. (2026), Cornell Lab of Ornithology, via GBIF geraadpleegd op 2026-11-08. Selectie uit 2020–2025, Nederland, aanwezige exemplaren, coördinaten zonder door GBIF gemarkeerde geografische problemen, uitsluitend CC BY 4.0. De waarnemingen zijn geaggregeerd en omgezet naar een lokale kaartlaag. [Dataset en auteurs](https://doi.org/10.15468/aomfnb) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Landgrenzen en binnenwater uit Natural Earth 1:10m, publiek domein. Omgezet naar Web Mercator en vereenvoudigd voor het mobiele overzicht. [Kaartbestanden](https://github.com/nvkelso/natural-earth-vector/tree/master/geojson) · [Gebruiksvoorwaarden](https://www.naturalearthdata.com/about/terms-of-use/)
- Kaartcellen van ongeveer 24 km breed in Nederland. Een cel wordt getoond vanaf vijf records, en een kaart vanaf drie zichtbare cellen. De bron bepaalt welke waarnemingen publiek zijn. Dwaalgasten, ontsnapte en historische soorten krijgen geen laag. Voor onvoldoende onderbouwing toont de gids een melding. De bron kan meldingen op populaire telplekken oververtegenwoordigen. De laag beschrijft vastgelegde waarnemingsgebieden uit alle seizoenen. De kaart toont per vak een klasse van het aantal openbare meldingen. Ook in een leeg vak kan de soort voorkomen. De klasse geeft geen populatieaantal, trefkans, nestlocatie of exacte waarnemingslocatie weer.
- Deze momentopname toont een kaart voor 292 van de 597 soorten. Van de 319 soorten in de geselecteerde categorieën haalden 27 de drempel niet.

## Legenda en telling

| Kaartteken | Openbare meldingen per vak |
|---|---:|
| Leeg | 0–4 |
| Klein, geel | 5–24 |
| Middelklein, geeloranje | 25–99 |
| Middelgroot, donkeroranje | 100–499 |
| Groot, rood | 500 of meer |

Alle vakken hebben dezelfde ruimtelijke schaal. De grootte en tint van de ronde stip tonen de meldingsklasse. De stip staat in het midden van het vak en vat meldingen in dat hele vak samen. De kleur loopt van geel bij weinig meldingen naar rood bij veel meldingen. De hoofdstatus staat apart als tekst. De legenda gebruikt dezelfde symbolen als de kaart. De aantallen zijn samengevoegd over 2020–2025 en volgen de bestaande bronfilters. Er is geen correctie voor ongelijke telinspanning.

## Dataset opnieuw bouwen

Installeer `mapbox-vector-tile` en voer uit vanuit de repo-root met Node.js beschikbaar.

```sh
python tools/species/build_distribution.py /pad/naar/download-cache
```

Gebruik voor een nieuwe momentopname een lege cachemap. De generator koppelt op wetenschappelijke naam en GBIF-soortsleutel, vergelijkt het aantal records in de kaarttegel met de bijbehorende zoekopdracht en stopt bij onopgeloste fouten. Voor Witvleugelstern en Witwangstern kunnen de vakken van de GBIF-tegel afwijken van de vakken op basis van de openbare coördinaten, ook bij een gelijk landelijk totaal. Voor deze twee soorten gebruikt de generator daarom de directe telling met dezelfde filters. Daarmee blijven alle vakken uit de vorige kaart behouden. Het gebundelde bestand bevat per soort de bron-ID en paren van vakindex en meldingentotaal voor de zichtbare vakken. Nieuwe tussencaches hebben de suffix `-counts.json`, zodat oude caches zonder aantallen niet worden ingelezen. Het bevat geen ruwe waarnemingen. Noteer bij een volgende datasetversie de gegevensperiode en raadpleegdatum, controleer de bronlicentie opnieuw en verhoog de serviceworkerversie.

## Functiekaart en learning

- CAP-BIRD-012, L-019. De maandbalk in **Leefwijze** toont aanwezigheid met de bestaande statuskleuren. Vanaf 1.16.6 zit de rode broedlijn direct onder de maandletters en loopt hij door over aangrenzende broedmaanden. De eerdere roze lijn bleef bij 201 soorten weg doordat alleen het losse veld `months` werd gelezen. De generator gebruikt nu ook eenduidige bereiken uit de bestaande broedtekst. Hergebruik deze afleiding als één bron voor tekst en kalender. De soortdetailtest toetst Pimpelmees (afgeleid bereik), Boerenzwaluw (expliciet bereik) en Rotgans (geen broedlijn).
- CAP-BIRD-012, relatie met CAP-BIRD-024 en CAP-BIRD-025. De soortkaart voegt landelijke broninformatie toe aan de gids. De private kaart behoudt de eigen navigatie, filters en pins. De lokale soortlaag is gecachet voor gebruik na offline herstart. Dit maakt de online achtergrondtegels van de persoonlijke kaart niet offline.
- L-019, L-039, L-027. Hergebruik een brongecontroleerde, afgeleide laag voor vaste gidsinhoud, met eigen legenda en een expliciete lege staat. Houd die gegevens gescheiden van persoonlijke records en voeg de gebundelde module toe aan de versiegebonden appcache.

- L-003 en CAP-BIRD-012. Versie 1.16.4 gebruikte kobaltblauw op lichte kaarten en lichter blauw op donkere kaarten. De berekende contrastverhouding in het vol gevulde deel ging van ongeveer 1,8:1 naar 3,3–4,6:1 tegenover land en water. Op 390 px gecontroleerd voor Rietgors in beide thema’s.
- In 1.16.5 volgde de wolk de statuskleur van de maandlegenda. De huidige kaart heeft een vaste meldingsschaal voor alle soorten. De soortdetailtest controleert bij Rietgors en Boerenzwaluw dat kaart en kaartlegenda dezelfde meldingskleuren gebruiken.

- CAP-BIRD-012, L-017, L-019. De kaart bewaart nu de onderliggende meldingentotalen per vak. De legenda en de kaart gebruiken dezelfde grenzen en symbolen. Test de klassen tegen de brondata en behoud het onderscheid tussen een lage meldingsfrequentie en weinig vogels. De persoonlijke kaart en de offline gidsroute zijn afzonderlijk gecontroleerd.
