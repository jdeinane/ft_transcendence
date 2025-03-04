let tttTournamentPlayers = [];
let tttTournamentMatches = [];
let tttCurrentMatchIndex = 0;
let tttLosers = [];
let tttWinners = [];
let tttFinalRanking = [];

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

                    tttCurrentMatchIndex++;

                    if (tttCurrentMatchIndex === tttTournamentMatches.length) {
                        if (tttWinners.length === 2) {
                            startFinalMatch();
                        } else {
                            declareWinner(tttFinalRanking[0]);
                        }
                    } else {
                        setTimeout(startNextMatch, 1000);
                    }
                });
            }, 500);
        }
    }

    function startFinalMatch() {
        if (tttWinners.length < 2)
            return;

        const [finalist1, finalist2] = tttWinners;
        alert(`🏆 Grand Finale : ${finalist1} vs ${finalist2}`);

        startTournamentTicTacToeGame(finalist1, finalist2, (winner) => {
            let runnerUp = finalist1 === winner ? finalist2 : finalist1;

            tttFinalRanking.unshift(winner);
            tttFinalRanking.splice(1, 0, runnerUp);

            setTimeout(() => {
                declareWinner(winner);
            }, 500);
        });
    }

    function declareWinner(winner) {
        alert(`🏆 The tournament is over! The big winner is ${winner} !`);

        localStorage.setItem("finalRanking", JSON.stringify(tttFinalRanking));

        navigate("/results");

        // Reset du tournoi
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
