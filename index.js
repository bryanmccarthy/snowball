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

const PLAYER_SPEED = 1000;
const radius = 45;
const BULLET_SPEED = 2000;
const BULLET_RADIUS = 20;
const BULLET_LIFETIME = 3.0;
const POPUP_SPEED = 1.5;

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
    this.onFadedOut = undefined;
    this.onFadedIn = undefined;
  }

  update(dt) {
    this.alpha += this.dalpha * dt; 

    if (this.dalpha < 0.0 && this.alpha <= 0.0) {
      this.dalpha = 0.0;
      this.alpha = 0.0;

      if (this.onFadedOut !== undefined) {
        this.onFadedOut();
      }     
    } else if (this.dalpha > 0.0 && this.alpha >= 1.0) {
      this.dalpha = 0.0;
      this.alpha = 1.0;

      if (this.onFadedIn !== undefined) {
        this.onFadedIn();
      }
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
    this.dalpha = POPUP_SPEED;
  }

  fadeOut() {
    this.dalpha = -POPUP_SPEED;
  }
}

const TutorialState = Object.freeze({
  "LearningMovement": 0,
  "LearningShooting": 1,
  "Finished": 2
});

const TutorialMessages = Object.freeze([
  "WASD to move",
  "Left Mouse Click to shoot",
  ""
]);

class Tutorial {
  constructor() {
    this.state = 0;
    this.popup = new TutPopup("WASD to move");
    this.popup.fadeIn();
    this.popup.onFadedOut = () => {
      this.popup.text = TutorialMessages[this.state];
      this.popup.fadeIn();
    };
  }

  update(dt) {
    this.popup.update(dt);
  }

  render(context) {
    this.popup.render(context);
  }

  playerMoved() {
    if (this.state == TutorialState.LearningMovement) {
      this.popup.fadeOut();
      this.state += 1;
    }
  }
  
  playerShot() {
    if (this.state == TutorialState.LearningShooting) {
      this.popup.fadeOut();
      this.state += 1;
    }
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
    this.tutorial = new Tutorial();
    this.playerMoved = false;
    this.bullets = [];
  }

  update(dt) {
    let vel = new V2(0, 0);
    let moved = false;

    for (let key of this.pressedKeys) {
      if (key in dirMap) {
        vel = vel.add(dirMap[key].scale(PLAYER_SPEED))
        moved = true;
      }
    }

    if (moved) {
      this.tutorial.playerMoved();
    }

    this.playerPos = this.playerPos.add(vel.scale(dt));
    this.tutorial.update(dt);

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

    this.tutorial.render(context);

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
    this.tutorial.playerShot();
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

