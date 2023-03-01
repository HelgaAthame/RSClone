import FieldSquare from "../utils/fieldSquare.js";
import ActiveBomb from "../utils/activeBomb.js";
import Buttons from "../utils/buttons.js";
import { db } from "../firebase-config.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class Model {
  textStartX: number;
  textStartY: number;
  charStartX: number;
  charStartY: number;
  width: number;
  height: number;
  fieldSquareLength: number;
  fieldStartX: number;
  ceilsNum: number;
  enteredLevel: number;
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
  activeBombs: ActiveBomb[];
  lives: number;
  curLvlScore: number;
  score: number;
  buttons: Buttons;
  _isMuted: Boolean;
  _volume: number;
  uid: string;
  userName: string;
  gameOver: boolean;
  superBombActive: boolean;
  shieldActive: boolean;
  berserkActive: boolean;
  maxBombs: number;
  bombIsPlanting: boolean;
  highScore: number;

  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.fieldSquareLength = this.height / this.ceilsNum;
    this.fieldStartX = this.width / 2 - this.height / 2;

    this.level = 1;
    this.ceilsNum = 11 + 3 * Math.floor((this.level - 1) / 3);
    this.enteredLevel = 1;
    this.charSpeed = 160;
    this.curLvlEnemies = 10;
    this.enemyCounter = 0;
    this.bombSpeed = 1600;
    this.curLvlScore = 0;
    this.highScore = 0;
    this.curLvlTimer = 120;
    this.score = 0;
    this.curTimer = this.curLvlTimer;
    this.fieldMatrix = undefined;
    this.enemySpeed = 80;
    this.lives = 3;

    this._isMuted = false;
    this._volume = 0.5;
    this.buttons = {
      arrowUp: "UP",
      arrowDown: "DOWN",
      arrowLeft: "LEFT",
      arrowRight: "RIGHT",
      bombSet: "SPACE",
      bombRemove: "SHIFT",
      start: "ENTER",
    };
    this.activeBombs = [];
    this.gameOver = false;
    this.maxBombs = 1;
    this.bombIsPlanting = false;
    this.superBombActive = false;
    this.shieldActive = false;
    this.berserkActive = false;
    this.berserkActive = false;
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
    let allValuesExists = true;
    Object.entries(this).forEach((entrie) => {
      if (entrie[1] === undefined) {
        allValuesExists = false;
      }
    });
    if (allValuesExists) {
      await setDoc(doc(db, "users", this.uid), {
        ceilsNum: this.ceilsNum,
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
        berserkActive: this.berserkActive,
      }).catch(() => {
        model.saveToBd();
      });
    }
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
    this.ceilsNum = 11 + 3 * Math.floor((model.level - 1) / 3);
    this.score = 0;
    this.curLvlScore = 0;
    this.lives = 3;
    this.level = Number(this.enteredLevel);
    this.curLvlEnemies = this.level + 2;
    this.enemyCounter = 0;
    this.bombSpeed = this.bombSpeed < 1000 ? 1000 : 2000 - this.level * 100;
    this.enemySpeed = this.enemySpeed > 200 ? 200 : 70 + this.level * 10;
    this.curLvlTimer = 110 + this.level * 20;
    this.shieldActive = false;
    this.berserkActive = false;
    this.charSpeed = 160;
    this.bombIsPlanting = false;
    this.superBombActive = false;
    this.berserkActive = false;
    this.maxBombs = 1;
    this.curTimer = this.curLvlTimer;
    this.activeBombs = [];
    this.fieldMatrix = undefined;

    this.fieldSquareLength = this.height / this.ceilsNum;
    this.charStartX = this.fieldStartX + 1.5 * this.fieldSquareLength;
    this.charStartY = this.height - 1.5 * this.fieldSquareLength;
    this.textStartX = this.fieldStartX + 0.5 * this.fieldSquareLength;
    this.textStartY = 0.3 * this.fieldSquareLength;
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
    if (this.level === 1) {
      this.ceilsNum = 11 + 3 * Math.floor((model.level - 1) / 3);
      this.fieldSquareLength = this.height / this.ceilsNum;
    }
  }

  set isMuted(val: Boolean) {
    this._isMuted = val;

    const inputRange = document.querySelector(
      ".setting__sound-input"
    ) as HTMLInputElement;
    const muteButton = document.querySelector(".setting__sound-mute");
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
