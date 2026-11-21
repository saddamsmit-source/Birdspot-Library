/** F3-R26: protect six existing gull images, missing age pairs and true evidence ceiling. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const f3=read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const a=read('../docs/fotokwaliteit/F2_30_BRON_EN_LIMIETEN.json');
const b=read('../docs/fotokwaliteit/F2_31_BRON_EN_LIMIETEN.json');
const med=read('../assets/species/field-guide-media.json');
const knowledge=read('../tools/kennisbaseline/knowledge.json');
const ids=['sp094','sp095','sp096'];
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(x=>x.id)).size,140);
assert.equal(f3.counts.contentInspected,78);
assert.equal(f3.counts.nextNotStarted,62);
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.counts.twentyFifthBatchStarted,3);
assert.equal(f3.counts.twentySixthBatchStarted,3);
assert.equal(f3.records.filter(x=>x.F3.reviewedThisRound).length,78);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R26').map(x=>x.id),ids);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R25').map(x=>x.id),['sp090','sp091','sp092']);
assert.ok(f3.records.every(x=>x.F3.fullPass===false));
let verifiedLocalImages=0;
for(const id of ids){
 const row=f3.records.find(x=>x.id===id);
 const historical=id==='sp096'?b:a;
 const photos=historical.images.filter(x=>x.species===id);
 assert.equal(photos.length,2);
 assert.equal(row.currentAssets.imageSlots.length,2);
 assert.equal(row.currentAssets.existingAudioCount,0);
 assert.equal(row.currentAssets.existingAudioPaths.length,0);
 assert.equal((med.audio[id]||[]).length,0,'No audio may be invented');
 assert.deepEqual(row.currentAssets.imageSlots.map(x=>x.path).sort(),photos.map(x=>x.image).sort());
 assert.equal(row.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(row.F3.reviewedOriginalAudio,0);
 assert.equal(row.F3.photoFilesInspected,2);
 assert.equal(row.F3.recheckBatch,'F3-R26');
 assert.ok(row.F3.sourceReferences.length>=3 && row.F3.findings.length>=3);
 assert.ok(row.F3.checks.photoIndividualRights.startsWith('PARTIALLY TESTED'));
 for(const key of ['audioRecordingsAuthenticity','audioLicenseAndAttribution','soundRolesSongCall','independentSecondReview']){
  assert.match(row.F3.checks[key],/^NOT TESTED/);
 }
 assert.ok(Object.values(row.F3.checks).every(v=>!v.startsWith('VERIFIED')),'No silent R26 PASS');
 for(const photo of photos){
  assert.ok(photo.registeredAuthor && photo.registeredLicense && photo.source);
  assert.equal(photo.originalPageRead,true,'Keep F2 original page historical evidence');
  const p=new URL('..'+photo.image,import.meta.url);
  assert.ok(existsSync(p));
  assert.equal(createHash('sha256').update(readFileSync(p)).digest('hex'),photo.sha256,'Unapproved media change '+photo.image);
  verifiedLocalImages++;
 }
 const pose=med.poses[id];
 assert.equal(pose.length,1);
 assert.equal(pose[0].image,photos.find(x=>x.image.endsWith('-flight.webp')).image);
 assert.equal(pose[0].flight,true);
}
assert.equal(verifiedLocalImages,6);
assert.ok(a.open.some(t=>/eerste-winterpaar/.test(t)),'First-winter paired pictures still missing');
assert.ok(b.open.some(t=>/winterfoto/.test(t)),'Stormmeeuw winter comparison still missing');
const cm=GUIDE_COMPARISONS.filter(x=>x.birds.some(y=>y.id==='sp094')&&x.birds.some(y=>y.id==='sp095'));
assert.ok(cm.length>=1,'Retain adult Herring/Lesser Black-backed gull comparison');
const storm=knowledge.sp096.basis.biometrics.find(x=>x.field==='length');
assert.equal(storm.display,'ca. 40–45 cm');
assert.ok(storm.values.length>=2 && storm.excluded?.some(x=>x.source==='VB_STORM'&&x.reason),'Keep historical VBN upper-bound discrepancy');
console.log('F3-R26 PASS: 78 content reviewed, 62 not started, 0 FULL PASS, 6 unchanged gull images, 3x no sound, first-winter and winter pairs still open, historical size discrepancy intact.');
