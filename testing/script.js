// Variabili globali
audioContext = null; // Inizializza audioContext a null (serve per gestire l'audio)
document.getElementById('continue-btn').disabled = true; // Il pulsante CONTINUA è disabilitato all'inizio
// ---------------------------------------------------------------------------------
// Tipi di file audio supportati
const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/aac'];
const dropZone = document.getElementById('welcome'); // Zona di drop per il file
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
let isValidFileLoaded = false; // Stato per il file valido
let selectedFiles = [];

// Funzione per visualizzare il nome del File/Files caricato e validarlo
function displayFileNames(fileUtente) {
    fileList.innerHTML = ''; // Pulisce la lista dei file
    isValidFileLoaded = false; // Resetta lo stato del file valido

    if (!allowedTypes.includes(fileUtente.type)) {
        // Se il file non è valido, mostra un messaggio di errore
        const errorItem = document.createElement('p');
        errorItem.textContent = `Errore: Il file "${fileUtente.name}" non è consentito. 
                                         I file consentiti sono .wav/.mp3/.aac`;
        errorItem.style.color = 'red';
        fileList.appendChild(errorItem);
        return; // Esci
    }

    // Se il file è valido, aggiunge il nome del file alla lista
    const listItem = document.createElement('p');
    listItem.textContent = `File accettato: ${fileUtente.name}`;
    fileList.appendChild(listItem);
    isValidFileLoaded = true; // Imposta lo stato su vero

    // Aggiorna lo stato del pulsante Continua
    document.getElementById('continue-btn').disabled = !isValidFileLoaded;
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

            selectedFiles.unshift({file: preset.file, type: preset.type });
            // Mostra il file selezionato nell'elenco file
            fileList.innerHTML = `<p>Preset selezionato: ${preset.file}</p>`;
            isValidFileLoaded = true; // Imposta lo stato su vero
            document.getElementById('continue-btn').disabled = false;
        });
        presetList.appendChild(presetItem);
    });
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
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('workstation').style.filter = 'none';
    
        const fileOrPreset = selectedFiles[0];

        // Se non c'è il file, esci
        if (!fileOrPreset) {
            console.error("Nessun file selezionato."); return; } // Esce dalla funzione

        // Se il file non è valido, esci
        if (!allowedTypes.includes(fileOrPreset.type)) {
            console.error(`Errore: Il file "${fileOrPreset.name}" non è consentito. I file consentiti sono .wav, .mp3, .aac.`);
            return; // Esce dalla funzione se il file non è valido
        }

        if (typeof fileOrPreset.file === 'string') { // File proveniente dal percorso del preset
            // Crea un oggetto File
            file = await fetch(fileOrPreset.file) 
                .then(response => response.blob())
                .then(blob => new File([blob], fileOrPreset.file.split('/').pop(), { type: fileOrPreset.type }));
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

            // Legge e decodifica il file audio
            const arrayBuffer = await file.arrayBuffer(); // array di byte (raw data)
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer); // dati utilizzabili in contesto audio
            // Imposta il sample rate del file caricato
            sampleRate = audioBuffer.sampleRate;
            console.log("Sample Rate: ", sampleRate)

            // Calcola la durata totale del file in secondi
            const totalDuration = audioBuffer.duration;
            console.log("Durata totale del file audio: ", totalDuration);

            const source = audioContext.createBufferSource(); // Viene creato un nodo di sorgente audio
            source.buffer = audioBuffer;
                
            // Crea il nodo OnsetDetector se non esiste
            if (!onsetDetect) {
                onsetDetect = await createOnsetDetectorNode(); 
            }

            source.connect(onsetDetect); // Connette la sorgente audio al nodo di rilevamento degli onset
            // Questo significa che l'audio passerà attraverso il nodo di rilevamento degli onset per essere analizzato

            // Passa totalDuration come parametro quando crei il nodo AudioWorkletNode
            onsetDetect.port.postMessage({
                type: 'setDuration',
                totalDuration: totalDuration
            });

            source.start(); // Facciamo partire l'audio nel contesto di elaborazione
            let currentProgress = 0;

            onsetDetect.port.onmessage = (event) => {
                const { type, progress, onsets } = event.data;

                if (type === 'progress') {
                    // Aggiorna la barra di progresso ogni volta che ricevi il tipo 'progress'
                    updateProgressBar(progress);
                } else if (type === 'onsets') {
                    // Quando il tipo è 'onsets', esegui il trattamento degli onset
                    console.log('Onset Timestamps:', onsets);
                    onsetTimestamps= onsets;
                    removeLoadingModal();
                    // Puoi ora usare la lista di onset per ulteriori elaborazioni
                    displayWaveform(file); // Carica la forma d'onda
                    onsetsRegions(audioBuffer);
                }
            };

            // Invia i samples al nodo tramite il suo port

        } catch (error) {
            console.error("Errore nel caricamento del file audio:", error);
        }
    }
});