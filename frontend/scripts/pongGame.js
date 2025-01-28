export function startPongGame(canvas) {
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
  
	// Mode de jeu (1 joueur ou 2 joueurs)
	const isSinglePlayer = true;
  
	// IA
	const aiSpeed = 2;
  
	// Contrôles des joueurs
	const keys = {
	  w: false, // Joueur 1 haut
	  s: false, // Joueur 1 bas
	  ArrowUp: false, // Joueur 2 haut
	  ArrowDown: false, // Joueur 2 bas
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
  
	  // Dessiner les scores
	  ctx.font = "20px Arial";
	  ctx.fillText(player1Score, canvas.width / 4, 20);
	  ctx.fillText(player2Score, (canvas.width * 3) / 4, 20);
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
  
	  // Déplacer les paddles
	  if (keys.w) paddle1Y -= 5;
	  if (keys.s) paddle1Y += 5;
	  if (!isSinglePlayer) {
		if (keys.ArrowUp) paddle2Y -= 5;
		if (keys.ArrowDown) paddle2Y += 5;
	  } else {
		// Mouvement de l'IA
		if (ballY < paddle2Y + paddleHeight / 2) {
		  paddle2Y -= aiSpeed;
		} else {
		  paddle2Y += aiSpeed;
		}
	  }
  
	  // Limiter les paddles aux bords
	  paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
	  paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
	}
  
	function resetBall() {
	  ballX = canvas.width / 2;
	  ballY = canvas.height / 2;
	  ballSpeedX = -ballSpeedX;
	}
  
	function gameLoop() {
	  draw();
	  update();
	  requestAnimationFrame(gameLoop);
	}
  
	// Gérer les entrées clavier
	window.addEventListener("keydown", (e) => {
	  if (e.key in keys) {
		keys[e.key] = true;
	  }
	});
  
	window.addEventListener("keyup", (e) => {
	  if (e.key in keys) {
		keys[e.key] = false;
	  }
	});
  
	// Lancer le jeu
	gameLoop();
  }
  