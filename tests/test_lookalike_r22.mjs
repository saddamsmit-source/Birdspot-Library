/** R22: source evidence, age roles, honest flight caption and reciprocal text. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel, guidePlumageGroups } from '../src/features/species/detailSections.js';
const read = p => JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const data = read('../docs/media-intake/2026-11-20/origcheck-r22/origcheck.json');
const partner = read('../docs/media-intake/2026-11-20/origcheck-r22-partners/origcheck.json');
const visual = read('../docs/media-intake/2026-11-20/origcheck-r22/visual-review.json');
const birds = new Map(SPECIES.map(s=>[s.id,s]));
const panel = id => recognitionPanel(birds.get(id));
const live = data.items.filter(x=>x.image), audio=data.items.filter(x=>x.kind==='audio');
assert.equal(live.length,10); assert.equal(partner.items.length,5); assert.equal(audio.length,6);
assert.ok([...data.items,...partner.items].every(x=>x.rightsMatch===true));
assert.equal(live.filter(x=>x.sameShot).length,9);
assert.ok(partner.items.every(x=>x.sameShot));
const crop=live.find(x=>x.image.endsWith('sp078-flight.webp'));
assert.equal(crop.sameShot,false,'keep automatic crop uncertainty');
assert.ok(crop.r<data.rule.sameMinR);
for(const x of visual.photos) {
  const bytes=readFileSync(new URL('..'+x.path,import.meta.url));
  assert.equal(x.localSha256,createHash('sha256').update(bytes).digest('hex'));
  assert.equal(x.automatedSameShot,[...live,...partner.items].find(a=>a.image===x.path).sameShot);
}
for(const x of audio) {
  assert.ok(!('sameShot' in x));
  assert.match(x.evidenceCeiling,/geen soortverificatie/);
}
const juv=guidePlumageGroups(birds.get('sp078')).find(g=>g.key==='juv');
assert.ok(juv.photos.some(x=>x.image.endsWith('sp078-juv-grown.webp')));
assert.ok(!juv.photos.some(x=>x.image.endsWith('/sp078-juv.webp')),'a downy chick is not the older juvenile comparison');
assert.equal(GUIDE_POSES.sp078.find(x=>x.image.endsWith('/sp078-juv.webp')).age,'chick');
for(const c of GUIDE_COMPARISONS.filter(c=>c.flight&&c.birds.some(b=>b.id==='sp081'))) {
  const index=c.birds.findIndex(b=>b.id==='sp081');
  const row=c.rows.find(r=>r.label==='Hals');
  assert.match(row.values[index],/op deze foto relatief gestrekt/);
}
const bio=KNOWLEDGE.sp078.basis.biometrics.find(x=>x.field==='length');
assert.deepEqual(bio.values.map(x=>[x.min,x.max]),[[36,42],[38,45]]);
assert.equal(birds.get('sp078').size.length,bio.display);
assert.ok(KNOWLEDGE.sp078.discrepancies.some(x=>/Historisch 36–42/.test(x.app)));
for(const [a,b] of [['sp078','sp079'],['sp079','sp080'],['sp081','sp084'],['sp081','sp085']]) {
  assert.ok(panel(a).includes(`data-compare-species="${b}"`));
  assert.ok(panel(b).includes(`data-compare-species="${a}"`));
}
assert.equal(KNOWLEDGE.sp080,undefined,'photo-first knowledge-profile scope remains intact');
assert.ok(panel('sp080').includes('data-text-similar'));
for(const id of ['sp078','sp079','sp081']) assert.ok(KNOWLEDGE[id].status.some(x=>x.kind==='trend'));
console.log('F3-R22 PASS: 10 focus + 5 partner images, 6 audio rights only, crop result retained, chick/juvenile roles, corrected neck caption, reciprocal comparisons and sourced size method.');
