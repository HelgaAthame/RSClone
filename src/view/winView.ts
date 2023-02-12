import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import "./winview.scss";
import { gameScene } from "../phaser.js";

export class WinView {
  renderUI(context: typeof gameScene) {
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
    this.addListeners(/*context*/);
    model.saveToBd();
  }

  addListeners(/*context: typeof gameScene*/) {

    const callback = async (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        //model.level++;
        const main = selectorChecker(document, "main");
        main.innerHTML = `
          <div class="begin">LEVEL ${model.level}</div>
        `;
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        setTimeout(async () => {
          canvas.style.display = "initial";
          document.removeEventListener("keydown", callback);
          view.start.phaser.gameScene.restartScene();
        }, 3000);

      }
      if (e.code === "Esc") {
        document.removeEventListener("keydown", callback);
        view.start.renderUI();
      }
    };

    document.addEventListener("keydown", callback);
  }
}
