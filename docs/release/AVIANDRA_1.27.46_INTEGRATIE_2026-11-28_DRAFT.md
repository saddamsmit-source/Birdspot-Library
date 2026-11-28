# Aviandra 1.27.46 · integratievoorbereiding (DRAFT)

Eigenaar 28-11-2026: 'Ga verder en zet live'. Autorisatie ontvangen; pre-releasegates niet opgeheven. Geen publicatie, productie- of privéaliaswijziging. Basis Aviandra 1.27.45 `332b9dcf076b5c97140e37c2a95b8d47b161c2a1` (#385), F3-R08b `f0a9ca78b431a68bffa83e61056d466dbbffe626` (#386). Gemeenschappelijke basis `1cb52274ce39dce19d22b69864063025efe6917d`. Beide writers vrijgegeven. Integratie als afzonderlijke kandidaat, nooit losse CI-scores als release-PASS. Release HOLD.

## Integratiebewijs

Basis-tree Aviandra plus 16 uitsluitend F3-gewijzigde bestanden en acht samengevoegde overlappende bestanden. De 141 uitsluitend Aviandra-gewijzigde bestanden zijn behouden (README en sw.js krijgen gecontroleerde kandidaat-aanvulling). Voor elk overlapbestand is de Aviandra-patch aantoonbaar volledig: toepassing op gemeenschappelijke basis reproduceert exact de Aviandra-versie, toepassing op F3 is uniek; voor twee kennisbestanden zijn de herhaalde naamvervangingen geteld en exact tegen beide versies bewezen. De eerste F3-payload en 24 tweede-rondebesluiten behouden. Media-JSON en gegenereerde JS inhoudelijk gelijk, IJsvogel- en R08b-rollen gecontroleerd. Versie 1.27.46.

## Releasegates

| Gate | Stand bij integratie |
|---|---|
| Eigenaarautorisatie | VERIFIED: 'zet live' 28-11-2026 |
| Gecombineerde CI op nieuwe SHA | NOT TESTED bij opbouw; CI moet eindstatus krijgen |
| Preview met exacte kandidaat en toegangscontrole | NOT TESTED |
| Android/Samsung/PWA echte kernroute en update | NOT TESTED op geïntegreerde kandidaat |
| Offline opslaan/heropenen, opslagfout en ZIP-herstel | NOT TESTED op fysiek doeltoestel |
| Veiligheid/privacy, hosting en productieconfig | OPEN; geen kosten- of hostingwijziging |
| Branchbescherming | UNKNOWN; main branchmetadata eerder protected=false, volledige afdwinging niet bewezen |
| Gids | 24/140 tweede ronde, 0 volledige F3-PASS; Velduil-foto nog BLOCKED |
| Rollback | main 5bf67043 en openbare reviewbranch 0f9f631 zijn gedateerde, ongewijzigde Git-herstelpunten; daadwerkelijke vaste privédeploy/alias en gegevensherstel vóór publicatie verifiëren |

Release HOLD. Alleen concept-PR; geen publicatie, productie- of privéaliaswijziging. SYNC-CHECK PARTIALLY TESTED: project-Index 3.14 FINAL, Projectinstructies 2.14, Handbook 2.18 en Birdspot-norm 1.10; hostvelden niet volledig bevestigd. Credits UNKNOWN.
