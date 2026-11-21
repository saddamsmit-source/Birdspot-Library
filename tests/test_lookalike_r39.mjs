/** F3-R39: three ruiters, 12 unmodified local photos, 10 registered audio clips, source ceilings. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const read = filename => readFileSync(new URL(filename,import.meta.url));
const json = filename => JSON.parse(read(filename));
const f3=json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media=json('../assets/species/field-guide-media.json');
const ledger=json('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const birds=new Map(SPECIES.map(s=>[s.id,s]));
const focus=['sp157','sp158','sp159'];
const rows=f3.records.filter(row=>row.F3.recheckBatch==='F3-R39');
assert.deepEqual(rows.map(x=>x.id),focus,'R39 species order must not drift');
assert.equal(f3.records.length,140);
assert.equal(f3.counts.contentInspected,117);
assert.equal(f3.counts.nextNotStarted,23);
assert.equal(f3.counts.thirtyNinthBatchStarted,3);
assert.equal(f3.counts.F3FullPass,0);

const paths={
 sp157:['/assets/species/sp157.webp','/assets/species/plumage/sp157-juv.webp','/assets/species/plumage/sp157-winter.webp','/assets/species/plumage/sp157-flight.webp'],
 sp158:['/assets/species/sp158.webp','/assets/species/plumage/sp158-juv.webp','/assets/species/plumage/sp158-winter.webp','/assets/species/plumage/sp158-flight.webp'],
 sp159:['/assets/species/sp159.webp','/assets/species/plumage/sp159-juv.webp','/assets/species/plumage/sp159-winter.webp','/assets/species/plumage/sp159-flight.webp']
};
const audioCounts={sp157:3,sp158:3,sp159:4};
let seenPhotos=0,seenClips=0;
for(const {id,F3,currentAssets,historic} of rows){
 assert.ok(birds.has(id));
 assert.equal(historic.audited,false,'historical audit is not silently upgraded');
 assert.equal(F3.fullPass,false);
 assert.equal(F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(F3.reviewedThisRound,true);
 assert.ok(F3.independence.startsWith('NOT VERIFIED'));
 assert.match(F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.ok(F3.checks.audioRecordingsAuthenticity.startsWith('NOT TESTED'));
 assert.ok(F3.checks.photoOriginalIdentity.startsWith('PARTIALLY TESTED'));
 assert.equal(F3.reviewedOriginalAudio,0);
 assert.deepEqual(currentAssets.imageSlots.map(x=>x.path),paths[id]);
 assert.equal(F3.photoFilesInspected,paths[id].length);
 assert.equal(F3.photoBlobSHAs.length,paths[id].length);
 assert.equal(guideHeroPhoto(id).image,paths[id][0]);
 paths[id].forEach((path,i)=>{
  const bytes=read('..'+path);
  assert.ok(bytes.length>1000,id+' missing photo '+path);
  assert.match(F3.photoBlobSHAs[i],/^[0-9a-f]{40}$/,'Recorded Git blob hash must be exactly 40 hexadecimal digits');
  const blob=createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0)).update(bytes).digest('hex');
  assert.equal(blob,F3.photoBlobSHAs[i],id+' observed photo changed '+path);
 });
 const clips=GUIDE_AUDIO[id]||[];
 const registered=media.audio[id]||[];
 const l=ledger.species.find(x=>x.id===id);
 assert.equal(clips.length,audioCounts[id]);
 assert.deepEqual(clips.map(x=>x.audio),registered.map(x=>x.audio));
 assert.deepEqual(currentAssets.existingAudioPaths,clips.map(x=>x.audio));
 assert.deepEqual(l.clips.map(x=>x.file),clips.map(x=>x.audio));
 assert.equal(currentAssets.existingAudioCount,audioCounts[id]);
 for(const clip of clips){
  assert.ok(clip.source.startsWith('https://xeno-canto.org/') && clip.license && clip.author);
  assert.ok(read('..'+clip.audio).length>1000,id+' missing audio '+clip.audio);
 }
 const panel=recognitionPanel(birds.get(id));
 assert.equal((panel.match(/<audio /g)||[]).length,clips.length,id+' rendered audio count');
 assert.ok(!panel.includes('Status: Bevestigd'),id+' cannot misrepresent rights/listening certainty');
 assert.equal(GUIDE_PLUMAGE[id].juv.image,paths[id][1]);
 assert.equal(GUIDE_PLUMAGE[id].winter.image,paths[id][2]);
 assert.equal(GUIDE_POSES[id].length,1);
 assert.equal(GUIDE_POSES[id][0].flight,true);
 assert.equal(GUIDE_POSES[id][0].image,paths[id][3]);
 seenPhotos+=paths[id].length;seenClips+=clips.length;
}
assert.equal(seenPhotos,12);assert.equal(seenClips,10);
const issues=f3.records.find(x=>x.id==='sp159').F3.findings;
assert.ok(issues.some(x=>x.includes('36–40') && x.includes('54–57')),
  'Do not erase the material Wood Sandpiper wingspan conflict before source reconciliation');
assert.ok(f3.records.find(x=>x.id==='sp158').F3.findings.some(x=>/eerstejaars|november/.test(x)),
  'A November first-year Greenshank must not be presented as a proven juvenile without a plumage key');
for(const [own,other] of [
 ['sp157','sp102'],['sp102','sp157'],
 ['sp158','sp217'],['sp217','sp158'],
 ['sp159','sp156'],['sp156','sp159'],
 ['sp159','sp155'],['sp155','sp159']
]){
 const html=recognitionPanel(birds.get(own));
 assert.match(html,new RegExp('data-compare-species="'+other+'"'),own+' missing reciprocal compare '+other);
}
const triples=GUIDE_COMPARISONS.filter(c=>c.birds.length===2 && c.birds.every(b=>['sp156','sp159'].includes(b.id)));
assert.equal(triples.length,3,'Keep three Witgat/Bosruiter age-season comparison slots');
console.log('F3-R39 PASS: 12 exact photo blobs, 10 registered audio files, existing reciprocal comparison texts, unresolved size/age claims and no FULL PASS.');
