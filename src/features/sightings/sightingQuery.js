/**
 * UX-02A (25-11-2026) — één zoek- en filterlogica voor eigen waarnemingen.
 *
 * Gedeeld door de globale zoekfunctie (search/index.js) en de lijst Mijn waarnemingen, zodat beide
 * dezelfde normalisatie en dezelfde zoektermen per waarneming gebruiken.
 * Pure functies (geen DOM, geen opslag): direct te testen in node.
 */
import { verificationStatus, validPin } from './evidence.js';
import { dateInRange, seasonOf, sightingDateRange } from '../../data/seasons.js';

export const normalizeSearch = value => String(value ?? '').toLocaleLowerCase('nl').normalize('NFD')
  .replace(/\p{M}/gu, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
const MONTHS_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** Datumvormen waarop iemand zoekt: 2026-11-20, 20-11-2026, 20 november 2026, nov 2026. */
export function dateTerms(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return [];
  const [, y, mo, d] = m;
  const month = Number(mo) - 1;
  if (month < 0 || month > 11) return [iso];
  const day = String(Number(d));
  return [iso, `${d}-${mo}-${y}`, `${day} ${MONTHS[month]} ${y}`, `${MONTHS_SHORT[month]} ${y}`];
}

/** Zoektermen van één waarneming. `placeName` = naam van de gekoppelde plek, als die er is. */
export function sightingTerms(sighting, { species = null, placeName = '' } = {}) {
  const s = sighting || {};
  const name = s.speciesName || species?.nameNL || '';
  return [name, species?.nameSci, species?.nameEN, placeName, s.locationName, ...dateTerms(s.date), s.notes,
    s.habitat, s.behavior, s.weather, s.observationMethod, s.identificationSource];
}

/** Waar staat de waarneming? Onderscheidt benoemde, automatische en alleen-GPS-plekken (UX-02C). */
export function placeOf(sighting, placesById = new Map()) {
  const place = sighting?.placeId ? placesById.get(sighting.placeId) : null;
  if (place) {
    return { kind: placeNameKind(place) === 'auto' ? 'auto' : 'named', name: place.name, place };
  }
  const text = String(sighting?.locationName || '').trim();
  const pin = validPin(sighting?.lat, sighting?.lon);
  if (text) return { kind: pin ? 'text-pin' : 'text', name: text, place: null };
  if (pin) return { kind: 'gps', name: `${Number(sighting.lat).toFixed(4)}, ${Number(sighting.lon).toFixed(4)}`, place: null };
  return { kind: 'none', name: '', place: null };
}

/** Sleutel en label voor de lijst, ook bruikbaar voor oude waarnemingen zonder gekoppelde plek. */
export function sightingPlaceChoice(sighting, placesById) {
  const { kind, name, place } = placeOf(sighting, placesById);
  if (place) return [`place:${place.id}`, name];
  if (kind === 'gps') return ['gps', 'Alleen GPS'];
  if (kind === 'none') return ['none', 'Zonder plek'];
  return [`text:${name.toLocaleLowerCase('nl')}`, name];
}

export function sightingSpeciesKey(sighting) {
  return sighting.speciesId || (sighting.speciesName ? `name:${normalizeSearch(sighting.speciesName)}` : '');
}

/**
 * Naam van een plek: 'user' (zelf benoemd) of 'auto' (door de app gemaakt, zoals "Plek 3").
 * Nieuwe plekken dragen nameOrigin; bij oudere plekken alleen afgeleid uit de naam, nooit opgeslagen.
 */
export function placeNameKind(place) {
  if (place?.nameOrigin === 'auto' || place?.nameOrigin === 'user') return place.nameOrigin;
  return /^(plek \d+|naamloze plek)$/i.test(String(place?.name || '').trim()) ? 'auto' : 'user';
}

/**
 * Herkenning voor het filter, uit dezelfde statusbron als lijst en detail (UX-03B):
 * self · birdnet · merlin · unknown (controle onbekend: oude BirdNET-suggestie) · unrecorded (bron niet vastgelegd).
 */
export function sourceCategory(sighting) {
  const key = verificationStatus(sighting).key;
  if (key.startsWith('birdnet')) return 'birdnet';
  if (key.startsWith('merlin')) return 'merlin';
  return { self: 'self', 'check-unknown': 'unknown', unrecorded: 'unrecorded' }[key];
}

/** Zekerheid voor het filter. Een niet zelf gecontroleerde suggestie telt nooit als 'zeker'. */
export function certaintyCategory(sighting) {
  const c = sighting?.certainty;
  // Een suggestie zonder eigen controle (ook 'controle onbekend') is nooit 'zeker', wat er ook is opgeslagen.
  if (c === 'certain' && verificationStatus(sighting).tone === 'warn') return 'unchecked';
  return ['certain', 'probable', 'possible'].includes(c) ? c : 'unknown';
}

export const FILTER_GROUPS = Object.freeze([
  { key: 'method', label: 'Waarneming', options: [['seen', 'Gezien'], ['heard', 'Gehoord'], ['both', 'Gezien en gehoord']] },
  { key: 'media', label: 'Media', options: [['photo', 'Met foto of video'], ['audio', 'Met geluid']] },
  { key: 'certainty', label: 'Zekerheid', options: [['certain', 'Zeker'], ['probable', 'Waarschijnlijk'], ['possible', 'Mogelijk']] },
  { key: 'source', label: 'Herkenning', options: [['self', 'Eigen herkenning'], ['birdnet', 'BirdNET'], ['merlin', 'Merlin'],
    ['unknown', 'Controle onbekend'], ['unrecorded', 'Bron niet vastgelegd']] },
]);

const FILTER_TEST = {
  method: (s, v) => s?.observationMethod === v,
  media: (s, v) => v === 'photo' ? Array.isArray(s?.photoIds) && s.photoIds.length > 0
    : Array.isArray(s?.audioIds) && s.audioIds.length > 0,
  certainty: (s, v) => certaintyCategory(s) === v,
  source: (s, v) => sourceCategory(s) === v,
};

export function emptyFilters() {
  return { method: [], media: [], certainty: [], source: [] };
}

/** Alleen bekende groepen en waarden; alles daarbuiten (bijv. oude sessiestand) valt weg. */
export function cleanFilters(input) {
  const out = emptyFilters();
  for (const group of FILTER_GROUPS) {
    const allowed = new Set(group.options.map(([value]) => value));
    const values = Array.isArray(input?.[group.key]) ? input[group.key] : [];
    out[group.key] = [...new Set(values.filter(value => allowed.has(value)))];
  }
  return out;
}

export function activeFilterCount(filters) {
  return FILTER_GROUPS.reduce((n, group) => n + (filters?.[group.key]?.length || 0), 0);
}

/**
 * Woord in de zoektekst. Tekst: deel van een woord ('mer' → Merel). Getallen: vanaf het begin van een
 * getal, en één of twee cijfers alleen als heel getal ('2' vindt "Plek 2", niet elke datum met een 2).
 */
function wordMatches(hay, word) {
  if (!/^\d+$/.test(word)) return hay.includes(word);
  return word.length <= 2 ? hay.includes(` ${word} `) : hay.includes(` ${word}`);
}

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * Herkenbare periodewoorden in de zoekopdracht → datumbereik. De rest blijft tekstzoekopdracht.
 * @returns {{ range: [string, string] | null, rest: string, label: string }}
 */
export function periodFromQuery(query, today = new Date()) {
  let rest = normalizeSearch(query);
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const day = offset => { const d = new Date(t); d.setDate(d.getDate() + offset); return d; };
  const monday = day(-((t.getDay() + 6) % 7));
  const rules = [
    ['vandaag', () => [iso(t), iso(t)]],
    ['gisteren', () => [iso(day(-1)), iso(day(-1))]],
    ['deze week', () => [iso(monday), iso(t)]],
    ['vorige week', () => { const s = new Date(monday); s.setDate(s.getDate() - 7); const e = new Date(monday); e.setDate(e.getDate() - 1); return [iso(s), iso(e)]; }],
    ['deze maand', () => [iso(new Date(t.getFullYear(), t.getMonth(), 1)), iso(t)]],
    ['vorige maand', () => [iso(new Date(t.getFullYear(), t.getMonth() - 1, 1)), iso(new Date(t.getFullYear(), t.getMonth(), 0))]],
    ['dit jaar', () => [`${t.getFullYear()}-01-01`, iso(t)]],
    ['vorig jaar', () => [`${t.getFullYear() - 1}-01-01`, `${t.getFullYear() - 1}-12-31`]],
  ];
  for (const [phrase, make] of rules) {
    const re = new RegExp(`(^| )${phrase}( |$)`);
    if (re.test(rest)) {
      rest = rest.replace(re, ' ').replace(/\s+/g, ' ').trim();
      return { range: make(), rest, label: phrase };
    }
  }
  return { range: null, rest, label: '' };
}

/**
 * Filter + zoek. Woorden in de zoekopdracht moeten allemaal voorkomen (EN), filters binnen een groep
 * zijn OF, tussen groepen EN.
 * @param {object[]} sightings
 * @param {{ query?: string, filters?: object, speciesId?: string|null, place?: string, period?: string, season?: string }} state
 * @param {{ speciesById?: Map, placesById?: Map, today?: Date }} ctx
 */
export function filterSightings(sightings, state = {}, ctx = {}) {
  const { speciesById = new Map(), placesById = new Map(), today = new Date() } = ctx;
  const filters = cleanFilters(state.filters);
  const period = periodFromQuery(state.query || '', today);
  const selectedRange = sightingDateRange(state.period, today);
  const words = period.rest ? period.rest.split(' ') : [];
  const groups = FILTER_GROUPS.filter(group => filters[group.key].length);
  return (sightings || []).filter(s => {
    if (!s || typeof s !== 'object' || typeof s.id !== 'string') return false;
    if (state.speciesId && sightingSpeciesKey(s) !== state.speciesId) return false;
    if (state.place && sightingPlaceChoice(s, placesById)[0] !== state.place) return false;
    if (state.season && seasonOf(s.date) !== state.season) return false;
    if (!dateInRange(s.date, selectedRange)) return false;
    for (const group of groups) {
      if (!filters[group.key].some(value => FILTER_TEST[group.key](s, value))) return false;
    }
    if (period.range && !(s.date >= period.range[0] && s.date <= period.range[1])) return false;
    if (!words.length) return true;
    const species = speciesById.get(s.speciesId) || null;
    const placeName = s.placeId ? placesById.get(s.placeId)?.name || '' : '';
    const hay = ' ' + normalizeSearch(sightingTerms(s, { species, placeName }).filter(Boolean).join(' ')) + ' ';
    return words.every(word => wordMatches(hay, word));
  });
}
