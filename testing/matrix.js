document.addEventListener('DOMContentLoaded', () => {
    const colors = ["#D64646", "#23A74F", "#5353E7", "#F5C661", "#914FAD", "#F267B1"];
    let usedColors = new Set();
    const container = document.querySelector('.savings');
    const discardButtons = container.querySelectorAll('.discard-btn');
    const slots = container.querySelectorAll('.slot');

    discardButtons.forEach((discardButton, buttonIndex) => {
        discardButton.addEventListener('click', (event) => {
            event.stopPropagation();
            try {
                // Reset del testo dello slot e rimozione del segmento audio
                slots[buttonIndex].textContent = ''; // Libera il testo dello slot
                slots[buttonIndex].setAttribute('draggable', 'false');

                players[buttonIndex].stop(); // Ferma la riproduzione (se in corso)
                players[buttonIndex] = null; // Rimuovi il player dalla lista
                slotStatus[buttonIndex] = false;
            } catch (e) {

            }
        });
    });
    const matrixContainer = document.getElementById('matrix-container');
    matrixContainer.innerHTML = `
        <table id="matrixTable">
            <thead>
                <tr>
                    <th>Color</th>
                    <th>Sample</th>
                    <th>Steps</th>
                    <th>Density</th>
                    <th>Phase</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                
                <tr id="addRowButtonRow">
                
                    <td colspan="6">
                    <button class="add-row-btn">+</button></td>
                </tr>
            </tfoot>
        </table>
    `;

    function getNextColor() {
        for (const color of colors) {
            if (!usedColors.has(color)) {
                usedColors.add(color);
                return color;
            }
        }
        return null;
    }

    function releaseColor(color) {
        usedColors.delete(color);
    }

    function populateDropdowns(row, steps) {
        const densityDropdown = row.querySelector('.density-dropdown');
        const phaseDropdown = row.querySelector('.phase-dropdown');
        densityDropdown.innerHTML = '';
        phaseDropdown.innerHTML = '';

        for (let i = 0; i <= 1; i += 1 / steps) {
            const option = document.createElement('option');
            option.value = (i * 100).toFixed(0);
            option.textContent = `${(i * 100).toFixed(0)}%`;
            densityDropdown.appendChild(option);
        }

        for (let i = 0; i < steps; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            phaseDropdown.appendChild(option);
        }
    }

    function calculateBooleanList(steps, density, phase) {
        const numOn = Math.round((density / 100) * steps);
        let booleanList = new Array(steps).fill(false);
        const interval = Math.floor(steps / numOn);
        let positions = [];

        for (let i = 0; i < numOn; i++) {
            positions.push((i * interval) % steps);
        }

        positions = positions.map(pos => (pos + phase) % steps);

        positions.forEach(pos => {
            booleanList[pos] = true;
        });

        return booleanList;
    }

    function addRow() {
        logState();
        const tableBody = document.querySelector('#matrixTable tbody');
        const newRow = document.createElement('tr');
        newRow.id = tableBody.children.length + 1;
        const color = getNextColor();
        if (!color) {
            alert('No available colors for new rows.');
            return;
        }

        // Memorizza il colore direttamente nel 'data-color'
        newRow.setAttribute('data-color', color);

        newRow.innerHTML = `
            <td><div class="color-box" style="background-color: ${color};"></div></td>
            <td class="second-cell">Drop the sample</td>
            <td>
                <select class="steps-dropdown" style="background-color: ${color};">
                    ${Array.from({ length: 15 }, (_, i) => `<option value="${i + 2}">${i + 2}</option>`).join('')}
                </select>
            </td>
            <td>
                <select class="density-dropdown" style="background-color: ${color};"></select>
            </td>
            <td>
                <select class="phase-dropdown" style="background-color: ${color};"></select>
            </td>
            <td><button class="remove-btn"><i class="fa-solid fa-trash"></i></button></td>
        `;

        const stepsDropdown = newRow.querySelector('.steps-dropdown');
        const densityDropdown = newRow.querySelector('.density-dropdown');
        const phaseDropdown = newRow.querySelector('.phase-dropdown');
        const defaultSteps = parseInt(stepsDropdown.value, 10);

        populateDropdowns(newRow, defaultSteps);

        let steps = 2;
        let phase = 0;
        let density = 0;
        creaAnello(steps, color);


        stepsDropdown.addEventListener('change', event => {
            var steps = parseInt(event.target.value, 10);
            if (!isNaN(steps)) {
                populateDropdowns(newRow, steps);
            }
            modello.modifyRingSteps(parseInt(stepsDropdown.parentNode.parentNode.id) - 1, steps);
            anelli[parseInt(stepsDropdown.parentNode.parentNode.id) - 1].steps = steps;
            anelli[parseInt(stepsDropdown.parentNode.parentNode.id) - 1].bool_list = new Array(steps).fill(false);
        });

        // gestione del cambiamento della densità
        densityDropdown.addEventListener('change', event => {
            const density = parseInt(event.target.value, 10);
            if (!isNaN(density)) {
                const ringId = parseInt(densityDropdown.parentNode.parentNode.id) - 1;
                modello.modifyRingDensity(ringId, density);
                anelli[ringId].density = density;

                let phase = anelli[ringId].phase;
                if (isNaN(phase)) {
                    phase = 0;
                }

                const steps = anelli[ringId].steps;
                const booleanList = calculateBooleanList(steps, density, phase);

                modello.modifyRingBooleanList(ringId, booleanList);
                anelli[ringId].bool_list = booleanList;
            }
            logState();
        });

        // gestione del cambiamento della fase
        phaseDropdown.addEventListener('change', event => {
            const phase = parseInt(event.target.value, 10);
            if (!isNaN(phase)) {
                const ringId = parseInt(phaseDropdown.parentNode.parentNode.id) - 1;
                modello.modifyRingPhase(ringId, phase);
                anelli[ringId].phase = phase;

                const steps = anelli[ringId].steps;
                const density = anelli[ringId].density;
                const booleanList = calculateBooleanList(steps, density, phase);

                modello.modifyRingBooleanList(ringId, booleanList);
                anelli[ringId].bool_list = booleanList;
            }
            logState();
        });

        // gestione del click sul pulsante di rimozione
        newRow.querySelector('.remove-btn').addEventListener('click', () => {
            const rowIndex = Array.from(tableBody.children).indexOf(newRow);  // ottieni l'indice della riga

            // verifica se l'anello è l'ultimo, se sì, rimuovilo senza comprimere gli altri
            if (anelli.length === 1) {
                alert("Non puoi rimuovere l'ultimo anello!");
                return;
            }

            console.log("Anello da rimuovere:", rowIndex);
            console.log("Stato degli anelli prima della rimozione:", anelli);

            // se l'anello è l'ultimo, chiama solo rimuoviAnello senza comprimere gli altri
            if (rowIndex === anelli.length - 1) {
                console.log("SONO QUI - Rimuovo l'ultimo anello");

                releaseColor(color);
                newRow.remove();
                rimuoviAnello(rowIndex);  // Passa l'indice della riga
                logState();
                toggleAddButtonVisibility();
                console.log("Stato degli anelli dopo la rimozione dell'ultimo:", anelli);
                return;
            }

            // altrimenti, se non è l'ultimo, comprimiamo e rimuoviamo
            releaseColor(color);
            newRow.remove();
            comprimiAnelli(rowIndex);
            rimuoviAnello(rowIndex);
            toggleAddButtonVisibility();
            // ora aggiorniamo gli ID delle righe
            const allRows = document.querySelectorAll('#matrixTable tbody tr');
            allRows.forEach((row, index) => {
                row.id = index + 1;  // Impostiamo l'ID come l'indice della riga + 1
            });

            logState();
            console.log("Stato degli anelli dopo la rimozione:", anelli);
        });



        // Inizializza il drag and drop per le nuove celle solo una volta per cella
        const destinationCell = newRow.querySelector('.second-cell');
        destinationCell.addEventListener('dragover', (event) => {
            // Se la cella ha già il segno '-' nell'innerHTML, non fare nulla (Ha avuto almeno 1 drop)
            if (destinationCell.innerHTML.includes('-')) {
                return;
            }

            event.preventDefault();
            destinationCell.innerHTML = `DROP HERE!`;
            destinationCell.classList.add('dragover');
        });

        destinationCell.addEventListener('dragleave', (event) => {
            // Se la cella ha già il segno '-' nell'innerHTML, non fare nulla (Ha avuto almeno 1 drop)
            if (destinationCell.innerHTML.includes('-')) {
                return;
            }

            destinationCell.classList.remove('dragover');
            destinationCell.innerHTML = `Drop the sample`;
        });

        destinationCell.addEventListener('drop', (event) => {
            event.preventDefault();
            const data = JSON.parse(event.dataTransfer.getData('application/json'));
            destinationCell.classList.remove('dragover');
            destinationCell.innerHTML = ''; // Pulisce il contenuto precedente
            destinationCell.innerHTML = `Sample ${data.index} <br> ${data.htmlContent}`; // Mostra il contenuto del drop
            const startTime = data.startTime;
            const endTime = data.endTime;



            const startSample = Math.floor(startTime * audioBuffer.sampleRate);
            const endSample = Math.floor(endTime * audioBuffer.sampleRate);
            var segmentBuffer = null;

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

            //const player = new Tone.Player(segmentBuffer).toDestination();
            //console.log("id dell'anello destinatione:" + parseInt(destinationCell.parentNode.id));
            //modello.setRingPlayer(segmentBuffer, startTime, endTime, i_ring = parseInt(destinationCell.parentNode.id) - 1);
            anelli[parseInt(destinationCell.parentNode.id) - 1].setRingPlayer(segmentBuffer, startTime, endTime);
            // Colorazione della cella 
            colorize();
        });
        tableBody.appendChild(newRow);
        toggleAddButtonVisibility();

 
        // Inizializza il drag and drop per le nuove celle
        //initializeDragAndDrop();
    }

    function toggleAddButtonVisibility() {
        const tableBody = document.querySelector('#matrixTable tbody');
        const addRowButtonRow = document.querySelector('#addRowButtonRow');
        addRowButtonRow.style.display = tableBody.children.length >= 6 ? 'none' : '';
    }

    document.querySelector('.add-row-btn').addEventListener('click', addRow);
    addRow();  // riga di default al caricamento della pagina

    const randomButton = document.createElement('button');
    randomButton.className = 'randomize-btn';
    randomButton.innerHTML = '<i class="fa-solid fa-dice"></i>';
    randomButton.style.display = 'none';
    document.body.appendChild(randomButton);

    document.querySelector('.randomize-btn').addEventListener('click', randomizeRows);

    function randomizeRows() {
        const tableBody = document.querySelector('#matrixTable tbody');
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach((row) => {
            const stepsDropdown = row.querySelector('.steps-dropdown');
            const densityDropdown = row.querySelector('.density-dropdown');
            const phaseDropdown = row.querySelector('.phase-dropdown');


            const steps = Math.floor(Math.random() * 15) + 2;

            const possibleDensities = [];
            for (let i = 1 / steps; i <= 1; i += 1 / steps) { // Inizia da 1/steps per evitare 0%
                const density = Math.round(i * 100);
                if (density <= 50) {
                    possibleDensities.push(density);
                }
            }
            const density = possibleDensities[Math.floor(Math.random() * possibleDensities.length)];


            const phase = Math.floor(Math.random() * steps);


            stepsDropdown.value = steps;
            populateDropdowns(row, steps);
            densityDropdown.value = density;
            phaseDropdown.value = phase;

            const rowIndex = parseInt(row.id, 10) - 1;
            modello.modifyRingSteps(rowIndex, steps);
            modello.modifyRingDensity(rowIndex, density);
            modello.modifyRingPhase(rowIndex, phase);

            const booleanList = calculateBooleanList(steps, density, phase);
            modello.modifyRingBooleanList(rowIndex, booleanList);

            anelli[rowIndex].steps = steps;
            anelli[rowIndex].density = density;
            anelli[rowIndex].phase = phase;
            anelli[rowIndex].bool_list = booleanList;
        });

        logState();
    }

});

function logState() {
    console.log("Anelli: ", anelli);
    console.log("Representation Matrix: ", modello.representation_matrix);
}

/*#################################### DRAG & DROP SLOTS AUDIO ########################################################*/
const slots = document.querySelectorAll('.slot');

slots.forEach((slot, index) => {
    slot.addEventListener('dragstart', (event) => {
        // Memorizza il numero dello slot che stai trascinando
        const data = {
            index: index,
            htmlContent: slot.innerHTML,
            startTime: parseFloat(slot.innerHTML.split('-')[0].trim(), 10), // Assegna il primo intero
            endTime: parseFloat(slot.innerHTML.split('-')[1].trim(), 10) // Assegna il secondo intero
        }
        event.dataTransfer.setData('application/json', JSON.stringify(data));
        slot.classList.add('dragging');
    });

    slot.addEventListener('dragend', (event) => {
        slot.classList.remove('dragging');
    });
});



// Funzione per colorare gli slot con il colore assegnato
function colorize() {
    const destinationCell = document.querySelectorAll('.second-cell');

    destinationCell.forEach((destinationCell, index) => {
        // Controlliamo se l'innerHTML della cella contiene il segno '-'
        if (destinationCell.innerHTML.includes('-')) {
            // Ottieni il colore memorizzato nel data-color della riga
            const row = destinationCell.closest('tr');
            const color = row.getAttribute('data-color');

            // Assegna il colore alla cella
            destinationCell.style.backgroundColor = color;
            destinationCell.style.color = "#fff";
        }
    });
}
