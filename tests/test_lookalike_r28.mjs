/** F3-R28 — immutable local media bytes, explicit source/age/audio evidence ceiling. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const f3=load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media=load('../assets/species/field-guide-media.json');
const knowledge=load('../tools/kennisbaseline/knowledge.json');
const focus={
  "sp100": [
    [
      "assets/species/sp100.webp",
      "f532a2aeede3839b68173133e32e8f93282df815"
    ],
    [
      "assets/species/plumage/sp100-juv.webp",
      "53bacc67e275cb7577d993d5424b59c54487f7c0"
    ],
    [
      "assets/species/plumage/sp100-flight.webp",
      "ffd7364a28924240a7b2b53e579048afc2580469"
    ]
  ],
  "sp101": [
    [
      "assets/species/plumage/sp101-hero-male.webp",
      "5b9d30b79cb21455e62d3e2ee9d763be839aacc9"
    ],
    [
      "assets/species/sp101.webp",
      "f31f417f9de6d6c82820b3a522ddfcc9421d3f8b"
    ],
    [
      "assets/species/plumage/sp101-juv.webp",
      "4aab76ed09455123a290738b21b2cb8d574c4b68"
    ],
    [
      "assets/species/plumage/sp101-flight.webp",
      "f371612b9cdb58952961ad210c88dd2c8cc00315"
    ]
  ],
  "sp102": [
    [
      "assets/species/sp102.webp",
      "67490fe0859dbf4ad5a5626828ff6dde890ef5d8"
    ],
    [
      "assets/species/plumage/sp102-breeding.webp",
      "98c868b6a03af82a58d9e1c46c91be176605d4de"
    ],
    [
      "assets/species/plumage/sp102-juv.webp",
      "405b7d9fb5be9d10043706db383eacea8b2ec0a4"
    ],
    [
      "assets/species/plumage/sp102-flight.webp",
      "bc5c7f5e3291a30b9ce1ef10daf813e76259c056"
    ]
  ]
};
const ids=['sp100','sp101','sp102'];
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(x=>x.id)).size,140);
assert.ok(f3.counts.contentInspected>=84,'Later F3 rounds may add reviewed species');
assert.ok(f3.counts.nextNotStarted<=56,'Later F3 rounds may reduce remaining species');
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.counts.twentySeventhBatchStarted,3);
assert.equal(f3.counts.twentyEighthBatchStarted,3);
assert.equal(f3.records.filter(x=>x.F3.reviewedThisRound).length,f3.counts.contentInspected);
assert.equal(f3.records.filter(x=>x.F3.status==='NOT STARTED').length,f3.counts.nextNotStarted);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R28').map(x=>x.id),ids);
let inspected=0;
for(const id of ids){
 const r=f3.records.find(x=>x.id===id);
 assert.equal(r.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(r.F3.reviewedThisRound,true);
 assert.equal(r.F3.fullPass,false);
 assert.equal(r.F3.reviewedOriginalAudio,0);
 assert.equal(r.F3.photoFilesInspected,focus[id].length);
 assert.deepEqual(r.currentAssets.imageSlots.map(x=>x.path).sort(),focus[id].map(([p])=>'/'+p).sort());
 assert.deepEqual(Object.keys(r.F3.checks).sort(),[...f3.requiredChecks].sort());
 assert.ok(Object.values(r.F3.checks).every(x=>!x.startsWith('VERIFIED')),'Unjustified quality pass: '+id);
 assert.match(r.F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.match(r.F3.checks.audioRecordingsAuthenticity,/^NOT TESTED/);
 for(const [path,gitBlob] of focus[id]){
  const buffer=readFileSync(new URL('../'+path,import.meta.url));
  const sha=createHash('sha1').update(Buffer.from('blob '+buffer.length+'\0')).update(buffer).digest('hex');
  assert.equal(sha,gitBlob,'Local image content changed: '+path);
  inspected++;
 }
 const audios=media.audio[id]||[];
 assert.equal(audios.length, r.currentAssets.existingAudioCount);
 assert.deepEqual(audios.map(a=>a.audio).sort(),r.currentAssets.existingAudioPaths.slice().sort());
 for(const a of audios){
  assert.ok(a.author&&a.license&&a.source&&a.label);
  assert.ok(existsSync(new URL('..'+a.audio,import.meta.url)));
 }
}
assert.equal(inspected,11);
assert.equal((media.audio.sp100||[]).length,0);
assert.equal((media.audio.sp101||[]).length,0);
assert.equal(media.audio.sp102.length,4);
assert.equal(media.poses.sp102.find(p=>p.image.endsWith('/sp102-flight.webp')).latin,'Tringa totanus');
assert.match(media.poses.sp102[0].file,/robusta/,'Icelandic subspecies source must stay visible');
assert.ok(knowledge.sp100.critical.some(c=>c.vs?.includes('sp148')));
assert.ok(knowledge.sp101.critical.some(c=>c.vs?.includes('sp149')));
assert.ok(knowledge.sp102.critical.some(c=>c.vs?.includes('sp157')));
for(const id of ids)assert.ok(f3.records.find(x=>x.id===id).F3.sourceReferences.length>=3);
for(const earlier of ['F3-R25','F3-R26','F3-R27']) assert.equal(f3.records.filter(x=>x.F3.recheckBatch===earlier).length,3,'Historical batch '+earlier);
console.log('F3-R28 historical evidence PASS: 11 immutable local images, four source-labeled Redshank audio, 2 missing-audio species, historic caveats retained; current F3 reviewed='+f3.counts.contentInspected+'.');
