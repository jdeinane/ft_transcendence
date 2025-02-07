import { routes } from "./routes.js"
import { loadLanguage, setupLanguageSelector } from "./language.js";
import { translations } from "./language.js";
import { createUser, loginUser, logoutUser, getCurrentUser } from "./user.js";
import { setupPongGame } from "./pongGame.js";
import { setupTicTacToeGame } from "./tttGame.js";
import { initializeClock } from "./decorationClock.js";
import { initializeCalendar } from "./decorationCalendar.js";

  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

export function navigate(path, addToHistory = true) {
	const app = document.getElementById("app");
	const cleanPath = path.replace("#", "");
	app.innerHTML = routes[cleanPath] || routes["*"]; 

	if (addToHistory) {
		window.history.pushState({ path: cleanPath }, "", `#${cleanPath}`);
	}

	if (cleanPath === "/login") {
		const user = getCurrentUser();
		if (user) {
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
			<button id="logout" data-translate="logout">logout</button>
			`;
			document.getElementById("logout").addEventListener("click", logoutUser);
		}
	  }
	  
	if (cleanPath === "/") {
		setTimeout(async () => {
			await loadLanguage(localStorage.getItem("preferredLanguage") || "en");
			initializeClock();
			initializeCalendar();
			updateWelcomeMessage();
		}, 50);

		const gameWidget = document.getElementById("game-widget");
		gameWidget.addEventListener("click", () => {
			navigate("#/game");
		});

		const chatWidget = document.getElementById("chat-widget");
		chatWidget.addEventListener("click", () => {
			navigate("#/livechat");
		});

		const leaderboardWidget = document.getElementById("leaderboard-widget");
		leaderboardWidget.addEventListener("click", () => {
			navigate("#/leaderboard");
		});
	}

	if (cleanPath === "/game") {
		const user = getCurrentUser();
		if (!user) {
		  navigate("#/login");
		  return;
		}
	  
		document.querySelectorAll(".mode-button").forEach(button => {
			button.addEventListener("click", () => {
				const selectedGame = button.dataset.game;
				if (selectedGame === "pong")
					navigate("#/pong");
				else if (selectedGame === "tic-tac-toe")
					navigate("#/tic-tac-toe");
			});
		});
	}

	if (cleanPath === "/pong") {
		setupPongGame();
	}


	if (cleanPath === "/tic-tac-toe") {
		setupTicTacToeGame();
	}

	if (cleanPath === "/tournament") {
		setupTournament();
	}
	const savedLanguage = localStorage.getItem("preferredLanguage") || "en";
	loadLanguage(savedLanguage);
	updateActiveLink(cleanPath);
}

window.onpopstate = (event) => {
	if (event.state && event.state.path)
		navigate(event.state.path, false);
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
});

// ne pas supprimer sinon les trad ne marchent plus
document.addEventListener("DOMContentLoaded", () => {
	setupLanguageSelector(); 
  });
  
  export function updateWelcomeMessage() {
    const user = getCurrentUser();
    const welcomeMessage = document.getElementById("welcome-message");
    const currentLang = localStorage.getItem("preferredLanguage") || "en";

    if (!welcomeMessage) return;

    if (user && translations[currentLang]["welcome-user"]) {
        welcomeMessage.textContent = translations[currentLang]["welcome-user"].replace("{user}", user.username);
    } else {
        welcomeMessage.textContent = translations[currentLang]["welcome"] || "Welcome to ft_transcendence";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const avatarImg = document.getElementById("avatar-img");
    const changeAvatarBtn = document.getElementById("change-avatar-btn");
    const avatarSelection = document.getElementById("avatar-selection");
    const avatarOptions = document.querySelectorAll(".avatar-option");

    // Afficher/Masquer la sélection d'avatars
    changeAvatarBtn.addEventListener("click", () => {
        avatarSelection.classList.toggle("hidden");
    });

    // Changer l'avatar lorsqu'on clique sur une option
    avatarOptions.forEach(avatar => {
        avatar.addEventListener("click", () => {
            const newAvatar = avatar.src;
            avatarImg.src = newAvatar;
            localStorage.setItem("selectedAvatar", newAvatar); // Sauvegarde l'avatar
            avatarSelection.classList.add("hidden"); // Cacher la sélection après choix
        });
    });

    // Charger l'avatar sauvegardé
    const savedAvatar = localStorage.getItem("selectedAvatar");
    if (savedAvatar) {
        avatarImg.src = savedAvatar;
    }
});
