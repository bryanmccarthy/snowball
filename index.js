class V2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(v) {
    return new V2(this.x + v.x, this.y + v.y);
  }

  sub(v) {
    return new V2(this.x - v.x, this.y - v.y);
  }

  scale(s) {
    return new V2(this.x * s, this.y * s);
  }
}

function drawCircle(context, center, radius, color) {
  context.beginPath();
  context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.stroke();
}

(() => {
  const canvas = document.getElementById("game");
  const context = canvas.getContext("2d");
  const radius = 50;
  let speed = 600;
  let start;
  let pos = new V2(radius + 10, radius + 10);

  const dirMap = {
    'KeyW': new V2(0, -speed),
    'KeyS': new V2(0, speed),
    'KeyA': new V2(-speed, 0),
    'KeyD': new V2(speed, 0)
  };

  const pressedKeys = new Set(); 

  function step(timestamp) {
    if(start === undefined) {
      start = timestamp;
    }
    const deltaTime = (timestamp - start) * 0.001;
    start = timestamp;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let vel = new V2(0, 0);
    for (let key of pressedKeys) {
      if (key in dirMap) {
        vel = vel.add(dirMap[key])
      }
    }

    pos = pos.add(vel.scale(deltaTime));

    context.clearRect(0, 0, width, height);
    drawCircle(context, pos, radius, "blue");

    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);

  document.addEventListener("keydown", event => {
    pressedKeys.add(event.code);
  })

  document.addEventListener("keyup", event => {
    pressedKeys.delete(event.code);
  })
})();

