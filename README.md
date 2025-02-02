# Or-Beat

### Filippo Paris | Francesco Moretti | Giorgio Mattina | Luca Trapella

Or-Beat is a web-based application that allows users to extract audio samples from an uploaded or real-time recorded file, and use them to create a circular drum machine interface. The user can interactively manage and manipulate the sounds to craft unique rhythms and beats.

## Table of Contents

1. [Description](#description)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Technologies Used](#technologies-used)
6. [Code Structure](#code-structure)
7. [Screenshots](#screenshots)
9. [License](#license)

## Description

Or-Beat is a web-based application that allows users to create custom rhythms by sampling audio files. Upon opening the page, the user can choose to either record a short track (up to 2 minutes), upload a file (up to 2 minutes), or select a preset. The uploaded track is processed through a beat detection algorithm to extract samples, which are then displayed in a waveform with the possibility to manipulate them.

The user can drag and drop these samples into a table connected to a circular drum machine interface. The drum machine plays the user's samples, with adjustable segments for different time signatures, such as quarters, eighths, and more. After refining their rhythm, the user can save their creation.

## Features

1. **File Upload (Drag and Drop)**
   - Users can easily upload their audio files by dragging and dropping them into the modal page. Supported file formats include **.wav**, **.mp3**, and **.aac**, with a maximum duration of 2 minutes. Once uploaded, the file will be processed and ready for sampling.

2. **Recording Function**
   - Or-beat allows users to record their own music track directly within the app. Users can start, stop, and resume recording, and choose their preferred microphone. This feature is powered by the **Wavesurfer.js** library and its recording plugin, ensuring smooth and high-quality audio capture.

3. **Preset Selection**
   - For those who prefer to skip the recording and uploading process, Or-beat offers a collection of pre-made presets. Users can select one of these presets to immediately begin creating their custom rhythms.

4. **Sampler Sensitivity Adjustment**
   - Users have the ability to adjust the sensitivity of the audio onset detection process. The higher the sensitivity, the fewer onset points will be detected in the audio; conversely, lowering the sensitivity increases the number of detected onsets.

5. **Waveform Display & Onset Modification**
   - Or-beat displays the audio waveform, allowing users to visually edit the detected segments. Users can drag, stretch, or shorten the length of each segment to fine-tune their rhythm and achieve precise control over the sound.

6. **Audio Waveform Zoom**
   - Users can zoom in on the waveform for a more detailed view, enabling precise adjustments and edits to each sample segment.

7. **Audio Segment Selection (Double Click)**
   - By double-clicking on any segment of the waveform, users can select it for sampling. The chosen segment will be recorded and saved into one of the six available slots for future use.

8. **Slot Visibility Toggle**
   - Users can toggle the visibility of the saved slots window, keeping the interface clean and customizable based on their workflow needs.

9. **Drum Machine Metronome Adjustment**
   - The metronome for the drum machine can be adjusted, allowing users to change the tempo and rhythm to fit their preferences.

10. **Table Parameter Modifications**
   - Within the drum machine's table, users can modify three important parameters: **steps**, **density**, and **phase**, offering fine control over the rhythm and beat patterns.

11. **Drum Machine Customization**
   - Users can assign different colors to the drum machine's circles, each representing a specific audio segment. By dragging a saved segment from the slots and dropping it into the corresponding table cell, users can visually organize their rhythm patterns with color-coded samples.

12. **Export Your Work**
   - Users can export their created work into an audio file once they're satisfied with their rhythm and samples.

## Installation (da guardare...)

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

## Usage (da guardare...)

To use Or-beat, simply launch the app and follow the on-screen instructions to select your mood.

## Technologies Used

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

## Code Structure

## Onset Detection Algorithm: `detectOnsets`
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
## Screenshots (inserire le immagini)
![WelcomePage](./Screenshots/Screenshot 2025-02-02 172429.png)
![RecordPage](./Screenshots/Screenshot 2025-02-02 172446.png)
![Workstation](./Screenshots/Screenshot 2025-02-02 172457.png)
![Full_workstation](./Screenshots/Screenshot 2025-02-02 172540.png)

## License
OR-BEAT © 2025 All Rights Reserved