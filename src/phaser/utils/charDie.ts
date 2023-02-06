import { app } from "./../../index.js";

export default function charDie() {
  app.model.lives--;
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
  app.model.gameOver = true;
  drawGameOver.apply(this);
}
