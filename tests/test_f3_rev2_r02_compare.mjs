/** F3-REV2-R02b — eigenaarregel 23-11-2026: vergelijkingen zo uitgebreid mogelijk; quickPrimary vervangt ze nooit.
 *
 * - Elke soort met quickPrimary toont nog alle keyMarks (primair + "Meer kenmerken") en alle kritische
 *   vergelijkingskaarten onder "Lijkt op".
 * - De roofvogelparen van R02b houden gelabelde rijen en de gelijkwaardige foto's; de afgewezen
 *   bovenaanzicht-Buizerd en de onbewezen algemene Havik-vluchtfoto keren niet terug als vergelijkingsfoto.
 */
import assert from 'node:assert/strict';
import { SPECIES } from '../src/data/species.js';
import { KNOWLEDGE } from '../src/data/speciesKnowledge.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const similar = id => recognitionPanel(byId.get(id)).match(/<section class="sd-similar"[\s\S]*?<\/section>/)?.[0] || '';
const panels = id => similar(id).split('<div class="sd-cmp-panel"').slice(1).map(p => ({
  flight: p.startsWith(' data-cmp-panel data-cmp-flight'),
  partner: p.match(/data-compare-species="(sp\d+)"/)?.[1],
  imgs: [...p.matchAll(/data-guide-image="([^"]+)"/g)].map(m => m[1].split('/').pop()),
  rows: [...p.matchAll(/class="sd-cmp-row"[\s\S]*?<\/div>/g)].length,
  labelled: [...p.matchAll(/class="sd-cmp-row"[^>]*>\s*<[^>]+>\s*([^<\s][^<]*)</g)].length,
}));

// 1. quickPrimary verwijdert niets.
for (const [id, k] of Object.entries(KNOWLEDGE)) {
  if (!k.quickPrimary) continue;
  const html = recognitionPanel(byId.get(id));
  assert.equal((html.match(/class="kb-mark"/g) || []).length, k.keyMarks.length, id + ': quickPrimary mag geen kenmerk weglaten');
  assert.ok(html.includes('data-kb-more-marks'), id + ': overige kenmerken staan onder "Meer kenmerken"');
  const withVs = (k.critical || []).filter(c => c.vs?.length).length;
  assert.equal((similar(id).match(/class="kb-crit-card"/g) || []).length, withVs, id + ': alle kritische vergelijkingskaarten blijven onder "Lijkt op"');
}

// 2. R02b-paren: gelabelde rijen, gelijkwaardige foto's, beide richtingen.
const expectPair = (id, partner, flight, imgs) => {
  const hit = panels(id).filter(p => p.partner === partner && p.flight === flight && imgs.every(i => p.imgs.includes(i)));
  assert.equal(hit.length, 1, `${id} -> ${partner} ${flight ? 'vlucht' : 'rust'}: verwacht paar ${imgs.join('+')}`);
  assert.ok(hit[0].rows >= 2, `${id} -> ${partner}: minstens 2 vergelijkingsrijen`);
  return hit[0];
};
for (const [partner, img] of [['sp248', 'sp248.webp'], ['sp248', 'sp248-adult_f.webp'], ['sp253', 'sp253.webp']]) {
  expectPair('sp005', partner, true, ['sp005-female-flight.webp', img]);
  expectPair(partner, 'sp005', true, [img, 'sp005-female-flight.webp']);
}
expectPair('sp006', 'sp007', false, ['sp006.webp', 'sp007.webp']);
expectPair('sp006', 'sp007', false, ['sp006-juv.webp', 'sp007-juv.webp']);
expectPair('sp006', 'sp007', true, ['sp006-flight.webp', 'sp007-male-flight.webp']);
expectPair('sp007', 'sp006', true, ['sp007-male-flight.webp', 'sp006-flight.webp']);
expectPair('sp006', 'sp008', false, ['sp006-juv.webp', 'sp008-juv.webp']);
expectPair('sp007', 'sp009', false, ['sp007-juv.webp', 'sp009-juv.webp']);
expectPair('sp007', 'sp008', true, ['sp007-male-flight.webp', 'sp008-flight.webp']);

// 3. Afgewezen vergelijkingsfoto's keren niet terug.
for (const id of ['sp005', 'sp006', 'sp007', 'sp008', 'sp248', 'sp253']) {
  for (const p of panels(id)) {
    assert.ok(!p.imgs.includes('sp005-adult_m.webp'), id + ': Buizerd van boven niet tegenover een partner van onderen');
    assert.ok(!p.imgs.includes('sp007-flight.webp'), id + ': algemene Havik-vluchtfoto (herkomst/leeftijd onbewezen) is geen vergelijkingsfoto');
  }
}

// 4. Kritische kaarten in beide richtingen voor Sperwer–Havik; publieke tekst zonder bronnamen.
const crit = (id, vs) => KNOWLEDGE[id].critical.filter(c => c.vs?.includes(vs)).map(c => c.feature.toLowerCase());
for (const f of ['staartpunt', 'vliegstijl', 'roep']) {
  assert.ok(crit('sp006', 'sp007').some(x => x.includes(f)) && crit('sp007', 'sp006').some(x => x.includes(f)), 'Sperwer↔Havik wederkerig: ' + f);
}
for (const id of ['sp005', 'sp006', 'sp007']) {
  const text = recognitionPanel(byId.get(id)).replace(/<details class="photo-info"[\s\S]*?<\/details>/g, '');
  assert.ok(!/Vogelbescherming:|BirdGuides|iNaturalist-waarneming|Door de bron/.test(text), id + ': geen bronverwijzing in publieke tekst (§2.2)');
}
assert.ok(!/gestreepte onderzijde/.test(JSON.stringify(KNOWLEDGE.sp006)), 'Sperwer-mannetje is dwarsgebandeerd, niet gestreept');
console.log('F3-REV2-R02b COMPARE PASS: quickPrimary laat alle kenmerken en kritische kaarten staan; 16 gelijkwaardige paarrichtingen met rijen; afgewezen foto\'s uit vergelijkingen; Sperwer↔Havik wederkerig; geen bronnamen');
