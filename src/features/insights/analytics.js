/**
 * Birdspot Insights — deterministic, offline-first, read-only analytics.
 *
 * No persistent analytics cache: data is recomputed from canonical sightings.
 * No assumptions about a species' rarity, location or missing habitat.
 * Dates must be real YYYY-MM-DD calendar dates; do not interpret UTC offsets.
 */

const MONTHS = Object.freeze([
  'jan','feb','mrt','apr','mei','jun',
  'jul','aug','sep','okt','nov','dec',
]);
const HABITATS = Object.freeze({
  bos:'Bos',water:'Water & moeras',wei:'Weiland',
  stad:'Stedelijk',kust:'Kust',anders:'Overig',
});

export function validDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year,month,day] = value.split('-').map(Number);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = new Date(Date.UTC(year,month-1,day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month-1 ||
      probe.getUTCDate() !== day) return null;
  return value;
}

export function availableYears(records) {
  const years = new Set();
  for (const row of Array.isArray(records) ? records : []) {
    const day = validDay(row?.date);
    if (day) years.add(Number(day.slice(0,4)));
  }
  return [...years].sort((a,b)=>b-a);
}

function speciesKey(row) {
  if (typeof row.speciesId === 'string' && row.speciesId.trim()) return 'id:' + row.speciesId.trim();
  if (typeof row.speciesName === 'string' && row.speciesName.trim())
    return 'name:' + row.speciesName.trim().toLocaleLowerCase('nl');
  return null;
}

function displaySpecies(row) {
  return (typeof row.speciesName === 'string' && row.speciesName.trim()) ?
    row.speciesName.trim() : 'Onbekende vogelsoort';
}

export function calculateInsights(records, requestedYear) {
  const all = Array.isArray(records) ? records.filter(x=>x && typeof x === 'object') : [];
  const years = availableYears(all);
  const selectedYear = Number.isInteger(Number(requestedYear)) && years.includes(Number(requestedYear))
    ? Number(requestedYear) : (years[0] ?? new Date().getFullYear());

  const dated = all.filter(row=>validDay(row.date));
  const filtered = dated.filter(row=>Number(row.date.slice(0,4)) === selectedYear);

  const months = MONTHS.map((name,index)=>({month:index+1,name,count:0,uniqueSpecies:0}));
  const monthlySpecies = Array.from({length:12},()=>new Set());
  const species = new Map();
  const habitats = new Map();
  const locations = new Set();
  const byDay = new Map();
  const uniqueSpecies = new Set();
  let photographed = 0;
  let videoCount = 0;
  let individuals = 0;

  for (const row of filtered) {
    const date = validDay(row.date);
    const month = Number(date.slice(5,7))-1;
    months[month].count++;
    byDay.set(date,(byDay.get(date)||0)+1);

    const key = speciesKey(row);
    if (key) {
      uniqueSpecies.add(key);
      monthlySpecies[month].add(key);
      const prev = species.get(key);
      if (prev) prev.count++;
      else species.set(key,{key,name:displaySpecies(row),count:1});
    }

    const location = typeof row.locationName === 'string' ? row.locationName.trim() : '';
    if (location) locations.add(location.toLocaleLowerCase('nl'));

    const habitat = typeof row.habitat === 'string' ? row.habitat.trim() : '';
    if (habitat) {
      const label = HABITATS[habitat] || habitat.slice(0,30);
      habitats.set(label,(habitats.get(label)||0)+1);
    }
    if (Array.isArray(row.photoIds) && row.photoIds.length) photographed++;
    if (typeof row.count === 'number' && Number.isFinite(row.count) && row.count > 0)
      individuals += Math.floor(row.count);
  }

  let cumulative = 0;
  const running = new Set();
  for (let i=0;i<12;i++) {
    for (const key of monthlySpecies[i]) running.add(key);
    cumulative = running.size;
    months[i].uniqueSpecies = cumulative;
  }
  const habitatData = [...habitats].map(([name,count])=>({name,count}))
    .sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'nl'));
  const topSpecies = [...species.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'nl')).slice(0,5);
  const topMonth = months.reduce((best,x)=>x.count>best.count?x:best,months[0]);
  const mostActiveDay = [...byDay].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]||null;
  const first = filtered.length ? [...filtered].sort((a,b)=>a.date.localeCompare(b.date))[0] : null;
  const latest = filtered.length ? [...filtered].sort((a,b)=>b.date.localeCompare(a.date))[0] : null;
  const previousYearTotal = dated.filter(row=>Number(row.date.slice(0,4)) === selectedYear-1).length;

  return {
    year:selectedYear,years, total:filtered.length, speciesCount:uniqueSpecies.size,
    locationsCount:locations.size, photographed, videoCount, individuals,
    months, topMonth:topMonth.count?topMonth:null,topSpecies,habitats:habitatData,
    habitatTotal:[...habitats.values()].reduce((a,b)=>a+b,0),
    mostActiveDay:mostActiveDay?{date:mostActiveDay[0],count:mostActiveDay[1]}:null,
    first,latest,previousYearTotal,unknownDateCount:all.length-dated.length,
    datedCount:dated.length,
  };
}

export const monthLabels = MONTHS;
export const habitatLabels = HABITATS;
