import FieldSquare from "../utils/fieldSquare.js";
//import selectorChecker from "../utils/selectorChecker.js";
import { db } from "../firebase-config.js";
import { /*collection,*/ doc, getDoc, setDoc } from "firebase/firestore";
import { Buttons } from "../utils/buttons.js";

export class Model {
  auth: string;
  fieldMatrix: FieldSquare[][] | undefined;
  level: number;
  charSpeed: number;
  enemySpeed: number;
  curLvlEnemies: number;
  enemyCounter: number;
  curLvlTimer: number;
  curTimer: number;
  bombSpeed: number;
  activeBombs: {
    curBomb: ReturnType<typeof setTimeout>;
    bombTimer: number;
    bombX: number;
    bombY: number;
    isSuperBomb: boolean;
  }[];
  lives: number;
  curLvlScore: number;
  score: number;
  buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  uid: string;
  userName: string;
  gameOver: boolean;
  bombActive: boolean;
  superBombActive: boolean;
  shieldActive: boolean;
  maxBombs: number;
  bombIsPlanting: boolean;
  isGamePaused: boolean;
  escIsPressed: boolean;
  highScore: number;

  constructor() {
    this.charSpeed = 160;
    this.curLvlEnemies = 3;
    this.enemyCounter = 0;
    this.bombSpeed = 1600;
    this.curLvlScore = 0;
    this.highScore = 0;
    this.curLvlTimer = 120;
    this.score = 0;
    this.curTimer = this.curLvlTimer;
    this.fieldMatrix = undefined;
    this.enemySpeed = 80;
    this.level = 1;
    this.lives = 3;

    this._isMuted = false;
    this._volume = 0.5;
    this.buttons = {
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
    this.maxBombs = 1;
    this.bombIsPlanting = false;
    this.superBombActive = false;
    this.shieldActive = false;
    this.isGamePaused = false;
    this.escIsPressed = false;
    this.auth = "authorization";
    if (localStorage.getItem("uid")) {
      const uid = localStorage.getItem("uid");
      this.uid = uid ? uid : "";
    }
    if (localStorage.getItem("userName")) {
      const localUserName = localStorage.getItem("userName");
      this.userName = localUserName ? localUserName : "";
    }
  }

  async saveToBd() {
    await setDoc(doc(db, "users", this.uid), {
      lives: this.lives,
      uid: this.uid,
      userName: this.userName,
      score: this.curLvlScore + this.score,
      highScore: this.highScore,
      isMuted: this.isMuted,
      volume: this.volume,
      buttons: this.buttons,
      fieldMatrix: JSON.stringify(this.fieldMatrix),
      bombIsPlanting: this.bombIsPlanting,
      maxBombs: this.maxBombs,
      activeBombs: this.activeBombs,
      level: this.level,
      enemySpeed: this.enemySpeed,
      curTimer: this.curTimer,
      shieldActive: this.shieldActive,
      superBombActive: this.superBombActive,
      curLvlTimer: this.curLvlTimer,
      curLvlScore: this.curLvlScore,
      bombSpeed: this.bombSpeed,
      enemyCounter: this.enemyCounter,
      curLvlEnemies: this.curLvlEnemies,
      charSpeed: this.charSpeed,
      gameOver: this.gameOver,
    });
  }

  async takeFromBD() {
    const docRef = doc(db, "users", this.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      Object.assign(this, data);
      this.fieldMatrix = JSON.parse(data.fieldMatrix);
    }

    return docSnap.exists();
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
    this.curLvlTimer = 120;
    this.shieldActive = false;
    this.superBombActive = false;
    this.maxBombs = 1;
    this.curTimer = this.curLvlTimer;
    this.activeBombs = [];
    this.fieldMatrix = undefined;
  }

  nextLvl() {
    this.score += this.curLvlScore;
    this.curLvlScore = 0;
    this.curLvlEnemies++;
    if (this.bombSpeed > 1000) this.bombSpeed -= 100;
    if (this.enemySpeed < 200) this.enemySpeed += 20;
    if (this.level % 2 === 0) this.charSpeed += 5;
    this.curLvlTimer += 20;
    this.curTimer = this.curLvlTimer;
    this.activeBombs = [];
  }

  set isMuted(val: Boolean) {
    this._isMuted = val;

    //const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const inputRange = document.querySelector(
      ".setting__sound-input"
    ) as HTMLInputElement;
    //const muteButton = selectorChecker(document, '.setting__sound-mute');
    const muteButton = document.querySelector(".setting__sound-mute");
    //const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
    const bgAudio = document.querySelector(".bgAudio") as HTMLAudioElement;
    if (muteButton && inputRange && bgAudio) {
      muteButton.innerHTML = muteButton.innerHTML === "🔇" ? "🔈" : "🔇";
      inputRange.value = muteButton.innerHTML === "🔇" ? "1" : "0";
      bgAudio.volume = Number(inputRange.value);
    }
  }

  get isMuted(): Boolean {
    return this._isMuted;
  }

  set volume(val: number) {
    this._volume = val;

    const inputRange = document.querySelector(
      ".setting__sound-input"
    ) as HTMLInputElement;
    const muteButton = document.querySelector(".setting__sound-mute");
    const bgAudio = document.querySelector(".bgAudio") as HTMLAudioElement;
    if (inputRange && muteButton && bgAudio) {
      muteButton.innerHTML = inputRange.value === "0" ? "🔈" : "🔇";
      bgAudio.volume = Number(inputRange.value);
    }
  }
  get volume() {
    return this._volume;
  }

  generateRandomUsername() {
    this.userName = `Player #${Date.now()}`;
    this.saveUsernameToLocalStorage();
  }

  saveUsernameToLocalStorage() {
    localStorage.setItem("userName", this.userName);
  }
}

export const model = new Model();
