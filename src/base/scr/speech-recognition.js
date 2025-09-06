import { sendMessage } from "./intergrative-ai.js";
import { speakMessage } from "./speech-synthesis.js";
let soundrecognition = true;

function getOS() {
	const userAgent = navigator.userAgent;
	const platform = navigator.platform;
	const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
	const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
	const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
	let os = null;

	if (macosPlatforms.indexOf(platform) !== -1) {
		os = 'MacOS';
	} else if (iosPlatforms.indexOf(platform) !== -1) {
		os = 'iOS';
	} else if (windowsPlatforms.indexOf(platform) !== -1) {
		os = 'Windows';
	} else if (/Android/.test(userAgent)) {
		os = 'Android';
	} else if (!os && /Linux/.test(platform)) {
		os = 'Linux';
	}

	if (os === 'MacOS' && /iPad/.test(userAgent)) {
		os = 'iPadOS';
	}
	if (os === 'Windows') {
		if (/Windows Phone/.test(userAgent)) {
			os = 'Windows Phone';
		} else if (/Windows NT 10.0/.test(userAgent)) {
			os = 'Windows 10/11';
		} else if (/Windows NT 6.3/.test(userAgent)) {
			os = 'Windows 8.1';
		} else if (/Windows NT 6.2/.test(userAgent)) {
			os = 'Windows 8';
		} else if (/Windows NT 6.1/.test(userAgent)) {
			os = 'Windows 7';
		}
	}
	if (os === 'iOS') {
		const version = userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
		if (version) {
			os += ' ' + version[1];
		}
	}
	if(os === "Android"){
		const version = userAgent.match(/Android (\d+(\.\d+)+)/);
		if(version){
			os += ' ' + version[1]
		}
	}
	return os;
}

const currentOS = getOS();
console.log("Detected OS:", currentOS);

if (currentOS === 'iOS') {
	soundrecognition = false;
} else if (currentOS === 'Android') {
	soundrecognition = false;
}

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
	if (soundrecognition) {
		if (record) {
			recordbutton.textContent = "Start";
			recognition.stop();
			awakerecognition.start();
			if (autoresponse.checked) {
				sendMessage();
			}
		} else {
			recognition.lang = srlanguage.value;
			recordbutton.textContent = "Stop";
			recognition.start();
			awakerecognition.stop();
		}
		record = !record;
	}
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

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => { if (soundrecognition) awakerecognition.start(); }).catch(err => console.error("Error with microphone", err));

awakerecognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	console.log(transcript);
	if (transcript == "Helen" || transcript == "Hey Helen" || transcript == "hey Helen" || transcript == "hey helen" || transcript == "helen") {
		listenMessage();
		speakMessage("I'm listenning");
	}
};

awakerecognition.onend = () => {
	if (!record && soundrecognition) awakerecognition.start();
};