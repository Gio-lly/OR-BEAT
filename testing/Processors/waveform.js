// ######################################## GESTIONE DELLA FORMA D'ONDA
const regions = WaveSurfer.Regions.create()
// Give regions a random color when they are created
const random = (min, max) => Math.random() * (max - min) + min
const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

const ws = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'rgb(200, 0, 200)',
    progressColor: 'rgb(100, 0, 100)',
    plugins: [regions]
})

function displayWaveform(file) {
    const fileURL = URL.createObjectURL(file);  // Crea un URL per il file (un oggetto URL.createObjectURL())

    // Carica il file audio in WaveSurfer
    ws.load(fileURL);

    // Mostra la sezione contenente la checkbox e lo zoom
    ws.on('ready', function() {
        document.getElementById('waveform-controls').style.display = 'block';
    });
}

function onsetsRegions(audioBuffer) {
    if (!onsetTimestamps || onsetTimestamps.length === 0) {
        console.error("Nessun onset rilevato."); return; }
    
    // Crea la prima regione dal punto 0 al primo onset, sulla forma d'onda
    ws.on('decode', () => { regions.addRegion({
            start: 0,      // Tempo di inizio
            end: onsetTimestamps[0],          // Tempo di fine
            color: randomColor(),  // Colore della regione
            drag: true,            // Permette di spostare la regione
            resize: true,          // Permette di ridimensionare la regione
            loop: true             // Permette il looping della regione
        });
    });

    // Crea una regione per ogni onset rilevato
    for (let i = 0; i < onsetTimestamps.length; i++) {
        const startTime = onsetTimestamps[i];
        const endTime = onsetTimestamps[i + 1] || audioBuffer.duration;

        // Crea una regione sulla forma d'onda
        ws.on('decode', () => { regions.addRegion({
                start: startTime,      // Tempo di inizio
                end: endTime,          // Tempo di fine
                color: randomColor(),  // Colore della regione
                drag: true,            // Permette di spostare la regione
                resize: true,          // Permette di ridimensionare la regione
                loop: true             // Permette il looping della regione
            });
        });
    }
}

// Pulsante per fermare la musica
document.getElementById('stop-btn').addEventListener('click', function() {
    ws.pause();  // Metti in pausa la riproduzione dell'audio
});

// Zoom Level
ws.once('decode', () => {
    document.querySelector('input[type="range"]').oninput = (e) => {
      const minPxPerSec = Number(e.target.value)
      ws.zoom(minPxPerSec)
    }
})

let loop = true;
let activeRegion = null;
// Toggle looping with a checkbox
document.querySelector('input[type="checkbox"]').onclick = (event) => {
  loop = event.target.checked;
};

regions.on('region-clicked', (region, event) => {
    event.stopPropagation(); // Impedisce il click sulla forma d'onda
    activeRegion = region;
    region.play();  // Avvia la riproduzione della regione
    region.setOptions({ color: randomColor() });  // Cambia il colore della regione
});

regions.on('region-in', (region) => {
  //console.log('region-in', region);
  activeRegion = region;
});

regions.on('region-out', (region) => {
  //console.log('region-out', region);
  if (activeRegion === region) {
    if (loop) {
      region.play();  // Riproduce la regione se il loop è abilitato
    } else {
      activeRegion = null;  // Se il loop non è abilitato, resetta l'activeRegion
    }
  }
});

// Reset the active region when the user clicks anywhere in the waveform
ws.on('interaction', () => {
  activeRegion = null;
});
