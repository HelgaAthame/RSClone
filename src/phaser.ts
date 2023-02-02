import Phaser from "phaser";

const width = window.innerWidth;
const height = window.innerHeight;

const config = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let char, grass, enemy, bomb, explosion, cursors;

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("char", "./src/assets/char__sprite.png", {
    frameWidth: 64,
    frameHeight: 100,
  });

  this.load.image("grass", "./src/assets/grass.png");

  this.load.image("explosion", "./src/assets/explosion__sprite.jfif");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");
  /*   this.load.image("logo", "assets/sprites/phaser3-logo.png");
  this.load.image("red", "assets/particles/red.png"); */
}

function create() {
  const fieldSquareLength = height / 11;
  const fieldStartX = width / 2 - height / 2;
  const fieldEndX = fieldStartX + height;

  for (let i = fieldStartX; i < fieldEndX; i += fieldSquareLength) {
    for (let j = 0; j < height; j += fieldSquareLength) {
      console.log(j);
      this.physics.add
        .image(
          fieldStartX + i * fieldSquareLength,
          j * fieldSquareLength,
          "grass"
        )
        .setScale(1 / 11);
    }
  }

  this.physics.add.image(width / 2, height / 2, "grass").setScale(1 / 11);

  char = this.physics.add.sprite(width / 2, height / 2 - 32, "char");

  this.anims.create({
    key: "up",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [15, 16, 17, 18, 19, 18, 17, 16],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [0, 1, 2, 3, 4, 3, 2, 1],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "down",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [5, 6, 7, 8, 9, 8, 7, 6],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [10, 11, 12, 13, 14, 13, 12, 11],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "char", frame: 7 }],
    frameRate: 20,
  });

  cursors = this.input.keyboard.createCursorKeys();

  /*   this.add.image(width / 2, height / 2, "sky");

  const particles = this.add.particles("red");

  const emitter = particles.createEmitter({
    speed: 100,
    scale: { start: 1, end: 0 },
    blendMode: "ADD",
  });

  const logo = this.physics.add.image(400, 100, "logo");

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo); */
}

function update() {
  if (cursors.up.isDown) {
    char.setVelocityY(-160);
    char.anims.play("up", true);
  } else if (cursors.right.isDown) {
    char.setVelocityX(160);
    char.anims.play("right", true);
  } else if (cursors.down.isDown) {
    char.setVelocityY(160);
    char.anims.play("down", true);
  } else if (cursors.left.isDown) {
    char.setVelocityX(-160);
    char.anims.play("left", true);
  } else {
    char.setVelocityX(0);
    char.setVelocityY(0);
    char.anims.play("turn");
  }
}
