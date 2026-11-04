# Birdspot Signature Edition — Fase 2 (REVIEW)

## Doel
Species & Media Experience — premium vogelbibliotheek, persoonlijke favorieten,
echte eigen fotogalerijen, filmselectie en niet-destructieve duplicaatwaarschuwingen.

## Gebouwd
- Rijk soortdetail, eigen fotogalerij en fotovergroting.
- Soortfavorieten als afzonderlijke persoonlijke collectie; favorietenfilter.
- Eigen beelden uit IndexedDB; legacy koppelingen via photoIds ondersteund.
- Zeldzaamheid niet afgeleid uit trek-/wintercategorie: geen ongefundeerde labels.
- Media Studio v2: soortenfilter, zoeken, video/foto, favorieten en filmselectie.
- Duplicaatindicatie alleen bij overeenkomst van soort, datum, bestandsnaam,
  MIME-type en grootte. Geen automatische verwijdering.
- Favorieten en filmselectie mee in ZIP-back-up, herstel en veiligheidskopie.
- Responsieve premium vormgeving binnen de bestaande Birdspot-stijl.

## Rechten en scheiding
Geen nieuwe beelden voorgesteld als persoonlijke waarnemingen.
Eventuele Artlist-sfeerassets horen uitsluitend bij decoratieve UI,
met aparte herkomst/gebruik en goede mobiele fallback.
Geen externe of cloudopslag voor persoonlijke foto's.

## QA / vrijgave
Testen: media Blob-presentatie, soortdetail, persistente favorieten,
filmselectie, ZIP export + herstel, 360/390/430px, licht/donker.
QA-resultaten pas PASS als de echte runtime/browsertests zijn uitgevoerd.
Fase 1 blijft op main; Fase 2 wordt afzonderlijk beoordeeld.
Geen merge naar main zonder expliciet Project Owner-akkoord.

## Later
Filmrendereing/export, echte perceptuele duplicaatdetectie, uitgebreid
foto-sorteren en veilig delen met de centrale reisapp zijn latere fases.
