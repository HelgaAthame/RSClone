import { Model, model } from '../model/index.js';
import selectorChecker from '../utils/selectorChecker.js';
import './settingsView.scss';

export class SettingsView {

  renderUI() {
    const main = selectorChecker(document, 'main');
    main.innerHTML = `
      <section class="setting__title">settings</section>
      <section class="setting__wrapper">
        <div class="setting__table">
          <div class="setting__button">
            <div class="sign arrow-up">🠕</div>
            <div class="key">🠕</div>
          </div>
          <div class="setting__button">
            <div class="sign arrow-up">🠗</div>
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
            <input class="setting__sound-input" value="0.5" type="range" min="0" max="1" step="0.01"/>
          </div>
          <div class="setting__sound-mute">🔇</div>
        </div>
      </section>
      <section class="setting__save">
        <button class="setting__save-button">SAVE</button>
      </section>
    `;
    this.configSoundLevel();
    this.configSoundMute();
    this.editSettings();
  }

  configSoundLevel() {
    const inputRange = selectorChecker(document, '.setting__sound-input') as HTMLInputElement;
    const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;

    inputRange.addEventListener('input', () => {
      model.volume = Number(inputRange.value);
    })
  }

  configSoundMute () {
    const muteButton = selectorChecker(document, '.setting__sound-mute');

    muteButton.addEventListener('click', () => {
      model.isMuted = !model.isMuted;
    })
  }

  editSettings () {
    const settingSigns = document.querySelectorAll('.sign');
    const keys: NodeListOf<HTMLDivElement> = document.querySelectorAll('.key');

    let ourTarget: HTMLDivElement;

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const val = e.code.startsWith('Key') ? e.code.slice(3) : e.code;
      ourTarget.textContent = val;
    });

    settingSigns.forEach((sign: Element, i: number) => {

      sign.addEventListener('click', () => {
        settingSigns.forEach(sign => {
          sign.classList.remove('active');
        });
        sign.classList.add('active');
        keys.forEach(key => {
          key.classList.remove('blink');
        })
        keys[i].classList.add('blink');
        ourTarget = keys[i];
      });
    })
  }

}
