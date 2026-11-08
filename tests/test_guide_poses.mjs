/** Contract checks for guide photo grouping. Browser interaction is covered separately. */
import assert from 'node:assert/strict';
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
  const photosOutsideComparison = html.replace(/<section class="sd-plumage-comparison".*?<\/section>/gs, '');
  const images = [...photosOutsideComparison.matchAll(/data-guide-image="([^"]+)"/g)].map(match => match[1]);
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
  for (const section of ['Kleden vergelijken', 'Vluchtvergelijking']) {
    const comparison = html.indexOf(`aria-label="${section}"`);
    if (plumage >= 0 && comparison >= 0) assert.ok(plumage < comparison, `${section} must follow plumage: ${id}`);
  }
  if (plumage >= 0 && html.includes('>Lijkt op<')) assert.ok(plumage < html.indexOf('>Lijkt op<'), id);
}
const photosFor = (id, key) => guidePlumageGroups(species.get(id)).find(group => group.key === key).photos.map(photo => photo.image);
assert.equal(guideHeroPhoto('sp173').image, '/assets/species/sp173.webp');
assert.deepEqual(photosFor('sp173', 'adult_f'), [
  '/assets/species/plumage/sp173-adult_f.webp',
  '/assets/species/plumage/sp173-female-rest.webp',
]);
assert.deepEqual(photosFor('sp173', 'juv'), ['/assets/species/plumage/sp173-juv.webp']);
assert.ok(photosFor('sp045', 'adult_m').some(image => image.endsWith('-flight.webp')));
assert.equal(guideHeroPhoto('sp043').image, '/assets/species/plumage/sp043-adult_m.webp');
assert.equal(guideHeroPhoto('sp141').image, '/assets/species/plumage/sp141-adult.webp');
assert.ok(recognitionPanel(species.get('sp009')).includes('Man en vrouw lijken op elkaar'));
for (const id of ['sp035', 'sp043', 'sp053', 'sp075', 'sp089', 'sp092', 'sp128']) {
  for (const role of ['adult_m', 'adult_f', 'juv']) {
    assert.ok(photosFor(id, role).length, `Missing photo for ${id}: ${role}`);
  }
}
assert.equal(guideHeroPhoto('sp075').image, '/assets/species/plumage/sp075-male-review.webp');
assert.ok(photosFor('sp050', 'juv').includes('/assets/species/plumage/sp050-juv-review.webp'));
for (const id of ['sp008', 'sp009']) {
  const s = species.get(id);
  assert.ok(wherePanel(s).includes(s.photoTip));
  assert.ok(GUIDE_PLUMAGE[id].juv && GUIDE_AUDIO[id].length);
}
console.log(`VERIFIED main photos, retained assets, licensed galleries and comparison order across ${picturedSpecies.size} photographed species`);
