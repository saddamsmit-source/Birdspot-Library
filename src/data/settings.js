/**
 * Birdspot — kleine gebruikersinstellingen (K7).
 * Eén sleutel; onbekende velden blijven bewaard; ongeldige waarden vallen terug op de standaard.
 */
export const SETTINGS_KEY = 'birdspot-settings';
export const SETTINGS_SCHEMA = 1;
export const BACKUP_REMINDER_OPTIONS = Object.freeze([7, 30, 0]); // 0 = uit
const DEFAULTS = Object.freeze({ backupReminderDays: 30 });

export function loadSettings(storage = globalThis.localStorage) {
  let raw = {};
  try { raw = JSON.parse(storage.getItem(SETTINGS_KEY) || '{}') || {}; } catch (_) { raw = {}; }
  const out = { ...raw, schemaVersion: SETTINGS_SCHEMA };
  if (!BACKUP_REMINDER_OPTIONS.includes(out.backupReminderDays)) out.backupReminderDays = DEFAULTS.backupReminderDays;
  return out;
}

export function saveSetting(key, value, storage = globalThis.localStorage) {
  const next = { ...loadSettings(storage), [key]: value };
  try { storage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch (_) { /* privé-modus: alleen deze sessie */ }
  return loadSettings(storage);
}
