class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs) {
    // Get the input audio data
    const inputAudioData = inputs[0];
    const channelData = inputs[0]; // Assuming a single channel for simplicity

    // Send the frequency data to the component using a custom message
    this.port.postMessage({
      type: 'frequency-data',
      data: inputAudioData[0]
    });

    // Return true to indicate that the processor is ready to process more audio
    return true;
  }
}
  
registerProcessor('audio-processor', AudioProcessor);
