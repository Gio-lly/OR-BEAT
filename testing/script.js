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

// Funzione per visualizzare il nome del File/Files caricato e validarlo
function displayFileNames(files) {
    fileList.innerHTML = ''; // Pulisce la lista dei file
    isValidFileLoaded = false; // Resetta lo stato del file valido

    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            // Se il file non è valido, mostra un messaggio di errore
            const errorItem = document.createElement('p');
            errorItem.textContent = `Errore: Il file "${file.name}" non è consentito. 
                                             I file consentiti sono .wav/.mp3/.aac`;
            errorItem.style.color = 'red';
            fileList.appendChild(errorItem);
            continue; // Salta questo file
        }

        // Se il file è valido, aggiunge il nome del file alla lista
        const listItem = document.createElement('p');
        listItem.textContent = `File accettato: ${file.name}`;
        fileList.appendChild(listItem);
        isValidFileLoaded = true; // Imposta lo stato su vero
    }

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
    const files = event.target.files;  // Ottiene il file messo dall'utente
    displayFileNames(files);
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
    document.getElementById("title").textContent = "Benvenuto!";
    displayFileNames(files);
});

// Evento click sul pulsante CONTINUA
document.getElementById('continue-btn').addEventListener('click', function (event) {
    event.stopPropagation(); // Impedisce la propagazione del click
    if (isValidFileLoaded) {
        // Se un file/files valido è stato caricato, nasconde la zona di benvenuto e mostra la workstation
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('workstation').style.webkitFilter = 'none';
    }
});
// ---------------------------------------------------------------------------------
// Gestione dei preset audio
const presetBtn = document.getElementById('preset-btn');
const presetList = document.getElementById('preset-list');
const presets = [
    { name: "Preset 1", file: "Assets/drum_loop_minimal_tribal.wav" },
    { name: "Preset 2", file: "assets/audio2.wav" },
    { name: "Preset 3", file: "assets/audio3.aac" },
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

    // Crea e restituisce il nodo di rilevamento degli onset
    return new AudioWorkletNode(audioContext, "onsetdetector");
}
// ---------------------------------------------------------------------------------
// Funzione per gestire il caricamento del file audio
onsetDetect = null;
let sampleRate = null;

async function handleFileUpload(event) {
    const file = event.target.files[0]; // Ottiene SOLO il primo file caricato !!

    // Se non c'è il file, esci
    if (!file) {
        console.error("Nessun file selezionato.");
        return; // Esce dalla funzione
    }

    // Se il file non è valido, esci
    if (!allowedTypes.includes(file.type)) {
        console.error(`Errore: Il file "${file.name}" non è consentito. I file consentiti sono .wav, .mp3, .aac.`);
        return; // Esce dalla funzione se il file non è valido
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
        console.log(sampleRate)
        
        const source = audioContext.createBufferSource(); // Viene creato un nodo di sorgente audio
        source.buffer= audioBuffer;
        // Estrai i samples dal primo canale
        //const channelData = audioBuffer.getChannelData(0);

        // Crea il nodo OnsetDetector se non esiste
        if (!onsetDetect) {
            onsetDetect = await createOnsetDetectorNode();
        }
        source.connect(onsetDetect); // Connette la sorgente audio al nodo di rilevamento degli onset
        // Questo significa che l'audio passerà attraverso il nodo di rilevamento degli onset per essere analizzato
        source.start(); // Facciamo partire l'audio nel contesto di elaborazione

        onsetDetect.port.onmessage = (event) => {
            const onsetTimestamps = event.data;
            console.log('Onset Timestamps:', onsetTimestamps);
            // Puoi ora usare la lista di onset per ulteriori elaborazioni
        };
        // Invia i samples al nodo tramite il suo port
        


    } catch (error) {
        console.error("Errore nel caricamento del file audio:", error);
    }
}

// Quando l'utente carica, viene chiamata handleFileUpload
document.getElementById("file-input").addEventListener('change', handleFileUpload);