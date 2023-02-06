import { app } from "./../../index.js";

export default function drawGameOver() {
  let gameOverString: string;
  if (app.model.lives) {
    gameOverString = `
      ${"❤️".repeat(
        app.model.lives + 1
      )}\nPRESS SPACE TO CONTINUE\nPRESS ESC TO EXIT`;
  } else {
    gameOverString = `GAME OVER\nPRESS SPACE TO START AGAIN\nPRESS ESC TO EXIT`;
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
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(1);
}
