class OnSetDetector extends AudioWorkletProcessor {
    constructor() {
      super();
      this.samples = [];
        this.sampleRate = 44100;

        // Ascolta i messaggi dal main thread
        this.port.onmessage = (event) => {
            const { samples, sampleRate } = event.data;
            this.samples = samples;
            this.sampleRate = sampleRate;

            console.log(`Ricevuti ${samples.length} campioni a ${sampleRate} Hz.`);
            // Aggiungi qui il tuo algoritmo per rilevare gli onset.
        };
    }
  
    process(inputList, outputList, parameters) {
      // Using the inputs (or not, as needed),
      // write the output into each of the outputs
      // …

      return true;
    }
  }
  
  registerProcessor("onSetDetector", MyAudioProcessor);