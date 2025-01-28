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
	  <p>Pas encore inscrit ? <button id="go-to-signup" class="link-button">Créer un compte</button></p>
	`,
	"/signup": `
	<h1>Inscription</h1>
	<form id="signup-form">
		<input type="text" name="username" placeholder="Nom d'utilisateur" required />
		<input type="password" name="password" placeholder="Mot de passe" required />
		<input type="password" name="confirm-password" placeholder="Confirmer le mot de passe" required />
		<button type="submit">S'inscrire</button>
	</form>
	`,
	"/profile": `
	<h1>Profil utilisateur</h1>
	<p>Nom d'utilisateur : <strong>Nom</strong><p>
	<p>Nombre de parties jouées : <strong>12</strong></p>
	<p> Dernière connexion : <strong>2025-01-28</strong></p>
	`,
	"/about": "<h1>À propos de ft_transcendence</h1><p>Un projet ambitieux et unique !</p>",
	"*": "<h1>404 - Page non trouvée</h1><p>La page demandée est introuvable.</p>"  
  };


  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

  function navigate(path) {
	const app = document.getElementById("app");
	const cleanPath = path.replace("#", ""); // Enlève le hash #
	app.innerHTML = routes[cleanPath] || routes["*"]; // Affiche la route correspondante ou 404
  
	// Gestion de la page Connexion
	if (cleanPath === "/login") {
	  const form = document.getElementById("login-form");
	  form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(form);
		console.log("Nom d'utilisateur :", data.get("username"));
		console.log("Mot de passe :", data.get("password"));
	  });
  
	  // Bouton pour rediriger vers Inscription
	  const goToSignup = document.getElementById("go-to-signup");
	  goToSignup.addEventListener("click", () => {
		navigate("#/signup"); // Redirige vers la page d'inscription
	  });
	}
  
	// Gestion de la page Inscription
	if (cleanPath === "/signup") {
	  const form = document.getElementById("signup-form");
	  form.addEventListener("submit", (e) => {
		e.preventDefault();
		const username = form.username.value;
		const password = form.password.value;
		const confirmPassword = form["confirm-password"].value;
  
		if (password !== confirmPassword) {
		  alert("Les mots de passe ne correspondent pas !");
		  return;
		}
		console.log("Inscription réussie :", username);
	  });
	}
  
	// Met à jour le lien actif
	updateActiveLink(cleanPath);
  }
  

	// METTRE A JOUR LE LIEN ACTIF

  function updateActiveLink(path) {
	document.querySelectorAll("nav a").forEach((link) => {
	  link.classList.remove("active");
	  if (link.getAttribute("href") === `#${path}`) {
		link.classList.add("active");
	  }
	});
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
	  <option value="es">Español</option>
	`;
	document.body.insertBefore(languageSelector, document.getElementById("app"));
  
	languageSelector.addEventListener("change", (e) => {
		const selectedLanguage = e.target.value;
		localStorage.setItem("preferredLanguage", selectedLanguage);
		loadLanguage(selectedLanguage);
	});
	
	const savedLanguage = localStorage.getItem("preferredLanguage") || "en";
	loadLanguage(savedLanguage);
	navigate(window.location.hash || "#/" );
  });


  // GESTION MULTILINGUE: Charge les traductions depuis lang.json

  async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }
