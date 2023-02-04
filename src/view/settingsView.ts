import selectorChecker from '../utils/selectorChecker.js';
import './settingsView.scss';

export class SettingsView {
  static renderUI() {
    const main = selectorChecker(document, 'main');
    main.innerHTML = `
      <section class="setting__title">settings</section>
      <section class="setting__wrapper">
        <div class="setting__table">
          <div class="setting__button">
            <div class="sign">🠕</div>
            <div class="key">🠕</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠗</div>
            <div class="key">🠗</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠔</div>
            <div class="key">🠔</div>
          </div>
          <div class="setting__button">
            <div class="sign">🠖</div>
            <div class="key">🠖</div>
          </div>
          <div class="setting__button">
            <div class="sign">A</div>
            <div class="key">X</div>
          </div>
          <div class="setting__button">
            <div class="sign">B</div>
            <div class="key">Z</div>
          </div>
          <div class="setting__button">
            <div class="sign">select</div>
            <div class="key">shift</div>
          </div>
          <div class="setting__button">
            <div class="sign">start</div>
            <div class="key">enter</div>
          </div>
        </div>
        <div class="setting__sound">
          <div class="setting__sound-wrapper">
            <input class="setting__sound-input" type="range"/>
          </div>
          <div class="setting__sound-mute">🔇</div>
        </div>
      </section>
      <section class="setting__save">
        <button class="setting__save-button">SAVE</button>
      </section>
    `;
  }
}
