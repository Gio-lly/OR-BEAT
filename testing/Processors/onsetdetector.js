registerProcessor('onsetdetector', class extends AudioWorkletProcessor{
    constructor(){super();}


    // 128 samples at a time
    process(inputs,outputs){
        console.log(inputs)
        return true;

        // onset detection

        
    }
})