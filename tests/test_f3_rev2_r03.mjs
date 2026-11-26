/** F3-REV2-R03 — Torenvalk, Slechtvalk, Grote Bonte Specht (eigenaarbesluit 23-11-2026 22:10).
 *
 * Borgt dat de review en quickPrimary niets van de bestaande vergelijkingen afhalen:
 * - alle bestaande fotoparen (partner, rust/vlucht, beide foto's) blijven op de drie kaarten;
 * - alle kritische vergelijkingskaarten blijven onder "Lijkt op";
 * - de nieuwe soortverwarringsregistraties LK-100…LK-105 zijn traceerbaar in beide richtingen;
 * - het register houdt de eigenaarspoort open (geen vooringevuld besluit, geen FULL PASS).
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const similar = id => recognitionPanel(byId.get(id)).match(/<section class="sd-similar"[\s\S]*?<\/section>/)?.[0] || '';
const panels = id => similar(id).split('<div class="sd-cmp-panel"').slice(1).map(p => [
  p.match(/data-compare-species="(sp\d+)"/)?.[1], p.startsWith(' data-cmp-panel data-cmp-flight'),
  [...p.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1].split('/').pop())]);

// Stand op de R02c-checkpoint (ad514b0); mag alleen groeien, nooit krimpen.
const BEFORE = {
  sp008: [['sp009', false, ['sp008-juv.webp', 'sp009-juv.webp']], ['sp009', true, ['sp008-male-flight.webp', 'sp009-male-flight.webp']],
    ['sp006', false, ['sp008-juv.webp', 'sp006-juv.webp']], ['sp006', true, ['sp008-flight.webp', 'sp006-flight.webp']],
    ['sp007', true, ['sp008-flight.webp', 'sp007-male-flight.webp']]],
  sp009: [['sp008', false, ['sp009-juv.webp', 'sp008-juv.webp']], ['sp008', true, ['sp009-male-flight.webp', 'sp008-male-flight.webp']],
    ['sp007', false, ['sp009-juv.webp', 'sp007-juv.webp']]],
  sp016: [['sp020', false, ['sp016-juv.webp', 'sp020-male.webp']], ['sp020', true, ['sp016-flight.webp', 'sp020-flight.webp']],
    ['sp017', false, ['sp016-hero-male.webp', 'sp017.webp']]],
};
const CRIT = { sp008: 1, sp009: 1, sp016: 2 };
for (const [id, list] of Object.entries(BEFORE)) {
  const now = panels(id).map(x => JSON.stringify(x));
  for (const pair of list) assert.ok(now.includes(JSON.stringify(pair)), `${id}: vergelijking verdwenen ${JSON.stringify(pair)}`);
  assert.ok((similar(id).match(/class="kb-crit-card"/g) || []).length >= CRIT[id], id + ': kritische vergelijkingskaart verdwenen');
}

// Soortverwarringsregister: nieuwe paren en focussoorten.
const lk = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/SOORTVERWARRING_REGISTER_V0.1_DRAFT.json', import.meta.url), 'utf8'));
const want = { 'LK-100': ['sp008', 'sp009'], 'LK-101': ['sp016', 'sp020'], 'LK-102': ['sp016', 'sp017'],
  'LK-103': ['sp008', 'sp261'], 'LK-104': ['sp008', 'sp260'], 'LK-105': ['sp009', 'sp261'] };
for (const [id, birds] of Object.entries(want)) {
  const p = lk.pairs.find(x => x.id === id);
  assert.deepEqual(p?.birds, birds, id);
  assert.equal(p.textState, 'PARTIALLY TESTED');
  if (p.photoState === 'REGISTERED_PAIR_PENDING_F3_ORIGINAL') {
    for (const [i, b] of birds.entries()) assert.ok(recognitionPanel(byId.get(b)).includes(`data-compare-species="${birds[1 - i]}"`), `${id}: ${b} -> ${birds[1 - i]}`);
  }
}
for (const id of ['sp008', 'sp009', 'sp016']) assert.ok(lk.focusSpecies.includes(id), `focusSpecies mist ${id}`); // R04 voegt later soorten toe

// F3-REV2-R03b (eigenaarbesluit B, 24-11-2026): nieuwe paren, gelabelde rijen in beide richtingen,
// kritische kaarten wederkerig, geen publieke bronverwijzing, geen tegenstrijdige jeugdkleedtekst.
const NEW_PAIRS = [['sp009', 'sp007', true, ['sp009.webp', 'sp007-male-flight.webp']], ['sp016', 'sp020', false, ['sp016-male.webp', 'sp020-male.webp']],
  ['sp016', 'sp017', false, ['sp016.webp', 'sp017-female.webp']]];
for (const [a, b, flight, imgs] of NEW_PAIRS) {
  assert.ok(panels(a).map(x => JSON.stringify(x)).includes(JSON.stringify([b, flight, imgs])), `R03b: nieuw paar ${a}->${b}`);
  assert.ok(panels(b).map(x => JSON.stringify(x)).includes(JSON.stringify([a, flight, [...imgs].reverse()])), `R03b: nieuw paar ${b}->${a}`);
}
const rowLabels = (a, b) => [...similar(a).split('<div class="sd-cmp-panel"').slice(1).filter(p => p.includes(`data-compare-species="${b}"`)).join('')
  .matchAll(/<div class="sd-cmp-row"><b>([^<]+)<\/b>/g)].map(m => m[1]);
for (const [a, b, min] of [['sp008', 'sp009', 6], ['sp009', 'sp008', 6], ['sp009', 'sp007', 6], ['sp007', 'sp009', 6],
  ['sp016', 'sp020', 9], ['sp020', 'sp016', 9], ['sp016', 'sp017', 6], ['sp017', 'sp016', 6]]) {
  const labels = rowLabels(a, b);
  assert.ok(labels.length >= min, `R03b: ${a}->${b} ${labels.length} gelabelde rijen (min ${min})`);
}
const K = KNOWLEDGE;
const critVs = id => (K[id].critical || []).flatMap(c => c.vs);
for (const [a, list] of Object.entries({ sp008: ['sp006', 'sp009', 'sp260', 'sp261'], sp009: ['sp007', 'sp008', 'sp260', 'sp261'], sp016: ['sp017', 'sp020'] }))
  for (const b of list) assert.ok(critVs(a).includes(b), `R03b: kritische kaart ${a} vs ${b}`);
for (const id of ['sp008', 'sp009', 'sp016']) {
  const publicText = JSON.stringify([K[id].caution, K[id].critical, K[id].similar]);
  assert.ok(!/\bBron noemt|[Dd]oor de bron genoemd|geraadpleegde bron/.test(publicText), id + ': geen bronverwijzing in publieke tekst');
}
assert.ok(/jonge vogels lijken sterk op volwassen vrouwtjes/.test(K.sp008.caution.text) && !/niet beschreven/.test(K.sp008.caution.text), 'G3: jeugdkleed niet meer tegenstrijdig');
assert.ok(!similar('sp016').includes('Grote of middelste bonte specht?</'), 'G9: paartitel niet meer als rollabel');
for (const id of ['LK-106', 'LK-107', 'LK-108']) assert.ok(lk.pairs.find(p => p.id === id), id);
for (let n = 1; n <= 108; n++) assert.ok(lk.pairs.find(p => p.id === `LK-${String(n).padStart(3, '0')}`), `LK-${n} behouden`);

// F3-REV2-R03c (eigenaarbesluit R03b-QA, 24-11-2026): GBS-vluchtfoto voorlopig, kandidaten niet geïmporteerd,
const reg = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/F3_140_HERCONTROLE_V0.1_DRAFT.json', import.meta.url), 'utf8'));
// iNaturalist-rechten niet VERIFIED zonder licentiegegevens.
const fgm = JSON.parse(readFileSync(new URL('../assets/species/field-guide-media.json', import.meta.url), 'utf8'));
const vc = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/vluchtcontrole.json', import.meta.url), 'utf8'));
const gbsFlight = fgm.poses.sp016.find(p => p.image.endsWith('/sp016-flight.webp'));
assert.ok(gbsFlight.note.startsWith('Voorlopige foto') && /grotendeels onscherp/.test(gbsFlight.note), 'R03c: bijschrift GBS-vlucht voorlopig en eerlijk');
assert.ok(!/goed zichtbaar/.test(gbsFlight.note + gbsFlight.alt), 'R03c: geen overschatting van vleugeldetails');
assert.ok(gbsFlight.reviewHistory?.[0]?.note?.includes('uitgespreide vleugels'), 'R03c: oorspronkelijke beoordeling bewaard');
const vcg = vc.assets['/assets/species/plumage/sp016-flight.webp'];
assert.ok(vcg.decision === 'voorwaardelijk' && vcg.replacement === 'gewenst' && vcg.history.some(h => h.decision === 'goedgekeurd'), 'R03c: vluchtcontrole voorwaardelijk met historie');
assert.ok(similar('sp016').includes('sp016-flight.webp'), 'R03c: foto blijft in de vluchtvergelijking (herkenningswaarde)');
const rec = id => reg.records.find(r => r.id === id).F3.secondReview;
assert.ok(rec('sp016').photos.find(p => p.path.endsWith('sp016-flight.webp')).quality.startsWith('PARTIALLY TESTED'), 'R03c: totale kwaliteit PARTIALLY TESTED');
for (const [id, path] of [['sp009', 'sp009-male-flight.webp'], ['sp009', 'sp009-juv-flight.webp'], ['sp007', 'sp007-male-flight.webp']]) {
  const ph = rec(id).photos.find(p => p.path.endsWith(path));
  assert.ok(ph.rightsR03c.startsWith('PARTIALLY TESTED') && !/^VERIFIED/.test(ph.rightsR03c), `R03c: ${path} niet VERIFIED zonder licentiegegevens`);
}
const cands = rec('sp009').candidatesR03c.candidates;
assert.equal(cands.length, 3);
const allMedia = JSON.stringify([fgm.poses, fgm.plumage]);
for (const c of cands) {
  assert.equal(c.imported, false, c.id);
  assert.ok(!allMedia.includes(c.title.replace(/^File:/, '')), `R03c: kandidaat ${c.id} niet in de app gezet`);
  assert.ok(['Beter en geschikt als vervanging (voorstel; niet uitgevoerd)', 'Geschikt als aanvullende foto', 'Niet beter dan de bestaande foto', 'Onvoldoende bewijs'].includes(c.verdict), c.verdict);
}

// F3-REV2-R03d (eigenaarbesluit R03c-QA, 24-11-2026): actuele auditstatus = vluchtcontrole; historie behouden;
// Toscane-kandidaat alleen als niet-actief voorstel; G8 blijft PARTIALLY TESTED met geregistreerde claims intact.
{
  const { readdirSync } = await import('node:fs');
  const dir = new URL('../docs/fotokwaliteit/soortaudit/', import.meta.url);
  const audit = {};
  for (const f of readdirSync(dir).filter(f => /^M\d+\.json$/.test(f)))
    for (const sp of Object.values(JSON.parse(readFileSync(new URL(f, dir), 'utf8')).species)) Object.assign(audit, sp.assets);
  for (const [img, r] of Object.entries(vc.assets).filter(([, r]) => r.decision === 'voorwaardelijk'))
    if (audit[img]) assert.equal(audit[img].verdict, 'voorwaardelijk', `R03d: soortaudit ${img} wijkt af van vluchtcontrole`);
  const a16 = audit['/assets/species/plumage/sp016-flight.webp'];
  assert.ok(/2026-11-10: goedgekeurd/.test(a16.verdictHistory) && /2026-11-10: voldoende/.test(a16.qualityHistory), 'R03d: oorspronkelijk besluit in de historie');
  const prop = rec('sp009').candidatesR03c.proposalR03d;
  assert.ok((prop.previousStatus ?? prop.status).startsWith('VOORSTEL') && prop.candidate.sha1 === '4c8acd03833975f48873d1a81be94a6756b607fd' && prop.candidate.sha1Verified === true, 'R03d: Toscane-voorstel met SHA-1');
  assert.ok(!JSON.stringify(fgm).includes('San Giuliano') && !JSON.stringify(fgm).includes('4c8acd0383'), 'R03d: Toscane-kandidaat niet als gidsfoto');
  assert.ok(fgm.poses.sp009.some(p => p.image.endsWith('/sp009-male-flight.webp')), 'R03d: huidige vluchtfoto blijft');
  for (const [id, n] of [['sp009', 2], ['sp007', 1]]) {
    const g = rec(id).g8R03d;
    assert.equal(g.photos.length, n);
    for (const ph of g.photos) {
      assert.ok(ph.status.startsWith('PARTIALLY TESTED') && ph.registeredClaim.license === 'CC BY 4.0', `R03d: ${ph.path} rechten open, geregistreerde claim behouden`);
      const live = [...(fgm.poses[id] || []), ...Object.values(fgm.plumage[id] || {})].find(p => p?.image === ph.path);
      assert.ok(live && live.license === ph.registeredClaim.license && live.author === ph.registeredClaim.author, `R03d: ${ph.path} credits ongewijzigd`);
    }
  }
}

// Register: R03-batch met open eigenaarspoort, geen FULL PASS.
const r03 = reg.secondReview.batches.find(b => b.round === 'F3-REV2-R03');
assert.deepEqual(r03.species, ['sp008', 'sp009', 'sp016']);
for (const id of r03.species) {
  const s = reg.records.find(r => r.id === id).F3.secondReview;
  assert.equal(s.round, 'F3-REV2-R03');
  assert.equal(s.fullPass, false);
  if (s.ownerDecision.status === 'OPEN') assert.ok(s.materialGaps.length > 0, id + ': open poort zonder benoemde tekortkoming');
}
assert.ok(reg.secondReview.counts.reexamined <= 9 || reg.secondReview.batches.length > 3, 'na R03 maximaal 9/140 in de tweede ronde');
console.log('F3-REV2-R03/R03b PASS: bestaande vergelijkingen behouden; 3 nieuwe paren wederkerig; gelabelde rijen; kritische kaarten wederkerig; geen publieke bronverwijzing; LK-001…LK-108; R03c GBS-vluchtfoto voorlopig, 3 kandidaten niet geïmporteerd, iNaturalist niet VERIFIED; R03d audit = vluchtcontrole, Toscane-audithistorie behouden, G8 open');
