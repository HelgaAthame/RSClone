import FieldSquare from "../utils/fieldSquare.js";
import selectorChecker from "../utils/selectorChecker.js";
import { db } from '../firebase-config.js';
import { collection, doc, getDoc, setDoc } from "firebase/firestore";

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
    this.charSpeed = 160;
    this.curLvlEnemies = 3;
    this.enemyCounter = 0;
    this.bombSpeed = 1600;
    this.curLvlScore = 0;    
    this.uid = '';
    this.fieldMatrix = undefined;
    this.enemySpeed = 80;
    this.enemies = 2;
    this.level = 1;
    this.bombSpeed = 5000;
    this.lives = 3;
    this.score = 0;
    this._isMuted = false;
    this._volume = 0.5;
    this.buttons = {
      arrowUp: 'UP',
      arrowDown: 'DOWN',
      arrowLeft: 'LEFT',
      arrowRight: 'RIGHT',
      bombSet: 'SPACE',
      bombRemove: 'Z',
      select: 'STIFT',
      start: 'ENTER'
    };
    this.activeBombs = [];
    this.gameOver = false;
    this.maxBombs = 2;
    this.bombIsPlanting = false;
    this.isGamePaused = false;
    this.escIsPressed = false;
  }

  fieldMatrix: FieldSquare[][] | undefined;
  level: number;
  charSpeed: number;
  enemySpeed: number;
  curLvlEnemies: number;
  enemyCounter: number;
  bombSpeed: number;
  activeBombs: ReturnType<typeof setTimeout>[];
  lives: number;
  curLvlScore: number;
  score: number;
  buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  uid: string;
  gameOver: boolean;
  bombActive: boolean;
  maxBombs: number;
  bombIsPlanting: boolean;
  isGamePaused: boolean;
  escIsPressed: boolean;

  async saveToBd () {
    await setDoc(doc(db, "users", this.uid), {
      lives: this.lives,
      uid: this.uid,
      score: this.score,
      isMuted: this.isMuted,
      volume: this.volume,
      buttons: this.buttons,
      fieldMatrix: JSON.stringify(this.fieldMatrix)
    });
  }

  async takeFromBD () {
    const docRef = doc(db, "users", this.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      //
      console.log("Document data:", docSnap.data());
      const data = docSnap.data();
      this.lives = data.lives;
      this.score = data.score;
      this.isMuted = data.isMuted;
      this.volume = data.volume;
      this.buttons = data.buttons;
      this.fieldMatrix = JSON.parse(data.fieldMatrix);

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
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

  set isMuted(val: Boolean) {
    this._isMuted = val;

    //const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const inputRange = document.querySelector('.setting__sound-input') as HTMLInputElement;
    //const muteButton = selectorChecker(document, '.setting__sound-mute');
    const muteButton = document.querySelector('.setting__sound-mute');
    //const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
    const bgAudio = document.querySelector('.bgAudio') as HTMLAudioElement;
    if ( muteButton && inputRange && bgAudio ) {
    muteButton.innerHTML = muteButton.innerHTML === '🔇' ? '🔈' : '🔇';
    inputRange.value =  muteButton.innerHTML === '🔇' ? '1' : '0';
    bgAudio.volume = Number(inputRange.value);
    }
  }

  get isMuted ():Boolean {
    return this._isMuted;
  }

  set volume(val: number) {
    this._volume = val;

    const inputRange = document.querySelector('.setting__sound-input') as HTMLInputElement;
    const muteButton = document.querySelector('.setting__sound-mute');
    const bgAudio = document.querySelector('.bgAudio') as HTMLAudioElement;
    if (inputRange && muteButton && bgAudio) {
      muteButton.innerHTML = inputRange.value === '0' ? '🔈' : '🔇';
      bgAudio.volume = Number(inputRange.value);
    }
  }
  get volume () {
    return this._volume;
  }
}

export const model = new Model();
