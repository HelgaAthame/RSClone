import Phaser from "phaser";
import loadFont from "./utils/loadFont.js";
import { model } from "./model/index.js";
import { view } from "./view/index.js";
import FieldSquare from "./utils/fieldSquare.js";

import charSprite from "./assets/char__sprite.png";
import explosionSprite from "./assets/explosion_sprite.png";
import grassImg from "./assets/grass.jpg";
import stoneImg from "./assets/stone.jpg";
import woodImg from "./assets/wood.jpg";
import bombImg from "./assets/bomb.png";
import enemyImg from "./assets/enemy1.png";
import explosionAudio from "./assets/sounds/bomb_explosion.ogg";
import charStepAudio from "./assets/sounds/char_step.mp3";
import charDeathAudio from "./assets/sounds/player_death.wav";
import bonusSoundAudio from "./assets/sounds/bonus_sound_1.wav";
import enemyDeathAudio from "./assets/sounds/enemy_death.ogg";
import putBombAudio from "./assets/sounds/put_bomb.mp3";
import stageClearAudio from "./assets/sounds/stage_clear.mp3";
import stageMusicAudio from "./assets/sounds/stage_music.mp3";
import superBombImg from "./assets/super_bomb.png";
import superBombImgFired from "./assets/super_bomb_fired.png";
import heartImg from "./assets/heart.png";
import shieldImg from "./assets/shield.png";
import mayhem from "./assets/fonts/retro-land-mayhem.ttf";

//import keys from "./utils/keys.js;";

loadFont("Mayhem", mayhem);

const width = window.innerWidth;
const height = window.innerHeight;
const ceilsNum = 11;
const fieldSquareLength = height / ceilsNum;
const fieldStartX = width / 2 - height / 2;
const fieldImgSize = 512;

const charStartX = fieldStartX + 1.5 * fieldSquareLength;
const charStartY = height - 1.5 * fieldSquareLength;

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

enum Items {
  SUPERBOMB = "superbomb_item",
  LIFE = "heart",
  SHIELD = "shield",
}
enum Bombs {
  BOMB = "bomb",
  SUPERBOMB = "superbomb",
}
class GameScene extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  scoreText: Phaser.GameObjects.Text;
  livesText: Phaser.GameObjects.Text;
  itemsText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  char: Phaser.GameObjects.Sprite;
  enemies: Phaser.GameObjects.Group;
  grass: Phaser.Physics.Arcade.StaticGroup;
  stone: Phaser.Physics.Arcade.StaticGroup;
  wood: Phaser.Physics.Arcade.StaticGroup;
  bombs: Phaser.Physics.Arcade.Group;
  explosion: Phaser.GameObjects.Sprite;
  hearts: Phaser.Physics.Arcade.StaticGroup;
  shields: Phaser.Physics.Arcade.StaticGroup;
  superBombs: Phaser.Physics.Arcade.StaticGroup;

  explosionSound: Phaser.Sound.BaseSound;
  charStepSound: Phaser.Sound.BaseSound;
  charDeathSound: Phaser.Sound.BaseSound;
  enemyDeathSound: Phaser.Sound.BaseSound;
  bonusSound: Phaser.Sound.BaseSound;
  putBombSound: Phaser.Sound.BaseSound;
  stageClearSound: Phaser.Sound.BaseSound;
  stageMusic: Phaser.Sound.BaseSound;

  constructor() {
    super({
      key: "GameScene",
    });
  }

  preload(): void {
    this.load.spritesheet("char", charSprite, {
      frameWidth: 64,
      frameHeight: 99,
    });
    this.load.spritesheet("explosion", explosionSprite, {
      frameWidth: 64,
      frameHeight: 64,
    });

    this.load.image("grass", grassImg);
    this.load.image("stone", stoneImg);
    this.load.image("wood", woodImg);
    this.load.image(Bombs.BOMB, bombImg);
    this.load.image("enemy", enemyImg);

    this.load.audio("explosion", explosionAudio);
    this.load.audio("charStep", charStepAudio);
    this.load.audio("charDeath", charDeathAudio);
    this.load.audio("bonusSound", bonusSoundAudio);
    this.load.audio("enemyDeath", enemyDeathAudio);
    this.load.audio("putBomb", putBombAudio);
    this.load.audio("stageClear", stageClearAudio);
    this.load.audio("stageMusic", stageMusicAudio);
    this.load.image(Items.SUPERBOMB, superBombImg);
    this.load.image(Bombs.SUPERBOMB, superBombImgFired);
    this.load.image(Items.LIFE, heartImg);
    this.load.image(Items.SHIELD, shieldImg);
  }

  create() {
    /* Draw field */
    /* BIG WIDTH ONLY!!! */
    this.grass = this.physics.add.staticGroup();
    this.stone = this.physics.add.staticGroup();
    this.wood = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.hearts = this.physics.add.staticGroup();
    this.shields = this.physics.add.staticGroup();
    this.superBombs = this.physics.add.staticGroup();

    this.explosionSound = this.sound.add("explosion", { loop: false });
    this.charStepSound = this.sound.add("charStep", { loop: true });
    this.charDeathSound = this.sound.add("charDeath", { loop: false });
    this.enemyDeathSound = this.sound.add("enemyDeath", { loop: false });
    this.bonusSound = this.sound.add("bonusSound", { loop: false });
    this.putBombSound = this.sound.add("putBomb", { loop: false });
    this.stageClearSound = this.sound.add("stageClear", { loop: false });
    this.stageMusic = this.sound.add("stageMusic", { loop: true });
    this.stageMusic.play();

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
      .setSize(fieldSquareLength * 0.8, fieldSquareLength * 0.8)
      .setScale(0.9, 0.9)
      .refreshBody();

    this.char.on("destroy", () => {
      this.charStepSound.stop();
      this.charDeathSound.play();
    });

    while (model.enemyCounter < model.curLvlEnemies) {
      const randomX = Math.floor(Math.random() * (ceilsNum - 1) + 1);
      const randomY = Math.floor(Math.random() * (ceilsNum - 1) + 1);

      if (
        fieldMatrix[randomX][randomY].object !== "grass" ||
        (randomX === ceilsNum - 2 && randomY === 1) ||
        (randomX === ceilsNum - 3 && randomY === 1) ||
        (randomX === ceilsNum - 2 && randomY === 2)
      )
        continue;
      fieldMatrix[randomX][randomY].object = `enemy_${model.enemyCounter}`;
      model.enemyCounter++;
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
      if (!model.gameOver) this.charDie();
    });
    this.physics.add.collider(this.char, this.bombs);

    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.collider(this.enemies, this.wood);
    this.physics.add.collider(this.enemies, this.stone);
    this.physics.add.collider(this.enemies, this.bombs);

    this.physics.add.overlap(
      this.char,
      this.hearts,
      this.collectHeart as unknown as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.char,
      this.shields,
      this.collectShield as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.char,
      this.superBombs,
      this.collectSuperBomb as unknown as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.enemies,
      this.superBombs,
      this.destroyOnCollideCallback as unknown as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.enemies,
      this.hearts,
      this.destroyOnCollideCallback as unknown as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.enemies,
      this.shields,
      this.destroyOnCollideCallback as unknown as ArcadePhysicsCallback,
      undefined,
      this
    );

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

    this.livesText = this.add.text(
      textStartX + 4 * fieldSquareLength,
      textStartY,
      `LIVES : ${"❤️".repeat(model.lives)}`,
      style
    );
    this.add.text(
      textStartX + 8.5 * fieldSquareLength,
      textStartY,
      `LEVEL : ${model.level}`,
      style
    );

    this.scoreText = this.add.text(
      textStartX,
      textStartY,
      `SCORE : ${model.score}`,
      style
    );
    this.itemsText = this.add.text(textStartX, textStartY + 30, "");

    this.timerText = this.add.text(
      textStartX + 4 * fieldSquareLength,
      textStartY + 10 * fieldSquareLength,
      `TIME : ${model.curLvlTimer}`,
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
  update() {
    model.curTimer -= 1 / 60;
    if (model.curTimer <= 20) {
      this.timerText.setTint(0xff0000);
      this.add.tween({
        targets: this.timerText,
        ease: "Sine.easeInOut",
        delay: 0,
        alpha: {
          getStart: () => 1,
          getEnd: () => 0,
        },
      });
    }
    if (model.curTimer <= 0) {
      this.char.destroy();
      model.gameOver = true;
      model.curTimer = 0;
      this.drawGameOver();
    }
    this.timerText.setText(`TIMER: ${model.curTimer.toFixed(0)}`);
    const bombSet = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]
    );

    if (model.gameOver) {
      this.stageMusic.stop();
      this.putBombSound.stop();
      if (bombSet.isDown && model.lives) this.restartScene();
      else if (bombSet.isDown && !model.lives) this.restartGame();
      else return;
    }

    if (!model.gameOver && bombSet.isDown) {
      this.dropBomb();
    }

    const keyESC = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    if (keyESC.isDown /*&& !model.escIsPressed*/) {
      model.isGamePaused = true;
      model.escIsPressed = true;
      if (model.isGamePaused) {
        this.scene.pause();
        this.stageMusic.pause();
        setTimeout(() => {
          this.charStepSound.stop();
        }, 0);
        model.fieldMatrix = fieldMatrix;
        model.saveToBd();//save field state
      }

      setTimeout(() => (model.escIsPressed = false), 300);

      view.start.renderStartScreen();
    }

    this.charMovement();
    this.enemies.children.entries.forEach((enemy) =>
      this.enemyMovement(enemy as Phaser.Physics.Matter.Sprite)
    );
  }

  charMovement(): void {
    if (model.gameOver) return;
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

    const [closestX, closestY] = this.findClosestSquare(
      this.char as Phaser.Physics.Matter.Sprite
    );
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

    const thisChar = this.char as Phaser.Physics.Matter.Sprite;

    if (up.isDown) {
      thisChar.setVelocityY(-model.charSpeed);
      thisChar.setVelocityX(0);
      thisChar.anims.play("up", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (right.isDown) {
      thisChar.setVelocityX(model.charSpeed);
      thisChar.setVelocityY(0);
      thisChar.anims.play("right", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (down.isDown) {
      thisChar.setVelocityY(model.charSpeed);
      thisChar.setVelocityX(0);
      thisChar.anims.play("down", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (/*cursors.*/ left.isDown) {
      thisChar.setVelocityX(-model.charSpeed);
      thisChar.setVelocityY(0);
      thisChar.anims.play("left", true);
      if (!this.charStepSound.isPlaying) this.charStepSound.play();
    } else if (!(/*cursors.space*/ bombSet.isDown)) {
      thisChar.setVelocityX(0);
      thisChar.setVelocityY(0);

      thisChar.anims.play("turn", true);
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
      enemy.body.position.x ===
        (enemy.body as Phaser.Physics.Arcade.Body).prev.x &&
      enemy.body.position.y ===
        (enemy.body as Phaser.Physics.Arcade.Body).prev.y
    ) {
      const random = Math.random();
      if (random > 0.75) {
        enemy.setVelocityX(0);
        enemy.setVelocityY(model.enemySpeed);
      } else if (random > 0.5) {
        enemy.setVelocityX(0);
        enemy.setVelocityY(-model.enemySpeed);
      } else if (random > 0.25) {
        enemy.setVelocityX(model.enemySpeed);
        enemy.setVelocityY(0);
      } else {
        enemy.setVelocityX(-model.enemySpeed);
        enemy.setVelocityY(0);
      }
    }
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
    model.nextLvl();
    this.stageMusic.stop();
    this.charStepSound.stop();
    this.putBombSound.stop();
    this.stageClearSound.play();

    view.win.renderUI();
  }

  explodeBomb(bomb: Phaser.GameObjects.Image, x: number, y: number) {
    const isSuperBomb = bomb.texture.key === Bombs.SUPERBOMB;
    const nextX = x + fieldSquareLength;
    const prevX = x - fieldSquareLength;
    const nextY = y + fieldSquareLength;
    const prevY = y - fieldSquareLength;
    bomb.destroy();

    if (isSuperBomb) {
      this.handleExplodeSuperBomb(x, y);
    } else {
      this.handleTileExplosion(x, y);
      this.handleTileExplosion(nextX, y);
      this.handleTileExplosion(prevX, y);
      this.handleTileExplosion(x, nextY);
      this.handleTileExplosion(x, prevY);
    }
    this.tiltCamera();
  }

  handleTileExplosion = (x: number, y: number) => {
    const flatFieldMatrix = fieldMatrix.flat();
    const squareToCheck = flatFieldMatrix.find(
      (square) =>
        Math.floor(square.x) === Math.floor(x) &&
        Math.floor(square.y) === Math.floor(y)
    );
    const enemiesAlive = flatFieldMatrix.filter((square) =>
      square.object?.startsWith("enemy")
    );
    if (!squareToCheck) {
      throw new Error("Square to check was not found");
    } else {
      //console.log("squareToCheck.object :", squareToCheck.object);
      if (squareToCheck.object === "stone") return;

      this.drawExplosion(x, y);

      if (squareToCheck.object === "wood") {
        const woodSquare = this.wood.children.entries.find((woodSquare) => {
          return (
            squareToCheck.x ===
              (woodSquare as Phaser.Physics.Matter.Sprite).x &&
            squareToCheck.y === (woodSquare as Phaser.Physics.Matter.Sprite).y
          );
        });
        if (!woodSquare) throw Error("Wood square was not found");
        woodSquare.destroy();
        this.drawRandomBonus(x, y);
      } else if (squareToCheck.object === "char") {
        console.log("model.shieldActive :", model.shieldActive);
        if (model.shieldActive) {
          model.shieldActive = false;
          this.char.clearTint();
        } else {
          console.log("ветка chardie");
          this.charDie();
        }
        this.updateItemsText();
      } else if (enemiesAlive.some((enemy) => enemy === squareToCheck)) {
        const enemyToDestroy = this.enemies.children.entries.find((enemy) => {
          const [closestX, closestY] = this.findClosestSquare(
            enemy as Phaser.Physics.Matter.Sprite
          );
          return closestX === squareToCheck.x && closestY === squareToCheck.y;
        });
        enemyToDestroy?.on("destroy", () => {
          model.curLvlScore += 100;
          this.scoreText.setText(`SCORE: ${model.score + model.curLvlScore}`);
          this.enemyDeathSound.play();
        });
        if (enemyToDestroy) {
          (enemyToDestroy as Phaser.Physics.Matter.Sprite).setTint(0xff0000);
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
            model.enemyCounter--;
            if (model.enemyCounter === 0) {
              this.drawLevelComplete();
            }
          }, 200);
        }
      }
      // squareToCheck.object = "grass";
    }
  };

  handleExplodeSuperBomb(x = 0, y = 0) {
    const index = fieldMatrix
      .flat()
      .findIndex(
        (square) =>
          Math.floor(square.x) === Math.floor(x) &&
          Math.floor(square.y) === Math.floor(y)
      );
    const index_Y = Math.floor(index / ceilsNum);
    const index_X = index % ceilsNum;

    let yUp = index_Y;
    let yDown = index_Y;
    let xRight = index_X;
    let xLeft = index_X;

    while (fieldMatrix[index_Y][xRight].object !== "stone") {
      this.handleTileExplosion(fieldMatrix[index_Y][xRight].x, y);
      xRight++;
    }
    while (fieldMatrix[index_Y][xLeft].object !== "stone") {
      this.handleTileExplosion(fieldMatrix[index_Y][xLeft].x, y);
      xLeft--;
    }
    while (fieldMatrix[yUp][index_X].object !== "stone") {
      this.handleTileExplosion(x, fieldMatrix[yUp][index_X].y);
      yUp--;
    }
    while (fieldMatrix[yDown][index_X].object !== "stone") {
      this.handleTileExplosion(x, fieldMatrix[yDown][index_X].y);
      yDown++;
    }
    this.updateItemsText();
  }

  drawExplosion(x: number, y: number) {
    this.explosion = this.physics.add.sprite(x, y, "explosion");
    const explosionAnim = this.explosion.anims.play("bombExplosion", false);
    explosionAnim.once("animationcomplete", () => {
      explosionAnim.destroy();
    });
  }

  dropBomb() {
    if (model.activeBombs.length < model.maxBombs && !model.bombIsPlanting) {
      const [bombX, bombY] = this.findClosestSquare(
        this.char as Phaser.Physics.Matter.Sprite
      );
      const checkSquare = this.bombs.children.entries.find(
        (bomb) =>
          (bomb as Phaser.Physics.Matter.Sprite).x === bombX &&
          (bomb as Phaser.Physics.Matter.Sprite).y === bombY
      );
      if (checkSquare) return;
      const bomb = this.bombs
        .create(
          bombX,
          bombY,
          model.superBombActive ? Bombs.SUPERBOMB : Bombs.BOMB
        )
        .setSize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
        .setDisplaySize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
        .setImmovable();

      model.bombIsPlanting = true;
      this.putBombSound.play();

      setTimeout(() => (model.bombIsPlanting = false), 500);

      const curBomb = setTimeout(() => {
        this.explodeBomb(bomb, bombX, bombY);
      }, model.bombSpeed);

      model.activeBombs.push(curBomb);

      bomb.on("destroy", () => {
        const findCurBomb = model.activeBombs.find((bomb) => bomb === curBomb);
        clearTimeout(findCurBomb);
        model.activeBombs.shift();
        this.explosionSound.play();

        setTimeout(() => {
          if (model.activeBombs.length === 0) this.putBombSound.stop();
        }, 0);
      });

      this.tweens.add({
        targets: bomb,
        scaleX: bomb.scaleX * 0.66,
        scaleY: bomb.scaleY * 0.66,
        yoyo: true,
        repeat: -1,
        duration: 300,
        ease: "Sine.easeInOut",
      });

      this.char.anims.play("placeBomb", true);
    }
    model.superBombActive = false;
  }

  charDie() {
    model.gameOver = true;
    model.lives--;
    this.char.destroy();
    this.drawGameOver();
  }
  restartGame() {
    model.saveToBd();
    model.resetGame();
    setTimeout(() => {
      model.gameOver = false;
    }, 0);
    this.scene.restart();
  }
  restartScene() {
    model.curLvlScore = 0;
    model.enemyCounter = 0;
    model.curTimer = model.curLvlTimer;

    setTimeout(() => (model.gameOver = false), 0);

    while (model.activeBombs.length > 0) {
      window.clearTimeout(model.activeBombs.pop());
    }
    this.bombs.destroy();
    this.scene.restart();
  }
  changeGameOver() {
    model.gameOver = !model.gameOver;
  }

  drawRandomBonus(x: number, y: number) {
    const random = Math.random();
    let group: typeof this.hearts | typeof this.superBombs | null = null;
    let item: string = "";
    if (random > 0.8) {
      group = this.hearts;
      item = Items.LIFE;
    } else if (random > 0.6) {
      group = this.superBombs;
      item = Items.SUPERBOMB;
    } else if (random > 0.4) {
      group = this.shields;
      item = Items.SHIELD;
    }

    if (group && item) {
      const random = group
        .create(x, y, item)
        .setSize(fieldSquareLength, fieldSquareLength)
        .setDisplaySize(fieldSquareLength / 1.5, fieldSquareLength / 1.5)
        .refreshBody();

      this.tweens.add({
        targets: random,
        scaleX: random.scaleX / 1.3,
        scaleY: random.scaleY / 1.3,
        yoyo: true,
        repeat: -1,
        duration: 300,
        ease: "Sine.easeInOut",
      });
    }
  }

  collectHeart(
    _char: Phaser.Physics.Arcade.Sprite,
    heart: Phaser.Physics.Arcade.Sprite
  ) {
    heart.disableBody(true, true);
    model.curLvlScore += 50;
    const livesText =
      ++model.lives <= 5
        ? `LIVES :  ${"❤️".repeat(model.lives)}`
        : `LIVES: ❤️ x${model.lives}`;
    this.livesText.setText(livesText);
  }
  collectShield(
    char: Phaser.Physics.Arcade.Sprite,
    shield: Phaser.Physics.Arcade.Sprite
  ) {
    shield.disableBody(true, true);
    model.shieldActive = true;
    char.setTint(0x00ff00);
    this.updateItemsText();
  }
  collectSuperBomb(
    _char: Phaser.Physics.Arcade.Sprite,
    superBomb: Phaser.Physics.Arcade.Sprite
  ) {
    superBomb.disableBody(true, true);
    model.superBombActive = true;
    this.updateItemsText();
  }
  destroyOnCollideCallback(
    _subject: Phaser.Physics.Arcade.Sprite,
    object: Phaser.Physics.Arcade.Sprite
  ) {
    object.disableBody(true, true);
  }

  updateItemsText() {
    this.itemsText.setText(
      `${model.shieldActive ? "🛡 " : ""}${model.superBombActive ? "💥 " : ""}`
    );
  }
  tiltCamera() {
    interface Camera extends Phaser.Cameras.Scene2D.Camera {
      rotation?: number | undefined;
    }

    const cam: Camera = this.cameras.main;
    const tilt = setInterval(() => {
      const random = (Math.round(Math.random()) * 2 - 1) * 0.005;
      if (cam.rotation) cam.rotation += random;
    }, 50);
    setTimeout(() => {
      clearInterval(tilt);
      cam.rotation = 0;
    }, 250);
  }
}
export const gameScene = new GameScene();

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
  scene: gameScene,
};

class Bomberman extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

new Bomberman(config);
