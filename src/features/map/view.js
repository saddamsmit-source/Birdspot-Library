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
import { placeStatus, MAP_STATUS, MAP_ORDER, statusForSighting, filteredSightings, statusCounts, statusCountLabel, clusterGradient } from './visualization.js';
import { escHtml } from '../../utils/html.js';
import { ensurePlaces, loadPlaces, placeStats, renamePlace } from '../../data/places.js';
import { savePhoto, getMediaByPlace } from '../../data/db.js';
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
export function renderMap(el, selection) {
  el.innerHTML = `
    <div class="map-screen signature-map-loading" id="mapScreen">
      <div id="leafletMap"></div>

      <!-- K1: één smalle balk; de kaart krijgt de rest van het scherm -->
      <header class="map-topbar">
        <label class="map-search" for="mapSpeciesSearch">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
          <input type="search" id="mapSpeciesSearch" list="mapSpeciesSuggestions"
            placeholder="Zoek vogel of plek" autocomplete="off" aria-describedby="mapFilterFeedback"
            aria-controls="mapSearchResults">
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
      <div class="map-meta">
        <span class="map-toolbar__count" id="mapCount">laden…</span>
        <div class="map-legend" aria-label="Legenda: kleur per waarneming">
          <span><i class="map-legend__dot map-legend__dot--seen"></i>Gezien</span>
          <span><i class="map-legend__dot map-legend__dot--heard"></i>Gehoord</span>
          <span><i class="map-legend__dot map-legend__dot--both"></i>Beide</span>
        </div>
      </div>

      <section class="map-search-results" id="mapSearchResults" aria-label="Plekken bij je zoekopdracht" hidden></section>

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

  if (selection) {
    el.querySelector('#mapSpeciesSearch').value = selection.search ?? '';
    el.querySelector('#mapStatusSelect').value = selection.status ?? 'all';
  }

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
      // K4: waarnemingen met een pin hangen aan een vaste plek (eenmalige, additieve migratie)
      try { await ensurePlaces(); } catch (_) { /* opslag vol: kaart werkt per waarneming */ }
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
  const statusSelect = screenEl.querySelector('#mapStatusSelect');
  const filterState = { speciesSearch: speciesSearch.value.trim(), status: statusSelect.value || 'all' };
  let updateMapMarkers=()=>{};
  let showSearchResults=()=>{};
  // K5: plekken zijn doorzoekbaar op naam
  const placeNames=new Map(loadPlaces().map(p=>[p.id,p.name]));

  // Only species with an actual geolocated observation appear as suggestions.
  const suggestions = screenEl.querySelector('#mapSpeciesSuggestions');
  const names=[...new Set([...geoSightings.map(s=>s.speciesName),...placeNames.values()].filter(n=>typeof n==='string'&&n.trim()))]
    .sort((a,b)=>a.localeCompare(b,'nl'));
  for(const name of names) {
    const option=document.createElement('option');option.value=name;suggestions.appendChild(option);
  }

  function applyFilters(){
    const matches=filteredSightings(geoSightings,filterState,SPECIES,placeNames);
    const speciesMatches=filteredSightings(geoSightings,{speciesSearch:filterState.speciesSearch},SPECIES,placeNames);
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
    showSearchResults(matches);
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
  const setFilterOpen=open=>{
    filterPanel.hidden=!open;filterBtn.setAttribute('aria-expanded',String(open));
    if(open)screenEl.querySelector('#mapSearchResults').hidden=true;  // één paneel tegelijk
  };
  filterBtn.addEventListener('click',()=>setFilterOpen(filterPanel.hidden));
  mapEl.addEventListener('pointerdown',()=>setFilterOpen(false));

  // Lege state — altijd tonen als er geen GPS-waarnemingen zijn
  if (!geoSightings.length) showNoGpsState(screenEl);

  // Locatie-knop — ook zonder kaart tonen
  const locBtn = screenEl.querySelector('#mapLocateBtn');

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

  // K4: één pin per plek met de zichtbare waarnemingen; records zelf worden nooit gewijzigd.
  const placeById=new Map(loadPlaces().map(p=>[p.id,p]));
  function groupByPlace(rows){
    const groups=new Map();
    for(const s of rows){
      const place=placeById.get(s.placeId)||{id:'s:'+s.id,name:s.locationName||s.speciesName||'Waarneming',lat:Number(s.lat),lon:Number(s.lon),loose:true};
      const g=groups.get(place.id)||{place,records:[]};
      g.records.push(s);groups.set(place.id,g);
    }
    return [...groups.values()];
  }
  function markerFor({place,records}){
    const status=placeStatus(records);
    const label=records.length===1?records[0].speciesName:place.name+' · '+records.length+' waarnemingen';
    const marker=window.L.marker([Number(place.lat),Number(place.lon)],{
      icon:makeBirdIcon(null,status,label,records.length),
      title:label+' · '+MAP_STATUS[status].label,
    });
    marker.birdspotRecords=records;marker.birdspotRecord=records[0];marker.birdspotPlace=place;
    marker.on('click',()=>openPlaceSheet(screenEl,place,records,map));
    return marker;
  }

  map.addLayer(_clusterLayer);
  updateMapMarkers=(matches)=>{
    _clusterLayer.clearLayers();
    _clusterLayer.addLayers(groupByPlace(matches).map(markerFor));
  };

  // K5: bij zoeken komen alle plekken met die vogel (of met die naam) naar voren
  const resultsEl=screenEl.querySelector('#mapSearchResults');
  const focusPlace=(place,records)=>{
    map.setView([Number(place.lat),Number(place.lon)],Math.max(map.getZoom(),16));
    openPlaceSheet(screenEl,place,records,map);
  };
  showSearchResults=(matches)=>{
    if(!filterState.speciesSearch){resultsEl.hidden=true;resultsEl.innerHTML='';return;}
    const groups=groupByPlace(matches).sort((a,b)=>b.records.length-a.records.length||a.place.name.localeCompare(b.place.name,'nl'));
    if(!groups.length){
      resultsEl.innerHTML='<p class="map-search-results__empty">Geen plekken gevonden voor “'+escHtml(filterState.speciesSearch)+'”.</p>';
      resultsEl.hidden=!screenEl.querySelector('#mapFilterPanel').hidden;return;
    }
    resultsEl.innerHTML='<h3>'+groups.length+' '+(groups.length===1?'plek':'plekken')+'</h3><ul>'+groups.slice(0,8).map(g=>{
      const species=[...new Set(g.records.map(r=>r.speciesName).filter(Boolean))];
      return '<li><button type="button" data-place="'+escHtml(g.place.id)+'">'+
        '<i class="map-legend__dot map-legend__dot--'+(placeStatus(g.records)==='merlin'?'heard':placeStatus(g.records))+'"></i>'+
        '<span><b>'+escHtml(g.place.name)+'</b><small>'+escHtml(species.slice(0,3).join(', ')+(species.length>3?' +'+(species.length-3):''))+'</small></span>'+
        '<em>'+g.records.length+'×</em></button></li>';
    }).join('')+'</ul>';
    resultsEl.hidden=!screenEl.querySelector('#mapFilterPanel').hidden;
    resultsEl.querySelectorAll('[data-place]').forEach(btn=>btn.addEventListener('click',()=>{
      const g=groups.find(x=>x.place.id===btn.dataset.place);
      if(!g)return;
      resultsEl.hidden=true;
      focusPlace(g.place,g.records);
    }));
    // Kaart toont alle gevonden plekken
    const pts=groups.map(g=>[Number(g.place.lat),Number(g.place.lon)]);
    if(pts.length===1)map.setView(pts[0],Math.max(map.getZoom(),14));
    else if(map.fitBounds)map.fitBounds(pts,{padding:[60,60],maxZoom:15});
  };
  mapEl.addEventListener('pointerdown',()=>{resultsEl.hidden=true;});
  speciesSearch.addEventListener('focus',()=>{if(filterState.speciesSearch)applyFilters();});
  applyFilters();

  // K5: van een soort of lijst direct naar een plek
  try{
    const wanted=sessionStorage.getItem('birdspot-map-place');
    if(wanted){
      sessionStorage.removeItem('birdspot-map-place');
      const g=groupByPlace(geoSightings).find(x=>x.place.id===wanted);
      if(g){resultsEl.hidden=true;focusPlace(g.place,g.records);}
    }
  }catch(_){}

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
    if (on) {
      map.stop?.();
      setFilterOpen(false);
      updatePin();
    }
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
    let locateRequest = 0;
    addPinBtn?.addEventListener('click', () => {
      locateRequest++;
      locBtn.classList.remove('map-locate-btn--loading');
    });
    locBtn.addEventListener('click', () => {
      if (placing) return;
      const request = ++locateRequest;
      centerOnUser(map, locBtn, () => locBtn.isConnected && request === locateRequest);
    });
  }
}

// ── K4: plekkaartje ───────────────────────────────────────────
const MEDIA_ACCEPT='image/*,video/*,audio/*';
function openPlaceSheet(screenEl, place, visibleRecords, map) {
  const sheet    = screenEl.querySelector('#mapDetailSheet');
  const overlay  = screenEl.querySelector('#mapOverlay');
  const closeBtn = screenEl.querySelector('#mapSheetClose');
  const body     = screenEl.querySelector('#mapSheetBody');
  const urls=[];
  const reload=()=>import('../../app.js').then(({navigate})=>navigate('map',{force:true}));

  getSightings().then(all=>{
    const rows=place.loose?visibleRecords:all.filter(s=>s.placeId===place.id);
    const st=place.loose?null:placeStats(place,all);
    screenEl.querySelector('#mapSheetIcon').innerHTML='<svg viewBox="0 0 24 24" class="place-sheet__pin"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
    screenEl.querySelector('#mapSheetName').textContent=place.name;
    screenEl.querySelector('#mapSheetMeta').textContent=
      Number(place.lat).toFixed(6)+', '+Number(place.lon).toFixed(6)+(st?.last?' · laatst '+fmtDate(st.last):'');

    const tile=(n,l)=>'<div class="place-stat"><strong>'+n+'</strong><span>'+l+'</span></div>';
    const sorted=[...rows].sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    body.innerHTML=
      (st?'<div class="place-stats">'+tile(st.species.length,st.species.length===1?'soort':'soorten')+
        tile(st.visits,st.visits===1?'bezoek':'bezoeken')+tile(st.sightings,st.sightings===1?'waarneming':'waarnemingen')+'</div>':'')+
      (place.loose?'':'<div class="place-actions">'+
        '<button type="button" class="place-action place-action--primary" id="placeAddSighting">+ Waarneming hier</button>'+
        '<label class="place-action" for="placeMediaInput">+ Foto, video of geluid</label>'+
        '<input type="file" id="placeMediaInput" accept="'+MEDIA_ACCEPT+'" multiple class="visually-hidden">'+
        '<button type="button" class="place-action place-action--quiet" id="placeRename">Naam wijzigen</button></div>'+
        '<div class="place-rename" id="placeRenameRow" hidden><input type="text" id="placeRenameInput" maxlength="80" value="'+escHtml(place.name)+'" aria-label="Naam van de plek">'+
        '<button type="button" id="placeRenameSave">Bewaar</button></div>')+
      (st&&st.species.length?'<h4 class="place-h">Soorten hier</h4><div class="place-species">'+st.species.map(sp=>
        '<button type="button" class="place-species__chip" data-species="'+escHtml(sp.speciesId||'')+'">'+escHtml(sp.name)+' <b>'+sp.count+'×</b></button>').join('')+'</div>':'')+
      '<h4 class="place-h">Waarnemingen</h4><ul class="place-sightings">'+sorted.map(s=>{
        const status=statusForSighting(s);
        return '<li><button type="button" data-sighting="'+escHtml(s.id)+'">'+
          '<i class="map-legend__dot map-legend__dot--'+(status==='merlin'?'heard':status)+'"></i>'+
          '<span><b>'+escHtml(s.speciesName||'Onbekend')+'</b><small>'+escHtml([fmtDate(s.date),methodLabel(s)].filter(Boolean).join(' · '))+'</small></span>'+
          '<em aria-hidden="true">›</em></button></li>';
      }).join('')+'</ul>'+
      (place.loose?'':'<h4 class="place-h">Media bij deze plek</h4><div class="place-media" id="placeMedia"><p class="place-empty">Nog geen foto\'s, video\'s of geluid.</p></div>');

    body.querySelectorAll('[data-species]').forEach(btn=>btn.addEventListener('click',()=>{
      if(!btn.dataset.species)return;
      try{sessionStorage.setItem('birdspot-open-species',btn.dataset.species);}catch(_){}
      closeSheet();
      import('../../app.js').then(({navigate})=>navigate('species'));
    }));
    body.querySelectorAll('[data-sighting]').forEach(btn=>btn.addEventListener('click',()=>{
      const s=rows.find(x=>x.id===btn.dataset.sighting);
      if(!s)return;
      closeSheet();
      openDetailSheet(s,{onDeleted:reload,onUpdated:reload});
    }));
    if(place.loose)return;
    body.querySelector('#placeAddSighting').addEventListener('click',()=>{
      closeSheet();
      openAddSheet({initial:{lat:place.lat,lon:place.lon,placeId:place.id,locationName:place.name},onSaved:reload});
    });
    const renameRow=body.querySelector('#placeRenameRow');
    body.querySelector('#placeRename').addEventListener('click',()=>{renameRow.hidden=!renameRow.hidden;if(!renameRow.hidden)body.querySelector('#placeRenameInput').focus();});
    body.querySelector('#placeRenameSave').addEventListener('click',()=>{
      try{
        const p=renamePlace(place.id,body.querySelector('#placeRenameInput').value);
        if(p){place.name=p.name;screenEl.querySelector('#mapSheetName').textContent=p.name;renameRow.hidden=true;}
      }catch(_){window.__birdspot?.toast?.('Naam opslaan mislukt','error');}
    });
    body.querySelector('#placeMediaInput').addEventListener('change',async e=>{
      const files=[...(e.target.files||[])];
      for(const file of files){
        try{
          await savePhoto({id:'pm_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
            blob:new Blob([await file.arrayBuffer()],{type:file.type}),type:file.type,filename:file.name,
            speciesId:null,sightingId:null,placeId:place.id,addedAt:new Date().toISOString()});
        }catch(_){window.__birdspot?.toast?.('Bestand opslaan mislukt: '+file.name,'error');}
      }
      e.target.value='';
      drawMedia();
    });
    drawMedia();
  });

  async function drawMedia(){
    const box=body.querySelector('#placeMedia');
    if(!box)return;
    let items=[];
    try{items=await getMediaByPlace(place.id);}catch(_){}
    if(!items.length)return;
    urls.splice(0).forEach(u=>URL.revokeObjectURL(u));
    box.innerHTML=items.sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||'')).map(m=>{
      const type=String(m.type||m.blob?.type||'');
      const url=m.blob instanceof Blob?URL.createObjectURL(m.blob):'';
      if(url)urls.push(url);
      const name=escHtml(m.filename||'bestand');
      if(type.startsWith('audio/'))return '<figure class="place-media__audio"><figcaption>'+name+'</figcaption><audio controls preload="metadata" src="'+url+'"></audio></figure>';
      if(type.startsWith('video/'))return '<video class="place-media__thumb" controls playsinline preload="metadata" src="'+url+'" aria-label="'+name+'"></video>';
      return '<img class="place-media__thumb" src="'+url+'" alt="'+name+'">';
    }).join('');
  }

  if (validPin(place.lat,place.lon)) map.panTo([place.lat, place.lon], { animate: true, duration: 0.4 });
  sheet.classList.add('open');
  overlay.classList.add('visible');

  function closeSheet() {
    sheet.classList.remove('open');
    overlay.classList.remove('visible');
    urls.splice(0).forEach(u=>URL.revokeObjectURL(u));
  }
  closeBtn.onclick  = closeSheet;
  overlay.onclick   = closeSheet;
}

// ── Locatie ────────────────────────────────────────────────────
function centerOnUser(map, btn, isCurrent) {
  if (!navigator.geolocation) return;
  btn.classList.add('map-locate-btn--loading');
  navigator.geolocation.getCurrentPosition(
    pos => {
      if (!isCurrent()) return;
      btn.classList.remove('map-locate-btn--loading');
      map.flyTo([pos.coords.latitude, pos.coords.longitude], 17, { duration: 1 });
    },
    () => { if (isCurrent()) btn.classList.remove('map-locate-btn--loading'); },
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

// K3: druppelpin in de kleur van gezien/gehoord/beide met een lijnicoon; punt = exacte plek.
const PIN_GLYPH={
  seen:'<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  heard:'<svg viewBox="0 0 24 24"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>',
  merlin:'<svg viewBox="0 0 24 24"><path d="M4 12h2l2-5 3 10 3-12 3 9 2-2h1"/></svg>',
  both:'<svg viewBox="0 0 24 24"><path d="M1.5 12s3-5 7.5-5 7.5 5 7.5 5-3 5-7.5 5-7.5-5-7.5-5z"/><circle cx="9" cy="12" r="1.8"/><path d="M19 5v9"/><circle cx="20.5" cy="15.5" r="1.6"/></svg>',
  unknown:'<b>?</b>',
};
function makeBirdIcon(_emoji,status,speciesName,count=1) {
  const style=MAP_STATUS[status]||MAP_STATUS.unknown;
  const description=escHtml((speciesName||'Vogelwaarneming')+' · '+style.label);
  return window.L.divIcon({
    html:'<div class="bird-pin bird-pin--status-'+status+'" role="img" aria-label="'+description+'">'+
      '<svg class="bird-pin-shape" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 1.5C7.5 1.5 1.5 7.4 1.5 14.7 1.5 24.6 15 38.5 15 38.5S28.5 24.6 28.5 14.7C28.5 7.4 22.5 1.5 15 1.5z"/></svg>'+
      '<span class="bird-pin-glyph" aria-hidden="true">'+(PIN_GLYPH[status]||PIN_GLYPH.unknown)+'</span>'+
      (count>1?'<span class="bird-pin-count" aria-hidden="true">'+count+'</span>':'')+'</div>',
    className:'',
    iconSize:[30,40],
    iconAnchor:[15,39],
  });
}

function makeClusterIcon(cluster) {
  const children=cluster.getAllChildMarkers();
  const records=children.flatMap(m=>m.birdspotRecords||(m.birdspotRecord?[m.birdspotRecord]:[]));
  const counts=statusCounts(records);
  const n=records.length;
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
