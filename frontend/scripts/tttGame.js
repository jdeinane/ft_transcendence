import { navigate } from "./app.js";

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

    function aiMove() {
        let bestMove = getBestMove();
        board[bestMove] = "O";
        renderBoard();
        checkWinner();
        currentPlayer = "X";
    }

    function getBestMove() {
        let bestScore = -Infinity;
        let move = null;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, 0, false);
                board[i] = "";
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        return move;
    }

    function minimax(board, depth, isMaximizing) {
        const winner = getWinner(board);
        if (winner === "X") return -10 + depth;
        if (winner === "O") return 10 - depth;
        if (!board.includes("")) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "O";
                    let score = minimax(board, depth + 1, false);
                    board[i] = "";
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === "") {
                    board[i] = "X";
                    let score = minimax(board, depth + 1, true);
                    board[i] = "";
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
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
