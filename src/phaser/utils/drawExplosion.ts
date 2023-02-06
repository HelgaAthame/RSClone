export default function drawExplosion(x: number, y: number) {
  const explosion = this.physics.add.sprite(x, y, "explosion");
  const explosionAnim = explosion.anims.play("bombExplosion", false);
  explosionAnim.once("animationcomplete", () => {
    explosionAnim.destroy();
  });
}
