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
  }
  fieldMatrix: FieldSquare[][] | undefined;
  enemySpeed: number;
  enemies: number;
  level: number;
  bombSpeed: number;
  lives: number;
  score: number;
  buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  uid: string;

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
  }

  set isMuted (val: Boolean) {
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
}

export const model = new Model();
