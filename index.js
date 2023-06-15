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

  normalize() {
    const n = this.length();
    return new V2(this.x / n, this.y / n);
  }
}

const PLAYER_SPEED = 800;
const radius = 50;
const BULLET_SPEED = 2000;
const BULLET_RADIUS = 25;
const BULLET_LIFETIME = 5.0;

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
  }

  fadeOut() {
    this.dalpha = -1.0;
  }
}

class Bullet {
  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.lifetime = BULLET_LIFETIME;
  }

  update(dt) {
    this.pos = this.pos.add(this.vel.scale(dt));
    this.lifetime -= dt;
  }

  render(context) {      
    drawCircle(context, this.pos, BULLET_RADIUS, "red");
  }
}

class Game {
  constructor() {
    this.playerPos = new V2(radius + 10, radius + 10);
    this.mousePos = new V2(0, 0);
    this.pressedKeys = new Set(); 
    this.popup = new TutPopup("WASD to move");
    this.popup.fadeIn();
    this.playerMoved = false;
    this.bullets = [];
  }

  update(dt) {
    let vel = new V2(0, 0);

    for (let key of this.pressedKeys) {
      if (key in dirMap) {
        vel = vel.add(dirMap[key].scale(PLAYER_SPEED))
      }
    }

    if (!this.playerMoved && vel.length() > 0.0) {
      this.playerMoved = true;
      this.popup.fadeOut();
    }

    this.playerPos = this.playerPos.add(vel.scale(dt));

    this.popup.update(dt);

    for (let bullet of this.bullets) {
      bullet.update(dt);
    }

    this.bullets = this.bullets.filter(bullet => bullet.lifetime > 0.0)
  }

  render(context) {
    const width = context.canvas.width;
    const height = context.canvas.height;
    
    context.clearRect(0, 0, width, height);
    drawCircle(context, this.playerPos, radius, "red");

    this.popup.render(context);

    for (let bullet of this.bullets) {
      bullet.render(context);
    }    
  }

  keyDown(event) {
    this.pressedKeys.add(event.code);
  }

  keyUp(event) {
    this.pressedKeys.delete(event.code);
  }

  mouseMove(event) {
  }

  mouseDown(event) {
    const mousePos = new V2(event.offsetX, event.offsetY);
    const bulletVel = mousePos
          .sub(this.playerPos)
          .normalize()
          .scale(BULLET_SPEED)

    this.bullets.push(new Bullet(this.playerPos, bulletVel));
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

  document.addEventListener("mousemove", event => {
    game.mouseMove(event);
  })

  document.addEventListener("mousedown", event => {
    game.mouseDown(event);
  });   
})();

