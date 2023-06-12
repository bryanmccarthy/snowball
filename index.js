const canvas = document.getElementById("game");
const width = canvas.width;
const height = canvas.height;
const radius = 50;
const context = canvas.getContext("2d");

let start;
let x = width / 2;
let y = height / 2;
let dx = 100;
let dy = 100;


function step(timestamp) {
  if(start === undefined) {
    start = timestamp;
  }
  const deltaTime = (timestamp - start) * 0.001;
  start = timestamp;

  x += dx * deltaTime;
  y += dy * deltaTime;

  context.clearRect(0, 0, width, height);
  drawCircle(context, x, y, radius, "blue");

  window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);


function drawCircle(context, x, y, radius, color) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.stroke();
}
