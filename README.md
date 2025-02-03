# Or-Beat

### Filippo Paris · Francesco Moretti · Giorgio Mattina · Luca Trapella

>" Your music, your vision, your rhythm. "

[TRY IT OUT HERE](https://gio-lly.github.io/ACTAM-Final-Project/)

Or-Beat is a web-based application that allows users to extract audio samples from an uploaded or real-time recorded file, and use them to create a circular drum machine interface. Users are afforded the ability to interactively manipulate and refine the sounds, facilitating the creation of distinctive and intricate rhythms and beats.

## Table of Contents

1. [Overview](#overview)  
2. [Key Features](#key-features)  
3. [How to Install](#how-to-install)  
4. [Getting Started](#getting-started)  
5. [Technologies Behind Or-Beat](#technologies-behind-or-beat)  
6. [Code Architecture](#code-architecture)  
7. [Visual Preview](#visual-preview)  
8. [License & Usage Terms](#license--usage-terms)

## Overview

Or-Beat is a web-based application that allows users to create custom rhythms by sampling audio files. Upon opening the page, the user can choose to either record a short track (*up to 2 minutes*), upload a file (*up to 2 minutes*), or select a preset. The uploaded track is processed through a beat detection algorithm to extract samples, which are then displayed in a waveform with the possibility to manipulate them.

The user can drag and drop these samples into a table connected to a circular drum machine interface. The drum machine plays the user's samples, with adjustable segments for different time signatures, such as quarters, eighths, and more. After refining their rhythm, the user can save their creation.

## Key Features

01. **File Upload (Drag and Drop)**
   - Users can easily upload their audio files by dragging and dropping them into the modal page. Supported file formats include **.wav**, **.mp3**, and **.aac**, *with a maximum duration of 2 minutes*. Once uploaded, the file will be processed and ready for sampling.

02. **Recording Function**
   - Or-beat allows users to record their own music track directly within the app. Users can start, stop, and resume recording, and choose their preferred microphone. This feature is powered by the **Wavesurfer.js** library and its recording plugin, ensuring smooth and high-quality audio capture.

03. **Preset Selection**
   - For those who prefer to skip the recording and uploading process, Or-beat offers a collection of pre-made presets. Users can select one of these presets to immediately begin creating their custom rhythms.

04. **Sampler Sensitivity Adjustment**
   - Users have the ability to adjust the sensitivity of the audio onset detection process. The higher the sensitivity, the more onset points will be detected in the audio; conversely, lowering the sensitivity reduces the number of detected onsets.

05. **Waveform Display & Onset Modification**
   - Or-beat displays the audio waveform, allowing users to visually edit the detected segments. Users can **drag**, **stretch**, or **shorten the length** of each segment to fine-tune their rhythm and achieve precise control over the sound.

06. **Audio Waveform Zoom**
   - Users can **zoom** in on the waveform for a more detailed view, enabling precise adjustments and edits to each sample segment.

07. **Audio Segment Selection (Double Click)**
   - By *double-clicking* on any segment of the waveform, users can select it for sampling. The chosen segment will be recorded and saved into one of the six available slots for future use.

08. **Slot Visibility Toggle**
   - Users can **toggle the visibility** of the saved slots window, keeping the interface clean and customizable based on their workflow needs.

09. **Drum Machine Metronome Adjustment**
   - The metronome for the drum machine can be adjusted, allowing users to change the tempo and rhythm to fit their preferences.

10. **Table Parameter Modifications**
   - Within the drum machine's table, users can modify three important parameters: **steps**, **density**, and **phase**, offering fine control over the rhythm and beat patterns.

11. **Drum Machine Customization**
   - Users can assign different colors to the drum machine's circles, each representing a specific audio segment. By **dragging** a saved segment from the slots and **dropping** it into the corresponding table cell, users can visually organize their rhythm patterns with color-coded samples.

12. **Export Your Work**
   - Users can export their created work into an audio file once they're satisfied with their rhythm and samples.

## How to Install

### 1. Clone the repository

   -  **Notes**: if you don't have *git* or *npm* installed, you'll need to install them first. Additionally, if you encounter any issues with dependencies, try running *npm* install again or check the error messages for specific instructions.

   1. Clone this repository:
      ```bash
      git clone https://github.com/your-username/or-beat.git
      ```

   2. Install dependencies:
      ```bash
      cd or-beat
      npm install
      ```

   3. Run the app:
      ```bash
      npm start
      ```
### 2. Download the Repository as ZIP

If you don't want to use *Git*, you can download the source code as a **ZIP** file from the GitHub repository:

1. Go to the Or-Beat repository page on GitHub.
2. Click the green **Code** button and select **Download ZIP**.
3. Extract the ZIP file to a local folder.
4. Open a terminal window in the extracted folder.
5. Run the following commands to install dependencies and start the app:

```bash
npm install
npm start
 ```
## Getting Started

### 1. Select an Audio File
To begin, choose an audio file by one of the following methods:
- Dragging and dropping the file into the designated area (black box).
- Clicking the black box to upload a file directly from your computer.
- Selecting one of the pre-existing presets available within the application.
- Recording audio by utilizing the **Record** button.

### 2. Adjust Onset Density
Specify the number of samples to be extracted from the chosen audio file by adjusting the onset density. This will determine how finely the audio is segmented.

### 3. Proceed to the Drum Machine
Once you've set the onset density, click **Continue** to advance to the drum machine interface, where you can begin creating rhythmic patterns.

### 4. Explore the Drum Machine
- **Preview Samples**: Click on any waveform to listen to the corresponding audio sample.
- **Add Samples to Slots**: Double-click on a sample to add it to the first available slot beneath the waveform.
- **Manage Slots**: Click on any slot to:
  - Listen to the sample.
  - Discard the sample using the **Discard** button.
  - Drag and drop the sample into the matrix.
- **Modify the Matrix**: Add additional rows to the matrix by clicking the **+** button, or remove rows by clicking the red **trash bin** icon.
- **Adjust Parameters**: Fine-tune matrix parameters and/or click on individual drum machine steps to create unique rhythmic patterns, including complex polyrhythms and polymeters.
- **Randomize Parameters**: For creative inspiration, click the **Dice** button to randomize the matrix parameters.

### 5. Playback and Refinement
- **Play Your Creation**: Press the **Play** button to listen to your composition, and adjust the **BPM** (beats per minute) as needed.
- **Pause or Stop**: Use the **Pause** button to temporarily halt playback, or the **Stop** button to reset it completely.

### 6. Record Your Beat
Once satisfied with your creation, click **Start Recording** to save your masterpiece and preserve your work.

## Technologies Behind Or-Beat

Or-Beat is built using a range of powerful web technologies and libraries to ensure a smooth and dynamic user experience. Here's a breakdown of the main technologies:

- **HTML**: Used for structuring the skeleton of the web page, providing the basic layout and elements of the interface.
- **CSS**: Responsible for the visual styling of the application, ensuring a clean, modern, and user-friendly interface.
- **JavaScript**: The core programming language used for implementing the app's functionality and logic, creating an interactive experience for users.

### Architectural Model
- **MVC (Model-View-Controller)**: The application follows the MVC design pattern, which separates the app's logic into three interconnected components: the **Model** (data and logic), the **View** (user interface), and the **Controller** (user input handling and communication between the Model and View). This structure helps maintain clean, manageable code.

### Key Libraries and Tools:
- **Tone.js**: A powerful library used for audio synthesis and manipulation. It enables the creation of complex, responsive audio sounds and patterns in the app.
- **Wavesurfer.js** with **Record Plugin**: Used for visualizing and interacting with the audio waveform. The Record plugin allows users to record their own audio directly within the app.
- **Regions.js**: Allows users to divide the waveform into distinct regions, enabling better organization and manipulation of the audio segments.
- **Timeline.js**: Helps visualize and interact with the audio timeline, giving users control over the progression of their recordings.
- **Zoom.js**: Provides the ability to zoom in and out of the waveform, offering precise control over the sample segments for fine-tuning.
- **Meyda**: A powerful audio analysis library used for onset detection, helping identify the start of significant audio events within the track.
- **P5.js**: A creative coding library used to design and implement the circular drum machine interface, giving the app a unique, artistic style while ensuring responsiveness.
- **GSAP (GreenSock Animation Platform)**: Utilized for smooth, high-performance animations within the app, adding fluidity and interactivity to the user interface.

These technologies work together to create an interactive, intuitive, and feature-rich music creation experience for users. Each tool was carefully chosen to enhance the functionality of Or-beat and ensure a seamless integration of sound, design, and user interaction.

## Code Architecture

### Onset Detection Algorithm: `detectOnsets` 

The **onset detection** algorithm is crucial for identifying the beginning of significant audio events, such as beats or transient sounds. This function analyzes the spectral flux of the audio signal to detect moments where the sound intensity changes dramatically. The detected onsets are essential for segmenting the audio, which can then be sampled and manipulated in Or-beat’s drum machine interface.

Here is the implementation of the onset detection function:

```javascript
function detectOnsets(channelData, sampleRate, frameSize, hopSize, sensitivity) {
    const onsetTimestamps = [];
    let previousSpectrum = null;

    for (let i = 0; i < channelData.length - frameSize; i += hopSize) {
        const frame = channelData.slice(i, i + frameSize);

        // Calculate spectrum using Meyda.js
        const currentSpectrum = Meyda.extract("amplitudeSpectrum", frame);

        if (previousSpectrum) {
            // Calculate spectral flux
            let flux = 0;
            for (let j = 0; j < currentSpectrum.length; j++) {
                const diff = currentSpectrum[j] - (previousSpectrum[j] || 0);
                flux += Math.max(0, diff); // Only consider increases
            }
            if (flux > sensitivity) {
                const time = i / sampleRate;
                onsetTimestamps.push(time);
            }
        }
        previousSpectrum = currentSpectrum;
    }
    return onsetTimestamps;
}
```
### Audio Segment Extraction and Slot Management Algorithm: `handleSegmentExtraction`

This function is responsible for extracting an audio segment from a larger audio buffer, inserting it into one of the available slots in the user interface, and enabling playback when the user clicks on the slot.

```javascript
let slotStatus = new Array(6).fill(false);
function handleSegmentExtraction(audioBuffer, startTime, nextStartTime, container) {

    const startSample = Math.floor(startTime * audioBuffer.sampleRate);
    const endSample = Math.floor(nextStartTime * audioBuffer.sampleRate);
    let segmentBuffer = null;

    const leftChannel = audioBuffer.getChannelData(0).slice(startSample, endSample); // sx
    if (audioBuffer.numberOfChannels > 1) {
        const rightChannel = audioBuffer.getChannelData(1).slice(startSample, endSample); // dx
        segmentBuffer = audioContext.createBuffer(2, leftChannel.length, audioBuffer.sampleRate);
        segmentBuffer.getChannelData(0).set(leftChannel);
        segmentBuffer.getChannelData(1).set(rightChannel);
    } else { // MONO
        segmentBuffer = audioContext.createBuffer(1, leftChannel.length, audioBuffer.sampleRate);
        segmentBuffer.getChannelData(0).set(leftChannel);
    }

    let freeSlotIndex = slotStatus.indexOf(false);
    if (freeSlotIndex === -1) {
        alert("All slots are full. Please try again.");
        return;
    } else {
        slotStatus[freeSlotIndex] = true;
    }

    const slots = container.querySelectorAll('.slot');

    slots[freeSlotIndex].textContent = `${startTime.toFixed(2)} - ${nextStartTime.toFixed(2)}`; 
    slots[freeSlotIndex].setAttribute('draggable', 'true');

    const player = new Tone.Player(segmentBuffer).toDestination();
    console.log(recorder);
    player.autostart = false;  
    player.fadeIn = 0.005; // FADE IN
    player.fadeOut = 0.02; // FADE OUT
    players[freeSlotIndex] = player;

    slots[freeSlotIndex].addEventListener('click', () => {
        playSlot(freeSlotIndex);
    });
}
```
The handleSegmentExtraction function extracts a specific audio segment from an audioBuffer, either stereo or mono, based on the given start and end times. It then finds an available slot to store the segment and marks it as occupied. The slot is updated with the segment's time range and made draggable. A Tone.Player is created to handle the playback of the segment, with fade-in and fade-out effects. Finally, an event listener is added to the slot, allowing users to play the segment by clicking on it.

## Visual Preview

### Welcome Page
![Welcome Page](https://github.com/Gio-lly/ACTAM-Final-Project/blob/main/src/Screenshots/welcomePage.png)

### Record Page
![Record Page](https://github.com/Gio-lly/ACTAM-Final-Project/blob/main/src/Screenshots/recordPage.png)

### Workstation
![Workstation](https://github.com/Gio-lly/ACTAM-Final-Project/blob/main/src/Screenshots/def_workstation.png)

## License & Usage Terms
OR-BEAT © 2025 All Rights Reserved. 

No part of this project may be reproduced or used without permission.
