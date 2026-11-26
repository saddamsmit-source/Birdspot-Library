/** FOT-02 en WEE-01 — pure functies (PR #360). */
import assert from 'node:assert/strict';
import { compassPoint, windMarkup, weatherPlace, WEATHER_PLACE_RADIUS_M } from '../src/features/home/weatherFormat.js';
import { guideHeroPhotos, guideHeroPhoto, guidePhotoRole } from '../src/features/species/detailSections.js';
import { GUIDE_HERO_SETS, MAX_HERO_PHOTOS } from '../src/features/species/guideHeroSets.js';

// WEE-01: 16 punten, Nederlands, graden en punt altijd consistent; ontbrekend = null.
const want = [[0, 'N'], [11, 'N'], [12, 'NNO'], [45, 'NO'], [67, 'ONO'], [90, 'O'], [135, 'ZO'], [180, 'Z'], [225, 'ZW'], [270, 'W'], [315, 'NW'], [348, 'NNW'], [349, 'N'], [360, 'N'], [-90, 'W'], [720.4, 'N']];
for (const [deg, abbr] of want) assert.equal(compassPoint(deg)?.abbr, abbr, `${deg}°`);
for (const missing of [null, undefined, '', NaN, 'abc', Infinity]) assert.equal(compassPoint(missing), null, String(missing));
assert.match(windMarkup(5, 45), /5 m\/s · wind uit NO \(45°\)/);
assert.match(windMarkup(5, 45), /uit het noordoosten, 45 graden/);
assert.match(windMarkup(5, 45), /rotate\(225deg\)/, 'pijl wijst waar de wind naartoe waait');
assert.doesNotMatch(windMarkup(5, null), /wind uit/);
assert.match(windMarkup(undefined, undefined), /Wind onbekend/);
assert.doesNotMatch(windMarkup('<b>', 10), /<b>/, 'geen HTML uit API-waarden');
// Locatie: nooit coördinaten; eigen plek ≤ 3 km; anders algemene omschrijving; fallback eerlijk.
assert.equal(WEATHER_PLACE_RADIUS_M, 3000);
const plek = [{name: 'Kralingse Plas', lat: 51.9285, lon: 4.511}];
assert.equal(weatherPlace({source: 'gps', lat: 51.92, lon: 4.47, places: plek}).text, 'Bij Kralingse Plas');
assert.equal(weatherPlace({source: 'gps', lat: 52.09, lon: 5.12, places: plek}).text, 'Je huidige omgeving');
// GPS-01 (26-11-2026): nooit een standaardstad; zonder positie geen plaatsaanduiding (bewuste testwijziging).
assert.equal(weatherPlace({source: 'fallback', lat: 52.37, lon: 4.9, places: plek}), null);
assert.equal(weatherPlace({state: 'none', lat: null, lon: null}), null);
assert.equal(weatherPlace({state: 'manual', lat: 51.92, lon: 4.47, places: plek}).text, 'Bij Kralingse Plas');
assert.equal(weatherPlace({state: 'manual', lat: 52.09, lon: 5.12}).hint, 'zelf gekozen, geen GPS');
assert.match(weatherPlace({state: 'last', lat: 52.09, lon: 5.12, at: Date.UTC(2026, 10, 26, 13, 5)}).hint, /^niet actueel · GPS van \d\d:\d\d$/);
assert.equal(weatherPlace({source: 'gps', lat: 51.92, lon: 4.47, places: [{name: 'x', lat: 'nope', lon: 1}, null]}).text, 'Je huidige omgeving');
for (const p of [weatherPlace({source: 'gps', lat: 51.92, lon: 4.47, places: plek}), weatherPlace({source: 'gps', lat: 52.09, lon: 5.12})])
  assert.doesNotMatch(p.text + p.hint, /\d+[.,]\d+/);

// FOT-02: standaard leeg → precies één hoofdfoto per soort; lijst alleen eigen, gecrediteerde, unieke foto's, max. 3.
assert.deepEqual(Object.keys(GUIDE_HERO_SETS), [], 'zonder eigenaarbesluit geen extra hoofdfoto\'s');
assert.equal(MAX_HERO_PHOTOS, 3);
assert.deepEqual(guideHeroPhotos('sp019').map(p => p.image), [guideHeroPhoto('sp019').image]);
const set = guideHeroPhotos('sp019', {sp019: ['/assets/species/plumage/sp019-hero-male.webp', '/assets/species/sp045.webp', '/x.webp',
  '/assets/species/plumage/sp019-female-ground.webp', '/assets/species/plumage/sp019-female-ground.webp',
  '/assets/species/plumage/sp019-flight.webp', '/assets/species/plumage/sp019-juv.webp']});
assert.deepEqual(set.map(p => p.image.split('/').pop()), ['sp019-hero-male.webp', 'sp019-female-ground.webp', 'sp019-flight.webp']);
assert.ok(set.every(p => p.author && p.license), 'credits per foto');
assert.deepEqual(set.map(guidePhotoRole), ['Mannetje', 'Vrouwtje', 'Vrouwtje · in vlucht']);
assert.deepEqual(guideHeroPhotos('sp001'), [], 'soort zonder gidsfoto blijft zonder hoofdfoto');
console.log('FOT-WEE-UNITS PASS: kompas 16 punten + ontbrekende waarden, wind- en locatietekst zonder coördinaten, hoofdfotoreeks gecontroleerd');
