const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

// Dimensions de la balle
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speedX: 4,
  speedY: 4,
};

// Dimensions des raquettes
const paddleWidth = 10;
const paddleHeight = 100;

// Raquettes
const player = { x: 0, y: canvas.height / 2 - paddleHeight / 2, score: 0 };
const ai = { x: canvas.width - paddleWidth, y: canvas.height / 2 - paddleHeight / 2, score: 0 };

// Dessiner la balle
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

// Dessiner une raquette
function drawPaddle(paddle) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddle.x, paddle.y, paddleWidth, paddleHeight);
}

// Mise a jour de la balle
function updateBall() {
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Rebond vertical
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.speedY = -ball.speedY;
  }

  // Rebond sur les raquettes
  if (
    (ball.x - ball.radius < player.x + paddleWidth &&
      ball.y > player.y &&
      ball.y < player.y + paddleHeight) ||
    (ball.x + ball.radius > ai.x &&
      ball.y > ai.y &&
      ball.y < ai.y + paddleHeight)
  ) {
    ball.speedX = -ball.speedX;
  }

  // Sortie à gauche ou à droite
  if (ball.x - ball.radius < 0) {
    ai.score++;
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    player.score++;
    resetBall();
  }
}

// Réinitialiser la balle
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speedX = -ball.speedX;
}

// Déplacer les raquettes
function updatePaddles() {
  // Mouvement de l'IA (simple suivi de la balle)
  if (ball.y < ai.y + paddleHeight / 2) {
    ai.y -= 4;
  } else {
    ai.y += 4;
  }
}

// Dessiner le score
function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Joueur: ${player.score}`, 20, 20);
  ctx.fillText(`IA: ${ai.score}`, canvas.width - 100, 20);
}

// Jeu principal
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBall();
  drawPaddle(player);
  drawPaddle(ai);
  drawScore();
  updateBall();
  updatePaddles();
  requestAnimationFrame(gameLoop);
}

// Déplacement du joueur
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp" && player.y > 0) {
    player.y -= 10;
  } else if (e.key === "ArrowDown" && player.y + paddleHeight < canvas.height) {
    player.y += 10;
  }
});

// Démarrer le jeu
gameLoop();
