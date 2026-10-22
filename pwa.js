/* PWA support — registers the service worker (offline shell) and offers
   an Install button when the browser allows it. The app itself works
   fully without installing; installing simply adds a home-screen icon
   and offline reading. */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {});
    });
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    showInstall();
  });

  function dismissed() {
    try { return localStorage.getItem('gh-pwa-dismissed') === '1'; } catch (e) { return false; }
  }

  function showInstall() {
    if (!deferred || dismissed()) return;
    if (document.getElementById('pwaInstall')) return;
    var bar = document.createElement('div');
    bar.id = 'pwaInstall';
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:60;background:#10243f;color:#fff;border-radius:12px;padding:12px 14px;display:flex;gap:10px;align-items:center;box-shadow:0 6px 22px rgba(0,0,0,.35);font-size:.92rem';
    var txt = document.createElement('span');
    txt.style.cssText = 'flex:1 1 auto';
    txt.textContent = '📲 Add the Gospel Harmony to your home screen — read and listen offline.';
    var go = document.createElement('button');
    go.type = 'button';
    go.textContent = 'Install';
    go.style.cssText = 'background:#d5aa57;color:#10243f;border:none;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer';
    go.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; bar.remove(); });
    });
    var no = document.createElement('button');
    no.type = 'button';
    no.textContent = '✕';
    no.setAttribute('aria-label', 'Dismiss install offer');
    no.style.cssText = 'background:transparent;color:#b9c8d7;border:none;font-size:1rem;cursor:pointer;padding:4px';
    no.addEventListener('click', function () {
      try { localStorage.setItem('gh-pwa-dismissed', '1'); } catch (e) {}
      bar.remove();
    });
    bar.appendChild(txt);
    bar.appendChild(go);
    bar.appendChild(no);
    document.body.appendChild(bar);
  }

  window.addEventListener('appinstalled', function () {
    var bar = document.getElementById('pwaInstall');
    if (bar) bar.remove();
  });
})();
