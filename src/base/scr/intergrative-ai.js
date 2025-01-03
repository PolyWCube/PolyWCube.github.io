import { GoogleGenerativeAI } from "@google/generative-ai";
import { speakMessage } from "./speech-synthesis.js";

const API_KEY = window.GEMINI_API_KEY_1;
const MAX_TOKEN = 20000;

const generator = new GoogleGenerativeAI(API_KEY);
let modelconfig = (
	model : "gemini-1.5-flash",
	temperature: 1
}

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");
let conversationhistory = document.getElementById("converstation-history");
let autospeak = document.getElementById("auto-speak");
let temperatureslider = document.getElementById("temperature-slider");
let modelselect = document.getElementById("model-select");

let configurationbutton = document.getElementById("configuration-button");
let configuration = document.getElementById("configuration");

let chathistory = [];
let temperature
async function generateResponse() {
	let input = transcription.value.trim();
	try {
		const response = await fetch("/.netlify/functions/gemini-api", {
		method: "POST", headers: { "Content-Type": "application/json", },
			body: JSON.stringify({ prompt: input, history: chathistory, modelconfig: modelconfig }),
			});

		if (!response.ok) {
			return response.text().then(text => {throw new Error(`${response.status} ${response.statusText} - ${text}`)})
		}

		const data = await response.json();
		response.value = data.response;
		chathistory = data.history;
		generateHistory();
	} catch (error) {
		console.error("Error generating response:", error);
		response.value = "An error occurred.";
	}
	if (autospeak.checked) {
		speakMessage();
	}
}

async function generateHistory() {
	try {
		conversationhistory.value = "";
		for (let index = 0; index < chathistory.length; ++index) {
			conversationhistory.value += chathistory[index].role + ": " + chathistory[index].parts[0].text.replace(botinstruction, "") + '\n';
		}
		conversationhistory.scrollTop = conversationhistory.scrollHeight;
	} catch (error) {
		console.error("Error generating history:", error);
		conversationhistory.value = "Internal error";
	}
}

export function sendMessage() {
	response.value = "Generating response...";
	generateResponse();
}

async function updateModelConfig() {
	modelconfig.temperature = parseFloat(temperatureslider.value);
	modelconfig.modelname = modelselect.value;
}

async function createModel(modelName, generationConfig) {
	modelconfig = generator.getGenerativeModel({ model: modelName, generationConfig: generationConfig });
}

temperatureslider.addEventListener("change", updateModelConfig);
modelselect.addEventListener("change", updateModelConfig);
document.getElementById("generate-button").addEventListener("click", sendMessage);

configurationbutton.addEventListener("click", () => {
	if (configuration.style.display === "none") configuration.style.display = "block";
	else configuration.style.display = "none";
});