import { navigate } from "./app.js";

export function setupLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    const backButton = document.getElementById("back-to-home");

    if (!leaderboardList) return;


    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || {};
    
    const sortedPlayers = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);

    leaderboardList.innerHTML = "";
    sortedPlayers.forEach(([player, wins], index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${player}</td>
            <td>${wins}</td>
        `;
        leaderboardList.appendChild(row);
    });

    backButton.addEventListener("click", () => {
        navigate("/");
    });
}
