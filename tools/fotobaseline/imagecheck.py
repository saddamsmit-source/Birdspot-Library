"""Fotobaseline-beeldcontrole: laadbaarheid, afmetingen en visuele duplicaten (dHash).

Gebruik: python3 -I tools/fotobaseline/imagecheck.py <checkout> <audit.json> <uit.json> [--sheets DIR --ids sp001,sp002]
Leest audit.json van audit.mjs. Decodeert ieder eigen beeld van de soortkaart en de
registry-items, berekent een 64-bit dHash en markeert paren met Hamming-afstand <= 6 als
mogelijk visueel duplicaat. Met --sheets maakt het per soort een contactsheet met labels,
bedoeld voor handmatige visuele beoordeling (geslacht/leeftijd/kwaliteit).
"""
import json, sys, os
from PIL import Image, ImageDraw, ImageFont

root, audit_path, out_path = sys.argv[1:4]
sheets = sys.argv[sys.argv.index('--sheets') + 1] if '--sheets' in sys.argv else None
ids = set(sys.argv[sys.argv.index('--ids') + 1].split(',')) if '--ids' in sys.argv else None
audit = json.load(open(audit_path))


def dhash(img):
    g = img.convert('L').resize((9, 8), Image.LANCZOS)
    px = list(g.get_flattened_data()) if hasattr(g, 'get_flattened_data') else list(g.getdata())
    bits = 0
    for r in range(8):
        for c in range(8):
            bits = (bits << 1) | (px[r * 9 + c] > px[r * 9 + c + 1])
    return bits


def load(path):
    full = os.path.join(root, path.lstrip('/'))
    try:
        with Image.open(full) as im:
            im.load()
            return im.copy(), None
    except Exception as e:  # noqa: BLE001 - we rapporteren elke decodefout
        return None, f'{type(e).__name__}: {e}'


results = {}
for row in audit['rows']:
    if ids and row['id'] not in ids:
        continue
    images = {}
    for x in row['rendered']:
        if x.get('image') and x['slot'] != 'cmp':
            images.setdefault(x['image'], f"{x['section']}/{x['slot'] or '-'}")
    hidden = []
    for m in row['media']:
        if m['image'] and m['image'] not in images:
            images[m['image']] = f"niet getoond ({m['from']})"
            hidden.append(m['image'])
    info, hashes = {}, {}
    for path, label in images.items():
        im, err = load(path)
        if im is None:
            info[path] = {'label': label, 'ok': False, 'error': err}
            continue
        hashes[path] = dhash(im)
        info[path] = {'label': label, 'ok': True, 'size': im.size, 'bytes': os.path.getsize(os.path.join(root, path.lstrip('/'))),
                      'shortSide': min(im.size)}
    paths = list(hashes)
    near = []
    for i in range(len(paths)):
        for j in range(i + 1, len(paths)):
            d = bin(hashes[paths[i]] ^ hashes[paths[j]]).count('1')
            if d <= 6:
                near.append({'a': paths[i], 'b': paths[j], 'hamming': d})
    results[row['id']] = {'images': info, 'nearDuplicates': near, 'hiddenRegistryImages': hidden}

    if sheets:
        os.makedirs(sheets, exist_ok=True)
        tiles = []
        for path, meta in info.items():
            if not meta['ok']:
                continue
            im, _ = load(path)
            im.thumbnail((520, 400))
            tile = Image.new('RGB', (540, 450), 'white')
            tile.paste(im.convert('RGB'), ((540 - im.width) // 2, 5))
            d = ImageDraw.Draw(tile)
            d.text((8, 410), meta['label'][:80], fill='black')
            d.text((8, 428), os.path.basename(path)[:80], fill='gray')
            tiles.append(tile)
        cols = 3
        rows_n = (len(tiles) + cols - 1) // cols or 1
        sheet = Image.new('RGB', (cols * 540, rows_n * 450 + 30), (230, 230, 230))
        ImageDraw.Draw(sheet).text((8, 8), f"{row['id']} {row['nameNL']} ({row['nameSci']})", fill='black')
        for k, t in enumerate(tiles):
            sheet.paste(t, ((k % cols) * 540, 30 + (k // cols) * 450))
        sheet.save(os.path.join(sheets, f"{row['id']}.jpg"), quality=82)

json.dump(results, open(out_path, 'w'), indent=1)
bad = {k: [p for p, m in v['images'].items() if not m['ok']] for k, v in results.items()}
print('soorten:', len(results), '| decodefouten:', sum(len(v) for v in bad.values()),
      '| mogelijke visuele duplicaten:', sum(len(v['nearDuplicates']) for v in results.values()))
