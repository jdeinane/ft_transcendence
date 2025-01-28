export function renderSignupForm() {
	return `
	<h1>Inscrption</h1>
	<form id="signup-form">
	   <input type="text" name="username" placeholder="Nom d'utilisateur" required />
	   <input type="email" name="email" placeholder="Email" required />
	   <input type="password" name="password" placeholder="Mot de passe" required />
	   <button type="submit">S'inscrire</button>
	</form>
	`;
}

export function renderLoginForm() {
	return `
	<h1>Connexion</h1>
	<form id="login-form">
	   <input type="text" name="username" placeholder="Nom d'utilisateur" required />
	   <input type="password" name="password" placeholder="Mot de passe" required />
	   <button type="submit">Se connecter</button>
	</form>
	`;
}

export function handleSignUp() {
	const form = document.getElementById("signup-form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(form);
		if (!validateSignupForm(data)) return;
		
		showLoader();
		try {
			const response = await fetch("/api/signup", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					username: data.get("username"),
					email: data.get("email"),
					password: data.get("password"),
				}),
			});
			const result = await response.json();
			if (response.ok) {
				alert("Inscription réussie !");
				navigate("/");
			} else {
				alert(`Erreur: ${result.message}`);
			}
		} catch (error) {
			alert("Une erreur s'est produite, veuillez réessayer.");
		} finally {
			hideLoader();
		}
	});
}

export function handleLogin() {
	const form = document.getElementById("login-form");
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const data = new FormData(form);
		showLoader();
		try {
			const response = await fetch("/api/login", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					username: data.get("username"),
					password: data.get("password"),
				}),
			});
			const result = await response.json();
			if (response.ok) {
				alert("Connexion réussie !");
				navigate("/");
			} else {
				alert(`Erreur: ${result.message}`);
			}
		} catch (error) {
			alert("Une erreur s'est produite, veuillez réessayer.");
		} finally {
			hideLoader();
		}
	});
}

function validateSignupForm(data) {
	const username = data.get("username");
	const email = data.get("email");
	const password = data.get("password");

	if (!username.trim()) {
		alert("Veuillez indiquer votre nom d'utilisateur.");
		return false;
	}

	if (!email.includes("@")) {
		alert("Email invalide !");
		return false;
	}

	if (password.length < 6) {
		alert("Le mot de passe doit contenir au moins 6 caractères.");
	}
	return true;
}

function showLoader() {
	const loader = document.createElement("div");
	loader.id = "loader";
	loader.textContent = "Chargement...";
	document.body.appendChild(loader);
}

function hideLoader() {
	const loader = document.getElementById("loader");
	if (loader) loader.remove();
}