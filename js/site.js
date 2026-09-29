// Teacher & event pages: phone menu and light / dark theme toggle
(function(){
  // ---- Phone menu: button with aria-expanded; closes on link tap and Escape ----
  var navToggle = document.getElementById('navToggle');
  var siteHeader = document.querySelector('header.site');
  function setMenu(open) {
    if (!navToggle || !siteHeader) return;
    siteHeader.classList.toggle('menu-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        navToggle.focus();
      }
    });
  }
  document.querySelectorAll('.mobile-panel a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  // ---- Light / dark theme toggle ----
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    var root = document.documentElement;
    var syncToggle = function () {
      themeToggle.setAttribute('aria-checked', root.getAttribute('data-theme') === 'dark' ? 'true' : 'false');
    };
    syncToggle();
    themeToggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', next);
      syncToggle();
      try { localStorage.setItem('theme', next); } catch (e) {}
      setTimeout(function () { root.classList.remove('theme-anim'); }, 500);
    });
  }

  // ---- Coming from a teacher card (/about.html#name): land on that teacher once the page has laid out ----
  if (location.hash.length > 1) {
    window.addEventListener('load', function () {
      var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
  }
})();
