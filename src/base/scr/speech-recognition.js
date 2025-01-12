import { sendMessage } from "./intergrative-ai.js";
import { startVolumeCapture, stopVolumeCapture } from "./background/node-disolve.js";
import { speakMessage } from "./speech-synthesis.js";

const SpeechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
const awakerecognition = new SpeechRecognition();
let record = false;

recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

awakerecognition.continuous = false;
awakerecognition.interimResults = false;
awakerecognition.maxAlternatives = 1;

let srlanguage = document.getElementById("language-select");
let transcription = document.getElementById("transcription");
let recordbutton = document.getElementById("record-button");
let autoresponse = document.getElementById("auto-response");

export function listenMessage() {
	if (record) {
		recordbutton.textContent = "Start";
		stopVolumeCapture();
		recognition.stop();
		awakerecognition.start();
		if (autoresponse.checked) {
			sendMessage();
		}
	} else {
		recognition.lang = srlanguage.value;
		recordbutton.textContent = "Stop";
		startVolumeCapture();
		recognition.start();
		awakerecognition.stop();
	}
	record = !record;
}

export function clearMessage() {
	transcription.value = "";
}

document.getElementById("clear-button").addEventListener("click", clearMessage);
recordbutton.addEventListener("click", listenMessage);
const recordButton = document.getElementById("record-button");

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	transcription.value += transcript;
};

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => { awakerecognition.start(); }).catch(err => console.error("Error with microphone", err));

awakerecognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	console.log(transcript);
	if (transcript == "Helen" || transcript == "Hey Helen" || transcript == "hey Helen" || transcript == "hey helen" || transcript == "helen") {
		listenMessage();
		speakMessage("I'm listenning");
	}
};

awakerecognition.onend = () => {
	if (!record) awakerecognition.start();
};