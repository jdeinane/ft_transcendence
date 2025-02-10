let users = [
    { username: "Alice", avatar: "assets/avatars/avatargirl1.png", blocked: false },
    { username: "Bob", avatar: "assets/avatars/avatarboy1.png", blocked: false },
    { username: "Charlie", avatar: "assets/avatars/avatargirl2.png", blocked: false }
];

let conversations = {}; //

import { routes } from "./routes.js"
import { loadLanguage, setupLanguageSelector } from "./language.js";
import { translations } from "./language.js";
import { createUser, loginUser, logoutUser, getCurrentUser } from "./user.js";
import { setupPongGame, handleModeSelection } from "./pongGame.js";
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
		const errorMessage = document.getElementById("login-error");

		form.addEventListener("submit", (e) => {
			e.preventDefault();
			const username = form.username.value;
			const password = form.password.value;
			const loginSuccess = loginUser(username, password);

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
			createUser(username, password, email);
		});
	  }

	if (cleanPath === "/profile") {
		const user = getCurrentUser();
		if (!user)
				navigate("#/login");
		else {
			setTimeout(() => {
				const avatarImg = document.getElementById("avatar-img");
				const savedAvatar = localStorage.getItem("selectedAvatar");
				if (savedAvatar) {
					avatarImg.src = savedAvatar;
				}

			const editProfileBtn = document.getElementById("edit-profile-btn");
			if (editProfileBtn) {
				editProfileBtn.addEventListener("click", () => {
					navigate("#/edit-profile");
				});
			}

			const logoutBtn = document.getElementById("logout-btn");
			if (logoutBtn) {
				logoutBtn.addEventListener("click", () => {
					logoutUser();
					updateHeaderAvatar();
					navigate("#/");
				});
			}
		}, 50); 
	}
}
	  
	if (cleanPath === "/edit-profile") {
		const avatarImg = document.getElementById("avatar-img");
		const avatarOptions = document.querySelectorAll(".avatar-option");
		const saveAvatarBtn = document.getElementById("save-avatar-btn");
		const cancelEditBtn = document.getElementById("cancel-edit-btn");
	
		const savedAvatar = localStorage.getItem("selectedAvatar");
		if (savedAvatar) {
			avatarImg.src = savedAvatar;
		}
	
		avatarOptions.forEach(avatar => {
			avatar.addEventListener("click", () => {
				avatarOptions.forEach(a => a.classList.remove("selected"));
				avatar.classList.add("selected");
				avatarImg.src = avatar.src;
			});
		});
	
		saveAvatarBtn.addEventListener("click", () => {
			const selectedAvatar = avatarImg.src;
			localStorage.setItem("selectedAvatar", selectedAvatar);
			
			updateHeaderAvatar(); // Met à jour l'avatar dans le header
			navigate("#/profile"); // Retour au profil après sauvegarde
		});
		
	
		cancelEditBtn.addEventListener("click", () => {
			navigate("#/profile");
		});
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
		handleModeSelection();
	}


	if (cleanPath === "/tic-tac-toe") {
		setupTicTacToeGame();
		handleModeSelection();
	}

	if (cleanPath === "/tournament") {
		setupTournament();
	}

	if (cleanPath === "/livechat") {
		const chatMessages = document.getElementById("chat-messages");
		const messageInput = document.getElementById("message-input");
		const sendMessageBtn = document.getElementById("send-message-btn");
		const userList = document.getElementById("user-list");
	
		let selectedUser = null;
	
		function renderUserList() {
			userList.innerHTML = "";
			users.forEach(user => {
				if (!user.blocked) {
					const li = document.createElement("li");
					li.innerHTML = `<img src="${user.avatar}" /> ${user.username}`;
					li.addEventListener("click", () => openChat(user.username));
					userList.appendChild(li);
				}
			});
		}
	
		function openChat(username) {
			selectedUser = username;
			chatMessages.innerHTML = "";
			if (conversations[username]) {
				conversations[username].forEach(msg => {
					addMessage(msg.text, msg.sender);
				});
			}
		}
	
		function addMessage(text, sender) {
			const messageElement = document.createElement("div");
			messageElement.classList.add("chat-message", sender);
			messageElement.textContent = text;
			chatMessages.appendChild(messageElement);
			chatMessages.scrollTop = chatMessages.scrollHeight;
	
			if (!conversations[selectedUser]) {
				conversations[selectedUser] = [];
			}
			conversations[selectedUser].push({ text, sender });
		}
	
		sendMessageBtn.addEventListener("click", () => {
			const message = messageInput.value.trim();
			if (message !== "" && selectedUser) {
				addMessage(message, "user");
				messageInput.value = "";
	
				setTimeout(() => {
					addMessage("This is a simulated response.", "bot");
				}, 1000);
			}
		});
	
		messageInput.addEventListener("keypress", (e) => {
			if (e.key === "Enter")
				sendMessageBtn.click();
		});
	
		renderUserList();
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
