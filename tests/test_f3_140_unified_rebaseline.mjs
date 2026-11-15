/** F3: protect the original 140 cohort, prior evidence, and the new no-false-PASS gate. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
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
 assert.equal(x.historic.oldAssetCount,o.assets?.length||0);
 assert.equal(x.historic.oldF2Visited,f2Set.has(x.id),x.id+' previous F2 evidence drift');
 assert.equal(x.currentAssets.existingAudioCount,registered.length);
 assert.deepEqual(x.currentAssets.existingAudioPaths,registered.map(y=>y.audio));
 assert.deepEqual(x.currentAssets.imageSlots.map(y=>y.path),(o.assets||[]).map(y=>y.image));
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
 nextNotStarted:sum(x=>x.F3.status==='NOT STARTED')
};
assert.deepEqual(j.counts,counts,'F3 summary must be recalculated when a batch advances');
assert.equal(counts.audioPresent,tracker.counts.withRegisteredAudio);
assert.equal(counts.audioMissing,tracker.counts.withoutRegisteredAudio);
const first=rows.filter(x=>x.F3.recheckBatch==='F3-R01');
assert.deepEqual(first.map(x=>x.id),['sp002','sp003','sp004'],'restart first three birds');
for(const item of first){
 assert.equal(item.F3.photoFilesInspected,3);
 assert.equal(item.F3.photoBlobSHAs?.length,3);
 assert.equal(item.F3.audioCandidate.imported,false,'never fake audio into official species media');
 assert.equal(item.F3.fullPass,false,'not all updated requirements met');
 assert.equal(item.F3.status,'IN REVIEW / BLOCKED');
}
console.log('F3 140 REBASELINE PASS: 140 IDs preserved, historic F2 '+counts.oldF2Touched+
 ' retained; rechecked first '+first.length+' only; '+counts.audioMissing+
 ' birds still missing registered sound, no fabricated full PASS.');
