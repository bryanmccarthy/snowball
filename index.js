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

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

const speed = 800;
const radius = 50;

const dirMap = {
  'KeyW': new V2(0, -1.0),
  'KeyS': new V2(0, 1.0),
  'KeyA': new V2(-1.0, 0),
  'KeyD': new V2(1.0, 0)
};

class TutPopup {
  constructor(text) {
    this.alpha = 0.0;
    this.dalpha = 0.0;
    this.text = text;
  }

  update(dt) {
    this.alpha += this.dalpha * dt; 

    if (this.dalpha < 0.0 && this.alpha <= 0.0) {
      this.dalpha = 0.0;
      this.alpha = 0.0;
    } else if (this.dalpha > 0.0 && this.alpha >= 1.0) {
      this.dalpha = 0.0;
      this.alpha = 1.0;
    }
  }

  render(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;

    context.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    context.font = "30px Arial";
    context.textAlign = "center";
    context.fillText(this.text, width / 2, height / 2);
  }

  fadeIn() {
    this.dalpha = 1.0;
    this.alpha = 0.0;
  }

  fadeOut() {
    this.dalpha = -1.0;
    this.alpha = 1.0;
  }
}

class Game {
  constructor(pos) {
    this.pos = new V2(radius + 10, radius + 10);
    this.pressedKeys = new Set(); 
    this.popup = new TutPopup("WASD to move");
    this.popup.fadeIn();
    this.first_move = false;
  }

  update(dt) {
    let vel = new V2(0, 0);

    for (let key of this.pressedKeys) {
      if (key in dirMap) {
        vel = vel.add(dirMap[key].scale(speed))
      }
    }

    if (!this.first_move && vel.length() > 0.0) {
      this.first_move = true;
      this.popup.fadeOut();
    }

    this.pos = this.pos.add(vel.scale(dt));

    this.popup.update(dt);
  }

  render(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    
    context.clearRect(0, 0, width, height);
    drawCircle(context, this.pos, radius, "blue");

    this.popup.render(context);
  }

  keyDown(event) {
    this.pressedKeys.add(event.code);
  }

  keyUp(event) {
    this.pressedKeys.delete(event.code);
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

  const game = new Game();
  
  let start;

  function step(timestamp) {
    if(start === undefined) {
      start = timestamp;
    }
    const dt = (timestamp - start) * 0.001;
    start = timestamp;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    game.update(dt);
    game.render(context);
    
    window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);

  document.addEventListener("keydown", event => {
    game.keyDown(event);
  })

  document.addEventListener("keyup", event => {
    game.keyUp(event);
  })
})();

