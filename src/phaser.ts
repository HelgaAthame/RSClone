import Phaser from "phaser";
import FieldSquare from "./utils/fieldSquare.js";

const width = window.innerWidth;
const height = window.innerHeight;
const ceilsNum = 11;
const fieldSquareLength = height / ceilsNum;
const fieldStartX = width / 2 - height / 2;
const fieldImgSize = 512;

const charStartX = fieldStartX + 1.5 * fieldSquareLength;
const charStartY = height - 1.5 * fieldSquareLength;

const fieldMatrix: FieldSquare[][] = Array(ceilsNum)
  .fill([])
  .map(() => Array(ceilsNum).fill({ x: 0, y: 0, material: null }));

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

let char: Phaser.Physics.Matter.Sprite,
  enemy: Phaser.GameObjects.Group,
  grass: Phaser.Physics.Arcade.StaticGroup,
  stone: Phaser.Physics.Arcade.StaticGroup,
  wood: Phaser.Physics.Arcade.StaticGroup,
  bombs: Phaser.GameObjects.Sprite,
  explosion: Phaser.GameObjects.Sprite,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

let gameOver = false;
let bombActive = false;
let curLvlEnemies = 3;

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

  stone = this.physics.add.staticGroup();
  grass = this.physics.add.staticGroup();
  wood = this.physics.add.staticGroup();
  enemy = this.physics.add.group();
  bombs = this.physics.add.group();
  let enemyCounter = 0;

  for (let i = 1; i <= ceilsNum; i++) {
    for (let j = 1; j <= ceilsNum; j++) {
      const curSquareXCenter =
        fieldStartX + j * fieldSquareLength - fieldSquareLength / 2;
      const curSquareYCenter = i * fieldSquareLength - fieldSquareLength / 2;
      const randomWoodSquare = Math.round(Math.random());
      const randomEnemy = Math.round(Math.random());

      const emptyStartLocations =
        (i === ceilsNum - 1 && j === 2) ||
        (i === ceilsNum - 2 && j === 2) ||
        (i === ceilsNum - 1 && j === 3);

      fieldMatrix[i - 1][j - 1] = {
        x: curSquareXCenter,
        y: curSquareYCenter,
      };

      if (i === 1 || i === ceilsNum || j === 1 || j === ceilsNum) {
        fieldMatrix[i - 1][j - 1].material = "stone";
        stone
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }

      if (i % 3 === 0 && j % 3 === 0) {
        fieldMatrix[i - 1][j - 1].material = "stone";
        stone
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }

      fieldMatrix[i - 1][j - 1].material = "grass";
      grass
        .create(curSquareXCenter, curSquareYCenter, "grass")
        .setScale((1 / fieldImgSize) * fieldSquareLength)
        .refreshBody();

      if (i === ceilsNum - 1 && j === 2) {
        fieldMatrix[i - 1][j - 1].material = "char";
        continue;
      }
      if (randomWoodSquare && !emptyStartLocations) {
        fieldMatrix[i - 1][j - 1].material = "wood";
        wood
          .create(curSquareXCenter, curSquareYCenter, "wood")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }
      if (randomEnemy && !emptyStartLocations && enemyCounter < curLvlEnemies) {
        fieldMatrix[i - 1][j - 1].material = "enemy";
        enemyCounter++;
        enemy
          .create(curSquareXCenter, curSquareYCenter, "enemy")
          .setScale(0.22)
          .refreshBody();
      }
    }
  }

  char = this.physics.add
    .sprite(charStartX, charStartY, "char")
    .setScale(0.85, 0.77)
    .refreshBody();

  this.physics.add.collider(char, stone);
  this.physics.add.collider(char, wood);
  this.physics.add.collider(char, enemy);
  this.physics.add.collider(char, bombs);

  this.physics.add.collider(enemy, enemy);
  this.physics.add.collider(enemy, wood);
  this.physics.add.collider(enemy, stone);
  this.physics.add.collider(enemy, bombs);

  /*Draw explosion */

  this.anims.create({
    key: "bombExplosion",
    frames: this.anims.generateFrameNumbers("explosion", {
      frames: Array.from(Array(64).keys()),
    }),
    frameRate: 64,
    repeat: 0,
  });

  /* CHAR ANIMATIONS */
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
  if (gameOver) return;

  const explodeBomb = (
    bomb: Phaser.GameObjects.Image,
    x: number,
    y: number
  ) => {
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

      if (!sqaureToCheck) throw Error("Square to check was not found");
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
          if (!woodSquare) throw Error("Wood square was not found");
          sqaureToCheck.material = "grass";
          woodSquare.destroy();
          break;
        case "char":
          char.setTint(0xff0000);
          this.add.tween({
            targets: char,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 0,
            alpha: {
              getStart: () => 1,
              getEnd: () => 0,
            },
          });
          gameOver = true;
          break;
        case "enemy":
          const enemyToDestroy = enemy.children.entries.find(
            (enemy) =>
              enemy.x === sqaureToCheck.x && enemy.y === sqaureToCheck.y
          );
          if (!enemyToDestroy) throw Error("The enemy was not found");
          enemyToDestroy.setTint(0xff0000);
          this.add.tween({
            targets: enemyToDestroy,
            ease: "Sine.easeInOut",
            duration: 500,
            delay: 0,
            alpha: {
              getStart: () => 1,
              getEnd: () => 0,
            },
          });
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
      const [bombX, bombY] = findClosestSquare(char);

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

  const charMovement = (): void => {
    const [closestX, closestY] = findClosestSquare(char);
    const flatFieldMatrix = fieldMatrix.flat();
    const curCharSquare = flatFieldMatrix.find(
      (square) => square.material === "char"
    );
    if (!curCharSquare) throw Error("Current characher square was not found");
    curCharSquare.material = "grass";
    const newCharSquare = flatFieldMatrix.find(
      (square) =>
        Math.floor(square.x) === Math.floor(closestX) &&
        Math.floor(square.y) === Math.floor(closestY)
    );
    if (!newCharSquare) throw Error("New characher square was not found");
    newCharSquare.material = "char";

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
  };
  charMovement();

  const enemyMovement = (enemy: Phaser.Physics.Matter.Sprite): void => {
    const randomMove1 = [-160, 160][Math.floor(Math.random() * 2)];
    const randomMove2 = [-160, 160][Math.floor(Math.random() * 2)];

    const [closestX, closestY] = findClosestSquare(enemy);

    const flatFieldMatrix = fieldMatrix.flat();

    const newEnemySquare = flatFieldMatrix.find(
      (square) =>
        Math.floor(square.x) === Math.floor(closestX) &&
        Math.floor(square.y) === Math.floor(closestY)
    );

    if (!newEnemySquare) throw Error("New enemy square was not found");
    newEnemySquare.material = "enemy";
    if (
      enemy.body.position.x !== enemy.body.prev.x &&
      enemy.body.position.y !== enemy.body.prev.y
    ) {
      return;
    } else {
      enemy.setVelocityY(randomMove1);
      enemy.setVelocityX(randomMove2);
    }
  };
  enemy.children.entries.forEach((enemy) => enemyMovement(enemy));
}

function findClosestSquare(object: Phaser.Physics.Matter.Sprite) {
  const objectX = object.x;
  const objectY = object.y;
  const flatFieldMatrix = fieldMatrix.flat();
  const charToSquareDist = flatFieldMatrix.map((square) =>
    Math.sqrt((objectX - square.x) ** 2 + (objectY - square.y) ** 2)
  );

  const minDistSquare = Math.min(...charToSquareDist);
  const minDistSquareIndex = charToSquareDist.indexOf(minDistSquare);
  const closestSquare = flatFieldMatrix[minDistSquareIndex];
  return [closestSquare.x, closestSquare.y];
}
