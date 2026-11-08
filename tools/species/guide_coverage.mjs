import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SPECIES } from '../../src/data/species.js';
import { GUIDE_PHOTOS } from '../../src/features/species/guidePhotos.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../../src/features/species/guideComparisons.js';
import { guideHeroPhoto, guidePlumageGroups } from '../../src/features/species/detailSections.js';

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
  assert.ok(photos.length && new Set(photos.map(photo => photo.image)).size === photos.length,
    `Dubbele of lege houdingsfoto’s: ${id}`);
  for (const photo of photos) {
    assert.ok(photo.label && photo.note, `Ontbrekend houdingslabel: ${id}`);
    assert.ok(!photo.sex || ['male', 'female'].includes(photo.sex), `Ongeldig geslachtslabel: ${id}`);
    assert.ok(!photo.age || ['adult', 'juvenile'].includes(photo.age), `Ongeldig leeftijdslabel: ${id}`);
    checkPhoto(id, photo);
  }
}
for (const [id, cards] of Object.entries(GUIDE_PLUMAGE)) {
  for (const [plumage, photo] of Object.entries(cards)) {
    assert.ok(species.get(id)?.plumage?.[plumage], `Kleedkaart ontbreekt: ${id} ${plumage}`);
    checkPhoto(id, photo.reuseGuidePhoto ? GUIDE_PHOTOS[id] : photo);
  }
}
for (const [id, image] of Object.entries(GUIDE_HEROES)) {
  const hero = guideHeroPhoto(id);
  assert.equal(hero?.image, image, `Onbekende hoofdfoto: ${id}`);
  checkPhoto(id, hero);
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

const roles = ['adult_m', 'adult_f', 'juv'];
const rows = SPECIES.map(bird => {
  const groupedPhotos = Object.fromEntries(guidePlumageGroups(bird)
    .filter(group => roles.includes(group.key) && group.photos.length)
    .map(group => [group.key, [...new Set(group.photos.map(photo => photo.image))]]));
  const mainPhoto = guideHeroPhoto(bird.id)?.image ?? null;
  const plumagePhotos = Object.keys(GUIDE_PLUMAGE[bird.id] || {});
  return {
    id: bird.id,
    name: bird.nameNL,
    latin: bird.nameSci,
    group: bird.family,
    status: bird.category,
    documentedReview: bird.guideReview?.date ?? null,
    guidePhoto: Boolean(GUIDE_PHOTOS[bird.id]),
    mainPhoto,
    groupedPhotos,
    unfilledPhotoRoles: mainPhoto ? roles.filter(role => !groupedPhotos[role]) : [],
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
  speciesWithMainPhoto: rows.filter(bird => bird.mainPhoto).length,
  speciesWithAllPhotoRoles: rows.filter(bird => roles.every(role => bird.groupedPhotos[role])).length,
  speciesWithPoses: rows.filter(bird => bird.poses.length).length,
  speciesWithPlumagePhotos: rows.filter(bird => bird.plumagePhotos.length).length,
  plumagePhotos: rows.flatMap(bird => bird.plumagePhotos).length,
  speciesWithRecordings: rows.filter(bird => bird.recordings.length).length,
  recordings: rows.flatMap(bird => bird.recordings).length,
  speciesWithComparisons: rows.filter(bird => bird.comparisons).length,
  comparisons: GUIDE_COMPARISONS.length,
};
if (process.argv.includes('--open-photo-roles')) {
  const openPhotoRoles = rows
    .filter(bird => bird.mainPhoto && bird.unfilledPhotoRoles.length)
    .sort((a, b) => a.unfilledPhotoRoles.length - b.unfilledPhotoRoles.length || a.id.localeCompare(b.id))
    .map(bird => ({
      id: bird.id,
      name: bird.name,
      latin: bird.latin,
      mainPhoto: bird.mainPhoto,
      filledRoles: roles.filter(role => bird.groupedPhotos[role]),
      missingRoles: bird.unfilledPhotoRoles,
    }));
  console.log(JSON.stringify({
    summary: {picturedSpecies: rows.filter(bird => bird.mainPhoto).length, speciesWithOpenPhotoRoles: openPhotoRoles.length},
    openPhotoRoles,
  }, null, 2));
} else {
  console.log(JSON.stringify(process.argv.includes('--summary') ? summary : {summary, species: rows}, null, 2));
}
