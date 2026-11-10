"""Bouwt docs/fotobaseline/FOTOBASELINE_TRACKER.md uit drie bronnen:
  1. audit.json      — tools/fotobaseline/audit.mjs   (gerenderde volgorde, labels, credits, offline)
  2. images.json     — tools/fotobaseline/imagecheck.py (laadbaarheid, afmetingen, dHash-duplicaten)
  3. reviews/*.json  — handmatige visuele beoordeling per batch (geslacht/leeftijd/kwaliteit)

Gebruik: python3 -I tools/fotobaseline/build_tracker.py <audit.json> <images.json> <reviews-dir> <uit.md> <checked-sha> <media-sha>
Soorten zonder review krijgen status NOT TESTED. Niets wordt verzonnen: velden die alleen
visueel te beoordelen zijn blijven leeg ("—") zolang er geen review is.
"""
import glob, json, os, sys

audit_p, img_p, rev_dir, out_p, checked_sha, media_sha = sys.argv[1:7]
audit = json.load(open(audit_p))
images = json.load(open(img_p))
reviews, batches, extra = {}, [], []
for f in sorted(glob.glob(os.path.join(rev_dir, 'batch-*.json'))):
    b = json.load(open(f))
    batches.append(b)
    for sid, r in b['species'].items():
        reviews[sid] = {**r, 'batch': b['batch']}
    extra += b.get('outOfBatchFindings', [])

STATUSES = ['VERIFIED', 'PARTIALLY TESTED', 'NOT TESTED', 'BLOCKED']
fname = lambda p: os.path.basename(p) if p else '—'


def slots(row):
    """Welke baseline-plaatsen zijn op de gerenderde kaart gevuld (foto of hoofdfotoverwijzing)."""
    seq = row['rendered']
    has = lambda sec, slot: any(x['section'] == sec and x['slot'] == slot for x in seq)
    shared = row['sharedAdult']
    s = {
        'hero': any(x['slot'] == 'hero' for x in seq),
        'male': 'n.v.t.' if shared else has('Verenkleed', 'adult_m'),
        'female': 'n.v.t.' if shared else has('Verenkleed', 'adult_f'),
        'adult': has('Verenkleed', 'adult') if shared else 'n.v.t.',
        'juv': has('Verenkleed', 'juv'),
        'flight': any(x['section'] == 'In vlucht' for x in seq),
        'flight_m': has('In vlucht', 'adult_m'),
        'flight_f': has('In vlucht', 'adult_f'),
    }
    return s


def yn(v):
    return v if isinstance(v, str) else ('ja' if v else 'nee')


rows = audit['rows']
missing_count = {k: 0 for k in ['hero', 'male', 'female', 'juv', 'flight']}
credit_problems, dupes, offline_problems, reuse = [], [], [], []
for r in rows:
    s = slots(r)
    for k in missing_count:
        if s[k] is False:
            missing_count[k] += 1
    for m in r['media']:
        if m['missingCredit'] or not m['latinOk']:
            credit_problems.append(f"{r['id']} {fname(m['image'])}")
        if not m['offline']:
            offline_problems.append(f"{r['id']} {fname(m['image'])}")
    near = images.get(r['id'], {}).get('nearDuplicates', [])
    if r['exactDuplicatesRendered'] or near:
        dupes.append(r['id'])
    if r['duplicateSourcesInRegistry']:
        reuse.append(r['id'])

status = {r['id']: reviews.get(r['id'], {}).get('status', 'NOT TESTED') for r in rows}
counts = {k: sum(1 for v in status.values() if v == k) for k in STATUSES}
replacements = [sid for sid, rv in reviews.items() if rv.get('replacement')]
open_issues = [sid for sid, rv in reviews.items() if rv['status'] != 'VERIFIED' or 'AFWIJKING' in rv.get('labels', '') + rv.get('hero', '')]

L = []
w = L.append
w('# Birdspot Library — Fotobaseline-tracker (Fase 3-C/3-D)')
w('')
w('Hervatbaar per-soortregister van de controle van bestaande gidsfoto\'s tegen de ontwerpbaseline '
  '(handover v1.0 §6–§8). Gegenereerd door `tools/fotobaseline/build_tracker.py`; niet met de hand bewerken — '
  'pas `docs/fotobaseline/reviews/batch-NN.json` aan en genereer opnieuw.')
w('')
w('## Stand')
w('')
w('| Meting | Waarde |')
w('|---|---|')
w(f"| Laatst gecontroleerde render-commit | `{checked_sha}` |")
w(f"| Gemeten mediadata (identiek op `preview/birdspot-review` 659cbb8) | `{media_sha}` |")
w(f"| Totaal soorten | {audit['summary']['species']} |")
w(f"| Soorten met ≥1 gidsfoto | {audit['summary']['withPhoto']} |")
w(f"| Soorten zonder gidsfoto | {audit['summary']['withoutPhoto']} |")
w(f"| Volledig gecontroleerde soortkaarten (VERIFIED) | {counts['VERIFIED']} |")
w(f"| PARTIALLY TESTED / NOT TESTED / BLOCKED | {counts['PARTIALLY TESTED']} / {counts['NOT TESTED']} / {counts['BLOCKED']} |")
for dim, lab in [('technical', 'technisch'), ('visual', 'visueel'), ('rights', 'bron/rechten')]:
    c = {k: sum(1 for rv in reviews.values() if rv.get(dim) == k) for k in STATUSES}
    w(f"| Gecontroleerde soorten — {lab}: VERIFIED / PARTIALLY / NOT TESTED / BLOCKED | {c['VERIFIED']} / {c['PARTIALLY TESTED']} / {c['NOT TESTED']} / {c['BLOCKED']} |")
w(f"| Gecontroleerde soorten met openstaande issues | {len(open_issues)}: {', '.join(open_issues) or '—'} |")
w(f"| Ontbrekend (van {len(rows)}) — hoofdfoto / mannetje / vrouwtje / juveniel / vlucht | "
  f"{missing_count['hero']} / {missing_count['male']} / {missing_count['female']} / {missing_count['juv']} / {missing_count['flight']} |")
w(f"| Bron-/licentieproblemen (ontbrekend veld of Latijnse naam wijkt af) | {len(credit_problems)}{': ' + ', '.join(credit_problems) if credit_problems else ''} |")
w(f"| Niet in offline-precachelijst (sw.js) | {len(offline_problems)}{': ' + ', '.join(offline_problems) if offline_problems else ''} |")
w(f"| Gedetecteerde duplicaten op de kaart (zelfde pad 2x getoond of dHash ≤ 6) | {len(dupes)}{': ' + ', '.join(dupes) if dupes else ''} |")
w(f"| Registry-hergebruik zelfde bestand (één keer getoond, geen kaartduplicaat) | {len(reuse)}{': ' + ', '.join(reuse) if reuse else ''} |")
w(f"| Benodigde kwaliteitsvervangingen (uit reviews) | {len(replacements)}: {', '.join(replacements) or '—'} |")
w('')
w('Mannetje/vrouwtje "ontbreekt" telt alleen bij soorten met verschillend kleed; bij gelijke geslachten is dat n.v.t. '
  'Een hoofdfotoverwijzing telt als gevuld.')
w('')
w('## Bewijsgrenzen')
w('')
w('- **Code/render** (VERIFIED-basis): `recognitionPanel()` en `guideHeroPhoto()` uit de checkout zelf, in Node gerenderd; volgordecontrole per sectie en kleedslot.')
w('- **Beeld**: alle bestanden gedecodeerd (Pillow), afmetingen gemeten, dHash over alle eigen beelden per soort.')
w('- **Visueel**: contactsheets per soort bekeken door Claude; geslacht/leeftijd alleen bevestigd waar het kenmerk zichtbaar is. Geen onafhankelijke ornithologische certificering.')
w('- **Bron/rechten**: koppeling aan `docs/evidence/GUIDE_SOURCE_AUDIT_2026-11-09.json` (367 foto\'s, zelfde opname via ORB+RANSAC, maker, licentie, iNaturalist-annotaties) of `tools/species/verified_heroes_2026-11-09.json`. Licentieconformiteit, geen juridisch oordeel.')
w('- **Offline**: alleen gecontroleerd dat het pad in `credits.json`/`field-guide-media.json` staat (precachebron van `sw.js`). Browser-offline en fysiek toestel: NOT TESTED.')
w('- Status geldt voor de render-commit hierboven. Correcties die alleen op een ongemergede PR staan, staan bij de soort vermeld.')
w('')
for b in batches:
    w(f"## Batch {b['batch']} — {b['scope']}")
    w('')
    w(f"Beoordeeld {b['reviewed']} · {b['reviewer']}.")
    w('')
    ids = list(b['species'])
    byid = {r['id']: r for r in rows}
    for sid in ids:
        r, rv = byid[sid], b['species'][sid]
        s = slots(r)
        img = images.get(sid, {})
        flights = '; '.join(f"{fname(f['image'])} ({f['sex'] or 'geslacht niet vastgesteld'})" for f in r['flights']) or '—'
        mf = f"M {yn(s['male'])} · V {yn(s['female'])}" + (f" · Volwassen {yn(s['adult'])}" if r['sharedAdult'] else '') + f" · Juv {yn(s['juv'])}"
        order = ' → '.join(dict.fromkeys(f"{x['section']}" for x in r['rendered']))
        credits = '; '.join(f"{fname(m['image'])}: {m['author']} · {m['license']}" for m in r['media'])
        loaded = [m for m in img.get('images', {}).values()]
        ok = sum(1 for m in loaded if m['ok'])
        sizes = ', '.join(f"{fname(p)} {m['size'][0]}×{m['size'][1]}" for p, m in img.get('images', {}).items() if m['ok'] and m['shortSide'] < 500)
        dup = 'geen (exact en dHash)' if not (r['exactDuplicatesRendered'] or img.get('nearDuplicates')) else json.dumps(
            {'exact': r['exactDuplicatesRendered'], 'dHash': img.get('nearDuplicates')}, ensure_ascii=False)
        if r['duplicateSourcesInRegistry']:
            dup += '; registry-hergebruik zelfde bestand, één keer getoond'
        offline = 'alle beelden in precachebron' if all(m['offline'] for m in r['media']) else 'NIET: ' + ', '.join(fname(m['image']) for m in r['media'] if not m['offline'])
        w(f"### {sid} {r['nameNL']} — {rv['status']} (technisch {rv['technical']} · visueel {rv['visual']} · bron/rechten {rv['rights']})")
        w('')
        w('| # | Veld | Bevinding |')
        w('|---|---|---|')
        fields = [
            ('Soort-ID', sid),
            ('Naam', f"{r['nameNL']} · *{r['nameSci']}*"),
            ('Soortgroep', r['family'] + (' · geslachten gelijk (kaart "Volwassen")' if r['sharedAdult'] else ' · geslachten verschillen')),
            ('Hoofdfoto + geschiktheid', f"`{fname(r['heroImage'])}` ({r['heroFrom']}) — {rv['hero']}"),
            ('Mannetje / vrouwtje / juveniel', mf),
            ('Vluchtfoto\'s', flights),
            ('Vergelijkingen', f"{r['comparisons']} entries" + (f", waarvan {r['comparisonsHiddenJuvJuv']} juv-juv verborgen" if r['comparisonsHiddenJuvJuv'] else '')),
            ('Volgorde (§6.B)', ('conform: ' if not r['orderIssues'] else 'AFWIJKING ' + '; '.join(r['orderIssues']) + ': ') + order),
            ('Duplicaten', dup),
            ('Geslacht-/leeftijdslabels', rv['labels']),
            ('Maker/bron/licentie', credits + ('' if all(not m['missingCredit'] and m['latinOk'] for m in r['media']) else ' — PROBLEEM') + f" — **{rv['rights']}**: {rv['rightsNote']}"),
            ('Kwaliteit + laadbaarheid', f"{ok}/{len(loaded)} beelden laden. {rv['quality']}" + (f" Korte zijde < 500 px: {sizes}." if sizes else '')),
            ('Offline', offline + ' (code-niveau)'),
            ('Ontbrekend / vervanging', rv['missing'] + (f" Vervanging: {rv['replacement']}" if rv.get('replacement') else '')),
            ('Teststatus + vervolgactie', f"**{rv['status']}** (technisch {rv['technical']}: {rv['technicalNote']}) — {rv['action']}"),
        ]
        for i, (k, v) in enumerate(fields, 1):
            w(f"| {i} | {k} | {str(v).replace('|', '/')} |")
        w('')
if extra:
    w('## Bevindingen buiten de huidige batch')
    w('')
    for e in extra:
        w(f"- **{e['id']}** ({e['batch']}, {e['status']}): {e['finding']}")
    w('')
w('## Alle soorten met foto — status')
w('')
w('| Soortgroep | ID | Soort | Status | Technisch | Visueel | Bron/rechten | Batch |')
w('|---|---|---|---|---|---|---|---|')
for r in sorted(rows, key=lambda r: (r['family'].casefold(), r['nameNL'].casefold())):
    rv = reviews.get(r['id'], {})
    w(f"| {r['family']} | {r['id']} | {r['nameNL']} | {status[r['id']]} | {rv.get('technical', 'NOT TESTED')} | {rv.get('visual', 'NOT TESTED')} | {rv.get('rights', 'NOT TESTED')} | {rv.get('batch', '—')} |")
w('')
w('## Reproduceren')
w('')
w('```bash')
w('# 1. checkout van de te meten commit (bijv. als worktree)')
w('git worktree add ../audit <sha>')
w('# 2. meten')
w('node tools/fotobaseline/audit.mjs ../audit /tmp/audit.json')
w('python3 -I tools/fotobaseline/imagecheck.py ../audit /tmp/audit.json /tmp/images.json --sheets /tmp/sheets --ids sp104,sp065')
w('# 3. tracker opnieuw opbouwen')
w('python3 -I tools/fotobaseline/build_tracker.py /tmp/audit.json /tmp/images.json docs/fotobaseline/reviews docs/fotobaseline/FOTOBASELINE_TRACKER.md <render-sha> <media-sha>')
w('```')
w('')
w('Sortering in deze tabel gebruikt `str.casefold` als benadering van `localeCompare(\'nl\')`; de batchvolgorde zelf is bepaald met `localeCompare(\'nl\')` in Node.')
open(out_p, 'w').write('\n'.join(L) + '\n')
print('tracker:', out_p, counts)
