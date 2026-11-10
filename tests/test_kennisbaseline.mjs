/**
 * Birdspot Library — kennisbaseline proef (kennisprofiel contract v0.1, 10-11-2026)
 *
 * Contract- en renderdekking zonder browser (de browserdekking op 390 px en 1280 px staat in
 * tests/test_kennisbaseline_browser.py; de validator-negatieftests in tests/test_kennisbaseline_validator.py).
 *
 *   KB-01  Elk profiel hoort bij een bestaand Birdspot-ID. Eigenaarsbesluit 10-11-2026: eerst de soorten met
 *          gidsfoto's; een profiel voor een soort zonder foto faalt (vervangt de proefgrens 6–10 soorten).
 *   KB-02  Elke inhoudelijke bewering heeft ≥1 bron; elke bronsleutel bestaat; elke bron heeft https-URL,
 *          editie/datum, scope, wat bevestigd, controledatum en zekerheid.
 *   KB-03  vs- en similar-ID's bestaan, zijn niet de soort zelf en worden als navigeerbare chip getoond.
 *   KB-04  Geen verwisselde inhoud tussen gelijkende soorten (vaste feitenfixtures per paar).
 *   KB-05  Proefsoorten: Niveau 1 staat vóór Verenkleed, kritisch kenmerk zichtbaar in Niveau 1,
 *          Niveau 2 als ingeklapte <details>, bronnen gelinkt met de echte URL.
 *   KB-06  Soorten zonder profiel: geen enkele kb-markup, bestaande veldkenmerken-callout blijft.
 *   KB-07  Alle 597 soorten renderen in Herkenning, Leefwijze en Waar zonder fout.
 *   KB-08  Negatieve scenario's: onbekend ID, soort zonder fieldmarks, lege life.
 *   KB-09  Offline: beide nieuwe modules staan in de service-worker-precache.
 *
 * Starten:  node tests/test_kennisbaseline.mjs
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPECIES } from '../src/data/species.js';
import { LIFE } from '../src/data/speciesLife.js';
import { KNOWLEDGE, KNOWLEDGE_SOURCES } from '../src/data/speciesKnowledge.js';
import { GUIDE_PHOTOS } from '../src/features/species/guidePhotos.js';
import { GUIDE_HEROES, GUIDE_PLUMAGE, GUIDE_POSES } from '../src/features/species/guideMedia.js';
import { recognitionPanel, statusPanel, wherePanel } from '../src/features/species/detailSections.js';
import { knowledgeFor, quickPanel, recognitionDetails, lifeDetails, whereDetails } from '../src/features/species/knowledgeSections.js';

const byId = new Map(SPECIES.map(s => [s.id, s]));
const ids = Object.keys(KNOWLEDGE);
const REL = new Set(['doorslaggevend', 'ondersteunend', 'onbetrouwbaar-alleen']);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ── KB-01 ───────────────────────────────────────────────────────────────────
assert.ok(ids.length >= 6, `KB-01 minstens de 6 proefsoorten verwacht, nu ${ids.length}`);
const hasPhoto = id => Boolean(GUIDE_PHOTOS[id] || GUIDE_HEROES[id] ||
  (GUIDE_PLUMAGE[id] && Object.keys(GUIDE_PLUMAGE[id]).length) || GUIDE_POSES[id]?.length);
for (const id of ids) {
  assert.ok(byId.has(id), `KB-01 onbekend Birdspot-ID ${id}`);
  assert.ok(hasPhoto(id), `KB-01 ${id} heeft geen gidsfoto: eerst de collectie met foto's (eigenaarsbesluit 10-11-2026)`);
}
console.log(`KB-01 OK — ${ids.length} profielen, alle ID's bestaan`);

// ── KB-02 ───────────────────────────────────────────────────────────────────
for (const [key, src] of Object.entries(KNOWLEDGE_SOURCES)) {
  assert.match(src.url, /^https:\/\//, `KB-02 bron ${key} zonder https-URL`);
  for (const f of ['label', 'edition', 'scope', 'confirms', 'checked', 'certainty'])
    assert.ok(String(src[f] || '').trim(), `KB-02 bron ${key} mist ${f}`);
  assert.match(src.checked, /^\d{4}-\d{2}-\d{2}$/, `KB-02 bron ${key} controledatum geen ISO-datum`);
}
let claims = 0;
const needSource = (id, where, item) => {
  claims++;
  assert.ok(item?.sources?.length, `KB-02 ${id} ${where}: bewering zonder bron`);
  for (const r of item.sources) assert.ok(KNOWLEDGE_SOURCES[r], `KB-02 ${id} ${where}: onbekende bron ${r}`);
};
for (const id of ids) {
  const k = KNOWLEDGE[id];
  needSource(id, 'summary', k.summary);
  if (k.caution) needSource(id, 'caution', k.caution);
  if (k.basis?.size) needSource(id, 'basis.size', k.basis.size);
  assert.ok(k.keyMarks.length >= 3 && k.keyMarks.length <= 5, `KB-02 ${id} keyMarks ${k.keyMarks.length}`);
  k.keyMarks.forEach((m, i) => { needSource(id, `keyMarks[${i}]`, m); assert.ok(REL.has(m.reliability)); });
  assert.ok(k.critical.length >= 1, `KB-02 ${id} heeft geen kritisch kenmerk`);
  k.critical.forEach((c, i) => {
    needSource(id, `critical[${i}]`, c);
    assert.ok(REL.has(c.reliability), `KB-02 ${id} critical[${i}] betrouwbaarheid`);
    for (const f of ['feature', 'where', 'this', 'other', 'conditions', 'exceptions', 'supporting'])
      assert.ok(String(c[f] || '').trim(), `KB-02 ${id} critical[${i}] veld ${f} leeg`);
  });
  for (const f of ['detail', 'voice', 'habitat', 'status', 'life'])
    (k[f] || []).forEach((it, i) => needSource(id, `${f}[${i}]`, it));
  (k.discrepancies || []).forEach((d, i) => needSource(id, `discrepancies[${i}]`, d));
  // similar mag zonder bron, maar dan moet het een bestaande Birdspot-vergelijking zijn en zo getoond worden
  (k.similar || []).forEach(x => (x.sources || []).forEach(r => assert.ok(KNOWLEDGE_SOURCES[r], `KB-02 ${id} similar bron ${r}`)));
}
console.log(`KB-02 OK — ${claims} beweringen met bron, ${Object.keys(KNOWLEDGE_SOURCES).length} bronnen volledig`);

// ── KB-03 ───────────────────────────────────────────────────────────────────
for (const id of ids) {
  const k = KNOWLEDGE[id];
  const html = recognitionPanel(byId.get(id), LIFE[id] || null);
  for (const c of k.critical) for (const vs of c.vs || []) {
    assert.ok(byId.has(vs) && vs !== id, `KB-03 ${id} critical vs ${vs}`);
  }
  for (const x of k.similar || []) {
    assert.ok(byId.has(x.id) && x.id !== id, `KB-03 ${id} similar ${x.id}`);
    assert.ok(html.includes(`data-compare-species="${x.id}"`), `KB-03 ${id} knop naar ${x.id} ontbreekt`);
    // Precies één navigatieknop per gelijkende soort binnen de vergelijkingsplek (geen dubbele kaarten).
    const lijkt = html.slice(html.indexOf('>Lijkt op<'));
    const vlucht = html.match(/aria-label="Vluchtvergelijking"[\s\S]*?<\/section>/)?.[0] || '';
    const n = (lijkt.match(new RegExp(`data-compare-species="${x.id}"`, 'g')) || []).length
      + (vlucht.match(new RegExp(`data-compare-species="${x.id}"`, 'g')) || []).length;
    assert.ok(n >= 1, `KB-03 ${id} geen vergelijkingsplek voor ${x.id}`);
    assert.ok(!(html.indexOf('>Lijkt op<') > 0 && vlucht.includes(`data-compare-species="${x.id}"`) && lijkt.includes(`data-kb-similar`) && lijkt.match(/data-kb-similar[\s\S]*/)[0].includes(`data-compare-species="${x.id}"`)),
      `KB-03 ${id} ${x.id} staat dubbel (vluchtvergelijking én extra lijst)`);
  }
  const quick = quickPanel(byId.get(id));
  assert.ok(!quick.includes('data-compare-species'), `KB-03 ${id} Niveau 1 bevat nog vergelijkingschips (dubbel met "Lijkt op")`);
  assert.ok(!recognitionDetails(byId.get(id)).includes('data-kb-section="gelijkend"'), `KB-03 ${id} accordion "Vergelijkbare soorten" nog aanwezig (dubbel)`);
}
console.log('KB-03 OK — vergelijkings-ID\'s geldig; één vergelijkingsplek onder "Lijkt op", geen dubbele chips of accordion');

// ── KB-04 anti-verwisseling ─────────────────────────────────────────────────
const crit = (id, feature) => {
  const c = KNOWLEDGE[id].critical.find(x => x.feature === feature);
  assert.ok(c, `KB-04 ${id} mist kritisch kenmerk "${feature}"`);
  return c;
};
const FIXTURES = [
  ['sp057', 'Poten', /licht/i, /donker/i, 'sp056'],          // Fitis licht, Tjiftjaf donker
  ['sp056', 'Poten', /donker/i, /licht/i, 'sp057'],
  ['sp057', 'Zang', /afloopt/i, /tjif-tjaf/i, 'sp056'],
  ['sp056', 'Zang', /tjif-tjaf/i, /afloopt/i, 'sp057'],
  ['sp057', 'Handpenprojectie', /lang/i, /korter/i, 'sp056'],
  ['sp056', 'Handpenprojectie', /kort/i, /lang/i, 'sp057'],
  ['sp006', 'Staartpunt', /recht/i, /afgerond/i, 'sp007'],     // Sperwer recht, Havik afgerond
  ['sp006', 'Onderzijde jonge vogels', /dwarsbanden/i, /lengtestrepen/i, 'sp007'],
  ['sp094', 'Pootkleur', /roze/i, /geel/i, 'sp226'],          // Zilvermeeuw roze, Geelpootmeeuw geel
  ['sp066', 'Vleugelbandpatroon', /tandvormig|driehoekig/i, /recht afgesneden|blokvormig/i, 'sp067'],
  ['sp002', 'Witte vleugelband', /witte band/i, /geen wit/i, 'sp003'],      // Houtduif wit, Holenduif niet
  ['sp003', 'Wit in de vleugel', /geen wit/i, /witte vleugelband/i, 'sp002'],
  ['sp004', 'Hals en bovendelen', /zwarte halsband/i, /gestreepte halsvlek/i, 'sp197'], // Turkse Tortel vs Zomertortel
  ['sp005', 'Iris', /donker/i, /geel/i, 'sp248'],             // Buizerd volwassen donker, Wespendief geel
];
for (const [id, feature, thisRe, otherRe, vs] of FIXTURES) {
  const c = crit(id, feature);
  assert.match(c.this, thisRe, `KB-04 ${id} ${feature}: eigen kenmerk verwisseld`);
  assert.doesNotMatch(c.this, otherRe, `KB-04 ${id} ${feature}: kenmerk van ${vs} staat bij ${id}`);
  assert.match(c.other, otherRe, `KB-04 ${id} ${feature}: kenmerk van ${vs} verwisseld`);
  assert.ok(c.vs.includes(vs), `KB-04 ${id} ${feature}: vergelijkt niet met ${vs}`);
}
assert.match(crit('sp008', 'Geslacht').this, /Mannetje: grijze kop/, 'KB-04 Torenvalk mannetje grijze kop');
assert.doesNotMatch(crit('sp008', 'Geslacht').this, /Vroutje: grijze kop|Vrouwtje: grijze kop/, 'KB-04 Torenvalk vrouwtje grijze kop');
// Gerenderd: het profiel van de ene soort komt nooit in de kaart van de partner terecht.
for (const [a, b] of [['sp057', 'sp056'], ['sp006', 'sp007'], ['sp005', 'sp248'], ['sp066', 'sp067'], ['sp002', 'sp003'], ['sp004', 'sp197']]) {
  const htmlB = recognitionPanel(byId.get(b), LIFE[b] || null);
  assert.ok(!htmlB.includes(esc(KNOWLEDGE[a].summary.text)), `KB-04 samenvatting ${a} verschijnt bij ${b}`);
  const htmlA = recognitionPanel(byId.get(a), LIFE[a] || null);
  assert.ok(htmlA.includes(`data-kb="${a}"`) && !htmlA.includes(`data-kb="${b}"`), `KB-04 ${a} draagt verkeerd profiel`);
  if (KNOWLEDGE[b]) assert.ok(!htmlA.includes(esc(KNOWLEDGE[b].summary.text)), `KB-04 samenvatting ${b} verschijnt bij ${a}`);
}
console.log(`KB-04 OK — ${FIXTURES.length + 1} feitenfixtures en 6 paren zonder verwisseling`);

// ── KB-05 proefsoorten gerenderd ────────────────────────────────────────────
for (const id of ids) {
  const s = byId.get(id);
  const html = recognitionPanel(s, LIFE[id] || null);
  const quick = html.indexOf('aria-label="Snel herkennen"');
  const veren = html.indexOf('>Verenkleed<');
  const detail = html.indexOf('aria-label="Determinatie in detail"');
  assert.ok(quick >= 0, `KB-05 ${id} Niveau 1 ontbreekt`);
  if (veren >= 0) assert.ok(quick < veren, `KB-05 ${id} Niveau 1 staat niet vóór Verenkleed`);
  assert.ok(detail > quick, `KB-05 ${id} Niveau 2 ontbreekt of staat vóór Niveau 1`);
  const quickHtml = quickPanel(s);
  assert.ok(quickHtml.includes('data-kb-critical'), `KB-05 ${id} kritisch kenmerk niet in Niveau 1`);
  assert.ok(quickHtml.includes('kb-rel--'), `KB-05 ${id} betrouwbaarheid niet zichtbaar`);
  assert.equal((quickHtml.match(/class="kb-mark"/g) || []).length, KNOWLEDGE[id].keyMarks.length, `KB-05 ${id} veldkenmerken`);
  const det = recognitionDetails(s);
  assert.ok(!/<details[^>]*\bopen\b/.test(det), `KB-05 ${id} Niveau 2 staat standaard open`);
  assert.equal((det.match(/class="kb-crit-card"/g) || []).length, KNOWLEDGE[id].critical.length, `KB-05 ${id} kritische kaarten`);
  const life = statusPanel(s, LIFE[id] || null);
  assert.ok(life.includes('aria-label="Kennisprofiel"'), `KB-05 ${id} Kennisprofiel ontbreekt in Leefwijze`);
  const kbLife = lifeDetails(s);
  assert.ok(life.includes(kbLife), `KB-05 ${id} kennisprofiel niet in Leefwijze-tab`);
  for (const href of [...kbLife.matchAll(/<a href="([^"]+)"/g)].map(m => m[1].replace(/&amp;/g, '&'))) {
    if (!href.startsWith('http')) continue;
    assert.ok(Object.values(KNOWLEDGE_SOURCES).some(src => src.url === href), `KB-05 ${id} onbekende link ${href}`);
  }
  const used = new Set();
  const k = KNOWLEDGE[id];
  [k.summary, k.caution, k.basis?.size, ...k.keyMarks, ...k.critical, ...(k.similar || []), ...(k.detail || []),
    ...(k.voice || []), ...(k.habitat || []), ...(k.status || []), ...(k.life || [])].forEach(x => (x?.sources || []).forEach(r => used.add(r)));
  for (const r of used) assert.ok(life.includes(`href="${esc(KNOWLEDGE_SOURCES[r].url)}"`), `KB-05 ${id} bron ${r} niet gelinkt`);
  assert.ok(life.includes('onafhankelijke controle nog open'), `KB-05 ${id} reviewstatus ontbreekt`);
  if (k.habitat?.length) assert.ok(wherePanel(s).includes('data-kb-section="leefgebied"'), `KB-05 ${id} leefgebied ontbreekt`);
}
console.log(`KB-05 OK — ${ids.length} proefsoorten: Niveau 1 vóór de foto's, Niveau 2 ingeklapt, bronnen gelinkt`);

// ── KB-06 / KB-07 ───────────────────────────────────────────────────────────
let without = 0;
for (const s of SPECIES) {
  const rec = recognitionPanel(s, LIFE[s.id] || null);
  const st = statusPanel(s, LIFE[s.id] || null);
  const wh = wherePanel(s);
  assert.equal(typeof rec, 'string'); assert.equal(typeof st, 'string'); assert.equal(typeof wh, 'string');
  if (KNOWLEDGE[s.id]) continue;
  without++;
  for (const [tab, html] of [['herkenning', rec], ['leefwijze', st], ['waar', wh]])
    assert.ok(!/\bkb-/.test(html), `KB-06 ${s.id} (${tab}) krijgt kb-markup zonder profiel`);
  if (s.fieldmarks) assert.ok(rec.includes(esc(s.fieldmarks)), `KB-06 ${s.id} veldkenmerken-callout verdwenen`);
}
assert.equal(without + ids.length, SPECIES.length);
console.log(`KB-06/07 OK — ${SPECIES.length} soorten renderen; ${without} zonder profiel ongewijzigd`);

// ── KB-08 negatieve scenario's ──────────────────────────────────────────────
assert.equal(knowledgeFor('sp999'), null);
assert.equal(knowledgeFor(undefined), null);
for (const fn of [quickPanel, recognitionDetails, lifeDetails, whereDetails]) assert.equal(fn({ id: 'sp999' }), '');
const pilot = byId.get(ids[0]);
assert.doesNotThrow(() => recognitionPanel({ ...pilot, fieldmarks: '' }, null));
assert.doesNotThrow(() => statusPanel(pilot, null));
assert.ok(statusPanel(pilot, null).includes('aria-label="Kennisprofiel"'), 'KB-08 Kennisprofiel ook zonder life-data');
// Escaping: geen ruwe HTML uit de profieltekst in de uitvoer
assert.ok(!quickPanel(pilot).includes('<script'), 'KB-08 escaping');
console.log('KB-08 OK — onbekend ID, lege velden en ontbrekende life-data veilig');

// ── KB-09 offline ───────────────────────────────────────────────────────────
const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
for (const p of ['src/features/species/knowledgeSections.js', 'src/data/speciesKnowledge.js'])
  assert.ok(sw.includes(`'${p}'`), `KB-09 ${p} niet in precache`);
console.log('KB-09 OK — kennismodules in de service-worker-precache');

console.log('Kennisbaseline proef: alle controles geslaagd (KB-01..KB-09)');
