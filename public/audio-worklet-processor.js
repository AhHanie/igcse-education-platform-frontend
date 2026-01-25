/**
 * Audio Worklet Processor for real-time audio capture
 * This processor captures audio samples and sends them to the main thread
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2400; // 50ms at 48kHz, or 100ms at 24kHz
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const channelData = input[0]; // Mono channel
    if (!channelData) {
      return true;
    }

    // Add samples to buffer
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];

      // When buffer is full, send to main thread
      if (this.bufferIndex >= this.bufferSize) {
        // Send a copy of the buffer
        this.port.postMessage({
          type: "audio",
          samples: this.buffer.slice(),
        });
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor("audio-capture-processor", AudioCaptureProcessor);

