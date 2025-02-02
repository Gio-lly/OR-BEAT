// ######################################## GESTIONE DELLA REGISTRAZIONE AUDIO (MAX. 1 MINUTE)
let wsurf, wave
// Utilizziamo il Plugin Record di Wavesurfer
let record = WaveSurfer.Record.create({
  renderRecordedAudio: true, // visualizza l'onda durante la registrazione
  continuousWaveform: true,  // Abilita la visualizzazione continua
  continuousWaveformDuration: 60, // Durata opzionale della visualizzazione continua
  bufferSize: 2048, // Dimensione del buffer (implica la qualità del waveform)
});

// Quando il record-button viene cliccato, si visualizza la finestra di registrazione
document.getElementById("record-btn").addEventListener("click", function (event) {
  event.stopPropagation(); //opzionale qui
  document.getElementById("recording-section").style.display = "block"; // Mostra la sezione di registrazione
  document.getElementById("title").style.display = "none"; // Nasconde il welcome...
  document.getElementById("preset-btn").style.display = "none"; // Nasconde il preset btn...
  document.getElementById("preset-btn").click();
  document.getElementById("record-btn").style.display = "none"; // Nasconde il bottone "Registra"
  createWaveSurfer(); // Creaimo la session
});

const createWaveSurfer = () => {
  // Creiamo una nuova istanza di wavesurfer
  wsurf = WaveSurfer.create({
    container: '#mic', // link all' html
    waveColor: '#748DA6',
    progressColor: '#EDD27C',
    plugins: [record] // aggiungiamo il plugin Record
  })

  //-------------------------------------------------------------------------------- GESTIONE INIZIO REC: 
  record.on('record-start', () => {
    if (wave) {
      wave.destroy()
    }

    // Rimozione del pulsante di play e del link di download dalla sezione precedente
    const container = document.querySelector('#recordings');
    container.innerHTML = '';
  })  

  //-------------------------------------------------------------------------------- GESTIONE FINE REC: 
  // salvataggio della registrazione
  record.on('record-end', (blob) => {
    const container = document.querySelector('#recordings')
    const recordedUrl = URL.createObjectURL(blob)
    
    // Comportamento del Play/Pause button(s)
    const button = container.appendChild(document.createElement('button'))
    button.textContent = 'Play';
    button.id = 'play-button';
    button.onclick = (e) => {e.stopPropagation(); wsurf.playPause()}
    wsurf.on('pause', () => (button.textContent = 'Play'))
    wsurf.on('play', () => (button.textContent = 'Pause'))

    button.style.marginRight = '10px';

    // rendiamo disponibile un Download link
    const link = container.appendChild(document.createElement('a'))
    Object.assign(link, {
      href: recordedUrl,
      download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
      //textContent: 'Download recording',
    })
    link.innerHTML = '<i class="fa-solid fa-cloud-arrow-down"></i> ';
    link.id = 'download-link';
    // Aggiungi l'event listener al link per il click
    link.addEventListener('click', function(event) {
      event.stopPropagation(); // Questo impedisce la propagazione dell'evento
    });

    // Aggiungi il file Webm alla lista di selectedFiles in script.js
    const blobFile = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });

    // Emissione dell'evento personalizzato per passare il file Webm, così che possiamo processarlo
    const event = new CustomEvent('recording-completed', { detail: { file: blobFile } });
    window.dispatchEvent(event);
  });

  pauseButton.style.display = 'none'
  recButton.textContent = 'Record'

  record.on('record-progress', (time) => {
    // TIMER OROLOGIO DURANTE REGISTRAZIONE
    updateProgress(time)
  })
}

//-------------------------------------------------------------------------------- GESTIONE TIMER OROLOGIO (IN SECONDI)
const progress = document.querySelector('#progress')
const updateProgress = (time) => {
  // time will be in milliseconds, convert it to mm:ss format
  const formattedTime = [
    Math.floor((time % 3600000) / 60000), // minutes
    Math.floor((time % 60000) / 1000), // seconds
  ]
    .map((v) => (v < 10 ? '0' + v : v))
    .join(':')
  progress.textContent = formattedTime

  // !!SE LA REGISTRAZIONE SUPERA 60sec LA FERMO E SONO PRONTO A PROCESSARE IL FILE!!
  if (time >= 60000) {
    record.stopRecording(); // Ferma la registrazione
    recButton.textContent = 'Record'; // Ripristina il bottone di registrazione
    pauseButton.style.display = 'none'; // Nasconde il bottone di pausa
  }
}

//-------------------------------------------------------------------------------- GESTIONE BOTTONE PAUSE
const pauseButton = document.querySelector('#pause')
pauseButton.onclick = (event) => {
  event.stopPropagation();
  if (record.isPaused()) {
    record.resumeRecording()
    pauseButton.textContent = 'Pause'
    return
  }

  record.pauseRecording()
  pauseButton.textContent = 'Resume'
}

//-------------------------------------------------------------------------------- GESTIONE MIC SELECTION
const micSelect = document.querySelector('#mic-select')

micSelect.addEventListener('click', function(event) {
  event.stopPropagation(); // Impedisce la propagazione dell'evento
});

// Mic selection
WaveSurfer.Record.getAvailableAudioDevices().then((devices) => {
  devices.forEach((device) => {
  const option = document.createElement('option')
  option.value = device.deviceId
  option.text = device.label || device.deviceId
  micSelect.appendChild(option)
  })
})

//-------------------------------------------------------------------------------- GESTIONE RECORD BUTTON
const recButton = document.querySelector('#record')

recButton.onclick = (event) => {
  event.stopPropagation();
  if (record.isRecording() || record.isPaused()) {
    record.stopRecording()
    recButton.textContent = 'Record'
    pauseButton.style.display = 'none'
    return
  }

  recButton.disabled = true

  // reset the wavesurfer instance

  // get selected device
  const deviceId = micSelect.value
  record.startRecording({ deviceId }).then(() => {
    recButton.textContent = 'Stop'
    recButton.disabled = false
    pauseButton.style.display = 'inline'
  })
}

// ######################################## GESTIONE DELLA REGISTRAZIONE AUDIO FINALE (CON MIC ESTERNO!!)
let finalWsurf, finalWave;
let recorder = new Tone.Recorder();
const stopRecording = document.querySelector("#stop-recording-btn");

document.querySelector("#start-recording-btn").addEventListener('click',()=>{
  recorder.start();
  stopRecording.style.display="";
});

let finalRecordedAudioBuffer=null;
document.querySelector("#stop-recording-btn").addEventListener('click',stopFinalRecording);

async function stopFinalRecording() {
  const recording = await recorder.stop();
  //const mp3Blob = await convertToMP3(recording);
  const recordedSong = WaveSurfer.create({
    container: '#recordings2',  // Un div dove visualizzare la forma d'onda
    waveColor: 'violet',
    progressColor: 'purple',
  });
  recordedSong.loadBlob(recording)
  document.querySelector("#recordings2").style.display="";
  
  document.getElementById("download-final-recording").style.display = "";
  document.getElementById("download-final-recording").onclick = function() {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(recording);
    link.download = 'audio.wav'; // MP3 richiede una conversione, quindi lo lasciamo WAV
    link.click();
  };

}

async function convertToMP3(blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const wavData = new DataView(arrayBuffer);

  // Estrarre i dettagli del formato audio dal WAV
  const numChannels = wavData.getUint16(22, true);
  const sampleRate = wavData.getUint32(24, true);

  // Trovare l'inizio dei dati audio PCM
  let audioStart = 44; // Standard WAV header size
  for (let i = 12; i < arrayBuffer.byteLength - 8; i++) {
    if (wavData.getUint32(i, true) === 0x61746164) { // "data" chunk
      audioStart = i + 8;
      break;
    }
  }

  // Estrarre solo i dati PCM e convertirli in Float32Array
  const pcmData = new DataView(arrayBuffer, audioStart);
  const samples = pcmData.byteLength / 2;
  const pcm16 = new Int16Array(samples);

  for (let i = 0; i < samples; i++) {
    pcm16[i] = pcmData.getInt16(i * 2, true); // Little-endian
  }

  // Se il file è stereo, convertiamo in mono
  let monoData = [];
  if (numChannels === 2) {
    for (let i = 0; i < pcm16.length; i += 2) {
      monoData.push((pcm16[i] + pcm16[i + 1]) / 2); // Media tra i due canali
    }
  } else {
    monoData = Array.from(pcm16);
  }

  // Normalizzazione del segnale tra -1 e 1 (Float32)
  const float32Array = monoData.map(sample => sample / 32768.0);

  // Inizializzare il codificatore MP3
  const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // Mono, 44.1kHz, 128kbps
  const mp3Data = [];
  const samplesPerFrame = 1152;
  const int16Array = new Int16Array(float32Array.map(n => n * 32767)); // Convert back to Int16

  // Convertire i dati PCM in MP3 frame per frame
  for (let i = 0; i < int16Array.length; i += samplesPerFrame) {
    const sampleChunk = int16Array.subarray(i, i + samplesPerFrame);
    const mp3buf = mp3Encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) mp3Data.push(mp3buf);
  }

  // Terminare la codifica
  const mp3buf = mp3Encoder.flush();
  if (mp3buf.length > 0) mp3Data.push(mp3buf);

  return new Blob(mp3Data, { type: 'audio/mp3' });
}
