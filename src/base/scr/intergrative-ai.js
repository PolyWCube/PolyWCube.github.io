import { GoogleGenerativeAI } from "@google/generative-ai";
const API_KEY = "AIzaSyAL-WQeEaA5YlsofYMx57ysSJYfgFSlTJQ";

const generator = new GoogleGenerativeAI(API_KEY);
const model = generator.getGenerativeModel({ model : "gemini-1.5-flash" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 1000,
  responseMimeType: "text/plain",
};

let transcription = document.getElementById("transcription");
let response = document.getElementById("response");

let conversationhistory = document.getElementById("converstation-history");

let autospeak = document.getElementById("auto-speak");

import { speakMessage } from "./speech-synthesis.js";

async function generateResponse() {
	let input = (transcription.value + " " + conversationhistory.value).trim();
	try {
		const output = await model.generateContent(input);
		response.value = output.response.text();
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
	let input = "This is the previous history: " + conversationhistory.value + " Please join the sentence: " + response.value + "and generate the new history with optimize and main ideas.";
	try {
		const output = await model.generateContent(input);
		conversationhistory.value = output.response.text();
	} catch (error) {
		console.error("Error generating history:", error);
		conversationhistory.value = "Internal error";
	}
}

export function sendMessage() {
	response.value = "Generating response...";
	setTimeout(() => {
		generateResponse();
	}, 500);
}

document.getElementById("generate-button").addEventListener("click", sendMessage);