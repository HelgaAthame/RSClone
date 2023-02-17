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
import bombIncreaser from "./assets/plus_bomb.png";
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
const gameUITextStyle: Partial<Phaser.GameObjects.TextStyle> = {
  fontFamily: "Mayhem",
  fontSize: "1.3rem",
  color: "#000",
  wordWrapWidth: 2,
  align: "center",
  stroke: "#fff",
  strokeThickness: 3,
};
const bonusTextStyle = {
  fontFamily: "Mayhem",
  fontSize: "2rem",
  color: "#000",
  wordWrapWidth: 2,
  align: "left",
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
  BOMB_ICREASER = "bomb_increaser",
}
enum Bombs {
  BOMB = "bomb",
  SUPERBOMB = "superbomb",
}

class GameScene extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  scoreText: Phaser.GameObjects.Text;
  livesText: Phaser.GameObjects.Text;
  bonusesText: Phaser.GameObjects.Text;
  timerText: Phaser.GameObjects.Text;
  char: Phaser.GameObjects.Sprite;
  enemies: Phaser.GameObjects.Group;
  grass: Phaser.Physics.Arcade.StaticGroup;
  stone: Phaser.Physics.Arcade.StaticGroup;
  wood: Phaser.Physics.Arcade.StaticGroup;
  bombs: Phaser.Physics.Arcade.Group;
  explosion: Phaser.GameObjects.Sprite;
  explosions: Phaser.Physics.Arcade.StaticGroup;
  hearts: Phaser.Physics.Arcade.StaticGroup;
  shields: Phaser.Physics.Arcade.StaticGroup;
  bombIncreasers: Phaser.Physics.Arcade.StaticGroup;
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
    this.load.image(Items.BOMB_ICREASER, bombIncreaser);
  }

  create() {
    model.isGamePaused = false;
    this.defineGameObjects();
    this.stageMusic.play();

    this.events.on("resume", () => {
      this.stageMusic.resume();
      this.bombCheck();
    });

    this.events.once("start", () => {
      this.charDeathSound.stop();
      this.explosionSound.stop();
    });

    this.generateGameField();
    this.generateEnemies();
    this.setupChar();
    this.cursors = this.input.keyboard.createCursorKeys();

    model.fieldMatrix
      ? (fieldMatrix = model.fieldMatrix)
      : (model.fieldMatrix = fieldMatrix);

    this.setupOverlapsAndColliders();
    this.createGameAnimations();
    this.setupGameText();
    this.bombCheck();
    this.shieldCheck();
    this.updateBonusesText();
  }
  update() {
    this.bombTimerCheck();
    this.gameTimer();
    this.gameBtnsHandler();
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

    /*  */
    for (let i = 1; i <= ceilsNum; i++) {
      for (let j = 1; j <= ceilsNum; j++) {
        if (fieldMatrix[i - 1][j - 1].object === `enemy_${curEnemyID}`)
          fieldMatrix[i - 1][j - 1].object = "grass";
      }
    }
    /*  */
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
      model.saveToBd().catch((e) => {
        console.log(`error while saving to DB ${e}`);
      });
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
      .setOrigin(0.5)
      .setDepth(10);

    model.fieldMatrix = undefined;
  }

  drawLevelComplete() {
    model.nextLvl();
    this.stageMusic.stop();

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
        if (!woodSquare) return;
        squareToCheck.object = "grass";
        woodSquare.destroy();
        this.dropRandomBonus(x, y);
      } else if (squareToCheck.object === "char" && !model.gameOver) {
        if (model.shieldActive) {
          model.shieldActive = false;
          this.char.clearTint();
        } else {
          squareToCheck.object = "grass";
          this.charDie();
        }
        this.updateBonusesText();
      } else if (enemiesAlive.some((enemy) => enemy === squareToCheck)) {
        const enemyToDestroy = this.enemies.children.entries.find((enemy) => {
          const [closestX, closestY] = this.findClosestSquare(
            enemy as Phaser.Physics.Matter.Sprite
          );
          return closestX === squareToCheck.x && closestY === squareToCheck.y;
        });
        enemyToDestroy?.on("destroy", () => {
          squareToCheck.object = "grass";
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
            if (model.enemyCounter === 0 && !model.gameOver) {
              this.drawLevelComplete();
            }
          }, 200);
        }
      }
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
    this.updateBonusesText();
  }

  drawExplosion(x: number, y: number) {
    this.explosion = this.physics.add.sprite(x, y, "explosion");
    // const explosion = this.physics.add.sprite(x, y, "explosion");
    // const newXplosn = this.explosions.create(x, y, "");
    const explosionAnim = this.explosion.anims.play("bombExplosion", false);
    explosionAnim.once("animationcomplete", () => {
      explosionAnim.destroy();
      this.explosion.destroy();
      // this.dropRandomBonus(x, y);
    });

    this.physics.add.overlap(
      this.explosion,
      this.bombIncreasers,
      this.destroyOnCollideCallback as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.explosion,
      this.hearts,
      this.destroyOnCollideCallback as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.explosion,
      this.superBombs,
      this.destroyOnCollideCallback as ArcadePhysicsCallback,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.explosion,
      this.shields,
      this.destroyOnCollideCallback as ArcadePhysicsCallback,
      undefined,
      this
    );
    // this.physics.add.overlap(
    //   this.explosion,
    //   this.wood,
    //   this.destroyOnCollideCallback as ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );
    // this.physics.add.overlap(
    //   this.explosion,
    //   this.enemies,
    //   this.destroyEnemy as ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );
    // this.physics.add.overlap(
    //   this.explosion,
    //   this.char,
    //   this.destroyEnemy as ArcadePhysicsCallback,
    //   undefined,
    //   this
    // );
  }

  destroyEnemy(
    _explosion: Phaser.Physics.Arcade.Sprite,
    enemy: Phaser.Physics.Arcade.Sprite
  ) {
    // enemy.deathTriggered = true
    Object.defineProperty(enemy, "isDeathTriggered", { value: true });

    // enemy.disableBody(true, true);

    // const squareToCheck = flatFieldMatrix.find(
    //   //   (square) =>
    //   //     Math.floor(square.x) === Math.floor(x) &&
    //   //     Math.floor(square.y) === Math.floor(y)
    //   );
    // const enemyToDestroy = this.enemies.children.entries.find((enemy) => {
    //         const [closestX, closestY] = this.findClosestSquare( enemy as Phaser.Physics.Matter.Sprite
    //         );
    //         return closestX === squareToCheck.x && closestY === squareToCheck.y;
    //       });
    enemy.once("destroy", () => {
      const { isDeathTriggered } = enemy;
      if (!isDeathTriggered) {
        model.curLvlScore += 100;
        this.scoreText.setText(`SCORE: ${model.score + model.curLvlScore}`);
        this.enemyDeathSound.play();
        model.enemyCounter--;

        enemy.setTint(0xff0000);
        this.add.tween({
          targets: enemy,
          ease: "Sine.easeInOut",
          duration: 200,
          delay: 0,
          alpha: {
            getStart: () => 1,
            getEnd: () => 0,
          },
        });
        if (model.enemyCounter === 0 && !model.gameOver) {
          this.drawLevelComplete();
        }
      }
    });

    setTimeout(() => {
      enemy.destroy();
    }, 200);
  }

  dropBomb(
    bombX: number,
    bombY: number,
    bombTimer = model.bombSpeed,
    isSuperBomb = model.superBombActive
  ) {
    if (
      (model.activeBombs.length < model.maxBombs ||
        bombTimer !== model.bombSpeed) &&
      !model.bombIsPlanting
    ) {
      const checkSquare = this.bombs.children.entries.find(
        (bomb) =>
          (bomb as Phaser.Physics.Matter.Sprite).x === bombX &&
          (bomb as Phaser.Physics.Matter.Sprite).y === bombY
      );
      if (checkSquare) {
        if (bombTimer === model.bombSpeed) return;
        else {
          checkSquare.destroy();
          this.explosionSound.stop();
        }
      }

      const bomb = this.bombs
        .create(bombX, bombY, isSuperBomb ? Bombs.SUPERBOMB : Bombs.BOMB)
        .setSize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
        .setDisplaySize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
        .setImmovable();

      if (bombTimer === model.bombSpeed) {
        model.bombIsPlanting = true;
        setTimeout(() => (model.bombIsPlanting = false), 500);
      }

      this.putBombSound.play();

      const curBomb = {
        curBomb: setTimeout(() => {
          this.explodeBomb(bomb, bombX, bombY);
        }, bombTimer),
        bombTimer: bombTimer,
        bombX: bombX,
        bombY: bombY,
        isSuperBomb: model.superBombActive ? true : false,
      };

      bomb.on("destroy", () => {
        model.activeBombs = model.activeBombs.filter(
          (bomb) => bomb !== curBomb
        );
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

      if (bombTimer === model.bombSpeed) {
        model.activeBombs.push(curBomb);
        this.char.anims.play("placeBomb", true);
      }
    }
    model.superBombActive = false;
    this.updateBonusesText();
  }

  charDie() {
    model.gameOver = true;
    model.lives--;
    model.maxBombs = 1;
    model.shieldActive = false;
    model.superBombActive = false;

    this.updateBonusesText();
    this.char.destroy();
    this.drawGameOver();
  }
  restartGame() {
    model.activeBombs.forEach((bomb) => {
      window.clearTimeout(bomb.curBomb);
    });
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

    model.activeBombs.forEach((bomb) => {
      window.clearTimeout(bomb.curBomb);
    });
    this.bombs.destroy();
    this.scene.restart();
  }
  changeGameOver() {
    model.gameOver = !model.gameOver;
  }

  dropRandomBonus(x: number, y: number) {
    const random = Math.random();
    let group: Phaser.Physics.Arcade.StaticGroup | null = null;
    let item: string = "";

    const createItem = (
      group: Phaser.Physics.Arcade.StaticGroup | null = null,
      item: string = ""
    ) => {
      if (group) {
        const randomBonus = group
          .create(x, y, item)
          .setSize(fieldSquareLength, fieldSquareLength)
          .setDisplaySize(fieldSquareLength / 1.5, fieldSquareLength / 1.5)
          .refreshBody();

        this.tweens.add({
          targets: randomBonus,
          scaleX: randomBonus.scaleX / 1.3,
          scaleY: randomBonus.scaleY / 1.3,
          yoyo: true,
          repeat: -1,
          duration: 300,
          ease: "Sine.easeInOut",
        });
        Object.defineProperty(randomBonus, "destroyLock", {
          value: true,
          writable: true,
        });
        setTimeout(() => {
          randomBonus.destroyLock = false;
        }, 1000);
      }
    };

    if (random > 0.8) {
      group = this.hearts;
      item = Items.LIFE;
    } else if (random > 0.6) {
      group = this.superBombs;
      item = Items.SUPERBOMB;
    } else if (random > 0.4) {
      group = this.shields;
      item = Items.SHIELD;
    } else if (random > 0.2) {
      group = this.bombIncreasers;
      item = Items.BOMB_ICREASER;
    }
    if (group && item) {
      setTimeout(() => {
        createItem(group, item);
      }, 400);
      // }, 1000);
    }
  }

  collectHeart(
    _char: Phaser.Physics.Arcade.Sprite,
    heart: Phaser.Physics.Arcade.Sprite
  ) {
    heart.destroy();
    model.curLvlScore += 50;
    const livesText =
      ++model.lives <= 5
        ? `LIVES :  ${"❤️".repeat(model.lives)}`
        : `LIVES: ❤️ x${model.lives}`;
    this.livesText.setText(livesText);
    // this.destroyOnCollideCallback(char, heart);
  }
  collectShield(
    _char: Phaser.Physics.Arcade.Sprite,
    shield: Phaser.Physics.Arcade.Sprite
  ) {
    shield.destroy();
    model.shieldActive = true;
    this.shieldCheck();
    this.updateBonusesText();
    // this.destroyOnCollideCallback(char, shield);
  }
  collectSuperBomb(
    _char: Phaser.Physics.Arcade.Sprite,
    superBomb: Phaser.Physics.Arcade.Sprite
  ) {
    superBomb.destroy();
    model.superBombActive = true;
    this.updateBonusesText();
    // this.destroyOnCollideCallback(char, superBomb);
  }
  collectBombIncrease(
    _char: Phaser.Physics.Arcade.Sprite,
    _bonus: Phaser.Physics.Arcade.Sprite
  ) {
    model.maxBombs++;
    _bonus.destroy();
    this.updateBonusesText();
  }
  destroyOnCollideCallback(
    _subject: Phaser.Physics.Arcade.Sprite,
    object: Phaser.Physics.Arcade.Sprite
  ) {
    if (!object.destroyLock) {
      object.destroy();
    }
  }

  updateBonusesText() {
    const text = `💣х${model.maxBombs}${model.shieldActive ? " ⛨" : ""}${
      model.superBombActive ? " 💥" : ""
    }`;
    this.bonusesText.setText(text);
  }
  tiltCamera() {
    interface Camera extends Phaser.Cameras.Scene2D.Camera {
      rotation?: number | undefined;
    }

    const cam: Camera = this.cameras.main;

    // const cam = this.cameras.main;
    const tilt = setInterval(() => {
      const random = (Math.round(Math.random()) * 2 - 1) * 0.005;
      cam.rotation += random;
    }, 50);
    setTimeout(() => {
      clearInterval(tilt);
      cam.rotation = 0;
    }, 250);
  }
  bombCheck() {
    if (model.activeBombs.length !== 0) {
      model.activeBombs.forEach((bomb) => {
        this.dropBomb(bomb.bombX, bomb.bombY, bomb.bombTimer, bomb.isSuperBomb);
      });
    }
  }
  shieldCheck() {
    if (model.shieldActive) this.char.setTint(0x00ff00);
  }

  bombTimerCheck() {
    model.activeBombs.map((bomb) => {
      if (bomb.bombTimer > 0) {
        bomb.bombTimer = Math.floor(bomb.bombTimer - (1 / 60) * 1000);
      } else {
        model.activeBombs = model.activeBombs.filter((cur) => cur !== bomb);
      }
    });
  }

  gameTimer() {
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
  }
  gameBtnsHandler() {
    const keyESC = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    const bombSet = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes[model.buttons.bombSet]
    );

    if (keyESC.isDown) {
      model.fieldMatrix = fieldMatrix;

      model.saveToBd();
      model.activeBombs.forEach((bomb) => window.clearTimeout(bomb.curBomb));
      model.isGamePaused = true;
      model.escIsPressed = true;
      model.bombIsPlanting = false;

      this.putBombSound.stop();
      this.stageMusic.pause();
      this.scene.pause();

      setTimeout(() => this.charStepSound.stop(), 0);
      setTimeout(() => (model.escIsPressed = false), 300);
      view.start.renderUI();
    }

    if (model.gameOver) {
      model.highScore =
        model.curLvlScore + model.score > model.highScore
          ? model.curLvlScore + model.score
          : model.highScore;

      this.stageMusic.stop();
      this.putBombSound.stop();
      if (bombSet.isDown && model.lives) this.restartScene();
      else if (bombSet.isDown && !model.lives) this.restartGame();
      else return;
    }

    if (!model.gameOver && bombSet.isDown) {
      const [bombX, bombY] = this.findClosestSquare(
        this.char as Phaser.Physics.Matter.Sprite
      ) as number[];
      this.dropBomb(bombX, bombY);
    }
  }

  setupGameText() {
    this.livesText = this.add.text(
      textStartX + 4 * fieldSquareLength,
      textStartY,
      `${
        model.lives <= 5
          ? `LIVES :  ${"❤️".repeat(model.lives)}`
          : `LIVES: ❤️ x${model.lives}`
      }`,
      gameUITextStyle
    );
    this.add.text(
      textStartX + 8.5 * fieldSquareLength,
      textStartY,
      `LEVEL : ${model.level}`,
      gameUITextStyle
    );

    this.scoreText = this.add.text(
      textStartX,
      textStartY,
      `SCORE : ${model.score}`,
      gameUITextStyle
    );
    this.bonusesText = this.add.text(
      textStartX,
      textStartY + 9.85 * fieldSquareLength,
      "",
      bonusTextStyle
    );

    this.timerText = this.add.text(
      textStartX + 4 * fieldSquareLength,
      textStartY + 10 * fieldSquareLength,
      `TIME : ${model.curLvlTimer}`,
      gameUITextStyle
    );
  }

  createGameAnimations() {
    this.anims.create({
      key: "bombExplosion",
      frames: this.anims.generateFrameNumbers("explosion", {
        frames: Array.from(Array(64).keys()),
      }),
      frameRate: 64,
      repeat: 0,
    });

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
  }

  setupOverlapsAndColliders() {
    this.physics.add.collider(this.char, this.stone);
    this.physics.add.collider(this.char, this.wood);
    this.physics.add.collider(this.char, this.enemies, () => {
      if (!model.gameOver) this.charDie();
    });

    [this.wood, this.stone, this.bombs].forEach((object) => {
      this.physics.add.collider(this.enemies, object);
    });

    [this.hearts, this.shields, this.superBombs, this.bombIncreasers].forEach(
      (bonus) => {
        let curCallback: ArcadePhysicsCallback | undefined;
        switch (bonus) {
          case this.hearts:
            curCallback = this.collectHeart as ArcadePhysicsCallback;
            break;
          case this.shields:
            curCallback = this.collectShield as ArcadePhysicsCallback;
            break;
          case this.superBombs:
            curCallback = this.collectSuperBomb as ArcadePhysicsCallback;
            break;
          case this.bombIncreasers:
            curCallback = this.collectBombIncrease as ArcadePhysicsCallback;
            break;

          default:
            curCallback = undefined;
        }

        this.physics.add.overlap(
          this.char,
          bonus,
          curCallback,
          this.destroyOnCollideCallback as ArcadePhysicsCallback,
          this
        );
      }
    );

    [this.superBombs, this.hearts, this.shields, this.bombIncreasers].forEach(
      (bonus) => {
        this.physics.add.overlap(
          this.enemies,
          bonus,
          this.destroyOnCollideCallback as ArcadePhysicsCallback,
          undefined,
          this
        );
      }
    );
  }
  setupChar() {
    const charField = fieldMatrix
      .flat()
      .find((square) => square.object === "char") as FieldSquare;

    const charX = charField ? charField.x : charStartX;
    const charY = charField ? charField.y : charStartY;

    this.char = this.physics.add
      .sprite(charX, charY, "char")
      .setSize(fieldSquareLength * 0.8, fieldSquareLength * 0.8)
      .setScale(0.9, 0.9)
      .refreshBody();

    this.char.on("destroy", () => {
      this.charStepSound.stop();
      this.charDeathSound.play();
    });
  }

  generateGameField() {
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

        if (model.fieldMatrix) {
          const current = model.fieldMatrix[i - 1][j - 1].object;
          if (current === "wood") {
            this.wood
              .create(curSquareXCenter, curSquareYCenter, "wood")
              .setScale((1 / fieldImgSize) * fieldSquareLength)
              .refreshBody();
          }
          if (current === "char") {
            fieldMatrix[i - 1][j - 1].object = "char";
          }
          if (current?.includes("enemy")) {
            fieldMatrix[i - 1][j - 1].object = "enemy";
            this.enemies
              .create(
                fieldMatrix[i - 1][j - 1].x,
                fieldMatrix[i - 1][j - 1].y,
                "enemy"
              )
              .setSize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
              .setScale(0.9)
              .setDepth(1)
              .refreshBody();
          }
        } else {
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
    }
  }

  defineGameObjects() {
    this.grass = this.physics.add.staticGroup();
    this.stone = this.physics.add.staticGroup();
    this.wood = this.physics.add.staticGroup();
    this.enemies = this.physics.add.group();
    this.bombs = this.physics.add.group();
    this.hearts = this.physics.add.staticGroup();
    this.bombIncreasers = this.physics.add.staticGroup();
    this.shields = this.physics.add.staticGroup();
    this.superBombs = this.physics.add.staticGroup();
    this.explosions = this.physics.add.staticGroup();

    this.explosionSound = this.sound.add("explosion", { loop: false });
    this.charStepSound = this.sound.add("charStep", { loop: true });
    this.charDeathSound = this.sound.add("charDeath", { loop: false });
    this.enemyDeathSound = this.sound.add("enemyDeath", { loop: false });
    this.bonusSound = this.sound.add("bonusSound", { loop: false });
    this.putBombSound = this.sound.add("putBomb", { loop: false });
    this.stageClearSound = this.sound.add("stageClear", { loop: false });
    this.stageMusic = this.sound.add("stageMusic", { loop: true });
  }

  generateEnemies() {
    if (!model.fieldMatrix) {
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
          .setDepth(1)
          .setSize(fieldSquareLength * 0.9, fieldSquareLength * 0.9)
          .setScale(0.9)
          .refreshBody();
      }
    }
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
