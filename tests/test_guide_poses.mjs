/** Contract checks for the optional posture panel; browser behaviour is tested separately. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_AUDIO, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { escHtml } from '../src/utils/html.js';
import { recognitionPanel, wherePanel } from '../src/features/species/detailSections.js';

const registry = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json', import.meta.url)));
assert.deepEqual(GUIDE_POSES, registry.poses, 'Generated poses must match the source registry');
const species = new Map(SPECIES.map(s => [s.id, s]));
for (const [id, poses] of Object.entries(GUIDE_POSES)) {
  const html = recognitionPanel(species.get(id));
  const ownMain = GUIDE_PHOTOS[id]?.image;
  const flightCount = poses.filter(pose => pose.flight).length;
  assert.ok(poses.length >= 1 && poses.filter(pose => !pose.flight && !pose.sex).length <= 2,
    `Expected at most two general recognition poses on ${id}`);
  const sexAndPose = poses.filter(pose => pose.sex).map(pose => `${pose.sex}:${Boolean(pose.flight)}`);
  assert.equal(sexAndPose.length, new Set(sexAndPose).size, `Repeated sex and posture on ${id}`);
  const flightPhotos = poses.filter(pose => pose.flight);
  assert.ok(flightCount <= 2 && flightPhotos.filter(pose => !pose.sex).length <= 1,
    `An extra flight photo must have a sex label on ${id}`);
  for (const pose of poses) {
    assert.ok(existsSync(new URL('..' + pose.image, import.meta.url)), pose.image);
    const buttons = [...html.matchAll(/data-guide-image="([^"]+)"/g)].filter(match => match[1] === pose.image);
    assert.equal(buttons.length, pose.image === ownMain ? 0 : 1, pose.image);
    if (pose.image !== ownMain) assert.ok(html.includes(pose.licenseUrl), 'License must remain available');
    if (/-(male|female)-(rest|flight)\.webp$/.test(pose.image)) {
      assert.match(pose.label, /^(Mannetje|Vrouwtje) in (rust|vlucht)$/);
      assert.equal(pose.flight, pose.label.endsWith('vlucht'));
      assert.ok(html.includes(pose.label) && html.includes(escHtml(pose.source)), pose.image);
    }
    if (pose.flight && pose.image !== ownMain) {
      const flightSection = html.indexOf('aria-label="Vluchtvergelijking"') >= 0
        ? html.indexOf('aria-label="Vluchtvergelijking"') : html.indexOf('aria-label="In vlucht"');
      assert.ok(flightSection >= 0 && html.indexOf(pose.image) > flightSection);
    }
  }
}
const withoutPoses = SPECIES.find(s => !GUIDE_POSES[s.id]);
assert.ok(!recognitionPanel(withoutPoses).includes('class="sd-poses"'), 'Absent poses must not render an empty section');
for (const id of ['sp008', 'sp009']) {
  const s = species.get(id);
  assert.ok(wherePanel(s).includes(s.photoTip), 'Photography advice must be in the actual rendered Where panel');
  assert.ok(GUIDE_PLUMAGE[id].juv && GUIDE_AUDIO[id].length);
}
assert.ok(recognitionPanel(species.get('sp009')).includes('Man en vrouw lijken op elkaar'), 'A shared adult photo must not silently imply male');
console.log('VERIFIED optional posture rendering, media wiring, shared adult label and photography advice');

// Plumage evidence must appear before look-alike comparisons, across all cards.
for (const s of SPECIES) {
  const html = recognitionPanel(s);
  const images = [...html.matchAll(/data-guide-image="([^"]+)"/g)].map(match => match[1]);
  assert.equal(images.length, new Set(images).size, `Duplicate image on ${s.id}`);
  assert.ok(!images.includes(GUIDE_PHOTOS[s.id]?.image), `Repeated main image on ${s.id}`);
  const plumage = html.indexOf('class="sd-plumage-list"');
  const flight = ['aria-label="Vluchtvergelijking"', 'aria-label="In vlucht"']
    .map(label => html.indexOf(label)).find(index => index >= 0);
  if (flight !== undefined && plumage >= 0) assert.ok(flight < plumage, `${s.id}: flight must precede plumage`);
  const comparison = html.indexOf('class="sd-compare"');
  if (plumage >= 0 && comparison >= 0) {
    assert.ok(plumage < comparison, `${s.id}: plumage photos must precede comparisons`);
  }
}
console.log('VERIFIED unique photos, flight before plumage and regular comparisons after plumage');

const swift = recognitionPanel(species.get('sp141'));
assert.ok(swift.indexOf('aria-label="In vlucht"') >= 0);
assert.ok(swift.indexOf('/assets/species/plumage/sp141-adult.webp') < swift.indexOf('class="sd-plumage-list"'));
const heron = recognitionPanel(species.get('sp081'));
assert.ok(!heron.includes('aria-label="In vlucht"'), 'A flight main photo must not reappear below the header');
