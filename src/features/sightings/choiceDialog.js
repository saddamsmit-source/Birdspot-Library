/**
 * UX-01A — kleine keuzedialoog (geen browser confirm), in de bestaande .confirm-overlay-stijl.
 *
 * choices: [{ value, label, kind: 'primary'|'secondary'|'danger', cancel?: true }]
 * - De keuze met cancel:true is de veilige keuze: Escape, browser-terug (navigation.js klikt
 *   .confirm-cancel) en een tik naast de dialoog kiezen die.
 * - Focus start op de eerste keuze en blijft in de dialoog.
 * @returns {Promise<string>} de gekozen value
 */
import { escHtml } from '../../utils/html.js';

export function choiceDialog({ title, body, note = '', choices, id = 'choiceDialog' }) {
  return new Promise(resolve => {
    document.getElementById(id)?.remove();
    const safe = choices.find(choice => choice.cancel) || choices[0];
    const dialog = document.createElement('div');
    dialog.className = 'confirm-overlay choice-overlay';
    dialog.id = id;
    dialog.innerHTML = `
      <div class="confirm-dialog choice-dialog" role="alertdialog" aria-modal="true"
        aria-labelledby="${id}Title" aria-describedby="${id}Body">
        <div class="confirm-dialog__title" id="${id}Title">${escHtml(title)}</div>
        <div class="confirm-dialog__body" id="${id}Body">${escHtml(body)}${note ? `<p class="choice-dialog__note">${escHtml(note)}</p>` : ''}</div>
        <div class="choice-dialog__actions">
          ${choices.map(choice => `<button type="button" data-choice="${escHtml(choice.value)}"
            class="${choice.kind === 'danger' ? 'btn-danger' : choice.kind === 'primary' ? 'btn-primary' : 'btn-secondary'}${choice === safe ? ' confirm-cancel' : ''}">${escHtml(choice.label)}</button>`).join('')}
        </div>
      </div>`;
    const previous = document.activeElement;
    document.body.appendChild(dialog);
    const buttons = [...dialog.querySelectorAll('[data-choice]')];
    const finish = value => {
      document.removeEventListener('keydown', onKey, true);
      dialog.remove();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
      resolve(value);
    };
    function onKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        finish(safe.value);
      } else if (event.key === 'Tab') {
        const index = buttons.indexOf(document.activeElement);
        const next = event.shiftKey ? (index <= 0 ? buttons.length - 1 : index - 1) : (index + 1) % buttons.length;
        event.preventDefault();
        buttons[next].focus();
      }
    }
    document.addEventListener('keydown', onKey, true);
    dialog.addEventListener('click', event => {
      const button = event.target.closest('[data-choice]');
      if (button) finish(button.dataset.choice);
      else if (event.target === dialog) finish(safe.value);
    });
    buttons[0].focus({ preventScroll: true });
  });
}
