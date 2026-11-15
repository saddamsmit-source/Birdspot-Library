export const LEVELS_PER_SECOND = 8;
const QUIET_LEVEL = 0.005;
const CHANNEL_RATE = 32000;
const FRAME_SAMPLES = CHANNEL_RATE / LEVELS_PER_SECOND;

export function elapsedLabel(seconds) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function drawSoundTimeline(canvas, levels, seconds, hits = []) {
  const pen = canvas.getContext('2d');
  const { width, height } = canvas;
  const middle = height / 2;
  const bins = Math.max(1, Math.floor(width / 4));
  const stride = Math.max(1, Math.ceil(levels.length / bins));
  const displayLength = Math.max(24, levels.length);
  pen.clearRect(0, 0, width, height);
  pen.fillStyle = getComputedStyle(canvas).color;
  pen.globalAlpha = 0.2;
  pen.fillRect(0, middle, width, 1);
  let audible = false;
  for (let i = 0; i < levels.length; i += stride) {
    let peak = 0;
    for (let j = i; j < Math.min(i + stride, levels.length); j++) peak = Math.max(peak, levels[j]);
    const active = peak >= QUIET_LEVEL;
    audible ||= active;
    const size = active ? Math.min(height * 0.9, 8 + Math.sqrt(peak) * height * 2) : 2;
    pen.globalAlpha = active ? 0.95 : 0.36;
    pen.fillRect(i / displayLength * width, middle - size / 2, Math.max(1.5, 0.65 * stride / displayLength * width), size);
  }
  pen.globalAlpha = 0.9;
  pen.fillStyle = getComputedStyle(canvas).getPropertyValue('--sound-hit');
  for (const time of hits) {
    const x = Math.min(width - 2, time * LEVELS_PER_SECOND / displayLength * width);
    pen.fillRect(x, 2, 2, height - 4);
  }
  pen.globalAlpha = 1;
  canvas.dataset.hasSound = String(audible);
  canvas.dataset.seconds = String(seconds);
}

export function createSoundMonitor(stream, { onLevel, onFrame, onPcmReady }) {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) { onPcmReady(false); return () => {}; }
  let context;
  try { context = new AudioEngine({ sampleRate: CHANNEL_RATE }); }
  catch (_) { context = new AudioEngine(); }
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  const frame = new Float32Array(analyser.fftSize);
  source.connect(analyser);
  let stopped = false;
  let processor;
  const meter = setInterval(() => {
    if (processor || context.state !== 'running') return;
    analyser.getFloatTimeDomainData(frame);
    onLevel(frameLevel(frame));
  }, 1000 / LEVELS_PER_SECOND);

  context.resume().catch(() => {});
  if (context.audioWorklet && context.sampleRate === CHANNEL_RATE) {
    context.audioWorklet.addModule(new URL('./soundPcmWorklet.js', import.meta.url))
      .then(() => {
        if (stopped) return;
        const node = new AudioWorkletNode(context, 'birdspot-pcm', { processorOptions: { size: FRAME_SAMPLES } });
        const silent = context.createGain();
        silent.gain.value = 0;
        node.port.onmessage = ({ data }) => {
          if (stopped) return;
          onLevel(frameLevel(data));
          onFrame(data);
        };
        source.connect(node);
        node.connect(silent).connect(context.destination);
        processor = node;
        onPcmReady(true);
      }).catch(() => { if (!stopped) onPcmReady(false); });
  } else onPcmReady(false);

  return () => {
    stopped = true;
    clearInterval(meter);
    processor?.port.close();
    context.close().catch(() => {});
  };
}

function frameLevel(samples) {
  let energy = 0;
  for (const sample of samples) energy += sample * sample;
  return Math.sqrt(energy / samples.length);
}
