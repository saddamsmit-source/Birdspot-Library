# Birdspot Signature Edition — Premium Startup Splash

Status: **Review op PR #14**. De dropdownfilter en 5-secondenintro worden op dezelfde featurebranch getest.

## Opstartscherm
- De **eerder door de gebruiker gekozen Birdspot-ijsvogelafbeelding** is als lokaal AVIF-image toegevoegd aan de repo (720 × 1280, 21.449 bytes) met SHA-256 `78a7930e4f4101e03461f9429426555294327b207281a8673374032712ad335a`.
- Volledig scherm in premium bosgroen, originele logo/tekst behouden, afbeelding in `contain` met bijpassende vervaagde achtergrond om tekstafsnijding te voorkomen op 19.5:9 Android-schermen.
- Vijf seconden zichtbaar bij het **laden van de app-pagina**. De Home-route laadt ondertussen; intro verdwijnt pas zodra deze geïnitialiseerd is.
- De gebruiker kan 'Overslaan' kiezen om sneller te beginnen.
- De splash verandert geen IndexedDB, localStorage, sightings, foto's of routehistorie.
- Als het afbeeldingsbestand niet laadt, toont het scherm een simpele tekstfallback.
- Afbeelding en splashscript zijn opgenomen in de service-worker precache; AVIF vereist een moderne browser.

## Grenzen
- Een PWA die door Android/iOS uit het geheugen wordt hervat zonder page reload zal niet opnieuw de pagina-opstartintro tonen. Deze implementatie geldt voor een nieuwe paginalaadbeurt / koude start.
- PWA-installatie/OS-native splash is een afzonderlijke Android/iOS-functionaliteit die niet door deze HTML-intro wordt vervangen.
- De afbeelding heeft geen nieuwe Artlist-credits gekost.

## QA
- `tests/test_startup_splash.py`: exact git-asset-hash, echte afbeelding decoderen, 5-seconden-timing, app-ready event, skip, gegevensbehoud.
- `tests/test_explorer_species_cluster.py`: native dropdown en statusfilter-regressie.
- Bestaande faseregressies blijven verplicht.
- Geen productiepublicatie zonder expliciete approval van de Project Owner.
