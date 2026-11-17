import { soundLabelIndex } from './soundLabelIndex.js';

const RUNTIME = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31.1/dist/';
const MODEL = 'https://media.githubusercontent.com/media/birdnet-team/birdnet-live-app/02bd0150b66fbf07f6c91d99802975822dd4d9fc/assets/models/BirdNET%2B_V3.0_Global_10K_FP16_BNL.onnx';
const MODEL_SHA256 = 'dbf8d450703323defeeaa9e7379995e97a146256f6b8bbc2a33b58776ed4bafe';
const MIN_CONFIDENCE = 0.72;

async function loadRecognizer() {
  const [ort, response] = await Promise.all([
    import(RUNTIME + 'ort.wasm.min.mjs'),
    fetch(MODEL, { cache: 'force-cache', credentials: 'omit' }),
  ]);
  if (!response.ok) throw new Error('Herkenningsmodel niet geladen');
  const bytes = await response.arrayBuffer();
  const sha = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (sha !== MODEL_SHA256) throw new Error('Herkenningsmodel heeft een onverwachte controlecode');
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.wasmPaths = RUNTIME;
  const session = await ort.InferenceSession.create(new Uint8Array(bytes), { executionProviders: ['wasm'] });
  self.onmessage = async ({ data: { samples, second } }) => {
    if (samples.length !== 96000) return;
    const input = new ort.Tensor('float32', samples, [1, 96000]);
    let predictions;
    try {
      ({ predictions } = await session.run({ input }, ['predictions']));
      const results = soundLabelIndex.flatMap(([index, id]) =>
        predictions.data[index] >= MIN_CONFIDENCE ? [{ id, score: predictions.data[index] }] : []
      ).sort((a, b) => b.score - a.score);
      self.postMessage({ type: 'results', results, second });
    } catch (_) {
      self.postMessage({ type: 'unavailable' });
    } finally {
      predictions?.dispose();
      input.dispose();
    }
  };
  self.postMessage({ type: 'ready' });
}

loadRecognizer().catch(() => self.postMessage({ type: 'unavailable' }));
