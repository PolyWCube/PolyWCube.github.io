let notes = [];

const notepanel = document.getElementById("note");
const notedisplay = document.getElementById("note-display");
const noteevent = document.getElementById("noteText");
const notetime = document.getElementById("noteTime");

export function createNote(text, time) {
	const note = {
		event: text,
		time: new Date(time).getTime()
	};
	
	notes.push(note);
	displayNotes();
}

function displayNotes() {
	notedisplay.innerHTML = "";

	notes.sort((a, b) => a.time - b.time);

	notes.forEach(note => {
		const noteDiv = document.createElement("div");
		noteDiv.innerHTML = `<p><strong>Note:</strong> ${note.event}</p><p><strong>Time:</strong> ${note.time}</p>`;
		notedisplay.appendChild(noteDiv);
	});
}

function checkAlerts() {
	const now = Date.now();

	notes.forEach((note, index) => {
		if (note.time <= now) {
			notes.splice(index, 1);
			displayNotes(notes);
		}
	});
}

displayNotes();
setInterval(checkAlerts, 5000);

document.getElementById("note-button").addEventListener("click", () => {
	if (notepanel.style.display === "none") notepanel.style.display = "block";
	else notepanel.style.display = "none";
});

document.getElementById("note-create-button").addEventListener("click", () => {
	createNote(noteevent.value, notetime.value);
});

export function createNotes(notes) {
	if (notes == "") return "";
	const events = [];
	const regex = /\[(.*?) \| (.*?)\]/g;
	let match;
	let response = "Noted: ";

    while ((match = regex.exec(notes)) !== null) {
		events.push({ event: match[1].trim(), time: match[2].trim() });
	}

	events.forEach(event => {
		createNote(event.event, event.time);
		response += event.event + " ";
	});
	return response;
}