export function setupLanguageSelector() {
	const languageSelector = document.createElement("select");
	languageSelector.innerHTML = `
	  <option value="en">English</option>
	  <option value="fr">Français</option>
	  <option value="es">Español</option>
	`;
	
	document.body.insertBefore(languageSelector, document.getElementById("app"));
  
	languageSelector.addEventListener("change", (e) => {
	  const selectedLanguage = e.target.value;
	  localStorage.setItem("preferredLanguage", selectedLanguage);
	  loadLanguage(selectedLanguage);
	});
  
	// Charger la langue sauvegardée
	const savedLanguage = localStorage.getItem("preferredLanguage") || "en";
	loadLanguage(savedLanguage);
  }
  
  async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	if (!translations[lang]) {
	  console.error(`Langue ${lang} non trouvée dans lang.json`);
	  return;
	}
  
	console.log(`Langue chargée : ${lang}`);
  }
  