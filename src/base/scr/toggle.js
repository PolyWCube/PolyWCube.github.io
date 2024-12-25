const checkboxes = document.querySelectorAll(".toggle");

checkboxes.forEach(checkbox => {
	const label = document.querySelector(`label[for="${checkbox.id}"]`);
	
	if (checkbox.checked) {
		label.style.color = "#fff";
	} else {
		label.style.color = "#505050";
	}

	checkbox.addEventListener('change', function() {
		if (checkbox.checked) {
			label.style.color = "#fff";
		} else {
			label.style.color = "#505050";
		}
	});
});