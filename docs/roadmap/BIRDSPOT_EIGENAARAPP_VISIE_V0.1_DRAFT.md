# Aviandra — toekomstige eigenaarapp (hoofdapp) | visie en kandidaten

| Veld | Waarde |
|---|---|
| Versie | v0.1 DRAFT |
| Datum | 15 november 2026 |
| Status | Eigenaarbesluit voor volgorde/basis; concrete beheerfuncties **CANDIDATE / FUTURE**, niet gebouwd |
| Bron | Aviandra eigenaaropdracht 15-11-2026 (verduidelijking: pas na stabilisatie Aviandra, eerst kopiëren, nu niet koppelen) |
| Gezag | Aviandra app-README bepaalt requirements; dit document is een gekoppelde toekomstige uitwerking, geen tweede algemene norm |
| Starttrigger | **Pas als de huidige Aviandra-gebruikersapp redelijk af, stabiel en door eigenaar klaar bevonden is** |
| Implementatie | **NOT STARTED / NOT TESTED** — geen extra app, geen koppeling, geen backend, geen accounts, geen betalingen |

## 1. Gelockte richting en grenzen

De eigenaar wil **eerst de bestaande Aviandra-gebruikersapp afwerken**. De nieuwe eigenaarapp wordt **nu niet gestart, gekoppeld, uitgerold of van accounts voorzien**. Een bestaand pilot- of reviewproces mag niet hierdoor worden vertraagd.

**Later, na een expliciete startopdracht:** neem één dan geldige, geteste Aviandra-release als exacte, versieerbare basis en maak daarvan een **kopie voor de eigenaar**. De eigenaarapp behoudt **alle functies die gebruikers dan hebben**, inclusief dezelfde navigatie/uitstraling, vogelgids, zoeken, herkennen, foto-/kleedvergelijkingen, kaarten, eigen waarnemingen, media, collecties, favorieten, offline werking, back-up/herstel en de andere dan geldige gebruikersfuncties. **Niet alleen een dashboard met beheerfuncties.** Voeg afzonderlijke, duidelijk afgeschermde eigenaarschermen toe. Geen huidige basisfuncties schrappen zonder eigenaarsbesluit.

Het woord 'kopie' beschrijft het gewenste volledige functionele en visuele uitgangspunt. De precieze technische route (apart project, gedeelde kernmodules, centraal platform, data- en updatecontract) is **OPEN** tot de latere kickoff. Vermijd dan ongewenste drift: nieuwe gebruikersverbeteringen moeten ook in de eigenaarapp kunnen terugkomen zonder alles dubbel te onderhouden. Maar **nu geen code-/appkoppeling voorbereiden of bouwen**.

De toekomstige eigenaarapp en gebruikersapp kunnen **later** bij de daarvoor vereiste functies veilig met elkaar communiceren. Dat betekent **niet** dat de privéwaarnemingen of originele media van gebruikers standaard door de eigenaar mogen worden ingezien. Privé en openbaar, logboek en community, test en productie blijven gescheiden.

## 2. Gevraagde en aanvullende beheerfuncties (geen actuele MUST-build)

| Domein | Gewenste eigenaarfunctionaliteit | Startprioriteit later | Acceptatie-/privacygrens |
|---|---|---|---|
| Feedback en tickets | Binnenkomende positieve en negatieve feedback, opmerkingen, ideeën en bugmeldingen; soort-/scherm-/versiecontext; indien vrijwillig gedeeld contactkanaal | Hoog (eerste beheerroute) | Geen persoonsgegevens verplicht voor algemene feedback; ontvang-/status-/afhandelpad aantoonbaar |
| Feedbackoverzicht | Diagrammen en tabellen: categorie, frequentie, ernst, trend, status, terugkerende problemen; filteren op appversie, vogelsoort of functie | Hoog | Onbekende sentimenten handmatig corrigeerbaar; geen onterechte conclusies uit kleine aantallen |
| Werkvoorraad | Duplicaten bundelen, prioriteren, toewijzen, status nieuw/onderzoek/bezig/opgelost/heropend, gekoppelde fixes en testbewijs | Hoog | Alle oorspronkelijke berichten behouden, archivering/undo en audittrail |
| Productgebruik | Downloads/installaties waar meetbaar, actief gebruik, eerste waarneming, terugkeer, gebruikte kernfuncties, uitval en crashes | Middel | Opt-in of rechtmatige privacybewuste meting; geaggregeerde weergaven; geen verborgen tracking of schijnprecisie |
| Communitymoderatie | Meldingen/rapportages, bijdrage controleren, verbergen, corrigeren, verwijderen, blokkeren waar proportioneel en herstelbaar | Middel (wanneer community bestaat) | Rolrechten server-side + direct API test, moderatielog, beroep/herstel, beschermde soorten/GPS niet lekken |
| Gidsinhoud | Correctieverzoeken, ontbrekende foto's, bron-/licentiecheck, review/goedkeuring, ontbrekende rollen en open punten per soort | Hoog relevant bij uitbreiding | Bronbewijs behouden, auteur/licentie/rollen blijven de harde inhoudsgates; nooit een onbeoordeelde upload publiceren |
| Pakketten/landen | Overzicht van afzonderlijke (mogelijk betaalde) Frankrijk- en Duitslandpakketten, prijs/activatie, toewijzing, status en ondersteuning | Later / S4-kandidaat | Prijs en rechten door eigenaar besloten; landlijsten, mediarechten en kosten eerst bewezen; geen betaalfunctie nu |
| Financiën | Omzet, verkopen, restituties, platform-/transactiekosten, support-/hostingkosten, netto resultaat, boekhoudkundige export | Later / S4-kandidaat | Aggregaten en providerreferenties; geen kaartnummers/CVV; providerkeuze, btw en wettelijke verwerking afzonderlijk onderzoeken |
| Promoties | Tijdelijke acties, proefperiode/pakketkorting, campagnecode en activatievoorwaarden | Later | Prijs, duur, doelgroep, audit en intrekken vooraf controleerbaar; geen onbevoegde korting |
| Push en berichten | Opt-in aankondigingen, bugfix-info, feedbackantwoord, gerichte nieuwe soorten of relevante meldingen | Later | Expliciete toestemming, afmelden, rate limiting en privacy-/locatiebeveiliging; geen push-spam |
| Operationeel beheer | Appversie per omgeving, open incidenten, fouten, uptime waar gemeten, gebruikskosten, backups, herstelstatus, deployments | Middel bij echte publieke uitrol | Read-only standaard, alle wijzigingsacties auditen; productie/publicatie altijd eigenaarbesluit |
| Toegang & support | Beheerrollen, veilig contact met klant na toestemming, inzage in supportdossier en relevante consenthistorie | Hoog voordat multi-user | Minste rechten, MFA, server-side tenant-/gebruikersisolatie; geen brede toegang tot iemands privéarchief |
| Kwaliteit en release | Feedback → issue → bug reproduceerbaar → fix → regressie → afgeschermde preview → eigenaarreview → release | Hoog | Nooit automatische appaanpassingen uit feedback; exact SHA, tests, restore en rollback aantoonbaar |

Dit is een **voorlopige kandidatenlijst**, geen verplichting om alles tegelijk te bouwen of om nu een technologie/prijs te kiezen. Vóór de eigenaarapp-kickoff prioriteren op daadwerkelijke gebruikersvragen en exploitatiekosten.

## 3. Eerst bouwen: één kleine beheerroute (na startbesluit)

**Gebruiker:** producteigenaar / beheerder.  
**Probleem:** feedback uit een publiek gebruikte Aviandra-app niet betrouwbaar en traceerbaar kunnen verwerken.
**Kernroute:** klant dient feedback in → eigenaar ziet ticket in persoonlijke eigenaarapp → groepeert/markeert prioriteit → koppelt soort of functie → volgt fix/test/versie → sluit/heropent met historie.  
**Non-goals eerste beheerpilot:** geen volledig commercieel dashboard, geen betaalprovider, geen geautomatiseerde moderatiebesluiten, geen massale push, geen onbeperkte CRM-data.  
**Fout/herstel:** offline/onbereikbare dienst mag geen dubbele tickets of verloren invoer maken; bij wijziging blijft het oorspronkelijke bericht en auditspoor bewaard.  
**Tests:** scheiding gebruiker A/B en beheerder, geen toegang via directe URL/API, herhaald inzenden, annuleren, offline foutpad, herstel, rechten, privacy, versiebinding, browser/mobiel.  
**Kosten/risico:** opslag, mail, analytics, notificaties, betalingen, support en moderatie apart in het toekomstige kostenregister; huidige bedragen/quotums **UNKNOWN**, geen providerkeuze.  

Daarna alleen op bewijs van behoefte en beheerbaarheid uitbreiden naar communitymoderatie, pakketbeheer, betaling en campagnes.

### Nieuwe kandidaat: fotobijdragen en beloningen (15 november 2026)

**Pas na start van de eigenaarapp** kan de eigenaar in dezelfde app, naast alle normale Aviandra-functies, een afgeschermde wachtrij beheren voor vrijwillig aangeboden gebruikersfoto's, waaronder ontbrekende hoofdfoto's, man/vrouw, juveniel, vlucht en betere vervangingskandidaten. Maak visuele soort-/rol-/rechtencontrole, goedkeuren/afwijzen, credits, status, communicatie en log zichtbaar. Voeg pas later, bij een afzonderlijk beloningsbesluit, puntenmutaties, afgewezen/gedupliceerde bijdragen, tegoeden, toegekende kortingen of gratis pakketten toe. De eigenaar beheert **geen** privéfoto's die een gebruiker slechts als eigen gidsfoto heeft ingesteld. Persoonlijke foto-override blijft lokaal/privé totdat afzonderlijk bewust een inzending is verstuurd.

De kandidaat-functies voor betaalde Media Studio, film-/diashowtemplates en geïntegreerde vogelgeluidsherkenning zijn uitvoerings-/betaalonderdelen van de gebruikersapp, **geen** aanleiding om de eigenaarapp nu eerder te starten. De toekomstige eigenaarapp kan later wel overzichten van deze aankopen, uitgiften, restituties en kosten tonen, mits rechten/gegevensuitwisseling goed zijn getest. Zie [Aviandra eigen foto's, bijdrages, beloningen en Media/Sound Plus v0.1](BIRDSPOT_EIGEN_FOTOS_BIJDRAGEN_BELONINGEN_MEDIA_PLUS_V0.1_DRAFT.md).

## 4. Architectuurkeuzes — uitgesteld

- **Nu:** Aviandra S1 alleen ontwikkelen/reviewen; geen extra eigenaarapp of verbinding.
- **Later:** exacte stabiele basisrelease/SHA bevriezen; volledige gebruikersfunctionele pariteit vaststellen; eigen designbrief; pas dan bepalen waar beide interfaces naast elkaar draaien.
- **Na aparte beslissingen:** identiteit, rollen/autorisaties, serverdata, sync, community, betalingen en notificaties. Niet aannemen dat bestaande lokale PWA-data vanzelf in een gedeelde omgeving aanwezig is.
- Eén veiligheidsprincipe staat voorop: de eigenaar mag publieke/community-items beheren en supportcases behandelen, maar dat is **geen** generiek recht om persoonlijke foto's, GPS of lokale waarnemingen van klanten te bekijken.
- Herstelbaarheid bij appupdates, betaaltransacties, gedeelde media en verwijderingen aantoonbaar testen. Eigenaarsactie is niet gelijk aan productie-"zet live".

## 5. Volgorde en gates

1. **Huidige fase:** Aviandra als gebruikersapp afwerken, vogels en functies in kleine reviewrondes, werkende afgeschermde preview naar eigenaar, vervolgens passende pilot/releasechecks.
2. **Startgate eigenaarapp:** gebruiker geeft expliciet aan dat Aviandra *redelijk af* is en zegt **begin met mijn eigenaarapp**. Geen automatische start op basis van 140 soorten, aantal rondes of gebruikers.
3. **Kickoff eigenaarapp:** kopie van geteste gebruikersapp met volledige functiepariteit; aparte ontwerp-/privacy-/kostenbrief en terugvalpunt; daadwerkelijke tools/capabilities toetsen.
4. **Eigenaarapp S0/S1:** eerste feedback- en issuebeheerroute, zonder noodzakeloze complexiteit.
5. **Latere fasen:** community en accounts alleen na A/B-rechten- en privacygate; betaalde landenpakketten/financiële functies pas na afzonderlijke eigenaarbeslissing, kostentoets en compliance; promo/push later.
6. **Release:** preview en pilot zijn niet live. Productie alleen bij expliciete **'zet live'/'live'** op één release-SHA na volledige tests en rollback.

## 6. Status en onafhankelijksheidsgrens

Dit document legt het eigenaarsbesluit en ideeën correct vast; er is **GEEN** werkende eigenaarapp, nieuwe gekoppelde gegevenslaag, technische beveiligingsimplementatie, betaalmodule of preview van de eigenaarapp. **Document review DRAFT ≠ app-PASS.** Eigenaarsfeedback en latere technische beslissingen mogen kandidaten wijzigen. Dit document is een vindplaats, niet een tweede algemene Handbook of inhoudelijke vogelfotonorm.
