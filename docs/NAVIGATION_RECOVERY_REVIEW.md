# Soorten, Terug en zoom — 2026-11-06

Eigenaarsmelding: Soorten leeg/vastgelopen op preview 0ed4c3c. Alle 11 CI-suites van die versie waren inmiddels geslaagd. Dit is dus géén bewijs dat de eigenaarservaring goed was. De beschermde Vercel-preview vraagt in onze browser om login; testen vinden op dezelfde lokale bron plaats. Exacte toesteloorzaak nog niet bevestigd.

Aangetroffen crashpad: gids las ieder sighting.speciesId zonder nullcontrole voordat HTML werd opgebouwd. Een null-record in een schema-v2-backup kon zo de volledige route blokkeren. Gids projecteert nu alleen bruikbare soortreferenties; originele opslag blijft ongewijzigd. Detail-sorting accepteert afwijkend datumtype. Router toont bij een renderfout een heropenknop en behoudt navigatie in plaats van een blanco scherm. Geen claim dat hiermee alle mogelijke toestelproblemen opgelost zijn.

Terug: app registreert routes in History. Browser/Android Terug sluit eerst de bovenste actieve soortsheet, foto, waarneming, soortkiezer, bevestiging, pinpicker of kaartpaneel. Daarna vorige route. Op Home is een tweede terugdruk binnen 1,8 seconde nodig om te vertrekken. Sluiten gebruikt bestaande componentfuncties voor cleanup; geen kaartbronbestand gewijzigd. Invoer wordt niet opgeslagen door Terug; soortkiezer sluiten behoudt het onderliggende formulier.

Zoom: viewport op schaal 1; mobiele velden minimaal 16 px tegen focuszoom. Tweevinger-pagezoom wordt buiten Leaflet voorkomen; kaartgebaren blijven naar Leaflet gaan. Besturingssysteem-toegankelijkheidszoom kan dit overrulen; fysiek Android/iOS pinch nog niet bewezen.

Functiekaartdelta: CAP-BIRD-001 route Back/Forward en vensterprioriteit; CAP-BIRD-009–015 robuuste gids met herstelstaat; CAP-BIRD-022/025 kaartgebaren behouden. Learnings L-071/L-076/L-077: schone CI-fixtures dekken bestaande gebruikersdata niet; negatieve records, herhaald navigeren en geneste vensters afzonderlijk testen. Bij lage reproduceerbaarheid eigenaarservaring niet verwerpen en vermoedelijke oorzaak niet als bewezen presenteren.

Nieuwe test tests/test_navigation_recovery.py controleert ongewijzigde opslag met incompleet record, echte gidsbediening, geneste Terug, route Back/Forward en eventgrens pagina/kaart. Leaflet in die test is een stub; geen bewijs van fysieke pinchzoom of echte kaarttiles. Bestaande maptests blijven apart. Tests/preview/commitbewijs in PR35. Geen merge of livegang geautoriseerd.

Aanvullende browserbevinding: als Terug al vóór de eerste animatieframe wordt gedrukt, heeft een soortdetail nog niet de open-status. Open-status wordt nu direct gezet, zodat zowel pointerbediening als Terug meteen beschikbaar is. Nieuwe cacheversie 1.15.0-guide-navigation; alleen codecache vernieuwd, media en gebruikersopslag behouden. CI op ee9f3cf: nieuwe navigatieregressie geslaagd; definitieve foto/versiecommit opnieuw controleren.
