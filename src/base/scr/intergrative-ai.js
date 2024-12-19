const recognition = new webkitSpeechRecognition();
let record = false;

recognition.continuous = true;
recognition.lang = "en-US";

recognition.onresult = function(event) {
	const transcript = event.results[event.results.length - 1][0].transcript;
	
	document.getElementById("transcription").value += transcript;
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