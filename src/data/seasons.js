/**
 * Birdspot Library — seizoenen en aanwezigheidsmaanden (pure logica, geen DOM).
 *
 * Soorten hebben `months`, bijvoorbeeld 'jan-dec', 'mrt-sep', 'okt-mrt' (over de
 * jaarwisseling), 'apr-mei,aug-sep' of '-' (onregelmatig, bijv. dwaalgasten).
 *
 * Seizoenen: winter = dec–feb, lente = mrt–mei, zomer = jun–aug, herfst = sep–nov.
 * Eén seizoen gekozen  → soorten die in minstens één maand van dat seizoen aanwezig zijn.
 * Twee aangrenzende    → de overgangsperiode: de laatste maand van het eerste en de eerste
 *                        maand van het volgende seizoen (winter + lente = februari en maart).
 */

export const MONTH_KEYS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
export const MONTH_NAMES = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli',
  'augustus', 'september', 'oktober', 'november', 'december'];

export const SEASONS = {
  winter: { label: 'Winter', months: [11, 0, 1] },
  lente:  { label: 'Lente',  months: [2, 3, 4] },
  zomer:  { label: 'Zomer',  months: [5, 6, 7] },
  herfst: { label: 'Herfst', months: [8, 9, 10] },
};
export const SEASON_ORDER = ['winter', 'lente', 'zomer', 'herfst'];

/** Zijn twee seizoenen buren in de jaarcyclus (ook herfst + winter)? */
export function areAdjacent(a, b) {
  const i = SEASON_ORDER.indexOf(a), j = SEASON_ORDER.indexOf(b);
  return i >= 0 && j >= 0 && (Math.abs(i - j) === 1 || Math.abs(i - j) === 3);
}

/** Nieuwe selectie na een tik: max. twee aangrenzende seizoenen. */
export function toggleSeason(selected, key) {
  if (selected.includes(key)) return selected.filter(k => k !== key);
  if (selected.length === 1 && areAdjacent(selected[0], key)) {
    return SEASON_ORDER.filter(k => k === key || k === selected[0]);
  }
  return [key];
}

/** Maandindexen (0–11) van een months-string; leeg bij onregelmatig of onbekend. */
export function monthSet(months) {
  const out = new Set();
  if (!months || months === '-') return out;
  for (const part of String(months).split(',')) {
    const [a, b = a] = part.trim().split('-');
    const i = MONTH_KEYS.indexOf(a), j = MONTH_KEYS.indexOf(b);
    if (i < 0 || j < 0) continue;
    for (let m = i; ; m = (m + 1) % 12) { out.add(m); if (m === j) break; }
  }
  return out;
}

/** Periode voor de selectie: { key, label, months[] } of null bij geen selectie. */
export function seasonPeriod(selected) {
  if (!selected || selected.length === 0) return null;
  if (selected.length === 1) {
    const s = SEASONS[selected[0]];
    return { key: selected[0], label: s.label, months: s.months };
  }
  // Volgorde in de jaarcyclus: herfst → winter loopt over de jaarwisseling.
  let [first, second] = selected;
  const i = SEASON_ORDER.indexOf(first), j = SEASON_ORDER.indexOf(second);
  if ((j - i + 4) % 4 !== 1) [first, second] = [second, first];
  const a = SEASONS[first].months, b = SEASONS[second].months;
  return {
    key: `${first}-${second}`,
    label: `${SEASONS[first].label}–${SEASONS[second].label.toLowerCase()}`,
    months: [a[a.length - 1], b[0]],
  };
}

/** Is de soort in (minstens één maand van) de periode aanwezig? */
export function presentIn(species, period) {
  if (!period) return true;
  const set = monthSet(species.months);
  return period.months.some(m => set.has(m));
}

/** Leesbare maanden van een periode, bijv. 'februari en maart'. */
export function periodMonthsText(period) {
  const names = period.months.map(m => MONTH_NAMES[m]);
  return names.length > 1 ? names.slice(0, -1).join(', ') + ' en ' + names[names.length - 1] : names[0];
}
