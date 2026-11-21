/** F3-R29 — immutable local media, equal female photo roles and honest evidence gates. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
import {GUIDE_POSES,GUIDE_PLUMAGE,GUIDE_AUDIO} from '../src/features/species/guideMedia.js';
import {comparisonPhoto,recognitionPanel} from '../src/features/species/detailSections.js';
import {SPECIES} from '../src/data/species.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const f3=load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const media=load('../assets/species/field-guide-media.json');
const guideCredits=load('../assets/species/credits.json');
const knowledge=load('../tools/kennisbaseline/knowledge.json');
const focus={
  "sp104": [
    [
      "assets/species/sp104.webp",
      "ca55b93f39a5b4d9106c55f4d5bc0d1a31604c56"
    ],
    [
      "assets/species/plumage/sp104-jaarling.webp",
      "4c6b806729e1998216f3b0ad64eed441c02031fe"
    ],
    [
      "assets/species/plumage/sp104-flight.webp",
      "59731ea10a8c024c8b3a8d1071d66460b65f914b"
    ]
  ],
  "sp105": [
    [
      "assets/species/sp105.webp",
      "9818d203b4b033bd16e5ec9b7bd3bb3a32eb0390"
    ],
    [
      "assets/species/plumage/sp105-adult_f.webp",
      "a9bd982991d429a3868b8fb8b95bf11cc46ec541"
    ],
    [
      "assets/species/plumage/sp105-juv.webp",
      "c801b6d9f0b422de779f925228183719162a74e5"
    ],
    [
      "assets/species/plumage/sp105-flight.webp",
      "be8009da263cd6d1e219133ac362084500f9a6a4"
    ]
  ],
  "sp106": [
    [
      "assets/species/plumage/sp106-hero-male.webp",
      "8c69f8c814ea68237c80ced0e4af80480aa92afe"
    ],
    [
      "assets/species/plumage/sp106-adult_f.webp",
      "cb90814eab9a79c7de5e2b071830d40cb32f82a8"
    ],
    [
      "assets/species/plumage/sp106-juv.webp",
      "ab9aed623583a4dbc70166baa408c5d93841d463"
    ],
    [
      "assets/species/plumage/sp106-flight.webp",
      "118c3b13c51b3e3dda543668631210e00ea228ac"
    ],
    [
      "assets/species/sp106.webp",
      "6c4e4d59bd21ff8f9a34d06bda777b1a7231c940"
    ]
  ]
};
const ids=['sp104','sp105','sp106'];
const birds=new Map(SPECIES.map(b=>[b.id,b]));
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(r=>r.id)).size,140);
assert.ok(f3.counts.contentInspected>=87,'Subsequent F3 rounds may increase reviewed count');
assert.ok(f3.counts.nextNotStarted<=53,'Subsequent F3 rounds may reduce remaining count');
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.counts.twentyEighthBatchStarted,3);
assert.equal(f3.counts.twentyNinthBatchStarted,3);
assert.equal(f3.records.filter(r=>r.F3.reviewedThisRound).length,f3.counts.contentInspected);
assert.equal(f3.records.filter(r=>r.F3.status==='NOT STARTED').length,f3.counts.nextNotStarted);
assert.deepEqual(f3.records.filter(r=>r.F3.recheckBatch==='F3-R29').map(r=>r.id),ids);
let inspected=0;
for(const id of ids){
 const row=f3.records.find(r=>r.id===id);
 assert.equal(row.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(row.F3.reviewedThisRound,true);
 assert.equal(row.F3.recheckBatch,'F3-R29');
 assert.equal(row.F3.fullPass,false);
 assert.equal(row.F3.reviewedOriginalAudio,0);
 assert.equal(row.F3.photoFilesInspected,focus[id].length);
 assert.deepEqual(row.currentAssets.imageSlots.map(x=>x.path).sort(),focus[id].map(([path])=>'/'+path).sort());
 assert.deepEqual(Object.keys(row.F3.checks).sort(),[...f3.requiredChecks].sort());
 assert.ok(Object.values(row.F3.checks).every(x=>!x.startsWith('VERIFIED')),'False FULL PASS or component PASS: '+id);
 assert.match(row.F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.match(row.F3.checks.audioRecordingsAuthenticity,/^NOT TESTED/);
 assert.ok(row.F3.sourceReferences.length>=4);
 assert.ok(row.F3.findings.length>=3);
 const credit=guideCredits[id];
 assert.ok(credit?.author && credit.license && credit.source,'Main image source/rights missing: '+id);
 for(const [path,gitBlobSHA1] of focus[id]){
  const bytes=readFileSync(new URL('../'+path,import.meta.url));
  const hash=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  assert.equal(hash,gitBlobSHA1,'Unexpected R29 source image bytes changed '+path);
  inspected++;
 }
 const records=media.audio[id]||[];
 assert.equal(records.length,row.currentAssets.existingAudioCount);
 assert.deepEqual(records.map(x=>x.audio).sort(),row.currentAssets.existingAudioPaths.slice().sort());
 for(const rec of records){
  assert.ok(rec.author && rec.source && rec.license && rec.audio);
  assert.ok(existsSync(new URL('..'+rec.audio,import.meta.url)),'Missing registered audio '+rec.audio);
 }
}
assert.equal(inspected,12);
assert.equal((media.audio.sp105||[]).length,0);
assert.equal((media.audio.sp106||[]).length,0);
assert.equal(media.audio.sp104.length,1);
assert.match(media.audio.sp104[0].source,/964802/);
const yearling=GUIDE_PLUMAGE.sp104.jaarling;
assert.match(yearling.source,/Great_cormorant_immature/);
assert.match(yearling.verification,/vorjähriger/);
assert.equal(yearling.flight,undefined,'Standing yearling drying wings must never be flight photo');
assert.ok(GUIDE_POSES.sp104.some(p=>p.flight && p.image.endsWith('/sp104-flight.webp')));
assert.ok(GUIDE_POSES.sp105.some(p=>p.flight && p.sex==='male' && p.image.endsWith('/sp105-flight.webp')));
const provisional=GUIDE_POSES.sp106.find(p=>p.image.endsWith('/sp106-flight.webp'));
assert.equal(provisional.flight,true);
assert.match(provisional.flightReview,/voorwaardelijk/);
assert.equal(provisional.width,450);
assert.equal(provisional.height,300);
const pair=GUIDE_COMPARISONS.find(c=>c.label==='Fazant en Patrijs · volwassen');
assert.ok(pair && pair.birds.map(x=>x.id).join(',')==='sp105,sp106');
assert.equal(pair.birds[0].plumage,'adult_f');
assert.equal(pair.birds[1].plumage,'adult_f','Must compare Fazant hen against Patrijs female, not a generic male hero');
assert.equal(comparisonPhoto(pair.birds[0],false)?.image,'/assets/species/plumage/sp105-adult_f.webp');
assert.equal(comparisonPhoto(pair.birds[1],false)?.image,'/assets/species/plumage/sp106-adult_f.webp');
for(const [id,partner] of [['sp105','sp106'],['sp106','sp105']])
 assert.match(recognitionPanel(birds.get(id)),new RegExp('data-compare-species="'+partner+'"'),'Reciprocal comparison missing');
assert.ok(knowledge.sp104.similar.some(x=>x.id==='sp242'));
assert.ok(knowledge.sp105.similar.some(x=>x.id==='sp106'));
assert.ok(knowledge.sp106.similar.some(x=>x.id==='sp105'));
for(const earlier of ['F3-R25','F3-R26','F3-R27','F3-R28'])assert.equal(f3.records.filter(r=>r.F3.recheckBatch===earlier).length,3,'Historic cohort loss: '+earlier);
console.log('F3-R29 historical evidence PASS: 12 immutable local images, source-labeled audio, female/female Fazant-Patrijs comparison, provisional Patrijs flight; latest reviewed='+f3.counts.contentInspected+'.');
