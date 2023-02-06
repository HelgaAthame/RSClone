import { app } from "./../index.js";
import gameObjects from "./gameObjects.js";
import restartScene from "./utils/restartScene.js";
import restartGame from "./utils/restartGame.js";
import enemyMovement from "./utils/enemyMovement.js";
import charMovement from "./utils/charMovement.js";
import dropBomb from "./utils/dropBomb.js";

export default function update() {
  const enemies = gameObjects.enemies.call(this);
  const { gameOver, lives } = app.model;
  const cursors = this.input.keyboard.createCursorKeys();
  if (gameOver) {
    if (cursors.space.isDown && lives) restartScene.call(this);
    else if (cursors.space.isDown && !lives) restartGame.call(this);
    else return;
  }

  if (!gameOver && cursors.space.isDown) {
    dropBomb.call(this);
  }

  charMovement();
  enemies.children.entries.forEach((enemy) => enemyMovement(enemy));
}
