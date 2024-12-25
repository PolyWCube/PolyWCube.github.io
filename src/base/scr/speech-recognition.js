import { sendMessage } from "./intergrative-ai.js";

const recognition = new webkitSpeechRecognition();
let record = false;
recognition.continuous = true;

let webapi = document.getElementById("sr-api");
let srlanguage = document.getElementById("sr-language-select");
let transcription = document.getElementById("transcription");
let response = document.getElementById("response");
let autoresponse = document.getElementById("auto-response");
let recordbutton = document.getElementById("record-button");

export function listenMessage() {
	if (record) {
		recordbutton.textContent = "Start Recording";
		if (webapi.checked) {
			recognition.stop();
		}
		else {
			// impletment here
		}
		if (autoresponse.checked) {
			sendMessage();
		}
	}
	else {
		recognition.lang = srlanguage.value;
		recordbutton.textContent = "Stop Recording";
		if (webapi.checked) {
			recognition.start();
		}
		else {
			// impletment here
		}
	}
	record = !record;
}

export function clearMessage() { transcription.value = ""; }

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	
	transcription.value += transcript;
};

document.getElementById("clear-button").addEventListener("click", clearMessage);
recordbutton.addEventListener("click", listenMessage);