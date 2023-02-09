import Phaser from "phaser";
import loadFont from "./utils/loadFont.js";
import { model } from "./model/index.js";
import FieldSquare from "./utils/fieldSquare.js";
import { view } from "./view/index.js";
//import keys from "./utils/keys.js;";

loadFont("Mayhem", "./src/assets/fonts/retro-land-mayhem.ttf");

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

export let gameOver = false;
let bombActive = false;
let curLvlEnemies: number;

const textStartX = fieldStartX + 0.5 * fieldSquareLength;
const textStartY = 0.3 * fieldSquareLength;
const style: Partial<Phaser.GameObjects.TextStyle> = {
  fontFamily: "Mayhem",
  fontSize: "1.3rem",
  color: "#000",
  wordWrapWidth: 2,
  align: "center",
  stroke: "#fff",
  strokeThickness: 3,
};

let fieldMatrix: FieldSquare[][] = Array(ceilsNum)
  .fill([])
  .map(() => Array(ceilsNum).fill({ x: 0, y: 0, object: null }));

export class GameScene extends Phaser.Scene {
  char: Phaser.Physics.Matter.Sprite | Phaser.GameObjects.Sprite;
  enemies: Phaser.GameObjects.Group;
  grass: Phaser.Physics.Arcade.StaticGroup;
  stone: Phaser.Physics.Arcade.StaticGroup;
  wood: Phaser.Physics.Arcade.StaticGroup;
  bombs: Phaser.Physics.Arcade.Group;
  explosion: Phaser.GameObjects.Sprite;
  explosionSound: Phaser.Sound.BaseSound;
  charStepSound: Phaser.Sound.BaseSound;
  charDeathSound: Phaser.Sound.BaseSound;
  enemyDeathSound: Phaser.Sound.BaseSound;
  bonusSound: Phaser.Sound.BaseSound;
  putBombSound: Phaser.Sound.BaseSound;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  score: Phaser.GameObjects.Text;

  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload(): void {
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
    this.load.image("enemy", "./src/assets/enemy1.png");

    this.load.audio("explosion", "./src/assets/sounds/bomb_explosion.ogg");
    this.load.audio("charStep", "./src/assets/sounds/char_step.mp3");
    this.load.audio("charDeath", "./src/assets/sounds/player_death.wav");
    this.load.audio("bonus", "./src/assets/sounds/bonus_sound_1.wav");
    this.load.audio("enemyDeath", "./src/assets/sounds/enemy_death.ogg");
    this.load.audio("putBomb", "./src/assets/sounds/put_bomb.mp3");
  }

  create() {
    curLvlEnemies = model.enemies + model.level;
    enemySpeed = model.enemySpeed + model.level * 10;
    /* Draw field */
    /* BIG WIDTH ONLY!!! */

    let enemyCounter = 0;

    this.grass = this.physics.add.staticGroup();

    this.stone = this.physics.add.staticGroup();
    this.grass = this.physics.add.staticGroup();
    this.wood = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.explosionSound = this.sound.add("explosion", { loop: false });
    this.charStepSound = this.sound.add("charStep", { loop: true });
    this.charDeathSound = this.sound.add("charDeath", { loop: false });
    this.enemyDeathSound = this.sound.add("enemyDeath", { loop: false });
    this.bonusSound = this.sound.add("bonus", { loop: false });
    this.putBombSound = this.sound.add("putBomb", { loop: false });

    this.score = this.add.text(
      textStartX,
      textStartY,
      `SCORE : ${model.score}`,
      style
    );

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
          this.stone
            .create(curSquareXCenter, curSquareYCenter, "stone")
            .setScale((1 / fieldImgSize) * fieldSquareLength)
            .refreshBody();
          continue;
        }

        if (i % 3 === 0 && j % 3 === 0) {
          fieldMatrix[i - 1][j - 1].object = "stone";
          this.stone
            .create(curSquareXCenter, curSquareYCenter, "stone")
            .setScale((1 / fieldImgSize) * fieldSquareLength)
            .refreshBody();
          continue;
        }

        fieldMatrix[i - 1][j - 1].object = "grass";
        this.grass
          .create(curSquareXCenter, curSquareYCenter, "grass")
          .setScale((1 / fieldImgSize) * fieldSquareLength)
          .refreshBody();

        if (i === ceilsNum - 1 && j === 2) {
          fieldMatrix[i - 1][j - 1].object = "char";
          continue;
        }
        if (randomWoodSquare && !emptyStartLocations) {
          fieldMatrix[i - 1][j - 1].object = "wood";
          this.wood
            .create(curSquareXCenter, curSquareYCenter, "wood")
            .setScale((1 / fieldImgSize) * fieldSquareLength)
            .refreshBody();
          continue;
        }
      }
    }

    this.char = this.physics.add
      .sprite(charStartX, charStartY, "char")
      .setSize(fieldSquareLength * 0.99, fieldSquareLength * 0.99)
      .setScale(0.9, 0.9)
      .refreshBody();

    this.char.on("destroy", () => this.charDeathSound.play());

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
      this.enemies
        .create(
          fieldMatrix[randomX][randomY].x,
          fieldMatrix[randomX][randomY].y,
          "enemy"
        )
        .setSize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
        .setScale(0.9)
        .refreshBody();
    }

    this.physics.add.collider(this.char, this.stone);
    this.physics.add.collider(this.char, this.wood);
    this.physics.add.collider(this.char, this.enemies, () => {
      if (!gameOver) this.charDie();
    });
    this.physics.add.collider(this.char, this.bombs);

    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.enemies, this.wood);
    this.physics.add.collider(this.enemies, this.stone);
    this.physics.add.collider(this.enemies, this.bombs);

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

    this.cursors = this.input.keyboard.createCursorKeys();

    this.add.text(
      textStartX + 4 * fieldSquareLength,
      textStartY,
      `LIVES : ${"❤️".repeat(model.lives)}`,
      style
    );
    this.add.text(
      textStartX + 9 * fieldSquareLength,
      textStartY,
      `LEVEL : ${model.level}`,
      style
    );

    //if there is field matrix in model - we take it
    //if no - we write it into model
    if (model.fieldMatrix) {
      fieldMatrix = model.fieldMatrix;
    } else {
      model.fieldMatrix = fieldMatrix;
    }
  }
  update(timer: number) {
    const bombSet = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]
    );

    if (gameOver) {
      if (/*cursors.space.isDown*/ bombSet.isDown && model.lives)
        this.restartScene();
      else if (/*cursors.space.isDown*/ bombSet.isDown && !model.lives)
        this.restartGame();
      else return;
    }

    if (!gameOver && /*cursors.space*/ bombSet.isDown) {
      this.dropBomb();
    }

    const keyESC = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    if (keyESC.isDown) {
      gameOver = true;
      model.fieldMatrix = fieldMatrix; //save field state
      view.settings.renderUI();
    }

    this.charMovement();
    this.enemies.children.entries.forEach((enemy) => this.enemyMovement(enemy));
  }

  charMovement(): void {
    console.log(Phaser.Input.Keyboard);
    const bombSet = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]
    );
    const up = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowUp]
    );
    const down = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowDown]
    );
    const left = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowLeft]
    );
    const right = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.arrowRight]
    );

    const [closestX, closestY] = this.findClosestSquare(this.char);
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

    if (up.isDown) {
      this.char.setVelocityY(-charSpeed);
      this.char.setVelocityX(0);
      this.char.anims.play("up", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (right.isDown) {
      this.char.setVelocityX(charSpeed);
      this.char.setVelocityY(0);
      this.char.anims.play("right", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (down.isDown) {
      this.char.setVelocityY(charSpeed);
      this.char.setVelocityX(0);
      this.char.anims.play("down", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (/*cursors.*/ left.isDown) {
      this.char.setVelocityX(-charSpeed);
      this.char.setVelocityY(0);
      this.char.anims.play("left", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (!(/*cursors.space*/ bombSet.isDown)) {
      this.char.setVelocityX(0);
      this.char.setVelocityY(0);

      this.char.anims.play("turn", true);
      this.charStepSound.stop();
    }
  }
  enemyMovement(enemy: Phaser.Physics.Matter.Sprite): void {
    const [closestX, closestY] = this.findClosestSquare(enemy);
    const flatFieldMatrix = fieldMatrix.flat();

    const newEnemySquare = flatFieldMatrix.find(
      (square) =>
        Math.floor(square.x) === Math.floor(closestX) &&
        Math.floor(square.y) === Math.floor(closestY)
    );

    const curEnemyID = this.enemies.children.entries.indexOf(enemy);
    if (!newEnemySquare) throw Error("New enemy square was not found");
    newEnemySquare.object = `enemy_${curEnemyID}`;

    if (
      enemy.body.position.x == enemy.body.prev.x &&
      enemy.body.position.y == enemy.body.prev.y
    ) {
      const random = Math.random();
      if (random > 0.75) {
        enemy.setVelocityX(0);
        enemy.setVelocityY(enemySpeed);
      } else if (random > 0.5) {
        enemy.setVelocityX(0);
        enemy.setVelocityY(-enemySpeed);
      } else if (random > 0.25) {
        enemy.setVelocityX(enemySpeed);
        enemy.setVelocityY(0);
      } else {
        enemy.setVelocityX(-enemySpeed);
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

  findClosestSquare(object: Phaser.Physics.Matter.Sprite) {
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

  drawGameOver() {
    let gameOverString: string;
    const screenCenterX =
      this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    if (model.lives) {
      gameOverString = `You have ${model.lives}❤️ left \nPRESS ${model.buttons.bombSet} TO CONTINUE\nPRESS ESC TO EXIT`;
    } else {
      gameOverString = `GAME OVER\nPRESS ${model.buttons.bombSet} TO RESTART\nPRESS ESC TO EXIT`;
    }

    this.add
      .text(screenCenterX, screenCenterY, gameOverString, {
        fontFamily: "Mayhem",
        fontSize: "50px",
        stroke: "#222",
        strokeThickness: 5,
        backgroundColor: "rgba(20, 20, 20, 0.75)",
        align: "center",
      })
      .setOrigin(0.5);
  }

  drawLevelComplete() {
    //model.level ++ ;
    gameOver = true;
    //restartScene.apply(this);
    view.win.renderUI(this);
  }

  explodeBomb(bomb: Phaser.GameObjects.Image, x: number, y: number) {
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

      this.drawExplosion(x, y);

      if (sqaureToCheck.object === "wood") {
        const woodSquare = this.wood.children.entries.find((woodSquare) => {
          return (
            sqaureToCheck.x === woodSquare.x && sqaureToCheck.y === woodSquare.y
          );
        });
        if (!woodSquare) throw Error("Wood square was not found");
        woodSquare.destroy();
      } else if (sqaureToCheck.object === "char") {
        this.charDie();
      } else if (enemiesAlive.some((enemy) => enemy === sqaureToCheck)) {
        const enemyToDestroy = this.enemies.children.entries.find((enemy) => {
          const [closestX, closestY] = this.findClosestSquare(enemy);
          return closestX === sqaureToCheck.x && closestY === sqaureToCheck.y;
        });
        enemyToDestroy?.on("destroy", () => {
          model.score += 100;
          this.score.setText(`SCORE: ${model.score}`);
          this.enemyDeathSound.play();
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
            enemyToDestroy.destroy();
            curLvlEnemies--;
            if (curLvlEnemies === 0 && model.lives > 0) {
              this.drawLevelComplete();
              //model.level ++ ;
              //gameOver = true;
              //restartScene.apply(this);
            }
          }, 200);
        }
      }
      sqaureToCheck.object = "grass";
    };

    checkSquare(x, y);
    checkSquare(nextX, y);
    checkSquare(prevX, y);
    checkSquare(x, nextY);
    checkSquare(x, prevY);
  }

  drawExplosion(x: number, y: number) {
    this.explosion = this.physics.add.sprite(x, y, "explosion");
    const explosionAnim = this.explosion.anims.play("bombExplosion", false);
    explosionAnim.once("animationcomplete", () => {
      explosionAnim.destroy();
    });
  }

  dropBomb() {
    if (!bombActive) {
      const [bombX, bombY] = this.findClosestSquare(this.char);
      bombActive = true;
      const bomb = this.bombs.create(bombX, bombY, "bomb").setImmovable();
      this.putBombSound.play();
      bomb.on("destroy", () => {
        let areMoreActiveBombs: boolean;
        setTimeout(() => {
          areMoreActiveBombs = !!this.children.list.find(
            (item) => item.texture.key === "bomb"
          );
          if (!areMoreActiveBombs) this.putBombSound.stop();
        }, 0);

        this.explosionSound.play();
      });
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

      model.activeBombs.push(
        setTimeout(() => {
          this.explodeBomb(bomb, bombX, bombY);
        }, bombSpeed - 1000 * (model.level - 1))
      );

      this.char.anims.play("placeBomb", true);
    }
  }

  charDie() {
    gameOver = true;
    model.lives--;
    this.char.setTint(0xff0000);
    this.add.tween({
      targets: this.char,
      ease: "Sine.easeInOut",
      duration: 200,
      delay: 0,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0,
      },
    });
    setTimeout(() => this.char.destroy(), 200);
    this.drawGameOver();
  }
  restartGame() {
    model.lives = 3;
    this.scene.restart();
    setTimeout(() => {
      gameOver = false;
    }, 1);
  }
  restartScene() {
    this.scene.restart();
    model.score = 0;
    setTimeout(() => (gameOver = false), 1);

    while (model.activeBombs.length > 0) {
      window.clearTimeout(model.activeBombs.pop());
    }
    this.bombs.destroy();
  }
  changeGameOver() {
    gameOver = !gameOver;
  }
}

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
  scene: [GameScene],
};

class Bomberman extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

export const game = new Bomberman(config);

export const changeGameOver =
  game.config.sceneConfig[0].prototype.changeGameOver;
