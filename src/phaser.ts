import Phaser from "phaser";

const width = window.innerWidth;
const height = window.innerHeight;
const ceilsNum = 11;
const fieldSquareLength = height / ceilsNum;
const fieldStartX = width / 2 - height / 2;

const fieldMatrix = Array(ceilsNum + 1)
  .fill(0)
  .map(() => Array(ceilsNum + 1).fill(0));

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
    char: "",
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
    frameHeight: 99,
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

  stones = this.physics.add.staticGroup();
  const stoneImgSize = 1200;
  grass = this.physics.add.staticGroup();
  const grassImgSize = 512;

  for (let i = 0; i <= ceilsNum; i++) {
    for (let j = 0; j <= ceilsNum; j++) {
      fieldMatrix[i][j] = {
        x: j * fieldSquareLength + fieldSquareLength / 2,
        y: fieldStartX + i * fieldSquareLength + fieldSquareLength / 2,
      };
      if (i === 0 || i === ceilsNum || j === 0 || j === ceilsNum - 1) {
        fieldMatrix[i][j].material = "stone";
        stones
          .create(
            fieldStartX + i * fieldSquareLength + fieldSquareLength / 2,
            j * fieldSquareLength + fieldSquareLength / 2,
            "stone"
          )
          .setScale((1 / stoneImgSize) * fieldSquareLength)
          .refreshBody();
      } else {
        fieldMatrix[i][j].material = "grass";
        grass
          .create(
            fieldStartX + i * fieldSquareLength + fieldSquareLength / 2,
            j * fieldSquareLength + fieldSquareLength / 2,
            "grass"
          )
          .setScale((1 / grassImgSize) * fieldSquareLength)
          .refreshBody();
      }
    }
  }

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

  this.anims.create({
    key: "placeBomb",
    frames: [{ key: "char", frame: 27 }],
    frameRate: 10,
    repeat: -1,
  });

  cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const explodeBomb = (bomb, x: number, y: number) => {
    const flatFieldMatrix = fieldMatrix.flat();
    console.log(
      flatFieldMatrix.find((square) => square.x === x && square.y === y)
    );
    bomb.destroy();
    drawExplosion(x, y);

    if (
      flatFieldMatrix.find(
        (square) => square.x === x + fieldSquareLength && square.y === y
      ).material !== "stone"
    ) {
      drawExplosion(x + fieldSquareLength, y);
    }

    if (
      flatFieldMatrix.find(
        (square) => square.x === x - fieldSquareLength && square.y === y
      ).material !== "stone"
    ) {
      drawExplosion(x - fieldSquareLength, y);
    }
    if (
      flatFieldMatrix.find(
        (square) => square.x === x && square.y === y + fieldSquareLength
      ).material !== "stone"
    ) {
      drawExplosion(x, y + fieldSquareLength);
    }

    if (
      flatFieldMatrix.find(
        (square) => square.x === x && square.y === y - fieldSquareLength
      ).material !== "stone"
    ) {
      drawExplosion(x, y - fieldSquareLength);
    }
  };

  const drawExplosion = (x: number, y: number) => {
    explosion = this.physics.add.sprite(x, y, "explosion");
    const explosionAnim = explosion.anims.play("bombExplosion", false);
    explosionAnim.once("animationcomplete", () => {
      explosionAnim.destroy();
    });
  };

  const dropBomb = () => {
    if (!bombActive) {
      const [bombX, bombY] = findClosestSquare();

      bombActive = true;
      const bomb = bombs.create(bombX, bombY, "bomb").setImmovable();
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
        explodeBomb(bomb, bombX, bombY);
      }, 1000);

      char.anims.play("placeBomb", true);
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
  } else if (!cursors.space.isDown) {
    char.setVelocityX(0);
    char.setVelocityY(0);
    char.anims.play("turn", true);
  }
}

function findClosestSquare() {
  const charX = char.body.center.x;
  const charY = char.body.center.y;
  const flatFieldMatrix = fieldMatrix.flat();
  const charToSquareDist = flatFieldMatrix.map((square) =>
    Math.sqrt((charX - square.x) ** 2 + (charY - square.y) ** 2)
  );

  const minDistSquare = Math.min(...charToSquareDist);
  const minDistSquareIndex = charToSquareDist.indexOf(minDistSquare);
  const closestSquare = flatFieldMatrix[minDistSquareIndex];
  console.log(fieldMatrix);
  return [closestSquare.x, closestSquare.y];
}
