/**
 * Birdspot Signature — Media Studio Phase 2
 *
 * All photos/videos come exclusively from the user's IndexedDB.
 * Favorites and Film shortlist are optional, sidecar ID collections.
 * No thumbnails are modified or deleted; duplicate hints are non-destructive.
 */
import { getDB } from '../../data/db.js';
import { getSightings } from '../../data/sightings.js';
import { SPECIES } from '../../data/species.js';
import { getPhotoUrl, revokePhotoUrl } from '../../utils/photoUrl.js';
import { escHtml } from '../../utils/html.js';
import { getCollectionIds, toggleCollectionItem } from '../../storage/collections.js';

const BATCH_SIZE = 18;
const safe = x => escHtml(String(x ?? ''));
const imageType = type => typeof type === 'string' && type.startsWith('image/');
const videoType = type => typeof type === 'string' && type.startsWith('video/');
const dateLabel = d => {
  if (!d) return '';
  const date = new Date(d + 'T12:00:00');
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString('nl-NL', { day:'numeric',month:'short',year:'numeric' });
};

/** Metadata-only hint: no image analysis or exact-content claim. */
export function findPossibleDuplicateIds(items) {
  const groups = new Map();
  for (const item of items) {
    const filename = (item.photo.filename || '').trim().toLowerCase();
    const type = item.photo.blob?.type || item.photo.type || '';
    const size = item.photo.blob?.size;
    if (!filename || !Number.isFinite(size) || size <= 0 || !item.speciesId || !item.date) continue;
    const key = [item.speciesId,item.date,filename,type,size].join('|');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item.photo.id);
  }
  return new Set([...groups.values()].filter(ids => ids.length > 1).flat());
}

export function renderMedia(el) {
  const state = { destroyed:false, items:[], filter:'all', species:'all', search:'',
    visible:BATCH_SIZE, urls:new Map(), lightbox:null, lightboxIndex:-1, focusReturn:null };
  let favorites = getCollectionIds('media');
  let film = getCollectionIds('film');
  const knownNames = new Map(SPECIES.map(s => [s.id,s.nameNL]));

  el.classList.add('signature-screen','signature-media','signature-media-v2');
  el.innerHTML =
    '<header class="signature-page-hero signature-page-hero--media">' +
      '<span class="signature-kicker">BIRDSPOT / PRIVATE COLLECTION</span>' +
      '<h1>Wildlife Media Studio</h1>' +
      '<p>Elke foto een herinnering. Ontdek, bewaar en verzamel je favoriete vogelmomenten.</p>' +
      '<div class="signature-orbit" aria-hidden="true"></div></header>' +
    '<div class="signature-content">' +
      '<div class="signature-media-summary" aria-label="Jouw mediacollectie">' +
        '<div><strong id="mediaTotal">—</strong><span>Media</span></div>' +
        '<div><strong id="mediaFavoritesCount">—</strong><span>Favorieten</span></div>' +
        '<div><strong id="mediaFilmCount">—</strong><span>Filmselectie</span></div>' +
      '</div>' +
      '<div class="signature-section-head"><div><span class="signature-eyebrow">JOUW VERZAMELING</span>' +
        '<h2>Vogelmomenten</h2></div><span id="mediaCount" class="signature-count">Laden…</span></div>' +
      '<div class="signature-media-tools">' +
        '<label class="signature-media-search-label"><span>Zoeken</span>' +
          '<input id="mediaSearch" type="search" placeholder="Soort of locatie…" autocomplete="off"></label>' +
        '<label class="signature-media-species-label"><span>Soort</span>' +
          '<select id="mediaSpecies" aria-label="Filter op soort"><option value="all">Alle vogelsoorten</option></select></label>' +
      '</div>' +
      '<div class="signature-filterbar" role="group" aria-label="Filter media">' +
        '<button class="signature-filter is-selected" data-media-filter="all" aria-pressed="true">Alles</button>' +
        '<button class="signature-filter" data-media-filter="photo" aria-pressed="false">Foto’s</button>' +
        '<button class="signature-filter" data-media-filter="video" aria-pressed="false">Video’s</button>' +
        '<button class="signature-filter" data-media-filter="favorites" aria-pressed="false">★ Favorieten</button>' +
        '<button class="signature-filter" data-media-filter="film" aria-pressed="false">✦ Mijn film</button>' +
      '</div>' +
      '<div id="mediaFeedback" class="signature-media-feedback" role="status" aria-live="polite"></div>' +
      '<div id="mediaDupHint" class="signature-dup-note" hidden></div>' +
      '<div id="mediaGallery" class="signature-media-grid" aria-live="polite">' +
        '<p class="signature-empty">Je collectie wordt geladen…</p></div>' +
      '<button id="mediaMore" class="signature-more" type="button" hidden>Meer media bekijken</button>' +
      '<section class="signature-future" id="mediaFilmFuture">' +
        '<span class="signature-eyebrow">JOUW FILMSELECTIE</span>' +
        '<h3>Jouw mooiste vogelmomenten, één verhaal.</h3>' +
        '<p id="mediaFilmInfo">Kies je favoriete foto’s en video’s met de filmknop bij elk bestand.</p>' +
        '<small>De selectie wordt lokaal opgeslagen. Filmproductie en export volgen in een aparte ontwikkelfase.</small>' +
      '</section>' +
    '</div>';

  const gallery = el.querySelector('#mediaGallery');
  const count = el.querySelector('#mediaCount');
  const feedback = el.querySelector('#mediaFeedback');
  const speciesSelect = el.querySelector('#mediaSpecies');
  const more = el.querySelector('#mediaMore');
  let toastCleanup = null;

  function inform(message) {
    if (toastCleanup) clearTimeout(toastCleanup);
    feedback.textContent = message;
    toastCleanup = setTimeout(() => { if (!state.destroyed) feedback.textContent = ''; }, 5000);
  }

  function releaseGalleryUrls() {
    for (const url of state.urls.values()) revokePhotoUrl(url);
    state.urls.clear();
  }

  function showSpeciesOptions() {
    const ids = [...new Set(state.items.map(x => x.speciesId).filter(Boolean))];
    ids.sort((a,b) => (knownNames.get(a)||a).localeCompare(knownNames.get(b)||b,'nl'));
    speciesSelect.innerHTML = '<option value="all">Alle vogelsoorten</option>' +
      ids.map(id => '<option value="' + safe(id) + '">' +
        safe(knownNames.get(id)||state.items.find(x=>x.speciesId===id)?.name||'Onbekende soort') +
        '</option>').join('');
  }

  function getFiltered() {
    return state.items.filter(item => {
      if (state.filter === 'photo' && item.kind !== 'photo') return false;
      if (state.filter === 'video' && item.kind !== 'video') return false;
      if (state.filter === 'favorites' && !favorites.has(item.photo.id)) return false;
      if (state.filter === 'film' && !film.has(item.photo.id)) return false;
      if (state.species !== 'all' && item.speciesId !== state.species) return false;
      if (state.search && ![item.name,item.where,item.photo.filename].join(' ').toLocaleLowerCase('nl').includes(state.search)) return false;
      return true;
    });
  }

  function updateStats() {
    el.querySelector('#mediaTotal').textContent = state.items.length;
    el.querySelector('#mediaFavoritesCount').textContent = state.items.filter(x=>favorites.has(x.photo.id)).length;
    el.querySelector('#mediaFilmCount').textContent = state.items.filter(x=>film.has(x.photo.id)).length;
    const selected = state.items.filter(x=>film.has(x.photo.id)).length;
    el.querySelector('#mediaFilmInfo').textContent = selected
      ? selected + (selected===1?' beeld geselecteerd voor je toekomstige wildlifevideo.':' beelden geselecteerd voor je toekomstige wildlifevideo.')
      : 'Kies je favoriete foto’s en video’s met de filmknop bij elk bestand.';
  }

  function draw() {
    if (state.destroyed) return;
    closeLightbox();
    releaseGalleryUrls();
    favorites = getCollectionIds('media');
    film = getCollectionIds('film');
    updateStats();
    const filtered = getFiltered();
    const shown = filtered.slice(0,state.visible);
    count.textContent = filtered.length + (filtered.length===1?' bestand':' bestanden');
    if (!shown.length) {
      gallery.innerHTML = '<div class="signature-empty"><span aria-hidden="true">✧</span>' +
        '<h3>Geen media gevonden</h3><p>Voeg foto’s of video’s toe aan een waarneming, of pas je filters aan.</p></div>';
    } else {
      gallery.innerHTML = shown.map(item => {
        const url = getPhotoUrl(item.photo);
        if (!url) return '';
        state.urls.set(item.photo.id,url);
        const name = safe(item.name||'Vogelwaarneming');
        const where = safe(item.where||'Mijn collectie');
        const date = safe(dateLabel(item.date));
        const id = safe(item.photo.id);
        const loved = favorites.has(item.photo.id), selected = film.has(item.photo.id);
        const frame = item.kind === 'video'
          ? '<video controls playsinline preload="none" src="'+url+'" aria-label="Video: '+name+'"></video>'
          : '<button class="signature-media-open" data-media-open="'+id+'" aria-label="Bekijk foto: '+name+'"><img src="'+url+'" alt="'+name+'" loading="lazy" decoding="async"></button>';
        return '<article class="signature-media-tile signature-media-tile--v2">' +
          '<div class="signature-media-frame">'+frame+
          '<span class="signature-media-type">'+(item.kind==='video'?'VIDEO':'FOTO')+'</span>' +
          (item.possibleDuplicate?'<span class="signature-possible-duplicate" title="Metadata komt overeen; geen bevestigde dubbele foto">Mogelijk dubbel</span>':'')+
          '</div><div class="signature-media-meta"><strong>'+name+'</strong><span>'+where+(date?' · '+date:'')+'</span></div>' +
          '<div class="signature-media-actions">' +
          '<button type="button" data-media-fav="'+id+'" aria-pressed="'+loved+'" aria-label="'+(loved?'Verwijder favoriet':'Markeer als favoriet')+': '+name+'" class="'+(loved?'is-on':'')+'"><span aria-hidden="true">'+(loved?'★':'☆')+'</span> Favoriet</button>' +
          '<button type="button" data-media-film="'+id+'" aria-pressed="'+selected+'" aria-label="'+(selected?'Haal uit filmselectie':'Voeg toe aan filmselectie')+': '+name+'" class="'+(selected?'is-on':'')+'"><span aria-hidden="true">'+(selected?'✓':'✦')+'</span> Film</button>' +
          '</div></article>';
      }).join('');
    }
    more.hidden = filtered.length <= state.visible;
  }

  function closeLightbox() {
    if (state.lightbox) {
      state.lightbox.remove();
      state.lightbox = null;
      state.focusReturn?.focus?.();
      state.focusReturn = null;
    }
  }

  function openLightbox(id, trigger) {
    closeLightbox();
    const item = state.items.find(x=>x.photo.id===id);
    const url = state.urls.get(id);
    if (!item || !url || item.kind==='video') return;
    state.focusReturn = trigger;
    const dialog = document.createElement('div');
    dialog.className = 'signature-lightbox';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-modal','true');
    dialog.setAttribute('aria-label','Fotoweergave');
    dialog.innerHTML = '<button class="signature-lightbox-close" type="button" aria-label="Foto sluiten">×</button>'+
      '<img src="'+url+'" alt="'+safe(item.name)+'">';
    document.body.appendChild(dialog);
    dialog.addEventListener('click', e=>{
      if(e.target===dialog || e.target.closest('.signature-lightbox-close')) closeLightbox();
    });
    state.lightbox=dialog;
    dialog.querySelector('button').focus();
  }

  const onClick = event => {
    const filt = event.target.closest('[data-media-filter]');
    if (filt) {
      state.filter=filt.dataset.mediaFilter; state.visible=BATCH_SIZE;
      el.querySelectorAll('[data-media-filter]').forEach(b=>{
        const active=b.dataset.mediaFilter===state.filter;
        b.classList.toggle('is-selected',active);
        b.setAttribute('aria-pressed',String(active));
      });
      draw(); return;
    }
    if (event.target.closest('#mediaMore')) { state.visible+=BATCH_SIZE; draw(); return; }
    const fav=event.target.closest('[data-media-fav]');
    const chosen=event.target.closest('[data-media-film]');
    if(fav||chosen) {
      const kind=fav?'media':'film',id=(fav||chosen).dataset[fav?'mediaFav':'mediaFilm'];
      try { toggleCollectionItem(kind,id); draw(); inform(kind==='media'?'Favorieten bijgewerkt':'Filmselectie bijgewerkt'); }
      catch(_) { inform('Opslaan niet gelukt. Controleer de beschikbare opslagruimte.'); }
      return;
    }
    const open=event.target.closest('[data-media-open]');
    if(open) openLightbox(open.dataset.mediaOpen,open);
  };

  const onInput = event => {
    if(event.target.id!=='mediaSearch') return;
    state.search=event.target.value.trim().toLocaleLowerCase('nl');
    state.visible=BATCH_SIZE; draw();
  };
  const onChange = event => {
    if(event.target.id!=='mediaSpecies') return;
    state.species=event.target.value;
    state.visible=BATCH_SIZE; draw();
  };
  const onKey = event => {
    if(!state.lightbox || event.key!=='Escape') return;
    closeLightbox();
  };

  el.addEventListener('click',onClick);
  el.addEventListener('input',onInput);
  el.addEventListener('change',onChange);
  document.addEventListener('keydown',onKey);

  (async()=>{
    try {
      const [sightings,db]=await Promise.all([getSightings(),getDB()]);
      const photos=await new Promise((resolve,reject)=>{
        const req=db.transaction('photos','readonly').objectStore('photos').getAll();
        req.onsuccess=()=>resolve(req.result||[]);
        req.onerror=()=>reject(req.error);
      });
      if(state.destroyed) return;
      const bySighting=new Map(sightings.map(s=>[s.id,s]));
      const byPhoto=new Map();
      for(const s of sightings) for(const id of (s.photoIds||[])) byPhoto.set(id,s);
      state.items=photos.filter(p=>p?.blob instanceof Blob && (imageType(p.blob.type||p.type)||videoType(p.blob.type||p.type)))
        .map(photo=>{
          const s=bySighting.get(photo.sightingId)||byPhoto.get(photo.id);
          const speciesId=s?.speciesId||photo.speciesId||'';
          return {photo,speciesId,kind:videoType(photo.blob.type||photo.type)?'video':'photo',
            name:s?.speciesName||knownNames.get(speciesId)||photo.speciesName||'Vogelwaarneming',
            date:s?.date||'',where:s?.locationName||''};
        }).sort((a,b)=>b.date.localeCompare(a.date));
      const dupIds=findPossibleDuplicateIds(state.items);
      for(const item of state.items) item.possibleDuplicate=dupIds.has(item.photo.id);
      if(dupIds.size) {
        const hint=el.querySelector('#mediaDupHint');
        hint.hidden=false;
        hint.textContent=dupIds.size+' bestanden lijken mogelijk dubbel op basis van soort, datum, naam en grootte. '+
          'Dit is geen beeldanalyse. Er wordt nooit automatisch iets verwijderd.';
      }
      showSpeciesOptions();
      draw();
    } catch(_) {
      if(!state.destroyed) gallery.innerHTML='<div class="signature-empty"><h3>Media niet beschikbaar</h3>'+
        '<p>Controleer de lokale opslag. Je bestanden zijn niet gewijzigd.</p></div>';
    }
  })();

  return()=>{
    state.destroyed=true;
    el.removeEventListener('click',onClick);
    el.removeEventListener('input',onInput);
    el.removeEventListener('change',onChange);
    document.removeEventListener('keydown',onKey);
    if(toastCleanup) clearTimeout(toastCleanup);
    closeLightbox();
    releaseGalleryUrls();
  };
}
