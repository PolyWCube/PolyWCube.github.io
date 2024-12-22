const recognition = new webkitSpeechRecognition();
let record = false;
recognition.continuous = true;
recognition.lang = "en-US";

let input = null;

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");

let autoresponse = document.getElementById("auto-response");

export function listenMessage() {
	if (record) {
		recognition.stop();
		document.getElementById("toggle-button").textContent = "Start Recording";
		if (autoresponse.checked) {
			sendMessage();
		}
	}
	else {
		recognition.start();
		document.getElementById("toggle-button").textContent = "Stop Recording";
	}
	record = !record;
}

export function clearMessage() { transcription.value = ""; }

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	
	transcription.value += transcript;
};

import { sendMessage } from "./intergrative-ai.js";

document.getElementById("clear-button").addEventListener("click", clearMessage);

document.getElementById("toggle-button").addEventListener("click", listenMessage);