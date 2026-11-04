/**
 * Personal pin picker: tap the map or enter numeric coordinates.
 * Offline fallback works without Leaflet. Never requests GPS permission.
 */
import { ensureLeaflet } from '../map/view.js';

const valid=(a,b)=>Number.isFinite(a)&&a>=-90&&a<=90&&Number.isFinite(b)&&b>=-180&&b<=180;
export function openPinPicker({lat=null,lon=null,onConfirm=()=>{}}={}) {
  let destroyed=false,map=null,marker=null;
  let chosenLat=lat===null?null:Number(lat),chosenLon=lon===null?null:Number(lon);
  const previousFocus=document.activeElement;
  const host=document.createElement('div');
  host.className='manual-pin-dialog';
  host.innerHTML=
    '<div class="manual-pin-backdrop"></div>'+
    '<div class="manual-pin-sheet" role="dialog" aria-modal="true" aria-label="Pin een vogelwaarneming">'+
      '<header class="manual-pin-header"><div><span class="signature-kicker">BIRDSPOT / BIRD EXPLORER</span>'+
        '<h2>Pin je waarneming</h2>'+
        '<p>Tik op de kaart of vul coördinaten in. GPS is niet verplicht.</p></div>'+
        '<button id="pinCancel" type="button" aria-label="Sluit kaartkiezer">×</button></header>'+
      '<div id="pinLocationMap" class="manual-pin-map" aria-label="Interactieve kaart waarop je een vogelwaarneming kunt pinnen"></div>'+
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
    confirm.disabled=!ok;
    if(fromMap&&ok){inputLat.value=String(a.toFixed(6));inputLon.value=String(b.toFixed(6));}
    if(ok&&map&&window.L){
      if(!marker){
        marker=window.L.marker([a,b],{draggable:true}).addTo(map);
        marker.on('dragend',()=>{const p=marker.getLatLng();place(p.lat,p.lng,true);});
      }else marker.setLatLng([a,b]);
    }else if(!ok&&marker){marker.remove();marker=null;}
  }
  const initialValid=valid(chosenLat,chosenLon);
  if(initialValid){inputLat.value=String(chosenLat);inputLon.value=String(chosenLon);}
  place(chosenLat,chosenLon);
  const onInputs=()=>{
    const a=inputLat.value.trim()===''?NaN:Number(inputLat.value);
    const b=inputLon.value.trim()===''?NaN:Number(inputLon.value);
    place(a,b);
    status.textContent=valid(a,b)?'Pin gereed':'Vul geldige coördinaten in, of tik op de kaart.';
  };
  inputLat.addEventListener('input',onInputs);inputLon.addEventListener('input',onInputs);
  const onKey=e=>{if(e.key==='Escape')close();};
  function close(){
    if(destroyed)return;
    destroyed=true;
    document.removeEventListener('keydown',onKey);
    try{map?.remove();}catch(_){}
    map=null;marker=null;host.remove();previousFocus?.focus?.();
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
    const coords={lat:chosenLat,lon:chosenLon};
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
      map=window.L.map(host.querySelector('#pinLocationMap'),{center,zoom:initialValid?13:8});
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:19,attribution:'© OpenStreetMap'
      }).addTo(map);
      map.on('click',e=>{place(e.latlng.lat,e.latlng.lng,true);status.textContent='Pin geselecteerd. Controleer de plek en bevestig.';});
      if(initialValid)place(chosenLat,chosenLon);
      status.textContent='Tik op de plek waar je de vogel hebt gezien of gehoord.';
      setTimeout(()=>{if(!destroyed)map?.invalidateSize();},100);
    }catch(_){
      if(!destroyed)status.textContent='Kaart niet beschikbaar. Coördinaten handmatig invullen werkt ook offline.';
    }
  })();
  host.querySelector('#pinCancel').focus();
  return close;
}
