import { routes } from "./routes.js"
import { startPongGame } from "./pongGame.js";
import { setupLanguageSelector } from "./language.js";
import { createUser, loginUser, logoutUser, getCurrentUser } from "./user.js";
import { startPongTournament } from "./tournament.js";
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
	  
		const canvas = document.getElementById("pong");
		const backButton = document.getElementById("back-to-mode-selection");
		const modeSelectionContainer = document.getElementById("mode-selection-container");
		const tournamentMatch = JSON.parse(localStorage.getItem("tournamentMatch"));
	  
		if (tournamentMatch) {
			modeSelectionContainer.style.display = "none";
			canvas.style.display = "block";
			backButton.style.display = "block";

			startPongTournament(canvas, tournamentMatch.player1, tournamentMatch.player2, (winner) => {
				alert(`${winner} wins the match!`);
				navigate("#/tournament");
				return;
			});

		  // en attendant la database
			localStorage.removeItem("tournamentMatch");

		} else {
		  // Mode normal avec le choix du mode
		  let selectedMode = "solo";
	  
		  const modeButtons = document.querySelectorAll(".mode-button");
		  const startButton = document.getElementById("start-game");
	  
		  modeButtons.forEach(button => {
			button.addEventListener("click", () => {
			  modeButtons.forEach(btn => btn.classList.remove("active-mode"));
			  button.classList.add("active-mode");
			  selectedMode = button.dataset.mode;
			});
		  });
	  
		  startButton.addEventListener("click", () => {
			if (selectedMode === "tournament") {
			  navigate("#/tournament");
			  return;
			}
	  
			modeSelectionContainer.style.display = "none";
			canvas.style.display = "block";
			backButton.style.display = "block";
	  
			const isSinglePlayer = selectedMode === "solo";
			startPongGame(canvas, isSinglePlayer);
		  });
	  
		  backButton.addEventListener("click", () => {
			canvas.style.display = "none";
			backButton.style.display = "none";
			modeSelectionContainer.style.display = "block";
		  });
		}
	  }
	  

	if (cleanPath === "/tournament") {
		const players = [];
		let currentMatchIndex = 0;
	  
		const form = document.getElementById("tournament-form");
		const playerList = document.getElementById("player-list");
		const startTournamentButton = document.getElementById("start-tournament");
		const currentMatch = document.getElementById("current-match");
		const playMatchButton = document.getElementById("play-match");
	  
		form.addEventListener("submit", (e) => {
		  e.preventDefault();
		  const playerName = e.target.player.value.trim();
	  
		  if (playerName && !players.includes(playerName)) {
			players.push(playerName);
			const li = document.createElement("li");
			li.textContent = playerName;
			playerList.appendChild(li);
			e.target.reset();
		  }
	  
		  if (players.length >= 2) {
			startTournamentButton.disabled = false;
		  }
		});
	  
		startTournamentButton.addEventListener("click", () => {
		  if (players.length < 2) {
			alert("At least 2 players are needed to start a tournament!");
			return;
		  }
		  startMatchmaking();
		});
	  
		function startMatchmaking() {
		  if (currentMatchIndex < players.length - 1) {
			currentMatch.textContent = `Next Match: ${players[currentMatchIndex]} vs ${players[currentMatchIndex + 1]}`;
			playMatchButton.style.display = "block";
		  } else {
			currentMatch.textContent = "Tournament Finished!";
			playMatchButton.style.display = "none";
		  }
		}
	  
		playMatchButton.addEventListener("click", () => {
		  if (currentMatchIndex >= players.length - 1) return;
	  
		  const player1 = players[currentMatchIndex];
		  const player2 = players[currentMatchIndex + 1];
	  
		  // Stocker les joueurs actuels dans `localStorage`
		  localStorage.setItem("tournamentMatch", JSON.stringify({ player1, player2 }));
	  
		  alert(`Match: ${player1} vs ${player2} starts now!`);
		  navigate("#/game"); // Aller directement au jeu
	  
		  currentMatchIndex += 2;
		  startMatchmaking();
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
	if (existingScript)
		existingScript.remove();

	const script = document.createElement("script");
	script.src = "/frontend/scripts/pongGame.js";
	document.body.appendChild(script);
  }


  	// GESTION MULTILINGUE: Charge les traductions depuis lang.json

async function loadLanguage(lang = "en") {
	const response = await fetch("lang.json");
	const translations = await response.json();
  
	const app = document.getElementById("app");
	app.innerHTML = `<h1>${translations[lang].welcome}</h1>`;
  }


	// GESTIONAIRE D'EVENEMENT

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (e) => {
		if (e.target.matches("[data-link]")) {
			e.preventDefault();
			navigate(e.target.getAttribute("href"));
			updateNavigation(); // Mettre à jour le menu après navigation
    	}
	});

	if (!window.location.hash || window.location.hash === "#")
    	window.location.replace("#/");

  navigate(window.location.hash);

  window.addEventListener("popstate", (event) => {
	const path = event.state?.path || "/";
	navigate(`#${path}`, false);
  })

  updateNavigation();
  setupLanguageSelector();
});
