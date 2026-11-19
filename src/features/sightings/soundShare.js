/**
 * Ronde 4 — Merlin-dubbelcheck: de lokale opname als WAV klaarzetten.
 * Merlin importeert mp3/m4a/wav (Cornell, Sound ID-support); MediaRecorder levert meestal webm/opus.
 * De WAV bevat alleen geluid: geen metadata, geen locatie, geen extra blokken.
 */
export const MERLIN_WAV_RATE = 44100;
export const MERLIN_WAV_NAME = 'birdspot-opname.wav';

export async function clipToWav(clip) {
  const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!Offline) throw new Error('WAV-omzetting is in deze browser niet beschikbaar');
  const decoded = await new Offline(1, 1, MERLIN_WAV_RATE).decodeAudioData(await clip.arrayBuffer());
  const frames = decoded.length, channels = decoded.numberOfChannels;
  if (!frames) throw new Error('De opname bevat geen geluid');
  const buffer = new ArrayBuffer(44 + frames * 2), view = new DataView(buffer);
  const text = (at, value) => { for (let i = 0; i < value.length; i++) view.setUint8(at + i, value.charCodeAt(i)); };
  text(0, 'RIFF'); view.setUint32(4, 36 + frames * 2, true); text(8, 'WAVE');
  text(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, MERLIN_WAV_RATE, true); view.setUint32(28, MERLIN_WAV_RATE * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, frames * 2, true);
  const data = [...Array(channels).keys()].map(c => decoded.getChannelData(c));
  for (let i = 0; i < frames; i++) {
    let sample = 0;
    for (const channel of data) sample += channel[i];
    sample = Math.max(-1, Math.min(1, sample / channels));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

/** Alleen de officiële Web Share API (bestanden); geen app-schema's of deep links. */
export function canShareFile(file) {
  try {
    return typeof navigator.share === 'function' && Boolean(navigator.canShare?.({ files: [file] }));
  } catch (_) {
    return false;
  }
}
