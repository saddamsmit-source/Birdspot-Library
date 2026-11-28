/**
 * Aviandra Signature — Insights, Phase 3
 * Calculations run locally against canonical sightings; read-only, no API.
 */
import { appIcon, observationIcon } from '../../utils/icons.js';
import { getSightings } from '../../data/sightings.js';
import { SPECIES } from '../../data/species.js';
import { escHtml } from '../../utils/html.js';
import { calculateInsights } from './analytics.js';
import { OBSERVATION_BREAKDOWN } from '../sightings/evidence.js';

const PALETTE=['#d9b77e','#46bfb1','#619880','#84a3c1','#b1a2cb','#ca8f72'];
const GUIDE_IDS=new Set(SPECIES.map(species=>species.id));
const safe=x=>escHtml(String(x??''));
const fmtDay=day=>{
  if(!day) return '—';
  const date=new Date(day+'T12:00:00');
  return Number.isNaN(date.getTime())?'—':date.toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});
};

function chartSvg(stats, speciesMode, methods) {
  const values=stats.months.map(m=>speciesMode?m.uniqueSpecies:m.count);
  const max=Math.max(1,...values);
  const width=350,height=182,bottom=151,plot=131,bar=16;
  const segments=values.map((v,i)=>{
    const month=stats.months[i];
    const x=12+i*26;
    const height=v/max*plot;
    const summary=speciesMode ? `${month.name}: ${v}` :
      `${month.name}: ${v} · ${methods.map(([key,label])=>`${label} ${month.methods[key]}`).join(' · ')}`;
    const outline=`x="${x}" y="${bottom-height}" width="${bar}" height="${height}" rx="4"`;
    let offset=bottom;
    const stack=speciesMode
      ? `<rect ${outline} class="phase3-chart-bar phase3-chart-bar--teal"/>`
      : `<clipPath id="insights-month-${i}"><rect ${outline}/></clipPath>
         <g clip-path="url(#insights-month-${i})">${methods.filter(([key])=>month.methods[key]).map(([key])=>{
           const part=month.methods[key]/max*plot;
           offset-=part;
           return `<rect x="${x}" y="${offset}" width="${bar}" height="${part}"
                         class="phase3-chart-bar chart-method--${key}" data-method="${key}"/>`;
         }).join('')}</g>`;
    return `<g class="phase3-bar-group" data-month="${month.month}">
      <title>${safe(summary)}</title>${stack}
      <text x="${x+bar/2}" y="169" text-anchor="middle" class="phase3-chart-label">${month.name}</text>
    </g>`;
  }).join('');
  const guides=[...new Set([0,Math.ceil(max/2),max])].map(number=>{
    const y=bottom-number/max*plot;
    return `<line x1="8" y1="${y}" x2="320" y2="${y}" class="phase3-chart-grid"/>
      <text x="344" y="${y+3}" text-anchor="end" class="phase3-chart-grid-label">${number}</text>`;
  }).join('');
  return '<svg class="phase3-chart-svg" viewBox="0 0 '+width+' '+height+'" '+
    'role="img" aria-label="'+(speciesMode?'Soorten op je jaarlijst, cumulatief per maand':'Waarnemingen per maand')+' in '+stats.year+'">'+
    guides+segments+'</svg>';
}

function chartDetails(stats, speciesMode, methods, isOpen, action) {
  const keys=speciesMode ? [['uniqueSpecies', 'Soorten op jaarlijst']] : [['count', 'Totaal'], ...methods];
  return `<details class="phase3-month-detail"${isOpen ? ' open' : ''}>
    <summary>Bekijk aantallen per maand</summary>
    <table aria-label="${speciesMode ? 'Jaarlijst' : 'Waarnemingen'} per maand">
      <thead><tr><th scope="col">Maand</th>${keys.map(([,label])=>`<th scope="col">${safe(label)}</th>`).join('')}</tr></thead>
      <tbody>${stats.months.map(month=>`<tr><th scope="row">${action(
        `month-${month.month}`,month.name,
        speciesMode ? {route:'species',listYear:stats.year,listMonth:month.month} : {month:month.month},
        'phase3-month-link')}</th>
        ${keys.map(([key])=>`<td>${month[key] ?? month.methods[key]}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  </details>`;
}

function methodTotals(stats, methods, action) {
  return `<ul class="phase3-method-list" aria-label="Totaal per waarnemingswijze">
    ${methods.map(([key,label])=>`<li>${action(`method-${key}`,`
      <span aria-hidden="true">${observationIcon(key)}</span><span>${safe(label)}</span>
      <strong>${stats.fieldwork.methods[key]}</strong>`,{method:key},
      `phase3-method phase3-method--${key} phase3-method-link`)}</li>`).join('')}
  </ul>`;
}

function fieldworkMarkup(stats, action) {
  const { audioCount, notesCount, gpsCount, sourceReviewCount }=stats.fieldwork;
  const facts=[
    ['calendar','Dagen met waarnemingen',stats.activeDays,{group:'day'}],
    ['year','Maanden met waarnemingen',stats.activeMonths,{group:'month'}],
    ['pin','Waarnemingen met GPS',gpsCount,{route:'map',calendarYear:stats.year}],
    ['book','Waarnemingen met notities',notesCount,{filter:'notes'}],
    ['soundwave','Waarnemingen met eigen geluidsopname',audioCount,{filter:'audio'}],
    ['shield','Zelf gecontroleerde geluidssuggesties',sourceReviewCount,{filter:'reviewed'}],
  ];
  return `<section class="phase3-panel phase3-fieldwork">
    <div class="phase3-panel-head"><h3>In het veld</h3></div>
    <ul class="phase3-field-rows">${facts.map(([icon,label,count,target])=>`<li>${action(
      `field-${icon}`,`<span class="phase3-field-label">${appIcon(icon)}<span>${label}</span></span><strong>${count}</strong>`,
      target,'phase3-field-link phase3-link-arrow')}</li>`).join('')}</ul>
  </section>`;
}

function habitatChart(stats, action) {
  if(!stats.habitats.length) return '<div class="phase3-empty-small">Nog geen leefgebieden geregistreerd voor dit jaar.</div>';
  const total=stats.habitatTotal||1;
  let offset=0;
  const segments=stats.habitats.map((item,i)=>{
    const value=(item.count/total)*100,from=offset;
    offset+=value;
    return PALETTE[i%PALETTE.length]+' '+from.toFixed(3)+'% '+offset.toFixed(3)+'%';
  });
  const list=stats.habitats.map((item,i)=>`<li>${action(`habitat-${i}`,
    `<span class="phase3-legend-dot" aria-hidden="true" style="background:${PALETTE[i%PALETTE.length]}"></span>
     <span>${safe(item.name)}</span><strong>${item.count}</strong>`,
    {habitat:item.name},'phase3-habitat-legend-item phase3-link-arrow')}</li>`).join('');
  return '<div class="phase3-habitats">' +
    '<div class="phase3-habitat-donut" role="img" aria-label="'+stats.habitatTotal+' waarnemingen met leefgebied" '+
      'style="background:conic-gradient('+segments.join(',')+')"><div><strong>'+stats.habitatTotal+'</strong><small>met leefgebied</small></div></div>'+
    '<ul class="phase3-habitat-legend">'+list+'</ul></div>';
}

function topSpeciesMarkup(stats, action) {
  if (!stats.topSpecies.length) return '<div class="phase3-empty-small">'+(stats.registeredSpeciesCount
    ? 'Nog geen soorten op je jaarlijst. Geregistreerde suggesties en onzekere waarnemingen tellen niet mee.'
    : 'Nog geen soorten geregistreerd voor dit jaar.')+'</div>';
  const peak=Math.max(1,stats.topSpecies[0].count);
  return '<ol class="phase3-top-species">'+stats.topSpecies.map((s,i)=>{
    const speciesId=s.key.slice(3);
    const target=GUIDE_IDS.has(speciesId)?{route:'species',speciesId,linkedDetail:true}:{speciesId};
    return `<li>${action(`top-${i}`,`
      <span class="phase3-top-rank" aria-hidden="true">${String(i+1).padStart(2,'0')}</span>
      <span class="phase3-top-body"><span class="phase3-top-row"><strong>${safe(s.name)}</strong>
        <span>${countLabel(s.count)}</span></span>
        <span class="phase3-top-track" aria-hidden="true"><span style="width:${(s.count/peak*100).toFixed(1)}%"></span></span></span>`,
      target,'phase3-top-link phase3-link-arrow')}</li>`;
  }).join('')+'</ol>';
}

const countLabel=count=>`${count} ${count===1?'waarneming':'waarnemingen'}`;

function milestones(stats, action) {
  const cards=[];
  if(stats.first) cards.push({icon:'first',title:'Eerste waarneming',text:fmtDay(stats.first.date),
    target:stats.first.id?{route:'sightings',sightingId:stats.first.id,linkedDetail:true}:{date:stats.first.date}});
  if(stats.topMonth) cards.push({icon:'year',title:'Actiefste maand',text:stats.topMonth.name+' · '+countLabel(stats.topMonth.count),target:{month:stats.topMonth.month}});
  if(stats.mostActiveDay) cards.push({icon:'calendar',title:'Bijzondere dag',text:fmtDay(stats.mostActiveDay.date)+' · '+countLabel(stats.mostActiveDay.count),target:{date:stats.mostActiveDay.date}});
  if(!cards.length) return '<div class="phase3-empty-small">Leg je eerste vogelwaarneming vast om persoonlijke mijlpalen te ontdekken.</div>';
  return '<div class="phase3-achievement-grid">'+cards.map(c=>action(`moment-${c.icon}`,
    `<span aria-hidden="true">${appIcon(c.icon)}</span><span><strong>${safe(c.title)}</strong><small>${safe(c.text)}</small></span>`,
    c.target,'phase3-achievement phase3-link-arrow')).join('')+'</div>';
}

export function renderInsights(el, { year: initialYear, chartMode, detailsOpen: initialDetailsOpen, onSearchSelect, rememberTarget } = {}) {
  let destroyed=false,items=[],year=initialYear??null,mode=chartMode==='species'?'species':'observations';
  let hasObservations=false;
  const destinations=new Map();
  el.classList.add('signature-screen','phase3-insights-screen');
  el.innerHTML='<header class="signature-page-hero phase3-insights-hero">' +
    '<span class="signature-kicker">AVIANDRA / FIELD INTELLIGENCE</span>' +
    '<h1>Mijn Inzichten</h1>' +
    '<p>Jouw ontdekkingstocht, zichtbaar gemaakt in cijfers, leefgebieden en bijzondere momenten.</p>' +
    '<div class="signature-orbit" aria-hidden="true"></div>' +
    '<button type="button" id="insightsToJournal" class="phase3-hero-link">Open mijn Birding Journal ↗</button></header>'+
    '<div class="signature-content phase3-insights-content">' +
      '<div class="phase3-insights-controls"><h2>In vogelvlucht</h2>'+
      '<label>Jaar <select id="insightsYear" aria-label="Selecteer statistiekjaar"></select></label></div>'+
      '<div id="insightsBody" aria-live="polite"><div class="signature-empty">Inzichten worden berekend…</div></div>'+
    '</div>';
  const select=el.querySelector('#insightsYear'),body=el.querySelector('#insightsBody');

  function draw() {
    if(destroyed) return;
    const stats=calculateInsights(items,year);
    year=stats.year;
    hasObservations=Boolean(stats.total);
    destinations.clear();
    const action=(key,label,{route='journal',...target},className)=>
      (destinations.set(key,{route,...(route==='journal'?{year}:{}),...target}),
       `<button type="button" class="${className}" data-insights-action="${key}">${label}</button>`);
    const speciesMode=mode==='species';
    const methods=Object.entries(OBSERVATION_BREAKDOWN).filter(([key])=>key!=='unrecorded'||stats.fieldwork.methods.unrecorded);
    const detailsOpen=body.querySelector('.phase3-month-detail')?.open??initialDetailsOpen;
    if(!stats.total) {
      body.innerHTML='<section class="phase3-insights-empty"><span aria-hidden="true">✦</span>'+
        '<h3>Jouw ontdekkingen beginnen hier</h3><p>Er zijn nog geen waarnemingen met een geldige datum in '+stats.year+
        '. Voeg een vogelwaarneming toe om jouw inzichten op te bouwen.</p>'+
        '<button type="button" data-insights-route="journal">Open mijn dagboek ↗</button></section>';
      return;
    }
    body.innerHTML=
      '<div class="phase3-kpi-grid">'+[
        ['bird',stats.speciesCount,'Soorten op jaarlijst',{route:'species',listYear:year}],
        ['observations',stats.total,'Waarnemingen',{}],
        ['pin',stats.locationsCount,'Locaties',{filter:'location'}],
        ['media',stats.fieldwork.mediaCount,'Met beeld of geluid',{filter:'media'}],
      ].map(([icon,count,name,target])=>action(`overview-${icon}`,
        `<span aria-hidden="true">${appIcon(icon)}</span><strong>${count}</strong><small>${safe(name)}</small>`,
        target,`phase3-kpi phase3-metric--${icon} phase3-kpi-link`)).join('')+'</div>'+
      // UX-03R: ruw verschil altijd met eigen label, nooit stil meegeteld
      (stats.uncountedSpeciesCount?'<p class="phase3-count-note" id="insightsUncounted">'+stats.uncountedSpeciesCount+' '+
        (stats.uncountedSpeciesCount===1?'soort is':'soorten zijn')+' alleen geregistreerd als suggestie zonder eigen controle, '+
        '‘controle onbekend’ of ‘mogelijk’ en '+(stats.uncountedSpeciesCount===1?'telt':'tellen')+' niet mee. '+
        'Geregistreerde soorten in '+stats.year+': '+stats.registeredSpeciesCount+'.</p>':'')+
      '<section class="phase3-panel phase3-month-panel">'+
        '<div class="phase3-panel-head"><h3>Jaaroverzicht</h3>'+
          '<div class="phase3-segments" role="group" aria-label="Kies grafiektype">'+
          '<button type="button" data-chart-mode="observations" aria-pressed="'+(mode==='observations')+'">Waarnemingen</button>'+
          '<button type="button" data-chart-mode="species" aria-pressed="'+(mode==='species')+'">Soorten</button></div></div>'+
        '<p class="phase3-panel-sub">'+(speciesMode?'Cumulatief aantal soorten op je jaarlijst':'Waarnemingen per maand, uitgesplitst naar waarnemingswijze')+'</p>'+
        '<div class="phase3-chart-wrap">'+chartSvg(stats,speciesMode,methods)+'</div>'+
        (speciesMode?'':methodTotals(stats,methods,action))+
        chartDetails(stats,speciesMode,methods,detailsOpen,action)+
      '</section>'+
      fieldworkMarkup(stats,action)+
      '<section class="phase3-panel"><div class="phase3-panel-head"><h3>Mijn leefgebieden</h3></div>'+
        '<p class="phase3-panel-sub">Verdeling van de ingevulde leefgebieden bij je waarnemingen.</p>'+
        habitatChart(stats,action)+'</section>'+
      '<section class="phase3-panel"><div class="phase3-panel-head"><h3>Top 5 vogelsoorten</h3></div>'+
        '<p class="phase3-panel-sub">Alleen soorten op je jaarlijst; aantal = meetellende waarnemingen.</p>'+
        topSpeciesMarkup(stats,action)+'</section>'+
      '<section class="phase3-panel"><div class="phase3-panel-head"><h3>Bijzondere momenten</h3></div>'+
        milestones(stats,action)+'</section>'+
      (stats.unknownDateCount?'<p class="phase3-data-note">'+stats.unknownDateCount+
        (stats.unknownDateCount===1?' waarneming zonder geldige datum ontbreekt':' waarnemingen zonder geldige datum ontbreken')+
        ' in de jaarcijfers.</p>':'');
    body.querySelectorAll('[data-chart-mode]').forEach(btn=>{
      btn.classList.toggle('is-active',btn.dataset.chartMode===mode);
    });
  }

  const onChange=e=>{
    if(e.target.id==='insightsYear') { year=Number(e.target.value); rememberTarget?.({year}); draw(); }
  };
  const onToggle=e=>{
    if(e.target.matches('.phase3-month-detail')) rememberTarget?.({detailsOpen:e.target.open});
  };
  const onClick=e=>{
    const chart=e.target.closest('[data-chart-mode]');
    if(chart){
      if(chart.dataset.chartMode!==mode) {
        mode=chart.dataset.chartMode;
        rememberTarget?.({chartMode:mode});
        draw();
        body.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});
      }
      return;
    }
    const key=e.target.closest('[data-insights-action]')?.dataset.insightsAction;
    if(destinations.has(key)) {
      const details=body.querySelector('.phase3-month-detail');
      rememberTarget?.({year,chartMode:mode,detailsOpen:details?.open});
      onSearchSelect?.(destinations.get(key));
    } else if(e.target.closest('#insightsToJournal')||e.target.closest('[data-insights-route]')) {
      onSearchSelect?.({route:'journal',...(hasObservations?{year}:{})});
    }
  };
  el.addEventListener('change',onChange);
  el.addEventListener('click',onClick);
  el.addEventListener('toggle',onToggle,true);

  const ready=(async()=>{
    try {
      items=await getSightings();
      if(destroyed) return;
      const initial=calculateInsights(items,year);
      year=initial.year;
      const years=initial.years.length?initial.years:[initial.year];
      select.innerHTML=years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');
      select.value=String(initial.year);
      draw();
    } catch(_){
      if(!destroyed) body.innerHTML='<div class="signature-empty">Inzichten zijn niet beschikbaar. Je waarnemingen zijn niet gewijzigd.</div>';
    }
  })();

  return {ready,cleanup:()=>{
    destroyed=true;
    el.removeEventListener('change',onChange);
    el.removeEventListener('click',onClick);
    el.removeEventListener('toggle',onToggle,true);
  }};
}
