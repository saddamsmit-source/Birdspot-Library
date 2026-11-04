# Birdspot Explorer — Dropdownfilter mobiel (REVIEW)

## Gewijzigd
- Horizontale statusfilterchips vervangen door één native select/dropdown.
- Zoek vogelsoort blijft onafhankelijk van het filter op waarnemingswijze.
- De bestaande keuzes blijven: Alle, Gezien, Merlin Sound ID, Gezien én gehoord, Alleen gehoord, Niet vastgelegd.
- Alle opties bevatten de actuele aantallen van de geselecteerde soort, alleen voor waarnemingen met een geldige kaartpin.
- Een gekleurde stip naast de geselecteerde categorie behoudt de herkenbaarheid; de dropdownopties tonen een kort symbool.
- Bestaande marker- en clusterkleuren worden NIET aangepast.
- Geen wijziging aan opgeslagen waarnemingen, persoonlijke GPS-locaties, foto’s of video’s.
- Verhoogde service-worker-versie zodat mobiele PWA de gewijzigde bestanden ophaalt.

## QA en release
- Explorer browserregressie controleert dropdownopties, selecteren, kleurstatus, zoeken, wis filters, cluster en mobiele breedtes 360/390/430.
- Andere bestaande QA-reeksen moeten blijven slagen.
- Android/iOS-native dropdownweergave nog apart op toestel beoordelen.
- Geen merge/publicatie zonder eigenaarakkoord.
