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
 * "je huidige omgeving"; zonder locatietoestemming de vaste standaardlocatie, eerlijk benoemd. */
export function weatherPlace({source, lat, lon, places = []}) {
  if (source !== 'gps') return {text: 'Amsterdam (standaardlocatie)', hint: 'geen locatietoestemming'};
  let best = null;
  for (const place of places || []) {
    if (!place?.name || !Number.isFinite(Number(place.lat)) || !Number.isFinite(Number(place.lon))) continue;
    const d = distanceM(lat, lon, Number(place.lat), Number(place.lon));
    if (d <= WEATHER_PLACE_RADIUS_M && (!best || d < best.d)) best = {name: String(place.name), d};
  }
  return best ? {text: `Bij ${best.name}`, hint: 'eigen plek'} : {text: 'Je huidige omgeving', hint: 'GPS'};
}

export function weatherPlaceMarkup(place) {
  return `<div class="weather-place"><span aria-hidden="true">📍</span> <span class="weather-place__name">${escHtml(place.text)}</span>` +
    ` <span class="weather-place__note">— actueel weer${place.hint ? ` · ${escHtml(place.hint)}` : ''}</span></div>`;
}
