import { app } from "./../../index.js";
import dropBomb from "./dropBomb.js";
import drawExplosion from "./drawExplosion.js";
import findClosestSquare from "./findClosestSquare.js";
import charDie from "./charDie.js";
import { model } from "../../model/index.js";
import restartScene from "./restartScene.js";

export default function explodeBomb(
  bomb: Phaser.GameObjects.Image,
  x: number,
  y: number
) {
  const { fieldMatrix, fieldSquareLength } = app.model;
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

    drawExplosion.apply(this, [x, y]);

    if (sqaureToCheck.object === "wood") {
      const woodSquare = wood.children.entries.find((woodSquare) => {
        return (
          sqaureToCheck.x === woodSquare.x && sqaureToCheck.y === woodSquare.y
        );
      });
      if (!woodSquare) throw Error("Wood square was not found");
      sqaureToCheck.object = "grass";
      woodSquare.destroy();
    } else if (sqaureToCheck.object === "char") {
      charDie.apply(this);
    } else if (enemiesAlive.some((enemy) => enemy === sqaureToCheck)) {
      const enemyToDestroy = enemies.children.entries.find((enemy) => {
        const [closestX, closestY] = findClosestSquare(enemy);
        return closestX === sqaureToCheck.x && closestY === sqaureToCheck.y;
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
            model.level++;
            console.log(`model.enemies = ${model.enemies}`);
            console.log(`curLvlEnemies = ${curLvlEnemies}`);
            console.log(`enemiesAlive = ${enemiesAlive.length}`);
            gameOver = true;
            restartScene.apply(this); // после перезагрузки сцены не появляются враги на игровом поле
          }
        }, 200);
      }
    }
  };

  checkSquare(x, y);
  checkSquare(nextX, y);
  checkSquare(prevX, y);
  checkSquare(x, nextY);
  checkSquare(x, prevY);
}
