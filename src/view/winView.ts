import { model } from "../model/index.js";
import selectorChecker from "../utils/selectorChecker.js";
import { view } from "./index.js";
import "./winview.scss";

export class WinView {
  renderUI(context: this) {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    canvas.style.display = "none";

    const main = selectorChecker(document, "main");
    main.innerHTML = `
      <section class="welcome-meaasge">
        LEVEL ${model.level} COMPLETED !
      </section>
      <section class="win-text">
        <article class="win-enter">press ENTER to continue</article>
        <article class="win-esc">press ESC to go to start menu</article>
      </section>
    `;
    this.addListeners(context);
  }

  addListeners(context: this) {
    const callback = async (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        model.level++;
        const canvas = document.querySelector("canvas") as HTMLCanvasElement;
        canvas.style.display = "initial";
        document.removeEventListener("keyup", callback);

        const phaser = await import("../phaser.js");
        phaser.gameScene.restartScene.call(context);
      }
      if (e.code === "Esc") {
        view.start.renderUI();
      }
    };
    document.addEventListener("keyup", callback);
  }
}
