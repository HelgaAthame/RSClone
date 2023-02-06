import { app } from "./../index.js";
import gameObjects from "./gameObjects.js";
import gameSounds from "./gameSounds.js";
import charDie from "./utils/charDie.js";

export default function create() {
  const curLvlEnemies = app.model.enemies + app.model.level;
  const enemySpeed = app.model.enemySpeed + app.model.level * 10;
  const {
    ceilsNum,
    fieldStartX,
    fieldSquareLength,
    fieldMatrix,
    fieldImgSize,
    lives,
  } = app.model;
  /* Draw field */
  /* BIG WIDTH ONLY!!! */

  const stone = gameObjects.stone.call(this);
  const grass = gameObjects.stone.call(this);
  const wood = gameObjects.wood.call(this);
  const enemies = gameObjects.enemies.call(this);
  const bombs = gameObjects.bombs.call(this);
  const char = gameObjects.char.call(this);

  const explosionSound = gameSounds.explosionSound.call(this);

  const textStartX = fieldStartX + 0.5 * fieldSquareLength;
  const textStartY = 0.3 * fieldSquareLength;
  const style = {
    font: "bold 1.5rem Arial",
    fill: "#fff",
    wordWrap: true,
    wordWrapWidth: 2,
    align: "center",
    stroke: "#000",
    strokeThickness: 3,
  };

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
          .setScale((1 / fieldImgSize) * fieldSquareLength * 0.95)
          .refreshBody();
        continue;
      }
    }
  }

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
    charDie.call(this);
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

  const cursors = this.input.keyboard.createCursorKeys();

  ///text
  const scoreTitle = this.add.text(textStartX, textStartY, "SCORE  :", style);
  const score = this.add.text(
    textStartX + 1.5 * fieldSquareLength,
    textStartY,
    app.model.score,
    style
  );
  const livesTitle = this.add.text(
    textStartX + 2.5 * fieldSquareLength,
    textStartY,
    "LIVES  :",
    style
  );
  const livesCount = this.add.text(
    textStartX + 4 * fieldSquareLength,
    textStartY,
    "❤️".repeat(lives),
    style
  );
  const levelTitle = this.add.text(
    textStartX + 9 * fieldSquareLength,
    textStartY,
    "LEVEL",
    style
  );
  const levelNumber = this.add.text(
    textStartX + 10 * fieldSquareLength,
    textStartY,
    app.model.level,
    style
  );

  ///text end
}
