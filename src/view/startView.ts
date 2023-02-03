import GithubLogo from '../assets/logos/github.png';
import RsschoolLogo from '../assets/logos/logo-rs.svg';
import selectorChecker from '../utils/selectorChecker.js';
import './startView.scss';

export class StartView {
  renderUI() {
    const main = document.createElement('main');
    main.classList.add('main');
    main.innerHTML = `
      <section class="begin"></section>
    `;
    document.body.append(main);
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
    this.addAudio();
    this.addListeners();
  }

  addListeners () {
    const start = selectorChecker(document, '.start');
    start.addEventListener('click', async () => {

      const phaser = await import('../phaser.js');
      const game = phaser.game;// callback to render main game screen

      const bgAudio = selectorChecker(document, '.bgAudio') as HTMLAudioElement;
      bgAudio.pause();
    })
  }

  addAudio () {
    let loaded = false;
    const bgAudio = new Audio('../src/assets/sounds/title-screen.mp3');
    bgAudio.classList.add('bgAudio');
    bgAudio.loop = true;
    document.body.append(bgAudio);

    document.body.addEventListener('load', function() {
      loaded = true;
      bgAudio.play();
    }, false);

    /*const click = new Event('click');
    bgAudio.dispatchEvent(click);*/
  }
}
