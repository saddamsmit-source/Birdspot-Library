/**
 * Birdspot kaart K6 — seizoenen, beste maanden en bijzondere waarnemingen (pure functies, geen DOM).
 *
 * Seizoenskleuren volgen de vogelgids-conventie (zomer warm, winter koud) en zijn bewust anders dan
 * de pinkleuren gezien (blauw) / gehoord (geel) / beide (oranje).
 */
import { SEASONS, SEASON_ORDER } from '../../data/seasons.js';
import { statusForSighting } from './visualization.js';

export const SEASON_COLORS = Object.freeze({
  winter: '#5BC0EB',
  lente:  '#7AC74F',
  zomer:  '#E8547A',
  herfst: '#B9844A',
});
export { SEASON_ORDER };

const MONTH_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

/** Maand (0–11) van een ISO-datum, of null. */
export function monthOf(date) {
  const m = /^\d{4}-(\d{2})-\d{2}/.exec(String(date || ''));
  const n = m ? Number(m[1]) - 1 : NaN;
  return n >= 0 && n <= 11 ? n : null;
}

export function seasonOf(date) {
  const m = monthOf(date);
  if (m === null) return null;
  return SEASON_ORDER.find(k => SEASONS[k].months.includes(m)) || null;
}

/** Aantal waarnemingen per seizoen. */
export function seasonCounts(records) {
  const out = Object.fromEntries(SEASON_ORDER.map(k => [k, 0]));
  for (const r of records || []) { const s = seasonOf(r.date); if (s) out[s]++; }
  return out;
}

/** Aantal waarnemingen per maand (12 getallen). */
export function monthHistogram(records) {
  const out = new Array(12).fill(0);
  for (const r of records || []) { const m = monthOf(r.date); if (m !== null) out[m]++; }
  return out;
}

/** Beste maanden: maanden met minstens 75% van het maximum (en > 0). */
export function bestMonths(hist) {
  const max = Math.max(0, ...hist);
  if (!max) return [];
  return hist.map((n, i) => (n > 0 && n >= max * 0.75 ? i : -1)).filter(i => i >= 0);
}
export const monthLabel = i => MONTH_SHORT[i];

/** Bijzondere waarneming: zeldzame soort, dwaalgast/schaarse gast of Rode Lijst. */
export function isNotable(sighting, speciesById) {
  const s = speciesById.get(sighting?.speciesId);
  if (!s) return false;
  return ['zeldzaam', 'zeer-zeldzaam'].includes(s.frequency) ||
    ['dwaalgast', 'schaarsegast'].includes(s.category) || !!s.redList;
}

/** Wolkstraal in schermpixels: groeit met het aantal waarnemingen, begrensd.
 *  Pixels i.p.v. meters: zichtbaar op elk zoomniveau; uitgezoomd smelten wolken samen tot gebieden. */
export function cloudRadiusPx(n) {
  return Math.round(Math.min(64, 22 + 12 * Math.sqrt(Math.max(1, n))));
}

/**
 * Filters uit de klikbare legenda en het filterpaneel.
 * legend: 'seen' | 'heard' (incl. Merlin) | 'both' | null
 * seasons: Set van seizoenen (leeg = alle) · notableOnly · period: 'all' | 'year' | '12m'
 */
export function applyLegendFilters(rows, { legend = null, seasons = new Set(), notableOnly = false, period = 'all', now = new Date() } = {}, speciesById = new Map()) {
  const yearStart = `${now.getFullYear()}-01-01`;
  const back = new Date(now); back.setFullYear(back.getFullYear() - 1);
  const since12 = back.toISOString().slice(0, 10);
  return (rows || []).filter(r => {
    if (legend) {
      const st = statusForSighting(r);
      if (legend === 'heard' ? !(st === 'heard' || st === 'merlin') : st !== legend) return false;
    }
    if (seasons.size && !seasons.has(seasonOf(r.date))) return false;
    if (notableOnly && !isNotable(r, speciesById)) return false;
    if (period === 'year' && !(String(r.date || '') >= yearStart)) return false;
    if (period === '12m' && !(String(r.date || '') >= since12)) return false;
    return true;
  });
}
