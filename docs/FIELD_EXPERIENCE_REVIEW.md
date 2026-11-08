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

## Veldschrift · 1.19.0-veldschrift-preview

Basis: veldpreview [PR #78](https://github.com/saddamsmit-source/Birdspot-Library/pull/78), commit `f98aa6637714569c80d3dd34aea0ba7e9d40af45`. De parallelle gidsronde [#79](https://github.com/saddamsmit-source/Birdspot-Library/pull/79) houdt zijn eigen integratiepad.

| Capability | Wijziging en controle |
|---|---|
| CAP-BIRD-001/003/004 | Home heeft één primaire invoeractie, een compact gidsportret met licentie en uitklapbare herkenning, en directe routes naar de soortkaart en opgeslagen waarnemingen. Leeg Home toont geen laatste-waarnemingknop. De bestaande intro, brede zoekbalk en fotopauze blijven werken. Desktop plaatst de eigen waarnemingen naast het portret. |
| CAP-BIRD-005–010 | Soortzoeken en filters staan direct onder de titel. Soortnamen en recente soorten openen ook via het toetsenbord. In de soortkaart houden gidsfoto’s met credits en eigen foto’s ieder hun eigen plek. Escape geeft focus terug aan de soortknop. |
| CAP-BIRD-014–018/027/028 | Waarnemen heeft één vaste opslagactie met lokale opslaguitleg, zichtbare keuzes en een rustiger formulier bij grotere tekst. De kaart gebruikt dekkende bediening en behoudt statusiconen. Na het sluiten van een pin blijven zoekterm, kaartcentrum en zoom behouden. |
| CAP-BIRD-034/036/037–040 | Lege Media Studio brengt de eerste invoeractie vóór de filters. Nul resultaten heeft een aparte resetactie. Gevulde kaarten tonen soort, datum, plek en bestandstype waar beschikbaar. Favoriet en filmselectie behouden toetsenbordfocus na het opnieuw tekenen. Profiel gebruikt dezelfde knopstijlen. |

**Dubbele controle.** Chromium op 320, 390 en 1440 CSS-pixels, inclusief donkere systeemweergave, touch, toetsenbord, 200% gesimuleerde tekst en minder beweging. Geteste tekstcontrasten in de lichte weergave: primaire knop en gidslabel 11,66:1, geselecteerd filter 10,43:1, zoekhint en profieluitleg 6,21:1. De proef met fictieve foto en video omvatte een defect bestand, een geïnjecteerde schrijffout, herpoging, terugvinden, filteren, favoriet, filmselectie, afspeelbare filmexport en ZIP-herstel in een schoon profiel. Offline openen, terugzien en nieuw opslaan zijn afzonderlijk beproefd. De bestaande no-pinch-keuze buiten de kaart is behouden. Fysieke bediening, systeemtekst op een telefoon, daglicht, kaarttegels en de externe Artlist-stream vragen afzonderlijk bewijs.

**Hergebruik.** Scheid de lege verzameling van nul zoekresultaten en een laadfout. Controleer de hele taak opnieuw als een knop of onderdeel verhuist. Gebruik dekkende kleurvlakken op beeld, en laat tekst en vorm de selectie verduidelijken. De fonts gebruiken een lokaal beschikbaar lettertype of systeemfallback en vragen geen netwerkverzoek. Geen wijzigingen in opslagformaat, koppelingen of exportformaat.
