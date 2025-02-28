import { navigate } from "./app.js"
import { logoutUser, refreshToken } from "./user.js";

export function setupPongGame() {
	let selectedMode = "solo";
	let playerCount = 2;
	const canvas = document.getElementById("pong");
	const startButton = document.getElementById("start-game");
	const backButton = document.getElementById("back-to-mode-selection");
	const gameSelectionButton = document.getElementById("back-to-game-selection");
	const modeSelectionContainer = document.querySelector(".mode-selection-container");
	const playerSelection = document.getElementById("player-selection");

    document.querySelectorAll(".mode-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("active-mode"));
            button.classList.add("active-mode");
            selectedMode = button.dataset.mode;

			if (selectedMode == "multiplayer")
				playerSelection.classList.remove("hidden");
			else {
				playerSelection.classList.add("hidden");
				playerCount = 2;
			}
        });
    });

	document.querySelectorAll(".player-count-button").forEach(button => {
		button.addEventListener("click", () => {
			playerCount = parseInt(button.dataset.players);

			document.querySelectorAll(".player-count-button").forEach(btn => btn.classList.remove("active"));
			button.classList.add("active");
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


export function startPongGame(canvas, isSinglePlayer, playerCount) {
	const ctx = canvas.getContext("2d");

	let ballX = canvas.width / 2;
	let ballY = canvas.height / 2;
	let ballSpeedX = 3;
	let ballSpeedY = 3;
  
	const paddleHeight = 100;
	const paddleWidth = 10;

	const paddleHorizontalWidth = 150;
	const paddleHorizontalHeight = 10;

	let paddle1Y = canvas.height / 2 - paddleHeight / 2;
	let paddle2Y = canvas.height / 2 - paddleHeight / 2;

	let paddle3X = canvas.width / 2 - paddleHeight / 2;
	let paddle4X = canvas.width / 2 - paddleHeight / 2;
	let paddle3Y = 0;
	let paddle4Y = canvas.height - paddleWidth;
	

	let player1Score = 0;
	let player2Score = 0;
	let player3Score = 0;
	let player4Score = 0;
  
	const aiSpeed = 2;
  
	const keys = {
	  w: false,
	  s: false,

	  i: false,
	  k: false,

	  r: false,
	  t: false,

	  n: false,
	  m: false,
	};
  
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		ctx.fillStyle = "lightgray";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	
		ctx.beginPath();
		ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
		ctx.fillStyle = "black";
		ctx.fill();
		ctx.closePath();
		
		ctx.font = "bold 30px NintendoDS";
		ctx.lineWidth = 4;

		// score joueur 1
		ctx.fillStyle = "red";
		ctx.fillText(player1Score, 20, canvas.height - 20);

		// score joueur 2
		ctx.fillStyle = "blue";
		ctx.textAlign = "right";
		ctx.fillText(player2Score, canvas.width - 20, 30);

		// score joueur 3 et 4
		if (playerCount >= 3) {
			ctx.fillStyle = "green";
			ctx.textAlign = "left";
			ctx.fillText(player3Score, 20, 30);
		}
		if (playerCount === 4) {
			ctx.fillStyle = "yellow";
			ctx.textAlign = "right";
			ctx.fillText(player4Score, canvas.width - 20, canvas.height - 20);
		}
		
		ctx.fillStyle = "black";
		ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
		ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight); // Paddle joueur 2


		if (playerCount >= 3)
			ctx.fillRect(paddle3X, paddle3Y, paddleHorizontalWidth, paddleHorizontalHeight);
		if (playerCount === 4)
			ctx.fillRect(paddle4X, paddle4Y, paddleHorizontalWidth, paddleHorizontalHeight);
		}
		

	function awardPoints(loser) {
		if (loser !== 1) player1Score++;  
		if (loser !== 2) player2Score++;
		if (playerCount >= 3 && loser !== 3) player3Score++;
		if (playerCount === 4 && loser !== 4) player4Score++;
	}
	
	async function update() {
		ballX += ballSpeedX;
		ballY += ballSpeedY;
	
		if (ballY <= 0 || ballY >= canvas.height) {
			ballSpeedY = -ballSpeedY;
		}
	
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
	
		if (ballX <= 0) {
			player2Score++;
			resetBall();
		} else if (ballX >= canvas.width) {
			player1Score++;
			resetBall();
		}
			
		if (playerCount >= 3 && ballY <= 0) {
			awardPoints(3);
			resetBall();
		}
		if (playerCount === 4 && ballY >= canvas.height) {
			awardPoints(4);
			resetBall();
		}
			
		if (playerCount >= 3 && 
			ballY <= paddleWidth && 
			ballX >= paddle3X && 
			ballX <= paddle3X + paddleHeight) {
			ballSpeedY = Math.abs(ballSpeedY);
		}

		if (playerCount === 4 && 
			ballY >= canvas.height - paddleWidth && 
			ballX >= paddle4X && 
			ballX <= paddle4X + paddleHeight) {
			ballSpeedY = -Math.abs(ballSpeedY);
		}


		if (keys.w) paddle1Y -= 5;
		if (keys.s) paddle1Y += 5;
	
		if (!isSinglePlayer) {
			if (keys.i) paddle2Y -= 5;
			if (keys.k) paddle2Y += 5;
		} else {
			const aiMove = await fetchAIMove(ballY, paddle2Y, Math.abs(ballSpeedY), "medium");
			paddle2Y += aiMove * 2;
			}
		
		if (playerCount >= 3) {
			if (keys.r)
				paddle3X -= 5;
			if (keys.t)
				paddle3X += 5;
		}
		if (playerCount === 4) {
			if (keys.n)
				paddle4X -= 5;
			if (keys.m) 
				paddle4X += 5;
		}
		
		paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
		paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
		if (playerCount >= 3) {
			paddle3X = Math.max(0, Math.min(canvas.width - paddleHorizontalWidth, paddle3X));
		}
		if (playerCount === 4) {
			paddle4X = Math.max(0, Math.min(canvas.width - paddleHorizontalWidth, paddle4X));
		}
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
  
	window.addEventListener("keydown", (e) => {
	  const key = e.key.toLowerCase(); // normaliser en minuscule
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

		const playerButtons = document.querySelectorAll(".player-count-button");

		const savedPlayers = localStorage.getItem("selectedPlayers");
		if (savedPlayers) {
			playerButtons.forEach(btn => {
				if (btn.dataset.players === savedPlayers)
					btn.classList.add("active");
			});
		}

		playerButtons.forEach(button => {
			button.addEventListener("click", () => {
				playerButtons.forEach(btn => btn.classList.remove("active"));
				button.classList.add("active");

				localStorage.setItem("selectedPlayers", button.dataset.players);
			});
		});
    }, 50);
}

/////////// TOURNAMENT VERSION
let gameOver = false;

export function startTournamentPongGame(player1, player2, onGameEnd) {

	resetGame();

    const gameContainer = document.getElementById("pong-container");
    gameContainer.innerHTML = `
        <h2>🏆${player1} 🆚 ${player2}</h2>
        <canvas id="pong" width="800" height="400"></canvas>
    `;

    gameContainer.classList.remove("hidden");

    startTournamentGameLogic(player1, player2, onGameEnd);
}

function resetGame() {
    gameOver = false;
	const gameContainer = document.getElementById("pong-container");
	gameContainer.innerHTML = "";
}

function startTournamentGameLogic(player1, player2, onGameEnd) {
    const canvas = document.getElementById("pong");
    const ctx = canvas.getContext("2d");

    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 4.5;
    let ballSpeedY = 4.5;

    const paddleHeight = 100;
    const paddleWidth = 10;
    const paddleSpeed = 7;

    let paddle1Y = canvas.height / 2 - paddleHeight / 2;
    let paddle2Y = canvas.height / 2 - paddleHeight / 2;

    let player1Score = 0;
    let player2Score = 0;
    const winningScore = 2;

    let keysPressed = { w: false, s: false, i: false, k: false };

    window.addEventListener("keydown", (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = true;
    });

    window.addEventListener("keyup", (event) => {
        if (event.key in keysPressed) keysPressed[event.key] = false;
    });

    function draw() {
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.fillRect(0, paddle1Y, paddleWidth, paddleHeight);
        ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

        ctx.beginPath();
        ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
        ctx.fillStyle = "red";
		ctx.fill();
        ctx.closePath();

        ctx.font = "30px NintendoDS";
        ctx.fillStyle = "white";
        ctx.fillText(`${player1}: ${player1Score}`, 50, 50);
        ctx.fillText(`${player2}: ${player2Score}`, canvas.width - 200, 50);
    }

    function update() {
        if (gameOver) return;

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (keysPressed.w) paddle1Y -= paddleSpeed;
        if (keysPressed.s) paddle1Y += paddleSpeed;
        if (keysPressed.i) paddle2Y -= paddleSpeed;
        if (keysPressed.k) paddle2Y += paddleSpeed;

        paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
        paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));

        if (ballY <= 0 || ballY >= canvas.height) {
            ballSpeedY = -ballSpeedY;
        }

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

        if (ballX <= 0) {
            player2Score++;
            resetBall();
        } else if (ballX >= canvas.width) {
            player1Score++;
            resetBall();
        }

        if (player1Score >= winningScore) {
            announceWinner(player1);
        } else if (player2Score >= winningScore) {
            announceWinner(player2);
        }
    }

    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = Math.sign(ballSpeedX) * 5;
        ballSpeedY = Math.sign(ballSpeedY) * 5;
    }

    function gameLoop() {
        draw();
        update();
        if (!gameOver) requestAnimationFrame(gameLoop);
    }

	function announceWinner(winner) {
		if (gameOver) return;
		gameOver = true;
	
		alert(`🏆 ${winner} wins !`);
	
		setTimeout(() => {
			document.getElementById("pong-container").classList.add("hidden");
			onGameEnd(winner);  // Passe au prochain match
		}, 500);  // Ajoute une petite pause pour éviter les conflits d'affichage
	}
	
    gameLoop();
}

async function fetchAIMove(ballY, paddleY, difficulty = "medium") {
    let token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Aucun token JWT trouvé. Impossible d'appeler l'IA du backend.");
        logoutUser();
        return 0;
    }

    try {
        let response = await fetch("http://127.0.0.1:4000/api/game/ai-move/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ball_position: ballY,
                paddle_position: paddleY,
                difficulty: difficulty
            })
        });

        if (response.status === 401) {  
            console.warn("🔄 Token expiré, tentative de rafraîchissement...");

            const refreshed = await refreshToken();

            if (!refreshed) {
                console.error("🔴 Impossible de rafraîchir le token, déconnexion...");
                logoutUser();
                return 0;
            }

            token = localStorage.getItem("access_token");
            response = await fetch("http://127.0.0.1:4000/api/game/ai-move/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    ball_position: ballY,
                    paddle_position: paddleY,
                    difficulty: difficulty
                })
            });
        }

        if (!response.ok) {
            console.error(`❌ Erreur API IA (Status ${response.status})`);
            return 0;
        }

        const data = await response.json();
        console.log(`🤖 Backend AI Move: ${data.move}`);
        return data.move; 

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du mouvement de l'IA :", error);
        return 0;
    }
}