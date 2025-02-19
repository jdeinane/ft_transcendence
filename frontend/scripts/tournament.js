import { startTournamentPongGame } from "./pongGame.js";

let tournamentPlayers = [];
let tournamentMatches = [];
let currentMatchIndex = 0;
let losers = []; // Liste des perdants pour le match de classement
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

    function startNextMatch() {
        if (currentMatchIndex < tournamentMatches.length) {
            const { player1, player2 } = tournamentMatches[currentMatchIndex];

            startTournamentPongGame(player1, player2, winner => {
                let loser = player1 === winner ? player2 : player1;
                finalRanking.unshift(winner); // On place le gagnant en haut du classement
                losers.push(loser);

                currentMatchIndex++;
                if (currentMatchIndex === tournamentMatches.length) {
                    // Si c'était la finale, lancer le match pour la 3ème place
                    if (losers.length === 2) {
                        startMatchForThirdPlace();
                    } else {
                        declareWinner(finalRanking[0]);
                    }
                } else {
                    startNextMatch();
                }
            });
        }
    }

    function startMatchForThirdPlace() {
        const [player1, player2] = losers;
        alert(`🎖 Match pour la 3ème place : ${player1} vs ${player2}`);

        startTournamentPongGame(player1, player2, winner => {
            let loser = player1 === winner ? player2 : player1;
            finalRanking.unshift(winner);
            finalRanking.unshift(loser);
            declareWinner(finalRanking[0]);
        });
    }

    function declareWinner(winner) {
        alert(`🏆 Le tournoi est terminé ! Le grand gagnant est ${winner} !`);

        let rankingMessage = `🏆 Classement final :\n`;
        finalRanking.forEach((player, index) => {
            rankingMessage += `${index + 1}. ${player}\n`;
        });

        alert(rankingMessage);

        // Reset du tournoi
        tournamentPlayers = [];
        tournamentMatches = [];
        losers = [];
        finalRanking = [];
        currentMatchIndex = 0;
        bracketDiv.innerHTML = "";
        bracketContainer.classList.add("hidden");
        updatePlayersList();
    }
}
