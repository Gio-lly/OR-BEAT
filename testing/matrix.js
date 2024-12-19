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

    // Funzioni di supporto
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
    //crea una riga e aggiunge gli event Listeners ai vari campi, modificando al
    //il modello quando vengono cambiati
    function addRow() {
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
        //modello.addRing([],2,0,0,color);
        
        const stepsDropdown = newRow.querySelector('.steps-dropdown');
        const densityDropdown = newRow.querySelector('.density-dropdown');
        const phaseDropdown = newRow.querySelector('.phase-dropdown');
        const defaultSteps = parseInt(stepsDropdown.value, 10);
        populateDropdowns(newRow, defaultSteps);
        var steps=2;
        var phase = 0;
        var density = 0;
        creaAnello(steps,color);
        stepsDropdown.addEventListener('change', event => {
            steps = parseInt(event.target.value, 10);
            if (!isNaN(steps)) {
                populateDropdowns(newRow, steps);
            }
            modello.modifyRingSteps(parseInt(stepsDropdown.parentNode.parentNode.id)-1,steps);
            anelli[parseInt(stepsDropdown.parentNode.parentNode.id)-1].steps=steps;
        });

        phaseDropdown.addEventListener('change', event => {
            phase = parseInt(event.target.value, 10);
            if (!isNaN(phase)) {
                populateDropdowns(newRow, phase);
            }
            modello.modifyRingPhase(parseInt(phaseDropdown.parentNode.parentNode.id)-1,phase);
            anelli[parseInt(phaseDropdown.parentNode.parentNode.id)-1].phase=phase;
        });
        densityDropdown.addEventListener('change', event => {
            density = parseInt(event.target.value, 10);
            if (!isNaN(density)) {
                populateDropdowns(newRow, density);
            }
            modello.modifyRingDensity(parseInt(densityDropdown.parentNode.parentNode.id)-1,density);
            anelli[parseInt(densityDropdown.parentNode.parentNode.id)-1].density=density;
        });
        //QUI CI STA UN BUG:
        //se rimuovo una riga, poi chiamo rimuoviAnello(newRow.id-1)
        //se dopo rimuovo un'altra riga, è possibile che passdogli l'id la funzione rimuoviAnello
        //che sta nel file display.js, non trovi un elemento Anello nell'array anelli[] con quell'indice
        //POSSIBILE SOLUZIONE: non passargli l'id della riga ma qualcos'altro
        newRow.querySelector('.remove-btn').addEventListener('click', () => {
            if(newRow.id-1==0){
                alert("Non puoi rimuovere il primo anello!");
                return;
            }
            releaseColor(color);
            newRow.remove();
            rimuoviAnello(newRow.id-1);//qua viene chiamata la funzione incriminata
            toggleAddButtonVisibility();
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
    addRow();//di default crea una riga al caricamento della pagina!
});
