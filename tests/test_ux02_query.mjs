/**
 * UX-02A unittests (25-11-2026): gedeelde zoek- en filterlogica voor eigen waarnemingen.
 */
import assert from 'node:assert/strict';
import {
  normalizeSearch, dateTerms, filterSightings, cleanFilters, emptyFilters, activeFilterCount,
  periodFromQuery, sourceCategory, certaintyCategory, placeOf, placeNameKind, FILTER_GROUPS,
} from '../src/features/sightings/sightingQuery.js';
import { SPECIES } from '../src/data/species.js';
import { sightingDateRange, dateInRange } from '../src/data/seasons.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };

const speciesById = new Map(SPECIES.map(sp => [sp.id, sp]));
const placesById = new Map([
  ['pl_named', { id: 'pl_named', name: 'Amstelpark', lat: 52.33, lon: 4.89 }],
  ['pl_auto', { id: 'pl_auto', name: 'Plek 2', lat: 52.2, lon: 5 }],
  ['pl_auto_new', { id: 'pl_auto_new', name: 'Plek 3', nameOrigin: 'auto', lat: 52.1, lon: 5.1 }],
]);
const today = new Date(2026, 10, 25);   // 25 november 2026 (lokale tijd)
const ctx = { speciesById, placesById, today };
const R = (id, o) => ({ id, speciesId: 'sp045', speciesName: 'Merel', date: '2026-11-25', photoIds: [], audioIds: [], ...o });
const data = [
  R('a', { observationMethod: 'seen', identificationSource: 'self', certainty: 'certain', placeId: 'pl_named', photoIds: ['p'] }),
  R('b', { speciesId: 'sp029', speciesName: 'Koolmees', date: '2026-11-24', observationMethod: 'heard', identificationSource: 'self',
    certainty: 'probable', placeId: 'pl_auto', audioIds: ['x'] }),
  R('c', { speciesId: 'sp050', speciesName: 'Roodborst', date: '2026-06-12', observationMethod: 'both', identificationSource: 'merlin',
    merlinVerification: 'suggested', certainty: 'possible', locationName: 'Achtertuin' }),
  R('d', { date: '2026-06-13', observationMethod: 'heard', identificationSource: 'birdnet', birdnetVerification: 'suggested', certainty: 'possible' }),
  R('e', { speciesId: 'sp046', speciesName: 'Zanglijster', date: '2025-04-20', observationMethod: 'heard', identificationSource: 'birdnet',
    birdnetVerification: 'checked', certainty: 'certain', placeId: 'pl_named' }),
  R('f', { date: '2025-05-01', observationMethod: 'heard', identificationSource: 'self', certainty: 'certain', soundSuggestion: { score: 0.6 } }),
  { id: 'g', speciesId: 'sp043', speciesName: 'Huismus', date: '2024-03-03', certainty: 'certain', locationName: 'Stationsplein' },
  R('h', { speciesId: 'sp066', speciesName: 'Boomkruiper', date: '2026-06-14', observationMethod: 'heard', identificationSource: 'birdnet',
    birdnetVerification: 'suggested', certainty: 'certain', placeId: 'pl_auto_new' }),
  null, { speciesName: 'zonder id' }, 'tekst',
];
const ids = (state) => filterSightings(data, state, ctx).map(s => s.id).sort().join('');

// 1. Normalisatie en datumtermen
ok(normalizeSearch('  Grauwe Gans – Anser ') === 'grauwe gans anser', 'normalisatie');
ok(normalizeSearch('Égée') === 'egee', 'accenten weg');
eq(dateTerms('2026-06-03'), ['2026-06-03', '03-06-2026', '3 juni 2026', 'jun 2026'], 'datumtermen');
eq(dateTerms('kapot'), [], 'ongeldige datum');

// 2. Zoeken: NL, wetenschappelijk, EN, plek, plaatsnaam, datum, periode; ongeldige records genegeerd
ok(ids({ query: 'merel' }) === 'adf', 'NL soortnaam');
ok(ids({ query: 'Turdus merula' }) === 'adf', 'wetenschappelijke naam');
ok(ids({ query: 'blackbird' }) === 'adf', 'Engelse naam');
ok(ids({ query: 'amstelpark' }) === 'ae', 'gekoppelde plek');
ok(ids({ query: 'achtertuin' }) === 'c', 'plaatsnaam');
ok(ids({ query: 'plek 2' }) === 'b', 'automatische plek');
ok(ids({ query: '12-06-2026' }) === 'c', 'datum dd-mm-jjjj');
ok(ids({ query: 'juni 2026' }) === 'cdh', 'maand en jaar');
ok(ids({ query: '2025' }) === 'ef', 'jaar');
ok(ids({ query: 'merel juni' }) === 'd', 'combinatie (EN)');
ok(ids({ query: 'vandaag' }) === 'a', 'vandaag');
ok(ids({ query: 'gisteren' }) === 'b', 'gisteren');
ok(ids({ query: 'deze maand' }) === 'ab', 'deze maand');
ok(ids({ query: 'vorig jaar' }) === 'ef', 'vorig jaar');
ok(ids({ query: 'merel deze maand' }) === 'a', 'periode + soort');
ok(ids({ query: 'zzzz' }) === '', 'geen resultaat');
ok(ids({}) === 'abcdefgh', 'alles zonder zoekopdracht; ongeldige records weg');
const p = periodFromQuery('Merel vorige maand', today);
eq([p.range, p.rest], [['2026-10-01', '2026-10-31'], 'merel'], 'vorige maand');
eq(periodFromQuery('deze week', today).range, ['2026-11-23', '2026-11-25'], 'deze week vanaf maandag');

// 3. Filters: OF binnen groep, EN tussen groepen
const f = o => ({ filters: { ...emptyFilters(), ...o } });
ok(ids(f({ method: ['heard'] })) === 'bdefh', 'gehoord');
ok(ids(f({ method: ['seen', 'both'] })) === 'ac', 'gezien OF beide');
ok(ids(f({ media: ['photo'] })) === 'a', 'met foto');
ok(ids(f({ media: ['audio'] })) === 'b', 'met geluid');
ok(ids(f({ source: ['birdnet'] })) === 'deh', 'BirdNET');
ok(ids(f({ source: ['self'] })) === 'ab', 'eigen herkenning zonder oude BirdNET-suggestie');
ok(ids(f({ source: ['unknown'] })) === 'f', 'controle onbekend: oude BirdNET-suggestie (UX-03B)');
ok(ids(f({ source: ['unrecorded'] })) === 'g', 'bron niet vastgelegd: oud record zonder bron (UX-03B)');
ok(ids(f({ source: ['merlin'] })) === 'c', 'Merlin');
ok(ids(f({ certainty: ['certain'] })) === 'aeg', 'Zeker zonder ongecontroleerde of oude suggesties');
ok(ids(f({ method: ['heard'], source: ['birdnet'], certainty: ['certain'] })) === 'e', 'combinatie EN');
ok(ids({ ...f({ method: ['heard'] }), query: 'merel' }) === 'df', 'filter + zoeken');
ok(ids({ speciesId: 'sp045' }) === 'adf', 'soortfilter');
ok(ids({ place: 'place:pl_named', speciesId: 'sp045', period: '6m', season: 'herfst' }) === 'a', 'plek, soort, halfjaar en seizoen samen');
ok(ids({ place: 'text:achtertuin' }) === 'c', 'losse plaatsnaam in oudere waarneming');
ok(ids({ season: 'lente' }) === 'efg', 'seizoen over verschillende jaren');
eq(sightingDateRange('6m', new Date(2024, 7, 31)), ['2024-02-29', '2024-08-31'], 'halfjaar en schrikkeldag');
eq(sightingDateRange('6m', new Date(2026, 0, 15)), ['2025-07-15', '2026-01-15'], 'halfjaar over de jaargrens');
const [start, end] = sightingDateRange('6m', today);
ok(dateInRange(start, [start, end]) && dateInRange(end, [start, end]), 'grenzen halfjaar inclusief');
ok(!dateInRange('2026-05-24', [start, end]) && !dateInRange('2026-11-26', [start, end]), 'buiten het halfjaar');

// 4. Categorieën en plekken
eq(['a', 'c', 'd', 'f', 'g'].map(id => sourceCategory(data.find(x => x?.id === id))), ['self', 'merlin', 'birdnet', 'unknown', 'unrecorded'], 'bron');
eq(['a', 'b', 'f', 'h'].map(id => certaintyCategory(data.find(x => x?.id === id))), ['certain', 'probable', 'unchecked', 'unchecked'], 'zekerheid');
eq(['pl_named', 'pl_auto', 'pl_auto_new'].map(id => placeNameKind(placesById.get(id))), ['user', 'auto', 'auto'], 'plekherkomst');
ok(placeNameKind({ name: 'Plek 9', nameOrigin: 'user' }) === 'user', 'zelf "Plek 9" genoemd blijft benoemd');
eq(['a', 'b', 'c', 'g'].map(id => placeOf(data.find(x => x?.id === id), placesById).kind), ['named', 'auto', 'text', 'text'], 'plaatssoort');
eq(placeOf({ lat: 52.1, lon: 5.2 }, placesById), { kind: 'gps', name: '52.1000, 5.2000', place: null }, 'alleen GPS');
eq(placeOf({}, placesById).kind, 'none', 'geen plek');

// 5. Opgeslagen weergavestand wordt gezuiverd
eq(cleanFilters({ method: ['heard', 'heard', 'vlieg'], source: 'birdnet', zzz: ['x'] }), { ...emptyFilters(), method: ['heard'] }, 'cleanFilters');
ok(activeFilterCount({ ...emptyFilters(), method: ['seen'], source: ['merlin', 'self'] }) === 3, 'telling');
ok(FILTER_GROUPS.map(g => g.key).join() === 'method,media,certainty,source', 'groepen');

// 6. Grote lijst: 5000 records, zoeken + filteren binnen 250 ms
const big = Array.from({ length: 5000 }, (_, i) => R('big' + i, {
  speciesId: SPECIES[i % SPECIES.length].id, speciesName: SPECIES[i % SPECIES.length].nameNL,
  date: `2026-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 28).padStart(2, '0')}`,
  observationMethod: ['seen', 'heard', 'both'][i % 3], identificationSource: 'self', certainty: 'certain', locationName: 'Plas ' + (i % 50) }));
const t0 = performance.now();
const hit = filterSightings(big, { query: 'plas 7 juli', filters: { ...emptyFilters(), method: ['seen'] } }, ctx);
const ms = performance.now() - t0;
ok(hit.length > 0 && hit.every(s => s.observationMethod === 'seen' && s.date.slice(5, 7) === '07' && (s.locationName === 'Plas 7' || s.date.endsWith('-07'))), 'grote lijst correct');
ok(ms < 250, `grote lijst snel (${ms.toFixed(0)} ms)`);

console.log(`UX-02 query: ${n} PASS (5000 records in ${ms.toFixed(0)} ms)`);
