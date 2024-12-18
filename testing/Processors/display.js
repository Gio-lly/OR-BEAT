// ######################################## GESTIONE DELLA FORMA D'ONDA
const regions = WaveSurfer.Regions.create()
const regionStartTimes = {};
const regionEndTimes = {};
// Give regions a random color when they are created
const random = (min, max) => Math.random() * (max - min) + min
const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

const ws = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#dd5e98',
    progressColor: '#ff4e00',
    cursorColor: '#ddd5e9',
    cursorWidth: 2,
    plugins: [regions]
})

function displayWaveform(file) {
    const fileURL = URL.createObjectURL(file);  // Crea un URL per il file (un oggetto URL.createObjectURL())

    // Carica il file audio in WaveSurfer
    ws.load(fileURL);

    // Mostra la sezione contenente la checkbox e lo zoom
    ws.on('ready', function() {
        document.getElementById('waveform-controls').style.display = 'block';

        p5on = true 
        setup(p5on) // avvia setup (poi draw()) e quindi rendi visibile tutto il codice p5
        
      
    });
}

function onsetsRegions(audioBuffer,onsetTimestamps) {
    if (!onsetTimestamps || onsetTimestamps.length === 0) {
        console.error("Nessun onset rilevato."); return; }
    
    regions.clearRegions();

    // Crea la prima regione dal punto 0 al primo onset, sulla forma d'onda
    ws.on('decode', () => { const firstRegion = regions.addRegion({
            id: 0,
            start: 0,      // Tempo di inizio
            end: onsetTimestamps[0],          // Tempo di fine
            color: randomColor(),  // Colore della regione
            drag: false,            // Permette di spostare la regione
            resize: true,          // Permette di ridimensionare la regione
            maxLength: onsetTimestamps[0]
        });
        regionStartTimes[firstRegion.id] = 0;
        regionEndTimes[firstRegion.id] = onsetTimestamps[0];
    });

    // Crea una regione per ogni onset rilevato
    for (let i = 0; i < onsetTimestamps.length; i++) {
        const startTime = onsetTimestamps[i];
        const endTime = onsetTimestamps[i + 1] || audioBuffer.duration;

        // Crea una regione sulla forma d'onda
        ws.on('decode', () => { const newRegion = regions.addRegion({
                id: i + 1,
                start: startTime,      // Tempo di inizio
                end: endTime,          // Tempo di fine
                color: randomColor(),  // Colore della regione
                drag: false,            // Permette di spostare la regione
                resize: true,          // Permette di ridimensionare la regione
                maxLength: endTime-startTime
            });
            regionStartTimes[newRegion.id] = startTime;
            regionEndTimes[newRegion.id] = endTime;
        });
    }
    console.log(regions.getRegions(), regionStartTimes, regionEndTimes)
}

// STOP WHEN REGION IS ENDED
let activeRegion = null
ws.on('timeupdate', (currentTime) => {
  // When the end of the region is reached
  if (activeRegion && currentTime >= activeRegion.end) {
    // Stop playing
    ws.pause()
    activeRegion = null
  }
})

// NO OVERLAPPING REGIONS
regions.on('region-updated', (region) => {
  const originalStartTime = regionStartTimes[region.id];
  const originalEndTime = regionEndTimes[region.id];
  const newStartTime = region.start;
  const newEndTime = region.end;

  // Sincronizza la regione successiva (se esiste)
  const regionsArray = regions.getRegions();
  const nextRegion = regionsArray[region.id + 1];

  // Se c'è una regione successiva, aggiorna il suo inizio per allinearlo alla fine della regione corrente
  if (nextRegion) {
      // Se la fine della regione corrente cambia, aggiorna l'inizio della successiva
      if (newEndTime !== originalEndTime) {
          nextRegion.setOptions({ start: newEndTime });
      }
  }

  // Sincronizza la regione precedente (se esiste)
  const previousRegion = regionsArray[region.id - 1];

  // Se c'è una regione precedente, aggiorna la sua fine per allinearla all'inizio della regione corrente
  if (previousRegion) {
      // Se l'inizio della regione corrente cambia, aggiorna la fine della precedente
      if (newStartTime !== originalStartTime) {
          previousRegion.setOptions({ end: newStartTime });
      }
  }

  if (newStartTime < originalStartTime) {
      console.warn("Non è possibile ridimensionare la regione a un tempo di inizio più piccolo di quello originale.");
      // Show a UI warning or message
      alert("La regione non può essere ridimensionata a un tempo di inizio precedente!");
      // Revert the start time back to the original one
      region.setOptions({ start: originalStartTime });
  }

  if (newEndTime > originalEndTime) {
    console.warn("Non è possibile ridimensionare la regione a un tempo di fine più grande di quello originale.");
    // Show a UI warning or message
    alert("La regione non può essere ridimensionata a un tempo di fine successivo!");
    // Revert the start time back to the original one
    region.setOptions({ end: originalEndTime });
  }

  regionStartTimes[region.id] = newStartTime;
  regionEndTimes[region.id] = newEndTime;
});

// Pulsante per fermare la musica
document.getElementById('stop-btn').addEventListener('click', function() {
    ws.pause();  // Metti in pausa la riproduzione dell'audio
});

// ZOOM LEVEL
ws.once('decode', () => {
    document.querySelector('input[type="range"]').oninput = (e) => {
      const minPxPerSec = Number(e.target.value)
      ws.zoom(minPxPerSec)
    }
})

// CLICK SU REGIONE -> PLAY
regions.on('region-clicked', (region, event) => {
    event.stopPropagation(); // Impedisce il click sulla forma d'onda
    region.play(region.start, region.end)  // Avvia la riproduzione della regione
    region.setOptions({ color: randomColor() });  // Cambia il colore della regione
    activeRegion = region
});

regions.on('region-double-clicked', (region, event) => {
  event.stopPropagation(); // Impedisce il click sulla forma d'onda
  console.log("cliccato: ", region.id);
});

// _________________________________________________________________________________
// ######################################## GESTIONE DELLA DRUM MACHINE IN p5
p5on = false // se imposta su false setup non runna, quindi tutto il codice p5 non sarà runnato.

// Variabili per gli anelli
let anelli = []; // Array per memorizzare gli anelli creati
let maxAnelli = 5; // Numero massimo di anelli consentiti
let diametroBase = 150; // Diametro base del primo anello
let spessoreAnello = 10; // Spessore degli anelli
let bottoneCreaAnello;
let bottoneRimuoviAnello;
let gap = 15 // spazio tra le sezioni dell'anello
let rotationOffset = -90 // perché l'angolo definito da p5 inizia "alle ore 3"

// Variabili per la barra che ruota
let angle = rotationOffset; // Angolo iniziale
let rotationSpeed = 2; // Velocità di rotazione iniziale
let isRunning = false; // Stato della rotazione della barra
let bpm;




function setup(p5on) {
  createCanvas(0, 0); // scrivo questo altrimenti di default si vede il canvas di p5 nella pagina iniziale
  
  if (!p5on) {return}
  
  const canvas = createCanvas(400, 400);
  canvas.parent('matrix-container'); // Collegalo al contenitore della forma d'onda


  angleMode(DEGREES);

  // Bottone per creare un nuovo anello
  bottoneCreaAnello = createButton('Crea un nuovo anello');
  bottoneCreaAnello.position(10, 400);
  bottoneCreaAnello.mousePressed(creaAnello);
  
  // Bottone per creare un nuovo anello
  bottoneRimuoviAnello = createButton('Togli ultimo anello');
  bottoneRimuoviAnello.position(200, 400);
  bottoneRimuoviAnello.mousePressed(rimuoviUltimoAnello);
  
  // Creo i buttoni per controllare la barra
  createControls()
  
  
  frameRate(60)
  
}

function draw() {
  background(30);
  
  // Calcola i BPM
  bpm = (60 * rotationSpeed * 60) / 360; // la formula è sbagliata

  // Mostra il risultato
  fill(255); // Colore del testo
  textSize(16);
  text(`BPM: ${bpm.toFixed(0)}`, -100,height -33);
  
  translate(width / 2, height / 2);

  // Disegna tutti gli anelli
  for (let anello of anelli) {
    anello.disegna();
  }
  
  // Disegna la barra quando disegno il primo anello
  if (anelli.length > 0) {
    push();
    rotate(angle); // Ruota secondo l'angolo
    stroke(255); // Colore della barra
    strokeWeight(5); // Spessore della barra
    let lunghezzabarra= anelli[anelli.length-1].diametro/2 + 10 // è in funzione di quanti anelli ci sono
    line(0, 0, lunghezzabarra, 0); // Disegna la barra
    pop();

    // Aggiorna l'angolo per creare il movimento se la rotazione è attiva
    if (isRunning) {
        angle += rotationSpeed; // Velocità della rotazione
        if (angle >= 270) {
            angle = rotationOffset; // Resetta l'angolo dopo un giro completo 360 - 90
        }
  }
  
  
  
}
  
  
  
  
}


function rimuoviUltimoAnello(){
  anelli.pop();
}



function creaAnello() {
  if (anelli.length >= maxAnelli) {
    console.log("Limite anelli raggiunto");
    return;
  }

  let steps = int(prompt("Inserisci il numero di steps per il nuovo anello:"));
  let colorInput = prompt("Inserisci il colore dell'anello (es: #FF0000 per rosso):");

  let nuovoAnello = new Anello(steps, colorInput, diametroBase + anelli.length * spessoreAnello* 5);
  anelli.push(nuovoAnello);
}




class Anello {
  constructor(steps, color, diametro) {
    this.steps = steps;
    this.color = color;
    this.diametro = diametro;
    this.bool_list = Array(steps).fill(false); // Inizialmente tutte le sezioni sono disattivate
  }

  disegna() {
    strokeWeight(spessoreAnello);
    noFill()
    let angoloStep = 360 / this.steps - gap;

    for (let i = 0; i < this.steps; i++) {
      let startAngolo = i * (angoloStep + gap) + rotationOffset;
      let endAngolo = startAngolo + angoloStep; 
      
      // Controlla se la barra si trova sopra questo segmento

      let highlight = angle >= startAngolo && angle < endAngolo;
      

    // Imposta il colore del segmento
    if (highlight & isRunning) {
      stroke(this.bool_list[i] ? this.color : 100); // Colore evidenziato
      strokeWeight(spessoreAnello+5)

    } else {
      stroke(this.bool_list[i] ? this.color : 100); // colore che ho scelto per l'anello
      strokeWeight(spessoreAnello)

    }
      
      // Disegna la parte dell'anello
      arc(0, 0, this.diametro, this.diametro, startAngolo, endAngolo);
    }
  }

  toggleStep(indice) {
    if (indice >= 0 && indice < this.steps) {
      this.bool_list[indice] = !this.bool_list[indice];
    }
  }
}

function mousePressed() {
  let x = mouseX - width / 2;
  let y = mouseY - height / 2;
  let distanza = dist(0, 0, x, y);

  for (let anello of anelli) {
    let raggioInterno = anello.diametro / 2- 10;
    let raggioEsterno = anello.diametro / 2 + spessoreAnello;

    if (distanza > raggioInterno && distanza < raggioEsterno) {
      let angolo = atan2(y, x) - rotationOffset;
      if (angolo < 0) angolo += 360;

      let indice = floor(angolo / (360 / anello.steps));
      anello.toggleStep(indice);
      break;
    }
  }
}

function createControls() {
  // Crea i pulsanti per il controllo della rotazione
  let startButton = createButton('Avvia');
  startButton.position(1200, height-100); // Posizionato a destra
  startButton.size(50, 50);
  startButton.style('border-radius', '50%');
  startButton.mousePressed(startRotation);

  let pauseButton = createButton('Pausa');
  pauseButton.position(1300, height-100); // Posizionato accanto al pulsante di avvio
  pauseButton.size(50, 50);
  pauseButton.style('border-radius', '50%');
  pauseButton.mousePressed(pauseRotation);

  let stopButton = createButton('Ferma');
  stopButton.position(1400, height-100); // Posizionato accanto al pulsante di pausa
  stopButton.size(50, 50);
  stopButton.style('border-radius', '50%');
  stopButton.mousePressed(stopRotation);

  // Crea la barra di controllo della velocità
  let speedSlider = createSlider(1, 10, 2, 0.1);
  speedSlider.position(1200, height-50); // Posizionato sotto i pulsanti
  speedSlider.input(() => { rotationSpeed = speedSlider.value(); });
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
  angle = rotationOffset; // Resetta l'angolo
}

