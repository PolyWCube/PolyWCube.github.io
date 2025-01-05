import { speakMessage } from "./speech-synthesis.js";
const generativeaiendpoint = "https://pwc-gemini-api.netlify.app/.netlify/functions/generative-ai";
const visionendpoint =  "https://pwc-gemini-api.netlify.app/.netlify/functions/vision";

const transcription = document.getElementById("transcription");
const responsetext = document.getElementById("response");
const conversationhistory = document.getElementById("converstation-history");
const autospeak = document.getElementById("auto-speak");
const temperatureslider = document.getElementById("temperature-slider");
const modelselect = document.getElementById("model-select");
const downloadhistory = document.getElementById("download-history");
const uploadhistory = document.getElementById("upload-history");
const configurationbutton = document.getElementById("configuration-button");
const configuration = document.getElementById("configuration");
const imageinput = document.getElementById('image-input');

let chathistory = [];
let modelconfig = {
	temperature: 1,
	modelname: "gemini-1.5-flash"
};
async function generateResponse() {
	let imagedescription = "";
	if (imageinput.files.length != 0) {
		const file = imageinput.files[0];
		if (file) {
			imagedescription = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = async (event) => {
					const imageDataUrl = event.target.result;
					try {
						const response = await fetch(visionendpoint, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ image: imageDataUrl }),
						});

						if (!response.ok) {
							const errorText = await response.text();
							reject(new Error(`${response.status} ${response.statusText} - ${errorText}`));
							return;
						}

						const data = await response.json();
						resolve(data.description);
					} catch (error) {
						reject(error);
					}
				};
				reader.onerror = (error) => {
					reject(error);
				};
				reader.readAsDataURL(file);
			});
		}
	}
	let input = ((imagedescription != "") ? "[ Image description: " +imagedescription + "] " : "") + transcription.value.trim();
	try {
		const requestbody = { prompt: input, history: chathistory, modelconfig: modelconfig };
		const jsbody = JSON.stringify(requestbody);
		const response = await fetch(generativeaiendpoint, {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: jsbody
			});

		if (!response.ok) {
			return response.text().then(text => {throw new Error(`${response.status} ${response.statusText} - ${text}`)})
		}

		const data = await response.json();
		responsetext.value = data.response;
		chathistory = data.history;
		generateHistory();
	} catch (error) {
		console.error("Error occur during fetch Generative AI API:", error);
		responsetext.value = "An error occurred.";
	}
	if (autospeak.checked) {
		speakMessage();
	}
}

async function generateHistory() {
	try {
		conversationhistory.value = "";
		for (let index = 0; index < chathistory.length; ++index) {
			conversationhistory.value += chathistory[index].role + ": " + chathistory[index].parts[0].text.replace("[Generate response not too long, natural, human-like] ", "") + '\n';
		}
		conversationhistory.scrollTop = conversationhistory.scrollHeight;
	} catch (error) {
		console.error("Error generating history:", error);
		conversationhistory.value = "An error occurred.";
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

downloadhistory.addEventListener("click", () => {
	const jsonString = JSON.stringify(chathistory);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = "conversation-history.json";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
});

uploadhistory.addEventListener("change", (event) => {
	const file = event.target.files[0];
	if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
		try {
			const jsonContent = e.target.result;
			chathistory = JSON.parse(jsonContent);
			console.log("JSON Array:", chathistory);
		} catch (error) {
			console.error("Error parsing JSON:", error);
			alert("Invalid JSON file.");
		}
		};
		reader.readAsText(file);
	}
});

temperatureslider.addEventListener("change", updateModelConfig);
modelselect.addEventListener("change", updateModelConfig);
document.getElementById("generate-button").addEventListener("click", sendMessage);

configurationbutton.addEventListener("click", () => {
	if (configuration.style.display === "none") configuration.style.display = "block";
	else configuration.style.display = "none";
});