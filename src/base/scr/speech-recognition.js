import { sendMessage } from "./intergrative-ai.js";
import { startVolumeCapture, stopVolumeCapture } from "./background/node-disolve.js";

const recognition = new webkitSpeechRecognition();
let record = false;

recognition.continuous = true;
recognition.interimResults = false;
recognition.maxAlternatives = 1;

let srlanguage = document.getElementById("sr-language-select");
let transcription = document.getElementById("transcription");
let recordbutton = document.getElementById("record-button");
let autoresponse = document.getElementById("auto-response");

export function listenMessage() {
	if (record) {
		recordbutton.textContent = "Start";
		stopVolumeCapture();
		recognition.stop();
		if (autoresponse.checked) {
			sendMessage();
		}
	} else {
		recognition.lang = srlanguage.value;
		recordbutton.textContent = "Stop";
		startVolumeCapture();
		recognition.start();
	}
	record = !record;
}

export function clearMessage() {
	transcription.value = "";
}

document.getElementById("clear-button").addEventListener("click", clearMessage);
recordbutton.addEventListener("click", listenMessage);

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	transcription.value += transcript;
};