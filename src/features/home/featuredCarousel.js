/**
 * Cinematic editorial bird hero — no manual filters or browse buttons.
 * 60-second wall-clock slideshow, 50+ mixed bird species. No background timers
 * while the application is hidden; elapsed time determines the correct item.
 * Species identification facts from Birdspot's own field-guide database.
 *
 * Wikimedia Commons photographs are independent editorial references,
 * never presented as the owner's actual sightings. Dynamic photos are chosen
 * by scientific name with verified Commons licenses and individual credit.
 */
import { FEATURED_BIRDS,SHOWCASE_INTERVAL_MS,nextSlideDelay,shuffledBirds } from './specialBirds.js';
import { commonsBirdPhoto } from './commonsLookup.js';
import { SPECIES } from '../../data/species.js';

const originalTips={
  wielewaal:'Felgeel mannetje met zwarte vleugels. Vaak hoor je de fluitende zang vóór je de vogel ziet.',
  nachtegaal:'Onopvallend bruin met rossige staart en een krachtige, afwisselende zang uit dicht struikgewas.',
  baardman:'Het mannetje heeft een grijs hoofd met opvallende zwarte baardstrepen en beweegt behendig door riet.',
  rietzanger:'Lichte wenkbrauwstreep, donkere kruin en een snelle, gevarieerde zang.',
  steppekievit:'Slanke kievit met lange poten, donkere kruin en sterke gezichtstekening; zeer zeldzaam in Nederland.',
  kluut:'Zwart-wit verenkleed en een lange, dunne omhooggebogen snavel; foerageert in ondiep water.',
  zeearend:'Enorm brede vleugels, zware snavel en wigvormige staart; jonge vogels zijn donkerder.',
  'rode-wouw':'Roestrood met diep gevorkte staart en lichte vlakken onder de vleugels.',
  kerkuil:'Groot, wit hartvormig gezicht, lichte onderzijde en vrijwel geluidloze vlucht rond schemering.',
  velduil:'Geelbruine uil met donkere polsvlekken, vaak laag jagend over open grasland.',
  dwergmeeuw:'Kleine sierlijke meeuw met relatief korte snavel; volwassen zomerbirds hebben donkere vleugelonderzijde.',
  drieteenmeeuw:'Echte zeevogel met zwarte poten, gele snavel en donkere vleugelpunten.',
  roerdomp:'Bruine rietcamouflage en een diepe, hoempende roep; zelden goed zichtbaar.',
  purperreiger:'Slanke reiger met een lange hals en warme roodbruine en grijze tinten.',
  scharrelaar:'Turkooisblauwe vleugels met donkere punten; opvallend in vlucht.',
  bijeneter:'Slanke, bontgekleurde vogel met lange spitse vleugels en een zachte rollende roep.',
};
const byLatin=new Map(SPECIES.map(s=>[s.nameSci.toLowerCase(),s]));
function summary(bird) {
  const catalog=byLatin.get(bird.latin.toLowerCase());
  if(bird.dynamicPhoto)return bird.where;
  const tip=originalTips[bird.id]||catalog?.fieldmarks||'Let op de veren, snavel en vliegwijze.';
  return 'Herkenning: '+tip+' Waar kijken: '+bird.where;
}
function birdCredit(credit) {
  if(!credit)return 'Fotoreferentie niet beschikbaar';
  return 'Foto: '+(credit.author||'Wikimedia Commons')+' · '+(credit.license||'bron');
}
export function initFeaturedCarousel(el,ctx){
  const stage=el.querySelector('#slideshow');
  if(!stage)return()=>{};
  const photo=stage.querySelector('#featuredBirdImage');
  const name=stage.querySelector('#featuredBirdName');
  const latin=stage.querySelector('#featuredBirdLatin');
  const place=stage.querySelector('#featuredBirdWhere');
  const credit=stage.querySelector('#featuredBirdCredit');
  const CLOCK_KEY='birdspot-showcase-epoch';
  const SEED_KEY='birdspot-showcase-order-seed';
  let origin=Date.now(),seed=(Math.random()*0xffffffff)>>>0;
  try {
    const stored=Number(localStorage.getItem(CLOCK_KEY));
    if(stored>0&&stored<=Date.now())origin=stored;
    else localStorage.setItem(CLOCK_KEY,String(origin));
    const previous=Number(localStorage.getItem(SEED_KEY));
    if(previous>0)seed=previous>>>0;
    else localStorage.setItem(SEED_KEY,String(seed));
  }catch(_){}
  const sequence=shuffledBirds(seed);
  let timer=null,active=null,serial=0,destroyed=false;
  const onLoad=()=>{
    if(!destroyed){
      stage.classList.remove('has-no-photo');
      stage.classList.add('has-photo');
    }
  };
  const onError=()=>{
    if(!destroyed){
      stage.classList.add('has-no-photo');
      stage.classList.remove('has-photo');
    }
  };
  photo.addEventListener('load',onLoad);
  photo.addEventListener('error',onError);
  function visibleIndex(now=Date.now()){
    return Math.floor(Math.max(0,now-origin)/SHOWCASE_INTERVAL_MS)%sequence.length;
  }
  async function applyBird(){
    if(destroyed||ctx.destroyed)return;
    const bird=sequence[visibleIndex()];
    if(!bird||bird.id===active)return;
    active=bird.id;
    const request=++serial;
    stage.classList.add('has-no-photo');
    stage.classList.remove('has-photo');
    photo.removeAttribute('src');
    photo.alt='Fotografische referentie: '+bird.nl;
    name.textContent=bird.nl;
    latin.textContent=bird.latin;
    place.textContent=summary(bird);
    credit.removeAttribute('href');
    credit.textContent='Fotoreferentie wordt geladen…';
    let resource=bird.image?{
      image:bird.image,source:bird.source,author:bird.author,license:bird.license
    }:null;
    // A flight photograph is preferred for the barn owl where a suitable,
    // licensed search result exists, with the verified static fallback.
    if(bird.dynamicPhoto||bird.id==='kerkuil'){
      const commons=await commonsBirdPhoto(bird);
      if(commons)resource=commons;
    }
    if(destroyed||ctx.destroyed||serial!==request)return;
    if(resource?.image){
      credit.textContent=birdCredit(resource);
      credit.href=resource.source;
      credit.target='_blank';credit.rel='noopener noreferrer';
      photo.src=resource.image;
    }else{
      credit.textContent='Foto niet beschikbaar · '+bird.latin;
      stage.classList.add('has-no-photo');
    }
  }
  function sync(){
    if(destroyed||ctx.destroyed)return;
    applyBird();
  }
  function schedule(){
    clearTimeout(timer);
    if(destroyed||document.hidden||ctx.destroyed)return;
    timer=setTimeout(()=>{
      sync();
      schedule();
    },Math.max(100,nextSlideDelay(Date.now(),origin)+25));
  }
  const onVis=()=>{
    if(document.hidden){clearTimeout(timer);}
    else{sync();schedule();}
  };
  document.addEventListener('visibilitychange',onVis);
  sync();schedule();
  return()=>{
    destroyed=true;serial++;
    clearTimeout(timer);
    document.removeEventListener('visibilitychange',onVis);
    photo.removeEventListener('load',onLoad);
    photo.removeEventListener('error',onError);
    photo.removeAttribute('src');
  };
}
