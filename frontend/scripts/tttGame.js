import { navigate } from "./app.js";
import { refreshToken, logoutUser } from "./user.js";

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
}

function startTicTacToeGame(boardElement, mode) {
    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameActive = true;

    const backButton = document.getElementById("back-to-mode-selection");
    backButton.style.display = "block"; 
    backButton.addEventListener("click", () => {
        boardElement.style.display = "none";
        backButton.style.display = "none";
        document.querySelector(".mode-selection-container").style.display = "block";
    });

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
			console.warn("⚠ Aucun coup valide retourné par l'IA.");
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
            displayWinner(`${winner} wins!`);
            return true;
        }
        if (!board.includes("")) {
            gameActive = false;
            displayWinner("It's a draw...");
            return true;
        }
        return false;
    }

    function displayWinner(message) {
        const resultContainer = document.createElement("div");
        resultContainer.classList.add("result-popup");
        resultContainer.innerHTML = `
            <p>${message}</p>
            <button id="restart-game">Restart</button>
        `;
        document.body.appendChild(resultContainer);
        document.getElementById("restart-game").addEventListener("click", () => {
            document.body.removeChild(resultContainer);
            startTicTacToeGame(boardElement, mode);
        });
    }

    renderBoard();
}

async function fetchAIMove(board, difficulty = "medium") {
    let token = localStorage.getItem("access_token");

    if (!token) {
        console.error("❌ Aucun token JWT trouvé. Impossible d'appeler l'IA.");
        return null;
    }

    try {
        console.log("📤 Envoi du board à l'IA :", board);

        let response = await fetch(`${API_BASE_URL}/api/game/tictactoe-ai-move/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ board, difficulty })
        });

        // 🔴 Si le token a expiré (Erreur 401 Unauthorized)
        if (response.status === 401) {  
            console.warn("🔄 Token expiré, tentative de rafraîchissement...");

            const refreshed = await refreshToken();

            if (!refreshed) {
                console.error("🔴 Impossible de rafraîchir le token, déconnexion...");
                logoutUser();
                return null;
            }

            // 🔄 Récupérer le nouveau token après rafraîchissement
            token = localStorage.getItem("access_token");

            // 🔄 Refaire la requête avec le token rafraîchi
            response = await fetch(`${API_BASE_URL}/api/game/tictactoe-ai-move/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ board, difficulty })
            });
        }

        // 🚨 Si toujours une erreur après le refresh, on affiche le message du backend
        if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Erreur API Tic-Tac-Toe AI (Status ${response.status})`);
            console.error("📩 Réponse du serveur :", errorData);
            return null;
        }

        // ✅ Si tout est bon, récupérer la réponse JSON et retourner le move
        const data = await response.json();
        console.log(`🤖 Backend AI Move: ${data.move}`);
        return data.move;

    } catch (error) {
        console.error("❌ Erreur lors de la récupération du coup de l'IA :", error);
        return null;
    }
}