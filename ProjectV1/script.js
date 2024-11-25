let audioFile = null;
let wavesurfer = null;
let audioBuffer = null;
let onsets = [];

document.getElementById('audioInput').addEventListener('change', handleFileSelect);
document.getElementById('playButton').addEventListener('click', playAudio);
document.getElementById('stopButton').addEventListener('click', stopAudio);

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            audioFile = e.target.result;
            setupAudio();
        };
        reader.readAsArrayBuffer(file);
    }
}

// Initialize the audio using Tone.js and WaveSurfer.js
function setupAudio() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Decode the audio file and initialize the waveform display
    audioContext.decodeAudioData(audioFile, function(buffer) {
        audioBuffer = buffer;
        initializeWaveform(buffer);  // Initialize waveform once audio is loaded
        detectOnsets(buffer);        // Detect onsets after the audio is loaded
    });
}

// Setup the waveform with WaveSurfer.js
function initializeWaveform(buffer) {
    // Initialize WaveSurfer if it's not already initialized
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'violet',
        progressColor: 'purple',
        height: 200,
        responsive: true
    });

    // Load the decoded audio buffer into wavesurfer
    wavesurfer.loadBuffer(buffer);
}


// Function to play audio using Tone.js
function playAudio() {
    Tone.start();  // Ensure the AudioContext starts after a user gesture

    if (audioBuffer) {
        const player = new Tone.Player(audioBuffer).toDestination();
        player.start();
    }
}

// Function to stop audio
function stopAudio() {
    Tone.Transport.cancel();
}

// Detect onsets (simplified version for this example)
function detectOnsets(buffer) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    source.start(0);

    // Create a basic onset detection using spectral data (simplified version)
    let lastMax = 0;
    let onsetThreshold = 0.5;

    analyser.fftSize = 2048;
    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    function detect() {
        analyser.getByteFrequencyData(dataArray);

        // Simple peak detection for onsets
        let max = Math.max(...dataArray);
        if (max > lastMax && max > onsetThreshold) {
            const currentTime = audioContext.currentTime;
            console.log('Onset detected at time: ', currentTime);
            onsets.push(currentTime); // Store the onset times
        }
        lastMax = max;

        requestAnimationFrame(detect);
    }

    detect();
}

// After onsets are detected, display them on the waveform
function displayOnsets() {
    if (wavesurfer && onsets.length > 0) {
        onsets.forEach(onsetTime => {
            wavesurfer.addRegion({
                start: onsetTime,
                end: onsetTime + 0.1, // Mark a small region around the onset time
                color: 'rgba(255, 0, 0, 0.5)',
                drag: false,
                resize: false
            });
        });
    }
}

// After onsets are detected, update the waveform display
function updateWaveform() {
    if (wavesurfer && onsets.length > 0) {
        displayOnsets(); // Mark the onsets on the waveform
    }
}
