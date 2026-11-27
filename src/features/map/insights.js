/**
 * Birdspot kaart K6 — seizoenen, beste maanden en bijzondere waarnemingen (pure functies, geen DOM).
 *
 * Seizoenskleuren volgen de vogelgids-conventie (zomer warm, winter koud) en zijn bewust anders dan
 * de pinkleuren gezien (blauw) / gehoord (geel) / beide (oranje).
 */
import { SEASON_ORDER, monthOf, seasonOf, sightingDateRange, dateInRange } from '../../data/seasons.js';
import { statusForSighting } from './visualization.js';

export const SEASON_COLORS = Object.freeze({
  winter: '#5BC0EB',
  lente:  '#7AC74F',
  zomer:  '#E8547A',
  herfst: '#B9844A',
});
export { SEASON_ORDER, monthOf, seasonOf };

const MONTH_SHORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

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
 * seasons: Set van seizoenen (leeg = alle) · notableOnly · period: 'all' | 'year' | '6m'
 */
export function applyLegendFilters(rows, { legend = null, seasons = new Set(), notableOnly = false, period = 'all', now = new Date() } = {}, speciesById = new Map()) {
  const range = sightingDateRange(period, now);
  return (rows || []).filter(r => {
    if (legend) {
      const st = statusForSighting(r);
      if (legend === 'heard' ? !(st === 'heard' || st === 'merlin') : st !== legend) return false;
    }
    if (seasons.size && !seasons.has(seasonOf(r.date))) return false;
    if (notableOnly && !isNotable(r, speciesById)) return false;
    return dateInRange(r.date, range);
  });
}
