# Birdspot Library | Betrouwbaarheid ronde 4/4

Basis [main 5bf6704](https://github.com/saddamsmit-source/Birdspot-Library/commit/5bf67043e830e977749f0ee593cf9f41f0e2822b). Branch `feat/navigation-gps-offline`, kandidaatversie `1.14.1-navigation-recovery`.

| Onderdeel | Oorzaak op main | Aanpassing en afbakening |
|---|---|---|
| Terug en vooruit | De router registreert geen appgeschiedenis. | Bestaande sluitacties per dialoog, daarna terug naar de vorige route. Scroll en selectie voor Soorten en Kaart blijven beschikbaar in dezelfde paginasessie. Op Home vraagt Terug zonder dialoog een tweede druk om de app te verlaten. |
| GPS en kaart | Een late GPS-callback kan een nieuwere locatiekeuze overschrijven. | Een nieuw locatieverzoek, handmatige pin of verwijdering maakt oudere callbacks ongeldig. Kaartfocus volgt geen oude GPS-aanvraag tijdens pinplaatsing. Handmatige coördinaten blijven bereikbaar via het formulier en via de kaart zonder Leaflet. |
| Offlinebasis | Ontbrekende bestanden mochten stil uit de precache vallen. Een versienummer werd getoond als bewijs voor offlinegebruik. | Verplichte bestanden worden als set geïnstalleerd. Profiel vraagt de controlerende worker of de bestanden in de cache staan. Externe kaarttegels, lettertypen en externe media vallen buiten de offlinebasis. |
| Updates | De worker activeert automatisch en de melding biedt geen werkende actie. | De huidige codecache bedient zijn eigen versie. De update wacht bij open clients. De knop controleert open invoer voordat de worker activeert en opnieuw voordat de vragende tab herlaadt. Andere tabs behouden hun pagina en invoer. |

De codecache per actieve release is een Birdspot-specifieke ontwerpkeuze voor deze concept-PR. Handbook v2.10 §3.6 gebruikt standaard netwerk-eerst voor de app-shell (L-009). In deze kandidaat geldt het netwerk als terugval voor een ontbrekend shellbestand. Daarmee kan een reguliere aanvraag geen bestaande shellbestanden van de actieve worker vervangen terwijl een release nog wacht. Kernbestanden installeren atomair volgens §3.6, met diashowfoto’s apart als optionele cache. De bestaande grens van media- en gebruikersopslag blijft gescheiden.

## Bewijs en overdracht

- `python tests/test_app_recovery.py` controleert in Chromium de bovenste dialoog, terug en vooruit, selectie en scroll, handmatige invoer zonder kaart, een vertraagde GPS-callback, een ontbrekend cachebestand, een mislukte workerinstallatie, een wachtende update, mediabehoud zonder nieuwe diashowdownloads, twee tabs en herladen zonder netwerk.
- De bestaande suites voor waarneming, kaart K5 en profiel/back-up controleren de aangrenzende routes. De workflow voor waarnemingen voert ook de nieuwe hersteltest en profieltest uit.
- Fysiek Android, geïnstalleerde PWA en productie blijven afzonderlijke bewijsstappen. Controleer op Android in het bijzonder de systeemknop Terug, geolocatietoestemming en de update over een bestaande installatie.
- Eerdere conceptbediening staat in [#35](https://github.com/saddamsmit-source/Birdspot-Library/pull/35). Houd bij integratie rekening met gedeelde routercode in [#45](https://github.com/saddamsmit-source/Birdspot-Library/pull/45) en de gedeelde worker en versie in [#45](https://github.com/saddamsmit-source/Birdspot-Library/pull/45), [#47](https://github.com/saddamsmit-source/Birdspot-Library/pull/47) en [#49](https://github.com/saddamsmit-source/Birdspot-Library/pull/49). Behoud de audio-rangeafhandeling uit #49 en geef de geïntegreerde worker een eigen versie.
- Voor de Birdspot-overdracht en de Capability Catalogus. Koppel het sluiten van een dialoog aan de bestaande route, de GPS-volgorde aan CAP-BIRD-017/019/021/022 en controle van de offlinebasis en de updateactie aan CAP-BIRD-037–040. Koppel de bewijzen aan L-009/L-010/L-011 met de hierboven beschreven afwijking bij L-009. Bescherm de bestaande tabs, zoek- en filterroutes, het waarnemingsformulier en de scheiding tussen codecache, mediacache en persoonlijke opslag.
- Eerstvolgende actie. Maak na review één integratiepreview met de vier concept-PR’s en controleer de gezamenlijke flows, inclusief Android. Vraag daarna een afzonderlijk besluit over release.
