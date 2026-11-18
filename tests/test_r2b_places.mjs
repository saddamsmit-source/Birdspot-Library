// Ronde 2B — node-unit voor plekconsolidatie (pure functies uit src/data/places.js).
// Starten: node tests/test_r2b_places.mjs
import assert from 'node:assert/strict';
import {
  candidatePlaces, placeDecision, matchSoundPlace, reuseRadiusM, accurateEnough, planMigration,
  PLACE_REUSE_RADIUS_M, MAX_AUTO_ACCURACY_M, distanceM,
} from '../src/data/places.js';

const M_PER_DEG_LAT = (Math.PI / 180) * 6371008.8; // zelfde aardstraal als places.js
const BASE = { lat: 52.1, lon: 5.1 };
const north = m => ({ lat: BASE.lat + m / M_PER_DEG_LAT, lon: BASE.lon });
const place = (id, m) => ({ id, name: id, ...north(m), createdAt: '2026-01-01T00:00:00Z' });
let n = 0;
const ok = (name, fn) => { fn(); n++; console.log('PASS', name); };

ok('U01 standaardstraal 250 m, auto-grens 50 m', () => {
  assert.equal(PLACE_REUSE_RADIUS_M, 250);
  assert.equal(MAX_AUTO_ACCURACY_M, 50);
});
ok('U02 afstandshulp klopt (249/251 m)', () => {
  assert.ok(Math.abs(distanceM(BASE.lat, BASE.lon, north(249).lat, BASE.lon) - 249) < 0.01);
  assert.ok(Math.abs(distanceM(BASE.lat, BASE.lon, north(251).lat, BASE.lon) - 251) < 0.01);
});
ok('U03 grens: 249 m wel kandidaat, 251 m niet', () => {
  assert.deepEqual(candidatePlaces([place('a', 249)], BASE.lat, BASE.lon).map(c => c.place.id), ['a']);
  assert.deepEqual(candidatePlaces([place('b', 251)], BASE.lat, BASE.lon), []);
});
ok('U04 0 kandidaten → nieuwe plek', () => {
  const d = placeDecision({ places: [place('far', 900)], ...BASE, accuracyM: 5 });
  assert.equal(d.mode, 'new'); assert.equal(d.auto, false); assert.equal(d.candidates.length, 0);
});
ok('U05 1 kandidaat + nauwkeurig (9 m) → zelfde plek automatisch', () => {
  const d = placeDecision({ places: [place('a', 120)], ...BASE, accuracyM: 9 });
  assert.equal(d.mode, 'single'); assert.equal(d.auto, true); assert.equal(d.candidates[0].place.id, 'a');
});
ok('U06 1 kandidaat + grens 50 m → nog automatisch; 51 m → nooit', () => {
  assert.equal(placeDecision({ places: [place('a', 120)], ...BASE, accuracyM: 50 }).auto, true);
  const d = placeDecision({ places: [place('a', 120)], ...BASE, accuracyM: 51 });
  assert.equal(d.mode, 'single'); assert.equal(d.auto, false); assert.equal(d.accurate, false);
});
ok('U07 onbekende nauwkeurigheid (null/undefined/NaN/"") → nooit automatisch', () => {
  for (const accuracyM of [null, undefined, NaN, '', 'x', -3]) {
    const d = placeDecision({ places: [place('a', 20)], ...BASE, accuracyM });
    assert.equal(d.auto, false, String(accuracyM)); assert.equal(d.mode, 'single');
  }
  assert.equal(accurateEnough(0), true);
});
ok('U08 2 kandidaten → keuze, nooit automatisch, dichtstbij eerst', () => {
  const d = placeDecision({ places: [place('ver', 200), place('dicht', 40)], ...BASE, accuracyM: 3 });
  assert.equal(d.mode, 'choose'); assert.equal(d.auto, false);
  assert.deepEqual(d.candidates.map(c => c.place.id), ['dicht', 'ver']);
});
ok('U09 straal configureerbaar (100 m sluit 150 m uit; 500 m neemt 400 m mee)', () => {
  assert.equal(placeDecision({ places: [place('a', 150)], ...BASE, accuracyM: 5, radiusM: 100 }).mode, 'new');
  assert.equal(placeDecision({ places: [place('a', 400)], ...BASE, accuracyM: 5, radiusM: 500 }).auto, true);
});
ok('U10 instelling: geldig 100/250/500, anders 250 (ook corrupte JSON)', () => {
  const store = v => ({ getItem: () => v });
  assert.equal(reuseRadiusM(store(JSON.stringify({ placeRadiusM: 500 }))), 500);
  assert.equal(reuseRadiusM(store(JSON.stringify({ placeRadiusM: 123 }))), 250);
  assert.equal(reuseRadiusM(store('{kapot')), 250);
  assert.equal(reuseRadiusM(store(null)), 250);
});
ok('U11 geluidsessie volgt dezelfde regels', () => {
  const one = [place('a', 100)];
  assert.equal(matchSoundPlace(one, { ...north(0), pinAccuracyM: 8 }, true).place.id, 'a');
  const vague = matchSoundPlace(one, { ...north(0), pinAccuracyM: 80 }, true);
  assert.equal(vague.place, null); assert.equal(vague.needsChoice, true); assert.equal(vague.alternatives[0].place.id, 'a');
  const unknown = matchSoundPlace(one, { ...north(0), pinAccuracyM: null }, true);
  assert.equal(unknown.place, null); assert.equal(unknown.needsChoice, true);
  const two = matchSoundPlace([place('a', 30), place('b', 60)], { ...north(0), pinAccuracyM: 5 }, true);
  assert.equal(two.place, null); assert.equal(two.alternatives.length, 2);
  const none = matchSoundPlace([place('far', 900)], { ...north(0), pinAccuracyM: 80 }, true);
  assert.equal(none.place, null); assert.equal(none.needsChoice, true, 'onnauwkeurig zonder plek: controleren');
  const exact = matchSoundPlace([place('a', 0)], { ...north(0), pinAccuracyM: null }, false);
  assert.equal(exact.place.id, 'a', 'exact dezelfde bewaarde plek blijft zeker');
});
ok('U12 geen oude plekken samenvoegen (migratie laat bestaande plekken op 10 m apart)', () => {
  const places = [place('a', 0), place('b', 10)];
  const { places: out, assign } = planMigration([{ id: 's1', ...north(0), placeId: 'a' }, { id: 's2', ...north(10), placeId: 'b' }], places);
  assert.deepEqual(out.map(p => p.id), ['a', 'b']); assert.equal(assign.size, 0);
});
ok('U13 ongeldige plekken/coördinaten worden genegeerd', () => {
  assert.deepEqual(candidatePlaces([{ id: 'x', lat: null, lon: 5 }, { lat: BASE.lat, lon: BASE.lon }], BASE.lat, BASE.lon), []);
  assert.deepEqual(candidatePlaces([place('a', 1)], null, null), []);
});
ok('U14 herstel P3: 50,0 m automatisch, 50,4 m niet (geen afronding vóór de beslissing)', () => {
  assert.equal(placeDecision({ places: [place('a', 120)], ...BASE, accuracyM: 50.0 }).auto, true);
  assert.equal(placeDecision({ places: [place('a', 120)], ...BASE, accuracyM: 50.4 }).auto, false);
  assert.equal(matchSoundPlace([place('a', 100)], { ...north(0), pinAccuracyM: 50.4 }, true).place, null);
  assert.equal(matchSoundPlace([place('a', 100)], { ...north(0), pinAccuracyM: 50.0 }, true).place.id, 'a');
});
console.log(`R2B-UNIT PASS: ${n}/14`);
