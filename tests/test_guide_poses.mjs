/** Contract checks for guide photo grouping. Browser interaction is covered separately. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
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
  const images = [...html.matchAll(/data-guide-image="([^"]+)"/g)].map(match => match[1]);
  assert.equal(images.length, new Set(images).size, `Duplicate image within Herkenning: ${id}`);
  if (!picturedSpecies.has(id)) continue;
  const hero = guideHeroPhoto(id);
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
assert.deepEqual(photosFor('sp018', 'adult_m'), ['/assets/showcase/sp018.webp']);
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
console.log(`VERIFIED main photos, retained assets, licensed galleries and comparison order across ${picturedSpecies.size} photographed species`);
