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
    this.uid = localStorage.getItem("uid");
  }
  phaser: { gameScene: any };
  gameScene: any;

  renderUI() {
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
      <article class="auth article">Authorization</article>
      <article class="start article">Start</article>
      <article class="continue article">Continue</article>
      <article class="settings article">Settings</article>
      <article class="settings article">Leaderboard</article>
    </nav>
    <footer class="footer">
      <section class="github">
        <div class="github__logo">
          <img class="github__img" src="${GithubLogo}" alt="Github logo"/>
        </div>
        <a href="https://github.com/killthecreator" class="footer-link">Gleb</a>
        <a href="https://github.com/HelgaAthame" class="footer-link">Olga</a>
        <a href="https://github.com/alexmegadrive" class="footer-link">Alex</a>
      </section>
      <section class="year">2023</section>
      <section class="rs footer-link">
        <a href="https://rs.school/js/">
          <img class="rs-school__img" src="${RsschoolLogo}" alt="RS School JS Front-end course"/>
        </a>
      </section>
    </footer>
    `;

    document.addEventListener("keydown", async function aud() {
      document.removeEventListener("keydown", aud);
      view.start.addAudio();
    });

    view.start.addListeners();
    /*const localUserName = localStorage.getItem("userName");
    const uid = this.uid;




    const addListeners = this.addAudio;
    const startScreen = this.renderStartScreen;

    /*main.classList.add("main");
    main.innerHTML = `
      <section class="begin">
        <p class="begin__text">START</p>
      </section>
    `;
    document.body.prepend(main);

    document.addEventListener("keydown", async function func() {
      document.removeEventListener("keydown", func);

      if (!uid) {
        firebase.googleAuth();
        model.generateRandomUsername();
      } else addListeners();
    });


//model.generateRandomUsername();
    console.log("localUserName :", localUserName);
    console.log("localUID :", uid);*/
    //this.addAudio();
  }

  addAudio() {
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
  }

  /*renderStartScreen() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (canvas) canvas.style.display = "none";
    const main = selectorChecker(document, "main");
    main.innerHTML = `
    <section class="logo"></section>
    <nav class="nav">
      <article class="start article active">Start</article>
      <article class="continue article">Continue</article>
      <article class="settings article">Settings</article>
      <article class="settings article">Leaderboard</article>
    </nav>
    <footer class="footer">
      <section class="github">
        <div class="github__logo">
          <img class="github__img" src="${GithubLogo}" alt="Github logo"/>
        </div>
        <a href="https://github.com/killthecreator" class="footer-link">Gleb</a>
        <a href="https://github.com/HelgaAthame" class="footer-link">Olga</a>
        <a href="https://github.com/alexmegadrive" class="footer-link">Alex</a>
      </section>
      <section class="year">2023</section>
      <section class="rs footer-link">
        <a href="https://rs.school/js/">
          <img class="rs-school__img" src="${RsschoolLogo}" alt="RS School JS Front-end course"/>
        </a>
      </section>
    </footer>
  `;
    this.addListeners();

    const bgAudio = selectorChecker(document, ".bgAudio") as HTMLAudioElement;
    bgAudio.play();
  }*/

  async addListeners() {
    await this.continueButton();
    this.moveMenu();
  }

  async continueButton() {
    if (this.uid) {
      const continueButton = selectorChecker(
        document,
        ".continue"
      ) as HTMLDivElement;
      const docRef = doc(db, "users", this.uid);
      const docSnap = await getDoc(docRef);

      continueButton.style.display =
        docSnap.exists() && this.uid ? "initial" : "none";
    }
  }

  moveMenu() {
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

      function pauseBGAudio() {
        const bgAudio = selectorChecker(
          document,
          ".bgAudio"
        ) as HTMLAudioElement;
        bgAudio.pause();
      }
      //console.log(e.code);
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
          const selected = selectorChecker(document, ".active") as HTMLElement;
          const canvas = document.querySelector("canvas") as HTMLCanvasElement;

          switch (selected.innerHTML) {
            case "Authorization":
              firebase.googleAuth();
              break;

            case "Start":
              if (!model.uid && !localStorage.getItem("userName")) {
                model.generateRandomUsername();
                console.log("uid :", model.uid);
                console.log("username :", model.userName);
              }

              pauseBGAudio();

              const main = selectorChecker(document, "main");
              main.innerHTML = `
              <div class="begin">LEVEL ${model.level}</div>
            `;
              setTimeout(async () => {
                if (canvas) canvas.style.display = "initial";
                if (!view.start.phaser) {
                  view.start.phaser = await import("../phaser.js");
                } else {
                  model.resetGame();
                  view.start.phaser.gameScene.restartGame();
                }
              }, 500);
              break;

            case "Continue":
              if (!model.uid && !localStorage.getItem("userName")) {
                model.generateRandomUsername();
                console.log("uid :", model.uid);
                console.log("username :", model.userName);
              }

              pauseBGAudio();

              model.takeFromBD.call(model);
              if (canvas) canvas.style.display = "initial";
              if (view.start.phaser) {
                view.start.gameScene = view.start.phaser.gameScene;
                view.start.gameScene.scene.resume();
              }
              if (!view.start.phaser) {
                model.enemyCounter = model.level + 2;
                view.start.phaser = await import("../phaser.js");
              }

              console.log(`model.enemyCounter = ${model.enemyCounter}`);
              console.log(`model.curLvlEnemies = ${model.curLvlEnemies}`);
              model.escIsPressed = false;
              model.gameOver = false;
              break;

            case "Settings":
              view.settings.renderUI();
              break;
            case "Leaderboard":
              view.scores.renderUI();
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
          document.removeEventListener("keydown", foo);
          break;
      }
    });
  }

}
