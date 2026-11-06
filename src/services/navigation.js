/** Browser back belongs to the current sheet first, then to the app route. */
const STATE = 'birdspotRoute';
let lastRootBack = 0;
const visible = el => el && !el.hidden && el.getClientRects().length > 0;
function closeTopLayer() {
  // Reverse DOM order breaks equal-z-index ties in the same way as painting.
  const selectors = '.sheet-overlay.open,.signature-lightbox,.lightbox,.confirm-overlay,.manual-pin-dialog,.place-prompt,#mapDetailSheet.open,#mapPinPanel';
  const layers = [...document.querySelectorAll(selectors)].filter(visible)
    .map((el,index)=>({el,index,z:Number(getComputedStyle(el).zIndex)||0}))
    .sort((a,b)=>b.z-a.z||b.index-a.index);
  for (const {el} of layers) {
    const button = el.querySelector('.confirm-cancel,.signature-lightbox-close,.lightbox__close,#spPickerClose,#pinCancel,#addSheetCancel,#detailClose,.signature-species-detail-close,#mapSheetClose,#mapPinCancel');
    if (button && visible(button)) { button.click(); return true; }
    if (el.matches('.place-prompt')) {
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return true;
    }
  }
  return false;
}
export function recordRoute(route, replace = false) {
  const {birdspotRoot, ...previous} = history.state || {};
  const state = {...previous, [STATE]:route};
  history[replace ? 'replaceState' : 'pushState'](state,'');
}
export function installNavigation({navigate,current,toast}) {
  // Keep one root entry so the first Back on a freshly opened app can close a dialog.
  if (!history.state?.[STATE] || history.state?.birdspotRoot) {
    history.replaceState({...history.state,[STATE]:'home',birdspotRoot:true},'');
    recordRoute('home');
    history.replaceState({[STATE]:'home'},'');
  }
  window.addEventListener('popstate', event => {
    const route = current() || 'home';
    if (closeTopLayer()) { recordRoute(route); return; }
    if (event.state?.birdspotRoot) {
      if (route === 'home' && Date.now()-lastRootBack < 1800) { history.back(); return; }
      lastRootBack = Date.now();
      recordRoute('home');
      history.replaceState({[STATE]:'home'},'');
      navigate('home',{history:false,force:true});
      toast('Nogmaals terug om de app te verlaten.');
      return;
    }
    navigate(event.state?.[STATE] || 'home',{history:false,force:true});
  });
  return history.state?.[STATE] || 'home';
}
