import Phaser from "phaser";
import { model } from "./model/index.js";
import FieldSquare from "./utils/fieldSquare.js";
import { view } from "./view/index.js";
import keys from './utils/keys.js;'

//let score = model.score;
//let livesCount = model.lives;
let bombSpeed = model.bombSpeed;

const width = window.innerWidth;
const height = window.innerHeight;
const ceilsNum = 11;
const fieldSquareLength = height / ceilsNum;
const fieldStartX = width / 2 - height / 2;
const fieldImgSize = 512;

const charStartX = fieldStartX + 1.5 * fieldSquareLength;
const charStartY = height - 1.5 * fieldSquareLength;
const charSpeed = 160;

let enemySpeed = model.enemySpeed;

const textStartX = fieldStartX + 0.5 * fieldSquareLength;
const textStartY = 0.3 * fieldSquareLength;
const style = {
  font: "bold 1.2rem Arial",
  fill: "#000",
  wordWrap: true,
  wordWrapWidth: 2,
  align: "center",
  stroke: "#fff",
  strokeThickness: 3,
};

let fieldMatrix: FieldSquare[][] = Array(ceilsNum)
  .fill([])
  .map(() => Array(ceilsNum).fill({ x: 0, y: 0, object: null }));

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
  enemies: Phaser.GameObjects.Group,
  grass: Phaser.Physics.Arcade.StaticGroup,
  stone: Phaser.Physics.Arcade.StaticGroup,
  wood: Phaser.Physics.Arcade.StaticGroup,
  bombs: Phaser.GameObjects.Sprite,
  explosion: Phaser.GameObjects.Sprite,
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;

export let gameOver = false;
let bombActive = false;
let curLvlEnemies: number;

export const game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("char", "./src/assets/char__sprite.png", {
    frameWidth: 64,
    frameHeight: 99,
  });
  this.load.spritesheet("explosion", "./src/assets/explosion_sprite.png", {
    frameWidth: 64,
    frameHeight: 64,
  });

  this.load.image("grass", "./src/assets/grass.jpg");
  this.load.image("stone", "./src/assets/stone.jpg");
  this.load.image("wood", "./src/assets/wood.jpg");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");
}

function create() {

  curLvlEnemies = model.enemies + model.level;
  enemySpeed = model.enemySpeed + model.level * 10;
  /* Draw field */
  /* BIG WIDTH ONLY!!! */

  stone = this.physics.add.staticGroup();
  grass = this.physics.add.staticGroup();
  wood = this.physics.add.staticGroup();
  enemies = this.physics.add.group();
  bombs = this.physics.add.group();
  let enemyCounter = 0;

  for (let i = 1; i <= ceilsNum; i++) {
    for (let j = 1; j <= ceilsNum; j++) {
      const curSquareXCenter =
        fieldStartX + j * fieldSquareLength - fieldSquareLength / 2;
      const curSquareYCenter = i * fieldSquareLength - fieldSquareLength / 2;
      const randomWoodSquare = Math.round(Math.random());

      const emptyStartLocations =
        (i === ceilsNum - 1 && j === 2) ||
        (i === ceilsNum - 2 && j === 2) ||
        (i === ceilsNum - 1 && j === 3);

      fieldMatrix[i - 1][j - 1] = {
        x: curSquareXCenter,
        y: curSquareYCenter,
      };

      if (i === 1 || i === ceilsNum || j === 1 || j === ceilsNum) {
        fieldMatrix[i - 1][j - 1].object = "stone";
        stone
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }

      if (i % 3 === 0 && j % 3 === 0) {
        fieldMatrix[i - 1][j - 1].object = "stone";
        stone
          .create(curSquareXCenter, curSquareYCenter, "stone")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }

      fieldMatrix[i - 1][j - 1].object = "grass";
      grass
        .create(curSquareXCenter, curSquareYCenter, "grass")
        .setScale((1 / fieldImgSize) * fieldSquareLength)
        .refreshBody();

      if (i === ceilsNum - 1 && j === 2) {
        fieldMatrix[i - 1][j - 1].object = "char";
        continue;
      }
      if (randomWoodSquare && !emptyStartLocations) {
        fieldMatrix[i - 1][j - 1].object = "wood";
        wood
          .create(curSquareXCenter, curSquareYCenter, "wood")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();
        continue;
      }
    }
  }

  char = this.physics.add
    .sprite(charStartX, charStartY, "char")
    .setSize(fieldSquareLength * 0.99, fieldSquareLength * 0.99)
    .setScale(0.9, 0.9)
    .refreshBody();

  while (enemyCounter < curLvlEnemies) {
    const randomX = Math.floor(Math.random() * (ceilsNum - 1) + 1);
    const randomY = Math.floor(Math.random() * (ceilsNum - 1) + 1);

    if (
      fieldMatrix[randomX][randomY].object !== "grass" ||
      (randomX === ceilsNum - 2 && randomY === 1) ||
      (randomX === ceilsNum - 3 && randomY === 1) ||
      (randomX === ceilsNum - 2 && randomY === 2)
    )
      continue;
    fieldMatrix[randomX][randomY].object = `enemy_${enemyCounter}`;
    enemyCounter++;
    enemies
      .create(
        fieldMatrix[randomX][randomY].x,
        fieldMatrix[randomX][randomY].y,
        "enemy"
      )
      .setSize(fieldSquareLength * 0.8, fieldSquareLength * 0.8)
      .setScale(0.22)
      .refreshBody();
  }

  this.physics.add.collider(char, stone);
  this.physics.add.collider(char, wood);
  this.physics.add.collider(char, enemies, () => {
    if (!gameOver) charDie.apply(this);
  });
  this.physics.add.collider(char, bombs);

  this.physics.add.collider(enemies, enemies);
  this.physics.add.collider(enemies, wood);
  this.physics.add.collider(enemies, stone);
  this.physics.add.collider(enemies, bombs);

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

  this.add.text(textStartX, textStartY, `SCORE : ${model.score}`, style);

  this.add.text(
    textStartX + 4 * fieldSquareLength,
    textStartY,
    `LIVES : ${("❤️").repeat(model.lives)}`,
    style
  );
  this.add.text(textStartX + 9 * fieldSquareLength, textStartY, `LEVEL : ${model.level}`, style);


  //if there is field matrix in model - we take it
  //if no - we write it into model
  if (model.fieldMatrix) {
    fieldMatrix = model.fieldMatrix;
  } else {
    model.fieldMatrix = fieldMatrix;
  }

}

function update() {
  const bombSet = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]);

  if (gameOver) {
    if (/*cursors.space.isDown*/bombSet.isDown && model.lives) restartScene.apply(this);
    else if (/*cursors.space.isDown*/bombSet.isDown && !model.lives) restartGame.apply(this);
    else return;
  }

  if (!gameOver && /*cursors.space*/bombSet.isDown) {
    dropBomb.apply(this);
  }


  const keyESC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
  if (keyESC.isDown) {
    gameOver = true;
    model.fieldMatrix = fieldMatrix;//save field state
    view.settings.renderUI();
  }

  charMovement.apply(this);
  enemies.children.entries.forEach((enemy) => enemyMovement(enemy));
}

function charMovement(): void {
  const bombSet = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]);
  const up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowUp]);
  const down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowDown]);
  const left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowLeft]);
  const right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowRight]);

  const [closestX, closestY] = findClosestSquare(char);
  const flatFieldMatrix = fieldMatrix.flat();
  const curCharSquare = flatFieldMatrix.find(
    (square) => square.object === "char"
  );
  if (curCharSquare) {
    curCharSquare.object = "grass";
    const newCharSquare = flatFieldMatrix.find(
      (square) =>
        Math.floor(square.x) === Math.floor(closestX) &&
        Math.floor(square.y) === Math.floor(closestY)
    );
    if (!newCharSquare) throw Error("New characher square was not found");
    newCharSquare.object = "char";
  }

  if (/*cursors.*/up.isDown) {
    char.setVelocityY(-charSpeed);
    char.setVelocityX(0);
    char.anims.play("up", true);
  } else if (/*cursors.*/right.isDown) {
    char.setVelocityX(charSpeed);
    char.setVelocityY(0);
    char.anims.play("right", true);
  } else if (/*cursors.*/down.isDown) {
    char.setVelocityY(charSpeed);
    char.setVelocityX(0);
    char.anims.play("down", true);
  } else if (/*cursors.*/left.isDown) {
    char.setVelocityX(-charSpeed);
    char.setVelocityY(0);
    char.anims.play("left", true);
  } else if (!/*cursors.space*/bombSet.isDown) {
    char.setVelocityX(0);
    char.setVelocityY(0);
    char.anims.play("turn", true);
  }
}
function enemyMovement(enemy: Phaser.Physics.Matter.Sprite): void {
  const [closestX, closestY] = findClosestSquare(enemy);
  const flatFieldMatrix = fieldMatrix.flat();

  const newEnemySquare = flatFieldMatrix.find(
    (square) =>
      Math.floor(square.x) === Math.floor(closestX) &&
      Math.floor(square.y) === Math.floor(closestY)
  );

  const curEnemyID = enemies.children.entries.indexOf(enemy);
  if (!newEnemySquare) throw Error("New enemy square was not found");
  newEnemySquare.object = `enemy_${curEnemyID}`;

  if (
    enemy.body.position.x == enemy.body.prev.x &&
    enemy.body.position.y == enemy.body.prev.y
  ) {
    const random = Math.random();
    if (random > 0.75) {
      enemy.setVelocityX(0);
      enemy.setVelocityY(160);
    } else if (random > 0.5) {
      enemy.setVelocityX(0);
      enemy.setVelocityY(-160);
    } else if (random > 0.25) {
      enemy.setVelocityX(160);
      enemy.setVelocityY(0);
    } else {
      enemy.setVelocityX(-160);
      enemy.setVelocityY(0);
    }
  }

  // const randomMove1 = [-enemySpeed, enemySpeed][Math.floor(Math.random() * 2)];
  // const randomMove2 = [-enemySpeed, enemySpeed][Math.floor(Math.random() * 2)];

  // if (
  //   enemy.body.position.x !== enemy.body.prev.x &&
  //   enemy.body.position.y !== enemy.body.prev.y
  // ) {
  //   return;
  // } else {
  //   enemy.setVelocityY(randomMove1);
  //   enemy.setVelocityX(randomMove2);
  // }
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

function drawGameOver() {
  let gameOverString: string;
  if (model.lives) {
    let lostLife = "❤️";
    gameOverString =
      `${("❤️").repeat(model.lives) + lostLife}\nPRESS BOMBSET KEY TO CONTINUE\nPRESS ESC TO EXIT`;
  } else {
    gameOverString = `GAME OVER\nPRESS BOMBSET KEY TO RESTART\nPRESS ESC TO EXIT`;

  }
  const screenCenterX =
    this.cameras.main.worldView.x + this.cameras.main.width / 2;
  const screenCenterY =
    this.cameras.main.worldView.y + this.cameras.main.height / 2;
  const gameOverText = this.add
    .text(screenCenterX, screenCenterY, gameOverString, {
      fontSize: "50px",
      fill: "#fff",
      stroke: "#222",
      strokeThickness: 5,
      backgroundColor: "rgba(20, 20, 20, 0.75)",
    align: 'center'
    })
    .setOrigin(0.5)
    .setDepth(1);
    
}

function explodeBomb(bomb: Phaser.GameObjects.Image, x: number, y: number) {
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
    const enemiesAlive = flatFieldMatrix.filter((square) =>
      square.object?.startsWith("enemy")
    );

    if (!sqaureToCheck) throw Error("Square to check was not found");
    if (sqaureToCheck.object === "stone") return;

    drawExplosion.apply(this, [x, y]);

    if (sqaureToCheck.object === "wood") {
      const woodSquare = wood.children.entries.find((woodSquare) => {
        return (
          sqaureToCheck.x === woodSquare.x && sqaureToCheck.y === woodSquare.y
        );
      });
      if (!woodSquare) throw Error("Wood square was not found");
      sqaureToCheck.object = "grass";
      woodSquare.destroy();
    } else if (sqaureToCheck.object === "char") {
      charDie.apply(this);
    } else if (enemiesAlive.some((enemy) => enemy === sqaureToCheck)) {
      const enemyToDestroy = enemies.children.entries.find((enemy) => {
        const [closestX, closestY] = findClosestSquare(enemy);
        return closestX === sqaureToCheck.x && closestY === sqaureToCheck.y;
      });
      if (enemyToDestroy) {
        enemyToDestroy.setTint(0xff0000);
        this.add.tween({
          targets: enemyToDestroy,
          ease: "Sine.easeInOut",
          duration: 200,
          delay: 0,
          alpha: {
            getStart: () => 1,
            getEnd: () => 0,
          },
        });
        setTimeout(() => {
          enemyToDestroy.destroy()
          curLvlEnemies--;
          if (curLvlEnemies === 0 && model.lives > 0) {
            model.level ++ ;
            gameOver = true;
            restartScene.apply(this);
          }
        }, 200);
      }
    }
  };

  checkSquare(x, y);
  checkSquare(nextX, y);
  checkSquare(prevX, y);
  checkSquare(x, nextY);
  checkSquare(x, prevY);
}

function drawExplosion(x: number, y: number) {
  explosion = this.physics.add.sprite(x, y, "explosion");
  const explosionAnim = explosion.anims.play("bombExplosion", false);
  explosionAnim.once("animationcomplete", () => {
    explosionAnim.destroy();
  });
}

function dropBomb() {
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
      explodeBomb.apply(this, [bomb, bombX, bombY]);
    }, bombSpeed - (1000 * ( model.level - 1 )) );

    char.anims.play("placeBomb", true);
  }
}

function charDie() {
  gameOver = true;
  model.lives--;
  char.setTint(0xff0000);
  this.add.tween({
    targets: char,
    ease: "Sine.easeInOut",
    duration: 200,
    delay: 0,
    alpha: {
      getStart: () => 1,
      getEnd: () => 0,
    },
  });
  setTimeout(() => char.destroy(), 200);
  drawGameOver.apply(this);
}
function restartGame() {
  model.lives = 3;
  this.scene.restart();
  setTimeout(() => {
    gameOver = false;
  }, 1);
}
function restartScene() {
  this.scene.restart();
  model.score = 0;
  setTimeout(() => {
    gameOver = false;
  }, 1);
}
export function changeGameOver() {
  gameOver = !gameOver;
}
