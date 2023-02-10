import FieldSquare from "../utils/fieldSquare.js";
import selectorChecker from "../utils/selectorChecker.js";
import { Buttons } from "../utils/buttons.js";

export class Model {
  fieldMatrix: FieldSquare[][] | undefined;
  level: number;
  charSpeed: number;
  enemySpeed: number;
  curLvlEnemies: number;
  enemyCounter: number;
  bombSpeed: number;
  activeBombs: ReturnType<typeof setTimeout>[];
  _lives: number;
  _score: number;
  curLvlScore: number;
  _buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  gameOver: boolean;
  bombActive: boolean;
  maxBombs: number;
  bombIsPlanting: boolean;
  isGamePaused: boolean;
  escIsPressed: boolean;

  constructor() {
    this.fieldMatrix = undefined;
    this.level = 1;
    this.charSpeed = 160;
    this.enemySpeed = 80;
    this.curLvlEnemies = 3;
    this.enemyCounter = 0;
    this.bombSpeed = 1600;
    this._lives = 3;
    this._score = 0;
    this.curLvlScore = 0;
    this._isMuted = false;
    this._volume = 0.5;
    this._buttons = {
      arrowUp: "UP",
      arrowDown: "DOWN",
      arrowLeft: "LEFT",
      arrowRight: "RIGHT",
      bombSet: "SPACE",
      bombRemove: "Z",
      select: "SHIFT",
      start: "ENTER",
    };
    this.activeBombs = [];
    this.gameOver = false;
    this.maxBombs = 2;
    this.bombIsPlanting = false;
    this.isGamePaused = false;
    this.escIsPressed = false;
  }

  resetGame() {
    this.score = 0;
    this.curLvlScore = 0;
    this.lives = 3;
    this.level = 1;
    this.curLvlEnemies = 3;
    this.enemyCounter = 0;
    this.bombSpeed = 1600;
    this.enemySpeed = 80;
  }

  nextLvl() {
    this.score += this.curLvlScore;
    this.curLvlScore = 0;
    this.curLvlEnemies++;
    if (this.bombSpeed > 1000) this.bombSpeed -= 100;
    if (this.enemySpeed < 200) this.enemySpeed += 20;
    if (this.level % 2 === 0) this.charSpeed += 5;
  }

  set lives(val: number) {
    this._lives = val;
    //TODO добавить в БД
  }

  get lives() {
    //TODO достать из БД
    return this._lives;
  }

  set score(val: number) {
    this._score = val;
    //TODO добавить в БД
  }

  get score() {
    //TODO достать из БД
    return this._score;
  }

  set isMuted(val: Boolean) {
    this._isMuted = val;

    const inputRange = selectorChecker(
      document,
      ".setting__sound-input"
    ) as HTMLInputElement;
    const muteButton = selectorChecker(document, ".setting__sound-mute");
    const bgAudio = selectorChecker(document, ".bgAudio") as HTMLAudioElement;

    muteButton.innerHTML = muteButton.innerHTML === "🔇" ? "🔈" : "🔇";
    inputRange.value = muteButton.innerHTML === "🔇" ? "1" : "0";
    bgAudio.volume = Number(inputRange.value);
    //TODO добавить в БД
  }
  get isMuted(): Boolean {
    //TODO взять значение из БД если оно есть
    return this._isMuted;
  }

  set volume(val: number) {
    this._volume = val;

    const inputRange = selectorChecker(
      document,
      ".setting__sound-input"
    ) as HTMLInputElement;
    const muteButton = selectorChecker(document, ".setting__sound-mute");
    const bgAudio = selectorChecker(document, ".bgAudio") as HTMLAudioElement;
    muteButton.innerHTML = inputRange.value === "0" ? "🔈" : "🔇";
    bgAudio.volume = Number(inputRange.value);
    //todo сохранять в БД
  }
  get volume() {
    //TODO взять из БД
    return this._volume;
  }

  set buttons(val: Buttons) {
    this._buttons = val;
    //TODO сохранять в БД
  }
  get buttons() {
    //todo получить информацию из БД
    return this._buttons;
  }
}

export const model = new Model();
