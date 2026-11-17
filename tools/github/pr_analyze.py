"""PR-register Birdspot: per open PR metadata, CI, ancestry en inhoudsvergelijking t.o.v. preview en main.
Gebruik: python3 -I analyze.py <repo> <open.json> <out.json>
"""
import json, subprocess, sys
from collections import Counter

repo, open_p, out_p = sys.argv[1:4]
PREVIEW, MAIN = 'origin/preview/birdspot-review', 'origin/main'


def git(*a, check=False):
    r = subprocess.run(['git', '-C', repo, *a], capture_output=True, text=True)
    if check and r.returncode:
        raise RuntimeError(r.stderr)
    return r


def out(*a):
    return git(*a).stdout.strip()


def is_anc(a, b):
    return git('merge-base', '--is-ancestor', a, b).returncode == 0


def gh(path):
    r = subprocess.run(['gh', 'api', path], capture_output=True, text=True)
    return json.loads(r.stdout) if r.returncode == 0 else {'_error': r.stderr.strip()[:200]}


def blob(rev, f):
    r = git('rev-parse', f'{rev}:{f}')
    return r.stdout.strip() if r.returncode == 0 else None


prs = json.load(open(open_p))
preview_sha, main_sha = out('rev-parse', PREVIEW), out('rev-parse', MAIN)
heads = {p['number']: p['head']['sha'] for p in prs}
rows = []
for p in sorted(prs, key=lambda p: p['number']):
    n, head = p['number'], p['head']['sha']
    base_ref = p['base']['ref']
    base_tip = out('rev-parse', f'origin/{base_ref}') or p['base']['sha']
    mb = out('merge-base', base_tip, head)
    files = [f for f in out('diff', '--name-only', mb, head).splitlines() if f]
    commits = out('rev-list', '--count', f'{mb}..{head}')
    def presence(target):
        if is_anc(head, target):
            return {'state': 'aanwezig (ancestor)', 'files_equal': len(files), 'files': len(files)}
        eq = sum(1 for f in files if blob(head, f) == blob(target, f))
        cherry = out('cherry', target, head).splitlines()
        plus = sum(1 for c in cherry if c.startswith('+'))
        state = 'inhoud gelijk (geen ancestor)' if files and eq == len(files) else ('deels' if eq else 'afwezig')
        return {'state': state, 'files_equal': eq, 'files': len(files), 'cherry_unpicked': plus, 'cherry_total': len(cherry)}
    in_prev, in_main = presence(PREVIEW), presence(MAIN)
    children = [m for m, h in heads.items() if m != n and h != head and is_anc(head, h)]
    # opvolgers die dezelfde bestanden later opnieuw wijzigen (stapel boven deze PR)
    later_touch = []
    for m in children:
        mfiles = set(out('diff', '--name-only', head, heads[m]).splitlines())
        if mfiles & set(files):
            later_touch.append(m)
    det = gh(f'repos/saddamsmit-source/Birdspot-Library/pulls/{n}')
    cr = gh(f'repos/saddamsmit-source/Birdspot-Library/commits/{head}/check-runs?per_page=100')
    runs = cr.get('check_runs', []) if isinstance(cr, dict) else []
    concl = Counter((r.get('conclusion') or r.get('status')) for r in runs)
    rows.append({
        'number': n, 'title': p['title'], 'draft': p['draft'], 'head_ref': p['head']['ref'], 'base_ref': base_ref,
        'head_sha': head, 'base_sha_api': p['base']['sha'], 'base_tip': base_tip, 'base_branch_exists': bool(out('rev-parse', '--verify', '-q', f'origin/{base_ref}')),
        'head_branch_exists': bool(out('rev-parse', '--verify', '-q', f"origin/{p['head']['ref']}")),
        'updated_at': p['updated_at'], 'created_at': p['created_at'], 'author': p['user']['login'],
        'commits_vs_base': int(commits or 0), 'files': files, 'n_files': len(files),
        'in_preview': in_prev, 'in_main': in_main, 'open_descendants': sorted(children), 'later_touch_same_files': sorted(later_touch),
        'mergeable': det.get('mergeable'), 'mergeable_state': det.get('mergeable_state'),
        'ci': dict(concl), 'ci_total': len(runs),
    })
    print(n, rows[-1]['in_preview']['state'], '|', rows[-1]['in_main']['state'], '| CI', dict(concl), flush=True)
json.dump({'preview_sha': preview_sha, 'main_sha': main_sha, 'rows': rows}, open(out_p, 'w'), indent=1)
