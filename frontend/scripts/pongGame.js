import { navigate } from "./app.js"

export function setupPongGame() {
	let selectedMode = "solo";
	let playerCount = 2;
	const canvas = document.getElementById("pong");
	const startButton = document.getElementById("start-game");
	const backButton = document.getElementById("back-to-mode-selection");
	const gameSelectionButton = document.getElementById("back-to-game-selection");
	const modeSelectionContainer = document.querySelector(".mode-selection-container");
	const multiplayerButton = document.getElementById("multiplayer-btn");
	const playerSelection = document.getElementById("player-selection");

    document.querySelectorAll(".mode-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("active-mode"));
            button.classList.add("active-mode");
            selectedMode = button.dataset.mode;

			if (selectedMode == "multiplayer")
				playerSelection.classList.remove("hidden");
			else
				playerSelection.classList.add("hidden");
        });
    });

	document.querySelectorAll(".player-count-button").forEach(button => {
		button.addEventListener("click", () => {
			playerCount = parseInt(button.dataset.players);
		});
	});

    startButton.addEventListener("click", () => {
        if (selectedMode === "tournament") {
            navigate("#/tournament");
            return;
        }

        modeSelectionContainer.style.display = "none";
        canvas.style.display = "block";
        backButton.style.display = "block";

        const isSinglePlayer = selectedMode === "solo";
        startPongGame(canvas, isSinglePlayer, playerCount);
    });

    backButton.addEventListener("click", () => {
        canvas.style.display = "none";
        backButton.style.display = "none";
        modeSelectionContainer.style.display = "block";
    });

    gameSelectionButton.addEventListener("click", () => {
        navigate("#/game");
    });
}


function startPongGame(canvas, isSinglePlayer) {
	const ctx = canvas.getContext("2d");
  
	let ballX = canvas.width / 2;
	let ballY = canvas.height / 2;
	let ballSpeedX = 3;
	let ballSpeedY = 3;
  
	const paddleHeight = 100;
	const paddleWidth = 10;
  
	let paddle1Y = canvas.height / 2 - paddleHeight / 2;
	let paddle2Y = canvas.height / 2 - paddleHeight / 2;
  
	let player1Score = 0;
	let player2Score = 0;
  
	const aiSpeed = 2;
  
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
	  ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight); // Paddle joueur 1
	  ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight); // Paddle joueur 2
  
	  // Dessiner les scores
	  ctx.font = "20px Arial";
	  ctx.fillStyle = "black";
	  ctx.fillText(player1Score, canvas.width / 4, 20); // Score joueur 1
	  ctx.fillText(player2Score, (canvas.width * 3) / 4, 20); // Score joueur 2
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
  
	  // Déplacer le paddle 1
	  if (keys.w) paddle1Y -= 5;
	  if (keys.s) paddle1Y += 5;
  
	  if (!isSinglePlayer) {
		// Mode 2 joueurs : Déplacer le paddle 2 avec I et K
		if (keys.i) paddle2Y -= 5;
		if (keys.k) paddle2Y += 5;
	  } else {
		// Mode 1 joueur : IA pour le paddle 2
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
	  const key = e.key.toLowerCase(); // Normaliser en minuscule
	  if (key in keys) {
		keys[key] = true;
	  }
	});
  
	window.addEventListener("keyup", (e) => {
	  const key = e.key.toLowerCase(); // Normaliser en minuscule
	  if (key in keys) {
		keys[key] = false;
	  }
	});
  
	gameLoop();
  }

// UTILS POUR L'EFFET "BOUTTON APPUYE"

  export function handleModeSelection() {
    setTimeout(() => { 
        const modeButtons = document.querySelectorAll(".mode-button");

        const savedMode = localStorage.getItem("selectedMode");
        if (savedMode) {
            modeButtons.forEach(btn => {
                if (btn.dataset.mode === savedMode) {
                    btn.classList.add("active");
                }
            });
        }

        modeButtons.forEach(button => {
            button.addEventListener("click", () => {
                modeButtons.forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                
                localStorage.setItem("selectedMode", button.dataset.mode);
            });
        });
    }, 50);
}