import { startPongGame } from "./pongGame.js";
import { setupLanguageSelector } from "./language.js";
import { createUser, loginUser, logoutUser, getCurrentUser } from "./user.js";

// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

const routes = {
	"/": `
	<h1 class="welcome-title">welcome to ft_transcendence</h1>
	<button id="play-now"> play now</button>
	`,
	"/game": `
	<h1>PONG!</h1>
	<div id="mode-selection-container">
		<div class="mode-selection">
		<button class="mode-button" data-mode="solo">Solo Player</button>
		<button class="mode-button" data-mode="multiplayer">Multiplayer</button>
		<button class="mode-button" data-mode="tournament">Tournament</button>
		</div>
		<button id="start-game">Game Start!</button>
	</div>
	<canvas id="pong" width="800" height="400" style="border:1px solid #000; display: none;"></canvas>
	<button id="back-to-mode-selection" style="display: none;">Back to Select Game Mode</button>
	`,
	"/login": `
	  <h1>login</h1>
	  <form id="login-form">
		<input type="text" name="username" placeholder="Username" required />
		<input type="password" name="password" placeholder="Password" required />
		<button type="submit">login</button>
	    <p id="login-error" class="error-message"></p> <!-- Zone d'affichage des erreurs -->
	  </form>
	  <p>no account ? <button id="go-to-signup" class="link-button">sign up</button></p>
	`,
	"/signup": `
	<h1>sign up</h1>
	<form id="signup-form">
		<input type="text" name="username" placeholder="username" required />
		<input type="email" name="email" placeholder="email" required />
		<input type="password" name="password" placeholder="password" required />
		<input type="password" name="confirm-password" placeholder="confirm password" required />
		<button type="submit">sign up!</button>
    	<p id="signup-error" class="error-message"></p> <!-- Zone d'affichage des erreurs -->
	</form>
	`,
	"/profile": `
	<h1>user profile</h1>
	<p>username : <strong>Nom</strong><p>
	<p>number of games played : <strong>12</strong></p>
	<p> last seen : <strong>2025-01-28</strong></p>
	`,
	"/about": "<h1>about ft_transcendence</h1><p>not your problem</p>",
	"*": "<h1>404 - not found</h1><p>page could not be found.</p>"  
  };


  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

  export function navigate(path, addToHistory = true) {
	const app = document.getElementById("app");
	const cleanPath = path.replace("#", ""); // Enlève le hash #
	app.innerHTML = routes[cleanPath] || routes["*"]; // Affiche la route correspondante ou 404

	// Met à jour l'URL dans l'historique du navigateur si demandé
	if (addToHistory) {
		window.history.pushState({ path: cleanPath }, "", `#${cleanPath}`);
	}

	if (cleanPath === "/login") {
		const user = getCurrentUser();
		if (user) {
		  alert("✅ You are already logged in!");
		  navigate("#/profile");
		  return;
		}
	  
		const form = document.getElementById("login-form");
		form.addEventListener("submit", (e) => {
		  e.preventDefault();
		  const username = form.username.value;
		  const password = form.password.value;
		  loginUser(username, password);
		});	

		const goToSignup = document.getElementById("go-to-signup");
		goToSignup.addEventListener("click", () => {
		  navigate("#/signup");
		});  
	}
	  
	  if (cleanPath === "/signup") {
		const form = document.getElementById("signup-form");
		form.addEventListener("submit", (e) => {
		  e.preventDefault();
		  const username = form.username.value;
		  const password = form.password.value;
		  const email = form.email.value;
		  createUser(username, password, email);
		});
	  }
	  
	  if (cleanPath === "/profile") {
		const user = getCurrentUser();
		if (!user) {
		  alert("you have to log in !");
		  navigate("#/login");
		} else {
		  document.getElementById("app").innerHTML += `
			<p>Bienvenue, ${user.username} !</p>
			<button id="logout">Déconnexion</button>
		  `;
		  document.getElementById("logout").addEventListener("click", logoutUser);
		}
	  }
	  
	if (cleanPath === "/") {
		const playNowButton = document.getElementById("play-now");
		playNowButton.addEventListener("click", () => {
			navigate("#/game");
		});
	}

	if (cleanPath === "/game") {
		const user = getCurrentUser();
	  
		if (!user) {
		  alert("❌ You have to be logged in first!");
		  navigate("#/login");
		  return;
		}
	  
		let selectedMode = "solo";
	  
		const modeSelectionContainer = document.getElementById("mode-selection-container");
		const modeButtons = document.querySelectorAll(".mode-button");
		const startButton = document.getElementById("start-game");
		const canvas = document.getElementById("pong");
		const backButton = document.getElementById("back-to-mode-selection");
	  
		modeButtons.forEach(button => {
		  button.addEventListener("click", () => {
			modeButtons.forEach(btn => btn.classList.remove("active-mode"));
			button.classList.add("active-mode");
			selectedMode = button.dataset.mode;
		  });
		});
	  
		startButton.addEventListener("click", () => {
		  if (selectedMode === "tournament") {
			navigate("#/tournament"); // Redirige vers le mode tournoi
			return;
		  }
	  
		  modeSelectionContainer.style.display = "none"; // Cacher la sélection de mode
		  canvas.style.display = "block"; // Afficher le jeu
		  backButton.style.display = "block"; // Afficher le bouton retour
	  
		  const isSinglePlayer = selectedMode === "solo";
		  startPongGame(canvas, isSinglePlayer);
		});
	  
		// Gérer le retour vers la sélection du mode
		backButton.addEventListener("click", () => {
		  canvas.style.display = "none"; // Cacher le jeu
		  backButton.style.display = "none"; // Cacher le bouton retour
		  modeSelectionContainer.style.display = "block"; // Réafficher la sélection du mode
		});
	  }
	  
		  updateActiveLink(cleanPath);
}


	// AFFICHE/CACHE DES SECTIONS SELON UNE CONNEXION D'USER

  export function updateNavigation() {
	const user = getCurrentUser();
	const profileLink = document.querySelector('a[href="#/profile"]');
	const loginLink = document.querySelector('a[href="#/login"]');

	if (user) {
	profileLink.style.display = "inline";
	loginLink.style.display = "none";
	} else {
	profileLink.style.display = "none";
	loginLink.style.display = "inline";
	}
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
  

  function loadGameScript() {
	const existingScript = document.querySelector('script[src="/scripts/pongGame.js"]');
	if (existingScript) existingScript.remove(); // Évite de charger plusieurs fois le même script
  
	const script = document.createElement("script");
	script.src = "/frontend/scripts/pongGame.js";
	document.body.appendChild(script);
  }
  
  
  
  // FORMULAIRE DE CONNEXION: Lorsqu'il est soumis, il affiche les valeurs saisies dans la console

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigate(e.target.getAttribute("href"));
      updateNavigation(); // Mettre à jour le menu après navigation
    }
  });

  if (!window.location.hash || window.location.hash === "#") {
    window.location.replace("#/");
  }

  navigate(window.location.hash);
  window.addEventListener("popstate", (event) => {
	const path = event.state?.path || "/";
	navigate(`#${path}`, false);

  })
  updateNavigation();

  setupLanguageSelector();
});



  // GESTION MULTILINGUE: Charge les traductions depuis lang.json

  async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }
  