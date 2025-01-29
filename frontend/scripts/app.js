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
	<div>
		<label>
		<input type="radio" name="mode" value="1" checked /> solo player
		</label>
		<label>
		<input type="radio" name="mode" value="2" /> multiplayer
		</label>
		<button id="start-game">game start!</button>
	</div>
	<canvas id="pong" width="800" height="400" style="border:1px solid #000; display: none;"></canvas>
	<button id="back-home">back to home</button>
	`,
	"/login": `
	  <h1>login</h1>
	  <form id="login-form">
		<input type="text" name="username" placeholder="Username" required />
		<input type="password" name="password" placeholder="Password" required />
		<button type="submit">login</button>
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
			alert("you have to be logged in first!");
			navigate("#/login");
			return;
		}
		
		const startButton = document.getElementById("start-game");
		const canvas = document.getElementById("pong");

		startButton.addEventListener("click", () => {
			const mode = document.querySelector('input[name="mode"]:checked').value;
			const isSinglePlayer = mode === "1";

			canvas.style.display = "block";
			startPongGame(canvas, isSinglePlayer);
		});

		const backButton = document.getElementById("back-home");
		backButton.addEventListener("click", () => {
			navigate("#/");
		});
	}

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
		}
	});

	// Rediriger vers home si aucune route n'est définie
	if (!window.location.hash || window.location.hash === "#") {
		window.location.replace("#/");
	}

	// Charger la page correspondante
	navigate(window.location.hash);

	// Gérer les boutons "Back" et "Forward"
	window.addEventListener("popstate", (event) => {
		const path = event.state?.path || "/";
		navigate(`#${path}`, false); // Ne pas ajouter à l'historique (déjà géré par le navigateur)
	});

	// Charger la sélection de langue
	setupLanguageSelector();
});

  


  // GESTION MULTILINGUE: Charge les traductions depuis lang.json

  async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }
  