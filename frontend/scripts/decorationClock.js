function initializeClock() {
    const canvas = document.getElementById("clockCanvas");

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;

	
    function drawClock() {
        ctx.clearRect(0, 0, width, height);

        // Dessiner le cadre
        ctx.fillRect(5, 5, width - 10, height - 10);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(5, 5, width - 10, height - 10);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Marqueurs d'heures
        ctx.fillStyle = "gray";
        ctx.font = "bold 120px 'NintendoDS', sans-serif"; // Police pixelisée
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
		
		
        const hourNumbers = ["12", "3", "6", "9"];
        const hourPositions = [
            { x: centerX, y: centerY - radius - 0.5 }, // 12h
            { x: centerX + radius + 3, y: centerY }, // 3h
            { x: centerX, y: centerY + radius - 25 }, // 6h
            { x: centerX - radius - 3, y: centerY }  // 9h
        ];

        for (let i = 0; i < hourNumbers.length; i++) {
            ctx.fillText(hourNumbers[i], hourPositions[i].x, hourPositions[i].y);
        }

        // Dessiner les aiguilles
        const now = new Date();
        let hours = now.getHours() % 12;
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();

        drawHand(hours * 30 + minutes / 2, radius * 0.5, "5b7a91", 8);  // Heure
        drawHand(minutes * 6, radius * 0.7, "black", 4);  // Minute
        drawHand(seconds * 6, radius * 0.8, "red", 3);  // Seconde

        requestAnimationFrame(drawClock);
    }

    function drawHand(angle, length, color, lineWidth) {
        let radian = (angle - 90) * (Math.PI / 180);
        let x = centerX + length * Math.cos(radian);
        let y = centerY + length * Math.sin(radian);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    // Lancer l'horloge
    drawClock();
}

// Attendre que la page soit complètement chargée avant d'exécuter `initializeClock`
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializeClock, 100); // Petit délai pour s'assurer que le canvas est ajouté
});
