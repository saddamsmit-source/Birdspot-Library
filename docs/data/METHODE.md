# Vogellijst Nederland — methode

`vogellijst-nederland.json` is de bron voor alle soortstatus in Birdspot Library.
`src/data/species.js` wordt daaruit bijgewerkt met `tools/species/apply_status.py`;
statusvelden worden nooit met de hand in `species.js` aangepast.

## Bronnen

| Onderdeel | Bron |
|---|---|
| Soortenlijst | CSNA *Lijst van Nederlandse vogelsoorten* (1 feb 2025), aangevuld met CDNA-nieuwe soorten t/m april 2026; basislijst Wikipedia *List of birds of the European Netherlands* (okt 2024) |
| Ontsnapte/verwilderde vogels | Sovon-soortenlijst (stats.sovon.nl/stats/soorten) |
| Broedstatus | Sovon *Broedvogels in Nederland* 2022 en 2025, Sovon-soortenlijst, Rode Lijst |
| Rode Lijst | Rode Lijst broedvogels 2016 (vastgesteld door LNV in 2017) |

## Velden

| Veld | Betekenis |
|---|---|
| `status` | Hoofdstatus: Standvogel, Zomergast, Wintergast, Doortrekker, Schaarse gast, Dwaalgast, Exoot, Ontsnapt, Onbevestigd, Historisch |
| `extra` | Tweede status, bijvoorbeeld Merel: standvogel, ook wintergast |
| `maanden` | Periode van normale aanwezigheid (`jan-dec` = jaarrond, `-` = onregelmatig) |
| `frequentie` | Grove klasse: Algemeen, Vrij algemeen, Schaars, Zeldzaam, Zeer zeldzaam |
| `broedvogel` | Ja (regelmatig), Incidenteel, Verdwenen, Nee |
| `rode_lijst` | Categorie Rode Lijst broedvogels 2016, leeg als niet op de lijst |
| `opmerking` | Bijzonderheden, nieuwe soorten, controlepunten |

## Beperkingen

- Maanden en frequentie zijn ingedeeld op basis van Sovon-gegevens en veldkennis, niet per soort gemeten.
- Broedparen per soort ontbreken; de recente Sovon-tabellen waren niet bereikbaar.
- Status `Onbevestigd` = alleen op Wikipedia, niet op de CSNA-lijst. Deze soorten gaan niet de app in.

## Verenkleed (H2)

`plumage` heeft per soort één schema: `adult_m`, `adult_f`, `juv`, `jaarling`, `breeding` (broedkleed, voorjaar en zomer),
`winter` (winterkleed) en `eclipse` (eclipskleed van eenden in de zomerrui). Seizoenskleed staat in
`tools/species/seasonal_plumage.json` en wordt toegepast met `python tools/species/apply_plumage.py` (idempotent).
Bron: veldgidskennis; teksten zijn kort en bedoeld voor herkenning in het veld.

## Leefwijze (H3)

`src/data/speciesLife.js` wordt gegenereerd uit `tools/species/species_life.json` met
`python tools/species/build_life.py` (idempotent; CI controleert dit). Per soort: broedperiode, nestplaats, aantal eieren,
broedduur, duur tot uitvliegen, broedsels per jaar, voedsel, gedrag, trek en een beschrijving van zang en roep.
Bron: veldgidskennis; waarden zijn gangbare bandbreedtes, geen metingen in Nederland. Gedekt: alle standvogels en
zomergasten (163). Soorten zonder leefwijze tonen de melding dat deze nog volgt; er worden geen waarden ingevuld.
