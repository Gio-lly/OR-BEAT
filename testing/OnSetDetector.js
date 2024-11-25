class OnSetDetector extends AudioWorkletProcessor {
    constructor() {
      super();
    }
  
    process(inputList, outputList, parameters) {
      // Using the inputs (or not, as needed),
      // write the output into each of the outputs
      // …
      return true;
    }
  }
  
  registerProcessor("onSetDetector", MyAudioProcessor);