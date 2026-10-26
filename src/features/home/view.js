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

// ── Constanten ─────────────────────────────────────────────
const SLIDESHOW_INTERVAL = 3500;
const FALLBACK_LAT = 52.3676;
const FALLBACK_LON = 4.9041;

// ── Hoofd-render ───────────────────────────────────────────
export async function renderHome(el) {
  el.innerHTML = buildSkeleton();
  initSlideshow(el);
  loadStats(el);
  loadSunInfo(el);
  loadWeather(el);
  loadRecentSightings(el);
  loadMonthlyChart(el);
  loadHotspotsMap(el);
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

      <div class="app-header__search">
        <svg class="app-header__search-icon" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="app-header__search-input" type="search"
               id="homeSearch" placeholder="Zoek soort of locatie…"
               aria-label="Zoek soort of locatie">
      </div>

      <button class="app-header__avatar" aria-label="Profiel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      </button>
    </header>

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
        <button class="section-head__link" id="allSightingsBtn" aria-label="Alle waarnemingen">
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

async function initSlideshow(el) {
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

  const inner = el.querySelector('#slideshowInner');
  const dots  = el.querySelector('#slideshowDots');
  if (!inner) return;
  if (_slides.length === 0) return;

  inner.innerHTML = '';
  dots.innerHTML  = '';
  _slideIndex = 0;

  _slides.forEach((photo, i) => {
    const url = getPhotoUrl(photo);
    if (!url) return; // sla over als geen bruikbare blob
    _slideshowUrls.push(url);

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
    dot.addEventListener('click', () => goToSlide(i, inner, dots));
    dots.appendChild(dot);
  });

  // Als na filtering geen slides met blob overbleven: toon lege state
  if (inner.querySelectorAll('.slideshow__slide').length === 0) return;

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
    const sightings  = await getSightings();
    const speciesSet = new Set(sightings.map(s => s.speciesId));
    const photoCount = sightings.reduce((n, s) => n + (s.photoIds?.length || 0), 0);
    const locSet     = new Set(sightings.map(s => s.locationName).filter(Boolean));

    setStatVal(el, 'stat-species', speciesSet.size);
    setStatVal(el, 'stat-total',   sightings.length);
    setStatVal(el, 'stat-photos',  photoCount);
    setStatVal(el, 'stat-hotspot', locSet.size);
  } catch (_) {
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
async function loadSunInfo(el) {
  const section = el.querySelector('#sunSection');
  if (!section) return;

  const { lat, lon } = await getLocation();
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

  const loader = section.querySelector('.dash-section__loading');

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
          <div class="weather-tip">${weatherBirdTip(code, c.wind_speed_10m)}</div>
        </div>
      `;
    }
  } catch (_) {
    if (loader) loader.outerHTML = `<div class="dash-section__error">Weer niet beschikbaar</div>`;
  }
}

function weatherBirdTip(code, wind) {
  if (code === 0 || code === 1) {
    if (wind < 3) return '🐦 Ideale omstandigheden — weinig wind, helder licht';
    if (wind < 6) return '🐦 Goed vogelweer — let op beweging in bomen';
    return '🐦 Helder maar winderig — vogels zoeken beschutting';
  }
  if (code === 2 || code === 3) return '🐦 Bewolking dempt licht — ISO omhoog';
  if (code >= 61 && code <= 65) return '🌧 Regen — vogels minder actief';
  if (code >= 80 && code <= 82) return '🌦 Buiig — actief voor en na bui';
  if (code >= 95) return '⛈ Onweer — niet aanbevolen';
  return '📷 Check licht voor vertrek';
}

// ══════════════════════════════════════════════════════════
// RECENTE WAARNEMINGEN — met foto-thumbnail + badge
// ══════════════════════════════════════════════════════════
async function loadRecentSightings(el) {
  const listEl = el.querySelector('#recentList');
  if (!listEl) return;

  try {
    const all = await getSightings();
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
    const items = await Promise.all(recent.map(s => buildRecentItem(s)));
    listEl.innerHTML = items.join('');

  } catch (_) {
    listEl.innerHTML = `<div class="dash-section__error" style="padding:var(--space-12);background:var(--surface);border-radius:var(--r-card)">Waarnemingen niet beschikbaar</div>`;
  }
}

async function buildRecentItem(s) {
  let thumbHtml = '';
  let thumbUrl  = null;

  // Probeer eerste foto-thumbnail te laden
  if (s.photoIds?.length) {
    try {
      const db = await getDB();
      const tx = db.transaction('photos', 'readonly');
      const photo = await txGet(tx.objectStore('photos'), s.photoIds[0]);
      thumbUrl = getPhotoUrl(photo);
      if (thumbUrl) {
        thumbHtml = `<img src="${thumbUrl}" alt="${s.speciesName || ''}" loading="lazy">`;
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

  // Intrekken na gebruik — de <img> heeft de data al geladen via src
  if (thumbUrl) revokePhotoUrl(thumbUrl);

  return html;
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
async function loadMonthlyChart(el) {
  const section = el.querySelector('#monthlySection');
  if (!section) return;
  const loader = section.querySelector('.dash-section__loading');

  try {
    const sightings = await getSightings();

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

    const maxCount = Math.max(...months.map(m => m.count), 1);

    if (maxCount === 0 && sightings.length === 0) {
      if (loader) loader.outerHTML = `<div class="chart-empty">Nog geen waarnemingen om te tonen</div>`;
      return;
    }

    // SVG-afmetingen
    const W = 320, H = 120, PAD_L = 24, PAD_B = 20, PAD_T = 8, PAD_R = 8;
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

    if (loader) loader.outerHTML = `<div class="chart-wrap">${svg}</div>`;

  } catch (_) {
    if (loader) loader.outerHTML = `<div class="dash-section__error">Grafiek niet beschikbaar</div>`;
  }
}

// ══════════════════════════════════════════════════════════
// HOTSPOTS MINIMAP  (native SVG, alleen werkelijke GPS-data)
// ══════════════════════════════════════════════════════════
async function loadHotspotsMap(el) {
  const section = el.querySelector('#hotspotsSection');
  if (!section) return;
  const loader = section.querySelector('.dash-section__loading');

  try {
    const sightings = await getSightings();

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

    if (loader) loader.outerHTML = `<div class="hotspot-wrap">${svg}</div>`;

  } catch (_) {
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
  return `
    <div class="stat-tile" id="${id}">
      <div class="stat-tile__icon">${iconSvg}</div>
      <div class="stat-tile__value">${value}</div>
      <div class="stat-tile__label">${label}</div>
    </div>
  `;
}
