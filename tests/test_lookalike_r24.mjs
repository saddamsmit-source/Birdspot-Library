/** R24: current inventory, honest credit mismatches, sourced ranges and role distinctions. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {SPECIES} from '../src/data/species.js';import {KNOWLEDGE} from '../src/data/speciesKnowledge.js';
import {GUIDE_POSES} from '../src/features/species/guideMedia.js';
import {recognitionPanel,guidePlumageGroups,comparisonPhoto} from '../src/features/species/detailSections.js';
import {GUIDE_COMPARISONS} from '../src/features/species/guideComparisons.js';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const f3=read('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json');
const source=read('../docs/media-intake/2026-11-20/origcheck-r24/origcheck.json');
const visual=read('../docs/media-intake/2026-11-20/origcheck-r24/visual-review.json');
const birds=new Map(SPECIES.map(s=>[s.id,s]));
assert.equal(visual.photos.length,15);assert.ok(visual.photos.every(x=>x.automatedSameShot));
assert.equal(visual.photos.filter(x=>!x.automatedRightsMatch).length,5,'Keep automatic name mismatches separate');
for(const x of visual.photos){assert.equal(x.localSha256,createHash('sha256').update(readFileSync(new URL('..'+x.path,import.meta.url))).digest('hex'));if(!x.automatedRightsMatch)assert.ok(x.manualCreditCheck);}
assert.equal(source.items.filter(x=>x.kind==='audio').length,6);
assert.ok(source.items.filter(x=>x.kind==='audio').every(x=>x.rightsMatch&&!('sameShot' in x)));
const kwak=f3.records.find(x=>x.id==='sp085');assert.equal(kwak.historic.oldAssetCount,0);
assert.deepEqual(kwak.currentAssets.imageSlots.map(x=>x.path),['/assets/showcase/sp085.webp','/assets/species/plumage/sp085-juv.webp','/assets/species/plumage/sp085-flight.webp']);
assert.ok(KNOWLEDGE.sp085);assert.equal(KNOWLEDGE.sp121,undefined,'No knowledge profile without eligible guide photo');
for(const id of ['sp085','sp086','sp089']){assert.equal(birds.get(id).size.length,KNOWLEDGE[id].basis.biometrics.find(x=>x.field==='length').display);assert.ok(KNOWLEDGE[id].status.some(x=>x.kind==='trend'));}
assert.equal(GUIDE_POSES.sp086.find(x=>x.image.endsWith('sp086-juv.webp')).age,'chick');
assert.ok(!guidePlumageGroups(birds.get('sp086')).find(x=>x.key==='juv').photos.length);
assert.equal(GUIDE_POSES.sp089.find(x=>x.image.endsWith('/sp089-flight.webp')).flight,false);
assert.ok(GUIDE_POSES.sp089.find(x=>x.image.endsWith('sp089-free-flight.webp')).flight);
for(const [a,b] of [['sp085','sp081'],['sp085','sp084'],['sp086','sp121'],['sp089','sp129'],['sp089','sp090']])for(const [id,other] of [[a,b],[b,a]])assert.ok(recognitionPanel(birds.get(id)).includes(`data-compare-species="${other}"`),`${id} missing ${other}`);
for(const c of GUIDE_COMPARISONS.filter(c=>c.birds.some(x=>x.id==='sp089')&&!c.birds.some(x=>x.photoMissing))){assert.ok(c.rows?.length>=2);assert.ok(c.birds.every(x=>comparisonPhoto(x,!!c.flight)?.image));}
assert.deepEqual(f3.records.filter(x=>x.F3.recheckBatch==='F3-R24').map(x=>x.id),['sp085','sp086','sp089']);assert.equal(f3.counts.contentInspected,f3.records.filter(x=>x.F3.reviewedThisRound).length);assert.equal(f3.counts.F3FullPass,0);
console.log('F3-R24 PASS: 15 unchanged original-matched photos, five automatic credit mismatches retained, six audio rights-only checks, current Kwak inventory, chick/juvenile and landing/free-flight roles, sourced size bands and reciprocal comparisons.');
