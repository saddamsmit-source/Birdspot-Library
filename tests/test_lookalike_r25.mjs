/** F3-R25: only three content records advance, no unearned full-PASS or media-role promotion. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const f3=read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const f2_29=read('../docs/fotokwaliteit/F2_29_BRON_EN_LIMIETEN.json');
const f2_30=read('../docs/fotokwaliteit/F2_30_BRON_EN_LIMIETEN.json');
const confusion=read('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const media=read('../assets/species/field-guide-media.json');
const target=[['sp090',4,1],['sp091',7,5],['sp092',6,1]];
const ids=target.map(x=>x[0]);
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(x=>x.id)).size,140);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R25').map(x=>x.id),ids);
assert.equal(f3.counts.contentInspected,75);
assert.equal(f3.counts.nextNotStarted,65);
assert.equal(f3.counts.twentyFifthBatchStarted,3);
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.records.filter(x=>x.F3.reviewedThisRound).length,75);
assert.equal(f3.records.filter(x=>x.F3.fullPass).length,0);
assert.equal(f3.records.filter(x=>x.F3.status==='NOT STARTED').length,65);
const allF2=[...f2_29.images,...f2_30.images];
let seenImages=0,seenAudio=0;
for(const [id,imageCount,audioCount] of target){
 const row=f3.records.find(x=>x.id===id),photos=allF2.filter(x=>x.species===id);
 assert.ok(row);
 assert.equal(row.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(row.F3.reviewedThisRound,true);
 assert.equal(row.F3.fullPass,false);
 assert.equal(row.F3.independence.includes('independent'),true);
 assert.equal(row.F3.reviewedOriginalAudio,0);
 assert.equal(row.F3.photoFilesInspected,imageCount);
 assert.equal(row.currentAssets.imageSlots.length,imageCount);
 assert.equal(photos.length,imageCount);
 assert.deepEqual(
  row.currentAssets.imageSlots.map(x=>x.path).sort(),
  photos.map(x=>x.image).sort(),
  'F2 and F3 image inventory must agree: '+id
 );
 for(const item of photos){
  assert.ok(item.registeredAuthor && item.registeredLicense && item.source);
  const assetPath=new URL('..'+item.image,import.meta.url);
  assert.ok(existsSync(assetPath), 'image missing '+item.image);
  assert.equal(
   createHash('sha256').update(readFileSync(assetPath)).digest('hex'),item.sha256,
   'Historical image bytes changed without new media approval: '+item.image
  );
  seenImages++;
 }
 const audio=media.audio[id]||[];
 assert.equal(audio.length,audioCount);
 assert.deepEqual(row.currentAssets.existingAudioPaths.sort(),audio.map(x=>x.audio).sort());
 for(const item of audio){
  assert.ok(item.label && item.license && item.source && item.author);
  assert.ok(existsSync(new URL('..'+item.audio,import.meta.url)), 'audio missing '+item.audio);
  seenAudio++;
 }
 assert.deepEqual(Object.keys(row.F3.checks).sort(),[...f3.requiredChecks].sort());
 for(const val of Object.values(row.F3.checks))assert.ok(!val.startsWith('VERIFIED'),'R25 falsely approved a gate: '+id);
 for(const key of ['audioRecordingsAuthenticity','offlinePlayerAndSoundFiles','independentSecondReview'])
  assert.match(row.F3.checks[key],/^NOT TESTED/);
 assert.ok(row.F3.findings.length>0 && row.F3.sourceReferences.length>=3);
}
assert.equal(seenImages,17);assert.equal(seenAudio,7);
const lk006=confusion.pairs.find(x=>x.id==='LK-006');
assert.deepEqual(lk006.birds,['sp092','sp133']);
assert.equal(lk006.photoState,'MISSING_VERIFIED_PAIR');
const topperPanels=GUIDE_COMPARISONS.filter(c=>c.birds.some(b=>b.id==='sp092')&&c.birds.some(b=>b.id==='sp133'));
assert.equal(topperPanels.length,2,'Retain both historically specified male/female comparisons');
assert.ok(topperPanels.every(c=>c.birds.some(b=>b.id==='sp133'&&b.photoMissing===true)),
 'Unverified Topper photos must remain explicitly unavailable; never show a false pair');
const winter=GUIDE_COMPARISONS.filter(c=>c.birds.some(b=>b.id==='sp091')&&c.birds.some(b=>b.id==='sp188'));
assert.ok(winter.length>=3, 'Existing Wintertaling/Zomertaling valid pairs must remain');
const r24=f3.records.filter(x=>x.F3.recheckBatch==='F3-R24');
assert.deepEqual(r24.map(x=>x.id),['sp085','sp086','sp089']);
assert.ok(r24.every(x=>x.F3.fullPass===false),'R24 evidence must not be promoted by R25');
console.log('F3-R25 PASS: 75 content reviewed, 65 not started, 0 full PASS; 17 unchanged image-byte hashes, 7 registered audio files, no false Topper photo pair, three focused species.');
