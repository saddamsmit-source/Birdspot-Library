/**
 * Kaart — Stap 6
 *
 * - Leaflet.js + MarkerCluster (CDN, online-only tot Stap 7)
 * - Elke waarneming = eigen pin (lat/lon aanwezig)
 * - Clustering bij uitzoomen
 * - Tik op pin → detail bottom sheet
 * - Waarnemingen zonder GPS worden genegeerd op de kaart
 * - Geen onnodige re-init bij terugkeren naar het scherm
 */

import { getSightings }    from '../../data/sightings.js';
import { SPECIES }         from '../../data/species.js';
import { openDetailSheet } from '../sightings/detailSheet.js';
import { openAddSheet } from '../sightings/addSheet.js';
import { openPinPicker } from '../sightings/pinPicker.js';
import { methodLabel, sourceLabel, validPin } from '../sightings/evidence.js';
import { MAP_STATUS, MAP_ORDER, statusForSighting, filteredSightings, statusCounts, statusCountLabel, clusterGradient } from './visualization.js';
import { escHtml } from '../../utils/html.js';
import { centerPinMarkup, attachBaseLayers, pinAccuracyM, accuracyLabel, coordLabel, MAX_PIN_ACCURACY_M, LAYERS } from './centerPin.js';

// Leaflet + MarkerCluster worden lazy geladen via <script> tags die we
// eenmalig in de <head> injecteren zodra de kaart-view voor het eerst
// gerenderd wordt. Na laden pas initialiseren.

const LEAFLET_VERSION   = '1.9.4';
const CLUSTER_VERSION   = '1.5.3';

let _leafletReady = false;  // true zodra L + MarkerCluster beschikbaar zijn
let _mapInstance  = null;   // L.map referentie (hergebruikt bij terugkeren)
let _clusterLayer = null;   // MarkerCluster laag

// ── Entry point ────────────────────────────────────────────────
export function renderMap(el) {
  el.innerHTML = `
    <div class="map-screen signature-map-loading" id="mapScreen">
      <div id="leafletMap"></div>

      <!-- K1: één smalle balk; de kaart krijgt de rest van het scherm -->
      <header class="map-topbar">
        <label class="map-search" for="mapSpeciesSearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input type="search" id="mapSpeciesSearch" list="mapSpeciesSuggestions"
            placeholder="Zoek soort op de kaart" autocomplete="off" aria-describedby="mapFilterFeedback">
        </label>
        <datalist id="mapSpeciesSuggestions"></datalist>
        <button type="button" class="map-icon-btn" id="mapFilterBtn" aria-label="Filters" aria-expanded="false" aria-controls="mapFilterPanel">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
          <span class="map-filter-dot" id="mapFilterDot" hidden></span>
        </button>
        <button type="button" class="map-icon-btn" id="explorerSightingsBtn" aria-label="Mijn waarnemingen als lijst">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/></svg>
        </button>
      </header>
      <span class="map-toolbar__count" id="mapCount">laden…</span>

      <section class="bird-map-filters" id="mapFilterPanel" aria-label="Filter vogelwaarnemingen" hidden>
        <div class="bird-map-filter-head">
          <label class="bird-map-dropdown-label" for="mapStatusSelect">Gezien of gehoord</label>
          <button type="button" id="mapClearFilters" hidden>Wis filters</button>
        </div>
        <div class="bird-map-dropdown-wrap">
          <span id="mapStatusIndicator" class="bird-map-dropdown-dot bird-map-dot--all" aria-hidden="true"></span>
          <select id="mapStatusSelect" class="bird-map-dropdown"
            aria-label="Filter op gezien, gehoord of Merlin Sound ID"
            aria-describedby="mapFilterFeedback">
            <option value="all">Alle waarnemingen (0)</option>
            ${MAP_ORDER.map(key=>`<option value="${key}">${MAP_STATUS[key].label} (0)</option>`).join('')}
          </select>
          <span class="bird-map-dropdown-chevron" aria-hidden="true">⌄</span>
        </div>
        <p class="bird-map-filter-feedback" id="mapFilterFeedback" role="status" aria-live="polite">Alle waarnemingen met een pin</p>
      </section>

      <div class="map-side-controls">
        <button type="button" class="map-icon-btn map-layer-btn" id="mapLayerBtn" aria-label="Wissel kaart en luchtfoto" aria-pressed="false">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>
          <span id="mapLayerLabel">Luchtfoto</span>
        </button>
        <button type="button" class="map-icon-btn map-locate-btn" id="mapLocateBtn" aria-label="Centreer op mijn locatie">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        </button>
      </div>

      <button class="map-add-pin-btn" id="mapAddPinBtn" type="button" aria-pressed="false">+ Pin waarneming</button>

      <!-- K2: vaste pin in het midden; schuif en zoom de kaart eronder -->
      ${centerPinMarkup()}
      <div class="map-pin-panel" id="mapPinPanel" role="region" aria-label="Pin plaatsen" hidden>
        <p class="map-pin-panel__hint" id="mapPinHint">Schuif en zoom de kaart tot de pin op de juiste plek staat.</p>
        <p class="map-pin-panel__coords"><span id="mapPinCoords">—</span> <b id="mapPinAccuracy"></b></p>
        <div class="map-pin-panel__actions">
          <button type="button" class="map-pin-cancel" id="mapPinCancel">Annuleer</button>
          <button type="button" class="map-pin-confirm" id="mapPinConfirm" disabled>Plaats hier</button>
        </div>
      </div>

      <div class="sheet-overlay" id="mapOverlay"></div>

      <div class="bottom-sheet" id="mapDetailSheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header" id="mapSheetHeader">
          <div class="sheet-header__icon" id="mapSheetIcon">🐦</div>
          <div>
            <div class="sheet-header__name" id="mapSheetName">—</div>
            <div class="sheet-header__meta" id="mapSheetMeta">—</div>
          </div>
        </div>
        <div class="sheet-body" id="mapSheetBody"></div>
        <div class="sheet-footer">
          <button class="sheet-close-btn" id="mapSheetClose">Sluiten</button>
        </div>
      </div>
    </div>`;

  el.querySelector("#explorerSightingsBtn")?.addEventListener("click", () => {
    import("../../app.js").then(({ navigate }) => navigate("sightings"));
  });

  // De kaart blijft functioneel bij traag/offline CDN; geen oneindige spinner.
  // Synchronisch cleanup-contract voor de bestaande router.
  let destroyed = false;
  const load = async () => {
    let leafletOk = false;
    try {
      await Promise.race([
        ensureLeaflet(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Map CDN timeout')), 6500)),
      ]);
      leafletOk = true;
    } catch (_) {
      // Graceful degradation: eigen locaties/empty states blijven toegankelijk.
    }
    if (destroyed || !el.isConnected) return;
    try {
      const sightings = await getSightings();
      if (destroyed || !el.isConnected) return;
      initMap(el, sightings, leafletOk);
    } finally {
      if (!destroyed && el.isConnected) {
        el.querySelector('#mapScreen')?.classList.remove('signature-map-loading');
      }
    }
  };
  load().catch(() => {
    if (!destroyed && el.isConnected) {
      el.querySelector('#mapScreen')?.classList.remove('signature-map-loading');
      const notice = document.createElement('p');
      notice.className = 'map-offline-notice';
      notice.textContent = 'Kaartgegevens konden niet geladen worden';
      el.querySelector('#leafletMap')?.appendChild(notice);
    }
  });

  return () => {
    destroyed = true;
    if (_mapInstance) {
      _mapInstance.remove();
      _mapInstance = null;
      _clusterLayer = null;
    }
  };
}

// ── Leaflet lazy loader ────────────────────────────────────────
let _leafletLoadPromise = null;
// One shared loader for Explorer Map and the manual pin picker.
// A bare window.L is insufficient; MarkerCluster must also be present.
export function ensureLeaflet() {
  if(window.L?.markerClusterGroup) {
    _leafletReady=true;
    return Promise.resolve();
  }
  if(_leafletLoadPromise) return _leafletLoadPromise;

  function styleOnce(id,url) {
    if(document.getElementById(id)) return;
    const link=document.createElement('link');
    link.id=id;link.rel='stylesheet';link.href=url;
    document.head.appendChild(link);
  }
  function scriptOnce(id,url) {
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing?.dataset.loaded==='true') return resolve();
      const script=existing||document.createElement('script');
      function loaded() {
        script.dataset.loaded='true';
        resolve();
      }
      function failed() {
        script.remove();
        reject(new Error('Kaartbibliotheek kon niet worden geladen'));
      }
      script.addEventListener('load',loaded,{once:true});
      script.addEventListener('error',failed,{once:true});
      if(!existing) {
        script.id=id;script.src=url;document.head.appendChild(script);
      }
    });
  }
  styleOnce('leaflet-css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/'+LEAFLET_VERSION+'/leaflet.min.css');
  styleOnce('cluster-css','https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/'+CLUSTER_VERSION+'/MarkerCluster.Default.css');
  _leafletLoadPromise=(async()=>{
    if(!window.L)await scriptOnce('birdspot-leaflet-js',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/'+LEAFLET_VERSION+'/leaflet.min.js');
    if(!window.L)throw new Error('Leaflet niet beschikbaar');
    if(!window.L.markerClusterGroup)await scriptOnce('birdspot-cluster-js',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/'+CLUSTER_VERSION+'/leaflet.markercluster.min.js');
    if(!window.L.markerClusterGroup)throw new Error('MarkerCluster niet beschikbaar');
    _leafletReady=true;
  })().catch(error=>{
    _leafletReady=false;
    _leafletLoadPromise=null;
    throw error;
  });
  return _leafletLoadPromise;
}

// ── Kaart initialiseren ────────────────────────────────────────
function initMap(screenEl, sightings, leafletOk = true) {
  const mapEl = screenEl.querySelector('#leafletMap');
  if (!mapEl) return;

  // Verwijder vorige instantie als het scherm herlaadt
  if (_mapInstance) {
    _mapInstance.remove();
    _mapInstance  = null;
    _clusterLayer = null;
  }

  const geoSightings = sightings.filter(s => validPin(s.lat,s.lon));
  const speciesSearch = screenEl.querySelector('#mapSpeciesSearch');
  const clearFilters = screenEl.querySelector('#mapClearFilters');
  const feedback = screenEl.querySelector('#mapFilterFeedback');
  const countEl = screenEl.querySelector('#mapCount');
  const filterState = {speciesSearch:'',status:'all'};
  let updateMapMarkers=()=>{};

  // Only species with an actual geolocated observation appear as suggestions.
  const suggestions = screenEl.querySelector('#mapSpeciesSuggestions');
  const names=[...new Set(geoSightings.map(s=>s.speciesName).filter(n=>typeof n==='string'&&n.trim()))]
    .sort((a,b)=>a.localeCompare(b,'nl'));
  for(const name of names) {
    const option=document.createElement('option');option.value=name;suggestions.appendChild(option);
  }

  function applyFilters(){
    const matches=filteredSightings(geoSightings,filterState,SPECIES);
    const speciesMatches=filteredSightings(geoSightings,{speciesSearch:filterState.speciesSearch},SPECIES);
    const counts=statusCounts(speciesMatches);
    const filtered=(filterState.status!=='all'||!!filterState.speciesSearch);
    screenEl.querySelector('#mapScreen')?.classList.toggle('has-active-filters',filtered);
    clearFilters.hidden=!filtered;
    const dotEl=screenEl.querySelector('#mapFilterDot');
    if(dotEl)dotEl.hidden=filterState.status==='all';
    // One native dropdown avoids horizontal overflow on narrow phones.
    // Counts are recalculated from the currently searched species, not from
    // unrelated observations or records without pins.
    const select=screenEl.querySelector('#mapStatusSelect');
    const dot=screenEl.querySelector('#mapStatusIndicator');
    select.value=filterState.status;
    dot.className='bird-map-dropdown-dot bird-map-dot--'+filterState.status;
    select.querySelector('option[value="all"]').textContent='Alle waarnemingen ('+speciesMatches.length+')';
    const optionSymbols={seen:'●',merlin:'♫',both:'◉',heard:'♪',unknown:'?'};
    for(const key of MAP_ORDER){
      const option=select.querySelector('option[value="'+key+'"]');
      if(option)option.textContent=optionSymbols[key]+' '+MAP_STATUS[key].label+' ('+counts[key]+')';
    }
    const number=matches.length,total=geoSightings.length;
    if(countEl)countEl.textContent=filtered
      ? number+' van '+total+' pins'
      : (total===sightings.length?total+' '+(total===1?'pin':'pins'):total+' van '+sightings.length+' pins');
    feedback.textContent=filtered
      ? (number===0?'Geen waarnemingen met pin voor deze filters':
         number+' '+(number===1?'waarneming':'waarnemingen')+' op de kaart')+
        (filterState.speciesSearch?' · '+filterState.speciesSearch:'')
      : total+' '+(total===1?'waarneming met pin':'waarnemingen met pin');
    updateMapMarkers(matches);
  }
  // Voorinvulling vanuit soortdetail ("Toon op de kaart"); eenmalig.
  try {
    const preset=sessionStorage.getItem('birdspot-map-species');
    if(preset){ sessionStorage.removeItem('birdspot-map-species'); speciesSearch.value=preset; filterState.speciesSearch=preset; }
  } catch(_) {}
  speciesSearch.addEventListener('input',e=>{
    filterState.speciesSearch=e.target.value.trim();applyFilters();
  });
  screenEl.querySelector('#mapStatusSelect').addEventListener('change',e=>{
    filterState.status=e.target.value;
    applyFilters();
  });
  clearFilters.addEventListener('click',()=>{
    filterState.speciesSearch='';filterState.status='all';speciesSearch.value='';
    applyFilters();speciesSearch.focus();
  });
  applyFilters();

  // Filterpaneel opent onder de balk en sluit bij tik op de kaart
  const filterBtn=screenEl.querySelector('#mapFilterBtn');
  const filterPanel=screenEl.querySelector('#mapFilterPanel');
  const setFilterOpen=open=>{filterPanel.hidden=!open;filterBtn.setAttribute('aria-expanded',String(open));};
  filterBtn.addEventListener('click',()=>setFilterOpen(filterPanel.hidden));
  mapEl.addEventListener('pointerdown',()=>setFilterOpen(false));

  // Lege state — altijd tonen als er geen GPS-waarnemingen zijn
  if (!geoSightings.length) showNoGpsState(screenEl);

  // Locatie-knop — ook zonder kaart tonen
  const locBtn = screenEl.querySelector('#mapLocateBtn');
  if (locBtn && leafletOk) {
    // handler wordt gekoppeld nadat map aangemaakt is (zie hieronder)
  }

  // Zonder Leaflet: geen kaart, wel teller + lege state + knop
  if (!leafletOk) {
    mapEl.classList.add('signature-map-offline');
    const notice = document.createElement('div');
    notice.className = 'map-offline-notice';
    notice.textContent = 'Kaart niet beschikbaar (offline)';
    mapEl.appendChild(notice);
    screenEl.querySelector('#mapAddPinBtn')?.addEventListener('click',()=>{
      openPinPicker({onConfirm:coords=>openAddSheet({initial:coords,
        onSaved:()=>import('../../app.js').then(({navigate})=>navigate('map',{force:true}))})});
    });
    return;
  }

  // Bepaal beginpositie: gemiddelde van waarnemingen met GPS, anders NL centrum
  const center = geoSightings.length
    ? averageCenter(geoSightings)
    : [52.15, 5.30];
  const zoom = geoSightings.length > 0 ? 8 : 7;

  const map = window.L.map(mapEl, {
    center,
    zoom,
    maxZoom:            21,
    zoomControl:        false,   // knijpen/scrollen; geen knoppen die de kaart bedekken (K1)
    attributionControl: false,
  });
  _mapInstance = map;

  // Kaart of luchtfoto (PDOK), keuze wordt onthouden
  const layerBtn = screenEl.querySelector('#mapLayerBtn');
  const toggleLayer = attachBaseLayers(map, window.L, current => {
    layerBtn?.setAttribute('aria-pressed', String(current === 'luchtfoto'));
    const label = screenEl.querySelector('#mapLayerLabel');
    if (label) label.textContent = current === 'luchtfoto' ? LAYERS.kaart.label : LAYERS.luchtfoto.label;
  });
  layerBtn?.addEventListener('click', () => toggleLayer());

  // Attributie rechtsonder (compact)
  window.L.control.attribution({ position: 'bottomright', prefix: false })
    .addTo(map);

  // Cluster laag
  _clusterLayer = window.L.markerClusterGroup({
    maxClusterRadius: zoom => zoom < 8 ? 75 : zoom < 12 ? 52 : zoom < 16 ? 34 : 23,
    spiderfyOnMaxZoom: true,
    zoomToBoundsOnClick: true,
    showCoverageOnHover: false,
    iconCreateFunction:  makeClusterIcon,
  });

  // Build one marker per saved observation; never aggregate or modify records.
  const markers=geoSightings.map(s => {
    const sp   = SPECIES.find(x => x.id === s.speciesId);
    const icon = sp?.icon || '🐦';
    const status=statusForSighting(s);
    const marker = window.L.marker([Number(s.lat), Number(s.lon)], {
      icon: makeBirdIcon(icon,status,s.speciesName),
      title: s.speciesName + ' · ' + MAP_STATUS[status].label,
    });
    marker.birdspotRecord=s;
    marker.on('click', () => openSightingSheet(screenEl, s, map));
    return marker;
  });

  map.addLayer(_clusterLayer);
  updateMapMarkers=(matches)=>{
    const selectedIds=new Set(matches.map(s=>s.id));
    _clusterLayer.clearLayers();
    _clusterLayer.addLayers(markers.filter(marker=>selectedIds.has(marker.birdspotRecord.id)));
  };
  applyFilters();

  // K2: pin plaatsen met een vaste pin in het midden. Een gewone tik maakt nooit een waarneming.
  const addPinBtn = screenEl.querySelector('#mapAddPinBtn');
  const pinPanel = screenEl.querySelector('#mapPinPanel');
  const centerPin = screenEl.querySelector('#mapCenterPin');
  const pinCoords = screenEl.querySelector('#mapPinCoords');
  const pinAcc = screenEl.querySelector('#mapPinAccuracy');
  const pinHint = screenEl.querySelector('#mapPinHint');
  const pinConfirm = screenEl.querySelector('#mapPinConfirm');
  let placing = false;
  const updatePin = () => {
    if (!placing) return;
    const c = map.getCenter();
    const acc = pinAccuracyM(c.lat, map.getZoom());
    const ok = acc <= MAX_PIN_ACCURACY_M;
    pinCoords.textContent = coordLabel(c.lat, c.lng);
    pinAcc.textContent = accuracyLabel(acc);
    pinAcc.classList.toggle('is-ok', ok);
    pinConfirm.disabled = !ok;
    pinHint.textContent = ok
      ? 'Schuif en zoom tot de pin precies goed staat.'
      : 'Zoom verder in om nauwkeurig te pinnen.';
  };
  const setPlacing = on => {
    placing = on;
    screenEl.querySelector('#mapScreen')?.classList.toggle('is-pinning', on);
    centerPin.hidden = !on;
    pinPanel.hidden = !on;
    addPinBtn.hidden = on;
    addPinBtn.setAttribute('aria-pressed', String(on));
    if (on) { screenEl.querySelector('#mapFilterPanel').hidden = true; updatePin(); }
  };
  map.on('move', updatePin);
  map.on('zoomend', updatePin);
  addPinBtn?.addEventListener('click', () => setPlacing(true));
  screenEl.querySelector('#mapPinCancel')?.addEventListener('click', () => setPlacing(false));
  pinConfirm?.addEventListener('click', () => {
    const c = map.getCenter();
    const acc = pinAccuracyM(c.lat, map.getZoom());
    if (!validPin(c.lat, c.lng) || acc > MAX_PIN_ACCURACY_M) return;
    setPlacing(false);
    openAddSheet({ initial: { lat: c.lat, lon: c.lng, pinAccuracyM: acc },
      onSaved: () => import('../../app.js').then(({ navigate }) => navigate('map', { force: true })) });
  });
  // Locatie-knop koppelen
  if (locBtn) {
    locBtn.addEventListener('click', () => centerOnUser(map, locBtn));
  }
}

// ── Sighting detail sheet ──────────────────────────────────────
function openSightingSheet(screenEl, sighting, map) {
  const sp       = SPECIES.find(x => x.id === sighting.speciesId);
  const icon     = sp?.icon || '🐦';
  const sheet    = screenEl.querySelector('#mapDetailSheet');
  const overlay  = screenEl.querySelector('#mapOverlay');
  const closeBtn = screenEl.querySelector('#mapSheetClose');

  screenEl.querySelector('#mapSheetIcon').textContent = icon;
  screenEl.querySelector('#mapSheetName').textContent = sighting.speciesName;
  screenEl.querySelector('#mapSheetMeta').textContent =
    [fmtDate(sighting.date), sighting.locationName].filter(Boolean).join(' · ');

  const body = screenEl.querySelector('#mapSheetBody');
  body.innerHTML = '';

  // Registration evidence: visually seen, heard and Merlin suggestions stay distinct.
  const evidence=document.createElement('p');
  evidence.className='map-sheet-evidence';
  evidence.textContent=methodLabel(sighting)+(sighting.identificationSource==='merlin'?' · '+sourceLabel(sighting):'');
  body.appendChild(evidence);

  // Notitie
  if (sighting.notes) {
    const p = document.createElement('p');
    p.className = 'map-sheet-note';
    p.textContent = sighting.notes;
    body.appendChild(p);
  }

  // GPS-coördinaten
  if (validPin(sighting.lat,sighting.lon)) {
    const coords = document.createElement('p');
    coords.className = 'map-sheet-coords';
    coords.textContent =
      `${Number(sighting.lat).toFixed(4)}°, ${Number(sighting.lon).toFixed(4)}°`;
    body.appendChild(coords);
  }

  // Knop → open volledige detail sheet (via sightings module)
  const detailBtn = document.createElement('button');
  detailBtn.className = 'map-sheet-detail-btn';
  detailBtn.textContent = 'Volledige waarneming bekijken →';
  detailBtn.addEventListener('click', () => {
    closeSheet();
    openDetailSheet(sighting, {
      onDeleted: () => {
        // Herlaad kaart via navigate
        import('../../app.js').then(({ navigate }) => navigate('map', { force: true }));
      },
    });
  });
  body.appendChild(detailBtn);

  // Pan kaart zodat marker boven sheet uitsteekt
  map.panTo([sighting.lat, sighting.lon], { animate: true, duration: 0.4 });

  sheet.classList.add('open');
  overlay.classList.add('visible');

  function closeSheet() {
    sheet.classList.remove('open');
    overlay.classList.remove('visible');
  }

  closeBtn.onclick  = closeSheet;
  overlay.onclick   = closeSheet;
}

// ── Locatie ────────────────────────────────────────────────────
function centerOnUser(map, btn) {
  if (!navigator.geolocation) return;
  btn.classList.add('map-locate-btn--loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      btn.classList.remove('map-locate-btn--loading');
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 17, { duration: 1 });
    },
    () => btn.classList.remove('map-locate-btn--loading'),
    { timeout: 10000, maximumAge: 60000 },
  );
}

// ── Lege state (geen GPS) ──────────────────────────────────────
function showNoGpsState(screenEl) {
  const mapEl = screenEl.querySelector('#leafletMap');
  const notice = document.createElement('div');
  notice.className = 'map-no-gps';
  notice.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
      style="width:36px;height:36px;opacity:.4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
    <p>Nog geen waarnemingen met een pin.<br>
    Tik op <b>+ Pin waarneming</b> en schuif de kaart onder de pin.</p>`;
  mapEl.appendChild(notice);
}

// ── Helpers ────────────────────────────────────────────────────
function averageCenter(sightings) {
  const lat = sightings.reduce((s, x) => s + x.lat, 0) / sightings.length;
  const lon = sightings.reduce((s, x) => s + x.lon, 0) / sightings.length;
  return [lat, lon];
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso + 'T12:00:00').toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function makeBirdIcon(emoji,status,speciesName) {
  const style=MAP_STATUS[status]||MAP_STATUS.unknown;
  const description=escHtml((speciesName||'Vogelwaarneming')+' · '+style.label);
  return window.L.divIcon({
    html:'<div class="bird-pin bird-pin--status-'+status+'" role="img" aria-label="'+description+'">'+
      '<span class="bird-pin-icon" aria-hidden="true">'+emoji+'</span>'+
      '<span class="bird-pin-method" aria-hidden="true">'+style.symbol+'</span></div>',
    className:'',
    iconSize:[42,42],
    iconAnchor:[21,21],
  });
}

function makeClusterIcon(cluster) {
  const children=cluster.getAllChildMarkers();
  const counts=statusCounts(children.map(m=>m.birdspotRecord).filter(Boolean));
  const n=children.length;
  const label=escHtml(n+' waarnemingen: '+statusCountLabel(counts));
  const size=n<5?46:n<20?54:62;
  return window.L.divIcon({
    html:'<div class="bird-cluster-ring" role="img" aria-label="'+label+'" title="'+label+'"'+
      ' style="background:'+clusterGradient(counts)+'">'+
      '<div class="bird-cluster-core"><strong>'+n+'</strong></div></div>',
    className:'bird-cluster-wrapper',
    iconSize:[size,size],
    iconAnchor:[size/2,size/2],
  });
}
