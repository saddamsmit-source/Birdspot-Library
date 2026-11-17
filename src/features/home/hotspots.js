/**
 * Private Home hotspot overview. Only user-owned sightings are grouped.
 * A stable placeId determines whether observations belong to one pin.
 * Never merge two explicit placeIds based on rounded coordinates.
 */
export function groupHotspots(sightings = []) {
  const groups = new Map();
  for (const s of sightings) {
    if (!s || typeof s.lat !== 'number' || typeof s.lon !== 'number' ||
        !Number.isFinite(s.lat) || !Number.isFinite(s.lon) ||
        Math.abs(s.lat) > 90 || Math.abs(s.lon) > 180) continue;
    const placeId = typeof s.placeId === 'string' ? s.placeId.trim() : '';
    const key = placeId ? 'place:' + placeId : 'gps:' + s.lat.toFixed(6) + ',' + s.lon.toFixed(6);
    if (!groups.has(key)) {
      groups.set(key, {
        key, placeId: placeId || null, lat: s.lat, lon: s.lon,
        name: '', count: 0, species: new Set(), sightingId: s.id || null,
      });
    }
    const group = groups.get(key);
    group.count += 1;
    if (typeof s.speciesName === 'string' && s.speciesName.trim()) group.species.add(s.speciesName.trim());
    const name = typeof s.locationName === 'string' ? s.locationName.trim() : '';
    if (name && !group.name) group.name = name;
    if (!group.sightingId && s.id) group.sightingId = s.id;
  }
  return [...groups.values()].map(p => ({
    ...p, name: p.name || 'Locatie zonder naam', speciesNames: [...p.species].sort((a,b)=>a.localeCompare(b,'nl')),
  })).sort((a,b) => b.count - a.count || a.name.localeCompare(b.name,'nl'));
}
