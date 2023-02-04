import GithubLogo from '../assets/logos/github.png';
import RsschoolLogo from '../assets/logos/logo-rs.svg';
import selectorChecker from '../utils/selectorChecker.js';
import { view } from './index.js';
import './startView.scss';

export class StartView {
  renderUI() {
    const main = document.createElement('main');
    main.classList.add('main');
    main.innerHTML = `
      <section class="begin">
        <article class="begin__text">start</article>
      </section>
    `;
    document.body.append(main);
    this.addAudio();
  }

  renderStartScreen () {
    const main = selectorChecker(document, 'main');
    main.innerHTML = `
    <section class="logo"></section>
    <nav class="nav">
      <article class="start">start</article>
      <article class="continue">continue</article>
    </nav>
    <section class="settings">settings</section>
    <footer class="footer">
      <section class="github">
        <div class="github__logo">
          <img class="github__img" src="${GithubLogo}" alt="Github logo"/>
        </div>
        <a href="https://github.com/killthecreator">Gleb</a>
        <a href="https://github.com/HelgaAthame">Olga</a>
        <a href="https://github.com/alexmegadrive">Alex</a>
      </section>
      <section class="year">2023</section>
      <section class="rs">
        <a href="https://rs.school/js/">
          <img class="rs-school__img" src="${RsschoolLogo}" alt="RS School JS Front-end course"/>
        </a>
      </section>
    </footer>
  `;
    this.addListeners();
  }

  addListeners () {
    this.addStartListener();
    this.addSettingsListener();
  }

  addStartListener () {
    const start = selectorChecker(document, '.start');
    start.addEventListener('click', async () => {

      const phaser = await import('../phaser.js');

      const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
      bgAudio.pause();
    })
  }

  addSettingsListener () {
    const settings = selectorChecker(document, '.settings');
    settings.addEventListener('click', async () => {
      view.settings.renderUI();
    })
  }

  addAudio () {
    let loaded = false;
    const bgAudio = new Audio('../src/assets/sounds/title-screen.mp3');
    bgAudio.classList.add('bgAudio');
    bgAudio.loop = true;
    bgAudio.volume = 0.5;
    document.body.append(bgAudio);

    const beginText = selectorChecker(document, '.begin__text');
    beginText.addEventListener('click', () => {
      loaded = true;
      bgAudio.play();
      this.renderStartScreen();
    }, false);
  }
}
