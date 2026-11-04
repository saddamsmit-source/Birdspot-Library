/**
 * Birdspot Film Studio — premium client-only movie editor.
 * Uses existing Phase 2 film selection; exports a silent movie locally where
 * the browser implements Canvas.captureStream + MediaRecorder.
 */
import { getCollectionIds,saveFilmOrder,setCollectionItem } from '../../storage/collections.js';
import { getSightings } from '../../data/sightings.js';
import { getPhoto } from '../../data/db.js';
import { getPhotoUrl,revokePhotoUrl } from '../../utils/photoUrl.js';
import { escHtml } from '../../utils/html.js';
import { FILM_LIMIT,chooseMovieFormat,movieEstimate,renderFilm } from './renderer.js';

const safe=x=>escHtml(String(x??''));
const typeOf=p=>p?.blob?.type||p?.type||'';
const slug=x=>String(x||'birdspot-film').normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'birdspot-film';
const shorten=(v,n=75)=>String(v||'').trim().slice(0,n);

export function renderFilmStudio(el) {
  let destroyed=false,busy=false,selectedIndex=0,playing=false,timer=null,abort=null;
  let items=[],urls=new Map(),resultUrl=null,resultBlob=null,missing=0;
  const state={aspect:'landscape',seconds:3,title:'My Birding Story'};
  el.classList.add('signature-screen','film-studio-screen');
  el.innerHTML =
    '<header class="film-studio-hero"><span class="signature-kicker">BIRDSPOT / THE CREATIVE STUDIO</span>' +
      '<div class="film-studio-orbit" aria-hidden="true"></div>' +
      '<h1>Wildlife Film Studio</h1>' +
      '<p>Van jouw vogelmomenten naar een persoonlijk, filmisch verhaal.</p>' +
      '<button type="button" class="film-studio-return" id="filmBackToMedia">← Mijn Media Studio</button>' +
    '</header>' +
    '<div class="signature-content film-studio-content">' +
      '<div class="film-studio-intro"><span class="signature-eyebrow">CREATE / YOUR STORY</span>' +
        '<h2>Jouw wildlifevideo</h2>' +
        '<p>Combineer uitsluitend je eigen vogelbeelden. Kies volgorde, formaat en tempo voordat je de film maakt.</p></div>' +
      '<div class="film-studio-counts"><div><strong id="filmSelectedCount">0</strong><span>Geselecteerd</span></div>' +
        '<div><strong id="filmEstimate">—</strong><span>Filmduur (circa)</span></div>' +
        '<div><strong id="filmFormat">—</strong><span>Exportformaat</span></div></div>' +
      '<div id="filmEmptyState" class="film-studio-empty" hidden>' +
        '<span aria-hidden="true">✦</span><h3>Elk verhaal begint met een vogelmoment</h3>' +
        '<p>Selecteer eerst foto’s of video’s via de filmknop in je Media Studio. De originele bestanden blijven bewaard.</p>' +
        '<button type="button" data-film-route="media">Kies mijn beelden ↗</button></div>' +
      '<div id="filmEditor" hidden>' +
        '<section class="film-studio-panel film-studio-panel--preview">' +
          '<div class="film-studio-panel-heading"><div><span class="signature-eyebrow">01 / STORYBOARD</span>' +
            '<h3>Cinematic Preview</h3></div><small id="filmPreviewPosition">—</small></div>' +
          '<div class="film-studio-preview" id="filmPreview" role="group" aria-label="Voorbeeld van geselecteerd vogelbeeld">' +
            '<div class="film-studio-preview-empty">Kies een vogelmoment om te bekijken.</div></div>' +
          '<div class="film-studio-preview-controls">' +
            '<button type="button" data-film-step="-1" aria-label="Vorig beeld">←</button>' +
            '<button type="button" id="filmPlay" aria-label="Speel storyboard">▶ Bekijk volgorde</button>' +
            '<button type="button" data-film-step="1" aria-label="Volgend beeld">→</button></div>' +
          '<small class="film-studio-hint">Storyboard-preview toont de volgorde. De export voegt titelkaarten en overgangen toe.</small>' +
        '</section>' +
        '<section class="film-studio-panel film-studio-panel--settings">' +
          '<div class="film-studio-panel-heading"><div><span class="signature-eyebrow">02 / PERSONALISE</span>' +
            '<h3>Maak het persoonlijk</h3></div></div>' +
          '<div class="film-studio-settings">' +
            '<label class="film-studio-title-label">Filmtitel<input id="filmTitle" type="text" maxlength="65" ' +
              'autocomplete="off" value="My Birding Story" placeholder="Mijn vogelverhaal"></label>' +
            '<div class="film-studio-setting"><span>Beeldformaat</span><div role="group" aria-label="Beeldformaat">' +
              '<button type="button" class="is-active" data-film-aspect="landscape" aria-pressed="true">▭ Liggend 16:9</button>' +
              '<button type="button" data-film-aspect="portrait" aria-pressed="false">▯ Staand 9:16</button>' +
            '</div></div>' +
            '<div class="film-studio-setting"><span>Tempo per beeld</span><div role="group" aria-label="Tempo">' +
              '<button type="button" class="is-active" data-film-seconds="3" aria-pressed="true">3 sec · Dynamisch</button>' +
              '<button type="button" data-film-seconds="5" aria-pressed="false">5 sec · Rustig</button>' +
            '</div></div>' +
          '</div>' +
          '<div class="film-studio-format-note">Video wordt zonder soundtrack geëxporteerd. ' +
             'De film wordt op je eigen apparaat samengesteld; geen upload en geen AI-creditverbruik.</div>' +
        '</section>' +
        '<section class="film-studio-panel film-studio-panel--timeline">' +
          '<div class="film-studio-panel-heading"><div><span class="signature-eyebrow">03 / SEQUENCE</span>' +
            '<h3>Mijn montagevolgorde</h3></div><small>Maximaal '+FILM_LIMIT+' clips</small></div>' +
          '<div id="filmTimeline" class="film-studio-timeline" aria-live="polite"></div>' +
          '<button type="button" class="film-studio-add-more" data-film-route="media">+ Meer vogelbeelden kiezen</button>' +
          '<div id="filmMissing" class="film-studio-message" hidden></div>' +
        '</section>' +
        '<section class="film-studio-panel film-studio-panel--export">' +
          '<div class="film-studio-panel-heading"><div><span class="signature-eyebrow">04 / CREATE</span>' +
            '<h3>Maak jouw film</h3></div></div>' +
          '<p class="film-studio-export-copy">Een filmische intro, jouw eigen foto’s en video’s in de gekozen volgorde, en een afsluitende Birdspot-titelkaart.</p>' +
          '<button type="button" id="filmExport" class="film-studio-primary">✦ Film maken op dit apparaat</button>' +
          '<button type="button" id="filmCancel" class="film-studio-cancel" hidden>Stop filmexport</button>' +
          '<div class="film-studio-progress" id="filmProgress" hidden role="status" aria-live="polite">' +
            '<div class="film-studio-progress-top"><span id="filmProgressLabel">Voorbereiden…</span>' +
            '<strong id="filmProgressValue">0%</strong></div>' +
            '<div class="film-studio-progress-track"><span id="filmProgressBar"></span></div></div>' +
          '<div id="filmMessage" class="film-studio-message" role="status" aria-live="polite"></div>' +
          '<div class="film-studio-result" id="filmResult" hidden>' +
            '<span class="signature-eyebrow">YOUR FILM IS READY</span><h4>Jouw vogelverhaal is gemaakt</h4>' +
            '<video id="filmResultVideo" controls playsinline preload="metadata"></video>' +
            '<a class="film-studio-download" id="filmDownload" download>↓ Bewaar mijn film</a>' +
            '<p>Bewaar het bestand op je apparaat. De download wordt niet automatisch toegevoegd aan je mediabibliotheek.</p>' +
          '</div>' +
        '</section>' +
      '</div>' +
    '</div>';

  const byId=x=>el.querySelector('#'+x);
  const timeline=byId('filmTimeline'),editor=byId('filmEditor');
  const exportBtn=byId('filmExport');
  const download=byId('filmDownload');
  const message=byId('filmMessage');
  const notice=byId('filmMissing');

  function inform(text) {message.textContent=text||'';}
  function releaseUrls() {
    for(const url of urls.values())revokePhotoUrl(url);
    urls.clear();
  }
  function releaseResult(){
    if(resultUrl){URL.revokeObjectURL(resultUrl);resultUrl=null;}
    resultBlob=null;byId('filmResult').hidden=true;
    byId('filmResultVideo').removeAttribute('src');
    byId('filmResultVideo').load();
    download.removeAttribute('href');
  }
  function stopPreview() {
    playing=false;
    if(timer) {clearInterval(timer);timer=null;}
    byId('filmPlay').textContent='▶ Bekijk volgorde';
    const video=byId('filmPreview').querySelector('video');
    video?.pause();
  }
  function createUrls(){
    releaseUrls();
    for(const item of items){
      const url=getPhotoUrl(item.photo);
      if(url)urls.set(item.id,url);
    }
  }
  function drawPreview(){
    const out=byId('filmPreview');
    const item=items[selectedIndex];
    if(!item){out.innerHTML='<div class="film-studio-preview-empty">Geen geselecteerd beeld</div>';return;}
    const url=urls.get(item.id);
    if(!url)return;
    const caption='<div class="film-studio-preview-caption"><span>BIRDSPOT / MY WILDLIFE</span>' +
      '<strong>'+safe(item.name)+'</strong><small>'+safe(item.where||'')+'</small></div>';
    const media=item.kind==='video'
      ? '<video controls muted playsinline preload="metadata" src="'+url+'" aria-label="Voorbeeld: '+safe(item.name)+'"></video>'
      : '<img alt="'+safe(item.name)+'" src="'+url+'" decoding="async">';
    out.classList.toggle('is-portrait',state.aspect==='portrait');
    out.innerHTML='<div class="film-studio-preview-media">'+media+caption+'</div>';
    byId('filmPreviewPosition').textContent=(selectedIndex+1)+' / '+items.length;
  }
  function drawTimeline(){
    timeline.innerHTML=items.map((item,i)=>{
      const url=urls.get(item.id);
      const mime=item.kind==='video'?'VIDEO':'FOTO';
      const thumbnail=item.kind==='video'?
        '<span class="film-studio-video-mark">▶</span>':
        (url?'<img src="'+url+'" alt="" loading="lazy">':'');
      return '<article class="film-studio-shot '+(i===selectedIndex?'is-selected':'')+'" data-film-id="'+safe(item.id)+'">' +
        '<button type="button" class="film-studio-shot-preview" data-film-select="'+i+'" aria-label="Bekijk beeld '+(i+1)+'">'+
          '<span class="film-studio-shot-image">'+thumbnail+'</span>' +
          '<span class="film-studio-shot-text"><strong>'+safe(item.name)+'</strong>'+
            '<small>'+mime+' · '+safe(item.where||'Eigen waarneming')+'</small></span></button>' +
        '<div class="film-studio-shot-actions">' +
          '<button type="button" data-film-move="'+i+'" data-direction="-1" aria-label="Verplaats beeld omhoog" '+(i===0?'disabled':'')+'>↑</button>'+
          '<button type="button" data-film-move="'+i+'" data-direction="1" aria-label="Verplaats beeld omlaag" '+(i===items.length-1?'disabled':'')+'>↓</button>'+
          '<button type="button" data-film-remove="'+safe(item.id)+'" aria-label="Haal uit filmselectie">×</button>'+
        '</div></article>';
    }).join('');
  }
  function refresh(){
    byId('filmSelectedCount').textContent=items.length;
    const estimate=movieEstimate(items,state);
    const min=Math.floor(estimate.seconds/60),sec=estimate.seconds%60;
    byId('filmEstimate').textContent=!items.length?'—':(min?min+'m '+String(sec).padStart(2,'0')+'s':estimate.seconds+' sec');
    const fmt=chooseMovieFormat();
    byId('filmFormat').textContent=fmt?(fmt.includes('mp4')?'MP4':'WebM'):'Niet beschikbaar';
    byId('filmEmptyState').hidden=items.length>0;
    editor.hidden=items.length===0;
    if(items.length){
      selectedIndex=Math.max(0,Math.min(selectedIndex,items.length-1));
      createUrls();drawPreview();drawTimeline();
    } else {
      releaseUrls();stopPreview();
    }
    notice.hidden=missing===0;
    if(missing)notice.textContent=missing+(missing===1?' eerder geselecteerd bestand bestaat niet meer.':' eerder geselecteerde bestanden bestaan niet meer.')+
      ' Je originele filmselectie is niet automatisch aangepast.';
    exportBtn.disabled=busy||!items.length||items.length>FILM_LIMIT||!fmt;
    exportBtn.textContent=busy?'Film wordt gemaakt…':'✦ Film maken op dit apparaat';
    if(items.length>FILM_LIMIT)inform('Kies maximaal '+FILM_LIMIT+' beelden om een film te maken.');
    if(!fmt)inform('Je browser ondersteunt geen export via canvas en MediaRecorder. De filmselectie blijft bewaard.');
  }
  function arrange(index,direction){
    const next=index+direction;
    if(busy||next<0||next>=items.length)return;
    const list=[...items];
    [list[index],list[next]]=[list[next],list[index]];
    try {
      // Reorder all existing IDs, including currently missing IDs, without losing
      // their selected status from the backed-up sidecar collection.
      const stored=[...getCollectionIds('film')];
      const visibleOrder=list.map(x=>x.id);
      const ordered=[...visibleOrder,...stored.filter(id=>!visibleOrder.includes(id))];
      saveFilmOrder(ordered);
      items=list;selectedIndex=next;stopPreview();refresh();
      inform('Montagevolgorde opgeslagen.');
    } catch(_) { inform('Volgorde kon niet worden opgeslagen. Probeer opnieuw.'); }
  }
  function remove(id){
    if(busy)return;
    try {
      setCollectionItem('film',id,false);
      items=items.filter(x=>x.id!==id);
      stopPreview();selectedIndex=0;refresh();
      inform('Uit de filmselectie gehaald. Het originele bestand blijft bewaard.');
    } catch(_) {inform('Selectie kon niet worden bijgewerkt. Het originele beeld is behouden.');}
  }
  function updateButtons(selector,value,field){
    state[field]=value;
    el.querySelectorAll(selector).forEach(b=>{
      const selected=b.dataset[field==='aspect'?'filmAspect':'filmSeconds']===String(value);
      b.classList.toggle('is-active',selected);
      b.setAttribute('aria-pressed',String(selected));
    });
    if(field==='aspect')drawPreview();
    const estimate=movieEstimate(items,state);
    byId('filmEstimate').textContent=estimate.seconds<60?estimate.seconds+' sec':
      Math.floor(estimate.seconds/60)+'m '+String(estimate.seconds%60).padStart(2,'0')+'s';
  }
  function tickPreview(){
    if(destroyed||busy||!playing||!items.length) {stopPreview();return;}
    selectedIndex=(selectedIndex+1)%items.length;
    drawPreview();
    timeline.querySelectorAll('.film-studio-shot').forEach((row,i)=>row.classList.toggle('is-selected',i===selectedIndex));
    const video=byId('filmPreview').querySelector('video');
    if(video){video.muted=true;video.play().catch(()=>{});}
  }
  function togglePlay(){
    if(busy||!items.length)return;
    if(playing){stopPreview();return;}
    playing=true;byId('filmPlay').textContent='Ⅱ Stop preview';
    const video=byId('filmPreview').querySelector('video');
    if(video){video.muted=true;video.play().catch(()=>{});}
    timer=setInterval(tickPreview,state.seconds*1000);
  }

  async function exportNow(){
    if(busy||destroyed||!items.length)return;
    stopPreview();releaseResult();inform('');
    busy=true;abort=new AbortController();
    byId('filmProgress').hidden=false;
    byId('filmCancel').hidden=false;
    exportBtn.disabled=true;exportBtn.textContent='Film wordt gemaakt…';
    const clips=items.map(({id,name,where})=>({id,name,where}));
    const options={...state,title:shorten(byId('filmTitle').value,65)||'My Birding Story'};
    const progress=({done,total,label})=>{
      if(destroyed)return;
      const value=Math.min(100,Math.round(done/Math.max(1,total)*100));
      byId('filmProgressLabel').textContent=label;
      byId('filmProgressValue').textContent=value+'%';
      byId('filmProgressBar').style.width=value+'%';
    };
    try {
      const result=await renderFilm({clips,options,signal:abort.signal,onProgress:progress});
      if(destroyed)return;
      resultBlob=result.blob;
      resultUrl=URL.createObjectURL(result.blob);
      const filename=slug(options.title)+'-'+new Date().toISOString().slice(0,10)+'.'+result.extension;
      byId('filmResult').hidden=false;
      byId('filmResultVideo').src=resultUrl;
      download.href=resultUrl;download.download=filename;
      inform('De film is klaar. Gebruik “Bewaar mijn film” om het bestand te downloaden.');
      byId('filmResult').scrollIntoView({behavior:'smooth',block:'nearest'});
    } catch(err) {
      if(!destroyed)inform(abort?.signal?.aborted
        ?'Export geannuleerd. De selectie en originele mediabestanden zijn behouden.'
        :'Filmexport mislukt ('+String(err?.name||'fout')+'): '+String(err?.message||'Onbekende fout'));
    } finally {
      busy=false;abort=null;
      if(!destroyed){
        byId('filmCancel').hidden=true;byId('filmProgress').hidden=true;
        refresh();
      }
    }
  }

  const onClick=e=>{
    if(e.target.closest('#filmBackToMedia')||e.target.closest('[data-film-route="media"]')){
      if(busy){inform('Stop de export eerst om dit scherm te verlaten.');return;}
      import('../../app.js').then(({navigate})=>navigate('media'));return;
    }
    const sel=e.target.closest('[data-film-select]');
    if(sel){if(!busy){selectedIndex=Number(sel.dataset.filmSelect);stopPreview();drawPreview();drawTimeline();}return;}
    const mv=e.target.closest('[data-film-move]');
    if(mv){arrange(Number(mv.dataset.filmMove),Number(mv.dataset.direction));return;}
    const rem=e.target.closest('[data-film-remove]');
    if(rem){remove(rem.dataset.filmRemove);return;}
    const direction=e.target.closest('[data-film-step]');
    if(direction && items.length&&!busy){
      stopPreview();selectedIndex=(selectedIndex+Number(direction.dataset.filmStep)+items.length)%items.length;
      drawPreview();drawTimeline();return;
    }
    const aspect=e.target.closest('[data-film-aspect]');
    if(aspect&&!busy){updateButtons('[data-film-aspect]',aspect.dataset.filmAspect,'aspect');return;}
    const seconds=e.target.closest('[data-film-seconds]');
    if(seconds&&!busy){updateButtons('[data-film-seconds]',Number(seconds.dataset.filmSeconds),'seconds');return;}
    if(e.target.closest('#filmPlay')){togglePlay();return;}
    if(e.target.closest('#filmExport')){exportNow();return;}
    if(e.target.closest('#filmCancel')){abort?.abort();return;}
  };
  const onInput=e=>{if(e.target.id==='filmTitle')state.title=shorten(e.target.value,65);};
  el.addEventListener('click',onClick);
  el.addEventListener('input',onInput);

  (async()=>{
    try {
      const selected=[...getCollectionIds('film')];
      const [records,loaded]=await Promise.all([
        getSightings(),
        Promise.all(selected.map(async id=>({id,photo:await getPhoto(id).catch(()=>null)}))),
      ]);
      if(destroyed)return;
      const bySighting=new Map(records.map(s=>[s.id,s]));
      const byPhoto=new Map();
      for(const s of records)for(const id of(s.photoIds||[]))byPhoto.set(id,s);
      missing=0;items=[];
      for(const {id,photo} of loaded){
        if(!(photo?.blob instanceof Blob)||!(/^(image|video)\//).test(typeOf(photo))){missing++;continue;}
        const sighting=bySighting.get(photo.sightingId)||byPhoto.get(id);
        const kind=typeOf(photo).startsWith('video/')?'video':'photo';
        items.push({id,photo,kind,name:sighting?.speciesName||photo.speciesName||'Vogelmoment',
          where:sighting?.locationName||'',date:sighting?.date||''});
      }
      refresh();
    } catch(_) {
      if(!destroyed) {
        byId('filmEmptyState').hidden=false;editor.hidden=true;
        inform('Filmselectie niet beschikbaar. Controleer de lokale opslag.');
      }
    }
  })();

  return()=>{
    destroyed=true;
    stopPreview();
    abort?.abort();
    el.removeEventListener('click',onClick);
    el.removeEventListener('input',onInput);
    releaseUrls();
    releaseResult();
  };
}
