// CREATION D'UN USER TEST EN LOCALSTORAGE EN ATTENDANT LE BACKEND !!!

// pour voir les users enregistres dans la localstorage:
// 1. ouvrir la console dev sur le navigateur (F12)
// 2. taper la commande ` JSON.parse(localStorage.getItem("users")) `

import { navigate } from "./app.js"

export function createUser(username, password, email) {
	if (!username || !password || !email) {
		alert("all fields are required !");
		return;
	}

	const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
	const userExists = existingUsers.some(user => user.username == username);

	if (userExists) {
		alert("username already taken");
		return;
	}

	const newUser = { username, password, email };
	existingUsers.push(newUser);
	localStorage.setItem("users", JSON.stringify(existingUsers));

	alert("account succesfully created!");
	navigate("#/login");
}

export function loginUser(username, password) {
	const existingUsers = JSON.parse(localStorage.getItem("users")) || [];
	const user = existingUsers.find(user => user.username === username && user.password === password);

	if (user) {
		alert("you are now logged in!");
		localStorage.setItem("loggedInUser", JSON.stringify(user));
		navigate("/#profile");
	} else {
		alert("incorrect username/password!")
	}
}

export function logoutUser() {
	localStorage.removeItem("loggedInUser");
	alert("you are now logged out!");
	navigate("#/");
}

export function getCurrentUser() {
	return JSON.parse(localStorage.getItem("loggedInUser"));
}