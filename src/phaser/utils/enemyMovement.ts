import { app } from "./../../index.js";
import findClosestSquare from "./findClosestSquare.js";

export default function enemyMovement(
  enemy: Phaser.Physics.Matter.Sprite
): void {
  const { enemySpeed, fieldMatrix } = app.model;
  const randomMove1 = [-enemySpeed, enemySpeed][Math.floor(Math.random() * 2)];
  const randomMove2 = [-enemySpeed, enemySpeed][Math.floor(Math.random() * 2)];

  const [closestX, closestY] = findClosestSquare(enemy);
  const flatFieldMatrix = fieldMatrix.flat();

  const newEnemySquare = flatFieldMatrix.find(
    (square) =>
      Math.floor(square.x) === Math.floor(closestX) &&
      Math.floor(square.y) === Math.floor(closestY)
  );

  const curEnemyID = enemies.children.entries.indexOf(enemy);
  if (!newEnemySquare) throw Error("New enemy square was not found");
  newEnemySquare.object = `enemy_${curEnemyID}`;

  if (
    enemy.body.position.x !== enemy.body.prev.x &&
    enemy.body.position.y !== enemy.body.prev.y
  ) {
    return;
  } else {
    enemy.setVelocityY(randomMove1);
    enemy.setVelocityX(randomMove2);
  }
}
