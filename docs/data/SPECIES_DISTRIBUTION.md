# Verspreidingskaart per soort

In **Soorten → vogel → Waar** staat de openbare soortkaart boven **Jouw plekken**. De soortkaart is een lokale, statische SVG. **Toon op de kaart** en de plekknoppen blijven de persoonlijke kaart openen, gefilterd op soort of plek. De gids vraagt bij het tekenen geen locatie op en verstuurt geen persoonlijke waarnemingen.

## Herkomst en afbakening

- Waarnemingen uit **EOD – eBird Observation Dataset**, Imani et al. (2026), Cornell Lab of Ornithology, via GBIF geraadpleegd op 2026-11-06. Selectie uit 2020–2025, Nederland, aanwezige exemplaren, coördinaten zonder door GBIF gemarkeerde geografische problemen, uitsluitend CC BY 4.0. De waarnemingen zijn geaggregeerd en omgezet naar een lokale kaartlaag. [Dataset en auteurs](https://doi.org/10.15468/aomfnb) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
- Landgrenzen en binnenwater uit Natural Earth 1:10m, publiek domein. Omgezet naar Web Mercator en vereenvoudigd voor het mobiele overzicht. [Kaartbestanden](https://github.com/nvkelso/natural-earth-vector/tree/master/geojson) · [Gebruiksvoorwaarden](https://www.naturalearthdata.com/about/terms-of-use/)
- Kaartcellen van ongeveer 24 km breed in Nederland. Een cel wordt getoond vanaf vijf records, en een kaart vanaf drie zichtbare cellen. De bron bepaalt welke waarnemingen publiek zijn. Dwaalgasten, ontsnapte en historische soorten krijgen geen laag. Voor onvoldoende onderbouwing toont de gids een melding. De bron kan meldingen op populaire telplekken oververtegenwoordigen. De laag beschrijft vastgelegde waarnemingsgebieden uit alle seizoenen. Ook buiten de wolk kan de soort voorkomen. Er worden geen aantallen, nestlocaties of exacte punten afgebeeld.
- Deze momentopname toont een kaart voor 292 van de 597 soorten. Van de 319 soorten in de geselecteerde categorieën haalden 27 de drempel niet.

## Dataset opnieuw bouwen

Installeer `mapbox-vector-tile` en voer uit vanuit de repo-root met Node.js beschikbaar.

```sh
python tools/species/build_distribution.py /pad/naar/download-cache
```

Gebruik voor een nieuwe momentopname een lege cachemap. De generator koppelt op wetenschappelijke naam en GBIF-soortsleutel, vergelijkt het aantal records in de kaarttegel met de bijbehorende zoekopdracht en stopt bij onopgeloste fouten. Voor Witvleugelstern en Witwangstern ontbrak één record in de kaarttegel. Daar zijn de publieke records met dezelfde filters direct geaggregeerd en opnieuw geteld. Het gebundelde bestand bevat per soort de bron-ID en de indices van zichtbare cellen. Het bevat geen ruwe waarnemingen. Noteer bij een volgende datasetversie de gegevensperiode en raadpleegdatum, controleer de bronlicentie opnieuw en verhoog de serviceworkerversie.

## Functiekaart en learning

- CAP-BIRD-012. De maandbalk in **Leefwijze** toont aanwezigheid met de bestaande statuskleuren. De roze markering zit op een aparte uitgelijnde rij, doorlopend over aangrenzende maanden. Alleen expliciet gedocumenteerde broedmaanden kleuren roze. De eerdere markering zat als smalle lijn in ieder maandvak en viel weg tegen de statuskleur.
- CAP-BIRD-012, relatie met CAP-BIRD-024 en CAP-BIRD-025. De soortkaart voegt landelijke broninformatie toe aan de gids. De private kaart behoudt de eigen navigatie, filters en pins. De lokale soortlaag is gecachet voor gebruik na offline herstart. Dit maakt de online achtergrondtegels van de persoonlijke kaart niet offline.
- L-019, L-039, L-027. Hergebruik een brongecontroleerde, afgeleide laag voor vaste gidsinhoud, met eigen legenda en een expliciete lege staat. Houd die gegevens gescheiden van persoonlijke records en voeg de gebundelde module toe aan de versiegebonden appcache.

- L-003 en CAP-BIRD-012. De wolk gebruikt kobaltblauw op lichte kaarten en lichter blauw op donkere kaarten. Wolk en legenda delen de kleur en dekking via dezelfde tokens. De berekende contrastverhouding in het vol gevulde deel gaat van ongeveer 1,8:1 naar 3,3–4,6:1 tegenover land en water. Op 390 px gecontroleerd voor Rietgors in beide thema’s, met de automatische en expliciete themakeuze. De bestaande soortdetailtest is geslaagd.
