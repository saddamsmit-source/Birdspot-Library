/** F3-R40: six actual photo blobs, no invented songs, honest stern comparison, earlier evidence intact. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { comparisonPhoto, guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = file => readFileSync(new URL(file,import.meta.url));
const json = file => JSON.parse(read(file));
const f3=json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media=json('../assets/species/field-guide-media.json');
const audioAudit=json('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const lookalikes=json('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const birds=new Map(SPECIES.map(s=>[s.id,s]));
const ids=['sp164','sp165','sp166'];
const rows=f3.records.filter(x=>x.F3.recheckBatch==='F3-R40');
assert.equal(f3.records.length,140);
assert.deepEqual(rows.map(x=>x.id),ids);
assert.equal(f3.counts.contentInspected,120);
assert.equal(f3.counts.nextNotStarted,20);
assert.equal(f3.counts.fortiethBatchStarted,3);
assert.equal(f3.counts.F3FullPass,0);
const expected={
 sp164:['/assets/species/plumage/sp164-adult.webp','/assets/species/plumage/sp164-flight.webp'],
 sp165:['/assets/species/plumage/sp165-adult.webp','/assets/species/plumage/sp165-juv.webp','/assets/species/plumage/sp165-flight.webp'],
 sp166:['/assets/species/plumage/sp166-adult.webp']
};
let total=0;
for(const row of rows){
 const {id,currentAssets,F3}=row;
 const paths=expected[id];
 assert.ok(birds.get(id));
 assert.equal(F3.reviewedThisRound,true);
 assert.equal(F3.fullPass,false);
 assert.equal(F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.ok(F3.independence.startsWith('NOT VERIFIED'));
 assert.match(F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.match(F3.checks.audioRecordingsAuthenticity,/^BLOCKED/);
 assert.ok(F3.checks.photoOriginalIdentity.startsWith('PARTIALLY TESTED'));
 assert.equal(F3.photoFilesInspected,paths.length);
 assert.deepEqual(currentAssets.imageSlots.map(x=>x.path),paths);
 assert.deepEqual(F3.photoBlobSHAs.length,paths.length);
 assert.equal(guideHeroPhoto(id).image,paths[0]);
 assert.equal(GUIDE_HEROES[id],paths[0]);
 for(const [i,path] of paths.entries()){
  const bytes=read('..'+path);
  assert.ok(bytes.length>1000,id+' photo absent '+path);
  assert.match(F3.photoBlobSHAs[i],/^[a-f0-9]{40}$/,'Git hash must be 40 digits');
  const sha=createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0)).update(bytes).digest('hex');
  assert.equal(F3.photoBlobSHAs[i],sha,id+' photo content changed');
 }
 assert.deepEqual(currentAssets.existingAudioPaths,[]);
 assert.equal(currentAssets.existingAudioCount,0);
 assert.equal(F3.reviewedOriginalAudio,0);
 assert.equal((media.audio[id]||[]).length,0);
 assert.equal((GUIDE_AUDIO[id]||[]).length,0);
 const audit=audioAudit.species.find(x=>x.id===id);
 assert.equal(audit.status,'MISSING');
 assert.equal(audit.clips.length,0);
 const own=recognitionPanel(birds.get(id));
 assert.equal((own.match(/<audio /g)||[]).length,0,id+' no audio players without clips');
 assert.ok(!own.includes('Status: Bevestigd'));
 total+=paths.length;
}
assert.equal(total,6,'Five photos plus one combined hero/flight; not six independent plumage roles');
assert.equal(GUIDE_PLUMAGE.sp166.breeding.image,GUIDE_HEROES.sp166);
assert.equal(GUIDE_PLUMAGE.sp166.breeding.flight,true);
assert.equal((GUIDE_POSES.sp166||[]).length,0,'No invented second Arctic Tern flight image');
assert.equal(GUIDE_PLUMAGE.sp165.juv.age,'juvenile');
assert.ok(!GUIDE_PLUMAGE.sp164.adult_m.sex,'Gull adult photo has no independently proven sex');
const lk83=lookalikes.pairs.find(x=>x.id==='LK-083');
const lk84=lookalikes.pairs.find(x=>x.id==='LK-084');
assert.ok(lk83 && lk84);
assert.deepEqual(lk83.birds,['sp165','sp166']);
assert.equal(lk83.photoState,'MISSING_VERIFIED_PAIR');
assert.deepEqual(lk84.birds,['sp164','sp095']);
assert.equal(lk84.photoState,'REGISTERED_PAIR_PENDING_F3_ORIGINAL');
const tern=GUIDE_COMPARISONS.find(x=>x.birds.length===2 &&
 x.birds.some(b=>b.id==='sp165') && x.birds.some(b=>b.id==='sp166'));
assert.ok(tern?.reciprocalText);
assert.ok(tern.birds.every(x=>x.photoMissing));
assert.ok(tern.birds.every(x=>comparisonPhoto(x,false)===null));
assert.ok(tern.birds.every(x=>comparisonPhoto(x,true)===null));
for(const [a,b] of [['sp165','sp166'],['sp166','sp165'],['sp164','sp095'],['sp095','sp164']]){
 const html=recognitionPanel(birds.get(a));
 assert.match(html,new RegExp('data-compare-species="'+b+'"'),a+' missing partner '+b);
}
assert.ok(rows.find(x=>x.id==='sp164').F3.findings.some(x=>x.includes('61–74')&&x.includes('68–79')),
 'Gull size discrepancy must remain open');
console.log('F3-R40 PASS: 120/140, 6 exact WebP Git blobs, no local audio, reciprocals LK-083 text-only and LK-084 photo pending.');
