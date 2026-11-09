/**
 * Birdspot profiel K7 — lijsten en statistieken (pure functies, geen DOM).
 *
 * Telregel (eerlijk label, D9): een waarneming telt mee voor soortenlijst, jaarlijst en nieuwe soorten
 * als ze niet 'mogelijk' is en geen onbevestigde Merlin-suggestie is. Overgeslagen waarnemingen
 * worden apart geteld, zodat de app kan uitleggen waarom een soort (nog) niet op de lijst staat.
 */

/** Telt deze waarneming mee voor de lijsten? */
export function countsForList(s) {
  if (!s || !s.speciesId) return false;
  if (s.certainty === 'possible') return false;
  if (s.identificationSource === 'merlin' && s.merlinVerification !== 'checked') return false;
  return true;
}

const yearOf = date => (/^(\d{4})-\d{2}-\d{2}/.exec(String(date || '')) || [])[1] || null;

/**
 * Soortenlijst: per soort aantal waarnemingen, eerste en laatste datum.
 * Gesorteerd op eerste waarneming, nieuwste eerst (zo staan nieuwe soorten bovenaan).
 */
export function speciesList(sightings, speciesById = new Map()) {
  const by = new Map();
  for (const s of sightings || []) {
    if (!countsForList(s)) continue;
    const row = by.get(s.speciesId) || {
      speciesId: s.speciesId,
      name: speciesById.get(s.speciesId)?.nameNL || s.speciesName || s.speciesId,
      count: 0, first: null, last: null,
    };
    row.count++;
    if (s.date && (!row.first || s.date < row.first)) row.first = s.date;
    if (s.date && (!row.last || s.date > row.last)) row.last = s.date;
    by.set(s.speciesId, row);
  }
  return [...by.values()].sort((a, b) =>
    String(b.first || '').localeCompare(String(a.first || '')) || a.name.localeCompare(b.name, 'nl'));
}

/** Jaarlijsten: per jaar het aantal soorten, nieuwste jaar eerst. */
export function yearLists(sightings) {
  const by = new Map();
  for (const s of sightings || []) {
    if (!countsForList(s)) continue;
    const y = yearOf(s.date);
    if (!y) continue;
    if (!by.has(y)) by.set(y, new Set());
    by.get(y).add(s.speciesId);
  }
  return [...by.entries()].map(([year, set]) => ({ year, species: set.size }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

/** Nieuwe soorten in een jaar: soorten waarvan de allereerste waarneming in dat jaar valt. */
export function newSpeciesInYear(list, year) {
  return list.filter(r => yearOf(r.first) === String(year));
}

/**
 * Topplekken: vaste plekken (placeId) eerst op naam uit de plekkenlijst, anders de vrije plaatsnaam.
 * Telt alle waarnemingen (ook onzekere): het gaat om waar je kijkt, niet om je lijst.
 */
export function topPlaces(sightings, places = [], limit = 5) {
  const names = new Map((places || []).map(p => [p.id, p.name]));
  const by = new Map();
  for (const s of sightings || []) {
    const key = s.placeId && names.has(s.placeId) ? `id:${s.placeId}` : (s.locationName || '').trim() ? `nm:${s.locationName.trim().toLowerCase()}` : null;
    if (!key) continue;
    const row = by.get(key) || {
      placeId: key.startsWith('id:') ? s.placeId : null,
      name: key.startsWith('id:') ? names.get(s.placeId) : s.locationName.trim(),
      sightings: 0, species: new Set(),
    };
    row.sightings++;
    if (s.speciesId) row.species.add(s.speciesId);
    by.set(key, row);
  }
  return [...by.values()]
    .map(r => ({ ...r, species: r.species.size }))
    .sort((a, b) => b.sightings - a.sightings || b.species - a.species || a.name.localeCompare(b.name, 'nl'))
    .slice(0, limit);
}

/** Alles voor het profiel in één keer. */
export function profileLists(sightings, { places = [], speciesById = new Map(), now = new Date() } = {}) {
  const list = speciesList(sightings, speciesById);
  const year = String(now.getFullYear());
  const years = yearLists(sightings);
  return {
    list,
    year,
    yearSpecies: years.find(y => y.year === year)?.species || 0,
    years,
    newThisYear: newSpeciesInYear(list, year),
    top: topPlaces(sightings, places),
    skipped: (sightings || []).filter(s => s?.speciesId && !countsForList(s)).length,
  };
}
