/** R42: ten real photo blobs; no fake audio/sex; decision gate and honest conditional flight. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { recognitionPanel, guideHeroPhoto } from '../src/features/species/detailSections.js';

const read=path=>readFileSync(new URL(path,import.meta.url));
const json=path=>JSON.parse(read(path));
const f3=json('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const m=json('../assets/species/field-guide-media.json');
const sound=json('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const species=new Map(SPECIES.map(s=>[s.id,s]));
const focus=['sp174','sp176','sp177'];
const rows=f3.records.filter(r=>r.F3.recheckBatch==='F3-R42');
assert.deepEqual(rows.map(r=>r.id),focus);
assert.equal(f3.records.length,140);
assert.ok(f3.counts.contentInspected>=126);
assert.equal(f3.counts.contentInspected,f3.records.filter(r=>r.F3.reviewedThisRound).length);
assert.equal(f3.counts.nextNotStarted,f3.records.filter(r=>r.F3.status==='NOT STARTED').length);
assert.equal(f3.counts.fortySecondBatchStarted,3);
assert.equal(f3.counts.F3FullPass,0);

const expected={
sp174:['/assets/species/sp174.webp','/assets/species/plumage/sp174-juv.webp','/assets/species/plumage/sp174-flight.webp'],
sp176:['/assets/species/sp176.webp','/assets/species/plumage/sp176-juv.webp','/assets/species/plumage/sp176-flight.webp'],
sp177:['/assets/species/sp177.webp','/assets/species/plumage/sp177-adult_f.webp','/assets/species/plumage/sp177-juv.webp','/assets/species/plumage/sp177-flight.webp']
};
let photoCount=0;
for(const {id,F3,currentAssets,historic} of rows){
 assert.ok(species.has(id));
 assert.equal(F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(F3.reviewedThisRound,true);
 assert.equal(F3.fullPass,false);
 assert.match(F3.independence,/^NOT VERIFIED/);
 assert.match(F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.match(F3.checks.audioRecordingsAuthenticity,/^BLOCKED/);
 assert.ok(F3.checks.photoOriginalIdentity.startsWith('PARTIALLY TESTED'));
 const decision=F3.ownerDecision;
 assert.match(decision.state,/^VERIFIED \(alleen expliciete eigenaar-keuze/);
 assert.equal(decision.choice,'C: voorlopig doorgaan met gedocumenteerde open punten');
 assert.equal(decision.date,'2026-11-22');
 assert.equal(decision.id,id);
 assert.match(decision.scope,/Uitsluitend het aan de eigenaar gemelde R42-dossier/);
 assert.equal(decision.sourcePR,'https://github.com/saddamsmit-source/Birdspot-Library/pull/344#issuecomment-7079680036');
 assert.equal(F3.reviewedOriginalAudio,0);
 const paths=expected[id];
 assert.deepEqual(currentAssets.imageSlots.map(x=>x.path),paths);
 assert.deepEqual(F3.photoFilesInspected,paths.length);
 assert.equal(F3.photoBlobSHAs.length,paths.length);
 assert.equal(guideHeroPhoto(id).image,paths[0]);
 for(const [i,path] of paths.entries()){
   const bytes=read('..'+path);
   assert.ok(bytes.length>1000,id+' missing '+path);
   assert.match(F3.photoBlobSHAs[i],/^[a-f0-9]{40}$/);
   const sha=createHash('sha1').update('blob '+bytes.length+String.fromCharCode(0)).update(bytes).digest('hex');
   assert.equal(F3.photoBlobSHAs[i],sha,id+' inspected local photo changed');
 }
 assert.deepEqual(currentAssets.existingAudioPaths,[]);
 assert.equal(currentAssets.existingAudioCount,0);
 assert.equal((GUIDE_AUDIO[id]||[]).length,0);
 assert.equal((m.audio[id]||[]).length,0);
 assert.equal(sound.species.find(x=>x.id===id).status,'MISSING');
 const panel=recognitionPanel(species.get(id));
 assert.equal((panel.match(/<audio /g)||[]).length,0);
 assert.ok(!panel.includes('Status: Bevestigd'));
 const juv=GUIDE_PLUMAGE[id].juv;
 assert.equal(juv.image,paths[id==='sp177'?2:1]);
 assert.equal(GUIDE_POSES[id].length,1);
 assert.equal(GUIDE_POSES[id][0].image,paths.at(-1));
 assert.equal(GUIDE_POSES[id][0].flight,true);
 photoCount+=paths.length;
}
assert.equal(photoCount,10);
assert.match(m.poses.sp174[0].flightReview,/voorwaardelijk/i);
assert.match(m.poses.sp174[0].flightReview,/niet definitief/i);
assert.ok(f3.records.find(x=>x.id==='sp174').F3.findings.some(x=>/onscherp/.test(x)));
assert.match(species.get('sp174').plumage.adult_m,/lijken sterk op elkaar/);
assert.equal(species.get('sp174').plumage.adult_f,null);
assert.equal(species.get('sp176').plumage.adult_f,null);
assert.equal(GUIDE_PLUMAGE.sp177.adult_f.image,expected.sp177[1]);
const pair=GUIDE_COMPARISONS.find(x=>x.birds.length===2 &&
  x.birds.some(b=>b.id==='sp176') && x.birds.some(b=>b.id==='sp177'));
assert.ok(pair,'Grauwe-Bonte Vliegenvanger pair present');
assert.ok(pair.tip.includes('bruine'));
for(const [a,b] of [['sp176','sp177'],['sp177','sp176'],['sp174','sp029'],['sp029','sp174'],['sp174','sp034'],['sp034','sp174']]){
 const html=recognitionPanel(species.get(a));
 assert.match(html,new RegExp('data-compare-species="'+b+'"'),a+' missing peer '+b);
}
for(const id of ['sp167','sp170','sp173']){
 const d=f3.records.find(x=>x.id===id).F3.ownerDecision;
 assert.equal(d.choice,'C: voorlopig doorgaan met gedocumenteerde open punten');
 assert.equal(d.date,'2026-11-22');
 assert.match(d.state,/VERIFIED \(alleen expliciete eigenaar-keuze/);
 assert.ok(d.scope.includes('Uitsluitend R41'));
}
console.log('F3-R42 PASS: 10 unchanged photo blobs, no invented audio, conditional Zwarte Mees flight, cautious flycatcher pairs and scoped R41/R42 owner C.');
