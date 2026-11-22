# Birdspot — inhouds- en fotokwaliteitsnorm

| | |
|---|---|
| Versie | 1.10 DRAFT · 22-11-2026 · eigenaarbesluit bronverificatie |
| Status | **DRAFT op basis van v1.7 FINAL**; eerdere vastgestelde regels intact; revisie v1.10 ter review, geen activering, merge of release. Kandidaten v1.8 (#282) en v1.9 (#315) blijven eigen conceptsporen. |
| Herkomst | Eigenaaropdracht "Nieuwe eigenaarbesluiten, livegang en batch M3" (10-11-2026) en het vastgelegde besluit op PR #127 ([comment 6779875047](https://github.com/saddamsmit-source/Birdspot-Library/pull/127#issuecomment-6779875047)) |
| Geldt voor | Alle soortkaarten van Birdspot Library: soortdata (`src/data/species.js`), kennisprofielen (`tools/kennisbaseline/knowledge.json`), gidsfoto's en soortaudit |
| Gezag | Dit document is de enige plek waar deze drie regels staan. Andere documenten verwijzen hiernaar en herhalen de regels niet |

De regels gelden alleen voor Birdspot. Het algemene App Development Handbook verandert hierdoor niet.

Doel: een vogelgids die vogelkenners kunnen vertrouwen. Herkenningsinformatie moet aantoonbaar juist zijn en foto's moeten geverifieerd zijn. Kleine, natuurlijke afwijkingen in maten mogen het werk niet blokkeren.

---

## 1. Lengte, spanwijdte en gewicht (biometrie)

Vogels verschillen van nature in grootte. Bronnen noemen daarom vaak net andere maten. Voor gewone maatgegevens toont Birdspot een afgeronde, indicatieve band met het woord **"ca."**. Het is geen biologisch minimum en maximum.

### 1.1 Werkwijze

1. **Bronnen verzamelen.** Neem twee of meer passende, betrouwbare bronnen van **verschillende uitgevers**. Twee websites die hetzelfde overnemen tellen als één bron.
2. **Vergelijkbaarheid controleren.** Controleer dat de bronnen dezelfde soort, eenheid, populatie of ondersoort en meetdefinitie beschrijven. Voorbeelden van verschillende meetdefinities: lichaamslengte tegen vleugellengte, of spanwijdte tegen vleugellengte.
3. **Berekenen.** Neem het gemiddelde van de ondergrenzen en het gemiddelde van de bovengrenzen.
4. **Afronden** naar de dichtstbijzijnde stap. Een half rondt naar boven af.

   | Grootheid | Stap |
   |---|---|
   | cm, onder 30 | 1 cm |
   | cm, 30 of meer | 5 cm |
   | g, onder 100 | 1 g |
   | g, 100 tot 1000 | 10 g |
   | g, 1000 of meer | 50 g |

5. **Tonen** als "ca. X–Y cm" of "ca. X–Y g". Een uitleg mag de band nooit "de volledige variatie" noemen.
6. **Vastleggen** van de oorspronkelijke bronwaarden, bron-URL's (via `_sources`) en de methode in `basis.biometrics` van het kennisprofiel (§1.3).
7. **Niet blind combineren.** Behandelen bronnen verschillende ondersoorten, geslachten of meetmethoden? Combineer ze dan niet. Kies de passende bron, of geef een eerlijk breder bereik met een toelichting.
8. **Uitschieters.** Is een bronwaarde duidelijk een typefout of onverenigbaar met de andere bronnen? Leg haar vast onder `excluded` met de reden en reken zonder haar. Er moeten dan nog steeds twee uitgevers overblijven.
9. **Niet blokkeren.** Een klein, verklaarbaar meetverschil is geen reden om een batch te blokkeren.

Gaat het om één bron of één uitgever? Dan blijft de bestaande Birdspot-waarde staan en wordt het verschil vastgelegd in `discrepancies`.

**Grens.** Deze tolerantie geldt alleen voor gewone maatgegevens. Ze geldt niet voor kritische determinatiekenmerken, soortidentiteit, juridische beschermingsstatus of andere gegevens waarbij een afwijking de betekenis verandert. Een circa-band is nooit een doorslaggevend herkenningskenmerk.

### 1.2 Voorbeelden (uitgevoerd 10-11-2026)

| Soort | Maat | Bronwaarden | Uitgesloten | Getoond |
|---|---|---|---|---|
| Kleine Mantelmeeuw | spanwijdte | Vogelbescherming 124–127; Wildlife Trusts 135–150 | — | ca. 130–140 cm |
| Kleine Mantelmeeuw | lengte | Vogelbescherming 51–61; Wildlife Trusts 52–67 | — | ca. 50–65 cm |
| Stormmeeuw | lengte | Wildlife Trusts 38–44; Oiseaux-Birds (*L. c. canus*) 40–46 | Vogelbescherming 40–60: de bovengrens past niet bij een meeuw die duidelijk kleiner is dan de Zilvermeeuw (55–67 cm volgens dezelfde uitgever) | ca. 40–45 cm |
| Houtduif | lengte | Vogelbescherming 40–42; Cornell Lab 41–45 | — | ca. 40–45 cm |

De eigenaar noemde voor de Stormmeeuw "ca. 40–50 cm, wanneer de broncontrole dit ondersteunt". De broncontrole wijst 60 cm aan als uitschieter. Zonder die waarde komt de band op ca. 40–45 cm uit.

### 1.3 Gegevensvorm en controle

In het kennisprofiel:

```json
"basis": {
  "size": { "text": "…", "sources": ["…"] },
  "biometrics": [
    { "field": "wingspan", "unit": "cm", "display": "ca. 130–140 cm",
      "values":   [ { "source": "VB_KMM", "min": 124, "max": 127 }, { "source": "WT_KMM", "min": 135, "max": 150 } ],
      "excluded": [ { "source": "…", "min": 0, "max": 0, "reason": "…" } ],
      "note": "…" }
  ]
}
```

- `field` is een van `length`, `wingspan` of `weight`.
- `unit` is `cm` of `g`.
- `excluded` en `note` zijn optioneel.

De validator `tools/kennisbaseline/build_knowledge.py` controleert:

| Code | Wat |
|---|---|
| KV-13 | Minstens twee waarden van verschillende uitgevers. `display` moet exact uit de methode van §1.1 volgen en met "ca." beginnen. Een uitgesloten waarde heeft een reden |
| KV-14 | De getoonde maat in `src/data/species.js` (`size.<field>`) is gelijk aan `display` |

De publiekskaart toont uitsluitend de onderbouwde, afgeronde maatbanden. De oorspronkelijke bronwaarden, uitgesloten waarden en rekenmethode blijven in `basis.biometrics`, het bronregister en de validator controleerbaar, maar verschijnen niet als niet-verplichte bronlijst in de app (§2.2).

---

## 2. Betrouwbaarheid van herkenningsinformatie

Inhoudelijke juistheid heeft absolute prioriteit. Een compacte beschrijving die aantoonbaar klopt, gaat voor een uitgebreide beschrijving waarin belangrijke kenmerken niet kloppen.

| Label (UI) | Contractwaarde | Wanneer |
|---|---|---|
| **Doorslaggevend** | `doorslaggevend` | Alleen als het kenmerk onder de beschreven omstandigheden echt diagnostisch is en sterk onderbouwd |
| **Helpt** | `ondersteunend` | Nuttig, maar niet op zichzelf voldoende |
| **Niet alleen op vertrouwen** | `onbetrouwbaar-alleen` | Het kenmerk varieert sterk of overlapt tussen soorten |

Wat "sterk onderbouwd" betekent:
- Een kritisch kenmerk met:
  - `conditions` (de omstandigheden);
  - `diagnostic` (de onderbouwing);
  - bronnen van minstens twee verschillende uitgevers (KV-12).
- Een beoordeling in `docs/kennisbaseline/doorslaggevend-review.json` (KB-10).
- Een veldkenmerk (`keyMarks`) is nooit doorslaggevend.

Verder geldt:
- **Onafhankelijkheid.** Twee websites die dezelfde informatie overnemen, tellen niet als onafhankelijk bewijs. Bij twijfel is het kenmerk "Helpt".
- **Omstandigheden.** Controleer waar relevant leeftijd, geslacht, seizoen, ondersoort en geografische variatie. Neem die op in `conditions` en `exceptions`.
- **Niets verzinnen.** Wat niet uit een bron vaststaat, gaat naar `open`. Verzin nooit details om een profiel vollediger te laten lijken.
- **Onzekerheid.** Leg die vast in `open`, `exceptions` of `discrepancies`. Een kleine, normale variatie blokkeert de batch niet.

---

### 2.1 Voorkeursbronnen voor soortherkenning en de beoordeling van gevonden foto's (eigenaarbesluit 14-11-2026)

**Start met Vogelbescherming Nederland en de ANWB-vogelgids als voorkeursreferenties voor de inhoud.** Dit betreft het **verifiëren van vogelkenmerken en uitleg**, niet het verplicht overnemen van afbeeldingen van deze bronnen. Bij de beoordeling van foto's die Birdspot elders heeft gevonden, geldt:

1. **Per soort raadplegen.** Lees eerst de toegankelijke, toepasselijke soortbeschrijving van [Vogelbescherming Nederland](https://www.vogelbescherming.nl/ontdek-vogels/kennis-over-vogels/vogelgids) en de soortpassage uit een passende **ANWB-vogelgids** wanneer die inhoud daadwerkelijk kan worden ingezien. Vergelijk wetenschappelijke naam/ondersoort, uiterlijke herkenning, soortverschillen, mannetje/vrouwtje, juveniel/volwassen, seizoen, levensgebied en waar relevant gedrag en geluid. Leg de directe soortlink of voor ANWB de boektitel, auteur, editie en paginanummer vast. Een ANWB-webwinkelpagina **bewijst alleen het bestaan van de gids**, niet wat er over een concrete soort in staat.
2. **Eigen gevonden foto beoordelen, niet bronfoto kopiëren.** Open het *oorspronkelijke bestand* van de kandidaatfoto en vergelijk de zichtbare kop, snavel, vleugel, staart, kleuren, lichaamsbouw en houding met de genoemde soortkenmerken. Beoordeel afzonderlijk wat het beeld echt toont en welke leeftijd/sekse/ondersoort daaruit wel of niet volgt. Ook een voorbeeldfoto bij een betrouwbare gids is geen automatische determinatie van **een andere** foto.
3. **Ontbrekende of conflicterende kenmerken.** Als de twee voorkeursbronnen onvoldoende detail, geen beschikbare passage of een inhoudelijk conflict hebben, raadpleeg een passende andere bron (bijv. BTO, Naturalis of een vakspecialist). Voor Nederlandse aantallen, trends en formele status blijven Sovon, CDNA/CSNA en de bevoegde wet- of lijstbron primair; prioriteit voor herkenning vervangt hun gezag niet. Een claim die niet overtuigend te onderbouwen is blijft **open** en mag geen vals VERIFIED-label krijgen.
4. **Afzonderlijke fotoherkomst- en rechtencontrole.** Alleen de oorspronkelijke bestandspagina en relevante licentie-/auteursgegevens kunnen herpublicatierechten, verplichte zichtbare credit, afbeeldingswijzigingen en broncontinuïteit onderbouwen. ANWB/Vogelbescherming maken een externe gevonden foto niet vrij te gebruiken. Alle zes controles uit §3.2 blijven verplicht voor iedere geplaatste foto.
5. **Bewijs en open punten bewaren.** Registreer per gecontroleerde soort welke voorkeursbron feitelijk is gelezen, welke kenmerken zijn getoetst, uitkomst en onzekerheid, datum en eventuele extra bronnen in het bestaande F2-brondossier/openpuntenregister. Bij twijfel over een kleedrol blijft het label neutraal, een ongefundeerde foto weg en het open punt voor later onderzoek bewaard.

**Bewijsgrens:** beide voorkeursbronnen zijn deskundige naslagwerken, maar niet onfeilbaar en niet altijd direct toegankelijk. Een 'bronvoorkeur' geldt alleen bij daadwerkelijk gelezen passende informatie en is nooit zelfstandig foto-PASS. De app beschrijft feiten in eigen woorden; originele ANWB-/Vogelbeschermingfoto's of beschermde tekst worden niet zonder geldige toestemming hergebruikt.


**Bronroute voor inhoudsreview (20-11-2026).**

- Gebruik [De Visdief en de gespecialiseerde naslagwerken](bronnen/VISDIEF_VOGELGIDSEN_BRONNOTITIE_2026-11-19.md) om gericht te zoeken naar een vergelijking, kleed, gedrag, roep of kijkgebied. Geef inhoudelijk bewijsgewicht aan de feitelijk geraadpleegde passage binnen haar toepassingsgebied. Een recensie, inhoudsopgave of boekcatalogus helpt de passage vinden. Leg bij een gelezen boek het werk, de auteur, editie, zo nodig het deel en de pagina vast. Een praktijkwaarneming ondersteunt de beschreven situatie. Onderbouw een algemene soortclaim met passend aanvullend bewijs.
- Achterhaal bij kritieke kenmerken per bron op welk oorspronkelijk bewijs de bewering rust. Een overgenomen waarneming, foto, meetreeks of boekpassage telt per claim één keer, ook bij verschillende websites, edities, vertalingen of uitgevers. Bewaar die relatie en eventueel bronverschil in het bestaande brondossier. Laat een verschil in regio, periode, kleed of methode zichtbaar in de onderbouwing. Geef een kenmerk bij resterende twijfel de toepasselijke status volgens §2.
- Leg in de bestaande soortaudit vast welke passage, kenmerken en omstandigheden zijn gecontroleerd. Benoem in de veldtekst waar je kijkt of naar luistert, welk verschil bruikbaar is en wanneer het ontbreekt. Habitat, één losse roep of een modeluitkomst geven op zichzelf onvoldoende houvast bij een onzeker soortpaar. Registreer de uitkomst in het bestaande openpunten- of vergelijkingsregister.
- Gebruik Sovon en de betreffende landelijke of regionale bronhouder voor verspreiding, trend en formele status. Gebruik voor een openbare kijktip de gebiedsbeheerder voor toegang, openingstijden en afsluitingen. Leg land of regio, periode en de datum van controle vast. Volg voor kwetsbare locaties de bestaande Birdspot-privacyregels.

---

### 2.2 Bronvermeldingen in de gebruikersinterface (eigenaarbesluit 14-11-2026)

**Toon geen bronvermeldingen waar dat niet verplicht is.** Dit geldt voor de soortbeschrijving, maat- en gedragsuitleg, herkenningskenmerken, vergelijkingspanelen, kennisprofiel, zangbeschrijvingen en de daaruit afgeleide status/leefwijze. Verwijder ook publieksmeldingen zoals 'Broncontrole volgt' en vrijblijvende bronlinks bij vogelvergelijkingen.

- **Verificatie blijft verplicht intern:** elke feitelijke claim houdt het geregistreerde bronbewijs, directe URL, bronuitgever, controledatum, onderlinge onafhankelijkheid, rekenmethode, onzekerheden en revisiehistorie in de canonieke dataset en QA-dossiers. Bronverwijzingen verdwijnen alleen uit de normale gebruikersweergave; geen bewijseis versoepelen, geen niet-geverifieerde claim als zeker tonen.
- **Verplichte attributies behouden:** bij foto's en geluidsopnamen de vereiste naam van de maker, licentie, bronlink en eventuele bewerkingsmelding volgens de specifieke licentie; bij kaarten of externe datasets de benodigde toeschrijving. Houd deze informatie bereikbaar en leesbaar op mobiel en toetsenbord. Dit mag via een bestaand foto-informatiepaneel als de desbetreffende licentie dat toelaat. Is de verplichte vermelding niet mogelijk, publiceer het materiaal niet.
- **Geen stilzwijgende kopie:** Vogelbescherming Nederland en ANWB blijven voorkeursbronnen voor inhoudelijke verificatie volgens §2.1; hun illustraties en teksten worden niet automatisch vrij herbruikbaar.
- **Herstel en QA:** tests verifiëren dat optionele bronlabels en -links verdwijnen uit soort- en kennispanelen **en** dat attributies voor daadwerkelijk gebruikte media en kaartdata intact blijven. De uitgebreide bronlijst blijft uitsluitend in de controlebestanden.

Deze afspraak gaat over Birdspot en laat eventuele wettelijke informatieverplichtingen elders in de app onverlet.

---

### 2.3 Verificatiebewijs, lacunes en eigenaarbesluit — v1.10 DRAFT (eigenaarbesluit 22-11-2026)

**Hoofdprincipe.** Voor een snelle determinatie kijkt de gebruiker in de eerste plaats naar een **goede echte foto**. De herkenningstekst is een even noodzakelijke tweede route en moet vooral bij onvoldoende of ontbrekend beeld zelfstandig bruikbaar zijn. Geen schijnzekerheid, geen ingevulde rol op basis van aannames en geen stilzwijgende voortgang bij een materiële lacune. De Project Owner beslist, niet de agent.

**A. Werkelijke voorkeursbroncontrole, per soort en per relevante claim.**
1. Lees de rechtstreeks toepasselijke soortinformatie van **Vogelbescherming Nederland** en de soortpassage in de **ANWB Vogelgids van Europa** daadwerkelijk, voor zover rechtmatig toegankelijk. Beide zijn leidend voor Nederlandse/Europese herkenning, kleden, levensstadia en verwarringssoorten; leg de broninhoud niet als automatisch onfeilbaar vast. De bestaande §2.1 blijft gelden.
2. Bewaar bij Vogelbescherming de directe soort-URL, relevante conclusie, datum en eventuele beperkingen. Bewaar voor ANWB boektitel, auteurs, **editie, ISBN, pagina**, besproken kenmerken en relevante leeftijd/kleed/hoek. Een webshop, recensie, AI-geheugen, zoekfragment of andere editie zonder gelezen soortpassage telt **niet** als ANWB-soortbewijs. Kopieer geen beschermde boekpassages of gidsillustraties in openbare repositorybestanden.
3. **ANWB-passage niet bereikbaar of niet te lezen?** Meld dit onmiddellijk als `NOT TESTED`, noem de soort en de ontbrekende passages en vraag de eigenaar naar het vervolg: rechtmatig toegankelijk digitaal/gedrukt exemplaar leveren of eerst andere bronnen onderzoeken. Andere bronnen mogen de ontbrekende ANWB-leesproef niet onzichtbaar vervangen en kunnen op zichzelf geen 'ANWB gelezen'-status opleveren. Respecteer licentie, DRM en toegangsvoorwaarden.
4. **Aanvullende onafhankelijke toets:** gebruik BTO, RSPB, Naturalis, Van Diek, Van Duivendijk, soortstudies en andere passende specialistische publicaties voor kruiscontrole of ontbrekende details; noteer regio, periode, ondersoort, leeftijd en bronfamilie. Dubbeltellingen van dezelfde oorspronkelijke passage zijn verboden. Voor Nederlandse aantallen/trends en formele lijsten behouden Sovon, CDNA/CSNA en bevoegde regionale instanties hun eigen brongezag.

**B. Foto en onafhankelijke herkenningstekst per soort.**
1. Bekijk de werkelijk getoonde Birdspot-foto op relevante resolutie, het bronorigineel en de rol waarvoor het beeld bedoeld is. Beoordeel visuele herkenbaarheid, soort, sekse/leeftijd, rust/vlucht, kleden, zichtbare kritieke kenmerken en beelduitdrukking voor snelle veldherkenning. De zes verplichte controles uit §3.2 inclusief fotoherkomst, bronrechten en publicatie blijven onverkort van kracht. Een werkende URL, ingevuld slot of overeenkomende hash is geen biologische PASS.
2. Benoem expliciet welke voor de determinatie belangrijke kenmerken een foto **wel of niet** toont. Een onvoldoende, verkeerd gedetermineerd of niet correct gelicenseerd beeld mag niet als geverifieerd worden getoond. Zoek een betere foto wanneer de eigenaar daartoe beslist; dwing geen vlucht- of juvenielbeeld af alleen om een vak te vullen (§3.3/§3.5).
3. Bij zwakke of ontbrekende foto's: bied onder **Snel herkennen** en bij relevante soortparen **Lijkt op** nauwkeurige, begrijpelijke en brongedragen tekst. Noem in maximaal drie primaire aanknopingspunten *waarop je kijkt of luistert*, *welk verschil zichtbaar/hoorbaar is*, *welke leeftijd, kleed, hoek, licht of seizoen daarvoor nodig is*, en *wanneer het kenmerk onvoldoende zekerheid geeft*. Test dubbelgangers in beide richtingen (§3.4). Bij een onvolledig fotopaar verberg je uitsluitend het incomplete beeldpaneel; de herkenningswaarschuwing en uitleg blijven in de gewone soorttekst beschikbaar.
4. Controleer daadwerkelijk gebruikte audio op soortidentiteit, zang/roep/vluchtroep, herkomst, hoorbaarheid, credits en herpublicatierechten. Een gelijk audiobestand of bronlabel bewijst niet op zichzelf de biologische betekenis. Ontbrekende audiodekking blijft herkenbaar OPEN.

**C. Verplichte zichtbare lacune- en beslispoort.**
- Rapporteer **vóór iedere volgende inhoudelijke F3-batch** aan de eigenaar ieder nieuw of relevant onopgelost gat bij bronlezing, foto's, kleedrollen, determinatie, vergelijkingsfoto's, tekst, geluid of herpublicatie. Benoem soort-ID, huidige afbeelding/rol, waarneming, bron met pagina/URL, impact op snelle herkenning, wat wél zeker is, onzekerheid, en de kleinste vervolgopties. Ook bij 'geen geschikte foto gevonden' expliciet melden.
- Laat de eigenaar bij ieder **materieel** gat kiezen: **(a) verder zoeken/verdiepen**, **(b) eerst tekst corrigeren of een geschikt beeld vervangen**, of **(c) voorlopig verder met het open punt**. Leg het expliciete besluit, datum, relevante soort-ID, voorwaarden en verwijzing naar gesprek/PR vast in het bestaande F3-/soortaudit-/openpuntenregister. Geen fictieve vooraf-toestemming, automatische keuze door een agent of algemene vrijstelling voor toekomstige soorten.
- Zonder bekendgemaakt materieel gat en **expliciet eigenaarbesluit** volgt **geen volgende F3-soortbatch** en geen inhoudelijke 'afgerond'-claim. Onafhankelijk brononderzoek of veiligheidscontrole binnen de reeds geautoriseerde ronde mag wel doorgaan. Een ontbrekend boek hoeft niet te worden gekocht zonder eigenaarbesluit.
- Eigenaarbesluit `voorlopig verder` autoriseert alleen de **werkvolgorde**, nooit een onbewezen determinatie, schijnbaar compleet fotopaar, onjuiste mediarechten, privacyafwijking, vervallen broncontrole of `VERIFIED`-/release-PASS. Als een claim of media-item juridisch/biologisch ongeschikt blijft, blijft dat item buiten de openbare gids of draagt het uitsluitend de aantoonbare beperktere claim. Bewaar het gat totdat het bewijs later is aangevuld.
- Als een batch **geen materiële lacunes** kent, rapporteer alsnog het bron-/foto-/tekstoverzicht en de bewaarde bewijsstatus. Geen publicatie/merge/live zonder de afzonderlijke releasegates.

**D. Beoordelingsrondes en gescheiden tellers.**
- **Huidige eerste F3-inhoudsronde:** loop eerst de 140 reeds gefotografeerde soorten individueel af in de bestaande volgorde. Bij peilpunt R41: **123/140 inhoudelijk bekeken, 17 te starten, 0 volledige F3-PASS**. Deze telling is een historisch checkpoint en wordt uitsluitend op basis van nieuwe repositorybewijzen bijgewerkt. Bestaande F1-/F2-/F3-bewijzen behouden hun eigen scope.
- **Tweede F3-verificatie-/eigenaarreviewronde:** pas nadat de eerste 140 individueel inhoudelijk zijn behandeld **en de eigenaar de app voor deze fase voldoende afgerond vindt en de tweede ronde expliciet start**, controleer je alle 140 opnieuw op brongetrouwheid, echte foto's en rollen, zorgvuldig geformuleerde tekst en vergelijkingsparen. De eigenaar kan per soort beelden afkeuren, verbeteringen vragen of een diepgaander foto-/brononderzoek kiezen. Reeds verzameld bewijs mag worden hergebruikt als het traceerbaar en geldig blijft; onbekend bewijs wordt opnieuw onderzocht.
- Markeer onafhankelijk `CONTENT REVIEWED`, `OWNER DECISION`, `FULL F3 VERIFIED` en `RELEASE` als verschillende vragen. Een eigenaar die een open foto accepteert geeft geen volledige inhoudelijke VERIFIED-status. Geen automatisch terugzetten of opnieuw doen van alle 123 vóór de afgesproken tweede ronde, behalve gerichte veiligheids-/regressiecorrecties.
- Het bestaande **F3_140_HERCONTROLE**-register, soort-/dubbelgangersdossiers, mediarechtenregister en huidige PR zijn de registratieplek. Geen tweede canoniek status- of besluitboek. Voeg alleen passende velden/controles toe na schema-/testimpactcontrole.

**E. Minimale overdracht aan de eigenaar bij een lacune (korte leeskaart).**

| Veld | Verplicht bij overdracht |
|---|---|
| Soort en beeld | Naam/soort-ID, huidige hoofd-/kleed-/vlucht- of vergelijkingsfoto, feitelijke kwaliteit en rol |
| Primair bewijs | Vogelbescherming directe soortlink + ANWB boek/editie/pagina of expliciet `NOT TESTED` |
| Veldherkenning | Kritieke kenmerken, ontbrekend fotobewijs, exacte korte tekst als alternatief, relevante dubbelganger |
| Extra controle | Onafhankelijke bron(nen), eventuele tegenstrijdige gegevens, audio en rechtenstatus |
| Keuze | Verder zoeken / foto of tekst gericht verbeteren / voorlopig verder met open punt |
| Eigenaarbesluit | Expliciete keuze + datum/PR + welk bewijs open blijft + veilige volgende batch |

Een onafhankelijke tweede review bevestigt de werkelijk onderzochte bewijslagen en kan vragen of gaten markeren, maar neemt nooit de product-/voortgangsbeslissing van de eigenaar over.


---

## 3. Fotokwaliteit en indeling

### 3.1 Vaste posities per soortkaart

Hoofdfoto → Mannetje → Vrouwtje → Juveniel → In vlucht → Vergelijkingen ("Lijkt op").

**Eigenaarbesluit 15-11-2026 — alleen complete vergelijkingsfotoparen tonen (alle soorten).** In "Lijkt op" verschijnt een paneel of tab uitsluitend wanneer **beide** soorten een geregistreerde, passende foto in dezelfde relevante houding hebben. Laat nooit een leeg fotovak of melding "Nog geen passende (vlucht)foto" in de publieksinterface zien. Als één van de twee foto's ontbreekt of wordt afgekeurd, blijft het vergelijkingspaar **intern** in de dataset en het openpuntenregister staan maar wordt het hele onvolledige paneel uit de weergave gelaten. Bewaar wel de complete, bruikbare tabbladen en andere soortvergelijkingen; geen onjuiste rust/vlucht- of leeftijdskleden invullen om een paneel compleet te maken. Dit geldt voor **alle soortkaarten**, niet alleen de Witte/Gele Kwikstaart. Toets datasetbreed, inclusief beide kanten van vergelijkingen, voordat de preview wordt bijgewerkt.

### 3.2 Verificatie per foto

Elke getoonde foto staat bij de juiste soort, leeftijd, geslacht en rol, en is gecontroleerd op:

1. soortidentiteit;
2. leeftijd en geslacht, voor zover benoemd;
3. werkelijke houding of vluchtstatus;
4. herkomst en fotograaf;
5. licentie en herpublicatierechten;
6. voldoende kwaliteit voor het beoogde herkenningsdoel.

De uitkomst per foto staat in `docs/fotokwaliteit/soortaudit/M*.json` en `SOORTAUDIT_TRACKER.md`.

Leg bij ieder nieuw of herbeoordeeld bestand afzonderlijk vast wat zichtbaar of hoorbaar is, wat de oorspronkelijke bron vermeldt en welke publicatierechten voor deze versie gelden. Een bestandsnaam, categorie, platformlabel of herkende soort geeft aanleiding tot controle. Een foto met een onzekere leeftijd blijft voor die leeftijdsrol open. Leg bij geluid ook vast wie de soort en het geluidstype daadwerkelijk heeft beluisterd en beoordeeld. Volg hiervoor het [bestaande audioprotocol](audio/BIRDSPOT_EBIRD_SOVON_AUDIO_BRONPROTOCOL_V0.1_DRAFT.md). Noteer zo nodig gewijzigde uitsnede, credits en de rechten voor distributie en offline gebruik.

### 3.3 Beoordelingsregels

- **Klein in beeld mag.** Is de vogel goed zichtbaar, herkenbaar en verifieerbaar? Dan is de foto bruikbaar. Een foto wordt niet afgekeurd of voorwaardelijk gemaakt alleen omdat de vogel het beeld niet vult. Voorwaardelijk is alleen terecht als het herkenningsdoel van die positie niet te zien is.
  Toegepast op 10-11-2026: de hoofdfoto's van Turkse Tortel (sp004) en Zilvermeeuw (sp094) en de vluchtfoto van het Wespendief-vrouwtje (sp248) gingen van voorwaardelijk naar goedgekeurd. Foto's die voorwaardelijk zijn om onscherpte of een onzichtbaar kritisch kenmerk blijven voorwaardelijk.
- **Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.** Een goede juvenielenfoto mag worden gebruikt wanneer poten/tenen of andere **niet-diagnostische** lichaamsdelen ontbreken. De foto moet voor het doel voldoende scherp en duidelijk zijn; de zichtbare kenmerken (bijv. juveniele kop-, borst- en veertekening) moeten zowel de soort als de benoemde jeugdige leeftijd overtuigend onderbouwen. **Onzichtbare poten op zichzelf zijn geen STOP of afkeurreden.** Bij een nieuwe toevoeging of definitieve foto-PASS blijven de zes controles van §3.2 **allemaal verplicht**, inclusief individuele originele foto, leeftijds-/soortidentiteit, herkomst, fotograaf, licentie en herpublicatierechten; geen leeftijd aannemen op basis van alleen een bestandsnaam of metadata. Is het ontbrekende onderdeel wél beslissend of ontbreken bewijzen, dan blijft de rol open/PARTIALLY TESTED; geen nieuwe ongetoetste foto publiceren. **Deze regel voegt uitsluitend voor juvenielen een proportionele beoordelingsuitzondering toe. Alle bestaande regels uit §§1–4 blijven ongewijzigd**, waaronder fotokwaliteit, echte vrije vlucht, geen verzonnen geslachtslabels, geen dubbele foto's, bronverificatie en het openlaten van ontbrekende posities.
- **Echte vlucht voor "In vlucht".** Opvliegen, landen en vleugels strekken zijn aparte houdingen en horen niet in de vluchtsectie. Dit staat in `docs/fotokwaliteit/vluchtcontrole.json` en wordt getest met VC-01..08.
- **Kleine vogels: herkenbare rustfoto's vóór een moeilijke vluchtfoto (eigenaarbesluit 14-11-2026).** Bij kleine soorten hebben een scherpe foto op een tak, stengel of andere ondergrond, correct mannetje/vrouwtje/juveniel-kleed en de visuele vergelijkingen voorrang. Een vluchtfoto is **niet verplicht** als die zo klein, onscherp of onduidelijk is dat de determinatie er niet beter van wordt. Vul de vluchtpositie dan niet kunstmatig en plaats geen twijfelachtige foto. Een al aantoonbaar bruikbare, echte vrije-vluchtfoto mag blijven. Een ontbrekend of zwak vluchtbeeld is een **later fotografie-onderzoekspunt**, geen automatische STOP voor een overigens correcte soortkaart. De zes controles van §3.2 blijven voor **elke wél geplaatste foto** verplicht. Registreer open beeld- en bronpunten in [F2-openpuntenregister](fotokwaliteit/F2_OPEN_PUNTEN_REGISTER_2026-11-14.md).
- **Geen verzonnen geslachtslabels.** Zijn mannetje en vrouwtje niet betrouwbaar te onderscheiden? Dan krijgt de foto een neutraal label, bijvoorbeeld "Volwassen".
- **Een ontbrekende positie blijft open.** Vul haar niet kunstmatig. De kaart toont dan "Nog geen foto" of verwijst naar de hoofdfoto.
- **Extra foto's mogen**, ook meerdere per categorie, als ze echt iets toevoegen. Toon de hoofdfoto eerst, daarna mannetje, vrouwtje, juveniel en In vlucht voor zover bevestigd beeld beschikbaar is. Gebruik dezelfde opname maar één keer in de hoofdsecties.
- **Fotovergelijking onder Lijkt op (eigenaarbesluit 14-11-2026).** Toon beide soorten naast elkaar, ook op mobiel. Gebruik beeld van hetzelfde type (vlucht naast vlucht, rust naast rust), liefst vanuit een vergelijkbare hoek. Bestaande gidsfoto's mogen hier terugkomen, ook als dezelfde foto op een ander vergelijkingspaneel staat. Een extra juvenielpaar verschijnt wanneer beide passende foto's beschikbaar zijn. De betreffende leeftijd en het geslacht worden alleen getoond als ze onderbouwd zijn. Wanneer bij een bestaand paneel een passend beeld ontbreekt, blijft de tekst als gewone herkenningsinformatie beschikbaar, maar het **hele incomplete fotopaneel wordt verborgen** volgens §3.1; toon geen leeg fotovak of melding. Houd individuele fotoherkomst toegankelijk via het informatietegeltje.
- **Gerichte vervanging of aanvulling** bij soorten die al foto's hebben is toegestaan na volledige verificatie (§3.2). Brede fotobatches voor soorten zonder foto's starten pas na een apart eigenaarbesluit.
- **Verbeterwensen registreren.** De eigenaar beoordeelt later elke vogelkaart zelf. Een verbeterwens, zoals een betere foto of een ontbrekende positie, gaat als `wishes` in de soortaudit en verschijnt in de tracker. Kleine, verdedigbare kwaliteitsverschillen houden de ontwikkeling niet tegen.

---

### 3.4 Kritieke dubbelgangers: overtuigend verschil in echte foto's én tekst (eigenaarbesluit 16-11-2026)

**Verplichte Birdspot-regel voor alle huidige en toekomstige F3-soortcontroles:** soorten die sterk op elkaar lijken, krijgen een **symmetrische, brongedragen determinatievergelijking**. Zowel de foto's als de begrijpelijke korte tekst moeten de gebruiker helpen daadwerkelijk het verschil te herkennen. De regel is soortspecifiek, niet een algemene vrijstelling of garantie dat ieder vergelijkingskenmerk altijd zichtbaar is.

1. **Identificeer de verwarringssoort(en).** Noteer per soort welke concrete andere soort/ondersoort erop lijkt, de wetenschappelijke namen en de risicokleden (mannetje, vrouwtje, juveniel, winter/eclips, voor zover relevant). Een afwijkende koptekening binnen dezelfde soort mag nooit automatisch als afzonderlijke soort worden geclaimd.
2. **Maak onderscheid in eigen woorden.** Toon bij ten minste het kritischste paar maximaal drie werkelijk onderscheidende, brongedragen punten met *beide* soorten naast elkaar: kijkpunt (kop, snavel, vleugel, stuit, roep), zichtbare verschillen, toepasselijke kleed/leeftijd/hoek en uitzonderingen. Rangschik betrouwbare aanwijzingen boven zwakke kleur-, grootte- of gedragsindrukken. Geen enkel overlappend kenmerk presenteren als 'doorslaggevend'. Bij twijfel blijft 'niet zeker' mogelijk.
3. **Vergelijk alleen betrouwbare, vergelijkbare foto's.** Onder 'Lijkt op' tonen we uitsluitend twee afzonderlijk gecontroleerde, correcte, gelicenseerde en werkelijk vergelijkbare foto's. Liefst dezelfde houding, kleed en kijkhoek. De zes individuele fotocontroles uit §3.2 gelden per beeld; geen andere vogel, AI-vervanging, fictieve geslachts-/leeftijdslabels, oncontroleerbare montage of tekst-only *vergelijkingskaart* als schijnoplossing. De gebruiker kan bij elk beeld de noodzakelijke credits zien.
4. **Ontbreekt een fotopaar?** **Verberg uitsluitend dat onvolledige paneel** zoals §3.1/v1.6 voorschrijft, maar houd de inhoudelijke waarschuwing zichtbaar in de bestaande herkenningstekst/kennisinformatie van beide soortkaarten. Registreer het ontbrekende fototype/bron of bevestigde audio als open punt; beweer nooit dat de fotovergelijking af is. Dit verduidelijkt de oude zin in §3.3: er verschijnt **géén leeg fotovak** ondanks behoud van de tekstuele herkenning.
5. **Toets in beide richtingen.** Open soort A → soort B én B → A; controleer werkelijk gepaarde beelden en interpretatie van de maximaal drie regels op mobiel (320/360/390 px), zoomen, terug, kleine schermen en zonder netwerk; bron-/audiorechten, echte rol en een onafhankelijke tweede inhoudsreview blijven aparte F3-gates.
6. **Borg hergebruik in plaats van een losse herinnering.** Het F3-soortregister verwijst naar het [dubbelgangersregister](fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json), met pair-IDs, risicokleden, bronnen, de status van beide foto's en expliciete open punten. De automatische controle bewaakt ID's, kleur-/sekseclaims en het verbergen van onvolledige paren. **Geen 'foto+tekst-PASS'** zonder werkelijk bewezen voor/na-verschil op beide kaarten en verifieerbare beelden.

Deze regel breidt de bestaande foto's en herkomstverplichtingen uit; zij vervangt **niet** §2 (betrouwbaarheid), §3.1 (alleen complete fotoparen), §3.2 (zes individuele fotocontroles) of het onderscheid tussen CI, inhoudelijke fotoaudit en fysieke toesteltest.

---

### 3.5 Fotoprioriteit bij de snelle veldcheck — v1.10 DRAFT (eigenaarbesluit 22-11-2026)

Voortbouwend op niet-gemergd voorstel v1.8 (#282), onder de eigenaarspoort voor iedere materiële ontbrekende foto (§2.3), zonder versoepeling van §3.1–3.4:

- **Alle soorten:** de scherpste, duidelijkste, soort- en rolgeverifieerde hoofdfoto heeft voorrang. Controleer of elk aanvullend beeld voor een snelle veldcheck werkelijk iets toevoegt; laat zwakke foto's niet stilzwijgend staan.
- **Kleine vogels:** heldere rust- en kleedfoto's op tak/stengel/ondergrond en goede dubbelgangersparen gaan vóór een twijfelachtige vluchtfoto. Gebruik alleen aantoonbare geslachts-/leeftijdsrollen; waar sekse niet betrouwbaar te zien is, gebruik `Volwassen`. Controleer waar relevant kop, wenkbrauwstreep, snavel, vleugel, poten en tekst.
- **Grotere vogels en roofvogels:** kies na een geschikte hoofdfoto en kenmerkende kleden vaker ook een bruikbare echte vrije-vluchtfoto wanneer silhouet, vleugels, staart of houding belangrijk zijn. Fotoparen dienen hetzelfde relevante kleed en bij voorkeur een vergelijkbare houding te tonen.
- **Juvenielen:** zijn geen vuldoel. Alleen opnemen bij werkelijk bewezen soort én leeftijd met alle zes individuele controles van §3.2. Overigens de juvenielenuitzondering van §3.3 behouden voor niet-diagnostisch onzichtbare poten.
- **Ontbrekende of zwakke foto:** verberg incomplete `Lijkt op`-fotopanelen, maar laat correcte, duidelijke tekst over de zichtbare verschillen beschikbaar. Leg per rol het ontbrekende bewijs vast en toon het aan de eigenaar.
- **Voortgang:** een ontbrekende optionele vlucht- of juvenielenfoto hoeft niet het andere correcte werk af te keuren, maar de agent mag het gat **nooit automatisch als toestemming voor een volgende batch** behandelen. De eigenaar beslist via §2.3. De foto krijgt zonder bewijs nooit `VERIFIED`.

---

## 4. Statussen en presentatie

- Gebruik alleen de statussen VERIFIED, PARTIALLY TESTED, NOT TESTED en BLOCKED. Gebruik nooit een PASS die niet echt gehaald is.
- Een geautomatiseerde rendercontrole over alle soorten is geen inhoudelijke of visuele goedkeuring van die soorten.
- Een tussenrelease mag soorten bevatten die nog niet individueel gecontroleerd zijn. Een soort zonder audit en kennisprofiel draagt in de app geen kwaliteitsclaim. Profielen tonen "onafhankelijke controle nog open".
- Een document dat FINAL is, betekent geen app-PASS en geen productieakkoord.

## 5. Waar wordt deze norm toegepast

| Onderdeel | Document of tool |
|---|---|
| App-overzicht | `README.md` §Kwaliteitsnorm |
| Kennisprofielen | `docs/kennisbaseline/README.md` §2 en §9; validator KV-11..14; tests KB-01..11 |
| Foto's en soortaudit | `docs/fotokwaliteit/SOORTAUDIT_TRACKER.md` (kop), `tools/fotokwaliteit/soortaudit.mjs`, `vluchtcontrole.json` |
| Capabilities | `docs/kennisbaseline/README.md` §6 (delta CAP-BIRD-012/015) |

## 6. Historie

| Versie | Datum | Wijziging |
|---|---|---|
| 1.0 | 10-11-2026 | Eerste vaststelling. Bundelt de regel "doorslaggevend" van 10-11 (FQA-04, KV-12, KB-10) en voegt de biometrie-, betrouwbaarheids- en fotoregel van de eigenaar toe. Direct toegepast: vier circa-banden (§1.2) en drie herbeoordeelde foto's (§3.3) |
| 1.1 | 13-11-2026 | Eigenaar verduidelijkt: ontbrekende poten/andere niet-beslissende delen zijn geen automatische stop; met overtuigende leeftijds-/soortkenmerken én volledige bron-, rechten- en fotobevestiging mag een juvenielenfoto worden geplaatst. Onvoldoende herkenningskenmerken of bronbewijs blijven open. Geen normwijziging voor echte vlucht, aantoonbare leeftijd of bronrechten (§3.2). |
| 1.2 | 14-11-2026 | Eigenaarprecisering: alle eerdere fotoregels en zes bron-/rolcontroles blijven volledig van kracht. De versoepeling 'onzichtbare poten = geen zelfstandige STOP' is slechts een **aanvullende juvenielenregel**, geen algemene vrijstelling voor andere soorten/rollen en geen verkorting van bron- of rechtencontrole. Historie 1.0/1.1 behouden. |
| 1.3 | 14-11-2026 | Eigenaar legt prioriteit op rustfoto’s en vergelijkingen voor kleine vogels: vlucht alleen wanneer herkenbaar; slechte of ontbrekende vlucht als uitgesteld fotoonderzoek registreren. Bronnen-, rechten-, determinatie- en bestaande vluchtdefinities ongewijzigd. Openpuntenregister aangemaakt voor latere volledigheid. |
| 1.4 | 14-11-2026 | Eigenaar verduidelijkt bronvoorrang: soortinformatie van Vogelbescherming Nederland en daadwerkelijk ingeziene ANWB-vogelgids als eerste referentie om **zelf gevonden** foto's, kleden en verklarende tekst te controleren. Niet verplicht bronfoto's te gebruiken. ANWB-productpagina is geen soortbewijs; bestand-, rechten- en zespuntscontrole blijven apart. |
| 1.5 | 14-11-2026 | Eigenaar bepaalt dat niet-verplichte bronvermeldingen verdwijnen uit de gebruikersweergave, zonder achterliggende broncontroles te verwijderen. Verplichte foto-, audio- en data-attributies blijven intact en toegankelijk. |
| 1.6 | 15-11-2026 | Eigenaar laat onvolledige fotoparen en lege "Nog geen passende foto"-vakken **bij alle soorten** uit "Lijkt op" verdwijnen. Alleen complete twee-fotopanelen tonen; brondata, openpunten, eerdere vlucht-/leeftijdsafkeuringen en werkende fotovergelijkingen behouden. |
| 1.7 | 16-11-2026 | Eigenaar stelt voor alle lookalike-soorten bewijsbare foto- **én** tekstverschillen verplicht; sekse-/leeftijdsspecifiek, in beide richtingen, onvolledige fotoparen verborgen maar herkenningstekst zichtbaar. Register + geautomatiseerde QA en bron-/rechten- en fysieke bewijsgrens toegevoegd (§3.4). |
| 1.8 concept | 16/17-11-2026 | Niet-gemergd voorstel in PR #282: fotoprioriteit per vogelgroep; bron-/rechtenregels van v1.7 behouden. In v1.10 op nieuw eigenaarbesluit verduidelijkt met verplichte lacunemelding en keuze eigenaar. |
| 1.9 concept | 20-11-2026 | Niet-gemergd voorstel in PR #315: De Visdief-bronroute en bewijs per media-item; als inhoudelijk relevant concept geïntegreerd, niet stilzwijgend als eerdere FINAL geclaimd. |
| 1.10 DRAFT | 22-11-2026 | Eigenaarbesluit: leidende daadwerkelijk gelezen ANWB/Vogelbescherming, foto als snelle check, precieze tekst bij beeldgebrek, eigenaar beslist per materiële lacune, F3 eerst alle 140 inhoudelijk en daarna tweede onafhankelijke/eigenaar-fotoreview. Geen gate-/mediarechtenversoepeling. |

**EINDMARKERING — BIRDSPOT KWALITEITSNORM v1.10 DRAFT · BRONVERIFICATIE · EIGENAARBESLUIT · GEEN LIVE**
