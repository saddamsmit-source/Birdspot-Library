import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SPECIES } from '../../src/data/species.js';
import { GUIDE_PHOTOS } from '../../src/features/species/guidePhotos.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../../src/features/species/guideComparisons.js';

const species = new Map(SPECIES.map(bird => [bird.id, bird]));

function checkMedia(media, path) {
  assert.ok(path?.startsWith('/assets/'), `Ontbrekend lokaal mediapad: ${path}`);
  assert.ok(existsSync(new URL('../..' + path, import.meta.url)), `Ontbrekend bestand: ${path}`);
  assert.ok(media.author && media.license && media.licenseUrl?.startsWith('https://') &&
    media.source?.startsWith('https://'), `Onvolledige bronvermelding: ${path}`);
}

function checkPhoto(id, photo) {
  assert.equal(photo?.latin, species.get(id)?.nameSci, `Verkeerde of ontbrekende foto: ${id}`);
  checkMedia(photo, photo.image);
}

for (const [id, photo] of Object.entries(GUIDE_PHOTOS)) checkPhoto(id, photo);
for (const [id, photos] of Object.entries(GUIDE_POSES)) {
  assert.ok(photos.length > 0 && photos.length <= 2, `Maximaal twee houdingsfoto's: ${id}`);
  for (const photo of photos) {
    assert.ok(photo.label && photo.note, `Ontbrekend houdingslabel: ${id}`);
    checkPhoto(id, photo);
  }
}
for (const [id, cards] of Object.entries(GUIDE_PLUMAGE)) {
  for (const [plumage, photo] of Object.entries(cards)) {
    assert.ok(species.get(id)?.plumage?.[plumage], `Kleedkaart ontbreekt: ${id} ${plumage}`);
    checkPhoto(id, photo.reuseGuidePhoto ? GUIDE_PHOTOS[id] : photo);
  }
}
for (const [id, clips] of Object.entries(GUIDE_AUDIO)) {
  assert.ok(species.has(id), `Onbekende soort bij opname: ${id}`);
  for (const clip of clips) checkMedia(clip, clip.audio);
}
for (const {birds, tip, flight} of GUIDE_COMPARISONS) {
  assert.ok(tip && (birds.length === 2 || (flight && birds.length === 3)) &&
    new Set(birds.map(bird => bird.id)).size === birds.length, 'Ongeldige vergelijking');
  for (const bird of birds) {
    const {id, plumage} = bird;
    assert.ok(bird.source && bird.marks && species.has(id), `Ongeldige vergelijking: ${id}`);
    if (flight) {
      const photo = GUIDE_POSES[id]?.find(pose => pose.flight);
      checkPhoto(id, photo);
      assert.notEqual(photo.image, GUIDE_PHOTOS[id]?.image, `Vluchtfoto is hoofdfoto: ${id}`);
      continue;
    }
    if (bird.textOnly === true) continue;
    const photo = GUIDE_PLUMAGE[id]?.[plumage];
    checkPhoto(id, !plumage || photo?.reuseGuidePhoto ? GUIDE_PHOTOS[id] : photo);
  }
}

const rows = SPECIES.map(bird => {
  const plumagePhotos = Object.keys(GUIDE_PLUMAGE[bird.id] || {});
  return {
    id: bird.id,
    name: bird.nameNL,
    latin: bird.nameSci,
    group: bird.family,
    status: bird.category,
    documentedReview: bird.guideReview?.date ?? null,
    guidePhoto: Boolean(GUIDE_PHOTOS[bird.id]),
    poses: (GUIDE_POSES[bird.id] || []).map(photo => photo.label),
    plumagePhotos,
    plumageWithoutPhoto: Object.keys(bird.plumage || {}).filter(kind =>
      bird.plumage[kind] && !plumagePhotos.includes(kind)),
    recordings: (GUIDE_AUDIO[bird.id] || []).map(clip => clip.label),
    comparisons: GUIDE_COMPARISONS.filter(pair => pair.birds.some(member => member.id === bird.id)).length,
  };
});

const summary = {
  species: rows.length,
  documentedReviews: rows.filter(bird => bird.documentedReview).length,
  guidePhotos: rows.filter(bird => bird.guidePhoto).length,
  speciesWithPoses: rows.filter(bird => bird.poses.length).length,
  speciesWithPlumagePhotos: rows.filter(bird => bird.plumagePhotos.length).length,
  plumagePhotos: rows.flatMap(bird => bird.plumagePhotos).length,
  speciesWithRecordings: rows.filter(bird => bird.recordings.length).length,
  recordings: rows.flatMap(bird => bird.recordings).length,
  speciesWithComparisons: rows.filter(bird => bird.comparisons).length,
  comparisons: GUIDE_COMPARISONS.length,
};
console.log(JSON.stringify(process.argv.includes('--summary') ? summary : {summary, species: rows}, null, 2));
