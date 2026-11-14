/**
 * Birdspot Library — strenge vluchtcontrole (10-11-2026)
 *
 *   VC-01  Elke foto die als vlucht staat heeft een vastgelegde visuele beoordeling (klasse vlucht/
 *          bidden/zweven, uitslag goedgekeurd/voorwaardelijk). Geen beoordeling = fout.
 *   VC-02  Negatief: een opvliegende vogel (Holenduif sp003) die opnieuw als vlucht wordt gemarkeerd,
 *          een landende vogel (Kauw sp025) en een nieuwe, onbeoordeelde vluchtfoto worden geweigerd.
 *   VC-03  Gerenderd: geen afgekeurde of gearchiveerde foto in een "In vlucht"-sectie of vluchtvergelijking,
 *          over alle soorten.
 *   VC-04  Uit de rol gehaalde foto's blijven zichtbaar op de juiste plek (kleed of overige) met het
 *          nieuwe label; gearchiveerde foto's staan niet op de kaart maar herkomst + bestand blijven.
 *   VC-05  Offline: gearchiveerde foto's vallen buiten de precache-lijst; getoonde foto's niet.
 *   VC-06  Vluchtvergelijkingen met een ontbrekende foto tonen "Nog geen foto" en behouden hun tekst.
 *   VC-07  FQA-01: álle gidsfoto's (ook zonder vluchtlabel) hebben een visuele beeldbeoordeling voor precies dít bestand
 *          (SHA-1); vrij vliegend ⇔ flight:true. Negatief: Buizerd-juveniel en Bruine Kiekendief-vrouwtje zonder
 *          vluchtlabel, een zittende Sperwer met gespreide vleugels mét vluchtlabel, een gewijzigd beeldbestand.
 *   VC-08  FQA-02: voorwaardelijke vluchtfoto's tonen hun voorlopige status in de kaart; Grote Lijster gearchiveerd,
 *          Gekraagde Roodstaart uit de vluchtrol.
 *
 * Starten: node tests/test_vluchtcontrole.mjs
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { GUIDE_COMPARISONS } from '../src/features/species/guideComparisons.js';
import { recognitionPanel } from '../src/features/species/detailSections.js';
import { checkFlight, checkInventory, flightAssets } from '../tools/fotokwaliteit/flightcheck.mjs';
import { GUIDE_HEROES } from '../src/features/species/guideMedia.js';
import { createHash } from 'node:crypto';

const read = p => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const review = read('../docs/fotokwaliteit/vluchtcontrole.json');
const media = read('../assets/species/field-guide-media.json');
const registers = { photos: GUIDE_PHOTOS, plumage: GUIDE_PLUMAGE, poses: GUIDE_POSES };
const byId = new Map(SPECIES.map(s => [s.id, s]));
const clone = x => JSON.parse(JSON.stringify(x));

// VC-01
const errors = checkFlight(registers, review, media.retired);
assert.deepEqual(errors, [], 'VC-01\n' + errors.join('\n'));
const live = flightAssets(registers);
console.log(`VC-01 OK — ${live.length} vluchtfoto's, alle met vastgelegde visuele beoordeling`);

// VC-02 negatieve gevallen
{
  const bad = clone(registers);
  const archivedTakeoff = media.retired.sp003.find(x => x.image.endsWith('sp003-flight.webp'));
  bad.poses.sp003.push({ ...archivedTakeoff, flight: true });
  const e = checkFlight(bad, review, media.retired);
  assert.ok(e.some(x => x.includes('sp003') && x.includes('opvliegen')), 'VC-02 opvliegende Holenduif niet geweigerd: ' + e.join(' | '));

  const bad2 = clone(registers);
  bad2.poses.sp025.find(x => x.image.endsWith('sp025-flight.webp')).flight = true;
  assert.ok(checkFlight(bad2, review, media.retired).some(x => x.includes('sp025') && x.includes('landen')), 'VC-02 landende Kauw niet geweigerd');

  const bad3 = clone(registers);
  bad3.poses.sp002 = [...bad3.poses.sp002, { image: '/assets/species/plumage/sp002-nieuw.webp', flight: true }];
  assert.ok(checkFlight(bad3, review, media.retired).some(x => x.includes('zonder visuele beoordeling')), 'VC-02 onbeoordeelde vluchtfoto niet geweigerd');

  const bad4 = clone(media.retired);
  bad4.sp061[0].source = '';
  assert.ok(checkFlight(registers, review, bad4).some(x => x.includes('mist herkomst')), 'VC-02 archief zonder herkomst niet geweigerd');
  console.log('VC-02 OK — opvliegend, landend, onbeoordeeld en archief-zonder-herkomst worden geweigerd');
}

// VC-03 gerenderd over alle soorten
const rejected = Object.entries(review.assets).filter(([, r]) => r.decision === 'uit-rol' || r.decision === 'archief').map(([im]) => im);
let sections = 0;
for (const s of SPECIES) {
  const html = recognitionPanel(s);
  const own = html.match(/aria-label="In vlucht"[\s\S]*?<\/section>/)?.[0];
  // FQA-03: vluchtvergelijkingen zijn tabbladen (data-cmp-flight) in de kaarten onder "Lijkt op".
  const cmpPanels = html.split('<div class="sd-cmp-panel"').slice(1).filter(part => part.startsWith(' data-cmp-panel data-cmp-flight'));
  for (const [label, part] of [['In vlucht', own], ...cmpPanels.map(part => ['vluchtvergelijking', part])]) {
    if (!part) continue;
    sections++;
    for (const im of rejected) assert.ok(!part.includes(`data-guide-image="${im}"`), `VC-03 ${s.id}: afgekeurde ${im} in ${label}`);
  }
}
console.log(`VC-03 OK — ${sections} vluchtsecties/-vergelijkingen zonder afgekeurde foto (${rejected.length} afgekeurd)`);

// VC-04 juiste nieuwe plek
const sectionOf = (html, image) => {
  const at = html.indexOf(`data-guide-image="${image}"`);
  if (at < 0) return null;
  const heads = [...html.slice(0, at).matchAll(/<h3 class="sd-h">([^<]+)<\/h3>/g)];
  return heads.at(-1)?.[1].replace(/&#39;/g, '’') ?? null;
};
for (const [image, r] of Object.entries(review.assets)) {
  if (r.decision === 'uit-rol') {
    const html = recognitionPanel(byId.get(r.id));
    const where = sectionOf(html, image);
    const expected = r.target === 'kleed' ? 'Verenkleed' : 'Overige herkenningsfoto’s';
    assert.equal(where, expected, `VC-04 ${r.id} ${image} staat onder ${where}, verwacht ${expected}`);
    assert.ok(html.includes(r.newLabel.replace(/&/g, '&amp;')), `VC-04 ${r.id} nieuw label ontbreekt`);
  }
  if (r.decision === 'archief') {
    assert.ok(!recognitionPanel(byId.get(r.id)).includes(image), `VC-04 ${r.id} gearchiveerde foto nog op kaart`);
    assert.ok(existsSync(new URL('..' + image, import.meta.url)), `VC-04 ${image} bestand verdwenen`);
  }
}
console.log('VC-04 OK — uit-rol op juiste plek met nieuw label; archief niet getoond, bestand en herkomst bewaard');

// VC-05 offline: sw.js cachet plumage+poses uit field-guide-media.json, niet "retired"
const cached = new Set([...Object.values(media.plumage).flatMap(c => Object.values(c)), ...Object.values(media.poses).flat()].map(p => p.image));
for (const list of Object.values(media.retired)) for (const p of list) assert.ok(!cached.has(p.image), `VC-05 ${p.image} nog in precache`);
for (const a of live) if (a.from !== 'GUIDE_PHOTOS') assert.ok(cached.has(a.image), `VC-05 ${a.image} niet in precache`);
assert.ok(readFileSync(new URL('../sw.js', import.meta.url), 'utf8').includes('Object.values(data.poses || {}).flat()'), 'VC-05 sw.js-precachebron gewijzigd');
console.log('VC-05 OK — archief buiten precache, alle getoonde vluchtfoto\'s erin');

// VC-06 vergelijkingen
for (const e of GUIDE_COMPARISONS.filter(x => x.flight)) for (const b of e.birds.filter(x => x.photoMissing)) {
  assert.ok(b.marks, `VC-06 ${b.id} vergelijkingstekst verdwenen`);
  const other = e.birds.find(x => x.id !== b.id);
  const html = recognitionPanel(byId.get(other.id));
  assert.ok(html.includes(`Nog geen foto van ${byId.get(b.id).nameNL}`), `VC-06 ${other.id}: ontbrekende foto van ${b.id} niet als zodanig getoond`);
}
console.log('VC-06 OK — vergelijkingen met ontbrekende vluchtfoto behouden hun tekst en melden "Nog geen foto"');
// VC-07 — beeldinhoud ⇔ vluchtlabel over álle gidsfoto's (FQA-01)
{
  const inventory = read('../docs/fotokwaliteit/beeldinventaris.json');
  const hashOf = img => createHash('sha1').update(readFileSync(new URL('..' + img, import.meta.url))).digest('hex');
  const all = { photos: GUIDE_PHOTOS, heroes: GUIDE_HEROES, plumage: GUIDE_PLUMAGE, poses: GUIDE_POSES };
  const errs = checkInventory(all, inventory, hashOf);
  assert.deepEqual(errs, [], 'VC-07\n' + errs.join('\n'));
  const n = Object.keys(inventory.images).length;
  // Positief bewijs voor de drie gevonden gevallen: nu één keer onder In vlucht, met leeftijd/geslacht.
  for (const [sid, img, title] of [['sp005', 'sp005-juv.webp', 'Juveniel'], ['sp173', 'sp173-adult_f.webp', 'Vrouwtje'], ['sp253', 'sp253-juv.webp', 'Juveniel']]) {
    const html = recognitionPanel(byId.get(sid));
    const [before, after = ''] = html.split('aria-label="In vlucht"');
    const flightPart = after.split('aria-label="Vluchtvergelijking"')[0].split('<h3 class="sd-h">Lijkt op')[0];
    assert.equal((html.match(new RegExp(img.replace('.', '\\.'), 'g')) || []).length >= 1, true);
    assert.ok(flightPart.includes(img), `VC-07 ${sid} ${img} hoort onder In vlucht`);
    assert.ok(!before.includes(img), `VC-07 ${sid} ${img} staat ook nog in een kleedgalerij`);
    assert.ok(new RegExp(`<strong>${title}`).test(flightPart), `VC-07 ${sid} label ${title} verloren`);
  }
  // Negatief: label vergeten, label onterecht, bestand gewijzigd.
  const neg = (mutate, expectText, why) => {
    const regs = JSON.parse(JSON.stringify(all));
    const inv = JSON.parse(JSON.stringify(inventory));
    mutate(regs, inv);
    const e = checkInventory(regs, inv, hashOf);
    assert.ok(e.some(x => x.includes(expectText)), `VC-07 negatief niet geweigerd: ${why}\n${e.join('\n')}`);
  };
  neg(r => { delete r.plumage.sp005.juv.flight; }, 'zonder flight:true', 'Buizerd-juveniel zonder vluchtlabel');
  neg(r => { delete r.plumage.sp173.adult_f.flight; }, 'zonder flight:true', 'Bruine Kiekendief-vrouwtje zonder vluchtlabel');
  neg(r => { r.plumage.sp006.adult_f.flight = true; }, 'toont vleugels-strekken', 'zittende Sperwer met gespreide vleugels als vlucht');
  neg(r => { r.poses.sp003.push({ image: '/assets/species/plumage/sp003-flight.webp', flight: true }); }, 'toont opvliegen', 'opvliegende Holenduif terug als vlucht');
  neg((r, inv) => { inv.images['/assets/species/plumage/sp002-flight.webp'].sha1 = '0'.repeat(40); }, 'SHA-1 wijkt af', 'gewijzigd beeldbestand');
  neg((r, inv) => { delete inv.images['/assets/species/sp066.webp']; }, 'geen visuele beeldbeoordeling', 'foto zonder beoordeling');
  console.log(`VC-07 OK — ${n} gidsfoto's met beeldbeoordeling op SHA-1; vrij vliegend ⇔ flight:true; 6 negatieve gevallen geweigerd`);
}

// VC-08 — voorwaardelijke vluchtfoto's (FQA-02)
{
  const cond = Object.entries(review.assets).filter(([, r]) => r.decision === 'voorwaardelijk');
  for (const [img, r] of cond) {
    const html = recognitionPanel(byId.get(r.id));
    const i = html.indexOf(img);
    assert.ok(i > 0, `VC-08 ${r.id} voorwaardelijke foto niet getoond`);
    assert.ok(html.slice(i, i + 2500).includes('Voorlopige foto'), `VC-08 ${r.id} toont de voorlopige status niet`);
    assert.ok(r.replacement === 'gewenst', `VC-08 ${r.id} vervangingsbehoefte niet vastgelegd`);
  }
  assert.equal(review.assets['/assets/species/plumage/sp049-flight.webp'].decision, 'archief');
  assert.equal(review.assets['/assets/species/plumage/sp178-flight.webp'].decision, 'uit-rol');
  const rs = recognitionPanel(byId.get('sp178'));
  assert.ok(!(rs.split('aria-label="In vlucht"')[1] || '').split('<h3 class="sd-h">Lijkt op')[0].includes('sp178-flight.webp'), 'VC-08 Gekraagde Roodstaart staat nog in In vlucht');
  console.log(`VC-08 OK — ${cond.length} voorwaardelijke vluchtfoto's tonen hun voorlopige status; Grote Lijster gearchiveerd, Gekraagde Roodstaart uit de vluchtrol`);
}

console.log('Vluchtcontrole: alle controles geslaagd (VC-01..VC-08)');
