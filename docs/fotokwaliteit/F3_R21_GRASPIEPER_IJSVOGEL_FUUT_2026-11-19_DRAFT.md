# F3-R21 — Graspieper, IJsvogel en Fuut

**19 november 2026 · DRAFT / PARTIALLY TESTED · PR #313 · Release HOLD.**

Basis: vrijgegeven documentcheckpoint PR #312, `d830afe50f726ec7b3702ead33db6640136f9b2e`, boven functionele kandidaat `ed810ae8de34bccc26e6f759a3e815323f893a95`. Eigen branch met actieve writerclaim in PR #313. Dit is een bron-/inhoudsronde, geen publicatie.

## Stand en wijzigingen

**63/140 inhoudelijk opnieuw bekeken; 77 nog te starten; 0 FULL PASS.** Deze ronde telt uitsluitend sp072, sp075 en sp077. De wederkerige vergelijkingsverwijzingen bij Boompieper en Roodhalsfuut voegen geen kennisprofielen of soorten toe aan de vaste 140-cohort en vormen geen volledige audit van die partners.

- Graspieper: bestaande foto’s en kennis tegen bronbeeld, Vogelbescherming en de gelezen Blasco-Zumeta & Heinze-PDF gehouden. Sovon-trend toegevoegd met onderscheid tussen de periode vanaf 1990 en de laatste twaalf jaar. Herkenningsverschillen met Boompieper nu vanuit beide kaarten bereikbaar; fotopaar blijft verborgen.
- IJsvogel: vijf zichtbare foto’s gecontroleerd, waaronder echte vrije vlucht. Bestaande maatberekening en ruwe bronwaarden behouden. De eerder ingetrokken juvenielenrol blijft ingetrokken; originele bytes, metadata en historie blijven aanwezig. Vergelijking met Bijeneter blijft wederkerig.
- Fuut: twee foto’s van een vogel op water. De onjuiste F3-bevinding **“Geverifieerde vrije-vluchtfoto”** is ingetrokken en in `priorFindings` bewaard. Een vluchtfoto ontbreekt. Juiste Sovon-soort-ID **90** gekoppeld; brononderbouwde wintervergelijking met Roodhalsfuut wederkerig gemaakt, zonder een ongeschikt fotopaar te tonen.

## Fotobewijs en bronrechten

De bestaande bestanden zijn geopend en naast de bron bekeken. [Automatische controle](../media-intake/2026-11-19/origcheck-r21/origcheck.json), [actuele Commons-metadata](../media-intake/2026-11-19/origcheck-r21/commons-metadata.json) en [afzonderlijke visuele beoordeling](../media-intake/2026-11-19/origcheck-r21/visual-review.json) bewaren de uitkomsten en lokale SHA-256 per foto. Geen foto toegevoegd of vervangen.

| Controle | Uitkomst |
|---|---|
| Zichtbare foto’s | 10: Graspieper 3, IJsvogel 5, Fuut 2 |
| Bewaarde niet-vrijgegeven foto | IJsvogel `sp075-juv-review.webp`, afzonderlijk onderzocht |
| Automatische bronbeeldmatch | 10/11 inclusief archieffoto; dus 9/10 zichtbare foto’s |
| Graspieper in vlucht | Automatisch `r=0.785`, onder vaste grens `0.90`; uitkomst blijft false. Visueel dezelfde vleugelhouding, veren, takjes en achtergrond, met krappere lokale uitsnede. Automatische cropmatch blijft niet geverifieerd. |
| Auteur en licentie | 11/11 fotometadata herleidbaar gelijk; dit bewijst niet zelfstandig de biologische rol |
| Leeftijd en geslacht | Rollen tegen bron en zichtbare kenmerken bekeken; onafhankelijke deskundige controle blijft open |

Graspieper-juveniel: bronnaam/categorie noemen juveniel; vers, licht omzoomd verenkleed en jonge indruk zijn consistent. De gelezen BZH-gids beschrijft vooral winterleeftijden; zij bewijst niet zelfstandig de leeftijd van dit individuele zomerbeeld. IJsvogel: vrouwtjesbeeld toont oranje ondersnavelbasis; huidige mannetjesrollen steunen mede op bronvermelding. De ingetrokken juvenielenfoto heeft nog steeds conflicterende leeftijdsmetadata. Fuut-juveniel toont de beschreven zwart-witte kopstrepen.

## Audio

Graspieper en IJsvogel hebben geen lokale opnamen. Fuut heeft één bestaande opname. Commons vermeldt recordist **Aubrey John Williams** en copyright-houder **The British Library Board**, CC BY-SA 4.0. De strikte machinevergelijking geeft false wegens het extra ©-teken in onze credit. De afzonderlijke attributiebeoordeling legt vast dat de genoemde personen/rechthebbende gelijk zijn; de getoonde credit blijft behouden.

Er is deze ronde **geen onafhankelijke auditieve determinatie** uitgevoerd en geen originele audio beluisterd. Soort en geluidstype blijven op bronlabelniveau; de bestaande waarschuwing in de app blijft staan. Metadata- en rechtenbewijs worden niet als soortverificatie geteld.

## Gelezen soortbronnen

- Vogelbescherming: Graspieper, Boompieper, IJsvogel, Bijeneter, Fuut en Roodhalsfuut. URL’s blijven per bewering in `knowledge.json` en het vergelijkingsregister vastgelegd.
- Sovon: **10110**, **8310** en **90**; broedtrend, wintergegevens en meetperioden afzonderlijk gebruikt. Aantallen uit verschillende jaren zijn niet tot één actuele telling samengevoegd.
- Blasco-Zumeta & Heinze: IJsvogel-PDF, pagina’s over lengte, geslacht en leeftijd; Graspieper-PDF op de toegankelijke uitgevers-URL `https://www.blascozumeta.com/specie_files/10110_Anthus_pratensis_E.pdf`. De oude Graspieper-URL gaf een fout en is als `previousURL` bewaard. Geen Aragon-seizoensinformatie naar Nederland gekopieerd.
- Naturalis *Birds of Europe 3.1*: Fuut; RSPB: Fuut en Roodhalsfuut. UK-status is niet gebruikt als Nederlandse status.
- [De Visdief](../bronnen/VISDIEF_VOGELGIDSEN_BRONNOTITIE_2026-11-19.md): op aanwijzing van Kevin opgenomen voor selectie van naslagwerken en vergelijkingsgidsen. De aangeleverde pagina is gelezen. Volledige inhoud van de genoemde boeken is daarmee niet ingezien; ANWB blijft **NOT TESTED**.

eBird blijft geparkeerd na de eerder vastgelegde Anubis-blokkade; geen nieuwe poging in deze ronde.

## Tests en bewijsgrenzen

De brede kennisbaseline-controle wees op het bestaande eigenaarbesluit: volledige kennisprofielen eerst voor soorten mét gidsfoto’s. Twee aanvankelijk toegevoegde partnerprofielen zijn daarom verwijderd; uitsluitend expliciet gemarkeerde, brononderbouwde vergelijkingstekst wordt wederkerig weergegeven. De oorspronkelijke gate is ongewijzigd.

Lokaal: R21/R20-gegevens- en rendercontroles, vaste F3-cohort/tellers, ingetrokken IJsvogelrol, audiobewijsgrens, fotogenerator en bronconsistentie gecontroleerd. De lokale Playwright-browser kon niet starten; systeem-Chromium startte evenmin. Daarom levert de aparte workflow `f3-r21-content-qa.yml` browserbewijs op GitHub Actions, gekoppeld aan de geteste SHA in PR #313.

Browsercriteria: kaarten op 320/360/390 px; IJsvogel/Bijeneter en Veldleeuwerik/Graspieper met gedecodeerde foto’s en zoom/terug; wederkerige tekst voor Graspieper/Boompieper en Fuut/Roodhalsfuut; ontbrekende fotoparen verborgen; ingetrokken IJsvogelbeeld afwezig; eerlijk Fuut-audiolabel; geen horizontale overflow of paginafouten. Resultaat en exacte run staan in PR #313; een beschreven criterium is op zichzelf geen PASS.

Samsung/PWA-installatie, offline opslag/herstel, Merlin-deelmenu en de brede praktijkroute blijven volgens eigenaarbesluit voor na de volledige F3-reeks. Geen nieuw toestel- of release-PASS. Branchbescherming **UNKNOWN**; geen merge of deploy.

## Historie en hervatten

De [voorbereidende QA van 17 november](F3_R21_GRASPIEPER_IJSVOGEL_FUUT_2026-11-17_DRAFT.md) blijft als historisch bewijs behouden. De toenmalige 60/140-teller beschrijft dat eerdere checkpoint; de canonieke actuele teller staat in `F3_140_HERCONTROLE_V0.1_DRAFT.json`.

Volgende batch: **sp078 Meerkoet, sp079 Waterhoen, sp081 Blauwe Reiger**. Start vanaf de vrijgegeven head/claim in PR #313. Volg actuele FINAL-bronnen: Index v3.13, Projectinstructies v2.14, Handbook v2.18 en Veldhandboek v0.8; kwaliteitsnorm v1.7. De projectbijlagen van 16 november en eventuele hostvelden zijn niet automatisch gesynchroniseerd door deze codewijziging.

## Toepassing Visdief-onderzoek op 20 november 2026

De aanvulling op dit dossier staat in [concept-PR #315](https://github.com/saddamsmit-source/Birdspot-Library/pull/315), met de vrijgegeven R21-head 620e493fd40ea3fe65bae7861d812a3fc0674973 als basis. De [bronnotitie](../bronnen/VISDIEF_VOGELGIDSEN_BRONNOTITIE_2026-11-19.md) verwijst naar de normwijziging en controlevoorbeelden.

| Soort | Toepassing in de gids | Open bewijs |
|---|---|---|
| Graspieper sp072 | Veldadvies over zijaanzicht en flankstreping. Vogelbescherming en BirdGuides dragen het onderscheid met Boompieper. De bestaande vergelijking met Veldleeuwerik toont de langdurige zangvlucht in beide richtingen. | De automatische cropcontrole van de vluchtfoto blijft onder de drempel. Bewijs voor de individuele juvenielenrol blijft apart. |
| IJsvogel sp075 | De herkenningstekst stuurt naar de borstveren en poten voor leeftijd. Een donkere ondersnavel is ook bij jonge vogels mogelijk. | De leeftijdsrol van het teruggetrokken juvenielenbeeld blijft open. |
| Fuut sp077 | De snelle herkenning beschrijft het wit boven de donkere lijn tussen oog en snavel in winterkleed. | Een vrije-vluchtfoto en onafhankelijke beoordeling van de bestaande geluidsopname blijven open. |

Dit is een aanvulling op reeds beoordeelde soorten. De R21-teller op de basis is 63/140 inhoudelijk bekeken en 0 volledig afgetekend. Resultaten van het parallelle F3-spoor staan in het eigen dossier.
