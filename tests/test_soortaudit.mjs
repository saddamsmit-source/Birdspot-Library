/**
 * Birdspot Library — soortaudit-contract (eigenaarseis 10-11-2026)
 *
 *   SA-01  Elke soort in een auditbatch: de set getoonde eigen foto's == de set visueel beoordeelde foto's,
 *          met rol, beeldinhoud, geslacht/leeftijd, kwaliteit en een geldige uitslag per foto.
 *   SA-02  Negatief: een nieuwe, niet beoordeelde foto op een gecontroleerde kaart faalt.
 *   SA-03  Negatief: een opvliegende vogel (Holenduif) of fladderende Tjiftjaf die terug in "In vlucht" komt, faalt —
 *          ook als de vluchtbeoordeling zou zijn vergeten (beoordeling per foto zegt uit-rol).
 *   SA-04  Negatief: een foto die als "In vlucht" getoond wordt zonder goedgekeurde vluchtbeoordeling faalt.
 *   SA-05  Statussen worden niet verzonnen: zonder browseruitslag is browser NOT TESTED; onafhankelijke review
 *          staat altijd op NOT TESTED tot die is vastgelegd; geen enkele soort is in totaal VERIFIED zolang de
 *          foto-set onvolledig is.
 *   SA-06  Een geautomatiseerde rendercontrole telt niet als visuele controle: soorten zonder auditbatch staan
 *          op NOT TESTED, ook al renderen ze foutloos.
 *   SA-07  Vluchtvergelijking verwijst niet naar een ontbrekende eigen vluchtfoto ("↑ zie in vlucht" zonder sectie).
 *
 * Starten: node tests/test_soortaudit.mjs   (vereist: node tools/fotobaseline/audit.mjs . <tmp>.json eerst, of
 *          laat deze test dat zelf doen)
 */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, checkSpecies, loadBatches } from '../tools/fotokwaliteit/soortaudit.mjs';
import { SPECIES } from '../src/data/species.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';

const tmp = join(mkdtempSync(join(tmpdir(), 'soortaudit-')), 'audit.json');
execFileSync('node', ['tools/fotobaseline/audit.mjs', '.', tmp], { stdio: 'ignore' });
const audit = JSON.parse(readFileSync(tmp, 'utf8'));
const flight = JSON.parse(readFileSync(new URL('../docs/fotokwaliteit/vluchtcontrole.json', import.meta.url), 'utf8')).assets;
const batches = loadBatches();
const rowOf = id => audit.rows.find(r => r.id === id);
const clone = x => JSON.parse(JSON.stringify(x));

// SA-01
const { result, errors } = build(audit, { sha: 'test' });
assert.deepEqual(errors, [], 'SA-01\n' + errors.join('\n'));
const audited = result.filter(r => r.audited);
assert.ok(audited.length >= 11, `SA-01 verwacht minstens mijlpaal 1 (11 soorten), nu ${audited.length}`);
console.log(`SA-01 OK — ${audited.length} soorten: getoonde foto's = beoordeelde foto's, velden compleet`);

// SA-02
{
  const row = clone(rowOf('sp002'));
  row.rendered.push({ section: "Overige herkenningsfoto's", slot: '', image: '/assets/species/plumage/sp002-nieuw.webp' });
  const e = checkSpecies(row, batches.sp002, flight);
  assert.ok(e.some(x => x.includes('niet visueel beoordeeld')), 'SA-02 onbeoordeelde foto niet geweigerd');
  console.log('SA-02 OK — nieuwe, niet beoordeelde foto op een gecontroleerde kaart wordt geweigerd');
}

// SA-03
for (const [sid, img] of [['sp003', '/assets/species/plumage/sp003-flight.webp'], ['sp056', '/assets/species/plumage/sp056-flight.webp']]) {
  const row = clone(rowOf(sid));
  row.rendered = row.rendered.map(r => (r.image === img ? { ...r, section: 'In vlucht', slot: 'neutral' } : r));
  const forgotten = { ...flight, [img]: { ...flight[img], decision: 'goedgekeurd', class: 'vlucht' } };
  const e = checkSpecies(row, batches[sid], forgotten);
  assert.ok(e.some(x => x.includes('uit-rol beoordeeld maar nog in "In vlucht"')), `SA-03 ${sid} terug in vlucht niet geweigerd`);
}
console.log('SA-03 OK — opvliegende Holenduif en fladderende Tjiftjaf terug in "In vlucht" worden geweigerd');

// SA-04
{
  const row = clone(rowOf('sp002'));
  const img = '/assets/species/plumage/sp002-flight.webp';
  const e = checkSpecies(row, batches.sp002, { ...flight, [img]: { ...flight[img], decision: 'uit-rol' } });
  assert.ok(e.some(x => x.includes('zonder goedgekeurde vluchtbeoordeling')), 'SA-04 niet geweigerd');
  console.log('SA-04 OK — "In vlucht" zonder goedgekeurde vluchtbeoordeling wordt geweigerd');
}

// SA-05
for (const r of audited) {
  assert.equal(r.status.independent, 'NOT TESTED', `SA-05 ${r.id} onafhankelijke review mag niet geclaimd worden`);
  if (!r.browser) assert.equal(r.status.browser, 'NOT TESTED');
  if (!r.photoComplete) assert.notEqual(r.verdict, 'VERIFIED', `SA-05 ${r.id} VERIFIED met onvolledige foto-set`);
}
console.log('SA-05 OK — geen verzonnen statussen (onafhankelijk NOT TESTED, onvolledig ≠ VERIFIED)');

// SA-06
const notAudited = result.filter(r => !r.audited);
assert.ok(notAudited.every(r => r.verdict === 'NOT TESTED'));
const newComparisonSpecies = ['sp148', 'sp149', 'sp153', 'sp062', 'sp257'];
for (const id of newComparisonSpecies) assert.ok(result.some(r => r.id === id), `SA-06 ${id} ontbreekt in de fotocollectie`);
assert.equal(result.length, 134 + newComparisonSpecies.length, `SA-06 onverwacht aantal soorten met gidsfoto's: ${result.length}`);
console.log(`SA-06 OK — ${notAudited.length} van ${result.length} fotosoorten nog NOT TESTED; rendercontrole telt niet als audit`);

// SA-07
let refs = 0;
for (const s of SPECIES) {
  const html = recognitionPanel(s, null);
  const hasOwnFlight = /<section[^>]*aria-label="In vlucht"/.test(html);
  // FQA-03: vluchtvergelijkingen zijn tabbladen (data-cmp-flight) in de kaarten onder "Lijkt op".
  const flightCmp = html.split('<div class="sd-cmp-panel"').slice(1).filter(part => part.startsWith(' data-cmp-panel data-cmp-flight')).join('');
  if (!hasOwnFlight && flightCmp.includes('↑ zie in vlucht')) assert.fail(`SA-07 ${s.id} verwijst naar ontbrekende eigen vluchtfoto`);
  if (flightCmp) refs++;
}
assert.ok(!recognitionPanel(SPECIES.find(s => s.id === 'sp003'), null).includes('↑ zie in vlucht'), 'SA-07 Holenduif');
console.log(`SA-07 OK — ${refs} kaarten met vluchtvergelijking; geen verwijzing naar een ontbrekende eigen vluchtfoto`);

console.log('Soortaudit: alle controles geslaagd (SA-01..SA-07)');
