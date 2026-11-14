/** Contract checks for guide photo grouping. Browser interaction is covered separately. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { escHtml } from '../src/utils/html.js';
import { guideHeroPhoto, guidePlumageGroups, recognitionPanel, wherePanel } from '../src/features/species/detailSections.js';

const registry = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json', import.meta.url)));
assert.deepEqual(GUIDE_POSES, registry.poses);
assert.deepEqual(GUIDE_HEROES, registry.heroes);
const species = new Map(SPECIES.map(s => [s.id, s]));
const picturedSpecies = new Set([...Object.keys(GUIDE_PHOTOS), ...Object.keys(GUIDE_PLUMAGE), ...Object.keys(GUIDE_POSES)]);
for (const s of SPECIES) {
  const {id} = s;
  const html = recognitionPanel(s);
  const ownGuide = html.split('<section class="sd-similar"')[0];
  const images = [...ownGuide.matchAll(/data-guide-image="([^"]+)"/g)].map(match => match[1]);
  assert.equal(images.length, new Set(images).size, `Duplicate image in own guide sections: ${id}`);
  if (!picturedSpecies.has(id)) continue;
  const hero = guideHeroPhoto(id);
  assert.ok(!images.includes(hero.image), `Hero repeated in own guide sections: ${id}`);
  assert.equal(hero?.latin, s.nameSci, `Wrong or missing main photo: ${id}`);
  const registered = [GUIDE_PHOTOS[id], ...Object.values(GUIDE_PLUMAGE[id] || {}), ...(GUIDE_POSES[id] || [])].filter(photo => photo?.image);
  const shown = new Set([hero.image, ...images]);
  const sources = new Set(registered.filter(photo => shown.has(photo.image)).map(photo => photo.source));
  for (const photo of registered) {
    assert.ok(shown.has(photo.image) || sources.has(photo.source), `Missing original photo: ${id} ${photo.image}`);
    if (images.includes(photo.image)) assert.ok(html.includes(escHtml(photo.source)), `Missing credits: ${photo.image}`);
  }
  const plumage = html.indexOf('class="sd-plumage-list"');
  const flightCompare = html.indexOf('aria-label="Vluchtvergelijking"');
  if (plumage >= 0 && flightCompare >= 0) assert.ok(plumage < flightCompare, `Vluchtvergelijking must follow plumage: ${id}`);
  if (plumage >= 0 && html.includes('>Lijkt op<')) assert.ok(plumage < html.indexOf('>Lijkt op<'), id);
}
const photosFor = (id, key) => guidePlumageGroups(species.get(id)).find(group => group.key === key).photos.map(photo => photo.image);
assert.equal(guideHeroPhoto('sp173').image, '/assets/species/plumage/sp173-hero-male.webp');
assert.deepEqual(photosFor('sp173', 'adult_m'), ['/assets/species/plumage/sp173-male-2.webp']);
assert.deepEqual(photosFor('sp173', 'adult_f'), [
  '/assets/species/plumage/sp173-adult_f.webp',
  '/assets/species/plumage/sp173-female-rest.webp',
]);
assert.deepEqual(photosFor('sp173', 'juv'), ['/assets/species/plumage/sp173-juv.webp']);
assert.ok(photosFor('sp045', 'adult_m').some(image => image.endsWith('-flight.webp')));
assert.equal(guideHeroPhoto('sp043').image, '/assets/species/plumage/sp043-hero-male.webp');
assert.equal(photosFor('sp043', 'adult_m')[0], '/assets/species/plumage/sp043-adult_m.webp');
assert.equal(guideHeroPhoto('sp141').image, '/assets/species/plumage/sp141-adult.webp');
assert.ok(recognitionPanel(species.get('sp009')).includes('Man en vrouw lijken op elkaar'));
// sp128: donsjongen staan sinds de bronaudit van 9-11 niet meer onder Juveniel; het mannetje is de hoofdfoto.
for (const id of ['sp035', 'sp043', 'sp053', 'sp075', 'sp089', 'sp092']) {
  for (const role of ['adult_m', 'adult_f', 'juv']) {
    assert.ok(photosFor(id, role).length, `Missing photo for ${id}: ${role}`);
  }
}
assert.equal(GUIDE_PHOTOS.sp018.sex, 'male');
assert.equal(GUIDE_PHOTOS.sp019.sex, 'male');
assert.deepEqual(photosFor('sp018', 'adult_m'), ['/assets/species/plumage/sp018-hero-male.webp']);
assert.equal(guideHeroPhoto('sp018').image, '/assets/showcase/sp018.webp');
assert.equal(GUIDE_HEROES.sp018, GUIDE_PHOTOS.sp018.image);
assert.equal(GUIDE_PHOTOS.sp018.sex, 'male');
assert.ok(recognitionPanel(species.get('sp018')).includes('/assets/species/plumage/sp018-hero-male.webp'), 'Previously approved male portrait retained in adult_m gallery');
assert.deepEqual(photosFor('sp019', 'adult_m'), ['/assets/species/sp019.webp']);
assert.ok(photosFor('sp018', 'adult_f').length);
assert.deepEqual(photosFor('sp018', 'juv'), ['/assets/species/plumage/sp018-juv-review.webp']);
const juvenile = GUIDE_POSES.sp018.filter(photo => photo.age === 'juvenile');
assert.equal(juvenile.length, 1, 'Juvenile Black Woodpecker must not be duplicated');
assert.equal(juvenile[0].sex, undefined, 'Do not assign uncertain sex to juvenile');
assert.equal(juvenile[0].author, 'Philippe Kurlapski');
assert.equal(juvenile[0].license, 'CC BY 1.0');
assert.equal(juvenile[0].sourceSha1, 'd0d3ff3ba4e7905e88b00a44dae51cc259bdedca');
const juvenileWebp = readFileSync(new URL('../assets/species/plumage/sp018-juv-review.webp', import.meta.url));
assert.equal(juvenileWebp.toString('ascii', 0, 4), 'RIFF');
assert.equal(juvenileWebp.toString('ascii', 8, 12), 'WEBP');
let chunkOffset = 12;
while (chunkOffset + 8 <= juvenileWebp.length) {
  const id = juvenileWebp.toString('ascii', chunkOffset, chunkOffset + 4);
  const len = juvenileWebp.readUInt32LE(chunkOffset + 4);
  assert.ok(!['EXIF', 'XMP ', 'ICCP'].includes(id), 'Metadata chunk must be stripped from the local WebP');
  chunkOffset += 8 + len + (len & 1);
}
assert.equal(chunkOffset, juvenileWebp.length, 'WebP chunks must parse completely');
assert.ok(photosFor('sp019', 'adult_f').length && photosFor('sp019', 'juv').length);
for (const bird of SPECIES) {
  for (const group of guidePlumageGroups(bird)) {
    const keys = group.photos.map(photo => photo.image);
    assert.equal(new Set(keys).size, keys.length, `Duplicate guide photo in ${bird.id} / ${group.key}`);
  }
}
assert.equal(guideHeroPhoto('sp075').image, '/assets/species/plumage/sp075-hero-male.webp');
assert.ok(photosFor('sp075', 'adult_m').includes('/assets/species/plumage/sp075-male-review.webp'));
assert.ok(photosFor('sp050', 'juv').includes('/assets/species/plumage/sp050-juv-review.webp'));
for (const id of ['sp008', 'sp009']) {
  const s = species.get(id);
  assert.ok(wherePanel(s).includes(s.photoTip));
  assert.ok(GUIDE_PLUMAGE[id].juv && GUIDE_AUDIO[id].length);
}
const openQueue = JSON.parse(execFileSync(process.execPath, [
  fileURLToPath(new URL('../tools/species/guide_coverage.mjs', import.meta.url)),
  '--open-photo-roles',
], { encoding: 'utf8' }));
assert.equal(openQueue.openPhotoRoles.length, openQueue.summary.speciesWithOpenPhotoRoles);
assert.ok(openQueue.summary.picturedSpecies >= openQueue.summary.speciesWithOpenPhotoRoles);
const seenQueueIds = new Set();
for (const bird of openQueue.openPhotoRoles) {
  assert.ok(!seenQueueIds.has(bird.id), `Duplicate review queue species: ${bird.id}`);
  seenQueueIds.add(bird.id);
  assert.ok(bird.mainPhoto && bird.missingRoles.length, `Invalid review queue item: ${bird.id}`);
  assert.ok(bird.missingRoles.every(role => ['adult_m', 'adult_f', 'juv'].includes(role)),
    `Unknown sex/age role: ${bird.id}`);
  assert.ok(bird.filledRoles.every(role => !bird.missingRoles.includes(role)),
    `Conflicting role: ${bird.id}`);
}
// Unique active sources — avoid the same underlying bird photo being registered twice
// as a separate gallery/pose image. Explicit reuseGuidePhoto references have no image
// and are permitted. This is NOT a perceptual/near-duplicate image audit.
let uniqueSourceChecks = 0;
for (const id of new Set([...Object.keys(registry.plumage), ...Object.keys(registry.poses)])) {
  const entries = [
    ...Object.values(registry.plumage[id] || {}),
    ...(registry.poses[id] || []),
  ].filter(photo => photo?.image);
  const paths = new Set();
  const sourceUrls = new Set();
  for (const photo of entries) {
    assert.ok(!paths.has(photo.image), `Photo registered twice for ${id}: ${photo.image}`);
    paths.add(photo.image);
    const src = photo.source?.trim().replace(/^http:/, 'https:').replace(/\/$/, '');
    if (src) {
      assert.ok(!sourceUrls.has(src), `Photo source registered twice for ${id}: ${src}`);
      sourceUrls.add(src);
    }
    uniqueSourceChecks++;
  }
}
assert.equal(registry.plumage.sp019.adult_f.label, 'Op de grond');
assert.ok(!registry.poses.sp019.some(photo => photo.image === registry.plumage.sp019.adult_f.image));
console.log(`VERIFIED ${uniqueSourceChecks} registered gallery/pose images without exact source duplication`);

// K08 spechten: de foto's moeten unieke rollen houden; een nestholte-opvliegbeeld is niet automatisch een
// vrije vluchtfoto, en een juveniel kopdetail is geen nieuw geslachtsbewijs.
assert.equal(guideHeroPhoto('sp017').image, '/assets/species/sp017.webp');
assert.equal(guidePlumageGroups(species.get('sp017')).find(g => g.key === 'adult_f')?.photos[0]?.image, '/assets/species/plumage/sp017-female.webp');
assert.ok(!(GUIDE_POSES.sp017 || []).some(p => p.flight), 'Kleine Bonte Specht flight not independently verified');
assert.ok(!GUIDE_PLUMAGE.sp017?.juv, 'No verified juvenile Lesser Spotted Woodpecker image yet');
assert.equal(guideHeroPhoto('sp018').image, '/assets/showcase/sp018.webp');
assert.equal(guideHeroPhoto('sp018').source, GUIDE_PHOTOS.sp018.source);
assert.equal(GUIDE_POSES.sp018.filter(p => p.image === '/assets/species/plumage/sp018-hero-male.webp').length, 1, 'Original male photo is retained exactly once');
assert.ok((GUIDE_POSES.sp018 || []).some(p => p.flight && p.image === '/assets/species/plumage/sp018-flight.webp'));
const sp018Juvenile = (GUIDE_POSES.sp018 || []).filter(p => p.age === 'juvenile');
assert.equal(sp018Juvenile.length, 1);
assert.ok(sp018Juvenile[0].label.includes('kopdetail'), 'Juvenile photo is only head detail');
console.log('K08 sp017/sp018: photo roles and evidence limits retained');
const sp018VisualCompare = recognitionPanel(species.get('sp018'));
const sp017SinglePhoto = recognitionPanel(species.get('sp017'));
// Never advertise a comparison based on text-only or a reference to the hero;
// display the gallery side-by-side only for two actual, distinct role images.
assert.ok(sp018VisualCompare.includes('class="sd-plumage-list" data-layout="compare"'),
  'Zwarte Specht: male/female/juvenile photo comparison must opt into two-up layout');
assert.ok(!sp017SinglePhoto.includes('class="sd-plumage-list" data-layout="compare"'),
  'Kleine Bonte Specht: photos of the same female role plus male hero ref are not two different plumage roles');
const femaleStart = sp018VisualCompare.indexOf('data-plumage="adult_f"');
const juvenileStart = sp018VisualCompare.indexOf('data-plumage="juv"', femaleStart);
const femaleCardHtml = sp018VisualCompare.slice(femaleStart, juvenileStart);
assert.ok(femaleStart >= 0 && juvenileStart > femaleStart, 'Role order must be male / female / juvenile');
assert.ok(femaleCardHtml.indexOf('class="sd-plumage-gallery"') > 0,
  'Female role retains original source image / zoom control');
assert.ok(femaleCardHtml.indexOf('class="sd-plumage-gallery"') <
  femaleCardHtml.indexOf('class="sd-plumage-description"'),
  'Photo must appear before longer description in the compact comparison');
assert.ok(sp018VisualCompare.includes('aria-label="In vlucht"'),
  'Flight images remain in their own section with no fabricated role');
assert.ok(sp018VisualCompare.includes('class="sd-plumage-more"'),
  'Photographic comparison keeps full fieldmark explanations in accessible details');
assert.ok(sp018VisualCompare.includes('class="sd-plumage-other"'),
  'Text-only plumages are retained one tap away rather than consuming photo columns');
assert.ok(sp018VisualCompare.includes('data-plumage="jaarling"'),
  'Black Woodpecker yearling explanation must not be deleted from the guide');
console.log('R10 visual comparison: two distinct source-backed photographed roles required; photo-first, flight and credits retained');

console.log(`VERIFIED main photos, retained assets, licensed galleries and comparison order across ${picturedSpecies.size} photographed species`);

// QA-SPECHTEN-BYTES: different paths/URLs are not enough to catch copies
// saved under a second filename. Compare actual current WebP bytes for the
// two reviewed spechten. This cannot detect perceptual/edited near-duplicates.
const reviewedSpechtenHashes = new Map();
let reviewedSpechtenFiles = 0;
for (const id of ['sp017', 'sp018']) {
  const activePhotos = [
    GUIDE_PHOTOS[id],
    ...Object.values(GUIDE_PLUMAGE[id] || {}),
    ...(GUIDE_POSES[id] || []),
  ].filter(photo => photo?.image);
  for (const photo of activePhotos) {
    assert.match(photo.image, /^\/assets\//, `Unexpected photo path: ${id}`);
    const data = readFileSync(new URL('..' + photo.image, import.meta.url));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF', `Invalid WebP: ${photo.image}`);
    assert.equal(data.toString('ascii', 8, 12), 'WEBP', `Invalid WebP: ${photo.image}`);
    const digest = createHash('sha256').update(data).digest('hex');
    assert.ok(!reviewedSpechtenHashes.has(digest),
      `Identical file bytes under separate photo entries: ${reviewedSpechtenHashes.get(digest)} / ${photo.image}`);
    reviewedSpechtenHashes.set(digest, photo.image);
    reviewedSpechtenFiles++;
  }
}
assert.ok(reviewedSpechtenFiles >= 8, 'Expected baseline of 8 individually reviewed sp017/sp018 files');

const f215Juveniles = GUIDE_COMPARISONS.find(entry => entry.label === 'Goudhaantje en Vuurgoudhaan · juvenielen');
assert.ok(f215Juveniles, 'F2-15: juvenielenvergelijking ontbreekt');
assert.deepEqual(f215Juveniles.birds.map(bird => [bird.id, bird.plumage]), [
  ['sp063', 'juv'], ['sp064', 'juv'],
]);
for (const id of ['sp063', 'sp064']) {
  const f215Markup = recognitionPanel(species.get(id));
  assert.ok(f215Markup.includes('sp063-juv.webp'), `F2-15: Goudhaantje-juveniel niet zichtbaar vanaf ${id}`);
  assert.ok(f215Markup.includes('sp064-juv.webp'), `F2-15: Vuurgoudhaan-juveniel niet zichtbaar vanaf ${id}`);
  assert.ok(!f215Markup.includes('data-cmp-tab aria-selected="true">In vlucht · Juveniel'),
    `F2-15: juvenielvergelijking onterecht als vlucht geclassificeerd bij ${id}`);
}
assert.match(species.get('sp035').fieldmarks, /Twee lichte vleugelstrepen/);
assert.match(species.get('sp035').fieldmarks, /vrouwtje en jong/);
assert.match(species.get('sp036').fieldmarks, /Stevige kegelvormige snavel/);
assert.match(species.get('sp036').fieldmarks, /juveniel grijzer/);
console.log('F2-15: juveniele vergelijking beide richtingen, portretten en kleedneutrale kenmerken structureel gecontroleerd; visuele bronverificatie blijft apart');


const expectedF216 = [
  ['Putter en Sijs · mannetjes in rust', [['sp037', 'adult_m'], ['sp038', 'adult_m']]],
  ['Putter en Sijs · juvenielen in rust', [['sp037', 'juv'], ['sp038', 'juv']]],
  ['Goudvink en Vink · vrouwtjes in rust', [['sp040', 'adult_f'], ['sp035', 'adult_f']]],
];
for (const [label, expectedBirds] of expectedF216) {
  const cmp = GUIDE_COMPARISONS.find(entry => entry.label === label);
  assert.ok(cmp, `F2-16 comparison missing: ${label}`);
  assert.deepEqual(cmp.birds.map(bird => [bird.id, bird.plumage]), expectedBirds, label);
  assert.ok(!cmp.flight, `F2-16 comparison must use perched/resting photographs: ${label}`);
}
for (const id of ['sp037', 'sp038']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp037-juv.webp') && html.includes('sp038-juv.webp'),
    `F2-16 juvenile portraits must appear side by side from ${id}`);
  assert.ok(html.includes('sp037-adult_m.webp') && html.includes('sp038.webp'),
    `F2-16 adult perched comparison must use registered images from ${id}`);
}
for (const id of ['sp040', 'sp035']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp040-adult_f.webp') && html.includes('sp035-adult_f.webp'),
    `F2-16 female comparison must use two original registered photo references: ${id}`);
}
console.log('F2-16: adult and juvenile perched Putter/Sijs, female Goudvink/Vink both directions present, flight optional without fake images');


const f217Pairs = [
  ['Kneu en Roodmus · mannetjes in rust', [['sp039', undefined], ['sp042', undefined]]],
  ['Appelvink en Vink · vrouwtjes in rust', [['sp041', 'adult_f'], ['sp035', 'adult_f']]],
  ['Appelvink en Vink · juvenielen in rust', [['sp041', 'juv'], ['sp035', 'juv']]],
];
for (const [label, expected] of f217Pairs) {
  const entry = GUIDE_COMPARISONS.find(c => c.label === label);
  assert.ok(entry && !entry.flight, 'F2-17 missing perched comparison: ' + label);
  assert.deepEqual(entry.birds.map(b => [b.id, b.plumage]), expected, label);
  assert.equal(entry.birds.length, 2, 'F2-17: both photos required: ' + label);
  assert.ok(entry.rows?.length >= 2, 'F2-17: paired field marks required: ' + label);
}
for (const id of ['sp039', 'sp042']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp039.webp') && html.includes('sp042.webp'),
    'F2-17: two registered male portraits missing for ' + id);
}
for (const id of ['sp041', 'sp035']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp041-adult_f.webp') && html.includes('sp035-adult_f.webp'),
    'F2-17: female pair missing for ' + id);
  assert.ok(html.includes('sp041-juv.webp') && html.includes('sp035-juv-review.webp'),
    'F2-17: juvenile pair missing for ' + id);
}
assert.match(species.get('sp039').fieldmarks, /vrouwtjes en jongen/);
assert.match(species.get('sp041').fieldmarks, /zware kegelsnavel/);
assert.match(species.get('sp042').fieldmarks, /onvolwassen mannetje/);
assert.match(species.get('sp042').distribution, /Hollandse kust/);
const vinkJuvenilePose = GUIDE_POSES.sp035?.find(p => p.age === 'juvenile' && !p.flight);
assert.ok(vinkJuvenilePose?.image === '/assets/species/plumage/sp035-juv-review.webp',
  'F2-17: must refer to the actual registered Vink juvenile pose photo');
assert.ok(vinkJuvenilePose?.author && vinkJuvenilePose?.license && vinkJuvenilePose?.source,
  'F2-17: juveniele pose moet oorspronkelijke fotograaf, licentie en bron hebben');
console.log('F2-17: three paired resting comparisons and VBN text; original-to-WebP inspection remains NOT TESTED');


const f218Pairs = [
  ['Huismusvrouwtje en Ringmus · in rust', [['sp043', 'adult_f'], ['sp044', undefined]]],
  ['Huismus en Ringmus · juvenielen in rust', [['sp043', 'juv'], ['sp044', 'juv']]],
  ['Merel en Zanglijster · juvenielen in rust', [['sp045', 'juv'], ['sp046', 'juv']]],
];
for (const [label, roles] of f218Pairs) {
  const entry = GUIDE_COMPARISONS.find(c => c.label === label);
  assert.ok(entry && !entry.flight, 'F2-18: comparison must use resting photos: ' + label);
  assert.deepEqual(entry.birds.map(b => [b.id, b.plumage]), roles, label);
  assert.ok(entry.rows?.length >= 2 && entry.birds.length === 2);
}
for (const id of ['sp043', 'sp044']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp043.webp') && html.includes('sp044.webp'), 'F2-18: paired female House Sparrow and non-sexed Tree Sparrow photo missing');
  assert.ok(html.includes('sp043-juv-review.webp') && html.includes('sp044-juv.webp'), 'F2-18: juvenile sparrow resting pair missing');
}
for (const id of ['sp045', 'sp046']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp045-juv.webp') && html.includes('sp046-juv.webp'), 'F2-18: juvenile Blackbird/Song Thrush pair missing');
}
const f218MerelFlights = (GUIDE_POSES.sp045 || []).filter(p => p.flight);
assert.ok(f218MerelFlights.every(p => /^voorwaardelijk/.test(p.flightReview || '')),
  'F2-18: pre-existing Merel free-flight not independently promoted to approved');
assert.match(species.get('sp043').fieldmarks, /Juveniel lijkt op vrouwtje/);
assert.match(species.get('sp044').fieldmarks, /Mannetje en vrouwtje zien er hetzelfde uit/);
assert.match(species.get('sp045').fieldmarks, /Jonge Merel/);
console.log('F2-18: two juvenile/rest pairs plus female House Sparrow/Tree Sparrow; no new or re-approved flight photo');


const f219Pairs = [
  ['Zanglijster en Kramsvogel · volwassen in rust', [['sp046', undefined], ['sp047', undefined]]],
  ['Zanglijster en Kramsvogel · juvenielen in rust', [['sp046', 'juv'], ['sp047', 'juv']]],
];
for (const [label, expected] of f219Pairs) {
  const cmp = GUIDE_COMPARISONS.find(pair => pair.label === label);
  assert.ok(cmp && cmp.flight !== true, 'F2-19: rustfotovergelijking ontbreekt: ' + label);
  assert.deepEqual(cmp.birds.map(b => [b.id, b.plumage]), expected, label);
  assert.equal(cmp.birds.length, 2, 'F2-19: two independent photos per pair required: ' + label);
  assert.equal(cmp.rows?.length, 3, 'F2-19: three grounded contrast rows required: ' + label);
}
for (const id of ['sp046', 'sp047']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp046.webp') && html.includes('sp047.webp'),
    'F2-19 adult Zanglijster/Kramsvogel resting pair must contain both registered photos, from ' + id);
  assert.ok(html.includes('sp046-juv.webp') && html.includes('sp047-juv.webp'),
    'F2-19 juvenile Zanglijster/Kramsvogel resting pair must contain both registered images, from ' + id);
}
const kop = GUIDE_COMPARISONS.find(e => e.label === 'Kramsvogel en Koperwiek · volwassen');
const zg = GUIDE_COMPARISONS.find(e => e.label === 'Koperwiek en Zanglijster · volwassen');
assert.ok(kop?.rows.some(r => r.label === 'Borstgrondkleur'));
assert.ok(zg?.rows.some(r => r.label === 'Flanken'));
assert.equal((GUIDE_POSES.sp048 || []).filter(p => p.flight).length, 0,
  'F2-19: opvliegende Koperwiek mag niet als vrij-vluchtfoto worden gepresenteerd');
assert.ok((GUIDE_POSES.sp046 || []).some(p => p.flight && /^goedgekeurd/.test(p.flightReview || '')));
assert.ok((GUIDE_POSES.sp047 || []).some(p => p.flight && /^goedgekeurd/.test(p.flightReview || '')));
assert.match(species.get('sp046').fieldmarks, /pijlpuntige/);
assert.match(species.get('sp047').size.length, /22–27/);
assert.equal(species.get('sp048').months, 'sep-mei');
assert.equal(species.get('sp048').breeding, 'nee');
console.log('F2-19: two resting adult/juvenile pairs, two refined comparisons and no new flight claims');


const sourceVisibilitySpecies = ['sp057', 'sp045', 'sp050', 'sp046'];
for (const id of sourceVisibilitySpecies) {
  const card = recognitionPanel(species.get(id));
  assert.ok(!card.includes('class="sd-source"') && !card.includes('Kenmerken: <a'),
    'Owner source visibility: unexpected optional source label in recognition card ' + id);
  assert.ok(!card.includes('Broncontrole van deze gidskaart volgt'),
    'Owner source visibility: source placeholder visible for ' + id);
}
const protectedPhotoCredit = recognitionPanel(species.get('sp045'));
assert.ok(protectedPhotoCredit.includes('photo-info__panel') &&
  protectedPhotoCredit.includes('Maker:') &&
  protectedPhotoCredit.includes('Licentie:') &&
  protectedPhotoCredit.includes('Open fotobron'),
  'Owner source visibility: mandatory photo author, licence and original reference must remain accessible');
const protectedAudioCredit = recognitionPanel(species.get('sp057'));
assert.ok(protectedAudioCredit.includes('sd-media-credit') &&
  protectedAudioCredit.includes('creativecommons.org'),
  'Owner source visibility: recorded audio licence/creator attribution must remain available');
const protectedMapCredit = wherePanel(species.get('sp057'));
assert.ok(protectedMapCredit.includes('eBird via GBIF') &&
  protectedMapCredit.includes('CC BY 4.0') &&
  protectedMapCredit.includes('Natural Earth'),
  'Owner source visibility: external distribution map data attribution must remain visible');
console.log('Owner source visibility: optional bird information citations hidden; mandatory photo/audio/map credits preserved');


const f220Pairs = [
  ['Zanglijster en Grote Lijster · juvenielen in rust', [['sp046', 'juv'], ['sp049', 'juv']]],
  ['Roodborst en Roodborsttapuit · juvenielen in rust', [['sp050', 'juv'], ['sp053', 'juv']]],
  ['Zwarte en Gekraagde Roodstaart · mannetjes in rust', [['sp051', 'adult_m'], ['sp178', 'adult_m']]],
];
for (const [label, expectedBirds] of f220Pairs) {
  const cmp = GUIDE_COMPARISONS.find(entry => entry.label === label);
  assert.ok(cmp, 'F2-20: missing paired comparison: ' + label);
  assert.ok(!cmp.flight && cmp.rows?.length === 3, 'F2-20: three resting fieldmark rows required: ' + label);
  assert.deepEqual(cmp.birds.map(b => [b.id, b.plumage]), expectedBirds, label);
}
for (const id of ['sp046', 'sp049']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp046-juv.webp') && html.includes('sp049-juv.webp'),
    'F2-20: original juvenile Song/Mistle Thrush pair must be available from ' + id);
}
for (const id of ['sp050', 'sp053']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp050-juv-review.webp') && html.includes('sp053-juv-review.webp'),
    'F2-20: age-specific Robin/Stonechat photos must appear together from ' + id);
}
for (const id of ['sp051', 'sp178']) {
  const html = recognitionPanel(species.get(id));
  assert.ok(html.includes('sp051-hero-male.webp') && html.includes('sp178.webp'),
    'F2-20: source-registered adult male Black/Common Redstart photos must appear together from ' + id);
}
const femaleRedstart = GUIDE_COMPARISONS.find(e => e.label === 'Gekraagde en Zwarte Roodstaart · vrouwtje');
assert.ok(femaleRedstart?.rows.some(row => row.label === 'Staart' &&
  row.values.every(value => value.includes('niet diagnostisch'))),
  'F2-20: shared rust-red tail must not be described as sufficient female distinction');
assert.match(species.get('sp049').fieldmarks, /witte hoekjes/);
assert.match(species.get('sp050').fieldmarks, /mannetje en vrouwtje zien er hetzelfde uit/);
assert.match(species.get('sp051').fieldmarks, /Gekraagde Roodstaart/);
assert.equal((GUIDE_POSES.sp049 || []).filter(photo => photo.flight).length, 0);
assert.equal((GUIDE_POSES.sp050 || []).filter(photo => photo.flight).length, 0);
assert.equal((GUIDE_POSES.sp051 || []).filter(photo => photo.flight).length, 0);
console.log('F2-20: three registered resting pairs, accurate plumage/sex labels, no newly accepted flight photos');

console.log(`QA-SPECHTEN-BYTES: ${reviewedSpechtenFiles} current files have distinct WebP bytes; near-duplicates NOT PROVEN`);
