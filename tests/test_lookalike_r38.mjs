/** Birdspot F3-R38: preserve the next three shorebirds, existing image bytes, sound labels and no false F3 PASS. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = file => readFileSync(new URL(file, import.meta.url));
const json = file => JSON.parse(read(file));
const f3=json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const source=json('../assets/species/field-guide-media.json');
const similarity=json('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json');
const ids=['sp153','sp155','sp156'];
const byId=new Map(SPECIES.map(s=>[s.id,s]));
const rows=f3.records.filter(r=>r.F3.recheckBatch==='F3-R38');
assert.equal(f3.records.length,140);
assert.deepEqual(rows.map(x=>x.id),ids,'R38 must affect exactly the three next untouched species');
assert.equal(f3.counts.thirtyEighthBatchStarted,3);
assert.equal(f3.counts.contentInspected,f3.records.filter(x=>x.F3.reviewedThisRound).length);
assert.equal(f3.counts.contentInspected,114);
assert.equal(f3.counts.nextNotStarted,26);
assert.equal(f3.counts.F3FullPass,0);

const images={
 sp153:['/assets/species/sp153.webp'],
 sp155:['/assets/species/sp155.webp','/assets/species/plumage/sp155-juv.webp','/assets/species/plumage/sp155-winter.webp','/assets/species/plumage/sp155-flight.webp'],
 sp156:['/assets/species/sp156.webp','/assets/species/plumage/sp156-juv.webp','/assets/species/plumage/sp156-winter.webp','/assets/species/plumage/sp156-flight.webp']
};
const expectedAudio={sp153:0,sp155:3,sp156:4};
let imageCount=0, audioCount=0;
for(const row of rows){
 const {id,F3,currentAssets}=row;
 assert.ok(byId.get(id),id+' species missing');
 assert.equal(F3.fullPass,false);
 assert.equal(F3.reviewedThisRound,true);
 assert.equal(F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.match(F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.ok(F3.independence.startsWith('NOT VERIFIED'));
 assert.ok(F3.checks.photoOriginalIdentity.startsWith('PARTIALLY TESTED'));
 assert.deepEqual(currentAssets.imageSlots.map(x=>x.path),images[id]);
 assert.equal(guideHeroPhoto(id).image,images[id][0]);
 assert.equal(F3.photoFilesInspected,images[id].length);
 assert.equal(F3.photoBlobSHAs.length,images[id].length);
 assert.equal(F3.reviewedOriginalAudio,0,'Existing audio is not newly verified');
 images[id].forEach((path,i)=>{
  const bytes=read('..'+path);
  assert.ok(bytes.length>1000, id+' missing or empty photo '+path);
  const sha=createHash('sha1').update('blob '+bytes.length+'\\0'.replace('\\0','\0')).update(bytes).digest('hex');
  assert.equal(sha,F3.photoBlobSHAs[i],id+' visually reviewed photo changed');
 });
 const clips=GUIDE_AUDIO[id]||[];
 assert.equal(clips.length,expectedAudio[id]);
 assert.equal((source.audio[id]||[]).length,expectedAudio[id]);
 assert.deepEqual(currentAssets.existingAudioPaths,clips.map(c=>c.audio));
 assert.equal(currentAssets.existingAudioCount,clips.length);
 clips.forEach(c=>{
   assert.ok(c.source.startsWith('https://xeno-canto.org/'));
   assert.ok(c.author && c.license && c.label);
   assert.ok(read('..'+c.audio).length>1000,id+' audio missing '+c.audio);
 });
 const html=recognitionPanel(byId.get(id));
 assert.equal((html.match(/<audio /g)||[]).length,expectedAudio[id],id+' DOM player count');
 assert.ok(!html.includes('Status: Bevestigd'),'no claimed independent verification');
 imageCount+=images[id].length;audioCount+=clips.length;
}
assert.equal(imageCount,9);assert.equal(audioCount,7);
assert.deepEqual([GUIDE_POSES.sp155.length,GUIDE_POSES.sp156.length],[1,1]);
assert.ok(!GUIDE_POSES.sp153?.length);
assert.equal(GUIDE_PLUMAGE.sp156.juv.width,371);
assert.equal(GUIDE_PLUMAGE.sp156.juv.height,197);
const w=f3.records.find(x=>x.id==='sp156').F3;
assert.ok(w.findings.some(s=>s.includes('onscherp')),'Document the small, blurry existing juvenile image');
assert.ok(w.findings.some(s=>s.includes('39–44')&&s.includes('57–61')),'Do not silently reconcile conflicting published wingspans');
assert.ok(similarity.pairs.some(p=>p.id==='LK-082' && p.birds.includes('sp153')));
for(const [own,other] of [['sp153','sp152'],['sp152','sp153'],['sp155','sp156'],['sp156','sp155'],['sp156','sp159'],['sp159','sp156']]){
 const html=recognitionPanel(byId.get(own));
 assert.match(html,new RegExp('data-compare-species="'+other+'"'),own+' missing existing partner '+other);
}
console.log('F3-R38 PASS: 3 newly reviewed rows, 9 byte-bound photos, 7 existing audio files, reciprocal field comparisons, blur and biometrics unresolved.');
