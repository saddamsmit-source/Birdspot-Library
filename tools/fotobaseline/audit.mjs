// Fotobaseline-audit (Fase 3-C) — leest de gidsmedia van een Birdspot-checkout en rendert
// iedere soortkaart via de echte recognitionPanel()/guideHeroPhoto(), zodat de getoonde
// fotovolgorde wordt gemeten en niet afgeleid. Schrijft één JSON-regel per soort.
//
// Gebruik:  node tools/fotobaseline/audit.mjs <pad-naar-checkout> [uitvoer.json]
// Wijzigt niets in de checkout. Beeldinhoud (geslacht/leeftijd/kwaliteit) wordt hier NIET
// beoordeeld; dat gebeurt visueel en staat apart in de tracker.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] || '.');
const out = process.argv[3];
const imp = p => import(pathToFileURL(resolve(root, p)).href);

const { SPECIES } = await imp('src/data/species.js');
const { GUIDE_PHOTOS } = await imp('src/features/species/guidePhotos.js');
const { GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } = await imp('src/features/species/guideMedia.js');
const { GUIDE_COMPARISONS } = await imp('src/features/species/guideComparisons.js');
const DS = await imp('src/features/species/detailSections.js');

const credits = JSON.parse(readFileSync(resolve(root, 'assets/species/credits.json'), 'utf8'));
const fgm = JSON.parse(readFileSync(resolve(root, 'assets/species/field-guide-media.json'), 'utf8'));
const precached = new Set([
  ...Object.values(credits).map(p => p.image),
  ...Object.values(fgm.plumage || {}).flatMap(c => Object.values(c)).map(p => p.image),
  ...Object.values(fgm.poses || {}).flat().map(p => p.image),
].filter(Boolean));

const hasAny = id => Boolean(GUIDE_PHOTOS[id] || GUIDE_HEROES[id] ||
  (GUIDE_PLUMAGE[id] && Object.keys(GUIDE_PLUMAGE[id]).length) || GUIDE_POSES[id]?.length);

// Alle registry-items van één soort, met herkomst (welke registry/sleutel).
function registryItems(s) {
  const items = [];
  if (GUIDE_PHOTOS[s.id]) items.push({ from: 'GUIDE_PHOTOS', ...GUIDE_PHOTOS[s.id] });
  for (const [kind, p] of Object.entries(GUIDE_PLUMAGE[s.id] || {})) {
    if (p.reuseGuidePhoto) items.push({ from: `GUIDE_PLUMAGE.${kind}`, reuse: 'GUIDE_PHOTOS' });
    else items.push({ from: `GUIDE_PLUMAGE.${kind}`, ...p });
  }
  (GUIDE_POSES[s.id] || []).forEach((p, i) => items.push({ from: `GUIDE_POSES[${i}]`, ...p }));
  return items;
}

// Gerenderde volgorde: hoofdfoto (view.js) + recognitionPanel in documentvolgorde.
function renderedSequence(s) {
  const seq = [];
  const hero = DS.guideHeroPhoto(s.id);
  if (hero) seq.push({ section: 'Hoofdfoto', slot: 'hero', image: hero.image });
  const html = DS.recognitionPanel(s);
  const re = /<h3 class="sd-h">([^<]+)<\/h3>|data-plumage="([^"]+)"|class="sd-cmp-card"|<img src="([^"]+)"|(sd-hero-ref)/g;
  let section = '', slot = '', inCmp = false, m;
  while ((m = re.exec(html))) {
    if (m[1]) { section = m[1].replace(/&#39;|’/g, "'"); slot = ''; inCmp = false; }
    else if (m[2]) { slot = m[2]; }
    else if (m[0] === 'class="sd-cmp-card"') { inCmp = true; slot = 'cmp'; }
    else if (m[3]) seq.push({ section, slot: inCmp ? 'cmp' : slot, image: m[3] });
    else if (m[4]) seq.push({ section, slot, image: null, heroRef: true });
  }
  return { seq, html };
}

const ORDER = ['Hoofdfoto', 'Verenkleed', 'In vlucht', "Overige herkenningsfoto's", 'Vluchtvergelijking', 'Lijkt op'];
const SLOT_ORDER = ['adult_m', 'adult', 'adult_f', 'juv', 'breeding', 'winter', 'eclipse', 'jaarling'];

function orderCheck(seq) {
  const issues = [];
  seq = seq.filter(x => x.image);
  const secIdx = seq.map(x => ORDER.indexOf(x.section));
  if (secIdx.some(i => i < 0)) issues.push('onbekende sectie: ' + [...new Set(seq.filter((x, i) => secIdx[i] < 0).map(x => x.section))].join(','));
  for (let i = 1; i < secIdx.length; i++) if (secIdx[i] >= 0 && secIdx[i] < secIdx[i - 1]) issues.push(`sectievolgorde: ${seq[i - 1].section} → ${seq[i].section}`);
  for (const sec of ['Verenkleed', 'In vlucht']) {
    const slots = seq.filter(x => x.section === sec).map(x => SLOT_ORDER.indexOf(x.slot)).filter(i => i >= 0);
    for (let i = 1; i < slots.length; i++) if (slots[i] < slots[i - 1]) issues.push(`slotvolgorde in ${sec}`);
  }
  return issues;
}

const rows = [];
for (const s of SPECIES.filter(sp => hasAny(sp.id))) {
  const items = registryItems(s);
  const { seq, html } = renderedSequence(s);
  const images = seq.filter(x => x.image).map(x => x.image);
  const ownImages = seq.filter(x => x.image && x.slot !== 'cmp').map(x => x.image);
  const groups = DS.guidePlumageGroups(s);
  const sharedAdult = Boolean(s.plumage?.adult_m && !s.plumage?.adult_f);
  const flights = items.filter(p => p.flight).map(p => ({ from: p.from, label: p.label || '', sex: p.sex || null, image: p.image }));
  const cmp = GUIDE_COMPARISONS.filter(e => e.birds.some(b => b.id === s.id));
  const cmpHiddenJuv = cmp.filter(e => {
    const f = e.birds.find(b => b.id === s.id);
    return f.plumage === 'juv' && e.birds.some(b => b.id !== s.id && b.plumage === 'juv');
  }).length;
  const meta = items.filter(p => !p.reuse).map(p => {
    const miss = ['author', 'license', 'licenseUrl', 'source'].filter(k => !p[k]);
    return { from: p.from, image: p.image, file: p.file, author: p.author, license: p.license, source: p.source,
      missingCredit: miss, latinOk: p.latin === s.nameSci, exists: Boolean(p.image && existsSync(resolve(root, '.' + p.image))),
      offline: precached.has(p.image), sex: p.sex || null, age: p.age || null, flight: Boolean(p.flight),
      label: p.label || '', visualCheck: p.visualCheck || '', declared: [p.width, p.height] };
  });
  const dupImages = images.filter((im, i) => images.indexOf(im) !== i);
  const sources = meta.map(p => p.source).filter(Boolean);
  rows.push({
    id: s.id, nameNL: s.nameNL, nameSci: s.nameSci, family: s.family, sharedAdult,
    heroImage: GUIDE_HEROES[s.id] || GUIDE_PHOTOS[s.id]?.image || null,
    heroFrom: GUIDE_HEROES[s.id] ? 'GUIDE_HEROES' : (GUIDE_PHOTOS[s.id] ? 'GUIDE_PHOTOS' : null),
    groups: groups.map(g => ({ key: g.key, photos: g.photos.length, heroRef: g.heroRef })),
    flights, comparisons: cmp.length, comparisonsHiddenJuvJuv: cmpHiddenJuv,
    rendered: seq, renderedOwnCount: ownImages.length, orderIssues: orderCheck(seq),
    exactDuplicatesRendered: [...new Set(dupImages)],
    duplicateSourcesInRegistry: [...new Set(sources.filter((x, i) => sources.indexOf(x) !== i))],
    media: meta,
    htmlLength: html.length,
  });
}
const summary = { checkout: root, species: SPECIES.length, withPhoto: rows.length, withoutPhoto: SPECIES.length - rows.length };
const result = { summary, rows };
if (out) writeFileSync(out, JSON.stringify(result, null, 1));
console.log(JSON.stringify(summary));
