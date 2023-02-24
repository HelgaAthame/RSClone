import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import "./winview.scss";

export class WinView {
  renderUI() {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.style.display = "none";

    const main = selectorChecker(document, "main");
    main.innerHTML = `
      <section class="welcome-meaasge">
        LEVEL ${model.level++} COMPLETED !
      </section>
      <section class="win-text">
        <article class="win-enter">press ENTER to continue</article>
        <article class="win-esc">press ESC to go to start menu</article>
      </section>
    `;
    this.addListeners();
    model.saveToBd();
    model.fieldMatrix = undefined;
  }

  addListeners() {
    const callback = async (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        const main = selectorChecker(document, "main");
        main.innerHTML = `
          <div class="begin">LEVEL ${model.level}</div>
        `;
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        setTimeout(async () => {
          canvas.style.display = "initial";
          document.removeEventListener("keydown", callback);
          model.fieldMatrix = undefined;
          view.start.phaser.gameScene.generateGameField(); //
          view.start.phaser.gameScene.restartScene();
        }, 500);
      }
      if (e.code === "Esc") {
        document.removeEventListener("keydown", callback);
        view.start.renderUI();
      }
    };

    document.addEventListener("keydown", callback);
  }
}
