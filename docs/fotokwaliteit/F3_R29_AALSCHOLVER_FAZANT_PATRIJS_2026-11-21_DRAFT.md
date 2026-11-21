# Birdspot F3-R29 — Aalscholver, Fazant en Patrijs
**DRAFT / PARTIALLY TESTED · 21 november 2026 · PR #327**

## 1. Vastgestelde basis en scope
R29 vertrekt van vrijgegeven R28 `d65b486ca4489055012046a907fe7ced7ce330f6` (PR #326). R28 heeft op dezelfde SHA **3/3 CI-workflows success**, waaronder browser-/kennisbaseline. R29 heeft een **eigen geïsoleerde writerclaim** en verandert niets op PR #318 of op de openbare review-/releasebranches.

Na registratie: **87/140 inhoudelijk bekeken, 53 NOT STARTED, 0 FULL PASS**. Alleen `sp104`, `sp105`, `sp106` krijgen R29-inhoudsstatus. Alle 140 ID's, volgorde, media-IDs, historische claims en ontbrekende bewijslaag blijven bewaard. Broncontrole en directe lokale beeldinspectie bewijzen geen zelfstandige, onafhankelijke soortdeterminatie of actueel publicatierecht.

Normen: app-README; Birdspot-kwaliteitsnorm **v1.7 FINAL**; Index v3.13 FINAL, Projectinstructies v2.14 FINAL, App Development Handbook v2.18 FINAL, Birdspot Veldhandboek v0.9 FINAL. Het concept v1.9 op #315 wordt niet als norm geactiveerd. R29 is geen release.

## 2. Rechtstreeks bekeken 12 bestaande app-WebP's
Alle volgende lokale GitHub-imageblobs zijn afzonderlijk werkelijk als beeld geopend op de ongewijzigde R28-basistree, met SHA-1 van hun Git-blobs geregistreerd. De blobs blijven ongewijzigd; bronoriginalen zijn niet voor elk bestand onafhankelijk pixelmatig herbeoordeeld.

### sp104 — Aalscholver (3 beelden, 1 audio)
| Rol | Bestand | Git blob SHA-1 |
|---|---|---|
| Hoofdfoto | `assets/species/sp104.webp` | `ca55b93f39a5b4d9106c55f4d5bc0d1a31604c56` |
| Jaarling | `assets/species/plumage/sp104-jaarling.webp` | `4c6b806729e1998216f3b0ad64eed441c02031fe` |
| Vrije vlucht | `assets/species/plumage/sp104-flight.webp` | `59731ea10a8c024c8b3a8d1071d66460b65f914b` |

- Hoofdfoto: zwarte tot groenig geschubde rug, stevige haaksnavel, zichtbaar licht keelveld en kuifachtige veren. De individuele foto is geen volledige zomer-/broedkleedrepresentatie voor alle aalscholvers. Historische maker MPF, CC BY-SA 4.0 via `assets/species/credits.json`.
- **Jaarling ≠ vluchtbeeld**: jonge/onvolwassen vogel met lichtere borst en uitgespreide vleugels **staand op een besneeuwde oever**. De bron van Andreas Trepte (`Great cormorant immature.jpg`, CC BY-SA 2.5) noemt `vorjähriger`. Vleugels hier spreiden om te drogen is geen vliegen. Leeftijdslabel *jaarling* berust op de historisch gelezen oorspronkelijke bron, niet op nieuwe onafhankelijke leeftijdsbepaling.
- Vluchtbeeld: vogel los van de ondergrond met vooruitgestrekte hals en zichtbare brede vleugels; Charles J. Sharp CC BY-SA 3.0. Soortrol op basis van beeld en historische bron ondersteund, maar geen nieuw onafhankelijke bron-/beeld-PASS.
- **Aalscholver ↔ Kuifaalscholver**: op 21 november feitelijk gelezen Vogelbescherming-soortpagina's geven als ondersteunende verschillen onder meer slankere hals en snavel, steiler voorhoofd, kleinere bouw bij Kuifaalscholver. Eén fotografische hoek, kuif of waterhabitat is geen absolute determinatiesleutel. Het bestaande kennisprofiel vermeldt nog dat onderscheid niet was uitgewerkt; dit is een aantoonbare inhoudelijke aanvulkans, niet zelfstandig twee-uitgeversbewijs. Geen fotopaneel activeren zonder passend geverifieerd partnerbeeld.
- Één bestaande opname `sp104-a1.mp3` (Rozenn Le Fur / Sonothèque ADVL, Xeno-canto XC964802, CC0 1.0). Bronmetadata zegt roep, opname uit Bretagne; het originele geluid is in deze ronde niet auditief opnieuw gedetermineerd. Technisch bronbestand uit eerdere audit en nieuwe browserafspeling zijn apart te toetsen.

### sp105 — Fazant (4 beelden, geen geregistreerd gidsaudio)
| Rol | Bestand | Git blob SHA-1 |
|---|---|---|
| Mannetje-hoofdfoto | `assets/species/sp105.webp` | `9818d203b4b033bd16e5ec9b7bd3bb3a32eb0390` |
| Vrouwtje | `assets/species/plumage/sp105-adult_f.webp` | `a9bd982991d429a3868b8fb8b95bf11cc46ec541` |
| Juveniel | `assets/species/plumage/sp105-juv.webp` | `c801b6d9f0b422de779f925228183719162a74e5` |
| Mannetje vrije vlucht | `assets/species/plumage/sp105-flight.webp` | `be8009da263cd6d1e219133ac362084500f9a6a4` |

- Hoofdfoto: kleurrijke haan met groen/donkerblauwe kop, rode gezichtshuid, witte halsring en lange gebandeerde staart; Romzig, CC0 (historische Commons-registratie).
- Vrouwtje: slanke bruin gevlekte hen in gras met **lange gebandeerde staart**, volgens fotograaf Bj.schoenmakers op Texel; CC0. Dit is bruikbaar voor vergelijking met de compactere Patrijs.
- Juveniel: jong, doffer bruin exemplaar met korte staart, historisch door Estormiz als jong benoemd, CC0. Het verschil met een volwassen hen mag niet op staartlengte alléén worden gebaseerd.
- Vluchtfoto: man in echte vrije vlucht met lange gebandeerde staart en opvallend gezicht; herkomst South Dakota, Tom Koerner / U.S. Fish and Wildlife Service, publiek domein volgens oud brondossier. De Amerikaanse herkomst niet vervangen door een impliciete foto van Nederlandse populatie; wel zelfde soort. Bronpagina en gebruiksvoorwaarden niet nieuw onafhankelijk geverifieerd.
- **Fazant ↔ Patrijs**: verifieer op de echte vergelijkingskaart dat vrouwelijke Fazant tegen een vergelijkbare volwassen Patrijs wordt getoond. Bij aanvang had `GUIDE_COMPARISONS` het Fazant-vrouwtje expliciet `adult_f`, maar de Patrijs zonder kleedselector; `comparisonPhoto` kon dan de eigen Patrijs-hoofdfoto kiezen. Bij beschikbaar, historisch gelicentieerd Patrijs-vrouwtje is een expliciete gelijkwaardige `adult_f`-vergelijking een gerichte UX-verbetering. De soortverschillen blijven staartlengte en bouw in combinatie; een jonge Fazant kan nog kortstaartig zijn.
- **Geen lokaal bestand voor de beschreven haankraai of opvliegroep.** Audiovolledigheid blijft OPEN.

### sp106 — Patrijs (5 beelden, geen geregistreerd gidsaudio)
| Rol | Bestand | Git blob SHA-1 |
|---|---|---|
| Mannetje-hoofdfoto | `assets/species/plumage/sp106-hero-male.webp` | `8c69f8c814ea68237c80ced0e4af80480aa92afe` |
| Vrouwtje | `assets/species/plumage/sp106-adult_f.webp` | `cb90814eab9a79c7de5e2b071830d40cb32f82a8` |
| Juveniele vogels | `assets/species/plumage/sp106-juv.webp` | `ab9aed623583a4dbc70166baa408c5d93841d463` |
| Voorlopig vrije vlucht | `assets/species/plumage/sp106-flight.webp` | `118c3b13c51b3e3dda543668631210e00ea228ac` |
| Overig portret | `assets/species/sp106.webp` | `6c4e4d59bd21ff8f9a34d06bda777b1a7231c940` |

- Mannetje-bronbeeld (TRinaud, CC BY 4.0) laat oranjebruin gezicht, grijze hals en bruine dwarsbanden op de flanken zien. De bron benoemt mannetje; volledige nieuwe onafhankelijke geslachtsbevestiging ontbreekt.
- Vrouwtje (iNaturalist fotograaf maxverheij, historische `Adult/Female`-annotatie en CC0) staat deels verborgen in lang gras; een gelijkwaardige vergelijking met Fazantenhen moet niet meer uit de afbeelding afleiden dan kop/bouw en zichtbare staart echt laten zien.
- Juveniel: twee bruine jong-ogende vogels op stenig terrein, eerdere iNaturalist `Juvenile`-annotatie, geslacht niet afgeleid, Aurelijus Narbutas CC BY 4.0. Originele leeftijds- en rechtenketen nog onafhankelijk heropenen.
- **Vluchtfoto is werkelijk een laagvliegende vogel, maar slechts 450×300 pixels en zacht/onscherp.** Bestaande historische `flightReview` blijft `voorwaardelijk`, niet finale vrije-vluchtkwaliteit. Verzoek voor een scherpere, soortzekere, gelicentieerde vluchtfoto blijft open volgens het besluit om fotoaanvulling pas later te doen. Niet stilzwijgend tot APPROVED promoveren of door een andere foto vervangen.
- Overig portret (K.Pitk, CC BY-SA 3.0) toont kort staartje, grijsbruine romp en oranjebruin gezicht, als soortreferentie zonder sekseclaim.
- Buikvlek `hoefijzer` niet alleen voor sekse gebruiken: de bestaande kennisdata vereist schouderveertekening en onderbouwde herkomst. Bron Vogelbescherming Patrijs op 21 november feitelijk gelezen voor algemene soortkenmerken; individuele man/vrouw-bewijs blijft bij de bronannotatie.
- Geen lokale Patrijsroep geregistreerd; bronbeschrijving is geen geluidsbestand en geen akoestische PASS.

## 3. Bronroute en bewijsscheiding
**Nu feitelijk gelezen:** Vogelbescherming [Aalscholver](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/aalscholver), [Kuifaalscholver](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/kuifaalscholver), [Fazant](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/fazant), [Patrijs](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids/vogel/patrijs). De twee aalscholverpagina's zijn dezelfde uitgever en tellen niet als twee onafhankelijke uitgevers. Reeds geregistreerde soorten, status- en maatclaims in `tools/kennisbaseline/knowledge.json` zijn gelezen, niet automatisch actueel herbevestigd.

**Historisch geregistreerd, deze ronde niet afzonderlijk als origineel heropend:** twaalf maker-/licentieketens uit `assets/species/credits.json` en `assets/species/field-guide-media.json` plus eerdere audits. Geen directe source-to-WebP pixelmatch of onafhankelijk deskundigenoordeel, geen actuele foto-/audio-publicatierechten-AFTEKENING. ANWB-editie/pagina niet ingezien. Bij materiaal van derden blijft individuele bron/attributie verplicht.

## 4. Gate-matrix
| Controle | Resultaat | Nog open |
|---|---|---|
| 12/12 bestaande lokale focus-WebP's individueel geopend | PARTIALLY TESTED | bronorigineel match + onafhankelijke soort-/leeftijds-/seksecontrole |
| Pose en rol | PARTIALLY TESTED | jaarling staat stil met vleugels gespreid; Patrijs-vlucht voorwaardelijk 450 px |
| Dubbelgangers | PARTIALLY TESTED | Kuifaalscholver vergelijking tekst; Fazant/Patrijs gelijkwaardig kleedfoto en browserroute controleren |
| Audio | PARTIALLY TESTED metadata | één bronopname Aalscholver, Fazant/Patrijs 0, geen onafhankelijke auditieve determinatie |
| F3 cohort | pas na gerichte CI op actuele SHA | 140 original IDs, 87 reviewed / 53 NOT STARTED, 0 FULL PASS |
| Kennisgenerator, UI, Chromium | NOT TESTED bij inhoudscheckpoint | CI en browser in aparte bewijslaag |
| Fysieke Samsung, PWA-download/installatie, ZIP, Merlin, offline | OPEN / NOT TESTED op R29 | eerder eigenaar: privétest werkt; installatie OPEN |
| Rechten, onafhankelijke expert, externe originele bytes | OPEN | geen FULL PASS |

## 5. Uitvoeringsafsluiting
Alle wijzigingen beperkt houden tot dossier, uitsluitend de drie R29-registratierijen, test/CI en zo nodig de **éénregelige** vergelijkingsselectie voor de Patrijs-vrouwtjesfoto plus gerichte test. Geen nieuwe media, foto-upload, audiowijziging of publicatie. Behoud alle eerdere 137 F3-rijen exact en toon het onafhankelijke specialistgat zichtbaar in het QA-register.

Volgende batch in de originele volgorde na R29 pas vaststellen via register en remote refs. Release HOLD. Geen merge, hostingwijziging, publieke preview of livegang zonder eigenaarbesluit.

EINDMARKERING — R29 INHOUDELIJKE CONTROLE · 87/140 · 0 FULL PASS · PUBLIC RELEASE HOLD
