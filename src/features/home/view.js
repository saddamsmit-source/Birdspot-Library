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

import { getDB }                          from '../../data/db.js';
import { getSightings }                   from '../../data/sightings.js';
import { getPhotoUrl, revokePhotoUrl }    from '../../utils/photoUrl.js';
import { initFeaturedCarousel } from './featuredCarousel.js';
import { bindAppSearch, searchMarkup } from '../search/index.js';
import { buildAmbientBackdrop,initAmbientBackdrop } from './ambientBackdrop.js';

// ── Constanten ─────────────────────────────────────────────
const SLIDESHOW_INTERVAL = 3500;
const FALLBACK_LAT = 52.3676;
const FALLBACK_LON = 4.9041;

// ── Hoofd-render ───────────────────────────────────────────
/**
 * renderHome retourneert een cleanup-functie.
 * app.js roept cleanup() aan vóór elke routewissel zodat:
 *   1. De slideshow-timer stopt.
 *   2. Alle openstaande blob-URL's worden vrijgegeven.
 *   3. Async-callbacks die nog lopen een stale-flag checken en stil stoppen.
 */
export function renderHome(el, { onSearchSelect } = {}) {
  // Gedeelde destroyed-vlag: alle async functies checken deze vóór DOM-mutaties.
  const ctx = { destroyed: false };

  el.innerHTML = buildSkeleton();
  // New signature shortcuts use existing router; no parallel navigation state.
  const onSignatureClick = e => {
    const button = e.target.closest('[data-signature-route]');
    if (!button) return;
    import('../../app.js').then(({ navigate }) => navigate(button.dataset.signatureRoute));
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
  loadHotspotsMap(el, ctx);

  return function cleanup() {
    ctx.destroyed = true;
    el.removeEventListener('click', onSignatureClick);
    disposeSearch();
    disposeFeatured();
    disposeHabitat();
    // Stop timer
    if (_slideshowTimer !== null) {
      clearInterval(_slideshowTimer);
      _slideshowTimer = null;
    }
    // Geef alle openstaande blob-URL's vrij (slideshow + recent-thumbnails)
    _revokeSlideshowUrls();
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
        <img id="featuredBirdImage" class="featured-birds__photo" alt=""
          decoding="async">
      </div>
      <div class="featured-birds__shade" aria-hidden="true"></div>
      <div class="featured-birds__caption">
        <span class="featured-birds__group" id="featuredBirdGroup"></span>
        <h2 id="featuredBirdName"></h2>
        <em id="featuredBirdLatin"></em>
        <p id="featuredBirdWhere"></p>
        <p class="featured-birds__presence" id="featuredBirdPresence"></p>
        <a id="featuredBirdCredit" class="featured-birds__credit"
          rel="noopener noreferrer" target="_blank" href="https://commons.wikimedia.org/">Fotobron</a>
      </div>
    </section>

    <!-- Stat tiles — 4 kolommen -->
    <div class="stats-row" id="statsRow">
      ${statTile('stat-species', '—', 'Soorten',     iconBird())}
      ${statTile('stat-total',   '—', 'Waarnemingen', iconEye())}
      ${statTile('stat-photos',  '—', "Media",        iconPhoto())}
      ${statTile('stat-hotspot', '—', 'Hotspots',    iconMap())}
    </div>

    <!-- Recente waarnemingen -->
    <section class="dash-section" id="recentSection">
      <div class="section-head">
        <span class="section-head__title">Recente waarnemingen</span>
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

    <!-- Accessible secondary features: stays collapsed beneath the primary KPI row. -->
    <details class="signature-home-intro signature-quick-access" id="homeMoreFeatures">
      <summary class="signature-quick-access__summary">
        <span class="signature-quick-access__icon" aria-hidden="true">✦</span>
        <span>Meer ontdekken</span>
        <span class="signature-quick-access__chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="signature-home-links signature-quick-access__links">
        <button data-signature-route="journal" class="signature-home-link" type="button">✦ &nbsp; Birding Journal <span aria-hidden="true">↗</span></button>
        <button data-signature-route="insights" class="signature-home-link" type="button">▥ &nbsp; Mijn Inzichten <span aria-hidden="true">↗</span></button>
        <button data-signature-route="film" class="signature-home-link signature-home-link--film" type="button">✦ &nbsp; Wildlife Film Studio <span aria-hidden="true">↗</span></button>
        <button data-signature-route="map" class="signature-home-link" type="button">⌖ &nbsp; Explorer Map <span aria-hidden="true">↗</span></button>
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


// ══════════════════════════════════════════════════════════
// DIASHOW
// ══════════════════════════════════════════════════════════
let _slideshowTimer = null;
let _slideIndex     = 0;
let _slides         = [];
// Bijhouden van blob-URL's zodat ze ingetrokken worden bij re-render
let _slideshowUrls  = [];

function _revokeSlideshowUrls() {
  _slideshowUrls.forEach(revokePhotoUrl);
  _slideshowUrls = [];
}

// ── Recente waarnemingen thumbnail-URLs ─────────────────────
// Bijhouden zodat cleanup() ze kan vrijgeven ook als load/error
// event al gevuurd was vóór de listener werd gekoppeld.
let _recentThumbUrls = [];

function _revokeRecentThumbUrls() {
  _recentThumbUrls.forEach(revokePhotoUrl);
  _recentThumbUrls = [];
}

async function initSlideshow(el, ctx) {
  // Ruim vorige URL's op vóór een nieuwe initialisatie
  _revokeSlideshowUrls();

  try {
    const db = await getDB();
    const tx = db.transaction('photos', 'readonly');
    const all = await txAll(tx.objectStore('photos'));
    _slides = shuffleArray(all);
  } catch (_) {
    _slides = [];
  }

  // Guard: scherm al verlaten vóórdat IDB terugkwam
  if (ctx.destroyed) { _revokeSlideshowUrls(); return; }

  const inner = el.querySelector('#slideshowInner');
  const dots  = el.querySelector('#slideshowDots');
  if (!inner) return;
  if (_slides.length === 0) return;

  // Pre-filter: genereer URL's en behoud alleen records met bruikbare blob.
  // Zo lopen slide-index, slide-elementen en dots altijd 1:1 synchroon.
  const validSlides = [];
  for (const photo of _slides) {
    const url = getPhotoUrl(photo);
    if (url) validSlides.push({ photo, url });
  }

  if (validSlides.length === 0) return; // geen bruikbare blobs

  _slides = validSlides.map(vs => vs.photo); // update module-state
  validSlides.forEach(vs => _slideshowUrls.push(vs.url));

  inner.innerHTML = '';
  dots.innerHTML  = '';
  _slideIndex = 0;

  validSlides.forEach(({ photo, url }, i) => {
    const slide = document.createElement('div');
    slide.className = 'slideshow__slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url(${url})`;
    slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');

    const caption = document.createElement('div');
    caption.className = 'slideshow__caption';
    caption.textContent = photo.speciesName || '';
    slide.appendChild(caption);
    inner.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'slideshow__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => {
      if (!ctx.destroyed) goToSlide(i, inner, dots);
    });
    dots.appendChild(dot);
  });

  clearInterval(_slideshowTimer);
  _slideshowTimer = setInterval(() => {
    if (ctx.destroyed) {
      clearInterval(_slideshowTimer);
      _slideshowTimer = null;
      return;
    }
    _slideIndex = (_slideIndex + 1) % _slides.length;
    goToSlide(_slideIndex, inner, dots);
  }, SLIDESHOW_INTERVAL);
}

function goToSlide(idx, inner, dots) {
  _slideIndex = idx;
  inner.querySelectorAll('.slideshow__slide').forEach((s, i) => {
    s.classList.toggle('active', i === idx);
    s.setAttribute('aria-hidden', i !== idx ? 'true' : 'false');
  });
  dots.querySelectorAll('.slideshow__dot').forEach((d, i) => {
    d.classList.toggle('active', i === idx);
  });
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
async function loadSunInfo(el, ctx) {
  const section = el.querySelector('#sunSection');
  if (!section) return;

  const { lat, lon } = await getLocation();
  if (ctx.destroyed) return;
  const now  = new Date();
  const SC   = window.SunCalc;

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
            <strong><span aria-hidden="true">${iconBird()}</span>${summary}</strong>
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
          <p>Nog geen waarnemingen — tik + om te beginnen</p>
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
      const photo = await txGet(tx.objectStore('photos'), s.photoIds[0]);
      const url = getPhotoUrl(photo);
      if (url) {
        blobUrl   = url;
        thumbHtml = `<img src="${url}" alt="${s.speciesName || ''}" loading="lazy">`;
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
    <div class="recent-item">
      <div class="${thumbClass}">${thumbContent}</div>
      <div class="recent-item__body">
        <div class="recent-item__name">${s.speciesName || 'Onbekend'}</div>
        <div class="recent-item__meta">
          ${fmtDate(s.date)}${s.locationName ? ` · ${s.locationName}` : ''}
        </div>
      </div>
      ${badge ? `<div class="recent-item__badge">${badge}</div>` : ''}
    </div>
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
async function loadHotspotsMap(el, ctx) {
  const section = el.querySelector('#hotspotsSection');
  if (!section) return;
  const loader = section.querySelector('.dash-section__loading');

  try {
    const sightings = (await getSightings()).filter(Boolean);
    if (ctx.destroyed) return;

    // Alleen waarnemingen met werkelijke GPS-coördinaten
    const withGps = sightings.filter(s =>
      typeof s.lat === 'number' && typeof s.lon === 'number' &&
      !isNaN(s.lat) && !isNaN(s.lon)
    );

    if (withGps.length === 0) {
      if (loader) loader.outerHTML = `
        <div class="hotspot-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" style="width:32px;height:32px;opacity:.35">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <p>Nog geen GPS-locaties — voeg coördinaten toe aan waarnemingen</p>
        </div>
      `;
      return;
    }

    // Groepeer op locatie (afronden op 3 decimalen ≈ ~100m)
    const clusters = {};
    for (const s of withGps) {
      const key = `${s.lat.toFixed(3)},${s.lon.toFixed(3)}`;
      if (!clusters[key]) clusters[key] = { lat: s.lat, lon: s.lon, count: 0, species: new Set() };
      clusters[key].count++;
      if (s.speciesId) clusters[key].species.add(s.speciesId);
    }
    const points = Object.values(clusters);

    // Bounding box
    const lats = points.map(p => p.lat);
    const lons = points.map(p => p.lon);
    let minLat = Math.min(...lats), maxLat = Math.max(...lats);
    let minLon = Math.min(...lons), maxLon = Math.max(...lons);

    // Voeg padding toe aan bounding box (5%)
    const latPad = Math.max((maxLat - minLat) * 0.2, 0.005);
    const lonPad = Math.max((maxLon - minLon) * 0.2, 0.005);
    minLat -= latPad; maxLat += latPad;
    minLon -= lonPad; maxLon += lonPad;

    const W = 320, H = 180;
    const maxCount = Math.max(...points.map(p => p.count));

    // Project lat/lon → SVG-coördinaten (Mercator-benadering)
    const project = (lat, lon) => {
      const x = ((lon - minLon) / (maxLon - minLon)) * (W - 20) + 10;
      // Latituderichting omgekeerd (noord = boven)
      const y = ((maxLat - lat) / (maxLat - minLat)) * (H - 20) + 10;
      return { x, y };
    };

    const dotsSvg = points.map(p => {
      const { x, y } = project(p.lat, p.lon);
      const r     = Math.max(5, Math.min(14, 5 + (p.count / maxCount) * 9));
      const label = p.count > 1 ? p.count : '';
      return `
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}"
                class="hotspot-dot" style="--r:${r.toFixed(1)}px"/>
        ${label ? `<text x="${x.toFixed(1)}" y="${(y + 4.5).toFixed(1)}" class="hotspot-label">${label}</text>` : ''}
      `;
    }).join('');

    const totalLocations = points.length;
    const totalSightings = withGps.length;

    const svg = `
      <svg class="hotspot-map" viewBox="0 0 ${W} ${H}"
           role="img" aria-label="Kaart van waarnemingslocaties">
        <rect width="${W}" height="${H}" class="hotspot-bg"/>
        ${dotsSvg}
      </svg>
      <div class="hotspot-meta">${totalLocations} locatie${totalLocations !== 1 ? 's' : ''} · ${totalSightings} waarneming${totalSightings !== 1 ? 'en' : ''} met GPS</div>
    `;

    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="hotspot-wrap">${svg}</div>`;

  } catch (_) {
    if (ctx.destroyed) return;
    if (loader) loader.outerHTML = `<div class="dash-section__error">Kaart niet beschikbaar</div>`;
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

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function txAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

function txGet(store, key) {
  return new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

// ── SVG icon helpers ───────────────────────────────────────
function iconBird() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12 Q6 6 12 8 Q16 5 21 3 Q19 11 13 12 Q9 13 7 18Z"/></svg>`;
}
function iconEye() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
function iconPhoto() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
}
function iconMap() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`;
}

// ── HTML helper ────────────────────────────────────────────
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
