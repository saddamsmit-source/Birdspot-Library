/**
 * Signature Edition · rotating editorial species gallery.
 *
 * A displayed slide is determined by the wall clock (60-second blocks).
 * No timer runs while the app is hidden or terminated. When opened again the
 * current species is recalculated, making it appear to have kept rotating.
 * Photos are licensed Wikimedia Commons references, not personal sightings.
 */
import {BIRD_THEMES,birdsForTheme,birdAtTime,nextSlideDelay,SHOWCASE_INTERVAL_MS} from './specialBirds.js';

export function initFeaturedCarousel(el,ctx){
  const stage=el.querySelector('#slideshow');
  if(!stage)return ()=>{};
  const photo=stage.querySelector('#featuredBirdImage');
  const backdrop=stage.querySelector('#featuredBirdFallback');
  const name=stage.querySelector('#featuredBirdName');
  const latin=stage.querySelector('#featuredBirdLatin');
  const place=stage.querySelector('#featuredBirdWhere');
  const category=stage.querySelector('#featuredBirdCategory');
  const credit=stage.querySelector('#featuredBirdCredit');
  const order=stage.querySelector('#featuredBirdPosition');
  const select=stage.querySelector('#featuredBirdTheme');
  const prev=stage.querySelector('#featuredPrev');
  const next=stage.querySelector('#featuredNext');
  const progress=stage.querySelector('#featuredBirdProgress');
  let theme='all',manual=null,timer=null,activeId=null,slot=Math.floor(Date.now()/SHOWCASE_INTERVAL_MS),destroyed=false;
  const storageKey='birdspot-showcase-theme';

  try{
    const saved=localStorage.getItem(storageKey);
    if(BIRD_THEMES.some(([key])=>key===saved))theme=saved;
  }catch(_){/* Storage not needed for slide functionality */}
  select.innerHTML='';
  for(const [key,label] of BIRD_THEMES){
    const option=document.createElement('option');
    option.value=key;option.textContent=label;select.appendChild(option);
  }
  select.value=theme;
  const onImageError=()=>{if(!destroyed)stage.classList.add('has-no-photo')};
  const onImageLoad=()=>{if(!destroyed)stage.classList.remove('has-no-photo')};
  photo.addEventListener('error',onImageError);
  photo.addEventListener('load',onImageLoad);

  function current(){
    const group=birdsForTheme(theme);
    if(!group.length)return {bird:null,index:0,group};
    const index=manual===null?Math.floor(Date.now()/SHOWCASE_INTERVAL_MS)%group.length:
      (manual+group.length)%group.length;
    return {bird:group[index],index,group};
  }
  function render(){
    if(destroyed||ctx.destroyed)return;
    const {bird,index,group}=current();
    if(!bird)return;
    if(activeId!==bird.id){
      stage.classList.add('is-changing');
      activeId=bird.id;
      stage.classList.add('has-no-photo'); // fallback remains until image loads
      photo.alt='Fotografische referentie: '+bird.nl;
      photo.src=bird.image;
      name.textContent=bird.nl;
      latin.textContent=bird.latin;
      place.textContent=bird.where;
      category.textContent=BIRD_THEMES.find(([id])=>id===bird.theme)?.[1]||'Bijzondere vogels';
      credit.textContent='Foto: '+bird.author+' · '+bird.license;
      credit.href=bird.source;
      credit.target='_blank';credit.rel='noopener noreferrer';
      window.setTimeout(()=>{if(!destroyed)stage.classList.remove('is-changing')},450);
    }
    order.textContent=(index+1)+' / '+group.length;
    const millis=Date.now()%SHOWCASE_INTERVAL_MS;
    progress.style.setProperty('--slide-progress',(millis/SHOWCASE_INTERVAL_MS*100).toFixed(2)+'%');
  }
  function schedule(){
    clearTimeout(timer);
    if(document.hidden||destroyed)return;
    timer=window.setTimeout(()=>{
      if(destroyed||ctx.destroyed)return;
      slot=Math.floor(Date.now()/SHOWCASE_INTERVAL_MS);
      manual=null;
      render();
      schedule();
    },Math.max(80,nextSlideDelay(Date.now())+25));
  }
  function changeTheme(e){
    theme=e.target.value;
    manual=null;
    try{localStorage.setItem(storageKey,theme)}catch(_){}
    activeId=null;
    render();schedule();
  }
  function step(d){
    const {index,group}=current();
    if(!group.length)return;
    manual=(index+d+group.length)%group.length;
    activeId=null;
    render();
    // Automatic cycling resumes on the next global minute boundary.
  }
  const onPrev=()=>step(-1);
  const onNext=()=>step(1);
  const onVisibility=()=>{
    if(document.hidden)clearTimeout(timer);
    else{manual=null;activeId=null;render();schedule();}
  };
  select.addEventListener('change',changeTheme);
  prev.addEventListener('click',onPrev);
  next.addEventListener('click',onNext);
  document.addEventListener('visibilitychange',onVisibility);
  render();schedule();
  return()=>{
    destroyed=true;clearTimeout(timer);
    select.removeEventListener('change',changeTheme);
    prev.removeEventListener('click',onPrev);
    next.removeEventListener('click',onNext);
    photo.removeEventListener('error',onImageError);
    photo.removeEventListener('load',onImageLoad);
    document.removeEventListener('visibilitychange',onVisibility);
    photo.removeAttribute('src');
  };
}
