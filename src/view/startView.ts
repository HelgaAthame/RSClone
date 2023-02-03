import GithubLogo from '../assets/logos/github.png';
import RsschoolLogo from '../assets/logos/logo-rs.svg';
import selectorChecker from '../utils/selectorChecker.js';
import './startView.scss';
import { game } from '../phaser.js';

export class StartView {
  renderUI() {
    const main = document.createElement('main');
    main.classList.add('main');
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
    document.body.append(main);
    this.addListeners();
  }

  addListeners () {
    const start = selectorChecker(document, '.start');
    start.addEventListener('click', async () => {

      const phaser = await import('../phaser.js');
      const game = phaser.game;// some callback to render main game screen
    })
  }
}
