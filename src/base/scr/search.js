document.getElementById("search-input").addEventListener("input", function() {
	let input = this.value.toLowerCase();
	let list = document.getElementById("search-list");
	let items = list.getElementsByTagName("li");

	for (let item of items) {
		if (item.innerText.toLowerCase().includes(input)) {
			item.style.display = "block";
		} else {
			item.style.display = "none";
		}
	}
});