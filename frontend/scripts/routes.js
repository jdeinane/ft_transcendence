// ROUTES: Un objet 'routes' associe chaque chemin a un contenu HTML

export const routes = {
    "/": `
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

    `,
	"/game": `
	<h1 data-translate="game-selection">GAME SELECTION</h1>
	<div class="mode-selection-container">
		<div class="mode-selection">
			<button class="mode-button" data-game="pong" data-translate="pong">Pong</button>
			<button class="mode-button" data-game="tic-tac-toe" data-translate="tic-tac-toe">Tic Tac Toe</button>
		</div>
	</div>
    `,
	"/pong": `
	<h1>PONG!</h1>
	<div class="mode-selection-container">
		<div class="mode-selection">
			<button class="mode-button" data-mode="solo" data-translate="solo">Solo Player</button>
			<button class="mode-button" data-mode="multiplayer" data-translate="multiplayer">Multiplayer</button>
			<button class="mode-button" data-mode="tournament" data-translate="tournament">Tournament</button>
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
			<button class="mode-button" data-mode="solo" data-translate="solo">Solo Player</button>
			<button class="mode-button" data-mode="multiplayer" data-translate="multiplayer">Multiplayer</button>
			<button class="mode-button" data-mode="tournament" data-translate="tournament">Tournament</button>
		</div>
		<button id="start-ttt-game" data-translate="start-ttt-game">Game start!</button>
	</div>
    <div id="tic-tac-toe-board" style="display: none;"></div>
    <button id="back-to-mode-selection" style="display: none;" data-translate="back-to-mode-selection">Back to Select Game Mode</button>
	<button id="back-to-game-selection" data-translate="back-to-game-selection">Back to Game Selection</button>
	`,
	"/tournament": `
	<h1 data-translate="tournament-mode">Tournament Mode</h1>
	<form id="tournament-form">
		<input type="text" name="player" placeholder="Enter your alias" required data-translate="enter-alias"/>
		<button type="submit" data-translate="join-tournament">Join Tournament</button>
	</form>
	<h2 data-translate="players">Players</h2>
	<ul id="player-list"></ul>
	<button id="start-tournament" disabled data-translate="start-tournament">Start Tournament</button>
	<h2 data-translate="matchmaking">Matchmaking</h2>
	<p id="current-match" data-translate="waiting-for-players">Waiting for players...</p>
	<button id="play-match" style="display: none;" data-translate="play-match">Play Match</button>
	`,
	"/login": `
	<h1 data-translate="login">login</h1>
	<form id="login-form">
		<input type="text" name="username" placeholder="Username" required data-translate="username"/>
		<input type="password" name="password" placeholder="Password" required data-translate="password"/>
		<button type="submit" data-translate="login">login</button>
	    <p id="login-error" class="error-message"></p>
	</form>
	<p data-translate="no-account">No account?
	<p><button id="go-to-signup" class="link-button" data-translate="sign-up">Sign Up</button></p>
	</p>
	`,
	"/signup": `
	<h1 data-translate="sign-up">sign up</h1>
	<form id="signup-form">
		<input type="text" name="username" placeholder="username" required data-translate="username"/>
		<input type="email" name="email" placeholder="email" required data-translate="email"/>
		<input type="password" name="password" placeholder="password" required data-translate="password"/>
		<input type="password" name="confirm-password" placeholder="confirm password" required data-translate="confirm-password"/>
		<button type="submit" data-translate="sign-up">sign up!</button>
    	<p id="signup-error" class="error-message"></p> <!-- Zone d'affichage des erreurs -->
	</form>
	`,
	"/profile": `
	<h1 data-translate="user-profile">user profile</h1>
	<p data-translate="username">username : <strong>Nom</strong><p>
	<p data-translate="number-of-games">number of games played : <strong>12</strong></p>
	<p data-translate="last-seen"> last seen : <strong>2025-01-28</strong></p>
	`,
	"/about": `
	<h1 data-translate="about">about</h1>
	<p data-translate="not-found">not your problem</p>
	`,
	"*": `
	<h1 data-translate="not-found">404 - Not Found</h1>
	<p data-translate="page-not-found">Page could not be found.</p>
	`
  };
