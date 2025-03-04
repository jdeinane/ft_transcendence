// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

export const routes = {
    "/": `
	<div class="home-container">
		<h1 id ="welcome-message" data-translate="welcome">Welcome to ft_transcendence</h1>
		<div class="decorations">
			<div class="clock-container">
				<canvas id="clockCanvas" width="400" height="400"></canvas>
			</div>
			<div class="calendar-container">
				<canvas id="calendarCanvas" width="300" height="400"></canvas>
			</div>
		</div>

		<div class="widgets-container">
			<div id="game-widget">
				<img src="assets/icons/game.png" alt="Game Icon" class="game-icon">
				<div class="game-info">
				<p class="game-title" data-translate="game-title">Play Games</p>
				<p class="game-subtitle" data-translate="game-subtitle">Pong & Tic-Tac-Toe</p>
			</div>
		</div>

		<div class="bottom-widgets">
			<div id="chat-widget">
				<img src="assets/icons/chat.png" alt="Chat Icon" class="chat-icon">
				<div class="chat-info">
					<p class="chat-title" data-translate="chat-title">Live Chat</p>
					<p class="chat-subtitle" data-translate="chat-subtitle">Join the conversation</p>
				</div>
			</div>

				<div id="leaderboard-widget">
					<img src="assets/icons/leaderboard.png" alt="leaderboard Icon" class="leaderboard-icon">
					<div class="leaderboard-info">
						<p class="leaderboard-title" data-translate="leaderboard-title">Rank</p>
						<p class="leaderboard-subtitle" data-translate="leaderboard-subtitle">View stats & matches</p>
					</div>
				</div>
			</div>
		</div>
	</div>
    `,

	"/game": `
	<h1 data-translate="game-selection">Choose your battle!</h1>
	<p class="game-description" data-translate="game-description">Select a game to begin your adventure.</p>
	<div class="mode-selection-container">
		<div class="mode-selection">
		<button class="mode-button" data-game="pong">
			<img src="assets/icons/pong.png" alt="Pong Icon">
			Pong
		</button>

		<button class="mode-button" data-game="tic-tac-toe">
			<img src="assets/icons/tic-tac-toe.png" alt="Tic Tac Toe Icon">
			Tic Tac Toe
		</button>		
		</div>
	</div>
	
    `,

	"/pong": `
	<h1>PONG!</h1>
	<div class="mode-selection-container">
		<div class="mode-selection">
			<button class="mode-button" data-translate="solo" data-mode="solo"></button>
			<button class="mode-button" data-translate="multiplayer" data-mode="multiplayer"></button>
			<button class="mode-button" data-translate="tournament" data-mode="tournament"></button>
		</div>

		<div id="player-selection" class="hidden">
			<p class="select-number" data-translate="select-number">Select number of players:</p>
			<button class="player-count-button" data-players="2"> 2 </button>
			<button class="player-count-button" data-players="3"> 3 </button>
			<button class="player-count-button" data-players="4"> 4 </button>
		</div>

		<button id="start-game" data-translate="start-game">Game start!</button>
	</div>

    <canvas id="pong" width="800" height="400" style="border:1px solid #000; display: none;"></canvas>
    <button id="back-to-mode-selection" style="display: none;" data-translate="back-to-mode-selection">Back to Select Game Mode</button>
	<button id="back-to-game-selection" data-translate="back-to-game-selection">Back to Game Selection</button>
	`,

	"/tic-tac-toe":`
	<h1>TIC TAC TOE!</h1>
	<div class="mode-selection-container">
		<div class="mode-selection">
			<button class="mode-button" data-translate="solo" data-mode="solo"></button>
			<button class="mode-button" data-translate="multiplayer" data-mode="multiplayer"></button>
			<button class="mode-button" data-translate="tournament" data-mode="tournament"></button>
		</div>
		<button id="start-ttt-game" data-translate="start-ttt-game">Game start!</button>
	</div>
    <div id="tic-tac-toe-board" style="display: none;"></div>
    <button id="back-to-mode-selection" style="display: none;" data-translate="back-to-mode-selection">Back to Select Game Mode</button>
	<button id="back-to-game-selection" data-translate="back-to-game-selection">Back to Game Selection</button>
	`,

	"/tournament": `
		<h1 data-translate="tournament-title">🏆 Pong</h1>
		<div id="tournament-container">
			<div id="tournament-setup">
				<input type="text" id="tournament-player-name" placeholder="Enter alias" data-translate="tournament-placeholder">
				<button id="join-tournament" data-translate="join-button">Join</button>
			</div>

			<div id="players-list-container">
				<h2 data-translate="players-title"> Players: </h2>
				<ul id="players-list"></ul>
			</div>

			<div id="bracket-container" class="hidden">
				<h2 data-translate="bracket-title">Bracket</h2>
				<div id="bracket"></div>
				<button id="start-next-match" class="hidden" data-translate="start-match-button">Start next match!</button>
			</div>

			<div id="pong-container" class="hidden"></div>
		</div>
	`,

	"/tic-tac-toe-tournament": `
		<h1 data-translate="tournament-title">🏆 Tic-Tac-Toe Tournament</h1>
		<div id="tournament-container">
			<div id="tournament-setup">
				<input type="text" id="tournament-player-name" placeholder="Enter alias" data-translate="tournament-placeholder">
				<button id="join-ttt-tournament" data-translate="join-button">Join</button>
			</div>

			<div id="players-list-container">
				<h2 data-translate="players-title"> Players: </h2>
				<ul id="players-list"></ul>
			</div>

			<div id="bracket-container" class="hidden">
				<h2 data-translate="bracket-title">Bracket</h2>
				<div id="bracket"></div>
				<button id="start-next-ttt-match" class="hidden" data-translate="start-match-button">Start next match!</button>
			</div>

			<div id="ttt-container" class="hidden">
				<div id="tic-tac-toe-board"></div>
			</div>
		</div>
	`,

	"/results": `
		<div class="results-container">
			<h1 data-translate="results-title"> Tournament Final Ranking</h1>
			<ol id="ranking-list"></ol>
			<button id="back-to-home" data-translate="back-home-button"> Back to Home</button>
		</div>
	`,

	"/login": `
	<div class="login-container">
		<div class="login-box">
			<h1 class="login-title" data-translate="login">Login</h1>
				<form id="login-form" class="login-form"> <!-- Ajout de id ici -->
					<input type="text" name="username" placeholder="Username" required data-translate="username">
					<input type="password" name="password" placeholder="Password" required data-translate="password">
					<button type="submit" data-translate="login">Login</button>
					<p id="login-error" class="error-message"></p>
			</form>
			<button class="oauth-42-btn" data-translate="oauth-42-btn" onclick="window.location.href='https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-909db2fd934587c7acecac5dab184a8690b3b53de09c75d5470664a4c766c572&redirect_uri=http://localhost:4000/api/auth/42/callback/&response_type=code'">
				<img src="assets/icons/42.png" alt="42 Logo"> Login with 42
			</button>
		</div>
	<p class="no-account-text" data-translate="no-account">No account?</p>
	<p><button id="go-to-signup" class="link-button" data-translate="sign-up">Sign Up</button></p>
	</div>
	`,

	"/signup": `
		<div class="signup-container">
			<div class="signup-box">
				<h1 class="signup-title" data-translate="sign-up">Sign up</h1>
				<form class="signup-form" id="signup-form">
					<input type="text" name="username" placeholder="Username" required data-translate="username"/>
					<input type="email" name="email" placeholder="Email" required data-translate="email"/>
					<input type="password" name="password" placeholder="Password" required data-translate="password"/>
					<input type="password" name="confirm-password" placeholder="Confirm Password" required data-translate="confirm-password"/>
					<button type="submit" class="signup-button" data-translate="sign-up">Sign up!</button>
					<p id="signup-error" class="error-message"></p>
				</form>
			</div>
		</div>
	`,

	"/profile": `
		<div class="profile-container">
			<h1 data-translate="user-profile">User Profile</h1>
			<div class="profile-info">
				<img id="avatar-img" src="assets/avatars/avataralien.png" alt="User Avatar">
				<p><strong data-translate="username">Username:</strong> <span id="profile-username">Loading...</span></p>
				<p><strong data-translate="email">Email:</strong> <span id="profile-email">Loading...</span></p>
				<p><strong data-translate="number-of-games">Games Played:</strong> <span id="profile-games">0</span></p>
				<p><strong data-translate="last-seen">Last Seen:</strong> <span id="profile-last-seen">N/A</span></p>
			</div>

        	<button id="view-match-history" data-translate="view-match-history"> View Match History</button>

			<div class="profile-buttons">
				<button id="edit-profile-btn" data-translate="edit-profile">Edit Profile</button>
				<button id="logout-btn" data-translate="logout">Logout</button>
			</div>
		</div>
	`,

	"/match-history": `
		<div class="match-history-page">
			<h1 data-translate="match-history">Match History</h1>
			<div id="match-history">
				<p data-translate="loading">Loading match history...</p>
			</div>
			<button id="back-to-profile" data-translate="back-to-profile" class="back-button">Back</button>
		</div>
	`,

	"/edit-profile": `
		<div class="edit-profile-container">
			<h1 data-translate="edit-profile">Edit Profile</h1>
			<img id="avatar-img" src="assets/avatars/avatar1.png" alt="User Avatar">
			<p data-translate="select-avatar">Select an avatar:</p>
			<div id="avatar-selection">
				<img class="avatar-option" src="assets/avatars/avatargirl1.png" alt="Avatar 1">
				<img class="avatar-option" src="assets/avatars/avatarboy1.png" alt="Avatar 2">
				<img class="avatar-option" src="assets/avatars/avatargirl2.png" alt="Avatar 3">
				<img class="avatar-option" src="assets/avatars/avatarboy2.png" alt="Avatar 4">
				<img class="avatar-option" src="assets/avatars/avataralien.png" alt="Avatar 5">
			</div>

			<label for="language-select" data-translate="select-language">Choose your language:</label>
			<select id="language-select">
				<option value="en" data-translate="english">English</option>
				<option value="fr" data-translate="french">Français</option>
				<option value="es" data-translate="spanish">Español</option>
			</select>

		<button id="save-language-btn" data-translate="save-language">Save Language</button>

			<button id="activate-2fa-btn" data-translate="activate-2fa-btn" onclick="enable2FA()" style="display: none;">Activate 2FA</button>
			<button id="deactivate-2fa-btn" data-translate="deactivate-2fa-btn" onclick="disable2FA()" style="display: none;">Deactivate 2FA</button>
			<button id="save-avatar-btn" data-translate="save-avatar">Save Avatar</button>
			<button id="cancel-edit-btn" data-translate="cancel">Cancel</button>
		</div>
		<script>waitFor2FAButtons();</script>		
	`,

	"/about": `
		<h1 data-translate="about">about</h1>
		<p data-translate="not-found">not your problem</p>
	`,

	"/leaderboard": `
	    <div class="leaderboard-container">
        <h1 data-translate="leaderboard-title">🏆 Player Leaderboard</h1>
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th data-translate="rank">Rank</th>
                    <th data-translate="player-name">Player</th>
                    <th data-translate="wins">Score</th>
                </tr>
            </thead>
            <tbody id="leaderboard-list"></tbody>
        </table>
        <button id="back-to-home" data-translate="back-home-button">Back to Home</button>
    </div>
	`,

	"*": `
	<h1 data-translate="not-found">404 - Not Found</h1>
	<p data-translate="page-not-found">Page could not be found.</p>
	`,

	"/oauth-success": `
			<h1>Connexion réussie !</h1>
			<p>Redirection en cours...</p>
			<script>
				setTimeout(() => {
					const hashParams = new URLSearchParams(window.location.hash.split("?")[1]);
					const accessToken = hashParams.get("access_token");
					const userId = hashParams.get("user_id");
					const username = hashParams.get("username");
					const avatarUrl = hashParams.get("avatar_url");

					if (accessToken && userId) {
						localStorage.setItem("access_token", accessToken);
						localStorage.setItem("loggedInUser", JSON.stringify({ id: userId, username, avatar_url: avatarUrl }));
						console.log("✅ Connexion avec 42 réussie !");
						window.location.href = "#/profile"; // Rediriger vers le profil
					} else {
						alert("❌ Échec de la connexion avec 42.");
						window.location.href = "#/login";
					}
				}, 500); // Petit délai pour garantir la récupération des données
			</script>
`,

};
