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