import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyAL-WQeEaA5YlsofYMx57ysSJYfgFSlTJQ";

const generator = new GoogleGenerativeAI(API_KEY);
const model = generator.getGenerativeModel({
	model : "gemini-1.5-flash"
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const recognition = new webkitSpeechRecognition();
let record = false;
recognition.continuous = true;
recognition.lang = "en-US";

let userInput = null;

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	
	transcription.value += transcript;
};

document.getElementById("toggle-button").addEventListener("click", function() {
	if (record) {
		recognition.stop();
		document.getElementById("toggle-button").textContent = "Start Recording";
	}
	else {
		recognition.start();
		recognition.lang = document.getElementById("language-select").value;
		document.getElementById("toggle-button").textContent = "Stop Recording";
	}
	record = !record;
});

window.addEventListener("unload", function() {
	recognition.stop();
});

async function generateResponse() {
	input = transcription.value.trim();
	if(!input) return;
	
	const output = await model.generateContent(input);
	response.value = output.response.text();
}

function sendMessage() {
	setTimeout(() => {
		response.value = "Generating Response";
		generateResponse();
    }, 600);
}

document.getElementById("generate-button").addEventListener("click", sendMessage);