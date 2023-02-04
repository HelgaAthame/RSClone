import selectorChecker from "../utils/selectorChecker.js";

export class SettingsView {
  static renderUI() {
    const main = selectorChecker(document, 'main');
    main.innerHTML = `

    `;
  }
}
