import { updateWelcomeMessage } from "./app.js"

export let translations = {};

export async function loadLanguage(lang = "en") {
	try {
		const response = await fetch("./assets/lang.json");
		translations = await response.json();
	
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

		updateWelcomeMessage();
	} catch (error) {
		console.error("Error loading translations:", error);
	}
}

export function setupLanguageSelector() {
    const flags = document.querySelectorAll(".lang-flag");

    flags.forEach(flag => {
        flag.addEventListener("click", () => {
            const selectedLanguage = flag.dataset.lang;
            localStorage.setItem("preferredLanguage", selectedLanguage);
            loadLanguage(selectedLanguage);

            // Mettre à jour l'apparence pour indiquer la langue active
            flags.forEach(f => f.classList.remove("active"));
            flag.classList.add("active");
        });
    });

    // Charger la langue sauvegardée
    const savedLanguage = localStorage.getItem("preferredLanguage") || "en";
    loadLanguage(savedLanguage);
    
    // Mettre le drapeau actif
    const activeFlag = document.querySelector(`.lang-flag[data-lang="${savedLanguage}"]`);
    if (activeFlag) {
        activeFlag.classList.add("active");
    }
}


export function translate(key) {
	const lang = localStorage.getItem("preferredLanguage") || "en";
	return translations[lang][key] || key;
}