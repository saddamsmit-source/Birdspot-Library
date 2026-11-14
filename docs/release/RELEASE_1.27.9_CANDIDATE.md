# Birdspot 1.27.9 · geïntegreerde releasekandidaat

14 november 2026 · kandidaat voor GitHub Pages · publicatie geblokkeerd door open releasevoorwaarden.

| Betrokken stand | Bewijs |
|---|---|
| Openbare GitHub Pages-review | 1.27.6 op `21ce9060`, gecontroleerd via de geleverde `sw.js` |
| Productie | `main` op `5bf67043`. De Vercel-URL levert een serviceworker met versie `1.14.0-map-k5-links`. |
| Geïntegreerde app- en gidsbasis | [Concept-PR #200](https://github.com/saddamsmit-source/Birdspot-Library/pull/200) op `8031dd3`. F1 140/140 en F2 12/140 opgepakt. |
| Autorisatie | Eigenaar gaf op 14 november opdracht tot livegang. |
| Schrijver | Codex op de 1.27.9-kandidaatbranch. Gidsontwikkeling heeft een eigen reviewbranch. |

Versie 1.27.9 gebruikt een eigen serviceworkercache. De RU-08-verbetering uit kandidaat [#183](https://github.com/saddamsmit-source/Birdspot-Library/pull/183) blijft ook op hogere versies actief. De wijziging aan deze kandidaat omvat de cache-identiteit, de releaseproef en dit dossier. De appdata en mediabestanden komen uit #200.

| Releasevoorwaarde | Bewijs en vervolgstap |
|---|---|
| Regressies op deze kandidaat | GitHub Actions op de PR-head. De upgradeproeven starten vanaf 1.14.0, 1.27.5 en 1.27.6 en controleren lokale opslag, offline start, nieuwe gidsbeelden en exacte modulebytes. |
| Fysieke Android/PWA | NOT TESTED. Installeer exact deze kandidaat. Test camera/bestand, GPS-toestemming, opslaan, Android Terug, heropenen, nieuwe offline invoer en upgrade. |
| Herstel op een schoon tweede toestel | NOT TESTED. Herstel een ZIP met fictieve waarneming en foto en open beide opnieuw. Browserherstel levert afzonderlijk bewijs. |
| Publieke fotorechten | PARTIALLY TESTED. De bestaande soort- en bronaudits dekken een deel van de gids. Rond de open rechten en de vereiste creditregels af voor de uit te rollen assets. |
| Hosting en terugval | Publieke HTTP en twee bestaande versies bevestigd. Providerinstellingen en toepasselijke grenzen nog te toetsen vóór publicatie. |
| Publicatie en productiecontrole | BLOCKED zolang de releasevoorwaarden openstaan. |

Herstelpunt is GitHub Pages 1.27.6 op `21ce9060`. Bij een latere rollback krijgt de herstelde code een nieuwe cacheversie. Test de terugweg met representatieve data en behoud de lokale waarnemingen en foto’s. Zie L-026, L-027 en L-068.

Volgende actie is het CI-resultaat op exact deze head controleren en de ontbrekende toestel- en rechtenbewijzen aftekenen. De bestaande Windows/Android-pilot [#184](https://github.com/saddamsmit-source/Birdspot-Library/pull/184) is gepind op 1.27.8 en moet op deze kandidaat worden gericht voordat die pilot als bewijs kan dienen.
