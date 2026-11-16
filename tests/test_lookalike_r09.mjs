/** Birdspot F3-R09: structural lookalike guard, not a source/rights or real-device certification. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { comparisonPhoto, recognitionPanel } from '../src/features/species/detailSections.js';

const registry = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json',import.meta.url),'utf8'));
const norm = readFileSync(new URL('../docs/BIRDSPOT_KWALITEITSNORM.md',import.meta.url),'utf8');
const catalog = new Map(SPECIES.map(s => [s.id,s]));
assert.match(norm,/### 3\.4 Kritieke dubbelgangers/);
assert.match(norm,/alleen.*twee.*foto|twee.*foto.*alleen|uitsluitend twee.*foto/i);
assert.deepEqual(registry.focusSpecies,['sp034','sp035','sp036']);
assert.equal(registry.policy.criticalTraitsMax,3);
assert.equal(registry.policy.photoPanelOnlyIfBothVerified,true);
assert.equal(registry.policy.showTextWhenPhotosMissing,true);

const seenIds=new Set(), focusUsed=new Set();
function mediaRegistered(id) {
  return Boolean(GUIDE_PHOTOS[id] ||
    Object.values(GUIDE_PLUMAGE[id] || {}).some(photo=>photo?.image) ||
    (GUIDE_POSES[id]||[]).some(photo=>photo?.image));
}
for(const pair of registry.pairs) {
  assert.ok(!seenIds.has(pair.id), 'Duplicate lookalike pair ID '+pair.id);
  seenIds.add(pair.id);
  assert.equal(pair.birds.length,2);
  assert.equal(new Set(pair.birds).size,2);
  assert.ok(pair.birds.every(id=>catalog.has(id)),'Missing species in lookalike pair');
  assert.equal(pair.matchingPlumages.length,2);
  assert.ok(pair.focus.some(id=>registry.focusSpecies.includes(id)) || pair.id === 'LK-006');
  pair.focus.forEach(id=>focusUsed.add(id));
  assert.ok(pair.criticalMarks.length>=2 && pair.criticalMarks.length<=3);
  for(const mark of pair.criticalMarks) {
    assert.ok(mark.label.length>2 && mark.values.length===2 && mark.values.every(t=>t.length>12));
    assert.notEqual(mark.values[0],mark.values[1],'Not a real distinguishing trait');
  }
  assert.ok(pair.sources.length>=2 && pair.sources.every(u=>u.startsWith('https://')));
  assert.ok(pair.caution.length>25);
  assert.equal(pair.textState,'PARTIALLY TESTED'); // don't promote structural checks into ornithological PASS
  assert.ok(pair.mediaOpen.length>0);
  const matching = GUIDE_COMPARISONS.filter(c=>
    c.birds.length===2 && pair.birds.every(id=>c.birds.some(b=>b.id===id)) &&
    pair.matchingPlumages.every((plumage,i)=>
      !plumage || c.birds.find(b=>b.id===pair.birds[i])?.plumage===plumage));
  if(pair.photoState==='REGISTERED_PAIR_PENDING_F3_ORIGINAL') {
    assert.ok(matching.length,'Missing matching photo+text comparison: '+pair.id);
    for(const c of matching) {
      for(const bird of c.birds) {
        const photo = comparisonPhoto(bird,Boolean(c.flight));
        assert.ok(photo?.image && photo?.source?.startsWith('https://') &&
          photo?.author && photo?.license, pair.id+' requires individual photo source + image: '+bird.id);
      }
    }
    for(const [i,id] of pair.birds.entries()) {
      const partner=pair.birds[1-i];
      const html=recognitionPanel(catalog.get(id));
      assert.ok(html.includes('data-compare-species="'+partner+'"'),pair.id+' comparison absent from '+id);
    }
  } else if(pair.photoState==='MISSING_VERIFIED_PAIR') {
    assert.ok(pair.birds.some(id=>!mediaRegistered(id)),pair.id+' claims missing while both have media');
    assert.ok(pair.mediaOpen.some(x=>/photo|foto|sp\d{3}/i.test(x)));
    assert.ok(pair.birds.some(id=>KNOWLEDGE[id]?.caution?.text),pair.id+' needs a visible caution');
    const active=matching.some(c=>c.birds.every(b=>comparisonPhoto(b,Boolean(c.flight))));
    assert.ok(!active,'Incomplete image pair must never be displayed: '+pair.id);
  } else assert.fail('Unsupported media gate '+pair.photoState);
}
assert.deepEqual([...focusUsed].sort(),registry.focusSpecies);
assert.equal(registry.withinSpeciesVariation.length,1);
assert.equal(registry.withinSpeciesVariation[0].speciesId,'sp034');
assert.match(KNOWLEDGE.sp034.caution.text,/witkop|witte kop/i);
assert.match(KNOWLEDGE.sp035.caution.text,/Keep/);
assert.match(KNOWLEDGE.sp035.caution.text,/Huismus/);
assert.match(KNOWLEDGE.sp036.caution.text,/Sijs/);
assert.ok(!GUIDE_PHOTOS.sp181,'A missing Keep photo must never be silently replaced');
const femaleComparison=GUIDE_COMPARISONS.find(c=>c.label==='Vink en Huismus · vrouwtjes in rust');
const maleComparison=GUIDE_COMPARISONS.find(c=>c.label==='Groenling en Sijs · volwassen mannetjes in rust');
for(const c of [femaleComparison,maleComparison]) {
  assert.ok(c && c.rows.length===3 && c.rows.every(x=>x.values.length===2));
  assert.ok(c.birds.every(b=>b.plumage===c.birds[0].plumage));
}
console.log('LOOKALIKE R09 PASS: '+registry.pairs.length+' candidate pairs, 3 focus species, both sex-matched registered photos or explicitly missing; no false PASS');
