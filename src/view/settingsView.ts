import selectorChecker from "../utils/selectorChecker.js";

export class SettingsView {
  static renderUI() {
    const main = selectorChecker(document, 'main');
    main.innerHTML = `
      <section class="setting__wrapper">
        <div class="setting__table">
          <div class="setting__arrow-up">🠕</div>
          <div class="setting__arrow-down">🠗</div>
          <div class="setting__arrow-left">🠔</div>
          <div class="setting__arrow-right">🠖</div>
          <div class="setting__a-button">A</div>
          <div class="setting__b-button">B</div>
          <div class="setting__select">select</div>
          <div class="setting__start">start</div>
        </div>
        <div class="setting__sound">
          <div class="setting__sound-wrapper">
            <input type="range"/>
          </div>
          <div class="setting__sound-mute"></div>
        </div>
      </section>
    `;
  }
}
