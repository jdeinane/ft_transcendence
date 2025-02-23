// CREATION D'UN USER TEST EN LOCALSTORAGE EN ATTENDANT LE BACKEND !!!

// pour voir les users enregistres dans la localstorage:
// 1. ouvrir la console dev sur le navigateur (F12)
// 2. taper la commande ` JSON.parse(localStorage.getItem("users")) `

import { navigate, updateNavigation } from "./app.js"
import { translate } from "./language.js";

function showError(elementId, message) {
	const errorElement = document.getElementById(elementId);
	if (errorElement) {
		errorElement.textContent = message;
		errorElement.classList.add("shake"); // effet secousse
		setTimeout(() => errorElement.classList.remove("shake"), 500); // enleve l'effet apres 0.5s
	}
  }

  export function createUser(username, password, email, confirmPassword) {
	if (!username || !password || !email || !confirmPassword) {
		showError("signup-error", translate("all-fields-required"));
		return;
	}

	if (password !== confirmPassword) {
		showError("signup-error", translate("passwords-no-match"));
		return;
	}

	const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
	const userExists = existingUsers.some(user => user.username == username);

	if (userExists) {
		showError("signup-error", translate("username-taken"));
		return;
	}

	const newUser = { username, password, email };
	existingUsers.push(newUser);
	localStorage.setItem("users", JSON.stringify(existingUsers));

	alert("Account succesfully created!");
	navigate("#/login");
}

export function loginUser(username, password) {
	const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
	const user = existingUsers.find(user => user.username === username && user.password === password);

	if (user) {
		localStorage.setItem("loggedInUser", JSON.stringify(user));
		navigate("/#profile");
		updateNavigation();
	} else {
		showError("login-error", "incorrect username/password!")
	}
}

export function logoutUser() {
	localStorage.removeItem("loggedInUser");
	navigate("#/");
	updateNavigation();
}

export function getCurrentUser() {
	return JSON.parse(localStorage.getItem("loggedInUser"));
}