import { startTournamentPongGame } from "./pongGame.js";
import { navigate } from "./app.js";

let tournamentPlayers = [];
let tournamentMatches = [];
let currentMatchIndex = 0;
let losers = [];
let winners = [];
let finalRanking = [];

export function setupTournament() {
    const joinButton = document.getElementById("join-tournament");
    const playerNameInput = document.getElementById("tournament-player-name");
    const bracketContainer = document.getElementById("bracket-container");
    const bracketDiv = document.getElementById("bracket");
    const startMatchButton = document.getElementById("start-next-match");
    const playersList = document.getElementById("players-list");

    joinButton.addEventListener("click", () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert("Veuillez entrer un alias !");
            return;
        }

        if (!tournamentPlayers.includes(playerName)) {
            tournamentPlayers.push(playerName);
            updatePlayersList();
            updateBracket();
        }

        playerNameInput.value = "";
    });

    function updatePlayersList() {
        playersList.innerHTML = ""; 
        tournamentPlayers.forEach(player => {
            const listItem = document.createElement("li");
            listItem.textContent = player;
            playersList.appendChild(listItem);
        });
    }

    function updateBracket() {
        if (tournamentPlayers.length < 2) return;
        
        bracketContainer.classList.remove("hidden");
        bracketDiv.innerHTML = "";
        tournamentMatches = generateMatches(tournamentPlayers);
        tournamentMatches.forEach((match, index) => {
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

    startMatchButton.removeEventListener("click", startNextMatch);
    startMatchButton.addEventListener("click", startNextMatch);

	function startNextMatch() {
		if (currentMatchIndex < tournamentMatches.length) {
			const { player1, player2 } = tournamentMatches[currentMatchIndex];
	
			setTimeout(() => {
				startTournamentPongGame(player1, player2, winner => {
					let loser = player1 === winner ? player2 : player1;
					finalRanking.unshift(winner);
					winners.push(winner);
					losers.push(loser);
	
					currentMatchIndex++;
	
					if (currentMatchIndex === tournamentMatches.length) {
						if (losers.length === 2) {
							startMatchForThirdPlace(() => {
								if (winners.length === 2) {
									startFinalMatch();
								} else {
									declareWinner(finalRanking[0]);
								}
							});
						} else if (winners.length === 2) {
							startFinalMatch();
						} else {
							declareWinner(finalRanking[0]);
						}					
					}					
					else
						setTimeout(startNextMatch, 1000);
				});
			}, 500);
		}
	}
	
	
	function startMatchForThirdPlace(onComplete) {
		if (losers.length < 2) {
			console.error("❌ Pas assez de perdants pour jouer la 3ème place !");
			return;
		}
	
		const [player3, player4] = losers;
		alert(`🎖 Match pour la 3ème place : ${player3} vs ${player4}`);
	
		startTournamentPongGame(player3, player4, winner => {
			let loser = player3 === winner ? player4 : player3;

			if (!finalRanking.includes(winner))
				finalRanking.splice(2, 0, winner);
			if (!finalRanking.includes(loser))
				finalRanking.push(loser);

			if (onComplete) onComplete();
		});
	}
	

	function startFinalMatch() {
		if (winners.length < 2) {
			console.error("❌ Pas assez de gagnants pour jouer la finale !");
			return;
		}
	
		const [finalist1, finalist2] = winners;
		alert(`🏆 Finale : ${finalist1} vs ${finalist2}`);
	
		startTournamentPongGame(finalist1, finalist2, winner => {
			let runnerUp = finalist1 === winner ? finalist2 : finalist1;

			if (!finalRanking.includes(runnerUp))
				finalRanking.splice(1, 0, runnerUp)
			if (!finalRanking.includes(winner))
				finalRanking.unshift(winner);
	
			setTimeout(() => {
				declareWinner(winner);
			}, 500);
		});
	}
	

	function declareWinner(winner) {
		alert(`The tournament has finished! The big winner is: ${winner} !`);
    	console.log("Classement avant affichage :", finalRanking);
		finalRanking = [...new Set(finalRanking)];

		let rankingMessage = `Final ranking:\n`;
		finalRanking.forEach((player, index) => {
			rankingMessage += `{index + 1}. ${player}\n`;
		});
		alert(rankingMessage);

		// reset tournament
		tournamentPlayers = [];
		tournamentMatches = [];
		losers = [];
		winners = [];
		finalRanking = [];
		currentMatchIndex = 0;

		bracketDiv.innerHTML = "";
		bracketContainer.classList.add("hidden");
		updatePlayersList();
	}
	
    function declareWinner(winner) {
        alert(`🏆 Le tournoi est terminé ! Le grand gagnant est ${winner} !`);

		localStorage.setItem("finalRanking", JSON.stringify(finalRanking));

		navigate("/results");

        // // Reset du tournoi
        // tournamentPlayers = [];
        // tournamentMatches = [];
        // losers = [];
        // finalRanking = [];
        // currentMatchIndex = 0;
        // bracketDiv.innerHTML = "";
        // bracketContainer.classList.add("hidden");
        // updatePlayersList();
    }
}
