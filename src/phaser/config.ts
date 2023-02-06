import { app } from "./../index.js";
import preload from "./preload.js";
import create from "./create.js";
import update from "./update.js";

export const config = {
  type: Phaser.AUTO,
  width: app.model.gameWidth,
  height: app.model.gameHeight,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    char: "",
    preload: preload,
    create: create,
    update: update,
  },
};
