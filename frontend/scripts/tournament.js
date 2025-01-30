export function startPongTournament(canvas, player1Name, player2Name, onMatchEnd) {
	const ctx = canvas.getContext("2d");

	// Variables du jeu
	let ballX = canvas.width / 2;
	let ballY = canvas.height / 2;
	let ballSpeedX = 3;
	let ballSpeedY = 3;

	const paddleHeight = 100;
	const paddleWidth = 10;

	// Positions des paddles
	let paddle1Y = canvas.height / 2 - paddleHeight / 2;
	let paddle2Y = canvas.height / 2 - paddleHeight / 2;

	// Scores
	let player1Score = 0;
	let player2Score = 0;
	const winningScore = 3; // Nombre de points pour gagner le match

	// Contrôles des joueurs
	const keys = {
	  w: false, // Joueur 1 haut
	  s: false, // Joueur 1 bas
	  i: false, // Joueur 2 haut
	  k: false, // Joueur 2 bas
	};

	function draw() {
	  // Effacer le canvas
	  ctx.clearRect(0, 0, canvas.width, canvas.height);

	  // Dessiner le terrain
	  ctx.fillStyle = "lightgray";
	  ctx.fillRect(0, 0, canvas.width, canvas.height);

	  // Dessiner la balle
	  ctx.beginPath();
	  ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
	  ctx.fillStyle = "black";
	  ctx.fill();
	  ctx.closePath();

	  // Dessiner les paddles
	  ctx.fillStyle = "black";
	  ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
	  ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

	  // Afficher les noms des joueurs et scores
	  ctx.font = "20px Arial";
	  ctx.fillStyle = "black";
	  ctx.fillText(`${player1Name}: ${player1Score}`, canvas.width / 4, 20);
	  ctx.fillText(`${player2Name}: ${player2Score}`, (canvas.width * 3) / 4, 20);
	}

	function update() {
	  // Déplacer la balle
	  ballX += ballSpeedX;
	  ballY += ballSpeedY;

	  // Collision avec les murs (haut/bas)
	  if (ballY <= 0 || ballY >= canvas.height) {
		ballSpeedY = -ballSpeedY;
	  }

	  // Collision avec les paddles
	  if (
		ballX <= paddleWidth &&
		ballY >= paddle1Y &&
		ballY <= paddle1Y + paddleHeight
	  ) {
		ballSpeedX = -ballSpeedX;
	  }

	  if (
		ballX >= canvas.width - paddleWidth &&
		ballY >= paddle2Y &&
		ballY <= paddle2Y + paddleHeight
	  ) {
		ballSpeedX = -ballSpeedX;
	  }

	  // Balles sorties (scores)
	  if (ballX <= 0) {
		player2Score++;
		resetBall();
	  } else if (ballX >= canvas.width) {
		player1Score++;
		resetBall();
	  }

	  // Vérifier si un joueur a gagné
	  if (player1Score >= winningScore || player2Score >= winningScore) {
		endMatch();
	  }

	  // Déplacer le paddle 1
	  if (keys.w) paddle1Y -= 5;
	  if (keys.s) paddle1Y += 5;

	  // Déplacer le paddle 2
	  if (keys.i) paddle2Y -= 5;
	  if (keys.k) paddle2Y += 5;

	  // Limiter les paddles aux bords
	  paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
	  paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
	}

	function resetBall() {
	  ballX = canvas.width / 2;
	  ballY = canvas.height / 2;
	  ballSpeedX = -ballSpeedX;
	}

	function endMatch() {
	  let winner = player1Score > player2Score ? player1Name : player2Name;
	  alert(`${winner} wins the match!`);
	  onMatchEnd(winner); // Callback pour retourner au tournoi
	}

	function gameLoop() {
	  draw();
	  update();
	  requestAnimationFrame(gameLoop);
	}

	// Gérer les entrées clavier
	window.addEventListener("keydown", (e) => {
	  const key = e.key.toLowerCase();
	  if (key in keys) {
		keys[key] = true;
	  }
	});

	window.addEventListener("keyup", (e) => {
	  const key = e.key.toLowerCase();
	  if (key in keys) {
		keys[key] = false;
	  }
	});

	// Lancer le jeu
	gameLoop();
}
