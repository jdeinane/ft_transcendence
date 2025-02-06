export function initializeCalendar() {
    const canvas = document.getElementById("calendarCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const titleHeight = 50;

    const cellSize = Math.floor(width / 7);
    const adjustedWidth = cellSize * 7;
    canvas.width = adjustedWidth;

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const totalRows = Math.ceil((firstDay + lastDate) / 7);
    const cellHeight = (height - titleHeight) / (totalRows + 1);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);

    const month = now.toLocaleString('en', { month: '2-digit' });
    const year = now.getFullYear();
    ctx.fillStyle = "black";
    ctx.font = "bold 45px 'NintendoDS', sans-serif";
    ctx.textAlign = "center";
	ctx.textBaseLine = "middle";
    ctx.fillText(`${month}/${year}`, width / 2, titleHeight / 2 + 12);

    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    ctx.font = "30px 'NintendoDS', sans-serif";

    for (let i = 0; i < 7; i++) {
		let posX = i * cellSize;
		let posY = titleHeight;

        ctx.fillStyle = (i === 0) ? "#f0768b" : (i === 6) ? "#5b7a91" : "#444";
    	ctx.fillRect(posX, posY, cellSize, cellHeight); 
		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.strokeRect(posX, posY, cellSize, cellHeight);

	    ctx.fillStyle = "white";
    	ctx.fillText(days[i], posX + cellSize / 2, posY + cellHeight / 2 + 5);
		}

    let x = firstDay;
    let y = 1;

    ctx.font = "35px 'NintendoDS', sans-serif";

    for (let day = 1; day <= lastDate; day++) {
        let posX = x * cellSize;
        let posY = titleHeight + y * cellHeight;

        if (day === now.getDate()) {
            ctx.fillStyle = "#7a9eb7";
			ctx.fillRect(posX,posY, cellSize, cellHeight);
        }

        ctx.fillStyle = (x === 0) ? "#f0768b" : (x === 6) ? "#5b7a91" : "black";
        ctx.fillText(day, posX + cellSize / 2, posY + cellHeight / 2 + 5);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(posX, posY, cellSize, cellHeight);
        ctx.stroke();

        x++;
        if (x > 6) {
            x = 0;
            y++;
        }
    }
    requestAnimationFrame(initializeCalendar);
}


document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializeCalendar, 100);
});

window.addEventListener("hashchange", () => {
    if (window.location.hash === "#/") {
        initializeCalendar();
    }
});

function resizeCanvas(canvas) {
	let parent = canvas.parentElement;
	canvas.width = parent.clientWidth * 0.9;
	canvas.height = parent.clientWidth * 0.9;
}

window.addEventListener("resize", () => {
	const calendarCanvas = document.getElementById("calendarCanvas");

	if (calendarCanvas) resizeCanvas();
});