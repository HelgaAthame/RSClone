import GithubLogo from '../assets/logos/github.png';
import RsschoolLogo from '../assets/logos/logo-rs.svg'
import selectorChecker from '../utils/selectorChecker.js';
import './startView.scss';

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
    this.addListeners();
    document.body.append(main);
  }

  addListeners () {
    const start = selectorChecker(document, '.start');
    start.addEventListener('click', () => {
      // some callback to render main game screen
    })
  }
}
