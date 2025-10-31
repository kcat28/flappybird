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

//preload sprites
async function sprites() {
    //load background
    const bgImg = new Image();
    bgImg.src = background.imgSrc;
    await new Promise(res => bgImg.onload = res);
    background.img = bgImg;

    // load bird frames
    for (let src of bird.imgSrc){
        const img = new Image();
        img.src = src;
        await new Promise(res => img.onload = res);
        bird.imgs.push(img);
    }
}



function drawBackground() {
    ctx.drawImage(background.img, background.x, background.y, background.width, background.height);
}

// calls current bird frame in bird object and draws it on canvas
function drawBird() {
    const img = bird.imgs[bird.frameIndex];
    ctx.drawImage(img, bird.x, bird.y, bird.width, bird.height);
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
    const groundLevel = canvas.height - bird.height;
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

function flap() {
  bird.velocity = bird.jumpStrength;
  sounds.flap.currentTime = 0;
  sounds.flap.play();
}


async function startGame() {
    await sprites();

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBackground();
        updateBirdPosition();
        updateBirdAnimation();
        drawBird();
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}
startGame();