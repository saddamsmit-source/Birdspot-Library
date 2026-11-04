# Birdspot Signature Edition — Fase 3: Journal & Inzichten (REVIEW)

## Productscope
- **Personal Birding Journal:** vernieuwde warme premium stijl, chronologische tijdlijn, zoeken op soort/locatie/notitie, jaarfilter, sorteerkeuze, persoonlijke mijlpalen, eerste zichtbare foto's uit IndexedDB, openen van bestaande waarnemingen.
- **Mijn Inzichten:** eigen teal/intelligence-stijl, jaarkeuze, vier KPI's, maandgrafiek (waarnemingen / cumulatieve soorten), leefgebiedverdeling, top-5 soorten en tijdgebonden mijlpalen.
- Bereikbaar vanaf Home en over en weer tussen Journal ↔ Inzichten. Geen uitbreiding van de vaste vijf navigatieknoppen.
- Bestaande waarnemingen, media en offline/back-up systeem blijven de enige waarheid. Geen nieuwe opslagkeys, geen datamigraties.

## Data- en rekencontract
- `src/features/insights/analytics.js` is de gedeelde, pure berekeningslaag.
- Voorjaars- en historische waarnemingen blijven afzonderlijk per jaar; 12 kalendermaanden worden weergegeven inclusief maanden met nul waarnemingen.
- Jaarstatistiek telt uitsluitend werkelijk geldige kalenderdatums in `YYYY-MM-DD`; ongeldige of ontbrekende datums worden expliciet gemeld.
- Unieke soorten worden uit soort-ID bepaald, met een naamfallback voor legacyrecords.
- Leefgebieden tellen alleen indien werkelijk ingevuld. Er worden nooit locaties/soorten/mijlpalen bedacht.
- Top-5 is gebaseerd op aantallen waarnemingen per soort, niet het aantal individuele vogels.
- `photographed` telt waarnemingen met minstens één media-ID; het claimt niet het daadwerkelijke afbeeldingsformaat.

## Design en betrouwbaarheid
- Geen extra CDN/beeldbank/API benodigd. Rijke CSS-lagen en SVG-grafiek; werkt zonder internet.
- Journal toont uitsluitend eigen vogelmedia; Blob-URL's en route-callbacks krijgen cleanup.
- `prefers-reduced-motion` gerespecteerd.
- Buiten scope: automatische mediavideo-export, cloud-synchronisatie, externe vogeldata.

## QA en release
- `tests/test_signature_phase3.py`: lege schermen, multi-year, ongeldige datums, maandelijks tellen, leefgebieden, toplijst, filter/sorteren, echte synthetische IDB-Blob en mobiele schermen 360/390/430.
- GitHub Actions `signature-phase3-qa.yml` en regressieflows van vorige fasen moeten PASS geven.
- Open: real-device, drukke mediabibliotheken, handmatige kleur-/contrastcontrole en visuele acceptatie.
- Nieuwe featurebranch; geen merge naar `main` zonder expliciete Project Owner-goedkeuring.
