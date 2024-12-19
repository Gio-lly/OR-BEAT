let wsurf, wave
let record = WaveSurfer.Record.create({
  renderRecordedAudio: true, // Impostalo su true per visualizzare l'onda durante la registrazione
  continuousWaveform: true,  // Abilita la visualizzazione continua
  continuousWaveformDuration: 30, // Durata opzionale della visualizzazione continua
  bufferSize: 2048, // Dimensione del buffer (implica la qualità del waveform)
});
let scrollingWaveform = false
let continuousWaveform = true

document.getElementById("record-btn").addEventListener("click", function (event) {
  event.stopPropagation();
  document.getElementById("recording-section").style.display = "block"; // Mostra la sezione di registrazione
  document.getElementById("record-btn").style.display = "none"; // Nasconde il bottone "Registra"
  createWaveSurfer();
});

const createWaveSurfer = () => {

  // Create a new Wavesurfer instance
  wsurf = WaveSurfer.create({
    container: '#mic',
    waveColor: '#dd5e98',
    progressColor: '#ff4e00',
    plugins: [record]
  })

  record.on('record-start', () => {
    if (wave) {
      wave.destroy()
    }

    const container = document.querySelector('#recordings');
    // Rimuovi il pulsante di play e il link di download dalla sezione precedente
    container.innerHTML = '';
  })  

  // Render recorded audio
  record.on('record-end', (blob) => {
    const container = document.querySelector('#recordings')
    const recordedUrl = URL.createObjectURL(blob)

    // Play button
    const button = container.appendChild(document.createElement('button'))
    button.textContent = 'Play'
    button.onclick = () => wsurf.playPause()
    wsurf.on('pause', () => (button.textContent = 'Play'))
    wsurf.on('play', () => (button.textContent = 'Pause'))

    // Download link
    const link = container.appendChild(document.createElement('a'))
    Object.assign(link, {
      href: recordedUrl,
      download: 'recording.' + blob.type.split(';')[0].split('/')[1] || 'webm',
      textContent: 'Download recording',
    })

    // Aggiungi il file WAV alla lista di selectedFiles in script.js
    const blobFile = new File([blob], 'recorded_audio.webm', { type: 'audio/webm' });

    // Emissione dell'evento personalizzato per passare il file WAV
    const event = new CustomEvent('recording-completed', { detail: { file: blobFile } });
    window.dispatchEvent(event);
  });

  pauseButton.style.display = 'none'
  recButton.textContent = 'Record'

  record.on('record-progress', (time) => {
    updateProgress(time)
  })
}

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
}

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

// Record button
const recButton = document.querySelector('#record')

recButton.onclick = (event) => {
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