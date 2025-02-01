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
        board.style.display = "grid"; // Affichage correct en grille
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
	backButton.style.display = "block"; // Affiche le bouton lorsqu'on commence le jeu
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
		if (board[index] !== "" || !gameActive)
			return;
		board[index] = currentPlayer;
		renderBoard();
		checkWinner();

		currentPlayer = currentPlayer === "X" ? "O" : "X";
		if (mode === "solo" && currentPlayer === "O" && gameActive) {
			setTimeout(aiMove, 500);
		}
	}

	function aiMove() {
		const emptyCells = board.map((val, idx) => (val === "" ? idx : null)).filter(v => v !== null);
		const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
		board[randomMove] = "O";
		renderBoard();
		checkWinner();
		currentPlayer = "X";
	}

	function checkWinner() {
		const winningCombos = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]	
		];

		for (const combo of winningCombos) {
			const [a, b, c] = combo;
			if (board[a] && board[a] === board[b] && board[a] == board[c]) {
				gameActive = false;
                alert(`${board[a]} wins!`);
				return;
			}
		}
		if (!board.includes("")) {
			gameActive = false;
			alert("It's a draw...");
		}
	}
	renderBoard();
}