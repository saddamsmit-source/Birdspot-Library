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

      <div class="map-toolbar">
        <span class="map-toolbar__title">Kaart</span>
        <span class="map-toolbar__count" id="mapCount">laden…</span>
      </div>

      <button class="map-locate-btn" id="mapLocateBtn" aria-label="Centreer op mijn locatie">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        </svg>
      </button>

      <button class="map-add-pin-btn" id="mapAddPinBtn" type="button" aria-pressed="false">+ Pin waarneming</button>
      <div class="map-pin-instruction" id="mapPinInstruction" hidden>⌖ Tik op een vrije plek op de kaart om een waarneming vast te leggen.</div>
      <section class="bird-map-filters" aria-label="Zoek en filter vogelwaarnemingen">
        <div class="bird-map-filter-head">
          <label for="mapSpeciesSearch">Zoek vogelsoort</label>
          <button type="button" id="mapClearFilters" hidden>Wis filters</button>
        </div>
        <input type="search" id="mapSpeciesSearch" list="mapSpeciesSuggestions"
          placeholder="Bijv. Koolmees" autocomplete="off" aria-describedby="mapFilterFeedback">
        <datalist id="mapSpeciesSuggestions"></datalist>
        <div class="bird-map-filter-scroll" role="group" aria-label="Waarnemingswijze">
          <button type="button" class="is-active" data-map-status="all" aria-pressed="true">Alle <span id="mapStatusAllCount"></span></button>
          ${MAP_ORDER.map(key=>`<button type="button" data-map-status="${key}" aria-pressed="false">
            <span class="bird-map-filter-dot bird-map-dot--${key}" aria-hidden="true"></span>
            ${MAP_STATUS[key].label}<span data-map-status-count="${key}"></span></button>`).join('')}
        </div>
        <p class="bird-map-filter-feedback" id="mapFilterFeedback" role="status" aria-live="polite">Alle waarnemingen met een pin</p>
      </section>
      <!-- Signature Explorer card: deliberately separate from Leaflet controls -->
      <aside class="signature-explorer-strip" aria-label="Bird Explorer overzicht">
        <span class="signature-kicker">EXPEDITION / DISCOVER</span>
        <h2>Bird Explorer Map</h2>
        <p>Ontdek jouw eigen vogelplekken. Tik op een marker voor een waarneming of open je volledige logboek.</p>
        <button class="signature-explorer-open" id="explorerSightingsBtn" type="button">Mijn waarnemingen bekijken <span aria-hidden="true">↗</span></button>
      </aside>

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
export function ensureLeaflet() {
  if (_leafletReady) return Promise.resolve();

  return new Promise((resolve, reject) => {
    // Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css`;
      document.head.appendChild(link);
    }
    // MarkerCluster CSS
    if (!document.getElementById('cluster-css')) {
      const link = document.createElement('link');
      link.id   = 'cluster-css';
      link.rel  = 'stylesheet';
      link.href = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${CLUSTER_VERSION}/MarkerCluster.Default.css`;
      document.head.appendChild(link);
    }

    // Leaflet JS
    if (window.L) {
      _leafletReady = true;
      resolve();
      return;
    }

    const leafletScript = document.createElement('script');
    leafletScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js`;
    leafletScript.onload = () => {
      // MarkerCluster JS na Leaflet
      const clusterScript = document.createElement('script');
      clusterScript.src = `https://cdnjs.cloudflare.com/ajax/libs/leaflet.markercluster/${CLUSTER_VERSION}/leaflet.markercluster.min.js`;
      clusterScript.onload = () => {
        _leafletReady = true;
        resolve();
      };
      clusterScript.onerror = reject;
      document.head.appendChild(clusterScript);
    };
    leafletScript.onerror = reject;
    document.head.appendChild(leafletScript);
  });
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
    screenEl.querySelectorAll('[data-map-status]').forEach(button=>{
      const selected=button.dataset.mapStatus===filterState.status;
      button.classList.toggle('is-active',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    screenEl.querySelector('#mapStatusAllCount').textContent='('+speciesMatches.length+')';
    for(const key of MAP_ORDER){
      const node=screenEl.querySelector('[data-map-status-count="'+key+'"]');
      if(node)node.textContent='('+counts[key]+')';
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
  speciesSearch.addEventListener('input',e=>{
    filterState.speciesSearch=e.target.value.trim();applyFilters();
  });
  screenEl.querySelector('.bird-map-filter-scroll').addEventListener('click',e=>{
    const button=e.target.closest('[data-map-status]');
    if(!button)return;
    filterState.status=button.dataset.mapStatus;applyFilters();
  });
  clearFilters.addEventListener('click',()=>{
    filterState.speciesSearch='';filterState.status='all';speciesSearch.value='';
    applyFilters();speciesSearch.focus();
  });
  applyFilters();

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
    zoomControl:        false,
    attributionControl: false,
  });
  _mapInstance = map;

  // Tiles
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:     19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Attributie rechtsonder (compact)
  window.L.control.attribution({ position: 'bottomright', prefix: false })
    .addTo(map);

  // Zoom-knoppen rechtsboven
  window.L.control.zoom({ position: 'topright' }).addTo(map);

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

  // Explicit map-pin mode: do not create accidental sightings on normal taps.
  const addPinBtn = screenEl.querySelector('#mapAddPinBtn');
  const pinInstruction = screenEl.querySelector('#mapPinInstruction');
  let placing = false;
  const stopPlacing = () => {
    placing=false;
    addPinBtn?.setAttribute('aria-pressed','false');
    addPinBtn?.classList.remove('is-active');
    if(addPinBtn)addPinBtn.textContent="+ Pin waarneming";
    if(pinInstruction)pinInstruction.hidden=true;
    mapEl.classList.remove("is-pinning");
  };
  const startObservation = (lat,lon) => {
    if(!validPin(lat,lon))return;
    stopPlacing();
    openAddSheet({initial:{lat:Number(lat),lon:Number(lon)},
      onSaved:()=>import("../../app.js").then(({navigate})=>navigate("map",{force:true}))});
  };
  addPinBtn?.addEventListener("click",()=>{
    if(!leafletOk || !map){
      openPinPicker({onConfirm:coords=>startObservation(coords.lat,coords.lon)});
      return;
    }
    placing=!placing;
    addPinBtn.setAttribute('aria-pressed',String(placing));
    addPinBtn.classList.toggle('is-active',placing);
    addPinBtn.textContent=placing?"Annuleer pin": "+ Pin waarneming";
    pinInstruction.hidden=!placing;
    mapEl.classList.toggle("is-pinning",placing);
  });
  if(map)map.on("click",event=>{
    if(placing)startObservation(event.latlng.lat,event.latlng.lng);
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
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1 });
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
    <p>Geen waarnemingen met GPS gevonden.<br>
    Tik op + Pin waarneming of kies een pin in het invoerformulier.</p>`;
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
  const summary=MAP_ORDER.filter(key=>counts[key]>0)
    .map(key=>'<span class="bird-cluster-count bird-cluster-count--'+key+'">'+counts[key]+'</span>').join('');
  return window.L.divIcon({
    html:'<div class="bird-cluster-ring" role="img" aria-label="'+label+'" title="'+label+'"'+
      ' style="background:'+clusterGradient(counts)+'">'+
      '<div class="bird-cluster-core"><strong>'+n+'</strong></div></div>',
    className:'bird-cluster-wrapper',
    iconSize:[size,size],
    iconAnchor:[size/2,size/2],
  });
}
