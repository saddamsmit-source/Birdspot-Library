// Gebruik de bestaande sluitknoppen zodat elk scherm zijn eigen opruiming doet.
const layers = [
  ['.sheet-overlay.open', '#spPickerClose,#addSheetCancel,#detailClose,.signature-species-detail-close'],
  ['.signature-lightbox', '.signature-lightbox-close'],
  ['.lightbox', '.lightbox__close'],
  ['.confirm-overlay:not([hidden])', '#confirmCancel,.confirm-cancel'],
  ['.manual-pin-dialog', '#pinCancel'],
  ['.place-prompt', '.place-prompt__backdrop'],
  ['#mapDetailSheet.open', '#mapSheetClose'],
];

export function closeTopLayer() {
  const visible = layers.flatMap(([selector, close]) =>
    Array.from(document.querySelectorAll(selector), layer => ({
      layer,
      button: layer.querySelector(close),
      z: Number(getComputedStyle(layer).zIndex) || 0,
    })));
  visible.sort((a, b) => b.z - a.z ||
    (a.layer.compareDocumentPosition(b.layer) & Node.DOCUMENT_POSITION_FOLLOWING ? 1 : -1));
  if (visible[0]?.button) {
    // Tijdens opslaan mag Terug de formuliertransactie niet afbreken.
    if (!visible[0].layer.querySelector('#addSheetSubmit:disabled')) visible[0].button.click();
    return true;
  }
  const pin = document.querySelector('#mapPinPanel:not([hidden]) #mapPinCancel');
  const filters = document.querySelector('#mapFilterBtn[aria-expanded="true"]');
  const button = pin || filters;
  button?.click();
  return Boolean(button);
}
