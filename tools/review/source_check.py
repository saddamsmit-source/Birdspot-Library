"""Eenmalige broncontrole (alleen-lezen t.o.v. de app): haalt per gidsfoto de bronmetadata en het bronbeeld op,
vergelijkt bronbeeld en app-beeld (zelfde opname, spiegeling) en maakt een zij-aan-zij-afbeelding.
Uitvoer: tools/review/out/report.json en tools/review/out/img/*.jpg. Wijzigt geen appbestanden."""
import json, re, sys, time, html, io, urllib.parse, urllib.request
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'tools/review/out'; (OUT / 'img').mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'BirdspotSourceReview/1.0 (GitHub Actions; personal field-guide app)'}

def get(url, binary=False, tries=4):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                b = r.read(); return b if binary else b.decode('utf-8', 'replace')
        except Exception as e:
            err = e; time.sleep(2 + 3 * i)
    raise err

def strip(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s or ''))).strip()

def commons(src):
    title = urllib.parse.unquote(src.split('/wiki/', 1)[1]).replace('_', ' ')
    q = urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo|categories', 'cllimit': 'max',
                                'iiprop': 'url|size|sha1|extmetadata', 'iiurlwidth': 1200, 'format': 'json'})
    d = json.loads(get('https://commons.wikimedia.org/w/api.php?' + q))
    page = next(iter(d['query']['pages'].values()))
    ii = page['imageinfo'][0]; em = ii.get('extmetadata', {})
    v = lambda k: strip(em.get(k, {}).get('value', ''))
    return {'kind': 'commons', 'title': title, 'author': v('Artist'), 'license': v('LicenseShortName'), 'licenseUrl': v('LicenseUrl'),
            'description': v('ImageDescription')[:1500], 'objectName': v('ObjectName'), 'date': v('DateTimeOriginal'),
            'categories': [c['title'].replace('Category:', '') for c in page.get('categories', [])],
            'width': ii['width'], 'height': ii['height'], 'sha1': ii['sha1'], 'thumb': ii.get('thumburl') or ii['url']}

def inat(src):
    pid = re.search(r'/photos/(\d+)', src).group(1)
    obs = None
    try:
        d = json.loads(get(f'https://api.inaturalist.org/v1/observations?photo_id={pid}'))
        obs = d['results'][0] if d.get('results') else None
    except Exception:
        pass
    if not obs:
        page = get(f'https://www.inaturalist.org/photos/{pid}')
        oid = re.search(r'/observations/(\d+)', page).group(1)
        obs = json.loads(get(f'https://api.inaturalist.org/v1/observations/{oid}'))['results'][0]
    photo = next(p for p in obs['photos'] if str(p['id']) == pid)
    ann = {}
    for a in obs.get('annotations', []):
        ca = (a.get('controlled_attribute') or {}).get('label'); cv = (a.get('controlled_value') or {}).get('label')
        if ca and cv: ann.setdefault(ca, []).append(f"{cv} ({a.get('vote_score', 0):+d})")
    return {'kind': 'inaturalist', 'observation': f"https://www.inaturalist.org/observations/{obs['id']}",
            'taxon': (obs.get('taxon') or {}).get('name'), 'commonName': (obs.get('taxon') or {}).get('preferred_common_name'),
            'qualityGrade': obs.get('quality_grade'), 'observedOn': obs.get('observed_on'), 'place': obs.get('place_guess'),
            'author': photo.get('attribution'), 'license': photo.get('license_code'), 'annotations': ann,
            'description': strip(obs.get('description'))[:1500], 'thumb': photo['url'].replace('square', 'large')}

def orb_inliers(a, b):
    orb = cv2.ORB_create(2000); bf = cv2.BFMatcher(cv2.NORM_HAMMING)
    ka, da = orb.detectAndCompute(a, None); kb, db = orb.detectAndCompute(b, None)
    if da is None or db is None: return 0
    good = [m for m, n in (x for x in bf.knnMatch(da, db, k=2) if len(x) == 2) if m.distance < 0.75 * n.distance]
    if len(good) < 10: return len(good)
    src = np.float32([ka[m.queryIdx].pt for m in good]); dst = np.float32([kb[m.trainIdx].pt for m in good])
    _, mask = cv2.estimateAffinePartial2D(src, dst, method=cv2.RANSAC, ransacReprojThreshold=6)
    return int(mask.sum()) if mask is not None else 0

def compare(local_path, src_bytes, name, caption):
    loc = Image.open(local_path).convert('RGB'); src = Image.open(io.BytesIO(src_bytes)).convert('RGB')
    g = lambda im: cv2.cvtColor(np.array(im.resize((int(800 * im.width / max(im.size)), int(800 * im.height / max(im.size))))), cv2.COLOR_RGB2GRAY)
    same = orb_inliers(g(loc), g(src)); mirror = orb_inliers(g(loc), cv2.flip(g(src), 1))
    H = 420; a = loc.resize((int(loc.width * H / loc.height), H)); b = src.resize((int(src.width * H / src.height), H))
    sheet = Image.new('RGB', (a.width + b.width + 12, H + 40), 'white'); sheet.paste(a, (0, 40)); sheet.paste(b, (a.width + 12, 40))
    d = ImageDraw.Draw(sheet); d.text((4, 4), f'APP: {name}', fill='black'); d.text((a.width + 16, 4), 'BRON', fill='black'); d.text((4, 20), caption[:150], fill='darkred')
    sheet.save(OUT / 'img' / (Path(name).stem + '.jpg'), quality=80)
    return {'orbSame': same, 'orbMirror': mirror, 'localAR': round(loc.width / loc.height, 3), 'sourceAR': round(src.width / src.height, 3)}

def main():
    targets = json.loads((ROOT / 'tools/review/targets.json').read_text())
    only = set(sys.argv[1:])
    report = []
    for t in targets:
        if only and t['image'] not in only: continue
        row = {'image': t['image'], 'app': t}
        try:
            meta = commons(t['source']) if 'commons.wikimedia.org' in t['source'] else inat(t['source'])
            row['source'] = meta
            row['compare'] = compare(ROOT / t['image'].lstrip('/'), get(meta['thumb'], binary=True), t['image'].split('/')[-1],
                                     f"{t['nl']} · app: sex={t.get('sex')} age={t.get('age')} flight={t.get('flight')} label={t.get('label')}")
        except Exception as e:
            row['error'] = f'{type(e).__name__}: {e}'
        report.append(row); print(t['image'], 'ok' if 'error' not in row else row['error'], flush=True)
        time.sleep(0.4)
    (OUT / 'report.json').write_text(json.dumps(report, indent=1, ensure_ascii=False))

if __name__ == '__main__':
    main()
