import { renderSignupForm, renderLoginForm, handleLogin, handleSignUp } from "./scripts/auth";

// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

const routes = {
	"/": "<h1>Bienvenue sur ft_transcendence</h1>",
	"/signup": renderSignupForm(),
	"/login": renderLoginForm(),
  };


  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

  function navigate(path) {
	const app = document.getElementById("app");
	app.innerHTML = routes[path] || "<h1>Page non trouvée</h1>";

	if (path == "/signup") handleSignUp();
	if (path == "/login") handleLogin();

	window.history.pushState({}, "", path);
  }


  // FORMULAIRE DE CONNEXION: Lorsqu'il est soumis, il affiche les valeurs saisies dans la console

  document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (e) => {
	  if (e.target.matches("[data-link]")) {
		e.preventDefault();
		navigate(e.target.getAttribute("href"));
	  }
	});


	// GESTION MULTILINGUE: Ajoute un sélecteur de langues dynamiques

	const languageSelector = document.createElement("select");
	languageSelector.innerHTML = `
	  <option value="en">English</option>
	  <option value="fr">Français</option>
	  <option value ="ch">Chinese</option>
	`;
	document.body.insertBefore(languageSelector, document.getElementById("app"));
  
	languageSelector.addEventListener("change", (e) => {
	  loadLanguage(e.target.value);
	});
  
	loadLanguage();
	navigate(window.location.hash || "#/" );
  });


  // GESTION MULTILINGUE: Charge les traductions depuis lang.json

  async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	const app = document.querySelector("h1");
	if (title) {
		title.textContent = translations[lang].welcome;
	}
  }
