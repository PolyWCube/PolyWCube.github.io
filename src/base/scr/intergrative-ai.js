import { GoogleGenerativeAI } from "@google/generative-ai";
import { speakMessage } from "./speech-synthesis.js";

const API_KEY = ${{ secrets.GEMINI_API_KEY }};
const MAX_TOKEN = 20000;

const generator = new GoogleGenerativeAI(API_KEY);
let model = generator.getGenerativeModel({ 
	model : "gemini-1.5-flash",
	generationConfig: {
		temperature: 1,
		maxOutputTokens: MAX_TOKEN,
		responseMimeType: "text/plain"
	}
});

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");
let conversationhistory = document.getElementById("converstation-history");
let autospeak = document.getElementById("auto-speak");
let temperatureslider = document.getElementById("temperature-slider");
let modelselect = document.getElementById("model-select");

let configurationbutton = document.getElementById("configuration-button");
let configuration = document.getElementById("configuration");

let chathistory = [];

const botinstruction = "[Bot instruction: generate response short, natural, human-like] ";

async function generateResponse() {
	let input = transcription.value.trim();
	try {
		const chat = model.startChat({ history: chathistory });
		const genratedContent = await chat.sendMessage(botinstruction + input);
		const output = genratedContent.response.text();
		response.value = output;
		generateHistory();
	} catch (error) {
		console.error("Error generating response:", error);
		response.value = "Internal error";
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
	const bottemperature = parseFloat(temperatureslider.value);

	const generationConfig = {
		temperature: bottemperature,
		maxOutputTokens: MAX_TOKEN,
		responseMimeType: "text/plain"
	};

	await createModel(modelselect.value, generationConfig);
}

async function createModel(modelName, generationConfig) {
	model = generator.getGenerativeModel({ model: modelName, generationConfig: generationConfig });
}

temperatureslider.addEventListener("change", updateModelConfig);
modelselect.addEventListener("change", updateModelConfig);
document.getElementById("generate-button").addEventListener("click", sendMessage);

configurationbutton.addEventListener("click", () => {
	if (configuration.style.display === "none") configuration.style.display = "block";
	else configuration.style.display = "none";
});