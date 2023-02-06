import { app } from "./../index.js";

const { fieldSquareLength, charStartX, charStartY } = app.model;

export default {
  stone() {
    return this.physics.add.staticGroup();
  },
  grass() {
    return this.physics.add.staticGroup();
  },
  wood() {
    return this.physics.add.staticGroup();
  },
  enemies() {
    return this.physics.add.group();
  },
  bombs() {
    return this.physics.add.group();
  },
  char() {
    return this.physics.add
      .sprite(charStartX, charStartY, "char")
      .setSize(fieldSquareLength * 0.99, fieldSquareLength * 0.99)
      .setScale(0.9, 0.9)
      .refreshBody();
  },
};
