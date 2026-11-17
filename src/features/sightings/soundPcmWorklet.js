class BirdspotPcm extends AudioWorkletProcessor {
  constructor({ processorOptions }) {
    super();
    this.size = processorOptions.size;
    this.frame = new Float32Array(this.size);
    this.offset = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel) return true;
    for (const value of channel) {
      this.frame[this.offset++] = value;
      if (this.offset === this.frame.length) {
        this.port.postMessage(this.frame, [this.frame.buffer]);
        this.frame = new Float32Array(this.size);
        this.offset = 0;
      }
    }
    return true;
  }
}

registerProcessor('birdspot-pcm', BirdspotPcm);
