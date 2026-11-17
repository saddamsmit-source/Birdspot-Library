/** Check of het gekozen bestand op dit apparaat kan worden weergegeven. */
export async function openMediaPreview(file, kind) {
  const url = URL.createObjectURL(file);
  try {
    if (!file.size) throw new Error('Leeg bestand');
    if (kind === 'image') {
      const image = new Image();
      image.src = url;
      await image.decode();
    } else {
      const player = document.createElement(kind);
      try {
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Bestand laden duurt te lang')), 8000);
          player.onloadedmetadata = () => {
            clearTimeout(timer);
            if (kind === 'video' && !player.videoWidth) reject(new Error('Geen videobeeld'));
            else resolve();
          };
          player.onerror = () => {
            clearTimeout(timer);
            reject(new Error('Onleesbaar bestand'));
          };
          player.preload = 'metadata';
          player.src = url;
        });
      } finally {
        player.onloadedmetadata = player.onerror = null;
        player.removeAttribute('src');
        player.load();
      }
    }
    return url;
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}
