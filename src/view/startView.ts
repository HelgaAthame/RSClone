import { db, firebase } from "../firebase/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import GithubLogo from "../assets/logos/github.png";
import RsschoolLogo from "../assets/logos/logo-rs.svg";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import { model } from "../model/index.js";
//import { gameScene } from "../phaser.js";
import "./startView.scss";

import titleScreenAudio from "../assets/sounds/title-screen.mp3";

export class StartView {
  uid: string | null;

  constructor() {
    this.phaser;
    this.gameScene;
    this.uid = model.uid;
    this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
  }
  phaser: { gameScene: any };
  gameScene: any;
  canvas: HTMLCanvasElement;

  renderUI() {
    console.log('вызван start view render UI');
    console.log('fieldMatrix = ');
    console.log(model.fieldMatrix);

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) canvas.style.display = "none";

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
      <article data-content="start" class="nav-item start active article">Start</article>
      <article data-content="continue" class="nav-item continue article">Continue</article>
      <article data-content="settings" class="nav-item settings article">Settings</article>
      <article data-content=${model.auth} class="nav-item auth article">${
        model.auth
      }${
        model.auth === 'authorized'
        ? `: ${model.userName}`
        : ''
      }
        </article>
      <article data-content="leaderboard" class="nav-item settings article">Leaderboard</article>
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
      if (e.code !== 'Enter') {
        view.start.addBGAudio();
      }
    });

    this.setContinueButtonState();
    this.navigateMenuListeners();
    // this.addBGAudio();
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
    if (bgAudio instanceof HTMLAudioElement) bgAudio.play();
  }

  async setContinueButtonState() {
    const continueButton = selectorChecker(
      document,
      ".continue"
    ) as HTMLDivElement;
    let docRef;
    if (this.uid) {
      docRef = doc(db, "users", this.uid);
    }
    let docSnap;
    if (docRef) {
      docSnap = await getDoc(docRef);
    }

    if (docSnap) continueButton.style.display =
      docSnap.exists() && this.uid ? "initial" : "none";
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
          const selected = document.querySelector(".active") as HTMLElement;
          if (selected) {
            switch (selected.dataset.content) {
              case "authorization":
                firebase.googleAuth();

                break;

              case "start":
                view.start.handleStartGame();
                document.removeEventListener("keydown", foo);
                break;

              case "continue":
                view.start.handleContinueGame();
                document.removeEventListener("keydown", foo);
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
                selected.click();
                break;
            }
          }

          //document.removeEventListener("keydown", foo);
          break;
      }
    });
  }

  async handleContinueGame() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (!model.uid) {
      model.generateRandomUsername();
    }

    this.pauseBGAudio();

    await model.takeFromBD().catch((e) => {
      console.log(`error catched while taking from DB ${e}`);
    });

    if (canvas) canvas.style.display = "initial";
    if (view.start.phaser) {
      view.start.gameScene = view.start.phaser.gameScene;
      view.start.gameScene.scene.resume();
    }
    if (!view.start.phaser) {
      view.start.phaser = await import("../phaser.js");
      return;
    }

    model.escIsPressed = false;
    model.gameOver = false;
  }

  async handleStartGame() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (!model.uid) {
      model.generateRandomUsername();
    }

    this.pauseBGAudio();

    const main = selectorChecker(document, "main");
    main.innerHTML = `
    <div class="begin">LEVEL 1</div>
  `;
    setTimeout(async () => {
      if (canvas) canvas.style.display = "initial";
      if (!view.start.phaser) {
        view.start.phaser = await import("../phaser.js");
      } else {
        model.resetGame();
        model.saveToBd().catch((e)=> {
          console.log(`error while saving to DB ${e}`)
        });
        view.start.phaser.gameScene.restartGame();
      }
    }, 500);
  }

  pauseBGAudio() {
    const bgAudio = document.querySelector(".bgAudio") as HTMLAudioElement;
    if (bgAudio) bgAudio.pause();
  }
}
