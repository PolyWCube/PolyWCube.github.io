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

function sendMessage() {
    const inputMessage = document.getElementById("transcription").value;

    fetch(`https://rhetorical-intermediate-humor.glitch.me/api?generator=iu4qaxtgan&list=output&inputmessage=${inputMessage}`)
        .then(response => response.json())
        .then(data => {
            const generatedResponse = data.output;
            document.getElementById("response").value = generatedResponse;
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
}

// Event listener for the "Generate Response" button
document.getElementById("generate-button").addEventListener("click", sendMessage);