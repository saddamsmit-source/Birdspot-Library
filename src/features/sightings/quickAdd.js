import { mountSoundSession } from './soundSession.js';
const binoculars = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 6-2 3-2 8h7l1-8-2-3H7Zm10 0 2 3 2 8h-7l-1-8 2-3h2Z"/><path d="M10 12h4M7 6V4m10 2V4"/><circle cx="6.5" cy="17" r="2.5"/><circle cx="17.5" cy="17" r="2.5"/></svg>';
const sound = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 9v6M6 5v14M10 10v4M14 3v18M18 7v10M22 10v4"/></svg>';
export function openQuickAdd({onChoose,onSoundSaved}={}) {
 if(document.getElementById('quickAddSheet'))return;
 const trigger=document.activeElement, overlay=document.createElement('div');
 overlay.id='quickAddSheet';overlay.className='sheet-overlay open';
 const start=()=>[
  '<button type="button" class="quick-add-option" data-quick-action="seen"><span class="quick-add-icon">',binoculars,'</span><span><strong>Waarneming toevoegen</strong><small>Kies een soort en plaats een pin</small></span></button>',
  '<button type="button" class="quick-add-option" data-quick-action="sound"><span class="quick-add-icon">',sound,'</span><span><strong>Geluid herkennen</strong><small>Neem op, BirdNET stelt voor, optioneel Merlin</small></span></button>'
 ].join('');
 overlay.innerHTML=[
  '<div class="sheet quick-add-sheet" role="dialog" aria-modal="true" aria-labelledby="quickAddTitle">',
  '<div class="sheet__header"><h2 class="sheet__title" id="quickAddTitle" tabindex="-1">Wat wil je vastleggen?</h2><button type="button" class="btn-close" id="addSheetCancel">Sluiten</button></div>',
  '<div class="quick-add-options" id="quickAddOptions">',start(),'</div></div>'
 ].join('');
 let closed=false,disposeSound;
 const title=()=>overlay.querySelector('#quickAddTitle');
 const options=overlay.querySelector('#quickAddOptions');
 const close=(restoreFocus=true,confirmed=false)=>{
  if(closed)return;
  if(!confirmed&&disposeSound?.requestExit?.(()=>close(restoreFocus,true)))return;
  closed=true;disposeSound?.();document.removeEventListener('keydown',onKey);overlay.remove();
  if(restoreFocus&&trigger?.isConnected)trigger.focus({preventScroll:true});
 };
 const go=initial=>{close(true);onChoose?.(initial);};
 const soundPage=()=>{
  title().textContent='Geluid herkennen';
  disposeSound=mountSoundSession(options,sightings=>{close();onSoundSaved?.(sightings);});
  options.insertAdjacentHTML('beforeend','<button type="button" class="quick-add-back" data-quick-action="back">Terug naar keuzes</button>');
  options.scrollTop=0;
  title().focus({preventScroll:true});
 };
 const onKey=event=>{
  if(closed||!overlay.contains(document.activeElement))return;
  if(event.key==='Escape'){event.preventDefault();close();return;}
  if(event.key!=='Tab')return;
  const focusables=[...overlay.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea,summary,audio[controls]')]
    .filter(e=>e.checkVisibility?.() ?? Boolean(e.getClientRects().length));
  if(!focusables.length)return;
  const first=focusables[0],last=focusables.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 };
 overlay.addEventListener('click',event=>{
  if(closed)return;
  if(event.target===overlay||event.target.closest('#addSheetCancel')){close();return;}
  const button=event.target.closest('[data-quick-action]');if(!button)return;
  switch(button.dataset.quickAction){
   case 'seen':go({observationMethod:'seen',identificationSource:'self'});break;
   case 'sound':soundPage();break;
   case 'back':{
    const back=()=>{disposeSound?.();disposeSound=undefined;title().textContent='Wat wil je vastleggen?';options.innerHTML=start();title().focus({preventScroll:true});};
    if(!disposeSound?.requestExit?.(back))back();
    break;
   }
  }
 });
 document.body.appendChild(overlay);document.addEventListener('keydown',onKey);title().focus({preventScroll:true});
}
