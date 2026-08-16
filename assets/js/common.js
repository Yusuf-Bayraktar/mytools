(function () {
  const root = document.body.dataset.root || (location.pathname.includes('/tools/') ? '../' : './');
  const themeKey = 'tools-web-theme';
  const savedTheme = localStorage.getItem(themeKey);
  if (savedTheme === 'dark' || savedTheme === 'light') document.documentElement.dataset.theme = savedTheme;
  const header = document.querySelector('[data-site-header]');
  const footer = document.querySelector('[data-site-footer]');

  if (header) {
    header.innerHTML = `<header class="site-header"><div class="container site-header__inner"><a class="brand" href="${root}index.html">Hesaplama Araçları</a><div class="header-actions"><nav aria-label="Ana navigasyon"><a href="${root}index.html">Ana sayfa</a><a href="${root}tools/temperature.html">Termometre</a><a href="${root}tools/grade-average.html">Not ortalaması</a><a href="${root}tools/equilibrium-temperature.html">Denge sıcaklığı</a></nav><button class="theme-toggle" type="button" aria-label="Koyu temaya geç" title="Koyu temaya geç"><span aria-hidden="true">☾</span></button></div></div></header>`;
    const themeButton = header.querySelector('.theme-toggle');
    function updateThemeButton() {
      const dark = document.documentElement.dataset.theme === 'dark';
      themeButton.querySelector('span').textContent = dark ? '☀' : '☾';
      themeButton.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
      themeButton.title = dark ? 'Açık temaya geç' : 'Koyu temaya geç';
    }
    themeButton.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem(themeKey, nextTheme);
      updateThemeButton();
    });
    updateThemeButton();
  }

  if (footer) {
    footer.innerHTML = `<footer class="site-footer"><div class="container"><p>Hesaplamalar tarayıcınızda yapılır.</p></div></footer>`;
  }
})();
