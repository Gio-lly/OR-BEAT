document.getElementById('continue-btn').addEventListener('click', function () {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('workstation').style.webkitFilter='none';
});
const allowedTypes = ['audio/wav','audio/mpeg','audio/aac'];

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');


function displayFileNames(files) {
    fileList.innerHTML = '';
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
    }
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
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    const files = event.dataTransfer.files; // File trascinati
    displayFileNames(files);
});