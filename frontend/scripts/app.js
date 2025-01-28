// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

const routes = {
	"/": "<h1>Bienvenue sur ft_transcendence</h1>",
	"/login": `
	  <h1>Connexion</h1>
	  <form id="login-form">
		<input type="text" name="username" placeholder="Nom d'utilisateur" required />
		<input type="password" name="password" placeholder="Mot de passe" required />
		<button type="submit">Se connecter</button>
	  </form>
	`,
	"/profile": "<h1>Profil utilisateur</h1>"
  };


  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

  function navigate(path) {
	const app = document.getElementById("app");
	const cleanPath = path.replace("#", ""); // Enlève le hash #
	app.innerHTML = routes[cleanPath] || "<h1>Page non trouvée</h1>";
	window.history.pushState({}, "", path); // Met a jour l'URL sans recharger la page
  
	if (cleanPath === "/login") {
	  const form = document.getElementById("login-form");
	  form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(form);
		console.log("Nom d'utilisateur :", data.get("username"));
		console.log("Mot de passe :", data.get("password"));
	  });
	}
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
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }
