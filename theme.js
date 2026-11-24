/* Gospel Harmony — dark mode (owner request 2026-11-20).
   Loaded as the FIRST script in <head> on every page so the theme
   attribute is set on <html> before first paint (no flash of light).
   Choice persists in localStorage 'gh-theme' ('dark' | 'light');
   when unset, the OS/browser prefers-color-scheme decides, and a
   live system change is followed until the reader picks a side.
   Everything is defensive: a storage failure must never break a page. */
(function () {
  'use strict';

  var KEY = 'gh-theme';
  var btn = null;

  function stored() {
    try {
      var v = window.localStorage.getItem(KEY);
      return (v === 'dark' || v === 'light') ? v : null;
    } catch (e) {
      return null;
    }
  }

  function systemMode() {
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function paintButton() {
    if (!btn) return;
    btn.textContent = current() === 'dark' ? '☀️' : '🌙';
  }

  function apply(mode) {
    document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    paintButton();
  }

  /* Set the attribute immediately — this script runs in <head>. */
  try {
    apply(stored() || systemMode());
  } catch (e) { /* never break the page */ }

  /* Follow live system changes only while no explicit choice is stored. */
  try {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    var onSystemChange = function (ev) {
      if (!stored()) apply(ev.matches ? 'dark' : 'light');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
    else if (mq.addListener) mq.addListener(onSystemChange);
  } catch (e) { /* older browsers: initial choice still applies */ }

  window.GHTheme = {
    get: function () { return current(); },
    set: function (mode) {
      if (mode !== 'dark' && mode !== 'light') return;
      try { window.localStorage.setItem(KEY, mode); } catch (e) { /* apply anyway */ }
      apply(mode);
    },
    toggle: function () {
      window.GHTheme.set(current() === 'dark' ? 'light' : 'dark');
    }
  };

  function injectButton() {
    try {
      if (document.querySelector('.gh-theme-toggle')) return;
      var host = document.querySelector('.topbar .reader-tools') || document.querySelector('.topbar');
      if (!host) return; /* pages without a topbar (privacy, swipe-test) simply get no button */
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-button gh-theme-toggle';
      btn.setAttribute('aria-label', 'Toggle dark mode');
      btn.addEventListener('click', function () { window.GHTheme.toggle(); });
      host.appendChild(btn);
      paintButton();
    } catch (e) { /* the toggle is a nicety, never a dependency */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectButton);
  } else {
    injectButton();
  }
})();

/* Voice search loader (owner request 2026-11-24): theme.js is the one
   script loaded on every page, so it pulls in voice-search.js, which
   adds a microphone button beside each Scripture search box where the
   browser supports speech recognition. Kept separate so the feature
   stays one removable module. */
(function () {
  'use strict';
  function load() {
    try {
      var s = document.createElement('script');
      s.src = 'voice-search.js?v=2';
      s.defer = true;
      document.head.appendChild(s);
    } catch (e) { /* voice search is an enhancement, never a dependency */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();
})();
