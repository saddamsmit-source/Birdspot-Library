/**
 * Birdspot Signature — Personal Birding Journal Phase 3
 * The user's existing sightings are the one source of truth.
 * All photo links are to IndexedDB media, never stock/AI imagery.
 */
import { getSightings } from '../../data/sightings.js';
import { getPhoto } from '../../data/db.js';
import { openDetailSheet } from '../sightings/detailSheet.js';
import { getPhotoUrl,revokePhotoUrl } from '../../utils/photoUrl.js';
import { escHtml } from '../../utils/html.js';
import { validDay,availableYears } from '../insights/analytics.js';

const safe=x=>escHtml(String(x??''));
const fmtDay=value=>{
  const day=validDay(value);
  return day?new Date(day+'T12:00:00').toLocaleDateString('nl-NL',{
    day:'numeric',month:'long',year:'numeric',
  }):'Datum niet ingevuld';
};
const fmtShort=value=>{
  const d=validDay(value);
  return d?new Date(d+'T12:00:00').toLocaleDateString('nl-NL',{
    day:'numeric',month:'short',year:'numeric',
  }):'Onbekend';
};
const identity=row=>typeof row.speciesId==='string'&&row.speciesId?row.speciesId:
  (typeof row.speciesName==='string'?row.speciesName.toLocaleLowerCase('nl'):'');

export function renderJournal(el) {
  let destroyed=false;
  let items=[],year='all',search='',order='newest',visible=18,generation=0;
  const urls=new Set();
  const BATCH=18;

  el.classList.add('signature-screen','signature-journal','phase3-journal-screen');
  el.innerHTML='<header class="signature-page-hero signature-page-hero--journal phase3-journal-hero">' +
    '<span class="signature-kicker">BIRDSPOT / THE FIELD JOURNAL</span>' +
    '<h1>Mijn Birding Journal</h1>' +
    '<p>Alle ontmoetingen met vogels vertellen samen jouw eigen verhaal. Van het eerste moment tot de meest recente ontdekking.</p>' +
    '<div class="signature-orbit" aria-hidden="true"></div>' +
    '<button type="button" class="phase3-hero-link" id="journalToInsights">Ontdek mijn Inzichten ↗</button></header>' +
    '<div class="signature-content phase3-journal-content">' +
      '<div class="phase3-journal-intro"><span class="signature-eyebrow">YOUR JOURNEY</span>' +
        '<h2>Mijn verhaal in de natuur</h2>' +
        '<p>Je eigen waarnemingen, notities en foto’s — als een digitaal veldboek.</p></div>' +
      '<div class="signature-milestones phase3-journal-milestones" id="journalMilestones" aria-label="Mijn mijlpalen"></div>' +
      '<div class="phase3-journal-feature" id="journalFeature" hidden></div>' +
      '<section class="phase3-journal-search-panel" aria-label="Dagboek filters">' +
        '<div class="signature-section-head"><div><span class="signature-eyebrow">FIELD NOTES</span>' +
          '<h2>Mijn waarnemingen</h2></div><span id="journalResultsCount" class="signature-count"></span></div>' +
        '<div class="phase3-journal-filters">' +
          '<label>Zoeken<input id="journalSearch" type="search" placeholder="Vogel, locatie of notitie…" autocomplete="off"></label>' +
          '<label>Jaar<select id="journalYear" aria-label="Filter dagboek op jaar"><option value="all">Alle jaren</option></select></label>' +
          '<label>Volgorde<select id="journalSort" aria-label="Sorteer dagboek">' +
            '<option value="newest">Nieuwste eerst</option><option value="oldest">Oudste eerst</option></select></label>' +
        '</div></section>' +
      '<div id="journalTimeline" class="signature-timeline phase3-journal-timeline" aria-live="polite">' +
        '<div class="signature-empty">Jouw dagboek wordt geladen…</div></div>' +
      '<button type="button" class="signature-more" id="journalMore" hidden>Meer waarnemingen bekijken</button>' +
    '</div>';

  const timeline=el.querySelector('#journalTimeline');
  const milestones=el.querySelector('#journalMilestones');
  const feature=el.querySelector('#journalFeature');
  const count=el.querySelector('#journalResultsCount');
  const yearSelect=el.querySelector('#journalYear');
  const more=el.querySelector('#journalMore');

  function releaseUrls() {
    urls.forEach(revokePhotoUrl);
    urls.clear();
  }

  function getFiltered() {
    let result=items.filter(s=>
      year==='all'||(validDay(s.date)&&s.date.slice(0,4)===year));
    if(search) result=result.filter(s=>
      [s.speciesName,s.locationName,s.notes,s.habitat].map(v=>String(v||''))
        .join(' ').toLocaleLowerCase('nl').includes(search));
    return [...result].sort((a,b)=>{
      const cmp=(validDay(a.date)||'').localeCompare(validDay(b.date)||'');
      if(cmp) return order==='newest'?-cmp:cmp;
      return String(a.time||'').localeCompare(String(b.time||''))*(order==='newest'?-1:1);
    });
  }

  function updateMilestones(filtered) {
    const species=new Set(filtered.map(identity).filter(Boolean));
    const places=new Set(filtered.map(s=>
      typeof s.locationName==='string'?s.locationName.trim().toLocaleLowerCase('nl'):'').filter(Boolean));
    const media=filtered.filter(s=>Array.isArray(s.photoIds)&&s.photoIds.length).length;
    milestones.innerHTML=[
      [species.size,'Vogelsoorten','✦'],
      [filtered.length,'Waarnemingen','⌖'],
      [places.size,'Locaties','◈'],
      [media,'Met media','▣'],
    ].map(([number,label,icon])=>
      '<div class="signature-milestone phase3-journal-milestone"><span aria-hidden="true">'+icon+'</span>'+
        '<strong>'+number+'</strong><small>'+label+'</small></div>').join('');
  }

  function updateFeature(filtered) {
    const latest=filtered.find(s=>validDay(s.date));
    feature.hidden=!latest;
    if(!latest){feature.innerHTML='';return;}
    feature.innerHTML='<span class="signature-eyebrow">RECENT DISCOVERY</span>' +
      '<div class="phase3-journal-feature-body"><div><h3>'+safe(latest.speciesName||'Onbekende soort')+'</h3>' +
      '<p>'+safe(fmtShort(latest.date))+
        (latest.locationName?' · '+safe(latest.locationName):'')+'</p>'+
      (latest.notes?'<blockquote>'+safe(String(latest.notes).slice(0,220))+'</blockquote>':'')+
      '</div><span class="phase3-journal-feature-mark" aria-hidden="true">✦</span></div>'+
      '<button type="button" data-journal-id="'+safe(latest.id)+'">Bekijk deze waarneming ↗</button>';
  }

  async function loadThumbnails(batch,token) {
    // Only the visible batch; photos remain stored in the original IDB store.
    const previews=batch.filter(s=>Array.isArray(s.photoIds)&&s.photoIds.length);
    for (const item of previews) {
      if(destroyed||token!==generation) return;
      const target=[...timeline.querySelectorAll('[data-journal-photo]')]
        .find(x=>x.dataset.journalPhoto===item.id);
      if(!target || !target.isConnected) continue;
      try {
        let photo=null;
        for (const id of item.photoIds) {
          const candidate=await getPhoto(id);
          if(candidate?.blob instanceof Blob && (candidate.blob.type||candidate.type||'').startsWith('image/')){
            photo=candidate;break;
          }
        }
        if(destroyed||token!==generation||!target.isConnected) return;
        if(!photo)continue;
        const url=getPhotoUrl(photo);
        if(!url)continue;
        urls.add(url);
        const img=document.createElement('img');
        img.alt='Eigen foto bij '+String(item.speciesName||'vogelwaarneming');
        img.loading='lazy';
        const release=()=>{revokePhotoUrl(url);urls.delete(url);};
        img.addEventListener('load',release,{once:true});
        img.addEventListener('error',release,{once:true});
        img.src=url;
        target.replaceChildren(img);
      } catch(_) {/* optional thumbnail cannot block the journal */ }
    }
  }

  function draw() {
    if(destroyed)return;
    generation++;
    releaseUrls();
    const filtered=getFiltered();
    count.textContent=filtered.length+(filtered.length===1?' resultaat':' resultaten');
    updateMilestones(filtered);
    updateFeature(filtered);
    const shown=filtered.slice(0,visible);
    more.hidden=filtered.length<=shown.length;
    if(!shown.length){
      timeline.innerHTML='<div class="signature-empty"><span aria-hidden="true">✦</span>'+
        '<h3>Geen waarnemingen gevonden</h3>'+
        '<p>'+(items.length?'Pas je filters aan om je eerdere vogelmomenten terug te vinden.':
          'Leg je eerste vogelwaarneming vast. Zo begint jouw persoonlijke veldboek.')+'</p></div>';
      return;
    }
    const byDay=new Map();
    for(const sighting of shown) {
      const key=validDay(sighting.date)||'onbekend';
      if(!byDay.has(key))byDay.set(key,[]);
      byDay.get(key).push(sighting);
    }
    timeline.innerHTML=[...byDay].map(([date,rows])=>
      '<section class="signature-journal-day phase3-journal-day"><h3 class="signature-journal-date">'+safe(fmtDay(date))+'</h3>'+
        rows.map(s=>
          '<button type="button" class="signature-journal-entry phase3-journal-entry" data-journal-id="'+safe(s.id)+'">'+
            '<span class="phase3-journal-photo" data-journal-photo="'+safe(s.id)+'" aria-hidden="true">✦</span>'+
            '<span class="signature-journal-copy"><strong>'+safe(s.speciesName||'Onbekende soort')+'</strong>'+
              '<small>'+safe(s.locationName||'Locatie niet vastgelegd')+
                (Number(s.count)>1?' · '+Number(s.count)+' vogels':'')+'</small>'+
              (s.notes?'<em>'+safe(String(s.notes).slice(0,140))+'</em>':'')+
            '</span><span class="signature-journal-arrow" aria-hidden="true">↗</span>'+
          '</button>').join('')+'</section>').join('');
    loadThumbnails(shown,generation);
  }

  const onInput=e=>{
    if(e.target.id==='journalSearch'){search=e.target.value.trim().toLocaleLowerCase('nl');visible=BATCH;draw();}
  };
  const onChange=e=>{
    if(e.target.id==='journalYear'){year=e.target.value;visible=BATCH;draw();}
    else if(e.target.id==='journalSort'){order=e.target.value;visible=BATCH;draw();}
  };
  const onClick=e=>{
    if(e.target.closest('#journalToInsights')){
      import('../../app.js').then(({navigate})=>navigate('insights'));return;
    }
    if(e.target.closest('#journalMore')){visible+=BATCH;draw();return;}
    const target=e.target.closest('[data-journal-id]');
    if(!target)return;
    const record=items.find(s=>s.id===target.dataset.journalId);
    if(!record)return;
    openDetailSheet(record,{
      onUpdated:()=>import('../../app.js').then(({navigate})=>navigate('journal',{force:true})),
      onDeleted:()=>import('../../app.js').then(({navigate})=>navigate('journal',{force:true})),
    });
  };
  el.addEventListener('input',onInput);
  el.addEventListener('change',onChange);
  el.addEventListener('click',onClick);

  (async()=>{
    try{
      const data=await getSightings();
      if(destroyed)return;
      items=Array.isArray(data)?data:[];
      const years=availableYears(items);
      for(const y of years) {
        const opt=document.createElement('option');
        opt.value=String(y);opt.textContent=String(y);
        yearSelect.appendChild(opt);
      }
      draw();
    }catch(_){
      if(!destroyed)timeline.innerHTML='<div class="signature-empty">Dagboek niet beschikbaar. Je waarnemingen zijn niet gewijzigd.</div>';
    }
  })();

  return()=>{
    destroyed=true;generation++;
    el.removeEventListener('input',onInput);
    el.removeEventListener('change',onChange);
    el.removeEventListener('click',onClick);
    releaseUrls();
  };
}
