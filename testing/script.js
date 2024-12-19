// Variabili globali
audioContext = null; // Inizializza audioContext a null (serve per gestire l'audio)
document.getElementById('continue-btn').disabled = true; // Il pulsante CONTINUA è disabilitato all'inizio

// Controlla se il browser supporta AudioContext
if (!window.AudioContext) {
    alert("Il tuo browser non supporta le funzionalità audio necessarie.");
    document.body.innerHTML = '';
}
// ---------------------------------------------------------------------------------
// Tipi di file audio supportati
const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/aac'];
const dropZone = document.getElementById('dropZone'); // Zona di drop per il file
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
let isValidFileLoaded = false; // Stato per il file valido
let selectedFiles = [];

// Funzione per visualizzare il nome del File/Files caricato e validarlo
function displayFileNames(fileUtente) {
    isValidFileLoaded = false; // Resetta lo stato del file valido
    let content = '';

    if (!allowedTypes.includes(fileUtente.type)) {
        // Se il file non è valido, mostra un messaggio di errore
        content = `<p style="color: red;">Errore: Il file "${fileUtente.name}" non è consentito. 
                   I file consentiti sono .wav/.mp3/.aac</p>`;
    } else {
        // Se il file è valido, aggiunge il nome del file alla lista
        content = `<p>File accettato: ${fileUtente.name}</p>`;
        isValidFileLoaded = true; // Imposta lo stato su vero
        // Aggiorna lo stato del pulsante Continua
        document.getElementById('continue-btn').disabled = !isValidFileLoaded;
    }
    // Una sola operazione DOM
    fileList.innerHTML = content;
}
// ---------------------------------------------------------------------------------
// Evento click sulla drop zone
dropZone.addEventListener('click', () => {
    fileInput.click(); // Simula il clic sull'input file
});

// Gestione del file selezionato tramite input utente
fileInput.addEventListener('change', (event) => {
    const fileUtente = event.target.files[0]; // Ottiene il file caricato
    selectedFiles.unshift(fileUtente);
    displayFileNames(fileUtente);
});

// Drag-and-drop eventi
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault(); // Impedisce il comportamento di default del browser
    document.getElementById("title").textContent = "DROP!"; // Modifica il testo della zona di drop
    dropZone.classList.add('dragover'); // Aggiunge stile alla zona di drop
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover'); // Rimuove lo stile quando il file esce dalla zona di drop
    document.getElementById("title").textContent = "Benvenuto!";
});

// Questo Listener è necessario per gestire il drop audio
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files; // File trascinati
    selectedFiles.unshift(files[0]);
    document.getElementById("title").textContent = "Benvenuto!";
    displayFileNames(files[0]);
});
// ---------------------------------------------------------------------------------
// Gestione dei preset audio
const presetBtn = document.getElementById('preset-btn');
const presetList = document.getElementById('preset-list');
const presets = [
    { name: "Preset 1", file: "Assets/drum_loop_minimal_tribal.wav", type: 'audio/wav' },
    { name: "Preset 2", file: "Assets/drum_108.wav", type: 'audio/wav' },
    { name: "Preset 3", file: "Assets/drum_loop.mp3", type: 'audio/mpeg' },
];

// Mostra l'elenco dei preset quando si clicca sul pulsante
presetBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    presetList.style.display = 'block';
    presetList.innerHTML = ''; // Pulisci l'elenco precedente

    // Aggiunge un pulsante per ogni preset
    presets.forEach(preset => {
        const presetItem = document.createElement('button');
        presetItem.textContent = preset.name;
        presetItem.addEventListener('click', (event) => {
            event.stopPropagation();

            selectedFiles.unshift({ file: preset.file, type: preset.type });
            // Mostra il file selezionato nell'elenco file
            fileList.innerHTML = `<p>Preset selezionato: ${preset.file.replace('Assets/', '')}</p>`;
            isValidFileLoaded = true; // Imposta lo stato su vero
            document.getElementById('continue-btn').disabled = false;
        });
        presetList.appendChild(presetItem);
    });
});
// ---------------------------------------------------------------------------------
// Gestione della rec
// Ascolta l'evento personalizzato 'recording-completed' quando la registrazione è finita
window.addEventListener('recording-completed', (event) => {
    const file = event.detail.file; // Ottieni il file dalla proprietà detail
    
    // Aggiungi il file alla lista selectedFiles
    selectedFiles.unshift(file);

    // Aggiorna il contenuto dell'interfaccia utente con il nome del file registrato
    displayFileNames(file); // Mostra il nome del file registrato

    // Abilita il pulsante "Continua" ora che un file valido è stato caricato
    isValidFileLoaded = true;
    document.getElementById('continue-btn').disabled = false;
});
// _________________________________________________________________________________
// ---------------------------------------------------------------------------------
// Funzione per creare un nodo in cui facciamo il rilevamento OnSets
async function createOnsetDetectorNode() {
    if (!audioContext) {
        try {
            audioContext = new AudioContext(); // Crea un nuovo AudioContext se non è stato già creato
        } catch (e) {
            console.error("Errore nella creazione dell'AudioContext", e);
            alert("Impossibile creare un contesto audio. Verifica la compatibilità del tuo browser.");
            return null; // Se non è possibile creare l'AudioContext, restituisce null
        }
    }
    await audioContext.resume();  // Assicura che l'AudioContext sia in esecuzione
    await audioContext.audioWorklet.addModule('Processors/onsetdetector.js'); // Aggiunge il modulo di rilevamento degli onset

    // Crea il nodo di rilevamento degli onset
    const onsetDetectNode = new AudioWorkletNode(audioContext, "onsetdetector", {
        processorOptions: {
            bufferSize: 256
        }
    });

    // Gestione dei messaggi dalla AudioWorkletProcessor
    onsetDetectNode.port.onmessage = (event) => {
        const { type, progress, onsets } = event.data;

        if (type === 'progress') {
            updateProgressBar(progress); // Aggiorna la barra di caricamento
        } else if (type === 'onsets') {
            console.log("Onsets rilevati:", onsets);
            testonsets(audioBuffer); // Mostra i pulsanti dei campioni
        }
    };

    // Restituisce il nodo di rilevamento degli onset
    return onsetDetectNode;
}
// ---------------------------------------------------------------------------------
// Funzione per gestire il caricamento del file audio solo quando si clicca 'CONTINUA'
let sampleRate = null;
let file = null;
onsetDetect = null;
var onsetTimestamps = [];

document.getElementById('continue-btn').addEventListener('click', async function (event) {
    event.stopPropagation(); // Impedisce la propagazione del click
    if (isValidFileLoaded && selectedFiles.length > 0) {

        createLoadingModal();
        // Se un file/files valido è stato caricato, nasconde la zona di benvenuto e mostra la workstation
        document.getElementById('welcomePage').style.display = 'none';
        document.getElementById('workstation').style.filter = 'none';

        const fileOrPreset = selectedFiles[0];

        // Se non c'è il file, esci
        if (!fileOrPreset) {
            console.error("Nessun file selezionato."); return;
        } // Esce dalla funzione

        // Se il file non è valido, esci
        if (!allowedTypes.includes(fileOrPreset.type)) {
            console.error(`Errore: Il file "${fileOrPreset.name}" non è consentito. I file consentiti sono .wav, .mp3, .aac.`);
            return; // Esce dalla funzione se il file non è valido
        }

        if (typeof fileOrPreset.file === 'string') { // File proveniente dal percorso del preset
            try {
                const response = await fetch(fileOrPreset.file);
                if (!response.ok) {
                    throw new Error(`Errore nel caricamento del preset: ${response.statusText}`);
                }
                const blob = await response.blob();
                file = new File([blob], fileOrPreset.file.split('/').pop(), { type: fileOrPreset.type });
            } catch (error) {
                console.error(error.message);
                alert('Errore nel caricamento del preset audio.');
            }
        } else if (fileOrPreset instanceof File) {
            // Se è un file caricato dall'utente, lo usiamo
            file = fileOrPreset;
        }

        // Se audioContext non è stato creato, lo crea
        try {
            if (audioContext == null) {
                audioContext = new AudioContext();
            }
            await audioContext.resume();

            // decodeAudio si occupa di decodificare un buffer di dati audio (ad esempio, un file audio caricato) 
            // in un formato che può essere utilizzato dall'API Audio di JavaScript per l'elaborazione e la riproduzione
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer); // dati utilizzabili in contesto audio;                                                                       
            const sampleRate = audioBuffer.sampleRate;

            // Extract Left audio data
            const channelData = audioBuffer.getChannelData(0); // Use first channel (Left Channel)
            
            // Analyze audio and detect onsets
            // ## FrameSize (valore ideale per transients di batteria): 512, 
            // ## Hopsize: framesize/2 oppure framesize/4, 
            // ## Sensitivity: 150 (abbassare se vuoi aumentare la densità)
            const onsetTimestamps = detectOnsets(channelData, sampleRate, 512, 256, 150);
            console.log("Detected onsets (seconds):", onsetTimestamps);
            removeLoadingModal();
            displayWaveform(file);
            onsetsRegions(onsetTimestamps, audioBuffer.duration);
        } catch (error) {
            console.error("Error processing the file:", error);
        }
    }
});

function detectOnsets(channelData, sampleRate, frameSize, hopSize, sensitivity) { 
    const onsetTimestamps = [];
    let previousSpectrum = null;
    
    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
      const frame = channelData.slice(i, i + frameSize);
  
      // Calculate spectrum using Meyda.js
      const currentSpectrum = Meyda.extract("amplitudeSpectrum", frame);
  
      if (previousSpectrum) {
        // Calculate spectral flux
        let flux = 0;
        for (let j = 0; j < currentSpectrum.length; j++) {
          const diff = currentSpectrum[j] - (previousSpectrum[j] || 0);
          flux += Math.max(0, diff); // Only consider increases
        }
  
        if (flux > sensitivity) {
          const time = i / sampleRate;
          onsetTimestamps.push(time);
        }
      }
  
      previousSpectrum = currentSpectrum;
    }
  
    return onsetTimestamps;
}