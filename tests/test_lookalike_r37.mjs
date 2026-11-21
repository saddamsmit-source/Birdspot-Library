/** Birdspot F3-R37: three waders, six exact inspected photo blobs, missing sounds and reciprocal field text. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { guideHeroPhoto, recognitionPanel, comparisonPhoto } from '../src/features/species/detailSections.js';

const read = file => readFileSync(new URL(file, import.meta.url));
const json = file => JSON.parse(read(file));
const f3 = json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media = json('../assets/species/field-guide-media.json');
const similarity = json('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const all = new Map(SPECIES.map(x => [x.id, x]));
const ids = ['sp149','sp150','sp152'];
const rows = f3.records.filter(x => x.F3.recheckBatch === 'F3-R37');
assert.deepEqual(rows.map(x=>x.id),ids,'F3-R37 must match the fixed next cohort');
assert.equal(f3.counts.contentInspected,f3.records.filter(row => row.F3.reviewedThisRound).length);
assert.ok(f3.counts.contentInspected>=111,'R37 and its predecessors must remain represented');
assert.equal(f3.counts.nextNotStarted,f3.records.filter(row => row.F3.status==='NOT STARTED').length);
assert.equal(f3.counts.thirtySeventhBatchStarted,3);
assert.equal(f3.records.length,140);

const expected = {
  sp149: ['/assets/species/sp149.webp'],
  sp150: ['/assets/species/sp150.webp','/assets/species/plumage/sp150-flight.webp'],
  sp152: ['/assets/species/sp152.webp','/assets/species/plumage/sp152-juv.webp',
          '/assets/species/plumage/sp152-flight.webp']
};
let photos=0;
for(const row of rows) {
  const {id,currentAssets,F3} = row;
  const paths=currentAssets.imageSlots.map(x=>x.path);
  assert.deepEqual(paths,expected[id],id+' actual photo inventory');
  assert.equal(F3.status,'IN CONTENT REVIEW / OPEN POINTS');
  assert.equal(F3.reviewedThisRound,true);
  assert.equal(F3.fullPass,false);
  assert.ok(F3.independence.startsWith('NOT VERIFIED'),id+' second review not independent');
  assert.match(F3.checks.independentSecondReview,/^NOT TESTED/);
  assert.match(F3.checks.audioRecordingsAuthenticity,/^BLOCKED/);
  assert.equal(F3.photoFilesInspected,expected[id].length);
  assert.equal(F3.reviewedOriginalAudio,0);
  assert.deepEqual(currentAssets.existingAudioPaths,[]);
  assert.equal(currentAssets.existingAudioCount,0);
  assert.equal((GUIDE_AUDIO[id]||[]).length,0);
  assert.equal((media.audio[id]||[]).length,0);
  assert.equal(guideHeroPhoto(id).image,paths[0]);
  assert.equal(F3.photoBlobSHAs.length,paths.length);
  for (let i=0;i<paths.length;i++){
    const bytes=read('..'+paths[i]);
    assert.ok(bytes.length > 1000,id+' photo must be nonempty');
    const blob=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
    assert.equal(F3.photoBlobSHAs[i],blob,id+' exact visually inspected local photo changed');
  }
  const html=recognitionPanel(all.get(id));
  assert.equal((html.match(/<audio /g)||[]).length,0,id+' must not invent audio player');
  assert.ok(!html.includes('Status: Bevestigd'),id+' no false verification');
  photos+=paths.length;
}
assert.equal(photos,6);
assert.equal(media.poses.sp150.length,1);
assert.equal(media.poses.sp152.length,1);
assert.equal(media.plumage.sp152.juv.age,'juvenile');
const flightNote='De bron noemt onvolwassen vogels in de herfst; leeftijd per afzonderlijke vogel is niet zelfstandig afgetekend.';
const registeredNote=media.poses.sp152[0].note;
assert.ok(registeredNote.endsWith(flightNote),'Group-level source age and individual uncertainty are retained');
assert.match(registeredNote,/brede witte vleugelstrepen/,'Existing visible field mark must also be retained');
assert.equal(GUIDE_POSES.sp152[0].note,registeredNote,'Generated guide metadata must match the complete registered note');
assert.notEqual(GUIDE_POSES.sp150[0].age,'adult','nonbreeding flight shot does not establish adult age');

const pair=GUIDE_COMPARISONS.find(x=>x.birds.length===2 &&
  x.birds.some(b=>b.id==='sp150') && x.birds.some(b=>b.id==='sp146'));
assert.ok(pair && pair.reciprocalText,'Steenloper-Bontbekplevier must have reciprocal text');
assert.ok(pair.birds.every(b=>b.photoMissing && comparisonPhoto(b,false)===null),
  'Missing equal-pose photo pair must never render arbitrary images');
const r=similarity.pairs.filter(x=>x.id==='LK-080');
assert.equal(r.length,1);
assert.deepEqual(r[0].birds,['sp150','sp146']);
assert.equal(r[0].photoState,'MISSING_VERIFIED_PAIR');
assert.match(pair.birds.find(bird=>bird.id==='sp146').marks,/korte snavel met oranje basis en zwarte punt/);
assert.ok(pair.birds.every(bird=>!/kortere|langere/.test(bird.marks)),'The paired hints must not claim an unsupported relative bill length');
assert.deepEqual(similarity.pairs.filter(x=>['LK-081','LK-082'].includes(x.id)).map(x=>x.birds),
  [['sp101','sp149'],['sp152','sp153']]);
for(const [own,partner] of [['sp150','sp146'],['sp146','sp150'],['sp149','sp101'],
  ['sp101','sp149'],['sp152','sp153'],['sp153','sp152']]){
  const html=recognitionPanel(all.get(own));
  assert.match(html,new RegExp('data-compare-species="'+partner+'"'),own+' missing reciprocal '+partner);
}
console.log('F3-R37 PASS: 3 rows, 6 exact photo blobs, 0 audio clips, source-age correction and reciprocal text comparisons. This is not full species or release PASS.');
