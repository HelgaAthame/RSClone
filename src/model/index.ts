import FieldSquare from "../utils/fieldSquare.js";
import selectorChecker from "../utils/selectorChecker.js";
import { db } from '../firebase-config.js';

type Buttons = {
  arrowUp: string
  arrowDown: string
  arrowLeft: string
  arrowRight: string
  bombSet: string
  bombRemove: string
  select: string
  start: string
}

export class Model {
  constructor () {
    this._uid = '';
    this.fieldMatrix = undefined;
    this.enemySpeed = 80;
    this.enemies = 2;
    this.level = 1;
    this.bombSpeed = 5000;
    this._lives = 3;
    this._score = 0;
    this._isMuted = false;
    this._volume = 0.5;
    this._buttons = {
      arrowUp: 'UP',
      arrowDown: 'DOWN',
      arrowLeft: 'LEFT',
      arrowRight: 'RIGHT',
      bombSet: 'SPACE',
      bombRemove: 'Z',
      select: 'STIFT',
      start: 'ENTER'
    }
  }
  fieldMatrix: FieldSquare[][] | undefined;
  enemySpeed: number;
  enemies: number;
  level: number;
  bombSpeed: number;
  _lives: number;
  _score: number;
  _buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  _uid: string;

  set uid( val: string) {
    this._uid = val;
  }
  get uid() {
    return this._uid;
  }

  set lives (val: number) {
    this._lives = val;
    //TODO добавить в БД
  }

  get lives () {
    //TODO достать из БД
    return this._lives;
  }

  set score (val: number) {
    this._score = val;
    //TODO добавить в БД
  }

  get score () {
    //TODO достать из БД
    return this._score;
  }

  set isMuted (val: Boolean) {
    this._isMuted = val;

    const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const muteButton = selectorChecker(document, '.setting__sound-mute');
    const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;

    muteButton.innerHTML = muteButton.innerHTML === '🔇' ? '🔈' : '🔇';
    inputRange.value =  muteButton.innerHTML === '🔇' ? '1' : '0';
    bgAudio.volume = Number(inputRange.value);
    //TODO добавить в БД
  }
  get isMuted ():Boolean {
    //TODO взять значение из БД если оно есть
    return this._isMuted;
  }

  set volume (val: number) {
    this._volume = val;

    const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const muteButton = selectorChecker(document, '.setting__sound-mute');
    const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
    muteButton.innerHTML = inputRange.value === '0' ? '🔈' : '🔇';
    bgAudio.volume = Number(inputRange.value);
    //todo сохранять в БД
  }
  get volume () {
    //TODO взять из БД
    return this._volume;
  }

  set buttons (val: Buttons) {
    this._buttons = val;
    //TODO сохранять в БД
  }
  get buttons () {
    //todo получить информацию из БД
    return this._buttons;
  }
}

export const model = new Model();
