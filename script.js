const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

//listener
canvas.addEventListener('click', flap);
// Listen for player input
document.addEventListener('keydown', e => {
  if (e.code === 'Space') flap();
});

// global sound storage
const sounds = {
  flap: new Audio('flappy-bird-assets-1.1.0/audio/wing.wav')
};


//game objects --
//bird object
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
    x: 50, y: 150,
    width: 34, height: 24,

    //physics properties
    velocity: 0,
    gravity: 0.4,
    jumpStrength: -7,
}

//background object
const background = {
    imgSrc: 'flappy-bird-assets-1.1.0/sprites/background-day.png',
    img: null,
    x: 0, y: 0,
    width: canvas.width,
    height: canvas.height, 
}

const base = {
    imgSrc: 'flappy-bird-assets-1.1.0/sprites/base.png',
    img: null,
    x: 0, y: canvas.height - 112,
    width: canvas.width,
    height: 112,
}

const pipe = {
    imgSrc: 'flappy-bird-assets-1.1.0/sprites/pipe-green.png',
    img: null,
    width: 52,
    height: 320,
}

//preloading sprites
async function sprites() {
    //load background
    const bgImg = new Image();
    bgImg.src = background.imgSrc;
    await new Promise(res => bgImg.onload = res);
    background.img = bgImg;

    const baseImg = new Image();
    baseImg.src = base.imgSrc;
    await new Promise(res => baseImg.onload = res);
    base.img = baseImg;

    // load bird frames
    for (let src of bird.imgSrc){
        const img = new Image();
        img.src = src;
        await new Promise(res => img.onload = res);
        bird.imgs.push(img);
    }
    
    //load pipe img
    const pipeImg = new Image();
    pipeImg.src = pipe.imgSrc;
    await new Promise(res => pipeImg.onload = res);
    pipe.img = pipeImg;
}

// draws background on canvas
function drawBackground() {
    ctx.drawImage(background.img, background.x, background.y, background.width, background.height);
}

// calls current bird frame in bird object and draws it on canvas
function drawBird() {
    const img = bird.imgs[bird.frameIndex];
    ctx.drawImage(img, bird.x, bird.y, bird.width, bird.height);
}


let pipes = [];
const pipeGap = 120;
const pipeSpeed = 2;

function createPipe() {
  const minGapY = 80;
  const maxGapY = canvas.height - pipeGap - 80;
  const gapY = Math.floor(Math.random() * (maxGapY - minGapY + 1)) + minGapY;
  pipes.push({ x: canvas.width, gapY: gapY });
}

function drawPipes() {
  for (const p of pipes) {
    const topY = p.gapY - pipe.height - pipeGap / 2;
    ctx.save();
    ctx.translate(p.x + pipe.width / 2, topY + pipe.height / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(pipe.img, -pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
    ctx.restore();

    // Bottom pipe — draw from gap down
    const bottomY = p.gapY + pipeGap / 2;
    ctx.drawImage(pipe.img, p.x, bottomY, pipe.width, pipe.height);
  }
}


function drawBase() {
  ctx.drawImage(base.img, base.x, base.y, base.width, base.height);
  ctx.drawImage(base.img, base.x + base.width, base.y, base.width, base.height);
}


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
    //prevents going off screen
    if (bird.y < 0) {
    bird.y = 0;
    bird.velocity = 0;
    } 
    else if (bird.y > groundLevel) {
    bird.y = groundLevel;
    bird.velocity = 0;
    }
}

function updatePipes() {
  for (let i = 0; i < pipes.length; i++){
    pipes[i].x -= pipeSpeed;

    if (pipes[i].x + pipe.width < 0) {
      pipes.splice(i, 1);
      createPipe();
    }
  }
}

function updateBase() {
  base.x -= pipeSpeed;
  if (base.x <= -base.width / 2) {
    base.x = 0;
  }
}


function flap() {
  bird.velocity = bird.jumpStrength;
  sounds.flap.currentTime = 0;
  sounds.flap.play();
}


async function startGame() { //state 1 - playing
    await sprites();
    createPipe();
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        updatePipes();
        drawPipes();
        updateBase();
        drawBase();
        updateBirdPosition();
        updateBirdAnimation();
        drawBird();
        
        requestAnimationFrame(gameLoop); // clarify later
    }
    gameLoop();
}
startGame();