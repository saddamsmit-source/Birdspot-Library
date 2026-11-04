/**
 * Birdspot Signature — Insights, Phase 3
 * Calculations run locally against canonical sightings; read-only, no API.
 */
import { getSightings } from '../../data/sightings.js';
import { escHtml } from '../../utils/html.js';
import { calculateInsights } from './analytics.js';

const PALETTE=['#d9b77e','#46bfb1','#619880','#84a3c1','#b1a2cb','#ca8f72'];
const safe=x=>escHtml(String(x??''));
const fmtDay=day=>{
  if(!day) return '—';
  const date=new Date(day+'T12:00:00');
  return Number.isNaN(date.getTime())?'—':date.toLocaleDateString('nl-NL',{day:'numeric',month:'long',year:'numeric'});
};

function chartSvg(stats,mode) {
  const values=stats.months.map(m=>mode==='species'?m.uniqueSpecies:m.count);
  const max=Math.max(1,...values);
  const width=350,height=182,top=20,bottom=151,plot=bottom-top,bar=16,gap=12;
  const segments=values.map((v,i)=>{
    const x=15+i*(bar+gap);
    const h=v>0?Math.max(4,(v/max)*plot):0;
    const y=bottom-h;
    return '<g class="phase3-bar-group" role="listitem" aria-label="'+safe(stats.months[i].name)+' '+v+'">' +
      '<title>'+safe(stats.months[i].name)+': '+v+'</title>' +
      '<rect x="'+x+'" y="'+y.toFixed(2)+'" width="'+bar+'" height="'+h.toFixed(2)+
      '" rx="5" class="phase3-chart-bar '+(mode==='species'?'phase3-chart-bar--teal':'')+'"/>' +
      '<text x="'+(x+bar/2)+'" y="169" text-anchor="middle" class="phase3-chart-label">'+safe(stats.months[i].name)+'</text>'+
      '</g>';
  }).join('');
  const guides=[0,.5,1].map(n=>{
    const y=bottom-n*plot,number=Math.round(n*max);
    return '<line x1="8" y1="'+y+'" x2="344" y2="'+y+'" class="phase3-chart-grid"/>' +
      '<text x="344" y="'+(y-5)+'" text-anchor="end" class="phase3-chart-grid-label">'+number+'</text>';
  }).join('');
  return '<svg class="phase3-chart-svg" viewBox="0 0 '+width+' '+height+'" '+
    'role="img" aria-label="'+(mode==='species'?'Unieke soorten, cumulatief per maand':'Waarnemingen per maand')+' in '+stats.year+'">'+
    guides+segments+'</svg>';
}

function habitatChart(stats) {
  if(!stats.habitats.length) return '<div class="phase3-empty-small">Nog geen leefgebieden geregistreerd voor dit jaar.</div>';
  const total=stats.habitatTotal||1;
  let offset=0;
  const segments=stats.habitats.map((item,i)=>{
    const value=(item.count/total)*100,from=offset;
    offset+=value;
    return PALETTE[i%PALETTE.length]+' '+from.toFixed(3)+'% '+offset.toFixed(3)+'%';
  });
  const list=stats.habitats.map((item,i)=>'<li class="phase3-habitat-legend-item">' +
    '<span class="phase3-legend-dot" style="background:'+PALETTE[i%PALETTE.length]+'"></span>'+
    '<span>'+safe(item.name)+'</span><strong>'+item.count+'</strong></li>').join('');
  return '<div class="phase3-habitats">' +
    '<div class="phase3-habitat-donut" role="img" aria-label="'+stats.habitatTotal+' waarnemingen met leefgebied" '+
      'style="background:conic-gradient('+segments.join(',')+')"><div><strong>'+stats.habitatTotal+'</strong><small>met leefgebied</small></div></div>'+
    '<ul class="phase3-habitat-legend">'+list+'</ul></div>';
}

function topSpeciesMarkup(stats) {
  if (!stats.topSpecies.length) return '<div class="phase3-empty-small">Nog geen soorten geregistreerd voor dit jaar.</div>';
  const peak=Math.max(1,stats.topSpecies[0].count);
  return '<ol class="phase3-top-species">'+stats.topSpecies.map((s,i)=>
    '<li><span class="phase3-top-rank">'+String(i+1).padStart(2,'0')+'</span>'+
      '<div class="phase3-top-body"><div class="phase3-top-row"><strong>'+safe(s.name)+'</strong>'+
        '<span>'+s.count+' '+(s.count===1?'waarneming':'waarnemingen')+'</span></div>'+
        '<div class="phase3-top-track"><div style="width:'+((s.count/peak)*100).toFixed(1)+'%"></div></div></div>'+
    '</li>').join('')+'</ol>';
}

function milestones(stats) {
  const cards=[];
  if(stats.first) cards.push({icon:'✦',title:'Eerste waarneming',text:fmtDay(stats.first.date)});
  if(stats.topMonth) cards.push({icon:'◒',title:'Actiefste maand',text:stats.topMonth.name+' · '+stats.topMonth.count+' waarnemingen'});
  if(stats.mostActiveDay) cards.push({icon:'⌖',title:'Bijzondere dag',text:fmtDay(stats.mostActiveDay.date)+' · '+stats.mostActiveDay.count+' waarnemingen'});
  if(!cards.length) return '<div class="phase3-empty-small">Leg je eerste vogelwaarneming vast om persoonlijke mijlpalen te ontdekken.</div>';
  return '<div class="phase3-achievement-grid">'+cards.map(c=>
    '<article class="phase3-achievement"><span aria-hidden="true">'+c.icon+'</span><div><strong>'+safe(c.title)+
    '</strong><small>'+safe(c.text)+'</small></div></article>').join('')+'</div>';
}

export function renderInsights(el) {
  let destroyed=false,items=[],year=null,mode='observations';
  el.classList.add('signature-screen','phase3-insights-screen');
  el.innerHTML='<header class="signature-page-hero phase3-insights-hero">' +
    '<span class="signature-kicker">BIRDSPOT / FIELD INTELLIGENCE</span>' +
    '<h1>Mijn Inzichten</h1>' +
    '<p>Jouw ontdekkingstocht, zichtbaar gemaakt in cijfers, leefgebieden en bijzondere momenten.</p>' +
    '<div class="signature-orbit" aria-hidden="true"></div>' +
    '<button type="button" id="insightsToJournal" class="phase3-hero-link">Open mijn Birding Journal ↗</button></header>'+
    '<div class="signature-content phase3-insights-content">' +
      '<div class="phase3-insights-controls"><div><span class="signature-eyebrow">JOUW JAAR IN VOGELS</span>'+
      '<h2>In vogelvlucht</h2></div>'+
      '<label>Jaar <select id="insightsYear" aria-label="Selecteer statistiekjaar"></select></label></div>'+
      '<div id="insightsBody" aria-live="polite"><div class="signature-empty">Inzichten worden berekend…</div></div>'+
    '</div>';
  const select=el.querySelector('#insightsYear'),body=el.querySelector('#insightsBody');

  function draw() {
    if(destroyed) return;
    const stats=calculateInsights(items,year);
    year=stats.year;
    if(!stats.total) {
      body.innerHTML='<section class="phase3-insights-empty"><span aria-hidden="true">✦</span>'+
        '<h3>Jouw ontdekkingen beginnen hier</h3><p>Er zijn nog geen waarnemingen met een geldige datum in '+stats.year+
        '. Voeg een vogelwaarneming toe om jouw inzichten op te bouwen.</p>'+
        '<button type="button" data-insights-route="journal">Open mijn dagboek ↗</button></section>';
      return;
    }
    body.innerHTML=
      '<div class="phase3-kpi-grid">'+[
        ['✦',stats.speciesCount,'Vogelsoorten'],
        ['⌖',stats.total,'Waarnemingen'],
        ['◈',stats.locationsCount,'Locaties'],
        ['▣',stats.photographed,'Met media'],
      ].map(([icon,count,name])=>
        '<article class="phase3-kpi"><span aria-hidden="true">'+icon+'</span><strong>'+count+'</strong>'+
        '<small>'+safe(name)+'</small></article>').join('')+'</div>'+
      '<section class="phase3-panel phase3-month-panel">'+
        '<div class="phase3-panel-head"><div><span class="signature-eyebrow">THE YEAR IN FLIGHT</span>'+
          '<h3>Jaaroverzicht</h3></div>'+
          '<div class="phase3-segments" role="group" aria-label="Kies grafiektype">'+
          '<button type="button" data-chart-mode="observations" aria-pressed="'+(mode==='observations')+'">Waarnemingen</button>'+
          '<button type="button" data-chart-mode="species" aria-pressed="'+(mode==='species')+'">Soorten</button></div></div>'+
        '<p class="phase3-panel-sub">'+(mode==='species'?'Cumulatief aantal verschillende vogelsoorten':'Aantal geregistreerde waarnemingen per maand')+'</p>'+
        '<div class="phase3-chart-wrap">'+chartSvg(stats,mode)+'</div>'+
      '</section>'+
      '<section class="phase3-panel"><div class="phase3-panel-head"><div>'+
        '<span class="signature-eyebrow">WHERE BIRDS THRIVE</span><h3>Mijn leefgebieden</h3></div></div>'+
        '<p class="phase3-panel-sub">Alleen ingevulde leefgebieden. Niet-vastgelegde waarden tellen niet mee.</p>'+
        habitatChart(stats)+'</section>'+
      '<section class="phase3-panel"><div class="phase3-panel-head"><div>'+
        '<span class="signature-eyebrow">YOUR MOST ENCOUNTERED</span><h3>Top 5 vogelsoorten</h3></div></div>'+
        topSpeciesMarkup(stats)+'</section>'+
      '<section class="phase3-panel"><div class="phase3-panel-head"><div>'+
        '<span class="signature-eyebrow">YOUR PERSONAL MILESTONES</span><h3>Bijzondere momenten</h3></div></div>'+
        milestones(stats)+'</section>'+
      '<div class="phase3-data-note">Cijfers komen uitsluitend uit je eigen opgeslagen waarnemingen. '+
        'Geen verzonnen soorten of locaties.'+
        (stats.unknownDateCount?' '+stats.unknownDateCount+' waarneming(en) zonder geldige datum zijn niet in de jaarcijfers opgenomen.':'')+
        '</div>';
    body.querySelectorAll('[data-chart-mode]').forEach(btn=>{
      btn.classList.toggle('is-active',btn.dataset.chartMode===mode);
    });
  }

  const onChange=e=>{
    if(e.target.id==='insightsYear') { year=Number(e.target.value); draw(); }
  };
  const onClick=e=>{
    const chart=e.target.closest('[data-chart-mode]');
    if(chart){mode=chart.dataset.chartMode;draw();return;}
    if(e.target.closest('#insightsToJournal')||e.target.closest('[data-insights-route]')) {
      import('../../app.js').then(({navigate})=>navigate('journal'));
    }
  };
  el.addEventListener('change',onChange);
  el.addEventListener('click',onClick);

  (async()=>{
    try {
      items=await getSightings();
      if(destroyed) return;
      const initial=calculateInsights(items);
      year=initial.year;
      const years=initial.years.length?initial.years:[initial.year];
      select.innerHTML=years.map(y=>'<option value="'+y+'">'+y+'</option>').join('');
      select.value=String(initial.year);
      draw();
    } catch(_){
      if(!destroyed) body.innerHTML='<div class="signature-empty">Inzichten zijn niet beschikbaar. Je waarnemingen zijn niet gewijzigd.</div>';
    }
  })();

  return()=>{
    destroyed=true;
    el.removeEventListener('change',onChange);
    el.removeEventListener('click',onClick);
  };
}
