let speech = new SpeechSynthesisUtterance();
speech.rate = 1.0;
speech.pitch = 1.0;
speech.volume = 1.0;
speech.lang = "en-US";
let voices = [];

let autorestart = document.getElementById("auto-restart");
let languageselect = document.getElementById("language-select");
const voiceselect = document.getElementById("voice-select");
const localvoice = document.getElementById("local-voice");

let speak = false;

const MAX_CHUNK_LENGTH = 150;

export function speakMessage(message) {
	if (speak) {
		document.getElementById("speak-button").textContent = "Speak";
		speechSynthesis.cancel();
		speak = false;
		return;
	}

	speechSynthesis.cancel();
	if (!message || message.trim() === "") return;

	const speakChunk = (text) => {
		speech.text = text;
		speechSynthesis.speak(speech);
		return new Promise(resolve => {
			speech.onend = resolve;
			speech.onerror = (event) => {
				console.error("Speech synthesis error:", event.error);
				resolve();
			};
		});
	};

	const chunkSentences = (text) => {
		const sentences = text.split(/(?<=[.?!])\s+/);
		const chunks = [];
		let currentChunk = "";

		for (const sentence of sentences) {
			if (currentChunk.length + sentence.length + 1 <= MAX_CHUNK_LENGTH) {
				currentChunk += (currentChunk ? " " : "") + sentence;
			} else {
				chunks.push(currentChunk);
				currentChunk = sentence;
			}
		}
		chunks.push(currentChunk);
		return chunks;
	};

	(async () => {
		speak = true;
		document.getElementById("speak-button").textContent = "Stop";

		const chunks = chunkSentences(message);
		for (const chunk of chunks) {
			await speakChunk(chunk);
		}

		if (autorestart.checked) {
			clearMessage();
			listenMessage();
		}

		speak = false;
		document.getElementById("speak-button").textContent = "Speak";
	})();
}

import { listenMessage, clearMessage } from "./speech-recognition.js";

speech.addEventListener("end", () => {
	if (autorestart.checked) {
		clearMessage();
		listenMessage();
	}
	speak = false;
	document.getElementById("speak-button").textContent = "Speak";
});

function populateVoiceSelect() {
	voices = speechSynthesis.getVoices();
	const localVoices = voices.filter(voice => voice.localService);
	voiceselect.options.length = 0;
	if (localVoices.length > 0 && localvoice.checked) {
		localVoices.forEach(voice => {
			var option = document.createElement("option");
			option.textContent = voice.name;
			option.value = voice.name;
			voiceselect.appendChild(option);
		});
	} else {
		voices.forEach(voice => {
			var option = document.createElement("option");
			option.textContent = voice.name;
			option.value = voice.name;
			voiceselect.appendChild(option);
		});
	}
}

speechSynthesis.onvoiceschanged = populateVoiceSelect;

populateVoiceSelect();

document.getElementById("volume-slider").addEventListener("change", function() {
	speech.volume = this.value;
});

document.getElementById("speed-slider").addEventListener("change", function() {
	speech.rate = this.value;
});

localvoice.addEventListener("change", function() {
	populateVoiceSelect();
})

document.getElementById("speak-button").addEventListener("click", speakMessage);

voiceselect.addEventListener("change", () => {
	const selectedVoiceName = voiceselect.value;
	speech.voice = voices.find(voice => voice.name === selectedVoiceName);
});

languageselect.onchange = () => {
	speech.lang = this.value;
};