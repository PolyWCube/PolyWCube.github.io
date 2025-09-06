import { speakMessage } from "./speech-synthesis.js";
import { createNotes } from "./note.js";
const generativeaiendpoint = "https://pwc-gemini-api.netlify.app/.netlify/functions/generative-ai";
const visionendpoint =  "https://pwc-gemini-api.netlify.app/.netlify/functions/vision";
const whisperendpoint =  "https://pwc-gemini-api.netlify.app/.netlify/functions/whisper";
const timeendpoint =  "https://pwc-gemini-api.netlify.app/.netlify/functions/time";

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
const imagebutton = document.getElementById('image-button');
const imagepreview = document.getElementById("image-preview");
const audioinput = document.getElementById('audio-input');
const audiobutton = document.getElementById('audio-button');
const notedisplay = document.getElementById("note-display");

let onresponse = false;

let chathistory = [];
let modelconfig = {
	temperature: 1,
	modelname: "gemini-1.5-flash"
};
async function generateResponse() {
	if (onresponse) return;
	onresponse = true;
	const userprompt = transcription.value.trim();
	let inputprompt = "";
	let imagedescription = "";
	let audiodescription = "";
	let iotdescription = "";
	let notedescription = "";
	try {
		const today = new Date();
		const requestbody = { prompt: "[Current time: " + today.toLocaleString() + "| Current notes: " + notedisplay.value + "] " + userprompt, history: chathistory };
		const jsbody = JSON.stringify(requestbody);
		const response = await fetch(timeendpoint, {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: jsbody
			});
		if (!response.ok) return response.text().then(text => {throw new Error(`${response.status} ${response.statusText} - ${text}`)})
		const data = await response.json();
		let note = data.note;
		notedescription = createNotes(note);
	} catch (error) {
		console.error("Error occur during fetch Time API:", error);
		responsetext.value = "An error occurred durring sending message to the chatbot.";
	}
	
	
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
							body: JSON.stringify({ image: imageDataUrl, prompt: userprompt })
						});
						if (!response.ok) {
							const errorText = await response.text();
							reject(new Error(`${response.status} ${response.statusText} - ${errorText}`));
							return;
						}
						const data = await response.json();
						resolve(data.description);
					} catch (error) { reject(error); }
				};
				reader.onerror = (error) => { reject(error); };
				reader.readAsDataURL(file);
			});
		}
		imagebutton.textContent = "Attach Image";
		imageinput.value = "";
		imagepreview.src = "";
	}
	if (audioinput.files.length != 0) {
		const file = audioinput.files[0];
		if (file) {
			audiodescription = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = async (event) => {
					const audioDataUrl = event.target.result;
					try {
						const response = await fetch(whisperendpoint, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ audio: audioDataUrl, prompt: userprompt })
						});
						if (!response.ok) {
							const errorText = await response.text();
							reject(new Error(`${response.status} ${response.statusText} - ${errorText}`));
							return;
						}
						const data = await response.json();
						resolve(data.description);
					} catch (error) { reject(error); }
				};
				reader.onerror = (error) => { reject(error); };
				reader.readAsDataURL(file);
			});
		}
		audiobutton.textContent = "Attach Audio";
		audioinput.value = "";
	}
	if (imagedescription != "") inputprompt += "[Image: " + imagedescription + "] ";
	if (audiodescription != "") inputprompt += "[Audio: " + audiodescription + "] ";
	if (iotdescription != "") inputprompt += "[IoT: " + iotdescription + "] ";
	if (notedescription != "") inputprompt += "[Note: " + notedescription + "] ";
	
	inputprompt += userprompt;
	try {
		const requestbody = { prompt: inputprompt, history: chathistory, modelconfig: modelconfig };
		const jsbody = JSON.stringify(requestbody);
		const response = await fetch(generativeaiendpoint, {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: jsbody
			});
		if (!response.ok) return response.text().then(text => {throw new Error(`${response.status} ${response.statusText} - ${text}`)})
		const data = await response.json();
		responsetext.value = data.response;
		chathistory = data.history;
		generateHistory();
	} catch (error) {
		console.error("Error occur during fetch Generative AI API:", error);
		responsetext.value = "An error occurred durring sending message to the chatbot.";
	}
	if (autospeak.checked) speakMessage(responsetext.value);
	transcription.value = "";
	onresponse = false;
}

export async function timeResponse(time) {
	onresponse = true;
	try {
		const requestbody = { prompt: time, history: chathistory, modelconfig: modelconfig };
		const jsbody = JSON.stringify(requestbody);
		const response = await fetch(generativeaiendpoint, {
			method: "POST", 
			headers: { "Content-Type": "application/json" },
			body: jsbody
			});
		if (!response.ok) return response.text().then(text => {throw new Error(`${response.status} ${response.statusText} - ${text}`)})
		const data = await response.json();
		responsetext.value = data.response;
		chathistory = data.history;
		generateHistory();
	} catch (error) {
		console.error("Error occur during fetch Generative AI API:", error);
		responsetext.value = "An error occurred durring sending message to the chatbot.";
	}
	if (autospeak.checked) speakMessage(responsetext.value);
	onresponse = false;
}

async function generateHistory() {
	try {
		conversationhistory.value = "";
		for (let index = 0; index < chathistory.length; ++index) {
			conversationhistory.value += chathistory[index].role + ": " + chathistory[index].parts[0].text + '\n';
		}
		conversationhistory.scrollTop = conversationhistory.scrollHeight;
	} catch (error) {
		console.error("Error generating history:", error);
		responsetext.value = "An error occurred durring generating conversation history.";
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

imageinput.addEventListener("change", () => {
	if (imageinput.files.length > 0) {
		imagebutton.textContent = "Detach Image";
		const reader = new FileReader();
		reader.onload = (e) => {
			imagepreview.src = e.target.result;
		};
		reader.readAsDataURL(imageinput.files[0]);
	} else {
		imagebutton.textContent = "Attach Image";
		imagepreview.src = "";
	}
});
imagebutton.addEventListener("click", () => {
	if (imagebutton.textContent === "Detach Image") {
		imagebutton.textContent = "Attach Image";
		imageinput.value = "";
		imagepreview.src = "";
	} else imageinput.click();
});

audioinput.addEventListener("change", () => {
	if (audioinput.files.length > 0) audiobutton.textContent = "Detach Audio";
	else audiobutton.textContent = "Attach Audio";
});
audiobutton.addEventListener("click", () => {
	if (audiobutton.textContent === "Detach Audio") {
		audiobutton.textContent = "Attach Audio";
		audioinput.value = "";
	} else audioinput.click();
});

temperatureslider.addEventListener("change", updateModelConfig);
modelselect.addEventListener("change", updateModelConfig);
document.getElementById("generate-button").addEventListener("click", sendMessage);

configurationbutton.addEventListener("click", () => {
	if (configuration.style.display === "none") configuration.style.display = "block";
	else configuration.style.display = "none";
});