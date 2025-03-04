import { navigate } from "./app.js";

export async function setupLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    const backButton = document.getElementById("back-to-home");

    if (!leaderboardList) return;

    leaderboardList.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

    try {
        const response = await fetch("/api/leaderboard/");
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        
        const leaderboard = await response.json();
        
        leaderboardList.innerHTML = ""; // Vider la table avant d'ajouter les données
        
        leaderboard.forEach(({ rank, username, score }) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rank}</td>
                <td>${username}</td>
                <td>${score}</td>
            `;
            leaderboardList.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        leaderboardList.innerHTML = "<tr><td colspan='3'>Error loading leaderboard</td></tr>";
    }

    backButton.addEventListener("click", () => {
        navigate("/");
    });
}
