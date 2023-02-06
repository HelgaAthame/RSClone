import { app } from "./../../index.js";
import findClosestSquare from "./findClosestSquare.js";
import explodeBomb from "./explodeBomb.js";
import { model } from "../../model/index.js";
import gameObjects from "./../gameObjects.js";

export default function dropBomb() {
  const char = gameObjects.char.apply(this);
  const bombs = gameObjects.bombs.apply(this);
  const { fieldSquareLength } = app.model;
  let { bombActive } = app.model;
  if (!bombActive) {
    const [bombX, bombY] = findClosestSquare(char);

    bombActive = true;
    const bomb = bombs.create(bombX, bombY, "bomb").setImmovable();
    const bombScaleX = (1 / 555) * fieldSquareLength;
    const bombScaleY = (1 / 569) * fieldSquareLength;
    bomb.setScale(bombScaleX / 1.3, bombScaleY / 1.3);
    setTimeout(() => (bombActive = false), 1000);

    bomb.on("destroy", () => {
      const explosionSound = this.sound.sounds[0];
      explosionSound.play();
    });

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
    }, model.bombSpeed - 1000 * (model.level - 1));

    char.anims.play("placeBomb", true);
  }
}
