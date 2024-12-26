// ######################################## GESTIONE DELLA FORMA D'ONDA
const MIN_THRESHOLD = 0.1; // Threshold minima per gli onset (diff. tra gli starting points): 
                              // se ho due onset molto vicini il secondo lo ignoro!
const DOUBLE_CLICK_THRESHOLD = 250; // Tempo necessario per distinguere se l'utente fa 'click' o 'doppio-click'
let clickTimer = null;

const regions = WaveSurfer.Regions.create() // Creiamo una prima istanza del Plugin Region -> Questi sono i marker
const coloredRegions = WaveSurfer.Regions.create() // Creiamo una seconda istanza del Plugin Region -> Queste sono le regioni colorate
const timeline = WaveSurfer.Timeline.create({
  height: 20,
  timeInterval: 0.1,
  primaryLabelInterval: 0.5,
  style: {
    fontSize: '15px',
    color: '#B8860B',
  },
})
const regionStartTimes = {}; // Qui mi salverò tutti i starting points

// Give regions a random color when they are created
const random = (min, max) => Math.random() * (max - min) + min
const randomColor = () => `rgba(139, 28, 29, 0.5)`;

//-------------------------------------------------------------------------------- GESTIONE FORMA D'ONDA CON WAVESURFER
// Creiamo la waveform
const ws = WaveSurfer.create({
  container: '#waveform',
  waveColor: '#748DA6',
  progressColor: '#EDD27C',
  cursorColor: '#ddd5e9',
  cursorWidth: 2,
  plugins: [regions, coloredRegions, timeline]
})

function displayWaveform(file) { // Viene chiamata dallo script.js  e disegna la waveform del file
  const fileURL = URL.createObjectURL(file);  // Crea un URL per il file (un oggetto URL.createObjectURL())

  // Carica il file audio in WaveSurfer
  ws.load(fileURL);

  // Mostra la sezione contenente la checkbox e lo zoom
  ws.on('ready', function () {
    document.getElementById('workstation').style.display = 'block';
    document.querySelector('.savings').style.display = 'flex';
    document.getElementById('waveform-controls').style.display = 'block';

    p5on = true
    setup(p5on) // avvia setup (poi draw()) e quindi rendi visibile tutto il codice p5
    
  });
}

//-------------------------------------------------------------------------------- GESTIONE LETTURA ONSETS
function onsetsRegions(onsetTimestamps, duration) { // Viene chiamata dallo script.js
  // duration: durata totale del brano

  if (!onsetTimestamps || onsetTimestamps.length === 0) {
    console.error("Nessun onset rilevato."); return;
  }

  // Puliamo e resettiamo...
  regions.clearRegions();

  // Crea la prima regione 'marker' dal punto 0 al primo onset, sulla forma d'onda
  ws.on('decode', () => {
    const firstRegion = regions.addRegion({
      id: '0',
      content: '',
      start: 0,                       // Tempo di inizio
      drag: false            // Permette di spostare la regione
    });
    regionStartTimes[firstRegion.id] = 0;
  });

  // Crea una regione 'marker' per ogni onset rilevato
  for (let i = 0; i < onsetTimestamps.length; i++) {
    const startTime = onsetTimestamps[i];

    if ((i + 1) < onsetTimestamps.length && (onsetTimestamps[i + 1] - startTime) >= MIN_THRESHOLD) {
      // Crea una regione sulla forma d'onda
      ws.on('decode', () => {
        const newRegion = regions.addRegion({
          id: i + 1,
          content: '',
          start: startTime,         // Tempo di inizio
          drag: true            // Permette di spostare la regione
        });
        regionStartTimes[newRegion.id] = startTime;
      });
    } else if ((i + 1) === onsetTimestamps.length && (duration - startTime) >= MIN_THRESHOLD) {
      // Gestiamo bene la fine/(l'ultimo marker avrà come punto di fine la durata totale del brano)
      ws.on('decode', () => {
        const newRegion = regions.addRegion({
          id: i + 1,
          content: '',
          start: startTime,         // Tempo di inizio
          drag: true            // Permette di spostare la regione
        });
        regionStartTimes[newRegion.id] = startTime;
      });
    }
  }
}

//-------------------------------------------------------------------------------- GESTIONE PAUSA AUDIO QUANDO ARRIVIAMO AL PROSSIMO MARKER
let activeRegion = null
ws.on('timeupdate', (currentTime) => {
  // When the end of the region is reached
  if (activeRegion && currentTime >= activeRegion.end) {
    // Stop playing
    ws.pause()
    activeRegion = null
  }
})

//-------------------------------------------------------------------------------- GESTIONE EVENTO CLICK -> riproduco audio
ws.on('click', () => {
  const clickTime = ws.getCurrentTime(); // Ottieni il tempo in cui è stato cliccato
  const regionsArray = regions.getRegions();
  let clickedRegion = null;

  // RILEVAZIONE DOPPIO-CLICK
  if (clickTimer !== null) {
    clearTimeout(clickTimer);  // Ferma il timer del clic singolo, questo significa che è un doppio clic
    clickTimer = null;  // Reset del timer
    //console.log("Doppio clic rilevato");
    // puliamo...
    coloredRegions.clearRegions();
    doubleclick();


    // RILEVAZIONE 'CLICK' SINGOLO
  } else {
    // Avviamo un timer per il clic singolo
    clickTimer = setTimeout(() => {
      //console.log("Clic singolo rilevato");
      // puliamo...
      coloredRegions.clearRegions();
      // Cerca la regione più vicina al clic
      for (let i = 0; i < regionsArray.length; i++) {
        if ((i + 1) < regionsArray.length) {
          const startTime = regionsArray[i].start;
          const nextStartTime = regionsArray[i + 1].start;

          // Se il tempo di clic è tra startTime e nextStartTime della regione
          if (clickTime >= startTime && clickTime <= nextStartTime) {
            clickedRegion = { id: regionsArray[i].id, start: startTime, end: nextStartTime };
            activeRegion = clickedRegion;
            break;
          }
        } else {
          // l'ultima regione dovrà suonare fino alla fine del brano
          ws.play(ws.getCurrentTime(), ws.getDuration());
        }
      }

      if (clickedRegion !== null) {
        ws.play();
      }
      clickTimer = null;  // Reset del timer dopo aver gestito il clic singolo
    }, DOUBLE_CLICK_THRESHOLD);
  }
});

//-------------------------------------------------------------------------------- GESTIONE OVERLAPPING MARKER
// Funzione per capire se tutti i marker sono in ordine oppure no, se restituisce False ho sovrapposizione di due marker
function checkStartTimesOrder() {
  // Ottieni tutte le regioni
  const regionsArray = regions.getRegions();

  // Estrai i startTimes delle regioni
  const startTimes = regionsArray.map(region => region.start);

  // Verifica che gli startTimes siano in ordine crescente
  for (let i = 1; i < startTimes.length; i++) {
    if (startTimes[i] < startTimes[i - 1]) {
      console.warn("Gli startTimes non sono in ordine crescente! Reset ...");
      return false; // Restituisce false se gli startTimes non sono in ordine crescente
    }
  }

  // Se il ciclo finisce senza trovare errori, gli startTimes sono in ordine crescente
  //console.log("Gli startTimes sono in ordine crescente.");
  return true; // Restituisce true se gli startTimes sono corretti
}

// NO OVERLAPPING REGIONS
regions.on('region-updated', (region) => {
  let draggedRegion = null;
  const originalStartTime = regionStartTimes[region.id];
  const newStartTime = region.start;

  // puliamo...
  coloredRegions.clearRegions();
  // Ottieni tutte le regioni esistenti
  const regionsArray = regions.getRegions();

  // Controlla se c'è una sovrapposizione tra la regione corrente e un'altra
  if (!checkStartTimesOrder()) {
    alert("Non puoi spostare la regione su un altro marker!");

    // Ripristina la posizione originale
    region.setOptions({ start: originalStartTime });
    return;
  }

  // Aggiorna i tempi solo se non ci sono sovrapposizioni
  draggedRegion = { id: region.id, start: newStartTime };
  regionStartTimes[region.id] = newStartTime;
})

// ZOOM LEVEL
ws.once('decode', () => {
  document.querySelector('input[type="range"]').oninput = (e) => {
    const minPxPerSec = Number(e.target.value)
    ws.zoom(minPxPerSec)
  }
})

//-------------------------------------------------------------------------------- GESTIONE EVENTO DOPPIO-CLICK
function doubleclick() {
  const clickTime = ws.getCurrentTime(); // Ottieni il tempo in cui è stato cliccato
  const regionsArray = regions.getRegions();
  let data = null;
  let newRegion = null;
  let startTime = null;
  let nextStartTime = null;

  // Cerca la regione più vicina al clic
  for (let i = 0; i < regionsArray.length; i++) {
    startTime = regionsArray[i].start;
    
    if ((i + 1) < regionsArray.length) {

      nextStartTime = regionsArray[i + 1].start;
      // Se il tempo di clic è tra startTime e nextStartTime della regione
      if (clickTime >= startTime && clickTime <= nextStartTime) {
        newRegion = coloredRegions.addRegion({
          start: startTime,                       // Tempo di inizio
          end: nextStartTime,     // Tempo di fine
          color: randomColor(),  // Colore della regione
          drag: false,            // Permette di spostare la regione
          resize: false,       // Permette di ridimensionare la regione
        });

        data = { startTime: startTime, nextStartTime: nextStartTime };
        break;
      }
    } else {
      // fine della lista delle regioni
      nextStartTime = ws.getDuration();

      newRegion = coloredRegions.addRegion({
        start: startTime,                       // Tempo di inizio
        end: ws.getDuration(),     // Tempo di fine
        color: randomColor(),  // Colore della regione
        drag: false,            // Permette di spostare la regione
        resize: false,       // Permette di ridimensionare la regione
      });

      data = { startTime: startTime, nextStartTime: ws.getDuration()};
      break;
    }
  }

  // LOGICA DI ESPORTAZIONE
  const event = new CustomEvent('waveDataReady');
  // Memorizza i dati in una variabile globale (window)
  window.waveData = data;
  window.dispatchEvent(event);
}
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

  if (!p5on) { return }

  const canvas = createCanvas(400, 400);
  canvas.parent('matrix-container'); // Collegalo al contenitore della forma d'onda


  angleMode(DEGREES);
  // let nuovoAnello = new Anello(2, "#FF5733", diametroBase +  spessoreAnello* 5);
  // anelli.push(nuovoAnello);

  //modello.addRing([],2,0,0,"#FF5733"); //todo linkare alla matrice
  // // Bottone per creare un nuovo anello
  // bottoneCreaAnello = createButton('Crea un nuovo anello');
  // bottoneCreaAnello.position(10, 400);
  // bottoneCreaAnello.mousePressed(creaAnello);

  // Bottone per creare un nuovo anello
  // bottoneRimuoviAnello = createButton('Togli ultimo anello');
  // bottoneRimuoviAnello.position(200, 400);
  // bottoneRimuoviAnello.mousePressed(rimuoviUltimoAnello);

  // Creo i buttoni per controllare la barra
  createControls();
}

function draw() {
  background(30);

  // Calcola i BPM
  bpm = (60 * rotationSpeed * 60) / 360; // la formula è sbagliata

  // Mostra il risultato
  fill(255); // Colore del testo
  textSize(16);
  text(`BPM: ${bpm.toFixed(0)}`, -100, height - 33);

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
    let lunghezzabarra = anelli[anelli.length - 1].diametro / 2 + 10 // è in funzione di quanti anelli ci sono
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


function rimuoviUltimoAnello() {
  anelli.pop();
  modello.removeRing(anelli.length-1);
}
function rimuoviAnello(i) {
  anelli.splice(i, 1);
  modello.removeRing(i);
} 


function creaAnello(steps, colorInput) {
  if (anelli.length >= maxAnelli) {
    console.log("Limite anelli raggiunto");
    return;
  }
  let nuovoAnello = new Anello(steps, colorInput, diametroBase + anelli.length * spessoreAnello * 5);
  anelli.push(nuovoAnello);

  modello.addRing([], steps, 0, 0, colorInput); //todo linkare alla matrice
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
        strokeWeight(spessoreAnello + 5)

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

  let i_ring;
  for (let anello of anelli) {
    let raggioInterno = anello.diametro / 2 - 10;
    let raggioEsterno = anello.diametro / 2 + spessoreAnello;

    if (distanza > raggioInterno && distanza < raggioEsterno) {
      let angolo = atan2(y, x) - rotationOffset;
      if (angolo < 0) angolo += 360;

      let indice = floor(angolo / (360 / anello.steps));
      anello.toggleStep(indice);
      i_ring = anelli.indexOf(anello);
      modello.modifyRingBooleanList(i_ring, anello.bool_list);
      break;
    }
  }
}

function createControls() {
  // Crea i pulsanti per il controllo della rotazione
  let startButton = createButton('Avvia');
  startButton.position(1200, height - 100); // Posizionato a destra
  startButton.size(50, 50);
  startButton.style('border-radius', '50%');
  startButton.mousePressed(startRotation);

  let pauseButton = createButton('Pausa');
  pauseButton.position(1300, height - 100); // Posizionato accanto al pulsante di avvio
  pauseButton.size(50, 50);
  pauseButton.style('border-radius', '50%');
  pauseButton.mousePressed(pauseRotation);

  let stopButton = createButton('Ferma');
  stopButton.position(1400, height - 100); // Posizionato accanto al pulsante di pausa
  stopButton.size(50, 50);
  stopButton.style('border-radius', '50%');
  stopButton.mousePressed(stopRotation);

  // Crea la barra di controllo della velocità
  let speedSlider = createSlider(1, 10, 2, 0.1);
  speedSlider.position(1200, height - 50); // Posizionato sotto i pulsanti
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

