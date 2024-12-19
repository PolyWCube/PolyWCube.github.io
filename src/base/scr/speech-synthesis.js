var voices = [];

var speech = new SpeechSynthesisUtterance();

document.getElementById("speak-button").addEventListener("click", function() {
    const text = document.getElementById("response").value;

    if ("speechSynthesis" in window) {
        speech.lang = document.getElementById("language-select").value;
        speech.text = text;

        speech.voice = voices.find(voice => voice.name === document.getElementById("voice-select").value);

        speech.rate = 1.0;
        speech.pitch = 1.0;
        speech.volume = 1.0;

        speechSynthesis.speak(speech);
    } else {
        alert("Speech synthesis not supported in your browser.");
    }
});

speechSynthesis.onvoiceschanged = function() {
    voices = speechSynthesis.getVoices();
    var voiceSelect = document.getElementById("voice-select");

    voiceSelect.innerHTML = '';

    voices.forEach(voice => {
        var option = document.createElement("option");
        option.textContent = voice.name;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
};