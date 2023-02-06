export default function preload() {
  this.load.spritesheet("char", "./src/assets/char__sprite.png", {
    frameWidth: 64,
    frameHeight: 99,
  });
  this.load.spritesheet("explosion", "./src/assets/explosion_sprite.png", {
    frameWidth: 64,
    frameHeight: 64,
  });

  this.load.image("grass", "./src/assets/grass.jpg");
  this.load.image("stone", "./src/assets/stone.jpg");
  this.load.image("wood", "./src/assets/wood.jpg");
  this.load.image("bomb", "./src/assets/bomb.png");
  this.load.image("enemy", "./src/assets/enemy.png");

  this.load.audio("explosionSound", "./src/assets/sounds/bomb_explosion.ogg");
}
