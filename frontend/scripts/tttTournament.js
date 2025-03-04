import { startTicTacToeGame } from "./tttGame.js";
import { navigate } from "./app.js";

let tttTournamentPlayers = [];
let tttTournamentMatches = [];
let tttCurrentMatchIndex = 0;
let tttLosers = [];
let tttWinners = [];
let tttFinalRanking = [];
let tournamentPlayerMap = {};
let tttSemiFinalists = [];

export function setupTicTacToeTournament() {
    const joinButton = document.getElementById("join-ttt-tournament");
    const playerNameInput = document.getElementById("tournament-player-name");
    const bracketContainer = document.getElementById("bracket-container");
    const bracketDiv = document.getElementById("bracket");
    const startMatchButton = document.getElementById("start-next-ttt-match");
    const playersList = document.getElementById("players-list");

    joinButton.addEventListener("click", () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert("Please enter an alias !");
            return;
        }

        if (tttTournamentPlayers.length >= 4) {
            alert("4 Players max");
            return;
        }

        if (!tttTournamentPlayers.includes(playerName)) {
            tttTournamentPlayers.push(playerName);
            updatePlayersList();
            updateBracket();
            updateStartMatchButton();
        }

        playerNameInput.value = "";

        if (tttTournamentPlayers.length === 4) {
            joinButton.disabled = true;
            playerNameInput.disabled = true;
        }
    });

    function updatePlayersList() {
        playersList.innerHTML = "";
        tttTournamentPlayers.forEach(player => {
            const listItem = document.createElement("li");
            listItem.textContent = player;
            playersList.appendChild(listItem);
        });
    }

    function updateStartMatchButton() {
        startMatchButton.disabled = (tttTournamentPlayers.length !== 4);
        if (tttTournamentPlayers.length === 4)
            startMatchButton.classList.remove("hidden");
        else
            startMatchButton.classList.add("hidden");
    }

    function updateBracket() {
        if (tttTournamentPlayers.length < 2) return;

        bracketContainer.classList.remove("hidden");
        bracketDiv.innerHTML = "";
        tttTournamentMatches = generateMatches(tttTournamentPlayers);
        tttTournamentMatches.forEach((match, index) => {
            const matchElement = document.createElement("div");
            matchElement.classList.add("match");
            matchElement.textContent = `Match ${index + 1}: ${match.player1} vs ${match.player2}`;
            bracketDiv.appendChild(matchElement);
        });

        startMatchButton.classList.remove("hidden");
        startMatchButton.addEventListener("click", startNextMatch);
    }

    function generateMatches(players) {
        let matches = [];
        let shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

        for (let i = 0; i < shuffledPlayers.length; i += 2) {
            if (i + 1 < shuffledPlayers.length) {
                matches.push({ player1: shuffledPlayers[i], player2: shuffledPlayers[i + 1] });
            }
        }
        return matches;
    }

    function startNextMatch() {
        if (tttTournamentPlayers.length !== 4) {
            alert("Must be 4 players");
            return;
        }

        joinButton.disabled = true;
        playerNameInput.disabled = true;

        if (tttCurrentMatchIndex < tttTournamentMatches.length) {
            const { player1, player2 } = tttTournamentMatches[tttCurrentMatchIndex];

			setTimeout(() => {
				startTournamentTicTacToeGame(player1, player2, (winner) => {
					let loser = player1 === winner ? player2 : player1;
					tttFinalRanking.unshift(winner);
					tttWinners.push(winner);
					tttLosers.push(loser);
					tttSemiFinalists.push(loser);
	
					tttCurrentMatchIndex++;
	
					if (tttCurrentMatchIndex === tttTournamentMatches.length) {
						if (tttWinners.length === 2) {
							startSemiFinalMatch();
						}
					} else {
						setTimeout(startNextMatch, 1000);
					}
				});
			}, 500);        }
    }
	
	function startSemiFinalMatch() {
		if (tttSemiFinalists.length < 2) return;
	
		const [semi1, semi2] = tttSemiFinalists;
		alert(`⚔️ Semi-finale : ${semi1} vs ${semi2}`);
	
		startTournamentTicTacToeGame(semi1, semi2, (winner) => {
			let loser = semi1 === winner ? semi2 : semi1;
	
			tttFinalRanking.splice(2, 0, winner); 
			tttFinalRanking.push(loser);

			setTimeout(() => {
				startFinalMatch(); 
			}, 500);
		});
	}
		
	function startThirdPlaceMatch() {
		if (tttLosers.length < 2) return;
	
		const [loser1, loser2] = tttLosers;
		alert(`⚔️ Match pour la 3ème place : ${loser1} vs ${loser2}`);
	
		startTournamentTicTacToeGame(loser1, loser2, (winner) => {
			let fourthPlace = loser1 === winner ? loser2 : loser1;
	
			tttFinalRanking.splice(2, 0, winner);
			tttFinalRanking.push(fourthPlace);
	
			setTimeout(() => {
				startFinalMatch();
			}, 500);
		});
	}
	

	function startFinalMatch() {
		if (tttWinners.length < 2) return;
	
		const [finalist1, finalist2] = tttWinners;
		alert(`🏆 Grand Finale : ${finalist1} vs ${finalist2}`);
	
		startTournamentTicTacToeGame(finalist1, finalist2, (winner) => {
			let runnerUp = finalist1 === winner ? finalist2 : finalist1;
	
			tttFinalRanking.unshift(winner);
			tttFinalRanking.splice(1, 0, runnerUp)
	
			setTimeout(() => {
				startThirdPlaceMatch();
			}, 500);
		});
	}
	
	function startFinalMatch() {
		if (tttWinners.length < 2) return;
	
		const [finalist1, finalist2] = tttWinners;
		alert(`🏆 Grand Finale : ${finalist1} vs ${finalist2}`);
	
		startTournamentTicTacToeGame(finalist1, finalist2, (winner) => {
			let runnerUp = finalist1 === winner ? finalist2 : finalist1;
	
			tttFinalRanking.unshift(winner);
			tttFinalRanking.splice(1, 0, runnerUp);
	
			setTimeout(() => {
				declareWinner(tttFinalRanking[0]);
			}, 500);
		});
	}	

    function declareWinner(winner) {
        alert(`🏆 The tournament is over! The big winner is ${winner} !`);

		tttFinalRanking = [...new Set(tttFinalRanking)];

        localStorage.setItem("finalRanking", JSON.stringify(tttFinalRanking));

        navigate("/results");

        tttTournamentPlayers = [];
        tttTournamentMatches = [];
        tttLosers = [];
        tttFinalRanking = [];
        tttCurrentMatchIndex = 0;
        bracketDiv.innerHTML = "";
        bracketContainer.classList.add("hidden");
        updatePlayersList();
        updateStartMatchButton();

        joinButton.disabled = false;
        playerNameInput.disabled = false;
    }
}

function startTournamentTicTacToeGame(player1, player2, onGameEnd) {
    console.log(`Demarrage du match: ${player1} vs ${player2}`);

    const gameContainer = document.getElementById("ttt-container");
    if (!gameContainer) {
        return;
    }

    gameContainer.innerHTML = `
        <h2>${player1} vs ${player2}</h2>
        <div id="tic-tac-toe-board"></div>
    `;

    gameContainer.classList.remove("hidden");
    gameContainer.style.display = "block";

	tournamentPlayerMap = { "X": player1, "O": player2 };

    function waitForBoard() {
        const board = document.getElementById("tic-tac-toe-board");
        if (board) {
            startTicTacToeGame(board, "tournament", (winner) => {
				const realWinner = tournamentPlayerMap[winner] || "Unknown";
                console.log(`🏆 Tournament finished! The big Winner is ${realWinner}`);
                onGameEnd(realWinner);
            });
        } else {
            requestAnimationFrame(waitForBoard);
        }
    }
    requestAnimationFrame(waitForBoard);
}
