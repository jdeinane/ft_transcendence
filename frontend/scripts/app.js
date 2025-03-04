
import { routes } from "./routes.js"
import { loadLanguage, setupLanguageSelector, translations } from "./language.js";
import { createUser, loginUser, refreshToken, getCurrentUser } from "./user.js";
import { setupPongGame, handleModeSelection } from "./pongGame.js";
import { setupTicTacToeGame } from "./tttGame.js";
import { setupTicTacToeTournament } from "./tttTournament.js";
import { initializeClock } from "./decorationClock.js";
import { initializeCalendar } from "./decorationCalendar.js";
import { setupTournament } from "./tournament.js";
import { setupLeaderboard } from "./leaderboard.js";
import { loadProfile, loadEditProfile, savePreferredLanguage, loadMatchHistory } from "./profile.js";
  // NAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

export function navigate(path, addToHistory = true) {
	const app = document.getElementById("app");
	const cleanPath = path.replace("#", "");
	const user = getCurrentUser();

	const protectedRoutes = ["/profile", "/edit-profile", "/game", "/leaderboard"];
    if (!user && protectedRoutes.includes(cleanPath)) {
        navigate("#/login");
        return;
    }

	app.innerHTML = routes[cleanPath] || routes["*"]; 

	if (addToHistory) {
		window.history.pushState({ path: cleanPath }, "", `#${cleanPath}`);
	}

	updateHeaderAvatar();

	if (cleanPath === "/login") {
		const user = getCurrentUser();
		if (user) {
			navigate("#/profile");
			return;
		}
	  
		const form = document.getElementById("login-form");
		const errorMessage = document.getElementById("login-error");

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const username = form.username.value;
			const password = form.password.value;
			const loginSuccess = await loginUser(username, password);

			if (loginSuccess) {
				updateHeaderAvatar();
				navigate("#/profile");
			} else {
				errorMessage.textContent = "Invalid username or password.";
			}
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
			const confirmPassword = form["confirm-password"].value;
			createUser(username, password, email, confirmPassword);
		});
	  }

	if (cleanPath === "/profile") {
		loadProfile();
		loadMatchHistory();
	}

	if (cleanPath === "/match-history") {
		setTimeout(() => {
			const backButton = document.getElementById("back-to-profile");
			if (backButton) {
				console.log("✅ Ajout de l'événement au bouton 'Back'");
				backButton.addEventListener("click", () => {
					console.log("🔙 Retour vers le profil");
					navigate("#/profile");
				});
			} else {
				console.error("❌ Impossible de détecter le bouton 'Back'");
			}
		}, 500);
	}
	

	if (cleanPath === "/edit-profile") {
		loadEditProfile();
	
		setTimeout(() => {
			const saveLanguageBtn = document.getElementById("save-language-btn");
			if (saveLanguageBtn) {
				console.log("✅ Bouton Save Language détecté après chargement !");
				saveLanguageBtn.addEventListener("click", savePreferredLanguage);
			}
		}, 100);
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
			navigate("#/profile");
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
		handleModeSelection();
	}


	if (cleanPath === "/tic-tac-toe") {
		setupTicTacToeGame();
		handleModeSelection();
	}

	if (cleanPath === "/tournament") {
		setupTournament();
	}

	if (cleanPath === "/tic-tac-toe-tournament") {
		setupTicTacToeTournament();
	}
	
	if (cleanPath === "/results") {
		const rankingList = document.getElementById("ranking-list");
		const backButton = document.getElementById("back-to-home");
	
		const finalRanking = JSON.parse(localStorage.getItem("finalRanking")) || [];
	
		rankingList.innerHTML = "";
		finalRanking.forEach((player, index) => {
			const listItem = document.createElement("li");
			listItem.textContent = `${index + 1}. ${player}`;
			rankingList.appendChild(listItem);
		});
	
		backButton.addEventListener("click", () => {
			navigate("/");
		});
	}

	if (cleanPath === "/leaderboard") {
		setupLeaderboard();
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

export function updateHeaderAvatar() {
    const headerAvatar = document.getElementById("header-avatar");
    const avatarContainer = document.getElementById("avatar-container");
    const savedAvatar = localStorage.getItem("selectedAvatar");
    const user = getCurrentUser();

    if (user && savedAvatar) {
        headerAvatar.src = savedAvatar;
        avatarContainer.classList.remove("hidden");
    } else {
        avatarContainer.classList.add("hidden");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    updateHeaderAvatar();
});

document.addEventListener("DOMContentLoaded", () => {
    const modeButtons = document.querySelectorAll(".mode-button");

    modeButtons.forEach(button => {
        button.addEventListener("click", () => {
            modeButtons.forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");
        });
    });
});


setInterval(refreshToken, 15 * 60 * 1000);

function handleOAuthCallback() {
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
    const accessToken = hashParams.get("access_token");
    const userId = hashParams.get("user_id");
    const username = hashParams.get("username");
	const avatarUrl = hashParams.get("avatar_url");
	const finalAvatar = avatarUrl && avatarUrl.startsWith("http") ? avatarUrl : `assets/avatars/${avatarUrl || "avataralien.png"}`;
	const email = hashParams.get("email");
    const language = hashParams.get("language") || "en";
    const numberOfGamesPlayed = hashParams.get("number_of_games_played") || 0;
    const lastSeen = hashParams.get("last_seen") || "N/A";

    if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem(
			"loggedInUser",
			JSON.stringify({ userId, username, avatarUrl, language, email, numberOfGamesPlayed, lastSeen }
			));

        console.log("🔑 Connexion réussie avec OAuth !");
		localStorage.setItem("preferredLanguage", language);
		const avatarFileName = avatarUrl.startsWith("http") ? avatarUrl : `assets/avatars/${avatarUrl}`;
		localStorage.setItem("selectedAvatar", finalAvatar);
		loadLanguage(language);
        navigate("#/profile"); 
    } else {
        console.error("❌ Échec de la connexion OAuth");
        navigate("#/login");
    }
}

if (window.location.hash.startsWith("#/oauth-success")) {
    handleOAuthCallback();
}
