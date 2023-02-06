import { app } from "./../../index.js";

export default function restartGame() {
  app.model.lives = 3;
  this.scene.restart();
  setTimeout(() => {
    app.model.gameOver = false;
  }, 1);
}
