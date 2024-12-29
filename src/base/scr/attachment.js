const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('attachment-button');
const messageTextArea = document.getElementById('transcription');

uploadButton.addEventListener('click', function() {
    fileInput.click();
});

fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const fileUrl = URL.createObjectURL(file);
    
    const attachmentLink = `<a href="${fileUrl}" target="_blank">${file.name}</a>`;
    
    const currentMessage = messageTextArea.value;
    messageTextArea.value = currentMessage + '\n' + attachmentLink;
});