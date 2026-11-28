/** WEE-01 (24-11-2026) — windrichting en locatie voor de weerkaart. Pure functies, zonder netwerk.
 *
 * Windrichting volgt de meteorologische conventie van Open-Meteo (`wind_direction_10m`, graden):
 * de richting waar de wind VANDAAN komt. 0° = uit het noorden, 90° = uit het oosten.
 * Nederlandse 16-puntskompas: N, NNO, NO, ONO, O, OZO, ZO, ZZO, Z, ZZW, ZW, WZW, W, WNW, NW, NNW.
 */
import { escHtml } from '../../utils/html.js';
import { distanceM } from '../../data/places.js';

const POINTS = ['N', 'NNO', 'NO', 'ONO', 'O', 'OZO', 'ZO', 'ZZO', 'Z', 'ZZW', 'ZW', 'WZW', 'W', 'WNW', 'NW', 'NNW'];
const NAMES = ['noorden', 'noordnoordoosten', 'noordoosten', 'oostnoordoosten', 'oosten', 'oostzuidoosten', 'zuidoosten',
  'zuidzuidoosten', 'zuiden', 'zuidzuidwesten', 'zuidwesten', 'westzuidwesten', 'westen', 'westnoordwesten', 'noordwesten', 'noordnoordwesten'];
const num = value => (value === null || value === undefined || value === '' ? NaN : Number(value));

/** Kompaspunt voor een windrichting in graden, of null als de API geen bruikbare waarde gaf. */
export function compassPoint(degrees) {
  const value = num(degrees);
  if (!Number.isFinite(value)) return null;
  // Eerst afronden op hele graden, zodat getoonde graden en kompaspunt altijd bij elkaar passen.
  const deg = Math.round(((value % 360) + 360) % 360) % 360;
  const index = Math.round(deg / 22.5) % 16;
  return {abbr: POINTS[index], name: NAMES[index], deg};
}

/** Windregel: snelheid en (alleen als die bestaat) de richting waar de wind vandaan komt. */
export function windMarkup(speed, direction) {
  const ms = num(speed);
  const point = compassPoint(direction);
  if (!Number.isFinite(ms) && !point) return '<span class="weather-wind">💨 Wind onbekend</span>';
  const speedText = Number.isFinite(ms) ? `${ms} m/s` : 'snelheid onbekend';
  if (!point) return `<span class="weather-wind" aria-label="Wind ${escHtml(speedText)}, richting onbekend">💨 ${escHtml(speedText)}</span>`;
  // Pijl wijst waar de wind naartoe waait (uit noordoost → naar zuidwest); de tekst blijft leidend.
  return `<span class="weather-wind" title="Windrichting: de wind komt uit het ${point.name}" ` +
    `aria-label="Wind ${escHtml(speedText)} uit het ${point.name}, ${point.deg} graden">` +
    `💨 ${escHtml(speedText)} · wind uit ${point.abbr} (${point.deg}°)` +
    `<span class="weather-wind-arrow" aria-hidden="true" style="transform:rotate(${(point.deg + 180) % 360}deg)">↑</span></span>`;
}

export const WEATHER_PLACE_RADIUS_M = 3000;

/** Privacyveilige plaatsaanduiding: nooit coördinaten. Eigen opgeslagen plek binnen 3 km, anders
 * "je huidige omgeving". GPS-01 (26-11-2026): nooit een standaardstad. Zonder actuele GPS benoemt de
 * aanduiding eerlijk wat er wordt gebruikt (laatst bekende positie met tijd, of een zelf gekozen plek);
 * zonder bruikbare positie geeft de functie null en toont de app geen weer voor een verzonnen plek.
 * `source` blijft als alias voor oudere aanroepen ('gps' = actueel; al het andere = geen positie). */
export function weatherPlace({state, source, lat, lon, at = null, places = [], temporary = false}) {
  const kind = state || (source === 'gps' ? 'gps' : 'none');
  if (!['gps', 'last', 'manual'].includes(kind) || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lon))) return null;
  let best = null;
  for (const place of places || []) {
    if (!place?.name || !Number.isFinite(Number(place.lat)) || !Number.isFinite(Number(place.lon))) continue;
    const d = distanceM(Number(lat), Number(lon), Number(place.lat), Number(place.lon));
    if (d <= WEATHER_PLACE_RADIUS_M && (!best || d < best.d)) best = {name: String(place.name), d};
  }
  if (kind === 'gps') return best ? {text: `Bij ${best.name}`, hint: 'eigen plek', kind} : {text: 'Je huidige omgeving', hint: 'GPS', kind};
  if (kind === 'manual') {
    const hint = temporary ? 'zelf gekozen · alleen deze sessie' : 'zelf gekozen, geen GPS';
    return {text: best ? `Bij ${best.name}` : 'Zelf gekozen plek', hint, kind};
  }
  const when = Number.isFinite(Number(at)) ? new Date(Number(at)).toLocaleTimeString('nl-NL', {hour: '2-digit', minute: '2-digit'}) : null;
  return {text: best ? `Bij ${best.name}` : 'Laatst bekende locatie', hint: `niet actueel${when ? ` · GPS van ${when}` : ''}`, kind};
}

/** Melding zonder bruikbare positie (GPS-01): eerlijke reden, geen standaardstad. */
export function noLocationText(reason) {
  if (reason === 'denied') return 'Aviandra heeft geen toegang tot je locatie. Sta locatie toe in je browser of kies zelf een plek.';
  if (reason === 'permission') return 'Gebruik het locatie-icoon op Kaart om locatie toe te staan, of kies zelf een plek.';
  if (reason === 'unsupported') return 'Deze browser geeft geen locatie door. Kies zelf een plek.';
  return 'Je locatie is nu niet te bepalen (geen GPS-signaal). Gebruik het locatie-icoon op Kaart of kies zelf een plek.';
}

export function weatherPlaceMarkup(place) {
  return `<div class="weather-place" data-location-kind="${escHtml(place.kind || 'gps')}"><span aria-hidden="true">📍</span> <span class="weather-place__name">${escHtml(place.text)}</span>` +
    ` <span class="weather-place__note">— ${place.kind && place.kind !== 'gps' ? 'weer voor deze plek' : 'actueel weer'}${place.hint ? ` · ${escHtml(place.hint)}` : ''}</span></div>`;
}
