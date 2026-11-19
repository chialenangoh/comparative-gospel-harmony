/* App look — injects the YouVersion-style bottom tab bar (phones).
   Tabs: Home · Bible · Plans · Community · More (More opens the page's
   own header Menu panel). The bar is styled by app-look.css and only
   appears at <=900px wide. The current page's tab is highlighted from
   the URL, so the same file works on every page that includes it. */
(function () {
  'use strict';

  var TABS = [
    { href: 'index.html',     ico: '🏠', label: 'Home',      match: ['', 'index.html'] },
    { href: 'bible.html',     ico: '📖', label: 'Bible',     match: ['bible.html', 'old-testament.html', 'new-testament.html'] },
    { href: 'plan.html',      ico: '📅', label: 'Plans',     match: ['plan.html', 'journey.html', 'advent.html'] },
    { href: 'community.html', ico: '🤝', label: 'Community', match: ['community.html'] },
    { href: '#more',          ico: '☰',  label: 'More',      match: [] }
  ];

  function build() {
    if (document.querySelector('.gh-tabbar')) return;
    var page = (location.pathname.split('/').pop() || '').toLowerCase();
    var nav = document.createElement('nav');
    nav.className = 'gh-tabbar';
    nav.setAttribute('aria-label', 'App');
    nav.innerHTML = TABS.map(function (t) {
      var active = t.match.indexOf(page) !== -1 ? ' class="active"' : '';
      return '<a href="' + t.href + '"' + active + (t.href === '#more' ? ' data-more="1"' : '') + '>' +
        '<span class="gh-tab-ico" aria-hidden="true">' + t.ico + '</span>' +
        '<span class="gh-tab-label">' + t.label + '</span></a>';
    }).join('');
    document.body.appendChild(nav);
    var more = nav.querySelector('[data-more]');
    if (more) more.addEventListener('click', function (e) {
      e.preventDefault();
      var btn = document.getElementById('hdrMenuBtn');
      if (btn) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        btn.click();
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
