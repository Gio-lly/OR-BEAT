registerProcessor('onsetdetector',class extends AudioWorkletProcessor{
    constructor(){super();}



    process(inputs,outputs){
        console.log(inputs)
        return true;


        
    }
})