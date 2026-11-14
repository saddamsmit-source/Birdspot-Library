# Birdspot F2 · hercontrole van 140 soorten met gidsfoto’s

Doel is per soort de eigen foto’s, rollen, bronrechten, determinatie, maten en vergelijkingen hercontroleren volgens [de fotonorm](../BIRDSPOT_KWALITEITSNORM.md). De [F1-voortgang](F1_VOORTGANG_TOT_140.json) is een afzonderlijke eerste beoordeling. Deze tabel telt unieke soorten die in F2 zijn opgepakt. Open onderdelen blijven terugzoekbaar. Een volledige F2-PASS en een gemeten technische controle zijn afzonderlijke statussen.

| Soort | Hercontrole of wijziging | Bewijs en open punten |
|---|---|---|
| sp002 Houtduif | Juveniel, soortverschillen en vervangen vluchtfoto met witte bovenvleugelband | [PR #193–196, afsluitende PR #196](https://github.com/saddamsmit-source/Birdspot-Library/pull/196). Volledige onafhankelijke F2-aftekening open. |
| sp003 Holenduif | Juveniel, brongeverifieerde vrije vlucht en soortverschillen | [PR #195](https://github.com/saddamsmit-source/Birdspot-Library/pull/195). Volledige onafhankelijke F2-aftekening open. |
| sp004 Turkse Tortel | Juveniel, heruitsnede hoofdfoto, vergelijkingen en maten | [PR #196](https://github.com/saddamsmit-source/Birdspot-Library/pull/196). Volledige onafhankelijke F2-aftekening open. |
| sp005 Buizerd | Eigen foto’s en rechten herbevestigd. Een scherpe donkere Buizerd in vrije vlucht vervangt een voorlopige vluchtfoto. Hoofdfoto, leeftijdsrollen, biometrie, leefgebied en onderscheid met Ruigpootbuizerd gecontroleerd. | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M1](soortaudit/M1.json). Afzonderlijke rustfoto van juveniel blijft open. Staarthoeken blijven een beschreven bronverschil. |
| sp248 Wespendief | Vier foto’s en rechten herbevestigd. Maten, seizoen en kleedkenmerken aangescherpt. Vrouwtje in vlucht als extra vergelijking naast een volwassen Buizerd. | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M2](soortaudit/M2.json). Afzonderlijke foto vrouwtje in rust blijft open. Een groter vluchtbeeld blijft een wens. |
| sp253 Ruigpootbuizerd | Vier foto’s en rechten herbevestigd. De drie eerder onbereikbare iNaturalist-fotopagina’s en gekoppelde waarnemingen zijn gecontroleerd. Maten en onderscheid met Buizerd onderbouwd. | [Brondossier F2-05](../evidence/GUIDE_SOURCE_AUDIT_2026-11-14_F2_05.json), [M2](soortaudit/M2.json). Rustfoto’s voor vrouwtje en juveniel en een gelicentieerde referentieroep staan open. |

## F2-05 · controle en herstel

- Basis [PR #197 op 4f0cab0](https://github.com/saddamsmit-source/Birdspot-Library/pull/197), 25/25 controles op die basis. CAP-BIRD-012 en CAP-BIRD-015.
- Dertien gebruikte beelden opnieuw naast het bijbehorende bronbeeld gecontroleerd. Voor de vervangende foto is het oorspronkelijke Commons-bestand bekeken en de omzetting naar WebP gecontroleerd. De bronaudit bevat beide hashes. iNaturalist-fotopagina’s leveren de individuele licentie en de gekoppelde waarnemingen leveren soort en beschikbare annotaties. Een deelnemerannotatie geldt als aanvullend bewijs bij beeldinspectie.
- Een tekstuele bron die in een eerdere run onbereikbaar was, kan via een andere toegankelijke leesroute alsnog directe broninformatie opleveren. Hergebruik het eerder opgeslagen vergelijkingsbewijs met een expliciete datum en voeg het nieuw waargenomen bewijs toe. Dit levert praktijkbewijs voor de werkwijze uit L-080.
- De eerdere donkere Buizerd-foto en de rechten ervan staan in het bronarchief. De nieuwe foto toont de brede vleugels en korte, gebandeerde staart. Leeftijd en geslacht van die opname blijven open. De volwassen en juveniele vluchtparen blijven ieder beschikbaar, samen met het extra paneel voor Wespendief-vrouwtje.
- De lokale collectiecontrole bevestigt 140 soorten met geregistreerde beelden. Alle geregistreerde gidsbeelden in de controle hebben een bestaand bestand, passende soortmetadata, creditvelden en een offline-cachebron. De eigen secties hebben geen exact dubbele getoonde foto’s. Dit bewijst structurele dekking. Bron- en beeldverificatie gaan in de volgende batches door.
- Controleer de CI op de HEAD van de vervolgbatch. De eerdere browservastlegging bij de gemuteerde rijen is geen bewijs voor de nieuwe inhoud. De fysieke Android-test blijft een aparte releasecontrole.

**Volgende batch:** Sperwer (sp006), Havik (sp007) en Torenvalk (sp008). Begin met vrije vlucht, leeftijdslabels en beschikbare foto’s voor het vrouwtje. Werk pas aan de 457 soorten zonder bestaande gidsfoto nadat de 140 opnieuw zijn doorlopen.
