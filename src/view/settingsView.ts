import { model } from "../model/index.js";
import { view } from "./index.js";
import selectorChecker from "../utils/selectorChecker.js";
import "./settingsView.scss";
//import keyz from "../utils/keys.js";
import keysObject from "../utils/keys.js";
//import { gameScene } from "../phaser.js";

export class SettingsView {
  async renderUI() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (canvas) canvas.style.display = "none";

    const main = selectorChecker(document, "main");
    main.innerHTML = `
      <section class="setting__title">settings</section>
      <section class="setting__wrapper">
        <div class="setting__table">
          <div class="setting__button">
            <div class="sign">🠕</div>
            <div class="key">${model.buttons.arrowUp}</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠗</div>
            <div class="key">${model.buttons.arrowDown}</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠔</div>
            <div class="key">${model.buttons.arrowLeft}</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠖</div>
            <div class="key">${model.buttons.arrowRight}</div>
          </div>
          <div class="setting__button">
            <div class="sign">SET BOMB</div>
            <div class="key">${model.buttons.bombSet}</div>
          </div>
          <div class="setting__button">
            <div class="sign">REMOVE BOMB</div>
            <div class="key">${model.buttons.bombRemove}</div>
          </div>
          <div class="setting__button">
            <div class="sign">start</div>
            <div class="key">${model.buttons.start}</div>
          </div>
        </div>
        <div class="setting__sound">
          <div class="setting__sound-wrapper">
            <input class="setting__sound-input" value="0.5" type="range" min="0" max="1" step="0.01"/>
          </div>
          <div class="setting__sound-mute">${
            model.volume === 0 ? "🔈" : "🔇"
          }</div>
        </div>
      </section>
      <section class="setting__save">
        <button class="setting__save-button">SAVE</button>
      </section>
    `;
    this.configSoundLevel();
    this.configSoundMute();
    this.moveMenu();
  }

  configSoundLevel() {
    const inputRange = selectorChecker(
      document,
      ".setting__sound-input"
    ) as HTMLInputElement;
    inputRange.value = model.volume.toString();
    inputRange.addEventListener("input", () => {
      model.volume = Number(inputRange.value);
    });
  }

  configSoundMute() {
    const muteButton = selectorChecker(document, ".setting__sound-mute");

    muteButton.addEventListener("click", () => {
      model.isMuted = !model.isMuted;
    });
  }

  findKey(val: string): string {
    const entries = Object.entries(keysObject);
    const ourEntry = entries.find((entry) => entry[1] === val);
    if (ourEntry) {
      if (ourEntry[0].length === 1) return `Key${ourEntry[0]}`;
      return ourEntry[0];
    } else {
      return '';
    }
  }

  moveMenu() {
    let i = 0; //number of the first element in nav menu to be selected
    const signs: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".sign");
    const keys: NodeListOf<HTMLDivElement> = document.querySelectorAll(".key");
    const saveButton = selectorChecker(document, ".setting__save-button");

    let ourTarget: HTMLDivElement;

    document.addEventListener("keydown", async function f(e) {
      function clearStyles() {
        signs.forEach((article) => {
          article.classList.remove("active");
        });
        keys.forEach((link) => {
          link.classList.remove("blink");
        });
        saveButton.classList.remove("active");
      }
      switch (e.code) {
        case "Escape":
          view.start.renderUI();
          /*if (model.isGamePaused) {
            const canvas = document.querySelector(
              "canvas"
            ) as HTMLCanvasElement;
            canvas.style.display = "initial";

            const phaser = await import("../phaser.js");

            phaser.gameScene.scene.resume();
            phaser.gameScene.stageMusic.resume();
          }*/

        case view.settings.findKey(model.buttons.arrowUp):
          clearStyles();
          if (i > 0) i--;
          signs[i].classList.add("active");
          keys[i].classList.add("blink");
          ourTarget = keys[i];
          break;
        case view.settings.findKey(model.buttons.arrowDown):
          clearStyles();
          if (i < signs.length) i++;
          if (i < signs.length) {
            signs[i].classList.add("active");
            keys[i].classList.add("blink");
            ourTarget = keys[i];
          } else {
            saveButton.classList.add("active");
          }
          break;
        case view.settings.findKey(model.buttons.start):
          if (saveButton.classList.contains("active")) {
            model.buttons = {
              arrowUp: keys[0].innerHTML as "UP",
              arrowDown: keys[1].innerHTML as "DOWN",
              arrowLeft: keys[2].innerHTML as "LEFT",
              arrowRight: keys[3].innerHTML as "RIGHT",
              bombSet: keys[4].innerHTML as "SPACE",
              bombRemove: keys[5].innerHTML as "SHIFT",
              start: keys[6].innerHTML as "ENTER",
            };
            model.saveToBd();
            document.removeEventListener("keydown", f);
            view.start.renderUI();
          }
        default:
          const val = e.code.startsWith("Key") ? e.code.slice(3) : e.code;
          if (val) {
            const comparedVal = keysObject[val];

            if (ourTarget) ourTarget.textContent = comparedVal;
          }
      }
    });
  }
}
