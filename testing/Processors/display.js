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

        // Creiamo il canvas p5 all'interno del div #waveform-container
        let p5Canvas = createCanvas(400, 400);
        p5Canvas.parent('canvas-container'); // Collegalo al contenitore della forma d'onda
        createControls();
    });
}

function onsetsRegions(audioBuffer) {
    if (!onsetTimestamps || onsetTimestamps.length === 0) {
        console.error("Nessun onset rilevato."); return; }
    
    regions.clearRegions();
    regions.regionsContainer.innerHTML = "";

    // Crea la prima regione dal punto 0 al primo onset, sulla forma d'onda
    ws.on('decode', () => { regions.addRegion({
            start: 0,      // Tempo di inizio
            end: onsetTimestamps[0],          // Tempo di fine
            color: randomColor(),  // Colore della regione
            drag: true,            // Permette di spostare la regione
            resize: true,          // Permette di ridimensionare la regione
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

regions.on('region-clicked', (region, event) => {
    event.stopPropagation(); // Impedisce il click sulla forma d'onda
    region.play();  // Avvia la riproduzione della regione
    region.setOptions({ color: randomColor() });  // Cambia il colore della regione
});

// _________________________________________________________________________________
// ######################################## GESTIONE DELLA DRUM MACHINE IN p5
let angle = 0; // Angolo iniziale
let ringSegments = [{ diameter: 300, totalSegments: 3, gap: 10, rotationOffset: 0 },
                    { diameter: 200, totalSegments: 5, gap: 10, rotationOffset: 0 }];
let regionSlotMapping = {};  // Mappa per associare le regioni agli slot
let slotWidth = 360 / ringSegments[0].totalSegments;  // Larghezza di ogni slot in gradi
let rotationSpeed = 2; // Velocità di rotazione iniziale
let isRunning = false; // Stato della rotazione della barra

function setup() {
  createCanvas(400, 400);
  angleMode(DEGREES); // Imposta l'angolo in gradi
}

function draw() {
  background(30); // Colore di sfondo
  translate(width / 2, height / 2); // Sposta l'origine al centro del canvas

  // Disegna e gestisci gli anelli
  for (let ring of ringSegments) {
      drawRing(ring.diameter, ring.totalSegments, ring.gap, ring.rotationOffset);
  }

  // Disegna la barra
  push();
  rotate(angle); // Ruota secondo l'angolo
  stroke(255); // Colore della barra
  strokeWeight(4); // Spessore della barra
  line(0, 0, 150, 0); // Disegna la barra
  pop();

  // Controlla se la lancetta passa sopra uno slot e riproduce la regione
  playSoundIfInSlot();

  // Aggiorna l'angolo per creare il movimento se la rotazione è attiva
  if (isRunning) {
      angle += rotationSpeed; // Velocità della rotazione
      if (angle >= 360) {
          angle = 0; // Resetta l'angolo dopo un giro completo
      }
  }
}

// Funzione per disegnare un anello diviso in segmenti con spazi vuoti
function drawRing(diameter, totalSegments, gap, rotationOffset) {
  strokeWeight(4); // Spessore del bordo
  noFill(); // Nessun riempimento
  let segmentAngle = 360 / totalSegments - gap; // Angolo di ogni segmento

  for (let i = 0; i < totalSegments; i++) {
    let start = i * (segmentAngle + gap) + rotationOffset; // Inizio della sezione
    let end = start + segmentAngle; // Fine della sezione

    // Controlla se la barra si trova sopra questo segmento
    let normalizedAngle = (angle + 360) % 360; // Normalizza l'angolo della barra tra 0 e 360
    let highlight = normalizedAngle >= start && normalizedAngle < end;

    // Imposta il colore del segmento
    if (highlight) {
      stroke(255, 255, 100); // Colore evidenziato
      //console.log(`Suono su parte ${i + 1}`); // Log del segmento attivo
    } else {
      stroke(100 + i * 50, 150, 255); // Colore normale
    }

    // Disegna la sezione dell'anello
    arc(0, 0, diameter, diameter, start, end);
  }
}

function createControls() {
  // Crea i pulsanti per il controllo della rotazione
  let startButton = createButton('Avvia');
  startButton.position(10, height + 10);
  startButton.size(50, 50);
  startButton.style('border-radius', '50%');
  startButton.mousePressed(startRotation);

  let pauseButton = createButton('Pausa');
  pauseButton.position(70, height + 10);
  pauseButton.size(50, 50);
  pauseButton.style('border-radius', '50%');
  pauseButton.mousePressed(pauseRotation);

  let stopButton = createButton('Ferma');
  stopButton.position(130, height + 10);
  stopButton.size(50, 50);
  stopButton.style('border-radius', '50%');
  stopButton.mousePressed(stopRotation);

  // Crea la barra di controllo della velocità
  let speedSlider = createSlider(0, 10, 2, 0.1);
  speedSlider.position(40, height + 60);
  speedSlider.input(() => {rotationSpeed = speedSlider.value();});
}

// Funzione per avviare la rotazione
function startRotation() {
  isRunning = true;
}

// Funzione per mettere in pausa la rotazione
function pauseRotation() {
  isRunning = false;
}

// Funzione per fermare e resettare la rotazione
function stopRotation() {
  isRunning = false;
  angle = 0; // Resetta l'angolo
}




function playSoundIfInSlot() {
  let normalizedAngle = (angle + 360) % 360;  // Normalizza l'angolo della lancetta tra 0 e 360
  let slotIndex = Math.floor(normalizedAngle / slotWidth);  // Trova l'indice dello slot corrente

  // Verifica se c'è una regione associata a questo slot
  if (regionSlotMapping[slotIndex]) {
      let region = regionSlotMapping[slotIndex];
      region.play();  // Riproduci la regione associata a questo slot
  }
}

function onRegionRelease(event) {
  // Calcolare l'angolo della regione in base al tempo di inizio
  let regionAngle = event.region.start * 360 / ws.getDuration();  // Angolo corrispondente alla regione
  let slotIndex = Math.floor(regionAngle / slotWidth);  // Trova lo slot della ruota

  // Associare la regione allo slot della ruota
  regionSlotMapping[slotIndex] = event.region;
  console.log(`Region assigned to slot ${slotIndex}`);
}