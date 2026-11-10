"""Bouwt docs/github/PR_REGISTER_2026-11-10.md uit register.json (analyze.py) + linecov-uitkomsten.
Classificatie A-E volgens eigenaaropdracht 10-11-2026; handmatige onderbouwing staat in NOTES."""
import json, sys
reg_p, out_p = sys.argv[1:3]
d = json.load(open(reg_p))
R = {r['number']: r for r in d['rows']}
P, M = d['preview_sha'][:7], d['main_sha'][:7]

# Regelvoorkomen in preview (tools: linecov.py) voor PR's die geen ancestor zijn
LINECOV = {45: '29%', 47: '62%', 49: '14%', 50: '23%', 52: '35%', 91: '99%', 92: '99%', 93: '99%', 95: '99%', 96: '93%',
           98: '99%', 99: '99%', 101: '99%', 107: '99%', 108: '88%', 117: '0%'}
RELEASE = {90, 94, 97, 100, 109}
FLIGHT_REAPPLIED = {91, 92, 93, 95, 96, 98, 99, 101, 107, 108}
NOTES = {
    34: ('B', 'K6 seizoenswolken; ancestor van preview. Conflict (dirty) t.o.v. eigen base #116 is irrelevant zolang #118 de integratieroute is.', 'Laten staan tot #118-besluit; daarna sluiten als verwerkt.'),
    35: ('B', 'Wortel van de gidsstapel (base main); ancestor van preview.', 'Sluiten na merge #118 (verwerkt).'),
    45: ('D', 'Home-zoeken hersteld; vervangen door app-brede zoekbalk (#69, commit 104c5a8 in preview). 29% van de toegevoegde regels letterlijk aanwezig.', 'Onderzoeken of de Home-snelknoppen uit deze PR in preview werken; daarna sluiten als achterhaald.'),
    47: ('B', 'Back-up/herstel-beveiliging: src/storage/backup.js 206/206 regels aanwezig via herintegratie cc1730f. Uitbreiding van tests/test_profile_backup.py (129 regels) níet aanwezig.', 'Inhoud verwerkt; testuitbreiding beoordelen en zo nodig overzetten vóór sluiten.'),
    49: ('C', 'Pilot-kernkaarten (pilotFieldGuide.js) vervangen door de latere gidsdata; Meerkoet/Waterhoen-vergelijking en sp078-audio wel in preview.', 'Sluiten als achterhaald na bevestiging dat sp078/sp079-kaarten compleet zijn.'),
    50: ('D', 'Navigatie/GPS/offline/updates: in preview grotendeels opnieuw geïmplementeerd (cc1730f + navigation-recovery-qa). tests/test_app_recovery.py (163 regels) ontbreekt in preview.', 'Restdekking (vertraagde GPS-callback, wachtende update, twee tabs) toetsen tegen test_navigation_recovery.py; daarna sluiten.'),
    52: ('C', 'Gecombineerde preview van #45/#47/#49/#50; vervangen door preview/birdspot-review. Was op 10-11 07:21 kort de Pages-bron (deployment 34b9f95).', 'Sluiten samen met #45/#47/#49/#50.'),
    117: ('A', 'App-README per Kickoff Gate; staat niet in preview of main (repo heeft geen README.md). Inhoud van 09-11, vóór A-Z en fotovolgorde.', 'Actualiseren (A-Z, fotovolgorde, geen Vercel) en daarna in reviewbranch opnemen.'),
    118: ('E', 'Gezamenlijke reviewkandidaat: preview/birdspot-review → main, head = huidige Pages-bron 659cbb8. CI 16/16 groen. Let op: de titel noemt "A-Z soortenlijst", maar die code zit nog niet in preview (staat in #121/#122).', 'Open houden als releasekandidaat; merge alleen na "zet live".'),
    119: ('B', 'Weeskode diashow (Optie A); via merge 659cbb8 al in preview en daarmee in #118.', 'Sluiten na merge #118 (of nu als dubbel van #118 — eigenaarbesluit).'),
    120: ('A', 'Soortgroepen A-Z, base main. Dezelfde code staat via #121 op weg naar preview; dubbel spoor.', 'Na merge #121 in preview sluiten als verwerkt; niet apart naar main mergen.'),
    121: ('A', 'Soortgroepen A-Z → preview. Niet in preview (0 bestanden aanwezig, alle patches passen schoon).', 'Integreren in preview na eigenaarakkoord (beïnvloedt Pages).'),
    122: ('A', 'Alfabetisch binnen groep + vaste fotovolgorde → preview; gestapeld op #121.', 'Integreren na #121, samen met #124.'),
    123: ('C', 'Handover v1.0 als repo-document (andere sessie, 12:46 UTC). Wordt vervangen door handover v1.1 in #125.', 'Sluiten na akkoord op #125; v1.0-tekst blijft in de PR-geschiedenis en in het project.'),
    124: ('A', 'Fix FV-08: lege kleedkaart verwijst naar hoofdfoto (12 soorten); gestapeld op #122.', 'Mee-integreren met #122.'),
    125: ('A', 'Fotobaseline-tracker, auditscripts, PR-register en handover v1.1 (docs-only, base main).', 'Open houden als werkdocument; merge na eigenaarakkoord (geen Pages-impact zolang Pages op preview staat).'),
}

def topic(t):
    tl = t.lower()
    for k, v in [('vlucht', 'vluchtfoto\'s'), ('releasekandidaat', 'releasekandidaat'), ('preview', 'integratiepreview'), ('herstelbatch', 'fotoherstel'),
                 ('visueel', 'visuele fotocontrole'), ('kleed', 'kleedfoto\'s'), ('bronaudit', 'bronaudit'), ('zoek', 'zoeken'), ('home', 'Home-UI'),
                 ('k6', 'kaart/seizoenen'), ('k7', 'profiel'), ('veldschrift', 'UI-stijl'), ('soortengids', 'soortengids-UI'), ('soortgroep', 'sortering'),
                 ('fotovolgorde', 'fotovolgorde'), ('docs', 'documentatie'), ('fase', 'gidsuitbreiding'), ('verrijk', 'gidsuitbreiding'), ('fotoviewer', 'fotoviewer')]:
        if k in tl:
            return v
    return 'gids/UI'

def classify(r):
    n = r['number']
    if n in NOTES:
        return NOTES[n]
    anc = r['in_preview']['state'].startswith('aanwezig')
    if n in RELEASE:
        return ('C', 'Eerdere gecombineerde releasekandidaat (base main); ancestor van preview, vervangen door #118.', 'Sluiten als vervangen door #118.')
    if n in FLIGHT_REAPPLIED:
        return ('B', f'Geen ancestor, maar inhoud via herintegratie in preview aanwezig ({LINECOV[n]} van de toegevoegde regels letterlijk; alle beeldbestanden identiek). Verschil = later herschreven teksten/sw-versie (bronaudit #116, #122).',
                'Sluiten als verwerkt na merge #118; branch bewaren tot dan.')
    if anc:
        return ('B', 'Ancestor van preview/birdspot-review; komt in main via #118.', 'Sluiten na merge #118 (verwerkt).')
    return ('D', 'Niet automatisch te classificeren.', 'Handmatig onderzoeken.')

def ci(r):
    c = r['ci']
    if not r['ci_total']:
        return 'geen checks (docs/niet getriggerd)'
    return ', '.join(f'{k} {v}' for k, v in sorted(c.items(), key=lambda x: str(x[0])))

def pres(p, n):
    if p['state'].startswith('aanwezig'):
        return 'ja (ancestor)'
    if n in LINECOV and p is R[n]['in_preview']:
        return f"inhoud {LINECOV[n]}" if LINECOV[n] != '0%' else 'nee'
    return 'nee'

heads = {r['head_ref']: r['number'] for r in d['rows']}
L = []; w = L.append
cls = {n: classify(r) for n, r in R.items()}
count = {k: sum(1 for v in cls.values() if v[0] == k) for k in 'ABCDE'}
w('# Birdspot Library — PR-register en opruimvoorstel (10-11-2026)')
w('')
w(f'Gemeten 10-11-2026 ~14:15 CET op `preview/birdspot-review` = `{d["preview_sha"]}` en `main` = `{d["main_sha"]}`. '
  f'Open PR\'s: **{len(R)}** (89 bij de vorige telling + #123, #124, #125 van vandaag). Gesloten PR\'s in de laatste 100: 33, waarvan 17 gemerged.')
w('')
w('**Niets is gesloten, gemerged of verwijderd.** Dit is een voorstel; uitvoering pas na akkoord van de eigenaar.')
w('')
w('## Waarom zoveel open PR\'s')
w('')
w('1. **Gestapelde werkwijze.** Vrijwel elke foto- of UI-ronde kreeg een eigen PR met als base de branch van de vorige ronde (#35 → #36 → … → #116). Een gestapelde PR sluit niet vanzelf wanneer de inhoud verderop wordt samengevoegd.')
w('2. **Integratie via `preview/birdspot-review` in plaats van via `main`.** De stapel is samengevoegd in de gezamenlijke reviewbranch; `main` staat nog op release 1.14.0 (`5bf6704`, #33). Geen enkele open PR is in `main` aanwezig.')
w('3. **Meerdere releasekandidaten naast elkaar.** #90, #94, #97, #100 en #109 zijn eerdere combinatie-PR\'s naar main; #118 vervangt ze.')
w('4. **Een zijstapel is opnieuw toegepast** in plaats van gemerged (#91–#108): de inhoud zit in preview, maar met andere commits, dus GitHub ziet ze niet als verwerkt.')
w('5. **84 van de 92 PR\'s staan als draft**; dat voorkomt per ongeluk mergen maar houdt ze ook open.')
w('')
w('## Samenvatting per klasse')
w('')
w('| Klasse | Betekenis | Aantal | PR\'s |')
w('|---|---|---|---|')
labels = {'A': 'ACTUEEL — noodzakelijke, niet geïntegreerde wijziging', 'B': 'AL VERWERKT — inhoud aantoonbaar in preview', 'C': 'ACHTERHAALD — vervangen door nieuwere implementatie',
          'D': 'ONDERZOEK NODIG', 'E': 'REVIEW-/RELEASEKANDIDAAT'}
for k in 'ABCDE':
    w(f"| {k} | {labels[k]} | {count[k]} | {', '.join('#' + str(n) for n in sorted(R) if cls[n][0] == k) or '—'} |")
w('')
w('Bewijsmethode: `git merge-base --is-ancestor` (commit-afstamming), `git cherry` (patch-equivalentie), `git apply --check --reverse` per bestand, '
  'blob-vergelijking per bestand en het aandeel toegevoegde regels dat letterlijk in preview voorkomt (`linecov.py`). Een oude datum, groene CI of gelijkende titel is nergens als bewijs gebruikt.')
w('')
w('## GitHub Pages-impact')
w('')
w('- Pages wordt gebouwd vanuit een branch (classic "pages build and deployment": checks `build`, `deploy`, `report-build-status` op de branch-head). Deployments-API: sinds 10-11 07:24 is de bron `preview/birdspot-review` (laatste: `7677720621` op `659cbb8`); daarvoor `main`, en om 07:21 één keer `feat/birdspot-integrated-preview` (#52, `34b9f95`).')
w('- De Pages-instelling zelf is via deze sessie **niet** leesbaar (`/pages`-API geblokkeerd); de bron is afgeleid uit de deployments, niet uit de instelling.')
w('- **Beïnvloedt Pages direct bij merge:** PR\'s met base `preview/birdspot-review`: #121, #122 (en #124 via #122).')
w('- **Beïnvloedt Pages alleen als de bron terug naar `main` gaat:** #118 en alle overige PR\'s met base `main`.')
w('- **Geen Pages-impact:** gestapelde PR\'s met een featurebranch als base (mergen in die featurebranch publiceert niets), docs-only PR\'s zolang Pages op preview staat.')
w('- Vercel: geen koppeling, geen deployments; niet van toepassing.')
w('')
w('## Opruimvoorstel (niet uitgevoerd)')
w('')
w('| Stap | Actie | PR\'s | Voorwaarde |')
w('|---|---|---|---|')
w('| 1 | Actief houden en integreren in preview | #121 → #122 → #124 | Eigenaarakkoord "merge in preview" (Pages verandert) |')
w('| 2 | Actief houden als releasekandidaat | #118 | Alleen mergen na "zet live" + gates |')
w('| 3 | Actief houden (documentatie) | #125, #117 (na actualisatie) | — |')
w('| 4 | Sluiten als vervangen (nu mogelijk) | #90, #94, #97, #100, #109, #123, #52 | Akkoord op dit voorstel; #123 na akkoord op #125 |')
w('| 5 | Restcontrole, daarna sluiten | #45, #50 (D), #47, #49 | Restpunten in de tabel afgevinkt |')
w('| 6 | Sluiten als verwerkt, ná merge #118 in main | alle overige klasse B (incl. #119, #120 na stap 1) | #118 gemerged; tot dan is preview de enige plek waar de code samenkomt |')
w('| 7 | Branches opruimen | heads van gesloten PR\'s | Pas na stap 6; vooraf tag `archive/pr-NNN` per head-SHA zetten zodat elke commit herstelbaar blijft |')
w('')
w('Waarom de klasse-B-PR\'s nu nog niet sluiten: zolang `main` op 1.14.0 staat, is `preview/birdspot-review` de enige branch met die code. De PR\'s zijn dan de leesbare geschiedenis per ronde. Sluiten vóór de merge van #118 verliest geen code (de commits zitten in preview), maar wel het overzicht. Na merge #118 zijn ze aantoonbaar overbodig.')
w('')
w('## Volledig register')
w('')
w(f'Kolommen: base-SHA = huidige tip van de targetbranch. "In preview" en "In main" t.o.v. `{P}` en `{M}`.')
w('')
w('| PR | Titel | Source → target | Head | Base | Bijgewerkt | Onderwerp | CI (head) | In preview | In main | Opvolgers in stapel | Klasse | Onderbouwing | Advies |')
w('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for n in sorted(R):
    r = R[n]; k, why, adv = cls[n]
    tgt = r['base_ref']; tgt_l = f"#{heads[tgt]} ({tgt})" if tgt in heads else tgt
    desc = r['open_descendants']
    opv = (f"{len(desc)}: #{desc[0]}…#{desc[-1]}" if len(desc) > 3 else ', '.join('#' + str(x) for x in desc)) or '—'
    flags = []
    if r['mergeable_state'] == 'dirty': flags.append('conflict')
    if r['mergeable_state'] == 'unstable': flags.append('checks rood')
    if r['draft']: flags.append('draft')
    w(f"| #{n} | {r['title'].replace('|', '/')} | `{r['head_ref']}` → {tgt_l} | `{r['head_sha'][:7]}` | `{r['base_tip'][:7]}` | {r['updated_at'][:10]} | {topic(r['title'])} | {ci(r)}{' · ' + ', '.join(flags) if flags else ''} | "
      f"{pres(r['in_preview'], n)} | {'ja (ancestor)' if r['in_main']['state'].startswith('aanwezig') else 'nee'} | {opv} | **{k}** | {why} | {adv} |")
w('')
w('## Reproduceren')
w('')
w('```bash')
w('git fetch --depth=1000 origin "+refs/pull/*/head:refs/pr/*" "+refs/heads/*:refs/remotes/origin/*"')
w('gh api --paginate "repos/saddamsmit-source/Birdspot-Library/pulls?state=open&per_page=100" > open.json')
w('python3 -I tools/github/pr_analyze.py <repo> open.json register.json      # ancestry, cherry, blobs, CI, mergeable')
w('python3 -I tools/github/pr_linecov.py <repo> <nr> <base-branch>         # aandeel toegevoegde regels in preview')
w('python3 -I tools/github/pr_build_register.py register.json docs/github/PR_REGISTER_2026-11-10.md')
w('```')
open(out_p, 'w').write('\n'.join(L) + '\n')
print(count)
