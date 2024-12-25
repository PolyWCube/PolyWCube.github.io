let speech = new SpeechSynthesisUtterance();

speech.rate = 1.0;
speech.pitch = 1.0;
speech.volume = 1.0;
speech.lang = "en-US";

let voices = [];

let autorestart = document.getElementById("auto-restart");
let language = document.getElementById("language");

let speak = false;

export function speakMessage() {
	if (speak) {
		document.getElementById("speak-button").textContent = "Speak";
		
		speechSynthesis.cancel();
	}
	else {
		const message = document.getElementById("response").value;
		speech.text = message;
		speech.voice = voices.find(voice => voice.name === document.getElementById("voice-select").value);
		speechSynthesis.speak(speech);
		
		document.getElementById("speak-button").textContent = "Stop";
	}
	speak = !speak;
}

import { listenMessage, clearMessage } from "./speech-recognition.js";

speech.addEventListener("end", () => {
	if (autorestart.checked) {
		clearMessage();
		listenMessage();
	}
	speak = false;
});

speechSynthesis.onvoiceschanged = function() {
	voices = speechSynthesis.getVoices();
	var voiceSelect = document.getElementById("voice-select");

	voiceSelect.options.length = 0;

	voices.forEach(voice => {
		var option = document.createElement("option");
		option.textContent = voice.name;
		option.value = voice.name;
		voiceSelect.appendChild(option);
	});
};

document.getElementById("volume-slider").addEventListener("change", function() {
	speech.volume = this.value;
});

document.getElementById("speed-slider").addEventListener("change", function() {
	speech.rate = this.value;
});

document.getElementById("speak-button").addEventListener("click", speakMessage);