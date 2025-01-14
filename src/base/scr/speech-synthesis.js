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
const responsetext = document.getElementById("response");
const speakbutton = document.getElementById("speak-button");

let speak = false;

const MAX_CHUNK_LENGTH = 150;

export function speakMessage(message) {
	if (message.trim() === "" || !message) { speakbutton.textContent = "Speak"; return; }
	if (speak) {
		speechSynthesis.cancel();
		speak = false;
		return;
	}

	speechSynthesis.cancel();

	const speakChunk = (message) => {
		speech.text = message;
		speechSynthesis.speak(speech);
		return new Promise(resolve => {
			speech.onend = resolve;
			speech.onerror = (event) => {
				console.error("Speech synthesis error:", event.error);
				resolve();
			};
		});
	};

	const chunkSentences = (message) => {
		const sentences = message.split(/(?<=[.?!])\s+/);
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

		const chunks = chunkSentences(message);
		for (const chunk of chunks) {
			await speakChunk(chunk);
		}

		if (autorestart.checked) {
			clearMessage();
			listenMessage();
		}
		speak = false;
		
		speakbutton.textContent = "Speak";
	})();
}

import { listenMessage, clearMessage } from "./speech-recognition.js";

speech.addEventListener("end", () => {
	if (autorestart.checked) {
		clearMessage();
		listenMessage();
	}
	speak = false;
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

document.getElementById("volume-slider").onchange = () => { speech.volume = this.value; };

document.getElementById("speed-slider").onchange = () => { speech.rate = this.value; };

localvoice.onchange = () => { populateVoiceSelect(); };

voiceselect.onchange = () => {
	const selectedVoiceName = voiceselect.value;
	speech.voice = voices.find(voice => voice.name === selectedVoiceName);
};

languageselect.onchange = () => {
	speech.lang = this.value;
};

speakbutton.onclick = () => {
	if (speechSynthesis.speaking) {
		speakbutton.textContent = "Speak";
		speechSynthesis.cancel();
		return;
	}
	speakbutton.textContent = "Stop";
	speakMessage(responsetext.value);
};