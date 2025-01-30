// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

export const routes = {
	"/": `
	<h1 class="welcome-title">welcome to ft_transcendence</h1>
	<button id="play-now"> play now</button>
	`,
	"/game": `
	<h1>PONG!</h1>
	<div id="mode-selection-container">
		<div class="mode-selection">
		<button class="mode-button" data-mode="solo">Solo Player</button>
		<button class="mode-button" data-mode="multiplayer">Multiplayer</button>
		<button class="mode-button" data-mode="tournament">Tournament</button>
		</div>
		<button id="start-game">Game Start!</button>
	</div>
	<canvas id="pong" width="800" height="400" style="border:1px solid #000; display: none;"></canvas>
	<button id="back-to-mode-selection" style="display: none;">Back to Select Game Mode</button>
	`,
	"/login": `
	  <h1>login</h1>
	  <form id="login-form">
		<input type="text" name="username" placeholder="Username" required />
		<input type="password" name="password" placeholder="Password" required />
		<button type="submit">login</button>
	    <p id="login-error" class="error-message"></p> <!-- Zone d'affichage des erreurs -->
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
    	<p id="signup-error" class="error-message"></p> <!-- Zone d'affichage des erreurs -->
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
