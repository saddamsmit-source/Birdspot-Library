/**
 * Birdspot profiel K7 — CSV-export van eigen waarnemingen.
 *
 * Tussenstap tot er API-toegang tot waarneming.nl is (docs/research/waarneming-nl-koppeling.md).
 * Het importformaat van waarneming.nl is niet openbaar gecontroleerd: kolomnamen zijn daarom
 * beschrijvend en volledig, zodat ze bij importeren handmatig te koppelen zijn.
 * UTF-8 met BOM (Excel), komma als scheidingsteken, punt als decimaalteken, RFC 4180-quotes.
 */

export const CSV_COLUMNS = Object.freeze([
  'datum', 'tijd', 'soort', 'wetenschappelijke_naam', 'aantal', 'zekerheid', 'waarnemingswijze',
  'breedtegraad', 'lengtegraad', 'nauwkeurigheid_m', 'plek', 'notities', 'birdspot_id',
]);

const CERTAINTY = { certain: 'zeker', probable: 'waarschijnlijk', possible: 'mogelijk' };
const METHOD = { seen: 'gezien', heard: 'gehoord', both: 'gezien en gehoord' };

function cell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Formule-injectie in spreadsheets voorkomen
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

const coord = v => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(6) : '');

/** Bouwt de CSV-tekst (zonder BOM). Oudste waarneming eerst. */
export function sightingsToCsv(sightings, { speciesById = new Map(), places = [] } = {}) {
  const placeNames = new Map((places || []).map(p => [p.id, p.name]));
  const rows = [...(sightings || [])].filter(Boolean)
    .sort((a, b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`));
  const lines = [CSV_COLUMNS.join(',')];
  for (const s of rows) {
    const sp = speciesById.get(s.speciesId);
    const method = s.identificationSource === 'merlin'
      ? `${METHOD[s.observationMethod] || 'gehoord'} (Merlin${s.merlinVerification === 'checked' ? ', zelf gecontroleerd' : ', suggestie'})`
      : METHOD[s.observationMethod] || '';
    lines.push([
      s.date || '', s.time || '', sp?.nameNL || s.speciesName || '', sp?.nameSci || '',
      Number.isFinite(s.count) ? s.count : 1, CERTAINTY[s.certainty] || '', method,
      coord(s.lat), coord(s.lon), Number.isFinite(s.pinAccuracyM) ? Math.round(s.pinAccuracyM) : '',
      (s.placeId && placeNames.get(s.placeId)) || s.locationName || '', s.notes || '', s.id || '',
    ].map(cell).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}

/** Start de download van het CSV-bestand; geeft bestandsnaam en aantal terug. */
export function downloadCsv(sightings, opts = {}) {
  const text = sightingsToCsv(sightings, opts);
  const filename = `birdspot-waarnemingen-${new Date().toISOString().slice(0, 10)}.csv`;
  const blob = new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return { filename, count: (sightings || []).filter(Boolean).length };
}
