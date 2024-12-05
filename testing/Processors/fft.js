// ######################################## GESTIONE DELLA FFT
export function FFT(signal) {
    const n = signal.length;
    if (n === 0) {
        console.warn("Segnale vuoto, non eseguire FFT.");
        return [];  // Se il segnale è vuoto, ritorna un array vuoto
    }

    let x = signal.slice();  // copia del segnale
    let m = Math.log2(n);     // Numero di passi (potenza di 2)
    
    // Applicazione di una finestra di Hanning
    for (let i = 0; i < n; i++) {
        x[i] *= 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));  // Finestra di Hanning
    }

    // Bit-reversal
    bitReversal(x, m);

    // FFT iterativa
    for (let len = 2; len <= n; len *= 2) {
        let step = len / 2;
        let angle = -Math.PI / step;
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);

        for (let i = 0; i < n; i += len) {
            let real = 1;
            let imag = 0;
            for (let j = 0; j < step; j++) {
                let even = x[i + j];
                let odd = x[i + j + step];
                let tempReal = real * odd - imag * odd;
                let tempImag = imag * odd + real * odd;

                x[i + j] = even + tempReal;
                x[i + j + step] = even - tempReal;

                let oldReal = real;
                real = real * cosAngle - imag * sinAngle;
                imag = oldReal * sinAngle + imag * cosAngle;
            }
        }
    }

    // Restituisci la magnitudo (utile per la rilevazione degli onset)
    return x.map(c => Math.sqrt(c * c));  // Magnitudo
}

// Funzione di bit-reversal
function bitReversal(x, m) {
    const n = x.length;
    for (let i = 0; i < n; i++) {
        let j = 0;
        for (let bit = 0; bit < m; bit++) {
            j = (j << 1) | ((i >> bit) & 1);
        }
        if (i < j) {
            let temp = x[i];
            x[i] = x[j];
            x[j] = temp;
        }
    }
}
