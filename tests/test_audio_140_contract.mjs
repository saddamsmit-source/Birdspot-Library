/** Audio audit ledger + three-species pilot, source facts vs independent review strictly separated. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO } from '../src/features/species/guideMedia.js';
import { voicePanel } from '../src/features/species/detailSections.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const ledger = read('../docs/audio/AUDIO_140_AUDIT_REGISTER_V0.1_DRAFT.json');
const registry = read('../assets/species/field-guide-media.json').audio;
const audit = read('../docs/fotokwaliteit/soortaudit-status.json');
const f2text = readFileSync(new URL('../docs/fotokwaliteit/F2_VOORTGANG_TOT_140.md', import.meta.url), 'utf8');
const f2Ids = new Set([...f2text.matchAll(/^\|\s*(sp\d{3})\s+[^\n|]+\|/gm)].map(x => x[1]));
const speciesById = new Map(SPECIES.map(x => [x.id, x]));
const ids = audit.species.map(x => x.id);
assert.equal(ids.length, 140, 'Canonical photo cohort must contain exactly 140');
assert.equal(new Set(ids).size, 140, 'Every cohort member has a unique ID');
assert.deepEqual(ledger.species.map(x => x.id), ids, 'Audio ledger matches photo cohort, in same order');
assert.deepEqual(GUIDE_AUDIO, registry, 'Generated JS audio must match original JSON audio register');

let withAudio=0, clips=0, f2With=0, f2Missing=0, fullyVerified=0;
for (const entry of ledger.species) {
  const bird=speciesById.get(entry.id);
  assert.ok(bird, 'Unknown Birdspot ID ' + entry.id);
  assert.equal(entry.nameNL, bird.nameNL);
  assert.equal(entry.f2PhotoVisited, f2Ids.has(entry.id), entry.id + ' F2 photo status drift');
  const declared=registry[entry.id] || [];
  assert.equal(entry.mediaCount, declared.length, entry.id + ' registered sound count changed without QA update');
  assert.deepEqual(entry.clips.map(x => x.file), declared.map(x => x.audio));
  if (!declared.length) assert.equal(entry.status, 'MISSING');
  else assert.ok(['REGISTERED_UNVERIFIED','PARTIALLY TESTED','VERIFIED'].includes(entry.status),
    entry.id+' unknown audio QA status');
  if (declared.length) {
    withAudio++;
    if(entry.status==='VERIFIED') fullyVerified++;
    if(f2Ids.has(entry.id))f2With++;
    const html=voicePanel(bird,null);
    assert.ok(html.includes('sd-audio'), entry.id + ' audio is not rendered in species detail');
    for(let i=0;i<declared.length;i++){
      const c=declared[i],ev=entry.clips[i];
      for(const field of ['audio','label','source','author','license','licenseUrl']){
        assert.ok(typeof c[field]==='string' && c[field].trim(),entry.id+' missing '+field);
      }
      assert.match(c.source, /^https:\/\//);
      assert.ok(html.includes(c.audio), entry.id + ' browser player omits '+c.audio);
      for(const k of ['sourceSpecies','externalRights','roleAudition','independentReview']){
        assert.ok(['NOT TESTED','PARTIALLY TESTED','VERIFIED'].includes(ev[k]),entry.id+' invalid '+k+' status');
      }
      if(entry.status==='VERIFIED'){
        for(const k of ['sourceSpecies','externalRights','roleAudition','independentReview'])
          assert.equal(ev[k],'VERIFIED',entry.id+' unverified '+k+' in a VERIFIED bird');
        assert.ok(entry.reviewEvidence?.length>=1,entry.id+' no original source evidence for VERIFIED result');
      }
      const local=new URL('..'+c.audio,import.meta.url);
      assert.ok(existsSync(local), entry.id+' local audio missing '+c.audio);
      assert.ok(statSync(local).size>1024,entry.id+' audio too small '+c.audio);
      clips++;
    }
  } else if (f2Ids.has(entry.id))f2Missing++;
}
assert.equal(f2Ids.size, ledger.counts.f2PhotoVisited, 'F2 progress must move together with audio ledger');
assert.equal(withAudio, ledger.counts.withRegisteredAudio);
assert.equal(ledger.counts.withoutRegisteredAudio,140-withAudio);
assert.equal(clips,ledger.counts.registeredClips);
assert.equal(f2With,ledger.counts.f2WithAudio);
assert.equal(f2Missing,ledger.counts.f2WithoutAudio);
assert.equal(ledger.counts.independentlyApprovedAudio,fullyVerified,
  'A verified per-bird sound status must have auditable original-source/review evidence');
const pilot=['sp045','sp056','sp057'];
assert.deepEqual([...ledger.selectedPilotIds].sort(),pilot);
for (const id of pilot) {
  const e=ledger.species.find(x=>x.id===id);
  assert.ok(e.pilot && e.clips.length>=2,id+' should have both song and call reference clips');
  assert.ok(registry[id].some(x=>/zang/i.test(x.label)),id+' missing song example');
  assert.ok(registry[id].some(x=>/roep/i.test(x.label)),id+' missing call example');
}
console.log('BIRDSPOT AUDIO-140 REGISTER PASS: '+withAudio+'/140 have '+clips+' locally present registered clips; '+
 (140-withAudio)+' species have no registered example; '+f2With+' of '+f2Ids.size+
 ' F2 photo-reviewed species have audio. Registered files are NOT independently voice/right verified.');
console.log('PILOT CONTRACT PASS: Merel, Tjiftjaf and Fitis have declared song+call and local files; '+
 'no acoustical classification, external license approval or real-device inference is claimed.');
