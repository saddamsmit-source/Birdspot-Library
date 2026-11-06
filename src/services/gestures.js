/** Page pinch is disabled; Leaflet's own two-finger map zoom is untouched. */
const onMap = target => target instanceof Element && !!target.closest('.leaflet-container');
function preventPagePinch(event) {
  if (event.touches?.length > 1 && !onMap(event.target)) event.preventDefault();
}
document.addEventListener('touchmove',preventPagePinch,{passive:false});
document.addEventListener('gesturestart',event=>{if(!onMap(event.target))event.preventDefault();},{passive:false});
document.addEventListener('gesturechange',event=>{if(!onMap(event.target))event.preventDefault();},{passive:false});
