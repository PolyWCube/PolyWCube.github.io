function displayRandomQuote() {
	fetch('../txt/quote.txt')
	.then(response => response.text())
	.then(data => {
		var quotes = data.split('\n');
		var randomIndex = Math.floor(Math.random() * quotes.length);
		var randomQuote = quotes[randomIndex];
		document.getElementById("quote").innerText = randomQuote;
		console.log(data);
	})
	.catch(error => console.error('Error reading the file: ', error));
}
window.onload = displayRandomQuote;