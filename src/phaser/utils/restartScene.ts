import { app } from "./../../index.js";

export default function restartScene() {
  this.scene.restart();
  app.model.score = 0;
  setTimeout(() => {
    app.model.gameOver = false;
  }, 1);
}
