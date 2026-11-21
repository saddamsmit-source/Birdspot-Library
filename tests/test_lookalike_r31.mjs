/** F3-R31 cohort history, existing media and the real guide render. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const f3 = load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const lookalikes = load('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const species = new Map(SPECIES.map(bird => [bird.id, bird]));
const render = id => recognitionPanel(species.get(id));
const ids = ['sp113', 'sp114', 'sp115'];
const reviews = f3.records.filter(row => row.F3.recheckBatch === 'F3-R31');

assert.deepEqual(reviews.map(row => row.id), ids);
assert.equal(f3.counts.thirtyFirstBatchStarted, ids.length);
assert.ok(f3.counts.contentInspected >= 93);
assert.ok(f3.counts.nextNotStarted <= 47);
assert.deepEqual(reviews.map(row => row.historic.oldAssetCount), [0, 5, 4]);
assert.deepEqual(reviews.map(row => row.currentAssets.imageSlots.length), [2, 5, 4]);
assert.equal(reviews[0].historic.audited, false);

for (const { id, currentAssets, F3 } of reviews) {
  const ownGallery = render(id).split('<section class="sd-similar"')[0];
  const paths = [guideHeroPhoto(id).image,
    ...Array.from(ownGallery.matchAll(/data-guide-image="([^"]+)"/g), item => item[1])];
  assert.equal(paths.length, new Set(paths).size, id + ' shows the same guide photo twice');
  assert.deepEqual(paths, currentAssets.imageSlots.map(slot => slot.path));
  assert.equal(F3.photoFilesInspected, paths.length);
  assert.deepEqual(paths.map(path => {
    const bytes = readFileSync(new URL('..' + path, import.meta.url));
    return createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
  }), F3.photoBlobSHAs, id + ' evidenced image bytes changed');
  assert.equal(GUIDE_POSES[id].filter(photo => photo.flight).length, 1);
  assert.equal(GUIDE_AUDIO[id]?.length ?? 0, 0);
  assert.equal(currentAssets.existingAudioCount, 0);
  assert.equal(F3.reviewedOriginalAudio, 0);
  assert.doesNotMatch(render(id), /<audio\b|sd-audio-credits/);
  assert.equal(F3.fullPass, false);
}

assert.match(species.get('sp113').plumage.juv, /gestreepte onderzijde.*vale snavel/);
assert.match(guideHeroPhoto('sp113').modifications, /Verkleind.*WebP.*zonder uitsnede/);
assert.equal(GUIDE_PLUMAGE.sp114.adult_f.sex, 'female');
assert.equal(GUIDE_PLUMAGE.sp115.adult_m.sex, undefined, 'shared adult label must stay neutral');

const swallows = GUIDE_COMPARISONS.filter(pair => pair.birds.length === 2 &&
  ['sp114', 'sp115'].every(id => pair.birds.some(bird => bird.id === id)));
assert.equal(swallows.length, 3);
assert.deepEqual(swallows.map(pair => pair.birds.map(bird => comparisonPhoto(bird, Boolean(pair.flight))?.image)), [
  ['/assets/species/plumage/sp114-hero-male.webp', '/assets/species/plumage/sp115-hero-adult.webp'],
  ['/assets/species/plumage/sp114-juv.webp', '/assets/species/plumage/sp115-juv.webp'],
  ['/assets/species/plumage/sp114-flight.webp', '/assets/species/plumage/sp115-flight.webp'],
]);
assert.deepEqual(swallows.map(pair => pair.rows.length), [2, 2, 3]);
assert.match(swallows[2].rows[0].values[1], /wit/);

for (const [registryId, first, second] of [['LK-060', 'sp113', 'sp019'], ['LK-062', 'sp115', 'sp116']]) {
  const record = lookalikes.pairs.find(pair => pair.id === registryId);
  assert.deepEqual(record.birds, [first, second]);
  assert.equal(record.photoState, 'MISSING_VERIFIED_PAIR');
  for (const [own, other] of [[first, second], [second, first]]) {
    const html = render(own);
    const targets = [...html.matchAll(/<div class="sd-cmp-panel"[^>]*>.*?data-compare-species="(sp\d+)"/gs)]
      .map(match => match[1]);
    assert.ok(html.includes('data-compare-species="' + other + '"'), own + ' missing reciprocal field text');
    assert.ok(!targets.includes(other), own + ' has an unsupported photo pair');
  }
}
assert.deepEqual(lookalikes.pairs.find(pair => pair.id === 'LK-061').birds, ['sp114', 'sp115']);
console.log('F3-R31: 11 evidenced WebPs, 0 local recordings, 3 swallow photo panels, 2 reciprocal text comparisons, no full pass.');
