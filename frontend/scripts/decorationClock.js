export function initializeClock() {
	const canvas = document.getElementById("clockCanvas");

	if (!canvas)
		return;
	
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.4;

	
    function drawClock() {
        ctx.clearRect(0, 0, width, height);

        ctx.fillRect(5, 5, width - 10, height - 10);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.strokeStyle = "black";
		ctx.lineWidth = 4;
		ctx.strokeRect(0, 0, width, height);
	
        ctx.fillStyle = "gray";
        ctx.font = "bold 120px 'NintendoDS', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
		
		
        const hourNumbers = ["12", "3", "6", "9"];
        const hourPositions = [
            { x: centerX, y: centerY - radius + 2 }, // 12h
            { x: centerX + radius - 10, y: centerY }, // 3h
            { x: centerX, y: centerY + radius - 30 }, // 6h
            { x: centerX - radius + 15, y: centerY }  // 9h
        ];

        for (let i = 0; i < hourNumbers.length; i++) {
            ctx.fillText(hourNumbers[i], hourPositions[i].x, hourPositions[i].y);
        }

		ctx.fillStyle = "gray";
		for (let i = 0; i < 12; i++) {
		    if (i % 3 === 0) continue;
			let angle = (i * 30) * (Math.PI / 180);
			let dotX = centerX + (radius - 10) * Math.cos(angle);
			let dotY = centerY + (radius - 10) * Math.sin(angle);
			
			ctx.fillRect(dotX - 7, dotY - 7, 14, 14);
		}


		const now = new Date();
		let hours = now.getHours() % 12;
		let minutes = now.getMinutes();
		let seconds = now.getSeconds();

		drawHand(hours * 30 + minutes / 2, radius * 0.8, "#5b7a91", 6);
		drawHand(minutes * 6, radius * 0.8, "gray", 4);
		drawHand(seconds * 6, radius * 0.4, "red", 5);
		ctx.fillStyle = "#333333";
		ctx.fillRect(centerX - 5, centerY - 6, 12, 12);
		
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

    drawClock();
}
document.addEventListener("DOMContentLoaded", () => {
	setTimeout(initializeClock, 100);
});

window.addEventListener("hashchange", () => {
    if (window.location.hash === "#/") {
        initializeClock();
    }
});

function resizeCanvas(canvas) {
	let parent = canvas.parentElement;
	canvas.width = parent.clientWidth * 0.9;
	canvas.height = parent.clientWidth * 0.9;
}

window.addEventListener("resize", () => {
	const clockCanvas = document.getElementById("clockCanvas");

	if (clockCanvas) resizeCanvas();
});