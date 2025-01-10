import { timeResponse } from "./intergrative-ai.js";
let notes = [];

const notepanel = document.getElementById("note");
const notedisplay = document.getElementById("note-display");

export function createNote(text, time) {
	const note = {
		event: text,
		time: new Date(time).getTime()
	};
	
	notes.push(note);
	displayNotes();
}

function displayNotes() {
	let noteText = "";
	notes.sort((a, b) => a.time - b.time);

	notes.forEach(note => {
		const date = new Date(note.time);
		const formattedDate = date.toLocaleDateString();
		const formattedTime = date.toLocaleTimeString();

		noteText += `${note.event}\nat ${formattedDate} ${formattedTime}\n`;
	});

	notedisplay.innerHTML = noteText;
}

function checkNotes() {
	const now = Date.now();
	let noteText = "[Note: ";

	notes.forEach((note, index) => {
		if (note.time <= now) {
			const date = new Date(note.time);
			const localTime = date.toLocaleString();
			
			noteText += `${note.event} at ${localTime}, `;
			notes.splice(index, 1);
			displayNotes(notes);
		}
	});
	
	if (noteText == "[Note: ") return;
	noteText += "*System generated* Remind the user]"
	
	timeResponse(noteText);
}

displayNotes();
setInterval(checkNotes, 5000);

document.getElementById("note-button").addEventListener("click", () => {
	if (notepanel.style.display === "none") notepanel.style.display = "block";
	else notepanel.style.display = "none";
});

export function createNotes(notes) {
	if (notes == "") return "";
	const events = [];
	const regex = /\[(.*?) \| (.*?)\]/g;
	let match;
	let response = "";

	while ((match = regex.exec(notes)) !== null) {
		events.push({ event: match[1].trim(), time: match[2].trim() });
	}

	events.forEach(event => {
		createNote(event.event, event.time);
		response += event.event + " ";
	});
	return response;
}