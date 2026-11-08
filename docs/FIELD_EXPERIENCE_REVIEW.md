# Birdspot veldbediening · 1.18.0-field-preview-2

## Afbakening en herkomst

De eigenaar keurde sneller openen, breed zoeken, kaartbediening, compacte waarnemingsinvoer en leesbaarheid met behoud van bosgroen goed. Mobiel en desktop gebruiken dezelfde functies en opslag. De privémedia blijven lokaal. Een optionele koppeling met de eigen cloud en bewust gedeelde communitykopieën vormen een apart ontwerpbesluit.

- Productie- en mainbasis bij start: `5bf67043e830e977749f0ee593cf9f41f0e2822b`.
- Gidsbasis: [PR #77](https://github.com/saddamsmit-source/Birdspot-Library/pull/77) op `53d05f9acb967499b1016d7ea0fe141cc985b323`, inclusief [appbreed zoeken uit #69](https://github.com/saddamsmit-source/Birdspot-Library/pull/69).
- Gericht overgenomen uit [PR #52](https://github.com/saddamsmit-source/Birdspot-Library/pull/52) op `34b9f95`: herstel- en ZIP-validatie, GPS-beveiliging, updatebediening, een sluitbare pinpopup en terugkeer naar de kaart. Gids en zoekresultaten zijn samengebracht op `feat/birdspot-field-experience`.

## Functiekaart en regressies

| Capability | Gewijzigd gedrag | Controle |
|---|---|---|
| CAP-BIRD-001/003/004 | Intro verschijnt eenmaal per browserprofiel. Home biedt breed zoeken, Waarnemen en Laatste waarneming. De diashow heeft pauze en respecteert de systeemvoorkeur voor minder beweging. Desktop zet recente waarnemingen naast de vogel. | Intro en behoud van records in `tests/test_startup_splash.py`. Zoekgroepen, focus, Terug en offline zoeken in `tests/test_app_search.py`. Lokale Chromium-proef op 320 px, 200% tekstsimulatie en 1440 px. |
| CAP-BIRD-017/018/021/022 | Soort, datum, plek en media staan vroeg in het formulier. De herkenningsbron, zekerheid en notities blijven bereikbaar onder Meer details. De datum volgt de lokale kalender. Bestanden worden vooraf geopend om hun bruikbaarheid te toetsen. Een mislukte registratie houdt het formulier open en ruimt nieuw geschreven media en plek op. Oude bijlagen worden na bevestigde opslag opgeruimd. | `tests/test_sighting_merlin_pins.py` controleert beeld, video, pin, Merlin, bestaande velden en herstel na een geïnjecteerde schrijffout. Browserproef met JPEG, H.264-MP4, defecte JPEG en schone herpoging. |
| CAP-BIRD-027/028 | Klik, tik, Escape en Terug sluiten de pininformatie via dezelfde opruiming. Leaflet verschuift de kaart niet bij herstel van focus. Browsergeschiedenis bewaart filter, positie en zoom. Ook een opgeslagen plek zonder waarneming kan worden gevonden. | `tests/test_map_k4.py`, `tests/test_map_k5.py`, `tests/test_navigation_recovery.py`. Aanvullende proef met echte Leaflet-code en gesimuleerde GPS. |
| CAP-BIRD-034/036/037–040 | Filmselectie, favorieten, bestanden en plekrelaties gaan mee in ZIP. Een beschadigde of onvolledige ZIP krijgt een fout. De profielpagina controleert of de actieve cache de appbasis bevat. Een nieuwe worker kan wachten tot de gebruiker de update toepast. | `tests/test_profile_backup.py`. Tijdelijke lokale profielen voor herstel, offline openen en filmweergave. Kaarttegels, fysiek toestel, geïnstalleerde PWA en daglicht vragen aparte controle. |

## Kennisdelta en vervolg

- L-042/L-075. Na sluiten focus terugzetten hoort bij toegankelijkheid. Leaflet kan hierdoor automatisch pannen. Controleer kaartcentrum en zoom naast zichtbaarheid en focus.
- L-071/L-076. Media kunnen al geschreven zijn vóór een waarneming wordt opgeslagen. Bewaar de originele records, schrijf bijlagen in één IndexedDB-transactie en verwijder bij een mislukte opslag alleen de voor deze invoer geschreven media. Een foutproef telt bestanden en plekken vóór en na herpoging.
- L-009/L-011. Een beschikbare update en een foutmelding hebben verschillende bediening en levensduur. Houd hun DOM-elementen apart en controleer een terugkerende gebruiker met een wachtende worker.
- Gebruikersacceptatie: probeer de kandidaat op het fysieke doeltoestel met daglicht, grotere systeemtekst en een eigen toestelvideo. Gegevens uit verschillende previewdomeinen zitten in aparte browserprofielen. Kies een uiteindelijke integratiebasis na afstemming met de schrijver van de gidsstapel.
