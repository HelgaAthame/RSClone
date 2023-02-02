import Phaser from "phaser";

const width = window.innerWidth;
const height = window.innerHeight;

const ceilsNum = 11;
const fieldSquareLength = Math.floor(height / ceilsNum);
const fieldStartX = width / 2 - height / 2;

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

let char, grass, stones, enemy, bombs, explosion, cursors;

let bombActive = false;

const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("char", "./src/assets/char__sprite.png", {
    frameWidth: 64,
    frameHeight: 100,
  });

  this.load.image("grass", "./src/assets/grass.png");
  this.load.image("stone", "./src/assets/stone.jpg");

  this.load.image("explosion", "./src/assets/explosion__sprite.jfif");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");
}

function create() {
  stones = this.physics.add.staticGroup();
  const grass = this.add.group({
    key: "grass",
    repeat: ceilsNum ** 2 - 1,
    setScale: {
      x: (1 / 512) * fieldSquareLength,
      y: (1 / 512) * fieldSquareLength,
    },
  });

  /* Draw field */
  /* BIG WIDTH ONLY!!! */
  Phaser.Actions.GridAlign(grass.getChildren(), {
    width: ceilsNum,
    height: ceilsNum,
    cellWidth: fieldSquareLength + 2,
    cellHeight: fieldSquareLength + 2,
    x: -2 * fieldSquareLength + fieldStartX,
    y: -2 * fieldSquareLength,
  });

  /*   for (
    let i = 0;
    i < fieldEndX - fieldStartX + fieldSquareLength;
    i += fieldSquareLength
  ) {
    for (let j = 0; j < height + fieldSquareLength; j += fieldSquareLength) {
      if (
        i === 0 ||
        Math.floor(i) === Math.floor(fieldEndX - fieldStartX) ||
        j === 0 ||
        Math.floor(j) === Math.floor(height - fieldSquareLength)
      ) {
        stones
          .create(
            fieldStartX + i + fieldSquareLength / 2,
            j + fieldSquareLength / 2,
            "stone"
          )
          .setScale((1 / 1200) * fieldSquareLength)
          .refreshBody();
      } else {
        grass
          .create(
            fieldStartX + i + fieldSquareLength / 2,
            j + fieldSquareLength / 2,
            "grass"
          )
          .setScale((1 / 512) * fieldSquareLength)
          .refreshBody();
      }
    }
  } */

  char = this.physics.add.sprite(width / 2, height / 2 - 32, "char");

  this.physics.add.collider(char, stones);

  bombs = this.physics.add.group();
  this.physics.add.collider(char, bombs);
  this.physics.add.collider(stones, bombs);

  /* Draw Char */

  /* MOVE ANIMATIONS */
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

  /* BOMB ANIMATIONS */

  this.anims.create({
    key: "bombUp",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [35, 36, 37, 38, 39, 38, 37, 36],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "bombRight",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [20, 21, 22, 23, 24, 23, 22, 21],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "bombDown",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [25, 26, 27, 28, 29, 28, 27, 26],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "bombLeft",
    frames: this.anims.generateFrameNumbers("char", {
      frames: [30, 31, 32, 33, 34, 33, 32, 31],
    }),
    frameRate: 10,
    repeat: -1,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "char", frame: 7 }],
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  /* Char controls */
  if (cursors.space.isDown) {
    dropBomb(this);
  }
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
    char.anims.stop();
  }
}

function dropBomb(ctx) {
  const charX = char.body.center.x;
  const charY = char.body.center.y;

  if (!bombActive) {
    bombActive = true;
    const bomb = bombs.create(charX, charY, "bomb");

    const bombScaleX = (1 / 555) * fieldSquareLength;
    const bombScaleY = (1 / 569) * fieldSquareLength;
    bomb.setScale(bombScaleX / 1.3, bombScaleY / 1.3);
    setTimeout(() => (bombActive = false), 1000);

    ctx.tweens.add({
      targets: bomb,
      scaleX: bombScaleX / 1.5,
      scaleY: bombScaleY / 1.5,
      yoyo: true,
      repeat: -1,
      duration: 300,
      ease: "Sine.easeInOut",
    });

    const currentCharDirection = char.anims.currentAnim.key;
    switch (currentCharDirection) {
      case "up":
        char.anims.play("bombUp", true);
        break;
      case "right":
        char.anims.play("bombRight", true);
        break;
      case "down":
        char.anims.play("bombDown", true);
        break;
      case "left":
        char.anims.play("bombLeft", true);
        break;
    }
  }
}
