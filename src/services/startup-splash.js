/**
 * Birdspot Library · five-second cinematic welcome splash.
 *
 * Runs before the app's module graph. The home route initializes underneath
 * and emits "birdspot:ready". Intro closes at five seconds, never before the
 * app is ready. Alleen de lokale introvoorkeur wordt bewaard.
 */
(() => {
  'use strict';
  const splash=document.getElementById('birdspotSplash');
  if(!splash)return;
  const key = 'birdspot-welcome-seen';
  try {
    if (localStorage.getItem(key) === '1') {
      splash.remove();
      return;
    }
  } catch (_) { /* Privéprofiel zonder opslag blijft bruikbaar. */ }
  const skip=splash.querySelector('#birdspotSplashSkip');
  const image=splash.querySelector('.birdspot-splash__art');
  const DURATION_MS=5000;
  let ready=false,elapsed=false,skipRequested=false,closing=false,removed=false;
  let dismissTimeout=null;
  const startedAt=performance.now();

  function finish(){
    if(removed)return;
    removed=true;
    try { localStorage.setItem(key, '1'); } catch (_) {}
    splash.remove();
    window.dispatchEvent(new CustomEvent('birdspot:splash-hidden',{
      detail:{elapsedMs:Math.round(performance.now()-startedAt)}
    }));
  }
  function maybeHide(){
    if(closing||!ready||(!elapsed&&!skipRequested))return;
    closing=true;
    splash.classList.add('is-exiting');
    splash.setAttribute('aria-hidden','true');
    skip?.setAttribute('disabled','');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else dismissTimeout=setTimeout(finish,550);
  }
  window.addEventListener('birdspot:ready',()=>{
    ready=true;
    maybeHide();
  },{once:true});
  skip?.addEventListener('click',()=>{
    if(!ready) {
      skipRequested=true;
      if(skip)skip.textContent='Opstarten…';
    } else skipRequested=true;
    maybeHide();
  });
  image?.addEventListener('error',()=>{
    splash.classList.add('image-unavailable');
    splash.querySelector('.birdspot-splash__fallback')?.removeAttribute('hidden');
  },{once:true});
  window.setTimeout(()=>{
    elapsed=true;
    maybeHide();
  },DURATION_MS);

  // If the application module fails, avoid an endless frozen splash.
  // Expose the failure without claiming that loading finished successfully.
  window.setTimeout(()=>{
    if(ready||removed)return;
    const note=splash.querySelector('.birdspot-splash__loading-note');
    if(note)note.textContent='Opstarten duurt langer dan normaal. Controleer je verbinding.';
    if(skip) {
      skip.textContent='Opnieuw laden';
      skip.addEventListener('click',()=>window.location.reload(),{once:true});
    }
  },12000);
})();
