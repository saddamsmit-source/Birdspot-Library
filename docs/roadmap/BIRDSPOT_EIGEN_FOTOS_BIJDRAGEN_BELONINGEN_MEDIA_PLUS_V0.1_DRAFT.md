# Birdspot — eigen gidsfoto's, bijdragen, beloningen en Premium-media

| Eigenschap | Status |
|---|---|
| Document | v0.1 DRAFT — 15 november 2026 |
| Bron | Eigenaarwens 15-11-2026: gebruiker kiest eigen gidsfoto's, kan betere eigen foto's insturen, krijgt mogelijk punten/beloningen; uitgebreide films/diashows en Merlin-achtige geluidsherkenning kunnen betaalde uitbreidingen worden |
| Productstatus | **Gewenste productrichting**, afzonderlijke uitvoeringsscope/timing, puntenregeling, prijzen, aanbieders en technologie **OPEN / CANDIDATE** |
| Appfase bij registratie | S1 praktijkpilot; geen livefunctie of nieuw betaalsysteem |
| Bronautoriteit | Birdspot README is productcontract; `docs/BIRDSPOT_KWALITEITSNORM.md` beheert de zes fotocontroles; Roadmap v1.3 en Veldhandboek v0.6 bevatten eerdere besluiten over gidsbijdragen, credits, privacy en Plus |
| Relevante opvolger | Eigenaarapp pas later starten als volledige kopie van gebruikersapp; deze plannen veronderstellen geen huidige koppeling |

## 1. Vastgestelde gewenste gebruikservaring

De eigenaar wil dat een gebruiker **op de eigen Birdspot-soortkaart zijn eigen foto's kan kiezen** in plaats van een standaardgidsfoto, en dat dezelfde gebruiker een **vrijwillig aangeboden, betere eigen foto** naar Birdspot kan insturen voor centrale beoordeling. Dit zijn twee **afzonderlijke** handelingen en gegevensstromen.

Daarnaast wil de eigenaar later een eerlijke **bijdrage-/puntbeloning** (bijvoorbeeld korting of gratis landen-/mediapakket) en betaalde **uitgebreide** Media/Film Studio-functies en eventueel **geïntegreerde vogelgeluidsherkenning** onderzoeken.

Huidige F2-audit van de bestaande **140** gefotografeerde vogelkaarten heeft prioriteit. Foto's en brondata van die audit niet opnieuw herschrijven. Een gebruikersbijdrage mag een officiële gidsfoto **pas na de bestaande verificatie- en vrijgavepoort** veranderen.

## 2. Eigen gidsfoto per soort — persoonlijke lokale functie

**Gebruikerstaak:** ik zie bijvoorbeeld de standaardfoto bij IJsvogel, maar ik heb zelf een mooier en nuttiger beeld.

**Voorgestelde route:** soortkaart → foto-/kleedslot bekijken (hoofdfoto, mannetje, vrouwtje, juveniel, in vlucht, waar aanwezig) → `Gebruik mijn foto` → afbeelding selecteren → privévoorbeeld zien → bevestigen → persoonlijke soortkaart toont `Mijn foto`. `Toon originele gidsfoto` en `Herstel standaardfoto` blijven beschikbaar. Gekoppelde soortinformatie en standaardfoto's worden **niet verwijderd of overschreven**. Gegevens kunnen ook opnieuw worden gewijzigd.

- **Geen automatische publicatie:** persoonlijke foto wordt niet naar Birdspot/eigenaar/community geüpload en is niet voor andere gebruikers zichtbaar. Lokaal opslaan waar mogelijk, met duidelijke opslag- en back-upstatus; cloud pas na aparte keuze/implementatie.
- **Geen bronclaim op eigen beeld:** toon `Persoonlijke foto · niet door Birdspot geverifieerd` waar relevant; bestaande geciteerde kenmerk-/kleeduitspraak slaat niet automatisch op deze foto. Geslacht/jeugdkleed of vluchtrol niet stilzwijgend afleiden uit het geselecteerde beeld. Onzekere rol kan `niet vastgesteld` zijn.
- **Vergelijkingen:** bestaande officiële gidsvergelijking blijft betrouwbaar; persoonlijk beeld alleen in vergelijking gebruiken wanneer de gebruiker bewust daarvoor kiest en de rol past. Niet standaard een ongeteste foto promoten naar een officiële herkenningsvergelijking.
- **Data/restore:** per soort-ID + rol-ID één of meer eigen fotoverwijzingen met non-destructieve override; export en ZIP-herstel bewaren de override én de media, ook na offline heropening en update. Herstel van één foto mag andere gebruikersmedia niet wissen.
- **Test:** foto kiezen → opslaan → sluiten/heropenen → offline terugzien → standaardfoto herstellen → na opnieuw openen hetzelfde gedrag; annuleren, corrupt/onjuist bestand, volle IDB, fout bij opslag, ZIP-export naar schoon tweede profiel/toestel, oude import zonder override, onbekend rolveld en dubbel foto-id.
- **Kosten/start:** kandidaat voor een latere kleine lokale S1/S2 proef zonder server of login, mits bestaande PWA-kernroute stabiel is.

## 3. Eigen foto ter beoordeling aanbieden — later apart

Knop bij ontbrekend/fototechnisch zwak slot: `Deel een betere foto met Birdspot`, met de **soort en het gewenste beeldtype vooraf ingevuld**. Ook bij een goed gevuld slot mag de gebruiker vrijwillig een kwalitatief beter beeld voorstellen. Voor verzending expliciet voorbeeld, datum/locatie (standaard privé, niet vereist waar niet nodig), persoonlijke creditvoorkeur en toestemming tonen; gebruiker kan annuleren. De foto mag **nooit** automatisch uit het persoonlijke vervangslot worden ingezonden.

**Statusroute:** concept → verzonden/ontvangen → wachtrij → bron/soort/kleed-/leeftijd-/vluchtcontrole → goedgekeurd of afgewezen met uitleg → eventueel gepubliceerd → wijziging/intrekking met audit. Beoordeling vindt plaats vóór publieke gidsvervanging. Voorkom dubbele inzendingen, misleidende labels, misbruik, malware, onveilige metadata, overmatige uploads en hergebruik zonder auteursrecht.

**Rechten en natuurveiligheid:** verifieer dat de inzender zelf rechthebbende is of toestemming heeft; leg de beoogde niet-exclusieve gidslicentie, commerciële herpublicatie, naamsvermelding, bewerking en eventuele promotie **afzonderlijk** vast. Vereiste licentievoorwaarden per bron blijven gelden. Verwijder GPS/EXIF en herleidbare beschermde-soortlocaties uit de **gedeelde kopie**, niet ongevraagd uit het privéorigineel. Geen eigenaarsinzage in niet-gedeelde gebruikersmedia.

**Beheer:** begin met een veilige, kleine upload- en moderatiewachtrij zodra er een server/ontvangstroute nodig is. Het toekomstige eigenaarapp-dashboard kan later dezelfde ingestuurde bijdragen en statussen beheren. **Geen huidige appkoppeling of eigenaarapp nodig om dit voorstel vast te leggen.**

## 4. Loyaliteit, punten en beloningen (FUTURE/HYPOTHESIS)

**Voorkeur:** kwaliteits- en bijdragegericht, geen prikkel om veel willekeurige bestanden of positieve ratings te genereren.

- Een geldige, **goedgekeurde én daadwerkelijk bruikbaar gepubliceerde** eigen fotobijdrage kan punten opleveren. Geen punten voor spam, duplicaten, onjuiste soortlabels, ingezonden foto's zonder rechten, of alleen het indienen zelf. Goede maar niet gebruikte foto's kunnen een persoonlijk bedankje krijgen zonder punten.
- Toon in het persoonlijke profiel transparant: bijdrage-ID, status, toegekende punten, uitleg, reeds verzilverde punten, resterend saldo en relevante historie; bij fout/toegekende doublure handmatige correctie met log en bezwaar.
- Beloningskandidaten: korting op **los landpakket Frankrijk/Duitsland**, tijdelijk Premium Media Studio, gratis mediapakket of een ander passend digitaal product. **Aantal punten, waarde, maximum, vervaldatum, voorwaarden en fiscale/gebruiksregels OPEN.** Geen automatische claim op gratis landpakket of permanente voordelen.
- Geen prikkel voor positieve beoordelingen of app-store ratings, geen korting afhankelijk van negatieve feedback terugtrekken. Houd algemene feedback gratis en onbevooroordeeld.
- Preventie: duplicate-hash én perceptuele duplicaatreview, recidive-/misbruikcontroles, rate limits, één verdienmoment per geaccepteerd origineel, transparante moderatie, geen verkoop van verdiende punten zonder afzonderlijke store/compliancecheck.
- Bij geldwaarde-achtige beloningen of in-app digitale aankopen: store-regels en toepasselijk consumenten-/privacyrecht vóór implementatie verifiëren.

Bestaand Birdspot-besluit: bij **gepubliceerde** foto is een persoonlijk bedankje/optionele naamcredit al voorzien, een Plus-periode of landenpakket als beloning was een latere **proef**. Dit voorstel bouwt daarop voort en maakt er **nog geen vastgesteld puntenschema** van.

## 5. Media Studio / Film Studio: gratis kern en betaalde extra's

**Vóór paywall-ontwerp:** inventariseer op één exacte kandidaat-SHA alle huidige functies van Media Studio en Film Studio. Een bestaande gratis mogelijkheid (persoonlijke media bewaren, bekijken, gebruik in logboek, export/ZIP-herstel) mag niet stilzwijgend verdwijnen of onbruikbaar worden door een prijsregel. De eigenaar bepaalt **later** welke geavanceerde onderdelen worden toegevoegd of exclusief Premium zijn.

| Laag | Productidee | Status |
|---|---|---|
| Gratis basis | Eigen vogel-/waarnemingsmedia bewaren, bekijken, terugvinden, eenvoudige presentatie en veilige export/restore; huidige feitelijke functies blijven voorlopig behouden | Kern behouden; concrete afbakening per versie te meten |
| Media Plus | Extra kant-en-klare diashow-/filmtemplates, overgangen, titels, persoonlijke intro's, langere compilaties, uitgebreidere bewerking, optionele hogere exportkwaliteit | CANDIDATE, exacte featurelijst en lokale haalbaarheid OPEN |
| Geavanceerde media | Muziek, voice-over, effecten, samengestelde wildlife-/reisfilm, externe montage-/renderdienst | FUTURE; media-/muziekrechten, opname toestemming, licenties, geheugen/CPU/accu en render-/opslagkosten toetsen |

Video en diashow moeten waar mogelijk met **eigen** media werken en privacyvriendelijk lokaal renderen. Een betaalde optie moet aantoonbaar toegevoegde waarde hebben tegenover reeds aanwezige gratis Film Studio. Verplichte preview vóór koop, duidelijke prijs, upgrade-/restorepad, offline- en crashroute. Geen upload naar een cloudrenderdienst zonder expliciete privacy- en kostencheck. Kies eenmalige aankoop versus abonnement pas na werkelijke operationele kosten en gebruikerstest.

## 6. Merlin-achtige geluidsherkenning — apart en niet Merlin zelf doorverkopen

De huidige Birdspot-route kan eigen geluid bewaren/afspelen en een bestand via Merlin laten beoordelen waar die deelroute al werkt. **Die bestaande gratis route blijft ongemoeid.** Cornell bevestigt dat **Merlin Bird ID zelf gratis** is, en geeft geen recht om hun model, Sound ID, naam of data als commerciële Birdspot-feature over te nemen: https://support.ebird.org/en/support/solutions/articles/48000961587-merlin-bird-id-faqs .

De mogelijke **Birdspot Sound Plus**-functie is een optioneel geïntegreerd herkenningsproces: audio opnemen/importeren → geschikte modellen (bij voorkeur lokaal en offline waar haalbaar) → mogelijke soorten en onzekerheid tonen → gebruiker beluistert/vergelijkt → **zelf bevestigen, afwijzen of onbepaald opslaan**. Nimmer automatisch een waarneming als bewezen determinatie publiceren. Controleer per model/dataset/commerciële licentie, soortdekking per land/seizoen, offline prestaties, batterij, privacy, bestandsgrootte, bronaudio-rechten en misidentificatie.

Een **kleine eenmalige betaling** is een prijs**hypothese**, geen besluit; bij doorlopende providerkosten kan een gebruikslimiet of abonnement realistischer zijn. Vergelijk steeds met gratis Merlin, zodat Birdspot geen onduidelijke betaalmuur vóór bestaande gratis functies creëert.

**Nieuw gekoppeld eigenaarbesluit 15-11-2026 — gratis Merlin via centrale +:** de gebruiker moet met de centrale `Waarnemen +`-knop snel kunnen kiezen tussen onmiddellijk zelf een vogel registreren en via de **gratis externe Merlin-app** geluid herkennen. Na eigen bevestiging volgt de bestaande Birdspot-waarnemings- en pinroute. Dit is **een gratis kern-UX-wens, geen onderdeel van betaalde Sound Plus**. Onbewezen automatische API/deep-link, de huidige ontbrekende audiobijlage in addSheet en toestel-/offlinegates staan in de aparte [Snelwaarnemen + / Merlin-brief](BIRDSPOT_PLUS_MERLIN_SNELWAARNEMEN_V0.1_DRAFT.md). Alle bestaande Premium-opties in dit hoofdstuk blijven kandidaten voor **latere eigen gelicentieerde functies**.

## 7. Digitale aankopen en platformgrenzen

Bij distributie als app via Google Play of Apple's App Store gelden specifieke digitale-content-/in-app-purchase-regels en uitzonderingen per platform/regio. Vastlegging 15-11-2026, niet als technische implementatiebesluit:
- Google Play policy: https://support.google.com/googleplay/android-developer/answer/10281818 — digitale goederen, Play Billing of wettelijk/toegelaten alternatief; verdiende loyaliteitspunten kunnen afzonderlijke behandeling hebben.
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/ — IAP-regels voor digitale features en beperkingen op gestimuleerde reviews.

**Niet gekozen:** distributie via appstores, betaalprovider, prijzen, korting, abonnement, points wallet, btw-inrichting, accounts, cloudopslag, moderatieplatform, exacte releaseperiode. Dit blijft onder eigenaarbesluit en actueel juridisch/productonderzoek; geen automatische upgrade of betaalde dienst starten.

## 8. Fasering, afhankelijkheden, test- en vrijgavegates

| Moment | Werk | Voorwaarde |
|---|---|---|
| **Nu: F2 / S1** | Bestaande 140 vogels en de gratis kernroute afwerken; deze wensen vastleggen als richting. **Geen media/betaalcode, geen punten, geen user-upload cloud** | Huidige eigenaarvolgorde, bronrechten, browser- en echte toesteltests |
| **Kleine lokale proef na S1-gate** | Eigen gidsfoto als **privé, terugzetbare override**; geen upload of score | E2E opslaan → offline → heropenen → ZIP/restore; geen aantasting officiële media |
| **S2/S3 afhankelijk van behoefte** | Vrijwillige bijdrage/upload naar afgeschermde reviewwachtrij met credit, licentie, beschermde-soort-filter en eigenaarmoderatie | Auth-/server-/A/B-/privacy-, malware-, consent-, intrek-/verwijdertests en beheerkosten |
| **S4 alleen na eigenaarbesluit** | Publicatiepunten, kortings-/gratis pakketten, betaalde templates/Film Studio, eventueel geïntegreerde Sound Plus | Werkelijk gebruik, prijs/waarde, appstores, licenties, entitlement-/refund-/restore- en kostenbewaking |

**Concrete acceptatievoorbeelden:** persoonlijke override verandert nooit openbare gids en overleeft ZIP/herstart; herstel standaard werkt zonder gebruikerdata te verwijderen; insturen vraagt afzonderlijke bewuste toestemming; een afgewezen foto verschijnt niet publiek en levert geen automatisch punten op; een geaccepteerde foto met correcte credits wordt pas na owner-review gepubliceerd; korting wordt slechts eenmaal verzilverd; na refund/restore klopt de entitlement; herkenningssuggestie blijft onzeker tot de gebruiker bevestigt.

**Risico → maatregel:** licentie/GPS-lek, uploadmisbruik, geforceerde paywall, dure videorendering of slechte herkenningssuggestie → minimale fases, server-side validatie waar nodig, gescheiden media, controleerbare kosten/stoplimiet en onafhankelijke QA. Hosting-, store- en modelkosten momenteel **UNKNOWN**. Alle nieuwe code- en livegates blijven **NOT TESTED**.

## 9. Relaties, historie en overdracht

- Bestaande Birdspot-vogelbeeldnorm: `docs/BIRDSPOT_KWALITEITSNORM.md` (6 controles per officiële foto, geen verzonnen rol/vlucht); dit document wijzigt die norm niet.
- Eerdere LOCKED richting: Roadmap v1.3 FINAL / Veldhandboek v0.6 FINAL voor algemene feedback, gerichte foto-oproep bij lege rol, beoordelen vóór publicatie, credits, originele media privé houden en bewust gedeelde communitykopieën. **Geen herdefinitie van die bestaande regels.**
- Latere eigenaarapp: `docs/roadmap/BIRDSPOT_EIGENAARAPP_VISIE_V0.1_DRAFT.md`, eerst volledige gebruikersapp-kopie na expliciete start; het beheer van ingediende foto's en beloningen kan daarna daarin landen.
- App-README is canoniek productcontract; Index en Veldhandboek blijven vindplaatsen/onderbouwende projectbronnen. Promotie naar een nieuwe FINAL-bronversie uitsluitend via eigen gecontroleerde update, niet door dit DRAFT.
- F2-30 op PR #234 (`328f147574d2bbf16d3bf19cc5c6e9d08184f38f`) is een **ander** ontwikkelspoor dan PR #231. Deze documentatiebranch volgt uitsluitend #231 zonder code te wijzigen; vóór toekomstig codewerk moet de eigenaar/uitvoerder de juiste verenigde releasebasis, HEAD, PR's en writer controleren.

**Status: DRAFT / PRODUCTRICHTING GEREGISTREERD; realistische haalbaarheid en iedere uitvoering blijven NOT TESTED.**
