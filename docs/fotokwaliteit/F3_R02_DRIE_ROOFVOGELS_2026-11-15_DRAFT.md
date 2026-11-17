# Birdspot F3-R02 — Buizerd, Wespendief, Ruigpootbuizerd

| Onderdeel | Resultaat |
|---|---|
| Datum | 15 november 2026 |
| Reikwijdte | Exact 3 van de oorspronkelijke 140 soorten: sp005, sp248, sp253 |
| Productfase | CONTENT / UI–UX review; uitgebreide fysieke Android-/offline-/herstel-/Merlin-tests later |
| Oorspronkelijke basis | F3-R01 PR #246, SHA 4039efdd0dca3eb3b71b3e8b978f2031822050d2 |
| Status | **CONTENT REVIEWED / OPEN POINTS**; geen nieuwe volledige wetenschappelijke of release-PASS |
| Scope aanpassing | Bestaande zes + vier + vier WebP's openen en beoordelen, één reeds gelicentieerde Buizerd-hoofdfoto beter kiezen, conserveren van alle originele bestanden, analyse audio/soort/geslacht/leeftijd/vergelijking/eBird/Sovon, later technisch testen |
| Canonieke bronnen | README, BIRDSPOT_KWALITEITSNORM v1.6, bestaande F1/F2-evidence, audio-140-register; ANWB pas PASS wanneer de werkelijke soortpassage is ingezien |

## A. Herijkte uitvoering: eerst basis en UX, functionele toesteltests later

De eigenaar heeft besloten dat we **nu de basis, inhoud, foto's, geluiden en UI/UX** van de eerste 140 verbeteren, met **bronvermelding uitsluitend onder een toegankelijke informatieknop ⓘ** in plaats van losse bronregels, behoudens door de maker of licentie verplichte direct zichtbare credits. De nieuwe route scheidt twee statuslagen:

- **CONTENT REVIEWED / OPEN**: echte lokale afbeeldingen en bestaande audioverwijzingen nagekeken, controleerbare kwaliteits-/bronbevindingen bewaard, passende beeldrol, nette UI en eigenaar-ervaring zoveel mogelijk afgemaakt. Een open punt blokkeert niet de *volgende* soort, maar verhindert een onterechte **CONTENT COMPLETE** claim voor deze soort.
- **FINAL APP / RELEASE QA LATER**: fysieke Android, privacy, echte netwerk-/PWA-geluidsherkenning, offline ZIP→tweede toestel, UI-regressie op één geïntegreerde SHA en volledige onafhankelijke media-/licentiecheck. Deze wordt expliciet uitgesteld, niet afgevinkt en niet verondersteld in één ronde gegarandeerd herstelbaar.
- Bestaande F1/F2-checkpoints worden nooit overschreven of hernoemd tot een geslaagde actuele hercontrole. F3 heeft een aparte teller. 141–597 pas na aftekening van de 140 zoals de eigenaar vroeg; kleine bugs buiten inhoudelijke groei blijven uitzonderlijk mogelijk.

**UX-basis, nog niet één gecombineerde app-preview:** PR #241 heeft foto's per rubriek naast elkaar en één compacte geluidslijst; PR #244 bewaart Home-veldkenmerken; PR #249 introduceert audioherkomst achter ⓘ. PR #250 herstelt de twee regressietests op deze i-weergave. Deze UI-branches en PR #242 met Merlin/waarnemen + zijn **niet** automatisch samengevoegd in deze F3-R02-codebranch. De zichtbare credits en fotoinfo blijven in de aparte foto-i-knop.

## B. Foto-/kleed-/hoofdfotocontrole — werkelijk bestaande WebP's opnieuw geopend

### Buizerd (sp005, Buteo buteo): 6 bestaande foto's, 3 audio-items

- **Hoofdfoto (gewijzigd, alleen registerselectie):** nieuwe voorkeursfoto assets/species/sp005.webp. Dit is de bestaande herkenbare Buizerd op een natuurlijke boomtak, auteur **Alexis Lours**. Origineel: https://commons.wikimedia.org/wiki/File:Common_buzzard_2024-01-20.jpg, CC BY 4.0, auteursnaam en bronrechten direct heropend. Wikimedia classificeert het oorspronkelijke beeld als Quality Image. Betere visuele start dan de kabel-/fotografenwatermerkfoto. Geen nieuw mediabestand gedownload, geen oude foto verwijderd.
- De vroegere hoofdfoto assets/species/plumage/sp005-male-rest.webp op kabel met fotografennaam in beeld **blijft als extra bestaande rustfoto** beschikbaar; die foto is niet omgekeerd tot een zeker mannelijk verenkleed. De mannelijke iNaturalist-annotatie bewijst op zichzelf geen uit de uiterlijke kenmerken afleidbaar geslacht.
- Overige gecontroleerde beelden: sp005-juv.webp (juveniel **werkelijk in vlucht**, bronannotatie jeugd), sp005-adult_m.webp (volwassen in vlucht, geen zeker zichtbaar geslachtslabel), sp005-flight-dark.webp (donkere vrij vliegende Buizerd met gevlekte ondervleugel en fijne staartbanden), sp005-female-flight.webp (vrijevluchtbeeld, eerder bron als vrouwtje aangeduid; geslacht niet altijd zelfstandig uit vluchtfoto te bewijzen). **Geen verkeerde zittende juveniel uit een vluchtfoto maken.**
- Ontbreekt: afzonderlijke jeugd-/juvenielenfoto in rust. Vervang bestaande goedgekeurde vluchtfoto's niet door minder geschikte beelden voor een teller. Controleer of de app geen geslachtslabel op een neutraal adultenbeeld toont.
- **Geluidsreferenties in register:** Roep, Alarmroep en Roep (tweede voorbeeld), drie lokale MP3's, uit Commons/Xeno-canto. Een label in de JSON is **geen onafhankelijke akoestische soort-/licentie-PASS**. Niet zonder beluisteren of bronbehoud als eigen geluidsherkenningsmodel aanmerken.

### Wespendief (sp248, Pernis apivorus): 4 foto's, 2 audio-items

- Oude hoofdfoto assets/species/sp248.webp toont een **werkelijk vliegende Wespendief** met slanke uitstekende kop, relatief lange afgeronde vleugels en getekende lange staart; fotograafwatermerk is zichtbaar en mag niet stilzwijgend worden uitgepoetst. Foto is bruikbaar als herkenning, maar een rust-/natuurfoto voor een toekomstige hoofdrol zou esthetisch beter zijn indien even goed bewezen.
- sp248-male-rest.webp is mannelijk aangeduid op de bron (iNaturalist Adult, Male); de rustvogel wordt door takken/tronk deels omlijst. De volledige achterzijde en poten zijn minder geschikt voor een complete lichaamsvorm, maar de kop en het oog zijn herkenbaar.
- sp248-adult_f.webp toont **vrijevlucht** (volwassen vrouw volgens bron); vogel is relatief klein in beeld, maar staart- en vleugelvorm blijven herkenbaar en dat is volgens de canonieke norm toegestaan. sp248-juv.webp toont vrijevlucht van een bron-gelabelde juveniel, maar geen juveniel in rust.
- Ontbreekt: **vrouwtje in rust**. Leeftijd/geslacht van de vluchtfoto's op basis van originele metadata is een historische bronclaim; bij latere formele aftekening originele referentie heropenen. Geen vrouwelijk kleed verzinnen.
- Twee geregistreerde **Vluchtroep**-bestanden; geen algemene zangclaim of geslachtsrol uit het geluid afleiden. Controle van opname-inhoud, commerciële/distributierechten en kwaliteit blijft apart OPEN.

### Ruigpootbuizerd (sp253, Buteo lagopus): 4 foto's, 0 audio-items

- sp253-male-rest.webp toont een vermoedelijke Ruigpootbuizerd in winteromgeving; witte staartbasis met duidelijk zwart staartpatroon herkenbaar. Geslacht is historisch uit bronannotatie, niet uit dit ene beeld zelfstandig bewezen.
- sp253-male-flight.webp toont een vogel met gebogen, deels weinig uitgewaaierde vleugels. De lichte halo/scherpte maakt de afbeelding **minder sterk als instructieve volledige vluchtfoto**. Houd voorlopig beschikbaar, markeer vervangingskandidaat, niet falselijk compleet of bronloos vervangen.
- assets/species/sp253.webp (brongeëtiketteerd vrouwtje) is een veel duidelijkere vluchtfoto met donkere polsvlekken, donkere buikzone en lichte staartbasis. sp253-juv.webp toont een werkelijk vliegende vogel met vrij goede structuur, maar fotografenwatermerk aanwezig. Jeugdetiket blijft bronafhankelijk en moet worden vergeleken met de originele opname.
- Ontbreken: **rustfoto vrouwtje**, **rustfoto juveniel** en **rechtmatig beschikbaar geluidsfragment**. Vogelbescherming beschrijft een miauwende roep die in Nederland doorgaans niet te horen is. Dit verklaart dat een Nederlands luisterfragment lastig is, **niet** dat een onbewezen opname van een andere soort mag worden toegevoegd.
- Bestaande foto-assets, makercredits en i-knoppen blijven behouden; geen onzekere rol als zeker presenteren.

## C. Onafhankelijke herkennings- en verspreidingsbronnen

**Vogelbescherming Nederland, direct geraadpleegd:**
- Buizerd https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/buizerd — brede vleugels, relatief korte ronde staart met smalle banden, sterk variabel verenkleed, hoge miauwende roep.
- Wespendief https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/wespendief en https://www.vogelbescherming.nl/actueel/bericht/vogels-herkennen-buizerd-vs-wespendief — relatief lange staart en uitstekende kop, lange ronde vleugels, hoge fluitende roep en zomerverblijf.
- Ruigpootbuizerd https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/ruigpootbuizerd en https://www.vogelbescherming.nl/actueel/bericht/buizerd-vs-ruigpootbuizerd — witte staartbasis, zwarte eindband(en), donkere polsvlekken, bevederde loopbenen en wintervoorkomen.

**Sovon:**
- Buizerd https://stats.sovon.nl/stats/soort/2870 — veel voorkomende Nederlandse broedvogel; oudere populatie-/jaartallen niet presenteren als huidig meetresultaat.
- Wespendief https://stats.sovon.nl/stats/soort/2310 — schaarse bosbroedvogel/zomergast; atlas en jaartallen onderscheiden.
- Ruigpootbuizerd https://stats.sovon.nl/stats/soort/2900 — schaarse wintergast, Noord-Nederland relatief belangrijk; getoonde wintertrend niet gelijkstellen aan directe lokale aanwezigheid.

**eBird, aanvullende taxon-/seizoenscontext, geen gekopieerde kaarten/data:**
- Buizerd (Common Buzzard): https://science.ebird.org/en/status-and-trends/species/combuz1/range-map .
- Wespendief (European Honey-buzzard): https://science.ebird.org/en/status-and-trends/species/euhbuz1/downloads .
- Ruigpootbuizerd (Rough-legged Hawk/Buzzard): https://science.ebird.org/en/status-and-trends/species/rolhaw/range-map .
- eBird-modellen geven gemodelleerde verspreiding of relatieve aantallen bij gestandaardiseerde waarnemingsinspanning, **niet** een publieke locatie van een individuele vogel, geen nul-kans uit lege pixels. Hergebruik van data, media en geluid voor een toekomstige commerciële Birdspot vraagt afzonderlijke toestemming.
- Echte ANWB-vogelgidssoortpassages **NOT TESTED** in deze ronde. Een productpagina is geen onafhankelijke soortdeterminatie of foto-licentie.

## D. UI–UX-afspraken en uitvoerbare volgende stap

- Gewone soortkaart toont alleen relevante vogelkenmerken en bij de geluidsspeler **Roep, Alarmroep, Vluchtroep** etc. zonder telkens bestandsnaam, auteur, licentie of bronlink eronder. Een **toegankelijke, aanraakbare ⓘ** bevat media-auteur, oorspronkelijke bron, licentie en eventuele bewerkingen; expliciete makervereisten voor direct zichtbare credits blijven een uitzondering.
- Meerdere foto's per kleed/rubriek staan naast elkaar en vullen de rij, losse derde foto mag een hele rij vullen. Zoom, volledig beeld, correcte rol en herstel van de eigen foto blijven mogelijk; formele praktische E2E-validatie later na inhoud van alle 140.
- Geen verkeerd man-/vrouw-/juveniellabel om een kolom te vullen, geen verticale lege vergelijkingsblokken, geen ongeschikte geluiden om 140/140 te forceren.
- Open media-/ANWB-/rechtenpunten blokkeren **niet** het starten van het volgende maximaal drie soorten-batch; ze blijven zichtbaar in F3 totdat een inhoudelijk betrouwbare bron of rechtmatige uitzondering is vastgesteld. **CONTENT COMPLETE** vereist wél sluiting van relevante inhoudelijke open punten. De volledige praktische app-PASS pas in afzonderlijke latere geïntegreerde pilot.
- Gedeelde audio-/foto-UI is in PR #249 en latere testfix #250; foto-indeling #241 en Home-spacing #244. Geen claim dat die in de geïntegreerde 1.27.11-PR #242 of deze branch al gezamenlijk geïnstalleerd zijn.

## E. Bewijs, afhankelijkheden en herstel

- **Werkelijk gecontroleerd:** 14 uit de repo geopende WebP-bestanden, 3 bestaande soortdatarecords, 5 bestaande geregistreerde geluidsitems, herkomst-/licentievelden, externe veld-/spreidingsreferenties; bronvondst voor de nieuwe Buizerd-hoofdfoto rechtstreeks via Commons.
- **Niet gecontroleerd:** alle originele foto-pixelmatches opnieuw tegen oorspronkelijke uploads, onafhankelijk alle audio beluisteren, werkelijke ANWB-pagina, Macaulay-audiohergebruik, toekomstige commerciële herlicentie, volledig fysieke Android-/offline-/ZIP-/Merlin-test, één gezamenlijke apppreview. Dit zijn verschillende bewijsniveaus, geen reden om eerdere goede foto's opnieuw van nul af te verifiëren.
- **Codewijziging:** uitsluitend al bestaande Buizerdfoto tot hoofdfoto promoveren (de oude blijft beschikbaar), consistent in bron-JSON en gegenereerde GUIDE_HEROES; geen nieuwe mediafiles, geen opslag- of API-wijziging. Validatie door generatortest en gerichte browsercheck moet volgen.
- **Herstel:** deze F3-R02-conceptbranch/PR sluiten en terug naar F3-R01-checkpoint SHA 4039efdd; eerdere hoofd-/mediafoto's zijn intact.
- **Volgende batch:** de eerstvolgende drie ID's in het canonieke 140-register, NIET willekeurig de volledige 597 sortering. Per 3 blijven bron-, foto-/geluid-/UX-notities controleerbaar en klaar voor een latere gezamenlijke functietest.

**QA STATUS:** content inspectie PARTIALLY TESTED, uitgevoerde hero-selectie in aparte branch NOT DEPLOYED; volledige soort-PASS en production-live NOT PROVEN.