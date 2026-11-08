/** Browser back belongs to the current sheet first, then to the app route. */
import { closePhotoInfo } from '../utils/photoInfo.js';

const STATE = 'birdspotRoute';
let lastRootBack = 0;
let sequence = 0;
const visible = el => el && !el.hidden && el.getClientRects().length > 0;
function closeTopLayer() {
  const search = document.querySelector('#appSearchDialog[open]');
  if (search) { search.querySelector('.app-search-close').click(); return true; }
  // Reverse DOM order breaks equal-z-index ties in the same way as painting.
  const selectors = '.sheet-overlay.open,.signature-lightbox,.lightbox,.confirm-overlay,.manual-pin-dialog,.place-prompt,#mapDetailSheet.open,#mapPinPanel';
  const layers = [...document.querySelectorAll(selectors)].filter(visible)
    .map((el,index)=>({el,index,z:Number(getComputedStyle(el).zIndex)||0}))
    .sort((a,b)=>b.z-a.z||b.index-a.index);
  for (const {el} of layers) {
    if (closePhotoInfo(el)) return true;
    const button = el.querySelector('#confirmCancel,.confirm-cancel,.signature-lightbox-close,.lightbox__close,#spPickerClose,#pinCancel,#addSheetCancel,#detailClose,.signature-species-detail-close,#mapSheetClose,#mapPinCancel');
    if (button && visible(button)) {
      if (!el.querySelector('#addSheetSubmit:disabled')) button.click();
      return true;
    }
    if (el.matches('.place-prompt')) {
      document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return true;
    }
  }
  const home = document.querySelector('#screen-home');
  if (visible(home) && closePhotoInfo(home)) return true;
  const filter = document.querySelector('.species-filter[open] > summary');
  if (visible(filter)) { filter.click(); filter.focus({preventScroll:true}); return true; }
  return false;
}
export function recordRoute(route, replace = false, entry = `${performance.timeOrigin}:${++sequence}`) {
  history[replace ? 'replaceState' : 'pushState']({ [STATE]: route, birdspotEntry: entry }, '');
  return entry;
}
export function installNavigation({navigate,current,currentEntry,toast}) {
  // Keep one root entry so the first Back on a freshly opened app can close a dialog.
  if (!history.state?.[STATE] || history.state?.birdspotRoot) {
    history.replaceState({[STATE]:'home',birdspotRoot:true},'');
    recordRoute('home');
  } else if (!history.state.birdspotEntry) {
    recordRoute(history.state[STATE], true);
  }
  window.addEventListener('popstate', event => {
    const route = current() || 'home';
    if (closeTopLayer()) { recordRoute(route, false, currentEntry()); return; }
    if (event.state?.birdspotRoot) {
      if (route === 'home' && Date.now()-lastRootBack < 1800) { history.back(); return; }
      lastRootBack = Date.now();
      recordRoute('home');
      navigate('home',{history:false,force:true});
      toast('Nogmaals terug om de app te verlaten.');
      return;
    }
    navigate(event.state?.[STATE] || 'home',{history:false,force:true});
  });
  return history.state?.[STATE] || 'home';
}
