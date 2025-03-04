import { navigate } from "./app.js";
import { refreshToken, logoutUser, fetchUserProfile } from "./user.js";

const API_BASE_URL = "http://127.0.0.1:4000";

export function setupTicTacToeGame() {
    let selectedMode = "solo";
    const board = document.getElementById("tic-tac-toe-board");
    const startButton = document.getElementById("start-ttt-game");
    const backButton = document.getElementById("back-to-mode-selection");
    const gameSelectionButton = document.getElementById("back-to-game-selection");

    document.querySelectorAll(".mode-button").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("active-mode"));
            button.classList.add("active-mode");
            selectedMode = button.dataset.mode;
        });
    });

    startButton.addEventListener("click", () => {
        board.style.display = "grid"; 
        document.querySelector(".mode-selection-container").style.display = "none";
        startTicTacToeGame(board, selectedMode);
    });

    backButton.addEventListener("click", () => {
        board.style.display = "none";
        backButton.style.display = "none";
        document.querySelector(".mode-selection-container").style.display = "block";
    });

    gameSelectionButton.addEventListener("click", () => {
        navigate("#/game");
    });


	document.querySelectorAll(".mode-button").forEach(button => {
		button.addEventListener("click", () => {
			document.querySelectorAll(".mode-button").forEach(btn => btn.classList.remove("active-mode"));
			button.classList.add("active-mode");
			selectedMode = button.dataset.mode;
		});
	});
	
	document.getElementById("start-ttt-game").addEventListener("click", () => {
		if (selectedMode === "tournament") {
			navigate("#/tic-tac-toe-tournament");
		} else {
			const board = document.getElementById("tic-tac-toe-board");
			board.style.display = "grid"; 
			document.querySelector(".mode-selection-container").style.display = "none";
			startTicTacToeGame(board, selectedMode);
		}
	});
}

export function startTicTacToeGame(boardElement, mode, onGameEnd = null) {
    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = true;

	const backButton = document.getElementById("back-to-mode-selection");

	if (mode !== "tournament" && backButton) {
		backButton.style.display = "block"; 
		backButton.addEventListener("click", () => {
			boardElement.style.display = "none";
			backButton.style.display = "none";
			document.querySelector(".mode-selection-container").style.display = "block";
		});
	} else if (mode !== "tournament") {
		console.warn("Le boutton 'back-to-mode-selection' introuvable.");
	}
		
    function renderBoard() {
        boardElement.innerHTML = "";
        board.forEach((cell, index) => {
            const cellElement = document.createElement("div");
            cellElement.classList.add("ttt-cell");
            cellElement.textContent = cell;
            cellElement.dataset.index = index;
            cellElement.addEventListener("click", handleCellClick);
            boardElement.appendChild(cellElement);
        });
    }

    function handleCellClick(event) {
        const index = event.target.dataset.index;
        if (board[index] !== "" || !gameActive) return;

        board[index] = currentPlayer;
        renderBoard();
        if (checkWinner()) return;

        currentPlayer = currentPlayer === "X" ? "O" : "X";

        if (mode === "solo" && currentPlayer === "O" && gameActive) {
            setTimeout(aiMove, 500);
        }
    }

	async function aiMove() {
		const bestMove = await fetchAIMove(board, "medium");
	
		if (bestMove !== null && board[bestMove] === "") {
			board[bestMove] = "O";
			renderBoard();
			checkWinner();
			currentPlayer = "X";
		} else {
			console.warn("Aucun coup valide retourne par l'IA.");
		}
	}

    function getWinner(board) {
        const winningCombos = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]	
        ];
        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return null;
    }

	function checkWinner() {
		let winner = getWinner(board);
		if (winner) {
			gameActive = false;
			displayWinner(`${winner} wins!`, winner, mode, onGameEnd);
			return true;
		}
		if (!board.includes("")) {
			gameActive = false;
			displayWinner("It's a draw...", "draw", mode, onGameEnd);
			return true;
		}
		return false;
	}
	

	function displayWinner(message, winner, mode = "solo", onGameEnd = null) {
		sendTicTacToeEndGameRequest(winner);
	
		const resultContainer = document.createElement("div");
		resultContainer.classList.add("result-popup");
	
		if (mode === "tournament") {
			resultContainer.innerHTML = `
				<p>🏆 ${winner} wins the match!</p>
				<button id="next-match">Next Match</button>
			`;
			document.body.appendChild(resultContainer);
	
			document.getElementById("next-match").addEventListener("click", () => {
				document.body.removeChild(resultContainer);
				if (onGameEnd) onGameEnd(winner);
			});
		} else {
			resultContainer.innerHTML = `
				<p>${message}</p>
				<button id="restart-game">Restart</button>
			`;
			document.body.appendChild(resultContainer);
	
			document.getElementById("restart-game").addEventListener("click", () => {
				document.body.removeChild(resultContainer);
				startTicTacToeGame(document.getElementById("tic-tac-toe-board"), "solo");
			});
		}
	}	
    renderBoard();
}

async function fetchAIMove(board, difficulty = "medium") {
    let token = localStorage.getItem("access_token");

    if (!token) {
        return null;
    }

    try {
        console.log("Envoi du board à l'IA :", board);

        let response = await fetch(`${API_BASE_URL}/api/game/tictactoe-ai-move/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ board, difficulty })
        });

        if (response.status === 401) {  
            console.warn("🔄 Token expiré, tentative de rafraîchissement...");

            const refreshed = await refreshToken();

            if (!refreshed) {
                logoutUser();
                return null;
            }

            token = localStorage.getItem("access_token");

            response = await fetch(`${API_BASE_URL}/api/game/tictactoe-ai-move/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ board, difficulty })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            return null;
        }

        const data = await response.json();
        console.log(`🤖 Backend AI Move: ${data.move}`);
        return data.move;

    } catch (error) {
        console.error("Erreur lors de la recuperation du coup de l'IA :", error);
        return null;
    }
}

async function sendTicTacToeEndGameRequest(winner) {
    let token = localStorage.getItem("access_token");

    if (!token) {
        return;
    }

    try {
        const requestBody = {
            game_mode: "multiplayer",
            score_player1: winner === "X" ? 1 : 0,
            score_player2: winner === "O" ? 1 : 0,
            is_draw: winner === "draw"
        };


        const response = await fetch("http://127.0.0.1:4000/api/game/end-tic-tac-toe-game/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        if (response.ok) {
            console.log("Tic Tac Toe game saved ! number_of_games_played incremented :", data.number_of_games_played);
            await fetchUserProfile();
        } else {
            console.error("Error while saving the game :", data.error);
        }
    } catch (error) {
        console.error("Error while fetching :", error);
    }
}
