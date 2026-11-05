/**
 * Birdspot Signature · smooth cinematic marsh ambience
 *
 * Fixed camera, silent background, decorative only. All data cards render in
 * their own fully interactive content layer ABOVE this visual. No artificial
 * observation records, no geolocation, no audio, no images of the app UI.
 *
 * Prefer the local Artlist-generated MP4 asset when present; the same 9:16
 * scene has a smooth SVG/CSS fallback and continues to function offline.
 * Playback pauses when hidden/offscreen/reduced-motion/data-saving enabled.
 */
// Owner-approved Artlist-generated ambience, silent and vertical 9:16.
// Remote CDN link is signed for this single generated output; if it expires,
// the progressive SVG/CSS fallback continues to work without network.
const ASSET_URL = 'https://cms-toolkit-artifacts.artlist.io/content/-t-e-x-t_-t-o_-v-i-d-e-o-v1/media__10/-t-e-x-t_-t-o_-v-i-d-e-o-db1c51b8-2246-4298-8d26-30f51f4b8651.mp4?Expires=2109184465&Key-Pair-Id=K2ZDLYDZI2R1DF&Signature=juxvu3qt2us2sOsfJ5bkqBAScHeQJ0pg5buz-68EDclO2W08gzQMN9Eqdp5XFlGfRdALThnyzRPr9nmmRmKObiUQl~O5dALRDoH8gfSoF64DNG5ZstnN41k18oMoA43EBsbJ4JBTav0Ch6jtXotlZydTlOQtAVGJCTypqpQn06qbrQxn6ahWNgJmjGtKkG6Bk1nbNZrdliYJnjqY45YGrrlQ3b3IF8olN04191E4fVCBD3acFiFttGSDZUGwscbIuz6hnZBYsisAsTTnpYYKa9H-SgyRj56xHg~MM8mJhjYVM7LdpF1zMoMUYb5DALLuo6ekivIq7j8oNGNvl0cP4A__';
const H=1280,W=720;
const reed=(x,y,height,lean,width,colour='#0d2827')=>{
  const tipX=x+lean,tipY=y-height;
  return '<path d="M'+x+' '+y+' C'+(x+lean*.15)+' '+(y-height*.38)+
    ' '+(x+lean*.76)+' '+(y-height*.8)+' '+tipX+' '+tipY+
    '" stroke="'+colour+'" stroke-width="'+width+'" fill="none" stroke-linecap="round"/>';
};
function landscapeSvg(){
  const left=[[10,1230,450,-75,7],[40,1220,560,75,5],[67,1250,400,-34,7],
    [115,1280,640,-120,5],[143,1280,330,-35,6],[170,1280,590,35,4],
    [185,1210,340,-14,3],[225,1280,410,-66,4]];
  const right=[[535,1280,500,120,5],[565,1280,600,-35,7],[601,1260,340,35,6],
    [626,1280,710,110,5],[659,1280,470,-28,4],[694,1230,580,50,5],
    [711,1240,375,-11,6]];
  const waterRipples=Array.from({length:19},(_,i)=>{
    const y=766+i*27;
    const len=72+((i*79)%203);
    const x=410-((i*29)%188);
    return '<path d="M'+x+' '+y+' q'+(len*.5)+' -4 '+len+
      ' 0" stroke="#edc48d" stroke-width="'+(i%3===0?1.7:1)+
      '" stroke-opacity="'+(0.12+i*.008).toFixed(3)+'" fill="none"/>';
  }).join('');
  return '<svg class="ambient-wetland__illustration" viewBox="0 0 '+W+' '+H+
    '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'+
    '<defs>'+
      '<linearGradient id="ambientSky" x1="0" y1="0" x2=".72" y2="1">'+
        '<stop offset="0" stop-color="#0a2220"/>'+
        '<stop offset=".39" stop-color="#194a45"/>'+
        '<stop offset=".63" stop-color="#8e7959"/>'+
        '<stop offset="1" stop-color="#13322c"/></linearGradient>'+
      '<linearGradient id="ambientWater" x1=".2" y1="0" x2=".6" y2="1">'+
        '<stop offset="0" stop-color="#49695b"/>'+
        '<stop offset=".3" stop-color="#274e48"/>'+
        '<stop offset="1" stop-color="#071e1d"/></linearGradient>'+
      '<radialGradient id="ambientGlow">'+
        '<stop offset="0" stop-color="#ffdda2" stop-opacity=".78"/>'+
        '<stop offset=".21" stop-color="#ffc77b" stop-opacity=".42"/>'+
        '<stop offset="1" stop-color="#d0a26d" stop-opacity="0"/></radialGradient>'+
      '<linearGradient id="ambientReflection" x1="0" y1="0" x2="0" y2="1">'+
        '<stop offset="0" stop-color="#f4c584" stop-opacity=".46"/>'+
        '<stop offset=".5" stop-color="#ce986b" stop-opacity=".13"/>'+
        '<stop offset="1" stop-color="#5c7362" stop-opacity="0"/></linearGradient>'+
      '<filter id="ambientBlur"><feGaussianBlur stdDeviation="15"/></filter>'+
    '</defs>'+
    '<rect width="720" height="1280" fill="url(#ambientSky)"/>'+
    '<ellipse cx="570" cy="690" rx="320" ry="330" fill="url(#ambientGlow)"/>'+
    '<circle class="ambient-wetland__sun" cx="556" cy="704" r="22" fill="#fbd49c" opacity=".93"/>'+
    '<path d="M0 750 Q60 708 112 731 T232 721 T372 727 T500 710 T720 740 L720 835 L0 835Z" fill="#213f37" opacity=".9"/>'+
    '<path d="M0 764 Q90 752 210 757 Q320 738 410 753 Q570 745 720 756 L720 815 L0 815Z" fill="#102e2a"/>'+
    '<rect x="0" y="760" width="720" height="520" fill="url(#ambientWater)"/>'+
    '<path d="M490 760 L610 760 L710 1280 L400 1280Z" fill="url(#ambientReflection)"/>'+
    '<g class="ambient-wetland__ripples">'+waterRipples+'</g>'+
    '<g class="ambient-wetland__mist" filter="url(#ambientBlur)" opacity=".34">'+
      '<ellipse cx="340" cy="754" rx="450" ry="44" fill="#bfd8c2"/>'+
      '<ellipse cx="560" cy="830" rx="360" ry="32" fill="#ced4c1" opacity=".48"/>'+
    '</g>'+
    '<g class="ambient-wetland__reed-left">'+left.map(x=>reed(...x)).join('')+
      '<path d="M74 902 L60 887 L79 876 M112 890 L96 874 M181 1004 L164 982" stroke="#203f34" stroke-width="3" fill="none"/>'+
    '</g>'+
    '<g class="ambient-wetland__reed-right">'+right.map(x=>reed(...x)).join('')+'</g>'+
    '<path d="M634 746 q6 -8 12 0 q6 -8 12 0 M650 732 q4 -6 9 0 q5 -6 10 0" stroke="#182e2c" stroke-width="2" fill="none" opacity=".7"/>'+
    '</svg>';
}

export function buildAmbientBackdrop(){
  return '<div class="ambient-wetland__stage" aria-hidden="true">'+
    landscapeSvg()+
    // Source is attached lazily by the controller if the user is in view.
    '<video id="ambientWetlandVideo" class="ambient-wetland__video" muted playsinline loop '+
      'preload="none" disablepictureinpicture disableremoteplayback '+
      'data-src="'+ASSET_URL+'" aria-hidden="true"></video>'+
    '<div class="ambient-wetland__darken"></div>'+
  '</div>';
}

export function initAmbientBackdrop(el,ctx){
  const zone=el.querySelector('#ambientWetland');
  const video=el.querySelector('#ambientWetlandVideo');
  const toggle=el.querySelector('#ambientWetlandToggle');
  if(!zone||!video)return()=>{};
  const motion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const saveData=Boolean(navigator.connection?.saveData);
  let inView=false,manualPause=false,destroyed=false,loaded=false,
    failed=false,observer=null;
  const reduced=()=>Boolean(motion?.matches);
  function update(){
    if(destroyed||ctx.destroyed)return;
    const paused=manualPause||document.hidden||!inView||reduced()||saveData;
    zone.classList.toggle('is-paused',paused);
    toggle?.setAttribute('aria-pressed',String(manualPause));
    if(toggle){
      toggle.textContent=manualPause?'▶':'Ⅱ';
      toggle.setAttribute('aria-label',manualPause?
        'Hervat bewegende natuurachtergrond':'Pauzeer bewegende natuurachtergrond');
    }
    if(paused){video.pause();return;}
    if(!loaded&&!failed){
      loaded=true;
      video.src=video.dataset.src;
      video.load();
    }
    if(loaded&&!failed)video.play().catch(()=>{
      // Browser may disallow autoplay, or MP4 may be unavailable offline:
      // keep the animated CSS fallback (which is smooth by design).
      zone.classList.remove('is-video-ready');
    });
  }
  const onCanPlay=()=>{
    if(!destroyed&&!reduced()){
      zone.classList.add('is-video-ready');
      update();
    }
  };
  const onError=()=>{
    failed=true;loaded=false;
    video.pause();
    video.removeAttribute('src');
    zone.classList.remove('is-video-ready');
  };
  const onToggle=()=>{
    manualPause=!manualPause;
    update();
  };
  const onVis=()=>update();
  video.addEventListener('canplay',onCanPlay);
  video.addEventListener('error',onError);
  toggle?.addEventListener('click',onToggle);
  document.addEventListener('visibilitychange',onVis);
  motion?.addEventListener?.('change',onVis);
  if('IntersectionObserver'in window){
    observer=new IntersectionObserver(entries=>{
      inView=Boolean(entries[0]?.isIntersecting);
      update();
    },{threshold:.03});
    observer.observe(zone);
  }else {inView=true;update();}
  return()=>{
    destroyed=true;
    observer?.disconnect();
    document.removeEventListener('visibilitychange',onVis);
    motion?.removeEventListener?.('change',onVis);
    toggle?.removeEventListener('click',onToggle);
    video.removeEventListener('canplay',onCanPlay);
    video.removeEventListener('error',onError);
    video.pause();video.removeAttribute('src');video.load();
  };
}
