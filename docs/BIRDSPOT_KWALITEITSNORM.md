# Birdspot — inhouds- en fotokwaliteitsnorm

| | |
|---|---|
| Versie | 1.6 · 15-11-2026 |
| Status | Vastgesteld eigenaarbesluit (Kevin Smit, Project Owner). Onafhankelijke documentreview: open |
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

---

### 2.2 Bronvermeldingen in de gebruikersinterface (eigenaarbesluit 14-11-2026)

**Toon geen bronvermeldingen waar dat niet verplicht is.** Dit geldt voor de soortbeschrijving, maat- en gedragsuitleg, herkenningskenmerken, vergelijkingspanelen, kennisprofiel, zangbeschrijvingen en de daaruit afgeleide status/leefwijze. Verwijder ook publieksmeldingen zoals 'Broncontrole volgt' en vrijblijvende bronlinks bij vogelvergelijkingen.

- **Verificatie blijft verplicht intern:** elke feitelijke claim houdt het geregistreerde bronbewijs, directe URL, bronuitgever, controledatum, onderlinge onafhankelijkheid, rekenmethode, onzekerheden en revisiehistorie in de canonieke dataset en QA-dossiers. Bronverwijzingen verdwijnen alleen uit de normale gebruikersweergave; geen bewijseis versoepelen, geen niet-geverifieerde claim als zeker tonen.
- **Verplichte attributies behouden:** bij foto's en geluidsopnamen de vereiste naam van de maker, licentie, bronlink en eventuele bewerkingsmelding volgens de specifieke licentie; bij kaarten of externe datasets de benodigde toeschrijving. Houd deze informatie bereikbaar en leesbaar op mobiel en toetsenbord. Dit mag via een bestaand foto-informatiepaneel als de desbetreffende licentie dat toelaat. Is de verplichte vermelding niet mogelijk, publiceer het materiaal niet.
- **Geen stilzwijgende kopie:** Vogelbescherming Nederland en ANWB blijven voorkeursbronnen voor inhoudelijke verificatie volgens §2.1; hun illustraties en teksten worden niet automatisch vrij herbruikbaar.
- **Herstel en QA:** tests verifiëren dat optionele bronlabels en -links verdwijnen uit soort- en kennispanelen **en** dat attributies voor daadwerkelijk gebruikte media en kaartdata intact blijven. De uitgebreide bronlijst blijft uitsluitend in de controlebestanden.

Deze afspraak gaat over Birdspot en laat eventuele wettelijke informatieverplichtingen elders in de app onverlet.

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

### 3.3 Beoordelingsregels

- **Klein in beeld mag.** Is de vogel goed zichtbaar, herkenbaar en verifieerbaar? Dan is de foto bruikbaar. Een foto wordt niet afgekeurd of voorwaardelijk gemaakt alleen omdat de vogel het beeld niet vult. Voorwaardelijk is alleen terecht als het herkenningsdoel van die positie niet te zien is.
  Toegepast op 10-11-2026: de hoofdfoto's van Turkse Tortel (sp004) en Zilvermeeuw (sp094) en de vluchtfoto van het Wespendief-vrouwtje (sp248) gingen van voorwaardelijk naar goedgekeurd. Foto's die voorwaardelijk zijn om onscherpte of een onzichtbaar kritisch kenmerk blijven voorwaardelijk.
- **Aanvullende regel uitsluitend voor juvenielen — geen vervanging van bestaande eisen.** Een goede juvenielenfoto mag worden gebruikt wanneer poten/tenen of andere **niet-diagnostische** lichaamsdelen ontbreken. De foto moet voor het doel voldoende scherp en duidelijk zijn; de zichtbare kenmerken (bijv. juveniele kop-, borst- en veertekening) moeten zowel de soort als de benoemde jeugdige leeftijd overtuigend onderbouwen. **Onzichtbare poten op zichzelf zijn geen STOP of afkeurreden.** Bij een nieuwe toevoeging of definitieve foto-PASS blijven de zes controles van §3.2 **allemaal verplicht**, inclusief individuele originele foto, leeftijds-/soortidentiteit, herkomst, fotograaf, licentie en herpublicatierechten; geen leeftijd aannemen op basis van alleen een bestandsnaam of metadata. Is het ontbrekende onderdeel wél beslissend of ontbreken bewijzen, dan blijft de rol open/PARTIALLY TESTED; geen nieuwe ongetoetste foto publiceren. **Deze regel voegt uitsluitend voor juvenielen een proportionele beoordelingsuitzondering toe. Alle bestaande regels uit §§1–4 blijven ongewijzigd**, waaronder fotokwaliteit, echte vrije vlucht, geen verzonnen geslachtslabels, geen dubbele foto's, bronverificatie en het openlaten van ontbrekende posities.
- **Echte vlucht voor "In vlucht".** Opvliegen, landen en vleugels strekken zijn aparte houdingen en horen niet in de vluchtsectie. Dit staat in `docs/fotokwaliteit/vluchtcontrole.json` en wordt getest met VC-01..08.
- **Kleine vogels: herkenbare rustfoto's vóór een moeilijke vluchtfoto (eigenaarbesluit 14-11-2026).** Bij kleine soorten hebben een scherpe foto op een tak, stengel of andere ondergrond, correct mannetje/vrouwtje/juveniel-kleed en de visuele vergelijkingen voorrang. Een vluchtfoto is **niet verplicht** als die zo klein, onscherp of onduidelijk is dat de determinatie er niet beter van wordt. Vul de vluchtpositie dan niet kunstmatig en plaats geen twijfelachtige foto. Een al aantoonbaar bruikbare, echte vrije-vluchtfoto mag blijven. Een ontbrekend of zwak vluchtbeeld is een **later fotografie-onderzoekspunt**, geen automatische STOP voor een overigens correcte soortkaart. De zes controles van §3.2 blijven voor **elke wél geplaatste foto** verplicht. Registreer open beeld- en bronpunten in [F2-openpuntenregister](fotokwaliteit/F2_OPEN_PUNTEN_REGISTER_2026-11-14.md).
- **Geen verzonnen geslachtslabels.** Zijn mannetje en vrouwtje niet betrouwbaar te onderscheiden? Dan krijgt de foto een neutraal label, bijvoorbeeld "Volwassen".
- **Een ontbrekende positie blijft open.** Vul haar niet kunstmatig. De kaart toont dan "Nog geen foto" of verwijst naar de hoofdfoto.
- **Extra foto's mogen**, ook meerdere per categorie, als ze echt iets toevoegen. Toon de hoofdfoto eerst, daarna mannetje, vrouwtje, juveniel en In vlucht voor zover bevestigd beeld beschikbaar is. Gebruik dezelfde opname maar één keer in de hoofdsecties.
- **Fotovergelijking onder Lijkt op (eigenaarbesluit 14-11-2026).** Toon beide soorten naast elkaar, ook op mobiel. Gebruik beeld van hetzelfde type (vlucht naast vlucht, rust naast rust), liefst vanuit een vergelijkbare hoek. Bestaande gidsfoto's mogen hier terugkomen, ook als dezelfde foto op een ander vergelijkingspaneel staat. Een extra juvenielpaar verschijnt wanneer beide passende foto's beschikbaar zijn. De betreffende leeftijd en het geslacht worden alleen getoond als ze onderbouwd zijn. Wanneer bij een bestaand paneel een passend beeld ontbreekt, blijft de tekst beschikbaar en krijgt het lege vak een melding. Houd individuele fotoherkomst toegankelijk via het informatietegeltje.
- **Gerichte vervanging of aanvulling** bij soorten die al foto's hebben is toegestaan na volledige verificatie (§3.2). Brede fotobatches voor soorten zonder foto's starten pas na een apart eigenaarbesluit.
- **Verbeterwensen registreren.** De eigenaar beoordeelt later elke vogelkaart zelf. Een verbeterwens, zoals een betere foto of een ontbrekende positie, gaat als `wishes` in de soortaudit en verschijnt in de tracker. Kleine, verdedigbare kwaliteitsverschillen houden de ontwikkeling niet tegen.

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
