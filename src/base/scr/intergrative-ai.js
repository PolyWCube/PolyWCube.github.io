import { speakMessage } from "./speech-synthesis.js";
const backendurl = "https://pwc-gemini-api.netlify.app/.netlify/functions/api-function";

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");
let conversationhistory = document.getElementById("converstation-history");
let autospeak = document.getElementById("auto-speak");
let temperatureslider = document.getElementById("temperature-slider");
let modelselect = document.getElementById("model-select");

let configurationbutton = document.getElementById("configuration-button");
let configuration = document.getElementById("configuration");

let chathistory = [];
let modelconfig = {
	temperature: 1,
	modelname: "gemini-1.5-flash"
};
async function generateResponse() {
	let input = transcription.value.trim();
	try {
		const requestbody = { prompt: input, history: chathistory, modelconfig: modelconfig };
		const jsbody = JSON.stringify(requestbody);
		const response = await fetch(backendurl, {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: jsbody
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

temperatureslider.addEventListener("change", updateModelConfig);
modelselect.addEventListener("change", updateModelConfig);
document.getElementById("generate-button").addEventListener("click", sendMessage);

configurationbutton.addEventListener("click", () => {
	if (configuration.style.display === "none") configuration.style.display = "block";
	else configuration.style.display = "none";
});