/**
 * Home / Dashboard — view
 * UI conform mockup: app-header (logo + zoekbalk + avatar),
 * diashow, 4 stat tiles, zon, weer, recente waarnemingen met
 * foto-thumbnail + certainty badge.
 *
 * Externe deps (CDN, geladen via index.html):
 *   - SunCalc  → window.SunCalc
 *   - Open-Meteo REST API (geen key)
 */

import { appIcon } from '../../utils/icons.js';
import { getDB }                          from '../../data/db.js';
import { getSightings }                   from '../../data/sightings.js';
import { groupHotspots } from './hotspots.js';
import { ensureLeaflet } from '../map/view.js';
import { LAYERS } from '../map/centerPin.js';
import { escHtml } from '../../utils/html.js';
import { getPhotoUrl, revokePhotoUrl }    from '../../utils/photoUrl.js';
import { initFeaturedCarousel } from './featuredCarousel.js';
import { bindAppSearch, searchMarkup } from '../search/index.js';
import { buildAmbientBackdrop,initAmbientBackdrop } from './ambientBackdrop.js';

// ── Constanten ─────────────────────────────────────────────
const FALLBACK_LAT = 52.3676;
const FALLBACK_LON = 4.9041;

// ── Hoofd-render ───────────────────────────────────────────
/**
 * renderHome retourneert een cleanup-functie.
 * app.js roept cleanup() aan vóór elke routewissel zodat:
 *   1. Alle openstaande blob-URL's worden vrijgegeven.
 *   2. Async-callbacks die nog lopen een stale-flag checken en stil stoppen.
 */
export function renderHome(el, { onSearchSelect } = {}) {
  // Gedeelde destroyed-vlag: alle async functies checken deze vóór DOM-mutaties.
  const ctx = { destroyed: false };

  el.innerHTML = buildSkeleton();
  // New signature shortcuts use existing router; no parallel navigation state.
  const onSignatureClick = e => {
    const button = e.target.closest('[data-signature-route], [data-home-sighting], [data-home-hotspot-sighting], [data-featured-species]');
    if (!button) return;
    if (button.hasAttribute('data-featured-species')) {
      onSearchSelect?.({ route: 'species', speciesId: button.dataset.featuredSpecies || undefined });
      return;
    }
    const hotspotId = button.dataset.homeHotspotSighting;
    if (hotspotId) {
      onSearchSelect?.({ route: 'map', sightingId: hotspotId });
      return;
    }
    const sightingId = button.dataset.homeSighting;
    if (sightingId) {
      onSearchSelect?.({ route: 'sightings', sightingId });
      return;
    }
    onSearchSelect?.({ route: button.dataset.signatureRoute });
  };
  el.addEventListener('click', onSignatureClick);
  const disposeSearch = bindAppSearch(el, onSearchSelect);
  const disposeFeatured = initFeaturedCarousel(el,ctx);
  const disposeHabitat = initAmbientBackdrop(el,ctx);
  loadStats(el, ctx);
  loadSunInfo(el, ctx);
  loadWeather(el, ctx);
  loadRecentSightings(el, ctx);
  loadMonthlyChart(el, ctx);
  loadHotspotsMap(el, ctx, onSearchSelect);

  return function cleanup() {
    ctx.destroyed = true;
    el.removeEventListener('click', onSignatureClick);
    disposeSearch();
    disposeFeatured();
    disposeHabitat();
    ctx.hotspotObserver?.disconnect();
    clearTimeout(ctx.hotspotTimer);
    clearTimeout(ctx.hotspotResize);
    ctx.hotspotMap?.remove();
    ctx.hotspotMap = null;
    // Geef alle openstaande blob-URL's vrij (recent-thumbnails)
    _revokeRecentThumbUrls();
  };
}

// ── Skeleton ───────────────────────────────────────────────
function buildSkeleton() {
  return `
    <!-- App-header: logo + zoekbalk + avatar -->
    <header class="app-header">
      <div class="app-header__logo">
        <svg class="app-header__logo-icon" viewBox="0 0 44 44" fill="none" aria-hidden="true">
          <circle cx="22" cy="22" r="22" fill="rgba(255,255,255,.15)"/>
          <path d="M8 32 Q14 20 22 22 Q28 18 38 14 Q34 25 26 27 Q20 29 17 36Z"
                fill="#52B788" opacity=".95"/>
          <path d="M22 22 Q26 24 30 20 Q28 26 22 28Z"
                fill="rgba(255,255,255,.6)"/>
        </svg>
        <span class="app-header__title">Birdspot Library</span>
      </div>

      <button type="button" class="app-header__avatar" aria-label="Profiel" data-signature-route="profile">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
      ${searchMarkup()}
    </header>

    <!-- Diashow: elke 30 s een bijzondere Nederlandse vogel; hervat waar hij was. -->
    <section class="slideshow featured-birds" id="slideshow" aria-label="Bijzondere vogel in beeld">
      <div class="featured-birds__media">
        <div class="featured-birds__fallback" id="featuredBirdFallback" aria-hidden="true"><span>✦</span></div>
        <img id="featuredBirdImage" class="featured-birds__photo" alt="" decoding="async">
      </div>
      <button type="button" id="featuredBirdZoom" aria-label="Vergroot foto"></button>
      <span class="field-photo-label">Gidsfoto</span>
      <button type="button" id="featuredBirdMotion" aria-label="Diashow pauzeren" aria-pressed="false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path class="featured-motion-pause" d="M6 4h4v16H6z M14 4h4v16h-4z"/>
          <path class="featured-motion-play" d="M8 4v16l12-8z"/>
        </svg>
      </button>
      <div id="featuredBirdCredit" class="featured-photo-info"></div>
      <div class="featured-birds__caption">
        <div class="featured-birds__identification">
          <p class="field-eyebrow">Vandaag in beeld</p>
          <span class="featured-birds__group" id="featuredBirdGroup"></span>
          <h2 id="featuredBirdName"></h2>
          <em id="featuredBirdLatin"></em>
        </div>
        <div class="field-featured-actions">
          <button type="button" class="field-action" data-featured-species><span data-featured-label>Bekijk soortkaart</span> <span aria-hidden="true">›</span></button>
          <details class="field-featured-notes">
            <summary>Veldkenmerken</summary>
            <div class="field-featured-notes__body">
              <div class="field-featured-fact">
                ${appIcon('eye', 'ui-icon field-featured-fact__icon')}
                <div><p id="featuredBirdWhere"></p></div>
              </div>
              <div class="field-featured-fact" hidden>
                ${appIcon('male', 'ui-icon field-featured-fact__icon')}
                <div><strong>Man en vrouw</strong><p id="featuredBirdSexes"></p></div>
              </div>
              <div class="field-featured-fact" hidden>
                ${appIcon('reed', 'ui-icon field-featured-fact__icon')}
                <div><strong>Waar zoeken?</strong><p id="featuredBirdHabitat"></p></div>
              </div>
              <div class="field-featured-fact" hidden>
                ${appIcon('map', 'ui-icon field-featured-fact__icon')}
                <div><strong>Waar in Nederland?</strong><p id="featuredBirdDistribution"></p></div>
              </div>
              <div class="field-featured-fact">
                ${appIcon('calendar', 'ui-icon field-featured-fact__icon')}
                <div><p id="featuredBirdPresence"></p></div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>

    <!-- Stat tiles — 4 kolommen -->
    <div class="stats-row" id="statsRow">
      ${statTile('stat-species', '—', 'Soorten',     appIcon('bird'))}
      ${statTile('stat-total',   '—', 'Waarnemingen', appIcon('observations'))}
      ${statTile('stat-photos',  '—', "Media",        appIcon('media'))}
      ${statTile('stat-hotspot', '—', 'Hotspots',    appIcon('pin'))}
    </div>

    <!-- Recente waarnemingen -->
    <section class="dash-section" id="recentSection">
      <div class="section-head">
        <span class="section-head__title">Mijn waarnemingen</span>
        <button class="section-head__link" id="allSightingsBtn" aria-label="Alle waarnemingen" data-signature-route="sightings">
          Alles
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      <div id="recentList" class="recent-list">
        <div class="dash-section__loading" style="padding:var(--space-16);background:var(--surface)">
          <span class="spinner" aria-hidden="true"></span>
        </div>
      </div>
    </section>

    <!-- Accessible secondary features: stays collapsed beneath recent sightings. -->
    <details class="signature-home-intro signature-quick-access" id="homeMoreFeatures">
      <summary class="signature-quick-access__summary">
        <span class="signature-quick-access__icon" aria-hidden="true">✦</span>
        <span>Meer ontdekken</span>
        <span class="signature-quick-access__chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="signature-home-links signature-quick-access__links">
        <button data-signature-route="journal" class="signature-home-link" type="button">${appIcon('book')} Birding Journal <span aria-hidden="true">↗</span></button>
        <button data-signature-route="insights" class="signature-home-link" type="button">${appIcon('freq')} Mijn Inzichten <span aria-hidden="true">↗</span></button>
        <button data-signature-route="film" class="signature-home-link signature-home-link--film" type="button">${appIcon('film')} Wildlife Film Studio <span aria-hidden="true">↗</span></button>
        <button data-signature-route="map" class="signature-home-link" type="button">${appIcon('map')} Explorer Map <span aria-hidden="true">↗</span></button>
      </div>
    </details>

    <!-- 9:16 cinematic marsh, full lower dashboard background -->
    <section class="ambient-wetland" id="ambientWetland" aria-label="Rustige bewegende natuurachtergrond">
      ${buildAmbientBackdrop()}
      <div class="ambient-wetland__content">
        <!-- Zon & golden hour -->
        <section class="dash-section" id="sunSection">
      <div class="section-head">
        <span class="section-head__title">Gouden uur</span>
      </div>
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span> Zonsinformatie laden…
      </div>
    </section>

    <!-- Weer -->
    <section class="dash-section" id="weatherSection">
      <div class="section-head">
        <span class="section-head__title">Weercondities</span>
      </div>
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span> Weer laden…
      </div>
    </section>

    <!-- Maandgrafiek -->
    <section class="dash-section" id="monthlySection">
      <div class="section-head">
        <span class="section-head__title">Waarnemingen per maand</span>
      </div>
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span>
      </div>
    </section>

    <!-- Hotspots minimap -->
    <section class="dash-section" id="hotspotsSection" style="padding-bottom:var(--space-16)">
      <div class="section-head">
        <span class="section-head__title">Mijn hotspots</span>
      </div>
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span>
      </div>
    </section>
      </div>
      <button class="ambient-wetland__motion-toggle" id="ambientWetlandToggle"
        type="button" aria-pressed="false"
        aria-label="Pauzeer bewegende natuurachtergrond">Ⅱ</button>
    </section>
  `;
}


// ── Recente waarnemingen thumbnail-URLs ─────────────────────
// Bijhouden zodat cleanup() ze kan vrijgeven ook als load/error
// event al gevuurd was vóór de listener werd gekoppeld.
let _recentThumbUrls = [];

function _revokeRecentThumbUrls() {
  _recentThumbUrls.forEach(revokePhotoUrl);
  _recentThumbUrls = [];
}

// ══════════════════════════════════════════════════════════
// STATISTIEKEN
// ══════════════════════════════════════════════════════════
async function loadStats(el, ctx) {
  try {
    const sightings  = (await getSightings()).filter(Boolean);
    if (ctx.destroyed) return;
    const speciesSet = new Set(sightings.map(s => s.speciesId));
    const photoCount = sightings.reduce((n, s) => n + (s.photoIds?.length || 0), 0);
    const locSet     = new Set(sightings.map(s => s.locationName).filter(Boolean));

    setStatVal(el, 'stat-species', speciesSet.size);
    setStatVal(el, 'stat-total',   sightings.length);
    setStatVal(el, 'stat-photos',  photoCount);
    setStatVal(el, 'stat-hotspot', locSet.size);
  } catch (_) {
    if (ctx.destroyed) return;
    ['stat-species','stat-total','stat-photos','stat-hotspot']
      .forEach(id => setStatVal(el, id, '—'));
  }
}

function setStatVal(el, id, val) {
  const node = el.querySelector(`#${id} .stat-tile__value`);
  if (node) node.textContent = val;
}

// ══════════════════════════════════════════════════════════
// ZON / GOLDEN HOUR  (SunCalc.js)
// ══════════════════════════════════════════════════════════
function getSunCalc() {
  if (window.SunCalc) return Promise.resolve(window.SunCalc);
  const script = document.getElementById('sunCalcScript');
  if (!script) return Promise.resolve(null);
  return new Promise(resolve => {
    const finish = () => {
      clearTimeout(timer);
      script.removeEventListener('load', finish);
      script.removeEventListener('error', finish);
      resolve(window.SunCalc);
    };
    const timer = setTimeout(finish, 3500);
    script.addEventListener('load', finish);
    script.addEventListener('error', finish);
  });
}

async function loadSunInfo(el, ctx) {
  const section = el.querySelector('#sunSection');
  if (!section) return;

  const [{ lat, lon }, SC] = await Promise.all([getLocation(), getSunCalc()]);
  if (ctx.destroyed) return;
  const now = new Date();

  if (!SC) {
    section.querySelector('.dash-section__loading').outerHTML =
      `<div class="dash-section__error">Zonsinformatie niet beschikbaar</div>`;
    return;
  }

  const times      = SC.getTimes(now, lat, lon);
  const sunrise    = times.sunrise;
  const sunset     = times.sunset;
  const ghMornEnd  = times.goldenHourEnd;
  const ghEveStart = times.goldenHour;

  const isGoldenNow = (now >= sunrise   && now <= ghMornEnd) ||
                      (now >= ghEveStart && now <= sunset);

  const loader = section.querySelector('.dash-section__loading');
  if (loader) {
    loader.outerHTML = `
      <div class="sun-card">
        <div class="sun-row">
          <div class="sun-item">
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1"  x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <div class="sun-label">Zonsopgang</div>
            <div class="sun-time">${fmtTime(sunrise)}</div>
            <div class="sun-sub golden">🌅 Golden t/m ${fmtTime(ghMornEnd)}</div>
          </div>
          <div class="sun-divider"></div>
          <div class="sun-item">
            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <div class="sun-label">Zonsondergang</div>
            <div class="sun-time">${fmtTime(sunset)}</div>
            <div class="sun-sub golden">🌇 Golden v.a. ${fmtTime(ghEveStart)}</div>
          </div>
        </div>
        ${isGoldenNow ? `<div class="golden-now">✨ Golden hour nu actief — perfecte lichtomstandigheden</div>` : ''}
        <div class="sun-location">📍 ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</div>
      </div>
    `;
  }
}

// ══════════════════════════════════════════════════════════
// WEER  (Open-Meteo, geen API key)
// ══════════════════════════════════════════════════════════
const WMO_CODES = {
  0:'Helder', 1:'Overwegend helder', 2:'Gedeeltelijk bewolkt', 3:'Bewolkt',
  45:'Mist', 48:'Rijpmist',
  51:'Lichte motregen', 53:'Matige motregen', 55:'Dichte motregen',
  56:'Lichte aanvriezende motregen', 57:'Dichte aanvriezende motregen',
  61:'Lichte regen', 63:'Matige regen', 65:'Zware regen',
  66:'Lichte ijsregen', 67:'Zware ijsregen',
  71:'Lichte sneeuw', 73:'Matige sneeuw', 75:'Zware sneeuw', 77:'Motsneeuw',
  80:'Lichte buien', 81:'Matige buien', 82:'Zware buien',
  85:'Lichte sneeuwbuien', 86:'Zware sneeuwbuien',
  95:'Onweer', 96:'Onweer met hagel', 99:'Zwaar onweer',
};

const WMO_ICON = {
  0:'☀️', 1:'🌤', 2:'⛅', 3:'☁️',
  45:'🌫', 48:'🌫',
  51:'🌦', 53:'🌦', 55:'🌧', 56:'🌧', 57:'🌧',
  61:'🌧', 63:'🌧', 65:'🌧',
  66:'🌧', 67:'🌧',
  71:'❄️', 73:'❄️', 75:'❄️', 77:'❄️',
  80:'🌦', 81:'🌧', 82:'🌧', 85:'❄️', 86:'❄️',
  95:'⛈', 96:'⛈', 99:'⛈',
};

async function loadWeather(el, ctx) {
  const section = el.querySelector('#weatherSection');
  if (!section) return;

  const loader = section.querySelector('.dash-section__loading');

  try {
    const { lat, lon } = await getLocation();
    if (ctx.destroyed) return;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,is_day` +
      `&wind_speed_unit=ms&timezone=auto`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error('Weerdata niet beschikbaar');
    const data = await res.json();
    if (ctx.destroyed) return;
    const c    = data.current;
    const code = c.weather_code;
    const icon = (code === 0 || code === 1) && c.is_day === 0 ? '🌙' : WMO_ICON[code] || '🌡';
    const desc = WMO_CODES[code] || 'Onbekend';
    const [summary, ...tips] = weatherBirdTips(code, c.wind_speed_10m, c.is_day);

    if (loader) {
      loader.outerHTML = `
        <div class="weather-card">
          <div class="weather-main">
            <span class="weather-icon" role="img" aria-label="${desc}">${icon}</span>
            <div>
              <div class="weather-temp">${Math.round(c.temperature_2m)}°C</div>
              <div class="weather-desc">${desc}</div>
            </div>
            <div class="weather-feels">Voelt als ${Math.round(c.apparent_temperature)}°C</div>
          </div>
          <div class="weather-meta">
            <span>💨 ${c.wind_speed_10m} m/s</span>
            <span>💧 ${c.relative_humidity_2m}%</span>
          </div>
          <div class="weather-tip">
            <strong><span aria-hidden="true">${appIcon('bird')}</span>${summary}</strong>
            ${tips.length ? `<ul>${tips.map(tip => `<li>${tip}</li>`).join('')}</ul>` : ''}
          </div>
        </div>
      `;
    }
  } catch (_) {
    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="dash-section__error">Weer niet beschikbaar</div>`;
  }
}

function weatherBirdTips(code, wind, isDay) {
  if ([95, 96, 99].includes(code)) return ['Onweer · stel fotograferen uit', 'Schuil in een gebouw of gesloten auto.'];
  if ([56, 57, 66, 67].includes(code)) return ['Kans op gladheid · stel fotograferen uit.'];
  if (isDay === 0) return ['Donker · wacht op daglicht', 'Laat flitslicht uit bij wilde vogels.'];

  const windTip = 'Veel wind? Zoek beschutting en verkort de sluitertijd.';
  if (code === 0 || code === 1) return [
    'Helder licht · let op lichte veren',
    'Controleer het histogram op uitgebeten wit.',
    wind >= 6 ? windTip : 'Zacht ochtend- of avondlicht geeft minder harde schaduwen.',
  ];
  if (code === 2 || code === 3) return [
    'Bewolking dempt licht · Auto ISO',
    'Probeer 1/800 s op een zitplek of 1/2000 s in vlucht.',
    wind >= 6 ? windTip : 'Open het diafragma voor meer licht.',
  ];
  if (code === 45 || code === 48) return [
    'Mist · weinig contrast',
    'Gebruik een klein scherpstelpunt op kop of oog.',
    'Controleer of een lichte mistachtergrond te donker uitvalt.',
  ];
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return [
    'Regen of buien · fotografeer beschut',
    'Probeer 1/1000 s met Auto ISO bij een actieve vogel.',
    'Gebruik een zonnekap en bescherm camera en lens tegen regen.',
  ];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return [
    'Sneeuw · let op de belichting',
    'Oogt sneeuw grijs? Probeer positieve belichtingscompensatie.',
    'Controleer daarna of er nog detail zit in de lichte delen.',
  ];
  return ['Controleer het licht ter plekke', 'Kies je sluitertijd op basis van de beweging van de vogel.'];
}

// ══════════════════════════════════════════════════════════
// RECENTE WAARNEMINGEN — met foto-thumbnail + badge
// ══════════════════════════════════════════════════════════
async function loadRecentSightings(el, ctx) {
  const listEl = el.querySelector('#recentList');
  if (!listEl) return;

  // Wis vorige thumbnail-URLs (bij hergebruik van dezelfde module-instantie)
  _revokeRecentThumbUrls();

  try {
    const all = (await getSightings()).filter(Boolean);
    if (ctx.destroyed) return;
    const recent = [...all]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    if (recent.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state" style="background:var(--surface);border-radius:var(--r-card);padding:var(--space-24)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M3 12 Q6 6 12 8 Q16 5 21 3 Q19 11 13 12 Q9 13 7 18Z"/>
          </svg>
          <p>Hier komen de vogels die je zelf hebt gezien of gehoord.</p>
        </div>
      `;
      return;
    }

    // Haal thumbnails asynchroon op per sighting
    const results = await Promise.all(recent.map(s => buildRecentItem(s)));
    if (ctx.destroyed) {
      // Geef alle gegenereerde blob-URLs vrij: we gaan ze niet in de DOM zetten
      results.forEach(r => {
        if (r.blobUrl) revokePhotoUrl(r.blobUrl);
      });
      return;
    }
    listEl.innerHTML = results.map(r => r.html).join('');

    // Registreer blob-URLs in de module-level tracker zodat cleanup() ze
    // altijd kan vrijgeven, ook als load/error al gevuurd was vóór koppeling.
    results.forEach(r => {
      if (r.blobUrl) _recentThumbUrls.push(r.blobUrl);
    });

    // Koppel deferred revoke aan elk img-element ná DOM-plaatsing.
    // Als load/error al gevuurd was (img reeds gecached), wordt de URL
    // toch vrijgegeven via _revokeRecentThumbUrls() in cleanup().
    listEl.querySelectorAll('.recent-item__thumb img').forEach(img => {
      const url = img.src;
      if (!url || !url.startsWith('blob:')) return;
      const revoke = () => {
        // Verwijder uit tracker zodat cleanup() hem niet dubbel intrekt
        const idx = _recentThumbUrls.indexOf(url);
        if (idx !== -1) _recentThumbUrls.splice(idx, 1);
        revokePhotoUrl(url);
      };
      img.addEventListener('load',  revoke, { once: true });
      img.addEventListener('error', revoke, { once: true });
    });

  } catch (_) {
    listEl.innerHTML = `<div class="dash-section__error" style="padding:var(--space-12);background:var(--surface);border-radius:var(--r-card)">Waarnemingen niet beschikbaar</div>`;
  }
}

async function buildRecentItem(s) {
  let thumbHtml = '';
  let blobUrl   = null; // bijhouden zodat caller het kan vrijgeven bij destroyed

  // Probeer eerste foto-thumbnail te laden
  // URL wordt NIET hier ingetrokken — dat doet de caller via DOM event listeners
  if (s.photoIds?.length) {
    try {
      const db = await getDB();
      const tx = db.transaction('photos', 'readonly');
      const photos = tx.objectStore('photos');
      for (const id of s.photoIds) {
        const photo = await txGet(photos, id);
        if (!(photo?.blob?.type || photo?.type || '').startsWith('image/')) continue;
        const url = getPhotoUrl(photo);
        if (!url) continue;
        blobUrl = url;
        thumbHtml = `<img src="${url}" alt="" loading="lazy" decoding="async">`;
        break;
      }
    } catch (_) {}
  }

  const thumbContent = thumbHtml
    ? thumbHtml
    : `<span style="font-size:22px" aria-hidden="true">🐦</span>`;

  const thumbClass = thumbHtml
    ? 'recent-item__thumb'
    : 'recent-item__thumb recent-item__thumb--empty';

  const badge = certBadge(s.certainty);

  const html = `
    <button type="button" class="recent-item" data-home-sighting="${escHtml(String(s.id))}">
      <span class="${thumbClass}">${thumbContent}</span>
      <span class="recent-item__body">
        <span class="recent-item__name">${escHtml(s.speciesName || 'Onbekend')}</span>
        <span class="recent-item__meta">
          ${fmtDate(s.date)}${s.locationName ? ` · ${escHtml(s.locationName)}` : ''}
        </span>
      </span>
      ${badge ? `<span class="recent-item__badge">${badge}</span>` : ''}
    </button>
  `;

  return { html, blobUrl };
}

function certBadge(certainty) {
  if (!certainty) return '';
  const map = {
    'zeker':        { cls: 'certain',  label: 'Zeker' },
    'waarschijnlijk':{ cls: 'probable', label: 'Waarschijnlijk' },
    'onzeker':      { cls: 'uncertain',label: 'Onzeker' },
  };
  const entry = map[certainty?.toLowerCase()];
  if (!entry) return '';

  const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
  const warnIcon  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  const icon = entry.cls === 'certain' ? checkIcon : warnIcon;
  return `<span class="certainty-badge certainty-badge--${entry.cls}">${icon}${entry.label}</span>`;
}

// ══════════════════════════════════════════════════════════
// MAANDGRAFIEK  (native SVG, geen Chart.js)
// ══════════════════════════════════════════════════════════
async function loadMonthlyChart(el, ctx) {
  const section = el.querySelector('#monthlySection');
  if (!section) return;
  const loader = section.querySelector('.dash-section__loading');

  try {
    const sightings = (await getSightings()).filter(Boolean);
    if (ctx.destroyed) return;

    // Bouw bucket: laatste 12 maanden
    const now    = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key:   `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('nl-NL', { month: 'short' }),
        count: 0,
      });
    }

    for (const s of sightings) {
      if (!s.date) continue;
      const key = s.date.slice(0, 7); // "YYYY-MM"
      const bucket = months.find(m => m.key === key);
      if (bucket) bucket.count++;
    }

    const maxCount = Math.max(...months.map(m => m.count));

    // Lege staat: geen sightings überhaupt, of alle buiten het 12-maands venster
    if (maxCount === 0) {
      const msg = sightings.length === 0
        ? 'Nog geen waarnemingen om te tonen'
        : 'Geen waarnemingen in de afgelopen 12 maanden';
      if (loader) loader.outerHTML = `<div class="chart-empty">${msg}</div>`;
      return;
    }

    // SVG-afmetingen — PAD_T = 14 geeft ruimte voor count-labels boven hoogste balk
    const W = 320, H = 130, PAD_L = 26, PAD_B = 20, PAD_T = 14, PAD_R = 8;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_B - PAD_T;
    const barW   = Math.floor(chartW / months.length);
    const barGap = Math.max(2, Math.floor(barW * 0.18));
    const barNet = barW - barGap;

    // Y-rasterlijnen (max 4)
    const gridSteps = Math.min(maxCount, 4);
    const gridLines = [];
    for (let g = 1; g <= gridSteps; g++) {
      const val = Math.round((maxCount / gridSteps) * g);
      const y   = PAD_T + chartH - Math.round((val / maxCount) * chartH);
      gridLines.push({ y, val });
    }

    const gridSvg = gridLines.map(gl =>
      `<line x1="${PAD_L}" y1="${gl.y}" x2="${W - PAD_R}" y2="${gl.y}" class="chart-grid"/>
       <text x="${PAD_L - 3}" y="${gl.y + 4}" class="chart-axis-y">${gl.val}</text>`
    ).join('');

    const barsSvg = months.map((m, i) => {
      const x      = PAD_L + i * barW;
      const barH   = m.count === 0 ? 2 : Math.max(3, Math.round((m.count / maxCount) * chartH));
      const y      = PAD_T + chartH - barH;
      const isLast = i === months.length - 1;
      const labelX = x + barW / 2;
      return `
        <rect x="${x + barGap / 2}" y="${y}" width="${barNet}" height="${barH}"
              rx="2" class="chart-bar${m.count === 0 ? ' chart-bar--zero' : ''}"/>
        ${(i % 2 === 0 || isLast) ? `<text x="${labelX}" y="${H - 4}" class="chart-axis-x">${m.label}</text>` : ''}
        ${m.count > 0 ? `<text x="${labelX}" y="${y - 3}" class="chart-value">${m.count}</text>` : ''}
      `;
    }).join('');

    const svg = `
      <svg class="monthly-chart" viewBox="0 0 ${W} ${H}"
           role="img" aria-label="Waarnemingen per maand">
        ${gridSvg}
        <line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T + chartH}" class="chart-axis-line"/>
        <line x1="${PAD_L}" y1="${PAD_T + chartH}" x2="${W - PAD_R}" y2="${PAD_T + chartH}" class="chart-axis-line"/>
        ${barsSvg}
      </svg>
    `;

    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="chart-wrap">${svg}</div>`;

  } catch (_) {
    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="dash-section__error">Grafiek niet beschikbaar</div>`;
  }
}

// ══════════════════════════════════════════════════════════
// HOTSPOTS MINIMAP  (native SVG, alleen werkelijke GPS-data)
// ══════════════════════════════════════════════════════════
async function loadHotspotsMap(el, ctx, onSearchSelect) {
  const section = el.querySelector('#hotspotsSection');
  if (!section) return;
  const loader = section.querySelector('.dash-section__loading');

  try {
    const sightings = (await getSightings()).filter(Boolean);
    if (ctx.destroyed || !section.isConnected) return;
    // A named placeId is the true pin identity. Nearby, distinct pins are never merged.
    const points = groupHotspots(sightings);
    if (!points.length) {
      loader?.remove();
      section.insertAdjacentHTML('beforeend', `<div class="hotspot-empty">
        <p>Nog geen waarnemingen met GPS. Je kunt een plek toevoegen via Waarnemen.</p>
        <button type="button" class="hotspot-open" data-signature-route="map">Open mijn kaart</button>
      </div>`);
      return;
    }

    const locations = points.length, observations = points.reduce((count, point) => count + point.count, 0);
    const displayed = points.slice(0, 3);
    const listing = displayed.map(p => {
      const species = p.speciesNames.slice(0, 2).join(' · ') || 'Vogelwaarneming';
      return `<button type="button" class="hotspot-place" data-home-hotspot-sighting="${escHtml(p.sightingId || '')}"
        aria-label="Open ${escHtml(p.name)} op de kaart, ${p.count} waarnemingen">
        <span class="hotspot-place__pin" aria-hidden="true">⌖</span>
        <span class="hotspot-place__details"><strong>${escHtml(p.name)}</strong>
          <small>${escHtml(species)}</small></span>
        <span class="hotspot-place__count">${p.count}</span>
      </button>`;
    }).join('');

    loader?.remove();
    section.insertAdjacentHTML('beforeend', `
      <div class="hotspot-wrap" data-hotspot-count="${locations}">
        <div id="homeHotspotMap" class="hotspot-map hotspot-map--live"
          role="region" aria-label="Overzichtskaart met ${locations} privé-waarnemingslocaties">
          <p class="hotspot-map-status" id="hotspotMapStatus" role="status">Kaart laden…</p>
        </div>
        <div class="hotspot-meta">${locations} locatie${locations === 1 ? '' : 's'} ·
          ${observations} waarneming${observations === 1 ? '' : 'en'} met GPS</div>
        <div class="hotspot-location-list" aria-label="Mijn opgeslagen hotspots">${listing}</div>
        ${points.length > displayed.length ? `<p class="hotspot-more">En nog ${points.length - displayed.length} locaties op de kaart.</p>` : ''}
        <button type="button" class="hotspot-open" data-signature-route="map">Bekijk volledige kaart</button>
      </div>
    `);

    // The section is below Home's first screen; only fetch tiles once it is on screen.
    const preview = section.querySelector('#homeHotspotMap');
    const status = section.querySelector('#hotspotMapStatus');
    const showMap = async () => {
      ctx.hotspotObserver?.disconnect();
      if (ctx.destroyed || !preview?.isConnected) return;
      if (navigator.onLine === false) {
        status.textContent = 'Offline: je opgeslagen locaties staan hieronder. Kaarttegels vereisen internet.';
        return;
      }
      try {
        await Promise.race([
          ensureLeaflet(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('CDN timeout')), 6500)),
        ]);
        if (ctx.destroyed || !preview.isConnected) return;
        const L = window.L;
        const map = L.map(preview, {
          zoomControl: false, attributionControl: true,
          dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
          boxZoom: false, touchZoom: false, keyboard: false, tap: false,
        });
        ctx.hotspotMap = map;
        const tiles = L.tileLayer(LAYERS.kaart.url, { ...LAYERS.kaart.options, maxZoom: 18 }).addTo(map);
        const hideNotice = () => {
          clearTimeout(ctx.hotspotTimer);
          if (!ctx.destroyed) status.hidden = true;
        };
        tiles.on('load', hideNotice);
        tiles.on('tileerror', () => {
          if (!ctx.destroyed && !status.hidden) {
            status.textContent = 'Kaarttegels niet bereikbaar; je locaties staan hieronder.';
          }
        });
        ctx.hotspotTimer = setTimeout(() => {
          if (!ctx.destroyed && !status.hidden) {
            status.textContent = 'Kaarttegels niet bereikbaar; je locaties staan hieronder.';
          }
        }, 7000);
        for (const point of points) {
          const marker = L.circleMarker([point.lat, point.lon], {
            radius: Math.min(16, 7 + Math.sqrt(point.count) * 2),
            color: '#ffffff', weight: 2, fillColor: '#078866', fillOpacity: 1,
          }).addTo(map);
          marker.bindTooltip(escHtml(point.name + ' · ' + point.count + ' waarneming' +
            (point.count === 1 ? '' : 'en')), { direction: 'top' });
          marker.on('click', () => {
            if (!ctx.destroyed && point.sightingId) {
              onSearchSelect?.({ route: 'map', sightingId: point.sightingId });
            }
          });
        }
        if (points.length === 1) map.setView([points[0].lat, points[0].lon], 15);
        else map.fitBounds(points.map(point => [point.lat, point.lon]), { padding: [26, 26], maxZoom: 15 });
        ctx.hotspotResize = setTimeout(() => {
          if (!ctx.destroyed && preview.isConnected) map.invalidateSize();
        }, 100);
      } catch (_) {
        if (ctx.destroyed) return;
        ctx.hotspotMap?.remove();
        ctx.hotspotMap = null;
        status.textContent = 'De kaart kan nu niet laden; je opgeslagen locaties staan hieronder.';
      }
    };
    if ('IntersectionObserver' in window) {
      ctx.hotspotObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) showMap();
      }, { rootMargin: '250px' });
      ctx.hotspotObserver.observe(preview);
    } else showMap();
  } catch (_) {
    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="dash-section__error">
      Je hotspots konden niet worden geladen. Je waarnemingen blijven opgeslagen.
    </div>`;
  }
}

// ══════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════
function getLocation() {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      return resolve({ lat: FALLBACK_LAT, lon: FALLBACK_LON });
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      _   => resolve({ lat: FALLBACK_LAT, lon: FALLBACK_LON }),
      { timeout: 5000 }
    );
  });
}

function fmtTime(date) {
  if (!date || isNaN(date)) return '—';
  return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function txGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── SVG icon helpers ───────────────────────────────────────
function statTile(id, value, label, iconSvg) {
  const route = { 'stat-species':'species','stat-total':'sightings',
    'stat-photos':'media','stat-hotspot':'map' }[id] || 'home';
  return `
    <button class="stat-tile" id="${id}" type="button" data-signature-route="${route}"
      aria-label="Open ${label}">
      <div class="stat-tile__icon">${iconSvg}</div>
      <div class="stat-tile__value">${value}</div>
      <div class="stat-tile__label">${label}</div>
    </button>
  `;
}
