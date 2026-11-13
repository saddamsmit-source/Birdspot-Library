# Birdspot — inhouds- en fotokwaliteitsnorm

| | |
|---|---|
| Versie | 1.1 · 13-11-2026 |
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

De kaart toont onder **Kennisprofiel → Bronnen en controle** de bronwaarden, de uitgesloten waarden en de methode.

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

## 3. Fotokwaliteit en indeling

### 3.1 Vaste posities per soortkaart

Hoofdfoto → Mannetje → Vrouwtje → Juveniel → In vlucht → Vergelijkingen ("Lijkt op").

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
- **Een zichtbaar diagnostisch kenmerk is belangrijker dan een compleet lichaam.** Een foto hoeft niet alle lichaamsdelen (zoals beide poten, tenen, staart of een volledige vleugel) te tonen. **Specifiek bij een juveniel mogen de poten ontbreken** wanneer de opname verder goed scherp en bruikbaar is, de zichtbare jeugdkenmerken (bijvoorbeeld de kenmerkende gevlekte kop, borst of vleugelveren) de juiste soort én leeftijd overtuigend onderbouwen, en de foto zelf is geverifieerd volgens §3.2. **Ontbrekende poten zijn op zichzelf nooit een afkeur- of stopreden.** Beoordeel per soort en per beoogde foto-rol welke kenmerken werkelijk diagnostisch zijn; een volledig vogelportret is geen afzonderlijke harde eis. Controleer bij toevoeging de oorspronkelijke individuele foto, bronidentiteit, fotograaf, licentie en herpublicatierechten; neem geen alleen op een bestandsnaam of metadata berustende leeftijdsclaim klakkeloos over. Als de ontbrekende lichaamsdelen juist beslissend zijn voor de soort/jeugdherkenning, de zichtbare kenmerken onvoldoende zijn, of het originele bron-/rechtenbewijs ontbreekt, blijft die rol **PARTIALLY TESTED / open** (bij nieuwe import: niet publiceren) totdat geschikt bewijs beschikbaar is. Verzin nooit een leeftijd of geslacht om een positie te vullen.
- **Echte vlucht voor "In vlucht".** Opvliegen, landen en vleugels strekken zijn aparte houdingen en horen niet in de vluchtsectie. Dit staat in `docs/fotokwaliteit/vluchtcontrole.json` en wordt getest met VC-01..08.
- **Geen verzonnen geslachtslabels.** Zijn mannetje en vrouwtje niet betrouwbaar te onderscheiden? Dan krijgt de foto een neutraal label, bijvoorbeeld "Volwassen".
- **Een ontbrekende positie blijft open.** Vul haar niet kunstmatig. De kaart toont dan "Nog geen foto" of verwijst naar de hoofdfoto.
- **Extra foto's mogen**, ook meerdere per categorie, als ze echt iets toevoegen en niet dubbel worden getoond.
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
