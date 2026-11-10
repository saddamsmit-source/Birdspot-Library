# Birdspot Library — Handover Fotobaseline v1.0 FINAL

**Status: FINAL overdrachtsdocument voor gespreksoverdracht.** Opgesteld 10-11-2026, na een volledige gespreksscan en onafhankelijke GitHub-herverificatie, op expliciet eigenaarverzoek ("afsluitende gespreksscan, documentcontrole en overdracht"). Dit document is zelfstandig leesbaar: een nieuw Claude-gesprek heeft voor de eerste vervolgstap geen toegang tot deze chatgeschiedenis nodig, alleen dit document + de actuele GitHub-repository.

**Toeganggrens, expliciet vermeld:** deze scan is gebaseerd op (a) deze sessie zelf, inclusief alle eerdere rondes die in dit gesprek zijn uitgevoerd, (b) de projectbronnen zoals hieronder gelezen, en (c) een onafhankelijke, verse GitHub-herverificatie uitgevoerd in deze ronde. Oudere of externe gesprekken (bijvoorbeeld in ChatGPT, of eerdere Claude-sessies waarvan alleen commit-sporen resteren) zijn **niet** integraal toegankelijk vanuit deze sessie; waar dit document op zulke sporen steunt (bijvoorbeeld commit-auteurs), is dat expliciet als zodanig gemarkeerd. Er is geen ontbrekende geschiedenis ingevuld vanuit aannames.

Deze bestandsversie is identiek aan de versie opgeslagen in het Claude-project "App Creator" als `claude/Birdspot_Handover_Fotobaseline_v1.0_FINAL.md`. Bij afwijking tussen beide kopieën geldt de meest recent bijgewerkte versie als leidend.

---

## 1. Projectdoel en huidige appstatus

Birdspot Library is een persoonlijke, offline-gerichte PWA voor vogelsoorten en eigen waarnemingen (zoeken, loggen met foto/video/audio/GPS, kaart, media-studio, journal, inzichten, filmstudio, profiel/backup). Repository: **https://github.com/saddamsmit-source/Birdspot-Library**.

**Huidige stand (10-11-2026, onafhankelijk geverifieerd in deze ronde — zie §4):**
- `main` HEAD: `5bf67043e830e977749f0ee593cf9f41f0e2822b` (release 1.14.0, "zoeken op plek en koppelingen #33"). Ongewijzigd ten opzichte van alle eerdere documentatie.
- Gedeelde reviewbranch `preview/birdspot-review` HEAD: `659cbb8bc3c4c54a7d6ae7a5fe499319de309d88` (= PR #118 head). Dit is ook de huidige live GitHub Pages-preview-SHA.
- **Kritiek voor het vervolggesprek:** `preview/birdspot-review` bevat op deze HEAD nog **niet** de nieuwe ontwerpbaseline (zie §6). De volledige A-Z- en fotovolgorde-keten (#120→#121→#122) staat uitsluitend op eigen, nog ongemergede featurebranches. De live Pages-preview toont dus nog de **oude** indeling.
- 89 open pull requests in totaal (grotendeels gestapelde flight-photo-batch- en gidsfoto-auditwerk, PR #73–#116, merendeel `draft=true`). Het actieve front is #117–#122.

**Eigenaarbesluit dat deze ronde aanstuurt:** de in PR #120/#121/#122 gerealiseerde indeling (soortgroepen A-Z, vogels binnen de groep A-Z, en de vaste fotovolgorde) is per 10-11-2026 **de ontwerpbaseline voor alle vogelsoorten**, niet alleen de bewijssoorten. Voordat nieuwe ontbrekende foto's worden gezocht, moeten eerst de bestaande foto's van alle reeds-gefotografeerde soorten tegen deze baseline gecontroleerd worden. Dat is de eerste uitvoeringsfase van het vervolggesprek (zie §7–§9).

---

## 2. Toepasselijke documenten en exacte versies

Gelezen/gecontroleerd in deze ronde, in de voorgeschreven leesvolgorde (Index → Projectinstructies/Handbook/Catalogus/README-checklist → Birdspot-specifiek):

| Document | Versie | Status na deze ronde |
|---|---|---|
| `claude/APP-System-Index_v3.7_FINAL.md` (Claude-project) | v3.7 FINAL | **Gereviseerd** (10-11-2026): rij "002 Birdspot Library" gecorrigeerd naar actuele GitHub-stand; verwijzing naar dit handoverdocument toegevoegd. Geen andere inhoud gewijzigd. |
| `App_Capability_Catalogus_v1.3_FINAL.md` (Claude-project) | v1.3 FINAL | **Aangevuld** (10-11-2026): nieuwe "Bewijsaanvulling 10-11-2026"-sectie voor CAP-BIRD-010/012/015 (PR #122-delta). Alle bestaande rijen/ID's/bewijslabels ongewijzigd. |
| `claude/App-System_Addendum_2026-11-10_FINAL.md` (Claude-project) | — (dagaddendum) | **Aangevuld**: nieuw §7 met deze ronde se GitHub-herverificatie, de verse fotodekkingscijfers, de test-flakiness-cross-corroboratie en de documentstatus. |
| `claude/Birdspot_Bronnenregister_Nederland_en_West-Europa_v1.2_DRAFT_REVIEW.md` (Claude-project) | v1.2 DRAFT/REVIEW | **Ongewijzigd, gecontroleerd correct.** Zie §10. |
| `Birdspot_Roadmap_V1.3_FINAL_interactief.pdf` (Claude-project) | v1.3 FINAL | **Niet redigeerbaar** (bestandsupload). Qua GitHub-status achterhaald door dit document; zelf al zo gelabeld ("Status UNKNOWN tot hercontrole"). |
| Projectinstructies v2.9 FINAL, Handbook v2.13 FINAL, Samenwerkingsprotocol v1.2/v1.3 FINAL, Projectveld v2.9 FINAL, README-checklist v0.3 FINAL | — | **Niet regel-voor-regel herlezen in deze ronde** — alleen op versie/kruisverwijzing gecontroleerd. Geen Birdspot-specifieke bevinding die een inhoudelijke revisie vereist. Expliciete, transparant vermelde scopekeuze, niet bevestigd met de eigenaar. |

---

## 3. Belangrijke eigenaarbesluiten (verzameld, status: besluit — niet voorstel)

1. **Ontwerpbaseline (10-11-2026):** A-Z-sortering (groepen én vogels binnen groep) en de vaste fotovolgorde (§6) gelden voor **alle** vogelsoorten.
2. **Volgorde van werk:** eerst bestaande foto's van alle gefotografeerde soorten controleren/corrigeren tegen de baseline; **daarna pas** nieuwe ontbrekende foto's zoeken. Geen grote nieuwe fotobatches vóór die controle en baseline-vaststelling klaar zijn.
3. **Orpaned-slideshow (CAP-BIRD-006):** Optie A — code en verouderde tests opruimen, niet herbouwen (uitgevoerd, PR #119).
4. **Bronnenregister:** status blijft DRAFT/REVIEW; niet automatisch FINAL verklaren; onafhankelijke ChatGPT Final QA is een vereiste stap, nog niet uitgevoerd.
5. **Model-/agentkeuze:** Claude blijft primaire ontwikkelaar voor zwaar appbouwwerk; ChatGPT verzorgt onafhankelijke QA/UX-finetuning/kleine fixes en neemt alleen geautoriseerd over bij creditlimiet/blokkade/overdracht, na controle van remote HEAD, PR-base, actieve schrijver en open CI. Eén schrijver per branch.
6. **Standing constraints (ongewijzigd, blijven onverkort gelden):**
   - Geen Vercel tijdens de ontwikkeling.
   - Geen betaalde diensten zonder akkoord.
   - **Geen merge naar `main` zonder expliciete toestemming.**
   - **Geen merge naar `preview/birdspot-review` zonder expliciete toestemming.**
   - **Geen officiële livegang zonder expliciete toestemming.**
   - Geen nieuwe fotobatches vóór de bestaande foto's per soort zijn gecontroleerd en de baseline is vastgesteld.
   - Geen verlies van eerdere werkzaamheden.

---

## 4. GitHub: branches, PR's, HEAD-SHA's, CI (onafhankelijk herverifieerd 10-11-2026)

**Verificatiemethode:** `gh api repos/saddamsmit-source/Birdspot-Library/pulls?state=open&per_page=100`, `gh api .../pulls/{nr}`, `gh api .../commits/{sha}/check-runs`, en directe inhoudscontrole (`git show <sha>:<pad>`) — niet alleen PR-metadata. `gh pr list`/`gh pr create`/`gh api .../pages` zijn via de sessieproxy van de vorige Claude-sessie niet toegestaan; de werkende alternatieven hierboven zijn gebruikt.

| PR | Branch | Base | Head-SHA | CI | Merge-status |
|---|---|---|---|---|---|
| #118 | `fix/retire-orphaned-slideshow` (geïntegreerd) | `main` | `659cbb8bc3c4c54a7d6ae7a5fe499319de309d88` | 16/16 groen | open, niet gemerged — = huidige `preview/birdspot-review` HEAD |
| #119 | `fix/retire-orphaned-slideshow` | `main` | `698189cb22bedbd7661e0d0f9cee785e3b6a38b3` | 8/8 groen | open, niet gemerged (wel al opgenomen in #118) |
| #120 | `feat/soortgroepen-az-sortering` | `main` | `2956552be3ee2d51128ad61bdcef551252bdf473` | 8/8 groen | **open, niet gemerged** |
| #121 | `integratie/soortgroepen-az-review` | `preview/birdspot-review` | `e670221a997f879b5859bbe7a1d2dfb380276a30` | 10/10 groen | **open, niet gemerged** |
| #122 | `feat/fotovolgorde-en-naam-az` | `preview/birdspot-review` | `de4ef309490f0156b6e51dea1a478acac28eb344` (+ `a92f2e2b`) | 10/10 groen (beide commits) | **open, niet gemerged** |

Ketenvolgorde (bevestigd via `git merge-base --is-ancestor`): #120 → #121 → #122, alle drie gestapeld boven elkaar, met #121/#122 base = `preview/birdspot-review`.

**Kritieke bevinding (inhoudscontrole, niet alleen PR-metadata):** `git show 659cbb8:src/features/species/view.js` vs. `git show de4ef30:src/features/species/view.js` toont dat de groeperingsblok ("Groepeer op familie") op `659cbb8` (huidige `preview/birdspot-review`-HEAD) nog **geen** sortering heeft; op `de4ef30` wel. **Dus: `preview/birdspot-review` bevat op zijn huidige HEAD nog geen enkel niveau van de A-Z-fix en geen van het fotovolgorde-werk.** De PR-titel van #121 beschrijft de bestemming van de PR, niet dat die inhoud al in de branch zit — dat gebeurt pas bij merge.

**GitHub Pages:** laatste bevestigde deployment `7677720621` op SHA `659cbb8`, omgeving `github-pages`, status `success`, url `https://saddamsmit-source.github.io/Birdspot-Library/`. Geen nieuwere deployment.

**Git-identiteit — waarschuwing tegen misinterpretatie:** commits met auteursnaam "Kevin Smit"/"saddamsmit@gmail.com" (o.a. alle hierboven genoemde SHA's) zijn een sessie-configuratie-artefact (`git config user.name`/`user.email` van de uitvoerende sessie) — **geen bewijs dat Kevin ze persoonlijk heeft gemaakt.** Oudere commits in dezelfde geschiedenis tonen in plaats daarvan `Claude <noreply@anthropic.com>` of `github-actions[bot]` als auteur.

**Test-flakiness (niet-blokkerend maar relevant voor QA-interpretatie):** `tests/test_phase_d.py` faalde in twee onafhankelijke, zelfde-dag metingen op een schone basisbranch verschillend: 18/27 versus 22/27. Dit wijst op omgevingsgebonden flakiness (timing/stabiliteit rond `#addSightingSheet` e.d.), niet op een deterministische regressie van één specifieke coderonde. Geen van beide metingen heeft de acceptatiecriteria aangepast om "groen" te forceren.

---

## 5. Verse fotodekking (NIET hergebruiken als vast getal — zie §7)

Vers berekend op branch `feat/fotovolgorde-en-naam-az` (`de4ef30`) — de meest complete branch op dit moment, dus dit cijfer geldt voor déze branch, niet voor `main` of de ongemergede `preview/birdspot-review`:

- `SPECIES.length` (`src/data/species.js`) = **597**.
- Combinatie van vier gidsmediaregistries (`GUIDE_PHOTOS` 127 keys, `GUIDE_HEROES` 30 keys, `GUIDE_PLUMAGE` 68 keys, `GUIDE_POSES` 118 keys; bronnen `src/features/species/guidePhotos.js` en `guideMedia.js`) → **134 soorten met ≥1 foto uit willekeurige bron, 463 zonder.**

Reproduceercommando (op de juiste checkout):
```bash
node --input-type=module -e "
const {SPECIES} = await import('./src/data/species.js');
const {GUIDE_PHOTOS} = await import('./src/features/species/guidePhotos.js');
const {GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES} = await import('./src/features/species/guideMedia.js');
function hasAny(id){
  if (GUIDE_PHOTOS[id]) return true;
  if (GUIDE_HEROES && GUIDE_HEROES[id]) return true;
  if (GUIDE_PLUMAGE && GUIDE_PLUMAGE[id] && GUIDE_PLUMAGE[id].length) return true;
  if (GUIDE_POSES && GUIDE_POSES[id] && GUIDE_POSES[id].length) return true;
  return false;
}
const withPhoto = SPECIES.filter(s => hasAny(s.id));
console.log('Totaal:', SPECIES.length, '| Met foto:', withPhoto.length, '| Zonder:', SPECIES.length - withPhoto.length);
"
```
**Belangrijk voor het vervolggesprek:** dit cijfer moet bij aanvang **opnieuw** vers berekend worden op de dan-actuele branch/merge-status. Gebruik nooit "134" of "597" als aangenomen bewijs zonder herberekening op de dan-actuele checkout.

---

## 6. De definitieve ontwerpbaseline (eigenaarbesluit, geldt voor alle soorten)

### 6.A Soorten en vogels — alfabetische indeling
- Soortgroepen/families: alfabetisch A-Z.
- Binnen iedere soortgroep: alle individuele vogels alfabetisch A-Z op Nederlandse naam.
- Dezelfde logica geldt in alle relevante filters/soortkiezers (soortenlijst, soortkiezer bij waarneming loggen).
- Geen verlies van soorten, ID's of zoekfunctionaliteit.
- Sorteerimplementatie: JS `localeCompare('nl')` (case-insensitive per definitie). Een Python-test die dit nabootst gebruikt `sorted(labels, key=str.casefold)` — **niet** `locale.setlocale(...)`, die niet gegarandeerd op elke CI-runner is geïnstalleerd.
- Bekende correcte referentie-implementatie: `src/features/profile/stats.js` (`groupSpeciesByFamily`) — niet aangeraakt, was al goed.
- Bekende, nu gefixte implementaties: `src/features/species/view.js` en `src/features/sightings/speciesPicker.js`.

### 6.B Fotovolgorde binnen iedere vogelkaart — exacte volgorde
1. Hoofdfoto (groot, scherp, duidelijk herkenbaar; bij voorkeur een bevestigd adult mannetje indien een geschikte foto bestaat)
2. Mannetje
3. Vrouwtje
4. Juveniel
5. In vlucht (bij voorkeur bevestigd mannetje; als een bevestigd vrouwtje in vlucht ook beschikbaar is, beide tonen met correcte labels)
6. Vergelijkingen tussen soorten (altijd onderaan, na de volledige fotoreeks)

Regels:
- **Geen juveniel-tegen-juvenielvergelijkingen.**
- Bestaande nuttige data blijft bewaard, ook als een vergelijking in de UI niet meer getoond wordt.
- Geen dubbele afbeeldingen van dezelfde opname op één kaart — als de hoofdfoto ook het mannetje representeert, een referentie naar de hoofdfoto gebruiken in plaats van de opname opnieuw te tonen.
- Waar geslacht niet betrouwbaar is vast te stellen, geen kunstmatige mannetje/vrouwtje-splitsing forceren.

**Implementatie (PR #122, branch `feat/fotovolgorde-en-naam-az`):** uitsluitend post-processing in `recognitionPanel()` (`src/features/species/detailSections.js`); `guidePlumageGroups()` en `GUIDE_COMPARISONS` zelf niet gewijzigd. Representatief getoetst op sp173, sp249, sp253, sp059, sp008. Nog niet uitgevoerd op de volledige dataset van 134 soorten met foto — alleen representatief, niet soort-voor-soort.

---

## 7. Fase 3-C: contract voor de per-vogel-baselinecontrole (eerste uitvoeringsfase vervolggesprek)

**Dit is NIET door deze ronde uitgevoerd — dit is de opdrachtomschrijving voor het vervolggesprek.** Begin met een verse inventarisatie vanuit GitHub; gebruik geen verouderde vaste telling (niet "134" of "597" zonder herberekening, zie §5) als bewijs van actuele fotodekking.

### Per vogel te registreren velden
1. Birdspot-soort-ID
2. Nederlandse naam + wetenschappelijke naam
3. Soortgroep/familie
4. Huidige hoofdfoto + geschiktheidsbeoordeling
5. Aanwezige mannetje-/vrouwtje-/juveniel-foto's
6. Aanwezige vluchtfoto's, met bevestigd geslacht waar bekend
7. Aanwezige vergelijkingen
8. Correcte volgorde van de fotodelen (conform §6.B)
9. Dubbele of visueel-dubbele bestanden
10. Onjuiste/onzekere geslacht-/leeftijdslabels
11. Maker/bron-URL/licentie/credits
12. Bestandskwaliteit en daadwerkelijke laadbaarheid
13. Offline-beschikbaarheid waar van toepassing
14. Ontbrekende foto's + mogelijke kwaliteitsvervangingen
15. Teststatus + benodigde vervolgactie

### Werkregels
- Gebruik bestaande bronregistraties/metadata; controleer de daadwerkelijke foto's zelf wanneer een conclusie over beeldinhoud nodig is — alleen de aanwezigheid van een bestand of label is onvoldoende bewijs.
- Waar mannetje/vrouwtje niet betrouwbaar te onderscheiden is, geen kunstmatige splitsing creëren — het veld blijft open bij onvoldoende bewijs.
- Statusvocabulaire voor implementatie/testbewijs: **VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED.**

### Opdrachtvolgorde (eigenaarbesluit, bindend)
1. **Eerst**: bestaande foto's van alle reeds-gefotografeerde soorten controleren en de bestaande indeling waar nodig corrigeren tegen de baseline in §6.
2. **Daarna pas**: nieuwe ontbrekende foto's zoeken en toevoegen.

---

## 8. Blijvende, hervatbare functie- en fotobaseline (Fase 3-D — te bouwen in het vervolggesprek)

Het vervolggesprek moet een **versionabel bestand in GitHub** aanmaken (nieuwe branch, apart van de #120–#122-keten, bijvoorbeeld `docs/fotobaseline-tracker`) met een afzonderlijke per-soort-registratie, met minimaal:

- Totaal aantal soorten
- Soorten met ≥1 gidsfoto
- Soorten zonder
- Aantal volledig gecontroleerde soortkaarten
- Soortkaarten met openstaande issues
- Ontbrekende afbeeldingen per fotocategorie
- Bron-/licentieproblemen
- Gedetecteerde duplicaten
- Benodigde kwaliteitsvervangingen
- Status per soort: **VERIFIED / PARTIALLY TESTED / NOT TESTED / BLOCKED**
- Laatst-gecontroleerde commit-SHA

Deze baseline wordt het startpunt voor toekomstige fotobatches. Werk in kleine, reproduceerbare batches met een duidelijk eindcriterium per batch, en bewaar het resultaat van elke batch duurzaam (commit per batch) zodat werk niet verloren gaat bij contextcompressie of een vastgelopen gesprek.

**Voorgesteld batchplan (richtinggevend, niet bindend):**
- Batch-grootte: ca. 15–20 soorten per batch (134 soorten met foto ÷ ~8 batches).
- Elke batch: één los commit/PR-moment met de bijgewerkte tracker-rijen voor die batch + eventuele directe her-ordeningsfixes (geen nieuwe foto's).
- Eindcriterium per batch: alle 15–20 soorten hebben een ingevulde rij met status VERIFIED/PARTIALLY TESTED/NOT TESTED/BLOCKED en reden.
- Eindcriterium hele Fase 3-C: alle 134 (of het dan-actuele aantal, zie §5) soorten met foto hebben een regel in de tracker.

---

## 9. Open technische punten en QA (Fase 4)

| Punt | Status | Toelichting |
|---|---|---|
| `tests/test_phase_d.py` | Pre-existing, niet door dit werk veroorzaakt | 18/27 resp. 22/27 failures op schone basisbranch, zelfde dag — wijst op flakiness, niet regressie. Niet gefixt; buiten scope van deze ronde. |
| Hoofdfoto = enige vluchtfoto (edge case) | NOT TESTED | Geen voorbeeldsoort met dit scenario gevonden in de representatieve steekproef; nog niet op de volledige dataset getoetst. |
| Volledige foto-/vergelijkingsvolgorde | PARTIALLY TESTED | Representatief getoetst op 5 soorten (§6.B); nog niet soort-voor-soort over alle 134. |
| Geslacht-/leeftijdslabels | Gedeeltelijk gedekt | Juveniel-filterwerk uit eerdere rondes dekt een deel; nieuwe baselinecontrole (§7) moet dit per soort bevestigen. |
| Fysiek Android/iOS | NOT TESTED | Consistent met alle eerdere documentatie; niet in deze ronde veranderd. |
| A-Z-sortering (beide niveaus) | VERIFIED op testniveau | `tests/test_species_groups_az.py` (SG-01..SG-07) slaagt over 597 soorten; CI 8/8 (#120) en 10/10 (#121). Nog niet live op `preview/birdspot-review` (zie §4). |

---

## 10. Bronnenregister-status

`claude/Birdspot_Bronnenregister_Nederland_en_West-Europa_v1.2_DRAFT_REVIEW.md` (Claude-project) — **versie 1.2, status DRAFT/REVIEW, niet FINAL.** Het document is zelf correct gelabeld en bevat een eigen §14-zelf-QA die expliciet stelt dat onafhankelijke ChatGPT Final QA nog de vereiste vervolgstap is. **Geen revisie nodig; niet automatisch FINAL verklaard.**

---

## 11. Actieve schrijver en handoverstatus

- **Actieve schrijver bij afsluiting van dit gesprek: geen** — alle vijf PR's (#118–#122) staan open, ongemerged, wachtend op eigenaarakkoord.
- **Branches in gebruik, niet verwijderen:** `fix/retire-orphaned-slideshow` (#118/#119), `feat/soortgroepen-az-sortering` (#120), `integratie/soortgroepen-az-review` (#121), `feat/fotovolgorde-en-naam-az` (#122).
- **Dit document zelf staat op een nieuwe, losse branch** (`docs/handover-fotobaseline-2026-11-10`, base `main`) — raakt de #118–#122-keten niet aan.
- **Vóór iedere hervatting/actie:** remote HEAD van `main` én `preview/birdspot-review` opnieuw fetchen, open PR's opnieuw opvragen, en controleren of er sinds dit document een merge of nieuwe commit heeft plaatsgevonden.

---

## 12. Eerste concrete taak voor het nieuwe gesprek

Start de fotobaseline-controle van Fase 3-C (§7): kies de eerste batch van 15–20 reeds-gefotografeerde soorten (alfabetisch, eerste soortgroep A-Z), controleer elke soort tegen het 15-veldencontract in §7, en leg het resultaat vast in een nieuwe, versionabele trackerfile op een eigen branch (§8). **Geen nieuwe fotobatches zoeken of toevoegen voordat deze controle voor alle reeds-gefotografeerde soorten is afgerond.**

### Acceptatiecriteria
- Nieuwe branch/PR met de trackerfile (geen wijziging aan #118–#122).
- Eerste batch (15–20 soorten) heeft voor elke soort een ingevulde rij met alle 15 velden uit §7 of een expliciete UNKNOWN/open-markering met reden.
- Geen enkele bestaande foto, bron, label of ID is verwijderd — alleen gecontroleerd/geannoteerd/waar nodig her-ordend volgens §6.B.
- Elke correctie aan de fotovolgorde is per soort herleidbaar naar een concrete, zelf bekeken foto.
- Resultaat is gecommit vóór het einde van de sessie/batch.

### Stopcondities
- Twijfel over geslacht/leeftijd die niet uit de foto zelf is vast te stellen — veld open laten, niet gokken.
- Een gevonden bestaande fout buiten de scope van "her-ordenen van bestaande foto's" — melden, niet stilzwijgend corrigeren zonder registratie.
- Elk moment waarop een merge naar `main`/`preview/birdspot-review`, of een officiële livegang, relevant zou worden — altijd eerst expliciete toestemming vragen.

---

## 13. Reproduceerbare commando's en bestandspaden

```bash
git clone https://github.com/saddamsmit-source/Birdspot-Library.git
cd Birdspot-Library
git fetch origin --quiet
git log origin/main -1 --format="%H %ci"
git log origin/preview/birdspot-review -1 --format="%H %ci"

gh api "repos/saddamsmit-source/Birdspot-Library/pulls?state=open&per_page=100" --jq 'length'
gh api "repos/saddamsmit-source/Birdspot-Library/pulls/122" --jq '{number,state,merged,mergeable,mergeable_state,head:.head.sha,base:.base.ref}'

gh api repos/saddamsmit-source/Birdspot-Library/commits/<SHA>/check-runs --jq '[.check_runs[] | .conclusion] | group_by(.) | map("\(.[0] // "null"): \(length)") | join(", ")'

gh api repos/saddamsmit-source/Birdspot-Library/deployments --jq '.[0] | {id,sha,environment}'
gh api repos/saddamsmit-source/Birdspot-Library/deployments/<ID>/statuses --jq '.[0].state'

node --input-type=module -e "const {SPECIES} = await import('./src/data/species.js'); console.log(SPECIES.length);"

git merge-base --is-ancestor <SHA_A> <SHA_B> && echo "A is ancestor of B"
```

Relevante bestandspaden:
- `src/data/species.js` — soortendataset (597 entries).
- `src/features/species/view.js` — soortenlijst + A-Z-groepering (niveau 1 en 2).
- `src/features/sightings/speciesPicker.js` — soortkiezer bij loggen.
- `src/features/profile/stats.js` — `groupSpeciesByFamily` (referentie-implementatie, al correct).
- `src/features/species/detailSections.js` — `recognitionPanel()`, fotovolgorde-post-processing.
- `src/features/species/guidePhotos.js`, `src/features/species/guideMedia.js` — gidsmediaregistries.
- `tests/test_species_groups_az.py` — A-Z-regressietest (SG-01..SG-07).
- `tests/test_fotovolgorde_2026-11-10.mjs` / `.py` — fotovolgorde-regressietest.

---

## 14. Copy-ready startprompt voor het nieuwe Claude-gesprek

```
Je werkt aan Birdspot Library (https://github.com/saddamsmit-source/Birdspot-Library),
binnen het "App Creator"-project. Lees eerst het project-document
"claude/Birdspot_Handover_Fotobaseline_v1.0_FINAL.md" (ook beschikbaar in de repo
als docs/BIRDSPOT_HANDOVER_FOTOBASELINE_2026-11-10.md) volledig — dat is het
complete overdrachtscontract van het vorige gesprek, inclusief de definitieve
ontwerpbaseline (A-Z-sortering + fotovolgorde), de GitHub-status op 10-11-2026,
en het per-vogel-controlecontract.

Voer GEEN van de volgende acties uit zonder mijn expliciete toestemming:
merge naar main, merge naar preview/birdspot-review, officiële livegang,
Vercel gebruiken, betaalde diensten gebruiken.

Start met het volgende, in deze volgorde:
1. Controleer zelfstandig de actuele GitHub-status (fetch origin/main en
   origin/preview/birdspot-review, open PR's via `gh api`, niet `gh pr list`).
   Neem niets uit het handoverdocument als vaststaand aan zonder deze
   verse controle — de stand kan sinds 10-11-2026 zijn veranderd.
2. Herberekening van de fotodekking (zie §5) op de dan-actuele branch —
   gebruik nooit het cijfer "134 van 597" zonder herberekening.
3. Start de fotobaseline-controle (Fase 3-C/§7): controleer de bestaande
   gidsfoto's van alle reeds-gefotografeerde soorten tegen de baseline in
   §6, één soortgroep/batch tegelijk (alfabetisch, begin bij de eerste
   soortgroep), en leg elk resultaat vast in een nieuwe trackerfile op een
   eigen branch (niet de #120-#122-keten aanraken). Zoek NOG GEEN nieuwe
   ontbrekende foto's — dat is pas de tweede fase, na afronding van deze
   controle.
4. Rapporteer na de eerste batch kort: wat gecontroleerd is, wat
   gecorrigeerd is, en wat openstaat — in het Nederlands, kort en concreet.
```

---

## 15. Document-QA-verklaring

Alle in dit document gereviseerde bronnen zijn gecontroleerd op: behoud van bestaande inhoud (alleen additief gewijzigd), onderlinge versie-kruisverwijzingen (consistent), correcte weergave van de actuele GitHub-status (met directe broncode-inhoudscontrole, niet alleen PR-metadata), herkenbare vastlegging van alle eigenaarbesluiten (§3), en uitvoerbaarheid van de volgende ontwikkelfase zonder deze chatgeschiedenis (§12–§14).

**Onafhankelijkheidsgrens:** deze document-QA is door Claude zelf uitgevoerd als eigen documentcontrole — dit is geen onafhankelijke ChatGPT-QA en geen productieakkoord. Voor het Bronnenregister blijft die onafhankelijke QA expliciet nog open (§10).

**Niet-geverifieerde claim, expliciet zo gemeld:** of de Claude Project Instructions daadwerkelijk zijn "geactiveerd"/gesynchroniseerd, is niet onafhankelijk te controleren vanuit deze sessie en wordt hier niet als vaststaand gerapporteerd.
