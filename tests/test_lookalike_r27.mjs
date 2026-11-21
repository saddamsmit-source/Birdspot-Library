/** F3-R27: Kokmeeuw historical zero correction, 11 unchanged real images, no false approvals. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SPECIES} from '../src/data/species.js';
import {GUIDE_HEROES} from '../src/features/species/guideMedia.js';
import {guideHeroPhoto,recognitionPanel} from '../src/features/species/detailSections.js';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const f3=load('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const old=load('../docs/fotokwaliteit/soortaudit-status.json');
const f2=load('../docs/fotokwaliteit/F2_31_BRON_EN_LIMIETEN.json');
const media=load('../assets/species/field-guide-media.json');
const knowledge=load('../tools/kennisbaseline/knowledge.json');
const ids=['sp097','sp098','sp099'];
const birds=new Map(SPECIES.map(s=>[s.id,s]));
assert.equal(f3.records.length,140);
assert.equal(new Set(f3.records.map(x=>x.id)).size,140);
assert.equal(f3.counts.contentInspected,81);
assert.equal(f3.counts.nextNotStarted,59);
assert.equal(f3.counts.F3FullPass,0);
assert.equal(f3.counts.contentComplete,0);
assert.equal(f3.counts.twentySeventhBatchStarted,3);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R27').map(x=>x.id),ids);
assert.equal(f3.records.filter(x=>x.F3.reviewedThisRound).length,81);
assert.equal(f3.records.filter(x=>x.F3.status==='NOT STARTED').length,59);
assert.ok(f3.records.every(x=>x.F3.fullPass===false));
const expectedPhotoPaths={
 sp097:['/assets/species/sp097.webp','/assets/species/plumage/sp097-winter.webp','/assets/species/plumage/sp097-flight.webp'],
 sp098:['/assets/species/sp098.webp','/assets/species/plumage/sp098-juv.webp','/assets/species/plumage/sp098-flight.webp'],
 sp099:['/assets/species/plumage/sp099-adult_m.webp','/assets/species/plumage/sp099-adult_f.webp','/assets/species/plumage/sp099-juv.webp','/assets/species/plumage/sp099-flight.webp','/assets/species/sp099.webp']
};
const expectedKievitBlobs=[
 '493e08dfdaae93826d99785e0b4eb8e14a2d0939','f5e9efdbf8e98995854d6d4cfed08eee63a4a679',
 '0ca3b9a2c35976021bd37b015712620ae6798ac4','deaf83822ceff4aa5cb3943c09ca775d83c902bb',
 'ebb9a8faeba9259e1e5e0dae91abc06839897538'
];
const shaOfBlob=buf=>createHash('sha1').update(Buffer.from('blob '+buf.length+'\0')).update(buf).digest('hex');
let n=0;
for(const id of ids){
 const row=f3.records.find(x=>x.id===id),assets=expectedPhotoPaths[id],historical=old.species.find(x=>x.id===id);
 assert.ok(row && historical);
 assert.equal(row.F3.status,'IN CONTENT REVIEW / OPEN POINTS');
 assert.equal(row.F3.reviewedThisRound,true);
 assert.equal(row.F3.fullPass,false);
 assert.equal(row.F3.recheckBatch,'F3-R27');
 assert.deepEqual(row.currentAssets.imageSlots.map(x=>x.path),assets);
 assert.equal(row.F3.photoFilesInspected,assets.length);
 assert.equal(row.F3.photoBlobSHAs.length,assets.length);
 assert.equal(row.F3.reviewedOriginalAudio,0);
 assert.equal(row.F3.independence.includes('independent'),true);
 assert.equal(row.currentAssets.existingAudioCount,0);
 assert.deepEqual(row.currentAssets.existingAudioPaths,[]);
 assert.equal((media.audio[id]||[]).length,0);
 assert.ok(row.F3.findings.length>=3 && row.F3.sourceReferences.length>=3);
 assert.deepEqual(Object.keys(row.F3.checks).sort(),f3.requiredChecks.slice().sort());
 for(const key of ['audioRecordingsAuthenticity','audioLicenseAndAttribution','soundRolesSongCall','independentSecondReview'])
  assert.match(row.F3.checks[key],/^NOT TESTED/,id+' '+key+' must stay unapproved');
 for(const s of Object.values(row.F3.checks))assert.ok(!s.startsWith('VERIFIED'),'No fresh source PASS: '+id);
 for(let i=0;i<assets.length;i++){
  const path=assets[i],target=new URL('..'+path,import.meta.url);
  assert.ok(existsSync(target),id+' missing local image '+path);
  const bytes=readFileSync(target),gitBlob=shaOfBlob(bytes);
  assert.equal(row.F3.photoBlobSHAs[i],gitBlob,id+' local bytes changed: '+path);
  if(id==='sp099'){
    assert.equal(gitBlob,expectedKievitBlobs[i],'Kievit original byte identity changed');
  }else{
    const historicalF2=f2.images.find(x=>x.species===id&&x.image===path);
    assert.ok(historicalF2&&historicalF2.registeredAuthor&&historicalF2.registeredLicense&&historicalF2.source);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),historicalF2.sha256,'F2 SHA256 changed '+path);
  }
  n++;
 }
}
assert.equal(n,11);
const kok=f3.records.find(x=>x.id==='sp097'),oldK=old.species.find(x=>x.id==='sp097');
assert.equal(oldK.audited,false);
assert.equal(oldK.verdict,'NOT TESTED');
assert.equal((oldK.assets||[]).length,0);
assert.equal(kok.historic.oldAssetCount,0,'Historical zero must survive updated inventory');
assert.equal(kok.historic.audited,false,'Historical audit cannot be upgraded by this review');
assert.equal(kok.currentAssets.imageSlots.length,3,'Three existing Kokmeeuw files must be registered now');
const gallery=recognitionPanel(birds.get('sp097')).split('<section class="sd-similar"')[0];
const onScreen=[guideHeroPhoto('sp097')?.image,...Array.from(gallery.matchAll(/data-guide-image="([^"]+)"/g),m=>m[1])].filter(Boolean);
assert.deepEqual(onScreen,expectedPhotoPaths.sp097,'F3 Kokmeeuw current assets must match actual own gallery');
assert.equal(knowledge.sp097,undefined,'No invented knowledge profile without separately sourced review');
const winter=GUIDE_COMPARISONS.filter(c=>c.birds.some(b=>b.id==='sp097')&&c.birds.some(b=>b.id==='sp096'));
assert.ok(winter.length>=1);
assert.ok(winter.every(c=>c.birds.some(b=>b.id==='sp096'&&b.textOnly===true)),'Stormmeeuw has no verified winter photo pair');
assert.ok(GUIDE_COMPARISONS.some(c=>c.birds.some(b=>b.id==='sp097')&&c.birds.some(b=>b.id==='sp225')));
assert.ok(GUIDE_COMPARISONS.some(c=>c.birds.some(b=>b.id==='sp098')&&c.birds.some(b=>b.id==='sp143')));
assert.ok(GUIDE_COMPARISONS.some(c=>c.birds.some(b=>b.id==='sp099')&&c.birds.some(b=>b.id==='sp144')));
assert.equal(birds.get('sp098').size.wingspan,'80–86 cm');
assert.ok(knowledge.sp098.discrepancies.some(x=>x.field==='spanwijdte'&&x.source.includes('72–83')),'Scholekster mismatch must remain open');
assert.equal(birds.get('sp099').size.wingspan,'ca. 80–85 cm');
assert.equal(GUIDE_HEROES.sp099,expectedPhotoPaths.sp099[0]);
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R26').map(x=>x.id),['sp094','sp095','sp096']);
console.log('F3-R27 PASS: 81 content reviewed, 59 not started, 0 FULL PASS, Kokmeeuw historic 0/current 3 and gallery match, 11 unchanged images, 3 absent audios and source gaps retained.');
