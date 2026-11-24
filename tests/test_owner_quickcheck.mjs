import assert from 'node:assert/strict';
import { birdInfo } from '../src/features/home/featuredCarousel.js';
import { FEATURED_BIRDS } from '../src/features/home/specialBirds.js';
const bird = FEATURED_BIRDS.find(b => b.id === 'sp268');
assert.ok(bird, 'Baardman moet in het carrousel aanwezig zijn');
const info = birdInfo(bird);
assert.match(info.recognition, /rietvogeltje|snor|ping/i);
assert.match(info.sexes, /Mannetje:/);
assert.match(info.sexes, /Vrouwtje:/);
assert.match(info.habitat, /Rietland/);
assert.match(info.distribution, /Oostvaardersplassen|Lauwersmeer|Biesbosch/);
assert.match(info.presence, /Standvogel/);
for (const featured of FEATURED_BIRDS) {
  const values = birdInfo(featured);
  for (const key of ['recognition','sexes','habitat','distribution','presence']) {
    assert.equal(typeof values[key], 'string', featured.id + ':' + key);
  }
}
const missing = birdInfo({ id: 'does-not-exist' });
assert.equal(missing.recognition, '', 'Geen generieke pseudo-soortfeiten verzinnen');
assert.equal(missing.distribution, '');
console.log('OWNER QUICKCHECK PASS — Baardman: herkenning, verschil man/vrouw, vindplaatsen, seizoen; overige soorten data-only');
