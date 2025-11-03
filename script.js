const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// asset paths and sprites-----------------------
const SCORE_SPRITES = {
  0: 'flappy-bird-assets-1.1.0/sprites/0.png',
  1: 'flappy-bird-assets-1.1.0/sprites/1.png',
  2: 'flappy-bird-assets-1.1.0/sprites/2.png',
  3: 'flappy-bird-assets-1.1.0/sprites/3.png',
  4: 'flappy-bird-assets-1.1.0/sprites/4.png',
  5: 'flappy-bird-assets-1.1.0/sprites/5.png',
  6: 'flappy-bird-assets-1.1.0/sprites/6.png',
  7: 'flappy-bird-assets-1.1.0/sprites/7.png',
  8: 'flappy-bird-assets-1.1.0/sprites/8.png',
  9: 'flappy-bird-assets-1.1.0/sprites/9.png',
};

// game objects-----------------------
const bird = {
  imgSrc: [
    'flappy-bird-assets-1.1.0/sprites/yellowbird-upflap.png',
    'flappy-bird-assets-1.1.0/sprites/yellowbird-midflap.png',
    'flappy-bird-assets-1.1.0/sprites/yellowbird-downflap.png',
  ],
  imgs: [],
  frameIndex: 0,
  frameDelay: 6,
  frameTick: 0,
  x: 70, y: 297,
  width: 34, height: 24,
  velocity: 0,
  gravity: 0.4,
  jumpStrength: -7,
  rotation: 0,
  rotationSpeed: 0.05,
  maxUpRotation: -0.33,
  maxDownRotation: 0.4,
};

const background = {
  imgSrc: 'flappy-bird-assets-1.1.0/sprites/background-day.png',
  img: null,
  x: 0, y: 0,
  width: canvas.width,
  height: canvas.height,
};

const base = {
  imgSrc: 'flappy-bird-assets-1.1.0/sprites/base.png',
  img: null,
  x: 0, y: canvas.height - 112,
  width: canvas.width,
  height: 112,
};

const pipe = {
  imgSrc: 'flappy-bird-assets-1.1.0/sprites/pipe-green.png',
  img: null,
  width: 52,
  height: 320,
};

const menuMessage = {
  imgSrc: 'flappy-bird-assets-1.1.0/sprites/message.png',
  img: null,
  x: (canvas.width - 178) / 2,
  y: 120,
  width: 180,
  height: 250,
};

const gameOverMessage = {
  imgSrc: 'flappy-bird-assets-1.1.0/sprites/gameover.png',
  img: null,
  x: (canvas.width - 192) / 2,
  y: 140,
  width: 192,
  height: 42,
};

// sounds-----------------------
const sounds = {
  flap: new Audio('flappy-bird-assets-1.1.0/audio/wing.wav'),
  score: new Audio('flappy-bird-assets-1.1.0/audio/point.wav'),
  hit: new Audio('flappy-bird-assets-1.1.0/audio/hit.wav'),
  die: new Audio('flappy-bird-assets-1.1.0/audio/die.wav'),
  point: new Audio('flappy-bird-assets-1.1.0/audio/point.wav'),
};

// score images / state-----------------------
let scoreImgs = {};
let score = 0;

// pipe state and settings-----------------------
let pipes = [];
const pipeGap = 120;
const pipeSpeed = 2;
let pipeTimer = 0;
const pipeSpawnInterval = 90;

// collision logic -----------------------
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

// collision checker-----------------------
function checkCollisions() {
  const birdRect = {
    x: bird.x,
    y: bird.y,
    width: bird.width,
    height: bird.height,
  };

  for (let p of pipes) {
    const topPipeRect = {
      x: p.x,
      y: p.gapY - pipe.height - pipeGap / 2,
      width: pipe.width,
      height: pipe.height,
    };
    const bottomPipeRect = {
      x: p.x,
      y: p.gapY + pipeGap / 2,
      width: pipe.width,
      height: pipe.height,
    };

    if (isColliding(birdRect, topPipeRect) || isColliding(birdRect, bottomPipeRect)) {
      return true; // collision happened
    }
  }

  // check ground
  if (bird.y + bird.height >= canvas.height - base.height) {
    return true;
  }

  return false;
}

// input handling-----------------------
function flap() {
  if (currentState === GAME_STATE.MENU) {
    currentState = GAME_STATE.PLAYING;
  }

  if (currentState === GAME_STATE.PLAYING) {
  bird.velocity = bird.jumpStrength;
  bird.rotation = bird.maxUpRotation;
  sounds.flap.currentTime = 0;
  sounds.flap.play();
  }

  if (currentState === GAME_STATE.GAMEOVER) {
    resetGame();
    currentState = GAME_STATE.MENU;
  }
}

// flap listener and state manager-----------------------
canvas.addEventListener('click', flap);
document.addEventListener('keydown', e => {
  if (e.code === 'Space') flap();
});

//game states-----------------------
const GAME_STATE = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER',
};
let currentState = GAME_STATE.MENU;

// reset game state-----------------------
function resetGame() {
  // reset positions & states
  bird.y = 297;
  bird.velocity = 0;
  bird.rotation = 0;
  pipes = [];
  score = 0;
  pipeTimer = 0;
  createPipe();
}

// preloading sprites-----------------------
async function sprites() {
  // menu image
  const menuImg = new Image();
  menuImg.src = menuMessage.imgSrc;
  await new Promise(res => menuImg.onload = res);
  menuMessage.img = menuImg;

  // game over image
  const gameOverImg = new Image();
  gameOverImg.src = gameOverMessage.imgSrc;
  await new Promise(res => gameOverImg.onload = res);
  gameOverMessage.img = gameOverImg;

  // score digits
  for (let i = 0; i <= 9; i++) {
    const img = new Image();
    img.src = SCORE_SPRITES[i];
    await new Promise(res => img.onload = res);
    scoreImgs[i] = img;
  }

  // background
  const bgImg = new Image();
  bgImg.src = background.imgSrc;
  await new Promise(res => bgImg.onload = res);
  background.img = bgImg;

  // base
  const baseImg = new Image();
  baseImg.src = base.imgSrc;
  await new Promise(res => baseImg.onload = res);
  base.img = baseImg;

  // bird frames
  for (let src of bird.imgSrc) {
    const img = new Image();
    img.src = src;
    await new Promise(res => img.onload = res);
    bird.imgs.push(img);
  }

  // pipe image
  const pipeImg = new Image();
  pipeImg.src = pipe.imgSrc;
  await new Promise(res => pipeImg.onload = res);
  pipe.img = pipeImg;
}

// drawing functions-----------------------
function drawScene() {
  // background
  ctx.drawImage(background.img, background.x, background.y, background.width, background.height);

  // pipes
  for (const p of pipes) {
    // top pipe (flipped)
    const topY = p.gapY - pipe.height - pipeGap / 2;
    ctx.save();
    ctx.translate(p.x + pipe.width / 2, topY + pipe.height / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(pipe.img, -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
    ctx.restore();

    // bottom pipe
    const bottomY = p.gapY + pipeGap / 2;
    ctx.drawImage(pipe.img, p.x, bottomY, pipe.width, pipe.height);
  }

  // base (repeating)
  ctx.drawImage(base.img, base.x, base.y, base.width, base.height);
  ctx.drawImage(base.img, base.x + base.width, base.y, base.width, base.height);

  // bird (with rotation & frame)
  const img = bird.imgs[bird.frameIndex];
  ctx.save();
  ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
  ctx.rotate(bird.rotation);
  ctx.drawImage(img, -bird.width / 2, -bird.height / 2, bird.width, bird.height);
  ctx.restore();

  // score
  const scoreStr = score.toString();
  const digitWidth = 24;
  const totalWidth = scoreStr.length * digitWidth;
  const startX = canvas.width / 2 - totalWidth / 2;
  const y = 50;
  for (let i = 0; i < scoreStr.length; i++) {
    const digit = scoreStr[i];
    ctx.drawImage(scoreImgs[digit], startX + i * digitWidth, y);
  }
}


// update functions-----------------------
function updateBirdAnimation() {
  bird.frameTick++;
  if (bird.frameTick >= bird.frameDelay) {
    bird.frameTick = 0;
    bird.frameIndex = (bird.frameIndex + 1) % bird.imgs.length;
  }
}

function updateBirdPosition() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  const groundLevel = canvas.height - base.height - bird.height;

  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
  } else if (bird.y > groundLevel) {
    bird.y = groundLevel;
    bird.velocity = 0;
  }

  if (bird.velocity < 0) {
    bird.rotation = bird.maxUpRotation;
  } else {
    if (bird.rotation < bird.maxDownRotation) {
      bird.rotation += bird.rotationSpeed;
    }
  }
}

function createPipe() {
  const minGapY = 80;
  const maxGapY = canvas.height - pipeGap - 80;
  const gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
  pipes.push({ x: canvas.width, gapY: gapY, scored: false });
}

function updatePipes() {
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= pipeSpeed;
  }

  // remove off-screen pipes
  if (pipes.length && pipes[0].x + pipe.width < 0) {
    pipes.shift();
  }

  updateScore();
}

function updateScore() {
  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    if (!p.scored && p.x + pipe.width < bird.x + 65) {
      score++;
      p.scored = true;
      const sfx = sounds.score.cloneNode();
      sfx.currentTime = 0.16;
      sfx.play();
    }
  }
}

function updateBase() {
  base.x -= pipeSpeed;
  if (base.x <= -base.width) {
    base.x = 0;
  }
}


// game loop----------------------- 
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (currentState === GAME_STATE.PLAYING) {
    // Update game only when playing
    pipeTimer++;
    if (pipeTimer > pipeSpawnInterval) {
      createPipe();
      pipeTimer = 0;
    }

    updatePipes();
    updateBase();
    updateBirdPosition();
    updateBirdAnimation();

    if (checkCollisions()) {
      currentState = GAME_STATE.GAMEOVER;
      sounds.hit.play();
      sounds.die.play();
    }
  }

  // Always draw scene
  drawScene();

  // Draw overlays for MENU or GAMEOVER
  if (currentState === GAME_STATE.MENU) {
    ctx.drawImage(menuMessage.img, menuMessage.x, menuMessage.y, menuMessage.width, menuMessage.height);
  } else if (currentState === GAME_STATE.GAMEOVER) {
    ctx.drawImage(gameOverMessage.img, gameOverMessage.x, gameOverMessage.y, gameOverMessage.width, gameOverMessage.height);
  }

  requestAnimationFrame(gameLoop);
}

async function startGame() {
  await sprites();
  requestAnimationFrame(gameLoop);
}

startGame();



