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
  constructor() {
    this.phaser;
    this.gameScene;
  }
  phaser: { gameScene: any };
  gameScene: any;
  renderUI() {
    const main = document.createElement("main");
    main.classList.add("main");
    main.innerHTML = `
      <section class="begin">
        <p class="begin__text">START</p>
      </section>
    `;
    document.body.prepend(main);
    document.addEventListener("keydown", function func() {
      document.removeEventListener("keydown", func);
      firebase.googleAuth();
    });

    //this.addAudio();
  }

  renderStartScreen() {
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
  }

  async addListeners() {
    //this.addStartListener();
    //this.addSettingsListener();
    await this.continueButton();
    this.moveMenu();
  }

  async continueButton() {
    const continueButton = selectorChecker(
      document,
      ".continue"
    ) as HTMLDivElement;
    const docRef = doc(db, "users", model.uid);
    const docSnap = await getDoc(docRef);

    continueButton.style.display =
      docSnap.exists() && model.uid ? "initial" : "none";
  }

  // listeners to click bellow

  /*addStartListener () {
    const start = selectorChecker(document, '.start');
    start.addEventListener('click', async () => {

      const phaser = await import('../phaser.js');

      const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
      bgAudio.pause();
    })
  }  //this is navigation with mouse amd we needn't it*/

  /*addSettingsListener () {
    const settings = selectorChecker(document, '.settings');
    settings.addEventListener('click', async () => {
      view.settings.renderUI();
    })
  }*/

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

          //let phaser: { gameScene: any; };
          switch (selected.innerHTML) {
            case "Start":
              //model.takeFromBD.call(model);

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
              }, 3000);
              break;

            case "Continue":
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

  addAudio() {
    const bgAudio = document.querySelector(".bgAudio");
    let loaded: boolean;
    if (!bgAudio) {
      loaded = false;
      const bgAudio = new Audio(titleScreenAudio);
      bgAudio.classList.add("bgAudio");
      bgAudio.loop = true;
      bgAudio.volume = 0.5;
      document.body.append(bgAudio);
    }

    const beginText = selectorChecker(document, ".begin__text");

    document.addEventListener("keydown", (e) => {
      beginText.classList.add("active");
      if (loaded === false && e.code === "Enter") {
        beginText.classList.remove("active");
        loaded = true;
        //bgAudio.play();

        this.renderStartScreen();
      }
    });
    /*beginText.addEventListener('click', () => {
      loaded = true;
      bgAudio.play();
      this.renderStartScreen();
    }, false);*/
  }
}
