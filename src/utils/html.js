/**
 * HTML utilities
 */

/** Escape HTML special characters voor veilige rendering in innerHTML */
export function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}
