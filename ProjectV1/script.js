document.getElementById('continue-btn').disabled = true; // Disabilita il pulsante all'inizio

const allowedTypes = ['audio/wav', 'audio/mpeg', 'audio/aac'];
const dropZone = document.getElementById('welcome');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
let isValidFileLoaded = false; // Stato per il file valido

function displayFileNames(files) {
    fileList.innerHTML = '';
    isValidFileLoaded = false; // Resetta lo stato del file valido

    for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
            const errorItem = document.createElement('p');
            errorItem.textContent = `Errore: Il file "${file.name}" non è consentito.`;
            errorItem.style.color = 'red';
            fileList.appendChild(errorItem);
            continue; // Salta questo file
        }

        const listItem = document.createElement('p');
        listItem.textContent = `File accettato: ${file.name}`;
        fileList.appendChild(listItem);
        isValidFileLoaded = true; // Imposta lo stato su vero
    }

    // Aggiorna lo stato del pulsante Continua
    document.getElementById('continue-btn').disabled = !isValidFileLoaded;
}

// Evento click sulla drop zone
dropZone.addEventListener('click', () => {
    fileInput.click(); // Simula il clic sull'input file
});

// Gestione del file selezionato tramite input
fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    displayFileNames(files);
});

// Drag-and-drop eventi
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    document.getElementById("title").textContent = "DROP!";
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
    document.getElementById("title").textContent = "Benvenuto!";
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files; // File trascinati
    document.getElementById("title").textContent = "Benvenuto!";
    displayFileNames(files);
});


document.getElementById('continue-btn').addEventListener('click', function (event) {
    event.stopPropagation(); // Impedisce la propagazione del click
    if (isValidFileLoaded) {
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('workstation').style.webkitFilter = 'none';
    }
});

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

    // Crea i pulsanti per ciascun preset
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