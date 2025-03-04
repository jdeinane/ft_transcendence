import { navigate } from "./app.js"
import { logoutUser, refreshToken, fetchUserProfile } from "./user.js";
import { getCurrentUser } from "./profile.js";

let player1Score = 0;
let player2Score = 0;
let player3Score = 0;
let player4Score = 0;
let gameOver = false;
let ballX, ballY;
let gameMode = "solo";

export function setupPongGame() {
	let selectedMode = "solo";
	let playerCount = 2;
	const canvas = document.getElementById("pong");
	const startButton = document.getElementById("start-game");
	const backButton = document.getElementById("back-to-mode-selection");
	const gameSelectionButton = document.getElementById("back-to-game-selection");
	const modeSelectionContainer = document.querySelector(".mode-selection-container");
	const playerSelection = document.getElementById("player-selection");
	selectedMode = "solo";
	
    document.querySelectorAll(".mode-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("active-mode"));
            button.classList.add("active-mode");

            selectedMode = button.dataset.mode;
			gameMode = selectedMode;

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
	startPongGame(canvas, selectedMode, playerCount);

	});

	backButton.addEventListener("click", () => {
		canvas.style.display = "none";
		backButton.style.display = "none";
		modeSelectionContainer.style.display = "block";
	});

	gameSelectionButton.addEventListener("click", () => {
		console.log("🟢 Back to Game Selection clicked!");
		navigate("#/game");
	});
}


export function startPongGame(canvas, selectedMode, playerCount) {
    const ctx = canvas.getContext("2d");
    gameMode = selectedMode;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;

    const paddleHeight = 100;
    const paddleWidth = 10;
    const paddleSpeed = 5;

    const paddleHorizontalWidth = 150;
    const paddleHorizontalHeight = 10;

    let paddle1Y = canvas.height / 2 - paddleHeight / 2;
    let paddle2Y = canvas.height / 2 - paddleHeight / 2;

    let paddle3X = canvas.width / 2 - paddleHeight / 2;
    let paddle4X = canvas.width / 2 - paddleHeight / 2;
    let paddle3Y = 0;
    let paddle4Y = canvas.height - paddleWidth;

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

        ctx.fillStyle = "red";
        ctx.fillText(player1Score, 20, canvas.height - 20);

        ctx.fillStyle = "blue";
        ctx.textAlign = "right";
        ctx.fillText(player2Score, canvas.width - 20, 30);

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
        ctx.fillRect(canvas.width - paddleWidth, paddle2Y, paddleWidth, paddleHeight);

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
            if (player2Score >= 5) return endGame(2);
            resetBall();
        } else if (ballX >= canvas.width) {
            player1Score++;
            if (player1Score >= 5) return endGame(1);
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

        if (gameMode === "solo") {
            const aiSpeed = Math.abs(ballSpeedY) * 0.8; 
            const aiReaction = 0.2; 

            const aiTarget = ballY - paddleHeight / 2; 
            paddle2Y += (aiTarget - paddle2Y) * aiReaction;

            paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
        } else {
            if (keys.i) paddle2Y -= paddleSpeed;
            if (keys.k) paddle2Y += paddleSpeed;
        }

        if (keys.w) paddle1Y -= paddleSpeed;
        if (keys.s) paddle1Y += paddleSpeed;

        if (playerCount >= 3) {
            if (keys.r) paddle3X -= paddleSpeed;
            if (keys.t) paddle3X += paddleSpeed;
        }
        if (playerCount === 4) {
            if (keys.n) paddle4X -= paddleSpeed;
            if (keys.m) paddle4X += paddleSpeed;
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
	
		ballSpeedX = -ballSpeedX * 1.1;  // Increase speed by 10% after every point
		ballSpeedY = ballSpeedY * 1.;   // Keep the same direction, but faster
	}
	

    function endGame(winner) {
        if (gameOver) return;
        gameOver = true;

        sendEndGameRequest(player1Score, player2Score, selectedMode);

        displayWinner(`🏆 Player ${winner} won !`);
    }

    function displayWinner(message) {
        const resultContainer = document.createElement("div");
        resultContainer.classList.add("result-popup");
        resultContainer.innerHTML = `
            <p>${message}</p>
            <button id="restart-game">Back to Mode Selection</button>
        `;
        document.body.appendChild(resultContainer);

        document.getElementById("restart-game").addEventListener("click", () => {
            document.body.removeChild(resultContainer);
            goToModeSelection();
        });
    }

    function goToModeSelection() {
        const canvas = document.getElementById("pong");
        const backButton = document.getElementById("back-to-mode-selection");
        const modeSelectionContainer = document.querySelector(".mode-selection-container");

        if (canvas) canvas.style.display = "none";
        if (backButton) backButton.style.display = "none";
        if (modeSelectionContainer) modeSelectionContainer.style.display = "block";

        resetGame();
    }

    function gameLoop() {
        if (gameOver) return;
        draw();
        update();
        requestAnimationFrame(gameLoop);
    }

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

    player1Score = 0;
    player2Score = 0;
    player3Score = 0;
    player4Score = 0;

    ballX = window.innerWidth / 2; 
    ballY = window.innerHeight / 2;
    let ballSpeedX = 4;
    let ballSpeedY = 4;

    const gameContainer = document.getElementById("pong-container");
    const canvas = document.getElementById("pong"); 

    if (gameContainer) {
        gameContainer.innerHTML = "";
    }

    if (canvas) {
        canvas.style.display = "block";
	}
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
	
		// Player Movement
		const playerSpeed = 5;
		if (keysPressed.w) paddle1Y -= playerSpeed;
		if (keysPressed.s) paddle1Y += playerSpeed;
	
		paddle1Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle1Y));
	
		// AI Movement (Only in Solo Mode)
		if (gameMode === "solo") {
			const aiSpeed = 5; // Keep AI speed the same as the player
			const aiReactionTime = 10; // AI reacts only when ball is 10px away
			const aiTarget = ballY - paddleHeight / 2;
	
			if (Math.abs(paddle2Y - aiTarget) > aiReactionTime) {
				if (paddle2Y < aiTarget) {
					paddle2Y += Math.min(aiSpeed, aiTarget - paddle2Y);
				} else if (paddle2Y > aiTarget) {
					paddle2Y -= Math.min(aiSpeed, paddle2Y - aiTarget);
				}
			}
		} else {
			// Multiplayer: Allow second player to move manually
			if (keysPressed.i) paddle2Y -= playerSpeed;
			if (keysPressed.k) paddle2Y += playerSpeed;
		}
	
		paddle2Y = Math.max(0, Math.min(canvas.height - paddleHeight, paddle2Y));
	
		// Ball Collision with Top & Bottom Walls
		if (ballY <= 0 || ballY >= canvas.height) {
			ballSpeedY = -ballSpeedY;
		}
	
		// Ball Collision with Player Paddle
		if (
			ballX <= paddleWidth &&
			ballY >= paddle1Y &&
			ballY <= paddle1Y + paddleHeight
		) {
			ballSpeedX = -ballSpeedX;
		}
	
		// Ball Collision with AI / Player 2 Paddle
		if (
			ballX >= canvas.width - paddleWidth &&
			ballY >= paddle2Y &&
			ballY <= paddle2Y + paddleHeight
		) {
			ballSpeedX = -ballSpeedX;
		}
	
		// Ball Out of Bounds (Left & Right)
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
			onGameEnd(winner, player1Score, player2Score); 
		}, 500);
	}
	
    gameLoop();
}

/////////////////////////////////////////////////////////////////////////

async function getValidToken() {
    let token = localStorage.getItem("access_token");
    if (!token) {
        console.error("❌ Aucun token JWT trouvé. Tentative de rafraîchissement...");
        await refreshToken();
        token = localStorage.getItem("access_token");
        if (!token) {
            console.error("❌ Impossible d'obtenir un token valide.");
            return null;
        }
    }
    return token;
}

async function fetchAIMove(ballY, paddleY, ballSpeedY, difficulty = "hard") {
    // AI will predict where the ball will go
    let predictionY = ballY;

    // Simulate future ball movement to predict impact point
    let simulatedBallY = ballY;
    let simulatedSpeedY = ballSpeedY;
    let canvasHeight = document.getElementById("pong").height;

    while (simulatedBallY > 0 && simulatedBallY < canvasHeight) {
        simulatedBallY += simulatedSpeedY;

        // Reverse direction if it would hit the top or bottom
        if (simulatedBallY <= 0 || simulatedBallY >= canvasHeight) {
            simulatedSpeedY *= -1;
        }
    }

    predictionY = simulatedBallY;

    // Move the paddle towards the predicted Y position
    let movementSpeed = difficulty === "hard" ? 5 : 3;  // Adjust AI speed
    if (paddleY + 50 < predictionY) return movementSpeed;  // Move down
    if (paddleY + 50 > predictionY) return -movementSpeed; // Move up
    return 0;
}




async function sendEndGameRequest(player1Score, player2Score, gameMode = "solo", player2Id = null) {
    let token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Aucun token trouvé. Impossible d'enregistrer le match.");
        return;
    }

    try {
        const requestBody = {
            game_mode: gameMode,
            score_player1: player1Score,
            score_player2: player2Score
        };

        console.log("📤 Envoi de la requête end-game avec :", requestBody); // DEBUG

        const response = await fetch("http://127.0.0.1:4000/api/game/end-game/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("✅ Match enregistré avec succès ! Nouveau nombre de parties :", data.number_of_games_played);
            await fetchUserProfile();
        } else {
            console.error("❌ Erreur lors de l'enregistrement du match :", data.error);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la requête :", error);
    }
}