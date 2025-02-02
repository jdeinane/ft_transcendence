export async function loadLanguage(lang = "en") {
	try {
		const response = await fetch("./assets/lang.json");
		const translations = await response.json();
	
		if (!translations[lang]) {
		console.error(`Language ${lang} not found`);
		return;
		}

		document.querySelectorAll("[data-translate]").forEach((el) => {
			const key = el.dataset.translate;
			if (translations[lang][key])
				el.textContent = translations[lang][key];
		});

		localStorage.setItem("preferredLanguage", lang);
	} catch (error) {
		console.error("Error loading translations:", error);
	}
}

export function setupLanguageSelector() {
	const languageSelector = document.getElementById("language-selector");

	languageSelector.addEventListener("change", (e) => {
		const selectedLanguage = e.target.value;
		localStorage.setItem("preferredLanguage", selectedLanguage);
		loadLanguage(selectedLanguage);
	});

	const savedLanguage = localStorage.getItem("preferredLanguage") || "en";
	languageSelector.value = savedLanguage;
	loadLanguage(savedLanguage);
}
  