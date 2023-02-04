import Phaser from "phaser";

const width = window.innerWidth;
const height = window.innerHeight;
const ceilsNum = 11;
const fieldSquareLength = height / ceilsNum;
const fieldStartX = width / 2 - height / 2;
const fieldImgSize = 512;

const charStartX = fieldStartX + 1.5 * fieldSquareLength;
const charStartY = height - 1.5 * fieldSquareLength - 32;

const fieldMatrix = Array(ceilsNum)
  .fill(0)
  .map(() => Array(ceilsNum).fill(0));

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

let char, grass, stones, wood, enemy, bombs, explosion, cursors;

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

  this.load.image("grass", "./src/assets/grass.webp");
  this.load.image("stone", "./src/assets/stone.webp");
  this.load.image("wood", "./src/assets/wood.webp");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");
}

function create() {
  /* Draw field */
  /* BIG WIDTH ONLY!!! */

  stones = this.physics.add.staticGroup();
  grass = this.physics.add.staticGroup();
  wood = this.physics.add.staticGroup();

  for (let i = 1; i <= ceilsNum; i++) {
    for (let j = 1; j <= ceilsNum; j++) {
      const curSquareXCenter =
        fieldStartX + j * fieldSquareLength - fieldSquareLength / 2;
      const curSquareYCenter = i * fieldSquareLength - fieldSquareLength / 2;
      const randomWoodSquare = !Math.round(Math.random());

      const emptyStartLocations =
        (i === ceilsNum - 1 && j === 2) ||
        (i === ceilsNum - 2 && j === 2) ||
        (i === ceilsNum - 1 && j === 3);

      fieldMatrix[i - 1][j - 1] = {
        x: curSquareXCenter,
        y: curSquareYCenter,
      };

      fieldMatrix[i - 1][j - 1].material = "grass";
      grass
        .create(curSquareXCenter, curSquareYCenter, "grass")
        .setScale((1 / fieldImgSize) * fieldSquareLength)
        .refreshBody();

      if (randomWoodSquare && !emptyStartLocations) {
        fieldMatrix[i - 1][j - 1].material = "wood";
        wood
          .create(curSquareXCenter, curSquareYCenter, "wood")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
      }
      if (i === 1 || i === ceilsNum || j === 1 || j === ceilsNum) {
        fieldMatrix[i - 1][j - 1].material = "stone";
        stones
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
      }
      if (i % 3 === 0 && j % 3 === 0) {
        fieldMatrix[i - 1][j - 1].material = "stone";
        stones
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
      }
    }
  }

  char = this.physics.add.sprite(charStartX, charStartY, "char").setScale(0.78);

  this.physics.add.collider(char, stones);
  this.physics.add.collider(char, wood);

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
    const nextX = x + fieldSquareLength;
    const prevX = x - fieldSquareLength;
    const nextY = y + fieldSquareLength;
    const prevY = y - fieldSquareLength;

    bomb.destroy();
    const checkSquare = (x: number, y: number) => {
      const flatFieldMatrix = fieldMatrix.flat();
      const sqaureToCheck = flatFieldMatrix.find(
        (square) =>
          Math.floor(square.x) === Math.floor(x) &&
          Math.floor(square.y) === Math.floor(y)
      );

      if (sqaureToCheck.material === "stone") return;

      drawExplosion(x, y);

      switch (sqaureToCheck.material) {
        case "wood":
          const woodSquare = wood.children.entries.find((woodSquare) => {
            return (
              sqaureToCheck.x === woodSquare.x &&
              sqaureToCheck.y === woodSquare.y
            );
          });
          sqaureToCheck.material = "grass";
          woodSquare.destroy();

          break;

        case "grass":
          drawExplosion(x, y);
          break;
      }
    };

    checkSquare(x, y);
    checkSquare(nextX, y);
    checkSquare(prevX, y);
    checkSquare(x, nextY);
    checkSquare(x, prevY);
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
  return [closestSquare.x, closestSquare.y];
}
