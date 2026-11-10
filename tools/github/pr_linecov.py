import subprocess, sys
repo, n, base = sys.argv[1], sys.argv[2], sys.argv[3]
g = lambda *a: subprocess.run(['git', '-C', repo, *a], capture_output=True, text=True).stdout
h = g('rev-parse', f'refs/pr/{n}').strip(); mb = g('merge-base', f'origin/{base}', h).strip()
res = []
for f in g('diff', '--name-only', mb, h).split():
    if f.endswith(('.webp', '.png', '.jpg', '.mp3', '.avif')):
        continue
    added = [l[1:].strip() for l in g('diff', '-U0', mb, h, '--', f).splitlines() if l.startswith('+') and not l.startswith('+++') and len(l.strip()) > 25]
    if not added: continue
    prev = g('show', f'origin/preview/birdspot-review:{f}')
    have = sum(1 for l in added if l in prev)
    res.append((f, have, len(added)))
tot = sum(r[2] for r in res); hv = sum(r[1] for r in res)
print(f'#{n} toegevoegde regels aanwezig in preview: {hv}/{tot} ({100*hv//max(tot,1)}%)')
for f, a, b in res: print(f'   {a}/{b} {f}')
