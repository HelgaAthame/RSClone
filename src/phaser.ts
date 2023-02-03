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
  this.load.spritesheet("explosion", "./src/assets/explosion_sprite.png", {
    frameWidth: 64,
    frameHeight: 64,
  });

  this.load.image("grass", "./src/assets/grass.png");
  this.load.image("stone", "./src/assets/stone.jpg");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");
}

function create() {
  /* Draw field */
  /* BIG WIDTH ONLY!!! */
  grass = this.physics.add.staticGroup({
    key: "grass",
    repeat: ceilsNum ** 2 - 1,
    setScale: {
      x: (1 / 512) * fieldSquareLength,
      y: (1 / 512) * fieldSquareLength,
    },
  });
  Phaser.Actions.GridAlign(grass.getChildren(), {
    width: ceilsNum,
    height: ceilsNum,
    cellWidth: fieldSquareLength,
    cellHeight: fieldSquareLength,
    x: -2 * fieldSquareLength + fieldStartX,
    y: -2 * fieldSquareLength,
  });
  grass.refresh();

  stones = this.physics.add.staticGroup({
    key: "stone",
    repeat: ceilsNum * 4 - 2,
    setScale: {
      x: (1 / 1200) * fieldSquareLength,
      y: (1 / 1200) * fieldSquareLength,
    },
  });

  char = this.physics.add.sprite(width / 2, height / 2 - 32, "char");

  this.physics.add.collider(char, stones);

  bombs = this.physics.add.group();

  this.physics.add.collider(char, bombs);
  this.physics.add.collider(stones, bombs);

  /* Draw Char */

  // explosion = this.physics.add.sprite(width / 2, height / 2, "explosion");
  this.anims.create({
    key: "bombExplosion",
    frames: this.anims.generateFrameNumbers("explosion", {
      frames: Array.from(Array(64).keys()),
    }),
    frameRate: 64,
    repeat: 0,
  });

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
  const explodeBomb = (bomb, x: number, y: number) => {
    bomb.destroy();
    drawExplosion(x, y);
    drawExplosion(x + fieldSquareLength, y);
    drawExplosion(x - fieldSquareLength, y);
    drawExplosion(x, y + fieldSquareLength);
    drawExplosion(x, y - fieldSquareLength);
  };

  const drawExplosion = (x: number, y: number) => {
    explosion = this.physics.add.sprite(x, y, "explosion");
    const explosionAnim = explosion.anims.play("bombExplosion", false);
    explosionAnim.once("animationcomplete", () => {
      explosionAnim.destroy();
    });
  };

  const dropBomb = () => {
    const charX = char.body.center.x;
    const charY = char.body.center.y;

    if (!bombActive) {
      bombActive = true;
      const bomb = bombs.create(charX, charY, "bomb").setImmovable();
      const bombScaleX = (1 / 555) * fieldSquareLength;
      const bombScaleY = (1 / 569) * fieldSquareLength;
      bomb.setScale(bombScaleX / 1.3, bombScaleY / 1.3);
      setTimeout(() => (bombActive = false), 1000);

      this.tweens.add({
        targets: bomb,
        scaleX: bombScaleX / 1.5,
        scaleY: bombScaleY / 1.5,
        yoyo: true,
        repeat: -1,
        duration: 300,
        ease: "Sine.easeInOut",
      });

      setTimeout(() => {
        explodeBomb(bomb, charX, charY);
      }, 1000);

      if (char.anims?.currentAnim) {
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
          default:
            char.anims.play("bombUp", true);
            break;
        }
      }
    }
  };

  /* Char controls */
  if (cursors.space.isDown) {
    dropBomb();
  }
  if (cursors.up.isDown) {
    char.setVelocityY(-160);
    char.setVelocityX(0);
    char.anims.play("up", true);
  } else if (cursors.right.isDown) {
    char.setVelocityX(160);
    char.setVelocityY(0);
    char.anims.play("right", true);
  } else if (cursors.down.isDown) {
    char.setVelocityY(160);
    char.setVelocityX(0);
    char.anims.play("down", true);
  } else if (cursors.left.isDown) {
    char.setVelocityX(-160);
    char.setVelocityY(0);
    char.anims.play("left", true);
  } else {
    char.setVelocityX(0);
    char.setVelocityY(0);
    char.anims.stop();
  }
}
