document.addEventListener('DOMContentLoaded', () => {
    const colors = ["#FF5733", "#2E8B57", "#3357FF", "#F1C40F", "#8E44AD", "#1ABC9C", "#E74C3C", "#2C3E50"];
    let usedColors = new Set();

    const matrixContainer = document.getElementById('matrix-container');
    matrixContainer.innerHTML = `
        <table id="matrixTable">
            <thead>
                <tr>
                    <th>Circle</th>
                    <th>Sample</th>
                    <th>Steps</th>
                    <th>Density</th>
                    <th>Phase</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
            <tfoot>
                <tr id="addRowButtonRow">
                    <td colspan="6"><button class="add-row-btn">+</button></td>
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

        newRow.innerHTML = `
            <td><div class="color-box" style="background-color: ${color};"></div></td>
            <td>Drop the sample here!</td>
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
            <td><button class="remove-btn">x</button></td>
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
            steps = parseInt(event.target.value, 10);
            if (!isNaN(steps)) {
                populateDropdowns(newRow, steps);
            }
            modello.modifyRingSteps(parseInt(stepsDropdown.parentNode.parentNode.id) - 1, steps);
            anelli[parseInt(stepsDropdown.parentNode.parentNode.id) - 1].steps = steps;
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
                console.log("Stato degli anelli dopo la rimozione dell'ultimo:", anelli);
                return;
            }

            // altrimenti, se non è l'ultimo, comprimiamo e rimuoviamo
            releaseColor(color);
            newRow.remove();
            comprimiAnelli(rowIndex);
            rimuoviAnello(rowIndex);

            // ora aggiorniamo gli ID delle righe
            const allRows = document.querySelectorAll('#matrixTable tbody tr');
            allRows.forEach((row, index) => {
                row.id = index + 1;  // Impostiamo l'ID come l'indice della riga + 1
            });

            logState();
            console.log("Stato degli anelli dopo la rimozione:", anelli);
        });

        tableBody.appendChild(newRow);
        toggleAddButtonVisibility();
    }

    function toggleAddButtonVisibility() {
        const tableBody = document.querySelector('#matrixTable tbody');
        const addRowButtonRow = document.querySelector('#addRowButtonRow');
        addRowButtonRow.style.display = tableBody.children.length >= 6 ? 'none' : '';
    }

    document.querySelector('.add-row-btn').addEventListener('click', addRow);
    addRow();  // riga di default al caricamento della pagina
});

function logState() {
    console.log("Anelli: ", anelli);
    console.log("Representation Matrix: ", modello.representation_matrix);
}
