import { app } from "./../../index.js";
import gameObjects from "./../gameObjects.js";
import findClosestSquare from "./findClosestSquare.js";

export default function charMovement(): void {
  const char = gameObjects.char.call(this);
  const [closestX, closestY] = findClosestSquare(char);
  const { fieldMatrix, charSpeed } = app.model;
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

  if (cursors.up.isDown) {
    char.setVelocityY(-charSpeed);
    char.setVelocityX(0);
    char.anims.play("up", true);
  } else if (cursors.right.isDown) {
    char.setVelocityX(charSpeed);
    char.setVelocityY(0);
    char.anims.play("right", true);
  } else if (cursors.down.isDown) {
    char.setVelocityY(charSpeed);
    char.setVelocityX(0);
    char.anims.play("down", true);
  } else if (cursors.left.isDown) {
    char.setVelocityX(-charSpeed);
    char.setVelocityY(0);
    char.anims.play("left", true);
  } else if (!cursors.space.isDown) {
    char.setVelocityX(0);
    char.setVelocityY(0);
    char.anims.play("turn", true);
  }
}
