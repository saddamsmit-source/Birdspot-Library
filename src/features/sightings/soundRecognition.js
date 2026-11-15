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
      if (closed || !frame?.length) return;
      let read = 0;
      // Always advance the timeline, including while the ~82 MB model is still loading
      // or inference is busy. Old full windows must NEVER be replayed as fresh audio.
      while (read < frame.length) {
        const amount = Math.min(WINDOW - offset, frame.length - read);
        buffer.set(frame.subarray(read, read + amount), offset);
        offset += amount;
        read += amount;
        if (offset !== WINDOW) continue;
        if (ready && !busy) {
          busy = true;
          const second = Math.max(0, Math.floor((sampled + read) / 32000) - 3);
          worker.postMessage({ samples: buffer, second }, [buffer.buffer]);
        }
        // Drop the just-finished window when not ready/busy; keep collecting
        // the next real-time slice instead of resending stale, misleading audio.
        buffer = new Float32Array(WINDOW);
        offset = 0;
      }
      sampled += frame.length;
    },
    stop,
  };
}
