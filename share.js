/* Share bars for the Gospel Harmony.
   On the reader, the bar shares the CURRENT event through its pretty
   /e/N.html link (which carries the event's own rich preview and redirects
   into the reader). On the other pages it shares the page itself.
   Buttons: native Share (where available), WhatsApp, Facebook, X, Copy. */
(function () {
  'use strict';

  var CSS = [
    '.share-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0 16px;clear:both}',
    '.share-bar .share-label{font-size:.85rem;font-weight:700;color:#7a5c14;letter-spacing:.05em;text-transform:uppercase;margin-right:2px}',
    '.share-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;border:1px solid #b9c8d7;background:#fff;color:#10243f;font-weight:700;font-size:.88rem;cursor:pointer;text-decoration:none}',
    '.share-btn:hover{background:#eef2f7}',
    '.share-btn.wa{border-color:#1faa55;color:#0d6e36}',
    '.share-btn.fb{border-color:#1877f2;color:#0d4fa8}',
    '.share-btn.x{border-color:#10243f}',
    '.share-note{font-size:.85rem;color:#0d6e36;font-weight:700}'
  ].join('\n');

  function addStyle() {
    if (document.getElementById('shareBarStyle')) return;
    var s = document.createElement('style');
    s.id = 'shareBarStyle';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function currentEventNumber() {
    var el = document.getElementById('eventNumber');
    if (!el) return null;
    var m = /Event\s+(\S+)\s+of/i.exec(el.textContent || '');
    return m ? m[1] : null;
  }

  function eventTitle() {
    var el = document.getElementById('eventTitle') || document.getElementById('chapterTitle');
    var t = el ? (el.textContent || '').trim() : '';
    return t || 'The Life of Christ';
  }

  function copyText(text, noteEl) {
    function done() { if (noteEl) { noteEl.textContent = 'Link copied ✓'; setTimeout(function () { noteEl.textContent = ''; }, 2200); } }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { legacy(); });
    } else legacy();
    function legacy() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      ta.remove();
    }
  }

  function buildBar(getShare) {
    var bar = document.createElement('div');
    bar.className = 'share-bar';
    var note = document.createElement('span');
    note.className = 'share-note';
    note.setAttribute('role', 'status');

    function mk(label, cls, href) {
      var a = document.createElement('a');
      a.className = 'share-btn ' + cls;
      a.textContent = label;
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      return a;
    }

    var shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'share-btn';
    shareBtn.textContent = '📤 Share';
    shareBtn.addEventListener('click', function () {
      var s = getShare();
      if (navigator.share) {
        navigator.share({ title: s.title, text: s.text, url: s.url }).catch(function () {});
      } else {
        copyText(s.url, note);
      }
    });
    bar.appendChild(shareBtn);

    var wa = mk('WhatsApp', 'wa', '#');
    wa.addEventListener('click', function (e) {
      e.preventDefault();
      var s = getShare();
      window.open('https://wa.me/?text=' + encodeURIComponent(s.text + ' ' + s.url), '_blank', 'noopener');
    });
    bar.appendChild(wa);

    var fb = mk('Facebook', 'fb', '#');
    fb.addEventListener('click', function (e) {
      e.preventDefault();
      var s = getShare();
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(s.url), '_blank', 'noopener');
    });
    bar.appendChild(fb);

    var x = mk('X', 'x', '#');
    x.addEventListener('click', function (e) {
      e.preventDefault();
      var s = getShare();
      window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(s.text) + '&url=' + encodeURIComponent(s.url), '_blank', 'noopener');
    });
    bar.appendChild(x);

    var cp = document.createElement('button');
    cp.type = 'button';
    cp.className = 'share-btn';
    cp.textContent = '🔗 Copy link';
    cp.addEventListener('click', function () { copyText(getShare().url, note); });
    bar.appendChild(cp);

    bar.appendChild(note);
    return bar;
  }

  /* ---------- reader (event) mode ---------- */
  function renderEventBar() {
    var num = currentEventNumber();
    var old = document.getElementById('shareBar');
    if (!num) { if (old) old.remove(); return; }
    var anchor = document.getElementById('verseCardBar') ||
      document.getElementById('watchBanner') ||
      document.querySelector('.swipe-hint') ||
      document.getElementById('eventSummary');
    if (!anchor || !anchor.parentNode) return;
    var bar = old;
    if (!bar) {
      bar = buildBar(function () {
        var n = currentEventNumber();
        return {
          title: 'Event ' + n + ' — ' + eventTitle(),
          text: '📖 Event ' + n + ' — ' + eventTitle() + ' · Comparative Gospel Harmony (KJV)',
          url: location.origin + '/e/' + n + '.html'
        };
      });
      bar.id = 'shareBar';
      var label = document.createElement('span');
      label.className = 'share-label';
      label.textContent = 'Share this event';
      bar.insertBefore(label, bar.firstChild);
    }
    if (bar.previousSibling !== anchor) anchor.parentNode.insertBefore(bar, anchor.nextSibling);
  }

  /* ---------- page mode (films, journey, listen, advent, search) ---------- */
  function renderPageBar() {
    if (document.getElementById('shareBar')) return;
    var host = document.querySelector('main') || document.querySelector('.reader-inner');
    if (!host) return;
    var bar = buildBar(function () {
      return {
        title: document.title,
        text: document.title + ' · Comparative Gospel Harmony',
        url: location.origin + location.pathname
      };
    });
    bar.id = 'shareBar';
    var label = document.createElement('span');
    label.className = 'share-label';
    label.textContent = 'Share this page';
    bar.insertBefore(label, bar.firstChild);
    host.insertBefore(bar, host.firstChild);
  }

  function init() {
    addStyle();
    if (document.getElementById('eventNumber')) {
      renderEventBar();
      var target = document.getElementById('eventNumber');
      if (window.MutationObserver) {
        var obs = new MutationObserver(function () { setTimeout(renderEventBar, 30); });
        obs.observe(target, { childList: true, characterData: true, subtree: true });
      }
      window.addEventListener('hashchange', function () { setTimeout(renderEventBar, 60); });
    } else {
      renderPageBar();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
