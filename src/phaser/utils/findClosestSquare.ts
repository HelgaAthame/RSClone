import { app } from "./../../index.js";

export default function findClosestSquare(
  object: Phaser.Physics.Matter.Sprite
) {
  const objectX = object.x;
  const objectY = object.y;
  const flatFieldMatrix = app.model.fieldMatrix.flat();
  const charToSquareDist = flatFieldMatrix.map((square) =>
    Math.sqrt((objectX - square.x) ** 2 + (objectY - square.y) ** 2)
  );

  const minDistSquare = Math.min(...charToSquareDist);
  const minDistSquareIndex = charToSquareDist.indexOf(minDistSquare);
  const closestSquare = flatFieldMatrix[minDistSquareIndex];
  return [closestSquare.x, closestSquare.y];
}
