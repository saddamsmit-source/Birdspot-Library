/**
 * Pinkiezer (K2): vaste pin in het midden; schuif en zoom de kaart eronder.
 * Coördinaten handmatig invullen blijft mogelijk (ook offline, zonder Leaflet).
 * Vraagt nooit zelf om GPS.
 */
import { ensureLeaflet } from '../map/view.js';
import { centerPinMarkup, attachBaseLayers, pinAccuracyM, accuracyLabel, MAX_PIN_ACCURACY_M, LAYERS } from '../map/centerPin.js';

const valid=(a,b)=>Number.isFinite(a)&&a>=-90&&a<=90&&Number.isFinite(b)&&b>=-180&&b<=180;
export function openPinPicker({lat=null,lon=null,onConfirm=()=>{}}={}) {
  let destroyed=false,map=null,accuracyM=null,typed=false;
  let chosenLat=lat===null?null:Number(lat),chosenLon=lon===null?null:Number(lon);
  const previousFocus=document.activeElement;
  const host=document.createElement('div');
  host.className='manual-pin-dialog';
  host.innerHTML=
    '<div class="manual-pin-backdrop"></div>'+
    '<div class="manual-pin-sheet" role="dialog" aria-modal="true" aria-label="Pin een vogelwaarneming">'+
      '<header class="manual-pin-header"><div><span class="signature-kicker">BIRDSPOT / BIRD EXPLORER</span>'+
        '<h2>Pin je waarneming</h2>'+
        '<p>Schuif en zoom de kaart tot de pin goed staat, of vul coördinaten in.</p></div>'+
        '<button id="pinCancel" type="button" aria-label="Sluit kaartkiezer">×</button></header>'+
      '<div class="manual-pin-mapwrap"><div id="pinLocationMap" class="manual-pin-map" aria-label="Kaart; de pin in het midden is de gekozen plek"></div>'+
        centerPinMarkup('pinCenterPin')+
        '<button type="button" class="map-icon-btn map-layer-btn manual-pin-layer" id="pinLayerBtn" aria-pressed="false"><span id="pinLayerLabel">Luchtfoto</span></button></div>'+
      '<p id="pinMapStatus" class="manual-pin-status" role="status">Kaart wordt geladen…</p>'+
      '<div class="manual-pin-coords">'+
        '<label>Breedtegraad<input id="pinLat" type="number" step="any" min="-90" max="90" inputmode="decimal" placeholder="bijv. 51.59"></label>'+
        '<label>Lengtegraad<input id="pinLon" type="number" step="any" min="-180" max="180" inputmode="decimal" placeholder="bijv. 5.09"></label>'+
      '</div>'+
      '<p class="manual-pin-tip">Persoonlijke pin, geen publiek gedeelde locatie. Plaats de pin waar je de vogel zag of hoorde.</p>'+
      '<footer class="manual-pin-actions"><button id="pinClear" type="button">Verwijder pin</button>'+
        '<button id="pinConfirm" type="button" disabled>Gebruik deze plek</button></footer></div>';
  document.body.appendChild(host);
  const inputLat=host.querySelector('#pinLat'),inputLon=host.querySelector('#pinLon');
  const confirm=host.querySelector('#pinConfirm'),status=host.querySelector('#pinMapStatus');
  function place(a,b,fromMap=false){
    const ok=valid(a,b);
    chosenLat=ok?a:null;chosenLon=ok?b:null;
    if(fromMap&&ok){inputLat.value=String(a.toFixed(6));inputLon.value=String(b.toFixed(6));}
    const precise=!map||accuracyM===null||accuracyM<=MAX_PIN_ACCURACY_M;
    confirm.disabled=!(ok&&precise);
  }
  // Kaart beweegt → pinpunt (kaartmidden) wordt de gekozen plek
  let suppress=false;
  function fromCenter(){
    if(!map||suppress)return;
    const c=map.getCenter();
    accuracyM=pinAccuracyM(c.lat,map.getZoom());
    typed=false;
    place(c.lat,c.lng,true);
    status.textContent=accuracyM<=MAX_PIN_ACCURACY_M
      ? 'Pin op '+accuracyLabel(accuracyM)+'. Schuif tot hij precies goed staat.'
      : 'Zoom verder in om nauwkeurig te pinnen ('+accuracyLabel(accuracyM)+').';
  }
  const initialValid=valid(chosenLat,chosenLon);
  if(initialValid){inputLat.value=String(chosenLat);inputLon.value=String(chosenLon);}
  place(chosenLat,chosenLon);
  const onInputs=()=>{
    const a=inputLat.value.trim()===''?NaN:Number(inputLat.value);
    const b=inputLon.value.trim()===''?NaN:Number(inputLon.value);
    typed=true;accuracyM=null;
    place(a,b);
    // Ingetypte coördinaten zijn leidend: kaart volgt zonder animatie en zonder de pin te overschrijven
    if(valid(a,b)&&map){suppress=true;map.setView([a,b],Math.max(map.getZoom(),16),{animate:false});setTimeout(()=>{suppress=false;},0);}
    status.textContent=valid(a,b)?'Pin gereed':'Vul geldige coördinaten in, of schuif de kaart onder de pin.';
  };
  inputLat.addEventListener('input',onInputs);inputLon.addEventListener('input',onInputs);
  const onKey=e=>{if(e.key==='Escape')close();};
  function close(){
    if(destroyed)return;
    destroyed=true;
    document.removeEventListener('keydown',onKey);
    try{map?.remove();}catch(_){}
    map=null;host.remove();previousFocus?.focus?.();
  }
  document.addEventListener('keydown',onKey);
  host.querySelector('.manual-pin-backdrop').addEventListener('click',close);
  host.querySelector('#pinCancel').addEventListener('click',close);
  host.querySelector('#pinClear').addEventListener('click',()=>{
    inputLat.value='';inputLon.value='';place(NaN,NaN);
    status.textContent='Pin verwijderd. Kies opnieuw op de kaart of vul coördinaten in.';
  });
  confirm.addEventListener('click',()=>{
    if(!valid(chosenLat,chosenLon))return;
    const coords={lat:chosenLat,lon:chosenLon,accuracyM:typed?null:accuracyM};
    close();onConfirm(coords);
  });
  (async()=>{
    try{
      await Promise.race([
        ensureLeaflet(),
        new Promise((_,reject)=>setTimeout(()=>reject(Error('Kaarttimeout')),6500)),
      ]);
      if(destroyed)return;
      const center=initialValid?[chosenLat,chosenLon]:[51.85,5.25];
      map=window.L.map(host.querySelector('#pinLocationMap'),{center,zoom:initialValid?17:8,maxZoom:21,zoomControl:false});
      const layerBtn=host.querySelector('#pinLayerBtn');
      const toggle=attachBaseLayers(map,window.L,current=>{
        layerBtn.setAttribute('aria-pressed',String(current==='luchtfoto'));
        host.querySelector('#pinLayerLabel').textContent=current==='luchtfoto'?LAYERS.kaart.label:LAYERS.luchtfoto.label;
      });
      layerBtn.addEventListener('click',()=>toggle());
      host.querySelector('#pinCenterPin').hidden=false;
      map.on('move',fromCenter);map.on('zoomend',fromCenter);
      if(typed&&valid(chosenLat,chosenLon)){
        // Coördinaten al ingetypt terwijl de kaart laadde: die blijven leidend
        suppress=true;map.setView([chosenLat,chosenLon],17,{animate:false});setTimeout(()=>{suppress=false;},0);
        place(chosenLat,chosenLon);
      }else if(!initialValid){accuracyM=pinAccuracyM(center[0],8);place(NaN,NaN);status.textContent='Zoom in en schuif de kaart tot de pin op de plek van de vogel staat.';}
      else fromCenter();
      setTimeout(()=>{if(!destroyed)map?.invalidateSize();},100);
    }catch(_){
      if(!destroyed)status.textContent='Kaart niet beschikbaar. Coördinaten handmatig invullen werkt ook offline.';
    }
  })();
  host.querySelector('#pinCancel').focus();
  return close;
}
