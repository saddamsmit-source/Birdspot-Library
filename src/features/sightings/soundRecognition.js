const WINDOW = 32000 * 3;

export function startSoundRecognition(onStatus, onResults) {
  const worker = new Worker(new URL('./soundRecognitionWorker.js', import.meta.url), { type: 'module' });
  let buffer = new Float32Array(WINDOW);
  let offset = 0;
  let sampled = 0;
  let busy = false;
  let ready = false;
  let closed = false;

  function stop() {
    closed = true;
    worker.terminate();
  }

  function unavailable() {
    if (closed) return;
    onStatus('Automatische herkenning is nu niet beschikbaar. De opname loopt door.');
    stop();
  }

  worker.addEventListener('error', unavailable);
  worker.addEventListener('message', ({ data }) => {
    if (data.type === 'unavailable') { unavailable(); return; }
    if (data.type === 'ready') {
      ready = true;
      onStatus('Live herkenning actief. Bevestig zelf welke vogels je hoort.');
      return;
    }
    if (data.type === 'results') {
      busy = false;
      onResults(data.results, data.second);
    }
  });

  onStatus('Herkenning laden… De eerste keer wordt circa 82 MB gedownload.');
  return {
    push(frame) {
      if (closed) return;
      const available = Math.min(WINDOW - offset, frame.length);
      buffer.set(frame.subarray(0, available), offset);
      offset += available;
      sampled += frame.length;
      if (offset !== WINDOW) return;
      if (ready && !busy) {
        busy = true;
        const second = Math.max(0, Math.floor(sampled / 32000) - 3);
        worker.postMessage({ samples: buffer, second }, [buffer.buffer]);
        buffer = new Float32Array(WINDOW);
      }
      offset = frame.length - available;
      if (offset) buffer.set(frame.subarray(available), 0);
    },
    stop,
  };
}
