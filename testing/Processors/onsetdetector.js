
import { FFT } from './fft.js';
// Codice migliorato dell'AudioWorkletProcessor
registerProcessor('onsetdetector', class extends AudioWorkletProcessor {
    constructor() {
        super();

        
        this.previousSpectrum = null;
        this.sampleRate = sampleRate;
        this.buffer =new Float32Array(1024)
        this.bufferIndex=0; // Aumentato per una maggiore risoluzione spettrale
        this.hopSize = this.windowSize / 4;  // Campioni da saltare
        this.thresholdMultiplier = 1.5;  // Moltiplicatore per la soglia dinamica
        this.smoothingFactor = 0.9;  // Fattore di smoothing per lo spettro
        this.currentSampleIndex = 0;
        this.lastOnsetTime = 0;  // Tempo dell'ultimo onset
        this.MIN_ONSET_INTERVAL = 0.5;  // 0.5 secondi tra gli onset (intervallo minimo)
        this.onsetTimestamps = [];
    }

    process(inputList, outputList,parameters) {
        
        const inputChannelData = inputList[0];
        
        // Verifica che i dati audio siano presenti
        if (!inputChannelData || inputChannelData.length < 2) {
            console.warn("Dati audio insufficienti o mancanti.");
            this.port.postMessage(this.onsetTimestamps);
            this.onsetTimestamps= [];
            return false;  // Ritorna true ma senza fare nulla se i dati sono insufficienti
        }

        const leftChannel = inputChannelData[0];
        const rightChannel = inputChannelData[1];
        // Calcola gli spettri per entrambi i canali
        const spectrumLeft = this.calculateFFT(leftChannel);
        const spectrumRight = this.calculateFFT(rightChannel);

        // Confronta gli spettri e rileva gli onset
        if (this.previousSpectrum) {
            // Controlla se c'è un onset nel canale sinistro o destro
            if (this.isOnsetDetected(spectrumLeft) || this.isOnsetDetected(spectrumRight)) {
                // Calcola il tempo dell'onset
                const currentTime = this.currentSampleIndex / this.sampleRate;
                console.log(`Onset detected at ${currentTime.toFixed(3)} seconds`);

                this.onsetTimestamps.push(currentTime);
            }
        }

        // Incrementa l'indice del campione
        this.currentSampleIndex += this.hopSize;

        // Memorizza lo spettro corrente per il prossimo confronto
        this.previousSpectrum = spectrumLeft;

        return true;
    }

    calculateFFT(samples) {
        if (!samples || samples.length === 0) {
            console.warn("Segnale vuoto, non eseguire FFT.");
            return [];  // Se il segnale è vuoto, ritorna un array vuoto
        }
        return FFT(samples); // Usa la funzione FFT per calcolare lo spettro
    }

    isOnsetDetected(currentSpectrum) {
        if (!this.previousSpectrum) return false;

        // Calcola la differenza tra lo spettro attuale e quello precedente
        let sumDifference = 0;
        for (let i = 0; i < currentSpectrum.length; i++) {
            sumDifference += Math.abs(currentSpectrum[i] - this.previousSpectrum[i]);
        }

        // Calcola una soglia dinamica basata sulla deviazione standard
        const threshold = this.getDynamicThreshold(currentSpectrum);

        // Verifica se la differenza tra gli spettri supera la soglia dinamica
        if (sumDifference < threshold) {
            return false;  // Non è un onset significativo
        }

        // Calcola il tempo corrente
        const currentTime = this.currentSampleIndex / this.sampleRate;
        if (currentTime - this.lastOnsetTime < this.MIN_ONSET_INTERVAL) {
            return false; // L'onset è troppo vicino al precedente
        }

        // Calcola la forza del picco spettrale
        const peakValue = this.getPeakValue(currentSpectrum);

        // Se il picco è troppo basso, ignoriamo l'onset
        const minPeakThreshold = 0.5;  // Valore arbitrario che puoi regolare
        if (peakValue < minPeakThreshold) {
            return false;  // Non è un onset significativo
        }

        // Se supera tutte le verifiche, è un onset valido
        this.lastOnsetTime = currentTime;
        return true;
    }

    // Calcola una soglia dinamica basata sulla media e la deviazione standard
    getDynamicThreshold(currentSpectrum) {
        const mean = currentSpectrum.reduce((sum, value) => sum + value, 0) / currentSpectrum.length;
        const variance = currentSpectrum.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / currentSpectrum.length;
        const stddev = Math.sqrt(variance);

        // La soglia dinamica è la media + moltiplicatore * deviazione standard
        return mean + this.thresholdMultiplier * stddev;
    }

    // Ottiene il valore di picco del segnale spettrale
    getPeakValue(spectrum) {
        let maxValue = 0;
        for (let i = 0; i < spectrum.length; i++) {
            if (spectrum[i] > maxValue) {
                maxValue = spectrum[i];
            }
        }
        return maxValue;
    }
});
