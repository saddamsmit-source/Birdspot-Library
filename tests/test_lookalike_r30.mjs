/** F3-R30: old zero != current photo zero, no silent free-flight or audio PASS. */
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SPECIES} from '../src/data/species.js';
import {GUIDE_HEROES,GUIDE_POSES,GUIDE_PLUMAGE} from '../src/features/species/guideMedia.js';
import {GUIDE_PHOTOS} from '../src/features/species/guidePhotos.js';
import {guideHeroPhoto,recognitionPanel,comparisonPhoto} from '../src/features/species/detailSections.js';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const f3=load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const audit=load('../docs/fotokwaliteit/soortaudit-status.json');
const credits=load('../assets/species/credits.json');
const media=load('../assets/species/field-guide-media.json');
const knowledge=load('../tools/kennisbaseline/knowledge.json');
const focus={
  "sp108": [
    [
      "assets/showcase/sp108.webp",
      "aab77a5b109b6cc3e65670c17a79a417c69dfcd9"
    ],
    [
      "assets/species/plumage/sp108-flight.webp",
      "cc77338228b820f351259cc726d407d2282157fc"
    ]
  ],
  "sp110": [
    [
      "assets/species/sp110.webp",
      "5008b929f93623bde84234f7cdd3a61821597b0f"
    ],
    [
      "assets/species/plumage/sp110-flight.webp",
      "5f13b186962bac8190a5f734d2056b279f14084b"
    ]
  ],
  "sp112": [
    [
      "assets/species/plumage/sp112-hero-male.webp",
      "78af86b57c29d6928734b63bcb1f2da6ef86550c"
    ],
    [
      "assets/species/plumage/sp112-adult_f.webp",
      "9fa69a95d9e7800b88ab5ccdcd60ff38abfb5f8b"
    ],
    [
      "assets/species/plumage/sp112-juv.webp",
      "bdd13d263dff84b531cea61bf5d4e14243af3311"
    ],
    [
      "assets/species/plumage/sp112-flight.webp",
      "2ff77c446528cdb5ae0b7db5a9e346379bf43a07"
    ],
    [
      "assets/species/sp112.webp",
      "7bfca1fa0a620d6da1e1cee5faa6b92312b1fbd5"
    ]
  ]
};
const birds=new Map(SPECIES.map(s=>[s.id,s]));
const ids=['sp108','sp110','sp112'];
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(x=>x.id)).size,140);
assert.ok(f3.counts.contentInspected >= 90, 'R30 checkpoint had at least 90 inspected species');
assert.ok(f3.counts.nextNotStarted <= 50, 'After R30 at most 50 species can remain unstarted');
assert.equal(f3.counts.thirtiethBatchStarted,3);
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.records.filter(x=>x.F3.reviewedThisRound).length,f3.counts.contentInspected);
assert.equal(f3.records.filter(x=>x.F3.status==='NOT STARTED').length,f3.counts.nextNotStarted);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R30').map(x=>x.id),ids);
let total=0;
for(const id of ids){
 const row=f3.records.find(x=>x.id===id),old=audit.species.find(x=>x.id===id);
 assert.ok(row && old);
 assert.equal(row.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(row.F3.fullPass,false);
 assert.equal(row.F3.reviewedOriginalAudio,0);
 assert.equal(row.F3.photoFilesInspected,focus[id].length);
 assert.equal(row.currentAssets.existingAudioCount,0);
 assert.deepEqual(row.currentAssets.existingAudioPaths,[]);
 assert.equal(media.audio[id]?.length??0,0);
 assert.equal(row.historic.oldAssetCount,(old.assets||[]).filter(a=>a.image).length);
 assert.equal(row.historic.audited,old.audited);
 assert.deepEqual(Object.keys(row.F3.checks).sort(),[...f3.requiredChecks].sort());
 for(const [key,status] of Object.entries(row.F3.checks))
   assert.ok(!status.startsWith('VERIFIED'),id+' falsely approved '+key);
 assert.match(row.F3.checks.audioRecordingsAuthenticity,/^NOT TESTED/);
 assert.match(row.F3.checks.independentSecondReview,/^NOT TESTED/);
 assert.ok(row.F3.sourceReferences.length>=4 && row.F3.findings.length>=3);
 assert.deepEqual(row.currentAssets.imageSlots.map(x=>x.path),focus[id].map(([path])=>'/'+path));
 assert.deepEqual(row.F3.photoBlobSHAs,focus[id].map(([,sha])=>sha));
 assert.ok(credits[id]?.author&&credits[id].source&&credits[id].license);
 for(const [path,expected] of focus[id]){
  const bytes=readFileSync(new URL('../'+path,import.meta.url));
  const gitSHA=createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
  assert.equal(gitSHA,expected,'Guide media changed without approval: '+path);
  total++;
 }
 const hero=guideHeroPhoto(id);
 assert.ok(hero?.image && existsSync(new URL('..'+hero.image,import.meta.url)),'Guide hero missing '+id);
}
assert.equal(total,9);
for(const id of ['sp108','sp110']){
 const row=f3.records.find(x=>x.id===id);
 assert.equal(row.historic.audited,false);
 assert.equal(row.historic.oldAssetCount,0);
 assert.equal(row.currentAssets.imageSlots.length,2,'Do not confuse old audit zero with current photo inventory');
 assert.equal(knowledge[id],undefined,'Do not falsely call a missing sourced knowledge profile complete');
}
assert.equal(GUIDE_PHOTOS.sp108.image,'/assets/showcase/sp108.webp');
assert.equal(GUIDE_PHOTOS.sp110.image,'/assets/species/sp110.webp');
assert.equal(GUIDE_HEROES.sp112,'/assets/species/plumage/sp112-hero-male.webp');
const groot=GUIDE_POSES.sp108.find(x=>x.image.endsWith('sp108-flight.webp'));
const riet=GUIDE_POSES.sp110.find(x=>x.image.endsWith('sp110-flight.webp'));
const spreeuw=GUIDE_POSES.sp112.find(x=>x.image.endsWith('sp112-flight.webp'));
assert.ok(groot.flight && /^voorwaardelijk/.test(groot.flightReview),'Great Reed Warbler low-quality flight must not be called final');
assert.equal(groot.width,724); assert.equal(groot.height,543);
assert.equal(riet.flight,false,'Sedge Warbler in branches is not free flight despite filename');
assert.ok(/^uit-rol/.test(riet.flightReview));
assert.ok(spreeuw.flight && !/^(voorwaardelijk|uit-rol)/.test(spreeuw.flightReview));
assert.ok(GUIDE_PLUMAGE.sp112.adult_m && GUIDE_PLUMAGE.sp112.adult_f && GUIDE_PLUMAGE.sp112.juv);
assert.equal(GUIDE_PLUMAGE.sp112.juv.age,'juvenile');
assert.ok(knowledge.sp112?.summary && knowledge.sp112.similar.some(x=>x.id==='sp045'));
const blackbird=GUIDE_COMPARISONS.filter(c=>c.birds.some(x=>x.id==='sp112')&&c.birds.some(x=>x.id==='sp045'));
assert.ok(blackbird.length>0,'Existing Spreeuw/Merel lookalike guidance must remain');
assert.ok(recognitionPanel(birds.get('sp112')).includes('data-compare-species="sp045"'));
for(const batch of ['F3-R25','F3-R26','F3-R27','F3-R28','F3-R29'])
 assert.equal(f3.records.filter(x=>x.F3.recheckBatch===batch).length,3,'Earlier F3 batch missing: '+batch);
console.log('F3-R30 historical evidence PASS: nine unchanged local images, old audit 0/0 but current 2/2, sp108 provisional flight, sp110 excluded from free flight; current F3 reviewed=' + f3.counts.contentInspected);
