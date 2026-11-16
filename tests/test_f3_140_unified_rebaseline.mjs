/** F3: protect the original 140 cohort, prior evidence, and the new no-false-PASS gate. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_HEROES } from '../src/features/species/guideMedia.js';
import { guideHeroPhoto, recognitionPanel } from '../src/features/species/detailSections.js';
const load = file => JSON.parse(readFileSync(new URL(file,import.meta.url),'utf8'));
const j=load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const old=load('../docs/fotokwaliteit/soortaudit-status.json');
const audio=load('../assets/species/field-guide-media.json');
const tracker=load('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const f2=readFileSync(new URL('../docs/fotokwaliteit/F2_VOORTGANG_TOT_140.md',import.meta.url),'utf8');
const f2Set=new Set([...f2.matchAll(/^\|\s*(sp\d{3})\s+[^\n|]+\|/gm)].map(m=>m[1]));
const catalog=new Map(SPECIES.map(x=>[x.id,x]));
const ids=old.species.map(x=>x.id), req=j.requiredChecks;
assert.equal(j.records.length,140);
assert.equal(ids.length,140);
assert.equal(new Set(ids).size,140);
assert.deepEqual(j.records.map(x=>x.id),ids,'F3 cannot remove or reorder original 140 cohort');
assert.deepEqual(j.records.map(x=>x.id),tracker.species.map(x=>x.id),'Photo and audio cohorts must match');
assert.equal(new Set(req).size,req.length);
assert.ok(req.length>=16);
const rows=j.records;
for(let i=0;i<rows.length;i++){
 const x=rows[i],o=old.species[i],s=catalog.get(x.id),registered=audio.audio[x.id]||[];
 assert.ok(s,'Missing species ID '+x.id+' from Birdspot');
 assert.equal(x.nameNL,s.nameNL,x.id+' wrong Dutch species name');
 assert.equal(x.seq,i+1);
 assert.equal(x.historic.audited,o.audited);
 assert.equal(x.historic.oldVerdict,o.verdict);
 assert.equal(x.historic.oldAssetCount,(o.assets||[]).filter(asset=>!asset.addedIn?.startsWith('F3-')).length);
 assert.equal(x.historic.oldF2Visited,f2Set.has(x.id),x.id+' previous F2 evidence drift');
 assert.equal(x.currentAssets.existingAudioCount,registered.length);
 assert.deepEqual(x.currentAssets.existingAudioPaths,registered.map(y=>y.audio));
 const paths=x.currentAssets.imageSlots.map(y=>y.path);
 if (o.audited || !x.F3.reviewedThisRound) {
  assert.deepEqual(paths,(o.assets||[]).map(y=>y.image));
  assert.deepEqual(x.currentAssets.imageSlots.map(y=>y.addedIn),(o.assets||[]).map(y=>y.addedIn));
 } else {
  // An F3 review can register live photos that were absent from the historic audit.
  const ownGallery=recognitionPanel(s).split('<section class="sd-similar"')[0];
  const current=[guideHeroPhoto(x.id)?.image, ...Array.from(
   ownGallery.matchAll(/data-guide-image="([^"]+)"/g), match=>match[1]
  )].filter(Boolean);
  assert.equal(new Set(current).size,current.length);
  assert.deepEqual(paths,current,x.id+' reviewed live photos must match the own gallery');
 }
 for(const part of x.currentAssets.imageSlots){
  assert.ok(part.path?.startsWith('/assets/'),x.id+' image outside local assets');
  const file=new URL('..'+part.path,import.meta.url);
  assert.ok(existsSync(file),x.id+' image missing: '+part.path);
  assert.ok(statSync(file).size>1000,x.id+' image unexpectedly empty');
 }
 for(const key of req){
  const v=x.F3.checks[key];
  assert.equal(typeof v,'string',x.id+' missing recheck '+key);
  assert.ok(/^(?:NOT TESTED|BLOCKED|PARTIALLY TESTED|VERIFIED|N\/A)/.test(v),
    x.id+' invalid gate status '+key+'='+v);
 }
 if(x.F3.fullPass){
  if(x.currentAssets.existingAudioCount===0){
   assert.equal(x.F3.audioException?.ownerApproved,true,
      x.id+' no recorded bird sound: explicit owner decision needed for exceptional F3 full pass');
   assert.ok(x.F3.audioException?.reason?.length>25,
      x.id+' exceptional missing audio needs biological/licensing evidence');
  }
  assert.equal(x.F3.status,'VERIFIED',x.id+' cannot be full pass in an incomplete state');
  for(const key of req){
   const value=x.F3.checks[key];
   assert.ok(value==='VERIFIED'||value==='N/A - documented',
     x.id+' '+key+' not explicitly passed or documented N/A');
   if(value==='N/A - documented')assert.ok(x.F3.exemptions?.[key]?.reason?.length>20);
  }
  assert.equal(x.F3.independence,'VERIFIED',x.id+' missing second independent review');
  assert.ok(x.F3.sourceReferences.length>0,x.id+' no sources');
 }
}
const sum=fn=>rows.filter(fn).length;
const counts={
 total:rows.length, oldF2Touched:sum(x=>x.historic.oldF2Visited),
 oldAudited:sum(x=>x.historic.audited),
 oldNinePointVerified:sum(x=>x.historic.oldVerdict==='VERIFIED'),
 audioPresent:sum(x=>x.currentAssets.existingAudioCount>0),
 audioMissing:sum(x=>!x.currentAssets.existingAudioCount),
 firstBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R01'),
 F3FullPass:sum(x=>x.F3.fullPass),
 nextNotStarted:sum(x=>x.F3.status==='NOT STARTED'),
 secondBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R02'),
 thirdBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R03'),
 fourthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R04'),
 fifthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R05'),
 sixthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R06'),
 seventhBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R07'),
 eighthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R08'),
 ninthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R09'),
 tenthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R10'),
 eleventhBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R11'),
 twelfthBatchStarted:sum(x=>x.F3.recheckBatch==='F3-R12'),
 contentInspected:sum(x=>x.F3.reviewedThisRound===true),
 contentComplete:sum(x=>x.F3.contentStatus==='CONTENT COMPLETE')
};
assert.deepEqual(j.counts,counts,'F3 summary must be recalculated when a batch advances');
assert.equal(counts.audioPresent,tracker.counts.withRegisteredAudio);
assert.equal(counts.audioMissing,tracker.counts.withoutRegisteredAudio);
const first=rows.filter(x=>x.F3.recheckBatch==='F3-R01');
const second=rows.filter(x=>x.F3.recheckBatch==='F3-R02');
const third=rows.filter(x=>x.F3.recheckBatch==='F3-R03');
const fourth=rows.filter(x=>x.F3.recheckBatch==='F3-R04');
const fifth=rows.filter(x=>x.F3.recheckBatch==='F3-R05');
const sixth=rows.filter(x=>x.F3.recheckBatch==='F3-R06');
const seventh=rows.filter(x=>x.F3.recheckBatch==='F3-R07');
const eighth=rows.filter(x=>x.F3.recheckBatch==='F3-R08');
const ninth=rows.filter(x=>x.F3.recheckBatch==='F3-R09');
const tenth=rows.filter(x=>x.F3.recheckBatch==='F3-R10');
const eleventh=rows.filter(x=>x.F3.recheckBatch==='F3-R11');
const twelfth=rows.filter(x=>x.F3.recheckBatch==='F3-R12');
assert.ok(req.includes('lookalikePhotoAndText'),'New owner lookalike rule must be checked for every F3 bird');
assert.deepEqual(ninth.map(x=>x.id),['sp034','sp035','sp036'],'R09 exactly three species in fixed sequence');
assert.deepEqual(ninth.map(x=>x.F3.photoFilesInspected),[2,5,4],'All eleven existing local images need individual inspection');
assert.deepEqual(ninth.map(x=>x.currentAssets.existingAudioCount),[1,2,0],'Never invent an audio clip');
for(const item of ninth){
 const {F3:review,currentAssets}=item;
 assert.equal(review.fullPass,false,'Partial visual review is not complete species QA');
 assert.equal(review.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(review.reviewedOriginalAudio,0,'No full external waveform audit performed');
 assert.equal(review.audioSourceMatches.length,0,'Do not pretend original audio match');
 assert.ok(review.checks.lookalikePhotoAndText.startsWith('PARTIALLY TESTED'));
 assert.ok(review.checks.independentSecondReview.startsWith('NOT TESTED'));
 assert.equal(review.photoBlobSHAs.length,currentAssets.imageSlots.length);
 for(let i=0;i<currentAssets.imageSlots.length;i++){
  const bytes=readFileSync(new URL('..'+currentAssets.imageSlots[i].path,import.meta.url));
  const blobSha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(review.photoBlobSHAs[i],blobSha,item.id+' image file has changed since F3-R09 visual review');
 }
 assert.equal(review.sourceReferences.includes('docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json'),true);
 assert.equal(review.unmatchedAudio.length,currentAssets.existingAudioCount,'Unverified audio must be explicitly open');
}

assert.deepEqual(tenth.map(x=>x.id),['sp037','sp038','sp039'],'R10 exactly Putter, Sijs and Kneu in fixed sequence');
assert.deepEqual(tenth.map(x=>x.F3.photoFilesInspected),[6,4,4],'Eleven existing, two new Kneu (F3-R10-media) and one new Putter flight image (F3-R10b-media) individually inspected');
assert.deepEqual(tenth.map(x=>x.currentAssets.existingAudioCount),[0,0,0],'Never invent an audio clip');
for(const item of tenth){
 const {F3:review,currentAssets}=item;
 assert.equal(review.fullPass,false,'Partial visual review is not complete species QA');
 assert.equal(review.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(review.reviewedOriginalAudio,0);
 assert.equal(review.audioSourceMatches.length,0,'Do not pretend original audio match');
 assert.ok(review.checks.audioRecordingsAuthenticity.startsWith('BLOCKED'),'Missing audio stays explicitly open');
 assert.ok(review.checks.lookalikePhotoAndText.startsWith('PARTIALLY TESTED'));
 assert.ok(review.checks.independentSecondReview.startsWith('NOT TESTED'));
 assert.ok(review.findings.length>=4 && review.sourceReferences.length>=3);
 assert.equal(review.photoBlobSHAs.length,currentAssets.imageSlots.length);
 for(let i=0;i<currentAssets.imageSlots.length;i++){
  const bytes=readFileSync(new URL('..'+currentAssets.imageSlots[i].path,import.meta.url));
  const blobSha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(review.photoBlobSHAs[i],blobSha,item.id+' image file has changed since F3-R10 visual review');
 }
 assert.ok(review.sourceReferences.includes('docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json'));
}

assert.deepEqual(eleventh.map(x=>x.id),['sp040','sp041','sp042'],'R11 exactly Goudvink, Appelvink and Roodmus in fixed sequence');
assert.deepEqual(eleventh.map(x=>x.F3.photoFilesInspected),[4,4,1],'Nine existing local images individually inspected');
assert.deepEqual(eleventh.map(x=>x.currentAssets.existingAudioCount),[0,0,0],'Never invent an audio clip');
for(const item of eleventh){
 const {F3:review,currentAssets}=item;
 assert.equal(review.fullPass,false,'Partial visual review is not complete species QA');
 assert.equal(review.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(review.reviewedOriginalAudio,0);
 assert.equal(review.audioSourceMatches.length,0,'Do not pretend original audio match');
 assert.ok(review.checks.audioRecordingsAuthenticity.startsWith('BLOCKED'),'Missing audio stays explicitly open');
 assert.ok(review.checks.lookalikePhotoAndText.startsWith('PARTIALLY TESTED'));
 assert.ok(review.checks.independentSecondReview.startsWith('NOT TESTED'));
 assert.ok(review.findings.length>=4 && review.sourceReferences.length>=3);
 assert.equal(review.photoBlobSHAs.length,currentAssets.imageSlots.length);
 for(let i=0;i<currentAssets.imageSlots.length;i++){
  const bytes=readFileSync(new URL('..'+currentAssets.imageSlots[i].path,import.meta.url));
  const blobSha=createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex');
  assert.equal(review.photoBlobSHAs[i],blobSha,item.id+' image file has changed since F3-R11 visual review');
 }
 assert.ok(review.sourceReferences.includes('docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json'));
}

assert.deepEqual(twelfth.map(x=>x.id),['sp043','sp044','sp045'],'R12 exactly Huismus, Ringmus and Merel');
assert.deepEqual(twelfth.map(x=>x.F3.photoFilesInspected),[5,4,6],'Fifteen shown images incl. new Ringmus flight photo');
assert.deepEqual(twelfth.map(x=>x.currentAssets.existingAudioCount),[1,0,2]);
for(const item of twelfth){
 const {F3:review,currentAssets}=item;
 assert.equal(review.fullPass,false); assert.equal(review.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.ok(review.checks.photoOriginalIdentity.startsWith('VERIFIED'),'R12 compared every shown photo with its source image');
 assert.ok(review.sourceReferences.includes('docs/media-intake/2026-11-16/origcheck-r12/origcheck.json'));
 assert.ok(review.checks.independentSecondReview.startsWith('NOT TESTED'),'Own re-inspection is not independent');
 assert.ok(!review.checks.audioRecordingsAuthenticity.startsWith('VERIFIED'),'Triangulated audio is not human-listened: never full VERIFIED');
 for(let i=0;i<currentAssets.imageSlots.length;i++){
  const bytes=readFileSync(new URL('..'+currentAssets.imageSlots[i].path,import.meta.url));
  assert.equal(review.photoBlobSHAs[i],createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),item.id+' image changed since F3-R12 review');
 }
}

assert.deepEqual(eighth.map(x=>x.id), ['sp031','sp032','sp033'],'F3-R08 is exactly three existing tits');
assert.deepEqual(eighth.map(x=>x.F3.photoFilesInspected),[3,3,4]);
for(const x of eighth) {
 assert.equal(x.F3.fullPass,false,'Visual review must not certify a complete F3 pass');
 assert.equal(x.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(x.F3.reviewedOriginalAudio,0,'Audio has not been independently verified this round');
 assert.equal(x.F3.audioSourceMatches.length,0,'No fabricated waveform matches');
 assert.ok(x.F3.findings.length>=3 && x.F3.sourceReferences.length>=2);
 assert.equal(x.F3.independence.startsWith('PARTIAL'),true);
 assert.equal(x.currentAssets.imageSlots.length,x.F3.photoBlobSHAs.length);
 for(let i=0;i<x.currentAssets.imageSlots.length;i++) {
  const file=readFileSync(new URL('..'+x.currentAssets.imageSlots[i].path,import.meta.url));
  const expected=createHash('sha1').update('blob '+file.length+'\0').update(file).digest('hex');
  assert.equal(x.F3.photoBlobSHAs[i],expected,x.id+' local image changed since visual review');
 }
}

assert.deepEqual(third.map(x=>x.id), ['sp006','sp007','sp008']);
assert.deepEqual(third.map(x=>x.F3.photoFilesInspected),[5,6,6]);
assert.deepEqual(third.map(x=>x.F3.reviewedOriginalAudio),[2,3,2]);
assert.deepEqual(fourth.map(x=>x.id), ['sp009','sp016','sp017']);
assert.deepEqual(fourth.map(x=>x.F3.photoFilesInspected),[6,5,3]);
assert.deepEqual(fourth.map(x=>x.F3.reviewedOriginalAudio),[1,2,2]);
assert.deepEqual(fifth.map(x=>x.id), ['sp018','sp019','sp020']);
assert.deepEqual(fifth.map(x=>x.F3.photoFilesInspected),[5,5,4]);
assert.deepEqual(fifth.map(x=>x.F3.reviewedOriginalAudio),[2,2,1]);
assert.deepEqual(audio.audio.sp019.map(clip=>clip.label),['Lachende roep','Alarmroep']);
for (const { currentAssets, F3: review } of fifth) {
 assert.deepEqual(review.photoSourceMatches.map(photo=>photo.path),currentAssets.imageSlots.map(photo=>photo.path));
 for (const photo of review.photoSourceMatches) {
  assert.match(photo.originalSha256,/^[0-9a-f]{64}$/);
  assert.match(photo.source,/^https:\/\/commons\.wikimedia\.org\//);
 }
}
assert.deepEqual(sixth.map(row=>row.id), ['sp021','sp022','sp025']);
assert.deepEqual(sixth.map(row=>row.F3.photoFilesInspected), [3,3,4]);
assert.deepEqual(sixth.map(row=>row.F3.reviewedOriginalAudio), [1,1,1]);
assert.deepEqual(sixth.map(row=>audio.audio[row.id][0].label), ['Roep','Roep','Contactroep']);
assert.deepEqual(sixth.flatMap(row=>row.currentAssets.imageSlots.filter(
 item=>item.addedIn==='F3-R06').map(item=>item.path)), [
 '/assets/species/plumage/sp021-juv-review.webp',
 '/assets/species/plumage/sp022-juv-review.webp',
 '/assets/species/plumage/sp025-juv-review.webp',
 '/assets/species/plumage/sp025-flight-free.webp'
]);
for (const { currentAssets, F3: review } of sixth) {
 const current = review.photoSourceMatches.map(photo=>photo.path);
 const historic = review.priorPhotoMatches.map(photo=>photo.path);
 const paths = currentAssets.imageSlots.map(photo=>photo.path);
 assert.deepEqual([...current,...historic].sort(), [...paths].sort());
 assert.equal(new Set([...current,...historic]).size, paths.length);
 for (const match of review.priorPhotoMatches) {
  const bytes = readFileSync(new URL('..'+match.path,import.meta.url));
  assert.equal(match.localSha1,createHash('sha1').update(bytes).digest('hex'));
  assert.ok(existsSync(new URL('../'+match.reference,import.meta.url)));
 }
}
assert.deepEqual(seventh.map(row=>row.id), ['sp026','sp029','sp030']);
assert.deepEqual(seventh.map(row=>row.F3.photoFilesInspected), [3,5,3]);
assert.deepEqual(seventh.map(row=>row.F3.reviewedOriginalAudio), [1,2,1]);
assert.deepEqual(seventh.map(row=>audio.audio[row.id].map(clip=>clip.label)), [['Roep'],['Zang','Roep'],['Zang','Roep']]);
assert.deepEqual(seventh.flatMap(row=>row.currentAssets.imageSlots.filter(
 photo=>photo.addedIn==='F3-R07').map(photo=>photo.path)), ['/assets/species/plumage/sp026-juv-review.webp']);
const unmatchedPimpelSong = seventh[2].F3.unmatchedAudio;
assert.deepEqual(seventh.flatMap(row=>row.F3.unmatchedAudio.map(clip=>clip.path)), ['/assets/species/audio/sp030-song.mp3']);
const song = readFileSync(new URL('..'+unmatchedPimpelSong[0].path,import.meta.url));
assert.equal(unmatchedPimpelSong[0].localSha256,createHash('sha256').update(song).digest('hex'));
assert.equal(unmatchedPimpelSong[0].source,audio.audio.sp030[0].source);
assert.equal(unmatchedPimpelSong[0].path,audio.audio.sp030[0].audio);
for (const { currentAssets, F3: review } of seventh) {
 const proof = [...review.photoSourceMatches,...review.priorPhotoMatches];
 assert.deepEqual(proof.map(photo=>photo.path).sort(), currentAssets.imageSlots.map(photo=>photo.path).sort());
 for (const photo of review.priorPhotoMatches) {
  const file = readFileSync(new URL('..'+photo.path,import.meta.url));
  assert.equal(photo.localSha1,createHash('sha1').update(file).digest('hex'));
  assert.ok(existsSync(new URL('../'+photo.reference,import.meta.url)));
 }
}
const newPeregrine = '/assets/species/plumage/sp009-juv-flight.webp';
assert.deepEqual(fourth.flatMap(x=>x.currentAssets.imageSlots.filter(y=>y.addedIn==='F3-R04').map(y=>y.path)), [newPeregrine]);
for (const row of [...third, ...fourth, ...fifth, ...sixth, ...seventh]) {
 const { F3: review, currentAssets } = row;
 assert.equal(review.fullPass, false);
 assert.equal(review.status, 'IN CONTENT REVIEW / OPEN POINTS');
 assert.ok(review.functionTests.startsWith('DEFERRED BY OWNER'));
 assert.equal(review.photoFilesInspected, currentAssets.imageSlots.length);
 const photoBlobs = currentAssets.imageSlots.map(({ path }) => {
  const photo = readFileSync(new URL('..' + path, import.meta.url));
  return createHash('sha1').update('blob ' + photo.length + '\0').update(photo).digest('hex');
 });
 assert.deepEqual(review.photoBlobSHAs, photoBlobs, row.id + ' review must match the inspected image files');
 assert.deepEqual(review.audioSourceMatches.map(clip => [clip.path, clip.source]),
  audio.audio[row.id].filter(clip => !review.unmatchedAudio?.some(item => item.path === clip.audio))
   .map(clip => [clip.audio, clip.source]), row.id + ' recorded audio sources changed');
 for (const match of review.audioSourceMatches) {
  assert.equal(match.windows, 3);
  assert.ok(match.minimumNormalizedCorrelation >= 0.9 && match.minimumNormalizedCorrelation <= 1);
 }
}
assert.ok(fourth[0].F3.resolvedFindings.some(finding=>finding.path===newPeregrine));
assert.deepEqual(second.map(x=>x.id), ['sp005','sp248','sp253']);
assert.deepEqual(second.map(x=>x.F3.photoFilesInspected),[6,4,4]);
for(const x of second){
 assert.equal(x.F3.fullPass,false,'content/UX review cannot falsely claim full media or device PASS');
 assert.equal(x.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.ok(x.F3.functionTests.startsWith('DEFERRED BY OWNER'));
 assert.equal(x.F3.photoBlobSHAs.length,x.F3.photoFilesInspected);
}
assert.equal(GUIDE_HEROES.sp005,'/assets/species/sp005.webp',
 'The improved existing CC BY 4.0 branch photo should be the Buizerd hero');
assert.ok(old.species.find(x=>x.id==='sp005').assets.some(x=>x.image==='/assets/species/plumage/sp005-male-rest.webp'),
 'The old wire photo must remain a supplementary guide image');
assert.deepEqual(first.map(x=>x.id),['sp002','sp003','sp004'],'restart first three birds');
for(const item of first){
 assert.equal(item.F3.photoFilesInspected,3);
 assert.equal(item.F3.photoBlobSHAs?.length,3);
 assert.equal(item.F3.audioCandidate.imported,false,'never fake audio into official species media');
 assert.equal(item.F3.fullPass,false,'not all updated requirements met');
 assert.equal(item.F3.status,'IN REVIEW / BLOCKED');
}
console.log('F3 140 REBASELINE PASS: 140 IDs preserved, historic F2 '+counts.oldF2Touched+
 ' retained; '+counts.audioMissing+
 ' birds still missing registered sound, '+counts.contentInspected+' content-inspected, no fabricated full PASS.');
