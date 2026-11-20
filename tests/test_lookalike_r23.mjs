/** R23: prevent a geographically mismatched juvenile from returning to the guide. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SPECIES} from '../src/data/species.js';
import {KNOWLEDGE} from '../src/data/speciesKnowledge.js';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
import {recognitionPanel,guidePlumageGroups,comparisonPhoto} from '../src/features/species/detailSections.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const media=read('../assets/species/field-guide-media.json');
const f3=read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const visual=read('../docs/media-intake/2026-11-20/origcheck-r23/visual-review.json');
const blocked=read('../docs/media-intake/2026-11-20/origcheck-r23/xeno-source-access.json');
const comparisonPartners=read('../docs/media-intake/2026-11-20/origcheck-r23-cattle/visual-review.json');
assert.equal(comparisonPartners.photos.length,2);
for(const p of comparisonPartners.photos) {assert.equal(p.automatedSameShot,true);assert.equal(p.rightsMatch,true);}
const birds=new Map(SPECIES.map(x=>[x.id,x]));
for(const c of GUIDE_COMPARISONS.filter(c=>c.birds.some(x=>x.id==='sp245')&&c.birds.some(x=>['sp082','sp083'].includes(x.id)))) {assert.ok(c.birds.every(x=>!x.photoMissing),'Existing complete cattle-egret pairs must survive');assert.ok(c.rows?.length>=2,'Two explicit distinguishing rows must accompany cattle-egret photos');assert.ok(c.birds.every(x=>comparisonPhoto(x,false)?.image),'Both actual photos required');}
const path='/assets/species/plumage/sp083-juv.webp';
assert.equal(media.plumage.sp083.juv,undefined);
const batch=read('../docs/fotokwaliteit/soortaudit/M8.json').species.sp083;
assert.equal(batch.assets[path],undefined);
assert.equal(batch.retiredAssets[path].retiredIn,'F3-R23');
const old=media.retired.sp083.find(x=>x.image===path);
assert.equal(old.author,'Annette Herz');assert.equal(old.retiredFrom,'plumage.sp083.juv');
assert.match(old.retiredReason,/California.*CSNA/);assert.ok(existsSync(new URL('..'+path,import.meta.url)));
assert.ok(!recognitionPanel(birds.get('sp083')).includes(path));
assert.ok(!guidePlumageGroups(birds.get('sp083')).some(g=>g.photos.some(x=>x.image===path)));
assert.ok(!f3.records.find(x=>x.id==='sp083').currentAssets.imageSlots.some(x=>x.path===path));
assert.equal(visual.photos.length,12);assert.equal(visual.photos.filter(x=>x.publication==='WITHHELD').length,1);
for(const p of visual.photos){assert.equal(p.automatedSameShot,true);assert.equal(p.rightsMatch,true);assert.equal(p.localSha256,createHash('sha256').update(readFileSync(new URL('..'+p.path,import.meta.url))).digest('hex'));}
assert.equal(blocked.items.length,3);assert.ok(blocked.items.every(x=>x.rightsStatus.startsWith('BLOCKED')),'Blocked fresh rights checks must not become VERIFIED');
for(const [a,b] of [['sp082','sp083'],['sp082','sp245'],['sp083','sp245'],['sp083','sp081'],['sp084','sp081'],['sp084','sp085'],['sp084','sp243']]){
 for(const [id,other] of [[a,b],[b,a]])assert.ok(recognitionPanel(birds.get(id)).includes(`data-compare-species="${other}"`),`${id} missing reverse ${other}`);
}
for(const id of ['sp245','sp243'])assert.equal(KNOWLEDGE[id],undefined,'No unrelated knowledge profiles added');
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R23').map(x=>x.id),['sp082','sp083','sp084']);
assert.equal(f3.counts.contentInspected,69);assert.equal(f3.counts.F3FullPass,0);
console.log('F3-R23 PASS: California juvenile withheld with provenance/bytes preserved, 12 image hashes, fresh audio-source blocks honest, all seven comparisons reciprocal, fixed 140 cohort.');
