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
      <article class="start article">start</article>
      <article class="continue article">continue</article>
      <article class="settings article">settings</article>
    </nav>
    <footer class="footer">
      <section class="github">
        <div class="github__logo">
          <img class="github__img" src="${GithubLogo}" alt="Github logo"/>
        </div>
        <a href="https://github.com/killthecreator" class="footer-link">Gleb</a>
        <a href="https://github.com/HelgaAthame" class="footer-link">Olga</a>
        <a href="https://github.com/alexmegadrive" class="footer-link">Alex</a>
      </section>
      <section class="year">2023</section>
      <section class="rs footer-link">
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
    this.moveMenu();
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

  moveMenu () {
    let i = 0; //number of the first element in nav menu to be selected
    let k = 2; //number of the first element in footer links to be selected
    const navs: NodeListOf<HTMLDivElement> = document.querySelectorAll('.article');
    const footerlinks: NodeListOf<HTMLDivElement> = document.querySelectorAll('.footer-link');
    console.log(footerlinks);
    document.addEventListener('keyup', (e) => {

      function clearStyles () {
        navs.forEach(article => {
          article.classList.remove('active');
        });
        footerlinks.forEach(link => {
          link.classList.remove('active');
        });
      }

      if (e.code === 'ArrowUp') {
        clearStyles ();
        if ( i > 0 ) i--;
        navs[i].classList.add('active');
      }
      if (e.code === 'ArrowDown') {
        clearStyles ();
        if ( i < navs.length -1 ) i++;
        navs[i].classList.add('active');
      }
      if (e.code === 'ArrowLeft') {
        clearStyles ();
        alert(`k = ${k}`);
        if ( k > 0 ) k--;
        footerlinks[k].classList.add('active');
      }
      if (e.code === 'ArrowRight') {
        clearStyles ();
        alert(`k = ${k}`);
        if ( k < footerlinks.length - 1 ) k++;
        footerlinks[k].classList.add('active');
      }
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
    document.addEventListener('keyup', (e) => {
      beginText.classList.add('active');
      if (beginText.classList.contains('active') && e.code === 'Enter') {
        loaded = true;
        bgAudio.play();
        this.renderStartScreen();
      }
    })
    /*beginText.addEventListener('click', () => {
      loaded = true;
      bgAudio.play();
      this.renderStartScreen();
    }, false);*/
  }
}
