"""Eenmalig: zoekt per soort kandidaatfoto's van een bevestigd volwassen mannetje (iNaturalist-annotatie 'Male',
research grade, Europa, vrije licentie) en maakt per soort een genummerde contactsheet. Wijzigt geen appbestanden."""
import json, time, io, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'tools/review/cand'; OUT.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'BirdspotSourceReview/1.0 (GitHub Actions; personal field-guide app)'}
LIC = 'cc0,cc-by,cc-by-sa'

def get(url, binary=False):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                b = r.read(); return b if binary else b.decode()
        except Exception as e:
            err = e; time.sleep(3 + 3 * i)
    raise err

def inat(latin, n=8):
    q = urllib.parse.urlencode({'taxon_name': latin, 'term_id': 9, 'term_value_id': 11, 'quality_grade': 'research',
                                'photo_license': LIC, 'place_id': 97391, 'per_page': 40, 'order_by': 'votes', 'photos': 'true'})
    res = json.loads(get('https://api.inaturalist.org/v1/observations?' + q))['results']
    out = []
    for o in res:
        if (o.get('taxon') or {}).get('name') != latin: continue
        ann = {}
        for a in o.get('annotations', []):
            ca = (a.get('controlled_attribute') or {}).get('label'); cv = (a.get('controlled_value') or {}).get('label')
            if ca and cv: ann[ca] = f"{cv} ({a.get('vote_score', 0):+d})"
        if 'Female' in ann.get('Sex', '') or 'Juvenile' in ann.get('Life Stage', ''): continue
        for p in o['photos'][:1]:
            if (p.get('license_code') or '') not in LIC.split(','): continue
            out.append({'photoId': p['id'], 'observation': f"https://www.inaturalist.org/observations/{o['id']}",
                        'source': f"https://www.inaturalist.org/photos/{p['id']}", 'author': p.get('attribution'),
                        'license': p.get('license_code'), 'annotations': ann, 'place': o.get('place_guess'),
                        'observedOn': o.get('observed_on'), 'faves': o.get('faves_count'),
                        'original': p['url'].replace('square', 'original'), 'large': p['url'].replace('square', 'large')})
        if len(out) >= n: break
    return out

def sheet(sid, name, cands):
    tiles = []
    for i, c in enumerate(cands, 1):
        try:
            im = Image.open(io.BytesIO(get(c['large'], binary=True))).convert('RGB')
            c['largeSize'] = im.size
            im.thumbnail((520, 390)); t = Image.new('RGB', (520, 420), 'white'); t.paste(im, ((520 - im.width) // 2, 0))
            d = ImageDraw.Draw(t); d.text((6, 396), f"#{i} {c['license']} {c['annotations']}"[:90], fill='black'); tiles.append(t)
        except Exception as e:
            c['error'] = str(e)
    if not tiles: return
    cols = 3; rows = (len(tiles) + cols - 1) // cols
    s = Image.new('RGB', (cols * 528, rows * 428 + 30), 'white'); ImageDraw.Draw(s).text((6, 8), f'{sid} {name}', fill='black')
    for i, t in enumerate(tiles): s.paste(t, ((i % cols) * 528, 30 + (i // cols) * 428))
    s.save(OUT / f'{sid}.jpg', quality=78)

def main():
    species = json.loads((ROOT / 'tools/review/cand_species.json').read_text())
    allc = {}
    for sp in species:
        try:
            c = inat(sp['latin']); sheet(sp['id'], sp['nl'], c); allc[sp['id']] = c
        except Exception as e:
            allc[sp['id']] = {'error': str(e)}
        print(sp['id'], len(allc[sp['id']]) if isinstance(allc[sp['id']], list) else allc[sp['id']], flush=True)
        time.sleep(1.2)
    (OUT / 'candidates.json').write_text(json.dumps(allc, indent=1, ensure_ascii=False))

if __name__ == '__main__':
    main()
