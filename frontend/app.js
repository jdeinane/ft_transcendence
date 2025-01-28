// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

const routes = {
	"/": "<h1>Bienvenue sur ft_transcendence</h1>",
	"/login": `
	  <h1>Connexion</h1>
	  <form id="login-form">
		<input type="text" name="username" placeholder="Nom d'utilisateur" required />
		<input type="password" name="password" placeholder="Mot de passe" required />
		<button type="submit">Se connecter</button>
	  </form>
	`,
	"/profile": "<h1>Profil utilisateur</h1>"
  };


// CNAVIGATION: Change dynamiquement le contenu de la page en fonction de la route

function navigate(path) {
	const app = document.getElementById("app");
	app.innerHTML = routes[path] || "<h1>Page non trouvée</h1>";
	window.history.pushState({}, "", path); // Met a jour l'URL sans recharger la page

	if (path == "/login") {
		const form = document.getElementById("login-form");
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			const data = new FormData(form);
			console.log("Nom d'utilisateur :", data.get("username"));
			console.log("Mot de passe :", data.get("password"));
		});
	}
}


// FORMULAIRE DE CONNEXION: Lorsqu'il est soumis, il affiche les valeurs saisies dans la console
document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", (e) => {
	  if (e.target.matches("[data-link]")) {
		e.preventDefault();
		navigate(e.target.getAttribute("href"));
	  }
	});
	navigate(window.location.pathname);
  });		
// Exemple basique, ces donnees seront envoyees au backend via une API
  