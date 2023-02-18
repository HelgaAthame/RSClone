import { firebase } from "../firebase/firebase.js";
import GithubLogo from "../assets/logos/github.png";
import RsschoolLogo from "../assets/logos/logo-rs.svg";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import { model } from "../model/index.js";
import "./startView.scss";

import titleScreenAudio from "../assets/sounds/title-screen.mp3";

export class StartView {
  uid: string;
  phaser: { gameScene: any };
  gameScene: any;
  canvas: HTMLCanvasElement;

  constructor() {
    this.phaser;
    this.gameScene;
    this.uid = model.uid;
  }

  renderUI() {
    this.playBgAudio();

    const isAuthorized = model.auth === "authorized";
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (this.canvas) this.canvas.style.display = "none";

    let main = document.querySelector(".main");
    if (!main) {
      main = document.createElement("main");
      main.classList.add("main");
      document.body.prepend(main);
    }

    main.innerHTML = `
    <section class="logo"></section>
    <nav class="nav">

      <div class="instruction">Please, use arrow keys to navigate</div>
      <button data-content="start" class="nav-item start active article">Start</button>
      <button data-content="continue" class="nav-item continue article">Continue</button>
      <button data-content="settings" class="nav-item settings article">Settings</button>
      <button data-content="authorization" class="nav-item auth article" ${
        isAuthorized ? "disabled" : ""
      }>${model.auth}${
      model.auth === "authorized" ? `: ${model.userName}` : ""
    }</button>
      <button data-content="leaderboard" class="nav-item settings article">Leaderboard</button>
    </nav>
    <footer class="footer">
      <section class="github">
        <div class="github__logo">
          <img class="github__img" src="${GithubLogo}" alt="Github logo"/>
        </div>
        <a data-content="Gleb" href="https://github.com/killthecreator" class="footer-link">Gleb</a>
        <a data-content="Olga" href="https://github.com/HelgaAthame" class="footer-link">Olga</a>
        <a data-content="Alex" href="https://github.com/alexmegadrive" class="footer-link">Alex</a>
      </section>
      <section class="year">2023</section>
      <section class="rs footer-link">
        <a href="https://rs.school/js/">
          <img class="rs-school__img" src="${RsschoolLogo}" alt="RS School JS Front-end course"/>
        </a>
      </section>
    </footer>
    `;

    document.addEventListener("keydown", async function aud(e) {
      document.removeEventListener("keydown", aud);
      if (e.code !== "Enter") {
        view.start.addBGAudio();
      }
    });

    this.setContinueButtonState();
    this.navigateMenuListeners();
  }

  addBGAudio() {
    const bgAudio = document.querySelector(".bgAudio");
    //let loaded: boolean;
    if (!bgAudio) {
      //loaded = false;
      const bgAudio = new Audio(titleScreenAudio);
      bgAudio.classList.add("bgAudio");
      bgAudio.loop = true;
      bgAudio.volume = 0.5;
      document.body.append(bgAudio);
      bgAudio.play();
    }
    //if (bgAudio instanceof HTMLAudioElement) bgAudio.play();
  }

  playBgAudio() {
    const bgAudio = document.querySelector(".bgAudio") as HTMLAudioElement;
    if(bgAudio) bgAudio.play();
  }

  async setContinueButtonState() {
    this.uid = model.uid;
    const continueButton = selectorChecker(
      document,
      ".continue"
    ) as HTMLButtonElement;

    if (model.gameOver) {
      continueButton.disabled = true;
      return;
    }

    if (this.uid) {
      const dataExists = await model.takeFromBD();
      continueButton.disabled = dataExists ? false : true;
    } else {
      continueButton.disabled = this.canvas ? false : true;
    }
  }

  navigateMenuListeners() {
    let i = 0; //number of the first element in nav menu to be selected
    let k = 2; //number of the first element in footer links to be selected
    const navs: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".article");
    const footerlinks: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".footer-link");

    document.addEventListener("keydown", async function foo(e) {
      function clearStyles() {
        navs.forEach((article) => {
          article.classList.remove("active");
        });
        footerlinks.forEach((link) => {
          link.classList.remove("active");
        });
      }

      switch (e.code) {
        case "ArrowUp":
          clearStyles();
          if (i > 0) i--;
          navs[i].classList.add("active");
          break;
        case "ArrowDown":
          clearStyles();
          if (i < navs.length - 1) i++;
          navs[i].classList.add("active");
          // ctx.pauseBGAudio();
          break;
        case "ArrowLeft":
          clearStyles();
          if (k > 0) k--;
          footerlinks[k].classList.add("active");
          break;
        case "ArrowRight":
          clearStyles();
          if (k < footerlinks.length - 1) k++;
          footerlinks[k].classList.add("active");
          break;
        case "Enter":

          const selected = document.querySelector('.active') as HTMLButtonElement;
          if (selected) {
            switch (selected.dataset.content) {
              case "authorization":
                if (selected.disabled === false) {
                  firebase.googleAuth();
                  view.start.setContinueButtonState();
                }
                break;

              case "start":
                view.start.handleStartGame();
                document.removeEventListener("keydown", foo);
                break;

              case "continue":
                if (selected.disabled === false) {
                  view.start.handleContinueGame();
                  document.removeEventListener("keydown", foo);
                }
                break;

              case "settings":
                view.settings.renderUI();
                document.removeEventListener("keydown", foo);
                break;
              case "leaderboard":
                view.scores.renderUI();
                document.removeEventListener("keydown", foo);
                break;
              case "Olga":
                selected.click();
                break;
              case "Gleb":
                selected.click();
                break;
              case "Alex":
                selected.click();
                break;
              default:

                view.start.pauseBGAudio();
                selected.click();
                break;
            }
          }
          break;
      }
    });
  }

  async handleContinueGame() {
    console.log(`model.curLvlEnemies =${model.curLvlEnemies}`);
    if (!this.phaser) {
      this.phaser = await import("../phaser.js");
      this.gameScene = this.phaser.gameScene;
    } else {
      this.canvas.style.display = "initial";
      this.gameScene.scene.resume();
    }

    model.escIsPressed = false;
    model.gameOver = false;
  }

  async handleStartGame() {

    this.pauseBGAudio();
    if (!model.uid) {
      model.generateRandomUsername();
    }

    model.resetGame();

    model.saveToBd();

    const main = selectorChecker(document, "main");
    main.innerHTML = `
    <div class="begin">LEVEL ${model.level}</div>
  `;
    setTimeout(async () => {
      if (this.canvas) this.canvas.style.display = "initial";
      if (!this.phaser) {
        this.phaser = await import("../phaser.js");
        this.gameScene = this.phaser.gameScene;
      } else {
        this.phaser.gameScene.restartGame();
      }
    }, 500);
  }

  pauseBGAudio() {
    const bgAudio = document.querySelector(".bgAudio") as HTMLAudioElement;
    if (bgAudio) bgAudio.pause();
  }
}
