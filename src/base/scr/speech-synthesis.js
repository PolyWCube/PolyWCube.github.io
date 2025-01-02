// Speech synthesis related variables and setup
let speech = new SpeechSynthesisUtterance();
speech.rate = 1.0;
speech.pitch = 1.0;
speech.volume = 1.0;
speech.lang = "en-US";
let voices = [];

// DOM element references
let autorestart = document.getElementById("auto-restart");
let language = document.getElementById("language");
const voiceselect = document.getElementById("voice-select");

let speak = false;

// Exported function for speech synthesis
export function speakMessage() {
    if (speak) {
        document.getElementById("speak-button").textContent = "Speak";
        speechSynthesis.cancel();
    } else {
        speechSynthesis.cancel();
        const message = document.getElementById("response").value;
        speech.text = message;
        speech.voice = voices.find(voice => voice.name === voiceselect.value);
        speechSynthesis.speak(speech);
        document.getElementById("speak-button").textContent = "Stop";
    }
    speak = !speak;
}

// Import necessary functions from other modules
import { listenMessage, clearMessage } from "./speech-recognition.js";

// Event handling for speech synthesis
speech.addEventListener("end", () => {
    if (autorestart.checked) {
        clearMessage();
        listenMessage();
    }
    speak = false;
    document.getElementById("speak-button").textContent = "Speak";
});

// Function to populate voice select options
function populateVoiceSelect() {
    voices = speechSynthesis.getVoices();
    voiceselect.options.length = 0;
    voices.forEach(voice => {
        var option = document.createElement("option");
        option.textContent = voice.name;
        option.value = voice.name;
        voiceselect.appendChild(option);
    });
}

// Event listener for voice change
speechSynthesis.onvoiceschanged = populateVoiceSelect;

populateVoiceSelect();

// Event listeners for volume and speed sliders
document.getElementById("volume-slider").addEventListener("change", function() {
    speech.volume = this.value;
});

document.getElementById("speed-slider").addEventListener("change", function() {
    speech.rate = this.value;
});

// Event listener for speak button
document.getElementById("speak-button").addEventListener("click", speakMessage);