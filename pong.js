const canvas = document.getElementById("pong");
const ctx = canvas.getContext("2d");

let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

let gameStarted = false;

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  velocityX: 5,
  velocityY: 5,
  speed: 7,
  color: "orange",
};

const user = {
  x: 0,
  y: (canvas.height - 100) / 2,
  width: 10,
  height: 100,
  score: 0,
  color: "blue",
};

const com = {
  x: canvas.width - 10,
  y: (canvas.height - 100) / 2,
  width: 10,
  height: 100,
  score: 0,
  color: "red",
};

const net = {
  x: (canvas.width - 2) / 2,
  y: 0,
  height: 10,
  width: 2,
  color: "WHITE",
};

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawArc(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

// canvas.addEventListener("mousemove", getMousePos);

// function getMousePos(evt) {
//   let rect = canvas.getBoundingClientRect();

//   user.y = evt.clientY - rect.top - user.height / 2;
// }
function getUserPos(event) {
  let rect = canvas.getBoundingClientRect();

  if (event.type === "mousemove") {
    user.y = event.clientY - rect.top - user.height / 2;
  } else if (event.type === "keydown") {
    if (event.key === "ArrowUp") {
      if (user.y - user.height / 4 >= 0) {
        user.y -= user.height / 2;
      }
    } else if (event.key === "ArrowDown") {
      if (user.y + user.height / 2 <= canvas.height) {
        user.y += user.height / 2;
      }
    }
  }
}

document.addEventListener("mousemove", getUserPos);
document.addEventListener("keydown", getUserPos);

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = -ball.velocityX;
  ball.speed = 7;
}

function drawNet() {
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
}

function drawText(text, x, y) {
  ctx.fillStyle = "#FFF";
  ctx.font = "45px fantasy";
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

// התנגשות
//b==ball p=user or com

function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

function update() {
  if (!gameStarted) {
    return;
  }
  if (ball.x - ball.radius < 0) {
    com.score++;
    comScore.play();
    resetBall();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    userScore.play();
    resetBall();
  }

  //מהירות של הכדור
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;

  // תזוזה של המחשב
  com.y += (ball.y - (com.y + com.height / 2)) * 0.3;

  //שהכדור נוגע בחלק העליון והתחתון של הקנבאס
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.velocityY = -ball.velocityY;
    wall.play();
  }

  // בודקת באיזה צד הכדור פגע
  let player = ball.x + ball.radius < canvas.width / 2 ? user : com;

  if (collision(ball, player)) {
    hit.play();

    let collidePoint = ball.y - (player.y + player.height / 2);
    // normalize the value of collidePoint, we need to get numbers between -1 and 1.
    // -player.height/2 < collide Point < player.height/2
    collidePoint = collidePoint / (player.height / 2);

    // when the ball hits the top of a paddle we want the ball, to take a -45degrees angle
    // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
    // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
    // Math.PI/4 = 45degrees
    let angleRad = (Math.PI / 4) * collidePoint;

    // change the X and Y velocity direction
    let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    ball.speed += 0.4;
  }
}

// render
function render() {
  drawRect(0, 0, canvas.width, canvas.height, "#000");

  drawText(`user: ${user.score}`, canvas.width / 4, canvas.height / 5);
  drawText(`com: ${com.score}`, (3 * canvas.width) / 4, canvas.height / 5);

  drawNet();

  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);

  drawArc(ball.x, ball.y, ball.radius, ball.color);

  if (user.score === 10 || com.score === 10) {
    let winner = user.score === 10 ? "user" : "com";
    drawText(`${winner} wins! 😃`, canvas.width / 2, canvas.height / 2);
    clearInterval(loop);
    restartButton.style.display = "block";
  }
}

function game() {
  update();
  render();
}
const restartButton = document.getElementById("restartButton");
restartButton.addEventListener("click", restartGame);

function restartGame() {
  clearInterval(loop);
  user.score = 0;
  com.score = 0;
  restartButton.style.display = "none";
  resetBall();
  loop = setInterval(game, 1000 / framePerSecond);
}
document.getElementById("startButton").addEventListener("click", startGame);
function startGame() {
  gameStarted = true;
  resetBall();
  startButton.style.display = "none";
}

// number of frames per second
let framePerSecond = 50;

//call the game function 50 times every 1 Sec
let loop = setInterval(game, 1000 / framePerSecond);
