/** R35: current F3 inventory, source ceilings and reciprocal comparison regression. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';
import { SPECIES } from '../src/data/species.js';

const read = name => readFileSync(new URL(name, import.meta.url));
const json = name => JSON.parse(read(name));
const index = json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const similar = json('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const audio = json('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const focus = ['sp143', 'sp144', 'sp145'];
const byId = new Map(SPECIES.map(s => [s.id, s]));
const panels = new Map([...focus, 'sp098', 'sp099', 'sp205'].map(id => [id, recognitionPanel(byId.get(id))]));
const records = index.records.filter(row => row.F3.recheckBatch === 'F3-R35');
assert.deepEqual(records.map(row => row.id), focus);
assert.deepEqual(records.map(row => row.F3.photoFilesInspected), [6, 4, 4]);
assert.deepEqual(records.map(row => row.F3.reviewedOriginalAudio), [0, 3, 3]);
assert.deepEqual(records.map(row => row.historic.oldAssetCount), [6, 0, 0]);
const nextIndex = index.records.findIndex(row => row.id === 'sp145') + 1;
assert.deepEqual(index.records.slice(nextIndex, nextIndex + 3).map(row => row.id),
  ['sp146', 'sp147', 'sp148']);
assert.equal(index.counts.thirtyFifthBatchStarted, 3);

for (const row of records) {
  const { id, F3, currentAssets } = row;
  const ledger = audio.species.find(item => item.id === id);
  assert.equal(F3.status, 'IN CONTENT REVIEW / OPEN POINTS');
  assert.equal(F3.fullPass, false);
  assert.match(F3.checks.independentSecondReview, /^NOT TESTED/);
  assert.equal(currentAssets.imageSlots[0].path, guideHeroPhoto(id).image);
  for (const [i, slot] of currentAssets.imageSlots.entries()) {
    const bytes = read('..' + slot.path);
    const digest = createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
    assert.equal(F3.photoBlobSHAs[i], digest, slot.path);
  }
  assert.deepEqual(F3.audioSourceMatches.map(item => item.path), currentAssets.existingAudioPaths);
  assert.deepEqual(ledger.clips.map(item => item.file), currentAssets.existingAudioPaths);
  assert.equal(ledger.status, id === 'sp143' ? 'MISSING' : 'PARTIALLY TESTED');
  for (const [i, match] of F3.audioSourceMatches.entries()) {
    const clip = GUIDE_AUDIO[id][i];
    assert.equal(match.source, clip.source);
    assert.equal(match.sourceLicense, clip.license);
    assert.match(match.sourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(match.localSha256, createHash('sha256').update(read('..' + match.path)).digest('hex'));
    assert.equal(match.offsetSeconds, 0);
    assert.ok(match.normalizedCorrelation >= 0.96 && match.sourceSeconds >= match.matchedSeconds);
    assert.ok(Math.abs(match.matchedSeconds - match.localSeconds) < 0.001);
    assert.match(clip.verification, /^PARTIALLY TESTED/);
    assert.equal(ledger.clips[i].independentReview, 'NOT TESTED');
    assert.equal(ledger.clips[i].roleAudition, 'NOT TESTED');
  }
  assert.equal((panels.get(id).match(/<audio /g) || []).length, currentAssets.existingAudioCount);
  assert.ok(!panels.get(id).includes('Status: Bevestigd'));
}

const plovers = GUIDE_COMPARISONS.filter(c => c.birds.length === 2 && c.birds.every(b => ['sp144', 'sp145'].includes(b.id)));
assert.equal(plovers.length, 3, 'The current Goudplevier photo must not be used to show the pale axilla');
for (const [i, role] of ['breeding', 'winter', 'juv'].entries()) {
  const pair = plovers[i];
  assert.equal(Boolean(pair.flight), false);
  assert.ok(pair.birds.every(bird => bird.plumage === role));
  assert.equal(pair.rows.length, 2);
  for (const bird of pair.birds) {
    const image = comparisonPhoto(bird, false).image;
    assert.equal(image, role === 'breeding' ? '/assets/species/' + bird.id + '.webp' : '/assets/species/plumage/' + bird.id + '-' + role + '.webp');
  }
}
assert.match(plovers[1].tip, /zwarte oksels en Goudplevier lichte oksels/);
assert.match(plovers[2].tip, /Gele spikkels komen bij beide voor/);
assert.match(byId.get('sp144').fieldmarks, /bij goed zicht op de ondervleugel/);
assert.match(GUIDE_POSES.sp144[0].visualCheck, /zwarte oksel/);
assert.match(GUIDE_POSES.sp145[0].note, /niet zichtbaar/);
assert.equal(GUIDE_PLUMAGE.sp143.adult_m.sex, 'male');
assert.equal(GUIDE_PLUMAGE.sp143.adult_f.sex, 'female');
assert.equal(GUIDE_PLUMAGE.sp099.adult_m.author, 'Andreas Trepte, www.avi-fauna.info');

const ids = ['LK-074', 'LK-075', 'LK-076', 'LK-077', 'LK-078', 'LK-079'];
assert.deepEqual(similar.pairs.filter(pair => ids.includes(pair.id)).map(pair => pair.id), ids);
for (const [own, other] of [['sp143', 'sp098'], ['sp143', 'sp205'], ['sp144', 'sp145'], ['sp144', 'sp099']]) {
  assert.match(panels.get(own), new RegExp('data-compare-species="' + other + '"'));
  assert.match(panels.get(other), new RegExp('data-compare-species="' + own + '"'));
}
const stilt = GUIDE_COMPARISONS.find(c => c.birds.some(bird => bird.id === 'sp205') && c.birds.some(bird => bird.id === 'sp143'));
assert.equal(stilt.reciprocalText, true);
assert.ok(stilt.birds.every(bird => bird.photoMissing && comparisonPhoto(bird, false) === null));
console.log('F3-R35 PASS: 14 local photo digests, 6 aligned audio files, 5 real photo comparisons and 1 reciprocal text pair.');
