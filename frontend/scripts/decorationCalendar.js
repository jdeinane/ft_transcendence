export function initializeCalendar() {
    const canvas = document.getElementById("calendarCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const titleHeight = 50;

    // 🔹 Correction du calcul de la largeur des cellules
    const cellSize = Math.floor(width / 7);
    const adjustedWidth = cellSize * 7; // Ajuster la largeur pour éviter les décalages
    canvas.width = adjustedWidth; // 🔹 S'assurer que le canvas prend toute la largeur nécessaire

    const firstDay = new Date().getDay();
    const lastDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const totalRows = Math.ceil((firstDay + lastDate) / 7);
    const cellHeight = (height - titleHeight) / (totalRows + 1);

    // 🔹 Dessiner l'arrière-plan et le cadre
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height); // 🔹 Fusion de la grille avec le cadre

    // 🔹 Afficher le mois et l'année en haut
    const now = new Date();
    const month = now.toLocaleString('en', { month: '2-digit' });
    const year = now.getFullYear();
    ctx.fillStyle = "black";
    ctx.font = "bold 45px 'NintendoDS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${month}/${year}`, width / 2, titleHeight / 2 + 12);

    // 🔹 Dessiner les jours de la semaine (en haut)
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    ctx.font = "30px 'NintendoDS', sans-serif";

    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = (i === 0) ? "#FF0055" : (i === 6) ? "#0055FF" : "#444";
        ctx.fillRect(i * cellSize, titleHeight, cellSize, cellHeight);
        ctx.fillStyle = "white";
        ctx.fillText(days[i], i * cellSize + cellSize / 2, titleHeight + cellHeight / 2 + 5);
    }

    let x = firstDay;
    let y = 1;

    ctx.font = "35px 'NintendoDS', sans-serif";

    for (let day = 1; day <= lastDate; day++) {
        let posX = x * cellSize;
        let posY = titleHeight + y * cellHeight;

        if (day === now.getDate()) {
            ctx.fillStyle = "lightgray";
            ctx.fillRect(posX, posY, cellSize, cellHeight);
        }

        ctx.fillStyle = (x === 0) ? "#FF0055" : (x === 6) ? "#0055FF" : "black";
        ctx.fillText(day, posX + cellSize / 2, posY + cellHeight / 2 + 5);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(posX, posY, cellSize, cellHeight); // 🔹 Fusion de la grille et du cadre

        x++;
        if (x > 6) {
            x = 0;
            y++;
        }
    }

    requestAnimationFrame(initializeCalendar);
}

// Lancer l'initialisation du calendrier quand la page charge
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializeCalendar, 100);
});

window.addEventListener("hashchange", () => {
    if (window.location.hash === "#/") {
        initializeCalendar();
    }
});
