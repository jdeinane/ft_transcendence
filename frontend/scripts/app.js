import { startPongGame } from "./pongGame.js";

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

	if (cleanPath == "/") {
		const playNowButton = document.getElementById("play-now");
		playNowButton.addEventListener("click", () => {
			navigate("#/game");
		});
	}

	if (cleanPath === "/game") {
		const startButton = document.getElementById("start-game");
		const canvas = document.getElementById("pong");
	  
		startButton.addEventListener("click", () => {
		  const mode = document.querySelector('input[name="mode"]:checked').value;
		  const isSinglePlayer = mode === "1"; // Si "1 joueur" est sélectionné
	  
		  // Affiche le canvas et démarre le jeu
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
  
	if (!translations[lang]) {
	  console.error(`Langue ${lang} non trouvée dans lang.json`);
	  return;
	}
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }
  