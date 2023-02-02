import './startView.scss';

export class StartView {
  renderUI() {
    const main = document.createElement('main');
    main.classList.add('main');
    main.innerHTML = `
      <section class="logo"></section>
      <nav class="nav">
        <div class="start">start</div>
        <div class="continue">continue</div>
      </nav>
      <section class="top">
        <div class="top__title">top</div>
        <div class="top__score">00</div>
      </section>
      <footer class="footer">
        <section class="github"></section>
        <section class="year">2023</section>
        <section class="rs"></section>
      </footer>
    `;
    document.body.append(main);
  }
}
