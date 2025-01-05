const fileInput = document.getElementById('image-input');
const messageTextArea = document.getElementById('transcription');

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const fileUrl = URL.createObjectURL(file);
    
    const attachmentLink = `<a href="${fileUrl}" target="_blank">${file.name}</a>`;
    
    const currentMessage = messageTextArea.value;
    messageTextArea.value = currentMessage + '\n' + attachmentLink;
});