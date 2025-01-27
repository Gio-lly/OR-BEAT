// Variabili globali
audioContext = null; // Inizializza audioContext a null (serve per gestire l'audio)
document.getElementById('continue-btn').disabled = true; // Il pulsante CONTINUA è disabilitato all'inizio
modello = new Model();

// Controlla se il browser supporta AudioContext
if (!window.AudioContext) {
    alert("[ITA]: Il tuo browser non supporta le funzionalità audio necessarie.");
    document.body.innerHTML = '';
}
// ---------------------------------------------------------------------------------
// Tipi di file audio supportati
const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/aac'];
const dropZone = document.getElementById('welcomePage'); // Zona di drop per il file
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
let isValidFileLoaded = false; // Stato per il file valido
let selectedFiles = [];

// Funzione per visualizzare il nome del File/Files caricato e validarlo
function displayFileNames(fileUtente) {
    isValidFileLoaded = false; // Resetta lo stato del file valido
    let content = '';
    let duration = null;

    // Controlliamo la durata del file -> se supera 2 minuti lancia eccezione
    const player = new Tone.Player({
        url: URL.createObjectURL(fileUtente),
        onload: () => {
            duration = player.buffer.duration; // Ottieni la durata dopo il caricamento

            if (!allowedTypes.includes(fileUtente.type)) {
                // Se il file non è valido, mostra un messaggio di errore
                content = `<p style="color: #f10c14;">\nThe file "${fileUtente.name}" 
                            is not allowed. \n The allowed file types are .wav/.mp3.</p>`;
            } else if (duration > 120) {
                // Se il file dura più di 2 minuti
                content = `<p style="color: #f10c14;">\nThe file "${fileUtente.name}" 
                            is not allowed because it lasts longer than 2 minutes.</p>`;
            } else {
                // Se il file è valido, aggiunge il nome del file alla lista
                content = `<p>File accepted: ${fileUtente.name}</p>`;
                isValidFileLoaded = true; // Imposta lo stato su vero
            }

            // Aggiorna lo stato del pulsante Continua
            document.getElementById('continue-btn').disabled = !isValidFileLoaded;

            // Una sola operazione DOM
            fileList.innerHTML = content;
        }
    });
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
let isDragging = false;

dropZone.addEventListener('dragover', (event) => {
    event.preventDefault(); // Impedisce il comportamento di default del browser
    if (!isDragging) {
        isDragging = true;
        document.getElementById('title').innerHTML = `
                DROP!
                <div class="mainTitle">
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                </div>`;
        dropZone.classList.add('dragover'); // Aggiunge stile alla zona di drop
    }
});

dropZone.addEventListener('dragleave', (event) => {
    // risolto bug dragleave
    if (!dropZone.contains(event.relatedTarget)) {
        isDragging = false;
        dropZone.classList.remove('dragover'); // Rimuove lo stile quando il file esce dalla zona di drop
        document.getElementById('title').innerHTML = `
        Welcome on Or-Beat
        <div class="mainTitle">
            <div class="mainTitle__item"></div>
            <div class="mainTitle__item"></div>
            <div class="mainTitle__item"></div>
            <div class="mainTitle__item"></div>
        </div>`;
    }
});

// Questo Listener è necessario per gestire il drop audio
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files; // File trascinati
    selectedFiles.unshift(files[0]);
    document.getElementById('title').innerHTML = `
                Welcome on Or-Beat
                <div class="mainTitle">
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                    <div class="mainTitle__item"></div>
                </div>`;
    displayFileNames(files[0]);
});
// ---------------------------------------------------------------------------------
// Gestione dei preset audio
const presetBtn = document.getElementById('preset-btn');
const presetList = document.getElementById('preset-list');
const presets = [
    { name: "Preset 1", file: "Assets/X-intro.mp3", type: 'audio/wav' },
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
        presetItem.classList.add('preset-button'); // così gestiamo il css

        presetItem.textContent = preset.name;
        presetItem.addEventListener('click', (event) => {
            event.stopPropagation();

            selectedFiles.unshift({ file: preset.file, type: preset.type });
            // Mostra il file selezionato nell'elenco file
            fileList.innerHTML = `<p>Selected preset: ${preset.file.replace('Assets/', '')}</p>`;
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
            console.error("[ITA]: Errore nella creazione dell'AudioContext", e);
            alert("[ITA]: Impossibile creare un contesto audio. Verifica la compatibilità del tuo browser.");
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
            //console.log("Onsets rilevati:", onsets);
            //testonsets(audioBuffer); // Mostra i pulsanti dei campioni
        }
    };

    // Restituisce il nodo di rilevamento degli onset
    return onsetDetectNode;
}
// ---------------------------------------------------------------------------------
// Funzione per gestire il caricamento del file audio solo quando si clicca 'CONTINUA'
let sampleRate = null;
let file = null;
let audioBuffer = null; //audio buffer globale per la traccia da samplare
let onsetDetect = null;
var onsetTimestamps = [];

document.getElementById('continue-btn').addEventListener('click', async function (event) {
    event.stopPropagation(); // Impedisce la propagazione del click
    if (isValidFileLoaded && selectedFiles.length > 0) {

        createLoadingModal();
        // Se un file/files valido è stato caricato, nasconde la zona di benvenuto e mostra la workstation
        document.getElementById('welcomePage').style.display = 'none'; // eliminiamo quando continue
        document.getElementById('workstation').style.filter = 'none';
        document.querySelector('.navbar').style.display = 'none'; // eliminiamo quando continue
        document.querySelector('.credits').style.display = 'none'; // eliminiamo quando continue
        document.querySelector('.letter-container').style.display = 'none'; // eliminiamo quando continue

        const fileOrPreset = selectedFiles[0];

        // Se non c'è il file, esci
        if (!fileOrPreset) {
            console.error("[ITA]: Nessun file selezionato."); return;
        } // Esce dalla funzione

        // Se il file non è valido, esci
        if (!allowedTypes.includes(fileOrPreset.type)) {
            console.error(`[ITA]: Errore: Il file "${fileOrPreset.name}" non è consentito. I file consentiti sono .wav, .mp3, .aac.`);
            return; // Esce dalla funzione se il file non è valido
        }

        if (typeof fileOrPreset.file === 'string') { // File proveniente dal percorso del preset
            try {
                const response = await fetch(fileOrPreset.file);
                if (!response.ok) {
                    throw new Error(`[ITA]: Errore nel caricamento del preset: ${response.statusText}`);
                }
                const blob = await response.blob();
                file = new File([blob], fileOrPreset.file.split('/').pop(), { type: fileOrPreset.type });
                updateProgressBar(30); // AGGIORNO PROGRESS BAR...
            } catch (error) {
                console.error(error.message);
                alert('[ITA]: Errore nel caricamento del preset audio.');
                return;
            }
        } else if (fileOrPreset instanceof File) {
            // Se è un file caricato dall'utente, lo usiamo
            file = fileOrPreset;
            updateProgressBar(30); // AGGIORNO PROGRESS BAR...
        }

        // Se audioContext non è stato creato, lo crea
        try {
            if (audioContext == null) {
                audioContext = new AudioContext();
            }
            await audioContext.resume();
            updateProgressBar(50); // AGGIORNO PROGRESS BAR...

            // decodeAudio si occupa di decodificare un buffer di dati audio (ad esempio, un file audio caricato) 
            // in un formato che può essere utilizzato dall'API Audio di JavaScript per l'elaborazione e la riproduzione
            const arrayBuffer = await file.arrayBuffer();
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer); // dati utilizzabili in contesto audio; 
            updateProgressBar(70); // AGGIORNO PROGRESS BAR...                                                                     
            const sampleRate = audioBuffer.sampleRate;

            // Extract Left audio data
            const channelData = audioBuffer.getChannelData(0); // Use first channel (Left Channel)

            // Analyze audio and detect onsets
            // ## FrameSize (valore ideale per transients di batteria): 512, 
            // ## Hopsize: framesize/2 oppure framesize/4, 
            // ## Sensitivity: 150 (abbassare se vuoi aumentare la densità)
            const onsetTimestamps = detectOnsets(channelData, sampleRate, 512, 256, 150);

            modello.setonsets(onsetTimestamps);
            updateProgressBar(100); // AGGIORNO PROGRESS BAR...

            setTimeout(() => {
                //console.log("Detected onsets (seconds):", onsetTimestamps);
                removeLoadingModal();
                displayWaveform(file);
                onsetsRegions(onsetTimestamps, audioBuffer.duration);
                document.querySelector('.randomize-btn').style.display = 'flex';
            }, 1000);
        } catch (error) {
            console.error("Error processing the file:", error);
            return;
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
// _________________________________________________________________________________
// ---------------------------------------------------------------------------------
// Array globale per memorizzare i player associati agli slot
let players = [];

// In ascolto quando i dati sono pronti
window.addEventListener('waveDataReady', () => {
    if (window.waveData) {
        const { startTime, nextStartTime } = window.waveData;
        //console.log('Start Time:', startTime);
        //console.log('Next Start Time:', nextStartTime);

        // Inserisci il segmento audio nello slot
        const container = document.querySelector('.savings'); // Contenitore di slot
        handleSegmentExtraction(audioBuffer, startTime, nextStartTime, container);
    } else {
        console.log('Dati audio non disponibili.');
    }
});

// Funzione per estrarre e inserire un segmento audio, e riprodurlo al click
let slotStatus = new Array(6).fill(false);
function handleSegmentExtraction(audioBuffer, startTime, nextStartTime, container) {

    const startSample = Math.floor(startTime * audioBuffer.sampleRate);
    const endSample = Math.floor(nextStartTime * audioBuffer.sampleRate);
    let segmentBuffer = null;

    // Estraiamo la porzione dei dati audio dal buffer
    const leftChannel = audioBuffer.getChannelData(0).slice(startSample, endSample); // Canale sinistro
    if (audioBuffer.numberOfChannels > 1) {
        const rightChannel = audioBuffer.getChannelData(1).slice(startSample, endSample); // Canale destro
        segmentBuffer = audioContext.createBuffer(2, leftChannel.length, audioBuffer.sampleRate);
        segmentBuffer.getChannelData(0).set(leftChannel);
        segmentBuffer.getChannelData(1).set(rightChannel);
    } else { // Le registrazioni sono MONO
        segmentBuffer = audioContext.createBuffer(1, leftChannel.length, audioBuffer.sampleRate);
        segmentBuffer.getChannelData(0).set(leftChannel);
    }

    // Trova il primo slot libero
    let freeSlotIndex = slotStatus.indexOf(false);
    if (freeSlotIndex === -1) {
        // Se tutti gli slot sono pieni, lanciamo un messaggio
        alert("All slots are full. Please try again.");
        return;
    } else {
        // Se esiste uno slot libero, usa quello
        slotStatus[freeSlotIndex] = true; // Marca lo slot come occupato
    }

    // Trovo uno slot disponibile e inserisco lì il segmento audio selezionato
    const slots = container.querySelectorAll('.slot');

    // Assegna un testo per identificare la porzione di audio
    slots[freeSlotIndex].textContent = `${startTime.toFixed(2)} - ${nextStartTime.toFixed(2)}`; // La cella avrà questa label
    slots[freeSlotIndex].setAttribute('draggable', 'true'); // Rendiamo draggabile lo slot con audio

    // Crea un nuovo player e lo memorizza nell'array `players`
    const player = new Tone.Player(segmentBuffer).toDestination();
    player.autostart = false;  // Impedisce la riproduzione automatica
    players[freeSlotIndex] = player;   // Memorizza il player nell'array `players`

    // Aggiungi un evento di click per riprodurre l'audio quando si clicca sullo slot
    slots[freeSlotIndex].addEventListener('click', () => {
        playSlot(freeSlotIndex);
    });

    
    
}

/**
 * Funzione per riprodurre un segmento audio in un determinato slot, chiama il metodo start() del player
 * @param {*} slotIndex 
 * 
 */
function playSlot(slotIndex) {
    if (players[slotIndex]) {
        players[slotIndex].start();  // Avvia la riproduzione per il player specificato
    } else {
        console.log('[ITA]: Slot vuoto o non valido');
    }
}
