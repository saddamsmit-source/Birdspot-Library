/**
 * Home / Dashboard — view
 * Stap 2: diashow, stats, sunrise/sunset + golden hour, weer, recente waarnemingen
 *
 * Externe deps (CDN, geladen via index.html):
 *   - SunCalc  → window.SunCalc
 *   - Open-Meteo REST API (geen key)
 */

import { getDB }        from '../../data/db.js';
import { getSightings } from '../../data/sightings.js';

// ── Constanten ─────────────────────────────────────────────
const SLIDESHOW_INTERVAL = 3000;           // ms
const FALLBACK_LAT = 52.3676;              // Amsterdam
const FALLBACK_LON = 4.9041;

// ── Hoofd-render ───────────────────────────────────────────
export async function renderHome(el) {
  el.innerHTML = buildSkeleton();
  initSlideshow(el);
  loadStats(el);
  loadSunInfo(el);
  loadWeather(el);
  loadRecentSightings(el);
}

// ── Skeleton ───────────────────────────────────────────────
function buildSkeleton() {
  return `
    <div class="page-header">
      <div class="page-header__title">Birdspot Library</div>
      <div class="page-header__sub">Jouw vogelarchief</div>
    </div>

    <!-- Diashow -->
    <div class="slideshow" id="slideshow" aria-label="Fotodiashow">
      <div class="slideshow__inner" id="slideshowInner">
        <div class="slideshow__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="3" width="18" height="18" rx="3"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p>Voeg waarnemingen toe om foto's te zien</p>
        </div>
      </div>
      <div class="slideshow__dots" id="slideshowDots"></div>
    </div>

    <!-- Stat tiles -->
    <div class="stats-row" id="statsRow">
      ${statTile('stat-total',  '—', 'Gezien',   'icon-eye')}
      ${statTile('stat-species','—', 'Soorten',  'icon-bird')}
      ${statTile('stat-photos', '—', "Foto's",   'icon-photo')}
    </div>

    <!-- Zon & golden hour -->
    <section class="dash-section" id="sunSection">
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span> Zonsinformatie laden…
      </div>
    </section>

    <!-- Weer -->
    <section class="dash-section" id="weatherSection">
      <div class="dash-section__loading">
        <span class="spinner" aria-hidden="true"></span> Weer laden…
      </div>
    </section>

    <!-- Recente waarnemingen -->
    <section class="dash-section" id="recentSection">
      <div class="dash-section__label">Recente waarnemingen</div>
      <div id="recentList">
        <div class="dash-section__loading">
          <span class="spinner" aria-hidden="true"></span>
        </div>
      </div>
    </section>
  `;
}

// ══════════════════════════════════════════════════════════
// DIASHOW
// ══════════════════════════════════════════════════════════
let _slideshowTimer = null;
let _slideIndex     = 0;
let _slides         = [];

async function initSlideshow(el) {
  // Haal alle foto's op uit IndexedDB
  try {
    const db = await getDB();
    const tx = db.transaction('photos', 'readonly');
    const all = await txAll(tx.objectStore('photos'));
    _slides = shuffleArray(all);
  } catch (_) {
    _slides = [];
  }

  const inner = el.querySelector('#slideshowInner');
  const dots  = el.querySelector('#slideshowDots');
  if (!inner) return;

  if (_slides.length === 0) return; // lege staat al in skeleton

  inner.innerHTML = '';
  dots.innerHTML  = '';
  _slideIndex = 0;

  _slides.forEach((photo, i) => {
    const slide = document.createElement('div');
    slide.className = 'slideshow__slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url(${photo.dataUrl})`;
    slide.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');

    const caption = document.createElement('div');
    caption.className = 'slideshow__caption';
    caption.textContent = photo.speciesName || '';
    slide.appendChild(caption);
    inner.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'slideshow__dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i, inner, dots));
    dots.appendChild(dot);
  });

  clearInterval(_slideshowTimer);
  _slideshowTimer = setInterval(() => {
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
async function loadStats(el) {
  try {
    const sightings = await getSightings();
    const speciesSet = new Set(sightings.map(s => s.speciesId));
    const photoCount = sightings.reduce((n, s) => n + (s.photoIds?.length || 0), 0);

    setStatVal(el, 'stat-total',   sightings.length);
    setStatVal(el, 'stat-species', speciesSet.size);
    setStatVal(el, 'stat-photos',  photoCount);
  } catch (_) {
    setStatVal(el, 'stat-total',   '—');
    setStatVal(el, 'stat-species', '—');
    setStatVal(el, 'stat-photos',  '—');
  }
}

function setStatVal(el, id, val) {
  const node = el.querySelector(`#${id} .stat-tile__value`);
  if (node) node.textContent = val;
}

// ══════════════════════════════════════════════════════════
// ZON / GOLDEN HOUR  (SunCalc.js)
// ══════════════════════════════════════════════════════════
async function loadSunInfo(el) {
  const section = el.querySelector('#sunSection');
  if (!section) return;

  const { lat, lon } = await getLocation();
  const now  = new Date();
  const SC   = window.SunCalc;

  if (!SC) {
    section.innerHTML = buildSunError();
    return;
  }

  const times = SC.getTimes(now, lat, lon);

  const sunrise     = times.sunrise;
  const sunset      = times.sunset;
  const goldenMorn  = times.goldenHour;          // einde golden hour ochtend
  const goldenEve   = times.goldenHourEnd;       // Let op: SunCalc noemt dit goldenHourEnd (avond)

  // SunCalc golden hour definitie:
  //  times.goldenHourEnd  = einde golden hour ochtend (= goudkleurig licht voorbij)
  //  times.goldenHour     = begin golden hour avond

  const ghMornStart = sunrise;
  const ghMornEnd   = times.goldenHourEnd;   // ~30-60 min na zonsopgang
  const ghEveStart  = times.goldenHour;      // ~30-60 min voor zonsondergang
  const ghEveEnd    = sunset;

  const isGoldenNow = (now >= ghMornStart && now <= ghMornEnd) ||
                      (now >= ghEveStart  && now <= ghEveEnd);

  section.innerHTML = `
    <div class="sun-card">
      <div class="sun-row">
        <div class="sun-item">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
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
          <div class="sun-sub golden">🌅 Golden ${fmtTime(ghMornStart)}–${fmtTime(ghMornEnd)}</div>
        </div>
        <div class="sun-divider"></div>
        <div class="sun-item">
          <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <div class="sun-label">Zonsondergang</div>
          <div class="sun-time">${fmtTime(sunset)}</div>
          <div class="sun-sub golden">🌇 Golden ${fmtTime(ghEveStart)}–${fmtTime(ghEveEnd)}</div>
        </div>
      </div>
      ${isGoldenNow ? `<div class="golden-now">✨ Golden hour nu actief — perfecte lichtomstandigheden</div>` : ''}
      <div class="sun-location">📍 ${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E</div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════
// WEER  (Open-Meteo, geen API key)
// ══════════════════════════════════════════════════════════
const WMO_CODES = {
  0:'Helder', 1:'Overwegend helder', 2:'Gedeeltelijk bewolkt', 3:'Bewolkt',
  45:'Mist', 48:'Rijpmist',
  51:'Lichte motregen', 53:'Matige motregen', 55:'Dichte motregen',
  61:'Lichte regen', 63:'Matige regen', 65:'Zware regen',
  71:'Lichte sneeuw', 73:'Matige sneeuw', 75:'Zware sneeuw',
  80:'Lichte buien', 81:'Matige buien', 82:'Zware buien',
  95:'Onweer', 96:'Onweer met hagel', 99:'Zwaar onweer',
};

const WMO_ICON = {
  0:'☀️', 1:'🌤', 2:'⛅', 3:'☁️',
  45:'🌫', 48:'🌫',
  51:'🌦', 53:'🌦', 55:'🌧',
  61:'🌧', 63:'🌧', 65:'🌧',
  71:'❄️', 73:'❄️', 75:'❄️',
  80:'🌦', 81:'🌧', 82:'⛈',
  95:'⛈', 96:'⛈', 99:'⛈',
};

async function loadWeather(el) {
  const section = el.querySelector('#weatherSection');
  if (!section) return;

  try {
    const { lat, lon } = await getLocation();
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
      `&wind_speed_unit=ms&timezone=auto`;

    const res  = await fetch(url);
    const data = await res.json();
    const c    = data.current;
    const code = c.weather_code;
    const icon = WMO_ICON[code]  || '🌡';
    const desc = WMO_CODES[code] || 'Onbekend';

    section.innerHTML = `
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
        <div class="weather-tip">${weatherBirdTip(code, c.wind_speed_10m)}</div>
      </div>
    `;
  } catch (_) {
    section.innerHTML = `<div class="dash-section__error">Weer niet beschikbaar</div>`;
  }
}

function weatherBirdTip(code, wind) {
  if (code === 0 || code === 1) {
    if (wind < 3) return '🐦 Ideale omstandigheden — weinig wind, helder licht';
    if (wind < 6) return '🐦 Goed vogelweer — let op beweging in bomen';
    return '🐦 Helder maar winderig — vogels zoeken beschutting';
  }
  if (code === 2 || code === 3) return '🐦 Bewolking dempt licht — ISO omhoog';
  if (code >= 61 && code <= 65) return '🌧 Regen — vogels minder actief, zoek droge plekken';
  if (code >= 80 && code <= 82) return '🌦 Buiig — actief voor en na bui';
  if (code >= 95) return '⛈ Onweer — niet aanbevolen om buiten te fotograferen';
  return '📷 Check licht voor vertrek';
}

// ══════════════════════════════════════════════════════════
// RECENTE WAARNEMINGEN
// ══════════════════════════════════════════════════════════
async function loadRecentSightings(el) {
  const list = el.querySelector('#recentList');
  if (!list) return;

  try {
    const all = await getSightings();
    const recent = [...all]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (recent.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="padding:var(--space-16) 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <path d="M3 12 Q6 6 12 8 Q16 5 21 3 Q19 11 13 12 Q9 13 7 18Z"/>
          </svg>
          <p>Nog geen waarnemingen — tik + om te beginnen</p>
        </div>
      `;
      return;
    }

    list.innerHTML = recent.map(s => `
      <div class="recent-item card">
        <div class="recent-item__icon">🐦</div>
        <div class="recent-item__body">
          <div class="recent-item__name">${s.speciesName || 'Onbekend'}</div>
          <div class="recent-item__meta">
            ${fmtDate(s.date)}
            ${s.locationName ? ` · ${s.locationName}` : ''}
          </div>
        </div>
        ${s.photoIds?.length ? `<div class="recent-item__photo-badge">${s.photoIds.length} 📷</div>` : ''}
      </div>
    `).join('');
  } catch (_) {
    list.innerHTML = `<div class="dash-section__error">Waarnemingen niet beschikbaar</div>`;
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

function buildSunError() {
  return `<div class="dash-section__error">Zonsinformatie niet beschikbaar</div>`;
}

// ── HTML helpers ───────────────────────────────────────────
function statTile(id, value, label, iconClass) {
  const icons = {
    'icon-eye':   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    'icon-bird':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12 Q6 6 12 8 Q16 5 21 3 Q19 11 13 12 Q9 13 7 18Z"/></svg>`,
    'icon-photo': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  };
  return `
    <div class="stat-tile card" id="${id}">
      <div class="stat-tile__icon">${icons[iconClass] || ''}</div>
      <div class="stat-tile__value">${value}</div>
      <div class="stat-tile__label">${label}</div>
    </div>
  `;
}
