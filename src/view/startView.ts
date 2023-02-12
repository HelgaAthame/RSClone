import { firebase } from "../firebase/firebase.js";
import { doc } from "firebase/firestore";
import GithubLogo from "../assets/logos/github.png";
import RsschoolLogo from "../assets/logos/logo-rs.svg";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import { model } from "../model/index.js";
import { gameScene } from "../phaser.js";
import "./startView.scss";

export class StartView {
  constructor() {
    this.phaser;
  }
  phaser: { gameScene: any };
  renderUI() {
    const main = document.createElement("main");
    main.classList.add("main");
    main.innerHTML = `
      <section class="begin">
        <article class="begin__text">START</article>
      </section>
    `;
    document.body.prepend(main);
    firebase.googleAuth();
    this.addAudio();
  }

  renderStartScreen() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (canvas) canvas.style.display = "none";
    //alert('render start screen');
    console.log(model.gameOver);
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
  }

  addListeners() {
    //this.addStartListener();
    //this.addSettingsListener();
    this.moveMenu();
  }

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
      console.log("сработал event listener na key");
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
              if (canvas) canvas.style.display = "initial";
              if (!view.start.phaser) {
                console.log(view.start.phaser);
                console.log("нет  фазера");
                view.start.phaser = await import("../phaser.js");
              } else {
                console.log(view.start.phaser);
                console.log("есть!  фазер");
                model.resetGame();
                console.log(model.enemyCounter);
                view.start.phaser.gameScene.restartGame();
              }
              //view.start.phaser = await import("../phaser.js");
              //if (model.gameOver) phaser.gameScene.changeGameOver();
              /*if (view.start.phaser && view.start.phaser.gameScene) {
                console.log(view.start.phaser);
                console.log('есть!  фазер');
                model.resetGame();
                //setTimeout(() => {phaser.gameScene.restartGame();}, 10);
                console.log(model.enemyCounter);
                //model.enemyCounter = 3;
                //alert(model.enemyCounter);
                view.start.phaser.gameScene.restartGame();
              }*/
              pauseBGAudio();
              break;
            case "Continue":
              model.takeFromBD.call(model);
              if (canvas) canvas.style.display = "initial";
              gameScene.scene.resume();
              model.gameOver = false;
              pauseBGAudio();
              break;
            case "Settings":
              view.settings.renderUI();
              break;
            case "Leaderboard":
              view.settings.renderUI();
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
    let loaded = false;
    const bgAudio = new Audio("../src/assets/sounds/title-screen.mp3");
    bgAudio.classList.add("bgAudio");
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    document.body.append(bgAudio);

    const beginText = selectorChecker(document, ".begin__text");

    document.addEventListener("keydown", (e) => {
      beginText.classList.add("active");
      if (loaded === false && e.code === "Enter") {
        beginText.classList.remove("active");
        loaded = true;
        bgAudio.play();

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
