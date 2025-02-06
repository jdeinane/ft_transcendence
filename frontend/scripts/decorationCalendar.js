export function initializeCalendar() {
    const canvas = document.getElementById("calendarCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / 7; // 7 colonnes pour les jours
    const titleHeight = 55;

    // Calculer dynamiquement la hauteur des cellules
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalRows = Math.ceil((firstDay + lastDate) / 7); // Nombre réel de lignes nécessaires
    const cellHeight = (height - titleHeight) / totalRows;

    // Dessiner le cadre (éviter le double bord)
    ctx.strokeRect(0, 0, width, height);
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
	ctx.strokeRect(0, 0, width, height);


    // Afficher le mois et l'année en haut
    const month = now.toLocaleString('en', { month: 'short' }); // Ex: Feb
    const year = now.getFullYear();
    ctx.fillStyle = "black";
    ctx.font = "bold 35px 'NintendoDS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${month} ${year}`, width / 2, titleHeight / 2 + 5);

    // Jours de la semaine
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = (i === 0) ? "#FF00FF" : (i === 6) ? "blue" : "black";
        ctx.fillText(days[i], i * cellSize + cellSize / 2, titleHeight + cellHeight / 2 - 5);
    }

    let x = firstDay;
    let y = 1;

    for (let day = 1; day <= lastDate; day++) {
        let posX = x * cellSize;
        let posY = titleHeight + y * cellHeight;

        if (day === now.getDate()) {
            ctx.fillStyle = "lightgray";
            ctx.fillRect(posX + 3, posY + 3, cellSize - 6, cellHeight - 6);
        }

        ctx.fillStyle = (x === 0) ? "#FF00FF" : (x === 6) ? "blue" : "black";
        ctx.fillText(day, posX + cellSize / 2, posY + cellHeight / 2 + 5);

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
